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
(101, 'SSC-101', 'B. Sahasra', '1st Class', 'Chinnammalu', '7093926533', '', '2026-06-05', 250.00, 250.00, 'active', 'Enrolled in 1st Class tuition program.'),
(102, 'SSC-102', 'G. Abhi', '1st Class', 'Santhoshi', '9014492194', '', '2026-06-01', 250.00, 250.00, 'active', 'Enrolled in 1st Class tuition program.'),
(103, 'SSC-103', 'T. Mokshasri', '1st Class', 'Raju', '7013529077', '', '2026-06-13', 250.00, 250.00, 'active', 'Enrolled in 1st Class tuition program.'),
(104, 'SSC-104', 'P. Greeshmanth', '1st Class', 'Anusha', '8143624278', '', '2026-06-01', 250.00, 250.00, 'active', 'Enrolled in 1st Class tuition program.'),
(105, 'SSC-105', 'S. Deekshith', '2nd Class', 'S. Venkata Ramana', '9550147016', '', '2026-06-01', 250.00, 250.00, 'active', 'Enrolled in 2nd Class tuition program.'),
(106, 'SSC-106', 'Shanmukh', '2nd Class', 'Kanaka Laxmi', '9652695362', '', '2026-06-06', 250.00, 250.00, 'active', 'Enrolled in 2nd Class tuition program.'),
(107, 'SSC-107', 'Neeha', '2nd Class', 'Padma', '9949122500', '', '2026-07-01', 250.00, 250.00, 'active', 'Enrolled in 2nd Class tuition program.'),
(108, 'SSC-108', 'Mustafa', '2nd Class', 'Asgari Khatoon', '7661917205', '', '2026-07-02', 250.00, 250.00, 'active', 'Enrolled in 2nd Class tuition program.'),
(109, 'SSC-109', 'R. Moksha Sri', '2nd Class', 'R. Laxmi', '9959999331', '', '2026-07-01', 250.00, 250.00, 'active', 'Enrolled in 2nd Class tuition program.'),
(110, 'SSC-110', 'B. Harshith', '3rd Class', 'Chinnammalu', '7093926533', '', '2026-06-05', 250.00, 250.00, 'active', 'Enrolled in 3rd Class tuition program.'),
(111, 'SSC-111', 'K. Praneeth', '3rd Class', 'Kalavathi', '8522987724', '', '2026-07-01', 250.00, 250.00, 'active', 'Enrolled in 3rd Class tuition program.'),
(112, 'SSC-112', 'Pragna', '3rd Class', 'P. Laxmi', '7989400223', '', '2026-08-05', 250.00, 250.00, 'active', 'Enrolled in 3rd Class tuition program.'),
(113, 'SSC-113', 'L. Lohith', '3rd Class', 'Rama Devi', '8498072498', '', '2026-11-02', 250.00, 0.00, 'active', 'Enrolled in 3rd Class tuition program.'),
(114, 'SSC-114', 'Asif', 'LKG', 'Sk. Fathima', '9603639829', '', '2026-06-28', 150.00, 150.00, 'active', 'Enrolled in LKG tuition program.'),
(115, 'SSC-115', 'Naveen', 'LKG', '', '8688491685', '', '2026-06-03', 150.00, 150.00, 'active', 'Enrolled in LKG tuition program.'),
(116, 'SSC-116', 'Purnima', 'UKG', '', '', '', '2026-06-03', 200.00, 200.00, 'active', 'Enrolled in UKG tuition program.'),
(117, 'SSC-117', 'Puneeth', '1st Class', 'Venkata', '', '', '2026-06-01', 200.00, 200.00, 'active', 'Enrolled in 1st Class tuition program.'),
(118, 'SSC-118', 'S. Yamini', '2nd Class', '', '', '', '2026-06-01', 250.00, 0.00, 'active', 'Enrolled in 2nd Class tuition program.'),
(119, 'SSC-119', 'S. Sathwik', '2nd Class', '', '', '', '2026-06-01', 250.00, 0.00, 'active', 'Enrolled in 2nd Class tuition program.'),
(120, 'SSC-120', 'P. Jaswanth', '3rd Class', 'P. Mariya', '8522975783', '', '2026-07-21', 250.00, 250.00, 'active', 'Enrolled in 3rd Class tuition program.'),
(121, 'SSC-121', 'K. Rithik', '4th Class', '', '', '', '2026-09-01', 250.00, 250.00, 'active', 'Enrolled in 4th Class tuition program.'),
(122, 'SSC-122', 'V. Bhuvana', '4th Class', 'Gayathri', '7989099355', '', '2026-07-01', 250.00, 250.00, 'active', 'Enrolled in 4th Class tuition program.'),
(123, 'SSC-123', 'G. Bhuvana', '4th Class', 'Rama Laxmi', '8096705337', '', '2026-07-01', 250.00, 250.00, 'active', 'Enrolled in 4th Class tuition program.'),
(124, 'SSC-124', 'L. Lasya', '4th Class', 'Kalavathi', '7013223101', '', '2026-08-04', 250.00, 250.00, 'active', 'Enrolled in 4th Class tuition program.'),
(125, 'SSC-125', 'Ch. Thamish', '5th Class', 'Ch. Ramesh', '7013244281', '', '2026-06-18', 250.00, 250.00, 'active', 'Enrolled in 5th Class tuition program.'),
(126, 'SSC-126', 'M.D. Golam Nabi', '5th Class', 'Asgari Khatoon', '7661917205', '', '2026-07-02', 250.00, 250.00, 'active', 'Enrolled in 5th Class tuition program.'),
(127, 'SSC-127', 'R. Deepika', '6th Class', 'R. Laxmi', '9959999331', '', '2026-07-01', 300.00, 300.00, 'active', 'Enrolled in 6th Class tuition program.'),
(128, 'SSC-128', 'S. Siva Karthik', '6th Class', 'S. Venkata Ramana', '9550147016', '', '2026-07-01', 300.00, 300.00, 'active', 'Enrolled in 6th Class tuition program.'),
(129, 'SSC-129', 'V. Chandini', '6th Class', 'V. Gayathri', '7989099355', '', '2026-07-01', 300.00, 300.00, 'active', 'Enrolled in 6th Class tuition program.'),
(130, 'SSC-130', 'Hasritha', '6th Class', 'P. Laxmi', '7989400223', '', '2026-08-05', 300.00, 300.00, 'active', 'Enrolled in 6th Class tuition program.'),
(131, 'SSC-131', 'P. Karthik', '6th Class', 'P. Sita', '8367044796', '', '2026-08-14', 300.00, 300.00, 'active', 'Enrolled in 6th Class tuition program.'),
(132, 'SSC-132', 'L. Poojith', '7th Class', 'L. Satyanarayana', '7013223101', '', '2026-07-03', 350.00, 350.00, 'active', 'Enrolled in 7th Class tuition program.'),
(133, 'SSC-133', 'Ch. Dilleshwara', '7th Class', 'Ch. Ramesh', '7013244281', '', '2026-06-18', 350.00, 350.00, 'active', 'Enrolled in 7th Class tuition program.'),
(134, 'SSC-134', 'G. Bhuvan', '7th Class', 'Rama Laxmi', '8096705337', '', '2026-07-01', 350.00, 350.00, 'active', 'Enrolled in 7th Class tuition program.'),
(135, 'SSC-135', 'G. Govind Sai', '7th Class', 'Santhoshi', '9014492194', '', '2026-06-01', 350.00, 350.00, 'active', 'Enrolled in 7th Class tuition program.'),
(136, 'SSC-136', 'K. Sharmila', '7th Class', 'Kalavathi', '8522987724', '', '2026-07-01', 350.00, 350.00, 'active', 'Enrolled in 7th Class tuition program.'),
(137, 'SSC-137', 'N. Manasa', '7th Class', 'Bhavani', '7680847263', '', '2026-06-24', 350.00, 350.00, 'active', 'Enrolled in 7th Class tuition program.'),
(138, 'SSC-138', 'Aamna Khatoon', '7th Class', 'Asgari Khatoon', '7661917205', '', '2026-07-02', 350.00, 350.00, 'active', 'Enrolled in 7th Class tuition program.'),
(139, 'SSC-139', 'M. Mokshitha', '8th Class', 'Nagaratnam', '8096473557', '', '2026-09-26', 400.00, 400.00, 'active', 'Enrolled in 8th Class tuition program.'),
(140, 'SSC-140', 'Ch. Gowthami Lasya', '9th Class', 'Santhoshi', '8179933203', '', '2026-06-19', 400.00, 400.00, 'active', 'Enrolled in 9th Class tuition program.')
ON CONFLICT (id) DO NOTHING;

