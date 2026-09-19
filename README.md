# TCG Tracker

Browser-only master set tracker (Vite + React). Card data loads from checklist spreadsheets; imports and status live in `localStorage`.

## Local development

```bash
npm install
npm run dev
```

## Deploy to Cloudflare Pages

1. Push this repo to GitHub (or GitLab).
2. In [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Select the repository and use these settings:

   | Setting | Value |
   | -------- | ----- |
   | Production branch | `main` (or your default branch) |
   | Framework preset | **Vite** (or None) |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | `/` (leave empty) |

4. Under **Environment variables** (Production), add optional:

   | Variable | Value |
   | -------- | ----- |
   | `NODE_VERSION` | `20` |

   (Also set for Preview if you use preview deployments.)

5. Save and deploy. Cloudflare runs `npm ci` / `npm install` and `npm run build` on each push.

6. Open the `*.pages.dev` URL. Direct links like `/sets/151` work via `public/_redirects` (SPA fallback).

### Custom domain (optional)

Pages project → **Custom domains** → add your domain and follow DNS instructions.

### Manual deploy (optional)

```bash
npm run build
npx wrangler pages deploy dist --project-name=tcg-tracker
```

Requires [Wrangler](https://developers.cloudflare.com/workers/wrangler/) logged in (`npx wrangler login`).
