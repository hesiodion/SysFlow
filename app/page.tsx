'use client';

import { useEffect, useState, useRef } from 'react';

// TypeScript interfaces for our data structures
interface NetworkMetrics {
  iface: string;
  operstate: string;
  rx_bytes: number;
  tx_bytes: number;
}

interface SpeedMetrics {
  rxSpeed: number; // Bytes per second
  txSpeed: number; // Bytes per second
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<NetworkMetrics[]>([]);
  const [speeds, setSpeeds] = useState<Record<string, SpeedMetrics>>({});
  
  // useRef is crucial here: it keeps track of the previous fetch 
  // without triggering a component re-render when its value changes.
  const prevMetricsRef = useRef<NetworkMetrics[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/network');
        const data: NetworkMetrics[] = await res.json();
        
        const currentSpeeds: Record<string, SpeedMetrics> = {};
        const prevMetrics = prevMetricsRef.current;

        data.forEach((currentIface) => {
          const prevIface = prevMetrics.find((p) => p.iface === currentIface.iface);
          
          if (prevIface) {
            // Calculate bytes per second (since interval is 1000ms)
            // Ensure we don't get negative values if counters reset
            currentSpeeds[currentIface.iface] = {
              rxSpeed: Math.max(0, currentIface.rx_bytes - prevIface.rx_bytes),
              txSpeed: Math.max(0, currentIface.tx_bytes - prevIface.tx_bytes),
            };
          } else {
            // First render: no previous data to compare with
            currentSpeeds[currentIface.iface] = { rxSpeed: 0, txSpeed: 0 };
          }
        });

        setSpeeds(currentSpeeds);
        setMetrics(data);
        
        // Update the ref for the next interval comparison
        prevMetricsRef.current = data;
      } catch (error) {
        console.error('Failed to fetch network metrics:', error);
      }
    };

    // Initial fetch immediately on mount
    fetchMetrics();

    // Polling every 1000 milliseconds (1 second)
    const interval = setInterval(fetchMetrics, 1000);
    
    // Cleanup function to clear the interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  // Utility function to convert raw bytes/s into readable formats (KB/s, MB/s)
  const formatSpeed = (bytesPerSec: number) => {
    if (bytesPerSec === 0) return '0.00 B/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytesPerSec) / Math.log(k));
    return parseFloat((bytesPerSec / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            SysFlow
          </h1>
          <p className="text-gray-400 mt-2">Real-time network bandwidth monitoring</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((iface) => {
            const speed = speeds[iface.iface] || { rxSpeed: 0, txSpeed: 0 };
            const isUp = iface.operstate === 'up' || iface.operstate === 'unknown';

            return (
              <div 
                key={iface.iface} 
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg transition-all"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-200">{iface.iface}</h2>
                  <span 
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      isUp 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {iface.operstate.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Download Metrics */}
                  <div className="flex justify-between items-end border-b border-gray-800 pb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Download (RX)</p>
                      <p className="text-2xl font-mono text-emerald-400">
                        {formatSpeed(speed.rxSpeed)}
                      </p>
                    </div>
                  </div>

                  {/* Upload Metrics */}
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Upload (TX)</p>
                      <p className="text-2xl font-mono text-blue-400">
                        {formatSpeed(speed.txSpeed)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}