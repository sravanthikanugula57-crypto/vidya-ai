export interface ExamQuestion {
  qNo: number;
  section: 'Part A - Section I' | 'Part A - Section II' | 'Part A - Section III' | 'Part B - Bit Paper (MCQ)';
  marks: number;
  questionTextEn: string;
  questionTextTe?: string;
  diagramUrl?: string;
  options?: { key: 'A' | 'B' | 'C' | 'D'; textEn: string; textTe?: string }[];
  modelAnswerEn?: string;
  modelAnswerTe?: string;
  chapter?: string;
}

export interface DetailedPreviousPaper {
  id: string;
  title: string;
  subject: string;
  board: 'AP SSC' | 'Telangana SSC';
  year: '2024' | '2023' | '2022' | '2021' | '2020';
  medium: 'English' | 'Telugu' | 'Urdu';
  totalMarks: number;
  duration: string;
  instructions: string[];
  pdfUrl: string;
  questions: ExamQuestion[];
  answerKeySummary?: string;
}

export const REAL_PREVIOUS_QUESTION_PAPERS: DetailedPreviousPaper[] = [
  {
    id: 'pyq_ts_2024_maths_em',
    title: 'Telangana SSC Board Public Examination 2024 Mathematics Paper I & II',
    subject: 'Mathematics',
    board: 'Telangana SSC',
    year: '2024',
    medium: 'English',
    totalMarks: 80,
    duration: '3 Hours 15 Minutes',
    pdfUrl: 'https://bse.telangana.gov.in/pdf/SSC_2024_Maths_EM.pdf',
    instructions: [
      'First 15 minutes are allotted for reading the question paper thoroughly.',
      'Part A consists of 3 Sections: Section I (6x2=12M), Section II (6x4=24M), Section III (4x8=32M with internal choice).',
      'Part B consists of 12 Multiple Choice Questions (12x1=12M) to be answered in the OMR/Bit sheet.',
      'All calculations and rough work must be shown clearly in the margin.'
    ],
    questions: [
      // SECTION I (2 MARKS)
      {
        qNo: 1,
        section: 'Part A - Section I',
        marks: 2,
        chapter: 'Real Numbers',
        questionTextEn: 'Find the HCF of 96 and 404 by the prime factorisation method. Hence, find their LCM.',
        questionTextTe: 'ప్రధాన కారణాంకాల పద్ధతి ద్వారా 96 మరియు 404 ల HCF ని కనుగొనండి. దాని నుండి వాటి LCM ని కనుగొనండి.',
        modelAnswerEn: '96 = 2^5 × 3, 404 = 2^2 × 101. HCF = 2^2 = 4. Since HCF × LCM = a × b => 4 × LCM = 96 × 404 => LCM = 9696.',
        modelAnswerTe: '96 = 2^5 × 3, 404 = 2^2 × 101. HCF = 4. LCM = (96 × 404) / 4 = 9696.'
      },
      {
        qNo: 2,
        section: 'Part A - Section I',
        marks: 2,
        chapter: 'Polynomials',
        questionTextEn: 'Find a quadratic polynomial whose sum and product of zeroes are -3 and 2 respectively.',
        questionTextTe: 'శూన్యాల మొత్తం -3 మరియు శూన్యాల లబ్ధం 2 గా ఉన్న వర్గ బహుపదిని కనుగొనండి.',
        modelAnswerEn: 'P(x) = k[x² - (sum of zeroes)x + (product of zeroes)] = k[x² - (-3)x + 2] = x² + 3x + 2.',
        modelAnswerTe: 'P(x) = x² + 3x + 2.'
      },
      {
        qNo: 3,
        section: 'Part A - Section I',
        marks: 2,
        chapter: 'Coordinate Geometry',
        questionTextEn: 'Find the distance between the points A(2, 3) and B(4, 1).',
        questionTextTe: 'A(2, 3) మరియు B(4, 1) బిందువుల మధ్య దూరాన్ని కనుగొనండి.',
        modelAnswerEn: 'd = √[(x2 - x1)² + (y2 - y1)²] = √[(4 - 2)² + (1 - 3)²] = √[4 + 4] = √8 = 2√2 units.',
        modelAnswerTe: 'd = √[(4 - 2)² + (1 - 3)²] = √8 = 2√2 యూనిట్లు.'
      },
      {
        qNo: 4,
        section: 'Part A - Section I',
        marks: 2,
        chapter: 'Trigonometry',
        questionTextEn: 'If sin A = 3/4, calculate cos A and tan A.',
        questionTextTe: 'sin A = 3/4 అయితే cos A మరియు tan A విలువలను లెక్కించండి.',
        modelAnswerEn: 'Opp = 3, Hyp = 4. Adj = √(4² - 3²) = √7. cos A = √7/4, tan A = 3/√7.',
        modelAnswerTe: 'cos A = √7/4, tan A = 3/√7.'
      },

      // SECTION II (4 MARKS)
      {
        qNo: 7,
        section: 'Part A - Section II',
        marks: 4,
        chapter: 'Real Numbers',
        questionTextEn: 'Prove that √5 is an irrational number using proof by contradiction.',
        questionTextTe: 'విరోధాభాస పద్ధతి ద్వారా √5 ఒక కరణీయ సంఖ్య అని నిరూపించండి.',
        modelAnswerEn: 'Let √5 = a/b where a and b are coprime integers (b ≠ 0). 5b² = a² => 5 divides a² => 5 divides a. Let a = 5c => 5b² = 25c² => b² = 5c² => 5 divides b. Thus 5 is a common factor of both a and b, contradicting that a and b are coprime. Hence √5 is irrational.',
        modelAnswerTe: '√5 ని క్రమ సంఖ్య అనుకుందాం √5 = a/b. 5b² = a² కావున 5 ని a భాగిస్తుంది. కావున a మరియు b లకు 5 సామాన్య కారణాంకం అవుతుంది, ఇది విరోధాభాసం. కాబట్టి √5 ఒక కరణీయ సంఖ్య.'
      },
      {
        qNo: 8,
        section: 'Part A - Section II',
        marks: 4,
        chapter: 'Arithmetic Progressions',
        questionTextEn: 'Find the sum of first 40 positive integers divisible by 6.',
        questionTextTe: '6 చే నిశ్శేషంగా భాగించబడే మొదటి 40 ధన పూర్ణసంఖ్యల మొత్తాన్ని కనుగొనండి.',
        modelAnswerEn: 'AP: 6, 12, 18, ..., 240. a = 6, d = 6, n = 40. Sn = (n/2)[2a + (n-1)d] = (20)[12 + (39×6)] = 20 × [12 + 234] = 20 × 246 = 4920.',
        modelAnswerTe: 'మొత్తం = 4920.'
      },

      // SECTION III (8 MARKS)
      {
        qNo: 13,
        section: 'Part A - Section III',
        marks: 8,
        chapter: 'Pair of Linear Equations in Two Variables',
        questionTextEn: 'Solve the following pair of linear equations graphically: 2x + y = 6 and 2x - y = 2. Also find the coordinates of vertices of triangle formed by these lines and the x-axis.',
        questionTextTe: 'రేఖాచిత్ర పద్ధతి ద్వారా 2x + y = 6 మరియు 2x - y = 2 సమీకరణాల జతను సాధించండి.',
        modelAnswerEn: 'Table for 2x + y = 6: (0,6), (3,0), (2,2). Table for 2x - y = 2: (0,-2), (1,0), (2,2). Point of intersection is (2,2) so x = 2, y = 2. Triangle with x-axis has vertices (1,0), (3,0) and (2,2). Area = 1/2 × base × height = 1/2 × 2 × 2 = 2 sq units.',
        modelAnswerTe: 'ఖండన బిందువు (2,2). కావున x = 2, y = 2.'
      },

      // PART B (MCQ BITS)
      {
        qNo: 17,
        section: 'Part B - Bit Paper (MCQ)',
        marks: 1,
        chapter: 'Statistics',
        questionTextEn: 'The empirical relationship between Mean, Median, and Mode is:',
        questionTextTe: 'అంకమధ్యమం, మధ్యగతం మరియు బాహుళకంల మధ్య సంబంధం:',
        options: [
          { key: 'A', textEn: 'Mode = 3 Median - 2 Mean', textTe: 'బాహుళకం = 3 మధ్యగతం - 2 అంకమధ్యమం' },
          { key: 'B', textEn: 'Mode = 2 Median - 3 Mean', textTe: 'బాహుళకం = 2 మధ్యగతం - 3 అంకమధ్యమం' },
          { key: 'C', textEn: 'Median = 3 Mode - 2 Mean', textTe: 'మధ్యగతం = 3 బాహుళకం - 2 అంకమధ్యమం' },
          { key: 'D', textEn: 'Mean = 3 Mode - 2 Median', textTe: 'అంకమధ్యమం = 3 బాహుళకం - 2 మధ్యగతం' }
        ],
        modelAnswerEn: 'A (Mode = 3 Median - 2 Mean)'
      },
      {
        qNo: 18,
        section: 'Part B - Bit Paper (MCQ)',
        marks: 1,
        chapter: 'Probability',
        questionTextEn: 'Which of the following cannot be the probability of an event?',
        questionTextTe: 'కింది వాటిలో ఏది ఒక ఘటన సంభవించే సంభావ్యత కాజాలదు?',
        options: [
          { key: 'A', textEn: '2/3', textTe: '2/3' },
          { key: 'B', textEn: '-1.5', textTe: '-1.5' },
          { key: 'C', textEn: '15%', textTe: '15%' },
          { key: 'D', textEn: '0.7', textTe: '0.7' }
        ],
        modelAnswerEn: 'B (-1.5, because probability can never be negative)'
      }
    ]
  },

  {
    id: 'pyq_ap_2024_physics_em',
    title: 'Andhra Pradesh SSC Board Public Examination 2024 Physical Science Paper',
    subject: 'Physical Science',
    board: 'AP SSC',
    year: '2024',
    medium: 'English',
    totalMarks: 50,
    duration: '2 Hours 00 Minutes',
    pdfUrl: 'https://bse.ap.gov.in/pdf/SSC_2024_Physics_EM.pdf',
    instructions: [
      'The question paper contains 4 Sections: Section I (6x1=6M), Section II (4x2=8M), Section III (5x4=20M), Section IV (2x8=16M).',
      'Draw neat, labeled diagrams wherever necessary using a ruler and pencil.',
      'Write SI units for all calculated quantities.'
    ],
    questions: [
      {
        qNo: 1,
        section: 'Part A - Section I',
        marks: 1,
        chapter: 'Reflection of Light',
        questionTextEn: 'Write the relation between focal length (f) and radius of curvature (R) of a spherical mirror.',
        questionTextTe: 'గోళాకార దర్పణం యొక్క నాభ్యాంతరం (f) మరియు వక్రతా వ్యాసార్థం (R) ల మధ్య సంబంధాన్ని రాయండి.',
        modelAnswerEn: 'f = R / 2 or R = 2f.'
      },
      {
        qNo: 2,
        section: 'Part A - Section II',
        marks: 2,
        chapter: 'Electric Current',
        questionTextEn: 'State Ohm’s Law and write its mathematical equation.',
        questionTextTe: 'ఓమ్ నియమాన్ని నిర్వచించి, దాని గణిత సమీకరణాన్ని రాయండి.',
        modelAnswerEn: 'Ohm’s Law states that at constant temperature, electric current flowing through a conductor is directly proportional to potential difference across its ends. Equation: V = IR.'
      },
      {
        qNo: 3,
        section: 'Part A - Section III',
        marks: 4,
        chapter: 'Refraction of Light',
        questionTextEn: 'A convex lens forms a real and inverted image of an object at a distance of 50 cm from it. Where is the object placed in front of the convex lens if the image is equal to the size of the object? Also, find the power of the lens.',
        questionTextTe: 'ఒక కుంభకార కటకం దాని నుండి 50 సెం.మీ దూరంలో వస్తు పరిమాణంతో సమానమైన నిజ, తలక్రిందుల ప్రతిబింబాన్ని ఏర్పరుస్తుంది. వస్తువును ఎక్కడ ఉంచారు? కటక సామర్థ్యాన్ని కనుగొనండి.',
        modelAnswerEn: 'Since image is real and equal in size, object is at 2F1 and image at 2F2. Thus v = +50 cm, u = -50 cm. 2f = 50 cm => f = 25 cm = 0.25 m. Power P = 1/f(m) = 1/0.25 = +4 Dioptres.'
      },
      {
        qNo: 4,
        section: 'Part A - Section III',
        marks: 8,
        chapter: 'Electric Current',
        questionTextEn: 'Explain an experiment to verify Ohm’s Law with a neat circuit diagram, tabular column, and graph between Voltage (V) and Current (I).',
        questionTextTe: 'ఓమ్ నియమాన్ని సరిచూసే ప్రయోగాన్ని వలయ చిత్రం, పట్టిక మరియు V-I గ్రాఫ్‌తో వివరించండి.',
        modelAnswerEn: 'Apparatus: Battery, Rheostat, Ammeter, Voltmeter, Resistor, Key. Procedure: Connect circuit in series with voltmeter across resistor. Vary rheostat to get different I and V readings. Plot V vs I graph. Result: Graph is a straight line passing through origin, verifying V ∝ I.'
      }
    ]
  },

  {
    id: 'pyq_ts_2024_bio_em',
    title: 'Telangana SSC Public Examination 2024 Biological Science Paper',
    subject: 'Biological Science',
    board: 'Telangana SSC',
    year: '2024',
    medium: 'English',
    totalMarks: 40,
    duration: '1 Hour 30 Minutes',
    pdfUrl: 'https://bse.telangana.gov.in/pdf/SSC_2024_BioScience_EM.pdf',
    instructions: [
      'Question paper comprises 3 Sections: Section I (6x1=6M), Section II (4x2=8M), Section III (4x4=16M), Part B (10x1=10M).',
      'Diagrams must be neatly drawn and labeled clearly.'
    ],
    questions: [
      {
        qNo: 1,
        section: 'Part A - Section I',
        marks: 1,
        chapter: 'Nutrition',
        questionTextEn: 'Write the overall chemical equation for photosynthesis given by C.B. van Niel and simplified by Robert Hill.',
        questionTextTe: 'కిరణజన్య సంయోగక్రియ సమతుల్య రసాయన సమీకరణాన్ని రాయండి.',
        modelAnswerEn: '6CO2 + 12H2O --(Light & Chlorophyll)--> C6H12O6 + 6O2 + 6H2O.'
      },
      {
        qNo: 2,
        section: 'Part A - Section II',
        marks: 2,
        chapter: 'Respiration',
        questionTextEn: 'What are the differences between Aerobic and Anaerobic respiration?',
        questionTextTe: 'వాయు సహిత మరియు అవాయు శ్వాసక్రియల మధ్య తేడాలను రాయండి.',
        modelAnswerEn: 'Aerobic: Occurs in presence of O2, produces 38 ATP, end products CO2 + H2O. Anaerobic: Occurs in absence of O2, produces 2 ATP, end products Lactic acid or Ethanol + CO2.'
      },
      {
        qNo: 3,
        section: 'Part A - Section III',
        marks: 4,
        chapter: 'Transportation',
        questionTextEn: 'Draw a neat labeled diagram of Internal Structure of Human Heart and write the flow of blood through cardiac chambers.',
        questionTextTe: 'మానవ గుండె అంతర్నిర్మాణ చిత్రం గీచి భాగాలను గుర్తించి, రక్తం ప్రసరించే మార్గాన్ని వివరించండి.',
        modelAnswerEn: 'Diagram showing Right Atrium, Right Ventricle, Left Atrium, Left Ventricle, Aorta, Vena Cava, Pulmonary Artery. Deoxygenated blood enters Right Atrium -> Right Ventricle -> Lungs -> Oxygenated blood -> Left Atrium -> Left Ventricle -> Aorta -> Body.'
      }
    ]
  },

  {
    id: 'pyq_ap_2024_social_em',
    title: 'Andhra Pradesh SSC Public Examination 2024 Social Studies Paper',
    subject: 'Social Studies',
    board: 'AP SSC',
    year: '2024',
    medium: 'English',
    totalMarks: 100,
    duration: '3 Hours 15 Minutes',
    pdfUrl: 'https://bse.ap.gov.in/pdf/SSC_2024_Social_EM.pdf',
    instructions: [
      'All 4 Sections (Geography, Economics, History, Civics) are compulsory.',
      'Map work (Part of Section IV) must be pinned inside answer booklet.'
    ],
    questions: [
      {
        qNo: 1,
        section: 'Part A - Section I',
        marks: 2,
        chapter: 'India - Relief Features',
        questionTextEn: 'Differentiate between Western Ghats and Eastern Ghats.',
        questionTextTe: 'పశ్చిమ కనుమలు మరియు తూర్పు కనుమల మధ్య తేడాలను రాయండి.',
        modelAnswerEn: 'Western Ghats: Continuous range, higher elevation (Anamudi 2695m), source of major rivers. Eastern Ghats: Discontinuous, cut by rivers, lower elevation (Armakonda 1680m).'
      },
      {
        qNo: 2,
        section: 'Part A - Section III',
        marks: 8,
        chapter: 'Indian Constitution',
        questionTextEn: 'Explain the Preamble of the Indian Constitution and its key values like Sovereign, Socialist, Secular, Democratic Republic.',
        questionTextTe: 'భారత రాజ్యాంగ ప్రవేశిక (Preamble) మరియు దాని ప్రాథమిక సూత్రాలను వివరించండి.',
        modelAnswerEn: 'Preamble is the key to Constitution. Sovereign: Independent nation. Socialist: Economic equality. Secular: All religions equal. Democratic: People elect govt. Republic: Elected head of state.'
      }
    ]
  }
];

export function getDetailedPaperById(paperId: string): DetailedPreviousPaper | undefined {
  return REAL_PREVIOUS_QUESTION_PAPERS.find(p => p.id === paperId);
}
