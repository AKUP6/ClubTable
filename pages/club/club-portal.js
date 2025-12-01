// Club Portal functionality
(function() {
    'use strict';

    // Default owner ID
    const DEFAULT_OWNER_ID = 1;

    // Data storage
    let clubsData = null;
    let currentClub = null;

    // Load JSON data
    async function loadData() {
        try {
            const clubsResponse = await fetch('../../database/json/clubs/clubs.json');
            clubsData = await clubsResponse.json();

            initializePortal();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // Get club owned by owner_id (temporarily club_id 1 for owner_id 1)
    function getClubForOwner(ownerId) {
        // For now, owner_id 1 owns club_id 1 (Yale Debate Association)
        if (ownerId === 1) {
            return clubsData.clubs.find(c => c.id === "1");
        }
        return null;
    }

    // Initialize portal with club data
    function initializePortal() {
        currentClub = getClubForOwner(DEFAULT_OWNER_ID);
        
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

