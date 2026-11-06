import { NextResponse } from 'next/server';
import si from 'systeminformation';

export async function GET() {
  try {
    // Calling networkStats() without arguments reads all active interfaces
    const netStats = await si.networkStats();
    
    // Filter the payload to return only essential data and reduce overhead
    const data = netStats.map(iface => ({
      iface: iface.iface,             // Interface name (e.g., tailscale0, tun0, eth0)
      operstate: iface.operstate,     // Connection state (up/down)
      rx_bytes: iface.rx_bytes,       // Total bytes received
      tx_bytes: iface.tx_bytes,       // Total bytes transmitted
    }));

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read network statistics' },
      { status: 500 }
    );
  }
}