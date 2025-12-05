// Club Meetings functionality
(function() {
    'use strict';

    // Default owner ID and club ID
    const DEFAULT_OWNER_ID = 1;
    const DEFAULT_CLUB_ID = 1;

    // Data storage
    let clubsData = null;
    let currentClub = null;
    let currentEditingScheduleId = null;
    let currentEditingEventId = null;

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
            <div class="meeting-schedule-item" data-schedule-id="${schedule.id}">
                <i class="fas fa-calendar-alt schedule-icon"></i>
                <div class="schedule-content">
                    <div class="schedule-day">${schedule.day}</div>
                    <div class="schedule-details">
                        <span class="schedule-time">${schedule.time}</span>
                        <span class="schedule-location">${schedule.location}</span>
                    </div>
                </div>
                <div class="schedule-actions">
                    <button class="schedule-edit" data-schedule-id="${schedule.id}">Edit</button>
                    <button class="schedule-remove" data-schedule-id="${schedule.id}">Remove</button>
                </div>
            </div>
        `).join('');

        // Add event listeners for edit and remove buttons
        document.querySelectorAll('.schedule-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const scheduleId = parseInt(btn.dataset.scheduleId);
                editMeeting(scheduleId);
            });
        });

        document.querySelectorAll('.schedule-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const scheduleId = parseInt(btn.dataset.scheduleId);
                removeMeeting(scheduleId);
            });
        });
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
                <div class="event-item" data-event-id="${event.id}">
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
                    <div class="event-actions">
                        <button class="event-edit" data-event-id="${event.id}">Edit</button>
                        <button class="event-remove" data-event-id="${event.id}">Remove</button>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners for edit and remove buttons
        document.querySelectorAll('.event-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const eventId = parseInt(btn.dataset.eventId);
                editEvent(eventId);
            });
        });

        document.querySelectorAll('.event-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const eventId = parseInt(btn.dataset.eventId);
                removeEvent(eventId);
            });
        });
    }

    // Open meeting modal for adding
    function openAddMeetingModal() {
        currentEditingScheduleId = null;
        const modal = document.getElementById('meetingModal');
        const modalTitle = document.getElementById('meetingModalTitle');
        const form = document.getElementById('meetingForm');
        
        if (modal && modalTitle && form) {
            modalTitle.textContent = 'Add New Meeting';
            form.reset();
            modal.style.display = 'flex';
        }
    }

    // Open meeting modal for editing
    function editMeeting(scheduleId) {
        const schedule = currentClub.meeting_schedule.find(s => s.id === scheduleId);
        if (!schedule) return;

        currentEditingScheduleId = scheduleId;
        const modal = document.getElementById('meetingModal');
        const modalTitle = document.getElementById('meetingModalTitle');
        const daySelect = document.getElementById('meetingDay');
        const timeInput = document.getElementById('meetingTime');
        const locationInput = document.getElementById('meetingLocation');
        
        if (modal && modalTitle && daySelect && timeInput && locationInput) {
            modalTitle.textContent = 'Edit Meeting';
            daySelect.value = schedule.day;
            timeInput.value = schedule.time;
            locationInput.value = schedule.location;
            modal.style.display = 'flex';
        }
    }

    // Close meeting modal
    function closeMeetingModal() {
        const modal = document.getElementById('meetingModal');
        if (modal) {
            modal.style.display = 'none';
            currentEditingScheduleId = null;
            document.getElementById('meetingForm').reset();
        }
    }

    // Save meeting (add or update)
    function saveMeeting(formData) {
        if (!currentClub.meeting_schedule) {
            currentClub.meeting_schedule = [];
        }

        if (currentEditingScheduleId !== null) {
            // Update existing meeting
            const schedule = currentClub.meeting_schedule.find(s => s.id === currentEditingScheduleId);
            if (schedule) {
                schedule.day = formData.day;
                schedule.time = formData.time;
                schedule.location = formData.location;
            }
        } else {
            // Add new meeting
            const newId = currentClub.meeting_schedule.length > 0 
                ? Math.max(...currentClub.meeting_schedule.map(s => s.id)) + 1 
                : 1;
            
            currentClub.meeting_schedule.push({
                id: newId,
                day: formData.day,
                time: formData.time,
                location: formData.location,
                is_recurring: true,
                created_at: new Date().toISOString()
            });
        }

        // In a real application, you would save to the backend here
        console.log('Meeting saved:', currentClub.meeting_schedule);
        
        renderMeetingSchedule();
        closeMeetingModal();
        
        // Show success message
        showFlash(currentEditingScheduleId !== null ? 'Meeting updated successfully!' : 'Meeting added successfully!', 'success');
    }

    // Remove meeting
    function removeMeeting(scheduleId) {
        if (confirm('Are you sure you want to remove this meeting?')) {
            if (currentClub.meeting_schedule) {
                currentClub.meeting_schedule = currentClub.meeting_schedule.filter(s => s.id !== scheduleId);
                
                // In a real application, you would delete from the backend here
                console.log('Meeting removed:', scheduleId);
                
                renderMeetingSchedule();
                showFlash('Meeting removed successfully!', 'success');
            }
        }
    }

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

        // Setup event listeners
        setupEventListeners();
    }

    // Open event modal for adding
    function openAddEventModal() {
        currentEditingEventId = null;
        const modal = document.getElementById('eventModal');
        const modalTitle = document.getElementById('eventModalTitle');
        const form = document.getElementById('eventForm');
        
        if (modal && modalTitle && form) {
            modalTitle.textContent = 'Add New Event';
            form.reset();
            modal.style.display = 'flex';
        }
    }

    // Open event modal for editing
    function editEvent(eventId) {
        const event = currentClub.calendar_events.find(e => e.id === eventId);
        if (!event) return;

        currentEditingEventId = eventId;
        const modal = document.getElementById('eventModal');
        const modalTitle = document.getElementById('eventModalTitle');
        const titleInput = document.getElementById('eventTitle');
        const dateInput = document.getElementById('eventDate');
        const timeInput = document.getElementById('eventTimeInput');
        const locationInput = document.getElementById('eventLocation');
        const descriptionInput = document.getElementById('eventDescription');
        
        if (modal && modalTitle && titleInput && dateInput && timeInput && locationInput) {
            modalTitle.textContent = 'Edit Event';
            titleInput.value = event.title || '';
            
            // Format date for input (YYYY-MM-DD)
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toISOString().split('T')[0];
            dateInput.value = formattedDate;
            
            // Format time for input (HH:MM)
            const timeValue = event.time || '';
            timeInput.value = timeValue;
            
            locationInput.value = event.location || '';
            if (descriptionInput) {
                descriptionInput.value = event.description || '';
            }
            modal.style.display = 'flex';
        }
    }

    // Close event modal
    function closeEventModal() {
        const modal = document.getElementById('eventModal');
        if (modal) {
            modal.style.display = 'none';
            currentEditingEventId = null;
            document.getElementById('eventForm').reset();
        }
    }

    // Save event (add or update)
    function saveEvent(formData) {
        if (!currentClub.calendar_events) {
            currentClub.calendar_events = [];
        }

        if (currentEditingEventId !== null) {
            // Update existing event
            const event = currentClub.calendar_events.find(e => e.id === currentEditingEventId);
            if (event) {
                event.title = formData.title;
                event.date = formData.date;
                event.time = formData.time;
                event.location = formData.location;
                if (formData.description) {
                    event.description = formData.description;
                }
            }
        } else {
            // Add new event
            const newId = currentClub.calendar_events.length > 0 
                ? Math.max(...currentClub.calendar_events.map(e => e.id)) + 1 
                : 1;
            
            currentClub.calendar_events.push({
                id: newId,
                title: formData.title,
                date: formData.date,
                time: formData.time,
                location: formData.location,
                description: formData.description || '',
                rsvp_count: 0,
                event_type: 'meeting',
                created_at: new Date().toISOString()
            });
        }

        // In a real application, you would save to the backend here
        console.log('Event saved:', currentClub.calendar_events);
        
        renderCalendarEvents();
        closeEventModal();
        
        // Show success message
        showFlash(currentEditingEventId !== null ? 'Event updated successfully!' : 'Event added successfully!', 'success');
    }

    // Remove event
    function removeEvent(eventId) {
        if (confirm('Are you sure you want to remove this event?')) {
            if (currentClub.calendar_events) {
                currentClub.calendar_events = currentClub.calendar_events.filter(e => e.id !== eventId);
                
                // In a real application, you would delete from the backend here
                console.log('Event removed:', eventId);
                
                renderCalendarEvents();
                showFlash('Event removed successfully!', 'success');
            }
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Add meeting button
        const addBtn = document.querySelector('.btn-add-meeting');
        if (addBtn) {
            addBtn.addEventListener('click', openAddMeetingModal);
        }

        // Add event button
        const addEventBtn = document.querySelector('.btn-add-event');
        if (addEventBtn) {
            addEventBtn.addEventListener('click', openAddEventModal);
        }

        // Meeting modal handlers
        const modal = document.getElementById('meetingModal');
        const closeBtn = document.querySelector('.meeting-modal-close');
        const cancelBtn = document.getElementById('meetingModalCancel');
        const form = document.getElementById('meetingForm');

        if (closeBtn) {
            closeBtn.addEventListener('click', closeMeetingModal);
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeMeetingModal);
        }
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeMeetingModal();
                }
            });
        }
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = {
                    day: document.getElementById('meetingDay').value,
                    time: document.getElementById('meetingTime').value,
                    location: document.getElementById('meetingLocation').value
                };
                saveMeeting(formData);
            });
        }

        // Event modal handlers
        const eventModal = document.getElementById('eventModal');
        const eventCloseBtn = document.querySelector('.event-modal-close');
        const eventCancelBtn = document.getElementById('eventModalCancel');
        const eventForm = document.getElementById('eventForm');

        if (eventCloseBtn) {
            eventCloseBtn.addEventListener('click', closeEventModal);
        }
        if (eventCancelBtn) {
            eventCancelBtn.addEventListener('click', closeEventModal);
        }
        if (eventModal) {
            eventModal.addEventListener('click', (e) => {
                if (e.target === eventModal) {
                    closeEventModal();
                }
            });
        }
        if (eventForm) {
            eventForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = {
                    title: document.getElementById('eventTitle').value,
                    date: document.getElementById('eventDate').value,
                    time: document.getElementById('eventTimeInput').value,
                    location: document.getElementById('eventLocation').value,
                    description: document.getElementById('eventDescription').value
                };
                saveEvent(formData);
            });
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadData);
    } else {
        loadData();
    }
})();

