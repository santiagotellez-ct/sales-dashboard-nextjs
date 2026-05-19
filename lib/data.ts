// ── V2 Dashboard Types & Utilities

// ══════════════════════════════════════════
// EXECUTIVE VIEW
// ══════════════════════════════════════════
export interface RevenueMetrics {
  totalClosed: number;
  quarterlyTarget: number;
  gap: number;
  pipelineValue: number;
  hotDealsValue: number;
  hotDealsCount: number;
  pipelineAEValue: number;
  pipelineAECount: number;
  percentComplete: number;
  pipelineCoverage: number;
}

export interface AESummary {
  name: string;
  revenueClosed: number;
  revenueTarget: number;
  percentToTarget: number;
  dealsWon: number;
  dealsOpen: number;
}

export interface SDRSummary {
  name: string;
  totalContacts: number;
  totalMeetings: number;
  contactsTarget: number;
  meetingsTarget: number;
}

export interface StageData {
  stage: string;
  count: number;
  value: number;
}

export interface PipelineMetrics {
  overallWinRate: number;
  pipelineCoverage: number;
  totalActiveDeals: number;
  totalActiveValue: number;
  standByDeals: number;
  standByValue: number;
  lostDeals: number;
  lostValue: number;
}

export interface AlertItem {
  type: "danger" | "warning" | "info";
  title: string;
  description: string;
}

export interface HotDeal {
  id: string;
  name: string;
  ae: string;
  value: number;
  stage: string;
  event: string;  // C3: AI Summit / CTW / Ambos
}

export interface StaleDeal {
  id: string;
  name: string;
  ae: string;
  value: number;
  stage: string;
  daysSince: number;
  event: string;  // C3: AI Summit / CTW / Ambos
}

// C5: Revenue weekly progress point
export interface RevenueWeeklyPoint {
  week: string;
  actual: number;
  target: number;
}

export interface CacheInfo {
  cached: boolean;
  age: number;
  dealCount: number;
  meetingCount: number;
}

// C3: Flujo SDR → AE
export interface FlujoTrendPoint {
  week: string;
  agendados: number;
  reuniones: number;
  conversion: number;
}

export interface FlujoSDRAE {
  agendados: number;
  reuniones: number;
  gap: number;
  conversion: number;
  trend: FlujoTrendPoint[];
}

export interface ExecutiveData {
  quarter: string;
  weekFilter: string | null;
  weeksElapsed: number;
  quarterWeeks: string[];
  totalDeals: number;
  totalMeetingEntries: number;
  lastUpdated: string;
  cache: CacheInfo;
  revenue: RevenueMetrics;
  aeSummary: AESummary[];
  sdrSummary: SDRSummary[];
  flujoSDRAE: FlujoSDRAE;
  stageDistribution: StageData[];
  pipeline: PipelineMetrics;
  alerts: AlertItem[];
  hotDeals: HotDeal[];
  staleDeals: StaleDeal[];
  revenueWeekly: RevenueWeeklyPoint[];  // C5
}

// ══════════════════════════════════════════
// AE DETAIL
// ══════════════════════════════════════════
export interface WeeklyBreakdown {
  [weekKey: string]: { meetings: number; proposals: number };
}

export interface AEHotDeal {
  id: string;
  name: string;
  value: number;
  stage: string;
  event: string;  // C3
}

// C4: Funnel step
export interface FunnelStep {
  key: string;
  label: string;
  count: number;
  percent: number;
}

// C7: Seguimiento olvidado
export interface SeguimientoOlvidado {
  id: string;
  name: string;
  stage: string;
  value: number;
  daysSince: number;
  severity: "yellow" | "orange" | "red";
}

export interface AEMetrics {
  name: string;
  revenueClosed: number;
  revenueTarget: number;
  percentToTarget: number;
  dealsWon: number;
  dealsLost: number;
  dealsOpen: number;
  winRate: number;
  proposalsThisWeek: number;
  proposalsTarget: number;
  meetingsThisWeek: number;
  meetingsTarget: number;
  meetingsTotal: number;
  proposalsTotal: number;
  needsCoaching: boolean;
  weeklyBreakdown: WeeklyBreakdown;
  hotDeals: AEHotDeal[];
  funnel: FunnelStep[];
  noShows: number;
  unqualified: number;
  seguimientosOlvidados: SeguimientoOlvidado[];
}

export interface AEData {
  quarter: string;
  weekFilter: string | null;
  weeksElapsed: number;
  quarterWeeks: string[];
  cache: CacheInfo;
  lastUpdated: string;
  aeMetrics: AEMetrics[];
}

// ══════════════════════════════════════════
// SDR DETAIL
// ══════════════════════════════════════════
export interface SDRWeeklyBreakdown {
  [weekKey: string]: { contacts: number; meetings: number };
}

// C6: Empresa sin avance
export interface EmpresaSinAvance {
  id: string;
  stage: string;
  daysSince: number;
  sdr: string;
}

// C9: Current week info
export interface CurrentWeekInfo {
  weekKey: string;
  start: string;
  end: string;
  label: string;
}

