AURA DIGITAL · WEB STUDIO v14

Esta versión elimina la restauración a una “versión base” y el selector de repositorios.

PUBLICACIÓN
- Destino fijo: AuraDigitalJal/AuraDigitalJal.github.io
- Rama fija: main
- Archivo: /index.html
- Dominio: https://auradigitaljal.com/
- La app no puede seleccionar ni publicar en invitaciones u otros repositorios.
- CNAME no se modifica.

RESPALDOS
- Descargar respaldo JSON.
- Importar respaldo JSON.
- No existe botón “Restaurar versión base”.
- No existe site-data.js separado; admin.html incluye una copia completa de v14 como respaldo para trabajar sin conexión.

PREVIEW
- El preview espera el estado actual antes de hacerse visible para evitar el destello de una configuración anterior.
- Vista actual y Publicar se generan desde el mismo estado del editor.

ARCHIVOS PRINCIPALES
- admin.html: editor
- admin.js / admin.css: lógica y estilo del editor
- index.html: sitio público autocontenido
- publisher-template.js: generador de la publicación
- app.js / styles.css: lógica y estilos del sitio

INICIO AUTOMÁTICO (ACTUALIZACIÓN)
- Web Studio consulta la última versión publicada de /index.html en AuraDigitalJal/AuraDigitalJal.github.io al abrirse.
- No necesita token de GitHub para consultar el repositorio público.
- No sobrescribe el borrador local al iniciar, que puede recuperarse en Respaldos locales.
- Si no hay conexión, vuelve al último borrador local (o al diseño integrado cuando no existe).
- Para publicar cambios sí es necesario conectarse con el token de GitHub.
