import type { Notice } from '@/types';

export const NOTICE_BUCKET = 'notices';
export const NOTICE_MAX_BYTES = 4 * 1024 * 1024;
export const NOTICE_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] as const;
export const NOTICE_TITLE_MAX = 150;
export const NOTICE_BODY_MAX = 3000;

export const NOTICE_COLUMNS =
  'id, title, body, link_url, attachment_path, attachment_name, attachment_type, pinned, published, created_at';

export interface NoticeRow {
  id: string;
  title: string;
  body: string | null;
  link_url: string | null;
  attachment_path: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  pinned: boolean;
  published: boolean;
  created_at: string;
}

export function noticeFileUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
  const encoded = path.split('/').map(encodeURIComponent).join('/');
  return `${base}/storage/v1/object/public/${NOTICE_BUCKET}/${encoded}`;
}

export function toNotice(row: NoticeRow): Notice {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    linkUrl: row.link_url,
    attachmentUrl: row.attachment_path ? noticeFileUrl(row.attachment_path) : null,
    attachmentName: row.attachment_name,
    attachmentType: row.attachment_type,
    pinned: row.pinned,
    published: row.published,
    createdAt: row.created_at,
  };
}

/** Accepts only http(s) links; returns null for anything else or blank. */
export function cleanLink(value: unknown): string | null | 'invalid' {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : 'invalid';
  } catch {
    return 'invalid';
  }
}

export function formatNoticeDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

/** Shown only when the notices table can't be read (e.g. migration 004 not run yet). Migration 004 seeds the same notice. */
export const FALLBACK_NOTICES: Notice[] = [
  {
    id: 'fallback-wbpsc-clerkship-2026',
    title: 'WBPSC Clerkship Part-I exam: 26 and 27 December 2026',
    body: 'Admit cards will be available from 14 December 2026 at psc.wb.gov.in.',
    linkUrl: 'https://psc.wb.gov.in/Download?param1=25112026104610_AnnouncementClerk.pdf&param2=advertisement',
    attachmentUrl: null,
    attachmentName: null,
    attachmentType: null,
    pinned: true,
    published: true,
    createdAt: '2026-11-25T10:46:00+05:30',
  },
];
