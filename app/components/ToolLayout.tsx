import type { ReactNode } from "react";
import { Link } from "react-router";
import { toolsFor, useAvailability } from "~/lib/availability";
import { toolCategory, type Tool } from "~/lib/site";
import { ToolCard } from "./cards";
import { FavoriteButton } from "./directory";
import { cx } from "./ui";

/**
 * Moldura comum das ferramentas: caminho, título, painel interativo, texto explicativo e outras ferramentas.
 * O texto explicativo (explain) é obrigatório na prática: página de ferramenta sem texto é "conteúdo
 * fino" para o Google e para o AdSense.
 */
export function ToolLayout({ tool, lead, children, explain }: { tool: Tool; lead: string; children: ReactNode; explain?: ReactNode }) {
  const others = toolsFor(useAvailability()).filter((t) => t.slug !== tool.slug);
  const cat = toolCategory(tool.category);
  return (
    <main id="conteudo" className="mx-auto flex max-w-[1180px] flex-col gap-8 px-4 pt-6 sm:px-6">
      <nav aria-label="Você está em" className="text-sm font-semibold text-muted">
        <Link to="/ferramentas" className="-my-3 inline-block py-3 hover:text-violet">
          Ferramentas
        </Link>
        <span aria-hidden> / </span>
        {cat.label}
      </nav>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex max-w-3xl flex-col gap-3">
          <h1 className="text-[34px] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance sm:text-[44px]">{tool.title}</h1>
          <p className="text-lg leading-relaxed text-muted">{lead}</p>
        </div>
        <FavoriteButton tool={tool} />
      </header>

      {children}

      {explain && <div className="article-body max-w-3xl">{explain}</div>}

      {others.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em]">Outras ferramentas</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-3">
            {others.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

/** Painel marinho onde a ferramenta funciona. */
export function ToolPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cx("night flex flex-col gap-5 rounded-[20px] bg-night p-5 text-moon sm:p-7", className)}>{children}</section>;
}

/** Campo de formulário no painel escuro. */
export function Field({ label, htmlFor, children, hint }: { label: string; htmlFor: string; children: ReactNode; hint?: string }) {
  return (
    <div className="flex min-w-0 flex-1 basis-48 flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-moon-muted">
        {label}
      </label>
      {children}
      {hint && <span className="text-xs text-moon-muted">{hint}</span>}
    </div>
  );
}

export const inputCls =
  "h-[52px] w-full rounded-xl border border-night-line-2 bg-night-2 px-3.5 text-[17px] text-moon outline-none placeholder:text-moon-muted/70 focus:border-glow";

/** Resultado em destaque (bloco laranja). */
export function Result({ label, value, note, tone = "lime" }: { label: string; value: string; note?: ReactNode; tone?: "lime" | "violet" }) {
  return (
    <div aria-live="polite" className={cx("flex flex-col gap-1 rounded-2xl p-5", tone === "lime" ? "bg-lime text-night" : "bg-violet text-white")}>
      <span className="text-sm font-bold">{label}</span>
      <span className="num text-3xl font-bold break-all sm:text-4xl">{value}</span>
      {note && <span className="text-xs font-semibold">{note}</span>}
    </div>
  );
}

/** Aviso de privacidade das ferramentas. */
export function ToolDisclaimer({ children }: { children?: ReactNode }) {
  return <p className="text-xs leading-relaxed text-moon-muted">{children ?? "Roda no seu navegador: nada do que você digita ou envia aqui sai do seu computador."}</p>;
}

/** Botão principal dentro do painel. */
export const btnCls = "inline-flex min-h-12 items-center justify-center rounded-xl bg-brand px-5 font-bold text-white hover:bg-[#ec6a0c] disabled:opacity-50";
/** Botão secundário dentro do painel. */
export const btnGhostCls = "inline-flex min-h-12 items-center justify-center rounded-xl border border-night-line-2 px-5 font-bold text-moon hover:border-glow";

/** Copia texto para a área de transferência (com plano B: selecionar o texto). */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
