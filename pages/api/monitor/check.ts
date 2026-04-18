import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface CheckResult {
  url: string;
  status: 'up' | 'down';
  statusCode?: number;
  responseTime?: number;
  uptime: number;
  lastChecked: string;
}

function loadUrls(): string[] {
  try {
    const data = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'data', 'endpoints.json'), 'utf-8')
    );
    return data.map((e: { url: string }) => e.url);
  } catch {
    return [];
  }
}

async function checkUrl(url: string): Promise<CheckResult> {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(8000),
    });
    return {
      url,
      status: res.ok ? 'up' : 'down',
      statusCode: res.status,
      responseTime: Date.now() - start,
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

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const urls = loadUrls();
  const results = await Promise.all(urls.map(checkUrl));
  res.status(200).json({ results, checkedAt: new Date().toISOString() });
}
