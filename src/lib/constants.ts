// Mirror Academy — Source of truth constants
// Everything here comes from the brief. Nothing is invented.

export const SITE = {
  name: 'Mirror Academy',
  tagline: 'Reflect Your Strength!',
  since: 2018,
  focus: 'WBPSC, WBCS & Related Exams',
  phone: '9732424300',
  phoneTel: 'tel:9732424300',
  phoneDisplay: '973 242 4300',
  address:
    'Near Jamindari Koshaikhana more, Majdia West, Gorabazar, Berhampore.',
  mapsUrl:
    'https://www.google.com/maps/search/Near+Jamindari+Koshaikhana+more,+Majdia+West,+Gorabazar,+Berhampore',
} as const;

export interface Course {
  name: string;
  slug: string;
  sortOrder: number;
}

export interface CourseStream {
  stream: string;
  slug: string;
  courses: Course[];
}

export const COURSE_STREAMS: CourseStream[] = [
  {
    stream: 'Public Services',
    slug: 'public-services',
    courses: [
      { name: 'WBCS', slug: 'wbcs', sortOrder: 1 },
      { name: 'MVI', slug: 'mvi', sortOrder: 2 },
      { name: 'IDO', slug: 'ido', sortOrder: 3 },
      { name: 'FOOD', slug: 'food', sortOrder: 4 },
      { name: 'FOOD SI', slug: 'food-si', sortOrder: 5 },
      { name: 'SCHOOL SI', slug: 'school-si', sortOrder: 6 },
      { name: 'Miscellaneous', slug: 'miscellaneous', sortOrder: 7 },
      { name: 'Clerkship', slug: 'clerkship', sortOrder: 8 },
    ],
  },
  {
    stream: 'Medical & Engg.',
    slug: 'medical-engg',
    courses: [
      { name: 'NEET', slug: 'neet', sortOrder: 9 },
      { name: 'JENPAS UG', slug: 'jenpas-ug', sortOrder: 10 },
      { name: 'ANM-GNM', slug: 'anm-gnm', sortOrder: 11 },
      { name: 'JEXPO', slug: 'jexpo', sortOrder: 12 },
    ],
  },
  {
    stream: 'Force',
    slug: 'force',
    courses: [
      { name: 'WB Police', slug: 'wb-police', sortOrder: 13 },
      { name: 'KP', slug: 'kp', sortOrder: 14 },
      { name: 'Agniveer', slug: 'agniveer', sortOrder: 15 },
    ],
  },
  {
    stream: 'Teaching',
    slug: 'teaching',
    courses: [
      { name: 'NET', slug: 'net', sortOrder: 16 },
      { name: 'SET', slug: 'set', sortOrder: 17 },
      { name: 'TET', slug: 'tet', sortOrder: 18 },
    ],
  },
];

// Flat list for the enquiry form dropdown
export const ALL_COURSES = COURSE_STREAMS.flatMap((s) =>
  s.courses.map((c) => ({ ...c, stream: s.stream }))
);

export const NAV_LINKS = [
  { label: 'Courses', href: '#courses' },
  { label: 'Why Mirror', href: '#why-mirror' },
  { label: 'Contact', href: '#contact' },
] as const;
