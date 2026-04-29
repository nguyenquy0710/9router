# Project Rules
- Use TypeScript
- API logic belongs in `/api` (Next.js App Router API routes)

# Key Commands
- Dev server (env vars required to avoid port/URL misconfiguration):
  - POSIX: `PORT=20128 NEXT_PUBLIC_BASE_URL=http://localhost:20128 npm run dev`
  - Windows (PowerShell): `$env:PORT="20128"; $env:NEXT_PUBLIC_BASE_URL="http://localhost:20128"; npm run dev`
- Production: `npm run build && PORT=20128 HOSTNAME=0.0.0.0 NEXT_PUBLIC_BASE_URL=http://localhost:20128 npm run start`

# Storage
- App DB: `$DATA_DIR/db.json` (default: `~/.9router`, Windows: `%APPDATA%\.9router`)
- Usage data: `~/.9router/usage.json`; request logs in `logs/` (enable via `ENABLE_REQUEST_LOGS=true`)

# Environment Notes
- Change `JWT_SECRET`/`API_KEY_SECRET` from defaults in production
- `INITIAL_PASSWORD` defaults to `123456` if unset

# Docker
- `.env` excluded from image (`.dockerignore`), inject via `--env-file`
- Full setup, provider, and deployment details: see `README.md`
