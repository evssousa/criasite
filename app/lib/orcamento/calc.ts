// Conta pura da ferramenta "Quanto custa um site" (docs/orcamento-site.md, Partes B, D e E).
// Sem imports de `~/` nem de site.ts; datas como texto AAAA-MM-DD, contas em UTC. Todas as funções recebem `data`
// (padrão ORCAMENTO_DATA) para o teste poder usar dados de mentira.
import { ORCAMENTO_DATA } from "./data.ts";
import type {
  AlertaId,
  AvisoId,
  CaminhoId,
  DominioId,
  EmailTipoId,
  Estimativa,
  Faixa,
  ImagensId,
  IsoDate,
  Linha,
  ManutencaoId,
  OrcamentoData,
  OrcamentoState,
  Premissa,
  PremissaId,
  RecursoId,
  ResultadoCaminho,
  SeloId,
  TextosId,
  TipoId,
} from "./types.ts";

// ───────────── Rótulos de tela ─────────────

export const CAMINHOS: { id: CaminhoId; nome: string }[] = [
  { id: "ia", nome: "Fazer sozinho com IA" },
  { id: "construtor", nome: "Construtor de sites" },
  { id: "wordpress", nome: "WordPress (você monta)" },
  { id: "freelancer", nome: "Contratar freelancer" },
  { id: "agencia", nome: "Contratar agência" },
];

export const TIPOS: { id: TipoId; label: string; desc: string }[] = [
  { id: "pagina-unica", label: "Página única", desc: "Cartão de visita on-line: quem é, o que faz, contato." },
  { id: "institucional", label: "Site institucional", desc: "De 3 a 8 páginas: início, sobre, serviços, contato." },
  { id: "blog", label: "Blog ou site de conteúdo", desc: "Artigos publicados com frequência." },
  { id: "loja", label: "Loja virtual pequena", desc: "Até uns 100 produtos, com carrinho e pagamento." },
];

export const RECURSOS: { id: RecursoId; label: string }[] = [
  { id: "formulario", label: "Formulário de contato" },
  { id: "agendamento", label: "Agendamento on-line" },
  { id: "pagamento", label: "Receber pagamento on-line" },
  { id: "blog", label: "Blog ou notícias" },
  { id: "idiomas", label: "Mais de um idioma" },
  { id: "login", label: "Área de clientes com login" },
];

export const DOMINIOS: { id: DominioId; label: string }[] = [
  { id: "com-br", label: ".com.br" },
  { id: "com", label: ".com" },
  { id: "tenho", label: "Já tenho" },
];

export const EMAIL_TIPOS: { id: EmailTipoId; label: string }[] = [
  { id: "simples", label: "Simples" },
  { id: "suite", label: "Com agenda e documentos" },
];

export const IMAGENS: { id: ImagensId; label: string; resumo: string }[] = [
  { id: "minhas", label: "Fotos minhas", resumo: "minhas fotos" },
  { id: "banco-gratis", label: "Banco grátis", resumo: "banco de imagens grátis" },
  { id: "banco-pago", label: "Banco pago", resumo: "banco de imagens pago" },
];

export const TEXTOS: { id: TextosId; label: string; resumo: string }[] = [
  { id: "eu", label: "Eu escrevo", resumo: "eu escrevo" },
  { id: "contrato", label: "Contrato quem escreva", resumo: "contrato quem escreva" },
];

export const MANUTENCOES: { id: ManutencaoId; label: string; resumo: string }[] = [
  { id: "eu", label: "Eu mesmo", resumo: "eu mesmo" },
  { id: "contrato", label: "Pago alguém por mês", resumo: "pago alguém por mês" },
];

export const SELOS: Record<SeloId, string> = {
  "menor-ano1": "Menor custo no 1º ano",
  "menor-mes": "Menor custo por mês depois",
  "menos-tempo": "Menos do seu tempo",
};

