// Business logic extracted verbatim from server/routes.ts.
// Pure functions: compute<View>(quarter, weekFilter, deals, meetings).
//
// NOTE: Google Calendar integration is stubbed in this Next.js port.
// AE meeting counts fall back to deal-count proxies where calendar data
// is referenced. See app/api/ae-meetings/route.ts for the stub endpoint.

import { getWeekKey, type ProcessedDeal, type ProcessedMeetingEntry } from "./supabase";

// ══════════════════════════════════════════
// AE NAME NORMALIZATION
// ══════════════════════════════════════════
export const AE_NAME_MAP: Record<string, string> = {
  "Nicolas": "Nicolás",
  "Nath": "Nathalia",
  "Natalia": "Nathalia",
  "Nathalia": "Nathalia",
  "Santiago": "Santiago",
  "Laura": "Laura",
  "Majo": "María José",
  "Fernando": "Fernando",
  "Carlos Alberto": "Carlos Alberto",
  "Juan": "Juan",
};

export const COMBINED_AE_NAME = "Santiago / Nathalia";
export const COMBINED_AE_MEMBERS = ["Santiago", "Nathalia"];
export const SOLO_AE_QUARTERS = ["Q2 2026", "Q3 2026", "Q4 2026"];

function isSoloQuarter(quarter?: string): boolean {
  return quarter ? SOLO_AE_QUARTERS.includes(quarter) : false;
}

export function toCombinedAE(name: string, quarter?: string): string {
  if (isSoloQuarter(quarter)) return name;
  if (COMBINED_AE_MEMBERS.includes(name)) return COMBINED_AE_NAME;
  return name;
}

export function normalizeAE(raw: string): string {
  return AE_NAME_MAP[raw] || raw || "Sin asignar";
}

export function dealMatchesAE(deal: ProcessedDeal, aeName: string, quarter?: string): boolean {
  const raw = deal.contacto_ae;
  const normalized = normalizeAE(raw);
  if (isSoloQuarter(quarter)) {
    return normalized === aeName;
  }
  if (aeName === COMBINED_AE_NAME) {
    return COMBINED_AE_MEMBERS.includes(normalized);
  }
  if (normalized === aeName) return true;
  if (!raw) return false;
  return false;
}

// ══════════════════════════════════════════
// DEAL STAGES
// ══════════════════════════════════════════
export const ACTIVE_STAGES = [
  "Por contactar",
  "📅 Agendado",
  "Discovery Realizado",
  "Propuesta en construcción",
  "Propuesta presentada",
  "Propuesta en revisión",
  "⏳ En Negociación",
  // Legacy stages (still active, mapped visually):
  "✅ Reunión Realizada",
  "🔄 Follow Up 1 - AE",
  "🔄 Follow Up 2 - AE",
  "🔁 Follow-up 3 - AE",
  "📋 Propuesta Enviada",
  "📑 Propuesta en Revisión",
];
export const WON_STAGES = ["🎉 Cierre Ganado", "🤝 Committed"];
export const LOST_STAGE = "❌ Cierre Perdido";
export const STANDBY_STAGE = "Stand By";
export const DISQUALIFIED_STAGES = ["❌ No Interesado", "Unqualified", "No fit (after call AE)"];
export const HOT_STAGES = [
  "Propuesta presentada",
  "Propuesta en revisión",
  "⏳ En Negociación",
  "📋 Propuesta Enviada",
  "📑 Propuesta en Revisión",
];
export const PIPELINE_AE_STAGES = [
  "Discovery Realizado",
  "Propuesta en construcción",
  "Propuesta presentada",
  "Propuesta en revisión",
  "⏳ En Negociación",
  "✅ Reunión Realizada",
  "🔄 Follow Up 1 - AE",
  "🔄 Follow Up 2 - AE",
  "🔁 Follow-up 3 - AE",
  "📋 Propuesta Enviada",
  "📑 Propuesta en Revisión",
  "🎉 Cierre Ganado",
];
export const NO_SHOW_STAGE = "🚫 No Show";
export const UNQUALIFIED_STAGE = "Unqualified";
export const PROPOSAL_PLUS_STAGES = [
  "Propuesta en construcción",
  "Propuesta presentada",
  "Propuesta en revisión",
  "⏳ En Negociación",
  "🤝 Committed",
  "🎉 Cierre Ganado",
  "📋 Propuesta Enviada",
  "📑 Propuesta en Revisión",
];

export const FUNNEL_STAGES = [
  { key: "discovery", label: "Discovery", stages: ["Discovery Realizado", "✅ Reunión Realizada", "🔄 Follow Up 1 - AE", "🔄 Follow Up 2 - AE", "🔁 Follow-up 3 - AE", "Propuesta en construcción", "Propuesta presentada", "📋 Propuesta Enviada", "Propuesta en revisión", "📑 Propuesta en Revisión", "⏳ En Negociación", "🤝 Committed", "🎉 Cierre Ganado"] },
  { key: "propuesta", label: "Propuesta", stages: ["Propuesta presentada", "📋 Propuesta Enviada", "Propuesta en revisión", "📑 Propuesta en Revisión", "⏳ En Negociación", "🤝 Committed", "🎉 Cierre Ganado"] },
  { key: "revision", label: "Revisión", stages: ["Propuesta en revisión", "📑 Propuesta en Revisión", "⏳ En Negociación", "🤝 Committed", "🎉 Cierre Ganado"] },
  { key: "negociacion", label: "Negociación", stages: ["⏳ En Negociación", "🤝 Committed", "🎉 Cierre Ganado"] },
  { key: "committed", label: "Committed", stages: ["🤝 Committed", "🎉 Cierre Ganado"] },
  { key: "ganado", label: "Ganado", stages: ["🎉 Cierre Ganado"] },
];

export const FOLLOWUP_STAGES = ["Discovery Realizado", "✅ Reunión Realizada", "🔄 Follow Up 1 - AE", "🔄 Follow Up 2 - AE", "🔁 Follow-up 3 - AE"];

export const PIPELINE_DISPLAY_ORDER = [
  { label: "Por contactar", stages: ["Por contactar"] },
  { label: "Agendado", stages: ["📅 Agendado"] },
  { label: "Discovery", stages: ["Discovery Realizado", "✅ Reunión Realizada", "🔄 Follow Up 1 - AE", "🔄 Follow Up 2 - AE", "🔁 Follow-up 3 - AE"] },
  { label: "Prop. Construcción", stages: ["Propuesta en construcción"] },
  { label: "Prop. Presentada", stages: ["Propuesta presentada", "📋 Propuesta Enviada"] },
  { label: "Prop. en Revisión", stages: ["Propuesta en revisión", "📑 Propuesta en Revisión"] },
  { label: "Negociación", stages: ["⏳ En Negociación"] },
  { label: "Committed", stages: ["🤝 Committed"] },
  { label: "Cierre Ganado", stages: ["🎉 Cierre Ganado"] },
];

export const STALE_THRESHOLDS: Record<string, number> = {
  "Discovery Realizado": 14,
  "✅ Reunión Realizada": 14,
  "🔄 Follow Up 1 - AE": 14,
  "🔄 Follow Up 2 - AE": 14,
  "🔁 Follow-up 3 - AE": 14,
  "Propuesta en construcción": 5,
  "Propuesta presentada": 10,
  "📋 Propuesta Enviada": 10,
  "Propuesta en revisión": 10,
  "📑 Propuesta en Revisión": 10,
  "⏳ En Negociación": 14,
  "Stand By": 30,
};

