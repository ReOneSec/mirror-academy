'use client';

import { useState } from 'react';
import type { RegistrationRecord } from '@/types';

/** The team's notes and next follow-up date for one student. Remount it per record (key). */
export default function AdminFollowUp({
  record,
  onSave,
}: {
  record: RegistrationRecord;
  onSave: (id: string, adminNotes: string, followUpDate: string) => Promise<boolean>;
}) {
  const [notes, setNotes] = useState(record.adminNotes ?? '');
  const [date, setDate] = useState(record.followUpDate ?? '');
  const [saving, setSaving] = useState(false);
  const dirty = notes !== (record.adminNotes ?? '') || date !== (record.followUpDate ?? '');

  async function save() {
    setSaving(true);
    await onSave(record.id, notes, date);
    setSaving(false);
  }

  return (
    <div className="adm-follow">
      <label htmlFor="adm-notes" className="field-label">
        <span>Team notes</span>
        <span className="sub tabular-nums">{notes.length}/1000</span>
      </label>
      <textarea
        id="adm-notes"
        className="field"
        maxLength={1000}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="e.g. Called, wants evening batch. Visiting Saturday."
      />
      <div className="adm-follow__row">
        <label>
          <span className="field-label">Follow up on</span>
          <input
            type="date"
            className="field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        {date && (
          <button type="button" className="adm-textbtn" onClick={() => setDate('')}>
            Clear date
          </button>
        )}
        <button
          type="button"
          className="btn btn--primary"
          disabled={!dirty || saving}
          onClick={save}
        >
          {saving ? 'Saving…' : 'Save notes'}
        </button>
      </div>
    </div>
  );
}
