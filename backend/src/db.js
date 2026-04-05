const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'mening_deregim.db'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT UNIQUE,
    wallet_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT,
    store_name TEXT,
    total_amount REAL,
    category TEXT,
    items TEXT,
    date TEXT,
    data_hash TEXT,
    solana_tx TEXT,
    price_lamports INTEGER DEFAULT 5000000,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT,
    receipt_ids TEXT,
    total_paid_lamports INTEGER,
    ai_reasoning TEXT,
    ai_confidence INTEGER,
    solana_tx TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    industry TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS company_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    product_name TEXT,
    brand TEXT,
    category TEXT,
    keywords TEXT,
    barcode TEXT DEFAULT '',
    rrp REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS product_detections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    receipt_id INTEGER,
    store_name TEXT,
    city TEXT DEFAULT 'Almaty',
    price REAL,
    quantity INTEGER DEFAULT 1,
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migrations
try { db.exec('ALTER TABLE company_products ADD COLUMN barcode TEXT DEFAULT ""'); } catch(e) {}
try { db.exec('ALTER TABLE company_products ADD COLUMN rrp REAL DEFAULT 0'); } catch(e) {}
try { db.exec('ALTER TABLE users ADD COLUMN phone TEXT DEFAULT ""'); } catch(e) {}
try { db.exec('ALTER TABLE users ADD COLUMN age_group TEXT DEFAULT ""'); } catch(e) {}
try { db.exec('ALTER TABLE users ADD COLUMN gender TEXT DEFAULT ""'); } catch(e) {}
try { db.exec('ALTER TABLE users ADD COLUMN first_name TEXT DEFAULT ""'); } catch(e) {}
try { db.exec('ALTER TABLE users ADD COLUMN last_name TEXT DEFAULT ""'); } catch(e) {}
try { db.exec('ALTER TABLE users ADD COLUMN username TEXT DEFAULT ""'); } catch(e) {}
try { db.exec('ALTER TABLE users ADD COLUMN lang TEXT DEFAULT "ru"'); } catch(e) {}
try { db.exec('ALTER TABLE users ADD COLUMN city TEXT DEFAULT ""'); } catch(e) {}
try { db.exec('ALTER TABLE users ADD COLUMN onboarded INTEGER DEFAULT 0'); } catch(e) {}

// Business process migrations
try { db.exec('ALTER TABLE receipts ADD COLUMN status TEXT DEFAULT "approved"'); } catch(e) {}
try { db.exec('ALTER TABLE receipts ADD COLUMN reviewed_by TEXT DEFAULT ""'); } catch(e) {}
try { db.exec('ALTER TABLE receipts ADD COLUMN reviewed_at TEXT DEFAULT ""'); } catch(e) {}
try { db.exec('ALTER TABLE companies ADD COLUMN status TEXT DEFAULT "active"'); } catch(e) {}
try { db.exec('ALTER TABLE purchases ADD COLUMN status TEXT DEFAULT "confirmed"'); } catch(e) {}

db.exec(`
  CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT,
    amount_lamports INTEGER,
    amount_tenge REAL DEFAULT 0,
    wallet_address TEXT,
    status TEXT DEFAULT 'pending',
    solana_tx TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT,
    entity_type TEXT,
    entity_id TEXT,
    actor TEXT DEFAULT 'system',
    details TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS moderation_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT,
    entity_id INTEGER,
    reason TEXT DEFAULT 'manual',
    status TEXT DEFAULT 'pending',
    reviewer TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at TEXT DEFAULT ''
  );
`);

module.exports = db;
