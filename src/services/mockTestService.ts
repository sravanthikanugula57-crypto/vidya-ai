import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MockTestDoc, MockQuestion, MockAttempt, UserAnswerState } from '../types/mockTest';
import {
  generate100QuestionsForTest,
  generateMockTestsListForSubject,
  CORE_SUBJECTS,
  CoreSubject
} from './mockTestGenerator';
import { normalizeGradeKey } from '../data/officialSyllabusData';

export interface ActiveMockSession {
  id: string; // `${studentId}_${mockTestId}`
  studentId: string;
  mockTestId: string;
  class: number | string;
  startedAt: string;
  durationMinutes: number;
  durationSeconds: number;
  remainingSeconds: number;
  answers: Record<number | string, UserAnswerState>;
  currentQuestionIdx: number;
  status: 'in_progress' | 'submitted';
  expired?: boolean;
}

// Seed authentic Class 5 Mock Tests if Firestore collection is empty
export async function seedClass5MockTestsIfEmpty(): Promise<void> {
  try {
    const testsRef = collection(db, 'mockTests');
    const q = query(testsRef, where('class', '==', 5));
    const snap = await getDocs(q);

    if (!snap.empty) {
      return; // Already seeded
    }

    // Also check mock_tests
    const legacyRef = collection(db, 'mock_tests');
    const legacyQ = query(legacyRef, where('class', '==', 5));
    const legacySnap = await getDocs(legacyQ);
    if (!legacySnap.empty) {
      return;
    }

    console.log('Seeding initial Class 5 Mock Tests to Firestore...');

    const mathQuestions: MockQuestion[] = [
      {
        id: 'c5_m1_q1',
        testId: 'c5_math_mock_1',
        questionNumber: 1,
        subject: 'Mathematics',
        chapter: 'Shapes and Angles',
        type: 'mcq',
        section: 'Section A: Multiple Choice Questions',
        question: 'A fish tank holds 12,500 mL of water. How many litres is this?',
        options: ['1.25 L', '12.5 L', '125 L', '1250 L'],
        correctAnswer: 1,
        explanation: 'To convert mL to Litres, divide by 1000: 12,500 / 1000 = 12.5 Litres.',
        hint: '1 Litre = 1000 millilitres.',
        marks: 2
      },
      {
        id: 'c5_m1_q2',
        testId: 'c5_math_mock_1',
        questionNumber: 2,
        subject: 'Mathematics',
        chapter: 'Area and Perimeter',
        type: 'fill_in_blank',
        section: 'Section B: Fill in the Blanks',
        question: 'The perimeter of a square with side length 8 cm is _____ cm.',
        correctAnswer: '32',
        explanation: 'Perimeter of a square = 4 × side = 4 × 8 = 32 cm.',
        hint: 'Multiply the side length by 4.',
        marks: 2
      },
      {
        id: 'c5_m1_q3',
        testId: 'c5_math_mock_1',
        questionNumber: 3,
        subject: 'Mathematics',
        chapter: 'Factors and Multiples',
        type: 'mcq',
        section: 'Section A: Multiple Choice Questions',
        question: 'Which of the following numbers is a factor of 48 but NOT a factor of 36?',
        options: ['6', '12', '16', '4'],
        correctAnswer: 2,
        explanation: '48 ÷ 16 = 3 (Factor of 48). 36 ÷ 16 = 2 remainder 4 (Not a factor of 36).',
        hint: 'Test which number divides 48 completely but does not divide 36.',
        marks: 2
      },
      {
        id: 'c5_m1_q4',
        testId: 'c5_math_mock_1',
        questionNumber: 4,
        subject: 'Mathematics',
        chapter: 'Area and Perimeter',
        type: 'mcq',
        section: 'Section A: Multiple Choice Questions',
        question: 'Find the area of a rectangle with length 15 cm and breadth 10 cm.',
        options: ['50 sq cm', '150 sq cm', '25 sq cm', '300 sq cm'],
        correctAnswer: 1,
        explanation: 'Area of a rectangle = length × breadth = 15 × 10 = 150 sq cm.',
        hint: 'Area = length × breadth.',
        marks: 2
      },
      {
        id: 'c5_m1_q5',
        testId: 'c5_math_mock_1',
        questionNumber: 5,
        subject: 'Mathematics',
        chapter: 'Fractions',
        type: 'fill_in_blank',
        section: 'Section B: Fill in the Blanks',
        question: 'In the fraction 7/12, the number 12 is called the _____ (numerator / denominator).',
        correctAnswer: 'denominator',
        explanation: 'The bottom number in a fraction is called the denominator.',
        hint: 'Top = Numerator, Bottom = Denominator.',
        marks: 2
      },
      {
        id: 'c5_m1_q6',
        testId: 'c5_math_mock_1',
        questionNumber: 6,
        subject: 'Mathematics',
        chapter: 'Shapes and Angles',
        type: 'mcq',
        section: 'Section A: Multiple Choice Questions',
        question: 'Which geometric shape has 3 sides and 3 interior angles?',
        options: ['Square', 'Triangle', 'Rectangle', 'Pentagon'],
        correctAnswer: 1,
        explanation: 'A triangle is a closed 2D polygon with 3 sides and 3 angles.',
        hint: 'Tri = Three.',
        marks: 2
      },
      {
        id: 'c5_m1_q7',
        testId: 'c5_math_mock_1',
        questionNumber: 7,
        subject: 'Mathematics',
        chapter: 'Shapes and Angles',
        type: 'true_false',
        section: 'Section C: True or False',
        question: 'A right angle measures exactly 90 degrees.',
        correctAnswer: 'True',
        explanation: 'A right angle is formed by perpendicular lines measuring 90°.',
        hint: 'Think of the corner of a square piece of paper.',
        marks: 2
      },
      {
        id: 'c5_m1_q8',
        testId: 'c5_math_mock_1',
        questionNumber: 8,
        subject: 'Mathematics',
        chapter: 'Large Numbers',
        type: 'mcq',
        section: 'Section A: Multiple Choice Questions',
        question: 'What is the place value of 7 in the number 5,74,320?',
        options: ['700', '7,000', '70,000', '7,00,000'],
        correctAnswer: 2,
        explanation: 'In 5,74,320, the digit 7 is in the ten-thousands place, so its value is 70,000.',
        hint: 'Count places from right: Units, Tens, Hundreds, Thousands, Ten Thousands.',
        marks: 2
      },
      {
        id: 'c5_m1_q9',
        testId: 'c5_math_mock_1',
        questionNumber: 9,
        subject: 'Mathematics',
        chapter: 'Unitary Method',
        type: 'fill_in_blank',
        section: 'Section B: Fill in the Blanks',
        question: 'If 1 kg of apples costs ₹120, the cost of 2.5 kg of apples is ₹_____.',
        correctAnswer: '300',
        explanation: 'Cost = 2.5 × 120 = 300.',
        hint: 'Multiply 120 by 2.5.',
        marks: 2
      },
      {
        id: 'c5_m1_q10',
        testId: 'c5_math_mock_1',
        questionNumber: 10,
        subject: 'Mathematics',
        chapter: 'Factors and Multiples',
        type: 'fill_in_blank',
        section: 'Section B: Fill in the Blanks',
        question: 'The Lowest Common Multiple (L.C.M.) of 6 and 8 is _____.',
        correctAnswer: '24',
        explanation: 'Multiples of 6: 6, 12, 18, 24... Multiples of 8: 8, 16, 24... Smallest common multiple is 24.',
        hint: 'Find the smallest number that appears in both 6 and 8 multiplication tables.',
        marks: 2
      }
    ];

    const mathTest: MockTestDoc = {
      id: 'c5_math_mock_1',
      class: 5,
      classId: 'Class 5',
      title: 'Class 5 Mathematics Grand Board Mock Test 1',
      description: 'Comprehensive Class 5 Mathematics mock paper covering Large Numbers, Shapes, Fractions, Area, Perimeter, and Factors.',
      subject: 'Mathematics',
      subjectId: 'mathematics',
      testNumber: 1,
      duration: 30,
      durationMinutes: 30,
      totalQuestions: 10,
      totalMarks: 20,
      published: true,
      isPublished: true,
      instructions: [
        '1. The total duration of this mock test is 30 minutes.',
        '2. Read each question carefully before choosing or entering your answer.',
        '3. The exam carries a total of 20 marks across 10 questions.',
        '4. You can navigate between questions and review marked answers before final submission.',
        '5. If the timer expires, your test will be automatically evaluated and submitted.'
      ],
      createdAt: new Date().toISOString(),
      questions: mathQuestions
    };

    const evsQuestions: MockQuestion[] = [
      {
        id: 'c5_e1_q1',
        testId: 'c5_evs_mock_1',
        questionNumber: 1,
        subject: 'Environmental Studies',
        chapter: 'Super Senses',
        type: 'mcq',
        section: 'Section A: Multiple Choice Questions',
        question: 'Which sense organ helps a trained sniffer dog detect hidden objects and explosives?',
        options: ['Sense of vision', 'Sense of smell', 'Sense of hearing', 'Sense of touch'],
        correctAnswer: 1,
        explanation: 'Dogs have an exceptionally strong sense of smell, thousands of times more sensitive than humans.',
        hint: 'Dogs use their nose to detect scents.',
        marks: 2
      },
      {
        id: 'c5_e1_q2',
        testId: 'c5_evs_mock_1',
        questionNumber: 2,
        subject: 'Environmental Studies',
        chapter: 'From Tasting to Digesting',
        type: 'fill_in_blank',
        section: 'Section B: Fill in the Blanks',
        question: 'The acidic liquid produced inside human stomach that aids digestion is called _____ juice.',
        correctAnswer: 'gastric',
        explanation: 'Gastric juice contains hydrochloric acid and digestive enzymes that break down food.',
        hint: 'G...... juice in the stomach.',
        marks: 2
      },
      {
        id: 'c5_e1_q3',
        testId: 'c5_evs_mock_1',
        questionNumber: 3,
        subject: 'Environmental Studies',
        chapter: 'Seeds and Seeds',
        type: 'mcq',
        section: 'Section A: Multiple Choice Questions',
        question: 'Which seed gets dispersed to far distances by hooking onto animal fur?',
        options: ['Pea seed', 'Xanthium (Tiger nail)', 'Coconut seed', 'Mustard seed'],
        correctAnswer: 1,
        explanation: 'Xanthium seeds have sharp hooks that catch onto animal fur or human clothing for dispersal.',
        hint: 'Hooked seeds that stick to animal coats.',
        marks: 2
      },
      {
        id: 'c5_e1_q4',
        testId: 'c5_evs_mock_1',
        questionNumber: 4,
        subject: 'Environmental Studies',
        chapter: 'Experiments with Water',
        type: 'true_false',
        section: 'Section C: True or False',
        question: 'Salty water is denser than fresh water, making it easier for objects to float in it.',
        correctAnswer: 'True',
        explanation: 'Adding salt increases water density, providing higher buoyant force. (e.g. Dead Sea).',
        hint: 'Remember the lemon floating in salty water experiment.',
        marks: 2
      },
      {
        id: 'c5_e1_q5',
        testId: 'c5_evs_mock_1',
        questionNumber: 5,
        subject: 'Environmental Studies',
        chapter: 'A Treat for Mosquitoes',
        type: 'fill_in_blank',
        section: 'Section B: Fill in the Blanks',
        question: 'Female Anopheles mosquitoes spread the disease called _____.',
        correctAnswer: 'malaria',
        explanation: 'Female Anopheles mosquito transmits Plasmodium parasite causing malaria.',
        hint: 'Disease causing high fever with chills.',
        marks: 2
      },
      {
        id: 'c5_e1_q6',
        testId: 'c5_evs_mock_1',
        questionNumber: 6,
        subject: 'Environmental Studies',
        chapter: 'Up You Go!',
        type: 'mcq',
        section: 'Section A: Multiple Choice Questions',
        question: 'Who was the first Indian woman to conquer Mount Everest?',
        options: ['Kalpana Chawla', 'Bachendri Pal', 'Sunita Williams', 'Karnam Malleswari'],
        correctAnswer: 1,
        explanation: 'Bachendri Pal scaled Mount Everest on 23 May 1984 as the first Indian female mountaineer.',
        hint: 'Famous Indian female mountaineer.',
        marks: 2
      },
      {
        id: 'c5_e1_q7',
        testId: 'c5_evs_mock_1',
        questionNumber: 7,
        subject: 'Environmental Studies',
        chapter: 'What If It Finishes?',
        type: 'mcq',
        section: 'Section A: Multiple Choice Questions',
        question: 'Which of the following is a non-renewable fossil fuel source?',
        options: ['Solar energy', 'Wind power', 'Petroleum', 'Hydroelectric power'],
        correctAnswer: 2,
        explanation: 'Petroleum takes millions of years to form under the earth and cannot be renewed quickly.',
        hint: 'Fuel refined into petrol and diesel.',
        marks: 2
      },
      {
        id: 'c5_e1_q8',
        testId: 'c5_evs_mock_1',
        questionNumber: 8,
        subject: 'Environmental Studies',
        chapter: 'Seeds and Seeds',
        type: 'fill_in_blank',
        section: 'Section B: Fill in the Blanks',
        question: 'The green pigment present in leaves that absorbs sunlight for photosynthesis is _____.',
        correctAnswer: 'chlorophyll',
        explanation: 'Chlorophyll gives leaves their green colour and traps solar energy.',
        hint: 'Chl........',
        marks: 2
      },
      {
        id: 'c5_e1_q9',
        testId: 'c5_evs_mock_1',
        questionNumber: 9,
        subject: 'Environmental Studies',
        chapter: 'When the Earth Shook!',
        type: 'mcq',
        section: 'Section A: Multiple Choice Questions',
        question: 'A sudden shaking of the Earth surface caused by underground plate movements is an _____.',
        options: ['Earthquake', 'Cyclone', 'Flood', 'Drought'],
        correctAnswer: 0,
        explanation: 'An earthquake is a sudden tremor caused by movement of tectonic plates in Earth crust.',
        hint: 'Tremors and shaking of ground.',
        marks: 2
      },
      {
        id: 'c5_e1_q10',
        testId: 'c5_evs_mock_1',
        questionNumber: 10,
        subject: 'Environmental Studies',
        chapter: 'Super Senses',
        type: 'true_false',
        section: 'Section C: True or False',
        question: 'Ants leave a smell on the ground so that other ants can follow their path.',
        correctAnswer: 'True',
        explanation: 'Ants release pheromone chemical scent trails to guide their colony mates to food.',
        hint: 'Notice how ants walk in a straight line.',
        marks: 2
      }
    ];

    const evsTest: MockTestDoc = {
      id: 'c5_evs_mock_1',
      class: 5,
      classId: 'Class 5',
      title: 'Class 5 Environmental Studies (EVS) Board Mock Test 1',
      description: 'Official Class 5 EVS mock exam covering Super Senses, Digestion, Water Experiments, and Seed Germination.',
      subject: 'Environmental Studies',
      subjectId: 'evs',
      testNumber: 1,
      duration: 30,
      durationMinutes: 30,
      totalQuestions: 10,
      totalMarks: 20,
      published: true,
      isPublished: true,
      instructions: [
        '1. Total exam duration: 30 minutes.',
        '2. Exam consists of 10 curriculum-aligned questions (20 total marks).',
        '3. Read each question thoroughly before selecting your answer.',
        '4. Ensure your internet connection is stable throughout the exam.',
        '5. Your score and step-by-step explanations will be displayed immediately after submission.'
      ],
      createdAt: new Date().toISOString(),
      questions: evsQuestions
    };

    const englishQuestions: MockQuestion[] = [
      {
        id: 'c5_eng1_q1',
        testId: 'c5_english_mock_1',
        questionNumber: 1,
        subject: 'English',
        chapter: 'Nouns & Reading Comprehension',
        type: 'mcq',
        section: 'Section A: Multiple Choice Questions',
        question: 'Identify the noun in the sentence: "Ananya reads a storybook every night."',
        options: ['reads', 'storybook', 'every', 'nightly'],
        correctAnswer: 1,
        explanation: '"Storybook" is a naming word (thing/object), making it a noun.',
        hint: 'Look for a naming word for a thing.',
        marks: 2
      },
      {
        id: 'c5_eng1_q2',
        testId: 'c5_english_mock_1',
        questionNumber: 2,
        subject: 'English',
        chapter: 'Vocabulary & Antonyms',
        type: 'fill_in_blank',
        section: 'Section B: Fill in the Blanks',
        question: 'The opposite (antonym) of the word "brave" is _____.',
        correctAnswer: 'cowardly',
        explanation: 'Brave means courageous; the opposite is cowardly or timid.',
        hint: 'Opposite of showing courage.',
        marks: 2
      },
      {
        id: 'c5_eng1_q3',
        testId: 'c5_english_mock_1',
        questionNumber: 3,
        subject: 'English',
        chapter: 'Prepositions',
        type: 'mcq',
        section: 'Section A: Multiple Choice Questions',
        question: 'Which word is a preposition in: "The cat jumped over the wall"?',
        options: ['cat', 'jumped', 'over', 'wall'],
        correctAnswer: 2,
        explanation: '"Over" shows the position relationship between the cat and wall.',
        hint: 'A word showing location or position.',
        marks: 2
      },
      {
        id: 'c5_eng1_q4',
        testId: 'c5_english_mock_1',
        questionNumber: 4,
        subject: 'English',
        chapter: 'Verbs & Tenses',
        type: 'mcq',
        section: 'Section A: Multiple Choice Questions',
        question: 'Choose the correct simple past tense form of the verb "fly":',
        options: ['flied', 'flew', 'flying', 'flown'],
        correctAnswer: 1,
        explanation: 'The past tense of fly is "flew".',
        hint: 'Irregular past tense form of fly.',
        marks: 2
      },
      {
        id: 'c5_eng1_q5',
        testId: 'c5_english_mock_1',
        questionNumber: 5,
        subject: 'English',
        chapter: 'Teamwork',
        type: 'true_false',
        section: 'Section C: True or False',
        question: 'Achieving a common team goal requires active cooperation among all members.',
        correctAnswer: 'True',
        explanation: 'As highlighted in the poem "Teamwork", success depends on shared effort.',
        hint: 'Think about working together in a relay race.',
        marks: 2
      },
      {
        id: 'c5_eng1_q6',
        testId: 'c5_english_mock_1',
        questionNumber: 6,
        subject: 'English',
        chapter: 'Plural Nouns',
        type: 'fill_in_blank',
        section: 'Section B: Fill in the Blanks',
        question: 'The plural form of "child" is _____.',
        correctAnswer: 'children',
        explanation: 'Child is singular; children is the irregular plural form.',
        hint: 'Not "childs".',
        marks: 2
      },
      {
        id: 'c5_eng1_q7',
        testId: 'c5_english_mock_1',
        questionNumber: 7,
        subject: 'English',
        chapter: 'Spelling & Vocabulary',
        type: 'mcq',
        section: 'Section A: Multiple Choice Questions',
        question: 'Select the correctly spelled word:',
        options: ['Beutiful', 'Beautiful', 'Beautifull', 'Beatiful'],
        correctAnswer: 1,
        explanation: 'The correct spelling is B-E-A-U-T-I-F-U-L.',
        hint: 'Beau - ti - ful.',
        marks: 2
      },
      {
        id: 'c5_eng1_q8',
        testId: 'c5_english_mock_1',
        questionNumber: 8,
        subject: 'English',
        chapter: 'Synonyms',
        type: 'fill_in_blank',
        section: 'Section B: Fill in the Blanks',
        question: 'A word that has the same meaning as "cheerful" is _____.',
        correctAnswer: 'happy',
        explanation: 'Cheerful and happy both express feeling or showing joy.',
        hint: 'Ha...',
        marks: 1
      }
    ];

    const englishTest: MockTestDoc = {
      id: 'c5_english_mock_1',
      class: 5,
      classId: 'Class 5',
      title: 'Class 5 English Language & Grammar Mock Test 1',
      description: 'Curriculum-aligned Class 5 English mock test evaluating reading comprehension, grammar, and vocabulary.',
      subject: 'English',
      subjectId: 'english',
      testNumber: 1,
      duration: 25,
      durationMinutes: 25,
      totalQuestions: 8,
      totalMarks: 15,
      published: true,
      isPublished: true,
      instructions: [
        '1. Total exam duration: 25 minutes.',
        '2. Total marks: 15 across 8 questions.',
        '3. Answer all questions carefully.',
        '4. Submit before timer reaches 00:00.'
      ],
      createdAt: new Date().toISOString(),
      questions: englishQuestions
    };

    const testsToSeed = [mathTest, evsTest, englishTest];

    for (const t of testsToSeed) {
      await setDoc(doc(db, 'mockTests', t.id), t, { merge: true });
      await setDoc(doc(db, 'mock_tests', t.id), t, { merge: true });

      // Seed questions subcollection and collection
      for (const q of t.questions || []) {
        await setDoc(doc(db, 'mockTests', t.id, 'questions', q.id), q, { merge: true });
        await setDoc(doc(db, 'mock_test_questions', q.id), q, { merge: true });
      }
    }

    console.log('Class 5 Mock Tests successfully seeded to Firestore.');
  } catch (err) {
    console.warn('Error seeding Class 5 Mock Tests:', err);
  }
}

