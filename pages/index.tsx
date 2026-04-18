import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

interface Endpoint {
  url: string;
  label: string;
}

interface EndpointStatus {
  url: string;
  label: string;
  status: 'up' | 'down' | 'checking';
  statusCode?: number;
  responseTime?: number;
  uptime: number;
  lastChecked?: string;
}

function StatusBadge({ status }: { status: EndpointStatus['status'] }) {
  const dotClass =
    status === 'up'
      ? 'bg-green-400'
      : status === 'down'
      ? 'bg-red-400'
      : 'bg-amber-400 animate-pulse';
  const badgeClass =
    status === 'up'
      ? 'status-badge-up'
      : status === 'down'
      ? 'status-badge-down'
      : 'status-badge-checking';
  const label =
    status === 'up' ? 'Operational' : status === 'down' ? 'Incident' : 'Checking';
  return (
    <span className={badgeClass}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}

function HttpCodeBadge({ code }: { code?: number }) {
  if (code == null) return <span className="text-slate-600 text-xs font-mono">—</span>;
  const cls = code >= 200 && code < 300 ? 'http-badge-2xx' : 'http-badge-error';
  return <span className={cls}>{code}</span>;
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-700/60">
      <td className="px-6 py-4"><div className="skeleton h-4 w-48" /></td>
      <td className="px-6 py-4"><div className="skeleton h-6 w-24 rounded-full" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-16" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-20" /></td>
      <td className="px-6 py-4"><div className="skeleton h-5 w-10 rounded" /></td>
      <td className="px-6 py-4"><div className="skeleton h-5 w-16 rounded" /></td>
    </tr>
  );
}

