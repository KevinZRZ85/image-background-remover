# API Documentation

## Remove Background from Image

Removes background from an uploaded image or URL.

**Endpoint:** `POST /`

### Request

```json
{
  "imageUrl": "https://example.com/photo.jpg"
}
```

Or upload directly:

```bash
curl -X POST https://your-worker.workers.dev \
  -F "image=@photo.jpg"
```

### Response

```json
{
  "success": true,
  "resultUrl": "https://result.remove.bg/xxx.png",
  "creditsRemaining": 45
}
```

### Error Responses

```json
{
  "success": false,
  "error": "No image provided"
}
```

## Rate Limits

- Free tier: 50 requests/month
- Paid: 500 requests/month ($0.009/call)

## Pricing

See [remove.bg pricing](https://www.remove.bg/pricing) for details.
