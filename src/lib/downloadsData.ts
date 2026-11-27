import { createPublicClient } from '@/lib/supabase/public';
import { DOWNLOAD_COLUMNS, FALLBACK_DOWNLOADS, toDownload, type DownloadRow } from '@/lib/downloads';
import type { DownloadItem } from '@/types';

/** Published downloads, newest first. Falls back to the seed entry when the table can't be read. */
export async function listDownloads(limit = 200): Promise<DownloadItem[]> {
  const supabase = createPublicClient();
  if (!supabase) return FALLBACK_DOWNLOADS;
  try {
    const { data, error } = await supabase
      .from('downloads')
      .select(DOWNLOAD_COLUMNS)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.error('Public downloads error:', error);
      return FALLBACK_DOWNLOADS;
    }
    return (data as DownloadRow[]).map(toDownload);
  } catch (err) {
    console.error('Public downloads error:', err);
    return FALLBACK_DOWNLOADS;
  }
}
