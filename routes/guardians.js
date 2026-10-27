// =====================================================================
// Route: Guardians & Student Associations Module (/api/guardians)
// Entities: Guardian & Student_Guardian (M:N Relationship)
// =====================================================================

const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

/**
 * @route   GET /api/guardians
 * @desc    List all guardians with count of associated students
 * @access  Protected (Admin only)
 */
router.get('/', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const query = `
            SELECT 
                g.guardian_id,
                g.name,
                g.phone,
                g.email,
                g.relation,
                g.created_at,
                COUNT(sg.student_id) AS student_count
            FROM guardians g
            LEFT JOIN student_guardians sg ON g.guardian_id = sg.guardian_id
            GROUP BY g.guardian_id, g.name, g.phone, g.email, g.relation, g.created_at
            ORDER BY g.name ASC
        `;
        const [guardians] = await db.query(query);

        return res.status(200).json({
            success: true,
            count: guardians.length,
            data: guardians
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/guardians/student/:student_id
 * @desc    Get all guardians associated with a specific student
 * @access  Protected (Admin or Self-Student)
 */
router.get('/student/:student_id', verifyToken, async (req, res) => {
    try {
        const { student_id } = req.params;

        if (req.user.role === 'student' && String(req.user.id) !== String(student_id)) {
            return res.status(403).json({ success: false, error: 'Forbidden: Access restricted to self.' });
        }

        const query = `
            SELECT 
                g.guardian_id,
                g.name,
                g.phone,
                g.email,
                g.relation,
                sg.created_at AS associated_since
            FROM guardians g
            INNER JOIN student_guardians sg ON g.guardian_id = sg.guardian_id
            WHERE sg.student_id = ?
        `;
        const [guardians] = await db.query(query, [student_id]);

        return res.status(200).json({
            success: true,
            student_id: Number(student_id),
            count: guardians.length,
            data: guardians
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/guardians
 * @desc    Create a new guardian record
 * @access  Protected (Admin only)
 */
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const { name, phone, email, relation } = req.body;

        if (!name || !phone || !relation) {
            return res.status(400).json({
                success: false,
                error: 'name, phone, and relation (e.g. Father, Mother) are required fields.'
            });
        }

        const [result] = await db.query(
            'INSERT INTO guardians (name, phone, email, relation) VALUES (?, ?, ?, ?)',
            [name, phone, email || null, relation]
        );

        return res.status(201).json({
            success: true,
            message: 'Guardian created successfully.',
            guardian_id: result.insertId
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/guardians/assign
 * @desc    Associate a guardian with a student (Student_Guardian junction)
 * @access  Protected (Admin only)
 */
router.post('/assign', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const { student_id, guardian_id } = req.body;

        if (!student_id || !guardian_id) {
            return res.status(400).json({
                success: false,
                error: 'student_id and guardian_id are required fields.'
            });
        }

        const [s] = await db.query('SELECT student_id FROM students WHERE student_id = ?', [student_id]);
        const [g] = await db.query('SELECT guardian_id FROM guardians WHERE guardian_id = ?', [guardian_id]);

        if (s.length === 0 || g.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Referenced Student or Guardian does not exist.'
            });
        }

        const [existing] = await db.query(
            'SELECT * FROM student_guardians WHERE student_id = ? AND guardian_id = ?',
            [student_id, guardian_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'Student is already linked to this guardian.'
            });
        }

        await db.query(
            'INSERT INTO student_guardians (student_id, guardian_id) VALUES (?, ?)',
            [student_id, guardian_id]
        );

        return res.status(201).json({
            success: true,
            message: 'Guardian linked to student successfully.'
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   DELETE /api/guardians/student/:student_id/guardian/:guardian_id
 * @desc    Unlink a student and guardian association
 * @access  Protected (Admin only)
 */
router.delete('/student/:student_id/guardian/:guardian_id', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const { student_id, guardian_id } = req.params;

        const [result] = await db.query(
            'DELETE FROM student_guardians WHERE student_id = ? AND guardian_id = ?',
            [student_id, guardian_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Association between specified student and guardian was not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Guardian unlinked from student successfully.'
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
