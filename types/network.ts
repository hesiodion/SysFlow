export interface NetworkMetrics {
  iface: string;
  operstate: string;
  rx_bytes: number;
  tx_bytes: number;
}

export interface IfaceHistoryPoint {
  timestamp: number;
  rxSpeed: number;
  txSpeed: number;
}

export interface IfaceTelemetry {
  currentRx: number;
  currentTx: number;
  peakRx: number;
  peakTx: number;
  totalRx: number;
  totalTx: number;
  history: IfaceHistoryPoint[];
}

export interface FormattedRate {
  value: string;
  unit: string;
}