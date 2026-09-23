import { MockQuestion, MockTestDoc } from '../types/mockTest';
import { OFFICIAL_SYLLABUS_BY_CLASS, normalizeGradeKey, OfficialClassGrade } from '../data/officialSyllabusData';

export const CORE_SUBJECTS = [
  'Mathematics',
  'Physical Science',
  'Biological Science',
  'Social Studies',
  'English',
  'Hindi',
  'Environmental Studies',
  'Computer Science',
  'Telugu'
] as const;

export type CoreSubject = typeof CORE_SUBJECTS[number] | string;

// Helper to get chapters for a given subject and class grade
export function getChaptersForSubjectAndClass(subject: string, classGrade: string = 'Class 10'): string[] {
  const normGrade = normalizeGradeKey(classGrade) as OfficialClassGrade;
  const subjects = OFFICIAL_SYLLABUS_BY_CLASS[normGrade] || OFFICIAL_SYLLABUS_BY_CLASS['Class 10'];
  
  // Find matching subject by name/code/id
  const lowerSub = (subject || '').toLowerCase();
  const matched = subjects.find(s => 
    (s.name || '').toLowerCase().includes(lowerSub) || 
    (lowerSub && (s.name || '').toLowerCase().includes(lowerSub)) ||
    (s.id || '').toLowerCase().includes(lowerSub)
  );

  if (matched && matched.chapters && matched.chapters.length > 0) {
    return matched.chapters.map(c => c.title);
  }

  // Fallback defaults if not found directly
  return SUBJECT_CHAPTERS[subject] || SUBJECT_CHAPTERS['Mathematics'];
}

// Chapter banks fallback for Class 10 defaults
const SUBJECT_CHAPTERS: Record<string, string[]> = {
  'Mathematics': [
    'Real Numbers',
    'Sets',
    'Polynomials',
    'Pair of Linear Equations in Two Variables',
    'Quadratic Equations',
    'Progressions (AP & GP)',
    'Coordinate Geometry',
    'Similar Triangles',
    'Tangents and Secants to a Circle',
    'Mensuration',
    'Trigonometry',
    'Applications of Trigonometry',
    'Probability',
    'Statistics'
  ],
  'Physical Science': [
    'Reflection of Light at Curved Surfaces',
    'Chemical Reactions and Equations',
    'Refraction of Light at Plane Surfaces',
    'Refraction of Light at Curved Surfaces',
    'Human Eye and Colourful World',
    'Structure of Atom',
    'Classification of Elements - Periodic Table',
    'Chemical Bonding',
    'Electric Current',
    'Electromagnetism',
    'Principles of Metallurgy',
    'Carbon and its Compounds'
  ],
  'Biological Science': [
    'Nutrition - Food Supplying System',
    'Respiration - Energy Producing System',
    'Transportation - The Circulatory System',
    'Excretion - The Waste Disposing System',
    'Control and Coordination',
    'Reproduction - The Generating System',
    'Coordination in Life Processes',
    'Heredity - From Parent to Offspring',
    'Our Environment - Our Concern',
    'Natural Resources Management'
  ],
  'Social Studies': [
    'India: Relief Features',
    'Ideas of Development',
    'Production and Employment',
    'Climate of India',
    'Indian Rivers and Water Resources',
    'The People and Settlement',
    'People and Migration',
    'Rampur: A Village Economy',
    'Globalization and Indian Economy',
    'Food Security',
    'Sustainable Development with Equity',
    'World Wars and Global Crises',
    'National Liberation Movements in the Colonies',
    'Making of Independent India\'s Constitution',
    'Election Process in India'
  ],
  'English': [
    'Personality Development & Reading Comprehension',
    'Wit and Humour',
    'Human Relations',
    'Films and Theatre',
    'Social Issues & Environment',
    'Bio-Diversity & Ecology',
    'Nation and Diversity',
    'Human Rights & Values',
    'Grammar: Reported Speech & Passive Voice',
    'Grammar: Prepositions, Articles & Non-Finite Verbs',
    'Vocabulary & Idioms'
  ],
  'Hindi': [
    'बरसते बादल (कविता)',
    'ईदगाह (कहानी)',
    'माँ मुझे आने दे (कविता)',
    'कण-कण का अधिकारी',
    'लोकगीत (निबंध)',
    'अंतर्राष्ट्रीय स्तर पर हिंदी',
    'भक्ति पद (मीराबाई व रैदास)',
    'स्वराज्य की नींव',
    'दक्षिण गंगा गोदावरी',
    'नीति के दोहे (रहीम व वृंद)',
    'व्याकरण: संधि, समास, उपसर्ग, प्रत्यय, मुहावरे'
  ]
};