// Fetch published mock tests for Class 5 or requested grade
export async function fetchPublishedMockTests(
  classGrade: string = 'Class 5',
  subjectIdFilter?: string
): Promise<MockTestDoc[]> {
  try {
    const normGrade = normalizeGradeKey(classGrade);

    if (normGrade === 'Class 5') {
      await seedClass5MockTestsIfEmpty();
    }

    const testList: MockTestDoc[] = [];

    // Query mockTests
    const testsRef = collection(db, 'mockTests');
    const snap = await getDocs(testsRef);

    snap.docs.forEach((d) => {
      const data = d.data() as MockTestDoc;
      const isPublished = data.published === true || data.isPublished === true;
      const isClass5Match = data.class === 5 || data.class === '5' || data.classId === 'Class 5' || data.classId === '5';

      if (isPublished && (normGrade !== 'Class 5' || isClass5Match)) {
        if (!subjectIdFilter || subjectIdFilter === 'All' || data.subjectId === subjectIdFilter || data.subject?.toLowerCase() === subjectIdFilter.toLowerCase()) {
          testList.push({ id: d.id, ...data });
        }
      }
    });

    // Query mock_tests for backward compatibility
    if (testList.length === 0) {
      const legacyRef = collection(db, 'mock_tests');
      const legacySnap = await getDocs(legacyRef);

      legacySnap.docs.forEach((d) => {
        const data = d.data() as MockTestDoc;
        const isPublished = data.published === true || data.isPublished === true;
        const isClass5Match = data.class === 5 || data.class === '5' || data.classId === 'Class 5' || data.classId === '5';

        if (isPublished && (normGrade !== 'Class 5' || isClass5Match)) {
          if (!subjectIdFilter || subjectIdFilter === 'All' || data.subjectId === subjectIdFilter || data.subject?.toLowerCase() === subjectIdFilter.toLowerCase()) {
            if (!testList.some((t) => t.id === d.id)) {
              testList.push({ id: d.id, ...data });
            }
          }
        }
      });
    }

    return testList.sort((a, b) => a.testNumber - b.testNumber);
  } catch (err) {
    console.warn('Error fetching published mock tests:', err);
    return [];
  }
}

