// =====================================================================
// Route: Students Management Module (/api/students)
// Strict ER Diagram Conformance: Registration, Profile & Relationships
// =====================================================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

/**
 * @route   GET /api/students
 * @desc    Get all students with department and program joins and optional filtering
 * @access  Protected (Admin, Faculty & Student)
 */
router.get('/', verifyToken, async (req, res) => {
    try {
        const { dept_id, program_id, status, search } = req.query;

        let query = `
            SELECT 
                s.student_id,
                s.roll_no,
                s.name,
                s.dob,
                s.gender,
                s.email,
                s.phone,
                s.address,
                s.admission_date,
                s.status,
                s.role,
                d.dept_id,
                d.dept_name,
                d.location AS dept_location,
                p.program_id,
                p.program_name,
                p.duration AS program_duration
            FROM students s
            INNER JOIN departments d ON s.dept_id = d.dept_id
            INNER JOIN programs p ON s.program_id = p.program_id
            WHERE 1=1
        `;
        const params = [];

        if (dept_id) {
            query += ' AND s.dept_id = ?';
            params.push(dept_id);
        }

        if (program_id) {
            query += ' AND s.program_id = ?';
            params.push(program_id);
        }

        if (status) {
            query += ' AND s.status = ?';
            params.push(status);
        }

        if (search) {
            query += ' AND (s.name LIKE ? OR s.roll_no LIKE ? OR s.email LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        query += ' ORDER BY s.student_id ASC';

        const [students] = await db.query(query, params);

        return res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/students/:id
 * @desc    Get single student details by ID
 * @access  Protected (Admin, Faculty, or Self-Student)
 */
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        // RBAC: Students can only view their own record unless Admin/Faculty
        if (req.user.role === 'student' && String(req.user.id) !== String(id)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: You are only authorized to access your own student profile.'
            });
        }

        const query = `
            SELECT 
                s.student_id,
                s.roll_no,
                s.name,
                s.dob,
                s.gender,
                s.email,
                s.phone,
                s.address,
                s.admission_date,
                s.status,
                s.role,
                d.dept_id,
                d.dept_name,
                d.location AS dept_location,
                p.program_id,
                p.program_name,
                p.duration AS program_duration
            FROM students s
            INNER JOIN departments d ON s.dept_id = d.dept_id
            INNER JOIN programs p ON s.program_id = p.program_id
            WHERE s.student_id = ?
        `;
        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: `Student with ID ${id} not found.`
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/students/:id/complete-profile
 * @desc    360-degree comprehensive profile (Academics, Attendance, Results, Invoices, Guardians, Documents)
 * @access  Protected (Admin, Faculty, or Self-Student)
 */
router.get('/:id/complete-profile', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role === 'student' && String(req.user.id) !== String(id)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: Access restricted to self or administrative staff.'
            });
        }

        // Try Stored Procedure first
        try {
            const [multiSets] = await db.query('CALL GetStudentCompleteProfile(?)', [id]);
            if (multiSets && multiSets[0] && multiSets[0].length > 0) {
                return res.status(200).json({
                    success: true,
                    data: {
                        student: multiSets[0][0] || null,
                        enrollments: multiSets[1] || [],
                        attendance: multiSets[2][0] || null,
                        results: multiSets[3] || [],
                        invoices: multiSets[4] || [],
                        guardians: multiSets[5] || [],
                        documents: multiSets[6] || []
                    }
                });
            }
        } catch (procErr) {
            console.warn('[GetStudentCompleteProfile] Procedure fallback to queries:', procErr.message);
        }

        // Relational Multi-table Aggregation Fallback
        const [studentRows] = await db.query(`
            SELECT s.*, d.dept_name, d.location AS dept_location, p.program_name, p.duration AS program_duration
            FROM students s
            JOIN departments d ON s.dept_id = d.dept_id
            JOIN programs p ON s.program_id = p.program_id
            WHERE s.student_id = ?
        `, [id]);

        if (studentRows.length === 0) {
            return res.status(404).json({ success: false, error: `Student with ID ${id} not found.` });
        }

        const student = studentRows[0];
        delete student.password_hash;

        // Enrollments
        const [enrollments] = await db.query(`
            SELECT e.enrollment_id, e.enrollment_date, e.status, 
                   sec.section_id, sec.section_name, sec.room_no, sec.schedule,
                   c.course_code, c.course_name, c.credits,
                   f.name AS faculty_name, f.email AS faculty_email
            FROM enrollments e
            JOIN sections sec ON e.section_id = sec.section_id
            JOIN courses c ON sec.course_id = c.course_id
            JOIN faculty f ON sec.faculty_id = f.faculty_id
            WHERE e.student_id = ?
        `, [id]);

        // Attendance stats
        const [attendanceStats] = await db.query(`
            SELECT 
                COUNT(*) AS total_sessions,
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present_count,
                SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) AS late_count,
                SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
                ROUND((SUM(CASE WHEN status = 'Present' THEN 1 WHEN status = 'Late' THEN 0.5 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100, 2) AS attendance_percentage
            FROM attendance
            WHERE student_id = ?
        `, [id]);

        // Results
        const [results] = await db.query(`
            SELECT r.result_id, r.marks_obtained, r.grade, ex.exam_type, ex.exam_date, ex.max_marks,
                   c.course_code, c.course_name, sec.section_name
            FROM results r
            JOIN exams ex ON r.exam_id = ex.exam_id
            JOIN sections sec ON ex.section_id = sec.section_id
            JOIN courses c ON sec.course_id = c.course_id
            WHERE r.student_id = ?
            ORDER BY ex.exam_date DESC
        `, [id]);

        // Invoices
        const [invoices] = await db.query(`
            SELECT fi.*, COALESCE(SUM(p.amount_paid), 0.00) AS total_paid
            FROM fee_invoices fi
            LEFT JOIN payments p ON fi.invoice_id = p.invoice_id
            WHERE fi.student_id = ?
            GROUP BY fi.invoice_id
        `, [id]);

        // Guardians
        const [guardians] = await db.query(`
            SELECT g.* FROM guardians g
            JOIN student_guardians sg ON g.guardian_id = sg.guardian_id
            WHERE sg.student_id = ?
        `, [id]);

        // Documents
        const [documents] = await db.query(`
            SELECT * FROM student_documents WHERE student_id = ? ORDER BY submission_date DESC
        `, [id]);

        return res.status(200).json({
            success: true,
            data: {
                student,
                enrollments,
                attendance: attendanceStats[0] || null,
                results,
                invoices,
                guardians,
                documents
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/students
 * @desc    Register a new student
 * @access  Protected (Admin only)
 */
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const {
            roll_no,
            name,
            dob,
            gender,
            email,
            phone,
            address,
            admission_date,
            status,
            dept_id,
            program_id,
            password
        } = req.body;

        if (!roll_no || !name || !dob || !gender || !email || !admission_date || !dept_id || !program_id) {
            return res.status(400).json({
                success: false,
                error: 'roll_no, name, dob, gender, email, admission_date, dept_id, and program_id are required fields.'
            });
        }

        // Validate department
        const [deptCheck] = await db.query('SELECT dept_id FROM departments WHERE dept_id = ?', [dept_id]);
        if (deptCheck.length === 0) {
            return res.status(404).json({ success: false, error: `Department with ID ${dept_id} does not exist.` });
        }

        // Validate program
        const [progCheck] = await db.query('SELECT program_id FROM programs WHERE program_id = ?', [program_id]);
        if (progCheck.length === 0) {
            return res.status(404).json({ success: false, error: `Program with ID ${program_id} does not exist.` });
        }

        // Check uniqueness of roll_no and email
        const [dups] = await db.query('SELECT student_id, roll_no, email FROM students WHERE roll_no = ? OR email = ?', [roll_no, email]);
        if (dups.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'A student with this roll_no or email already exists in the system.'
            });
        }

        // Hash password
        const plainPassword = password || 'student123';
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(plainPassword, salt);

        const firstName = req.body.first_name || (name ? name.split(' ')[0] : 'Student');
        const lastName = req.body.last_name || (name ? name.split(' ').slice(1).join(' ') || 'User' : 'User');

        const insertQuery = `
            INSERT INTO students (
                roll_no, first_name, last_name, dob, gender, email, phone, address, 
                admission_date, status, dept_id, program_id, password_hash, role
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'student')
        `;

        const [result] = await db.query(insertQuery, [
            roll_no,
            firstName,
            lastName,
            dob,
            gender,
            email,
            phone || null,
            address || null,
            admission_date,
            status || 'Active',
            dept_id,
            program_id,
            password_hash
        ]);

        return res.status(201).json({
            success: true,
            message: 'Student registered successfully.',
            student_id: result.insertId
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   PUT /api/students/:id
 * @desc    Update student profile details
 * @access  Protected (Admin or Self-Student)
 */
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role === 'student' && String(req.user.id) !== String(id)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: You cannot modify other students accounts.'
            });
        }

        const {
            name,
            dob,
            gender,
            phone,
            address,
            status,
            dept_id,
            program_id
        } = req.body;

        const [existing] = await db.query('SELECT student_id FROM students WHERE student_id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, error: `Student with ID ${id} not found.` });
        }

        // Students cannot change their own dept_id, program_id, or status
        const canModifyAcademicMeta = req.user.role === 'admin';

        await db.query(`
            UPDATE students 
            SET 
                name = COALESCE(?, name),
                dob = COALESCE(?, dob),
                gender = COALESCE(?, gender),
                phone = COALESCE(?, phone),
                address = COALESCE(?, address),
                status = CASE WHEN ? = 1 THEN COALESCE(?, status) ELSE status END,
                dept_id = CASE WHEN ? = 1 THEN COALESCE(?, dept_id) ELSE dept_id END,
                program_id = CASE WHEN ? = 1 THEN COALESCE(?, program_id) ELSE program_id END
            WHERE student_id = ?
        `, [
            name || null,
            dob || null,
            gender || null,
            phone || null,
            address || null,
            canModifyAcademicMeta ? 1 : 0,
            status || null,
            canModifyAcademicMeta ? 1 : 0,
            dept_id || null,
            canModifyAcademicMeta ? 1 : 0,
            program_id || null,
            id
        ]);

        return res.status(200).json({
            success: true,
            message: 'Student details updated successfully.'
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete a student record
 * @access  Protected (Admin only)
 */
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM students WHERE student_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: `Student with ID ${id} not found.` });
        }

        return res.status(200).json({
            success: true,
            message: `Student with ID ${id} and all related records deleted successfully.`
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
