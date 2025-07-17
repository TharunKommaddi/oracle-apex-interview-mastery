// Global Variables
let currentFilters = {};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Add smooth scrolling
    addSmoothScrolling();
    
    // Initialize observers
    initializeObservers();
    
    // Load questions if on questions page
    if (document.getElementById('questionsContainer')) {
        loadQuestions();
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');
}

// Question Management
function toggleQuestion(headerElement) {
    const questionContainer = headerElement.parentElement;
    const content = questionContainer.querySelector('.question-content');
    const toggle = headerElement.querySelector('.question-toggle');
    
    if (content.classList.contains('active')) {
        content.classList.remove('active');
        toggle.classList.remove('rotated');
    } else {
        content.classList.add('active');
        toggle.classList.add('rotated');
    }
}

// Filter Questions
function filterQuestions(category) {
    currentFilters.category = category;
    
    // Update active filter tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show/hide questions
    const questions = document.querySelectorAll('.question-container');
    questions.forEach(question => {
        const questionCategory = question.getAttribute('data-category');
        const shouldShow = category === 'all' || questionCategory === category;
        question.style.display = shouldShow ? 'block' : 'none';
    });
}

// Search Questions
function searchQuestions() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase();
    const questions = document.querySelectorAll('.question-container');
    
    questions.forEach(question => {
        const questionText = question.querySelector('.question-text').textContent.toLowerCase();
        const answerText = question.querySelector('.question-content').textContent.toLowerCase();
        
        const matches = questionText.includes(searchTerm) || answerText.includes(searchTerm);
        
        // Check if it also passes current filter
        const category = currentFilters.category || 'all';
        const questionCategory = question.getAttribute('data-category');
        const passesFilter = category === 'all' || questionCategory === category;
        
        question.style.display = (matches && passesFilter) ? 'block' : 'none';
    });
}

// Copy Code to Clipboard
function copyCode(buttonElement) {
    const codeBlock = buttonElement.closest('.code-block');
    const codeText = codeBlock.querySelector('pre').textContent;
    
    navigator.clipboard.writeText(codeText).then(() => {
        const originalText = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="fas fa-check"></i> Copied!';
        buttonElement.style.background = '#27ae60';
        
        setTimeout(() => {
            buttonElement.innerHTML = originalText;
            buttonElement.style.background = 'transparent';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = codeText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        const originalText = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            buttonElement.innerHTML = originalText;
        }, 2000);
    });
}

// Load Questions (to be implemented in each question page)
function loadQuestions() {
    // This function will be overridden in individual question pages
    console.log('Loading questions...');
}

// Create Question Element
function createQuestionElement(question) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-container';
    questionDiv.setAttribute('data-category', question.category);
    questionDiv.setAttribute('data-difficulty', question.difficulty);
    
    const difficultyClass = getDifficultyClass(question.difficulty);
    const difficultyLabel = question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1);
    
    questionDiv.innerHTML = `
        <div class="question-header" onclick="toggleQuestion(this)">
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
                        <button class="copy-btn" onclick="copyCode(this)">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    <pre><code>${question.code}</code></pre>
                </div>
            ` : ''}
        </div>
    `;
    
    return questionDiv;
}

// Get Difficulty CSS Class
function getDifficultyClass(difficulty) {
    switch(difficulty) {
        case 'basic': return 'difficulty-basic';
        case 'intermediate': return 'difficulty-intermediate';
        case 'advanced': return 'difficulty-advanced';
        default: return 'difficulty-basic';
   }
}

// Smooth Scrolling
function addSmoothScrolling() {
   document.querySelectorAll('a[href^="#"]').forEach(anchor => {
       anchor.addEventListener('click', function (e) {
           e.preventDefault();
           const target = document.querySelector(this.getAttribute('href'));
           if (target) {
               target.scrollIntoView({
                   behavior: 'smooth'
               });
           }
       });
   });
}

// Initialize Observers for Animations
function initializeObservers() {
   const observerOptions = {
       threshold: 0.1,
       rootMargin: '0px 0px -50px 0px'
   };

   const observer = new IntersectionObserver((entries) => {
       entries.forEach(entry => {
           if (entry.isIntersecting) {
               entry.target.classList.add('fade-in');
           }
       });
   }, observerOptions);

   // Observe elements for animation
   document.querySelectorAll('.card, .question-container, .stat-card').forEach(el => {
       observer.observe(el);
   });
}

// Utility Functions
function showLoading(elementId) {
   const element = document.getElementById(elementId);
   if (element) {
       element.innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
   }
}

function hideLoading(elementId) {
   const element = document.getElementById(elementId);
   if (element) {
       element.innerHTML = '';
   }
}

// Export functions for use in other files
window.toggleQuestion = toggleQuestion;
window.filterQuestions = filterQuestions;
window.searchQuestions = searchQuestions;
window.copyCode = copyCode;
window.toggleMobileMenu = toggleMobileMenu;
window.createQuestionElement = createQuestionElement;
