# User Signup and Profile Flow

## Overview

This document describes the complete user signup flow, including student information collection, data storage, and profile completion.

## Flow Diagram

```
User Clicks "Sign Up"
    ↓
Signup Modal Opens
    ↓
User Fills Student Information:
  - First Name
  - Last Name
  - Email (@yale.edu)
  - Password
  - Year (Freshman/Sophomore/Junior/Senior/Graduate)
  - Student ID
  - Major
    ↓
Form Validation:
  - All fields required
  - Email must end with @yale.edu
  - Password minimum 6 characters
  - Email uniqueness check
    ↓
Create User Object:
  - id (timestamp)
  - first_name, last_name
  - email, password
  - student_id, year, major
  - phone, college, class_year (null initially)
  - bio (null initially)
  - preferences (default settings)
  - clubs (empty object)
  - created_at (timestamp)
    ↓
Save to localStorage:
  - clubtableCurrentUser (current session)
  - clubtableUsers (all users array)
  - clubtableNewUser flag (triggers welcome)
    ↓
Redirect to Profile Page
    ↓
Welcome Banner Displays:
  - "Welcome to Yale Clubs!" 🎉
  - Prompts to complete profile
  - Auto-opens edit mode
  - Auto-dismisses after 8 seconds
    ↓
User Completes Profile:
  - Phone Number
  - College
  - Class Year
  - Bio
    ↓
Profile Updates Saved:
  - Updates localStorage
  - Updates both current user and users array
  - Timestamp updated
    ↓
User Can Browse Clubs & Apply
```

## Files Modified

### 1. `/index.html`

**Signup Form** (Lines 123-153):
- Added fields for first name, last name
- Added year dropdown
- Added student ID field
- Added major field
- Improved layout with grid system

**Signup Handler** (Lines 289-322):
- Collects all student information
- Validates Yale email (@yale.edu)
- Creates comprehensive user object matching database schema
- Saves to both `clubtableCurrentUser` and `clubtableUsers`
- Sets `clubtableNewUser` flag for welcome banner
- Redirects to profile page instead of dashboard

### 2. `/pages/student/profile.js`

**New Functions**:

#### `getCurrentUserId()` (Lines 6-16)
```javascript
// Gets current user ID from localStorage
// Returns user.id or null
```

#### `showWelcomeBanner()` (Lines 27-97)
```javascript
// Checks for clubtableNewUser flag
// Displays animated welcome banner
// Prompts user to complete profile
// Auto-opens edit mode after 1 second
// Auto-dismisses banner after 8 seconds
```

#### Updated `getUserById()` (Lines 109-127)
```javascript
// Priority: localStorage > JSON data
// Ensures new users' data is retrieved correctly
```

#### Updated `saveProfileBtn` Handler (Lines 337-390)
```javascript
// Validates required fields
// Updates user object
// Saves to localStorage (both locations)
// Updates display
// Shows success message
```

#### Updated `saveBioBtn` Handler (Lines 281-316)
```javascript
// Updates bio in user object
// Saves to localStorage (both locations)
// Updates timestamp
// Shows success message
```

## Data Structure

### User Object Schema

```javascript
{
  id: Number,                    // Unique ID (timestamp)
  first_name: String,            // Required on signup
  last_name: String,             // Required on signup
  email: String,                 // Required, must end with @yale.edu
  password: String,              // Required (should be hashed in production)
  student_id: String,            // Required on signup (e.g., "STU001")
  year: String,                  // Required (Freshman/Sophomore/Junior/Senior/Graduate)
  major: String,                 // Required on signup
  class_year: String | null,     // Completed on profile (e.g., "2026")
  phone: String | null,          // Completed on profile
  college: String | null,        // Completed on profile
  bio: String | null,            // Completed on profile
  preferences: {
    email_notifications: Boolean,
    profile_visibility: Boolean
  },
  clubs: {},                     // Object mapping club_id to status_code
  type: 'regular' | 'cas',       // Account type
  created_at: String,            // ISO timestamp
  updated_at: String             // ISO timestamp (updated on save)
}
```

### localStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `clubtableCurrentUser` | Object | Currently logged-in user |
| `clubtableUsers` | Array | All registered users |
| `clubtableNewUser` | String | Flag ("true") for welcome banner |