/** Todas as premissas que `buildLines` pode usar: o teste confere que existem nos dados. */
export const REQUIRED_PREMISSAS: PremissaId[] = [
  "dominio-com-br",
  "dominio-com",
  "hosp-estatica",
  "hosp-compartilhada",
  "hosp-loja",
  "construtor-basico",
  "construtor-loja",
  "construtor-app",
  "wp-tema",
  "wp-plugin",
  "wp-loja-extensoes",
  "wp-seguranca",
  "ia-assinatura",
  "ia-servico",
  "email-hosp",
  "email-avulso",
  "email-suite",
  "imagens-banco-pago",
  "manut-freelancer",
  "manut-agencia",
];

const TIPO_IDS = TIPOS.map((t) => t.id);
const CAMINHO_IDS = CAMINHOS.map((c) => c.id);
const RECURSO_IDS = RECURSOS.map((r) => r.id);
const nomeCaminho = (id: CaminhoId) => CAMINHOS.find((c) => c.id === id)!.nome;
const rotuloRecurso = (id: RecursoId) => RECURSOS.find((r) => r.id === id)!.label;

// ───────────── Datas (copiadas do mídia kit para o módulo ficar solto) ─────────────

const DAY_MS = 86_400_000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const toMs = (d: IsoDate) => {
  const [y, m, day] = d.split("-").map(Number);
  return Date.UTC(y, m - 1, day);
};
export function addDays(date: IsoDate, days: number): IsoDate {
  return new Date(toMs(date) + days * DAY_MS).toISOString().slice(0, 10);
}
export function formatDateBR(date: IsoDate): string {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}
/** Data de hoje no Brasil (AAAA-MM-DD). */
export function todayInBrazil(now: Date = new Date()): IsoDate {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(now);
}
function validDate(d: unknown): d is IsoDate {
  return typeof d === "string" && DATE_RE.test(d) && !Number.isNaN(toMs(d)) && new Date(toMs(d)).toISOString().slice(0, 10) === d;
}
export const isStale = (data: OrcamentoData, today: IsoDate): boolean => today > addDays(data.updatedAt, data.validDays);

// ───────────── Faixas e formatação ─────────────

const ZERO: Faixa = { min: 0, max: 0 };
const CEM: Faixa = { min: 100, max: 100 };
const soma = (a: Faixa, b: Faixa): Faixa => ({ min: a.min + b.min, max: a.max + b.max });
const stepFor = (n: number) => (n < 100 ? 1 : n < 1000 ? 10 : n < 10000 ? 50 : 500);

/** Arredonda para fora: o mínimo para baixo e o máximo para cima, cada um no passo do seu tamanho. */
export function roundFaixa(f: Faixa): Faixa {
  const smin = stepFor(f.min);
  const smax = stepFor(f.max);
  return { min: Math.floor(f.min / smin) * smin, max: Math.ceil(f.max / smax) * smax };
}

