import { clearCache } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Legacy POST endpoint kept for backward compatibility.
// Prefer DELETE /api/cache.
export async function POST() {
  clearCache();
  return Response.json({ cleared: true, timestamp: new Date().toISOString() });
}
