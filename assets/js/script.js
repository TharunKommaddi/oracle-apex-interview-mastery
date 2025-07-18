// Modern JavaScript for APEX Interview Mastery Platform
'use strict';

// Utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// State management
const AppState = {
    isMenuOpen: false,
    currentFilter: 'all',
    questions: [],
    observers: new Map()
};

// Debounce utility
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Navigation Module
const Navigation = {
    init() {
        this.mobileToggle = $('#mobileToggle');
        this.navMenu = $('#navMenu');
        this.navbar = $('.navbar');
        
        this.bindEvents();
        this.handleScroll();
    },

    bindEvents() {
        // Mobile menu toggle
        this.mobileToggle?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMobileMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (AppState.isMenuOpen && 
                !this.navMenu.contains(e.target) && 
                !this.mobileToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Close menu on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && AppState.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Close menu when clicking nav links on mobile
        $$('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (AppState.isMenuOpen && window.innerWidth <= 768) {
                    setTimeout(() => this.closeMobileMenu(), 150);
                }
            });
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && AppState.isMenuOpen) {
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
        this.navMenu.classList.add('active');
        this.mobileToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
        AppState.isMenuOpen = true;
        
        // Focus first link for accessibility
        const firstLink = this.navMenu.querySelector('.nav-link');
        setTimeout(() => firstLink?.focus(), 100);
    },

    closeMobileMenu() {
        this.navMenu.classList.remove('active');
        this.mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
        AppState.isMenuOpen = false;
        
        // Return focus to toggle
        this.mobileToggle.focus();
    },

    handleScroll() {
        let lastScrollY = window.scrollY;
        
        const updateNavbar = () => {
            const scrollY = window.scrollY;
            
            if (scrollY > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
            
            lastScrollY = scrollY;
        };

        window.addEventListener('scroll', debounce(updateNavbar, 10), { passive: true });
    }
};

