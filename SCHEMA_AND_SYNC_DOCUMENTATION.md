# SSC Students Study Circle — Technical Specification & Architecture Reference

This document provides the complete schema definitions, class counting and filter mechanics, fee ledger synchronization workflow, and Supabase cloud connection configurations for **SSC Students Study Circle**.

---

## 1. Exact Supabase PostgreSQL Table Schemas

Source: `supabase_schema.sql`

### 1.1 Students Table (`public.students`)
```sql
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
```

### 1.2 Tuition Fee & Payment Records Table (`public.fee_records`)
```sql
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
```

### 1.3 Academic Classes & Programs Table (`public.classes`)
```sql
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
```

### 1.4 Student Enrollment Applications Table (`public.enrollment_requests`)
```sql
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
```

### 1.5 Admin Activity Notifications Table (`public.admin_notifications`)
```sql
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'system', -- 'enrollment', 'staff', 'payment', 'system'
    reference_id VARCHAR(100),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### 1.6 Additional Core Tables & Permissions

#### Books Table (`public.books`)
```sql
CREATE TABLE IF NOT EXISTS public.books (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    class VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Physical Book',
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
```

#### Staff Directory (`public.staff_members`)
```sql
CREATE TABLE IF NOT EXISTS public.staff_members (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(50) NOT NULL DEFAULT 'staff',
    status VARCHAR(50) NOT NULL DEFAULT 'approved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

#### Recycle Bin Preservation (`public.recycle_bin`)
```sql
CREATE TABLE IF NOT EXISTS public.recycle_bin (
    bin_id VARCHAR(100) PRIMARY KEY,
    item_type VARCHAR(50) NOT NULL,
    original_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    item_data JSONB NOT NULL,
    deleted_by VARCHAR(150),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

#### Indexes & RLS Policy
```sql
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_fee_records_student ON public.fee_records(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_records_receipt ON public.fee_records(receipt_no);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_status ON public.enrollment_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.admin_notifications(is_read);

-- Direct client anon-key access
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.books DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycle_bin DISABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
```

---

## 2. Class Count & Filter Logic

### 2.1 Central Class Count Calculation
Located in `assets/js/ssc-store.js` (`getClassStudentCounts()`):

```javascript
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
        // Fallback for variations (e.g., "1st", "1st Grade")
        const matched = Object.keys(counts).find(k => k.toLowerCase() === (s.class || '').toLowerCase());
        if (matched) counts[matched]++;
      }
    });

    return counts;
  }
```

### 2.2 Expected Class String Formats & Status Values
* **Class Names (Strict Format):**
  - `'LKG'`
  - `'UKG'`
  - `'1st Class'`
  - `'2nd Class'`
  - `'3rd Class'`
  - `'4th Class'`
  - `'5th Class'`
  - `'6th Class'`
  - `'7th Class'`
  - `'8th Class'`
  - `'9th Class'`
  - `'10th Class'`
* **Status Flags:**
  - **Continuing / Active:** `s.status === 'active'` (or any value other than `'discontinued'` or `'inactive'`). Counted in class pills and total badge.
  - **Discontinued / Inactive:** `s.status === 'discontinued' || s.status === 'inactive'`. Excluded from active class counter pills, but tracked in dedicated discontinued filters.

### 2.3 Public Students Page Metric Display
Located in `assets/js/app.js` (`updateMetricsDisplay()`):

```javascript
function updateMetricsDisplay() {
  if (!window.SSCStore && !window.StudentsStore) return;
  const store = window.SSCStore || window.StudentsStore;
  const classCounts = store.getClassStudentCounts ? store.getClassStudentCounts() : (store.getMetrics ? store.getMetrics().byClass : {});
  const total = classCounts.Total || (store.getMetrics ? store.getMetrics().total : 0);

  const totalEl = document.getElementById('total-count-badge');
  if (totalEl) totalEl.textContent = total;

  const classBadges = {
    'LKG': document.getElementById('badge-count-lkg'),
    'UKG': document.getElementById('badge-count-ukg'),
    '1st Class': document.getElementById('badge-count-1st'),
    '2nd Class': document.getElementById('badge-count-2nd'),
    '3rd Class': document.getElementById('badge-count-3rd'),
    '4th Class': document.getElementById('badge-count-4th'),
    '5th Class': document.getElementById('badge-count-5th'),
    '6th Class': document.getElementById('badge-count-6th'),
    '7th Class': document.getElementById('badge-count-7th'),
    '8th Class': document.getElementById('badge-count-8th'),
    '9th Class': document.getElementById('badge-count-9th'),
    '10th Class': document.getElementById('badge-count-10th')
  };

  Object.entries(classBadges).forEach(([className, el]) => {
    if (el) el.textContent = classCounts[className] || 0;
  });
}
```

---

## 3. Fee Ledger & Add Student Sync Logic

### 3.1 Flow Overview

```mermaid
flowchart TD
    A[Admin Fills Add Student Form] --> B[handleSaveStudentForm]
    B --> C[window.SSCStore.addStudent]
    C --> D[Generate Student ID & Roll No]
    C --> E{advanceAmount > 0?}
    E -- Yes --> F[Generate REC Receipt & Push to feeHistory]
    E -- No --> G[feeHistory Remains Empty]
    C --> H[Local Store State Updated & Emitted]
    H --> I[window.DatabaseService.syncStudentInsert]
    I --> J[(Supabase: public.students)]
    F --> K[window.DatabaseService.syncFeeInsert]
    K --> L[(Supabase: public.fee_records)]
    H --> M[renderFeesManagementTab / Fee Ledger Updated]
