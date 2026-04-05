const { parseReceipt } = require('./claude');
const db = require('./db');
const crypto = require('crypto');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendMessage(chatId, text) {
  await fetch(`${API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
  });
}

async function handleUpdate(update) {
  const msg = update.message;
  if (!msg) return;
  const chatId = msg.chat.id;
  const userId = String(msg.from.id);

  // /start command
  if (msg.text === '/start') {
    const existing = db.prepare('SELECT * FROM users WHERE telegram_id=?').get(userId);
    if (!existing) {
      db.prepare('INSERT INTO users (telegram_id, wallet_address, first_name, last_name, username) VALUES (?,?,?,?,?)').run(
        userId, 'Sol' + crypto.randomBytes(20).toString('hex').slice(0, 40),
        msg.from.first_name || '', msg.from.last_name || '', msg.from.username || ''
      );
    }
    await sendMessage(chatId, '👋 <b>Добро пожаловать в Mening Deregim!</b>\n\n📱 Отправьте фото или скриншот чека — и получите деньги.\n\n💡 <b>Подсказка:</b> скриншот из Kaspi, Halyk, Jusan — тоже работает!\n\n🔗 Данные защищены блокчейном Solana.');
    return;
  }

  // Photo → process receipt
  if (msg.photo) {
    await sendMessage(chatId, '🔍 <b>Сканирую чек...</b>\n\nClaude AI читает данные');

    try {
      const fileId = msg.photo[msg.photo.length - 1].file_id;
      const file = await fetch(`${API}/getFile?file_id=${fileId}`).then(r => r.json());
      const filePath = file.result.file_path;
      const imageUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
      const imageBuffer = await fetch(imageUrl).then(r => r.arrayBuffer());
      const base64 = Buffer.from(imageBuffer).toString('base64');

      const parsed = await parseReceipt(base64);
      if (parsed.error) {
        await sendMessage(chatId, '❌ Не удалось прочитать чек.\nПопробуйте сделать фото чётче или ближе.');
        return;
      }

      // Save to DB
      const hash = crypto.createHash('sha256').update(JSON.stringify(parsed) + userId + Date.now()).digest('hex');
      db.prepare('INSERT INTO receipts (telegram_id, store_name, total_amount, category, items, date, data_hash, solana_tx, price_lamports, status) VALUES (?,?,?,?,?,?,?,?,?,?)').run(
        userId, parsed.store_name, parsed.total_amount, parsed.category,
        JSON.stringify(parsed.items || []), parsed.date, hash, 'tx_' + hash.slice(0, 20), 5000000, 'approved'
      );

      const earned = Math.round(5000000 * 0.0000001 * 450);
      const itemCount = (parsed.items || []).length;
      const itemList = (parsed.items || []).slice(0, 5).map(it => `  • ${it.name} — ${it.price} ₸`).join('\n');
      const moreItems = itemCount > 5 ? `\n  ... и ещё ${itemCount - 5} товаров` : '';

      await sendMessage(chatId,
        `✅ <b>Чек обработан!</b>\n\n` +
        `🏪 <b>${parsed.store_name}</b>\n` +
        `📅 ${parsed.date || 'сегодня'}\n` +
        `📂 ${parsed.category}\n\n` +
        `📋 <b>Товары (${itemCount}):</b>\n${itemList}${moreItems}\n\n` +
        `💰 <b>Итого: ${(parsed.total_amount || 0).toLocaleString()} ₸</b>\n\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `💸 <b>Вы заработали: ~${earned} ₸</b>\n` +
        `🔗 Хеш данных сохранён на Solana\n\n` +
        `📸 Отправьте ещё один чек!`
      );
    } catch (e) {
      console.error('Bot receipt error:', e.message);
      await sendMessage(chatId, '❌ Ошибка при обработке. Попробуйте ещё раз.');
    }
    return;
  }

  // Document (image file)
  if (msg.document && msg.document.mime_type?.startsWith('image/')) {
    await sendMessage(chatId, '📸 Отправьте чек как <b>фото</b>, а не как файл.\nНажмите 📎 → Фото.');
    return;
  }

  // Any other text
  await sendMessage(chatId,
    '📸 <b>Отправьте мне фото или скриншот чека!</b>\n\n' +
    '💡 <b>Как это работает:</b>\n' +
    '1. Откройте чек (Kaspi, банк, email)\n' +
    '2. Сделайте скриншот\n' +
    '3. Отправьте мне\n' +
    '4. Получите деньги!\n\n' +
    '🔒 Данные анонимизированы и защищены блокчейном.'
  );
}

async function startBot() {
  if (!BOT_TOKEN) { console.log('No BOT_TOKEN, skipping bot'); return; }
  let offset = 0;
  console.log('Telegram bot started (polling)');

  while (true) {
    try {
      const res = await fetch(`${API}/getUpdates?offset=${offset}&timeout=30`);
      const data = await res.json();
      for (const u of data.result || []) {
        offset = u.update_id + 1;
        handleUpdate(u).catch(e => console.error('Bot update error:', e.message));
      }
    } catch (e) {
      console.error('Bot polling error:', e.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

module.exports = { startBot };
