import type { NextApiRequest, NextApiResponse } from 'next';

const MONITORED_URLS = [
  'https://vercel.com',
  'https://nextjs.org',
  'https://github.com',
  'https://cloudflare.com',
];

interface CheckResult {
  url: string;
  status: 'up' | 'down';
  statusCode?: number;
  responseTime?: number;
  uptime: number;
  lastChecked: string;
}

async function checkUrl(url: string): Promise<CheckResult> {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(8000),
    });
    const responseTime = Date.now() - start;
    return {
      url,
      status: res.ok ? 'up' : 'down',
      statusCode: res.status,
      responseTime,
      uptime: 100,
      lastChecked: new Date().toISOString(),
    };
  } catch {
    return {
      url,
      status: 'down',
      responseTime: Date.now() - start,
      uptime: 0,
      lastChecked: new Date().toISOString(),
    };
  }
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const results = await Promise.all(MONITORED_URLS.map(checkUrl));
  res.status(200).json({
    results,
    checkedAt: new Date().toISOString(),
  });
}
