// DOM Elements
const header = document.querySelector('.header');
const menuNav = document.querySelector('.menu-nav');

// Menu Navigation
function initializeMenuNavigation() {
    const menuLinks = document.querySelectorAll('.menu-link');
    const menuSections = document.querySelectorAll('.menu-section');

    // Make sure menu links exist
    if (!menuLinks.length) {
        console.error('Menu links not found');
        return;
    }

    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            console.log('Menu link clicked:', link.getAttribute('data-target')); // Debug log
            
            // Remove active class from all links and sections
            menuLinks.forEach(l => l.classList.remove('active'));
            menuSections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Show corresponding section
            const targetId = link.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            } else {
                console.error('Target section not found:', targetId); // Debug log
            }
        });
    });

    // Set initial active section
    if (menuLinks[0]) {
        menuLinks[0].click();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeMenuNavigation();
    
    // Only initialize CrepeBuilder if we're on the build section
    const buildSection = document.getElementById('build');
    if (buildSection) {
        new CrepeBuilder();
    }

    // Enhanced image loading handler
    const images = document.querySelectorAll('.item-image img');
    
    // Backup images array (food-related images that are known to work)
    const backupImages = [
        'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80'
    ];
    
    images.forEach((img, index) => {
        const originalSrc = img.src;
        img.src = 'https://via.placeholder.com/400x300/2D2D2D/FFFFFF?text=Loading...';

        const tempImage = new Image();
        tempImage.src = originalSrc;

        tempImage.onload = function() {
            img.src = originalSrc;
            img.classList.add('loaded');
        };

        tempImage.onerror = function() {
            // Use a backup image instead of showing "Not Available"
            const backupIndex = index % backupImages.length;
            img.src = backupImages[backupIndex];
            img.classList.add('loaded');
        };
    });
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe menu items for animation
document.querySelectorAll('.menu-item').forEach(item => {
    observer.observe(item);
});

// Add animation classes to menu items
document.querySelectorAll('.menu-item').forEach((item, index) => {
    item.style.animationDelay = `${index * 0.1}s`;
});

// Handle Menu Navigation Scroll
const scrollContainer = document.querySelector('.scroll-container');
let isDown = false;
let startX;
let scrollLeft;

scrollContainer.addEventListener('mousedown', (e) => {
    isDown = true;
    scrollContainer.classList.add('active');
    startX = e.pageX - scrollContainer.offsetLeft;
    scrollLeft = scrollContainer.scrollLeft;
});

scrollContainer.addEventListener('mouseleave', () => {
    isDown = false;
    scrollContainer.classList.remove('active');
});

scrollContainer.addEventListener('mouseup', () => {
    isDown = false;
    scrollContainer.classList.remove('active');
});

scrollContainer.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollContainer.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainer.scrollLeft = scrollLeft - walk;
});

