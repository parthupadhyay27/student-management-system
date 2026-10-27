# College Student Management System (SMS) - Enterprise Architecture

A production-ready, enterprise-grade full-stack **College Student Management System (SMS)** backend built with **MySQL 8.0+**, **Node.js**, and **Express.js**, strictly mirroring the 16-entity College Student Management System ER Diagram.

---

## 🏗️ Architecture & Project Structure

```text
college-student-management-system/
├── schema.sql              # MySQL DDL: 16 ER Diagram tables, constraints, foreign keys, cascade rules, indexes & seed data
├── procedures.sql          # Stored Procedure (GetStudentCompleteProfile) & automated database triggers
├── db.js                   # MySQL Connection Pool using mysql2/promise (multi-statements enabled)
├── server.js               # Master Express Server (Port 5000), Middlewares, Global Error Handler
├── .env                    # Environment variables configuration
├── .env.example            # Environment template
├── package.json            # Node.js dependencies & scripts
├── middleware/
│   └── auth.js             # JWT verification (verifyToken) & Role-based Access Control (requireRole)
└── routes/
    ├── auth.js             # Student, Faculty & Admin registration & login (bcryptjs + JWT)
    ├── departments.js      # Departments & Academic Programs CRUD (/api/departments)
    ├── students.js         # Student profiles, 360-degree integration (/api/students)
    ├── academic.js         # Courses, Faculty, Semesters, Sections, Enrollments, Attendance & Exam Results (/api/academic)
    ├── fees.js             # Invoices, Payments, and Financial Summary Ledger (/api/fees)
    ├── guardians.js        # Guardians and Student_Guardian M:N junction (/api/guardians)
    └── documents.js        # Student Document Submission and Tracking (/api/documents)
```

---

## 🗄️ Phase 1: Relational Database Schema (MySQL)

The relational schema strictly maps the **16 ER Diagram Tables** with primary keys, foreign keys, cascade rules, and unique constraints:

1. **`departments`**: `dept_id` (PK), `dept_name` (UNIQUE), `location`
2. **`programs`**: `program_id` (PK), `program_name` (UNIQUE), `duration` (in years)
3. **`students`**: `student_id` (PK), `roll_no` (UNIQUE), `first_name`, `last_name`, `blood_group`, `name` (generated), `dob`, `gender`, `email` (UNIQUE), `phone`, `address`, `admission_date`, `status`, `dept_id` (FK -> `departments`), `program_id` (FK -> `programs`), `password_hash`, `role`
4. **`faculty`**: `faculty_id` (PK), `name`, `email` (UNIQUE), `phone`, `dept_id` (FK -> `departments`), `designation`, `password_hash`, `role`
5. **`courses`**: `course_id` (PK), `course_code` (UNIQUE), `course_name`, `credits`, `dept_id` (FK -> `departments`)
   - *Mandated Offerings:*
     1. Data Structure and Algorithm (`CS201`)
     2. Principle of Management (`MG201`)
     3. Relational Database Management System (`CSC2131`)
     4. Object Oriented Programming (`CS202`)
     5. Computer Organization (`CS203`)
     6. Statistics and Probability (`MA201`)
