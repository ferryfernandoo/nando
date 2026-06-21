$apiKey = 'sk-tm-hy6dAKg1BXKDpBz0OmQgEa8Rd9brxNje12zDsIbzci9zdj3S'

# Try different model names for image generation
$models = @(
    'dall-e-3',
    'gpt-4-vision',
    'flux',
    'flux-pro',
    'qwen-image-generate',
    'qwen-vl',
    'stable-diffusion-xl',
    'sd-xl'
)

foreach ($model in $models) {
    Write-Host "`n🧪 Testing model: $model" -ForegroundColor Yellow
    
    $headers = @{
        'Authorization' = "Bearer $apiKey"
        'Content-Type' = 'application/json'
    }
    
    $body = @{
        model = $model
        prompt = 'a beautiful sunset'
        n = 1
        size = '1024x1024'
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri 'https://api.tokenmix.ai/v1/images/generations' `
            -Method POST `
            -Headers $headers `
            -Body $body `
            -TimeoutSec 10 `
            -ErrorAction Stop
        
        Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "Response: $($content | ConvertTo-Json)" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        $errorBody = $_.Exception.Response.Content.ReadAsStream() | ForEach-Object {
            [System.Text.Encoding]::UTF8.GetString($_)
        }
        Write-Host "❌ Status: $statusCode" -ForegroundColor Red
        
        $errorJson = $errorBody | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorJson) {
            Write-Host "Error: $($errorJson.error.message)" -ForegroundColor Red
        } else {
            Write-Host "Error: $errorBody" -ForegroundColor Red
        }
    }
    
    Start-Sleep -Seconds 1
}
