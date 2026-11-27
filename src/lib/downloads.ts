import type { DownloadCategory, DownloadItem } from '@/types';

export const DOWNLOAD_BUCKET = 'downloads';
export const DOWNLOAD_MAX_BYTES = 25 * 1024 * 1024;
export const DOWNLOAD_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
export const DOWNLOAD_CATEGORIES: DownloadCategory[] = ['syllabus', 'previous_papers', 'study_material', 'notification'];
export const DOWNLOAD_TITLE_MAX = 150;
export const DOWNLOAD_EXAM_MAX = 80;

export const DOWNLOAD_COLUMNS =
  'id, title, category, exam, file_path, file_name, file_type, file_size, link_url, published, created_at';

export interface DownloadRow {
  id: string;
  title: string;
  category: DownloadCategory;
  exam: string | null;
  file_path: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  link_url: string | null;
  published: boolean;
  created_at: string;
}

export function downloadFileUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
  const encoded = path.split('/').map(encodeURIComponent).join('/');
  return `${base}/storage/v1/object/public/${DOWNLOAD_BUCKET}/${encoded}`;
}

export function toDownload(row: DownloadRow): DownloadItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    exam: row.exam,
    fileUrl: row.file_path ? downloadFileUrl(row.file_path) : null,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSize: row.file_size,
    linkUrl: row.link_url,
    published: row.published,
    createdAt: row.created_at,
  };
}

export function formatSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Storage path for a new upload: year/uuid-safe-name. */
export function uploadPath(name: string): string {
  const safe =
    name
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(-80) || 'file';
  return `${new Date().getFullYear()}/${crypto.randomUUID()}-${safe}`;
}

/** Shown only when the downloads table can't be read (migration 006 not run yet). Migration 006 seeds the same. */
export const FALLBACK_DOWNLOADS: DownloadItem[] = [
  {
    id: 'fallback-wbpsc-clerk-announcement',
    title: 'WBPSC Clerkship exam announcement (official PDF)',
    category: 'notification',
    exam: 'Clerkship',
    fileUrl: null,
    fileName: null,
    fileType: null,
    fileSize: null,
    linkUrl: 'https://psc.wb.gov.in/Download?param1=25112026104610_AnnouncementClerk.pdf&param2=advertisement',
    published: true,
    createdAt: '2026-11-27T09:00:00+05:30',
  },
];