6. **`semesters`**: `semester_id` (PK), `semester_no`, `academic_year`, `start_date`, `end_date`, **UNIQUE KEY(`semester_no`, `academic_year`)**
7. **`sections`**: `section_id` (PK), `course_id` (FK -> `courses`), `semester_id` (FK -> `semesters`), `faculty_id` (FK -> `faculty`), `section_name`, `room_no`, `schedule`, **UNIQUE KEY(`course_id`, `semester_id`, `section_name`)**
8. **`enrollments`**: `enrollment_id` (PK), `student_id` (FK -> `students`, CASCADE), `section_id` (FK -> `sections`, CASCADE), `enrollment_date`, `status`, **UNIQUE KEY(`student_id`, `section_id`)**
9. **`attendance`**: `attendance_id` (PK), `student_id` (FK -> `students`, CASCADE), `section_id` (FK -> `sections`, CASCADE), `attendance_date`, `status`, **UNIQUE KEY(`student_id`, `section_id`, `attendance_date`)**
10. **`exams`**: `exam_id` (PK), `section_id` (FK -> `sections`, CASCADE), `exam_type` ('Quiz', 'Midterm', 'Final', 'Assignment', 'Lab'), `exam_date`, `max_marks`
11. **`results`**: `result_id` (PK), `exam_id` (FK -> `exams`, CASCADE), `student_id` (FK -> `students`, CASCADE), `marks_obtained`, `grade`, **UNIQUE KEY(`exam_id`, `student_id`)**
12. **`fee_invoices`**: `invoice_id` (PK), `student_id` (FK -> `students`, CASCADE), `total_amount`, `due_date`, `status` ('Unpaid', 'Partially Paid', 'Paid', 'Overdue')
13. **`payments`**: `payment_id` (PK), `invoice_id` (FK -> `fee_invoices`, CASCADE), `amount_paid`, `payment_date`, `method`, `transaction_ref` (UNIQUE)
14. **`guardians`**: `guardian_id` (PK), `name`, `phone`, `email`, `relation`
15. **`student_guardians`**: `student_id` (FK -> `students`, CASCADE), `guardian_id` (FK -> `guardians`, CASCADE), **PRIMARY KEY(`student_id`, `guardian_id`)**
16. **`student_documents`**: `document_id` (PK), `student_id` (FK -> `students`, CASCADE), `document_type`, `document_path`, `submission_date`
17. **`admins`**: `admin_id` (PK), `username` (UNIQUE), `email` (UNIQUE), `password_hash`, `role`

---

## ⚙️ Stored Procedures & Triggers
 
### 1. Stored Procedure: `GenerateStudentReportCard(IN p_student_id INT, IN p_semester_id INT)`
Generates an official academic transcript / report card for a student:
1. **Student Demographics & Academic Registry Metadata**
2. **Detailed Course Performance & Grade Card** (across RDBMS, DSA, OOP, etc.)
3. **Aggregate Semester SGPA & Total Credits Earned**

### 2. Stored Procedure: `GetStudentCompleteProfile(IN input_student_id INT)`
Returns 7 atomic result sets in a single optimized database call:
1. **Student Demographics, Department & Program**
2. **Enrolled Sections, Courses, Faculty & Class Schedule**
3. **Attendance Aggregate Statistics & Attendance Percentage**
4. **Examination Results & Grade Breakdown**
5. **Fee Invoices, Payment Totals & Outstanding Balances**
6. **Associated Guardians & Contacts**
7. **Submitted Documents & Timestamps**

### 2. Database Triggers:
- **`trg_validate_result_insert` & `trg_validate_result_update`**: Validates `marks_obtained >= 0` and `marks_obtained <= exams.max_marks` using `SIGNAL SQLSTATE '45000'`.
- **`trg_update_invoice_status_after_payment`**: Automatically computes cumulative payments and updates invoice status to `'Paid'` or `'Partially Paid'`.

---

## 🔐 Phase 2: Security & Authentication

- **Connection Pool**: Powered by `mysql2/promise` with automatic keep-alive, connection pooling (`connectionLimit: 15`), and multiple statements support.
- **Passwords**: Hashed with `bcryptjs` (salt rounds: 10).
- **JWT Middleware**:
  - `verifyToken`: Extracts and verifies `Bearer` token from `Authorization` header, attaches payload `{ id, email, role, ... }` to `req.user`.
  - `requireRole(...roles)`: Enforces RBAC permissions across `admin`, `faculty`, and `student` roles.

---

## 📡 Phase 3 & 4: REST API Endpoints Overview

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/student/login` | Student login with email/roll_no & password | Public |
| POST | `/api/auth/student/register` | Student self-registration | Public |
| POST | `/api/auth/faculty/login` | Faculty login | Public |
| POST | `/api/auth/admin/login` | Admin login | Public |
| POST | `/api/auth/admin/register` | Admin registration | Public / Setup |
| GET | `/api/auth/me` | Fetch active user profile from JWT | Protected |

### Departments & Programs (`/api/departments`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/departments` | List all departments with faculty, course, student counts | Public / Authenticated |
| GET | `/api/departments/:id` | Get single department details | Public / Authenticated |
| POST | `/api/departments` | Create new department | Admin |
| PUT | `/api/departments/:id` | Update department details | Admin |
| DELETE | `/api/departments/:id` | Delete department (with integrity validation) | Admin |
| GET | `/api/departments/programs/list` | List all academic programs | Public / Authenticated |
| POST | `/api/departments/programs` | Create academic program | Admin |