// ══════════════════════════════════════════
// TARGETS
// ══════════════════════════════════════════
export const QUARTER_TARGETS: Record<string, number> = {
  "Q4 2025": 681800,
  "Q1 2026": 700000,
  "Q2 2026": 500000,
  "Q3 2026": 500000,
};

export function getQuarterlyTarget(quarter: string): number {
  if (quarter === "all") {
    return Object.values(QUARTER_TARGETS).reduce((sum, v) => sum + v, 0);
  }
  return QUARTER_TARGETS[quarter] || 700000;
}

export interface AETarget { name: string; revenueTarget: number; meetingsPerWeek: number; proposalsPerWeek: number; }

export const AE_TARGETS_BY_QUARTER: Record<string, AETarget[]> = {
  "Q4 2025": [
    { name: "Nathalia", revenueTarget: 136360, meetingsPerWeek: 20, proposalsPerWeek: 18 },
    { name: "Nicolás", revenueTarget: 163632, meetingsPerWeek: 20, proposalsPerWeek: 18 },
    { name: "Laura", revenueTarget: 90679, meetingsPerWeek: 10, proposalsPerWeek: 8 },
    { name: "María José", revenueTarget: 88634, meetingsPerWeek: 8, proposalsPerWeek: 6 },
    { name: "Liz", revenueTarget: 136360, meetingsPerWeek: 10, proposalsPerWeek: 8 },
    { name: "Fernando", revenueTarget: 136360, meetingsPerWeek: 10, proposalsPerWeek: 8 },
  ],
  "Q1 2026": [
    { name: COMBINED_AE_NAME, revenueTarget: 224000, meetingsPerWeek: 20, proposalsPerWeek: 18 },
    { name: "Nicolás", revenueTarget: 224000, meetingsPerWeek: 20, proposalsPerWeek: 18 },
    { name: "Laura", revenueTarget: 100000, meetingsPerWeek: 10, proposalsPerWeek: 8 },
    { name: "María José", revenueTarget: 90000, meetingsPerWeek: 8, proposalsPerWeek: 6 },
  ],
  "Q2 2026": [
    { name: "Santiago", revenueTarget: 130000, meetingsPerWeek: 20, proposalsPerWeek: 18 },
    { name: "Nicolás", revenueTarget: 130000, meetingsPerWeek: 20, proposalsPerWeek: 18 },
    { name: "Juan", revenueTarget: 100000, meetingsPerWeek: 15, proposalsPerWeek: 12 },
    { name: "Laura", revenueTarget: 80000, meetingsPerWeek: 10, proposalsPerWeek: 8 },
    { name: "María José", revenueTarget: 60000, meetingsPerWeek: 8, proposalsPerWeek: 6 },
  ],
};
const AE_TARGETS = AE_TARGETS_BY_QUARTER["Q1 2026"];

export function getAETargets(quarter: string): AETarget[] {
  if (quarter === "all") return AE_TARGETS;
  return AE_TARGETS_BY_QUARTER[quarter] || AE_TARGETS;
}

export const SDR_TARGETS = [
  { name: "Charlie", contactsPerWeek: 200, meetingsPerWeek: 20 },
  { name: "Mapi", contactsPerWeek: 200, meetingsPerWeek: 20 },
  { name: "Juan", contactsPerWeek: 200, meetingsPerWeek: 20 },
];

export const MT_MEETING_STAGES = ["Agendado", "No Show"];

// ══════════════════════════════════════════
// QUARTER / WEEK HELPERS
// ══════════════════════════════════════════
export function getQuarterDateRange(quarter: string): { start: Date; end: Date } {
  if (quarter === "Q4 2025") return { start: new Date("2025-10-01"), end: new Date("2026-01-01") };
  if (quarter === "Q1 2026") return { start: new Date("2026-01-01"), end: new Date("2026-04-01") };
  if (quarter === "Q2 2026") return { start: new Date("2026-04-01"), end: new Date("2026-07-01") };
  if (quarter === "Q3 2026") return { start: new Date("2026-07-01"), end: new Date("2026-10-01") };
  if (quarter === "Q4 2026") return { start: new Date("2026-10-01"), end: new Date("2027-01-01") };
  const match = quarter.match(/Q(\d)\s+(\d{4})/);
  if (match) {
    const q = parseInt(match[1]);
    const y = parseInt(match[2]);
    const startMonth = (q - 1) * 3;
    return { start: new Date(y, startMonth, 1), end: new Date(y, startMonth + 3, 1) };
  }
  return { start: new Date("2020-01-01"), end: new Date("2030-01-01") };
}

export function getQuarterStart(quarter: string): Date {
  return getQuarterDateRange(quarter).start;
}

export function getQuarterWeeksElapsed(quarter: string): number {
  if (quarter === "all") {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    const q = m < 3 ? 1 : m < 6 ? 2 : m < 9 ? 3 : 4;
    return getQuarterWeeksElapsed(`Q${q} ${y}`);
  }
  const now = new Date();
  const { start, end } = getQuarterDateRange(quarter);
  const effectiveEnd = now < end ? now : end;
  const elapsed = Math.max(1, Math.ceil((effectiveEnd.getTime() - start.getTime()) / (7 * 86400000)));
  return Math.min(elapsed, 15);
}

export function filterByQuarter<T extends { quarter: string; created_at: string }>(items: T[], quarter: string): T[] {
  if (quarter === "all") return items;
  if (quarter === "Q1 2026") {
    return items.filter(d => {
      const isQ1orQ2 = d.quarter === "Q1 2026" || d.quarter === "Q2 2026";
      const beforeApril = new Date(d.created_at) < new Date("2026-04-01");
      return isQ1orQ2 && beforeApril;
    });
  }
  if (quarter === "Q2 2026") {
    return items.filter(d => {
      const dt = new Date(d.created_at);
      return dt >= new Date("2026-04-01") && dt < new Date("2026-07-01");
    });
  }
  return items.filter(d => d.quarter === quarter);
}

export function filterByWeek(deals: ProcessedDeal[], weekKey: string): ProcessedDeal[] {
  return deals.filter(d => getWeekKey(d.created_at) === weekKey);
}

export function filterMeetingsByWeek(entries: ProcessedMeetingEntry[], weekKey: string): ProcessedMeetingEntry[] {
  return entries.filter(e => e.week_key === weekKey);
}

export function getCurrentWeekRange(): { weekKey: string; start: string; end: string; label: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  };

  const weekKey = getWeekKey(monday.toISOString());

  return {
    weekKey,
    start: monday.toISOString().split("T")[0],
    end: sunday.toISOString().split("T")[0],
    label: `${fmt(monday)} – ${fmt(sunday)}`,
  };
}

export function getLastNWeeks(n: number): string[] {
  const weeks: string[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const wk = getWeekKey(d.toISOString());
    if (wk && !weeks.includes(wk)) weeks.push(wk);
  }
  return weeks.reverse();
}

export function getWeekStartDate(weekKey: string): Date {
  const match = weekKey.match(/(\d{4})-W(\d{2})/);
  if (!match) return new Date();
  const year = parseInt(match[1]);
  const week = parseInt(match[2]);
  const jan4 = new Date(year, 0, 4);
  const start = new Date(jan4.getTime() - ((jan4.getDay() || 7) - 1) * 86400000);
  start.setDate(start.getDate() + (week - 1) * 7);
  return start;
}

export function getEventTag(event: string): string {
  if (!event) return "";
  const has_ai = event.includes("AISummit2026");
  const has_ctw = event.includes("CTW2026");
  if (has_ai && has_ctw) return "Ambos";
  if (has_ai) return "AI Summit";
  if (has_ctw) return "CTW";
  return event;
}

