import { getAllData } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const { deals, meetingEntries } = await getAllData();
  const dealQuarters = deals.map(d => d.quarter);
  const mtQuarters = meetingEntries.map(e => e.quarter);
  const quarters = [...new Set([...dealQuarters, ...mtQuarters])].filter(Boolean).sort();
  return Response.json({ quarters });
}
