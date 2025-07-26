// Authentication Script - auth.js
// Updated to place logout inside mobile hamburger menu

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
            this.addLogoutToMenu();
            
            // Set up periodic session check
            setInterval(() => {
                if (!this.isLoggedIn()) {
                    alert('Your session has expired. Please login again.');
                    this.logout();
                }
            }, AUTH_CONFIG.checkInterval);
        },
        
        // Add logout button inside the hamburger menu
        addLogoutToMenu: function() {
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                // Create logout menu item
                const logoutItem = document.createElement('li');
                logoutItem.className = 'nav-item logout-item';
                
                const logoutLink = document.createElement('a');
                logoutLink.href = '#';
                logoutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout (' + this.getCurrentUser() + ')';
                logoutLink.title = 'Logout from APEX Interview Mastery';
                
                // Add click handler
                logoutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (confirm('Are you sure you want to logout?')) {
                        this.logout();
                    }
                });
                
                // Add styles for logout item
                logoutItem.style.cssText = `
                    border-top: 1px solid var(--border-light);
                    margin-top: var(--space-lg);
                    padding-top: var(--space-lg);
                `;
                
                logoutLink.style.cssText = `
                    color: var(--accent) !important;
                    font-weight: 600;
                    transition: all var(--transition-speed) ease;
                `;
                
                // Add hover effect
                logoutLink.addEventListener('mouseenter', function() {
                    this.style.color = 'var(--primary-light) !important';
                    this.style.background = 'var(--bg-tertiary)';
                });
                
                logoutLink.addEventListener('mouseleave', function() {
                    this.style.color = 'var(--accent) !important';
                    this.style.background = 'transparent';
                });
                
                logoutItem.appendChild(logoutLink);
                navMenu.appendChild(logoutItem);
                
                // Remove any existing logout button from nav-actions (desktop)
                const existingLogout = document.querySelector('.logout-btn');
                if (existingLogout) {
                    existingLogout.remove();
                }
                
                // Add user info to nav-actions for desktop only
                this.addUserInfo();
            }
        },
        
        // Add user info to nav-actions (desktop only)
        addUserInfo: function() {
            const navActions = document.querySelector('.nav-actions');
            if (navActions) {
                // Check if user info already exists
                const existingUserInfo = document.querySelector('.user-info');
                if (!existingUserInfo) {
                    const userInfo = document.createElement('div');
                    userInfo.className = 'user-info';
                    userInfo.innerHTML = '<i class="fas fa-user"></i> ' + this.getCurrentUser();
                    
                    userInfo.style.cssText = `
                        color: var(--text-secondary);
                        font-size: 0.85rem;
                        margin-right: var(--space-md);
                        display: flex;
                        align-items: center;
                        gap: var(--space-xs);
                        padding: var(--space-sm) var(--space-md);
                        background: var(--bg-tertiary);
                        border-radius: var(--radius-md);
                        border: 1px solid var(--border-light);
                    `;
                    
                    // Insert before mobile toggle button
                    const mobileToggle = navActions.querySelector('.mobile-menu-toggle');
                    if (mobileToggle) {
                        navActions.insertBefore(userInfo, mobileToggle);
                    } else {
                        navActions.appendChild(userInfo);
                    }
                }
            }
        }
    };
    
    // Add CSS for mobile responsive logout
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 992px) {
            .user-info {
                display: none !important;
            }
        }
        
        @media (min-width: 993px) {
            .logout-item {
                display: none !important;
            }
        }
        
        .logout-item a {
            border-radius: var(--radius-md);
            padding: var(--space-sm) var(--space-md);
        }
    `;
    document.head.appendChild(style);
    
    // Initialize authentication when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Auth.init());
    } else {
        Auth.init();
    }
    
    // Make Auth available globally
    window.Auth = Auth;
})();
