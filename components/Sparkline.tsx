import { useMemo } from 'react';
import { HISTORY_LENGTH } from '@/lib/network-utils';

interface SparklineProps {
  data: number[];
  color: string;
  gradientId: string;
}

export function Sparkline({ data, color, gradientId }: SparklineProps) {
  const width = 280;
  const height = 56;
  const max = Math.max(...data, 1024); // Minimum 1 KB/s scale to avoid flatline noise

  const points = data.map((val, i) => {
    const x = (i / (HISTORY_LENGTH - 1)) * width;
    const y = height - (val / max) * (height - 12) - 4;
    return [x, y] as [number, number];
  });

  const pathData = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, point, i, a) => {
      if (i === 0) return `M ${point[0]},${point[1]}`;
      const [cpsX, cpsY] = a[i - 1];
      const [cpeX, cpeY] = point;
      const midX = (cpsX + cpeX) / 2;
      return `${acc} C ${midX},${cpsY} ${midX},${cpeY} ${cpeX},${cpeY}`;
    }, '');
  }, [points]);

  const areaData = `${pathData} L ${width},${height} L 0,${height} Z`;

  return (
    <svg className="w-full h-14 overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaData} fill={`url(#${gradientId})`} className="transition-all duration-300 ease-out" />
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        className="transition-all duration-300 ease-out"
        style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
      />
    </svg>
  );
}