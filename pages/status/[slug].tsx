import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

interface HistoryEntry {
  url: string;
  status: 'up' | 'down';
  statusCode?: number;
  responseTime?: number;
  checkedAt: string;
}

interface StatusPageProps {
  label: string;
  url: string;
  slug: string;
  currentStatus: 'up' | 'down' | 'unknown';
  lastChecked: string | null;
  uptime24h: number | null;
  uptime7d: number | null;
  statusCode: number | null;
  responseTime: number | null;
}

function uptimePct(entries: HistoryEntry[], since: Date): number | null {
  const relevant = entries.filter((e) => new Date(e.checkedAt) >= since);
  if (relevant.length === 0) return null;
  const upCount = relevant.filter((e) => e.status === 'up').length;
  return Math.round((upCount / relevant.length) * 1000) / 10;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;

  const endpointsPath = path.join(process.cwd(), 'data', 'endpoints.json');
  const historyPath = path.join(process.cwd(), 'data', 'check-history.json');

  let endpoints: Array<{ url: string; label: string; public_slug?: string }> = [];
  let history: HistoryEntry[] = [];

  try {
    endpoints = JSON.parse(fs.readFileSync(endpointsPath, 'utf-8'));
  } catch {}

  try {
    history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
  } catch {}

  const endpoint = endpoints.find((e) => e.public_slug === slug);
  if (!endpoint) return { notFound: true };

  const urlHistory = history.filter((e) => e.url === endpoint.url);
  const latest = urlHistory.length > 0 ? urlHistory[urlHistory.length - 1] : null;

  const now = new Date();
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    props: {
      label: endpoint.label,
      url: endpoint.url,
      slug,
      currentStatus: latest?.status ?? 'unknown',
      lastChecked: latest?.checkedAt ?? null,
      uptime24h: uptimePct(urlHistory, since24h),
      uptime7d: uptimePct(urlHistory, since7d),
      statusCode: latest?.statusCode ?? null,
      responseTime: latest?.responseTime ?? null,
    },
  };
};

export default function StatusPage({
  label,
  url,
  currentStatus,
  lastChecked,
  uptime24h,
  uptime7d,
  statusCode,
  responseTime,
}: StatusPageProps) {
  const isUp = currentStatus === 'up';
  const isDown = currentStatus === 'down';

  const uptimeColor = (pct: number | null) => {
    if (pct === null) return 'text-slate-600';
    if (pct >= 99) return 'text-green-400';
    if (pct >= 90) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <>
      <Head>
        <title>{label} — Status</title>
        <meta name="description" content={`Current uptime status for ${label}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 w-full flex-1">

          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-8"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to dashboard
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-indigo-400 text-lg leading-none">●</span>
              <h1 className="text-3xl font-bold tracking-tight">{label}</h1>
            </div>
            <p className="text-slate-500 text-sm truncate ml-6">{url}</p>
          </div>

          {/* Current Status */}
          <div
            className={`rounded-2xl border p-8 mb-6 flex items-center gap-6 ${
              isUp
                ? 'bg-green-500/10 border-green-500/30'
                : isDown
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-slate-800/60 border-slate-700/60'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex-shrink-0 ${
                isUp
                  ? 'bg-green-400 shadow-[0_0_14px_rgba(74,222,128,0.7)]'
                  : isDown
                  ? 'bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.7)]'
                  : 'bg-slate-600'
              }`}
            />
            <div className="flex-1 min-w-0">
              <p
                className={`text-2xl font-bold ${
                  isUp ? 'text-green-400' : isDown ? 'text-red-400' : 'text-slate-400'
                }`}
              >
                {isUp ? 'Operational' : isDown ? 'Incident Detected' : 'No Data Yet'}
              </p>
              {lastChecked ? (
                <p className="text-slate-500 text-sm mt-1">
                  Last checked: {new Date(lastChecked).toLocaleString()}
                </p>
              ) : (
                <p className="text-slate-600 text-sm mt-1">Not yet checked — run a monitor check first</p>
              )}
            </div>
            {statusCode != null && (
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-widest font-semibold">HTTP</p>
                <p
                  className={`font-mono font-bold text-2xl ${
                    statusCode >= 200 && statusCode < 300 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {statusCode}
                </p>
              </div>
            )}
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Uptime (24h)</p>
              <p className={`text-3xl font-bold ${uptimeColor(uptime24h)}`}>
                {uptime24h != null ? `${uptime24h}%` : '—'}
              </p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Uptime (7d)</p>
              <p className={`text-3xl font-bold ${uptimeColor(uptime7d)}`}>
                {uptime7d != null ? `${uptime7d}%` : '—'}
              </p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Response Time</p>
              <p
                className={`text-3xl font-bold ${
                  responseTime == null
                    ? 'text-slate-600'
                    : responseTime < 300
                    ? 'text-green-400'
                    : responseTime < 800
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {responseTime != null ? `${responseTime}ms` : '—'}
              </p>
            </div>
          </div>

          {/* No history notice */}
          {!lastChecked && (
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5 text-center text-slate-500 text-sm">
              No check history yet. Trigger a monitor check from the dashboard to populate this page.
            </div>
          )}
        </div>

        <footer className="text-center text-slate-700 text-xs pb-8">
          Powered by Uptime Monitor
        </footer>
      </div>
    </>
  );
}
