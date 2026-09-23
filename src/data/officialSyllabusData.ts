export interface OfficialSubject {
  id: string;
  classId: string; // 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
  name: string;
  nativeName: string;
  code: string;
  chaptersCount: number;
  color: string;
  icon: string;
  chapters: OfficialChapter[];
}

export interface OfficialChapter {
  id: string;
  subjectId: string;
  classId: string;
  chapterNumber: number;
  title: string;
  nativeTitle: string;
  lessonsCount: number;
  lessons: OfficialLesson[];
}

export interface OfficialLesson {
  id: string;
  chapterId: string;
  classId: string;
  lessonNumber: number;
  title: string;
  nativeTitle: string;
  videoUrl?: string;
  summary: string;
  nativeSummary: string;
}

export const OFFICIAL_CLASSES = [
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10'
] as const;

export type OfficialClassGrade = typeof OFFICIAL_CLASSES[number];

export function normalizeGradeKey(rawGrade?: string | null): OfficialClassGrade {
  if (!rawGrade) return 'Class 10';
  const clean = rawGrade.toString().trim();
  if ((OFFICIAL_CLASSES as readonly string[]).includes(clean)) {
    return clean as OfficialClassGrade;
  }
  const match = clean.match(/\d+/);
  if (match) {
    const num = match[0];
    const candidate = `Class ${num}` as OfficialClassGrade;
    if ((OFFICIAL_CLASSES as readonly string[]).includes(candidate)) {
      return candidate;
    }
  }
  return 'Class 10';
}

function makeChapters(classId: OfficialClassGrade, subjectId: string, titles: string[]): OfficialChapter[] {
  return titles.map((title, idx) => ({
    id: `${subjectId}_ch${idx + 1}`,
    subjectId,
    classId,
    chapterNumber: idx + 1,
    title,
    nativeTitle: title,
    lessonsCount: 3,
    lessons: [
      {
        id: `${subjectId}_c${idx + 1}_l1`,
        chapterId: `${subjectId}_ch${idx + 1}`,
        classId,
        lessonNumber: 1,
        title: `Introduction & Key Concepts: ${title}`,
        nativeTitle: title,
        summary: `Core concepts, definitions, and problem-solving techniques for ${title}.`,
        nativeSummary: `${title} చాప్టర్ ముఖ్యమైన అంశాలు మరియు అభ్యాసాలు.`
      }
    ]
  }));
}