// ══════════════════════════════════════════
// EXECUTIVE VIEW
// ══════════════════════════════════════════
export function computeExecutiveData(
  quarter: string,
  weekFilter: string | undefined,
  allDeals: ProcessedDeal[],
  allMeetings: ProcessedMeetingEntry[],
) {
  const deals = filterByQuarter(allDeals, quarter);
  const meetings = filterByQuarter(allMeetings, quarter);
  const weeksElapsed = getQuarterWeeksElapsed(quarter);
  const now = new Date();

  const quarterWeeks = [...new Set(deals.map(d => getWeekKey(d.created_at)).filter(Boolean))].sort();
  const isWeekFiltered = !!weekFilter;
  // weekDeals / weekMeetings kept for parity with original
  const _weekDeals = isWeekFiltered ? filterByWeek(deals, weekFilter!) : deals;
  const _weekMeetings = isWeekFiltered ? filterMeetingsByWeek(meetings, weekFilter!) : meetings;
  void _weekDeals;
  void _weekMeetings;

  // Revenue
  const wonDeals = deals.filter(d => WON_STAGES.includes(d.stage));
  const totalClosed = wonDeals.reduce((s, d) => s + (d.value || 0), 0);
  const openDeals = deals.filter(d => ACTIVE_STAGES.includes(d.stage));
  const pipelineValue = openDeals.reduce((s, d) => s + (d.value || 0), 0);
  const hotDeals = deals.filter(d => HOT_STAGES.includes(d.stage));
  const hotDealsValue = hotDeals.reduce((s, d) => s + (d.value || 0), 0);
  const pipelineAEDeals = deals.filter(d => PIPELINE_AE_STAGES.includes(d.stage));
  const pipelineAEValue = pipelineAEDeals.reduce((s, d) => s + (d.value || 0), 0);
  const pipelineAECount = pipelineAEDeals.length;
  const quarterlyTarget = getQuarterlyTarget(quarter);
  const gap = quarterlyTarget - totalClosed;
  const percentComplete = (totalClosed / quarterlyTarget) * 100;
  const pipelineCoverage = gap > 0 ? pipelineValue / gap : 0;

  const revenue = {
    totalClosed,
    quarterlyTarget,
    gap: Math.max(gap, 0),
    pipelineValue,
    hotDealsValue,
    hotDealsCount: hotDeals.length,
    pipelineAEValue,
    pipelineAECount,
    percentComplete,
    pipelineCoverage,
  };

  // AE summary
  const aeTargets = getAETargets(quarter);
  const aeSummary = aeTargets.map(target => {
    const aeDeals = deals.filter(d => dealMatchesAE(d, target.name, quarter));
    const won = aeDeals.filter(d => WON_STAGES.includes(d.stage));
    const revenueClosed = won.reduce((s, d) => s + (d.value || 0), 0);
    const percentToTarget = (revenueClosed / target.revenueTarget) * 100;
    return {
      name: target.name,
      revenueClosed,
      revenueTarget: target.revenueTarget,
      percentToTarget,
      dealsWon: won.length,
      dealsOpen: aeDeals.filter(d => ACTIVE_STAGES.includes(d.stage)).length,
    };
  });

  // SDR summary
  const sdrSummary = SDR_TARGETS.map(target => {
    const sdrEntries = meetings.filter(e => e.sdr === target.name);
    const totalContacts = sdrEntries.length;
    const totalMeetings = sdrEntries.filter(e => MT_MEETING_STAGES.includes(e.stage)).length;
    return {
      name: target.name,
      totalContacts,
      totalMeetings,
      contactsTarget: target.contactsPerWeek * weeksElapsed,
      meetingsTarget: target.meetingsPerWeek * weeksElapsed,
    };
  });

  // Flujo SDR → AE (last 7 days + 4-week trend) — uses ALL deals/meetings, not quarter-filtered
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

  const recentMTAgendados = allMeetings.filter(e => {
    if (!MT_MEETING_STAGES.includes(e.stage)) return false;
    const d = new Date(e.created_at);
    return d >= sevenDaysAgo;
  });

  const REUNION_AND_BEYOND = [
    "Discovery Realizado",
    "Propuesta en construcción",
    "Propuesta presentada",
    "Propuesta en revisión",
    "⏳ En Negociación",
    "✅ Reunión Realizada",
    "🔄 Follow Up 1 - AE",
    "🔄 Follow Up 2 - AE",
    "🔁 Follow-up 3 - AE",
    "📋 Propuesta Enviada",
    "📑 Propuesta en Revisión",
    "🤝 Committed",
    "🎉 Cierre Ganado",
  ];
  const recentDealsReunion = allDeals.filter(d => {
    if (!REUNION_AND_BEYOND.includes(d.stage)) return false;
    const changed = new Date(d.stage_changed_at || d.created_at);
    return changed >= sevenDaysAgo;
  });

  const flujoAgendados = recentMTAgendados.length;
  const flujoReuniones = recentDealsReunion.length;
  const flujoGap = flujoAgendados - flujoReuniones;
  const flujoConversion = flujoAgendados > 0 ? (flujoReuniones / flujoAgendados) * 100 : 0;

  const last4Weeks = getLastNWeeks(4);
  const flujoTrend = last4Weeks.map(wk => {
    const weekStart = getWeekStartDate(wk);
    const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
    const agendados = allMeetings.filter(e => {
      if (!MT_MEETING_STAGES.includes(e.stage)) return false;
      const d = new Date(e.created_at);
      return d >= weekStart && d < weekEnd;
    }).length;
    const reuniones = allDeals.filter(d => {
      if (!REUNION_AND_BEYOND.includes(d.stage)) return false;
      const changed = new Date(d.stage_changed_at || d.created_at);
      return changed >= weekStart && changed < weekEnd;
    }).length;
    return {
      week: wk,
      agendados,
      reuniones,
      conversion: agendados > 0 ? Math.round((reuniones / agendados) * 100) : 0,
    };
  });

  const flujoSDRAE = {
    agendados: flujoAgendados,
    reuniones: flujoReuniones,
    gap: flujoGap,
    conversion: flujoConversion,
    trend: flujoTrend,
  };

  // Pipeline distribution
  const stageDistribution = PIPELINE_DISPLAY_ORDER.map(group => {
    const groupDeals = deals.filter(d => group.stages.includes(d.stage));
    return {
      stage: group.label,
      count: groupDeals.length,
      value: groupDeals.reduce((s, d) => s + (d.value || 0), 0),
    };
  }).filter(s => s.count > 0);

  const lostDeals = deals.filter(d => d.stage === LOST_STAGE);
  const standByDeals = deals.filter(d => d.stage === STANDBY_STAGE);
  const totalDecisions = wonDeals.length + lostDeals.length;
  const overallWinRate = totalDecisions > 0 ? (wonDeals.length / totalDecisions) * 100 : 0;

  // Alerts
  const alerts: Array<{ type: string; title: string; description: string }> = [];

  if (percentComplete < 70) {
    alerts.push({
      type: "danger",
      title: "Riesgo de meta trimestral",
      description: `Solo ${percentComplete.toFixed(0)}% cerrado ($${(totalClosed / 1000).toFixed(0)}k / $${(quarterlyTarget / 1000).toFixed(0)}k). Faltan $${(Math.max(gap, 0) / 1000).toFixed(0)}k.`,
    });
  }

  const staleDeals = deals.filter(d => {
    if ([...WON_STAGES, LOST_STAGE, ...DISQUALIFIED_STAGES].includes(d.stage)) return false;
    const stageDate = new Date(d.stage_changed_at || d.created_at);
    const daysSince = (now.getTime() - stageDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 14;
  }).map(d => {
    const stageDate = new Date(d.stage_changed_at || d.created_at);
    const daysSince = Math.floor((now.getTime() - stageDate.getTime()) / (1000 * 60 * 60 * 24));
    return { ...d, ae: toCombinedAE(normalizeAE(d.contacto_ae), quarter), daysSince };
  }).sort((a, b) => b.daysSince - a.daysSince);

  if (staleDeals.length > 0) {
    const totalStaleValue = staleDeals.reduce((s, d) => s + (d.value || 0), 0);
    alerts.push({
      type: "warning",
      title: `${staleDeals.length} deals sin movimiento (+14d)`,
      description: `$${(totalStaleValue / 1000).toFixed(0)}k en deals estancados.`,
    });
  }

  if (hotDeals.length > 0) {
    alerts.push({
      type: "info",
      title: `${hotDeals.length} Hot deals para priorizar`,
      description: `$${(hotDealsValue / 1000).toFixed(0)}k en negociación.`,
    });
  }

  const contactadoCount = meetings.filter(e => e.stage === "Contactado").length;
  const contactadoPercent = meetings.length > 0 ? (contactadoCount / meetings.length) * 100 : 0;
  if (contactadoPercent > 70) {
    alerts.push({
      type: "danger",
      title: "Pipeline SDR estancado",
      description: `${contactadoPercent.toFixed(0)}% de registros en Meeting Titans están en "Contactado" (${contactadoCount} de ${meetings.length}). Los SDRs necesitan avanzar estos leads.`,
    });
  }

  // Hot deals detail
  const hotDealsDetail = hotDeals
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, 10)
    .map(d => ({
      id: d.id,
      name: d.name,
      ae: toCombinedAE(normalizeAE(d.contacto_ae), quarter),
      value: d.value || 0,
      stage: d.stage,
      event: getEventTag(d.event),
    }));

  // Stale deals detail
  const staleDealsDetail = staleDeals.slice(0, 15).map(d => ({
    id: d.id,
    name: d.name,
    ae: toCombinedAE(d.ae, quarter),
    value: d.value || 0,
    stage: d.stage,
    daysSince: d.daysSince,
    event: getEventTag((d as unknown as { event?: string }).event || ""),
  }));

  // Revenue progress weekly data
  const allWeekKeys = [...new Set(deals.map(d => getWeekKey(d.stage_changed_at || d.created_at)).filter(Boolean))].sort();
  const totalWeeksInQuarter = 13;
  const weeklyTargetIncrement = quarterlyTarget / totalWeeksInQuarter;
  let cumulativeRevenue = 0;
  const revenueWeekly = allWeekKeys.map((wk, idx) => {
    const weekWon = wonDeals.filter(d => getWeekKey(d.stage_changed_at || d.created_at) === wk);
    cumulativeRevenue += weekWon.reduce((s, d) => s + (d.value || 0), 0);
    return {
      week: wk,
      actual: cumulativeRevenue,
      target: weeklyTargetIncrement * (idx + 1),
    };
  });

  return {
    quarter,
    weekFilter: weekFilter || null,
    weeksElapsed,
    quarterWeeks,
    totalDeals: deals.length,
    totalMeetingEntries: meetings.length,
    lastUpdated: new Date().toISOString(),
    revenue,
    aeSummary,
    sdrSummary,
    flujoSDRAE,
    stageDistribution,
    pipeline: {
      overallWinRate,
      pipelineCoverage,
      totalActiveDeals: openDeals.length,
      totalActiveValue: pipelineValue,
      standByDeals: standByDeals.length,
      standByValue: standByDeals.reduce((s, d) => s + (d.value || 0), 0),
      lostDeals: lostDeals.length,
      lostValue: lostDeals.reduce((s, d) => s + (d.value || 0), 0),
    },
    alerts,
    hotDeals: hotDealsDetail,
    staleDeals: staleDealsDetail,
    revenueWeekly,
  };
}

