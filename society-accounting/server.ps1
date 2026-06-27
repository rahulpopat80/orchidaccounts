$port = 8080
$root = "C:\Users\ADMIN\.gemini\antigravity\scratch\society-accounting"
$url = "http://localhost:$port/"

# Stop any existing process bound to port 8080
Get-Process -Id (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Create HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)

try {
    $listener.Start()
    Write-Host "=================================================="
    Write-Host "Local web server successfully started!"
    Write-Host "Serving files from: $root"
    Write-Host "URL: $url"
    Write-Host "=================================================="
    
    # Open browser
    Start-Process $url

    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            $rawPath = $request.Url.LocalPath
            if ($rawPath -eq "/") {
                $filePath = Join-Path $root "index.html"
            } else {
                $cleanPath = $rawPath.TrimStart('/')
                $filePath = Join-Path $root $cleanPath
            }
            
            if (Test-Path $filePath -PathType Leaf) {
                # Determine Content-Type
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $mimeType = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".png"  { "image/png" }
                    ".jpg"  { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".gif"  { "image/gif" }
                    ".svg"  { "image/svg+xml" }
                    default { "application/octet-stream" }
                }
                $response.ContentType = $mimeType
                
                # Write file bytes
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found")
                $response.ContentLength64 = $errBytes.Length
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }
            $response.OutputStream.Close()
        } catch {
            # Catch individual request handling errors to keep loop running
            Write-Host "Request handler error: $_"
        }
    }
} catch {
    Write-Host "Server failed to start: $_"
} finally {
    if ($listener) {
        $listener.Close()
    }
}
