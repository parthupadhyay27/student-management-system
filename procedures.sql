-- =====================================================================
-- College Student Management System (SMS) - Automation, Triggers & Procedures
-- DBMS: MySQL 8.0+
-- Lab Course: Relational Database Management System (CSC2131)
-- =====================================================================

USE `college_sms_db`;

-- Drop existing procedures & triggers if present
DROP PROCEDURE IF EXISTS `GenerateStudentReportCard`;
DROP PROCEDURE IF EXISTS `GetStudentCompleteProfile`;
DROP TRIGGER IF EXISTS `trg_validate_result_insert`;
DROP TRIGGER IF EXISTS `trg_validate_result_update`;
DROP TRIGGER IF EXISTS `trg_update_invoice_status_after_payment`;
DROP TRIGGER IF EXISTS `trg_prevent_overpayment`;

DELIMITER $$

-- ---------------------------------------------------------------------
-- 1. Stored Procedure: GenerateStudentReportCard
-- Purpose: Generates an official academic transcript / report card for a student
--          including detailed subject breakdown (CSC2131, DSA, OOP, etc.),
--          individual exam performance, total credits, and Semester SGPA.
-- ---------------------------------------------------------------------
CREATE PROCEDURE `GenerateStudentReportCard`(
    IN `p_student_id` INT,
    IN `p_semester_id` INT
)
BEGIN
    -- Section 1: Student Demographics & Academic Registry Metadata
    SELECT 
        s.student_id,
        s.roll_no,
        s.first_name,
        s.last_name,
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

    -- Section 3: Aggregate Semester SGPA & Total Credits Earned
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
END $$

-- ---------------------------------------------------------------------
-- 2. Stored Procedure: GetStudentCompleteProfile
-- Accepts: input_student_id INT
-- Returns 7 enterprise result sets for the application:
--   1. Student basic demographic, Department & Program metadata
--   2. Enrolled Sections with Course, Faculty and Schedule breakdown
--   3. Attendance Summary & Calculated Attendance Percentage
--   4. Examination Results with course codes & grades
--   5. Fee Invoices, Paid Totals & Pending Balances
--   6. Associated Guardians & Uploaded Documents
-- ---------------------------------------------------------------------
CREATE PROCEDURE `GetStudentCompleteProfile`(
    IN `input_student_id` INT
)
BEGIN
    -- Result Set 1: Student Demographics, Department & Academic Program
    SELECT 
        s.student_id,
        s.roll_no,
        s.first_name,
        s.last_name,
        s.name,
        s.dob,
        s.gender,
        s.email,
        s.phone,
        s.address,
        s.blood_group,
        s.admission_date,
        s.status,
        d.dept_id,
        d.dept_name,
        d.location AS dept_location,
        p.program_id,
        p.program_name,
        p.duration AS program_duration_years
    FROM `students` s
    INNER JOIN `departments` d ON s.dept_id = d.dept_id
    INNER JOIN `programs` p ON s.program_id = p.program_id
    WHERE s.student_id = input_student_id;

    -- Result Set 2: Enrolled Sections, Courses & Assigned Faculty
    SELECT 
        e.enrollment_id,
        e.enrollment_date,
        e.status AS enrollment_status,
        sec.section_id,
        sec.section_name,
        sec.room_no,
        sec.schedule,
        c.course_id,
        c.course_code,
        c.course_name,
        c.credits,
        sem.semester_id,
        sem.semester_no,
        sem.academic_year,
        f.faculty_id,
        f.name AS faculty_name,
        f.email AS faculty_email
    FROM `enrollments` e
    INNER JOIN `sections` sec ON e.section_id = sec.section_id
    INNER JOIN `courses` c ON sec.course_id = c.course_id
    INNER JOIN `semesters` sem ON sec.semester_id = sem.semester_id
    INNER JOIN `faculty` f ON sec.faculty_id = f.faculty_id
    WHERE e.student_id = input_student_id
    ORDER BY sem.academic_year DESC, sem.semester_no ASC, c.course_code ASC;

    -- Result Set 3: Attendance Aggregate Metrics
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

    -- Result Set 4: Examination Results & Grades
    SELECT 
        r.result_id,
        r.marks_obtained,
        r.grade,
        ex.exam_id,
        ex.exam_type,
        ex.exam_date,
        ex.max_marks,
        ROUND((r.marks_obtained / ex.max_marks) * 100, 2) AS percentage,
        c.course_code,
        c.course_name,
        sec.section_name
    FROM `results` r
    INNER JOIN `exams` ex ON r.exam_id = ex.exam_id
    INNER JOIN `sections` sec ON ex.section_id = sec.section_id
    INNER JOIN `courses` c ON sec.course_id = c.course_id
    WHERE r.student_id = input_student_id
    ORDER BY ex.exam_date DESC;

    -- Result Set 5: Invoices and Payment Totals
    SELECT 
        fi.invoice_id,
        fi.total_amount,
        fi.due_date,
        fi.status,
        COALESCE(SUM(p.amount_paid), 0.00) AS total_paid,
        (fi.total_amount - COALESCE(SUM(p.amount_paid), 0.00)) AS outstanding_balance
    FROM `fee_invoices` fi
    LEFT JOIN `payments` p ON fi.invoice_id = p.invoice_id
    WHERE fi.student_id = input_student_id
    GROUP BY fi.invoice_id, fi.total_amount, fi.due_date, fi.status
    ORDER BY fi.due_date ASC;

    -- Result Set 6: Associated Guardians
    SELECT 
        g.guardian_id,
        g.name,
        g.phone,
        g.email,
        g.relation
    FROM `guardians` g
    INNER JOIN `student_guardians` sg ON g.guardian_id = sg.guardian_id
    WHERE sg.student_id = input_student_id;

    -- Result Set 7: Submitted Documents
    SELECT 
        sd.document_id,
        sd.document_type,
        sd.document_path,
        sd.submission_date
    FROM `student_documents` sd
    WHERE sd.student_id = input_student_id
    ORDER BY sd.submission_date DESC;

