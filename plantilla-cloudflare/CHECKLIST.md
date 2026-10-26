# Checklist de Despliegue

Usa esta lista para asegurarte de no olvidar ningún paso:

## Preparación
- [ ] Node.js instalado (v18+)
- [ ] Cuenta de Cloudflare creada
- [ ] Archivos del frontend listos en carpeta `public/`

## Configuración Inicial
- [ ] Ejecutar `npm install`
- [ ] Ejecutar `npx wrangler login`
- [ ] Ejecutar `npx wrangler d1 create mi-tienda-db`
- [ ] Copiar `database_id` en `wrangler.toml`
- [ ] Cambiar `JWT_SECRET` en `wrangler.toml`
- [ ] Modificar `schema.sql` con tus categorías y productos

## Base de Datos
- [ ] Ejecutar `npx wrangler d1 execute mi-tienda-db --file=./schema.sql --remote`
- [ ] Verificar: `npx wrangler d1 execute mi-tienda-db --remote --command="SELECT * FROM users;"`

## Backend (Worker)
- [ ] Ejecutar `npx wrangler deploy`
- [ ] Anotar URL del worker: `https://_________.workers.dev`
- [ ] Probar endpoint: visitar `https://tu-worker.workers.dev/api/products`

## Frontend
- [ ] Actualizar `API_URL` en `script.js` con la URL del worker
- [ ] Ejecutar `npx wrangler pages deploy public --project-name=mi-tienda`
- [ ] Anotar URL de Pages: `https://_________.pages.dev`

## Pruebas Finales
- [ ] Abrir la URL de Pages en el navegador
- [ ] Probar registro de usuario nuevo
- [ ] Probar login con usuario nuevo
- [ ] Probar login con admin (admin@mitienda.com / admin123)
- [ ] Verificar que productos se muestran
- [ ] Probar agregar producto al carrito
- [ ] Probar crear un pedido
- [ ] Verificar pedidos en panel admin

## Problemas Comunes

### "API_URL has already been declared"
No declares `const API_URL` dos veces. Si está en `script.js`, no la declares de nuevo en otros scripts.

### Login no funciona / no pasa nada
1. Abre la consola del navegador (F12 > Console)
2. Busca errores en rojo
3. Verifica que `API_URL` apunte al worker correcto

### Error de CORS
Verifica que el worker tenga los headers CORS correctos (ya incluidos en el template).

### Contraseña incorrecta
El hash debe coincidir. Regenera con:
```bash
node -e "console.log(require('crypto').createHash('sha256').update('TU_PASSWORD').digest('base64'))"
```
