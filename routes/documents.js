// =====================================================================
// Route: Student Documents Module (/api/documents)
// Entity: Student_Document (Strict ER Diagram Conformance)
// =====================================================================

const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

/**
 * @route   GET /api/documents/student/:student_id
 * @desc    Get all documents submitted by a student
 * @access  Protected (Admin, Faculty, Self-Student)
 */
router.get('/student/:student_id', verifyToken, async (req, res) => {
    try {
        const { student_id } = req.params;

        if (req.user.role === 'student' && String(req.user.id) !== String(student_id)) {
            return res.status(403).json({ success: false, error: 'Forbidden: Access restricted to self.' });
        }

        const query = `
            SELECT 
                sd.document_id,
                sd.student_id,
                sd.document_type,
                sd.document_path,
                sd.submission_date,
                sd.created_at
            FROM student_documents sd
            WHERE sd.student_id = ?
            ORDER BY sd.submission_date DESC
        `;
        const [docs] = await db.query(query, [student_id]);

        return res.status(200).json({
            success: true,
            student_id: Number(student_id),
            count: docs.length,
            data: docs
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/documents
 * @desc    Submit / record a new student document
 * @access  Protected (Admin or Self-Student)
 */
router.post('/', verifyToken, async (req, res) => {
    try {
        const { student_id, document_type, document_path, submission_date } = req.body;

        if (!student_id || !document_type || !document_path) {
            return res.status(400).json({
                success: false,
                error: 'student_id, document_type, and document_path are required fields.'
            });
        }

        if (req.user.role === 'student' && String(req.user.id) !== String(student_id)) {
            return res.status(403).json({ success: false, error: 'Forbidden: You cannot submit documents for another student.' });
        }

        const [studentCheck] = await db.query('SELECT student_id FROM students WHERE student_id = ?', [student_id]);
        if (studentCheck.length === 0) {
            return res.status(404).json({ success: false, error: `Student with ID ${student_id} not found.` });
        }

        const subDate = submission_date || new Date().toISOString().slice(0, 19).replace('T', ' ');

        const [result] = await db.query(
            'INSERT INTO student_documents (student_id, document_type, document_path, submission_date) VALUES (?, ?, ?, ?)',
            [student_id, document_type, document_path, subDate]
        );

        return res.status(201).json({
            success: true,
            message: 'Student document record created successfully.',
            document_id: result.insertId
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete a student document record
 * @access  Protected (Admin only)
 */
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM student_documents WHERE document_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: `Document ${id} not found.` });
        }

        return res.status(200).json({
            success: true,
            message: 'Document record deleted successfully.'
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
