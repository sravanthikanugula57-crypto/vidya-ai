import { CareerCategory, CareerItem, CareerQuizQuestion, GuessCareerGameItem, SkillChallengeItem } from '../types/career';

export const CAREER_CATEGORIES: { id: CareerCategory | 'all'; label: string; iconEmoji: string; color: string }[] = [
  { id: 'all', label: 'All Careers', iconEmoji: '🌟', color: 'from-amber-500 to-orange-500' },
  { id: 'science', label: 'Science', iconEmoji: '🔬', color: 'from-blue-500 to-indigo-600' },
  { id: 'technology', label: 'Technology', iconEmoji: '💻', color: 'from-cyan-500 to-blue-600' },
  { id: 'creative', label: 'Creative', iconEmoji: '🎨', color: 'from-pink-500 to-rose-600' },
  { id: 'healthcare', label: 'Healthcare', iconEmoji: '🩺', color: 'from-emerald-500 to-teal-600' },
  { id: 'environment', label: 'Environment', iconEmoji: '🌱', color: 'from-green-500 to-emerald-600' },
  { id: 'education', label: 'Education', iconEmoji: '👩‍🏫', color: 'from-yellow-500 to-amber-600' },
  { id: 'governance', label: 'Civil Services & Law', iconEmoji: '🏛️', color: 'from-purple-500 to-violet-600' },
  { id: 'engineering', label: 'Engineering & Trades', iconEmoji: '🔧', color: 'from-orange-500 to-red-600' },
];

