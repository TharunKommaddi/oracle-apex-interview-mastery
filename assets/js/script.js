// Ultra Modern JavaScript - Minimalistic & Efficient
'use strict';

// App State
const state = {
    menu: false,
    filter: 'all',
    search: ''
};

// Utilities
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

const animate = (element, animation) => {
    element.classList.add(animation);
    element.addEventListener('animationend', () => {
        element.classList.remove(animation);
    }, { once: true });
};

// Navigation
const toggleMenu = () => {
    const menu = $('#navMenu');
    const toggle = $('.menu-toggle');
    
    state.menu = !state.menu;
    menu.classList.toggle('active', state.menu);
    toggle.setAttribute('aria-expanded', state.menu);
    toggle.innerHTML = state.menu ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    
    // Prevent body scroll on mobile
    document.body.style.overflow = state.menu ? 'hidden' : '';
};

// Close menu on outside click
document.addEventListener('click', (e) => {
    const menu = $('#navMenu');
    const toggle = $('.menu-toggle');
    
    if (state.menu && !menu?.contains(e.target) && !toggle?.contains(e.target)) {
        toggleMenu();
    }
});

// Close menu on escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.menu) {
        toggleMenu();
    }
});

// Auto-close menu on resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && state.menu) {
        toggleMenu();
    }
});

