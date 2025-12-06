// Club Applications functionality
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
    let clubUsersData = null;
    let clubsData = null;
    let filteredApplications = [];
    let currentStatusFilter = 'all';
    let currentEditingApp = null;
    let currentOwner = null;

    // Get current owner from localStorage
    function getCurrentOwner() {
        const stored = localStorage.getItem('clubtableCurrentUser');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error parsing current user:', e);
                return null;
            }
        }
        return null;
    }

    // Get all users from localStorage
    function getUsersFromStorage() {
        const stored = localStorage.getItem('clubtableUsers');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error parsing users:', e);
                return [];
            }
        }
        return [];
    }

    // Load JSON data
    async function loadData() {
        try {
            const clubsResponse = await fetch('../../database/json/clubs/clubs.json');
            clubsData = await clubsResponse.json();

            // Get current owner
            currentOwner = getCurrentOwner();
            if (!currentOwner) {
                showFlash('Please log in to view applications', 'error');
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1500);
                return;
            }

            // Build clubUsersData from localStorage
            const users = getUsersFromStorage();
            clubUsersData = {
                users: users,
                club_users: [] // We'll build this from user.clubs
            };

            // Build club_users array from each user's clubs
            users.forEach(user => {
                if (user.clubs) {
                    Object.keys(user.clubs).forEach(clubId => {
                        clubUsersData.club_users.push({
                            id: `${user.id}-${clubId}`,
                            user_id: user.id,
                            club_id: parseInt(clubId),
                            status_code: user.clubs[clubId],
                            application_date: user.created_at || new Date().toISOString(),
                            review_date: user.updated_at,
                            application_text: `Application from ${user.first_name} ${user.last_name}`,
                            notes: null,
                            created_at: user.created_at,
                            updated_at: user.updated_at
                        });
                    });
                }
            });

            initializeApplications();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // Get club owned by owner_id
    function getOwnedClub(ownerId) {
        if (!currentOwner || !currentOwner.clubs) return null;

        // Find the club the owner is admin/leadership of (status code 5)
        const ownedClubIds = Object.keys(currentOwner.clubs).filter(
            clubId => currentOwner.clubs[clubId] === 5
        );

        if (ownedClubIds.length === 0) return null;

        // Return the first owned club
        const clubId = ownedClubIds[0];
        return clubsData.clubs.find(c => c.id === clubId);
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
            const appDate = formatDate(app.application_date);
            const reviewDate = formatDate(app.review_date);
            
            // Format status display
            const statusDisplay = app.status.charAt(0).toUpperCase() + app.status.slice(1);

            return `
                <div class="activity-item" data-app-index="${index}" data-user-id="${app.user_id}" data-club-id="${app.club_id}">
                    <div class="activity-content">
                        <div class="activity-title">${user.first_name} ${user.last_name}</div>
                        <div class="activity-date">${user.email} | ${user.major} ${user.year}</div>
                        ${appDate ? `<div class="activity-date" style="margin-top: 4px;">Applied: ${appDate}${reviewDate ? ' | Reviewed: ' + reviewDate : ''}</div>` : ''}
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
        
        if (!currentOwner) return;
        
        const allApplications = getApplicationsForOwner(currentOwner.id);
        
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
            
            showFlash('Status updated successfully! (Note: Changes are in memory only. In production, this would save to the database.)', 'success');
        } catch (error) {
            console.error('Error updating status:', error);
            showFlash('Error updating status. Please try again.', 'error');
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