export const CAREER_DATABASE: CareerItem[] = [
  {
    id: 'scientist',
    title: 'Research Scientist',
    category: 'science',
    emoji: '🔬',
    tagline: 'Discover new laws of physics, space phenomena, and life mysteries.',
    description: 'Scientists conduct experiments, formulate hypotheses, analyze research data, and invent new medicines or technologies to solve global challenges.',
    suitableSubjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics'],
    keySkills: ['Analytical Thinking', 'Hypothesis Testing', 'Data Analysis', 'Laboratory Technique'],
    educationPath: [
      'Class 10 SSC with strong Science & Math foundation',
      'Intermediate (11th & 12th) in MPC or BiPC stream',
      'Bachelor of Science (B.Sc / BS-MS at IISER / IISc)',
      'Master of Science (M.Sc) & Ph.D in specialized scientific domain'
    ],
    recommendedStream: 'MPC',
    salaryRange: '₹6,00,000 – ₹18,00,000 / year',
    jobDemand: 'Very High',
    entranceExams: ['IISER IAT', 'NEST (NISER)', 'CUET-UG', 'JEE Advanced', 'CSIR-NET'],
    govtScholarships: ['INSPIRE Scholarship (DST)', 'KVPY/Fellowships', 'PM YASASVI'],
    topRoles: ['Astrophysicist', 'Biotechnologist', 'Quantum Researcher', 'Nanotechnology Specialist'],
    dayInTheLife: 'Designing experiments in labs, running computational models, publishing breakthrough papers, and collaborating with global research institutes like ISRO and DRDO.',
    iconBg: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800'
  },
  {
    id: 'software_engineer',
    title: 'Software Engineer',
    category: 'technology',
    emoji: '💻',
    tagline: 'Build mobile apps, AI algorithms, and cloud platforms for the world.',
    description: 'Software Engineers write code, architect software systems, develop artificial intelligence tools, and create web applications used by millions of people daily.',
    suitableSubjects: ['Mathematics', 'Computer Science', 'Physics'],
    keySkills: ['Python & JavaScript', 'Problem Solving', 'Data Structures', 'System Design'],
    educationPath: [
      'Class 10 SSC -> AP POLYCET (3-Year Diploma) or Intermediate MPC',
      'B.Tech / B.E in Computer Science, AI & ML, or Data Science',
      'Internships and open-source software contributions',
      'Software Developer / AI Engineer in tech firms'
    ],
    recommendedStream: 'MPC',
    salaryRange: '₹5,00,000 – ₹24,00,000 / year',
    jobDemand: 'Very High',
    entranceExams: ['AP EAPCET', 'JEE Main', 'JEE Advanced', 'AP ECET (for Poly-technic students)'],
    govtScholarships: ['Jagananna Vidya Deevena', 'Post-Matric Scholarship', 'National Merit Scholarship'],
    topRoles: ['Full-Stack Developer', 'AI/ML Engineer', 'Mobile App Developer', 'Cybersecurity Specialist'],
    dayInTheLife: 'Writing efficient code, resolving bugs, collaborating with product managers on new app features, and deploying scalable software on cloud servers.',
    iconBg: 'bg-cyan-500/10 text-cyan-600 border-cyan-200 dark:border-cyan-800'
  },
  {
    id: 'doctor',
    title: 'Medical Doctor (MBBS)',
    category: 'healthcare',
    emoji: '🩺',
    tagline: 'Heal illnesses, perform surgeries, and save human lives.',
    description: 'Doctors diagnose diseases, prescribe medication, carry out emergency treatments, and provide specialized clinical care across hospitals and healthcare centers.',
    suitableSubjects: ['Biology', 'Chemistry', 'Physics'],
    keySkills: ['Empathy', 'Clinical Diagnosis', 'Patient Communication', 'Quick Decision Making'],
    educationPath: [
      'Class 10 SSC with distinction in Natural Science',
      'Intermediate (11th & 12th) in BiPC stream',
      'NEET UG entrance examination',
      'MBBS (5.5 years including 1-year internship)',
      'MD / MS specialization in Cardiology, Pediatrics, Surgery, etc.'
    ],
    recommendedStream: 'BiPC',
    salaryRange: '₹8,00,000 – ₹30,00,000 / year',
    jobDemand: 'Very High',
    entranceExams: ['NEET UG', 'NEET PG', 'AIIMS / INI-CET'],
    govtScholarships: ['Central Sector Scholarship for Medical Students', 'AP Post-Matric Fee Reimbursement'],
    topRoles: ['Pediatrician', 'Cardiologist', 'General Physician', 'Neurosurgeon'],
    dayInTheLife: 'Conducting patient rounds, diagnosing health conditions through medical tests, performing vital surgeries, and saving lives in critical care units.',
    iconBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800'
  },
  {
    id: 'agricultural_scientist',
    title: 'Agricultural Scientist',
    category: 'environment',
    emoji: '🌱',
    tagline: 'Revolutionize farming, crop yields, and sustainable food security.',
    description: 'Agricultural scientists research high-yield seeds, smart drip irrigation, organic pest management, and soil health to help farmers improve agricultural output.',
    suitableSubjects: ['Biology', 'Chemistry', 'Geography', 'Mathematics'],
    keySkills: ['Soil Chemistry', 'Crop Genetics', 'Sustainable Irrigation', 'Drone & Remote Sensing'],
    educationPath: [
      'Class 10 SSC -> Intermediate BiPC or Agricultural Polytechnic',
      'B.Sc (Hons) Agriculture / Horticulture / Agricultural Engineering',
      'M.Sc & ICAR Agricultural Research Scientist (ARS) examination'
    ],
    recommendedStream: 'BiPC',
    salaryRange: '₹4,50,000 – ₹14,00,000 / year',
    jobDemand: 'High',
    entranceExams: ['AP EAPCET (Agri Stream)', 'ICAR AIEEA UG', 'ANGRAU AgriCET'],
    govtScholarships: ['ICAR National Talent Scholarship', 'AP Rythu Bharosa Student Fellows'],
    topRoles: ['Agronomist', 'Horticulture Officer', 'Soil Health Expert', 'Plant Geneticist'],
    dayInTheLife: 'Field trials with farmers, analyzing soil nutrients in laboratory spectrographs, testing drought-resistant hybrid seeds, and advising government farm policies.',
    iconBg: 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-800'
  },
  {
    id: 'ui_ux_designer',
    title: 'UI/UX & Digital Designer',
    category: 'creative',
    emoji: '🎨',
    tagline: 'Craft intuitive mobile interfaces, 3D graphics, and visual art.',
    description: 'Designers blend visual art, psychology, and technology to create interactive apps, websites, game visuals, and brand identities that delight users.',
    suitableSubjects: ['Visual Arts', 'English', 'Computer Science', 'Psychology'],
    keySkills: ['Visual Layout', 'Figma & 3D Prototyping', 'User Psychology', 'Typography & Color Theory'],
    educationPath: [
      'Class 10 SSC with passion for drawing and design',
      'Intermediate in any stream (MPC / CEC / HEC / Arts)',
      'B.Des (Bachelor of Design) at NID / IIT UCEED or B.A Animation & Multimedia'
    ],
    recommendedStream: 'Any',
    salaryRange: '₹4,50,000 – ₹18,00,000 / year',
    jobDemand: 'High',
    entranceExams: ['UCEED (IITs)', 'NID DAT', 'NIFT', 'CEED'],
    govtScholarships: ['Ministry of Culture Art Scholarships', 'State Youth Skill Awards'],
    topRoles: ['Product Designer', '3D Game Artist', 'UX Researcher', 'Motion Graphic Designer'],
    dayInTheLife: 'Sketching user flow wireframes, creating high-fidelity interactive app designs, testing user experiences with real students, and designing stunning interfaces.',
    iconBg: 'bg-pink-500/10 text-pink-600 border-pink-200 dark:border-pink-800'
  },
  {
    id: 'ias_civil_servant',
    title: 'Civil Services Officer (IAS / IPS)',
    category: 'governance',
    emoji: '🏛️',
    tagline: 'Lead districts, enact public policies, and serve the nation.',
    description: 'Civil servants direct government administration, implement welfare programs, maintain law & order, and ensure quality public schools and healthcare for citizens.',
    suitableSubjects: ['Social Studies', 'History', 'Civics', 'Economics', 'English'],
    keySkills: ['Public Policy', 'Leadership', 'Critical Reasoning', 'Crisis Management'],
    educationPath: [
      'Class 10 SSC -> Intermediate (HEC / CEC / MPC / BiPC)',
      'Bachelor’s Degree in any discipline (B.A, B.Sc, B.Tech, B.Com)',
      'UPSC Civil Services Examination (Prelims, Mains, Interview) or APPSC Group-1'
    ],
    recommendedStream: 'HEC',
    salaryRange: '₹9,00,000 – ₹25,00,000 / year + Official Benefits',
    jobDemand: 'High',
    entranceExams: ['UPSC CSE', 'APPSC Group 1 & 2', 'UPSC CDS / NDA'],
    govtScholarships: ['Dr. Ambedkar Post-Graduate Coaching Scheme', 'AP Study Circle Free Residential Coaching'],
    topRoles: ['District Collector (IAS)', 'Superintendent of Police (IPS)', 'Revenue Divisional Officer', 'Municipal Commissioner'],
    dayInTheLife: 'Inspecting development projects, holding public grievance redressal meetings (Spandana), managing disaster relief, and directing district administration.',
    iconBg: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800'
  },
  {
    id: 'teacher_professor',
    title: 'Educator & Professor',
    category: 'education',
    emoji: '👩‍🏫',
    tagline: 'Inspire future generations, teach concepts, and mentor minds.',
    description: 'Educators foster curiosity, teach foundational concepts, guide student ambitions, and develop innovative pedagogical methods to empower learners.',
    suitableSubjects: ['Telugu', 'English', 'Mathematics', 'Science', 'Social Studies'],
    keySkills: ['Pedagogy', 'Communication', 'Empathy', 'Curriculum Design'],
    educationPath: [
      'Class 10 SSC -> Intermediate in relevant subject stream',
      'Bachelor Degree (B.Sc / B.A / B.Com) + B.Ed (Bachelor of Education)',
      'AP DSC (District Selection Committee) or UGC-NET for University Lectureship'
    ],
    recommendedStream: 'Any',
    salaryRange: '₹4,00,000 – ₹15,00,000 / year',
    jobDemand: 'Stable',
    entranceExams: ['AP EDCET', 'AP TET', 'AP DSC', 'UGC-NET / CSIR-NET'],
    govtScholarships: ['Central Teacher Training Fellowship', 'AP Vidya Grant'],
    topRoles: ['School Principal', 'Government High School Teacher', 'University Professor', 'STEM Education Specialist'],
    dayInTheLife: 'Delivering inspiring interactive lessons, mentoring students with personalized guidance, creating experiments in school labs, and shaping bright minds.',
    iconBg: 'bg-yellow-500/10 text-amber-600 border-amber-200 dark:border-amber-800'
  },
  {
    id: 'mechanical_civil_engineer',
    title: 'Civil & Infrastructure Engineer',
    category: 'engineering',
    emoji: '🔧',
    tagline: 'Build bridges, dams, solar power grids, and smart cities.',
    description: 'Civil and mechanical engineers plan, design, and oversee construction of major highways, dams, high-speed rail lines, water treatment plants, and smart urban structures.',
    suitableSubjects: ['Mathematics', 'Physics', 'Engineering Drawing'],
    keySkills: ['Structural Analysis', 'CAD Software', 'Site Management', 'Materials Science'],
    educationPath: [
      'Class 10 SSC -> AP POLYCET (3-Year Civil/Mech Diploma) or Inter MPC',
      'B.Tech / B.E in Civil / Mechanical / Electrical Engineering',
      'GATE examination or APPSC Assistant Executive Engineer (AEE)'
    ],
    recommendedStream: 'MPC',
    salaryRange: '₹4,50,000 – ₹16,00,000 / year',
    jobDemand: 'High',
    entranceExams: ['AP POLYCET', 'AP EAPCET', 'GATE', 'APPSC AEE'],
    govtScholarships: ['AICTE Pragati / Saksham', 'AP POLYCET Merit Waiver'],
    topRoles: ['Structural Engineer', 'Irrigation Project Lead', 'Renewable Energy Consultant', 'Urban Infrastructure Planner'],
    dayInTheLife: 'Analyzing blueprints, testing concrete stress, managing on-site heavy construction machinery, and building enduring national infrastructure.',
    iconBg: 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800'
  }
];