// Questions Module
const Questions = {
    container: null,
    searchInput: null,

    init() {
        this.container = $('#questionsContainer');
        this.searchInput = $('#searchInput');
        
        if (this.container) {
            this.bindEvents();
            this.setupSearch();
        }
    },

    bindEvents() {
        // Filter tabs
        $$('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = this.getCategoryFromText(e.target.textContent);
                this.filterQuestions(category);
            });
        });

        // Question toggles
        this.container?.addEventListener('click', (e) => {
            const header = e.target.closest('.question-header');
            if (header) {
                this.toggleQuestion(header);
            }
        });

        // Copy code functionality
        this.container?.addEventListener('click', (e) => {
            const copyBtn = e.target.closest('.copy-btn');
            if (copyBtn) {
                this.copyCode(copyBtn);
            }
        });
    },

    setupSearch() {
        if (this.searchInput) {
            const debouncedSearch = debounce((term) => {
                this.searchQuestions(term);
            }, 300);

            this.searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });

            // Clear search on escape
            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    e.target.value = '';
                    this.searchQuestions('');
                }
            });
        }
    },

    getCategoryFromText(text) {
        const normalized = text.toLowerCase().replace(/\s+/g, '');
        if (normalized.includes('all')) return 'all';
        if (normalized.includes('basic')) return 'basic';
        if (normalized.includes('intermediate')) return 'intermediate';
        if (normalized.includes('advanced')) return 'advanced';
        return 'all';
    },

    toggleQuestion(headerElement) {
        const questionContainer = headerElement.closest('.question-container');
        const content = questionContainer.querySelector('.question-content');
        const toggle = headerElement.querySelector('.question-toggle');
        
        const isActive = content.classList.contains('active');
        
        // Close other questions (accordion behavior)
        $$('.question-content.active').forEach(activeContent => {
            if (activeContent !== content) {
                activeContent.classList.remove('active');
                const activeToggle = activeContent.closest('.question-container')
                    .querySelector('.question-toggle');
                activeToggle?.classList.remove('rotated');
            }
        });
        
        // Toggle current question
        content.classList.toggle('active', !isActive);
        toggle?.classList.toggle('rotated', !isActive);
        
        // Scroll to question if opening
        if (!isActive) {
            setTimeout(() => {
                headerElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
    },

    filterQuestions(category) {
        AppState.currentFilter = category;
        
        // Update active filter tab
        $$('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
            if (this.getCategoryFromText(tab.textContent) === category) {
                tab.classList.add('active');
            }
        });
        
        // Filter questions
        const questions = $$('.question-container');
        let visibleCount = 0;
        
        questions.forEach(question => {
            const questionCategory = question.getAttribute('data-category');
            const shouldShow = category === 'all' || questionCategory === category;
            
            if (shouldShow) {
                question.style.display = 'block';
                question.classList.add('fade-in');
                visibleCount++;
            } else {
                question.style.display = 'none';
                question.classList.remove('fade-in');
            }
        });

        this.showFilterMessage(visibleCount, category);
    },

    searchQuestions(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const questions = $$('.question-container');
        let visibleCount = 0;
        
        questions.forEach(question => {
            const questionText = question.querySelector('.question-text')?.textContent.toLowerCase() || '';
            const answerText = question.querySelector('.answer-content')?.textContent.toLowerCase() || '';
            const codeText = question.querySelector('pre')?.textContent.toLowerCase() || '';
            
            const matches = !term || 
                           questionText.includes(term) || 
                           answerText.includes(term) ||
                           codeText.includes(term);
            
            // Check if it also passes current filter
            const category = AppState.currentFilter;
            const questionCategory = question.getAttribute('data-category');
            const passesFilter = category === 'all' || questionCategory === category;
            
            const shouldShow = matches && passesFilter;
            
            if (shouldShow) {
                question.style.display = 'block';
                visibleCount++;
                
                // Highlight search terms
                if (term) {
                    this.highlightSearchTerm(question, term);
                } else {
                    this.removeHighlights(question);
                }
            } else {
                question.style.display = 'none';
            }
        });

        this.showSearchMessage(visibleCount, term);
    },

    highlightSearchTerm(element, term) {
        // Remove existing highlights
        this.removeHighlights(element);
        
        // Simple highlighting implementation
        const walker = document.createTreeWalker(
            element.querySelector('.question-content') || element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        
        while (node = walker.nextNode()) {
            if (node.nodeValue.toLowerCase().includes(term)) {
                textNodes.push(node);
            }
        }
        
        textNodes.forEach(textNode => {
            const parent = textNode.parentNode;
            if (parent.tagName !== 'MARK') {
                const text = textNode.nodeValue;
                const regex = new RegExp(`(${term})`, 'gi');
                const highlightedText = text.replace(regex, '<mark class="search-highlight">$1</mark>');
                
                const wrapper = document.createElement('span');
                wrapper.innerHTML = highlightedText;
                parent.replaceChild(wrapper, textNode);
            }
        });
    },

    removeHighlights(element) {
        $('.search-highlight', element).forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
    },

    showFilterMessage(count, category) {
        const existing = $('.filter-message');
        existing?.remove();
        
        if (count === 0) {
            const message = this.createElement('div', {
                className: 'filter-message',
                innerHTML: `
                    <div style="text-align: center; padding: 3rem; color: var(--gray-500);">
                        <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <p style="font-size: 1.125rem; margin: 0;">No questions found for "${category}" category.</p>
                    </div>
                `
            });
            this.container.appendChild(message);
        }
    },

    showSearchMessage(count, term) {
        const existing = $('.search-message');
        existing?.remove();
        
        if (term && count === 0) {
            const message = this.createElement('div', {
                className: 'search-message',
                innerHTML: `
                    <div style="text-align: center; padding: 3rem; color: var(--gray-500);">
                        <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <p style="font-size: 1.125rem; margin-bottom: 1rem;">No questions found matching "${term}".</p>
                        <button onclick="Questions.clearSearch()" 
                                style="padding: 0.5rem 1rem; background: var(--primary); color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
                            Clear Search
                        </button>
                    </div>
                `
            });
            this.container.appendChild(message);
        } else if (term && count > 0) {
            const message = this.createElement('div', {
                className: 'search-message',
                innerHTML: `
                    <div style="padding: 1rem; margin-bottom: 1rem; background: var(--gray-50); border-radius: 0.75rem; border-left: 4px solid var(--primary);">
                        <p style="margin: 0; color: var(--gray-700);">
                            <i class="fas fa-info-circle"></i> 
                            Found ${count} question${count !== 1 ? 's' : ''} matching "${term}"
                        </p>
                    </div>
                `
            });
            this.container.insertBefore(message, this.container.firstChild);
        }
    },

    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
            this.searchQuestions('');
        }
    },

    async copyCode(buttonElement) {
        const codeBlock = buttonElement.closest('.code-block');
        const codeText = codeBlock.querySelector('pre').textContent;
        
        try {
            await navigator.clipboard.writeText(codeText);
            this.showCopySuccess(buttonElement);
        } catch (err) {
            // Fallback for older browsers
            this.fallbackCopyTextToClipboard(codeText, buttonElement);
        }
    },

    fallbackCopyTextToClipboard(text, buttonElement) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showCopySuccess(buttonElement);
        } catch (err) {
            console.error('Copy failed:', err);
            this.showCopyError(buttonElement);
        }
        
        document.body.removeChild(textArea);
    },

    showCopySuccess(buttonElement) {
        const originalContent = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="fas fa-check"></i> Copied!';
        buttonElement.classList.add('success');
        
        setTimeout(() => {
            buttonElement.innerHTML = originalContent;
            buttonElement.classList.remove('success');
        }, 2000);
    },

    showCopyError(buttonElement) {
        const originalContent = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="fas fa-times"></i> Failed';
        buttonElement.classList.add('error');
        
        setTimeout(() => {
            buttonElement.innerHTML = originalContent;
            buttonElement.classList.remove('error');
        }, 2000);
    },

    createElement(tag, attributes = {}) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else {
                element[key] = value;
            }
        });

        return element;
    },

    createQuestionElement(question) {
        const difficultyClass = this.getDifficultyClass(question.difficulty);
        const difficultyLabel = question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1);
        
        const questionElement = this.createElement('div', {
            className: 'question-container',
            'data-category': question.category,
            'data-difficulty': question.difficulty
        });

        questionElement.innerHTML = `
            <div class="question-header" role="button" tabindex="0" aria-expanded="false">
                <div class="question-number">Q${question.id}</div>
                <div class="question-text">${question.question}</div>
                <div class="difficulty-badge ${difficultyClass}">${difficultyLabel}</div>
                <div class="question-toggle"><i class="fas fa-chevron-down"></i></div>
            </div>
            <div class="question-content">
                <div class="answer-content">
                    ${question.answer}
                </div>
                ${question.code ? `
                    <div class="code-block">
                        <div class="code-header">
                            <span class="code-lang">${question.language || 'Code'}</span>
                            <button class="copy-btn" aria-label="Copy code">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <pre><code>${this.escapeHtml(question.code)}</code></pre>
                    </div>
                ` : ''}
            </div>
        `;
        
        return questionElement;
    },

    getDifficultyClass(difficulty) {
        const classes = {
            'basic': 'difficulty-basic',
            'intermediate': 'difficulty-intermediate',
            'advanced': 'difficulty-advanced'
        };
        return classes[difficulty] || 'difficulty-basic';
    },

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};

