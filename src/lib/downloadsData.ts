import { createPublicClient } from '@/lib/supabase/public';
import {
  DOWNLOAD_COLUMNS,
  DOWNLOAD_COLUMNS_V1,
  FALLBACK_DOWNLOADS,
  isDownloadLive,
  toDownload,
  type DownloadRow,
} from '@/lib/downloads';
import { todayIST } from '@/lib/dates';
import type { DownloadItem } from '@/types';

/**
 * Published downloads that haven't passed their remove date, newest first. Falls back to the
 * seed entry when the table can't be read. Call only in request-time code (after connection()).
 */
export async function listDownloads(limit = 200): Promise<DownloadItem[]> {
  const supabase = createPublicClient();
  if (!supabase) return FALLBACK_DOWNLOADS;
  const today = todayIST();
  try {
    const query = (columns: string) =>
      supabase
        .from('downloads')
        .select(columns)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(limit + 30);
    let { data, error } = await query(DOWNLOAD_COLUMNS);
    if (error) ({ data, error } = await query(DOWNLOAD_COLUMNS_V1)); // migration 007 not run yet
    if (error) {
      console.error('Public downloads error:', error);
      return FALLBACK_DOWNLOADS;
    }
    return (data as unknown as DownloadRow[])
      .map(toDownload)
      .filter((d) => isDownloadLive(d, today))
      .slice(0, limit);
  } catch (err) {
    console.error('Public downloads error:', err);
    return FALLBACK_DOWNLOADS;
  }
}
