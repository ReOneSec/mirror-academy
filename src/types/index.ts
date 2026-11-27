export type BatchType = 'Free batch' | 'Paid batch' | 'Interview batch';
export type GenderType = 'Male' | 'Female';

export interface StudentRegistrationData {
  name: string;
  phone: string;
  courseSlug: string;
  batchType: BatchType;
  gender: GenderType;
  address: string;
  message?: string;
  turnstileToken?: string;
}

export interface EnquiryFormData {
  name: string;
  phone: string;
  courseSlug: string;
  message: string;
}

export interface EnquiryResponse {
  success: boolean;
  message: string;
  id?: string;
  createdAt?: string;
  /** True when this phone already has a live registration for the same course. */
  duplicate?: boolean;
}

export interface RegistrationRecord {
  id: string;
  name: string;
  phone: string;
  courseSlug: string;
  courseName: string;
  stream: string;
  batchType: string;
  gender: string;
  address: string;
  message?: string | null;
  status: string;
  createdAt: string;
  /** Admin only: the team's own notes and the next follow-up date (YYYY-MM-DD). */
  adminNotes?: string | null;
  followUpDate?: string | null;
}

export interface LookupResponse {
  success: boolean;
  message?: string;
  registrations?: RegistrationRecord[];
}

export interface Notice {
  id: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentType: string | null;
  pinned: boolean;
  published: boolean;
  createdAt: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  summary: string | null;
  body: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
