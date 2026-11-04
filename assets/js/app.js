/**
 * SSC Students Study Circle - Main Application Controller
 * Coordinates SPA Page Router, Navigation, Animations, Books & Downloads,
 * Student Management & Fee History, Classes, Enrollment, and Admin Auth.
 */

document.addEventListener('DOMContentLoaded', () => {
  initSPARouter();
  initHeroAnimations();
  initBooksSection();
  initStudentsSection();
  initEnrollmentForm();
  initAdminPortal();
  if (window.AdminDashboard && typeof window.AdminDashboard.init === 'function') {
    window.AdminDashboard.init();
  }
  initModalListeners();
});

/* ==========================================================================
   1. SPA Page-View Router & Navigation Controller
   Each nav item opens its own dedicated page view. Only one view is visible
   at a time. Browser Back/Forward works via hashchange/popstate.
   Exact Order: Home | About | Books | Students | Classes | Admin + Enroll Now
   ========================================================================== */

const VALID_ROUTES = ['home', 'about', 'books', 'students', 'classes', 'enrollment', 'admin'];

// Browser Tab Title Manager: Exact active section naming
function updateDocumentTitle(route) {
  const r = (route || window.location.hash.replace('#', '') || 'home').toLowerCase();
  if (r === 'books') {
    document.title = 'Books';
  } else if (r === 'students') {
    document.title = 'Students';
  } else if (r === 'classes') {
    document.title = 'Classes';
  } else if (r === 'enrollment') {
    document.title = 'Enrollment';
  } else if (r === 'admin') {
    document.title = 'Admin';
  } else {
    // Home, About, or fallback default
    document.title = 'Students Study Circle';
  }
}
window.updateDocumentTitle = updateDocumentTitle;

function initSPARouter() {
  const navLinks = document.querySelectorAll('.main-nav-link');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  // Navigate to a specific page view
  function navigateTo(route, pushState = true) {
    route = route.replace('#', '');
    if (!VALID_ROUTES.includes(route)) route = 'home';

    // Update browser tab title immediately
    updateDocumentTitle(route);

    // Hide all page views
    const allViews = document.querySelectorAll('.page-view');
    allViews.forEach(view => {
      view.style.display = 'none';
      view.classList.remove('animate-page-enter');
    });

    if (route === 'home' || route === 'about') {
      // Home and About are together on the same screen
      const homeView = document.getElementById('home');
      const aboutView = document.getElementById('about');
      if (homeView) homeView.style.display = '';
      if (aboutView) aboutView.style.display = '';

      if (route === 'about') {
        if (aboutView) {
          setTimeout(() => {
            aboutView.scrollIntoView({ behavior: 'smooth' });
          }, 30);
        }
        setActiveNav('#about');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveNav('#home');
      }
    } else {
      // Show the dedicated target view
      const targetView = document.getElementById(route);
      if (targetView) {
        targetView.style.display = '';
        void targetView.offsetWidth; // force reflow
        targetView.classList.add('animate-page-enter');
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      setActiveNav('#' + route);
    }

    // Toggle Enroll Now button visibility in header (hidden on admin page)
    updateNavbarEnrollButton(route);

    // Update hash without triggering hashchange if we handle it ourselves
    if (pushState) {
      const newHash = '#' + route;
      if (window.location.hash !== newHash) {
        history.pushState({ route: route }, '', newHash);
      }
    }
  }
  window.navigateTo = navigateTo;

  // Set active navigation state on both desktop and mobile
  function setActiveNav(hash) {
    const target = hash || '#home';

    // Desktop nav links
    navLinks.forEach(link => {
      const linkHash = link.getAttribute('href');
      if (linkHash === target) {
        link.classList.add('active-nav');
      } else {
        link.classList.remove('active-nav');
      }
    });

    // Mobile nav links
    mobileLinks.forEach(link => {
      const linkHash = link.getAttribute('href');
      if (linkHash === target) {
        link.classList.add('active-nav');
      } else {
        link.classList.remove('active-nav');
      }
    });
  }

  // Intercept nav link clicks to use SPA routing instead of scroll
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        navigateTo(href);
      }
    });
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        navigateTo(href);
      }
      // Close mobile menu
      if (mobileMenu) mobileMenu.classList.add('hidden');
      if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Intercept Enroll Now button clicks
  document.querySelectorAll('a[href="#enrollment"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('enrollment');
    });
  });

  // Intercept other hash-based links (Join Our Classes, Know More, footer links, etc.)
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    const route = href.replace('#', '');
    if (VALID_ROUTES.includes(route)) {
      e.preventDefault();
      navigateTo(route);
    }
  });

  // Mobile menu toggle
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Browser Back/Forward navigation
  window.addEventListener('popstate', (e) => {
    const route = (e.state && e.state.route) ? e.state.route : (window.location.hash.replace('#', '') || 'home');
    navigateTo(route, false);
  });

  // Scroll observer to update active nav between Home and About when both are on screen
  const aboutSection = document.getElementById('about');
  if (aboutSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const homeView = document.getElementById('home');
      // Only track if currently on Home/About screen
      if (homeView && homeView.style.display !== 'none') {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveNav('#about');
          } else if (window.scrollY < 300) {
            setActiveNav('#home');
          }
        });
      }
    }, { threshold: 0.25 });
    observer.observe(aboutSection);
  }

  // Initial page load: determine route from URL hash
  const initialRoute = window.location.hash.replace('#', '') || 'home';
  navigateTo(initialRoute, false);
  updateDocumentTitle(initialRoute);
  updateNavbarEnrollButton(initialRoute);

  window.addEventListener('hashchange', () => {
    const current = window.location.hash.replace('#', '') || 'home';
    updateDocumentTitle(current);
    updateNavbarEnrollButton();
  });
  window.addEventListener('popstate', () => {
    const current = window.location.hash.replace('#', '') || 'home';
    updateDocumentTitle(current);
    updateNavbarEnrollButton();
  });
  window.addEventListener('sscAuthStateChanged', () => {
    updateNavbarEnrollButton();
  });
  document.addEventListener('click', () => {
    setTimeout(updateNavbarEnrollButton, 10);
  }, true);
}

// Force Hide "Enroll Now" Navbar Button When on Admin Tab
function updateNavbarEnrollButton(route) {
  const current = (route || window.location.hash.replace('#', '') || 'home').toLowerCase();
  const adminSection = document.getElementById('admin');
  const isAdminActive = current.includes('admin') 
    || window.location.hash.includes('admin') 
    || (adminSection && adminSection.style.display !== 'none' && !adminSection.classList.contains('hidden'));

  if (isAdminActive) {
    document.body.classList.add('view-admin');
  } else {
    document.body.classList.remove('view-admin');
  }

  document.querySelectorAll('header a, header button, nav a, nav button, #mobileMenu a, #mobileMenu button').forEach(el => {
    if (el.textContent && el.textContent.trim().includes('Enroll Now')) {
      el.style.setProperty('display', isAdminActive ? 'none' : 'inline-flex', 'important');
    }
  });
}
window.updateNavbarEnrollButton = updateNavbarEnrollButton;
window.syncEnrollNowButton = updateNavbarEnrollButton;

// Global helper so class cards' onclick="preselectClass(...)" can navigate to enrollment
function preselectClass(className) {
  const classSelect = document.getElementById('studentClass');
  if (classSelect) {
    classSelect.value = className;
  }
  // Navigate to enrollment view
  if (typeof navigateTo === 'undefined') {
    // Fallback: use hash
    window.location.hash = '#enrollment';
  }
}

// Make navigateTo available globally for preselectClass and other callers
window.sscNavigateTo = function(route) {
  window.location.hash = '#' + route.replace('#', '');
};

/* ==========================================================================
   2. Hero Section & Scroll Animations
   ========================================================================== */

function initHeroAnimations() {
  const heroCard = document.querySelector('.hero-book-card');
  if (!heroCard) return;

  // Gentle parallax effect on hero educational illustration (unless user prefers reduced motion)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      heroCard.style.transform = `translate(${x}px, ${y}px)`;
    }, { passive: true });
  }
}

