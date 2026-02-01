# Save TG — Frontend

React + Vite frontend for **Save TG** (Telegram media saver). Users sign in, connect Telegram via API credentials, and browse/save media from chats.

## Live

- **Frontend:** [https://tgm-save.vercel.app](https://tgm-save.vercel.app)
- **Backend API:** [https://tele-clone-backend.onrender.com](https://tele-clone-backend.onrender.com)

## Tech stack

- **React 18** + **TypeScript**
- **Vite 5**
- **Tailwind CSS**
- **React Router 7**
- **TanStack Virtual** (virtualized lists)

## Prerequisites

- Node.js 18+
- Backend running (local or [Render](https://tele-clone-backend.onrender.com))

## Getting started

```bash
# Clone the repo
git clone <repo-url>
cd tele-clone-frontend

# Install dependencies (client only)
cd client
npm install

# Create client/.env with VITE_API_URL, VITE_WS_URL, etc. (see Environment variables below)

# Run dev server
npm run dev
```

App runs at **http://localhost:5173**. The Vite dev server proxies `/api` and `/downloads` to the backend (default `http://localhost:3001`).

## Environment variables

Create `client/.env`. All client vars must be prefixed with `VITE_`.

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3001` (dev) / `https://tele-clone-backend.onrender.com` (prod) |
| `VITE_WS_URL` | Backend WebSocket URL | `ws://localhost:3001` (dev) / `wss://tele-clone-backend.onrender.com` (prod) |
| `VITE_TELEGRAM_HELP_BOT_USERNAME` | Telegram help bot (e.g. @BotFather) | `@TGM_Save_bot` |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (captcha) | From [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) |

Production builds use `client/.env.production` when you run `npm run build`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Vite) |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |

## Deployment

- **Vercel (frontend):** See [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) for quick steps.
- **Full stack (backend + frontend):** See [DEPLOYMENT.md](DEPLOYMENT.md).

Set **Root Directory** to `client` when deploying this repo to Vercel, and add `VITE_API_URL` and `VITE_WS_URL` (and optional Turnstile/Telegram vars) in the Vercel project environment variables.

## Project structure

```
tele-clone-frontend/
├── client/                 # React app (deploy this to Vercel)
│   ├── src/
│   │   ├── components/     # Auth, chat, common, layout
│   │   ├── contexts/       # App, Auth, Telegram
│   │   ├── hooks/          # Admin, notifications, PRO request
│   │   ├── pages/          # Login, Welcome
│   │   ├── services/       # API, auth, downloads, admin
│   │   └── types/          # TypeScript types
│   ├── .env                # Local env (not committed)
│   ├── .env.production     # Production env for build
│   ├── vite.config.ts
│   └── package.json
├── DEPLOYMENT.md           # Backend + frontend deployment
├── VERCEL_DEPLOY.md        # Vercel-only quick guide
└── README.md               # This file
```

## License

Private / unlicensed unless stated otherwise.
