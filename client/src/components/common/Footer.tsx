import React from 'react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`border-t border-ancient-gold/10 bg-void-black/80 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <h3 className="font-cinzel text-xl text-ancient-gold mb-3">PRIMORDEX</h3>
            <p className="text-ghost-white/40 text-sm leading-relaxed max-w-md">
              The Sovereign AI Operating System. Built different. Born from Jos, designed for the world.
            </p>
            <p className="text-ghost-white/20 text-xs mt-4">
              &copy; {new Date().getFullYear()} Jadai Studios. All rights reserved.
            </p>
          </div>

          <div>
            <h4 className="text-ancient-gold/60 text-xs font-cinzel tracking-wider mb-4">CHAMBERS</h4>
            <ul className="space-y-2 text-sm text-ghost-white/30">
              <li><a href="/dashboard" className="hover:text-ancient-gold transition-colors">The Forge</a></li>
              <li><a href="/showcase" className="hover:text-ancient-gold transition-colors">Showcase</a></li>
              <li><a href="/transmissions" className="hover:text-ancient-gold transition-colors">Transmissions</a></li>
              <li><a href="/table" className="hover:text-ancient-gold transition-colors">The Table</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-ancient-gold/60 text-xs font-cinzel tracking-wider mb-4">CONNECT</h4>
            <ul className="space-y-2 text-sm text-ghost-white/30">
              <li><a href="https://github.com/Jadai123" target="_blank" rel="noopener noreferrer" className="hover:text-ancient-gold transition-colors">GitHub</a></li>
              <li><a href="/sanctum" className="hover:text-ancient-gold transition-colors">Inner Sanctum</a></li>
              <li><span className="text-ghost-white/20">contact@jadai.dev</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-ancient-gold/5 flex items-center justify-between text-[10px] text-ghost-white/15">
          <span>BUILD DIFFERENT</span>
          <span>Synthesis Forge Core v1.0</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
