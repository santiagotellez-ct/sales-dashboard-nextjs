'use client';

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign, Target, TrendingUp, AlertTriangle,
  Users, Phone, Flame, Clock, BarChart3,
  CheckCircle2, XCircle, AlertCircle, ArrowUpRight, ArrowDownRight,
  Zap, CalendarDays, Building2, UserCheck, Contact,
  ArrowRight, GitBranch, Ban, ShieldAlert, Tag
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend, Cell, LineChart, Line, AreaChart, Area,
  ReferenceLine, ComposedChart
} from "recharts";
// Lightweight API helper — Next.js handles the same-origin /api routes directly.
async function apiRequest(_method: string, url: string): Promise<Response> {
  const res = await fetch(url, { method: _method });
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  return res;
}
import {
  formatCurrency, formatNumber, formatWeekLabel, formatPercent,
  type ExecutiveData, type AEData, type SDRData, type PipelineReviewData,
  type AlertItem, type StageData, type FunnelStep, type SeguimientoOlvidado,
  type RevenueWeeklyPoint, type AEScorecard, type AEScorecardDeal
} from "@/lib/data";

const COLORS = {
  primary: "hsl(210, 100%, 52%)",
  success: "hsl(160, 60%, 45%)",
  warning: "hsl(45, 90%, 55%)",
  danger: "hsl(0, 72%, 51%)",
  purple: "hsl(280, 60%, 55%)",
  muted: "hsl(220, 10%, 45%)",
  chart: [
    "hsl(210, 100%, 52%)", "hsl(160, 60%, 45%)", "hsl(45, 90%, 55%)",
    "hsl(280, 60%, 55%)", "hsl(350, 70%, 55%)", "hsl(30, 80%, 55%)",
  ],
};

const STAGE_COLORS: Record<string, string> = {
  "Por contactar": "bg-slate-500",
  "📅 Agendado": "bg-blue-400",
  "Discovery Realizado": "bg-cyan-500",
  "Propuesta en construcción": "bg-indigo-500",
  "Propuesta presentada": "bg-purple-500",
  "Propuesta en revisión": "bg-fuchsia-500",
  "⏳ En Negociación": "bg-amber-500",
  "🤝 Committed": "bg-orange-500",
  "🎉 Cierre Ganado": "bg-emerald-500",
  "❌ Cierre Perdido": "bg-red-500",
  "Stand By": "bg-gray-500",
  // Legacy stages
  "✅ Reunión Realizada": "bg-cyan-500",
  "🔄 Follow Up 1 - AE": "bg-cyan-400",
  "🔄 Follow Up 2 - AE": "bg-cyan-400",
  "🔁 Follow-up 3 - AE": "bg-cyan-400",
  "📋 Propuesta Enviada": "bg-purple-500",
  "📑 Propuesta en Revisión": "bg-fuchsia-500",
  // Grouped display labels
  "Discovery": "bg-cyan-500",
  "Prop. Construcción": "bg-indigo-500",
  "Prop. Presentada": "bg-purple-500",
  "Prop. en Revisión": "bg-fuchsia-500",
  "Negociación": "bg-amber-500",
  "Committed": "bg-orange-500",
  "Cierre Ganado": "bg-emerald-500",
  "Agendado": "bg-blue-400",
};

const STAGE_SHORT: Record<string, string> = {
  "Por contactar": "Por contactar",
  "📅 Agendado": "Agendado",
  "Discovery Realizado": "Discovery",
  "Propuesta en construcción": "Prop. Construcción",
  "Propuesta presentada": "Prop. Presentada",
  "Propuesta en revisión": "Prop. Revisión",
  "⏳ En Negociación": "Negociación",
  "🤝 Committed": "Committed",
  "🎉 Cierre Ganado": "Ganado",
  "❌ Cierre Perdido": "Perdido",
  "Stand By": "Stand By",
  // Legacy stages
  "✅ Reunión Realizada": "Discovery (leg.)",
  "🔄 Follow Up 1 - AE": "Follow Up 1",
  "🔄 Follow Up 2 - AE": "Follow Up 2",
  "🔁 Follow-up 3 - AE": "Follow Up 3",
  "📋 Propuesta Enviada": "Prop. Env. (leg.)",
  "📑 Propuesta en Revisión": "Prop. Rev. (leg.)",
};

const MT_STAGE_COLORS: Record<string, string> = {
  "No Stage": "bg-slate-500",
  "Contactado": "bg-blue-500",
  "Seguimiento": "bg-cyan-500",
  "Agendado": "bg-emerald-500",
  "No Show": "bg-red-400",
  "Unqualified": "bg-gray-500",
};

// ═══════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════

