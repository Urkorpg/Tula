# ✅ Checklist de Despliegue - TULA

## 📋 Requisitos Previos
- [ ] Node.js instalado (v18+) - Verifica con: `node --version`
- [ ] Cuenta de Cloudflare creada (gratuita en cloudflare.com)

---

## 🚀 PASOS DE DESPLIEGUE

### 1️⃣ Instalar dependencias
```bash
cd plantilla-cloudflare
npm install
```

### 2️⃣ Iniciar sesión en Cloudflare
```bash
npx wrangler login
```
> Se abrirá el navegador para autorizar. Haz clic en "Allow".

### 3️⃣ Crear la base de datos D1
```bash
npx wrangler d1 create tula-db
```
> ⚠️ **IMPORTANTE:** Copia el `database_id` que aparece en la respuesta.

### 4️⃣ Actualizar wrangler.toml
Abre `wrangler.toml` y reemplaza:
```
database_id = "REEMPLAZA-CON-TU-DATABASE-ID"
```
Con el ID que copiaste en el paso anterior.

### 5️⃣ Inicializar la base de datos con los productos de Tula
```bash
npx wrangler d1 execute tula-db --file=./schema.sql --remote
```

### 6️⃣ Verificar que la BD se creó correctamente
```bash
npx wrangler d1 execute tula-db --remote --command="SELECT * FROM products;"
```
> Deberías ver los 15 productos de Tula.

### 7️⃣ Desplegar el Backend (API)
```bash
npx wrangler deploy
```
> Anota la URL que te da: `https://tula-api.TU-USUARIO.workers.dev`

### 8️⃣ Desplegar el Frontend
```bash
npx wrangler pages deploy public --project-name=tula
```
> Anota la URL: `https://tula.pages.dev`

---

## 🎉 ¡Listo!

### URLs de tu proyecto:
- **Frontend:** https://tula.pages.dev
- **API:** https://tula-api.TU-USUARIO.workers.dev

### Credenciales de Admin:
- **Email:** admin@tulacocina.com
- **Contraseña:** admin123

---

## 🔧 Comandos Útiles

```bash
# Ver logs en tiempo real
npx wrangler tail

# Probar localmente
npx wrangler dev

# Ver productos en la BD
npx wrangler d1 execute tula-db --remote --command="SELECT * FROM products;"

# Ver usuarios
npx wrangler d1 execute tula-db --remote --command="SELECT * FROM users;"

# Ver pedidos
npx wrangler d1 execute tula-db --remote --command="SELECT * FROM orders;"
```

---

## ❓ Problemas Comunes

**"database_id not found"**
- Verifica que copiaste bien el ID en wrangler.toml

**La página no carga productos**
- Asegúrate de que el `API_URL` en tu JavaScript apunte a la URL correcta del worker

**Error de CORS**
- El worker ya incluye headers CORS, verifica que la URL sea correcta
