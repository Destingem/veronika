import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const MOOD_FILE = path.join(process.cwd(), 'data', 'veronika.txt');
const HISTORY_FILE = path.join(process.cwd(), 'data', 'mood-history.json');

async function ensureFiles() {
  await fs.mkdir(path.dirname(MOOD_FILE), { recursive: true });
  try {
    await fs.access(HISTORY_FILE);
  } catch {
    await fs.writeFile(HISTORY_FILE, '[]');
  }
}

export async function GET() {
  await ensureFiles();
  try {
    const data = await fs.readFile(MOOD_FILE, 'utf-8');
    return NextResponse.json({ mood: parseInt(data) || 50 });
  } catch {
    return NextResponse.json({ mood: 50 });
  }
}

export async function POST(request: Request) {
  const { mood } = await request.json();
  await ensureFiles();
  
  // Save current mood
  await fs.writeFile(MOOD_FILE, mood.toString());
  
  try {
    // Read existing history
    const historyContent = await fs.readFile(HISTORY_FILE, 'utf-8');
    let history = JSON.parse(historyContent);

    // Add new entry
    const newEntry = {
      timestamp: new Date().toISOString(),
      value: mood
    };

    // Omezíme frekvenci ukládání na max 1 záznam za 5 sekund
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    history = history.filter((entry: any) => 
      new Date(entry.timestamp) < fiveSecondsAgo
    );
    
    history.push(newEntry);
    
    // Keep only last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    history = history.filter((entry: any) => 
      new Date(entry.timestamp) > oneDayAgo
    );
    
    await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
    return NextResponse.json({ success: true, mood });
  } catch (error) {
    console.error('Error updating mood history:', error);
    return NextResponse.json({ success: true, mood });
  }
}