export function formatBRL(n: number): string {
  return `R$ ${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}
export function formatFaixa(f: Faixa): string {
  if (f.min === 0 && f.max === 0) return "R$ 0";
  return f.min === f.max ? formatBRL(f.min) : `${formatBRL(f.min)} a ${formatBRL(f.max)}`;
}
export function formatHoras(f: Faixa): string {
  if (f.min === 0 && f.max === 0) return "0 h";
  return f.min === f.max ? `${f.min} h` : `${f.min} a ${f.max} h`;
}

// ───────────── Custo de uma linha ─────────────

const pctMul = (f: Faixa, pct: Faixa): Faixa => ({ min: Math.round((f.min * pct.min) / 100), max: Math.round((f.max * pct.max) / 100) });

export function lineCost(p: Premissa, qtd = 1, pct: Faixa = CEM): { ano1: Faixa; mes: Faixa } {
  let ano1: Faixa;
  let mes: Faixa;
  if (p.cobranca === "unico") {
    ano1 = p.primeiroAno;
    mes = ZERO;
  } else if (p.cobranca === "mensal") {
    ano1 = { min: p.primeiroAno.min * 12, max: p.primeiroAno.max * 12 };
    mes = p.depois;
  } else {
    ano1 = p.primeiroAno;
    mes = { min: Math.floor(p.depois.min / 12), max: Math.ceil(p.depois.max / 12) };
  }
  const q = (f: Faixa): Faixa => ({ min: f.min * qtd, max: f.max * qtd });
  return { ano1: pctMul(q(ano1), pct), mes: pctMul(q(mes), pct) };
}

/** Tabelas sem premissa (projeto, redação): valor único vezes o fator. */
export function unicoCost(f: Faixa, pct: Faixa = CEM): { ano1: Faixa; mes: Faixa } {
  return { ano1: pctMul(f, pct), mes: ZERO };
}

// ───────────── Estado, rascunho ─────────────

export const DEFAULT_STATE: OrcamentoState = {
  v: 1,
  tipo: "",
  grande: false,
  recursos: [],
  dominio: "com-br",
  caixas: 1,
  emailTipo: "simples",
  imagens: "minhas",
  textos: "eu",
  manutencao: "eu",
  valorHora: null,
};

export const EXAMPLE_STATE: OrcamentoState = {
  ...DEFAULT_STATE,
  tipo: "institucional",
  recursos: ["formulario", "agendamento"],
  caixas: 2,
  imagens: "banco-gratis",
  valorHora: 50,
};

export function isDefaultLike(s: OrcamentoState): boolean {
  const d = DEFAULT_STATE;
  const mesmos = s.recursos.length === d.recursos.length && s.recursos.every((r) => d.recursos.includes(r));
  return (
    mesmos &&
    s.tipo === d.tipo &&
    s.grande === d.grande &&
    s.dominio === d.dominio &&
    s.caixas === d.caixas &&
    s.emailTipo === d.emailTipo &&
    s.imagens === d.imagens &&
    s.textos === d.textos &&
    s.manutencao === d.manutencao &&
    s.valorHora === d.valorHora
  );
}

const pick = <T extends string>(v: unknown, ids: readonly T[], fallback: T): T => (typeof v === "string" && (ids as readonly string[]).includes(v) ? (v as T) : fallback);

/** Lê o rascunho salvo; qualquer coisa fora do formato vira o valor padrão do campo. */
export function parseDraft(raw: string | null): OrcamentoState | null {
  if (!raw) return null;
  let o: unknown;
  try {
    o = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const r = o as Record<string, unknown>;
  if (r.v !== 1) return null;
  const d = DEFAULT_STATE;
  const recursos = Array.isArray(r.recursos) ? RECURSO_IDS.filter((id) => (r.recursos as unknown[]).includes(id)) : [];
  const caixas = typeof r.caixas === "number" && Number.isInteger(r.caixas) && r.caixas >= 0 && r.caixas <= 50 ? r.caixas : d.caixas;
  const vh = r.valorHora;
  const valorHora = typeof vh === "number" && Number.isInteger(vh) && vh >= 1 && vh <= 2000 ? vh : null;
  return {
    v: 1,
    tipo: pick<TipoId | "">(r.tipo, ["", ...TIPO_IDS], ""),
    grande: r.grande === true,
    recursos,
    dominio: pick(r.dominio, DOMINIOS.map((x) => x.id), d.dominio),
    caixas,
    emailTipo: pick(r.emailTipo, EMAIL_TIPOS.map((x) => x.id), d.emailTipo),
    imagens: pick(r.imagens, IMAGENS.map((x) => x.id), d.imagens),
    textos: pick(r.textos, TEXTOS.map((x) => x.id), d.textos),
    manutencao: pick(r.manutencao, MANUTENCOES.map((x) => x.id), d.manutencao),
    valorHora,
  };
}

/** Recursos que de fato entram na conta: loja já inclui pagamento e blog já é o tipo. Na ordem de RECURSOS. */
export function recursosEfetivos(s: OrcamentoState): RecursoId[] {
  return RECURSO_IDS.filter((id) => s.recursos.includes(id) && !(id === "pagamento" && s.tipo === "loja") && !(id === "blog" && s.tipo === "blog"));
}

// ───────────── A conta ─────────────

function premLinha(data: OrcamentoData, id: PremissaId, opts: { label?: string; qtd?: number; nota?: string } = {}): Linha {
  const p = data.premissas[id];
  const { ano1, mes } = lineCost(p, opts.qtd ?? 1);
  return { id, label: opts.label ?? p.label, qtd: opts.qtd, nota: opts.nota, ano1, mes, premissa: id };
}

export function buildLines(state: OrcamentoState, caminho: CaminhoId, data: OrcamentoData = ORCAMENTO_DATA): Linha[] {
  const T = state.tipo as TipoId;
  const G = state.grande ? data.fatorGrandePct : CEM;
  const R = recursosEfetivos(state);
  const loja = T === "loja";
  const contrata = caminho === "freelancer" || caminho === "agencia";
  const linhas: Linha[] = [];

  // 1. Domínio
  if (state.dominio === "com-br") linhas.push(premLinha(data, "dominio-com-br"));
  else if (state.dominio === "com") linhas.push(premLinha(data, "dominio-com"));

  // 2. Plataforma e hospedagem
  const iaEstatica = caminho === "ia" && !loja && !R.includes("login");
  if (caminho === "ia") {
    linhas.push(premLinha(data, loja ? "hosp-loja" : R.includes("login") ? "hosp-compartilhada" : "hosp-estatica"));
    linhas.push(premLinha(data, "ia-assinatura"));
  } else if (caminho === "construtor") {
    linhas.push(premLinha(data, loja ? "construtor-loja" : "construtor-basico"));
  } else if (caminho === "wordpress") {
    linhas.push(premLinha(data, loja ? "hosp-loja" : "hosp-compartilhada"));
    if (loja) linhas.push(premLinha(data, "wp-loja-extensoes"));
    linhas.push(premLinha(data, "wp-tema"), premLinha(data, "wp-seguranca"));
  } else {
    linhas.push(premLinha(data, loja ? "hosp-loja" : "hosp-compartilhada"));
    const { ano1, mes } = unicoCost(data.projeto[caminho][T], G);
    linhas.push({ id: "projeto", label: "Projeto (criação do site)", nota: "tema e plugins incluídos no projeto", ano1, mes });
  }

  // 3. Recursos
  for (const r of R) {
    const regra = data.recursos[r][caminho];
    if (contrata) {
      if (regra.projeto) {
        const { ano1, mes } = unicoCost(regra.projeto, G);
        linhas.push({ id: `recurso-${r}`, label: rotuloRecurso(r), ano1, mes });
      }
    } else if (regra.premissa) {
      linhas.push(premLinha(data, regra.premissa, { label: `${data.premissas[regra.premissa].label}: ${rotuloRecurso(r)}` }));
    }
  }

  // 4. E-mail
  if (state.caixas > 0) {
    const id: PremissaId = state.emailTipo === "suite" ? "email-suite" : caminho === "construtor" || iaEstatica ? "email-avulso" : "email-hosp";
    const n = state.caixas;
    linhas.push(premLinha(data, id, { qtd: n, label: `${data.premissas[id].label} (${n} ${n === 1 ? "caixa" : "caixas"})` }));
  }

  // 5. Imagens
  if (state.imagens === "banco-pago") linhas.push(premLinha(data, "imagens-banco-pago"));

  // 6. Textos
  if (state.textos === "contrato") {
    const { ano1, mes } = unicoCost(data.redacao[T], G);
    linhas.push({ id: "redacao", label: "Redação dos textos", ano1, mes });
  }

  // 7. Manutenção
  if (state.manutencao === "contrato") linhas.push(premLinha(data, caminho === "agencia" ? "manut-agencia" : "manut-freelancer"));

  return linhas;
}

export function horasMontar(state: OrcamentoState, caminho: CaminhoId, data: OrcamentoData = ORCAMENTO_DATA): Faixa {
  const T = state.tipo as TipoId;
  const G = state.grande ? data.fatorGrandePct : CEM;
  const R = recursosEfetivos(state);
  const contrata = caminho === "freelancer" || caminho === "agencia";
  let base = data.horas[caminho][T];
  base = pctMul(base, G);
  if (!contrata && R.includes("idiomas")) base = pctMul(base, data.fatorIdiomasPct);
  let total = base;
  for (const r of R) {
    const h = data.recursos[r][caminho].horas;
    if (h) total = soma(total, h);
  }
  if (state.textos === "eu") total = soma(total, pctMul(data.horasTextos[T], G));
  return { min: Math.round(total.min), max: Math.round(total.max) };
}

export function horasPorMes(state: OrcamentoState, caminho: CaminhoId, data: OrcamentoData = ORCAMENTO_DATA): Faixa {
  return state.manutencao === "eu" ? data.horasMes[caminho] : { min: 0, max: 1 };
}

function alertasDe(state: OrcamentoState, caminho: CaminhoId): AlertaId[] {
  const R = recursosEfetivos(state);
  const out: AlertaId[] = [];
  if (caminho === "ia") {
    if (state.tipo === "loja") out.push("ia-loja");
    if (R.includes("login")) out.push("ia-login");
    if (R.includes("blog") || state.tipo === "blog") out.push("ia-blog");
  } else if (caminho === "construtor") out.push("construtor-saida");
  else if (caminho === "wordpress") out.push("wp-atualizacoes");
  else out.push("contratar-escopo");
  return out;
}

function avisosDe(state: OrcamentoState): AvisoId[] {
  const out: AvisoId[] = ["sempre-faixa", "renovacao"];
  if (state.tipo === "loja" || state.recursos.includes("pagamento")) out.push("taxa-venda");
  if (state.dominio === "tenho") out.push("dominio-tenho");
  if (state.imagens === "banco-gratis") out.push("banco-gratis");
  if (state.grande) out.push("grande");
  out.push("fontes");
  return out;
}

const meio = (f: Faixa) => (f.min + f.max) / 2;

function aplicarSelos(caminhos: ResultadoCaminho[]): void {
  const regras: [SeloId, (c: ResultadoCaminho) => number][] = [
    ["menor-ano1", (c) => meio(c.ano1)],
    ["menor-mes", (c) => meio(c.mes)],
    ["menos-tempo", (c) => meio(c.horasMontar)],
  ];
  for (const [selo, valor] of regras) {
    const vs = caminhos.map(valor);
    const menor = Math.min(...vs);
    if (vs.every((v) => v === menor)) continue; // todos empatados: o selo não diz nada
    caminhos.forEach((c, i) => {
      if (vs[i] === menor) c.selos.push(selo);
    });
  }
}

/** `null` enquanto não há tipo de site escolhido. */
export function estimate(state: OrcamentoState, today: IsoDate, data: OrcamentoData = ORCAMENTO_DATA): Estimativa | null {
  if (state.tipo === "") return null;
  const s: OrcamentoState = { ...state, caixas: Number.isInteger(state.caixas) ? Math.min(50, Math.max(0, state.caixas)) : 1 };
  const caminhos: ResultadoCaminho[] = CAMINHO_IDS.map((id) => {
    const linhas = buildLines(s, id, data);
    const ano1Bruto = linhas.reduce((a, l) => soma(a, l.ano1), ZERO);
    const mesBruto = linhas.reduce((a, l) => soma(a, l.mes), ZERO);
    return {
      id,
      nome: nomeCaminho(id),
      linhas,
      ano1: roundFaixa(ano1Bruto),
      mes: roundFaixa(mesBruto),
      ano1Bruto,
      mesBruto,
      horasMontar: horasMontar(s, id, data),
      horasMes: horasPorMes(s, id, data),
      alertas: alertasDe(s, id),
      selos: [],
    };
  });
  aplicarSelos(caminhos);
  return { caminhos, avisos: avisosDe(s), stale: isStale(data, today) };
}

// ───────────── Resumo em texto ─────────────

function quebra(texto: string, largura: number, prefixo: string, continuacao: string): string[] {
  const linhas: string[] = [];
  let atual = prefixo;
  let vazio = true;
  for (const palavra of texto.split(" ")) {
    if (!vazio && atual.length + 1 + palavra.length > largura) {
      linhas.push(atual);
      atual = continuacao + palavra;
    } else {
      atual += (vazio ? "" : " ") + palavra;
    }
    vazio = false;
  }
  linhas.push(atual);
  return linhas;
}

export function resumoFileName(today: IsoDate): string {
  return `orcamento-site-${today}.txt`;
}

export function buildResumo(state: OrcamentoState, est: Estimativa, today: IsoDate, data: OrcamentoData = ORCAMENTO_DATA, siteUrl = "https://criasite.app"): string {
  const L: string[] = [];
  const tipo = TIPOS.find((t) => t.id === state.tipo)?.label ?? "";
  const recursos = state.recursos.length === 0 ? "nenhum extra" : RECURSOS.filter((r) => state.recursos.includes(r.id)).map((r) => r.label).join(", ");
  const email =
    state.caixas === 0
      ? "não preciso agora"
      : `${state.caixas} ${state.caixas === 1 ? "caixa" : "caixas"}, ${state.emailTipo === "suite" ? "com agenda e documentos" : "simples"}`;

  L.push("Quanto custa o meu site: estimativa do CriaSite");
  L.push(`Feita em ${formatDateBR(today)} · premissas revisadas em ${formatDateBR(data.updatedAt)}`);
  L.push("");
  L.push("O QUE VOCÊ INFORMOU");
  L.push(`- Tipo: ${tipo}`);
  if (state.grande) L.push("- Site grande (mais de 15 páginas ou 100 produtos)");
  L.push(...quebra(`Recursos: ${recursos}`, 100, "- ", "  "));
  L.push(`- Domínio: ${DOMINIOS.find((d) => d.id === state.dominio)!.label.toLowerCase()}`);
  L.push(`- E-mail: ${email}`);
  L.push(`- Imagens: ${IMAGENS.find((i) => i.id === state.imagens)!.resumo}`);
  L.push(`- Textos: ${TEXTOS.find((t) => t.id === state.textos)!.resumo}`);
  L.push(`- Manutenção: ${MANUTENCOES.find((m) => m.id === state.manutencao)!.resumo}`);
  L.push("");
  L.push("COMPARAÇÃO (1º ano = montar + 12 meses)");
  for (const c of est.caminhos) {
    const selos = c.selos.length ? ` ${c.selos.map((s) => `[${SELOS[s]}]`).join(" ")}` : "";
    L.push(`${c.nome}${selos}`);
    L.push(`  1º ano: ${formatFaixa(c.ano1)} · por mês depois: ${formatFaixa(c.mes)}`);
    L.push(`  Seu tempo: ${formatHoras(c.horasMontar)} para montar, ${formatHoras(c.horasMes)} por mês`);
    if (state.valorHora) {
      const v: Faixa = { min: c.horasMontar.min * state.valorHora, max: c.horasMontar.max * state.valorHora };
      L.push(`  No seu valor de hora (${formatBRL(state.valorHora)}): ${formatFaixa(v)}, fora do custo acima`);
    }
    for (const a of c.alertas) L.push(...quebra(data.alertas[a].texto, 100, "  Atenção: ", "    "));
    L.push("");
  }
  L.push("AVISOS");
  if (est.stale) L.push(...quebra("Premissas em revisão: os valores têm mais de 6 meses e podem estar defasados. Use como ordem de grandeza.", 100, "- ", "  "));
  for (const a of est.avisos) L.push(...quebra(data.avisos[a], 100, "- ", "  "));
  L.push("");
  L.push("Estimativa em faixas, não é orçamento nem oferta. Os preços mudam: confira nas empresas antes de contratar.");
  L.push(`Premissas e critérios: ${siteUrl}/ferramentas/quanto-custa-um-site#premissas`);
  return L.join("\n") + "\n";
}

