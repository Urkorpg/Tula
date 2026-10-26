-- =============================================
-- ESQUEMA DE BASE DE DATOS PARA TULA
-- "Yo la hago y tú la disfrutas"
-- Cloudflare D1 (SQLite)
-- =============================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_admin INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  image TEXT,
  category_id INTEGER,
  stock INTEGER DEFAULT 100,
  visible INTEGER DEFAULT 1,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  total REAL NOT NULL,
  status TEXT DEFAULT 'pendiente',
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de items del pedido
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  product_id INTEGER,
  quantity INTEGER,
  price REAL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- =============================================
-- DATOS INICIALES DE TULA
-- =============================================

-- Categorías de Tula
INSERT INTO categories (name) VALUES ('Comidas Elaboradas');
INSERT INTO categories (name) VALUES ('Preelaborados');
INSERT INTO categories (name) VALUES ('Bebidas');

-- COMIDAS ELABORADAS (category_id = 1)
INSERT INTO products (name, description, price, image, category_id, visible) VALUES 
  ('Arroz con Pollo Criollo', 'Arroz amarillo con tiernos trozos de pollo, vegetales frescos y especias tradicionales', 10.50, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400', 1, 1),
  ('Lasagna de Carne', 'Capas de pasta fresca con ragú de carne, bechamel y queso gratinado', 12.00, 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400', 1, 1),
  ('Carne Asada con Chimichurri', 'Corte de res a la parrilla con chimichurri casero, papas y ensalada', 14.50, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', 1, 1),
  ('Pasta Alfredo con Pollo', 'Fettuccine en cremosa salsa alfredo con tiras de pollo grillado', 11.00, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400', 1, 1),
  ('Filete de Pescado al Ajillo', 'Filete fresco con salsa de ajo, acompañado de arroz blanco y vegetales', 13.50, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', 1, 1);

-- PREELABORADOS (category_id = 2)
INSERT INTO products (name, description, price, image, category_id, visible) VALUES 
  ('Empanadas de Carne (6 uds)', 'Empanadas rellenas de carne molida sazonada, listas para hornear o freír', 8.00, 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400', 2, 1),
  ('Croquetas de Jamón (12 uds)', 'Cremosas croquetas de jamón serrano, empanizadas y listas para freír', 9.50, 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400', 2, 1),
  ('Albóndigas Caseras (500g)', 'Albóndigas de res y cerdo con hierbas aromáticas, sin cocinar', 7.50, 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400', 2, 1),
  ('Masa de Pizza (2 bases)', 'Masa artesanal estirada, lista para agregar tus ingredientes favoritos', 5.00, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400', 2, 1),
  ('Salsa Boloñesa Casera (500ml)', 'Salsa de tomate con carne molida y especias, lista para calentar', 6.50, 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400', 2, 1);

-- BEBIDAS (category_id = 3)
INSERT INTO products (name, description, price, image, category_id, visible) VALUES 
  ('Limonada Natural', 'Limonada fresca hecha con limones naturales y un toque de hierbabuena', 3.00, 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400', 3, 1),
  ('Jugo de Naranja Natural', 'Jugo recién exprimido de naranjas dulces, sin azúcar añadida', 3.50, 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400', 3, 1),
  ('Batido de Frutas Tropicales', 'Mezcla cremosa de mango, piña y maracuyá con leche', 4.50, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', 3, 1),
  ('Té Helado de Durazno', 'Té negro infusionado con durazno natural, servido frío', 3.25, 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400', 3, 1),
  ('Café con Leche', 'Café de grano molido con leche espumada, caliente o frío', 2.75, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', 3, 1);

-- Usuario administrador de Tula
-- Email: admin@tulacocina.com
-- Contraseña: admin123
INSERT INTO users (name, email, password, is_admin) VALUES 
  ('Admin Tula', 'admin@tulacocina.com', 'JAvlGPq9JyTdtvBO6x2llnRI1+gxwIyPqCKAn3THIKk=', 1);
