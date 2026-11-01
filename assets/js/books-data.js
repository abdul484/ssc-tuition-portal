/**
 * SSC Students Study Circle - Books & Study Materials Data Module
 * - Free downloadable PDFs and revision materials
 * - Direct WhatsApp inquiry for physical textbooks
 * - Transparent pricing and class-wise curriculum references
 */

const WHATSAPP_CENTER_PHONE = '918919961354'; // SSC Tuition Center Official WhatsApp (+91 8919961354)

const BOOKS_CATALOG = [
  {
    id: 'B01',
    title: 'Mathematics',
    class: '6th Class',
    gradeFilter: '6th Class',
    badge: 'SSC Series',
    price: 280,
    type: 'paid',
    colorScheme: 'from-[#1E6091] via-[#1A759F] to-[#52B69A]',
    accentColor: '#16425B',
    titleColor: 'text-yellow-300',
    description: 'Comprehensive chapter explanations, solved arithmetic, geometry diagrams, and 500+ practice questions.',
    inclusions: 'SSC Series • NCERT & State Board Aligned',
    mockupIcons: ['π', 'x²'],
    subtitle: 'Mathematics'
  },
  {
    id: 'B02',
    title: 'English',
    class: '5th Class',
    gradeFilter: '5th Class',
    badge: 'SSC Readers',
    price: 250,
    type: 'paid',
    colorScheme: 'from-[#40916C] via-[#52B788] to-[#95D5B2]',
    accentColor: '#2D6A4F',
    titleColor: 'text-white',
    description: 'Interactive grammar rules, reading comprehension stories, vocabulary lists, and creative writing prompts.',
    inclusions: 'SSC Readers • Grammar & Stories',
    mockupIcons: ['📚', '✍️'],
    subtitle: 'Grammar & Stories'
  },
  {
    id: 'B03',
    title: 'Science',
    class: '7th Class',
    gradeFilter: '7th Class',
    badge: 'SSC Explorer',
    price: 320,
    type: 'paid',
    colorScheme: 'from-[#1B263B] via-[#0D1B2A] to-[#415A77]',
    accentColor: '#0D1B2A',
    titleColor: 'text-cyan-300',
    description: 'Concepts in Physics, Chemistry and Biology with illustrated laboratory activities and experiment guides.',
    inclusions: 'SSC Explorer • Physics & Bio',
    mockupIcons: ['🪐', '✨'],
    subtitle: 'Physics & Bio'
  },
  {
    id: 'B04',
    title: 'Practice Worksheets',
    edition: '(Set of 5)',
    class: 'All Classes',
    gradeFilter: 'All Classes',
    badge: 'SSC Activity',
    price: 150,
    type: 'paid',
    isSpiral: true,
    colorScheme: 'from-[#78543E] to-[#4A3B32]',
    accentColor: '#3A2416',
    titleColor: 'text-brand-dark',
    description: 'Weekly homework & revision booklets across Maths, Science, and English for regular test practice.',
    inclusions: '5 Spiral Booklets • Comprehensive Exercise',
    mockupIcons: ['💡', '📝'],
    subtitle: '5 Booklets Set'
  },
  {
    id: 'B05',
    title: 'Maths & Science Foundation',
    class: '4th Class',
    gradeFilter: '4th Class',
    badge: 'Foundation Series',
    price: 240,
    type: 'paid',
    colorScheme: 'from-[#D97706] via-[#B45309] to-[#92400E]',
    accentColor: '#78350F',
    titleColor: 'text-amber-100',
    description: 'Early foundational concepts in fractions, measurements, animal habitats, and daily scientific thinking.',
    inclusions: 'SSC Foundation • Illustrated',
    mockupIcons: ['📐', '🌱'],
    subtitle: 'Concepts & Worksheets'
  },
  {
    id: 'B06',
    title: 'Social Studies & GK',
    class: '3rd Class',
    gradeFilter: '3rd Class',
    badge: 'Discovery Series',
    price: 220,
    type: 'paid',
    colorScheme: 'from-[#0284C7] via-[#0369A1] to-[#075985]',
    accentColor: '#0C4A6E',
    titleColor: 'text-sky-100',
    description: 'Our environment, maps, community helpers, and Indian heritage with colourful charts and quizzes.',
    inclusions: 'Discovery Series • Colour Edition',
    mockupIcons: ['🌍', '🏛️'],
    subtitle: 'Environment & Maps'
  },
  {
    id: 'B00',
    title: 'Phonics & Early Numbers Activity Book',
    class: 'LKG & UKG',
    gradeFilter: 'LKG & UKG',
    badge: 'Early Years',
    price: 180,
    type: 'paid',
    colorScheme: 'from-[#EC4899] via-[#DB2777] to-[#BE185D]',
    accentColor: '#9D174D',
    titleColor: 'text-pink-100',
    description: 'Alphabet letter sounds, number tracing (1-50), picture recognition, and fine motor coloring exercises.',
    inclusions: 'Kindergarten Series • Colour Edition',
    mockupIcons: ['🎨', '🔤'],
    subtitle: 'Phonics & Tracing'
  },
  {
    id: 'B07',
    title: 'Language & Grammar Primer',
    class: '2nd Class',
    gradeFilter: '2nd Class',
    badge: 'Primary Series',
    price: 190,
    type: 'paid',
    colorScheme: 'from-[#E11D48] via-[#BE123C] to-[#9F1239]',
    accentColor: '#881337',
    titleColor: 'text-rose-100',
    description: 'Phonics, sentence formation, reading fluency, handwriting improvement, and fun word games for young learners.',
    inclusions: 'Primary Series • Phonics & Writing',
    mockupIcons: ['✏️', '📖'],
    subtitle: 'Phonics & Writing'
  },
  {
    id: 'B08',
    title: 'Comprehensive Question Bank',
    class: '6th & 7th Class',
    gradeFilter: '7th Class',
    badge: 'Master Prep',
    price: 350,
    type: 'paid',
    colorScheme: 'from-[#6B21A8] via-[#581C87] to-[#3B0764]',
    accentColor: '#3B0764',
    titleColor: 'text-purple-200',
    description: 'Previous examination papers, chapter-wise mock tests, model solutions, and time-management tips.',
    inclusions: 'Master Prep • Test Series Papers',
    mockupIcons: ['🎯', '🏆'],
    subtitle: 'Solved Model Papers'
  },
  {
    id: 'B09',
    title: 'Class 10 Board Exam Mastery & Formula Handbook',
    class: '10th Class',
    gradeFilter: '10th Class',
    badge: 'Board Excellence',
    price: 390,
    type: 'paid',
    colorScheme: 'from-[#0F172A] via-[#1E293B] to-[#334155]',
    accentColor: '#0F172A',
    titleColor: 'text-amber-300',
    description: 'Comprehensive formula compendium, solved board questions (CBSE & State Boards), and revision shortcuts.',
    inclusions: 'Board Series • Top Score Companion',
    mockupIcons: ['⭐', '🎓'],
    subtitle: 'Board Exam Companion'
  }
];

