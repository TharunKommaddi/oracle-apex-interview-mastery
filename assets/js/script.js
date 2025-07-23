// Modern JavaScript for APEX Interview Mastery Platform - Dark Mode Only
'use strict';

// Global state management
const AppState = {
    currentFilters: { category: 'all' },
    isMenuOpen: false,
    animations: true,
};

// Utility functions
const Utils = {
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
    },
    
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
        }
    },
    
    $(selector) { return document.querySelector(selector); },
    $$(selector) { return document.querySelectorAll(selector); },
    
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
            if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else if (key === 'className') {
                element.className = value;
            } else {
                element[key] = value;
            }
        });
        children.forEach(child => {
            element.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
        });
        return element;
    },
    
    animate(element, animation, duration = 600) {
        return new Promise(resolve => {
            element.style.animation = `${animation} ${duration}ms ease-out forwards`;
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, duration);
        });
    },

    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Enhanced Navigation management
const Navigation = {
    init() {
        this.mobileToggle = Utils.$('.mobile-menu-toggle');
        this.navMenu = Utils.$('.nav-menu');
        this.header = Utils.$('.header');
        this.bindEvents();
        this.handleActiveStates();
        this.initScrollEffects();
    },

    bindEvents() {
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (AppState.isMenuOpen && !e.target.closest('.main-nav')) {
                this.closeMobileMenu();
            }
        });

        // Close mobile menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && AppState.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', Utils.throttle(() => {
            if (window.innerWidth > 992 && AppState.isMenuOpen) {
                this.closeMobileMenu();
            }
        }, 250));
    },

    toggleMobileMenu() {
        AppState.isMenuOpen = !AppState.isMenuOpen;
        
        if (AppState.isMenuOpen) {
            this.openMobileMenu();
        } else {
            this.closeMobileMenu();
        }
    },

    openMobileMenu() {
        this.navMenu.classList.add('active');
        document.body.classList.add('menu-open');
        this.mobileToggle.setAttribute('aria-expanded', 'true');
        
        const icon = this.mobileToggle.querySelector('i');
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
        
        // Animate menu items
        const menuItems = Utils.$$('.nav-item');
        menuItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
                item.style.transition = 'all 0.3s ease';
            }, index * 100);
        });
    },

    closeMobileMenu() {
        AppState.isMenuOpen = false;
        this.navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
        this.mobileToggle.setAttribute('aria-expanded', 'false');
        
        const icon = this.mobileToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    },

    handleActiveStates() {
        const currentPath = window.location.pathname.split('/').pop();
        Utils.$$('.nav-item a').forEach(link => {
            const linkPath = new URL(link.href).pathname.split('/').pop();
            if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
                link.classList.add('active');
            }
        });
    },

    initScrollEffects() {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', Utils.throttle(() => {
            const currentScrollY = window.scrollY;
            
            // Header background opacity based on scroll
            if (currentScrollY > 100) {
                this.header.style.background = 'rgba(15, 15, 35, 0.95)';
                this.header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
            } else {
                this.header.style.background = 'rgba(15, 15, 35, 0.9)';
                this.header.style.boxShadow = 'none';
            }
            
            // Hide/show header based on scroll direction
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                this.header.style.transform = 'translateY(-100%)';
            } else {
                this.header.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        }, 100));
    }
};

