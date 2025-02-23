import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const CHAT_FILE = path.join(process.cwd(), 'data', 'chat.json');
const DEFAULT_MESSAGES = [
  {
    id: "initial-message",
    text: "Vítejte v chatu! 👋",
    author: "System",
    timestamp: new Date().toISOString()
  }
];

async function ensureFile() {
  try {
    await fs.access(path.dirname(CHAT_FILE));
  } catch {
    await fs.mkdir(path.dirname(CHAT_FILE), { recursive: true });
  }
  
  try {
    await fs.access(CHAT_FILE);
    // Test if file is readable and contains valid JSON
    const content = await fs.readFile(CHAT_FILE, 'utf-8');
    try {
      JSON.parse(content);
    } catch {
      // If JSON is invalid, initialize with default messages
      await fs.writeFile(CHAT_FILE, JSON.stringify(DEFAULT_MESSAGES));
    }
  } catch {
    // If file doesn't exist, create it with default messages
    await fs.writeFile(CHAT_FILE, JSON.stringify(DEFAULT_MESSAGES));
  }
}

export async function GET() {
  try {
    await ensureFile();
    const content = await fs.readFile(CHAT_FILE, 'utf-8');
    const messages = JSON.parse(content);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error reading chat messages:', error);
    return NextResponse.json(DEFAULT_MESSAGES);
  }
}

export async function POST(request: Request) {
  try {
    const { text, author } = await request.json();
    await ensureFile();
    
    let messages = DEFAULT_MESSAGES;
    try {
      const content = await fs.readFile(CHAT_FILE, 'utf-8');
      messages = JSON.parse(content);
    } catch {
      // Use default messages if file read fails
    }
    
    const newMessage = {
      id: uuidv4(),
      text,
      author,
      timestamp: new Date().toISOString(),
    };
    
    messages.push(newMessage);
    if (messages.length > 100) messages.shift(); // Keep only last 100 messages
    
    await fs.writeFile(CHAT_FILE, JSON.stringify(messages, null, 2));
    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error saving chat message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}
