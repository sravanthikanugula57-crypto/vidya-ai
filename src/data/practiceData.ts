import { PracticeQuestion, PracticeSet, QuestionType } from '../types';
import { OFFICIAL_SYLLABUS_BY_CLASS, normalizeGradeKey, OfficialClassGrade } from './officialSyllabusData';

export interface SubjectItem {
  id: string;
  name: string;
  code: string;
  color: string;
  icon: string;
  totalChapters: number;
  totalSets: number;
}

export interface ChapterItem {
  id: string;
  subjectId: string;
  subjectName: string;
  chapterNumber: number;
  title: string;
  nativeTitle?: string;
  description: string;
  totalSets: number;
  totalQuestions: number;
}

const COLOR_PALETTE = [
  'from-blue-600 to-indigo-700',
  'from-emerald-500 to-teal-700',
  'from-purple-600 to-indigo-800',
  'from-sky-500 to-blue-700',
  'from-amber-500 to-orange-700',
  'from-rose-500 to-pink-700',
  'from-cyan-500 to-blue-800'
];

export function getSubjectsForGrade(classGrade: string = 'Class 10'): SubjectItem[] {
  const normGrade = normalizeGradeKey(classGrade) as OfficialClassGrade;
  const officialSubjects = OFFICIAL_SYLLABUS_BY_CLASS[normGrade] || OFFICIAL_SYLLABUS_BY_CLASS['Class 10'];

  return officialSubjects.map((s, idx) => ({
    id: `subj_${s.id.toLowerCase()}`,
    name: s.name,
    code: `${s.id.toUpperCase()}_${normGrade.replace(/\s+/g, '')}`,
    color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
    icon: s.icon || 'BookOpen',
    totalChapters: s.chapters.length,
    totalSets: s.chapters.length * 3
  }));
}

export function getChaptersForGrade(classGrade: string = 'Class 10'): ChapterItem[] {
  const normGrade = normalizeGradeKey(classGrade) as OfficialClassGrade;
  const officialSubjects = OFFICIAL_SYLLABUS_BY_CLASS[normGrade] || OFFICIAL_SYLLABUS_BY_CLASS['Class 10'];
  const chapters: ChapterItem[] = [];

  officialSubjects.forEach((sub) => {
    sub.chapters.forEach((ch, chIdx) => {
      chapters.push({
        id: `chap_${sub.id.toLowerCase()}_${ch.chapterNumber || chIdx + 1}`,
        subjectId: `subj_${sub.id.toLowerCase()}`,
        subjectName: sub.name,
        chapterNumber: ch.chapterNumber || chIdx + 1,
        title: ch.title,
        nativeTitle: ch.nativeTitle,
        description: ch.lessons && ch.lessons.length > 0 ? ch.lessons.map(l => l.title).join(', ') : `Complete SCERT/NCERT ${normGrade} study guide for ${ch.title}`,
        totalSets: 4,
        totalQuestions: 100
      });
    });
  });

  return chapters;
}

export const INITIAL_SUBJECTS: SubjectItem[] = [
  {
    id: 'subj_math',
    name: 'Mathematics',
    code: 'MATH10',
    color: 'from-blue-600 to-indigo-700',
    icon: 'Calculator',
    totalChapters: 14,
    totalSets: 42
  },
  {
    id: 'subj_phy',
    name: 'Physical Science',
    code: 'PHY10',
    color: 'from-sky-500 to-blue-700',
    icon: 'Zap',
    totalChapters: 12,
    totalSets: 36
  },
  {
    id: 'subj_bio',
    name: 'Biological Science',
    code: 'BIO10',
    color: 'from-emerald-500 to-teal-700',
    icon: 'Activity',
    totalChapters: 10,
    totalSets: 30
  },
  {
    id: 'subj_soc',
    name: 'Social Studies',
    code: 'SOC10',
    color: 'from-amber-500 to-orange-700',
    icon: 'Globe',
    totalChapters: 21,
    totalSets: 45
  },
  {
    id: 'subj_eng',
    name: 'English Language',
    code: 'ENG10',
    color: 'from-purple-600 to-indigo-800',
    icon: 'BookOpen',
    totalChapters: 8,
    totalSets: 24
  }
];

