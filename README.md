# ORT website backend and admin

This Node.js + Express server serves the existing `frontend/` site, exposes its `/api` endpoints, stores accounts/products/requests in SQLite, and provides a product-and-order admin page at `/admin`. No online payments are processed. **An order is recorded in the admin panel; this server does not send WhatsApp messages or emails by itself.**

## Folder layout

Place the downloaded files like this (keep `admin.html` beside `server.js`):

```text
project/
├── frontend/                  existing website from the GitHub repository
└── backend/
    ├── package.json
    ├── server.js
    ├── admin.html
    └── .env                     copied from .env.example
```

## Start locally

Install Node.js 20 or newer. In a terminal, inside `backend/`:

```sh
cp .env.example .env
```

Edit `.env`: replace `ADMIN_PASSWORD` with your own long password and `JWT_SECRET` with a random string of at least 32 characters. Keep `.env` private; never commit it to GitHub. Then run:

```sh
npm install
npm start
```

Open `http://localhost:3000` for the website, and `http://localhost:3000/admin` for the admin page. Sign in with the `ADMIN_PASSWORD` you chose. The SQLite database is created automatically at `backend/data/ort.db`; products are imported from `frontend/js/data.js` only when the product table is empty. Settings and catalogue edits made in admin are then stored in SQLite.

## Hosting and domain

Use a host that runs a persistent Node.js process and supplies **persistent disk storage** for `DATA_DIR` (SQLite and uploaded request files). Set `ADMIN_PASSWORD`, `JWT_SECRET`, `FRONTEND_DIR`, and `DATA_DIR` as host environment variables, install with `npm install`, and start with `npm start`. Point your domain's DNS to that host according to its instructions and enable HTTPS. Do not deploy on an ephemeral filesystem without persistent disk: products, users, requests, and uploads would be lost on restart or redeploy. Back up the `data/` directory regularly. Do not expose `.env` or `data/` as public static files.

## Important checks before launch

- Check that the frontend has every script it references. `frontend/js/catalogue.js` appeared unavailable at the repository path checked during development; a missing script can break catalogue behavior independently of the backend.
- Visit the storefront and submit a test registration, order and contact request; verify each appears in `/admin`. Check checkout's WhatsApp/email handoff on the actual frontend too.
- Admin upload links carry a temporary admin token in the URL; avoid sharing those links, and close the admin tab when finished.
- This is an implementation package, not a tested live deployment; the domain and hosting have not been configured here.