```

### 3.2 Add Student Form Handler
Located in `assets/js/admin-modals.js`:

```javascript
function handleSaveStudentForm(e) {
  e.preventDefault();
  const name = document.getElementById('asm-name').value.trim();
  const studentClass = document.getElementById('asm-class').value;
  const parentName = document.getElementById('asm-parent').value.trim();
  const rawPhone = document.getElementById('asm-phone').value.trim();
  const school = document.getElementById('asm-school').value.trim();
  const joiningDate = document.getElementById('asm-joining-date').value;
  const monthlyFee = Number(document.getElementById('asm-fee').value);
  const advanceAmount = Number(document.getElementById('asm-advance').value || 0);
  const notes = document.getElementById('asm-notes').value.trim();
  const status = document.getElementById('asm-status')?.value || 'active';

  const cleanPhone = rawPhone.replace(/\D/g, '');
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    showGlobalToast('Invalid Phone: Please enter a valid 10-digit Indian mobile number (e.g. 9849012345).', false);
    document.getElementById('asm-phone').focus();
    return;
  }

  try {
    if (activeEditStudentId) {
      window.SSCStore.updateStudent(activeEditStudentId, {
        name, class: studentClass, parentName, phone: cleanPhone,
        school, joiningDate, monthlyFee, advanceAmount, notes, status
      });
      showGlobalToast(`Student "${name}" updated successfully.`, true);
    } else {
      window.SSCStore.addStudent({
        name, class: studentClass, parentName, phone: cleanPhone,
        school, joiningDate, monthlyFee, advanceAmount, notes, status
      });
      showGlobalToast(`Student "${name}" enrolled successfully.`, true);
    }
    closeAdminStudentModal();
  } catch (err) {
    showGlobalToast(err.message, false);
  }
}
```

### 3.3 Core `addStudent()` Logic
Located in `assets/js/ssc-store.js`:

```javascript
  addStudent(studentData) {
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

    this.addNotification(
      'New Student Enrolled',
      `Student "${newStudent.name}" enrolled in ${newStudent.class}. Monthly fee: ₹${newStudent.monthlyFee}.`,
      'student',
      newStudent.id
    );
  }
```

### 3.4 Exact Columns Inserted into Supabase
From `assets/js/db-service.js` (`syncStudentInsert` & `syncFeeInsert`):

#### Columns in `public.students`:
| Column | Value Expression | Type | Example |
| :--- | :--- | :--- | :--- |
| `id` | `newStudent.id` | `BIGINT` | `41` |
| `roll_no` | `newStudent.rollNo` | `VARCHAR(50)` | `'SSC-2026-041'` |
| `name` | `student.name` | `VARCHAR(150)` | `'K. Rahul'` |
| `class` | `student.class` | `VARCHAR(50)` | `'5th Class'` |
| `parent_name`| `student.parentName \|\| 'Parent'` | `VARCHAR(150)` | `'K. Srinivas'` |
| `phone` | `student.phone` | `VARCHAR(30)` | `'9849123456'` |
| `school` | `student.school \|\| ''` | `VARCHAR(200)` | `'Govt High School'` |
| `joining_date`| `student.joiningDate` | `DATE` | `'2026-06-10'` |
| `monthly_fee`| `Number(student.monthlyFee) \|\| 0` | `NUMERIC(10,2)` | `250.00` |
| `advance_amount`| `Number(student.advanceAmount) \|\| 0` | `NUMERIC(10,2)` | `250.00` |
| `advance_date`| `student.advanceDate \|\| joiningDate` | `DATE` | `'2026-06-10'` |
| `status` | `student.status \|\| 'active'` | `VARCHAR(30)` | `'active'` |
| `notes` | `student.notes \|\| ''` | `TEXT` | `'Paid advance cash'` |

#### Columns in `public.fee_records` *(Only when `advanceAmount > 0`)*:
| Column | Value Expression | Type | Example |
| :--- | :--- | :--- | :--- |
| `student_id` | `Number(studentId)` | `BIGINT` | `41` |
| `receipt_no` | `payment.receiptNo` | `VARCHAR(100)` | `'REC-202606-482'` |
| `month` | `payment.year + '-' + pad(month)` | `VARCHAR(50)` | `'2026-06'` |
| `amount` | `Number(payment.amount)` | `NUMERIC(10,2)` | `250.00` |
| `payment_date`| `payment.date` | `VARCHAR(50)` | `'2026-06-10'` |
| `mode` | `payment.mode \|\| 'Cash'` | `VARCHAR(30)` | `'Cash'` |
| `status` | `payment.status \|\| 'Full Paid'` | `VARCHAR(30)` | `'Full Paid'` |
| `notes` | `payment.notes` | `TEXT` | `'Advance tuition fee credited at enrollment'` |

---

## 4. Supabase Connection Config

Source: `assets/js/ssc-store.js` (lines 1–4):

```javascript
var DEFAULT_SUPABASE_URL = window.DEFAULT_SUPABASE_URL || "https://gznjhflxskxggaufsbct.supabase.co";
var DEFAULT_SUPABASE_KEY = window.DEFAULT_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6bmpoZmx4c2t4Z2dhdWZzYmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5MzQwMzgsImV4cCI6MjEwODUxMDAzOH0.KzHXvwOxU4nGW6928M6oN97ielkOoDCyOKB04MREOmA";
window.DEFAULT_SUPABASE_URL = DEFAULT_SUPABASE_URL;
window.DEFAULT_SUPABASE_KEY = DEFAULT_SUPABASE_KEY;
```

Fallback Direct Initialization (`assets/js/ssc-store.js` line 2234):
```javascript
const client = window.supabase.createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY);
```

Also mirrored across:
* `assets/js/supabase-config.js` (`window.SSC_CONFIG.SUPABASE_URL` & `SUPABASE_ANON_KEY`)
* `assets/js/db-service.js` (DatabaseService client singleton)
