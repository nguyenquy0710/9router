# FPTCloud Provider Integration Plan

## Overview
Add FPTCloud (fptc) as a new API key provider to 9Router. FPTCloud API is OpenAI-compatible with endpoint `https://mkp-api.fptcloud.com/v1/chat/completions`.

## Provider Details
- **Provider ID**: `fptc`
- **API Endpoint**: `https://mkp-api.fptcloud.com/v1/chat/completions`
- **Format**: OpenAI-compatible
- **Authentication**: Bearer token (API key)
- **Available Model**: `gpt-oss-20b`

## Implementation Steps

### Step 1: Add Provider Configuration
**File**: `open-sse/config/providers.js`

Add FPTCloud to the PROVIDERS object:
```javascript
fptc: {
  baseUrl: "https://mkp-api.fptcloud.com/v1/chat/completions",
  format: "openai"
}
```

### Step 2: Add Provider Metadata
**File**: `src/shared/constants/providers.js`

Add to APIKEY_PROVIDERS object:
```javascript
fptc: { 
  id: "fptc", 
  alias: "fptc", 
  name: "FPTCloud", 
  icon: "cloud", 
  color: "#E2001A",
  textIcon: "FP", 
  website: "https://fptcloud.com",
  serviceKinds: ["llm"]
}
```

### Step 3: Add Provider Models
**File**: `open-sse/config/providerModels.js`

Add to PROVIDER_MODELS object:
```javascript
fptc: [
  { id: "gpt-oss-20b", name: "GPT OSS 20B" }
]
```

## Verification
1. Start dev server: `$env:PORT="20128"; $env:NEXT_PUBLIC_BASE_URL="http://localhost:20128"; npm run dev`
2. Open dashboard at `http://localhost:20128/dashboard`
3. Verify FPTCloud appears in API Key Providers section
4. Test API endpoint: `POST http://localhost:20128/v1/chat/completions` with model `fptc/gpt-oss-20b`

## Notes
- FPTCloud uses standard OpenAI format, so `DefaultExecutor` handles requests automatically
- No custom executor needed
- Color `#E2001A` matches FPT brand red
