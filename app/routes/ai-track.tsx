import { Link } from "react-router";
import type { Route } from "./+types/ai-track";
import { cx } from "~/components/ui";
import { useAvailability } from "~/lib/availability";
import { listPosts } from "~/lib/content.server";
import { useAiTrack } from "~/lib/prefs";
import { seo } from "~/lib/seo";
import { absoluteUrl, AI_TRACK, LEVEL_LABEL, toolBySlug, toolUrl } from "~/lib/site";

const COVER = "/capas/criar-site-com-ia-do-jeito-certo.webp";
const COVER_ALT = "Ilustração de um ciclo de cinco caixas ligadas por setas dentro de uma janela de navegador: plano, pedido à IA, partes pequenas, revisão aprovada e versão salva.";

const RULES = [
  { n: "01", title: "Você decide", text: "A IA executa. O que o site precisa, o que vai ao ar e as contas no seu nome continuam com você." },
  { n: "02", title: "Passos pequenos", text: "Uma página ou uma mudança por pedido, com uma versão salva antes de cada uma." },
  { n: "03", title: "Segredo fica fora", text: "Senha, chave de API e dado de cliente não vão para o chat nem para o código." },
  { n: "04", title: "Teste antes", text: "Leia o que mudou e teste no celular. Funcionar na tela não é o mesmo que estar certo." },
];

export async function loader() {
  const slugs = [...new Set(AI_TRACK.flatMap((s) => s.guides))];
  const found = await listPosts({ section: "guias", slugs, perPage: 30 });
  return { guides: found.items.map((g) => ({ slug: g.slug, title: g.title, url: g.url, level: g.level, readMinutes: g.readMinutes })) };
}

export function meta({ loaderData }: Route.MetaArgs) {
  const guides = loaderData?.guides ?? [];
  const inOrder = AI_TRACK.flatMap((s) => s.guides)
    .filter((slug, i, all) => all.indexOf(slug) === i)
    .map((slug) => guides.find((g) => g.slug === slug))
    .filter((g): g is (typeof guides)[number] => Boolean(g));
  return [
    ...seo({
      title: "Criar site com IA: roteiro do jeito certo, em 6 etapas",
      description: "Como criar um site com inteligência artificial sem perder o controle: planejar, dar contexto, pedir, revisar, proteger e publicar, com guias e checklist.",
      path: "/criar-site-com-ia",
      image: COVER,
      imageAlt: COVER_ALT,
      imageSize: [1200, 675],
      // Sem os guias no banco (migration ainda não rodou), a página só teria etapas vazias.
      noindex: guides.length === 0,
    }),
    ...(inOrder.length
      ? [
          {
            "script:ld+json": {
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "Criar site com IA, do jeito certo",
              itemListElement: inOrder.map((g, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(g.url), name: g.title })),
            },
          },
        ]
      : []),
  ];
}

function Spark({ size = 14 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z" />
    </svg>
  );
}

export default function AiTrack({ loaderData }: Route.ComponentProps) {
  const { guides } = loaderData;
  const { done, toggle, isDone } = useAiTrack();
  const available = useAvailability();
  const pct = Math.round((done.length / AI_TRACK.length) * 100);
  return (
    <main id="conteudo" className="mx-auto flex max-w-[1180px] flex-col gap-8 px-4 pt-8 sm:px-6">
      <header className="flex max-w-3xl flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-violet-soft px-3 py-1 text-xs font-bold text-violet">
          <Spark /> Roteiro · Com IA
        </span>
        <h1 className="text-[36px] leading-[1.05] font-extrabold tracking-[-0.03em] text-balance sm:text-[48px]">Criar site com IA, do jeito certo</h1>
        <p className="text-lg leading-relaxed text-muted">
          A IA escreve código em segundos. O que decide se o site fica bom é o método: você planeja, dá contexto, pede em partes, revisa e só então publica. Marque cada etapa quando
          terminar: o progresso fica salvo neste navegador.
        </p>
      </header>

      <ul aria-label="Regras de ouro" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {RULES.map((r) => (
          <li key={r.n} className="flex flex-col gap-2 rounded-[14px] border border-line bg-card p-5">
            <span className="text-3xl font-extrabold text-violet">{r.n}</span>
            <span className="text-xl font-extrabold">{r.title}</span>
            <span className="text-[15px] leading-relaxed text-muted">{r.text}</span>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <ol className="flex flex-col">
          {AI_TRACK.map((s, i) => {
            const on = isDone(s.id);
            const steps = s.guides.map((slug) => guides.find((g) => g.slug === slug)).filter((g): g is (typeof guides)[number] => Boolean(g));
            const tools = s.tools.filter((t) => available.tools.includes(t)).map((t) => toolBySlug(t)!);
            return (
              <li key={s.id} id={s.id} className="relative grid grid-cols-[52px_1fr] gap-4 pb-9 last:pb-0">
                {i < AI_TRACK.length - 1 && <span aria-hidden className="absolute top-14 bottom-2 left-[25px] w-0.5 bg-line-2" />}
                <span
                  aria-hidden
                  className={cx("grid h-[52px] w-[52px] place-items-center rounded-full text-xl font-extrabold", on ? "bg-brand text-white" : "bg-card text-ink ring-2 ring-line-2")}
                >
                  {on ? "✓" : i + 1}
                </span>
                <div className="flex min-w-0 flex-col gap-2.5 pt-2">
                  <h2 className="text-[22px] leading-tight font-extrabold tracking-[-0.02em]">{s.title}</h2>
                  <p className="max-w-[62ch] text-[16px] leading-relaxed text-[#26325f]">{s.text}</p>
                  {steps.length > 0 && (
                    <ul className="flex max-w-[62ch] flex-col gap-2">
                      {steps.map((g) => (
                        <li key={g.slug}>
                          <Link
                            to={g.url}
                            className="group flex items-center justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3 hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2"
                          >
                            <span className="min-w-0">
                              <span className="block leading-snug font-bold group-hover:text-violet">{g.title}</span>
                              <span className="block text-[13px] text-muted">
                                {g.level ? `Nível ${g.level} (${LEVEL_LABEL[g.level]}) · ` : ""}
                                {g.readMinutes} min de leitura
                              </span>
                            </span>
                            <span aria-hidden className="text-violet transition-transform group-hover:translate-x-0.5">
                              →
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
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
            {done.length} de {AI_TRACK.length} etapas feitas
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-night-3" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso do roteiro">
            <div className="h-full bg-brand transition-[width]" style={{ width: `${pct}%` }} />
          </div>
          <ul className="mt-1 flex flex-col">
            {AI_TRACK.map((s, i) => (
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
          <div className="border-t border-night-line pt-3">
            <Link to="/trilha" className="text-sm font-semibold text-glow hover:text-moon">
              Ainda sem domínio e hospedagem? Veja a trilha →
            </Link>
          </div>
        </aside>
      </div>

      <section className="max-w-3xl rounded-[14px] border border-line bg-card p-5 text-[15px] leading-relaxed text-muted">
        <h2 className="mb-1 text-base font-extrabold text-ink">Sobre este roteiro</h2>
        <p>
          Os guias deste roteiro são escritos pela Equipe CriaSite com apoio de IA e revisados antes de publicar. Nenhuma ferramenta pagou para aparecer, e os nomes citados são só
          exemplos. Recursos e preços de ferramentas de IA mudam com frequência: confira sempre na documentação oficial. O próprio CriaSite foi construído com um assistente de código,
          seguindo estas etapas. Veja a{" "}
          <Link to="/politica-editorial#automacao" className="font-semibold text-ink underline hover:text-violet">
            política editorial
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
