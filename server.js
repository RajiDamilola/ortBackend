'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');
const vm = require('vm');
const crypto = require('crypto');
const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

// ---------- Config ----------
const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.resolve(__dirname, process.env.FRONTEND_DIR || '../frontend');
const DATA_DIR = path.resolve(__dirname, process.env.DATA_DIR || './data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const { ADMIN_PASSWORD, JWT_SECRET } = process.env;
if (!ADMIN_PASSWORD || !JWT_SECRET) {
  console.error('Missing ADMIN_PASSWORD or JWT_SECRET. Create a .env file (see README).');
  process.exit(1);
}
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ---------- Database ----------
const db = new Database(path.join(DATA_DIR, 'ort.db'));
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE COLLATE NOCASE NOT NULL,
  password_hash TEXT NOT NULL, first_name TEXT, last_name TEXT, mobile TEXT, extra TEXT DEFAULT '{}',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS categories (slug TEXT PRIMARY KEY, key TEXT NOT NULL, sort_order INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS products (slug TEXT PRIMARY KEY, category TEXT, published INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0, data TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS requests (id INTEGER PRIMARY KEY AUTOINCREMENT, kind TEXT, status TEXT DEFAULT 'new',
  user_id INTEGER, email TEXT, fields TEXT DEFAULT '{}', files TEXT DEFAULT '[]', admin_note TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
`);

const STATUSES = ['new', 'review', 'quoted', 'closed', 'expired'];
const DEFAULT_CATEGORIES = ['complete', 'panels', 'inverters', 'batteries', 'controllers'];

// Reads the frontend's own data.js so the seed matches it exactly.
function loadFrontendData() {
  const file = path.join(FRONTEND_DIR, 'js', 'data.js');
  if (!fs.existsSync(file)) return {};
  const noop = () => {};
  const ctx = {
    console, setTimeout, clearTimeout,
    localStorage: { getItem: () => null, setItem: noop, removeItem: noop, key: () => null, length: 0 },
    document: { addEventListener: noop, querySelector: () => null, querySelectorAll: () => [],
      getElementById: () => null, documentElement: { lang: 'en', setAttribute: noop } },
    navigator: { language: 'en' }, location: { pathname: '/', search: '' }, addEventListener: noop,
  };
  ctx.window = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  try {
    vm.runInContext(fs.readFileSync(file, 'utf8') + `
;this.__out = {
  products: typeof ORT_PRODUCTS !== 'undefined' ? ORT_PRODUCTS : null,
  categories: typeof ORT_CATEGORIES !== 'undefined' ? ORT_CATEGORIES : null,
  whatsapp: typeof ORT_WHATSAPP !== 'undefined' ? ORT_WHATSAPP : null,
  email: typeof ORT_ORDERS_EMAIL !== 'undefined' ? ORT_ORDERS_EMAIL : null };`, ctx, { timeout: 2000 });
    return JSON.parse(JSON.stringify(ctx.__out));
  } catch (e) {
    console.warn('Could not read frontend data.js for seeding:', e.message);
    return {};
  }
}

db.transaction(() => {
  const fd = loadFrontendData();
  if (db.prepare('SELECT COUNT(*) n FROM categories').get().n === 0) {
    const ins = db.prepare('INSERT INTO categories (slug, key, sort_order) VALUES (?, ?, ?)');
    const cats = Array.isArray(fd.categories) && fd.categories.every(c => c && c.slug)
      ? fd.categories.map(c => [c.slug, c.key || c.slug])
      : DEFAULT_CATEGORIES.map(s => [s, s]);
    cats.forEach(([s, k], i) => ins.run(s, k, i));
  }
  if (db.prepare('SELECT COUNT(*) n FROM products').get().n === 0 && Array.isArray(fd.products)) {
    const ins = db.prepare('INSERT INTO products (slug, category, published, sort_order, data) VALUES (?, ?, 1, ?, ?)');
    fd.products.forEach((p, i) => p && p.slug && ins.run(p.slug, p.category || '', i, JSON.stringify(p)));
    console.log(`Seeded ${fd.products.length} products from frontend/js/data.js`);
  }
  const setDef = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  setDef.run('whatsapp', String(fd.whatsapp || '22961632589'));
  setDef.run('orders_email', String(fd.email || 'orders@ortwatt.com'));
})();

// ---------- Helpers ----------
const getSettings = () => Object.fromEntries(db.prepare('SELECT key, value FROM settings').all().map(r => [r.key, r.value]));
const rowToProduct = r => ({ ...JSON.parse(r.data), slug: r.slug, category: r.category });
const publishedProducts = () =>
  db.prepare('SELECT * FROM products WHERE published = 1 ORDER BY sort_order, rowid').all().map(rowToProduct);
const httpErr = (status, message) => Object.assign(new Error(message), { status });
const wrap = fn => (req, res, next) => { try { fn(req, res, next); } catch (e) { next(e); } };
const slugify = s => String(s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
const sign = (payload, expiresIn) => jwt.sign(payload, JWT_SECRET, { expiresIn });

function readToken(req) {
  const h = req.headers.authorization || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : (req.query.token || null);
  if (!t) return null;
  try { return jwt.verify(t, JWT_SECRET); } catch { return null; }
}
const requireUser = (req, res, next) => {
  const p = readToken(req);
  if (!p || !p.uid) return res.status(401).json({ error: 'Please log in.' });
  req.uid = p.uid; next();
};
const requireAdmin = (req, res, next) => {
  const p = readToken(req);
  if (!p || p.role !== 'admin') return res.status(401).json({ error: 'Admin login required.' });
  next();
};

function publicUser(u) {
  if (!u) return null;
  let extra = {}; try { extra = JSON.parse(u.extra || '{}'); } catch {}
  return { ...extra, id: u.id, first_name: u.first_name, last_name: u.last_name, email: u.email,
    mobile: u.mobile, created_at: u.created_at };
}

// Simple brute-force protection for login endpoints
const attempts = new Map();
function limited(req) {
  const key = req.ip + req.path, now = Date.now();
  const list = (attempts.get(key) || []).filter(t => now - t < 15 * 60 * 1000);
  list.push(now); attempts.set(key, list);
  return list.length > 10;
}
const sameSecret = (a, b) => {
  const h = s => crypto.createHash('sha256').update(String(s)).digest();
  return crypto.timingSafeEqual(h(a), h(b));
};

// Turn the cart ({slug, qty} list) into priced line items for the admin.
function enrichCart(raw) {
  let list;
  try { list = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return null; }
  if (list && !Array.isArray(list) && typeof list === 'object') {
    list = Array.isArray(list.items) ? list.items : Object.entries(list).map(([slug, qty]) => ({ slug, qty }));
  }
  if (!Array.isArray(list)) return null;
  const get = db.prepare('SELECT data FROM products WHERE slug = ?');
  return list.map(it => {
    const slug = String(it.slug || it.id || '');
    const qty = Math.max(1, parseInt(it.qty || it.quantity || 1, 10) || 1);
    const r = get.get(slug);
    const p = r ? JSON.parse(r.data) : {};
    const ref = Number(p.referencePrice) || 0;
    const fee = Math.round(ref * (Number(p.feePercent ?? 10)) / 100);
    return { slug, qty, brand: p.brand || '', model: p.model || '', referencePrice: ref, fee,
      unit: ref + fee, total: (ref + fee) * qty };
  });
}

// Quotes older than 30 days without an update become "expired".
const expireOld = () => db.prepare(`UPDATE requests SET status = 'expired', updated_at = CURRENT_TIMESTAMP
  WHERE status = 'quoted' AND updated_at < datetime('now', '-30 days')`).run();

function formatRequest(r) {
  return { id: r.id, kind: r.kind, status: r.status, user_id: r.user_id, email: r.email,
    fields: JSON.parse(r.fields || '{}'), files: JSON.parse(r.files || '[]'), admin_note: r.admin_note,
    created_at: r.created_at, updated_at: r.updated_at };
}

// ---------- App ----------
const app = express();
app.options('*', cors());
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.get('*', (req, res, next) => { if (req.url.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'index.html'));
});
  

const formOnly = multer().none();
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, f, cb) => cb(null, crypto.randomBytes(12).toString('hex') +
      path.extname(f.originalname || '').toLowerCase().replace(/[^.a-z0-9]/g, '').slice(0, 10)),
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
});

// ---------- Auth ----------
app.post('/api/admin/uploads', requireAdmin, upload.single('image'), wrap((req, res) => {
  if (!req.file) throw httpErr(400, 'Choose an image to upload.');
  res.status(201).json({ filename: req.file.filename });
}));
app.post('/api/auth/register', formOnly, wrap((req, res) => {
  const { email, password, first_name, last_name, mobile, ...rest } = req.body || {};
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw httpErr(400, 'Please enter a valid email.');
  if (!password || String(password).length < 6) throw httpErr(400, 'Password must be at least 6 characters.');
  Object.keys(rest).forEach(k => { if (/pass/i.test(k)) delete rest[k]; });
  try {
    const info = db.prepare(`INSERT INTO users (email, password_hash, first_name, last_name, mobile, extra)
      VALUES (?, ?, ?, ?, ?, ?)`).run(String(email).trim(), bcrypt.hashSync(String(password), 10),
      first_name || '', last_name || '', mobile || '', JSON.stringify(rest));
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    res.json({ token: sign({ uid: user.id }, '30d'), user: publicUser(user) });
  } catch (e) {
    if (String(e.code).startsWith('SQLITE_CONSTRAINT')) throw httpErr(409, 'An account with this email already exists.');
    throw e;
  }
}));

app.post('/api/auth/login', formOnly, wrap((req, res) => {
  if (limited(req)) throw httpErr(429, 'Too many attempts. Try again in 15 minutes.');
  const { email, password } = req.body || {};
  const user = email && db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).trim());
  if (!user || !bcrypt.compareSync(String(password || ''), user.password_hash)) {
    throw httpErr(401, 'Wrong email or password.');
  }
  res.json({ token: sign({ uid: user.id }, '30d'), user: publicUser(user) });
}));

app.get('/api/auth/me', requireUser, wrap((req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.uid);
  if (!user) throw httpErr(401, 'Account not found.');
  res.json({ user: publicUser(user) });
}));

// ---------- Catalogue ----------
app.get('/api/config', (req, res) => {
  const s = getSettings();
  res.json({ whatsapp: s.whatsapp, ordersEmail: s.orders_email });
});
app.get('/api/categories', (req, res) => {
  res.json(db.prepare('SELECT slug, key FROM categories ORDER BY sort_order').all());
});
app.get('/api/products', (req, res) => {
  const c = req.query.category;
  const rows = c
    ? db.prepare('SELECT * FROM products WHERE published = 1 AND category = ? ORDER BY sort_order, rowid').all(c)
    : db.prepare('SELECT * FROM products WHERE published = 1 ORDER BY sort_order, rowid').all();
  res.json(rows.map(rowToProduct));
});
app.get('/api/products/:slug', (req, res) => {
  const r = db.prepare('SELECT * FROM products WHERE slug = ? AND published = 1').get(req.params.slug);
  if (!r) return res.status(404).json({ error: 'Product not found.' });
  res.json(rowToProduct(r));
});

// ---------- Requests (orders, quotes, contact) ----------
app.post('/api/requests', upload.any(), wrap((req, res) => {
  const fields = { ...(req.body || {}) };
  const kind = String(fields.kind || 'general').slice(0, 40);
  delete fields.kind;
  const raw = fields.cart ?? fields.items;
  if (raw !== undefined) {
    const items = enrichCart(raw);
    delete fields.cart;
    if (items) fields.items = items; else fields.items_raw = raw;
  }
  const tok = readToken(req);
  const uid = tok && tok.uid ? tok.uid : null;
  let email = fields.email || null;
  if (!email && uid) email = (db.prepare('SELECT email FROM users WHERE id = ?').get(uid) || {}).email || null;
  const files = (req.files || []).map(f => ({ field: f.fieldname, name: f.originalname, stored: f.filename,
    size: f.size, type: f.mimetype }));
  const info = db.prepare('INSERT INTO requests (kind, user_id, email, fields, files) VALUES (?, ?, ?, ?, ?)')
    .run(kind, uid, email, JSON.stringify(fields), JSON.stringify(files));
  console.log(`New ${kind} request #${info.lastInsertRowid}`);
  res.json({ success: true, id: info.lastInsertRowid });
}));

app.get('/api/requests/mine', requireUser, wrap((req, res) => {
  expireOld();
  const u = db.prepare('SELECT email FROM users WHERE id = ?').get(req.uid) || {};
  const rows = db.prepare(`SELECT * FROM requests WHERE user_id = ? OR (email IS NOT NULL AND email = ? COLLATE NOCASE)
    ORDER BY created_at DESC`).all(req.uid, u.email || '');
  res.json(rows.map(r => {
    const x = formatRequest(r);
    return { id: x.id, kind: x.kind, status: x.status, created_at: x.created_at, updated_at: x.updated_at,
      note: x.admin_note, ...x.fields };
  }));
}));

// ---------- Admin ----------
app.post('/api/admin/login', formOnly, wrap((req, res) => {
  if (limited(req)) throw httpErr(429, 'Too many attempts. Try again in 15 minutes.');
  if (!sameSecret(req.body?.password || '', ADMIN_PASSWORD)) throw httpErr(401, 'Wrong admin password.');
  res.json({ token: sign({ role: 'admin' }, '12h') });
}));
app.get('/api/admin/dashboard', requireAdmin, wrap((req, res) => {
  expireOld();
  res.json({ products: db.prepare('SELECT * FROM products ORDER BY sort_order, rowid').all().map(r => ({ ...rowToProduct(r), published: !!r.published, sort_order: r.sort_order })),
    requests: db.prepare('SELECT * FROM requests ORDER BY created_at DESC, id DESC').all().map(formatRequest),
    categories: db.prepare('SELECT slug, key FROM categories ORDER BY sort_order').all(), settings: getSettings() });
}));
app.post('/api/admin/products', requireAdmin, wrap((req, res) => {
  const p = req.body || {};
  const slug = slugify(p.slug || `${p.brand || ''}-${p.model || ''}`);
  if (!slug || !p.brand || !p.model || !p.category) throw httpErr(400, 'Slug, brand, model and category are required.');
  if (!db.prepare('SELECT 1 FROM categories WHERE slug = ?').get(p.category)) throw httpErr(400, 'Unknown category.');
  if (db.prepare('SELECT 1 FROM products WHERE slug = ?').get(slug)) throw httpErr(409, 'Slug already exists.');
  const { published, sort_order, ...data } = p;
  data.slug = slug;
  db.prepare('INSERT INTO products (slug, category, published, sort_order, data) VALUES (?, ?, ?, ?, ?)')
    .run(slug, p.category, published === false ? 0 : 1, Number(sort_order) || 0, JSON.stringify(data));
  res.status(201).json({ slug });
}));
app.put('/api/admin/products/:slug', requireAdmin, wrap((req, res) => {
  const old = db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.slug);
  if (!old) throw httpErr(404, 'Product not found.');
  const p = req.body || {}, slug = slugify(p.slug || old.slug);
  if (!slug || !p.brand || !p.model || !p.category) throw httpErr(400, 'Slug, brand, model and category are required.');
  if (!db.prepare('SELECT 1 FROM categories WHERE slug = ?').get(p.category)) throw httpErr(400, 'Unknown category.');
  const { published, sort_order, ...data } = p;
  data.slug = slug;
  db.prepare('UPDATE products SET slug = ?, category = ?, published = ?, sort_order = ?, data = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?')
    .run(slug, p.category, published === false ? 0 : 1, Number(sort_order) || 0, JSON.stringify(data), old.slug);
  res.json({ slug });
}));
app.delete('/api/admin/products/:slug', requireAdmin, wrap((req, res) => {
  const info = db.prepare('DELETE FROM products WHERE slug = ?').run(req.params.slug);
  if (!info.changes) throw httpErr(404, 'Product not found.');
  res.json({ success: true });
}));
app.put('/api/admin/settings', requireAdmin, wrap((req, res) => {
  const { whatsapp, orders_email } = req.body || {};
  if (!/^\+?[0-9]{8,18}$/.test(String(whatsapp || ''))) throw httpErr(400, 'Enter a valid WhatsApp number (digits only).');
  if (!/^\S+@\S+\.\S+$/.test(String(orders_email || ''))) throw httpErr(400, 'Enter a valid orders email.');
  db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(whatsapp, 'whatsapp');
  db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(orders_email, 'orders_email');
  res.json({ success: true });
}));
app.patch('/api/admin/requests/:id', requireAdmin, wrap((req, res) => {
  const { status, admin_note } = req.body || {};
  if (!STATUSES.includes(status)) throw httpErr(400, 'Invalid status.');
  const info = db.prepare('UPDATE requests SET status = ?, admin_note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(status, String(admin_note || '').slice(0, 5000), req.params.id);
  if (!info.changes) throw httpErr(404, 'Request not found.');
  res.json({ success: true });
}));
app.get('/api/admin/uploads/:name', requireAdmin, wrap((req, res) => {
  if (!/^[a-f0-9]{24}(\.[a-z0-9]{1,9})?$/.test(req.params.name)) throw httpErr(400, 'Invalid filename.');
  res.sendFile(path.join(UPLOAD_DIR, req.params.name));
}));

// ---------- Frontend ----------
// data.js is served live: products and contact settings come from the database,
// so admin changes appear on the site instantly without editing frontend files.
app.get('/js/data.js', (req, res, next) => {
  const file = path.join(FRONTEND_DIR, 'js', 'data.js');
  if (!fs.existsSync(file)) return next();
  const s = getSettings();
  let src = fs.readFileSync(file, 'utf8')
    .replace(/(ORT_WHATSAPP\s*=\s*)(['"`])[^'"`]*\2/, (m, a) => a + JSON.stringify(s.whatsapp))
    .replace(/(ORT_ORDERS_EMAIL\s*=\s*)(['"`])[^'"`]*\2/, (m, a) => a + JSON.stringify(s.orders_email));
  src += `
;(function(){
  try { var P = ${JSON.stringify(publishedProducts())};
    if (typeof ORT_PRODUCTS !== 'undefined' && Array.isArray(ORT_PRODUCTS)) { ORT_PRODUCTS.length = 0; Array.prototype.push.apply(ORT_PRODUCTS, P); }
  } catch (e) {}
  try { if (window.fetch && !window.__ortCart) { window.__ortCart = 1; var f0 = window.fetch;
    window.fetch = function (u, o) { try {
      if (String(u).indexOf('/api/requests') !== -1 && o && o.body instanceof FormData && o.body.get('kind') === 'order' && !o.body.has('cart')) {
        for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i);
          if (/cart/i.test(k)) { o.body.append('cart', localStorage.getItem(k)); break; } } }
    } catch (e) {} return f0.apply(this, arguments); }; } } catch (e) {}
})();
`;
  res.type('application/javascript').set('Cache-Control', 'no-cache').send(src);
});

app.get(['/admin', '/admin/'], (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));
// Public route so visitors can see uploaded product pictures
app.get('/uploads/:name', (req, res) => {
  if (!/^[a-f0-9]{24}(\.[a-z0-9]{1,9})?$/.test(req.params.name)) {
    return res.status(404).end();
  }
  res.sendFile(path.join(UPLOAD_DIR, req.params.name));
});
app.use(express.static(FRONTEND_DIR, { extensions: ['html'] }));
app.use((req, res) => {
  const nf = path.join(FRONTEND_DIR, '404.html');
  if (fs.existsSync(nf)) return res.status(404).sendFile(nf);
  res.status(404).send('Page not found');
});

app.use((err, req, res, next) => {
  const status = err.status || (err instanceof multer.MulterError ? 400 : 500);
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Server error. Please try again.' : err.message });
});

PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running perfectly on port ${PORT}`);
});