export const OFFICIAL_SYLLABUS_BY_CLASS: Record<OfficialClassGrade, OfficialSubject[]> = {
  'Class 5': [
    {
      id: 'c5_tel',
      classId: 'Class 5',
      name: 'Telugu (తెలుగు తోట - 5)',
      nativeName: 'ప్రథమ భాష తెలుగు (తెలుగు తోట - 5)',
      code: 'TEL5',
      chaptersCount: 10,
      color: 'from-amber-600 to-orange-500',
      icon: 'Languages',
      chapters: makeChapters('Class 5', 'c5_tel', [
        '1. ఏ దేశమేగినా (Ye Desamegina - గేయం)',
        '2. యాది (Yaadi)',
        '3. మంచి బహుమతి (Manchi Bahumathi)',
        '4. జయగీతం (Jayageetham)',
        '5. తోడు (Thodu)',
        '6. పెన్నేటి పాట (Penneti Paata)',
        '7. ఎంత మంచివారమ్మ! (Entha Manchivaramma!)',
        '8. వింత జంతువు (Vintha Janthuvu)',
        '9. తరిమెల నాగిరెడ్డి (Tarimela Nagi Reddy)',
        '10. సంక్రాంతి శోభ (Sankranthi Shobha)'
      ])
    },
    {
      id: 'c5_eng',
      classId: 'Class 5',
      name: 'English (Blossoms - 5)',
      nativeName: 'ఆంగ్లం (English - Blossoms)',
      code: 'ENG5',
      chaptersCount: 8,
      color: 'from-purple-600 to-indigo-600',
      icon: 'BookOpen',
      chapters: makeChapters('Class 5', 'c5_eng', [
        '1. Mallika Goes to School',
        '2. My Sweet Home',
        '3. The Clever Rama Krishna',
        '4. The Proud Peacock',
        '5. The Missing Whistle',
        '6. The Honest Woodcutter',
        '7. The Kabaddi Match',
        '8. The Tree and the Travelers'
      ])
    },
    {
      id: 'c5_math',
      classId: 'Class 5',
      name: 'Mathematics (గణితం - Maths Magic)',
      nativeName: 'గణితం (Mathematics - Maths Magic)',
      code: 'MATH5',
      chaptersCount: 11,
      color: 'from-blue-600 to-cyan-500',
      icon: 'Calculator',
      chapters: makeChapters('Class 5', 'c5_math', [
        '1. Let’s Recall (పునశ్చరణ)',
        '2. Large Numbers (పెద్ద సంఖ్యలు)',
        '3. Addition & Subtraction (కూడికలు & తీసివేతలు)',
        '4. Multiplication & Division (గుణకారం & భాగహారం)',
        '5. Factors and Multiples (కారణాంకాలు & గుణిజాలు)',
        '6. Fractions (భిన్నాలు)',
        '7. Decimals (దశాంశాలు)',
        '8. Shapes and Spatial Understanding (జ్యామితి & ఆకారాలు)',
        '9. Measurements & Length (కొలతలు & పొడవు)',
        '10. Perimeter and Area (చుట్టుకొలత & వైశాల్యం)',
        '11. Data Handling (దత్తాంశ నిర్వహణ)'
      ])
    },
    {
      id: 'c5_evs',
      classId: 'Class 5',
      name: 'Environmental Studies (మన పరిసరాలు - EVS)',
      nativeName: 'పరిసరాల విజ్ఞానం (మన పరిసరాలు - 5)',
      code: 'EVS5',
      chaptersCount: 10,
      color: 'from-emerald-600 to-teal-500',
      icon: 'Globe',
      chapters: makeChapters('Class 5', 'c5_evs', [
        '1. Migration of People (వలసలు)',
        '2. Climate Change & Environment (వాతావరణ మార్పులు)',
        '3. Clothes We Wear (మనం ధరించే దుస్తులు)',
        '4. Know Our Body Organs (మన శరీర భాగాలు)',
        '5. Cultivation & Food Production (వ్యవసాయం & ఆహారోత్పత్తి)',
        '6. Water – The Elixir of Life (నీరు – జీవామృతం)',
        '7. Energy (శక్తి రూపాలు)',
        '8. Safety & First Aid (భద్రత & ప్రథమ చికిత్స)',
        '9. Historical Monuments & Heritage (చారిత్రక కట్టడాలు)',
        '10. Our Constitution & Governance (మన రాజ్యాంగం & పరిపాలన)'
      ])
    }
  ],

  'Class 6': [
    {
      id: 'c6_math',
      classId: 'Class 6',
      name: 'Mathematics (Ganita Prakash)',
      nativeName: 'గణిత ప్రకాశ్ (Mathematics)',
      code: 'MATH6',
      chaptersCount: 10,
      color: 'from-blue-600 to-indigo-600',
      icon: 'Calculator',
      chapters: makeChapters('Class 6', 'c6_math', [
        'Patterns in Mathematics',
        'Lines and Angles',
        'Number Play',
        'Data Handling and Presentation',
        'Prime Time',
        'Perimeter and Area',
        'Fractions',
        'Playing with Constructions',
        'Symmetry',
        'The Other Side of Zero'
      ])
    },
    {
      id: 'c6_sci',
      classId: 'Class 6',
      name: 'Science',
      nativeName: 'విజ్ఞాన శాస్త్రం (Science)',
      code: 'SCI6',
      chaptersCount: 12,
      color: 'from-emerald-600 to-cyan-600',
      icon: 'Atom',
      chapters: makeChapters('Class 6', 'c6_sci', [
        'The Wonderful World of Science',
        'Diversity in the Living World',
        'Mindful Eating: A Path to a Healthy Body',
        'Exploring Magnets',
        'Measurement of Length and Motion',
        'Materials Around Us',
        'Temperature and its Measurement',
        'A Journey through the States of Water',
        'Methods of Separation in Everyday Life',
        'Living Creatures: Exploring their Characteristics',
        'Nature’s Treasures',
        'Beyond Earth'
      ])
    },
    {
      id: 'c6_soc',
      classId: 'Class 6',
      name: 'Social Science',
      nativeName: 'సాంఘిక శాస్త్రం (Social Science)',
      code: 'SOC6',
      chaptersCount: 14,
      color: 'from-amber-600 to-orange-500',
      icon: 'Globe',
      chapters: makeChapters('Class 6', 'c6_soc', [
        'Theme A: Locating Places on the Earth',
        'Theme A: Oceans and Continents',
        'Theme A: Landforms and Life',
        'Theme B: Timeline and Sources of History',
        'Theme B: India, That is Bharat',
        'Theme B: The Beginnings of Indian Civilisation',
        'Theme C: India’s Cultural Roots',
        'Theme C: Unity in Diversity, or “Many in the One”',
        'Theme D: Family and Community',
        'Theme D: Grassroots Democracy – Part 1: Governance',
        'Theme D: Grassroots Democracy – Part 2: Local Government in Rural Areas',
        'Theme D: Grassroots Democracy – Part 3: Local Government in Urban Areas',
        'Theme E: The Value of Work',
        'Theme E: Economic Activities Around Us'
      ])
    },
    {
      id: 'c6_eng',
      classId: 'Class 6',
      name: 'English (Honeysuckle & Supplementary)',
      nativeName: 'ఇంగ్లీష్ (English)',
      code: 'ENG6',
      chaptersCount: 6,
      color: 'from-purple-600 to-pink-500',
      icon: 'BookOpen',
      chapters: makeChapters('Class 6', 'c6_eng', [
        'A Bottle of Dew',
        'The Raven and the Fox',
        'Neem Baba',
        'Hamara Bharat – Incredible India!',
        'Fables, Friendship & Nature Stories',
        'Sports, Culture & Values (A Pact with the Sun)'
      ])
    },
    {
      id: 'c6_hin',
      classId: 'Class 6',
      name: 'Hindi (Vasant Bhag-I & Bal Ramkatha)',
      nativeName: 'हिंदी (Hindi)',
      code: 'HIN6',
      chaptersCount: 13,
      color: 'from-red-600 to-rose-500',
      icon: 'Languages',
      chapters: makeChapters('Class 6', 'c6_hin', [
        'मातृभूमि',
        'गोल',
        'पहली बूंद',
        'हार की जीत',
        'रहीम के दोहे',
        'मेरी माँ',
        'जलाते चलो',
        'सत्रिया और बिहू नृत्य',
        'मैया मैं नहिं माखन खायो',
        'परीक्षा',
        'चेतक की वीरता',
        'हिंद महासागर में छोटा-सा हिंदुस्तान',
        'पेड़ की बात'
      ])
    },
    {
      id: 'c6_san',
      classId: 'Class 6',
      name: 'Sanskrit (Ruchira – Pratham Bhag)',
      nativeName: 'సంస్కృతం (Sanskrit)',
      code: 'SAN6',
      chaptersCount: 4,
      color: 'from-teal-600 to-emerald-500',
      icon: 'BookMarked',
      chapters: makeChapters('Class 6', 'c6_san', [
        'प्रथमः पाठः - शब्दपरिचयః I',
        'द्वितीयः पाठः - शब्दपरिचयః II',
        'तृतीयः पाठः - शब्दपरिचयః III',
        'मम विद्यालयః & नीतिश्लोकाః'
      ])
    }
  ],

  'Class 7': [
    {
      id: 'c7_math',
      classId: 'Class 7',
      name: 'Mathematics (Ganita Prakash Parts 1 & 2)',
      nativeName: 'గణిత ప్రకాశ్ (Mathematics)',
      code: 'MATH7',
      chaptersCount: 15,
      color: 'from-blue-600 to-sky-600',
      icon: 'Calculator',
      chapters: makeChapters('Class 7', 'c7_math', [
        'Large Numbers Around Us',
        'Arithmetic Expressions',
        'A Peek Beyond the Point',
        'Expressions Using Letter Numbers',
        'Parallel and Intersecting Lines',
        'Number Play',
        'A Tale of Three Intersecting Lines',
        'Working with Fractions',
        'Geometric Twins',
        'Operations with Integers',
        'Finding Common Ground',
        'Another Peek',
        'Connecting the Dots…',
        'Geometric Constructions',
        'Finding the Unknown'
      ])
    },
    {
      id: 'c7_sci',
      classId: 'Class 7',
      name: 'Science',
      nativeName: 'విజ్ఞాన శాస్త్రం (Science)',
      code: 'SCI7',
      chaptersCount: 18,
      color: 'from-emerald-600 to-green-600',
      icon: 'Atom',
      chapters: makeChapters('Class 7', 'c7_sci', [
        'Nutrition in Plants',
        'Nutrition in Animals',
        'Fibre to Fabric',
        'Heat',
        'Acids, Bases, and Salts',
        'Physical and Chemical Changes',
        'Weather, Climate and Adaptation of Animals to Climate',
        'Winds, Storms, and Cyclones',
        'Soil',
        'Respiration in Organisms',
        'Transportation in Animals and Plants',
        'Reproduction in Plants',
        'Motion and Time',
        'Electric Current and Its Effects',
        'Light',
        'Water: A Precious Resource',
        'Forests: Our Lifeline',
        'Wastewater Story'
      ])
    },
    {
      id: 'c7_soc',
      classId: 'Class 7',
      name: 'Social Science',
      nativeName: 'సాంఘిక శాస్త్రం (Social Science)',
      code: 'SOC7',
      chaptersCount: 11,
      color: 'from-amber-600 to-yellow-600',
      icon: 'Globe',
      chapters: makeChapters('Class 7', 'c7_soc', [
        'Geographical Diversity of India',
        'Understanding the Weather',
        'Climates of India',
        'New Beginnings: Cities and States',
        'The Rise of Empires',
        'The Age of Reorganisation',
        'The Gupta Era: An Age of Tireless Creativity',
        'How Land Became Sacred',
        'From Pilgrimage to Trades, Beyond India',
        'From the Rulers to Ruled: Types of Government',
        'From Barter to Money'
      ])
    },
    {
      id: 'c7_eng',
      classId: 'Class 7',
      name: 'English (Honeycomb & An Alien Hand)',
      nativeName: 'ఇంగ్లీష్ (English)',
      code: 'ENG7',
      chaptersCount: 5,
      color: 'from-purple-600 to-indigo-600',
      icon: 'BookOpen',
      chapters: makeChapters('Class 7', 'c7_eng', [
        'Learning Together',
        'Wit and Humour',
        'Dreams and Discoveries',
        'Travel and Adventure',
        'Bravehearts & True Heroes'
      ])
    },
    {
      id: 'c7_hin',
      classId: 'Class 7',
      name: 'Hindi (Vasant Bhag-II & Bal Mahabharata Katha)',
      nativeName: 'हिंदी (Hindi)',
      code: 'HIN7',
      chaptersCount: 5,
      color: 'from-red-600 to-rose-600',
      icon: 'Languages',
      chapters: makeChapters('Class 7', 'c7_hin', [
        'माँ',
        'कह एक कहानी',
        'तीन बुद्धिमान लोककथा',
        'वसंत भाग-2 गद्य एवं काव्य',
        'बाल महाभारत कथा'
      ])
    },
    {
      id: 'c7_san',
      classId: 'Class 7',
      name: 'Sanskrit (Ruchira – Dwiteeya Bhag)',
      nativeName: 'సంస్కృతం (Sanskrit)',
      code: 'SAN7',
      chaptersCount: 4,
      color: 'from-teal-600 to-cyan-600',
      icon: 'BookMarked',
      chapters: makeChapters('Class 7', 'c7_san', [
        'सुभाषितानि',
        'दुर्बुद्धिः विनश्यति',
        'स्वावलम्बनम्',
        'अमृतं संस्कृतम्'
      ])
    }
  ],

  'Class 8': [
    {
      id: 'c8_math',
      classId: 'Class 8',
      name: 'Mathematics',
      nativeName: 'గణితం (Mathematics)',
      code: 'MATH8',
      chaptersCount: 13,
      color: 'from-blue-600 to-indigo-700',
      icon: 'Calculator',
      chapters: makeChapters('Class 8', 'c8_math', [
        'Rational Numbers',
        'Linear Equations in One Variable',
        'Understanding Quadrilaterals',
        'Data Handling',
        'Squares and Square Roots',
        'Cubes and Cube Roots',
        'Comparing Quantities',
        'Algebraic Expressions and Identities',
        'Mensuration',
        'Exponents and Powers',
        'Direct and Inverse Proportions',
        'Factorisation',
        'Introduction to Graphs'
      ])
    },
    {
      id: 'c8_sci',
      classId: 'Class 8',
      name: 'Science',
      nativeName: 'విజ్ఞాన శాస్త్రం (Science)',
      code: 'SCI8',
      chaptersCount: 18,
      color: 'from-emerald-600 to-teal-600',
      icon: 'Atom',
      chapters: makeChapters('Class 8', 'c8_sci', [
        'Crop Production and Management',
        'Microorganisms: Friend and Foe',
        'Synthetic Fibres and Plastics',
        'Materials: Metals and Non-Metals',
        'Coal and Petroleum',
        'Combustion and Flame',
        'Conservation of Plants and Animals',
        'Cell — Structure and Functions',
        'Reproduction in Animals',
        'Reaching the Age of Adolescence',
        'Force and Pressure',
        'Friction',
        'Sound',
        'Chemical Effects of Electric Current',
        'Some Natural Phenomena',
        'Light',
        'Stars and the Solar System',
        'Pollution of Air and Water'
      ])
    },
    {
      id: 'c8_soc',
      classId: 'Class 8',
      name: 'Social Science',
      nativeName: 'సాంఘిక శాస్త్రం (Social Science)',
      code: 'SOC8',
      chaptersCount: 6,
      color: 'from-amber-600 to-orange-600',
      icon: 'Globe',
      chapters: makeChapters('Class 8', 'c8_soc', [
        'History: 18th-Century India, Colonial Rule & Tribal Movements',
        'History: 1857 Revolt, Colonial Cities & Making of National Movement',
        'Geography: Resources, Land, Water, Vegetation & Agriculture',
        'Geography: Minerals, Power Resources & Industries',
        'Civics: Indian Constitution & Secularism',
        'Civics: Parliament, Judiciary & Understanding Marginalisation'
      ])
    },
    {
      id: 'c8_eng',
      classId: 'Class 8',
      name: 'English (Honeydew & It So Happened)',
      nativeName: 'ఇంగ్లీష్ (English)',
      code: 'ENG8',
      chaptersCount: 5,
      color: 'from-purple-600 to-violet-600',
      icon: 'BookOpen',
      chapters: makeChapters('Class 8', 'c8_eng', [
        'The Best Christmas Present in the World',
        'The Ant and the Cricket',
        'The Tsunami',
        'Geography Lesson',
        'It So Happened Short Stories'
      ])
    },
    {
      id: 'c8_hin',
      classId: 'Class 8',
      name: 'Hindi (Vasant Bhag-III & Bharat Ki Khoj)',
      nativeName: 'हिंदी (Hindi)',
      code: 'HIN8',
      chaptersCount: 6,
      color: 'from-rose-600 to-pink-600',
      icon: 'Languages',
      chapters: makeChapters('Class 8', 'c8_hin', [
        'ध्वनि',
        'वह सुबह कभी तो आएगी',
        'आदिम जनजाति',
        'कबीर की साखियाँ',
        'अकबरी लोटा',
        'भारत की खोज पाठ'
      ])
    },
    {
      id: 'c8_san',
      classId: 'Class 8',
      name: 'Sanskrit (Ruchira – Triteeya Bhag)',
      nativeName: 'సంస్కృతం (Sanskrit)',
      code: 'SAN8',
      chaptersCount: 4,
      color: 'from-teal-600 to-cyan-700',
      icon: 'BookMarked',
      chapters: makeChapters('Class 8', 'c8_san', [
        'सुभाषितानि',
        'बिलस्य वाणी न कदापि मे श्रुता',
        'डीजीभारतम् (Digital India)',
        'सदैव पुरतो निधेहि चरणम्'
      ])
    }
  ],

  'Class 9': [
    {
      id: 'c9_math',
      classId: 'Class 9',
      name: 'Mathematics',
      nativeName: 'గణిత శాస్త్రం (Mathematics)',
      code: 'MATH9',
      chaptersCount: 15,
      color: 'from-blue-600 to-indigo-800',
      icon: 'Calculator',
      chapters: makeChapters('Class 9', 'c9_math', [
        'Number Systems',
        'Polynomials',
        'Coordinate Geometry',
        'Linear Equations in Two Variables',
        'Introduction to Euclid’s Geometry',
        'Lines and Angles',
        'Triangles',
        'Quadrilaterals',
        'Areas of Parallelograms and Triangles',
        'Circles',
        'Constructions',
        'Heron’s Formula',
        'Surface Areas and Volumes',
        'Statistics',
        'Probability'
      ])
    },
    {
      id: 'c9_sci',
      classId: 'Class 9',
      name: 'Science',
      nativeName: 'విజ్ఞాన శాస్త్రం (Science)',
      code: 'SCI9',
      chaptersCount: 15,
      color: 'from-emerald-600 to-teal-700',
      icon: 'Atom',
      chapters: makeChapters('Class 9', 'c9_sci', [
        'Matter in Our Surroundings',
        'Is Matter Around Us Pure?',
        'Atoms and Molecules',
        'Structure of the Atom',
        'The Fundamental Unit of Life',
        'Tissues',
        'Diversity in Living Organisms',
        'Motion',
        'Force and Laws of Motion',
        'Gravitation',
        'Work and Energy',
        'Sound',
        'Why Do We Fall Ill?',
        'Natural Resources',
        'Improvement in Food Resources'
      ])
    },
    {
      id: 'c9_soc',
      classId: 'Class 9',
      name: 'Social Science',
      nativeName: 'సాంఘిక శాస్త్రం (Social Science)',
      code: 'SOC9',
      chaptersCount: 14,
      color: 'from-amber-600 to-orange-700',
      icon: 'Globe',
      chapters: makeChapters('Class 9', 'c9_soc', [
        'History: The French Revolution',
        'History: Socialism in Europe & Russian Revolution',
        'History: Nazism & The Rise of Hitler',
        'History: Forest Society & Pastoralists in Modern World',
        'Geography: India – Size and Location',
        'Geography: Physical Features of India',
        'Geography: Drainage & Climate',
        'Geography: Natural Vegetation, Wildlife & Population',
        'Civics: What is Democracy? Why Democracy?',
        'Civics: Constitutional Design & Electoral Politics',
        'Civics: Working of Institutions & Democratic Rights',
        'Economics: The Story of Village Palampur',
        'Economics: People as Resource',
        'Economics: Poverty as a Challenge & Food Security'
      ])
    },
    {
      id: 'c9_eng',
      classId: 'Class 9',
      name: 'English (Beehive & Moments)',
      nativeName: 'ఇంగ్లీష్ (English)',
      code: 'ENG9',
      chaptersCount: 5,
      color: 'from-purple-600 to-indigo-700',
      icon: 'BookOpen',
      chapters: makeChapters('Class 9', 'c9_eng', [
        'The Fun They Had',
        'The Sound of Music',
        'The Little Girl',
        'The Road Not Taken',
        'Moments Supplementary Stories'
      ])
    },
    {
      id: 'c9_hin',
      classId: 'Class 9',
      name: 'Hindi (Sparsh Bhag-I & Sanchayan)',
      nativeName: 'हिंदी (Hindi)',
      code: 'HIN9',
      chaptersCount: 6,
      color: 'from-red-600 to-pink-700',
      icon: 'Languages',
      chapters: makeChapters('Class 9', 'c9_hin', [
        'कहानी की पूछ',
        'मेरे बच्चे',
        'प्रेमचंद के फव्वारे',
        'तोप',
        'नाना साहेब की पुत्री',
        'संचयन कहानियां'
      ])
    },
    {
      id: 'c9_san',
      classId: 'Class 9',
      name: 'Sanskrit (Shemushi – Prathama Bhag)',
      nativeName: 'సంస్కృతం (Sanskrit)',
      code: 'SAN9',
      chaptersCount: 4,
      color: 'from-teal-600 to-emerald-700',
      icon: 'BookMarked',
      chapters: makeChapters('Class 9', 'c9_san', [
        'भारतीवसन्तगीतिः',
        'स्वर्णकाकः',
        'सोमप्रभम्',
        'व्याकरणम् एवं पाठ्य-अभ्यासः'
      ])
    }
  ],

  'Class 10': [
    {
      id: 'c10_math',
      classId: 'Class 10',
      name: 'Mathematics',
      nativeName: 'గణిత శాస్త్రం (Mathematics)',
      code: 'MATH10',
      chaptersCount: 14,
      color: 'from-blue-600 via-indigo-600 to-cyan-500',
      icon: 'Calculator',
      chapters: makeChapters('Class 10', 'c10_math', [
        'Real Numbers',
        'Polynomials',
        'Pair of Linear Equations in Two Variables',
        'Quadratic Equations',
        'Arithmetic Progressions',
        'Triangles',
        'Coordinate Geometry',
        'Introduction to Trigonometry',
        'Some Applications of Trigonometry',
        'Circles',
        'Areas Related to Circles',
        'Surface Areas and Volumes',
        'Statistics',
        'Probability'
      ])
    },
    {
      id: 'c10_sci',
      classId: 'Class 10',
      name: 'Science',
      nativeName: 'విజ్ఞాన శాస్త్రం (Science)',
      code: 'SCI10',
      chaptersCount: 14,
      color: 'from-emerald-600 via-teal-600 to-green-500',
      icon: 'Atom',
      chapters: makeChapters('Class 10', 'c10_sci', [
        'Chemistry: Chemical Reactions and Equations',
        'Chemistry: Acids, Bases and Salts',
        'Chemistry: Metals and Non-metals',
        'Chemistry: Carbon and Its Compounds',
        'Biology: Life Processes',
        'Biology: Control and Coordination',
        'Biology: How do Organisms Reproduce?',
        'Biology: Heredity',
        'Biology: Our Environment',
        'Physics: Light – Reflection and Refraction',
        'Physics: The Human Eye and the Colourful World',
        'Physics: Electricity',
        'Physics: Magnetic Effects of Electric Current',
        'Physics: Sources of Energy'
      ])
    },
    {
      id: 'c10_ps',
      classId: 'Class 10',
      name: 'Physical Science',
      nativeName: 'భౌతిక రసాయన శాస్త్రం (Physical Science)',
      code: 'PS10',
      chaptersCount: 9,
      color: 'from-amber-600 via-orange-600 to-yellow-500',
      icon: 'Zap',
      chapters: makeChapters('Class 10', 'c10_ps', [
        'Chemical Reactions and Equations',
        'Acids, Bases and Salts',
        'Metals and Non-metals',
        'Carbon and Its Compounds',
        'Light – Reflection and Refraction',
        'The Human Eye and the Colourful World',
        'Electricity',
        'Magnetic Effects of Electric Current',
        'Sources of Energy'
      ])
    },
    {
      id: 'c10_bs',
      classId: 'Class 10',
      name: 'Biological Science',
      nativeName: 'జీవ శాస్త్రం (Biological Science)',
      code: 'BS10',
      chaptersCount: 5,
      color: 'from-green-600 via-emerald-600 to-teal-500',
      icon: 'Atom',
      chapters: makeChapters('Class 10', 'c10_bs', [
        'Life Processes',
        'Control and Coordination',
        'How do Organisms Reproduce?',
        'Heredity',
        'Our Environment'
      ])
    },
    {
      id: 'c10_soc',
      classId: 'Class 10',
      name: 'Social Science',
      nativeName: 'సాంఘిక శాస్త్రం (Social Science)',
      code: 'SOC10',
      chaptersCount: 23,
      color: 'from-purple-600 via-indigo-600 to-blue-500',
      icon: 'Globe',
      chapters: makeChapters('Class 10', 'c10_soc', [
        'History: The Rise of Nationalism in Europe',
        'History: Nationalism in India',
        'History: The Making of a Global World',
        'History: The Age of Industrialisation',
        'History: Print Culture and the Modern World',
        'Geography: Resources and Development',
        'Geography: Forest and Wildlife Resources',
        'Geography: Water Resources',
        'Geography: Agriculture',
        'Geography: Minerals and Energy Resources',
        'Geography: Manufacturing Industries',
        'Geography: Lifelines of National Economy',
        'Political Science: Power Sharing',
        'Political Science: Federalism',
        'Political Science: Gender, Religion and Caste',
        'Political Science: Political Parties',
        'Political Science: Outcomes of Democracy',
        'Political Science: Challenges to Democracy',
        'Economics: Development',
        'Economics: Sectors of the Indian Economy',
        'Economics: Money and Credit',
        'Economics: Globalisation and the Indian Economy',
        'Economics: Consumer Rights'
      ])
    },
    {
      id: 'c10_eng',
      classId: 'Class 10',
      name: 'English',
      nativeName: 'ఆంగ్లం (English)',
      code: 'ENG10',
      chaptersCount: 29,
      color: 'from-pink-600 via-rose-600 to-red-500',
      icon: 'BookOpen',
      chapters: makeChapters('Class 10', 'c10_eng', [
        'First Flight (Prose): A Letter to God',
        'First Flight (Prose): Nelson Mandela: Long Walk to Freedom',
        'First Flight (Prose): Two Stories About Flying',
        'First Flight (Prose): From the Diary of Anne Frank',
        'First Flight (Prose): Glimpses of India',
        'First Flight (Prose): Mijbil the Otter',
        'First Flight (Prose): Madam Rides the Bus',
        'First Flight (Prose): The Sermon at Benares',
        'First Flight (Prose): The Proposal',
        'First Flight (Poem): Dust of Snow',
        'First Flight (Poem): Fire and Ice',
        'First Flight (Poem): A Tiger in the Zoo',
        'First Flight (Poem): How to Tell Wild Animals',
        'First Flight (Poem): The Ball Poem',
        'First Flight (Poem): Amanda!',
        'First Flight (Poem): Animals',
        'First Flight (Poem): The Trees',
        'First Flight (Poem): Fog',
        'First Flight (Poem): The Tale of Custard the Dragon',
        'First Flight (Poem): For Anne Gregory',
        'Footprints Without Feet: A Triumph of Surgery',
        'Footprints Without Feet: The Thief’s Story',
        'Footprints Without Feet: The Midnight Visitor',
        'Footprints Without Feet: A Question of Trust',
        'Footprints Without Feet: Footprints Without Feet',
        'Footprints Without Feet: The Making of a Scientist',
        'Footprints Without Feet: The Necklace',
        'Footprints Without Feet: Bholi',
        'Footprints Without Feet: The Book That Saved the Earth'
      ])
    },
    {
      id: 'c10_hin',
      classId: 'Class 10',
      name: 'Hindi',
      nativeName: 'हिंदी (Hindi)',
      code: 'HIN10',
      chaptersCount: 6,
      color: 'from-red-600 via-rose-600 to-orange-500',
      icon: 'Languages',
      chapters: makeChapters('Class 10', 'c10_hin', [
        'Hindi Course A: क्षितिज भाग–2',
        'Hindi Course A: कृतिका भाग–2',
        'Hindi Course A: Grammar and Writing Skills (व्याकरण एवं लेखन कौशल)',
        'Hindi Course B: स्पर्श भाग–2',
        'Hindi Course B: संचयन भाग–2',
        'Hindi Course B: Grammar and Writing Skills (व्याकरण एवं लेखन कौशल)'
      ])
    }
  ]
};
