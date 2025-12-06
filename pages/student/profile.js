// Profile functionality
(function() {
    'use strict';

    // Get current user ID from localStorage
    function getCurrentUserId() {
        const stored = localStorage.getItem('clubtableCurrentUser');
        if (stored) {
            try {
                const user = JSON.parse(stored);
                return user.id;
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    // Default user ID for beta testing (fallback)
    const DEFAULT_USER_ID = getCurrentUserId() || 1;

    // Data storage
    let usersData = null;
    let clubsData = null;
    let currentUser = null;

    // Show welcome banner for new users
    function showWelcomeBanner() {
        const isNewUser = localStorage.getItem('clubtableNewUser');
        if (isNewUser === 'true') {
            // Remove the flag
            localStorage.removeItem('clubtableNewUser');
            
            // Create and show welcome banner
            const banner = document.createElement('div');
            banner.style.cssText = `
                position: fixed;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px 30px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
                z-index: 1000;
                max-width: 600px;
                width: 90%;
                animation: slideDown 0.5s ease-out;
            `;
            
            banner.innerHTML = `
                <div style="display: flex; align-items: start; gap: 16px;">
                    <div style="font-size: 32px;">🎉</div>
                    <div style="flex: 1;">
                        <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Welcome to Yale Clubs!</h3>
                        <p style="margin: 0; font-size: 14px; opacity: 0.95;">
                            Your account has been created. Please complete your profile by adding your phone number, 
                            college, class year, and a bio to help clubs get to know you better.
                        </p>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 18px; line-height: 1;">×</button>
                </div>
            `;
            
            // Add animation keyframe
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideDown {
                    from {
                        transform: translateX(-50%) translateY(-20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(-50%) translateY(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(banner);
            
            // Auto-dismiss after 8 seconds
            setTimeout(() => {
                if (banner.parentElement) {
                    banner.style.animation = 'slideDown 0.5s ease-out reverse';
                    setTimeout(() => banner.remove(), 500);
                }
            }, 8000);
            
            // Automatically open edit mode
            setTimeout(() => {
                const editButton = document.getElementById('edit-profile-btn');
                if (editButton) {
                    editButton.click();
                }
            }, 1000);
        }
    }

    // Load JSON data
    async function loadData() {
        try {
            const [usersResponse, clubsResponse] = await Promise.all([
                fetch('../../database/json/users/club_users.json'),
                fetch('../../database/json/clubs/clubs.json')
            ]);

            usersData = await usersResponse.json();
            clubsData = await clubsResponse.json();

            initializeProfile();
            showWelcomeBanner(); // Show welcome banner if new user
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // Get user by ID - check localStorage first, then fall back to JSON data
    function getUserById(userId) {
        // First check localStorage for the current user
        const storedCurrentUser = localStorage.getItem('clubtableCurrentUser');
        if (storedCurrentUser) {
            try {
                const currentUserObj = JSON.parse(storedCurrentUser);
                if (currentUserObj.id === userId) {
                    return currentUserObj;
                }
            } catch (e) {
                console.error('Error parsing stored user:', e);
            }
        }
        
        // Fall back to JSON data
        if (usersData && usersData.users) {
            return usersData.users.find(u => u.id === userId);
        }
        return null;
    }

    // Get clubs for user
    function getUserClubs(userId) {
        const user = getUserById(userId);
        if (!user || !user.clubs) {
            return [];
        }

        const clubIds = Object.keys(user.clubs);
        return clubIds.map(clubId => {
            const club = clubsData.clubs.find(c => c.id === clubId);
            const statusCode = user.clubs[clubId];
            
            // Map status code to role
            const roleMap = {
                1: 'Member',
                2: 'Member',
                3: 'Pending',
                4: 'Active Member',
                5: 'Leadership'
            };

            return {
                id: clubId,
                name: club ? club.name : 'Unknown Club',
                role: roleMap[statusCode] || 'Member',
                statusCode: statusCode,
                club: club
            };
        }).filter(club => {
            // Only show clubs where user is actually a member (not pending)
            // Status codes 1, 2, 4, 5 are members; 3 is pending
            return club.club !== undefined && club.statusCode !== 3;
        });
    }

    // Initialize profile with user data
    function initializeProfile() {
        currentUser = getUserById(DEFAULT_USER_ID);
        
        if (!currentUser) {
            console.error('Could not load user data');
            return;
        }

        // Update page title
        document.title = `My Profile - ${currentUser.first_name} ${currentUser.last_name} | Yale Clubs`;

        // Update profile name
        const profileName = document.querySelector('.profile-name');
        if (profileName) {
            profileName.textContent = `${currentUser.first_name} ${currentUser.last_name}`;
        }

        // Update profile title (year and major)
        const profileTitle = document.querySelector('.profile-title');
        if (profileTitle) {
            const yearDisplay = currentUser.year || 'Student';
            const majorDisplay = currentUser.major || '';
            profileTitle.textContent = `${yearDisplay}${majorDisplay ? ' · ' + majorDisplay : ''}`;
        }

        // Update profile details
        const profileDetails = document.querySelector('.profile-details');
        if (profileDetails) {
            const detailItems = profileDetails.querySelectorAll('.profile-detail-item');
            
            detailItems.forEach(item => {
                const icon = item.querySelector('i');
                const span = item.querySelector('span');
                
                if (!icon || !span) return;

                // Email
                if (icon.classList.contains('fa-envelope')) {
                    span.textContent = currentUser.email || '';
                }
                // Phone
                else if (icon.classList.contains('fa-phone')) {
                    if (currentUser.phone) {
                        span.textContent = currentUser.phone;
                    } else {
                        item.style.display = 'none';
                    }
                }
                // College
                else if (icon.classList.contains('fa-building')) {
                    if (currentUser.college) {
                        span.textContent = currentUser.college;
                    } else {
                        item.style.display = 'none';
                    }
                }
                // Class year
                else if (icon.classList.contains('fa-calendar')) {
                    if (currentUser.class_year) {
                        span.textContent = `Class of ${currentUser.class_year}`;
                    } else {
                        item.style.display = 'none';
                    }
                }
            });
        }

        // Update About Me section
        const bioContent = document.getElementById('bio-content');
        if (bioContent) {
            if (currentUser.bio) {
                bioContent.textContent = currentUser.bio;
            } else {
                bioContent.textContent = 'No bio available.';
            }
        }

        // Update My Clubs section
        loadUserClubs();

        // Update Preferences section
        loadUserPreferences();

        // Setup edit functionality
        setupEditFunctionality();
    }

    // Setup edit functionality
    function setupEditFunctionality() {
        // Edit bio link
        const editBioLink = document.getElementById('edit-bio-link');
        const bioContentView = document.querySelector('.section-content-view');
        const bioContentEdit = document.querySelector('.section-content-edit');
        const bioEditTextarea = document.getElementById('bio-edit');
        const saveBioBtn = document.getElementById('save-bio-btn');
        const cancelBioBtn = document.getElementById('cancel-bio-btn');

        if (editBioLink && bioContentView && bioContentEdit) {
            editBioLink.addEventListener('click', function(e) {
                e.preventDefault();
                bioContentView.style.display = 'none';
                bioContentEdit.style.display = 'block';
                if (bioEditTextarea) {
                    bioEditTextarea.value = currentUser.bio || '';
                    bioEditTextarea.focus();
                }
            });
        }

        if (saveBioBtn && bioEditTextarea) {
            saveBioBtn.addEventListener('click', function() {
                const newBio = bioEditTextarea.value.trim();
                currentUser.bio = newBio;
                currentUser.updated_at = new Date().toISOString();
                
                // Save to localStorage - update current user
                localStorage.setItem('clubtableCurrentUser', JSON.stringify(currentUser));
                
                // Also update in the users array
                const users = localStorage.getItem('clubtableUsers');
                if (users) {
                    try {
                        const usersArray = JSON.parse(users);
                        const userIndex = usersArray.findIndex(u => u.id === currentUser.id);
                        if (userIndex !== -1) {
                            usersArray[userIndex] = currentUser;
                            localStorage.setItem('clubtableUsers', JSON.stringify(usersArray));
                        }
                    } catch (e) {
                        console.error('Error updating users array:', e);
                    }
                }
                
                // Update display
                const bioContent = document.getElementById('bio-content');
                if (bioContent) {
                    bioContent.textContent = newBio || 'No bio available.';
                }
                
                // Switch back to view mode
                if (bioContentView) bioContentView.style.display = 'block';
                if (bioContentEdit) bioContentEdit.style.display = 'none';
                
                // Show success message
                showFlash('Bio updated successfully!', 'success');
            });
        }

        if (cancelBioBtn) {
            cancelBioBtn.addEventListener('click', function() {
                if (bioEditTextarea) {
                    bioEditTextarea.value = currentUser.bio || '';
                }
                if (bioContentView) bioContentView.style.display = 'block';
                if (bioContentEdit) bioContentEdit.style.display = 'none';
            });
        }

        // Edit Profile button
        const editProfileBtn = document.getElementById('edit-profile-btn');
        const profileViewMode = document.querySelector('.profile-view-mode');
        const profileEditMode = document.querySelector('.profile-edit-mode');
        const saveProfileBtn = document.getElementById('save-profile-btn');
        const cancelProfileBtn = document.getElementById('cancel-profile-btn');

        if (editProfileBtn && profileViewMode && profileEditMode) {
            editProfileBtn.addEventListener('click', function() {
                profileViewMode.style.display = 'none';
                profileEditMode.style.display = 'block';
                
                // Populate edit fields
                document.getElementById('edit-first-name').value = currentUser.first_name || '';
                document.getElementById('edit-last-name').value = currentUser.last_name || '';
                document.getElementById('edit-year').value = currentUser.year || 'Freshman';
                document.getElementById('edit-major').value = currentUser.major || '';
                document.getElementById('edit-phone').value = currentUser.phone || '';
                document.getElementById('edit-college').value = currentUser.college || '';
                document.getElementById('edit-class-year').value = currentUser.class_year || '';
            });
        }

        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', function() {
                // Get values from edit fields
                const firstName = document.getElementById('edit-first-name').value.trim();
                const lastName = document.getElementById('edit-last-name').value.trim();
                const year = document.getElementById('edit-year').value;
                const major = document.getElementById('edit-major').value.trim();
                const phone = document.getElementById('edit-phone').value.trim();
                const college = document.getElementById('edit-college').value.trim();
                const classYear = document.getElementById('edit-class-year').value.trim();

                // Validate required fields
                if (!firstName || !lastName || !year || !major) {
                    showFlash('Please fill in all required fields', 'error');
                    return;
                }

                // Update current user object
                currentUser.first_name = firstName;
                currentUser.last_name = lastName;
                currentUser.year = year;
                currentUser.major = major;
                currentUser.phone = phone || null;
                currentUser.college = college || null;
                currentUser.class_year = classYear || null;
                currentUser.updated_at = new Date().toISOString();

                // Save to localStorage - update current user
                localStorage.setItem('clubtableCurrentUser', JSON.stringify(currentUser));
                
                // Also update in the users array
                const users = localStorage.getItem('clubtableUsers');
                if (users) {
                    try {
                        const usersArray = JSON.parse(users);
                        const userIndex = usersArray.findIndex(u => u.id === currentUser.id);
                        if (userIndex !== -1) {
                            usersArray[userIndex] = currentUser;
                            localStorage.setItem('clubtableUsers', JSON.stringify(usersArray));
                        }
                    } catch (e) {
                        console.error('Error updating users array:', e);
                    }
                }

                // Update display
                updateProfileDisplay();

                // Switch back to view mode
                if (profileViewMode) profileViewMode.style.display = 'block';
                if (profileEditMode) profileEditMode.style.display = 'none';

                // Show success message
                showFlash('Profile updated successfully!', 'success');
            });
        }

        if (cancelProfileBtn) {
            cancelProfileBtn.addEventListener('click', function() {
                // Reset edit fields to current values
                document.getElementById('edit-first-name').value = currentUser.first_name || '';
                document.getElementById('edit-last-name').value = currentUser.last_name || '';
                document.getElementById('edit-year').value = currentUser.year || 'Freshman';
                document.getElementById('edit-major').value = currentUser.major || '';
                document.getElementById('edit-phone').value = currentUser.phone || '';
                document.getElementById('edit-college').value = currentUser.college || '';
                document.getElementById('edit-class-year').value = currentUser.class_year || '';
                
                if (profileViewMode) profileViewMode.style.display = 'block';
                if (profileEditMode) profileEditMode.style.display = 'none';
            });
        }
    }

    // Update profile display after editing
    function updateProfileDisplay() {
        // Update name
        const profileName = document.getElementById('profile-name-display');
        if (profileName) {
            profileName.textContent = `${currentUser.first_name} ${currentUser.last_name}`;
        }

        // Update title
        const profileTitle = document.getElementById('profile-title-display');
        if (profileTitle) {
            const yearDisplay = currentUser.year || 'Student';
            const majorDisplay = currentUser.major || '';
            profileTitle.textContent = `${yearDisplay}${majorDisplay ? ' · ' + majorDisplay : ''}`;
        }

        // Update email (read-only, shouldn't change)
        const emailDisplay = document.getElementById('email-display');
        if (emailDisplay) {
            emailDisplay.textContent = currentUser.email || '';
        }

        // Update phone
        const phoneDisplay = document.getElementById('phone-display');
        const phoneItem = document.getElementById('phone-item');
        if (phoneDisplay && phoneItem) {
            if (currentUser.phone) {
                phoneDisplay.textContent = currentUser.phone;
                phoneItem.style.display = 'flex';
            } else {
                phoneItem.style.display = 'none';
            }
        }

        // Update college
        const collegeDisplay = document.getElementById('college-display');
        const collegeItem = document.getElementById('college-item');
        if (collegeDisplay && collegeItem) {
            if (currentUser.college) {
                collegeDisplay.textContent = currentUser.college;
                collegeItem.style.display = 'flex';
            } else {
                collegeItem.style.display = 'none';
            }
        }

        // Update class year
        const classYearDisplay = document.getElementById('class-year-display');
        const classYearItem = document.getElementById('class-year-item');
        if (classYearDisplay && classYearItem) {
            if (currentUser.class_year) {
                classYearDisplay.textContent = `Class of ${currentUser.class_year}`;
                classYearItem.style.display = 'flex';
            } else {
                classYearItem.style.display = 'none';
            }
        }
    }

    // Flash helper function
    (function() {
        let flashIdCounter = 0;
        let flashContainer = null;

        function initFlashContainer() {
            if (!flashContainer) {
                flashContainer = document.createElement('div');
                flashContainer.className = 'flash-banner-container';
                document.body.appendChild(flashContainer);
            }
            return flashContainer;
        }

        window.showFlash = function(message, type = 'success') {
            const container = initFlashContainer();
            const id = flashIdCounter++;
            const flash = document.createElement('div');
            flash.className = `flash-banner flash-${type}`;
            
            const iconMap = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                warning: 'fa-exclamation-triangle',
                info: 'fa-info-circle'
            };
            
            flash.innerHTML = `
                <i class="fas ${iconMap[type] || iconMap.success} flash-icon"></i>
                <span class="flash-text">${message}</span>
                <button class="flash-close" onclick="this.parentElement.remove()" aria-label="Dismiss">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            container.appendChild(flash);
            
            // Auto-dismiss after 3.6 seconds
            setTimeout(() => {
                if (flash.parentElement) {
                    flash.remove();
                }
            }, 3600);
        };
    })();

    // Load and display user's clubs
    function loadUserClubs() {
        const clubsList = document.getElementById('profile-clubs-list');
        if (!clubsList) return;

        const userId = getCurrentUserId() || DEFAULT_USER_ID;
        const userClubs = getUserClubs(userId);

        if (userClubs.length === 0) {
            clubsList.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #666;">
                    <p style="margin-bottom: 12px;">You haven't joined any clubs yet.</p>
                    <a href="clubs.html" style="color: #667eea; text-decoration: none; font-weight: 500;">Browse Clubs →</a>
                </div>
            `;
            return;
        }

        clubsList.innerHTML = userClubs.map(club => {
            // Get first letter of club name for icon
            const clubIcon = club.name.charAt(0).toUpperCase();
            
            return `
                <div class="club-item">
                    <div class="club-icon">${clubIcon}</div>
                    <div class="club-info">
                        <div class="club-name">${escapeHtml(club.name)}</div>
                        <div class="club-role">${escapeHtml(club.role)}</div>
                    </div>
                    <a href="#" class="club-view-link" data-club-id="${club.id}">View</a>
                </div>
            `;
        }).join('');

        // Setup click handlers for View links
        document.querySelectorAll('.club-view-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const clubId = this.getAttribute('data-club-id');
                const club = clubsData.clubs.find(c => c.id === clubId);
                if (club) {
                    showClubModal(club);
                }
            });
        });
    }

    // Show club modal with club data
    function showClubModal(club) {
        const modal = document.getElementById('club-modal');
        const modalTitle = document.getElementById('club-modal-title');
        const modalBody = document.getElementById('club-modal-body');
        
        if (!modal || !modalTitle || !modalBody) return;

        // Set title
        modalTitle.textContent = club.name;

        // Build modal content
        let content = '';

        // Cover image (if exists)
        if (club.coverImage) {
            content += `<img src="${escapeHtml(club.coverImage)}" alt="${escapeHtml(club.name)} cover" class="club-modal-cover">`;
        }

        // Badges
        content += '<div class="club-modal-badges">';
        if (club.auditionRequired) {
            content += `<span class="club-modal-badge audition"><i class="fas fa-microphone"></i> Requires Audition</span>`;
        } else if (club.applicationRequired) {
            content += `<span class="club-modal-badge application"><i class="fas fa-clipboard-list"></i> Requires Application</span>`;
        } else {
            content += `<span class="club-modal-badge open"><i class="fas fa-check-circle"></i> Open Join</span>`;
        }
        if (club.applicationDeadline && (club.applicationRequired || club.auditionRequired)) {
            content += `<span class="club-modal-section-content">Deadline: ${escapeHtml(club.applicationDeadline)}</span>`;
        }
        content += '</div>';

        // Description
        if (club.description) {
            content += `
                <div class="club-modal-section">
                    <h3 class="club-modal-section-title">About</h3>
                    <div class="club-modal-section-content club-modal-description">${escapeHtml(club.description)}</div>
                </div>
            `;
        }

        // Owner / Liaison
        content += `
            <div class="club-modal-section">
                <h3 class="club-modal-section-title">Owner / Liaison</h3>
                <div class="club-modal-info-item">
                    <i class="fas fa-user"></i>
                    <div class="club-modal-info-item-content">
                        <div class="club-modal-info-item-value">${escapeHtml(Array.isArray(club.owner) ? club.owner.join(', ') : club.owner)}</div>
                    </div>
                </div>
            </div>
        `;

        // Contact Emails
        if (club.contactEmails && club.contactEmails.length > 0) {
            content += `
                <div class="club-modal-section">
                    <h3 class="club-modal-section-title">Contact</h3>
                    <ul class="club-modal-contact-list">
            `;
            club.contactEmails.forEach(email => {
                content += `<li><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></li>`;
            });
            content += `
                    </ul>
                </div>
            `;
        }

        // Meeting Time
        if (club.meetingTime) {
            content += `
                <div class="club-modal-section">
                    <h3 class="club-modal-section-title">Meeting Time</h3>
                    <div class="club-modal-info-item">
                        <i class="fas fa-clock"></i>
                        <div class="club-modal-info-item-content">
                            <div class="club-modal-info-item-value">${escapeHtml(club.meetingTime)}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Location
        if (club.location) {
            content += `
                <div class="club-modal-section">
                    <h3 class="club-modal-section-title">Location</h3>
                    <div class="club-modal-info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <div class="club-modal-info-item-content">
                            <div class="club-modal-info-item-value">${escapeHtml(club.location)}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Application / Audition Info
        if (club.applicationInfo || club.auditionInfo) {
            const infoTitle = club.auditionInfo ? 'Audition Information' : 'Application Information';
            const infoContent = club.auditionInfo || club.applicationInfo;
            content += `
                <div class="club-modal-section">
                    <h3 class="club-modal-section-title">${infoTitle}</h3>
                    <div class="club-modal-section-content club-modal-description">${escapeHtml(infoContent)}</div>
                </div>
            `;
        }

        // Extra Metadata
        if (club.metadata && Object.keys(club.metadata).length > 0) {
            content += `
                <div class="club-modal-section">
                    <h3 class="club-modal-section-title">Additional Information</h3>
                    <div class="club-modal-metadata">
            `;
            Object.entries(club.metadata).forEach(([key, value]) => {
                content += `
                    <div class="club-modal-metadata-item">
                        <span class="club-modal-metadata-label">${escapeHtml(key)}</span>
                        <span class="club-modal-metadata-value">${escapeHtml(typeof value === 'string' ? value : JSON.stringify(value))}</span>
                    </div>
                `;
            });
            content += `
                    </div>
                </div>
            `;
        }

        modalBody.innerHTML = content;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus trap - focus on close button
        const closeBtn = document.getElementById('club-modal-close');
        if (closeBtn) {
            closeBtn.focus();
        }
    }

    // Hide club modal
    function hideClubModal() {
        const modal = document.getElementById('club-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Setup modal close handlers
    function setupModalClose() {
        const modal = document.getElementById('club-modal');
        const closeBtn = document.getElementById('club-modal-close');
        const overlay = modal?.querySelector('.club-modal-overlay');

        // Close button
        if (closeBtn) {
            closeBtn.addEventListener('click', hideClubModal);
        }

        // Click outside to close
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    hideClubModal();
                }
            });
        }

        // ESC key to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById('club-modal');
                if (modal && modal.classList.contains('active')) {
                    hideClubModal();
                }
                const passwordModal = document.getElementById('change-password-modal');
                if (passwordModal && passwordModal.classList.contains('active')) {
                    hidePasswordModal();
                }
            }
        });
    }

    // Setup change password functionality
    function setupChangePassword() {
        const changePasswordLink = document.querySelector('.account-link[href="#"]');
        const passwordModal = document.getElementById('change-password-modal');
        const passwordForm = document.getElementById('change-password-form');
        const closeBtn = document.getElementById('change-password-close');
        const cancelBtn = document.getElementById('cancel-password-btn');
        const overlay = passwordModal?.querySelector('.modal-overlay');

        // Open modal when clicking "Change Password"
        if (changePasswordLink && changePasswordLink.textContent.trim() === 'Change Password') {
            changePasswordLink.addEventListener('click', function(e) {
                e.preventDefault();
                showPasswordModal();
            });
        }

        // Close button
        if (closeBtn) {
            closeBtn.addEventListener('click', hidePasswordModal);
        }

        // Cancel button
        if (cancelBtn) {
            cancelBtn.addEventListener('click', hidePasswordModal);
        }

        // Click outside to close
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    hidePasswordModal();
                }
            });
        }

        // Handle form submission
        if (passwordForm) {
            passwordForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const newPassword = document.getElementById('new-password').value;
                const confirmPassword = document.getElementById('confirm-password').value;

                // Validate passwords match
                if (newPassword !== confirmPassword) {
                    showFlash('Passwords do not match!', 'error');
                    return;
                }

                // Validate password length
                if (newPassword.length < 8) {
                    showFlash('Password must be at least 8 characters!', 'error');
                    return;
                }

                // For now, just show success message
                // In the future, this would send to backend
                showFlash('Password changed successfully!', 'success');
                
                // Close modal and reset form
                hidePasswordModal();
                passwordForm.reset();
            });
        }
    }

    // Show password modal
    function showPasswordModal() {
        const modal = document.getElementById('change-password-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus on first input
            const firstInput = document.getElementById('new-password');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    // Hide password modal
    function hidePasswordModal() {
        const modal = document.getElementById('change-password-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Reset form
            const form = document.getElementById('change-password-form');
            if (form) {
                form.reset();
            }
        }
    }

    // Load and display user preferences
    function loadUserPreferences() {
        if (!currentUser.preferences) return;

        const preferenceItems = document.querySelectorAll('.preference-item');
        
        preferenceItems.forEach(item => {
            const preferenceName = item.querySelector('.preference-name');
            if (!preferenceName) return;

            const checkbox = item.querySelector('.toggle-switch input');
            if (!checkbox) return;

            const nameText = preferenceName.textContent.trim();

            // Email Notifications
            if (nameText === 'Email Notifications' && currentUser.preferences.email_notifications !== undefined) {
                checkbox.checked = currentUser.preferences.email_notifications;
            }
            // Profile Visibility
            else if (nameText === 'Profile Visibility' && currentUser.preferences.profile_visibility !== undefined) {
                checkbox.checked = currentUser.preferences.profile_visibility;
            }
        });
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            loadData();
            setupModalClose();
            setupChangePassword();
        });
    } else {
        loadData();
        setupModalClose();
        setupChangePassword();
    }
})();

