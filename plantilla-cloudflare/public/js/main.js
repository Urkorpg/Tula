// =============================================
// TULA - "Yo la hago y tú la disfrutas"
// Conexión con API de Cloudflare
// =============================================

// URL de la API
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8787/api' 
    : 'https://tula-api.pinerorichard55.workers.dev/api';

// Carrito de compras
let cart = [];
let allProducts = [];

// Mapeo de categorías a secciones
const categoryToSection = {
    1: 'comidas',      // Comidas Elaboradas
    2: 'preelaborados', // Preelaborados
    3: 'bebidas'        // Bebidas
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initWhatsApp();
    initMobileMenu();
    initSearch();
    loadProducts();
    loadCart();
});

// =============================================
// NAVEGACIÓN
// =============================================
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const heroButtons = document.querySelectorAll('.btn[data-section]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            changeSection(this.getAttribute('data-section'));
        });
    });

    heroButtons.forEach(button => {
        button.addEventListener('click', function() {
            changeSection(this.getAttribute('data-section'));
        });
    });
}

function changeSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    sections.forEach(section => section.classList.remove('active'));
    navLinks.forEach(link => link.classList.remove('active'));

    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.classList.add('active');

    const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
    if (activeLink) activeLink.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================
// CARGAR PRODUCTOS DESDE LA API
// =============================================
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Error al cargar productos');
        
        allProducts = await response.json();
        renderProducts(allProducts);
    } catch (error) {
        console.error('Error cargando productos:', error);
        // Si falla la API, los productos estáticos del HTML se mantienen
    }
}

function renderProducts(products) {
    // Agrupar productos por categoría
    const comidas = products.filter(p => p.category_id === 1);
    const preelaborados = products.filter(p => p.category_id === 2);
    const bebidas = products.filter(p => p.category_id === 3);

    // Renderizar cada sección
    renderMenuSection('comidas', comidas, 'fa-bowl-food');
    renderMenuSection('preelaborados', preelaborados, 'fa-snowflake');
    renderMenuSection('bebidas', bebidas, 'fa-glass-water');
}

function renderMenuSection(sectionId, products, defaultIcon) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const menuGrid = section.querySelector('.menu-grid');
    if (!menuGrid || products.length === 0) return;

    menuGrid.innerHTML = products.map(product => `
        <div class="menu-item" data-product-id="${product.id}">
            <div class="menu-item-image">
                <img src="${product.image || 'https://via.placeholder.com/300x300?text=Producto'}" alt="${product.name}">
            </div>
            <div class="menu-item-content">
                <div class="menu-item-header">
                    <h3>${product.name}</h3>
                    <span class="menu-price">$${product.price.toFixed(2)}</span>
                </div>
                <p>${product.description || ''}</p>
                <div class="menu-item-footer">
                    <span class="portion"><i class="fa-solid ${defaultIcon}"></i> Disponible</span>
                    <button class="add-btn" onclick="addToCart(${product.id})">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// =============================================
// CARRITO DE COMPRAS
// =============================================
function loadCart() {
    const savedCart = localStorage.getItem('tula_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

function saveCart() {
    localStorage.setItem('tula_cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
    showAddedNotification(product.name);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function showAddedNotification(productName) {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `<i class="fa-solid fa-check"></i> ${productName} agregado al carrito`;
    notification.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 25px;
        background: #59664A;
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        z-index: 1001;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// =============================================
// WHATSAPP
// =============================================
function initWhatsApp() {
    const whatsappBtn = document.getElementById('whatsappBtn');
    const whatsappPopup = document.getElementById('whatsappPopup');
    const popupClose = document.getElementById('popupClose');

    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => whatsappPopup?.classList.toggle('show'));
    }
    if (popupClose) {
        popupClose.addEventListener('click', () => whatsappPopup?.classList.remove('show'));
    }

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.whatsapp-float')) {
            whatsappPopup?.classList.remove('show');
        }
    });
}

// =============================================
// MENÚ MÓVIL
// =============================================
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');

    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.style.display = nav.style.display === 'block' ? 'none' : 'block';
        });
    }
}

// =============================================
// BÚSQUEDA
// =============================================
function initSearch() {
    const searchInput = document.querySelector('.search-box input');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const term = this.value.toLowerCase().trim();
        if (term.length < 2) {
            renderProducts(allProducts);
            return;
        }
        
        const filtered = allProducts.filter(p => 
            p.name.toLowerCase().includes(term) || 
            (p.description && p.description.toLowerCase().includes(term))
        );
        renderProducts(filtered);
    });
}

// =============================================
// ESTILOS ADICIONALES (inyectados)
// =============================================
const styles = document.createElement('style');
styles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100px); opacity: 0; }
    }
`;
document.head.appendChild(styles);