## User Experience

### Signup Experience

1. **Click "Sign up"** on login page
2. **Fill out form** with student information
3. **Validation** ensures:
   - All fields completed
   - Yale email address
   - Email not already registered
4. **Success message**: "Account created successfully! Complete your profile."
5. **Automatic redirect** to profile page

### Profile Page Experience

1. **Welcome banner** appears with celebration emoji
2. **Clear message** to complete profile
3. **Edit mode opens automatically**
4. **Guided completion**:
   - Phone Number
   - College
   - Class Year
   - Bio
5. **Save updates** with success confirmation
6. **All data persisted** to localStorage

## Future Enhancements

### Backend Integration

When backend is available:

1. **API Endpoints**:
   ```
   POST /api/signup
   POST /api/login
   PUT /api/users/:id
   GET /api/users/:id
   ```

2. **Replace localStorage** with API calls:
   ```javascript
   // Instead of localStorage.setItem(...)
   await fetch('/api/users/' + userId, {
     method: 'PUT',
     body: JSON.stringify(userData)
   });
   ```

3. **Password Hashing**:
   - Use bcrypt or similar on backend
   - Never store plain text passwords

4. **Email Verification**:
   - Send verification email
   - Confirm Yale email ownership
   - Activate account on verification

5. **Session Management**:
   - JWT tokens or server-side sessions
   - Secure cookie storage
   - Auto-logout on expiration

### Additional Features

1. **Profile Picture Upload**
   - Change photo button functionality
   - Image storage and resizing
   - Default avatar generation

2. **Profile Validation**
   - "Profile completeness" indicator
   - Prompt for missing fields
   - Badge for complete profiles

3. **Social Features**
   - Public profile pages
   - Connect with other students
   - Share club memberships

4. **Preferences**
   - Email notification settings (already in UI)
   - Privacy controls (already in UI)
   - Notification preferences per club

## Testing Checklist

### Signup Flow

- [ ] Click "Sign up" opens modal
- [ ] All fields are required
- [ ] Non-Yale email shows error
- [ ] Duplicate email shows error
- [ ] Short password shows error
- [ ] Valid signup creates user
- [ ] User saved to localStorage (both keys)
- [ ] Redirects to profile page

### Profile Page

- [ ] Welcome banner displays for new users
- [ ] Banner auto-dismisses after 8 seconds
- [ ] Edit mode opens automatically
- [ ] All fields editable
- [ ] Save button works
- [ ] Updates saved to localStorage
- [ ] Success message displays
- [ ] Display updates correctly

### Data Persistence

- [ ] Refresh page keeps user logged in
- [ ] Profile updates persist after refresh
- [ ] Logout clears session
- [ ] Login shows updated profile
- [ ] Multiple users can be stored

## Troubleshooting

### User Not Redirected to Profile

**Check**:
1. Console for JavaScript errors
2. `clubtableNewUser` flag in localStorage
3. Redirect URL is correct

**Fix**:
```javascript
// Manually redirect if needed
window.location.href = '/pages/student/profile.html';
```

### Welcome Banner Not Showing

**Check**:
1. `clubtableNewUser` flag exists
2. `showWelcomeBanner()` is called
3. No CSS conflicts hiding banner

**Fix**:
```javascript
// Manually set flag
localStorage.setItem('clubtableNewUser', 'true');
// Refresh page
location.reload();
```

### Profile Updates Not Saving

**Check**:
1. `currentUser` object is defined
2. localStorage is enabled
3. No errors in console

**Debug**:
```javascript
// Check current user
console.log(JSON.parse(localStorage.getItem('clubtableCurrentUser')));

// Check users array
console.log(JSON.parse(localStorage.getItem('clubtableUsers')));
```

### Data Lost on Refresh

**Check**:
1. localStorage not cleared
2. Private/incognito mode not active
3. Browser storage quota not exceeded

**Fix**:
```javascript
// Check if localStorage works
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('localStorage is working');
} catch (e) {
  console.error('localStorage is not available:', e);
}
```

---

**Created**: December 6, 2025  
**Status**: ✅ Implemented  
**Version**: 1.0

