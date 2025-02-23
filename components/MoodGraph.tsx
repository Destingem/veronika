'use client'
import { useEffect, useState } from 'react';

interface MoodHistory {
  timestamp: string;
  value: number;
}

export default function MoodGraph() {
  const [history, setHistory] = useState<MoodHistory[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetch('/api/mood/history')
      .then(res => res.json())
      .then(data => {
        // Agregujeme data po minutách pro lepší přehlednost
        const aggregatedData = aggregateDataByMinute(data);
        setHistory(aggregatedData);
      });
  }, []);

  const aggregateDataByMinute = (data: MoodHistory[]) => {
    const groupedData = new Map<string, number[]>();
    
    // Seskupíme hodnoty podle minut
    data.forEach(entry => {
      const date = new Date(entry.timestamp);
      const key = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes()
      ).toISOString();
      
      if (!groupedData.has(key)) {
        groupedData.set(key, []);
      }
      groupedData.get(key)?.push(entry.value);
    });

    // Vypočítáme průměr pro každou minutu
    const aggregated = Array.from(groupedData.entries()).map(([timestamp, values]) => ({
      timestamp,
      value: Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    }));

    // Seřadíme podle času
    return aggregated.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div 
        className={`
          transition-all duration-300 ease-in-out
          backdrop-blur-md rounded-lg p-4
          cursor-pointer
          ${isExpanded 
            ? 'fixed inset-4 bg-black/40 z-50'
            : 'w-80 h-[300px] bg-white/10 hover:scale-105'
          }
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold">Nálada v průběhu času</h3>
          {isExpanded && (
            <button 
              className="text-white opacity-70 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
            >
              ✕
            </button>
          )}
        </div>

        <div className={`
          flex items-end gap-1
          ${isExpanded ? 'h-[calc(100%-4rem)]' : 'h-[200px]'}
        `}>
          {history.map((entry, i) => (
            <div
              key={entry.timestamp}
              className="flex-1 bg-white/20 hover:bg-white/30 transition-all group relative"
              style={{ height: `${entry.value}%` }}
            >
              <div className={`
                absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 
                bg-black/50 text-white text-xs px-2 py-1 rounded
                ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                whitespace-nowrap transition-opacity
              `}>
                {formatTime(entry.timestamp)}: {entry.value}%
              </div>
            </div>
          ))}
        </div>

        {isExpanded && (
          <div className="absolute bottom-4 left-4 right-4 text-white text-center text-sm opacity-70">
            Kliknutím kamkoliv zavřete graf
          </div>
        )}
      </div>

      {/* Overlay pro pozadí při rozbalení */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
}
