import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, EyeOff } from 'lucide-react';
import { NetworkMetrics, IfaceTelemetry } from '@/types/network';
import { formatBytes, formatRate, getInterfaceMeta, HISTORY_LENGTH } from '@/lib/network-utils';
import { Sparkline } from './Sparkline';

interface InterfaceCardProps {
  iface: NetworkMetrics;
  telemetry?: IfaceTelemetry;
  onHide: (ifaceName: string) => void;
}

export function InterfaceCard({ iface, telemetry, onHide }: InterfaceCardProps) {
  const t: IfaceTelemetry = telemetry || {
    currentRx: 0,
    currentTx: 0,
    peakRx: 0,
    peakTx: 0,
    totalRx: iface.rx_bytes,
    totalTx: iface.tx_bytes,
    history: Array(HISTORY_LENGTH).fill({ timestamp: 0, rxSpeed: 0, txSpeed: 0 }),
  };

  const isUp = iface.operstate === 'up' || iface.operstate === 'unknown';
  const meta = getInterfaceMeta(iface.iface);
  const IconComponent = meta.icon;

  const rxFormatted = formatRate(t.currentRx);
  const txFormatted = formatRate(t.currentTx);
  const rxPeak = formatRate(t.peakRx);
  const txPeak = formatRate(t.peakTx);

  const rxHistory = t.history.map((h) => h.rxSpeed);
  const txHistory = t.history.map((h) => h.txSpeed);

  const rxRatio = t.peakRx > 0 ? Math.min(100, (t.currentRx / t.peakRx) * 100) : 0;
  const txRatio = t.peakTx > 0 ? Math.min(100, (t.currentTx / t.peakTx) * 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -16 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className="group relative rounded-3xl bg-gradient-to-b from-zinc-900/80 to-zinc-950/90 border border-white/[0.08] hover:border-white/[0.18] p-6 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col justify-between transition-colors duration-300"
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-white/[0.04] blur-2xl rounded-full group-hover:bg-emerald-500/[0.08] transition-colors duration-500" />

      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            <div className={`p-2.5 rounded-2xl ${meta.bg} ${meta.border} border`}>
              <IconComponent className={`w-5 h-5 ${meta.accent}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white font-mono">
                {iface.iface}
              </h2>
              <span className="text-xs text-zinc-500 font-medium">{meta.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border ${
                isUp
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-zinc-800/60 text-zinc-500 border-zinc-700/40'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isUp ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
              {iface.operstate}
            </span>

            <button
              onClick={() => onHide(iface.iface)}
              title="Hide interface"
              className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ingress (RX) Block */}
        <div className="space-y-2 mb-6 p-4 rounded-2xl bg-black/40 border border-white/[0.04]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400">
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
              Ingress (RX)
            </span>
            <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
              Peak: {rxPeak.value} {rxPeak.unit}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-mono font-bold tracking-tight text-white tabular-nums">
              {rxFormatted.value}
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              {rxFormatted.unit}
            </span>
          </div>

          <div className="pt-2">
            <Sparkline data={rxHistory} color="#10b981" gradientId={`rx-grad-${iface.iface}`} />
          </div>

          <div className="w-full h-1 bg-zinc-800/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${rxRatio}%` }}
            />
          </div>
        </div>

        {/* Egress (TX) Block */}
        <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/[0.04]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400">
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />
              Egress (TX)
            </span>
            <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
              Peak: {txPeak.value} {txPeak.unit}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-mono font-bold tracking-tight text-white tabular-nums">
              {txFormatted.value}
            </span>
            <span className="text-xs font-mono text-sky-400 font-semibold">
              {txFormatted.unit}
            </span>
          </div>

          <div className="pt-2">
            <Sparkline data={txHistory} color="#0ea5e9" gradientId={`tx-grad-${iface.iface}`} />
          </div>

          <div className="w-full h-1 bg-zinc-800/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${txRatio}%` }}
            />
          </div>
        </div>
      </div>

      {/* Cumulative Kernel Counters */}
      <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
          <span>
            Total RX: <strong className="text-zinc-300 font-normal tabular-nums">{formatBytes(t.totalRx)}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500/60" />
          <span>
            Total TX: <strong className="text-zinc-300 font-normal tabular-nums">{formatBytes(t.totalTx)}</strong>
          </span>
        </div>
      </div>
    </motion.div>
  );
}