/**
 * SSC Students Study Circle - Students & Fee History Structured Data Store
 * Handles structured records, dynamic fee calculation, filtering, and local persistence.
 */

const STORAGE_KEY_STUDENTS = 'ssc_students_records_v6';

// Initial realistic dataset matching the 18 students and class distributions
const DEFAULT_STUDENTS = [
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

// Initialize and manage Student Store
class StudentsDataStore {
  constructor() {
    this.students = this.loadFromStorage();
  }

  loadFromStorage() {
    if (window.SSCStore && typeof window.SSCStore.getStudents === 'function') {
      return window.SSCStore.getStudents();
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 30) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not parse saved students from storage, falling back to default:', e);
    }
    this.saveToStorage(DEFAULT_STUDENTS);
    return DEFAULT_STUDENTS;
  }

  saveToStorage(data) {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save students to localStorage:', e);
    }
  }

  getAll() {
    if (window.SSCStore && typeof window.SSCStore.getStudents === 'function') {
      return window.SSCStore.getStudents();
    }
    return this.students;
  }

  getById(id) {
    if (window.SSCStore && typeof window.SSCStore.getStudentById === 'function') {
      return window.SSCStore.getStudentById(id);
    }
    return this.students.find(s => s.id === parseInt(id, 10));
  }

  calculateStudentTotals(student) {
    if (!student || !Array.isArray(student.feeHistory)) {
      return { totalPaid: 0, totalDue: 0, countPaid: 0, countDue: 0 };
    }
    let totalPaid = 0;
    let totalDue = 0;
    let countPaid = 0;
    let countDue = 0;

    student.feeHistory.forEach(record => {
      if (record.status === 'Paid') {
        totalPaid += record.amount || 0;
        countPaid++;
      } else if (record.status === 'Due') {
        totalDue += record.amount || 0;
        countDue++;
      }
    });

    return { totalPaid, totalDue, countPaid, countDue };
  }

  getMetrics() {
    if (window.SSCStore && typeof window.SSCStore.getClassStudentCounts === 'function') {
      const counts = window.SSCStore.getClassStudentCounts();
      return { total: counts.Total || counts.total || 0, byClass: counts };
    }
    const total = this.students.length;
    const byClass = {
      'LKG': 0,
      'UKG': 0,
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

    let totalCollected = 0;
    let totalPending = 0;

    this.students.forEach(s => {
      if (byClass[s.class] !== undefined) {
        byClass[s.class]++;
      } else {
        byClass[s.class] = 1;
      }
      const totals = this.calculateStudentTotals(s);
      totalCollected += totals.totalPaid;
      totalPending += totals.totalDue;
    });

    return {
      total,
      byClass,
      totalCollected,
      totalPending
    };
  }

  // Administrative Operations (Guarded by auth in admin-auth.js)
  addStudent(newStudentData) {
    const nextId = this.students.reduce((max, s) => Math.max(max, s.id || 0), 0) + 1;
    const createdStudent = {
      id: nextId,
      name: newStudentData.name || 'Student',
      class: newStudentData.class || '2nd Class',
      phone: newStudentData.phone || '',
      school: newStudentData.school || '',
      fatherName: newStudentData.fatherName || '',
      motherName: newStudentData.motherName || '',
      joiningDate: newStudentData.joiningDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      advanceDate: newStudentData.advanceDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      monthlyFee: parseInt(newStudentData.monthlyFee, 10) || 1200,
      status: 'active',
      feeHistory: newStudentData.feeHistory || [
        {
          id: `F${nextId}01`,
          month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          amount: parseInt(newStudentData.monthlyFee, 10) || 1200,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          mode: 'Cash',
          status: 'Paid',
          receiptNo: `REC-ADM-${nextId}`
        }
      ]
    };

    this.students.unshift(createdStudent);
    this.saveToStorage(this.students);
    return createdStudent;
  }

  updateStudent(id, updatedFields) {
    const index = this.students.findIndex(s => s.id === parseInt(id, 10));
    if (index === -1) return null;

    this.students[index] = {
      ...this.students[index],
      ...updatedFields
    };

    this.saveToStorage(this.students);
    return this.students[index];
  }

  deleteStudent(id) {
    const initialLength = this.students.length;
    this.students = this.students.filter(s => s.id !== parseInt(id, 10));
    if (this.students.length !== initialLength) {
      this.saveToStorage(this.students);
      return true;
    }
    return false;
  }

  addFeePayment(studentId, paymentData) {
    const student = this.getById(studentId);
    if (!student) return null;

    const receiptNo = `REC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;
    const newRecord = {
      id: `F${student.id}${Date.now().toString().slice(-4)}`,
      month: paymentData.month || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      amount: parseInt(paymentData.amount, 10) || student.monthlyFee,
      date: paymentData.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      mode: paymentData.mode || 'UPI',
      status: 'Paid',
      receiptNo
    };

    if (!Array.isArray(student.feeHistory)) {
      student.feeHistory = [];
    }

    // Check if month already exists as upcoming or due
    const existingIndex = student.feeHistory.findIndex(h => h.month === newRecord.month);
    if (existingIndex !== -1) {
      student.feeHistory[existingIndex] = newRecord;
    } else {
      student.feeHistory.unshift(newRecord);
    }

    this.saveToStorage(this.students);
    return newRecord;
  }

  reset() {
    this.students = JSON.parse(JSON.stringify(DEFAULT_STUDENTS));
    this.saveToStorage(this.students);
    return this.students;
  }
}

// Global window instance - Preserve centralized SSCStore single source of truth
if (!window.StudentsStore || typeof window.StudentsStore.getAll !== 'function') {
  window.StudentsStore = new StudentsDataStore();
}
