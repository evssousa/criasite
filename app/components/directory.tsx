// Peças da home do layout "Busca + Central": diretório de ferramentas com estrela de favoritar,
// "Suas ferramentas" e a faixa da trilha. O estado fica no navegador (app/lib/prefs.ts).
import { Link } from "react-router";
import { normalize } from "~/lib/format";
import { useFavorites, useTrail } from "~/lib/prefs";
import { TOOL_CATEGORIES, TRAIL, toolUrl, type Tool } from "~/lib/site";
import { cx } from "./ui";

/** Ferramentas que combinam com a busca (nome, descrição, categoria e sinônimos; sem acento). */
export function filterTools(tools: Tool[], query: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return tools;
  return tools.filter((t) => {
    const cat = TOOL_CATEGORIES.find((c) => c.id === t.category)?.label ?? "";
    const text = normalize(`${t.short} ${t.title} ${t.hint} ${t.description} ${cat} ${t.keywords}`);
    return terms.every((w) => text.includes(w));
  });
}

function Star({ tool }: { tool: Tool }) {
  const { isFav, toggle } = useFavorites();
  const on = isFav(tool.slug);
  return (
    <button
      type="button"
      onClick={() => toggle(tool.slug)}
      aria-pressed={on}
      aria-label={`${on ? "Desafixar" : "Fixar"} ${tool.short} em Suas ferramentas`}
      title={on ? "Tirar de Suas ferramentas" : "Fixar em Suas ferramentas"}
      className={cx("grid w-11 shrink-0 place-items-center text-lg", on ? "text-brand" : "text-[#b4bddf] hover:text-brand")}
    >
      {on ? "★" : "☆"}
    </button>
  );
}

/** Diretório por categoria, filtrado pela busca. */
export function ToolDirectory({ tools, query }: { tools: Tool[]; query: string }) {
  const found = filterTools(tools, query);
  if (!found.length) {
    return (
      <p className="rounded-xl border border-dashed border-[#9aa6d6] bg-card p-4 text-[15px] text-muted">
        Nenhuma ferramenta com “{query}”. Tente outra palavra, como imagem ou Google, ou{" "}
        <Link to={`/busca?q=${encodeURIComponent(query)}`} className="font-bold text-violet underline underline-offset-4">
          procure nas notícias e guias
        </Link>
        .
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
      {TOOL_CATEGORIES.map((c) => {
        const items = found.filter((t) => t.category === c.id);
        if (!items.length) return null;
        return (
          <section key={c.id} aria-labelledby={`cat-${c.id}`}>
            <h3 id={`cat-${c.id}`} className="mb-2.5 flex items-center gap-2 text-[15px] font-extrabold">
              <i aria-hidden className="h-2.5 w-2.5 rounded-[3px]" style={{ background: c.color }} />
              {c.label}
            </h3>
            <ul className="flex flex-col gap-1">
              {items.map((t) => (
                <li key={t.slug} className="flex rounded-lg border border-line bg-card hover:border-ink">
                  <Link to={toolUrl(t.slug)} className="min-w-0 flex-1 px-3 py-2">
                    <span className="block font-semibold">{t.short}</span>
                    <span className="block text-[12.5px] text-muted">{t.hint}</span>
                  </Link>
                  <Star tool={t} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/** "Suas ferramentas": as favoritas em blocos marinho. */
export function FavoriteTools({ tools }: { tools: Tool[] }) {
  const { favs } = useFavorites();
  const list = favs.map((s) => tools.find((t) => t.slug === s)).filter((t): t is Tool => Boolean(t));
  if (!list.length) {
    return (
      <p className="rounded-xl border border-dashed border-[#9aa6d6] bg-card p-4 text-[15px] text-muted">
        Toque na estrela ao lado de uma ferramenta para ela aparecer aqui sempre que você voltar.
      </p>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      {list.map((t) => (
        <li key={t.slug}>
          <Link to={toolUrl(t.slug)} className="flex h-full flex-col gap-1 rounded-xl bg-night p-3.5 text-moon hover:bg-night-2">
            <span className="font-bold">{t.short}</span>
            <span className="text-[12.5px] text-moon-muted">{t.hint}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Faixa da trilha (fim do topo da home): 7 barrinhas que a pessoa marca. */
export function TrailStrip() {
  const { done, toggle, isDone } = useTrail();
  return (
    <div className="border-t border-night-line pt-3.5 pb-5">
      <div className="mb-2.5 flex flex-wrap justify-between gap-2 text-[13px] text-moon-muted">
        <span>
          Sua trilha até o site no ar:{" "}
          <b className="text-moon">
            {done.length} de {TRAIL.length}
          </b>
        </span>
        <Link to="/trilha" className="font-semibold text-glow hover:text-moon">
          Ver a trilha completa
        </Link>
      </div>
      <ol className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
        {TRAIL.map((s, i) => {
          const on = isDone(s.id);
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => toggle(s.id)}
                aria-pressed={on}
                className={cx("grid w-full gap-1.5 text-left text-[12.5px]", on ? "text-moon" : "text-moon-muted hover:text-moon")}
              >
                <i aria-hidden className={cx("block h-1.5 rounded-full", on ? "bg-brand" : "bg-[#24336f]")} />
                <span>
                  {i + 1}. {s.short}
                  <span className="sr-only">{on ? " (feita)" : " (a fazer)"}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Botão grande de favoritar (cabeçalho da página da ferramenta). */
export function FavoriteButton({ tool }: { tool: Tool }) {
  const { isFav, toggle } = useFavorites();
  const on = isFav(tool.slug);
  return (
    <button
      type="button"
      onClick={() => toggle(tool.slug)}
      aria-pressed={on}
      className={cx(
        "inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-bold",
        on ? "border-brand bg-violet-soft text-violet" : "border-line-2 bg-card text-ink hover:border-ink",
      )}
    >
      <span aria-hidden className={on ? "text-brand" : "text-[#9aa6d6]"}>
        {on ? "★" : "☆"}
      </span>
      {on ? "Fixada na home" : "Fixar na home"}
    </button>
  );
}