/* ==========================================================================
   3. Books & Study Materials Controller
   - Free materials -> Functional Direct Download
   - Paid physical books -> WhatsApp inquiry prefilled message
   - Local pickup card & multi-item WhatsApp inquiry
   ========================================================================== */

let activeClassFilter = 'All Books';
let selectedBooksList = [
  { id: 'B01', title: 'Mathematics (Class 6)', class: '6th Class', price: 280, qty: 1 },
  { id: 'B02', title: 'English (Class 5)', class: '5th Class', price: 250, qty: 1 }
];
window.selectedBooksList = selectedBooksList;

function initBooksSection() {
  renderBooksGrid();
  renderSelectedBooksInquiryList();
  renderFreeMaterials();

  // Reactive listener for books updates
  window.addEventListener('sscDataUpdated', () => {
    renderBooksGrid();
    renderFreeMaterials();
  });
  window.addEventListener('sscStateChanged', () => {
    renderBooksGrid();
    renderFreeMaterials();
  });

  // Class Filter Pill Buttons
  const filterButtons = document.querySelectorAll('.book-filter-pill');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('bg-brand-dark', 'text-white', 'shadow-sm');
        b.classList.add('bg-white/70', 'text-brand-dark', 'hover:bg-white', 'border', 'border-[#E8DEC8]');
      });

      btn.classList.add('bg-brand-dark', 'text-white', 'shadow-sm');
      btn.classList.remove('bg-white/70', 'border-[#E8DEC8]');

      activeClassFilter = btn.getAttribute('data-class') || 'All Books';
      renderBooksGrid();
    });
  });
}

