/**
 * SSC Students Study Circle - Centralized Reactive Store (Single Source of Truth)
 * Provides 100% Real-Time Global Interlinking across:
 * - Students <-> Class Counters <-> Admin Overview <-> Fee Ledger
 * - Fee Ledger (Jan-Dec) <-> Student Status Badges <-> Revenue Metrics <-> Payment Receipts
 * - Enrollments <-> Active Students
 * - Books & Classes <-> Public Catalogs & Admin Dashboard
 *
 * Official WhatsApp Contact: +91 8919961354 (8919961354)
 */

const SSC_STORE_KEY = 'ssc_tuition_central_store_v4';
const SSC_OFFICIAL_WHATSAPP = '8919961354';
const SSC_OFFICIAL_PHONE_DISPLAY = '+91 8919961354';

// Helper: Format ISO date (YYYY-MM-DD) to friendly UI display (DD MMM YYYY)
function formatISODateDisplay(isoString) {
  if (!isoString) return '—';
  // If already in friendly format like "03 Jul 2025"
  if (isoString.includes(' ') && !isoString.includes('-')) return isoString;
  const parts = isoString.split('-');
  if (parts.length !== 3) return isoString;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Initial Classes (LKG through 10th Class)
const INITIAL_CLASSES = [
  { id: 'cls-lkg', name: 'LKG (Early Learning)', gradeCode: 'LKG', tag: 'Early Learning', maxStudents: 8, batchTimings: '5:00 PM – 7:30 PM Regular', monthlyFee: 1000, subjects: 'Alphabet Recognition & Phonics, Numbers 1-20, Shapes & Rhymes', highlights: 'Safe environment, play-way phonics, motor skills', isActive: true, displayOrder: 1 },
  { id: 'cls-ukg', name: 'UKG (Kindergarten Prep)', gradeCode: 'UKG', tag: 'Kindergarten Prep', maxStudents: 8, batchTimings: '5:00 PM – 7:30 PM Regular', monthlyFee: 1000, subjects: 'Simple Word Formation, Numbers 1-50, Environmental GK & Rhymes', highlights: 'Reading readiness, simple addition, conversation practice', isActive: true, displayOrder: 2 },
  { id: 'cls-1st', name: '1st Class', gradeCode: '1st Class', tag: 'Primary Foundation', maxStudents: 10, batchTimings: '5:00 PM – 7:30 PM Regular', monthlyFee: 1100, subjects: 'Basic Addition, Subtraction 1-100, Sentence Building, Nature Studies', highlights: 'Handwriting fluency, basic mental arithmetic, guided reading', isActive: true, displayOrder: 3 },
  { id: 'cls-2nd', name: '2nd Class', gradeCode: '2nd Class', tag: 'Primary Foundation', maxStudents: 10, batchTimings: '5:00 PM – 7:30 PM Regular', monthlyFee: 1100, subjects: 'Numbers 1-1000, Spelling Rules, Environmental Studies, Reading', highlights: 'Concept-first learning, phonics fluency, daily worksheets', isActive: true, displayOrder: 4 },
  { id: 'cls-3rd', name: '3rd Class', gradeCode: '3rd Class', tag: 'Primary Level', maxStudents: 10, batchTimings: '5:00 PM – 7:30 PM Regular', monthlyFee: 1200, subjects: 'Multiplication Tables, Division, English Grammar, General Science', highlights: 'Small batches, multiplication tables mastery, creative composition', isActive: true, displayOrder: 5 },
  { id: 'cls-4th', name: '4th Class', gradeCode: '4th Class', tag: 'Junior Prep', maxStudents: 12, batchTimings: '5:00 PM – 7:30 PM Regular', monthlyFee: 1300, subjects: 'Multi-digit Arithmetic, Matter & Water Cycle, Social Studies', highlights: 'Problem solving, comprehension drills, weekly test tracking', isActive: true, displayOrder: 6 },
  { id: 'cls-5th', name: '5th Class', gradeCode: '5th Class', tag: 'Middle School Prep', maxStudents: 12, batchTimings: '5:00 PM – 7:30 PM Regular', monthlyFee: 1400, subjects: 'Fractions, Factors, HCF & LCM, General Science, Advanced English', highlights: 'Middle school transition, rigorous concept clarity, diagnostic reviews', isActive: true, displayOrder: 7 },
  { id: 'cls-6th', name: '6th Class', gradeCode: '6th Class', tag: 'Secondary Foundation', maxStudents: 12, batchTimings: '5:00 PM – 7:30 PM Regular', monthlyFee: 1500, subjects: 'Integers, Algebra Intro, Separation of Substances, Light & Shadows', highlights: 'Separate science branches, algebra foundation, analytical thinking', isActive: true, displayOrder: 8 },
  { id: 'cls-7th', name: '7th Class', gradeCode: '7th Class', tag: 'Secondary Foundation', maxStudents: 12, batchTimings: '5:00 PM – 7:30 PM Regular', monthlyFee: 1600, subjects: 'Linear Equations, Triangle Properties, Acids & Bases, Electric Current', highlights: 'Speed arithmetic, equation solving, weekly test orientation', isActive: true, displayOrder: 9 },
  { id: 'cls-8th', name: '8th Class', gradeCode: '8th Class', tag: 'Advanced Secondary', maxStudents: 12, batchTimings: '5:00 PM – 7:30 PM Regular', monthlyFee: 1700, subjects: 'Quadrilaterals, Factorization, Force & Pressure, Sound, Grammar', highlights: 'High school bridge, theorems & proofs, comprehensive science', isActive: true, displayOrder: 10 },
  { id: 'cls-9th', name: '9th Class', gradeCode: '9th Class', tag: 'Board Preparation', maxStudents: 15, batchTimings: '5:00 PM – 7:30 PM Regular', monthlyFee: 1800, subjects: 'Polynomials, Coordinate Geometry, Laws of Motion, Atoms, Tissues', highlights: 'CBSE & State Board depth, numerical mastery, mock assessments', isActive: true, displayOrder: 11 },
  { id: 'cls-10th', name: '10th Class', gradeCode: '10th Class', tag: 'Board Excellence', maxStudents: 15, batchTimings: '5:00 PM – 7:30 PM Regular', monthlyFee: 2000, subjects: 'Trigonometry, Real Numbers, Electricity, Chemical Reactions, Life Processes', highlights: '10-year paper solutions, time management drills, mock board exams', isActive: true, displayOrder: 12 }
];

// Initial Books & Materials
const INITIAL_BOOKS = [
  { id: 'B00-LKG', title: 'Early Fun Phonics & Numbers', class: 'LKG & UKG', category: 'Physical Book', subject: 'Phonics & Numbers', description: 'Alphabet sounds, tracing activities, and colorful early arithmetic for preschoolers.', price: 180, isAvailable: true, isFree: false, downloadUrl: null, badge: 'SSC Kids', colorScheme: 'from-[#EC4899] via-[#F43F5E] to-[#FB7185]', accentColor: '#BE185D', titleColor: 'text-white', inclusions: 'SSC Kids • Phonics & Numbers', displayOrder: 1 },
  { id: 'B01', title: 'Mathematics Guide & Practice', class: '6th Class', category: 'Physical Book', subject: 'Mathematics', description: 'Comprehensive chapter explanations, solved arithmetic, geometry diagrams, and 500+ practice questions.', price: 280, isAvailable: true, isFree: false, downloadUrl: null, badge: 'SSC Series', colorScheme: 'from-[#1E6091] via-[#1A759F] to-[#52B69A]', accentColor: '#16425B', titleColor: 'text-yellow-300', inclusions: 'SSC Series • NCERT & State Board Aligned', displayOrder: 2 },
  { id: 'B02', title: 'English Grammar & Composition', class: '5th Class', category: 'Physical Book', subject: 'English', description: 'Interactive grammar rules, reading comprehension stories, vocabulary lists, and creative writing prompts.', price: 250, isAvailable: true, isFree: false, downloadUrl: null, badge: 'SSC Readers', colorScheme: 'from-[#40916C] via-[#52B788] to-[#95D5B2]', accentColor: '#2D6A4F', titleColor: 'text-white', inclusions: 'SSC Readers • Grammar & Stories', displayOrder: 3 },
  { id: 'B03', title: 'Science Concepts & Experiments', class: '7th Class', category: 'Physical Book', subject: 'Science', description: 'Concepts in Physics, Chemistry and Biology with illustrated laboratory activities and experiment guides.', price: 320, isAvailable: true, isFree: false, downloadUrl: null, badge: 'SSC Explorer', colorScheme: 'from-[#1B263B] via-[#0D1B2A] to-[#415A77]', accentColor: '#0D1B2A', titleColor: 'text-cyan-300', inclusions: 'SSC Explorer • Physics & Bio', displayOrder: 4 },
  { id: 'B04', title: 'Mathematics Foundation', class: '3rd Class', category: 'Physical Book', subject: 'Mathematics', description: 'Step-by-step arithmetic, multiplication tables, division basics, and illustrated word problems.', price: 220, isAvailable: true, isFree: false, downloadUrl: null, badge: 'SSC Foundation', colorScheme: 'from-[#D97706] via-[#B45309] to-[#F59E0B]', accentColor: '#92400E', titleColor: 'text-white', inclusions: 'SSC Foundation • Step-by-Step Math', displayOrder: 5 },
  { id: 'B05', title: 'Environmental Science Explorer', class: '4th Class', category: 'Physical Book', subject: 'Science & EVS', description: 'Fascinating lessons on nature, the human body, weather, and environmental preservation.', price: 240, isAvailable: true, isFree: false, downloadUrl: null, badge: 'SSC Green', colorScheme: 'from-[#047857] via-[#065F46] to-[#10B981]', accentColor: '#064E3B', titleColor: 'text-emerald-200', inclusions: 'SSC Green • Nature & Science', displayOrder: 6 },
  { id: 'B06', title: 'Mathematics Mastery & Practice', class: '2nd Class', category: 'Physical Book', subject: 'Mathematics', description: 'Foundational number concepts, skip counting, basic addition, and fun mathematical puzzles.', price: 200, isAvailable: true, isFree: false, downloadUrl: null, badge: 'SSC Juniors', colorScheme: 'from-[#BE123C] via-[#9F1239] to-[#E11D48]', accentColor: '#881337', titleColor: 'text-amber-200', inclusions: 'SSC Juniors • Number Games & Puzzles', displayOrder: 7 },
  { id: 'B07-10th', title: 'Board Exam Mathematics Master', class: '10th Class', category: 'Physical Book', subject: 'Mathematics', description: 'Complete board curriculum coverage, previous 10-year solved papers, and formula quick-reference.', price: 350, isAvailable: true, isFree: false, downloadUrl: null, badge: 'Board Exam Special', colorScheme: 'from-[#4C1D95] via-[#5B21B6] to-[#7C3AED]', accentColor: '#3B0764', titleColor: 'text-yellow-300', inclusions: 'Board Exam Special • 10-Year Solved Papers', displayOrder: 8 },
  // Free Materials
  { id: 'FM01', title: 'Class 6 Mathematics - Key Concepts & Formula Sheet', class: '6th Class', category: 'Study Guide', subject: 'Mathematics', description: 'Quick reference formula booklet covering integers, whole numbers, prime factorization, and geometry basics.', price: 0, isAvailable: true, isFree: true, downloadUrl: 'assets/downloads/SSC_Class_6_Mathematics_Sample_Notes.pdf', badge: 'Free Download', displayOrder: 9 },
  { id: 'FM02', title: 'Class 5 English - Grammar Essentials & Vocabulary Guide', class: '5th Class', category: 'Worksheet', subject: 'English', description: 'Essential rules for parts of speech, tense structures, sentence diagrams, and 50 important vocabulary words.', price: 0, isAvailable: true, isFree: true, downloadUrl: 'assets/downloads/SSC_Class_5_English_Grammar_Sample.pdf', badge: 'Free Download', displayOrder: 10 },
  { id: 'FM03', title: 'Class 7 Science - Quick Revision Summary & Diagrams', class: '7th Class', category: 'Study Guide', subject: 'Science', description: 'Concise summary of plant nutrition, digestive system, heat transfer laws, and acids/bases chemical indicators.', price: 0, isAvailable: true, isFree: true, downloadUrl: 'assets/downloads/SSC_Class_7_Science_Revision_Notes.pdf', badge: 'Free Download', displayOrder: 11 },
  { id: 'FM04', title: 'SSC Comprehensive Tuition Curriculum & Yearly Routine', class: 'All Classes', category: 'Study Guide', subject: 'General Curriculum', description: 'Full academic calendar, daily routine (5:00 PM – 7:30 PM regular, extended up to 8:30 PM for activities), and mentoring methodology.', price: 0, isAvailable: true, isFree: true, downloadUrl: 'assets/downloads/SSC_Tuition_Curriculum_and_Syllabus.pdf', badge: 'Free Download', displayOrder: 12 }
];

// Initial Registered Students (ISO dates, 10-digit mobile numbers, Fee History covering Full, Half/Partial, and Pending states)
const INITIAL_STUDENTS = [
  {
    id: 1,
    rollNo: 'SSC-2026-001',
    name: 'Poojith Reddy',
    class: '6th Class',
    parentName: 'Venkat Rao',
    phone: '9849012345',
    school: 'St. Mary High School',
    joiningDate: '2026-01-05',
    monthlyFee: 1500,
    advanceAmount: 1500,
    notes: 'Excels in Arithmetic, needs guidance in English composition.',
    status: 'active',
    feeHistory: [
      { id: 'PAY-1001', receiptNo: 'REC-202601-101', year: 2026, month: 1, amount: 1500, date: '2026-01-05', mode: 'UPI', notes: 'Advance fee collected at joining' },
      { id: 'PAY-1002', receiptNo: 'REC-202602-101', year: 2026, month: 2, amount: 1500, date: '2026-02-06', mode: 'UPI', notes: 'February tuition fee cleared' },
      { id: 'PAY-1003', receiptNo: 'REC-202603-101', year: 2026, month: 3, amount: 750, date: '2026-03-05', mode: 'UPI', notes: 'Part 1 payment paid (Balance ₹750)' }
    ]
  },
  {
    id: 2,
    rollNo: 'SSC-2026-002',
    name: 'Lasya Priya',
    class: '5th Class',
    parentName: 'Srinivas Murthy',
    phone: '9123456789',
    school: 'Kendriya Vidyalaya',
    joiningDate: '2026-01-10',
    monthlyFee: 1400,
    advanceAmount: 1400,
    notes: 'Good in reading, focused on Science foundations.',
    status: 'active',
    feeHistory: [
      { id: 'PAY-1004', receiptNo: 'REC-202601-102', year: 2026, month: 1, amount: 1400, date: '2026-01-10', mode: 'Cash', notes: 'January fee paid' },
      { id: 'PAY-1005', receiptNo: 'REC-202602-102', year: 2026, month: 2, amount: 700, date: '2026-02-10', mode: 'Cash', notes: 'First installment paid (Balance ₹700)' },
      { id: 'PAY-1006', receiptNo: 'REC-202602-103', year: 2026, month: 2, amount: 700, date: '2026-02-18', mode: 'UPI', notes: 'Second installment cleared (Full Paid)' }
    ]
  },
  {
    id: 3,
    rollNo: 'SSC-2026-003',
    name: 'Rohan Sharma',
    class: '4th Class',
    parentName: 'Rajesh Sharma',
    phone: '9988766554',
    school: 'Delhi Public School',
    joiningDate: '2026-01-15',
    monthlyFee: 1300,
    advanceAmount: 0,
    notes: 'Regular student, very attentive in mental math.',
    status: 'active',
    feeHistory: [
      { id: 'PAY-1007', receiptNo: 'REC-202601-103', year: 2026, month: 1, amount: 1300, date: '2026-01-15', mode: 'UPI', notes: 'January fee paid via GPay' },
      { id: 'PAY-1008', receiptNo: 'REC-202602-104', year: 2026, month: 2, amount: 650, date: '2026-02-15', mode: 'Cash', notes: 'Half fee paid (Remaining ₹650)' }
    ]
  },
  {
    id: 4,
    rollNo: 'SSC-2026-004',
    name: 'Saanvi K.',
    class: '3rd Class',
    parentName: 'Naveen Kumar',
    phone: '9012345678',
    school: 'Bhavans Vidya Mandir',
    joiningDate: '2026-01-20',
    monthlyFee: 1200,
    advanceAmount: 1200,
    notes: 'Needs daily practice in cursive handwriting.',
    status: 'active',
    feeHistory: [
      { id: 'PAY-1009', receiptNo: 'REC-202601-104', year: 2026, month: 1, amount: 1200, date: '2026-01-20', mode: 'Cash', notes: 'Paid in full' }
    ]
  },
  {
    id: 5,
    rollNo: 'SSC-2026-005',
    name: 'Aditya Varma',
    class: '7th Class',
    parentName: 'Prasad Varma',
    phone: '9345678901',
    school: 'Chaitanya Techno School',
    joiningDate: '2026-01-08',
    monthlyFee: 1600,
    advanceAmount: 0,
    notes: 'Focusing on Algebra linear equations.',
    status: 'active',
    feeHistory: [
      { id: 'PAY-1010', receiptNo: 'REC-202601-105', year: 2026, month: 1, amount: 1600, date: '2026-01-08', mode: 'UPI', notes: 'January paid' },
      { id: 'PAY-1011', receiptNo: 'REC-202602-105', year: 2026, month: 2, amount: 1600, date: '2026-02-09', mode: 'UPI', notes: 'February paid' }
    ]
  },
  {
    id: 6,
    rollNo: 'SSC-2026-006',
    name: 'Ananya S.',
    class: '2nd Class',
    parentName: 'Sudhakar',
    phone: '9848123456',
    school: 'St. Ann’s High School',
    joiningDate: '2026-02-01',
    monthlyFee: 1100,
    advanceAmount: 1100,
    notes: 'Energetic learner, strong reading fluency.',
    status: 'active',
    feeHistory: [
      { id: 'PAY-1012', receiptNo: 'REC-202602-106', year: 2026, month: 2, amount: 1100, date: '2026-02-01', mode: 'Cash', notes: 'Advance fee collected' }
    ]
  },
  {
    id: 7,
    rollNo: 'SSC-2026-007',
    name: 'Karthik Teja',
    class: '10th Class',
    parentName: 'Ramesh Babu',
    phone: '9908123456',
    school: 'Narayana High School',
    joiningDate: '2026-01-02',
    monthlyFee: 2000,
    advanceAmount: 2000,
    notes: 'Board Exam batch, preparing Trigonometry.',
    status: 'active',
    feeHistory: [
      { id: 'PAY-1013', receiptNo: 'REC-202601-106', year: 2026, month: 1, amount: 2000, date: '2026-01-02', mode: 'UPI', notes: 'January fee paid' },
      { id: 'PAY-1014', receiptNo: 'REC-202602-107', year: 2026, month: 2, amount: 1000, date: '2026-02-05', mode: 'UPI', notes: 'Half fee paid ₹1,000' }
    ]
  },
  {
    id: 8,
    rollNo: 'SSC-2026-008',
    name: 'Tanvi M.',
    class: 'LKG',
    parentName: 'Manohar',
    phone: '9701234567',
    school: 'EuroKids Preschool',
    joiningDate: '2026-02-15',
    monthlyFee: 1000,
    advanceAmount: 1000,
    notes: 'Early phonics, letter tracing and counting.',
    status: 'active',
    feeHistory: [
      { id: 'PAY-1015', receiptNo: 'REC-202602-108', year: 2026, month: 2, amount: 1000, date: '2026-02-15', mode: 'Cash', notes: 'February enrollment fee paid' }
    ]
  },
  {
    id: 9,
    rollNo: 'SSC-2026-009',
    name: 'Aryan Goud',
    class: 'UKG',
    parentName: 'Mallikarjun',
    phone: '9652134567',
    school: 'Little Angels School',
    joiningDate: '2026-01-18',
    monthlyFee: 1000,
    advanceAmount: 1000,
    notes: 'Word formation, rhymes, daily activity sheet.',
    status: 'active',
    feeHistory: [
      { id: 'PAY-1016', receiptNo: 'REC-202601-107', year: 2026, month: 1, amount: 1000, date: '2026-01-18', mode: 'Cash', notes: 'January fee paid' }
    ]
  },
  {
    id: 10,
    rollNo: 'SSC-2026-010',
    name: 'Bhavana Ch.',
    class: '1st Class',
    parentName: 'Chandrashekar',
    phone: '9866123456',
    school: 'St. Joseph School',
    joiningDate: '2026-01-12',
    monthlyFee: 1100,
    advanceAmount: 0,
    notes: 'Reading practice and number operations 1-100.',
    status: 'active',
    feeHistory: [
      { id: 'PAY-1017', receiptNo: 'REC-202601-108', year: 2026, month: 1, amount: 1100, date: '2026-01-12', mode: 'UPI', notes: 'Paid in full' },
      { id: 'PAY-1018', receiptNo: 'REC-202602-109', year: 2026, month: 2, amount: 550, date: '2026-02-14', mode: 'Cash', notes: 'Half fee paid (Remaining ₹550)' }
    ]
  },
  {
    id: 11,
    rollNo: 'SSC-2026-011',
    name: 'Varun Tej',
    class: '8th Class',
    parentName: 'Gopal Krishna',
    phone: '9440123456',
    school: 'State High School',
    joiningDate: '2026-01-04',
    monthlyFee: 1700,
    advanceAmount: 1700,
    notes: 'Science and Mathematics foundation.',
    status: 'active',
    feeHistory: [
      { id: 'PAY-1019', receiptNo: 'REC-202601-109', year: 2026, month: 1, amount: 1700, date: '2026-01-04', mode: 'UPI', notes: 'January fee cleared' },
      { id: 'PAY-1020', receiptNo: 'REC-202602-110', year: 2026, month: 2, amount: 1700, date: '2026-02-05', mode: 'UPI', notes: 'February fee cleared' }
    ]
  },
  {
    id: 12,
    rollNo: 'SSC-2026-012',
    name: 'Meghana R.',
    class: '9th Class',
    parentName: 'Ravinder Rao',
    phone: '9391123456',
    school: 'Kendriya Vidyalaya Picket',
    joiningDate: '2026-01-25',
    monthlyFee: 1800,
    advanceAmount: 0,
    notes: 'Focus on Physics numericals and Chemistry symbols.',
    status: 'active',
    feeHistory: [
      { id: 'PAY-1021', receiptNo: 'REC-202601-110', year: 2026, month: 1, amount: 900, date: '2026-01-25', mode: 'UPI', notes: 'Partial payment paid (Balance ₹900)' }
    ]
  }
];

// Initial Enrollment Requests
const INITIAL_ENROLLMENTS = [
  {
    id: 1,
    requestId: 'SSC-ENR-2026-1001',
    studentName: 'Abhinav Reddy',
    requestedClass: '9th Class',
    parentName: 'Sudhakar Reddy',
    fatherName: 'Sudhakar Reddy',
    motherName: 'Sunita Reddy',
    phone: '9849012345',
    schoolName: 'Delhi Public School',
    board: 'CBSE',
    streamSubject: 'Mathematics & Science Focus',
    additionalNotes: 'Needs special guidance in Algebra and Physics numericals.',
    status: 'pending',
    isRead: false,
    createdAt: '2026-10-18T14:20:00Z'
  },
  {
    id: 2,
    requestId: 'SSC-ENR-2026-1002',
    studentName: 'Samyuktha Rao',
    requestedClass: '6th Class',
    parentName: 'Anil Kumar Rao',
    fatherName: 'Anil Kumar Rao',
    motherName: 'Padma',
    phone: '9876523456',
    schoolName: 'St. Ann’s High School',
    board: 'State Board',
    streamSubject: 'All Subjects Comprehensive',
    additionalNotes: 'Seeking evening batch from 5 PM.',
    status: 'pending',
    isRead: false,
    createdAt: '2026-10-19T09:15:00Z'
  },
  {
    id: 3,
    requestId: 'SSC-ENR-2026-1003',
    studentName: 'Charan Teja',
    requestedClass: '10th Class',
    parentName: 'Srinivasulu',
    fatherName: 'Srinivasulu',
    motherName: 'Kavitha',
    phone: '9908134567',
    schoolName: 'Narayana Olympiad School',
    board: 'State Board',
    streamSubject: 'Board Exam Intensive Prep',
    additionalNotes: 'Contacted parent via call, scheduling orientation.',
    status: 'contacted',
    isRead: true,
    createdAt: '2026-10-17T11:00:00Z'
  }
];

// Initial Staff Accounts
const INITIAL_STAFF = [
  { id: 'stf-001', email: 'admin@sscstudycircle.com', fullName: 'Center Director', phone: '8919961354', role: 'admin', status: 'approved', createdAt: '2025-06-01T00:00:00Z', approvedAt: '2025-06-01T00:00:00Z' },
  { id: 'stf-002', email: 'faculty.math@sscstudycircle.com', fullName: 'Srinivasa Rao (Senior Math Tutor)', phone: '9849055667', role: 'staff', status: 'approved', createdAt: '2025-07-01T00:00:00Z', approvedAt: '2025-07-02T00:00:00Z' },
  { id: 'stf-003', email: 'counselor@sscstudycircle.com', fullName: 'Ananya Sharma (Academic Counselor)', phone: '9701233445', role: 'staff', status: 'pending', createdAt: '2026-10-18T10:30:00Z', approvedAt: null }
];

// Initial Notifications
const INITIAL_NOTIFICATIONS = [
  { id: 'notif-1', title: 'New Enrollment Application', message: 'Parent Sudhakar Reddy submitted an enrollment request for Abhinav Reddy (9th Class).', type: 'enrollment', referenceId: 'SSC-ENR-2026-1001', isRead: false, createdAt: '2026-10-18T14:20:00Z' },
  { id: 'notif-2', title: 'New Enrollment Application', message: 'Parent Anil Kumar Rao submitted an enrollment request for Samyuktha Rao (6th Class).', type: 'enrollment', referenceId: 'SSC-ENR-2026-1002', isRead: false, createdAt: '2026-10-19T09:15:00Z' },
  { id: 'notif-3', title: 'Staff Registration Pending', message: 'Ananya Sharma (counselor@sscstudycircle.com) submitted registration awaiting Director approval.', type: 'staff', referenceId: 'stf-003', isRead: false, createdAt: '2026-10-18T10:30:00Z' }
];

class CentralSSCStore {
  constructor() {
    this.state = this.loadFromStorage();
    this.listeners = [];
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem(SSC_STORE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.students) && parsed.students.length > 0) {
          if (!Array.isArray(parsed.recycleBin)) parsed.recycleBin = [];
          if (!Array.isArray(parsed.notifications)) parsed.notifications = [];
          return parsed;
        }
      }
    } catch (e) {
      console.warn('SSCStore: Error parsing local storage, restoring defaults:', e);
    }

    const defaultState = {
      students: JSON.parse(JSON.stringify(INITIAL_STUDENTS)),
      books: JSON.parse(JSON.stringify(INITIAL_BOOKS)),
      classes: JSON.parse(JSON.stringify(INITIAL_CLASSES)),
      enrollments: JSON.parse(JSON.stringify(INITIAL_ENROLLMENTS)),
      staff: JSON.parse(JSON.stringify(INITIAL_STAFF)),
      notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),
      recycleBin: [],
      lastUpdated: new Date().toISOString()
    };
    this.saveToStorage(defaultState);
    return defaultState;
  }

  saveToStorage(newState = null) {
    if (newState) this.state = newState;
    this.state.lastUpdated = new Date().toISOString();
    try {
      localStorage.setItem(SSC_STORE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('SSCStore: Failed to persist to localStorage:', e);
    }
  }

  // Reactive subscription and broadcast
  subscribe(listener) {
    if (typeof listener === 'function') {
      this.listeners.push(listener);
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit(actionType, payload = {}) {
    this.saveToStorage();
    
    // Custom window events for global interlinking
    window.dispatchEvent(new CustomEvent('sscStateChanged', {
      detail: { action: actionType, payload, state: this.state }
    }));
    window.dispatchEvent(new CustomEvent('sscDataUpdated', {
      detail: { action: actionType, payload }
    }));

    // Notify registered subscribers
    this.listeners.forEach(fn => {
      try {
        fn(actionType, payload, this.state);
      } catch (err) {
        console.error('SSCStore subscriber error:', err);
      }
    });
  }

  // ========================================================================
  // 1. STUDENTS MANAGEMENT (CRUD & INTERLINKING)
  // ========================================================================
  getStudents() {
    return this.state.students || [];
  }

  getStudentById(id) {
    const numId = Number(id);
    return (this.state.students || []).find(s => s.id === numId);
  }

  addStudent(studentData) {
    // Mobile validation: 10 digits starting with 6-9
    const cleanPhone = (studentData.phone || '').replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      throw new Error('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
    }

    if (!studentData.name || !studentData.name.trim()) {
      throw new Error('Student Full Name is required.');
    }
    if (!studentData.class) {
      throw new Error('Class / Grade is required.');
    }

    const maxId = (this.state.students || []).reduce((max, s) => Math.max(max, Number(s.id) || 0), 0);
    const nextId = maxId + 1;
    const rollNo = `SSC-2026-${String(nextId).padStart(3, '0')}`;

    // Standardize joiningDate to ISO format YYYY-MM-DD
    let isoJoiningDate = studentData.joiningDate;
    if (!isoJoiningDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoJoiningDate)) {
      isoJoiningDate = new Date().toISOString().split('T')[0];
    }

    const monthlyFee = Number(studentData.monthlyFee) || 1200;
    const advanceAmount = Number(studentData.advanceAmount) || 0;

    const newStudent = {
      id: nextId,
      rollNo,
      name: studentData.name.trim(),
      class: studentData.class,
      parentName: (studentData.parentName || studentData.fatherName || 'Parent').trim(),
      phone: cleanPhone,
      school: (studentData.school || '').trim(),
      joiningDate: isoJoiningDate,
      monthlyFee,
      advanceAmount,
      notes: (studentData.notes || '').trim(),
      status: 'active',
      feeHistory: []
    };

    // If advance amount was paid at joining, record initial payment transaction
    if (advanceAmount > 0) {
      const [jYear, jMonth] = isoJoiningDate.split('-').map(Number);
      const receiptNo = `REC-${jYear}${String(jMonth).padStart(2, '0')}-${String(Math.floor(100 + Math.random() * 900))}`;
      newStudent.feeHistory.push({
        id: `PAY-${Date.now()}`,
        receiptNo,
        year: jYear,
        month: jMonth,
        amount: advanceAmount,
        date: isoJoiningDate,
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      });
    }

    this.state.students.unshift(newStudent);

    // Real-Time Cloud Sync: Supabase PostgreSQL
    if (window.DatabaseService) {
      window.DatabaseService.syncStudentInsert(newStudent);
      if (advanceAmount > 0 && newStudent.feeHistory && newStudent.feeHistory.length > 0) {
        window.DatabaseService.syncFeeInsert(newStudent.feeHistory[0], newStudent.id, 'Full Paid');
      }
    }

    // Create notification
    this.addNotification(
      'New Student Enrolled',
      `Student "${newStudent.name}" enrolled in ${newStudent.class}. Monthly fee: ₹${newStudent.monthlyFee}.`,
      'student',
      newStudent.id
    );

    this.emit('STUDENT_ADDED', { student: newStudent });
    return newStudent;
  }

  updateStudent(id, fields) {
    const student = this.getStudentById(id);
    if (!student) throw new Error('Student record not found.');

    if (fields.phone) {
      const cleanPhone = fields.phone.replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        throw new Error('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
      }
      student.phone = cleanPhone;
    }

    if (fields.name) student.name = fields.name.trim();
    if (fields.class) student.class = fields.class;
    if (fields.parentName !== undefined) student.parentName = fields.parentName.trim();
    if (fields.school !== undefined) student.school = fields.school.trim();
    if (fields.notes !== undefined) student.notes = fields.notes.trim();

    if (fields.joiningDate && /^\d{4}-\d{2}-\d{2}$/.test(fields.joiningDate)) {
      student.joiningDate = fields.joiningDate;
    }

    if (fields.monthlyFee !== undefined) {
      student.monthlyFee = Math.max(0, Number(fields.monthlyFee));
    }
    if (fields.advanceAmount !== undefined) {
      student.advanceAmount = Math.max(0, Number(fields.advanceAmount));
    }

    // Real-Time Cloud Sync: Supabase PostgreSQL
    if (window.DatabaseService) {
      window.DatabaseService.syncStudentUpdate(student.id, student);
    }

    this.emit('STUDENT_UPDATED', { student });
    return student;
  }

  deleteStudent(id) {
    const numId = Number(id);
    const student = this.getStudentById(numId);
    if (!student) return false;

    // Soft delete to Recycle Bin before removing
    const feeCount = (student.feeHistory || []).length;
    this.moveToRecycleBin(
      'student',
      student.id,
      `${student.name} (${student.class})`,
      `Roll: ${student.rollNo || 'SSC-' + student.id} • Parent: ${student.parentName || student.fatherName || 'Parent'} (${student.phone}) • Fee: ₹${student.monthlyFee}/mo • ${feeCount} fee transaction(s)`,
      student
    );

    this.state.students = this.state.students.filter(s => s.id !== numId);

    // Real-Time Cloud Sync: Supabase PostgreSQL
    if (window.DatabaseService) {
      window.DatabaseService.syncStudentDelete(numId);
    }

    this.addNotification(
      'Student Moved to Recycle Bin',
      `Student "${student.name}" (${student.class}) moved to Recycle Bin. You can restore or permanently delete it anytime.`,
      'student'
    );

    this.emit('STUDENT_DELETED', { id: numId, name: student.name });
    return true;
  }

  // Dynamic Class Counts for Top Summary Cards
  getClassStudentCounts() {
    const students = this.getStudents().filter(s => s.status === 'active');
    const counts = {
      total: students.length,
      Total: students.length,
      LKG: 0,
      UKG: 0,
      '1st Class': 0,
      '2nd Class': 0,
      '3rd Class': 0,
      '4th Class': 0,
      '5th Class': 0,
      '6th Class': 0,
      '7th Class': 0,
      '8th Class': 0,
      '9th Class': 0,
      '10th Class': 0
    };

    students.forEach(s => {
      if (counts[s.class] !== undefined) {
        counts[s.class]++;
      } else {
        // Fallback for names like "1st", "1st Grade"
        const matched = Object.keys(counts).find(k => k.toLowerCase() === (s.class || '').toLowerCase());
        if (matched) counts[matched]++;
      }
    });

    return counts;
  }

  // ========================================================================
  // 2. MONTH-WISE FEE LEDGER & REVENUE ENGINE (Jan to Dec Tabs)
  // ========================================================================

  /**
   * Calculates monthly fee status for a specific student for a given year & month (1-12)
   */
  getStudentMonthFee(studentId, year, month) {
    const student = this.getStudentById(studentId);
    if (!student) return null;

    // Check if student joined on or before this month
    const [jYear, jMonth, jDay] = (student.joiningDate || '2026-01-01').split('-').map(Number);
    const isEnrolledInMonth = (year > jYear) || (year === jYear && month >= jMonth);

    if (!isEnrolledInMonth || student.status === 'inactive') {
      return null; // Not applicable for this month
    }

    // Auto-derive Due Date from student's joining day
    const daysInMonth = new Date(year, month, 0).getDate();
    const dueDay = Math.min(jDay || 1, daysInMonth);
    const dueDateObj = new Date(year, month - 1, dueDay);
    const dueDateDisplay = dueDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // Sum payments for this specific month
    const monthPayments = (student.feeHistory || []).filter(p => p.year === year && p.month === month);
    const paidAmount = monthPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const monthlyFee = Number(student.monthlyFee || 0);
    const balance = Math.max(0, monthlyFee - paidAmount);

    let status = 'Pending';
    if (paidAmount >= monthlyFee && monthlyFee > 0) {
      status = 'Full Paid';
    } else if (paidAmount > 0) {
      status = 'Half Paid';
    }

    const latestPayment = monthPayments.length > 0 ? monthPayments[monthPayments.length - 1] : null;
    const paidDateDisplay = latestPayment ? formatISODateDisplay(latestPayment.date) : '—';

    return {
      studentId: student.id,
      studentName: student.name,
      name: student.name,
      studentClass: student.class,
      class: student.class,
      school: student.school || student.roll_no || student.rollNo || 'Regular Batch',
      rollNo: student.school || student.roll_no || student.rollNo || 'Regular Batch',
      parentName: student.parentName,
      phone: student.phone,
      year,
      month,
      monthlyFee,
      dueDay,
      dueDate: dueDateDisplay,
      dueDateDisplay,
      paidAmount,
      balance,
      status, // 'Full Paid' | 'Half Paid' | 'Pending'
      paidDate: paidDateDisplay,
      paidDateDisplay,
      payments: monthPayments,
      latestReceiptNo: latestPayment ? latestPayment.receiptNo : null
    };
  }

  /**
   * Returns complete month fee data for all active eligible students
   */
  getMonthLedger(year = 2026, month = 1) {
    const activeStudents = this.getStudents().filter(s => s.status === 'active');
    const records = [];

    activeStudents.forEach(s => {
      const feeData = this.getStudentMonthFee(s.id, year, month);
      if (feeData) {
        records.push(feeData);
      }
    });

    // Sort alphabetically by student name
    records.sort((a, b) => a.studentName.localeCompare(b.studentName));

    // Summary calculations
    let expectedTotal = 0;
    let collectedTotal = 0;
    let fullPaidCount = 0;
    let halfPaidCount = 0;
    let pendingCount = 0;

    records.forEach(r => {
      expectedTotal += r.monthlyFee;
      collectedTotal += r.paidAmount;
      if (r.status === 'Full Paid') fullPaidCount++;
      else if (r.status === 'Half Paid') halfPaidCount++;
      else pendingCount++;
    });

    const pendingBalanceTotal = Math.max(0, expectedTotal - collectedTotal);

    const enrichedRecords = records.map(r => ({
      ...r,
      name: r.studentName,
      class: r.studentClass,
      dueDate: r.dueDateDisplay,
      paidDate: r.paidDateDisplay
    }));

    return {
      year,
      month,
      records: enrichedRecords,
      rows: enrichedRecords,
      summary: {
        totalEligibleStudents: records.length,
        totalStudents: records.length,
        expectedTotal,
        expectedFee: expectedTotal,
        collectedTotal,
        collectedFee: collectedTotal,
        pendingBalanceTotal,
        pendingFee: pendingBalanceTotal,
        fullPaidCount,
        halfPaidCount,
        pendingCount
      }
    };
  }

  /**
   * Records a full or partial fee payment for a student for (year, month).
   * Supports installment payments (e.g. paying 125, then 125 later).
   */
  recordFeePayment(studentId, year, month, amount, date = null, mode = 'UPI', notes = '') {
    const student = this.getStudentById(studentId);
    if (!student) throw new Error('Student not found.');

    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      throw new Error('Please enter a valid payment amount greater than 0.');
    }

    const paymentDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().split('T')[0];
    const receiptNo = `REC-${year}${String(month).padStart(2, '0')}-${String(Math.floor(100 + Math.random() * 900))}`;

    const newPayment = {
      id: `PAY-${Date.now()}`,
      receiptNo,
      year: Number(year),
      month: Number(month),
      amount: paymentAmount,
      date: paymentDate,
      mode: mode || 'UPI',
      notes: (notes || '').trim()
    };

    if (!Array.isArray(student.feeHistory)) {
      student.feeHistory = [];
    }
    student.feeHistory.push(newPayment);

    // Compute updated month status
    const monthStatus = this.getStudentMonthFee(student.id, Number(year), Number(month));

    // Real-Time Cloud Sync: Supabase PostgreSQL (fee_records)
    if (window.DatabaseService) {
      window.DatabaseService.syncFeeInsert(newPayment, student.id, monthStatus.status);
    }

    this.addNotification(
      'Fee Payment Recorded',
      `Payment of ₹${paymentAmount} recorded for ${student.name} (${student.class}) [${monthStatus.status}]. Receipt: ${receiptNo}.`,
      'payment',
      receiptNo
    );

    this.emit('PAYMENT_RECORDED', {
      studentId: student.id,
      payment: newPayment,
      monthStatus
    });

    return {
      success: true,
      receiptNo,
      payment: newPayment,
      monthStatus
    };
  }

  // ========================================================================
  // 3. BOOKS & STUDY MATERIALS (CRUD)
  // ========================================================================
  getBooks() {
    return this.state.books || [];
  }

  getBookById(id) {
    return (this.state.books || []).find(b => b.id === id);
  }

  addBook(bookData) {
    if (!bookData.title || !bookData.title.trim()) {
      throw new Error('Book Title is required.');
    }

    const books = this.getBooks();
    const id = bookData.id || `BK-${Date.now().toString().slice(-5)}`;
    const isFree = !!bookData.isFree;
    const price = isFree ? 0 : (Number(bookData.price) || 0);

    const newBook = {
      id,
      title: bookData.title.trim(),
      category: bookData.category || (isFree ? 'Study Guide' : 'Physical Book'),
      class: bookData.class || 'All Classes',
      subject: (bookData.subject || 'All Subjects').trim(),
      description: (bookData.description || '').trim(),
      price,
      isAvailable: bookData.isAvailable !== false,
      isFree,
      downloadUrl: isFree ? (bookData.downloadUrl || 'assets/downloads/SSC_Tuition_Curriculum_and_Syllabus.pdf') : null,
      badge: bookData.badge || (isFree ? 'Free Download' : 'SSC Edition'),
      colorScheme: bookData.colorScheme || 'from-[#1E6091] via-[#1A759F] to-[#52B69A]',
      accentColor: bookData.accentColor || '#16425B',
      titleColor: bookData.titleColor || 'text-yellow-300',
      inclusions: `${bookData.class || 'Tuition'} • ${bookData.subject || 'Comprehensive'}`,
      displayOrder: books.length + 1
    };

    this.state.books.push(newBook);

    // Real-Time Cloud Sync: Supabase PostgreSQL (books)
    if (window.DatabaseService) {
      window.DatabaseService.syncBookInsert(newBook);
    }

    this.emit('BOOK_ADDED', { book: newBook });
    return newBook;
  }

  updateBook(id, fields) {
    const book = this.getBookById(id);
    if (!book) throw new Error('Book not found.');

    if (fields.title) book.title = fields.title.trim();
    if (fields.category) book.category = fields.category;
    if (fields.class) book.class = fields.class;
    if (fields.subject !== undefined) book.subject = fields.subject.trim();
    if (fields.description !== undefined) book.description = fields.description.trim();
    if (fields.price !== undefined) book.price = Math.max(0, Number(fields.price));
    if (fields.isAvailable !== undefined) book.isAvailable = !!fields.isAvailable;
    if (fields.isFree !== undefined) book.isFree = !!fields.isFree;
    if (fields.downloadUrl !== undefined) book.downloadUrl = fields.downloadUrl;

    // Real-Time Cloud Sync: Supabase PostgreSQL (books)
    if (window.DatabaseService) {
      window.DatabaseService.syncBookUpdate(id, book);
    }

    this.emit('BOOK_UPDATED', { book });
    return book;
  }

  deleteBook(id) {
    const book = this.getBookById(id);
    if (!book) return false;

    this.moveToRecycleBin(
      'book',
      book.id,
      `${book.title} [${book.category || 'Book'}]`,
      `Class: ${book.class} • Subject: ${book.subject || 'All'} • Price: ${book.isFree ? 'Free' : '₹' + book.price}`,
      book
    );

    this.state.books = this.state.books.filter(b => b.id !== id);

    // Real-Time Cloud Sync: Supabase PostgreSQL (books)
    if (window.DatabaseService) {
      window.DatabaseService.syncBookDelete(id);
    }

    this.addNotification(
      'Book Moved to Recycle Bin',
      `Book "${book.title}" was moved to Recycle Bin.`,
      'system'
    );
    this.emit('BOOK_DELETED', { id, title: book.title });
    return true;
  }

  // ========================================================================
  // 4. CLASSES & PROGRAMS (CRUD with deletion guard)
  // ========================================================================
  getClasses() {
    return this.state.classes || [];
  }

  getClassById(id) {
    return (this.state.classes || []).find(c => c.id === id);
  }

  addClass(classData) {
    if (!classData.name || !classData.name.trim()) {
      throw new Error('Class Name is required.');
    }

    const classes = this.getClasses();
    const id = classData.id || `cls-${Date.now().toString().slice(-4)}`;

    const newClass = {
      id,
      name: classData.name.trim(),
      gradeCode: classData.gradeCode || classData.name.split(' ')[0],
      tag: classData.tag || 'Academic Program',
      maxStudents: Number(classData.maxStudents) || 12,
      batchTimings: classData.batchTimings || '5:00 PM – 7:30 PM Regular',
      extendedTimings: 'Until 8:00 PM or 8:30 PM occasionally for communication & activities',
      monthlyFee: Number(classData.monthlyFee) || 1200,
      subjects: (classData.subjects || '').trim(),
      highlights: (classData.highlights || '').trim(),
      isActive: classData.isActive !== false,
      displayOrder: classes.length + 1
    };

    this.state.classes.push(newClass);

    // Real-Time Cloud Sync: Supabase PostgreSQL (classes)
    if (window.DatabaseService) {
      window.DatabaseService.syncClassInsert(newClass);
    }

    this.emit('CLASS_ADDED', { classItem: newClass });
    return newClass;
  }

  updateClass(id, fields) {
    const c = this.getClassById(id);
    if (!c) throw new Error('Class not found.');

    if (fields.name) c.name = fields.name.trim();
    if (fields.gradeCode) c.gradeCode = fields.gradeCode.trim();
    if (fields.tag !== undefined) c.tag = fields.tag.trim();
    if (fields.batchTimings) c.batchTimings = fields.batchTimings.trim();
    if (fields.monthlyFee !== undefined) c.monthlyFee = Math.max(0, Number(fields.monthlyFee));
    if (fields.maxStudents !== undefined) c.maxStudents = Math.max(1, Number(fields.maxStudents));
    if (fields.subjects !== undefined) c.subjects = fields.subjects.trim();
    if (fields.isActive !== undefined) c.isActive = !!fields.isActive;

    // Real-Time Cloud Sync: Supabase PostgreSQL (classes)
    if (window.DatabaseService) {
      window.DatabaseService.syncClassUpdate(id, c);
    }

    this.emit('CLASS_UPDATED', { classItem: c });
    return c;
  }

  deleteClass(id) {
    const c = this.getClassById(id);
    if (!c) return { success: false, message: 'Class not found.' };

    // Safeguard: Check if students are enrolled in this class
    const students = this.getStudents().filter(s => s.status === 'active');
    const enrolledStudents = students.filter(s => s.class === c.gradeCode || s.class === c.name);

    if (enrolledStudents.length > 0) {
      return {
        success: false,
        message: `Cannot delete class "${c.name}". There are currently ${enrolledStudents.length} student(s) enrolled. Please reassign them first.`
      };
    }

    this.moveToRecycleBin(
      'class',
      c.id,
      `${c.name} (${c.gradeCode})`,
      `Fee: ₹${c.monthlyFee}/mo • Timings: ${c.batchTimings} • Max Capacity: ${c.maxStudents}`,
      c
    );

    this.state.classes = this.state.classes.filter(item => item.id !== id);

    // Real-Time Cloud Sync: Supabase PostgreSQL (classes)
    if (window.DatabaseService) {
      window.DatabaseService.syncClassDelete(id);
    }

    this.addNotification(
      'Class Moved to Recycle Bin',
      `Class "${c.name}" was moved to Recycle Bin.`,
      'system'
    );
    this.emit('CLASS_DELETED', { id, name: c.name });
    return { success: true, message: `Class "${c.name}" moved to Recycle Bin.` };
  }

  // ========================================================================
  // 5. ENROLLMENTS & 1-CLICK CONVERSION TO STUDENT
  // ========================================================================
  getEnrollments() {
    return this.state.enrollments || [];
  }

  submitEnrollment(data) {
    const enrollments = this.getEnrollments();
    const cleanPhone = (data.parentPhone || data.phone || '').replace(/\D/g, '');
    const requestId = `SSC-ENR-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const newEnr = {
      id: Date.now(),
      requestId,
      studentName: (data.studentName || '').trim(),
      requestedClass: data.studentClass || '1st Class',
      parentName: (data.fatherName || data.motherName || 'Parent').trim(),
      fatherName: (data.fatherName || '').trim(),
      motherName: (data.motherName || '').trim(),
      phone: cleanPhone,
      email: (data.parentEmail || '').trim(),
      schoolName: (data.schoolName || '').trim(),
      board: data.board || 'State Board',
      streamSubject: data.selectedStream || 'All Core Subjects',
      additionalNotes: (data.notes || '').trim(),
      status: 'pending',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    this.state.enrollments.unshift(newEnr);

    // Real-Time Cloud Sync: Supabase PostgreSQL (enrollment_requests)
    if (window.DatabaseService) {
      window.DatabaseService.syncEnrollmentInsert(newEnr);
    }

    this.addNotification(
      'New Enrollment Application',
      `Parent ${newEnr.parentName} submitted an application for ${newEnr.studentName} (${newEnr.requestedClass}). Phone: ${newEnr.phone}.`,
      'enrollment',
      requestId
    );

    this.emit('ENROLLMENT_SUBMITTED', { enrollment: newEnr });
    return { success: true, requestId, enrollment: newEnr };
  }

  approveEnrollment(requestId) {
    const enr = (this.state.enrollments || []).find(e => e.requestId === requestId);
    if (!enr) throw new Error('Enrollment application not found.');

    enr.status = 'approved';
    enr.isRead = true;
    enr.approvedAt = new Date().toISOString();

    // Real-Time Cloud Sync: Supabase PostgreSQL (enrollment_requests)
    if (window.DatabaseService) {
      window.DatabaseService.syncEnrollmentUpdate(requestId, { status: 'approved', isRead: true });
    }

    // Find class default fee
    const cls = (this.state.classes || []).find(c => c.gradeCode === enr.requestedClass || c.name.includes(enr.requestedClass));
    const monthlyFee = cls ? cls.monthlyFee : 1200;

    // Convert into active student in Students directory and Fee Ledger
    const newStudent = this.addStudent({
      name: enr.studentName,
      class: enr.requestedClass,
      parentName: enr.parentName,
      phone: enr.phone,
      school: enr.schoolName,
      joiningDate: new Date().toISOString().split('T')[0],
      monthlyFee,
      advanceAmount: 0,
      notes: `Enrolled via Web Application (${enr.requestId})`
    });

    this.emit('ENROLLMENT_APPROVED', { enrollment: enr, student: newStudent });
    return { success: true, student: newStudent };
  }

  getPendingEnrollmentsCount() {
    return (this.state.enrollments || []).filter(e => e.status === 'pending').length;
  }

  updateEnrollmentStatus(requestId, status, notes = '') {
    const enr = (this.state.enrollments || []).find(e => e.requestId === requestId);
    if (!enr) return null;

    enr.status = status;
    enr.isRead = true;
    if (notes) enr.coordinatorNotes = notes;
    enr.updatedAt = new Date().toISOString();

    // Real-Time Cloud Sync: Supabase PostgreSQL (enrollment_requests)
    if (window.DatabaseService) {
      window.DatabaseService.syncEnrollmentUpdate(requestId, { status, coordinatorNotes: notes, isRead: true });
    }

    this.emit('ENROLLMENT_STATUS_UPDATED', { enrollment: enr });
    return enr;
  }

  deleteEnrollment(requestId) {
    const enr = (this.state.enrollments || []).find(e => e.requestId === requestId);
    if (!enr) return false;

    this.moveToRecycleBin(
      'enrollment',
      enr.requestId,
      `${enr.studentName} (${enr.requestedClass})`,
      `Request ID: ${enr.requestId} • Parent: ${enr.parentName || 'Parent'} (${enr.phone}) • Status: ${enr.status}`,
      enr
    );

    this.state.enrollments = this.state.enrollments.filter(e => e.requestId !== requestId);

    // Real-Time Cloud Sync: Supabase PostgreSQL (enrollment_requests)
    if (window.DatabaseService) {
      window.DatabaseService.syncEnrollmentDelete(requestId);
    }

    this.addNotification(
      'Enrollment Moved to Recycle Bin',
      `Enrollment application ${enr.requestId} for "${enr.studentName}" moved to Recycle Bin.`,
      'enrollment'
    );
    this.emit('ENROLLMENT_DELETED', { requestId, name: enr.studentName });
    return true;
  }

  // ========================================================================
  // 6. NOTIFICATIONS & ALERTS
  // ========================================================================
  getNotifications() {
    return this.state.notifications || [];
  }

  addNotification(title, message, type = 'system', referenceId = null) {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      title,
      message,
      type,
      referenceId,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.state.notifications.unshift(newNotif);

    // Real-Time Cloud Sync: Supabase PostgreSQL (admin_notifications)
    if (window.DatabaseService) {
      window.DatabaseService.syncNotificationInsert(newNotif);
    }

    return newNotif;
  }

  markNotificationAsRead(id) {
    const n = (this.state.notifications || []).find(item => item.id === id);
    if (n) {
      n.isRead = true;
      if (window.DatabaseService) {
        window.DatabaseService.syncNotificationUpdate(id, { isRead: true });
      }
      this.emit('NOTIFICATION_READ', { id });
    }
  }

  markAllNotificationsAsRead() {
    (this.state.notifications || []).forEach(n => { n.isRead = true; });
    if (window.DatabaseService) {
      window.DatabaseService.syncNotificationMarkAllRead();
    }
    this.emit('NOTIFICATIONS_ALL_READ');
  }

  getUnreadNotificationsCount() {
    return (this.state.notifications || []).filter(n => !n.isRead).length;
  }

  deleteNotification(id) {
    this.state.notifications = (this.state.notifications || []).filter(n => n.id !== id);
    if (window.DatabaseService) {
      window.DatabaseService.syncNotificationDelete(id);
    }
    this.emit('NOTIFICATION_DELETED', { id });
    return true;
  }

  clearAllNotifications() {
    const count = (this.state.notifications || []).length;
    this.state.notifications = [];
    if (window.DatabaseService) {
      window.DatabaseService.syncNotificationClearAll();
    }
    this.emit('NOTIFICATIONS_CLEARED', { count });
    return true;
  }

  clearReadNotifications() {
    this.state.notifications = (this.state.notifications || []).filter(n => !n.isRead);
    if (window.DatabaseService) {
      window.DatabaseService.syncNotificationClearRead();
    }
    this.emit('NOTIFICATIONS_CLEARED_READ');
    return true;
  }

  // ========================================================================
  // 7. STAFF DIRECTORY & DIRECTOR APPROVALS
  // ========================================================================
  getStaff() {
    return this.state.staff || [];
  }

  registerStaff(name, email, phone, role = 'staff') {
    const cleanEmail = (email || '').toLowerCase().trim();
    if ((this.state.staff || []).some(s => s.email.toLowerCase() === cleanEmail)) {
      throw new Error('A staff account with this email already exists.');
    }

    const cleanPhone = (phone || '').replace(/\D/g, '');
    const newStaff = {
      id: `stf-${Date.now().toString().slice(-4)}`,
      email: cleanEmail,
      fullName: (name || '').trim(),
      phone: cleanPhone,
      role: role || 'staff',
      status: 'pending', // Strictly pending until admin approves!
      createdAt: new Date().toISOString(),
      approvedAt: null
    };

    this.state.staff.push(newStaff);

    // Real-Time Cloud Sync: Supabase PostgreSQL (staff_members)
    if (window.DatabaseService) {
      window.DatabaseService.syncStaffInsert(newStaff);
    }

    this.addNotification(
      'New Staff Registration Request',
      `${newStaff.fullName} (${newStaff.email}) registered as ${newStaff.role}. Awaiting Director approval.`,
      'staff',
      newStaff.id
    );

    this.emit('STAFF_REGISTERED', { staff: newStaff });
    return newStaff;
  }

  approveStaff(id) {
    const target = (this.state.staff || []).find(s => s.id === id);
    if (!target) return null;

    target.status = 'approved';
    target.approvedAt = new Date().toISOString();

    // Real-Time Cloud Sync: Supabase PostgreSQL (staff_members)
    if (window.DatabaseService) {
      window.DatabaseService.syncStaffUpdate(id, { status: 'approved', approvedAt: target.approvedAt });
    }

    this.addNotification('Staff Approved', `Staff account for ${target.fullName} has been approved with role "${target.role}".`, 'staff', id);
    this.emit('STAFF_APPROVED', { staff: target });
    return target;
  }

  rejectStaff(id) {
    const target = (this.state.staff || []).find(s => s.id === id);
    if (!target) return null;

    target.status = 'rejected';

    // Real-Time Cloud Sync: Supabase PostgreSQL (staff_members)
    if (window.DatabaseService) {
      window.DatabaseService.syncStaffUpdate(id, { status: 'rejected' });
    }

    this.emit('STAFF_REJECTED', { staff: target });
    return target;
  }

  updateStaffRole(id, newRole) {
    const target = (this.state.staff || []).find(s => s.id === id);
    if (!target) return null;

    target.role = newRole;

    // Real-Time Cloud Sync: Supabase PostgreSQL (staff_members)
    if (window.DatabaseService) {
      window.DatabaseService.syncStaffUpdate(id, { role: newRole });
    }

    this.emit('STAFF_ROLE_UPDATED', { staff: target, newRole });
    return target;
  }

  deleteStaff(id) {
    const target = (this.state.staff || []).find(s => s.id === id);
    if (!target) return { success: false, message: 'Staff member not found.' };

    if (target.email === 'admin@sscstudycircle.com' || target.id === 'stf-001') {
      return { success: false, message: 'Primary Director account cannot be deleted.' };
    }

    this.moveToRecycleBin(
      'staff',
      target.id,
      `${target.fullName} [${target.role.toUpperCase()}]`,
      `Email: ${target.email} • Phone: ${target.phone || '—'} • Status: ${target.status}`,
      target
    );

    this.state.staff = this.state.staff.filter(s => s.id !== id);

    // Real-Time Cloud Sync: Supabase PostgreSQL (staff_members)
    if (window.DatabaseService) {
      window.DatabaseService.syncStaffDelete(id);
    }

    this.addNotification(
      'Staff Moved to Recycle Bin',
      `Staff member "${target.fullName}" was moved to Recycle Bin.`,
      'staff'
    );
    this.emit('STAFF_DELETED', { id, name: target.fullName });
    return { success: true, message: `Staff member moved to Recycle Bin.` };
  }

  // ========================================================================
  // 8. RECYCLE BIN / TRASH PORTAL (Universal Soft-Delete, Restore & Purge)
  // ========================================================================
  getRecycleBinItems() {
    if (!Array.isArray(this.state.recycleBin)) {
      this.state.recycleBin = [];
    }
    return this.state.recycleBin;
  }

  getRecycleBinCount() {
    return this.getRecycleBinItems().length;
  }

  moveToRecycleBin(itemType, originalId, title, subtitle, itemData) {
    if (!Array.isArray(this.state.recycleBin)) {
      this.state.recycleBin = [];
    }
    const binId = `bin-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const binItem = {
      binId,
      itemType, // 'student' | 'book' | 'class' | 'enrollment' | 'staff'
      originalId,
      title,
      subtitle: subtitle || '',
      deletedAt: new Date().toISOString(),
      deletedBy: (window.AdminAuth && typeof window.AdminAuth.getCurrentUser === 'function' ? window.AdminAuth.getCurrentUser()?.name : null) || 'Center Director',
      itemData: JSON.parse(JSON.stringify(itemData))
    };
    this.state.recycleBin.unshift(binItem);

    // Real-Time Cloud Sync: Supabase PostgreSQL (recycle_bin)
    if (window.DatabaseService) {
      window.DatabaseService.syncRecycleBinInsert(binItem);
    }

    this.emit('RECYCLE_BIN_ITEM_ADDED', { item: binItem });
    return binItem;
  }

  restoreFromRecycleBin(binId) {
    const items = this.getRecycleBinItems();
    const index = items.findIndex(i => i.binId === binId);
    if (index === -1) {
      return { success: false, message: 'Item not found in Recycle Bin.' };
    }

    const [binItem] = items.splice(index, 1);
    const { itemType, itemData, title } = binItem;

    if (itemType === 'student') {
      if (!Array.isArray(this.state.students)) this.state.students = [];
      // If student ID already exists in active, assign nextId
      if (this.state.students.some(s => s.id === itemData.id)) {
        const maxId = this.state.students.reduce((max, s) => Math.max(max, Number(s.id) || 0), 0);
        itemData.id = maxId + 1;
        itemData.rollNo = `SSC-2026-${String(itemData.id).padStart(3, '0')}`;
      }
      itemData.status = 'active';
      this.state.students.unshift(itemData);
      this.addNotification(
        'Student Restored',
        `Student "${title}" has been restored to active student register with full fee history.`,
        'student',
        itemData.id
      );
      this.emit('STUDENT_RESTORED', { student: itemData });
    } else if (itemType === 'book') {
      if (!Array.isArray(this.state.books)) this.state.books = [];
      this.state.books.push(itemData);
      this.addNotification('Book Restored', `Book "${title}" restored to catalog.`, 'system');
      this.emit('BOOK_RESTORED', { book: itemData });
    } else if (itemType === 'class') {
      if (!Array.isArray(this.state.classes)) this.state.classes = [];
      this.state.classes.push(itemData);
      this.addNotification('Class Restored', `Class program "${title}" restored.`, 'system');
      this.emit('CLASS_RESTORED', { classItem: itemData });
    } else if (itemType === 'enrollment') {
      if (!Array.isArray(this.state.enrollments)) this.state.enrollments = [];
      this.state.enrollments.unshift(itemData);
      this.addNotification('Enrollment Restored', `Enrollment application for "${title}" restored.`, 'enrollment');
      this.emit('ENROLLMENT_RESTORED', { enrollment: itemData });
    } else if (itemType === 'staff') {
      if (!Array.isArray(this.state.staff)) this.state.staff = [];
      this.state.staff.push(itemData);
      this.addNotification('Staff Restored', `Staff member "${title}" restored.`, 'staff');
      this.emit('STAFF_RESTORED', { staff: itemData });
    }

    // Real-Time Cloud Sync: Delete from recycle_bin and re-insert into target table
    if (window.DatabaseService) {
      window.DatabaseService.syncRecycleBinDelete(binId);
      if (itemType === 'student') window.DatabaseService.syncStudentInsert(itemData);
      else if (itemType === 'book') window.DatabaseService.syncBookInsert(itemData);
      else if (itemType === 'class') window.DatabaseService.syncClassInsert(itemData);
      else if (itemType === 'enrollment') window.DatabaseService.syncEnrollmentInsert(itemData);
      else if (itemType === 'staff') window.DatabaseService.syncStaffInsert(itemData);
    }

    this.emit('RECYCLE_BIN_UPDATED');
    return { success: true, item: itemData, type: itemType, title };
  }

  permanentDeleteFromRecycleBin(binId) {
    const items = this.getRecycleBinItems();
    const index = items.findIndex(i => i.binId === binId);
    if (index === -1) return { success: false, message: 'Item not found in Recycle Bin.' };
    const [purged] = items.splice(index, 1);

    // Real-Time Cloud Sync: Supabase PostgreSQL (recycle_bin)
    if (window.DatabaseService) {
      window.DatabaseService.syncRecycleBinDelete(binId);
    }

    this.emit('RECYCLE_BIN_ITEM_PURGED', { binId, title: purged.title });
    this.emit('RECYCLE_BIN_UPDATED');
    return { success: true, title: purged.title };
  }

  emptyRecycleBin() {
    const count = this.getRecycleBinCount();
    this.state.recycleBin = [];

    // Real-Time Cloud Sync: Supabase PostgreSQL (recycle_bin)
    if (window.DatabaseService) {
      window.DatabaseService.syncRecycleBinEmpty();
    }

    this.emit('RECYCLE_BIN_EMPTIED', { count });
    this.emit('RECYCLE_BIN_UPDATED');
    return { success: true, count };
  }

  // ========================================================================
  // 9. OVERVIEW SUMMARY METRICS
  // ========================================================================
  getOverviewMetrics() {
    const students = this.getStudents().filter(s => s.status === 'active');
    const enrollments = this.getEnrollments();
    const pendingEnrollments = enrollments.filter(e => e.status === 'pending');
    const books = this.getBooks();
    const classes = this.getClasses();

    // Total collections across all payments in fee history
    let totalRevenue = 0;
    students.forEach(s => {
      (s.feeHistory || []).forEach(p => {
        totalRevenue += Number(p.amount || 0);
      });
    });

    return {
      activeStudentsCount: students.length,
      activeStudents: students.length,
      pendingEnrollmentsCount: pendingEnrollments.length,
      pendingEnrollments: pendingEnrollments.length,
      totalRevenue,
      totalCollectedFees: totalRevenue,
      booksCount: books.length,
      booksCatalogCount: books.length,
      classesCount: classes.length,
      unreadNotifsCount: this.getUnreadNotificationsCount(),
      recycleBinCount: this.getRecycleBinCount()
    };
  }

  // WhatsApp Message Generators (Helpline: 8919961354)
  getWhatsAppReminderUrl(studentId, year, month) {
    const fee = this.getStudentMonthFee(studentId, year, month);
    if (!fee) return `https://wa.me/91${SSC_OFFICIAL_WHATSAPP}`;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[month - 1];
    const parentPhone = (fee.phone || '').replace(/\D/g, '');

    const message = `Hello ${fee.parentName || fee.studentName + "'s Parent"},\n\nGreetings from *SSC Students Study Circle*!\nThis is a friendly tuition fee reminder for *${fee.studentName}* (${fee.studentClass}) for *${monthName} ${year}*.\n\n` +
      `📌 *Monthly Fee:* ₹${fee.monthlyFee}\n` +
      `✅ *Paid Amount:* ₹${fee.paidAmount}\n` +
      `⚠️ *Pending Balance:* ₹${fee.balance}\n` +
      `📅 *Due Date:* ${fee.dueDateDisplay}\n` +
      `📊 *Status:* ${fee.status}\n\n` +
      `Kindly clear the pending balance at your earliest convenience via UPI or at the center.\n\n` +
      `SSC Tuition Center Helpline: ${SSC_OFFICIAL_PHONE_DISPLAY}\nThank you!`;

    const targetPhone = parentPhone.length === 10 ? `91${parentPhone}` : `91${SSC_OFFICIAL_WHATSAPP}`;
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
  }

  getWhatsAppReminderLink(studentId, year, month) {
    return this.getWhatsAppReminderUrl(studentId, year, month);
  }

  getWhatsAppReceiptUrl(receiptNo, studentName, studentClass, monthName, amount, date, mode, parentPhone = '') {
    const cleanPhone = (parentPhone || '').replace(/\D/g, '');
    const message = `*SSC STUDENTS STUDY CIRCLE*\n*Official Tuition Fee Receipt*\n\n` +
      `🧾 *Receipt No:* ${receiptNo}\n` +
      `🎓 *Student Name:* ${studentName} (${studentClass})\n` +
      `📅 *Fee Month:* ${monthName}\n` +
      `💰 *Amount Received:* ₹${amount}\n` +
      `🗓️ *Payment Date:* ${date}\n` +
      `💳 *Payment Mode:* ${mode}\n` +
      `✅ *Status:* Verified Paid\n\n` +
      `Thank you for your prompt payment!\nSSC Students Study Circle • Quality Education from LKG to Class 10\nHelpline: ${SSC_OFFICIAL_PHONE_DISPLAY}`;

    const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : `91${SSC_OFFICIAL_WHATSAPP}`;
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
  }

  getWhatsAppReceiptLink(receiptNo, studentName, studentClass, monthName, amount, date, mode, parentPhone = '') {
    return this.getWhatsAppReceiptUrl(receiptNo, studentName, studentClass, monthName, amount, date, mode, parentPhone);
  }

  // Reset to initial clean state
  resetStore() {
    localStorage.removeItem(SSC_STORE_KEY);
    this.state = this.loadFromStorage();
    this.emit('STORE_RESET');
  }
}