// Subscribe to Mock Tests list with optional class grade filtering
export function subscribeToMockTests(
  arg1: any,
  arg2?: any,
  arg3?: string
) {
  let subjectFilter: string | null = null;
  let callback: (tests: MockTestDoc[]) => void = () => {};
  let classGradeFilter: string = 'Class 10';

  if (typeof arg1 === 'function') {
    callback = arg1;
    if (typeof arg2 === 'string') {
      if (arg2.startsWith('Class')) {
        classGradeFilter = arg2;
      } else {
        subjectFilter = arg2;
      }
    }
    if (typeof arg3 === 'string') classGradeFilter = arg3;
  } else if (typeof arg2 === 'function') {
    callback = arg2;
    if (typeof arg1 === 'string') {
      if (arg1.startsWith('Class')) {
        classGradeFilter = arg1;
        subjectFilter = null;
      } else {
        subjectFilter = arg1;
      }
    }
    if (typeof arg3 === 'string') classGradeFilter = arg3;
  } else {
    subjectFilter = typeof arg1 === 'string' ? arg1 : null;
    callback = typeof arg2 === 'function' ? arg2 : () => {};
    classGradeFilter = typeof arg3 === 'string' ? arg3 : 'Class 10';
  }

  try {
    const normGrade = normalizeGradeKey(classGradeFilter);
    const testsRef = collection(db, 'mockTests');

    return onSnapshot(
      testsRef,
      (snap) => {
        let tests = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MockTestDoc));

        tests = tests.filter((t) => {
          const isPublished = t.published === true || t.isPublished === true;
          if (!isPublished) return false;
          
          const tGrade = t.classId || (t.class ? String(t.class) : '');
          if (!tGrade || tGrade === 'All') return true;

          const tNorm = normalizeGradeKey(tGrade);
          if (tNorm === normGrade) return true;

          const tNum = tGrade.match(/\d+/)?.[0];
          const targetNum = normGrade.match(/\d+/)?.[0];
          return Boolean(tNum && targetNum && tNum === targetNum);
        });

        if (subjectFilter && subjectFilter !== 'All') {
          tests = tests.filter(
            (t) =>
              t.subject?.toLowerCase() === subjectFilter?.toLowerCase() ||
              t.subjectId?.toLowerCase() === subjectFilter?.toLowerCase()
          );
        }

        if (tests.length === 0 && normGrade !== 'Class 5') {
          const fallbackList: MockTestDoc[] = [];
          CORE_SUBJECTS.forEach((sub) => {
            if (!subjectFilter || subjectFilter === 'All' || subjectFilter === sub) {
              fallbackList.push(...generateMockTestsListForSubject(sub, classGradeFilter));
            }
          });
          if (typeof callback === 'function') {
            callback(fallbackList);
          }
          return;
        }

        if (typeof callback === 'function') {
          callback(tests);
        }
      },
      (err) => {
        console.warn('Firestore mockTests warning:', err);
        if (typeof callback === 'function') {
          callback([]);
        }
      }
    );
  } catch (err) {
    console.warn('Error subscribing to mock tests:', err);
    if (typeof callback === 'function') {
      callback([]);
    }
    return () => {};
  }
}

