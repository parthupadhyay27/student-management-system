// =====================================================================
// Route: Academic, Sections & Enrollments Module (/api/academic)
// Entities: Faculty, Courses, Semesters, Sections, Enrollments, Attendance, Exams, Results
// =====================================================================

const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

// ---------------------------------------------------------------------
// 1. COURSES & FACULTY SUB-MODULE
// ---------------------------------------------------------------------

/**
 * @route   GET /api/academic/courses
 * @desc    List all courses with department metadata
 * @access  Public / Authenticated
 */
router.get('/courses', async (req, res) => {
    try {
        const { dept_id } = req.query;
        let query = `
            SELECT 
                c.course_id,
                c.course_code,
                c.course_name,
                c.credits,
                c.created_at,
                d.dept_id,
                d.dept_name,
                d.location AS dept_location,
                (SELECT COUNT(*) FROM sections s WHERE s.course_id = c.course_id) AS active_sections_count
            FROM courses c
            INNER JOIN departments d ON c.dept_id = d.dept_id
            WHERE 1=1
        `;
        const params = [];

        if (dept_id) {
            query += ' AND c.dept_id = ?';
            params.push(dept_id);
        }

        query += ' ORDER BY c.course_code ASC';

        const [courses] = await db.query(query, params);

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/academic/courses
 * @desc    Create a new course
 * @access  Protected (Admin only)
 */
router.post('/courses', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const { course_code, course_name, credits, dept_id } = req.body;

        if (!course_code || !course_name || !credits || !dept_id) {
            return res.status(400).json({
                success: false,
                error: 'course_code, course_name, credits, and dept_id are required fields.'
            });
        }

        const [deptCheck] = await db.query('SELECT dept_id FROM departments WHERE dept_id = ?', [dept_id]);
        if (deptCheck.length === 0) {
            return res.status(404).json({ success: false, error: `Department with ID ${dept_id} not found.` });
        }

        const [existing] = await db.query('SELECT course_id FROM courses WHERE course_code = ?', [course_code]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, error: `Course code '${course_code}' is already registered.` });
        }

        const [result] = await db.query(
            'INSERT INTO courses (course_code, course_name, credits, dept_id) VALUES (?, ?, ?, ?)',
            [course_code, course_name, credits, dept_id]
        );

        return res.status(201).json({
            success: true,
            message: 'Course created successfully.',
            course_id: result.insertId
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/academic/faculty
 * @desc    List faculty members with their department assignments
 * @access  Public / Authenticated
 */
router.get('/faculty', async (req, res) => {
    try {
        const { dept_id } = req.query;
        let query = `
            SELECT 
                f.faculty_id,
                f.name,
                f.email,
                f.phone,
                f.designation,
                f.created_at,
                d.dept_id,
                d.dept_name,
                d.location AS dept_location,
                (SELECT COUNT(*) FROM sections s WHERE s.faculty_id = f.faculty_id) AS assigned_sections_count
            FROM faculty f
            INNER JOIN departments d ON f.dept_id = d.dept_id
            WHERE 1=1
        `;
        const params = [];

        if (dept_id) {
            query += ' AND f.dept_id = ?';
            params.push(dept_id);
        }

        query += ' ORDER BY f.name ASC';

        const [faculty] = await db.query(query, params);

        return res.status(200).json({
            success: true,
            count: faculty.length,
            data: faculty
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/academic/faculty
 * @desc    Create a new faculty record
 * @access  Protected (Admin only)
 */
router.post('/faculty', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const { name, email, phone, dept_id, designation } = req.body;

        if (!name || !email || !dept_id) {
            return res.status(400).json({
                success: false,
                error: 'name, email, and dept_id are required fields.'
            });
        }

        const [deptCheck] = await db.query('SELECT dept_id FROM departments WHERE dept_id = ?', [dept_id]);
        if (deptCheck.length === 0) {
            return res.status(404).json({ success: false, error: `Department ${dept_id} does not exist.` });
        }

        const [existing] = await db.query('SELECT faculty_id FROM faculty WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, error: 'Faculty with this email already exists.' });
        }

        const [result] = await db.query(
            'INSERT INTO faculty (name, email, phone, dept_id, designation) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone || null, dept_id, designation || 'Assistant Professor']
        );

        return res.status(201).json({
            success: true,
            message: 'Faculty created successfully.',
            faculty_id: result.insertId
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------------------
// 2. SEMESTERS & SECTIONS SUB-MODULE
// ---------------------------------------------------------------------

/**
 * @route   GET /api/academic/semesters
 * @desc    List all semesters
 * @access  Public / Authenticated
 */
router.get('/semesters', async (req, res) => {
    try {
        const [semesters] = await db.query('SELECT * FROM semesters ORDER BY academic_year DESC, semester_no ASC');
        return res.status(200).json({
            success: true,
            count: semesters.length,
            data: semesters
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/academic/semesters
 * @desc    Create a semester
 * @access  Protected (Admin only)
 */
router.post('/semesters', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const { semester_no, academic_year, start_date, end_date } = req.body;

        if (!semester_no || !academic_year || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                error: 'semester_no, academic_year, start_date, and end_date are required.'
            });
        }

        const [result] = await db.query(
            'INSERT INTO semesters (semester_no, academic_year, start_date, end_date) VALUES (?, ?, ?, ?)',
            [semester_no, academic_year, start_date, end_date]
        );

        return res.status(201).json({
            success: true,
            message: 'Semester created successfully.',
            semester_id: result.insertId
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/academic/sections
 * @desc    List all sections with Course, Semester, and Faculty details
 * @access  Public / Authenticated
 */
router.get('/sections', async (req, res) => {
    try {
        const { course_id, semester_id, faculty_id } = req.query;

        let query = `
            SELECT 
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
                f.email AS faculty_email,
                (SELECT COUNT(*) FROM enrollments e WHERE e.section_id = sec.section_id AND e.status = 'Enrolled') AS enrolled_students_count
            FROM sections sec
            INNER JOIN courses c ON sec.course_id = c.course_id
            INNER JOIN semesters sem ON sec.semester_id = sem.semester_id
            INNER JOIN faculty f ON sec.faculty_id = f.faculty_id
            WHERE 1=1
        `;
        const params = [];

        if (course_id) {
            query += ' AND sec.course_id = ?';
            params.push(course_id);
        }
        if (semester_id) {
            query += ' AND sec.semester_id = ?';
            params.push(semester_id);
        }
        if (faculty_id) {
            query += ' AND sec.faculty_id = ?';
            params.push(faculty_id);
        }

        query += ' ORDER BY sem.academic_year DESC, c.course_code ASC, sec.section_name ASC';

        const [sections] = await db.query(query, params);

        return res.status(200).json({
            success: true,
            count: sections.length,
            data: sections
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/academic/sections
 * @desc    Create a new section
 * @access  Protected (Admin only)
 */
router.post('/sections', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const { course_id, semester_id, faculty_id, section_name, room_no, schedule } = req.body;

        if (!course_id || !semester_id || !faculty_id || !section_name || !room_no || !schedule) {
            return res.status(400).json({
                success: false,
                error: 'course_id, semester_id, faculty_id, section_name, room_no, and schedule are all required.'
            });
        }

        // Verify foreign entities
        const [c] = await db.query('SELECT course_id FROM courses WHERE course_id = ?', [course_id]);
        const [s] = await db.query('SELECT semester_id FROM semesters WHERE semester_id = ?', [semester_id]);
        const [f] = await db.query('SELECT faculty_id FROM faculty WHERE faculty_id = ?', [faculty_id]);

        if (c.length === 0 || s.length === 0 || f.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Referenced Course, Semester, or Faculty does not exist.'
            });
        }

        const [result] = await db.query(
            'INSERT INTO sections (course_id, semester_id, faculty_id, section_name, room_no, schedule) VALUES (?, ?, ?, ?, ?, ?)',
            [course_id, semester_id, faculty_id, section_name, room_no, schedule]
        );

        return res.status(201).json({
            success: true,
            message: 'Section created successfully.',
            section_id: result.insertId
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/academic/sections/:id/students
 * @desc    List all students enrolled in a specific section
 * @access  Protected (Admin, Faculty)
 */
router.get('/sections/:id/students', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                e.enrollment_id,
                e.enrollment_date,
                e.status AS enrollment_status,
                s.student_id,
                s.roll_no,
                s.name,
                s.email,
                s.phone,
                p.program_name
            FROM enrollments e
            INNER JOIN students s ON e.student_id = s.student_id
            INNER JOIN programs p ON s.program_id = p.program_id
            WHERE e.section_id = ?
            ORDER BY s.roll_no ASC
        `;
        const [students] = await db.query(query, [id]);

        return res.status(200).json({
            success: true,
            section_id: Number(id),
            count: students.length,
            data: students
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------------------
// 3. ENROLLMENTS SUB-MODULE
// ---------------------------------------------------------------------

/**
 * @route   POST /api/academic/enroll
 * @desc    Enroll a student into a section
 * @access  Protected (Admin or Self-Student)
 */
router.post('/enroll', verifyToken, async (req, res) => {
    try {
        const { student_id, section_id, enrollment_date } = req.body;

        if (!student_id || !section_id) {
            return res.status(400).json({
                success: false,
                error: 'student_id and section_id are required fields.'
            });
        }

        // Student can only enroll self unless admin
        if (req.user.role === 'student' && String(req.user.id) !== String(student_id)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: You cannot enroll other students.'
            });
        }

        // Check if section exists
        const [sec] = await db.query('SELECT section_id FROM sections WHERE section_id = ?', [section_id]);
        if (sec.length === 0) {
            return res.status(404).json({ success: false, error: `Section ${section_id} does not exist.` });
        }

        // Check duplicate enrollment
        const [existing] = await db.query(
            'SELECT enrollment_id FROM enrollments WHERE student_id = ? AND section_id = ?',
            [student_id, section_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'Student is already enrolled in this section.'
            });
        }

        const date = enrollment_date || new Date().toISOString().slice(0, 10);

        const [result] = await db.query(
            'INSERT INTO enrollments (student_id, section_id, enrollment_date, status) VALUES (?, ?, ?, "Enrolled")',
            [student_id, section_id, date]
        );

        return res.status(201).json({
            success: true,
            message: 'Student enrolled successfully into section.',
            enrollment_id: result.insertId
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/academic/enrollments/student/:id
 * @desc    Get all sections enrolled by a student
 * @access  Protected (Admin, Faculty, Self-Student)
 */
router.get('/enrollments/student/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role === 'student' && String(req.user.id) !== String(id)) {
            return res.status(403).json({ success: false, error: 'Forbidden: Access restricted to self.' });
        }

        const query = `
            SELECT 
                e.enrollment_id,
                e.enrollment_date,
                e.status,
                sec.section_id,
                sec.section_name,
                sec.room_no,
                sec.schedule,
                c.course_id,
                c.course_code,
                c.course_name,
                c.credits,
                f.name AS faculty_name,
                sem.academic_year,
                sem.semester_no
            FROM enrollments e
            INNER JOIN sections sec ON e.section_id = sec.section_id
            INNER JOIN courses c ON sec.course_id = c.course_id
            INNER JOIN faculty f ON sec.faculty_id = f.faculty_id
            INNER JOIN semesters sem ON sec.semester_id = sem.semester_id
            WHERE e.student_id = ?
            ORDER BY sem.academic_year DESC, c.course_code ASC
        `;
        const [enrollments] = await db.query(query, [id]);

        return res.status(200).json({
            success: true,
            count: enrollments.length,
            data: enrollments
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   DELETE /api/academic/enrollments/:id
 * @desc    Withdraw / drop an enrollment
 * @access  Protected (Admin or Self-Student)
 */
router.delete('/enrollments/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const [enr] = await db.query('SELECT * FROM enrollments WHERE enrollment_id = ?', [id]);
        if (enr.length === 0) {
            return res.status(404).json({ success: false, error: 'Enrollment record not found.' });
        }

        if (req.user.role === 'student' && String(req.user.id) !== String(enr[0].student_id)) {
            return res.status(403).json({ success: false, error: 'Forbidden: You cannot drop another student enrollment.' });
        }

        await db.query('DELETE FROM enrollments WHERE enrollment_id = ?', [id]);

        return res.status(200).json({
            success: true,
            message: 'Enrollment dropped successfully.'
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------------------
// 4. ATTENDANCE SUB-MODULE
// ---------------------------------------------------------------------

/**
 * @route   POST /api/academic/attendance
 * @desc    Mark or upsert attendance for a student in a section
 * @access  Protected (Admin, Faculty)
 */
router.post('/attendance', verifyToken, requireRole('admin', 'faculty'), async (req, res) => {
    try {
        const { student_id, section_id, attendance_date, status } = req.body;

        if (!student_id || !section_id || !attendance_date || !status) {
            return res.status(400).json({
                success: false,
                error: 'student_id, section_id, attendance_date, and status are required.'
            });
        }

        const validStatuses = ['Present', 'Absent', 'Late', 'Excused'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const [result] = await db.query(
            `INSERT INTO attendance (student_id, section_id, attendance_date, status)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = CURRENT_TIMESTAMP`,
            [student_id, section_id, attendance_date, status]
        );

        return res.status(200).json({
            success: true,
            message: 'Attendance recorded successfully.',
            attendance_id: result.insertId || 'Updated existing record'
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/academic/attendance/batch
 * @desc    Bulk record attendance for multiple students in a section on a date
 * @access  Protected (Admin, Faculty)
 */
router.post('/attendance/batch', verifyToken, requireRole('admin', 'faculty'), async (req, res) => {
    try {
        const { section_id, attendance_date, records } = req.body;
        // records: [ { student_id: 1, status: 'Present' }, ... ]

        if (!section_id || !attendance_date || !Array.isArray(records) || records.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'section_id, attendance_date, and a non-empty records array are required.'
            });
        }

        for (const item of records) {
            await db.query(
                `INSERT INTO attendance (student_id, section_id, attendance_date, status)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = CURRENT_TIMESTAMP`,
                [item.student_id, section_id, attendance_date, item.status]
            );
        }

        return res.status(200).json({
            success: true,
            message: `Batch attendance processed for ${records.length} students.`
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/academic/attendance/student/:id
 * @desc    Get attendance history and percentage for a student
 * @access  Protected (Admin, Faculty, Self-Student)
 */
router.get('/attendance/student/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role === 'student' && String(req.user.id) !== String(id)) {
            return res.status(403).json({ success: false, error: 'Forbidden: Cannot access other student attendance.' });
        }

        const query = `
            SELECT 
                a.attendance_id,
                a.attendance_date,
                a.status,
                sec.section_id,
                sec.section_name,
                c.course_code,
                c.course_name
            FROM attendance a
            INNER JOIN sections sec ON a.section_id = sec.section_id
            INNER JOIN courses c ON sec.course_id = c.course_id
            WHERE a.student_id = ?
            ORDER BY a.attendance_date DESC
        `;
        const [records] = await db.query(query, [id]);

        const [summary] = await db.query(`
            SELECT 
                COUNT(*) AS total_sessions,
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present_count,
                SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) AS late_count,
                SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
                ROUND((SUM(CASE WHEN status = 'Present' THEN 1 WHEN status = 'Late' THEN 0.5 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100, 2) AS attendance_percentage
            FROM attendance
            WHERE student_id = ?
        `, [id]);

        return res.status(200).json({
            success: true,
            summary: summary[0] || {},
            count: records.length,
            data: records
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------------------
// 5. EXAMS & RESULTS SUB-MODULE
// ---------------------------------------------------------------------

/**
 * @route   POST /api/academic/exams
 * @desc    Schedule / create an exam for a section
 * @access  Protected (Admin, Faculty)
 */
router.post('/exams', verifyToken, requireRole('admin', 'faculty'), async (req, res) => {
    try {
        const { section_id, exam_type, exam_date, max_marks } = req.body;

        if (!section_id || !exam_type || !exam_date || !max_marks) {
            return res.status(400).json({
                success: false,
                error: 'section_id, exam_type, exam_date, and max_marks are required.'
            });
        }

        const [secCheck] = await db.query('SELECT section_id FROM sections WHERE section_id = ?', [section_id]);
        if (secCheck.length === 0) {
            return res.status(404).json({ success: false, error: `Section ${section_id} not found.` });
        }

        const [result] = await db.query(
            'INSERT INTO exams (section_id, exam_type, exam_date, max_marks) VALUES (?, ?, ?, ?)',
            [section_id, exam_type, exam_date, max_marks]
        );

        return res.status(201).json({
            success: true,
            message: 'Exam scheduled successfully.',
            exam_id: result.insertId
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/academic/exams/section/:id
 * @desc    List all exams scheduled for a section
 * @access  Protected (Admin, Faculty, Student)
 */
router.get('/exams/section/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                ex.exam_id,
                ex.exam_type,
                ex.exam_date,
                ex.max_marks,
                sec.section_name,
                c.course_code,
                c.course_name
            FROM exams ex
            INNER JOIN sections sec ON ex.section_id = sec.section_id
            INNER JOIN courses c ON sec.course_id = c.course_id
            WHERE ex.section_id = ?
            ORDER BY ex.exam_date ASC
        `;
        const [exams] = await db.query(query, [id]);

        return res.status(200).json({
            success: true,
            count: exams.length,
            data: exams
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * Helper: Automatically calculate Letter Grade based on percentage
 */
function calculateGrade(marksObtained, maxMarks) {
    const pct = (marksObtained / maxMarks) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
}

/**
 * @route   POST /api/academic/results
 * @desc    Record or update exam marks & grade for a student
 * @access  Protected (Admin, Faculty)
 */
router.post('/results', verifyToken, requireRole('admin', 'faculty'), async (req, res) => {
    try {
        const { exam_id, student_id, marks_obtained, grade } = req.body;

        if (!exam_id || !student_id || marks_obtained === undefined) {
            return res.status(400).json({
                success: false,
                error: 'exam_id, student_id, and marks_obtained are required.'
            });
        }

        const [examRows] = await db.query('SELECT max_marks FROM exams WHERE exam_id = ?', [exam_id]);
        if (examRows.length === 0) {
            return res.status(404).json({ success: false, error: `Exam ${exam_id} not found.` });
        }

        const max_marks = Number(examRows[0].max_marks);
        const marks = Number(marks_obtained);

        if (marks < 0 || marks > max_marks) {
            return res.status(400).json({
                success: false,
                error: `marks_obtained must be between 0 and exam max_marks (${max_marks}).`
            });
        }

        const assignedGrade = grade || calculateGrade(marks, max_marks);

        const [result] = await db.query(
            `INSERT INTO results (exam_id, student_id, marks_obtained, grade)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE marks_obtained = VALUES(marks_obtained), grade = VALUES(grade), updated_at = CURRENT_TIMESTAMP`,
            [exam_id, student_id, marks, assignedGrade]
        );

        return res.status(200).json({
            success: true,
            message: 'Exam result recorded successfully.',
            result_id: result.insertId || 'Updated existing result',
            grade: assignedGrade
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/academic/results/student/:id
 * @desc    Get all exam results and grades for a student
 * @access  Protected (Admin, Faculty, Self-Student)
 */
router.get('/results/student/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role === 'student' && String(req.user.id) !== String(id)) {
            return res.status(403).json({ success: false, error: 'Forbidden: Access restricted to self.' });
        }

        const query = `
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
                c.credits,
                sec.section_name
            FROM results r
            INNER JOIN exams ex ON r.exam_id = ex.exam_id
            INNER JOIN sections sec ON ex.section_id = sec.section_id
            INNER JOIN courses c ON sec.course_id = c.course_id
            WHERE r.student_id = ?
            ORDER BY ex.exam_date DESC
        `;
        const [results] = await db.query(query, [id]);

        return res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
