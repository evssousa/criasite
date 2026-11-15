// Peças visuais pequenas e reutilizáveis do tema "Busca + Central".
import type { ReactNode } from "react";
import { Link } from "react-router";

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

/** Capa: imagem real quando existir; senão, listras no marinho (placeholder). */
export function Cover({
  image,
  className,
  mode = "day",
  eager,
}: {
  image?: { src: string; alt: string };
  className?: string;
  mode?: "day" | "night";
  eager?: boolean;
}) {
  return (
    <div className={cx("relative overflow-hidden", !image && (mode === "night" ? "art-night" : "art"), className)}>
      {image ? (
        <img src={image.src} alt={image.alt} loading={eager ? "eager" : "lazy"} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
    </div>
  );
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
