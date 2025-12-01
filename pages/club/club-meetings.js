// Club Meetings functionality
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

            initializeMeetings();
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

    // Format time
    function formatTime(timeString) {
        if (!timeString) return null;
        // Convert 24-hour to 12-hour format
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    // Render meeting schedule
    function renderMeetingSchedule() {
        const scheduleList = document.querySelector('.meeting-schedule-list');
        if (!scheduleList || !currentClub) return;

        const schedules = currentClub.meeting_schedule || [];

        if (schedules.length === 0) {
            scheduleList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <p>No meeting schedule set.</p>
                </div>
            `;
            return;
        }

        scheduleList.innerHTML = schedules.map(schedule => `
            <div class="meeting-schedule-item">
                <i class="fas fa-calendar-alt schedule-icon"></i>
                <div class="schedule-content">
                    <div class="schedule-day">${schedule.day}</div>
                    <div class="schedule-details">
                        <span class="schedule-time">${schedule.time}</span>
                        <span class="schedule-location">${schedule.location}</span>
                    </div>
                </div>
                <div class="schedule-actions">
                    <a href="#" class="schedule-edit">Edit</a>
                    <a href="#" class="schedule-remove">Remove</a>
                </div>
            </div>
        `).join('');
    }

    // Render calendar events
    function renderCalendarEvents() {
        const eventsList = document.querySelector('.events-list');
        if (!eventsList || !currentClub) return;

        const events = currentClub.calendar_events || [];

        // Sort by date (upcoming first)
        const sorted = [...events].sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });

        if (sorted.length === 0) {
            eventsList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <p>No upcoming events scheduled.</p>
                </div>
            `;
            return;
        }

        eventsList.innerHTML = sorted.map(event => {
            const eventDate = formatDate(event.date);
            const eventTime = formatTime(event.time);

            return `
                <div class="event-item">
                    <div class="event-content">
                        <div class="event-title">${event.title}</div>
                        <div class="event-details">
                            <span class="event-detail">
                                <i class="fas fa-calendar-alt"></i>
                                ${eventDate}
                            </span>
                            <span class="event-detail">
                                <i class="fas fa-clock"></i>
                                ${eventTime}
                            </span>
                            <span class="event-detail">
                                <i class="fas fa-map-marker-alt"></i>
                                ${event.location}
                            </span>
                        </div>
                    </div>
                    <div class="event-rsvps">${event.rsvp_count} RSVPs</div>
                </div>
            `;
        }).join('');
    }

    // Initialize meetings page
    function initializeMeetings() {
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
        document.title = `Meetings - ${currentClub.name} | Yale Clubs`;

        renderMeetingSchedule();
        renderCalendarEvents();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadData);
    } else {
        loadData();
    }
})();

