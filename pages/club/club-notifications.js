// Club Notifications functionality
(function() {
    'use strict';

    // Default owner ID and club ID
    const DEFAULT_OWNER_ID = 1;
    const DEFAULT_CLUB_ID = 1;

    // Data storage
    let clubsData = null;
    let currentClub = null;

    // Load JSON data
    async function loadData() {
        try {
            const clubsResponse = await fetch('../../database/json/clubs/clubs.json');
            clubsData = await clubsResponse.json();

            initializeNotifications();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }


    // Format date
    function formatDate(dateString) {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Render sent notifications
    function renderSentNotifications() {
        const notificationsList = document.querySelector('.notifications-list');
        if (!notificationsList || !currentClub) return;

        const notifications = currentClub.notifications || [];

        // Sort by sent date (newest first)
        const sorted = [...notifications].sort((a, b) => {
            return new Date(b.sent_date) - new Date(a.sent_date);
        });

        if (sorted.length === 0) {
            notificationsList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <p>No notifications sent yet.</p>
                </div>
            `;
            return;
        }

        notificationsList.innerHTML = sorted.map(notification => {
            const sentDate = formatDate(notification.sent_date);
            const statusClass = notification.status === 'delivered' ? 'delivered' : 'pending';

            return `
                <div class="notification-item">
                    <div class="notification-content">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-meta">Sent to ${notification.recipient_count} recipients · ${sentDate}</div>
                    </div>
                    <span class="notification-status ${statusClass}">${notification.status}</span>
                </div>
            `;
        }).join('');
    }

    // Initialize notifications page
    function initializeNotifications() {
        // Get current club
        currentClub = clubsData.clubs.find(c => c.id === String(DEFAULT_CLUB_ID));
        
        if (!currentClub) {
            console.error('Club not found');
            return;
        }

        // Update club name in subtitle
        const subtitle = document.querySelector('.owner-subtitle');
        if (subtitle) {
            subtitle.textContent = `Managing: ${currentClub.name}`;
        }

        // Update page title
        document.title = `Notifications - ${currentClub.name} | Yale Clubs`;

        renderSentNotifications();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadData);
    } else {
        loadData();
    }
})();