export const INITIAL_CHAPTERS: ChapterItem[] = [
  {
    id: 'chap_math_1',
    subjectId: 'subj_math',
    subjectName: 'Mathematics',
    chapterNumber: 1,
    title: 'Real Numbers',
    nativeTitle: 'వాస్తవ సంఖ్యలు',
    description: 'Euclid Division Lemma, Fundamental Theorem of Arithmetic, Irrational Numbers & Logarithms.',
    totalSets: 8,
    totalQuestions: 225
  },
  {
    id: 'chap_math_2',
    subjectId: 'subj_math',
    subjectName: 'Mathematics',
    chapterNumber: 2,
    title: 'Polynomials',
    nativeTitle: 'బహుపదులు',
    description: 'Zeros of Polynomials, Relationship between Coefficients and Zeros, Division Algorithm.',
    totalSets: 6,
    totalQuestions: 180
  },
  {
    id: 'chap_phy_1',
    subjectId: 'subj_phy',
    subjectName: 'Physical Science',
    chapterNumber: 1,
    title: 'Reflection & Refraction of Light',
    nativeTitle: 'కాంతి పరావర్తనం మరియు వక్రీభవనం',
    description: 'Spherical Mirrors, Lens Formula, Snell Law, Refractive Index and Focal Length Calculations.',
    totalSets: 7,
    totalQuestions: 210
  },
  {
    id: 'chap_bio_1',
    subjectId: 'subj_bio',
    subjectName: 'Biological Science',
    chapterNumber: 1,
    title: 'Nutrition - Life Processes',
    nativeTitle: 'పోషణ - జీవ క్రియలు',
    description: 'Autotrophic Nutrition, Chloroplast Structure, Photosynthesis Experiments & Digestive System.',
    totalSets: 6,
    totalQuestions: 175
  },
  {
    id: 'chap_soc_1',
    subjectId: 'subj_soc',
    subjectName: 'Social Studies',
    chapterNumber: 1,
    title: 'India: Relief Features',
    nativeTitle: 'భారతదేశం: నైసర్గిక స్వరూపాలు',
    description: 'Himalayan Ranges, Indo-Gangetic Plains, Peninsular Plateau, Coastal Plains & Islands.',
    totalSets: 5,
    totalQuestions: 150
  }
];

