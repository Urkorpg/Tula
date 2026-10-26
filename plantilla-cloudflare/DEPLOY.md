# Guía de Despliegue en Cloudflare

## Desplegar el Backend (Worker)

```bash
npx wrangler deploy
```

Esto te dará una URL como:
```
https://mi-tienda-api.tu-usuario.workers.dev
```

**Guarda esta URL** - la necesitarás para el frontend.

## Desplegar el Frontend (Pages)

```bash
npx wrangler pages deploy public --project-name=mi-tienda
```

Esto te dará una URL como:
```
https://mi-tienda.pages.dev
```

## Configurar el Frontend

En tu archivo `script.js` del frontend, configura la URL de la API:

```javascript
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://mi-tienda-api.tu-usuario.workers.dev/api';
```

**Reemplaza** `mi-tienda-api.tu-usuario.workers.dev` con tu URL real del Worker.

## Credenciales por Defecto

- **Email:** admin@mitienda.com
- **Contraseña:** admin123

## Comandos Útiles

### Ver logs del Worker en tiempo real
```bash
npx wrangler tail
```

### Probar localmente
```bash
npx wrangler dev
```

### Ejecutar SQL en la base de datos
```bash
npx wrangler d1 execute mi-tienda-db --remote --command="SELECT * FROM users;"
```

### Cambiar contraseña de admin
Para generar un nuevo hash de contraseña:
```bash
node -e "const crypto = require('crypto'); console.log(crypto.createHash('sha256').update('TU_NUEVA_CONTRASEÑA').digest('base64'));"
```

Luego actualiza en la BD:
```bash
npx wrangler d1 execute mi-tienda-db --remote --command="UPDATE users SET password = 'HASH_GENERADO' WHERE email = 'admin@mitienda.com';"
```

## Solución de Problemas

### Error de CORS
El worker ya incluye headers CORS. Si tienes problemas, verifica que la URL de la API sea correcta en el frontend.

### Error "database_id not found"
Asegúrate de haber copiado el ID correcto en `wrangler.toml` después de crear la base de datos.

### Login no funciona
1. Verifica que la contraseña hash en la BD coincida con el método de hash del worker
2. Abre la consola del navegador (F12) para ver errores
3. Verifica que `API_URL` apunte a tu worker