// Instantiate global singleton
window.SSCStore = new CentralSSCStore();
window.SSC_OFFICIAL_WHATSAPP = SSC_OFFICIAL_WHATSAPP;
window.formatISODateDisplay = formatISODateDisplay;

// Legacy proxy bridges for 100% backwards compatibility
window.StudentsStore = {
  getAll: () => window.SSCStore.getStudents(),
  getById: (id) => window.SSCStore.getStudentById(id),
  addStudent: (data) => window.SSCStore.addStudent(data),
  updateStudent: (id, data) => window.SSCStore.updateStudent(id, data),
  deleteStudent: (id) => window.SSCStore.deleteStudent(id),
  getMetrics: () => {
    const counts = window.SSCStore.getClassStudentCounts();
    return {
      total: counts.total,
      byClass: counts
    };
  },
  calculateStudentTotals: (student) => {
    const monthlyFee = Number(student.monthlyFee || 0);
    const totalPaid = (student.feeHistory || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
    return {
      totalPaid,
      totalDue: Math.max(0, monthlyFee - totalPaid),
      totalPending: Math.max(0, monthlyFee - totalPaid)
    };
  },
  addFeePayment: (studentId, data) => {
    const now = new Date();
    return window.SSCStore.recordFeePayment(studentId, now.getFullYear(), now.getMonth() + 1, data.amount, data.date, data.mode, data.notes);
  }
};