// Free downloadable study resources with verified local PDFs
const FREE_STUDY_MATERIALS = [
  {
    id: 'FM01',
    title: 'Class 6 Mathematics - Key Concepts & Formula Sheet',
    class: '6th Class',
    format: 'PDF (Free)',
    size: '1.5 KB',
    description: 'Quick reference formula booklet covering integers, whole numbers, prime factorization, and geometry basics.',
    downloadPath: 'assets/downloads/SSC_Class_6_Mathematics_Sample_Notes.pdf',
    badge: 'Free Download'
  },
  {
    id: 'FM02',
    title: 'Class 5 English - Grammar Essentials & Vocabulary Guide',
    class: '5th Class',
    format: 'PDF (Free)',
    size: '1.5 KB',
    description: 'Essential rules for parts of speech, tense structures, sentence diagrams, and 50 important vocabulary words.',
    downloadPath: 'assets/downloads/SSC_Class_5_English_Grammar_Sample.pdf',
    badge: 'Free Download'
  },
  {
    id: 'FM03',
    title: 'Class 7 Science - Quick Revision Summary & Diagrams',
    class: '7th Class',
    format: 'PDF (Free)',
    size: '1.4 KB',
    description: 'Concise summary of plant nutrition, digestive system, heat transfer laws, and acids/bases chemical indicators.',
    downloadPath: 'assets/downloads/SSC_Class_7_Science_Revision_Notes.pdf',
    badge: 'Free Download'
  },
  {
    id: 'FM04',
    title: 'SSC Comprehensive Tuition Curriculum & Yearly Routine',
    class: 'All Classes (LKG to Class 10)',
    format: 'PDF (Free)',
    size: '1.4 KB',
    description: 'Full academic calendar, daily routine (5:00 PM – 7:30 PM regular, extended up to 8:30 PM for activities), and mentoring methodology.',
    downloadPath: 'assets/downloads/SSC_Tuition_Curriculum_and_Syllabus.pdf',
    badge: 'Free Download'
  }
];

// WhatsApp Link Generator for Single Physical Book Inquiry
function getWhatsAppInquiryUrl(bookTitle, classGrade, price) {
  const text = `Hello SSC Students Study Circle!\n\nI would like to inquire about purchasing the following physical book for tuition:\n📖 *${bookTitle}* (${classGrade})\n💰 Price: ₹${price}\n\nPlease let me know if it is available for local pickup at the center.\n\nThank you!`;
  return `https://wa.me/${WHATSAPP_CENTER_PHONE}?text=${encodeURIComponent(text)}`;
}

// WhatsApp Link Generator for Multiple Selected Books
function getWhatsAppMultiOrderUrl(items) {
  if (!items || items.length === 0) {
    const defaultText = `Hello SSC Students Study Circle! I would like to inquire about book availability at the tuition center.`;
    return `https://wa.me/${WHATSAPP_CENTER_PHONE}?text=${encodeURIComponent(defaultText)}`;
  }

  let text = `Hello SSC Students Study Circle!\n\nI would like to reserve the following study books for pickup at the center:\n`;
  let total = 0;
  items.forEach((item, idx) => {
    const qty = item.qty || 1;
    const subtotal = item.price * qty;
    total += subtotal;
    text += `\n${idx + 1}. *${item.title}* (${item.class}) x ${qty} = ₹${subtotal}`;
  });
  text += `\n\n*Total Estimated Amount: ₹${total}*\nPlease confirm availability and pickup timings.`;

  return `https://wa.me/${WHATSAPP_CENTER_PHONE}?text=${encodeURIComponent(text)}`;
}

// Global Export
window.BooksData = {
  catalog: BOOKS_CATALOG,
  freeMaterials: FREE_STUDY_MATERIALS,
  getWhatsAppInquiryUrl,
  getWhatsAppMultiOrderUrl,
  centerPhone: WHATSAPP_CENTER_PHONE
};
