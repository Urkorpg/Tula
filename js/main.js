// Navegación entre secciones
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const heroButtons = document.querySelectorAll('.btn[data-section]');

    // Función para cambiar de sección
    function changeSection(sectionId) {
        // Ocultar todas las secciones
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Quitar clase active de todos los links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Activar el link correspondiente
        const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Scroll al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Event listeners para navegación
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            changeSection(sectionId);
        });
    });

    // Event listeners para botones del hero
    heroButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            changeSection(sectionId);
        });
    });

    // WhatsApp Popup
    const whatsappBtn = document.getElementById('whatsappBtn');
    const whatsappPopup = document.getElementById('whatsappPopup');
    const popupClose = document.getElementById('popupClose');

    whatsappBtn.addEventListener('click', function() {
        whatsappPopup.classList.toggle('show');
    });

    popupClose.addEventListener('click', function() {
        whatsappPopup.classList.remove('show');
    });

    // Cerrar popup al hacer click fuera
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.whatsapp-float')) {
            whatsappPopup.classList.remove('show');
        }
    });

    // Botones de agregar al carrito
    const addButtons = document.querySelectorAll('.add-btn');
    const cartCount = document.querySelector('.cart-count');
    let itemCount = 0;

    addButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            itemCount++;
            cartCount.textContent = itemCount;
            
            // Animación visual
            this.style.transform = 'scale(1.2)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Mobile menu toggle (básico)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.style.display = nav.style.display === 'block' ? 'none' : 'block';
        });
    }

    // Búsqueda (placeholder funcional)
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.toLowerCase();
                // Aquí se podría implementar la búsqueda real
                console.log('Buscando:', searchTerm);
            }
        });
    }
});
