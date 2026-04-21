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

interface HistoryEntry {
  url: string;
  status: 'up' | 'down';
  statusCode?: number;
  responseTime?: number;
  checkedAt: string;
}

const HISTORY_FILE = path.join(process.cwd(), 'data', 'check-history.json');
const MAX_HISTORY = 100;

function readHistory(): HistoryEntry[] {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function appendHistory(results: CheckResult[]): void {
  const existing = readHistory();
  const newEntries: HistoryEntry[] = results.map((r) => ({
    url: r.url,
    status: r.status,
    statusCode: r.statusCode,
    responseTime: r.responseTime,
    checkedAt: r.lastChecked,
  }));
  const combined = [...existing, ...newEntries].slice(-MAX_HISTORY);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(combined, null, 2), 'utf-8');
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
  appendHistory(results);
  res.status(200).json({ results, checkedAt: new Date().toISOString() });
}
