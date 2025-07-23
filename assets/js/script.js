// Modern JavaScript for APEX Interview Mastery Platform - Dark Mode Only
'use strict';

// Global state management
const AppState = {
    currentFilters: { category: 'all' },
    isMenuOpen: false,
    isDarkMode: true, // Always dark mode
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
    
    animateElement(element, animation = 'fade-in') {
        element.classList.add(animation);
        return new Promise(resolve => {
            element.addEventListener('animationend', resolve, { once: true });
        });
    },
    
    copyToClipboard(text) {
        return navigator.clipboard.writeText(text).catch(err => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        });
    }
};

// Theme management - Always dark mode
const ThemeSwitcher = {
    init() {
        this.themeToggleBtn = Utils.$('#theme-toggle');
        this.body = document.body;
        this.bindEvents();
        this.setDarkMode();
    },

    bindEvents() {
        if (this.themeToggleBtn) {
            // Remove the theme toggle functionality, just show dark mode icon
            this.themeToggleBtn.addEventListener('click', () => {
                this.showDarkModeMessage();
            });
        }
    },

    setDarkMode() {
        // Always set dark mode
        this.body.classList.add('dark-mode');
        this.updateIcon();
    },

    showDarkModeMessage() {
        // Show a subtle message that only dark mode is available
        this.showToast('Dark mode is always active for the best experience! 🌙', 'info');
    },
    
    updateIcon() {
        if (this.themeToggleBtn) {
            const icon = this.themeToggleBtn.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-moon';
            }
        }
    },

    showToast(message, type = 'info') {
        const toast = Utils.createElement('div', {
            className: `toast toast-${type}`,
            innerHTML: message
        });
        
        const toastStyles = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--bg-primary);
            color: var(--text-primary);
            padding: 1rem 1.5rem;
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-xl);
            border: 1px solid var(--border-light);
            z-index: 10000;
            transform: translateX(400px);
            transition: all 0.3s ease;
            max-width: 300px;
        `;
        
        toast.style.cssText = toastStyles;
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
};

// Navigation management with improved animations
const Navigation = {
    init() {
        this.mobileToggle = Utils.$('.mobile-menu-toggle');
        this.navMenu = Utils.$('.nav-menu');
        this.header = Utils.$('.header');
        this.bindEvents();
        this.handleActiveStates();
        this.initScrollEffect();
    },

    bindEvents() {
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (AppState.isMenuOpen && 
                !this.navMenu.contains(e.target) && 
                !this.mobileToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && AppState.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
    },

    toggleMobileMenu() {
        if (AppState.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    },

    openMobileMenu() {
        AppState.isMenuOpen = true;
        this.navMenu.classList.add('active');
        document.body.classList.add('menu-open');
        this.mobileToggle.setAttribute('aria-expanded', 'true');
        
        const icon = this.mobileToggle.querySelector('i');
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
        
        // Animate menu items
        Utils.$$('.nav-item').forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
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

    initScrollEffect() {
        let lastScrollY = window.scrollY;
        
        const handleScroll = Utils.throttle(() => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                this.header.style.background = 'rgba(26, 32, 44, 0.95)';
                this.header.style.backdropFilter = 'blur(20px)';
            } else {
                this.header.style.background = 'rgba(26, 32, 44, 0.9)';
                this.header.style.backdropFilter = 'blur(10px)';
            }
            
            // Hide header on scroll down, show on scroll up
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                this.header.style.transform = 'translateY(-100%)';
            } else {
                this.header.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        }, 100);
        
        window.addEventListener('scroll', handleScroll);
    },

    handleActiveStates() {
        const currentPath = window.location.pathname.split('/').pop();
        Utils.$$('.nav-item a').forEach(link => {
            const linkPath = new URL(link.href).pathname.split('/').pop();
            if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
                link.classList.add('active');
            }
        });
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
    },

    bindEvents() {
        // Filter tabs
        this.filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterQuestions(e.target.dataset.filter);
            });
        });

        // Question interactions
        this.container.addEventListener('click', (e) => {
            const header = e.target.closest('.question-header');
            const copyBtn = e.target.closest('.copy-btn');
            
            if (header) this.toggleQuestion(header);
            if (copyBtn) this.copyCode(copyBtn);
        });

        // Keyboard navigation
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const header = e.target.closest('.question-header');
                if (header) {
                    e.preventDefault();
                    this.toggleQuestion(header);
                }
            }
        });
    },

    setupSearch() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', Utils.debounce((e) => {
                this.searchQuestions(e.target.value);
            }, 300));

            // Clear search on escape
            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    e.target.value = '';
                    this.searchQuestions('');
                }
            });
        }
    },

    initIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    Utils.animateElement(entry.target, 'fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        Utils.$$('.question-container').forEach(question => {
            observer.observe(question);
        });
    },

    toggleQuestion(headerElement) {
        const content = headerElement.nextElementSibling;
        const toggleIcon = headerElement.querySelector('.question-toggle');
        const isOpen = content.style.display === 'block';
        
        // Close all other questions for accordion effect
        Utils.$$('.question-content').forEach(otherContent => {
            if (otherContent !== content && otherContent.style.display === 'block') {
                otherContent.style.display = 'none';
                const otherToggle = otherContent.previousElementSibling.querySelector('.question-toggle');
                otherToggle.classList.remove('rotated');
            }
        });
        
        if (isOpen) {
            content.style.display = 'none';
            toggleIcon.classList.remove('rotated');
        } else {
            content.style.display = 'block';
            toggleIcon.classList.add('rotated');
            
            // Smooth scroll to question
            setTimeout(() => {
                headerElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }

        // Add accessibility attributes
        headerElement.setAttribute('aria-expanded', !isOpen);
    },

    filterQuestions(category) {
        AppState.currentFilters.category = category;
        
        // Update active tab
        this.filterTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === category);
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
                question.style.animationDelay = `${visibleCount * 0.1}s`;
                Utils.animateElement(question, 'fade-in');
                visibleCount++;
            } else {
                question.style.display = 'none';
            }
        });

        // Show no results message
        this.showNoResultsMessage(visibleCount === 0);
    },

    showNoResultsMessage(show) {
        let noResultsMsg = Utils.$('.no-results-message');
        
        if (show && !noResultsMsg) {
            noResultsMsg = Utils.createElement('div', {
                className: 'no-results-message',
                innerHTML: `
                    <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
                        <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <h3>No questions found</h3>
                        <p>Try adjusting your search terms or filters</p>
                    </div>
                `
            });
            this.container.appendChild(noResultsMsg);
        } else if (!show && noResultsMsg) {
            noResultsMsg.remove();
        }
    },

    async copyCode(buttonElement) {
        const codeText = buttonElement.closest('.code-block').querySelector('pre').textContent;
        const originalHTML = buttonElement.innerHTML;
        
        try {
            await Utils.copyToClipboard(codeText);
            
            // Success feedback
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
            
            // Error feedback
            buttonElement.innerHTML = '<i class="fas fa-times"></i> Failed';
            buttonElement.style.background = 'var(--accent)';
            buttonElement.style.color = 'var(--text-white)';
            
            setTimeout(() => {
                buttonElement.innerHTML = originalHTML;
                buttonElement.style.background = '';
                buttonElement.style.color = '';
            }, 2000);
        }
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
            <div class="question-content" style="display: none;" role="region">
                <div class="answer-content">${q.answer}</div>
                ${q.code ? `
                    <div class="code-block">
                        <div class="code-header">
                            <span class="code-lang">${q.language || 'Code'}</span>
                            <button class="copy-btn" title="Copy code to clipboard">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <pre><code>${this.escapeHtml(q.code)}</code></pre>
                    </div>
                ` : ''}
            </div>
        `;
        
        return container;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Performance monitoring
