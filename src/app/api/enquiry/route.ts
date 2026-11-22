import { NextRequest, NextResponse } from 'next/server';
import type { EnquiryResponse } from '@/types';
import { ALL_COURSES } from '@/lib/constants';

// Simple in-memory rate limiter (per-IP, 5 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function validatePhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json<EnquiryResponse>(
      {
        success: false,
        message:
          'Too many requests. Please wait a minute and try again.',
      },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<EnquiryResponse>(
      { success: false, message: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const name = (typeof body.name === 'string' ? body.name : '').trim();
  const phone = (typeof body.phone === 'string' ? body.phone : '').trim();
  const courseSlug = typeof body.courseSlug === 'string' ? body.courseSlug : '';
  const message = (typeof body.message === 'string' ? body.message : '').trim();
  const turnstileToken = typeof body.turnstileToken === 'string' ? body.turnstileToken : '';

  // Validate required fields
  if (!name) {
    return NextResponse.json<EnquiryResponse>(
      { success: false, message: 'Name is required.' },
      { status: 400 }
    );
  }

  if (!phone || !validatePhone(phone)) {
    return NextResponse.json<EnquiryResponse>(
      {
        success: false,
        message:
          'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
      },
      { status: 400 }
    );
  }

  if (!courseSlug || !ALL_COURSES.some((c) => c.slug === courseSlug)) {
    return NextResponse.json<EnquiryResponse>(
      { success: false, message: 'Select a valid course.' },
      { status: 400 }
    );
  }

  // Turnstile verification (if key is configured)
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret && turnstileToken) {
    try {
      const verifyRes = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: turnstileSecret,
            response: turnstileToken,
            remoteip: ip,
          }),
        }
      );
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return NextResponse.json<EnquiryResponse>(
          {
            success: false,
            message: 'Security check failed. Please refresh the page and try again.',
          },
          { status: 403 }
        );
      }
    } catch {
      // If Turnstile verification fails to connect, log and continue
      console.error('Turnstile verification failed to connect');
    }
  }

  // Insert into Supabase (if configured)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseServiceKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data, error } = await supabase
        .from('enquiries')
        .insert({
          name,
          phone,
          course_slug: courseSlug,
          message: message || null,
          status: 'new',
        })
        .select('id, created_at')
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        return NextResponse.json<EnquiryResponse>(
          {
            success: false,
            message: 'Could not save your enquiry. Please try again or call us directly.',
          },
          { status: 500 }
        );
      }

      return NextResponse.json<EnquiryResponse>({
        success: true,
        message: 'We will call you back soon.',
        id: data?.id,
        createdAt: data?.created_at,
      });
    } catch (err) {
      console.error('Supabase connection error:', err);
      return NextResponse.json<EnquiryResponse>(
        {
          success: false,
          message: 'Server error. Please try again or call us directly at 9732424300.',
        },
        { status: 500 }
      );
    }
  }

  // Fallback: Supabase not configured — log and return success for development
  console.log('Enquiry received (Supabase not configured):', {
    name,
    phone,
    courseSlug,
    message,
  });

  return NextResponse.json<EnquiryResponse>({
    success: true,
    message: 'We will call you back soon.',
    id: `dev-${Date.now()}`,
    createdAt: new Date().toISOString(),
  });
}
