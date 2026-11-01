/**
 * SSC Students Study Circle - Database & Cloud Bridge Service (v5.0)
 * 
 * Provides real-time bidirectional synchronization between the Central Reactive Store
 * (window.SSCStore) and the Supabase PostgreSQL Cloud Database across all 8 tables:
 * 1. students
 * 2. fee_records
 * 3. books
 * 4. classes
 * 5. enrollment_requests
 * 6. staff_members
 * 7. admin_notifications
 * 8. recycle_bin
 * 
 * Field names in JavaScript strictly match the exact snake_case PostgreSQL schema columns.
 */

const KEY_CONFIG = 'ssc_supabase_config_v3';

class DatabaseService {
  constructor() {
    this.supabaseClient = null;
    this.isCloudActive = false;
    this.isFetchingCloudData = false;
    this.lastSyncError = null;
    this.init();
  }

  // ==========================================================================
  // 1. INITIALIZATION & CONNECTION CONFIGURATION
  // ==========================================================================
  init() {
    let saved = null;
    try {
      const stored = localStorage.getItem(KEY_CONFIG);
      if (stored) saved = JSON.parse(stored);
    } catch (e) {
      console.warn('DatabaseService: Error reading stored Supabase config:', e);
    }

    // Default to pre-configured hardcoded credentials or saved override
    const supabaseUrl = (saved?.url || window.SSC_CONFIG?.SUPABASE_URL || 'https://gznjhflxskxggaufsbct.supabase.co').trim();
    const supabaseKey = (saved?.key || window.SSC_CONFIG?.SUPABASE_ANON_KEY || '[PASTE_YOUR_ANON_KEY_HERE]').trim();

    if (supabaseUrl && supabaseKey && typeof window.supabase !== 'undefined') {
      try {
        this.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
        
        // Detect if key is placeholder
        if (supabaseKey.includes('[PASTE_') || supabaseKey.length < 20) {
          console.info('⚡ Supabase Client initialized with default project URL:', supabaseUrl);
          console.info('ℹ️ Note: Supabase Anon Key is currently set to placeholder. Replace "[PASTE_YOUR_ANON_KEY_HERE]" with your actual Supabase Anon Key in assets/js/supabase-config.js or in Admin -> Settings to enable remote cloud queries.');
          this.isCloudActive = false;
        } else {
          this.isCloudActive = true;
          console.log('⚡ Connected to Supabase Cloud Database:', supabaseUrl);
          // Automatically fetch latest data from cloud on startup
          this.fetchInitialDataFromCloud().catch(err => {
            console.warn('Initial cloud sync error:', err);
          });
        }
      } catch (err) {
        console.warn('⚠️ Supabase initialization failed:', err);
        this.isCloudActive = false;
      }
    } else {
      console.warn('Supabase client library or credentials not available, operating in centralized reactive local store.');
    }
  }

  isSupabaseConnected() {
    return this.isCloudActive && this.supabaseClient !== null;
  }

