// Modern JavaScript for APEX Interview Mastery Platform
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
    $(selector) { return document.querySelector(selector); },
    $$(selector) { return document.querySelectorAll(selector); },
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
            if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else {
                element[key] = value;
            }
        });
        children.forEach(child => {
            element.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
        });
        return element;
    },
};

// Theme management
const ThemeSwitcher = {
    init() {
        this.themeToggleBtn = Utils.$('#theme-toggle');
        this.body = document.body;
        this.sunIcon = 'fa-sun';
        this.moonIcon = 'fa-moon';
        this.bindEvents();
        this.applyInitialTheme();
    },

    bindEvents() {
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }
    },

    applyInitialTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            this.body.classList.add('dark-mode');
            this.updateIcon(true);
        } else {
            this.body.classList.remove('dark-mode');
            this.updateIcon(false);
        }
    },

    toggleTheme() {
        const isDark = this.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.updateIcon(isDark);
    },
    
    updateIcon(isDark) {
        if (this.themeToggleBtn) {
            const icon = this.themeToggleBtn.querySelector('i');
            if (icon) {
                icon.classList.remove(isDark ? this.moonIcon : this.sunIcon);
                icon.classList.add(isDark ? this.sunIcon : this.moonIcon);
            }
        }
    }
};

// Navigation management
const Navigation = {
    init() {
        this.mobileToggle = Utils.$('.mobile-menu-toggle');
        this.navMenu = Utils.$('.nav-menu');
        this.bindEvents();
        this.handleActiveStates();
    },

    bindEvents() {
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
        }
    },

    toggleMobileMenu() {
        AppState.isMenuOpen = !AppState.isMenuOpen;
        this.navMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        this.mobileToggle.setAttribute('aria-expanded', AppState.isMenuOpen);
        const icon = this.mobileToggle.querySelector('i');
        icon.classList.toggle('fa-bars', !AppState.isMenuOpen);
        icon.classList.toggle('fa-times', AppState.isMenuOpen);
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

// Questions management
const Questions = {
    init() {
        this.container = Utils.$('#questionsContainer');
        if (!this.container) return;
        this.bindEvents();
        this.setupSearch();
    },

    bindEvents() {
        Utils.$$('.filter-tab').forEach(tab => {
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
        const searchInput = Utils.$('#searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.searchQuestions(e.target.value);
            }, 300));
        }
    },

    toggleQuestion(headerElement) {
        const content = headerElement.nextElementSibling;
        const toggleIcon = headerElement.querySelector('.question-toggle');
        
        if (content.style.display === 'block') {
            content.style.display = 'none';
            toggleIcon.classList.remove('rotated');
        } else {
            content.style.display = 'block';
            toggleIcon.classList.add('rotated');
        }
    },

    filterQuestions(category) {
        AppState.currentFilters.category = category;
        Utils.$$('.filter-tab').forEach(tab => {
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
        Utils.$$('.question-container').forEach(question => {
            const questionCategory = question.dataset.category;
            const questionText = question.textContent.toLowerCase();
            
            const categoryMatch = category === 'all' || questionCategory === category;
            const searchMatch = !search || questionText.includes(search);

            question.style.display = (categoryMatch && searchMatch) ? 'block' : 'none';
        });
    },

    copyCode(buttonElement) {
        const codeText = buttonElement.closest('.code-block').querySelector('pre').textContent;
        navigator.clipboard.writeText(codeText).then(() => {
            const originalText = buttonElement.innerHTML;
            buttonElement.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => { buttonElement.innerHTML = originalText; }, 2000);
        }).catch(err => console.error('Failed to copy text: ', err));
    },

    createQuestionElement(q) {
        const difficultyClass = `difficulty-${q.difficulty}`;
        const container = Utils.createElement('div', {
            className: 'question-container fade-in',
            'data-category': q.category,
            'data-difficulty': q.difficulty,
        });

        container.innerHTML = `
            <div class="question-header">
                <div class="question-text">${q.question}</div>
                <div class="question-details">
                    <span class="difficulty-badge ${difficultyClass}">${q.difficulty}</span>
                    <div class="question-toggle"><i class="fas fa-chevron-down"></i></div>
                </div>
            </div>
            <div class="question-content" style="display: none;">
                <div class="answer-content">${q.answer}</div>
                ${q.code ? `
                    <div class="code-block">
                        <div class="code-header">
                            <span class="code-lang">${q.language || 'Code'}</span>
                            <button class="copy-btn"><i class="fas fa-copy"></i> Copy</button>
                        </div>
                        <pre><code>${q.code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
                    </div>
                ` : ''}
            </div>
        `;
        return container;
    }
};

// App initialization
class App {
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            ThemeSwitcher.init();
            Navigation.init();
            Questions.init();
        });
    }
}

// Global functions for backward compatibility if needed on HTML pages
window.filterQuestions = (category) => Questions.filterQuestions(category);
window.searchQuestions = () => Questions.searchQuestions(Utils.$('#searchInput').value);
window.createQuestionElement = (q) => Questions.createQuestionElement(q);

// Initialize the app
new App().init();
