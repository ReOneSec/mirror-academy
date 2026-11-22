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
