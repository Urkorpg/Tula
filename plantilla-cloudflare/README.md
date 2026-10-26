# Plantilla Tienda Online - Cloudflare Workers + D1 + Pages

Esta plantilla te permite crear una tienda online completa usando la infraestructura de Cloudflare.

## Arquitectura

- **Frontend:** Cloudflare Pages (archivos estáticos HTML/CSS/JS)
- **Backend:** Cloudflare Workers (API REST)
- **Base de datos:** Cloudflare D1 (SQLite)
- **Autenticación:** JWT con SHA-256

## Estructura del Proyecto

```
tu-proyecto/
├── public/                 # Frontend (tus archivos HTML/CSS/JS)
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── admin.html
│   ├── cart.html
│   ├── script.js
│   └── styles.css
├── worker.js               # Backend API (Cloudflare Worker)
├── schema.sql              # Esquema de base de datos
├── wrangler.toml           # Configuración de Cloudflare
└── package.json
```

## Guía Rápida

1. Lee `SETUP.md` para la configuración inicial
2. Lee `DEPLOY.md` para desplegar en Cloudflare
3. Lee `API.md` para entender los endpoints disponibles
4. Lee `FRONTEND.md` para integrar tu frontend con la API
