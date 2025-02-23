import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const HISTORY_FILE = path.join(process.cwd(), 'data', 'mood-history.json');

export async function GET() {
  try {
    const history = await fs.readFile(HISTORY_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(history));
  } catch {
    return NextResponse.json([]);
  }
}