export interface SDRMetrics {
  name: string;
  totalContacts: number;
  contactsPerWeek: number;
  contactsTarget: number;
  totalMeetings: number;
  meetingsPerWeek: number;
  meetingsTarget: number;
  conversionRate: number;
  stageBreakdown: Record<string, number>;
  weeklyBreakdown: SDRWeeklyBreakdown;
  empresasSinAvance: EmpresaSinAvance[];
  empresasSinAvanceCount: number;
}

export interface SDRData {
  quarter: string;
  weekFilter: string | null;
  weeksElapsed: number;
  quarterWeeks: string[];
  currentWeek: CurrentWeekInfo;
  cache: CacheInfo;
  lastUpdated: string;
  totalEntries: number;
  overallStageBreakdown: Record<string, number>;
  sdrMetrics: SDRMetrics[];
}

// ══════════════════════════════════════════
// PIPELINE REVIEW
// ══════════════════════════════════════════
export interface ForecastData {
  won: number;
  commit: number;
  commitWeighted: number;
  bestCase: number;
  bestCaseWeighted: number;
  total: number;
  gap: number;
}

export interface PipelineKPIs {
  revenueClosed: number;
  target: number;
  pipelineActive: number;
  pipelineCoverage: number;
  weightedPipeline: number;
  dealsAtRisk: number;
  dealsAtRiskValue: number;
  forecast: ForecastData;
}

export interface StageBreakdownItem {
  stage: string;
  deals: number;
  totalValue: number;
  avgValue: number;
  avgDaysInStage: number;
}

export interface ConversionItem {
  from: string;
  to: string;
  rate: number;
  isLow: boolean;
}

export interface CohortDeal {
  id: string;
  name: string;
  ae: string;
  stage: string;
  value: number;
  daysSinceCreation: number;
  event: string;
  status: "advancing" | "stale" | "stuck";
}

export interface KillOrAdvanceDeal {
  id: string;
  name: string;
  ae: string;
  stage: string;
  value: number;
  daysStale: number;
  event: string;
  recommendation: "kill" | "advance";
}

export interface AEScorecardStageBreakdown {
  stage: string;
  deals: number;
  value: number;
}

export interface AEScorecardForecast {
  won: number;
  commitWeighted: number;
  bestCaseWeighted: number;
  total: number;
  gap: number;
  contributionPercent: number;
}

export interface AEScorecardDeal {
  id: string;
  name: string;
  stage: string;
  value: number;
  event: string;
  daysInStage: number;
  daysTotal: number;
  status: "advancing" | "stale" | "stuck";
  priority: "urgent" | "attention" | "normal";
}

export interface AEScorecardSeguimiento {
  id: string;
  name: string;
  stage: string;
  value: number;
  daysSince: number;
  severity: string;
}

export interface AEScorecardDiagnostic {
  transition: string;
  aeRate: number;
  teamRate: number;
  delta: number;
  insight: string;
}

export interface AEScorecard {
  name: string;
  revenueClosed: number;
  revenueTarget: number;
  percentToTarget: number;
  status: "on_track" | "at_risk" | "coaching";
  winRate: number;
  pipelinePersonal: number;
  pipelineCoverage: number;
  pipelineCoveragePersonal: number;
  requiredPipeline: number;  // -1 means Infinity (0% win rate)
  avgLifecycleDays: number;
  meetingsThisWeek: number;
  meetingsTarget: number;
  proposalsThisWeek: number;
  proposalsTarget: number;
  avgDaysInPipeline: number;
  disqualificationRatio: number;
  stageBreakdown: AEScorecardStageBreakdown[];
  forecast: AEScorecardForecast;
  deals: AEScorecardDeal[];
  seguimientosOlvidados: AEScorecardSeguimiento[];
  diagnostics: AEScorecardDiagnostic[];
}

export interface PipelineReviewData {
  quarter: string;
  quarterlyTarget: number;
  kpis: PipelineKPIs;
  stageBreakdown: StageBreakdownItem[];
  conversions: ConversionItem[];
  cohorts: {
    thisWeek: CohortDeal[];
    lastWeek: CohortDeal[];
  };
  midFunnelAging: MidFunnelAgingBucket[];
  killOrAdvance: KillOrAdvanceDeal[];
  killOrAdvanceTotalValue: number;
  aeScoreCards: AEScorecard[];
  lastUpdated: string;
  cache: CacheInfo;
}

export interface MidFunnelAgingItem {
  id: string;
  name: string;
  ae: string;
  stage: string;
  value: number;
  daysInStage: number;
  event: string;
  status: "advancing" | "stale" | "stuck";
}

export interface MidFunnelAgingBucket {
  key: string;
  label: string;
  deals: number;
  totalValue: number;
  items: MidFunnelAgingItem[];
}

// ── Formatting utilities
export function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value.toFixed(0)}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-CO").format(Math.round(value));
}

export function formatWeekLabel(weekKey: string): string {
  const match = weekKey.match(/W(\d+)/);
  if (!match) return weekKey;
  return `Sem ${parseInt(match[1])}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(0)}%`;
}
