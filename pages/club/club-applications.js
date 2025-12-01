// Club Applications functionality
(function() {
    'use strict';

    // Default owner ID
    const DEFAULT_OWNER_ID = 1;

    // Data storage
    let clubUsersData = null;
    let clubsData = null;
    let filteredApplications = [];
    let currentStatusFilter = 'all';
    let currentEditingApp = null;

    // Load JSON data
    async function loadData() {
        try {
            const [usersResponse, clubsResponse] = await Promise.all([
                fetch('../../database/json/users/club_users.json'),
                fetch('../../database/json/clubs/clubs.json')
            ]);

            clubUsersData = await usersResponse.json();
            clubsData = await clubsResponse.json();

            initializeApplications();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // Get club owned by owner_id (temporarily club_id 1 for owner_id 1)
    function getOwnedClub(ownerId) {
        // For now, owner_id 1 owns club_id 1 (Yale Debate Association)
        if (ownerId === 1) {
            return clubsData.clubs.find(c => c.id === "1");
        }
        return null;
    }

    // Get applications for owned club using applicants dictionary
    function getApplicationsForOwner(ownerId) {
        const club = getOwnedClub(ownerId);
        if (!club || !club.applicants) {
            return [];
        }

        // Get all applicants from the club's applicants dictionary
        const applicantIds = Object.keys(club.applicants);
        
        return applicantIds.map(userId => {
            const user = clubUsersData.users.find(u => u.id === parseInt(userId));
            const statusCode = club.applicants[userId];
            
            // Map status code to status string
            const statusMap = {
                1: 'accepted',
                2: 'rejected',
                3: 'pending',
                4: 'active',
                5: 'admin'
            };
            
            // Find the full application data from club_users array
            const applicationData = clubUsersData.club_users.find(
                cu => cu.user_id === parseInt(userId) && cu.club_id === parseInt(club.id)
            );
            
            return {
                user_id: parseInt(userId),
                club_id: parseInt(club.id),
                status: statusMap[statusCode] || 'pending',
                status_code: statusCode,
                user: user,
                club: club,
                application_date: applicationData?.application_date || null,
                review_date: applicationData?.review_date || null,
                application_text: applicationData?.application_text || null,
                notes: applicationData?.notes || null
            };
        });
    }

    // Format date
    function formatDate(dateString) {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Get status count
    function getStatusCount(applications, status) {
        if (status === 'all') return applications.length;
        return applications.filter(app => app.status === status).length;
    }

    // Calculate percentage
    function calculatePercentage(count, total) {
        if (total === 0) return '0%';
        return Math.round((count / total) * 100) + '%';
    }

    // Update metrics
    function updateMetrics(applications) {
        const total = applications.length;
        const accepted = getStatusCount(applications, 'accepted');
        const pending = getStatusCount(applications, 'pending');
        const rejected = getStatusCount(applications, 'rejected');
        const active = getStatusCount(applications, 'active');

        // Update metric cards - ensure we have the right number of elements
        const metricValues = document.querySelectorAll('.metric-card .metric-value');
        if (metricValues.length >= 5) {
            metricValues[0].textContent = total;
            metricValues[1].textContent = accepted;
            metricValues[2].textContent = pending;
            metricValues[3].textContent = rejected;
            metricValues[4].textContent = active;
        }

        // Update percentages
        const notes = document.querySelectorAll('.metric-note');
        if (notes.length >= 5) {
            notes[1].textContent = calculatePercentage(accepted, total) + ' rate';
            notes[3].textContent = calculatePercentage(rejected, total) + ' rate';
        }
    }

    // Get status badge class
    function getStatusBadgeClass(status) {
        const statusMap = {
            'pending': 'pending',
            'accepted': 'accepted',
            'rejected': 'rejected',
            'active': 'accepted',
            'inactive': 'pending'
        };
        return statusMap[status] || 'pending';
    }

    // Get status icon
    function getStatusIcon(status) {
        const iconMap = {
            'pending': 'fa-clock',
            'accepted': 'fa-check',
            'rejected': 'fa-times',
            'active': 'fa-check-circle',
            'inactive': 'fa-pause'
        };
        return iconMap[status] || 'fa-clock';
    }

    // Render applications
    function renderApplications(applications) {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;

        if (applications.length === 0) {
            activityList.innerHTML = `
                <div class="activity-item" style="text-align: center; padding: 40px;">
                    <p>No applications found for the selected filter.</p>
                </div>
            `;
            return;
        }

        // Sort by application date (newest first)
        const sorted = [...applications].sort((a, b) => {
            return new Date(b.application_date) - new Date(a.application_date);
        });

        activityList.innerHTML = sorted.map((app, index) => {
            const user = app.user;
            if (!user) return ''; // Skip if user not found
            
            const statusClass = getStatusBadgeClass(app.status);
            const statusIcon = getStatusIcon(app.status);
            const appDate = formatDate(app.application_date);
            const reviewDate = formatDate(app.review_date);
            
            // Format status display
            const statusDisplay = app.status.charAt(0).toUpperCase() + app.status.slice(1);

            return `
                <div class="activity-item" data-app-index="${index}" data-user-id="${app.user_id}" data-club-id="${app.club_id}">
                    <i class="fas ${statusIcon} activity-icon"></i>
                    <div class="activity-content">
                        <div class="activity-title">${user.first_name} ${user.last_name}</div>
                        <div class="activity-date">${user.email} | ${user.major} ${user.year}</div>
                        ${appDate ? `<div class="activity-date" style="margin-top: 4px;">Applied: ${appDate}${reviewDate ? ' | Reviewed: ' + reviewDate : ''}</div>` : ''}
                        ${app.application_text ? `<div style="margin-top: 8px; font-size: 0.9em; color: #666; padding: 8px; background: #f5f5f5; border-radius: 4px;">${app.application_text}</div>` : ''}
                        ${app.notes ? `<div style="margin-top: 4px; font-size: 0.85em; color: #888; font-style: italic;">Note: ${app.notes}</div>` : ''}
                    </div>
                    <span class="activity-status ${statusClass}">${statusDisplay}</span>
                </div>
            `;
        }).join('');

        // Add click handlers to application items
        document.querySelectorAll('.activity-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const userId = parseInt(item.dataset.userId);
                const clubId = parseInt(item.dataset.clubId);
                const app = sorted.find(a => a.user_id === userId && a.club_id === clubId);
                if (app) {
                    openStatusModal(app);
                }
            });
        });
    }

    // Filter applications by status
    function filterApplications(status) {
        currentStatusFilter = status;
        const allApplications = getApplicationsForOwner(DEFAULT_OWNER_ID);
        
        if (status === 'all') {
            filteredApplications = allApplications;
        } else {
            filteredApplications = allApplications.filter(app => app.status === status);
        }

        updateMetrics(allApplications);
        renderApplications(filteredApplications);
    }

    // Setup status filter buttons
    function setupFilters() {
        const filterContainer = document.querySelector('.owner-header');
        if (!filterContainer) return;

        // Create filter buttons
        const filterButtons = document.createElement('div');
        filterButtons.className = 'status-filters';
        filterButtons.style.cssText = 'display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;';

        const filters = [
            { id: 'all', label: 'All', icon: 'fa-list' },
            { id: 'pending', label: 'Pending', icon: 'fa-clock' },
            { id: 'accepted', label: 'Accepted', icon: 'fa-check' },
            { id: 'active', label: 'Active', icon: 'fa-check-circle' },
            { id: 'rejected', label: 'Rejected', icon: 'fa-times' }
        ];

        filters.forEach(filter => {
            const button = document.createElement('button');
            button.className = `filter-btn ${filter.id === 'all' ? 'active' : ''}`;
            button.innerHTML = `<i class="fas ${filter.icon}"></i> ${filter.label}`;
            button.style.cssText = `
                padding: 8px 16px;
                border: 1px solid #ddd;
                border-radius: 6px;
                background: white;
                cursor: pointer;
                transition: all 0.2s;
            `;
            
            button.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                filterApplications(filter.id);
            });

            filterButtons.appendChild(button);
        });

        filterContainer.appendChild(filterButtons);

        // Add active state styling
        const style = document.createElement('style');
        style.textContent = `
            .filter-btn.active {
                background: #4F46E5 !important;
                color: white !important;
                border-color: #4F46E5 !important;
            }
            .filter-btn:hover {
                background: #f5f5f5;
            }
            .filter-btn.active:hover {
                background: #4338CA !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Open status edit modal
    function openStatusModal(app) {
        currentEditingApp = app;
        const modal = document.getElementById('statusModal');
        const userName = document.getElementById('statusModalUserName');
        const statusSelect = document.getElementById('statusSelect');

        if (!modal || !userName || !statusSelect) return;

        userName.textContent = `Change status for ${app.user.first_name} ${app.user.last_name}`;
        statusSelect.value = app.status_code || getStatusCodeFromStatus(app.status);
        
        modal.style.display = 'flex';
    }

    // Close status modal
    function closeStatusModal() {
        const modal = document.getElementById('statusModal');
        if (modal) {
            modal.style.display = 'none';
            currentEditingApp = null;
        }
    }

    // Get status code from status string
    function getStatusCodeFromStatus(status) {
        const statusMap = {
            'accepted': 1,
            'rejected': 2,
            'pending': 3,
            'active': 4,
            'admin': 5
        };
        return statusMap[status] || 3;
    }

    // Get status string from status code
    function getStatusFromCode(code) {
        const statusMap = {
            1: 'accepted',
            2: 'rejected',
            3: 'pending',
            4: 'active',
            5: 'admin'
        };
        return statusMap[code] || 'pending';
    }

    // Update application status in JSON files
    async function updateApplicationStatus(userId, clubId, newStatusCode) {
        try {
            // Update clubs.json applicants dictionary
            const club = clubsData.clubs.find(c => c.id === String(clubId));
            if (club && club.applicants) {
                club.applicants[String(userId)] = newStatusCode;
            }

            // Update club_users.json
            const clubUser = clubUsersData.club_users.find(
                cu => cu.user_id === userId && cu.club_id === clubId
            );
            if (clubUser) {
                clubUser.status_code = newStatusCode;
                clubUser.status = getStatusFromCode(newStatusCode);
                clubUser.review_date = new Date().toISOString();
            }

            // Update user's clubs dictionary
            const user = clubUsersData.users.find(u => u.id === userId);
            if (user && user.clubs) {
                user.clubs[String(clubId)] = newStatusCode;
            }

            // In a real application, you would make an API call here to save to the backend
            // For now, we'll log the changes and reload the data
            console.log('Status updated:', {
                userId,
                clubId,
                newStatusCode,
                newStatus: getStatusFromCode(newStatusCode)
            });

            // Note: In a browser environment, we can't directly write to JSON files
            // This would require a backend API endpoint to persist changes
            // For now, the changes are in memory and will be lost on page refresh
            
            // Reload and refresh the display
            filterApplications(currentStatusFilter);
            closeStatusModal();
            
            alert('Status updated successfully! (Note: Changes are in memory only. In production, this would save to the database.)');
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating status. Please try again.');
        }
    }

    // Setup modal event handlers
    function setupModalHandlers() {
        const modal = document.getElementById('statusModal');
        const closeBtn = document.querySelector('.status-modal-close');
        const cancelBtn = document.getElementById('statusModalCancel');
        const saveBtn = document.getElementById('statusModalSave');
        const statusSelect = document.getElementById('statusSelect');

        if (closeBtn) {
            closeBtn.addEventListener('click', closeStatusModal);
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeStatusModal);
        }
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                if (currentEditingApp) {
                    const newStatusCode = parseInt(statusSelect.value);
                    updateApplicationStatus(
                        currentEditingApp.user_id,
                        currentEditingApp.club_id,
                        newStatusCode
                    );
                }
            });
        }
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeStatusModal();
                }
            });
        }
    }

    // Initialize
    function initializeApplications() {
        setupFilters();
        setupModalHandlers();
        filterApplications('all');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadData);
    } else {
        loadData();
    }
})();

