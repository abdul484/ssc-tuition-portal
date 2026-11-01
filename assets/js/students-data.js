/**
 * SSC Students Study Circle - Students & Fee History Structured Data Store
 * Handles structured records, dynamic fee calculation, filtering, and local persistence.
 */

const STORAGE_KEY_STUDENTS = 'ssc_students_records_v2';

// Initial realistic dataset matching the 18 students and class distributions
const DEFAULT_STUDENTS = [
  {
    id: 1,
    name: 'Poojith',
    class: '6th Class',
    phone: '98765 43210',
    school: 'St. Mary High School',
    fatherName: 'Venkat Rao',
    motherName: 'Lakshmi',
    joiningDate: '03 Jul 2025',
    advanceDate: '03 Jul 2025',
    monthlyFee: 1500,
    status: 'active',
    feeHistory: [
      { id: 'F101', month: 'July 2025', amount: 1500, date: '03 Jul 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2507-01' },
      { id: 'F102', month: 'August 2025', amount: 1500, date: '05 Aug 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2508-01' },
      { id: 'F103', month: 'September 2025', amount: 1500, date: '04 Sep 2025', mode: 'Cash', status: 'Paid', receiptNo: 'REC-2509-01' },
      { id: 'F104', month: 'October 2025', amount: 1500, date: '03 Oct 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2510-01' },
      { id: 'F105', month: 'November 2025', amount: 1500, date: 'Pending', mode: '-', status: 'Upcoming', receiptNo: '-' }
    ]
  },
  {
    id: 2,
    name: 'Lasya',
    class: '5th Class',
    phone: '91234 56789',
    school: 'Kendriya Vidyalaya',
    fatherName: 'Srinivas Murthy',
    motherName: 'Sunita',
    joiningDate: '10 Jul 2025',
    advanceDate: '10 Jul 2025',
    monthlyFee: 1400,
    status: 'active',
    feeHistory: [
      { id: 'F201', month: 'July 2025', amount: 1400, date: '10 Jul 2025', mode: 'Cash', status: 'Paid', receiptNo: 'REC-2507-02' },
      { id: 'F202', month: 'August 2025', amount: 1400, date: '08 Aug 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2508-02' },
      { id: 'F203', month: 'September 2025', amount: 1400, date: '09 Sep 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2509-02' },
      { id: 'F204', month: 'October 2025', amount: 1400, date: '08 Oct 2025', mode: 'Cash', status: 'Paid', receiptNo: 'REC-2510-02' },
      { id: 'F205', month: 'November 2025', amount: 1400, date: 'Pending', mode: '-', status: 'Upcoming', receiptNo: '-' }
    ]
  },
  {
    id: 3,
    name: 'Rohan',
    class: '4th Class',
    phone: '99887 66554',
    school: 'Delhi Public School',
    fatherName: 'Rajesh Sharma',
    motherName: 'Kavita',
    joiningDate: '05 Aug 2025',
    advanceDate: '05 Aug 2025',
    monthlyFee: 1300,
    status: 'active',
    feeHistory: [
      { id: 'F301', month: 'August 2025', amount: 1300, date: '05 Aug 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2508-03' },
      { id: 'F302', month: 'September 2025', amount: 1300, date: '06 Sep 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2509-03' },
      { id: 'F303', month: 'October 2025', amount: 1300, date: '07 Oct 2025', mode: 'Cash', status: 'Paid', receiptNo: 'REC-2510-03' },
      { id: 'F304', month: 'November 2025', amount: 1300, date: 'Pending', mode: '-', status: 'Upcoming', receiptNo: '-' }
    ]
  },
  {
    id: 4,
    name: 'Saanvi',
    class: '3rd Class',
    phone: '90123 45678',
    school: 'Bhavans Vidya Mandir',
    fatherName: 'Naveen Kumar',
    motherName: 'Deepa',
    joiningDate: '12 Aug 2025',
    advanceDate: '12 Aug 2025',
    monthlyFee: 1200,
    status: 'active',
    feeHistory: [
      { id: 'F401', month: 'August 2025', amount: 1200, date: '12 Aug 2025', mode: 'Cash', status: 'Paid', receiptNo: 'REC-2508-04' },
      { id: 'F402', month: 'September 2025', amount: 1200, date: '10 Sep 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2509-04' },
      { id: 'F403', month: 'October 2025', amount: 1200, date: 'Pending', mode: '-', status: 'Due', receiptNo: '-' }
    ]
  },
  {
    id: 5,
    name: 'Aditya',
    class: '7th Class',
    phone: '93456 78901',
    school: 'Chaitanya Techno School',
    fatherName: 'Prasad Reddy',
    motherName: 'Padma',
    joiningDate: '01 Sep 2025',
    advanceDate: '01 Sep 2025',
    monthlyFee: 1600,
    status: 'active',
    feeHistory: [
      { id: 'F501', month: 'September 2025', amount: 1600, date: '01 Sep 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2509-05' },
      { id: 'F502', month: 'October 2025', amount: 1600, date: '02 Oct 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2510-05' },
      { id: 'F503', month: 'November 2025', amount: 1600, date: 'Pending', mode: '-', status: 'Upcoming', receiptNo: '-' }
    ]
  },
  {
    id: 6,
    name: 'Meera',
    class: '2nd Class',
    phone: '98765 11223',
    school: 'Lotus Lap Public School',
    fatherName: 'Mahesh Joshi',
    motherName: 'Anuradha',
    joiningDate: '07 Sep 2025',
    advanceDate: '07 Sep 2025',
    monthlyFee: 1100,
    status: 'active',
    feeHistory: [
      { id: 'F601', month: 'September 2025', amount: 1100, date: '07 Sep 2025', mode: 'Cash', status: 'Paid', receiptNo: 'REC-2509-06' },
      { id: 'F602', month: 'October 2025', amount: 1100, date: '05 Oct 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2510-06' }
    ]
  },
  {
    id: 7,
    name: 'Karthik',
    class: '6th Class',
    phone: '80976 54321',
    school: 'Narayana Olympiad School',
    fatherName: 'Chandra Sekhar',
    motherName: 'Geetha',
    joiningDate: '15 Sep 2025',
    advanceDate: '15 Sep 2025',
    monthlyFee: 1500,
    status: 'active',
    feeHistory: [
      { id: 'F701', month: 'September 2025', amount: 1500, date: '15 Sep 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2509-07' },
      { id: 'F702', month: 'October 2025', amount: 1500, date: '12 Oct 2025', mode: 'Cash', status: 'Paid', receiptNo: 'REC-2510-07' }
    ]
  },
  {
    id: 8,
    name: 'Ishaan',
    class: '5th Class',
    phone: '99880 22334',
    school: 'Vikas The Concept School',
    fatherName: 'Ramesh Varma',
    motherName: 'Radha',
    joiningDate: '20 Sep 2025',
    advanceDate: '20 Sep 2025',
    monthlyFee: 1400,
    status: 'active',
    feeHistory: [
      { id: 'F801', month: 'September 2025', amount: 1400, date: '20 Sep 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2509-08' },
      { id: 'F802', month: 'October 2025', amount: 1400, date: 'Pending', mode: '-', status: 'Due', receiptNo: '-' }
    ]
  },
  {
    id: 9,
    name: 'Aarav',
    class: '2nd Class',
    phone: '98450 11982',
    school: 'St. Pauls Grammar School',
    fatherName: 'Girish Roy',
    motherName: 'Meenakshi',
    joiningDate: '18 Jul 2025',
    advanceDate: '18 Jul 2025',
    monthlyFee: 1100,
    status: 'active',
    feeHistory: [
      { id: 'F901', month: 'July 2025', amount: 1100, date: '18 Jul 2025', mode: 'Cash', status: 'Paid', receiptNo: 'REC-2507-09' },
      { id: 'F902', month: 'August 2025', amount: 1100, date: '15 Aug 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2508-09' },
      { id: 'F903', month: 'September 2025', amount: 1100, date: '16 Sep 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2509-09' },
      { id: 'F904', month: 'October 2025', amount: 1100, date: '14 Oct 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2510-09' }
    ]
  },
  {
    id: 10,
    name: 'Ananya',
    class: '2nd Class',
    phone: '97012 34560',
    school: 'DAV Public School',
    fatherName: 'Vamshi Krishna',
    motherName: 'Sudha',
    joiningDate: '01 Aug 2025',
    advanceDate: '01 Aug 2025',
    monthlyFee: 1100,
    status: 'active',
    feeHistory: [
      { id: 'F1001', month: 'August 2025', amount: 1100, date: '01 Aug 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2508-10' },
      { id: 'F1002', month: 'September 2025', amount: 1100, date: '02 Sep 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2509-10' },
      { id: 'F1003', month: 'October 2025', amount: 1100, date: '03 Oct 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2510-10' }
    ]
  },
  {
    id: 11,
    name: 'Vihaan',
    class: '3rd Class',
    phone: '94401 22334',
    school: 'Gitanjali Devashray',
    fatherName: 'Praveen Chander',
    motherName: 'Bhavani',
    joiningDate: '15 Jul 2025',
    advanceDate: '15 Jul 2025',
    monthlyFee: 1200,
    status: 'active',
    feeHistory: [
      { id: 'F1101', month: 'July 2025', amount: 1200, date: '15 Jul 2025', mode: 'Cash', status: 'Paid', receiptNo: 'REC-2507-11' },
      { id: 'F1102', month: 'August 2025', amount: 1200, date: '12 Aug 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2508-11' },
      { id: 'F1103', month: 'September 2025', amount: 1200, date: '14 Sep 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2509-11' },
      { id: 'F1104', month: 'October 2025', amount: 1200, date: '12 Oct 2025', mode: 'Cash', status: 'Paid', receiptNo: 'REC-2510-11' }
    ]
  },
  {
    id: 12,
    name: 'Diya',
    class: '3rd Class',
    phone: '98661 55443',
    school: 'St. Ann’s High School',
    fatherName: 'Satish Nair',
    motherName: 'Malini',
    joiningDate: '22 Jul 2025',
    advanceDate: '22 Jul 2025',
    monthlyFee: 1200,
    status: 'active',
    feeHistory: [
      { id: 'F1201', month: 'July 2025', amount: 1200, date: '22 Jul 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2507-12' },
      { id: 'F1202', month: 'August 2025', amount: 1200, date: '20 Aug 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2508-12' },
      { id: 'F1203', month: 'September 2025', amount: 1200, date: '21 Sep 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2509-12' },
      { id: 'F1204', month: 'October 2025', amount: 1200, date: 'Pending', mode: '-', status: 'Due', receiptNo: '-' }
    ]
  },
  {
    id: 13,
    name: 'Sai Krishna',
    class: '3rd Class',
    phone: '99081 77665',
    school: 'Bhashyam Public School',
    fatherName: 'Murali Krishna',
    motherName: 'Usha',
    joiningDate: '01 Aug 2025',
    advanceDate: '01 Aug 2025',
    monthlyFee: 1200,
    status: 'active',
    feeHistory: [
      { id: 'F1301', month: 'August 2025', amount: 1200, date: '01 Aug 2025', mode: 'Cash', status: 'Paid', receiptNo: 'REC-2508-13' },
      { id: 'F1302', month: 'September 2025', amount: 1200, date: '03 Sep 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2509-13' },
      { id: 'F1303', month: 'October 2025', amount: 1200, date: '05 Oct 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2510-13' }
    ]
  },
  {
    id: 14,
    name: 'Reyansh',
    class: '4th Class',
    phone: '98480 33445',
    school: 'Oakridge International',
    fatherName: 'Anil Gupta',
    motherName: 'Shalini',
    joiningDate: '10 Aug 2025',
    advanceDate: '10 Aug 2025',
    monthlyFee: 1300,
    status: 'active',
    feeHistory: [
      { id: 'F1401', month: 'August 2025', amount: 1300, date: '10 Aug 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2508-14' },
      { id: 'F1402', month: 'September 2025', amount: 1300, date: '11 Sep 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2509-14' },
      { id: 'F1403', month: 'October 2025', amount: 1300, date: '09 Oct 2025', mode: 'Cash', status: 'Paid', receiptNo: 'REC-2510-14' }
    ]
  },
  {
    id: 15,
    name: 'Prisha',
    class: '4th Class',
    phone: '94901 88776',
    school: 'Meridian School',
    fatherName: 'Vijay Anand',
    motherName: 'Swapna',
    joiningDate: '18 Aug 2025',
    advanceDate: '18 Aug 2025',
    monthlyFee: 1300,
    status: 'active',
    feeHistory: [
      { id: 'F1501', month: 'August 2025', amount: 1300, date: '18 Aug 2025', mode: 'Cash', status: 'Paid', receiptNo: 'REC-2508-15' },
      { id: 'F1502', month: 'September 2025', amount: 1300, date: '17 Sep 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2509-15' },
      { id: 'F1503', month: 'October 2025', amount: 1300, date: '16 Oct 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2510-15' }
    ]
  },
  {
    id: 16,
    name: 'Tanvi',
    class: '5th Class',
    phone: '99591 44556',
    school: 'Silver Oaks International',
    fatherName: 'Kiran Kumar',
    motherName: 'Rohini',
    joiningDate: '04 Jul 2025',
    advanceDate: '04 Jul 2025',
    monthlyFee: 1400,
    status: 'active',
    feeHistory: [
      { id: 'F1601', month: 'July 2025', amount: 1400, date: '04 Jul 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2507-16' },
      { id: 'F1602', month: 'August 2025', amount: 1400, date: '05 Aug 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2508-16' },
      { id: 'F1603', month: 'September 2025', amount: 1400, date: '06 Sep 2025', mode: 'Cash', status: 'Paid', receiptNo: 'REC-2509-16' },
      { id: 'F1604', month: 'October 2025', amount: 1400, date: '04 Oct 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2510-16' }
    ]
  },
  {
    id: 17,
    name: 'Sravan',
    class: '6th Class',
    phone: '98492 66778',
    school: 'Sri Chaitanya Junior Academy',
    fatherName: 'Jagadeesh',
    motherName: 'Parvathi',
    joiningDate: '12 Jul 2025',
    advanceDate: '12 Jul 2025',
    monthlyFee: 1500,
    status: 'active',
    feeHistory: [
      { id: 'F1701', month: 'July 2025', amount: 1500, date: '12 Jul 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2507-17' },
      { id: 'F1702', month: 'August 2025', amount: 1500, date: '10 Aug 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2508-17' },
      { id: 'F1703', month: 'September 2025', amount: 1500, date: '11 Sep 2025', mode: 'Cash', status: 'Paid', receiptNo: 'REC-2509-17' },
      { id: 'F1704', month: 'October 2025', amount: 1500, date: 'Pending', mode: '-', status: 'Due', receiptNo: '-' }
    ]
  },
  {
    id: 18,
    name: 'Bhavya',
    class: '7th Class',
    phone: '90001 55667',
    school: 'Johnson Grammar School',
    fatherName: 'Sudarshan Rao',
    motherName: 'Kalyani',
    joiningDate: '25 Aug 2025',
    advanceDate: '25 Aug 2025',
    monthlyFee: 1600,
    status: 'active',
    feeHistory: [
      { id: 'F1801', month: 'August 2025', amount: 1600, date: '25 Aug 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2508-18' },
      { id: 'F1802', month: 'September 2025', amount: 1600, date: '24 Sep 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2509-18' },
      { id: 'F1803', month: 'October 2025', amount: 1600, date: '23 Oct 2025', mode: 'Cash', status: 'Paid', receiptNo: 'REC-2510-18' }
    ]
  },
  {
    id: 19,
    name: 'Aarav Kumar',
    class: 'LKG',
    phone: '98850 11223',
    school: 'Little Angels Play School',
    fatherName: 'Vikas Kumar',
    motherName: 'Ananya',
    joiningDate: '01 Jun 2025',
    advanceDate: '01 Jun 2025',
    monthlyFee: 1000,
    status: 'active',
    feeHistory: [
      { id: 'F1901', month: 'July 2025', amount: 1000, date: '01 Jul 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2507-19' },
      { id: 'F1902', month: 'August 2025', amount: 1000, date: '02 Aug 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2508-19' },
      { id: 'F1903', month: 'September 2025', amount: 1000, date: '01 Sep 2025', mode: 'Cash', status: 'Paid', receiptNo: 'REC-2509-19' },
      { id: 'F1904', month: 'October 2025', amount: 1000, date: '03 Oct 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2510-19' }
    ]
  },
  {
    id: 20,
    name: 'Diya Reddy',
    class: 'UKG',
    phone: '97012 33445',
    school: 'EuroKids Preschool',
    fatherName: 'Anand Reddy',
    motherName: 'Meenakshi',
    joiningDate: '15 Jun 2025',
    advanceDate: '15 Jun 2025',
    monthlyFee: 1100,
    status: 'active',
    feeHistory: [
      { id: 'F2001', month: 'July 2025', amount: 1100, date: '15 Jul 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2507-20' },
      { id: 'F2002', month: 'August 2025', amount: 1100, date: '12 Aug 2025', mode: 'Cash', status: 'Paid', receiptNo: 'REC-2508-20' },
      { id: 'F2003', month: 'September 2025', amount: 1100, date: '14 Sep 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2509-20' }
    ]
  },
  {
    id: 21,
    name: 'Ishaan Verma',
    class: '1st Class',
    phone: '99490 88776',
    school: 'St. Patrick High School',
    fatherName: 'Suresh Verma',
    motherName: 'Kiran',
    joiningDate: '01 Jul 2025',
    advanceDate: '01 Jul 2025',
    monthlyFee: 1150,
    status: 'active',
    feeHistory: [
      { id: 'F2101', month: 'July 2025', amount: 1150, date: '01 Jul 2025', mode: 'Cash', status: 'Paid', receiptNo: 'REC-2507-21' },
      { id: 'F2102', month: 'August 2025', amount: 1150, date: '04 Aug 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2508-21' },
      { id: 'F2103', month: 'September 2025', amount: 1150, date: '03 Sep 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2509-21' }
    ]
  },
  {
    id: 22,
    name: 'Siddharth Rao',
    class: '8th Class',
    phone: '98480 66554',
    school: 'Chaitanya Techno School',
    fatherName: 'Madhava Rao',
    motherName: 'Shalini',
    joiningDate: '10 Jul 2025',
    advanceDate: '10 Jul 2025',
    monthlyFee: 1700,
    status: 'active',
    feeHistory: [
      { id: 'F2201', month: 'July 2025', amount: 1700, date: '10 Jul 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2507-22' },
      { id: 'F2202', month: 'August 2025', amount: 1700, date: '09 Aug 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2508-22' },
      { id: 'F2203', month: 'September 2025', amount: 1700, date: '10 Sep 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2509-22' },
      { id: 'F2204', month: 'October 2025', amount: 1700, date: 'Pending', mode: '-', status: 'Due', receiptNo: '-' }
    ]
  },
  {
    id: 23,
    name: 'Meera Nambiar',
    class: '9th Class',
    phone: '99080 77443',
    school: 'Kendriya Vidyalaya Picket',
    fatherName: 'Gopal Nambiar',
    motherName: 'Radha',
    joiningDate: '15 Jul 2025',
    advanceDate: '15 Jul 2025',
    monthlyFee: 1800,
    status: 'active',
    feeHistory: [
      { id: 'F2301', month: 'July 2025', amount: 1800, date: '15 Jul 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2507-23' },
      { id: 'F2302', month: 'August 2025', amount: 1800, date: '15 Aug 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2508-23' },
      { id: 'F2303', month: 'September 2025', amount: 1800, date: '14 Sep 2025', mode: 'Cash', status: 'Paid', receiptNo: 'REC-2509-23' }
    ]
  },
  {
    id: 24,
    name: 'Tarun Teja',
    class: '10th Class',
    phone: '98499 12345',
    school: 'Delhi Public School Nacharam',
    fatherName: 'Raghavendra',
    motherName: 'Geetha',
    joiningDate: '01 Jun 2025',
    advanceDate: '01 Jun 2025',
    monthlyFee: 2000,
    status: 'active',
    feeHistory: [
      { id: 'F2401', month: 'June 2025', amount: 2000, date: '01 Jun 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2506-24' },
      { id: 'F2402', month: 'July 2025', amount: 2000, date: '03 Jul 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2507-24' },
      { id: 'F2403', month: 'August 2025', amount: 2000, date: '02 Aug 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2508-24' },
      { id: 'F2404', month: 'September 2025', amount: 2000, date: '04 Sep 2025', mode: 'UPI', status: 'Paid', receiptNo: 'REC-2509-24' },
      { id: 'F2405', month: 'October 2025', amount: 2000, date: '02 Oct 2025', mode: 'Cash', status: 'Paid', receiptNo: 'REC-2510-24' }
    ]
  }
];

// Initialize and manage Student Store
class StudentsDataStore {
  constructor() {
    this.students = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
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
    return this.students;
  }

  getById(id) {
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
