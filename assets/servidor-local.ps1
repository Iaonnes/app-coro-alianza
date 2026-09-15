$Puerto = 5500
$Carpeta = Split-Path -Parent $MyInvocation.MyCommand.Path

$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add("http://localhost:$Puerto/")
$Listener.Start()

Write-Host ""
Write-Host "======================================="
Write-Host " AppCorus DEV"
Write-Host " http://localhost:$Puerto/"
Write-Host "======================================="
Write-Host ""
Write-Host "Servidor iniciado. No cierres esta ventana."

while ($Listener.IsListening) {

    $Contexto = $Listener.GetContext()

    $Ruta = $Contexto.Request.Url.AbsolutePath.TrimStart("/")

    if ([string]::IsNullOrWhiteSpace($Ruta)) {
        $Ruta = "index.html"
    }

    $Ruta = [Uri]::UnescapeDataString($Ruta)

    $Archivo = Join-Path $Carpeta $Ruta

    if (Test-Path $Archivo -PathType Leaf) {

        $Extension = [IO.Path]::GetExtension($Archivo).ToLower()

        $Tipos = @{
            ".html" = "text/html; charset=utf-8"
            ".js"   = "application/javascript; charset=utf-8"
            ".css"  = "text/css; charset=utf-8"
            ".json" = "application/json; charset=utf-8"
            ".png"  = "image/png"
            ".jpg"  = "image/jpeg"
            ".jpeg" = "image/jpeg"
            ".svg"  = "image/svg+xml"
            ".ico"  = "image/x-icon"
        }

        $Tipo =
            if ($Tipos.ContainsKey($Extension)) {
                $Tipos[$Extension]
            }
            else {
                "application/octet-stream"
            }

        $Contenido = [IO.File]::ReadAllBytes($Archivo)

        $Contexto.Response.StatusCode = 200
        $Contexto.Response.ContentType = $Tipo
        $Contexto.Response.ContentLength64 = $Contenido.Length

        $Contexto.Response.OutputStream.Write(
            $Contenido,
            0,
            $Contenido.Length
        )

    }
    else {

        $Mensaje =
            [Text.Encoding]::UTF8.GetBytes(
                "404 - Archivo no encontrado"
            )

        $Contexto.Response.StatusCode = 404
        $Contexto.Response.ContentType =
            "text/plain; charset=utf-8"

        $Contexto.Response.OutputStream.Write(
            $Mensaje,
            0,
            $Mensaje.Length
        )
    }

    $Contexto.Response.OutputStream.Close()
}