function renderBooksGrid() {
  const container = document.getElementById('books-grid-container');
  if (!container) return;

  // Read catalog from DatabaseService or BooksData fallback
  let catalog = window.BooksData ? window.BooksData.catalog : [];
  if (window.DatabaseService) {
    const dbBooks = window.DatabaseService.getBooks().filter(b => !b.isFree);
    if (dbBooks && dbBooks.length > 0) {
      catalog = dbBooks.map(dbBook => {
        const existing = (window.BooksData?.catalog || []).find(b => b.id === dbBook.id);
        return {
          id: dbBook.id,
          title: dbBook.title,
          class: dbBook.class,
          gradeFilter: dbBook.class,
          price: dbBook.price,
          badge: dbBook.badge || 'SSC Edition',
          colorScheme: existing?.colorScheme || 'from-[#1E6091] via-[#1A759F] to-[#52B69A]',
          accentColor: existing?.accentColor || '#16425B',
          titleColor: existing?.titleColor || 'text-yellow-300',
          description: dbBook.description,
          mockupIcons: existing?.mockupIcons || ['📖', '✨'],
          subtitle: existing?.subtitle || dbBook.category || 'SSC Standard'
        };
      });
      if (window.BooksData) window.BooksData.catalog = catalog;
    }
  }

  const filtered = activeClassFilter === 'All Books'
    ? catalog
    : catalog.filter(b => b.gradeFilter === activeClassFilter || b.class === activeClassFilter || b.gradeFilter === 'All Classes');

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-brand-muted">
        <p class="text-base font-medium">No books currently listed for ${activeClassFilter}.</p>
        <p class="text-xs mt-1">Please select "All Books" or contact us via WhatsApp for custom curriculum materials.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(book => {
    const waUrl = (window.BooksData && typeof window.BooksData.getWhatsAppInquiryUrl === 'function')
      ? window.BooksData.getWhatsAppInquiryUrl(book.title, book.class, book.price)
      : `https://wa.me/918919961354?text=${encodeURIComponent(`Hello SSC Students Study Circle!\n\nI would like to inquire about purchasing the following physical book for tuition:\n📖 *${book.title}* (${book.class})\n💰 Price: ₹${book.price}\n\nPlease let me know if it is available for local pickup at the center.\n\nThank you!`)}`;
    
    const safeBookId = String(book.id).replace(/'/g, "\\'");
    const isAdded = selectedBooksList.some(b => String(b.id) === String(book.id));

    return `
      <div class="book-card-3d p-4 flex flex-col justify-between group">
        <div>
          <!-- Product Mockup -->
          <div class="w-full aspect-[4/3] rounded-xl bg-[#FAF7F2] mb-4 overflow-hidden relative flex items-center justify-center p-3 shadow-inner">
            <div class="relative w-full h-full flex items-center justify-center">
              <div class="absolute -left-1 top-2 bottom-2 w-3 bg-[#261710]/40 rounded-l-sm shadow-sm"></div>
              <div class="absolute left-1 top-1 bottom-1 w-2 bg-[#261710]/20 rounded-l-sm"></div>
              <div class="w-full h-full rounded-lg bg-gradient-to-br ${book.colorScheme} p-3 text-white flex flex-col justify-between shadow-lg relative border-l-4" style="border-left-color: ${book.accentColor}">
                <div>
                  <span class="badge-3d-glossy text-[9.5px] tracking-wider uppercase px-2.5 py-0.5 inline-block">
                    ${book.badge}
                  </span>
                  <h4 class="font-serif font-black text-xl leading-tight mt-1 ${book.titleColor}">${book.title}</h4>
                  <p class="text-[11px] font-bold text-white/90">${book.class}</p>
                </div>
                <div class="flex items-center justify-between mt-auto pt-2 border-t border-white/20">
                  <div class="flex gap-1 text-xs">
                    ${book.mockupIcons ? book.mockupIcons.map(icon => `<span class="text-xs">${icon}</span>`).join('') : ''}
                  </div>
                  <span class="text-[9px] font-semibold text-white/90">${book.subtitle || 'SSC Standard'}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Product Details -->
          <h3 class="text-sm font-bold text-brand-dark leading-snug">${book.title} (${book.class})</h3>
          <p class="text-xs text-brand-muted mt-1 line-clamp-2">${book.description}</p>
          <div class="mt-2 mb-3">
            <span class="badge-3d-inset text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded inline-block text-brand-dark">
              ${book.class}
            </span>
          </div>
        </div>

        <div>
          <div class="flex items-baseline justify-between mb-3">
            <div class="text-lg font-bold text-brand-dark">₹${book.price}</div>
            <span class="text-[11px] text-emerald-700 font-semibold">Available in Center</span>
          </div>

          <!-- Action: WhatsApp Inquiry & Select -->
          <div class="grid grid-cols-2 gap-2 mt-auto book-card-actions" style="position: relative; z-index: 30; transform: translateZ(0); backface-visibility: hidden;">
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" 
               onclick="event.preventDefault(); window.openBookWhatsAppInquiry('${safeBookId}');" 
               class="btn-whatsapp py-2.5 px-2 rounded-xl text-white flex items-center justify-center gap-1.5 text-xs font-semibold text-center cursor-pointer"
               style="position: relative; z-index: 30; cursor: pointer; pointer-events: auto;">
              <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" style="pointer-events: none;">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span style="pointer-events: none;">WhatsApp</span>
            </a>
            <button type="button" 
                    data-inquire-book-id="${book.id}" 
                    onclick="window.addBookToInquiry('${safeBookId}')" 
                    class="py-2.5 px-2 rounded-xl text-white flex items-center justify-center gap-1 text-xs font-semibold cursor-pointer ${isAdded ? 'btn-3d-emerald bg-emerald-700' : 'btn-3d-dark bg-[#261710]'}" 
                    style="position: relative; z-index: 30; cursor: pointer; pointer-events: auto;">
              <span style="pointer-events: none;">${isAdded ? '✓ Added' : '+ Inquire'}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Multi-book inquiry selection panel
function renderSelectedBooksInquiryList() {
  const container = document.getElementById('selected-books-list');
  const countEl = document.getElementById('selected-books-count');
  const totalEl = document.getElementById('selected-books-total');
  const whatsappProceedBtn = document.getElementById('whatsapp-proceed-btn');

  if (!container || !totalEl) return;

  if (countEl) countEl.textContent = `(${selectedBooksList.length})`;

  let total = 0;
  selectedBooksList.forEach(item => {
    total += item.price * (item.qty || 1);
  });
  totalEl.textContent = `₹${total}`;

  if (selectedBooksList.length === 0) {
    container.innerHTML = `
      <div class="py-6 text-center text-brand-muted text-xs">
        No books selected. Click "+ Inquire" on any book to add it to this list.
      </div>
    `;
    if (whatsappProceedBtn) {
      whatsappProceedBtn.href = window.BooksData.getWhatsAppMultiOrderUrl([]);
    }
    return;
  }

  container.innerHTML = selectedBooksList.map((item, index) => {
    return `
      <div class="py-3 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-[#261710]/10 flex-shrink-0 flex items-center justify-center text-[#261710] text-[9px] font-bold p-1 text-center">
          ${item.class.split(' ')[0]}
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-bold text-brand-dark truncate">${item.title}</h4>
          <div class="flex items-center justify-between mt-1">
            <span class="text-xs font-bold text-brand-dark">₹${item.price * item.qty}</span>
            <div class="flex items-center gap-2">
              <div class="inline-flex items-center border border-[#E0D7C9] rounded-lg px-1.5 py-0.5 bg-[#FAF6F0] text-xs">
                <button class="px-1 text-brand-muted hover:text-brand-dark" onclick="updateBookQty(${index}, -1)">−</button>
                <span class="px-1.5 font-semibold text-brand-dark">${item.qty}</span>
                <button class="px-1 text-brand-muted hover:text-brand-dark" onclick="updateBookQty(${index}, 1)">+</button>
              </div>
              <button onclick="removeBookFromInquiry(${index})" class="text-brand-muted hover:text-red-500 transition p-1" title="Remove">
                <svg class="w-3.5 h-3.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (whatsappProceedBtn) {
    whatsappProceedBtn.href = window.BooksData.getWhatsAppMultiOrderUrl(selectedBooksList);
  }
}

window.openBookWhatsAppInquiry = function(bookId) {
  const safeIdStr = String(bookId);
  let book = null;
  if (window.BooksData && Array.isArray(window.BooksData.catalog)) {
    book = window.BooksData.catalog.find(b => String(b.id) === safeIdStr);
  }
  if (!book && window.DatabaseService && typeof window.DatabaseService.getBooks === 'function') {
    book = window.DatabaseService.getBooks().find(b => String(b.id) === safeIdStr);
  }
  if (!book && window.SSCStore && typeof window.SSCStore.getBooks === 'function') {
    book = window.SSCStore.getBooks().find(b => String(b.id) === safeIdStr);
  }

  const title = book ? book.title : 'Tuition Book';
  const grade = book ? (book.class || book.gradeFilter || 'All Classes') : 'All Classes';
  const price = book ? (book.price || 0) : 0;

  const url = (window.BooksData && typeof window.BooksData.getWhatsAppInquiryUrl === 'function')
    ? window.BooksData.getWhatsAppInquiryUrl(title, grade, price)
    : `https://wa.me/918919961354?text=${encodeURIComponent(`Hello SSC Students Study Circle!\n\nI would like to inquire about purchasing the following physical book for tuition:\n📖 *${title}* (${grade})\n💰 Price: ₹${price}\n\nPlease let me know if it is available for local pickup at the center.\n\nThank you!`)}`;

  window.open(url, '_blank', 'noopener,noreferrer');
};

window.addBookToInquiry = function(bookId) {
  const safeIdStr = String(bookId);
  const existingIndex = selectedBooksList.findIndex(b => String(b.id) === safeIdStr);

  if (existingIndex !== -1) {
    // Toggle remove if already in inquiry selection
    const removedItem = selectedBooksList[existingIndex];
    selectedBooksList.splice(existingIndex, 1);
    renderSelectedBooksInquiryList();
    window.updateAllInquireButtons();
    if (typeof showGlobalToast === 'function') {
      showGlobalToast(`Removed "${removedItem.title}" from inquiry list.`);
    }
  } else {
    // Add to inquiry selection
    let book = null;
    if (window.BooksData && Array.isArray(window.BooksData.catalog)) {
      book = window.BooksData.catalog.find(b => String(b.id) === safeIdStr);
    }
    if (!book && window.DatabaseService && typeof window.DatabaseService.getBooks === 'function') {
      book = window.DatabaseService.getBooks().find(b => String(b.id) === safeIdStr);
    }
    if (!book && window.SSCStore && typeof window.SSCStore.getBooks === 'function') {
      book = window.SSCStore.getBooks().find(b => String(b.id) === safeIdStr);
    }

    if (!book) return;

    selectedBooksList.push({
      id: book.id,
      title: `${book.title} (${book.class})`,
      class: book.class,
      price: book.price,
      qty: 1
    });

    renderSelectedBooksInquiryList();
    window.updateAllInquireButtons();
    if (typeof showGlobalToast === 'function') {
      showGlobalToast(`Added "${book.title}" to inquiry list.`);
    }
  }
};

window.updateAllInquireButtons = function() {
  const buttons = document.querySelectorAll('[data-inquire-book-id]');
  buttons.forEach(btn => {
    const bookId = btn.getAttribute('data-inquire-book-id');
    const isAdded = selectedBooksList.some(b => String(b.id) === String(bookId));

    const span = btn.querySelector('span');
    if (span) {
      span.textContent = isAdded ? '✓ Added' : '+ Inquire';
    } else {
      btn.textContent = isAdded ? '✓ Added' : '+ Inquire';
    }

    if (isAdded) {
      btn.classList.remove('btn-3d-dark', 'bg-[#261710]');
      btn.classList.add('btn-3d-emerald', 'bg-emerald-700');
    } else {
      btn.classList.remove('btn-3d-emerald', 'bg-emerald-700');
      btn.classList.add('btn-3d-dark', 'bg-[#261710]');
    }
  });
};

window.updateBookQty = function(index, delta) {
  if (selectedBooksList[index]) {
    selectedBooksList[index].qty += delta;
    if (selectedBooksList[index].qty <= 0) {
      selectedBooksList.splice(index, 1);
    }
    renderSelectedBooksInquiryList();
    window.updateAllInquireButtons();
  }
};

window.removeBookFromInquiry = function(index) {
  selectedBooksList.splice(index, 1);
  renderSelectedBooksInquiryList();
  window.updateAllInquireButtons();
};

function renderFreeMaterials() {
  const container = document.getElementById('free-materials-container');
  if (!container) return;

  let materials = window.BooksData ? window.BooksData.freeMaterials : [];
  if (window.DatabaseService) {
    const dbFree = window.DatabaseService.getBooks().filter(b => b.isFree);
    if (dbFree && dbFree.length > 0) {
      materials = dbFree.map(f => ({
        id: f.id,
        title: f.title,
        class: f.class,
        format: 'PDF (Free)',
        size: 'PDF Document',
        description: f.description,
        downloadPath: f.downloadUrl || 'assets/downloads/SSC_Tuition_Curriculum_and_Syllabus.pdf',
        badge: f.badge || 'Free Download'
      }));
    }
  }

  container.innerHTML = materials.map(item => {
    const safeId = String(item.id).replace(/'/g, "\\'");
    const safePath = String(item.downloadPath || '').replace(/'/g, "\\'");
    const safeTitle = String(item.title || '').replace(/'/g, "\\'");

    return `
      <div class="free-material-card-3d p-5 flex flex-col justify-between group">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="badge-3d-glossy text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full inline-block">
              ${item.badge}
            </span>
            <span class="text-xs font-semibold text-brand-muted">${item.format}</span>
          </div>
          <h4 class="font-serif font-bold text-base text-brand-dark mb-1.5">${item.title}</h4>
          <p class="text-xs text-brand-muted leading-relaxed">${item.description}</p>
        </div>
        <div class="mt-4 pt-3 border-t border-[#F0EBE1] flex items-center justify-between free-material-actions" style="position: relative; z-index: 30;">
          <span class="badge-3d-inset text-xs font-semibold text-brand-dark px-2.5 py-0.5 rounded inline-block">${item.class}</span>
          <button type="button" 
                  onclick="window.downloadFreeMaterial('${safeId}', '${safePath}', '${safeTitle}')" 
                  class="btn-3d-emerald inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold cursor-pointer"
                  style="position: relative; z-index: 30; cursor: pointer; pointer-events: auto;">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="pointer-events: none;">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span style="pointer-events: none;">Download PDF</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.downloadFreeMaterial = async function(id, path, title) {
  const filename = (path && path.includes('/')) ? path.split('/').pop() : `SSC_${id}_Study_Notes.pdf`;

  if (typeof showGlobalToast === 'function') {
    showGlobalToast(`Preparing download: ${title || 'Study Material'}...`);
  }

  // Attempt direct fetch to ensure file is accessible
  if (path) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        return;
      }
    } catch (err) {
      console.warn('Direct file fetch failed, generating dynamic study notes PDF...', err);
    }
  }

  // Fallback: Generate real PDF-1.4 file dynamically
  window.generateDynamicStudyNotesDownload(id, title, filename);
};

window.generateDynamicStudyNotesDownload = function(id, title, filename) {
  const fileToSave = filename || `SSC_${id}_Study_Notes.pdf`;

  const contentMap = {
    FM01: [
      "SSC Students Study Circle - Academic Year 2025-2026",
      "CLASS 6 MATHEMATICS - KEY FORMULAS & STUDY NOTES",
      "--------------------------------------------------------------------------------",
      "1. WHOLE NUMBERS & INTEGERS:",
      "   - Commutative Property: a + b = b + a | a * b = b * a",
      "   - Associative Property: (a + b) + c = a + (b + c)",
      "   - Distributive Property: a * (b + c) = (a * b) + (a * c)",
      "   - Integers: Absolute value |-x| = x. Opposite sign addition: subtract smaller from larger.",
      "",
      "2. FACTORS & MULTIPLES (HCF & LCM):",
      "   - Product of two numbers = HCF * LCM",
      "   - Prime factorization is unique for every composite integer.",
      "",
      "3. MENSURATION & GEOMETRY:",
      "   - Perimeter of Rectangle = 2 * (Length + Breadth)",
      "   - Area of Rectangle = Length * Breadth",
      "   - Perimeter of Square = 4 * Side | Area of Square = Side * Side",
      "   - Area of Triangle = 1/2 * Base * Height",
      "",
      "SSC Center: +91 8919961354 | Founder: Md. Azizur Rahman"
    ],
    FM02: [
      "SSC Students Study Circle - Academic Year 2025-2026",
      "CLASS 5 ENGLISH - GRAMMAR ESSENTIALS & VOCABULARY GUIDE",
      "--------------------------------------------------------------------------------",
      "1. PARTS OF SPEECH OVERVIEW:",
      "   - Noun: Name of a person, place, animal, or thing.",
      "   - Pronoun: Replaces a noun (he, she, they, it).",
      "   - Verb: Action or state of being (run, think, is, were).",
      "   - Adjective: Describes a noun (clever, bright, energetic).",
      "   - Adverb: Modifies a verb or adjective (quickly, very, silently).",
      "",
      "2. TENSES & TIME OF ACTION:",
      "   - Simple Present: Habitual actions (She studies every evening).",
      "   - Simple Past: Completed actions (They completed their homework).",
      "   - Present Continuous: is/am/are + verb-ing (We are learning now).",
      "",
      "3. VOCABULARY ACCELERATORS:",
      "   - Diligent: Hardworking and careful.",
      "   - Inquisitive: Eager to learn and curious.",
      "   - Perceiver: One who observes and understands.",
      "",
      "SSC Center: +91 8919961354 | Founder: Md. Azizur Rahman"
    ],
    FM03: [
      "SSC Students Study Circle - Academic Year 2025-2026",
      "CLASS 7 SCIENCE - QUICK REVISION SUMMARY & DIAGRAMS",
      "--------------------------------------------------------------------------------",
      "1. NUTRITION IN PLANTS & ANIMALS:",
      "   - Photosynthesis: 6CO2 + 6H2O + Sunlight -> C6H12O6 + 6O2",
      "   - Chlorophyll captures light energy; stomata exchange gases.",
      "   - Human Digestive Tract: Mouth -> Oesophagus -> Stomach -> Small Intestine.",
      "",
      "2. HEAT & TEMPERATURE TRANSFER:",
      "   - Conduction: Transfer through direct contact in solids.",
      "   - Convection: Transfer through fluid movements in liquids and gases.",
      "   - Radiation: Transfer through electromagnetic waves without medium.",
      "",
      "3. ACIDS, BASES & SALTS:",
      "   - Acids turn blue litmus paper RED (pH < 7).",
      "   - Bases turn red litmus paper BLUE (pH > 7).",
      "   - Neutralization: Acid + Base -> Salt + Water + Heat.",
      "",
      "SSC Center: +91 8919961354 | Founder: Md. Azizur Rahman"
    ],
    FM04: [
      "SSC Students Study Circle - Academic Year 2025-2026",
      "TUITION CURRICULUM, DAILY ROUTINE & METHODOLOGY",
      "--------------------------------------------------------------------------------",
      "1. DAILY TIMETABLE (MONDAY TO SATURDAY):",
      "   - 5:00 PM - 6:00 PM: Core Subject Study (Maths / Science).",
      "   - 6:00 PM - 7:00 PM: Languages & Social Studies (English, Hindi, Telugu).",
      "   - 7:00 PM - 7:30 PM: School Homework Verification & 1-on-1 Doubt Clearing.",
      "   - 7:30 PM - 8:30 PM: Extended Practice for Board / Senior batches.",
      "",
      "2. EVALUATION & PARENT UPDATES:",
      "   - Weekly chapter revision tests every Saturday.",
      "   - Real-time monthly fee ledger & attendance tracking.",
      "   - Continuous mentoring tailored to every student's learning pace.",
      "",
      "SSC Center: +91 8919961354 | Lead Mentor: Md. Azizur Rahman"
    ]
  };

  const lines = contentMap[id] || [
    "SSC Students Study Circle - Study Notes",
    title || "Study Material",
    "--------------------------------------------------------------------------------",
    "Study guide provided by SSC Students Study Circle.",
    "For inquiries, visit our center or WhatsApp: +91 8919961354."
  ];

  let streamContent = "BT\n/F1 16 Tf\n50 750 Td\n";
  lines.forEach((line, idx) => {
    const cleanLine = line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    if (idx === 0) {
      streamContent += `(${cleanLine}) Tj\n/F1 10 Tf\n`;
    } else if (idx === 1) {
      streamContent += `0 -25 Td\n(${cleanLine}) Tj\n/F1 9 Tf\n`;
    } else {
      streamContent += `0 -16 Td\n(${cleanLine}) Tj\n`;
    }
  });
  streamContent += "ET";

  const streamLen = streamContent.length;
  const pdfData = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLen} >>
stream
${streamContent}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000300 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
400
%%EOF`;

  const blob = new Blob([pdfData], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileToSave;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

  if (typeof showGlobalToast === 'function') {
    showGlobalToast(`Downloaded: ${fileToSave}`);
  }
};

/* ==========================================================================
   4. Students Management & Fee History Controller
   - 3D Interactive Class Summary Cards with click-to-filter
   - Live Search & Filtering by Class & Current Month Fee Status
   - Pagination (8 per page)
   - Month-by-Month Fee History Modal with ledger & dynamic totals
   - Admin features: Add/Edit/Delete student, Record payment
   ========================================================================== */

let studentCurrentPage = 1;
const STUDENTS_PER_PAGE = 20; // Ensure all 12 enrolled students are visible without pagination cutoff
let studentSearchQuery = '';
let studentSelectedClass = 'all';
let studentSelectedStatus = 'all';

// Click-to-Filter for Top Class Summary Cards (Total + LKG through 10th)
window.filterByClassCard = function(className) {
  if (!className || className.toLowerCase() === 'all' || className.toLowerCase().startsWith('total')) {
    studentSelectedClass = 'all';
  } else {
    studentSelectedClass = className;
  }

  const classFilter = document.getElementById('class-filter-select');
  if (classFilter) {
    classFilter.value = studentSelectedClass;
  }
  
  syncClassCardsActiveState(studentSelectedClass);
  studentCurrentPage = 1;
  renderStudentsTable();
};

function syncClassCardsActiveState(selectedClass) {
  const normSelected = (!selectedClass || selectedClass.toLowerCase() === 'all' || selectedClass.toLowerCase().startsWith('total')) ? 'all' : selectedClass;
  document.querySelectorAll('.class-card-3d, .card-class-3d').forEach(card => {
    const target = card.getAttribute('data-class-target');
    const isTargetTotal = !target || target.toLowerCase() === 'all' || target.toLowerCase().startsWith('total');
    if ((normSelected === 'all' && isTargetTotal) || target === normSelected) {
      card.classList.add('active-class-card');
      card.setAttribute('aria-pressed', 'true');
    } else {
      card.classList.remove('active-class-card');
      card.setAttribute('aria-pressed', 'false');
    }
  });
}

function initStudentsSection() {
  updateMetricsDisplay();
  syncClassCardsActiveState(studentSelectedClass);
  renderStudentsTable();

  // Attach explicit direct click handlers to all 13 class cards
  document.querySelectorAll('.class-card-3d, .card-class-3d').forEach(card => {
    card.style.cursor = 'pointer';
    card.onclick = (e) => {
      e.preventDefault();
      const target = card.getAttribute('data-class-target');
      if (target) {
        window.filterByClassCard(target);
      }
    };
  });

  // Search input listener
  const searchInput = document.getElementById('student-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      studentSearchQuery = e.target.value.toLowerCase().trim();
      studentCurrentPage = 1;
      renderStudentsTable();
    });
  }

  // Class filter dropdown listener (bidirectional sync with 3D cards)
  const classFilter = document.getElementById('class-filter-select');
  if (classFilter) {
    classFilter.addEventListener('change', (e) => {
      studentSelectedClass = e.target.value;
      syncClassCardsActiveState(studentSelectedClass);
      studentCurrentPage = 1;
      renderStudentsTable();
    });
  }

  // Status filter listener (Paid, Half Paid, Unpaid)
  const statusFilter = document.getElementById('status-filter-select');
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      studentSelectedStatus = e.target.value;
      studentCurrentPage = 1;
      renderStudentsTable();
    });
  }

  // Listen to auth changes to show/hide admin buttons
  window.addEventListener('sscAuthStateChanged', (e) => {
    updateAdminControlsInStudents(e.detail.isLoggedIn);
    renderStudentsTable();
  });

  // Reactive listeners for centralized store updates
  window.addEventListener('sscDataUpdated', () => {
    updateMetricsDisplay();
    renderStudentsTable();
  });

  window.addEventListener('sscStateChanged', () => {
    updateMetricsDisplay();
    renderStudentsTable();
  });

  updateAdminControlsInStudents(window.AdminAuth && window.AdminAuth.isLoggedIn());
}

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

function getFilteredStudents() {
  const store = window.SSCStore || window.StudentsStore;
  if (!store) return [];
  const all = store.getStudents ? store.getStudents() : store.getAll();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1 to 12

  return all.filter(s => {
    const matchesSearch = !studentSearchQuery ||
      s.name.toLowerCase().includes(studentSearchQuery) ||
      (s.phone && s.phone.replace(/\s+/g, '').includes(studentSearchQuery.replace(/\s+/g, ''))) ||
      (s.school && s.school.toLowerCase().includes(studentSearchQuery));

    const matchesClass = (studentSelectedClass === 'all') || (s.class === studentSelectedClass);

    let matchesStatus = true;
    if (studentSelectedStatus !== 'all') {
      let feeStatus = 'unpaid'; // 'paid', 'half-paid', 'unpaid'
      
      if (window.SSCStore && typeof window.SSCStore.getStudentMonthFee === 'function') {
        const feeData = window.SSCStore.getStudentMonthFee(s.id, currentYear, currentMonth);
        if (feeData) {
          if (feeData.status === 'Full Paid') feeStatus = 'paid';
          else if (feeData.status === 'Half Paid') feeStatus = 'half-paid';
          else feeStatus = 'unpaid';
        } else {
          // If student joined on/before current month and has no payment, they are unpaid
          const [jYear, jMonth] = (s.joiningDate || '2026-01-01').split('-').map(Number);
          if (currentYear > jYear || (currentYear === jYear && currentMonth >= jMonth)) {
            feeStatus = 'unpaid';
          } else {
            feeStatus = 'not-enrolled';
          }
        }
      } else {
        const payments = (s.feeHistory || []).filter(p => p.year === currentYear && p.month === currentMonth);
        const paidAmount = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const monthlyFee = Number(s.monthlyFee || 1200);
        if (paidAmount >= monthlyFee && monthlyFee > 0) feeStatus = 'paid';
        else if (paidAmount > 0) feeStatus = 'half-paid';
        else feeStatus = 'unpaid';
      }

      if (studentSelectedStatus === 'paid') {
        matchesStatus = feeStatus === 'paid';
      } else if (studentSelectedStatus === 'half-paid') {
        matchesStatus = feeStatus === 'half-paid';
      } else if (studentSelectedStatus === 'unpaid' || studentSelectedStatus === 'due') {
        matchesStatus = feeStatus === 'unpaid' || feeStatus === 'half-paid';
      } else if (studentSelectedStatus === 'active') {
        matchesStatus = s.status === 'active';
      }
    }

    return matchesSearch && matchesClass && matchesStatus;
  });
}

function renderStudentsTable() {
  const tableBody = document.getElementById('student-table-body');
  const paginationInfo = document.getElementById('pagination-info');
  const paginationControls = document.getElementById('pagination-controls');
  if (!tableBody) return;

  const filtered = getFilteredStudents();
  const total = filtered.length;
  const totalPages = Math.ceil(total / STUDENTS_PER_PAGE) || 1;

  if (studentCurrentPage > totalPages) studentCurrentPage = totalPages;
  if (studentCurrentPage < 1) studentCurrentPage = 1;

  const startIndex = (studentCurrentPage - 1) * STUDENTS_PER_PAGE;
  const endIndex = Math.min(startIndex + STUDENTS_PER_PAGE, total);
  const currentBatch = filtered.slice(startIndex, endIndex);

  if (paginationInfo) {
    paginationInfo.textContent = total > 0
      ? `Showing ${startIndex + 1} to ${endIndex} of ${total} students`
      : 'No students found matching current criteria';
  }

  const isAdmin = window.AdminAuth && window.AdminAuth.isLoggedIn();

  if (currentBatch.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="py-12 text-center text-brand-muted">
          <p class="font-medium">No student records found.</p>
          <p class="text-xs mt-1">Try modifying your search or clearing class filters.</p>
        </td>
      </tr>
    `;
    if (paginationControls) paginationControls.innerHTML = '';
    return;
  }

  // Class badge styles with 3D embossed look
  const classStyles = {
    'LKG': 'bg-pink-100 text-pink-800 border-pink-200',
    'UKG': 'bg-purple-100 text-purple-800 border-purple-200',
    '1st Class': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    '2nd Class': 'bg-[#FEE2E2] text-[#9F1239] border-red-200',
    '3rd Class': 'bg-[#DCFCE7] text-[#166534] border-emerald-200',
    '4th Class': 'bg-[#E0F2FE] text-[#0369A1] border-sky-200',
    '5th Class': 'bg-[#EDE9FE] text-[#5B21B6] border-purple-200',
    '6th Class': 'bg-[#FEF3C7] text-[#92400E] border-amber-200',
    '7th Class': 'bg-[#FFEDD5] text-[#C2410C] border-orange-200',
    '8th Class': 'bg-teal-100 text-teal-800 border-teal-200',
    '9th Class': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    '10th Class': 'bg-amber-100 text-amber-900 border-amber-300'
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  tableBody.innerHTML = currentBatch.map((student, idx) => {
    const sNo = startIndex + idx + 1;
    const badgeStyle = classStyles[student.class] || 'bg-stone-100 text-stone-800 border-stone-200';

    // Calculate Dynamic Current Month Status
    let currentMonthBadge = '';
    let feeData = null;
    if (window.SSCStore && typeof window.SSCStore.getStudentMonthFee === 'function') {
      feeData = window.SSCStore.getStudentMonthFee(student.id, currentYear, currentMonth);
    }

    if (feeData) {
      if (feeData.status === 'Full Paid') {
        currentMonthBadge = `<span class="badge-3d-paid inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"><span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>Paid</span>`;
      } else if (feeData.status === 'Half Paid') {
        currentMonthBadge = `<span class="badge-3d-half inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"><span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>Half Paid</span>`;
      } else {
        currentMonthBadge = `<span class="badge-3d-unpaid inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"><span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>Unpaid</span>`;
      }
    } else {
      currentMonthBadge = `<span class="badge-3d-unpaid inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"><span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>Unpaid</span>`;
    }

    const formattedJoiningDate = (window.formatISODateDisplay && typeof window.formatISODateDisplay === 'function')
      ? window.formatISODateDisplay(student.joiningDate)
      : student.joiningDate;

    return `
      <tr class="row-float-3d hover:bg-[#FAF7F2] transition-all border-b border-[#F4ECE3] text-[14px]">
        <td class="py-4 px-6 text-[#705E53] font-medium">${sNo}</td>
        <td class="py-4 px-6 font-bold text-[#261710]">
          ${student.name}
          ${student.school ? `<div class="text-[11px] font-normal text-[#8A796F] truncate max-w-[160px]">${student.school}</div>` : ''}
        </td>
        <td class="py-4 px-6">
          <span class="badge-3d-class border inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeStyle}">
            ${student.class}
          </span>
        </td>
        <td class="py-4 px-6 text-[#4F3F35] font-normal tracking-wide font-mono text-xs">${student.phone}</td>
        <td class="py-4 px-6 text-[#4F3F35] font-medium">${formattedJoiningDate}</td>
        <td class="py-4 px-6">${currentMonthBadge}</td>
        <td class="py-4 px-6 text-center">
          <div class="flex items-center justify-center gap-2">
            <button type="button" onclick="openStudentModal(${student.id})" 
                    class="btn-3d-secondary inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-[#D8C7B8] bg-[#FAF7F2] hover:bg-[#F0E5D8] text-[#3A2C24] text-xs font-semibold rounded-xl">
              <svg class="w-4 h-4 text-[#5A4538]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/>
              </svg>
              <span>History</span>
            </button>
            ${isAdmin ? `
              <button type="button" onclick="openEditStudentModal(${student.id})" class="btn-3d-secondary p-1.5 text-stone-600 hover:text-brand-espresso rounded-xl" title="Edit Student">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
              </button>
              <button type="button" onclick="confirmDeleteStudentPrompt(${student.id}, '${student.name}')" class="btn-3d-secondary p-1.5 text-stone-400 hover:text-red-600 rounded-xl" title="Delete Student">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Render pagination controls
  if (paginationControls) {
    let pagesHtml = `
      <button type="button" onclick="changeStudentPage(${studentCurrentPage - 1})" ${studentCurrentPage === 1 ? 'disabled' : ''}
              class="btn-3d-secondary w-8 h-8 flex items-center justify-center rounded-lg border border-[#E4DACF] bg-[#F7F2EA] hover:bg-[#EFE7DC] text-[#33251E] disabled:opacity-40 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
      </button>
    `;

    for (let p = 1; p <= totalPages; p++) {
      const active = p === studentCurrentPage;
      pagesHtml += `
        <button type="button" onclick="changeStudentPage(${p})" 
                class="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm transition ${active ? 'btn-3d bg-[#261710] text-white shadow-xs' : 'btn-3d-secondary border border-[#E4DACF] bg-[#FAF7F2] text-[#33251E]'}">
          ${p}
        </button>
      `;
    }

    pagesHtml += `
      <button type="button" onclick="changeStudentPage(${studentCurrentPage + 1})" ${studentCurrentPage === totalPages ? 'disabled' : ''}
              class="btn-3d-secondary w-8 h-8 flex items-center justify-center rounded-lg border border-[#E4DACF] bg-[#FAF7F2] hover:bg-[#EDE5DA] text-[#33251E] disabled:opacity-40 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
      </button>
    `;

    paginationControls.innerHTML = pagesHtml;
  }
}

window.changeStudentPage = function(page) {
  studentCurrentPage = page;
  renderStudentsTable();
};

function updateAdminControlsInStudents(isLoggedIn) {
  const adminToolsContainer = document.getElementById('admin-student-tools');
  if (adminToolsContainer) {
    if (isLoggedIn) {
      adminToolsContainer.classList.remove('hidden');
    } else {
      adminToolsContainer.classList.add('hidden');
    }
  }

  // Hide header "Enroll Now" button for logged-in admin
  const headerEnrollBtn = document.getElementById('header-enroll-btn');
  if (headerEnrollBtn) {
    if (isLoggedIn) {
      headerEnrollBtn.classList.add('hidden');
    } else {
      headerEnrollBtn.classList.remove('hidden');
    }
  }
}

/* ==========================================================================
   5. Student Fee History Modal Controller (Month-by-Month Dynamic Ledger)
   ========================================================================== */

let activeModalStudentId = null;

window.openStudentModal = function(studentId) {
  const store = window.SSCStore || window.StudentsStore;
  const student = (store.getStudentById ? store.getStudentById(studentId) : null) || (store.getById ? store.getById(studentId) : null);
  if (!student) return;

  activeModalStudentId = student.id;

  const modal = document.getElementById('fee-history-modal');
  const avatar = document.getElementById('modal-avatar');
  const name = document.getElementById('modal-student-name');
  const sub = document.getElementById('modal-student-sub');
  const classBadge = document.getElementById('modal-class-badge');
  const contact = document.getElementById('modal-phone');
  const joinDate = document.getElementById('modal-joining-date');
  const monthlyFeeEl = document.getElementById('modal-monthly-fee');
  const advancePaidEl = document.getElementById('modal-advance-paid');
  const advanceDateEl = document.getElementById('modal-advance-date');
  const ledgerBody = document.getElementById('modal-ledger-body');
  const totalPaidEl = document.getElementById('modal-total-paid');
  const totalDueEl = document.getElementById('modal-due-amount');
  const recordPaymentBtn = document.getElementById('modal-record-payment-btn');

  const formattedJoiningDate = (window.formatISODateDisplay && typeof window.formatISODateDisplay === 'function')
    ? window.formatISODateDisplay(student.joiningDate)
    : student.joiningDate;

  const formattedAdvanceDate = (window.formatISODateDisplay && typeof window.formatISODateDisplay === 'function')
    ? window.formatISODateDisplay(student.advanceDate || student.joiningDate)
    : (student.advanceDate || student.joiningDate);

  if (name) name.textContent = student.name;
  if (avatar) avatar.textContent = student.name.charAt(0);
  if (sub) sub.textContent = `${student.class} • ${student.school || 'Enrolled in Tuition'} • Roll: ${student.rollNo || ('SSC-' + student.id)}`;
  if (classBadge) classBadge.textContent = student.class;
  if (contact) contact.textContent = student.phone;
  if (joinDate) joinDate.textContent = formattedJoiningDate;
  if (monthlyFeeEl) monthlyFeeEl.textContent = `₹${Number(student.monthlyFee || 0).toLocaleString()}`;
  if (advancePaidEl) advancePaidEl.textContent = `₹${Number(student.advanceAmount || 0).toLocaleString()}`;
  if (advanceDateEl) advanceDateEl.textContent = Number(student.advanceAmount || 0) > 0 ? formattedAdvanceDate : '—';

  // Generate month-by-month ledger starting from joining_date up to current month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1 to 12

  // Determine starting month and year from joiningDate
  let startYear = currentYear;
  let startMonth = 1;
  if (student.joiningDate) {
    if (student.joiningDate.includes('-')) {
      const parts = student.joiningDate.split('-').map(Number);
      startYear = parts[0] || currentYear;
      startMonth = parts[1] || 1;
    } else {
      const d = new Date(student.joiningDate);
      if (!isNaN(d.getTime())) {
        startYear = d.getFullYear();
        startMonth = d.getMonth() + 1;
      }
    }
  }

  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const ledgerRows = [];
  let totalPaidSum = 0;
  let totalDueSum = 0;

  let y = startYear;
  let m = startMonth;
  const monthlyFee = Number(student.monthlyFee || 1200);

  while (y < currentYear || (y === currentYear && m <= currentMonth)) {
    const monthLabel = `${monthNamesShort[m - 1]} ${y}`;
    
    // Check feeHistory for payments matching this (y, m)
    const monthPayments = (student.feeHistory || []).filter(p => {
      if (Number(p.year) === y && Number(p.month) === m) return true;
      if (typeof p.month === 'string' && (p.month.includes(monthNamesShort[m - 1]) || p.month === `${y}-${String(m).padStart(2, '0')}`)) {
        return true;
      }
      return false;
    });

    if (monthPayments.length > 0) {
      const paidForMonth = monthPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const latestPayment = monthPayments[monthPayments.length - 1];
      const paidDate = latestPayment.date ? ((window.formatISODateDisplay) ? window.formatISODateDisplay(latestPayment.date) : latestPayment.date) : '—';
      const mode = latestPayment.mode || 'UPI';
      const balance = Math.max(0, monthlyFee - paidForMonth);

      totalPaidSum += paidForMonth;
      totalDueSum += balance;

      let statusBadge = '';
      if (balance === 0) {
        statusBadge = `<span class="badge-3d-paid inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Paid</span>`;
      } else {
        statusBadge = `<span class="badge-3d-half inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Half Paid (Bal: ₹${balance})</span>`;
      }

      ledgerRows.push({
        month: monthLabel,
        amount: `₹${paidForMonth.toLocaleString()}`,
        date: paidDate,
        mode: mode,
        statusHtml: statusBadge,
        isCurrentMonth: (y === currentYear && m === currentMonth)
      });
    } else {
      // Unpaid month up to current month
      totalDueSum += monthlyFee;
      const statusBadge = `<span class="badge-3d-unpaid inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Unpaid</span>`;

      ledgerRows.push({
        month: monthLabel,
        amount: `₹${monthlyFee.toLocaleString()}`,
        date: '—',
        mode: '—',
        statusHtml: statusBadge,
        isCurrentMonth: (y === currentYear && m === currentMonth)
      });
    }

    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }

  if (totalPaidEl) totalPaidEl.textContent = `₹${totalPaidSum.toLocaleString()}`;
  if (totalDueEl) totalDueEl.textContent = `₹${totalDueSum.toLocaleString()}`;

  if (ledgerBody) {
    if (ledgerRows.length === 0) {
      ledgerBody.innerHTML = `
        <tr><td colspan="5" class="py-6 text-center text-stone-500 font-medium">No months due or logged yet.</td></tr>
      `;
    } else {
      ledgerBody.innerHTML = ledgerRows.map(r => `
        <tr class="row-float-3d border-b border-[#F1EAE1] ${r.isCurrentMonth ? 'bg-amber-50/50 font-semibold' : ''}">
          <td class="py-3 px-3.5 font-bold text-brand-dark flex items-center gap-1.5">
            ${r.month}
            ${r.isCurrentMonth ? '<span class="text-[9px] uppercase tracking-wider bg-amber-200/90 text-amber-900 px-1.5 py-0.5 rounded font-extrabold shadow-2xs">Current</span>' : ''}
          </td>
          <td class="py-3 px-3.5 font-bold text-brand-dark">${r.amount}</td>
          <td class="py-3 px-3.5 text-stone-600 font-medium">${r.date}</td>
          <td class="py-3 px-3.5 text-stone-600">${r.mode}</td>
          <td class="py-3 px-3.5 text-right">${r.statusHtml}</td>
        </tr>
      `).join('');
    }
  }

  // Admin controls inside modal
  const isAdmin = window.AdminAuth && window.AdminAuth.isLoggedIn();
  if (recordPaymentBtn) {
    if (isAdmin) recordPaymentBtn.classList.remove('hidden');
    else recordPaymentBtn.classList.add('hidden');
  }

  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
};

window.closeStudentModal = function() {
  const modal = document.getElementById('fee-history-modal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = 'auto';
  activeModalStudentId = null;
};

// Admin Payment Record Modal Trigger
window.promptRecordPayment = function() {
  if (!activeModalStudentId) return;
  if (typeof openRecordPaymentModal === 'function') {
    openRecordPaymentModal(activeModalStudentId);
  }
};

/* ==========================================================================
   6. Student Enrollment Form Controller
   ========================================================================== */

function initEnrollmentForm() {
  const form = document.getElementById('enrollmentForm');
  const phoneInput = document.getElementById('phoneNumber');
  const modal = document.getElementById('successModal');
  const modalDialog = document.getElementById('modalDialog');
  const closeModalBtn = document.getElementById('closeModalBtn');

  if (!form || !phoneInput) return;

  // Restrict phone to numeric
  phoneInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    clearFieldError(phoneInput);
  });

  const inputs = form.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('input', () => clearFieldError(input));
    input.addEventListener('change', () => clearFieldError(input));
  });

  function markFieldError(inputEl, customMsg = null) {
    inputEl.classList.add('!border-red-500', 'bg-red-50/30');
    const container = inputEl.closest('div');
    const errorMsg = container.parentElement.querySelector('.error-msg') || container.querySelector('.error-msg');
    if (errorMsg) {
      if (customMsg) errorMsg.textContent = customMsg;
      errorMsg.classList.remove('hidden');
    }
  }

  function clearFieldError(inputEl) {
    inputEl.classList.remove('!border-red-500', 'bg-red-50/30');
    const container = inputEl.closest('div');
    const errorMsg = container.parentElement.querySelector('.error-msg') || container.querySelector('.error-msg');
    if (errorMsg) {
      errorMsg.classList.add('hidden');
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let isValid = true;

    inputs.forEach(input => {
      if (input.hasAttribute('required')) {
        if (!input.value.trim()) {
          markFieldError(input);
          isValid = false;
        } else {
          clearFieldError(input);
        }
      }
    });

    const phoneVal = phoneInput.value.trim();
    if (phoneVal.length < 10) {
      markFieldError(phoneInput, 'Please enter a valid 10-digit mobile number');
      isValid = false;
    }

    if (isValid) {
      const studentName = document.getElementById('studentName').value;
      const studentClass = document.getElementById('studentClass').value;
      const boardSelect = document.getElementById('boardSelect').value;
      const subjectSelect = document.getElementById('subjectSelect').value;
      const schoolName = document.getElementById('schoolName')?.value || '';
      const motherName = document.getElementById('motherName')?.value || '';
      const fatherName = document.getElementById('fatherName')?.value || '';

      // Dispatch to DatabaseService & Supabase
      let generatedReqId = 'SSC-ENR-2026-' + Math.floor(1000 + Math.random() * 9000);
      if (window.DatabaseService) {
        try {
          const res = await window.DatabaseService.submitEnrollment({
            studentName: studentName,
            studentClass: studentClass,
            schoolName: schoolName,
            motherName: motherName,
            fatherName: fatherName,
            parentPhone: phoneVal,
            board: boardSelect,
            selectedStream: subjectSelect
          });
          if (res && res.requestId) {
            generatedReqId = res.requestId;
          }
        } catch (err) {
          console.warn('Error submitting to DatabaseService:', err);
        }
      }

      // Populate Success Modal
      const confirmPhone = document.getElementById('confirmPhone');
      const summaryName = document.getElementById('summaryName');
      const summaryClass = document.getElementById('summaryClass');
      const summarySubject = document.getElementById('summarySubject');
      const summaryReqId = document.getElementById('summaryReqId');

      if (summaryReqId) summaryReqId.textContent = generatedReqId;
      if (confirmPhone) confirmPhone.textContent = phoneVal;
      if (summaryName) summaryName.textContent = studentName;
      if (summaryClass) summaryClass.textContent = `${studentClass} (${boardSelect})`;
      if (summarySubject) summarySubject.textContent = subjectSelect;

      if (modal && modalDialog) {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        modalDialog.classList.remove('scale-95');
        modalDialog.classList.add('scale-100');
      }

      form.reset();
    }
  });

  const closeModal = () => {
    if (modal && modalDialog) {
      modal.classList.add('opacity-0', 'pointer-events-none');
      modalDialog.classList.remove('scale-100');
      modalDialog.classList.add('scale-95');
    }
  };

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
}

