'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');
const vm = require('vm');
const crypto = require('crypto');
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

// ---------- Config ----------
const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = __dirname;
const UPLOAD_DIR = path.join(__dirname, 'data', 'uploads');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'default_admin_password_123';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_string';

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ---------- Cloud Database Configuration ----------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDb() {
  const client = await pool.connect();
  try {
    // 1. Create permanent system tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
        first_name TEXT, last_name TEXT, mobile TEXT, extra TEXT DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS categories (slug TEXT PRIMARY KEY, key TEXT NOT NULL, sort_order INTEGER DEFAULT 0);
      CREATE TABLE IF NOT EXISTS products (
        slug TEXT PRIMARY KEY, category TEXT, published INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0, data TEXT NOT NULL, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY, kind TEXT, status TEXT DEFAULT 'new', user_id INTEGER,
        email TEXT, fields TEXT DEFAULT '{}', files TEXT DEFAULT '', admin_note TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
    `);
    await client.query("INSERT INTO settings (key, value) VALUES ('whatsapp', '22961632589') ON CONFLICT DO NOTHING");
    await client.query("INSERT INTO settings (key, value) VALUES ('orders_email', 'orders@ortwatt.com') ON CONFLICT DO NOTHING");

    // 2. Clear out any previous partial category initialization to ensure total data sync
    const catCheck = await client.query('SELECT COUNT(*) AS count FROM categories');
    if (parseInt(catCheck.rows[0].count, 10) === 0) {
      console.log('Seeding store categories into cloud engine...');
      const defaultCategories = ['complete', 'panels', 'inverters', 'batteries', 'controllers'];
      for (let i = 0; i < defaultCategories.length; i++) {
        await client.query('INSERT INTO categories (slug, key, sort_order) VALUES ($1, $2, $3)', [defaultCategories[i], defaultCategories[i], i]);
      }
    }

    // FORCE CHECK: If product records are empty, completely override the block execution to run seed logic
    const prodCheck = await client.query('SELECT COUNT(*) AS count FROM products');
    if (parseInt(prodCheck.rows[0].count, 10) === 0) {
      const file = path.join(FRONTEND_DIR, 'data.js');
      if (fs.existsSync(file)) {
        console.log('Database empty! Reading data.js to copy items to cloud storage...');
        const noop = () => {};
        const ctx = {
          console, setTimeout, clearTimeout,
          localStorage: { getItem: () => null, setItem: noop, removeItem: noop, key: () => null, length: 0 },
          document: { addEventListener: noop, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, documentElement: { lang: 'en', setAttribute: noop } },
          navigator: { language: 'en' }, location: { pathname: '/', search: '' }, addEventListener: noop
        };
        ctx.window = ctx; ctx.self = ctx;
        vm.createContext(ctx);
        try {
          vm.runInContext(fs.readFileSync(file, 'utf8') + '; this.__out = typeof ORT_PRODUCTS !== "undefined" ? ORT_PRODUCTS : [];', ctx, { timeout: 2000 });
          const productsArray = ctx.__out;
          if (Array.isArray(productsArray) && productsArray.length > 0) {
            for (let i = 0; i < productsArray.length; i++) {
              const p = productsArray[i];
              if (p && p.slug) {
                const cleanSlug = String(p.slug).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                await client.query('INSERT INTO products (slug, category, published, sort_order, data) VALUES ($1, $2, 1, $3, $4) ON CONFLICT DO NOTHING', [cleanSlug, p.category || '', i, JSON.stringify(p)]);
              }
            }
            console.log('Successfully seeded ' + productsArray.length + ' products into your cloud storage!');
          }
        } catch (e) { console.warn('Could not parse file data for cloud database sync:', e.message); }
      }
    }
  } finally { client.release(); }
}

      CREATE TABLE IF NOT EXISTS categories (
        slug TEXT PRIMARY KEY,
        key TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS products (
        slug TEXT PRIMARY KEY,
        category TEXT,
        published INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        data TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        kind TEXT,
        status TEXT DEFAULT 'new',
        user_id INTEGER,
        email TEXT,
        fields TEXT DEFAULT '{}',
        files TEXT DEFAULT '',
        admin_note TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);

    await client.query(
      "INSERT INTO settings (key, value) VALUES ('whatsapp', '22961632589') ON CONFLICT DO NOTHING"
    );

    await client.query(
      "INSERT INTO settings (key, value) VALUES ('orders_email', 'orders@ortwatt.com') ON CONFLICT DO NOTHING"
    );

    // 2. Automated Seed: Fallback array seeding if tables are empty
    const catCheck = await client.query(
      'SELECT COUNT(*) AS count FROM categories'
    );

    if (parseInt(catCheck.rows[0].count, 10) === 0) {
      console.log('Seeding store categories into cloud engine...');

      const defaultCategories = [
        'complete',
        'panels',
        'inverters',
        'batteries',
        'controllers'
      ];

      for (let i = 0; i < defaultCategories.length; i++) {
        await client.query(
          'INSERT INTO categories (slug, key, sort_order) VALUES ($1, $2, $3)',
          [defaultCategories[i], defaultCategories[i], i]
        );
      }
    }

    const prodCheck = await client.query(
      'SELECT COUNT(*) AS count FROM products'
    );

    if (parseInt(prodCheck.rows[0].count, 10) === 0) {
      const file = path.join(FRONTEND_DIR, 'data.js');

      if (fs.existsSync(file)) {
        console.log('Reading data.js to copy items to cloud storage...');

        const noop = () => {};
        const ctx = {
          console,
          setTimeout,
          clearTimeout,
          localStorage: {
            getItem: () => null,
            setItem: noop,
            removeItem: noop,
            key: () => null,
            length: 0
          },
          document: {
            addEventListener: noop,
            querySelector: () => null,
            querySelectorAll: () => [],
            getElementById: () => null,
            documentElement: {
              lang: 'en',
              setAttribute: noop
            }
          },
          navigator: { language: 'en' },
          location: { pathname: '/', search: '' },
          addEventListener: noop
        };

        ctx.window = ctx;
        ctx.self = ctx;
        vm.createContext(ctx);

        try {
          vm.runInContext(
            fs.readFileSync(file, 'utf8') +
              '; this.__out = typeof ORT_PRODUCTS !== "undefined" ? ORT_PRODUCTS : [];',
            ctx,
            { timeout: 2000 }
          );

          const productsArray = ctx.__out;

          if (Array.isArray(productsArray) && productsArray.length > 0) {
            for (let i = 0; i < productsArray.length; i++) {
              const p = productsArray[i];

              if (p && p.slug) {
                const cleanSlug = String(p.slug)
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-');

                await client.query(
                  'INSERT INTO products (slug, category, published, sort_order, data) VALUES ($1, $2, 1, $3, $4) ON CONFLICT DO NOTHING',
                  [cleanSlug, p.category || '', i, JSON.stringify(p)]
                );
              }
            }

            console.log(
              'Successfully seeded ' +
                productsArray.length +
                ' products into your cloud storage!'
            );
          }
        } catch (e) {
          console.warn(
            'Could not parse file data for cloud database sync:',
            e.message
          );
        }
      }
    }
  } finally {
    client.release();
  }
}

initDb().catch(err => console.error('Cloud DB Initialization Error:', err));

// ---------- Helpers & Database Wrappers ----------
const getSettings = async () => {
  const res = await pool.query('SELECT key, value FROM settings');
  return Object.fromEntries(res.rows.map(r => [r.key, r.value]));
};

const rowToProduct = r => ({
  ...JSON.parse(r.data),
  slug: r.slug,
  category: r.category
});

const httpErr = (status, message) =>
  Object.assign(new Error(message), { status });

const wrap = fn => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (e) {
    next(e);
  }
};

const slugify = s =>
  String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const sign = (payload, expiresIn) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn });

function readToken(req) {
  const h = req.headers.authorization || '';
  const t = h.startsWith('Bearer ')
    ? h.slice(7)
    : (req.query.token || null);

  if (!t) return null;

  try {
    return jwt.verify(t, JWT_SECRET);
  } catch {
    return null;
  }
}

const requireUser = (req, res, next) => {
  const p = readToken(req);

  if (!p || !p.uid) {
    return res.status(401).json({ error: 'Please log in.' });
  }

  req.uid = p.uid;
  next();
};

const requireAdmin = (req, res, next) => {
  const p = readToken(req);

  if (!p || p.role !== 'admin') {
    return res.status(401).json({ error: 'Admin login required.' });
  }

  next();
};

function publicUser(u) {
  if (!u) return null;

  let extra = {};

  try {
    extra = JSON.parse(u.extra || '{}');
  } catch {}

  return {
    ...extra,
    id: u.id,
    first_name: u.first_name,
    last_name: u.last_name,
    email: u.email,
    mobile: u.mobile,
    created_at: u.created_at
  };
}

const attempts = new Map();

function limited(req) {
  const key = req.ip + req.path;
  const now = Date.now();
  const list = (attempts.get(key) || []).filter(
    t => now - t < 15 * 60 * 1000
  );

  list.push(now);
  attempts.set(key, list);

  return list.length > 10;
}

const sameSecret = (a, b) => {
  const h = s =>
    crypto.createHash('sha256').update(String(s)).digest();

  return crypto.timingSafeEqual(h(a), h(b));
};

async function enrichCart(raw) {
  let list;

  try {
    list = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }

  if (list && !Array.isArray(list) && typeof list === 'object') {
    list = Array.isArray(list.items)
      ? list.items
      : Object.entries(list).map(([slug, qty]) => ({ slug, qty }));
  }

  if (!Array.isArray(list)) return null;

  const enriched = [];

  for (const it of list) {
    const slug = String(it.slug || it.id || '');
    const qty = Math.max(
      1,
      parseInt(it.qty || it.quantity || 1, 10) || 1
    );

    const r = await pool.query(
      'SELECT data FROM products WHERE slug = $1',
      [slug]
    );

    const p = r.rows[0] ? JSON.parse(r.rows[0].data) : {};
    const ref = Number(p.referencePrice) || 0;
    const fee = Math.round(ref * Number(p.feePercent ?? 10) / 100);

    enriched.push({
      slug,
      qty,
      brand: p.brand || '',
      model: p.model || '',
      referencePrice: ref,
      fee,
      unit: ref + fee,
      total: (ref + fee) * qty
    });
  }

  return enriched;
}

// ---------- App Setup ----------
const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get(['/admin', '/admin/'], (req, res) =>
  res.sendFile(path.join(__dirname, 'admin.html'))
);

const formOnly = multer().none();

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, f, cb) =>
      cb(
        null,
        crypto.randomBytes(12).toString('hex') +
          path.extname(f.originalname || '')
            .toLowerCase()
            .replace(/[^.a-z0-9]/g, '')
            .slice(0, 10)
      )
  }),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10
  }
});

// ---------- Auth Routes ----------
app.post(
  '/api/admin/uploads',
  requireAdmin,
  upload.single('image'),
  wrap((req, res) => {
    if (!req.file) {
      throw httpErr(400, 'Choose an image to upload.');
    }

    res.status(201).json({ filename: req.file.filename });
  })
);

app.post('/api/auth/register', formOnly, wrap(async (req, res) => {
  const {
    email,
    password,
    first_name,
    last_name,
    mobile,
    ...rest
  } = req.body || {};

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw httpErr(400, 'Please enter a valid email.');
  }

  if (!password || String(password).length < 6) {
    throw httpErr(400, 'Password must be at least 6 characters.');
  }

  Object.keys(rest).forEach(k => {
    if (/pass/i.test(k)) delete rest[k];
  });

  try {
    const query = `
      INSERT INTO users (
        email,
        password_hash,
        first_name,
        last_name,
        mobile,
        extra
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;

    const info = await pool.query(query, [
      String(email).trim(),
      bcrypt.hashSync(String(password), 10),
      first_name || '',
      last_name || '',
      mobile || '',
      JSON.stringify(rest)
    ]);

    const userRes = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [info.rows[0].id]
    );

    res.json({
      token: sign({ uid: userRes.rows[0].id }, '30d'),
      user: publicUser(userRes.rows[0])
    });
  } catch (e) {
    if (e.code === '23505') {
      throw httpErr(409, 'An account with this email already exists.');
    }

    throw e;
  }
}));