// Fetch a single Mock Test along with its Questions from Firestore
export async function fetchMockTestWithQuestions(
  testId: string,
  subject: string,
  testNumber: number,
  classGrade: string = 'Class 5'
): Promise<{ test: MockTestDoc; questions: MockQuestion[] }> {
  try {
    // 1. Try to fetch test metadata
    let testDocRef = doc(db, 'mockTests', testId);
    let testSnap = await getDoc(testDocRef);

    if (!testSnap.exists()) {
      testDocRef = doc(db, 'mock_tests', testId);
      testSnap = await getDoc(testDocRef);
    }

    let testData: MockTestDoc | null = testSnap.exists()
      ? ({ id: testSnap.id, ...testSnap.data() } as MockTestDoc)
      : null;

    // 2. Fetch questions from questions subcollection or collection
    let questions: MockQuestion[] = [];

    if (testData?.questions && testData.questions.length > 0) {
      questions = testData.questions;
    } else {
      const subCollRef = collection(db, 'mockTests', testId, 'questions');
      const subSnap = await getDocs(subCollRef);

      if (!subSnap.empty) {
        questions = subSnap.docs.map((d) => ({ id: d.id, ...d.data() } as MockQuestion));
      } else {
        const qQuery = query(collection(db, 'mock_test_questions'), where('testId', '==', testId));
        const qSnap = await getDocs(qQuery);
        if (!qSnap.empty) {
          questions = qSnap.docs.map((d) => ({ id: d.id, ...d.data() } as MockQuestion));
        }
      }
    }

    if (questions.length > 0) {
      questions.sort((a, b) => a.questionNumber - b.questionNumber);
    }

    if (!testData) {
      testData = {
        id: testId,
        class: 5,
        classId: classGrade,
        title: `${classGrade} ${subject} Board Mock Test #${testNumber}`,
        subject,
        testNumber,
        duration: 30,
        durationMinutes: 30,
        totalQuestions: questions.length || 10,
        totalMarks: 20,
        published: true,
        isPublished: true,
        createdAt: new Date().toISOString()
      };
    }

    return { test: testData, questions };
  } catch (err) {
    console.warn('Error fetching mock test questions:', err);
    throw err;
  }
}

