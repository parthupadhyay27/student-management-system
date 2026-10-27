-- =====================================================================
-- COLLEGE STUDENT MANAGEMENT SYSTEM (SMS)
-- RDBMS Laboratory Project (Course Code: CSC2131)
-- Strict ER Diagram Conformance & Enterprise RDBMS Architecture
-- DBMS: MySQL 8.0+ / MariaDB 10.5+
-- =====================================================================

-- =====================================================================
-- MODULE 1: DATABASE SCHEMA & DDL (Data Definition Language)
-- =====================================================================

DROP DATABASE IF EXISTS `college_sms_db`;
CREATE DATABASE `college_sms_db`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `college_sms_db`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `student_documents`;
DROP TABLE IF EXISTS `student_guardians`;
DROP TABLE IF EXISTS `guardians`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `fee_invoices`;
DROP TABLE IF EXISTS `results`;
DROP TABLE IF EXISTS `exams`;
DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `enrollments`;
DROP TABLE IF EXISTS `sections`;
DROP TABLE IF EXISTS `semesters`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `faculty`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `programs`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `admins`;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. Table: Department
-- Attributes: dept_id (PK), dept_name, location
-- ---------------------------------------------------------------------
CREATE TABLE `departments` (
    `dept_id` INT AUTO_INCREMENT PRIMARY KEY,
    `dept_name` VARCHAR(100) NOT NULL UNIQUE,
    `location` VARCHAR(150) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_dept_name` (`dept_name`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. Table: Program
-- Attributes: program_id (PK), program_name, duration
-- ---------------------------------------------------------------------
CREATE TABLE `programs` (
    `program_id` INT AUTO_INCREMENT PRIMARY KEY,
    `program_name` VARCHAR(100) NOT NULL UNIQUE,
    `duration` INT NOT NULL CHECK (`duration` > 0) COMMENT 'Duration in Years (e.g., 4 for B.Tech)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_program_name` (`program_name`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. Table: Student
-- Attributes: student_id (PK), roll_no, first_name, last_name, dob, 
--             gender, email, phone, address, admission_date, status, 
--             dept_id (FK), program_id (FK)
-- Note: Includes backward-compatible 'name' column and auth credentials.
-- ---------------------------------------------------------------------
CREATE TABLE `students` (
    `student_id` INT AUTO_INCREMENT PRIMARY KEY,
    `roll_no` VARCHAR(30) NOT NULL UNIQUE,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `name` VARCHAR(101) GENERATED ALWAYS AS (CONCAT(`first_name`, ' ', `last_name`)) STORED,
    `dob` DATE NOT NULL,
    `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `phone` VARCHAR(20) DEFAULT NULL,
    `address` TEXT DEFAULT NULL,
    `admission_date` DATE NOT NULL,
    `status` ENUM('Active', 'Inactive', 'Suspended', 'Graduated') NOT NULL DEFAULT 'Active',
    `dept_id` INT NOT NULL,
    `program_id` INT NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL DEFAULT '$2a$10$w0B7GZkFhZqWnfx6iUqyzeKjI6kOhyjA61j7hXwYdI0P5b0Vf0K2C',
    `role` VARCHAR(20) NOT NULL DEFAULT 'student',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_student_dept`
        FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT `fk_student_program`
        FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    INDEX `idx_student_roll` (`roll_no`),
    INDEX `idx_student_email` (`email`),
    INDEX `idx_student_dept` (`dept_id`),
    INDEX `idx_student_program` (`program_id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. Table: Faculty
-- Attributes: faculty_id (PK), name, email, phone, dept_id (FK)
-- ---------------------------------------------------------------------
CREATE TABLE `faculty` (
    `faculty_id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `phone` VARCHAR(20) DEFAULT NULL,
    `dept_id` INT NOT NULL,
    `designation` VARCHAR(100) DEFAULT 'Assistant Professor',
    `password_hash` VARCHAR(255) DEFAULT '$2a$10$w0B7GZkFhZqWnfx6iUqyzeKjI6kOhyjA61j7hXwYdI0P5b0Vf0K2C',
    `role` VARCHAR(20) NOT NULL DEFAULT 'faculty',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_faculty_dept`
        FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    INDEX `idx_faculty_email` (`email`),
    INDEX `idx_faculty_dept` (`dept_id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. Table: Course
-- Attributes: course_id (PK), course_code, course_name, credits, dept_id (FK)
-- STRICT OFFERINGS:
--   1. Data Structure and Algorithm
--   2. Principle of Management
--   3. Relational Database Management System (CSC2131)
--   4. Object Oriented Programming
--   5. Computer Organization
--   6. Statistics and Probability
-- ---------------------------------------------------------------------
CREATE TABLE `courses` (
    `course_id` INT AUTO_INCREMENT PRIMARY KEY,
    `course_code` VARCHAR(20) NOT NULL UNIQUE,
    `course_name` VARCHAR(150) NOT NULL,
    `credits` INT NOT NULL CHECK (`credits` > 0),
    `dept_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_course_dept`
        FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    INDEX `idx_course_code` (`course_code`),
    INDEX `idx_course_dept` (`dept_id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. Table: Semester
-- Attributes: semester_id (PK), semester_no, academic_year, start_date, end_date
-- ---------------------------------------------------------------------
CREATE TABLE `semesters` (
    `semester_id` INT AUTO_INCREMENT PRIMARY KEY,
    `semester_no` INT NOT NULL CHECK (`semester_no` BETWEEN 1 AND 12),
    `academic_year` VARCHAR(20) NOT NULL COMMENT 'e.g., 2025-2026',
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `chk_semester_dates` CHECK (`end_date` > `start_date`),
    CONSTRAINT `uq_semester_year` UNIQUE (`semester_no`, `academic_year`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. Table: Section
-- Attributes: section_id (PK), course_id (FK), semester_id (FK), 
--             faculty_id (FK), section_name, room_no, schedule
-- ---------------------------------------------------------------------
CREATE TABLE `sections` (
    `section_id` INT AUTO_INCREMENT PRIMARY KEY,
    `course_id` INT NOT NULL,
    `semester_id` INT NOT NULL,
    `faculty_id` INT NOT NULL,
    `section_name` VARCHAR(50) NOT NULL COMMENT 'e.g., Section A, Section B',
    `room_no` VARCHAR(50) NOT NULL,
    `schedule` VARCHAR(100) NOT NULL COMMENT 'e.g., Mon/Wed 09:00-10:30',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `uq_course_semester_section` UNIQUE (`course_id`, `semester_id`, `section_name`),
    CONSTRAINT `fk_section_course`
        FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT `fk_section_semester`
        FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`semester_id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT `fk_section_faculty`
        FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    INDEX `idx_section_course` (`course_id`),
    INDEX `idx_section_semester` (`semester_id`),
    INDEX `idx_section_faculty` (`faculty_id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. Table: Enrollment
-- Attributes: enrollment_id (PK), student_id (FK), section_id (FK), 
--             enrollment_date, status
-- ---------------------------------------------------------------------
CREATE TABLE `enrollments` (
    `enrollment_id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `section_id` INT NOT NULL,
    `enrollment_date` DATE NOT NULL,
    `status` ENUM('Enrolled', 'Dropped', 'Completed') NOT NULL DEFAULT 'Enrolled',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `uq_student_section_enrollment` UNIQUE (`student_id`, `section_id`),
    CONSTRAINT `fk_enrollment_student`
        FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_enrollment_section`
        FOREIGN KEY (`section_id`) REFERENCES `sections` (`section_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    INDEX `idx_enrollment_student` (`student_id`),
    INDEX `idx_enrollment_section` (`section_id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. Table: Attendance
-- Attributes: attendance_id (PK), student_id (FK), section_id (FK), 
--             attendance_date, status
-- ---------------------------------------------------------------------
CREATE TABLE `attendance` (
    `attendance_id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `section_id` INT NOT NULL,
    `attendance_date` DATE NOT NULL,
    `status` ENUM('Present', 'Absent', 'Late', 'Excused') NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `uq_student_section_date` UNIQUE (`student_id`, `section_id`, `attendance_date`),
    CONSTRAINT `fk_attendance_student`
        FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_attendance_section`
        FOREIGN KEY (`section_id`) REFERENCES `sections` (`section_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    INDEX `idx_attendance_student` (`student_id`),
    INDEX `idx_attendance_section` (`section_id`),
    INDEX `idx_attendance_date` (`attendance_date`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 10. Table: Exam
-- Attributes: exam_id (PK), section_id (FK), exam_type, exam_date, max_marks
-- ---------------------------------------------------------------------
CREATE TABLE `exams` (
    `exam_id` INT AUTO_INCREMENT PRIMARY KEY,
    `section_id` INT NOT NULL,
    `exam_type` ENUM('Quiz', 'Midterm', 'Final', 'Assignment', 'Lab') NOT NULL,
    `exam_date` DATE NOT NULL,
    `max_marks` DECIMAL(5, 2) NOT NULL CHECK (`max_marks` > 0),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_exam_section`
        FOREIGN KEY (`section_id`) REFERENCES `sections` (`section_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    INDEX `idx_exam_section` (`section_id`),
    INDEX `idx_exam_date` (`exam_date`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 11. Table: Result
-- Attributes: result_id (PK), exam_id (FK), student_id (FK), 
--             marks_obtained, grade
-- ---------------------------------------------------------------------
CREATE TABLE `results` (
    `result_id` INT AUTO_INCREMENT PRIMARY KEY,
    `exam_id` INT NOT NULL,
    `student_id` INT NOT NULL,
    `marks_obtained` DECIMAL(5, 2) NOT NULL CHECK (`marks_obtained` >= 0),
    `grade` VARCHAR(5) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `uq_exam_student_result` UNIQUE (`exam_id`, `student_id`),
    CONSTRAINT `fk_result_exam`
        FOREIGN KEY (`exam_id`) REFERENCES `exams` (`exam_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_result_student`
        FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    INDEX `idx_result_exam` (`exam_id`),
    INDEX `idx_result_student` (`student_id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 12. Table: Fee_Invoice
-- Attributes: invoice_id (PK), student_id (FK), total_amount, due_date, status
-- ---------------------------------------------------------------------
CREATE TABLE `fee_invoices` (
    `invoice_id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL CHECK (`total_amount` >= 0),
    `due_date` DATE NOT NULL,
    `status` ENUM('Unpaid', 'Partially Paid', 'Paid', 'Overdue') NOT NULL DEFAULT 'Unpaid',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_fee_student`
        FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    INDEX `idx_fee_student` (`student_id`),
    INDEX `idx_fee_status` (`status`),
    INDEX `idx_fee_due_date` (`due_date`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 13. Table: Payment
-- Attributes: payment_id (PK), invoice_id (FK), amount_paid, payment_date, 
--             method, transaction_ref
-- ---------------------------------------------------------------------
CREATE TABLE `payments` (
    `payment_id` INT AUTO_INCREMENT PRIMARY KEY,
    `invoice_id` INT NOT NULL,
    `amount_paid` DECIMAL(10, 2) NOT NULL CHECK (`amount_paid` > 0),
    `payment_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `method` ENUM('Credit Card', 'Debit Card', 'Bank Transfer', 'Cash', 'UPI', 'Cheque') NOT NULL,
    `transaction_ref` VARCHAR(100) NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_payment_invoice`
        FOREIGN KEY (`invoice_id`) REFERENCES `fee_invoices` (`invoice_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    INDEX `idx_payment_invoice` (`invoice_id`),
    INDEX `idx_payment_ref` (`transaction_ref`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 14. Table: Guardian
-- Attributes: guardian_id (PK), name, phone, email, relation
-- ---------------------------------------------------------------------
CREATE TABLE `guardians` (
    `guardian_id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) DEFAULT NULL,
    `relation` VARCHAR(50) NOT NULL COMMENT 'e.g., Father, Mother, Legal Guardian',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_guardian_phone` (`phone`),
    INDEX `idx_guardian_email` (`email`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 15. Table: Student_Guardian (M:N Junction Table)
-- Attributes: student_id (FK), guardian_id (FK)
-- ---------------------------------------------------------------------
CREATE TABLE `student_guardians` (
    `student_id` INT NOT NULL,
    `guardian_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`student_id`, `guardian_id`),
    CONSTRAINT `fk_sg_student`
        FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_sg_guardian`
        FOREIGN KEY (`guardian_id`) REFERENCES `guardians` (`guardian_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    INDEX `idx_sg_student` (`student_id`),
    INDEX `idx_sg_guardian` (`guardian_id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 16. Table: Student_Document
-- Attributes: document_id (PK), student_id (FK), document_type, 
--             document_path, submission_date
-- ---------------------------------------------------------------------
CREATE TABLE `student_documents` (
    `document_id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `document_type` VARCHAR(100) NOT NULL COMMENT 'e.g., High School Transcript, ID Proof, Medical Certificate',
    `document_path` VARCHAR(255) NOT NULL,
    `submission_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_doc_student`
        FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    INDEX `idx_doc_student` (`student_id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- System Table: Admins (Administrative Access & RBAC)
-- ---------------------------------------------------------------------
CREATE TABLE `admins` (
    `admin_id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'admin',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_admin_username` (`username`)
) ENGINE=InnoDB;


-- =====================================================================
-- MODULE 2: TABLE ALTERATION & PERFORMANCE INDEXING
-- =====================================================================

-- 1. Table Alteration: Add blood_group column to students table
ALTER TABLE `students` 
ADD COLUMN `blood_group` VARCHAR(5) NULL AFTER `address`;

-- 2. Performance Optimization Indexes:
-- Optimized for high-frequency search, join conditions, and analytical reporting
CREATE INDEX `idx_perf_students_roll_no` ON `students` (`roll_no`);
CREATE INDEX `idx_perf_courses_course_code` ON `courses` (`course_code`);
CREATE INDEX `idx_perf_enrollment_composite` ON `enrollments` (`student_id`, `section_id`);
CREATE INDEX `idx_perf_attendance_date_status` ON `attendance` (`attendance_date`, `status`);
CREATE INDEX `idx_perf_fee_invoices_status_due` ON `fee_invoices` (`status`, `due_date`);


-- =====================================================================
-- MODULE 3: DATA MANIPULATION LANGUAGE (DML) & POPULATION
-- Note: Courses are strictly the 6 required subjects.
-- =====================================================================

-- 1. Departments
INSERT INTO `departments` (`dept_id`, `dept_name`, `location`) VALUES
(1, 'Computer Science and Engineering', 'Turing Hall, Building A'),
(2, 'Electrical and Electronics Engineering', 'Tesla Complex, Building B'),
(3, 'Mechanical Engineering', 'Watt Pavilion, Building C'),
(4, 'Business Administration', 'Drucker Management Center, Building D');

-- 2. Programs
INSERT INTO `programs` (`program_id`, `program_name`, `duration`) VALUES
(1, 'Bachelor of Technology (B.Tech - CSE)', 4),
(2, 'Master of Technology (M.Tech - CSE)', 2),
(3, 'Bachelor of Business Administration (BBA)', 3),
(4, 'Master of Business Administration (MBA)', 2);

-- 3. Faculty Members
INSERT INTO `faculty` (`faculty_id`, `name`, `email`, `phone`, `dept_id`, `designation`) VALUES
(1, 'Dr. Alan Turing', 'alan.turing@college.edu', '+1-555-0101', 1, 'Professor & Chair (RDBMS Specialist)'),
(2, 'Dr. Ada Lovelace', 'ada.lovelace@college.edu', '+1-555-0102', 1, 'Associate Professor (DSA / OOP)'),
(3, 'Dr. John von Neumann', 'von.neumann@college.edu', '+1-555-0103', 1, 'Professor (Computer Organization)'),
(4, 'Dr. Ronald Fisher', 'ronald.fisher@college.edu', '+1-555-0104', 1, 'Associate Professor (Statistics)'),
(5, 'Dr. Peter Drucker', 'peter.drucker@college.edu', '+1-555-0105', 4, 'Professor (Management)');

-- ---------------------------------------------------------------------
-- 4. Course Offerings (STRICTLY POPULATED WITH THE 6 MANDATORY SUBJECTS)
-- ---------------------------------------------------------------------
INSERT INTO `courses` (`course_id`, `course_code`, `course_name`, `credits`, `dept_id`) VALUES
(1, 'CS201',   'Data Structure and Algorithm',              4, 1),
(2, 'MG201',   'Principle of Management',                  3, 4),
(3, 'CSC2131', 'Relational Database Management System',    4, 1),
(4, 'CS202',   'Object Oriented Programming',              4, 1),
(5, 'CS203',   'Computer Organization',                    4, 1),
(6, 'MA201',   'Statistics and Probability',               3, 1);

-- 5. Semesters
INSERT INTO `semesters` (`semester_id`, `semester_no`, `academic_year`, `start_date`, `end_date`) VALUES
(1, 3, '2025-2026', '2025-08-01', '2025-12-15'),
(2, 4, '2025-2026', '2026-01-10', '2026-05-25');

-- 6. Sections (Scheduled across the 6 subjects)
INSERT INTO `sections` (`section_id`, `course_id`, `semester_id`, `faculty_id`, `section_name`, `room_no`, `schedule`) VALUES
(1, 1, 1, 2, 'Section A', 'Lab 201 - Algorithms', 'Mon/Wed 09:00 - 10:30'),
(2, 2, 1, 5, 'Section A', 'Hall 402 - Management', 'Tue/Thu 11:00 - 12:30'),
(3, 3, 1, 1, 'Section A', 'Lab 101 - RDBMS Lab',   'Mon/Wed 14:00 - 15:30'),
(4, 4, 1, 2, 'Section A', 'Lab 204 - OOP Lab',     'Tue/Thu 14:00 - 15:30'),
(5, 5, 1, 3, 'Section A', 'Room 301 - Architecture', 'Fri 09:00 - 12:00'),
(6, 6, 1, 4, 'Section A', 'Room 105 - Mathematics',  'Mon/Wed 11:00 - 12:30');

-- 7. Students
INSERT INTO `students` (`student_id`, `roll_no`, `first_name`, `last_name`, `dob`, `gender`, `email`, `phone`, `address`, `blood_group`, `admission_date`, `status`, `dept_id`, `program_id`) VALUES
(1, 'CSC2025001', 'Parth',  'Sharma',   '2004-05-15', 'Male',   'parth.sharma@student.college.edu',   '+1-555-1101', '742 Evergreen Terrace, Techville', 'O+', '2025-07-15', 'Active', 1, 1),
(2, 'CSC2025002', 'Sophia', 'Chen',     '2004-08-22', 'Female', 'sophia.chen@student.college.edu',   '+1-555-1102', '128 Silicon Boulevard, Metro City', 'A+', '2025-07-15', 'Active', 1, 1),
(3, 'CSC2025003', 'Marcus', 'Aurelius', '2003-11-09', 'Male',   'marcus.aurelius@student.college.edu', '+1-555-1103', '10 Capitol Hill, Ancient Way',      'B+', '2025-07-16', 'Active', 1, 1),
(4, 'CSC2025004', 'Elena',  'Rostova',  '2004-03-30', 'Female', 'elena.rostova@student.college.edu',  '+1-555-1104', '55 Industrial Parkway, Gear City',  'AB+','2025-07-16', 'Active', 1, 1),
(5, 'CSC2025005', 'Aarav',  'Patel',    '2004-01-18', 'Male',   'aarav.patel@student.college.edu',    '+1-555-1105', '99 Innovation Way, Techville',      'O-', '2025-07-17', 'Active', 1, 1);

-- 8. Enrollments (Enrolling students into the 6 subjects)
INSERT INTO `enrollments` (`enrollment_id`, `student_id`, `section_id`, `enrollment_date`, `status`) VALUES
(1,  1, 1, '2025-08-01', 'Enrolled'), -- Parth in DSA
(2,  1, 2, '2025-08-01', 'Enrolled'), -- Parth in POM
(3,  1, 3, '2025-08-01', 'Enrolled'), -- Parth in RDBMS (CSC2131)
(4,  1, 4, '2025-08-01', 'Enrolled'), -- Parth in OOP
(5,  1, 5, '2025-08-01', 'Enrolled'), -- Parth in Computer Org
(6,  1, 6, '2025-08-01', 'Enrolled'), -- Parth in Stats
(7,  2, 1, '2025-08-01', 'Enrolled'), -- Sophia in DSA
(8,  2, 3, '2025-08-01', 'Enrolled'), -- Sophia in RDBMS
(9,  3, 3, '2025-08-02', 'Enrolled'), -- Marcus in RDBMS
(10, 4, 3, '2025-08-02', 'Enrolled'), -- Elena in RDBMS
(11, 5, 3, '2025-08-02', 'Enrolled'); -- Aarav in RDBMS

-- 9. Attendance Logs
INSERT INTO `attendance` (`attendance_id`, `student_id`, `section_id`, `attendance_date`, `status`) VALUES
(1,  1, 3, '2025-08-11', 'Present'), -- Parth in RDBMS
(2,  1, 3, '2025-08-13', 'Present'),
(3,  1, 3, '2025-08-18', 'Present'),
(4,  1, 3, '2025-08-20', 'Late'),
(5,  2, 3, '2025-08-11', 'Present'), -- Sophia in RDBMS
(6,  2, 3, '2025-08-13', 'Absent'),
(7,  3, 3, '2025-08-11', 'Absent'),  -- Marcus in RDBMS (low attendance)
(8,  3, 3, '2025-08-13', 'Absent'),
(9,  4, 3, '2025-08-11', 'Present'),
(10, 5, 3, '2025-08-11', 'Present');

-- 10. Exams
INSERT INTO `exams` (`exam_id`, `section_id`, `exam_type`, `exam_date`, `max_marks`) VALUES
(1, 3, 'Midterm', '2025-10-15', 100.00), -- CSC2131 RDBMS Midterm
(2, 3, 'Final',   '2025-12-10', 100.00), -- CSC2131 RDBMS Final
(3, 1, 'Midterm', '2025-10-18', 100.00), -- CS201 DSA Midterm
(4, 4, 'Midterm', '2025-10-20', 100.00), -- CS202 OOP Midterm
(5, 2, 'Final',   '2025-12-14', 100.00); -- MG201 Management Final

-- 11. Results
INSERT INTO `results` (`result_id`, `exam_id`, `student_id`, `marks_obtained`, `grade`) VALUES
(1, 1, 1, 95.00, 'A+'), -- Parth in RDBMS Midterm
(2, 1, 2, 88.00, 'A'),  -- Sophia in RDBMS Midterm
(3, 1, 3, 72.50, 'B'),  -- Marcus in RDBMS Midterm
(4, 1, 4, 61.00, 'C'),  -- Elena in RDBMS Midterm
(5, 1, 5, 84.00, 'A-'), -- Aarav in RDBMS Midterm
(6, 2, 1, 93.00, 'A+'), -- Parth in RDBMS Final
(7, 3, 1, 91.50, 'A+'), -- Parth in DSA Midterm
(8, 4, 1, 89.00, 'A'),  -- Parth in OOP Midterm
(9, 5, 1, 94.00, 'A+'); -- Parth in POM Final

-- 12. Fee Invoices
INSERT INTO `fee_invoices` (`invoice_id`, `student_id`, `total_amount`, `due_date`, `status`) VALUES
(1, 1, 4500.00, '2025-09-01', 'Paid'),
(2, 1, 4500.00, '2026-02-01', 'Unpaid'),
(3, 2, 4500.00, '2025-09-01', 'Paid'),
(4, 3, 4200.00, '2025-08-15', 'Overdue'),         -- Defaulter: 0 payments
(5, 4, 4300.00, '2025-08-15', 'Partially Paid');  -- Partial payment

-- 13. Payments
INSERT INTO `payments` (`payment_id`, `invoice_id`, `amount_paid`, `payment_date`, `method`, `transaction_ref`) VALUES
(1, 1, 4500.00, '2025-08-20 14:32:00', 'Credit Card',   'TXN-20250820-99412'),
(2, 3, 4500.00, '2025-08-22 10:15:30', 'Bank Transfer', 'TXN-20250822-11029'),
(3, 5, 2150.00, '2025-08-25 16:45:12', 'UPI',           'UPI-20250825-44391');

-- 14. Guardians
INSERT INTO `guardians` (`guardian_id`, `name`, `phone`, `email`, `relation`) VALUES
(1, 'Rajesh Sharma', '+1-555-9001', 'rajesh.sharma@parent.org', 'Father'),
(2, 'Sunita Sharma', '+1-555-9002', 'sunita.sharma@parent.org', 'Mother'),
(3, 'David Chen',    '+1-555-9003', 'david.chen@parent.org',    'Father'),
(4, 'Flavius Aurelius', '+1-555-9004', 'flavius@parent.org',    'Guardian');

-- 15. Student_Guardians (M:N)
INSERT INTO `student_guardians` (`student_id`, `guardian_id`) VALUES
(1, 1),
(1, 2),
(2, 3),
(3, 4);

-- 16. Student_Documents
INSERT INTO `student_documents` (`document_id`, `student_id`, `document_type`, `document_path`, `submission_date`) VALUES
(1, 1, 'High School Certificate', '/uploads/documents/parth_highschool.pdf', '2025-07-16 11:00:00'),
(2, 1, 'Government ID Proof',     '/uploads/documents/parth_passport.pdf',   '2025-07-16 11:05:00'),
(3, 2, 'High School Certificate', '/uploads/documents/sophia_transcript.pdf', '2025-07-17 14:20:00'),
(4, 3, 'Transfer Certificate',    '/uploads/documents/marcus_tc.pdf',          '2025-07-18 09:30:00');

-- 17. System Admins
INSERT INTO `admins` (`admin_id`, `username`, `email`, `password_hash`, `role`) VALUES
(1, 'superadmin', 'admin@college.edu', '$2a$10$w0B7GZkFhZqWnfx6iUqyzeKjI6kOhyjA61j7hXwYdI0P5b0Vf0K2C', 'admin');


-- =====================================================================
-- MODULE 3 (PART B): ADVANCED & COMPLEX SQL QUERIES
-- =====================================================================

-- Query 1: Comprehensive Multi-Table Inner Join (Student Enrollment & Faculty Schedule Matrix)
SELECT 
    s.roll_no,
    s.name AS student_name,
    c.course_code,
    c.course_name,
    c.credits,
    f.name AS faculty_name,
    sec.section_name,
    sec.room_no,
    sec.schedule,
    sem.academic_year,
    sem.semester_no
FROM `students` s
INNER JOIN `enrollments` e ON s.student_id = e.student_id
INNER JOIN `sections` sec ON e.section_id = sec.section_id
INNER JOIN `courses` c ON sec.course_id = c.course_id
INNER JOIN `faculty` f ON sec.faculty_id = f.faculty_id
INNER JOIN `semesters` sem ON sec.semester_id = sem.semester_id
WHERE e.status = 'Enrolled'
ORDER BY s.roll_no, c.course_code;

-- Query 2: Multi-Table Outer Join (Faculty Teaching Load and Unassigned Faculty)
SELECT 
    f.faculty_id,
    f.name AS faculty_name,
    d.dept_name,
    c.course_code,
    c.course_name,
    sec.section_name,
    sec.room_no
FROM `faculty` f
LEFT JOIN `sections` sec ON f.faculty_id = sec.faculty_id
LEFT JOIN `courses` c ON sec.course_id = c.course_id
INNER JOIN `departments` d ON f.dept_id = d.dept_id
ORDER BY f.faculty_id, c.course_code;

-- Query 3: Department-wise Analytics with Aggregate Functions, GROUP BY & HAVING
SELECT 
    d.dept_id,
    d.dept_name,
    COUNT(DISTINCT s.student_id) AS total_active_students,
    COUNT(DISTINCT f.faculty_id) AS total_faculty,
    ROUND(AVG(p.duration), 1) AS avg_program_duration_years,
    COUNT(DISTINCT c.course_id) AS total_courses_offered
FROM `departments` d
LEFT JOIN `students` s ON d.dept_id = s.dept_id AND s.status = 'Active'
LEFT JOIN `faculty` f ON d.dept_id = f.dept_id
LEFT JOIN `courses` c ON d.dept_id = c.dept_id
LEFT JOIN `programs` p ON s.program_id = p.program_id
GROUP BY d.dept_id, d.dept_name
HAVING COUNT(DISTINCT s.student_id) > 0
ORDER BY total_active_students DESC;

-- Query 4: Course-wise Examination Statistical Breakdown (COUNT, SUM, AVG, MIN, MAX, HAVING)
SELECT 
    c.course_code,
    c.course_name,
    ex.exam_type,
    COUNT(r.result_id) AS total_candidates,
    ROUND(MIN(r.marks_obtained), 2) AS lowest_mark,
    ROUND(MAX(r.marks_obtained), 2) AS highest_mark,
    ROUND(AVG(r.marks_obtained), 2) AS class_average,
    ROUND(AVG((r.marks_obtained / ex.max_marks) * 100), 2) AS class_average_pct
FROM `results` r
INNER JOIN `exams` ex ON r.exam_id = ex.exam_id
INNER JOIN `sections` sec ON ex.section_id = sec.section_id
INNER JOIN `courses` c ON sec.course_id = c.course_id
GROUP BY c.course_code, c.course_name, ex.exam_type, ex.max_marks
HAVING AVG(r.marks_obtained) >= 60.00
ORDER BY class_average_pct DESC;

-- Query 5: Attendance Report with Threshold Filter (< 75% Critical Shortage)
SELECT 
    s.student_id,
    s.roll_no,
    s.name AS student_name,
    c.course_code,
    c.course_name,
    COUNT(a.attendance_id) AS total_sessions_conducted,
    SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS attended_sessions,
    ROUND(
        (SUM(CASE WHEN a.status = 'Present' THEN 1 WHEN a.status = 'Late' THEN 0.5 ELSE 0 END) / 
        NULLIF(COUNT(a.attendance_id), 0)) * 100, 
        2
    ) AS attendance_percentage
FROM `attendance` a
INNER JOIN `students` s ON a.student_id = s.student_id
INNER JOIN `sections` sec ON a.section_id = sec.section_id
INNER JOIN `courses` c ON sec.course_id = c.course_id
GROUP BY s.student_id, s.roll_no, s.name, c.course_code, c.course_name
HAVING attendance_percentage < 75.00
ORDER BY attendance_percentage ASC;

-- Query 6: Correlated Subquery - Fee Defaulters Audit List
SELECT 
    s.student_id,
    s.roll_no,
    s.name AS student_name,
    s.email,
    s.phone,
    fi.invoice_id,
    fi.total_amount AS billed_amount,
    fi.due_date,
    fi.status AS invoice_status,
    (
        SELECT COALESCE(SUM(p.amount_paid), 0.00)
        FROM `payments` p
        WHERE p.invoice_id = fi.invoice_id
    ) AS amount_paid_to_date,
    (
        fi.total_amount - (
            SELECT COALESCE(SUM(p.amount_paid), 0.00)
            FROM `payments` p
            WHERE p.invoice_id = fi.invoice_id
        )
    ) AS outstanding_dues
FROM `students` s
INNER JOIN `fee_invoices` fi ON s.student_id = fi.student_id
WHERE fi.status IN ('Unpaid', 'Overdue', 'Partially Paid')
  AND fi.due_date <= CURRENT_DATE()
  AND fi.total_amount > (
        SELECT COALESCE(SUM(p.amount_paid), 0.00)
        FROM `payments` p
        WHERE p.invoice_id = fi.invoice_id
  )
ORDER BY outstanding_dues DESC;

-- Query 7: Correlated Subquery - Top Performers in CSC2131 (Scoring Above Subject Mean)
SELECT 
    s.roll_no,
    s.name AS student_name,
    c.course_code,
    c.course_name,
    ex.exam_type,
    r.marks_obtained,
    r.grade
FROM `results` r
INNER JOIN `students` s ON r.student_id = s.student_id
INNER JOIN `exams` ex ON r.exam_id = ex.exam_id
INNER JOIN `sections` sec ON ex.section_id = sec.section_id
INNER JOIN `courses` c ON sec.course_id = c.course_id
WHERE c.course_code = 'CSC2131'
  AND r.marks_obtained > (
      -- Correlated subquery computing exam average for this specific exam
      SELECT AVG(sub_r.marks_obtained)
      FROM `results` sub_r
      WHERE sub_r.exam_id = r.exam_id
  )
ORDER BY r.marks_obtained DESC;


-- =====================================================================
-- MODULE 4: VIEWS & SECURITY (TCL & ACCESS CONTROL)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Database View: StudentSummaryView
-- Simplifies multi-table joins for students, department, enrolled courses,
-- total credits, and overall attendance percentage
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW `StudentSummaryView` AS
SELECT 
    s.student_id,
    s.roll_no,
    s.first_name,
    s.last_name,
    s.name AS full_name,
    s.email,
    s.status AS student_status,
    d.dept_name,
    p.program_name,
    COUNT(DISTINCT e.enrollment_id) AS total_enrolled_courses,
    COALESCE(SUM(c.credits), 0) AS total_registered_credits,
    ROUND(
        (COUNT(CASE WHEN a.status = 'Present' THEN 1 END) * 100.0) / 
        NULLIF(COUNT(a.attendance_id), 0), 
        2
    ) AS overall_attendance_pct
FROM `students` s
INNER JOIN `departments` d ON s.dept_id = d.dept_id
INNER JOIN `programs` p ON s.program_id = p.program_id
LEFT JOIN `enrollments` e ON s.student_id = e.student_id AND e.status = 'Enrolled'
LEFT JOIN `sections` sec ON e.section_id = sec.section_id
LEFT JOIN `courses` c ON sec.course_id = c.course_id
LEFT JOIN `attendance` a ON s.student_id = a.student_id
GROUP BY s.student_id, s.roll_no, s.first_name, s.last_name, s.name, s.email, s.status, d.dept_name, p.program_name;

-- ---------------------------------------------------------------------
-- 2. Database View: FeeStatusView
-- Comprehensive financial ledger view for accounts & audit
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW `FeeStatusView` AS
SELECT 
    fi.invoice_id,
    s.student_id,
    s.roll_no,
    s.name AS student_name,
    d.dept_name,
    fi.total_amount AS invoice_amount,
    fi.due_date,
    fi.status AS invoice_status,
    COALESCE(SUM(p.amount_paid), 0.00) AS total_amount_paid,
    (fi.total_amount - COALESCE(SUM(p.amount_paid), 0.00)) AS outstanding_balance,
    CASE 
        WHEN (fi.total_amount - COALESCE(SUM(p.amount_paid), 0.00)) <= 0 THEN 'CLEARED'
        WHEN fi.due_date < CURRENT_DATE() THEN 'DEFAULTED / OVERDUE'
        ELSE 'PENDING'
    END AS financial_standing
FROM `fee_invoices` fi
INNER JOIN `students` s ON fi.student_id = s.student_id
INNER JOIN `departments` d ON s.dept_id = d.dept_id
LEFT JOIN `payments` p ON fi.invoice_id = p.invoice_id
GROUP BY fi.invoice_id, s.student_id, s.roll_no, s.name, d.dept_name, fi.total_amount, fi.due_date, fi.status;

-- ---------------------------------------------------------------------
-- 3. Transaction Control Language (TCL) Demonstration
-- Illustrating ACID properties with COMMIT, ROLLBACK and SAVEPOINT
-- ---------------------------------------------------------------------
START TRANSACTION;

-- Step A: Insert a new fee invoice for student 2
INSERT INTO `fee_invoices` (`student_id`, `total_amount`, `due_date`, `status`)
VALUES (2, 3000.00, '2026-03-01', 'Unpaid');

-- Set Savepoint after invoice generation
SAVEPOINT sp_invoice_created;

-- Step B: Insert payment
INSERT INTO `payments` (`invoice_id`, `amount_paid`, `payment_date`, `method`, `transaction_ref`)
VALUES (LAST_INSERT_ID(), 1500.00, NOW(), 'UPI', 'TXN-TCL-DEMO-001');

-- Demonstrate ROLLBACK to Savepoint (e.g., if gateway validation failed)
-- ROLLBACK TO SAVEPOINT sp_invoice_created;

-- Step C: Commit the transaction permanently
COMMIT;

-- ---------------------------------------------------------------------
-- 4. User Access Control (DCL: CREATE USER, GRANT, REVOKE)
-- ---------------------------------------------------------------------
-- Create a specialized clerk user
DROP USER IF EXISTS 'college_clerk'@'localhost';
CREATE USER 'college_clerk'@'localhost' IDENTIFIED BY 'ClerkSecurePass!2026';

-- Grant selective privileges adhering to Principle of Least Privilege
GRANT SELECT, INSERT, UPDATE ON `college_sms_db`.`students` TO 'college_clerk'@'localhost';
GRANT SELECT, INSERT ON `college_sms_db`.`attendance` TO 'college_clerk'@'localhost';
GRANT SELECT ON `college_sms_db`.`FeeStatusView` TO 'college_clerk'@'localhost';
GRANT SELECT ON `college_sms_db`.`StudentSummaryView` TO 'college_clerk'@'localhost';

-- Apply privilege updates
FLUSH PRIVILEGES;

-- Demonstrate Revoking a Privilege
REVOKE UPDATE ON `college_sms_db`.`students` FROM 'college_clerk'@'localhost';
FLUSH PRIVILEGES;


-- =====================================================================
-- MODULE 5: ADVANCED PL/SQL, STORED PROCEDURES & TRIGGERS
-- =====================================================================

DELIMITER $$

-- ---------------------------------------------------------------------
-- 1. Stored Procedure: GenerateStudentReportCard
-- Purpose: Generates an official academic transcript/report card for a student
--          including detailed subject breakdown (e.g. CSC2131, DSA),
--          individual exam performance, total credits, and Semester GPA.
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `GenerateStudentReportCard`$$
CREATE PROCEDURE `GenerateStudentReportCard`(
    IN `p_student_id` INT,
    IN `p_semester_id` INT
)
BEGIN
    -- Section 1: Student & Academic Registry Metadata
    SELECT 
        s.student_id,
        s.roll_no,
        s.name AS student_name,
        s.dob,
        s.email,
        d.dept_name,
        p.program_name,
        sem.semester_no,
        sem.academic_year
    FROM `students` s
    INNER JOIN `departments` d ON s.dept_id = d.dept_id
    INNER JOIN `programs` p ON s.program_id = p.program_id
    CROSS JOIN `semesters` sem
    WHERE s.student_id = p_student_id 
      AND sem.semester_id = p_semester_id;

    -- Section 2: Detailed Course Performance & Grade Card
    SELECT 
        c.course_code,
        c.course_name,
        c.credits,
        ex.exam_type,
        ex.exam_date,
        ex.max_marks,
        r.marks_obtained,
        ROUND((r.marks_obtained / ex.max_marks) * 100, 2) AS percentage,
        r.grade,
        CASE 
            WHEN r.grade = 'A+' THEN 10.0
            WHEN r.grade = 'A'  THEN 9.0
            WHEN r.grade = 'A-' THEN 8.5
            WHEN r.grade = 'B+' THEN 8.0
            WHEN r.grade = 'B'  THEN 7.0
            WHEN r.grade = 'C+' THEN 6.0
            WHEN r.grade = 'C'  THEN 5.0
            ELSE 0.0
        END AS grade_point
    FROM `results` r
    INNER JOIN `exams` ex ON r.exam_id = ex.exam_id
    INNER JOIN `sections` sec ON ex.section_id = sec.section_id
    INNER JOIN `courses` c ON sec.course_id = c.course_id
    WHERE r.student_id = p_student_id
      AND sec.semester_id = p_semester_id
    ORDER BY c.course_code ASC, ex.exam_date ASC;

    -- Section 3: Aggregate Semester GPA & Total Credits Earned
    SELECT 
        COUNT(DISTINCT c.course_id) AS total_courses_evaluated,
        SUM(c.credits) AS total_credits_enrolled,
        ROUND(AVG((r.marks_obtained / ex.max_marks) * 100), 2) AS overall_semester_percentage,
        ROUND(
            SUM(
                c.credits * (
                    CASE 
                        WHEN r.grade = 'A+' THEN 10.0
                        WHEN r.grade = 'A'  THEN 9.0
                        WHEN r.grade = 'A-' THEN 8.5
                        WHEN r.grade = 'B+' THEN 8.0
                        WHEN r.grade = 'B'  THEN 7.0
                        WHEN r.grade = 'C+' THEN 6.0
                        WHEN r.grade = 'C'  THEN 5.0
                        ELSE 0.0
                    END
                )
            ) / NULLIF(SUM(c.credits), 0), 
            2
        ) AS semester_sgpa
    FROM `results` r
    INNER JOIN `exams` ex ON r.exam_id = ex.exam_id
    INNER JOIN `sections` sec ON ex.section_id = sec.section_id
    INNER JOIN `courses` c ON sec.course_id = c.course_id
    WHERE r.student_id = p_student_id
      AND sec.semester_id = p_semester_id;
END$$

-- ---------------------------------------------------------------------
-- 2. Stored Procedure: GetStudentCompleteProfile (Enterprise 360-Degree)
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `GetStudentCompleteProfile`$$
CREATE PROCEDURE `GetStudentCompleteProfile`(
    IN `input_student_id` INT
)
BEGIN
    -- 1. Demographics & Academic Program
    SELECT 
        s.student_id, s.roll_no, s.first_name, s.last_name, s.name, s.dob, 
        s.gender, s.email, s.phone, s.address, s.blood_group, s.admission_date, 
        s.status, d.dept_id, d.dept_name, d.location AS dept_location,
        p.program_id, p.program_name, p.duration AS program_duration_years
    FROM `students` s
    INNER JOIN `departments` d ON s.dept_id = d.dept_id
    INNER JOIN `programs` p ON s.program_id = p.program_id
    WHERE s.student_id = input_student_id;

    -- 2. Enrolled Courses & Sections
    SELECT 
        e.enrollment_id, e.enrollment_date, e.status AS enrollment_status,
        sec.section_id, sec.section_name, sec.room_no, sec.schedule,
        c.course_id, c.course_code, c.course_name, c.credits,
        sem.semester_id, sem.semester_no, sem.academic_year,
        f.faculty_id, f.name AS faculty_name
    FROM `enrollments` e
    INNER JOIN `sections` sec ON e.section_id = sec.section_id
    INNER JOIN `courses` c ON sec.course_id = c.course_id
    INNER JOIN `semesters` sem ON sec.semester_id = sem.semester_id
    INNER JOIN `faculty` f ON sec.faculty_id = f.faculty_id
    WHERE e.student_id = input_student_id
    ORDER BY c.course_code ASC;

    -- 3. Attendance Summary
    SELECT 
        COUNT(a.attendance_id) AS total_sessions,
        SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS present_count,
        SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) AS late_count,
        SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
        ROUND(
            (SUM(CASE WHEN a.status = 'Present' THEN 1 WHEN a.status = 'Late' THEN 0.5 ELSE 0 END) / 
            NULLIF(COUNT(a.attendance_id), 0)) * 100, 
            2
        ) AS attendance_percentage
    FROM `attendance` a
    WHERE a.student_id = input_student_id;

    -- 4. Results & Grades
    SELECT 
        r.result_id, r.marks_obtained, r.grade, ex.exam_type, ex.max_marks,
        ROUND((r.marks_obtained / ex.max_marks) * 100, 2) AS percentage,
        c.course_code, c.course_name
    FROM `results` r
    INNER JOIN `exams` ex ON r.exam_id = ex.exam_id
    INNER JOIN `sections` sec ON ex.section_id = sec.section_id
    INNER JOIN `courses` c ON sec.course_id = c.course_id
    WHERE r.student_id = input_student_id;

    -- 5. Financial Ledger & Invoices
    SELECT 
        fi.invoice_id, fi.total_amount, fi.due_date, fi.status,
        COALESCE(SUM(p.amount_paid), 0.00) AS total_paid,
        (fi.total_amount - COALESCE(SUM(p.amount_paid), 0.00)) AS outstanding_balance
    FROM `fee_invoices` fi
    LEFT JOIN `payments` p ON fi.invoice_id = p.invoice_id
    WHERE fi.student_id = input_student_id
    GROUP BY fi.invoice_id, fi.total_amount, fi.due_date, fi.status;

    -- 6. Guardians
    SELECT g.guardian_id, g.name, g.phone, g.email, g.relation
    FROM `guardians` g
    INNER JOIN `student_guardians` sg ON g.guardian_id = sg.guardian_id
    WHERE sg.student_id = input_student_id;

    -- 7. Documents
    SELECT sd.document_id, sd.document_type, sd.document_path, sd.submission_date
    FROM `student_documents` sd
    WHERE sd.student_id = input_student_id;
END$$

-- ---------------------------------------------------------------------
-- 3. Database Trigger: trg_update_invoice_status_after_payment
-- Action: AFTER INSERT ON payments
-- Purpose: Automatically updates invoice status to 'Paid' or 'Partially Paid'
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_update_invoice_status_after_payment`$$
CREATE TRIGGER `trg_update_invoice_status_after_payment`
AFTER INSERT ON `payments`
FOR EACH ROW
BEGIN
    DECLARE v_total_amount DECIMAL(10,2);
    DECLARE v_total_paid DECIMAL(10,2);

    -- Fetch invoice total billed amount
    SELECT total_amount INTO v_total_amount
    FROM `fee_invoices`
    WHERE invoice_id = NEW.invoice_id;

    -- Compute cumulative payments including new transaction
    SELECT COALESCE(SUM(amount_paid), 0.00) INTO v_total_paid
    FROM `payments`
    WHERE invoice_id = NEW.invoice_id;

    -- Automate status transition
    IF v_total_paid >= v_total_amount THEN
        UPDATE `fee_invoices`
        SET status = 'Paid'
        WHERE invoice_id = NEW.invoice_id;
    ELSEIF v_total_paid > 0 THEN
        UPDATE `fee_invoices`
        SET status = 'Partially Paid'
        WHERE invoice_id = NEW.invoice_id;
    END IF;
END$$

-- ---------------------------------------------------------------------
-- 4. Database Trigger: trg_validate_result_marks
-- Action: BEFORE INSERT ON results
-- Purpose: Ensures marks obtained are not negative and <= exam max_marks
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_validate_result_marks`$$
CREATE TRIGGER `trg_validate_result_marks`
BEFORE INSERT ON `results`
FOR EACH ROW
BEGIN
    DECLARE v_max DECIMAL(5,2);

    SELECT max_marks INTO v_max 
    FROM `exams` 
    WHERE exam_id = NEW.exam_id;

    IF NEW.marks_obtained < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'RDBMS Error: Marks obtained cannot be negative.';
    END IF;

    IF NEW.marks_obtained > v_max THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'RDBMS Error: Marks obtained cannot exceed maximum exam marks.';
    END IF;
END$$

-- ---------------------------------------------------------------------
-- 5. Database Trigger: trg_prevent_overpayment
-- Action: BEFORE INSERT ON payments
-- Purpose: Prevents payment amounts exceeding the outstanding balance
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_prevent_overpayment`$$
CREATE TRIGGER `trg_prevent_overpayment`
BEFORE INSERT ON `payments`
FOR EACH ROW
BEGIN
    DECLARE v_total DECIMAL(10,2);
    DECLARE v_already_paid DECIMAL(10,2);
    DECLARE v_balance DECIMAL(10,2);

    SELECT total_amount INTO v_total
    FROM `fee_invoices`
    WHERE invoice_id = NEW.invoice_id;

    SELECT COALESCE(SUM(amount_paid), 0.00) INTO v_already_paid
    FROM `payments`
    WHERE invoice_id = NEW.invoice_id;

    SET v_balance = v_total - v_already_paid;

    IF NEW.amount_paid > v_balance THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Payment Error: Payment exceeds outstanding invoice balance.';
    END IF;
END$$

DELIMITER ;

-- =====================================================================
-- END OF MASTER SCRIPT
-- =====================================================================