/* ==========================================================================
   7. Admin Portal Controller
   - Tab switching (Login & Register with indicator arrows)
   - Password Visibility Toggle
   - Admin Login, Registration Request, and Password Reset Flow
   ========================================================================== */

function initAdminPortal() {
  const loginForm = document.getElementById('admin-login-form');
  const registerForm = document.getElementById('admin-register-form');
  const forgotForm = document.getElementById('forgot-password-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const rememberMe = document.getElementById('remember-me')?.checked || false;
      const submitBtn = document.getElementById('btn-login-submit');

      const originalHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Verifying Credentials...</span>
      `;

      const result = await window.AdminAuth.login(username, password, rememberMe);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHtml;

      if (result.success) {
        showGlobalToast(`Welcome back, ${result.user.name}! Administrative privileges active.`, true);
        updateAdminBanner(true, result.user);
        loginForm.reset();
        // Activate Admin Dashboard view
        if (window.AdminDashboard) {
          window.AdminDashboard.switchTab('overview');
        }
      } else {
        showGlobalToast(result.message || 'Authentication failed.', false);
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const phone = document.getElementById('reg-phone').value;
      const password = document.getElementById('reg-password').value;
      const submitBtn = document.getElementById('btn-reg-submit');

      const originalHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Submitting Request...</span>
      `;

      const result = await window.AdminAuth.registerRequest(name, email, phone, password);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHtml;

      if (result.success) {
        showGlobalToast(result.message, true);
        registerForm.reset();
        setTimeout(() => switchAuthTab('login'), 2000);
      } else {
        showGlobalToast(result.message, false);
      }
    });
  }

  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('reset-email').value;
      const submitBtn = document.getElementById('btn-reset-submit');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerText = 'Dispatching...';

      await window.AdminAuth.requestPasswordReset(email);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

      const successAlert = document.getElementById('reset-success-alert');
      if (successAlert) successAlert.classList.remove('hidden');

      setTimeout(() => {
        closeForgotPasswordModal();
      }, 2500);
    });
  }

  // Update banner if already logged in
  if (window.AdminAuth && window.AdminAuth.isLoggedIn()) {
    updateAdminBanner(true, window.AdminAuth.getCurrentUser());
  }
}

