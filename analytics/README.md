# Visitas de Aura Digital

El panel del editor solo muestra visitas a `auradigitaljal.com` y `www.auradigitaljal.com`.
Los valores de **hoy, 7 días y 30 días** se actualizan con GitHub Actions aproximadamente cada 15 minutos (GitHub puede retrasar las ejecuciones programadas).
La zona horaria utilizada es America/Mexico_City. No se registran personas ni información privada.

## Para activar cifras reales
En el repositorio `AuraDigitalJal/AuraWebStudio`, ir a **Settings > Secrets and variables > Actions > New repository secret** y crear:
- `CF_ANALYTICS_TOKEN`: un API token de Cloudflare con permiso **Account / Analytics / Read**, limitado a la cuenta correspondiente.
- `CF_ACCOUNT_ID`: ID de esa cuenta de Cloudflare.

El botón **Actualizar** del editor puede solicitar una lectura nueva mediante GitHub Actions cuando el editor está conectado a GitHub y el token tiene permiso **Actions: write** o **Contents: write** sobre el repositorio AuraWebStudio. Sin esa conexión, el editor solamente consulta el último reporte publicado y explica la limitación.

Para actualizar manualmente también puedes abrir **Actions > Aura Digital - Actualizar visitas Cloudflare > Run workflow**.
El archivo `analytics/visitas.json` aparece automáticamente después del primer trabajo exitoso.
Nunca pegar el token en `admin.js`, `admin.html`, el HTML público ni este README.
