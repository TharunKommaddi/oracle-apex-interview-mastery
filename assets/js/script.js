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
        this.filterQuestions();
    }

    setSearchTerm(term) {
        this.searchTerm = term.toLowerCase();
        this.filterQuestions();
    }

    filterQuestions() {
        this.filteredQuestions = this.questions.filter(question => {
            const matchesFilter = this.currentFilter === 'all' || 
                                question.difficulty === this.currentFilter ||
                                question.category === this.currentFilter;
            
            const matchesSearch = !this.searchTerm || 
                                question.question.toLowerCase().includes(this.searchTerm) ||
                                question.answer.toLowerCase().includes(this.searchTerm);
            
            return matchesFilter && matchesSearch;
        });
        
        this.renderQuestions();
    }

    updateActiveButton(activeButton) {
        document.querySelectorAll('.filter-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        activeButton.classList.add('active');
    }

    renderQuestions() {
        const container = document.getElementById('questionsContainer');
        if (!container) return;

        if (this.filteredQuestions.length === 0) {
            container.innerHTML = this.getNoResultsHTML();
            return;
        }

        container.innerHTML = '';
        this.filteredQuestions.forEach((question, index) => {
            const questionElement = this.createQuestionElement(question, index);
            container.appendChild(questionElement);
        });

        // Re-observe new elements for animations
        if (window.apexMastery && window.apexMastery.observer) {
            container.querySelectorAll('.question-container').forEach(el => {
                window.apexMastery.observer.observe(el);
            });
        }
    }

    createQuestionElement(question, index) {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-container';
        questionDiv.innerHTML = `
            <div class="question-header">
                <div class="question-number">${question.id}</div>
                <div class="question-text">${question.question}</div>
                <div class="question-meta">
                    <span class="difficulty-badge difficulty-${question.difficulty}">${question.difficulty}</span>
                    <i class="fas fa-chevron-down question-toggle"></i>
                </div>
            </div>
            <div class="question-content">
                <div class="question-answer">
                    <p>${question.answer}</p>
                </div>
                ${question.code ? this.createCodeBlock(question.code, question.language) : ''}
            </div>
        `;
        return questionDiv;
    }

    createCodeBlock(code, language) {
        return `
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">${language}</span>
                    <button class="copy-btn">
                        <i class="fas fa-copy"></i>
                        Copy
                    </button>
                </div>
                <pre><code>${this.escapeHtml(code)}</code></pre>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getNoResultsHTML() {
        return `
            <div class="no-results">
                <div class="no-results-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No questions found</h3>
                <p>Try adjusting your search terms or filters</p>
            </div>
        `;
    }

    loadQuestions(questions) {
        this.questions = questions;
        this.filteredQuestions = questions;
        this.renderQuestions();
    }
}

// Global functions for backward compatibility
window.filterQuestions = function(filter) {
    if (window.questionManager) {
        window.questionManager.setFilter(filter);
    }
};

window.searchQuestions = function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput && window.questionManager) {
        window.questionManager.setSearchTerm(searchInput.value);
    }
};

window.toggleMobileMenu = function() {
    if (window.apexMastery) {
        window.apexMastery.toggleMobileMenu();
    }
};

window.createQuestionElement = function(question) {
    if (window.questionManager) {
        return window.questionManager.createQuestionElement(question, 0);
    }
    return document.createElement('div');
};

// Performance optimization
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.setupPreloading();
        this.optimizeImages();
    }

    setupLazyLoading() {
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
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

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            images.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
            });
        }
    }

    setupPreloading() {
        // Preload critical resources
        const criticalLinks = [
            'oracle-sql.html',
            'oracle-apex.html',
            'plsql.html'
        ];

        criticalLinks.forEach(link => {
            const linkElement = document.createElement('link');
            linkElement.rel = 'prefetch';
            linkElement.href = link;
            document.head.appendChild(linkElement);
        });
    }

    optimizeImages() {
        // Add loading="lazy" to images
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            img.loading = 'lazy';
        });
    }
}

// Accessibility enhancements
class AccessibilityEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.setupFocusManagement();
        this.setupAriaLabels();
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
    }

    setupFocusManagement() {
        // Focus management for mobile menu
        const mobileToggle = document.getElementById('mobileToggle');
        const navMenu = document.getElementById('navMenu');

        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    // Focus first nav item when menu opens
                    const firstNavItem = navMenu.querySelector('.nav-link');
                    if (firstNavItem) {
                        setTimeout(() => firstNavItem.focus(), 100);
                    }
                }
            });
        }
    }

    setupAriaLabels() {
        // Add aria labels to interactive elements
        const buttons = document.querySelectorAll('button:not([aria-label])');
        buttons.forEach(button => {
            if (button.id === 'mobileToggle') {
                button.setAttribute('aria-label', 'Toggle mobile menu');
            }
            if (button.classList.contains('copy-btn')) {
                button.setAttribute('aria-label', 'Copy code to clipboard');
            }
        });

        // Add aria-expanded to dropdowns
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        dropdownToggles.forEach(toggle => {
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-haspopup', 'true');
        });
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard navigation for questions
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const target = e.target;
                if (target.closest('.question-header')) {
                    e.preventDefault();
                    target.click();
                }
            }
        });
    }

    setupScreenReaderSupport() {
        // Add screen reader announcements
        const announcer = document.createElement('div');
        announcer.id = 'screen-reader-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.position = 'absolute';
        announcer.style.left = '-10000px';
        announcer.style.width = '1px';
        announcer.style.height = '1px';
        announcer.style.overflow = 'hidden';
        document.body.appendChild(announcer);

        this.announcer = announcer;
    }

    announce(message) {
        if (this.announcer) {
            this.announcer.textContent = message;
        }
    }
}

// Analytics and tracking
class AnalyticsTracker {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventTracking();
        this.setupPerformanceTracking();
    }

    setupEventTracking() {
        // Track button clicks
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a, button');
            if (target) {
                this.trackEvent('click', {
                    element: target.tagName.toLowerCase(),
                    text: target.textContent.trim(),
                    href: target.href || null
                });
            }
        });

        // Track search usage
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.trackEvent('search', {
                        query: searchInput.value,
                        resultsCount: document.querySelectorAll('.question-container').length
                    });
                }, 1000);
            });
        }
    }

    setupPerformanceTracking() {
        // Track page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                this.trackEvent('performance', {
                    loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    firstContentfulPaint: this.getFirstContentfulPaint()
                });
            }, 0);
        });
    }

    getFirstContentfulPaint() {
        const entries = performance.getEntriesByType('paint');
        const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
        return fcp ? fcp.startTime : null;
    }

    trackEvent(eventName, data) {
        // This would integrate with your analytics service
        console.log(`Analytics Event: ${eventName}`, data);
        
        // Example: Send to Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, data);
        }
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main application
    window.apexMastery = new APEXMastery();
    window.questionManager = new QuestionManager();
    window.performanceOptimizer = new PerformanceOptimizer();
    window.accessibilityEnhancer = new AccessibilityEnhancer();
    window.analyticsTracker = new AnalyticsTracker();

    // Add CSS for additional styling
    const additionalStyles = `
        .no-results {
            text-align: center;
            padding: 4rem 2rem;
            color: var(--neutral-500);
        }
        
        .no-results-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .no-results h3 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            color: var(--neutral-700);
        }
        
        .question-meta {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .question-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.5rem;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
        
        .question-header:hover {
            background-color: var(--neutral-50);
        }
        
        .question-text {
            flex: 1;
            font-weight: 600;
            color: var(--neutral-800);
        }
        
        .question-toggle {
            transition: transform 0.3s ease;
        }
        
        .question-toggle.rotated {
            transform: rotate(180deg);
        }
        
        .question-content {
            display: none;
            padding: 2rem;
            border-top: 1px solid var(--neutral-200);
            background: white;
        }
        
        .question-content.active {
            display: block;
            animation: fadeInUp 0.3s ease;
        }
        
        .question-answer {
            margin-bottom: 1.5rem;
            line-height: 1.7;
            color: var(--neutral-700);
        }
        
        .code-block {
            background: var(--neutral-900);
            border-radius: var(--radius-lg);
            overflow: hidden;
            margin: 1rem 0;
        }
        
        .code-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            background: var(--neutral-800);
            border-bottom: 1px solid var(--neutral-700);
        }
        
        .code-lang {
            background: var(--primary-600);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: var(--radius-full);
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .copy-btn {
            background: transparent;
            border: 1px solid var(--neutral-600);
            color: var(--neutral-300);
            padding: 0.25rem 0.75rem;
            border-radius: var(--radius-md);
            font-size: 0.75rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .copy-btn:hover {
            background: var(--neutral-700);
            border-color: var(--neutral-500);
        }
        
        .code-block pre {
            padding: 1.5rem;
            margin: 0;
            overflow-x: auto;
            color: var(--neutral-100);
            font-family: 'Fira Code', 'Courier New', monospace;
            font-size: 0.875rem;
            line-height: 1.6;
        }
        
        .navbar.scrolled {
            background: rgba(255, 255, 255, 0.98);
            box-shadow: var(--shadow-lg);
        }
        
        .floating-card {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.6s ease;
        }
        
        .keyboard-navigation *:focus {
            outline: 2px solid var(--primary-500);
            outline-offset: 2px;
        }
        
        @media (max-width: 768px) {
            .question-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }
            
            .question-meta {
                align-self: flex-end;
            }
            
            .question-text {
                margin-bottom: 0.5rem;
            }
        }
    `;

    // Inject additional styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = additionalStyles;
    document.head.appendChild(styleSheet);

    // Set up CSS custom properties for JavaScript
    document.documentElement.style.setProperty('--js-scroll-y', '0px');
    
    // Update scroll position for CSS
    window.addEventListener('scroll', () => {
        document.documentElement.style.setProperty('--js-scroll-y', `${window.scrollY}px`);
    });
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered successfully');
            })
            .catch(error => {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Export for module usage
export { APEXMastery, QuestionManager, PerformanceOptimizer, AccessibilityEnhancer, AnalyticsTracker };
