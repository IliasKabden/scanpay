require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./db');
const { parseReceipt, matchAndDecide } = require('./claude');
const { getBalance, getTransactions } = require('./solana');
const { notifyReceiptProcessed, notifyDataSold, notifyDailyReminder } = require('./notify');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ==========================================
// ЭНДПОИНТЫ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ (Telegram)
// ==========================================

// Регистрация пользователя
app.post('/api/user/register', (req, res) => {
  const { telegram_id, wallet_address } = req.body;

  if (!telegram_id || !wallet_address) {
    return res.status(400).json({ error: 'telegram_id и wallet_address обязательны' });
  }

  try {
    db.prepare(`
      INSERT OR REPLACE INTO users (telegram_id, wallet_address)
      VALUES (?, ?)
    `).run(telegram_id, wallet_address);

    res.json({ success: true, message: 'Пользователь зарегистрирован' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Сканирование чека — главный эндпоинт
app.post('/api/receipt/scan', async (req, res) => {
  const { image_base64, telegram_id } = req.body;

  if (!image_base64 || !telegram_id) {
    return res.status(400).json({ error: 'image_base64 и telegram_id обязательны' });
  }

  try {
    // 1. AI читает чек
    const parsed = await parseReceipt(image_base64);

    if (parsed.error) {
      return res.status(400).json({ error: 'Не удалось прочитать чек', details: parsed });
    }

    // 2. Создаём хеш данных
    const dataHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(parsed) + telegram_id + Date.now())
      .digest('hex');

    // 2.5. Auto-moderation checks
    let receiptStatus = 'approved';
    let flagReasons = [];
    // Duplicate hash check (same store+amount+date for this user)
    const dupCheck = db.prepare("SELECT id FROM receipts WHERE telegram_id=? AND store_name=? AND total_amount=? AND date=?").get(telegram_id, parsed.store_name, parsed.total_amount, parsed.date);
    if (dupCheck) flagReasons.push('duplicate');
    // Price anomaly
    if (parsed.total_amount > 500000 || parsed.total_amount < 50) flagReasons.push('price_anomaly');
    // Frequency check (>10 receipts today)
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = db.prepare("SELECT COUNT(*) as c FROM receipts WHERE telegram_id=? AND created_at >= ?").get(telegram_id, today).c;
    if (todayCount >= 10) flagReasons.push('frequency_limit');
    // Future date check
    if (parsed.date && parsed.date > new Date(Date.now() + 86400000).toISOString().slice(0, 10)) flagReasons.push('future_date');

    if (flagReasons.length > 0) receiptStatus = 'pending';

    // 3. Сохраняем в базу
    const result = db.prepare(`
      INSERT INTO receipts (telegram_id, store_name, total_amount, category, items, date, data_hash, price_lamports, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      telegram_id,
      parsed.store_name,
      parsed.total_amount,
      parsed.category,
      JSON.stringify(parsed.items || []),
      parsed.date,
      dataHash,
      5000000, // 0.005 SOL базовая цена
      receiptStatus
    );

    // If flagged, add to moderation queue
    if (flagReasons.length > 0) {
      db.prepare("INSERT INTO moderation_queue (entity_type, entity_id, reason) VALUES ('receipt', ?, ?)").run(result.lastInsertRowid, flagReasons.join(','));
      db.prepare("INSERT INTO audit_log (action, entity_type, entity_id, actor, details) VALUES ('receipt.flagged', 'receipt', ?, 'system', ?)").run(result.lastInsertRowid, JSON.stringify({ reasons: flagReasons }));
    }

    // 4. Для демо — mock transaction
    const mockTxId = 'demo_' + dataHash.slice(0, 20);

    db.prepare('UPDATE receipts SET solana_tx = ? WHERE id = ?')
      .run(mockTxId, result.lastInsertRowid);

    res.json({
      success: true,
      receipt_id: result.lastInsertRowid,
      parsed_data: parsed,
      data_hash: dataHash,
      solana_tx: mockTxId,
      explorer_url: `https://explorer.solana.com/tx/${mockTxId}?cluster=devnet`,
      price_tenge: Math.round(5000000 * 0.0000001 * 450),
      message: 'Данные сохранены и готовы к продаже'
    });

    // Send Telegram push notification
    const earnedTenge = Math.round(5000000 * 0.0000001 * 450);
    notifyReceiptProcessed(telegram_id, parsed.store_name || 'Магазин', parsed.total_amount || 0, earnedTenge).catch(() => {});

  } catch (e) {
    console.error('Receipt scan error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Профиль пользователя
app.get('/api/user/profile/:telegram_id', (req, res) => {
  const { telegram_id } = req.params;

  const user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegram_id);
  const receipts = db.prepare('SELECT * FROM receipts WHERE telegram_id = ? ORDER BY created_at DESC').all(telegram_id);

  let totalEarned = 0;
  const receiptIds = receipts.map(r => r.id);
  if (receiptIds.length > 0) {
    const purchases = db.prepare('SELECT * FROM purchases').all();
    for (const p of purchases) {
      try {
        const ids = JSON.parse(p.receipt_ids);
        const matched = ids.filter(id => receiptIds.includes(id));
        if (matched.length > 0 && ids.length > 0) {
          totalEarned += Math.round(p.total_paid_lamports * matched.length / ids.length);
        }
      } catch {}
    }
  }

  res.json({
    user,
    receipts_count: receipts.length,
    receipts,
    total_earned_lamports: totalEarned,
    total_earned_tenge: Math.round(totalEarned * 0.0000001 * 450)
  });
});

// История продаж пользователя
app.get('/api/user/sales/:telegram_id', (req, res) => {
  const { telegram_id } = req.params;
  const receipts = db.prepare(`
    SELECT * FROM receipts WHERE telegram_id = ? ORDER BY created_at DESC
  `).all(telegram_id);

  res.json({ sales: receipts });
});

// ==========================================
// ЭНДПОИНТЫ ДЛЯ КОМПАНИЙ
// ==========================================

// Статистика доступных данных
app.get('/api/company/stats', (req, res) => {
  const stats = db.prepare(`
    SELECT
      category,
      COUNT(*) as count,
      ROUND(AVG(total_amount), 0) as avg_amount
    FROM receipts
    WHERE solana_tx IS NOT NULL
    GROUP BY category
  `).all();

  const total = db.prepare('SELECT COUNT(*) as count FROM receipts').get();

  res.json({
    total_profiles: total.count,
    by_category: stats,
    available_cities: ['Алматы', 'Астана', 'Шымкент'],
  });
});

// AI матчинг — главный эндпоинт для компаний
app.post('/api/company/match', async (req, res) => {
  const { company_name, category, min_amount, city, budget_lamports } = req.body;

  if (!company_name || !category) {
    return res.status(400).json({ error: 'company_name и category обязательны' });
  }

  try {
    // 1. Получаем анонимные профили
    const profiles = db.prepare(`
      SELECT id, category, total_amount, date,
             substr(data_hash, 1, 8) as profile_id
      FROM receipts
      WHERE category = ?
        AND (? IS NULL OR total_amount >= ?)
        AND solana_tx IS NOT NULL
      LIMIT 100
    `).all(category, min_amount || null, min_amount || 0);

    if (profiles.length === 0) {
      return res.json({
        matched: 0,
        message: 'Нет подходящих профилей в данной категории'
      });
    }

    // 2. AI автономно принимает решение
    const aiDecision = await matchAndDecide(
      { company_name, category, min_amount, city, budget_lamports },
      profiles
    );

    if (aiDecision.error) {
      return res.status(500).json({ error: 'AI не смог принять решение' });
    }

    res.json({
      company_name,
      ai_decision: aiDecision,
      total_cost_lamports: (aiDecision.matched_ids?.length || 0) * (aiDecision.price_per_profile_lamports || 0),
      total_cost_tenge: Math.round(
        (aiDecision.matched_ids?.length || 0) * (aiDecision.price_per_profile_lamports || 0) * 0.0000001 * 450
      ),
      message: 'AI принял решение. Подтвердите оплату для получения данных.'
    });

  } catch (e) {
    console.error('Match error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Подтверждение оплаты
app.post('/api/company/purchase', async (req, res) => {
  const { company_name, matched_ids, price_per_profile_lamports, ai_reasoning, ai_confidence } = req.body;

  if (!company_name || !matched_ids || !price_per_profile_lamports) {
    return res.status(400).json({ error: 'Не все поля заполнены' });
  }

  try {
    const totalLamports = matched_ids.length * price_per_profile_lamports;

    // Для демо — mock transaction
    const mockTxId = 'purchase_' + Date.now().toString(36);

    db.prepare(`
      INSERT INTO purchases (company_name, receipt_ids, total_paid_lamports, ai_reasoning, ai_confidence, solana_tx)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      company_name,
      JSON.stringify(matched_ids),
      totalLamports,
      ai_reasoning || '',
      ai_confidence || 0,
      mockTxId
    );

    // Получаем данные для компании
    const placeholders = matched_ids.map(() => '?').join(',');
    const purchasedData = db.prepare(`
      SELECT store_name, total_amount, category, items, date
      FROM receipts
      WHERE id IN (${placeholders})
    `).all(...matched_ids);

    res.json({
      success: true,
      transaction_id: mockTxId,
      explorer_url: `https://explorer.solana.com/tx/${mockTxId}?cluster=devnet`,
      purchased_profiles: purchasedData.length,
      data: purchasedData,
      message: `Смарт-контракт автоматически выплатил ${purchasedData.length} пользователям`
    });

  } catch (e) {
    console.error('Purchase error:', e);
    res.status(500).json({ error: e.message });
  }
});

// История покупок компании
app.get('/api/company/history/:company_name', (req, res) => {
  const { company_name } = req.params;
  const history = db.prepare(`
    SELECT * FROM purchases
    WHERE company_name = ?
    ORDER BY created_at DESC
  `).all(company_name);

  res.json({ history });
});

// Wallet balance endpoint
app.get('/api/wallet/balance/:address', async (req, res) => {
  try {
    const balance = await getBalance(req.params.address);
    res.json({ balance_lamports: balance, balance_sol: balance / 1e9 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==========================================
// БИЗНЕС-ЛОГИКА: КОМПАНИЯ → ТОВАРЫ → ТРЕКИНГ
// ==========================================

// Регистрация компании
app.post('/api/company/register', (req, res) => {
  const { name, industry } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  try {
    const r = db.prepare('INSERT OR IGNORE INTO companies (name, industry) VALUES (?, ?)').run(name, industry || '');
    const company = db.prepare('SELECT * FROM companies WHERE name = ?').get(name);
    res.json({ success: true, company });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Добавить товар компании
app.post('/api/company/products', (req, res) => {
  const { company_name, product_name, brand, category, keywords, barcode, rrp } = req.body;
  if (!company_name || !product_name) return res.status(400).json({ error: 'company_name and product_name required' });
  try {
    let company = db.prepare('SELECT * FROM companies WHERE name = ?').get(company_name);
    if (!company) {
      db.prepare('INSERT INTO companies (name) VALUES (?)').run(company_name);
      company = db.prepare('SELECT * FROM companies WHERE name = ?').get(company_name);
    }
    const r = db.prepare('INSERT INTO company_products (company_id, product_name, brand, category, keywords, barcode, rrp) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      company.id, product_name, brand || '', category || '', JSON.stringify(keywords || [product_name.toLowerCase()]), barcode || '', rrp || 0
    );
    res.json({ success: true, product_id: r.lastInsertRowid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update product
app.put('/api/company/products/:id', (req, res) => {
  const { product_name, brand, category, keywords, barcode, rrp } = req.body;
  try {
    db.prepare('UPDATE company_products SET product_name=?, brand=?, category=?, keywords=?, barcode=?, rrp=? WHERE id=?').run(
      product_name || '', brand || '', category || '', JSON.stringify(keywords || []), barcode || '', rrp || 0, req.params.id
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Получить товары компании
app.get('/api/company/products/:company_name', (req, res) => {
  const company = db.prepare('SELECT * FROM companies WHERE name = ?').get(req.params.company_name);
  if (!company) return res.json({ products: [] });
  const products = db.prepare('SELECT * FROM company_products WHERE company_id = ? ORDER BY created_at DESC').all(company.id);
  res.json({ company, products });
});

// Удалить товар
app.delete('/api/company/products/:id', (req, res) => {
  db.prepare('DELETE FROM company_products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Трекинг — найти товары компании в чеках (автоматический матчинг)
app.post('/api/company/track', (req, res) => {
  const { company_name } = req.body;
  if (!company_name) return res.status(400).json({ error: 'company_name required' });

  const company = db.prepare('SELECT * FROM companies WHERE name = ?').get(company_name);
  if (!company) return res.json({ detections: 0 });

  const products = db.prepare('SELECT * FROM company_products WHERE company_id = ?').all(company.id);
  if (products.length === 0) return res.json({ detections: 0, message: 'No products registered' });

  const receipts = db.prepare('SELECT * FROM receipts WHERE items IS NOT NULL').all();
  let newDetections = 0;

  for (const receipt of receipts) {
    let items;
    try { items = JSON.parse(receipt.items); } catch { continue; }
    if (!Array.isArray(items)) continue;

    for (const product of products) {
      let kws;
      try { kws = JSON.parse(product.keywords); } catch { kws = [product.product_name.toLowerCase()]; }

      for (const item of items) {
        const itemName = (item.name || '').toLowerCase();
        const matched = kws.some(kw => itemName.includes(kw.toLowerCase()));
        if (matched) {
          const exists = db.prepare('SELECT id FROM product_detections WHERE product_id = ? AND receipt_id = ?').get(product.id, receipt.id);
          if (!exists) {
            db.prepare('INSERT INTO product_detections (product_id, receipt_id, store_name, price, quantity) VALUES (?, ?, ?, ?, ?)').run(
              product.id, receipt.id, receipt.store_name || 'Unknown', item.price || 0, item.quantity || 1
            );
            newDetections++;
          }
        }
      }
    }
  }

  res.json({ success: true, new_detections: newDetections, total_products: products.length });
});

// Дашборд компании — полная аналитика
app.get('/api/company/dashboard/:company_name', (req, res) => {
  const company = db.prepare('SELECT * FROM companies WHERE name = ?').get(req.params.company_name);
  if (!company) return res.json({ error: 'Company not found' });

  const products = db.prepare('SELECT * FROM company_products WHERE company_id = ?').all(company.id);
  const productIds = products.map(p => p.id);

  if (productIds.length === 0) {
    return res.json({ company, products: [], detections: [], total_detections: 0, stores: [], by_product: [] });
  }

  const ph = productIds.map(() => '?').join(',');

  const detections = db.prepare(`
    SELECT d.*, p.product_name, p.brand, p.category
    FROM product_detections d
    JOIN company_products p ON d.product_id = p.id
    WHERE d.product_id IN (${ph})
    ORDER BY d.detected_at DESC
    LIMIT 50
  `).all(...productIds);

  const byProduct = db.prepare(`
    SELECT p.product_name, p.brand,
      COUNT(d.id) as total_sales,
      SUM(d.price * d.quantity) as total_revenue,
      AVG(d.price) as avg_price,
      COUNT(DISTINCT d.store_name) as store_count
    FROM company_products p
    LEFT JOIN product_detections d ON d.product_id = p.id
    WHERE p.company_id = ?
    GROUP BY p.id
  `).all(company.id);

  const byStore = db.prepare(`
    SELECT d.store_name, COUNT(d.id) as sales, SUM(d.price * d.quantity) as revenue
    FROM product_detections d
    WHERE d.product_id IN (${ph})
    GROUP BY d.store_name
    ORDER BY sales DESC
  `).all(...productIds);

  const byCity = db.prepare(`
    SELECT d.city, COUNT(d.id) as sales
    FROM product_detections d
    WHERE d.product_id IN (${ph})
    GROUP BY d.city
    ORDER BY sales DESC
  `).all(...productIds);

  const totalDetections = db.prepare(`SELECT COUNT(*) as c FROM product_detections WHERE product_id IN (${ph})`).get(...productIds);
  const totalRevenue = db.prepare(`SELECT SUM(price * quantity) as r FROM product_detections WHERE product_id IN (${ph})`).get(...productIds);

  res.json({
    company,
    products,
    recent_detections: detections,
    total_detections: totalDetections?.c || 0,
    total_revenue: totalRevenue?.r || 0,
    by_product: byProduct,
    by_store: byStore,
    by_city: byCity
  });
});

// Seed demo data
app.post('/api/demo/seed', (req, res) => {
  // Create demo company
  db.prepare('INSERT OR IGNORE INTO companies (name, industry) VALUES (?, ?)').run('Coca-Cola Kazakhstan', 'FMCG');
  const company = db.prepare('SELECT * FROM companies WHERE name = ?').get('Coca-Cola Kazakhstan');

  // Add products
  const prods = [
    { name: 'Coca-Cola Zero 0.5L', brand: 'Coca-Cola', cat: 'drinks', kw: ['coca-cola zero','кока-кола зеро','cola zero'] },
    { name: 'Coca-Cola Original 1L', brand: 'Coca-Cola', cat: 'drinks', kw: ['coca-cola','кока-кола','cola 1l'] },
    { name: 'Fanta Orange 0.5L', brand: 'Fanta', cat: 'drinks', kw: ['fanta','фанта'] },
    { name: 'Sprite 0.5L', brand: 'Sprite', cat: 'drinks', kw: ['sprite','спрайт'] },
    { name: 'BonAqua 1L', brand: 'BonAqua', cat: 'water', kw: ['bonaqua','бонаква','bon aqua'] },
  ];

  for (const p of prods) {
    const exists = db.prepare('SELECT id FROM company_products WHERE company_id = ? AND product_name = ?').get(company.id, p.name);
    if (!exists) {
      db.prepare('INSERT INTO company_products (company_id, product_name, brand, category, keywords) VALUES (?, ?, ?, ?, ?)').run(
        company.id, p.name, p.brand, p.cat, JSON.stringify(p.kw)
      );
    }
  }

  // Seed fake receipts with these products
  const stores = ['Magnum', 'Small', 'Sulpak', 'Metro', 'Galmart', 'Anvar'];
  const cities = ['Almaty', 'Astana', 'Shymkent'];

  const allProds = db.prepare('SELECT * FROM company_products WHERE company_id = ?').all(company.id);

  for (let i = 0; i < 35; i++) {
    const store = stores[Math.floor(Math.random() * stores.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const prod = allProds[Math.floor(Math.random() * allProds.length)];
    const price = Math.floor(Math.random() * 800) + 200;
    const qty = Math.floor(Math.random() * 3) + 1;
    const daysAgo = Math.floor(Math.random() * 14);
    const date = new Date(Date.now() - daysAgo * 86400000);

    // Create receipt
    const items = JSON.stringify([{ name: prod.product_name, price, quantity: qty }]);
    const hash = crypto.createHash('sha256').update(`${store}${prod.product_name}${i}${Date.now()}`).digest('hex');
    const rr = db.prepare('INSERT INTO receipts (telegram_id, store_name, total_amount, category, items, date, data_hash, solana_tx, price_lamports) VALUES (?,?,?,?,?,?,?,?,?)').run(
      'demo_user_' + (Math.floor(Math.random() * 20) + 1),
      store, price * qty, prod.category, items, date.toISOString().slice(0, 10), hash, 'demo_tx_' + hash.slice(0, 16), 5000000
    );

    // Create detection
    db.prepare('INSERT INTO product_detections (product_id, receipt_id, store_name, city, price, quantity, detected_at) VALUES (?,?,?,?,?,?,?)').run(
      prod.id, rr.lastInsertRowid, store, city, price, qty, date.toISOString()
    );
  }

  res.json({ success: true, message: 'Demo data seeded: Coca-Cola Kazakhstan + 5 products + 35 detections' });
});

// MASSIVE seed for demo/presentation
app.post('/api/demo/seed-massive', (req, res) => {
  const ages = ['18-24','25-34','35-44','45-54','55+'];
  const genders = ['male','female'];
  const kazCities = ['Almaty','Astana','Shymkent','Karaganda','Aktobe','Pavlodar','Atyrau'];
  const firstNames = ['Айдар','Нурлан','Асхат','Диас','Серик','Бауыржан','Ерлан','Жанна','Айгуль','Мадина','Алия','Дарига','Камила','Динара','Самат','Руслан','Тимур','Марат','Арман','Данияр','Гульнара','Айжан','Жансая','Меруерт','Ботагоз'];
  const lastNames = ['Касымов','Нурпеисов','Абдуллаев','Сатыбалдиев','Жумабаев','Есенов','Токаев','Назарбаева','Кунаева','Сулейменов','Аубакиров','Мусин','Байтурсынов','Ахметов','Калиев'];
  const stores = ['Magnum','Small','Sulpak','Metro','Galmart','Anvar'];
  const cities = ['Almaty','Astana','Shymkent'];
  const categories = ['drinks','food','snacks','dairy','household','water'];
  const items = {
    drinks: [['Coca-Cola 0.5L',450],['Fanta 0.5L',420],['Sprite 0.5L',420],['Pepsi 1L',550],['Lipton Ice Tea',380],['Red Bull',890],['Добрый сок 1L',680]],
    food: [['Хлеб Бородинский',250],['Колбаса Алматинская',1890],['Рис Жасмин 1кг',790],['Масло подсолнечное',680],['Макароны Barilla',590]],
    snacks: [['Lays Чипсы',480],['Snickers',320],['Twix',280],['Орешки 200г',590],['Сухарики',180]],
    dairy: [['Молоко Lactel 1L',580],['Кефир 1%',390],['Сыр Президент',1290],['Йогурт Danone',280],['Сметана 15%',420]],
    household: [['Fairy 450мл',580],['Порошок Ariel 3кг',2890],['Туалетная бумага',490],['Мыло Dove',380]],
    water: [['BonAqua 1L',250],['Tassay 1.5L',320],['Святой источник',180],['Evian 0.5L',590]],
  };

  // Create 200 users
  for (let i = 1; i <= 200; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const tid = 'user_' + (1000000 + i);
    const exists = db.prepare('SELECT id FROM users WHERE telegram_id=?').get(tid);
    if (!exists) {
      db.prepare('INSERT INTO users (telegram_id, wallet_address, phone, age_group, gender, first_name, last_name, username, city, lang, onboarded) VALUES (?,?,?,?,?,?,?,?,?,?,1)').run(
        tid, 'Sol' + crypto.randomBytes(20).toString('hex').slice(0,40),
        '+7 7' + String(Math.floor(Math.random()*9000000000)+1000000000).slice(0,9),
        ages[Math.floor(Math.random()*ages.length)],
        genders[Math.floor(Math.random()*genders.length)],
        fn, ln, fn.toLowerCase() + '_' + (1000+i),
        kazCities[Math.floor(Math.random()*kazCities.length)], 'ru'
      );
    }
  }

  // Ensure Coca-Cola products exist
  db.prepare('INSERT OR IGNORE INTO companies (name, industry) VALUES (?, ?)').run('Coca-Cola Kazakhstan', 'FMCG');
  const company = db.prepare('SELECT * FROM companies WHERE name = ?').get('Coca-Cola Kazakhstan');
  const prods = [
    { name:'Coca-Cola Zero 0.5L', brand:'Coca-Cola', cat:'drinks', kw:['coca-cola zero','кока-кола зеро','cola zero'], rrp:450 },
    { name:'Coca-Cola Original 1L', brand:'Coca-Cola', cat:'drinks', kw:['coca-cola','кока-кола','cola 1l'], rrp:550 },
    { name:'Fanta Orange 0.5L', brand:'Fanta', cat:'drinks', kw:['fanta','фанта'], rrp:420 },
    { name:'Sprite 0.5L', brand:'Sprite', cat:'drinks', kw:['sprite','спрайт'], rrp:420 },
    { name:'BonAqua 1L', brand:'BonAqua', cat:'water', kw:['bonaqua','бонаква','bon aqua'], rrp:250 },
  ];
  for (const p of prods) {
    const ex = db.prepare('SELECT id FROM company_products WHERE company_id=? AND product_name=?').get(company.id, p.name);
    if (!ex) db.prepare('INSERT INTO company_products (company_id, product_name, brand, category, keywords, rrp) VALUES (?,?,?,?,?,?)').run(company.id, p.name, p.brand, p.cat, JSON.stringify(p.kw), p.rrp);
  }
  const allProds = db.prepare('SELECT * FROM company_products WHERE company_id=?').all(company.id);

  // Create 800 receipts with detections
  const allUsers = db.prepare('SELECT telegram_id, city FROM users').all();
  for (let i = 0; i < 800; i++) {
    const user = allUsers[Math.floor(Math.random()*allUsers.length)];
    const store = stores[Math.floor(Math.random()*stores.length)];
    const city = cities[Math.floor(Math.random()*cities.length)];
    const cat = categories[Math.floor(Math.random()*categories.length)];
    const catItems = items[cat];
    const numItems = Math.floor(Math.random()*4)+1;
    const receiptItems = [];
    let total = 0;
    for (let j = 0; j < numItems; j++) {
      const item = catItems[Math.floor(Math.random()*catItems.length)];
      const qty = Math.floor(Math.random()*3)+1;
      const price = item[1] + Math.floor(Math.random()*100)-50;
      receiptItems.push({ name: item[0], price, quantity: qty });
      total += price * qty;
    }
    const daysAgo = Math.floor(Math.random()*30);
    const date = new Date(Date.now() - daysAgo*86400000);
    const hash = crypto.createHash('sha256').update(`${store}${i}${Date.now()}${Math.random()}`).digest('hex');

    const rr = db.prepare('INSERT INTO receipts (telegram_id, store_name, total_amount, category, items, date, data_hash, solana_tx, price_lamports, status) VALUES (?,?,?,?,?,?,?,?,?,?)').run(
      user.telegram_id, store, total, cat, JSON.stringify(receiptItems), date.toISOString().slice(0,10), hash, 'tx_' + hash.slice(0,20), 5000000, 'approved'
    );

    // Detect Coca-Cola products in receipt
    for (const item of receiptItems) {
      for (const prod of allProds) {
        const kws = JSON.parse(prod.keywords);
        const itemLower = item.name.toLowerCase();
        if (kws.some(k => itemLower.includes(k.toLowerCase())) || itemLower.includes(prod.product_name.toLowerCase().split(' ')[0])) {
          db.prepare('INSERT INTO product_detections (product_id, receipt_id, store_name, city, price, quantity, detected_at) VALUES (?,?,?,?,?,?,?)').run(
            prod.id, rr.lastInsertRowid, store, city, item.price, item.quantity, date.toISOString()
          );
        }
      }
    }
  }

  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const receiptCount = db.prepare('SELECT COUNT(*) as c FROM receipts').get().c;
  const detectionCount = db.prepare('SELECT COUNT(*) as c FROM product_detections').get().c;
  res.json({ success: true, users: userCount, receipts: receiptCount, detections: detectionCount });
});

// Price deviation analysis
app.get('/api/company/price-deviation/:company_name', (req, res) => {
  const company = db.prepare('SELECT * FROM companies WHERE name = ?').get(req.params.company_name);
  if (!company) return res.json({ deviations: [] });

  const products = db.prepare('SELECT * FROM company_products WHERE company_id = ?').all(company.id);
  const productIds = products.map(p => p.id);
  if (!productIds.length) return res.json({ deviations: [] });

  const ph = productIds.map(() => '?').join(',');

  // Get avg price per product per store
  const data = db.prepare(`
    SELECT d.store_name, d.city, p.product_name, p.rrp,
      AVG(d.price) as avg_price,
      COUNT(d.id) as sales,
      ROUND(((AVG(d.price) - p.rrp) / CASE WHEN p.rrp > 0 THEN p.rrp ELSE 1 END) * 100) as deviation_pct
    FROM product_detections d
    JOIN company_products p ON d.product_id = p.id
    WHERE d.product_id IN (${ph}) AND p.rrp > 0
    GROUP BY d.store_name, d.city, p.id
    ORDER BY deviation_pct ASC
  `).all(...productIds);

  const alerts = data.filter(d => Math.abs(d.deviation_pct) > 10);

  res.json({
    all: data,
    alerts,
    total_violations: alerts.length,
    worst_store: alerts.length ? alerts[0].store_name : null
  });
});

// Full BI analytics endpoint
app.get('/api/company/bi/:company_name', (req, res) => {
  const company = db.prepare('SELECT * FROM companies WHERE name = ?').get(req.params.company_name);
  if (!company) return res.json({ error: 'not found' });

  // Filters from query params
  const { city, store, product, from, to } = req.query;

  const products = db.prepare('SELECT * FROM company_products WHERE company_id = ?').all(company.id);
  const pids = product ? products.filter(p => p.product_name === product).map(p => p.id) : products.map(p => p.id);
  if (!pids.length) return res.json({ products: [], stores: [], cities: [], cross: [], filters: { cities: [], stores: [], products: products.map(p => p.product_name) } });

  // Build WHERE clause for filters
  let where = `d.product_id IN (${pids.map(() => '?').join(',')})`
  const params = [...pids]
  if (city) { where += ' AND d.city = ?'; params.push(city) }
  if (store) { where += ' AND d.store_name = ?'; params.push(store) }
  if (from) { where += ' AND d.detected_at >= ?'; params.push(from) }
  if (to) { where += ' AND d.detected_at <= ?'; params.push(to) }

  // Available filter values
  const allCities = db.prepare(`SELECT DISTINCT city FROM product_detections WHERE product_id IN (${pids.map(() => '?').join(',')})`).all(...pids).map(r => r.city)
  const allStores = db.prepare(`SELECT DISTINCT store_name FROM product_detections WHERE product_id IN (${pids.map(() => '?').join(',')})`).all(...pids).map(r => r.store_name)

  // Product-level aggregation
  const byProduct = db.prepare(`
    SELECT p.id, p.product_name, p.brand, p.rrp,
      COUNT(d.id) as volume, SUM(d.price * d.quantity) as revenue,
      AVG(d.price) as avg_price, COUNT(DISTINCT d.store_name) as store_count,
      COUNT(DISTINCT d.city) as city_count, SUM(d.quantity) as units
    FROM company_products p LEFT JOIN product_detections d ON d.product_id = p.id
    WHERE ${where.replace('d.product_id','p.id').replace(/d\.product_id/g,'d.product_id')}
    GROUP BY p.id
  `).all(...params);

  // Store-level
  const byStore = db.prepare(`
    SELECT d.store_name, COUNT(d.id) as volume, SUM(d.price*d.quantity) as revenue,
      AVG(d.price) as avg_price, COUNT(DISTINCT d.product_id) as product_count, COUNT(DISTINCT d.city) as city_count
    FROM product_detections d WHERE ${where} GROUP BY d.store_name ORDER BY revenue DESC
  `).all(...params);

  // City-level
  const byCity = db.prepare(`
    SELECT d.city, COUNT(d.id) as volume, SUM(d.price*d.quantity) as revenue,
      AVG(d.price) as avg_price, COUNT(DISTINCT d.store_name) as store_count, COUNT(DISTINCT d.product_id) as product_count
    FROM product_detections d WHERE ${where} GROUP BY d.city ORDER BY revenue DESC
  `).all(...params);

  // Cross: product x store
  const productStore = db.prepare(`
    SELECT p.product_name, d.store_name, COUNT(d.id) as volume, SUM(d.price*d.quantity) as revenue, AVG(d.price) as avg_price, p.rrp
    FROM product_detections d JOIN company_products p ON d.product_id=p.id WHERE ${where} GROUP BY p.id, d.store_name
  `).all(...params);

  // Cross: product x city
  const productCity = db.prepare(`
    SELECT p.product_name, d.city, COUNT(d.id) as volume, SUM(d.price*d.quantity) as revenue, AVG(d.price) as avg_price, p.rrp
    FROM product_detections d JOIN company_products p ON d.product_id=p.id WHERE ${where} GROUP BY p.id, d.city
  `).all(...params);

  // Daily trend
  const daily = db.prepare(`
    SELECT date(d.detected_at) as day, COUNT(d.id) as volume, SUM(d.price*d.quantity) as revenue
    FROM product_detections d WHERE ${where} GROUP BY day ORDER BY day
  `).all(...params);

  // Totals
  const totals = db.prepare(`
    SELECT COUNT(d.id) as volume, SUM(d.price*d.quantity) as revenue, AVG(d.price) as avg_price, SUM(d.quantity) as units
    FROM product_detections d WHERE ${where}
  `).get(...params);

  res.json({
    totals: { ...totals, products: products.length, stores: byStore.length, cities: byCity.length },
    byProduct, byStore, byCity, productStore, productCity, daily,
    filters: { cities: allCities, stores: allStores, products: products.map(p => p.product_name) }
  });
});

// Check if user completed onboarding
app.get('/api/user/onboarded/:telegram_id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(req.params.telegram_id);
  res.json({ onboarded: user?.onboarded === 1, user: user || null });
});

// Complete onboarding
app.post('/api/user/onboard', (req, res) => {
  const { telegram_id, phone, age_group, gender, first_name, last_name, username, city, lang } = req.body;
  if (!telegram_id) return res.status(400).json({ error: 'telegram_id required' });

  const existing = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegram_id);
  if (existing) {
    db.prepare('UPDATE users SET phone=?, age_group=?, gender=?, first_name=?, last_name=?, username=?, city=?, lang=?, onboarded=1 WHERE telegram_id=?')
      .run(phone||'', age_group||'', gender||'', first_name||'', last_name||'', username||'', city||'', lang||'ru', telegram_id);
  } else {
    db.prepare('INSERT INTO users (telegram_id, phone, age_group, gender, first_name, last_name, username, city, lang, onboarded) VALUES (?,?,?,?,?,?,?,?,?,1)')
      .run(telegram_id, phone||'', age_group||'', gender||'', first_name||'', last_name||'', username||'', city||'', lang||'ru');
  }
  res.json({ success: true });
});

// Notify data sold (called after company purchase)
app.post('/api/notify/data-sold', async (req, res) => {
  const { telegram_ids, company_name, amount_per_user } = req.body;
  if (!telegram_ids || !company_name) return res.status(400).json({ error: 'missing params' });
  let sent = 0;
  for (const tid of telegram_ids) {
    await notifyDataSold(tid, company_name, amount_per_user || 0);
    sent++;
  }
  res.json({ success: true, sent });
});

// Send daily reminder to all users
app.post('/api/notify/daily-reminder', async (req, res) => {
  const users = db.prepare('SELECT telegram_id FROM users').all();
  let sent = 0;
  for (const u of users) {
    await notifyDailyReminder(u.telegram_id);
    sent++;
  }
  res.json({ success: true, sent });
});

// Test notification
app.post('/api/notify/test/:telegram_id', async (req, res) => {
  const result = await notifyReceiptProcessed(req.params.telegram_id, 'Magnum', 4500, 50);
  res.json({ success: true, result });
});

// ==================== ADMIN ENDPOINTS ====================

// Admin dashboard stats
app.get('/api/admin/stats', (req, res) => {
  const users = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const receipts = db.prepare('SELECT COUNT(*) as c FROM receipts').get().c;
  const revenue = db.prepare('SELECT COALESCE(SUM(total_amount), 0) as s FROM receipts').get().s;
  const companies = db.prepare('SELECT COUNT(*) as c FROM companies').get().c;
  const products = db.prepare('SELECT COUNT(*) as c FROM company_products').get().c;
  const detections = db.prepare('SELECT COUNT(*) as c FROM product_detections').get().c;
  const byGender = db.prepare("SELECT gender, COUNT(*) as c FROM users WHERE gender != '' GROUP BY gender").all();
  const byAge = db.prepare("SELECT age_group, COUNT(*) as c FROM users WHERE age_group != '' GROUP BY age_group").all();
  res.json({ users, receipts, revenue, companies, products, detections, byGender, byAge });
});

// Admin user list
app.get('/api/admin/users', (req, res) => {
  const users = db.prepare(`
    SELECT u.*, COALESCE(r.cnt, 0) as receipt_count
    FROM users u
    LEFT JOIN (SELECT telegram_id, COUNT(*) as cnt FROM receipts GROUP BY telegram_id) r
      ON u.telegram_id = r.telegram_id
    ORDER BY u.created_at DESC
  `).all();
  res.json({ total: users.length, users });
});

// Admin receipts list
app.get('/api/admin/receipts', (req, res) => {
  const receipts = db.prepare('SELECT * FROM receipts ORDER BY created_at DESC').all();
  res.json({ total: receipts.length, receipts });
});

// Delete user and their receipts
app.delete('/api/admin/users/:telegram_id', (req, res) => {
  const { telegram_id } = req.params;
  db.prepare('DELETE FROM receipts WHERE telegram_id = ?').run(telegram_id);
  db.prepare('DELETE FROM users WHERE telegram_id = ?').run(telegram_id);
  res.json({ success: true });
});

// Solana wallet info
app.get('/api/solana/wallet', async (req, res) => {
  try {
    const address = process.env.SOLANA_WALLET || 'DemoWa11etXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    let balance = 0;
    try { balance = await getBalance(address); } catch(e) {}
    res.json({ address, balance: (balance / 1e9).toFixed(4), network: 'devnet' });
  } catch(e) {
    res.json({ address: '-', balance: '0', network: 'devnet' });
  }
});

// Admin companies list
app.get('/api/admin/companies', (req, res) => {
  const companies = db.prepare(`
    SELECT c.*,
      COALESCE(p.cnt, 0) as product_count,
      COALESCE(d.cnt, 0) as detection_count
    FROM companies c
    LEFT JOIN (SELECT company_id, COUNT(*) as cnt FROM company_products GROUP BY company_id) p
      ON c.id = p.company_id
    LEFT JOIN (
      SELECT cp.company_id, COUNT(*) as cnt
      FROM product_detections pd
      JOIN company_products cp ON pd.product_id = cp.id
      GROUP BY cp.company_id
    ) d ON c.id = d.company_id
    ORDER BY c.created_at DESC
  `).all();
  res.json({ total: companies.length, companies });
});

// ==================== BUSINESS PROCESS ENDPOINTS ====================

// --- Moderation Queue ---
app.get('/api/admin/moderation', (req, res) => {
  const status = req.query.status || 'pending';
  const items = db.prepare(`
    SELECT mq.*,
      CASE mq.entity_type
        WHEN 'receipt' THEN (SELECT store_name || ' - ' || total_amount || ' T' FROM receipts WHERE id = mq.entity_id)
        WHEN 'company' THEN (SELECT name FROM companies WHERE id = mq.entity_id)
      END as entity_summary,
      CASE mq.entity_type
        WHEN 'receipt' THEN (SELECT telegram_id FROM receipts WHERE id = mq.entity_id)
      END as telegram_id
    FROM moderation_queue mq WHERE mq.status = ? ORDER BY mq.created_at DESC
  `).all(status);
  const counts = {
    pending: db.prepare("SELECT COUNT(*) as c FROM moderation_queue WHERE status='pending'").get().c,
    approved: db.prepare("SELECT COUNT(*) as c FROM moderation_queue WHERE status='approved'").get().c,
    rejected: db.prepare("SELECT COUNT(*) as c FROM moderation_queue WHERE status='rejected'").get().c,
  };
  res.json({ items, counts });
});

app.post('/api/admin/moderation/:id/approve', (req, res) => {
  const { id } = req.params;
  const { reviewer } = req.body;
  const item = db.prepare('SELECT * FROM moderation_queue WHERE id = ?').get(id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  db.prepare("UPDATE moderation_queue SET status='approved', reviewer=?, resolved_at=datetime('now') WHERE id=?").run(reviewer || 'admin', id);
  if (item.entity_type === 'receipt') db.prepare("UPDATE receipts SET status='approved', reviewed_by=?, reviewed_at=datetime('now') WHERE id=?").run(reviewer || 'admin', item.entity_id);
  if (item.entity_type === 'company') db.prepare("UPDATE companies SET status='active' WHERE id=?").run(item.entity_id);
  db.prepare("INSERT INTO audit_log (action, entity_type, entity_id, actor, details) VALUES (?, ?, ?, ?, ?)").run(`${item.entity_type}.approved`, item.entity_type, item.entity_id, reviewer || 'admin', JSON.stringify({ moderation_id: id }));
  res.json({ success: true });
});

app.post('/api/admin/moderation/:id/reject', (req, res) => {
  const { id } = req.params;
  const { reviewer, notes } = req.body;
  const item = db.prepare('SELECT * FROM moderation_queue WHERE id = ?').get(id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  db.prepare("UPDATE moderation_queue SET status='rejected', reviewer=?, notes=?, resolved_at=datetime('now') WHERE id=?").run(reviewer || 'admin', notes || '', id);
  if (item.entity_type === 'receipt') db.prepare("UPDATE receipts SET status='rejected', reviewed_by=?, reviewed_at=datetime('now') WHERE id=?").run(reviewer || 'admin', item.entity_id);
  if (item.entity_type === 'company') db.prepare("UPDATE companies SET status='suspended' WHERE id=?").run(item.entity_id);
  db.prepare("INSERT INTO audit_log (action, entity_type, entity_id, actor, details) VALUES (?, ?, ?, ?, ?)").run(`${item.entity_type}.rejected`, item.entity_type, item.entity_id, reviewer || 'admin', JSON.stringify({ moderation_id: id, notes }));
  res.json({ success: true });
});

// --- Receipt status ---
app.put('/api/admin/receipts/:id/status', (req, res) => {
  const { status, reviewer } = req.body;
  if (!['pending', 'approved', 'rejected', 'sold'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  db.prepare('UPDATE receipts SET status=?, reviewed_by=?, reviewed_at=datetime(?) WHERE id=?').run(status, reviewer || 'admin', 'now', req.params.id);
  db.prepare("INSERT INTO audit_log (action, entity_type, entity_id, actor, details) VALUES (?, 'receipt', ?, ?, ?)").run(`receipt.status.${status}`, req.params.id, reviewer || 'admin', JSON.stringify({ new_status: status }));
  res.json({ success: true });
});

// --- Company status ---
app.put('/api/admin/companies/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['pending', 'active', 'suspended'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  db.prepare('UPDATE companies SET status=? WHERE id=?').run(status, req.params.id);
  db.prepare("INSERT INTO audit_log (action, entity_type, entity_id, actor, details) VALUES (?, 'company', ?, 'admin', ?)").run(`company.status.${status}`, req.params.id, JSON.stringify({ new_status: status }));
  res.json({ success: true });
});

// --- Withdrawals ---
app.post('/api/user/withdraw', (req, res) => {
  const { telegram_id, amount_lamports } = req.body;
  if (!telegram_id || !amount_lamports) return res.status(400).json({ error: 'telegram_id and amount_lamports required' });
  const user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegram_id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const amountTenge = Math.round(amount_lamports * 0.0000001 * 450);
  db.prepare('INSERT INTO withdrawals (telegram_id, amount_lamports, amount_tenge, wallet_address, status) VALUES (?,?,?,?,?)').run(telegram_id, amount_lamports, amountTenge, user.wallet_address, 'pending');
  db.prepare("INSERT INTO audit_log (action, entity_type, entity_id, actor, details) VALUES ('withdrawal.requested', 'user', ?, ?, ?)").run(telegram_id, telegram_id, JSON.stringify({ amount_lamports, amount_tenge: amountTenge }));
  res.json({ success: true, message: 'Withdrawal request submitted' });
});

app.get('/api/user/withdrawals/:telegram_id', (req, res) => {
  const withdrawals = db.prepare('SELECT * FROM withdrawals WHERE telegram_id = ? ORDER BY created_at DESC').all(req.params.telegram_id);
  res.json({ withdrawals });
});

app.get('/api/admin/withdrawals', (req, res) => {
  const withdrawals = db.prepare(`
    SELECT w.*, u.first_name, u.last_name, u.username
    FROM withdrawals w LEFT JOIN users u ON w.telegram_id = u.telegram_id
    ORDER BY w.created_at DESC
  `).all();
  const counts = {
    pending: db.prepare("SELECT COUNT(*) as c FROM withdrawals WHERE status='pending'").get().c,
    processing: db.prepare("SELECT COUNT(*) as c FROM withdrawals WHERE status='processing'").get().c,
    completed: db.prepare("SELECT COUNT(*) as c FROM withdrawals WHERE status='completed'").get().c,
  };
  res.json({ withdrawals, counts });
});

app.put('/api/admin/withdrawals/:id/process', (req, res) => {
  const { status, solana_tx } = req.body;
  if (!['processing', 'completed', 'failed'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const processedAt = status === 'completed' || status === 'failed' ? new Date().toISOString() : '';
  db.prepare('UPDATE withdrawals SET status=?, solana_tx=?, processed_at=? WHERE id=?').run(status, solana_tx || '', processedAt, req.params.id);
  db.prepare("INSERT INTO audit_log (action, entity_type, entity_id, actor, details) VALUES (?, 'withdrawal', ?, 'admin', ?)").run(`withdrawal.${status}`, req.params.id, JSON.stringify({ status, solana_tx }));
  res.json({ success: true });
});

// --- Audit Log ---
app.get('/api/admin/audit-log', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const entityType = req.query.entity_type || '';
  let query = 'SELECT * FROM audit_log';
  const params = [];
  if (entityType) { query += ' WHERE entity_type = ?'; params.push(entityType); }
  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limit);
  const logs = db.prepare(query).all(...params);
  res.json({ logs, total: logs.length });
});

// --- Analytics (funnel + metrics) ---
app.get('/api/admin/analytics', (req, res) => {
  const users = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const onboarded = db.prepare('SELECT COUNT(*) as c FROM users WHERE onboarded = 1').get().c;
  const withReceipts = db.prepare('SELECT COUNT(DISTINCT telegram_id) as c FROM receipts').get().c;
  const totalReceipts = db.prepare('SELECT COUNT(*) as c FROM receipts').get().c;
  const approvedReceipts = db.prepare("SELECT COUNT(*) as c FROM receipts WHERE status='approved'").get().c;
  const pendingReceipts = db.prepare("SELECT COUNT(*) as c FROM receipts WHERE status='pending'").get().c;
  const rejectedReceipts = db.prepare("SELECT COUNT(*) as c FROM receipts WHERE status='rejected'").get().c;
  const totalRevenue = db.prepare('SELECT COALESCE(SUM(total_amount), 0) as s FROM receipts').get().s;
  const companies = db.prepare('SELECT COUNT(*) as c FROM companies').get().c;
  const purchases = db.prepare('SELECT COUNT(*) as c FROM purchases').get().c;
  const totalPaid = db.prepare('SELECT COALESCE(SUM(total_paid_lamports), 0) as s FROM purchases').get().s;
  const detections = db.prepare('SELECT COUNT(*) as c FROM product_detections').get().c;
  const pendingWithdrawals = db.prepare("SELECT COUNT(*) as c FROM withdrawals WHERE status='pending'").get().c;
  const completedWithdrawals = db.prepare("SELECT COALESCE(SUM(amount_tenge), 0) as s FROM withdrawals WHERE status='completed'").get().s;
  const pendingModeration = db.prepare("SELECT COUNT(*) as c FROM moderation_queue WHERE status='pending'").get().c;

  // Daily stats (last 14 days)
  const daily = db.prepare(`
    SELECT date(created_at) as day, COUNT(*) as receipts, SUM(total_amount) as revenue
    FROM receipts WHERE created_at >= date('now', '-14 days')
    GROUP BY date(created_at) ORDER BY day
  `).all();

  const dailyUsers = db.prepare(`
    SELECT date(created_at) as day, COUNT(*) as new_users
    FROM users WHERE created_at >= date('now', '-14 days')
    GROUP BY date(created_at) ORDER BY day
  `).all();

  res.json({
    funnel: { users, onboarded, withReceipts, totalReceipts, approvedReceipts },
    receipts: { total: totalReceipts, approved: approvedReceipts, pending: pendingReceipts, rejected: rejectedReceipts },
    revenue: { totalRevenue, totalPaid: Math.round(totalPaid * 0.0000001 * 450), completedWithdrawals },
    companies, purchases, detections,
    alerts: { pendingWithdrawals, pendingModeration },
    daily, dailyUsers,
  });
});

// Start Telegram bot
const { startBot } = require('./bot');
startBot().catch(e => console.error('Bot error:', e.message));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
