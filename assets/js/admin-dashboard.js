/**
 * SSC Students Study Circle - Admin Dashboard Controller (v4.0)
 * Architecture: Centralized Reactive Store (SSCStore) Single Source of Truth
 * 
 * Features:
 * 1. 6 Primary Admin Tabs + Settings (⚙️) Dropdown Menu
 * 2. Real-Time Overview Metrics (Active Students, Pending Enrollments, Revenue, Books)
 * 3. Student Management Workspace with Top Class Count Pills (LKG to 10th Class)
 * 4. Month-Wise Fee Ledger (Jan to Dec Tabs, Auto-derived Due Dates, Partial Payment Accumulation)
 * 5. Structured Books Catalog & Class Management
 * 6. Enrollment Review & 1-Click Conversion to Active Student
 * 7. Staff & Roles, Alerts, and Supabase / Database Cloud Settings
 */

// Global Dashboard State
let currentAdminTab = 'overview';
window.currentLedgerYear = 2026;
window.currentLedgerMonth = new Date().getMonth() + 1; // 1 to 12

let adminStudentSearch = '';
let adminStudentClassFilter = 'all';
let adminEnrollmentFilter = 'all';

function showGlobalToast(msg, isSuccess = true) {
  if (typeof window.showToast === 'function') {
    window.showToast(msg, isSuccess);
  }
}

// ==========================================================================
// INITIALIZATION & REACTIVE BINDINGS
// ==========================================================================
function initAdminDashboard() {
  renderAdminHeader();
  renderAdminTabContent();
  setupAdminTabListeners();
  setupSettingsDropdownListeners();

  // Real-time synchronization with centralized reactive store (SSCStore)
  window.addEventListener('sscDataUpdated', () => {
    renderAdminHeader();
    renderAdminTabContent();
    syncPublicViews();
  });

  window.addEventListener('sscStateChanged', () => {
    renderAdminHeader();
    renderAdminTabContent();
    syncPublicViews();
  });

  window.addEventListener('sscAuthStateChanged', (e) => {
    checkAdminAuthView(e.detail.isLoggedIn);
  });

  checkAdminAuthView(window.AdminAuth && window.AdminAuth.isLoggedIn());
}

function checkAdminAuthView(isLoggedIn) {
  const authContainer = document.getElementById('admin-auth-view');
  const dashboardContainer = document.getElementById('admin-dashboard-view');
  if (!authContainer || !dashboardContainer) return;

  if (isLoggedIn) {
    authContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    renderAdminHeader();
    renderAdminTabContent();
  } else {
    authContainer.classList.remove('hidden');
    dashboardContainer.classList.add('hidden');
  }

  // Update header buttons visibility (Hide on Admin page or when logged in)
  if (typeof window.updateNavbarEnrollButton === 'function') {
    window.updateNavbarEnrollButton(window.location.hash.replace('#', '') || 'home');
  }
}

// ==========================================================================
// NAVIGATION CONTROLLER (6 Primary Tabs + Settings Dropdown)
// ==========================================================================
function switchAdminTab(tabName) {
  currentAdminTab = tabName;
  document.title = 'Admin';

  const isSettingsSubtab = ['staff', 'notifications', 'settings', 'recyclebin'].includes(tabName);

  // Update primary tabs style
  document.querySelectorAll('.admin-nav-tab').forEach(tab => {
    const isTarget = tab.getAttribute('data-tab') === tabName;
    tab.className = isTarget
      ? 'admin-nav-tab px-4 py-2.5 rounded-xl bg-brand-dark text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition shrink-0'
      : 'admin-nav-tab px-4 py-2.5 rounded-xl bg-white/70 hover:bg-white text-brand-dark/80 hover:text-brand-dark font-medium text-xs sm:text-sm flex items-center gap-2 border border-[#E8DEC8] transition shrink-0';
  });

  // Update settings dropdown button style
  const settingsBtn = document.getElementById('admin-settings-btn');
  if (settingsBtn) {
    settingsBtn.className = isSettingsSubtab
      ? 'px-4 py-2.5 rounded-xl bg-brand-dark text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition'
      : 'px-4 py-2.5 rounded-xl bg-white/70 hover:bg-white text-brand-dark/80 hover:text-brand-dark font-medium text-xs sm:text-sm flex items-center gap-2 border border-[#E8DEC8] transition';
  }

  // Close settings menu if open
  const menu = document.getElementById('admin-settings-menu');
  if (menu) menu.classList.add('hidden');

  renderAdminTabContent();
  if (typeof window.updateNavbarEnrollButton === 'function') {
    window.updateNavbarEnrollButton();
  }
}

function setupAdminTabListeners() {
  document.querySelectorAll('.admin-nav-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = tab.getAttribute('data-tab');
      if (tabName) switchAdminTab(tabName);
    });
  });
}

function setupSettingsDropdownListeners() {
  document.addEventListener('click', (e) => {
    const wrapper = document.getElementById('admin-settings-dropdown-wrapper');
    const menu = document.getElementById('admin-settings-menu');
    if (wrapper && menu && !wrapper.contains(e.target)) {
      menu.classList.add('hidden');
    }
  });
}

window.toggleAdminSettingsDropdown = function(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('admin-settings-menu');
  if (menu) menu.classList.toggle('hidden');
};

window.selectAdminSettingsItem = function(tabName) {
  switchAdminTab(tabName);
};

// ==========================================================================
// ADMIN HEADER (User Info, Unread Badges, Supabase Badge)
// ==========================================================================
function renderAdminHeader() {
  const user = window.AdminAuth?.getCurrentUser();
  const userNameEl = document.getElementById('admin-user-name');
  const userRoleEl = document.getElementById('admin-user-role');
  const cloudBadgeEl = document.getElementById('admin-cloud-badge');
  const unreadNotifsBadge = document.getElementById('admin-unread-notifs-badge');
  const settingsBadge = document.getElementById('admin-settings-badge');
  const menuAlertsBadge = document.getElementById('admin-menu-alerts-badge');

  if (userNameEl && user) userNameEl.textContent = user.name;
  if (userRoleEl && user) {
    const isAdmin = user.role === 'admin' || user.role === 'director';
    userRoleEl.textContent = isAdmin ? 'Owner / Director' : 'Faculty / Staff';
    userRoleEl.className = isAdmin
      ? 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300'
      : 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300';
  }

  if (cloudBadgeEl && window.DatabaseService) {
    const isCloud = window.DatabaseService.isSupabaseConnected();
    cloudBadgeEl.innerHTML = isCloud
      ? `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span class="text-emerald-700 font-semibold">Supabase Connected</span>`
      : `<span class="w-2 h-2 rounded-full bg-amber-500"></span><span class="text-amber-800 font-medium">Local Persistent Store</span>`;
  }

  // Unread notifications badge
  if (window.DatabaseService) {
    const count = window.DatabaseService.getUnreadNotificationsCount();
    if (unreadNotifsBadge) {
      unreadNotifsBadge.textContent = count;
      unreadNotifsBadge.className = count > 0
        ? 'px-2 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px] inline-flex items-center'
        : 'hidden';
    }
    if (settingsBadge) {
      settingsBadge.textContent = count;
      settingsBadge.className = count > 0
        ? 'px-1.5 py-0.2 rounded-full bg-red-600 text-white font-bold text-[9px] inline-flex items-center'
        : 'hidden';
    }
    if (menuAlertsBadge) {
      menuAlertsBadge.textContent = count;
      menuAlertsBadge.className = count > 0
        ? 'px-1.5 py-0.2 rounded-full bg-red-600 text-white font-bold text-[9px] inline-flex items-center'
        : 'hidden';
    }
  }

  // Enrollment requests badge
  const enrollmentBadge = document.getElementById('admin-tab-enrollment-badge');
  if (enrollmentBadge && window.SSCStore) {
    const unreadEnrollments = typeof window.SSCStore.getPendingEnrollmentsCount === 'function'
      ? window.SSCStore.getPendingEnrollmentsCount()
      : (window.SSCStore.getEnrollments ? window.SSCStore.getEnrollments().filter(e => e.status === 'pending').length : 0);
    if (unreadEnrollments > 0) {
      enrollmentBadge.textContent = unreadEnrollments;
      enrollmentBadge.classList.remove('hidden');
    } else {
      enrollmentBadge.classList.add('hidden');
    }
  }

  // Recycle Bin badge
  const binCount = window.SSCStore ? (typeof window.SSCStore.getRecycleBinCount === 'function' ? window.SSCStore.getRecycleBinCount() : 0) : 0;
  const headerBinBadge = document.getElementById('admin-recycle-bin-badge');
  const tabBinBadge = document.getElementById('admin-tab-recycle-badge');
  const menuBinBadge = document.getElementById('admin-menu-recycle-badge');

  if (headerBinBadge) {
    headerBinBadge.textContent = binCount;
    headerBinBadge.className = binCount > 0
      ? 'absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-stone-700 text-white font-bold text-[9px] inline-flex items-center'
      : 'hidden';
  }
  if (tabBinBadge) {
    tabBinBadge.textContent = binCount;
    tabBinBadge.className = binCount > 0
      ? 'px-2 py-0.5 rounded-full bg-stone-700 text-white font-bold text-[10px] inline-flex items-center'
      : 'hidden';
  }
  if (menuBinBadge) {
    menuBinBadge.textContent = binCount;
    menuBinBadge.className = binCount > 0
      ? 'px-1.5 py-0.5 rounded-full bg-stone-700 text-white font-bold text-[9px] inline-flex items-center'
      : 'hidden';
  }
}

