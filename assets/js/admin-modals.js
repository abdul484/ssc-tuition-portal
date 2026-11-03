/**
 * SSC Students Study Circle - Admin Modals & Form Dialogs (v4.0)
 * Handles:
 * 1. Unified Add/Edit Student Modal (Zero prompts, strict 10-digit mobile validation, ISO dates)
 * 2. Delete Student Confirmation (Safeguards fee history)
 * 3. Month-Wise Fee Payment Modal (Supports Full Paid, Half/Partial installments, and Balance tracking)
 * 4. Official Printable Tuition Fee Receipt & WhatsApp Dispatch (+91 8919961354)
 * 5. Structured Add/Edit Book Modal
 * 6. Add/Edit Class Modal
 * 7. Review & 1-Click Enrollment Conversion to Active Student
 */

// Global state for active modals
let activeEditStudentId = null;
let activeEditBookId = null;
let activeEditClassId = null;
let activeReviewEnrollmentId = null;
let activePaymentTarget = { studentId: null, year: 2026, month: 1 };

function showGlobalToast(msg, isSuccess = true) {
  if (typeof window.showToast === 'function') {
    window.showToast(msg, isSuccess);
  }
}

// ==========================================================================
// 1. UNIFIED ADD / EDIT STUDENT MODAL (No window.prompt anywhere)
// ==========================================================================
function openAddStudentModal() {
  activeEditStudentId = null;
  const modal = document.getElementById('admin-student-modal');
  const title = document.getElementById('admin-student-modal-title');
  const form = document.getElementById('admin-student-form');
  if (!modal || !form) return;

  title.textContent = 'Add New Student Record';
  form.reset();

  // Set default joining date to today in ISO format YYYY-MM-DD
  const todayISO = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('asm-joining-date');
  if (dateInput) dateInput.value = todayISO;

  const feeInput = document.getElementById('asm-fee');
  if (feeInput) feeInput.value = 1200;

  const advInput = document.getElementById('asm-advance');
  if (advInput) advInput.value = 0;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function openEditStudentModal(id) {
  const student = window.SSCStore ? window.SSCStore.getStudentById(id) : null;
  if (!student) return;

  activeEditStudentId = student.id;
  const modal = document.getElementById('admin-student-modal');
  const title = document.getElementById('admin-student-modal-title');
  if (!modal) return;

  title.textContent = `Edit Student: ${student.name}`;
  document.getElementById('asm-name').value = student.name;
  document.getElementById('asm-class').value = student.class;
  document.getElementById('asm-parent').value = student.parentName || student.fatherName || '';
  document.getElementById('asm-phone').value = student.phone || '';
  document.getElementById('asm-school').value = student.school || '';

  // ISO date preservation (never resets to dd-mm-yyyy)
  let isoDate = student.joiningDate;
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    isoDate = new Date().toISOString().split('T')[0];
  }
  document.getElementById('asm-joining-date').value = isoDate;
  document.getElementById('asm-fee').value = student.monthlyFee || 1200;
  document.getElementById('asm-advance').value = student.advanceAmount || 0;
  document.getElementById('asm-notes').value = student.notes || '';

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeAdminStudentModal() {
  const modal = document.getElementById('admin-student-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

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

  // Strict 10-digit mobile validation: must start with 6, 7, 8, or 9
  const cleanPhone = rawPhone.replace(/\D/g, '');
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    showGlobalToast('Invalid Phone: Please enter a valid 10-digit Indian mobile number (e.g. 9849012345).', false);
    document.getElementById('asm-phone').focus();
    return;
  }

  try {
    if (activeEditStudentId) {
      // Update existing student in central store
      window.SSCStore.updateStudent(activeEditStudentId, {
        name,
        class: studentClass,
        parentName,
        phone: cleanPhone,
        school,
        joiningDate,
        monthlyFee,
        advanceAmount,
        notes
      });
      showGlobalToast(`Student "${name}" updated successfully.`, true);
    } else {
      // Add new student to central store
      window.SSCStore.addStudent({
        name,
        class: studentClass,
        parentName,
        phone: cleanPhone,
        school,
        joiningDate,
        monthlyFee,
        advanceAmount,
        notes
      });
      showGlobalToast(`Student "${name}" enrolled successfully.`, true);
    }
    closeAdminStudentModal();
  } catch (err) {
    showGlobalToast(err.message, false);
  }
}

// ==========================================================================
// 2. DELETE STUDENT CONFIRMATION
// ==========================================================================
function confirmDeleteStudentPrompt(id, name) {
  const student = window.SSCStore ? window.SSCStore.getStudentById(id) : null;
  const feeCount = student?.feeHistory?.length || 0;

  const warningMsg = feeCount > 0
    ? `Move student "${name}" to Recycle Bin?\n\nℹ️ Note: This student has ${feeCount} recorded fee transaction(s). Moving to Recycle Bin safely preserves all student details & fee history so you can restore or permanently delete anytime.`
    : `Move student "${name}" to Recycle Bin?\n\nYou can restore this student or delete permanently anytime from the Recycle Bin.`;

  if (confirm(warningMsg)) {
    window.SSCStore.deleteStudent(id);
    showGlobalToast(`Student "${name}" moved to Recycle Bin.`, true);
  }
}

// ==========================================================================
// 3. MONTH-WISE FEE PAYMENT MODAL (Supports Full & Half/Partial Payments)
// ==========================================================================
function openRecordPaymentModal(preselectedStudentId = null, year = 2026, month = null, customAmount = null) {
  const modal = document.getElementById('admin-payment-modal');
  const studentSelect = document.getElementById('apm-student-select');
  if (!modal || !studentSelect) return;

  const currentYear = year || (window.currentLedgerYear || 2026);
  const currentMonth = month || (window.currentLedgerMonth || (new Date().getMonth() + 1));

  activePaymentTarget = {
    studentId: preselectedStudentId ? Number(preselectedStudentId) : null,
    year: currentYear,
    month: currentMonth
  };

  const students = window.SSCStore ? window.SSCStore.getStudents().filter(s => s.status === 'active') : [];
  studentSelect.innerHTML = students.map(s => `
    <option value="${s.id}" ${activePaymentTarget.studentId === s.id ? 'selected' : ''}>
      ${s.name} (${s.class}) • Monthly: ₹${s.monthlyFee}
    </option>
  `).join('');

  if (!activePaymentTarget.studentId && students.length > 0) {
    activePaymentTarget.studentId = students[0].id;
  }

  // Set Month and Year dropdowns / labels
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[currentMonth - 1];

  const monthInput = document.getElementById('apm-month');
  if (monthInput) monthInput.value = `${monthName} ${currentYear}`;

  const dateInput = document.getElementById('apm-date');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  // Calculate default amount to pay (remaining balance for this month)
  updatePaymentModalDetails(customAmount);

  // Bind change listener on student select to recalculate balance
  studentSelect.onchange = () => {
    activePaymentTarget.studentId = Number(studentSelect.value);
    updatePaymentModalDetails();
  };

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function updatePaymentModalDetails(forceAmount = null) {
  if (!activePaymentTarget.studentId) return;
  const feeData = window.SSCStore.getStudentMonthFee(activePaymentTarget.studentId, activePaymentTarget.year, activePaymentTarget.month);
  const amountInput = document.getElementById('apm-amount');
  const balanceNote = document.getElementById('apm-balance-note');

  if (feeData) {
    const suggested = forceAmount !== null ? forceAmount : (feeData.balance > 0 ? feeData.balance : feeData.monthlyFee);
    if (amountInput) amountInput.value = suggested;
    if (balanceNote) {
      balanceNote.innerHTML = `
        <div class="p-3 bg-[#FAF7F2] rounded-xl border border-[#ECE2D2] text-xs space-y-1 mt-2">
          <div class="flex justify-between"><span>Monthly Fee:</span><strong>₹${feeData.monthlyFee}</strong></div>
          <div class="flex justify-between"><span>Already Paid this Month:</span><strong class="text-emerald-700">₹${feeData.paidAmount}</strong></div>
          <div class="flex justify-between"><span>Remaining Balance:</span><strong class="text-red-700">₹${feeData.balance}</strong></div>
          <div class="flex justify-between"><span>Monthly Due Date:</span><span>${feeData.dueDateDisplay}</span></div>
        </div>
      `;
    }
  } else {
    const student = window.SSCStore.getStudentById(activePaymentTarget.studentId);
    if (amountInput && student) amountInput.value = student.monthlyFee;
    if (balanceNote) balanceNote.innerHTML = '';
  }
}

function closeRecordPaymentModal() {
  const modal = document.getElementById('admin-payment-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleSavePaymentForm(e) {
  e.preventDefault();
  const studentId = Number(document.getElementById('apm-student-select').value);
  const amount = Number(document.getElementById('apm-amount').value);
  const date = document.getElementById('apm-date').value;
  const mode = document.getElementById('apm-mode').value;
  const notes = document.getElementById('apm-notes')?.value || '';

  if (isNaN(amount) || amount <= 0) {
    showGlobalToast('Please enter a valid payment amount.', false);
    return;
  }

  try {
    const result = window.SSCStore.recordFeePayment(
      studentId,
      activePaymentTarget.year,
      activePaymentTarget.month,
      amount,
      date,
      mode,
      notes
    );

    closeRecordPaymentModal();

    const student = window.SSCStore.getStudentById(studentId);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[activePaymentTarget.month - 1];

    showGlobalToast(`Recorded ₹${amount} for ${student.name} (${result.monthStatus.status}). Receipt: ${result.receiptNo}`, true);

    // Offer instant receipt preview
    printReceiptPreview(
      result.receiptNo,
      student.name,
      student.class,
      `${monthName} ${activePaymentTarget.year}`,
      amount,
      date,
      mode,
      student.phone
    );
  } catch (err) {
    showGlobalToast(err.message, false);
  }
}

// ==========================================================================
// 4. PRINTABLE TUITION FEE RECEIPT & WHATSAPP SHARING
// ==========================================================================
function printReceiptPreview(receiptNo, studentName, studentClass, month, amount, date, mode, phone = '') {
  const modal = document.getElementById('admin-receipt-modal');
  const content = document.getElementById('admin-receipt-content');
  if (!modal || !content) return;

  const displayDate = formatISODateDisplay(date);
  const waReceiptUrl = window.SSCStore.getWhatsAppReceiptUrl(receiptNo, studentName, studentClass, month, amount, displayDate, mode, phone);

  content.innerHTML = `
    <div class="border-2 border-brand-dark p-6 rounded-2xl bg-[#FAF7F2] text-brand-dark" id="printable-receipt-card">
      <div class="flex items-center justify-between pb-4 border-b-2 border-brand-dark">
        <div class="flex items-center gap-3">
          <img src="assets/images/ssc_logo.png" class="w-12 h-12 object-contain" alt="SSC Logo">
          <div>
            <h3 class="font-serif font-black text-xl leading-none">SSC Students Study Circle</h3>
            <p class="text-[10px] text-brand-muted tracking-widest uppercase mt-0.5 font-bold">Official Tuition Fee Receipt</p>
          </div>
        </div>
        <div class="text-right">
          <span class="text-xs text-brand-muted block font-mono">Receipt No</span>
          <strong class="font-mono text-sm text-brand-dark">${receiptNo}</strong>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 my-6 text-xs">
        <div><span class="text-brand-muted block">Student Name:</span><strong class="text-sm font-serif">${studentName}</strong></div>
        <div><span class="text-brand-muted block">Class / Grade:</span><strong class="text-sm">${studentClass}</strong></div>
        <div><span class="text-brand-muted block">Tuition Month:</span><strong class="text-sm">${month}</strong></div>
        <div><span class="text-brand-muted block">Date of Payment:</span><strong class="text-sm">${displayDate}</strong></div>
        <div><span class="text-brand-muted block">Payment Mode:</span><strong class="text-sm font-mono">${mode}</strong></div>
        <div><span class="text-brand-muted block">Status:</span><span class="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">VERIFIED PAID</span></div>
      </div>

      <div class="p-4 bg-white rounded-xl border border-[#E8DEC8] flex items-center justify-between my-4">
        <span class="text-xs font-bold uppercase tracking-wider text-brand-muted">Amount Received</span>
        <span class="text-2xl font-serif font-black text-brand-dark">₹${amount}</span>
      </div>

      <div class="mt-6 pt-4 border-t border-[#E8DEC8] flex items-center justify-between text-[11px] text-brand-muted">
        <span>Helpline: +91 8919961354</span>
        <span>Stamp: [ SSC Study Circle Authorized ]</span>
      </div>
    </div>

    <!-- WhatsApp Action Button inside Receipt Modal -->
    <div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      <a href="${waReceiptUrl}" target="_blank" rel="noopener noreferrer" 
         class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm">
        <span>📱 Send Receipt on WhatsApp</span>
      </a>
      <span class="text-[11px] text-brand-muted font-mono">Helpline: +91 8919961354</span>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeReceiptModal() {
  const modal = document.getElementById('admin-receipt-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// ==========================================================================
// 5. STRUCTURED ADD / EDIT BOOK MODAL
// ==========================================================================
function openAddBookModal() {
  activeEditBookId = null;
  const modal = document.getElementById('admin-book-modal');
  const title = document.getElementById('admin-book-modal-title');
  const form = document.getElementById('admin-book-form');
  if (!modal || !form) return;

  title.textContent = 'Add Book / Study Material';
  form.reset();
  document.getElementById('abm-price').value = 250;
  document.getElementById('abm-stock-status').value = 'in_stock';
  document.getElementById('abm-category').value = 'Physical Book';

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function openEditBookModal(id) {
  const book = window.SSCStore ? window.SSCStore.getBookById(id) : null;
  if (!book) return;

  activeEditBookId = id;
  const modal = document.getElementById('admin-book-modal');
  const title = document.getElementById('admin-book-modal-title');
  if (!modal) return;

  title.textContent = `Edit Book: ${book.title}`;
  document.getElementById('abm-title').value = book.title;
  document.getElementById('abm-class').value = book.class;
  document.getElementById('abm-category').value = book.category || 'Physical Book';
  document.getElementById('abm-subject').value = book.subject || '';
  document.getElementById('abm-price').value = book.price || 0;
  document.getElementById('abm-description').value = book.description || '';
  document.getElementById('abm-stock-status').value = book.isAvailable ? 'in_stock' : 'out_of_stock';
  document.getElementById('abm-download').value = book.downloadUrl || '';

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeAdminBookModal() {
  const modal = document.getElementById('admin-book-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleSaveBookForm(e) {
  e.preventDefault();
  const title = document.getElementById('abm-title').value.trim();
  const bookClass = document.getElementById('abm-class').value;
  const category = document.getElementById('abm-category').value;
  const subject = document.getElementById('abm-subject').value.trim();
  const price = Number(document.getElementById('abm-price').value);
  const description = document.getElementById('abm-description').value.trim();
  const isAvailable = document.getElementById('abm-stock-status').value === 'in_stock';
  const downloadUrl = document.getElementById('abm-download').value.trim();
  const isFree = category === 'Study Guide' && price === 0;

  if (activeEditBookId) {
    window.SSCStore.updateBook(activeEditBookId, {
      title,
      class: bookClass,
      category,
      subject,
      price: isFree ? 0 : price,
      description,
      isAvailable,
      isFree,
      downloadUrl: isFree ? downloadUrl : null
    });
    showGlobalToast(`Book "${title}" updated.`, true);
  } else {
    window.SSCStore.addBook({
      title,
      class: bookClass,
      category,
      subject,
      price: isFree ? 0 : price,
      description,
      isAvailable,
      isFree,
      downloadUrl: isFree ? downloadUrl : null
    });
    showGlobalToast(`Book "${title}" added to catalog.`, true);
  }

  closeAdminBookModal();
}

function confirmDeleteBook(id, title) {
  if (confirm(`Are you sure you want to delete book "${title}" from the catalog?`)) {
    window.SSCStore.deleteBook(id);
    showGlobalToast(`Book "${title}" removed.`, false);
  }
}

// ==========================================================================
// 6. ADD / EDIT CLASS MODAL
// ==========================================================================
function openAddClassModal() {
  activeEditClassId = null;
  const modal = document.getElementById('admin-class-modal');
  const title = document.getElementById('admin-class-modal-title');
  const form = document.getElementById('admin-class-form');
  if (!modal || !form) return;

  title.textContent = 'Add Tuition Program / Grade';
  form.reset();
  document.getElementById('acm-timings').value = '5:00 PM – 7:30 PM Regular';
  document.getElementById('acm-fee').value = 1200;
  document.getElementById('acm-capacity').value = 12;
  document.getElementById('acm-active').checked = true;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function openEditClassModal(id) {
  const c = window.SSCStore ? window.SSCStore.getClassById(id) : null;
  if (!c) return;

  activeEditClassId = id;
  const modal = document.getElementById('admin-class-modal');
  const title = document.getElementById('admin-class-modal-title');
  if (!modal) return;

  title.textContent = `Edit Class: ${c.name}`;
  document.getElementById('acm-name').value = c.name;
  document.getElementById('acm-grade').value = c.gradeCode;
  document.getElementById('acm-tag').value = c.tag || 'Academic Program';
  document.getElementById('acm-timings').value = c.batchTimings || '5:00 PM – 7:30 PM Regular';
  document.getElementById('acm-fee').value = c.monthlyFee || 1200;
  document.getElementById('acm-capacity').value = c.maxStudents || 12;
  document.getElementById('acm-subjects').value = c.subjects || '';
  document.getElementById('acm-active').checked = c.isActive !== false;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeAdminClassModal() {
  const modal = document.getElementById('admin-class-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleSaveClassForm(e) {
  e.preventDefault();
  const name = document.getElementById('acm-name').value.trim();
  const gradeCode = document.getElementById('acm-grade').value.trim();
  const tag = document.getElementById('acm-tag').value.trim();
  const batchTimings = document.getElementById('acm-timings').value.trim();
  const monthlyFee = Number(document.getElementById('acm-fee').value);
  const maxStudents = Number(document.getElementById('acm-capacity').value);
  const subjects = document.getElementById('acm-subjects').value.trim();
  const isActive = document.getElementById('acm-active').checked;

  if (isNaN(monthlyFee) || monthlyFee < 100) {
    showGlobalToast('Monthly Tuition Fee must be at least ₹100.', false);
    document.getElementById('acm-fee').focus();
    return;
  }

  if (activeEditClassId) {
    window.SSCStore.updateClass(activeEditClassId, {
      name,
      gradeCode,
      tag,
      batchTimings,
      monthlyFee,
      maxStudents,
      subjects,
      isActive
    });
    showGlobalToast(`Class "${name}" updated.`, true);
  } else {
    window.SSCStore.addClass({
      name,
      gradeCode,
      tag,
      batchTimings,
      monthlyFee,
      maxStudents,
      subjects,
      isActive
    });
    showGlobalToast(`Class "${name}" created.`, true);
  }

  closeAdminClassModal();
}

function confirmDeleteClass(id, name) {
  if (confirm(`Are you sure you want to delete class "${name}"?`)) {
    const res = window.SSCStore.deleteClass(id);
    if (res.success) {
      showGlobalToast(res.message, true);
    } else {
      alert(res.message);
    }
  }
}

// ==========================================================================
// 7. REVIEW ENROLLMENT & 1-CLICK CONVERSION TO STUDENT
// ==========================================================================
function reviewEnrollmentModal(requestId) {
  const enrollments = window.SSCStore ? window.SSCStore.getEnrollments() : [];
  const enr = enrollments.find(e => e.requestId === requestId);
  if (!enr) return;

  activeReviewEnrollmentId = enr.requestId;
  const modal = document.getElementById('admin-enrollment-review-modal');
  const details = document.getElementById('aer-details');
  if (!modal || !details) return;

  details.innerHTML = `
    <div class="space-y-4 text-xs text-brand-dark">
      <div class="p-3 bg-[#FAF7F2] rounded-xl flex items-center justify-between border border-[#EADBCC]">
        <span class="font-mono font-bold">${enr.requestId}</span>
        <span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
          enr.status === 'pending' ? 'bg-amber-100 text-amber-800' :
          enr.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
          enr.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
        }">${enr.status.toUpperCase()}</span>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div><span class="text-brand-muted block">Student Name:</span><strong class="text-sm font-bold">${enr.studentName}</strong></div>
        <div><span class="text-brand-muted block">Requested Class:</span><strong class="text-sm font-bold">${enr.requestedClass}</strong></div>
        <div><span class="text-brand-muted block">Parent Name:</span><strong>${enr.parentName || 'Parent'}</strong></div>
        <div><span class="text-brand-muted block">Phone Number:</span><strong class="font-mono">${enr.phone}</strong></div>
        <div><span class="text-brand-muted block">School:</span><span>${enr.schoolName || '—'}</span></div>
        <div><span class="text-brand-muted block">Board:</span><span>${enr.board || 'State Board'}</span></div>
      </div>

      <div>
        <span class="text-brand-muted block mb-1">Parent Notes:</span>
        <div class="p-3 bg-stone-50 rounded-xl text-brand-muted border border-stone-200">
          ${enr.additionalNotes || 'No specific notes provided.'}
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-brand-dark mb-1">Coordinator Notes</label>
        <textarea id="aer-notes" class="w-full p-2.5 rounded-xl border border-[#DED4C7] bg-[#FAF8F5] text-xs focus:bg-white" rows="2" placeholder="Add contact notes or orientation schedule...">${enr.coordinatorNotes || ''}</textarea>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeEnrollmentReviewModal() {
  const modal = document.getElementById('admin-enrollment-review-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function markEnrollmentContacted() {
  if (!activeReviewEnrollmentId) return;
  const notes = document.getElementById('aer-notes')?.value;
  window.SSCStore.updateEnrollmentStatus(activeReviewEnrollmentId, 'contacted', notes);
  showGlobalToast('Application status updated to Contacted.', true);
  closeEnrollmentReviewModal();
}

function approveEnrollmentAndConvert() {
  if (!activeReviewEnrollmentId) return;
  try {
    const res = window.SSCStore.approveEnrollment(activeReviewEnrollmentId);
    showGlobalToast(`Student "${res.student.name}" approved and added to active directory!`, true);
    closeEnrollmentReviewModal();
    if (window.AdminDashboard) {
      window.AdminDashboard.switchTab('students');
    }
  } catch (err) {
    alert(err.message);
  }
}

function rejectEnrollment() {
  if (!activeReviewEnrollmentId) return;
  if (confirm('Reject this enrollment application?')) {
    const notes = document.getElementById('aer-notes')?.value;
    window.SSCStore.updateEnrollmentStatus(activeReviewEnrollmentId, 'rejected', notes);
    showGlobalToast('Application marked as Rejected.', false);
    closeEnrollmentReviewModal();
  }
}

function deleteEnrollmentToBin() {
  if (!activeReviewEnrollmentId) return;
  if (confirm('Move this enrollment application to Recycle Bin?')) {
    window.SSCStore.deleteEnrollment(activeReviewEnrollmentId);
    showGlobalToast('Enrollment application moved to Recycle Bin.', true);
    closeEnrollmentReviewModal();
    if (window.AdminDashboard) {
      window.AdminDashboard.switchTab('enrollments');
    }
  }
}

// ==========================================================================
// 8. ADD STAFF MODAL
// ==========================================================================
function openRegisterStaffModal() {
  const modal = document.getElementById('admin-staff-modal');
  const form = document.getElementById('admin-staff-form');
  if (!modal || !form) return;
  form.reset();
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeRegisterStaffModal() {
  const modal = document.getElementById('admin-staff-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleSaveStaffForm(e) {
  e.preventDefault();
  const name = document.getElementById('ast-name').value.trim();
  const email = document.getElementById('ast-email').value.trim();
  const phone = document.getElementById('ast-phone').value.trim();
  const role = document.getElementById('ast-role').value;

  try {
    const staff = window.SSCStore.registerStaff(name, email, phone, role);
    // Auto approve if registered by Director inside dashboard
    window.SSCStore.approveStaff(staff.id);
    showGlobalToast(`Staff account for "${name}" registered and activated.`, true);
    closeRegisterStaffModal();
  } catch (err) {
    alert(err.message);
  }
}