const Performance = {
    init() {
        this.measurePageLoad();
        this.observeLargestContentfulPaint();
    },

    measurePageLoad() {
        window.addEventListener('load', () => {
            const navigationTiming = performance.getEntriesByType('navigation')[0];
            const loadTime = navigationTiming.loadEventEnd - navigationTiming.loadEventStart;
            console.log(`Page loaded in ${loadTime}ms`);
        });
    },

    observeLargestContentfulPaint() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log(`LCP: ${lastEntry.startTime}ms`);
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }
};

// App initialization
class App {
    constructor() {
        this.components = [
            ThemeSwitcher,
            Navigation,
            Questions,
            Performance
        ];
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        // Initialize all components
        this.components.forEach(component => {
            try {
                component.init();
            } catch (error) {
                console.error(`Failed to initialize ${component.constructor.name}:`, error);
            }
        });

        // Add loaded class to body for CSS transitions
        document.body.classList.add('loaded');
        
        console.log('🚀 APEX Interview Mastery Platform initialized successfully!');
    }
}

// Global functions for backward compatibility
window.filterQuestions = (category) => Questions.filterQuestions(category);
window.searchQuestions = () => Questions.searchQuestions(Utils.$('#searchInput')?.value || '');
window.createQuestionElement = (q) => Questions.createQuestionElement(q);

// Initialize the app
const app = new App();
app.init();

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered: ', registration))
            .catch(registrationError => console.log('SW registration failed: ', registrationError));
    });
}
