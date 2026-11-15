// Checagem de qualidade e SEO das matérias do robô (pura, sem rede). Base: a do Respawnou (que veio
// do Anime Profile), com as regras do CriaSite: nada de promessa de resultado ou tom de propaganda
// de preço apresentada como fato. Problemas viram uma lista que volta para o Gemini refazer; o que
// tem troca segura é corrigido aqui, sem gastar outra chamada.
import { countWords, numbersIn } from "./text.ts";

export type DraftBlock = { type: "p" | "h2" | "h3" | "ul" | "quote"; text?: string; items?: string[] };

export interface DraftArticle {
  focusKeyword: string;
  title: string;
  titleAlternatives?: string[];
  metaDescription: string;
  excerpt: string;
  body: DraftBlock[];
}

export const TITLE_MIN = 30;
export const TITLE_MAX = 70;
export const META_MIN = 110;
export const META_MAX = 160;

// ───────────── Links no texto: [texto](url) ─────────────

const LINK = /\[([^\]\n]{1,160})\]\(([^)\s]{1,600})\)/g;

/** Texto sem a marcação de link (fica só o texto do link). */
export const plainText = (s: string) => s.replace(LINK, "$1");

export const blockText = (b: DraftBlock) => plainText(b.type === "ul" ? (b.items ?? []).join(" ") : (b.text ?? ""));

export function linksIn(s: string) {
  return [...s.matchAll(LINK)].map((m) => ({ text: m[1], url: m[2] }));
}