// Manage Active Mock Test Session in Firestore for Browser Refresh Resilience & Timer Sync
export async function getOrCreateActiveMockSession(
  studentId: string,
  test: MockTestDoc
): Promise<ActiveMockSession> {
  const sessionId = `${studentId}_${test.id}`;
  const sessionRef = doc(db, 'mockTestSessions', sessionId);

  try {
    const snap = await getDoc(sessionRef);

    if (snap.exists()) {
      const data = snap.data() as ActiveMockSession;

      if (data.status === 'in_progress') {
        const startedTimeMs = Date.parse(data.startedAt) || Date.now();
        const elapsedSeconds = Math.floor((Date.now() - startedTimeMs) / 1000);
        const totalDurationSecs = (data.durationMinutes || test.durationMinutes || test.duration || 30) * 60;
        const remainingSeconds = totalDurationSecs - elapsedSeconds;

        if (remainingSeconds <= 0) {
          return {
            ...data,
            remainingSeconds: 0,
            expired: true
          };
        }

        return {
          ...data,
          remainingSeconds
        };
      }
    }

    // Create new active session
    const durMins = test.durationMinutes || test.duration || 30;
    const newSession: ActiveMockSession = {
      id: sessionId,
      studentId,
      mockTestId: test.id,
      class: test.class || 5,
      startedAt: new Date().toISOString(),
      durationMinutes: durMins,
      durationSeconds: durMins * 60,
      remainingSeconds: durMins * 60,
      answers: {},
      currentQuestionIdx: 0,
      status: 'in_progress'
    };

    await setDoc(sessionRef, newSession, { merge: true });
    return newSession;
  } catch (err) {
    console.warn('Error managing active mock session in Firestore:', err);
    const durMins = test.durationMinutes || test.duration || 30;
    return {
      id: sessionId,
      studentId,
      mockTestId: test.id,
      class: test.class || 5,
      startedAt: new Date().toISOString(),
      durationMinutes: durMins,
      durationSeconds: durMins * 60,
      remainingSeconds: durMins * 60,
      answers: {},
      currentQuestionIdx: 0,
      status: 'in_progress'
    };
  }
}