app.post('/api/auth/login', formOnly, wrap(async (req, res) => {
  if (limited(req)) {
    throw httpErr(429, 'Too many attempts. Try again in 15 minutes.');
  }

  const { email, password } = req.body || {};

  const userRes = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [String(email || '').trim()]
  );

  const user = userRes.rows[0];

  if (!user || !bcrypt.compareSync(String(password || ''), user.password_hash)) {
    throw httpErr(401, 'Wrong email or password.');
  }

  res.json({
    token: sign({ uid: user.id }, '30d'),
    user: publicUser(user)
  });
}));

app.get('/api/auth/me', requireUser, wrap(async (req, res) => {
  const userRes = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [req.uid]
  );

  if (userRes.rows.length === 0) {
    throw httpErr(401, 'Account not found.');
  }

  res.json({ user: publicUser(userRes.rows[0]) });
}));

// ---------- Store Catalogue Routes ----------
app.get('/api/config', wrap(async (req, res) => {
  const s = await getSettings();

  res.json({
    whatsapp: s.whatsapp,
    ordersEmail: s.orders_email
  });
}));

app.get('/api/categories', wrap(async (req, res) => {
  const catRes = await pool.query(
    'SELECT slug, key FROM categories ORDER BY sort_order'
  );

  res.json(catRes.rows);
}));

