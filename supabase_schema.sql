-- ============================================================================
-- SSC Students Study Circle - Complete Supabase PostgreSQL Schema
-- Tables: students, fee_records, books, classes, enrollment_requests,
--         staff_members, admin_notifications, recycle_bin
-- 
-- Configured for 100% error-free read/write access with the Supabase anon key:
-- - Row Level Security (RLS) disabled OR open permissive policies applied
-- - Full GRANT permissions for anon, authenticated, and service_role
-- - Realistic initial seed data covering LKG to Class 10
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. STUDENTS TABLE (LKG to Class 10)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.students (
    id BIGSERIAL PRIMARY KEY,
    roll_no VARCHAR(50) UNIQUE,
    name VARCHAR(150) NOT NULL,
    class VARCHAR(50) NOT NULL, -- 'LKG', 'UKG', '1st Class' through '10th Class'
    parent_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    school VARCHAR(200),
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 1200.00,
    advance_amount NUMERIC(10, 2) DEFAULT 0.00,
    advance_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'active', -- 'active', 'inactive'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 2. TUITION FEE & PAYMENT RECORDS TABLE (Fee Ledger)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.fee_records (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    receipt_no VARCHAR(100) UNIQUE,
    month VARCHAR(50) NOT NULL, -- e.g. '2026-01', 'January 2026'
    amount NUMERIC(10, 2) NOT NULL,
    payment_date VARCHAR(50) NOT NULL,
    mode VARCHAR(30) NOT NULL DEFAULT 'UPI', -- 'UPI', 'Cash', 'Bank Transfer', 'Cheque'
    status VARCHAR(30) NOT NULL DEFAULT 'Full Paid', -- 'Full Paid', 'Half Paid', 'Pending'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 3. BOOKS & STUDY MATERIALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.books (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    class VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Physical Book', -- 'Physical Book', 'Study Guide', 'Worksheet'
    subject VARCHAR(100) DEFAULT 'All Subjects',
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_free BOOLEAN NOT NULL DEFAULT FALSE,
    download_url TEXT,
    cover_image TEXT,
    badge VARCHAR(100),
    color_scheme VARCHAR(100),
    accent_color VARCHAR(50),
    title_color VARCHAR(50),
    inclusions VARCHAR(150),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 4. ACADEMIC CLASSES & BATCH PROGRAMS TABLE (LKG to Class 10)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.classes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    grade_code VARCHAR(50) NOT NULL,
    tag VARCHAR(100),
    max_students INT NOT NULL DEFAULT 12,
    batch_timings VARCHAR(120) NOT NULL DEFAULT '5:00 PM – 7:30 PM Regular',
    extended_timings VARCHAR(150) DEFAULT 'Until 8:00 PM or 8:30 PM occasionally for communication & activities',
    monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 1200.00,
    subjects TEXT,
    highlights TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 5. STUDENT ENROLLMENT APPLICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.enrollment_requests (
    id BIGSERIAL PRIMARY KEY,
    request_id VARCHAR(50) UNIQUE NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    requested_class VARCHAR(50) NOT NULL,
    parent_name VARCHAR(150) NOT NULL,
    father_name VARCHAR(150),
    mother_name VARCHAR(150),
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    school_name VARCHAR(200),
    board VARCHAR(50) DEFAULT 'State Board',
    stream_subject VARCHAR(200),
    additional_notes TEXT,
    coordinator_notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'contacted', 'approved', 'rejected'
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 6. STAFF & FACULTY DIRECTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.staff_members (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(50) NOT NULL DEFAULT 'staff', -- 'admin' (Director/Owner), 'staff' (Tutor/Office)
    status VARCHAR(50) NOT NULL DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 7. ADMIN ACTIVITY NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'system', -- 'enrollment', 'staff', 'payment', 'system'
    reference_id VARCHAR(100),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 8. RECYCLE BIN / TRASH PRESERVATION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.recycle_bin (
    bin_id VARCHAR(100) PRIMARY KEY,
    item_type VARCHAR(50) NOT NULL, -- 'student', 'book', 'class', 'enrollment', 'staff'
    original_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    item_data JSONB NOT NULL,
    deleted_by VARCHAR(150),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 9. PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_fee_records_student ON public.fee_records(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_records_receipt ON public.fee_records(receipt_no);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_status ON public.enrollment_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_books_class ON public.books(class);
CREATE INDEX IF NOT EXISTS idx_recycle_bin_type ON public.recycle_bin(item_type);

-- ============================================================================
-- 10. DISABLE ROW LEVEL SECURITY (RLS) FOR FULL PUBLIC / ANON KEY ACCESS
-- ============================================================================
-- Disabling RLS allows the frontend client with the Supabase anon key to 
-- SELECT, INSERT, UPDATE, and DELETE directly without 42501 permission errors.
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.books DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycle_bin DISABLE ROW LEVEL SECURITY;

-- Grant broad schema privileges to anon, authenticated, and service_role
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- ============================================================================
-- 11. INITIAL SEED DATA (Classes, Books, Students, Fees, Enrollments, Staff)
-- ============================================================================

-- 11.1 Classes (LKG to Class 10)
INSERT INTO public.classes (id, name, grade_code, tag, max_students, batch_timings, monthly_fee, subjects, highlights, is_active, display_order)
VALUES
('cls-lkg', 'LKG (Early Learning)', 'LKG', 'Early Learning', 8, '5:00 PM – 7:30 PM Regular', 1000.00, 'Alphabet Phonics, Numbers 1-20, Colors & Shapes', 'Safe environment, play-way phonics, motor skills', true, 1),
('cls-ukg', 'UKG (Kindergarten Prep)', 'UKG', 'Kindergarten Prep', 8, '5:00 PM – 7:30 PM Regular', 1000.00, 'Simple Word Formation, Numbers 1-50, Environmental GK & Rhymes', 'Reading readiness, simple addition, conversation practice', true, 2),
('cls-1st', '1st Class', '1st Class', 'Primary Foundation', 10, '5:00 PM – 7:30 PM Regular', 1100.00, 'Basic Addition, Subtraction 1-100, Sentence Building, Nature Studies', 'Handwriting fluency, basic mental arithmetic, guided reading', true, 3),
('cls-2nd', '2nd Class', '2nd Class', 'Primary Foundation', 10, '5:00 PM – 7:30 PM Regular', 1100.00, 'Numbers 1-1000, Spelling Rules, Environmental Studies, Reading', 'Concept-first learning, phonics fluency, daily worksheets', true, 4),
('cls-3rd', '3rd Class', '3rd Class', 'Primary Level', 10, '5:00 PM – 7:30 PM Regular', 1200.00, 'Multiplication Tables, Division, English Grammar, General Science', 'Small batches, multiplication tables mastery, creative composition', true, 5),
('cls-4th', '4th Class', '4th Class', 'Junior Prep', 12, '5:00 PM – 7:30 PM Regular', 1300.00, 'Multi-digit Arithmetic, Matter & Water Cycle, Social Studies', 'Problem solving, comprehension drills, weekly test tracking', true, 6),
('cls-5th', '5th Class', '5th Class', 'Middle School Prep', 12, '5:00 PM – 7:30 PM Regular', 1400.00, 'Fractions, Factors, HCF & LCM, General Science, Advanced English', 'Middle school transition, rigorous concept clarity, diagnostic reviews', true, 7),
('cls-6th', '6th Class', '6th Class', 'Secondary Foundation', 12, '5:00 PM – 7:30 PM Regular', 1500.00, 'Integers, Algebra Intro, Separation of Substances, Light & Shadows', 'Separate science branches, algebra foundation, analytical thinking', true, 8),
('cls-7th', '7th Class', '7th Class', 'Secondary Foundation', 12, '5:00 PM – 7:30 PM Regular', 1600.00, 'Linear Equations, Triangle Properties, Acids & Bases, Electric Current', 'Speed arithmetic, equation solving, weekly test orientation', true, 9),
('cls-8th', '8th Class', '8th Class', 'Advanced Secondary', 12, '5:00 PM – 7:30 PM Regular', 1700.00, 'Quadrilaterals, Factorization, Force & Pressure, Sound, Grammar', 'High school bridge, theorems & proofs, comprehensive science', true, 10),
('cls-9th', '9th Class', '9th Class', 'Board Preparation', 15, '5:00 PM – 7:30 PM Regular', 1800.00, 'Polynomials, Coordinate Geometry, Laws of Motion, Atoms, Tissues', 'CBSE & State Board depth, numerical mastery, mock assessments', true, 11),
('cls-10th', '10th Class', '10th Class', 'Board Excellence', 15, '5:00 PM – 7:30 PM Regular', 2000.00, 'Trigonometry, Real Numbers, Electricity, Chemical Reactions, Life Processes', '10-year paper solutions, time management drills, mock board exams', true, 12)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_fee = EXCLUDED.monthly_fee,
    batch_timings = EXCLUDED.batch_timings;

-- 11.2 Books & Study Materials
INSERT INTO public.books (id, title, class, category, subject, description, price, is_available, is_free, download_url, badge, color_scheme, accent_color, title_color, inclusions, display_order)
VALUES
('B00-LKG', 'Early Fun Phonics & Numbers', 'LKG & UKG', 'Physical Book', 'Phonics & Numbers', 'Alphabet sounds, tracing activities, and colorful early arithmetic for preschoolers.', 180.00, true, false, null, 'SSC Kids', 'from-[#EC4899] via-[#F43F5E] to-[#FB7185]', '#BE185D', 'text-white', 'SSC Kids • Phonics & Numbers', 1),
('B01', 'Mathematics Guide & Practice', '6th Class', 'Physical Book', 'Mathematics', 'Comprehensive chapter explanations, solved arithmetic, geometry diagrams, and 500+ practice questions.', 280.00, true, false, null, 'SSC Series', 'from-[#1E6091] via-[#1A759F] to-[#52B69A]', '#16425B', 'text-yellow-300', 'SSC Series • NCERT & State Board Aligned', 2),
('B02', 'English Grammar & Composition', '5th Class', 'Physical Book', 'English', 'Interactive grammar rules, reading comprehension stories, vocabulary lists, and creative writing prompts.', 250.00, true, false, null, 'SSC Readers', 'from-[#40916C] via-[#52B788] to-[#95D5B2]', '#2D6A4F', 'text-white', 'SSC Readers • Grammar & Stories', 3),
('B03', 'Science Concepts & Experiments', '7th Class', 'Physical Book', 'Science', 'Concepts in Physics, Chemistry and Biology with illustrated laboratory activities and experiment guides.', 320.00, true, false, null, 'SSC Explorer', 'from-[#1B263B] via-[#0D1B2A] to-[#415A77]', '#0D1B2A', 'text-cyan-300', 'SSC Explorer • Physics & Bio', 4),
('B04', 'Mathematics Foundation', '3rd Class', 'Physical Book', 'Mathematics', 'Step-by-step arithmetic, multiplication tables, division basics, and illustrated word problems.', 220.00, true, false, null, 'SSC Foundation', 'from-[#D97706] via-[#B45309] to-[#F59E0B]', '#92400E', 'text-white', 'SSC Foundation • Step-by-Step Math', 5),
('B05', 'Environmental Science Explorer', '4th Class', 'Physical Book', 'Science & EVS', 'Fascinating lessons on nature, the human body, weather, and environmental preservation.', 240.00, true, false, null, 'SSC Green', 'from-[#047857] via-[#065F46] to-[#10B981]', '#064E3B', 'text-emerald-200', 'SSC Green • Nature & Science', 6),
('B06', 'Mathematics Mastery & Practice', '2nd Class', 'Physical Book', 'Mathematics', 'Foundational number concepts, skip counting, basic addition, and fun mathematical puzzles.', 200.00, true, false, null, 'SSC Juniors', 'from-[#BE123C] via-[#9F1239] to-[#E11D48]', '#881337', 'text-amber-200', 'SSC Juniors • Number Games & Puzzles', 7),
('B07-10th', 'Board Exam Mathematics Master', '10th Class', 'Physical Book', 'Mathematics', 'Complete board curriculum coverage, previous 10-year solved papers, and formula quick-reference.', 350.00, true, false, null, 'Board Exam Special', 'from-[#4C1D95] via-[#5B21B6] to-[#7C3AED]', '#3B0764', 'text-yellow-300', 'Board Exam Special • 10-Year Solved Papers', 8),
('FM01', 'Class 6 Mathematics - Key Concepts & Formula Sheet', '6th Class', 'Study Guide', 'Mathematics', 'Quick reference formula booklet covering integers, whole numbers, prime factorization, and geometry basics.', 0.00, true, true, 'assets/downloads/SSC_Class_6_Mathematics_Sample_Notes.pdf', 'Free Download', null, null, null, null, 9),
('FM02', 'Class 5 English - Grammar Essentials & Vocabulary Guide', '5th Class', 'Worksheet', 'English', 'Essential rules for parts of speech, tense structures, sentence diagrams, and 50 important vocabulary words.', 0.00, true, true, 'assets/downloads/SSC_Class_5_English_Grammar_Sample.pdf', 'Free Download', null, null, null, null, 10),
('FM03', 'Class 7 Science - Quick Revision Summary & Diagrams', '7th Class', 'Study Guide', 'Science', 'Concise summary of plant nutrition, digestive system, heat transfer laws, and acids/bases chemical indicators.', 0.00, true, true, 'assets/downloads/SSC_Class_7_Science_Revision_Notes.pdf', 'Free Download', null, null, null, null, 11),
('FM04', 'SSC Comprehensive Tuition Curriculum & Yearly Routine', 'All Classes', 'Study Guide', 'General Curriculum', 'Full academic calendar, daily routine (5:00 PM – 7:30 PM regular, extended up to 8:30 PM for activities), and mentoring methodology.', 0.00, true, true, 'assets/downloads/SSC_Tuition_Curriculum_and_Syllabus.pdf', 'Free Download', null, null, null, null, 12)
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    is_available = EXCLUDED.is_available,
    download_url = EXCLUDED.download_url;

-- 11.3 Registered Students (LKG to 10th Class)
INSERT INTO public.students (id, roll_no, name, class, parent_name, phone, school, joining_date, monthly_fee, advance_amount, status, notes)
VALUES
(1, 'SSC-2026-001', 'Poojith Reddy', '6th Class', 'Venkat Rao', '9849012345', 'St. Mary High School', '2026-01-05', 1500.00, 1500.00, 'active', 'Excels in Arithmetic, needs guidance in English composition.'),
(2, 'SSC-2026-002', 'Lasya Priya', '5th Class', 'Srinivas Murthy', '9123456789', 'Kendriya Vidyalaya', '2026-01-10', 1400.00, 1400.00, 'active', 'Good in reading, focused on Science foundations.'),
(3, 'SSC-2026-003', 'Rohan Sharma', '4th Class', 'Rajesh Sharma', '9988766554', 'Delhi Public School', '2026-01-15', 1300.00, 0.00, 'active', 'Regular student, very attentive in mental math.'),
(4, 'SSC-2026-004', 'Saanvi K.', '3rd Class', 'Naveen Kumar', '9012345678', 'Bhavans Vidya Mandir', '2026-01-20', 1200.00, 1200.00, 'active', 'Needs daily practice in cursive handwriting.'),
(5, 'SSC-2026-005', 'Aditya Varma', '7th Class', 'Prasad Varma', '9345678901', 'Chaitanya Techno School', '2026-01-08', 1600.00, 0.00, 'active', 'Focusing on Algebra linear equations.'),
(6, 'SSC-2026-006', 'Ananya S.', '2nd Class', 'Sudhakar', '9848123456', 'St. Ann’s High School', '2026-02-01', 1100.00, 1100.00, 'active', 'Energetic learner, strong reading fluency.'),
(7, 'SSC-2026-007', 'Karthik Teja', '10th Class', 'Ramesh Babu', '9908123456', 'Narayana High School', '2026-01-02', 2000.00, 2000.00, 'active', 'Board Exam batch, preparing Trigonometry.'),
(8, 'SSC-2026-008', 'Tanvi M.', 'LKG', 'Manohar', '9701234567', 'EuroKids Preschool', '2026-02-15', 1000.00, 1000.00, 'active', 'Early phonics, letter tracing and counting.'),
(9, 'SSC-2026-009', 'Aryan Goud', 'UKG', 'Mallikarjun', '9652134567', 'Little Angels School', '2026-01-18', 1000.00, 1000.00, 'active', 'Word formation, rhymes, daily activity sheet.'),
(10, 'SSC-2026-010', 'Bhavana Ch.', '1st Class', 'Chandrashekar', '9866123456', 'St. Joseph School', '2026-01-12', 1100.00, 0.00, 'active', 'Reading practice and number operations 1-100.'),
(11, 'SSC-2026-011', 'Varun Tej', '8th Class', 'Gopal Krishna', '9440123456', 'State High School', '2026-01-04', 1700.00, 1700.00, 'active', 'Science and Mathematics foundation.'),
(12, 'SSC-2026-012', 'Meghana R.', '9th Class', 'Ravinder Rao', '9391123456', 'Kendriya Vidyalaya Picket', '2026-01-25', 1800.00, 0.00, 'active', 'Focus on Physics numericals and Chemistry symbols.')
ON CONFLICT (id) DO NOTHING;

-- Reset Student ID Sequence
SELECT setval('students_id_seq', (SELECT COALESCE(MAX(id), 12) FROM public.students));

-- 11.4 Seed Fee Records
INSERT INTO public.fee_records (student_id, month, amount, payment_date, mode, status, receipt_no, notes)
VALUES
(1, '2026-01', 1500.00, '2026-01-05', 'UPI', 'Full Paid', 'REC-202601-101', 'Advance fee collected at joining'),
(1, '2026-02', 1500.00, '2026-02-06', 'UPI', 'Full Paid', 'REC-202602-101', 'February tuition fee cleared'),
(1, '2026-03', 750.00, '2026-03-05', 'UPI', 'Half Paid', 'REC-202603-101', 'Part 1 payment paid (Balance ₹750)'),
(2, '2026-01', 1400.00, '2026-01-10', 'Cash', 'Full Paid', 'REC-202601-102', 'January fee paid'),
(2, '2026-02', 700.00, '2026-02-10', 'Cash', 'Half Paid', 'REC-202602-102', 'First installment paid (Balance ₹700)'),
(2, '2026-02', 700.00, '2026-02-18', 'UPI', 'Full Paid', 'REC-202602-103', 'Second installment cleared (Full Paid)'),
(3, '2026-01', 1300.00, '2026-01-15', 'UPI', 'Full Paid', 'REC-202601-103', 'January fee paid via GPay'),
(3, '2026-02', 650.00, '2026-02-15', 'Cash', 'Half Paid', 'REC-202602-104', 'Half fee paid (Remaining ₹650)'),
(4, '2026-01', 1200.00, '2026-01-20', 'Cash', 'Full Paid', 'REC-202601-104', 'Paid in full'),
(5, '2026-01', 1600.00, '2026-01-08', 'UPI', 'Full Paid', 'REC-202601-105', 'January paid'),
(5, '2026-02', 1600.00, '2026-02-09', 'UPI', 'Full Paid', 'REC-202602-105', 'February paid'),
(6, '2026-02', 1100.00, '2026-02-01', 'Cash', 'Full Paid', 'REC-202602-106', 'Advance fee collected'),
(7, '2026-01', 2000.00, '2026-01-02', 'UPI', 'Full Paid', 'REC-202601-106', 'January fee paid'),
(7, '2026-02', 1000.00, '2026-02-05', 'UPI', 'Half Paid', 'REC-202602-107', 'Half fee paid ₹1,000'),
(8, '2026-02', 1000.00, '2026-02-15', 'Cash', 'Full Paid', 'REC-202602-108', 'February enrollment fee paid'),
(9, '2026-01', 1000.00, '2026-01-18', 'Cash', 'Full Paid', 'REC-202601-107', 'January fee paid'),
(10, '2026-01', 1100.00, '2026-01-12', 'UPI', 'Full Paid', 'REC-202601-108', 'Paid in full'),
(10, '2026-02', 550.00, '2026-02-14', 'Cash', 'Half Paid', 'REC-202602-109', 'Half fee paid (Remaining ₹550)'),
(11, '2026-01', 1700.00, '2026-01-04', 'UPI', 'Full Paid', 'REC-202601-109', 'January fee cleared'),
(11, '2026-02', 1700.00, '2026-02-05', 'UPI', 'Full Paid', 'REC-202602-110', 'February fee cleared'),
(12, '2026-01', 900.00, '2026-01-25', 'UPI', 'Half Paid', 'REC-202601-110', 'Partial payment paid (Balance ₹900)')
ON CONFLICT (receipt_no) DO NOTHING;

-- 11.5 Seed Enrollment Requests
INSERT INTO public.enrollment_requests (request_id, student_name, requested_class, parent_name, father_name, mother_name, phone, school_name, board, stream_subject, additional_notes, status, is_read)
VALUES
('SSC-ENR-2026-1001', 'Abhinav Reddy', '9th Class', 'Sudhakar Reddy', 'Sudhakar Reddy', 'Sunita Reddy', '9849012345', 'Delhi Public School', 'CBSE', 'Mathematics & Science Focus', 'Needs special guidance in Algebra and Physics numericals.', 'pending', false),
('SSC-ENR-2026-1002', 'Samyuktha Rao', '6th Class', 'Anil Kumar Rao', 'Anil Kumar Rao', 'Padma', '9876523456', 'St. Ann’s High School', 'State Board', 'All Subjects Comprehensive', 'Seeking evening batch from 5 PM.', 'pending', false),
('SSC-ENR-2026-1003', 'Charan Teja', '10th Class', 'Srinivasulu', 'Srinivasulu', 'Kavitha', '9908134567', 'Narayana Olympiad School', 'State Board', 'Board Exam Intensive Prep', 'Contacted parent via call, scheduling orientation.', 'contacted', true)
ON CONFLICT (request_id) DO NOTHING;

-- 11.6 Seed Staff Members
INSERT INTO public.staff_members (id, email, full_name, phone, role, status)
VALUES
('stf-001', 'admin@sscstudycircle.com', 'Center Director', '8919961354', 'admin', 'approved'),
('stf-002', 'faculty.math@sscstudycircle.com', 'Srinivasa Rao (Senior Math Tutor)', '9849055667', 'staff', 'approved'),
('stf-003', 'counselor@sscstudycircle.com', 'Ananya Sharma (Academic Counselor)', '9701233445', 'staff', 'pending')
ON CONFLICT (id) DO NOTHING;

-- 11.7 Seed Notifications
INSERT INTO public.admin_notifications (id, title, message, type, reference_id, is_read)
VALUES
('notif-1', 'New Enrollment Application', 'Parent Sudhakar Reddy submitted an enrollment request for Abhinav Reddy (9th Class).', 'enrollment', 'SSC-ENR-2026-1001', false),
('notif-2', 'New Enrollment Application', 'Parent Anil Kumar Rao submitted an enrollment request for Samyuktha Rao (6th Class).', 'enrollment', 'SSC-ENR-2026-1002', false),
('notif-3', 'Staff Registration Pending', 'Ananya Sharma (counselor@sscstudycircle.com) submitted registration awaiting Director approval.', 'staff', 'stf-003', false)
ON CONFLICT (id) DO NOTHING;
