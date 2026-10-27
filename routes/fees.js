// =====================================================================
// Route: Fee Invoices & Payments Module (/api/fees)
// Entities: Fee_Invoice and Payment (Strict ER Diagram Conformance)
// =====================================================================

const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

/**
 * @route   GET /api/fees/summary
 * @desc    Aggregate financial metrics (Total Invoiced, Total Collected, Outstanding, Status counts)
 * @access  Protected (Admin only)
 */
router.get('/summary', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const [invoiceAgg] = await db.query(`
            SELECT 
                COALESCE(SUM(total_amount), 0.00) AS total_invoiced,
                COUNT(*) AS total_invoices_count,
                SUM(CASE WHEN status = 'Paid' THEN 1 ELSE 0 END) AS paid_invoices_count,
                SUM(CASE WHEN status = 'Partially Paid' THEN 1 ELSE 0 END) AS partial_invoices_count,
                SUM(CASE WHEN status = 'Unpaid' THEN 1 ELSE 0 END) AS unpaid_invoices_count,
                SUM(CASE WHEN status = 'Overdue' THEN 1 ELSE 0 END) AS overdue_invoices_count
            FROM fee_invoices
        `);

        const [paymentAgg] = await db.query(`
            SELECT 
                COALESCE(SUM(amount_paid), 0.00) AS total_collected,
                COUNT(*) AS total_payments_count
            FROM payments
        `);

        const totalInvoiced = Number(invoiceAgg[0].total_invoiced);
        const totalCollected = Number(paymentAgg[0].total_collected);
        const totalOutstanding = Math.max(0, totalInvoiced - totalCollected);

        return res.status(200).json({
            success: true,
            data: {
                total_invoiced: totalInvoiced,
                total_collected: totalCollected,
                total_outstanding: totalOutstanding,
                metrics: invoiceAgg[0],
                payments_count: paymentAgg[0].total_payments_count
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/fees/invoices
 * @desc    Get all fee invoices with student details, total paid and outstanding balances
 * @access  Protected (Admin only)
 */
router.get('/invoices', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const { status, student_id } = req.query;

        let query = `
            SELECT 
                fi.invoice_id,
                fi.student_id,
                s.roll_no,
                s.name AS student_name,
                s.email AS student_email,
                d.dept_name,
                p.program_name,
                fi.total_amount,
                fi.due_date,
                fi.status,
                fi.created_at,
                COALESCE(SUM(pay.amount_paid), 0.00) AS total_paid,
                (fi.total_amount - COALESCE(SUM(pay.amount_paid), 0.00)) AS outstanding_balance
            FROM fee_invoices fi
            INNER JOIN students s ON fi.student_id = s.student_id
            INNER JOIN departments d ON s.dept_id = d.dept_id
            INNER JOIN programs p ON s.program_id = p.program_id
            LEFT JOIN payments pay ON fi.invoice_id = pay.invoice_id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND fi.status = ?';
            params.push(status);
        }

        if (student_id) {
            query += ' AND fi.student_id = ?';
            params.push(student_id);
        }

        query += `
            GROUP BY fi.invoice_id, fi.student_id, s.roll_no, s.name, s.email, d.dept_name, p.program_name, fi.total_amount, fi.due_date, fi.status, fi.created_at
            ORDER BY fi.due_date ASC
        `;

        const [invoices] = await db.query(query, params);

        return res.status(200).json({
            success: true,
            count: invoices.length,
            data: invoices
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/fees/invoices/student/:id
 * @desc    Get fee invoices for a specific student
 * @access  Protected (Admin or Self-Student)
 */
router.get('/invoices/student/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role === 'student' && String(req.user.id) !== String(id)) {
            return res.status(403).json({ success: false, error: 'Forbidden: Access restricted to self.' });
        }

        const query = `
            SELECT 
                fi.invoice_id,
                fi.student_id,
                fi.total_amount,
                fi.due_date,
                fi.status,
                fi.created_at,
                COALESCE(SUM(pay.amount_paid), 0.00) AS total_paid,
                (fi.total_amount - COALESCE(SUM(pay.amount_paid), 0.00)) AS outstanding_balance
            FROM fee_invoices fi
            LEFT JOIN payments pay ON fi.invoice_id = pay.invoice_id
            WHERE fi.student_id = ?
            GROUP BY fi.invoice_id, fi.student_id, fi.total_amount, fi.due_date, fi.status, fi.created_at
            ORDER BY fi.due_date ASC
        `;
        const [invoices] = await db.query(query, [id]);

        return res.status(200).json({
            success: true,
            count: invoices.length,
            data: invoices
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/fees/invoices/:id
 * @desc    Get a single invoice along with its itemized payment transaction history
 * @access  Protected (Admin or Self-Student)
 */
router.get('/invoices/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const [invoiceRows] = await db.query(`
            SELECT 
                fi.*,
                s.roll_no,
                s.name AS student_name,
                s.email AS student_email,
                d.dept_name,
                p.program_name
            FROM fee_invoices fi
            JOIN students s ON fi.student_id = s.student_id
            JOIN departments d ON s.dept_id = d.dept_id
            JOIN programs p ON s.program_id = p.program_id
            WHERE fi.invoice_id = ?
        `, [id]);

        if (invoiceRows.length === 0) {
            return res.status(404).json({ success: false, error: `Invoice ${id} not found.` });
        }

        const invoice = invoiceRows[0];

        if (req.user.role === 'student' && String(req.user.id) !== String(invoice.student_id)) {
            return res.status(403).json({ success: false, error: 'Forbidden: Access restricted to self.' });
        }

        const [payments] = await db.query(`
            SELECT payment_id, invoice_id, amount_paid, payment_date, method, transaction_ref, created_at
            FROM payments
            WHERE invoice_id = ?
            ORDER BY payment_date DESC
        `, [id]);

        const totalPaid = payments.reduce((acc, curr) => acc + Number(curr.amount_paid), 0);
        const outstandingBalance = Math.max(0, Number(invoice.total_amount) - totalPaid);

        return res.status(200).json({
            success: true,
            data: {
                ...invoice,
                total_paid: totalPaid,
                outstanding_balance: outstandingBalance,
                payments
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/fees/invoices
 * @desc    Generate a new fee invoice for a student
 * @access  Protected (Admin only)
 */
router.post('/invoices', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const { student_id, total_amount, due_date, status } = req.body;

        if (!student_id || !total_amount || !due_date) {
            return res.status(400).json({
                success: false,
                error: 'student_id, total_amount, and due_date are required fields.'
            });
        }

        const [studentCheck] = await db.query('SELECT student_id FROM students WHERE student_id = ?', [student_id]);
        if (studentCheck.length === 0) {
            return res.status(404).json({ success: false, error: `Student ${student_id} not found.` });
        }

        const [result] = await db.query(
            'INSERT INTO fee_invoices (student_id, total_amount, due_date, status) VALUES (?, ?, ?, ?)',
            [student_id, total_amount, due_date, status || 'Unpaid']
        );

        return res.status(201).json({
            success: true,
            message: 'Fee Invoice generated successfully.',
            invoice_id: result.insertId
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   PUT /api/fees/invoices/:id/status
 * @desc    Update invoice status (e.g. Overdue, Paid, Unpaid)
 * @access  Protected (Admin only)
 */
router.put('/invoices/:id/status', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Unpaid', 'Partially Paid', 'Paid', 'Overdue'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const [result] = await db.query('UPDATE fee_invoices SET status = ? WHERE invoice_id = ?', [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: `Invoice ${id} not found.` });
        }

        return res.status(200).json({
            success: true,
            message: `Invoice status updated to '${status}'.`
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/fees/payments
 * @desc    Record a new payment against an invoice and update invoice status
 * @access  Protected (Admin or Self-Student)
 */
router.post('/payments', verifyToken, async (req, res) => {
    try {
        const { invoice_id, amount_paid, method, transaction_ref, payment_date } = req.body;

        if (!invoice_id || !amount_paid || !method) {
            return res.status(400).json({
                success: false,
                error: 'invoice_id, amount_paid, and method are required fields.'
            });
        }

        const validMethods = ['Credit Card', 'Debit Card', 'Bank Transfer', 'Cash', 'UPI', 'Cheque'];
        if (!validMethods.includes(method)) {
            return res.status(400).json({
                success: false,
                error: `Invalid payment method. Valid choices: ${validMethods.join(', ')}`
            });
        }

        const [invoiceRows] = await db.query('SELECT invoice_id, student_id, total_amount, status FROM fee_invoices WHERE invoice_id = ?', [invoice_id]);
        if (invoiceRows.length === 0) {
            return res.status(404).json({ success: false, error: `Invoice ${invoice_id} not found.` });
        }

        const invoice = invoiceRows[0];

        // Students can only pay for their own invoice
        if (req.user.role === 'student' && String(req.user.id) !== String(invoice.student_id)) {
            return res.status(403).json({ success: false, error: 'Forbidden: You cannot pay another student invoice.' });
        }

        const ref = transaction_ref || `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const pDate = payment_date || new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Insert payment
        const [payResult] = await db.query(
            'INSERT INTO payments (invoice_id, amount_paid, payment_date, method, transaction_ref) VALUES (?, ?, ?, ?, ?)',
            [invoice_id, amount_paid, pDate, method, ref]
        );

        // Recalculate total payments to update invoice status
        const [sumRows] = await db.query('SELECT COALESCE(SUM(amount_paid), 0) AS total_paid FROM payments WHERE invoice_id = ?', [invoice_id]);
        const totalPaid = Number(sumRows[0].total_paid);
        const totalAmount = Number(invoice.total_amount);

        let newStatus = 'Unpaid';
        if (totalPaid >= totalAmount) {
            newStatus = 'Paid';
        } else if (totalPaid > 0) {
            newStatus = 'Partially Paid';
        }

        await db.query('UPDATE fee_invoices SET status = ? WHERE invoice_id = ?', [newStatus, invoice_id]);

        return res.status(201).json({
            success: true,
            message: 'Payment recorded successfully.',
            payment_id: payResult.insertId,
            transaction_ref: ref,
            invoice_status: newStatus,
            total_paid: totalPaid,
            remaining_balance: Math.max(0, totalAmount - totalPaid)
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/fees/payments
 * @desc    List all payment transactions
 * @access  Protected (Admin only)
 */
router.get('/payments', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const query = `
            SELECT 
                p.payment_id,
                p.invoice_id,
                p.amount_paid,
                p.payment_date,
                p.method,
                p.transaction_ref,
                fi.student_id,
                s.roll_no,
                s.name AS student_name,
                fi.total_amount AS invoice_total
            FROM payments p
            INNER JOIN fee_invoices fi ON p.invoice_id = fi.invoice_id
            INNER JOIN students s ON fi.student_id = s.student_id
            ORDER BY p.payment_date DESC
        `;
        const [payments] = await db.query(query);

        return res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
