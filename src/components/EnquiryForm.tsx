'use client';

import { useState, useRef, type FormEvent } from 'react';
import { COURSE_STREAMS, ALL_COURSES } from '@/lib/constants';
import { CheckCircleIcon, AlertCircleIcon } from '@/components/Icons';
import type { EnquiryFormData, EnquiryResponse } from '@/types';

function validatePhone(phone: string): boolean {
  // Indian mobile: 10 digits, starts with 6-9
  return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

export default function EnquiryForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const firstErrorRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);

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
      const turnstileToken =
        (window as Record<string, unknown>).turnstileToken as string | undefined;

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
      setErrorMessage(
        'Could not connect to the server. Check your internet and try again.'
      );
    }
  }

  if (status === 'success') {
    return (
      <section id="enquiry" className="bg-chalk py-16 sm:py-20">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          <div
            className="rounded-xl border border-success/20 bg-success/5 p-8 text-center"
            role="alert"
            aria-live="polite"
          >
            <CheckCircleIcon className="mx-auto mb-4 h-12 w-12 text-success" aria-hidden="true" />
            <h2 className="mb-2 text-xl font-bold text-navy">
              Enquiry received
            </h2>
            <p className="text-sm text-slate">
              We will call you back soon. If you need immediate help, call{' '}
              <a href="tel:9732424300" className="font-medium text-navy underline">
                9732424300
              </a>.
            </p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-6 rounded-lg border border-navy/20 px-4 py-2 text-sm font-medium text-navy hover:bg-navy/5 touch-action-manipulation"
            >
              Send another enquiry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="enquiry" className="bg-chalk py-16 sm:py-20">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <h2 className="mb-2 text-2xl font-bold text-navy sm:text-3xl">
          Send us an enquiry
        </h2>
        <p className="mb-8 text-sm text-slate">
          Fill in your details and we\u2019ll call you back.
        </p>

        {status === 'error' && (
          <div
            className="mb-6 flex items-start gap-3 rounded-lg border border-error/20 bg-error/5 p-4"
            role="alert"
            aria-live="polite"
          >
            <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-error" aria-hidden="true" />
            <p className="text-sm text-error">{errorMessage}</p>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="enquiry-name" className="mb-1.5 block text-sm font-medium text-ink">
              Your name
            </label>
            <input
              id="enquiry-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="e.g. Rahim Sheikh\u2026"
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

          {/* Phone */}
          <div>
            <label htmlFor="enquiry-phone" className="mb-1.5 block text-sm font-medium text-ink">
              Phone number
            </label>
            <input
              id="enquiry-phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              required
              placeholder="e.g. 9876543210\u2026"
              maxLength={10}
              className="w-full rounded-lg border border-slate/20 bg-white px-4 py-2.5 text-sm text-ink tabular-nums placeholder:text-slate/50 focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
              spellCheck={false}
              aria-invalid={!!fieldErrors.phone}
              aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
            />
            {fieldErrors.phone && (
              <p id="phone-error" className="mt-1 text-xs text-error" role="alert">
                {fieldErrors.phone}
              </p>
            )}
          </div>

          {/* Course dropdown */}
          <div>
            <label htmlFor="enquiry-course" className="mb-1.5 block text-sm font-medium text-ink">
              Course interested in
            </label>
            <select
              id="enquiry-course"
              name="courseSlug"
              required
              defaultValue=""
              className="w-full rounded-lg border border-slate/20 bg-white px-4 py-2.5 text-sm text-ink focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
              aria-invalid={!!fieldErrors.courseSlug}
              aria-describedby={fieldErrors.courseSlug ? 'course-error' : undefined}
            >
              <option value="" disabled>
                Select a course\u2026
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
              <p id="course-error" className="mt-1 text-xs text-error" role="alert">
                {fieldErrors.courseSlug}
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label htmlFor="enquiry-message" className="mb-1.5 block text-sm font-medium text-ink">
              Message <span className="font-normal text-slate">(optional)</span>
            </label>
            <textarea
              id="enquiry-message"
              name="message"
              rows={3}
              placeholder="Any questions or preferences\u2026"
              className="w-full rounded-lg border border-slate/20 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slate/50 focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
            />
          </div>

          {/* Turnstile placeholder */}
          <div
            id="turnstile-container"
            className="min-h-[65px]"
            aria-label="Security verification"
          >
            {/* Cloudflare Turnstile widget will be injected here when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set */}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full rounded-lg bg-gold px-6 py-3 text-sm font-bold text-navy transition-colors hover:bg-gold-hover disabled:cursor-not-allowed disabled:opacity-60 touch-action-manipulation"
          >
            {status === 'submitting' ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-navy/30 border-t-navy" aria-hidden="true" />
                Sending\u2026
              </span>
            ) : (
              'Send enquiry'
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