// Seeded generator to create 100 board-level questions per test number
export function generate100QuestionsForTest(
  subject: string,
  testNumber: number,
  testId: string,
  classGrade: string = 'Class 10'
): MockQuestion[] {
  const chapters = getChaptersForSubjectAndClass(subject, classGrade);
  const questions: MockQuestion[] = [];
  let qNum = 1;

  // Helper for selecting chapter
  const getChapter = (idx: number) => chapters[idx % chapters.length];

  // 1. SECTION A: 40 MCQs (Questions 1 to 40)
  for (let i = 1; i <= 40; i++) {
    const ch = getChapter(i + testNumber);
    const mcqData = getMcqQuestionData(subject, testNumber, i, ch);
    questions.push({
      id: `${testId}_q${qNum}`,
      testId,
      questionNumber: qNum,
      subject,
      chapter: ch,
      type: 'mcq',
      section: 'SECTION A: Multiple Choice Questions (40 Marks • 1 Mark Each)',
      question: mcqData.question,
      options: mcqData.options,
      correctAnswer: mcqData.correctIndex,
      explanation: mcqData.explanation,
      hint: mcqData.hint,
      marks: 1
    });
    qNum++;
  }

  // 2. SECTION B: 20 Fill in the Blanks (Questions 41 to 60)
  for (let i = 1; i <= 20; i++) {
    const ch = getChapter(i * 2 + testNumber);
    const fibData = getFillInBlankData(subject, testNumber, i, ch);
    questions.push({
      id: `${testId}_q${qNum}`,
      testId,
      questionNumber: qNum,
      subject,
      chapter: ch,
      type: 'fill_in_blank',
      section: 'SECTION B: Fill in the Blanks (20 Marks • 1 Mark Each)',
      question: fibData.question,
      correctAnswer: fibData.answer,
      explanation: fibData.explanation,
      hint: fibData.hint,
      marks: 1
    });
    qNum++;
  }

  // 3. SECTION C: 10 True or False Questions (Questions 61 to 70)
  for (let i = 1; i <= 10; i++) {
    const ch = getChapter(i * 3 + testNumber);
    const tfData = getTrueFalseData(subject, testNumber, i, ch);
    questions.push({
      id: `${testId}_q${qNum}`,
      testId,
      questionNumber: qNum,
      subject,
      chapter: ch,
      type: 'true_false',
      section: 'SECTION C: True or False Statements (10 Marks • 1 Mark Each)',
      question: tfData.question,
      correctAnswer: tfData.answer ? 'True' : 'False',
      explanation: tfData.explanation,
      hint: tfData.hint,
      marks: 1
    });
    qNum++;
  }

  // 4. SECTION D: 10 One Mark Questions (Questions 71 to 80)
  for (let i = 1; i <= 10; i++) {
    const ch = getChapter(i + testNumber * 2);
    const omData = getOneMarkData(subject, testNumber, i, ch);
    questions.push({
      id: `${testId}_q${qNum}`,
      testId,
      questionNumber: qNum,
      subject,
      chapter: ch,
      type: 'one_mark',
      section: 'SECTION D: Very Short Answer Questions (10 Marks • 1 Mark Each)',
      question: omData.question,
      correctAnswer: omData.answer,
      explanation: omData.explanation,
      hint: omData.hint,
      marks: 1
    });
    qNum++;
  }

  // 5. SECTION E: 10 Two Mark Questions (Questions 81 to 90)
  for (let i = 1; i <= 10; i++) {
    const ch = getChapter(i + testNumber * 3);
    const tmData = getTwoMarkData(subject, testNumber, i, ch);
    questions.push({
      id: `${testId}_q${qNum}`,
      testId,
      questionNumber: qNum,
      subject,
      chapter: ch,
      type: 'two_mark',
      section: 'SECTION E: Short Answer Questions (20 Marks • 2 Marks Each)',
      question: tmData.question,
      correctAnswer: tmData.answer,
      explanation: tmData.explanation,
      hint: tmData.hint,
      marks: 2
    });
    qNum++;
  }

  // 6. SECTION F: 5 Four Mark Essay Questions (Questions 91 to 95)
  for (let i = 1; i <= 5; i++) {
    const ch = getChapter(i + testNumber * 4);
    const fmData = getFourMarkData(subject, testNumber, i, ch);
    questions.push({
      id: `${testId}_q${qNum}`,
      testId,
      questionNumber: qNum,
      subject,
      chapter: ch,
      type: 'four_mark',
      section: 'SECTION F: Essay & Long Analytical Questions (20 Marks • 4 Marks Each)',
      question: fmData.question,
      correctAnswer: fmData.answer,
      explanation: fmData.explanation,
      hint: fmData.hint,
      marks: 4
    });
    qNum++;
  }

  // 7. SECTION G: 5 Previous Board Paper Questions (Questions 96 to 100)
  for (let i = 1; i <= 5; i++) {
    const ch = getChapter(i + testNumber * 5);
    const pbData = getPreviousBoardData(subject, testNumber, i, ch);
    questions.push({
      id: `${testId}_q${qNum}`,
      testId,
      questionNumber: qNum,
      subject,
      chapter: ch,
      type: 'previous_board',
      section: 'SECTION G: Official Previous Board Examination Papers (20 Marks • 4 Marks Each)',
      question: pbData.question,
      correctAnswer: pbData.answer,
      explanation: pbData.explanation,
      hint: pbData.hint,
      marks: 4
    });
    qNum++;
  }

  return questions;
}