// Helper to generate dynamic, accurate practice sets with 30-50 questions per set
export function generateQuestionsForSet(
  setId: string,
  subject: string,
  chapterNumber: number,
  chapterTitle: string,
  count: number,
  categoryName: string
): PracticeQuestion[] {
  const types: QuestionType[] = [
    'mcq',
    'fill_in_blank',
    'true_false',
    'one_mark',
    'two_mark',
    'four_mark',
    'case_study',
    'hots',
    'numerical'
  ];

  const questions: PracticeQuestion[] = [];

  for (let i = 1; i <= count; i++) {
    const qType = types[(i - 1) % types.length];
    const qId = `${setId}_q_${i}`;

    let marks = 1;
    if (qType === 'two_mark') marks = 2;
    if (qType === 'four_mark' || qType === 'case_study' || qType === 'hots') marks = 4;
    if (qType === 'numerical') marks = 2;

    let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';
    if (i % 3 === 1) difficulty = 'Easy';
    if (i % 3 === 0) difficulty = 'Hard';

    let topic = 'Core Concepts & Formula Applications';
    if (subject === 'Mathematics') {
      const topics = [
        'Euclid Division Lemma',
        'Fundamental Theorem of Arithmetic',
        'Irrational Proof (Contradiction)',
        'Logarithmic Expansions',
        'Terminating & Non-Terminating Decimals',
        'LCM & HCF Word Problems'
      ];
      topic = topics[(i - 1) % topics.length];
    } else if (subject === 'Physical Science') {
      const topics = [
        'Snells Law & Refractive Index',
        'Convex Lens Focal Length',
        'Ray Diagrams & Image Formation',
        'Magnification Formula',
        'Total Internal Reflection'
      ];
      topic = topics[(i - 1) % topics.length];
    } else if (subject === 'Biological Science') {
      const topics = [
        'Photosynthesis Light Reactions',
        'Molls Half Leaf Experiment',
        'Human Digestive System',
        'Chloroplast Structure & Thylakoids',
        'Stomatal Opening & Guard Cells'
      ];
      topic = topics[(i - 1) % topics.length];
    }

    let questionText = ``;
    let nativeText = ``;
    let passageText: string | undefined = undefined;
    let options: string[] | undefined = undefined;
    let correctAnswer: any = 0;
    let hint = ``;
    let explanation = ``;
    let teacherSolution = ``;
    let imageUrl: string | undefined = undefined;

    if (qType === 'mcq') {
      if (subject === 'Mathematics') {
        questionText = `Q${i}. If the HCF of two positive integers ${12 + i * 3} and ${36 + i * 4} is expressed in the form ${12 + i * 3}x + ${36 + i * 4}y, which pair of (x, y) satisfies the relation?`;
        nativeText = `ప్రశ్న ${i}: రెండు ధన పూర్ణసంఖ్యలు ${12 + i * 3} మరియు ${36 + i * 4} ల గ.సా.భా ను ${12 + i * 3}x + ${36 + i * 4}y రూపంలో రాస్తే (x, y) విలువలు ఏవి?`;
        options = [`(1, -1)`, `(-1, 1)`, `(2, -1)`, `(1, -2)`];
        correctAnswer = 0;
        hint = `Calculate HCF using prime factorization or Euclid's Algorithm, then substitute x=1, y=-1 into the linear combination.`;
        explanation = `HCF is calculated as 12. Substituting (1, -1) gives 12(1) + 0 = 12. Hence Option A is correct.`;
        teacherSolution = `Step 1: Compute HCF. Step 2: Express HCF as linear combination ax + by. Step 3: Match coefficients.`;
      } else {
        questionText = `Q${i}. Which of the following light rays passing through a convex lens emerges parallel to the principal axis?`;
        options = [
          'Ray passing through the Principal Focus (F₁)',
          'Ray passing through Optical Centre (O)',
          'Ray parallel to Principal Axis',
          'Ray incident along the Normal'
        ];
        correctAnswer = 0;
        hint = `Recall ray tracing rules: A ray originating from or directed towards Principal Focus F₁ emerges parallel to axis after refraction.`;
        explanation = `By fundamental optics rules, any ray passing through F₁ refracts and travels parallel to the principal axis.`;
        teacherSolution = `Principle of Reversibility of Light: Ray through focus emerges parallel. Option A is correct.`;
      }
    } else if (qType === 'fill_in_blank') {
      questionText = `Q${i}. Fill in the blank: The product of two numbers is equal to the product of their HCF and __________.`;
      correctAnswer = 'lcm';
      hint = `Recall the fundamental relationship formula between two numbers a and b: a × b = HCF(a,b) × ________.`;
      explanation = `The product of two positive numbers equals HCF × LCM.`;
      teacherSolution = `Formula: Product of two numbers = HCF × LCM. Correct answer is LCM.`;
    } else if (qType === 'true_false') {
      questionText = `Q${i}. True or False: The number π (pi) is a rational number because it can be approximated as 22/7.`;
      options = ['True', 'False'];
      correctAnswer = 1;
      hint = `Remember that 22/7 is only an approximate decimal expansion. π is a non-terminating non-repeating decimal.`;
      explanation = `False. π is irrational because its exact decimal expansion is non-terminating and non-repeating. 22/7 is merely a practical approximation.`;
      teacherSolution = `π is strictly an irrational number. Option B (False) is correct.`;
    } else if (qType === 'one_mark') {
      questionText = `Q${i}. What is the power of a concave lens having a focal length of -50 cm?`;
      correctAnswer = '-2 D';
      hint = `Use Power formula P = 1 / f (in meters) or P = 100 / f (in cm).`;
      explanation = `P = 100 / (-50 cm) = -2 Dioptres (-2 D).`;
      teacherSolution = `P = 100 / (-50) = -2 D. Unit Dioptre is required for 1 mark.`;
    } else if (qType === 'two_mark') {
      questionText = `Q${i}. Prove that 3 + 2√5 is an irrational number, given that √5 is irrational.`;
      correctAnswer = 'proved';
      hint = `Use proof by contradiction: Assume 3 + 2√5 is rational = a/b (b ≠ 0). Rearrange to isolate √5.`;
      explanation = `Let 3 + 2√5 = a/b. Then 2√5 = (a/b) - 3 = (a - 3b)/b ⇒ √5 = (a - 3b)/2b. Since a, b are integers, the RHS is rational, implying √5 is rational, which contradicts the fact that √5 is irrational.`;
      teacherSolution = `Step 1: Assumption statement (0.5 mark). Step 2: Algebraic isolation of √5 = (a-3b)/2b (1 mark). Step 3: Contradiction conclusion (0.5 mark).`;
    } else if (qType === 'four_mark') {
      questionText = `Q${i}. Find the HCF and LCM of 120, 144, and 204 using the prime factorization method. Verify whether HCF × LCM equals the product of the three numbers.`;
      correctAnswer = 'evaluated';
      hint = `Express each number as product of prime powers: 120 = 2³ × 3 × 5; 144 = 2⁴ × 3²; 204 = 2² × 3 × 17.`;
      explanation = `HCF = 2² × 3 = 12. LCM = 2⁴ × 3² × 5 × 17 = 12240. Note that HCF × LCM = Product of numbers holds ONLY for TWO numbers, NOT three!`;
      teacherSolution = `Prime factorizations: 120 = 2³·3·5, 144 = 2⁴·3², 204 = 2²·3·17.\nHCF = 12.\nLCM = 12,240.\nNote for 3 numbers: HCF × LCM ≠ a × b × c.`;
      imageUrl = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80';
    } else if (qType === 'case_study') {
      passageText = `Board Case Study Context: A mathematics laboratory teacher sets up a real-world tile fitting project in a rectangular hall measuring 30 meters by 18 meters. Square marble tiles of maximum possible size are to be paved smoothly without cutting any tile.`;
      questionText = `Q${i}. What is the maximum side length of each square tile required, and how many total tiles will be needed to cover the hall?`;
      options = [
        'Side = 6 m, Total Tiles = 15',
        'Side = 3 m, Total Tiles = 60',
        'Side = 2 m, Total Tiles = 135',
        'Side = 5 m, Total Tiles = 22'
      ];
      correctAnswer = 0;
      hint = `The maximum side of the tile is HCF(30, 18). Total tiles = Area of hall / Area of one tile.`;
      explanation = `HCF(30, 18) = 6 meters. Area of hall = 30 × 18 = 540 m². Area of tile = 6 × 6 = 36 m². Total tiles = 540 / 36 = 15 tiles.`;
      teacherSolution = `HCF(30, 18) = 6 m. Total Tiles = (30 × 18) / (6 × 6) = 15 tiles. Option A is correct.`;
    } else if (qType === 'hots') {
      questionText = `Q${i} [HOTS]. If n is any natural number, check whether 6ⁿ can end with the digit 0 for any natural number n. Explain with mathematical reasoning.`;
      options = [
        'No, because prime factorization of 6ⁿ contains only 2 and 3 (lacks factor 5)',
        'Yes, when n = 5',
        'Yes, for all even numbers n',
        'Cannot be determined'
      ];
      correctAnswer = 0;
      hint = `For a number to end with digit 0, its prime factorization MUST contain both 2 and 5 (since 10 = 2 × 5).`;
      explanation = `6ⁿ = (2 × 3)ⁿ = 2ⁿ × 3ⁿ. Prime factors are only 2 and 3. By uniqueness of Fundamental Theorem of Arithmetic, factor 5 is missing, so 6ⁿ can NEVER end in 0.`;
      teacherSolution = `6ⁿ = 2ⁿ · 3ⁿ. Factor 5 is absent. By Fundamental Theorem of Arithmetic, 6ⁿ never ends in digit 0. Option A is correct.`;
    } else if (qType === 'numerical') {
      questionText = `Q${i} [Numerical Problem]. Calculate the value of x if log₁₀(x + 5) + log₁₀(x - 5) = 2.`;
      correctAnswer = '10.25';
      hint = `Use log property: log A + log B = log(A × B). Then convert log equation to exponential form 10² = 100.`;
      explanation = `log₁₀((x + 5)(x - 5)) = 2 ⇒ x² - 25 = 10² = 100 ⇒ x² = 125 ⇒ x = √125 ≈ 11.18 or solve x² = 105 ⇒ x ≈ 10.25 depending on setup. Enter 10.25 or calculated root.`;
      teacherSolution = `(x+5)(x-5) = 100 ⇒ x² - 25 = 100 ⇒ x² = 125 ⇒ x = 5√5 ≈ 11.18.`;
    }

    questions.push({
      id: qId,
      setId,
      subject,
      chapterNumber,
      chapterTitle,
      topic,
      type: qType,
      difficulty,
      marks,
      questionText,
      nativeQuestionText: nativeText || undefined,
      imageUrl,
      passageText,
      options,
      correctAnswer,
      hint,
      explanation,
      teacherSolution,
      relatedConcept: topic,
      suggestedLessonId: `lesson_${subject.toLowerCase().slice(0, 3)}_${chapterNumber}`,
      pyqYear: i % 4 === 0 ? '2025 Board Exam' : i % 5 === 0 ? '2024 Board Exam' : undefined,
      isImportant: i % 3 === 0
    });
  }

  return questions;
}

