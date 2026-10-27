// =====================================================================
// Route: Departments & Academic Programs Module (/api/departments)
// Handles CRUD Operations for Department and Program Entities
// =====================================================================

const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

/**
 * @route   GET /api/departments
 * @desc    List all departments with aggregated counts (faculty, courses, students)
 * @access  Public / Authenticated
 */
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                d.dept_id,
                d.dept_name,
                d.location,
                d.created_at,
                (SELECT COUNT(*) FROM faculty f WHERE f.dept_id = d.dept_id) AS faculty_count,
                (SELECT COUNT(*) FROM courses c WHERE c.dept_id = d.dept_id) AS course_count,
                (SELECT COUNT(*) FROM students s WHERE s.dept_id = d.dept_id) AS student_count
            FROM departments d
            ORDER BY d.dept_id ASC
        `;
        const [departments] = await db.query(query);

        return res.status(200).json({
            success: true,
            count: departments.length,
            data: departments
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/departments/programs/list
 * @desc    List all academic programs
 * @access  Public / Authenticated
 */
router.get('/programs/list', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.program_id,
                p.program_name,
                p.duration,
                p.created_at,
                (SELECT COUNT(*) FROM students s WHERE s.program_id = p.program_id) AS student_count
            FROM programs p
            ORDER BY p.program_id ASC
        `;
        const [programs] = await db.query(query);

        return res.status(200).json({
            success: true,
            count: programs.length,
            data: programs
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/departments/programs
 * @desc    Create a new academic program
 * @access  Protected (Admin only)
 */
router.post('/programs', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const { program_name, duration } = req.body;

        if (!program_name || !duration) {
            return res.status(400).json({
                success: false,
                error: 'program_name and duration (in years) are required.'
            });
        }

        const [existing] = await db.query('SELECT program_id FROM programs WHERE program_name = ?', [program_name]);
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                error: `Program with name '${program_name}' already exists.`
            });
        }

        const [result] = await db.query(
            'INSERT INTO programs (program_name, duration) VALUES (?, ?)',
            [program_name, duration]
        );

        return res.status(201).json({
            success: true,
            message: 'Academic Program created successfully.',
            program_id: result.insertId
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/departments/:id
 * @desc    Get specific department details with associated faculty & courses
 * @access  Public / Authenticated
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [deptRows] = await db.query(
            'SELECT dept_id, dept_name, location, created_at FROM departments WHERE dept_id = ?',
            [id]
        );

        if (deptRows.length === 0) {
            return res.status(404).json({
                success: false,
                error: `Department with ID ${id} not found.`
            });
        }

        const department = deptRows[0];

        // Fetch courses under this department
        const [courses] = await db.query(
            'SELECT course_id, course_code, course_name, credits FROM courses WHERE dept_id = ?',
            [id]
        );

        // Fetch faculty under this department
        const [faculty] = await db.query(
            'SELECT faculty_id, name, email, phone, designation FROM faculty WHERE dept_id = ?',
            [id]
        );

        return res.status(200).json({
            success: true,
            data: {
                ...department,
                courses,
                faculty
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/departments
 * @desc    Create a new department
 * @access  Protected (Admin only)
 */
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const { dept_name, location } = req.body;

        if (!dept_name || !location) {
            return res.status(400).json({
                success: false,
                error: 'dept_name and location are required fields.'
            });
        }

        const [existing] = await db.query('SELECT dept_id FROM departments WHERE dept_name = ?', [dept_name]);
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                error: `Department '${dept_name}' already exists.`
            });
        }

        const [result] = await db.query(
            'INSERT INTO departments (dept_name, location) VALUES (?, ?)',
            [dept_name, location]
        );

        return res.status(201).json({
            success: true,
            message: 'Department created successfully.',
            dept_id: result.insertId
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   PUT /api/departments/:id
 * @desc    Update an existing department
 * @access  Protected (Admin only)
 */
router.put('/:id', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { dept_name, location } = req.body;

        if (!dept_name && !location) {
            return res.status(400).json({
                success: false,
                error: 'Please provide at least dept_name or location to update.'
            });
        }

        const [existing] = await db.query('SELECT dept_id FROM departments WHERE dept_id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                error: `Department with ID ${id} not found.`
            });
        }

        await db.query(
            'UPDATE departments SET dept_name = COALESCE(?, dept_name), location = COALESCE(?, location) WHERE dept_id = ?',
            [dept_name || null, location || null, id]
        );

        return res.status(200).json({
            success: true,
            message: 'Department updated successfully.'
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   DELETE /api/departments/:id
 * @desc    Delete a department
 * @access  Protected (Admin only)
 */
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;

        // Check if referenced by students, faculty, or courses
        const [studentCount] = await db.query('SELECT COUNT(*) AS total FROM students WHERE dept_id = ?', [id]);
        const [facultyCount] = await db.query('SELECT COUNT(*) AS total FROM faculty WHERE dept_id = ?', [id]);
        const [courseCount] = await db.query('SELECT COUNT(*) AS total FROM courses WHERE dept_id = ?', [id]);

        if (studentCount[0].total > 0 || facultyCount[0].total > 0 || courseCount[0].total > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete department: Associated students, faculty members, or courses exist. Reassign them first.'
            });
        }

        const [result] = await db.query('DELETE FROM departments WHERE dept_id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: `Department with ID ${id} not found.`
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Department deleted successfully.'
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