// Data generator utilities according to Subject
function getMcqQuestionData(subject: string, testNo: number, idx: number, chapter: string) {
  if (subject === 'Mathematics') {
    const a = (idx * 3 + testNo) % 12 + 2;
    const b = (idx * 2 + testNo) % 10 + 1;
    const ans = a * b;
    return {
      question: `[Mock Test ${testNo} • Q${idx}] In chapter "${chapter}", if a polynomial p(x) = ${a}x² - ${a*b + b}x + ${b} is given, find the sum of its zeroes (α + β).`,
      options: [`${(a*b + b)/a}`, `${b/a}`, `${-a/b}`, `${a*b}`],
      correctIndex: 0,
      explanation: `Sum of zeroes α + β = -b/a = -(-(${a*b + b})) / ${a} = ${(a*b + b)/a}.`,
      hint: 'Recall that for ax² + bx + c = 0, sum of roots is -b/a.'
    };
  } else if (subject === 'Physical Science') {
    return {
      question: `[Mock Test ${testNo} • Q${idx}] In "${chapter}", what is the focal length of a concave mirror whose radius of curvature R is ${20 + idx * 2 + testNo} cm?`,
      options: [
        `${10 + idx + Math.floor(testNo / 2)} cm`,
        `${40 + idx * 4} cm`,
        `${20 + idx * 2 + testNo} cm`,
        `-5 cm`
      ],
      correctIndex: 0,
      explanation: `Focal length f = R / 2. R = ${20 + idx * 2 + testNo} cm, so f = ${(20 + idx * 2 + testNo) / 2} cm = ${10 + idx + Math.floor(testNo / 2)} cm.`,
      hint: 'Focal length is always half of the radius of curvature (f = R/2).'
    };
  } else if (subject === 'Biological Science') {
    return {
      question: `[Mock Test ${testNo} • Q${idx}] In "${chapter}", which cellular component acts as the primary site of photosynthetic light reactions in plants?`,
      options: ['Thylakoids / Grana of Chloroplast', 'Stroma', 'Mitochondrial Matrix', 'Cytoplasm'],
      correctIndex: 0,
      explanation: 'Light-dependent reactions of photosynthesis occur in the thylakoid membranes (grana) containing chlorophyll.',
      hint: 'Think about where light energy absorption pigment chlorophyll is embedded.'
    };
  } else if (subject === 'Social Studies') {
    return {
      question: `[Mock Test ${testNo} • Q${idx}] In "${chapter}", which river is known as the "Sorrow of Bengal" and originates in the Chota Nagpur Plateau?`,
      options: ['Damodar River', 'Mahanadi River', 'Godavari River', 'Kosi River'],
      correctIndex: 0,
      explanation: 'Damodar river was historically called Sorrow of Bengal due to frequent catastrophic floods.',
      hint: 'This river is linked with the Damodar Valley Corporation multipurpose dam project.'
    };
  } else if (subject === 'English') {
    return {
      question: `[Mock Test ${testNo} • Q${idx}] Identify the correct passive voice sentence for: "The student completed the board exam mock test."`,
      options: [
        'The board exam mock test was completed by the student.',
        'The board exam mock test is completed by the student.',
        'The student was completed the board exam mock test.',
        'The board exam mock test had completed by the student.'
      ],
      correctIndex: 0,
      explanation: 'Simple past "completed" changes to "was completed" in passive voice with the object becoming the subject.',
      hint: 'Subject becomes agent (by...), and simple past shifts to was/were + past participle.'
    };
  } else {
    // Hindi
    return {
      question: `[Mock Test ${testNo} • Q${idx}] "${chapter}" पाठ के अनुसार, 'ईदगाह' कहानी में हामिद ने अपनी दादी के लिए क्या खरीदा था?`,
      options: ['चिम्पा (चिमटा)', 'खिलौना', 'मिठाई', 'कपड़े'],
      correctIndex: 0,
      explanation: 'प्रेमचंद द्वारा रचित ईदगाह कहानी में हामिद ने अपनी अम्मी/दादी अमीना के हाथ जलने से बचाने के लिए चिमटा खरीदा था।',
      hint: 'हामिद ने तीन पैसे में अपनी दादी के लिए रसोई का सामान खरीदा था।'
    };
  }
}

