import { NextResponse } from 'next/server';
import si from 'systeminformation';

export async function GET() {
  try {
    // Pass '*' to query all available interfaces across the OS
    const netStats = await si.networkStats('*');
    
    // Deduplicate interfaces with the same name (common with VPN tunnels / dual-stack adapters)
    const uniqueMap = new Map<string, {
      iface: string;
      operstate: string;
      rx_bytes: number;
      tx_bytes: number;
    }>();

    for (const item of netStats) {
      if (!item.iface) continue;

      const existing = uniqueMap.get(item.iface);
      if (existing) {
        // Merge byte counters if the OS reports multiple sub-adapters under the same name
        existing.rx_bytes += item.rx_bytes || 0;
        existing.tx_bytes += item.tx_bytes || 0;
        if (item.operstate === 'up') {
          existing.operstate = 'up';
        }
      } else {
        uniqueMap.set(item.iface, {
          iface: item.iface,
          operstate: item.operstate || 'unknown',
          rx_bytes: item.rx_bytes || 0,
          tx_bytes: item.tx_bytes || 0,
        });
      }
    }

    const data = Array.from(uniqueMap.values());
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read network statistics' },
      { status: 500 }
    );
  }
}