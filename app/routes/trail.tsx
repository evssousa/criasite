import { Link } from "react-router";
import type { Route } from "./+types/trail";
import { cx } from "~/components/ui";
import { useAvailability } from "~/lib/availability";
import { useTrail } from "~/lib/prefs";
import { seo } from "~/lib/seo";
import { TRAIL, toolBySlug, toolUrl } from "~/lib/site";

export function meta(_: Route.MetaArgs) {
  return seo({
    title: "Trilha do site no ar: do domínio ao primeiro visitante",
    description: "As 7 etapas para colocar um site no ar: domínio, hospedagem, visual, páginas, Google, velocidade e lançamento. Com checklist e ferramentas grátis.",
    path: "/trilha",
  });
}

export default function Trail() {
  const { done, toggle, isDone } = useTrail();
  const available = useAvailability();
  const pct = Math.round((done.length / TRAIL.length) * 100);
  return (
    <main id="conteudo" className="mx-auto flex max-w-[1180px] flex-col gap-8 px-4 pt-8 sm:px-6">
      <header className="flex max-w-3xl flex-col gap-3">
        <h1 className="text-[36px] leading-[1.05] font-extrabold tracking-[-0.03em] text-balance sm:text-[48px]">Do domínio ao primeiro visitante, em sete etapas</h1>
        <p className="text-lg leading-relaxed text-muted">
          Siga na ordem ou comece de onde você está. Marque cada etapa quando terminar: o progresso fica salvo neste navegador e aparece no topo da página inicial.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <ol className="flex flex-col">
          {TRAIL.map((s, i) => {
            const on = isDone(s.id);
            const tools = s.tools.filter((t) => available.tools.includes(t)).map((t) => toolBySlug(t)!);
            return (
              <li key={s.id} id={s.id} className="relative grid grid-cols-[52px_1fr] gap-4 pb-9 last:pb-0">
                {i < TRAIL.length - 1 && <span aria-hidden className="absolute top-14 bottom-2 left-[25px] w-0.5 bg-line-2" />}
                <span
                  aria-hidden
                  className={cx("grid h-[52px] w-[52px] place-items-center rounded-full text-xl font-extrabold", on ? "bg-brand text-white" : "bg-card text-ink ring-2 ring-line-2")}
                >
                  {on ? "✓" : i + 1}
                </span>
                <div className="flex min-w-0 flex-col gap-2.5 pt-2">
                  <h2 className="text-[22px] leading-tight font-extrabold tracking-[-0.02em]">{s.title}</h2>
                  <p className="max-w-[62ch] text-[16px] leading-relaxed text-[#26325f]">{s.text}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {s.guide && available.sections.includes("guias") && (
                      <Link
                        to={`/guias/${s.guide}`}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-2 border-ink bg-card px-4 text-sm font-bold text-ink hover:bg-ink hover:text-white"
                      >
                        Ler o guia <span aria-hidden>→</span>
                      </Link>
                    )}
                    {tools.map((t) => (
                      <Link key={t.slug} to={toolUrl(t.slug)} className="inline-flex min-h-10 items-center rounded-full bg-ink px-4 text-sm font-bold text-white hover:bg-night-2">
                        {t.short}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={() => toggle(s.id)}
                      aria-pressed={on}
                      className={cx(
                        "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-bold",
                        on ? "border-brand bg-violet-soft text-violet" : "border-line-2 bg-card hover:border-ink",
                      )}
                    >
                      {on ? "Feita" : "Marcar como feita"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <aside className="night flex flex-col gap-3 self-start rounded-[18px] bg-night p-5 text-moon lg:sticky lg:top-6">
          <h2 className="text-lg font-extrabold">Seu progresso</h2>
          <p className="text-sm text-moon-muted">
            {done.length} de {TRAIL.length} etapas feitas
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-night-3" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso da trilha">
            <div className="h-full bg-brand transition-[width]" style={{ width: `${pct}%` }} />
          </div>
          <ul className="mt-1 flex flex-col">
            {TRAIL.map((s, i) => (
              <li key={s.id} className="border-t border-night-line">
                <a href={`#${s.id}`} className={cx("flex gap-2 py-2 text-sm", isDone(s.id) ? "text-moon" : "text-moon-muted hover:text-moon")}>
                  <span aria-hidden className="w-4 text-glow">
                    {isDone(s.id) ? "✓" : ""}
                  </span>
                  {i + 1}. {s.short}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {available.sections.includes("guias") && (
        <div className="flex flex-col gap-3 rounded-[14px] border border-line bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[62ch] text-[16px] leading-relaxed">
            <strong>Vai usar IA para montar o site?</strong> As 7 etapas continuam valendo. O roteiro mostra como pedir, revisar e publicar sem perder o controle.
          </p>
          <Link
            to="/criar-site-com-ia"
            className="inline-flex min-h-10 w-fit shrink-0 items-center gap-1.5 rounded-full border-2 border-ink bg-card px-4 text-sm font-bold text-ink hover:bg-ink hover:text-white"
          >
            Ver o roteiro <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </main>
  );
}
