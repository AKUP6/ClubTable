// Club Settings functionality
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

            initializeSettings();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // Get club owned by owner_id
    // For beta testing, owner_id 1 owns club_id 1 (Yale Debate Association)
    function getClubForOwner(ownerId) {
        // For beta testing, owner_id 1 owns club_id 1
        // In a real app, this would be determined by the logged-in user
        if (ownerId === 1) {
            return clubsData.clubs.find(c => c.id === "1");
        }
        return null;
    }

    // Initialize settings with club data
    function initializeSettings() {
        currentClub = getClubForOwner(DEFAULT_OWNER_ID);
        
        if (!currentClub) {
            console.error('Could not load club data');
            return;
        }

        // Update page title and club name
        document.title = `Club Settings - ${currentClub.name} | Yale Clubs`;
        
        const ownerSubtitle = document.querySelector('.owner-subtitle');
        if (ownerSubtitle) {
            ownerSubtitle.textContent = `Managing: ${currentClub.name}`;
        }

        // Update club information fields
        const clubNameInput = document.getElementById('club-name');
        if (clubNameInput) {
            clubNameInput.value = currentClub.name;
        }

        const descriptionTextarea = document.getElementById('description');
        if (descriptionTextarea && currentClub.description) {
            descriptionTextarea.value = currentClub.description;
        }

        // Update tags
        const tagsContainer = document.querySelector('.tags-container');
        if (tagsContainer && currentClub.tags && Array.isArray(currentClub.tags)) {
            tagsContainer.innerHTML = currentClub.tags.map(tag => 
                `<span class="settings-tag active">${tag}</span>`
            ).join('');
        }

        // Load and display leadership team
        loadLeadershipTeam();
    }

    // Load and display leadership team from JSON
    function loadLeadershipTeam() {
        const leadershipList = document.querySelector('.leadership-list');
        if (!leadershipList) return;

        if (!currentClub.leadershipTeam || currentClub.leadershipTeam.length === 0) {
            leadershipList.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #666;">
                    No leadership team members found.
                </div>
            `;
            return;
        }

        // Render leadership team members
        leadershipList.innerHTML = currentClub.leadershipTeam.map((member, index) => {
            return `
                <div class="leadership-item" data-member-index="${index}">
                    <div class="leadership-content">
                        <div class="leadership-name">${member.name}</div>
                        <div class="leadership-details">
                            <span class="leadership-title">${member.title}</span>
                            <span class="leadership-email">${member.email}</span>
                        </div>
                    </div>
                    <div class="leadership-actions">
                        <a href="#" class="leadership-edit" data-member-index="${index}">Edit</a>
                        <a href="#" class="leadership-remove" data-member-index="${index}">Remove</a>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners for edit and remove buttons
        document.querySelectorAll('.leadership-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(btn.dataset.memberIndex);
                editLeadershipMember(index);
            });
        });

        document.querySelectorAll('.leadership-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(btn.dataset.memberIndex);
                removeLeadershipMember(index);
            });
        });
    }

    // Edit leadership member (placeholder for future functionality)
    function editLeadershipMember(index) {
        const member = currentClub.leadershipTeam[index];
        if (!member) return;
        
        // In a real application, this would open an edit modal
        alert(`Edit functionality for ${member.name} would open here.`);
    }

    // Remove leadership member (placeholder for future functionality)
    function removeLeadershipMember(index) {
        const member = currentClub.leadershipTeam[index];
        if (!member) return;
        
        if (confirm(`Are you sure you want to remove ${member.name} from the leadership team?`)) {
            // In a real application, this would update the JSON and save to backend
            currentClub.leadershipTeam.splice(index, 1);
            loadLeadershipTeam();
            console.log('Member removed (changes are in memory only)');
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadData);
    } else {
        loadData();
    }
})();

