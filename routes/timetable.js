// =====================================================================
// Route: Timetable & Schedule Module (/api/timetable)
// Student Lecture Schedules Sorted Chronologically by Day and Time
// =====================================================================

const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

/**
 * @route   GET /api/timetable/student/:id
 * @desc    Fetch student lecture schedule based on currently enrolled courses,
 *          sorted chronologically by Day of Week ('Monday'..'Saturday') and start_time
 * @access  Protected (Admin or Self-Student)
 */
router.get('/student/:id', verifyToken, async (req, res) => {
    try {
        const studentId = parseInt(req.params.id, 10);
        if (isNaN(studentId)) {
            return res.status(400).json({ success: false, error: 'Invalid student ID.' });
        }

        if (req.user.role === 'student' && req.user.id !== studentId) {
            return res.status(403).json({ success: false, error: 'Forbidden: Access restricted.' });
        }

        const [schedule] = await db.query(
            `SELECT 
                tt.timetable_id,
                tt.course_id,
                c.course_code,
                c.title AS course_title,
                c.credits,
                tt.day_of_week,
                TIME_FORMAT(tt.start_time, '%H:%i') AS start_time,
                TIME_FORMAT(tt.end_time, '%H:%i') AS end_time,
                tt.room_no,
                CONCAT(COALESCE(i.first_name, 'TBA'), ' ', COALESCE(i.last_name, '')) AS instructor_name
             FROM enrollments e
             JOIN courses c ON e.course_id = c.course_id
             JOIN timetables tt ON c.course_id = tt.course_id
             LEFT JOIN instructors i ON c.instructor_id = i.instructor_id
             WHERE e.student_id = ?
             ORDER BY 
                FIELD(tt.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
                tt.start_time ASC`,
            [studentId]
        );

        // Group lectures by day for easy front-end rendering
        const groupedByDay = {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: []
        };

        schedule.forEach(slot => {
            if (groupedByDay[slot.day_of_week]) {
                groupedByDay[slot.day_of_week].push(slot);
            }
        });

        return res.status(200).json({
            success: true,
            student_id: studentId,
            total_weekly_lectures: schedule.length,
            schedule_list: schedule,
            grouped_by_day: groupedByDay
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/timetable/course/:course_id
 * @desc    Fetch weekly lecture schedule for a specific course
 * @access  Protected
 */
router.get('/course/:course_id', verifyToken, async (req, res) => {
    try {
        const courseId = parseInt(req.params.course_id, 10);
        if (isNaN(courseId)) {
            return res.status(400).json({ success: false, error: 'Invalid course ID.' });
        }

        const [slots] = await db.query(
            `SELECT 
                tt.timetable_id,
                tt.course_id,
                c.course_code,
                c.title AS course_title,
                tt.day_of_week,
                TIME_FORMAT(tt.start_time, '%H:%i') AS start_time,
                TIME_FORMAT(tt.end_time, '%H:%i') AS end_time,
                tt.room_no
             FROM timetables tt
             JOIN courses c ON tt.course_id = c.course_id
             WHERE tt.course_id = ?
             ORDER BY 
                FIELD(tt.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
                tt.start_time ASC`,
            [courseId]
        );

        return res.status(200).json({
            success: true,
            course_id: courseId,
            count: slots.length,
            data: slots
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/timetable
 * @desc    Add a lecture timetable slot
 * @access  Protected (Admin only)
 */
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const { course_id, day_of_week, start_time, end_time, room_no } = req.body;

        if (!course_id || !day_of_week || !start_time || !end_time || !room_no) {
            return res.status(400).json({
                success: false,
                error: 'course_id, day_of_week, start_time, end_time, and room_no are required.'
            });
        }

        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        if (!validDays.includes(day_of_week)) {
            return res.status(400).json({
                success: false,
                error: `Invalid day_of_week. Must be one of: ${validDays.join(', ')}`
            });
        }

        const [result] = await db.query(
            `INSERT INTO timetables (course_id, day_of_week, start_time, end_time, room_no)
             VALUES (?, ?, ?, ?, ?)`,
            [course_id, day_of_week, start_time, end_time, room_no]
        );

        return res.status(201).json({
            success: true,
            message: 'Timetable entry added successfully.',
            timetable_id: result.insertId
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
