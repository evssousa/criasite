// Monta o corpo final da matéria a partir do texto do Gemini + mídia (sem rede).
// Mesmas regras do Respawnou, adaptadas:
// - vídeo do YouTube logo depois do lide;
// - uma imagem abaixo de cada h2, sem repetir a capa;
// - pelo menos 1 link interno (se o Gemini não pôs, a 1ª menção de um termo ligado a uma ferramenta
//   do site vira link para ela);
// - "Leia também" no meio do texto, para outra matéria relacionada.
import type { Block } from "../types.ts";
import { linksIn, type DraftBlock } from "./quality.ts";

export interface BodyImage {
  src: string;
  width?: number;
  height?: number;
  credit?: string;
}

export interface AssembleInput {
  draft: DraftBlock[];
  focusKeyword: string;
  images: BodyImage[];
  video?: { youtubeId: string; title: string };
  related: { title: string; url: string }[];
}

/** Termos que, citados no texto, viram link para a ferramenta do site (link interno automático). */
const TOOL_TERMS: { re: RegExp; url: string }[] = [
  { re: /(?<![\p{L}\d])(meta tags?|meta description|title tag)(?![\p{L}\d])/iu, url: "/ferramentas/meta-tags" },
  { re: /(?<![\p{L}\d])(QR codes?)(?![\p{L}\d])/iu, url: "/ferramentas/qr-code" },
  { re: /(?<![\p{L}\d])(comprimir|compressão de) imagens?(?![\p{L}\d])/iu, url: "/ferramentas/comprimir-imagem" },
  { re: /(?<![\p{L}\d])(imagens? (?:em )?WebP|imagens pesadas|peso das imagens)(?![\p{L}\d])/iu, url: "/ferramentas/comprimir-imagem" },
  { re: /(?<![\p{L}\d])(link do WhatsApp|botão do WhatsApp)(?![\p{L}\d])/iu, url: "/ferramentas/link-whatsapp" },
];

const LINK = /\[[^\]\n]+\]\([^)\s]+\)/g;

/** Aplica `fn` só nos trechos do texto que estão fora de links. */
function outsideLinks(text: string, fn: (chunk: string) => string | null): string | null {
  const parts = text.split(/(\[[^\]\n]+\]\([^)\s]+\))/g);
  for (let i = 0; i < parts.length; i += 2) {
    const r = fn(parts[i]);
    if (r !== null) {
      parts[i] = r;
      return parts.join("");
    }
  }
  return null;
}

export function assembleBody(o: AssembleInput): Block[] {
  const out: Block[] = o.draft.map((b) => {
    if (b.type === "ul") return { type: "ul", items: (b.items ?? []).map((i) => i.trim()) };
    return { type: b.type, text: (b.text ?? "").trim() } as Block;
  });

  // Link interno garantido: 1ª menção (fora do lide) de um termo ligado a uma ferramenta do site.
  const hasInternal = out.some((b) => (b.type === "p" || b.type === "ul") && linksIn(b.type === "p" ? b.text : b.items.join(" ")).some((l) => l.url.startsWith("/")));
  if (!hasInternal) {
    const firstP = out.findIndex((b) => b.type === "p");
    outer: for (const t of TOOL_TERMS) {
      for (const [i, b] of out.entries()) {
        if (b.type !== "p" || i === firstP) continue;
        const next = outsideLinks(b.text, (chunk) => {
          const m = chunk.match(t.re);
          return m ? chunk.replace(t.re, `[${m[0]}](${t.url})`) : null;
        });
        if (next) {
          b.text = next;
          break outer;
        }
      }
    }
  }

  // "Leia também" depois do 3º parágrafo, com uma matéria ainda não linkada no texto.
  const linked = new Set(out.flatMap((b) => (b.type === "p" ? linksIn(b.text).map((l) => l.url) : [])));
  const extra = o.related.find((r) => !linked.has(r.url));
  if (extra) {
    let count = 0;
    const at = out.findIndex((b) => b.type === "p" && ++count === 3);
    if (at > 0) out.splice(at + 1, 0, { type: "p", text: `Leia também: [${extra.title}](${extra.url})` });
  }

  // Imagens abaixo de cada h2 (alt descreve a seção, em português).
  const images = [...o.images];
  for (let i = 0; i < out.length && images.length; i++) {
    const b = out[i];
    if (b.type !== "h2") continue;
    const img = images.shift()!;
    out.splice(i + 1, 0, { type: "img", src: img.src, alt: `${o.focusKeyword}: ${b.text}`.slice(0, 250), width: img.width, height: img.height, credit: img.credit });
    i++;
  }

  // Vídeo logo depois do lide.
  if (o.video) {
    const lead = out.findIndex((b) => b.type === "p");
    out.splice(lead + 1, 0, { type: "video", youtubeId: o.video.youtubeId, title: o.video.title });
  }
  return out;
}

/** Remove a marcação de link (para contar palavras e conferir números). */
export const stripLinks = (s: string) => s.replace(LINK, (m) => m.slice(1, m.indexOf("](")));
