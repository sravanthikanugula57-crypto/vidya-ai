export interface MockQuestion {
  id: string;
  questionNumber: number;
  subject: 'Mathematics' | 'Physical Science' | 'Biological Science' | 'Social Studies';
  chapter: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number; // 0, 1, 2, 3 index
  explanation: string;
  marks: number;
}

export const GRAND_MOCK_100_QUESTIONS: MockQuestion[] = [
  // =========================================================================
  // SECTION 1: MATHEMATICS (Questions 1 to 25)
  // =========================================================================
  {
    id: 'm_1',
    questionNumber: 1,
    subject: 'Mathematics',
    chapter: 'Real Numbers',
    question: 'According to Euclid\'s Division Lemma, for any two positive integers a and b, there exist unique integers q and r such that a = bq + r. What is the condition on r?',
    options: ['0 ≤ r < b', '0 < r ≤ b', '0 ≤ r ≤ b', '0 < r < b'],
    correctAnswer: 0,
    explanation: 'Euclid\'s Division Lemma specifies that the remainder r must satisfy 0 ≤ r < b.',
    marks: 1
  },
  {
    id: 'm_2',
    questionNumber: 2,
    subject: 'Mathematics',
    chapter: 'Real Numbers',
    question: 'The decimal expansion of the rational number 43 / (2⁴ × 5³) will terminate after how many places of decimals?',
    options: ['3 decimal places', '4 decimal places', '5 decimal places', '1 decimal place'],
    correctAnswer: 1,
    explanation: 'The number of terminating decimal places is determined by the maximum exponent of 2 and 5 in the prime factorized denominator. Here max(4, 3) = 4.',
    marks: 1
  },
  {
    id: 'm_3',
    questionNumber: 3,
    subject: 'Mathematics',
    chapter: 'Real Numbers',
    question: 'If HCF(306, 657) = 9, what is LCM(306, 657)?',
    options: ['22338', '21338', '22438', '23338'],
    correctAnswer: 0,
    explanation: 'LCM = (Product of numbers) / HCF = (306 × 657) / 9 = 34 × 657 = 22338.',
    marks: 1
  },
  {
    id: 'm_4',
    questionNumber: 4,
    subject: 'Mathematics',
    chapter: 'Sets',
    question: 'If set A = {x : x is a prime number < 10} and set B = {x : x is an odd natural number < 10}, what is A ∩ B?',
    options: ['{2, 3, 5, 7}', '{3, 5, 7}', '{1, 3, 5, 7}', '{2}'],
    correctAnswer: 1,
    explanation: 'A = {2, 3, 5, 7} and B = {1, 3, 5, 7, 9}. The intersection A ∩ B is {3, 5, 7}.',
    marks: 1
  },
  {
    id: 'm_5',
    questionNumber: 5,
    subject: 'Mathematics',
    chapter: 'Polynomials',
    question: 'If α and β are the zeroes of the quadratic polynomial p(x) = x² - 5x + 6, what is the value of α² + β²?',
    options: ['25', '13', '12', '19'],
    correctAnswer: 1,
    explanation: 'α + β = 5, αβ = 6. α² + β² = (α + β)² - 2αβ = 25 - 12 = 13.',
    marks: 1
  },
  {
    id: 'm_6',
    questionNumber: 6,
    subject: 'Mathematics',
    chapter: 'Polynomials',
    question: 'A quadratic polynomial whose zeroes are -3 and 4 is given by:',
    options: ['x² - x - 12', 'x² + x - 12', 'x² - 7x + 12', 'x² + 7x - 12'],
    correctAnswer: 0,
    explanation: 'p(x) = x² - (Sum of zeroes)x + (Product of zeroes) = x² - (-3 + 4)x + (-3 × 4) = x² - x - 12.',
    marks: 1
  },
  {
    id: 'm_7',
    questionNumber: 7,
    subject: 'Mathematics',
    chapter: 'Linear Equations in Two Variables',
    question: 'The pair of linear equations 2x + 3y = 7 and 4x + 6y = 12 represents lines which are:',
    options: ['Intersecting at a unique point', 'Coincident', 'Parallel', 'Perpendicular'],
    correctAnswer: 2,
    explanation: 'a1/a2 = 2/4 = 1/2; b1/b2 = 3/6 = 1/2; c1/c2 = 7/12. Since a1/a2 = b1/b2 ≠ c1/c2, the lines are parallel and have no solution.',
    marks: 1
  },
  {
    id: 'm_8',
    questionNumber: 8,
    subject: 'Mathematics',
    chapter: 'Quadratic Equations',
    question: 'For what value of k will the quadratic equation 2x² - kx + 8 = 0 have equal roots?',
    options: ['±4', '±8', '±6', '±16'],
    correctAnswer: 1,
    explanation: 'For equal roots, discriminant D = b² - 4ac = 0. k² - 4(2)(8) = 0 => k² - 64 = 0 => k = ±8.',
    marks: 1
  },
  {
    id: 'm_9',
    questionNumber: 9,
    subject: 'Mathematics',
    chapter: 'Progressions',
    question: 'The 10th term of the Arithmetic Progression 2, 7, 12, 17, ... is:',
    options: ['45', '47', '52', '50'],
    correctAnswer: 1,
    explanation: 'First term a = 2, common difference d = 5. a₁₀ = a + 9d = 2 + 9(5) = 47.',
    marks: 1
  },
  {
    id: 'm_10',
    questionNumber: 10,
    subject: 'Mathematics',
    chapter: 'Progressions',
    question: 'Find the sum of the first 20 terms of the AP: 1, 4, 7, 10, ...',
    options: ['590', '600', '580', '610'],
    correctAnswer: 0,
    explanation: 'S_n = n/2 [2a + (n-1)d]. S₂₀ = 20/2 [2(1) + 19(3)] = 10 [2 + 57] = 590.',
    marks: 1
  },
  {
    id: 'm_11',
    questionNumber: 11,
    subject: 'Mathematics',
    chapter: 'Coordinate Geometry',
    question: 'The distance between the points P(2, -3) and Q(10, 3) is:',
    options: ['8 units', '10 units', '12 units', '14 units'],
    correctAnswer: 1,
    explanation: 'Distance = √[(10 - 2)² + (3 - (-3))²] = √[8² + 6²] = √[64 + 36] = √100 = 10 units.',
    marks: 1
  },
  {
    id: 'm_12',
    questionNumber: 12,
    subject: 'Mathematics',
    chapter: 'Coordinate Geometry',
    question: 'The coordinates of the midpoint of the line segment joining A(-5, 4) and B(7, -8) are:',
    options: ['(1, -2)', '(2, -4)', '(-1, 2)', '(6, -6)'],
    correctAnswer: 0,
    explanation: 'Midpoint = ((x1 + x2)/2, (y1 + y2)/2) = ((-5 + 7)/2, (4 + (-8))/2) = (2/2, -4/2) = (1, -2).',
    marks: 1
  },
  {
    id: 'm_13',
    questionNumber: 13,
    subject: 'Mathematics',
    chapter: 'Similar Triangles',
    question: 'In △ABC, DE ∥ BC intersecting AB at D and AC at E. If AD = 3 cm, DB = 5 cm, and AE = 4.5 cm, then EC is:',
    options: ['7.5 cm', '6.0 cm', '8.0 cm', '9.0 cm'],
    correctAnswer: 0,
    explanation: 'By Basic Proportionality Theorem (Thales Theorem): AD / DB = AE / EC => 3 / 5 = 4.5 / EC => EC = (5 × 4.5) / 3 = 7.5 cm.',
    marks: 1
  },
  {
    id: 'm_14',
    questionNumber: 14,
    subject: 'Mathematics',
    chapter: 'Similar Triangles',
    question: 'The ratio of the areas of two similar triangles is equal to 16:81. What is the ratio of their corresponding sides?',
    options: ['4:9', '16:81', '2:3', '256:6561'],
    correctAnswer: 0,
    explanation: 'The ratio of areas of two similar triangles equals the ratio of squares of their corresponding sides. So sides ratio = √(16/81) = 4/9.',
    marks: 1
  },
  {
    id: 'm_15',
    questionNumber: 15,
    subject: 'Mathematics',
    chapter: 'Tangents and Secants to a Circle',
    question: 'From a point Q, the length of the tangent to a circle is 24 cm and the distance of Q from the center is 25 cm. The radius of the circle is:',
    options: ['7 cm', '12 cm', '15 cm', '24.5 cm'],
    correctAnswer: 0,
    explanation: 'Radius r = √(OQ² - Tangent²) = √(25² - 24²) = √(625 - 576) = √49 = 7 cm.',
    marks: 1
  },
  {
    id: 'm_16',
    questionNumber: 16,
    subject: 'Mathematics',
    chapter: 'Tangents and Secants to a Circle',
    question: 'How many tangents can be drawn to a circle from an external point?',
    options: ['Only 1', 'Exactly 2', 'Infinitely many', 'Zero'],
    correctAnswer: 1,
    explanation: 'From an external point outside a circle, exactly two tangents can be drawn and both tangents are equal in length.',
    marks: 1
  },
  {
    id: 'm_17',
    questionNumber: 17,
    subject: 'Mathematics',
    chapter: 'Mensuration',
    question: 'If the radius of a sphere is doubled, what happens to its volume?',
    options: ['Doubles', 'Becomes 4 times', 'Becomes 8 times', 'Becomes 16 times'],
    correctAnswer: 2,
    explanation: 'Volume V = (4/3)πr³. If r becomes 2r, new volume = (4/3)π(2r)³ = 8 × (4/3)πr³, which is 8 times.',
    marks: 1
  },
  {
    id: 'm_18',
    questionNumber: 18,
    subject: 'Mathematics',
    chapter: 'Mensuration',
    question: 'The total surface area of a solid hemisphere of radius r is:',
    options: ['2πr²', '3πr²', '4πr²', '(2/3)πr³'],
    correctAnswer: 1,
    explanation: 'Total surface area of a solid hemisphere = Curved surface area (2πr²) + Flat circular base (πr²) = 3πr².',
    marks: 1
  },
  {
    id: 'm_19',
    questionNumber: 19,
    subject: 'Mathematics',
    chapter: 'Trigonometry',
    question: 'What is the value of (sin 30° + cos 60°) - tan 45°?',
    options: ['0', '1', '1/2', '2'],
    correctAnswer: 0,
    explanation: 'sin 30° = 1/2, cos 60° = 1/2, tan 45° = 1. (1/2 + 1/2) - 1 = 1 - 1 = 0.',
    marks: 1
  },
  {
    id: 'm_20',
    questionNumber: 20,
    subject: 'Mathematics',
    chapter: 'Trigonometry',
    question: 'If tan θ = 4/3, what is the value of sin θ + cos θ?',
    options: ['7/5', '1', '5/7', '8/5'],
    correctAnswer: 0,
    explanation: 'tan θ = Opposite/Adjacent = 4/3. Hypotenuse = √(4² + 3²) = 5. sin θ = 4/5, cos θ = 3/5. Sum = 4/5 + 3/5 = 7/5.',
    marks: 1
  },
  {
    id: 'm_21',
    questionNumber: 21,
    subject: 'Mathematics',
    chapter: 'Applications of Trigonometry',
    question: 'A pole 6 m high casts a shadow 2√3 m long on the ground. What is the angle of elevation of the Sun?',
    options: ['30°', '45°', '60°', '90°'],
    correctAnswer: 2,
    explanation: 'tan θ = height / shadow = 6 / (2√3) = 3 / √3 = √3. Since tan 60° = √3, the angle of elevation is 60°.',
    marks: 1
  },
  {
    id: 'm_22',
    questionNumber: 22,
    subject: 'Mathematics',
    chapter: 'Probability',
    question: 'A card is drawn from a well-shuffled pack of 52 playing cards. What is the probability of getting a black face card?',
    options: ['3/26', '3/13', '1/26', '6/52'],
    correctAnswer: 0,
    explanation: 'Total cards = 52. Face cards in black suits (Spades & Clubs: J, Q, K each) = 2 × 3 = 6. Probability = 6/52 = 3/26.',
    marks: 1
  },
  {
    id: 'm_23',
    questionNumber: 23,
    subject: 'Mathematics',
    chapter: 'Probability',
    question: 'If P(E) = 0.05, what is the probability of "not E"?',
    options: ['0.95', '0.05', '1.05', '0.50'],
    correctAnswer: 0,
    explanation: 'P(not E) = 1 - P(E) = 1 - 0.05 = 0.95.',
    marks: 1
  },
  {
    id: 'm_24',
    questionNumber: 24,
    subject: 'Mathematics',
    chapter: 'Statistics',
    question: 'What is the empirical relationship between Mean, Median, and Mode?',
    options: [
      'Mode = 3 Median - 2 Mean',
      'Mode = 2 Median - 3 Mean',
      'Median = 3 Mode - 2 Mean',
      'Mean = 3 Median - 2 Mode'
    ],
    correctAnswer: 0,
    explanation: 'The standard empirical formula connecting measures of central tendency is Mode = 3 Median - 2 Mean.',
    marks: 1
  },
  {
    id: 'm_25',
    questionNumber: 25,
    subject: 'Mathematics',
    chapter: 'Statistics',
    question: 'For a grouped data, if the modal class is 30-40, with lower limit l = 30, f1 = 12, f0 = 8, f2 = 6, and class size h = 10, the mode is:',
    options: ['34', '33.5', '35', '32.8'],
    correctAnswer: 0,
    explanation: 'Mode = l + [(f1 - f0) / (2f1 - f0 - f2)] × h = 30 + [(12 - 8) / (24 - 8 - 6)] × 10 = 30 + (4 / 10) × 10 = 30 + 4 = 34.',
    marks: 1
  },

  // =========================================================================
  // SECTION 2: PHYSICAL SCIENCE (Questions 26 to 50)
  // =========================================================================
  {
    id: 'p_26',
    questionNumber: 26,
    subject: 'Physical Science',
    chapter: 'Reflection of Light at Curved Surfaces',
    question: 'What is the focal length of a spherical concave mirror whose radius of curvature is 30 cm?',
    options: ['15 cm', '-15 cm', '60 cm', '-30 cm'],
    correctAnswer: 1,
    explanation: 'For a concave mirror, focal length f = -R/2 = -30/2 = -15 cm following the Cartesian sign convention.',
    marks: 1
  },
  {
    id: 'p_27',
    questionNumber: 27,
    subject: 'Physical Science',
    chapter: 'Reflection of Light at Curved Surfaces',
    question: 'Where should an object be placed in front of a concave mirror to obtain a virtual, erect, and magnified image?',
    options: [
      'Between Focus (F) and Center of Curvature (C)',
      'At Center of Curvature (C)',
      'Between Pole (P) and Focus (F)',
      'Beyond Center of Curvature'
    ],
    correctAnswer: 2,
    explanation: 'When an object is placed between the Pole and Principal Focus of a concave mirror, a virtual, erect, and magnified image is formed behind the mirror.',
    marks: 1
  },
  {
    id: 'p_28',
    questionNumber: 28,
    subject: 'Physical Science',
    chapter: 'Chemical Equations',
    question: 'In the balanced chemical equation Fe + H₂O → Fe₃O₄ + H₂, what are the stoichiometric coefficients for Fe and H₂O?',
    options: ['3 and 4', '2 and 3', '3 and 2', '1 and 4'],
    correctAnswer: 0,
    explanation: 'Balanced equation: 3Fe + 4H₂O → Fe₃O₄ + 4H₂. The coefficients are 3 for Fe and 4 for H₂O.',
    marks: 1
  },
  {
    id: 'p_29',
    questionNumber: 29,
    subject: 'Physical Science',
    chapter: 'Acids, Bases and Salts',
    question: 'What gas is evolved when dilute hydrochloric acid reacts with zinc granules?',
    options: ['Oxygen gas', 'Carbon dioxide gas', 'Hydrogen gas', 'Nitrogen dioxide gas'],
    correctAnswer: 2,
    explanation: 'Zn + 2HCl → ZnCl₂ + H₂↑. Hydrogen gas burns with a characteristic "pop" sound when tested with a burning splinter.',
    marks: 1
  },
  {
    id: 'p_30',
    questionNumber: 30,
    subject: 'Physical Science',
    chapter: 'Acids, Bases and Salts',
    question: 'What is the chemical formula of Plaster of Paris?',
    options: ['CaSO₄ · 2H₂O', 'CaSO₄ · ½H₂O', 'CaSO₄ · 5H₂O', 'CaCl₂ · 2H₂O'],
    correctAnswer: 1,
    explanation: 'Plaster of Paris is calcium sulphate hemihydrate: CaSO₄ · ½H₂O.',
    marks: 1
  },
  {
    id: 'p_31',
    questionNumber: 31,
    subject: 'Physical Science',
    chapter: 'Refraction of Light at Curved Surfaces',
    question: 'Which of the following represents the Lens Maker\'s Formula?',
    options: [
      '1/f = (n - 1) [1/R₁ - 1/R₂]',
      '1/f = (n + 1) [1/R₁ + 1/R₂]',
      'f = (n - 1) [R₁ - R₂]',
      '1/f = n [1/R₁ - 1/R₂]'
    ],
    correctAnswer: 0,
    explanation: 'The Lens Maker\'s Formula relates focal length f to the refractive index n and radii of curvature R₁ and R₂: 1/f = (n - 1)(1/R₁ - 1/R₂).',
    marks: 1
  },
  {
    id: 'p_32',
    questionNumber: 32,
    subject: 'Physical Science',
    chapter: 'Refraction of Light at Curved Surfaces',
    question: 'A convex lens has a focal length of +20 cm. What is its optical power in diopters (D)?',
    options: ['+2 D', '+5 D', '-5 D', '+0.05 D'],
    correctAnswer: 1,
    explanation: 'Power P = 100 / f (in cm) = 100 / 20 = +5 Diopters.',
    marks: 1
  },
  {
    id: 'p_33',
    questionNumber: 33,
    subject: 'Physical Science',
    chapter: 'Human Eye and Colourful World',
    question: 'Which corrective lens is prescribed for an individual suffering from Myopia (near-sightedness)?',
    options: ['Convex lens', 'Concave lens', 'Bifocal lens', 'Cylindrical lens'],
    correctAnswer: 1,
    explanation: 'Myopia is corrected using a concave (diverging) lens of suitable power so that light rays focus on the retina.',
    marks: 1
  },
  {
    id: 'p_34',
    questionNumber: 34,
    subject: 'Physical Science',
    chapter: 'Human Eye and Colourful World',
    question: 'The splitting of white light into its component colors upon passing through a glass prism is called:',
    options: ['Reflection', 'Total internal reflection', 'Dispersion', 'Diffraction'],
    correctAnswer: 2,
    explanation: 'Dispersion is the phenomenon of splitting white light into its seven constituent spectral colors (VIBGYOR).',
    marks: 1
  },
  {
    id: 'p_35',
    questionNumber: 35,
    subject: 'Physical Science',
    chapter: 'Structure of Atom',
    question: 'What is the maximum number of electrons that can be accommodated in the principal energy level n = 3 (M shell)?',
    options: ['8', '18', '32', '2'],
    correctAnswer: 1,
    explanation: 'Maximum number of electrons in shell n is given by 2n² = 2(3)² = 18.',
    marks: 1
  },
  {
    id: 'p_36',
    questionNumber: 36,
    subject: 'Physical Science',
    chapter: 'Structure of Atom',
    question: 'According to Aufbau principle, which orbital is filled first between 4s and 3d?',
    options: [
      '4s is filled before 3d because (n + l) for 4s (4+0=4) is lower than 3d (3+2=5)',
      '3d is filled before 4s because 3 is less than 4',
      'Both are filled simultaneously',
      'Depends on whether the atom is metallic or non-metallic'
    ],
    correctAnswer: 0,
    explanation: 'According to the (n + l) rule of Aufbau principle, 4s has n+l = 4, whereas 3d has n+l = 5. Lower energy orbitals fill first, so 4s fills before 3d.',
    marks: 1
  },
  {
    id: 'p_37',
    questionNumber: 37,
    subject: 'Physical Science',
    chapter: 'Classification of Elements - The Periodic Table',
    question: 'Across a period from left to right in the modern periodic table, what happens to atomic radius?',
    options: ['Increases', 'Decreases', 'Remains constant', 'First decreases then increases'],
    correctAnswer: 1,
    explanation: 'Atomic radius decreases from left to right across a period due to increase in effective nuclear charge pulling valence electrons closer.',
    marks: 1
  },
  {
    id: 'p_38',
    questionNumber: 38,
    subject: 'Physical Science',
    chapter: 'Classification of Elements - The Periodic Table',
    question: 'Moseley\'s periodic law arranged chemical elements in increasing order of their:',
    options: ['Atomic mass', 'Atomic number', 'Density', 'Equivalent weight'],
    correctAnswer: 1,
    explanation: 'Henry Moseley showed that atomic number (Z) is the fundamental property of an element, establishing the Modern Periodic Law.',
    marks: 1
  },
  {
    id: 'p_39',
    questionNumber: 39,
    subject: 'Physical Science',
    chapter: 'Chemical Bonding',
    question: 'Which type of chemical bond is formed by complete transfer of one or more valence electrons from a metal to a non-metal?',
    options: ['Covalent bond', 'Ionic (electrovalent) bond', 'Metallic bond', 'Hydrogen bond'],
    correctAnswer: 1,
    explanation: 'Ionic bond is formed through electrostatic attraction following the complete transfer of valence electrons.',
    marks: 1
  },
  {
    id: 'p_40',
    questionNumber: 40,
    subject: 'Physical Science',
    chapter: 'Chemical Bonding',
    question: 'What is the shape and bond angle of a methane (CH₄) molecule according to VSEPR theory?',
    options: ['Linear, 180°', 'Tetrahedral, 109° 28\'', 'Trigonal planar, 120°', 'Pyramidal, 107°'],
    correctAnswer: 1,
    explanation: 'Methane has 4 bond pairs and 0 lone pairs around carbon, adopting a tetrahedral geometry with bond angle 109° 28\'.',
    marks: 1
  },
  {
    id: 'p_41',
    questionNumber: 41,
    subject: 'Physical Science',
    chapter: 'Electric Current',
    question: 'According to Ohm\'s Law, the graph plotted between potential difference (V) and electric current (I) for an ohmic conductor is a:',
    options: ['Straight line passing through the origin', 'Parabolic curve', 'Hyperbolic curve', 'Circle'],
    correctAnswer: 0,
    explanation: 'V = IR. Since V is directly proportional to I at constant temperature, the V-I characteristic curve is a straight line through the origin.',
    marks: 1
  },
  {
    id: 'p_42',
    questionNumber: 42,
    subject: 'Physical Science',
    chapter: 'Electric Current',
    question: 'Three resistors of resistances 2 Ω, 3 Ω, and 6 Ω are connected in parallel. What is their equivalent resistance?',
    options: ['11 Ω', '1 Ω', '2 Ω', '0.5 Ω'],
    correctAnswer: 1,
    explanation: '1/R = 1/2 + 1/3 + 1/6 = (3 + 2 + 1)/6 = 6/6 = 1. Therefore R = 1 Ω.',
    marks: 1
  },
  {
    id: 'p_43',
    questionNumber: 43,
    subject: 'Physical Science',
    chapter: 'Electric Current',
    question: 'Joule\'s law of heating states that heat produced H is proportional to:',
    options: ['I × R × t', 'I² × R × t', 'I × R² × t', 'V² × I × t'],
    correctAnswer: 1,
    explanation: 'H = I²Rt, where I is current, R is resistance, and t is time.',
    marks: 1
  },
  {
    id: 'p_44',
    questionNumber: 44,
    subject: 'Physical Science',
    chapter: 'Electromagnetism',
    question: 'Which rule is used to determine the direction of induced current in an electric generator?',
    options: [
      'Fleming\'s Left-Hand Rule',
      'Fleming\'s Right-Hand Rule',
      'Right-Hand Thumb Rule',
      'Ampere\'s Swimming Rule'
    ],
    correctAnswer: 1,
    explanation: 'Fleming\'s Right-Hand Rule gives the direction of induced current in electromagnetic induction (dynamos/generators).',
    marks: 1
  },
  {
    id: 'p_45',
    questionNumber: 45,
    subject: 'Physical Science',
    chapter: 'Electromagnetism',
    question: 'The unit of magnetic flux density (B) in SI units is:',
    options: ['Weber (Wb)', 'Tesla (T)', 'Ampere per meter', 'Oersted'],
    correctAnswer: 1,
    explanation: 'Tesla (T) = Weber per square meter (Wb/m²) is the SI unit of magnetic flux density.',
    marks: 1
  },
  {
    id: 'p_46',
    questionNumber: 46,
    subject: 'Physical Science',
    chapter: 'Principles of Metallurgy',
    question: 'The froth floatation process is predominantly utilized for the concentration of which type of ores?',
    options: ['Oxide ores', 'Carbonate ores', 'Sulphide ores', 'Halide ores'],
    correctAnswer: 2,
    explanation: 'Sulphide ores (such as copper pyrites, zinc blende, galena) are preferentially wetted by pine oil and float on froth.',
    marks: 1
  },
  {
    id: 'p_47',
    questionNumber: 47,
    subject: 'Physical Science',
    chapter: 'Principles of Metallurgy',
    question: 'What is the main reducing agent used in the blast furnace for the extraction of iron from haematite ore?',
    options: ['Carbon dioxide (CO₂)', 'Carbon monoxide (CO)', 'Hydrogen gas (H₂)', 'Limestone (CaCO₃)'],
    correctAnswer: 1,
    explanation: 'Carbon monoxide (CO) reduces haematite (Fe₂O₃ + 3CO → 2Fe + 3CO₂) in the upper reduction zone of the blast furnace.',
    marks: 1
  },
  {
    id: 'p_48',
    questionNumber: 48,
    subject: 'Physical Science',
    chapter: 'Carbon and its Compounds',
    question: 'The property of carbon atoms to form long covalent chains and rings by bonding with each other is called:',
    options: ['Isomerism', 'Catenation', 'Polymerisation', 'Tetravalence'],
    correctAnswer: 1,
    explanation: 'Catenation is the unique ability of carbon to form strong C-C bonds creating long chains, branched chains, and closed rings.',
    marks: 1
  },
  {
    id: 'p_49',
    questionNumber: 49,
    subject: 'Physical Science',
    chapter: 'Carbon and its Compounds',
    question: 'What is the functional group present in an organic compound with the formula CH₃-COOH (ethanoic acid)?',
    options: ['-CHO (Aldehyde)', '-COOH (Carboxylic acid)', '-OH (Alcohol)', '>C=O (Ketone)'],
    correctAnswer: 1,
    explanation: 'Ethanoic acid contains the carboxylic acid group (-COOH).',
    marks: 1
  },
  {
    id: 'p_50',
    questionNumber: 50,
    subject: 'Physical Science',
    chapter: 'Carbon and its Compounds',
    question: 'What is the IUPAC name of the hydrocarbon with structural formula CH₃-CH=CH₂?',
    options: ['Propane', 'Propene', 'Propyne', 'Butene'],
    correctAnswer: 1,
    explanation: 'A 3-carbon hydrocarbon containing one carbon-carbon double bond is named Propene.',
    marks: 1
  },

  // =========================================================================
  // SECTION 3: BIOLOGICAL SCIENCE (Questions 51 to 75)
  // =========================================================================
  {
    id: 'b_51',
    questionNumber: 51,
    subject: 'Biological Science',
    chapter: 'Nutrition',
    question: 'During the light reaction of photosynthesis, which molecule undergoes photolysis to release oxygen gas?',
    options: ['Carbon dioxide (CO₂)', 'Water (H₂O)', 'Glucose (C₆H₁₂O₆)', 'Chlorophyll a'],
    correctAnswer: 1,
    explanation: 'Photolysis of water (Hill reaction) takes place in the grana thylakoids, splitting water into protons, electrons, and releasing O₂.',
    marks: 1
  },
  {
    id: 'b_52',
    questionNumber: 52,
    subject: 'Biological Science',
    chapter: 'Nutrition',
    question: 'Kwashiorkor disease in children is caused by the severe dietary deficiency of:',
    options: ['Proteins only', 'Calories only', 'Proteins and calories both', 'Vitamin C'],
    correctAnswer: 0,
    explanation: 'Kwashiorkor is protein-deficiency malnutrition characterised by edema, enlarged liver, and swollen belly. (Marasmus is both protein and calorie deficiency).',
    marks: 1
  },
  {
    id: 'b_53',
    questionNumber: 53,
    subject: 'Biological Science',
    chapter: 'Nutrition',
    question: 'Which enzyme present in human saliva begins the breakdown of complex dietary starch into maltose?',
    options: ['Pepsin', 'Salivary Amylase (Ptyalin)', 'Lipase', 'Trypsin'],
    correctAnswer: 1,
    explanation: 'Salivary amylase (ptyalin) digests starch into disaccharide maltose in the oral cavity at slightly acidic/neutral pH.',
    marks: 1
  },
  {
    id: 'b_54',
    questionNumber: 54,
    subject: 'Biological Science',
    chapter: 'Respiration',
    question: 'Where does the complete breakdown of pyruvate into CO₂, H₂O, and ATP occur during aerobic cellular respiration?',
    options: ['Cytoplasm', 'Mitochondria', 'Chloroplast', 'Ribosome'],
    correctAnswer: 1,
    explanation: 'Glycolysis occurs in cytoplasm, while the Krebs cycle and electron transport chain occur inside the matrix and cristae of Mitochondria.',
    marks: 1
  },
  {
    id: 'b_55',
    questionNumber: 55,
    subject: 'Biological Science',
    chapter: 'Respiration',
    question: 'What end product is formed during anaerobic respiration in human skeletal muscle cells during intense exercise?',
    options: ['Ethanol + CO₂', 'Lactic acid', 'Pyruvic acid', 'Acetic acid'],
    correctAnswer: 1,
    explanation: 'Under oxygen deficit, muscle cells convert pyruvate into lactic acid via lactic acid fermentation, causing fatigue and muscle cramps.',
    marks: 1
  },
  {
    id: 'b_56',
    questionNumber: 56,
    subject: 'Biological Science',
    chapter: 'Transportation',
    question: 'Which valve prevents the backflow of oxygenated blood from the left ventricle to the left atrium?',
    options: ['Tricuspid valve', 'Bicuspid (Mitral) valve', 'Pulmonary semilunar valve', 'Aortic semilunar valve'],
    correctAnswer: 1,
    explanation: 'The bicuspid (mitral) valve guards the atrioventricular aperture between the left atrium and left ventricle.',
    marks: 1
  },
  {
    id: 'b_57',
    questionNumber: 57,
    subject: 'Biological Science',
    chapter: 'Transportation',
    question: 'What is the normal resting blood pressure of a healthy human adult?',
    options: ['120/80 mm Hg', '80/120 mm Hg', '140/90 mm Hg', '100/60 mm Hg'],
    correctAnswer: 0,
    explanation: 'Normal systolic pressure is 120 mm Hg, and diastolic pressure is 80 mm Hg, recorded as 120/80 mm Hg using a sphygmomanometer.',
    marks: 1
  },
  {
    id: 'b_58',
    questionNumber: 58,
    subject: 'Biological Science',
    chapter: 'Transportation',
    question: 'The upward conduction of water and dissolved minerals from roots to leaves in plants takes place through:',
    options: ['Phloem sieve tubes', 'Xylem vessels and tracheids', 'Cortex parenchyma', 'Epidermal stoma'],
    correctAnswer: 1,
    explanation: 'Xylem tissue is responsible for the unidirectional ascent of sap, driven by transpiration pull and root pressure.',
    marks: 1
  },
  {
    id: 'b_59',
    questionNumber: 59,
    subject: 'Biological Science',
    chapter: 'Excretion',
    question: 'What is the structural and functional filtration unit of the human kidney?',
    options: ['Neuron', 'Nephron', 'Glomerulus', 'Alveolus'],
    correctAnswer: 1,
    explanation: 'The nephron is the microscopic functional unit of kidney (~1.2 million per kidney) carrying out ultrafiltration and selective reabsorption.',
    marks: 1
  },
  {
    id: 'b_60',
    questionNumber: 60,
    subject: 'Biological Science',
    chapter: 'Excretion',
    question: 'In the nephron, where does the ultrafiltration of blood under high hydrostatic pressure occur?',
    options: [
      'Malpighian body (Bowman\'s capsule & Glomerulus)',
      'Loop of Henle',
      'Distal convoluted tubule',
      'Collecting duct'
    ],
    correctAnswer: 0,
    explanation: 'Ultrafiltration occurs in the glomerulus enclosed inside Bowman\'s capsule, driven by high glomerular capillary blood pressure.',
    marks: 1
  },
  {
    id: 'b_61',
    questionNumber: 61,
    subject: 'Biological Science',
    chapter: 'Control and Coordination',
    question: 'Which plant hormone is responsible for cell elongation and phototropic curvature towards light?',
    options: ['Auxin', 'Abscisic acid (ABA)', 'Ethylene', 'Cytokinin'],
    correctAnswer: 0,
    explanation: 'Auxin diffuses towards the shaded side of shoot tips causing cells on the dark side to elongate, bending the plant towards light.',
    marks: 1
  },
  {
    id: 'b_62',
    questionNumber: 62,
    subject: 'Biological Science',
    chapter: 'Control and Coordination',
    question: 'Which endocrine gland is known as the "Master Gland" of the human body because its secretions regulate other glands?',
    options: ['Thyroid gland', 'Pituitary gland', 'Adrenal gland', 'Pancreas'],
    correctAnswer: 1,
    explanation: 'The pituitary gland produces tropic hormones (TSH, ACTH, FSH, LH, GH) that control the activities of other endocrine glands.',
    marks: 1
  },
  {
    id: 'b_63',
    questionNumber: 63,
    subject: 'Biological Science',
    chapter: 'Control and Coordination',
    question: 'The microscopic junction across which a nerve impulse transmits from the axon terminal of one neuron to the dendrite of the next is called:',
    options: ['Myelin sheath', 'Synapse', 'Node of Ranvier', 'Neuromuscular junction'],
    correctAnswer: 1,
    explanation: 'A synapse is the functional contact where neurotransmitters (like acetylcholine) diffuse across the synaptic cleft.',
    marks: 1
  },
  {
    id: 'b_64',
    questionNumber: 64,
    subject: 'Biological Science',
    chapter: 'Reproduction',
    question: 'In flowering plants, double fertilization results in the formation of:',
    options: [
      'Zygote (2n) and Primary Endosperm Nucleus (3n)',
      'Two zygotes (2n)',
      'Seed coat and Pericarp',
      'Pollen tube and Antipodals'
    ],
    correctAnswer: 0,
    explanation: 'One sperm nucleus fuses with egg to form diploid zygote (syngamy); second sperm fuses with two polar nuclei to form triploid endosperm (triple fusion).',
    marks: 1
  },
  {
    id: 'b_65',
    questionNumber: 65,
    subject: 'Biological Science',
    chapter: 'Reproduction',
    question: 'Which mode of asexual reproduction is seen in Hydra and Yeast where a miniature outgrowth develops into a new individual?',
    options: ['Binary fission', 'Budding', 'Spore formation', 'Regeneration'],
    correctAnswer: 1,
    explanation: 'Budding is the asexual process wherein a small bud grows on the parent organism, matures, and eventually detaches.',
    marks: 1
  },
  {
    id: 'b_66',
    questionNumber: 66,
    subject: 'Biological Science',
    chapter: 'Heredity',
    question: 'In Gregor Mendel\'s monohybrid cross between pure tall (TT) and pure dwarf (tt) pea plants, what was the phenotypic ratio in the F₂ generation?',
    options: ['3:1', '1:2:1', '9:3:3:1', '1:1'],
    correctAnswer: 0,
    explanation: 'F₂ generation yields 3 tall plants to 1 dwarf plant (phenotypic ratio 3:1). Genotypic ratio is 1 TT : 2 Tt : 1 tt (1:2:1).',
    marks: 1
  },
  {
    id: 'b_67',
    questionNumber: 67,
    subject: 'Biological Science',
    chapter: 'Heredity',
    question: 'How many pairs of chromosomes are present in each somatic cell of human beings?',
    options: ['22 pairs', '23 pairs (46 chromosomes)', '24 pairs', '44 pairs'],
    correctAnswer: 1,
    explanation: 'Humans have 23 pairs of chromosomes (22 pairs of autosomes and 1 pair of sex chromosomes XX/XY).',
    marks: 1
  },
  {
    id: 'b_68',
    questionNumber: 68,
    subject: 'Biological Science',
    chapter: 'Heredity',
    question: 'Who proposed the Theory of Evolution by Natural Selection in the landmark book "On the Origin of Species"?',
    options: ['Jean-Baptiste Lamarck', 'Charles Darwin', 'Gregor Mendel', 'Hugo de Vries'],
    correctAnswer: 1,
    explanation: 'Charles Darwin proposed natural selection in 1859 after observing flora and fauna on the Galapagos Islands aboard HMS Beagle.',
    marks: 1
  },
  {
    id: 'b_69',
    questionNumber: 69,
    subject: 'Biological Science',
    chapter: 'Our Environment',
    question: 'In an ecological food chain, according to Lindeman\'s Ten Percent Law, what percentage of energy is transferred from one trophic level to the next higher level?',
    options: ['1%', '10%', '50%', '90%'],
    correctAnswer: 1,
    explanation: 'Only about 10% of the energy consumed at one trophic level is stored as biomass and made available to the next trophic level.',
    marks: 1
  },
  {
    id: 'b_70',
    questionNumber: 70,
    subject: 'Biological Science',
    chapter: 'Our Environment',
    question: 'The progressive accumulation and magnification of non-biodegradable pesticides (like DDT) along successive trophic levels is called:',
    options: ['Eutrophication', 'Biomagnification', 'Bio-accumulation', 'Bioremediation'],
    correctAnswer: 1,
    explanation: 'Biological magnification (biomagnification) is the increase in pesticide concentration at successive consumer levels in food chains.',
    marks: 1
  },
  {
    id: 'b_71',
    questionNumber: 71,
    subject: 'Biological Science',
    chapter: 'Natural Resources',
    question: 'The Chipko Andolan (Hug the Trees Movement) originated in the 1970s in which region of India to prevent forest destruction?',
    options: ['Garhwal Himalayas (Uttarakhand)', 'Thar Desert (Rajasthan)', 'Western Ghats (Kerala)', 'Sundarbans (West Bengal)'],
    correctAnswer: 0,
    explanation: 'Chipko movement started in Reni village in Chamoli district of Garhwal Himalayas led by local villagers and Sunderlal Bahuguna.',
    marks: 1
  },
  {
    id: 'b_72',
    questionNumber: 72,
    subject: 'Biological Science',
    chapter: 'Natural Resources',
    question: 'Which of the following represents the 3 R\'s for conservation of the environment?',
    options: [
      'Reduce, Reuse, Recycle',
      'Recover, Rebuild, Restore',
      'Read, React, Remember',
      'Replace, Remove, Revive'
    ],
    correctAnswer: 0,
    explanation: 'Reduce resource consumption, Reuse items instead of discarding, and Recycle processed materials.',
    marks: 1
  },
  {
    id: 'b_73',
    questionNumber: 73,
    subject: 'Biological Science',
    chapter: 'Nutrition',
    question: 'Vitamin D deficiency in growing children causes which bone-softening condition?',
    options: ['Scurvy', 'Beri-beri', 'Rickets', 'Pellagra'],
    correctAnswer: 2,
    explanation: 'Rickets causes soft and weak bones, bow legs, and knock knees due to lack of Vitamin D and calcium absorption.',
    marks: 1
  },
  {
    id: 'b_74',
    questionNumber: 74,
    subject: 'Biological Science',
    chapter: 'Transportation',
    question: 'Which cellular component of human blood plays an essential role in blood clotting at injury sites?',
    options: ['Erythrocytes (RBC)', 'Leukocytes (WBC)', 'Blood Platelets (Thrombocytes)', 'Plasma proteins'],
    correctAnswer: 2,
    explanation: 'Blood platelets (thrombocytes) release thromboplastin, initiating the cascade of prothrombin to thrombin to fibrin clots.',
    marks: 1
  },
  {
    id: 'b_75',
    questionNumber: 75,
    subject: 'Biological Science',
    chapter: 'Reproduction',
    question: 'In human females, where does fertilization of the ovum by the sperm normally take place?',
    options: ['Uterus', 'Ovary', 'Fallopian tube (Ampulla)', 'Cervix'],
    correctAnswer: 2,
    explanation: 'Fertilization occurs in the ampullary-isthmic junction of the Fallopian tube (oviduct).',
    marks: 1
  },

  // =========================================================================
  // SECTION 4: SOCIAL STUDIES (Questions 76 to 100)
  // =========================================================================
  {
    id: 's_76',
    questionNumber: 76,
    subject: 'Social Studies',
    chapter: 'India: Relief Features',
    question: 'The southernmost point of the Indian Union territory is Indira Point, situated in which island group?',
    options: ['Lakshadweep Islands', 'Great Nicobar Island', 'Andaman Island', 'Daman and Diu'],
    correctAnswer: 1,
    explanation: 'Indira Point (6°45\' N latitude) is situated at the southern tip of Great Nicobar Island.',
    marks: 1
  },
  {
    id: 's_77',
    questionNumber: 77,
    subject: 'Social Studies',
    chapter: 'India: Relief Features',
    question: 'What is the standard meridian of India chosen to calculate the Indian Standard Time (IST)?',
    options: ['82° 30\' E longitude', '80° 30\' E longitude', '88° 30\' E longitude', '75° 00\' E longitude'],
    correctAnswer: 0,
    explanation: '82° 30\' E passing near Mirzapur (Uttar Pradesh) is the standard meridian, ahead of GMT by 5 hours 30 minutes.',
    marks: 1
  },
  {
    id: 's_78',
    questionNumber: 78,
    subject: 'Social Studies',
    chapter: 'Ideas of Development',
    question: 'Which index published annually by UNDP uses life expectancy, education level, and per capita gross national income to measure development?',
    options: ['Gross Domestic Product (GDP)', 'Human Development Index (HDI)', 'National Income Index', 'Poverty Line Ratio'],
    correctAnswer: 1,
    explanation: 'HDI assesses development through educational attainment, health longevity (life expectancy), and per capita income.',
    marks: 1
  },
  {
    id: 's_79',
    questionNumber: 79,
    subject: 'Social Studies',
    chapter: 'Production and Employment',
    question: 'Which economic sector employs the highest percentage of the working population in India?',
    options: ['Primary sector (Agriculture & allied)', 'Secondary sector (Manufacturing)', 'Tertiary sector (Services)', 'Quaternary sector'],
    correctAnswer: 0,
    explanation: 'Although the service sector contributes the highest share of GDP, the primary sector still employs over 44% of Indian workforce.',
    marks: 1
  },
  {
    id: 's_80',
    questionNumber: 80,
    subject: 'Social Studies',
    chapter: 'Production and Employment',
    question: 'Disguised unemployment is predominantly observed in which Indian sector?',
    options: ['Information Technology', 'Agriculture', 'Banking', 'Automobile manufacturing'],
    correctAnswer: 1,
    explanation: 'In agriculture, more people work on land than necessary; even if some workers leave, production does not fall.',
    marks: 1
  },
  {
    id: 's_81',
    questionNumber: 81,
    subject: 'Social Studies',
    chapter: 'Climate of India',
    question: 'The burst of the Southwest Monsoon on the Indian mainland first hits the coast of which state around June 1st?',
    options: ['Tamil Nadu', 'Kerala', 'Goa', 'Andhra Pradesh'],
    correctAnswer: 1,
    explanation: 'The Arabian Sea branch of southwest monsoon arrives first on the Malabar coast of Kerala around June 1.',
    marks: 1
  },
  {
    id: 's_82',
    questionNumber: 82,
    subject: 'Social Studies',
    chapter: 'Rivers and Water Resources',
    question: 'The Tungabhadra river is a major tributary of which prominent peninsular river?',
    options: ['Godavari', 'Krishna', 'Cauvery', 'Mahanadi'],
    correctAnswer: 1,
    explanation: 'Tungabhadra originates in Karnataka and joins River Krishna in Andhra Pradesh.',
    marks: 1
  },
  {
    id: 's_83',
    questionNumber: 83,
    subject: 'Social Studies',
    chapter: 'The People - Population',
    question: 'Sex ratio is defined in the Census of India as:',
    options: [
      'Number of females per 1,000 males in the population',
      'Number of males per 1,000 females',
      'Percentage of literate women',
      'Ratio of working women to men'
    ],
    correctAnswer: 0,
    explanation: 'Sex ratio represents the number of females per 1,000 males in a given population.',
    marks: 1
  },
  {
    id: 's_84',
    questionNumber: 84,
    subject: 'Social Studies',
    chapter: 'Settlements - People and Places',
    question: 'What is an urban agglomeration characterised by a continuous urban spread of multiple metropolitan cities called?',
    options: ['Hamlet', 'Conurbation / Megalopolis', 'Gram Panchayat', 'Rural settlement'],
    correctAnswer: 1,
    explanation: 'A conurbation or megalopolis forms when large urban settlements merge into a continuous developed zone.',
    marks: 1
  },
  {
    id: 's_85',
    questionNumber: 85,
    subject: 'Social Studies',
    chapter: 'Rampur: A Village Economy',
    question: 'In the study of rural village economies, which factor of production is considered fixed in supply?',
    options: ['Labor', 'Land', 'Working capital', 'Human entrepreneurship'],
    correctAnswer: 1,
    explanation: 'Land area under cultivation is practically fixed; agricultural growth requires increasing yield from the same land.',
    marks: 1
  },
  {
    id: 's_86',
    questionNumber: 86,
    subject: 'Social Studies',
    chapter: 'Globalisation',
    question: 'Which international organization establishes binding rules for international trade among nations?',
    options: ['World Trade Organization (WTO)', 'UNESCO', 'International Labour Organization (ILO)', 'World Bank'],
    correctAnswer: 0,
    explanation: 'WTO (headquartered in Geneva, Switzerland) oversees global trade agreements and rules.',
    marks: 1
  },
  {
    id: 's_87',
    questionNumber: 87,
    subject: 'Social Studies',
    chapter: 'Food Security',
    question: 'The minimum price announced by the Government of India before the sowing season to protect farmers from price drops is called:',
    options: ['Issue Price', 'Minimum Support Price (MSP)', 'Fair Market Price', 'Ceiling Price'],
    correctAnswer: 1,
    explanation: 'MSP is declared by the Commission for Agricultural Costs and Prices (CACP) to ensure fair income for crop producers.',
    marks: 1
  },
  {
    id: 's_88',
    questionNumber: 88,
    subject: 'Social Studies',
    chapter: 'Sustainable Development with Equity',
    question: 'The Silent Valley movement in Kerala was organised to save evergreen tropical forests from a proposed:',
    options: ['Thermal coal plant', 'Hydroelectric dam project', 'National highway corridor', 'Open-cast mining site'],
    correctAnswer: 1,
    explanation: 'Silent Valley movement in Palakkad, Kerala (1970s) successfully halted a hydroelectric project across Kunthipuzha river.',
    marks: 1
  },
  {
    id: 's_89',
    questionNumber: 89,
    subject: 'Social Studies',
    chapter: 'The World Between Wars',
    question: 'The League of Nations was founded in 1920 following which treaty that concluded World War I?',
    options: ['Treaty of Versailles', 'Treaty of Paris', 'Treaty of Vienna', 'Treaty of Rome'],
    correctAnswer: 0,
    explanation: 'The Treaty of Versailles (1919) mandated the creation of the League of Nations to promote international peace.',
    marks: 1
  },
  {
    id: 's_90',
    questionNumber: 90,
    subject: 'Social Studies',
    chapter: 'The World Between Wars',
    question: 'Which year marked the Black Tuesday Wall Street stock market crash that triggered the Great Economic Depression?',
    options: ['1914', '1929', '1939', '1945'],
    correctAnswer: 1,
    explanation: 'October 1929 marked the Wall Street crash in New York, plunging the capitalist world into deep economic collapse.',
    marks: 1
  },
  {
    id: 's_91',
    questionNumber: 91,
    subject: 'Social Studies',
    chapter: 'National Liberation Movements in the Colonies',
    question: 'Under the leadership of Ho Chi Minh, Vietnam fought for independence against which European colonial power?',
    options: ['British Empire', 'French Colonial Rule', 'Dutch East Indies', 'Portuguese Empire'],
    correctAnswer: 1,
    explanation: 'Ho Chi Minh led the Viet Minh in the First Indochina War against French colonial forces, culminating at Dien Bien Phu (1954).',
    marks: 1
  },
  {
    id: 's_92',
    questionNumber: 92,
    subject: 'Social Studies',
    chapter: 'National Movement in India - Partition & Independence',
    question: 'In which year did Mahatma Gandhi launch the historic "Quit India Movement" with the clarion call "Do or Die"?',
    options: ['1920', '1930', '1942', '1947'],
    correctAnswer: 2,
    explanation: 'The All India Congress Committee passed the Quit India Resolution on 8 August 1942 at Gowalia Tank Maidan, Mumbai.',
    marks: 1
  },
  {
    id: 's_93',
    questionNumber: 93,
    subject: 'Social Studies',
    chapter: 'The Making of Independent India\'s Constitution',
    question: 'Who served as the Chairman of the Drafting Committee of the Indian Constituent Assembly?',
    options: ['Dr. Rajendra Prasad', 'Dr. B. R. Ambedkar', 'Jawaharlal Nehru', 'Sardar Vallabhbhai Patel'],
    correctAnswer: 1,
    explanation: 'Dr. Bhimrao Ramji Ambedkar chaired the Drafting Committee and is known as the Chief Architect of the Indian Constitution.',
    marks: 1
  },
  {
    id: 's_94',
    questionNumber: 94,
    subject: 'Social Studies',
    chapter: 'The Making of Independent India\'s Constitution',
    question: 'The Constitution of India was officially adopted by the Constituent Assembly on:',
    options: ['15 August 1947', '26 November 1949', '26 January 1950', '2 October 1948'],
    correctAnswer: 1,
    explanation: 'Adopted on 26 November 1949 (celebrated as Constitution Day) and came into full legal effect on 26 January 1950 (Republic Day).',
    marks: 1
  },
  {
    id: 's_95',
    questionNumber: 95,
    subject: 'Social Studies',
    chapter: 'The Election Process in India',
    question: 'Which constitutional body is entrusted with conducting free and fair elections to the Parliament and State Legislatures in India?',
    options: ['Supreme Court of India', 'Election Commission of India (ECI)', 'Union Public Service Commission', 'NITI Aayog'],
    correctAnswer: 1,
    explanation: 'Article 324 of the Constitution vests superintendence, direction, and control of elections in the Election Commission of India.',
    marks: 1
  },
  {
    id: 's_96',
    questionNumber: 96,
    subject: 'Social Studies',
    chapter: 'Post-War World and India',
    question: 'The Non-Aligned Movement (NAM) was co-founded by Jawaharlal Nehru along with which prominent world leaders in 1961?',
    options: [
      'Tito (Yugoslavia), Nasser (Egypt), Sukarno (Indonesia), Nkrumah (Ghana)',
      'Churchill, Roosevelt, and Stalin',
      'Mao Zedong, Ho Chi Minh, and Fidel Castro',
      'De Gaulle, Adenauer, and Macmillan'
    ],
    correctAnswer: 0,
    explanation: 'NAM was established in Belgrade (1961) by Nehru, Josip Broz Tito, Gamal Abdel Nasser, Sukarno, and Kwame Nkrumah.',
    marks: 1
  },
  {
    id: 's_97',
    questionNumber: 97,
    subject: 'Social Studies',
    chapter: 'Social Movements in Our Times',
    question: 'The Right to Information (RTI) Act was enacted by the Indian Parliament in which year to ensure transparency in governance?',
    options: ['2000', '2005', '2010', '2014'],
    correctAnswer: 1,
    explanation: 'The RTI Act 2005 was passed on 15 June 2005 and came into effect on 12 October 2005 following grassroots movements led by MKSS.',
    marks: 1
  },
  {
    id: 's_98',
    questionNumber: 98,
    subject: 'Social Studies',
    chapter: 'The Movement for the Formation of Telangana State',
    question: 'In which year was the state of Telangana carved out of Andhra Pradesh as the 29th state of India?',
    options: ['2012', '2014', '2016', '2010'],
    correctAnswer: 1,
    explanation: 'Telangana was officially bifurcated and formed on 2 June 2014 under the Andhra Pradesh Reorganisation Act, 2014.',
    marks: 1
  },
  {
    id: 's_99',
    questionNumber: 99,
    subject: 'Social Studies',
    chapter: 'Consumer Rights',
    question: 'The Consumer Protection Act (COPRA) in India was enacted in which year?',
    options: ['1975', '1986', '1995', '2002'],
    correctAnswer: 1,
    explanation: 'COPRA was enacted in 1986 to establish a three-tier quasi-judicial mechanism (District, State, National forums) for consumer dispute resolution.',
    marks: 1
  },
  {
    id: 's_100',
    questionNumber: 100,
    subject: 'Social Studies',
    chapter: 'National Movement in India',
    question: 'The Dandi Salt March was undertaken by Mahatma Gandhi in 1930 to inaugurate which nationwide movement?',
    options: [
      'Non-Cooperation Movement',
      'Civil Disobedience Movement',
      'Quit India Movement',
      'Swadeshi and Boycott Movement'
    ],
    correctAnswer: 1,
    explanation: 'Gandhi walked 240 miles from Sabarmati Ashram to Dandi coast to break the salt law, launching the Civil Disobedience Movement.',
    marks: 1
  }
];
