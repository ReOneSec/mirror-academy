'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { SITE, COURSE_STREAMS, ALL_COURSES } from '@/lib/constants';
import { COURSE_EVENT, announceCourse } from '@/lib/courseSelection';
import { CheckCircleIcon, AlertCircleIcon } from '@/components/Icons';
import Turnstile, { TURNSTILE_SITE_KEY } from '@/components/Turnstile';
import { downloadSlip, type SlipData } from '@/lib/slip';
import { formatDate, getDict, type Lang } from '@/lib/i18n';
import type {
  BatchType,
  GenderType,
  EnquiryResponse,
  LookupResponse,
  RegistrationRecord,
} from '@/types';

function validatePhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

export default function EnquiryForm({ lang = 'en' }: { lang?: Lang }) {
  const t = getDict(lang).form;
  const streamName = (slug: string, fallback: string) => getDict(lang).courses.streams[slug] ?? fallback;
  const [activeTab, setActiveTab] = useState<'register' | 'lookup'>('register');
  const [batchType, setBatchType] = useState<BatchType>('Free batch');
  const [gender, setGender] = useState<GenderType>('Male');
  const [addressText, setAddressText] = useState('');
  const [messageText, setMessageText] = useState('');
  const [selectedCourseSlug, setSelectedCourseSlug] = useState('');

  // Registration state
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [lastRegisteredPhone, setLastRegisteredPhone] = useState<string>('');
  const [lastSlip, setLastSlip] = useState<SlipData | null>(null);
  const [duplicate, setDuplicate] = useState(false);
  const pendingRef = useRef<Record<string, unknown> | null>(null);

  // Turnstile: each token works once, so the widget is remounted (new key) after every submit.
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0);
  function resetTurnstile() {
    setTurnstileToken('');
    setTurnstileKey((k) => k + 1);
  }

  const formRef = useRef<HTMLFormElement>(null);
  const dirtyRef = useRef(false);

  // Lookup state
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookupResults, setLookupResults] = useState<RegistrationRecord[] | null>(null);

  // A course deep link (?course=wbcs) or a course tapped in the course cards arrives pre-filled.
  // The deep link is announced like a tap, so the course cards mark it too.
  useEffect(() => {
    const onCourse = (e: Event) => {
      const courseSlug = (e as CustomEvent<string>).detail;
      if (courseSlug && ALL_COURSES.some((c) => c.slug === courseSlug)) {
        setSelectedCourseSlug(courseSlug);
      }
    };
    window.addEventListener(COURSE_EVENT, onCourse);

    const slug = new URLSearchParams(window.location.search).get('course');
    if (slug && ALL_COURSES.some((c) => c.slug === slug)) {
      announceCourse(slug);
    }
    return () => window.removeEventListener(COURSE_EVENT, onCourse);
  }, []);

  // Warn before leaving with a half-filled form
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current && status !== 'success') e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [status]);

  // Form submit handler
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string)?.trim() ?? '';
    const phone = (formData.get('phone') as string)?.trim() ?? '';
    const courseSlug = (formData.get('courseSlug') as string) || selectedCourseSlug;
    const address = addressText.trim();
    const message = messageText.trim();

    // Validation
    const errors: Record<string, string> = {};
    if (!name) {
      errors.name = t.errors.name;
    } else if (name.length > 100) {
      errors.name = t.errors.nameLong;
    }

    if (!phone) {
      errors.phone = t.errors.phone;
    } else if (!validatePhone(phone)) {
      errors.phone = t.errors.phoneBad;
    }

    if (!address) {
      errors.address = t.errors.address;
    } else if (address.length > 300) {
      errors.address = t.errors.addressLong;
    }

    if (message.length > 400) {
      errors.message = t.errors.notesLong;
    }

    if (!courseSlug) {
      errors.courseSlug = t.errors.course;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstKey = Object.keys(errors)[0];
      const el = formRef.current?.querySelector(`[name="${firstKey}"]`) as HTMLInputElement | null;
      el?.focus();
      return;
    }

    await submitRegistration({ name, phone, courseSlug, batchType, gender, address, message });
  }

  async function submitRegistration(payload: Record<string, unknown>, allowDuplicate = false) {
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setStatus('error');
      setErrorMessage(t.errors.turnstile);
      return;
    }

    setStatus('submitting');
    setDuplicate(false);
    setErrorMessage('');

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, turnstileToken, allowDuplicate }),
      });

      const result: EnquiryResponse = await res.json();
      resetTurnstile();

      if (result.success) {
        const course = ALL_COURSES.find((c) => c.slug === payload.courseSlug);
        setLastSlip({
          id: result.id ?? '',
          name: String(payload.name),
          phone: String(payload.phone),
          courseName: course?.name ?? String(payload.courseSlug),
          stream: course?.stream ?? '',
          batchType: String(payload.batchType),
          createdAt: result.createdAt ?? new Date().toISOString(),
        });
        pendingRef.current = null;
        setStatus('success');
        setLastRegisteredPhone(String(payload.phone));
        setAddressText('');
        setMessageText('');
        dirtyRef.current = false;
        formRef.current?.reset();
      } else if (result.duplicate) {
        pendingRef.current = payload;
        setDuplicate(true);
        setStatus('error');
        setErrorMessage(result.message);
      } else {
        setStatus('error');
        setErrorMessage(result.message || t.errors.generic);
      }
    } catch {
      resetTurnstile();
      setStatus('error');
      setErrorMessage(t.errors.network);
    }
  }

  // Lookup handler
  async function handleLookup(targetPhone?: string) {
    const phoneToQuery = (targetPhone ?? lookupPhone).trim();
    setLookupError('');
    setLookupResults(null);

    if (!phoneToQuery) {
      setLookupError(t.errors.lookupEmpty);
      return;
    }

    if (!validatePhone(phoneToQuery)) {
      setLookupError(t.errors.lookupBad);
      return;
    }

    setLookupLoading(true);

    try {
      const res = await fetch(`/api/enquiry?phone=${encodeURIComponent(phoneToQuery)}`);
      const data: LookupResponse = await res.json();

      if (data.success) {
        setLookupResults(data.registrations ?? []);
      } else {
        setLookupError(data.message || t.errors.lookupNone);
      }
    } catch {
      setLookupError(t.errors.lookupNetwork);
    } finally {
      setLookupLoading(false);
    }
  }

  function switchToLookupWithPhone(phone: string) {
    setActiveTab('lookup');
    setLookupPhone(phone);
    handleLookup(phone);
  }

  function fieldProps(key: string) {
    return {
      'aria-invalid': !!fieldErrors[key],
      'aria-describedby': fieldErrors[key] ? `${key}-error` : undefined,
    };
  }

  function fieldError(name: string) {
    if (!fieldErrors[name]) return null;
    return (
      <p id={`${name}-error`} className="field-error" role="alert">
        {fieldErrors[name]}
      </p>
    );
  }

  return (
    <section id="registration" className="section" aria-labelledby="registration-heading">
      <div className="head">
        <p className="head__eyebrow">{t.eyebrow}</p>
        <h2 id="registration-heading">{t.heading}</h2>
        <p className="head__sub">{t.sub}</p>
      </div>

      <div className="reg">
      <div className="stack">
        <div className="tabs" role="tablist" aria-label={t.tabsAria}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'register'}
            onClick={() => setActiveTab('register')}
          >
            {t.tabRegister}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'lookup'}
            onClick={() => {
              setActiveTab('lookup');
              if (lastRegisteredPhone && !lookupPhone) {
                setLookupPhone(lastRegisteredPhone);
                handleLookup(lastRegisteredPhone);
              }
            }}
          >
            {t.tabLookup}
          </button>
        </div>

        {/* Tab 1: Registration Form */}
        {activeTab === 'register' && (
          <div className="panel" role="tabpanel">
            {status === 'success' ? (
              <div className="stack" role="alert" aria-live="polite" style={{ justifyItems: 'start' }}>
                <span style={{ color: 'var(--fill-system-green)' }}>
                  <CheckCircleIcon className="h-10 w-10 tick-draw" aria-hidden="true" />
                </span>
                <h3>{t.successTitle}</h3>
                <p className="sub">
                  {t.successBody}
                </p>
                <div className="links">
                  {lastSlip?.id && !lastSlip.id.startsWith('dev-') && (
                    <button
                      type="button"
                      onClick={() => downloadSlip(lastSlip)}
                      className="btn btn--primary"
                    >
                      {t.downloadSlip}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => switchToLookupWithPhone(lastRegisteredPhone)}
                    className="btn"
                  >
                    {t.seeRegistration}
                  </button>
                  <button type="button" onClick={() => setStatus('idle')} className="btn">
                    {t.registerAnother}
                  </button>
                </div>
              </div>
            ) : (
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                onChange={() => {
                  dirtyRef.current = true;
                }}
                noValidate
                className="form"
              >
                {status === 'error' && !duplicate && (
                  <div className="notice notice--error" role="alert" aria-live="polite">
                    <AlertCircleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <p>{errorMessage}</p>
                  </div>
                )}

                {duplicate && (
                  <div className="notice notice--warn stack" role="alert" aria-live="polite">
                    <p>
                      <strong>{t.alreadyRegistered}</strong> {errorMessage}
                    </p>
                    <div className="links">
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() =>
                          switchToLookupWithPhone(String(pendingRef.current?.phone ?? ''))
                        }
                      >
                        {t.tabLookup}
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={() =>
                          pendingRef.current && submitRegistration(pendingRef.current, true)
                        }
                      >
                        {t.registerAgain}
                      </button>
                    </div>
                  </div>
                )}

                {/* Batch Selection: 3 options (Free / Paid / Interview batch) */}
                <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                  <legend className="field-label">
                    <span>
                      {t.batch} <span className="req">*</span>
                    </span>
                  </legend>
                  <div className="choice-grid">
                    <button
                      type="button"
                      className="choice"
                      aria-pressed={batchType === 'Free batch'}
                      onClick={() => setBatchType('Free batch')}
                    >
                      <span className="choice__top">
                        {t.batches['Free batch'].name} <span className="pill">{t.batches['Free batch'].pill}</span>
                      </span>
                      <p>{t.batches['Free batch'].body}</p>
                    </button>
                    <button
                      type="button"
                      className="choice"
                      aria-pressed={batchType === 'Paid batch'}
                      onClick={() => setBatchType('Paid batch')}
                    >
                      <span className="choice__top">
                        {t.batches['Paid batch'].name} <span className="pill">{t.batches['Paid batch'].pill}</span>
                      </span>
                      <p>{t.batches['Paid batch'].body}</p>
                    </button>
                    <button
                      type="button"
                      className="choice"
                      aria-pressed={batchType === 'Interview batch'}
                      onClick={() => setBatchType('Interview batch')}
                    >
                      <span className="choice__top">
                        {t.batches['Interview batch'].name}{' '}
                        <span className="pill">{t.batches['Interview batch'].pill}</span>
                      </span>
                      <p>{t.batches['Interview batch'].body}</p>
                    </button>
                  </div>
                </fieldset>

                {/* Student Name */}
                <div>
                  <label htmlFor="student-name" className="field-label">
                    <span>
                      {t.name} <span className="req">*</span>
                    </span>
                  </label>
                  <input
                    id="student-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={100}
                    placeholder={t.namePh}
                    className="field"
                    {...fieldProps('name')}
                  />
                  {fieldError('name')}
                </div>

                {/* Contact Number */}
                <div>
                  <label htmlFor="student-phone" className="field-label">
                    <span>
                      {t.phone} <span className="req">*</span>
                    </span>
                  </label>
                  <input
                    id="student-phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    required
                    placeholder={t.phonePh}
                    maxLength={10}
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10);
                    }}
                    className="field tabular-nums"
                    spellCheck={false}
                    {...fieldProps('phone')}
                  />
                  <p className="field-hint">{t.phoneHint}</p>
                  {fieldError('phone')}
                </div>

                {/* Gender */}
                <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                  <legend className="field-label">
                    <span>
                      {t.gender} <span className="req">*</span>
                    </span>
                  </legend>
                  <div className="radios">
                    {(['Male', 'Female'] as GenderType[]).map((g) => (
                      <label key={g}>
                        <input
                          type="radio"
                          name="genderRadio"
                          checked={gender === g}
                          onChange={() => setGender(g)}
                        />
                        {t.genders[g] ?? g}
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Residential Address */}
                <div>
                  <label htmlFor="student-address" className="field-label">
                    <span>
                      {t.address} <span className="req">*</span>
                    </span>
                    <span className="sub tabular-nums">{addressText.length}/300</span>
                  </label>
                  <textarea
                    id="student-address"
                    name="address"
                    rows={3}
                    maxLength={300}
                    value={addressText}
                    onChange={(e) => setAddressText(e.target.value.slice(0, 300))}
                    required
                    placeholder={t.addressPh}
                    className="field"
                    {...fieldProps('address')}
                  />
                  {fieldError('address')}
                </div>

                {/* Course Selection */}
                <div>
                  <label htmlFor="student-course" className="field-label">
                    <span>
                      {t.course} <span className="req">*</span>
                    </span>
                  </label>
                  <select
                    id="student-course"
                    name="courseSlug"
                    required
                    value={selectedCourseSlug}
                    onChange={(e) => {
                      setSelectedCourseSlug(e.target.value);
                      announceCourse(e.target.value);
                    }}
                    className="field"
                    {...fieldProps('courseSlug')}
                  >
                    <option value="" disabled>
                      {t.coursePh}
                    </option>
                    {COURSE_STREAMS.map((stream) => (
                      <optgroup key={stream.slug} label={streamName(stream.slug, stream.stream)}>
                        {stream.courses.map((course) => (
                          <option key={course.slug} value={course.slug}>
                            {course.name} ({streamName(stream.slug, stream.stream)})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {fieldError('courseSlug')}
                </div>

                {/* Optional Message / Notes with 400 char limit */}
                <div>
                  <label htmlFor="student-message" className="field-label">
                    <span>
                      {t.notes} <span className="sub">{t.optional}</span>
                    </span>
                    <span className="sub tabular-nums">{messageText.length}/400</span>
                  </label>
                  <textarea
                    id="student-message"
                    name="message"
                    rows={2}
                    maxLength={400}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value.slice(0, 400))}
                    placeholder={t.notesPh}
                    className="field"
                    {...fieldProps('message')}
                  />
                  {fieldError('message')}
                </div>

                {/* Security check (Cloudflare Turnstile), shown when the site key is set */}
                <Turnstile key={turnstileKey} onToken={setTurnstileToken} />

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="btn btn--primary btn--lg btn--block"
                >
                  {status === 'submitting' ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      {t.submitting}
                    </>
                  ) : (
                    t.submit(t.batches[batchType]?.name ?? batchType)
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Check registration */}
        {activeTab === 'lookup' && (
          <div className="panel stack" role="tabpanel">
            <div>
              <h3>{t.lookupTitle}</h3>
              <p className="sub" style={{ marginTop: 4 }}>
                {t.lookupSub}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="lookup-phone" className="sr-only">
                {t.phone}
              </label>
              <input
                id="lookup-phone"
                type="tel"
                inputMode="numeric"
                value={lookupPhone}
                onChange={(e) => setLookupPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLookup();
                  }
                }}
                placeholder={t.lookupPh}
                maxLength={10}
                className="field tabular-nums sm:flex-1"
              />
              <button
                type="button"
                onClick={() => handleLookup()}
                disabled={lookupLoading}
                className="btn btn--primary btn--lg"
              >
                {lookupLoading && <span className="spinner" aria-hidden="true" />}
                {t.find}
              </button>
            </div>

            {lookupError && (
              <div className="notice notice--error" role="alert">
                <AlertCircleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <p>{lookupError}</p>
              </div>
            )}

            {lookupResults &&
              (lookupResults.length === 0 ? (
                <div className="aside" style={{ maxWidth: 'none' }}>
                  <h3>{t.noneFound(lookupPhone ? `+91 ${lookupPhone}` : t.thisNumber)}</h3>
                  <p className="sub">{t.noneSub}</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="btn btn--primary"
                    style={{ marginTop: 12 }}
                  >
                    {getDict(lang).hero.register}
                  </button>
                </div>
              ) : (
                <div className="stack">
                  <p className="sub">
                    {t.found(lookupResults.length)}
                  </p>
                  {lookupResults.map((record) => (
                    <article key={record.id} className="record stack">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="sub" style={{ font: 'var(--type-caption)' }}>
                            {t.record}
                          </p>
                          <h4 style={{ font: 'var(--type-heading)', overflowWrap: 'anywhere' }}>{record.name}</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="chip">{t.batches[record.batchType]?.name ?? record.batchType}</span>
                          <span className="chip chip--solid">{t.received}</span>
                        </div>
                      </div>
                      <dl>
                        <div>
                          <dt>{t.course}</dt>
                          <dd>
                            {record.courseName} <span className="sub">({record.stream})</span>
                          </dd>
                        </div>
                        <div>
                          <dt>{t.phone}</dt>
                          <dd className="tabular-nums">{record.phone}</dd>
                        </div>
                        <div>
                          <dt>{t.gender}</dt>
                          <dd>{t.genders[record.gender] ?? record.gender}</dd>
                        </div>
                        <div>
                          <dt>{t.registered}</dt>
                          <dd>{formatDate(lang, record.createdAt)}</dd>
                        </div>
                        <div className="wide">
                          <dt>{t.address}</dt>
                          <dd>{record.address}</dd>
                        </div>
                        {record.message && (
                          <div className="wide">
                            <dt>{t.notes}</dt>
                            <dd style={{ fontWeight: 400 }}>{record.message}</dd>
                          </div>
                        )}
                      </dl>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="fineprint" style={{ fontSize: 'var(--size-caption)' }}>
                          {t.regId} <span className="font-mono">{record.id}</span>
                        </p>
                        <button type="button" className="btn" onClick={() => downloadSlip(record)}>
                          {t.downloadShort}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ))}
          </div>
        )}
      </div>
      <aside className="callout" aria-label={t.afterHead}>
        <p className="callout__head">{t.afterHead}</p>
        <ol>
          {t.after.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
        <p className="fineprint">
          {t.preferTalk}
          <a className="link" href={SITE.phoneTel}>
            {SITE.phoneDisplay}
          </a>
          {t.or}
          <a className="link" href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
            {t.whatsappUs}
          </a>
          {lang === 'bn' ? '।' : '.'}
        </p>
      </aside>
      </div>
    </section>
  );
}
