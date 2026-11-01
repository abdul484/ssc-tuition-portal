import os

def create_simple_pdf(filename, title, content_lines):
    content_stream = "BT\n/F1 18 Tf\n50 750 Td\n(" + title + ") Tj\n"
    content_stream += "/F1 11 Tf\n0 -30 Td\n(SSC Students Study Circle - Academic Year 2025-2026) Tj\n"
    content_stream += "0 -15 Td\n(--------------------------------------------------------------------------------) Tj\n"
    y_offset = -25
    for line in content_lines:
        safe_line = line.replace('(', '\\(').replace(')', '\\)')
        content_stream += f"0 {y_offset} Td\n({safe_line}) Tj\n"
        y_offset = -18
    content_stream += "ET\n"
    
    stream_len = len(content_stream.encode('latin1'))
    
    pdf = f"""%PDF-1.4
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
<< /Length {stream_len} >>
stream
{content_stream}endstream
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
370
%%EOF"""

    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'wb') as f:
        f.write(pdf.encode('latin1'))
    print(f"Created PDF: {filename} ({os.path.getsize(filename)} bytes)")

os.makedirs('assets/downloads', exist_ok=True)

create_simple_pdf(
    'assets/downloads/SSC_Class_6_Mathematics_Sample_Notes.pdf',
    'Class 6 Mathematics - Key Concepts & Formula Sheet',
    [
        'Chapter 1: Knowing Our Numbers - Place value, estimation, Roman numerals',
        'Chapter 2: Whole Numbers - Properties of addition & multiplication',
        'Chapter 3: Playing with Numbers - Factors, multiples, prime factorization, HCF & LCM',
        'Chapter 4: Basic Geometrical Ideas - Points, line segments, rays, curves, angles, polygons',
        'Chapter 5: Understanding Elementary Shapes - Measuring line segments, triangles, quadrilaterals',
        'Chapter 6: Integers - Representation on number line, addition & subtraction',
        'Practice Tips:',
        '- Revise tables from 2 to 20 daily.',
        '- Solve at least 5 problem sums every day.',
        '- Highlight difficult steps in geometry diagrams.'
    ]
)

create_simple_pdf(
    'assets/downloads/SSC_Class_5_English_Grammar_Sample.pdf',
    'Class 5 English - Grammar Essentials & Vocabulary Guide',
    [
        'Module 1: Parts of Speech - Nouns, Pronouns, Adjectives, Verbs, Adverbs, Prepositions',
        'Module 2: Sentence Structure - Subject, Predicate, Direct and Indirect Objects',
        'Module 3: Tenses - Simple Present, Past and Future; Continuous Forms',
        'Module 4: Reading Comprehension - Active reading, inference and main idea identification',
        'Key Vocabulary Words of the Month:',
        '- Perseverance (noun): Continued effort to do or achieve something despite difficulties.',
        '- Diligent (adjective): Showing care and conscientiousness in work or duties.',
        '- Inquisitive (adjective): Curious and eager to learn new concepts.'
    ]
)

create_simple_pdf(
    'assets/downloads/SSC_Class_7_Science_Revision_Notes.pdf',
    'Class 7 Science - Quick Revision Summary & Diagrams',
    [
        'Unit 1: Nutrition in Plants - Photosynthesis, autotrophs, heterotrophs, saprotrophs',
        'Unit 2: Nutrition in Animals - Human digestive system, teeth types, ruminants',
        'Unit 3: Heat & Temperature - Conduction, convection, radiation; Clinical thermometer',
        'Unit 4: Acids, Bases and Salts - Litmus indicators, neutralization reaction',
        'Unit 5: Physical and Chemical Changes - Crystallization, rusting of iron, galvanization',
        'Lab Safety Rule: Never taste chemicals and always record observations neatly in logbooks.'
    ]
)

create_simple_pdf(
    'assets/downloads/SSC_Tuition_Curriculum_and_Syllabus.pdf',
    'SSC Students Study Circle - Comprehensive Tuition Curriculum',
    [
        'Tuition Timings: Monday to Saturday, 5:00 PM to 8:00 PM',
        'Eligible Classes: 2nd Class to 7th Class (All State & CBSE Boards)',
        'Core Academic Features:',
        '1. Concept-based teaching using real-world models and daily examples.',
        '2. Individual attention with maximum 10-12 students per batch.',
        '3. Weekly diagnostic tests and monthly progress reports for parents.',
        '4. Dedicated doubt clearing hour from 7:00 PM to 8:00 PM.',
        '5. Safe, clean, and inspiring learning environment with well-organized desks.'
    ]
)
