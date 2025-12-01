-- Club Users SQL Schema and Data
-- This file contains the database schema and sample data for club users (students/members)
-- Used for API requests to manage club memberships and applications

-- Create club_users table
CREATE TABLE IF NOT EXISTS club_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    club_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'active', 'inactive') DEFAULT 'pending',
    application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    review_date DATETIME NULL,
    application_text TEXT NULL,
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_club_id (club_id),
    INDEX idx_status (status),
    UNIQUE KEY unique_user_club (user_id, club_id)
);

-- Create users table (if not exists separately)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50) NULL,
    year ENUM('Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate') NULL,
    major VARCHAR(100) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample user data
INSERT INTO users (id, email, first_name, last_name, student_id, year, major) VALUES
(1, 'john.doe@yale.edu', 'John', 'Doe', 'STU001', 'Sophomore', 'Computer Science'),
(2, 'jane.smith@yale.edu', 'Jane', 'Smith', 'STU002', 'Junior', 'Political Science'),
(3, 'michael.johnson@yale.edu', 'Michael', 'Johnson', 'STU003', 'Freshman', 'Engineering'),
(4, 'emily.brown@yale.edu', 'Emily', 'Brown', 'STU004', 'Senior', 'English'),
(5, 'david.wilson@yale.edu', 'David', 'Wilson', 'STU005', 'Sophomore', 'Economics'),
(6, 'sarah.martinez@yale.edu', 'Sarah', 'Martinez', 'STU006', 'Junior', 'Biology'),
(7, 'james.taylor@yale.edu', 'James', 'Taylor', 'STU007', 'Freshman', 'History'),
(8, 'olivia.anderson@yale.edu', 'Olivia', 'Anderson', 'STU008', 'Senior', 'Psychology'),
(9, 'william.thomas@yale.edu', 'William', 'Thomas', 'STU009', 'Sophomore', 'Mathematics'),
(10, 'sophia.jackson@yale.edu', 'Sophia', 'Jackson', 'STU010', 'Junior', 'Chemistry');

-- Insert sample club user data (memberships and applications)
INSERT INTO club_users (id, user_id, club_id, status, application_date, review_date, application_text) VALUES
-- Active members
(1, 1, 1, 'active', '2024-08-15 10:00:00', '2024-08-20 14:30:00', 'I am passionate about debate and have experience in high school debate competitions.'),
(2, 2, 1, 'active', '2024-08-18 11:00:00', '2024-08-22 16:00:00', 'I have been following Yale Debate Association and would love to contribute.'),
(3, 3, 2, 'active', '2024-09-01 09:00:00', NULL, 'I want to use my coding skills for social good.'),
(4, 4, 3, 'active', '2024-08-25 13:00:00', '2024-08-28 10:00:00', 'I have experience writing for my high school newspaper.'),
(5, 5, 4, 'active', '2024-09-05 08:00:00', NULL, 'I am passionate about environmental sustainability.'),

-- Pending applications
(6, 6, 1, 'pending', '2024-11-19 15:00:00', NULL, 'I am interested in joining the debate association. I have participated in Model UN and enjoy structured arguments.'),
(7, 7, 5, 'pending', '2024-11-20 11:00:00', NULL, 'I would like to join the Political Union to engage in political discussions.'),
(8, 8, 2, 'pending', '2024-11-21 14:00:00', NULL, 'I want to contribute to Code4Good projects and learn more about social impact technology.'),

-- Accepted but not yet active
(9, 9, 3, 'accepted', '2024-11-15 10:00:00', '2024-11-18 09:00:00', 'I have strong writing skills and want to join the Yale Daily News team.'),
(10, 10, 5, 'accepted', '2024-11-10 12:00:00', '2024-11-12 15:00:00', 'I am interested in political discourse and would like to be part of the Political Union.'),

-- Rejected applications
(11, 1, 6, 'rejected', '2024-09-20 10:00:00', '2024-09-25 14:00:00', 'I would like to audition for the a cappella group.', 'Did not meet audition requirements.'),
(12, 2, 3, 'rejected', '2024-09-15 11:00:00', '2024-09-18 10:00:00', 'I want to write for the newspaper.', 'Writing samples did not meet editorial standards.');

-- Sample queries for API endpoints

-- Get all applications for a specific club
-- SELECT cu.*, u.first_name, u.last_name, u.email 
-- FROM club_users cu
-- JOIN users u ON cu.user_id = u.id
-- WHERE cu.club_id = ? AND cu.status = 'pending';

-- Get all clubs a user is a member of
-- SELECT cu.*, c.name as club_name, c.owner
-- FROM club_users cu
-- JOIN clubs c ON cu.club_id = c.id
-- WHERE cu.user_id = ? AND cu.status IN ('active', 'accepted');

-- Get application status for a user
-- SELECT cu.*, u.first_name, u.last_name, c.name as club_name
-- FROM club_users cu
-- JOIN users u ON cu.user_id = u.id
-- JOIN clubs c ON cu.club_id = c.id
-- WHERE cu.user_id = ?;

-- Update application status
-- UPDATE club_users 
-- SET status = ?, review_date = NOW(), notes = ?
-- WHERE id = ?;

-- Create new application
-- INSERT INTO club_users (user_id, club_id, status, application_text)
-- VALUES (?, ?, 'pending', ?);

