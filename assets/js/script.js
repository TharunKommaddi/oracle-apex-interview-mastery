// Modern JavaScript for APEX Interview Mastery Platform with Dark Mode
'use strict';
 
// Global state management
const AppState = {
    currentFilters: { category: 'all' },
    isMenuOpen: false,
    loadingStates: new Set(),
    observers: new Map(),
    theme: localStorage.getItem('theme') || 'light'
};

// Theme Management
const ThemeManager = {
    init() {
        this.applyTheme(AppState.theme);
        this.createThemeToggle();
        this.bindEvents();
    },

    createThemeToggle() {
        // Find nav-right container or create it
        let navRight = document.querySelector('.nav-right');
        if (!navRight) {
            navRight = document.createElement('div');
            navRight.className = 'nav-right';
            
            // Find the nav menu and mobile toggle
            const navMenu = document.querySelector('.nav-menu');
            const mobileToggle = document.querySelector('.mobile-menu-toggle');
            const navContainer = document.querySelector('.nav-container');
            
            // Move nav menu to nav-right
            if (navMenu) {
                navRight.appendChild(navMenu);
            }
            
            // Add theme toggle to nav-right
            const themeToggle = this.createToggleElement();
            navRight.appendChild(themeToggle);
            
            // Add mobile toggle to nav-right
            if (mobileToggle) {
                navRight.appendChild(mobileToggle);
            }
            
            // Add nav-right to nav container
            if (navContainer) {
                navContainer.appendChild(navRight);
            }
        } else {
            // If nav-right exists, just add the theme toggle
            const existingToggle = navRight.querySelector('.theme-toggle');
            if (!existingToggle) {
                const themeToggle = this.createToggleElement();
                navRight.insertBefore(themeToggle, navRight.firstChild);
            }
        }
    },

    createToggleElement() {
        const themeToggle = document.createElement('div');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = `
            <i class="fas fa-sun theme-icon sun-icon"></i>
            <div class="theme-switch" role="button" tabindex="0" aria-label="Toggle dark mode"></div>
            <i class="fas fa-moon theme-icon moon-icon"></i>
        `;
        return themeToggle;
    },

    bindEvents() {
        const themeSwitch = document.querySelector('.theme-switch');
        if (themeSwitch) {
            themeSwitch.addEventListener('click', () => this.toggleTheme());
            themeSwitch.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleTheme();
                }
            });
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    },

    toggleTheme() {
        const newTheme = AppState.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    },

    applyTheme(theme) {
        AppState.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update meta theme-color for mobile browsers
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        metaThemeColor.content = theme === 'dark' ? '#1a202c' : '#bb0a31';
        
        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    },

    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }
};

// Utility functions - Enhanced
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
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    $(selector) {
        return document.querySelector(selector);
    },

    $$(selector) {
        return document.querySelectorAll(selector);
    },

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

    hideLoading(elementId) {
        AppState.loadingStates.delete(elementId);
    },

    // Enhanced responsive utilities
    isMobile() {
        return window.innerWidth <= 768;
    },

    isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    },

    isDesktop() {
        return window.innerWidth > 1024;
    },

    // Touch device detection
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
};

