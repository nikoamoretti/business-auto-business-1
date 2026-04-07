"use client";

import { useState, useEffect } from "react";

interface EndpointStatus {
  url: string;
  status: "up" | "down" | "checking";
  statusCode?: number;
  responseTime?: number;
  uptime: number;
  lastChecked?: string;
}

const MONITORED_URLS = [
  "https://vercel.com",
  "https://nextjs.org",
  "https://github.com",
  "https://cloudflare.com",
];

function StatusBadge({ status }: { status: EndpointStatus["status"] }) {
  if (status === "up") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        Operational
      </span>
    );
  }
  if (status === "down") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Incident
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      Checking
    </span>
  );
}

function HttpBadge({ code }: { code?: number }) {
  if (code == null) return <span className="text-slate-600 text-xs font-mono">—</span>;
  if (code >= 200 && code < 300) {
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold bg-green-500/10 text-green-400">
        {code}
      </span>
    );
  }
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold bg-red-500/10 text-red-400">
      {code}
    </span>
  );
}

function UptimeBar({ pct }: { pct: number }) {
  const barColor = pct >= 99 ? "bg-green-500" : pct >= 90 ? "bg-amber-500" : "bg-red-500";
  const textColor =
    pct >= 99 ? "text-green-400" : pct >= 90 ? "text-amber-400" : "text-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-semibold tabular-nums ${textColor}`}>{pct}%</span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-700/50">
      {[192, 96, 64, 80, 40].map((w, i) => (
        <td key={i} className="px-6 py-4">
          <div
            className="h-4 rounded bg-slate-700 animate-pulse"
            style={{ width: w }}
          />
        </td>
      ))}
    </tr>
  );
}

export default function MonitorPage() {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>(
    MONITORED_URLS.map((url) => ({ url, status: "checking", uptime: 100 }))
  );
  const [lastRefresh, setLastRefresh] = useState("");
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/monitor/check");
      if (!res.ok) throw new Error(`API responded with ${res.status}`);
      const data = await res.json();
      if (data.results) {
        setEndpoints((prev) =>
          prev.map((ep) => {
            const r = data.results.find((x: EndpointStatus) => x.url === ep.url);
            return r ? { ...ep, ...r } : ep;
          })
        );
      }
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reach the monitoring API."
      );
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    checkAll();
    const id = setInterval(checkAll, 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upCount = endpoints.filter((e) => e.status === "up").length;
  const downCount = endpoints.filter((e) => e.status === "down").length;
  const avgUptime = endpoints.reduce((a, e) => a + e.uptime, 0) / endpoints.length;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-indigo-400 text-xl leading-none select-none">●</span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Uptime Monitor</h1>
            </div>
            <p className="text-slate-400 text-sm">
              {initialLoad
                ? "Running initial checks…"
                : lastRefresh
                ? `Last refreshed at ${lastRefresh} · auto-refreshes every 30s`
                : "Ready"}
            </p>
          </div>
          <button
            onClick={checkAll}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
              bg-indigo-500 text-white shadow-lg transition-all duration-150
              hover:bg-indigo-400 active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0f172a]"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {loading ? "Checking…" : "Refresh Now"}
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3.5 text-sm">
            <svg
              className="w-5 h-5 mt-0.5 shrink-0 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-red-300 mb-0.5">Monitoring API unreachable</p>
              <p className="text-red-400/80">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-200 transition-colors text-xl leading-none"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Monitored", value: String(endpoints.length), sub: "endpoints", color: "text-slate-100" },
            { label: "Operational", value: String(upCount), sub: "online", color: "text-green-400" },
            {
              label: "Incidents",
              value: String(downCount),
              sub: "offline",
              color: downCount > 0 ? "text-red-400" : "text-slate-500",
            },
            {
              label: "Avg Uptime",
              value: `${avgUptime.toFixed(1)}%`,
              sub: "overall",
              color: avgUptime >= 99 ? "text-green-400" : "text-amber-400",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5
                transition-all duration-150 hover:border-slate-600 hover:bg-slate-800 cursor-default"
            >
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                {card.label}
              </p>
              <p className={`text-3xl font-bold tabular-nums ${card.color}`}>{card.value}</p>
              <p className="text-xs text-slate-600 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Endpoints table */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/60 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300">Monitored Endpoints</h2>
            {loading && !initialLoad && (
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Refreshing
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60">
                  {["Endpoint", "Status", "Response Time", "Uptime", "HTTP Code"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {initialLoad
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                  : endpoints.map((ep, i) => (
                      <tr
                        key={ep.url}
                        className={[
                          "border-b border-slate-700/40 transition-colors duration-100 hover:bg-slate-700/30",
                          i === endpoints.length - 1 ? "border-b-0" : "",
                        ].join(" ")}
                      >
                        <td className="px-6 py-4">
                          <span
                            className="block font-medium text-slate-200 truncate max-w-[180px] sm:max-w-xs"
                            title={ep.url}
                          >
                            {ep.url.replace(/^https?:\/\//, "")}
                          </span>
                          <span className="text-xs text-slate-600">{ep.url}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={ep.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {ep.responseTime != null ? (
                            <span
                              className={`font-mono text-sm tabular-nums ${
                                ep.responseTime < 300
                                  ? "text-green-400"
                                  : ep.responseTime < 800
                                  ? "text-amber-400"
                                  : "text-red-400"
                              }`}
                            >
                              {ep.responseTime} ms
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <UptimeBar pct={ep.uptime} />
                        </td>
                        <td className="px-6 py-4">
                          <HttpBadge code={ep.statusCode} />
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-8">
          Built with Next.js · Deployed on Vercel
        </p>
      </div>
    </div>
  );
}
