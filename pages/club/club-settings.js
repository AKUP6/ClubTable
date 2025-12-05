// Club Settings functionality
(function() {
    'use strict';

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

    // Default owner ID
    const DEFAULT_OWNER_ID = 1;

    // Data storage
    let clubsData = null;
    let categoriesData = null;
    let currentClub = null;
    let editingTags = null; // Temporary tags array during editing

    // Load JSON data
    async function loadData() {
        try {
            const [clubsResponse, categoriesResponse] = await Promise.all([
                fetch('../../database/json/clubs/clubs.json'),
                fetch('../../database/json/clubs/categories.json')
            ]);
            clubsData = await clubsResponse.json();
            categoriesData = await categoriesResponse.json();

            initializeSettings();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // Get club owned by owner_id
    // For beta testing, owner_id 1 owns club_id 1 (Yale Debate Association)
    function getClubForOwner(ownerId) {
        // For beta testing, owner_id 1 owns club_id 1
        // In a real app, this would be determined by the logged-in user
        if (ownerId === 1) {
            return clubsData.clubs.find(c => c.id === "1");
        }
        return null;
    }

    // Get category name by ID
    function getCategoryName(categoryId) {
        if (!categoriesData || !categoryId) return 'Not set';
        const category = categoriesData.categories.find(c => c.id === categoryId);
        return category ? category.name : 'Not set';
    }

    // Initialize settings with club data
    function initializeSettings() {
        currentClub = getClubForOwner(DEFAULT_OWNER_ID);
        
        if (!currentClub) {
            console.error('Could not load club data');
            return;
        }

        // Update page title and club name
        document.title = `Club Settings - ${currentClub.name} | Yale Clubs`;
        
        const ownerSubtitle = document.querySelector('.owner-subtitle');
        if (ownerSubtitle) {
            ownerSubtitle.textContent = `Managing: ${currentClub.name}`;
        }

        // Populate category dropdown
        populateCategoryDropdown();

        // Update view mode display
        updateViewMode();

        // Update application settings view mode
        updateAppSettingsViewMode();

        // Load and display leadership team
        loadLeadershipTeam();

        // Setup edit functionality
        setupEditFunctionality();

        // Setup application settings edit functionality
        setupAppSettingsEditFunctionality();

        // Setup leader modal functionality
        setupLeaderModal();

        // Setup View Public Page button
        setupViewPublicPageButton();
    }

    // Populate category dropdown
    function populateCategoryDropdown() {
        const categorySelect = document.getElementById('category-edit');
        if (!categorySelect || !categoriesData) return;

        // Clear existing options except the first one
        categorySelect.innerHTML = '<option value="">Select a category</option>';

        // Add category options
        categoriesData.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });

        // Set current category if exists
        if (currentClub.categoryId) {
            categorySelect.value = currentClub.categoryId;
        }
    }

    // Update view mode display
    function updateViewMode() {
        // Club name
        const clubNameView = document.getElementById('club-name-view');
        if (clubNameView) {
            clubNameView.textContent = currentClub.name || 'Not set';
        }

        // Description
        const descriptionView = document.getElementById('description-view');
        if (descriptionView) {
            descriptionView.textContent = currentClub.description || 'No description available.';
        }

        // Category
        const categoryView = document.getElementById('category-view');
        if (categoryView) {
            categoryView.textContent = getCategoryName(currentClub.categoryId);
        }

        // Tags
        const tagsView = document.getElementById('tags-view');
        if (tagsView && currentClub.tags && Array.isArray(currentClub.tags)) {
            tagsView.innerHTML = currentClub.tags.map(tag => 
                `<span class="settings-tag active">${tag}</span>`
            ).join('');
        }
    }

    // Update application settings view mode display
    function updateAppSettingsViewMode() {
        // Application Status
        const appStatusView = document.getElementById('app-status-view');
        if (appStatusView) {
            appStatusView.textContent = currentClub.applicationRequired ? 'Applications Open' : 'Applications Closed';
        }

        // Application Deadline
        const appDeadlineView = document.getElementById('app-deadline-view');
        if (appDeadlineView) {
            if (currentClub.applicationDeadline) {
                // Format date for display (convert from YYYY-MM-DD or MM/DD/YYYY to readable format)
                const deadline = currentClub.applicationDeadline;
                let formattedDate = deadline;
                // If it's in MM/DD/YYYY format, convert it
                if (deadline.includes('/')) {
                    const [month, day, year] = deadline.split('/');
                    formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                }
                appDeadlineView.textContent = formattedDate;
            } else {
                appDeadlineView.textContent = 'Not set';
            }
        }

        // Maximum Applicants
        const maxApplicantsView = document.getElementById('max-applicants-view');
        if (maxApplicantsView) {
            if (currentClub.maxApplicants) {
                maxApplicantsView.textContent = currentClub.maxApplicants.toString();
            } else {
                maxApplicantsView.textContent = 'No limit';
            }
        }
    }

    // Setup application settings edit functionality
    function setupAppSettingsEditFunctionality() {
        const editAppSettingsBtn = document.getElementById('edit-app-settings-btn');
        const viewMode = document.querySelector('.app-settings-view-mode');
        const editMode = document.querySelector('.app-settings-edit-mode');
        const saveBtn = document.getElementById('save-app-settings-btn');
        const cancelBtn = document.getElementById('cancel-app-settings-btn');

        if (editAppSettingsBtn && viewMode && editMode) {
            editAppSettingsBtn.addEventListener('click', function() {
                viewMode.style.display = 'none';
                editMode.style.display = 'block';
                
                // Populate edit fields
                const appStatusEdit = document.getElementById('app-status-edit');
                if (appStatusEdit) {
                    appStatusEdit.checked = currentClub.applicationRequired !== false; // Default to true if not set
                }

                const appDeadlineEdit = document.getElementById('app-deadline-edit');
                if (appDeadlineEdit) {
                    if (currentClub.applicationDeadline) {
                        // Convert date format if needed
                        let deadline = currentClub.applicationDeadline;
                        if (deadline.includes('/')) {
                            const [month, day, year] = deadline.split('/');
                            deadline = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                        }
                        appDeadlineEdit.value = deadline;
                    } else {
                        appDeadlineEdit.value = '';
                    }
                }

                const maxApplicantsEdit = document.getElementById('max-applicants-edit');
                if (maxApplicantsEdit) {
                    maxApplicantsEdit.value = currentClub.maxApplicants || '';
                }
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                // Get values from edit fields
                const appStatusEdit = document.getElementById('app-status-edit');
                const appDeadlineEdit = document.getElementById('app-deadline-edit');
                const maxApplicantsEdit = document.getElementById('max-applicants-edit');

                if (appStatusEdit) {
                    currentClub.applicationRequired = appStatusEdit.checked;
                }

                if (appDeadlineEdit) {
                    const deadline = appDeadlineEdit.value.trim();
                    currentClub.applicationDeadline = deadline || null;
                }

                if (maxApplicantsEdit) {
                    const maxApplicants = maxApplicantsEdit.value.trim();
                    currentClub.maxApplicants = maxApplicants ? parseInt(maxApplicants) : null;
                }

                // Update view mode display
                updateAppSettingsViewMode();

                // Switch back to view mode
                if (viewMode) viewMode.style.display = 'block';
                if (editMode) editMode.style.display = 'none';

                // Show success message
                showFlash('Application settings updated successfully!', 'success');
                
                // In a real app, you would save to backend here
                // saveClubData(currentClub);
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                // Reset edit fields to current values
                const appStatusEdit = document.getElementById('app-status-edit');
                if (appStatusEdit) {
                    appStatusEdit.checked = currentClub.applicationRequired !== false;
                }

                const appDeadlineEdit = document.getElementById('app-deadline-edit');
                if (appDeadlineEdit) {
                    if (currentClub.applicationDeadline) {
                        let deadline = currentClub.applicationDeadline;
                        if (deadline.includes('/')) {
                            const [month, day, year] = deadline.split('/');
                            deadline = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                        }
                        appDeadlineEdit.value = deadline;
                    } else {
                        appDeadlineEdit.value = '';
                    }
                }

                const maxApplicantsEdit = document.getElementById('max-applicants-edit');
                if (maxApplicantsEdit) {
                    maxApplicantsEdit.value = currentClub.maxApplicants || '';
                }

                // Switch back to view mode
                if (viewMode) viewMode.style.display = 'block';
                if (editMode) editMode.style.display = 'none';
            });
        }
    }

    // Setup edit functionality
    function setupEditFunctionality() {
        const editDetailsBtn = document.getElementById('edit-details-btn');
        const viewMode = document.querySelector('.club-info-view-mode');
        const editMode = document.querySelector('.club-info-edit-mode');
        const saveBtn = document.getElementById('save-club-info-btn');
        const cancelBtn = document.getElementById('cancel-club-info-btn');

        if (editDetailsBtn && viewMode && editMode) {
            editDetailsBtn.addEventListener('click', function() {
                viewMode.style.display = 'none';
                editMode.style.display = 'block';
                
                // Populate edit fields
                const clubNameEdit = document.getElementById('club-name-edit');
                if (clubNameEdit) {
                    clubNameEdit.value = currentClub.name || '';
                }

                const descriptionEdit = document.getElementById('description-edit');
                if (descriptionEdit) {
                    descriptionEdit.value = currentClub.description || '';
                }

                const categoryEdit = document.getElementById('category-edit');
                if (categoryEdit && currentClub.categoryId) {
                    categoryEdit.value = currentClub.categoryId;
                }

                // Create a copy of tags for editing
                editingTags = currentClub.tags ? [...currentClub.tags] : [];

                // Populate tags in edit mode
                renderTagsEdit();

                // Setup tag management
                setupTagManagement();
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                // Get values from edit fields
                const clubNameEdit = document.getElementById('club-name-edit');
                const descriptionEdit = document.getElementById('description-edit');
                const categoryEdit = document.getElementById('category-edit');

                if (clubNameEdit) {
                    currentClub.name = clubNameEdit.value.trim();
                }

                if (descriptionEdit) {
                    currentClub.description = descriptionEdit.value.trim();
                }

                if (categoryEdit) {
                    currentClub.categoryId = categoryEdit.value ? parseInt(categoryEdit.value) : null;
                }

                // Save tags from editing array
                currentClub.tags = editingTags ? [...editingTags] : [];
                editingTags = null;

                // Update view mode display
                updateViewMode();

                // Switch back to view mode
                if (viewMode) viewMode.style.display = 'block';
                if (editMode) editMode.style.display = 'none';

                // Show success message
                showFlash('Club information updated successfully!', 'success');
                
                // In a real app, you would save to backend here
                // saveClubData(currentClub);
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                // Reset edit fields to current values
                const clubNameEdit = document.getElementById('club-name-edit');
                if (clubNameEdit) {
                    clubNameEdit.value = currentClub.name || '';
                }

                const descriptionEdit = document.getElementById('description-edit');
                if (descriptionEdit) {
                    descriptionEdit.value = currentClub.description || '';
                }

                const categoryEdit = document.getElementById('category-edit');
                if (categoryEdit && currentClub.categoryId) {
                    categoryEdit.value = currentClub.categoryId;
                }

                // Reset editing tags to original
                editingTags = currentClub.tags ? [...currentClub.tags] : [];
                
                // Reset tags in edit mode
                renderTagsEdit();

                // Clear new tag input
                const newTagInput = document.getElementById('new-tag-input');
                if (newTagInput) {
                    newTagInput.value = '';
                }

                // Switch back to view mode
                if (viewMode) viewMode.style.display = 'block';
                if (editMode) editMode.style.display = 'none';
            });
        }
    }

    // Render tags in edit mode
    function renderTagsEdit() {
        const tagsEdit = document.getElementById('tags-edit');
        if (!tagsEdit) return;

        const tagsToRender = editingTags !== null ? editingTags : (currentClub.tags || []);

        if (!tagsToRender || tagsToRender.length === 0) {
            tagsEdit.innerHTML = '<span style="color: #999; font-style: italic;">No tags yet. Add your first tag below.</span>';
            return;
        }

        tagsEdit.innerHTML = tagsToRender.map(tag => 
            `<span class="settings-tag active editable-tag" data-tag="${tag}">
                ${tag}
                <button type="button" class="tag-remove-btn" data-tag="${tag}" aria-label="Remove tag">
                    <i class="fas fa-times"></i>
                </button>
            </span>`
        ).join('');
    }

    // Setup tag management (add/remove)
    function setupTagManagement() {
        const addTagBtn = document.getElementById('add-tag-btn');
        const newTagInput = document.getElementById('new-tag-input');
        const tagsEdit = document.getElementById('tags-edit');

        // Add tag button click
        if (addTagBtn && newTagInput) {
            addTagBtn.addEventListener('click', function() {
                addTag();
            });

            // Add tag on Enter key
            newTagInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                }
            });
        }

        // Remove tag buttons (using event delegation since tags are dynamically added)
        if (tagsEdit) {
            tagsEdit.addEventListener('click', function(e) {
                const removeBtn = e.target.closest('.tag-remove-btn');
                if (removeBtn) {
                    e.preventDefault();
                    const tagToRemove = removeBtn.getAttribute('data-tag');
                    removeTag(tagToRemove);
                }
            });
        }
    }

    // Add a new tag
    function addTag() {
        const newTagInput = document.getElementById('new-tag-input');
        if (!newTagInput) return;

        const newTag = newTagInput.value.trim();
        
        if (!newTag) {
            showFlash('Please enter a tag name', 'warning');
            return;
        }

        // Initialize editing tags array if it doesn't exist
        if (editingTags === null) {
            editingTags = currentClub.tags ? [...currentClub.tags] : [];
        }
        if (!Array.isArray(editingTags)) {
            editingTags = [];
        }

        // Check if tag already exists (case-insensitive)
        const tagExists = editingTags.some(tag => 
            tag.toLowerCase() === newTag.toLowerCase()
        );

        if (tagExists) {
            showFlash('This tag already exists', 'warning');
            newTagInput.value = '';
            return;
        }

        // Add tag
        editingTags.push(newTag);
        newTagInput.value = '';

        // Re-render tags
        renderTagsEdit();

        // Show success message
        showFlash(`Tag "${newTag}" added`, 'success');
    }

    // Remove a tag
    function removeTag(tagToRemove) {
        if (editingTags === null) {
            editingTags = currentClub.tags ? [...currentClub.tags] : [];
        }
        if (!Array.isArray(editingTags)) return;

        // Remove tag from array
        editingTags = editingTags.filter(tag => tag !== tagToRemove);

        // Re-render tags
        renderTagsEdit();

        // Show success message
        showFlash(`Tag "${tagToRemove}" removed`, 'success');
    }

    // Load and display leadership team from JSON
    function loadLeadershipTeam() {
        const leadershipList = document.querySelector('.leadership-list');
        if (!leadershipList) return;

        if (!currentClub.leadershipTeam || currentClub.leadershipTeam.length === 0) {
            leadershipList.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #666;">
                    No leadership team members found.
                </div>
            `;
            return;
        }

        // Render leadership team members
        leadershipList.innerHTML = currentClub.leadershipTeam.map((member, index) => {
            return `
                <div class="leadership-item" data-member-index="${index}">
                    <div class="leadership-content">
                        <div class="leadership-name">${member.name}</div>
                        <div class="leadership-details">
                            <span class="leadership-title">${member.title}</span>
                            <span class="leadership-email">${member.email}</span>
                        </div>
                    </div>
                    <div class="leadership-actions">
                        <a href="#" class="leadership-edit" data-member-index="${index}">Edit</a>
                        <a href="#" class="leadership-remove" data-member-index="${index}">Remove</a>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners for edit and remove buttons
        document.querySelectorAll('.leadership-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(btn.dataset.memberIndex);
                editLeadershipMember(index);
            });
        });

        document.querySelectorAll('.leadership-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(btn.dataset.memberIndex);
                removeLeadershipMember(index);
            });
        });
    }

    // Edit leadership member (placeholder for future functionality)
    function editLeadershipMember(index) {
        const member = currentClub.leadershipTeam[index];
        if (!member) return;
        
        // In a real application, this would open an edit modal
        showFlash(`Edit functionality for ${member.name} would open here.`, 'info');
    }

    // Remove leadership member (placeholder for future functionality)
    function removeLeadershipMember(index) {
        const member = currentClub.leadershipTeam[index];
        if (!member) return;
        
        // Auto-remove without confirm, show success flash
        currentClub.leadershipTeam.splice(index, 1);
        loadLeadershipTeam();
        showFlash(`${member.name} removed from leadership team`, 'success');
        console.log('Member removed (changes are in memory only)');
    }

    // Setup leader modal functionality
    function setupLeaderModal() {
        const addLeaderBtn = document.getElementById('add-leader-btn');
        const leaderModal = document.getElementById('leaderModal');
        const leaderForm = document.getElementById('leaderForm');
        const closeBtn = document.querySelector('.leader-modal-close');
        const cancelBtn = document.getElementById('leaderModalCancel');

        // Open modal
        if (addLeaderBtn && leaderModal) {
            addLeaderBtn.addEventListener('click', function() {
                leaderModal.style.display = 'flex';
                // Clear form
                if (leaderForm) {
                    leaderForm.reset();
                }
            });
        }

        // Close modal
        function closeLeaderModal() {
            if (leaderModal) {
                leaderModal.style.display = 'none';
            }
            if (leaderForm) {
                leaderForm.reset();
            }
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', closeLeaderModal);
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeLeaderModal);
        }

        // Close modal when clicking outside
        if (leaderModal) {
            leaderModal.addEventListener('click', function(e) {
                if (e.target === leaderModal) {
                    closeLeaderModal();
                }
            });
        }

        // Handle form submission
        if (leaderForm) {
            leaderForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const name = document.getElementById('leaderName').value.trim();
                const email = document.getElementById('leaderEmail').value.trim();
                const title = document.getElementById('leaderTitle').value.trim();

                // Validation
                if (!name || !email || !title) {
                    showFlash('Please fill in all fields', 'warning');
                    return;
                }

                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    showFlash('Please enter a valid email address', 'warning');
                    return;
                }

                // Initialize leadership team array if it doesn't exist
                if (!currentClub.leadershipTeam || !Array.isArray(currentClub.leadershipTeam)) {
                    currentClub.leadershipTeam = [];
                }

                // Check if email already exists
                const emailExists = currentClub.leadershipTeam.some(member => 
                    member.email.toLowerCase() === email.toLowerCase()
                );

                if (emailExists) {
                    showFlash('A leader with this email already exists', 'warning');
                    return;
                }

                // Add new leader
                const newLeader = {
                    name: name,
                    email: email,
                    title: title
                };

                currentClub.leadershipTeam.push(newLeader);

                // Reload leadership team display
                loadLeadershipTeam();

                // Close modal
                closeLeaderModal();

                // Show success message
                showFlash(`${name} added to leadership team`, 'success');

                // In a real app, you would save to backend here
                // saveClubData(currentClub);
            });
        }
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        if (text == null) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Show club modal with club data (same as clubs.js)
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

    // Setup club modal event listeners
    function setupClubModal() {
        const modal = document.getElementById('club-modal');
        const closeBtn = document.getElementById('club-modal-close');
        const overlay = modal?.querySelector('.club-modal-overlay');

        if (closeBtn) {
            closeBtn.addEventListener('click', hideClubModal);
        }

        if (overlay) {
            overlay.addEventListener('click', hideClubModal);
        }

        // Close on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById('club-modal');
                if (modal && modal.classList.contains('active')) {
                    hideClubModal();
                }
            }
        });
    }

    // Setup View Public Page button
    function setupViewPublicPageButton() {
        const viewPublicBtn = document.querySelector('.btn-view-public');
        if (viewPublicBtn && currentClub) {
            viewPublicBtn.addEventListener('click', function() {
                showClubModal(currentClub);
            });
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            loadData();
            setupClubModal();
        });
    } else {
        loadData();
        setupClubModal();
    }
})();

