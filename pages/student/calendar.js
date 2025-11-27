// Google Calendar-style Event Calendar
(function() {
    'use strict';

    // Event data structure
    const MeetingEvent = {
        id: '',
        clubName: '',
        start: null,
        end: null,
        location: '',
        description: '',
        color: ''
    };

    // Get week start (Monday) - helper function
    function getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(d.setDate(diff));
        weekStart.setHours(0, 0, 0, 0);
        return weekStart;
    }

    // Sample events data - using relative dates
    function getSampleEvents() {
        const today = new Date();
        const weekStart = getWeekStart(today);
        
        return [
            {
                id: '1',
                clubName: 'Yale Debate Association',
                start: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 1, 14, 0), // Tuesday, 2 PM
                end: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 1, 16, 0),   // Tuesday, 4 PM
                location: 'Linsly-Chittenden Hall, Room 101',
                description: 'Weekly debate practice session. All members welcome.',
                color: '#4285f4'
            },
            {
                id: '2',
                clubName: 'Code4Good',
                start: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 2, 15, 0), // Wednesday, 3 PM
                end: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 2, 17, 0),   // Wednesday, 5 PM
                location: 'Computer Science Building, Room 203',
                description: 'Project planning meeting for the new website redesign.',
                color: '#34a853'
            },
            {
                id: '3',
                clubName: 'Yale Daily News',
                start: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 3, 10, 0), // Thursday, 10 AM
                end: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 3, 11, 30), // Thursday, 11:30 AM
                location: '202 York Street',
                description: 'Editorial meeting to discuss upcoming articles.',
                color: '#ea4335'
            },
            {
                id: '4',
                clubName: 'Yale Debate Association',
                start: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 4, 13, 0), // Friday, 1 PM
                end: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 4, 14, 30), // Friday, 2:30 PM
                location: 'Linsly-Chittenden Hall, Room 101',
                description: 'Team strategy session before the tournament.',
                color: '#4285f4'
            },
            {
                id: '5',
                clubName: 'Code4Good',
                start: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 5, 16, 0), // Saturday, 4 PM
                end: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 5, 18, 0),   // Saturday, 6 PM
                location: 'Computer Science Building, Room 203',
                description: 'Code review and pair programming session.',
                color: '#34a853'
            }
        ];
    }
    
    let events = getSampleEvents();

    let currentDate = new Date();
    let currentView = 'week'; // 'week' or 'month'

    // Initialize calendar
    function initCalendar() {
        setupViewToggle();
        setupNavigation();
        renderCalendar();
    }

    // Setup view toggle (Week/Month)
    function setupViewToggle() {
        const viewButtons = document.querySelectorAll('.gcal-view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                viewButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentView = this.textContent.trim();
                renderCalendar();
            });
        });
    }

    // Setup navigation buttons
    function setupNavigation() {
        const prevBtn = document.getElementById('prev-week');
        const nextBtn = document.getElementById('next-week');
        const todayBtn = document.getElementById('today-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (currentView === 'week') {
                    currentDate.setDate(currentDate.getDate() - 7);
                } else {
                    currentDate.setMonth(currentDate.getMonth() - 1);
                }
                renderCalendar();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (currentView === 'week') {
                    currentDate.setDate(currentDate.getDate() + 7);
                } else {
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }
                renderCalendar();
            });
        }

        if (todayBtn) {
            todayBtn.addEventListener('click', function() {
                currentDate = new Date();
                renderCalendar();
            });
        }
    }

    // Main render function
    function renderCalendar() {
        // Update events to match current week
        events = getSampleEvents();
        
        if (currentView === 'week') {
            renderWeekView();
        } else {
            renderMonthView();
        }
        updateDateDisplay();
    }

    // Render week view
    function renderWeekView() {
        // Show week grid, hide month grid
        const weekSection = document.querySelector('.gcal-availability-section');
        if (weekSection) {
            weekSection.style.display = 'block';
        }
        
        const monthContainer = document.getElementById('gcal-month-view');
        if (monthContainer) {
            monthContainer.style.display = 'none';
        }
        
        const weekStart = getWeekStart(currentDate);
        updateDayHeaders(weekStart);
        
        // Clear existing events
        document.querySelectorAll('.gcal-event-block').forEach(el => el.remove());
        
        // Get events for this week
        const weekEvents = getEventsForWeek(weekStart);
        
        // Render events
        weekEvents.forEach(event => {
            renderEventInWeek(event, weekStart);
        });
    }

    // Render month view
    function renderMonthView() {
        // Hide week grid, show month grid
        const weekSection = document.querySelector('.gcal-availability-section');
        if (weekSection) {
            weekSection.style.display = 'none';
        }
        
        // Create or update month view
        let monthContainer = document.getElementById('gcal-month-view');
        if (!monthContainer) {
            monthContainer = document.createElement('div');
            monthContainer.id = 'gcal-month-view';
            monthContainer.className = 'gcal-month-container';
            const calendarPage = document.querySelector('.calendar-page');
            if (calendarPage && weekSection) {
                calendarPage.insertBefore(monthContainer, weekSection);
            } else if (calendarPage) {
                calendarPage.appendChild(monthContainer);
            }
        }
        monthContainer.style.display = 'block';
        
        renderMonthGrid(monthContainer);
    }

    // Render month grid
    function renderMonthGrid(container) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
        
        container.innerHTML = `
            <div class="gcal-month-grid">
                ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => 
                    `<div class="gcal-month-day-header">${day}</div>`
                ).join('')}
                ${Array.from({ length: 42 }, (_, i) => {
                    const date = new Date(startDate);
                    date.setDate(startDate.getDate() + i);
                    const isCurrentMonth = date.getMonth() === month;
                    const isToday = isSameDay(date, new Date());
                    const dayEvents = getEventsForDay(date);
                    
                    return `
                        <div class="gcal-month-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}">
                            <div class="gcal-month-day-number">${date.getDate()}</div>
                            <div class="gcal-month-events">
                                ${dayEvents.slice(0, 3).map(event => `
                                    <div class="gcal-month-event-chip" style="background: ${event.color || '#4285f4'}" data-event-id="${event.id}">
                                        ${formatTime(event.start)} ${event.clubName}
                                    </div>
                                `).join('')}
                                ${dayEvents.length > 3 ? `<div class="gcal-month-more">+${dayEvents.length - 3} more</div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        // Add click handlers
        container.querySelectorAll('.gcal-month-event-chip').forEach(chip => {
            chip.addEventListener('click', function() {
                const eventId = this.getAttribute('data-event-id');
                const event = events.find(e => e.id === eventId);
                if (event) {
                    showEventModal(event);
                }
            });
        });
    }

    // Render event in week view
    function renderEventInWeek(event, weekStart) {
        // Check if event is in this week
        const eventDate = new Date(event.start);
        eventDate.setHours(0, 0, 0, 0);
        const weekStartDate = new Date(weekStart);
        weekStartDate.setHours(0, 0, 0, 0);
        const weekEndDate = new Date(weekStart);
        weekEndDate.setDate(weekEndDate.getDate() + 6);
        weekEndDate.setHours(23, 59, 59, 999);
        
        if (eventDate < weekStartDate || eventDate > weekEndDate) {
            return; // Event not in this week
        }
        
        const eventDay = event.start.getDay();
        const adjustedDay = eventDay === 0 ? 6 : eventDay - 1; // Convert to Mon=0, Sun=6
        
        const startHour = event.start.getHours();
        const startMinute = event.start.getMinutes();
        const endHour = event.end.getHours();
        const endMinute = event.end.getMinutes();
        
        // Calculate position and height
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        const duration = endMinutes - startMinutes;
        
        // Base time is 8 AM (480 minutes), each hour is 48px
        const baseMinutes = 8 * 60;
        const topOffset = ((startMinutes - baseMinutes) / 60) * 48;
        const height = (duration / 60) * 48;
        
        // Find the day column
        const daysGrid = document.querySelector('.gcal-days-grid');
        if (!daysGrid) return;
        
        // Calculate day width (accounting for borders)
        const gridWidth = daysGrid.offsetWidth;
        const dayWidth = gridWidth / 7;
        const leftPosition = adjustedDay * dayWidth + 1; // +1 for border
        
        // Create event block
        const eventBlock = document.createElement('div');
        eventBlock.className = 'gcal-event-block';
        eventBlock.style.position = 'absolute';
        eventBlock.style.left = `${leftPosition}px`;
        eventBlock.style.top = `${60 + topOffset}px`; // 60px for header
        eventBlock.style.width = `${dayWidth - 2}px`; // -2 for borders
        eventBlock.style.height = `${Math.max(height, 24)}px`; // Minimum height
        eventBlock.style.backgroundColor = event.color || '#4285f4';
        eventBlock.style.borderLeft = `3px solid ${darkenColor(event.color || '#4285f4')}`;
        eventBlock.setAttribute('data-event-id', event.id);
        
        // Event content
        const timeStr = formatTime(event.start);
        eventBlock.innerHTML = `
            <div class="gcal-event-title">${event.clubName}</div>
            <div class="gcal-event-time">${timeStr}</div>
        `;
        
        // Click handler
        eventBlock.addEventListener('click', function(e) {
            e.stopPropagation();
            showEventModal(event);
        });
        
        // Append to days grid
        if (daysGrid.style.position !== 'relative') {
            daysGrid.style.position = 'relative';
        }
        daysGrid.appendChild(eventBlock);
    }

    // Get events for a specific week
    function getEventsForWeek(weekStart) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        return events.filter(event => {
            return event.start >= weekStart && event.start < weekEnd;
        });
    }

    // Get events for a specific day
    function getEventsForDay(date) {
        return events.filter(event => {
            return isSameDay(event.start, date);
        }).sort((a, b) => a.start - b.start);
    }

    // Check if two dates are the same day
    function isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    // Format time
    function formatTime(date) {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutesStr} ${ampm}`;
    }

    // Format date range
    function formatDateRange(start, end) {
        const startStr = formatTime(start);
        const endStr = formatTime(end);
        return `${startStr} - ${endStr}`;
    }

    // Darken color for border
    function darkenColor(color) {
        // Simple darkening - convert hex to RGB and darken
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 30);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 30);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 30);
        return `rgb(${r}, ${g}, ${b})`;
    }

    // Update day headers
    function updateDayHeaders(weekStart) {
        const dayHeaders = document.querySelectorAll('.gcal-day-header');
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        dayHeaders.forEach((header, index) => {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + index);
            
            const dayName = header.querySelector('.gcal-day-name');
            const dayDate = header.querySelector('.gcal-day-date');
            
            if (dayName) dayName.textContent = dayNames[index];
            if (dayDate) dayDate.textContent = date.getDate();
            
            // Highlight today
            if (isSameDay(date, new Date())) {
                header.classList.add('today');
            } else {
                header.classList.remove('today');
            }
        });
    }


    // Update date display
    function updateDateDisplay() {
        const dateDisplay = document.getElementById('week-display');
        if (!dateDisplay) return;
        
        if (currentView === 'week') {
            const weekStart = getWeekStart(currentDate);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            if (weekStart.getMonth() === weekEnd.getMonth()) {
                dateDisplay.textContent = `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
            } else {
                dateDisplay.textContent = `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${monthNames[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
            }
        } else {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            dateDisplay.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        }
    }

    // Show event modal
    function showEventModal(event) {
        // Remove existing modal
        const existingModal = document.getElementById('event-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'event-modal';
        modal.className = 'event-modal';
        modal.innerHTML = `
            <div class="event-modal-overlay"></div>
            <div class="event-modal-content">
                <div class="event-modal-header">
                    <h2 class="event-modal-title">${event.clubName}</h2>
                    <button class="event-modal-close" id="close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="event-modal-body">
                    <div class="event-modal-info">
                        <div class="event-modal-info-item">
                            <i class="fas fa-clock"></i>
                            <span>${formatDateRange(event.start, event.end)}</span>
                        </div>
                        ${event.location ? `
                        <div class="event-modal-info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${event.location}</span>
                        </div>
                        ` : ''}
                        ${event.description ? `
                        <div class="event-modal-description">
                            <p>${event.description}</p>
                        </div>
                        ` : ''}
                    </div>
                    <div class="event-modal-actions">
                        <button class="event-modal-btn-primary" id="view-club-btn">
                            View Club Page
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close handlers
        const closeBtn = document.getElementById('close-modal');
        const overlay = modal.querySelector('.event-modal-overlay');
        
        closeBtn.addEventListener('click', () => modal.remove());
        overlay.addEventListener('click', () => modal.remove());
        
        // View club button
        const viewClubBtn = document.getElementById('view-club-btn');
        viewClubBtn.addEventListener('click', () => {
            // Navigate to club page (you can customize this)
            window.location.href = `clubs.html#${event.clubName.toLowerCase().replace(/\s+/g, '-')}`;
        });
    }

    // Initialize availability calendar (for profile page)
    function initAvailabilityCalendar() {
        setupAvailabilityTimeCells();
        setupAvailabilityWeekNavigation();
        updateAvailabilityWeekDisplay();
        updateAvailabilityDayHeaders();
    }

    // Setup time cell click handlers for availability
    function setupAvailabilityTimeCells() {
        const cells = document.querySelectorAll('.time-cell');
        cells.forEach(cell => {
            cell.addEventListener('click', function() {
                toggleAvailability(this);
            });
        });
    }

    // Toggle availability for a time cell
    function toggleAvailability(cell) {
        if (cell.classList.contains('available')) {
            // Clicking blue (available) → white (empty)
            cell.classList.remove('available');
        } else if (cell.classList.contains('unavailable')) {
            // Clicking grey (unavailable) → white (empty)
            cell.classList.remove('unavailable');
        } else {
            // Clicking white (empty) → blue (available)
            cell.classList.add('available');
        }
    }

    // Setup week navigation for availability calendar
    function setupAvailabilityWeekNavigation() {
        const prevBtn = document.getElementById('prev-week');
        const nextBtn = document.getElementById('next-week');
        
        if (prevBtn && !prevBtn.hasAttribute('data-initialized')) {
            prevBtn.setAttribute('data-initialized', 'true');
            prevBtn.addEventListener('click', function() {
                currentDate.setDate(currentDate.getDate() - 7);
                updateAvailabilityWeekDisplay();
                updateAvailabilityDayHeaders();
            });
        }

        if (nextBtn && !nextBtn.hasAttribute('data-initialized')) {
            nextBtn.setAttribute('data-initialized', 'true');
            nextBtn.addEventListener('click', function() {
                currentDate.setDate(currentDate.getDate() + 7);
                updateAvailabilityWeekDisplay();
                updateAvailabilityDayHeaders();
            });
        }
    }

    // Update week display for availability calendar
    function updateAvailabilityWeekDisplay() {
        const weekStart = getWeekStart(currentDate);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const display = `Week of ${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}`;
        
        const weekDisplay = document.getElementById('week-display');
        if (weekDisplay) {
            weekDisplay.textContent = display;
        }
    }

    // Update day headers for availability calendar
    function updateAvailabilityDayHeaders() {
        const weekStart = getWeekStart(currentDate);
        const dayHeaders = document.querySelectorAll('.day-header');
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        dayHeaders.forEach((header, index) => {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + index);
            header.textContent = dayNames[index];
        });
    }

    // Detect which page we're on and initialize accordingly
    function detectPageAndInit() {
        const isProfilePage = document.querySelector('.profile-page') !== null;
        const isCalendarPage = document.querySelector('.calendar-page') !== null;
        const hasAvailabilityCalendar = document.querySelector('.time-cell') !== null;
        const hasEventCalendar = document.querySelector('.gcal-time-cell') !== null;

        if (isCalendarPage && hasEventCalendar) {
            // Main calendar page with events
            initCalendar();
        } else if (hasAvailabilityCalendar) {
            // Profile page with availability calendar
            initAvailabilityCalendar();
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', detectPageAndInit);
    } else {
        detectPageAndInit();
    }
})();