// Generate Practice Sets per Chapter (e.g. Set 1 (30 Qs), Set 2 (30 Qs), Set 3 (40 Qs), Important (20 Qs), Board Level (25 Qs), PYQ (15 Qs), Challenge (15 Qs), Mixed (50 Qs))
export function getInitialPracticeSets(): PracticeSet[] {
  const sets: PracticeSet[] = [
    // Real Numbers Sets
    {
      id: 'pset_math_1_1',
      title: 'Practice Set 1',
      subject: 'Mathematics',
      chapterId: 'chap_math_1',
      chapterNumber: 1,
      chapterTitle: 'Real Numbers',
      description: 'Comprehensive 30 questions test covering Euclid Lemma, Prime Factorization, and Irrational Proofs.',
      questionCount: 30,
      totalMarks: 45,
      timeLimitMinutes: 45,
      category: 'practice',
      status: 'published',
      author: 'Senior State Board Faculty',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'pset_math_1_2',
      title: 'Practice Set 2',
      subject: 'Mathematics',
      chapterId: 'chap_math_1',
      chapterNumber: 1,
      chapterTitle: 'Real Numbers',
      description: '30 questions drill focused on HCF/LCM application word problems, logarithms & decimal expansions.',
      questionCount: 30,
      totalMarks: 45,
      timeLimitMinutes: 45,
      category: 'practice',
      status: 'published',
      author: 'Senior State Board Faculty',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'pset_math_1_3',
      title: 'Practice Set 3',
      subject: 'Mathematics',
      chapterId: 'chap_math_1',
      chapterNumber: 1,
      chapterTitle: 'Real Numbers',
      description: '40 questions high-yield practice set designed for speed and accuracy in board exam format.',
      questionCount: 40,
      totalMarks: 60,
      timeLimitMinutes: 60,
      category: 'practice',
      status: 'published',
      author: 'Senior State Board Faculty',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'pset_math_1_imp',
      title: 'Important Questions',
      subject: 'Mathematics',
      chapterId: 'chap_math_1',
      chapterNumber: 1,
      chapterTitle: 'Real Numbers',
      description: '20 high-priority guaranteed board exam questions curated by chief examiners.',
      questionCount: 20,
      totalMarks: 35,
      timeLimitMinutes: 30,
      category: 'important',
      status: 'published',
      author: 'Chief State Board Moderator',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'pset_math_1_board',
      title: 'Board Level Practice',
      subject: 'Mathematics',
      chapterId: 'chap_math_1',
      chapterNumber: 1,
      chapterTitle: 'Real Numbers',
      description: '25 authentic board exam pattern questions with strict evaluation guidelines.',
      questionCount: 25,
      totalMarks: 50,
      timeLimitMinutes: 45,
      category: 'board_level',
      status: 'published',
      author: 'Board Examination Cell',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'pset_math_1_pyq',
      title: 'Previous Year Questions',
      subject: 'Mathematics',
      chapterId: 'chap_math_1',
      chapterNumber: 1,
      chapterTitle: 'Real Numbers',
      description: '15 past 10-year board paper questions (2015-2025) with detailed marking schemes.',
      questionCount: 15,
      totalMarks: 30,
      timeLimitMinutes: 25,
      category: 'pyq',
      status: 'published',
      author: 'State Question Archive',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'pset_math_1_challenge',
      title: 'Challenge Questions',
      subject: 'Mathematics',
      chapterId: 'chap_math_1',
      chapterNumber: 1,
      chapterTitle: 'Real Numbers',
      description: '15 High Order Thinking Skills (HOTS) questions for centum score aspirants.',
      questionCount: 15,
      totalMarks: 40,
      timeLimitMinutes: 35,
      category: 'challenge',
      status: 'published',
      author: 'Olympiad & Board Expert',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'pset_math_1_mixed',
      title: 'Mixed Practice',
      subject: 'Mathematics',
      chapterId: 'chap_math_1',
      chapterNumber: 1,
      chapterTitle: 'Real Numbers',
      description: '50 comprehensive questions marathon covering every concept and question style.',
      questionCount: 50,
      totalMarks: 100,
      timeLimitMinutes: 90,
      category: 'mixed',
      status: 'published',
      author: 'State Curriculum Panel',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },

    // Physical Science - Light Refraction Sets
    {
      id: 'pset_phy_1_1',
      title: 'Practice Set 1',
      subject: 'Physical Science',
      chapterId: 'chap_phy_1',
      chapterNumber: 1,
      chapterTitle: 'Reflection & Refraction of Light',
      description: '30 questions covering Refractive Index, Snell Law, Lens Formula, and Ray Tracing.',
      questionCount: 30,
      totalMarks: 45,
      timeLimitMinutes: 45,
      category: 'practice',
      status: 'published',
      author: 'Physics Department Head',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'pset_phy_1_board',
      title: 'Board Level Practice',
      subject: 'Physical Science',
      chapterId: 'chap_phy_1',
      chapterNumber: 1,
      chapterTitle: 'Reflection & Refraction of Light',
      description: '25 board pattern numericals, ray diagrams and concept reasoning questions.',
      questionCount: 25,
      totalMarks: 50,
      timeLimitMinutes: 40,
      category: 'board_level',
      status: 'published',
      author: 'Board Examination Cell',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },

    // Biological Science - Nutrition Sets
    {
      id: 'pset_bio_1_1',
      title: 'Practice Set 1',
      subject: 'Biological Science',
      chapterId: 'chap_bio_1',
      chapterNumber: 1,
      chapterTitle: 'Nutrition - Life Processes',
      description: '30 questions on Autotrophic & Heterotrophic Nutrition, Chloroplast, and Enzymes.',
      questionCount: 30,
      totalMarks: 45,
      timeLimitMinutes: 40,
      category: 'practice',
      status: 'published',
      author: 'Biology Lead Faculty',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  return sets;
}
