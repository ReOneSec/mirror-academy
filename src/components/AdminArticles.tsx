'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { Article } from '@/types';
import {
  ARTICLE_BODY_MAX,
  ARTICLE_CATEGORY_MAX,
  ARTICLE_SUMMARY_MAX,
  ARTICLE_TITLE_MAX,
  articleExcerpt,
  formatArticleDate,
} from '@/lib/articles';

const EMPTY = { title: '', category: '', summary: '', body: '', published: true };

export default function AdminArticles({ onToast }: { onToast: (msg: string) => void }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  async function load() {
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetch('/api/admin/articles');
      const data = await res.json();
      if (data.success) setArticles(data.articles ?? []);
      else setLoadError(data.message || 'Failed to load articles.');
    } catch {
      setLoadError('Could not load articles. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch('/api/admin/articles')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.success) setArticles(data.articles ?? []);
        else setLoadError(data.message || 'Failed to load articles.');
      })
      .catch(() => active && setLoadError('Could not load articles. Check your connection.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(a: Article) {
    setEditingId(a.id);
    setForm({ title: a.title, category: a.category ?? '', summary: a.summary ?? '', body: a.body, published: a.published });
    setFormError('');
    document.getElementById('adm-article-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
    setFormError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim()) return setFormError('Add a title.');
    if (!form.body.trim()) return setFormError('Write the article.');

    setSaving(true);
    try {
      const res = await fetch('/api/admin/articles', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setFormError(data.message || 'Could not save the article.');
        return;
      }
      onToast(editingId ? 'Article updated.' : form.published ? 'Article published.' : 'Article saved as hidden.');
      cancelEdit();
      load();
    } catch {
      setFormError('Network error while saving.');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(a: Article) {
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: a.id, published: !a.published }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        onToast(data.message || 'Could not update the article.');
        return;
      }
      onToast(a.published ? 'Hidden from the website.' : 'Shown on the website.');
      load();
    } catch {
      onToast('Network error while updating.');
    }
  }

  async function remove(a: Article) {
    if (!window.confirm(`Delete the article "${a.title}"? This removes it from the website.`)) return;
    try {
      const res = await fetch(`/api/admin/articles?id=${encodeURIComponent(a.id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        onToast(data.message || 'Could not delete the article.');
        return;
      }
      if (editingId === a.id) cancelEdit();
      setArticles((prev) => prev.filter((x) => x.id !== a.id));
      onToast('Article deleted.');
    } catch {
      onToast('Network error while deleting.');
    }
  }

  return (
    <>
      <section className="adm-section" aria-labelledby="adm-article-form-title">
        <form id="adm-article-form" className="panel adm-nform" onSubmit={handleSubmit} noValidate>
          <h3 id="adm-article-form-title">{editingId ? 'Edit article' : 'Write an article'}</h3>
          <label>
            <span className="field-label">
              Title <span className="sub">{form.title.length}/{ARTICLE_TITLE_MAX}</span>
            </span>
            <input
              className="field"
              value={form.title}
              maxLength={ARTICLE_TITLE_MAX}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. ক্লার্কশিপ পরীক্ষা: পরীক্ষার ধারা ও সিলেবাস"
              required
            />
          </label>
          <div className="adm-follow__row">
            <label>
              <span className="field-label">
                Category <span className="sub">Optional</span>
              </span>
              <input
                className="field"
                value={form.category}
                maxLength={ARTICLE_CATEGORY_MAX}
                onChange={(e) => set('category', e.target.value)}
                placeholder="e.g. সিলেবাস, Exam pattern"
              />
            </label>
          </div>
          <label>
            <span className="field-label">
              Short summary <span className="sub">Optional, shown on the article card</span>
            </span>
            <textarea
              className="field"
              rows={2}
              value={form.summary}
              maxLength={ARTICLE_SUMMARY_MAX}
              onChange={(e) => set('summary', e.target.value)}
            />
          </label>
          <label>
            <span className="field-label">
              Article <span className="sub">{form.body.length}/{ARTICLE_BODY_MAX}</span>
            </span>
            <textarea
              className="field adm-article-body"
              rows={16}
              value={form.body}
              maxLength={ARTICLE_BODY_MAX}
              onChange={(e) => set('body', e.target.value)}
              placeholder="Paste or write the article here."
            />
            <span className="field-hint">
              Paste from WhatsApp as it is. *bold* stays bold, a line starting with ### becomes a heading, --- draws a
              divider, a line starting with - becomes a bullet, and a blank line starts a new paragraph.
            </span>
          </label>
          <div className="adm-nform__row">
            <label className="adm-check">
              <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
              Show on the website
            </label>
          </div>
          {formError && (
            <p className="field-error" role="alert">
              {formError}
            </p>
          )}
          <div className="links">
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : form.published ? 'Publish article' : 'Save hidden'}
            </button>
            {editingId && (
              <button type="button" className="btn" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="adm-section stack" aria-labelledby="adm-article-list">
        <div className="adm-count">
          <h3 id="adm-article-list">
            <strong>{articles.length}</strong> {articles.length === 1 ? 'article' : 'articles'}
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
        {!loading && !loadError && articles.length === 0 && (
          <div className="adm-empty">
            <p className="adm-empty__title">No articles yet</p>
            <p className="sub">Write one above and it gets its own page on the website.</p>
          </div>
        )}
        <ul className="adm-nlist">
          {articles.map((a) => (
            <li key={a.id} className="nb-item" data-hidden={!a.published || undefined}>
              <div className="nb-meta">
                <time dateTime={a.createdAt}>{formatArticleDate(a.createdAt)}</time>
                {a.category && <span className="chip">{a.category}</span>}
                {!a.published && <span className="chip">Hidden</span>}
              </div>
              <p className="nb-title">{a.title}</p>
              <p className="nb-body">{articleExcerpt(a, 200)}</p>
              <div className="adm-nactions">
                {a.published && (
                  <a href={`/articles/${a.slug}`} target="_blank" rel="noopener noreferrer" className="adm-textbtn">
                    View
                  </a>
                )}
                <button type="button" className="adm-textbtn" onClick={() => startEdit(a)}>
                  Edit
                </button>
                <button type="button" className="adm-textbtn" onClick={() => togglePublished(a)}>
                  {a.published ? 'Hide' : 'Show'}
                </button>
                <button type="button" className="adm-textbtn adm-textbtn--danger" onClick={() => remove(a)}>
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