function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue }: {
  title: string;
  value: string;
  subtitle?: string;
  icon: any;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  return (
    <Card className="border border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">{title}</p>
            <p className="text-xl font-bold mt-1 tabular-nums text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <div className="p-1 text-muted-foreground shrink-0 ml-3">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        {trend && trendValue && (
          <div className="flex items-center gap-1 mt-2 text-xs font-medium text-muted-foreground">
            {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
            {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RevenueGauge({ percent }: { percent: number }) {
  const data = [{ name: "Revenue", value: Math.min(percent, 100), fill: percent >= 80 ? COLORS.success : percent >= 50 ? COLORS.warning : COLORS.danger }];
  return (
    <ResponsiveContainer width="100%" height={160}>
      <RadialBarChart cx="50%" cy="85%" innerRadius="60%" outerRadius="100%" startAngle={180} endAngle={0} data={data} barSize={14}>
        <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "hsl(220,10%,20%)" }} />
        <text x="50%" y="74%" textAnchor="middle" className="fill-foreground text-2xl font-bold">{percent.toFixed(1)}%</text>
        <text x="50%" y="90%" textAnchor="middle" className="fill-muted-foreground text-xs">de la meta</text>
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

function StageBar({ stage, count, value, maxValue }: { stage: string; count: number; value: number; maxValue: number }) {
  const percent = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const bgClass = STAGE_COLORS[stage] || "bg-primary";
  const shortLabel = STAGE_SHORT[stage] || stage;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs text-muted-foreground w-28 truncate shrink-0" title={stage}>{shortLabel}</span>
      <div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden relative">
        <div className={`h-full ${bgClass} rounded-sm transition-all duration-500`} style={{ width: `${Math.max(percent, 2)}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums w-8 text-right">{count}</span>
      <span className="text-xs text-muted-foreground tabular-nums w-16 text-right">{formatCurrency(value)}</span>
    </div>
  );
}

function AlertCard({ alert }: { alert: AlertItem }) {
  const config = {
    danger: { icon: AlertTriangle },
    warning: { icon: AlertCircle },
    info: { icon: Flame },
  }[alert.type] || { icon: AlertCircle };
  const Icon = config.icon;
  return (
    <div className="flex gap-3 p-3 rounded-lg border border-border">
      <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{alert.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{alert.description}</p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-3">
        <Skeleton className="lg:col-span-2 h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB 1: EXECUTIVE VIEW
// ═══════════════════════════════════════════════

// C2: Helper to resolve the current ISO week key
function getCurrentWeekKey(): string {
  const now = new Date();
  const day = now.getDay() || 7; // 1=Mon..7=Sun
  const thursday = new Date(now);
  thursday.setDate(now.getDate() + (4 - day));
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((thursday.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${thursday.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

// C2: Resolve weekFilter to actual API parameter
function resolveWeekFilter(weekFilter: string): string | null {
  if (weekFilter === "acumulado") return null; // no week filter = all data
  if (weekFilter === "current") return getCurrentWeekKey();
  return weekFilter; // specific week key like "2026-W12"
}

function ExecutiveView({ quarter, weekFilter }: { quarter: string; weekFilter: string }) {
  const resolvedWeek = resolveWeekFilter(weekFilter);
  const weekParam = resolvedWeek ? `?week=${encodeURIComponent(resolvedWeek)}` : "";
  const { data, isLoading, error } = useQuery<ExecutiveData>({
    queryKey: ["/api/executive", quarter, resolvedWeek || "all"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/executive/${encodeURIComponent(quarter)}${weekParam}`);
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });

  if (isLoading || !data) return <LoadingSkeleton />;
  if (error) return <div className="p-8 text-center text-foreground">Error: {(error as Error).message}</div>;

  const { revenue, aeSummary, sdrSummary, flujoSDRAE, stageDistribution, pipeline, alerts, hotDeals, staleDeals, revenueWeekly } = data;
  const maxStageValue = Math.max(...stageDistribution.map(s => s.value), 1);

  const aeChartData = aeSummary.map(ae => ({
    name: ae.name === "María José" ? "Ma. José" : ae.name === "Santiago / Nathalia" ? "Santi/Nath" : ae.name,
    cerrado: ae.revenueClosed,
    meta: ae.revenueTarget,
  }));

  return (
    <div className="space-y-6">
      {/* Revenue KPIs */}
      <section data-testid="exec-revenue">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-4 w-4 text-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Revenue y Metas</h2>
          <span className="text-xs text-muted-foreground ml-1">{quarter} · {data.totalDeals} deals</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <KPICard
            title="Revenue Cerrado"
            value={formatCurrency(revenue.totalClosed)}
            subtitle={`de ${formatCurrency(revenue.quarterlyTarget)} (Ganado + Committed)`}
            icon={DollarSign}
            variant={revenue.percentComplete >= 80 ? "success" : revenue.percentComplete >= 50 ? "warning" : "danger"}
            trend={revenue.percentComplete >= 70 ? "up" : "down"}
            trendValue={`${revenue.percentComplete.toFixed(1)}% completado`}
          />
          <KPICard
            title="Revenue Pipeline"
            value={formatCurrency(revenue.pipelineAEValue)}
            subtitle={`${revenue.pipelineAECount} deals (Reunión → Cierre Ganado)`}
            icon={Zap}
            variant="default"
          />
          <KPICard
            title="Gap a Meta"
            value={formatCurrency(revenue.gap)}
            subtitle="falta por cerrar"
            icon={Target}
            variant={revenue.gap <= 0 ? "success" : revenue.gap > revenue.quarterlyTarget * 0.5 ? "danger" : "warning"}
          />
          <KPICard
            title="Hot Deals"
            value={formatCurrency(revenue.hotDealsValue)}
            subtitle={`${revenue.hotDealsCount} en Negociación`}
            icon={Flame}
            variant="warning"
          />
          <KPICard
            title="Pipeline Total"
            value={formatCurrency(revenue.pipelineValue)}
            subtitle={revenue.gap > 0 ? `${revenue.pipelineCoverage.toFixed(1)}x coverage` : "Meta superada"}
            icon={BarChart3}
          />
          <div className="col-span-2 lg:col-span-1">
            <Card className="border h-full">
              <CardContent className="p-3 flex flex-col items-center justify-center h-full">
                <RevenueGauge percent={revenue.percentComplete} />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Overview — AEs + SDRs side by side */}
      <section data-testid="exec-team">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Resumen del Equipo</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-3">
          {/* AE Summary */}
          <Card className="border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5" /> Revenue por AE
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={aeChartData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,10%,20%)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(220,10%,55%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(220,10%,55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(222,20%,13%)", border: "1px solid hsl(222,15%,20%)", borderRadius: "8px", fontSize: "12px" }}
                    labelStyle={{ color: "hsl(220,10%,92%)" }}
                    formatter={(value: number, name: string) => [formatCurrency(value), name === 'cerrado' ? 'Cerrado' : 'Meta']}
                  />
                  <Bar dataKey="cerrado" fill={COLORS.primary} radius={[4, 4, 0, 0]} name="Cerrado" />
                  <Bar dataKey="meta" fill="hsl(220,10%,25%)" radius={[4, 4, 0, 0]} name="Meta" />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* SDR Summary */}
          <Card className="border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> SDRs — Meeting Titans
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-4">
                {sdrSummary.map(sdr => {
                  const contactPct = sdr.contactsTarget > 0 ? (sdr.totalContacts / sdr.contactsTarget) * 100 : 0;
                  const meetingPct = sdr.meetingsTarget > 0 ? (sdr.totalMeetings / sdr.meetingsTarget) * 100 : 0;
                  return (
                    <div key={sdr.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">
                            {sdr.name[0]}
                          </div>
                          <span className="text-sm font-medium">{sdr.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {sdr.totalContacts} contactos · {sdr.totalMeetings} reuniones
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span className="text-muted-foreground">Contactos</span>
                            <span className="tabular-nums font-medium text-foreground">
                              {formatPercent(contactPct)}
                            </span>
                          </div>
                          <Progress value={Math.min(contactPct, 100)} className="h-1.5" />
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span className="text-muted-foreground">Reuniones</span>
                            <span className="tabular-nums font-medium text-foreground">
                              {formatPercent(meetingPct)}
                            </span>
                          </div>
                          <Progress value={Math.min(meetingPct, 100)} className="h-1.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* C3: Flujo SDR → AE */}
      <section data-testid="exec-flujo">
        <div className="flex items-center gap-2 mb-3">
          <GitBranch className="h-4 w-4 text-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Flujo SDR → AE</h2>
          <span className="text-xs text-muted-foreground ml-1">Últimos 7 días</span>
        </div>
        <div className="grid lg:grid-cols-3 gap-3">
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3 lg:col-span-1">
            <Card className="border">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold tabular-nums text-foreground">{flujoSDRAE.agendados}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Agendados (MT)</p>
              </CardContent>
            </Card>
            <Card className="border">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold tabular-nums text-foreground">{flujoSDRAE.reuniones}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Reuniones (Deals)</p>
              </CardContent>
            </Card>
            <Card className="border">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  {flujoSDRAE.gap > 0 ? `+${flujoSDRAE.gap}` : flujoSDRAE.gap}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">Gap (sin reunión)</p>
              </CardContent>
            </Card>
            <Card className="border">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  {flujoSDRAE.conversion.toFixed(0)}%
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">Conversión</p>
              </CardContent>
            </Card>
          </div>

          {/* 4-week trend line chart */}
          <Card className="border lg:col-span-2">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Tendencia 4 semanas</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={flujoSDRAE.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,10%,20%)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(220,10%,55%)" }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => { const m = v.match(/W(\d+)/); return m ? `S${parseInt(m[1])}` : v; }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(220,10%,55%)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(222,20%,13%)", border: "1px solid hsl(222,15%,20%)", borderRadius: "8px", fontSize: "12px" }}
                    labelStyle={{ color: "hsl(220,10%,92%)" }}
                    labelFormatter={(v) => { const m = String(v).match(/W(\d+)/); return m ? `Semana ${parseInt(m[1])}` : v; }}
                  />
                  <Line type="monotone" dataKey="agendados" stroke={COLORS.primary} strokeWidth={2} name="Agendados" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="reuniones" stroke={COLORS.success} strokeWidth={2} name="Reuniones" dot={{ r: 4 }} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pipeline + Alerts */}
      <section data-testid="exec-pipeline">
        <div className="grid lg:grid-cols-3 gap-3">
          {/* Pipeline */}
          <Card className="lg:col-span-2 border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Pipeline por Etapa</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="text-center">
                  <p className="text-lg font-bold tabular-nums">{formatPercent(pipeline.overallWinRate)}</p>
                  <p className="text-[10px] text-muted-foreground">Win Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold tabular-nums">{pipeline.totalActiveDeals}</p>
                  <p className="text-[10px] text-muted-foreground">Activos</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold tabular-nums">{pipeline.standByDeals}</p>
                  <p className="text-[10px] text-muted-foreground">Stand By</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold tabular-nums text-foreground">{pipeline.lostDeals}</p>
                  <p className="text-[10px] text-muted-foreground">Perdidos</p>
                </div>
              </div>
              <div className="space-y-0.5">
                {stageDistribution.map(s => (
                  <StageBar key={s.stage} stage={s.stage} count={s.count} value={s.value} maxValue={maxStageValue} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> Alertas
            </h3>
            {alerts.map((alert, i) => (
              <AlertCard key={i} alert={alert} />
            ))}
            {alerts.length === 0 && (
              <Card className="border">
                <CardContent className="p-4 text-center text-xs text-muted-foreground">
                  Sin alertas activas
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* C5: Revenue Progress Chart */}
      {revenueWeekly && revenueWeekly.length > 0 && (
        <section data-testid="exec-revenue-progress">
          <Card className="border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" /> Revenue Progress — Acumulado vs Target
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueWeekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,10%,20%)" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 10, fill: "hsl(220,10%,55%)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: string) => { const m = v.match(/W(\d+)/); return m ? `S${parseInt(m[1])}` : v; }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(220,10%,55%)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(222,20%,13%)", border: "1px solid hsl(222,15%,20%)", borderRadius: "8px", fontSize: "12px" }}
                    labelStyle={{ color: "hsl(220,10%,92%)" }}
                    labelFormatter={(v: string) => { const m = String(v).match(/W(\d+)/); return m ? `Semana ${parseInt(m[1])}` : v; }}
                    formatter={(value: number, name: string) => [formatCurrency(value), name === 'actual' ? 'Revenue Real' : 'Target Lineal']}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="hsl(220,10%,45%)"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    name="target"
                    dot={false}
                    activeDot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke={COLORS.primary}
                    strokeWidth={2.5}
                    name="actual"
                    dot={{ r: 4, fill: COLORS.primary, stroke: COLORS.primary }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} formatter={(value: string) => value === 'actual' ? 'Revenue Real' : 'Target Lineal'} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Hot Deals + Stale Deals */}
      <div className="grid lg:grid-cols-2 gap-3">
        {hotDeals.length > 0 && (
          <Card className="border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-foreground" /> Hot Deals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs" data-testid="hot-deals-table">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-medium text-muted-foreground">Deal</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">AE</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Evento</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotDeals.map(deal => (
                      <tr key={deal.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2 font-medium max-w-[180px] truncate">{deal.name}</td>
                        <td className="py-2 text-muted-foreground">{deal.ae}</td>
                        <td className="py-2">
                          {deal.event && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border text-foreground">
                              {deal.event}
                            </Badge>
                          )}
                        </td>
                        <td className="py-2 text-right tabular-nums font-medium text-foreground">{formatCurrency(deal.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {staleDeals.length > 0 && (
          <Card className="border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Deals Estancados (+14d)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs" data-testid="stale-deals-table">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-medium text-muted-foreground">Deal</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">AE</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Evento</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Valor</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Días</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staleDeals.slice(0, 8).map(deal => (
                      <tr key={deal.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2 font-medium max-w-[160px] truncate">{deal.name}</td>
                        <td className="py-2 text-muted-foreground">{deal.ae}</td>
                        <td className="py-2">
                          {deal.event && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border text-foreground">
                              {deal.event}
                            </Badge>
                          )}
                        </td>
                        <td className="py-2 text-right tabular-nums font-medium">{formatCurrency(deal.value)}</td>
                        <td className="py-2 text-right">
                          <span className="tabular-nums font-medium text-foreground">
                            {deal.daysSince}d
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB 2: AE DETAIL
// ═══════════════════════════════════════════════

function AEView({ quarter, weekFilter }: { quarter: string; weekFilter: string }) {
  const resolvedWeek = resolveWeekFilter(weekFilter);
  const weekParam = resolvedWeek ? `?week=${encodeURIComponent(resolvedWeek)}` : "";
  const { data, isLoading, error } = useQuery<AEData>({
    queryKey: ["/api/ae", quarter, resolvedWeek || "all"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/ae/${encodeURIComponent(quarter)}${weekParam}`);
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });

  if (isLoading || !data) return <LoadingSkeleton />;
  if (error) return <div className="p-8 text-center text-foreground">Error: {(error as Error).message}</div>;

  const { aeMetrics } = data;
  const isWeekView = !!resolvedWeek;
  const activityLabel = isWeekView
    ? (weekFilter === "current" ? "Semana Actual" : formatWeekLabel(resolvedWeek!))
    : "Acumulado";

  const aeChartData = aeMetrics.map(ae => ({
    name: ae.name === "María José" ? "Ma. José" : ae.name === "Santiago / Nathalia" ? "Santi/Nath" : ae.name,
    cerrado: ae.revenueClosed,
    meta: ae.revenueTarget,
  }));

  const winRateData = aeMetrics.filter(ae => ae.dealsWon + ae.dealsLost > 0).map(ae => ({
    name: ae.name,
    winRate: ae.winRate,
    won: ae.dealsWon,
    lost: ae.dealsLost,
  }));

  // C7: Collect all seguimientos olvidados across all AEs
  const allSeguimientos = aeMetrics.flatMap(ae =>
    ae.seguimientosOlvidados.map(s => ({ ...s, ae: ae.name }))
  ).sort((a, b) => b.daysSince - a.daysSince);

  return (
    <div className="space-y-6">
      {/* Revenue chart + Win Rate */}
      <div className="grid lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2 border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Revenue vs Meta por AE</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={aeChartData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,10%,20%)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(220,10%,55%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(220,10%,55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(222,20%,13%)", border: "1px solid hsl(222,15%,20%)", borderRadius: "8px", fontSize: "12px" }}
                  labelStyle={{ color: "hsl(220,10%,92%)" }}
                  formatter={(value: number, name: string) => [formatCurrency(value), name === 'cerrado' ? 'Cerrado' : 'Meta']}
                />
                <Bar dataKey="cerrado" fill={COLORS.primary} radius={[4, 4, 0, 0]} name="Cerrado" />
                <Bar dataKey="meta" fill="hsl(220,10%,25%)" radius={[4, 4, 0, 0]} name="Meta" />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Win Rate</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              {winRateData.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">Sin decisiones aún</p>
              ) : (
                winRateData.sort((a, b) => b.winRate - a.winRate).map(ae => (
                  <div key={ae.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium truncate mr-2">{ae.name}</span>
                      <span className="tabular-nums font-semibold shrink-0" style={{ color: ae.winRate >= 60 ? COLORS.success : ae.winRate >= 40 ? COLORS.warning : COLORS.danger }}>{ae.winRate.toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Progress value={ae.winRate} className="h-1.5 flex-1" />
                      <span className="text-[10px] text-muted-foreground tabular-nums">{ae.won}W/{ae.lost}L</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity table */}
      <Card className="border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
            Actividad de AEs ({activityLabel})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs" data-testid="ae-activity-table">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium text-muted-foreground">AE</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Revenue</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">% Meta</th>
                  <th className="text-center py-2 font-medium text-muted-foreground">
                    Reuniones{isWeekView ? "" : "/sem"}
                  </th>
                  <th className="text-center py-2 font-medium text-muted-foreground">
                    Propuestas{isWeekView ? "" : "/sem"}
                  </th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Abiertos</th>
                  <th className="text-center py-2 font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {aeMetrics.map(ae => (
                  <tr key={ae.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-medium">{ae.name}</td>
                    <td className="py-2.5 text-right tabular-nums font-medium">{formatCurrency(ae.revenueClosed)}</td>
                    <td className="py-2.5 text-right">
                      <span className={`tabular-nums font-semibold ${ae.percentToTarget >= 80 ? "text-foreground" : ae.percentToTarget >= 50 ? "text-foreground" : "text-foreground"}`}>
                        {ae.percentToTarget.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      {ae.meetingsTarget > 0 ? (
                        <span className={`tabular-nums ${ae.meetingsThisWeek >= ae.meetingsTarget * 0.7 ? "text-foreground" : "text-foreground"}`}>
                          {ae.meetingsThisWeek}/{ae.meetingsTarget}
                        </span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-2.5 text-center">
                      {ae.proposalsTarget > 0 ? (
                        <span className={`tabular-nums ${ae.proposalsThisWeek >= ae.proposalsTarget * 0.7 ? "text-foreground" : "text-foreground"}`}>
                          {ae.proposalsThisWeek}/{ae.proposalsTarget}
                        </span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">{ae.dealsOpen}</td>
                    <td className="py-2.5 text-center">
                      {ae.needsCoaching ? (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Coaching</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-muted text-foreground border-border">On Track</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Individual AE cards with C4: Funnel */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {aeMetrics.map(ae => {
          const weekKeys = Object.keys(ae.weeklyBreakdown).sort().slice(-8);
          return (
            <Card key={ae.name} className="border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${ae.needsCoaching ? "bg-muted text-foreground" : "bg-muted text-foreground"}`}>
                      {ae.name[0]}
                    </div>
                    <span className="text-sm font-semibold">{ae.name}</span>
                  </div>
                  <span className={`text-sm font-bold tabular-nums ${ae.percentToTarget >= 80 ? "text-foreground" : ae.percentToTarget >= 50 ? "text-foreground" : "text-foreground"}`}>
                    {ae.percentToTarget.toFixed(0)}%
                  </span>
                </div>

                {/* Revenue bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="tabular-nums">{formatCurrency(ae.revenueClosed)} / {formatCurrency(ae.revenueTarget)}</span>
                  </div>
                  <Progress value={Math.min(ae.percentToTarget, 100)} className="h-2" />
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-4 gap-1 text-center">
                  <div>
                    <p className="text-sm font-bold tabular-nums text-foreground">{ae.dealsWon}</p>
                    <p className="text-[9px] text-muted-foreground">Ganados</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold tabular-nums">{ae.dealsOpen}</p>
                    <p className="text-[9px] text-muted-foreground">Abiertos</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold tabular-nums">{ae.proposalsTotal}</p>
                    <p className="text-[9px] text-muted-foreground">Propuestas</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold tabular-nums">{ae.meetingsTotal}</p>
                    <p className="text-[9px] text-muted-foreground">Reuniones</p>
                  </div>
                </div>

                {/* C4: Funnel conversion */}
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-[10px] font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" /> Funnel de conversión
                  </p>
                  <div className="space-y-1">
                    {ae.funnel.map((step, idx) => (
                      <div key={step.key} className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-20 truncate shrink-0">{step.label}</span>
                        <div className="flex-1 h-3 bg-muted rounded-sm overflow-hidden">
                          <div
                            className={`h-full rounded-sm transition-all duration-500 ${
                              step.percent < 30 ? "bg-red-500" : step.percent < 60 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.max(step.percent, 2)}%` }}
                          />
                        </div>
                        <span className={`text-[10px] tabular-nums font-medium w-8 text-right ${step.percent < 30 ? "text-foreground" : ""}`}>
                          {step.count}
                        </span>
                        <span className={`text-[10px] tabular-nums w-10 text-right ${step.percent < 30 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                          {step.percent.toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* No Shows + Unqualified */}
                  <div className="flex gap-3 mt-2 pt-2 border-t border-border/30">
                    <div className="flex items-center gap-1 text-[10px]">
                      <Ban className="h-3 w-3 text-foreground" />
                      <span className="text-muted-foreground">No Show:</span>
                      <span className="tabular-nums font-medium">{ae.noShows}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      <XCircle className="h-3 w-3 text-gray-400" />
                      <span className="text-muted-foreground">Unqualified:</span>
                      <span className="tabular-nums font-medium">{ae.unqualified}</span>
                    </div>
                  </div>
                </div>

                {/* Hot deals for this AE (C3: with event tag) */}
                {ae.hotDeals.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-[10px] font-medium text-foreground mb-1 flex items-center gap-1">
                      <Flame className="h-3 w-3" /> Hot Deals ({ae.hotDeals.length})
                    </p>
                    {ae.hotDeals.slice(0, 3).map(d => (
                      <div key={d.id} className="flex items-center justify-between text-[10px] py-0.5 gap-1">
                        <span className="truncate flex-1">{d.name}</span>
                        {d.event && (
                          <Badge variant="outline" className={`text-[9px] px-1 py-0 shrink-0 ${
                            d.event === "AI Summit" ? "border-border text-foreground" :
                            d.event === "CTW" ? "border-border text-foreground" :
                            d.event === "Ambos" ? "border-border text-foreground" : ""
                          }`}>{d.event}</Badge>
                        )}
                        <span className="tabular-nums font-medium text-foreground shrink-0">{formatCurrency(d.value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* C7: Seguimientos Olvidados */}
      {allSeguimientos.length > 0 && (
        <section data-testid="ae-seguimientos">
          <Card className="border border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-foreground uppercase flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5" /> Seguimientos Olvidados ({allSeguimientos.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs" data-testid="seguimientos-table">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-medium text-muted-foreground">Deal</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">AE</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Etapa</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Valor</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Días</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allSeguimientos.slice(0, 15).map((s, i) => {
                      const severityColor = s.severity === "red" ? "text-foreground" : s.severity === "orange" ? "text-foreground" : "text-foreground";
                      const rowBg = s.severity === "red" ? "bg-muted" : s.severity === "orange" ? "bg-muted" : "";
                      return (
                        <tr key={`${s.id}-${i}`} className={`border-b border-border/50 ${rowBg}`}>
                          <td className="py-2 font-medium max-w-[200px] truncate">{s.name}</td>
                          <td className="py-2 text-muted-foreground">{(s as any).ae}</td>
                          <td className="py-2">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{s.stage}</Badge>
                          </td>
                          <td className="py-2 text-right tabular-nums font-medium">{formatCurrency(s.value)}</td>
                          <td className="py-2 text-right">
                            <span className={`tabular-nums font-bold ${severityColor}`}>{s.daysSince}d</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-4 mt-3 pt-2 border-t border-border/30 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Follow Up {">"}25d</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> Committed {">"}25d</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Stand By {">"}30d</span>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB 3: SDR DETAIL
// ═══════════════════════════════════════════════

function SDRView({ quarter, weekFilter }: { quarter: string; weekFilter: string }) {
  const resolvedWeek = resolveWeekFilter(weekFilter);
  const weekParam = resolvedWeek ? `?week=${encodeURIComponent(resolvedWeek)}` : "";
  const { data, isLoading, error } = useQuery<SDRData>({
    queryKey: ["/api/sdr", quarter, resolvedWeek || "all"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/sdr/${encodeURIComponent(quarter)}${weekParam}`);
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });

  if (isLoading || !data) return <LoadingSkeleton />;
  if (error) return <div className="p-8 text-center text-foreground">Error: {(error as Error).message}</div>;

  const { sdrMetrics, overallStageBreakdown, totalEntries, currentWeek } = data;
  const isWeekView = !!resolvedWeek;
  const activityLabel = isWeekView
    ? (weekFilter === "current" ? "Semana Actual" : formatWeekLabel(resolvedWeek!))
    : "Acumulado";

  // Overall stage data for chart
  const stageChartData = Object.entries(overallStageBreakdown)
    .map(([stage, count]) => ({ stage, count }))
    .sort((a, b) => b.count - a.count);

  const maxStage = Math.max(...stageChartData.map(s => s.count), 1);

  return (
    <div className="space-y-6">
      {/* C9: Current week indicator */}
      {currentWeek && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1.5 border-border text-foreground py-1 px-3">
            <CalendarDays className="h-3.5 w-3.5" />
            Semana actual: {currentWeek.label}
          </Badge>
          {weekFilter === "acumulado" && currentWeek.weekKey && (
            <button
              onClick={() => {
                const event = new CustomEvent("setWeekFilter", { detail: "current" });
                window.dispatchEvent(event);
              }}
              className="text-xs text-foreground hover:underline"
              data-testid="btn-filter-current-week"
            >
              Filtrar esta semana
            </button>
          )}
        </div>
      )}

      {/* SDR overview KPIs */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Contact className="h-4 w-4 text-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Meeting Titans</h2>
          <span className="text-xs text-muted-foreground ml-1">{totalEntries} registros · {quarter}</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard
            title="Total Contactos"
            value={formatNumber(totalEntries)}
            subtitle={`${quarter}`}
            icon={Building2}
          />
          <KPICard
            title="Agendados"
            value={formatNumber(overallStageBreakdown["Agendado"] || 0)}
            subtitle={`${totalEntries > 0 ? (((overallStageBreakdown["Agendado"] || 0) / totalEntries) * 100).toFixed(1) : 0}% conv.`}
            icon={CalendarDays}
            variant="success"
          />
          <KPICard
            title="Contactados"
            value={formatNumber(overallStageBreakdown["Contactado"] || 0)}
            subtitle="en proceso"
            icon={Phone}
          />
          <KPICard
            title="No Show"
            value={formatNumber(overallStageBreakdown["No Show"] || 0)}
            subtitle={`${totalEntries > 0 ? (((overallStageBreakdown["No Show"] || 0) / totalEntries) * 100).toFixed(1) : 0}%`}
            icon={XCircle}
            variant="danger"
          />
        </div>
      </section>

      {/* Stage distribution */}
      <Card className="border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Distribución por Etapa</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-1">
            {stageChartData.map(s => {
              const pct = (s.count / maxStage) * 100;
              const bgClass = MT_STAGE_COLORS[s.stage] || "bg-primary";
              return (
                <div key={s.stage} className="flex items-center gap-3 py-1.5">
                  <span className="text-xs text-muted-foreground w-24 truncate shrink-0">{s.stage}</span>
                  <div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden">
                    <div className={`h-full ${bgClass} rounded-sm transition-all duration-500`} style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                  <span className="text-xs font-medium tabular-nums w-10 text-right">{s.count}</span>
                  <span className="text-xs text-muted-foreground tabular-nums w-12 text-right">
                    {totalEntries > 0 ? ((s.count / totalEntries) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* SDR individual cards */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Detalle por SDR ({activityLabel})</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          {sdrMetrics.map(sdr => {
            const contactPct = sdr.contactsTarget > 0 ? (sdr.contactsPerWeek / sdr.contactsTarget) * 100 : 0;
            const meetingPct = sdr.meetingsTarget > 0 ? (sdr.meetingsPerWeek / sdr.meetingsTarget) * 100 : 0;

            // C5: Conversion rate color coding
            const convColor = sdr.conversionRate >= 10 ? "text-foreground" : sdr.conversionRate >= 5 ? "text-foreground" : "text-foreground";
            const convBg = sdr.conversionRate >= 10 ? "bg-muted border-border" : sdr.conversionRate >= 5 ? "bg-muted border-border" : "bg-muted border-border";

            // Stage breakdown chart data for this SDR
            const sdrStages = Object.entries(sdr.stageBreakdown)
              .map(([stage, count]) => ({ stage, count }))
              .sort((a, b) => b.count - a.count);

            return (
              <Card key={sdr.name} className="border" data-testid={`sdr-card-${sdr.name.toLowerCase()}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground">
                        {sdr.name[0]}
                      </div>
                      <div>
                        <span className="text-sm font-semibold block">{sdr.name}</span>
                        <span className="text-[10px] text-muted-foreground">{sdr.totalContacts} contactos</span>
                      </div>
                    </div>
                    {/* C5: Large conversion % */}
                    <div className={`rounded-lg border px-3 py-1.5 ${convBg}`}>
                      <p className={`text-xl font-bold tabular-nums ${convColor}`}>{sdr.conversionRate.toFixed(1)}%</p>
                      <p className="text-[9px] text-muted-foreground text-center">conversión</p>
                    </div>
                  </div>

                  {/* Contacts per week */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          Contactos{isWeekView ? "" : "/sem"}
                        </span>
                        <span className={`tabular-nums font-medium ${contactPct >= 50 ? "text-foreground" : "text-foreground"}`}>
                          {sdr.contactsPerWeek} / {sdr.contactsTarget}
                        </span>
                      </div>
                      <Progress value={Math.min(contactPct, 100)} className="h-1.5" />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          Reuniones{isWeekView ? "" : "/sem"}
                        </span>
                        <span className={`tabular-nums font-medium ${meetingPct >= 50 ? "text-foreground" : "text-foreground"}`}>
                          {sdr.meetingsPerWeek} / {sdr.meetingsTarget}
                        </span>
                      </div>
                      <Progress value={Math.min(meetingPct, 100)} className="h-1.5" />
                    </div>

                    {/* Total stats */}
                    <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold tabular-nums">{formatNumber(sdr.totalContacts)}</p>
                        <p className="text-[10px] text-muted-foreground">Total contactos</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold tabular-nums">{sdr.totalMeetings}</p>
                        <p className="text-[10px] text-muted-foreground">Reuniones</p>
                      </div>
                    </div>

                    {/* Stage mini breakdown */}
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">Etapas</p>
                      <div className="space-y-0.5">
                        {sdrStages.slice(0, 5).map(s => (
                          <div key={s.stage} className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${MT_STAGE_COLORS[s.stage] || "bg-slate-400"}`} />
                            <span className="text-[10px] text-muted-foreground flex-1 truncate">{s.stage}</span>
                            <span className="text-[10px] tabular-nums font-medium">{s.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* C6: Empresas sin avance indicator */}
                    {sdr.empresasSinAvanceCount > 0 && (
                      <div className="pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-foreground">
                          <AlertTriangle className="h-3 w-3" />
                          <span className="text-[10px] font-medium">{sdr.empresasSinAvanceCount} empresas sin avance (+14d)</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* C6: Empresas sin avance — detailed section */}
      {sdrMetrics.some(s => s.empresasSinAvanceCount > 0) && (
        <section data-testid="sdr-empresas-sin-avance">
          <Card className="border border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-foreground uppercase flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Empresas Sin Avance (+14 días en Contactado/Seguimiento)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid md:grid-cols-3 gap-4">
                {sdrMetrics.filter(s => s.empresasSinAvanceCount > 0).map(sdr => (
                  <div key={sdr.name}>
                    <p className="text-xs font-medium mb-2">{sdr.name} <span className="text-muted-foreground">({sdr.empresasSinAvanceCount})</span></p>
                    <div className="space-y-1">
                      {sdr.empresasSinAvance.slice(0, 8).map((e, i) => (
                        <div key={e.id || i} className="flex items-center justify-between text-[10px] py-0.5">
                          <span className="text-muted-foreground truncate flex-1 mr-2">
                            <Badge variant="outline" className="text-[9px] px-1 py-0 mr-1">{e.stage}</Badge>
                          </span>
                          <span className={`tabular-nums font-medium shrink-0 ${e.daysSince > 21 ? "text-foreground" : "text-foreground"}`}>
                            {e.daysSince}d
                          </span>
                        </div>
                      ))}
                      {sdr.empresasSinAvanceCount > 8 && (
                        <p className="text-[10px] text-muted-foreground mt-1">+{sdr.empresasSinAvanceCount - 8} más...</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Weekly comparison table */}
      <Card className="border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Comparación Semanal SDRs</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs" data-testid="sdr-weekly-table">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium text-muted-foreground">SDR</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Total</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Contactos/sem</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Meta</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Reuniones/sem</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Meta</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Conv. %</th>
                </tr>
              </thead>
              <tbody>
                {sdrMetrics.map(sdr => (
                  <tr key={sdr.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-medium">{sdr.name}</td>
                    <td className="py-2.5 text-right tabular-nums">{sdr.totalContacts}</td>
                    <td className="py-2.5 text-right">
                      <span className={`tabular-nums font-medium ${sdr.contactsPerWeek >= sdr.contactsTarget * 0.5 ? "text-foreground" : "text-foreground"}`}>
                        {sdr.contactsPerWeek}
                      </span>
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-muted-foreground">{sdr.contactsTarget}</td>
                    <td className="py-2.5 text-right">
                      <span className={`tabular-nums font-medium ${sdr.meetingsPerWeek >= sdr.meetingsTarget * 0.5 ? "text-foreground" : "text-foreground"}`}>
                        {sdr.meetingsPerWeek}
                      </span>
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-muted-foreground">{sdr.meetingsTarget}</td>
                    <td className="py-2.5 text-right">
                      <span className={`tabular-nums font-medium ${sdr.conversionRate >= 10 ? "text-foreground" : sdr.conversionRate >= 5 ? "text-foreground" : "text-foreground"}`}>
                        {sdr.conversionRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB 4: PIPELINE REVIEW
// ═══════════════════════════════════════════════

function EventBadge({ event }: { event: string }) {
  if (!event) return null;
  const cls = event === "AI Summit" ? "bg-muted text-foreground border-border"
    : event === "CTW" ? "bg-muted text-foreground border-border"
    : event === "Ambos" ? "bg-muted text-foreground border-border"
    : "bg-muted text-muted-foreground";
  return <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cls}`}>{event}</Badge>;
}

function StatusBadge({ status }: { status: "advancing" | "stale" | "stuck" }) {
  const cls = status === "advancing" ? "bg-muted text-foreground border-border"
    : status === "stale" ? "bg-muted text-foreground border-border"
    : "bg-muted text-foreground border-border";
  const label = status === "advancing" ? "Avanzando" : status === "stale" ? "Estancado" : "Trabado";
  return <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cls}`}>{label}</Badge>;
}

function PriorityBadge({ priority }: { priority: "urgent" | "attention" | "normal" }) {
  if (priority === "normal") return null;
  const cls = priority === "urgent" ? "bg-muted text-foreground border-border"
    : "bg-muted text-foreground border-border";
  const label = priority === "urgent" ? "Urgente" : "Atención";
  return <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cls}`}>{label}</Badge>;
}

function AEStatusBadge({ status }: { status: "on_track" | "at_risk" | "coaching" }) {
  const cls = status === "on_track" ? "bg-muted text-foreground border-border"
    : status === "at_risk" ? "bg-muted text-foreground border-border"
    : "bg-muted text-foreground border-border";
  const label = status === "on_track" ? "On Track" : status === "at_risk" ? "At Risk" : "Coaching";
  return <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-medium ${cls}`}>{label}</Badge>;
}

function SeverityBadge({ severity }: { severity: string }) {
  const cls = severity === "red" ? "bg-muted text-foreground border-border"
    : severity === "orange" ? "bg-muted text-foreground border-border"
    : "bg-muted text-foreground border-border";
  const label = severity === "red" ? "Crítico" : severity === "orange" ? "Alto" : "Medio";
  return <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cls}`}>{label}</Badge>;
}

// Module 1.1: KPIs overview
function PRKPIs({ kpis, quarterlyTarget }: { kpis: PipelineReviewData["kpis"]; quarterlyTarget: number }) {
  const coverageColor = kpis.pipelineCoverage >= 3 ? "success" : kpis.pipelineCoverage >= 2 ? "warning" : "danger";
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-4 w-4 text-foreground" />
        <h2 className="text-sm font-semibold uppercase tracking-wide">KPIs Pipeline</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <KPICard
          title="Revenue Cerrado"
          value={formatCurrency(kpis.revenueClosed)}
          subtitle={`de ${formatCurrency(quarterlyTarget)} · ${((kpis.revenueClosed / quarterlyTarget) * 100).toFixed(0)}%`}
          icon={DollarSign}
          variant={kpis.revenueClosed / quarterlyTarget >= 0.7 ? "success" : kpis.revenueClosed / quarterlyTarget >= 0.4 ? "warning" : "danger"}
        />
        <KPICard
          title="Pipeline Activo"
          value={formatCurrency(kpis.pipelineActive)}
          icon={BarChart3}
        />
        <KPICard
          title="Pipeline Coverage"
          value={`${kpis.pipelineCoverage.toFixed(1)}x`}
          subtitle={kpis.pipelineCoverage >= 3 ? "Saludable" : kpis.pipelineCoverage >= 2 ? "Atención" : "Insuficiente"}
          icon={TrendingUp}
          variant={coverageColor}
        />
        <KPICard
          title="Weighted Pipeline"
          value={formatCurrency(kpis.weightedPipeline)}
          icon={Zap}
        />
        <KPICard
          title="Deals en Riesgo"
          value={`${kpis.dealsAtRisk}`}
          subtitle={formatCurrency(kpis.dealsAtRiskValue)}
          icon={AlertTriangle}
          variant="danger"
        />
        <KPICard
          title="Forecast"
          value={formatCurrency(kpis.forecast.total)}
          subtitle={`Gap: ${formatCurrency(Math.max(kpis.forecast.gap, 0))}`}
          icon={Target}
          variant={kpis.forecast.gap <= 0 ? "success" : "warning"}
        />
      </div>
    </section>
  );
}

// Module 1.2: Stage breakdown table
function PRStageBreakdown({ stages }: { stages: PipelineReviewData["stageBreakdown"] }) {
  const maxValue = Math.max(...stages.map(s => s.totalValue), 1);
  return (
    <Card className="border">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Pipeline por Stage</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-medium text-muted-foreground">Stage</th>
                <th className="text-right py-2 font-medium text-muted-foreground"># Deals</th>
                <th className="text-right py-2 font-medium text-muted-foreground">$ Total</th>
                <th className="text-right py-2 font-medium text-muted-foreground">$ Promedio</th>
                <th className="text-right py-2 font-medium text-muted-foreground">Avg Días</th>
                <th className="py-2 w-32"></th>
              </tr>
            </thead>
            <tbody>
              {stages.map(s => {
                const pct = (s.totalValue / maxValue) * 100;
                const barColor = s.stage.includes("Negociación") || s.stage.includes("Committed")
                  ? "bg-emerald-500" : s.stage.includes("Propuesta")
                  ? "bg-amber-500" : "bg-blue-500";
                return (
                  <tr key={s.stage} className="border-b border-border/50">
                    <td className="py-2 font-medium">{STAGE_SHORT[s.stage] || s.stage}</td>
                    <td className="py-2 text-right tabular-nums">{s.deals}</td>
                    <td className="py-2 text-right tabular-nums font-medium">{formatCurrency(s.totalValue)}</td>
                    <td className="py-2 text-right tabular-nums text-muted-foreground">{formatCurrency(s.avgValue)}</td>
                    <td className="py-2 text-right tabular-nums text-muted-foreground">{s.avgDaysInStage}d</td>
                    <td className="py-2 pl-3">
                      <div className="h-3 bg-muted rounded-sm overflow-hidden">
                        <div className={`h-full ${barColor} rounded-sm`} style={{ width: `${Math.max(pct, 3)}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// Module 1.3: Conversions
function PRConversions({ conversions }: { conversions: PipelineReviewData["conversions"] }) {
  return (
    <Card className="border">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Conversión entre Stages</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          {conversions.map(c => (
            <div key={`${c.from}-${c.to}`} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-24 truncate shrink-0" title={c.from}>{STAGE_SHORT[c.from] || c.from}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground w-24 truncate shrink-0" title={c.to}>{STAGE_SHORT[c.to] || c.to}</span>
              <div className="flex-1 h-4 bg-muted rounded-sm overflow-hidden">
                <div
                  className={`h-full rounded-sm ${c.isLow ? "bg-red-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.max(c.rate, 3)}%` }}
                />
              </div>
              <span className={`text-xs font-medium tabular-nums w-10 text-right ${c.isLow ? "text-foreground" : "text-foreground"}`}>
                {c.rate}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Module 1.4: Cohorts
function PRCohorts({ cohorts }: { cohorts: PipelineReviewData["cohorts"] }) {
  const renderTable = (deals: PipelineReviewData["cohorts"]["thisWeek"]) => {
    if (deals.length === 0) return <p className="text-xs text-muted-foreground py-3 text-center">Sin deals en este periodo</p>;
    return (
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-1.5 font-medium text-muted-foreground">Deal</th>
            <th className="text-left py-1.5 font-medium text-muted-foreground">AE</th>
            <th className="text-left py-1.5 font-medium text-muted-foreground">Stage</th>
            <th className="text-right py-1.5 font-medium text-muted-foreground">Valor</th>
            <th className="text-right py-1.5 font-medium text-muted-foreground">Días</th>
            <th className="text-left py-1.5 font-medium text-muted-foreground">Evento</th>
            <th className="text-center py-1.5 font-medium text-muted-foreground">Estado</th>
          </tr>
        </thead>
        <tbody>
          {[...deals].sort((a, b) => b.value - a.value).map(d => (
            <tr key={d.id} className="border-b border-border/50">
              <td className="py-1.5 font-medium truncate max-w-[160px]">{d.name}</td>
              <td className="py-1.5 text-muted-foreground">{d.ae}</td>
              <td className="py-1.5">{STAGE_SHORT[d.stage] || d.stage}</td>
              <td className="py-1.5 text-right tabular-nums font-medium">{formatCurrency(d.value)}</td>
              <td className="py-1.5 text-right tabular-nums text-muted-foreground">{d.daysSinceCreation}d</td>
              <td className="py-1.5"><EventBadge event={d.event} /></td>
              <td className="py-1.5 text-center"><StatusBadge status={d.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <Card className="border">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Cohort Semanal</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div>
          <h3 className="text-xs font-semibold mb-2">Esta Semana ({cohorts.thisWeek.length})</h3>
          <div className="overflow-x-auto">{renderTable(cohorts.thisWeek)}</div>
        </div>
        <div>
          <h3 className="text-xs font-semibold mb-2">Semana Pasada ({cohorts.lastWeek.length})</h3>
          <div className="overflow-x-auto">{renderTable(cohorts.lastWeek)}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Module 1.5b: Mid-Funnel Aging Cohorts
function PRMidFunnelAging({ buckets }: { buckets: PipelineReviewData["midFunnelAging"] }) {
  if (!buckets || buckets.length === 0) return null;
  const totalDeals = buckets.reduce((s, b) => s + b.deals, 0);
  const totalValue = buckets.reduce((s, b) => s + b.totalValue, 0);
  if (totalDeals === 0) return null;

  const [expandedBucket, setExpandedBucket] = useState<string | null>(null);

  return (
    <Card className="border">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" /> Mid-Funnel Aging — {totalDeals} deals · {formatCurrency(totalValue)}
        </CardTitle>
        <p className="text-[10px] text-muted-foreground">Deals en Propuesta, Negociación o Committed agrupados por semanas en stage actual</p>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {/* Summary bars */}
        <div className="flex gap-1 mb-4 h-8">
          {buckets.map(b => {
            const pct = totalValue > 0 ? (b.totalValue / totalValue) * 100 : 0;
            if (b.deals === 0) return null;
            const color = b.key === "0-7d" ? "bg-emerald-500" : b.key === "8-14d" ? "bg-sky-500" : b.key === "15-21d" ? "bg-amber-500" : b.key === "22-28d" ? "bg-orange-500" : "bg-red-500";
            return (
              <div
                key={b.key}
                className={`${color} rounded-sm cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center`}
                style={{ width: `${Math.max(pct, 5)}%` }}
                onClick={() => setExpandedBucket(expandedBucket === b.key ? null : b.key)}
                title={`${b.label}: ${b.deals} deals, ${formatCurrency(b.totalValue)}`}
              >
                <span className="text-[9px] text-white font-medium truncate px-1">{b.deals}</span>
              </div>
            );
          })}
        </div>

        {/* Bucket summary table */}
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="text-left py-1.5 font-medium">Semana</th>
              <th className="text-right py-1.5 font-medium"># Deals</th>
              <th className="text-right py-1.5 font-medium">Valor</th>
              <th className="text-right py-1.5 font-medium">Promedio</th>
            </tr>
          </thead>
          <tbody>
            {buckets.filter(b => b.deals > 0).map(b => {
              const color = b.key === "0-7d" ? "text-foreground" : b.key === "8-14d" ? "text-sky-400" : b.key === "15-21d" ? "text-foreground" : b.key === "22-28d" ? "text-foreground" : "text-foreground";
              return (
                <>
                  <tr
                    key={b.key}
                    className="border-b border-border/50 cursor-pointer hover:bg-muted/30"
                    onClick={() => setExpandedBucket(expandedBucket === b.key ? null : b.key)}
                  >
                    <td className={`py-2 font-medium ${color}`}>{b.label}</td>
                    <td className="py-2 text-right tabular-nums">{b.deals}</td>
                    <td className="py-2 text-right tabular-nums font-medium">{formatCurrency(b.totalValue)}</td>
                    <td className="py-2 text-right tabular-nums text-muted-foreground">{b.deals > 0 ? formatCurrency(b.totalValue / b.deals) : "$0"}</td>
                  </tr>
                  {expandedBucket === b.key && b.items.map(item => (
                    <tr key={item.id} className="bg-muted/20">
                      <td className="py-1.5 pl-4 text-muted-foreground">{item.name}</td>
                      <td className="py-1.5 text-right">
                        <span className="text-[10px] text-muted-foreground">{item.ae}</span>
                      </td>
                      <td className="py-1.5 text-right tabular-nums">{formatCurrency(item.value)}</td>
                      <td className="py-1.5 text-right">
                        <span className="text-[10px]">{STAGE_SHORT[item.stage] || item.stage}</span>
                        {" "}
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))}
                </>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

// Module 1.6: Kill or Advance
function PRKillOrAdvance({ deals, totalValue }: { deals: PipelineReviewData["killOrAdvance"]; totalValue: number }) {
  if (deals.length === 0) return null;
  return (
    <Card className="border">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Kill or Advance</CardTitle>
          <Badge variant="outline" className="text-[10px] text-muted-foreground">{deals.length} deals · {formatCurrency(totalValue)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1.5 font-medium text-muted-foreground">Deal</th>
                <th className="text-left py-1.5 font-medium text-muted-foreground">AE</th>
                <th className="text-left py-1.5 font-medium text-muted-foreground">Stage</th>
                <th className="text-right py-1.5 font-medium text-muted-foreground">Valor</th>
                <th className="text-right py-1.5 font-medium text-muted-foreground">Días</th>
                <th className="text-left py-1.5 font-medium text-muted-foreground">Evento</th>
                <th className="text-center py-1.5 font-medium text-muted-foreground">Acción</th>
              </tr>
            </thead>
            <tbody>
              {deals.map(d => (
                <tr key={d.id} className="border-b border-border/50">
                  <td className="py-1.5 font-medium truncate max-w-[160px]">{d.name}</td>
                  <td className="py-1.5 text-muted-foreground">{d.ae}</td>
                  <td className="py-1.5">{STAGE_SHORT[d.stage] || d.stage}</td>
                  <td className="py-1.5 text-right tabular-nums font-medium">{formatCurrency(d.value)}</td>
                  <td className="py-1.5 text-right tabular-nums text-muted-foreground">{d.daysStale}d</td>
                  <td className="py-1.5"><EventBadge event={d.event} /></td>
                  <td className="py-1.5 text-center">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                      d.recommendation === "kill" ? "bg-muted text-foreground border-border" : "bg-muted text-foreground border-border"
                    }`}>
                      {d.recommendation === "kill" ? "Kill" : "Advance"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// Module 2: AE Scorecard
function PRAEScorecard({ ae, teamForecastTotal }: { ae: AEScorecard; teamForecastTotal: number }) {
  const [dealFilter, setDealFilter] = useState<string>("all");
  const maxStageValue = Math.max(...ae.stageBreakdown.map(s => s.value), 1);

  const filteredDeals = ae.deals.filter(d => {
    if (dealFilter === "all") return true;
    if (dealFilter === "urgent") return d.priority === "urgent";
    if (dealFilter === "proposal") return d.stage.includes("Propuesta") || d.stage.includes("Negociación") || d.stage.includes("Committed");
    if (dealFilter === "stale") return d.status === "stale" || d.status === "stuck";
    return true;
  });

  return (
    <div className="space-y-4">
      {/* 2.1 Header */}
      <Card className="border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold">{ae.name}</h3>
              <AEStatusBadge status={ae.status} />
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Win Rate: <span className="font-medium text-foreground">{ae.winRate}%</span></span>
              <span>Pipeline: <span className="font-medium text-foreground">{formatCurrency(ae.pipelinePersonal)}</span></span>
              <span>Coverage: <span className={`font-medium ${ae.pipelineCoveragePersonal >= 1 ? "text-foreground" : ae.pipelineCoveragePersonal >= 0.6 ? "text-foreground" : "text-foreground"}`}>{ae.pipelineCoveragePersonal > 0 ? `${(ae.pipelineCoveragePersonal * 100).toFixed(0)}%` : ae.requiredPipeline === -1 ? "N/A" : "0%"}</span></span>
              {ae.requiredPipeline > 0 && ae.requiredPipeline !== -1 && (
                <span>Necesita: <span className="font-medium text-muted-foreground">{formatCurrency(ae.requiredPipeline)}</span></span>
              )}
              <span>Lifecycle: <span className="font-medium text-foreground">{ae.avgLifecycleDays > 0 ? `${ae.avgLifecycleDays}d` : "N/A"}</span></span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Revenue vs Meta</span>
              <span className="tabular-nums font-medium">{formatCurrency(ae.revenueClosed)} / {formatCurrency(ae.revenueTarget)} ({ae.percentToTarget}%)</span>
            </div>
            <Progress value={Math.min(ae.percentToTarget, 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* 2.2 Velocity metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Reuniones / Sem"
          value={`${ae.meetingsThisWeek}`}
          subtitle={`Meta: ${ae.meetingsTarget}`}
          icon={CalendarDays}
          variant={ae.meetingsThisWeek >= ae.meetingsTarget * 0.7 ? "success" : ae.meetingsThisWeek >= ae.meetingsTarget * 0.4 ? "warning" : "danger"}
        />
        <KPICard
          title="Propuestas / Sem"
          value={`${ae.proposalsThisWeek}`}
          subtitle={`Meta: ${ae.proposalsTarget}`}
          icon={Tag}
          variant={ae.proposalsThisWeek >= ae.proposalsTarget * 0.7 ? "success" : ae.proposalsThisWeek >= ae.proposalsTarget * 0.4 ? "warning" : "danger"}
        />
        <KPICard
          title="Avg Días Pipeline"
          value={`${ae.avgDaysInPipeline}d`}
          icon={Clock}
          variant={ae.avgDaysInPipeline <= 30 ? "success" : ae.avgDaysInPipeline <= 45 ? "warning" : "danger"}
        />
        <KPICard
          title="Descalificación"
          value={`${ae.disqualificationRatio}%`}
          icon={Ban}
        />
      </div>

      {/* 2.3 Mini pipeline by stage */}
      {ae.stageBreakdown.length > 0 && (
        <Card className="border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Pipeline por Stage</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {ae.stageBreakdown.map(s => (
              <div key={s.stage} className="flex items-center gap-3 py-1.5">
                <span className="text-xs text-muted-foreground w-28 truncate shrink-0">{STAGE_SHORT[s.stage] || s.stage}</span>
                <div className="flex-1 h-4 bg-muted rounded-sm overflow-hidden">
                  <div className={`h-full ${STAGE_COLORS[s.stage] || "bg-primary"} rounded-sm`} style={{ width: `${Math.max((s.value / maxStageValue) * 100, 3)}%` }} />
                </div>
                <span className="text-xs font-medium tabular-nums w-8 text-right">{s.deals}</span>
                <span className="text-xs text-muted-foreground tabular-nums w-16 text-right">{formatCurrency(s.value)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 2.4 Forecast */}
      <Card className="border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Forecast</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground">Won</p>
              <p className="text-sm font-bold tabular-nums">{formatCurrency(ae.forecast.won)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Commit ×0.9</p>
              <p className="text-sm font-bold tabular-nums">{formatCurrency(ae.forecast.commitWeighted)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">BestCase ×0.5</p>
              <p className="text-sm font-bold tabular-nums">{formatCurrency(ae.forecast.bestCaseWeighted)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Total</p>
              <p className="text-sm font-bold tabular-nums text-foreground">{formatCurrency(ae.forecast.total)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Gap</p>
              <p className={`text-sm font-bold tabular-nums ${ae.forecast.gap <= 0 ? "text-foreground" : "text-foreground"}`}>{formatCurrency(Math.max(ae.forecast.gap, 0))}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Contribución</p>
              <Badge variant="outline" className="text-xs mt-0.5">{ae.forecast.contributionPercent}%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2.5 Deal list */}
      <Card className="border">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Deals ({filteredDeals.length})</CardTitle>
            <div className="flex gap-1">
              {[
                { key: "all", label: "Todos" },
                { key: "urgent", label: "Urgentes" },
                { key: "proposal", label: "Propuesta+" },
                { key: "stale", label: "Estancados" },
              ].map(f => (
                <button key={f.key} onClick={() => setDealFilter(f.key)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${dealFilter === f.key ? "bg-primary text-foreground-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                >{f.label}</button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 font-medium text-muted-foreground">Deal</th>
                  <th className="text-left py-1.5 font-medium text-muted-foreground">Stage</th>
                  <th className="text-right py-1.5 font-medium text-muted-foreground">Valor</th>
                  <th className="text-left py-1.5 font-medium text-muted-foreground">Evento</th>
                  <th className="text-right py-1.5 font-medium text-muted-foreground">Días Stage</th>
                  <th className="text-right py-1.5 font-medium text-muted-foreground">Días Total</th>
                  <th className="text-center py-1.5 font-medium text-muted-foreground">Estado</th>
                  <th className="text-center py-1.5 font-medium text-muted-foreground">Prioridad</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map(d => (
                  <tr key={d.id} className="border-b border-border/50">
                    <td className="py-1.5 font-medium truncate max-w-[160px]">{d.name}</td>
                    <td className="py-1.5">{STAGE_SHORT[d.stage] || d.stage}</td>
                    <td className="py-1.5 text-right tabular-nums font-medium">{formatCurrency(d.value)}</td>
                    <td className="py-1.5"><EventBadge event={d.event} /></td>
                    <td className="py-1.5 text-right tabular-nums text-muted-foreground">{d.daysInStage}d</td>
                    <td className="py-1.5 text-right tabular-nums text-muted-foreground">{d.daysTotal}d</td>
                    <td className="py-1.5 text-center"><StatusBadge status={d.status} /></td>
                    <td className="py-1.5 text-center"><PriorityBadge priority={d.priority} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 2.6 Seguimientos olvidados */}
      {ae.seguimientosOlvidados.length > 0 && (
        <Card className="border border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-foreground uppercase">Seguimientos Olvidados ({ae.seguimientosOlvidados.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1.5 font-medium text-muted-foreground">Deal</th>
                    <th className="text-left py-1.5 font-medium text-muted-foreground">Stage</th>
                    <th className="text-right py-1.5 font-medium text-muted-foreground">Valor</th>
                    <th className="text-right py-1.5 font-medium text-muted-foreground">Días</th>
                    <th className="text-center py-1.5 font-medium text-muted-foreground">Severidad</th>
                  </tr>
                </thead>
                <tbody>
                  {ae.seguimientosOlvidados.map(s => (
                    <tr key={s.id} className="border-b border-border/50">
                      <td className="py-1.5 font-medium">{s.name}</td>
                      <td className="py-1.5">{STAGE_SHORT[s.stage] || s.stage}</td>
                      <td className="py-1.5 text-right tabular-nums">{formatCurrency(s.value)}</td>
                      <td className="py-1.5 text-right tabular-nums">{s.daysSince}d</td>
                      <td className="py-1.5 text-center"><SeverityBadge severity={s.severity} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2.7 Diagnostics */}
      {ae.diagnostics.length > 0 && (
        <Card className="border border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-foreground uppercase">Diagnóstico</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {ae.diagnostics.map(d => (
              <div key={d.transition} className="p-3 rounded-lg bg-muted border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">{d.transition}</span>
                  <div className="flex items-center gap-3 text-xs tabular-nums">
                    <span className="text-foreground">{d.aeRate}% AE</span>
                    <span className="text-muted-foreground">{d.teamRate}% Equipo</span>
                    <span className="text-foreground font-medium">{d.delta > 0 ? "+" : ""}{d.delta}pp</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{d.insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PipelineReviewView({ quarter, weekFilter: _weekFilter }: { quarter: string; weekFilter: string }) {
  const [selectedAE, setSelectedAE] = useState<string>("general");
  const { data, isLoading, error } = useQuery<PipelineReviewData>({
    queryKey: ["/api/pipeline-review", quarter],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/pipeline-review/${encodeURIComponent(quarter)}`);
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });

  if (isLoading || !data) return <LoadingSkeleton />;
  if (error) return <div className="p-8 text-center text-foreground">Error: {(error as Error).message}</div>;

  const aeNames = data.aeScoreCards.map(a => a.name);
  const selectedScorecard = data.aeScoreCards.find(a => a.name === selectedAE);
  const teamForecastTotal = data.kpis.forecast.total;

  return (
    <div className="space-y-6">
      {/* AE selector */}
      <div className="flex items-center gap-3">
        <GitBranch className="h-4 w-4 text-foreground" />
        <h2 className="text-sm font-semibold uppercase tracking-wide">Pipeline Review</h2>
        <Select value={selectedAE} onValueChange={setSelectedAE}>
          <SelectTrigger className="w-[200px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">Vista General</SelectItem>
            {aeNames.map(name => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedAE === "general" ? (
        <>
          <PRKPIs kpis={data.kpis} quarterlyTarget={data.quarterlyTarget} />
          <div className="grid lg:grid-cols-2 gap-3">
            <PRStageBreakdown stages={data.stageBreakdown} />
            <PRConversions conversions={data.conversions} />
          </div>
          <PRCohorts cohorts={data.cohorts} />
          <PRMidFunnelAging buckets={data.midFunnelAging} />
          <PRKillOrAdvance deals={data.killOrAdvance} totalValue={data.killOrAdvanceTotalValue} />
        </>
      ) : selectedScorecard ? (
        <PRAEScorecard ae={selectedScorecard} teamForecastTotal={teamForecastTotal} />
      ) : null}
    </div>
  );
}

// ═══════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════

export function Dashboard() {
  const [quarter, setQuarter] = useState<string>("Q2 2026");
  // C2: Default to current week; "acumulado" shows cumulative progress
  const [weekFilter, setWeekFilter] = useState<string>("current");
  const [activeTab, setActiveTab] = useState<string>("executive");

  // C9: Listen for custom event from SDR view to set week filter
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) setWeekFilter(detail);
    };
    window.addEventListener("setWeekFilter", handler);
    return () => window.removeEventListener("setWeekFilter", handler);
  }, []);

  // Fetch quarter weeks from executive data (always fetch full quarter for week list)
  const { data: execData } = useQuery<ExecutiveData>({
    queryKey: ["/api/executive", quarter, "all"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/executive/${encodeURIComponent(quarter)}`);
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const quarterWeeks = execData?.quarterWeeks || [];
  const lastUpdated = execData?.lastUpdated;
  const cacheInfo = execData?.cache;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <img src="/logotipo.png" alt="Sales Dashboard Logo" className="h-8 w-auto object-contain" />
                <div>
                  <h1 className="text-xl font-bold leading-tight tracking-tight text-black">Sales Dashboard</h1>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="h-9">
                  <TabsTrigger value="executive" className="text-xs gap-1.5" data-testid="tab-executive">
                    <BarChart3 className="h-3.5 w-3.5" />
                    Sales B2B
                  </TabsTrigger>
                  <TabsTrigger value="ae" className="text-xs gap-1.5" data-testid="tab-ae">
                    <UserCheck className="h-3.5 w-3.5" />
                    AEs
                  </TabsTrigger>
                  <TabsTrigger value="sdr" className="text-xs gap-1.5" data-testid="tab-sdr">
                    <Phone className="h-3.5 w-3.5" />
                    SDRs
                  </TabsTrigger>
                  <TabsTrigger value="pipeline-review" className="text-xs gap-1.5" data-testid="tab-pipeline-review">
                    <GitBranch className="h-3.5 w-3.5" />
                    Pipeline Review
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center gap-2">
              <Select value={quarter} onValueChange={(v) => { setQuarter(v); setWeekFilter("current"); }}>
                <SelectTrigger className="w-[110px] h-8 text-xs" data-testid="quarter-selector">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q2 2026">Q2 2026</SelectItem>
                  <SelectItem value="Q1 2026">Q1 2026</SelectItem>
                  <SelectItem value="Q4 2025">Q4 2025</SelectItem>
                </SelectContent>
              </Select>

              <Select value={weekFilter} onValueChange={setWeekFilter}>
                <SelectTrigger className="w-[160px] h-8 text-xs" data-testid="week-selector">
                  <CalendarDays className="h-3 w-3 mr-1 shrink-0" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Semana Actual</SelectItem>
                  <SelectItem value="acumulado">Acumulado</SelectItem>
                  {quarterWeeks.map(wk => (
                    <SelectItem key={wk} value={wk}>{formatWeekLabel(wk)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Badge variant="outline" className="text-xs h-6 gap-1 border-border text-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-muted-foreground opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground"></span>
                </span>
                En vivo
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5">
        {/* Week filter badge */}
        {weekFilter !== "current" && weekFilter !== "acumulado" && (
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="text-xs gap-1">
              <CalendarDays className="h-3 w-3" />
              Filtrando: {formatWeekLabel(weekFilter)}
            </Badge>
            <button
              onClick={() => setWeekFilter("current")}
              className="text-xs text-foreground hover:underline"
              data-testid="clear-week-filter"
            >
              Volver a semana actual
            </button>
          </div>
        )}

        {/* Tab content */}
        {activeTab === "executive" && <ExecutiveView quarter={quarter} weekFilter={weekFilter} />}
        {activeTab === "ae" && <AEView quarter={quarter} weekFilter={weekFilter} />}
        {activeTab === "sdr" && <SDRView quarter={quarter} weekFilter={weekFilter} />}
        {activeTab === "pipeline-review" && <PipelineReviewView quarter={quarter} weekFilter={weekFilter} />}

        {/* Footer */}
        <div className="text-center py-4 mt-6">
          <p className="text-xs text-muted-foreground">
            Datos en vivo desde Attio CRM
            {lastUpdated && ` · Actualizado: ${new Date(lastUpdated).toLocaleString("es-CO")}`}
            {cacheInfo?.cached && ` · Caché: ${cacheInfo.age < 60 ? `${cacheInfo.age}s` : `${Math.round(cacheInfo.age / 60)}min`}`}
            {cacheInfo?.meetingCount ? ` · ${cacheInfo.meetingCount} registros MT` : ""}
          </p>
        </div>
      </main>
    </div>
  );
}