// ══════════════════════════════════════════
// AE DETAIL
// ══════════════════════════════════════════
export function computeAEData(
  quarter: string,
  weekFilter: string | undefined,
  allDeals: ProcessedDeal[],
  _allMeetings: ProcessedMeetingEntry[],
) {
  void _allMeetings;
  const deals = filterByQuarter(allDeals, quarter);
  const weeksElapsed = getQuarterWeeksElapsed(quarter);
  const isWeekFiltered = !!weekFilter;
  const weekDeals = isWeekFiltered ? filterByWeek(deals, weekFilter!) : deals;
  const divisor = isWeekFiltered ? 1 : weeksElapsed;
  const now = new Date();

  // GCal stubbed → no calendar meetings; falls back to deal-count proxy
  const calendarMeetings: Record<string, { meetingsThisWeek: number; meetingsTotal: number; weeklyBreakdown: Record<string, { meetings: number }> }> = {};

  const quarterWeeks = [...new Set(deals.map(d => getWeekKey(d.created_at)).filter(Boolean))].sort();

  const aeTargets = getAETargets(quarter);
  const aeMetrics = aeTargets.map(target => {
    const aeDeals = deals.filter(d => dealMatchesAE(d, target.name, quarter));
    const aeWeekDeals = (isWeekFiltered ? weekDeals : deals).filter(d => dealMatchesAE(d, target.name, quarter));

    const won = aeDeals.filter(d => WON_STAGES.includes(d.stage));
    const lost = aeDeals.filter(d => d.stage === LOST_STAGE);
    const open = aeDeals.filter(d => ACTIVE_STAGES.includes(d.stage));
    const revenueClosed = won.reduce((s, d) => s + (d.value || 0), 0);
    const totalDecisions = won.length + lost.length;
    const winRate = totalDecisions > 0 ? (won.length / totalDecisions) * 100 : 0;

    // Propuestas
    const proposalDeals = aeWeekDeals.filter(d => PROPOSAL_PLUS_STAGES.includes(d.stage));
    const proposalsPerWeek = isWeekFiltered ? proposalDeals.length : (divisor > 0 ? Math.round(proposalDeals.length / divisor) : 0);
    const proposalDealsAll = aeDeals.filter(d => PROPOSAL_PLUS_STAGES.includes(d.stage));

    const calData = calendarMeetings[target.name];
    const meetingsPerWeek = calData ? calData.meetingsThisWeek : (isWeekFiltered ? aeWeekDeals.length : (divisor > 0 ? Math.round(aeWeekDeals.length / divisor) : 0));
    const meetingsTotal = calData ? calData.meetingsTotal : aeDeals.length;

    const totalDealsForFunnel = aeDeals.length;
    const funnel = FUNNEL_STAGES.map(fs => {
      const count = aeDeals.filter(d => fs.stages.includes(d.stage)).length;
      const pct = totalDealsForFunnel > 0 ? (count / totalDealsForFunnel) * 100 : 0;
      return { key: fs.key, label: fs.label, count, percent: pct };
    });

    const noShows = aeDeals.filter(d => d.stage === NO_SHOW_STAGE).length;
    const unqualified = aeDeals.filter(d => d.stage === UNQUALIFIED_STAGE).length;

    const seguimientosOlvidados: Array<{ id: string; name: string; stage: string; value: number; daysSince: number; severity: string }> = [];
    for (const d of aeDeals) {
      const stageDate = new Date(d.stage_changed_at || d.created_at);
      const daysSince = Math.floor((now.getTime() - stageDate.getTime()) / (1000 * 60 * 60 * 24));
      const staleThreshold = STALE_THRESHOLDS[d.stage];

      if (staleThreshold && daysSince > staleThreshold) {
        const severity = d.stage === STANDBY_STAGE ? "red"
          : d.stage === "🤝 Committed" ? "orange"
          : daysSince > staleThreshold * 2 ? "orange" : "yellow";
        seguimientosOlvidados.push({ id: d.id, name: d.name, stage: d.stage, value: d.value || 0, daysSince, severity });
      } else if (d.stage === "🤝 Committed" && daysSince > 25) {
        seguimientosOlvidados.push({ id: d.id, name: d.name, stage: d.stage, value: d.value || 0, daysSince, severity: "orange" });
      } else if (d.stage === STANDBY_STAGE && daysSince > 30) {
        seguimientosOlvidados.push({ id: d.id, name: d.name, stage: d.stage, value: d.value || 0, daysSince, severity: "red" });
      }
    }
    seguimientosOlvidados.sort((a, b) => b.daysSince - a.daysSince);

    const weeklyBreakdown: Record<string, { meetings: number; proposals: number }> = {};
    if (calData) {
      for (const [wk, data] of Object.entries(calData.weeklyBreakdown)) {
        if (!weeklyBreakdown[wk]) weeklyBreakdown[wk] = { meetings: 0, proposals: 0 };
        weeklyBreakdown[wk].meetings = data.meetings;
      }
    }
    for (const d of aeDeals) {
      const wk = getWeekKey(d.created_at);
      if (!wk) continue;
      if (!weeklyBreakdown[wk]) weeklyBreakdown[wk] = { meetings: 0, proposals: 0 };
      if (!calData) {
        weeklyBreakdown[wk].meetings += 1;
      }
      if (PROPOSAL_PLUS_STAGES.includes(d.stage)) {
        weeklyBreakdown[wk].proposals += 1;
      }
    }

    const percentToTarget = (revenueClosed / target.revenueTarget) * 100;
    const needsCoaching = percentToTarget < 50 ||
      (target.meetingsPerWeek > 0 && meetingsPerWeek < target.meetingsPerWeek * 0.5);

    const aeHotDeals = aeDeals.filter(d => HOT_STAGES.includes(d.stage)).map(d => ({
      id: d.id, name: d.name, value: d.value || 0, stage: d.stage, event: getEventTag(d.event),
    }));

    return {
      name: target.name,
      revenueClosed,
      revenueTarget: target.revenueTarget,
      percentToTarget,
      dealsWon: won.length,
      dealsLost: lost.length,
      dealsOpen: open.length,
      winRate,
      proposalsThisWeek: proposalsPerWeek,
      proposalsTarget: target.proposalsPerWeek,
      meetingsThisWeek: meetingsPerWeek,
      meetingsTarget: target.meetingsPerWeek,
      meetingsTotal,
      proposalsTotal: proposalDealsAll.length,
      needsCoaching,
      weeklyBreakdown,
      hotDeals: aeHotDeals,
      funnel,
      noShows,
      unqualified,
      seguimientosOlvidados,
    };
  });

  return {
    quarter,
    weekFilter: weekFilter || null,
    weeksElapsed,
    quarterWeeks,
    lastUpdated: new Date().toISOString(),
    aeMetrics,
  };
}

