# Integración del Frontend

## Configuración Básica

En tu archivo JavaScript principal, agrega estas funciones y configuración:

```javascript
// =============================================
// CONFIGURACIÓN - CAMBIA LA URL POR LA TUYA
// =============================================
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://TU-WORKER.workers.dev/api';

// =============================================
// GESTIÓN DE AUTENTICACIÓN
// =============================================
function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    window.location.href = 'index.html';
}

// =============================================
// GESTIÓN DEL CARRITO
// =============================================
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart(cart);
    alert('Producto añadido al carrito');
}
```

## Página de Login (login.html)

```html
<form id="login-form">
    <input type="email" id="email" required>
    <input type="password" id="password" required>
    <button type="submit">Iniciar Sesión</button>
</form>

<script src="script.js"></script>
<script>
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            setAuth(data.token, data.user);
            
            if (data.user.isAdmin === 1) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            alert(data.error || 'Error al iniciar sesión');
        }
    } catch (error) {
        alert('Error de conexión');
    }
});
</script>
```

## Página de Registro (register.html)

```html
<form id="register-form">
    <input type="text" id="name" required>
    <input type="email" id="email" required>
    <input type="password" id="password" required minlength="6">
    <button type="submit">Registrarse</button>
</form>

<script src="script.js"></script>
<script>
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Registro exitoso');
            window.location.href = 'login.html';
        } else {
            alert(data.error || 'Error al registrarse');
        }
    } catch (error) {
        alert('Error de conexión');
    }
});
</script>
```

## Cargar Productos (index.html)

```html
<div id="products-grid"></div>

<script src="script.js"></script>
<script>
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        
        const container = document.getElementById('products-grid');
        container.innerHTML = '';
        
        products.forEach(product => {
            container.innerHTML += `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>${product.description || ''}</p>
                    <span>$${product.price}</span>
                    <button onclick='addToCart(${JSON.stringify(product)})'>
                        Añadir al Carrito
                    </button>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadProducts);
</script>
```

## Crear Pedido (cart.html)

```javascript
async function createOrder() {
    const user = getUser();
    if (!user) {
        alert('Debes iniciar sesión');
        window.location.href = 'login.html';
        return;
    }
    
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const customerInfo = {
        name: document.getElementById('customer-name').value,
        phone: document.getElementById('customer-phone').value,
        address: document.getElementById('customer-address').value
    };
    
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ items: cart, total, customerInfo })
        });
        
        if (response.ok) {
            alert('Pedido realizado con éxito');
            localStorage.removeItem('cart');
            window.location.href = 'index.html';
        } else {
            const data = await response.json();
            alert(data.error || 'Error al crear pedido');
        }
    } catch (error) {
        alert('Error de conexión');
    }
}
```

## Notas Importantes

1. **CORS:** El worker ya maneja CORS, no necesitas configuración adicional.

2. **isAdmin:** El valor puede ser `1` o `true`, verifica ambos:
   ```javascript
   if (user.isAdmin === 1 || user.isAdmin === true)
   ```

3. **Evita declarar API_URL dos veces:** Si usas un `script.js` compartido, no declares `API_URL` de nuevo en scripts inline.

4. **Depuración:** Usa `console.log()` para ver qué está pasando:
   ```javascript
   console.log('API_URL:', API_URL);
   console.log('Response:', data);
   ```
