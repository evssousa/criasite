import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/tool-uptime";
import { ToolDisclaimer, ToolLayout, ToolPanel, btnCls, btnGhostCls, inputCls } from "~/components/ToolLayout";
import { cx } from "~/components/ui";
import { useCheckHistory } from "~/lib/prefs";
import { seo } from "~/lib/seo";
import { toolBySlug } from "~/lib/site";
import { readMoreFor, seconds, speedLabel, stepsFor, summaryFor } from "~/lib/uptime/advice";
import type { ApiError, CheckResult, Verdict } from "~/lib/uptime/types";

const tool = toolBySlug("esta-fora-do-ar")!;

const FAQ = [
  {
    q: "Como saber se um site caiu só para mim?",
    a: "Teste o endereço aqui. Se aparecer “no ar”, o site está funcionando e o problema está na sua conexão, no navegador ou no DNS da sua operadora: teste no 4G ou em outro aparelho. Se aparecer “fora do ar”, o problema é do próprio site.",
  },
  {
    q: "O CriaSite guarda os endereços que eu testo?",
    a: "Não. O servidor usa o endereço só para fazer a checagem e não o grava em banco de dados nem em arquivo. Por alguns segundos ele fica na memória para não repetir a mesma checagem em sequência. O histórico que aparece na tela fica só no seu navegador.",
  },
  {
    q: "Por que o site abre para mim, mas aqui aparece erro 403?",
    a: "Muitos sites usam proteção contra robôs e recusam ferramentas automáticas como esta. O código 403 mostra que o servidor está no ar e respondeu; ele só não deixou a checagem entrar.",
  },
  {
    q: "Vocês avisam quando o meu site cair?",
    a: "Ainda não. Esta ferramenta faz uma checagem por vez, quando você pede. Para receber alertas, use um serviço de monitoramento de disponibilidade.",
  },
];

export function meta(_: Route.MetaArgs) {
  return [
    ...seo({ title: "Está fora do ar? Teste se um site caiu para todos ou só para você", description: tool.description, path: "/ferramentas/esta-fora-do-ar" }),
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    },
  ];
}

// ───────────── Cores e ícones (a forma do ícone e o texto sempre dizem o estado, não só a cor) ─────────────

const TONE: Record<Verdict, { text: string; bg: string; border: string; dot: string }> = {
  "no-ar": { text: "text-up-night", bg: "bg-up-night/15", border: "border-l-up-night", dot: "bg-up-night" },
  alerta: { text: "text-[#ffc857]", bg: "bg-[#ffc857]/15", border: "border-l-[#ffc857]", dot: "bg-[#ffc857]" },
  "fora-do-ar": { text: "text-down-night", bg: "bg-down-night/15", border: "border-l-down-night", dot: "bg-down-night" },
  "nao-encontrado": { text: "text-down-night", bg: "bg-down-night/15", border: "border-l-down-night", dot: "bg-down-night" },
};

const BADGE: Record<Verdict, string> = {
  "no-ar": "No ar",
  alerta: "No ar, com alerta",
  "fora-do-ar": "Fora do ar",
  "nao-encontrado": "Endereço não encontrado",
};

type IconName = Verdict | "checando" | "ok" | "aviso" | "erro" | "relogio";

function Icon({ name }: { name: IconName }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
  switch (name) {
    case "no-ar":
    case "ok":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12.5 3 3 5-6" />
        </svg>
      );
    case "alerta":
    case "aviso":
      return (
        <svg {...common}>
          <path d="M12 3 2.5 20h19L12 3Z" />
          <path d="M12 10v4.5M12 17.5v.01" />
        </svg>
      );
    case "fora-do-ar":
    case "erro":
      return (
        <svg {...common}>
          <path d="M8.5 3h7L21 8.5v7L15.5 21h-7L3 15.5v-7L8.5 3Z" />
          <path d="m9 9 6 6M15 9l-6 6" />
        </svg>
      );
    case "nao-encontrado":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17v.01" />
        </svg>
      );
    case "relogio":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    default:
      return (
        <svg {...common} strokeWidth={3}>
          <path d="M6 12h.01M12 12h.01M18 12h.01" />
        </svg>
      );
  }
}

