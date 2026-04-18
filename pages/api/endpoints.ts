import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export interface Endpoint {
  url: string;
  label: string;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'endpoints.json');

function readEndpoints(): Endpoint[] {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeEndpoints(endpoints: Endpoint[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(endpoints, null, 2), 'utf-8');
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(readEndpoints());
  }

  if (req.method === 'POST') {
    const { url, label } = req.body as { url?: string; label?: string };
    if (!url || !label) {
      return res.status(400).json({ error: 'url and label are required' });
    }
    if (!/^https?:\/\//i.test(url)) {
      return res.status(400).json({ error: 'url must start with http:// or https://' });
    }
    const endpoints = readEndpoints();
    if (endpoints.some((e) => e.url === url)) {
      return res.status(409).json({ error: 'endpoint already exists' });
    }
    endpoints.push({ url, label });
    writeEndpoints(endpoints);
    return res.status(200).json(endpoints);
  }

  if (req.method === 'DELETE') {
    const { url } = req.body as { url?: string };
    if (!url) {
      return res.status(400).json({ error: 'url is required' });
    }
    const endpoints = readEndpoints().filter((e) => e.url !== url);
    writeEndpoints(endpoints);
    return res.status(200).json(endpoints);
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).json({ error: 'Method not allowed' });
}
