# CORS Fix for Anthropic API

## Problem
The Anthropic API (and some other AI APIs) don't allow direct browser requests due to CORS (Cross-Origin Resource Sharing) restrictions. This causes the error:
```
Access to XMLHttpRequest at 'https://api.anthropic.com/v1/messages' from origin 'http://localhost:5173' has been blocked by CORS policy
```

## Solution Implemented

### 1. Vite Proxy Configuration
Added proxy configuration in `vite.config.js` to route API calls through the development server:
- `/api/anthropic/*` → `https://api.anthropic.com/*`
- `/api/openai/*` → `https://api.openai.com/*`
- `/api/xai/*` → `https://api.x.ai/*`
- `/api/gemini/*` → `https://generativelanguage.googleapis.com/*`

### 2. Updated AI Service
Modified `src/services/aiService.js` to:
- Use proxy URLs in development mode
- Use direct URLs in production mode
- Improved error messaging

## How to Use

1. **Restart your development server** for the proxy configuration to take effect:
   ```bash
   npm run dev
   ```

2. The app will now automatically use the proxy URLs when running in development mode

3. **For Anthropic API**: Make sure your API key starts with `sk-ant-` (this is the correct format)

4. All AI providers (OpenAI, Anthropic, Grok, Gemini) should now work without CORS issues

## Troubleshooting

### 401 Unauthorized Error
If you get a 401 error:
1. Verify your API key is correct and starts with `sk-ant-` for Anthropic
2. Check the browser console for detailed error information
3. Ensure your API key has the necessary permissions
4. Try regenerating your API key from the Anthropic Console

### Anthropic Security Header
Anthropic requires a special header `anthropic-dangerous-direct-browser-access: true` for direct browser requests. This is automatically included in the configuration.

**⚠️ Security Warning**: Using API keys in browser environments exposes them to users. In production, always use a backend proxy to keep API keys secure.

## Production Deployment

For production, you'll need to implement a backend proxy or use serverless functions to handle API calls, as browsers will still enforce CORS in production. The current solution works for development only.

## Alternative Solutions

If you still encounter issues, you can also:

1. **Use a browser extension** to disable CORS (not recommended for security reasons)
2. **Implement a backend API** to proxy requests
3. **Use serverless functions** (Vercel, Netlify) to handle API calls

The current solution should resolve your immediate development needs.
