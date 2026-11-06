# SysFlow

Modern Next.js real-time network bandwidth monitoring dashboard for Linux edge devices and servers. 

Designed to extract low-level kernel metrics with minimal system overhead, providing precise bandwidth consumption data for VPNs, telemetry, and WebRTC video streams.

## Features

- **Real-Time Metrics:** Live RX/TX throughput monitoring.
- **Hardware-Level Extraction:** Direct integration with Linux network interfaces.
- **Lightweight:** Negligible footprint on edge devices.
- **Modern Stack:** Built with Next.js (App Router), TypeScript, and Tailwind CSS.

## Quick Start

```bash
git clone [https://github.com/hesiodion/sysflow.git](https://github.com/hesiodion/sysflow.git)
cd sysflow
npm install
npm run dev
```

Open http://localhost:3000 with your browser to see the dashboard.

## Environment Requirements

While the web interface can be accessed from any operating system, the host running the Next.js server must be a Linux environment to accurately read kernel network statistics.