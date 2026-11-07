import { Activity, ArrowDownRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import { formatRate } from '@/lib/network-utils';

interface HeaderProps {
  globalRxBytes: number;
  globalTxBytes: number;
  isPaused: boolean;
  onTogglePause: () => void;
}

export function Header({ globalRxBytes, globalTxBytes, isPaused, onTogglePause }: HeaderProps) {
  const globalRx = formatRate(globalRxBytes);
  const globalTx = formatRate(globalTxBytes);

  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-white/[0.07]">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-950 border border-white/10 shadow-inner">
            <Activity className="w-5 h-5 text-emerald-400" />
            {!isPaused && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            SysFlow
          </h1>
          <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-400">
            Kernel Telemetry
          </span>
        </div>
        <p className="text-sm text-zinc-400 max-w-lg">
          Low-overhead real-time network bandwidth analyzer for Linux nodes and VPN tunnels.
        </p>
      </div>

      {/* Aggregate Telemetry Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] p-3.5 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-3 px-3 border-r border-white/[0.08]">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <ArrowDownRight className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Total Ingress</p>
            <p className="text-lg font-mono font-semibold text-white tabular-nums">
              {globalRx.value} <span className="text-xs text-zinc-500 font-normal">{globalRx.unit}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 border-r border-white/[0.08]">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Total Egress</p>
            <p className="text-lg font-mono font-semibold text-white tabular-nums">
              {globalTx.value} <span className="text-xs text-zinc-500 font-normal">{globalTx.unit}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onTogglePause}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
            isPaused
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              : 'bg-white/[0.04] text-zinc-300 border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
          }`}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
          {isPaused ? 'Resume Stream' : 'Live 1Hz'}
        </button>
      </div>
    </header>
  );
}