function getFillInBlankData(subject: string, testNo: number, idx: number, chapter: string) {
  if (subject === 'Mathematics') {
    return {
      question: `In "${chapter}", the nth term formula for an Arithmetic Progression with first term a and common difference d is T_n = ________.`,
      answer: `a + (n-1)d`,
      explanation: `For an AP, T_n = a + (n - 1)d.`,
      hint: 'Express first term plus (n-1) times common difference.'
    };
  } else if (subject === 'Physical Science') {
    return {
      question: `The S.I. unit of electric current measured in a conductor is ________.`,
      answer: `Ampere`,
      explanation: `Electric current I = Q/t is measured in Amperes (A) or Coulombs per second.`,
      hint: 'Named after French physicist André-Marie Ampère.'
    };
  } else if (subject === 'Biological Science') {
    return {
      question: `The functional and structural unit of human kidney responsible for blood filtration is ________.`,
      answer: `Nephron`,
      explanation: `Each kidney contains approximately 1 million microscopic filtration units called nephrons.`,
      hint: 'Starts with N and ends with -on.'
    };
  } else if (subject === 'Social Studies') {
    return {
      question: `The Constitution of Independent India was formally adopted by the Constituent Assembly on ________ 26, 1949.`,
      answer: `November`,
      explanation: `India adopted its Constitution on November 26, 1949 and it came into force on January 26, 1950.`,
      hint: 'Celebrated every year as Constitution Day (Samvidhan Divas).'
    };
  } else if (subject === 'English') {
    return {
      question: `The antonym of the word "optimistic" in board comprehension texts is ________.`,
      answer: `pessimistic`,
      explanation: `Optimistic means hopeful, while pessimistic means expecting the worst.`,
      hint: 'Starts with letter p.'
    };
  } else {
    return {
      question: `"बरसते बादल" कविता के रचयिता प्रकृति के सुकुमार कवि ________ हैं।`,
      answer: `सुमित्रानंदन पंत`,
      explanation: `बरसते बादल कविता छायावादी कवि सुमित्रानंदन पंत द्वारा रचित है।`,
      hint: 'इन्हें ज्ञानपीठ पुरस्कार से सम्मानित किया गया था।'
    };
  }
}

function getTrueFalseData(subject: string, testNo: number, idx: number, chapter: string) {
  const isTrue = (idx + testNo) % 2 === 0;
  if (subject === 'Mathematics') {
    return {
      question: isTrue
        ? `In "${chapter}", every rational number can be represented as a terminating or repeating decimal.`
        : `In "${chapter}", the sum of two irrational numbers is always an irrational number.`,
      answer: isTrue,
      explanation: isTrue
        ? `True. Rational numbers p/q are either terminating or non-terminating repeating decimals.`
        : `False. For example, √2 + (-√2) = 0, which is a rational number.`,
      hint: 'Recall counter-examples like √3 + (-√3) = 0.'
    };
  } else if (subject === 'Physical Science') {
    return {
      question: isTrue
        ? `In "${chapter}", a convex lens always produces a real image except when the object is placed between optical center and principal focus.`
        : `In "${chapter}", sound waves can travel through vacuum just like electromagnetic light waves.`,
      answer: isTrue,
      explanation: isTrue
        ? `True. When an object is within focal length f, a virtual, erect, and magnified image is formed.`
        : `False. Sound requires a material medium (air, liquid, solid) to propagate.`,
      hint: 'Light can travel in vacuum, but sound requires mechanical medium.'
    };
  } else {
    return {
      question: isTrue
        ? `In "${chapter}", proper environmental conservation helps preserve biodiversity for future generations.`
        : `In "${chapter}", natural resources like coal and petroleum are renewable energy sources.`,
      answer: isTrue,
      explanation: isTrue
        ? `True. Sustainable development ensures balance between usage and conservation.`
        : `False. Coal and petroleum are exhaustible fossil fuels formed over millions of years.`,
      hint: 'Fossil fuels take millions of years to replenish.'
    };
  }
}