function updateAdminBanner(isLoggedIn, user) {
  const banner = document.getElementById('active-admin-banner');
  const userText = document.getElementById('active-admin-user-text');
  if (!banner) return;

  if (isLoggedIn && user) {
    banner.classList.remove('hidden');
    if (userText) userText.textContent = `${user.name} (${user.title || 'Director'})`;
  } else {
    banner.classList.add('hidden');
  }
}

window.adminLogout = function() {
  if (window.AdminAuth) {
    sessionStorage.setItem('ssc_admin_explicit_logout', 'true');
    window.AdminAuth.logout();
    updateAdminBanner(false);
    showGlobalToast('Signed out of Admin session.');
  }
};

window.quickDirectorLogin = function() {
  showGlobalToast('Please enter your authorized credentials to log in.', false);
};

window.switchAuthTab = function(targetTab) {
  const loginTab = document.getElementById('tab-login');
  const registerTab = document.getElementById('tab-register');
  const loginArrow = document.getElementById('login-arrow');
  const registerArrow = document.getElementById('register-arrow');
  const loginSection = document.getElementById('login-section');
  const registerSection = document.getElementById('register-section');

  if (!loginTab || !registerTab) return;

  if (targetTab === 'login') {
    loginTab.className = 'relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 bg-brand-espresso text-white shadow-sm';
    registerTab.className = 'relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium text-brand-espresso/80 hover:text-brand-espresso transition-all duration-200';
    if (loginArrow) loginArrow.classList.remove('hidden');
    if (registerArrow) registerArrow.classList.add('hidden');
    if (loginSection) loginSection.classList.remove('hidden');
    if (registerSection) registerSection.classList.add('hidden');
  } else {
    registerTab.className = 'relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 bg-brand-espresso text-white shadow-sm';
    loginTab.className = 'relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium text-brand-espresso/80 hover:text-brand-espresso transition-all duration-200';
    if (registerArrow) registerArrow.classList.remove('hidden');
    if (loginArrow) loginArrow.classList.add('hidden');
    if (registerSection) registerSection.classList.remove('hidden');
    if (loginSection) loginSection.classList.add('hidden');
  }
};

