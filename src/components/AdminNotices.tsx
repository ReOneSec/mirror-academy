'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Notice } from '@/types';
import { NOTICE_BODY_MAX, NOTICE_MAX_BYTES, NOTICE_TITLE_MAX, formatNoticeDate } from '@/lib/notices';

const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp';

export default function AdminNotices({ onToast }: { onToast: (msg: string) => void }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [pinned, setPinned] = useState(false);
  const [formError, setFormError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetch('/api/admin/notices');
      const data = await res.json();
      if (data.success) setNotices(data.notices ?? []);
      else setLoadError(data.message || 'Failed to load notices.');
    } catch {
      setLoadError('Could not load notices. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch('/api/admin/notices')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.success) setNotices(data.notices ?? []);
        else setLoadError(data.message || 'Failed to load notices.');
      })
      .catch(() => active && setLoadError('Could not load notices. Check your connection.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!title.trim()) {
      setFormError('Add a title.');
      return;
    }
    const file = fileRef.current?.files?.[0];
    if (file && file.size > NOTICE_MAX_BYTES) {
      setFormError('The file must be 4 MB or smaller.');
      return;
    }

    const form = new FormData();
    form.set('title', title.trim());
    form.set('body', body.trim());
    form.set('linkUrl', linkUrl.trim());
    form.set('pinned', String(pinned));
    if (file) form.set('file', file);

    setSaving(true);
    try {
      const res = await fetch('/api/admin/notices', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setFormError(data.message || 'Could not post the notice.');
        return;
      }
      setTitle('');
      setBody('');
      setLinkUrl('');
      setPinned(false);
      if (fileRef.current) fileRef.current.value = '';
      onToast('Notice posted. It is live on the website.');
      load();
    } catch {
      setFormError('Network error while posting.');
    } finally {
      setSaving(false);
    }
  }

  async function update(id: string, patch: { pinned?: boolean; published?: boolean }, msg: string) {
    try {
      const res = await fetch('/api/admin/notices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        onToast(data.message || 'Could not update the notice.');
        return;
      }
      onToast(msg);
      load();
    } catch {
      onToast('Network error while updating.');
    }
  }

  async function remove(notice: Notice) {
    if (!window.confirm(`Delete the notice "${notice.title}"? This removes it from the website.`)) return;
    try {
      const res = await fetch(`/api/admin/notices?id=${encodeURIComponent(notice.id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        onToast(data.message || 'Could not delete the notice.');
        return;
      }
      setNotices((prev) => prev.filter((n) => n.id !== notice.id));
      onToast('Notice deleted.');
    } catch {
      onToast('Network error while deleting.');
    }
  }

  return (
    <>
      <section className="adm-section" aria-labelledby="adm-notice-new">
        <form className="panel adm-nform" onSubmit={handleSubmit} noValidate>
          <h3 id="adm-notice-new">Post a notice</h3>
          <label>
            <span className="field-label">
              Title <span className="sub">{title.length}/{NOTICE_TITLE_MAX}</span>
            </span>
            <input
              className="field"
              value={title}
              maxLength={NOTICE_TITLE_MAX}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. WBCS 2027 batch starts 5 January"
              required
            />
          </label>
          <label>
            <span className="field-label">
              Details <span className="sub">Optional</span>
            </span>
            <textarea
              className="field"
              rows={4}
              value={body}
              maxLength={NOTICE_BODY_MAX}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          <label>
            <span className="field-label">
              Link <span className="sub">Optional, e.g. the official notice</span>
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
              PDF or image <span className="sub">Optional, up to 4 MB</span>
            </span>
            <input ref={fileRef} className="field" type="file" accept={ACCEPT} />
          </label>
          <div className="adm-nform__row">
            <label className="adm-check">
              <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
              Pin to the top
            </label>
          </div>
          {formError && (
            <p className="field-error" role="alert">
              {formError}
            </p>
          )}
          <div>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Posting…' : 'Post notice'}
            </button>
          </div>
        </form>
      </section>

      <section className="adm-section stack" aria-labelledby="adm-notice-list">
        <div className="adm-count">
          <h3 id="adm-notice-list">
            <strong>{notices.length}</strong> {notices.length === 1 ? 'notice' : 'notices'}
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
        {!loading && !loadError && notices.length === 0 && (
          <div className="adm-empty">
            <p className="adm-empty__title">No notices yet</p>
            <p className="sub">Post one above and it appears on the website straight away.</p>
          </div>
        )}
        <ul className="adm-nlist">
          {notices.map((n) => (
            <li key={n.id} className="nb-item" data-pinned={n.pinned || undefined} data-hidden={!n.published || undefined}>
              <div className="nb-meta">
                <time dateTime={n.createdAt}>{formatNoticeDate(n.createdAt)}</time>
                {n.pinned && <span className="chip chip--solid">Pinned</span>}
                {!n.published && <span className="chip">Hidden</span>}
              </div>
              <p className="nb-title">{n.title}</p>
              {n.body && <p className="nb-body">{n.body}</p>}
              {(n.attachmentUrl || n.linkUrl) && (
                <div className="links">
                  {n.attachmentUrl && (
                    <a href={n.attachmentUrl} target="_blank" rel="noopener noreferrer" className="btn">
                      {n.attachmentName || 'Attachment'}
                    </a>
                  )}
                  {n.linkUrl && (
                    <a href={n.linkUrl} target="_blank" rel="noopener noreferrer" className="btn">
                      Open link
                    </a>
                  )}
                </div>
              )}
              <div className="adm-nactions">
                <button
                  type="button"
                  className="adm-textbtn"
                  onClick={() => update(n.id, { pinned: !n.pinned }, n.pinned ? 'Unpinned.' : 'Pinned to the top.')}
                >
                  {n.pinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  type="button"
                  className="adm-textbtn"
                  onClick={() =>
                    update(n.id, { published: !n.published }, n.published ? 'Hidden from the website.' : 'Shown on the website.')
                  }
                >
                  {n.published ? 'Hide' : 'Show'}
                </button>
                <button type="button" className="adm-textbtn adm-textbtn--danger" onClick={() => remove(n)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
