# Image Background Remover

AI-powered tool to remove image backgrounds using Remove.bg API.

## Tech Stack

- **Frontend**: Next.js (App Router) + Tailwind CSS
- **Backend**: Next.js API Routes
- **Deployment**: Cloudflare Pages
- **API**: Remove.bg

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set environment variables

Create a `.env.local` file:

```env
REMOVE_BG_API_KEY=your_remove_bg_api_key
```

Get your API key from [remove.bg](https://www.remove.bg/api).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build

```bash
npm run build
```

## Deployment to Cloudflare Pages

### Option A: Wrangler CLI

```bash
npm install -D wrangler
npx wrangler pages project create
npx wrangler pages deploy
```

Set the `REMOVE_BG_API_KEY` in Cloudflare Pages dashboard → Settings → Environment Variables.

### Option B: GitHub Auto Deploy

1. Push code to GitHub
2. Connect repository in Cloudflare Pages
3. Set environment variables in dashboard
4. Deploy automatically

## Usage

1. Drag & drop an image or paste a URL
2. Click "Remove Background"
3. Download the result with transparent background

## Limits

- Free tier: 50 requests/month (Remove.bg)
- Max file size: 10MB
- Supported formats: JPG, PNG, WebP

## License

MIT