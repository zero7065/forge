import React from 'react';
import { motion } from 'framer-motion';

interface SacredGeometryProps {
  animate?: boolean;
  size?: number;
  className?: string;
}

export const SacredGeometry: React.FC<SacredGeometryProps> = ({ 
  animate = false, 
  size = 200, 
  className = '' 
}) => {
  const seedOfLife = (size: number) => {
    const circles = [];
    const radius = size / 6;
    const center = size / 2;
    
    // Center circle
    circles.push(<circle key="center" cx={center} cy={center} r={radius} />);
    
    // 6 surrounding circles
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      circles.push(<circle key={i} cx={x} cy={y} r={radius} />);
    }
    
    return circles;
  };

  const flowerOfLife = (size: number) => {
    const paths = [];
    const radius = size / 4;
    const center = size / 2;
    
    for (let ring = 1; ring <= 2; ring++) {
      const count = ring === 1 ? 6 : 12;
      const r = radius * ring;
      for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI) / count;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        paths.push(<circle key={`${ring}-${i}`} cx={x} cy={y} r={radius * 0.6} />);
      }
    }
    
    return paths;
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`text-ancient-gold/20 ${className}`}
      animate={animate ? { rotate: 360 } : {}}
      transition={animate ? { duration: 120, ease: 'linear', repeat: Infinity } : {}}
      style={{ willChange: animate ? 'transform' : 'auto' }}
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <g filter="url(#glow)" strokeWidth="1" fill="none">
        {seedOfLife(size)}
        {flowerOfLife(size)}
        
        {/* Outer circle */}
        <motion.circle 
          cx={size/2} 
          cy={size/2} 
          r={size/2 - 2} 
          strokeWidth="1.5"
          strokeDasharray="8,4"
          animate={animate ? { strokeDashoffset: [0, 100] } : {}}
          transition={animate ? { duration: 8, repeat: Infinity } : {}}
        />
      </g>
    </motion.svg>
  );
};