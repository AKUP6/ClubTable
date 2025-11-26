// Club Portal Navbar component - loads navbar into club owner pages
(function() {
    'use strict';

    // Get current page name from the URL
    function getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'club-portal.html';
        return page;
    }

    // Create navbar HTML
    function createNavbar() {
        const currentPage = getCurrentPage();
        
        // Determine which link should be active
        const isOverview = currentPage === 'club-portal.html' || currentPage === '';
        const isApplications = currentPage === 'club-applications.html';
        const isNotifications = currentPage === 'club-notifications.html';
        const isMeetings = currentPage === 'club-meetings.html';
        const isSettings = currentPage === 'club-settings.html';
        
        return `
            <nav class="navbar">
                <div class="nav-container">
                    <a href="club-portal.html" class="nav-brand">
                        <div class="logo-icon">YC</div>
                        <span class="logo-text">Yale Clubs</span>
                    </a>
                    <div class="nav-links">
                        <a href="club-portal.html" class="nav-link ${isOverview ? 'active' : ''}">Overview</a>
                        <a href="club-applications.html" class="nav-link ${isApplications ? 'active' : ''}">Applications</a>
                        <a href="club-notifications.html" class="nav-link ${isNotifications ? 'active' : ''}">Notifications</a>
                        <a href="club-meetings.html" class="nav-link ${isMeetings ? 'active' : ''}">Meetings</a>
                        <a href="club-settings.html" class="nav-link ${isSettings ? 'active' : ''}">Club Settings</a>
                        <a href="../student/index.html" class="nav-link">Log Out</a>
                    </div>
                </div>
            </nav>
        `;
    }

    // Insert navbar into the page
    function loadNavbar() {
        const container = document.getElementById('navbar-container');
        if (container) {
            container.innerHTML = createNavbar();
        }
    }

    // Load navbar when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadNavbar);
    } else {
        loadNavbar();
    }
})();

