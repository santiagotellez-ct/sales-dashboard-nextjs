/**
 * V2 Attio CRM API client — fetches Deals pipeline + Meeting Titans list
 * with in-memory caching and full pagination.
 */

const ATTIO_API_KEY = process.env.ATTIO_API_KEY || "";
const ATTIO_BASE = "https://api.attio.com/v2";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Meeting Titans list ID
const MEETING_TITANS_LIST_ID = "b2623522-c14c-4a84-818e-7dd322663b51";

// ── Workspace member IDs → names (hardcoded for speed)
const MEMBER_MAP: Record<string, string> = {
  "f8e28588": "Juan David Toquica",
  "2f831e92": "Maria Paz Vargas",
  "b42973c9": "Colombia Tech Week",
  "b85d95e2": "Nicolas Cruz",
  "daaabb36": "Alexander Ramirez",
  "338c3a52": "Laura M Forero",
  "b014849f": "Maria José Echeverri",
  "9a75652c": "Nathalia Muñoz",
  "dec396b1": "Liz Hernandez",
};

function getMemberName(id: string): string {
  if (!id) return "";
  // Match on prefix (Attio IDs are long UUIDs — match first 8 chars)
  const prefix = id.substring(0, 8);
  return MEMBER_MAP[prefix] || "";
}

// ── SDR owner mapping: workspace_member_id prefix → SDR name
function mapOwnerToSDR(ownerId: string, sdrField: string): string {
  if (!ownerId) return "";
  const prefix = ownerId.substring(0, 8);
  switch (prefix) {
    case "f8e28588": return "Juan";      // Juan David Toquica
    case "2f831e92": return "Mapi";      // Maria Paz Vargas
    case "b42973c9":                     // Colombia Tech Week → Charlie's entries
      return sdrField === "Charlie" ? "Charlie" : (sdrField || "Charlie");
    default: return "";
  }
}

// ── Types
export interface ProcessedDeal {
  id: string;
  name: string;
  stage: string;
  value: number;
  currency: string;
  contacto_ae: string;
  contacto_sdr: string;
  created_at: string;
  event: string;
  quarter: string;
  stage_changed_at: string;
  associated_company_id: string;
}

export interface ProcessedMeetingEntry {
  id: string;
  parent_record_id: string;  // company ID
  stage: string;             // Meeting Titans stage
  sdr: string;               // Charlie / Mapi / Juan
  owner_id: string;
  created_at: string;
  stage_changed_at: string;  // active_from: when the entry moved to current stage
  quarter: string;
  week_key: string;          // based on stage_changed_at (not created_at)
}

// ── Quarter assignment logic
function assignQuarter(createdAt: string): string {
  if (!createdAt) return "Q1 2026";
  const date = new Date(createdAt);
  const q1Start = new Date("2026-01-10T00:00:00Z");
  const q1End = new Date("2026-03-01T00:00:00Z");

  if (date < q1Start) return "Q4 2025";
  if (date >= q1Start && date < q1End) return "Q1 2026";
  return "Q2 2026";
}

