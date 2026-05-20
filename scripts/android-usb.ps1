# Conecta el teléfono por USB y reenvía el puerto de Metro al dispositivo.
# Uso: npm run dev:android
adb reverse tcp:8081 tcp:8081
if ($LASTEXITCODE -ne 0) {
  Write-Error "adb no encontró un dispositivo. Activa depuración USB y acepta la autorización."
  exit 1
}
Write-Host "Puerto 8081 reenviado. Iniciando Expo en modo localhost..."
npx expo start --localhost
