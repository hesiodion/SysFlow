'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useNetworkTelemetry } from '@/hooks/useNetworkTelemetry';
import { Header } from '@/components/Header';
import { InterfaceFilterBar } from '@/components/InterfaceFilterBar';
import { InterfaceCard } from '@/components/InterfaceCard';

export default function DashboardPage() {
  const {
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
  } = useNetworkTelemetry();

  const visibleMetrics = metrics.filter((iface) => selectedIfaces.includes(iface.iface));

  return (
    <div className="min-h-screen bg-[#030303] bg-grid-pattern text-zinc-100 relative selection:bg-emerald-500/30">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-sky-500/5 to-indigo-500/10 blur-[140px] rounded-full" />

      <main className="max-w-7xl mx-auto px-6 py-10 md:py-14 relative z-10 space-y-10">
        <Header
          globalRxBytes={globalStats.rx}
          globalTxBytes={globalStats.tx}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(!isPaused)}
        />

        <InterfaceFilterBar
          metrics={metrics}
          telemetry={telemetry}
          selectedIfaces={selectedIfaces}
          onToggleIface={toggleIface}
          onSelectAll={selectAll}
          onSelectActiveOnly={selectActiveOnly}
          onClearSelection={clearSelection}
        />

        {/* Animated Cards Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {visibleMetrics.map((iface) => (
              <InterfaceCard
                key={`card-${iface.iface}`}
                iface={iface}
                telemetry={telemetry[iface.iface]}
                onHide={toggleIface}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {selectedIfaces.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-dashed border-white/10 bg-zinc-900/20"
          >
            <Zap className="w-10 h-10 text-zinc-600 mb-3" />
            <h3 className="text-base font-semibold text-zinc-300">No network interfaces selected</h3>
            <p className="text-sm text-zinc-500 max-w-sm mt-1 mb-5">
              Select one or more network interfaces from the filter bar above to start streaming real-time kernel telemetry.
            </p>
            <button
              onClick={selectAll}
              className="px-4 py-2 rounded-xl text-xs font-mono font-medium bg-white text-black hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Restore All Interfaces
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}