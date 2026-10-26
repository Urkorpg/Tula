// =============================================
// CLOUDFLARE WORKER - API TIENDA ONLINE
// =============================================
import { Router } from 'itty-router';

const router = Router();

// =============================================
// UTILIDADES
// =============================================
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
    },
  });
}

// =============================================
// AUTENTICACIÓN JWT
// =============================================
async function verifyJWT(token, secret) {
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
  
  const data = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  
  const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const valid = await crypto.subtle.verify('HMAC', key, signature, new TextEncoder().encode(data));
  
  if (!valid) throw new Error('Invalid signature');
  return payload;
}

async function createJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const data = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  return `${data}.${signatureB64}`;
}

async function authMiddleware(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'No autorizado', status: 401 };
  }

  const token = authHeader.substring(7);
  try {
    const payload = await verifyJWT(token, env.JWT_SECRET);
    return { userId: payload.userId, isAdmin: payload.isAdmin };
  } catch (err) {
    return { error: 'Token inválido', status: 401 };
  }
}

// =============================================
// HASH DE CONTRASEÑAS
// =============================================
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

async function verifyPassword(password, hash) {
  const newHash = await hashPassword(password);
  return newHash === hash;
}

// =============================================
// RUTAS
// =============================================

// CORS preflight
router.options('*', () => {
  return new Response(null, { headers: corsHeaders() });
});

