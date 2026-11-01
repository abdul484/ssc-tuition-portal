# SSC (Students Study Circle) Tuition Management Portal

A full-featured, responsive web application and administration portal for **SSC Students Study Circle** — an academic coaching institute serving students from LKG through Class 10. Built with high-performance Vanilla JavaScript, modern tactile 3D physical styling, a reactive single-source-of-truth state architecture, and bidirectional Supabase PostgreSQL cloud synchronization.

---

## 🛠️ Technology Stack

* **Frontend Architecture:** Semantic HTML5, Vanilla JavaScript (ES6+ modules and controllers), Single Page Application (SPA) hash router with browser history integration (`popstate` / `hashchange`).
* **Styling & UI System:** Tailwind CSS utility framework supplemented with a bespoke **Obsidian Scholastic** 3D physical design system (`custom.css`). Features physical keycap depth, layered elevation shadows, responsive KPI grids, and smooth active press micro-interactions.
* **State Management:** Custom reactive Central Store (`SSCStore`) implementing an event-driven pub/sub architecture with instant local caching and cloud sync hooks.
* **Backend & Cloud Database:** **Supabase PostgreSQL** with 8 structured tables, custom constraints, and Row Level Security (RLS) policies.
* **Communication & Dispatches:** Direct WhatsApp Business Integration (`wa.me` deep linking) for automated tuition fee receipts, parent notifications, and physical textbook reservation inquiries.

---

## 🌟 Core Modules & Capabilities

### 1. Public Visitor Portal & SPA Router
* **Instant Page Navigation:** Unified single-page experience supporting `Home`, `About`, `Books`, `Students`, `Classes`, and `Admin` views with seamless tab transitions and accessible mobile drawer navigation.
* **Academic Highlights:** Hero metrics, institutional methodology, 3-hour daily tuition structure (Instruction $\rightarrow$ Guided Practice $\rightarrow$ Homework Clearing), and parent testimonials.

### 2. Classes & Academic Curriculum (LKG to Class 10)
* **Tiered Class Catalog:** Comprehensive grade cards covering foundational learning (LKG/UKG) through secondary board preparation (Classes 1–10).
* **Direct Class Enrollment:** One-click integration linking specific class cards directly to the enrollment application with pre-selected grade parameters.

### 3. Student Management Workspace
* **Real-Time Grade Counters:** Dynamic top badge pills computing student distribution across grades (LKG, UKG, 1st through 10th Class).
* **Live Search & Multi-Criteria Filtering:** Sub-millisecond filtering by student name, contact number, school, grade, and fee payment status (`Paid`, `Half Paid`, `Pending`).
* **Student Record Modal:** Form dialog for adding and modifying student details with strict 10-digit mobile verification, joining dates, and school affiliations.

### 4. Month-Wise Tuition Fee Ledger
* **12-Month Financial Ledger:** Dedicated monthly ledger tabs (Jan through Dec) with auto-derived payment due dates calculated from student admission days.
* **Multi-Tier Payment Tracking:** Real-time ledger tracking for Full Payments, Partial/Installment payments, and outstanding balances.
* **1-Click WhatsApp Receipts:** Generates formatted fee confirmation receipts with unique transaction reference numbers and dispatches them directly to parents via WhatsApp.
* **Payment Reminders:** Instant WhatsApp payment reminder generation for outstanding student dues.

### 5. Books & Digital Notes Catalog
* **Physical Textbooks:** Curriculum-aligned textbooks with physical 3D book hover effects and WhatsApp inquiry integration.
* **Multi-Book Inquiry Tray:** Dynamic selection drawer calculating consolidated estimated totals for multi-item reservations.
* **Free Downloadable Study Materials:** Direct PDF downloads for class formula sheets, revision summaries, and sample exam papers with client-side fallback generation.

### 6. Online Enrollment Engine & Admin Conversion
* **Public Admission Form:** Structured student registration capturing student details, parent names, contact information, school, board (State / CBSE / ICSE), and subject preferences.
* **1-Click Conversion:** Administrators can review online applications in real time and approve them into active students with a single click, instantly provisioning ledger accounts.

### 7. Secure Admin Control Center
* **Role-Based Access Control:** Dedicated Director and Staff authentication with persistent session validation and protected administration views.
* **Real-Time KPI Dashboards:** 3D tactile stat cards tracking Active Students, Pending Enrollments, Monthly Fee Collections, and Books Catalog metrics.
* **Recycle Bin & Safe Recovery:** Soft-deletion safeguard for student profiles, classes, and books with full restore capability.

---

## 📂 Project Directory Structure

