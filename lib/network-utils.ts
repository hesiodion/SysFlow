import { Cpu, Globe, Layers, ShieldCheck, Wifi, LucideIcon } from 'lucide-react';
import { FormattedRate } from '@/types/network';

export const HISTORY_LENGTH = 30; // 30 seconds of rolling telemetry

/**
 * Formats raw bytes per second into a human-readable value and unit pair.
 */
export function formatRate(bytesPerSec: number): FormattedRate {
  if (bytesPerSec <= 0) return { value: '0.00', unit: 'B/s' };
  const k = 1024;
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bytesPerSec) / Math.log(k));
  return {
    value: (bytesPerSec / Math.pow(k, i)).toFixed(2),
    unit: units[i],
  };
}

/**
 * Formats cumulative raw bytes into a human-readable string (B, KB, MB, GB, TB).
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
}

export interface InterfaceMeta {
  icon: LucideIcon;
  label: string;
  accent: string;
  bg: string;
  border: string;
}

/**
 * Infers hardware/virtual interface category and visual styling from its kernel name.
 */
export function getInterfaceMeta(iface: string): InterfaceMeta {
  const lower = iface.toLowerCase();
  
  if (lower.includes('tailscale') || lower.includes('tun') || lower.includes('wg')) {
    return {
      icon: ShieldCheck,
      label: 'VPN Tunnel',
      accent: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
    };
  }
  if (lower.includes('wl') || lower.includes('wifi') || lower.includes('wi-fi')) {
    return {
      icon: Wifi,
      label: 'Wireless',
      accent: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
    };
  }
  if (lower.includes('docker') || lower.includes('br-') || lower.includes('veth')) {
    return {
      icon: Layers,
      label: 'Virtual Bridge',
      accent: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    };
  }
  if (lower === 'lo' || lower.includes('loopback')) {
    return {
      icon: Cpu,
      label: 'Loopback',
      accent: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    };
  }
  
  return {
    icon: Globe,
    label: 'Physical NIC',
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  };
}