// Enhanced Questions management
const Questions = {
    init() {
        this.container = Utils.$('#questionsContainer');
        if (!this.container) return;
        
        this.searchInput = Utils.$('#searchInput');
        this.filterTabs = Utils.$$('.filter-tab');
        
        this.bindEvents();
        this.setupSearch();
        this.initIntersectionObserver();
        this.addKeyboardNavigation();
    },

    bindEvents() {
        this.filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.filterQuestions(e.target.dataset.filter));
        });
        
        this.container.addEventListener('click', (e) => {
            const header = e.target.closest('.question-header');
            const copyBtn = e.target.closest('.copy-btn');
            
            if (header) this.toggleQuestion(header);
            if (copyBtn) this.copyCode(copyBtn);
        });

        // Add ripple effect to clickable elements
        this.container.addEventListener('mousedown', this.createRipple);
    },

    setupSearch() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', Utils.debounce((e) => {
                this.searchQuestions(e.target.value);
            }, 200));

            // Add search suggestions
            this.searchInput.addEventListener('focus', () => {
                this.showSearchSuggestions();
            });
        }
    },

    initIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        Utils.$$('.question-container').forEach(question => {
            observer.observe(question);
        });
    },

    addKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                if (this.searchInput) {
                    this.searchInput.focus();
                }
            }
        });
    },

    toggleQuestion(headerElement) {
        const content = headerElement.nextElementSibling;
        const toggleIcon = headerElement.querySelector('.question-toggle');
        const container = headerElement.closest('.question-container');
        
        const isOpen = content.style.display === 'block';
        
        if (isOpen) {
            // Close animation
            content.style.maxHeight = content.scrollHeight + 'px';
            content.offsetHeight; // Force reflow
            content.style.maxHeight = '0';
            content.style.opacity = '0';
            
            setTimeout(() => {
                content.style.display = 'none';
                content.style.maxHeight = '';
                content.style.opacity = '';
            }, 300);
            
            toggleIcon.classList.remove('rotated');
            container.classList.remove('active');
        } else {
            // Open animation
            content.style.display = 'block';
            content.style.maxHeight = '0';
            content.style.opacity = '0';
            
            const scrollHeight = content.scrollHeight;
            content.style.maxHeight = scrollHeight + 'px';
            content.style.opacity = '1';
            
            setTimeout(() => {
                content.style.maxHeight = '';
            }, 300);
            
            toggleIcon.classList.add('rotated');
            container.classList.add('active');
            
            // Smooth scroll to question if needed
            setTimeout(() => {
                if (!Utils.isInViewport(headerElement)) {
                    headerElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            }, 150);
        }
    },

    filterQuestions(category) {
        AppState.currentFilters.category = category;
        
        // Update active tab with animation
        this.filterTabs.forEach(tab => {
            const isActive = tab.dataset.filter === category;
            tab.classList.toggle('active', isActive);
            
            if (isActive) {
                Utils.animate(tab, 'pulse');
            }
        });
        
        this.applyFilters();
    },

    searchQuestions(searchTerm) {
        AppState.currentFilters.search = searchTerm.toLowerCase();
        this.applyFilters();
    },

    applyFilters() {
        const { category = 'all', search = '' } = AppState.currentFilters;
        let visibleCount = 0;
        
        Utils.$$('.question-container').forEach((question, index) => {
            const questionCategory = question.dataset.category;
            const questionText = question.textContent.toLowerCase();
            
            const categoryMatch = category === 'all' || questionCategory === category;
            const searchMatch = !search || questionText.includes(search);
            const shouldShow = categoryMatch && searchMatch;
            
            if (shouldShow) {
                question.style.display = 'block';
                question.style.opacity = '0';
                question.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    question.style.opacity = '1';
                    question.style.transform = 'translateY(0)';
                    question.style.transition = 'all 0.3s ease';
                }, index * 50);
                
                visibleCount++;
            } else {
                question.style.opacity = '0';
                question.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    question.style.display = 'none';
                }, 200);
            }
        });

        // Show no results message if needed
        this.showNoResultsMessage(visibleCount === 0);
    },

    showNoResultsMessage(show) {
        let noResultsEl = Utils.$('.no-results-message');
        
        if (show && !noResultsEl) {
            noResultsEl = Utils.createElement('div', {
                className: 'no-results-message fade-in',
                style: 'text-align: center; padding: 3rem; color: var(--text-muted);'
            }, [
                Utils.createElement('div', {
                    style: 'font-size: 3rem; margin-bottom: 1rem;'
                }, ['🔍']),
                Utils.createElement('h3', {}, ['No questions found']),
                Utils.createElement('p', {}, ['Try adjusting your search terms or filters'])
            ]);
            this.container.appendChild(noResultsEl);
        } else if (!show && noResultsEl) {
            noResultsEl.remove();
        }
    },

    async copyCode(buttonElement) {
        const codeText = buttonElement.closest('.code-block').querySelector('pre').textContent;
        
        try {
            await navigator.clipboard.writeText(codeText);
            
            const originalHTML = buttonElement.innerHTML;
            buttonElement.innerHTML = '<i class="fas fa-check"></i> Copied!';
            buttonElement.style.background = 'var(--success)';
            buttonElement.style.color = 'var(--text-white)';
            
            setTimeout(() => {
                buttonElement.innerHTML = originalHTML;
                buttonElement.style.background = '';
                buttonElement.style.color = '';
            }, 2000);
            
        } catch (err) {
            console.error('Failed to copy text: ', err);
            
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = codeText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            buttonElement.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                buttonElement.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 2000);
        }
    },

    createRipple(e) {
        const button = e.target.closest('.question-header, .filter-tab, .btn');
        if (!button) return;

        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
        circle.classList.add('ripple');

        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }

        button.appendChild(circle);
    },

    showSearchSuggestions() {
        // Add search suggestions functionality
        const suggestions = ['flexbox', 'grid', 'javascript', 'promises', 'async', 'sql', 'plsql'];
        // Implementation for search suggestions can be added here
    },

    createQuestionElement(q) {
        const difficultyClass = `difficulty-${q.difficulty}`;
        const container = Utils.createElement('div', {
            className: 'question-container',
            'data-category': q.category,
            'data-difficulty': q.difficulty,
        });

        container.innerHTML = `
            <div class="question-header" role="button" tabindex="0" aria-expanded="false">
                <div class="question-text">${q.question}</div>
                <div class="question-details">
                    <span class="difficulty-badge ${difficultyClass}">${q.difficulty}</span>
                    <div class="question-toggle"><i class="fas fa-chevron-down"></i></div>
                </div>
            </div>
            <div class="question-content" style="display: none;" aria-hidden="true">
                <div class="answer-content">${q.answer}</div>
                ${q.code ? `
                    <div class="code-block">
                        <div class="code-header">
                            <span class="code-lang">${q.language || 'Code'}</span>
                            <button class="copy-btn" aria-label="Copy code to clipboard">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <pre><code>${q.code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Add keyboard support for question headers
        const header = container.querySelector('.question-header');
        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleQuestion(header);
            }
        });
        
        return container;
    }
};

