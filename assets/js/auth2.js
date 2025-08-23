// Authentication Script - auth.js
// Fixed version with proper mobile menu and desktop logout

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
            this.addDesktopUserMenu();
            
            // Set up periodic session check
            setInterval(() => {
                if (!this.isLoggedIn()) {
                    alert('Your session has expired. Please login again.');
                    this.logout();
                }
            }, AUTH_CONFIG.checkInterval);
        },
        
        // Add logout button inside the hamburger menu (mobile)
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
                
                logoutItem.appendChild(logoutLink);
                navMenu.appendChild(logoutItem);
            }
        },
        
        // Add user menu for desktop with logout option
        addDesktopUserMenu: function() {
            const navActions = document.querySelector('.nav-actions');
            if (navActions) {
                // Check if user menu already exists
                const existingUserMenu = document.querySelector('.user-menu');
                if (!existingUserMenu) {
                    const userMenu = document.createElement('div');
                    userMenu.className = 'user-menu';
                    
                    const userButton = document.createElement('button');
                    userButton.className = 'user-btn';
                    userButton.innerHTML = '<i class="fas fa-user"></i> ' + this.getCurrentUser() + ' <i class="fas fa-chevron-down"></i>';
                    
                    const userDropdown = document.createElement('div');
                    userDropdown.className = 'user-dropdown';
                    userDropdown.innerHTML = `
                        <div class="user-dropdown-item user-info-item">
                            <i class="fas fa-user-circle"></i>
                            <span>Logged in as <strong>${this.getCurrentUser()}</strong></span>
                        </div>
                        <div class="user-dropdown-divider"></div>
                        <button class="user-dropdown-item logout-option">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Logout</span>
                        </button>
                    `;
                    
                    // Add logout functionality
                    userDropdown.querySelector('.logout-option').addEventListener('click', () => {
                        if (confirm('Are you sure you want to logout?')) {
                            this.logout();
                        }
                    });
                    
                    userMenu.appendChild(userButton);
                    userMenu.appendChild(userDropdown);
                    
                    // Insert before mobile toggle button
                    const mobileToggle = navActions.querySelector('.mobile-menu-toggle');
                    if (mobileToggle) {
                        navActions.insertBefore(userMenu, mobileToggle);
                    } else {
                        navActions.appendChild(userMenu);
                    }
                }
            }
        }
    };
    
    // Add CSS for the user menu and mobile fixes
    const style = document.createElement('style');
    style.textContent = `
        /* Desktop User Menu */
        .user-menu {
            position: relative;
            margin-right: var(--space-md);
        }
        
        .user-btn {
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
            min-height: 40px;
        }
        
        .user-btn:hover {
            background: var(--bg-secondary);
            border-color: var(--primary);
            color: var(--primary);
        }
        
        .user-dropdown {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            background: var(--bg-card);
            border: 1px solid var(--border-light);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all var(--transition-speed) ease;
            min-width: 200px;
            z-index: 1100;
        }
        
        .user-menu:hover .user-dropdown {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .user-dropdown-item {
            display: flex;
            align-items: center;
            gap: var(--space-sm);
            padding: var(--space-md) var(--space-lg);
            color: var(--text-secondary);
            cursor: pointer;
            transition: all var(--transition-speed) ease;
            border: none;
            background: none;
            width: 100%;
            text-align: left;
            font-size: 0.9rem;
        }
        
        .user-dropdown-item:hover {
            background: var(--bg-tertiary);
            color: var(--text-primary);
        }
        
        .user-info-item {
            cursor: default;
            color: var(--text-primary);
        }
        
        .user-info-item:hover {
            background: transparent;
        }
        
        .logout-option {
            color: var(--accent) !important;
            font-weight: 500;
        }
        
        .logout-option:hover {
            background: rgba(229, 62, 62, 0.1) !important;
            color: var(--primary) !important;
        }
        
        .user-dropdown-divider {
            height: 1px;
            background: var(--border-light);
            margin: var(--space-xs) 0;
        }
        
        /* Mobile Styles */
        @media (max-width: 992px) {
            .user-menu {
                display: none !important;
            }
            
            /* Fixed mobile menu toggle centering */
            .mobile-menu-toggle {
                display: flex !important;
                align-items: center;
                justify-content: center;
                background: var(--bg-tertiary);
                border: 1px solid var(--border-light);
                color: var(--text-primary);
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                border-radius: var(--radius-md);
                transition: all var(--transition-speed) ease;
                z-index: 1200;
                width: 44px;
                height: 44px;
            }
            
            .mobile-menu-toggle:hover {
                background: var(--primary);
                border-color: var(--primary);
                color: var(--text-white);
            }
            
            .mobile-menu-toggle i {
                font-size: 1.1rem;
            }
            
            /* Enhanced mobile logout styling */
            .logout-item {
                border-top: 2px solid var(--border-medium) !important;
                margin-top: var(--space-lg) !important;
                background: var(--bg-tertiary);
            }
            
            .logout-item a {
                color: var(--accent) !important;
                font-weight: 600 !important;
                background: linear-gradient(135deg, rgba(229, 62, 62, 0.1), rgba(229, 62, 62, 0.05)) !important;
                border-left: 4px solid var(--accent) !important;
                border-radius: 0 !important;
            }
            
            .logout-item a:hover {
                color: var(--primary-light) !important;
                background: linear-gradient(135deg, rgba(229, 62, 62, 0.2), rgba(229, 62, 62, 0.1)) !important;
                border-left-color: var(--primary-light) !important;
            }
            
            .logout-item a i {
                color: var(--accent) !important;
            }
        }
        
        /* Desktop only */
        @media (min-width: 993px) {
            .logout-item {
                display: none !important;
            }
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
