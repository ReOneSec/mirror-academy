import { NextRequest, NextResponse } from 'next/server';
import type { EnquiryResponse, LookupResponse } from '@/types';
import { ALL_COURSES } from '@/lib/constants';

// Rate limiter: 10 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
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
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json<EnquiryResponse>(
      {
        success: false,
        message: 'Too many requests. Please wait a minute and try again.',
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
  const batchType =
    body.batchType === 'Paid batch' || body.batchType === 'Interview batch'
      ? body.batchType
      : 'Free batch';
  const gender = (typeof body.gender === 'string' ? body.gender : '').trim();
  const address = (typeof body.address === 'string' ? body.address : '').trim();
  const message = (typeof body.message === 'string' ? body.message : '').trim();
  const turnstileToken = typeof body.turnstileToken === 'string' ? body.turnstileToken : '';

  // Validate required fields
  if (!name || name.length > 100) {
    return NextResponse.json<EnquiryResponse>(
      { success: false, message: 'Student name is required (maximum 100 characters).' },
      { status: 400 }
    );
  }

  if (!phone || !validatePhone(phone)) {
    return NextResponse.json<EnquiryResponse>(
      {
        success: false,
        message: 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
      },
      { status: 400 }
    );
  }

  if (!gender || !['Male', 'Female'].includes(gender)) {
    return NextResponse.json<EnquiryResponse>(
      { success: false, message: 'Please select gender (Male or Female).' },
      { status: 400 }
    );
  }

  if (!address || address.length > 300) {
    return NextResponse.json<EnquiryResponse>(
      { success: false, message: 'Residential address is required (maximum 300 characters).' },
      { status: 400 }
    );
  }

  if (message.length > 400) {
    return NextResponse.json<EnquiryResponse>(
      { success: false, message: 'Questions or notes cannot exceed 400 characters.' },
      { status: 400 }
    );
  }

  if (!courseSlug || !ALL_COURSES.some((c) => c.slug === courseSlug)) {
    return NextResponse.json<EnquiryResponse>(
      { success: false, message: 'Please select a valid course.' },
      { status: 400 }
    );
  }

  // Turnstile verification if configured
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
            message: 'Security verification failed. Please refresh and try again.',
          },
          { status: 403 }
        );
      }
    } catch {
      console.error('Turnstile verification failed to connect');
    }
  }

  // Insert into Supabase
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
          batch_type: batchType,
          gender,
          address,
          message: message || null,
          status: 'new',
        })
        .select('id, created_at')
        .single();

      if (error) {
        console.error('Supabase registration insert error:', error);
        return NextResponse.json<EnquiryResponse>(
          {
            success: false,
            message: 'Could not save your registration. Please try again or call 9732424300.',
          },
          { status: 500 }
        );
      }

      return NextResponse.json<EnquiryResponse>({
        success: true,
        message: 'Your registration has been submitted successfully.',
        id: data?.id,
        createdAt: data?.created_at,
      });
    } catch (err) {
      console.error('Supabase connection error:', err);
      return NextResponse.json<EnquiryResponse>(
        {
          success: false,
          message: 'Server error. Please try again or call 9732424300 directly.',
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json<EnquiryResponse>({
    success: true,
    message: 'Your registration has been recorded.',
    id: `dev-${Date.now()}`,
    createdAt: new Date().toISOString(),
  });
}

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json<LookupResponse>(
      {
        success: false,
        message: 'Too many lookup requests. Please wait a minute and try again.',
      },
      { status: 429 }
    );
  }

  const phone = (request.nextUrl.searchParams.get('phone') ?? '').trim();

  if (!phone || !validatePhone(phone)) {
    return NextResponse.json<LookupResponse>(
      {
        success: false,
        message: 'Enter a valid 10-digit Indian mobile number to check response.',
      },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseServiceKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data, error } = await supabase
        .from('enquiries')
        .select('id, name, phone, course_slug, batch_type, gender, address, message, status, created_at')
        .eq('phone', phone)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase registration lookup error:', error);
        return NextResponse.json<LookupResponse>(
          {
            success: false,
            message: 'Failed to look up registration. Please try again.',
          },
          { status: 500 }
        );
      }

      const coursesMap = new Map(ALL_COURSES.map((c) => [c.slug, c]));

      const registrations = (data ?? []).map((row) => {
        const course = coursesMap.get(row.course_slug);
        return {
          id: row.id,
          name: row.name,
          phone: row.phone,
          courseSlug: row.course_slug,
          courseName: course?.name ?? row.course_slug,
          stream: course?.stream ?? 'Public Services',
          batchType: row.batch_type ?? 'Free batch',
          gender: row.gender ?? 'Not specified',
          address: row.address ?? 'Not specified',
          message: row.message,
          status: row.status ?? 'new',
          createdAt: row.created_at,
        };
      });

      return NextResponse.json<LookupResponse>({
        success: true,
        registrations,
      });
    } catch (err) {
      console.error('Lookup server error:', err);
      return NextResponse.json<LookupResponse>(
        {
          success: false,
          message: 'Server error while checking registration.',
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json<LookupResponse>({
    success: true,
    registrations: [],
  });
}
