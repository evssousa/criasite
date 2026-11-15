// Redator do robô: junta as fontes e a mídia, pede a matéria ao Gemini, confere qualidade e SEO
// (refazendo com a lista de problemas) e monta o corpo final com imagens, vídeo e links.
// Mesmo fluxo do Respawnou e do Vibecoin; o guia editorial é o do CriaSite (criar e cuidar de sites).
import { TOOLS } from "../site.ts";
import type { Block } from "../types.ts";
import { json } from "../db.server.ts";
import { assembleBody, stripLinks } from "./assemble.ts";
import { generateJson } from "./gemini.server.ts";
import { emptyMedia, mergeMedia, type SourceMedia } from "./media.ts";
import { chooseMedia, storeImage, type ProbedImage } from "./media.server.ts";
import { autoFix, checkDraft, sanitizeLinks, type DraftArticle, type DraftBlock } from "./quality.ts";
import { fetchArticle } from "./rss.server.ts";
import { countWords } from "./text.ts";

/** Editorias que o robô pode escrever (guias são feitos à mão no painel). */
export const ROBOT_SECTIONS = ["noticias", "google", "plataformas", "ia", "seguranca"] as const;
const MAX_ATTEMPTS = 3;

export interface SourceItem {
  id: number;
  feed_id: number;
  feed_name: string;
  title: string;
  url: string;
  summary: string | null;
  published_at: string;
  media: unknown;
}

export interface Source {
  name: string;
  title: string;
  url: string;
  date: string;
  text: string;
}

interface GeminiDraft extends DraftArticle {
  publish: boolean;
  reason: string;
  section: string;
  tags: string[];
}

export interface BuiltArticle {
  section: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  focusKeyword: string;
  tags: string[];
  body: Block[];
  words: number;
  readMinutes: number;
  cover: ProbedImage;
  coverAlt: string;
  bodyImages: ProbedImage[];
  video?: { youtubeId: string; title: string };
  sources: { name: string; url: string }[];
  model: string;
  attempts: number;
  fixes: string[];
}

export type WriteResult = { ok: true; article: BuiltArticle } | { ok: false; status: "skipped" | "failed"; reason: string };

export interface WriteContext {
  sections: string[];
  minWords: number;
  recentTitles: string[];
  /** Matérias do site para link interno (as mais parecidas primeiro). */
  related: { title: string; url: string }[];
}

// ───────────── Prompt ─────────────

const SCHEMA = {
  type: "OBJECT",
  properties: {
    publish: { type: "BOOLEAN", description: "false se a pauta não serve (ver regras)" },
    reason: { type: "STRING", description: "por que publicar ou não, em uma frase" },
    section: { type: "STRING", enum: [...ROBOT_SECTIONS] },
    focusKeyword: { type: "STRING", description: "nome próprio central (produto, plataforma, empresa, plugin ou evento), nunca termo genérico" },
    title: { type: "STRING", description: "30 a 70 caracteres, contém a focusKeyword, de preferência no começo" },
    titleAlternatives: { type: "ARRAY", items: { type: "STRING" }, description: "2 títulos alternativos com as mesmas regras" },
    metaDescription: { type: "STRING", description: "120 a 160 caracteres, com a focusKeyword, resume o fato para o Google" },
    excerpt: { type: "STRING", description: "linha fina: 1 a 2 frases, 140 a 220 caracteres, complementa o título" },
    tags: { type: "ARRAY", items: { type: "STRING" }, description: "3 a 6 tags: produtos, empresas, plataformas, temas" },
    body: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          type: { type: "STRING", enum: ["p", "h2", "h3", "ul", "quote"] },
          text: { type: "STRING" },
          items: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: ["type"],
      },
    },
  },
  required: ["publish", "reason", "section", "focusKeyword", "title", "titleAlternatives", "metaDescription", "excerpt", "tags", "body"],
};

