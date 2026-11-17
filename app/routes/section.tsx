import { data, useLocation } from "react-router";
import type { Route } from "./+types/section";
import { GuideCard, MostRead, Pagination, PostRow } from "~/components/cards";
import { Chip, SectionTitle } from "~/components/ui";
import { useAvailability } from "~/lib/availability";
import { getMostRead, listPosts } from "~/lib/content.server";
import { firstSegment } from "~/lib/route-path";
import { seo } from "~/lib/seo";
import { compareGuides, LEVEL_LABEL, SECTIONS, sectionBySlug, type GuideLevel } from "~/lib/site";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const section = sectionBySlug(firstSegment(request));
  if (!section) throw data("Seção não encontrada", { status: 404 });
  const page = Number(url.searchParams.get("pagina")) || 1;
  // Guias: todos de uma vez (são poucos), organizados por nível e pela ordem de aprendizado, com filtro ?nivel=1|2|3.
  if (section.slug === "guias") {
    const all = (await listPosts({ section: "guias", perPage: 100 })).items.sort(compareGuides);
    const levels = ([1, 2, 3] as GuideLevel[]).map((l) => ({ level: l, count: all.filter((p) => p.level === l).length })).filter((l) => l.count > 0);
    const wanted = Number(url.searchParams.get("nivel"));
    const nivel = levels.some((l) => l.level === wanted) ? (wanted as GuideLevel) : null;
    const items = nivel ? all.filter((p) => p.level === nivel) : all;
    return { section, posts: { items, page: 1, totalPages: 1, total: items.length }, mostRead: [], levels, nivel, allCount: all.length };
  }
  // "Notícias" é o feed geral: mostra as notícias de todas as editorias (menos os guias).
  const [posts, mostRead] = await Promise.all([
    section.slug === "noticias" ? listPosts({ excludeSection: "guias", page, perPage: 15 }) : listPosts({ section: section.slug, page, perPage: 15 }),
    getMostRead(5),
  ]);
  return { section, posts, mostRead, levels: [] as { level: GuideLevel; count: number }[], nivel: null as GuideLevel | null, allCount: 0 };
}

export function meta({ loaderData, location }: Route.MetaArgs) {
  if (!loaderData) return [];
  const { section, posts } = loaderData;
  return seo({
    title: posts.page > 1 ? `${section.label} — página ${posts.page}` : section.label,
    description: section.description,
    path: location.pathname + (posts.page > 1 ? `?pagina=${posts.page}` : ""),
    noindex: posts.total === 0,
  });
}

export default function SectionPage({ loaderData }: Route.ComponentProps) {
  const { section, posts, mostRead, levels, nivel, allCount } = loaderData;
  const noLevel = posts.items.filter((p) => !p.level);
  const location = useLocation();
  const available = useAvailability();
  const isGuides = section.slug === "guias";

  return (
    <main id="conteudo" className="mx-auto flex max-w-[1180px] flex-col gap-10 px-4 pt-10 sm:px-6">
      <div className="flex flex-col gap-4">
        <SectionTitle as="h1" size="xl">
          {section.label}
        </SectionTitle>
        <p className="max-w-2xl text-lg text-muted">{section.description}</p>
        {/* Guias é a única editoria da sua página: o filtro por nível faz o papel dos botões. */}
        <nav aria-label="Editorias" className={isGuides ? "hidden" : "flex flex-wrap gap-1.5"}>
          {SECTIONS.filter((s) => available.sections.includes(s.slug) && (isGuides ? s.slug === "guias" : s.slug !== "guias")).map((s) => (
            <Chip key={s.slug} to={`/${s.slug}`} active={s.slug === section.slug}>
              {s.slug === "noticias" ? "Tudo" : s.label}
            </Chip>
          ))}
        </nav>
      </div>

      {isGuides ? (
        <div className="flex flex-col gap-8">
          {levels.length > 1 && (
            <nav aria-label="Filtrar por nível" className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-sm font-semibold text-muted">Nível</span>
              <Chip to="/guias" active={nivel === null}>
                Todos ({allCount})
              </Chip>
              {levels.map((l) => (
                <Chip key={l.level} to={`/guias?nivel=${l.level}`} active={nivel === l.level}>
                  {LEVEL_LABEL[l.level]} ({l.count})
                </Chip>
              ))}
            </nav>
          )}
          {posts.items.length === 0 ? (
            <Empty />
          ) : (
            levels
              .filter((l) => nivel === null || l.level === nivel)
              .map((l) => (
                <section key={l.level} aria-labelledby={`nivel-${l.level}`} className="flex flex-col gap-4">
                  <h2 id={`nivel-${l.level}`} className="flex flex-wrap items-baseline gap-x-3 text-2xl font-extrabold tracking-[-0.02em]">
                    {LEVEL_LABEL[l.level]}
                    <small className="text-sm font-medium text-muted">
                      {l.level === 1 ? "para quem está começando" : l.level === 2 ? "para quem já publicou um site" : "para quem quer ir fundo"} · {l.count} {l.count === 1 ? "guia" : "guias"}
                    </small>
                  </h2>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
                    {posts.items
                      .filter((p) => p.level === l.level)
                      .map((p) => (
                        <GuideCard key={p.url} post={p} />
                      ))}
                  </div>
                </section>
              ))
          )}
          {nivel === null && noLevel.length > 0 && (
            <section aria-labelledby="nivel-0" className="flex flex-col gap-4">
              <h2 id="nivel-0" className="text-2xl font-extrabold tracking-[-0.02em]">
                Outros guias
              </h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
                {noLevel.map((p) => (
                  <GuideCard key={p.url} post={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-10">
          <div className="flex min-w-0 flex-[999_1_560px] flex-col">
            {posts.items.length === 0 ? <Empty /> : posts.items.map((p) => <PostRow key={p.url} post={p} excerpt />)}
            <div className="mt-6">
              <Pagination page={posts.page} totalPages={posts.totalPages} pathname={location.pathname} search={location.search} />
            </div>
          </div>
          <aside className="flex-[1_1_300px]">
            <MostRead posts={mostRead} />
          </aside>
        </div>
      )}
    </main>
  );
}

function Empty() {
  return <p className="rounded-[14px] border border-line bg-card px-6 py-10 text-lg text-muted">Nenhum texto por aqui ainda. Volte em breve!</p>;
}
