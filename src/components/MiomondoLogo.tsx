export const MiomondoLogo = ({ size = "w-10 h-10" }: { size?: string }) => {
  return (
    <div className={`${size} relative`}>
      {/* Mondo stilizzato SVG */}
      <svg 
        viewBox="0 0 40 40" 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="globeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="50%" stopColor="hsl(var(--accent))" />
            <stop offset="100%" stopColor="hsl(var(--nature))" />
          </linearGradient>
          <linearGradient id="continentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--accent-glow))" />
            <stop offset="100%" stopColor="hsl(var(--nature))" />
          </linearGradient>
        </defs>
        
        {/* Globo base */}
        <circle 
          cx="20" 
          cy="20" 
          r="18" 
          fill="url(#globeGradient)" 
          className="drop-shadow-lg"
        />
        
        {/* Continenti stilizzati */}
        {/* Europa/Africa */}
        <path 
          d="M 15 8 Q 22 6 28 12 Q 30 16 28 22 Q 25 28 20 30 Q 15 28 12 22 Q 10 16 15 8" 
          fill="url(#continentGradient)" 
          fillOpacity="0.8"
        />
        
        {/* Americhe */}
        <path 
          d="M 8 12 Q 12 10 14 16 Q 12 24 8 28 Q 6 24 8 20 Q 6 16 8 12" 
          fill="url(#continentGradient)" 
          fillOpacity="0.7"
        />
        
        {/* Asia */}
        <path 
          d="M 28 10 Q 34 8 36 14 Q 35 20 32 24 Q 30 20 32 16 Q 30 12 28 10" 
          fill="url(#continentGradient)" 
          fillOpacity="0.6"
        />
        
        {/* Paralleli stilizzati */}
        <path 
          d="M 5 20 Q 20 18 35 20" 
          stroke="rgba(255,255,255,0.3)" 
          strokeWidth="0.5" 
          fill="none"
        />
        <path 
          d="M 8 14 Q 20 12 32 14" 
          stroke="rgba(255,255,255,0.2)" 
          strokeWidth="0.3" 
          fill="none"
        />
        <path 
          d="M 8 26 Q 20 28 32 26" 
          stroke="rgba(255,255,255,0.2)" 
          strokeWidth="0.3" 
          fill="none"
        />
        
        {/* Meridiani */}
        <path 
          d="M 20 2 Q 15 10 20 20 Q 25 30 20 38" 
          stroke="rgba(255,255,255,0.2)" 
          strokeWidth="0.3" 
          fill="none"
        />
        
        {/* Highlight */}
        <circle 
          cx="16" 
          cy="12" 
          r="3" 
          fill="rgba(255,255,255,0.3)" 
          className="animate-pulse"
        />
      </svg>
    </div>
  );
};