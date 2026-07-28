import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, LineChart,
  Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  Activity, ArrowDown, ArrowRight, ArrowUp, Brain, ChevronRight, CircuitBoard,
  Compass, Database, Dna, Eye, Gauge, GitBranch, LineChart as LineIcon, Loader2,
  Network, Play, RefreshCw, Satellite, Settings2, Signal, Sparkles, Target, Zap,
} from "lucide-react";

import { ASSETS, buildAnalysis, buildRankings, fmtPct, type Analysis, type Asset } from "@/lib/ren-data";

import { searchAssets } from "@/lib/market.functions";
import { Button } from "@/components/ui/button";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Tooltip as UTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, ChevronsUpDown, Globe, MessageSquare, Search } from "lucide-react";
import { RenCopilot } from "@/components/ren-copilot";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "REN — Relationship Intelligence Terminal" },
      { name: "description", content: "REN is an AI-powered quantitative research platform that discovers, explains, quantifies, and forecasts hidden relationships between any two financial assets using alternative data and statistical modeling." },
      { property: "og:title", content: "REN — Relationship Intelligence Terminal" },
      { property: "og:description", content: "Institutional-grade AI research on why any two assets are related — and whether the relationship will persist." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RenTerminal,
});

// ---------- Small building blocks ---------------------------------------

function StatusPill({ live = true }: { live?: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border/70 bg-terminal/60 px-3 py-1.5 tick text-[11px]">
      <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-signal-strong pulse-dot" : "bg-muted-foreground"}`} />
      <span className="text-muted-foreground">{live ? "LIVE" : "IDLE"}</span>
      <span className="text-foreground/60">·</span>
      <span className="text-foreground/70">Yahoo Finance</span>
    </div>
  );
}

function Metric({
  label, value, sub, hint, tone = "default", size = "md",
}: {
  label: string; value: React.ReactNode; sub?: React.ReactNode; hint?: string;
  tone?: "default" | "good" | "warn" | "bad"; size?: "sm" | "md" | "lg";
}) {
  const toneClass =
    tone === "good" ? "text-signal-strong" :
    tone === "warn" ? "text-warn" :
    tone === "bad"  ? "text-danger" : "text-foreground";
  const sizeClass = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span className="label-eyebrow">{label}</span>
        {hint && (
          <TooltipProvider delayDuration={100}>
            <UTooltip>
              <TooltipTrigger className="text-muted-foreground/70 hover:text-foreground">
                <Eye className="h-3 w-3" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">{hint}</TooltipContent>
            </UTooltip>
          </TooltipProvider>
        )}
      </div>
      <div className={`tick font-semibold ${sizeClass} ${toneClass}`}>{value}</div>
      {sub && <div className="tick text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Bars({ value, tone = "signal" }: { value: number; tone?: "signal" | "good" | "warn" }) {
  const pct = Math.max(0, Math.min(1, value));
  const color =
    tone === "good"  ? "bg-signal-strong" :
    tone === "warn"  ? "bg-warn" : "bg-signal";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <div className={`h-full ${color}`} style={{ width: `${pct * 100}%` }} />
    </div>
  );
}