const normUrl = (u: string) => u.replace(/[?#].*$/, "").replace(/\/+$/, "").toLowerCase();

/**
 * Mantém só links da lista permitida (links inventados viram texto: dariam 404 ou levariam a
 * site desconhecido). No máximo 1 link por endereço no texto todo.
 */
export function sanitizeLinks(input: DraftBlock[], allowed: string[]): { body: DraftBlock[]; removed: string[] } {
  const ok = new Map(allowed.map((u) => [normUrl(u), u]));
  const used = new Set<string>();
  const removed: string[] = [];
  const unlink = (s: string, keep: (url: string) => boolean) => s.replace(LINK, (m, text: string, url: string) => (keep(url) ? m : text));

  // Regra do guia editorial, aplicada aqui sem gastar nova chamada ao Gemini: sem link no lide (1º parágrafo).
  // Feito antes de contar os links usados, para o lide não "gastar" o endereço de uma fonte.
  const lead = input.findIndex((b) => b.type === "p");
  const body = input.map((b, i) => {
    if (i !== lead) return b;
    const text = unlink(b.text ?? "", () => false);
    if (text !== (b.text ?? "")) removed.push("link do lide");
    return { ...b, text };
  });

  const fix = (s: string) =>
    s.replace(LINK, (_m, text: string, url: string) => {
      const key = normUrl(url);
      const real = ok.get(key);
      if (!real) {
        removed.push(url);
        return text;
      }
      if (used.has(key)) return text;
      used.add(key);
      return `[${text}](${real})`;
    });
  const fixed = body.map((b) => (b.type === "ul" ? { ...b, items: (b.items ?? []).map(fix) } : { ...b, text: fix(b.text ?? "") }));

  // No máximo MAX_EXTERNAL links externos (os primeiros ficam).
  let external = 0;
  const capExternal = (s: string) =>
    unlink(s, (url) => {
      if (url.startsWith("/")) return true;
      external++;
      if (external <= MAX_EXTERNAL) return true;
      removed.push(url);
      return false;
    });
  const capped = fixed.map((b) => (b.type === "ul" ? { ...b, items: (b.items ?? []).map(capExternal) } : { ...b, text: capExternal(b.text ?? "") }));
  return { body: capped, removed };
}

/** Máximo de links externos por notícia (o guia editorial pede 1 a 2). */
const MAX_EXTERNAL = 2;

// ───────────── Expressões de texto de IA ─────────────

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const BANNED = [
  "em um mundo onde",
  "vale ressaltar que",
  "vale lembrar que",
  "em suma",
  "em resumo",
  "nao e a toa que",
  "prepare-se",
  "fique ligado",
  "sem sombra de duvidas",
  "mergulhe",
  "nesta materia vamos",
  "confira tudo abaixo",
  "promete revolucionar",
  "fique de olho",
  "nao perca",
  "e isso ai",
];

/**
 * Promessas de resultado e tom de propaganda: reprovam a notícia e voltam para o Gemini reescrever.
 */
const ADVICE = [
  "garantia de resultado",
  "resultado garantido",
  "primeira pagina garantida",
  "primeiro lugar garantido",
  "vai triplicar",
  "vai dobrar suas visitas",
  "trafego garantido",
  "vendas garantidas",
  "revolucionar seu site",
  "mudar o jogo",
  "game changer",
  "imperdivel",
  "aproveite agora",
  "nao perca tempo",
];

// Trocas seguras (o resto volta para o Gemini reescrever).
const REPLACE: Record<string, string> = {
  "em um mundo onde": "num cenário em que",
  "vale ressaltar que": "",
  "vale lembrar que": "",
  "em suma": "no geral",
  "em resumo": "no geral",
  "nao e a toa que": "não por acaso,",
  "sem sombra de duvidas": "sem dúvida",
  "fique ligado": "acompanhe",
  "confira tudo abaixo": "veja os detalhes abaixo",
};

const ACCENT: Record<string, string> = { a: "[aáàâã]", e: "[eéê]", i: "[ií]", o: "[oóôõ]", u: "[uúü]", c: "[cç]" };

function phraseRegex(phrase: string) {
  const body = [...phrase].map((ch) => (ch === " " ? "\\s+" : (ACCENT[ch] ?? ch.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&")))).join("");
  return new RegExp(`(?<!\\p{L})${body}(?!\\p{L})(\\s*,)?\\s*`, "giu");
}

function replaceBanned(text: string, found: Set<string>) {
  let out = text;
  for (const [phrase, repl] of Object.entries(REPLACE)) {
    out = out.replace(phraseRegex(phrase), (match: string, comma?: string) => {
      found.add(phrase);
      const capital = /^\p{Lu}/u.test(match);
      const trailing = /\s$/.test(match) ? " " : "";
      if (repl) return `${capital ? repl[0].toUpperCase() + repl.slice(1) : repl}${comma && !repl.endsWith(",") ? "," : ""}${trailing}`;
      return capital ? "\u0000" : "";
    });
    out = out.replace(/\u0000(.)/gu, (_m, ch: string) => ch.toUpperCase());
  }
  return out;
}

const DANGLING = /(?:\s+(?:de|da|do|das|dos|e|em|no|na|nos|nas|com|para|a|o|as|os|ao|que|por|sobre|um|uma))+$/i;

/** Corta no fim de uma palavra, sem deixar preposição ou pontuação pendurada. */
export function trimAtWord(s: string, max: number) {
  const t = s.trim();
  if (t.length <= max) return t;
  let cut = t.slice(0, max + 1);
  cut = cut.slice(0, Math.max(cut.lastIndexOf(" "), 0));
  for (let i = 0; i < 3; i++) cut = cut.replace(/[\s,;:–—-]+$/u, "").replace(DANGLING, "");
  return cut;
}

/** Correções sem nova chamada ao Gemini. Devolve o que mudou. */
export function autoFix(d: DraftArticle): { draft: DraftArticle; fixes: string[] } {
  const fixes: string[] = [];
  const found = new Set<string>();
  const next: DraftArticle = {
    ...d,
    title: replaceBanned(d.title, found).trim(),
    excerpt: replaceBanned(d.excerpt, found).trim(),
    metaDescription: replaceBanned(d.metaDescription ?? "", found).trim(),
    body: d.body.map((b) =>
      b.type === "ul" ? { ...b, items: (b.items ?? []).map((i) => replaceBanned(i, found).trim()) } : { ...b, text: replaceBanned(b.text ?? "", found).trim() },
    ),
  };
  if (found.size) fixes.push(`expressões trocadas: ${[...found].join(", ")}`);

  // Decimal com ponto antes de "%" (padrão americano, ex.: "46.4%") vira vírgula. Só antes de "%":
  // "US$ 71.500" é milhar e fica como está. Não fica dentro de links.
  let decimals = 0;
  const decimalFix = (s: string) =>
    s
      .split(/(\[[^\]\n]+\]\([^)\s]+\))/g)
      .map((part, i) => (i % 2 ? part : part.replace(/(\d)\.(\d{1,2})(?=\s?%)/g, (_m, a: string, b: string) => (decimals++, `${a},${b}`))))
      .join("");
  next.title = decimalFix(next.title);
  next.excerpt = decimalFix(next.excerpt);
  next.metaDescription = decimalFix(next.metaDescription);
  next.body = next.body.map((b) => (b.type === "ul" ? { ...b, items: (b.items ?? []).map(decimalFix) } : { ...b, text: decimalFix(b.text ?? "") }));
  if (decimals) fixes.push(`decimais com vírgula: ${decimals}`);

  if (next.title.length > TITLE_MAX) {
    const fits = (t: string) => t.length >= TITLE_MIN && t.length <= TITLE_MAX && !t.endsWith("?");
    const alt = (next.titleAlternatives ?? []).map((t) => t.trim()).find(fits);
    const cut = alt ?? trimAtWord(next.title, TITLE_MAX);
    if (cut.length >= TITLE_MIN) {
      fixes.push(`título encurtado (${next.title.length} → ${cut.length})`);
      next.title = cut;
    }
  }
  if (next.metaDescription.length > META_MAX) {
    next.metaDescription = trimAtWord(next.metaDescription, META_MAX - 1).replace(/[.!]?$/, ".");
    fixes.push("meta description encurtada");
  }
  // Sem meta description: usa a linha fina (se couber).
  if (next.metaDescription.length < META_MIN && next.excerpt.length >= META_MIN) {
    next.metaDescription = next.excerpt.length > META_MAX ? trimAtWord(next.excerpt, META_MAX - 1).replace(/[.!]?$/, ".") : next.excerpt;
    fixes.push("meta description a partir da linha fina");
  }
  return { draft: next, fixes };
}

// ───────────── Checagem ─────────────

const ENGLISH = ["the", "and", "with", "that", "which", "have", "this", "from", "were", "was", "will", "would", "their", "about", "into", "when", "where", "there"];

function hasEnglishSentence(text: string) {
  for (const s of text.split(/(?<=[.!?])\s+/)) {
    if (s.trim().split(/\s+/).length < 6) continue;
    const lower = norm(s);
    const hits = ENGLISH.filter((w) => new RegExp(`\\b${w}\\b`).test(lower)).length;
    if (hits >= 3 && !/[çãõáéíóúâêô]/i.test(s)) return true;
  }
  return false;
}

function jaccard(a: Set<string>, b: Set<string>) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

/** Palavra-chave no 1º ou 2º parágrafo (ou todas as palavras dela no 1º, em qualquer ordem). */
export function keywordInLead(paragraphs: string[], keyword: string) {
  const kw = norm(keyword).trim();
  if (!kw) return false;
  const [first = "", second = ""] = paragraphs.map(norm);
  if (first.includes(kw) || second.includes(kw)) return true;
  const words = kw.split(/[^a-z0-9]+/).filter((w) => w.length >= 3);
  const firstWords = new Set(first.split(/[^a-z0-9]+/));
  return words.length > 0 && words.every((w) => firstWords.has(w));
}

// Só rumor de verdade. "reportedly" (= "segundo a Bloomberg") é reportagem atribuída, não rumor:
// antes entrava aqui e reprovava matéria correta (post #1, 2026-11-11).
const RUMOR_SOURCE = ["rumor", "rumors", "rumour", "rumours", "leak", "leaked", "leaks", "unconfirmed", "insider"];
const RUMOR_PT = ["rumor", "rumores", "vazamento", "vazou", "vazad", "boato", "nao confirmad", "nao oficial", "ainda nao foi oficializad", "sem confirmacao"];

export interface CheckContext {
  sourceText: string;
  minWords: number;
  allowedSections: string[];
  section: string;
}

/** Lista de problemas (vazia = aprovada). As mensagens vão para o Gemini na nova tentativa. */
export function checkDraft(d: DraftArticle, ctx: CheckContext): string[] {
  const issues: string[] = [];
  const paragraphs = d.body.filter((b) => b.type === "p").map(blockText);
  const plain = d.body.map(blockText).join(" ");
  const all = norm(`${d.title} ${plain}`);

  if (!ctx.allowedSections.includes(ctx.section)) issues.push(`Editoria "${ctx.section}" não permitida; use uma de: ${ctx.allowedSections.join(", ")}.`);
  if (!d.focusKeyword?.trim()) issues.push("Falta a palavra-chave (focusKeyword): o nome do produto, plataforma, empresa ou evento central.");
  if (d.title.length < TITLE_MIN || d.title.length > TITLE_MAX) issues.push(`Título com ${d.title.length} caracteres; precisa ter de ${TITLE_MIN} a ${TITLE_MAX}.`);
  if (d.title === d.title.toUpperCase() && /\p{Lu}/u.test(d.title)) issues.push("Título em caixa alta.");
  if (d.title.trim().endsWith("?") || /voc[eê] n[aã]o vai acreditar|chocante|finalmente!/i.test(d.title)) issues.push("Título com cara de caça-clique.");
  if (d.focusKeyword && !norm(d.title).includes(norm(d.focusKeyword))) issues.push(`O título precisa conter a palavra-chave "${d.focusKeyword}".`);
  if (d.metaDescription.length < META_MIN || d.metaDescription.length > META_MAX)
    issues.push(`metaDescription com ${d.metaDescription.length} caracteres; precisa ter de ${META_MIN} a ${META_MAX}.`);
  if (!d.excerpt || d.excerpt.length > 260) issues.push("Linha fina (excerpt) vazia ou com mais de 260 caracteres.");

  const banned = BANNED.filter((p) => all.includes(p));
  if (banned.length) issues.push(`Expressões de texto de IA: ${banned.join(", ")}. Reescreva esses trechos.`);
  const advice = ADVICE.filter((p) => norm(`${d.title} ${d.excerpt} ${d.metaDescription} ${plain}`).includes(p));
  if (advice.length)
    issues.push(
      `Promessa de resultado ou tom de propaganda: ${advice.join(", ")}. Descreva os fatos e atribua recomendações a quem as fez.`,
    );
  if (hasEnglishSentence(plain)) issues.push("Há frase inteira em inglês sem tradução no corpo.");

  const words = countWords(plain);
  if (words < ctx.minWords)
    issues.push(
      `Corpo com ${words} palavras; mínimo ${ctx.minWords} (alvo 500). Faltam pelo menos ${ctx.minWords - words + 60}: acrescente uma seção h2 com detalhes das fontes ainda não usados (contexto, histórico, números, declarações), sem enrolação e sem encurtar o resto.`,
    );
  if (d.body.some((b) => !["p", "h2", "h3", "ul", "quote"].includes(b.type) || !blockText(b).trim())) issues.push("Há bloco vazio ou de tipo inválido.");
  if (d.body[0]?.type !== "p") issues.push("O texto deve começar por um parágrafo (o lide), não por intertítulo.");
  if (d.focusKeyword && !keywordInLead(paragraphs, d.focusKeyword)) issues.push(`A palavra-chave "${d.focusKeyword}" precisa aparecer no primeiro parágrafo.`);

  const h2 = d.body.filter((b) => b.type === "h2").map((b) => b.text ?? "");
  if (h2.length < 2) issues.push(`Só ${h2.length} intertítulo(s) h2; use pelo menos 2, informativos.`);
  if (!h2.some((t) => /^mais sobre\b/i.test(t.trim()))) issues.push(`Falta a seção final com h2 "Mais sobre ${d.focusKeyword || "<palavra-chave>"}".`);
  if (h2.some((t) => /^(introdu[cç][aã]o|conclus[aã]o|detalhes|resumo)$/i.test(t.trim()))) issues.push("Intertítulo genérico (Introdução/Conclusão/Detalhes); diga o que o leitor encontra na seção.");
  const long = paragraphs.find((p) => countWords(p) > 110);
  if (long) issues.push("Há parágrafo com mais de 110 palavras; divida em parágrafos de 2 a 4 frases.");

  // Citação em destaque sem dizer quem falou (no parágrafo anterior ou na própria citação) não serve:
  // o leitor precisa saber de quem é a frase.
  const SAID = /\b(disse|diz|afirmou|afirma|declarou|escreveu|explicou|avaliou|comentou|destacou|ressaltou|acrescentou|observou|alertou|segundo|de acordo com|nas palavras de|publicou|postou|completou|argumentou)\b/i;
  const orphan = d.body.findIndex((b, i) => b.type === "quote" && !SAID.test(blockText(d.body[i - 1] ?? { type: "p" })) && !/—|–/.test(b.text ?? ""));
  if (orphan >= 0)
    issues.push(
      `A citação "${(d.body[orphan].text ?? "").slice(0, 60)}..." não diz quem falou. Use "quote" só para falas literais de alguém e diga o autor no parágrafo anterior ("disse Fulano, diretor da X:"); se não for fala de ninguém, transforme em parágrafo normal.`,
    );

  const sets = paragraphs.map((p) => new Set(norm(p).split(/\W+/).filter((w) => w.length > 3)));
  outer: for (let i = 0; i < sets.length; i++)
    for (let j = i + 1; j < sets.length; j++)
      if (paragraphs[i].length > 40 && paragraphs[j].length > 40 && jaccard(sets[i], sets[j]) >= 0.7) {
        issues.push(`Parágrafos ${i + 1} e ${j + 1} são quase iguais (encheção).`);
        break outer;
      }

  const src = norm(ctx.sourceText);
  if (RUMOR_SOURCE.some((t) => new RegExp(`\\b${t}\\b`).test(src)) && !RUMOR_PT.some((t) => all.includes(t)))
    issues.push("A fonte trata parte do assunto como rumor/vazamento, mas o texto apresenta como fato. Deixe claro o que não é oficial.");

  // Todo número da matéria precisa existir nas fontes (anos atual, anterior e seguinte são tolerados).
  const allowed = numbersIn(ctx.sourceText);
  const year = new Date().getUTCFullYear();
  [year - 1, year, year + 1].forEach((y) => allowed.add(String(y)));
  const invented = [...numbersIn([d.title, d.excerpt, d.metaDescription, plain].join(" "))].filter((n) => !allowed.has(n));
  if (invented.length) issues.push(`Números que não estão nas fontes: ${invented.slice(0, 5).join(", ")}. Use só números das fontes.`);
  return issues;
}
