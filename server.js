// =====================================================================
// College Student Management System (SMS) - Master Express Server
// Production-Ready Enterprise Backend (Strict ER Schema Conformance)
// =====================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import Modular Routers strictly matching ER Entities
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const departmentRoutes = require('./routes/departments');
const academicRoutes = require('./routes/academic');
const feeRoutes = require('./routes/fees');
const guardianRoutes = require('./routes/guardians');
const documentRoutes = require('./routes/documents');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------
// Core Middlewares
// ---------------------------------------------------------------------

// Cross-Origin Resource Sharing (Enterprise Open Access for Client Apps)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger (Telemetry & Audit)
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    next();
});

// Static Asset Serving (Dashboard Web Interface)
app.use(express.static(path.join(__dirname, '.')));

// ---------------------------------------------------------------------
// API Route Registration (All 16 ER Diagram Tables Covered)
// ---------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/guardians', guardianRoutes);
app.use('/api/documents', documentRoutes);

// Base System Health Check
app.get('/health', (req, res) => {
    return res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'College Student Management System (SMS) API',
        version: '2.0.0',
        architecture: 'Relational 16-Entity ER Diagram Conformance'
    });
});

// Comprehensive API Catalog
app.get('/api', (req, res) => {
    return res.status(200).json({
        message: 'Welcome to College Student Management System (SMS) REST API',
        er_entities_supported: [
            'Department', 'Program', 'Student', 'Faculty', 'Course',
            'Semester', 'Section', 'Enrollment', 'Attendance', 'Exam',
            'Result', 'Fee_Invoice', 'Payment', 'Guardian', 'Student_Guardian', 'Student_Document'
        ],
        modular_endpoints: {
            auth: {
                student_login: 'POST /api/auth/student/login',
                student_register: 'POST /api/auth/student/register',
                faculty_login: 'POST /api/auth/faculty/login',
                admin_login: 'POST /api/auth/admin/login',
                admin_register: 'POST /api/auth/admin/register',
                current_user: 'GET /api/auth/me'
            },
            departments_and_programs: {
                list_departments: 'GET /api/departments',
                get_department: 'GET /api/departments/:id',
                create_department: 'POST /api/departments',
                update_department: 'PUT /api/departments/:id',
                delete_department: 'DELETE /api/departments/:id',
                list_programs: 'GET /api/departments/programs/list',
                create_program: 'POST /api/departments/programs'
            },
            students: {
                list_students: 'GET /api/students (filters: dept_id, program_id, status, search)',
                get_student: 'GET /api/students/:id',
                student_profile_360: 'GET /api/students/:id/complete-profile',
                create_student: 'POST /api/students',
                update_student: 'PUT /api/students/:id',
                delete_student: 'DELETE /api/students/:id'
            },
            academic_and_sections: {
                courses: 'GET & POST /api/academic/courses',
                faculty: 'GET & POST /api/academic/faculty',
                semesters: 'GET & POST /api/academic/semesters',
                sections: 'GET & POST /api/academic/sections',
                section_students: 'GET /api/academic/sections/:id/students',
                enroll: 'POST /api/academic/enroll',
                student_enrollments: 'GET /api/academic/enrollments/student/:id',
                drop_enrollment: 'DELETE /api/academic/enrollments/:id',
                record_attendance: 'POST /api/academic/attendance',
                batch_attendance: 'POST /api/academic/attendance/batch',
                student_attendance: 'GET /api/academic/attendance/student/:id',
                schedule_exam: 'POST /api/academic/exams',
                section_exams: 'GET /api/academic/exams/section/:id',
                record_result: 'POST /api/academic/results',
                student_results: 'GET /api/academic/results/student/:id'
            },
            fees_and_payments: {
                financial_summary: 'GET /api/fees/summary',
                list_invoices: 'GET /api/fees/invoices (filters: status, student_id)',
                student_invoices: 'GET /api/fees/invoices/student/:id',
                get_invoice: 'GET /api/fees/invoices/:id',
                create_invoice: 'POST /api/fees/invoices',
                update_status: 'PUT /api/fees/invoices/:id/status',
                record_payment: 'POST /api/fees/payments',
                list_payments: 'GET /api/fees/payments'
            },
            guardians: {
                list_guardians: 'GET /api/guardians',
                create_guardian: 'POST /api/guardians',
                assign_to_student: 'POST /api/guardians/assign',
                student_guardians: 'GET /api/guardians/student/:student_id',
                unlink_guardian: 'DELETE /api/guardians/student/:student_id/guardian/:guardian_id'
            },
            documents: {
                student_documents: 'GET /api/documents/student/:student_id',
                upload_document: 'POST /api/documents',
                delete_document: 'DELETE /api/documents/:id'
            }
        }
    });
});

// ---------------------------------------------------------------------
// 404 Route Not Found
// ---------------------------------------------------------------------
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Endpoint not found: ${req.method} ${req.originalUrl}`
    });
});

// ---------------------------------------------------------------------
// Centralized Global Error-Handling Middleware
// ---------------------------------------------------------------------
app.use((err, req, res, next) => {
    console.error('[Global Error Handler]:', err.stack || err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// ---------------------------------------------------------------------
// Server Initialization
// ---------------------------------------------------------------------
const server = app.listen(PORT, () => {
    console.log('=====================================================');
    console.log(`🚀 College SMS API Server active on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log(`📋 REST API Catalog: http://localhost:${PORT}/api`);
    console.log('=====================================================');
});

// Graceful Process Termination Listeners
process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received. Gracefully closing HTTP server.');
    server.close(() => console.log('[Server] HTTP server closed.'));
});

process.on('SIGINT', () => {
    console.log('[Server] SIGINT received. Gracefully closing HTTP server.');
    server.close(() => console.log('[Server] HTTP server closed.'));
});

module.exports = app;
