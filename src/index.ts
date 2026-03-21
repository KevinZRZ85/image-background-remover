import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono<{ Bindings: { REMOVE_BG_API_KEY: string } }>()

app.use('/*', cors())

// 健康检查
app.get('/', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'Background Remover API',
    endpoint: '/remove-bg'
  })
})

// 去除背景 API
app.post('/remove-bg', async (c) => {
  const apiKey = c.env.REMOVE_BG_API_KEY
  
  if (!apiKey) {
    return c.json({ success: false, error: 'API key not configured' }, 500)
  }

  const contentType = c.req.header('content-type') || ''
  
  if (!contentType.includes('multipart/form-data')) {
    return c.json({ success: false, error: 'Content-Type must be multipart/form-data' }, 400)
  }

  try {
    const formData = await c.req.formData()
    const imageFile = formData.get('image') as File | null
    
    if (!imageFile) {
      return c.json({ success: false, error: 'No image file provided' }, 400)
    }

    // 检查文件大小 (最大 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      return c.json({ success: false, error: 'File too large (max 10MB)' }, 400)
    }

    // 调用 remove.bg API
    const removeBgFormData = new FormData()
    removeBgFormData.append('image_file', imageFile)
    removeBgFormData.append('size', 'auto')
    removeBgFormData.append('format', 'png')

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: removeBgFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Remove.bg API error:', errorText)
      return c.json({ 
        success: false, 
        error: `Remove.bg API error: ${response.status}` 
      }, response.status)
    }

    // 返回处理后的图片
    const resultBuffer = await response.arrayBuffer()
    const base64 = btoa(
      new Uint8Array(resultBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    )

    return c.json({
      success: true,
      image: `data:image/png;base64,${base64}`,
      creditsUsed: 1
    })

  } catch (error) {
    console.error('Error:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500)
  }
})

export default app
