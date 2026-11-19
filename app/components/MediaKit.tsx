// Tela do mídia kit (/anuncie). Estrutura COMUM aos sites: as classes de tema ficam todas no objeto SKIN (troque por site).
// Os textos e os números vêm de MediaKit (app/lib/media-kit/data.ts) e das regras puras; nada é escrito aqui. Ver docs/midia-kit.md, parte C.
import { useState } from "react";
import { Link } from "react-router";
import { formatDateBR, isKitExpired, mailtoHref, validUntil } from "~/lib/media-kit/rules";
import type { MediaKit, MetricRow } from "~/lib/media-kit/types";
import { cx } from "./ui";

/** Classes de tema do mídia kit. Em outro site, troque só estas. */
const SKIN = {
  hero: "mk-hero night flex flex-col gap-5 rounded-[22px] bg-night p-6 text-moon sm:p-8",
  heroMuted: "text-moon-muted",
  eyebrow: "text-glow",
  fact: "text-glow",
  btnPrimary: "inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand px-5 font-bold text-night hover:bg-glow sm:w-auto",
  btnGhost: "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-night-line-2 px-5 font-bold text-moon hover:border-glow sm:w-auto",
  card: "rounded-[22px] border border-line bg-card",
  persona: "mk-persona flex flex-col gap-2 rounded-[18px] border border-line bg-card p-5",
  chip: "rounded-full border border-line-2 bg-card px-3 py-1.5 text-sm font-semibold",
  price: "rounded-full bg-violet-soft px-3 py-1 font-bold text-violet-deep",
  accent: "text-violet",
  accentHover: "hover:text-violet-deep",
  note: "rounded-[14px] border-l-4 border-violet bg-violet-soft p-4 text-[15px] text-ink",
  contact: "mk-contact night grid gap-6 rounded-[22px] bg-night p-6 text-moon sm:grid-cols-[1fr_auto] sm:items-end sm:p-8",
} as const;

