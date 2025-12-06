# Club Join/Apply Feature Implementation

## Overview

This feature allows users to join clubs directly from the Clubs page, with applications automatically saved to their profile and reflected in the dashboard.

## Features Implemented

### 1. Club Join/Apply Buttons

**Three Button Types:**

| Button | Condition | Action | Status Code |
|--------|-----------|--------|-------------|
| **Add** | Open join (no application) | Immediately joins club | 1 (Member) |
| **Apply** | Requires application | Submits application | 3 (Pending) |
| **Audition** | Requires audition | Submits audition request | 3 (Pending) |

### 2. Data Storage

**Location**: `localStorage`

**Keys Updated:**
- `clubtableCurrentUser` - Current user's data
- `clubtableUsers` - Array of all users

**Data Structure:**
```javascript
{
  id: 1702345678901,
  first_name: "John",
  last_name: "Doe",
  clubs: {
    "1": 1,  // Club ID 1, Status Code 1 (Member)
    "2": 3,  // Club ID 2, Status Code 3 (Pending)
    "3": 1   // Club ID 3, Status Code 1 (Member)
  },
  updated_at: "2025-12-06T10:30:00.000Z"
}
```

### 3. Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 1 | Member | Open join - immediately added |
| 2 | Member | (Alternative member status) |
| 3 | Pending | Application or audition pending review |
| 4 | Active Member | (Active participation) |
| 5 | Leadership | (Leadership role) |

### 4. User Flow

```
User browses Clubs page
    ↓
Clicks "Apply" / "Audition" / "Add"
    ↓
System checks if already joined/applied
    ↓
If new:
  - Adds club to user.clubs object
  - Sets appropriate status code
  - Saves to localStorage
  - Updates timestamp
  - Shows success message
  - Disables button
    ↓
If duplicate:
  - Shows info message
  - No changes made
    ↓
Dashboard automatically updates:
  - Pending applications count
  - Active clubs count
  - Club list display
```

## Code Implementation

### In `pages/student/clubs.js`

#### Updated `setupAddButtons()` Function

```javascript
function setupAddButtons() {
    document.querySelectorAll('.club-action-btn').forEach(btn => {
        // Remove existing listeners to prevent duplicates
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const clubId = this.getAttribute('data-club-id');
            const club = clubsData.find(c => c.id === clubId);
            if (!club) return;

            const buttonText = this.textContent.trim();
            let statusCode = 1; // Default: Member
            
            // Determine status code based on button type
            if (buttonText === 'Apply') {
                statusCode = 3; // Pending application
            } else if (buttonText === 'Audition') {
                statusCode = 3; // Pending audition
            }
            
            // Get current user from localStorage
            const storedUser = localStorage.getItem('clubtableCurrentUser');
            if (storedUser) {
                const currentUser = JSON.parse(storedUser);
                
                // Initialize clubs object if needed
                if (!currentUser.clubs) {
                    currentUser.clubs = {};
                }
                
                // Check for duplicates
                if (currentUser.clubs[clubId]) {
                    showFlash('You have already joined or applied to this club!', 'info');
                    return;
                }
                
                // Add club with status code
                currentUser.clubs[clubId] = statusCode;
                currentUser.updated_at = new Date().toISOString();
                
                // Save to localStorage
                localStorage.setItem('clubtableCurrentUser', JSON.stringify(currentUser));
                
                // Update users array
                const usersArray = localStorage.getItem('clubtableUsers');
                if (usersArray) {
                    const users = JSON.parse(usersArray);
                    const userIndex = users.findIndex(u => u.id === currentUser.id);
                    if (userIndex !== -1) {
                        users[userIndex] = currentUser;
                        localStorage.setItem('clubtableUsers', JSON.stringify(users));
                    }
                }
                
                // Show success message
                showFlash(successMessage, 'success');
                
                // Update button state
                this.textContent = statusCode === 3 ? 'Pending' : 'Joined';
                this.disabled = true;
                this.style.opacity = '0.6';
                this.style.cursor = 'not-allowed';
            }
        });
    });
}
```

### Dashboard Integration

The dashboard automatically picks up new clubs because `getUserClubsWithDetails()` in `dashboard.js` now:

1. **Checks localStorage first** for current user's clubs
2. **Reads `user.clubs` object** and maps club IDs to club data
3. **Merges with JSON data** for comprehensive club list
4. **Filters by status** for different sections:
   - Status code 3 → Pending Applications
   - Status codes 1, 2, 4, 5 → Active Clubs

## Calendar In-Progress Overlay

### Implementation

Added a professional overlay to `calendar.html` indicating the feature is under development.

**HTML Structure:**
```html
<div class="in-progress-overlay">
    <div class="in-progress-content">
        <div class="in-progress-icon">
            <i class="fas fa-tools"></i>
        </div>
        <h2 class="in-progress-title">Calendar Feature In Progress</h2>
        <p class="in-progress-message">
            We're working hard to bring you the full calendar experience!
        </p>
        <div class="in-progress-features">
            <!-- Feature list -->
        </div>
        <p class="in-progress-note">
            Check the Clubs page to see meeting times.
        </p>
    </div>
</div>
```

**Styling:**
- Fixed overlay covering entire viewport
- White background with blur effect
- Animated pulsing icon
- Centered content card with shadow
- Feature list with checkmarks
- Link to Clubs page
- Background calendar dimmed (opacity: 0.3)