```
SSC WEBSITE/
├── index.html                    # Unified master application portal
├── about.html                    # Standalone About view
├── books.html                    # Standalone Books & Study Materials view
├── classes.html                  # Standalone Classes & Curriculum view
├── students.html                 # Standalone Student Directory view
├── enrollment.html               # Standalone Enrollment Application view
├── admin.html                    # Standalone Admin Portal view
├── supabase_schema.sql           # Complete PostgreSQL schema (8 tables, RLS policies, seeds)
├── README.md                     # Technical documentation & project setup guide
├── assets/
│   ├── css/
│   │   └── custom.css            # 3D physical styling, KPI cards, animations, print rules
│   ├── js/
│   │   ├── app.js                # Core frontend router and public view controller
│   │   ├── ssc-store.js          # Centralized reactive data store & business logic
│   │   ├── admin-dashboard.js    # Administrative dashboard, KPI cards, ledger tabs
│   │   ├── admin-modals.js       # Modals for student management, fee payments & receipts
│   │   ├── admin-auth.js         # Authentication, session manager & navigation guards
│   │   ├── db-service.js         # Bidirectional Supabase PostgreSQL cloud synchronization
│   │   ├── supabase-config.js    # Supabase cloud credentials & connection initialization
│   │   ├── students-data.js      # Initial student dataset & default mock configurations
│   │   └── books-data.js         # Books catalog definitions & downloadable assets
│   ├── images/
│   │   ├── ssc_logo.png          # Primary institute logo
│   │   ├── hero_student_desk.png # Hero section educational visual
│   │   └── ...                   # Brand assets and illustrations
│   └── downloads/
│       ├── SSC_Class_6_Mathematics_Sample_Notes.pdf
│       ├── SSC_Class_5_English_Grammar_Sample.pdf
│       ├── SSC_Class_7_Science_Revision_Notes.pdf
│       └── SSC_Tuition_Curriculum_and_Syllabus.pdf
└── scripts/
    ├── create_sample_pdfs.py     # Local PDF generation utility
    └── download_assets.py        # Static asset fetcher utility
```

---

## 🚀 Local Development Setup

The application is engineered as a zero-dependency static web application and requires no build step.

### Quick Start with Python (Recommended)

1. Clone or download the repository to your local machine:
   ```bash
   git clone https://github.com/your-username/ssc-tuition-management.git
   cd ssc-tuition-management
   ```

2. Start a local HTTP server:
   ```powershell
   python -m http.server 3000 --bind 127.0.0.1
   ```

3. Open your browser and navigate to:
   * **Main Portal:** [http://127.0.0.1:3000/](http://127.0.0.1:3000/)
   * **Admin Dashboard:** [http://127.0.0.1:3000/#admin](http://127.0.0.1:3000/#admin)

### Alternative Local Servers

* **Node.js (`npx serve`):**
  ```bash
  npx serve . -p 3000
  ```
* **VS Code Live Server:** Right-click `index.html` and select **"Open with Live Server"**.

---

## ☁️ Supabase Cloud Database Configuration

The application includes an offline-first architecture with automatic failover to local persistence if no cloud database is connected. To connect your production Supabase PostgreSQL instance:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Execute the full script from [`supabase_schema.sql`](supabase_schema.sql). This configures:
   * `students` — Active student records, grades, parent details, and monthly tuition dues.
   * `fee_records` — Granular transaction logs supporting partial payments and receipt IDs.
   * `enrollment_requests` — Prospective admission submissions.
   * `books` — Physical textbook catalog with pricing and stock levels.
   * `classes` — Active tuition grades and batch timings.
   * `staff_members` — Authorized educators and administrators.
   * `recycle_bin` — Soft-delete archive for records recovery.
   * `admin_notifications` — System notifications and alerts.
   * **Row Level Security (RLS)** — Secure role-based read/write policies.
4. Configure your credentials in [`assets/js/supabase-config.js`](assets/js/supabase-config.js):
   ```javascript
   window.SSC_CONFIG = {
     SUPABASE_URL: "https://your-project-id.supabase.co",
     SUPABASE_ANON_KEY: "your-anon-public-key",
     INSTITUTION_NAME: "SSC Students Study Circle",
     DIRECTOR_EMAIL: "admin@sscstudycircle.com",
     WHATSAPP_NUMBER: "918919961354"
   };
   ```

---

## 🔐 Administrator Access

* Default administrative access can be initialized or managed from the Admin tab.
* Form validation enforces authenticated sessions before modifying student records, recording fee collections, or altering curriculum pricing.
* The header "Enroll Now" call-to-action automatically suppresses on administrative tabs to maximize workspace visibility.

---

## 📄 License & Institutional Attribution

Developed for **SSC Students Study Circle**, providing quality education and academic foundation from LKG through Class 10. All rights reserved.