app.get('/api/products', wrap(async (req, res) => {
  const c = req.query.category;

  const q = c
    ? await pool.query(
        'SELECT * FROM products WHERE published = 1 AND category = $1 ORDER BY sort_order',
        [c]
      )
    : await pool.query(
        'SELECT * FROM products WHERE published = 1 ORDER BY sort_order'
      );

  res.json(q.rows.map(rowToProduct));
}));

app.get('/api/products/:slug', wrap(async (req, res) => {
  const r = await pool.query(
    'SELECT * FROM products WHERE slug = $1 AND published = 1',
    [req.params.slug]
  );

  if (r.rows.length === 0) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  res.json(rowToProduct(r.rows[0]));
}));

// ---------- Requests Processing Routes ----------
app.post('/api/requests', upload.any(), wrap(async (req, res) => {
  const fields = { ...(req.body || {}) };
  const kind = String(fields.kind || 'general').slice(0, 40);

  delete fields.kind;

  const raw = fields.cart ?? fields.items;

  if (raw !== undefined) {
    const items = await enrichCart(raw);

    delete fields.cart;

    if (items) {
      fields.items = items;
    } else {
      fields.items_raw = raw;
    }
  }

  const tok = readToken(req);
  const uid = tok && tok.uid ? tok.uid : null;
  let email = fields.email || null;

  if (!email && uid) {
    const uRes = await pool.query(
      'SELECT email FROM users WHERE id = $1',
      [uid]
    );

    email = uRes.rows[0]?.email || null;
  }

  const files = (req.files || []).map(f => ({
    field: f.fieldname,
    name: f.originalname,
    stored: f.filename,
    size: f.size,
    type: f.mimetype
  }));

  const info = await pool.query(
    'INSERT INTO requests (kind, user_id, email, fields, files) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [kind, uid, email, JSON.stringify(fields), JSON.stringify(files)]
  );

  res.json({ success: true, id: info.rows[0].id });
}));

