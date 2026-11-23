'use client';

import { useEffect, useState, useRef, type FormEvent } from 'react';
import { COURSE_STREAMS, ALL_COURSES, SITE } from '@/lib/constants';
import { announceCourse } from '@/lib/courseSelection';
import Icon from '@/components/icons/Icon';
import type { EnquiryFormData, EnquiryResponse } from '@/types';

function validatePhone(phone: string): boolean {
  // Indian mobile: 10 digits, starts with 6-9
  return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

function FieldError({ id, text }: { id: string; text?: string }) {
  if (!text) return null;
  return (
    <p id={id} className="mt-2 flex items-start gap-2 text-[0.95rem] text-error [--ki-a:#b42318] [--ki-b:#e1a7a3]">
      <Icon name="circle-alert" size={16} className="mt-[3px]" />
      {text}
    </p>
  );
}

export default function EnquiryForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const dirtyRef = useRef(false);

  // A course deep link (?course=wbcs, from the answer sheet) arrives pre-filled
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('course');
    const select = document.getElementById('enquiry-course') as HTMLSelectElement | null;
    if (slug && select && ALL_COURSES.some((c) => c.slug === slug)) {
      select.value = slug;
      announceCourse(slug);
    }
  }, []);

  // Warn before leaving with a half-filled form
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

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
    if (!data.name) errors.name = 'Enter your name.';
    if (!data.phone) {
      errors.phone = 'Enter your phone number.';
    } else if (!validatePhone(data.phone)) {
      errors.phone = 'Enter a 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
    }
    if (!data.courseSlug) errors.courseSlug = 'Choose a course from the list.';

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
        dirtyRef.current = false;
        formRef.current?.reset();
        announceCourse('');
      } else {
        setStatus('error');
        setErrorMessage(result.message || `The enquiry was not sent. Try again, or call ${SITE.phone}.`);
      }
    } catch {
      setStatus('error');
      setErrorMessage('The enquiry could not reach the server. Check your connection and try again.');
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
    <section id="enquiry" aria-labelledby="enquiry-heading" className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[22rem_1fr] lg:gap-20">
        <div>
          <h2
            id="enquiry-heading"
            className="w-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl"
          >
            Send an Enquiry
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            Leave your name, phone number and course, and Mirror Academy will call you back.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              'Three required fields, nothing else',
              `Choose from all ${ALL_COURSES.length} courses`,
              'Get a call back to talk it through',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Icon name="circle-check" size={20} className="mt-0.5" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10 border-t border-rule pt-6">
            <p className="text-muted">Prefer to talk?</p>
            <a
              href={SITE.phoneTel}
              className="mt-1 inline-flex items-center gap-3 text-2xl font-bold tabular-nums underline-offset-[6px] hover:underline hover:decoration-gold hover:decoration-[3px]"
            >
              <Icon name="phone" size={24} />
              <span>
                <span className="sr-only">Call </span>
                {SITE.phoneDisplay}
              </span>
            </a>
          </div>
        </div>

        <div className="rounded-lg border border-rule bg-sheet p-5 sm:p-9">
          {status === 'success' ? (
            <div className="py-8" role="status" aria-live="polite">
              <Icon name="circle-check" size={32} />
              <h3 className="w-display mt-5 text-3xl font-bold">Enquiry Sent</h3>
              <p className="mt-3 max-w-md leading-relaxed text-muted">
                Mirror Academy will call you back soon. For anything urgent, call{' '}
                <a
                  href={SITE.phoneTel}
                  className="font-semibold text-ink underline underline-offset-4 tabular-nums"
                >
                  {SITE.phone}
                </a>
                .
              </p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="mt-8 rounded-md border border-ink px-5 py-3 font-semibold transition-colors hover:bg-ink hover:text-white"
              >
                Send Another Enquiry
              </button>
            </div>
          ) : (
            <>
              {status === 'error' && (
                <div
                  className="mb-6 flex items-start gap-3 rounded-md border border-error/40 bg-error/[0.06] p-4 [--ki-a:#b42318] [--ki-b:#e1a7a3]"
                  role="alert"
                >
                  <Icon name="circle-alert" size={20} className="mt-px" />
                  <p className="text-[0.95rem] text-error">{errorMessage}</p>
                </div>
              )}

              <form
                ref={formRef}
                onSubmit={handleSubmit}
                onInput={() => {
                  dirtyRef.current = true;
                }}
                noValidate
                className="grid gap-6 sm:grid-cols-2"
                aria-describedby="enquiry-required-note"
              >
                <div>
                  <label htmlFor="enquiry-name" className="mb-2 block font-semibold">
                    Your name <span className="text-error" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="enquiry-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="e.g. Rahim Sheikh…"
                    onInput={() => clearFieldError('name')}
                    className="field"
                    aria-invalid={!!fieldErrors.name}
                    aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                  />
                  <FieldError id="name-error" text={fieldErrors.name} />
                </div>

                <div>
                  <label htmlFor="enquiry-phone" className="mb-2 block font-semibold">
                    Phone number <span className="text-error" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <span
                      className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted tabular-nums"
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
                      placeholder="9876543210…"
                      maxLength={10}
                      onInput={() => clearFieldError('phone')}
                      className="field pl-12 tabular-nums"
                      spellCheck={false}
                      aria-invalid={!!fieldErrors.phone}
                      aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
                    />
                  </div>
                  <FieldError id="phone-error" text={fieldErrors.phone} />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="enquiry-course" className="mb-2 block font-semibold">
                    Course interested in <span className="text-error" aria-hidden="true">*</span>
                  </label>
                  <select
                    id="enquiry-course"
                    name="courseSlug"
                    required
                    defaultValue=""
                    onChange={(e) => {
                      clearFieldError('courseSlug');
                      announceCourse(e.currentTarget.value);
                    }}
                    className="field"
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
                  <FieldError id="course-error" text={fieldErrors.courseSlug} />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="enquiry-message" className="mb-2 block font-semibold">
                    Message <span className="font-normal text-muted">(optional)</span>
                  </label>
                  <textarea
                    id="enquiry-message"
                    name="message"
                    rows={4}
                    autoComplete="off"
                    placeholder="e.g. Batch timings or fees…"
                    className="field resize-y"
                  />
                </div>

                {/* Cloudflare Turnstile widget is injected here when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set */}
                <div
                  id="turnstile-container"
                  className="empty:hidden sm:col-span-2"
                  aria-label="Security verification"
                />

                <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    aria-busy={status === 'submitting'}
                    className="inline-flex items-center justify-center gap-2.5 rounded-md bg-ink px-7 py-3.5 text-[1.0625rem] font-semibold text-white transition-colors hover:bg-ink-2 disabled:cursor-wait disabled:bg-ink-2"
                  >
                    {status === 'submitting' && (
                      <span
                        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-gold motion-reduce:animate-none"
                        aria-hidden="true"
                      />
                    )}
                    {status === 'submitting' ? 'Sending…' : 'Send Enquiry'}
                  </button>
                  <p id="enquiry-required-note" className="text-[0.95rem] text-muted">
                    Fields marked <span className="text-error">*</span> are required.
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
