export interface FormulaItem {
  id: string;
  title: string;
  formula: string;
  variables: { symbol: string; meaning: string; unit?: string }[];
  explanation: string;
  rules?: string[];
  examples?: { question: string; solution: string }[];
  examTip?: string;
  boardMarks?: string;
  teluguExplanation?: string;
}

export interface ChapterFormulaSheet {
  classGrade: string;
  subjectId: string;
  subjectName: string;
  chapterNumber: number;
  chapterTitle: string;
  nativeTitle?: string;
  topicSummary?: string;
  formulas: FormulaItem[];
}

export const CLASS_5_MATH_FORMULAS: ChapterFormulaSheet[] = [
  {
    classGrade: 'Class 5',
    subjectId: 'c5_math',
    subjectName: 'Mathematics',
    chapterNumber: 1,
    chapterTitle: 'The Fish Tale (చేపల కథ)',
    nativeTitle: 'చేపల కథ - సంఖ్యలు & గణనలు',
    topicSummary: 'Large Numbers (up to Lakhs/Crores), Speed, Distance & Time calculations, Boat catch capacity, Unit Cost & Profit estimation.',
    formulas: [
      {
        id: 'c5_m1_1',
        title: 'Speed, Distance and Time Relation (వేగం, దూరం మరియు కాలం)',
        formula: '\\text{Speed} = \\frac{\\text{Distance}}{\\text{Time}}, \\quad \\text{Distance} = \\text{Speed} \\times \\text{Time}, \\quad \\text{Time} = \\frac{\\text{Distance}}{\\text{Speed}}',
        variables: [
          { symbol: 'Speed (వేగం)', meaning: 'Rate of motion per hour', unit: 'km/h' },
          { symbol: 'Distance (దూరం)', meaning: 'Total length travelled', unit: 'km' },
          { symbol: 'Time (కాలం)', meaning: 'Total duration taken', unit: 'hours' }
        ],
        explanation: 'If a motor boat travels at 20 km in 1 hour, in 4 hours it travels 20 × 4 = 80 km.',
        rules: [
          'To find Distance: Multiply Speed by Time (Distance = Speed × Time).',
          'To find Time: Divide Distance by Speed (Time = Distance ÷ Speed).',
          'Ensure units match before calculating (km with hours, meters with seconds).'
        ],
        examples: [
          {
            question: 'A log boat goes about 4 km in 1 hour. How long will it take to go a distance of 10 km?',
            solution: 'Time = Distance ÷ Speed = 10 km ÷ 4 km/h = 2.5 hours (2 hours and 30 minutes).'
          },
          {
            question: 'A motor boat travels at 20 km/h. How far can it go in 3 and a half hours?',
            solution: 'Distance = Speed × Time = 20 × 3.5 = 70 km.'
          }
        ],
        examTip: 'Always write the step with proper units (km or hours) for full marks in 2-mark story problems.',
        boardMarks: '2 Marks',
        teluguExplanation: 'దూరము = వేగము × కాలము. కాలము = దూరము ÷ వేగము.'
      },
      {
        id: 'c5_m1_2',
        title: 'Total Catch & Earnings Formula (మొత్తం ఆదాయం & లాభం)',
        formula: '\\text{Total Earnings} = \\text{Weight of Fish (kg)} \\times \\text{Price per kg (₹)}',
        variables: [
          { symbol: 'Weight', meaning: 'Quantity of item in kilograms', unit: 'kg' },
          { symbol: 'Price per kg', meaning: 'Rate per single kilogram', unit: '₹ / kg' },
          { symbol: 'Profit', meaning: 'Selling Price - Total Cost Price', unit: '₹' }
        ],
        explanation: 'Calculate the total cost by multiplying the quantity by the unit rate, and find profit by subtracting total expenses from total revenue.',
        rules: [
          'Total Cost = Quantity × Unit Price.',
          'Profit = Total Selling Price - Total Cost Price (when SP > CP).',
          'Loss = Cost Price - Selling Price (when CP > SP).'
        ],
        examples: [
          {
            question: 'Fazila sells Kingfish at ₹ 1200 for a whole 8 kg fish. What is the price per kg?',
            solution: 'Price per kg = Total Price ÷ Total Weight = ₹ 1200 ÷ 8 kg = ₹ 150 per kg.'
          }
        ],
        examTip: 'Break down word problems into 3 lines: Given values, Formula, and Final Calculated Answer with ₹ symbol.',
        boardMarks: '2-4 Marks',
        teluguExplanation: 'మొత్తం విలువ = బరువు (కిలోలు) × ప్రతి కిలో ధర (రూపాయలు).'
      },
      {
        id: 'c5_m1_3',
        title: 'Place Value System (సంఖ్యామానం & స్థాన విలువలు)',
        formula: '1 \\text{ Lakh} = 100,000 (10^5), \\quad 1 \\text{ Crore} = 10,000,000 (10^7) = 100 \\text{ Lakhs}',
        variables: [
          { symbol: 'Ones, Tens, Hundreds', meaning: 'First period (3 digits from right)' },
          { symbol: 'Thousands, Ten Thousands', meaning: 'Thousands period (2 digits)' },
          { symbol: 'Lakhs, Ten Lakhs', meaning: 'Lakhs period (2 digits)' }
        ],
        explanation: 'In the Indian Place Value System, commas are placed after 3 digits from the right, then after every 2 digits.',
        rules: [
          'Commas placement: 73,75,307 (Indian System).',
          'Place value = Face Value × Value of the position.',
          'Face value of a digit is the digit itself.'
        ],
        examples: [
          {
            question: 'Write place value and face value of 5 in 6,54,321.',
            solution: 'Place Value = 5 × 10,000 = 50,000 (Fifty Thousand). Face Value = 5.'
          }
        ],
        examTip: 'Remember: 1 Lakh has 5 zeroes, 1 Crore has 7 zeroes.',
        boardMarks: '1-2 Marks',
        teluguExplanation: 'భారతీయ సంఖ్యామానంలో స్థాన విలువలు: ఒకట్లు, పదులు, వందలు, వేలు, పది వేలు, లక్షలు, పది లక్షలు, కోట్లు.'
      }
    ]
  },
  {
    classGrade: 'Class 5',
    subjectId: 'c5_math',
    subjectName: 'Mathematics',
    chapterNumber: 2,
    chapterTitle: 'Shapes and Angles (ఆకారాలు మరియు కోణాలు)',
    nativeTitle: 'ఆకారాలు మరియు కోణాలు',
    topicSummary: 'Right angles, Acute angles, Obtuse angles, Straight angles, Angles in clocks, and angle degree measurements.',
    formulas: [
      {
        id: 'c5_m2_1',
        title: 'Classification of Angles (కోణాల రకాలు)',
        formula: '\\begin{aligned} \\text{Acute Angle (లఘు కోణం)} &: < 90^\\circ \\\\ \\text{Right Angle (లంబ కోణం)} &: = 90^\\circ \\text{ (Letter \'L\' shape)} \\\\ \\text{Obtuse Angle (గురు కోణం)} &: > 90^\\circ \\text{ and } < 180^\\circ \\\\ \\text{Straight Angle (సరళ కోణం)} &: = 180^\\circ \\end{aligned}',
        variables: [
          { symbol: 'Degree (°)', meaning: 'Unit of angle measurement', unit: '°' },
          { symbol: 'Right Angle', meaning: 'Angle formed between perpendicular lines (90°)' }
        ],
        explanation: 'An angle measuring exactly 90 degrees is a Right angle. Less than 90° is an Acute angle. Greater than 90° but less than 180° is an Obtuse angle.',
        rules: [
          'An "L" shape makes an exact 90° right angle.',
          'An angle smaller than "L" is Acute (< 90°).',
          'An angle wider than "L" is Obtuse (> 90°).',
          'A straight horizontal or vertical line makes 180°.'
        ],
        examples: [
          {
            question: 'What type of angle do clock hands make at 3:00 PM and 9:00 AM?',
            solution: 'At 3:00 and 9:00, the hour hand and minute hand are perpendicular, making a 90° Right Angle.'
          },
          {
            question: 'What angle is made by clock hands at 2:00?',
            solution: 'At 2:00, the angle is 60°, which is less than 90°, so it is an Acute angle.'
          }
        ],
        examTip: 'Look for the square corner box symbol — it always indicates a 90° Right angle.',
        boardMarks: '2 Marks',
        teluguExplanation: 'లంబకోణం = 90°, లఘుకోణం = 90° కంటే తక్కువ, గురుకోణం = 90° కంటే ఎక్కువ మరియు 180° కంటే తక్కువ.'
      },
      {
        id: 'c5_m2_2',
        title: 'Clock Angle Calculation (గడియారంలో కోణాలు)',
        formula: '1 \\text{ Minute Mark} = 6^\\circ, \\quad 1 \\text{ Hour Gap (e.g. 12 to 1)} = 30^\\circ',
        variables: [
          { symbol: 'Complete Revolution', meaning: 'Full clock circle = 360°' },
          { symbol: '12 Equal divisions', meaning: '360° ÷ 12 = 30° per hour number' }
        ],
        explanation: 'Each number gap on a clock face represents 30 degrees (360° / 12). For example, between 12 and 3 there are 3 gaps: 3 × 30° = 90°.',
        rules: [
          'Count the number of hour segments between hands.',
          'Multiply the number of gaps by 30° to get the exact degree measurement.'
        ],
        examples: [
          {
            question: 'Find the angle formed by hands at 4:00.',
            solution: 'Number of gaps between 12 and 4 = 4 gaps. Angle = 4 × 30° = 120° (Obtuse Angle).'
          }
        ],
        examTip: 'At 6:00, hands point in opposite directions making a 180° straight angle.',
        boardMarks: '2 Marks',
        teluguExplanation: 'గడియారంలో ప్రతి గంట వ్యవధి 30° కోణాన్ని సూచిస్తుంది.'
      }
    ]
  },
  {
    classGrade: 'Class 5',
    subjectId: 'c5_math',
    subjectName: 'Mathematics',
    chapterNumber: 3,
    chapterTitle: 'How Many Squares? (ఎన్ని చతురస్రాలు?)',
    nativeTitle: 'ఎన్ని చతురస్రాలు? - గ్రిడ్ వైశాల్యం',
    topicSummary: 'Grid-based Area and Perimeter counting, Triangle Area on square grids, and comparing shapes with equal areas.',
    formulas: [
      {
        id: 'c5_m3_1',
        title: 'Grid Counting Area Rule (గ్రిడ్ వైశాల్య నియమం)',
        formula: '\\text{Area} = (\\text{Full Squares} \\times 1) + (\\text{More than Half Squares} \\times 1) + (\\text{Half Squares} \\times \\frac{1}{2})',
        variables: [
          { symbol: '1 Grid Square', meaning: 'Area of 1 cm × 1 cm unit square', unit: 'sq cm' },
          { symbol: 'Ignored', meaning: 'Squares less than half filled count as 0' }
        ],
        explanation: 'Count full squares as 1 sq cm, count half squares as 0.5 sq cm, count more than half as 1 sq cm, and ignore squares covering less than half.',
        rules: [
          'Step 1: Count and mark all fully covered 1cm² squares.',
          'Step 2: Combine pairs of half squares (2 half squares = 1 full square).',
          'Step 3: Add together to find total area in cm² (square centimeters).'
        ],
        examples: [
          {
            question: 'A shape on a 1 cm grid contains 6 full squares and 4 half squares. What is its total area?',
            solution: 'Total Area = (6 × 1) + (4 × 0.5) = 6 + 2 = 8 sq cm.'
          }
        ],
        examTip: 'Area is always expressed in square units (sq cm or cm²). Never forget the unit!',
        boardMarks: '2-4 Marks',
        teluguExplanation: 'గ్రిడ్ వైశాల్యం = పూర్తి గడులు + (సగం గడులు × 1/2).'
      },
      {
        id: 'c5_m3_2',
        title: 'Area of a Triangle on a Rectangle Grid',
        formula: '\\text{Area of Right Triangle} = \\frac{1}{2} \\times \\text{Area of Rectangle} = \\frac{1}{2} \\times (\\text{Base} \\times \\text{Height})',
        variables: [
          { symbol: 'Base', meaning: 'Horizontal length of triangle base', unit: 'cm' },
          { symbol: 'Height', meaning: 'Perpendicular height', unit: 'cm' }
        ],
        explanation: 'A diagonal dividing a rectangle of length l and breadth b splits it into two equal triangles, each having half the rectangle area.',
        rules: [
          'If a triangle is inside a rectangle of area 20 sq cm, its area is half: 10 sq cm.',
          'Formula: Area = (Base × Height) ÷ 2.'
        ],
        examples: [
          {
            question: 'A blue triangle is drawn inside a rectangle of 4 cm by 2 cm. What is the area of the triangle?',
            solution: 'Area of rectangle = 4 × 2 = 8 sq cm. Area of triangle = 8 ÷ 2 = 4 sq cm.'
          }
        ],
        examTip: 'A common question asks to find triangle area drawn inside a rectangle by halving the rectangle area.',
        boardMarks: '2 Marks',
        teluguExplanation: 'త్రిభుజ వైశాల్యము = దీర్ఘచతురస్ర వైశాల్యంలో సగము = 1/2 × భూమి × ఎత్తు.'
      }
    ]
  },
  {
    classGrade: 'Class 5',
    subjectId: 'c5_math',
    subjectName: 'Mathematics',
    chapterNumber: 4,
    chapterTitle: 'Parts and Wholes (భాగాలు మరియు పూర్ణాలు)',
    nativeTitle: 'భిన్నాలు - భాగాలు మరియు పూర్ణాలు',
    topicSummary: 'Fractions representation, Proper, Improper and Mixed fractions, Equivalent fractions, and finding fraction of a quantity.',
    formulas: [
      {
        id: 'c5_m4_1',
        title: 'Equivalent Fractions Formula (సమాన భిన్నాలు)',
        formula: '\\frac{a}{b} = \\frac{a \\times k}{b \\times k} = \\frac{a \\div m}{b \\div m} \\quad (k, m \\ne 0)',
        variables: [
          { symbol: 'Numerator (లవం)', meaning: 'Top number indicating shaded/selected parts' },
          { symbol: 'Denominator (హారం)', meaning: 'Bottom number indicating total equal parts' },
          { symbol: 'k', meaning: 'Common non-zero multiplier' }
        ],
        explanation: 'Multiplying or dividing both numerator and denominator by the same number creates an equivalent fraction representing the same value.',
        rules: [
          'To find equivalent fractions: Multiply top and bottom by 2, 3, 4, etc.',
          'To simplify/reduce: Divide top and bottom by their greatest common factor.',
          'Example: 1/2 = 2/4 = 3/6 = 4/8 = 5/10.'
        ],
        examples: [
          {
            question: 'Find two equivalent fractions of 3/5.',
            solution: '(3 × 2) / (5 × 2) = 6/10, and (3 × 3) / (5 × 3) = 9/15.'
          },
          {
            question: 'Reduce 12/20 to simplest form.',
            solution: 'Divide numerator and denominator by 4: (12 ÷ 4) / (20 ÷ 4) = 3/5.'
          }
        ],
        examTip: 'Cross multiplication rule: a/b = c/d if and only if a × d = b × c.',
        boardMarks: '2 Marks',
        teluguExplanation: 'భిన్నం యొక్క లవం మరియు హారాలను ఒకే సంఖ్యతో గుణించినా లేదా భాగించినా సమాన భిన్నం లభిస్తుంది.'
      },
      {
        id: 'c5_m4_2',
        title: 'Fraction of a Total Quantity (మొత్తంలో భిన్న భాగం)',
        formula: '\\text{Value} = \\frac{\\text{Numerator}}{\\text{Denominator}} \\times \\text{Total Amount}',
        variables: [
          { symbol: 'Total Amount', meaning: 'Total number of items, rupees, or hours' },
          { symbol: 'Value', meaning: 'Actual count corresponding to the fraction' }
        ],
        explanation: 'To find a fractional part of a quantity, divide the total by the denominator and multiply the result by the numerator.',
        rules: [
          'Step 1: Divide Total by Denominator.',
          'Step 2: Multiply result by Numerator.'
        ],
        examples: [
          {
            question: 'Ramu has 20 chocolates. He gives 1/4 of them to his sister. How many chocolates does she get?',
            solution: 'Sister receives = (1/4) × 20 = 20 ÷ 4 = 5 chocolates.'
          },
          {
            question: 'What is 3/4 of an hour in minutes?',
            solution: '1 hour = 60 minutes. 3/4 of 60 = (60 ÷ 4) × 3 = 15 × 3 = 45 minutes.'
          }
        ],
        examTip: 'Common word problems use 1/2 kg, 1/4 kg, 3/4 kg and time in minutes.',
        boardMarks: '2 Marks',
        teluguExplanation: 'ఒక మొత్తంలో భిన్న భాగం = (లవం ÷ హారం) × మొత్తం సంఖ్య.'
      }
    ]
  },
  {
    classGrade: 'Class 5',
    subjectId: 'c5_math',
    subjectName: 'Mathematics',
    chapterNumber: 5,
    chapterTitle: 'Does It Look The Same? (అదే విధంగా కనిపిస్తుందా?)',
    nativeTitle: 'సౌష్ఠవం మరియు భ్రమణం',
    topicSummary: 'Line of Symmetry, Mirror Reflections, Rotational Symmetry (1/2 turn, 1/4 turn, 1/3 turn, 1/6 turn).',
    formulas: [
      {
        id: 'c5_m5_1',
        title: 'Rotational Turns & Degrees (భ్రమణ భాగాలు & డిగ్రీలు)',
        formula: '\\begin{aligned} \\frac{1}{2} \\text{ Turn (అర్ధ భ్రమణం)} &= 180^\\circ \\\\ \\frac{1}{4} \\text{ Turn (పావు భ్రమణం)} &= 90^\\circ \\\\ \\frac{1}{3} \\text{ Turn (మూడో వంతు)} &= 120^\\circ \\\\ \\frac{1}{6} \\text{ Turn (ఆరో వంతు)} &= 60^\\circ \\end{aligned}',
        variables: [
          { symbol: 'Full Turn (పూర్తి భ్రమణం)', meaning: '360° complete circle' },
          { symbol: 'Line of Symmetry', meaning: 'Fold line dividing a shape into two identical mirror halves' }
        ],
        explanation: 'A shape has rotational symmetry if it looks identical to its original orientation after being rotated by a fraction of a full turn.',
        rules: [
          'Square looks the same after 1/4 turn (90°) and 1/2 turn (180°).',
          'Rectangle looks the same after 1/2 turn (180°), but NOT after 1/4 turn (90°).',
          'Equilateral triangle looks the same after 1/3 turn (120°).',
          'Regular hexagon looks the same after 1/6 turn (60°).'
        ],
        examples: [
          {
            question: 'Which English letters look the exact same after a 1/2 turn (180°)?',
            solution: 'Letters H, I, N, O, S, X, Z look the same after a 1/2 turn.'
          }
        ],
        examTip: 'Draw the shape upside down on rough work to check if it looks identical on 1/2 turn.',
        boardMarks: '1-2 Marks',
        teluguExplanation: '1/2 భ్రమణం = 180°, 1/4 భ్రమణం = 90°, 1/3 భ్రమణం = 120°, 1/6 భ్రమణం = 60°.'
      }
    ]
  },
  {
    classGrade: 'Class 5',
    subjectId: 'c5_math',
    subjectName: 'Mathematics',
    chapterNumber: 6,
    chapterTitle: 'Be My Multiple, I’ll Be Your Factor (నా గుణిజం నువ్వు, నీ కారణాంకం నేను)',
    nativeTitle: 'గుణిజాలు మరియు కారణాంకాలు (LCM & HCF)',
    topicSummary: 'Multiples, Factors, Common Multiples (LCM), Common Factors (HCF), Divisibility Rules, Prime & Composite numbers.',
    formulas: [
      {
        id: 'c5_m6_1',
        title: 'Divisibility Rules Quick Sheet (భాజనీయతా సూత్రాలు)',
        formula: '\\begin{aligned} \\mathbf{\\div 2} &: \\text{Last digit is } 0, 2, 4, 6, 8 \\\\ \\mathbf{\\div 3} &: \\text{Sum of all digits is divisible by } 3 \\\\ \\mathbf{\\div 5} &: \\text{Last digit is } 0 \\text{ or } 5 \\\\ \\mathbf{\\div 9} &: \\text{Sum of all digits is divisible by } 9 \\\\ \\mathbf{\\div 10} &: \\text{Last digit is } 0 \\end{aligned}',
        variables: [
          { symbol: 'Divisible (నిశ్శేషంగా భాగించబడేది)', meaning: 'Leaves remainder 0' }
        ],
        explanation: 'Quick test rules to check if a number can be divided evenly without performing long division.',
        rules: [
          'Divisible by 2: If the number is even (ends in 0, 2, 4, 6, 8).',
          'Divisible by 3: Add the digits; if the sum is in the 3 times table, the whole number is divisible by 3.',
          'Divisible by 5: If the last digit is 0 or 5.',
          'Divisible by 10: If the units digit is 0.'
        ],
        examples: [
          {
            question: 'Is 729 divisible by 3 and 9?',
            solution: 'Sum of digits = 7 + 2 + 9 = 18. Since 18 is divisible by both 3 and 9, 729 is divisible by 3 and 9.'
          }
        ],
        examTip: 'Divisibility by 3 and 9 tests are frequently asked in 1-mark fill in the blanks.',
        boardMarks: '1-2 Marks',
        teluguExplanation: 'అంకెల మొత్తం 3 తో భాగించబడితే ఆ సంఖ్య 3 తో భాగించబడుతుంది. చివరి అంకె 0 లేదా 5 అయితే 5 తో భాగించబడుతుంది.'
      },
      {
        id: 'c5_m6_2',
        title: 'Common Multiples & Lowest Common Multiple (LCM)',
        formula: '\\text{LCM}(a, b) = \\text{Smallest positive number that is a multiple of both } a \\text{ and } b',
        variables: [
          { symbol: 'LCM (క.సా.గు)', meaning: 'Least Common Multiple' },
          { symbol: 'HCF (గ.సా.భా)', meaning: 'Highest Common Factor' }
        ],
        explanation: 'List multiples of both numbers and find the first (smallest) common number shared by both.',
        rules: [
          'Multiples of 2: 2, 4, 6, 8, 10, 12, ...',
          'Multiples of 3: 3, 6, 9, 12, 15, ...',
          'Common multiples of 2 and 3: 6, 12, 18, ...',
          'Smallest common multiple (LCM) = 6.'
        ],
        examples: [
          {
            question: 'Find the smallest common multiple of 4 and 6.',
            solution: 'Multiples of 4: 4, 8, 12, 16, 20... Multiples of 6: 6, 12, 18... Smallest Common Multiple = 12.'
          }
        ],
        examTip: 'To find common factors, list all factors of both numbers and find the largest common one (HCF).',
        boardMarks: '2 Marks',
        teluguExplanation: 'రెండు సంఖ్యల ఉమ్మడి గుణిజాలలో అతి చిన్నదాన్ని కనిష్ఠ సామాన్య గుణిజం (క.సా.గు / LCM) అంటారు.'
      }
    ]
  },
  {
    classGrade: 'Class 5',
    subjectId: 'c5_math',
    subjectName: 'Mathematics',
    chapterNumber: 7,
    chapterTitle: 'Can You See the Pattern? (ప్యాటర్న్ చూడగలరా?)',
    nativeTitle: 'సంఖ్యా ప్యాటర్న్‌లు మరియు మ్యాజిక్ స్క్వేర్స్',
    topicSummary: '3x3 Magic Squares (sum = 15), Triangular Numbers (1, 3, 6, 10, 15), Number sequences, and Palindromic numbers.',
    formulas: [
      {
        id: 'c5_m7_1',
        title: '3x3 Magic Square Rule (మ్యాజిక్ స్క్వేర్ నియమం)',
        formula: '\\text{Magic Sum} = 3 \\times \\text{Center Number}, \\quad (\\text{For numbers 1 to 9, Center} = 5, \\text{Magic Sum} = 15)',
        variables: [
          { symbol: 'Magic Constant', meaning: 'Sum of every row, column, and diagonal' },
          { symbol: 'Center Cell', meaning: 'The middle number must be the median' }
        ],
        explanation: 'In a 3×3 magic square using digits 1 to 9, the sum of numbers in every row, column, and diagonal equals 15, and the center number is always 5.',
        rules: [
          'Every row sum = 15.',
          'Every column sum = 15.',
          'Both diagonal sums = 15.',
          'Corner numbers must be even (2, 4, 6, 8) and edge centers must be odd (1, 3, 7, 9).'
        ],
        examples: [
          {
            question: 'In a 3×3 magic square with numbers 1 to 9, if a row contains 8 and 1, what is the missing number?',
            solution: 'Missing number = 15 - (8 + 1) = 15 - 9 = 6.'
          }
        ],
        examTip: 'Remember the formula: Row Sum = 15. Subtract given numbers from 15 to find blanks.',
        boardMarks: '2 Marks',
        teluguExplanation: '3×3 మ్యాజిక్ స్క్వేర్‌లో ప్రతి అడ్డు వరుస, నిలువు వరుస మరియు వికర్ణాల మొత్తం 15 అవుతుంది.'
      },
      {
        id: 'c5_m7_2',
        title: 'Triangular Numbers Sequence (త్రికోణ సంఖ్యలు)',
        formula: 'T_n = \\frac{n(n + 1)}{2} \\implies 1, 3, 6, 10, 15, 21, 28, 36, ...',
        variables: [
          { symbol: 'T_n', meaning: 'nth triangular number' },
          { symbol: 'Pattern', meaning: '+2, +3, +4, +5, +6, ...' }
        ],
        explanation: 'Triangular numbers are formed by adding consecutive natural numbers: 1, 1+2=3, 1+2+3=6, 1+2+3+4=10, 1+2+3+4+5=15.',
        rules: [
          'Add next counting number to get the next term: 1 (+2) -> 3 (+3) -> 6 (+4) -> 10 (+5) -> 15 (+6) -> 21.'
        ],
        examples: [
          {
            question: 'Find the next two triangular numbers after 15.',
            solution: 'Next = 15 + 6 = 21, and then 21 + 7 = 28.'
          }
        ],
        examTip: 'The sum of two consecutive triangular numbers always gives a square number (e.g., 1+3=4=2², 3+6=9=3²).',
        boardMarks: '1-2 Marks',
        teluguExplanation: 'త్రికోణ సంఖ్యలు: 1, 3, 6, 10, 15, 21, 28... (వరుస సహజ సంఖ్యల కూడిక).'
      }
    ]
  },
  {
    classGrade: 'Class 5',
    subjectId: 'c5_math',
    subjectName: 'Mathematics',
    chapterNumber: 8,
    chapterTitle: 'Mapping Your Way (దారిని మ్యాప్ చేయడం)',
    nativeTitle: 'మ్యాప్ స్కేల్ మరియు దూరాలు',
    topicSummary: 'Map Scale reading (1 cm = X km), Cardinal directions (North, South, East, West), Finding real ground distance from map measurements.',
    formulas: [
      {
        id: 'c5_m8_1',
        title: 'Map Scale to Real Distance Formula (మ్యాప్ స్కేల్ సూత్రం)',
        formula: '\\text{Real Ground Distance} = \\text{Map Distance (cm)} \\times \\text{Scale Value (km per cm)}',
        variables: [
          { symbol: 'Scale', meaning: 'Ratio indicating ground distance represented by 1 cm on map' },
          { symbol: 'Map Distance', meaning: 'Measured length with ruler in centimeters', unit: 'cm' }
        ],
        explanation: 'If the scale says 1 cm on map = 2 km on ground, then a 5 cm measured line on the map equals 5 × 2 = 10 km on actual ground.',
        rules: [
          'To find Ground Distance: Multiply Map cm by the Scale factor.',
          'To find Map Distance: Divide Ground Distance by the Scale factor.'
        ],
        examples: [
          {
            question: 'The scale on a map is 1 cm = 50 km. If two towns are 4 cm apart on the map, how far are they in reality?',
            solution: 'Real Distance = 4 cm × 50 km/cm = 200 km.'
          }
        ],
        examTip: 'Always check the map scale given in the corner of the question before multiplying.',
        boardMarks: '2 Marks',
        teluguExplanation: 'నిజమైన దూరం = మ్యాప్‌లోని దూరం (సెం.మీ) × స్కేల్ విలువ (కి.మీ).'
      }
    ]
  },
  {
    classGrade: 'Class 5',
    subjectId: 'c5_math',
    subjectName: 'Mathematics',
    chapterNumber: 9,
    chapterTitle: 'Boxes and Sketches (పెట్టెలు మరియు డ్రాయింగ్‌లు)',
    nativeTitle: '3D ఆకారాలు మరియు 2D నెట్‌లు',
    topicSummary: '2D Nets of 3D solids (Cube, Cuboid, Cylinder, Cone), Faces, Edges & Vertices of 3D shapes, Floor maps vs Deep drawings.',
    formulas: [
      {
        id: 'c5_m9_1',
        title: 'Properties of 3D Solids (Faces, Edges, Vertices)',
        formula: '\\begin{aligned} \\text{Cube (ఘనం)} &: \\text{Faces (ముఖాలు)} = 6, \\; \\text{Edges (అంచులు)} = 12, \\; \\text{Vertices (శీర్షాలు)} = 8 \\\\ \\text{Cuboid (దీర్ఘఘనం)} &: \\text{Faces} = 6, \\; \\text{Edges} = 12, \\; \\text{Vertices} = 8 \\\\ \\text{Cylinder (స్థూపం)} &: 2 \\text{ flat circular faces} + 1 \\text{ curved surface}, \\; 2 \\text{ edges}, \\; 0 \\text{ vertices} \\\\ \\text{Cone (శంకువు)} &: 1 \\text{ flat face} + 1 \\text{ curved surface}, \\; 1 \\text{ vertex} \\\\ \\text{Sphere (గోళం)} &: 1 \\text{ curved surface}, \\; 0 \\text{ edges}, \\; 0 \\text{ vertices} \\end{aligned}',
        variables: [
          { symbol: 'Faces (F)', meaning: 'Flat or curved polygon boundaries' },
          { symbol: 'Edges (E)', meaning: 'Line segments where two faces meet' },
          { symbol: 'Vertices (V)', meaning: 'Corner points where three edges meet' }
        ],
        explanation: 'A cube has 6 identical square faces, 12 equal straight edges, and 8 corner vertices. Opposite faces of a standard dice always sum to 7.',
        rules: [
          'Standard Die Rule: The numbers on opposite faces always add up to 7 (1 opposite 6, 2 opposite 5, 3 opposite 4).',
          'A cube net must have exactly 6 square faces arranged such that they fold without overlapping.'
        ],
        examples: [
          {
            question: 'On a standard dice, what number is opposite to 4?',
            solution: 'Opposite Number = 7 - 4 = 3.'
          }
        ],
        examTip: 'Dice opposite face rule (Sum = 7) is a guaranteed 1-mark question.',
        boardMarks: '1-2 Marks',
        teluguExplanation: 'ఘనానికి 6 ముఖాలు, 12 అంచులు, 8 శీర్షాలు ఉంటాయి. పాచికలో ఎదురెదురు ముఖాల మొత్తం ఎల్లప్పుడూ 7.'
      }
    ]
  },
  {
    classGrade: 'Class 5',
    subjectId: 'c5_math',
    subjectName: 'Mathematics',
    chapterNumber: 10,
    chapterTitle: 'Tenths and Hundredths (పదవ మరియు వందవ భాగాలు)',
    nativeTitle: 'దశాంశాలు (Decimals) & కొలతలు',
    topicSummary: 'Decimals representation (Tenths 0.1, Hundredths 0.01), Money conversions (Rupees & Paise), Metric unit conversions (m, cm, mm).',
    formulas: [
      {
        id: 'c5_m10_1',
        title: 'Decimal Fractions & Conversions (దశాంశ భిన్నాలు)',
        formula: '\\frac{1}{10} = 0.1, \\quad \\frac{1}{100} = 0.01, \\quad 1 \\text{ Rupee} = 100 \\text{ Paise} \\implies 1 \\text{ Paisa} = ₹ \\, 0.01',
        variables: [
          { symbol: 'Tenths place', meaning: 'First digit after decimal point (1/10)' },
          { symbol: 'Hundredths place', meaning: 'Second digit after decimal point (1/100)' }
        ],
        explanation: 'To convert paise into rupees, divide by 100 (put decimal before 2 digits from right). To convert mm to cm, divide by 10.',
        rules: [
          '1 cm = 10 mm \\implies 1 mm = 0.1 cm.',
          '1 m = 100 cm \\implies 1 cm = 0.01 m.',
          '1 km = 1000 m \\implies 1 m = 0.001 km.',
          '1 Rupee = 100 Paise \\implies 75 Paise = ₹ 0.75.'
        ],
        examples: [
          {
            question: 'Express 45 mm in centimeters as a decimal.',
            solution: '45 mm = 45 ÷ 10 = 4.5 cm.'
          },
          {
            question: 'Write ₹ 5 and 50 paise in decimal form.',
            solution: '₹ 5 + ₹ (50/100) = ₹ 5.50.'
          }
        ],
        examTip: 'When writing rupees with single-digit paise, add a zero: 5 paise = ₹ 0.05 (NOT ₹ 0.5 which means 50 paise).',
        boardMarks: '2 Marks',
        teluguExplanation: '1 రూపాయి = 100 పైసలు (1 పైసా = ₹ 0.01). 1 సెంటీమీటర్ = 10 మిల్లీమీటర్లు (1 మి.మీ = 0.1 సెం.మీ).'
      }
    ]
  },
  {
    classGrade: 'Class 5',
    subjectId: 'c5_math',
    subjectName: 'Mathematics',
    chapterNumber: 11,
    chapterTitle: 'Area and Its Boundary (వైశాల్యం మరియు సరిహద్దు)',
    nativeTitle: 'చుట్టుకొలత మరియు వైశాల్యం (Perimeter & Area)',
    topicSummary: 'Perimeter and Area of Rectangles and Squares, Word problems on fences, borders, floor tiling, and carpet covering.',
    formulas: [
      {
        id: 'c5_m11_1',
        title: 'Perimeter Formulas (చుట్టుకొలత సూత్రాలు)',
        formula: '\\begin{aligned} \\text{Perimeter of Rectangle (దీర్ఘచతురస్ర చుట్టుకొలత)} &= 2 \\times (\\text{Length} + \\text{Breadth}) = 2(l + b) \\\\ \\text{Perimeter of Square (చతురస్ర చుట్టుకొలత)} &= 4 \\times \\text{Side} = 4s \\end{aligned}',
        variables: [
          { symbol: 'Perimeter (చుట్టుకొలత)', meaning: 'Total boundary length around a closed shape', unit: 'cm or m' },
          { symbol: 'l (Length)', meaning: 'Length of the rectangle', unit: 'cm or m' },
          { symbol: 'b (Breadth)', meaning: 'Breadth / width of the rectangle', unit: 'cm or m' },
          { symbol: 's (Side)', meaning: 'Side length of the square', unit: 'cm or m' }
        ],
        explanation: 'Perimeter is the total outer boundary distance. Add all side lengths together.',
        rules: [
          'Rectangle: Add length and breadth, then multiply by 2.',
          'Square: Multiply the side length by 4.',
          'Units of perimeter are linear units: cm, m, km.'
        ],
        examples: [
          {
            question: 'Find the perimeter of a rectangular garden with length 20 m and breadth 15 m.',
            solution: 'Perimeter = 2 × (20 + 15) = 2 × 35 = 70 meters.'
          },
          {
            question: 'A square field has a side of 12 cm. What is the length of wire needed for its boundary?',
            solution: 'Perimeter = 4 × Side = 4 × 12 = 48 cm.'
          }
        ],
        examTip: 'Remember: Boundary/Fence/Border problems always ask for PERIMETER (linear cm/m).',
        boardMarks: '2-4 Marks',
        teluguExplanation: 'దీర్ఘచతురస్ర చుట్టుకొలత = 2(పొడవు + వెడల్పు). చతురస్ర చుట్టుకొలత = 4 × భుజం.'
      },
      {
        id: 'c5_m11_2',
        title: 'Area Formulas (వైశాల్యం సూత్రాలు)',
        formula: '\\begin{aligned} \\text{Area of Rectangle (దీర్ఘచతురస్ర వైశాల్యం)} &= \\text{Length} \\times \\text{Breadth} = l \\times b \\\\ \\text{Area of Square (చతురస్ర వైశాల్యం)} &= \\text{Side} \\times \\text{Side} = s^2 \\end{aligned}',
        variables: [
          { symbol: 'Area (వైశాల్యం)', meaning: 'Surface space occupied by the shape', unit: 'sq cm or sq m' }
        ],
        explanation: 'Area measures the amount of flat surface enclosed inside the boundary.',
        rules: [
          'Rectangle Area = Length × Breadth.',
          'Square Area = Side × Side.',
          'Number of Tiles needed = Total Floor Area ÷ Area of 1 Tile.'
        ],
        examples: [
          {
            question: 'A room floor is 6 m long and 4 m wide. What is its area in square meters?',
            solution: 'Area = Length × Breadth = 6 × 4 = 24 sq m.'
          },
          {
            question: 'How many 2 cm × 2 cm square tiles are needed to cover a 10 cm × 8 cm cardboard?',
            solution: 'Cardboard Area = 10 × 8 = 80 sq cm. Tile Area = 2 × 2 = 4 sq cm. Tiles needed = 80 ÷ 4 = 20 tiles.'
          }
        ],
        examTip: 'Area is always in SQUARE units (sq cm or m²). Floor tiling and carpet problems require AREA.',
        boardMarks: '2-4 Marks',
        teluguExplanation: 'దీర్ఘచతురస్ర వైశాల్యం = పొడవు × వెడల్పు. చతురస్ర వైశాల్యం = భుజం × భుజం.'
      }
    ]
  },
  {
    classGrade: 'Class 5',
    subjectId: 'c5_math',
    subjectName: 'Mathematics',
    chapterNumber: 12,
    chapterTitle: 'Smart Charts (స్మార్ట్ చార్ట్‌లు)',
    nativeTitle: 'దత్తాంశ నిర్వహణ - టాలీ మార్కులు & బార్ చార్ట్‌లు',
    topicSummary: 'Tally marks representation (bundles of 5), Pictographs, Bar charts (column graphs), and Chapati / Pie charts fractions.',
    formulas: [
      {
        id: 'c5_m12_1',
        title: 'Tally Marks System (టాలీ గుర్తులు)',
        formula: '1 = |, \\quad 2 = ||, \\quad 3 = |||, \\quad 4 = ||||, \\quad 5 = \\cancel{||||} \\; (\\text{Bundle of 5})',
        variables: [
          { symbol: 'Bundle', meaning: 'Every group of 5 is marked with 4 vertical lines and 1 diagonal cross line' }
        ],
        explanation: 'Tally marks are grouped in sets of 5 to make counting large data sets fast and error-free.',
        rules: [
          'Count in 5s: Two bundles = 10, Three bundles = 15, Three bundles + 2 lines = 17.'
        ],
        examples: [
          {
            question: 'Ravi counted 23 passing bicycles using tally marks. How many full bundles of 5 and single lines should he draw?',
            solution: '23 = (4 bundles of 5) + 3 single lines.'
          }
        ],
        examTip: 'Always write the count in numerals next to your tally marks.',
        boardMarks: '2 Marks',
        teluguExplanation: 'టాలీ గుర్తులలో ప్రతి 5 వ గీత మునుపటి 4 గీతలను క్రాస్ చేస్తూ 5 ల కట్టగా ఏర్పడుతుంది.'
      },
      {
        id: 'c5_m12_2',
        title: 'Pie Chart / Chapati Chart Fractions (వృత్త రేఖాచిత్రం)',
        formula: '\\text{Fraction of Circle} = \\frac{\\text{Subgroup Count}}{\\text{Total Students}} \\implies \\frac{1}{2} = 50\\%, \\; \\frac{1}{4} = 25\\%, \\; \\frac{3}{4} = 75\\%',
        variables: [
          { symbol: 'Full Circle (పూర్తి వృత్తం)', meaning: 'Entire group = 1 whole' }
        ],
        explanation: 'A circle chart shows how a whole total is divided into parts. Half the circle represents 1/2 of the total, a quarter represents 1/4.',
        rules: [
          'Half the circle = 1/2 of Total.',
          'One quarter of the circle = 1/4 of Total.'
        ],
        examples: [
          {
            question: 'In a class of 40 students, half like Cricket and one-fourth like Football. How many students like Cricket and Football?',
            solution: 'Cricket = 1/2 × 40 = 20 students. Football = 1/4 × 40 = 10 students.'
          }
        ],
        examTip: 'Check that all slices of your pie chart add up to the total number of students.',
        boardMarks: '2-4 Marks',
        teluguExplanation: 'వృత్త రేఖాచిత్రంలో సగం భాగం 1/2 ను, పావు భాగం 1/4 ను సూచిస్తుంది.'
      }
    ]
  },
  {
    classGrade: 'Class 5',
    subjectId: 'c5_math',
    subjectName: 'Mathematics',
    chapterNumber: 13,
    chapterTitle: 'Ways to Multiply and Divide (గుణకారం మరియు భాగహారం పద్ధతులు)',
    nativeTitle: 'గుణకారం మరియు భాగహారం నియమాలు',
    topicSummary: 'Multiplication by column and box methods, Long division with remainder verification, Daily wages calculation, and estimation.',
    formulas: [
      {
        id: 'c5_m13_1',
        title: 'Division Verification Rule (భాగహార నియమం & సరిచూచుట)',
        formula: '\\text{Dividend} = (\\text{Divisor} \\times \\text{Quotient}) + \\text{Remainder}, \\quad (0 \\le \\text{Remainder} < \\text{Divisor})',
        variables: [
          { symbol: 'Dividend (విభాజ్యం)', meaning: 'The large number being divided' },
          { symbol: 'Divisor (విభాజకం)', meaning: 'The number you are dividing by' },
          { symbol: 'Quotient (భాగఫలం)', meaning: 'The result of the division' },
          { symbol: 'Remainder (శేషం)', meaning: 'Leftover amount (must be strictly less than divisor)' }
        ],
        explanation: 'To verify whether a division calculation is correct, multiply the divisor by the quotient and add the remainder; it must equal the original dividend.',
        rules: [
          'Remainder must always be smaller than the Divisor.',
          'If Remainder is 0, the number is divisible evenly.'
        ],
        examples: [
          {
            question: 'Divide 576 by 12 and verify the answer.',
            solution: '576 ÷ 12 = 48 with Remainder 0. Verification: (12 × 48) + 0 = 576 (Correct).'
          },
          {
            question: 'If a worker earns ₹ 245 per day, how much will he earn in the month of January (31 days)?',
            solution: 'Total Earnings = 245 × 31 = ₹ 7,595.'
          }
        ],
        examTip: 'Always write the check step: Divisor × Quotient + Remainder = Dividend.',
        boardMarks: '4 Marks',
        teluguExplanation: 'విభాజ్యము = (విభాజకము × భాగఫలము) + శేషము. శేషం ఎల్లప్పుడూ విభాజకం కంటే తక్కువగా ఉండాలి.'
      }
    ]
  },
  {
    classGrade: 'Class 5',
    subjectId: 'c5_math',
    subjectName: 'Mathematics',
    chapterNumber: 14,
    chapterTitle: 'How Big? How Heavy? (ఎంత పెద్దది? ఎంత బరువు?)',
    nativeTitle: 'ఘనపరిమాణం (Volume) & బరువులు',
    topicSummary: 'Volume of Cubes and Cuboids, Liquid Displacement Method, Metric units of Weight (kg, g) and Capacity (L, mL).',
    formulas: [
      {
        id: 'c5_m14_1',
        title: 'Volume Formulas (ఘనపరిమాణం సూత్రాలు)',
        formula: '\\begin{aligned} \\text{Volume of Cuboid (దీర్ఘఘనం ఘనపరిమాణం)} &= \\text{Length} \\times \\text{Breadth} \\times \\text{Height} = l \\times b \\times h \\\\ \\text{Volume of Cube (ఘనం ఘనపరిమాణం)} &= \\text{Side} \\times \\text{Side} \\times \\text{Side} = s^3 \\end{aligned}',
        variables: [
          { symbol: 'Volume (ఘనపరిమాణం)', meaning: '3D space occupied by the solid object', unit: 'cubic cm (cm³) or cubic m (m³)' },
          { symbol: 'l, b, h', meaning: 'Length, breadth, and height dimensions', unit: 'cm or m' },
          { symbol: 's', meaning: 'Side edge of the cube', unit: 'cm' }
        ],
        explanation: 'Volume measures the amount of 3-dimensional space inside an object. It is calculated in cubic units.',
        rules: [
          'Volume of Cuboid = Length × Breadth × Height.',
          'Volume of Cube = Side × Side × Side.',
          '1 Liter = 1000 mL = 1000 cm³ (cubic centimeters).'
        ],
        examples: [
          {
            question: 'Find the volume of a matchbox of length 4 cm, breadth 2.5 cm, and height 1.5 cm.',
            solution: 'Volume = 4 × 2.5 × 1.5 = 10 × 1.5 = 15 cubic cm (cm³).'
          },
          {
            question: 'A cube has an edge length of 5 cm. What is its volume?',
            solution: 'Volume = 5 × 5 × 5 = 125 cm³.'
          }
        ],
        examTip: 'Units of volume are CUBIC units (cm³ or cubic cm). Write the unit clearly for full marks.',
        boardMarks: '2-4 Marks',
        teluguExplanation: 'దీర్ఘఘనం ఘనపరిమాణం = పొడవు × వెడల్పు × ఎత్తు (ఘనపు సెం.మీ).'
      },
      {
        id: 'c5_m14_2',
        title: 'Weight and Capacity Metric Conversions (బరువు & సామర్థ్య ప్రమాణాలు)',
        formula: '\\begin{aligned} 1 \\text{ kg (కిలోగ్రామ్)} &= 1000 \\text{ g (గ్రాములు)} \\implies 1 \\text{ g} = 0.001 \\text{ kg} \\\\ 1 \\text{ L (లీటర్)} &= 1000 \\text{ mL (మిల్లీలీటర్లు)} \\implies 1 \\text{ mL} = 0.001 \\text{ L} \\end{aligned}',
        variables: [
          { symbol: 'kg ↔ g', meaning: 'Multiply by 1000 for kg to g; Divide by 1000 for g to kg' },
          { symbol: 'L ↔ mL', meaning: 'Multiply by 1000 for L to mL; Divide by 1000 for mL to L' }
        ],
        explanation: 'Metric system prefixes: Kilo means 1000 times, Milli means 1/1000th part.',
        rules: [
          'Half kilogram (1/2 kg) = 500 g.',
          'Quarter kilogram (1/4 kg) = 250 g.',
          'Three-quarter kilogram (3/4 kg) = 750 g.',
          'Half liter (1/2 L) = 500 mL, Quarter liter (1/4 L) = 250 mL.'
        ],
        examples: [
          {
            question: 'How many 250 mL glasses of water can be filled from a 2-liter jug?',
            solution: '2 liters = 2000 mL. Number of glasses = 2000 ÷ 250 = 8 glasses.'
          }
        ],
        examTip: 'Commonly tested in 2-mark word problems involving medicine bottles and milk distribution.',
        boardMarks: '2 Marks',
        teluguExplanation: '1 కిలోగ్రామ్ = 1000 గ్రాములు. 1 లీటరు = 1000 మిల్లీలీటర్లు (1/2 లీటర్ = 500 మి.లీ).'
      }
    ]
  }
];

import { CLASS_6_MATH_FORMULAS } from './class6FormulasSeed';
export { CLASS_6_MATH_FORMULAS };

export const ALL_CHAPTER_FORMULAS: ChapterFormulaSheet[] = [
  ...CLASS_5_MATH_FORMULAS,
  ...CLASS_6_MATH_FORMULAS
];
