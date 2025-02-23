import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const MOOD_FILE = path.join(process.cwd(), 'data', 'veronika.txt');
const HISTORY_FILE = path.join(process.cwd(), 'data', 'mood-history.json');

async function ensureFiles() {
  await fs.mkdir(path.dirname(MOOD_FILE), { recursive: true });
  
  // Ensure mood file exists
  try {
    await fs.access(MOOD_FILE);
  } catch {
    await fs.writeFile(MOOD_FILE, '50');
  }
  
  // Ensure history file exists
  try {
    await fs.access(HISTORY_FILE);
  } catch {
    await fs.writeFile(HISTORY_FILE, '[]');
  }

  return true;
}

async function getCurrentMood(): Promise<number> {
  try {
    const data = await fs.readFile(MOOD_FILE, 'utf-8');
    const parsedValue = parseInt(data.trim());
    return isNaN(parsedValue) ? 50 : parsedValue;
  } catch (error) {
    console.error('Error reading mood file:', error);
    return 50;
  }
}

export async function GET() {
  await ensureFiles();
  const currentMood = await getCurrentMood();
  return NextResponse.json({ mood: currentMood });
}

export async function POST(request: Request) {
  const { mood } = await request.json();
  await ensureFiles();
  
  // Save current mood with proper formatting
  await fs.writeFile(MOOD_FILE, mood.toString().trim());
  
  try {
    // Update history
    const historyContent = await fs.readFile(HISTORY_FILE, 'utf-8');
    let history = JSON.parse(historyContent);

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
  } catch (error) {
    console.error('Error updating mood history:', error);
  }

  return NextResponse.json({ success: true, mood });
}
