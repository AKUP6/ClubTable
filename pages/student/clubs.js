// Clubs table functionality
(function() {
    'use strict';

    // Sample club data
    const clubsData = [
        {
            id: '1',
            name: 'YUAA',
            owner: 'Jane Doe',
            meetingTime: 'MW 8:45am–10:00am',
            location: 'TBA',
            applicationRequired: true,
            applicationDeadline: '11/21/2025',
            description: 'The Yale Undergraduate Aerospace Association (YUAA) is a student organization dedicated to advancing aerospace engineering and space exploration. We work on projects ranging from high-altitude balloon launches to rocket design and satellite development.\n\nMembers have the opportunity to work on real engineering projects, attend guest lectures from industry professionals, and participate in national competitions. No prior experience required - we welcome students from all majors!',
            contactEmails: ['yuaa@yale.edu', 'jane.doe@yale.edu'],
            applicationInfo: 'Applications are reviewed by the executive board. Please submit a brief statement of interest (300-500 words) describing your interest in aerospace and any relevant experience. Interviews will be conducted the week after the deadline.',
            metadata: {
                'Founded': '2010',
                'Members': '60',
                'Meeting Frequency': 'Weekly'
            }
        },
        {
            id: '2',
            name: 'Yale Debate Association',
            owner: 'Michael Chen',
            meetingTime: 'TTh 2:00pm–4:00pm',
            location: 'WLH 201',
            applicationRequired: true,
            applicationDeadline: '11/25/2025',
            description: 'The Yale Debate Association is one of the oldest and most prestigious debate societies at Yale. We engage in competitive debate tournaments, host public debates on campus, and provide training for students interested in developing their argumentation and public speaking skills.\n\nOur members participate in both parliamentary and policy debate formats, competing at regional and national tournaments. We welcome students of all experience levels and provide comprehensive training workshops throughout the semester.',
            contactEmails: ['debate@yale.edu'],
            applicationInfo: 'Applications are reviewed by the executive board. Please submit a brief statement of interest (500 words) and your debate experience (if any). Interviews will be conducted the week after the deadline.',
            coverImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
            metadata: {
                'Founded': '1892',
                'Members': '45'
            }
        },
        {
            id: '3',
            name: 'Yale Daily News',
            owner: 'Sarah Johnson',
            meetingTime: 'F 3:00pm–5:00pm',
            location: '202 York St',
            applicationRequired: true,
            applicationDeadline: '12/01/2025'
        },
        {
            id: '4',
            name: 'Code4Good',
            owner: 'Alex Wong',
            meetingTime: 'MW 4:00pm–6:00pm',
            location: 'AKW 200',
            applicationRequired: false
        },
        {
            id: '5',
            name: 'Yale Political Union',
            owner: 'Emma Wilson',
            meetingTime: 'TTh 7:00pm–9:00pm',
            location: 'Linsly-Chittenden 101',
            applicationRequired: true,
            applicationDeadline: '12/05/2025'
        },
        {
            id: '6',
            name: 'Yale Symphony Orchestra',
            owner: 'David Kim',
            meetingTime: 'MWF 5:00pm–7:00pm',
            location: 'Morse Recital Hall',
            applicationRequired: false
        },
        {
            id: '7',
            name: 'Yale Dramatic Association',
            owner: 'Jessica Martinez',
            meetingTime: 'TTh 6:00pm–8:00pm',
            location: 'University Theatre',
            applicationRequired: true,
            applicationDeadline: '12/10/2025'
        },
        {
            id: '8',
            name: 'Yale Model UN',
            owner: 'Ryan Thompson',
            meetingTime: 'W 7:00pm–9:00pm',
            location: 'Luce Hall 202',
            applicationRequired: true,
            applicationDeadline: '11/22/2025'
        },
        {
            id: '9',
            name: 'Yale Outdoors',
            owner: 'Olivia Brown',
            meetingTime: 'F 2:00pm–4:00pm',
            location: 'Outdoor Center',
            applicationRequired: false
        },
        {
            id: '10',
            name: 'Yale Entrepreneurial Society',
            owner: 'James Park',
            meetingTime: 'T 6:00pm–8:00pm',
            location: 'Evans Hall 440',
            applicationRequired: true,
            applicationDeadline: '12/08/2025'
        },
        {
            id: '11',
            name: 'Yale Glee Club',
            owner: 'Robert Smith',
            meetingTime: 'MWF 4:00pm–6:00pm',
            location: 'Hendrie Hall',
            auditionRequired: true,
            applicationDeadline: '11/30/2025',
            description: 'The Yale Glee Club is one of Yale\'s premier a cappella groups, performing a diverse repertoire from classical to contemporary music. We perform at campus events, tour nationally and internationally, and record albums.\n\nWe sing in four-part harmony and welcome all voice parts. The group is known for its tight harmonies, dynamic performances, and strong sense of community.',
            contactEmails: ['gleeclub@yale.edu'],
            auditionInfo: 'Auditions consist of:\n1. Singing a prepared piece (1-2 minutes) - any song of your choice\n2. Brief vocal range check\n3. Simple sight-reading exercise (no prior experience required)\n\nAll voice parts welcome! Auditions are low-pressure and friendly.',
            coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
            metadata: {
                'Founded': '1861',
                'Members': '40',
                'Tours': 'Annual'
            }
        }
    ];

    let filteredClubs = [...clubsData];
    let currentFilter = 'all';
    let currentSort = { field: null, direction: 'asc' };

    // Initialize
    function init() {
        renderTable();
        setupSearch();
        setupFilters();
        setupSorting();
        setupAddButtons();
        setupClubNameLinks();
        setupModalClose();
    }

    // Render table
    function renderTable() {
        const tbody = document.getElementById('clubs-table-body');
        if (!tbody) return;

        if (filteredClubs.length === 0) {
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
                <td class="col-liaison">${escapeHtml(club.owner)}</td>
                <td class="col-timeslot">${escapeHtml(club.meetingTime)}</td>
                <td class="col-location">${escapeHtml(club.location)}</td>
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
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const clubId = this.getAttribute('data-club-id');
                const club = clubsData.find(c => c.id === clubId);
                if (!club) return;

                const buttonText = this.textContent.trim();
                let action = 'add';
                let actionPast = 'added';
                let confirmText = `Add ${club.name} to your clubs?`;
                
                if (buttonText === 'Apply') {
                    action = 'apply to';
                    actionPast = 'applied to';
                    confirmText = `Apply to ${club.name}?`;
                } else if (buttonText === 'Audition') {
                    action = 'audition for';
                    actionPast = 'signed up to audition for';
                    confirmText = `Sign up to audition for ${club.name}?`;
                }
                
                if (confirm(confirmText)) {
                    // Here you would typically make an API call
                    alert(`You have ${actionPast} ${club.name}!`);
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
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

