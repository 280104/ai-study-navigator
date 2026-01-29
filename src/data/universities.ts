export interface University {
  id: string;
  name: string;
  country: string;
  tier: 'dream' | 'target' | 'safe';
  ranking: number;
  tuition: string;
  acceptanceRate: string;
  programs: string[];
}

export const universities: University[] = [
  // Dream Universities
  {
    id: 'mit',
    name: 'Massachusetts Institute of Technology',
    country: 'USA',
    tier: 'dream',
    ranking: 1,
    tuition: '$58,240/year',
    acceptanceRate: '4%',
    programs: ['Computer Science', 'Engineering', 'Physics', 'Mathematics', 'Business'],
  },
  {
    id: 'stanford',
    name: 'Stanford University',
    country: 'USA',
    tier: 'dream',
    ranking: 3,
    tuition: '$56,169/year',
    acceptanceRate: '4%',
    programs: ['Computer Science', 'Engineering', 'Business', 'Law', 'Medicine'],
  },
  {
    id: 'harvard',
    name: 'Harvard University',
    country: 'USA',
    tier: 'dream',
    ranking: 4,
    tuition: '$54,768/year',
    acceptanceRate: '3%',
    programs: ['Law', 'Business', 'Medicine', 'Economics', 'Political Science'],
  },
  {
    id: 'oxford',
    name: 'University of Oxford',
    country: 'UK',
    tier: 'dream',
    ranking: 5,
    tuition: '£33,050/year',
    acceptanceRate: '17%',
    programs: ['Philosophy', 'Law', 'Medicine', 'Computer Science', 'Economics'],
  },
  {
    id: 'cambridge',
    name: 'University of Cambridge',
    country: 'UK',
    tier: 'dream',
    ranking: 6,
    tuition: '£31,200/year',
    acceptanceRate: '18%',
    programs: ['Natural Sciences', 'Engineering', 'Mathematics', 'Economics', 'Medicine'],
  },
  {
    id: 'eth',
    name: 'ETH Zurich',
    country: 'Switzerland',
    tier: 'dream',
    ranking: 7,
    tuition: 'CHF 1,460/year',
    acceptanceRate: '27%',
    programs: ['Engineering', 'Computer Science', 'Architecture', 'Physics', 'Mathematics'],
  },

  // Dream Universities (additional)
  {
    id: 'caltech',
    name: 'California Institute of Technology',
    country: 'USA',
    tier: 'dream',
    ranking: 2,
    tuition: '$60,816/year',
    acceptanceRate: '3%',
    programs: ['Physics', 'Engineering', 'Computer Science', 'Chemistry', 'Biology'],
  },
  {
    id: 'princeton',
    name: 'Princeton University',
    country: 'USA',
    tier: 'dream',
    ranking: 8,
    tuition: '$57,410/year',
    acceptanceRate: '4%',
    programs: ['Mathematics', 'Physics', 'Economics', 'Computer Science', 'Engineering'],
  },
  {
    id: 'imperial',
    name: 'Imperial College London',
    country: 'UK',
    tier: 'dream',
    ranking: 10,
    tuition: '£38,000/year',
    acceptanceRate: '14%',
    programs: ['Engineering', 'Medicine', 'Computer Science', 'Business', 'Physics'],
  },
  {
    id: 'berkeley',
    name: 'UC Berkeley',
    country: 'USA',
    tier: 'dream',
    ranking: 12,
    tuition: '$44,467/year',
    acceptanceRate: '12%',
    programs: ['Computer Science', 'Engineering', 'Business', 'Law', 'Data Science'],
  },

  // Target Universities
  {
    id: 'ucl',
    name: 'University College London',
    country: 'UK',
    tier: 'target',
    ranking: 9,
    tuition: '£26,200/year',
    acceptanceRate: '35%',
    programs: ['Architecture', 'Medicine', 'Law', 'Computer Science', 'Economics'],
  },
  {
    id: 'nyu',
    name: 'New York University',
    country: 'USA',
    tier: 'target',
    ranking: 25,
    tuition: '$56,500/year',
    acceptanceRate: '13%',
    programs: ['Business', 'Arts', 'Film', 'Law', 'Data Science'],
  },
  {
    id: 'toronto',
    name: 'University of Toronto',
    country: 'Canada',
    tier: 'target',
    ranking: 21,
    tuition: 'CAD 58,680/year',
    acceptanceRate: '43%',
    programs: ['Engineering', 'Business', 'Computer Science', 'Medicine', 'Arts'],
  },
  {
    id: 'melbourne',
    name: 'University of Melbourne',
    country: 'Australia',
    tier: 'target',
    ranking: 33,
    tuition: 'AUD 46,000/year',
    acceptanceRate: '50%',
    programs: ['Engineering', 'Business', 'Arts', 'Law', 'Medicine'],
  },
  {
    id: 'tum',
    name: 'Technical University of Munich',
    country: 'Germany',
    tier: 'target',
    ranking: 37,
    tuition: '€3,000/year',
    acceptanceRate: '35%',
    programs: ['Engineering', 'Computer Science', 'Physics', 'Architecture', 'Management'],
  },
  {
    id: 'nus',
    name: 'National University of Singapore',
    country: 'Singapore',
    tier: 'target',
    ranking: 11,
    tuition: 'SGD 38,850/year',
    acceptanceRate: '25%',
    programs: ['Engineering', 'Business', 'Computing', 'Law', 'Medicine'],
  },
  {
    id: 'michigan',
    name: 'University of Michigan',
    country: 'USA',
    tier: 'target',
    ranking: 23,
    tuition: '$52,266/year',
    acceptanceRate: '18%',
    programs: ['Engineering', 'Business', 'Computer Science', 'Medicine', 'Law'],
  },
  {
    id: 'gatech',
    name: 'Georgia Institute of Technology',
    country: 'USA',
    tier: 'target',
    ranking: 29,
    tuition: '$33,794/year',
    acceptanceRate: '17%',
    programs: ['Computer Science', 'Engineering', 'Business', 'Design', 'Data Science'],
  },
  {
    id: 'edinburgh',
    name: 'University of Edinburgh',
    country: 'UK',
    tier: 'target',
    ranking: 22,
    tuition: '£28,950/year',
    acceptanceRate: '40%',
    programs: ['Medicine', 'Law', 'Computer Science', 'Engineering', 'Arts'],
  },
  {
    id: 'mcgill',
    name: 'McGill University',
    country: 'Canada',
    tier: 'target',
    ranking: 30,
    tuition: 'CAD 48,000/year',
    acceptanceRate: '42%',
    programs: ['Medicine', 'Engineering', 'Business', 'Law', 'Arts'],
  },
  {
    id: 'sydney',
    name: 'University of Sydney',
    country: 'Australia',
    tier: 'target',
    ranking: 41,
    tuition: 'AUD 50,000/year',
    acceptanceRate: '48%',
    programs: ['Business', 'Engineering', 'Medicine', 'Law', 'Arts'],
  },
  {
    id: 'kth',
    name: 'KTH Royal Institute of Technology',
    country: 'Sweden',
    tier: 'target',
    ranking: 55,
    tuition: 'SEK 155,000/year',
    acceptanceRate: '35%',
    programs: ['Engineering', 'Computer Science', 'Architecture', 'Physics', 'Mathematics'],
  },

  // Safe Universities
  {
    id: 'asu',
    name: 'Arizona State University',
    country: 'USA',
    tier: 'safe',
    ranking: 105,
    tuition: '$32,760/year',
    acceptanceRate: '88%',
    programs: ['Engineering', 'Business', 'Journalism', 'Computer Science', 'Design'],
  },
  {
    id: 'unsw',
    name: 'University of New South Wales',
    country: 'Australia',
    tier: 'safe',
    ranking: 45,
    tuition: 'AUD 42,000/year',
    acceptanceRate: '65%',
    programs: ['Engineering', 'Business', 'Computer Science', 'Architecture', 'Law'],
  },
  {
    id: 'ubc',
    name: 'University of British Columbia',
    country: 'Canada',
    tier: 'safe',
    ranking: 38,
    tuition: 'CAD 43,000/year',
    acceptanceRate: '52%',
    programs: ['Engineering', 'Business', 'Computer Science', 'Forestry', 'Arts'],
  },
  {
    id: 'warwick',
    name: 'University of Warwick',
    country: 'UK',
    tier: 'safe',
    ranking: 64,
    tuition: '£23,000/year',
    acceptanceRate: '78%',
    programs: ['Business', 'Economics', 'Engineering', 'Mathematics', 'Film'],
  },
  {
    id: 'delft',
    name: 'Delft University of Technology',
    country: 'Netherlands',
    tier: 'safe',
    ranking: 47,
    tuition: '€2,314/year',
    acceptanceRate: '55%',
    programs: ['Engineering', 'Architecture', 'Computer Science', 'Aerospace', 'Design'],
  },
  {
    id: 'trinity',
    name: 'Trinity College Dublin',
    country: 'Ireland',
    tier: 'safe',
    ranking: 81,
    tuition: '€22,000/year',
    acceptanceRate: '60%',
    programs: ['Computer Science', 'Business', 'Law', 'Medicine', 'Arts'],
  },
  {
    id: 'purdue',
    name: 'Purdue University',
    country: 'USA',
    tier: 'safe',
    ranking: 62,
    tuition: '$31,104/year',
    acceptanceRate: '53%',
    programs: ['Engineering', 'Computer Science', 'Agriculture', 'Business', 'Pharmacy'],
  },
  {
    id: 'umn',
    name: 'University of Minnesota',
    country: 'USA',
    tier: 'safe',
    ranking: 78,
    tuition: '$34,000/year',
    acceptanceRate: '70%',
    programs: ['Engineering', 'Business', 'Medicine', 'Law', 'Computer Science'],
  },
  {
    id: 'queensland',
    name: 'University of Queensland',
    country: 'Australia',
    tier: 'safe',
    ranking: 53,
    tuition: 'AUD 40,000/year',
    acceptanceRate: '62%',
    programs: ['Engineering', 'Business', 'Medicine', 'Science', 'Arts'],
  },
  {
    id: 'auckland',
    name: 'University of Auckland',
    country: 'New Zealand',
    tier: 'safe',
    ranking: 68,
    tuition: 'NZD 38,000/year',
    acceptanceRate: '65%',
    programs: ['Engineering', 'Business', 'Law', 'Medicine', 'Arts'],
  },
  {
    id: 'manchester',
    name: 'University of Manchester',
    country: 'UK',
    tier: 'safe',
    ranking: 51,
    tuition: '£25,000/year',
    acceptanceRate: '58%',
    programs: ['Engineering', 'Business', 'Computer Science', 'Medicine', 'Arts'],
  },
  {
    id: 'rwth',
    name: 'RWTH Aachen University',
    country: 'Germany',
    tier: 'safe',
    ranking: 90,
    tuition: '€1,500/year',
    acceptanceRate: '45%',
    programs: ['Engineering', 'Computer Science', 'Physics', 'Architecture', 'Chemistry'],
  },
];

export const getUniversityById = (id: string): University | undefined => {
  return universities.find(u => u.id === id);
};

export const getUniversitiesByTier = (tier: University['tier']): University[] => {
  return universities.filter(u => u.tier === tier);
};

export const getUniversitiesByCountry = (country: string): University[] => {
  return universities.filter(u => u.country === country);
};

export const getAllCountries = (): string[] => {
  return [...new Set(universities.map(u => u.country))];
};

export const getAllPrograms = (): string[] => {
  const programs = new Set<string>();
  universities.forEach(u => u.programs.forEach(p => programs.add(p)));
  return [...programs].sort();
};