  getCloudConfig() {
    try {
      const saved = localStorage.getItem(KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      url: window.SSC_CONFIG?.SUPABASE_URL || 'https://gznjhflxskxggaufsbct.supabase.co',
      key: window.SSC_CONFIG?.SUPABASE_ANON_KEY || '[PASTE_YOUR_ANON_KEY_HERE]'
    };
  }

  async testAndSaveSupabaseConfig(url, key) {
    if (!url || !key) {
      throw new Error('Please provide both Supabase URL and Anon Key.');
    }
    if (typeof window.supabase === 'undefined') {
      throw new Error('Supabase client library (@supabase/supabase-js) not loaded.');
    }

    const cleanUrl = url.trim();
    const cleanKey = key.trim();

    const testClient = window.supabase.createClient(cleanUrl, cleanKey);
    const { error } = await testClient.from('classes').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Supabase connection test failed: ${error.message} (Code: ${error.code})`);
    }

    localStorage.setItem(KEY_CONFIG, JSON.stringify({
      url: cleanUrl,
      key: cleanKey,
      connectedAt: new Date().toISOString()
    }));

    this.supabaseClient = testClient;
    this.isCloudActive = true;

    // Refresh cloud data
    await this.fetchInitialDataFromCloud();

    if (window.SSCStore) {
      window.SSCStore.emit('CONFIG_CHANGED', { connected: true, url: cleanUrl });
    }
    return { success: true, message: 'Supabase connected and cloud data synced successfully!' };
  }

  disconnectSupabase() {
    localStorage.removeItem(KEY_CONFIG);
    this.supabaseClient = null;
    this.isCloudActive = false;
    if (window.SSCStore) {
      window.SSCStore.emit('CONFIG_CHANGED', { connected: false });
    }
  }

  // Toast & Error Reporting Helper
  notifyQueryError(tableName, error, operation = 'query') {
    this.lastSyncError = { tableName, error, timestamp: new Date().toISOString() };
    const errMsg = error?.message || error?.details || 'Database operation failed';
    console.error(`[Supabase Error on ${tableName} (${operation})]:`, error);

    if (typeof window.showToast === 'function') {
      window.showToast(`Supabase ${operation.toUpperCase()} Error (${tableName}): ${errMsg}`, false);
    }
  }

  // ==========================================================================
  // 2. AUTOMATIC INITIAL CLOUD HYDRATION ON PAGE LOAD
  // ==========================================================================
  async fetchInitialDataFromCloud() {
    if (!this.supabaseClient) return false;
    if (this.isFetchingCloudData) return false;

    this.isFetchingCloudData = true;
    try {
      // Query all 8 tables in parallel
      const [
        studentsRes,
        feesRes,
        booksRes,
        classesRes,
        enrollmentsRes,
        staffRes,
        notifsRes,
        binRes
      ] = await Promise.allSettled([
        this.supabaseClient.from('students').select('*').order('id', { ascending: true }),
        this.supabaseClient.from('fee_records').select('*').order('created_at', { ascending: true }),
        this.supabaseClient.from('books').select('*').order('display_order', { ascending: true }),
        this.supabaseClient.from('classes').select('*').order('display_order', { ascending: true }),
        this.supabaseClient.from('enrollment_requests').select('*').order('created_at', { ascending: false }),
        this.supabaseClient.from('staff_members').select('*').order('created_at', { ascending: true }),
        this.supabaseClient.from('admin_notifications').select('*').order('created_at', { ascending: false }),
        this.supabaseClient.from('recycle_bin').select('*').order('deleted_at', { ascending: false })
      ]);

      // Check students query
      if (studentsRes.status === 'rejected' || studentsRes.value.error) {
        const err = studentsRes.reason || studentsRes.value.error;
        this.notifyQueryError('students', err, 'initial fetch');
        this.isFetchingCloudData = false;
        return false;
      }

      const rawStudents = studentsRes.value.data || [];
      const rawFees = (feesRes.status === 'fulfilled' && !feesRes.value.error) ? feesRes.value.data || [] : [];
      const rawBooks = (booksRes.status === 'fulfilled' && !booksRes.value.error) ? booksRes.value.data || [] : [];
      const rawClasses = (classesRes.status === 'fulfilled' && !classesRes.value.error) ? classesRes.value.data || [] : [];
      const rawEnrollments = (enrollmentsRes.status === 'fulfilled' && !enrollmentsRes.value.error) ? enrollmentsRes.value.data || [] : [];
      const rawStaff = (staffRes.status === 'fulfilled' && !staffRes.value.error) ? staffRes.value.data || [] : [];
      const rawNotifs = (notifsRes.status === 'fulfilled' && !notifsRes.value.error) ? notifsRes.value.data || [] : [];
      const rawBin = (binRes.status === 'fulfilled' && !binRes.value.error) ? binRes.value.data || [] : [];

      if (!window.SSCStore) {
        this.isFetchingCloudData = false;
        return true;
      }

      // Map snake_case DB rows into reactive store format
      // 1. Students & their linked Fee Records
      if (rawStudents.length > 0) {
        window.SSCStore.state.students = rawStudents.map(s => {
          const studentFees = rawFees
            .filter(f => Number(f.student_id) === Number(s.id))
            .map(f => {
              const monthParts = (f.month || '').split('-');
              const year = parseInt(monthParts[0]) || new Date().getFullYear();
              const month = parseInt(monthParts[1]) || 1;
              return {
                id: f.id ? `PAY-${f.id}` : `PAY-${Date.now()}`,
                dbId: f.id,
                receiptNo: f.receipt_no,
                year,
                month,
                amount: Number(f.amount) || 0,
                date: f.payment_date,
                mode: f.mode || 'UPI',
                status: f.status || 'Full Paid',
                notes: f.notes || ''
              };
            });

          return {
            id: Number(s.id),
            rollNo: s.roll_no || `SSC-2026-${String(s.id).padStart(3, '0')}`,
            name: s.name,
            class: s.class,
            parentName: s.parent_name,
            phone: s.phone,
            school: s.school || '',
            joiningDate: s.joining_date ? String(s.joining_date).split('T')[0] : '2026-01-01',
            monthlyFee: Number(s.monthly_fee) || 0,
            advanceAmount: Number(s.advance_amount) || 0,
            advanceDate: s.advance_date ? String(s.advance_date).split('T')[0] : null,
            status: s.status || 'active',
            notes: s.notes || '',
            feeHistory: studentFees
          };
        });
      }

      // 2. Books
      if (rawBooks.length > 0) {
        window.SSCStore.state.books = rawBooks.map(b => ({
          id: b.id,
          title: b.title,
          class: b.class,
          category: b.category,
          subject: b.subject,
          description: b.description || '',
          price: Number(b.price) || 0,
          isAvailable: Boolean(b.is_available),
          isFree: Boolean(b.is_free),
          downloadUrl: b.download_url,
          coverImage: b.cover_image,
          badge: b.badge,
          colorScheme: b.color_scheme,
          accentColor: b.accent_color,
          titleColor: b.title_color,
          inclusions: b.inclusions,
          displayOrder: Number(b.display_order) || 0
        }));
      }

      // 3. Classes
      if (rawClasses.length > 0) {
        window.SSCStore.state.classes = rawClasses.map(c => ({
          id: c.id,
          name: c.name,
          gradeCode: c.grade_code,
          tag: c.tag,
          maxStudents: Number(c.max_students) || 12,
          batchTimings: c.batch_timings,
          extendedTimings: c.extended_timings,
          monthlyFee: Number(c.monthly_fee) || 1200,
          subjects: c.subjects,
          highlights: c.highlights,
          isActive: Boolean(c.is_active),
          displayOrder: Number(c.display_order) || 0
        }));
      }

      // 4. Enrollment Requests
      if (rawEnrollments.length > 0) {
        window.SSCStore.state.enrollments = rawEnrollments.map(e => ({
          id: Number(e.id),
          requestId: e.request_id,
          studentName: e.student_name,
          requestedClass: e.requested_class,
          parentName: e.parent_name,
          fatherName: e.father_name,
          motherName: e.mother_name,
          phone: e.phone,
          email: e.email,
          schoolName: e.school_name,
          board: e.board,
          streamSubject: e.stream_subject,
          additionalNotes: e.additional_notes,
          coordinatorNotes: e.coordinator_notes,
          status: e.status,
          isRead: Boolean(e.is_read),
          createdAt: e.created_at
        }));
      }

      // 5. Staff Members
      if (rawStaff.length > 0) {
        window.SSCStore.state.staff = rawStaff.map(s => ({
          id: s.id,
          email: s.email,
          fullName: s.full_name,
          phone: s.phone,
          role: s.role,
          status: s.status,
          createdAt: s.created_at,
          approvedAt: s.approved_at
        }));
      }

      // 6. Admin Notifications
      if (rawNotifs.length > 0) {
        window.SSCStore.state.notifications = rawNotifs.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          referenceId: n.reference_id,
          isRead: Boolean(n.is_read),
          createdAt: n.created_at
        }));
      }

      // 7. Recycle Bin
      if (rawBin.length > 0) {
        window.SSCStore.state.recycleBin = rawBin.map(b => ({
          binId: b.bin_id,
          itemType: b.item_type,
          originalId: b.original_id,
          title: b.title,
          subtitle: b.subtitle,
          itemData: b.item_data,
          deletedBy: b.deleted_by,
          deletedAt: b.deleted_at
        }));
      }

      // Persist to local cache and notify listeners
      window.SSCStore.saveToStorage();
      window.SSCStore.emit('CLOUD_SYNC_COMPLETE', { tablesUpdated: 8 });
      console.log('✅ Successfully hydrated all modules from Supabase PostgreSQL cloud tables.');
      return true;
    } catch (err) {
      console.error('DatabaseService: Cloud sync failed:', err);
      this.notifyQueryError('cloud_sync', err, 'syncInitialData');
      return false;
    } finally {
      this.isFetchingCloudData = false;
    }
  }

  // ==========================================================================
  // 3. TABLE 1: STUDENTS CRUD (Real Supabase Queries + snake_case columns)
  // ==========================================================================
  async syncStudentInsert(student) {
    if (!this.isSupabaseConnected()) return;
    try {
      const payload = {
        name: student.name,
        class: student.class,
        parent_name: student.parentName || student.fatherName || 'Parent',
        phone: student.phone,
        school: student.school || '',
        joining_date: student.joiningDate || new Date().toISOString().split('T')[0],
        monthly_fee: Number(student.monthlyFee) || 0,
        advance_amount: Number(student.advanceAmount) || 0,
        advance_date: student.advanceDate || student.joiningDate || null,
        status: student.status || 'active',
        notes: student.notes || ''
      };
      if (student.rollNo) payload.roll_no = student.rollNo;
      if (student.id && typeof student.id === 'number') payload.id = student.id;

      const { data, error } = await this.supabaseClient.from('students').insert([payload]).select();
      if (error) {
        this.notifyQueryError('students', error, 'insert');
      } else if (data && data[0] && !student.id) {
        student.id = data[0].id;
      }
    } catch (e) {
      this.notifyQueryError('students', e, 'insert');
    }
  }

  async syncStudentUpdate(id, student) {
    if (!this.isSupabaseConnected()) return;
    try {
      const payload = {
        name: student.name,
        class: student.class,
        parent_name: student.parentName || student.fatherName || 'Parent',
        phone: student.phone,
        school: student.school || '',
        joining_date: student.joiningDate,
        monthly_fee: Number(student.monthlyFee) || 0,
        advance_amount: Number(student.advanceAmount) || 0,
        status: student.status || 'active',
        notes: student.notes || '',
        updated_at: new Date().toISOString()
      };
      const { error } = await this.supabaseClient.from('students').update(payload).eq('id', Number(id));
      if (error) this.notifyQueryError('students', error, 'update');
    } catch (e) {
      this.notifyQueryError('students', e, 'update');
    }
  }

  async syncStudentDelete(id) {
    if (!this.isSupabaseConnected()) return;
    try {
      const { error } = await this.supabaseClient.from('students').delete().eq('id', Number(id));
      if (error) this.notifyQueryError('students', error, 'delete');
    } catch (e) {
      this.notifyQueryError('students', e, 'delete');
    }
  }

  // ==========================================================================
  // 4. TABLE 2: FEE RECORDS (Tuition Payments / Ledger)
  // ==========================================================================
  async syncFeeInsert(payment, studentId, monthStatus = 'Full Paid') {
    if (!this.isSupabaseConnected()) return;
    try {
      const monthStr = payment.monthString || `${payment.year}-${String(payment.month).padStart(2, '0')}`;
      const payload = {
        student_id: Number(studentId),
        receipt_no: payment.receiptNo,
        month: monthStr,
        amount: Number(payment.amount),
        payment_date: payment.date || new Date().toISOString().split('T')[0],
        mode: payment.mode || 'UPI',
        status: payment.status || monthStatus || 'Full Paid',
        notes: payment.notes || ''
      };
      const { error } = await this.supabaseClient.from('fee_records').insert([payload]);
      if (error) this.notifyQueryError('fee_records', error, 'insert');
    } catch (e) {
      this.notifyQueryError('fee_records', e, 'insert');
    }
  }

  async syncFeeDelete(receiptNo) {
    if (!this.isSupabaseConnected()) return;
    try {
      const { error } = await this.supabaseClient.from('fee_records').delete().eq('receipt_no', receiptNo);
      if (error) this.notifyQueryError('fee_records', error, 'delete');
    } catch (e) {
      this.notifyQueryError('fee_records', e, 'delete');
    }
  }

  // ==========================================================================
  // 5. TABLE 3: BOOKS CRUD
  // ==========================================================================
  async syncBookInsert(book) {
    if (!this.isSupabaseConnected()) return;
    try {
      const payload = {
        id: book.id,
        title: book.title,
        class: book.class,
        category: book.category || (book.isFree ? 'Study Guide' : 'Physical Book'),
        subject: book.subject || 'All Subjects',
        description: book.description || '',
        price: Number(book.price) || 0,
        is_available: book.isAvailable !== false,
        is_free: Boolean(book.isFree),
        download_url: book.downloadUrl || null,
        cover_image: book.coverImage || null,
        badge: book.badge || (book.isFree ? 'Free Download' : 'SSC Series'),
        color_scheme: book.colorScheme || null,
        accent_color: book.accentColor || null,
        title_color: book.titleColor || null,
        inclusions: book.inclusions || null,
        display_order: Number(book.displayOrder) || 0
      };
      const { error } = await this.supabaseClient.from('books').upsert([payload]);
      if (error) this.notifyQueryError('books', error, 'insert');
    } catch (e) {
      this.notifyQueryError('books', e, 'insert');
    }
  }

  async syncBookUpdate(id, book) {
    if (!this.isSupabaseConnected()) return;
    try {
      const payload = {
        title: book.title,
        class: book.class,
        category: book.category,
        subject: book.subject,
        description: book.description,
        price: Number(book.price) || 0,
        is_available: book.isAvailable !== false,
        is_free: Boolean(book.isFree),
        download_url: book.downloadUrl || null,
        cover_image: book.coverImage || null,
        badge: book.badge || null,
        color_scheme: book.colorScheme || null,
        accent_color: book.accentColor || null,
        title_color: book.titleColor || null,
        inclusions: book.inclusions || null,
        display_order: Number(book.displayOrder) || 0,
        updated_at: new Date().toISOString()
      };
      const { error } = await this.supabaseClient.from('books').update(payload).eq('id', id);
      if (error) this.notifyQueryError('books', error, 'update');
    } catch (e) {
      this.notifyQueryError('books', e, 'update');
    }
  }

  async syncBookDelete(id) {
    if (!this.isSupabaseConnected()) return;
    try {
      const { error } = await this.supabaseClient.from('books').delete().eq('id', id);
      if (error) this.notifyQueryError('books', error, 'delete');
    } catch (e) {
      this.notifyQueryError('books', e, 'delete');
    }
  }

  // ==========================================================================
  // 6. TABLE 4: CLASSES CRUD
  // ==========================================================================
  async syncClassInsert(cls) {
    if (!this.isSupabaseConnected()) return;
    try {
      const payload = {
        id: cls.id,
        name: cls.name,
        grade_code: cls.gradeCode || cls.name,
        tag: cls.tag || '',
        max_students: Number(cls.maxStudents) || 12,
        batch_timings: cls.batchTimings || '5:00 PM – 7:30 PM Regular',
        extended_timings: cls.extendedTimings || 'Until 8:00 PM or 8:30 PM occasionally for communication & activities',
        monthly_fee: Number(cls.monthlyFee) || 1200,
        subjects: cls.subjects || '',
        highlights: cls.highlights || '',
        is_active: cls.isActive !== false,
        display_order: Number(cls.displayOrder) || 0
      };
      const { error } = await this.supabaseClient.from('classes').upsert([payload]);
      if (error) this.notifyQueryError('classes', error, 'insert');
    } catch (e) {
      this.notifyQueryError('classes', e, 'insert');
    }
  }

  async syncClassUpdate(id, cls) {
    if (!this.isSupabaseConnected()) return;
    try {
      const payload = {
        name: cls.name,
        grade_code: cls.gradeCode,
        tag: cls.tag,
        max_students: Number(cls.maxStudents) || 12,
        batch_timings: cls.batchTimings,
        extended_timings: cls.extendedTimings,
        monthly_fee: Number(cls.monthlyFee) || 1200,
        subjects: cls.subjects,
        highlights: cls.highlights,
        is_active: cls.isActive !== false,
        display_order: Number(cls.displayOrder) || 0,
        updated_at: new Date().toISOString()
      };
      const { error } = await this.supabaseClient.from('classes').update(payload).eq('id', id);
      if (error) this.notifyQueryError('classes', error, 'update');
    } catch (e) {
      this.notifyQueryError('classes', e, 'update');
    }
  }

  async syncClassDelete(id) {
    if (!this.isSupabaseConnected()) return;
    try {
      const { error } = await this.supabaseClient.from('classes').delete().eq('id', id);
      if (error) this.notifyQueryError('classes', error, 'delete');
    } catch (e) {
      this.notifyQueryError('classes', e, 'delete');
    }
  }

  // ==========================================================================
  // 7. TABLE 5: ENROLLMENT REQUESTS
  // ==========================================================================
  async syncEnrollmentInsert(enr) {
    if (!this.isSupabaseConnected()) return;
    try {
      const payload = {
        request_id: enr.requestId || `SSC-ENR-${Date.now()}`,
        student_name: enr.studentName,
        requested_class: enr.requestedClass,
        parent_name: enr.parentName || enr.fatherName || 'Parent',
        father_name: enr.fatherName || '',
        mother_name: enr.motherName || '',
        phone: enr.phone,
        email: enr.email || '',
        school_name: enr.schoolName || '',
        board: enr.board || 'State Board',
        stream_subject: enr.streamSubject || '',
        additional_notes: enr.additionalNotes || '',
        coordinator_notes: enr.coordinatorNotes || '',
        status: enr.status || 'pending',
        is_read: Boolean(enr.isRead)
      };
      const { error } = await this.supabaseClient.from('enrollment_requests').insert([payload]);
      if (error) this.notifyQueryError('enrollment_requests', error, 'insert');
    } catch (e) {
      this.notifyQueryError('enrollment_requests', e, 'insert');
    }
  }

  async syncEnrollmentUpdate(requestId, fields) {
    if (!this.isSupabaseConnected()) return;
    try {
      const payload = { updated_at: new Date().toISOString() };
      if (fields.status) payload.status = fields.status;
      if (fields.coordinatorNotes !== undefined) payload.coordinator_notes = fields.coordinatorNotes;
      if (fields.isRead !== undefined) payload.is_read = Boolean(fields.isRead);

      const { error } = await this.supabaseClient.from('enrollment_requests').update(payload).eq('request_id', requestId);
      if (error) this.notifyQueryError('enrollment_requests', error, 'update');
    } catch (e) {
      this.notifyQueryError('enrollment_requests', e, 'update');
    }
  }

  async syncEnrollmentDelete(requestId) {
    if (!this.isSupabaseConnected()) return;
    try {
      const { error } = await this.supabaseClient.from('enrollment_requests').delete().eq('request_id', requestId);
      if (error) this.notifyQueryError('enrollment_requests', error, 'delete');
    } catch (e) {
      this.notifyQueryError('enrollment_requests', e, 'delete');
    }
  }

  // ==========================================================================
  // 8. TABLE 6: STAFF MEMBERS
  // ==========================================================================
  async syncStaffInsert(staff) {
    if (!this.isSupabaseConnected()) return;
    try {
      const payload = {
        id: staff.id,
        email: staff.email,
        full_name: staff.fullName || staff.name,
        phone: staff.phone || '',
        role: staff.role || 'staff',
        status: staff.status || 'approved'
      };
      const { error } = await this.supabaseClient.from('staff_members').upsert([payload]);
      if (error) this.notifyQueryError('staff_members', error, 'insert');
    } catch (e) {
      this.notifyQueryError('staff_members', e, 'insert');
    }
  }

  async syncStaffUpdate(id, fields) {
    if (!this.isSupabaseConnected()) return;
    try {
      const payload = {};
      if (fields.role) payload.role = fields.role;
      if (fields.status) payload.status = fields.status;
      if (fields.approvedAt) payload.approved_at = fields.approvedAt;

      const { error } = await this.supabaseClient.from('staff_members').update(payload).eq('id', id);
      if (error) this.notifyQueryError('staff_members', error, 'update');
    } catch (e) {
      this.notifyQueryError('staff_members', e, 'update');
    }
  }

  async syncStaffDelete(id) {
    if (!this.isSupabaseConnected()) return;
    try {
      const { error } = await this.supabaseClient.from('staff_members').delete().eq('id', id);
      if (error) this.notifyQueryError('staff_members', error, 'delete');
    } catch (e) {
      this.notifyQueryError('staff_members', e, 'delete');
    }
  }

  // ==========================================================================
  // 9. TABLE 7: ADMIN NOTIFICATIONS
  // ==========================================================================
  async syncNotificationInsert(notif) {
    if (!this.isSupabaseConnected()) return;
    try {
      const payload = {
        id: notif.id,
        title: notif.title,
        message: notif.message,
        type: notif.type || 'system',
        reference_id: notif.referenceId ? String(notif.referenceId) : null,
        is_read: Boolean(notif.isRead)
      };
      const { error } = await this.supabaseClient.from('admin_notifications').upsert([payload]);
      if (error) this.notifyQueryError('admin_notifications', error, 'insert');
    } catch (e) {
      this.notifyQueryError('admin_notifications', e, 'insert');
    }
  }

  async syncNotificationUpdate(id, fields) {
    if (!this.isSupabaseConnected()) return;
    try {
      const payload = {};
      if (fields.isRead !== undefined) payload.is_read = Boolean(fields.isRead);
      const { error } = await this.supabaseClient.from('admin_notifications').update(payload).eq('id', id);
      if (error) this.notifyQueryError('admin_notifications', error, 'update');
    } catch (e) {
      this.notifyQueryError('admin_notifications', e, 'update');
    }
  }

  async syncNotificationMarkAllRead() {
    if (!this.isSupabaseConnected()) return;
    try {
      const { error } = await this.supabaseClient.from('admin_notifications').update({ is_read: true }).eq('is_read', false);
      if (error) this.notifyQueryError('admin_notifications', error, 'update');
    } catch (e) {
      this.notifyQueryError('admin_notifications', e, 'update');
    }
  }

  async syncNotificationDelete(id) {
    if (!this.isSupabaseConnected()) return;
    try {
      const { error } = await this.supabaseClient.from('admin_notifications').delete().eq('id', id);
      if (error) this.notifyQueryError('admin_notifications', error, 'delete');
    } catch (e) {
      this.notifyQueryError('admin_notifications', e, 'delete');
    }
  }

  async syncNotificationClearAll() {
    if (!this.isSupabaseConnected()) return;
    try {
      const { error } = await this.supabaseClient.from('admin_notifications').delete().neq('id', '');
      if (error) this.notifyQueryError('admin_notifications', error, 'delete');
    } catch (e) {
      this.notifyQueryError('admin_notifications', e, 'delete');
    }
  }

  async syncNotificationClearRead() {
    if (!this.isSupabaseConnected()) return;
    try {
      const { error } = await this.supabaseClient.from('admin_notifications').delete().eq('is_read', true);
      if (error) this.notifyQueryError('admin_notifications', error, 'delete');
    } catch (e) {
      this.notifyQueryError('admin_notifications', e, 'delete');
    }
  }

  // ==========================================================================
  // 10. TABLE 8: RECYCLE BIN
  // ==========================================================================
  async syncRecycleBinInsert(item) {
    if (!this.isSupabaseConnected()) return;
    try {
      const payload = {
        bin_id: item.binId,
        item_type: item.itemType,
        original_id: String(item.originalId),
        title: item.title,
        subtitle: item.subtitle || '',
        item_data: item.itemData,
        deleted_by: item.deletedBy || 'Director',
        deleted_at: item.deletedAt || new Date().toISOString()
      };
      const { error } = await this.supabaseClient.from('recycle_bin').upsert([payload]);
      if (error) this.notifyQueryError('recycle_bin', error, 'insert');
    } catch (e) {
      this.notifyQueryError('recycle_bin', e, 'insert');
    }
  }

  async syncRecycleBinDelete(binId) {
    if (!this.isSupabaseConnected()) return;
    try {
      const { error } = await this.supabaseClient.from('recycle_bin').delete().eq('bin_id', binId);
      if (error) this.notifyQueryError('recycle_bin', error, 'delete');
    } catch (e) {
      this.notifyQueryError('recycle_bin', e, 'delete');
    }
  }

  async syncRecycleBinEmpty() {
    if (!this.isSupabaseConnected()) return;
    try {
      const { error } = await this.supabaseClient.from('recycle_bin').delete().neq('bin_id', '');
      if (error) this.notifyQueryError('recycle_bin', error, 'delete');
    } catch (e) {
      this.notifyQueryError('recycle_bin', e, 'delete');
    }
  }

  // ==========================================================================
  // 11. PASS-THROUGH CONVENIENCE METHODS PROXIED TO SSCSTORE
  // ==========================================================================
  getStudents() { return window.SSCStore ? window.SSCStore.getStudents() : []; }
  getStudentById(id) { return window.SSCStore ? window.SSCStore.getStudentById(id) : null; }
  addStudent(studentData) { return window.SSCStore ? window.SSCStore.addStudent(studentData) : null; }
  updateStudent(id, fields) { return window.SSCStore ? window.SSCStore.updateStudent(id, fields) : null; }
  deleteStudent(id) { return window.SSCStore ? window.SSCStore.deleteStudent(id) : false; }

  recordFeePayment(studentId, paymentData) {
    const now = new Date();
    const year = paymentData.year || now.getFullYear();
    const month = paymentData.monthNum || (now.getMonth() + 1);
    const result = window.SSCStore.recordFeePayment(
      studentId,
      year,
      month,
      paymentData.amount,
      paymentData.date,
      paymentData.mode,
      paymentData.notes
    );
    return result.payment;
  }

  getBooks() { return window.SSCStore ? window.SSCStore.getBooks() : []; }
  addBook(data) { return window.SSCStore ? window.SSCStore.addBook(data) : null; }
  updateBook(id, fields) { return window.SSCStore ? window.SSCStore.updateBook(id, fields) : null; }
  deleteBook(id) { return window.SSCStore ? window.SSCStore.deleteBook(id) : false; }

  getClasses() { return window.SSCStore ? window.SSCStore.getClasses() : []; }
  addClass(data) { return window.SSCStore ? window.SSCStore.addClass(data) : null; }
  updateClass(id, fields) { return window.SSCStore ? window.SSCStore.updateClass(id, fields) : null; }
  deleteClass(id) { return window.SSCStore ? window.SSCStore.deleteClass(id) : false; }

  getEnrollments() { return window.SSCStore ? window.SSCStore.getEnrollments() : []; }
  submitEnrollment(data) { return window.SSCStore ? window.SSCStore.submitEnrollment(data) : null; }
  approveEnrollment(requestId) { return window.SSCStore ? window.SSCStore.approveEnrollment(requestId) : null; }
  updateEnrollmentStatus(id, newStatus, notes) { return window.SSCStore ? window.SSCStore.updateEnrollmentStatus(id, newStatus, notes) : null; }
  deleteEnrollment(requestId) { return window.SSCStore ? window.SSCStore.deleteEnrollment(requestId) : false; }
  getUnreadEnrollmentsCount() {
    return (window.SSCStore ? window.SSCStore.getEnrollments() : []).filter(e => !e.isRead && e.status === 'pending').length;
  }

  getNotifications() { return window.SSCStore ? window.SSCStore.getNotifications() : []; }
  addNotification(title, message, type = 'system', referenceId = null) {
    return window.SSCStore ? window.SSCStore.addNotification(title, message, type, referenceId) : null;
  }
  markNotificationAsRead(id) { if (window.SSCStore) window.SSCStore.markNotificationAsRead(id); }
  markAllNotificationsAsRead() { if (window.SSCStore) window.SSCStore.markAllNotificationsAsRead(); }
  getUnreadNotificationsCount() { return window.SSCStore ? window.SSCStore.getUnreadNotificationsCount() : 0; }
  deleteNotification(id) { return window.SSCStore ? window.SSCStore.deleteNotification(id) : false; }
  clearAllNotifications() { return window.SSCStore ? window.SSCStore.clearAllNotifications() : false; }
  clearReadNotifications() { return window.SSCStore ? window.SSCStore.clearReadNotifications() : false; }

  getStaff() { return window.SSCStore ? window.SSCStore.getStaff() : []; }
  registerStaff(name, email, phone, role = 'staff') { return window.SSCStore ? window.SSCStore.registerStaff(name, email, phone, role) : null; }
  approveStaff(id) { return window.SSCStore ? window.SSCStore.approveStaff(id) : null; }
  rejectStaff(id) { return window.SSCStore ? window.SSCStore.rejectStaff(id) : null; }
  deleteStaff(id) { return window.SSCStore ? window.SSCStore.deleteStaff(id) : false; }
  updateStaffRole(id, role) { return window.SSCStore ? window.SSCStore.updateStaffRole(id, role) : null; }

  getRecycleBinItems() { return window.SSCStore ? window.SSCStore.getRecycleBinItems() : []; }
  getRecycleBinCount() { return window.SSCStore ? window.SSCStore.getRecycleBinCount() : 0; }
  restoreFromRecycleBin(binId) { return window.SSCStore ? window.SSCStore.restoreFromRecycleBin(binId) : false; }
  permanentDeleteFromRecycleBin(binId) { return window.SSCStore ? window.SSCStore.permanentDeleteFromRecycleBin(binId) : false; }
  emptyRecycleBin() { return window.SSCStore ? window.SSCStore.emptyRecycleBin() : false; }

  exportBackupJSON() {
    return window.SSCStore ? JSON.stringify(window.SSCStore.state, null, 2) : '{}';
  }

  importBackupJSON(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (window.SSCStore) {
        window.SSCStore.saveToStorage(data);
        window.SSCStore.emit('BACKUP_RESTORED');
      }
      return true;
    } catch (e) {
      alert('Invalid backup JSON format: ' + e.message);
      return false;
    }
  }
}

// Global window instance
window.DatabaseService = new DatabaseService();