// Animations Module
const Animations = {
    init() {
        this.setupIntersectionObserver();
        this.setupScrollEffects();
    },

    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                        
                        // Stagger animation for multiple elements
                        const siblings = Array.from(entry.target.parentElement?.children || []);
                        const index = siblings.indexOf(entry.target);
                        entry.target.style.animationDelay = `${index * 0.1}s`;
                    }
                });
            }, observerOptions);

            // Observe elements for animation
            $('.feature-card, .question-container').forEach(el => {
                observer.observe(el);
            });

            AppState.observers.set('fadeIn', observer);
        }
    },

    setupScrollEffects() {
        // Parallax effect for hero section
        const hero = $('.hero');
        if (hero) {
            const handleScroll = () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                hero.style.transform = `translateY(${rate}px)`;
            };

            window.addEventListener('scroll', debounce(handleScroll, 10), { passive: true });
        }
    }
};

// Accessibility Module
const Accessibility = {
    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupReducedMotion();
    },

    setupKeyboardNavigation() {
        // Question toggle with keyboard
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.question-header') && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                Questions.toggleQuestion(e.target.closest('.question-header'));
            }
        });
    },

    setupFocusManagement() {
        // Skip to main content link
        const skipLink = Questions.createElement('a', {
            href: '#main-content',
            className: 'skip-link sr-only',
            innerHTML: 'Skip to main content',
            style: 'position: absolute; left: -9999px; top: auto; width: 1px; height: 1px; overflow: hidden;'
        });

        skipLink.addEventListener('focus', () => {
            skipLink.style.position = 'fixed';
            skipLink.style.top = '0';
            skipLink.style.left = '0';
            skipLink.style.width = 'auto';
            skipLink.style.height = 'auto';
            skipLink.style.overflow = 'visible';
            skipLink.style.zIndex = '9999';
            skipLink.style.padding = '1rem';
            skipLink.style.background = 'var(--primary)';
            skipLink.style.color = 'white';
            skipLink.style.textDecoration = 'none';
        });

        skipLink.addEventListener('blur', () => {
            skipLink.style.position = 'absolute';
            skipLink.style.left = '-9999px';
            skipLink.style.top = 'auto';
            skipLink.style.width = '1px';
            skipLink.style.height = '1px';
            skipLink.style.overflow = 'hidden';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
    },

    setupReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const handleMotionPreference = (e) => {
            if (e.matches) {
                document.documentElement.style.setProperty('--transition-fast', '0.01ms');
                document.documentElement.style.setProperty('--transition-normal', '0.01ms');
                document.documentElement.style.setProperty('--transition-slow', '0.01ms');
            } else {
                document.documentElement.style.removeProperty('--transition-fast');
                document.documentElement.style.removeProperty('--transition-normal');
                document.documentElement.style.removeProperty('--transition-slow');
            }
        };

        handleMotionPreference(prefersReducedMotion);
        prefersReducedMotion.addEventListener('change', handleMotionPreference);
    }
};

