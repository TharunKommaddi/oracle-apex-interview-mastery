// Authentication Script - auth.js
// Add this to all protected pages

(function() {
    'use strict';
    
    // Configuration
    const AUTH_CONFIG = {
        loginPage: 'login.html',
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        checkInterval: 5 * 60 * 1000 // Check every 5 minutes
    };
    
    // Authentication object
    const Auth = {
        // Check if user is logged in
        isLoggedIn: function() {
            const isLoggedIn = sessionStorage.getItem('isLoggedIn');
            const loginTime = sessionStorage.getItem('loginTime');
            
            if (!isLoggedIn || isLoggedIn !== 'true' || !loginTime) {
                return false;
            }
            
            // Check if session has expired
            const loginTimestamp = new Date(loginTime).getTime();
            const now = new Date().getTime();
            const timeDiff = now - loginTimestamp;
            
            if (timeDiff > AUTH_CONFIG.sessionTimeout) {
                this.logout();
                return false;
            }
            
            return true;
        },
        
        // Get current user
        getCurrentUser: function() {
            return sessionStorage.getItem('username');
        },
        
        // Logout function
        logout: function() {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('username');
            sessionStorage.removeItem('loginTime');
            window.location.href = AUTH_CONFIG.loginPage;
        },
        
        // Redirect to login if not authenticated
        requireAuth: function() {
            if (!this.isLoggedIn()) {
                window.location.href = AUTH_CONFIG.loginPage;
                return false;
            }
            return true;
        },
        
        // Initialize authentication
        init: function() {
            // Check authentication on page load
            this.requireAuth();
            
            // Add logout functionality to navigation
            this.addLogoutButton();
            
            // Set up periodic session check
            setInterval(() => {
                if (!this.isLoggedIn()) {
                    alert('Your session has expired. Please login again.');
                    this.logout();
                }
            }, AUTH_CONFIG.checkInterval);
        },
        
        // Add logout button to navigation
        addLogoutButton: function() {
            const navActions = document.querySelector('.nav-actions');
            if (navActions) {
                const logoutBtn = document.createElement('button');
                logoutBtn.className = 'logout-btn';
                logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
                logoutBtn.title = 'Logout (' + this.getCurrentUser() + ')';
                logoutBtn.addEventListener('click', () => {
                    if (confirm('Are you sure you want to logout?')) {
                        this.logout();
                    }
                });
                
                // Add styles for logout button
                logoutBtn.style.cssText = `
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-light);
                    color: var(--text-secondary);
                    padding: var(--space-sm) var(--space-md);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    font-size: 0.85rem;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    transition: all var(--transition-speed) ease;
                    margin-left: var(--space-md);
                `;
                
                // Add hover effect
                logoutBtn.addEventListener('mouseenter', function() {
                    this.style.background = 'var(--primary)';
                    this.style.borderColor = 'var(--primary)';
                    this.style.color = 'var(--text-white)';
                });
                
                logoutBtn.addEventListener('mouseleave', function() {
                    this.style.background = 'var(--bg-tertiary)';
                    this.style.borderColor = 'var(--border-light)';
                    this.style.color = 'var(--text-secondary)';
                });
                
                navActions.appendChild(logoutBtn);
            }
        }
    };
    
    // Initialize authentication when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Auth.init());
    } else {
        Auth.init();
    }
    
    // Make Auth available globally
    window.Auth = Auth;
})();
