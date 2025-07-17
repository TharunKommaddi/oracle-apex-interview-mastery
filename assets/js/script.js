// Modern JavaScript for APEX Interview Mastery Platform
'use strict';




// Global state management
const AppState = {
    currentFilters: { category: 'all' },
    isMenuOpen: false,
    loadingStates: new Set(),
    observers: new Map()
};

// Utility functions
const Utils = {
    // Debounce function for search
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

    // Throttle function for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Modern element selection
    $(selector) {
        return document.querySelector(selector);
    },

    $$(selector) {
        return document.querySelectorAll(selector);
    },

    // Create element with attributes and children
    createElement(tag, attributes = {}, children = []) {
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

        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });

        return element;
    },

    // Show loading state
    showLoading(elementId) {
        const element = Utils.$(elementId);
        if (element) {
            AppState.loadingStates.add(elementId);
            element.innerHTML = `
                <div class="loading">
                    <i class="fas fa-spinner"></i>
                    <span>Loading...</span>
                </div>
            `;
        }
    },

    // Hide loading state
    hideLoading(elementId) {
        AppState.loadingStates.delete(elementId);
    }
};

// Navigation management
const Navigation = {
    init() {
        this.bindEvents();
        this.handleActiveStates();
        this.setupIntersectionObserver();
    },

    bindEvents() {
        // Mobile menu toggle with proper event handling
        const mobileToggle = Utils.$('.mobile-menu-toggle');
        if (mobileToggle) {
            // Remove any existing onclick to prevent conflicts
            mobileToggle.removeAttribute('onclick');
            mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMobileMenu();
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const navMenu = Utils.$('.nav-menu');
            const mobileToggle = Utils.$('.mobile-menu-toggle');
            
            if (navMenu && navMenu.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                !mobileToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Handle escape key to close menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && AppState.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Smooth scroll for anchor links
        Utils.$('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', this.handleSmoothScroll);
        });

        // Handle window resize
        window.addEventListener('resize', Utils.throttle(() => {
            if (window.innerWidth > 768 && AppState.isMenuOpen) {
                this.closeMobileMenu();
            }
        }, 250));

        // Close menu when clicking on menu links (mobile)
        Utils.$('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                if (AppState.isMenuOpen && window.innerWidth <= 768) {
                    setTimeout(() => this.closeMobileMenu(), 150);
                }
            });
        });
    },

    toggleMobileMenu() {
        const navMenu = Utils.$('.nav-menu');
        const toggle = Utils.$('.mobile-menu-toggle');
        const body = document.body;
        const isOpen = navMenu.classList.contains('active');
        
        if (isOpen) {
            Navigation.closeMobileMenu();
        } else {
            Navigation.openMobileMenu();
        }
    },

    openMobileMenu() {
        const navMenu = Utils.$('.nav-menu');
        const toggle = Utils.$('.mobile-menu-toggle');
        const body = document.body;
        
        // Show menu
        navMenu.style.display = 'flex';
        
        // Force reflow
        navMenu.offsetHeight;
        
        // Add active class for animation
        navMenu.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.innerHTML = '<i class="fas fa-times"></i>';
        body.classList.add('menu-open');
        AppState.isMenuOpen = true;
        
        // Focus first menu item for accessibility
        const firstLink = navMenu.querySelector('a');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 300);
        }
    },

    closeMobileMenu() {
        const navMenu = Utils.$('.nav-menu');
        const toggle = Utils.$('.mobile-menu-toggle');
        const body = document.body;
        
        // Remove active class
        navMenu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<i class="fas fa-bars"></i>';
        body.classList.remove('menu-open');
        AppState.isMenuOpen = false;
        
        // Hide menu after animation
        setTimeout(() => {
            if (!navMenu.classList.contains('active')) {
                navMenu.style.display = 'none';
            }
        }, 300);
        
        // Return focus to toggle button
        toggle.focus();
    },

    handleSmoothScroll(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = Utils.$(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    },

    handleActiveStates() {
        const currentPath = window.location.pathname;
        const navLinks = Utils.$$('.nav-item a');
        
        navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            link.classList.toggle('active', linkPath === currentPath);
        });
    },

    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            const header = Utils.$('.header');
            let lastScrollY = window.scrollY;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.boundingClientRect.top < 0) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                });
            }, { threshold: 0 });

            const sentinel = Utils.$('.hero') || Utils.$('.page-header');
            if (sentinel) {
                observer.observe(sentinel);
            }
        }
    }
};

