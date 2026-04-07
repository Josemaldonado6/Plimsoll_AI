while ($true) {
    Write-Host "`n[BRIDGE] Iniciando Enlace Seguro: plimsoll-official-hub" -ForegroundColor Cyan
    npx --yes localtunnel --port 8000 --subdomain plimsoll-official-hub
    Write-Host "[ALERTA] Enlace Perdido. Reiniciando Puente en 2s..." -ForegroundColor Yellow
    Start-Sleep -s 2
}