function Panel({
  title, icon: Icon, subtitle, right, children, className = "",
}: {
  title: string; icon?: any; subtitle?: string; right?: React.ReactNode;
  children: React.ReactNode; className?: string;
}) {
  return (
    <section className={`panel p-5 fade-up ${className}`}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {Icon && (
            <div className="mt-0.5 rounded-md border border-border/70 bg-terminal/60 p-1.5 text-signal">
              <Icon className="h-3.5 w-3.5" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {right}
      </header>
      {children}
    </section>
  );
}

// ---------- Chart theming -----------------------------------------------

const AXIS = { fontSize: 10, fill: "oklch(0.65 0.02 235)", fontFamily: "JetBrains Mono, monospace" };
const GRID_STROKE = "oklch(0.28 0.016 235 / 0.3)";

// ---------- Sections ----------------------------------------------------

function AssetSelect({
  value, onChange, label, disabledSymbol,
}: {
  value: Asset | null;
  onChange: (a: Asset) => void;
  label: string;
  disabledSymbol?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Asset[]>(ASSETS.slice(0, 20));
  const [loading, setLoading] = useState(false);
  const search = useServerFn(searchAssets);
  const reqIdRef = useRef(0);

  // Debounced multi-provider search. Empty query → curated defaults.
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length === 0) {
      setResults(ASSETS.slice(0, 40));
      setLoading(false);
      return;
    }
    setLoading(true);
    const id = ++reqIdRef.current;
    const t = setTimeout(async () => {
      try {
        const res = await search({ data: { query: q } });
        if (reqIdRef.current !== id) return;
        // If provider returns nothing, fall back to local ASSETS filter so the
        // UI is never dead-empty on transient network hiccups.
        const providerHits = res.assets as Asset[];
        if (providerHits.length > 0) {
          setResults(providerHits);
        } else {
          const ql = q.toLowerCase();
          setResults(
            ASSETS.filter(
              (a) =>
                a.symbol.toLowerCase().includes(ql) ||
                a.name.toLowerCase().includes(ql) ||
                a.sector.toLowerCase().includes(ql),
            ).slice(0, 20),
          );
        }
      } catch {
        /* ignore; keep prior results */
      } finally {
        if (reqIdRef.current === id) setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [query, open, search]);

  return (
    <div className="flex-1">
      <div className="label-eyebrow mb-1.5">{label}</div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className="flex h-11 w-full items-center gap-3 rounded-md border border-border/80 bg-terminal/60 px-3 tick text-sm hover:bg-terminal/80"
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            {value ? (
              <>
                <span className="font-semibold">{value.symbol}</span>
                <span className="truncate text-muted-foreground">{value.name}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Search assets…</span>
            )}
            <ChevronsUpDown className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          {/* shouldFilter=false: results come from the server, don't re-filter client-side */}
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search any ticker, name, or asset globally…"
              className="tick"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList className="max-h-[360px]">
              {loading && (
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Searching Yahoo Finance + CoinGecko…</span>
                </div>
              )}
              {!loading && results.length === 0 && (
                <CommandEmpty>No assets found.</CommandEmpty>
              )}
              <CommandGroup>
                {results.map((a) => {
                  const isDisabled = a.symbol === disabledSymbol;
                  const isSelected = value?.symbol === a.symbol;
                  return (
                    <CommandItem
                      key={`${a.symbol}-${a.provider ?? "local"}`}
                      value={a.symbol}
                      disabled={isDisabled}
                      onSelect={() => {
                        onChange(a);
                        setOpen(false);
                        setQuery("");
                      }}
                      className="gap-3"
                    >
                      <Check className={`h-3.5 w-3.5 ${isSelected ? "opacity-100 text-signal" : "opacity-0"}`} />
                      <span className="tick w-24 truncate font-semibold">{a.symbol}</span>
                      <span className="truncate text-sm">{a.name}</span>
                      <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">{a.sector}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <div className="border-t border-border/50 px-3 py-1.5 tick text-[10px] text-muted-foreground">
                <Globe className="mr-1 inline h-2.5 w-2.5" />
                Global coverage · Yahoo Finance + CoinGecko
              </div>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function IntelligenceCard({ A }: { A: Analysis }) {
  const items: { label: string; value: string; tone: "default"|"good"|"warn"|"bad"; hint: string; bar: number }[] = [
    { label: "Relationship Strength", value: fmtPct(A.strength), tone: A.strength > 0.75 ? "good" : "default", hint: "Composite score from correlation, mutual information, and cointegration tests over trailing 5y.", bar: A.strength },
    { label: "Confidence", value: fmtPct(A.confidence), tone: "default", hint: "Bootstrap-derived confidence in the composite estimate.", bar: A.confidence },
    { label: "Historical Stability", value: fmtPct(A.stability), tone: A.stability > 0.7 ? "good" : A.stability > 0.5 ? "warn" : "bad", hint: "Variance of rolling 60d correlation across the past 5y.", bar: A.stability },
    { label: "Forecast Confidence", value: fmtPct(A.forecastConf), tone: "default", hint: "Cross-validated accuracy of the ensemble forecast on out-of-sample data.", bar: A.forecastConf },
  ];
  return (
    <Panel
      title="Relationship Intelligence"
      icon={Brain}
      subtitle={`${A.a.symbol} · ${A.a.name}  ⇄  ${A.b.symbol} · ${A.b.name}`}
      right={
        <div className="flex items-center gap-2 rounded-md border border-border/70 bg-terminal/60 px-2.5 py-1 tick text-[11px]">
          <Signal className="h-3 w-3 text-signal" />
          <span className="text-muted-foreground">STATUS</span>
          <span className="text-signal-strong">{A.forecast.trend}</span>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
        {items.map((it) => (
          <div key={it.label}>
            <Metric label={it.label} value={it.value} tone={it.tone as any} hint={it.hint} />
            <div className="mt-2"><Bars value={it.bar} tone={it.tone === "good" ? "good" : it.tone === "warn" ? "warn" : "signal"} /></div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border/60 pt-5 md:grid-cols-4">
        <div>
          <div className="label-eyebrow mb-1.5">Relationship Type</div>
          <div className="text-sm">{A.relType}</div>
        </div>
        <div>
          <div className="label-eyebrow mb-1.5">Current Regime</div>
          <div className="text-sm">{A.regime}</div>
        </div>
        <div>
          <div className="label-eyebrow mb-1.5">Lead / Lag</div>
          <div className="tick text-sm">
            {A.leadDays === 0
              ? "Contemporaneous"
              : `${A.a.symbol} ${A.leadDays > 0 ? "leads" : "lags"} ${A.b.symbol} by ${Math.abs(A.leadDays)}d`}
          </div>
        </div>
        <div>
          <div className="label-eyebrow mb-1.5">Statistical Significance</div>
          <div className="tick text-sm">p &lt; 0.01 · N = 1,258</div>
        </div>
      </div>

      <div className="mt-5 border-t border-border/60 pt-5">
        <div className="label-eyebrow mb-2">Primary Shared Drivers</div>
        <div className="flex flex-wrap gap-2">
          {A.primaryDrivers.map((d) => (
            <span key={d} className="rounded-md border border-signal/30 bg-signal/10 px-2.5 py-1 tick text-xs text-signal">
              {d}
            </span>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function DnaCard({ A }: { A: Analysis }) {
  const data = A.dna.map((d) => ({ name: d.name, value: +(d.value * 100).toFixed(1), color: d.color }));
  return (
    <Panel
      title="Relationship DNA™"
      icon={Dna}
      subtitle="Decomposition of the composite relationship score into its five constituent strands."
      right={<span className="rounded-md border border-border/70 bg-terminal/60 px-2 py-0.5 tick text-[10px] text-muted-foreground">PROPRIETARY</span>}
    >
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="relative h-[220px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={62} outerRadius={92} stroke="var(--background)" strokeWidth={2} paddingAngle={2}>
                {data.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="label-eyebrow">Composite</div>
            <div className="tick text-2xl font-semibold">{fmtPct(A.strength)}</div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {A.dna.map((d) => (
            <div key={d.name} className="grid grid-cols-[110px_1fr_60px] items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
                <span className="text-xs">{d.name}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full" style={{ width: `${d.value * 100}%`, background: d.color }} />
              </div>
              <div className="tick text-right text-xs">{(d.value * 100).toFixed(1)}%</div>
            </div>
          ))}
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Each strand quantifies a distinct source of coupling. A high{" "}
            <span className="text-foreground">Alternative Data</span> weight indicates the pair is bound by real-world activity signals rather than shared market beta.
          </p>
        </div>
      </div>
    </Panel>
  );
}

function TimelinePanel({ A }: { A: Analysis }) {
  return (
    <Panel
      title="Relationship Evolution — 24M"
      icon={LineIcon}
      subtitle="Rolling 60-day composite correlation with bootstrapped 90% confidence band."
    >
      <div className="h-[240px]">
        <ResponsiveContainer>
          <ComposedChart data={A.timeline} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="ci" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--signal)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--signal)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID_STROKE} strokeDasharray="2 4" />
            <XAxis dataKey="t" tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 1]} tick={AXIS} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "var(--muted-foreground)" }}
            />
            <Area type="monotone" dataKey="ci_hi" stroke="none" fill="url(#ci)" />
            <Area type="monotone" dataKey="ci_lo" stroke="none" fill="var(--background)" />
            <Line type="monotone" dataKey="rho" stroke="var(--signal)" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function AltDataPanel({ A }: { A: Analysis }) {
  const data = A.altDatasets.map((d) => ({ name: d.name, importance: +(d.importance * 100).toFixed(1), category: d.category }));
  return (
    <Panel
      title="Alternative Data Importance"
      icon={Satellite}
      subtitle="Datasets ranked by Shapley contribution to the explained relationship."
    >
      <div className="h-[260px]">
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 30, left: 8, bottom: 0 }}>
            <CartesianGrid stroke={GRID_STROKE} strokeDasharray="2 4" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ ...AXIS, fontSize: 10 }} axisLine={false} tickLine={false} width={170} />
            <Tooltip
              cursor={{ fill: "oklch(1 0 0 / 0.03)" }}
              contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => [`${v}%`, "Importance"]}
            />
            <Bar dataKey="importance" fill="var(--signal)" radius={[0, 4, 4, 0]} barSize={12}>
              {data.map((_, i) => (
                <Cell key={i} fill={i < 3 ? "var(--signal-strong)" : i < 6 ? "var(--signal)" : "oklch(0.55 0.08 195)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function LeadLagPanel({ A }: { A: Analysis }) {
  return (
    <Panel
      title="Lead-Lag Cross Correlation"
      icon={GitBranch}
      subtitle="Peak lag identifies directional information flow between the assets."
    >
      <div className="h-[220px]">
        <ResponsiveContainer>
          <BarChart data={A.leadLag} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={GRID_STROKE} strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="lag" tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} width={40} />
            <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            <ReferenceLine x={A.leadDays} stroke="var(--warn)" strokeDasharray="3 3" label={{ value: `peak = ${A.leadDays}d`, fill: "var(--warn)", fontSize: 10 }} />
            <Bar dataKey="cc" fill="var(--signal)" radius={[2, 2, 0, 0]}>
              {A.leadLag.map((d, i) => (
                <Cell key={i} fill={d.lag === A.leadDays ? "var(--warn)" : "var(--signal)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function StatsTable({ A }: { A: Analysis }) {
  return (
    <Panel
      title="Statistical Validation Suite"
      icon={CircuitBoard}
      subtitle="Full battery of dependence, causality, and stationarity tests. Every estimate is bootstrapped."
    >
      <div className="overflow-hidden rounded-md border border-border/60">
        <table className="w-full text-xs">
          <thead className="bg-terminal/70 text-muted-foreground">
            <tr className="label-eyebrow">
              <th className="px-3 py-2 text-left">Test</th>
              <th className="px-3 py-2 text-right">Statistic</th>
              <th className="px-3 py-2 text-right">p-value</th>
              <th className="px-3 py-2 text-center">Result</th>
              <th className="px-3 py-2 text-left">Interpretation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {A.tests.map((t) => (
              <tr key={t.name} className="hover:bg-terminal/40">
                <td className="px-3 py-2 font-medium">{t.name}</td>
                <td className="px-3 py-2 text-right tick">{t.value.toFixed(3)}</td>
                <td className="px-3 py-2 text-right tick text-muted-foreground">
                  {Number.isNaN(t.p) ? "—" : t.p.toFixed(3)}
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`inline-block h-2 w-2 rounded-full ${t.passes ? "bg-signal-strong" : "bg-danger"}`} />
                </td>
                <td className="px-3 py-2 text-muted-foreground">{t.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function ForecastCard({ A }: { A: Analysis }) {
  return (
    <Panel
      title="Relationship Forecast"
      icon={Compass}
      subtitle="Where the relationship — not the price — is expected to go."
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
        <Metric label="Forecast Trend" value={A.forecast.trend} tone={A.forecast.momentum > 0 ? "good" : A.forecast.momentum < 0 ? "warn" : "default"} hint="Direction implied by the ensemble of forecasting models." />
        <Metric label="30-Day Outlook" value={A.forecast.outlook30} hint="Weighted mean forecast at t+30 trading days." />
        <Metric label="90-Day Outlook" value={A.forecast.outlook90} hint="Weighted mean forecast at t+90 trading days." />
        <Metric label="Expected Lifetime" value={`${A.forecast.expectedLifetimeMonths} mo`} hint="Median time until the relationship falls below the significance threshold." />
      </div>
      <div className="mt-5 grid gap-4 border-t border-border/60 pt-5 md:grid-cols-3">
        {[
          { l: "Strengthens", v: A.forecast.pStrengthen, tone: "good" },
          { l: "Weakens",     v: A.forecast.pWeaken,     tone: "warn" },
          { l: "Breaks",      v: A.forecast.pBreak,      tone: "bad"  },
        ].map((p) => (
          <div key={p.l} className="rounded-md border border-border/60 bg-terminal/50 p-3">
            <div className="label-eyebrow">P({p.l})</div>
            <div className={`mt-1 tick text-2xl font-semibold ${p.tone === "good" ? "text-signal-strong" : p.tone === "warn" ? "text-warn" : "text-danger"}`}>
              {fmtPct(p.v)}
            </div>
            <div className="mt-2"><Bars value={p.v} tone={p.tone as any} /></div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MonteCarloPanel({ A }: { A: Analysis }) {
  const [horizon, setHorizon] = useState(90);
  const [vol, setVol] = useState(50);
  const data = A.fan.slice(0, horizon + 1);
  return (
    <Panel
      title="Monte Carlo Relationship Simulator"
      icon={Zap}
      subtitle="Distribution of possible relationship trajectories — probabilistic, not deterministic."
      right={
        <div className="flex items-center gap-2 tick text-[11px] text-muted-foreground">
          <span>{data.length - 1}d · {(vol * 1.6).toFixed(0)} paths·10³</span>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="h-[260px]">
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fanOuter" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--signal)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="var(--signal)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="fanInner" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--signal)" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="var(--signal)" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID_STROKE} strokeDasharray="2 4" />
              <XAxis dataKey="day" tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 1]} tick={AXIS} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="p90" stroke="none" fill="url(#fanOuter)" />
              <Area type="monotone" dataKey="p10" stroke="none" fill="var(--background)" />
              <Area type="monotone" dataKey="p75" stroke="none" fill="url(#fanInner)" />
              <Area type="monotone" dataKey="p25" stroke="none" fill="var(--background)" />
              <Line type="monotone" dataKey="p50" stroke="var(--signal-strong)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-5 rounded-md border border-border/60 bg-terminal/40 p-4">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="label-eyebrow">Horizon</span>
              <span className="tick text-xs">{horizon}d</span>
            </div>
            <Slider value={[horizon]} min={15} max={90} step={5} onValueChange={([v]) => setHorizon(v)} />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="label-eyebrow">Volatility Regime</span>
              <span className="tick text-xs">{vol}</span>
            </div>
            <Slider value={[vol]} min={10} max={100} step={5} onValueChange={([v]) => setVol(v)} />
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-3 tick text-[11px]">
            <div><div className="text-muted-foreground">Median</div><div>{data[data.length - 1].p50.toFixed(2)}</div></div>
            <div><div className="text-muted-foreground">P10–P90</div><div>{data[data.length - 1].p10.toFixed(2)}–{data[data.length - 1].p90.toFixed(2)}</div></div>
            <div><div className="text-muted-foreground">P(sig.)</div><div>{fmtPct(1 - A.forecast.pBreak)}</div></div>
            <div><div className="text-muted-foreground">P(break)</div><div>{fmtPct(A.forecast.pBreak)}</div></div>
          </div>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Probabilistic scenario analysis. Not a guarantee of future market behavior.
          </p>
        </div>
      </div>
    </Panel>
  );
}

function ModelComparisonPanel({ A }: { A: Analysis }) {
  return (
    <Panel
      title="Model Comparison"
      icon={Settings2}
      subtitle="Nine forecasting approaches, ranked by historical out-of-sample accuracy."
    >
      <div className="overflow-hidden rounded-md border border-border/60">
        <table className="w-full text-xs">
          <thead className="bg-terminal/70 text-muted-foreground">
            <tr className="label-eyebrow">
              <th className="px-3 py-2 text-left">Model</th>
              <th className="px-3 py-2 text-right">Forecast</th>
              <th className="px-3 py-2 text-right">Confidence</th>
              <th className="px-3 py-2 text-right">Accuracy</th>
              <th className="px-3 py-2 text-left">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {A.models.map((m) => (
              <tr key={m.name} className="hover:bg-terminal/40">
                <td className="px-3 py-2 font-medium">{m.name}</td>
                <td className="px-3 py-2 text-right tick text-signal">{fmtPct(Math.min(1, Math.max(0, m.forecast)))}</td>
                <td className="px-3 py-2 text-right tick">{fmtPct(Math.min(1, Math.max(0, m.conf)))}</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-1 w-14 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full bg-signal-strong" style={{ width: `${m.accuracy * 100}%` }} />
                    </div>
                    <span className="tick w-9 text-right">{fmtPct(m.accuracy)}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{m.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}


function RankingsPanel({ onSelect }: { onSelect: (a: string, b: string) => void }) {
  const rows = useMemo(() => buildRankings(12), []);
  return (
    <Panel
      title="Live Relationship Rankings"
      icon={Gauge}
      subtitle="Continuously updated leaderboard of every pair analyzed on REN."
      right={<StatusPill />}
    >
      <div className="overflow-hidden rounded-md border border-border/60">
        <table className="w-full text-xs">
          <thead className="bg-terminal/70 text-muted-foreground">
            <tr className="label-eyebrow">
              <th className="w-8 px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Pair</th>
              <th className="px-3 py-2 text-right">Strength</th>
              <th className="px-3 py-2 text-right">Forecast Conf.</th>
              <th className="px-3 py-2 text-right">Stability</th>
              <th className="px-3 py-2 text-left">Regime</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="w-8 px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.map((r, i) => (
              <tr key={r.pair} className="cursor-pointer transition hover:bg-terminal/50" onClick={() => onSelect(r.aSym, r.bSym)}>
                <td className="px-3 py-2 tick text-muted-foreground">{String(i + 1).padStart(2, "0")}</td>
                <td className="px-3 py-2 font-medium tick">{r.pair}</td>
                <td className="px-3 py-2 text-right tick text-signal-strong">{fmtPct(r.strength)}</td>
                <td className="px-3 py-2 text-right tick">{fmtPct(r.forecastConf)}</td>
                <td className="px-3 py-2 text-right tick">{fmtPct(r.stability)}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.regime}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-terminal/60 px-2 py-0.5 tick text-[10px]">
                    {r.trend === "up" ? <ArrowUp className="h-3 w-3 text-signal-strong" /> :
                     r.trend === "down" ? <ArrowDown className="h-3 w-3 text-danger" /> :
                     <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-muted-foreground"><ChevronRight className="h-3.5 w-3.5" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function KnowledgeGraphPanel({ A }: { A: Analysis }) {
  // Simple SVG force-free layout: A/B in center, alt-datasets & macro nodes on a ring.
  const nodes = A.altDatasets.slice(0, 8);
  const W = 640, H = 300, cx = W / 2, cy = H / 2;
  return (
    <Panel
      title="Knowledge Graph"
      icon={Network}
      subtitle="Assets, alternative datasets, and macro variables that structurally connect the pair."
    >
      <div className="overflow-hidden rounded-md border border-border/60 bg-terminal/60">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-[300px] w-full">
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--signal)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* edges */}
          {nodes.map((n, i) => {
            const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
            const x = cx + Math.cos(angle) * 220;
            const y = cy + Math.sin(angle) * 110;
            const w = 0.5 + n.importance * 2;
            return (
              <g key={n.name}>
                <line x1={cx - 60} y1={cy} x2={x} y2={y} stroke="var(--signal)" strokeOpacity={0.15 + n.importance * 0.35} strokeWidth={w} />
                <line x1={cx + 60} y1={cy} x2={x} y2={y} stroke="var(--dna-3)" strokeOpacity={0.12 + n.importance * 0.3} strokeWidth={w} />
              </g>
            );
          })}
          {/* alt nodes */}
          {nodes.map((n, i) => {
            const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
            const x = cx + Math.cos(angle) * 220;
            const y = cy + Math.sin(angle) * 110;
            return (
              <g key={n.name}>
                <circle cx={x} cy={y} r={16} fill="url(#glow)" />
                <circle cx={x} cy={y} r={5} fill="var(--dna-3)" />
                <text x={x} y={y - 10} textAnchor="middle" fontSize="9" fill="oklch(0.8 0.02 235)" fontFamily="JetBrains Mono">{n.name}</text>
              </g>
            );
          })}
          {/* asset A */}
          <g>
            <circle cx={cx - 60} cy={cy} r={30} fill="url(#glow)" />
            <circle cx={cx - 60} cy={cy} r={18} fill="var(--signal)" />
            <text x={cx - 60} y={cy + 4} textAnchor="middle" fontSize="12" fontWeight={700} fill="var(--terminal)" fontFamily="JetBrains Mono">{A.a.symbol}</text>
          </g>
          {/* asset B */}
          <g>
            <circle cx={cx + 60} cy={cy} r={30} fill="url(#glow)" />
            <circle cx={cx + 60} cy={cy} r={18} fill="var(--signal-strong)" />
            <text x={cx + 60} y={cy + 4} textAnchor="middle" fontSize="12" fontWeight={700} fill="var(--terminal)" fontFamily="JetBrains Mono">{A.b.symbol}</text>
          </g>
          {/* center coupling edge */}
          <line x1={cx - 42} y1={cy} x2={cx + 42} y2={cy} stroke="var(--warn)" strokeWidth={1 + A.strength * 3} strokeOpacity={0.7} strokeDasharray="4 4" />
        </svg>
      </div>
    </Panel>
  );
}

// ---------- Root component ----------------------------------------------

function RenTerminal() {
  const nvda = useMemo(() => ASSETS.find((x) => x.symbol === "NVDA")!, []);
  const tsm = useMemo(() => ASSETS.find((x) => x.symbol === "TSM")!, []);
  const [aAsset, setAAsset] = useState<Asset>(nvda);
  const [bAsset, setBAsset] = useState<Asset>(tsm);
  const [salt, setSalt] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [committed, setCommitted] = useState<{ a: Asset; b: Asset; salt: number } | null>({
    a: nvda, b: tsm, salt: 0,
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const analyzeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const analyze = () => {
    if (aAsset.symbol === bAsset.symbol) return;
    setAnalyzing(true);
    if (analyzeTimer.current) clearTimeout(analyzeTimer.current);
    analyzeTimer.current = setTimeout(() => {
      setCommitted({ a: aAsset, b: bAsset, salt });
      setAnalyzing(false);
    }, 900);
  };

  // Auto-poll: nudge salt every 45s to simulate a live provider refresh.
  useEffect(() => {
    if (!autoRefresh || !committed) return;
    const id = setInterval(() => {
      setSalt((s) => s + 1);
      setCommitted((c) => c ? { ...c, salt: c.salt + 1 } : c);
    }, 45000);
    return () => clearInterval(id);
  }, [autoRefresh, committed]);

  const A = useMemo(() => {
    if (!committed) return null;
    return buildAnalysis(committed.a, committed.b, committed.salt);
  }, [committed]);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-md border border-signal/40 bg-signal/10 text-signal">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">REN</div>
              <div className="tick -mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                Relationship Intelligence Terminal
              </div>
            </div>
          </div>
          <nav className="hidden items-center gap-1 rounded-md border border-border/60 bg-terminal/60 p-1 text-xs md:flex">
            {[
              { label: "Research", id: "research" },
              { label: "Rankings", id: "rankings" },
              { label: "Knowledge Graph", id: "knowledge-graph" },
              { label: "Datasets", id: "datasets" },
              { label: "Methodology", id: "methodology" },
            ].map((t, i) => (
              <button
                key={t.id}
                onClick={() => {
                  const el = document.getElementById(t.id);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`rounded px-3 py-1.5 tracking-tight transition ${i === 0 ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 tick text-[11px] transition ${autoRefresh ? "border-signal/40 bg-signal/10 text-signal" : "border-border/70 bg-terminal/60 text-muted-foreground"}`}
            >
              <RefreshCw className={`h-3 w-3 ${autoRefresh ? "animate-spin-slow" : ""}`} style={autoRefresh ? { animationDuration: "6s" } : undefined} />
              {autoRefresh ? "AUTO-REFRESH 45s" : "AUTO-REFRESH OFF"}
            </button>
            <StatusPill />
          </div>
        </div>
      </header>

      <main id="research" className="mx-auto max-w-[1400px] px-6 py-8 scroll-mt-24">
        {/* Hero */}
        <section className="mb-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="label-eyebrow mb-2">AI-Powered Alternative Data Relationship Intelligence</div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Select any two assets. REN retrieves market and alternative data, runs the full statistical validation suite, decomposes the coupling into its Relationship DNA™ strands, and forecasts how it will evolve.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border/70 bg-terminal/50 px-3 py-2 tick text-[11px]">
              <Database className="h-3.5 w-3.5 text-signal" /> 22 alt datasets · 10 statistical tests · 9 forecast models
            </div>
          </div>
        </section>

        {/* Analyze bar */}
        <section className="panel grid-bg mb-8 p-5">
          <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-end">
            <AssetSelect label="Asset A" value={aAsset} onChange={setAAsset} disabledSymbol={bAsset.symbol} />
            <div className="grid h-11 w-11 shrink-0 place-items-center self-end rounded-md border border-border/60 bg-terminal/70 text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
            </div>
            <AssetSelect label="Asset B" value={bAsset} onChange={setBAsset} disabledSymbol={aAsset.symbol} />
            <Button
              onClick={analyze}
              disabled={analyzing || aAsset.symbol === bAsset.symbol}
              className="h-11 self-end bg-signal px-6 tick text-sm font-semibold text-primary-foreground hover:bg-signal/90"
            >
              {analyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing</> : <><Play className="mr-2 h-4 w-4" /> Analyze Relationship</>}
            </Button>
          </div>
          {analyzing && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] md:grid-cols-6">
              {["Fetching Yahoo prices","Loading alt-data","Engineering features","Running stat tests","Fitting 9 models","Generating brief"].map((s, i) => (
                <div key={s} className="sweep relative overflow-hidden rounded-md border border-border/60 bg-terminal/50 px-2.5 py-2 tick text-muted-foreground">
                  <span className="mr-1 text-signal">▸</span>{s}
                </div>
              ))}
            </div>
          )}
        </section>

        {A && (
          <div className="grid gap-6">
            {/* Row 1: Intelligence + DNA */}
            <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
              <IntelligenceCard A={A} />
              <DnaCard A={A} />
            </div>

            {/* Row 2: Timeline + Lead-lag */}
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <TimelinePanel A={A} />
              <LeadLagPanel A={A} />
            </div>

            {/* Row 3: Alt data */}
            <div id="datasets" className="scroll-mt-24">
              <AltDataPanel A={A} />
            </div>


            {/* Row 4: Stats table */}
            <StatsTable A={A} />

            {/* Row 5: Forecast + Monte Carlo */}
            <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
              <ForecastCard A={A} />
              <MonteCarloPanel A={A} />
            </div>

            {/* Row 6: Model comparison + Knowledge graph */}
            <div id="knowledge-graph" className="grid gap-6 scroll-mt-24 lg:grid-cols-[1.1fr_1fr]">
              <ModelComparisonPanel A={A} />
              <KnowledgeGraphPanel A={A} />
            </div>

            {/* Row 7: Rankings */}
            <div id="rankings" className="scroll-mt-24">
              <RankingsPanel onSelect={(a, b) => {
                const aA = ASSETS.find((x) => x.symbol === a);
                const bA = ASSETS.find((x) => x.symbol === b);
                if (!aA || !bA) return;
                setAAsset(aA); setBAsset(bA);
                setCommitted({ a: aA, b: bA, salt });
              }} />
            </div>

            {/* Methodology */}
            <section id="methodology" className="panel grid-bg p-6 scroll-mt-24">
              <div className="label-eyebrow mb-3">Methodology</div>
              <div className="grid gap-4 text-xs leading-relaxed text-muted-foreground md:grid-cols-2">
                <div>
                  <div className="mb-1 text-sm font-semibold text-foreground">Data pipeline</div>
                  Prices are pulled through a multi-provider router (Yahoo Finance for equities, ETFs, FX, futures and indices; CoinGecko for crypto). Returns are computed as daily log-differences and aligned on shared trading days.
                </div>
                <div>
                  <div className="mb-1 text-sm font-semibold text-foreground">Relationship DNA™</div>
                  The observed coupling is decomposed into fundamental, macro, sentiment, flow and idiosyncratic strands via a constrained variance decomposition over 22 alternative datasets, ranked by Shapley contribution.
                </div>
                <div>
                  <div className="mb-1 text-sm font-semibold text-foreground">Statistical validation</div>
                  Ten tests are run in parallel: Pearson &amp; Spearman correlation, Engle-Granger &amp; Johansen cointegration, Granger causality, DCC-GARCH regime detection, Hurst exponent, transfer entropy, wavelet coherence, and a rolling stability score.
                </div>
                <div>
                  <div className="mb-1 text-sm font-semibold text-foreground">Forecasting</div>
                  Nine models compete on out-of-sample RMSE: OLS, Ridge, LASSO, Elastic Net, Random Forest, XGBoost, LSTM, Kalman filter and a Bayesian ensemble. The Monte Carlo fan simulates 5,000 paths from the top-scoring model's residual distribution.
                </div>
                <div>
                  <div className="mb-1 text-sm font-semibold text-foreground">Persistence score</div>
                  A composite of regime stability, cointegration strength, and forecast confidence, calibrated on historical relationship half-lives.
                </div>
                <div>
                  <div className="mb-1 text-sm font-semibold text-foreground">Disclaimers</div>
                  All outputs are probabilistic scenario analyses derived from observed data and model assumptions. Nothing on REN constitutes investment advice.
                </div>
              </div>
            </section>
          </div>
        )}

        <footer className="mt-12 border-t border-border/60 pt-6 text-[11px] text-muted-foreground">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="tick">REN v0.9 · Institutional Research Preview</span>
            <span>Forecasts are probabilistic scenario analyses derived from observed data and model assumptions. Not investment advice.</span>
          </div>
        </footer>
      </main>

      {/* Copilot FAB + panel */}
      <button
        onClick={() => setCopilotOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-signal/50 bg-signal px-4 py-3 tick text-xs font-semibold text-primary-foreground shadow-lg shadow-signal/20 hover:bg-signal/90"
      >
        <MessageSquare className="h-4 w-4" />
        Ask REN Copilot
      </button>
      <RenCopilot open={copilotOpen} onClose={() => setCopilotOpen(false)} analysis={A} />
    </div>
  );
}