export const CAREER_QUIZ_QUESTIONS: CareerQuizQuestion[] = [
  {
    id: 1,
    question: 'When you have free time during school lunch or at home, what activity excites you the most?',
    category: 'Interests & Activities',
    options: [
      { text: 'Doing science experiments, observing nature, or solving math riddles', category: 'science', icon: '🔬', points: 3 },
      { text: 'Playing with computer code, gaming mechanics, or exploring smartphones', category: 'technology', icon: '💻', points: 3 },
      { text: 'Drawing, sketching, painting, writing stories, or decorating things', category: 'creative', icon: '🎨', points: 3 },
      { text: 'Helping someone when they are hurt or learning how the human body works', category: 'healthcare', icon: '🩺', points: 3 }
    ]
  },
  {
    id: 2,
    question: 'Which school subject do you look forward to the most during the week?',
    category: 'Academic Aptitude',
    options: [
      { text: 'Physical Science, Botany & Chemistry experiments', category: 'science', icon: '⚗️', points: 3 },
      { text: 'Social Studies, Civics, History & Debates on current affairs', category: 'governance', icon: '🏛️', points: 3 },
      { text: 'Natural Science, Farming, Plants & Environmental care', category: 'environment', icon: '🌱', points: 3 },
      { text: 'Explaining difficult lessons to friends and organizing group study', category: 'education', icon: '👩‍🏫', points: 3 }
    ]
  },
  {
    id: 3,
    question: 'If you were given a mission to help your village or town, what project would you lead?',
    category: 'Real-world Problem Solving',
    options: [
      { text: 'Developing an app for farmers to check fair crop prices and weather alerts', category: 'technology', icon: '📱', points: 3 },
      { text: 'Constructing a sturdy flood-proof bridge and clean drinking water pipeline', category: 'engineering', icon: '🌉', points: 3 },
      { text: 'Setting up a mobile health clinic with free vaccinations and health checks', category: 'healthcare', icon: '🏥', points: 3 },
      { text: 'Working with the government collector to ensure zero child dropouts in schools', category: 'governance', icon: '📜', points: 3 }
    ]
  },
  {
    id: 4,
    question: 'What kind of work environment do you picture yourself enjoying in the future?',
    category: 'Work Environment',
    options: [
      { text: 'High-tech modern software lab with double monitors and smart devices', category: 'technology', icon: '🖥️', points: 3 },
      { text: 'Lush green agricultural fields, research greenhouses, and outdoor sites', category: 'environment', icon: '🌾', points: 3 },
      { text: 'Creative design studio with digital drawing tablets and colorful prototypes', category: 'creative', icon: '🖌️', points: 3 },
      { text: 'Clean laboratory with microscopes, centrifuges, and test tubes', category: 'science', icon: '🧪', points: 3 }
    ]
  },
  {
    id: 5,
    question: 'What type of problems do you feel most proud of solving?',
    category: 'Problem Styles',
    options: [
      { text: 'Fixing broken machines, assembling models, and understanding how gears turn', category: 'engineering', icon: '⚙️', points: 3 },
      { text: 'Inspiring someone to learn a new skill and seeing their confidence grow', category: 'education', icon: '💡', points: 3 },
      { text: 'Resolving disagreements fairly and standing up for justice and rules', category: 'governance', icon: '⚖️', points: 3 },
      { text: 'Inventing a completely new visual concept or story that nobody has made before', category: 'creative', icon: '✨', points: 3 }
    ]
  }
];

