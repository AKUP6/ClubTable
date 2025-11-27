// Navbar component - loads navbar into pages
(function() {
    'use strict';

    // Get current page name from the URL
    function getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page;
    }

    // Create navbar HTML
    function createNavbar() {
        const currentPage = getCurrentPage();
        
        // Determine which link should be active
        const isDashboard = currentPage === 'dashboard.html' || currentPage === '';
        const isApplications = currentPage === 'applications.html';
        const isProfile = currentPage === 'profile.html';
        const isCalendar = currentPage === 'calendar.html';
        const isClubs = currentPage === 'clubs.html';
        
        return `
            <nav class="navbar">
                <div class="nav-container">
                    <a href="dashboard.html" class="nav-brand">
                        <div class="logo-icon">YC</div>
                        <span class="logo-text">Yale Clubs</span>
                    </a>
                    <div class="nav-links">
                        <a href="dashboard.html" class="nav-link ${isDashboard ? 'active' : ''}">Dashboard</a>
                        <a href="clubs.html" class="nav-link ${isClubs ? 'active' : ''}">Clubs</a>
                        <a href="calendar.html" class="nav-link ${isCalendar ? 'active' : ''}">Calendar</a>
                        <a href="applications.html" class="nav-link ${isApplications ? 'active' : ''}">Applications</a>
                        <a href="profile.html" class="nav-link ${isProfile ? 'active' : ''}">Profile</a>
                        <a href="index.html" class="nav-link">Log Out</a>
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

