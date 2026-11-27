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
  whatsappUrl:
    'https://wa.me/919732424300?text=Hi%20Mirror%20Academy%2C%20I%20want%20admission%20details.',
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
  /** One plain line on what the exam is, from the public notice of the body that runs it. */
  about?: string;
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
      { name: 'WBCS', slug: 'wbcs', sortOrder: 1, about: 'West Bengal Civil Service (Exe.) exam, WBPSC' },
      { name: 'MVI', slug: 'mvi', sortOrder: 2, about: 'Motor Vehicle Inspector (Technical), WBPSC' },
      { name: 'IDO', slug: 'ido', sortOrder: 3, about: 'Industrial Development Officer, WBPSC' },
      { name: 'FOOD', slug: 'food', sortOrder: 4 },
      { name: 'FOOD SI', slug: 'food-si', sortOrder: 5, about: 'Sub-Inspector, Food & Supplies, WBPSC' },
      { name: 'SCHOOL SI', slug: 'school-si', sortOrder: 6, about: 'Sub-Inspector of Schools, WBPSC' },
      { name: 'Miscellaneous', slug: 'miscellaneous', sortOrder: 7, about: 'Miscellaneous Services Recruitment, WBPSC' },
      { name: 'Clerkship', slug: 'clerkship', sortOrder: 8, about: 'Clerkship exam, WBPSC' },
    ],
  },
  {
    stream: 'Medical & Engg.',
    slug: 'medical-engg',
    courses: [
      { name: 'NEET', slug: 'neet', sortOrder: 9, about: 'National entrance for MBBS, BDS and allied courses, NTA' },
      { name: 'JENPAS UG', slug: 'jenpas-ug', sortOrder: 10, about: 'Nursing, paramedical and allied health entrance, WBJEEB' },
      { name: 'ANM-GNM', slug: 'anm-gnm', sortOrder: 11, about: 'ANM and GNM nursing diploma entrance, WBJEEB' },
      { name: 'JEXPO', slug: 'jexpo', sortOrder: 12, about: 'Polytechnic diploma entrance, WBSCT&VE&SD' },
    ],
  },
  {
    stream: 'Force',
    slug: 'force',
    courses: [
      { name: 'WB Police', slug: 'wb-police', sortOrder: 13, about: 'West Bengal Police recruitment, WBPRB' },
      { name: 'KP', slug: 'kp', sortOrder: 14, about: 'Kolkata Police recruitment, WBPRB' },
      { name: 'Agniveer', slug: 'agniveer', sortOrder: 15, about: 'Army, Navy and Air Force entry under the Agnipath scheme' },
    ],
  },
  {
    stream: 'Teaching',
    slug: 'teaching',
    courses: [
      { name: 'NET', slug: 'net', sortOrder: 16, about: 'UGC NET for Assistant Professor and JRF, NTA' },
      { name: 'SET', slug: 'set', sortOrder: 17, about: 'West Bengal SET for Assistant Professor' },
      { name: 'TET', slug: 'tet', sortOrder: 18, about: 'Teacher Eligibility Test for school teaching' },
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
  { label: 'Notices', href: '#notices' },
  { label: 'Courses', href: '#courses' },
  { label: 'Why us', href: '#why-mirror' },
  { label: 'Admission', href: '#admission' },
  { label: 'Register', href: '#registration' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
] as const;
