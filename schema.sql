-- =====================================================================
-- College Student Management System (SMS) - Relational Database Schema
-- DBMS: MySQL 8.0+ / MariaDB 10.5+
-- Schema: Strict ER Diagram Conformance (All 16 Entities & Relationships)
-- Lab Course: Relational Database Management System (CSC2131)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `college_sms_db`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `college_sms_db`;

-- Disable foreign key constraints during table teardown / setup
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
    `duration` INT NOT NULL CHECK (`duration` > 0) COMMENT 'Duration in Years (e.g., 4 for B.Tech, 2 for M.Tech)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_program_name` (`program_name`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. Table: Student
-- Attributes: student_id (PK), roll_no, first_name, last_name, dob, gender, 
--             email, phone, address, admission_date, status, dept_id (FK), program_id (FK)
-- Note: Includes blood_group, name (generated) & password_hash for JWT authentication.
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
    `blood_group` VARCHAR(5) DEFAULT NULL,
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
    CONSTRAINT `chk_semester_date_order` CHECK (`end_date` > `start_date`),
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
    `relation` VARCHAR(50) NOT NULL COMMENT 'e.g., Father, Mother, Guardian',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_guardian_phone` (`phone`),
    INDEX `idx_guardian_email` (`email`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 15. Table: Student_Guardian (Junction Table for M:N Relationship)
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
-- SEED DATA (Populating the 6 mandatory courses and ER tables)
-- =====================================================================

-- 1. Departments
INSERT INTO `departments` (`dept_id`, `dept_name`, `location`) VALUES
(1, 'Computer Science and Engineering', 'Turing Hall, Building A'),
(2, 'Electrical and Electronics Engineering', 'Tesla Complex, Building B'),
(3, 'Mechanical Engineering', 'Watt Pavilion, Building C'),
(4, 'Business Administration', 'Drucker Management Center, Building D');

-- 2. Programs
INSERT INTO `programs` (`program_id`, `program_name`, `duration`) VALUES
(1, 'Bachelor of Technology (B.Tech)', 4),
(2, 'Master of Technology (M.Tech)', 2),
(3, 'Master of Business Administration (MBA)', 2),
(4, 'Bachelor of Science (B.Sc)', 3);

-- 3. Faculty
INSERT INTO `faculty` (`faculty_id`, `name`, `email`, `phone`, `dept_id`, `designation`) VALUES
(1, 'Dr. Alan Turing', 'alan.turing@college.edu', '+1-555-0101', 1, 'Professor & Chair (RDBMS Specialist)'),
(2, 'Dr. Ada Lovelace', 'ada.lovelace@college.edu', '+1-555-0102', 1, 'Associate Professor (DSA / OOP)'),
(3, 'Dr. John von Neumann', 'von.neumann@college.edu', '+1-555-0103', 1, 'Professor (Computer Organization)'),
(4, 'Dr. Ronald Fisher', 'ronald.fisher@college.edu', '+1-555-0104', 1, 'Associate Professor (Statistics)'),
(5, 'Dr. Peter Drucker', 'peter.drucker@college.edu', '+1-555-0105', 4, 'Professor (Management)');

-- 4. Courses (STRICTLY THE 6 MANDATED SUBJECTS)
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

-- 6. Sections
INSERT INTO `sections` (`section_id`, `course_id`, `semester_id`, `faculty_id`, `section_name`, `room_no`, `schedule`) VALUES
(1, 1, 1, 2, 'Section A', 'Lab 201 - Algorithms', 'Mon/Wed 09:00 - 10:30'),
(2, 2, 1, 5, 'Section A', 'Hall 402 - Management', 'Tue/Thu 11:00 - 12:30'),
(3, 3, 1, 1, 'Section A', 'Lab 101 - RDBMS Lab',   'Mon/Wed 14:00 - 15:30'),
(4, 4, 1, 2, 'Section A', 'Lab 204 - OOP Lab',     'Tue/Thu 14:00 - 15:30'),
(5, 5, 1, 3, 'Section A', 'Room 301 - Architecture', 'Fri 09:00 - 12:00'),
(6, 6, 1, 4, 'Section A', 'Room 105 - Mathematics',  'Mon/Wed 11:00 - 12:30');

-- 7. Students
INSERT INTO `students` (`student_id`, `roll_no`, `first_name`, `last_name`, `dob`, `gender`, `email`, `phone`, `address`, `admission_date`, `status`, `dept_id`, `program_id`, `password_hash`, `role`) VALUES
(1, 'CSC2025001', 'Parth',  'Sharma',   '2004-05-15', 'Male',   'parth.sharma@student.college.edu',   '+1-555-1101', '742 Evergreen Terrace, Techville', '2025-07-15', 'Active', 1, 1, '$2a$10$w0B7GZkFhZqWnfx6iUqyzeKjI6kOhyjA61j7hXwYdI0P5b0Vf0K2C', 'student'),
(2, 'CSC2025002', 'Sophia', 'Chen',     '2004-08-22', 'Female', 'sophia.chen@student.college.edu',   '+1-555-1102', '128 Silicon Boulevard, Metro City', '2025-07-15', 'Active', 1, 1, '$2a$10$w0B7GZkFhZqWnfx6iUqyzeKjI6kOhyjA61j7hXwYdI0P5b0Vf0K2C', 'student'),
(3, 'CSC2025003', 'Marcus', 'Aurelius', '2003-11-09', 'Male',   'marcus.aurelius@student.college.edu', '+1-555-1103', '10 Capitol Hill, Ancient Way',      '2025-07-16', 'Active', 1, 1, '$2a$10$w0B7GZkFhZqWnfx6iUqyzeKjI6kOhyjA61j7hXwYdI0P5b0Vf0K2C', 'student'),
(4, 'CSC2025004', 'Elena',  'Rostova',  '2004-03-30', 'Female', 'elena.rostova@student.college.edu',  '+1-555-1104', '55 Industrial Parkway, Gear City',  '2025-07-16', 'Active', 1, 1, '$2a$10$w0B7GZkFhZqWnfx6iUqyzeKjI6kOhyjA61j7hXwYdI0P5b0Vf0K2C', 'student'),
(5, 'CSC2025005', 'Aarav',  'Patel',    '2004-01-18', 'Male',   'aarav.patel@student.college.edu',    '+1-555-1105', '99 Innovation Way, Techville',      '2025-07-17', 'Active', 1, 1, '$2a$10$w0B7GZkFhZqWnfx6iUqyzeKjI6kOhyjA61j7hXwYdI0P5b0Vf0K2C', 'student');

-- 8. Enrollments
INSERT INTO `enrollments` (`enrollment_id`, `student_id`, `section_id`, `enrollment_date`, `status`) VALUES
(1,  1, 1, '2025-08-01', 'Enrolled'),
(2,  1, 2, '2025-08-01', 'Enrolled'),
(3,  1, 3, '2025-08-01', 'Enrolled'),
(4,  1, 4, '2025-08-01', 'Enrolled'),
(5,  1, 5, '2025-08-01', 'Enrolled'),
(6,  1, 6, '2025-08-01', 'Enrolled'),
(7,  2, 1, '2025-08-01', 'Enrolled'),
(8,  2, 3, '2025-08-01', 'Enrolled'),
(9,  3, 3, '2025-08-02', 'Enrolled'),
(10, 4, 3, '2025-08-02', 'Enrolled'),
(11, 5, 3, '2025-08-02', 'Enrolled');

-- 9. Attendance
INSERT INTO `attendance` (`attendance_id`, `student_id`, `section_id`, `attendance_date`, `status`) VALUES
(1,  1, 3, '2025-08-11', 'Present'),
(2,  1, 3, '2025-08-13', 'Present'),
(3,  1, 3, '2025-08-18', 'Present'),
(4,  1, 3, '2025-08-20', 'Late'),
(5,  2, 3, '2025-08-11', 'Present'),
(6,  2, 3, '2025-08-13', 'Absent'),
(7,  3, 3, '2025-08-11', 'Absent'),
(8,  3, 3, '2025-08-13', 'Absent'),
(9,  4, 3, '2025-08-11', 'Present'),
(10, 5, 3, '2025-08-11', 'Present');

-- 10. Exams
INSERT INTO `exams` (`exam_id`, `section_id`, `exam_type`, `exam_date`, `max_marks`) VALUES
(1, 3, 'Midterm', '2025-10-15', 100.00),
(2, 3, 'Final',   '2025-12-10', 100.00),
(3, 1, 'Midterm', '2025-10-18', 100.00),
(4, 4, 'Midterm', '2025-10-20', 100.00),
(5, 2, 'Final',   '2025-12-14', 100.00);

-- 11. Results
INSERT INTO `results` (`result_id`, `exam_id`, `student_id`, `marks_obtained`, `grade`) VALUES
(1, 1, 1, 95.00, 'A+'),
(2, 1, 2, 88.00, 'A'),
(3, 1, 3, 72.50, 'B'),
(4, 1, 4, 61.00, 'C'),
(5, 1, 5, 84.00, 'A-'),
(6, 2, 1, 93.00, 'A+'),
(7, 3, 1, 91.50, 'A+'),
(8, 4, 1, 89.00, 'A'),
(9, 5, 1, 94.00, 'A+');

-- 12. Fee Invoices
INSERT INTO `fee_invoices` (`invoice_id`, `student_id`, `total_amount`, `due_date`, `status`) VALUES
(1, 1, 4500.00, '2025-09-01', 'Paid'),
(2, 1, 4500.00, '2026-02-01', 'Unpaid'),
(3, 2, 4500.00, '2025-09-01', 'Paid'),
(4, 3, 4200.00, '2025-08-15', 'Overdue'),
(5, 4, 4300.00, '2025-08-15', 'Partially Paid');

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

-- 15. Student_Guardians (M:N junction)
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

-- 17. Admins
INSERT INTO `admins` (`admin_id`, `username`, `email`, `password_hash`, `role`) VALUES
(1, 'superadmin', 'admin@college.edu', '$2a$10$w0B7GZkFhZqWnfx6iUqyzeKjI6kOhyjA61j7hXwYdI0P5b0Vf0K2C', 'admin');
