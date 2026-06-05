# HEYDUDE

Owner-only AI command center for DUDE desktop, Google Drive knowledge, Cloudflare edge chat, and 3000 Studios automation.

## Local

```powershell
npm install
npm run dev
```

## Build

```powershell
npm run build
```

## Cloudflare Pages

```powershell
npx wrangler pages project create heydude --production-branch main
npx wrangler pages deploy dist --project-name heydude
```

The Pages Function at `/api/chat` uses Cloudflare Workers AI when the `AI` binding is available. Protect production with Cloudflare Access and allow only `mr.jwswain@gmail.com`.
