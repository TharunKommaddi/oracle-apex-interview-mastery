// Modern JavaScript for APEX Interview Mastery Platform - Professional Version
'use strict';

// Global state management
const AppState = {
    currentFilters: { category: 'all' },
    isMenuOpen: false,
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
    }
};

// Navigation management
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
           if (currentScrollY > 50) {
               this.header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
           } else {
               this.header.style.boxShadow = 'none';
           }
           
           lastScrollY = currentScrollY;
       }, 100));
   }
};

// Questions management
const Questions = {
   init() {
       this.container = Utils.$('#questionsContainer');
       if (!this.container) return;
       
       this.searchInput = Utils.$('#searchInput');
       this.filterTabs = Utils.$$('.filter-tab');
       
       this.bindEvents();
       this.setupSearch();
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
   },

   setupSearch() {
       if (this.searchInput) {
           this.searchInput.addEventListener('input', Utils.debounce((e) => {
               this.searchQuestions(e.target.value);
           }, 200));
       }
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
       
       const isOpen = content.style.display === 'block';
       
       if (isOpen) {
           content.style.display = 'none';
           toggleIcon.classList.remove('rotated');
       } else {
           content.style.display = 'block';
           toggleIcon.classList.add('rotated');
       }
   },

   filterQuestions(category) {
       AppState.currentFilters.category = category;
       
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
       
       Utils.$$('.question-container').forEach((question) => {
           const questionCategory = question.dataset.category;
           const questionText = question.textContent.toLowerCase();
           
           const categoryMatch = category === 'all' || questionCategory === category;
           const searchMatch = !search || questionText.includes(search);
           const shouldShow = categoryMatch && searchMatch;
           
           if (shouldShow) {
               question.style.display = 'block';
               visibleCount++;
           } else {
               question.style.display = 'none';
           }
       });

       this.showNoResultsMessage(visibleCount === 0);
   },

   showNoResultsMessage(show) {
       let noResultsEl = Utils.$('.no-results-message');
       
       if (show && !noResultsEl) {
           noResultsEl = Utils.createElement('div', {
               className: 'no-results-message'
           });
           noResultsEl.innerHTML = `
               <div style="font-size: 2rem; margin-bottom: 1rem;">🔍</div>
               <h3>No questions found</h3>
               <p>Try adjusting your search terms or filters</p>
           `;
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

// Scroll to top functionality
const ScrollEffects = {
   init() {
       this.initScrollToTop();
   },

   initScrollToTop() {
       const scrollToTopBtn = Utils.createElement('button', {
           className: 'scroll-to-top',
           innerHTML: '<i class="fas fa-arrow-up"></i>',
           style: `
               position: fixed;
               bottom: 30px;
               right: 30px;
               width: 45px;
               height: 45px;
               background: var(--primary);
               color: var(--text-white);
               border: none;
               border-radius: 50%;
               cursor: pointer;
               opacity: 0;
               visibility: hidden;
               transition: all 0.3s ease;
               z-index: 1000;
               box-shadow: var(--shadow-md);
               font-size: 1rem;
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

       scrollToTopBtn.addEventListener('mouseenter', () => {
           scrollToTopBtn.style.background = 'var(--primary-light)';
       });

       scrollToTopBtn.addEventListener('mouseleave', () => {
           scrollToTopBtn.style.background = 'var(--primary)';
       });
   }
};

// App initialization
class App {
   init() {
       document.addEventListener('DOMContentLoaded', () => {
           Navigation.init();
           Questions.init();
           ScrollEffects.init();
       });
   }
}

// Global functions for backward compatibility
window.filterQuestions = (category) => Questions.filterQuestions(category);
window.searchQuestions = () => Questions.searchQuestions(Utils.$('#searchInput').value);
window.createQuestionElement = (q) => Questions.createQuestionElement(q);

// Initialize the app
new App().init();


        
        
// Enhanced Mobile Navigation JavaScript - Add to your script.js

// Enhanced Navigation management
const EnhancedNavigation = {
    init() {
        this.mobileToggle = Utils.$('.mobile-menu-toggle');
        this.navMenu = Utils.$('.nav-menu');
        this.header = Utils.$('.header');
        this.dropdownItems = Utils.$$('.nav-item.dropdown');
        this.bindEvents();
        this.handleActiveStates();
        this.initScrollEffects();
        this.setupDropdowns();
    },

    bindEvents() {
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (AppState.isMenuOpen && !e.target.closest('.main-nav') && !e.target.closest('.mobile-menu-toggle')) {
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

        // Close menu when clicking on nav links (except dropdown toggles)
        Utils.$$('.nav-item a').forEach(link => {
            if (!link.classList.contains('dropdown-toggle')) {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 992) {
                        setTimeout(() => this.closeMobileMenu(), 300);
                    }
                });
            }
        });
    },

    setupDropdowns() {
        this.dropdownItems.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            if (toggle) {
                toggle.classList.add('dropdown-toggle-js');
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleDropdown(dropdown);
                });
            }
        });
    },

    toggleDropdown(dropdown) {
        const isActive = dropdown.classList.contains('active');
        
        // Close all other dropdowns
        this.dropdownItems.forEach(item => {
            if (item !== dropdown) {
                item.classList.remove('active');
            }
        });

        // Toggle current dropdown
        dropdown.classList.toggle('active', !isActive);
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
        this.mobileToggle.classList.add('active');
        document.body.classList.add('menu-open');
        this.header.classList.add('menu-open');
        this.mobileToggle.setAttribute('aria-expanded', 'true');

        const icon = this.mobileToggle.querySelector('i');
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');

        // Close all dropdowns when opening menu
        this.dropdownItems.forEach(item => {
            item.classList.remove('active');
        });
    },

    closeMobileMenu() {
        AppState.isMenuOpen = false;
        this.navMenu.classList.remove('active');
        this.mobileToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
        this.header.classList.remove('menu-open');
        this.mobileToggle.setAttribute('aria-expanded', 'false');
        
        const icon = this.mobileToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');

        // Close all dropdowns when closing menu
        this.dropdownItems.forEach(item => {
            item.classList.remove('active');
        });
    },

    handleActiveStates() {
        const currentPath = window.location.pathname.split('/').pop();
        Utils.$$('.nav-item a').forEach(link => {
            const linkPath = new URL(link.href).pathname.split('/').pop();
            if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
                link.classList.add('active');
                
                // If it's in a dropdown, mark the parent as active too
                const parentDropdown = link.closest('.nav-item.dropdown');
                if (parentDropdown) {
                    parentDropdown.querySelector('.dropdown-toggle').classList.add('active');
                }
            }
        });
    },

    initScrollEffects() {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', Utils.throttle(() => {
            const currentScrollY = window.scrollY;
            
            // Header background opacity based on scroll
            if (currentScrollY > 50) {
                this.header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
            } else {
                this.header.style.boxShadow = 'none';
            }
            
            // Close mobile menu on scroll
            if (AppState.isMenuOpen && Math.abs(currentScrollY - lastScrollY) > 50) {
                this.closeMobileMenu();
            }
            
            lastScrollY = currentScrollY;
        }, 100));
    }
};

// Replace the original Navigation object in your script.js with EnhancedNavigation
// Or update your existing Navigation.init() call to EnhancedNavigation.init()

// Add touch gestures for mobile
const MobileGestures = {
    init() {
        if ('ontouchstart' in window) {
            this.setupSwipeGestures();
        }
    },

    setupSwipeGestures() {
        let startX = null;
        let startY = null;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;

            // Only handle horizontal swipes
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0 && AppState.isMenuOpen) {
                    // Swipe left to close menu
                    EnhancedNavigation.closeMobileMenu();
                }
            }

            startX = null;
            startY = null;
        });
    }
};

// Initialize enhanced navigation and gestures
document.addEventListener('DOMContentLoaded', function() {
    EnhancedNavigation.init();
    MobileGestures.init();
});