// Add to the CSS for animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .menu-item {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }

    .menu-item.animate {
        opacity: 1;
        transform: translateY(0);
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .header {
        transition: transform 0.3s ease;
    }

    .scroll-container.active {
        cursor: grabbing;
        cursor: -webkit-grabbing;
    }
`;

document.head.appendChild(styleSheet);

// Optional: Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Build Your Own Section Functionality
class CrepeBuilder {
    constructor() {
        try {
            this.baseSelected = false;
            this.toppings = new Set();
            this.totalPrice = 0;
            this.basePrice = 3.50;
            this.init();
        } catch (error) {
            console.error('Error initializing CrepeBuilder:', error);
        }
    }

    init() {
        // Initialize elements
        this.summaryElement = document.querySelector('.selected-items');
        this.totalElement = document.querySelector('.total-price .price');
        this.selectBtn = document.querySelector('.select-btn');

        // Base selection
        this.selectBtn.addEventListener('click', () => this.toggleBase());

        // Type selection
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchType(e.target));
        });

        // Topping selection
        document.querySelectorAll('.add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleTopping(e.target));
        });
    }

    toggleBase() {
        this.baseSelected = !this.baseSelected;
        this.selectBtn.classList.toggle('selected');
        this.selectBtn.textContent = this.baseSelected ? 'Selected' : 'Select Base';
        this.updateSummary();
    }

    switchType(button) {
        // Remove active class from all type buttons
        document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Show/hide appropriate toppings
        const type = button.dataset.type;
        document.querySelector('.sweet-toppings').style.display = type === 'sweet' ? 'grid' : 'none';
        document.querySelector('.salted-toppings').style.display = type === 'salted' ? 'grid' : 'none';

        // Clear toppings when switching type
        this.toppings.clear();
        document.querySelectorAll('.add-btn').forEach(btn => {
            btn.classList.remove('added');
            btn.textContent = '+';
        });
        this.updateSummary();
    }

    toggleTopping(button) {
        if (!this.baseSelected) {
            this.showNotification('Please select a base first');
            return;
        }

        const toppingItem = button.closest('.topping-item');
        const name = toppingItem.querySelector('span').textContent;
        const price = parseFloat(toppingItem.querySelector('.price').textContent.replace('€', ''));
        const toppingKey = JSON.stringify({ name, price });

        if (this.toppings.has(toppingKey)) {
            this.toppings.delete(toppingKey);
            button.classList.remove('added');
            button.textContent = '+';
        } else {
            this.toppings.add(toppingKey);
            button.classList.add('added');
            button.textContent = '✓';
        }

        this.updateSummary();
    }

    updateSummary() {
        let html = '';
        this.totalPrice = this.baseSelected ? this.basePrice : 0;

        if (this.baseSelected) {
            html += `<div class="summary-item">Base Crêpe <span>€${this.basePrice.toFixed(2)}</span></div>`;
        }

        this.toppings.forEach(toppingKey => {
            const topping = JSON.parse(toppingKey);
            html += `<div class="summary-item">${topping.name} <span>€${topping.price.toFixed(2)}</span></div>`;
            this.totalPrice += topping.price;
        });

        this.summaryElement.innerHTML = html;
        this.totalElement.textContent = `€${this.totalPrice.toFixed(2)}`;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    }
}

// Add this to your existing menu section code
const clubSection = `
    <section id="club" class="menu-section">
        <h2>Club Sandwiches & Toasts</h2>
        <div class="menu-grid">
            <div class="menu-item">
                <div class="item-image">
                    <img src="assets/club/classic.jpg" alt="Classic Club">
                    <div class="item-badge bestseller">Favorite</div>
                </div>
                <div class="item-content">
                    <h3>Classic Club</h3>
                    <p>Chicken, bacon, lettuce, tomato, mayo</p>
                    <span class="price">€9.50</span>
                </div>
            </div>
            <!-- Add more club sandwiches -->
        </div>
    </section>
`;

// Insert club section into the menu
document.querySelector('.menu-sections').insertAdjacentHTML('beforeend', clubSection);

// Smooth scroll to sections
document.querySelector('.fab-menu').addEventListener('click', () => {
    const menuNav = document.querySelector('.menu-nav');
    menuNav.scrollIntoView({ behavior: 'smooth' });
});

// Add intersection observer for fade-in animations
const fadeElements = document.querySelectorAll('.menu-item, .build-step');
const fadeObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.1 }
);

fadeElements.forEach(element => fadeObserver.observe(element));

class ToastBuilder {
    constructor() {
        try {
            this.baseSelected = false;
            this.toppings = new Set();
            this.totalPrice = 0;
            this.basePrice = 2.50;
            this.init();
        } catch (error) {
            console.error('Error initializing ToastBuilder:', error);
        }
    }

    init() {
        // Initialize elements
        this.summaryElement = document.querySelector('#toast .selected-items');
        this.totalElement = document.querySelector('#toast .total-price .price');
        this.selectBtn = document.querySelector('#toast .select-btn');

        // Base selection
        this.selectBtn.addEventListener('click', () => this.toggleBase());

        // Topping selection
        document.querySelectorAll('#toast .add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleTopping(e.target));
        });
    }

    toggleBase() {
        this.baseSelected = !this.baseSelected;
        this.selectBtn.classList.toggle('selected');
        this.selectBtn.textContent = this.baseSelected ? 'Selected' : 'Select Base';
        this.updateSummary();
    }

    toggleTopping(button) {
        if (!this.baseSelected) {
            this.showNotification('Please select a base first');
            return;
        }

        const toppingItem = button.closest('.topping-item');
        const name = toppingItem.querySelector('span').textContent;
        const price = parseFloat(toppingItem.querySelector('.price').textContent.replace('€', ''));
        const toppingKey = JSON.stringify({ name, price });

        if (this.toppings.has(toppingKey)) {
            this.toppings.delete(toppingKey);
            button.classList.remove('added');
            button.textContent = '+';
        } else {
            this.toppings.add(toppingKey);
            button.classList.add('added');
            button.textContent = '✓';
        }

        this.updateSummary();
    }

    updateSummary() {
        let html = '';
        this.totalPrice = this.baseSelected ? this.basePrice : 0;

        if (this.baseSelected) {
            html += `<div class="summary-item">Toast Base <span>€${this.basePrice.toFixed(2)}</span></div>`;
        }

        this.toppings.forEach(toppingKey => {
            const topping = JSON.parse(toppingKey);
            html += `<div class="summary-item">${topping.name} <span>€${topping.price.toFixed(2)}</span></div>`;
            this.totalPrice += topping.price;
        });

        this.summaryElement.innerHTML = html;
        this.totalElement.textContent = `€${this.totalPrice.toFixed(2)}`;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    }
}