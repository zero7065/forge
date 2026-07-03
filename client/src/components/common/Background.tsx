import React from 'react';
import { motion } from 'framer-motion';
import { SacredGeometry } from './SacredGeometry';

export const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Base void gradient */}
      <div className="absolute inset-0 bg-gradient-void" />
      
      {/* Ember glow orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-ember-500/5 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ancient-gold/3 rounded-full blur-3xl"
        animate={{ 
          opacity: [0.05, 0.1, 0.05]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Sacred geometry ambient */}
      <div className="absolute inset-0 opacity-5">
        <SacredGeometry size={400} className="absolute top-10 right-10 animate-rotate-geometry-slow" />
        <SacredGeometry size={300} className="absolute bottom-20 left-20 animate-rotate-geometry" />
        <SacredGeometry size={200} className="absolute top-1/2 left-10 animate-rotate-geometry-slow" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Cpath d=%27M100 0L0 0 0 100%27 stroke=%27%23C9A84C%27 stroke-width=%270.2%27 fill=%27none%27/%3E%3C/svg%3E')] opacity-10" />
      
      {/* Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%2C_rgba(201,168,76,0.01)_50%)] bg-[size:100%_4px] animate-[scroll_20s_linear_infinite]" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }} />
    </div>
  );
};