export const Illustration = () => {
  return (
    <svg viewBox="0 0 450 350" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#c026d3', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#2dd4bf', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      <circle cx="100" cy="80" r="20" fill="url(#grad1)" opacity="0.3" />
      <rect x="350" y="50" width="40" height="40" rx="10" fill="url(#grad2)" opacity="0.4" transform="rotate(45 370 70)" />
      <circle cx="400" cy="280" r="15" fill="url(#grad2)" opacity="0.3" />
      <rect x="50" y="250" width="30" height="30" rx="8" fill="url(#grad1)" opacity="0.4" transform="rotate(-30 65 265)" />

      <path d="M50 280 H400 L380 300 H70 Z" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1.5" />
      <path d="M90 300 L110 340" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="3" />
      <path d="M360 300 L340 340" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="3" />
      

      <g>
        <circle cx="140" cy="190" r="30" fill="rgba(255, 255, 255, 0.1)" />
        <path d="M110 220 C110 240, 170 240, 170 220 V280 H110 Z" fill="rgba(255, 255, 255, 0.1)" />

        <path d="M80 280 L100 240 H200 L220 280 Z" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
        <rect x="105" y="245" width="90" height="50" rx="5" fill="url(#grad1)" filter="url(#glow)" opacity="0.8" transform="skewX(-10) rotate(-5 150 270)" />
      </g>
      

      <g>
        <circle cx="310" cy="190" r="30" fill="rgba(255, 255, 255, 0.1)" />
        <path d="M280 220 C280 240, 340 240, 340 220 V280 H280 Z" fill="rgba(255, 255, 255, 0.1)" />
        <path d="M250 280 L270 240 H370 L390 280 Z" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
        <rect x="275" y="245" width="90" height="50" rx="5" fill="url(#grad2)" filter="url(#glow)" opacity="0.8" transform="skewX(-10) rotate(-5 320 270)" />
      </g>

      <rect x="20" y="100" width="100" height="10" rx="5" fill="rgba(255, 255, 255, 0.1)" />
      <rect x="40" y="120" width="60" height="10" rx="5" fill="rgba(255, 255, 255, 0.1)" />
      <rect x="330" y="150" width="80" height="10" rx="5" fill="rgba(255, 255, 255, 0.1)" />
      <rect x="350" y="170" width="40" height="10" rx="5" fill="rgba(255, 255, 255, 0.1)" />
    </svg>
  );
};

