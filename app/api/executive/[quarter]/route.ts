import { getAllData, getCacheInfo } from '@/lib/supabase';
import { computeExecutiveData } from '@/lib/business-logic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ quarter: string }> },
) {
  try {
    const { quarter: rawQuarter } = await params;
    const quarter = decodeURIComponent(rawQuarter);
    const url = new URL(req.url);
    const weekFilter = url.searchParams.get('week') || undefined;
    const { deals, meetingEntries } = await getAllData();
    const data = computeExecutiveData(quarter, weekFilter, deals, meetingEntries);
    return Response.json({ ...data, cache: getCacheInfo() });
  } catch (err) {
    console.error('[executive] Error:', err);
    return Response.json({ error: 'Failed to fetch executive data' }, { status: 500 });
  }
}