// Questions management
const Questions = {
    container: null,
    searchInput: null,
    activeQuestions: [],

    init() {
        this.container = Utils.$('#questionsContainer');
        this.searchInput = Utils.$('#searchInput');
        
        if (this.container) {
            this.bindEvents();
            this.setupSearch();
        }
    },

    bindEvents() {
        // Filter tabs
        Utils.$$('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = e.target.textContent.toLowerCase().replace(/\s+/g, '');
                this.filterQuestions(category === 'allquestions' ? 'all' : category);
            });
        });

        // Question toggles
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.question-header')) {
                this.toggleQuestion(e.target.closest('.question-header'));
            }
        });

        // Copy code functionality
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.copy-btn')) {
                this.copyCode(e.target.closest('.copy-btn'));
            }
        });
    },

    setupSearch() {
        if (this.searchInput) {
            const debouncedSearch = Utils.debounce((term) => {
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

    toggleQuestion(headerElement) {
        const questionContainer = headerElement.parentElement;
        const content = questionContainer.querySelector('.question-content');
        const toggle = headerElement.querySelector('.question-toggle');
        
        const isActive = content.classList.contains('active');
        
        // Close other questions (accordion behavior)
        Utils.$$('.question-content.active').forEach(activeContent => {
            if (activeContent !== content) {
                activeContent.classList.remove('active');
                const activeToggle = activeContent.parentElement.querySelector('.question-toggle');
                activeToggle.classList.remove('rotated');
            }
        });
        
        // Toggle current question
        content.classList.toggle('active', !isActive);
        toggle.classList.toggle('rotated', !isActive);
        
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
        AppState.currentFilters.category = category;
        
        // Update active filter tab
        Utils.$$('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.textContent.toLowerCase().includes(category) || 
                (category === 'all' && tab.textContent.includes('All'))) {
                tab.classList.add('active');
            }
        });
        
        // Filter questions
        const questions = Utils.$$('.question-container');
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

        // Show message if no questions found
        this.showFilterMessage(visibleCount, category);
    },

    searchQuestions(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const questions = Utils.$$('.question-container');
        let visibleCount = 0;
        
        questions.forEach(question => {
            const questionText = question.querySelector('.question-text').textContent.toLowerCase();
            const answerText = question.querySelector('.answer-content').textContent.toLowerCase();
            const codeText = question.querySelector('pre')?.textContent.toLowerCase() || '';
            
            const matches = !term || 
                           questionText.includes(term) || 
                           answerText.includes(term) ||
                           codeText.includes(term);
            
            // Check if it also passes current filter
            const category = AppState.currentFilters.category;
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
        // Simple highlighting - in production, use a more robust solution
        const walker = document.createTreeWalker(
            element,
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
        Utils.$$('.search-highlight', element).forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
    },

    showFilterMessage(count, category) {
        const existing = Utils.$('.filter-message');
        if (existing) existing.remove();
        
        if (count === 0) {
            const message = Utils.createElement('div', {
                className: 'filter-message',
                innerHTML: `
                    <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <p>No questions found for "${category}" category.</p>
                    </div>
                `
            });
            this.container.appendChild(message);
        }
    },

    showSearchMessage(count, term) {
        const existing = Utils.$('.search-message');
        if (existing) existing.remove();
        
        if (term && count === 0) {
            const message = Utils.createElement('div', {
                className: 'search-message',
                innerHTML: `
                    <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <p>No questions found matching "${term}".</p>
                        <button onclick="document.getElementById('searchInput').value = ''; Questions.searchQuestions('');" 
                                style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--secondary); color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Clear Search
                        </button>
                    </div>
                `
            });
            this.container.appendChild(message);
        } else if (term && count > 0) {
            const message = Utils.createElement('div', {
                className: 'search-message',
                innerHTML: `
                    <div style="padding: 1rem; margin-bottom: 1rem; background: var(--bg-tertiary); border-radius: 8px; border-left: 4px solid var(--secondary);">
                        <p style="margin: 0; color: var(--text-secondary);">
                            <i class="fas fa-info-circle"></i> 
                            Found ${count} question${count !== 1 ? 's' : ''} matching "${term}"
                        </p>
                    </div>
                `
            });
            this.container.insertBefore(message, this.container.firstChild);
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

    createQuestionElement(question) {
        const difficultyClass = this.getDifficultyClass(question.difficulty);
        const difficultyLabel = question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1);
        
        const questionElement = Utils.createElement('div', {
            className: 'question-container',
            'data-category': question.category,
            'data-difficulty': question.difficulty
        });

        questionElement.innerHTML = `
            <div class="question-header">
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

// Animation and visual effects
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
                        const siblings = Array.from(entry.target.parentElement.children);
                        const index = siblings.indexOf(entry.target);
                        entry.target.style.animationDelay = `${index * 0.1}s`;
                    }
                });
            }, observerOptions);

            // Observe elements for animation
            Utils.$$('.card, .stat-card, .question-container').forEach(el => {
                observer.observe(el);
            });

            AppState.observers.set('fadeIn', observer);
        }
    },

    setupScrollEffects() {
        const header = Utils.$('.header');
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateHeader = () => {
            const scrollY = window.scrollY;
            
            if (scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            // Hide/show header based on scroll direction
            if (scrollY > lastScrollY && scrollY > 200) {
                header.classList.add('hidden');
            } else {
                header.classList.remove('hidden');
            }

            lastScrollY = scrollY;
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
    }
};

// Performance optimization
const Performance = {
    init() {
        this.preloadCriticalResources();
        this.lazyLoadImages();
        this.optimizeThirdPartyScripts();
    },

    preloadCriticalResources() {
        // Preload critical CSS if needed
        const criticalResources = [
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = resource;
            document.head.appendChild(link);
        });
    },

    lazyLoadImages() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            Utils.$('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });

            AppState.observers.set('images', imageObserver);
        }
    },

    optimizeThirdPartyScripts() {
        // Delay non-critical third-party scripts
        window.addEventListener('load', () => {
            setTimeout(() => {
                // Load analytics or other non-critical scripts here
                // Example: Google Analytics, tracking scripts, etc.
            }, 3000);
        });
    }
};

// Accessibility improvements
const Accessibility = {
    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupARIAAttributes();
        this.setupReducedMotion();
    },

    setupKeyboardNavigation() {
        // Escape key closes mobile menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (AppState.isMenuOpen) {
                    Navigation.closeMobileMenu();
                }
                
                // Close any open question
                Utils.$('.question-content.active').forEach(content => {
                    content.classList.remove('active');
                    const toggle = content.parentElement.querySelector('.question-toggle');
                    toggle.classList.remove('rotated');
                });
            }
        });

        // Arrow key navigation for questions
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.question-header') && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                Questions.toggleQuestion(e.target.closest('.question-header'));
            }
        });
    },

    setupFocusManagement() {
        // Focus management for mobile menu
        const navMenu = Utils.$('.nav-menu');
        const mobileToggle = Utils.$('.mobile-menu-toggle');

        if (navMenu && mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                if (AppState.isMenuOpen) {
                    const firstLink = navMenu.querySelector('a');
                    if (firstLink) {
                        setTimeout(() => firstLink.focus(), 100);
                    }
                }
            });
        }

        // Skip to main content link
        const skipLink = Utils.createElement('a', {
            href: '#main-content',
            className: 'skip-link',
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

    setupARIAAttributes() {
        // Add ARIA attributes to interactive elements
        Utils.$('.question-header').forEach(header => {
            header.setAttribute('role', 'button');
            header.setAttribute('tabindex', '0');
            header.setAttribute('aria-expanded', 'false');
            
            const questionText = header.querySelector('.question-text').textContent;
            header.setAttribute('aria-label', `Toggle question: ${questionText}`);
        });

        // Update ARIA attributes when questions are toggled
        const originalToggle = Questions.toggleQuestion;
        Questions.toggleQuestion = function(headerElement) {
            originalToggle.call(this, headerElement);
            
            const content = headerElement.parentElement.querySelector('.question-content');
            const isActive = content.classList.contains('active');
            headerElement.setAttribute('aria-expanded', isActive.toString());
        };
    },

    setupReducedMotion() {
        // Respect user's motion preferences
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.documentElement.style.setProperty('--animation-duration', '0.01ms');
            document.documentElement.style.setProperty('--transition-duration', '0.01ms');
        }

        prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                document.documentElement.style.setProperty('--animation-duration', '0.01ms');
                document.documentElement.style.setProperty('--transition-duration', '0.01ms');
            } else {
                document.documentElement.style.removeProperty('--animation-duration');
                document.documentElement.style.removeProperty('--transition-duration');
            }
        });
    }
};

// Error handling and logging
const ErrorHandler = {
    init() {
        window.addEventListener('error', this.handleError);
        window.addEventListener('unhandledrejection', this.handlePromiseRejection);
    },

    handleError(event) {
        console.error('JavaScript Error:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        });

        // Show user-friendly error message
        this.showUserError('Something went wrong. Please refresh the page and try again.');
    },

    handlePromiseRejection(event) {
        console.error('Unhandled Promise Rejection:', event.reason);
        
        // Prevent default browser behavior
        event.preventDefault();
        
        this.showUserError('An error occurred while loading content. Please try again.');
    },

    showUserError(message) {
        // Create or update error notification
        let errorNotification = Utils.$('.error-notification');
        
        if (!errorNotification) {
            errorNotification = Utils.createElement('div', {
                className: 'error-notification',
                style: `
                    position: fixed;
                    top: 100px;
                    right: 1rem;
                    background: var(--accent);
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
            document.body.appendChild(errorNotification);
        }

        errorNotification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
            </div>
        `;

        // Show notification
        setTimeout(() => {
            errorNotification.style.transform = 'translateX(0)';
        }, 100);

        // Hide after 5 seconds
        setTimeout(() => {
            errorNotification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (errorNotification.parentNode) {
                    errorNotification.parentNode.removeChild(errorNotification);
                }
            }, 300);
        }, 5000);
    }
};

// App initialization
class App {
    constructor() {
        this.modules = [
            Navigation,
            Questions,
            Animations,
            Performance,
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
                    console.error(`Error initializing ${module.constructor.name}:`, error);
                }
            });

            // Mark app as ready
            document.documentElement.classList.add('app-ready');
            
            console.log('🚀 APEX Interview Mastery app initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            ErrorHandler.showUserError('Failed to initialize the application. Please refresh the page.');
        }
    }

    destroy() {
        // Cleanup observers and event listeners
        AppState.observers.forEach(observer => {
            observer.disconnect();
        });
        AppState.observers.clear();
        
        // Remove event listeners
        window.removeEventListener('error', ErrorHandler.handleError);
        window.removeEventListener('unhandledrejection', ErrorHandler.handlePromiseRejection);
        
        console.log('App destroyed and cleaned up');
    }
}

// Global functions for backward compatibility
window.toggleMobileMenu = Navigation.toggleMobileMenu;
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
    module.exports = { App, Utils, Navigation, Questions, Animations, Performance, Accessibility, ErrorHandler };
}
