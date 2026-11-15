import { useState } from "react";
import { Form, Link } from "react-router";
import type { Route } from "./+types/home";
import { NewsList } from "~/components/cards";
import { FavoriteTools, ToolDirectory, TrailStrip, filterTools } from "~/components/directory";
import { toolsFor, useAvailability } from "~/lib/availability";
import { listPosts } from "~/lib/content.server";
import { seo } from "~/lib/seo";
import { absoluteUrl, SITE } from "~/lib/site";

export async function loader() {
  const [latest, guides] = await Promise.all([listPosts({ excludeSection: "guias", perPage: 5 }), listPosts({ section: "guias", perPage: 3 })]);
  return { news: latest.items, guides: guides.items };
}

export function meta() {
  return [
    ...seo({ path: "/" }),
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE.name,
        url: SITE.url,
        inLanguage: "pt-BR",
        potentialAction: { "@type": "SearchAction", target: `${absoluteUrl("/busca")}?q={search_term_string}`, "query-input": "required name=search_term_string" },
      },
    },
  ];
}

/** Atalhos da busca: o que as pessoas mais procuram. */
const POPULAR = ["imagem", "QR code", "WhatsApp", "meta tags"];

export default function Home({ loaderData }: Route.ComponentProps) {
  const { news, guides } = loaderData;
  const tools = toolsFor(useAvailability());
  const [query, setQuery] = useState("");
  const count = filterTools(tools, query).length;

  return (
    <main id="conteudo">
      {/* Topo marinho: busca grande + atalhos + faixa da trilha */}
      <section aria-label="Buscar ferramenta" className="night bg-night text-moon">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <div className="mx-auto max-w-[760px] pt-8 pb-7 text-center sm:pt-10">
            <h1 className="text-[32px] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance sm:text-[48px]">O que você quer fazer no seu site hoje?</h1>
            <Form
              method="get"
              action="/busca"
              role="search"
              className="mt-6 flex rounded-[14px] bg-white p-1.5 shadow-[0_0_0_4px_rgba(255,122,26,.35)]"
              onSubmit={(e) => {
                // Uma ferramenta só encontrada: abre direto. Senão, a busca completa (ferramentas + notícias + guias).
                const found = filterTools(tools, query);
                if (query.trim() && found.length === 1) {
                  e.preventDefault();
                  window.location.assign(`/ferramentas/${found[0].slug}`);
                }
              }}
            >
              <label htmlFor="busca-home" className="sr-only">
                Buscar ferramenta, notícia ou guia
              </label>
              <input
                id="busca-home"
                name="q"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex.: comprimir imagem, QR code, WhatsApp"
                autoComplete="off"
                className="h-12 min-w-0 flex-1 bg-transparent px-3 text-[17px] font-medium text-ink outline-none placeholder:text-muted"
              />
              <button type="submit" className="rounded-[10px] bg-brand px-5 font-bold text-white hover:bg-[#ec6a0c]">
                Buscar
              </button>
            </Form>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-moon-muted">
              <span>Mais usadas:</span>
              {POPULAR.map((p) => (
                <button key={p} type="button" onClick={() => setQuery(p)} className="min-h-9 rounded-full bg-night-3 px-3 text-[13px] font-medium text-moon hover:bg-night-line-2">
                  {p}
                </button>
              ))}
            </div>
          </div>
          <TrailStrip />
        </div>
      </section>

      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-8 px-4 pt-8 sm:px-6 lg:grid-cols-[1fr_330px]">
        <div className="flex min-w-0 flex-col gap-8">
          {!query && (
            <section aria-labelledby="suas" className="flex flex-col gap-3">
              <h2 id="suas" className="flex flex-wrap items-baseline justify-between gap-2 text-lg font-extrabold">
                Suas ferramentas <small className="text-[13px] font-medium text-muted">marque a estrela para fixar aqui</small>
              </h2>
              <FavoriteTools tools={tools} />
            </section>
          )}
          <section aria-labelledby="todas" className="flex flex-col gap-3">
            <h2 id="todas" className="flex flex-wrap items-baseline justify-between gap-2 text-lg font-extrabold">
              {query ? "Ferramentas encontradas" : "Todas as ferramentas"}
              <small className="text-[13px] font-medium text-muted" aria-live="polite">
                {count} {count === 1 ? "ferramenta" : "ferramentas"}
              </small>
            </h2>
            <ToolDirectory tools={tools} query={query} />
          </section>
        </div>

        <aside className="flex min-w-0 flex-col gap-5">
          {news.length > 0 && (
            <section aria-labelledby="noticias-web" className="rounded-[14px] border border-line bg-card px-4 pt-3 pb-2">
              <h2 id="noticias-web" className="flex items-center justify-between gap-2 py-1 text-[15px] font-extrabold">
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden className="live-dot" />
                  Notícias da web
                </span>
                <small className="text-xs font-medium text-muted">automáticas</small>
              </h2>
              <NewsList posts={news} />
              <Link to="/noticias" className="block py-2 text-[13px] font-bold text-violet hover:text-violet-deep">
                Ver todas as notícias
              </Link>
            </section>
          )}
          {guides.length > 0 && (
            <section aria-labelledby="guias-novos" className="rounded-[14px] border border-line bg-card px-4 pt-3 pb-2">
              <h2 id="guias-novos" className="py-1 text-[15px] font-extrabold">
                Guias novos
              </h2>
              <ul>
                {guides.map((g) => (
                  <li key={g.url} className="border-t border-day first:border-0">
                    <Link to={g.url} className="block py-2.5 leading-snug font-medium hover:text-violet">
                      {g.title}
                      <small className="block text-[12.5px] font-normal text-muted">{g.readMinutes} min de leitura</small>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
