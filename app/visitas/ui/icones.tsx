// Ícones do painel (SVG simples, no estilo do lucide), para o módulo não depender de biblioteca de ícones.
import type { ReactNode } from "react";

type P = { className?: string; "aria-hidden"?: boolean };
const Svg = ({ className, children }: P & { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" width="1em" height="1em">
    {children}
  </svg>
);

export const ChevronDown = (p: P) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);
export const ExternalLink = (p: P) => (
  <Svg {...p}>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </Svg>
);
export const Monitor = (p: P) => (
  <Svg {...p}>
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </Svg>
);
export const Smartphone = (p: P) => (
  <Svg {...p}>
    <rect width="14" height="20" x="5" y="2" rx="2" />
    <path d="M12 18h.01" />
  </Svg>
);
export const Tablet = (p: P) => (
  <Svg {...p}>
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <path d="M12 18h.01" />
  </Svg>
);
export const BarChart3 = (p: P) => (
  <Svg {...p}>
    <path d="M3 3v18h18" />
    <path d="M18 17V9M13 17V5M8 17v-3" />
  </Svg>
);
