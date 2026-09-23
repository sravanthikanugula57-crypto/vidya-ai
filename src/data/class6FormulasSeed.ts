import { ChapterFormulaSheet } from './allChapterFormulas';

export const CLASS_6_MATH_FORMULAS: ChapterFormulaSheet[] = [
  {
    classGrade: 'Class 6',
    subjectId: 'c6_math',
    subjectName: 'Mathematics',
    chapterNumber: 1,
    chapterTitle: 'Knowing Our Numbers (సంఖ్యలను తెలుసుకుందాం)',
    nativeTitle: 'సంఖ్యలు, స్థాన విలువలు & అంచనా వేయుట',
    topicSummary: 'Indian and International Number Systems, Estimation and Rounding off, Roman Numerals, Bracket Usage.',
    formulas: [
      {
        id: 'c6_m1_1',
        title: 'Place Value Systems Comparison (సంఖ్యామాన పద్ధతులు)',
        formula: '1 \\text{ Million} = 10 \\text{ Lakhs} = 1,000,000 (10^6), \\quad 10 \\text{ Million} = 1 \\text{ Crore} = 10,000,000 (10^7)',
        variables: [
          { symbol: 'Indian System', meaning: 'Periods: Ones (3 digits), Thousands (2 digits), Lakhs (2 digits), Crores (2 digits)' },
          { symbol: 'International System', meaning: 'Periods: Ones (3 digits), Thousands (3 digits), Millions (3 digits)' }
        ],
        explanation: 'In the Indian system, commas are placed after 3 digits from right, then after every 2 digits. In the International system, commas are placed after every 3 digits.',
        rules: [
          'Indian: 5,43,21,987 (Five crore forty-three lakh twenty-one thousand nine hundred eighty-seven).',
          'International: 54,321,987 (Fifty-four million three hundred twenty-one thousand nine hundred eighty-seven).'
        ],
        examples: [
          {
            question: 'How many thousands make a million?',
            solution: '1 Million = 1,000,000. 1 Thousand = 1,000. Therefore, 1,000,000 ÷ 1,000 = 1,000 thousands make a million.'
          }
        ],
        examTip: 'Place commas correctly according to the requested number system in 1-mark objective questions.',
        boardMarks: '1-2 Marks',
        teluguExplanation: '1 మిలియన్ = 10 లక్షలు; 10 మిలియన్లు = 1 కోటి; 1 బిలియన్ = 100 కోట్లు.'
      },
      {
        id: 'c6_m1_2',
        title: 'Roman Numerals Rules (రోమన్ సంఖ్యల నియమాలు)',
        formula: '\\text{I}=1, \\; \\text{V}=5, \\; \\text{X}=10, \\; \\text{L}=50, \\; \\text{C}=100, \\; \\text{D}=500, \\; \\text{M}=1000',
        variables: [
          { symbol: 'Repetition', meaning: 'A symbol can be repeated maximum 3 times (e.g. III=3, XXX=30, CCC=300)' },
          { symbol: 'V, L, D', meaning: 'Never repeated and never subtracted' }
        ],
        explanation: 'If a smaller symbol is written to the right of a greater symbol, its value is added. If written to the left, it is subtracted.',
        rules: [
          'VI = 5 + 1 = 6; IV = 5 - 1 = 4.',
          'LX = 50 + 10 = 60; XL = 50 - 10 = 40.',
          'XC = 100 - 10 = 90; CD = 500 - 100 = 400.'
        ],
        examples: [
          {
            question: 'Write 69 and 98 in Roman numerals.',
            solution: '69 = 60 + 9 = LX + IX = LXIX.\n98 = 90 + 8 = XC + VIII = XCVIII.'
          }
        ],
        examTip: 'Remember that I can be subtracted only from V and X; X can be subtracted only from L and C.',
        boardMarks: '2 Marks',
        teluguExplanation: 'రోమన్ సంఖ్యలలో V, L, D లను ఎప్పుడూ తీసివేయకూడదు మరియు పునరావృతం చేయకూడదు.'
      }
    ]
  },
  {
    classGrade: 'Class 6',
    subjectId: 'c6_math',
    subjectName: 'Mathematics',
    chapterNumber: 2,
    chapterTitle: 'Whole Numbers (పూర్ణాంకాలు)',
    nativeTitle: 'పూర్ణాంకాల ధర్మాలు & సంఖ్యా రేఖ',
    topicSummary: 'Natural Numbers vs Whole Numbers, Number Line Operations, Closure, Commutative, Associative, and Distributive Properties.',
    formulas: [
      {
        id: 'c6_m2_1',
        title: 'Properties of Whole Numbers (పూర్ణాంకాల ధర్మాలు)',
        formula: '\\begin{aligned} \\text{Closure: } & a + b \\in \\mathbb{W}, \\quad a \\times b \\in \\mathbb{W} \\\\ \\text{Commutative: } & a + b = b + a, \\quad a \\times b = b \\times a \\\\ \\text{Associative: } & (a + b) + c = a + (b + c), \\quad (a \\times b) \\times c = a \\times (b \\times c) \\\\ \\text{Distributive: } & a \\times (b + c) = (a \\times b) + (a \\times c) \\end{aligned}',
        variables: [
          { symbol: 'a, b, c', meaning: 'Any whole numbers {0, 1, 2, 3, ...}' },
          { symbol: '0 (Zero)', meaning: 'Additive Identity: a + 0 = 0 + a = a' },
          { symbol: '1 (One)', meaning: 'Multiplicative Identity: a × 1 = 1 × a = a' }
        ],
        explanation: 'Distributive property of multiplication over addition simplifies complex multiplications.',
        rules: [
          'Division by zero is NOT defined.',
          'Subtraction and Division of whole numbers are NOT closed or commutative.'
        ],
        examples: [
          {
            question: 'Find the product 12 × 35 using the distributive property.',
            solution: '12 × 35 = 12 × (30 + 5) = (12 × 30) + (12 × 5) = 360 + 60 = 420.'
          }
        ],
        examTip: 'Always name the specific property used in your simplification steps for 2-mark questions.',
        boardMarks: '2-4 Marks',
        teluguExplanation: 'సంకలన విభాగ న్యాయం: a × (b + c) = (a × b) + (a × c). శూన్యంతో భాగహారం నిర్వచించబడదు.'
      }
    ]
  },
  {
    classGrade: 'Class 6',
    subjectId: 'c6_math',
    subjectName: 'Mathematics',
    chapterNumber: 3,
    chapterTitle: 'Playing with Numbers (సంఖ్యలతో ఆడుకుందాం)',
    nativeTitle: 'భాజనీయతా సూత్రాలు, HCF & LCM',
    topicSummary: 'Divisibility Rules (2, 3, 4, 5, 6, 8, 9, 10, 11), Prime & Composite Numbers, Prime Factorisation, HCF and LCM Relation.',
    formulas: [
      {
        id: 'c6_m3_1',
        title: 'HCF and LCM Relation Formula (గ.సా.భా & క.సా.గు సంబంధం)',
        formula: '\\text{HCF} \\times \\text{LCM} = \\text{Product of the Two Numbers} = a \\times b',
        variables: [
          { symbol: 'HCF (గ.సా.భా)', meaning: 'Highest Common Factor (Greatest Common Divisor)' },
          { symbol: 'LCM (క.సా.గు)', meaning: 'Lowest Common Multiple' },
          { symbol: 'a, b', meaning: 'The two given natural numbers' }
        ],
        explanation: 'For any two given numbers, the product of their HCF and LCM is always equal to the product of the numbers themselves.',
        rules: [
          'LCM of two co-prime numbers is equal to their product.',
          'HCF of two co-prime numbers is always 1.'
        ],
        examples: [
          {
            question: 'The HCF of two numbers is 6 and their LCM is 36. If one number is 12, find the other number.',
            solution: 'Other number = (HCF × LCM) ÷ Given number = (6 × 36) ÷ 12 = 216 ÷ 12 = 18.'
          }
        ],
        examTip: 'High-frequency 4-mark board question in AP SCERT terminal exams.',
        boardMarks: '4 Marks',
        teluguExplanation: 'రెండు సంఖ్యల లబ్ధం = వాటి గ.సా.భా × క.సా.గు.'
      },
      {
        id: 'c6_m3_2',
        title: 'Divisibility Tests Key Rules (భాజనీయతా సూత్రాలు)',
        formula: '\\text{Div by 3: Sum of digits} \\div 3, \\quad \\text{Div by 11: } |\\text{Sum(odd places)} - \\text{Sum(even places)}| = 0 \\text{ or mult of 11}',
        variables: [
          { symbol: 'Divisible by 4', meaning: 'Last 2 digits divisible by 4' },
          { symbol: 'Divisible by 6', meaning: 'Divisible by both 2 and 3' },
          { symbol: 'Divisible by 8', meaning: 'Last 3 digits divisible by 8' },
          { symbol: 'Divisible by 9', meaning: 'Sum of all digits divisible by 9' }
        ],
        explanation: 'Divisibility tests allow checking if a large number is divisible without performing full long division.',
        rules: [
          'Number ending in 0, 2, 4, 6, 8 is divisible by 2.',
          'Number ending in 0 or 5 is divisible by 5.',
          'Number ending in 0 is divisible by 10.'
        ],
        examples: [
          {
            question: 'Check whether 61809 is divisible by 11.',
            solution: 'Sum of odd place digits (from right): 9 + 8 + 6 = 23.\nSum of even place digits: 0 + 1 = 1.\nDifference: 23 - 1 = 22. Since 22 is divisible by 11, 61809 is divisible by 11.'
          }
        ],
        examTip: 'State the difference of sums clearly when showing step-by-step 11-divisibility tests.',
        boardMarks: '2 Marks',
        teluguExplanation: '11 యొక్క భాజనీయతా సూత్రం: సరి స్థానాల అంకెల మొత్తం మరియు బేసి స్థానాల అంకెల మొత్తం యొక్క భేదం 0 లేదా 11 యొక్క గుణిజం కావాలి.'
      }
    ]
  },
  {
    classGrade: 'Class 6',
    subjectId: 'c6_math',
    subjectName: 'Mathematics',
    chapterNumber: 6,
    chapterTitle: 'Integers (పూర్ణ సంఖ్యలు)',
    nativeTitle: 'పూర్ణ సంఖ్యల సంకలనం, వ్యవకలనం & నియమాలు',
    topicSummary: 'Positive and Negative Integers, Absolute Value, Number Line Addition & Subtraction, Rules of Signs.',
    formulas: [
      {
        id: 'c6_m6_1',
        title: 'Integer Addition and Subtraction Rules (పూర్ణ సంఖ్యల గుర్తుల నియమాలు)',
        formula: '\\begin{aligned} (+a) + (+b) &= +(a + b) \\\\ (-a) + (-b) &= -(a + b) \\\\ (+a) + (-b) &= \\text{Sign of larger absolute value } (|a| - |b|) \\\\ a - b &= a + (\\text{Additive inverse of } b) = a + (-b) \\end{aligned}',
        variables: [
          { symbol: 'Additive Inverse', meaning: 'Opposite integer with opposite sign (Additive inverse of +7 is -7; of -5 is +5)' },
          { symbol: 'Absolute Value |x|', meaning: 'Distance from zero without considering sign (| -8 | = 8)' }
        ],
        explanation: 'Subtracting an integer is the same as adding its additive inverse.',
        rules: [
          '(-a) - (-b) = (-a) + (+b).',
          'Sum of an integer and its additive inverse is always 0.'
        ],
        examples: [
          {
            question: 'Subtract (-15) from (-8).',
            solution: '(-8) - (-15) = (-8) + (+15) = +7.'
          },
          {
            question: 'Find the sum: (-50) + (-200) + 300.',
            solution: '[(-50) + (-200)] + 300 = -250 + 300 = +50.'
          }
        ],
        examTip: 'Convert double negative signs -(-b) into a single positive sign +b first.',
        boardMarks: '2-4 Marks',
        teluguExplanation: 'సంకలన విలోమం: ఒక సంఖ్యకు దాని వ్యతిరేక గుర్తు గల సంఖ్య సంకలన విలోమం అవుతుంది (ఉదా: -9 కి +9).'
      }
    ]
  },
  {
    classGrade: 'Class 6',
    subjectId: 'c6_math',
    subjectName: 'Mathematics',
    chapterNumber: 10,
    chapterTitle: 'Mensuration (క్షేత్రమితి)',
    nativeTitle: 'చుట్టుకొలత & వైశాల్యం సూత్రాలు',
    topicSummary: 'Perimeter of Rectangle, Square, Regular Polygons, Area of Rectangle, Square, Units of Measurement.',
    formulas: [
      {
        id: 'c6_m10_1',
        title: 'Perimeter Formulas (చుట్టుకొలత సూత్రాలు)',
        formula: '\\begin{aligned} \\text{Perimeter of Rectangle (దీర్ఘచతురస్ర చుట్టుకొలత)} &= 2 \\times (l + b) \\\\ \\text{Perimeter of Square (చతురస్ర చుట్టుకొలత)} &= 4 \\times s \\\\ \\text{Perimeter of Equilateral Triangle} &= 3 \\times s \\\\ \\text{Perimeter of Regular Hexagon} &= 6 \\times s \\end{aligned}',
        variables: [
          { symbol: 'l, b', meaning: 'Length and Breadth of rectangle', unit: 'cm, m' },
          { symbol: 's', meaning: 'Side length of regular polygon', unit: 'cm, m' }
        ],
        explanation: 'Perimeter is the total length of the boundary enclosing a closed 2D plane figure.',
        rules: [
          'Always ensure length and breadth are in the SAME units before calculating.',
          'Unit of perimeter is linear (cm, m, km).'
        ],
        examples: [
          {
            question: 'Find the perimeter of a rectangular field 250 m long and 150 m wide. If a farmer fences it with 4 rounds of wire, what length of wire is needed?',
            solution: 'Perimeter = 2 × (250 + 150) = 2 × 400 = 800 m.\nTotal wire for 4 rounds = 4 × 800 = 3,200 m (3.2 km).'
          }
        ],
        examTip: 'Multiply perimeter by number of fence rounds for compound word problems.',
        boardMarks: '4 Marks',
        teluguExplanation: 'దీర్ఘచతురస్ర చుట్టుకొలత = 2(పొడవు + వెడల్పు); చతురస్ర చుట్టుకొలత = 4 × భుజం.'
      },
      {
        id: 'c6_m10_2',
        title: 'Area Formulas (వైశాల్యం సూత్రాలు)',
        formula: '\\begin{aligned} \\text{Area of Rectangle (దీర్ఘచతురస్ర వైశాల్యం)} &= \\text{Length} \\times \\text{Breadth} = l \\times b \\\\ \\text{Area of Square (చతురస్ర వైశాల్యం)} &= \\text{Side} \\times \\text{Side} = s^2 \\end{aligned}',
        variables: [
          { symbol: 'Area', meaning: 'Amount of surface enclosed within boundary', unit: 'sq cm (cm²) or sq m (m²)' },
          { symbol: 'l, b', meaning: 'Length and Breadth', unit: 'm or cm' }
        ],
        explanation: 'Area is the measure of the region inside a closed figure, expressed in square units.',
        rules: [
          '1 sq m = 10,000 sq cm (1 m² = 100 cm × 100 cm = 10,000 cm²).',
          'Cost of tiling or carpeting = Total Area × Cost per sq unit.'
        ],
        examples: [
          {
            question: 'A room floor is 4 m long and 3 m 50 cm wide. How many square meters of carpet is needed to cover the floor?',
            solution: 'Length = 4 m. Breadth = 3.5 m.\nArea = 4 × 3.5 = 14 sq m.'
          }
        ],
        examTip: 'Convert mixed units like 3 m 50 cm into 3.5 m before multiplying.',
        boardMarks: '2-4 Marks',
        teluguExplanation: 'దీర్ఘచతురస్ర వైశాల్యము = పొడవు × వెడల్పు (చదరపు మీటర్లు); చతురస్ర వైశాల్యము = భుజము × భుజము.'
      }
    ]
  },
  {
    classGrade: 'Class 6',
    subjectId: 'c6_math',
    subjectName: 'Mathematics',
    chapterNumber: 12,
    chapterTitle: 'Ratio and Proportion (నిష్పత్తి - అనుపాతం)',
    nativeTitle: 'నిష్పత్తి, అనుపాతం & ఏకవస్తు పద్ధతి (Unitary Method)',
    topicSummary: 'Definition of Ratio, Simplest Form, Proportion Equality (Product of Extremes = Product of Means), Unitary Method.',
    formulas: [
      {
        id: 'c6_m12_1',
        title: 'Proportion and Extreme-Mean Rule (అనుపాత నియమం)',
        formula: 'a : b :: c : d \\iff \\frac{a}{b} = \\frac{c}{d} \\iff a \\times d = b \\times c \\quad (\\text{Product of Extremes} = \\text{Product of Means})',
        variables: [
          { symbol: 'a, d', meaning: 'Extreme terms (అంత్యములు)' },
          { symbol: 'b, c', meaning: 'Middle / Mean terms (మధ్యమములు)' }
        ],
        explanation: 'Four quantities are in proportion if the ratio of the first two is equal to the ratio of the last two.',
        rules: [
          'Ratio has NO units.',
          'Quantities in a ratio must be in the SAME unit before comparison.',
          'Unitary Method: Find the value of 1 unit first by division, then find required value by multiplication.'
        ],
        examples: [
          {
            question: 'Are 15, 45, 40, 120 in proportion?',
            solution: 'Ratio 1 = 15/45 = 1/3.\nRatio 2 = 40/120 = 1/3.\nSince 15:45 = 40:120, they are in proportion.\nCheck: 15 × 120 = 1800; 45 × 40 = 1800 (Verified).'
          },
          {
            question: 'If the cost of 6 cans of juice is ₹ 210, find the cost of 4 cans of juice.',
            solution: 'Cost of 1 can = 210 ÷ 6 = ₹ 35.\nCost of 4 cans = 35 × 4 = ₹ 140.'
          }
        ],
        examTip: 'Always write the rule: Product of Extremes = Product of Means.',
        boardMarks: '2-4 Marks',
        teluguExplanation: 'అనుపాత నియమం: అంత్యముల లబ్ధము = మధ్యమముల లబ్ధము (a × d = b × c). ఏకవస్తు పద్ధతిలో ముందుగా ఒక వస్తువు విలువను కనుగొనాలి.'
      }
    ]
  }
];
