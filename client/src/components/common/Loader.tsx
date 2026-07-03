import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md', text, className = '' }) => {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-16 h-16' };
  const dotSize = { sm: 'w-1 h-1', md: 'w-2 h-2', lg: 'w-3 h-3' };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <div className={`${dotSize[size]} bg-ancient-gold rounded-full animate-pulse`} />
        <div className={`${dotSize[size]} bg-ancient-gold rounded-full animate-pulse`} style={{ animationDelay: '75ms' }} />
        <div className={`${dotSize[size]} bg-ancient-gold rounded-full animate-pulse`} style={{ animationDelay: '150ms' }} />
      </div>
      {text && <p className="text-xs text-ancient-gold/40 font-cinzel tracking-wider">{text}</p>}
    </div>
  );
};

export default Loader;
