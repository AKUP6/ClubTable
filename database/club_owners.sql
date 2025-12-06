-- Club Owners SQL Schema and Data
-- This file contains the database schema and sample data for club owners/managers
-- Used for API requests to manage club ownership and permissions

-- Create club_owners table
CREATE TABLE IF NOT EXISTS club_owners (
    id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT NOT NULL,
    club_id INT NOT NULL,
    role ENUM('owner', 'co-owner', 'admin', 'moderator', 'liaison') DEFAULT 'owner',
    permissions JSON NULL, -- Store permissions as JSON: {"can_edit_club": true, "can_manage_applications": true, "can_send_notifications": true}
    assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_owner_id (owner_id),
    INDEX idx_club_id (club_id),
    INDEX idx_role (role),
    UNIQUE KEY unique_owner_club (owner_id, club_id)
);

-- Create owners table (if not exists separately)
CREATE TABLE IF NOT EXISTS owners (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(100) NULL, -- e.g., "President", "Vice President", "Treasurer"
    phone VARCHAR(20) NULL,
    department VARCHAR(100) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create clubs table (if not exists separately)
CREATE TABLE IF NOT EXISTS clubs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    meeting_time VARCHAR(255) NULL,
    location VARCHAR(255) NULL,
    application_required BOOLEAN DEFAULT FALSE,
    application_deadline DATE NULL,
    audition_required BOOLEAN DEFAULT FALSE,
    cover_image VARCHAR(500) NULL,
    contact_emails JSON NULL, -- Array of email addresses
    application_info TEXT NULL,
    audition_info TEXT NULL,
    metadata JSON NULL, -- Additional metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample owner data
INSERT INTO owners (id, email, first_name, last_name, title, phone, department) VALUES
(1, 'sarah.chen@yale.edu', 'Sarah', 'Chen', 'President', '203-555-0101', 'Political Science'),
(2, 'michael.park@yale.edu', 'Michael', 'Park', 'Vice President', '203-555-0102', 'Political Science'),
(3, 'michael.rodriguez@yale.edu', 'Michael', 'Rodriguez', 'Founder', '203-555-0103', 'Computer Science'),
(4, 'emily.johnson@yale.edu', 'Emily', 'Johnson', 'Editor-in-Chief', '203-555-0104', 'English'),
(5, 'david.kim@yale.edu', 'David', 'Kim', 'President', '203-555-0105', 'Environmental Studies'),
(6, 'jessica.martinez@yale.edu', 'Jessica', 'Martinez', 'Co-President', '203-555-0106', 'Political Science'),
(7, 'robert.chen@yale.edu', 'Robert', 'Chen', 'Co-President', '203-555-0107', 'Political Science'),
(8, 'alex.thompson@yale.edu', 'Alex', 'Thompson', 'Director', '203-555-0108', 'Music'),
(9, 'jane.doe@yale.edu', 'Jane', 'Doe', 'President', '203-555-0109', 'Engineering'),
(10, 'ryan.thompson@yale.edu', 'Ryan', 'Thompson', 'Secretary General', '203-555-0110', 'International Relations');

-- Insert sample club data
INSERT INTO clubs (id, name, description, meeting_time, location, application_required, application_deadline, contact_emails) VALUES
(1, 'Yale Debate Association', 'The Yale Debate Association is one of the oldest and most prestigious debate societies at Yale.', 'Tuesdays, 2:00 PM - 4:00 PM', 'Linsly-Chittenden Hall, Room 101', TRUE, '09/15/2024', '["debate@yale.edu", "sarah.chen@yale.edu"]'),
(2, 'Code4Good', 'Code4Good brings together students passionate about using technology for social impact.', 'Wednesdays, 3:00 PM - 5:00 PM', 'Computer Science Building, Room 203', FALSE, NULL, '["code4good@yale.edu"]'),
(3, 'Yale Daily News', 'The Yale Daily News is the oldest college daily newspaper in the United States.', 'Thursdays, 10:00 AM - 11:30 AM', '202 York Street', TRUE, '12/01/2025', '["editor@yaledailynews.com"]'),
(4, 'Yale Environmental Society', 'The Yale Environmental Society works to promote sustainability on campus.', 'Mondays, 4:00 PM - 5:30 PM', 'Kroon Hall, Room 320', FALSE, NULL, '["environment@yale.edu"]'),
(5, 'Yale Political Union', 'The Yale Political Union is the largest and most active political organization on campus.', 'Fridays, 7:00 PM - 9:00 PM', 'William L. Harkness Hall', TRUE, '12/05/2025', '["ypu@yale.edu"]'),
(6, 'Yale A Cappella Group', 'One of Yale\'s premier a cappella groups, we perform at campus events and tour nationally.', 'Sundays, 2:00 PM - 4:00 PM', 'Woolsey Hall', FALSE, '09/25/2024', '["acappella@yale.edu"]');

-- Insert sample club owner relationships
INSERT INTO club_owners (id, owner_id, club_id, role, permissions, is_primary) VALUES
-- Yale Debate Association - multiple owners
(1, 1, 1, 'owner', '{"can_edit_club": true, "can_manage_applications": true, "can_send_notifications": true, "can_manage_owners": true}', TRUE),
(2, 2, 1, 'co-owner', '{"can_edit_club": true, "can_manage_applications": true, "can_send_notifications": true, "can_manage_owners": false}', FALSE),

-- Code4Good - single owner
(3, 3, 2, 'owner', '{"can_edit_club": true, "can_manage_applications": true, "can_send_notifications": true, "can_manage_owners": true}', TRUE),

-- Yale Daily News - single owner
(4, 4, 3, 'owner', '{"can_edit_club": true, "can_manage_applications": true, "can_send_notifications": true, "can_manage_owners": true}', TRUE),

-- Yale Environmental Society - single owner
(5, 5, 4, 'owner', '{"can_edit_club": true, "can_manage_applications": true, "can_send_notifications": true, "can_manage_owners": true}', TRUE),

-- Yale Political Union - multiple co-owners
(6, 6, 5, 'co-owner', '{"can_edit_club": true, "can_manage_applications": true, "can_send_notifications": true, "can_manage_owners": false}', TRUE),
(7, 7, 5, 'co-owner', '{"can_edit_club": true, "can_manage_applications": true, "can_send_notifications": true, "can_manage_owners": false}', FALSE),

-- Yale A Cappella Group - single owner
(8, 8, 6, 'owner', '{"can_edit_club": true, "can_manage_applications": true, "can_send_notifications": true, "can_manage_owners": true}', TRUE),

-- Additional moderators/admins
(9, 9, 2, 'admin', '{"can_edit_club": false, "can_manage_applications": true, "can_send_notifications": true, "can_manage_owners": false}', FALSE),
(10, 10, 5, 'moderator', '{"can_edit_club": false, "can_manage_applications": false, "can_send_notifications": true, "can_manage_owners": false}', FALSE);

-- Sample queries for API endpoints

-- Get all owners for a specific club
-- SELECT co.*, o.first_name, o.last_name, o.email, o.title, c.name as club_name
-- FROM club_owners co
-- JOIN owners o ON co.owner_id = o.id
-- JOIN clubs c ON co.club_id = c.id
-- WHERE co.club_id = ?;

-- Get all clubs owned by a specific owner
-- SELECT co.*, c.name as club_name, c.description, c.meeting_time, c.location
-- FROM club_owners co
-- JOIN clubs c ON co.club_id = c.id
-- WHERE co.owner_id = ?;

-- Get primary owner for a club
-- SELECT co.*, o.first_name, o.last_name, o.email, o.title
-- FROM club_owners co
-- JOIN owners o ON co.owner_id = o.id
-- WHERE co.club_id = ? AND co.is_primary = TRUE;

-- Check if owner has permission to perform action
-- SELECT permissions->>'$.can_manage_applications' as can_manage_applications
-- FROM club_owners
-- WHERE owner_id = ? AND club_id = ?;

-- Add new owner to club
-- INSERT INTO club_owners (owner_id, club_id, role, permissions, is_primary)
-- VALUES (?, ?, ?, ?, ?);

-- Update owner permissions
-- UPDATE club_owners
-- SET permissions = ?, role = ?
-- WHERE id = ?;

-- Remove owner from club
-- DELETE FROM club_owners
-- WHERE owner_id = ? AND club_id = ?;

