import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/tool-orcamento";
import { Box, DraftStatus, Icon, RadioGroup, Section, download } from "~/components/ToolForm";
import { ToolDisclaimer, ToolLayout, ToolPanel, btnCls, btnGhostCls, copyText, inputCls } from "~/components/ToolLayout";
import { cx } from "~/components/ui";
import {
  CAMINHOS,
  DEFAULT_STATE,
  DOMINIOS,
  EMAIL_TIPOS,
  EXAMPLE_STATE,
  IMAGENS,
  MANUTENCOES,
  RECURSOS,
  SELOS,
  TEXTOS,
  TIPOS,
  buildResumo,
  estimate,
  formatBRL,
  formatDateBR,
  formatFaixa,
  formatHoras,
  isDefaultLike,
  parseDraft,
  resumoFileName,
  todayInBrazil,
} from "~/lib/orcamento/calc";
import { ORCAMENTO_DATA } from "~/lib/orcamento/data";
import type { CaminhoId, Cobranca, Faixa, OrcamentoState, RecursoId, ResultadoCaminho } from "~/lib/orcamento/types";
import { clearOrcDraft, loadOrcDraft, saveOrcDraft } from "~/lib/prefs";
import { seo } from "~/lib/seo";
import { toolBySlug } from "~/lib/site";

const tool = toolBySlug("quanto-custa-um-site")!;

const FAQ = [
  {
    q: "Quanto custa um site simples?",
    a: "Para uma página única ou um site institucional pequeno, feito por você, o maior custo em dinheiro costuma ser o domínio e a hospedagem, e o maior custo de verdade é o seu tempo. Contratando alguém, o projeto passa a ser a maior parte da conta. Use a calculadora com o seu caso para ver as faixas.",
  },
  {
    q: "Os valores são de alguma empresa?",
    a: "Não. São faixas montadas com critérios declarados na tabela de premissas, sem citar empresas, e revisadas a cada 6 meses. Antes de contratar, confira o preço do dia e o preço de renovação na empresa escolhida.",
  },
  {
    q: "Fazer sozinho é sempre mais barato?",
    a: "Em dinheiro, quase sempre. Em tempo, não: montar, aprender e manter o site pode levar dezenas de horas. Informe o valor da sua hora para ver esse tempo em reais, ao lado do total.",
  },
  {
    q: "O CriaSite guarda as minhas escolhas?",
    a: "Não. A calculadora roda no seu navegador e nada é enviado para o nosso servidor. O rascunho fica só no armazenamento local deste navegador e é apagado no botão “Limpar tudo”.",
  },
];

export function meta(_: Route.MetaArgs) {
  return [
    ...seo({ title: tool.title, description: tool.description, path: "/ferramentas/quanto-custa-um-site" }),
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    },
  ];
}

// ───────────── Peças locais ─────────────

const Subtitle = ({ id, children, srOnly }: { id: string; children: ReactNode; srOnly?: boolean }) => (
  <h3 id={id} className={srOnly ? "sr-only" : "text-[13px] font-bold tracking-[0.08em] text-moon-muted uppercase"}>
    {children}
  </h3>
);