## User Experience

### Joining a Club

1. **Browse Clubs Page**
   - See all available clubs in table format
   - Filter by type (Open, Application, Audition)
   - Search by name

2. **Click Action Button**
   - "Add" for open join clubs
   - "Apply" for application-required clubs
   - "Audition" for audition-required clubs

3. **Immediate Feedback**
   - Success message appears
   - Button text changes to "Joined" or "Pending"
   - Button becomes disabled
   - Visual indication (opacity reduced)

4. **Dashboard Updates**
   - Navigate to dashboard
   - See new club in "Your Clubs" (if joined)
   - See new application in "Pending Applications" (if applied)
   - Statistics update automatically

### Success Messages

| Action | Message |
|--------|---------|
| Open Join | "You have added [Club Name] to your clubs!" |
| Apply | "Your application to [Club Name] has been submitted!" |
| Audition | "Your audition request for [Club Name] has been submitted!" |
| Duplicate | "You have already joined or applied to this club!" |

### Calendar Page

- Professional "In Progress" overlay
- Clear communication about development status
- List of upcoming features
- Link to alternative (Clubs page)
- Background calendar visible but dimmed

## Testing

### Test Case 1: Open Join Club

1. Navigate to Clubs page
2. Find club with "Add" button
3. Click "Add"
4. ✅ Success message appears
5. ✅ Button changes to "Joined"
6. ✅ Button becomes disabled
7. Navigate to Dashboard
8. ✅ Club appears in "Your Clubs"
9. ✅ "Active Clubs" count increases

### Test Case 2: Apply to Club

1. Navigate to Clubs page
2. Find club with "Apply" button
3. Click "Apply"
4. ✅ Success message appears
5. ✅ Button changes to "Pending"
6. ✅ Button becomes disabled
7. Navigate to Dashboard
8. ✅ Application appears in "Pending Applications"
9. ✅ "Pending Applications" count increases

### Test Case 3: Duplicate Prevention

1. Join a club
2. Refresh page
3. Try to join same club again
4. ✅ Info message: "You have already joined or applied to this club!"
5. ✅ No duplicate entry created

### Test Case 4: Calendar Overlay

1. Navigate to Calendar page
2. ✅ "In Progress" overlay appears
3. ✅ Background calendar is dimmed
4. ✅ Features list is visible
5. ✅ Link to Clubs page works

## Edge Cases Handled

### 1. No User Logged In
- Shows error: "Please log in to join clubs"
- No changes made

### 2. Club Not Found
- Silently returns (no error shown)
- Logs error to console

### 3. Corrupted localStorage
- Try-catch blocks prevent crashes
- Logs errors to console
- Shows user-friendly error message

### 4. Missing clubs Object
- Automatically initializes empty object
- Proceeds with join/apply

### 5. Duplicate Applications
- Checks before adding
- Shows info message
- Prevents duplicate entries

## Data Persistence

### localStorage Structure

**Before Joining Any Clubs:**
```javascript
{
  id: 1702345678901,
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@yale.edu",
  clubs: {},  // Empty
  // ... other fields
}
```

**After Joining 2 Clubs and Applying to 1:**
```javascript
{
  id: 1702345678901,
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@yale.edu",
  clubs: {
    "1": 1,  // Yale Debate Association (joined)
    "2": 3,  // Code4Good (pending)
    "5": 1   // Yale Daily News (joined)
  },
  updated_at: "2025-12-06T10:30:00.000Z"
}
```

### Synchronization

Both storage locations are updated:
1. **`clubtableCurrentUser`** - Current session
2. **`clubtableUsers`** - All users array

This ensures:
- Changes persist across page refreshes
- Dashboard reads correct data
- Multiple users can be tracked

## Future Enhancements

### 1. Backend Integration

Replace localStorage with API calls:

```javascript
// Instead of localStorage
const response = await fetch('/api/users/clubs', {
  method: 'POST',
  body: JSON.stringify({
    user_id: currentUser.id,
    club_id: clubId,
    status: statusCode
  })
});
```

### 2. Application Forms

For clubs requiring applications:
- Show modal with application questions
- Collect essay responses
- Upload documents
- Submit complete application

### 3. Audition Scheduling

For clubs requiring auditions:
- Show available time slots
- Allow user to select preferred time
- Send confirmation email
- Add to calendar

### 4. Status Tracking

- Email notifications on status changes
- In-app notifications
- Application status page
- Timeline of application process

### 5. Club Recommendations

- Based on major/interests
- Based on friends' clubs
- Based on schedule compatibility
- Personalized suggestions

### 6. Waitlist Management

- Join waitlist if club is full
- Automatic notification when spot opens
- Priority based on application date

## Benefits

✅ **Instant Feedback**: Users see immediate results  
✅ **Persistent Data**: Changes saved across sessions  
✅ **Dashboard Integration**: Automatic updates  
✅ **Duplicate Prevention**: No accidental re-applications  
✅ **Status Tracking**: Clear pending vs. joined states  
✅ **Professional UX**: Smooth interactions and messaging  
✅ **Calendar Transparency**: Clear communication about development status  

---

**Created**: December 6, 2025  
**Status**: ✅ Implemented  
**Commit**: 531bf39  
**Version**: 1.0