END $$

-- ---------------------------------------------------------------------
-- 3. Database Trigger: trg_update_invoice_status_after_payment
-- Action: AFTER INSERT ON payments
-- Purpose: Automatically updates invoice status to 'Paid' or 'Partially Paid'
-- ---------------------------------------------------------------------
CREATE TRIGGER `trg_update_invoice_status_after_payment`
AFTER INSERT ON `payments`
FOR EACH ROW
BEGIN
    DECLARE v_total_amount DECIMAL(10,2);
    DECLARE v_total_paid DECIMAL(10,2);

    SELECT total_amount INTO v_total_amount
    FROM `fee_invoices`
    WHERE invoice_id = NEW.invoice_id;

    SELECT COALESCE(SUM(amount_paid), 0.00) INTO v_total_paid
    FROM `payments`
    WHERE invoice_id = NEW.invoice_id;

    IF v_total_paid >= v_total_amount THEN
        UPDATE `fee_invoices`
        SET status = 'Paid'
        WHERE invoice_id = NEW.invoice_id;
    ELSEIF v_total_paid > 0 THEN
        UPDATE `fee_invoices`
        SET status = 'Partially Paid'
        WHERE invoice_id = NEW.invoice_id;
    END IF;
END $$

-- ---------------------------------------------------------------------
-- 4. Database Trigger: trg_validate_result_insert
-- Action: BEFORE INSERT ON results
-- Purpose: Ensures marks_obtained does not exceed exam's max_marks or < 0
-- ---------------------------------------------------------------------
CREATE TRIGGER `trg_validate_result_insert`
BEFORE INSERT ON `results`
FOR EACH ROW
BEGIN
    DECLARE v_max_marks DECIMAL(5,2);

    SELECT max_marks INTO v_max_marks
    FROM `exams`
    WHERE exam_id = NEW.exam_id;

    IF NEW.marks_obtained < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Constraint Error: Marks obtained cannot be negative.';
    END IF;

    IF NEW.marks_obtained > v_max_marks THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Constraint Error: Marks obtained cannot exceed the exam max_marks.';
    END IF;
END $$

-- ---------------------------------------------------------------------
-- 5. Database Trigger: trg_validate_result_update
-- Action: BEFORE UPDATE ON results
-- ---------------------------------------------------------------------
CREATE TRIGGER `trg_validate_result_update`
BEFORE UPDATE ON `results`
FOR EACH ROW
BEGIN
    DECLARE v_max_marks DECIMAL(5,2);

    SELECT max_marks INTO v_max_marks
    FROM `exams`
    WHERE exam_id = NEW.exam_id;

    IF NEW.marks_obtained < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Constraint Error: Marks obtained cannot be negative.';
    END IF;

    IF NEW.marks_obtained > v_max_marks THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Constraint Error: Marks obtained cannot exceed the exam max_marks.';
    END IF;
END $$

-- ---------------------------------------------------------------------
-- 6. Database Trigger: trg_prevent_overpayment
-- Action: BEFORE INSERT ON payments
-- ---------------------------------------------------------------------
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
END $$

DELIMITER ;