app.get('/api/requests/mine', requireUser, wrap(async (req, res) => {
  const u = await pool.query(
    'SELECT email FROM users WHERE id = $1',
    [req.uid]
  );

  const userEmail = u.rows[0]?.email || '';

  const rows = await pool.query(
    'SELECT * FROM requests WHERE user_id = $1 OR (email IS NOT NULL AND email = $2) ORDER BY created_at DESC',
    [req.uid, userEmail]
  );

  res.json(rows.rows.map(r => ({
    id: r.id,
    kind: r.kind,
    status: r.status,
    created_at: r.created_at,
    updated_at: r.updated_at,
    note: r.admin_note,
    ...JSON.parse(r.fields || '{}')
  })));
}));

// ---------- Administrative Operational Routes ----------
app.post('/api/admin/login', formOnly, wrap((req, res) => {
  if (limited(req)) {
    throw httpErr(429, 'Too many attempts. Try again in 15 minutes.');
  }

  if (!sameSecret(req.body?.password || '', ADMIN_PASSWORD)) {
    throw httpErr(401, 'Wrong admin password.');
  }

  res.json({ token: sign({ role: 'admin' }, '12h') });
}));

app.get('/api/admin/dashboard', requireAdmin, wrap(async (req, res) => {
  const prodRes = await pool.query(
    'SELECT * FROM products ORDER BY sort_order'
  );

  const reqRes = await pool.query(
    'SELECT * FROM requests ORDER BY created_at DESC'
  );

  const catRes = await pool.query(
    'SELECT slug, key FROM categories ORDER BY sort_order'
  );

  const settings = await getSettings();

  res.json({
    products: prodRes.rows.map(r => ({
      ...rowToProduct(r),
      published: !!r.published,
      sort_order: r.sort_order
    })),
    requests: reqRes.rows.map(r => ({
      id: r.id,
      kind: r.kind,
      status: r.status,
      user_id: r.user_id,
      email: r.email,
      fields: JSON.parse(r.fields || '{}'),
      files: JSON.parse(r.files || '{}'),
      admin_note: r.admin_note,
      created_at: r.created_at,
      updated_at: r.updated_at
    })),
    categories: catRes.rows,
    settings
  });
}));