function UptimeBar({ pct }: { pct: number }) {
  const color = pct >= 99 ? 'bg-green-500' : pct >= 90 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = pct >= 99 ? 'text-green-400' : pct >= 90 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-slate-700 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-semibold ${textColor}`}>{pct}%</span>
    </div>
  );
}

export default function UptimeMonitor() {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([]);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add form state
  const [formUrl, setFormUrl] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  const mergeStatuses = useCallback(
    (epList: Endpoint[], statuses: EndpointStatus[]) =>
      epList.map((ep) => {
        const existing = statuses.find((s) => s.url === ep.url);
        return existing ?? { ...ep, status: 'checking' as const, uptime: 100 };
      }),
    []
  );

  const fetchEndpoints = useCallback(async (): Promise<Endpoint[]> => {
    const res = await fetch('/api/endpoints');
    if (!res.ok) throw new Error('Failed to load endpoints');
    return res.json();
  }, []);

  const checkAll = useCallback(async (epList?: Endpoint[]) => {
    setLoading(true);
    setError(null);
    try {
      const list = epList ?? (await fetchEndpoints());
      const res = await fetch('/api/monitor/check');
      if (!res.ok) throw new Error(`API responded with ${res.status}`);
      const data = await res.json();
      const statuses: EndpointStatus[] = data.results ?? [];
      setEndpoints(mergeStatuses(list, statuses));
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reach the monitoring API.');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [fetchEndpoints, mergeStatuses]);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const list = await fetchEndpoints();
        if (!cancelled) {
          setEndpoints(list.map((ep) => ({ ...ep, status: 'checking', uptime: 100 })));
          checkAll(list);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load endpoints.');
      }
    };
    init();
    const interval = setInterval(() => checkAll(), 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formUrl || !formLabel) {
      setFormError('Both URL and label are required.');
      return;
    }
    setFormSubmitting(true);
    try {
      const res = await fetch('/api/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formUrl.trim(), label: formLabel.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? 'Failed to add endpoint.');
        return;
      }
      setFormUrl('');
      setFormLabel('');
      // Rebuild status list with new endpoint, then refresh checks
      setEndpoints(mergeStatuses(data, endpoints));
      checkAll(data);
    } catch {
      setFormError('Network error — could not add endpoint.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (url: string) => {
    setDeletingUrl(url);
    try {
      const res = await fetch('/api/endpoints', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to delete endpoint.');
        return;
      }
      setEndpoints(mergeStatuses(data, endpoints));
    } catch {
      setError('Network error — could not delete endpoint.');
    } finally {
      setDeletingUrl(null);
    }
  };

  const upCount = endpoints.filter((e) => e.status === 'up').length;
  const downCount = endpoints.filter((e) => e.status === 'down').length;
  const avgUptime =
    endpoints.length > 0
      ? endpoints.reduce((acc, e) => acc + e.uptime, 0) / endpoints.length
      : 100;

  return (
    <>
      <Head>
        <title>Uptime Monitor</title>
        <meta name="description" content="Real-time uptime monitoring dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#0f172a] text-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-indigo-400 text-xl leading-none">●</span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Uptime Monitor</h1>
              </div>
              <p className="text-slate-400 text-sm">
                {initialLoad
                  ? 'Running initial checks…'
                  : lastRefresh
                  ? `Last refreshed at ${lastRefresh} · auto-refreshes every 30s`
                  : 'Ready'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150
                  bg-slate-800 text-slate-300 border border-slate-700
                  hover:bg-slate-700 hover:text-slate-100 hover:border-slate-600
                  focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-[#0f172a]"
              >
                Pricing
              </Link>
              <button
                onClick={() => checkAll()}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150
                  bg-indigo-500 text-white shadow-lg
                  hover:bg-indigo-400
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0f172a]"
              >
                {loading && (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                {loading ? 'Checking…' : 'Refresh Now'}
              </button>
            </div>
          </div>

          {/* Add Endpoint Form */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">Add Endpoint</h2>
            <form onSubmit={handleAddEndpoint} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="https://example.com"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                className="flex-1 bg-slate-900/70 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100
                  placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  transition-colors"
                aria-label="URL to monitor"
              />
              <input
                type="text"
                placeholder="Label"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                className="w-full sm:w-40 bg-slate-900/70 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100
                  placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  transition-colors"
                aria-label="Label for the endpoint"
              />
              <button
                type="submit"
                disabled={formSubmitting}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
                  bg-indigo-500 text-white hover:bg-indigo-400 transition-all duration-150
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0f172a]"
              >
                {formSubmitting ? 'Adding…' : '+ Add'}
              </button>
            </form>
            {formError && (
              <p className="mt-2 text-xs text-red-400">{formError}</p>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3.5 text-sm">
              <svg className="w-5 h-5 mt-0.5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-red-300 mb-0.5">Error</p>
                <p className="text-red-400/80">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-200 transition-colors text-lg leading-none"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Monitored', value: endpoints.length, sub: 'endpoints', color: 'text-slate-100' },
              { label: 'Operational', value: upCount, sub: 'online', color: 'text-green-400' },
              { label: 'Incidents', value: downCount, sub: 'offline', color: downCount > 0 ? 'text-red-400' : 'text-slate-500' },
              {
                label: 'Avg Uptime',
                value: `${avgUptime.toFixed(1)}%`,
                sub: 'overall',
                color: avgUptime >= 99 ? 'text-green-400' : 'text-amber-400',
              },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5
                  transition-all duration-150 hover:border-slate-600 hover:bg-slate-800 cursor-default"
              >
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">{card.label}</p>
                <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
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
                    {['Endpoint', 'Status', 'Response Time', 'Uptime', 'HTTP Code', ''].map((h) => (
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
                    ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                    : endpoints.length === 0
                    ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                          No endpoints yet. Add one above to start monitoring.
                        </td>
                      </tr>
                    )
                    : endpoints.map((ep, i) => (
                        <tr
                          key={ep.url}
                          className={`
                            border-b border-slate-700/40 transition-colors duration-100
                            hover:bg-slate-700/30
                            ${i === endpoints.length - 1 ? 'border-b-0' : ''}
                          `}
                        >
                          <td className="px-6 py-4">
                            <span className="font-medium text-slate-200 truncate block max-w-[180px] sm:max-w-xs" title={ep.url}>
                              {ep.label || ep.url.replace(/^https?:\/\//, '')}
                            </span>
                            <span className="text-xs text-slate-600">{ep.url}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={ep.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {ep.responseTime != null ? (
                              <span
                                className={`font-mono text-sm ${
                                  ep.responseTime < 300
                                    ? 'text-green-400'
                                    : ep.responseTime < 800
                                    ? 'text-amber-400'
                                    : 'text-red-400'
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
                            <HttpCodeBadge code={ep.statusCode} />
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDelete(ep.url)}
                              disabled={deletingUrl === ep.url}
                              className="text-xs text-slate-500 hover:text-red-400 transition-colors disabled:opacity-40
                                px-2 py-1 rounded border border-transparent hover:border-red-400/30"
                              aria-label={`Remove ${ep.url}`}
                            >
                              {deletingUrl === ep.url ? '…' : 'Remove'}
                            </button>
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
    </>
  );
}
