# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

9Router is a local AI routing gateway and OpenAI-compatible proxy with a web dashboard. It routes CLI traffic across multiple AI providers with format translation, multi-model fallback chains (combos), account round-robin, OAuth token refresh, and RTK token compression.

**Private npm package**: `9router-app`. Use source/Docker execution for local dev.

## Development Commands

```bash
# Install dependencies
npm install

# Run in development (hot reload, port 20128)
PORT=20128 NEXT_PUBLIC_BASE_URL=http://localhost:20128 npm run dev

# Build for production
npm run build

# Run production build
PORT=20128 HOSTNAME=0.0.0.0 NEXT_PUBLIC_BASE_URL=http://localhost:20128 npm start

# Docker build
docker build -t 9router .

# Docker run (from repo root with .env file)
docker run -d --name 9router -p 20128:20128 --env-file ./.env \
  -v 9router-data:/app/data -v 9router-usage:/root/.9router 9router
```

## Architecture

### Three-Layer Architecture

```
CLI Tools → /v1/* API Routes (src/app/api/v1/*)
         → Dashboard Routes  (src/app/api/*)
         → SSE Core           (open-sse/ + src/sse/)
         → Executors          (open-sse/executors/*)
         → Upstream Providers
```

**Layer 1 — API Routes** (`src/app/api/*`):
- `/api/v1/*` — OpenAI-compatible endpoints (`chat/completions`, `models`, `messages`, `responses`, `embeddings`, `images/generations`)
- `/api/*` — Dashboard management APIs (auth, providers, combos, keys, usage, sync, OAuth flows)

**Layer 2 — SSE + Routing Core** (`open-sse/` + `src/sse/`):
- `src/sse/handlers/chat.js` — Request parsing, combo iteration, account fallback loop
- `open-sse/handlers/chatCore.js` — Translation orchestration, executor dispatch, retry on 401/403
- `open-sse/executors/` — Provider-specific HTTP + auth adapters (one file per provider)

**Layer 3 — Translation Registry** (`open-sse/translator/`):
- `index.js` — Registry that selects translator pair based on source format + target provider
- `request/*` — Request body conversion (e.g. `openai-to-claude`, `claude-to-openai`, `openai-to-kiro`)
- `response/*` — Response stream normalization back to client's expected format
- `formats.js` — Format constant definitions

### Persistence

- **Main state** (`src/lib/localDb.js`): `${DATA_DIR}/db.json` — providers, combos, aliases, API keys, settings, pricing
- **Usage history** (`src/lib/usageDb.js`): `~/.9router/usage.json` and `~/.9router/log.txt`
- Optional deep logs: `logs/` when `ENABLE_REQUEST_LOGS=true`

### Provider Executors

Each provider in `open-sse/executors/` handles HTTP calls, auth headers, and token refresh for its platform. Most providers use `default.js`. Specialized executors exist for: `antigravity`, `azure`, `codex`, `cursor`, `gemini-cli`, `github`, `grok-web`, `iflow`, `kiro`, `opencode`, `perplexity-web`, `qoder`, `qwen`, `vertex`.

### RTK (Token Saver)

RTK is a CLI tool (separate binary `rtk`) invoked via hook. It compresses `tool_result` content (git diffs, grep output, file listings, etc.) before requests reach the router. The hook transparently wraps commands — no config needed. Verify installation with `rtk gain` and `rtk --version`.

### Cloud Sync

Cloud sync is orchestrated by `src/lib/initCloudSync.js` and `src/shared/services/cloudSyncScheduler.js`. It syncs providers, combos, aliases, and keys to `NEXT_PUBLIC_CLOUD_URL`. The `BASE_URL`/`CLOUD_URL` env vars are preferred over `NEXT_PUBLIC_*` variants for server-side runtime.

## Key File Reference

| Path | Role |
|------|------|
| `src/sse/handlers/chat.js` | Main chat entry, combo/account loop |
| `open-sse/handlers/chatCore.js` | Translation + executor dispatch |
| `open-sse/executors/index.js` | Executor registry |
| `open-sse/translator/index.js` | Translator pair selector |
| `src/lib/localDb.js` | Persistent config store |
| `src/lib/usageDb.js` | Usage tracking store |
| `src/proxy.js` | Express proxy + JWT auth middleware |
| `src/app/api/oauth/[provider]/[action]/route.js` | OAuth + device-code flows |
| `open-sse/config/providers.js` | Provider definitions (auth types, endpoints) |
| `open-sse/config/models.js` | Model catalog with prefixes |
| `open-sse/rtk/` | RTK filter integration |

## Environment Variables (runtime)

| Variable | Default | Role |
|----------|---------|------|
| `JWT_SECRET` | — | JWT signing secret for dashboard cookie auth |
| `INITIAL_PASSWORD` | `123456` | First-login password when no hash exists |
| `DATA_DIR` | `~/.9router` | Location of `db.json` |
| `API_KEY_SECRET` | `endpoint-proxy-api-key-secret` | HMAC secret for generated API keys |
| `MACHINE_ID_SALT` | `endpoint-proxy-salt` | Salt for stable machine ID hash |
| `ENABLE_REQUEST_LOGS` | `false` | Write request logs to `logs/` |
| `BASE_URL` | `http://localhost:20128` | Server-side base URL (preferred) |
| `CLOUD_URL` | `https://9router.com` | Cloud sync endpoint |
| `REQUIRE_API_KEY` | `false` | Enforce Bearer key on `/v1/*` |
| `HTTP_PROXY` / `HTTPS_PROXY` | — | Outbound proxy for upstream calls |

Lowercase proxy variants (`http_proxy`, `https_proxy`, etc.) are also supported.

## Request Flow

```
POST /v1/chat/completions
  → src/app/api/v1/chat/completions/route.js
  → src/sse/handlers/chat.js (parse model, iterate combo)
    → open-sse/handlers/chatCore.js (detect format, translate, dispatch)
      → open-sse/executors/[provider].js (HTTP call + auth)
        → Upstream provider (SSE/JSON response)
      ← open-sse/translator/response/*.js (normalize stream)
    ← src/lib/usageDb.js (record usage)
  → Client receives SSE stream
```

## Adding a New Provider

1. Add provider config in `open-sse/config/providers.js` and `open-sse/config/models.js`
2. Create executor in `open-sse/executors/` (or use `default.js` for standard OpenAI-compatible providers)
3. Add request/response translators in `open-sse/translator/request/` and `open-sse/translator/response/` if format differs from OpenAI
4. Register translator pair in `open-sse/translator/index.js`
5. Add OAuth/device-code handlers in `src/app/api/oauth/[provider]/` if applicable
6. Wire CLI config writer in `src/app/api/cli-tools/` if needed
