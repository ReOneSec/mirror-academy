'use client';

import { useState, useRef, type FormEvent } from 'react';
import { COURSE_STREAMS } from '@/lib/constants';
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

  // Registration state
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [lastRegisteredPhone, setLastRegisteredPhone] = useState<string>('');

  // Lookup state
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookupResults, setLookupResults] = useState<RegistrationRecord[] | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  // Form submit handler
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string)?.trim() ?? '';
    const phone = (formData.get('phone') as string)?.trim() ?? '';
    const courseSlug = (formData.get('courseSlug') as string) ?? '';
    const address = (formData.get('address') as string)?.trim() ?? '';
    const message = (formData.get('message') as string)?.trim() ?? '';

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
    <section id="registration" className="bg-chalk py-16 sm:py-20 scroll-mt-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-8 text-center sm:text-left">
          <h2 className="mb-2 text-2xl font-bold text-navy sm:text-3xl">
            Register as a student
          </h2>
          <p className="text-sm text-slate">
            Select your batch type, fill in your details, or view your submitted response anytime.
          </p>
        </div>

        {/* Top Navigation Tabs */}
        <div
          className="mb-8 flex rounded-xl border border-slate/20 bg-white p-1 shadow-xs"
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
                ? 'bg-navy text-white shadow-xs'
                : 'text-slate hover:text-navy'
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
                ? 'bg-navy text-white shadow-xs'
                : 'text-slate hover:text-navy'
            }`}
          >
            View response preview
          </button>
        </div>

        {/* Tab 1: Registration Form */}
        {activeTab === 'register' && (
          <div className="rounded-2xl border border-slate/15 bg-white p-6 shadow-sm sm:p-8">
            {status === 'success' ? (
              <div className="text-center py-4" role="alert" aria-live="polite">
                <CheckCircleIcon className="mx-auto mb-4 h-12 w-12 text-success" aria-hidden="true" />
                <h3 className="mb-2 text-xl font-bold text-navy">
                  Registration submitted!
                </h3>
                <p className="mb-6 text-sm text-slate">
                  Your student application has been recorded in the Mirror Academy database. We will call you back soon to confirm batch timings.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={() => switchToLookupWithPhone(lastRegisteredPhone)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-navy hover:bg-gold-hover transition-colors touch-action-manipulation"
                  >
                    <UserCheckIcon className="h-4 w-4" aria-hidden="true" />
                    Preview your response card
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="rounded-lg border border-navy/20 px-4 py-2.5 text-sm font-medium text-navy hover:bg-navy/5 touch-action-manipulation"
                  >
                    Register another student
                  </button>
                </div>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6">
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
                  <label className="mb-2 block text-sm font-semibold text-navy">
                    Select batch type <span className="text-error">*</span>
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setBatchType('Free batch')}
                      className={`relative flex flex-col items-start rounded-xl border p-4 text-left transition-all touch-action-manipulation ${
                        batchType === 'Free batch'
                          ? 'border-gold bg-gold/10 ring-2 ring-gold'
                          : 'border-slate/20 bg-white hover:border-slate/40'
                      }`}
                    >
                      <div className="mb-1 flex w-full items-center justify-between">
                        <span className="font-bold text-navy">Free batch</span>
                        <span className="rounded-full bg-navy/10 px-2 py-0.5 text-xs font-semibold text-navy">
                          Orientation
                        </span>
                      </div>
                      <p className="text-xs text-slate">
                        Introductory lectures, syllabus overview &amp; guidance sessions.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBatchType('Paid batch')}
                      className={`relative flex flex-col items-start rounded-xl border p-4 text-left transition-all touch-action-manipulation ${
                        batchType === 'Paid batch'
                          ? 'border-gold bg-gold/10 ring-2 ring-gold'
                          : 'border-slate/20 bg-white hover:border-slate/40'
                      }`}
                    >
                      <div className="mb-1 flex w-full items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold text-navy">
                          <SparklesIcon className="h-4 w-4 text-gold" aria-hidden="true" />
                          Paid batch
                        </span>
                        <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-navy">
                          Full Course
                        </span>
                      </div>
                      <p className="text-xs text-slate">
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
                    className="w-full rounded-lg border border-slate/20 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slate/50 focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
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
                    className="w-full rounded-lg border border-slate/20 bg-white px-4 py-2.5 text-sm text-ink tabular-nums placeholder:text-slate/50 focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
                    spellCheck={false}
                    aria-invalid={!!fieldErrors.phone}
                    aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
                  />
                  <p className="mt-1 text-xs text-slate">
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
                          className="h-4 w-4 accent-navy"
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
                    <span className="text-xs text-slate">
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
                    className="w-full rounded-lg border border-slate/20 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slate/50 focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
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
                    defaultValue=""
                    className="w-full rounded-lg border border-slate/20 bg-white px-4 py-2.5 text-sm text-ink focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
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
                      Questions or notes <span className="font-normal text-slate">(optional)</span>
                    </label>
                    <span className="text-xs text-slate">
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
                    className="w-full rounded-lg border border-slate/20 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slate/50 focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
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
                  className="w-full rounded-lg bg-gold px-6 py-3.5 text-sm font-bold text-navy transition-colors hover:bg-gold-hover disabled:cursor-not-allowed disabled:opacity-60 touch-action-manipulation"
                >
                  {status === 'submitting' ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-navy/30 border-t-navy" aria-hidden="true" />
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
          <div className="rounded-2xl border border-slate/15 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="mb-1 text-lg font-bold text-navy">
              Check registration response
            </h3>
            <p className="mb-6 text-sm text-slate">
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
                className="flex-1 rounded-lg border border-slate/20 bg-white px-4 py-2.5 text-sm text-ink tabular-nums placeholder:text-slate/50 focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
              />
              <button
                type="button"
                onClick={() => handleLookup()}
                disabled={lookupLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-light disabled:opacity-60 touch-action-manipulation"
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
                  <div className="rounded-xl border border-dashed border-slate/30 p-8 text-center">
                    <p className="text-sm font-semibold text-navy">
                      No registration found for {lookupPhone ? `+91 ${lookupPhone}` : 'this number'}.
                    </p>
                    <p className="mt-1 text-xs text-slate">
                      Please check the number or complete a new student registration below.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="mt-4 inline-block rounded-lg bg-gold px-4 py-2 text-xs font-bold text-navy hover:bg-gold-hover touch-action-manipulation"
                    >
                      Register as a student
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-slate">
                      Found {lookupResults.length} registration record{lookupResults.length > 1 ? 's' : ''}:
                    </p>

                    {lookupResults.map((record) => (
                      <div
                        key={record.id}
                        className="overflow-hidden rounded-xl border border-navy/15 bg-chalk/50 p-5 shadow-xs transition-all hover:border-gold"
                      >
                        {/* Record Card Header */}
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate/15 pb-3">
                          <div>
                            <span className="text-xs text-slate">Student Registration</span>
                            <h4 className="text-base font-bold text-navy">{record.name}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                record.batchType === 'Paid batch'
                                  ? 'bg-gold text-navy'
                                  : 'bg-navy/10 text-navy'
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
                            <dt className="text-slate">Selected Course</dt>
                            <dd className="font-semibold text-navy">
                              {record.courseName} <span className="font-normal text-slate">({record.stream})</span>
                            </dd>
                          </div>

                          <div>
                            <dt className="text-slate">Contact Number</dt>
                            <dd className="font-semibold text-navy tabular-nums">{record.phone}</dd>
                          </div>

                          <div>
                            <dt className="text-slate">Gender</dt>
                            <dd className="font-semibold text-navy">{record.gender}</dd>
                          </div>

                          <div>
                            <dt className="text-slate">Registered Date</dt>
                            <dd className="font-semibold text-navy">
                              {new Date(record.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </dd>
                          </div>

                          <div className="sm:col-span-2">
                            <dt className="text-slate">Residential Address</dt>
                            <dd className="font-medium text-navy break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{record.address}</dd>
                          </div>

                          {record.message && (
                            <div className="sm:col-span-2">
                              <dt className="text-slate">Remarks / Questions</dt>
                              <dd className="font-normal text-slate break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{record.message}</dd>
                            </div>
                          )}
                        </dl>

                        <div className="mt-4 border-t border-slate/10 pt-3 text-[11px] text-slate">
                          Registration ID: <span className="font-mono text-slate/70">{record.id}</span>
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
