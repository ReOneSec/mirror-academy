'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { DownloadCategory, DownloadItem } from '@/types';
import { createClient } from '@/lib/supabase/client';
import {
  DOWNLOAD_BUCKET,
  DOWNLOAD_CATEGORIES,
  DOWNLOAD_EXAM_MAX,
  DOWNLOAD_FILE_TYPES,
  DOWNLOAD_MAX_BYTES,
  DOWNLOAD_TITLE_MAX,
  formatSize,
  isDownloadLive,
} from '@/lib/downloads';
import { todayIST } from '@/lib/dates';
import { formatDate, getDict } from '@/lib/i18n';

const CATEGORY_LABEL = getDict('en').downloads.categories;
const ACCEPT = DOWNLOAD_FILE_TYPES.join(',');

export default function AdminDownloads({ onToast }: { onToast: (msg: string) => void }) {
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DownloadCategory>('syllabus');
  const [exam, setExam] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [expiresOn, setExpiresOn] = useState('');
  const [saving, setSaving] = useState<'' | 'uploading' | 'saving'>('');
  const [formError, setFormError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetch('/api/admin/downloads');
      const data = await res.json();
      if (data.success) setItems(data.downloads ?? []);
      else setLoadError(data.message || 'Failed to load downloads.');
    } catch {
      setLoadError('Could not load downloads. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch('/api/admin/downloads')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.success) setItems(data.downloads ?? []);
        else setLoadError(data.message || 'Failed to load downloads.');
      })
      .catch(() => active && setLoadError('Could not load downloads. Check your connection.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    const file = fileRef.current?.files?.[0];
    if (!title.trim()) return setFormError('Add a title.');
    if (!file && !linkUrl.trim()) return setFormError('Choose a file or add a link.');
    if (file && !DOWNLOAD_FILE_TYPES.includes(file.type)) return setFormError('Upload a PDF, JPG, PNG or WebP file.');
    if (file && file.size > DOWNLOAD_MAX_BYTES) return setFormError('The file must be 25 MB or smaller.');

    try {
      let uploaded: { path: string; name: string; type: string; size: number } | null = null;
      if (file) {
        setSaving('uploading');
        const signRes = await fetch('/api/admin/downloads/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: file.name, type: file.type, size: file.size }),
        });
        const sign = await signRes.json().catch(() => ({}));
        if (!signRes.ok || !sign.success) return setFormError(sign.message || 'Could not start the upload.');
        const { error } = await createClient().storage
          .from(DOWNLOAD_BUCKET)
          .uploadToSignedUrl(sign.path, sign.token, file, { contentType: file.type });
        if (error) return setFormError(`Upload failed: ${error.message}`);
        uploaded = { path: sign.path, name: file.name, type: file.type, size: file.size };
      }

      setSaving('saving');
      const res = await fetch('/api/admin/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          exam,
          linkUrl: uploaded ? '' : linkUrl,
          file: uploaded,
          ...(expiresOn ? { expiresOn } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) return setFormError(data.message || 'Could not save.');

      setTitle('');
      setExam('');
      setLinkUrl('');
      setExpiresOn('');
      if (fileRef.current) fileRef.current.value = '';
      onToast('Added to downloads. It is live on the website.');
      load();
    } catch {
      setFormError('Network error while uploading.');
    } finally {
      setSaving('');
    }
  }

  async function setExpiry(d: DownloadItem, value: string) {
    try {
      const res = await fetch('/api/admin/downloads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: d.id, expiresOn: value || null }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) return onToast(data.message || 'Could not update.');
      onToast(value ? `Stays on the website until ${formatDate('en', value)}.` : 'Remove date cleared.');
      load();
    } catch {
      onToast('Network error while updating.');
    }
  }

  async function togglePublished(d: DownloadItem) {
    try {
      const res = await fetch('/api/admin/downloads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: d.id, published: !d.published }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) return onToast(data.message || 'Could not update.');
      onToast(d.published ? 'Hidden from the website.' : 'Shown on the website.');
      load();
    } catch {
      onToast('Network error while updating.');
    }
  }

  async function remove(d: DownloadItem) {
    if (!window.confirm(`Delete "${d.title}"? ${d.fileUrl ? 'The file is deleted too.' : ''}`)) return;
    try {
      const res = await fetch(`/api/admin/downloads?id=${encodeURIComponent(d.id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) return onToast(data.message || 'Could not delete.');
      setItems((prev) => prev.filter((x) => x.id !== d.id));
      onToast('Deleted.');
    } catch {
      onToast('Network error while deleting.');
    }
  }

  return (
    <>
      <section className="adm-section" aria-labelledby="adm-dl-new">
        <form className="panel adm-nform" onSubmit={handleSubmit} noValidate>
          <h3 id="adm-dl-new">Add a download</h3>
          <label>
            <span className="field-label">
              Title <span className="sub">{title.length}/{DOWNLOAD_TITLE_MAX}</span>
            </span>
            <input
              className="field"
              value={title}
              maxLength={DOWNLOAD_TITLE_MAX}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. WBCS 2025 Preliminary question paper"
            />
          </label>
          <div className="adm-follow__row">
            <label>
              <span className="field-label">Section</span>
              <select className="field" value={category} onChange={(e) => setCategory(e.target.value as DownloadCategory)}>
                {DOWNLOAD_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABEL[c]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">
                Exam <span className="sub">Optional</span>
              </span>
              <input
                className="field"
                value={exam}
                maxLength={DOWNLOAD_EXAM_MAX}
                onChange={(e) => setExam(e.target.value)}
                placeholder="e.g. WBCS"
              />
            </label>
          </div>
          <label>
            <span className="field-label">
              File <span className="sub">PDF or image, up to 25 MB</span>
            </span>
            <input ref={fileRef} className="field" type="file" accept={ACCEPT} />
          </label>
          <label>
            <span className="field-label">
              Or a link <span className="sub">Instead of a file, e.g. the official PDF</span>
            </span>
            <input
              className="field"
              type="url"
              inputMode="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://"
            />
          </label>
          <label>
            <span className="field-label">
              Remove from website after <span className="sub">Optional. Leave empty to keep it.</span>
            </span>
            <input
              className="field"
              type="date"
              value={expiresOn}
              min={todayIST()}
              onChange={(e) => setExpiresOn(e.target.value)}
            />
          </label>
          {formError && (
            <p className="field-error" role="alert">
              {formError}
            </p>
          )}
          <div>
            <button type="submit" className="btn btn--primary" disabled={!!saving}>
              {saving === 'uploading' ? 'Uploading…' : saving === 'saving' ? 'Saving…' : 'Add to downloads'}
            </button>
          </div>
        </form>
      </section>

      <section className="adm-section stack" aria-labelledby="adm-dl-list">
        <div className="adm-count">
          <h3 id="adm-dl-list">
            <strong>{items.length}</strong> {items.length === 1 ? 'file' : 'files'}
          </h3>
          <button type="button" className="adm-textbtn" onClick={load} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
        {loadError && (
          <div className="notice notice--error" role="alert">
            {loadError}
          </div>
        )}
        {!loading && !loadError && items.length === 0 && (
          <div className="adm-empty">
            <p className="adm-empty__title">No downloads yet</p>
            <p className="sub">Add syllabus PDFs, previous papers and study material above.</p>
          </div>
        )}
        <ul className="adm-nlist">
          {items.map((d) => {
            const expired = !isDownloadLive(d, todayIST());
            return (
            <li key={d.id} className="nb-item" data-hidden={!d.published || expired || undefined}>
              <div className="nb-meta">
                <span className="chip">{CATEGORY_LABEL[d.category]}</span>
                {d.exam && <span className="chip">{d.exam}</span>}
                <time dateTime={d.createdAt}>{formatDate('en', d.createdAt)}</time>
                {d.fileSize ? <span>{formatSize(d.fileSize)}</span> : null}
                {!d.published && <span className="chip">Hidden</span>}
                {d.expiresOn &&
                  (expired ? (
                    <span className="chip">Removed from site {formatDate('en', d.expiresOn)}</span>
                  ) : (
                    <span className="chip">On site until {formatDate('en', d.expiresOn)}</span>
                  ))}
              </div>
              <p className="nb-title">{d.title}</p>
              <div className="adm-nactions">
                <a
                  href={d.fileUrl ?? d.linkUrl ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="adm-textbtn"
                >
                  Open
                </a>
                <button type="button" className="adm-textbtn" onClick={() => togglePublished(d)}>
                  {d.published ? 'Hide' : 'Show'}
                </button>
                <label className="adm-expiry">
                  <span>Remove after</span>
                  <input type="date" className="field" value={d.expiresOn ?? ''} onChange={(e) => setExpiry(d, e.target.value)} />
                </label>
                <button type="button" className="adm-textbtn adm-textbtn--danger" onClick={() => remove(d)}>
                  Delete
                </button>
              </div>
            </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
