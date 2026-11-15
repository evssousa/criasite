import { Link } from "react-router";
import { LEVEL_LABEL, toolCategory, toolUrl, type Tool } from "~/lib/site";
import type { PostView } from "~/lib/types";
import { Cover, Kicker } from "./ui";

/** Card de matéria com imagem (grades de notícias). */
export function PostCard({ post }: { post: PostView }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-[16px] border border-line bg-card">
      <Link to={post.url} tabIndex={-1} aria-hidden>
        <Cover image={post.image} className="h-40" />
      </Link>
      <div className="flex flex-col gap-2 p-[18px]">
        <Kicker>
          {post.kicker} · {post.ago}
        </Kicker>
        <h3 className="text-[19px] font-extrabold leading-snug">
          <Link to={post.url} className="block hover:text-violet">
            {post.title}
          </Link>
        </h3>
      </div>
    </article>
  );
}

/** Linha de matéria com miniatura (listas). */
export function PostRow({ post, excerpt = false }: { post: PostView; excerpt?: boolean }) {
  return (
    <article className="flex items-center gap-4 border-b border-line py-4">
      <Link to={post.url} tabIndex={-1} aria-hidden className="shrink-0">
        <Cover image={post.image} className="h-[64px] w-[84px] rounded-xl sm:h-[76px] sm:w-[112px]" />
      </Link>
      <div className="flex min-w-0 flex-col gap-1.5">
        <Kicker>
          {post.kicker} · {post.ago}
        </Kicker>
        <h3 className="text-base leading-[1.5] font-bold sm:text-[17px]">
          <Link to={post.url} className="block hover:text-violet">
            {post.title}
          </Link>
        </h3>
        {excerpt && <p className="hidden text-[15px] leading-relaxed text-muted sm:block">{post.excerpt}</p>}
      </div>
    </article>
  );
}

/** Lista "Mais lidas" (lateral). */
export function MostRead({ posts }: { posts: PostView[] }) {
  if (!posts.length) return null;
  return (
    <section aria-labelledby="mais-lidas" className="rounded-[14px] border border-line bg-card p-5">
      <h2 id="mais-lidas" className="text-base font-extrabold">
        Mais lidas
      </h2>
      <ol className="mt-2 flex flex-col">
        {posts.map((p, i) => (
          <li key={p.url} className="flex gap-3 border-b border-line py-3 last:border-0">
            <span className="num text-xl font-bold text-violet">{i + 1}</span>
            <Link to={p.url} className="text-[15px] font-semibold leading-snug hover:text-violet">
              {p.title}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Notícias em lista compacta com miniatura (coluna lateral da home, "leia também"). */
export function NewsList({ posts }: { posts: PostView[] }) {
  return (
    <ul className="flex flex-col">
      {posts.map((p) => (
        <li key={p.url} className="border-t border-day first:border-0">
          <Link to={p.url} className="group grid grid-cols-[60px_1fr] gap-3 py-3">
            <Cover image={p.image} className="h-[60px] rounded-[10px]" />
            <span className="flex min-w-0 flex-col gap-1">
              <span className="text-[12.5px] text-muted">
                <span className="font-bold text-violet">{p.kicker}</span> · {p.ago}
              </span>
              <span className="text-[14.5px] leading-snug font-bold group-hover:text-violet">{p.title}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Card de ferramenta (página /ferramentas e "outras ferramentas"). */
export function ToolCard({ tool }: { tool: Tool }) {
  const cat = toolCategory(tool.category);
  return (
    <Link to={toolUrl(tool.slug)} className="flex min-h-36 flex-col gap-2 rounded-[16px] border border-line bg-card p-5 hover:border-ink">
      <span className="flex items-center gap-2 text-[13px] font-bold text-muted">
        <i aria-hidden className="h-2.5 w-2.5 rounded-[3px]" style={{ background: cat.color }} />
        {cat.label}
      </span>
      <span className="text-lg font-extrabold leading-snug">{tool.short}</span>
      <span className="text-sm leading-relaxed text-muted">{tool.description}</span>
    </Link>
  );
}

/** Card de guia com o nível. */
export function GuideCard({ post }: { post: PostView }) {
  return (
    <Link to={post.url} className="flex min-h-36 flex-col gap-2.5 rounded-[16px] border border-line bg-card p-5 hover:border-ink">
      {post.level && <span className="w-fit rounded-full bg-violet-soft px-2.5 py-1 text-xs font-bold text-violet">Nível {post.level} · {LEVEL_LABEL[post.level]}</span>}
      <span className="text-lg font-extrabold leading-snug">{post.title}</span>
      <span className="mt-auto text-sm text-muted">{post.readMinutes} min de leitura</span>
    </Link>
  );
}

export function Pagination({ page, totalPages, pathname, search }: { page: number; totalPages: number; pathname: string; search: string }) {
  if (totalPages <= 1) return null;
  const href = (n: number) => {
    const params = new URLSearchParams(search);
    if (n === 1) params.delete("pagina");
    else params.set("pagina", String(n));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };
  const cls = "inline-flex min-h-11 items-center rounded-xl border border-line-2 bg-card px-4 text-sm font-bold hover:border-violet hover:text-violet";
  return (
    <nav aria-label="Paginação" className="flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link to={href(page - 1)} className={cls} rel="prev">
          Anteriores
        </Link>
      ) : (
        <span />
      )}
      <span className="num text-sm text-muted">
        {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link to={href(page + 1)} className={cls} rel="next">
          Próximas
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