function Chip({ on, disabled, onClick, children, describedBy }: { on: boolean; disabled?: boolean; onClick: () => void; children: ReactNode; describedBy?: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-disabled={disabled || undefined}
      aria-describedby={describedBy}
      onClick={() => !disabled && onClick()}
      className={cx(
        "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-bold transition-colors",
        on ? "border-brand bg-brand text-white" : "border-night-line-2 bg-night-2 text-moon hover:bg-night-3",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      {on && <Icon name="check" size={14} />}
      {children}
    </button>
  );
}

function Calculator() {
  return (
    <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x={5} y={3} width={14} height={18} rx={2} />
      <rect x={8} y={6} width={8} height={3} />
      <path d="M9 13h.01M12 13h.01M15 13h.01M9 17h.01M12 17h.01M15 17h.01" />
    </svg>
  );
}

const COBRANCA: Record<Cobranca, string> = { mensal: "por mês", anual: "por ano", unico: "uma vez" };
const num = (n: string) => <span className="num">{n}</span>;

function Regua({ f, escala }: { f: Faixa; escala: number }) {
  const left = Math.min(98, (f.min / escala) * 100);
  const width = Math.min(100 - left, Math.max(2, ((f.max - f.min) / escala) * 100));
  return (
    <div aria-hidden className="relative h-2 rounded-full bg-night-3">
      <div className="orc-bar absolute inset-y-0 rounded-full bg-brand" style={{ left: `${left}%`, width: `${width}%` }} />
    </div>
  );
}

function Cartao({ c, first, escala, valorHora, open, onToggle }: { c: ResultadoCaminho; first: boolean; escala: number; valorHora: number | null; open: boolean; onToggle: () => void }) {
  const horasEmReais: Faixa | null = valorHora ? { min: c.horasMontar.min * valorHora, max: c.horasMontar.max * valorHora } : null;
  return (
    <li className="orc-card flex flex-col gap-3 rounded-2xl border border-night-line-2 bg-night-2 p-4">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h3 className="text-[17px] font-extrabold">{c.nome}</h3>
        {c.selos.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {c.selos.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-full bg-up-night/15 px-2.5 py-0.5 text-xs font-bold text-up-night">
                <Icon name="check" size={12} />
                {SELOS[s]}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold tracking-[0.08em] text-moon-muted uppercase">1º ano</span>
          <span className="num text-xl font-bold whitespace-nowrap text-glow sm:text-2xl">{formatFaixa(c.ano1)}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold tracking-[0.08em] text-moon-muted uppercase">Por mês depois</span>
          <span className="num text-lg font-bold text-moon">{formatFaixa(c.mes)}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Regua f={c.ano1} escala={escala} />
        {first && <span className="text-right text-[11px] text-moon-muted">Régua: 1º ano, mesma escala para os 5 caminhos</span>}
      </div>
      <p className="text-sm text-moon-muted">
        Seu tempo: <strong className="num text-moon">{formatHoras(c.horasMontar)}</strong> para montar · {num(formatHoras(c.horasMes))} por mês
        {horasEmReais && (
          <>
            <br />
            No seu valor de hora: {num(formatFaixa(horasEmReais))} (fora do total)
          </>
        )}
      </p>
      {c.alertas.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {c.alertas.map((a) => (
            <span key={a} className="inline-flex items-center gap-1 rounded-full border border-[#ffc857]/60 px-2.5 py-0.5 text-xs font-bold text-[#ffc857]">
              <Icon name="alert" size={12} />
              {ORCAMENTO_DATA.alertas[a].chip}
            </span>
          ))}
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`orc-conta-${c.id}`}
        onClick={onToggle}
        className="orc-toggle inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-bold text-glow underline-offset-4 hover:underline"
      >
        <span className={cx("transition-transform", open && "rotate-90")}>
          <Icon name="arrow" size={14} />
        </span>
        {open ? "Esconder a conta" : "Ver a conta"}
      </button>
      <div id={`orc-conta-${c.id}`} className={cx("orc-conta flex-col gap-3", open ? "flex" : "hidden print:flex")}>
        <table className="w-full text-sm">
          <caption className="sr-only">Conta do caminho {c.nome}</caption>
          <thead>
            <tr className="text-left text-xs text-moon-muted uppercase">
              <th scope="col" className="py-1.5 pr-2 font-bold">
                Item
              </th>
              <th scope="col" className="px-2 py-1.5 text-right font-bold">
                1º ano
              </th>
              <th scope="col" className="py-1.5 pl-2 text-right font-bold">
                Por mês depois
              </th>
            </tr>
          </thead>
          <tbody>
            {c.linhas.map((l) => (
              <tr key={l.id + l.label} className="border-t border-night-line-2 align-top">
                <th scope="row" className="py-2 pr-2 text-left font-normal">
                  {l.label}
                  {l.nota && <span className="block text-xs text-moon-muted">{l.nota}</span>}
                </th>
                <td className="num px-2 py-2 text-right print:whitespace-nowrap">{formatFaixa(l.ano1)}</td>
                <td className="num py-2 pl-2 text-right print:whitespace-nowrap">{formatFaixa(l.mes)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-night-line-2 font-bold">
              <th scope="row" className="py-2 pr-2 text-left">
                Total
              </th>
              <td className="num px-2 py-2 text-right print:whitespace-nowrap">{formatFaixa(c.ano1)}</td>
              <td className="num py-2 pl-2 text-right print:whitespace-nowrap">{formatFaixa(c.mes)}</td>
            </tr>
          </tfoot>
        </table>
        <p className="text-xs text-moon-muted">Totais arredondados para fora: o mínimo para baixo e o máximo para cima.</p>
        {c.alertas.map((a) => (
          <p key={a} className="flex items-start gap-2 text-sm leading-relaxed">
            <span className="mt-0.5 shrink-0 text-[#ffc857]">
              <Icon name="alert" size={16} />
            </span>
            {ORCAMENTO_DATA.alertas[a].texto}
          </p>
        ))}
      </div>
    </li>
  );
}

function PremissasTabela() {
  const d = ORCAMENTO_DATA;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Cobrança</th>
            <th scope="col">1º ano</th>
            <th scope="col">Depois</th>
            <th scope="col">Critério</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(d.premissas).map((p) => (
            <tr key={p.id}>
              <th scope="row">{p.label}</th>
              <td>{COBRANCA[p.cobranca]}</td>
              <td>{formatFaixa(p.primeiroAno)}</td>
              <td>{p.cobranca === "unico" ? "—" : formatFaixa(p.depois)}</td>
              <td>{p.base}</td>
            </tr>
          ))}
          <tr>
            <th scope="row">Projeto (freelancer e agência)</th>
            <td>uma vez</td>
            <td colSpan={2}>varia com o tipo de site</td>
            <td>{d.textosBase.projeto}</td>
          </tr>
          <tr>
            <th scope="row">Redação dos textos</th>
            <td>uma vez</td>
            <td colSpan={2}>varia com o tipo de site</td>
            <td>{d.textosBase.redacao}</td>
          </tr>
          <tr>
            <th scope="row">Horas do seu tempo</th>
            <td>horas</td>
            <td colSpan={2}>varia com o caminho e o tipo</td>
            <td>{d.textosBase.horas}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const errCls = "border-down-night focus:border-down-night";

// ───────────── Página ─────────────

export default function ToolOrcamento() {
  const [s, setS] = useState<OrcamentoState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"none" | "saved" | "nostorage">("none");
  const [today, setToday] = useState(ORCAMENTO_DATA.updatedAt); // no servidor, a data fixa dos dados: sem "premissas vencidas" no HTML
  const [caixasTxt, setCaixasTxt] = useState(String(DEFAULT_STATE.caixas));
  const [horaTxt, setHoraTxt] = useState("");
  const [open, setOpen] = useState<Record<CaminhoId, boolean>>({ ia: false, construtor: false, wordpress: false, freelancer: false, agencia: false });
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [live, setLive] = useState("");

  const set = <K extends keyof OrcamentoState>(k: K, v: OrcamentoState[K]) => setS((p) => ({ ...p, [k]: v }));
  const est = useMemo(() => estimate(s, today), [s, today]);
  const caixasBad = caixasTxt.trim() !== "" && !(/^\d+$/.test(caixasTxt.trim()) && Number(caixasTxt) <= 50);
  const caixasEmpty = caixasTxt.trim() === "";
  const horaBad = horaTxt.trim() !== "" && !(/^\d+$/.test(horaTxt.trim()) && Number(horaTxt) >= 1 && Number(horaTxt) <= 2000);
  const escala = est ? Math.max(1, ...est.caminhos.map((c) => c.ano1.max)) : 1;

  function aplicar(next: OrcamentoState) {
    setS(next);
    setCaixasTxt(String(next.caixas));
    setHoraTxt(next.valorHora ? String(next.valorHora) : "");
  }

  // Rascunho: lê uma vez no navegador (o servidor sempre renderiza o estado inicial) e só grava depois de ler.
  useEffect(() => {
    setToday(todayInBrazil());
    const d = parseDraft(loadOrcDraft());
    if (d) aplicar(d);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      if (isDefaultLike(s)) {
        clearOrcDraft();
        setSaveStatus("none");
      } else setSaveStatus(saveOrcDraft(JSON.stringify(s)) ? "saved" : "nostorage");
    }, 500);
    return () => clearTimeout(t);
  }, [s, loaded]);

  // Aviso ao leitor de tela só na primeira vez que a estimativa aparece.
  const avisou = useRef(false);
  useEffect(() => {
    if (est && !avisou.current) {
      avisou.current = true;
      if (loaded) setLive("Estimativa pronta: 5 caminhos.");
    }
    if (!est) avisou.current = false;
  }, [est, loaded]);

  function onCaixas(v: string) {
    setCaixasTxt(v);
    const t = v.trim();
    if (/^\d+$/.test(t) && Number(t) <= 50) set("caixas", Number(t));
  }
  function stepCaixas(delta: number) {
    const n = Math.min(50, Math.max(0, s.caixas + delta));
    set("caixas", n);
    setCaixasTxt(String(n));
  }
  function onHora(v: string) {
    setHoraTxt(v);
    const t = v.trim();
    if (t === "") set("valorHora", null);
    else if (/^\d+$/.test(t) && Number(t) >= 1 && Number(t) <= 2000) set("valorHora", Number(t));
  }

  function onExample() {
    if (!isDefaultLike(s) && !window.confirm("Trocar o que você escolheu pelo exemplo?")) return;
    aplicar(EXAMPLE_STATE);
    setLive("Exemplo preenchido.");
  }
  function onClear() {
    if (!isDefaultLike(s) && !window.confirm("Apagar as escolhas e o rascunho salvo neste navegador?")) return;
    aplicar(DEFAULT_STATE);
    clearOrcDraft();
    setSaveStatus("none");
    setLive("Campos limpos e rascunho apagado.");
    document.querySelector<HTMLElement>('[role="radiogroup"][aria-labelledby="orc-tipo-t"] button')?.focus();
  }

  const toggleRecurso = (id: RecursoId) => setS((p) => ({ ...p, recursos: p.recursos.includes(id) ? p.recursos.filter((x) => x !== id) : [...p.recursos, id] }));
  const resumo = est ? buildResumo(s, est, today) : "";

  async function onCopy() {
    const ok = await copyText(resumo);
    setCopyFailed(!ok);
    if (ok) {
      setCopied(true);
      setLive("Copiado.");
      setTimeout(() => setCopied(false), 1800);
    }
  }

  const tipoLabel = TIPOS.find((t) => t.id === s.tipo)?.label;
  const iaAberto = open.ia;
  const stale = est?.stale ?? false;

  return (
    <ToolLayout
      tool={tool}
      lead="Escolha o tipo de site e o que ele precisa e veja, em faixas, quanto custa montar e manter: no 1º ano e por mês depois, em 5 caminhos, do faça você mesmo à agência. Tudo fica no seu navegador."
      explain={
        <>
          <h2>Como a conta é feita</h2>
          <p>
            Cada escolha acrescenta linhas a cada um dos 5 caminhos: domínio, hospedagem ou plano da plataforma, e-mail, temas e plugins, imagens, textos e manutenção. O 1º ano soma o que se
            paga para montar o site com 12 meses dos custos fixos, nos preços de entrada. A coluna “por mês depois” mostra o que fica a partir do 2º ano, já com o preço de renovação, e os
            custos anuais divididos por 12. Os totais são arredondados para fora: o mínimo para baixo e o máximo para cima.
          </p>
          <h2>Os 5 caminhos</h2>
          <ul>
            <li>
              <strong>Fazer sozinho com IA</strong>: você pede o site a um assistente de IA e publica numa hospedagem. Custa pouco em dinheiro e bastante em tempo; veja{" "}
              <Link to="/guias/criar-site-com-ia-do-jeito-certo">como criar site com IA do jeito certo</Link>.
            </li>
            <li>
              <strong>Construtor de sites</strong>: o plano mensal inclui editor e hospedagem. É o mais simples de começar e o mais difícil de levar para outro lugar.
            </li>
            <li>
              <strong>WordPress (você monta)</strong>: hospedagem, tema e plugins por sua conta, com mais liberdade e atualização todo mês. A comparação completa está em{" "}
              <Link to="/guias/wordpress-ou-construtor-de-sites">WordPress ou construtor de sites</Link>.
            </li>
            <li>
              <strong>Contratar freelancer</strong> e <strong>contratar agência</strong>: você paga o projeto e participa com conversas, textos e revisões. A agência costuma custar mais e
              entregar com mais gente e mais processo.
            </li>
          </ul>
          <h2>O que não entra na conta</h2>
          <p>
            Taxa por venda de quem recebe pagamento on-line, anúncios pagos, fotos profissionais, logotipo, posts de blog depois do lançamento, impostos e o seu tempo em dinheiro (ele aparece
            separado, se você informar o valor da sua hora).
          </p>
          <h2>Por que faixas, e não um preço</h2>
          <p>
            O preço de hospedagem, domínio e plataforma muda com promoções, com o dólar e com o plano escolhido, e o de um projeto muda com quem faz e com o que está incluído. Um número único
            passaria uma certeza que não existe. As faixas mostram a ordem de grandeza para você planejar e comparar; antes de contratar, confira o preço do dia na empresa e peça orçamento por
            escrito.
          </p>
          <h2 id="premissas">Premissas e fontes</h2>
          <p>
            Revisadas em {formatDateBR(ORCAMENTO_DATA.updatedAt)}. Revisamos a cada 6 meses; passado esse prazo, a calculadora avisa.
          </p>
          <PremissasTabela />
          <h2>Ninguém paga para aparecer aqui</h2>
          <p>
            Nenhuma empresa paga para entrar nesta calculadora, e ela não cita marcas: as faixas valem para o mercado, não para uma empresa. O CriaSite participa do programa de afiliados de uma
            empresa de hospedagem, com aviso no <Link to="/guias/como-escolher-a-hospedagem-do-site">guia de hospedagem</Link>; isso não entra na conta, nas faixas nem na ordem dos
            caminhos, que é sempre a mesma.
          </p>
          <h2>O rascunho fica no seu navegador</h2>
          <p>
            Nada do que você escolhe é enviado para o CriaSite nem para outro servidor. As escolhas ficam salvas no armazenamento local deste navegador para você voltar depois; “Limpar
            tudo” apaga.
          </p>
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
      <ToolPanel className="orc-panel">
        <div className="orc-form flex flex-wrap items-center justify-between gap-3">
          <DraftStatus status={saveStatus} />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <a href="#estimativa" className="inline-flex min-h-11 items-center text-sm font-bold text-glow underline-offset-4 hover:underline lg:hidden">
              Ver a estimativa
            </a>
            <button type="button" onClick={onExample} className={btnGhostCls}>
              Preencher com exemplo
            </button>
            <button type="button" onClick={onClear} className="min-h-11 px-2 text-sm font-bold text-moon-muted underline-offset-4 hover:text-moon hover:underline">
              Limpar tudo
            </button>
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {live}
        </p>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
          {/* ───── Formulário ───── */}
          <div className="orc-form flex min-w-0 flex-col gap-6">
            <Section n={1} title="O site" help="Escolha o que mais se parece com o seu site.">
              <Subtitle id="orc-tipo-t" srOnly>
                Tipo de site
              </Subtitle>
              <RadioGroup
                labelledBy="orc-tipo-t"
                variant="card"
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                value={s.tipo}
                onChange={(v) => set("tipo", v)}
                options={TIPOS.map((t) => ({ v: t.id, label: t.label, desc: t.desc }))}
              />
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
                <input type="checkbox" checked={s.grande} onChange={(e) => set("grande", e.target.checked)} className="h-5 w-5 shrink-0 accent-[var(--color-brand)]" />
                Site grande (mais de 15 páginas ou mais de 100 produtos)
              </label>
            </Section>

            <Section n={2} title="O que ele precisa" help="Marque só o que precisa no começo. Botão do WhatsApp não custa nada e não entra aqui.">
              <Subtitle id="orc-rec-t" srOnly>
                Recursos
              </Subtitle>
              <div role="group" aria-labelledby="orc-rec-t" className="flex flex-wrap gap-2">
                {RECURSOS.map((r) => {
                  const incluso = (r.id === "pagamento" && s.tipo === "loja") || (r.id === "blog" && s.tipo === "blog");
                  return (
                    <Chip key={r.id} on={incluso || s.recursos.includes(r.id)} disabled={incluso} onClick={() => toggleRecurso(r.id)} describedBy={incluso ? "orc-rec-nota" : undefined}>
                      {r.label}
                    </Chip>
                  );
                })}
              </div>
              {s.tipo === "loja" && (
                <p id="orc-rec-nota" className="text-xs text-moon-muted">
                  Pagamento já está incluso na loja.
                </p>
              )}
              {s.tipo === "blog" && (
                <p id="orc-rec-nota" className="text-xs text-moon-muted">
                  Blog já é o tipo escolhido.
                </p>
              )}
            </Section>

            <Section n={3} title="Domínio e e-mail" help="O domínio é o endereço; o e-mail usa o mesmo nome (voce@seusite.com.br).">
              <Subtitle id="orc-dom-t">Domínio</Subtitle>
              <RadioGroup labelledBy="orc-dom-t" variant="pill" value={s.dominio} onChange={(v) => v && set("dominio", v)} options={DOMINIOS.map((d) => ({ v: d.id, label: d.label }))} />
              <Box label="Caixas de e-mail" id="orc-caixas">
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Menos uma caixa" onClick={() => stepCaixas(-1)} className="grid min-h-11 w-11 place-items-center rounded-xl border border-night-line-2 text-lg font-bold hover:border-glow">
                    −
                  </button>
                  <input
                    id="orc-caixas"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={caixasTxt}
                    onChange={(e) => onCaixas(e.target.value)}
                    aria-invalid={caixasBad || caixasEmpty || undefined}
                    aria-describedby={caixasBad || caixasEmpty ? "orc-caixas-erro" : s.caixas === 0 ? "orc-caixas-zero" : undefined}
                    className={cx(inputCls, "num w-20 text-center", (caixasBad || caixasEmpty) && errCls)}
                  />
                  <button type="button" aria-label="Mais uma caixa" onClick={() => stepCaixas(1)} className="grid min-h-11 w-11 place-items-center rounded-xl border border-night-line-2 text-lg font-bold hover:border-glow">
                    +
                  </button>
                </div>
                {(caixasBad || caixasEmpty) && (
                  <p id="orc-caixas-erro" className="text-sm text-down-night">
                    Use um número de 0 a 50.
                  </p>
                )}
                {!caixasBad && !caixasEmpty && s.caixas === 0 && (
                  <p id="orc-caixas-zero" className="text-xs text-moon-muted">
                    Sem e-mail por enquanto.
                  </p>
                )}
              </Box>
              <Subtitle id="orc-email-t">Tipo de e-mail</Subtitle>
              <div inert={s.caixas === 0} className={cx(s.caixas === 0 && "opacity-50")}>
                <RadioGroup labelledBy="orc-email-t" variant="pill" value={s.emailTipo} onChange={(v) => v && set("emailTipo", v)} options={EMAIL_TIPOS.map((d) => ({ v: d.id, label: d.label }))} />
              </div>
            </Section>

            <Section n={4} title="Conteúdo e manutenção" help="Quem faz o quê depois que o site estiver no ar.">
              <Subtitle id="orc-img-t">Imagens</Subtitle>
              <RadioGroup labelledBy="orc-img-t" variant="pill" value={s.imagens} onChange={(v) => v && set("imagens", v)} options={IMAGENS.map((d) => ({ v: d.id, label: d.label }))} />
              <Subtitle id="orc-txt-t">Textos</Subtitle>
              <RadioGroup labelledBy="orc-txt-t" variant="pill" value={s.textos} onChange={(v) => v && set("textos", v)} options={TEXTOS.map((d) => ({ v: d.id, label: d.label }))} />
              <Subtitle id="orc-man-t">Manutenção</Subtitle>
              <RadioGroup labelledBy="orc-man-t" variant="pill" value={s.manutencao} onChange={(v) => v && set("manutencao", v)} options={MANUTENCOES.map((d) => ({ v: d.id, label: d.label }))} />
            </Section>

            <Section n={5} title="Seu tempo (opcional)" help="Se quiser, diga quanto vale uma hora sua. O tempo aparece em reais ao lado, mas não entra no total.">
              <Box label="Valor da sua hora, em reais" id="orc-hora">
                <div className="relative">
                  <span aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-moon-muted">
                    R$
                  </span>
                  <input
                    id="orc-hora"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Ex.: 50"
                    value={horaTxt}
                    onChange={(e) => onHora(e.target.value)}
                    aria-invalid={horaBad || undefined}
                    aria-describedby={horaBad ? "orc-hora-erro" : undefined}
                    className={cx(inputCls, "pl-11", horaBad && errCls)}
                  />
                </div>
                {horaBad && (
                  <p id="orc-hora-erro" className="text-sm text-down-night">
                    Use um valor de 1 a 2.000.
                  </p>
                )}
              </Box>
            </Section>
          </div>

          {/* ───── Resultado ───── */}
          <aside id="estimativa" aria-labelledby="orc-est-t" className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="orc-est-t" className="text-xl font-extrabold">
                Estimativa
              </h2>
              <span className="text-xs text-moon-muted">
                Premissas de {formatDateBR(ORCAMENTO_DATA.updatedAt)}{" "}
                <a href="#premissas" className="text-glow underline underline-offset-4 print:hidden">
                  ver
                </a>
              </span>
            </div>

            {stale && (
              <div className="flex items-start gap-2 rounded-xl border border-[#ffc857] bg-[#ffc857]/10 p-3 text-sm">
                <span className="mt-0.5 shrink-0 text-[#ffc857]">
                  <Icon name="alert" size={16} />
                </span>
                Premissas em revisão: os valores têm mais de 6 meses e podem estar defasados. Use como ordem de grandeza.
              </div>
            )}

            {!est && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-night-line-2 bg-[#081236] px-6 py-12 text-center">
                <span className="text-moon-muted">
                  <Calculator />
                </span>
                <p className="font-extrabold">A estimativa aparece aqui.</p>
                <p className="text-sm text-moon-muted">Escolha o tipo de site para começar ou veja um exemplo pronto.</p>
                <button type="button" onClick={onExample} className={btnGhostCls}>
                  Preencher com exemplo
                </button>
              </div>
            )}

            {est && (
              <>
                <p className="hidden text-sm print:block">
                  {tipoLabel}
                  {s.grande ? " (grande)" : ""} · domínio {DOMINIOS.find((d) => d.id === s.dominio)!.label.toLowerCase()} · {s.caixas} {s.caixas === 1 ? "caixa" : "caixas"} de e-mail · imagens:{" "}
                  {IMAGENS.find((d) => d.id === s.imagens)!.resumo} · textos: {TEXTOS.find((d) => d.id === s.textos)!.resumo} · manutenção: {MANUTENCOES.find((d) => d.id === s.manutencao)!.resumo}
                  {s.recursos.length ? ` · recursos: ${RECURSOS.filter((r) => s.recursos.includes(r.id)).map((r) => r.label.toLowerCase()).join(", ")}` : ""}
                  {s.valorHora ? ` · hora: ${formatBRL(s.valorHora)}` : ""}
                </p>
                <ol aria-label="Comparação dos 5 caminhos" className="flex flex-col gap-3">
                  {est.caminhos.map((c, i) => (
                    <Cartao key={c.id} c={c} first={i === 0} escala={escala} valorHora={s.valorHora} open={open[c.id]} onToggle={() => setOpen((o) => ({ ...o, [c.id]: !o[c.id] }))} />
                  ))}
                </ol>

                <div className="orc-actions flex flex-wrap items-center gap-3">
                  <button type="button" onClick={onCopy} className={btnCls}>
                    {copied ? "Copiado" : "Copiar resumo"}
                  </button>
                  <button type="button" onClick={() => download(resumoFileName(today), resumo, "text/plain;charset=utf-8")} className={btnGhostCls}>
                    Baixar .txt
                  </button>
                  <button type="button" onClick={() => window.print()} className={btnGhostCls}>
                    Imprimir ou salvar PDF
                  </button>
                  {copyFailed && <span className="text-sm text-glow">O navegador bloqueou a cópia. Use “Baixar .txt”.</span>}
                </div>

                <ul className="flex flex-col gap-2">
                  {est.avisos.map((a) => (
                    <li key={a} className="flex items-start gap-2 text-sm leading-relaxed">
                      <span className="mt-0.5 shrink-0 text-moon-muted">
                        <Icon name="info" size={16} />
                      </span>
                      {ORCAMENTO_DATA.avisos[a]}
                    </li>
                  ))}
                </ul>

                <div className="orc-decide flex flex-col gap-2 rounded-2xl border border-night-line-2 bg-night-2 p-4 text-sm">
                  <p className="flex items-center gap-2 font-extrabold">
                    <Icon name="file" size={16} /> Para decidir com calma
                  </p>
                  <ul className="flex flex-col">
                    {[
                      ["/guias/como-escolher-a-hospedagem-do-site", "Como escolher a hospedagem"],
                      ["/guias/wordpress-ou-construtor-de-sites", "WordPress ou construtor de sites"],
                      ["/guias/como-escolher-o-dominio-do-site", "Como escolher o domínio"],
                      ["/guias/email-com-dominio-proprio", "E-mail com domínio próprio"],
                      ["/guias/criar-site-com-ia-do-jeito-certo", "Criar site com IA do jeito certo"],
                      ...(iaAberto ? [["/ferramentas/prompt-para-site", "Gerador de prompt para site"]] : []),
                    ].map(([to, label]) => (
                      <li key={to}>
                        <Link to={to} className="inline-flex min-h-10 items-center font-bold text-glow underline-offset-4 hover:underline">
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </aside>
        </div>

        <div className="orc-form">
          <ToolDisclaimer>
            Roda no seu navegador: nada do que você escolhe aqui sai do seu computador. O rascunho fica salvo só neste navegador; use “Limpar tudo” para apagá-lo. Detalhes na{" "}
            <Link to="/privacidade" className="text-glow underline underline-offset-4">
              política de privacidade
            </Link>
            .
          </ToolDisclaimer>
        </div>
      </ToolPanel>
    </ToolLayout>
  );
}
