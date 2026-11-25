import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { ALL_COURSES } from '@/lib/constants';

async function getAuthenticatedUser(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) return user;

    // Check Authorization: Bearer <token>
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      const {
        data: { user: bearerUser },
      } = await supabase.auth.getUser(token);
      if (bearerUser) return bearerUser;
    }

    return null;
  } catch (err) {
    console.error('Auth verification error:', err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Please sign in with Supabase Auth.' },
      { status: 401 }
    );
  }

  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('enquiries')
      .select(
        'id, name, phone, course_slug, batch_type, gender, address, message, status, created_at, admin_notes, follow_up_date'
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin enquiries query error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch student registrations.' },
        { status: 500 }
      );
    }

    return formatRegistrations(data ?? []);
  } catch (err) {
    console.error('Admin API error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}

function formatRegistrations(rows: Array<{
  id: string;
  name: string;
  phone: string;
  course_slug: string;
  batch_type: string | null;
  gender: string | null;
  address: string | null;
  message: string | null;
  status: string | null;
  created_at: string;
  admin_notes: string | null;
  follow_up_date: string | null;
}>) {
  const coursesMap = new Map(ALL_COURSES.map((c) => [c.slug, c]));

  const registrations = rows.map((row) => {
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
      adminNotes: row.admin_notes,
      followUpDate: row.follow_up_date,
    };
  });

  return NextResponse.json({
    success: true,
    registrations,
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Please sign in with Supabase Auth.' },
      { status: 401 }
    );
  }

  let body: { id?: string; status?: string; adminNotes?: unknown; followUpDate?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  const { id, status } = body;
  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      { success: false, message: 'Record ID is required.' },
      { status: 400 }
    );
  }

  const update: { status?: string; admin_notes?: string | null; follow_up_date?: string | null } = {};

  if (status !== undefined) {
    const validStatuses = ['new', 'contacted', 'admitted', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: `Status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }
    update.status = status;
  }

  if (body.adminNotes !== undefined) {
    if (body.adminNotes !== null && typeof body.adminNotes !== 'string') {
      return NextResponse.json({ success: false, message: 'Notes must be text.' }, { status: 400 });
    }
    const notes = (body.adminNotes ?? '').trim();
    if (notes.length > 1000) {
      return NextResponse.json(
        { success: false, message: 'Notes cannot exceed 1000 characters.' },
        { status: 400 }
      );
    }
    update.admin_notes = notes || null;
  }

  if (body.followUpDate !== undefined) {
    const d = body.followUpDate;
    if (d !== null && d !== '' && (typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d))) {
      return NextResponse.json(
        { success: false, message: 'Follow-up date must be YYYY-MM-DD.' },
        { status: 400 }
      );
    }
    update.follow_up_date = d ? (d as string) : null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ success: false, message: 'Nothing to update.' }, { status: 400 });
  }

  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('enquiries')
      .update(update)
      .eq('id', id);

    if (error) {
      console.error('Update status error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update status.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Registration updated.',
    });
  } catch (err) {
    console.error('Admin PATCH error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Please sign in with Supabase Auth.' },
      { status: 401 }
    );
  }

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Record ID is required in query (?id=...).' },
      { status: 400 }
    );
  }

  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient.from('enquiries').delete().eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to delete record.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Record deleted successfully.',
    });
  } catch (err) {
    console.error('Admin DELETE error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