app.post('/api/admin/products', requireAdmin, wrap(async (req, res) => {
  const p = req.body || {};
  const fallbackSlug = (p.brand || '') + '-' + (p.model || '');
  const slug = slugify(p.slug || fallbackSlug);

  if (!slug || !p.brand || !p.model || !p.category) {
    throw httpErr(400, 'Slug, brand, model and category are required.');
  }

  const catCheck = await pool.query(
    'SELECT 1 FROM categories WHERE slug = $1',
    [p.category]
  );

  if (catCheck.rowCount === 0) {
    throw httpErr(400, 'Unknown category.');
  }

  const slugCheck = await pool.query(
    'SELECT 1 FROM products WHERE slug = $1',
    [slug]
  );

  if (slugCheck.rowCount > 0) {
    throw httpErr(409, 'Slug already exists.');
  }

  const { published, sort_order, ...data } = p;
  data.slug = slug;

  await pool.query(
    'INSERT INTO products (slug, category, published, sort_order, data) VALUES ($1, $2, $3, $4, $5)',
    [
      slug,
      p.category,
      published === false ? 0 : 1,
      Number(sort_order) || 0,
      JSON.stringify(data)
    ]
  );

  res.status(201).json({ slug });
}));

app.put('/api/admin/products/:slug', requireAdmin, wrap(async (req, res) => {
  const oldCheck = await pool.query(
    'SELECT * FROM products WHERE slug = $1',
    [req.params.slug]
  );

  if (oldCheck.rowCount === 0) {
    throw httpErr(404, 'Product not found.');
  }

  const p = req.body || {};
  const fallbackSlug = (p.brand || '') + '-' + (p.model || '');
  const slug = slugify(p.slug || fallbackSlug);
  const { published, sort_order, ...data } = p;

  data.slug = slug;

  await pool.query(
    'UPDATE products SET slug = $1, category = $2, published = $3, sort_order = $4, data = $5, updated_at = CURRENT_TIMESTAMP WHERE slug = $6',
    [
      slug,
      p.category,
      published === false ? 0 : 1,
      Number(sort_order) || 0,
      JSON.stringify(data),
      req.params.slug
    ]
  );

  res.json({ slug });
}));