-- Reset Student ID Sequence
SELECT setval('students_id_seq', (SELECT COALESCE(MAX(id), 140) FROM public.students));

-- 11.4 Seed Fee Records
INSERT INTO public.fee_records (student_id, month, amount, payment_date, mode, status, receipt_no, notes)
VALUES
(101, '2026-06', 250.00, '2026-06-08', 'Cash', 'Full Paid', 'REC-202606-101', 'Advance tuition fee credited at enrollment'),
(102, '2026-06', 250.00, '2026-06-17', 'Cash', 'Full Paid', 'REC-202606-102', 'Advance tuition fee credited at enrollment'),
(103, '2026-06', 250.00, '2026-06-18', 'Cash', 'Full Paid', 'REC-202606-103', 'Advance tuition fee credited at enrollment'),
(104, '2026-06', 250.00, '2026-06-18', 'Cash', 'Full Paid', 'REC-202606-104', 'Advance tuition fee credited at enrollment'),
(105, '2026-07', 250.00, '2026-07-12', 'Cash', 'Full Paid', 'REC-202607-105', 'Advance tuition fee credited at enrollment'),
(106, '2026-06', 250.00, '2026-06-18', 'Cash', 'Full Paid', 'REC-202606-106', 'Advance tuition fee credited at enrollment'),
(107, '2026-07', 250.00, '2026-07-01', 'Cash', 'Full Paid', 'REC-202607-107', 'Advance tuition fee credited at enrollment'),
(108, '2026-08', 250.00, '2026-08-21', 'Cash', 'Full Paid', 'REC-202608-108', 'Advance tuition fee credited at enrollment'),
(109, '2026-07', 250.00, '2026-07-10', 'Cash', 'Full Paid', 'REC-202607-109', 'Advance tuition fee credited at enrollment'),
(110, '2026-06', 250.00, '2026-06-08', 'Cash', 'Full Paid', 'REC-202606-110', 'Advance tuition fee credited at enrollment'),
(111, '2026-07', 250.00, '2026-07-15', 'Cash', 'Full Paid', 'REC-202607-111', 'Advance tuition fee credited at enrollment'),
(112, '2026-08', 250.00, '2026-08-05', 'Cash', 'Full Paid', 'REC-202608-112', 'Advance tuition fee credited at enrollment'),
(114, '2026-06', 150.00, '2026-06-28', 'Cash', 'Full Paid', 'REC-202606-114', 'Advance tuition fee credited at enrollment'),
(115, '2026-06', 150.00, '2026-06-03', 'Cash', 'Full Paid', 'REC-202606-115', 'Advance tuition fee credited at enrollment'),
(116, '2026-06', 200.00, '2026-06-03', 'Cash', 'Full Paid', 'REC-202606-116', 'Advance tuition fee credited at enrollment'),
(117, '2026-06', 200.00, '2026-06-01', 'Cash', 'Full Paid', 'REC-202606-117', 'Advance tuition fee credited at enrollment'),
(120, '2026-07', 250.00, '2026-07-21', 'Cash', 'Full Paid', 'REC-202607-120', 'Advance tuition fee credited at enrollment'),
(121, '2026-09', 250.00, '2026-09-01', 'Cash', 'Full Paid', 'REC-202609-121', 'Advance tuition fee credited at enrollment'),
(122, '2026-07', 250.00, '2026-07-16', 'Cash', 'Full Paid', 'REC-202607-122', 'Advance tuition fee credited at enrollment'),
(123, '2026-07', 250.00, '2026-07-01', 'Cash', 'Full Paid', 'REC-202607-123', 'Advance tuition fee credited at enrollment'),
(124, '2026-08', 250.00, '2026-08-26', 'Cash', 'Full Paid', 'REC-202608-124', 'Advance tuition fee credited at enrollment'),
(125, '2026-06', 250.00, '2026-06-20', 'Cash', 'Full Paid', 'REC-202606-125', 'Advance tuition fee credited at enrollment'),
(126, '2026-08', 250.00, '2026-08-21', 'Cash', 'Full Paid', 'REC-202608-126', 'Advance tuition fee credited at enrollment'),
(127, '2026-07', 300.00, '2026-07-10', 'Cash', 'Full Paid', 'REC-202607-127', 'Advance tuition fee credited at enrollment'),
(128, '2026-07', 300.00, '2026-07-12', 'Cash', 'Full Paid', 'REC-202607-128', 'Advance tuition fee credited at enrollment'),
(129, '2026-07', 300.00, '2026-07-16', 'Cash', 'Full Paid', 'REC-202607-129', 'Advance tuition fee credited at enrollment'),
(130, '2026-08', 300.00, '2026-08-15', 'Cash', 'Full Paid', 'REC-202608-130', 'Advance tuition fee credited at enrollment'),
(131, '2026-09', 300.00, '2026-09-01', 'Cash', 'Full Paid', 'REC-202609-131', 'Advance tuition fee credited at enrollment'),
(132, '2026-07', 350.00, '2026-07-24', 'Cash', 'Full Paid', 'REC-202607-132', 'Advance tuition fee credited at enrollment'),
(133, '2026-06', 350.00, '2026-06-26', 'Cash', 'Full Paid', 'REC-202606-133', 'Advance tuition fee credited at enrollment'),
(134, '2026-07', 350.00, '2026-07-01', 'Cash', 'Full Paid', 'REC-202607-134', 'Advance tuition fee credited at enrollment'),
(135, '2026-06', 350.00, '2026-06-17', 'Cash', 'Full Paid', 'REC-202606-135', 'Advance tuition fee credited at enrollment'),
(136, '2026-07', 350.00, '2026-07-15', 'Cash', 'Full Paid', 'REC-202607-136', 'Advance tuition fee credited at enrollment'),
(137, '2026-07', 350.00, '2026-07-27', 'Cash', 'Full Paid', 'REC-202607-137', 'Advance tuition fee credited at enrollment'),
(138, '2026-08', 350.00, '2026-08-21', 'Cash', 'Full Paid', 'REC-202608-138', 'Advance tuition fee credited at enrollment'),
(139, '2026-10', 400.00, '2026-10-29', 'Cash', 'Full Paid', 'REC-202610-139', 'Advance tuition fee credited at enrollment'),
(140, '2026-06', 400.00, '2026-06-12', 'Cash', 'Full Paid', 'REC-202606-140', 'Advance tuition fee credited at enrollment')
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
