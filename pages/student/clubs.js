// Clubs table functionality
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

    // Data storage
    let clubsData = [];
    let filteredClubs = [];
    let currentFilter = 'all';
    let currentSort = { field: null, direction: 'asc' };

    // Load JSON data
    async function loadData() {
        try {
            const response = await fetch('../../database/json/clubs/clubs.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            clubsData = data.clubs || [];
            filteredClubs = [...clubsData];
            
            init();
        } catch (error) {
            console.error('Error loading clubs data:', error);
            // Fallback to empty array
            clubsData = [];
            filteredClubs = [];
            init();
        }
    }

    // Initialize
    function init() {
        renderTable();
        setupSearch();
        setupFilters();
        setupSorting();
        setupClubNameLinks();
        setupModalClose();
        // setupAddButtons is called after table render, not here to avoid duplicates
    }

    // Render table
    function renderTable() {
        const tbody = document.getElementById('clubs-table-body');
        if (!tbody) {
            console.error('Table body not found');
            return;
        }

        if (!filteredClubs || filteredClubs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="clubs-empty-state">
                        <div class="empty-state-content">
                            <i class="fas fa-search empty-state-icon"></i>
                            <p class="empty-state-text">No clubs found</p>
                            <p class="empty-state-subtext">Try adjusting your search or filter criteria</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredClubs.map(club => `
            <tr class="clubs-table-row">
                <td class="col-name">
                    <a href="#" class="club-name-link" data-club-id="${club.id}">${escapeHtml(club.name)}</a>
                </td>
                <td class="col-liaison">${escapeHtml(Array.isArray(club.owner) ? club.owner.join(', ') : (club.owner || '—'))}</td>
                <td class="col-timeslot">${escapeHtml(club.meetingTime || '—')}</td>
                <td class="col-location">${escapeHtml(club.location || '—')}</td>
                <td class="col-join-type">
                    ${renderJoinTypeBadge(club)}
                </td>
                <td class="col-deadline">
                    ${(club.applicationRequired || club.auditionRequired) && club.applicationDeadline 
                        ? `<span class="deadline-text">${escapeHtml(club.applicationDeadline)}</span>`
                        : '<span class="deadline-empty">—</span>'
                    }
                </td>
                <td class="col-action">
                    ${renderActionButton(club)}
                </td>
            </tr>
        `).join('');

        // Setup buttons and links after table render (only once)
        setupAddButtons();
        setupClubNameLinks();
    }

    // Render join type badge
    function renderJoinTypeBadge(club) {
        if (club.auditionRequired) {
            return `
                <div class="join-type-badge-container">
                    <span class="join-type-badge badge-audition" title="Audition deadline: ${club.applicationDeadline || 'TBA'}">
                        <i class="fas fa-microphone badge-icon"></i>
                        Requires Audition
                    </span>
                </div>
            `;
        } else if (club.applicationRequired) {
            return `
                <div class="join-type-badge-container">
                    <span class="join-type-badge badge-application" title="Application deadline: ${club.applicationDeadline || 'TBA'}">
                        <i class="fas fa-clipboard-list badge-icon"></i>
                        Requires Application
                    </span>
                </div>
            `;
        } else {
            return `
                <div class="join-type-badge-container">
                    <span class="join-type-badge badge-open">
                        <i class="fas fa-check-circle badge-icon"></i>
                        Open Join
                    </span>
                </div>
            `;
        }
    }

    // Render action button (Add, Apply, or Audition)
    function renderActionButton(club) {
        if (club.auditionRequired) {
            return `
                <button class="club-action-btn" data-club-id="${club.id}" title="Audition for ${escapeHtml(club.name)}">
                    Audition
                </button>
            `;
        } else if (club.applicationRequired) {
            return `
                <button class="club-action-btn" data-club-id="${club.id}" title="Apply to ${escapeHtml(club.name)}">
                    Apply
                </button>
            `;
        } else {
            return `
                <button class="club-action-btn" data-club-id="${club.id}" title="Add ${escapeHtml(club.name)} to my clubs">
                    Add
                </button>
            `;
        }
    }

    // Setup search
    function setupSearch() {
        const searchInput = document.getElementById('club-search');
        if (!searchInput) return;

        searchInput.addEventListener('input', function() {
            applyFilters();
        });
    }

    // Setup filters
    function setupFilters() {
        const filterButtons = document.querySelectorAll('.club-filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.getAttribute('data-filter');
                applyFilters();
            });
        });
    }

    // Apply filters and search
    function applyFilters() {
        const searchQuery = document.getElementById('club-search')?.value.toLowerCase() || '';
        
        filteredClubs = clubsData.filter(club => {
            // Apply filter
            if (currentFilter === 'open' && (club.applicationRequired || club.auditionRequired)) {
                return false;
            }
            if (currentFilter === 'application' && (!club.applicationRequired || club.auditionRequired)) {
                return false;
            }

            // Apply search
            if (searchQuery && !club.name.toLowerCase().includes(searchQuery)) {
                return false;
            }

            return true;
        });

        // Apply sorting
        if (currentSort.field) {
            sortClubs(currentSort.field, currentSort.direction);
        }

        renderTable();
    }

    // Setup sorting
    function setupSorting() {
        const sortButtons = document.querySelectorAll('.sortable-header');
        sortButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const field = this.getAttribute('data-sort');
                const isNameSort = field === 'name';
                const isJoinTypeSort = field === 'joinType';

                // Toggle direction
                if (currentSort.field === field) {
                    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    currentSort.field = field;
                    currentSort.direction = 'asc';
                }

                // Update sort icons
                sortButtons.forEach(b => {
                    const icon = b.querySelector('.sort-icon');
                    if (b === this) {
                        icon.className = `fas fa-sort-${currentSort.direction === 'asc' ? 'up' : 'down'} sort-icon active`;
                    } else {
                        icon.className = 'fas fa-sort sort-icon';
                    }
                });

                sortClubs(field, currentSort.direction);
                renderTable();
            });
        });
    }

    // Sort clubs
    function sortClubs(field, direction) {
        filteredClubs.sort((a, b) => {
            let comparison = 0;

            if (field === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else             if (field === 'joinType') {
                // Sort: Audition Required first, then Application Required, then Open Join
                const aType = a.auditionRequired ? 0 : (a.applicationRequired ? 1 : 2);
                const bType = b.auditionRequired ? 0 : (b.applicationRequired ? 1 : 2);
                comparison = aType - bType;
            }

            return direction === 'asc' ? comparison : -comparison;
        });
    }

    // Setup action buttons (Add/Apply)
    function setupAddButtons() {
        document.querySelectorAll('.club-action-btn').forEach(btn => {
            // Remove existing listeners to prevent duplicates
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const clubId = this.getAttribute('data-club-id');
                const club = clubsData.find(c => c.id === clubId);
                if (!club) return;

                const buttonText = this.textContent.trim();
                let actionPast = 'added';
                let successMessage = `You have added ${club.name} to your clubs!`;
                let statusCode = 1; // 1 = Member (for open join)
                
                if (buttonText === 'Apply') {
                    actionPast = 'applied to';
                    successMessage = `Your application to ${club.name} has been submitted!`;
                    statusCode = 3; // 3 = Pending application
                } else if (buttonText === 'Audition') {
                    actionPast = 'signed up to audition for';
                    successMessage = `Your audition request for ${club.name} has been submitted!`;
                    statusCode = 3; // 3 = Pending audition
                } else {
                    // Open join - immediately added
                    statusCode = 1; // 1 = Member
                }
                
                // Get current user from localStorage
                const storedUser = localStorage.getItem('clubtableCurrentUser');
                if (storedUser) {
                    try {
                        const currentUser = JSON.parse(storedUser);
                        
                        // Initialize clubs object if it doesn't exist
                        if (!currentUser.clubs) {
                            currentUser.clubs = {};
                        }
                        
                        // Check if already applied/joined
                        if (currentUser.clubs[clubId]) {
                            showFlash('You have already joined or applied to this club!', 'info');
                            return;
                        }
                        
                        // Add club with status code
                        currentUser.clubs[clubId] = statusCode;
                        currentUser.updated_at = new Date().toISOString();
                        
                        // Save back to localStorage
                        localStorage.setItem('clubtableCurrentUser', JSON.stringify(currentUser));
                        
                        // Also update in users array
                        const usersArray = localStorage.getItem('clubtableUsers');
                        if (usersArray) {
                            try {
                                const users = JSON.parse(usersArray);
                                const userIndex = users.findIndex(u => u.id === currentUser.id);
                                if (userIndex !== -1) {
                                    users[userIndex] = currentUser;
                                    localStorage.setItem('clubtableUsers', JSON.stringify(users));
                                }
                            } catch (e) {
                                console.error('Error updating users array:', e);
                            }
                        }
                        
                        // Show success message
                        showFlash(successMessage, 'success');
                        
                        // Update button state
                        this.textContent = statusCode === 3 ? 'Pending' : 'Joined';
                        this.disabled = true;
                        this.style.opacity = '0.6';
                        this.style.cursor = 'not-allowed';
                        
                    } catch (e) {
                        console.error('Error adding club:', e);
                        showFlash('Error adding club. Please try again.', 'error');
                    }
                } else {
                    showFlash('Please log in to join clubs', 'error');
                }
            });
        });
    }

    // Setup club name links to open modal
    function setupClubNameLinks() {
        document.querySelectorAll('.club-name-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const clubId = this.getAttribute('data-club-id');
                const club = clubsData.find(c => c.id === clubId);
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

        // Location
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
            }
        });
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadData);
    } else {
        loadData();
    }
})();

