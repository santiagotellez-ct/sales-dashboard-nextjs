/**
 * Supabase client for fetching Deals pipeline
 * Replaces Attio integration with direct DB access
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://yiymlemmsqdklavwgdgt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpeW1sZW1tc3Fka2xhdndnZGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNzUxMTIsImV4cCI6MjA5NDc1MTExMn0.bshrXDUN6l0X5vW5oeMvf1HS-KWbrOWgRChh1qLOUWg";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  parent_record_id: string;
  stage: string;
  sdr: string;
  owner_id: string;
  created_at: string;
  stage_changed_at: string;
  quarter: string;
  week_key: string;
}

// Quarter assignment logic
function assignQuarter(createdAt: string): string {
  if (!createdAt) return "Q1 2026";
  const date = new Date(createdAt);
  const q1Start = new Date("2026-01-10T00:00:00Z");
  const q1End = new Date("2026-03-01T00:00:00Z");

  if (date < q1Start) return "Q4 2025";
  if (date >= q1Start && date < q1End) return "Q1 2026";
  return "Q2 2026";
}

// ISO week key helper
function getWeekKey(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const jan4 = new Date(d.getFullYear(), 0, 4);
  const start = new Date(jan4.getTime() - ((jan4.getDay() || 7) - 1) * 86400000);
  const weekNum = Math.ceil(((d.getTime() - start.getTime()) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

// Stage name mapping from Supabase to business logic
const STAGE_NAME_MAP: Record<string, string> = {
  "discovery realizada": "Discovery Realizado",
  "Discovery realizada": "Discovery Realizado",
  "propuesta en construcción": "Propuesta en construcción",
  "Propuesta en construcción": "Propuesta en construcción",
  "propuesta presentada": "Propuesta presentada",
  "Propuesta presentada": "Propuesta presentada",
  "committed": "🤝 Committed",
  "Committed": "🤝 Committed",
  "cierre ganado": "🎉 Cierre Ganado",
  "Cierre ganado": "🎉 Cierre Ganado",
  "cierre perdido": "❌ Cierre Perdido",
  "Cierre perdido": "❌ Cierre Perdido",
};

function normalizeStage(stageName: string): string {
  if (!stageName) return "";
  return STAGE_NAME_MAP[stageName] || stageName;
}

// Parse a Supabase deal record
function parseDeal(raw: any): ProcessedDeal {
  const createdAt = raw.created_at || new Date().toISOString();
  const stageChangedAt = raw.updated_at || createdAt;

  // Extract stage name from the joined deal_stages record
  let stageNameRaw = "";

  if (raw.deal_stages) {
    // Handle array result from JOIN
    if (Array.isArray(raw.deal_stages) && raw.deal_stages.length > 0) {
      stageNameRaw = raw.deal_stages[0].name || "";
    }
    // Handle single object result from JOIN
    else if (typeof raw.deal_stages === 'object' && raw.deal_stages.name) {
      stageNameRaw = raw.deal_stages.name || "";
    }
  }

  // If no stage name from join, use stage_id as fallback (it might be the actual name)
  if (!stageNameRaw && raw.stage_id) {
    stageNameRaw = raw.stage_id;
  }

  // Normalize stage name to match business logic constants
  const stageName = normalizeStage(stageNameRaw);

  return {
    id: raw.id || "",
    name: raw.name || "",
    stage: stageName,
    value: parseFloat(raw.value) || 0,
    currency: raw.currency || "USD",
    contacto_ae: raw.account_executive || "",
    contacto_sdr: raw.sdr || "",
    created_at: createdAt,
    event: raw.event || "",
    quarter: assignQuarter(createdAt),
    stage_changed_at: stageChangedAt,
    associated_company_id: raw.company_id || "",
  };
}

// Fetch all deals from Supabase with stage names via JOIN
async function fetchAllDeals(): Promise<ProcessedDeal[]> {
  const allDeals: ProcessedDeal[] = [];
  let offset = 0;
  const limit = 500;
  let hasMore = true;
  let useJoin = true;

  console.log("[supabase] Fetching deals...");

  while (hasMore) {
    let result: { data: any[] | null; error: any };

    if (useJoin) {
      // Try query with stage info via foreign key relationship
      result = await supabase
        .from("deals")
        .select("*, deal_stages(id, name)")
        .range(offset, offset + limit - 1);

      // If JOIN fails, disable it for future iterations
      if (result.error) {
        console.warn("[supabase] JOIN query failed, falling back to simple select", result.error);
        useJoin = false;
        result = await supabase
          .from("deals")
          .select("*")
          .range(offset, offset + limit - 1);
      }
    } else {
      // Simple select without stage relationship
      result = await supabase
        .from("deals")
        .select("*")
        .range(offset, offset + limit - 1);
    }

    const { data, error } = result;

    if (error) {
      console.error(`[supabase] Deals query error:`, error);
      break;
    }

    const records = data || [];

    for (const raw of records) {
      allDeals.push(parseDeal(raw));
    }

    console.log(`[supabase] Deals: ${allDeals.length} (offset ${offset})`);

    if (records.length < limit) {
      hasMore = false;
    } else {
      offset += limit;
    }
  }

  return allDeals;
}

// For now, meeting entries are stubbed (can be added from another table if available)
async function fetchAllMeetingEntries(): Promise<ProcessedMeetingEntry[]> {
  console.log("[supabase] Meeting entries not yet implemented - returning empty");
  return [];
}

// Cache layer
interface CacheEntry {
  deals: ProcessedDeal[];
  meetingEntries: ProcessedMeetingEntry[];
  fetchedAt: number;
}

let cache: CacheEntry | null = null;
let fetchInProgress: Promise<{ deals: ProcessedDeal[]; meetingEntries: ProcessedMeetingEntry[] }> | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

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
      console.error("[supabase] Fetch failed:", err);
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