window.togglePasswordVisibility = function(inputId, iconId) {
  const inputEl = document.getElementById(inputId);
  const iconEl = document.getElementById(iconId);
  if (!inputEl || !iconEl) return;

  if (inputEl.type === 'password') {
    inputEl.type = 'text';
    iconEl.innerHTML = `
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    `;
  } else {
    inputEl.type = 'password';
    iconEl.innerHTML = `
      <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>
    `;
  }
};

window.openForgotPasswordModal = function() {
  const modal = document.getElementById('forgot-password-modal');
  const modalContent = document.getElementById('forgot-modal-content');
  if (!modal || !modalContent) return;

  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    modal.classList.add('opacity-100');
    modalContent.classList.remove('scale-95');
    modalContent.classList.add('scale-100');
  }, 10);
};

window.closeForgotPasswordModal = function() {
  const modal = document.getElementById('forgot-password-modal');
  const modalContent = document.getElementById('forgot-modal-content');
  if (!modal || !modalContent) return;

  modal.classList.remove('opacity-100');
  modal.classList.add('opacity-0');
  modalContent.classList.remove('scale-100');
  modalContent.classList.add('scale-95');
  setTimeout(() => {
    modal.classList.add('hidden');
    const resetAlert = document.getElementById('reset-success-alert');
    if (resetAlert) resetAlert.classList.add('hidden');
    const form = document.getElementById('forgot-password-form');
    if (form) form.reset();
  }, 200);
};