// Questions Management
const Questions = {
    container: null,
    data: [],

    init() {
        this.container = $('#questionsContainer');
        if (!this.container) return;

        this.bindEvents();
        this.setupSearch();
    },

    bindEvents() {
        // Filter tabs
        $$('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.textContent.toLowerCase();
                this.filter(category === 'all questions' ? 'all' : category);
            });
        });

        // Question toggles
        this.container.addEventListener('click', (e) => {
            const header = e.target.closest('.question-header');
            if (header) this.toggle(header);
        });

        // Copy buttons
        this.container.addEventListener('click', (e) => {
            const btn = e.target.closest('.copy-btn');
            if (btn) this.copy(btn);
        });
    },

    setupSearch() {
        const input = $('#searchInput');
        if (!input) return;

        const search = debounce((term) => {
            this.search(term);
        }, 300);

        input.addEventListener('input', (e) => search(e.target.value));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.target.value = '';
                this.search('');
            }
        });
    },

    toggle(header) {
        const container = header.parentElement;
        const content = container.querySelector('.question-content');
        const toggle = header.querySelector('.question-toggle');
        
        const isActive = content.classList.contains('active');
        
        // Close others (accordion style)
        $$('.question-content.active').forEach(c => {
            if (c !== content) {
                c.classList.remove('active');
                c.parentElement.querySelector('.question-toggle').classList.remove('rotated');
            }
        });
        
        // Toggle current
        content.classList.toggle('active', !isActive);
        toggle.classList.toggle('rotated', !isActive);
        
        // Smooth scroll to question
        if (!isActive) {
            setTimeout(() => {
                header.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    },

    filter(category) {
        state.filter = category;
        
        // Update active tab
        $$('.filter-tab').forEach(tab => {
            const isActive = tab.textContent.toLowerCase().includes(category) || 
                           (category === 'all' && tab.textContent.includes('All'));
            tab.classList.toggle('active', isActive);
        });
        
        // Filter questions
        const questions = $$('.question');
        let visible = 0;
        
        questions.forEach(q => {
            const qCategory = q.dataset.category;
            const show = category === 'all' || qCategory === category;
            
            q.style.display = show ? 'block' : 'none';
            if (show) {
                visible++;
                animate(q, 'fade-in');
            }
        });
        
        this.showMessage(visible, 'filter', category);
    },

    search(term) {
        state.search = term.toLowerCase().trim();
        
        const questions = $$('.question');
        let visible = 0;
        
        questions.forEach(q => {
            const text = q.textContent.toLowerCase();
            const matches = !state.search || text.includes(state.search);
            const passesFilter = state.filter === 'all' || q.dataset.category === state.filter;
            const show = matches && passesFilter;
            
            q.style.display = show ? 'block' : 'none';
            if (show) visible++;
        });
        
        this.showMessage(visible, 'search', state.search);
    },

    showMessage(count, type, term) {
        // Remove existing messages
        $$('.message').forEach(m => m.remove());
        
        if (count === 0) {
            const message = document.createElement('div');
            message.className = 'message';
            message.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--gray-400);">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No questions found${type === 'search' ? ` for "${term}"` : ` in ${term} category`}.</p>
                    ${type === 'search' ? `<button onclick="$('#searchInput').value = ''; Questions.search('')" 
                        style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary); color: white; border: none; border-radius: var(--radius); cursor: pointer;">
                        Clear Search</button>` : ''}
                </div>
            `;
            this.container.appendChild(message);
        }
    },

    async copy(btn) {
        const code = btn.closest('.code-block').querySelector('.code-content').textContent;
        
        try {
            await navigator.clipboard.writeText(code);
            this.showCopySuccess(btn);
        } catch {
            this.fallbackCopy(code, btn);
        }
    },

    fallbackCopy(text, btn) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.showCopySuccess(btn);
    },

    showCopySuccess(btn) {
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied';
        btn.style.background = 'rgba(34, 197, 94, 0.2)';
        btn.style.color = 'rgb(34, 197, 94)';
        
        setTimeout(() => {
            btn.innerHTML = original;
            btn.style.background = '';
            btn.style.color = '';
        }, 2000);
    },

    create(question) {
        const badges = {
            basic: 'badge-basic',
            intermediate: 'badge-intermediate',
            advanced: 'badge-advanced'
        };
        
        return `
            <div class="question" data-category="${question.category}">
                <div class="question-header">
                    <div class="question-number">Q${question.id}</div>
                    <div class="question-text">${question.question}</div>
                    <div class="question-badge ${badges[question.difficulty]}">${question.difficulty}</div>
                    <div class="question-toggle"><i class="fas fa-chevron-down"></i></div>
                </div>
                <div class="question-content">
                    <div class="answer">${question.answer}</div>
                    ${question.code ? `
                        <div class="code-block">
                            <div class="code-header">
                                <div class="code-lang">${question.language || 'Code'}</div>
                                <button class="copy-btn">
                                    <i class="fas fa-copy"></i> Copy
                                </button>
                            </div>
                            <div class="code-content">${this.escapeHtml(question.code)}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    load(questions) {
        if (!this.container) return;
        
        this.data = questions;
        this.container.innerHTML = questions.map(q => this.create(q)).join('');
        
        // Animate in
        $$('.question').forEach((q, i) => {
            q.style.animationDelay = `${i * 0.1}s`;
            animate(q, 'fade-in');
        });
    }
};

// Intersection Observer for animations
const observeElements = () => {
    if (!('IntersectionObserver' in window)) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animate(entry.target, 'fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    $$('.card, .stat').forEach(el => observer.observe(el));
};

// Smooth scroll for anchor links
$$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = $(link.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Header scroll effect
let lastScroll = 0;
const header = $('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.9)';
        header.style.boxShadow = 'none';
    }
    
    // Hide/show header on scroll
    if (currentScroll > lastScroll && currentScroll > 200) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
}, { passive: true });

// Initialize when DOM is ready
const init = () => {
    Questions.init();
    observeElements();
    
    // Mark active nav links
    const path = window.location.pathname;
    $$('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', path.includes(href) || 
                            (path === '/' && href === 'index.html'));
    });
    
    console.log('🚀 APEX Interview Mastery initialized');
};

// Error handling
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
});

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Global functions for compatibility
window.toggleMenu = toggleMenu;
window.Questions = Questions;
window.createQuestionElement = (q) => Questions.create(q);
window.toggleQuestion = (el) => Questions.toggle(el);
window.filterQuestions = (cat) => Questions.filter(cat);
window.searchQuestions = (term) => Questions.search(term || '');
window.copyCode = (btn) => Questions.copy(btn);
