/**
 * Modern Oracle APEX Interview Mastery - JavaScript
 * Enhanced with modern ES6+ features and smooth animations
 */

class APEXMastery {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.setupCounterAnimation();
        this.setupScrollEffects();
        this.setupMobileMenu();
        this.setupDropdowns();
        this.setupQuestionHandlers();
        this.setupThemeSystem();
    }

    setupEventListeners() {
        // DOM Content Loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.animateOnLoad();
        });

        // Scroll Events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.handleScroll();
            }, 10);
        });

        // Resize Events
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Keyboard Navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fadeInUp');
                    // Trigger counter animation for stats
                    if (entry.target.classList.contains('stat-item')) {
                        this.animateCounter(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observe elements for animation
        this.observeElements();
    }

    observeElements() {
        const elementsToObserve = [
            '.stat-item',
            '.feature-card',
            '.hero-text',
            '.section-header'
        ];

        elementsToObserve.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => this.observer.observe(el));
        });
    }

    setupCounterAnimation() {
        this.counters = new Map();
    }

    animateCounter(statItem) {
        const numberElement = statItem.querySelector('.stat-number');
        if (!numberElement || this.counters.has(numberElement)) return;

        const targetValue = parseInt(numberElement.dataset.count);
        const duration = 2000; // 2 seconds
        const startTime = performance.now();

        this.counters.set(numberElement, true);

        const updateCounter = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(targetValue * easeOutQuart);

            numberElement.textContent = currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                numberElement.textContent = targetValue.toLocaleString();
            }
        };

        requestAnimationFrame(updateCounter);
    }

    setupScrollEffects() {
        this.navbar = document.querySelector('.navbar');
        this.lastScrollY = window.scrollY;
    }

    handleScroll() {
        const currentScrollY = window.scrollY;
        
        // Navbar scroll effect
        if (this.navbar) {
            if (currentScrollY > 100) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }

            // Hide/show navbar on scroll
            if (currentScrollY > this.lastScrollY && currentScrollY > 200) {
                this.navbar.style.transform = 'translateY(-100%)';
            } else {
                this.navbar.style.transform = 'translateY(0)';
            }
        }

        this.lastScrollY = currentScrollY;
    }

    setupMobileMenu() {
        this.mobileToggle = document.getElementById('mobileToggle');
        this.navMenu = document.getElementById('navMenu');
        this.body = document.body;

        if (this.mobileToggle && this.navMenu) {
            this.mobileToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.mobileToggle.contains(e.target) && !this.navMenu.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });

            // Close mobile menu when clicking nav links
            this.navMenu.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            });
        }
    }

    toggleMobileMenu() {
        this.mobileToggle.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        this.body.classList.toggle('menu-open');
    }

    closeMobileMenu() {
        this.mobileToggle.classList.remove('active');
        this.navMenu.classList.remove('active');
        this.body.classList.remove('menu-open');
    }

    setupDropdowns() {
        const dropdowns = document.querySelectorAll('.nav-dropdown');
        
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const content = dropdown.querySelector('.dropdown-content');
            
            if (toggle && content) {
                // Touch/click handling for mobile
                toggle.addEventListener('click', (e) => {
                    if (window.innerWidth <= 1023) {
                        e.preventDefault();
                        content.style.display = content.style.display === 'block' ? 'none' : 'block';
                    }
                });
            }
        });
    }

    setupQuestionHandlers() {
        // Question toggle functionality (for question pages)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.question-header')) {
                const header = e.target.closest('.question-header');
                const container = header.closest('.question-container');
                const content = container.querySelector('.question-content');
                const toggle = header.querySelector('.question-toggle');
                
                if (content && toggle) {
                    const isActive = content.classList.contains('active');
                    
                    // Close all other questions
                    document.querySelectorAll('.question-content.active').forEach(activeContent => {
                        if (activeContent !== content) {
                            activeContent.classList.remove('active');
                            activeContent.closest('.question-container')
                                .querySelector('.question-toggle')
                                .classList.remove('rotated');
                        }
                    });
                    
                    // Toggle current question
                    content.classList.toggle('active', !isActive);
                    toggle.classList.toggle('rotated', !isActive);
                    
                    // Smooth scroll to question if opening
                    if (!isActive) {
                        setTimeout(() => {
                            header.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'start' 
                            });
                        }, 100);
                    }
                }
            }
        });

        // Copy code functionality
        document.addEventListener('click', (e) => {
            if (e.target.closest('.copy-btn')) {
                const button = e.target.closest('.copy-btn');
                const codeBlock = button.closest('.code-block');
                const code = codeBlock.querySelector('pre').textContent;
                
                this.copyToClipboard(code).then(() => {
                    this.showCopyFeedback(button);
                });
            }
        });
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                return true;
            } catch (err) {
                return false;
            } finally {
                document.body.removeChild(textArea);
            }
        }
    }

    showCopyFeedback(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.style.background = '#22c55e';
        button.style.borderColor = '#22c55e';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
            button.style.borderColor = '';
        }, 2000);
    }

    setupThemeSystem() {
        // System theme detection
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        
        prefersDarkScheme.addEventListener('change', (e) => {
            this.handleSystemThemeChange(e.matches);
        });
    }

    handleSystemThemeChange(isDark) {
        // Future implementation for dark mode
        console.log('System theme changed to:', isDark ? 'dark' : 'light');
    }

    animateOnLoad() {
        // Animate hero section
        const heroText = document.querySelector('.hero-text');
        if (heroText) {
            heroText.classList.add('animate-fadeInUp');
        }

        // Animate floating cards
        const floatingCards = document.querySelectorAll('.floating-card');
        floatingCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 1023) {
            this.closeMobileMenu();
        }
    }

    handleKeyboard(e) {
        // ESC key closes mobile menu
        if (e.key === 'Escape') {
            this.closeMobileMenu();
        }
        
        // Enhanced keyboard navigation
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    }

    // Utility functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Question filtering and search functionality
class QuestionManager {
    constructor() {
        this.questions = [];
        this.filteredQuestions = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.setupFilterButtons();
        this.setupSearch();
    }

    setupFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-tab');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.textContent.toLowerCase().replace(' questions', '');
                this.setFilter(filter);
                this.updateActiveButton(button);
            });
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.setSearchTerm(e.target.value);
            });
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
