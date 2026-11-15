// Peças visuais pequenas e reutilizáveis do tema "Busca + Central".
import type { ReactNode } from "react";
import { Link } from "react-router";
import type { SectionSlug } from "~/lib/site";

export const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");

/** Marca: o símbolo (janela de navegador com o cursor) + "criasite" com "site" em laranja. O mesmo desenho do favicon. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-2 text-[22px] font-extrabold leading-none tracking-[-0.03em] text-moon", className)}>
      <LogoMark />
      <span>
        cria<span className="text-brand">site</span>
      </span>
    </span>
  );
}

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 64 64" className="shrink-0">
      <rect width="64" height="64" rx="16" fill="#ff7a1a" />
      <rect x="12" y="16" width="40" height="32" rx="6" fill="none" stroke="#fff" strokeWidth="5" />
      <path d="M12 26h40" stroke="#fff" strokeWidth="5" />
      <path d="M26 33l-5 5 5 5M38 33l5 5-5 5" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Cabeçalho de seção: título + ação "ver todos". */
export function SectionTitle({
  children,
  as: Tag = "h2",
  action,
  size = "lg",
  mode = "day",
}: {
  children: ReactNode;
  as?: "h1" | "h2";
  action?: { to: string; label: string };
  size?: "lg" | "xl";
  mode?: "day" | "night";
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
      <Tag className={cx("font-extrabold tracking-[-0.02em]", size === "xl" ? "text-4xl sm:text-5xl" : "text-[28px] sm:text-[30px]")}>{children}</Tag>
      {action && (
        <Link
          to={action.to}
          className={cx("-my-3 inline-block py-3 text-sm font-bold", mode === "night" ? "text-glow hover:text-moon" : "text-violet hover:text-violet-deep")}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

/** Rótulo pequeno (editoria, horário). */
export function Kicker({ children, className, mode = "day" }: { children: ReactNode; className?: string; mode?: "day" | "night" }) {
  return <span className={cx("text-[13px] font-bold leading-none", mode === "night" ? "text-glow" : "text-violet", className)}>{children}</span>;
}

/** Ícone e cor da capa padrão de cada editoria (ver docs/capas.md). Decorativo: aria-hidden. */
const COVER_ART: Record<SectionSlug, { color: string; icon: ReactNode }> = {
  noticias: {
    color: "#ff7a1a",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="M3 9h18M8 13l-2 2 2 2M16 13l2 2-2 2" />
      </>
    ),
  },
  google: {
    color: "#7c5cff",
    icon: (
      <>
        <circle cx="10.5" cy="10.5" r="6" />
        <path d="M15 15l5 5" />
      </>
    ),
  },
  plataformas: {
    color: "#2a8bd8",
    icon: (
      <>
        <path d="M12 3l9 5-9 5-9-5z" />
        <path d="M3 12.5l9 5 9-5M3 17l9 5 9-5" />
      </>
    ),
  },
  ia: { color: "#16b37a", icon: <path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z" /> },
  seguranca: {
    color: "#e8467c",
    icon: (
      <>
        <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  guias: { color: "#ff9a4d", icon: <path d="M5 21V4M5 4h11l-2 4 2 4H5" /> },
};

/**
 * Capa: imagem real quando existir; senão, a capa padrão da editoria (marinho pontilhado, círculo de cor e ícone),
 * sem nenhum byte de imagem. O tamanho vem sempre do contêiner (className), então a página não "pula" quando a imagem chega.
 */
export function Cover({
  image,
  section,
  className,
  mode = "day",
  eager,
  zoom,
}: {
  image?: { src: string; alt: string };
  /** Editoria do post: escolhe cor e ícone da capa padrão quando não há imagem. */
  section?: SectionSlug;
  className?: string;
  mode?: "day" | "night";
  eager?: boolean;
  /** Leve zoom da imagem ao passar o mouse (o card precisa da classe "group"). */
  zoom?: boolean;
}) {
  if (image) {
    return (
      <div className={cx("relative overflow-hidden bg-night-2", className)}>
        <img
          src={image.src}
          alt={image.alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className={cx("absolute inset-0 h-full w-full object-cover", zoom && "transition-transform duration-300 group-hover:scale-[1.03]")}
        />
      </div>
    );
  }
  if (section) {
    const art = COVER_ART[section];
    return (
      <div aria-hidden className={cx("cover-fb relative grid place-items-center overflow-hidden", className)}>
        <span className="absolute top-[10%] right-[8%] aspect-square h-[34%] rounded-full opacity-80" style={{ background: art.color }} />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {art.icon}
        </svg>
      </div>
    );
  }
  return <div aria-hidden className={cx("relative overflow-hidden", mode === "night" ? "art-night" : "cover-fb", className)} />;
}

/** Chip de filtro (editorias). */
export function Chip({ to, active, children }: { to: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={cx(
        "inline-flex min-h-11 items-center rounded-full px-4 text-sm",
        active ? "bg-ink font-bold text-white" : "border border-line-2 bg-card text-ink hover:border-violet hover:text-violet",
      )}
    >
      {children}
    </Link>
  );
}
