// Calendar functionality
(function() {
    'use strict';

    let currentWeek = new Date();
    
    // Initialize calendar
    function initCalendar() {
        updateWeekDisplay();
        setupTimeCells();
        setupWeekNavigation();
    }

    // Update week display
    function updateWeekDisplay() {
        const weekStart = getWeekStart(currentWeek);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const display = `Week of ${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}`;
        
        const weekDisplay = document.getElementById('week-display');
        if (weekDisplay) {
            weekDisplay.textContent = display;
        }
    }

    // Get the start of the week (Monday)
    function getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(d.setDate(diff));
    }

    // Setup time cell click handlers
    function setupTimeCells() {
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

    // Setup week navigation
    function setupWeekNavigation() {
        const prevBtn = document.getElementById('prev-week');
        const nextBtn = document.getElementById('next-week');

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                currentWeek.setDate(currentWeek.getDate() - 7);
                updateWeekDisplay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                currentWeek.setDate(currentWeek.getDate() + 7);
                updateWeekDisplay();
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCalendar);
    } else {
        initCalendar();
    }
})();