export const GUESS_THE_CAREER_GAMES: GuessCareerGameItem[] = [
  {
    id: 'game_1',
    careerTitle: 'Software Engineer',
    category: 'technology',
    emoji: '💻',
    hints: [
      'I speak languages like Python, Java, and JavaScript that computers understand.',
      'I create the buttons, logic, and databases inside apps like VidyaAI, WhatsApp, and YouTube.',
      'My favorite keys are Ctrl+C, Ctrl+V, and debugging broken syntax!'
    ],
    tools: ['Code Editor (VS Code)', 'Terminal', 'Git Version Control', 'Cloud Servers'],
    options: ['Software Engineer', 'Bank Manager', 'Civil Contractor', 'Electrician'],
    funFact: 'The first computer programmer in history was Ada Lovelace in 1843!'
  },
  {
    id: 'game_2',
    careerTitle: 'Research Scientist',
    category: 'science',
    emoji: '🔬',
    hints: [
      'I spend hours examining tiny cells under microscopes or studying deep space stars.',
      'I formulate hypotheses, test them with controlled experiments, and publish peer-reviewed papers.',
      'ISRO, DRDO, and NASA employ thousands of people in my profession!'
    ],
    tools: ['Electron Microscope', 'Spectrometer', 'Centrifuge', 'Lab Notebook'],
    options: ['Research Scientist', 'Graphic Artist', 'School Bus Driver', 'Actor'],
    funFact: 'Sir C.V. Raman won the Nobel Prize in Physics for discovering the Raman Effect in India!'
  },
  {
    id: 'game_3',
    careerTitle: 'Agricultural Scientist',
    category: 'environment',
    emoji: '🌱',
    hints: [
      'I test soil pH, crossbreed climate-resilient seeds, and optimize drip irrigation.',
      'My mission is to help farmers produce more food using less water and zero harmful chemicals.',
      'ANGRAU in Andhra Pradesh is one of the premier universities for my domain.'
    ],
    tools: ['Soil Moisture Sensor', 'Seed Germination Chamber', 'Drones', 'pH Meter'],
    options: ['Agricultural Scientist', 'Accountant', 'Pilot', 'Lawyer'],
    funFact: 'The Green Revolution led by Dr. M.S. Swaminathan transformed India from food deficiency to food surplus!'
  },
  {
    id: 'game_4',
    careerTitle: 'Civil Services Officer (IAS / IPS)',
    category: 'governance',
    emoji: '🏛️',
    hints: [
      'I clear the prestigious UPSC Civil Services examination.',
      'I am responsible for running district administration, schools, hospitals, and maintaining law & order.',
      'People bring their community grievances to me during Spandana petitions.'
    ],
    tools: ['Government Directives', 'District Action Plans', 'Welfare Schemas', 'Public Meetings'],
    options: ['Civil Services Officer (IAS / IPS)', 'Software Tester', 'Fashion Stylist', 'Shopkeeper'],
    funFact: 'Over 10 lakh students appear for the UPSC Civil Services exam in India every year!'
  },
  {
    id: 'game_5',
    careerTitle: 'Medical Doctor (MBBS)',
    category: 'healthcare',
    emoji: '🩺',
    hints: [
      'I wear a white coat and listen to heartbeats and lung sounds using a stethoscope.',
      'I took the NEET entrance exam and completed 5.5 years of rigorous clinical training.',
      'I diagnose ailments and prescribe medicines to bring patients back to vibrant health.'
    ],
    tools: ['Stethoscope', 'Sphygmomanometer (BP Monitor)', 'Thermometer', 'Prescription Pad'],
    options: ['Medical Doctor (MBBS)', 'Mechanical Welder', 'Chartered Accountant', 'Architect'],
    funFact: 'The stethoscope was invented in 1816 by French doctor René Laennec using a rolled paper tube!'
  }
];

