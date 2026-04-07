import { useState, useEffect } from 'react';

interface EndpointStatus {
  url: string;
  status: 'up' | 'down' | 'checking';
  statusCode?: number;
  responseTime?: number;
  uptime: number;
  lastChecked?: string;
}

const MONITORED_URLS = [
  'https://vercel.com',
  'https://nextjs.org',
  'https://github.com',
  'https://cloudflare.com',
];

const initialEndpoints: EndpointStatus[] = MONITORED_URLS.map((url) => ({
  url,
  status: 'checking',
  uptime: 100,
}));

export default function UptimeMonitor() {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>(initialEndpoints);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const checkAll = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/monitor/check');
      const data = await res.json();
      if (data.results) {
        setEndpoints((prev) =>
          prev.map((ep) => {
            const result = data.results.find((r: EndpointStatus) => r.url === ep.url);
            return result ? { ...ep, ...result } : ep;
          })
        );
      }
      setLastRefresh(new Date().toLocaleTimeString());
    } catch {
      // network error — keep previous state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAll();
    const interval = setInterval(checkAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const upCount = endpoints.filter((e) => e.status === 'up').length;
  const downCount = endpoints.filter((e) => e.status === 'down').length;

  return (
    <>
      <style>{`
        :root {
          --bg: #0f1117;
          --surface: #1a1d27;
          --surface2: #22263a;
          --border: #2e3350;
          --accent: #6366f1;
          --accent-glow: rgba(99,102,241,0.25);
          --text: #f1f5f9;
          --muted: #94a3b8;
          --up: #22c55e;
          --down: #ef4444;
          --checking: #f59e0b;
          --radius: 12px;
          --font: 'Inter', system-ui, sans-serif;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); color: var(--text); font-family: var(--font); min-height: 100vh; }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px' }}>
              <span style={{ color: 'var(--accent)' }}>●</span> Uptime Monitor
            </h1>
            <p style={{ color: 'var(--muted)', marginTop: 4, fontSize: 14 }}>
              {lastRefresh ? `Last checked at ${lastRefresh}` : 'Checking…'}
            </p>
          </div>
          <button
            onClick={checkAll}
            disabled={loading}
            style={{
              background: loading ? 'var(--surface2)' : 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              boxShadow: loading ? 'none' : '0 0 20px var(--accent-glow)',
            }}
          >
            {loading ? 'Checking…' : 'Refresh Now'}
          </button>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Monitored', value: endpoints.length, color: 'var(--text)' },
            { label: 'Operational', value: upCount, color: 'var(--up)' },
            { label: 'Incidents', value: downCount, color: downCount > 0 ? 'var(--down)' : 'var(--muted)' },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '20px 24px',
              }}
            >
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {card.label}
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Endpoint table */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 100px 110px 90px 90px',
              padding: '12px 20px',
              borderBottom: '1px solid var(--border)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            <span>Endpoint</span>
            <span>Status</span>
            <span>Response</span>
            <span>Uptime</span>
            <span>Code</span>
          </div>

          {endpoints.map((ep, i) => (
            <div
              key={ep.url}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 100px 110px 90px 90px',
                padding: '16px 20px',
                borderBottom: i < endpoints.length - 1 ? '1px solid var(--border)' : 'none',
                alignItems: 'center',
                transition: 'background 0.1s',
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {ep.url}
              </span>

              <span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color:
                      ep.status === 'up'
                        ? 'var(--up)'
                        : ep.status === 'down'
                        ? 'var(--down)'
                        : 'var(--checking)',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background:
                        ep.status === 'up'
                          ? 'var(--up)'
                          : ep.status === 'down'
                          ? 'var(--down)'
                          : 'var(--checking)',
                      boxShadow:
                        ep.status === 'up'
                          ? '0 0 6px var(--up)'
                          : ep.status === 'down'
                          ? '0 0 6px var(--down)'
                          : '0 0 6px var(--checking)',
                    }}
                  />
                  {ep.status === 'checking' ? 'Checking' : ep.status === 'up' ? 'Up' : 'Down'}
                </span>
              </span>

              <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                {ep.responseTime != null ? `${ep.responseTime} ms` : '—'}
              </span>

              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--up)' }}>
                {ep.uptime}%
              </span>

              <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                {ep.statusCode ?? '—'}
              </span>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, marginTop: 24 }}>
          Auto-refreshes every 30 seconds
        </p>
      </div>
    </>
  );
}