// Performance monitoring
const Performance = {
    init() {
        this.measureLoadTime();
        this.initLazyLoading();
    },

    measureLoadTime() {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`Page loaded in ${Math.round(loadTime)}ms`);
        });
    },

    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const lazyImages = Utils.$$('img[data-src]');
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }
};

// Enhanced scroll effects
const ScrollEffects = {
    init() {
        this.initParallax();
        this.initScrollToTop();
    },

    initParallax() {
        const parallaxElements = Utils.$$('[data-parallax]');
        
        window.addEventListener('scroll', Utils.throttle(() => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const rate = scrolled * -0.5;
                element.style.transform = `translateY(${rate}px)`;
            });
        }, 16));
    },

    initScrollToTop() {
        const scrollToTopBtn = Utils.createElement('button', {
            className: 'scroll-to-top',
            innerHTML: '<i class="fas fa-arrow-up"></i>',
            style: `
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                background: var(--primary);
                color: var(--text-white);
                border: none;
                border-radius: 50%;
                cursor: pointer;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 1000;
                box-shadow: var(--shadow-lg);
            `
        });

        document.body.appendChild(scrollToTopBtn);

        window.addEventListener('scroll', Utils.throttle(() => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.style.opacity = '1';
                scrollToTopBtn.style.visibility = 'visible';
            } else {
                scrollToTopBtn.style.opacity = '0';
                scrollToTopBtn.style.visibility = 'hidden';
            }
        }, 100));

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
};

// App initialization
class App {
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            Navigation.init();
            Questions.init();
            Performance.init();
            ScrollEffects.init();
            this.addGlobalStyles();
        });
    }

    addGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                background-color: rgba(229, 62, 62, 0.3);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                pointer-events: none;
            }

            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }

            .scroll-to-top:hover {
                transform: scale(1.1);
                background: var(--primary-light);
            }

            @media (prefers-reduced-motion: reduce) {
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Global functions for backward compatibility
window.filterQuestions = (category) => Questions.filterQuestions(category);
window.searchQuestions = () => Questions.searchQuestions(Utils.$('#searchInput').value);
window.createQuestionElement = (q) => Questions.createQuestionElement(q);

// Initialize the app
new App().init();
