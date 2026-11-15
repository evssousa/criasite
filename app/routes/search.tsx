import { Form, Link } from "react-router";
import type { Route } from "./+types/search";
import { PostRow, ToolCard } from "~/components/cards";
import { filterTools } from "~/components/directory";
import { SectionTitle } from "~/components/ui";
import { toolsFor, useAvailability } from "~/lib/availability";
import { searchPosts } from "~/lib/content.server";
import { seo } from "~/lib/seo";

export async function loader({ request }: Route.LoaderArgs) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 100);
  return { q, posts: q ? await searchPosts(q) : [] };
}

export function meta({ loaderData }: Route.MetaArgs) {
  return seo({ title: loaderData?.q ? `Busca: ${loaderData.q}` : "Buscar", path: "/busca", noindex: true });
}

export default function SearchPage({ loaderData }: Route.ComponentProps) {
  const { q, posts } = loaderData;
  const tools = q ? filterTools(toolsFor(useAvailability()), q) : [];
  const total = posts.length + tools.length;
  return (
    <main id="conteudo" className="mx-auto flex max-w-[1180px] flex-col gap-10 px-4 pt-10 sm:px-6">
      <div className="flex flex-col gap-5">
        <SectionTitle as="h1" size="xl">
          Buscar
        </SectionTitle>
        <Form method="get" role="search" className="flex max-w-3xl gap-2">
          <label htmlFor="busca-pagina" className="sr-only">
            O que você procura?
          </label>
          <input
            id="busca-pagina"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Ferramenta, notícia, guia…"
            className="h-14 min-w-0 flex-1 rounded-2xl border border-line-2 bg-card px-5 text-lg outline-none placeholder:text-muted focus:border-ink"
          />
          <button type="submit" className="h-14 rounded-2xl bg-brand px-6 font-bold text-white hover:bg-[#ec6a0c]">
            Buscar
          </button>
        </Form>
        {q && (
          <p className="text-sm text-muted" aria-live="polite">
            {total === 0 ? `Nenhum resultado para “${q}”.` : `${total} resultado${total > 1 ? "s" : ""} para “${q}”.`}
          </p>
        )}
      </div>

      {tools.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-extrabold">Ferramentas</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-3">
            {tools.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="flex flex-col">
          <h2 className="text-lg font-extrabold">Notícias e guias</h2>
          {posts.map((p) => (
            <PostRow key={p.url} post={p} excerpt />
          ))}
        </section>
      )}

      {q && total === 0 && (
        <p className="max-w-xl text-lg text-muted">
          Tente outras palavras ou veja as{" "}
          <Link to="/noticias" className="font-semibold text-violet underline">
            últimas notícias
          </Link>
          .
        </p>
      )}
    </main>
  );
}