// ───────────── Validação dos dados ─────────────

const EMPRESAS =
  /\b(hostinger|locaweb|hostgator|kinghost|umbler|godaddy|wix|squarespace|shopify|nuvemshop|tray|loja integrada|webflow|hostnet|google workspace|microsoft 365|zoho|envato|themeforest|elementor|wordpress\.com)\b/i;
const PROMESSA = /(garantid|oficial|exato|melhor preço|mais barato do mercado|promoção imperdível)/i;
const LINK = /(http|www\.|ref=|utm_|referral|afiliad)/i;

function faixaErro(nome: string, f: Faixa | undefined): string | null {
  if (!f || typeof f.min !== "number" || typeof f.max !== "number") return `${nome}: faixa ausente`;
  if (!Number.isInteger(f.min) || !Number.isInteger(f.max)) return `${nome}: use números inteiros`;
  if (f.min < 0 || f.max < 0) return `${nome}: valor negativo`;
  if (f.min > f.max) return `${nome}: mínimo maior que o máximo`;
  return null;
}

/** Lista de erros dos dados (vazia = ok). */
export function validateData(data: OrcamentoData, today: IsoDate): string[] {
  const erros: string[] = [];
  const add = (e: string | null) => e && erros.push(e);

  if (!validDate(data.updatedAt)) erros.push(`updatedAt inválido (${String(data.updatedAt)})`);
  else if (data.updatedAt > today) erros.push("updatedAt no futuro");
  if (!Number.isInteger(data.validDays) || data.validDays < 30 || data.validDays > 365) erros.push("validDays fora de 30 a 365");

  for (const id of REQUIRED_PREMISSAS) if (!data.premissas[id]) erros.push(`premissa ausente: ${id}`);
  for (const [chave, p] of Object.entries(data.premissas)) {
    if (p.id !== chave) erros.push(`premissa ${chave}: id diferente da chave`);
    if (!p.base || p.base.length < 30) erros.push(`premissa ${chave}: critério (base) com menos de 30 caracteres`);
    if (p.cobranca === "unico" && (p.depois.min !== 0 || p.depois.max !== 0)) erros.push(`premissa ${chave}: cobrança única com "depois" diferente de zero`);
    add(faixaErro(`premissa ${chave} (1º ano)`, p.primeiroAno));
    add(faixaErro(`premissa ${chave} (depois)`, p.depois));
  }

  for (const c of CAMINHO_IDS) {
    if (!data.horas[c]) erros.push(`horas: falta o caminho ${c}`);
    else for (const t of TIPO_IDS) add(data.horas[c][t] ? faixaErro(`horas ${c}/${t}`, data.horas[c][t]) : `horas: falta ${c}/${t}`);
    add(data.horasMes[c] ? faixaErro(`horasMes ${c}`, data.horasMes[c]) : `horasMes: falta ${c}`);
  }
  for (const t of TIPO_IDS) {
    add(data.horasTextos[t] ? faixaErro(`horasTextos ${t}`, data.horasTextos[t]) : `horasTextos: falta ${t}`);
    add(data.redacao[t] ? faixaErro(`redacao ${t}`, data.redacao[t]) : `redacao: falta ${t}`);
    for (const c of ["freelancer", "agencia"] as const) add(data.projeto[c][t] ? faixaErro(`projeto ${c}/${t}`, data.projeto[c][t]) : `projeto: falta ${c}/${t}`);
  }
  for (const r of RECURSO_IDS) {
    for (const c of CAMINHO_IDS) {
      const regra = data.recursos[r]?.[c];
      if (!regra) {
        erros.push(`recursos: falta ${r}/${c}`);
        continue;
      }
      if (regra.horas) add(faixaErro(`recursos ${r}/${c} (horas)`, regra.horas));
      if (regra.projeto) add(faixaErro(`recursos ${r}/${c} (projeto)`, regra.projeto));
      if (regra.premissa && !data.premissas[regra.premissa]) erros.push(`recursos ${r}/${c}: premissa ${regra.premissa} não existe`);
    }
  }
  add(faixaErro("fatorGrandePct", data.fatorGrandePct));
  add(faixaErro("fatorIdiomasPct", data.fatorIdiomasPct));

  const textos: string[] = [
    ...Object.values(data.premissas).flatMap((p) => [p.label, p.base, p.nota ?? ""]),
    data.textosBase.projeto,
    data.textosBase.redacao,
    data.textosBase.horas,
    ...Object.values(data.alertas).flatMap((a) => [a.chip, a.texto]),
    ...Object.values(data.avisos),
    ...CAMINHOS.map((c) => c.nome),
    ...RECURSOS.map((r) => r.label),
  ];
  for (const t of textos) {
    if (EMPRESAS.test(t)) erros.push(`nome de empresa nos dados: "${t.slice(0, 50)}"`);
    if (PROMESSA.test(t)) erros.push(`palavra de promessa nos dados: "${t.slice(0, 50)}"`);
    if (LINK.test(t)) erros.push(`link ou afiliado nos dados: "${t.slice(0, 50)}"`);
  }
  return erros;
}
