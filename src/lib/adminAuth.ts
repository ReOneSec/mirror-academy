import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** The signed-in Supabase user from the session cookie or an `Authorization: Bearer` token. */
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return user;

    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const {
        data: { user: bearerUser },
      } = await supabase.auth.getUser(authHeader.slice(7).trim());
      if (bearerUser) return bearerUser;
    }
    return null;
  } catch (err) {
    console.error('Auth verification error:', err);
    return null;
  }
}
