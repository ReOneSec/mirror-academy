'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { SITE, COURSE_STREAMS, ALL_COURSES } from '@/lib/constants';
import { COURSE_EVENT, announceCourse } from '@/lib/courseSelection';
import { CheckCircleIcon, AlertCircleIcon } from '@/components/Icons';
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

export default function EnquiryForm() {
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
      errors.name = 'Please enter student name.';
    } else if (name.length > 100) {
      errors.name = 'Student name cannot exceed 100 characters.';
    }

    if (!phone) {
      errors.phone = 'Please enter contact number.';
    } else if (!validatePhone(phone)) {
      errors.phone = 'Enter a 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
    }

    if (!address) {
      errors.address = 'Please enter your residential address.';
    } else if (address.length > 300) {
      errors.address = 'Residential address cannot exceed 300 characters.';
    }

    if (message.length > 400) {
      errors.message = 'Questions or notes cannot exceed 400 characters.';
    }

    if (!courseSlug) {
      errors.courseSlug = 'Please select a course.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstKey = Object.keys(errors)[0];
      const el = formRef.current?.querySelector(`[name="${firstKey}"]`) as HTMLInputElement | null;
      el?.focus();
      return;
    }

    setStatus('submitting');

    try {
      const turnstileToken =
        (window as unknown as Record<string, unknown>).turnstileToken as string | undefined;

      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          courseSlug,
          batchType,
          gender,
          address,
          message,
          turnstileToken: turnstileToken ?? '',
        }),
      });

      const result: EnquiryResponse = await res.json();

      if (result.success) {
        setStatus('success');
        setLastRegisteredPhone(phone);
        setAddressText('');
        setMessageText('');
        dirtyRef.current = false;
        formRef.current?.reset();
      } else {
        setStatus('error');
        setErrorMessage(result.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Could not connect to the server. Check your connection and try again.');
    }
  }

  // Lookup handler
  async function handleLookup(targetPhone?: string) {
    const phoneToQuery = (targetPhone ?? lookupPhone).trim();
    setLookupError('');
    setLookupResults(null);

    if (!phoneToQuery) {
      setLookupError('Please enter your 10-digit contact number.');
      return;
    }

    if (!validatePhone(phoneToQuery)) {
      setLookupError('Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    setLookupLoading(true);

    try {
      const res = await fetch(`/api/enquiry?phone=${encodeURIComponent(phoneToQuery)}`);
      const data: LookupResponse = await res.json();

      if (data.success) {
        setLookupResults(data.registrations ?? []);
      } else {
        setLookupError(data.message || 'Could not find records for this number.');
      }
    } catch {
      setLookupError('Network error while checking response. Please try again.');
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
        <p className="head__eyebrow">Register</p>
        <h2 id="registration-heading">Register as a student.</h2>
        <p className="head__sub">
          Pick a batch, fill in your details, or check a registration you already sent.
        </p>
      </div>

      <div className="reg">
      <div className="stack">
        <div className="tabs" role="tablist" aria-label="Register or check your registration">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'register'}
            onClick={() => setActiveTab('register')}
          >
            Register
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
            Check my registration
          </button>
        </div>

        {/* Tab 1: Registration Form */}
        {activeTab === 'register' && (
          <div className="panel" role="tabpanel">
            {status === 'success' ? (
              <div className="stack" role="alert" aria-live="polite" style={{ justifyItems: 'start' }}>
                <span style={{ color: 'var(--fill-system-green)' }}>
                  <CheckCircleIcon className="h-10 w-10" aria-hidden="true" />
                </span>
                <h3>Registration submitted</h3>
                <p className="sub">
                  Your registration is with Mirror Academy. We will call you back soon to confirm batch timings.
                </p>
                <div className="links">
                  <button
                    type="button"
                    onClick={() => switchToLookupWithPhone(lastRegisteredPhone)}
                    className="btn btn--primary"
                  >
                    See your registration
                  </button>
                  <button type="button" onClick={() => setStatus('idle')} className="btn">
                    Register another student
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
                {status === 'error' && (
                  <div className="notice notice--error" role="alert" aria-live="polite">
                    <AlertCircleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <p>{errorMessage}</p>
                  </div>
                )}

                {/* Batch Selection: 3 options (Free / Paid / Interview batch) */}
                <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                  <legend className="field-label">
                    <span>
                      Batch <span className="req">*</span>
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
                        Free batch <span className="pill">Orientation</span>
                      </span>
                      <p>Introductory lectures, syllabus overview and guidance sessions.</p>
                    </button>
                    <button
                      type="button"
                      className="choice"
                      aria-pressed={batchType === 'Paid batch'}
                      onClick={() => setBatchType('Paid batch')}
                    >
                      <span className="choice__top">
                        Paid batch <span className="pill">Full course</span>
                      </span>
                      <p>Complete exam curriculum, daily mock tests and dedicated faculty.</p>
                    </button>
                    <button
                      type="button"
                      className="choice"
                      aria-pressed={batchType === 'Interview batch'}
                      onClick={() => setBatchType('Interview batch')}
                    >
                      <span className="choice__top">
                        Interview batch <span className="pill">Mock interview</span>
                      </span>
                      <p>Mock interview sessions for TET, SSC and police recruitment interviews.</p>
                    </button>
                  </div>
                </fieldset>

                {/* Student Name */}
                <div>
                  <label htmlFor="student-name" className="field-label">
                    <span>
                      Student name <span className="req">*</span>
                    </span>
                  </label>
                  <input
                    id="student-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={100}
                    placeholder="e.g. Rahim Sheikh…"
                    className="field"
                    {...fieldProps('name')}
                  />
                  {fieldError('name')}
                </div>

                {/* Contact Number */}
                <div>
                  <label htmlFor="student-phone" className="field-label">
                    <span>
                      Mobile number <span className="req">*</span>
                    </span>
                  </label>
                  <input
                    id="student-phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    required
                    placeholder="e.g. 9876543210…"
                    maxLength={10}
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10);
                    }}
                    className="field tabular-nums"
                    spellCheck={false}
                    {...fieldProps('phone')}
                  />
                  <p className="field-hint">You&rsquo;ll use this number to check your registration later.</p>
                  {fieldError('phone')}
                </div>

                {/* Gender */}
                <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                  <legend className="field-label">
                    <span>
                      Gender <span className="req">*</span>
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
                        {g}
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Residential Address */}
                <div>
                  <label htmlFor="student-address" className="field-label">
                    <span>
                      Residential address <span className="req">*</span>
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
                    placeholder="e.g. Village/Town, Majdia West, Gorabazar, Berhampore, Murshidabad…"
                    className="field"
                    {...fieldProps('address')}
                  />
                  {fieldError('address')}
                </div>

                {/* Course Selection */}
                <div>
                  <label htmlFor="student-course" className="field-label">
                    <span>
                      Course <span className="req">*</span>
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
                      Select a course…
                    </option>
                    {COURSE_STREAMS.map((stream) => (
                      <optgroup key={stream.slug} label={stream.stream}>
                        {stream.courses.map((course) => (
                          <option key={course.slug} value={course.slug}>
                            {course.name} ({stream.stream})
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
                      Questions or notes <span className="sub">(optional)</span>
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
                    placeholder="Any batch timing requests or questions…"
                    className="field"
                    {...fieldProps('message')}
                  />
                  {fieldError('message')}
                </div>

                {/* Security verification container */}
                <div id="turnstile-container" aria-label="Security check" />

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="btn btn--primary btn--lg btn--block"
                >
                  {status === 'submitting' ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      Submitting registration…
                    </>
                  ) : (
                    `Complete registration (${batchType})`
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
              <h3>Check your registration</h3>
              <p className="sub" style={{ marginTop: 4 }}>
                Enter the 10-digit mobile number you registered with.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="lookup-phone" className="sr-only">
                Mobile number
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
                placeholder="10-digit mobile number…"
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
                Find registration
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
                  <h3>No registration found for {lookupPhone ? `+91 ${lookupPhone}` : 'this number'}.</h3>
                  <p className="sub">Check the number, or register as a new student.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="btn btn--primary"
                    style={{ marginTop: 12 }}
                  >
                    Register as a student
                  </button>
                </div>
              ) : (
                <div className="stack">
                  <p className="sub">
                    {lookupResults.length} registration{lookupResults.length > 1 ? 's' : ''} found
                  </p>
                  {lookupResults.map((record) => (
                    <article key={record.id} className="record stack">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="sub" style={{ font: 'var(--type-caption)' }}>
                            Student registration
                          </p>
                          <h4 style={{ font: 'var(--type-heading)', overflowWrap: 'anywhere' }}>{record.name}</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="chip">{record.batchType}</span>
                          <span className="chip chip--solid">Application received</span>
                        </div>
                      </div>
                      <dl>
                        <div>
                          <dt>Course</dt>
                          <dd>
                            {record.courseName} <span className="sub">({record.stream})</span>
                          </dd>
                        </div>
                        <div>
                          <dt>Mobile number</dt>
                          <dd className="tabular-nums">{record.phone}</dd>
                        </div>
                        <div>
                          <dt>Gender</dt>
                          <dd>{record.gender}</dd>
                        </div>
                        <div>
                          <dt>Registered</dt>
                          <dd>
                            {new Date(record.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </dd>
                        </div>
                        <div className="wide">
                          <dt>Residential address</dt>
                          <dd>{record.address}</dd>
                        </div>
                        {record.message && (
                          <div className="wide">
                            <dt>Questions or notes</dt>
                            <dd style={{ fontWeight: 400 }}>{record.message}</dd>
                          </div>
                        )}
                      </dl>
                      <p className="fineprint" style={{ fontSize: 'var(--size-caption)' }}>
                        Registration ID <span className="font-mono">{record.id}</span>
                      </p>
                    </article>
                  ))}
                </div>
              ))}
          </div>
        )}
      </div>
      <aside className="callout" aria-label="After you register">
        <p className="callout__head">After you register</p>
        <ol>
          <li>We call you back about the course and batch timing.</li>
          <li>You visit the campus in Gorabazar and meet the faculty.</li>
          <li>You complete your enrolment.</li>
        </ol>
        <p className="fineprint">
          Prefer to talk first? Call{' '}
          <a className="link" href={SITE.phoneTel}>
            {SITE.phoneDisplay}
          </a>{' '}
          or{' '}
          <a className="link" href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
            WhatsApp us
          </a>
          .
        </p>
      </aside>
      </div>
    </section>
  );
}