// Safely auto-save student answers during active exam session
export async function saveActiveMockSessionState(
  studentId: string,
  mockTestId: string,
  answers: Record<number | string, UserAnswerState>,
  currentQuestionIdx: number
): Promise<void> {
  const sessionId = `${studentId}_${mockTestId}`;
  const sessionRef = doc(db, 'mockTestSessions', sessionId);

  try {
    // Sanitize answers object
    const sanitized: Record<string, any> = {};
    Object.keys(answers || {}).forEach((k) => {
      const val = answers[k];
      if (val) {
        sanitized[k] = {
          userAnswer: val.userAnswer === undefined ? null : val.userAnswer,
          status: val.status || 'unanswered',
          bookmarked: Boolean(val.bookmarked)
        };
      }
    });

    await updateDoc(sessionRef, {
      answers: sanitized,
      currentQuestionIdx,
      lastSavedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Error auto-saving mock session state:', err);
  }
}

// Save completed student exam attempt to Firestore & update progress
export async function saveCompletedMockTestAttempt(attempt: MockAttempt): Promise<string> {
  const attemptId = attempt.id || `att_${attempt.studentId || attempt.userId}_${Date.now()}`;
  const attemptRef = doc(db, 'mockTestAttempts', attemptId);
  const legacyAttemptRef = doc(db, 'mock_test_attempts', attemptId);

  try {
    // Check if duplicate submission
    const existingSnap = await getDoc(attemptRef);
    if (existingSnap.exists() && existingSnap.data()?.status === 'submitted') {
      console.warn('Attempt already submitted. Skipping duplicate submission.');
      return attemptId;
    }

    const payload: MockAttempt = {
      ...attempt,
      id: attemptId,
      studentId: attempt.studentId || attempt.userId,
      mockTestId: attempt.mockTestId || attempt.testId,
      status: 'submitted',
      submittedAt: attempt.submittedAt || new Date().toISOString()
    };

    await setDoc(attemptRef, payload, { merge: true });
    await setDoc(legacyAttemptRef, payload, { merge: true });

    // Mark session as submitted
    const sessionId = `${attempt.studentId || attempt.userId}_${attempt.mockTestId || attempt.testId}`;
    const sessionRef = doc(db, 'mockTestSessions', sessionId);
    await setDoc(sessionRef, { status: 'submitted', submittedAt: new Date().toISOString() }, { merge: true });

    // Update Student Progress Summary in Firestore
    const studentUid = attempt.studentId || attempt.userId;
    if (studentUid) {
      await updateMockProgressStatsInFirestore(studentUid, payload);
    }

    return attemptId;
  } catch (err) {
    console.error('Error saving completed mock attempt:', err);
    return attemptId;
  }
}

// Update Class 5 Progress metrics in Firestore without overwriting lesson/practice stats
async function updateMockProgressStatsInFirestore(studentUid: string, attempt: MockAttempt): Promise<void> {
  try {
    const attemptsRef = collection(db, 'mockTestAttempts');
    const q = query(attemptsRef, where('studentId', '==', studentUid));
    const snap = await getDocs(q);

    let bestScore = attempt.percentage;
    let attemptCount = snap.size;

    snap.docs.forEach((d) => {
      const data = d.data() as MockAttempt;
      if (typeof data.percentage === 'number') {
        bestScore = Math.max(bestScore, data.percentage);
      }
    });

    const progressRef = doc(db, 'progress', studentUid);
    await setDoc(
      progressRef,
      {
        studentUid,
        class: 'Class 5',
        latestMockScore: attempt.percentage,
        bestMockScore: bestScore,
        mockAttemptCount: attemptCount,
        lastMockAttemptAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Error updating student mock progress stats:', err);
  }
}

// Subscribe to real student mock attempts from Firestore
export function subscribeToStudentMockAttempts(
  studentId: string,
  classGrade: string = 'Class 5',
  callback: (attempts: MockAttempt[]) => void
): () => void {
  try {
    const attemptsRef = collection(db, 'mockTestAttempts');
    const q = query(attemptsRef, where('studentId', '==', studentId));

    return onSnapshot(
      q,
      (snap) => {
        let attempts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MockAttempt));
        if (attempts.length === 0) {
          const legacyRef = collection(db, 'mock_test_attempts');
          const legacyQ = query(legacyRef, where('userId', '==', studentId));
          getDocs(legacyQ).then((lSnap) => {
            const legacyList = lSnap.docs.map((d) => ({ id: d.id, ...d.data() } as MockAttempt));
            callback(legacyList.sort((a, b) => Date.parse(b.submittedAt || b.completedAt) - Date.parse(a.submittedAt || a.completedAt)));
          }).catch(() => callback([]));
          return;
        }

        attempts.sort((a, b) => Date.parse(b.submittedAt || b.completedAt) - Date.parse(a.submittedAt || a.completedAt));
        callback(attempts);
      },
      (err) => {
        console.warn('Error subscribing to mock attempts:', err);
        callback([]);
      }
    );
  } catch (err) {
    console.warn('Error setting up mock attempts listener:', err);
    callback([]);
    return () => {};
  }
}

// Save student exam attempt to Firestore (legacy helper)
export async function saveMockAttempt(attempt: Omit<MockAttempt, 'id'>): Promise<string> {
  return saveCompletedMockTestAttempt({ id: `att_${Date.now()}`, ...attempt } as MockAttempt);
}

// Fetch user attempts
export async function fetchUserMockAttempts(userId: string): Promise<MockAttempt[]> {
  try {
    const attemptsRef = collection(db, 'mockTestAttempts');
    const q = query(attemptsRef, where('studentId', '==', userId));
    const snap = await getDocs(q);

    if (snap.empty) {
      const legacyRef = collection(db, 'mock_test_attempts');
      const legacyQ = query(legacyRef, where('userId', '==', userId));
      const lSnap = await getDocs(legacyQ);
      return lSnap.docs.map((d) => ({ id: d.id, ...d.data() } as MockAttempt));
    }

    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MockAttempt));
  } catch (err) {
    console.warn('Error fetching user attempts:', err);
    return [];
  }
}