// Enhanced Navigation management
const Navigation = {
    init() {
        this.bindEvents();
        this.handleActiveStates();
        this.setupIntersectionObserver();
        this.handleResponsiveChanges();
    },

    bindEvents() {
        // Mobile menu toggle with proper event handling
        const mobileToggle = Utils.$('.mobile-menu-toggle');
        if (mobileToggle) {
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
            const themeToggle = Utils.$('.theme-toggle');
            
            if (navMenu && navMenu.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                !mobileToggle.contains(e.target) &&
                !themeToggle.contains(e.target)) {
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
        Utils.$$('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', this.handleSmoothScroll);
        });

        // Handle window resize
        window.addEventListener('resize', Utils.throttle(() => {
            this.handleResponsiveChanges();
            if (Utils.isDesktop() && AppState.isMenuOpen) {
                this.closeMobileMenu();
            }
        }, 250));

        // Close menu when clicking on menu links (mobile)
        Utils.$$('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                if (AppState.isMenuOpen && Utils.isMobile()) {
                    setTimeout(() => this.closeMobileMenu(), 150);
                }
            });
        });

        // Handle touch events for better mobile experience
        if (Utils.isTouchDevice()) {
            this.setupTouchEvents();
        }
    },

    setupTouchEvents() {
        let touchStartY = 0;
        let touchEndY = 0;

        const navMenu = Utils.$('.nav-menu');
        if (navMenu) {
            navMenu.addEventListener('touchstart', (e) => {
                touchStartY = e.changedTouches[0].screenY;
            });

            navMenu.addEventListener('touchend', (e) => {
                touchEndY = e.changedTouches[0].screenY;
                const swipeDistance = touchStartY - touchEndY;
                
                // Close menu on upward swipe
                if (swipeDistance > 50 && AppState.isMenuOpen) {
                    this.closeMobileMenu();
                }
            });
        }
    },

    handleResponsiveChanges() {
        // Adjust navigation based on screen size
        const navMenu = Utils.$('.nav-menu');
        const mobileToggle = Utils.$('.mobile-menu-toggle');

        if (Utils.isDesktop()) {
            if (navMenu) {
                navMenu.style.display = 'flex';
                navMenu.classList.remove('active');
            }
            if (mobileToggle) {
                mobileToggle.style.display = 'none';
            }
        } else {
            if (mobileToggle) {
                mobileToggle.style.display = 'flex';
            }
            if (navMenu && !AppState.isMenuOpen) {
                navMenu.style.display = 'none';
            }
        }
    },

    toggleMobileMenu() {
        if (AppState.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    },

    openMobileMenu() {
        const navMenu = Utils.$('.nav-menu');
        const toggle = Utils.$('.mobile-menu-toggle');
        const body = document.body;
        
        if (!navMenu || !toggle) return;
        
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
        
        if (!navMenu || !toggle) return;
        
        // Remove active class
        navMenu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<i class="fas fa-bars"></i>';
        body.classList.remove('menu-open');
        AppState.isMenuOpen = false;
        
        // Hide menu after animation
        setTimeout(() => {
            if (!navMenu.classList.contains('active')) {
                navMenu.style.display = Utils.isDesktop() ? 'flex' : 'none';
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
            const headerHeight = Utils.$('.header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
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
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.boundingClientRect.top < 0) {
                        header?.classList.add('scrolled');
                    } else {
                        header?.classList.remove('scrolled');
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

// Enhanced Questions management with better responsive handling
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
            this.handleResponsiveQuestions();
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

        // Question toggles - Enhanced for mobile
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.question-header')) {
                const header = e.target.closest('.question-header');
                this.toggleQuestion(header);
                
                // On mobile, scroll to question after a short delay
                if (Utils.isMobile()) {
                    setTimeout(() => {
                        header.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }, 300);
                }
            }
        });

        // Copy code functionality
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.copy-btn')) {
                this.copyCode(e.target.closest('.copy-btn'));
            }
        });

        // Handle window resize for questions layout
        window.addEventListener('resize', Utils.throttle(() => {
            this.handleResponsiveQuestions();
        }, 250));
    },

    handleResponsiveQuestions() {
        // Adjust question layout based on screen size
        const questions = Utils.$$('.question-container');
        questions.forEach(question => {
            const header = question.querySelector('.question-header');
            if (Utils.isMobile()) {
                header.classList.add('mobile-layout');
            } else {
                header.classList.remove('mobile-layout');
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

            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    e.target.value = '';
                    this.searchQuestions('');
                }
            });

            // Mobile search enhancements
            if (Utils.isMobile()) {
                this.searchInput.addEventListener('focus', () => {
                    // Scroll to search input on mobile
                    setTimeout(() => {
                        this.searchInput.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }, 300);
                });
            }
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
                activeToggle?.classList.remove('rotated');
            }

            
});
       
       // Toggle current question
       content.classList.toggle('active', !isActive);
       toggle?.classList.toggle('rotated', !isActive);
       
       // Update ARIA attributes
       headerElement.setAttribute('aria-expanded', (!isActive).toString());
       
       // Scroll to question if opening and not on mobile (mobile handled in bindEvents)
       if (!isActive && !Utils.isMobile()) {
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
       
       // Filter questions with animation
       const questions = Utils.$$('.question-container');
       let visibleCount = 0;
       
       questions.forEach((question, index) => {
           const questionCategory = question.getAttribute('data-category');
           const shouldShow = category === 'all' || questionCategory === category;
           
           if (shouldShow) {
               question.style.display = 'block';
               // Stagger animation for better visual effect
               setTimeout(() => {
                   question.classList.add('fade-in');
               }, index * 50);
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
       const questions = Utils.$$('.question-container');
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
       // Remove existing highlights
       this.removeHighlights(element);
       
       // Simple highlighting - improved for better performance
       const walker = document.createTreeWalker(
           element,
           NodeFilter.SHOW_TEXT,
           {
               acceptNode: (node) => {
                   // Skip script and style elements
                   const parent = node.parentNode;
                   if (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') {
                       return NodeFilter.FILTER_REJECT;
                   }
                   return node.nodeValue.toLowerCase().includes(term) ? 
                          NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
               }
           },
           false
       );
       
       const textNodes = [];
       let node;
       
       while (node = walker.nextNode()) {
           textNodes.push(node);
       }
       
       textNodes.forEach(textNode => {
           const parent = textNode.parentNode;
           if (parent.tagName !== 'MARK') {
               const text = textNode.nodeValue;
               const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
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

   escapeRegex(string) {
       return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
                       <button onclick="Questions.resetFilters()" 
                               style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--secondary); color: white; border: none; border-radius: 4px; cursor: pointer;">
                           Show All Questions
                       </button>
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
                       <button onclick="Questions.clearSearch()" 
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
                           <button onclick="Questions.clearSearch()" 
                                   style="margin-left: 1rem; padding: 0.25rem 0.5rem; background: transparent; color: var(--secondary); border: 1px solid var(--secondary); border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                               Clear
                           </button>
                       </p>
                   </div>
               `
           });
           this.container.insertBefore(message, this.container.firstChild);
       }
   },

   clearSearch() {
       const searchInput = Utils.$('#searchInput');
       if (searchInput) {
           searchInput.value = '';
           this.searchQuestions('');
           searchInput.focus();
       }
   },

   resetFilters() {
       this.filterQuestions('all');
       this.clearSearch();
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
       buttonElement.style.background = 'rgba(72, 187, 120, 0.2)';
       buttonElement.style.borderColor = 'rgba(72, 187, 120, 0.3)';
       buttonElement.style.color = '#48bb78';
       
       setTimeout(() => {
           buttonElement.innerHTML = originalContent;
           buttonElement.style.background = '';
           buttonElement.style.borderColor = '';
           buttonElement.style.color = '';
       }, 2000);
   },

   showCopyError(buttonElement) {
       const originalContent = buttonElement.innerHTML;
       buttonElement.innerHTML = '<i class="fas fa-times"></i> Failed';
       buttonElement.style.background = 'rgba(245, 101, 101, 0.2)';
       buttonElement.style.borderColor = 'rgba(245, 101, 101, 0.3)';
       buttonElement.style.color = '#f56565';
       
       setTimeout(() => {
           buttonElement.innerHTML = originalContent;
           buttonElement.style.background = '';
           buttonElement.style.borderColor = '';
           buttonElement.style.color = '';
       }, 2000);
   }
};

// Enhanced Animation and visual effects
const Animations = {
   init() {
       this.setupIntersectionObserver();
       this.setupScrollEffects();
       this.setupParallaxEffects();
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
               header?.classList.add('scrolled');
           } else {
               header?.classList.remove('scrolled');
           }

           // Hide/show header based on scroll direction (disabled on mobile for better UX)
           if (!Utils.isMobile()) {
               if (scrollY > lastScrollY && scrollY > 200) {
                   header?.classList.add('hidden');
               } else {
                   header?.classList.remove('hidden');
               }
           }

           lastScrollY = scrollY;
           ticking = false;
       };

       const onScroll = Utils.throttle(updateHeader, 16); // 60fps
       window.addEventListener('scroll', onScroll, { passive: true });
   },

   setupParallaxEffects() {
       // Subtle parallax effect for hero background (disabled on mobile for performance)
       if (!Utils.isMobile() && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
           const hero = Utils.$('.hero');
           if (hero) {
               window.addEventListener('scroll', Utils.throttle(() => {
                   const scrolled = window.pageYOffset;
                   const parallax = scrolled * 0.3;
                   hero.style.transform = `translateY(${parallax}px)`;
               }, 16), { passive: true });
           }
       }
   }
};

// Enhanced Performance optimization
const Performance = {
   init() {
       this.preloadCriticalResources();
       this.lazyLoadImages();
       this.optimizeThirdPartyScripts();
       this.setupServiceWorker();
   },

   preloadCriticalResources() {
       const criticalResources = [
           'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
           'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
       ];

       criticalResources.forEach(resource => {
           const link = document.createElement('link');
           link.rel = 'preload';
           link.as = 'style';
           link.href = resource;
           link.crossOrigin = 'anonymous';
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

           Utils.$$('img[data-src]').forEach(img => {
               imageObserver.observe(img);
           });

           AppState.observers.set('images', imageObserver);
       } else {
           // Fallback for browsers without IntersectionObserver
           Utils.$$('img[data-src]').forEach(img => {
               img.src = img.dataset.src;
               img.classList.remove('lazy');
           });
       }
   },

   optimizeThirdPartyScripts() {
       // Delay non-critical third-party scripts
       window.addEventListener('load', () => {
           setTimeout(() => {
               // Load analytics or other non-critical scripts here
               this.loadAnalytics();
           }, 3000);
       });
   },

   loadAnalytics() {
       // Placeholder for analytics loading
       // Example: Google Analytics, tracking scripts, etc.
       console.log('Analytics scripts would be loaded here');
   },

   setupServiceWorker() {
       // Register service worker for offline capability (if available)
       if ('serviceWorker' in navigator) {
           window.addEventListener('load', () => {
               navigator.serviceWorker.register('/sw.js')
                   .then(registration => {
                       console.log('SW registered: ', registration);
                   })
                   .catch(registrationError => {
                       console.log('SW registration failed: ', registrationError);
                   });
           });
       }
   }
};

// Enhanced Accessibility improvements
const Accessibility = {
   init() {
       this.setupKeyboardNavigation();
       this.setupFocusManagement();
       this.setupARIAAttributes();
       this.setupReducedMotion();
       this.setupScreenReaderSupport();
   },

   setupKeyboardNavigation() {
       // Enhanced keyboard navigation
       document.addEventListener('keydown', (e) => {
           // Escape key functionality
           if (e.key === 'Escape') {
               if (AppState.isMenuOpen) {
                   Navigation.closeMobileMenu();
               }
               
               // Close any open question
               Utils.$$('.question-content.active').forEach(content => {
                   content.classList.remove('active');
                   const toggle = content.parentElement.querySelector('.question-toggle');
                   toggle?.classList.remove('rotated');
                   const header = content.parentElement.querySelector('.question-header');
                   header?.setAttribute('aria-expanded', 'false');
               });
           }

           // Tab trapping in mobile menu
           if (e.key === 'Tab' && AppState.isMenuOpen) {
               const navMenu = Utils.$('.nav-menu');
               const focusableElements = navMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
               const firstElement = focusableElements[0];
               const lastElement = focusableElements[focusableElements.length - 1];

               if (e.shiftKey && document.activeElement === firstElement) {
                   e.preventDefault();
                   lastElement.focus();
               } else if (!e.shiftKey && document.activeElement === lastElement) {
                   e.preventDefault();
                   firstElement.focus();
               }
           }
       });

       // Arrow key navigation for questions
       document.addEventListener('keydown', (e) => {
           if (e.target.closest('.question-header') && (e.key === 'Enter' || e.key === ' ')) {
               e.preventDefault();
               Questions.toggleQuestion(e.target.closest('.question-header'));
           }
       });

       // Enhanced filter tab navigation
       Utils.$$('.filter-tab').forEach(tab => {
           tab.addEventListener('keydown', (e) => {
               if (e.key === 'Enter' || e.key === ' ') {
                   e.preventDefault();
                   tab.click();
               }
           });
       });
   },

   setupFocusManagement() {
       // Focus management for mobile menu
       const mobileToggle = Utils.$('.mobile-menu-toggle');
       if (mobileToggle) {
           mobileToggle.addEventListener('click', () => {
               if (AppState.isMenuOpen) {
                   const navMenu = Utils.$('.nav-menu');
                   const firstLink = navMenu?.querySelector('a');
                   if (firstLink) {
                       setTimeout(() => firstLink.focus(), 100);
                   }
               }
           });
       }

       // Skip to main content link
       this.createSkipLink();

       // Focus indicators for better visibility
       this.enhanceFocusIndicators();
   },

   createSkipLink() {
       const skipLink = Utils.createElement('a', {
           href: '#main-content',
           className: 'skip-link',
           innerHTML: 'Skip to main content',
           style: `
               position: absolute;
               left: -9999px;
               top: auto;
               width: 1px;
               height: 1px;
               overflow: hidden;
               z-index: 999999;
               padding: 1rem;
               background: var(--primary);
               color: white;
               text-decoration: none;
               border-radius: 0 0 4px 0;
           `
       });

       skipLink.addEventListener('focus', () => {
           skipLink.style.position = 'fixed';
           skipLink.style.top = '0';
           skipLink.style.left = '0';
           skipLink.style.width = 'auto';
           skipLink.style.height = 'auto';
           skipLink.style.overflow = 'visible';
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

       // Add main content landmark
       const container = Utils.$('.container') || Utils.$('main');
       if (container) {
           container.id = 'main-content';
           container.setAttribute('tabindex', '-1');
       }
   },

   enhanceFocusIndicators() {
       // Add custom focus styles programmatically
       const style = document.createElement('style');
       style.textContent = `
           .enhanced-focus:focus {
               outline: 3px solid var(--secondary) !important;
               outline-offset: 2px !important;
               box-shadow: 0 0 0 5px rgba(187, 10, 49, 0.2) !important;
           }
       `;
       document.head.appendChild(style);

       // Apply enhanced focus to interactive elements
       Utils.$$('button, a, input, select, textarea, [tabindex]').forEach(el => {
           el.classList.add('enhanced-focus');
       });
   },

   setupARIAAttributes() {
       // Add ARIA attributes to interactive elements
       Utils.$$('.question-header').forEach(header => {
           header.setAttribute('role', 'button');
           header.setAttribute('tabindex', '0');
           header.setAttribute('aria-expanded', 'false');
           
           const questionText = header.querySelector('.question-text')?.textContent || 'Question';
           header.setAttribute('aria-label', `Toggle question: ${questionText.substring(0, 100)}...`);
       });

       // Filter tabs
       Utils.$$('.filter-tab').forEach(tab => {
           tab.setAttribute('role', 'tab');
           tab.setAttribute('tabindex', '0');
       });

       // Search input
       const searchInput = Utils.$('#searchInput');
       if (searchInput) {
           searchInput.setAttribute('role', 'searchbox');
           searchInput.setAttribute('aria-label', 'Search questions');
       }

       // Theme toggle
       const themeSwitch = Utils.$('.theme-switch');
       if (themeSwitch) {
           themeSwitch.setAttribute('role', 'switch');
           themeSwitch.setAttribute('aria-checked', AppState.theme === 'dark');
           themeSwitch.setAttribute('aria-label', 'Toggle dark mode');
       }
   },

   setupReducedMotion() {
       const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
       
       const handleReducedMotion = (mediaQuery) => {
           if (mediaQuery.matches) {
               document.documentElement.style.setProperty('--animation-duration', '0.01ms');
               document.documentElement.style.setProperty('--transition-duration', '0.01ms');
               document.body.classList.add('reduced-motion');
           } else {
               document.documentElement.style.removeProperty('--animation-duration');
               document.documentElement.style.removeProperty('--transition-duration');
               document.body.classList.remove('reduced-motion');
           }
       };

       handleReducedMotion(prefersReducedMotion);
       prefersReducedMotion.addEventListener('change', handleReducedMotion);
   },

   setupScreenReaderSupport() {
       // Live region for dynamic content updates
       const liveRegion = Utils.createElement('div', {
           id: 'live-region',
           'aria-live': 'polite',
           'aria-atomic': 'true',
           style: 'position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;'
       });
       document.body.appendChild(liveRegion);

       // Function to announce messages to screen readers
       window.announceToScreenReader = (message) => {
           const liveRegion = Utils.$('#live-region');
           if (liveRegion) {
               liveRegion.textContent = message;
               setTimeout(() => {
                   liveRegion.textContent = '';
               }, 1000);
           }
       };

       // Announce theme changes
       window.addEventListener('themechange', (e) => {
           window.announceToScreenReader(`Switched to ${e.detail.theme} mode`);
       });
   }
};

// Enhanced Error handling and logging
const ErrorHandler = {
   init() {
       window.addEventListener('error', this.handleError.bind(this));
       window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
       this.setupNetworkErrorHandling();
   },

   handleError(event) {
       console.error('JavaScript Error:', {
           message: event.message,
           filename: event.filename,
           lineno: event.lineno,
           colno: event.colno,
           error: event.error,
           userAgent: navigator.userAgent,
           timestamp: new Date().toISOString()
       });

       this.showUserError('Something went wrong. Please refresh the page and try again.');
       this.logError('JavaScript Error', event);
   },

   handlePromiseRejection(event) {
       console.error('Unhandled Promise Rejection:', event.reason);
       
       event.preventDefault();
       this.showUserError('An error occurred while loading content. Please try again.');
       this.logError('Promise Rejection', event);
   },

   setupNetworkErrorHandling() {
       // Handle network connectivity issues
       window.addEventListener('online', () => {
           this.showSuccessMessage('Connection restored');
       });

       window.addEventListener('offline', () => {
           this.showUserError('No internet connection. Some features may not work.');
       });
   },

   showUserError(message) {
       this.showNotification(message, 'error');
   },

   showSuccessMessage(message) {
       this.showNotification(message, 'success');
   },

   showNotification(message, type = 'error') {
       // Remove existing notifications
       Utils.$$('.notification').forEach(notification => {
           notification.remove();
       });

       const colors = {
           error: { bg: 'var(--accent)', icon: 'fas fa-exclamation-triangle' },
           success: { bg: 'var(--success)', icon: 'fas fa-check-circle' },
           info: { bg: 'var(--primary)', icon: 'fas fa-info-circle' }
       };

       const config = colors[type] || colors.error;

       const notification = Utils.createElement('div', {
           className: 'notification',
           style: `
               position: fixed;
               top: ${Utils.isMobile() ? '90px' : '100px'};
               right: 1rem;
               background: ${config.bg};
               color: white;
               padding: 1rem 1.5rem;
               border-radius: var(--radius-lg);
               box-shadow: var(--shadow-lg);
               z-index: 9999;
               max-width: ${Utils.isMobile() ? '90vw' : '350px'};
               transform: translateX(400px);
               transition: transform 0.3s ease;
               cursor: pointer;
           `
       });

       notification.innerHTML = `
           <div style="display: flex; align-items: center; gap: 0.5rem;">
               <i class="${config.icon}"></i>
               <span style="flex: 1;">${message}</span>
               <i class="fas fa-times" style="opacity: 0.7; font-size: 0.8rem;"></i>
           </div>
       `;

       // Close on click
       notification.addEventListener('click', () => {
           this.hideNotification(notification);
       });

       document.body.appendChild(notification);

       // Show notification
       setTimeout(() => {
           notification.style.transform = 'translateX(0)';
       }, 100);

       // Auto-hide after 5 seconds
       setTimeout(() => {
           this.hideNotification(notification);
       }, 5000);

       // Announce to screen readers
       if (window.announceToScreenReader) {
           window.announceToScreenReader(message);
       }
   },

   hideNotification(notification) {
       notification.style.transform = 'translateX(400px)';
       setTimeout(() => {
           if (notification.parentNode) {
               notification.parentNode.removeChild(notification);
           }
       }, 300);
   },

   logError(type, details) {
       // In a real application, you would send this to your logging service
       const errorData = {
           type,
           details,
           userAgent: navigator.userAgent,
           url: window.location.href,
           timestamp: new Date().toISOString(),
           theme: AppState.theme,
           isMobile: Utils.isMobile()
       };
       
       // For now, just log to console
       console.warn('Error logged:', errorData);
   }
};

// Enhanced App initialization
class App {
   constructor() {
       this.modules = [
           ThemeManager,
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
                   console.log(`✅ ${module.constructor?.name || 'Module'} initialized`);
               } catch (error) {
                   console.error(`❌ Error initializing ${module.constructor?.name || 'Module'}:`, error);
               }
           });

           // Mark app as ready
           document.documentElement.classList.add('app-ready');
           
           // Performance logging
           if (window.performance && window.performance.now) {
               const loadTime = window.performance.now();
               console.log(`🚀 APEX Interview Mastery app initialized in ${loadTime.toFixed(2)}ms`);
           }

           // Service worker update check
           this.checkForUpdates();
           
       } catch (error) {
           console.error('Failed to initialize app:', error);
           ErrorHandler.showUserError('Failed to initialize the application. Please refresh the page.');
       }
   }

   checkForUpdates() {
       if ('serviceWorker' in navigator) {
           navigator.serviceWorker.ready.then(registration => {
               registration.addEventListener('updatefound', () => {
                   const newWorker = registration.installing;
                   newWorker.addEventListener('statechange', () => {
                       if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                           // New content is available
                           this.showUpdateNotification();


                           }
                   });
               });
           });
       }
   }

   showUpdateNotification() {
       const updateBanner = Utils.createElement('div', {
           className: 'update-banner',
           style: `
               position: fixed;
               bottom: 0;
               left: 0;
               right: 0;
               background: var(--primary);
               color: white;
               padding: 1rem;
               text-align: center;
               z-index: 10000;
               transform: translateY(100%);
               transition: transform 0.3s ease;
           `
       });

       updateBanner.innerHTML = `
           <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap;">
               <span>A new version is available!</span>
               <button onclick="window.location.reload()" 
                       style="background: white; color: var(--primary); border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 600;">
                   Update Now
               </button>
               <button onclick="this.parentElement.parentElement.remove()" 
                       style="background: transparent; color: white; border: 1px solid rgba(255,255,255,0.3); padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                   Later
               </button>
           </div>
       `;

       document.body.appendChild(updateBanner);

       setTimeout(() => {
           updateBanner.style.transform = 'translateY(0)';
       }, 100);
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

// Global functions for backward compatibility and external access
window.toggleMobileMenu = () => Navigation.toggleMobileMenu();
window.toggleQuestion = (element) => Questions.toggleQuestion(element);
window.filterQuestions = (category) => Questions.filterQuestions(category);
window.searchQuestions = (term) => Questions.searchQuestions(term || '');
window.copyCode = (element) => Questions.copyCode(element);
window.toggleTheme = () => ThemeManager.toggleTheme();

// Expose Questions methods globally
window.Questions = {
   clearSearch: () => Questions.clearSearch(),
   resetFilters: () => Questions.resetFilters(),
   filterQuestions: (category) => Questions.filterQuestions(category),
   searchQuestions: (term) => Questions.searchQuestions(term)
};

// Expose Navigation methods
window.Navigation = {
   toggleMobileMenu: () => Navigation.toggleMobileMenu(),
   closeMobileMenu: () => Navigation.closeMobileMenu(),
   openMobileMenu: () => Navigation.openMobileMenu()
};

// Initialize app
const app = new App();
app.init();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
   module.exports = { 
       App, 
       Utils, 
       Navigation, 
       Questions, 
       Animations, 
       Performance, 
       Accessibility, 
       ErrorHandler,
       ThemeManager 
   };
}

// PWA installation prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
   e.preventDefault();
   deferredPrompt = e;
   
   // Show install button/banner
   const installBanner = Utils.createElement('div', {
       className: 'install-banner',
       style: `
           position: fixed;
           bottom: 20px;
           right: 20px;
           background: var(--primary);
           color: white;
           padding: 1rem;
           border-radius: var(--radius-lg);
           box-shadow: var(--shadow-lg);
           z-index: 9999;
           max-width: 300px;
           transform: translateX(400px);
           transition: transform 0.3s ease;
       `
   });

   installBanner.innerHTML = `
       <div style="margin-bottom: 0.5rem;">
           <strong>Install App</strong>
       </div>
       <div style="font-size: 0.875rem; margin-bottom: 1rem; opacity: 0.9;">
           Install APEX Interview Mastery for quick access and offline use.
       </div>
       <div style="display: flex; gap: 0.5rem;">
           <button id="install-btn" style="background: white; color: var(--primary); border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 600;">
               Install
           </button>
           <button onclick="this.parentElement.parentElement.remove()" style="background: transparent; color: white; border: 1px solid rgba(255,255,255,0.3); padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
               Not Now
           </button>
       </div>
   `;

   document.body.appendChild(installBanner);

   setTimeout(() => {
       installBanner.style.transform = 'translateX(0)';
   }, 2000);

   // Install button handler
   installBanner.querySelector('#install-btn').addEventListener('click', async () => {
       if (deferredPrompt) {
           deferredPrompt.prompt();
           const { outcome } = await deferredPrompt.userChoice;
           console.log(`User response to install prompt: ${outcome}`);
           deferredPrompt = null;
           installBanner.remove();
       }
   });
});

// Handle successful PWA installation
window.addEventListener('appinstalled', () => {
   console.log('PWA was installed');
   deferredPrompt = null;
});

// Enhanced touch gestures for mobile
if (Utils.isTouchDevice()) {
   let touchStartX = 0;
   let touchStartY = 0;
   let touchEndX = 0;
   let touchEndY = 0;

   document.addEventListener('touchstart', (e) => {
       touchStartX = e.changedTouches[0].screenX;
       touchStartY = e.changedTouches[0].screenY;
   }, { passive: true });

   document.addEventListener('touchend', (e) => {
       touchEndX = e.changedTouches[0].screenX;
       touchEndY = e.changedTouches[0].screenY;
       handleSwipeGesture();
   }, { passive: true });

   function handleSwipeGesture() {
       const swipeThreshold = 50;
       const swipeDistanceX = touchEndX - touchStartX;
       const swipeDistanceY = touchEndY - touchStartY;

       // Horizontal swipes
       if (Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY)) {
           if (swipeDistanceX > swipeThreshold) {
               // Right swipe - close mobile menu if open
               if (AppState.isMenuOpen) {
                   Navigation.closeMobileMenu();
               }
           } else if (swipeDistanceX < -swipeThreshold) {
               // Left swipe - could be used for other actions
               console.log('Left swipe detected');
           }
       }
   }
}

// Performance monitoring
if ('PerformanceObserver' in window) {
   const perfObserver = new PerformanceObserver((list) => {
       list.getEntries().forEach((entry) => {
           if (entry.entryType === 'navigation') {
               console.log(`Page load time: ${entry.loadEventEnd - entry.loadEventStart}ms`);
           }
           if (entry.entryType === 'paint') {
               console.log(`${entry.name}: ${entry.startTime}ms`);
           }
       });
   });

   try {
       perfObserver.observe({ entryTypes: ['navigation', 'paint'] });
   } catch (e) {
       console.log('Performance observer not supported');
   }
}

// Memory usage monitoring (Chrome only)
if ('memory' in performance) {
   setInterval(() => {
       const memory = performance.memory;
       console.log(`Memory usage: ${Math.round(memory.usedJSHeapSize / 1048576)} MB`);
   }, 30000); // Check every 30 seconds
}

// Battery API for mobile optimization
if ('getBattery' in navigator) {
   navigator.getBattery().then((battery) => {
       const updateBatteryStatus = () => {
           if (battery.level < 0.2 && !battery.charging) {
               // Enable power saving mode
               document.body.classList.add('power-save-mode');
               console.log('Power save mode enabled');
           } else {
               document.body.classList.remove('power-save-mode');
           }
       };

       battery.addEventListener('chargingchange', updateBatteryStatus);
       battery.addEventListener('levelchange', updateBatteryStatus);
       updateBatteryStatus();
   });
}

// Network information API for adaptive loading
if ('connection' in navigator) {
   const connection = navigator.connection;
   
   const updateConnectionStatus = () => {
       if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
           document.body.classList.add('slow-connection');
           console.log('Slow connection detected - optimizing experience');
       } else {
           document.body.classList.remove('slow-connection');
       }
   };

   connection.addEventListener('change', updateConnectionStatus);
   updateConnectionStatus();
}

// Viewport height fix for mobile browsers
const setViewportHeight = () => {
   const vh = window.innerHeight * 0.01;
   document.documentElement.style.setProperty('--vh', `${vh}px`);
};

setViewportHeight();
window.addEventListener('resize', Utils.throttle(setViewportHeight, 250));
window.addEventListener('orientationchange', setViewportHeight);

// Enhanced console logging for development
if (process?.env?.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
   console.log(
       '%c🚀 APEX Interview Mastery %c- Development Mode',
       'color: #bb0a31; font-size: 16px; font-weight: bold;',
       'color: #4a5568; font-size: 12px;'
   );
   
   // Global debugging utilities
   window.debug = {
       state: AppState,
       utils: Utils,
       theme: ThemeManager,
       nav: Navigation,
       questions: Questions,
       toggleGrid: () => {
           document.body.classList.toggle('debug-grid');
           if (!document.querySelector('#debug-grid-style')) {
               const style = document.createElement('style');
               style.id = 'debug-grid-style';
               style.textContent = `
                   .debug-grid * {
                       outline: 1px solid rgba(255, 0, 0, 0.3) !important;
                   }
               `;
               document.head.appendChild(style);
           }
       }
   };
}

// Final initialization check
setTimeout(() => {
   if (!document.documentElement.classList.contains('app-ready')) {
       console.warn('App initialization may have failed');
       ErrorHandler.showUserError('App initialization incomplete. Please refresh the page.');
   }
}, 5000);







                           














                                                     
