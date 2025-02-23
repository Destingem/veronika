import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const quotesFile = path.join(process.cwd(), 'data', 'quotes.json');
    const quotesData = await fs.readFile(quotesFile, 'utf-8');
    const quotes = JSON.parse(quotesData);
    
    // Get random quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    
    return NextResponse.json(randomQuote);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}