// ══════════════════════════════════════════
// SDR DETAIL
// ══════════════════════════════════════════
export function computeSDRData(
  quarter: string,
  weekFilter: string | undefined,
  _allDeals: ProcessedDeal[],
  allMeetings: ProcessedMeetingEntry[],
) {
  void _allDeals;
  const meetings = filterByQuarter(allMeetings, quarter);
  const weeksElapsed = getQuarterWeeksElapsed(quarter);
  const isWeekFiltered = !!weekFilter;
  const weekMeetings = isWeekFiltered ? filterMeetingsByWeek(meetings, weekFilter!) : meetings;
  const divisor = isWeekFiltered ? 1 : weeksElapsed;
  const now = new Date();

  const quarterWeeks = [...new Set(meetings.map(e => e.week_key).filter(Boolean))].sort();
  const currentWeek = getCurrentWeekRange();

  const sdrMetrics = SDR_TARGETS.map(target => {
    const sdrEntries = meetings.filter(e => e.sdr === target.name);
    const sdrWeekEntries = (isWeekFiltered ? weekMeetings : meetings).filter(e => e.sdr === target.name);

    const totalContacts = sdrEntries.length;
    const weekContacts = sdrWeekEntries.length;
    const contactsPerWeek = isWeekFiltered ? weekContacts : (divisor > 0 ? Math.round(totalContacts / divisor) : 0);

    const totalMeetings = sdrEntries.filter(e => MT_MEETING_STAGES.includes(e.stage)).length;
    const weekMeetingsCount = sdrWeekEntries.filter(e => MT_MEETING_STAGES.includes(e.stage)).length;
    const meetingsPerWeek = isWeekFiltered ? weekMeetingsCount : (divisor > 0 ? Math.round(totalMeetings / divisor) : 0);

    const conversionRate = totalContacts > 0 ? (totalMeetings / totalContacts) * 100 : 0;

    const stageBreakdown: Record<string, number> = {};
    for (const e of sdrEntries) {
      stageBreakdown[e.stage] = (stageBreakdown[e.stage] || 0) + 1;
    }

    const weeklyBreakdown: Record<string, { contacts: number; meetings: number }> = {};
    for (const e of sdrEntries) {
      const wk = e.week_key;
      if (!wk) continue;
      if (!weeklyBreakdown[wk]) weeklyBreakdown[wk] = { contacts: 0, meetings: 0 };
      weeklyBreakdown[wk].contacts += 1;
      if (MT_MEETING_STAGES.includes(e.stage)) {
        weeklyBreakdown[wk].meetings += 1;
      }
    }

    const empresasSinAvance: Array<{ id: string; stage: string; daysSince: number; sdr: string }> = [];
    for (const e of sdrEntries) {
      if (e.stage === "Contactado" || e.stage === "Seguimiento") {
        const stageDate = new Date(e.stage_changed_at || e.created_at);
        const daysSince = Math.floor((now.getTime() - stageDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince > 14) {
          empresasSinAvance.push({
            id: e.id,
            stage: e.stage,
            daysSince,
            sdr: e.sdr,
          });
        }
      }
    }
    empresasSinAvance.sort((a, b) => b.daysSince - a.daysSince);

    return {
      name: target.name,
      totalContacts,
      contactsPerWeek,
      contactsTarget: target.contactsPerWeek,
      totalMeetings,
      meetingsPerWeek,
      meetingsTarget: target.meetingsPerWeek,
      conversionRate,
      stageBreakdown,
      weeklyBreakdown,
      empresasSinAvance: empresasSinAvance.slice(0, 20),
      empresasSinAvanceCount: empresasSinAvance.length,
    };
  });

  const overallStageBreakdown: Record<string, number> = {};
  for (const e of meetings) {
    overallStageBreakdown[e.stage] = (overallStageBreakdown[e.stage] || 0) + 1;
  }

  return {
    quarter,
    weekFilter: weekFilter || null,
    weeksElapsed,
    quarterWeeks,
    currentWeek,
    lastUpdated: new Date().toISOString(),
    totalEntries: meetings.length,
    overallStageBreakdown,
    sdrMetrics,
  };
}

// ══════════════════════════════════════════
// PIPELINE REVIEW
// ══════════════════════════════════════════
export const STAGE_PROBABILITIES: Record<string, number> = {
  "Por contactar": 0.05,
  "📅 Agendado": 0.10,
  "Discovery Realizado": 0.20,
  "Propuesta en construcción": 0.40,
  "Propuesta presentada": 0.55,
  "Propuesta en revisión": 0.70,
  "⏳ En Negociación": 0.80,
  "🤝 Committed": 0.90,
  "🎉 Cierre Ganado": 1.00,
  "✅ Reunión Realizada": 0.20,
  "🔄 Follow Up 1 - AE": 0.25,
  "🔄 Follow Up 2 - AE": 0.25,
  "🔁 Follow-up 3 - AE": 0.25,
  "📋 Propuesta Enviada": 0.55,
  "📑 Propuesta en Revisión": 0.70,
};

const DIAGNOSTIC_TRANSITIONS = [
  { from: "Discovery", fromStages: ["Discovery Realizado", "✅ Reunión Realizada", "🔄 Follow Up 1 - AE", "🔄 Follow Up 2 - AE", "🔁 Follow-up 3 - AE", "Propuesta en construcción", "Propuesta presentada", "📋 Propuesta Enviada", "Propuesta en revisión", "📑 Propuesta en Revisión", "⏳ En Negociación", "🤝 Committed", "🎉 Cierre Ganado"], to: "Prop. Presentada", toStages: ["Propuesta presentada", "📋 Propuesta Enviada", "Propuesta en revisión", "📑 Propuesta en Revisión", "⏳ En Negociación", "🤝 Committed", "🎉 Cierre Ganado"], insight: "No llega al decisor o no valida budget en discovery" },
  { from: "Prop. Presentada", fromStages: ["Propuesta presentada", "📋 Propuesta Enviada", "Propuesta en revisión", "📑 Propuesta en Revisión", "⏳ En Negociación", "🤝 Committed", "🎉 Cierre Ganado"], to: "Prop. Revisión", toStages: ["Propuesta en revisión", "📑 Propuesta en Revisión", "⏳ En Negociación", "🤝 Committed", "🎉 Cierre Ganado"], insight: "La propuesta no genera urgencia o no resuelve el dolor" },
  { from: "Negociación", fromStages: ["⏳ En Negociación", "🤝 Committed", "🎉 Cierre Ganado"], to: "Committed", toStages: ["🤝 Committed", "🎉 Cierre Ganado"], insight: "No maneja objeciones o pierde momentum" },
  { from: "Committed", fromStages: ["🤝 Committed", "🎉 Cierre Ganado"], to: "Ganado", toStages: ["🎉 Cierre Ganado"], insight: "Proceso administrativo lento o facturación trabada" },
];

export function computePipelineReviewData(
  quarter: string,
  _weekFilter: string | undefined,
  allDeals: ProcessedDeal[],
  _allMeetings: ProcessedMeetingEntry[],
) {
  void _weekFilter;
  void _allMeetings;
  const deals = filterByQuarter(allDeals, quarter);
  const now = new Date();
  const quarterlyTarget = getQuarterlyTarget(quarter);
  const aeTargets = getAETargets(quarter);
  const weeksElapsed = getQuarterWeeksElapsed(quarter);

  function getDealStatus(deal: ProcessedDeal): "advancing" | "stale" | "stuck" {
    const stageDate = new Date(deal.stage_changed_at || deal.created_at);
    const daysSince = (now.getTime() - stageDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) return "advancing";
    if (daysSince <= 14) return "stale";
    return "stuck";
  }

  function getDealPriority(deal: ProcessedDeal): "urgent" | "attention" | "normal" {
    const stageDate = new Date(deal.stage_changed_at || deal.created_at);
    const daysInStage = Math.floor((now.getTime() - stageDate.getTime()) / (1000 * 60 * 60 * 24));
    if ((deal.value || 0) > 20000 && daysInStage > 7) return "urgent";
    if (daysInStage > 14) return "attention";
    return "normal";
  }

  function daysSince(dateStr: string): number {
    return Math.floor((now.getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  }

  const wonDeals = deals.filter(d => d.stage === "🎉 Cierre Ganado");
  const committedDeals = deals.filter(d => d.stage === "🤝 Committed");
  const revenueClosed = wonDeals.reduce((s, d) => s + (d.value || 0), 0) + committedDeals.reduce((s, d) => s + (d.value || 0), 0);
  const openDeals = deals.filter(d => ACTIVE_STAGES.includes(d.stage));
  const pipelineActive = openDeals.reduce((s, d) => s + (d.value || 0), 0);
  const gap = quarterlyTarget - revenueClosed;
  const pipelineCoverage = gap > 0 ? pipelineActive / gap : 0;

  const weightedPipeline = openDeals.reduce((sum, d) => {
    const prob = STAGE_PROBABILITIES[d.stage] || 0;
    return sum + (d.value || 0) * prob;
  }, 0);

  const dealsAtRisk = openDeals.filter(d => {
    const status = getDealStatus(d);
    return status === "stale" || status === "stuck";
  });
  const dealsAtRiskValue = dealsAtRisk.reduce((s, d) => s + (d.value || 0), 0);

  const forecastWon = wonDeals.reduce((s, d) => s + (d.value || 0), 0) + committedDeals.reduce((s, d) => s + (d.value || 0), 0);
  const commitWeighted = committedDeals.reduce((s, d) => s + (d.value || 0) * 0.90, 0);
  const BEST_CASE_STAGES = ["Propuesta en revisión", "📑 Propuesta en Revisión", "⏳ En Negociación"];
  const bestCaseEligible = deals.filter(d => BEST_CASE_STAGES.includes(d.stage));
  const bestCaseDeals = bestCaseEligible.filter(d => {
    const stageDate = new Date(d.stage_changed_at || d.created_at);
    return (now.getTime() - stageDate.getTime()) / (1000 * 60 * 60 * 24) < 14;
  });
  const bestCaseWeighted = bestCaseDeals.reduce((s, d) => s + (d.value || 0) * 0.50, 0);
  const forecastTotal = forecastWon + commitWeighted + bestCaseWeighted;
  const forecastGap = quarterlyTarget - forecastTotal;

  const kpis = {
    revenueClosed,
    target: quarterlyTarget,
    pipelineActive,
    pipelineCoverage,
    weightedPipeline,
    dealsAtRisk: dealsAtRisk.length,
    dealsAtRiskValue,
    forecast: {
      won: forecastWon,
      commit: committedDeals.reduce((s, d) => s + (d.value || 0), 0),
      commitWeighted,
      bestCase: bestCaseDeals.reduce((s, d) => s + (d.value || 0), 0),
      bestCaseWeighted,
      total: forecastTotal,
      gap: forecastGap,
    },
  };

  const stageBreakdown = PIPELINE_DISPLAY_ORDER.map(group => {
    const groupDeals = deals.filter(d => group.stages.includes(d.stage));
    const totalValue = groupDeals.reduce((s, d) => s + (d.value || 0), 0);
    const avgDaysArr = groupDeals.map(d => daysSince(d.stage_changed_at || d.created_at));
    return {
      stage: group.label,
      deals: groupDeals.length,
      totalValue,
      avgValue: groupDeals.length > 0 ? Math.round(totalValue / groupDeals.length) : 0,
      avgDaysInStage: avgDaysArr.length > 0 ? Math.round(avgDaysArr.reduce((a, b) => a + b, 0) / avgDaysArr.length) : 0,
    };
  }).filter(s => s.deals > 0);

  const conversionPairs = [
    { from: "Discovery", fromStages: ["Discovery Realizado", "✅ Reunión Realizada", "🔄 Follow Up 1 - AE", "🔄 Follow Up 2 - AE", "🔁 Follow-up 3 - AE", "Propuesta en construcción", "Propuesta presentada", "📋 Propuesta Enviada", "Propuesta en revisión", "📑 Propuesta en Revisión", "⏳ En Negociación", "🤝 Committed", "🎉 Cierre Ganado"], to: "Prop. Presentada", toStages: ["Propuesta presentada", "📋 Propuesta Enviada", "Propuesta en revisión", "📑 Propuesta en Revisión", "⏳ En Negociación", "🤝 Committed", "🎉 Cierre Ganado"] },
    { from: "Prop. Presentada", fromStages: ["Propuesta presentada", "📋 Propuesta Enviada", "Propuesta en revisión", "📑 Propuesta en Revisión", "⏳ En Negociación", "🤝 Committed", "🎉 Cierre Ganado"], to: "Prop. Revisión", toStages: ["Propuesta en revisión", "📑 Propuesta en Revisión", "⏳ En Negociación", "🤝 Committed", "🎉 Cierre Ganado"] },
    { from: "Prop. Revisión", fromStages: ["Propuesta en revisión", "📑 Propuesta en Revisión", "⏳ En Negociación", "🤝 Committed", "🎉 Cierre Ganado"], to: "Negociación", toStages: ["⏳ En Negociación", "🤝 Committed", "🎉 Cierre Ganado"] },
    { from: "Negociación", fromStages: ["⏳ En Negociación", "🤝 Committed", "🎉 Cierre Ganado"], to: "Committed", toStages: ["🤝 Committed", "🎉 Cierre Ganado"] },
    { from: "Committed", fromStages: ["🤝 Committed", "🎉 Cierre Ganado"], to: "Ganado", toStages: ["🎉 Cierre Ganado"] },
  ];

  const conversions = conversionPairs.map(({ from, fromStages, to, toStages }) => {
    const fromCount = deals.filter(d => fromStages.includes(d.stage)).length;
    const toCount = deals.filter(d => toStages.includes(d.stage)).length;
    const rate = fromCount > 0 ? Math.round((toCount / fromCount) * 100) : 0;
    return { from, to, rate, isLow: rate < 30 };
  });

  const currentWeekKey = getCurrentWeekRange().weekKey;
  const prevWeekDate = new Date(now);
  prevWeekDate.setDate(prevWeekDate.getDate() - 7);
  const prevWeekKey = getWeekKey(prevWeekDate.toISOString());

  function toCohortDeal(d: ProcessedDeal) {
    return {
      id: d.id,
      name: d.name,
      ae: toCombinedAE(normalizeAE(d.contacto_ae), quarter),
      stage: d.stage,
      value: d.value || 0,
      daysSinceCreation: daysSince(d.created_at),
      event: getEventTag(d.event),
      status: getDealStatus(d),
    };
  }

  const cohorts = {
    thisWeek: deals.filter(d => getWeekKey(d.created_at) === currentWeekKey).map(toCohortDeal),
    lastWeek: deals.filter(d => getWeekKey(d.created_at) === prevWeekKey).map(toCohortDeal),
  };

  const MID_FUNNEL_STAGES = [
    "Propuesta en construcción",
    "Propuesta presentada",
    "Propuesta en revisión",
    "⏳ En Negociación",
    "🤝 Committed",
    "📋 Propuesta Enviada",
    "📑 Propuesta en Revisión",
  ];
  const midFunnelDeals = deals.filter(d => MID_FUNNEL_STAGES.includes(d.stage));

  const AGING_BUCKETS = [
    { key: "0-7d", label: "Esta semana", min: 0, max: 7 },
    { key: "8-14d", label: "Hace 1 sem", min: 8, max: 14 },
    { key: "15-21d", label: "Hace 2 sem", min: 15, max: 21 },
    { key: "22-28d", label: "Hace 3 sem", min: 22, max: 28 },
    { key: "29+d", label: "Hace 4+ sem", min: 29, max: 9999 },
  ];

  const midFunnelAging = AGING_BUCKETS.map(bucket => {
    const bucketDeals = midFunnelDeals.filter(d => {
      const days = daysSince(d.stage_changed_at || d.created_at);
      return days >= bucket.min && days <= bucket.max;
    });
    return {
      key: bucket.key,
      label: bucket.label,
      deals: bucketDeals.length,
      totalValue: bucketDeals.reduce((s, d) => s + (d.value || 0), 0),
      items: bucketDeals.map(d => ({
        id: d.id,
        name: d.name,
        ae: toCombinedAE(normalizeAE(d.contacto_ae), quarter),
        stage: d.stage,
        value: d.value || 0,
        daysInStage: daysSince(d.stage_changed_at || d.created_at),
        event: getEventTag(d.event),
        status: getDealStatus(d),
      })).sort((a, b) => b.value - a.value),
    };
  });

  const killOrAdvance: Array<{
    id: string; name: string; ae: string; stage: string;
    value: number; daysStale: number; event: string;
    recommendation: "kill" | "advance";
  }> = [];

  for (const deal of deals) {
    const threshold = STALE_THRESHOLDS[deal.stage];
    if (!threshold) continue;
    const daysStale = daysSince(deal.stage_changed_at || deal.created_at);
    if (daysStale > threshold) {
      killOrAdvance.push({
        id: deal.id,
        name: deal.name,
        ae: toCombinedAE(normalizeAE(deal.contacto_ae), quarter),
        stage: deal.stage,
        value: deal.value || 0,
        daysStale,
        event: getEventTag(deal.event),
        recommendation: daysStale > threshold * 2 ? "kill" : "advance",
      });
    }
  }
  killOrAdvance.sort((a, b) => b.daysStale - a.daysStale);
  const killOrAdvanceTotalValue = killOrAdvance.reduce((s, d) => s + d.value, 0);

  const teamConversionRates: Record<string, number> = {};
  for (const t of DIAGNOSTIC_TRANSITIONS) {
    const key = `${t.from}→${t.to}`;
    const fromCount = deals.filter(d => [...t.fromStages, ...t.toStages].includes(d.stage) || d.stage === "🎉 Cierre Ganado" || d.stage === "❌ Cierre Perdido").length;
    const toCount = deals.filter(d => t.toStages.includes(d.stage)).length;
    teamConversionRates[key] = fromCount > 0 ? Math.round((toCount / fromCount) * 100) : 0;
  }

  // GCal stubbed
  const calendarMeetings: Record<string, { meetingsThisWeek: number; meetingsTotal: number; weeklyBreakdown: Record<string, { meetings: number }> }> = {};

  const aeScoreCards = aeTargets.map(target => {
    const aeDeals = deals.filter(d => dealMatchesAE(d, target.name, quarter));
    const aeWon = aeDeals.filter(d => WON_STAGES.includes(d.stage));
    const aeLost = aeDeals.filter(d => d.stage === LOST_STAGE);
    const aeOpen = aeDeals.filter(d => ACTIVE_STAGES.includes(d.stage));
    const aeRevenueClosed = aeWon.reduce((s, d) => s + (d.value || 0), 0);
    const totalDecisions = aeWon.length + aeLost.length;
    const winRate = totalDecisions > 0 ? Math.round((aeWon.length / totalDecisions) * 100) : 0;
    const pipelinePersonal = aeOpen.reduce((s, d) => s + (d.value || 0), 0);
    const aeGap = target.revenueTarget - aeRevenueClosed;
    const aePipelineCoverage = aeGap > 0 ? pipelinePersonal / aeGap : 0;

    const proportionalTarget = target.revenueTarget * (weeksElapsed / 13);
    const ratio = proportionalTarget > 0 ? aeRevenueClosed / proportionalTarget : 0;
    let aeStatus: "on_track" | "at_risk" | "coaching";
    if (ratio >= 0.70) aeStatus = "on_track";
    else if (ratio >= 0.50) aeStatus = "at_risk";
    else aeStatus = "coaching";

    const calData = calendarMeetings[target.name];
    const meetingsThisWeek = calData ? calData.meetingsThisWeek : 0;
    const proposalDeals = aeDeals.filter(d => PROPOSAL_PLUS_STAGES.includes(d.stage));
    const proposalsThisWeek = proposalDeals.length;

    const activeDays = aeOpen.map(d => daysSince(d.created_at));
    const avgDaysInPipeline = activeDays.length > 0 ? Math.round(activeDays.reduce((a, b) => a + b, 0) / activeDays.length) : 0;

    const lifecycleDays = aeWon.map(d => {
      const created = new Date(d.created_at).getTime();
      const closed = new Date(d.stage_changed_at || d.created_at).getTime();
      return Math.max(0, Math.round((closed - created) / (1000 * 60 * 60 * 24)));
    });
    const avgLifecycleDays = lifecycleDays.length > 0
      ? Math.round(lifecycleDays.reduce((a, b) => a + b, 0) / lifecycleDays.length)
      : 0;

    const winRateDecimal = winRate / 100;
    const requiredPipeline = aeGap > 0 && winRateDecimal > 0
      ? Math.round(aeGap / winRateDecimal)
      : aeGap > 0 ? Infinity : 0;
    const pipelineCoveragePersonal = requiredPipeline > 0 && requiredPipeline !== Infinity
      ? pipelinePersonal / (requiredPipeline as number)
      : 0;

    const aeDisqualified = aeDeals.filter(d => DISQUALIFIED_STAGES.includes(d.stage));
    const disqualificationRatio = aeDeals.length > 0 ? Math.round((aeDisqualified.length / aeDeals.length) * 100) : 0;

    const aeStageBreakdown = PIPELINE_DISPLAY_ORDER.map(group => {
      const groupDeals = aeDeals.filter(d => group.stages.includes(d.stage));
      return {
        stage: group.label,
        deals: groupDeals.length,
        value: groupDeals.reduce((s, d) => s + (d.value || 0), 0),
      };
    }).filter(s => s.deals > 0);

    const aeCommittedDeals = aeDeals.filter(d => d.stage === "🤝 Committed");
    const aeWonValue = aeWon.reduce((s, d) => s + (d.value || 0), 0) + aeCommittedDeals.reduce((s, d) => s + (d.value || 0), 0);
    const aeCommitWeighted = aeCommittedDeals.reduce((s, d) => s + (d.value || 0) * 0.90, 0);
    const aeBestCaseEligible = aeDeals.filter(d => ["Propuesta en revisión", "📑 Propuesta en Revisión", "⏳ En Negociación"].includes(d.stage));
    const aeBestCase = aeBestCaseEligible.filter(d => {
      return (now.getTime() - new Date(d.stage_changed_at || d.created_at).getTime()) / (1000 * 60 * 60 * 24) < 14;
    });
    const aeBestCaseWeighted = aeBestCase.reduce((s, d) => s + (d.value || 0) * 0.50, 0);
    const aeForecastTotal = aeWonValue + aeCommitWeighted + aeBestCaseWeighted;
    const aeForecastGap = target.revenueTarget - aeForecastTotal;
    const contributionPercent = forecastTotal > 0 ? Math.round((aeForecastTotal / forecastTotal) * 100) : 0;

    const dealsList = aeOpen.map(d => {
      const daysInStage = daysSince(d.stage_changed_at || d.created_at);
      const daysTotal = daysSince(d.created_at);
      return {
        id: d.id,
        name: d.name,
        stage: d.stage,
        value: d.value || 0,
        event: getEventTag(d.event),
        daysInStage,
        daysTotal,
        status: getDealStatus(d),
        priority: getDealPriority(d),
      };
    }).sort((a, b) => b.value - a.value);

    const seguimientosOlvidados: Array<{ id: string; name: string; stage: string; value: number; daysSince: number; severity: string }> = [];
    for (const d of aeDeals) {
      const ds = daysSince(d.stage_changed_at || d.created_at);
      const staleThreshold = STALE_THRESHOLDS[d.stage];
      if (staleThreshold && ds > staleThreshold) {
        const severity = d.stage === STANDBY_STAGE ? "red"
          : d.stage === "🤝 Committed" ? "orange"
          : ds > staleThreshold * 2 ? "orange" : "yellow";
        seguimientosOlvidados.push({ id: d.id, name: d.name, stage: d.stage, value: d.value || 0, daysSince: ds, severity });
      } else if (d.stage === "🤝 Committed" && ds > 25) {
        seguimientosOlvidados.push({ id: d.id, name: d.name, stage: d.stage, value: d.value || 0, daysSince: ds, severity: "orange" });
      } else if (d.stage === STANDBY_STAGE && ds > 30) {
        seguimientosOlvidados.push({ id: d.id, name: d.name, stage: d.stage, value: d.value || 0, daysSince: ds, severity: "red" });
      }
    }
    seguimientosOlvidados.sort((a, b) => b.daysSince - a.daysSince);

    const diagnostics: Array<{ transition: string; aeRate: number; teamRate: number; delta: number; insight: string }> = [];
    for (const t of DIAGNOSTIC_TRANSITIONS) {
      const key = `${t.from}→${t.to}`;
      const aeFromCount = aeDeals.filter(d => [...t.fromStages, ...t.toStages].includes(d.stage) || d.stage === "🎉 Cierre Ganado" || d.stage === "❌ Cierre Perdido").length;
      const aeToCount = aeDeals.filter(d => t.toStages.includes(d.stage)).length;
      const aeRate = aeFromCount > 0 ? Math.round((aeToCount / aeFromCount) * 100) : 0;
      const teamRate = teamConversionRates[key] || 0;
      const delta = aeRate - teamRate;
      if (delta < -10) {
        diagnostics.push({ transition: key, aeRate, teamRate, delta, insight: t.insight });
      }
    }

    return {
      name: target.name,
      revenueClosed: aeRevenueClosed,
      revenueTarget: target.revenueTarget,
      percentToTarget: target.revenueTarget > 0 ? Math.round((aeRevenueClosed / target.revenueTarget) * 100) : 0,
      status: aeStatus,
      winRate,
      pipelinePersonal,
      pipelineCoverage: aePipelineCoverage,
      pipelineCoveragePersonal,
      requiredPipeline: requiredPipeline === Infinity ? -1 : (requiredPipeline as number),
      avgLifecycleDays,
      meetingsThisWeek,
      meetingsTarget: target.meetingsPerWeek,
      proposalsThisWeek,
      proposalsTarget: target.proposalsPerWeek,
      avgDaysInPipeline,
      disqualificationRatio,
      stageBreakdown: aeStageBreakdown,
      forecast: {
        won: aeWonValue,
        commitWeighted: aeCommitWeighted,
        bestCaseWeighted: aeBestCaseWeighted,
        total: aeForecastTotal,
        gap: aeForecastGap,
        contributionPercent,
      },
      deals: dealsList,
      seguimientosOlvidados,
      diagnostics,
    };
  });

  return {
    quarter,
    quarterlyTarget,
    kpis,
    stageBreakdown,
    conversions,
    cohorts,
    midFunnelAging,
    killOrAdvance,
    killOrAdvanceTotalValue,
    aeScoreCards,
    lastUpdated: new Date().toISOString(),
  };
}