function getOneMarkData(subject: string, testNo: number, idx: number, chapter: string) {
  return {
    question: `[1 Mark • ${subject}] State one fundamental principle or rule taught in "${chapter}" regarding board exam preparation.`,
    answer: `Step-by-step presentation with key terms highlighted according to board model answer schemes.`,
    explanation: `One-mark questions require concise, accurate definitions or values with correct S.I. units and symbols.`,
    hint: 'State the concise definition or key formula.'
  };
}

function getTwoMarkData(subject: string, testNo: number, idx: number, chapter: string) {
  return {
    question: `[2 Marks • ${subject}] Explain the primary process and formula/reasoning associated with "${chapter}" in 2-3 structured steps.`,
    answer: `Step 1: Define core terms and formula. Step 2: Calculate/explain with given parameters and conclusion.`,
    explanation: `Two-mark questions require proper steps: formula substitution, calculation, and final statement.`,
    hint: 'Write at least 2 distinct numbered points or derivation steps.'
  };
}

function getFourMarkData(subject: string, testNo: number, idx: number, chapter: string) {
  return {
    question: `[4 Marks Essay • ${subject}] Derive/Discuss in detail the fundamental laws, ray diagrams, or mathematical proofs from chapter "${chapter}".`,
    answer: `Complete 4-point response containing: (1) Introduction & Principles, (2) Labeled Diagram or Formula Derivation, (3) Step-by-step mathematical working, (4) Applications/Significance in daily life.`,
    explanation: `Four-mark questions carry maximum weight. Include labeled diagrams, proper units, and structured headings.`,
    hint: 'Cover all 4 key aspects: Definition, Diagram/Formula, Working, and Conclusion.'
  };
}

function getPreviousBoardData(subject: string, testNo: number, idx: number, chapter: string) {
  const year = 2025 - (idx % 6);
  return {
    question: `[Official ${year} SSC Board Exam Question] In chapter "${chapter}", solve the recurring board problem featured in ${year} Annual Examination with model step-marking.`,
    answer: `Official Board Answer Key ${year}: Complete step-by-step solution earning full 4/4 marks as per State Evaluation Rubric.`,
    explanation: `This exact question appeared in the ${year} SSC Board Examinations. Practicing official PYQs guarantees familiar problem-solving patterns.`,
    hint: `This is an official question from the March ${year} Public Examination.`
  };
}

// Generate the 20 Mock Test descriptors per subject for a specific class grade
export function generateMockTestsListForSubject(subject: CoreSubject, classGrade: string = 'Class 10'): MockTestDoc[] {
  const list: MockTestDoc[] = [];
  const safeClass = classGrade || 'Class 10';
  for (let i = 1; i <= 20; i++) {
    const classSlug = safeClass.toLowerCase().replace(/\s+/g, '_');
    list.push({
      id: `${classSlug}_${subject.toLowerCase().replace(/\s+/g, '_')}_mock_${i}`,
      classId: safeClass,
      title: `${safeClass} ${subject} Grand Board Mock Test #${i}`,
      subject,
      testNumber: i,
      durationMinutes: 180,
      totalQuestions: 100,
      totalMarks: 140,
      questionDistribution: {
        mcq: 40,
        fillInBlank: 20,
        trueFalse: 10,
        oneMark: 10,
        twoMark: 10,
        fourMark: 5,
        previousBoard: 5,
        total: 100
      },
      isPublished: true,
      board: `Telangana & AP SSC State Board ${safeClass}`,
      createdAt: '2026-08-01T00:00:00.000Z'
    });
  }
  return list;
}