// Registro
router.post('/api/register', async (request, env) => {
  try {
    const { name, email, password } = await request.json();
    const hashedPassword = await hashPassword(password);
    
    const result = await env.DB.prepare(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
    ).bind(name, email, hashedPassword).run();
    
    if (!result.success) {
      return jsonResponse({ error: 'Email ya registrado' }, 400);
    }
    
    return jsonResponse({ message: 'Usuario registrado exitosamente' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return jsonResponse({ error: 'Email ya registrado' }, 400);
    }
    return jsonResponse({ error: err.message }, 500);
  }
});

// Login
router.post('/api/login', async (request, env) => {
  try {
    const { email, password } = await request.json();
    
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first();
    
    if (!user) {
      return jsonResponse({ error: 'Credenciales inválidas' }, 400);
    }
    
    const validPassword = await verifyPassword(password, user.password);
    if (!validPassword) {
      return jsonResponse({ error: 'Credenciales inválidas' }, 400);
    }
    
    const token = await createJWT(
      { userId: user.id, isAdmin: user.is_admin },
      env.JWT_SECRET
    );
    
    return jsonResponse({
      token,
      user: { id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin }
    });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
});

// Obtener productos
router.get('/api/products', async (request, env) => {
  try {
    const url = new URL(request.url);
    const showAll = url.searchParams.get('all') === 'true';
    
    let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id';
    if (!showAll) {
      query += ' WHERE p.visible = 1';
    }
    
    const { results } = await env.DB.prepare(query).all();
    return jsonResponse(results);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
});

// Crear producto (admin)
router.post('/api/products', async (request, env) => {
  try {
    const auth = await authMiddleware(request, env);
    if (auth.error) return jsonResponse({ error: auth.error }, auth.status);
    if (!auth.isAdmin) return jsonResponse({ error: 'No autorizado' }, 403);
    
    const formData = await request.formData();
    const name = formData.get('name');
    const description = formData.get('description') || '';
    const price = formData.get('price');
    const category_id = formData.get('category_id');
    const imageUrl = formData.get('imageUrl') || 'https://via.placeholder.com/300x300?text=Producto';
    
    const result = await env.DB.prepare(
      'INSERT INTO products (name, description, price, image, category_id, visible) VALUES (?, ?, ?, ?, ?, 1)'
    ).bind(name, description, price, imageUrl, category_id).run();
    
    return jsonResponse({ message: 'Producto creado', id: result.meta.last_row_id });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
});

// Actualizar producto (admin)
router.put('/api/products/:id', async (request, env) => {
  try {
    const auth = await authMiddleware(request, env);
    if (auth.error) return jsonResponse({ error: auth.error }, auth.status);
    if (!auth.isAdmin) return jsonResponse({ error: 'No autorizado' }, 403);
    
    const productId = request.params.id;
    const formData = await request.formData();
    const name = formData.get('name');
    const description = formData.get('description') || '';
    const price = formData.get('price');
    const category_id = formData.get('category_id');
    const visible = formData.get('visible');
    const imageUrl = formData.get('imageUrl');
    
    let query, params;
    if (imageUrl) {
      query = 'UPDATE products SET name = ?, description = ?, price = ?, image = ?, category_id = ?, visible = ? WHERE id = ?';
      params = [name, description, price, imageUrl, category_id, visible, productId];
    } else {
      query = 'UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, visible = ? WHERE id = ?';
      params = [name, description, price, category_id, visible, productId];
    }
    
    await env.DB.prepare(query).bind(...params).run();
    return jsonResponse({ message: 'Producto actualizado' });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
});

// Eliminar producto (admin)
router.delete('/api/products/:id', async (request, env) => {
  try {
    const auth = await authMiddleware(request, env);
    if (auth.error) return jsonResponse({ error: auth.error }, auth.status);
    if (!auth.isAdmin) return jsonResponse({ error: 'No autorizado' }, 403);
    
    await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(request.params.id).run();
    return jsonResponse({ message: 'Producto eliminado' });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
});

// Obtener categorías
router.get('/api/categories', async (request, env) => {
  try {
    const { results } = await env.DB.prepare('SELECT * FROM categories').all();
    return jsonResponse(results);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
});

// Crear pedido
router.post('/api/orders', async (request, env) => {
  try {
    const auth = await authMiddleware(request, env);
    if (auth.error) return jsonResponse({ error: auth.error }, auth.status);
    
    const { items, total, customerInfo } = await request.json();
    
    const orderResult = await env.DB.prepare(
      'INSERT INTO orders (user_id, total, customer_name, customer_phone, customer_address, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(auth.userId, total, customerInfo.name, customerInfo.phone, customerInfo.address, 'pendiente').run();
    
    const orderId = orderResult.meta.last_row_id;
    
    for (const item of items) {
      await env.DB.prepare(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
      ).bind(orderId, item.id, item.quantity, item.price).run();
    }
    
    return jsonResponse({ message: 'Pedido creado', orderId });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
});

// Obtener pedidos (admin)
router.get('/api/orders', async (request, env) => {
  try {
    const auth = await authMiddleware(request, env);
    if (auth.error) return jsonResponse({ error: auth.error }, auth.status);
    if (!auth.isAdmin) return jsonResponse({ error: 'No autorizado' }, 403);
    
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    
    let query = 'SELECT o.*, u.name as user_name, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id';
    const params = [];
    
    if (status) {
      query += ' WHERE o.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY o.created_at DESC';
    
    const { results: orders } = await env.DB.prepare(query).bind(...params).all();
    
    for (const order of orders) {
      const { results: items } = await env.DB.prepare(
        'SELECT oi.*, p.name as product_name FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?'
      ).bind(order.id).all();
      order.items = items;
    }
    
    return jsonResponse(orders);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
});

// Actualizar estado de pedido (admin)
router.put('/api/orders/:id/status', async (request, env) => {
  try {
    const auth = await authMiddleware(request, env);
    if (auth.error) return jsonResponse({ error: auth.error }, auth.status);
    if (!auth.isAdmin) return jsonResponse({ error: 'No autorizado' }, 403);
    
    const { status } = await request.json();
    await env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?').bind(status, request.params.id).run();
    
    return jsonResponse({ message: 'Estado actualizado' });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
});

// 404
router.all('*', () => new Response('Not Found', { status: 404 }));

export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx);
  },
};
