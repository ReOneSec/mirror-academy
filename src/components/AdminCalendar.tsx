'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { ExamEvent, ExamEventKind } from '@/types';
import { EXAM_EVENT_KINDS, EXAM_NAME_MAX, EXAM_NOTE_MAX, isUpcoming } from '@/lib/examEvents';
import { formatDate, getDict } from '@/lib/i18n';

const KIND_LABEL = getDict('en').calendar.kinds;
const EMPTY = { exam: '', kind: 'exam' as ExamEventKind, startsOn: '', endsOn: '', note: '', linkUrl: '', published: true, expiresOn: '' };

const todayIST = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date()
  );

export default function AdminCalendar({ onToast }: { onToast: (msg: string) => void }) {
  const [events, setEvents] = useState<ExamEvent[]>([]);
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
      const res = await fetch('/api/admin/exam-events');
      const data = await res.json();
      if (data.success) setEvents(data.events ?? []);
      else setLoadError(data.message || 'Failed to load dates.');
    } catch {
      setLoadError('Could not load dates. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch('/api/admin/exam-events')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.success) setEvents(data.events ?? []);
        else setLoadError(data.message || 'Failed to load dates.');
      })
      .catch(() => active && setLoadError('Could not load dates. Check your connection.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(e: ExamEvent) {
    setEditingId(e.id);
    setForm({
      exam: e.exam,
      kind: e.kind,
      startsOn: e.startsOn,
      endsOn: e.endsOn ?? '',
      note: e.note ?? '',
      linkUrl: e.linkUrl ?? '',
      published: e.published,
      expiresOn: e.expiresOn ?? '',
    });
    setFormError('');
    document.getElementById('adm-cal-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
    setFormError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.exam.trim()) return setFormError('Add the exam name.');
    if (!form.startsOn) return setFormError('Pick the date.');
    if (form.endsOn && form.endsOn < form.startsOn) return setFormError('The end date must be on or after the start date.');
    // Send the remove date only when it is set or being cleared, so saving works before migration 007.
    const hadExpiry = !!events.find((x) => x.id === editingId)?.expiresOn;
    const { expiresOn, ...rest } = form;
    const payload = expiresOn || hadExpiry ? { ...rest, expiresOn: expiresOn || null } : rest;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/exam-events', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setFormError(data.message || 'Could not save the date.');
        return;
      }
      onToast(editingId ? 'Date updated.' : 'Date added to the calendar.');
      cancelEdit();
      load();
    } catch {
      setFormError('Network error while saving.');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(ev: ExamEvent) {
    try {
      const res = await fetch('/api/admin/exam-events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ev.id, published: !ev.published }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) return onToast(data.message || 'Could not update the date.');
      onToast(ev.published ? 'Hidden from the website.' : 'Shown on the website.');
      load();
    } catch {
      onToast('Network error while updating.');
    }
  }

  async function remove(ev: ExamEvent) {
    if (!window.confirm(`Delete "${ev.exam}" (${KIND_LABEL[ev.kind]}, ${formatDate('en', ev.startsOn)})?`)) return;
    try {
      const res = await fetch(`/api/admin/exam-events?id=${encodeURIComponent(ev.id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) return onToast(data.message || 'Could not delete the date.');
      if (editingId === ev.id) cancelEdit();
      setEvents((prev) => prev.filter((x) => x.id !== ev.id));
      onToast('Date deleted.');
    } catch {
      onToast('Network error while deleting.');
    }
  }

  const today = todayIST();

  return (
    <>
      <section className="adm-section" aria-labelledby="adm-cal-form-title">
        <form id="adm-cal-form" className="panel adm-nform" onSubmit={handleSubmit} noValidate>
          <h3 id="adm-cal-form-title">{editingId ? 'Edit date' : 'Add an exam date'}</h3>
          <label>
            <span className="field-label">
              Exam <span className="sub">{form.exam.length}/{EXAM_NAME_MAX}</span>
            </span>
            <input
              className="field"
              value={form.exam}
              maxLength={EXAM_NAME_MAX}
              onChange={(e) => set('exam', e.target.value)}
              placeholder="e.g. WBCS (Exe.) Preliminary 2027"
            />
          </label>
          <label>
            <span className="field-label">What is the date for?</span>
            <select className="field" value={form.kind} onChange={(e) => set('kind', e.target.value as ExamEventKind)}>
              {EXAM_EVENT_KINDS.map((k) => (
                <option key={k} value={k}>
                  {KIND_LABEL[k]}
                </option>
              ))}
            </select>
          </label>
          <div className="adm-follow__row">
            <label>
              <span className="field-label">Date</span>
              <input className="field" type="date" value={form.startsOn} onChange={(e) => set('startsOn', e.target.value)} />
            </label>
            <label>
              <span className="field-label">
                Last day <span className="sub">Optional, for dates that run several days</span>
              </span>
              <input
                className="field"
                type="date"
                value={form.endsOn}
                min={form.startsOn || undefined}
                onChange={(e) => set('endsOn', e.target.value)}
              />
            </label>
          </div>
          <label>
            <span className="field-label">
              Remove from website after <span className="sub">Optional. Leave empty to remove it once the date has passed.</span>
            </span>
            <input
              className="field"
              type="date"
              value={form.expiresOn}
              min={form.startsOn || undefined}
              onChange={(e) => set('expiresOn', e.target.value)}
            />
          </label>
          <label>
            <span className="field-label">
              Note <span className="sub">Optional</span>
            </span>
            <input
              className="field"
              value={form.note}
              maxLength={EXAM_NOTE_MAX}
              onChange={(e) => set('note', e.target.value)}
              placeholder="e.g. Admit cards at psc.wb.gov.in"
            />
          </label>
          <label>
            <span className="field-label">
              Official link <span className="sub">Optional, the notice on the exam body&rsquo;s site</span>
            </span>
            <input
              className="field"
              type="url"
              inputMode="url"
              value={form.linkUrl}
              onChange={(e) => set('linkUrl', e.target.value)}
              placeholder="https://"
            />
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
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add date'}
            </button>
            {editingId && (
              <button type="button" className="btn" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
          <p className="field-hint">Past dates drop off the website by themselves the day after they end.</p>
        </form>
      </section>

      <section className="adm-section stack" aria-labelledby="adm-cal-list">
        <div className="adm-count">
          <h3 id="adm-cal-list">
            <strong>{events.length}</strong> {events.length === 1 ? 'date' : 'dates'}
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
        {!loading && !loadError && events.length === 0 && (
          <div className="adm-empty">
            <p className="adm-empty__title">No dates yet</p>
            <p className="sub">Add exam days, admit card and result dates above.</p>
          </div>
        )}
        <ul className="adm-nlist">
          {events.map((ev) => {
            const past = !isUpcoming(ev, today);
            return (
              <li key={ev.id} className="nb-item" data-hidden={!ev.published || past || undefined}>
                <div className="nb-meta">
                  <span className="chip">{KIND_LABEL[ev.kind]}</span>
                  <span>
                    {formatDate('en', ev.startsOn)}
                    {ev.endsOn && ev.endsOn !== ev.startsOn ? ` – ${formatDate('en', ev.endsOn)}` : ''}
                  </span>
                  {!ev.published && <span className="chip">Hidden</span>}
                  {past ? (
                    <span className="chip">Removed from site</span>
                  ) : (
                    <span className="chip">
                      On site until {formatDate('en', ev.expiresOn ?? ev.endsOn ?? ev.startsOn)}
                    </span>
                  )}
                </div>
                <p className="nb-title">{ev.exam}</p>
                {ev.note && <p className="nb-body">{ev.note}</p>}
                <div className="adm-nactions">
                  {ev.linkUrl && (
                    <a href={ev.linkUrl} target="_blank" rel="noopener noreferrer" className="adm-textbtn">
                      Link
                    </a>
                  )}
                  <button type="button" className="adm-textbtn" onClick={() => startEdit(ev)}>
                    Edit
                  </button>
                  <button type="button" className="adm-textbtn" onClick={() => togglePublished(ev)}>
                    {ev.published ? 'Hide' : 'Show'}
                  </button>
                  <button type="button" className="adm-textbtn adm-textbtn--danger" onClick={() => remove(ev)}>
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
