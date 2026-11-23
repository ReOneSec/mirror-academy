'use client';

import { useState, useRef, type FormEvent } from 'react';
import { COURSE_STREAMS, ALL_COURSES, SITE } from '@/lib/constants';
import {
  CheckCircleIcon,
  AlertCircleIcon,
  PhoneIcon,
  CheckIcon,
  ArrowRightIcon,
} from '@/components/Icons';
import type { EnquiryFormData, EnquiryResponse } from '@/types';

function validatePhone(phone: string): boolean {
  // Indian mobile: 10 digits, starts with 6-9
  return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

const fieldBase =
  'block w-full rounded-xl border bg-white px-4 py-3.5 text-base text-ink shadow-[0_1px_2px_rgb(2_27_68/0.04)] transition placeholder:text-slate/50 focus:outline-none focus-visible:outline-none focus:ring-4 sm:text-[0.95rem]';

function fieldClass(hasError: boolean) {
  return `${fieldBase} ${
    hasError
      ? 'border-error/70 focus:border-error focus:ring-error/15'
      : 'border-line hover:border-slate/40 focus:border-navy-700 focus:ring-gold-400/30'
  }`;
}

export default function EnquiryForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const data: EnquiryFormData = {
      name: (formData.get('name') as string)?.trim() ?? '',
      phone: (formData.get('phone') as string)?.trim() ?? '',
      courseSlug: (formData.get('courseSlug') as string) ?? '',
      message: (formData.get('message') as string)?.trim() ?? '',
    };

    // Client-side validation
    const errors: Record<string, string> = {};
    if (!data.name) errors.name = 'Please enter your name.';
    if (!data.phone) {
      errors.phone = 'Please enter your phone number.';
    } else if (!validatePhone(data.phone)) {
      errors.phone = 'Enter a 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
    }
    if (!data.courseSlug) errors.courseSlug = 'Please select a course.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Focus first error field
      const firstKey = Object.keys(errors)[0];
      const el = formRef.current?.querySelector(`[name="${firstKey}"]`) as HTMLInputElement | null;
      el?.focus();
      return;
    }

    setStatus('submitting');

    try {
      // Get Turnstile token if available
      const turnstileToken = (window as unknown as Record<string, unknown>).turnstileToken as
        | string
        | undefined;

      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          turnstileToken: turnstileToken ?? '',
        }),
      });

      const result: EnquiryResponse = await res.json();

      if (result.success) {
        setStatus('success');
        formRef.current?.reset();
      } else {
        setStatus('error');
        setErrorMessage(result.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Could not connect to the server. Check your internet and try again.');
    }
  }

  function clearFieldError(name: string) {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  return (
    <section
      id="enquiry"
      aria-labelledby="enquiry-heading"
      className="relative overflow-hidden bg-paper py-20 sm:py-28"
    >
      <div className="bg-dots pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top_left,#000_20%,transparent_70%)]" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-8">
        {/* Intro column */}
        <div className="lg:pt-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
            Enquiry
          </p>
          <h2
            id="enquiry-heading"
            className="mt-3 font-display text-4xl font-semibold tracking-tight text-navy-900 sm:text-5xl"
          >
            Send us an enquiry
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-slate">
            Fill in your details and we’ll call you back.
          </p>

          <ul className="mt-8 space-y-3 text-ink">
            {['Just your name, phone and course', `All ${ALL_COURSES.length} courses to choose from`, 'We call you back'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-gold-400">
                  <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <a
            href={SITE.phoneTel}
            className="group mt-10 flex max-w-sm items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm transition hover:border-gold-400/70 hover:shadow-md"
            aria-label={`Prefer to talk? Call ${SITE.phone}`}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-400 text-navy-950">
              <PhoneIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="flex-1">
              <span className="block text-sm text-slate">Prefer to talk?</span>
              <span className="block font-display text-xl font-semibold tabular-nums text-navy-900">
                {SITE.phoneDisplay}
              </span>
            </span>
            <ArrowRightIcon className="h-5 w-5 text-slate transition-transform group-hover:translate-x-1 group-hover:text-navy-900" aria-hidden="true" />
          </a>
        </div>

        {/* Form card */}
        <div className="relative">
          <div
            className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-gold-400/30 via-transparent to-navy-700/20 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative rounded-[1.75rem] border border-line bg-white p-6 shadow-[0_40px_80px_-40px_rgb(2_27_68/0.35)] sm:p-10">
            {status === 'success' ? (
              <div className="py-10 text-center" role="status" aria-live="polite">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <CheckCircleIcon className="h-9 w-9 text-success" aria-hidden="true" />
                </span>
                <h3 className="mt-6 font-display text-3xl font-semibold text-navy-900">
                  Enquiry received
                </h3>
                <p className="mx-auto mt-3 max-w-sm text-slate">
                  We will call you back soon. If you need immediate help, call{' '}
                  <a
                    href={SITE.phoneTel}
                    className="font-semibold text-navy-900 underline underline-offset-4"
                  >
                    {SITE.phone}
                  </a>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="mt-8 rounded-full border border-navy-900/20 px-6 py-3 text-sm font-semibold text-navy-900 transition hover:border-navy-900 hover:bg-navy-900 hover:text-white"
                >
                  Send another enquiry
                </button>
              </div>
            ) : (
              <>
                {status === 'error' && (
                  <div
                    className="mb-6 flex items-start gap-3 rounded-xl border border-error/25 bg-error/5 p-4"
                    role="alert"
                    aria-live="polite"
                  >
                    <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-error" aria-hidden="true" />
                    <p className="text-sm text-error">{errorMessage}</p>
                  </div>
                )}

                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  noValidate
                  className="grid gap-5 sm:grid-cols-2"
                  aria-describedby="enquiry-required-note"
                >
                  {/* Name */}
                  <div className="sm:col-span-1">
                    <label htmlFor="enquiry-name" className="mb-2 block text-sm font-semibold text-navy-900">
                      Your name <span className="text-error" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="enquiry-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="e.g. Rahim Sheikh"
                      onInput={() => clearFieldError('name')}
                      className={fieldClass(!!fieldErrors.name)}
                      aria-invalid={!!fieldErrors.name}
                      aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                    />
                    {fieldErrors.name && (
                      <p id="name-error" className="mt-1.5 flex items-center gap-1.5 text-sm text-error">
                        <AlertCircleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="sm:col-span-1">
                    <label htmlFor="enquiry-phone" className="mb-2 block text-sm font-semibold text-navy-900">
                      Phone number <span className="text-error" aria-hidden="true">*</span>
                    </label>
                    <div className="relative">
                      <span
                        className="pointer-events-none absolute inset-y-0 left-0 flex items-center border-r border-line pl-4 pr-3 text-sm font-semibold text-slate"
                        aria-hidden="true"
                      >
                        +91
                      </span>
                      <input
                        id="enquiry-phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        required
                        placeholder="9876543210"
                        maxLength={10}
                        onInput={() => clearFieldError('phone')}
                        className={`${fieldClass(!!fieldErrors.phone)} pl-[4.25rem] tabular-nums`}
                        spellCheck={false}
                        aria-invalid={!!fieldErrors.phone}
                        aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
                      />
                    </div>
                    {fieldErrors.phone && (
                      <p id="phone-error" className="mt-1.5 flex items-start gap-1.5 text-sm text-error">
                        <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>

                  {/* Course dropdown */}
                  <div className="sm:col-span-2">
                    <label htmlFor="enquiry-course" className="mb-2 block text-sm font-semibold text-navy-900">
                      Course interested in <span className="text-error" aria-hidden="true">*</span>
                    </label>
                    <select
                      id="enquiry-course"
                      name="courseSlug"
                      required
                      defaultValue=""
                      onChange={() => clearFieldError('courseSlug')}
                      className={`${fieldClass(!!fieldErrors.courseSlug)} select-chevron pr-10`}
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
                              {course.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    {fieldErrors.courseSlug && (
                      <p id="course-error" className="mt-1.5 flex items-center gap-1.5 text-sm text-error">
                        <AlertCircleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {fieldErrors.courseSlug}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="sm:col-span-2">
                    <label htmlFor="enquiry-message" className="mb-2 block text-sm font-semibold text-navy-900">
                      Message <span className="font-normal text-slate">(optional)</span>
                    </label>
                    <textarea
                      id="enquiry-message"
                      name="message"
                      rows={4}
                      placeholder="Any questions or preferences…"
                      className={`${fieldClass(false)} resize-y`}
                    />
                  </div>

                  {/* Turnstile placeholder */}
                  <div
                    id="turnstile-container"
                    className="empty:hidden sm:col-span-2"
                    aria-label="Security verification"
                  >
                    {/* Cloudflare Turnstile widget will be injected here when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set */}
                  </div>

                  {/* Submit */}
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      aria-busy={status === 'submitting'}
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-4 text-base font-bold text-white shadow-[0_14px_30px_-12px_rgb(2_27_68/0.7)] transition hover:-translate-y-px hover:bg-navy-800 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {status === 'submitting' ? (
                        <>
                          <span
                            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-gold-400"
                            aria-hidden="true"
                          />
                          Sending…
                        </>
                      ) : (
                        <>
                          Send enquiry
                          <ArrowRightIcon className="h-5 w-5 text-gold-400 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </>
                      )}
                    </button>
                    <p id="enquiry-required-note" className="mt-3 text-center text-xs text-slate">
                      Fields marked <span className="text-error">*</span> are required.
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
