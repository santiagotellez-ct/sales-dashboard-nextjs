import { getCacheInfo, clearCache } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(getCacheInfo());
}

export async function DELETE() {
  clearCache();
  return Response.json({ cleared: true, timestamp: new Date().toISOString() });
}
