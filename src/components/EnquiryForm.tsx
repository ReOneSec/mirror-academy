'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { COURSE_STREAMS, ALL_COURSES } from '@/lib/constants';
import { COURSE_EVENT, announceCourse } from '@/lib/courseSelection';
import {
  CheckCircleIcon,
  AlertCircleIcon,
  SearchIcon,
  UserCheckIcon,
  SparklesIcon,
} from '@/components/Icons';
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

  // A course deep link (?course=wbcs) or answer sheet selection arrives pre-filled
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('course');
    if (slug && ALL_COURSES.some((c) => c.slug === slug)) {
      setSelectedCourseSlug(slug);
    }

    const onCourse = (e: Event) => {
      const courseSlug = (e as CustomEvent<string>).detail;
      if (courseSlug && ALL_COURSES.some((c) => c.slug === courseSlug)) {
        setSelectedCourseSlug(courseSlug);
      }
    };
    window.addEventListener(COURSE_EVENT, onCourse);
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

  return (
    <section id="registration" className="border-t border-rule bg-sheet py-20 sm:py-28 scroll-mt-16">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        {/* Section Header */}
        <div className="mb-8 text-center sm:text-left">
          <h2 className="w-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Register as a student
          </h2>
          <p className="mt-2 text-base text-muted">
            Select your batch type, fill in your details, or view your submitted response anytime.
          </p>
        </div>

        {/* Top Navigation Tabs */}
        <div
          className="mb-8 flex rounded-xl border border-rule bg-paper p-1 shadow-xs"
          role="tablist"
          aria-label="Student Registration and Response Preview Tabs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'register'}
            onClick={() => setActiveTab('register')}
            className={`flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition-all touch-action-manipulation ${
              activeTab === 'register'
                ? 'bg-ink text-white shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
          >
            Register as a student
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
            className={`flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition-all touch-action-manipulation ${
              activeTab === 'lookup'
                ? 'bg-ink text-white shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
          >
            View response preview
          </button>
        </div>

        {/* Tab 1: Registration Form */}
        {activeTab === 'register' && (
          <div className="rounded-2xl border border-rule bg-white p-6 shadow-sm sm:p-8">
            {status === 'success' ? (
              <div className="text-center py-4" role="alert" aria-live="polite">
                <CheckCircleIcon className="mx-auto mb-4 h-12 w-12 text-success" aria-hidden="true" />
                <h3 className="mb-2 text-xl font-bold text-ink">
                  Registration submitted!
                </h3>
                <p className="mb-6 text-sm text-muted">
                  Your student application has been recorded in the Mirror Academy database. We will call you back soon to confirm batch timings.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={() => switchToLookupWithPhone(lastRegisteredPhone)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-ink hover:bg-gold-2 transition-colors touch-action-manipulation"
                  >
                    <UserCheckIcon className="h-4 w-4" aria-hidden="true" />
                    Preview your response card
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="rounded-lg border border-ink/20 px-4 py-2.5 text-sm font-medium text-ink hover:bg-ink/5 touch-action-manipulation"
                  >
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
                className="space-y-6"
              >
                {status === 'error' && (
                  <div
                    className="flex items-start gap-3 rounded-lg border border-error/20 bg-error/5 p-4"
                    role="alert"
                    aria-live="polite"
                  >
                    <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-error" aria-hidden="true" />
                    <p className="text-sm text-error">{errorMessage}</p>
                  </div>
                )}

                {/* Batch Selection: 2 options (Free batch / Paid batch) */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink">
                    Select batch type <span className="text-error">*</span>
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setBatchType('Free batch')}
                      className={`relative flex flex-col items-start rounded-xl border p-4 text-left transition-all touch-action-manipulation ${
                        batchType === 'Free batch'
                          ? 'border-gold bg-gold/10 ring-2 ring-gold'
                          : 'border-rule bg-white hover:border-slate/40'
                      }`}
                    >
                      <div className="mb-1 flex w-full items-center justify-between">
                        <span className="font-bold text-ink">Free batch</span>
                        <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs font-semibold text-ink">
                          Orientation
                        </span>
                      </div>
                      <p className="text-xs text-muted">
                        Introductory lectures, syllabus overview &amp; guidance sessions.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBatchType('Paid batch')}
                      className={`relative flex flex-col items-start rounded-xl border p-4 text-left transition-all touch-action-manipulation ${
                        batchType === 'Paid batch'
                          ? 'border-gold bg-gold/10 ring-2 ring-gold'
                          : 'border-rule bg-white hover:border-slate/40'
                      }`}
                    >
                      <div className="mb-1 flex w-full items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold text-ink">
                          <SparklesIcon className="h-4 w-4 text-gold" aria-hidden="true" />
                          Paid batch
                        </span>
                        <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-ink">
                          Full Course
                        </span>
                      </div>
                      <p className="text-xs text-muted">
                        Complete exam curriculum, daily mock tests &amp; dedicated faculty.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Student Name */}
                <div>
                  <label htmlFor="student-name" className="mb-1.5 block text-sm font-medium text-ink">
                    Student name <span className="text-error">*</span>
                  </label>
                  <input
                    id="student-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={100}
                    placeholder="e.g. Rahim Sheikh…"
                    className="w-full rounded-lg border border-rule bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/60 focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
                    aria-invalid={!!fieldErrors.name}
                    aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                  />
                  {fieldErrors.name && (
                    <p id="name-error" className="mt-1 text-xs text-error" role="alert">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* Contact Number */}
                <div>
                  <label htmlFor="student-phone" className="mb-1.5 block text-sm font-medium text-ink">
                    Contact number (Mobile) <span className="text-error">*</span>
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
                    className="w-full rounded-lg border border-rule bg-white px-4 py-2.5 text-sm text-ink tabular-nums placeholder:text-muted/60 focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
                    spellCheck={false}
                    aria-invalid={!!fieldErrors.phone}
                    aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
                  />
                  <p className="mt-1 text-xs text-muted">
                    This number will also be used to check your response preview.
                  </p>
                  {fieldErrors.phone && (
                    <p id="phone-error" className="mt-1 text-xs text-error" role="alert">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">
                    Gender <span className="text-error">*</span>
                  </label>
                  <div className="flex gap-6">
                    {(['Male', 'Female'] as GenderType[]).map((g) => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink">
                        <input
                          type="radio"
                          name="genderRadio"
                          checked={gender === g}
                          onChange={() => setGender(g)}
                          className="h-4 w-4 accent-ink"
                        />
                        {g}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Residential Address */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="student-address" className="text-sm font-medium text-ink">
                      Residential address <span className="text-error">*</span>
                    </label>
                    <span className="text-xs text-muted">
                      {addressText.length}/300
                    </span>
                  </div>
                  <textarea
                    id="student-address"
                    name="address"
                    rows={2}
                    maxLength={300}
                    value={addressText}
                    onChange={(e) => setAddressText(e.target.value.slice(0, 300))}
                    required
                    placeholder="e.g. Village/Town, Majdia West, Gorabazar, Berhampore, Murshidabad…"
                    className="w-full rounded-lg border border-rule bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/60 focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
                    aria-invalid={!!fieldErrors.address}
                    aria-describedby={fieldErrors.address ? 'address-error' : undefined}
                  />
                  {fieldErrors.address && (
                    <p id="address-error" className="mt-1 text-xs text-error" role="alert">
                      {fieldErrors.address}
                    </p>
                  )}
                </div>

                {/* Course Selection */}
                <div>
                  <label htmlFor="student-course" className="mb-1.5 block text-sm font-medium text-ink">
                    Course interested in <span className="text-error">*</span>
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
                    className="w-full rounded-lg border border-rule bg-white px-4 py-2.5 text-sm text-ink focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
                    aria-invalid={!!fieldErrors.courseSlug}
                    aria-describedby={fieldErrors.courseSlug ? 'course-error' : undefined}
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
                  {fieldErrors.courseSlug && (
                    <p id="course-error" className="mt-1 text-xs text-error" role="alert">
                      {fieldErrors.courseSlug}
                    </p>
                  )}
                </div>

                {/* Optional Message / Notes with 400 char limit */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="student-message" className="text-sm font-medium text-ink">
                      Questions or notes <span className="font-normal text-muted">(optional)</span>
                    </label>
                    <span className="text-xs text-muted">
                      {messageText.length}/400
                    </span>
                  </div>
                  <textarea
                    id="student-message"
                    name="message"
                    rows={2}
                    maxLength={400}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value.slice(0, 400))}
                    placeholder="Any specific batch timing requests or questions (max 400 characters)…"
                    className="w-full rounded-lg border border-rule bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/60 focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
                    aria-invalid={!!fieldErrors.message}
                    aria-describedby={fieldErrors.message ? 'message-error' : undefined}
                  />
                  {fieldErrors.message && (
                    <p id="message-error" className="mt-1 text-xs text-error" role="alert">
                      {fieldErrors.message}
                    </p>
                  )}
                </div>

                {/* Security verification container */}
                <div id="turnstile-container" className="min-h-[10px]" aria-label="Security check" />

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full rounded-lg bg-gold px-6 py-3.5 text-sm font-bold text-ink transition-colors hover:bg-gold-2 disabled:cursor-not-allowed disabled:opacity-60 touch-action-manipulation"
                >
                  {status === 'submitting' ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" aria-hidden="true" />
                      Submitting registration…
                    </span>
                  ) : (
                    `Complete registration (${batchType})`
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: View Response Preview */}
        {activeTab === 'lookup' && (
          <div className="rounded-2xl border border-rule bg-white p-6 shadow-sm sm:p-8">
            <h3 className="w-display text-xl font-bold text-ink">
              Check registration response
            </h3>
            <p className="mt-1 mb-6 text-sm text-muted">
              Enter the 10-digit contact number you used while registering.
            </p>

            {/* Phone search input */}
            <div className="mb-6 flex flex-col gap-2 sm:flex-row">
              <input
                type="tel"
                value={lookupPhone}
                onChange={(e) => setLookupPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLookup();
                  }
                }}
                placeholder="Enter 10-digit contact number…"
                maxLength={10}
                className="flex-1 rounded-lg border border-rule bg-white px-4 py-2.5 text-sm text-ink tabular-nums placeholder:text-muted/60 focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
              />
              <button
                type="button"
                onClick={() => handleLookup()}
                disabled={lookupLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ink-2 disabled:opacity-60 touch-action-manipulation"
              >
                {lookupLoading ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                ) : (
                  <SearchIcon className="h-4 w-4" aria-hidden="true" />
                )}
                Find response
              </button>
            </div>

            {lookupError && (
              <div
                className="mb-6 flex items-start gap-3 rounded-lg border border-error/20 bg-error/5 p-4"
                role="alert"
              >
                <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-error" aria-hidden="true" />
                <p className="text-sm text-error">{lookupError}</p>
              </div>
            )}

            {/* Results display */}
            {lookupResults && (
              <div className="space-y-6">
                {lookupResults.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-rule p-8 text-center">
                    <p className="text-sm font-semibold text-ink">
                      No registration found for {lookupPhone ? `+91 ${lookupPhone}` : 'this number'}.
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Please check the number or complete a new student registration below.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="mt-4 inline-block rounded-lg bg-gold px-4 py-2 text-xs font-bold text-ink hover:bg-gold-2 touch-action-manipulation"
                    >
                      Register as a student
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-muted">
                      Found {lookupResults.length} registration record{lookupResults.length > 1 ? 's' : ''}:
                    </p>

                    {lookupResults.map((record) => (
                      <div
                        key={record.id}
                        className="overflow-hidden rounded-xl border border-rule bg-sheet p-5 shadow-xs transition-all hover:border-gold"
                      >
                        {/* Record Card Header */}
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-rule pb-3">
                          <div>
                            <span className="text-xs text-muted">Student Registration</span>
                            <h4 className="text-base font-bold text-ink break-words [overflow-wrap:anywhere]">{record.name}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                record.batchType === 'Paid batch'
                                  ? 'bg-gold text-ink'
                                  : 'bg-ink/10 text-ink'
                              }`}
                            >
                              {record.batchType}
                            </span>
                            <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-bold text-success">
                              Application Received
                            </span>
                          </div>
                        </div>

                        {/* Record Details Grid */}
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 text-xs">
                          <div>
                            <dt className="text-muted">Selected Course</dt>
                            <dd className="font-semibold text-ink">
                              {record.courseName} <span className="font-normal text-muted">({record.stream})</span>
                            </dd>
                          </div>

                          <div>
                            <dt className="text-muted">Contact Number</dt>
                            <dd className="font-semibold text-ink tabular-nums">{record.phone}</dd>
                          </div>

                          <div>
                            <dt className="text-muted">Gender</dt>
                            <dd className="font-semibold text-ink">{record.gender}</dd>
                          </div>

                          <div>
                            <dt className="text-muted">Registered Date</dt>
                            <dd className="font-semibold text-ink">
                              {new Date(record.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </dd>
                          </div>

                          <div className="sm:col-span-2">
                            <dt className="text-muted">Residential Address</dt>
                            <dd className="font-medium text-ink break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{record.address}</dd>
                          </div>

                          {record.message && (
                            <div className="sm:col-span-2">
                              <dt className="text-muted">Remarks / Questions</dt>
                              <dd className="font-normal text-muted break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{record.message}</dd>
                            </div>
                          )}
                        </dl>

                        <div className="mt-4 border-t border-rule pt-3 text-[11px] text-muted">
                          Registration ID: <span className="font-mono text-muted/70">{record.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