// Teacher Dashboard: Create or publish a custom mock test
export async function saveTeacherMockTest(
  testData: Partial<MockTestDoc>,
  questions: MockQuestion[]
): Promise<string> {
  const testId = testData.id || `custom_${Date.now()}`;
  const fullTest: MockTestDoc = {
    id: testId,
    class: testData.class || 5,
    classId: testData.classId || 'Class 5',
    title: testData.title || 'Untitled Grand Mock Test',
    description: testData.description || 'Custom Teacher Published Mock Test',
    subject: testData.subject || 'Mathematics',
    subjectId: testData.subjectId || 'mathematics',
    testNumber: testData.testNumber || 1,
    duration: testData.duration || testData.durationMinutes || 30,
    durationMinutes: testData.durationMinutes || testData.duration || 30,
    totalQuestions: questions.length || 10,
    totalMarks: testData.totalMarks || 20,
    published: true,
    isPublished: true,
    instructions: testData.instructions || [
      '1. Read each question carefully.',
      '2. Answer all questions before duration ends.',
      '3. Submit test upon completion.'
    ],
    board: testData.board || 'Telangana & AP State Board',
    createdAt: new Date().toISOString(),
    questions
  };

  await setDoc(doc(db, 'mockTests', testId), fullTest, { merge: true });
  await setDoc(doc(db, 'mock_tests', testId), fullTest, { merge: true });

  if (questions.length > 0) {
    for (const q of questions) {
      const qId = q.id || `${testId}_q${q.questionNumber}`;
      await setDoc(doc(db, 'mockTests', testId, 'questions', qId), { ...q, testId }, { merge: true });
      await setDoc(doc(db, 'mock_test_questions', qId), { ...q, testId }, { merge: true });
    }
  }

  return testId;
}

// Teacher Dashboard: Delete mock question
export async function deleteMockQuestion(questionId: string) {
  try {
    await deleteDoc(doc(db, 'mock_test_questions', questionId));
  } catch (err) {
    console.warn('Error deleting question:', err);
  }
}

// Teacher Dashboard: Delete mock test
export async function deleteMockTest(testId: string) {
  try {
    await deleteDoc(doc(db, 'mockTests', testId));
    await deleteDoc(doc(db, 'mock_tests', testId));
  } catch (err) {
    console.warn('Error deleting test:', err);
  }
}