const SYSTEM = `Você é redator do CriaSite, site brasileiro de ferramentas, notícias e guias para quem cria e cuida de sites: donos de pequenos negócios, freelancers, blogueiros e quem está começando no WordPress. Escreve notícias completas, originais e otimizadas para o Google, em português do Brasil, para um leitor comum, não para programadores.

VOZ E TOM
- Português brasileiro claro e direto: explique termos técnicos na primeira vez que aparecem (ex.: "Core Web Vitals, as métricas de velocidade do Google"; "plugin, uma extensão do WordPress").
- Frases de tamanho variado. Parágrafos curtos (2 a 4 frases, no máximo ~80 palavras).
- No máximo uma exclamação no texto todo. Sem emojis.
- NUNCA use: "Em um mundo onde", "Vale ressaltar que", "Vale lembrar que", "Em suma", "Em resumo", "Não é à toa que", "Prepare-se", "Fique ligado", "Fique de olho", "Sem sombra de dúvidas", "Mergulhe", "Confira tudo abaixo", "Não perca", "revolucionar", "game changer".
- Varie a abertura: não repita a estrutura dos títulos recentes do site (lista na mensagem).

FOCO NO LEITOR (regra mais importante)
- O leitor tem um site pequeno (institucional, loja virtual ou blog). Toda notícia responde: o que mudou e o que isso muda para o site dele.
- Falha de segurança: diga quem é afetado (plugin, versão), qual o risco e qual versão corrige, com os dados das fontes.
- Não prometa resultado ("vai subir no Google", "vai triplicar as visitas"). Recomendações do Google ou de empresas são atribuídas a quem as fez.
- Produto ou serviço: descreva o que é e o que muda, sem tom de propaganda e sem preço que não esteja nas fontes.

ESTRUTURA (nesta ordem)
1. title: 30 a 70 caracteres. Nome do produto/empresa/plataforma primeiro, depois o fato. Só a primeira letra maiúscula (e nomes próprios). Sem caixa alta, sem "?" no fim, sem caça-clique.
2. Lide (1º bloco, tipo "p", 2 a 3 frases): o quê, quem, quando. A focusKeyword aparece aqui.
3. Desenvolvimento em 2 ou mais seções, cada uma aberta por um "h2" informativo que diga o que o leitor encontra ali (ex.: "Quem precisa atualizar", "O que muda no Search Console", "Quanto o site fica mais rápido") — nunca genérico ("Introdução", "Detalhes", "Conclusão"). Detalhes das fontes, com números, datas e declarações atribuídas. Use "h3" só para subdividir uma seção longa. Use "ul" só quando houver itens de verdade.
4. Seção "O que fazer no seu site" (h2 próprio) SÓ se as fontes trouxerem uma ação concreta (atualizar para a versão X, conferir o relatório Y, mudar a configuração Z). Sem ação concreta nas fontes, OMITA a seção (nunca escreva conselho genérico no lugar).
5. Última seção: h2 exatamente "Mais sobre <focusKeyword>" com contexto concreto tirado das fontes (histórico, números anteriores, quem é a empresa ou o projeto). Nada de "fique de olho" ou "acompanhe o CriaSite".
6. Não escreva "Fonte:" no fim: o crédito entra automaticamente.

TAMANHO E VALOR PRÓPRIO
- Alvo: 500 a 700 palavras no corpo (conte!). Mínimo absoluto 400: abaixo disso a notícia é reprovada. Use TODOS os detalhes das fontes. Se as fontes não tiverem substância para isso sem enrolar, responda publish=false.
- Junte o que cada fonte traz de diferente: a notícia deve ser a mais completa em português sobre o assunto.
- Explique o contexto para quem está chegando agora e o que ainda falta saber.
- Nunca encha linguiça repetindo o lide com outras palavras.

LINKS (formato [texto âncora](url), dentro de "p" ou "ul")
- Use até 3 LINKS INTERNOS e de 1 a 2 LINKS EXTERNOS, escolhidos SOMENTE das listas da mensagem. Endereço fora das listas é removido.
- Prefira o link interno de uma ferramenta do site quando o assunto tiver relação direta com ela (ex.: imagens e velocidade → comprimir imagem; título e descrição no Google → meta tags).
- Texto âncora descritivo, nunca "clique aqui" ou o endereço cru. No máximo 1 link por parágrafo. Não ponha link no lide.
- Link só onde o trecho tem relação real com a página linkada. NUNCA escreva frase só para encaixar link nem fale do próprio site.

PRECISÃO — NUNCA INVENTE
1. Use SOMENTE fatos presentes nas fontes. Nunca invente datas, versões, números, nomes, declarações ou detalhes. Na dúvida, omita.
2. Não traduza parágrafo por parágrafo: escreva um texto novo, com estrutura própria.
3. Não converta moedas nem fusos por conta própria: valores em dólar ficam em dólar, como na fonte.
4. Rumor, vazamento ou "fontes anônimas": escreva como tal ("ainda não confirmado") e nunca apresente como fato.
5. Citações: traduza e atribua a quem disse. No máximo 2 citações (tipo "quote", sem aspas no texto), SÓ para falas literais de uma pessoa ou instituição, e o parágrafo logo antes diz quem falou ("disse Fulano, do Google:"). Dado, estatística ou resumo da fonte não é citação: vira parágrafo normal. Nunca invente citação.
6. Números em português: vírgula no decimal e ponto no milhar (46,4%; US$ 29; 1,2 milhão).

QUANDO NÃO PUBLICAR (publish=false)
- Não interessa a quem tem ou faz sites (ex.: notícia de hardware, game, política, mercado financeiro); é tutorial de programação avançada sem impacto para sites pequenos; é conteúdo patrocinado ou comunicado de produto pequeno pedindo divulgação; é lista de "melhores ferramentas" sem fato novo; rumor sem origem confiável; ou o assunto já está entre as notícias recentes do CriaSite.

CAMPOS
- section: Google, SEO, Search Console e busca em "google"; WordPress, Wix, Shopify, construtores e hospedagem em "plataformas"; inteligência artificial em "ia"; falhas, golpes, malware e HTTPS em "seguranca"; o resto (navegadores, desempenho, design, padrões da web) em "noticias" — sempre entre as permitidas.
- tags: 3 a 6, nomes próprios e temas (ex.: "Google", "WordPress", "Core Web Vitals").`;