/* ==========================================================================
   8. Global Toasts & Keyboard Modals Handler
   ========================================================================== */

function initModalListeners() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeStudentModal();
      closeForgotPasswordModal();
    }
  });
}

function showGlobalToast(message, isSuccess = true) {
  let toast = document.getElementById('global-status-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-status-toast';
    toast.className = 'fixed bottom-6 right-6 z-50 transform translate-y-24 opacity-0 transition-all duration-300 pointer-events-none';
    toast.innerHTML = `
      <div class="bg-brand-dark text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 max-w-md">
        <div class="w-6 h-6 rounded-full shrink-0 flex items-center justify-center" id="global-toast-icon"></div>
        <p class="text-xs sm:text-sm font-medium" id="global-toast-msg"></p>
      </div>
    `;
    document.body.appendChild(toast);
  }

  const toastMsg = document.getElementById('global-toast-msg');
  const toastIcon = document.getElementById('global-toast-icon');

  if (toastMsg) toastMsg.textContent = message;

  if (toastIcon) {
    if (isSuccess) {
      toastIcon.className = 'w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0';
      toastIcon.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;
    } else {
      toastIcon.className = 'w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0';
      toastIcon.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
    }
  }

  toast.classList.remove('translate-y-24', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-24', 'opacity-0');
  }, 4000);
}

window.showToast = showGlobalToast;
window.showGlobalToast = showGlobalToast;