// Error Handler
const ErrorHandler = {
    init() {
        window.addEventListener('error', this.handleError.bind(this));
        window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    },

    handleError(event) {
        console.error('JavaScript Error:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        });
        
        this.showUserError('Something went wrong. Please refresh the page and try again.');
    },

    handlePromiseRejection(event) {
        console.error('Unhandled Promise Rejection:', event.reason);
        event.preventDefault();
        this.showUserError('An error occurred while loading content. Please try again.');
    },

    showUserError(message) {
        // Create toast notification
        const toast = Questions.createElement('div', {
            className: 'error-toast',
            style: `
                position: fixed;
                top: 100px;
                right: 1rem;
                background: var(--danger);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-lg);
                z-index: 9999;
                max-width: 300px;
                transform: translateX(400px);
                transition: transform 0.3s ease;
            `
        });

        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Hide after 5 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }
};

// App Initialization
class App {
    constructor() {
        this.modules = [
            Navigation,
            Questions,
            Animations,
            Accessibility,
            ErrorHandler
        ];
    }

    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize all modules
            this.modules.forEach(module => {
                try {
                    module.init();
                } catch (error) {
                    console.error(`Error initializing ${module.constructor?.name || 'module'}:`, error);
                }
            });

            // Set active navigation
            this.setActiveNavigation();

            // Mark app as ready
            document.documentElement.classList.add('app-ready');
            
            console.log('🚀 APEX Interview Mastery app initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            ErrorHandler.showUserError('Failed to initialize the application. Please refresh the page.');
        }
    }

    setActiveNavigation() {
        const currentPath = window.location.pathname;
        const navLinks = $('.nav-link');
        
        navLinks.forEach(link => {
            const linkPath = new URL(link.href, window.location.origin).pathname;
            link.classList.toggle('active', linkPath === currentPath);
        });
    }

    destroy() {
        // Cleanup observers and event listeners
        AppState.observers.forEach(observer => {
            observer.disconnect();
        });
        AppState.observers.clear();
        
        console.log('App destroyed and cleaned up');
    }
}

// Global functions for backward compatibility
window.toggleMobileMenu = () => Navigation.toggleMobileMenu();
window.toggleQuestion = (element) => Questions.toggleQuestion(element);
window.filterQuestions = (category) => Questions.filterQuestions(category);
window.searchQuestions = (term) => Questions.searchQuestions(term || '');
window.copyCode = (element) => Questions.copyCode(element);
window.createQuestionElement = (question) => Questions.createQuestionElement(question);

// Initialize app
const app = new App();
app.init();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App, Navigation, Questions, Animations, Accessibility, ErrorHandler };
}