function sourcesBlock(sources: Source[]) {
  return sources.map((s, i) => `### FONTE ${i + 1}: ${s.name}\nTítulo: ${s.title}\nPublicado em: ${s.date}\nURL: ${s.url}\n\n${s.text}`).join("\n\n---\n\n");
}

const TOOL_PAGES = TOOLS.map((t) => [`/ferramentas/${t.slug}`, `${t.title.toLowerCase()} (ferramenta grátis do site)`] as const);

// ───────────── Fontes e mídia ─────────────

async function gatherSources(group: SourceItem[]) {
  const sources: Source[] = [];
  const medias: SourceMedia[] = [];
  for (const g of group) {
    const page = await fetchArticle(g.url);
    const full = countWords(page.text) >= countWords(g.summary ?? "") ? page.text : (g.summary ?? "");
    // Limite por fonte: prompt menor = resposta mais rápida (e menos lixo de página).
    const text = full.split(/\s+/).slice(0, 1500).join(" ");
    if (countWords(text) >= 40) sources.push({ name: g.feed_name, title: g.title, url: g.url, date: g.published_at, text });
    const rss = json<SourceMedia>(g.media, emptyMedia());
    // Ordem: imagens do RSS (escolhidas pelo próprio site) e depois as da página.
    const merged = mergeMedia(rss, page.media);
    merged.images = merged.images.map((i) => ({ ...i, source: g.feed_name }));
    medias.push(merged);
  }
  return { sources, media: mergeMedia(...medias) };
}

/** Confere no YouTube se o vídeo existe e pode ser incorporado (oEmbed responde 401/404 se não). */
async function videoInfo(id: string) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string };
    return { youtubeId: id, title: data.title ?? "Vídeo" };
  } catch {
    return null;
  }
}

