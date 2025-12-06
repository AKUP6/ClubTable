// My Applications functionality
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
                console.error('Error parsing current user:', e);
                return null;
            }
        }
        return null;
    }

    // Get current user
    function getCurrentUser() {
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

    // Data storage
    let clubsData = null;
    let currentUser = null;

    // Load data
    async function loadData() {
        try {
            const clubsResponse = await fetch('../../database/json/clubs/clubs.json');
            clubsData = await clubsResponse.json();
            
            currentUser = getCurrentUser();
            
            if (!currentUser) {
                // Redirect to login if no user
                window.location.href = 'index.html';
                return;
            }
            
            initializeApplications();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // Get user's applications
    function getUserApplications() {
        if (!currentUser || !currentUser.clubs) {
            return [];
        }

        const applications = [];
        const clubIds = Object.keys(currentUser.clubs);

        clubIds.forEach(clubId => {
            const club = clubsData.clubs.find(c => c.id === clubId);
            if (club) {
                const statusCode = currentUser.clubs[clubId];
                
                // Map status codes to application status
                let status = 'pending';
                let statusDisplay = 'Under Review';
                let statusClass = 'under-review';
                let icon = 'fa-clock';
                
                if (statusCode === 1 || statusCode === 2 || statusCode === 4 || statusCode === 5) {
                    status = 'accepted';
                    statusDisplay = 'Accepted';
                    statusClass = 'accepted';
                    icon = 'fa-check';
                } else if (statusCode === 3) {
                    status = 'pending';
                    statusDisplay = 'Under Review';
                    statusClass = 'under-review';
                    icon = 'fa-clock';
                } else if (statusCode === 0 || statusCode === -1) {
                    status = 'rejected';
                    statusDisplay = 'Not Accepted';
                    statusClass = 'rejected';
                    icon = 'fa-times';
                }

                applications.push({
                    clubId: clubId,
                    club: club,
                    statusCode: statusCode,
                    status: status,
                    statusDisplay: statusDisplay,
                    statusClass: statusClass,
                    icon: icon,
                    submittedDate: currentUser.created_at || new Date().toISOString(),
                    reviewedDate: currentUser.updated_at
                });
            }
        });

        return applications;
    }

    // Calculate statistics
    function calculateStatistics(applications) {
        const total = applications.length;
        const pending = applications.filter(a => a.status === 'pending').length;
        const accepted = applications.filter(a => a.status === 'accepted').length;
        const rejected = applications.filter(a => a.status === 'rejected').length;

        return { total, pending, accepted, rejected };
    }

    // Format date for display
    function formatDate(dateString) {
        if (!dateString) return 'Unknown';
        
        try {
            const date = new Date(dateString);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        } catch (e) {
            return 'Unknown';
        }
    }

    // Initialize applications page
    function initializeApplications() {
        const applications = getUserApplications();
        const stats = calculateStatistics(applications);

        // Update summary cards
        updateSummaryCards(stats);

        // Update applications list
        updateApplicationsList(applications);
    }

    // Update summary cards
    function updateSummaryCards(stats) {
        const summaryCards = document.querySelectorAll('.summary-card');
        
        summaryCards.forEach(card => {
            const label = card.querySelector('.summary-label');
            const value = card.querySelector('.summary-value');
            
            if (!label || !value) return;
            
            const labelText = label.textContent.trim();
            
            if (labelText === 'Total Applications') {
                value.textContent = stats.total;
            } else if (labelText === 'Under Review') {
                value.textContent = stats.pending;
            } else if (labelText === 'Accepted') {
                value.textContent = stats.accepted;
            }
        });
    }

    // Update applications list
    function updateApplicationsList(applications) {
        const listContainer = document.querySelector('.applications-list');
        
        if (!listContainer) return;

        if (applications.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox" style="font-size: 64px; color: #cbd5e0; margin-bottom: 16px;"></i>
                    <h3 style="font-size: 20px; color: #4a5568; margin-bottom: 8px;">No Applications Yet</h3>
                    <p style="color: #718096; margin-bottom: 24px;">You haven't applied to any clubs yet. Browse clubs and submit your first application!</p>
                    <a href="clubs.html" class="btn-primary" style="display: inline-block; padding: 12px 24px; text-decoration: none;">Browse Clubs</a>
                </div>
            `;
            return;
        }

        // Sort: pending first, then accepted, then rejected
        applications.sort((a, b) => {
            const order = { pending: 0, accepted: 1, rejected: 2 };
            return order[a.status] - order[b.status];
        });

        listContainer.innerHTML = applications.map(app => {
            const submittedDate = formatDate(app.submittedDate);
            const reviewedDate = app.status !== 'pending' ? formatDate(app.reviewedDate) : null;
            
            let message = '';
            if (app.status === 'pending') {
                message = "You'll receive an email when your application is reviewed.";
            } else if (app.status === 'accepted') {
                message = `Congratulations! You've been accepted to ${app.club.name}. Check your email for next steps.`;
            } else if (app.status === 'rejected') {
                message = `We're sorry, but your application to ${app.club.name} was not accepted at this time. We encourage you to apply again in the future!`;
            }

            return `
                <div class="application-card">
                    <div class="application-header">
                        <div class="application-title-section">
                            <i class="fas ${app.icon} application-status-icon ${app.statusClass}"></i>
                            <h3 class="application-title">${escapeHtml(app.club.name)}</h3>
                        </div>
                        <div class="application-actions">
                            ${app.status === 'accepted' ? 
                                `<button class="btn-primary-small" onclick="window.location.href='clubs.html'">View Club</button>` :
                                ''
                            }
                        </div>
                    </div>
                    <div class="application-info">
                        <p class="application-date">Submitted on ${submittedDate}</p>
                        ${reviewedDate ? `<p class="application-date">Reviewed on ${reviewedDate}</p>` : ''}
                        <div class="application-status">
                            <span class="status-badge status-${app.statusClass}">${app.statusDisplay}</span>
                        </div>
                        <p class="application-message">${message}</p>
                        ${app.club.applicationDeadline ? 
                            `<p class="application-deadline" style="font-size: 13px; color: #718096; margin-top: 8px;">
                                <i class="fas fa-calendar"></i> Application Deadline: ${app.club.applicationDeadline}
                            </p>` : 
                            ''
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadData);
    } else {
        loadData();
    }
})();

