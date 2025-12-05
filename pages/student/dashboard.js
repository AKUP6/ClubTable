// Dashboard functionality
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

            initializeDashboard();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // Get user by ID
    function getUserById(userId) {
        return usersData.users.find(u => u.id === userId);
    }

    // Get club user relationships for a user
    function getUserClubRelationships(userId) {
        if (!usersData.club_users) {
            return [];
        }
        return usersData.club_users.filter(cu => cu.user_id === userId);
    }

    // Get clubs for user with full relationship data
    function getUserClubsWithDetails(userId) {
        const relationships = getUserClubRelationships(userId);
        
        return relationships.map(rel => {
            const club = clubsData.clubs.find(c => c.id === String(rel.club_id));
            if (!club) return null;

            // Map status to role/display text
            const statusMap = {
                'accepted': { role: 'Member', display: 'Member' },
                'pending': { role: 'Pending', display: 'Pending' },
                'rejected': { role: 'Rejected', display: 'Rejected' }
            };

            const statusInfo = statusMap[rel.status] || { role: 'Member', display: 'Member' };
            
            // Format join date
            const joinDate = rel.application_date ? new Date(rel.application_date) : null;
            const joinDateFormatted = joinDate ? formatDate(joinDate) : '';

            return {
                id: club.id,
                name: club.name,
                status: rel.status,
                statusCode: rel.status_code,
                role: statusInfo.role,
                display: statusInfo.display,
                applicationDate: rel.application_date,
                reviewDate: rel.review_date,
                joinDate: joinDateFormatted,
                club: club,
                relationship: rel
            };
        }).filter(item => item !== null);
    }

    // Format date for display
    function formatDate(date) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    // Calculate statistics
    function calculateStatistics(userClubs) {
        const activeClubs = userClubs.filter(c => c.status === 'accepted').length;
        const pendingApplications = userClubs.filter(c => c.status === 'pending').length;
        
        // Count upcoming events (placeholder - would need events data)
        const upcomingEvents = 0; // TODO: Implement when events data is available

        return {
            activeClubs,
            pendingApplications,
            upcomingEvents
        };
    }

    // Initialize dashboard with user data
    function initializeDashboard() {
        currentUser = getUserById(DEFAULT_USER_ID);
        
        if (!currentUser) {
            console.error('Could not load user data');
            return;
        }

        // Update welcome message
        const welcomeTitle = document.querySelector('.dashboard-title');
        if (welcomeTitle) {
            welcomeTitle.textContent = `Welcome back, ${currentUser.first_name}!`;
        }

        // Get user's clubs with details
        const userClubs = getUserClubsWithDetails(DEFAULT_USER_ID);
        const stats = calculateStatistics(userClubs);

        // Update summary cards
        updateSummaryCards(stats);

        // Update clubs list
        updateClubsList(userClubs);

        // Update pending applications section (if exists)
        updatePendingApplications(userClubs);

        // Setup modal close handlers
        setupModalClose();
    }

    // Update summary cards
    function updateSummaryCards(stats) {
        const summaryCards = document.querySelectorAll('.summary-card-dashboard');
        
        summaryCards.forEach(card => {
            const label = card.querySelector('.summary-label-dashboard');
            const value = card.querySelector('.summary-value-dashboard');
            
            if (!label || !value) return;
            
            const labelText = label.textContent.trim();
            
            if (labelText === 'Active Clubs') {
                value.textContent = stats.activeClubs;
            } else if (labelText === 'Upcoming Events') {
                value.textContent = stats.upcomingEvents;
            } else if (labelText === 'Pending Applications') {
                value.textContent = stats.pendingApplications;
            }
        });
    }

    // Update clubs list
    function updateClubsList(userClubs) {
        const clubsListContainer = document.querySelector('.clubs-list-dashboard');
        if (!clubsListContainer) return;

        // Filter to show only accepted clubs (active clubs)
        const activeClubs = userClubs.filter(c => c.status === 'accepted');

        if (activeClubs.length === 0) {
            clubsListContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #718096;">
                    <i class="fas fa-users" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                    <p style="font-size: 16px; margin: 0;">You haven't joined any clubs yet.</p>
                    <a href="clubs.html" style="display: inline-block; margin-top: 16px; color: #3182ce; text-decoration: none;">Browse Clubs</a>
                </div>
            `;
            return;
        }

        clubsListContainer.innerHTML = activeClubs.map(club => {
            // Get icon based on club name or use default
            const iconClass = getClubIcon(club.club);
            
            // Check if user is a leader (check if user's name matches any owner)
            const isLeader = club.club.owner && Array.isArray(club.club.owner) 
                ? club.club.owner.some(owner => {
                    const ownerLower = owner.toLowerCase();
                    const userFullName = `${currentUser.first_name} ${currentUser.last_name}`.toLowerCase();
                    const userFirstName = currentUser.first_name.toLowerCase();
                    const userLastName = currentUser.last_name.toLowerCase();
                    return ownerLower === userFullName || 
                           ownerLower.includes(userFirstName) && ownerLower.includes(userLastName);
                })
                : false;

            // Get next event (placeholder - would need events data)
            const nextEvent = null; // TODO: Implement when events data is available

            return `
                <div class="club-card-dashboard">
                    <div class="club-image-placeholder">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="club-details-dashboard">
                        <div class="club-header-dashboard">
                            <h3 class="club-name-dashboard">${escapeHtml(club.name)}</h3>
                            ${isLeader ? '<span class="leader-badge">Leader</span>' : ''}
                        </div>
                        <p class="club-meta">${club.display}${club.joinDate ? ' · Joined ' + club.joinDate : ''}</p>
                        ${nextEvent ? `
                            <div class="club-next-event">
                                <i class="fas fa-calendar"></i>
                                <span>Next Event: ${nextEvent}</span>
                            </div>
                        ` : ''}
                        ${isLeader ? `
                            <div class="club-actions-dashboard">
                                <button class="btn-view-details" data-club-id="${escapeHtml(club.id)}">View Details</button>
                                <button class="btn-manage-club">Manage Club</button>
                            </div>
                        ` : `
                            <button class="btn-view-details" data-club-id="${escapeHtml(club.id)}">View Details</button>
                        `}
                    </div>
                </div>
            `;
        }).join('');

        // Setup event listeners for View Details buttons
        document.querySelectorAll('.btn-view-details').forEach(btn => {
            btn.addEventListener('click', function() {
                const clubId = this.getAttribute('data-club-id');
                const club = clubsData.clubs.find(c => c.id === clubId);
                if (club) {
                    showClubModal(club);
                }
            });
        });
    }

    // Get icon class for club
    function getClubIcon(club) {
        // Try to match based on club name or tags
        const name = club.name.toLowerCase();
        const tags = club.tags || [];

        if (name.includes('debate')) return 'fas fa-gavel';
        if (name.includes('news') || name.includes('newspaper')) return 'fas fa-newspaper';
        if (name.includes('code') || name.includes('tech') || tags.includes('Technology')) return 'fas fa-code';
        if (name.includes('music') || tags.includes('Music')) return 'fas fa-music';
        if (name.includes('sport') || tags.includes('Sports')) return 'fas fa-football-ball';
        if (tags.includes('Academic')) return 'fas fa-book';
        if (tags.includes('Arts')) return 'fas fa-palette';
        
        // Default icon
        return 'fas fa-users';
    }

    // Update pending applications section
    function updatePendingApplications(userClubs) {
        // Filter clubs where user has status_code 3 (pending)
        const pendingClubs = userClubs.filter(c => c.statusCode === 3);
        
        const deadlineList = document.querySelector('.deadline-list');
        if (!deadlineList) return;

        if (pendingClubs.length === 0) {
            deadlineList.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #718096; font-size: 14px;">
                    No pending applications
                </div>
            `;
            return;
        }

        deadlineList.innerHTML = pendingClubs.map(club => {
            const deadline = club.club.applicationDeadline;
            if (!deadline) return null;

            // Parse deadline date (handle different formats)
            const deadlineDate = parseDeadlineDate(deadline);
            if (!deadlineDate) return null;

            // Calculate days left
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const deadlineDay = new Date(deadlineDate);
            deadlineDay.setHours(0, 0, 0, 0);
            
            const daysLeft = Math.ceil((deadlineDay - today) / (1000 * 60 * 60 * 24));
            
            // Determine urgency tag
            let urgencyClass = 'soon';
            let urgencyText = 'Soon';
            if (daysLeft < 0) {
                urgencyClass = 'overdue';
                urgencyText = 'Overdue';
            } else if (daysLeft <= 3) {
                urgencyClass = 'urgent';
                urgencyText = 'Urgent';
            } else if (daysLeft <= 7) {
                urgencyClass = 'soon';
                urgencyText = 'Soon';
            } else {
                urgencyClass = 'normal';
                urgencyText = '';
            }

            const daysText = daysLeft < 0 
                ? `${Math.abs(daysLeft)} days overdue`
                : daysLeft === 0 
                    ? 'Due today'
                    : daysLeft === 1
                        ? '1 day left'
                        : `${daysLeft} days left`;

            return `
                <div class="deadline-item">
                    <div class="deadline-info">
                        <div class="deadline-club">${escapeHtml(club.name)}</div>
                        <div class="deadline-time">${daysText}</div>
                    </div>
                    ${urgencyText ? `<span class="deadline-tag ${urgencyClass}">${urgencyText}</span>` : ''}
                </div>
            `;
        }).filter(item => item !== null).join('');
    }

    // Parse deadline date from various formats
    function parseDeadlineDate(deadline) {
        if (!deadline) return null;

        // Try ISO format first (YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
            return new Date(deadline + 'T23:59:59');
        }

        // Try MM/DD/YYYY format
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(deadline)) {
            const parts = deadline.split('/');
            return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]), 23, 59, 59);
        }

        // Try other common formats
        const parsed = new Date(deadline);
        if (!isNaN(parsed.getTime())) {
            return parsed;
        }

        return null;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
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

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadData);
    } else {
        loadData();
    }
})();

