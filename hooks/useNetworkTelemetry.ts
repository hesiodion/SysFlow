import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { NetworkMetrics, IfaceTelemetry } from '@/types/network';
import { HISTORY_LENGTH } from '@/lib/network-utils';

export function useNetworkTelemetry() {
  const [metrics, setMetrics] = useState<NetworkMetrics[]>([]);
  const [telemetry, setTelemetry] = useState<Record<string, IfaceTelemetry>>({});
  const [selectedIfaces, setSelectedIfaces] = useState<string[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const prevMetricsRef = useRef<NetworkMetrics[]>([]);

  useEffect(() => {
    if (isPaused) return;

    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/network');
        if (!res.ok) return;
        const data: NetworkMetrics[] = await res.json();

        // Auto-select active non-loopback interfaces on initial load
        if (!hasInitialized && data.length > 0) {
          const active = data
            .filter((d) => (d.operstate === 'up' || d.operstate === 'unknown') && d.iface !== 'lo')
            .map((d) => d.iface);
          setSelectedIfaces(active.length > 0 ? active : data.map((d) => d.iface));
          setHasInitialized(true);
        }

        const prevMetrics = prevMetricsRef.current;
        const now = Date.now();

        setTelemetry((prevTelemetry) => {
          const nextTelemetry: Record<string, IfaceTelemetry> = { ...prevTelemetry };

          data.forEach((curr) => {
            const prev = prevMetrics.find((p) => p.iface === curr.iface);
            const existing = nextTelemetry[curr.iface] || {
              currentRx: 0,
              currentTx: 0,
              peakRx: 0,
              peakTx: 0,
              totalRx: curr.rx_bytes,
              totalTx: curr.tx_bytes,
              history: Array(HISTORY_LENGTH).fill({ timestamp: now, rxSpeed: 0, txSpeed: 0 }),
            };

            const rxSpeed = prev ? Math.max(0, curr.rx_bytes - prev.rx_bytes) : 0;
            const txSpeed = prev ? Math.max(0, curr.tx_bytes - prev.tx_bytes) : 0;

            nextTelemetry[curr.iface] = {
              currentRx: rxSpeed,
              currentTx: txSpeed,
              peakRx: Math.max(existing.peakRx, rxSpeed),
              peakTx: Math.max(existing.peakTx, txSpeed),
              totalRx: curr.rx_bytes,
              totalTx: curr.tx_bytes,
              history: [...existing.history.slice(1), { timestamp: now, rxSpeed, txSpeed }],
            };
          });

          return nextTelemetry;
        });

        setMetrics(data);
        prevMetricsRef.current = data;
      } catch (error) {
        console.error('Failed to fetch network metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 1000);
    return () => clearInterval(interval);
  }, [hasInitialized, isPaused]);

  const toggleIface = useCallback((ifaceName: string) => {
    setSelectedIfaces((prev) =>
      prev.includes(ifaceName) ? prev.filter((n) => n !== ifaceName) : [...prev, ifaceName]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIfaces(metrics.map((m) => m.iface));
  }, [metrics]);

  const selectActiveOnly = useCallback(() => {
    setSelectedIfaces(
      metrics
        .filter((m) => (m.operstate === 'up' || m.operstate === 'unknown') && m.iface !== 'lo')
        .map((m) => m.iface)
    );
  }, [metrics]);

  const clearSelection = useCallback(() => {
    setSelectedIfaces([]);
  }, []);

  // Compute aggregate ingress/egress across currently visible interfaces
  const globalStats = useMemo(() => {
    return selectedIfaces.reduce(
      (acc, iface) => {
        const t = telemetry[iface];
        if (t) {
          acc.rx += t.currentRx;
          acc.tx += t.currentTx;
        }
        return acc;
      },
      { rx: 0, tx: 0 }
    );
  }, [selectedIfaces, telemetry]);

  return {
    metrics,
    telemetry,
    selectedIfaces,
    isPaused,
    globalStats,
    setIsPaused,
    toggleIface,
    selectAll,
    selectActiveOnly,
    clearSelection,
  };
}