### Students (`/api/students`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/students` | List students (filters: `dept_id`, `program_id`, `status`, `search`) | Protected |
| GET | `/api/students/:id` | Get student basic profile | Admin / Faculty / Self |
| GET | `/api/students/:id/complete-profile` | 360-degree comprehensive student profile | Admin / Faculty / Self |
| POST | `/api/students` | Register student with full ER fields | Admin |
| PUT | `/api/students/:id` | Update student profile | Admin / Self |
| DELETE | `/api/students/:id` | Delete student and cascade associated data | Admin |

### Academics, Sections & Enrollments (`/api/academic`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET / POST | `/api/academic/courses` | List / Create courses | Read: All, Write: Admin |
| GET / POST | `/api/academic/faculty` | List / Create faculty | Read: All, Write: Admin |
| GET / POST | `/api/academic/semesters` | List / Create semesters | Read: All, Write: Admin |
| GET / POST | `/api/academic/sections` | List / Create sections | Read: All, Write: Admin |
| GET | `/api/academic/sections/:id/students` | List enrolled students in section | Admin / Faculty |
| POST | `/api/academic/enroll` | Enroll student into section | Admin / Self |
| GET | `/api/academic/enrollments/student/:id` | Get all section enrollments for student | Admin / Faculty / Self |
| DELETE | `/api/academic/enrollments/:id` | Drop / withdraw enrollment | Admin / Self |
| POST | `/api/academic/attendance` | Record / upsert attendance | Admin / Faculty |
| POST | `/api/academic/attendance/batch` | Bulk record attendance for section | Admin / Faculty |
| GET | `/api/academic/attendance/student/:id` | Student attendance records & percentage | Admin / Faculty / Self |
| POST | `/api/academic/exams` | Schedule exam for section | Admin / Faculty |
| GET | `/api/academic/exams/section/:id` | Get scheduled exams for section | Protected |
| POST | `/api/academic/results` | Record exam result & grade | Admin / Faculty |
| GET | `/api/academic/results/student/:id` | Student exam result transcripts | Admin / Faculty / Self |

### Fees & Payments (`/api/fees`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/fees/summary` | Financial ledger statistics & dues breakdown | Admin |
| GET | `/api/fees/invoices` | List invoices (filters: `status`, `student_id`) | Admin |
| GET | `/api/fees/invoices/:id` | Single invoice with payment transaction history | Admin / Self |
| GET | `/api/fees/invoices/student/:id` | Student invoices and balances | Admin / Self |
| POST | `/api/fees/invoices` | Generate new fee invoice | Admin |
| PUT | `/api/fees/invoices/:id/status` | Update invoice status | Admin |
| POST | `/api/fees/payments` | Record payment against invoice (auto-updates status) | Admin / Self |
| GET | `/api/fees/payments` | List all payment transactions | Admin |

### Guardians & Documents (`/api/guardians`, `/api/documents`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET / POST | `/api/guardians` | List all / create new guardian | Admin |
| POST | `/api/guardians/assign` | Link guardian to student (`student_guardians`) | Admin |
| GET | `/api/guardians/student/:student_id` | Get guardians for a student | Admin / Self |
| DELETE | `/api/guardians/student/:student_id/guardian/:guardian_id` | Unlink guardian | Admin |
| GET | `/api/documents/student/:student_id` | Get student documents | Admin / Faculty / Self |
| POST | `/api/documents` | Upload / record document | Admin / Self |
| DELETE | `/api/documents/:id` | Delete document record | Admin |

---

## 🚀 Setup & Execution Guide

### 1. Database Setup (MySQL)
Open MySQL Shell or MySQL Workbench and run:
```sql
SOURCE /path/to/schema.sql;
SOURCE /path/to/procedures.sql;
```

### 2. Configure Environment (`.env`)
```ini
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=college_sms_db
DB_PORT=3306
JWT_SECRET=super_secret_enterprise_jwt_key_928374829104
JWT_EXPIRES_IN=7d
```

### 3. Install & Start Server
```bash
npm install
npm start
```
Server boots on `http://localhost:5000` with interactive endpoint catalog at `http://localhost:5000/api`.
