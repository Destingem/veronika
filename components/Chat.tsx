'use client'
import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

interface ChatProps {
  isVeronika: boolean;
}

export default function Chat({ isVeronika }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial load of messages
    fetchMessages();
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    const response = await fetch('/api/chat');
    const data = await response.json();
    setMessages(data);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const author = isVeronika ? "Veronika" : "Ondřej";

    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newMessage, author }),
    });

    setNewMessage('');
    fetchMessages();
  };

  return (
    <div className="w-80 h-[600px] bg-white/10 backdrop-blur-md rounded-lg flex flex-col">
      <div className="p-4 border-b border-white/20">
        <h3 className="text-white font-bold">Chat ({isVeronika ? 'Veronika' : 'Ondřej'})</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-white/20 rounded p-3">
            <div className="flex justify-between text-sm">
              <span className="font-bold text-white">{msg.author}</span>
              <span className="text-white/60">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="text-white mt-1">{msg.text}</p>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-white/20">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Napiš zprávu..."
            className="flex-1 p-2 rounded bg-white/20 text-white placeholder:text-white/50"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-white/20 rounded hover:bg-white/30 text-white"
          >
            Odeslat
          </button>
        </form>
      </div>
    </div>
  );
}
