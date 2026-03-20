/**
 * Image Background Remover - Cloudflare Worker
 * Uses Remove.bg API
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle OPTIONS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Serve static HTML for root
    if (url.pathname === "/" && request.method === "GET") {
      return new Response(HTML, {
        headers: { "Content-Type": "text/html", ...corsHeaders },
      });
    }

    // API: Remove background
    if (url.pathname === "/api/remove" && request.method === "POST") {
      try {
        const formData = await request.formData();
        const image = formData.get("image");
        const imageUrl = formData.get("imageUrl");

        if (!image && !imageUrl) {
          return jsonResponse({ success: false, error: "No image provided" }, corsHeaders);
        }

        // Call Remove.bg API
        const apiKey = env.REMOVE_BG_API_KEY;
        if (!apiKey) {
          return jsonResponse({ success: false, error: "API not configured" }, corsHeaders);
        }

        const apiFormData = new FormData();
        if (image) {
          apiFormData.append("image_file", image);
        } else if (imageUrl) {
          apiFormData.append("image_url", imageUrl);
        }
        apiFormData.append("size", "auto");

        const apiResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
          method: "POST",
          headers: { "X-Api-Key": apiKey },
          body: apiFormData,
        });

        if (!apiResponse.ok) {
          const error = await apiResponse.text();
          return jsonResponse({ success: false, error: "Remove.bg API error", details: error }, corsHeaders);
        }

        // Return the processed image
        const resultBuffer = await apiResponse.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(resultBuffer)));

        return jsonResponse({
          success: true,
          resultUrl: `data:image/png;base64,${base64}`,
        }, corsHeaders);

      } catch (e) {
        return jsonResponse({ success: false, error: e.message }, corsHeaders);
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};

function jsonResponse(data, corsHeaders) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

const HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Image Background Remover</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 { text-align: center; margin-bottom: 8px; color: #333; }
    .subtitle { text-align: center; color: #666; margin-bottom: 24px; }
    
    .upload-area {
      border: 2px dashed #ddd;
      border-radius: 12px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 20px;
    }
    .upload-area:hover { border-color: #667eea; background: #f8f9ff; }
    .upload-area.dragover { border-color: #667eea; background: #f0f3ff; }
    
    .upload-icon { font-size: 48px; margin-bottom: 12px; }
    .upload-text { color: #666; }
    .upload-text strong { color: #667eea; }
    
    #fileInput { display: none; }
    #urlInput {
      width: 100%;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 12px;
    }
    
    .btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .btn:hover { transform: translateY(-2px); }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .result {
      margin-top: 24px;
      text-align: center;
    }
    .result img {
      max-width: 100%;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .download-btn {
      display: inline-block;
      margin-top: 12px;
      padding: 10px 24px;
      background: #10b981;
      color: white;
      text-decoration: none;
      border-radius: 6px;
    }
    
    .loading {
      display: none;
      text-align: center;
      padding: 20px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 12px;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    
    .error {
      background: #fee;
      color: #c00;
      padding: 12px;
      border-radius: 8px;
      margin-top: 12px;
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🖼️ Remove Background</h1>
    <p class="subtitle">AI-powered background removal</p>
    
    <div class="upload-area" id="dropZone">
      <div class="upload-icon">📁</div>
      <p class="upload-text">Drag & drop image here<br>or <strong>click to browse</strong></p>
    </div>
    <input type="file" id="fileInput" accept="image/*">
    
    <p style="text-align: center; color: #999; margin: 12px 0;">— OR —</p>
    
    <input type="text" id="urlInput" placeholder="Paste image URL here...">
    
    <button class="btn" id="removeBtn" onclick="processImage()">Remove Background</button>
    
    <div class="loading" id="loading">
      <div class="spinner"></div>
      <p>Processing... ⏳</p>
    </div>
    
    <div class="error" id="error"></div>
    
    <div class="result" id="result"></div>
  </div>

  <script>
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const urlInput = document.getElementById('urlInput');
    const removeBtn = document.getElementById('removeBtn');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const result = document.getElementById('result');

    // Click to upload
    dropZone.onclick = () => fileInput.click();
    
    // Drag & drop
    dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('dragover'); };
    dropZone.ondragleave = () => dropZone.classList.remove('dragover');
    dropZone.ondrop = (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files[0]) {
        fileInput.files = e.dataTransfer.files;
      }
    };

    async function processImage() {
      const file = fileInput.files[0];
      const imageUrl = urlInput.value.trim();
      
      if (!file && !imageUrl) {
        showError('Please upload an image or enter a URL');
        return;
      }

      removeBtn.disabled = true;
      loading.style.display = 'block';
      error.style.display = 'none';
      result.innerHTML = '';

      const formData = new FormData();
      if (file) {
        formData.append('image', file);
      } else {
        formData.append('imageUrl', imageUrl);
      }

      try {
        const res = await fetch('/api/remove', {
          method: 'POST',
          body: formData,
        });
        
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to process image');
        }

        result.innerHTML = \`
          <img src="\${data.resultUrl}" alt="Result">
          <br>
          <a href="\${data.resultUrl}" download="removed-bg.png" class="download-btn">Download</a>
        \`;
      } catch (e) {
        showError(e.message);
      } finally {
        removeBtn.disabled = false;
        loading.style.display = 'none';
      }
    }

    function showError(msg) {
      error.textContent = msg;
      error.style.display = 'block';
    }
  </script>
</body>
</html>
`;
