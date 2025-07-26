// Fixed Authentication Script - auth.js
// Compatible with existing Navigation system

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
            
            // Add logout functionality
            this.addLogoutElements();
            
            // Set up periodic session check
            setInterval(() => {
                if (!this.isLoggedIn()) {
                    alert('Your session has expired. Please login again.');
                    this.logout();
                }
            }, AUTH_CONFIG.checkInterval);
            
            // Set up dropdown functionality for mobile
            this.setupMobileDropdowns();
        },
        
        // Add logout elements for both desktop and mobile
        addLogoutElements: function() {
            // Add logout to mobile menu
            this.addMobileLogout();
            
            // Add user info and logout to desktop
            this.addDesktopElements();
        },
        
        // Add logout to mobile hamburger menu
        addMobileLogout: function() {
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                // Check if logout item already exists
                const existingLogout = navMenu.querySelector('.logout-item');
                if (existingLogout) {
                    existingLogout.remove();
                }
                
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
                
                logoutItem.appendChild(logoutLink);
                navMenu.appendChild(logoutItem);
            }
        },
        
        // Add desktop user info and logout
        addDesktopElements: function() {
            const navActions = document.querySelector('.nav-actions');
            if (navActions) {
                // Remove existing elements
                const existingUserInfo = document.querySelector('.user-info');
                const existingLogout = document.querySelector('.logout-btn');
                if (existingUserInfo) existingUserInfo.remove();
                if (existingLogout) existingLogout.remove();
                
                // Add user info
                const userInfo = document.createElement('div');
                userInfo.className = 'user-info';
                userInfo.innerHTML = '<i class="fas fa-user"></i> ' + this.getCurrentUser();
                
                // Add logout button
                const logoutBtn = document.createElement('button');
                logoutBtn.className = 'logout-btn';
                logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
                logoutBtn.title = 'Logout from APEX Interview Mastery';
                logoutBtn.addEventListener('click', () => {
                    if (confirm('Are you sure you want to logout?')) {
                        this.logout();
                    }
                });
                
                // Insert before mobile toggle button
                const mobileToggle = navActions.querySelector('.mobile-menu-toggle');
                if (mobileToggle) {
                    navActions.insertBefore(userInfo, mobileToggle);
                    navActions.insertBefore(logoutBtn, mobileToggle);
                } else {
                    navActions.appendChild(userInfo);
                    navActions.appendChild(logoutBtn);
                }
            }
        },
        
        // Setup mobile dropdown functionality (compatible with existing code)
        setupMobileDropdowns: function() {
            // Wait for DOM to be ready and Navigation to be initialized
            setTimeout(() => {
                const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
                dropdownToggles.forEach(toggle => {
                    // Only add if not already handled
                    if (!toggle.hasAttribute('data-dropdown-handled')) {
                        toggle.setAttribute('data-dropdown-handled', 'true');
                        toggle.addEventListener('click', (e) => {
                            if (window.innerWidth <= 992) {
                                e.preventDefault();
                                const dropdown = toggle.closest('.dropdown');
                                if (dropdown) {
                                    dropdown.classList.toggle('active');
                                    
                                    // Close other dropdowns
                                    document.querySelectorAll('.nav-item.dropdown').forEach(item => {
                                        if (item !== dropdown) {
                                            item.classList.remove('active');
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }, 100);
        }
    };
    
    // Add CSS for proper styling
    const style = document.createElement('style');
    style.textContent = `
        /* Desktop logout and user info */
        .user-info {
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
        }
        
        .logout-btn {
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
            margin-right: var(--space-md);
        }
        
        .logout-btn:hover {
            background: var(--primary);
            border-color: var(--primary);
            color: var(--text-white);
        }
        
        /* Mobile logout styling */
        .logout-item {
            border-top: 2px solid var(--border-medium) !important;
            margin-top: var(--space-lg);
            background: var(--bg-tertiary);
        }
        
        .logout-item a {
            color: var(--accent) !important;
            font-weight: 600;
            background: linear-gradient(135deg, rgba(229, 62, 62, 0.1), rgba(229, 62, 62, 0.05));
            border-left: 4px solid var(--accent);
        }
        
        .logout-item a:hover {
            color: var(--primary-light) !important;
            background: linear-gradient(135deg, rgba(229, 62, 62, 0.2), rgba(229, 62, 62, 0.1));
            border-left-color: var(--primary-light);
        }
        
        /* Mobile dropdown enhancement */
        .nav-item.dropdown.active .dropdown-menu {
            opacity: 1;
            visibility: visible;
            max-height: 300px;
            padding: var(--space-sm) 0;
        }
        
        .dropdown-toggle .fa-chevron-down {
            transition: transform var(--transition-speed) ease;
        }
        
        .nav-item.dropdown.active .dropdown-toggle .fa-chevron-down {
            transform: rotate(180deg);
        }
        
        /* Responsive visibility */
        @media (max-width: 992px) {
            .user-info,
            .logout-btn {
                display: none !important;
            }
        }
        
        @media (min-width: 993px) {
            .logout-item {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize authentication when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Wait a bit for other scripts to initialize
            setTimeout(() => Auth.init(), 100);
        });
    } else {
        setTimeout(() => Auth.init(), 100);
    }
    
    // Make Auth available globally
    window.Auth = Auth;
})();
