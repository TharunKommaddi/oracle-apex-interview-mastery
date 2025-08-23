// Updated Authentication Script - auth.js
// Works with approval-based system

(function() {
    'use strict';
    
    // Configuration
    const AUTH_CONFIG = {
        loginPage: 'login.html', // Keep existing login page name
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        checkInterval: 5 * 60 * 1000 // Check every 5 minutes
    };
    
    // Authentication object
    const Auth = {
        // Check if user is logged in
        isLoggedIn: function() {
            const isLoggedIn = sessionStorage.getItem('isLoggedIn');
            const loginTime = sessionStorage.getItem('loginTime');
            const userEmail = sessionStorage.getItem('userEmail');
            
            if (!isLoggedIn || isLoggedIn !== 'true' || !loginTime || !userEmail) {
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
            
            // Additional check: verify user is still approved
            if (!this.isUserApproved(userEmail)) {
                this.logout();
                return false;
            }
            
            return true;
        },
        
        // Check if user is approved
        isUserApproved: function(email) {
            const approvedUsers = JSON.parse(localStorage.getItem('apex_approved_users') || '[]');
            return approvedUsers.some(user => user.email.toLowerCase() === email.toLowerCase());
        },
        
        // Get current user
        getCurrentUser: function() {
            return sessionStorage.getItem('username') || sessionStorage.getItem('userEmail');
        },
        
        // Get current user email
        getCurrentUserEmail: function() {
            return sessionStorage.getItem('userEmail');
        },
        
        // Get current user access type
        getAccessType: function() {
            return sessionStorage.getItem('accessType') || 'user';
        },
        
        // Logout function
        logout: function() {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('username');
            sessionStorage.removeItem('userEmail');
            sessionStorage.removeItem('accessType');
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
                    alert('Your session has expired or access has been revoked. Please login again.');
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
                    
                    const userName = this.getCurrentUser();
                    const accessType = this.getAccessType();
                    
                    const userButton = document.createElement('button');
                    userButton.className = 'user-btn';
                    userButton.innerHTML = `<i class="fas fa-user"></i> ${userName} <i class="fas fa-chevron-down"></i>`;
                    
                    const userDropdown = document.createElement('div');
                    userDropdown.className = 'user-dropdown';
                    userDropdown.innerHTML = `
                        <div class="user-dropdown-item user-info-item">
                            <i class="fas fa-user-circle"></i>
                            <div>
                                <div><strong>${userName}</strong></div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">${accessType} access</div>
                            </div>
                        </div>
                        <div class="user-dropdown-divider"></div>
                        <div class="user-dropdown-item">
                            <i class="fas fa-envelope"></i>
                            <span style="font-size: 0.8rem;">${this.getCurrentUserEmail()}</span>
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
        },
        
        // Admin functions for managing users
        admin: {
            // Approve a user (for admin use)
            approveUser: function(email, fullName, accessType, password) {
                const approvedUsers = JSON.parse(localStorage.getItem('apex_approved_users') || '[]');
                const requests = JSON.parse(localStorage.getItem('apex_access_requests') || '[]');
                
                // Check if request exists
                const request = requests.find(req => req.email.toLowerCase() === email.toLowerCase());
                if (!request) {
                    console.error('No request found for email:', email);
                    return false;
                }
                
                // Create approved user
                const approvedUser = {
                    email: email.toLowerCase(),
                    fullName: fullName || request.fullName,
                    accessType: accessType,
                    password: password,
                    approvedAt: new Date().toISOString(),
                    requestId: request.requestId
                };
                
                // Add to approved users
                approvedUsers.push(approvedUser);
                localStorage.setItem('apex_approved_users', JSON.stringify(approvedUsers));
                
                // Update request status
                const requestIndex = requests.findIndex(req => req.email.toLowerCase() === email.toLowerCase());
                if (requestIndex !== -1) {
                    requests[requestIndex].status = 'approved';
                    requests[requestIndex].approvedAt = new Date().toISOString();
                    requests[requestIndex].credentials = {
                        email: email,
                        password: password
                    };
                    localStorage.setItem('apex_access_requests', JSON.stringify(requests));
                }
                
                console.log('âœ… User approved successfully:', email);
                console.log('ðŸ“§ Send them their credentials:');
                console.log(`Email: ${email}`);
                console.log(`Password: ${password}`);
                return true;
            },
            
            // Reject a user request
            rejectUser: function(email, reason = '') {
                const requests = JSON.parse(localStorage.getItem('apex_access_requests') || '[]');
                const requestIndex = requests.findIndex(req => req.email.toLowerCase() === email.toLowerCase());
                
                if (requestIndex !== -1) {
                    requests[requestIndex].status = 'rejected';
                    requests[requestIndex].rejectedAt = new Date().toISOString();
                    requests[requestIndex].rejectionReason = reason;
                    localStorage.setItem('apex_access_requests', JSON.stringify(requests));
                    
                    console.log('âŒ User request rejected:', email);
                    return true;
                }
                
                console.error('No request found for email:', email);
                return false;
            },
            
            // Revoke user access
            revokeAccess: function(email) {
                let approvedUsers = JSON.parse(localStorage.getItem('apex_approved_users') || '[]');
                approvedUsers = approvedUsers.filter(user => user.email.toLowerCase() !== email.toLowerCase());
                localStorage.setItem('apex_approved_users', JSON.stringify(approvedUsers));
                
                // Update request status
                const requests = JSON.parse(localStorage.getItem('apex_access_requests') || '[]');
                const requestIndex = requests.findIndex(req => req.email.toLowerCase() === email.toLowerCase());
                if (requestIndex !== -1) {
                    requests[requestIndex].status = 'revoked';
                    requests[requestIndex].revokedAt = new Date().toISOString();
                    localStorage.setItem('apex_access_requests', JSON.stringify(requests));
                }
                
                console.log('ðŸš« User access revoked:', email);
                return true;
            },
            
            // View all requests
            viewRequests: function() {
                const requests = JSON.parse(localStorage.getItem('apex_access_requests') || '[]');
                console.table(requests);
                return requests;
            },
            
            // View all approved users
            viewApprovedUsers: function() {
                const users = JSON.parse(localStorage.getItem('apex_approved_users') || '[]');
                console.table(users);
                return users;
            },
            
            // Clear all data (dangerous - for testing only)
            clearAllData: function() {
                if (confirm('This will delete all user data. Are you sure?')) {
                    localStorage.removeItem('apex_access_requests');
                    localStorage.removeItem('apex_approved_users');
                    console.log('All authentication data cleared');
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
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
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
            min-width: 250px;
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
            padding: var(--space-lg) var(--space-lg);
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
    
    // Make Auth available globally for admin functions
    window.Auth = Auth;
    
    // Expose admin functions for console access
    window.AuthAdmin = Auth.admin;
    
    // Console helper message
    console.log('ðŸš€ APEX Interview Mastery Authentication System loaded!');
    console.log('ðŸ“§ Admin Email:', 'tharunkommaddi@gmail.com');
    console.log('ðŸ”§ Admin functions available via: AuthAdmin');
    console.log('ðŸ“ Example: AuthAdmin.approveUser("user@example.com", "John Doe", "student", "password123")');
    
})();
