# Image Background Remover

A simple, fast, and free image background removal tool.

## 🚀 Quick Start

### Prerequisites
- Cloudflare Account
- Remove.bg API Key (free 50 calls/month)

### Deployment

1. **Get Remove.bg API Key**
   - Sign up at [remove.bg](https://www.remove.bg/api)
   - Copy your API key

2. **Deploy to Cloudflare Workers**
   ```bash
   # Install Wrangler
   npm install -g wrangler

   # Clone and deploy
   wrangler deploy
   ```

3. **Configure API Key**
   ```bash
   wrangler secret put REMOVE_BG_API_KEY
   # Enter your API key when prompted
   ```

### Usage

Upload an image and get background removed!

## 📖 API Documentation

See [API.md](./API.md) for full API reference.

## 🛠️ Tech Stack

- **Runtime**: Cloudflare Workers
- **AI**: Remove.bg API
- **Frontend**: HTML + Tailwind CSS

## 📄 License

MIT
