# Documentación de la API

Base URL: `https://tu-worker.workers.dev/api`

## Autenticación

La API usa JWT (JSON Web Tokens). Para rutas protegidas, incluye el header:
```
Authorization: Bearer <token>
```

---

## Endpoints Públicos

### POST /api/register
Registrar nuevo usuario.

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "password": "mipassword123"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Usuario registrado exitosamente"
}
```

---

### POST /api/login
Iniciar sesión.

**Body:**
```json
{
  "email": "juan@email.com",
  "password": "mipassword123"
}
```

**Respuesta exitosa (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "isAdmin": 0
  }
}
```

---

### GET /api/products
Obtener productos visibles.

**Respuesta:**
```json
[
  {
    "id": 1,
    "name": "Producto 1",
    "description": "Descripción",
    "price": 100.00,
    "image": "https://...",
    "category_id": 1,
    "category_name": "Categoría 1",
    "visible": 1
  }
]
```

**Query params:**
- `?all=true` - Incluir productos ocultos (requiere admin)

---

### GET /api/categories
Obtener categorías.

**Respuesta:**
```json
[
  { "id": 1, "name": "Comida" },
  { "id": 2, "name": "Bebidas" }
]
```

---

## Endpoints Protegidos (Requieren Token)

### POST /api/orders
Crear pedido. Requiere usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "items": [
    { "id": 1, "quantity": 2, "price": 100 }
  ],
  "total": 200,
  "customerInfo": {
    "name": "Juan Pérez",
    "phone": "+53 5555 5555",
    "address": "Calle 1, Ciudad"
  }
}
```

---

## Endpoints de Admin (Requieren Token + isAdmin)

### GET /api/orders
Obtener todos los pedidos.

**Query params:**
- `?status=pendiente` - Filtrar por estado (pendiente, en_envio, cerrado)

---

### PUT /api/orders/:id/status
Actualizar estado de pedido.

**Body:**
```json
{
  "status": "en_envio"
}
```

---

### POST /api/products
Crear producto. Usa `FormData`.

**FormData fields:**
- `name` (requerido)
- `description`
- `price` (requerido)
- `category_id`
- `imageUrl` - URL de la imagen
- `visible` - 1 o 0

---

### PUT /api/products/:id
Actualizar producto. Usa `FormData` (mismos campos que POST).

---

### DELETE /api/products/:id
Eliminar producto.

---

## Códigos de Error

- `400` - Datos inválidos o email ya registrado
- `401` - No autorizado (token inválido o faltante)
- `403` - Prohibido (no es admin)
- `500` - Error del servidor
