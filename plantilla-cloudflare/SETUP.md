# Configuración Inicial

## Requisitos Previos

- Node.js instalado (v18+)
- Cuenta de Cloudflare (gratuita)
- Git instalado

## Paso 1: Crear el proyecto

```bash
mkdir mi-tienda
cd mi-tienda
npm init -y
npm install wrangler itty-router --save-dev
```

## Paso 2: Crear wrangler.toml

Crea el archivo `wrangler.toml` en la raíz:

```toml
name = "mi-tienda-api"
main = "worker.js"
compatibility_date = "2024-01-01"

# Base de datos D1 (el database_id lo obtienes en el Paso 4)
[[d1_databases]]
binding = "DB"
database_name = "mi-tienda-db"
database_id = "TU-DATABASE-ID-AQUI"

# Variables de entorno
[vars]
JWT_SECRET = "cambia_esto_por_una_clave_secreta_segura_123"
```

## Paso 3: Autenticarse en Cloudflare

```bash
npx wrangler login
```

Se abrirá el navegador para autorizar.

## Paso 4: Crear la Base de Datos D1

```bash
npx wrangler d1 create mi-tienda-db
```

**IMPORTANTE:** Copia el `database_id` que te devuelve y pégalo en `wrangler.toml`.

## Paso 5: Crear schema.sql

Crea el archivo `schema.sql` con las tablas necesarias (ver archivo incluido).

## Paso 6: Inicializar la Base de Datos

```bash
npx wrangler d1 execute mi-tienda-db --file=./schema.sql --remote
```

## Paso 7: Crear worker.js

Copia el archivo `worker.js` incluido en esta plantilla.

## Paso 8: Colocar tu Frontend

Coloca todos tus archivos HTML/CSS/JS en la carpeta `public/`.

## Siguiente Paso

Ve a `DEPLOY.md` para desplegar tu proyecto.
