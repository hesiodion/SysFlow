import { motion } from 'framer-motion';
import { Eye, EyeOff, Radio } from 'lucide-react';
import { NetworkMetrics, IfaceTelemetry } from '@/types/network';

interface InterfaceFilterBarProps {
  metrics: NetworkMetrics[];
  telemetry: Record<string, IfaceTelemetry>;
  selectedIfaces: string[];
  onToggleIface: (iface: string) => void;
  onSelectAll: () => void;
  onSelectActiveOnly: () => void;
  onClearSelection: () => void;
}

export function InterfaceFilterBar({
  metrics,
  telemetry,
  selectedIfaces,
  onToggleIface,
  onSelectAll,
  onSelectActiveOnly,
  onClearSelection,
}: InterfaceFilterBarProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span>Detected Network Interfaces ({selectedIfaces.length}/{metrics.length} visible)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSelectAll}
            className="text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5 cursor-pointer"
          >
            Show All
          </button>
          <span className="text-zinc-700">/</span>
          <button
            onClick={onSelectActiveOnly}
            className="text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5 cursor-pointer"
          >
            Active Only
          </button>
          <span className="text-zinc-700">/</span>
          <button
            onClick={onClearSelection}
            className="text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5 cursor-pointer"
          >
            Hide All
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5 p-2 rounded-2xl bg-zinc-900/40 border border-white/[0.06] backdrop-blur-md">
        {metrics.map((m) => {
          const isSelected = selectedIfaces.includes(m.iface);
          const isUp = m.operstate === 'up' || m.operstate === 'unknown';
          const t = telemetry[m.iface];
          const isActiveTraffic = t && (t.currentRx > 0 || t.currentTx > 0);

          return (
            <motion.button
              layout
              whileTap={{ scale: 0.96 }}
              key={`chip-${m.iface}`}
              onClick={() => onToggleIface(m.iface)}
              className={`group relative flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer border ${
                isSelected
                  ? 'bg-zinc-800/90 text-white border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                  : 'bg-transparent text-zinc-500 border-transparent hover:bg-white/[0.03] hover:text-zinc-300'
              }`}
            >
              <span className="relative flex h-2 w-2">
                {isUp && isActiveTraffic && isSelected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isUp ? 'bg-emerald-500' : 'bg-zinc-600'
                  }`}
                />
              </span>

              <span className="font-medium tracking-tight">{m.iface}</span>

              {isSelected ? (
                <Eye className="w-3 h-3 text-zinc-400 group-hover:text-white transition-colors" />
              ) : (
                <EyeOff className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              )}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}