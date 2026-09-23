import { Scholarship } from '../types';

export const OFFICIAL_SCHOLARSHIPS: Scholarship[] = [
  {
    id: 'gov_sch_nmms',
    title: 'National Means-cum-Merit Scholarship Scheme (NMMSS)',
    amount: '₹12,000 / year (Class 9 to 12)',
    eligibility: 'Class 8 passed in Government / Local Body schools with min 55% marks; annual parental income up to ₹3,50,000.',
    deadline: 'As per National Scholarship Portal calendar',
    category: 'Government',
    applyUrl: 'https://scholarships.gov.in',
    matchPercentage: 100
  },
  {
    id: 'gov_sch_yasasvi',
    title: 'PM Young Achievers Scholarship Award Scheme (PM-YASASVI)',
    amount: '₹75,000 / year (Class 9 & 10)',
    eligibility: 'OBC / EBC / DNT students studying in Class 9 or 10 in identified Government schools with parental income <= ₹2,50,000.',
    deadline: 'As per NTA / Ministry official schedule',
    category: 'Need-Based',
    applyUrl: 'https://yet.nta.ac.in',
    matchPercentage: 95
  },
  {
    id: 'gov_sch_prematric',
    title: 'Telangana State ePASS Pre-Matric Scholarship',
    amount: 'Government prescribed allowance & fee concessions',
    eligibility: 'Class 5 to 10 students from SC/ST/BC categories enrolled in recognized Government / Zilla Parishad schools.',
    deadline: 'As per State Welfare Department schedule',
    category: 'Government',
    applyUrl: 'https://telanganaepass.cgg.gov.in',
    matchPercentage: 90
  },
  {
    id: 'gov_sch_jnanabhumi',
    title: 'Andhra Pradesh JnanaBhumi Pre-Matric Welfare Scheme',
    amount: 'Government institutional and student maintenance grant',
    eligibility: 'Eligible SC/ST/BC students in Class 5 to 10 in State Board Government institutions.',
    deadline: 'As per State Board Portal notification',
    category: 'Government',
    applyUrl: 'https://jnanabhumi.ap.gov.in',
    matchPercentage: 90
  }
];
