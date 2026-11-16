// Code-drawn trait crests. Each trait gets one simple, distinct mark so a unit
// reads at a glance even at shop size. Drawn on a 24x24 grid.
const PATHS: Record<string, React.ReactNode> = {
  Ironclad: <path d="M12 3 19 6v5.5c0 4.3-3 7.6-7 9.5-4-1.9-7-5.2-7-9.5V6z" />,
  Tidecaller: (
    <path d="M3 14c2.2-2.4 4.4-2.4 6.6 0s4.4 2.4 6.6 0 3.6-2 4.8-.8M3 9c2.2-2.4 4.4-2.4 6.6 0s4.4 2.4 6.6 0 3.6-2 4.8-.8" fill="none" strokeWidth="2.2" strokeLinecap="round" />
  ),
  Duelist: <path d="m5 4 14 14M19 4 5 18M4 15l5 5M20 15l-5 5" fill="none" strokeWidth="2.2" strokeLinecap="round" />,
  Sparkwright: <path d="M13.5 2 5 13.5h6L9.5 22 19 9.5h-6z" />,
  Warden: <path d="M12 2 21 12 12 22 3 12zM12 7.5 7.5 12l4.5 4.5 4.5-4.5z" fillRule="evenodd" />,
  Sharpshot: (
    <g fill="none" strokeWidth="2.1" strokeLinecap="round">
      <circle cx="12" cy="12" r="6.5" />
      <path d="M12 2v5M12 17v5M2 12h5M17 12h5" />
    </g>
  ),
  Ashen: <path d="M12 2c1 4 6 6.5 6 12a6 6 0 0 1-12 0c0-2.6 1.4-4.4 2.8-5.6.2 2 1 3.2 2.2 3.6C10.6 8.6 11.2 5 12 2z" />,
  Runebound: <path d="M12 2.5 21.5 19h-19zM12 9l-3.6 6.5h7.2z" fillRule="evenodd" />,
  Bastion: <path d="M4 21V8h3v3h2.5V8h5v3H17V8h3v13zM10 21v-4.5a2 2 0 0 1 4 0V21z" fillRule="evenodd" />,
};

export function TraitGlyph({ trait, size = 16, color = "currentColor" }: { trait: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill={color} stroke={color}>
      {PATHS[trait] ?? <circle cx="12" cy="12" r="6" />}
    </svg>
  );
}
