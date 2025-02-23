'use client'
import dynamic from 'next/dynamic';
import { useState, useEffect } from "react";
import Chat from '@/components/Chat';
import MoodGraph from '@/components/MoodGraph';

const MoodParticles = dynamic(() => import('@/components/MoodParticles'), {
  ssr: false,
});

// Helper function to interpolate between two colors
const interpolateColor = (color1: string, color2: string, factor: number) => {
  const c1 = {
    r: parseInt(color1.slice(1, 3), 16),
    g: parseInt(color1.slice(3, 5), 16),
    b: parseInt(color1.slice(5, 7), 16)
  };
  const c2 = {
    r: parseInt(color2.slice(1, 3), 16),
    g: parseInt(color2.slice(3, 5), 16),
    b: parseInt(color2.slice(5, 7), 16)
  };
  
  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

interface Quote {
  text: string;
  author: string;
  book: string;
}

export default function Home() {
  const [isVeronika, setIsVeronika] = useState(false);
  const [moodValue, setMoodValue] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    // Fetch mood
    fetch('/api/mood')
      .then(res => res.json())
      .then(data => {
        setMoodValue(data.mood);
        setIsLoading(false);
      });

    // Fetch random quote
    fetch('/api/quote')
      .then(res => res.json())
      .then(data => setQuote(data));
  }, []);

  const updateMood = async (newMood: number) => {
    setMoodValue(newMood);
    await fetch('/api/mood', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mood: newMood }),
    });
  };

  const getEmoji = (value: number) => {
    if (value < 20) return "😢";
    if (value < 40) return "🙁";
    if (value < 60) return "😐";
    if (value < 80) return "🙂";
    return "😊";
  };

  const getMoodColors = (value: number) => {
    const colorStops = [
      { value: 0, colors: ['#ff6b6b', '#c92a2a'] },
      { value: 20, colors: ['#ffa94d', '#e67700'] },
      { value: 40, colors: ['#ffd43b', '#f08c00'] },
      { value: 60, colors: ['#69db7c', '#2b8a3e'] },
      { value: 80, colors: ['#4dabf7', '#1864ab'] }
    ];

    // Find the two color stops we're between
    const lowerStop = colorStops.filter(stop => stop.value <= value).slice(-1)[0] || colorStops[0];
    const upperStop = colorStops.find(stop => stop.value > value) || colorStops[colorStops.length - 1];
    
    // Calculate interpolation factor between the two stops
    const range = upperStop.value - lowerStop.value;
    const factor = range === 0 ? 0 : (value - lowerStop.value) / range;
    
    // Interpolate both colors
    return [
      interpolateColor(lowerStop.colors[0], upperStop.colors[0], factor),
      interpolateColor(lowerStop.colors[1], upperStop.colors[1], factor)
    ];
  };

  const colors = getMoodColors(moodValue);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <MoodParticles colors={colors} />
      
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        {/* Main content */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="flex flex-col items-center gap-8">
            {isLoading ? (
              <div className="text-white">Načítám Veroničin mood...</div>
            ) : (
              <>
                <div className="text-8xl backdrop-blur-sm p-8 rounded-full bg-white/10">
                  {getEmoji(moodValue)}
                </div>
                
                <h1 className="text-2xl font-bold text-white drop-shadow-lg text-center">
                  Jak se dnes má Veronika?
                </h1>

                <div className="flex gap-2 items-center">
                  <label htmlFor="isVeronika" className="text-white drop-shadow-lg">
                    Jsem Veronika:
                  </label>
                  <select 
                    id="isVeronika" 
                    value={isVeronika ? "ano" : "ne"}
                    onChange={(e) => setIsVeronika(e.target.value === "ano")}
                    className="border rounded p-2 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="ne">NE</option>
                    <option value="ano">ANO</option>
                  </select>
                </div>

                <div className="w-full max-w-md">
                  {isVeronika ? (
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={moodValue}
                      onChange={(e) => updateMood(Number(e.target.value))}
                      className="w-full"
                    />
                  ) : (
                    <div className="text-center text-white font-bold backdrop-blur-sm bg-black/20 p-4 rounded">
                      Svůj Mood může upravovat jen Veronika!
                    </div>
                  )}
                </div>

                {quote && (
                  <div className="max-w-2xl text-center text-white backdrop-blur-sm bg-black/10 p-6 rounded-lg">
                    <p className="text-lg italic mb-2">{quote.text}</p>
                    <div className="text-sm opacity-80">
                      {quote.author}
                      {quote.book && <span> • {quote.book}</span>}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* Sidebar/Bottom content based on screen size */}
        <div className="lg:fixed lg:top-8 lg:right-8 lg:flex lg:flex-col lg:gap-8 lg:z-10 p-4 flex flex-col gap-8 lg:p-0 static">
          <MoodGraph />
          <Chat isVeronika={isVeronika} />
        </div>
      </div>
    </div>
  );
}