app.delete('/api/admin/products/:slug', requireAdmin, wrap(async (req, res) => {
  const info = await pool.query(
    'DELETE FROM products WHERE slug = $1',
    [req.params.slug]
  );

  if (info.rowCount === 0) {
    throw httpErr(404, 'Product not found.');
  }

  res.json({ success: true });
}));

app.put('/api/admin/settings', requireAdmin, wrap(async (req, res) => {
  const { whatsapp, orders_email } = req.body || {};

  if (!/^\+?[0-9]{8,18}$/.test(String(whatsapp || ''))) {
    throw httpErr(400, 'Enter a valid WhatsApp number (digits only).');
  }

  if (!/^\S+@\S+.\S+$/.test(String(orders_email || ''))) {
    throw httpErr(400, 'Enter a valid orders email.');
  }

  await pool.query(
    'UPDATE settings SET value = $1 WHERE key = $2',
    [whatsapp, 'whatsapp']
  );

  await pool.query(
    'UPDATE settings SET value = $1 WHERE key = $2',
    [orders_email, 'orders_email']
  );

  res.json({ success: true });
}));

app.patch('/api/admin/requests/:id', requireAdmin, wrap(async (req, res) => {
  const { status, admin_note } = req.body || {};

  const info = await pool.query(
    'UPDATE requests SET status = $1, admin_note = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
    [
      status,
      String(admin_note || '').slice(0, 5000),
      req.params.id
    ]
  );

  if (info.rowCount === 0) {
    throw httpErr(404, 'Request not found.');
  }

  res.json({ success: true });
}));

// ---------- Frontend live seeding ----------
app.get(['/data.js', '/js/data.js'], wrap(async (req, res) => {
  const s = await getSettings();

  const prodRes = await pool.query(
    'SELECT * FROM products WHERE published = 1 ORDER BY sort_order'
  );

  const activeProducts = prodRes.rows.map(rowToProduct);

  const scriptContent =
    'var ORT_WHATSAPP = ' + JSON.stringify(s.whatsapp) + ';\n' +
    'var ORT_ORDERS_EMAIL = ' + JSON.stringify(s.orders_email) + ';\n' +
    'var ORT_PRODUCTS = ' + JSON.stringify(activeProducts) + ';\n' +
    'var ORT_CATEGORIES = ["complete", "panels", "inverters", "batteries", "controllers"].map(function(c){ return {slug: c, key: c}; });\n' +
    ';(function(){\n' +
    '  try { if (window.fetch && !window.__ortCart) { window.__ortCart = 1; var f0 = window.fetch;\n' +
    '    window.fetch = function (u, o) { try {\n' +
    '      if (String(u).indexOf("/api/requests") !== -1 && o && o.body instanceof FormData && o.body.get("kind") === "order" && !o.body.has("cart")) {\n' +
    '        for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i);\n' +
    '          if (/cart/i.test(k)) { o.body.append("cart", localStorage.getItem(k)); break; } } }\n' +
    '    } catch (e) {} return f0.apply(this, arguments); }; } } catch (e) {}\n' +
    '})();\n';

  res.type('application/javascript');
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  res.send(scriptContent);
}));

app.use(express.static(__dirname));
app.use('/js', express.static(__dirname));
app.use('/css', express.static(__dirname));

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api') || req.url.includes('.')) {
    return next();
  }

  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Server started successfully on port ' + PORT);
});
