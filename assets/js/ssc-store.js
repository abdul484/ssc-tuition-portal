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

const SSC_STORE_KEY = 'ssc_tuition_central_store_v6';
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


// ==========================================================================
// STRICT ACADEMIC GRADE HIERARCHY & SORTING ENGINE
// LKG (1) -> UKG (2) -> 1st (3) -> ... -> 10th (12)
// ==========================================================================
const CLASS_HIERARCHY_RANK = {
  'lkg': 1,
  'ukg': 2,
  '1st': 3,
  '1st class': 3,
  'class 1': 3,
  'class 1st': 3,
  '2nd': 4,
  '2nd class': 4,
  'class 2': 4,
  'class 2nd': 4,
  '3rd': 5,
  '3rd class': 5,
  'class 3': 5,
  'class 3rd': 5,
  '4th': 6,
  '4th class': 6,
  'class 4': 6,
  'class 4th': 6,
  '5th': 7,
  '5th class': 7,
  'class 5': 7,
  'class 5th': 7,
  '6th': 8,
  '6th class': 8,
  'class 6': 8,
  'class 6th': 8,
  '7th': 9,
  '7th class': 9,
  'class 7': 9,
  'class 7th': 9,
  '8th': 10,
  '8th class': 10,
  'class 8': 10,
  'class 8th': 10,
  '9th': 11,
  '9th class': 11,
  'class 9': 11,
  'class 9th': 11,
  '10th': 12,
  '10th class': 12,
  'class 10': 12,
  'class 10th': 12
};

function getAcademicClassRank(className) {
  if (!className) return 99;
  const clean = String(className).toLowerCase().trim();
  if (CLASS_HIERARCHY_RANK[clean] !== undefined) {
    return CLASS_HIERARCHY_RANK[clean];
  }
  const numMatch = clean.match(/\b(\d+)(?:st|nd|rd|th)?\b/);
  if (numMatch) {
    const n = parseInt(numMatch[1], 10);
    if (n >= 1 && n <= 10) return n + 2;
  }
  return 99;
}
window.getAcademicClassRank = getAcademicClassRank;