export const SKILL_CHALLENGES: SkillChallengeItem[] = [
  {
    id: 'skill_1',
    careerTitle: 'Software Engineer',
    careerCategory: 'technology',
    title: 'Code Logic Bug Finder',
    scenario: 'An AP school attendance app needs to calculate how many students are present today.',
    challengeType: 'mcq',
    question: 'A classroom has 40 registered students. The app receives: `total = 40`, `absent = 7`. Which code expression correctly calculates the percentage of attendance?',
    options: [
      '((40 - 7) / 40) * 100',
      '(7 / 40) * 100',
      '(40 / 7) * 100',
      '40 - (7 * 100)'
    ],
    correctAnswer: 0,
    explanation: 'Present students = 40 - 7 = 33. Percentage = (33 / 40) * 100 = 82.5% attendance!',
    skillTested: 'Algorithmic Thinking & Math Logic'
  },
  {
    id: 'skill_2',
    careerTitle: 'Agricultural Scientist',
    careerCategory: 'environment',
    title: 'Soil Nutrient Diagnosis',
    scenario: 'A paddy farmer in East Godavari observes that older rice leaves are turning yellow while new leaves remain green.',
    challengeType: 'mcq',
    question: 'What essential plant nutrient is most likely deficient when older leaves exhibit uniform yellowing (chlorosis)?',
    options: [
      'Nitrogen (N) Deficiency',
      'Excessive Water Flooding',
      'Sunlight Deprivation',
      'Calcium Deficiency'
    ],
    correctAnswer: 0,
    explanation: 'Nitrogen is a mobile nutrient. When deficient, the plant translocates nitrogen from older leaves to newer shoots, causing old leaves to turn yellow first.',
    skillTested: 'Scientific Diagnosis & Plant Pathology'
  },
  {
    id: 'skill_3',
    careerTitle: 'Civil & Infrastructure Engineer',
    careerCategory: 'engineering',
    title: 'Truss Bridge Structural Balance',
    scenario: 'You are designing a footbridge across a village canal for school children.',
    challengeType: 'mcq',
    question: 'Why are triangular shapes universally used in truss bridges rather than rectangular frames?',
    options: [
      'Triangles cannot deform without altering the length of their sides, making them rigid and stable',
      'Triangles use more steel than squares',
      'Triangles look better aesthetically',
      'Rectangles are too light to carry weight'
    ],
    correctAnswer: 0,
    explanation: 'A triangle is the simplest geometrically rigid shape; it distributes compression and tension forces without bending at the joints.',
    skillTested: 'Structural Physics & Engineering Design'
  },
  {
    id: 'skill_4',
    careerTitle: 'Civil Services Officer',
    careerCategory: 'governance',
    title: 'District Drought Crisis Decision',
    scenario: 'As District Collector, summer water levels have dropped 60%. Four sectors need urgent water supply.',
    challengeType: 'mcq',
    question: 'Under the National Water Policy, which sector receives top constitutional priority for water allocation?',
    options: [
      'Drinking water for citizens and livestock',
      'Industrial factories and IT parks',
      'Golf courses and commercial fountains',
      'Hydroelectric power generation only'
    ],
    correctAnswer: 0,
    explanation: 'National and State Water Policies prioritize drinking water for human survival and livestock above all industrial or commercial demands.',
    skillTested: 'Public Policy & Ethical Governance'
  }
];
