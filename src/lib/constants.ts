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
  email: 'mirrorexams@gmail.com',
  emailMailto: 'mailto:mirrorexams@gmail.com',
  address:
    'Near Jamindari Koshaikhana more, Majdia West, Gorabazar, Berhampore.',
  mapsUrl:
    'https://www.google.com/maps/place/Rallis+Mess/@24.0821424,88.241972,17z/data=!3m1!4b1!4m6!3m5!1s0x39f97f00455d06a9:0x22db12fe9d1a79a5!8m2!3d24.0821424!4d88.241972!16s%2Fg%2F11t0vd_nsv',
  mapsEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3642.550115573609!2d88.24197197603003!3d24.08214237595819!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f97f00455d06a9%3A0x22db12fe9d1a79a5!2sRallis%20Mess!5e0!3m2!1sen!2sin!4v1795456645526!5m2!1sen!2sin',
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
  {
    stream: 'Interview',
    slug: 'interview',
    courses: [
      { name: 'Primary TET Mock Interview', slug: 'primary-tet-mock-interview', sortOrder: 19 },
      { name: 'SSC Group C Mock Interview', slug: 'ssc-group-c-mock-interview', sortOrder: 20 },
      { name: 'SSC Group D Mock Interview', slug: 'ssc-group-d-mock-interview', sortOrder: 21 },
      { name: 'WBP Constable Mock Interview', slug: 'wbp-constable-mock-interview', sortOrder: 22 },
      { name: 'Police SI Mock Interview', slug: 'police-si-mock-interview', sortOrder: 23 },
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
  { label: 'Admission', href: '#admission' },
  { label: 'Contact', href: '#contact' },
] as const;