const cleanTags = (tags: string[]) =>
  [...new Map((tags ?? []).map((t) => t.trim().replace(/^#/, "")).filter((t) => t.length >= 2 && t.length <= 40).map((t) => [t.toLowerCase(), t])).values()].slice(0, 6);

// ───────────── Escrever ─────────────

export async function writeArticle(group: SourceItem[], ctx: WriteContext): Promise<WriteResult> {
  const { sources, media } = await gatherSources(group);
  const sourceWords = sources.reduce((n, s) => n + countWords(s.text), 0);
  if (sourceWords < 200) return { ok: false, status: "skipped", reason: `pouco conteúdo nas fontes (${sourceWords} palavras)` };

  // Mídia antes do Gemini: sem capa utilizável a pauta sai, sem gastar cota.
  const chosen = await chooseMedia(media.images, 3);
  if (!chosen) return { ok: false, status: "skipped", reason: `sem imagem de capa utilizável: grande, horizontal e nítida (${media.images.length} candidata(s))` };
  let video: BuiltArticle["video"];
  for (const id of media.videos.slice(0, 3)) {
    const info = await videoInfo(id);
    if (info) {
      video = info;
      break;
    }
  }

  const internal = [...ctx.related.map((r) => [r.url, r.title] as const), ...TOOL_PAGES, ["/trilha", "trilha do site no ar: as 7 etapas para criar um site"] as const];
  const external = [...sources.map((s) => [s.url, `texto original (${s.name})`] as const), ...media.links.slice(0, 6).map((u) => [u, "link oficial"] as const)];
  const allowed = [...internal.map(([u]) => u), ...external.map(([u]) => u)];

  const prompt = `Editorias permitidas: ${ctx.sections.join(", ")}.

Notícias publicadas recentemente pelo CriaSite (não repita o assunto nem a estrutura do título):
${ctx.recentTitles.map((t) => `- ${t}`).join("\n") || "- (nenhuma)"}

LINKS INTERNOS PERMITIDOS (até 3, só os que tiverem relação real com o assunto):
${internal.map(([u, t]) => `- ${u} — ${t}`).join("\n")}

LINKS EXTERNOS PERMITIDOS (use 1 a 2):
${external.map(([u, t]) => `- ${u} — ${t}`).join("\n")}

MÍDIA: a notícia terá ${chosen.body.length + 1} imagem(ns)${video ? " e um vídeo do YouTube logo depois do lide" : ""}, inseridas automaticamente. Não descreva imagens nem escreva "veja o vídeo".

Escreva uma notícia a partir das fontes abaixo. A FONTE 1 é a principal; as outras complementam o mesmo assunto.

${sourcesBlock(sources)}`;

  const schema = SCHEMA;
  const sourceText = sources.map((s) => `${s.title} ${s.text}`).join(" ");
  let lastIssues: string[] = [];
  let previous: GeminiDraft | undefined;
  let model = "";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const retry = previous
      ? `\n\n---\nSUA VERSÃO ANTERIOR (JSON):\n${JSON.stringify(previous)}\n\nEla foi reprovada na checagem de qualidade. Gere de novo a notícia COMPLETA, mantendo o que estava certo (sem encurtar o texto) e corrigindo especificamente:\n${lastIssues.map((i) => `- ${i}`).join("\n")}`
      : "";
    const res = await generateJson<GeminiDraft>({ system: SYSTEM, prompt: prompt + retry, schema });
    model = res.model;
    const raw = res.data;
    if (!raw.publish && attempt === 1) return { ok: false, status: "skipped", reason: `recusada pelo redator (${raw.reason})` };

    const { draft, fixes } = autoFix({ ...raw, body: raw.body ?? [] });
    const { body: linked, removed } = sanitizeLinks(draft.body as DraftBlock[], allowed);
    if (removed.length) fixes.push(`links fora da lista removidos: ${removed.length}`);
    const issues = checkDraft({ ...draft, body: linked }, { sourceText, minWords: ctx.minWords, allowedSections: ctx.sections, section: raw.section });
    if (issues.length) {
      lastIssues = issues;
      previous = raw;
      continue;
    }

    const keyword = draft.focusKeyword.trim();
    const body = assembleBody({
      draft: linked,
      focusKeyword: keyword,
      images: chosen.body.map((p) => ({ src: p.url, width: p.width, height: p.height, credit: imageCredit(p) })),
      video: video && { youtubeId: video.youtubeId, title: `${keyword}: ${video.title}`.slice(0, 200) },
      related: ctx.related,
    });
    const words = countWords(
      body.map((b) => (b.type === "ul" ? b.items.join(" ") : b.type === "p" || b.type === "h2" || b.type === "h3" || b.type === "quote" ? b.text : "")).map(stripLinks).join(" "),
    );
    return {
      ok: true,
      article: {
        section: raw.section,
        title: draft.title,
        excerpt: draft.excerpt,
        metaDescription: draft.metaDescription,
        focusKeyword: keyword,
        tags: cleanTags(raw.tags),
        body,
        words,
        readMinutes: Math.max(2, Math.round(words / 200)),
        cover: chosen.cover,
        coverAlt: draft.title,
        bodyImages: chosen.body,
        video,
        sources: sources.map((s) => ({ name: s.name, url: s.url })),
        model,
        attempts: attempt,
        fixes,
      },
    };
  }
  return { ok: false, status: "failed", reason: `reprovada na checagem após ${MAX_ATTEMPTS} tentativas: ${lastIssues.join(" | ")}` };
}

/** Imagem das fontes: reprodução com crédito do veículo. */
const imageCredit = (p: ProbedImage) => (p.source ? `Imagem: reprodução/${p.source}` : undefined);

/** Grava as imagens em MEDIA_DIR e troca os endereços remotos pelos nossos. */
export async function localizeImages(a: BuiltArticle, slug: string) {
  const cover = await storeImage(a.cover, slug);
  const map = new Map<string, { src: string; width: number; height: number }>();
  let n = 2;
  // A foto da capa pode estar no corpo (uma vez): reaproveita o arquivo da capa.
  for (const img of a.bodyImages) map.set(img.url, img === a.cover ? cover : await storeImage(img, `${slug}-${n++}`));
  const body = a.body.map((b) => {
    if (b.type !== "img") return b;
    const local = map.get(b.src);
    return local ? { ...b, ...local } : b;
  });
  return { cover, body, coverCredit: imageCredit(a.cover) ?? null };
}