// ==========================================================================
// MAIN CONTENT RENDER DISPATCHER
// ==========================================================================
function renderAdminTabContent() {
  const container = document.getElementById('admin-tab-content-area');
  if (!container) return;

  switch (currentAdminTab) {
    case 'overview':
      renderOverviewTab(container);
      break;
    case 'students':
      renderStudentsManagementTab(container);
      break;
    case 'fees':
      renderFeesManagementTab(container);
      break;
    case 'books':
      renderBooksManagementTab(container);
      break;
    case 'classes':
      renderClassesManagementTab(container);
      break;
    case 'enrollments':
      renderEnrollmentsTab(container);
      break;
    case 'staff':
      renderStaffManagementTab(container);
      break;
    case 'notifications':
      renderNotificationsTab(container);
      break;
    case 'recyclebin':
      renderRecycleBinTab(container);
      break;
    case 'settings':
      renderSettingsTab(container);
      break;
    default:
      renderOverviewTab(container);
  }
}

// ==========================================================================
// 1. OVERVIEW TAB (Real-Time Reactive Metrics)
// ==========================================================================
function renderOverviewTab(container) {
  const overview = window.SSCStore ? window.SSCStore.getOverviewMetrics() : {
    activeStudents: 0,
    totalCollectedFees: 0,
    pendingEnrollments: 0,
    booksCatalogCount: 0,
    classesCount: 0
  };

  const enrollments = window.SSCStore ? window.SSCStore.getEnrollments() : [];

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Welcome Banner -->
      <div class="bg-gradient-to-r from-[#2B1E16] to-[#453022] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div>
          <span class="text-xs uppercase tracking-widest text-[#D4A373] font-semibold">SSC Center Operations</span>
          <h3 class="font-serif text-2xl sm:text-3xl font-bold mt-1">Tuition Management Portal</h3>
          <p class="text-xs sm:text-sm text-[#D8C7B5] mt-1 max-w-xl">
            Real-time management of student enrollment, fee ledger, books catalog, and academic programs for LKG through Class 10.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button onclick="openAddStudentModal()" class="px-4 py-2.5 btn-3d-amber text-brand-dark rounded-xl font-bold text-xs flex items-center gap-1.5">
            <span>+ Add Student</span>
          </button>
          <button onclick="openRecordPaymentModal()" class="px-4 py-2.5 btn-3d-emerald text-white rounded-xl font-semibold text-xs flex items-center gap-1.5">
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="admin-stats-grid" style="display: grid !important; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)) !important; gap: 16px !important; width: 100% !important; margin-bottom: 1.5rem !important;">
        <!-- Students -->
        <div class="admin-stat-card-3d cursor-pointer" onclick="switchAdminTab('students')"
             style="padding: 22px 26px !important; box-sizing: border-box !important; min-height: 125px !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; gap: 8px !important; background: #ffffff !important; border-radius: 18px !important; border: 1.5px solid rgba(0,0,0,0.08) !important; border-bottom: 5px solid rgba(0,0,0,0.16) !important; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.08) !important; overflow: visible !important;">
          <div class="admin-stat-header" style="display: flex !important; align-items: center !important; justify-content: space-between !important; width: 100% !important; margin-left: 0 !important; padding-left: 4px !important;">
            <span class="admin-stat-label" style="font-size: 0.72rem !important; font-weight: 700 !important; letter-spacing: 0.06em !important; color: #6B7280 !important; text-transform: uppercase !important; line-height: 1.2 !important;">Active Students</span>
            <div class="admin-stat-icon-3d bg-pink-50 text-pink-700" style="width: 34px !important; height: 34px !important; display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 12px !important; box-shadow: 0 4px 8px rgba(0,0,0,0.08) !important; font-size: 1rem !important;">🎓</div>
          </div>
          <div class="admin-stat-value" style="font-size: 1.85rem !important; font-weight: 800 !important; line-height: 1.1 !important; color: #111827 !important; margin: 2px 0 !important; margin-left: 0 !important; padding-left: 4px !important; letter-spacing: -0.02em !important;">${overview.activeStudents}</div>
          <div class="admin-stat-subtitle text-emerald" style="font-size: 0.75rem !important; font-weight: 500 !important; color: #059669 !important; line-height: 1.35 !important; margin-left: 0 !important; padding-left: 4px !important;">LKG to Class 10 enrolled</div>
        </div>

        <!-- Pending Enrollments -->
        <div class="admin-stat-card-3d cursor-pointer" onclick="switchAdminTab('enrollments')"
             style="padding: 22px 26px !important; box-sizing: border-box !important; min-height: 125px !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; gap: 8px !important; background: #ffffff !important; border-radius: 18px !important; border: 1.5px solid rgba(0,0,0,0.08) !important; border-bottom: 5px solid rgba(0,0,0,0.16) !important; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.08) !important; overflow: visible !important;">
          <div class="admin-stat-header" style="display: flex !important; align-items: center !important; justify-content: space-between !important; width: 100% !important; margin-left: 0 !important; padding-left: 4px !important;">
            <span class="admin-stat-label" style="font-size: 0.72rem !important; font-weight: 700 !important; letter-spacing: 0.06em !important; color: #6B7280 !important; text-transform: uppercase !important; line-height: 1.2 !important;">Pending Enrollments</span>
            <div class="admin-stat-icon-3d bg-amber-50 text-amber-700" style="width: 34px !important; height: 34px !important; display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 12px !important; box-shadow: 0 4px 8px rgba(0,0,0,0.08) !important; font-size: 1rem !important;">📝</div>
          </div>
          <div class="admin-stat-value" style="font-size: 1.85rem !important; font-weight: 800 !important; line-height: 1.1 !important; color: #92400E !important; margin: 2px 0 !important; margin-left: 0 !important; padding-left: 4px !important; letter-spacing: -0.02em !important;">${overview.pendingEnrollments}</div>
          <div class="admin-stat-subtitle text-amber" style="font-size: 0.75rem !important; font-weight: 500 !important; color: #B45309 !important; line-height: 1.35 !important; margin-left: 0 !important; padding-left: 4px !important;">Applications awaiting review</div>
        </div>

        <!-- Revenue Collected -->
        <div class="admin-stat-card-3d cursor-pointer" onclick="switchAdminTab('fees')"
             style="padding: 22px 26px !important; box-sizing: border-box !important; min-height: 125px !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; gap: 8px !important; background: #ffffff !important; border-radius: 18px !important; border: 1.5px solid rgba(0,0,0,0.08) !important; border-bottom: 5px solid rgba(0,0,0,0.16) !important; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.08) !important; overflow: visible !important;">
          <div class="admin-stat-header" style="display: flex !important; align-items: center !important; justify-content: space-between !important; width: 100% !important; margin-left: 0 !important; padding-left: 4px !important;">
            <span class="admin-stat-label" style="font-size: 0.72rem !important; font-weight: 700 !important; letter-spacing: 0.06em !important; color: #6B7280 !important; text-transform: uppercase !important; line-height: 1.2 !important;">Fee Collections</span>
            <div class="admin-stat-icon-3d bg-emerald-50 text-emerald-700" style="width: 34px !important; height: 34px !important; display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 12px !important; box-shadow: 0 4px 8px rgba(0,0,0,0.08) !important; font-size: 1rem !important;">💳</div>
          </div>
          <div class="admin-stat-value" style="font-size: 1.85rem !important; font-weight: 800 !important; line-height: 1.1 !important; color: #047857 !important; margin: 2px 0 !important; margin-left: 0 !important; padding-left: 4px !important; letter-spacing: -0.02em !important;">₹${overview.totalCollectedFees.toLocaleString()}</div>
          <div class="admin-stat-subtitle text-muted" style="font-size: 0.75rem !important; font-weight: 500 !important; color: #6B7280 !important; line-height: 1.35 !important; margin-left: 0 !important; padding-left: 4px !important;">Verified receipts in ledger</div>
        </div>

        <!-- Books Catalog -->
        <div class="admin-stat-card-3d cursor-pointer" onclick="switchAdminTab('books')"
             style="padding: 22px 26px !important; box-sizing: border-box !important; min-height: 125px !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; gap: 8px !important; background: #ffffff !important; border-radius: 18px !important; border: 1.5px solid rgba(0,0,0,0.08) !important; border-bottom: 5px solid rgba(0,0,0,0.16) !important; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.08) !important; overflow: visible !important;">
          <div class="admin-stat-header" style="display: flex !important; align-items: center !important; justify-content: space-between !important; width: 100% !important; margin-left: 0 !important; padding-left: 4px !important;">
            <span class="admin-stat-label" style="font-size: 0.72rem !important; font-weight: 700 !important; letter-spacing: 0.06em !important; color: #6B7280 !important; text-transform: uppercase !important; line-height: 1.2 !important;">Books Catalog</span>
            <div class="admin-stat-icon-3d bg-blue-50 text-blue-700" style="width: 34px !important; height: 34px !important; display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 12px !important; box-shadow: 0 4px 8px rgba(0,0,0,0.08) !important; font-size: 1rem !important;">📚</div>
          </div>
          <div class="admin-stat-value" style="font-size: 1.85rem !important; font-weight: 800 !important; line-height: 1.1 !important; color: #111827 !important; margin: 2px 0 !important; margin-left: 0 !important; padding-left: 4px !important; letter-spacing: -0.02em !important;">${overview.booksCatalogCount}</div>
          <div class="admin-stat-subtitle text-muted" style="font-size: 0.75rem !important; font-weight: 500 !important; color: #6B7280 !important; line-height: 1.35 !important; margin-left: 0 !important; padding-left: 4px !important;">${overview.classesCount} active tuition grades</div>
        </div>
      </div>

      <!-- Recycle Bin Notice (if items exist) -->
      ${overview.recycleBinCount > 0 ? `
        <div class="bg-[#FAF6EE] border border-[#E8DEC8] rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2.5 text-brand-dark">
            <span class="text-base">🗑️</span>
            <span><strong>Recycle Bin:</strong> You have <strong>${overview.recycleBinCount}</strong> deleted item(s) in the trash.</span>
          </div>
          <button onclick="switchAdminTab('recyclebin')" class="px-3.5 py-1.5 rounded-xl bg-brand-dark hover:bg-black text-white font-semibold transition shrink-0">
            Open Recycle Bin →
          </button>
        </div>
      ` : ''}

      <!-- Recent Applications Preview -->
      <div class="bg-white rounded-3xl p-6 border border-[#ECE2D2] shadow-xs">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-[#F4ECE1]">
          <div>
            <h4 class="font-serif font-bold text-lg text-brand-dark">Recent Online Enrollment Applications</h4>
            <p class="text-xs text-brand-muted">Applications submitted via website form</p>
          </div>
          <button onclick="switchAdminTab('enrollments')" class="text-xs font-bold text-brand-dark hover:underline">
            View All (${enrollments.length}) →
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="text-brand-muted uppercase tracking-wider border-b border-[#F0E8DC]">
                <th class="py-2.5 px-3">Req ID</th>
                <th class="py-2.5 px-3">Student Name</th>
                <th class="py-2.5 px-3">Requested Class</th>
                <th class="py-2.5 px-3">Parent & Phone</th>
                <th class="py-2.5 px-3">Status</th>
                <th class="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F7F2EB]">
              ${enrollments.slice(0, 4).map(e => `
                <tr class="hover:bg-[#FAF7F2] transition">
                  <td class="py-3 px-3 font-mono text-[11px] font-semibold text-brand-dark">${e.requestId}</td>
                  <td class="py-3 px-3 font-bold text-brand-dark">${e.studentName}</td>
                  <td class="py-3 px-3"><span class="px-2 py-0.5 rounded-full bg-stone-100 font-semibold">${e.requestedClass}</span></td>
                  <td class="py-3 px-3 text-brand-muted">${e.parentName || 'Parent'} • ${e.phone}</td>
                  <td class="py-3 px-3">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      e.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      e.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                      e.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }">${e.status.toUpperCase()}</span>
                  </td>
                  <td class="py-3 px-3 text-right">
                    <button onclick="reviewEnrollmentModal('${e.requestId}')" class="px-3 py-1 rounded-lg bg-brand-dark hover:bg-black text-white text-[11px] font-semibold transition">
                      Review
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// 2. STUDENTS MANAGEMENT TAB (Real-time Class Pills & CRUD)
// ==========================================================================
function renderStudentsManagementTab(container) {
  const allStudents = window.SSCStore ? window.SSCStore.getStudents() : [];
  const classCounts = window.SSCStore ? window.SSCStore.getClassStudentCounts() : {};

  const filtered = allStudents.filter(s => {
    const matchSearch = !adminStudentSearch ||
      s.name.toLowerCase().includes(adminStudentSearch) ||
      (s.phone && s.phone.includes(adminStudentSearch)) ||
      (s.school && s.school.toLowerCase().includes(adminStudentSearch));
    const matchClass = adminStudentClassFilter === 'all' || s.class === adminStudentClassFilter;
    return matchSearch && matchClass;
  });

  const classList = ['Total', 'LKG', 'UKG', '1st Class', '2nd Class', '3rd Class', '4th Class', '5th Class', '6th Class', '7th Class', '8th Class', '9th Class', '10th Class'];

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Header & Action Row -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="font-serif text-2xl font-bold text-brand-dark">Student Directory & Profiles</h3>
          <p class="text-xs text-brand-muted">Managing ${allStudents.length} registered students from LKG to Class 10.</p>
        </div>
        <button onclick="openAddStudentModal()" class="px-5 py-2.5 rounded-xl bg-brand-dark hover:bg-black text-white text-xs font-bold shadow-sm transition flex items-center gap-2 self-start">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
          <span>Add New Student</span>
        </button>
      </div>

      <!-- Top Class Count Summary Cards (Click to Filter) -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        ${classList.map(cls => {
          const count = classCounts[cls] || 0;
          const isSelected = (cls === 'Total' && adminStudentClassFilter === 'all') || (adminStudentClassFilter === cls);
          return `
            <button onclick="handleAdminStudentClassFilter('${cls === 'Total' ? 'all' : cls}')"
                    class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-brand-dark text-white border-brand-dark shadow-xs'
                        : 'bg-white hover:bg-[#FAF7F2] text-brand-dark border-[#ECE2D2]'
                    }">
              <span>${cls}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isSelected ? 'bg-amber-400 text-brand-dark' : 'bg-stone-100 text-stone-700'}">${count}</span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Filters Bar -->
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-[#ECE2D2] shadow-xs">
        <div class="sm:col-span-8 relative">
          <input type="text" id="admin-student-search-input" value="${adminStudentSearch}"
                 placeholder="Search student by name, phone number, or school..."
                 class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DED4C7] bg-[#FAF8F5] text-xs text-brand-dark focus:bg-white"
                 oninput="handleAdminStudentSearch(this.value)">
          <svg class="w-4 h-4 text-brand-muted absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
        </div>
        <div class="sm:col-span-4">
          <select class="w-full px-3 py-2.5 rounded-xl border border-[#DED4C7] bg-[#FAF8F5] text-xs text-brand-dark font-medium cursor-pointer"
                  onchange="handleAdminStudentClassFilter(this.value)">
            <option value="all" ${adminStudentClassFilter === 'all' ? 'selected' : ''}>All Classes (LKG - 10th)</option>
            ${['LKG', 'UKG', '1st Class', '2nd Class', '3rd Class', '4th Class', '5th Class', '6th Class', '7th Class', '8th Class', '9th Class', '10th Class'].map(c => `
              <option value="${c}" ${adminStudentClassFilter === c ? 'selected' : ''}>${c}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Students Table -->
      <div class="bg-white rounded-3xl border border-[#ECE2D2] overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-[#FAF6EE] text-brand-muted uppercase tracking-wider border-b border-[#ECE2D2]">
              <tr>
                <th class="py-3 px-4">Roll / ID</th>
                <th class="py-3 px-4">Student Name</th>
                <th class="py-3 px-4">Class</th>
                <th class="py-3 px-4">Parent & Contact</th>
                <th class="py-3 px-4">School</th>
                <th class="py-3 px-4">Joining Date</th>
                <th class="py-3 px-4">Monthly Fee</th>
                <th class="py-3 px-4">Current Month Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F4ECE1]">
              ${filtered.length === 0 ? `
                <tr><td colspan="9" class="text-center py-8 text-brand-muted">No student records found matching filter.</td></tr>
              ` : filtered.map(s => {
                const monthFee = window.SSCStore.getStudentMonthFee(s.id, window.currentLedgerYear, window.currentLedgerMonth);
                const statusBadge = !monthFee ? `<span class="badge-3d-capsule bg-stone-100 text-stone-600 text-[10px]">Upcoming</span>` :
                  monthFee.status === 'Full Paid'
                    ? `<span class="badge-3d-capsule badge-3d-paid text-[10px]">🟢 Full Paid</span>`
                    : monthFee.status === 'Half Paid'
                    ? `<span class="badge-3d-capsule badge-3d-half text-[10px]">🟠 Half Paid (Due: ₹${monthFee.balance})</span>`
                    : `<span class="badge-3d-capsule badge-3d-unpaid text-[10px]">🔴 Pending (₹${monthFee.balance})</span>`;

                return `
                  <tr class="row-float-3d hover:bg-[#FAF7F2] transition">
                    <td class="py-3.5 px-4 font-mono text-[11px] font-bold text-brand-muted">${s.rollNo || 'SSC-' + s.id}</td>
                    <td class="py-3.5 px-4 font-bold text-brand-dark">${s.name}</td>
                    <td class="py-3.5 px-4"><span class="badge-3d-inset text-[10px] font-bold px-2 py-0.5 rounded text-brand-dark">${s.class}</span></td>
                    <td class="py-3.5 px-4 text-brand-dark">${s.parentName || s.fatherName || 'Parent'}<br><span class="text-brand-muted font-mono text-[11px]">${s.phone}</span></td>
                    <td class="py-3.5 px-4 text-brand-muted max-w-[150px] truncate">${s.school || '—'}</td>
                    <td class="py-3.5 px-4 font-mono text-brand-muted">${s.joiningDate || '—'}</td>
                    <td class="py-3.5 px-4 font-semibold text-brand-dark">₹${s.monthlyFee}</td>
                    <td class="py-3.5 px-4">${statusBadge}</td>
                    <td class="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <button onclick="openStudentModal(${s.id})" title="Fee History" class="btn-3d-tactile-sm p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-brand-dark">
                        👁️
                      </button>
                      <button onclick="openEditStudentModal(${s.id})" title="Edit Details" class="btn-3d-tactile-sm p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900">
                        ✏️
                      </button>
                      <button onclick="confirmDeleteStudentPrompt(${s.id}, '${s.name}')" title="Delete Student" class="btn-3d-tactile-sm p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800">
                        🗑️
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function handleAdminStudentSearch(val) {
  adminStudentSearch = val.toLowerCase().trim();
  const container = document.getElementById('admin-tab-content-area');
  if (container) renderStudentsManagementTab(container);
}

function handleAdminStudentClassFilter(val) {
  adminStudentClassFilter = val;
  const container = document.getElementById('admin-tab-content-area');
  if (container) renderStudentsManagementTab(container);
}

// ==========================================================================
// 3. MONTH-WISE FEE LEDGER TAB (Jan to Dec Tabs, Auto Due Dates, Receipts)
// ==========================================================================
function renderFeesManagementTab(container) {
  const year = window.currentLedgerYear || 2026;
  const month = window.currentLedgerMonth || (new Date().getMonth() + 1);

  const monthNames = [
    { num: 1, short: 'Jan', full: 'January' },
    { num: 2, short: 'Feb', full: 'February' },
    { num: 3, short: 'Mar', full: 'March' },
    { num: 4, short: 'Apr', full: 'April' },
    { num: 5, short: 'May', full: 'May' },
    { num: 6, short: 'Jun', full: 'June' },
    { num: 7, short: 'Jul', full: 'July' },
    { num: 8, short: 'Aug', full: 'August' },
    { num: 9, short: 'Sep', full: 'September' },
    { num: 10, short: 'Oct', full: 'October' },
    { num: 11, short: 'Nov', full: 'November' },
    { num: 12, short: 'Dec', full: 'December' }
  ];

  const ledgerData = window.SSCStore ? window.SSCStore.getMonthLedger(year, month) : {
    summary: { totalStudents: 0, expectedFee: 0, collectedFee: 0, pendingFee: 0, fullPaidCount: 0, halfPaidCount: 0, pendingCount: 0 },
    rows: []
  };

  const { summary, rows } = ledgerData;
  const currentMonthName = monthNames[month - 1].full;
  const collectionRate = summary.expectedFee > 0 ? Math.round((summary.collectedFee / summary.expectedFee) * 100) : 0;

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Title & Year Switcher Row -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="font-serif text-2xl font-bold text-brand-dark">Month-Wise Tuition Fee Ledger</h3>
          <p class="text-xs text-brand-muted">Automated due date derivation, partial payment accumulation, and instant WhatsApp receipts.</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Year Selector -->
          <div class="flex items-center gap-1.5 bg-white border border-[#DED4C7] rounded-xl px-3 py-1.5">
            <span class="text-xs font-semibold text-brand-muted">Year:</span>
            <select onchange="changeLedgerYear(this.value)" class="text-xs font-bold text-brand-dark bg-transparent outline-none cursor-pointer">
              <option value="2025" ${year === 2025 ? 'selected' : ''}>2025</option>
              <option value="2026" ${year === 2026 ? 'selected' : ''}>2026</option>
              <option value="2027" ${year === 2027 ? 'selected' : ''}>2027</option>
            </select>
          </div>
          <button onclick="openRecordPaymentModal(null, ${year}, ${month})" class="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5">
            <span>+ Record Fee Payment</span>
          </button>
        </div>
      </div>

      <!-- 12 Month Tabs (Jan to Dec) -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
        ${monthNames.map(m => {
          const isCurrent = m.num === month;
          return `
            <button onclick="changeLedgerMonth(${m.num})"
                    class="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                      isCurrent
                        ? 'bg-brand-dark text-white border-brand-dark shadow-sm'
                        : 'bg-white hover:bg-[#FAF7F2] text-brand-dark border-[#ECE2D2]'
                    }">
              <span>${m.short} ${year}</span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Month Summary Cards Grid -->
      <div class="admin-stats-grid" style="display: grid !important; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)) !important; gap: 16px !important; width: 100% !important; margin-bottom: 1.5rem !important;">
        <div class="admin-stat-card-3d"
             style="padding: 22px 26px !important; box-sizing: border-box !important; min-height: 125px !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; gap: 8px !important; background: #ffffff !important; border-radius: 18px !important; border: 1.5px solid rgba(0,0,0,0.08) !important; border-bottom: 5px solid rgba(0,0,0,0.16) !important; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.08) !important; overflow: visible !important;">
          <div class="admin-stat-header" style="display: flex !important; align-items: center !important; justify-content: space-between !important; width: 100% !important; margin-left: 0 !important; padding-left: 4px !important;">
            <span class="admin-stat-label" style="font-size: 0.72rem !important; font-weight: 700 !important; letter-spacing: 0.06em !important; color: #6B7280 !important; text-transform: uppercase !important; line-height: 1.2 !important;">Expected Fee (${currentMonthName})</span>
            <div class="admin-stat-icon-3d bg-stone-100 text-stone-700" style="width: 34px !important; height: 34px !important; display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 12px !important; box-shadow: 0 4px 8px rgba(0,0,0,0.08) !important; font-size: 1rem !important;">📋</div>
          </div>
          <div class="admin-stat-value" style="font-size: 1.85rem !important; font-weight: 800 !important; line-height: 1.1 !important; color: #111827 !important; margin: 2px 0 !important; margin-left: 0 !important; padding-left: 4px !important; letter-spacing: -0.02em !important;">₹${summary.expectedFee.toLocaleString()}</div>
          <div class="admin-stat-subtitle text-muted" style="font-size: 0.75rem !important; font-weight: 500 !important; color: #6B7280 !important; line-height: 1.35 !important; margin-left: 0 !important; padding-left: 4px !important;">${summary.totalStudents} Active students eligible</div>
        </div>

        <div class="admin-stat-card-3d"
             style="padding: 22px 26px !important; box-sizing: border-box !important; min-height: 125px !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; gap: 8px !important; background: #ffffff !important; border-radius: 18px !important; border: 1.5px solid rgba(0,0,0,0.08) !important; border-bottom: 5px solid rgba(0,0,0,0.16) !important; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.08) !important; overflow: visible !important;">
          <div class="admin-stat-header" style="display: flex !important; align-items: center !important; justify-content: space-between !important; width: 100% !important; margin-left: 0 !important; padding-left: 4px !important;">
            <span class="admin-stat-label" style="font-size: 0.72rem !important; font-weight: 700 !important; letter-spacing: 0.06em !important; color: #047857 !important; text-transform: uppercase !important; line-height: 1.2 !important;">Collected Amount</span>
            <div class="admin-stat-icon-3d bg-emerald-50 text-emerald-700" style="width: 34px !important; height: 34px !important; display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 12px !important; box-shadow: 0 4px 8px rgba(0,0,0,0.08) !important; font-size: 1rem !important;">💳</div>
          </div>
          <div class="admin-stat-value" style="font-size: 1.85rem !important; font-weight: 800 !important; line-height: 1.1 !important; color: #047857 !important; margin: 2px 0 !important; margin-left: 0 !important; padding-left: 4px !important; letter-spacing: -0.02em !important;">₹${summary.collectedFee.toLocaleString()}</div>
          <div class="admin-stat-subtitle text-emerald" style="font-size: 0.75rem !important; font-weight: 500 !important; color: #059669 !important; line-height: 1.35 !important; margin-left: 0 !important; padding-left: 4px !important;">Full: ${summary.fullPaidCount} • Partial: ${summary.halfPaidCount}</div>
        </div>

        <div class="admin-stat-card-3d"
             style="padding: 22px 26px !important; box-sizing: border-box !important; min-height: 125px !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; gap: 8px !important; background: #ffffff !important; border-radius: 18px !important; border: 1.5px solid rgba(0,0,0,0.08) !important; border-bottom: 5px solid rgba(0,0,0,0.16) !important; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.08) !important; overflow: visible !important;">
          <div class="admin-stat-header" style="display: flex !important; align-items: center !important; justify-content: space-between !important; width: 100% !important; margin-left: 0 !important; padding-left: 4px !important;">
            <span class="admin-stat-label" style="font-size: 0.72rem !important; font-weight: 700 !important; letter-spacing: 0.06em !important; color: #B91C1C !important; text-transform: uppercase !important; line-height: 1.2 !important;">Pending Balance</span>
            <div class="admin-stat-icon-3d bg-red-50 text-red-700" style="width: 34px !important; height: 34px !important; display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 12px !important; box-shadow: 0 4px 8px rgba(0,0,0,0.08) !important; font-size: 1rem !important;">⚠️</div>
          </div>
          <div class="admin-stat-value" style="font-size: 1.85rem !important; font-weight: 800 !important; line-height: 1.1 !important; color: #B91C1C !important; margin: 2px 0 !important; margin-left: 0 !important; padding-left: 4px !important; letter-spacing: -0.02em !important;">₹${summary.pendingFee.toLocaleString()}</div>
          <div class="admin-stat-subtitle text-red" style="font-size: 0.75rem !important; font-weight: 500 !important; color: #DC2626 !important; line-height: 1.35 !important; margin-left: 0 !important; padding-left: 4px !important;">Pending: ${summary.pendingCount} students</div>
        </div>

        <div class="admin-stat-card-3d"
             style="padding: 22px 26px !important; box-sizing: border-box !important; min-height: 125px !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; gap: 8px !important; background: #ffffff !important; border-radius: 18px !important; border: 1.5px solid rgba(0,0,0,0.08) !important; border-bottom: 5px solid rgba(0,0,0,0.16) !important; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.08) !important; overflow: visible !important;">
          <div class="admin-stat-header" style="display: flex !important; align-items: center !important; justify-content: space-between !important; width: 100% !important; margin-left: 0 !important; padding-left: 4px !important;">
            <span class="admin-stat-label" style="font-size: 0.72rem !important; font-weight: 700 !important; letter-spacing: 0.06em !important; color: #6B7280 !important; text-transform: uppercase !important; line-height: 1.2 !important;">Collection Progress</span>
            <div class="admin-stat-icon-3d bg-indigo-50 text-indigo-700" style="width: 34px !important; height: 34px !important; display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 12px !important; box-shadow: 0 4px 8px rgba(0,0,0,0.08) !important; font-size: 1rem !important;">📊</div>
          </div>
          <div class="admin-stat-value" style="font-size: 1.85rem !important; font-weight: 800 !important; line-height: 1.1 !important; color: #111827 !important; margin: 2px 0 !important; margin-left: 0 !important; padding-left: 4px !important; letter-spacing: -0.02em !important;">${collectionRate}%</div>
          <div style="margin-left: 0 !important; padding-left: 4px !important;">
            <div class="admin-stat-subtitle text-muted" style="font-size: 0.75rem !important; font-weight: 500 !important; color: #6B7280 !important; line-height: 1.35 !important; margin-bottom: 6px !important;">${collectionRate >= 80 ? 'Excellent collection pace' : 'In progress this cycle'}</div>
            <div class="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div class="bg-emerald-600 h-full rounded-full transition-all" style="width: ${collectionRate}%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Month Ledger Table -->
      <div class="bg-white rounded-3xl border border-[#ECE2D2] overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-[#FAF6EE] text-brand-muted uppercase tracking-wider border-b border-[#ECE2D2]">
              <tr>
                <th class="py-3 px-4">Student Name & Class</th>
                <th class="py-3 px-4">Monthly Fee</th>
                <th class="py-3 px-4">Due Date</th>
                <th class="py-3 px-4">Paid Date</th>
                <th class="py-3 px-4">Paid Amount</th>
                <th class="py-3 px-4">Balance Due</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F4ECE1]">
              ${rows.length === 0 ? `
                <tr><td colspan="8" class="text-center py-8 text-brand-muted">No students enrolled on or before ${currentMonthName} ${year}.</td></tr>
              ` : rows.map(r => {
                const statusBadge = r.status === 'Full Paid'
                  ? `<span class="badge-3d-capsule badge-3d-paid text-[10px]">🟢 Full Paid</span>`
                  : r.status === 'Half Paid'
                  ? `<span class="badge-3d-capsule badge-3d-half text-[10px]">🟠 Half Paid</span>`
                  : `<span class="badge-3d-capsule badge-3d-unpaid text-[10px]">🔴 Pending</span>`;

                const reminderUrl = window.SSCStore.getWhatsAppReminderLink(r.studentId, year, month);
                const studentObj = (window.SSCStore && typeof window.SSCStore.getStudentById === 'function')
                  ? window.SSCStore.getStudentById(r.studentId)
                  : null;
                const studentName = r.name || r.studentName || studentObj?.name || 'Student';
                const studentClass = r.class || r.studentClass || studentObj?.class || 'Tuition Batch';
                const studentDetail = studentObj?.school || studentObj?.roll_no || studentObj?.rollNo || r.school || r.rollNo || 'Regular Batch';

                return `
                  <tr class="row-float-3d hover:bg-[#FAF7F2] transition">
                    <td class="py-3.5 px-4 font-bold text-brand-dark">
                      ${studentName}
                      <span class="block text-[11px] font-normal text-brand-muted">${studentClass} • ${studentDetail}</span>
                    </td>
                    <td class="py-3.5 px-4 font-semibold text-brand-dark">₹${r.monthlyFee}</td>
                    <td class="py-3.5 px-4 font-mono text-brand-dark">${r.dueDate}</td>
                    <td class="py-3.5 px-4 font-mono text-brand-muted">${r.paidDate || '—'}</td>
                    <td class="py-3.5 px-4 font-bold text-emerald-700">₹${r.paidAmount}</td>
                    <td class="py-3.5 px-4 font-bold ${r.balance > 0 ? 'text-red-700' : 'text-stone-400'}">₹${r.balance}</td>
                    <td class="py-3.5 px-4">${statusBadge}</td>
                    <td class="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      ${r.balance > 0 ? `
                        <button onclick="openRecordPaymentModal(${r.studentId}, ${year}, ${month}, ${r.balance})"
                                class="btn-3d-tactile-sm px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold" title="Pay balance">
                          Pay Balance
                        </button>
                        <a href="${reminderUrl}" target="_blank"
                           class="btn-3d-tactile-sm inline-block px-2.5 py-1 rounded-lg bg-green-50 hover:bg-green-100 text-green-800 text-[11px] font-semibold" title="Send WhatsApp Reminder">
                          WhatsApp
                        </a>
                      ` : `
                        <span class="text-xs text-emerald-700 font-semibold mr-1">✓ Cleared</span>
                      `}
                      ${r.paidAmount > 0 ? `
                        <button onclick="viewLatestReceiptForMonth(${r.studentId}, ${year}, ${month})"
                                class="btn-3d-tactile-sm px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-brand-dark text-[11px] font-medium" title="View Receipt">
                          Receipt
                        </button>
                      ` : ''}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

window.changeLedgerYear = function(newYear) {
  window.currentLedgerYear = Number(newYear);
  const container = document.getElementById('admin-tab-content-area');
  if (container) renderFeesManagementTab(container);
};

window.changeLedgerMonth = function(newMonth) {
  window.currentLedgerMonth = Number(newMonth);
  const container = document.getElementById('admin-tab-content-area');
  if (container) renderFeesManagementTab(container);
};

window.viewLatestReceiptForMonth = function(studentId, year, month) {
  const feeData = window.SSCStore.getStudentMonthFee(studentId, year, month);
  if (!feeData || feeData.transactions.length === 0) {
    showGlobalToast('No recorded payments found for this month.', false);
    return;
  }
  const lastTx = feeData.transactions[feeData.transactions.length - 1];
  const student = window.SSCStore.getStudentById(studentId);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthStr = `${monthNames[month - 1]} ${year}`;

  printReceiptPreview(
    lastTx.receiptNo || 'REC-' + lastTx.id,
    student.name,
    student.class,
    monthStr,
    lastTx.amount,
    lastTx.date,
    lastTx.mode,
    student.phone
  );
};

// ==========================================================================
// 4. BOOKS MANAGEMENT TAB (Structured Add/Edit, Price & Stock Status)
// ==========================================================================
function renderBooksManagementTab(container) {
  const books = window.SSCStore ? window.SSCStore.getBooks() : [];

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="font-serif text-2xl font-bold text-brand-dark">Books & Study Materials Catalog</h3>
          <p class="text-xs text-brand-muted">Structured curriculum books, workbooks, practice papers, and syllabus materials.</p>
        </div>
        <button onclick="openAddBookModal()" class="px-5 py-2.5 rounded-xl bg-brand-dark hover:bg-black text-white text-xs font-bold shadow-sm transition flex items-center gap-2 self-start">
          <span>+ Add Book / Material</span>
        </button>
      </div>

      <!-- Books Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${books.map(b => `
          <div class="bg-white rounded-3xl p-5 border border-[#ECE2D2] shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${b.isFree ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}">
                  ${b.category || (b.isFree ? 'FREE MATERIAL' : 'PHYSICAL BOOK')}
                </span>
                <span class="text-xs font-semibold ${b.isAvailable ? 'text-emerald-600' : 'text-red-500'}">
                  ${b.isAvailable ? '● In Stock' : '○ Out of Stock'}
                </span>
              </div>
              <h4 class="font-serif font-bold text-lg text-brand-dark mb-1">${b.title}</h4>
              <p class="text-xs text-[#9C795C] font-semibold mb-2">${b.class} • ${b.subject || 'Comprehensive'}</p>
              <p class="text-xs text-brand-muted leading-relaxed line-clamp-2 mb-4">${b.description}</p>
              
              <div class="p-3 bg-[#FAF7F2] rounded-xl flex items-center justify-between mb-4">
                <span class="text-xs text-brand-muted font-medium">Selling Price</span>
                <span class="text-base font-bold text-brand-dark">${b.isFree ? 'Free Download' : '₹' + b.price}</span>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-[#F4ECE1]">
              <button onclick="openEditBookModal('${b.id}')" class="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition">
                Edit Details
              </button>
              <button onclick="confirmDeleteBook('${b.id}', '${b.title}')" class="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 text-xs font-semibold transition">
                Delete
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function confirmDeleteBook(id, title) {
  if (confirm(`Move book "${title}" to Recycle Bin?\n\nYou can restore it or permanently delete it anytime from the Recycle Bin.`)) {
    window.SSCStore.deleteBook(id);
    showGlobalToast(`Book "${title}" moved to Recycle Bin.`, true);
  }
}

// ==========================================================================
// 5. CLASSES MANAGEMENT TAB (Safeguard Against Deletion with Enrolled Students)
// ==========================================================================
function renderClassesManagementTab(container) {
  const classes = window.SSCStore ? window.SSCStore.getClasses() : [];
  const classCounts = window.SSCStore ? window.SSCStore.getClassStudentCounts() : {};

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="font-serif text-2xl font-bold text-brand-dark">Tuition Programs & Batch Schedules</h3>
          <p class="text-xs text-brand-muted">Academic curriculum programs from LKG to Class 10 (5:00 PM – 7:30 PM).</p>
        </div>
        <button onclick="openAddClassModal()" class="px-5 py-2.5 rounded-xl bg-brand-dark hover:bg-black text-white text-xs font-bold shadow-sm transition flex items-center gap-2 self-start">
          <span>+ Add Class / Grade</span>
        </button>
      </div>

      <!-- Classes Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${classes.map(c => {
          const enrolledCount = classCounts[c.name] || classCounts[c.gradeCode] || 0;
          return `
            <div class="bg-white rounded-3xl p-6 border border-[#ECE2D2] shadow-xs flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">${c.tag || 'Academic Program'}</span>
                  <span class="text-xs font-bold ${c.isActive ? 'text-emerald-700' : 'text-stone-400'}">
                    ${c.isActive ? '✓ Active' : '✕ Inactive'}
                  </span>
                </div>
                <h4 class="font-serif font-bold text-xl text-brand-dark mb-1">${c.name}</h4>
                <p class="text-xs text-brand-muted mb-4 font-mono">${c.batchTimings || '5:00 PM – 7:30 PM'}</p>
                
                <div class="space-y-2 text-xs text-brand-muted mb-5 bg-[#FAF7F2] p-3 rounded-xl border border-[#F0EBE1]">
                  <div class="flex justify-between"><span>Monthly Fee:</span> <strong class="text-brand-dark">₹${c.monthlyFee}</strong></div>
                  <div class="flex justify-between"><span>Enrolled Students:</span> <strong class="text-brand-dark">${enrolledCount} / ${c.maxStudents}</strong></div>
                  <div class="pt-1 text-[11px] leading-snug"><strong>Subjects:</strong> ${c.subjects || 'All syllabus subjects'}</div>
                </div>
              </div>

              <div class="flex items-center justify-end gap-2 pt-2 border-t border-[#F4ECE1]">
                <button onclick="openEditClassModal('${c.id}')" class="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition">
                  Edit Details
                </button>
                <button onclick="confirmDeleteClassPrompt('${c.id}', '${c.name}', ${enrolledCount})" class="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 text-xs font-semibold transition">
                  Delete
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function confirmDeleteClassPrompt(id, name, enrolledCount) {
  if (enrolledCount > 0) {
    alert(`Cannot delete "${name}"!\n\nThere are currently ${enrolledCount} student(s) actively enrolled in this class. Please reassign or remove them first.`);
    return;
  }
  if (confirm(`Move class program "${name}" to Recycle Bin?\n\nYou can restore it anytime from the Recycle Bin.`)) {
    try {
      window.SSCStore.deleteClass(id);
      showGlobalToast(`Class "${name}" moved to Recycle Bin.`, true);
    } catch (err) {
      alert(err.message);
    }
  }
}

// ==========================================================================
// 6. ENROLLMENT REQUESTS TAB (1-Click Convert to Active Student)
// ==========================================================================
function renderEnrollmentsTab(container) {
  const all = window.SSCStore ? window.SSCStore.getEnrollments() : [];
  const filtered = adminEnrollmentFilter === 'all' ? all : all.filter(e => e.status === adminEnrollmentFilter);

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="font-serif text-2xl font-bold text-brand-dark">Student Enrollment Applications</h3>
          <p class="text-xs text-brand-muted">Applications submitted via website form. Review and approve directly into student directory.</p>
        </div>
        <div class="flex items-center gap-2">
          ${['all', 'pending', 'contacted', 'approved', 'rejected'].map(st => `
            <button onclick="filterEnrollments('${st}')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
              adminEnrollmentFilter === st ? 'bg-brand-dark text-white' : 'bg-white border border-[#ECE2D2] text-brand-muted hover:text-brand-dark'
            }">${st}</button>
          `).join('')}
        </div>
      </div>

      <!-- Requests Table -->
      <div class="bg-white rounded-3xl border border-[#ECE2D2] overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-[#FAF6EE] text-brand-muted uppercase tracking-wider border-b border-[#ECE2D2]">
              <tr>
                <th class="py-3 px-4">Request ID</th>
                <th class="py-3 px-4">Student</th>
                <th class="py-3 px-4">Grade</th>
                <th class="py-3 px-4">Parent Details</th>
                <th class="py-3 px-4">School & Board</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F4ECE1]">
              ${filtered.length === 0 ? `
                <tr><td colspan="7" class="text-center py-8 text-brand-muted">No applications found in this category.</td></tr>
              ` : filtered.map(e => `
                <tr class="row-float-3d hover:bg-[#FAF7F2] transition">
                  <td class="py-3 px-4 font-mono font-bold text-[11px] text-brand-dark">${e.requestId}</td>
                  <td class="py-3 px-4 font-bold text-brand-dark">${e.studentName}</td>
                  <td class="py-3 px-4"><span class="badge-3d-inset text-[10px] font-bold px-2 py-0.5 rounded text-brand-dark">${e.requestedClass}</span></td>
                  <td class="py-3 px-4 text-brand-dark">${e.parentName || 'Parent'}<br><span class="text-brand-muted font-mono text-[11px]">${e.phone}</span></td>
                  <td class="py-3 px-4 text-brand-muted">${e.schoolName || '—'}<br><span class="text-[10px] font-semibold">${e.board || 'State Board'}</span></td>
                  <td class="py-3 px-4">
                    <span class="badge-3d-capsule text-[10px] ${
                      e.status === 'pending' ? 'badge-3d-half' :
                      e.status === 'contacted' ? 'bg-blue-100 text-blue-900 border-b-2 border-blue-300' :
                      e.status === 'approved' ? 'badge-3d-paid' : 'badge-3d-unpaid'
                    }">${e.status.toUpperCase()}</span>
                  </td>
                  <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                    <button onclick="reviewEnrollmentModal('${e.requestId}')" class="btn-3d-tactile-sm px-2.5 py-1 rounded bg-brand-dark hover:bg-black text-white text-[11px] font-semibold">
                      Review / Action
                    </button>
                    <button onclick="handleDeleteEnrollmentPrompt('${e.requestId}', '${encodeURIComponent(e.studentName)}')" title="Move to Recycle Bin" class="btn-3d-tactile-sm p-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-[11px] font-semibold">
                      🗑️
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function filterEnrollments(status) {
  adminEnrollmentFilter = status;
  const container = document.getElementById('admin-tab-content-area');
  if (container) renderEnrollmentsTab(container);
}

function handleDeleteEnrollmentPrompt(requestId, encodedName) {
  const studentName = decodeURIComponent(encodedName);
  if (confirm(`Move enrollment application for "${studentName}" (${requestId}) to Recycle Bin?`)) {
    window.DatabaseService.deleteEnrollment(requestId);
    showGlobalToast(`Application for "${studentName}" moved to Recycle Bin.`, true);
    const container = document.getElementById('admin-tab-content-area');
    if (container) renderEnrollmentsTab(container);
    renderAdminHeader();
  }
}

// ==========================================================================
// 7. STAFF MANAGEMENT TAB (Settings Dropdown Item)
// ==========================================================================
function renderStaffManagementTab(container) {
  const staff = window.SSCStore ? window.SSCStore.getStaff() : [];

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="font-serif text-2xl font-bold text-brand-dark">Staff Directory & Permissions</h3>
          <p class="text-xs text-brand-muted">Only approved staff accounts have administrative access to student records and fee data.</p>
        </div>
        <button onclick="openRegisterStaffModal()" class="px-5 py-2.5 rounded-xl bg-brand-dark hover:bg-black text-white text-xs font-bold shadow-sm transition">
          + Add Staff Account
        </button>
      </div>

      <!-- Staff List Table -->
      <div class="bg-white rounded-3xl border border-[#ECE2D2] overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-[#FAF6EE] text-brand-muted uppercase tracking-wider border-b border-[#ECE2D2]">
              <tr>
                <th class="py-3 px-4">Staff Name</th>
                <th class="py-3 px-4">Email</th>
                <th class="py-3 px-4">Phone</th>
                <th class="py-3 px-4">Role</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F4ECE1]">
              ${staff.map(s => {
                const isPrimaryAdmin = s.email === 'admin@sscstudycircle.com' || s.id === 'stf-001';
                return `
                  <tr class="hover:bg-[#FAF7F2] transition">
                    <td class="py-3 px-4 font-bold text-brand-dark">${s.fullName}</td>
                    <td class="py-3 px-4 text-brand-muted font-mono">${s.email}</td>
                    <td class="py-3 px-4 text-brand-muted font-mono">${s.phone || '—'}</td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${s.role === 'admin' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900'}">
                        ${s.role === 'admin' ? 'Owner / Director' : 'Staff / Faculty'}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        s.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }">
                        ${s.status.toUpperCase()}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      ${s.status === 'pending' ? `
                        <button onclick="handleApproveStaff('${s.id}')" class="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold transition">
                          ✓ Approve
                        </button>
                        <button onclick="handleRejectStaff('${s.id}')" class="px-2.5 py-1 rounded bg-red-100 hover:bg-red-200 text-red-800 text-[11px] font-semibold transition">
                          ✕ Reject
                        </button>
                      ` : !isPrimaryAdmin ? `
                        <button onclick="toggleStaffRole('${s.id}', '${s.role === 'staff' ? 'admin' : 'staff'}')" class="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-brand-dark text-[11px] font-medium transition">
                          ${s.role === 'staff' ? 'Make Admin' : 'Demote'}
                        </button>
                        <button onclick="handleDeleteStaffPrompt('${s.id}', '${encodeURIComponent(s.fullName)}')" title="Move to Recycle Bin" class="p-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-[11px] font-semibold transition">
                          🗑️
                        </button>
                      ` : `
                        <span class="text-brand-muted text-[11px]">Primary Director</span>
                      `}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function handleApproveStaff(id) {
  if (confirm('Approve this staff member to grant administrative access to SSC Portal?')) {
    window.DatabaseService.approveStaff(id);
    showGlobalToast('Staff account approved.', true);
  }
}

function handleRejectStaff(id) {
  if (confirm('Reject this staff registration request?')) {
    window.DatabaseService.rejectStaff(id);
    showGlobalToast('Staff account rejected.', false);
  }
}

function handleDeleteStaffPrompt(id, encodedName) {
  const fullName = decodeURIComponent(encodedName);
  if (confirm(`Move staff member "${fullName}" to Recycle Bin?`)) {
    const res = window.DatabaseService.deleteStaff(id);
    if (res.success) {
      showGlobalToast(`Staff account "${fullName}" moved to Recycle Bin.`, true);
      const container = document.getElementById('admin-tab-content-area');
      if (container) renderStaffManagementTab(container);
      renderAdminHeader();
    } else {
      showGlobalToast(res.message, false);
    }
  }
}

function toggleStaffRole(id, newRole) {
  window.DatabaseService.updateStaffRole(id, newRole);
  showGlobalToast(`Staff role updated to ${newRole}.`, true);
}

// ==========================================================================
// 8. NOTIFICATIONS TAB (Settings Dropdown Item)
// ==========================================================================
function renderNotificationsTab(container) {
  const notifs = window.DatabaseService ? window.DatabaseService.getNotifications() : [];

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="font-serif text-2xl font-bold text-brand-dark">Admin Notification Center</h3>
          <p class="text-xs text-brand-muted">Automated activity alerts, enrollments, and payment receipts.</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          ${notifs.length > 0 ? `
            <button onclick="handleClearAllNotifications()" class="px-3.5 py-2 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs">
              <span>🗑️ Clear All</span>
            </button>
            <button onclick="handleClearReadNotifications()" class="px-3.5 py-2 rounded-xl border border-[#ECE2D2] bg-white hover:bg-stone-50 text-brand-dark text-xs font-semibold transition">
              Clear Read
            </button>
            <button onclick="markAllNotifsRead()" class="px-4 py-2 rounded-xl bg-brand-dark hover:bg-black text-white text-xs font-semibold transition">
              Mark All Read
            </button>
          ` : ''}
        </div>
      </div>

      <div class="space-y-3">
        ${notifs.length === 0 ? `
          <div class="bg-white p-12 rounded-3xl text-center text-brand-muted border border-[#ECE2D2] shadow-xs">
            <div class="w-12 h-12 rounded-2xl bg-[#FAF6EE] text-brand-muted flex items-center justify-center text-2xl mx-auto mb-2">
              🔔
            </div>
            <p class="font-bold text-brand-dark text-sm">No notifications available</p>
            <p class="text-xs text-brand-muted mt-0.5">You're all caught up! New student signups and fee payments will appear here.</p>
          </div>
        ` : notifs.map(n => `
          <div class="bg-white rounded-2xl p-4 border ${n.isRead ? 'border-[#ECE2D2] opacity-80' : 'border-amber-300 bg-amber-50/30'} flex items-start justify-between gap-4 transition shadow-xs">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg ${
                n.type === 'enrollment' ? 'bg-amber-100 text-amber-800' :
                n.type === 'payment' ? 'bg-emerald-100 text-emerald-800' :
                n.type === 'staff' ? 'bg-purple-100 text-purple-800' : 'bg-stone-100 text-brand-dark'
              } flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                ${n.type === 'enrollment' ? '📝' : n.type === 'payment' ? '💳' : n.type === 'staff' ? '👥' : '🔔'}
              </div>
              <div>
                <h5 class="text-xs font-bold text-brand-dark">${n.title}</h5>
                <p class="text-xs text-brand-muted mt-0.5 leading-relaxed">${n.message}</p>
                <span class="text-[10px] text-stone-400 font-mono mt-1 block">${new Date(n.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              ${!n.isRead ? `
                <button onclick="markNotifRead('${n.id}')" class="text-[11px] font-semibold text-brand-dark hover:underline">
                  Mark read
                </button>
              ` : ''}
              <button onclick="handleDeleteSingleNotification('${n.id}')" title="Dismiss / Clear alert" class="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-stone-100 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function markNotifRead(id) {
  window.DatabaseService.markNotificationAsRead(id);
  const container = document.getElementById('admin-tab-content-area');
  if (container) renderNotificationsTab(container);
  renderAdminHeader();
}

function markAllNotifsRead() {
  window.DatabaseService.markAllNotificationsAsRead();
  const container = document.getElementById('admin-tab-content-area');
  if (container) renderNotificationsTab(container);
  renderAdminHeader();
}

function handleDeleteSingleNotification(id) {
  window.DatabaseService.deleteNotification(id);
  showGlobalToast('Notification cleared.');
  const container = document.getElementById('admin-tab-content-area');
  if (container) renderNotificationsTab(container);
  renderAdminHeader();
}

function handleClearAllNotifications() {
  if (confirm('Clear all notifications in the notification center?')) {
    window.DatabaseService.clearAllNotifications();
    showGlobalToast('All notifications cleared.');
    const container = document.getElementById('admin-tab-content-area');
    if (container) renderNotificationsTab(container);
    renderAdminHeader();
  }
}

function handleClearReadNotifications() {
  window.DatabaseService.clearReadNotifications();
  showGlobalToast('Read notifications cleared.');
  const container = document.getElementById('admin-tab-content-area');
  if (container) renderNotificationsTab(container);
  renderAdminHeader();
}

// ==========================================================================
// 9. RECYCLE BIN PORTAL TAB (Universal Restore & Permanent Purge)
// ==========================================================================
let adminRecycleFilter = 'all';

function renderRecycleBinTab(container) {
  const items = window.SSCStore ? window.SSCStore.getRecycleBinItems() : [];

  const counts = {
    all: items.length,
    student: items.filter(i => i.itemType === 'student').length,
    book: items.filter(i => i.itemType === 'book').length,
    class: items.filter(i => i.itemType === 'class').length,
    enrollment: items.filter(i => i.itemType === 'enrollment').length,
    staff: items.filter(i => i.itemType === 'staff').length
  };

  const filtered = adminRecycleFilter === 'all'
    ? items
    : items.filter(i => i.itemType === adminRecycleFilter);

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="font-serif text-2xl font-bold text-brand-dark flex items-center gap-2.5">
            <span>🗑️ Recycle Bin Portal</span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-200 text-stone-800 font-sans">${items.length}</span>
          </h3>
          <p class="text-xs text-brand-muted mt-0.5">
            Deleted records across Students, Books, Classes, Enrollments, and Staff are preserved here. You can restore any item or permanently purge it.
          </p>
        </div>
        ${items.length > 0 ? `
          <button onclick="handleEmptyRecycleBin()" class="px-4 py-2.5 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold transition flex items-center gap-2 shadow-2xs self-start">
            <span>⚠️ Empty Recycle Bin</span>
          </button>
        ` : ''}
      </div>

      <!-- Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        ${[
          { id: 'all', label: 'All Items', icon: '📦' },
          { id: 'student', label: 'Students', icon: '🎓' },
          { id: 'book', label: 'Books', icon: '📚' },
          { id: 'class', label: 'Classes', icon: '🏫' },
          { id: 'enrollment', label: 'Enrollments', icon: '📝' },
          { id: 'staff', label: 'Staff Accounts', icon: '👥' }
        ].map(cat => {
          const isSelected = adminRecycleFilter === cat.id;
          const count = counts[cat.id] || 0;
          return `
            <button onclick="filterRecycleBin('${cat.id}')"
                    class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-brand-dark text-white border-brand-dark shadow-xs'
                        : 'bg-white hover:bg-[#FAF7F2] text-brand-dark border-[#ECE2D2]'
                    }">
              <span>${cat.icon} ${cat.label}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isSelected ? 'bg-amber-400 text-brand-dark' : 'bg-stone-100 text-stone-700'}">${count}</span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Items List -->
      <div class="bg-white rounded-3xl border border-[#ECE2D2] overflow-hidden shadow-xs">
        ${filtered.length === 0 ? `
          <div class="p-12 text-center">
            <div class="w-16 h-16 rounded-3xl bg-[#FAF6EE] text-brand-muted flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
              🗑️
            </div>
            <h4 class="font-serif font-bold text-lg text-brand-dark">Recycle Bin is Empty</h4>
            <p class="text-xs text-brand-muted mt-1 max-w-sm mx-auto">
              ${adminRecycleFilter === 'all'
                ? 'No deleted items found. When you delete any student record, book, class, enrollment, or staff member, it will safely appear here.'
                : `No deleted items in the "${adminRecycleFilter}" category.`}
            </p>
          </div>
        ` : `
          <div class="divide-y divide-[#F4ECE1]">
            ${filtered.map(item => {
              const typeBadge = {
                student: { bg: 'bg-amber-100 text-amber-900 border-amber-300', icon: '🎓', label: 'Student' },
                book: { bg: 'bg-blue-100 text-blue-900 border-blue-300', icon: '📚', label: 'Book' },
                class: { bg: 'bg-purple-100 text-purple-900 border-purple-300', icon: '🏫', label: 'Class' },
                enrollment: { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: '📝', label: 'Enrollment' },
                staff: { bg: 'bg-rose-100 text-rose-900 border-rose-300', icon: '👥', label: 'Staff' }
              }[item.itemType] || { bg: 'bg-stone-100 text-stone-800 border-stone-300', icon: '📄', label: 'Item' };

              const deletedDateStr = item.deletedAt ? new Date(item.deletedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently';

              return `
                <div class="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#FAF7F2] transition">
                  <div class="flex items-start gap-3.5">
                    <div class="w-10 h-10 rounded-2xl bg-[#FAF6EE] border border-[#ECE2D2] flex items-center justify-center text-lg shrink-0 mt-0.5">
                      ${typeBadge.icon}
                    </div>
                    <div>
                      <div class="flex flex-wrap items-center gap-2 mb-1">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeBadge.bg}">
                          ${typeBadge.label}
                        </span>
                        <h4 class="font-bold text-sm text-brand-dark">${item.title}</h4>
                      </div>
                      <p class="text-xs text-brand-muted leading-relaxed">${item.subtitle}</p>
                      <div class="flex flex-wrap items-center gap-3 text-[11px] text-stone-400 mt-1.5 font-mono">
                        <span>🕒 Deleted: ${deletedDateStr}</span>
                        ${item.deletedBy ? `<span>👤 By: ${item.deletedBy}</span>` : ''}
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button onclick="handleRestoreBinItem('${item.binId}', '${encodeURIComponent(item.title)}')"
                            class="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5">
                      <span>↩️ Restore</span>
                    </button>
                    <button onclick="handlePermanentDeleteBinItem('${item.binId}', '${encodeURIComponent(item.title)}')"
                            class="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-xs font-semibold transition flex items-center gap-1.5">
                      <span>🗑️ Delete Forever</span>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

function filterRecycleBin(category) {
  adminRecycleFilter = category;
  const container = document.getElementById('admin-tab-content-area');
  if (container) renderRecycleBinTab(container);
}

function handleRestoreBinItem(binId, encodedTitle) {
  const title = decodeURIComponent(encodedTitle);
  const result = window.SSCStore ? window.SSCStore.restoreFromRecycleBin(binId) : { success: false };
  if (result.success) {
    showGlobalToast(`"${title}" restored successfully!`, true);
    const container = document.getElementById('admin-tab-content-area');
    if (container) renderRecycleBinTab(container);
    renderAdminHeader();
  } else {
    showGlobalToast(result.message || 'Failed to restore item.', false);
  }
}

function handlePermanentDeleteBinItem(binId, encodedTitle) {
  const title = decodeURIComponent(encodedTitle);
  if (confirm(`Permanently delete "${title}"?\n\n⚠️ Caution: This will permanently purge this record from the database. This action CANNOT be undone.`)) {
    const result = window.SSCStore ? window.SSCStore.permanentDeleteFromRecycleBin(binId) : { success: false };
    if (result.success) {
      showGlobalToast(`"${title}" permanently deleted.`, false);
      const container = document.getElementById('admin-tab-content-area');
      if (container) renderRecycleBinTab(container);
      renderAdminHeader();
    }
  }
}

function handleEmptyRecycleBin() {
  const count = window.SSCStore ? window.SSCStore.getRecycleBinCount() : 0;
  if (count === 0) return;
  if (confirm(`Empty entire Recycle Bin?\n\n⚠️ Caution: This will permanently delete ALL ${count} items in the trash across Students, Books, Classes, Enrollments, and Staff.\n\nThis CANNOT be undone. Proceed?`)) {
    window.SSCStore.emptyRecycleBin();
    showGlobalToast(`Recycle bin emptied (${count} items purged).`, false);
    const container = document.getElementById('admin-tab-content-area');
    if (container) renderRecycleBinTab(container);
    renderAdminHeader();
  }
}

// ==========================================================================
// 9. DATABASE & CLOUD SETTINGS TAB (Settings Dropdown Item)
// ==========================================================================
function renderSettingsTab(container) {
  const config = window.DatabaseService ? window.DatabaseService.getCloudConfig() : { url: '', key: '' };
  const isCloud = window.DatabaseService ? window.DatabaseService.isSupabaseConnected() : false;

  container.innerHTML = `
    <div class="space-y-6">
      <div>
        <h3 class="font-serif text-2xl font-bold text-brand-dark">Database Connection & System Settings</h3>
        <p class="text-xs text-brand-muted">Configure your Supabase PostgreSQL project credentials and backup data.</p>
      </div>

      <!-- Supabase Cloud Connection Box -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECE2D2] shadow-xs">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-[#F4ECE1]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">⚡</div>
            <div>
              <h4 class="font-bold text-brand-dark text-base">Supabase Cloud Database (PostgreSQL)</h4>
              <p class="text-xs text-brand-muted">Managed cloud backend with Row Level Security & Auth</p>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold ${isCloud ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}">
            ${isCloud ? '● Connected' : '○ Offline / Local Mode'}
          </span>
        </div>

        <form id="supabase-connect-form" class="space-y-4 max-w-xl">
          <div>
            <label class="block text-xs font-semibold text-brand-dark uppercase tracking-wider mb-1.5">Project URL</label>
            <input type="url" id="settings-supabase-url" value="${config.url || ''}"
                   placeholder="https://xyzcompany.supabase.co"
                   class="w-full px-4 py-3 rounded-xl border border-[#DED4C7] bg-[#FAF8F5] text-xs font-mono text-brand-dark focus:bg-white" required>
          </div>
          <div>
            <label class="block text-xs font-semibold text-brand-dark uppercase tracking-wider mb-1.5">Anon Public Key</label>
            <input type="text" id="settings-supabase-key" value="${config.key || ''}"
                   placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                   class="w-full px-4 py-3 rounded-xl border border-[#DED4C7] bg-[#FAF8F5] text-xs font-mono text-brand-dark focus:bg-white" required>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button type="submit" id="btn-save-supabase" class="px-5 py-2.5 rounded-xl bg-brand-dark hover:bg-black text-white text-xs font-bold shadow transition">
              Test & Connect Supabase
            </button>
            ${isCloud ? `
              <button type="button" onclick="triggerManualCloudSync()" class="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                <span>🔄 Sync Data from Cloud Now</span>
              </button>
              <button type="button" onclick="disconnectSupabaseCloud()" class="px-4 py-2.5 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold transition">
                Disconnect
              </button>
            ` : ''}
          </div>
        </form>
      </div>

      <!-- Database Backup & Export -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECE2D2] shadow-xs">
        <h4 class="font-bold text-brand-dark text-base mb-1">Database Backup & Portability</h4>
        <p class="text-xs text-brand-muted mb-4">Export full snapshot of students, fee records, books, classes, and applications.</p>
        <div class="flex flex-wrap items-center gap-3">
          <button onclick="downloadDatabaseBackup()" class="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-brand-dark text-xs font-bold transition flex items-center gap-2">
            <span>📥 Download Backup (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  `;

  // Bind Supabase form submit
  const form = document.getElementById('supabase-connect-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = document.getElementById('settings-supabase-url').value;
      const key = document.getElementById('settings-supabase-key').value;
      const submitBtn = document.getElementById('btn-save-supabase');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Testing Connection...';

      try {
        await window.DatabaseService.testAndSaveSupabaseConfig(url, key);
        showGlobalToast('Successfully connected to Supabase!', true);
        renderSettingsTab(container);
        renderAdminHeader();
      } catch (err) {
        showGlobalToast(err.message, false);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Test & Connect Supabase';
      }
    });
  }
}

async function triggerManualCloudSync() {
  if (!window.DatabaseService) return;
  showGlobalToast('Fetching latest data from Supabase Cloud tables...', true);
  const success = await window.DatabaseService.fetchInitialDataFromCloud();
  if (success) {
    showGlobalToast('Cloud synchronization complete! All tables up to date.', true);
  } else {
    showGlobalToast('Cloud fetch encountered an issue. See console for details.', false);
  }
}

function disconnectSupabaseCloud() {
  if (confirm('Disconnect from Supabase cloud and revert to local storage?')) {
    window.DatabaseService.disconnectSupabase();
    showGlobalToast('Reverted to local database mode.');
    const container = document.getElementById('admin-tab-content-area');
    if (container) renderSettingsTab(container);
    renderAdminHeader();
  }
}

function downloadDatabaseBackup() {
  const jsonStr = window.SSCStore ? window.SSCStore.exportBackupJSON() : window.DatabaseService.exportBackupJSON();
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SSC_Study_Circle_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ==========================================================================
// REAL-TIME SYNCHRONIZATION WITH PUBLIC WEBSITE
// ==========================================================================
function syncPublicViews() {
  if (typeof updateMetricsDisplay === 'function') updateMetricsDisplay();
  if (typeof renderStudentsTable === 'function') renderStudentsTable();
  if (typeof renderBooksGrid === 'function') renderBooksGrid();
  if (typeof renderFreeMaterials === 'function') renderFreeMaterials();
}

window.openStudentFeeModal = function(id) {
  if (typeof window.openStudentModal === 'function') {
    window.openStudentModal(id);
  }
};

// Global Exports
window.AdminDashboard = {
  init: initAdminDashboard,
  switchTab: switchAdminTab,
  renderHeader: renderAdminHeader,
  renderTabContent: renderAdminTabContent
};