function Check({ className }: { className?: string }) {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={cx("mt-1 shrink-0", className)}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

function Cross({ className }: { className?: string }) {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={cx("mt-1 shrink-0", className)}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function PrinterIcon() {
  return (
    <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2" />
      <rect x="7" y="14" width="10" height="6" rx="1" />
    </svg>
  );
}

/** Cabeçalho de cada seção numerada (mesmo desenho dos h2 do StaticPage). */
function Head({ n, id, children }: { n: number; id: string; children: string }) {
  return (
    <h2 id={`${id}-t`} className="mk-section-head text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl">
      <span aria-hidden className="mr-3 font-mono text-base text-violet">
        {String(n).padStart(2, "0")}
      </span>
      {children}
    </h2>
  );
}

const fmt = (n: number) => n.toLocaleString("pt-BR");

/** Itens do índice (mesmos títulos e ids das seções). */
export const MEDIA_KIT_TOC = [
  { id: "numeros", title: "Números" },
  { id: "publico", title: "Quem lê" },
  { id: "formatos", title: "Formatos" },
  { id: "regras", title: "Regras do patrocínio" },
  { id: "nao-aceitamos", title: "O que não aceitamos" },
  { id: "como-funciona", title: "Como funciona" },
  { id: "perguntas", title: "Perguntas frequentes" },
  { id: "contato", title: "Contato" },
];

export function MediaKitPrintHeader({ kit }: { kit: MediaKit }) {
  return (
    <div className="mb-4 flex items-center justify-between border-b-2 border-night pb-3">
      <span className="inline-flex items-center gap-2 text-[22px] leading-none font-extrabold tracking-[-0.03em] text-ink">
        <svg aria-hidden width="28" height="28" viewBox="0 0 64 64">
          <rect width="64" height="64" rx="16" fill="#ff7a1a" />
          <rect x="12" y="16" width="40" height="32" rx="6" fill="none" stroke="#fff" strokeWidth="5" />
          <path d="M12 26h40" stroke="#fff" strokeWidth="5" />
          <path d="M26 33l-5 5 5 5M38 33l5 5-5 5" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>
          cria<span className="text-brand">site</span>
        </span>
      </span>
      <span className="text-right text-[9pt] leading-snug text-ink">
        {kit.brand.domain}/anuncie · {kit.brand.email}
        <br />
        Mídia kit atualizado em {formatDateBR(kit.updatedAt)}
      </span>
    </div>
  );
}

export function MediaKitView({ kit, rows, inventory, today }: { kit: MediaKit; rows: MetricRow[]; inventory: { tools: number; guides: number; news: number } | null; today: string }) {
  const [copied, setCopied] = useState<"" | "ok" | "erro">("");
  const expired = isKitExpired(kit, today);
  const mail = mailtoHref(kit);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(kit.brand.email);
      setCopied("ok");
    } catch {
      setCopied("erro");
    }
    setTimeout(() => setCopied(""), 2000);
  }

  return (
    <div className="mk flex flex-col gap-12">
      {/* Resumo */}
      <div className={SKIN.hero}>
        <p className={cx("eyebrow", SKIN.eyebrow)}>{expired ? "MÍDIA KIT · EM REVISÃO" : `MÍDIA KIT · ATUALIZADO EM ${formatDateBR(kit.updatedAt)}`}</p>
        <p className="text-2xl leading-tight font-extrabold sm:text-[32px]">{kit.pitch.title}</p>
        <p className={cx("mk-lead max-w-[60ch] text-base sm:text-lg", SKIN.heroMuted)}>{kit.pitch.lead}</p>
        {expired && <p className={cx("text-sm", SKIN.heroMuted)}>Algumas informações podem estar desatualizadas. Peça as atuais por e-mail.</p>}
        {inventory && (
          <>
            <dl className="grid grid-cols-3 gap-3 border-t border-night-line-2 pt-5">
              {(
                [
                  [inventory.tools, "ferramentas grátis"],
                  [inventory.guides, "guias"],
                  [inventory.news, "notícias"],
                ] as const
              ).map(([n, label]) => (
                <div key={label} className="flex flex-col-reverse gap-1">
                  <dt className={cx("text-xs sm:text-sm", SKIN.heroMuted)}>{label}</dt>
                  <dd className={cx("num text-[32px] leading-none font-bold sm:text-[40px]", SKIN.fact)}>{fmt(n)}</dd>
                </div>
              ))}
            </dl>
            <p className={cx("text-xs", SKIN.heroMuted)}>
              Contagem do próprio site em {formatDateBR(today)}. No ar desde {formatDateBR(kit.brand.launchedAt)}.
            </p>
          </>
        )}
        <div className="flex flex-wrap gap-3 print:hidden">
          <a href={mail} className={SKIN.btnPrimary}>
            Falar sobre um anúncio
          </a>
          <button type="button" onClick={() => window.print()} className={SKIN.btnGhost}>
            <PrinterIcon />
            Salvar em PDF ou imprimir
          </button>
        </div>
        <p className={cx("text-xs print:hidden", SKIN.heroMuted)}>No diálogo de impressão, escolha “Salvar como PDF”.</p>
      </div>

      {/* 01 Números */}
      <section id="numeros" aria-labelledby="numeros-t" className="flex flex-col gap-4">
        <Head n={1} id="numeros">
          Números
        </Head>
        {rows.length > 0 ? (
          <div className="table-wrap mk-table">
            <table>
              <caption className="px-4 py-3 text-left text-sm font-bold text-ink">Números do CriaSite, com fonte e data</caption>
              <thead>
                <tr>
                  <th scope="col">Métrica</th>
                  <th scope="col" className="text-right">
                    Valor
                  </th>
                  <th scope="col" className="hidden sm:table-cell">
                    Período
                  </th>
                  <th scope="col" className="hidden sm:table-cell">
                    Fonte
                  </th>
                  <th scope="col">Atualizado em</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <th scope="row" className="text-left font-semibold text-ink">
                      {r.label}
                      <span className="block text-xs font-normal text-muted sm:hidden">
                        {r.period} · {r.source}
                      </span>
                    </th>
                    <td className="text-right">
                      {r.state === "ok" && r.value !== null ? (
                        <>
                          <span className="num font-bold text-ink">{fmt(r.value)}</span>
                          {r.unit && <span className="ml-1 text-sm text-muted">{r.unit}</span>}
                        </>
                      ) : r.state === "vencido" ? (
                        <span className="text-sm text-muted">em atualização</span>
                      ) : (
                        <span className="text-sm text-muted">ainda sem dado público</span>
                      )}
                    </td>
                    <td className="hidden text-muted sm:table-cell">{r.period}</td>
                    <td className="hidden text-muted sm:table-cell">{r.source}</td>
                    <td className="text-sm text-muted">
                      {r.updatedAt ? (
                        <>
                          {formatDateBR(r.updatedAt)}
                          {r.state === "vencido" && " (mais de 90 dias)"}
                        </>
                      ) : (
                        <>
                          —<span className="sr-only">sem data</span>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {kit.audienceOnRequest && (
          <div className={SKIN.note}>
            <p>{kit.audienceOnRequest}</p>
            <p className="mt-2 print:hidden">
              <a href={mail} className={cx("font-bold underline", "text-violet-deep")}>
                Pedir os números atuais
              </a>
            </p>
          </div>
        )}
      </section>

      {/* 02 Quem lê */}
      <section id="publico" aria-labelledby="publico-t" className="mk-audience flex flex-col gap-5">
        <Head n={2} id="publico">
          Quem lê
        </Head>
        <p className="max-w-[65ch] text-lg text-[#26325f]">{kit.audience.intro}</p>
        <ul className="grid gap-3 sm:grid-cols-3">
          {kit.audience.personas.map((p) => (
            <li key={p.code} className={SKIN.persona}>
              <span className={cx("font-mono text-xs font-bold", SKIN.accent)}>{p.code}</span>
              <h3 className="text-lg font-extrabold">{p.title}</h3>
              <p className="mk-who text-[15px] text-muted">{p.who}</p>
              <p className="mt-1 text-xs font-bold text-ink print:hidden">Procura</p>
              <ul className="flex flex-col gap-1 text-[15px] print:hidden">
                {p.seeks.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span aria-hidden className={SKIN.accent}>
                      •
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <h3 className="mt-2 text-xl font-extrabold print:hidden">Por que anunciar aqui</h3>
        <ol className="flex max-w-[720px] flex-col gap-2 print:hidden">
          {kit.audience.why.map((w, i) => (
            <li key={w} className="flex gap-3 text-[16px] leading-relaxed text-[#26325f]">
              <span aria-hidden className={cx("font-mono", SKIN.accent)}>
                {i + 1}
              </span>
              {w}
            </li>
          ))}
        </ol>
        <h3 className="mt-2 text-xl font-extrabold print:hidden">Marcas que combinam com o CriaSite</h3>
        <ul className="flex flex-wrap gap-2 print:hidden">
          {kit.audience.categories.map((c) => (
            <li key={c} className={SKIN.chip}>
              {c}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted">{kit.audience.note}</p>
      </section>

      {/* 03 Formatos */}
      <section id="formatos" aria-labelledby="formatos-t" className="mk-formats flex flex-col gap-5">
        <Head n={3} id="formatos">
          Formatos
        </Head>
        <ul className="flex flex-col gap-4">
          {kit.formats
            .filter((f) => f.available)
            .map((f) => (
              <li key={f.id} className={cx(SKIN.card, "mk-card flex flex-col gap-4 p-5 sm:p-6")}>
                <div className="flex flex-col gap-1">
                  <span className={cx("font-mono text-xs font-bold", SKIN.accent)}>{f.code}</span>
                  <h3 className="text-2xl font-extrabold">{f.name}</h3>
                  <p className="mk-summary text-[16px] text-muted">{f.summary}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-sm font-bold">Inclui</h4>
                    <ul className="flex flex-col gap-1.5 text-[15px]">
                      {f.includes.map((x) => (
                        <li key={x} className="flex gap-2">
                          <Check className="text-up" />
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="print:hidden">
                    <h4 className="mb-2 text-sm font-bold">Não inclui</h4>
                    <ul className="flex flex-col gap-1.5 text-[15px]">
                      {f.excludes.map((x) => (
                        <li key={x} className="flex gap-2">
                          <Cross className="text-muted" />
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <dl className="flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-line pt-4 text-sm">
                  {(
                    [
                      ["Prazo", f.delivery],
                      ["No ar", f.duration],
                      ["Marcação", f.marking],
                    ] as const
                  ).map(([k, v]) => (
                    <div key={k} className="flex flex-col">
                      <dt className="text-xs font-bold tracking-wide text-muted uppercase">{k}</dt>
                      <dd className="text-ink">{v}</dd>
                    </div>
                  ))}
                  <div className="flex flex-col">
                    <dt className="text-xs font-bold tracking-wide text-muted uppercase">Preço</dt>
                    <dd>
                      <span className={SKIN.price}>{f.price ?? "Sob consulta"}</span>
                    </dd>
                  </div>
                </dl>
                <a href={mailtoHref(kit, f.name)} className={cx("inline-flex min-h-11 items-center font-bold hover:underline print:hidden", SKIN.accent, SKIN.accentHover)}>
                  Pedir este formato →
                </a>
              </li>
            ))}
        </ul>
        <p className="text-[15px] font-semibold text-ink">{kit.sharedExcludes}</p>
        <div className="mk-card rounded-[22px] border border-dashed border-line-2 p-5 print:hidden">
          <h3 className="text-lg font-extrabold">{kit.adsenseNote.title}</h3>
          <p className="mt-1 text-muted">{kit.adsenseNote.text}</p>
        </div>
      </section>

      {/* 04 Regras */}
      <section id="regras" aria-labelledby="regras-t" className="mk-rules flex flex-col gap-4">
        <Head n={4} id="regras">
          Regras do patrocínio
        </Head>
        <div className="article-body max-w-[720px]">
          <ol>
            {kit.rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
          <p>
            Os detalhes estão na <Link to="/politica-editorial#patrocinio">política editorial</Link>.
          </p>
        </div>
      </section>

      {/* 05 Não aceitamos */}
      <section id="nao-aceitamos" aria-labelledby="nao-aceitamos-t" className="mk-refused flex flex-col gap-4">
        <Head n={5} id="nao-aceitamos">
          O que não aceitamos
        </Head>
        <div className="article-body max-w-[720px]">
          <ul>
            {kit.refused.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* 06 Como funciona */}
      <section id="como-funciona" aria-labelledby="como-funciona-t" className="flex flex-col gap-4 print:hidden">
        <Head n={6} id="como-funciona">
          Como funciona
        </Head>
        <ol className="grid gap-3 sm:grid-cols-2">
          {kit.process.map((p, i) => (
            <li key={p.title} className="mk-persona rounded-[18px] border border-line bg-card p-5">
              <span className={cx("font-mono text-2xl font-bold", SKIN.accent)}>{i + 1}</span>
              <p className="font-extrabold">{p.title}</p>
              <p className="text-[15px] text-muted">{p.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 07 Perguntas */}
      <section id="perguntas" aria-labelledby="perguntas-t" className="flex flex-col gap-4 print:hidden">
        <Head n={7} id="perguntas">
          Perguntas frequentes
        </Head>
        <div className="flex max-w-[760px] flex-col gap-3">
          {kit.faq.map((f) => (
            <details key={f.q} className="group rounded-[14px] border border-line bg-card">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 text-lg font-bold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden className={cx("transition-transform group-open:rotate-45", SKIN.accent)}>
                  +
                </span>
              </summary>
              <div className="px-5 pb-5 text-[17px] leading-relaxed text-[#26325f]">
                <p>{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* 08 Contato */}
      <section id="contato" aria-labelledby="contato-t" className="flex flex-col gap-4">
        <Head n={8} id="contato">
          Contato
        </Head>
        <div className={SKIN.contact}>
          <div className="flex flex-col gap-2">
            <p className="text-2xl font-extrabold">Vamos conversar</p>
            <p className={SKIN.heroMuted}>
              Escreva para <strong className="text-moon">{kit.brand.email}</strong> com o assunto <strong className="text-moon">[{kit.brand.mailSubject}]</strong>. {kit.responseTime}
            </p>
            <h3 className="mt-2 text-sm font-bold text-moon print:hidden">O que mandar no primeiro e-mail</h3>
            <ul className={cx("flex flex-col gap-0.5 text-[15px] print:hidden", SKIN.heroMuted)}>
              {kit.firstEmail.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 print:hidden">
            <a href={mail} className={SKIN.btnPrimary}>
              Escrever e-mail
            </a>
            <button type="button" onClick={copyEmail} className={SKIN.btnGhost}>
              {copied === "ok" ? "Endereço copiado" : copied === "erro" ? "Não deu para copiar: selecione o endereço" : "Copiar endereço"}
            </button>
            <span role="status" aria-live="polite" className="sr-only">
              {copied === "ok" ? "Endereço copiado." : copied === "erro" ? "Não deu para copiar." : ""}
            </span>
          </div>
        </div>
      </section>

      <p className="mk-print-footer hidden border-t border-line pt-3 text-[8.5pt] text-muted print:block">
        Mídia kit do {kit.brand.name}, atualizado em {formatDateBR(kit.updatedAt)} e válido até {formatDateBR(validUntil(kit))}. Números e condições podem mudar; a versão atual fica em {kit.brand.domain}/anuncie. Valores sob consulta pelo
        e-mail {kit.brand.email}.
      </p>
    </div>
  );
}
