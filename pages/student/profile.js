// Profile functionality
(function() {
    'use strict';

    // Default user ID for beta testing
    const DEFAULT_USER_ID = 1;

    // Data storage
    let usersData = null;
    let clubsData = null;
    let currentUser = null;

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
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // Get user by ID
    function getUserById(userId) {
        return usersData.users.find(u => u.id === userId);
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
                club: club
            };
        }).filter(club => club.club !== undefined); // Filter out clubs not found
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
                
                // Update display
                const bioContent = document.getElementById('bio-content');
                if (bioContent) {
                    bioContent.textContent = newBio || 'No bio available.';
                }
                
                // Switch back to view mode
                if (bioContentView) bioContentView.style.display = 'block';
                if (bioContentEdit) bioContentEdit.style.display = 'none';
                
                // Show success message (you can add flash banner here)
                showFlash('Bio updated successfully!', 'success');
                
                // In a real app, you would save to backend here
                // saveUserData(currentUser);
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

                // Update current user object
                currentUser.first_name = firstName;
                currentUser.last_name = lastName;
                currentUser.year = year;
                currentUser.major = major;
                currentUser.phone = phone || null;
                currentUser.college = college || null;
                currentUser.class_year = classYear || null;

                // Update display
                updateProfileDisplay();

                // Switch back to view mode
                if (profileViewMode) profileViewMode.style.display = 'block';
                if (profileEditMode) profileEditMode.style.display = 'none';

                // Show success message
                showFlash('Profile updated successfully!', 'success');
                
                // In a real app, you would save to backend here
                // saveUserData(currentUser);
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
        const clubsList = document.querySelector('.clubs-list');
        if (!clubsList) return;

        const userClubs = getUserClubs(DEFAULT_USER_ID);

        if (userClubs.length === 0) {
            clubsList.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #666;">
                    You haven't joined any clubs yet.
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
                        <div class="club-name">${club.name}</div>
                        <div class="club-role">${club.role}</div>
                    </div>
                    <a href="#" class="club-view-link">View</a>
                </div>
            `;
        }).join('');
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
        document.addEventListener('DOMContentLoaded', loadData);
    } else {
        loadData();
    }
})();

