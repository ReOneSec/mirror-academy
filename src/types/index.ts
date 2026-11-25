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
}

export interface LookupResponse {
  success: boolean;
  message?: string;
  registrations?: RegistrationRecord[];
}
