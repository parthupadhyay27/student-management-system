// =====================================================================
// Route: Authentication Module (/api/auth)
// Handles Login, Registration, and JWT Token Issuance (Students & Admins)
// =====================================================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_enterprise_jwt_key_928374829104';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * @route   POST /api/auth/student/register
 * @desc    Public student self-registration
 * @access  Public
 */
router.post('/student/register', async (req, res) => {
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
            dept_id,
            program_id,
            password
        } = req.body;

        if (!roll_no || !name || !dob || !gender || !email || !admission_date || !dept_id || !program_id || !password) {
            return res.status(400).json({
                success: false,
                error: 'roll_no, name, dob, gender, email, admission_date, dept_id, program_id, and password are required.'
            });
        }

        // Validate department
        const [deptCheck] = await db.query('SELECT dept_id FROM departments WHERE dept_id = ?', [dept_id]);
        if (deptCheck.length === 0) {
            return res.status(404).json({ success: false, error: `Department ID ${dept_id} not found.` });
        }

        // Validate program
        const [progCheck] = await db.query('SELECT program_id FROM programs WHERE program_id = ?', [program_id]);
        if (progCheck.length === 0) {
            return res.status(404).json({ success: false, error: `Program ID ${program_id} not found.` });
        }

        // Check duplicate roll_no or email
        const [existing] = await db.query('SELECT student_id FROM students WHERE roll_no = ? OR email = ?', [roll_no, email]);
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'An account with this Roll Number or Email already exists.'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const firstName = req.body.first_name || (name ? name.split(' ')[0] : 'Student');
        const lastName = req.body.last_name || (name ? name.split(' ').slice(1).join(' ') || 'User' : 'User');

        const [result] = await db.query(
            `INSERT INTO students (
                roll_no, first_name, last_name, dob, gender, email, phone, address, admission_date, 
                status, dept_id, program_id, password_hash, role
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?, ?, 'student')`,
            [roll_no, firstName, lastName, dob, gender, email, phone || null, address || null, admission_date, dept_id, program_id, password_hash]
        );

        return res.status(201).json({
            success: true,
            message: 'Student account registered successfully.',
            student_id: result.insertId
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/auth/student/login
 * @desc    Authenticate student by email or roll_no and return JWT
 * @access  Public
 */
router.post('/student/login', async (req, res) => {
    try {
        const { email, roll_no, password } = req.body;
        const identifier = email || roll_no;

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email or Roll Number, and password are required.'
            });
        }

        const [rows] = await db.query(`
            SELECT 
                s.student_id,
                s.roll_no,
                s.name,
                s.email,
                s.password_hash,
                s.status,
                s.role,
                d.dept_id,
                d.dept_name,
                p.program_id,
                p.program_name
            FROM students s
            JOIN departments d ON s.dept_id = d.dept_id
            JOIN programs p ON s.program_id = p.program_id
            WHERE s.email = ? OR s.roll_no = ?
        `, [identifier, identifier]);

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Authentication failed: No student account matches the credentials provided.'
            });
        }

        const student = rows[0];

        if (student.status !== 'Active') {
            return res.status(403).json({
                success: false,
                error: `Account is inactive or suspended (Current Status: ${student.status}). Please contact academic office.`
            });
        }

        const isMatch = await bcrypt.compare(password, student.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Authentication failed: Invalid password.'
            });
        }

        const payload = {
            id: student.student_id,
            roll_no: student.roll_no,
            email: student.email,
            name: student.name,
            role: 'student',
            dept_id: student.dept_id,
            program_id: student.program_id
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        return res.status(200).json({
            success: true,
            message: 'Student login successful.',
            token,
            user: {
                id: student.student_id,
                roll_no: student.roll_no,
                name: student.name,
                email: student.email,
                role: 'student',
                dept_name: student.dept_name,
                program_name: student.program_name
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/auth/faculty/login
 * @desc    Authenticate faculty member and return JWT
 * @access  Public
 */
router.post('/faculty/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required.'
            });
        }

        const [rows] = await db.query(`
            SELECT 
                f.faculty_id,
                f.name,
                f.email,
                f.password_hash,
                f.role,
                d.dept_id,
                d.dept_name
            FROM faculty f
            JOIN departments d ON f.dept_id = d.dept_id
            WHERE f.email = ?
        `, [email]);

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Authentication failed: No faculty account found with this email.'
            });
        }

        const faculty = rows[0];
        const isMatch = await bcrypt.compare(password, faculty.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Authentication failed: Invalid password.'
            });
        }

        const payload = {
            id: faculty.faculty_id,
            email: faculty.email,
            name: faculty.name,
            role: 'faculty',
            dept_id: faculty.dept_id
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        return res.status(200).json({
            success: true,
            message: 'Faculty login successful.',
            token,
            user: {
                id: faculty.faculty_id,
                name: faculty.name,
                email: faculty.email,
                role: 'faculty',
                dept_name: faculty.dept_name
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/auth/admin/register
 * @desc    Register a new administrator
 * @access  Public / Setup
 */
router.post('/admin/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'username, email, and password are required.'
            });
        }

        const [existing] = await db.query('SELECT admin_id FROM admins WHERE username = ? OR email = ?', [username, email]);
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'Administrator with this username or email already exists.'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const [result] = await db.query(
            'INSERT INTO admins (username, email, password_hash, role) VALUES (?, ?, ?, "admin")',
            [username, email, password_hash]
        );

        return res.status(201).json({
            success: true,
            message: 'Administrator account registered successfully.',
            admin_id: result.insertId
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/auth/admin/login
 * @desc    Authenticate administrator and return JWT
 * @access  Public
 */
router.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required.'
            });
        }

        const [rows] = await db.query('SELECT * FROM admins WHERE username = ? OR email = ?', [username, username]);

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid administrator credentials.'
            });
        }

        const admin = rows[0];
        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid administrator credentials.'
            });
        }

        const payload = {
            id: admin.admin_id,
            username: admin.username,
            email: admin.email,
            role: 'admin'
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        return res.status(200).json({
            success: true,
            message: 'Administrator login successful.',
            token,
            user: {
                id: admin.admin_id,
                username: admin.username,
                email: admin.email,
                role: 'admin'
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Return profile of authenticated token owner
 * @access  Protected
 */
router.get('/me', verifyToken, async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
