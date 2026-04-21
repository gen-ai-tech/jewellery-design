// Carousel Logic
const carouselInner = document.getElementById('carouselInner');
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.indicator');
let currentSlide = 0;
let isTransitioning = false;

// Clone first slide for seamless loop
const firstClone = slides[0].cloneNode(true);
carouselInner.appendChild(firstClone);

const totalSlidesWithClone = slides.length + 1;
carouselInner.style.width = `${totalSlidesWithClone * 100}%`;

function updateCarousel(instant = false) {
    if (instant) {
        carouselInner.style.transition = 'none';
    } else {
        carouselInner.style.transition = 'transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1)';
    }
    
    carouselInner.style.transform = `translateX(-${currentSlide * (100 / totalSlidesWithClone)}%)`;
    
    // Update indicators
    const activeIndex = currentSlide % slides.length;
    indicators.forEach((ind, index) => {
        ind.classList.toggle('active', index === activeIndex);
    });

    // Handle slide animations
    document.querySelectorAll('.slide').forEach((slide, index) => {
        if (index === currentSlide || (currentSlide === slides.length && index === 0)) {
            slide.classList.add('active-slide');
        } else {
            slide.classList.remove('active-slide');
        }
    });
}

function nextSlide() {
    if (isTransitioning) return;
    currentSlide++;
    updateCarousel();
    
    if (currentSlide === slides.length) {
        isTransitioning = true;
        setTimeout(() => {
            carouselInner.style.transition = 'none';
            currentSlide = 0;
            carouselInner.style.transform = `translateX(0)`;
            isTransitioning = false;
        }, 800); // Match CSS transition time
    }
}

function goToSlide(index) {
    if (isTransitioning) return;
    currentSlide = index;
    updateCarousel();
    resetInterval();
}

// Auto Play
let carouselInterval = setInterval(nextSlide, 5000);

function resetInterval() {
    clearInterval(carouselInterval);
    carouselInterval = setInterval(nextSlide, 5000);
}

// Initial state
updateCarousel(true);

// Existing Scripts
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.card, .feature-item, .hero-content, .highlight-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)';
    observer.observe(el);
});

const style = document.createElement('style');
style.textContent = `
    .appear {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// Search Overlay Logic
const searchBtn = document.getElementById('search-btn');
const closeSearch = document.getElementById('close-search');
const searchOverlay = document.getElementById('search-overlay');
const searchInput = document.getElementById('search-input');

if (searchBtn && searchOverlay && closeSearch) {
    searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        searchOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        setTimeout(() => searchInput.focus(), 300);
    });

    closeSearch.addEventListener('click', () => {
        searchOverlay.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Close on click outside search content
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// --- Enhanced Search Logic ---
const searchResultsContainer = document.getElementById('search-results-container');

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        searchResultsContainer.innerHTML = '';

        if (query.length < 2) {
            searchResultsContainer.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center;">Type at least 2 characters to search...</p>';
            return;
        }

        const cards = document.querySelectorAll('.card');
        let matches = 0;

        cards.forEach(card => {
            const title = card.querySelector('h3').innerText.toLowerCase();
            const desc = card.querySelector('p').innerText.toLowerCase();
            const img = card.querySelector('img').src;

            if (title.includes(query) || desc.includes(query)) {
                matches++;
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.innerHTML = `
                    <img src="${img}" alt="${title}">
                    <div class="search-result-info">
                        <h4>${card.querySelector('h3').innerText}</h4>
                        <p>${card.querySelector('p').innerText}</p>
                    </div>
                `;
                resultItem.onclick = () => {
                    searchOverlay.classList.remove('active');
                    document.body.style.overflow = 'auto';
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    card.style.transform = 'scale(1.05)';
                    setTimeout(() => card.style.transform = 'scale(1)', 1000);
                };
                searchResultsContainer.appendChild(resultItem);
            }
        });

        if (matches === 0) {
            searchResultsContainer.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center;">No products found matching "' + query + '"</p>';
        }
    });
}

// --- Wishlist Logic ---
const wishlistContainer = document.querySelector('#wishlist .grid');

function updateWishlistUI() {
    const wishlist = JSON.parse(localStorage.getItem('kj_wishlist') || '[]');
    
    // Update icons on cards
    document.querySelectorAll('.card').forEach(card => {
        const title = card.querySelector('h3').innerText;
        const btn = card.querySelector('.wishlist-btn-card');
        if (btn) {
            if (wishlist.includes(title)) {
                btn.classList.add('active');
                btn.innerHTML = '<i class="fas fa-heart"></i>';
            } else {
                btn.classList.remove('active');
                btn.innerHTML = '<i class="far fa-heart"></i>';
            }
        }
    });

    // Update Wishlist Section
    if (wishlistContainer) {
        if (wishlist.length === 0) {
            wishlistContainer.innerHTML = `
                <div class="wishlist-empty">
                    <i class="fas fa-heart" style="font-size: 4rem; color: var(--primary-purple); opacity: 0.2; margin-bottom: 2rem;"></i>
                    <h3>Your wishlist is empty</h3>
                    <p>Start exploring our collections to add items here.</p>
                </div>
            `;
        } else {
            wishlistContainer.innerHTML = '';
            document.querySelectorAll('.card').forEach(card => {
                const title = card.querySelector('h3').innerText;
                if (wishlist.includes(title)) {
                    const clone = card.cloneNode(true);
                    // Remove the wishlist button from the clone or keep it to allow removing
                    const cloneBtn = clone.querySelector('.wishlist-btn-card');
                    cloneBtn.onclick = () => toggleWishlist(title);
                    wishlistContainer.appendChild(clone);
                }
            });
        }
    }
}

function toggleWishlist(productTitle) {
    let wishlist = JSON.parse(localStorage.getItem('kj_wishlist') || '[]');
    if (wishlist.includes(productTitle)) {
        wishlist = wishlist.filter(item => item !== productTitle);
    } else {
        wishlist.push(productTitle);
    }
    localStorage.setItem('kj_wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
}

// Event delegation for wishlist buttons
document.addEventListener('click', (e) => {
    if (e.target.closest('.wishlist-btn-card')) {
        const card = e.target.closest('.card');
        const title = card.querySelector('h3').innerText;
        toggleWishlist(title);
    }
});

// Mobile Menu Logic
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking a link
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileMenuBtn.querySelector('i').classList.remove('fa-times');
            mobileMenuBtn.querySelector('i').classList.add('fa-bars');
        });
    });
}

// Initial UI update
document.addEventListener('DOMContentLoaded', updateWishlistUI);
