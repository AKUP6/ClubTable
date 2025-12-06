// Club Portal functionality
(function() {
    'use strict';

    // Data storage
    let clubsData = null;
    let currentClub = null;
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

    // Load JSON data
    async function loadData() {
        try {
            const clubsResponse = await fetch('../../database/json/clubs/clubs.json');
            clubsData = await clubsResponse.json();

            // Get current owner
            currentOwner = getCurrentOwner();
            if (!currentOwner) {
                console.error('No logged in user');
                window.location.href = '/index.html';
                return;
            }

            initializePortal();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // Get club owned by owner_id
    function getClubForOwner(ownerId) {
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

    // Initialize portal with club data
    function initializePortal() {
        currentClub = getClubForOwner(currentOwner.id);
        
        if (!currentClub) {
            console.error('Could not load club data');
            return;
        }

        // Update page title
        document.title = `Owner Panel - ${currentClub.name} | Yale Clubs`;

        // Update club banner
        const clubNameBanner = document.querySelector('.club-name-banner');
        if (clubNameBanner) {
            clubNameBanner.textContent = currentClub.name;
        }

        const clubCategoryBanner = document.querySelector('.club-category-banner');
        if (clubCategoryBanner) {
            // Extract category from metadata or use default
            const category = currentClub.metadata?.Category || 'Academic';
            clubCategoryBanner.textContent = category;
        }

        // Update club description
        const clubDescriptionTitle = document.querySelector('.club-description-title');
        if (clubDescriptionTitle && currentClub.metadata) {
            // Use metadata or description
            const title = Object.keys(currentClub.metadata)[0] || 'Club Information';
            clubDescriptionTitle.textContent = title;
        }

        const clubDescriptionText = document.querySelector('.club-description-text');
        if (clubDescriptionText) {
            // Show first paragraph of description
            const firstParagraph = currentClub.description.split('\n\n')[0] || currentClub.description;
            clubDescriptionText.textContent = firstParagraph;
        }

        // Update club tags from database
        const clubTags = document.querySelector('.club-tags');
        if (clubTags && currentClub.tags && Array.isArray(currentClub.tags)) {
            // Use tags from database, make first tag active
            clubTags.innerHTML = currentClub.tags.map((tag, index) => 
                `<span class="club-tag ${index === 0 ? 'active' : ''}">${tag}</span>`
            ).join('');
        } else if (clubTags) {
            // Fallback if no tags in database
            clubTags.innerHTML = '<span class="club-tag active">Academic</span>';
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadData);
    } else {
        loadData();
    }
})();