function Badge({ verdict }: { verdict: Verdict | "checando" }) {
  const tone = verdict === "checando" ? { text: "text-moon-muted", bg: "bg-night-3" } : TONE[verdict];
  return (
    <span className={cx("inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[13px] font-extrabold tracking-[0.08em] uppercase", tone.bg, tone.text)}>
      <Icon name={verdict} />
      {verdict === "checando" ? "Checando" : BADGE[verdict]}
    </span>
  );
}

type Mark = "ok" | "aviso" | "erro";
const MARK_TONE: Record<Mark, string> = { ok: "text-up-night", aviso: "text-[#ffc857]", erro: "text-down-night" };
const MARK_SR: Record<Mark, string> = { ok: "certo", aviso: "atenção", erro: "problema" };

function Row({ label, mark, children }: { label: string; mark?: Mark; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-night-line py-3">
      <dt className="shrink-0 text-sm font-semibold text-moon-muted">{label}</dt>
      <dd className="flex min-w-0 items-start justify-end gap-2 text-right text-[15px] break-words">
        {mark && (
          <span className={cx("mt-0.5 shrink-0", MARK_TONE[mark])}>
            <Icon name={mark} />
            <span className="sr-only">{MARK_SR[mark]}</span>
          </span>
        )}
        <span className="min-w-0">{children}</span>
      </dd>
    </div>
  );
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

function dnsText(r: CheckResult): { text: string; mark: Mark } {
  if (r.dns.ok) return { text: r.dns.v4 && r.dns.v6 ? "Encontrado (IPv4 e IPv6)" : r.dns.v4 ? "Encontrado (só IPv4)" : "Encontrado (só IPv6)", mark: "ok" };
  if (r.reason === "dns-nao-encontrado") return { text: "Não encontrado", mark: "erro" };
  if (r.reason === "dns-sem-endereco") return { text: "Sem endereço configurado", mark: "erro" };
  return { text: "Não respondeu", mark: "erro" };
}

function httpsText(r: CheckResult): { text: string; mark: Mark } | null {
  const h = r.https;
  if (!h) {
    if (r.alerts.includes("sem-https")) return { text: "Sem HTTPS", mark: "aviso" };
    return null;
  }
  const until = h.validTo ? fmtDate(h.validTo) : "";
  if (h.state === "valido") {
    const soon = h.daysLeft !== null && h.daysLeft < 15;
    return { text: soon ? `Vence em ${h.daysLeft} dias` : `Válido até ${until}${h.daysLeft !== null ? ` (${h.daysLeft} dias)` : ""}${h.issuer ? ` · ${h.issuer}` : ""}`, mark: soon ? "aviso" : "ok" };
  }
  if (h.state === "vencido") return { text: `Vencido desde ${until}`, mark: "erro" };
  if (h.state === "outro-nome") return { text: "Não confere com o endereço", mark: "erro" };
  return { text: "Não confiável (autoassinado)", mark: "erro" };
}

function ago(at: number) {
  const m = Math.floor((Date.now() - at) / 60_000);
  if (m < 1) return "agora";
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h} h`;
  return h < 48 ? "ontem" : `há ${Math.floor(h / 24)} dias`;
}

const shortTarget = (t: string) => (t.length > 32 ? `${t.slice(0, 31)}…` : t);
const hostOf = (t: string) => t.split(/[/?]/)[0];

type Phase = { kind: "idle" } | { kind: "checking"; host: string } | { kind: "result"; result: CheckResult } | { kind: "limit"; error: ApiError } | { kind: "connection" };

export default function ToolUptime() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [mine, setMine] = useState(true);
  const [retryLeft, setRetryLeft] = useState(0);
  const history = useCheckHistory();
  const submitId = useRef(0);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const checking = phase.kind === "checking";

  // Contagem regressiva do limite de uso.
  useEffect(() => {
    if (retryLeft <= 0) return;
    const t = setTimeout(() => setRetryLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [retryLeft]);

  // Foco no título do resultado, para o leitor de tela anunciar.
  useEffect(() => {
    if (phase.kind === "result") headingRef.current?.focus();
  }, [phase]);

  async function run(raw: string) {
    const text = raw.trim();
    if (!text) return setFieldError("Digite o endereço do site.");
    if (/\s/.test(text)) return setFieldError("O endereço não pode ter espaços.");
    if (text.length > 2048) return setFieldError("Endereço longo demais.");
    setFieldError(null);
    const id = ++submitId.current;
    setPhase({ kind: "checking", host: hostOf(text.replace(/^https?:\/\//i, "")) });
    try {
      const res = await fetch("/api/fora-do-ar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: text }) });
      const body = (await res.json()) as CheckResult | ApiError;
      if (id !== submitId.current) return; // resposta de um envio antigo
      if (res.ok && "verdict" in body) {
        setPhase({ kind: "result", result: body });
        history.add({ target: body.target, verdict: body.verdict, at: Date.now() });
        return;
      }
      const err = body as ApiError;
      if (err.error === "invalido" || err.error === "bloqueado") {
        setFieldError(err.message);
        setPhase({ kind: "idle" });
      } else if (err.error === "limite" || err.error === "limite-alvo" || err.error === "ocupado") {
        setPhase({ kind: "limit", error: err });
        setRetryLeft(err.retryAfter ?? 10);
      } else setPhase({ kind: "connection" });
    } catch {
      if (id === submitId.current) setPhase({ kind: "connection" });
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void run(url);
  }

  const blocked = checking || retryLeft > 0;
  const result = phase.kind === "result" ? phase.result : null;
  const steps = result ? stepsFor(result, mine) : [];

  return (
    <ToolLayout
      tool={tool}
      lead="Digite o endereço e descubra se o site caiu para todo mundo ou se o problema está só na sua conexão. Mostramos o código da resposta, o tempo, o HTTPS e o que fazer em cada caso."
      explain={
        <>
          <h2>Como a checagem funciona</h2>
          <p>
            Quando você clica em “Checar agora”, o servidor do CriaSite procura o endereço no DNS (o catálogo que traduz o nome do site para o número do servidor), conecta
            nesse servidor e pede a página, como um navegador faria. Ele lê só a resposta inicial: o código de status, o tempo que levou, os redirecionamentos e o certificado
            HTTPS. O conteúdo da página não é baixado. Com isso dá para separar quatro situações: o site está no ar, está no ar com algum problema, está fora do ar ou o endereço
            nem existe.
          </p>
          <h2>Fora do ar para todo mundo ou só para mim?</h2>
          <p>
            Se aqui o resultado é “no ar” e na sua casa o site não abre, o problema está no caminho entre você e o site: a sua internet, o DNS da sua operadora, o cache do
            navegador, uma VPN ou um bloqueador. Teste no 4G, fora do Wi-Fi, ou em outro aparelho. Se aqui o resultado também é “fora do ar”, o problema é do site, e a única
            coisa que quem visita pode fazer é esperar.
          </p>
          <p>
            Um detalhe honesto: a checagem sai de um único lugar, o servidor do CriaSite. Um site pode estar fora do ar em um país e no ar em outro, ou bloquear só alguns
            provedores. Para a maioria dos casos, porém, um teste de fora já responde a pergunta.
          </p>
          <h2>O que cada resultado quer dizer</h2>
          <ul>
            <li>
              <strong>No ar</strong>: o servidor respondeu com um código de sucesso (200) ou de “não mudou” (304).
            </li>
            <li>
              <strong>No ar, com alerta</strong>: o servidor respondeu, mas algo merece atenção: a página não existe (404), o site recusou a checagem (403), o certificado está
              vencido ou não confere com o endereço, ou os redirecionamentos entram em laço.
            </li>
            <li>
              <strong>Fora do ar</strong>: o servidor não respondeu a tempo, recusou a conexão ou respondeu com erro 5xx (500, 502, 503, 504). O significado de cada código está na
              ferramenta <Link to="/ferramentas/status-http">Status HTTP</Link>.
            </li>
            <li>
              <strong>Endereço não encontrado</strong>: o domínio não aparece no DNS. Pode ter sido digitado errado, ter vencido ou estar com os servidores DNS errados.
            </li>
          </ul>
          <h2>Se o site é seu</h2>
          <p>
            A maioria das quedas de sites pequenos tem uma de cinco causas: fatura da hospedagem atrasada, domínio vencido, certificado SSL que não renovou, atualização de plugin
            ou tema que quebrou o site, ou sobrecarga do servidor. O resultado da checagem aponta qual é a mais provável e o bloco “O que fazer agora” mostra os passos. Para evitar
            sustos, ligue a renovação automática do domínio e do certificado (veja o guia de <Link to="/guias/https-e-certificado-ssl">HTTPS e certificado SSL</Link>) e escolha uma
            hospedagem com boa disponibilidade (o guia de <Link to="/guias/como-escolher-a-hospedagem-do-site">como escolher a hospedagem</Link> explica o que olhar). Antes de
            divulgar um site novo, passe pelo <Link to="/guias/checklist-de-lancamento-do-site">checklist de lançamento</Link>.
          </p>
          <h2>O que esta ferramenta não faz</h2>
          <ul>
            <li>Não monitora o site: ela checa uma vez, quando você pede. Para receber aviso quando o site cair, use um serviço de monitoramento (vários têm plano gratuito).</li>
            <li>Não guarda o endereço que você digita: ele é usado na checagem e descartado. As últimas checagens ficam só no seu navegador e podem ser apagadas no botão “Limpar”.</li>
            <li>Não pede cadastro e não testa endereços de rede interna (como os de roteadores e servidores de empresa), por segurança.</li>
            <li>Não testa velocidade de carregamento completa: o tempo mostrado é o da primeira resposta do servidor.</li>
          </ul>
          <h2>Perguntas frequentes</h2>
          {FAQ.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </>
      }
    >
      <ToolPanel>
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-2">
          <label htmlFor="endereco" className="text-sm font-semibold text-moon-muted">
            Endereço do site
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <input
                id="endereco"
                type="text"
                inputMode="url"
                autoComplete="url"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="go"
                maxLength={2048}
                placeholder="Ex.: meusite.com.br"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (fieldError) setFieldError(null);
                }}
                aria-invalid={fieldError ? true : undefined}
                aria-describedby={fieldError ? "endereco-erro" : "endereco-dica"}
                className={cx(inputCls, fieldError && "border-down-night focus:border-down-night")}
              />
              {fieldError ? (
                <p id="endereco-erro" className="text-sm text-down-night">
                  {fieldError}
                </p>
              ) : (
                <p id="endereco-dica" className="text-xs text-moon-muted">
                  Sem cadastro. Testamos o endereço uma vez, do servidor do CriaSite.{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setUrl("criasite.app");
                      void run("criasite.app");
                    }}
                    disabled={blocked}
                    className="text-glow underline-offset-4 hover:underline disabled:opacity-50"
                  >
                    Testar com criasite.app
                  </button>
                </p>
              )}
            </div>
            <button type="submit" disabled={blocked} className={cx(btnCls, "w-full min-w-44 gap-2 sm:w-auto")}>
              {checking ? (
                <>
                  <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" />
                  Checando…
                </>
              ) : (
                "Checar agora"
              )}
            </button>
          </div>
        </form>

        {history.items.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] font-bold tracking-[0.08em] text-moon-muted uppercase">Últimas checagens</span>
              <button type="button" onClick={history.clear} className="text-sm text-glow underline-offset-4 hover:underline">
                Limpar
              </button>
            </div>
            <ul className="flex flex-wrap gap-2">
              {history.items.map((h) => (
                <li key={h.target}>
                  <button
                    type="button"
                    disabled={blocked}
                    onClick={() => {
                      setUrl(h.target);
                      void run(h.target);
                    }}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full bg-night-2 px-3.5 text-sm font-semibold hover:bg-night-3 disabled:opacity-60"
                  >
                    <span aria-hidden className={cx("h-2 w-2 rounded-full", TONE[h.verdict].dot)} />
                    <span className="sr-only">{BADGE[h.verdict]}: </span>
                    {shortTarget(h.target)}
                    <span className="font-normal text-moon-muted">{ago(h.at)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div aria-live="polite" aria-busy={checking} className="flex flex-col gap-5">
          {phase.kind === "checking" && (
            <div className="flex flex-col gap-3 rounded-2xl border border-l-4 border-night-line-2 border-l-moon-muted bg-night-2 p-4 sm:p-6">
              <Badge verdict="checando" />
              <h2 className="text-[24px] leading-tight font-extrabold tracking-[-0.02em] break-words sm:text-[30px]">Checando {phase.host}…</h2>
              <p className="text-[17px] text-moon-muted">Testamos do servidor do CriaSite. Leva até 10 segundos.</p>
              <div aria-hidden className="flex flex-col gap-2.5 pt-1">
                {["70%", "55%", "80%", "40%"].map((w) => (
                  <div key={w} className="h-4 animate-pulse rounded bg-night-3 motion-reduce:animate-none" style={{ width: w }} />
                ))}
              </div>
            </div>
          )}

          {phase.kind === "limit" && (
            <div className="flex flex-col gap-2 rounded-2xl border border-[#ffc857]/50 bg-night-2 p-4">
              <p className="flex items-start gap-2 text-[#ffc857]">
                <span className="mt-0.5 shrink-0">
                  <Icon name="relogio" />
                </span>
                <span className="text-[15px] font-semibold">{phase.error.message}</span>
              </p>
              {retryLeft > 0 && <p className="num text-sm text-moon-muted">Tente de novo em {retryLeft} s</p>}
            </div>
          )}

          {phase.kind === "connection" && (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-down-night/50 bg-night-2 p-4">
              <p className="text-[15px]">Não conseguimos falar com o nosso servidor. Se outros sites também não abrem, o problema pode ser a sua internet.</p>
              <button type="button" onClick={() => void run(url)} className={btnGhostCls}>
                Tentar de novo
              </button>
            </div>
          )}

          {result && (
            <>
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                <div className={cx("flex flex-col gap-3 rounded-2xl border border-l-4 border-night-line-2 bg-night-2 p-4 sm:p-6", TONE[result.verdict].border)}>
                  <Badge verdict={result.verdict} />
                  <h2 ref={headingRef} tabIndex={-1} className="text-[24px] leading-tight font-extrabold tracking-[-0.02em] break-words outline-none sm:text-[30px]">
                    {result.verdict === "no-ar" && `${hostOf(result.target)} está no ar`}
                    {result.verdict === "alerta" && `${hostOf(result.target)} respondeu, mas tem um problema`}
                    {result.verdict === "fora-do-ar" && `${hostOf(result.target)} está fora do ar`}
                    {result.verdict === "nao-encontrado" && `Não encontramos ${hostOf(result.target)}`}
                  </h2>
                  <p className="text-[17px] text-moon-muted">{summaryFor(result)}</p>
                  {result.cached && (
                    <p className="text-xs text-moon-muted">
                      Resultado de {Math.max(1, Math.round((Date.now() - new Date(result.checkedAt).getTime()) / 1000))} s atrás (o mesmo endereço foi checado agora há pouco).
                    </p>
                  )}
                  <dl className="mt-1">
                    {(() => {
                      const d = dnsText(result);
                      return (
                        <Row label="DNS" mark={d.mark}>
                          {d.text}
                        </Row>
                      );
                    })()}
                    <Row label="Resposta" mark={result.status ? (result.status < 400 ? "ok" : result.status < 500 ? "aviso" : "erro") : "erro"}>
                      {result.status ? (
                        <>
                          <span className="num">
                            {result.status} {result.statusText}
                          </span>{" "}
                          <Link to="/ferramentas/status-http" className="text-sm text-glow underline underline-offset-4">
                            o que significa?
                          </Link>
                        </>
                      ) : (
                        "Sem resposta"
                      )}
                    </Row>
                    <Row label="Tempo de resposta" mark={result.ttfbMs === null ? undefined : result.ttfbMs <= 2000 ? "ok" : "aviso"}>
                      {result.ttfbMs === null ? (
                        "Sem resposta"
                      ) : (
                        <>
                          <span className="num">{seconds(result.ttfbMs)}</span> · {speedLabel(result.ttfbMs)}
                        </>
                      )}
                    </Row>
                    <Row label="Redirecionamentos">
                      {result.redirects.length === 0 ? (
                        "Nenhum"
                      ) : (
                        <>
                          {result.redirects.length}
                          <ol className="num mt-1 flex flex-col gap-0.5 text-left text-[13px] text-moon-muted">
                            {result.redirects.map((h, i) => (
                              <li key={i} title={h.url} className="break-all">
                                {h.status} → {h.url.length > 60 ? `${h.url.slice(0, 59)}…` : h.url}
                              </li>
                            ))}
                          </ol>
                        </>
                      )}
                    </Row>
                    {(() => {
                      const h = httpsText(result);
                      return h ? (
                        <Row label="HTTPS" mark={h.mark}>
                          {h.text}
                        </Row>
                      ) : null;
                    })()}
                    {result.server && (
                      <Row label="Servidor">
                        <span className="num text-moon-muted">{result.server}</span>
                      </Row>
                    )}
                    <Row label="Checado em">{new Date(result.checkedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</Row>
                  </dl>
                </div>

                <div className="flex flex-col gap-4 rounded-2xl bg-night-3 p-4 sm:p-6">
                  <h3 className="text-lg font-extrabold">O que fazer agora</h3>
                  <div role="group" aria-label="De quem é o site?" className="flex flex-wrap gap-2">
                    {[
                      { v: true, label: "O site é meu" },
                      { v: false, label: "É de outra pessoa" },
                    ].map((o) => (
                      <button
                        key={o.label}
                        type="button"
                        aria-pressed={mine === o.v}
                        onClick={() => setMine(o.v)}
                        className={cx("min-h-10 rounded-full px-4 text-sm font-bold transition-colors", mine === o.v ? "bg-brand text-white" : "bg-night-2 text-moon hover:bg-night-3")}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                  <ol className="flex flex-col gap-3">
                    {steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span aria-hidden className="num grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/15 text-sm font-bold text-glow">
                          {i + 1}
                        </span>
                        <span className="text-[15px] leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <p className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
                <span className="text-moon-muted">Para ler depois:</span>
                {readMoreFor(result).map((l) => (
                  <Link key={l.to} to={l.to} className="text-glow hover:underline">
                    {l.label}
                  </Link>
                ))}
              </p>
            </>
          )}
        </div>

        <ToolDisclaimer>
          Esta ferramenta usa o servidor do CriaSite: ele acessa o endereço digitado uma vez, lê só a resposta inicial e não grava o endereço. As suas últimas checagens ficam só neste navegador. Detalhes na{" "}
          <Link to="/privacidade" className="text-glow underline underline-offset-4">
            política de privacidade
          </Link>
          .
        </ToolDisclaimer>
      </ToolPanel>
    </ToolLayout>
  );
}