function sortStudentList(list, sortOrder = 'class-asc') {
  if (!Array.isArray(list)) return [];
  const copy = [...list];

  const extractRollNum = (r) => {
    if (!r) return 0;
    const m = String(r).match(/\d+/g);
    return m ? parseInt(m[m.length - 1], 10) : 0;
  };

  copy.sort((a, b) => {
    const classA = a.class || a.studentClass || '';
    const classB = b.class || b.studentClass || '';
    const rankA = getAcademicClassRank(classA);
    const rankB = getAcademicClassRank(classB);

    const nameA = (a.name || a.studentName || '').toLowerCase().trim();
    const nameB = (b.name || b.studentName || '').toLowerCase().trim();

    const rollA = a.rollNo || a.roll_no || `SSC-${a.id || a.studentId || 0}`;
    const rollB = b.rollNo || b.roll_no || `SSC-${b.id || b.studentId || 0}`;

    if (sortOrder === 'class-asc') {
      if (rankA !== rankB) return rankA - rankB;
      const nameCmp = nameA.localeCompare(nameB);
      if (nameCmp !== 0) return nameCmp;
      return extractRollNum(rollA) - extractRollNum(rollB);
    } else if (sortOrder === 'class-desc') {
      if (rankA !== rankB) return rankB - rankA;
      const nameCmp = nameA.localeCompare(nameB);
      if (nameCmp !== 0) return nameCmp;
      return extractRollNum(rollA) - extractRollNum(rollB);
    } else if (sortOrder === 'name-asc') {
      const nameCmp = nameA.localeCompare(nameB);
      if (nameCmp !== 0) return nameCmp;
      return rankA - rankB;
    } else if (sortOrder === 'roll-asc') {
      const numA = extractRollNum(rollA);
      const numB = extractRollNum(rollB);
      if (numA !== numB) return numA - numB;
      return nameA.localeCompare(nameB);
    }

    if (rankA !== rankB) return rankA - rankB;
    return nameA.localeCompare(nameB);
  });

  return copy;
}
window.sortStudentList = sortStudentList;

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
    id: 101,
    rollNo: 'SSC-101',
    name: "B. Sahasra",
    class: "1st Class",
    parentName: "Chinnammalu",
    fatherName: "Chinnammalu",
    motherName: '',
    phone: '7093926533',
    school: "",
    joiningDate: '2026-06-05',
    monthlyFee: 250,
    advanceAmount: 250,
    advanceDate: '2026-06-08',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 1st Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-101',
        receiptNo: 'REC-202606-101',
        year: 2026,
        month: 6,
        amount: 250,
        date: '2026-06-08',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 102,
    rollNo: 'SSC-102',
    name: "G. Abhi",
    class: "1st Class",
    parentName: "Santhoshi",
    fatherName: "Santhoshi",
    motherName: '',
    phone: '9014492194',
    school: "",
    joiningDate: '2026-06-01',
    monthlyFee: 250,
    advanceAmount: 250,
    advanceDate: '2026-06-17',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 1st Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-102',
        receiptNo: 'REC-202606-102',
        year: 2026,
        month: 6,
        amount: 250,
        date: '2026-06-17',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 103,
    rollNo: 'SSC-103',
    name: "T. Mokshasri",
    class: "1st Class",
    parentName: "Raju",
    fatherName: "Raju",
    motherName: '',
    phone: '7013529077',
    school: "",
    joiningDate: '2026-06-13',
    monthlyFee: 250,
    advanceAmount: 250,
    advanceDate: '2026-06-18',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 1st Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-103',
        receiptNo: 'REC-202606-103',
        year: 2026,
        month: 6,
        amount: 250,
        date: '2026-06-18',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 104,
    rollNo: 'SSC-104',
    name: "P. Greeshmanth",
    class: "1st Class",
    parentName: "Anusha",
    fatherName: "Anusha",
    motherName: '',
    phone: '8143624278',
    school: "",
    joiningDate: '2026-06-01',
    monthlyFee: 250,
    advanceAmount: 250,
    advanceDate: '2026-06-18',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 1st Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-104',
        receiptNo: 'REC-202606-104',
        year: 2026,
        month: 6,
        amount: 250,
        date: '2026-06-18',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 105,
    rollNo: 'SSC-105',
    name: "S. Deekshith",
    class: "2nd Class",
    parentName: "S. Venkata Ramana",
    fatherName: "S. Venkata Ramana",
    motherName: '',
    phone: '9550147016',
    school: "",
    joiningDate: '2026-06-01',
    monthlyFee: 250,
    advanceAmount: 250,
    advanceDate: '2026-07-12',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 2nd Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-105',
        receiptNo: 'REC-202607-105',
        year: 2026,
        month: 7,
        amount: 250,
        date: '2026-07-12',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 106,
    rollNo: 'SSC-106',
    name: "Shanmukh",
    class: "2nd Class",
    parentName: "Kanaka Laxmi",
    fatherName: "Kanaka Laxmi",
    motherName: '',
    phone: '9652695362',
    school: "",
    joiningDate: '2026-06-06',
    monthlyFee: 250,
    advanceAmount: 250,
    advanceDate: '2026-06-18',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 2nd Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-106',
        receiptNo: 'REC-202606-106',
        year: 2026,
        month: 6,
        amount: 250,
        date: '2026-06-18',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 107,
    rollNo: 'SSC-107',
    name: "Neeha",
    class: "2nd Class",
    parentName: "Padma",
    fatherName: "Padma",
    motherName: '',
    phone: '9949122500',
    school: "",
    joiningDate: '2026-07-01',
    monthlyFee: 250,
    advanceAmount: 250,
    advanceDate: '2026-07-01',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 2nd Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-107',
        receiptNo: 'REC-202607-107',
        year: 2026,
        month: 7,
        amount: 250,
        date: '2026-07-01',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 108,
    rollNo: 'SSC-108',
    name: "Mustafa",
    class: "2nd Class",
    parentName: "Asgari Khatoon",
    fatherName: "Asgari Khatoon",
    motherName: '',
    phone: '7661917205',
    school: "",
    joiningDate: '2026-07-02',
    monthlyFee: 250,
    advanceAmount: 250,
    advanceDate: '2026-08-21',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 2nd Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-108',
        receiptNo: 'REC-202608-108',
        year: 2026,
        month: 8,
        amount: 250,
        date: '2026-08-21',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 109,
    rollNo: 'SSC-109',
    name: "R. Moksha Sri",
    class: "2nd Class",
    parentName: "R. Laxmi",
    fatherName: "R. Laxmi",
    motherName: '',
    phone: '9959999331',
    school: "",
    joiningDate: '2026-07-01',
    monthlyFee: 250,
    advanceAmount: 250,
    advanceDate: '2026-07-10',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 2nd Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-109',
        receiptNo: 'REC-202607-109',
        year: 2026,
        month: 7,
        amount: 250,
        date: '2026-07-10',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 110,
    rollNo: 'SSC-110',
    name: "B. Harshith",
    class: "3rd Class",
    parentName: "Chinnammalu",
    fatherName: "Chinnammalu",
    motherName: '',
    phone: '7093926533',
    school: "",
    joiningDate: '2026-06-05',
    monthlyFee: 250,
    advanceAmount: 250,
    advanceDate: '2026-06-08',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 3rd Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-110',
        receiptNo: 'REC-202606-110',
        year: 2026,
        month: 6,
        amount: 250,
        date: '2026-06-08',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 111,
    rollNo: 'SSC-111',
    name: "K. Praneeth",
    class: "3rd Class",
    parentName: "Kalavathi",
    fatherName: "Kalavathi",
    motherName: '',
    phone: '8522987724',
    school: "",
    joiningDate: '2026-07-01',
    monthlyFee: 250,
    advanceAmount: 250,
    advanceDate: '2026-07-15',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 3rd Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-111',
        receiptNo: 'REC-202607-111',
        year: 2026,
        month: 7,
        amount: 250,
        date: '2026-07-15',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 112,
    rollNo: 'SSC-112',
    name: "Pragna",
    class: "3rd Class",
    parentName: "P. Laxmi",
    fatherName: "P. Laxmi",
    motherName: '',
    phone: '7989400223',
    school: "",
    joiningDate: '2026-08-05',
    monthlyFee: 250,
    advanceAmount: 250,
    advanceDate: '2026-08-05',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 3rd Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-112',
        receiptNo: 'REC-202608-112',
        year: 2026,
        month: 8,
        amount: 250,
        date: '2026-08-05',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 113,
    rollNo: 'SSC-113',
    name: "L. Lohith",
    class: "3rd Class",
    parentName: "Rama Devi",
    fatherName: "Rama Devi",
    motherName: '',
    phone: '8498072498',
    school: "",
    joiningDate: '2026-11-02',
    monthlyFee: 250,
    advanceAmount: 0,
    advanceDate: '2026-11-02',
    status: 'active',
    paymentStatus: 'Pending',
    notes: 'Enrolled in 3rd Class tuition program.',
    feeHistory: []
  },
  {
    id: 114,
    rollNo: 'SSC-114',
    name: "Asif",
    class: "LKG",
    parentName: "Sk. Fathima",
    fatherName: "Sk. Fathima",
    motherName: '',
    phone: '9603639829',
    school: "",
    joiningDate: '2026-06-28',
    monthlyFee: 150,
    advanceAmount: 150,
    advanceDate: '2026-06-28',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in LKG tuition program.',
    feeHistory: [
      {
        id: 'PAY-114',
        receiptNo: 'REC-202606-114',
        year: 2026,
        month: 6,
        amount: 150,
        date: '2026-06-28',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 115,
    rollNo: 'SSC-115',
    name: "Naveen",
    class: "LKG",
    parentName: "",
    fatherName: "",
    motherName: '',
    phone: '8688491685',
    school: "",
    joiningDate: '2026-06-03',
    monthlyFee: 150,
    advanceAmount: 150,
    advanceDate: '2026-06-03',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in LKG tuition program.',
    feeHistory: [
      {
        id: 'PAY-115',
        receiptNo: 'REC-202606-115',
        year: 2026,
        month: 6,
        amount: 150,
        date: '2026-06-03',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 116,
    rollNo: 'SSC-116',
    name: "Purnima",
    class: "UKG",
    parentName: "",
    fatherName: "",
    motherName: '',
    phone: '',
    school: "",
    joiningDate: '2026-06-03',
    monthlyFee: 200,
    advanceAmount: 200,
    advanceDate: '2026-06-03',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in UKG tuition program.',
    feeHistory: [
      {
        id: 'PAY-116',
        receiptNo: 'REC-202606-116',
        year: 2026,
        month: 6,
        amount: 200,
        date: '2026-06-03',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 117,
    rollNo: 'SSC-117',
    name: "Puneeth",
    class: "1st Class",
    parentName: "Venkata",
    fatherName: "Venkata",
    motherName: '',
    phone: '',
    school: "",
    joiningDate: '2026-06-01',
    monthlyFee: 200,
    advanceAmount: 200,
    advanceDate: '2026-06-01',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 1st Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-117',
        receiptNo: 'REC-202606-117',
        year: 2026,
        month: 6,
        amount: 200,
        date: '2026-06-01',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 118,
    rollNo: 'SSC-118',
    name: "S. Yamini",
    class: "2nd Class",
    parentName: "",
    fatherName: "",
    motherName: '',
    phone: '',
    school: "",
    joiningDate: '2026-06-01',
    monthlyFee: 250,
    advanceAmount: 0,
    advanceDate: '2026-06-01',
    status: 'active',
    paymentStatus: 'Pending',
    notes: 'Enrolled in 2nd Class tuition program.',
    feeHistory: []
  },
  {
    id: 119,
    rollNo: 'SSC-119',
    name: "S. Sathwik",
    class: "2nd Class",
    parentName: "",
    fatherName: "",
    motherName: '',
    phone: '',
    school: "",
    joiningDate: '2026-06-01',
    monthlyFee: 250,
    advanceAmount: 0,
    advanceDate: '2026-06-01',
    status: 'active',
    paymentStatus: 'Pending',
    notes: 'Enrolled in 2nd Class tuition program.',
    feeHistory: []
  },
  {
    id: 120,
    rollNo: 'SSC-120',
    name: "P. Jaswanth",
    class: "3rd Class",
    parentName: "P. Mariya",
    fatherName: "P. Mariya",
    motherName: '',
    phone: '8522975783',
    school: "",
    joiningDate: '2026-07-21',
    monthlyFee: 250,
    advanceAmount: 250,
    advanceDate: '2026-07-21',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 3rd Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-120',
        receiptNo: 'REC-202607-120',
        year: 2026,
        month: 7,
        amount: 250,
        date: '2026-07-21',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 121,
    rollNo: 'SSC-121',
    name: "K. Rithik",
    class: "4th Class",
    parentName: "",
    fatherName: "",
    motherName: '',
    phone: '',
    school: "",
    joiningDate: '2026-09-01',
    monthlyFee: 250,
    advanceAmount: 250,
    advanceDate: '2026-09-01',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 4th Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-121',
        receiptNo: 'REC-202609-121',
        year: 2026,
        month: 9,
        amount: 250,
        date: '2026-09-01',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 122,
    rollNo: 'SSC-122',
    name: "V. Bhuvana",
    class: "4th Class",
    parentName: "Gayathri",
    fatherName: "Gayathri",
    motherName: '',
    phone: '7989099355',
    school: "",
    joiningDate: '2026-07-01',
    monthlyFee: 250,
    advanceAmount: 250,
    advanceDate: '2026-07-16',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 4th Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-122',
        receiptNo: 'REC-202607-122',
        year: 2026,
        month: 7,
        amount: 250,
        date: '2026-07-16',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 123,
    rollNo: 'SSC-123',
    name: "G. Bhuvana",
    class: "4th Class",
    parentName: "Rama Laxmi",
    fatherName: "Rama Laxmi",
    motherName: '',
    phone: '8096705337',
    school: "",
    joiningDate: '2026-07-01',
    monthlyFee: 250,
    advanceAmount: 250,
    advanceDate: '2026-07-01',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 4th Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-123',
        receiptNo: 'REC-202607-123',
        year: 2026,
        month: 7,
        amount: 250,
        date: '2026-07-01',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 124,
    rollNo: 'SSC-124',
    name: "L. Lasya",
    class: "4th Class",
    parentName: "Kalavathi",
    fatherName: "Kalavathi",
    motherName: '',
    phone: '7013223101',
    school: "",
    joiningDate: '2026-08-04',
    monthlyFee: 250,
    advanceAmount: 250,
    advanceDate: '2026-08-26',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 4th Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-124',
        receiptNo: 'REC-202608-124',
        year: 2026,
        month: 8,
        amount: 250,
        date: '2026-08-26',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 125,
    rollNo: 'SSC-125',
    name: "Ch. Thamish",
    class: "5th Class",
    parentName: "Ch. Ramesh",
    fatherName: "Ch. Ramesh",
    motherName: '',
    phone: '7013244281',
    school: "",
    joiningDate: '2026-06-18',
    monthlyFee: 250,
    advanceAmount: 250,
    advanceDate: '2026-06-20',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 5th Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-125',
        receiptNo: 'REC-202606-125',
        year: 2026,
        month: 6,
        amount: 250,
        date: '2026-06-20',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 126,
    rollNo: 'SSC-126',
    name: "M.D. Golam Nabi",
    class: "5th Class",
    parentName: "Asgari Khatoon",
    fatherName: "Asgari Khatoon",
    motherName: '',
    phone: '7661917205',
    school: "",
    joiningDate: '2026-07-02',
    monthlyFee: 250,
    advanceAmount: 250,
    advanceDate: '2026-08-21',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 5th Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-126',
        receiptNo: 'REC-202608-126',
        year: 2026,
        month: 8,
        amount: 250,
        date: '2026-08-21',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 127,
    rollNo: 'SSC-127',
    name: "R. Deepika",
    class: "6th Class",
    parentName: "R. Laxmi",
    fatherName: "R. Laxmi",
    motherName: '',
    phone: '9959999331',
    school: "",
    joiningDate: '2026-07-01',
    monthlyFee: 300,
    advanceAmount: 300,
    advanceDate: '2026-07-10',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 6th Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-127',
        receiptNo: 'REC-202607-127',
        year: 2026,
        month: 7,
        amount: 300,
        date: '2026-07-10',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 128,
    rollNo: 'SSC-128',
    name: "S. Siva Karthik",
    class: "6th Class",
    parentName: "S. Venkata Ramana",
    fatherName: "S. Venkata Ramana",
    motherName: '',
    phone: '9550147016',
    school: "",
    joiningDate: '2026-07-01',
    monthlyFee: 300,
    advanceAmount: 300,
    advanceDate: '2026-07-12',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 6th Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-128',
        receiptNo: 'REC-202607-128',
        year: 2026,
        month: 7,
        amount: 300,
        date: '2026-07-12',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 129,
    rollNo: 'SSC-129',
    name: "V. Chandini",
    class: "6th Class",
    parentName: "V. Gayathri",
    fatherName: "V. Gayathri",
    motherName: '',
    phone: '7989099355',
    school: "",
    joiningDate: '2026-07-01',
    monthlyFee: 300,
    advanceAmount: 300,
    advanceDate: '2026-07-16',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 6th Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-129',
        receiptNo: 'REC-202607-129',
        year: 2026,
        month: 7,
        amount: 300,
        date: '2026-07-16',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 130,
    rollNo: 'SSC-130',
    name: "Hasritha",
    class: "6th Class",
    parentName: "P. Laxmi",
    fatherName: "P. Laxmi",
    motherName: '',
    phone: '7989400223',
    school: "",
    joiningDate: '2026-08-05',
    monthlyFee: 300,
    advanceAmount: 300,
    advanceDate: '2026-08-15',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 6th Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-130',
        receiptNo: 'REC-202608-130',
        year: 2026,
        month: 8,
        amount: 300,
        date: '2026-08-15',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 131,
    rollNo: 'SSC-131',
    name: "P. Karthik",
    class: "6th Class",
    parentName: "P. Sita",
    fatherName: "P. Sita",
    motherName: '',
    phone: '8367044796',
    school: "",
    joiningDate: '2026-08-14',
    monthlyFee: 300,
    advanceAmount: 300,
    advanceDate: '2026-09-01',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 6th Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-131',
        receiptNo: 'REC-202609-131',
        year: 2026,
        month: 9,
        amount: 300,
        date: '2026-09-01',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 132,
    rollNo: 'SSC-132',
    name: "L. Poojith",
    class: "7th Class",
    parentName: "L. Satyanarayana",
    fatherName: "L. Satyanarayana",
    motherName: '',
    phone: '7013223101',
    school: "",
    joiningDate: '2026-07-03',
    monthlyFee: 350,
    advanceAmount: 350,
    advanceDate: '2026-07-24',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 7th Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-132',
        receiptNo: 'REC-202607-132',
        year: 2026,
        month: 7,
        amount: 350,
        date: '2026-07-24',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 133,
    rollNo: 'SSC-133',
    name: "Ch. Dilleshwara",
    class: "7th Class",
    parentName: "Ch. Ramesh",
    fatherName: "Ch. Ramesh",
    motherName: '',
    phone: '7013244281',
    school: "",
    joiningDate: '2026-06-18',
    monthlyFee: 350,
    advanceAmount: 350,
    advanceDate: '2026-06-26',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 7th Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-133',
        receiptNo: 'REC-202606-133',
        year: 2026,
        month: 6,
        amount: 350,
        date: '2026-06-26',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 134,
    rollNo: 'SSC-134',
    name: "G. Bhuvan",
    class: "7th Class",
    parentName: "Rama Laxmi",
    fatherName: "Rama Laxmi",
    motherName: '',
    phone: '8096705337',
    school: "",
    joiningDate: '2026-07-01',
    monthlyFee: 350,
    advanceAmount: 350,
    advanceDate: '2026-07-01',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 7th Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-134',
        receiptNo: 'REC-202607-134',
        year: 2026,
        month: 7,
        amount: 350,
        date: '2026-07-01',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 135,
    rollNo: 'SSC-135',
    name: "G. Govind Sai",
    class: "7th Class",
    parentName: "Santhoshi",
    fatherName: "Santhoshi",
    motherName: '',
    phone: '9014492194',
    school: "",
    joiningDate: '2026-06-01',
    monthlyFee: 350,
    advanceAmount: 350,
    advanceDate: '2026-06-17',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 7th Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-135',
        receiptNo: 'REC-202606-135',
        year: 2026,
        month: 6,
        amount: 350,
        date: '2026-06-17',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 136,
    rollNo: 'SSC-136',
    name: "K. Sharmila",
    class: "7th Class",
    parentName: "Kalavathi",
    fatherName: "Kalavathi",
    motherName: '',
    phone: '8522987724',
    school: "",
    joiningDate: '2026-07-01',
    monthlyFee: 350,
    advanceAmount: 350,
    advanceDate: '2026-07-15',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 7th Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-136',
        receiptNo: 'REC-202607-136',
        year: 2026,
        month: 7,
        amount: 350,
        date: '2026-07-15',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 137,
    rollNo: 'SSC-137',
    name: "N. Manasa",
    class: "7th Class",
    parentName: "Bhavani",
    fatherName: "Bhavani",
    motherName: '',
    phone: '7680847263',
    school: "",
    joiningDate: '2026-06-24',
    monthlyFee: 350,
    advanceAmount: 350,
    advanceDate: '2026-07-27',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 7th Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-137',
        receiptNo: 'REC-202607-137',
        year: 2026,
        month: 7,
        amount: 350,
        date: '2026-07-27',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 138,
    rollNo: 'SSC-138',
    name: "Aamna Khatoon",
    class: "7th Class",
    parentName: "Asgari Khatoon",
    fatherName: "Asgari Khatoon",
    motherName: '',
    phone: '7661917205',
    school: "",
    joiningDate: '2026-07-02',
    monthlyFee: 350,
    advanceAmount: 350,
    advanceDate: '2026-08-21',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 7th Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-138',
        receiptNo: 'REC-202608-138',
        year: 2026,
        month: 8,
        amount: 350,
        date: '2026-08-21',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 139,
    rollNo: 'SSC-139',
    name: "M. Mokshitha",
    class: "8th Class",
    parentName: "Nagaratnam",
    fatherName: "Nagaratnam",
    motherName: '',
    phone: '8096473557',
    school: "",
    joiningDate: '2026-09-26',
    monthlyFee: 400,
    advanceAmount: 400,
    advanceDate: '2026-10-29',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 8th Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-139',
        receiptNo: 'REC-202610-139',
        year: 2026,
        month: 10,
        amount: 400,
        date: '2026-10-29',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  },
  {
    id: 140,
    rollNo: 'SSC-140',
    name: "Ch. Gowthami Lasya",
    class: "9th Class",
    parentName: "Santhoshi",
    fatherName: "Santhoshi",
    motherName: '',
    phone: '8179933203',
    school: "",
    joiningDate: '2026-06-19',
    monthlyFee: 400,
    advanceAmount: 400,
    advanceDate: '2026-06-12',
    status: 'active',
    paymentStatus: 'Paid',
    notes: 'Enrolled in 9th Class tuition program.',
    feeHistory: [
      {
        id: 'PAY-140',
        receiptNo: 'REC-202606-140',
        year: 2026,
        month: 6,
        amount: 400,
        date: '2026-06-12',
        mode: 'Cash',
        notes: 'Advance tuition fee credited at enrollment'
      }
    ]
  }
];

// Initial Enrollment Requests (Empty by default: populated only by real visitor submissions)
const INITIAL_ENROLLMENTS = [];

// Initial Staff Accounts
const INITIAL_STAFF = [
  { id: 'stf-001', email: 'admin@sscstudycircle.com', fullName: 'Center Director', phone: '8919961354', role: 'admin', status: 'approved', createdAt: '2025-06-01T00:00:00Z', approvedAt: '2025-06-01T00:00:00Z' },
  { id: 'stf-002', email: 'faculty.math@sscstudycircle.com', fullName: 'Srinivasa Rao (Senior Math Tutor)', phone: '9849055667', role: 'staff', status: 'approved', createdAt: '2025-07-01T00:00:00Z', approvedAt: '2025-07-02T00:00:00Z' },
  { id: 'stf-003', email: 'counselor@sscstudycircle.com', fullName: 'Ananya Sharma (Academic Counselor)', phone: '9701233445', role: 'staff', status: 'pending', createdAt: '2026-10-18T10:30:00Z', approvedAt: null }
];

// Initial Notifications (Empty by default: populated only by real actions)
const INITIAL_NOTIFICATIONS = [];

class CentralSSCStore {
  constructor() {
    this.state = this.loadFromStorage();
    this.listeners = [];
  }

  loadFromStorage() {
    try {
      // Remove deprecated store keys
      ['ssc_tuition_central_store_v5', 'ssc_tuition_central_store_v4', 'ssc_tuition_central_store_v3', 'ssc_tuition_central_store_v2', 'ssc_tuition_central_store_v1', 'ssc_students_records_v4', 'ssc_students_records_v3', 'ssc_students_records_v2', 'ssc_students_records_v1'].forEach(k => {
        try { localStorage.removeItem(k); } catch (e) {}
      });

      const saved = localStorage.getItem(SSC_STORE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasOldData = parsed.students && parsed.students.some(s => s.name === 'Poojith Reddy' || s.rollNo === 'SSC-2026-001');
        if (parsed && Array.isArray(parsed.students) && parsed.students.length >= 40 && !hasOldData) {
          if (!Array.isArray(parsed.recycleBin)) parsed.recycleBin = [];
          if (!Array.isArray(parsed.notifications)) parsed.notifications = [];
          if (!Array.isArray(parsed.enrollments)) parsed.enrollments = [];


          // Purge any legacy dummy/seed enrollment requests and notifications from localStorage
          const dummyEnrIds = ['SSC-ENR-2026-1001', 'SSC-ENR-2026-1002', 'SSC-ENR-2026-1003'];
          const dummyStudentNames = ['Abhinav Reddy', 'Samyuktha Rao', 'Charan Teja'];
          const dummyNotifIds = ['notif-1', 'notif-2', 'notif-3'];

          const hadDummyEnr = parsed.enrollments.some(e => dummyEnrIds.includes(e.requestId) || dummyStudentNames.includes(e.studentName));
          const hadDummyNotif = parsed.notifications.some(n => dummyNotifIds.includes(n.id) || dummyEnrIds.includes(n.referenceId));

          parsed.enrollments = parsed.enrollments.filter(e => 
            !dummyEnrIds.includes(e.requestId) && !dummyStudentNames.includes(e.studentName)
          );

          parsed.notifications = parsed.notifications.filter(n =>
            !dummyNotifIds.includes(n.id) && !dummyEnrIds.includes(n.referenceId)
          );

          parsed.recycleBin = (parsed.recycleBin || []).filter(item => {
            const data = item.data || {};
            return !dummyEnrIds.includes(data.requestId) && !dummyStudentNames.includes(data.studentName);
          });

          if (hadDummyEnr || hadDummyNotif) {
            try {
              localStorage.setItem(SSC_STORE_KEY, JSON.stringify(parsed));
            } catch (err) {}
          }

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
    return sortStudentList(this.state.students || [], 'class-asc');
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

    if (fields.status !== undefined) {
      const normalized = (fields.status === 'discontinued' || fields.status === 'inactive') ? 'discontinued' : 'active';
      student.status = normalized;
      if (normalized === 'discontinued') {
        if (!student.discontinuedDate) {
          student.discontinuedDate = fields.discontinuedDate || new Date().toISOString().split('T')[0];
        }
      } else {
        delete student.discontinuedDate;
      }
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

  // Student Continue / Discontinue Status Management
  setStudentStatus(studentId, newStatus) {
    const numId = Number(studentId);
    const student = this.getStudentById(numId);
    if (!student) return null;

    const normalized = (newStatus === 'discontinued' || newStatus === 'inactive') ? 'discontinued' : 'active';
    student.status = normalized;
    if (normalized === 'discontinued') {
      if (!student.discontinuedDate) {
        student.discontinuedDate = new Date().toISOString().split('T')[0];
      }
    } else {
      delete student.discontinuedDate;
    }

    // Real-Time Cloud Sync: Supabase PostgreSQL
    if (window.DatabaseService && typeof window.DatabaseService.syncStudentUpdate === 'function') {
      window.DatabaseService.syncStudentUpdate(student.id, student);
    }

    this.saveToStorage();
    this.emit('STUDENT_STATUS_CHANGED', { student, status: normalized });
    return student;
  }

  toggleStudentStatus(studentId) {
    const student = this.getStudentById(Number(studentId));
    if (!student) return null;
    const isDisc = student.status === 'discontinued' || student.status === 'inactive';
    const nextStatus = isDisc ? 'active' : 'discontinued';
    return this.setStudentStatus(student.id, nextStatus);
  }

  deleteFeePayment(studentId, paymentId) {
    const student = this.getStudentById(Number(studentId));
    if (!student || !Array.isArray(student.feeHistory)) return false;

    const idx = student.feeHistory.findIndex(p => p.id === paymentId || p.receiptNo === paymentId);
    if (idx === -1) return false;

    const deleted = student.feeHistory.splice(idx, 1)[0];
    this.saveToStorage();
    this.emit('FEE_PAYMENT_DELETED', { studentId: student.id, payment: deleted });
    return true;
  }

  // Dynamic Class Counts for Top Summary Cards
  getClassStudentCounts() {
    const allStudents = this.getStudents();
    const students = allStudents.filter(s => s.status !== 'discontinued' && s.status !== 'inactive');
    const discontinuedStudents = allStudents.filter(s => s.status === 'discontinued' || s.status === 'inactive');
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

    // Auto-derive Due Date from student's joining day
    const [jYear, jMonth, jDay] = (student.joiningDate || '2026-06-01').split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const dueDay = Math.min(jDay || 1, daysInMonth);
    const dueDateObj = new Date(year, month - 1, dueDay);
    const dueDateDisplay = dueDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const isDiscontinued = student.status === 'discontinued' || student.status === 'inactive';

    // Sum ONLY payments explicitly recorded in feeHistory for this specific (year, month)
    const monthPayments = (student.feeHistory || []).filter(p => p.year === year && p.month === month);
    const paidAmount = monthPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const regularMonthlyFee = Number(student.monthlyFee || 0);

    // If student is discontinued and has no payment recorded for this month,
    // stop generating new monthly pending fee dues for them
    if (isDiscontinued && paidAmount === 0) {
      return {
        studentId: student.id,
        studentName: student.name,
        name: student.name,
        studentClass: student.class,
        class: student.class,
        school: student.school || '',
        rollNo: student.rollNo || `SSC-${student.id}`,
        parentName: student.parentName || student.fatherName || '',
        phone: student.phone || '',
        year,
        month,
        monthlyFee: 0,
        regularMonthlyFee,
        dueDay,
        dueDate: '—',
        dueDateDisplay: '—',
        paidAmount: 0,
        balance: 0,
        status: 'Discontinued',
        paidDate: '—',
        paidDateDisplay: '—',
        isDiscontinued: true,
        payments: [],
        transactions: [],
        latestReceiptNo: null
      };
    }

    const monthlyFee = regularMonthlyFee;
    const balance = Math.max(0, monthlyFee - paidAmount);

    let status = 'Pending';
    if (paidAmount >= monthlyFee && monthlyFee > 0) {
      status = 'Full Paid';
    } else if (paidAmount > 0) {
      status = 'Half Paid';
    } else {
      status = 'Pending';
    }

    const latestPayment = monthPayments.length > 0 ? monthPayments[monthPayments.length - 1] : null;
    const paidDateDisplay = latestPayment && latestPayment.date
      ? formatISODateDisplay(latestPayment.date)
      : '—';

    return {
      studentId: student.id,
      studentName: student.name,
      name: student.name,
      studentClass: student.class,
      class: student.class,
      school: student.school || '',
      rollNo: student.rollNo || `SSC-${student.id}`,
      parentName: student.parentName || student.fatherName || '',
      phone: student.phone || '',
      year,
      month,
      monthlyFee,
      regularMonthlyFee,
      dueDay,
      dueDate: dueDateDisplay,
      dueDateDisplay,
      paidAmount,
      balance,
      status, // 'Full Paid' | 'Half Paid' | 'Pending' | 'Discontinued'
      paidDate: paidDateDisplay,
      paidDateDisplay,
      isDiscontinued: false,
      payments: monthPayments,
      transactions: monthPayments,
      latestReceiptNo: latestPayment ? latestPayment.receiptNo : null
    };
  }

  /**
   * Returns complete month fee data for all registered students
   */
  getMonthLedger(year = 2026, month = 1) {
    const allStudents = this.getStudents();
    let records = [];

    allStudents.forEach(s => {
      const feeData = this.getStudentMonthFee(s.id, year, month);
      if (feeData) {
        records.push(feeData);
      }
    });

    // Sort alphabetically by student name
    records = sortStudentList(records, "class-asc");

    // Summary calculations
    let expectedTotal = 0;
    let collectedTotal = 0;
    let fullPaidCount = 0;
    let halfPaidCount = 0;
    let pendingCount = 0;
    let discontinuedCount = 0;

    records.forEach(r => {
      if (r.status === 'Discontinued' || r.isDiscontinued) {
        discontinuedCount++;
      } else {
        expectedTotal += r.monthlyFee;
        collectedTotal += r.paidAmount;
        if (r.status === 'Full Paid') fullPaidCount++;
        else if (r.status === 'Half Paid') halfPaidCount++;
        else pendingCount++;
      }
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
        pendingCount,
        discontinuedCount
      }
    };
  }

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
      monthlyFee: !isNaN(Number(classData.monthlyFee)) ? Number(classData.monthlyFee) : 1200,
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
    const allStudents = this.getStudents();
    const students = allStudents.filter(s => s.status !== 'discontinued' && s.status !== 'inactive');
    const discontinuedStudents = allStudents.filter(s => s.status === 'discontinued' || s.status === 'inactive');
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

  async submitEnrollment(data) {
    const cleanPhone = (data.parentPhone || data.phone || '').replace(/\D/g, '');
    const requestId = `SSC-ENR-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const newEnr = {
      id: Date.now(),
      requestId,
      studentName: (data.studentName || '').trim(),
      requestedClass: data.studentClass || data.requestedClass || '1st Class',
      parentName: (data.fatherName || data.motherName || data.parentName || 'Parent').trim(),
      fatherName: (data.fatherName || '').trim(),
      motherName: (data.motherName || '').trim(),
      phone: cleanPhone,
      email: (data.parentEmail || data.email || '').trim(),
      schoolName: (data.schoolName || '').trim(),
      board: data.board || 'State Board',
      streamSubject: data.selectedStream || data.streamSubject || 'All Core Subjects',
      additionalNotes: (data.notes || data.additionalNotes || '').trim(),
      status: 'pending',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    // Direct async insertion into Supabase enrollments table (matching exact schema column names)
    const dbPayload = {
      request_id: requestId,
      student_name: newEnr.studentName,
      requested_class: newEnr.requestedClass,
      parent_name: newEnr.parentName,
      father_name: newEnr.fatherName,
      mother_name: newEnr.motherName,
      phone: newEnr.phone,
      email: newEnr.email,
      school_name: newEnr.schoolName,
      board: newEnr.board,
      stream_subject: newEnr.streamSubject,
      additional_notes: newEnr.additionalNotes,
      status: 'pending',
      is_read: false
    };

    if (window.DatabaseService && typeof window.DatabaseService.insertEnrollmentRecord === 'function') {
      try {
        await window.DatabaseService.insertEnrollmentRecord(dbPayload);
      } catch (err) {
        console.warn('Supabase direct enrollment insert error:', err);
      }
    }

    this.state.enrollments.unshift(newEnr);

    this.addNotification(
      'New Enrollment Application',
      `Parent ${newEnr.parentName} submitted an application for ${newEnr.studentName} (${newEnr.requestedClass}). Phone: ${newEnr.phone}.`,
      'enrollment',
      requestId
    );

    this.saveToStorage();
    this.emit('ENROLLMENT_SUBMITTED', { enrollment: newEnr });
    return { success: true, requestId, enrollment: newEnr };
  }

  // Alias addEnrollment for compatibility
  async addEnrollment(data) {
    return await this.submitEnrollment(data);
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
    const allStudents = this.getStudents();
    const students = allStudents.filter(s => s.status !== 'discontinued' && s.status !== 'inactive');
    const discontinuedStudents = allStudents.filter(s => s.status === 'discontinued' || s.status === 'inactive');
    const enrollments = this.getEnrollments();
    const pendingEnrollments = enrollments.filter(e => e.status === 'pending');
    const books = this.getBooks();
    const classes = this.getClasses();

    // Total collections across all payments in fee history
    let totalRevenue = 0;
    students.forEach(s => {
      if (s.feeHistory && s.feeHistory.length > 0) {
        s.feeHistory.forEach(p => {
          totalRevenue += Number(p.amount || 0);
        });
      } else if (s.paymentStatus === 'Paid' && s.advanceAmount > 0) {
        totalRevenue += Number(s.advanceAmount);
      }
    });

    return {
      activeStudentsCount: students.length,
      discontinuedStudentsCount: discontinuedStudents.length,
      totalRegisteredStudents: allStudents.length,
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