// ── ISO week key helper
function getWeekKey(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const jan4 = new Date(d.getFullYear(), 0, 4);
  const start = new Date(jan4.getTime() - ((jan4.getDay() || 7) - 1) * 86400000);
  const weekNum = Math.ceil(((d.getTime() - start.getTime()) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

// ── Parse a raw Attio deal record
function parseDeal(raw: any): ProcessedDeal {
  const values = raw.values || {};

  const getVal = (field: string, key = "value"): any => {
    const arr = values[field];
    if (Array.isArray(arr) && arr.length > 0) return arr[0][key];
    return null;
  };

  const getSelectVal = (field: string): string => {
    const arr = values[field];
    if (Array.isArray(arr) && arr.length > 0) {
      const v = arr[0];
      return v?.option?.title || v?.value || "";
    }
    return "";
  };

  // Stage
  const stageArr = values.stage || [];
  let stage = "";
  let stageChangedAt = "";
  if (stageArr.length > 0) {
    stage = stageArr[0]?.status?.title || "";
    stageChangedAt = stageArr[0]?.active_from || "";
  }

  // Value — currency field
  let dealValue = 0;
  const valueArr = values.value || [];
  if (valueArr.length > 0) {
    dealValue = parseFloat(valueArr[0]?.value || valueArr[0]?.currency_value || "0") || 0;
  }

  // contacto_ae & contacto_sdr — select fields
  const contactoAe = getSelectVal("contacto_ae");
  const contactoSdr = getSelectVal("contacto_sdr");

  // Event (field slug is "event" in Attio)
  const event = getSelectVal("event");

  // Associated company
  const acArr = values.associated_company || [];
  const associatedCompanyId = acArr.length > 0 ? (acArr[0]?.target_record_id || "") : "";

  const createdAt = getVal("created_at") || raw.created_at || "";

  return {
    id: raw.id?.record_id || "",
    name: getVal("name") || "",
    stage,
    value: dealValue,
    currency: "USD",
    contacto_ae: contactoAe,
    contacto_sdr: contactoSdr,
    created_at: createdAt,
    event,
    quarter: assignQuarter(createdAt),
    stage_changed_at: stageChangedAt || createdAt,
    associated_company_id: associatedCompanyId,
  };
}

// ── Parse a Meeting Titans list entry
function parseMeetingEntry(raw: any): ProcessedMeetingEntry {
  const ev = raw.entry_values || {};

  // Stage + active_from (when the entry moved to current stage)
  let stage = "No Stage";
  let stageChangedAt = "";
  const stageArr = ev.stage || [];
  if (stageArr.length > 0) {
    stage = stageArr[0]?.status?.title || "No Stage";
    stageChangedAt = stageArr[0]?.active_from || "";
  }

  // SDR select field
  let sdrField = "";
  const sdrArr = ev.sdr || [];
  if (sdrArr.length > 0) {
    sdrField = sdrArr[0]?.option?.title || "";
  }

  // Owner (actor-reference)
  let ownerId = "";
  const ownerArr = ev.owner || [];
  if (ownerArr.length > 0) {
    ownerId = ownerArr[0]?.referenced_actor_id || "";
  }

  // Created at
  let createdAt = "";
  const caArr = ev.created_at || [];
  if (caArr.length > 0) {
    createdAt = caArr[0]?.value || "";
  }

  // Parent record (company)
  const parentRecordId = raw.parent_record_id || "";

  // Map owner to SDR name
  const sdr = mapOwnerToSDR(ownerId, sdrField);

  // Use stage_changed_at (active_from) for weekly accountability.
  // This reflects when the SDR actually moved the entry to the current stage,
  // not when the entry was first created in the pipeline.
  // Fallback to created_at if active_from is missing (e.g. "No Stage" entries).
  const dateForWeek = stageChangedAt || createdAt;

  return {
    id: raw.entry_id || "",
    parent_record_id: parentRecordId,
    stage,
    sdr,
    owner_id: ownerId,
    created_at: createdAt,
    stage_changed_at: stageChangedAt || createdAt,
    quarter: assignQuarter(dateForWeek),
    week_key: getWeekKey(dateForWeek),
  };
}

// ── Fetch all deals with pagination
async function fetchAllDeals(): Promise<ProcessedDeal[]> {
  const allDeals: ProcessedDeal[] = [];
  let offset = 0;
  const limit = 500;
  let hasMore = true;

  console.log("[attio] Fetching deals...");

  while (hasMore) {
    const res = await fetch(`${ATTIO_BASE}/objects/deals/records/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ATTIO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ limit, offset }),
    });

    if (!res.ok) {
      console.error(`[attio] Deals API error: ${res.status}`);
      break;
    }

    const data = await res.json();
    const records = data.data || [];

    for (const raw of records) {
      allDeals.push(parseDeal(raw));
    }

    console.log(`[attio] Deals: ${allDeals.length} (offset ${offset})`);

    if (records.length < limit) {
      hasMore = false;
    } else {
      offset += limit;
    }
  }

  return allDeals;
}

// ── Fetch all Meeting Titans list entries with pagination
async function fetchAllMeetingEntries(): Promise<ProcessedMeetingEntry[]> {
  const allEntries: ProcessedMeetingEntry[] = [];
  let offset = 0;
  const limit = 500;
  let hasMore = true;

  console.log("[attio] Fetching Meeting Titans list...");

  while (hasMore) {
    const res = await fetch(`${ATTIO_BASE}/lists/${MEETING_TITANS_LIST_ID}/entries/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ATTIO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ limit, offset }),
    });

    if (!res.ok) {
      console.error(`[attio] Meeting Titans API error: ${res.status}`);
      break;
    }

    const data = await res.json();
    const records = data.data || [];

    for (const raw of records) {
      allEntries.push(parseMeetingEntry(raw));
    }

    console.log(`[attio] Meeting Titans: ${allEntries.length} (offset ${offset})`);

    if (records.length < limit) {
      hasMore = false;
    } else {
      offset += limit;
    }
  }

  return allEntries;
}

// ── Cache layer
interface CacheEntry {
  deals: ProcessedDeal[];
  meetingEntries: ProcessedMeetingEntry[];
  fetchedAt: number;
}

let cache: CacheEntry | null = null;
let fetchInProgress: Promise<{ deals: ProcessedDeal[]; meetingEntries: ProcessedMeetingEntry[] }> | null = null;

async function fetchAll(): Promise<{ deals: ProcessedDeal[]; meetingEntries: ProcessedMeetingEntry[] }> {
  const [deals, meetingEntries] = await Promise.all([fetchAllDeals(), fetchAllMeetingEntries()]);
  return { deals, meetingEntries };
}

export async function getAllData(): Promise<{ deals: ProcessedDeal[]; meetingEntries: ProcessedMeetingEntry[] }> {
  const now = Date.now();

  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return { deals: cache.deals, meetingEntries: cache.meetingEntries };
  }

  if (fetchInProgress) {
    return fetchInProgress;
  }

  fetchInProgress = fetchAll()
    .then(result => {
      cache = { deals: result.deals, meetingEntries: result.meetingEntries, fetchedAt: Date.now() };
      fetchInProgress = null;
      return result;
    })
    .catch(err => {
      console.error("[attio] Fetch failed:", err);
      fetchInProgress = null;
      if (cache) return { deals: cache.deals, meetingEntries: cache.meetingEntries };
      return { deals: [], meetingEntries: [] };
    });

  return fetchInProgress;
}

export function getCacheInfo(): { cached: boolean; age: number; dealCount: number; meetingCount: number } {
  if (!cache) return { cached: false, age: 0, dealCount: 0, meetingCount: 0 };
  return {
    cached: true,
    age: Math.round((Date.now() - cache.fetchedAt) / 1000),
    dealCount: cache.deals.length,
    meetingCount: cache.meetingEntries.length,
  };
}

export function clearCache(): void {
  cache = null;
  fetchInProgress = null;
}

export { getWeekKey, assignQuarter };
