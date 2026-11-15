import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/tool-sizes";
import { ToolLayout, ToolPanel, copyText } from "~/components/ToolLayout";
import { cx } from "~/components/ui";
import { seo } from "~/lib/seo";
import { toolBySlug } from "~/lib/site";

const tool = toolBySlug("tamanhos-de-imagem")!;

export function meta(_: Route.MetaArgs) {
  return seo({ title: "Tamanhos de imagem para site, Instagram, WhatsApp e YouTube", description: tool.description, path: "/ferramentas/tamanhos-de-imagem" });
}

type Group = "site" | "instagram" | "redes" | "youtube";

interface Size {
  group: Group;
  name: string;
  w: number;
  h: number;
  note: string;
}

// Medidas de referência. As redes mudam os formatos de tempos em tempos: a página avisa para conferir.
const SIZES: Size[] = [
  { group: "site", name: "Imagem de compartilhamento (Open Graph)", w: 1200, h: 630, note: "A prévia do link no WhatsApp, Facebook, LinkedIn e Google." },
  { group: "site", name: "Banner principal (topo da página)", w: 1920, h: 700, note: "Deixe o assunto no centro: no celular as laterais são cortadas." },
  { group: "site", name: "Imagem de destaque do blog", w: 1200, h: 675, note: "Proporção 16:9, a que mais temas de blog usam." },
  { group: "site", name: "Foto de produto (loja virtual)", w: 1000, h: 1000, note: "Quadrada, com folga em volta. Permite zoom sem perder nitidez." },
  { group: "site", name: "Foto de equipe ou depoimento", w: 600, h: 600, note: "Quadrada. 600 px já fica nítida em telas de alta densidade." },
  { group: "site", name: "Logo no cabeçalho", w: 400, h: 120, note: "Prefira SVG ou PNG transparente, que não perdem nitidez." },
  { group: "site", name: "Favicon (ícone da aba)", w: 512, h: 512, note: "Envie em 512 px; os tamanhos menores saem dele. Veja o gerador de favicon." },
  { group: "instagram", name: "Post em retrato", w: 1080, h: 1350, note: "Proporção 4:5, a que ocupa mais espaço no feed." },
  { group: "instagram", name: "Post quadrado", w: 1080, h: 1080, note: "Proporção 1:1." },
  { group: "instagram", name: "Stories e Reels", w: 1080, h: 1920, note: "Proporção 9:16. Evite texto no topo e no rodapé, onde a tela cobre." },
  { group: "instagram", name: "Foto de perfil", w: 320, h: 320, note: "Aparece em círculo: deixe o rosto ou o logo no centro." },
  { group: "redes", name: "Post no Facebook", w: 1200, h: 630, note: "Mesma proporção da imagem de compartilhamento." },
  { group: "redes", name: "Capa do Facebook (página)", w: 820, h: 312, note: "No celular aparece cortada nas laterais." },
  { group: "redes", name: "Post no LinkedIn", w: 1200, h: 627, note: "Proporção parecida com a de compartilhamento de links." },
  { group: "redes", name: "Capa do LinkedIn (perfil)", w: 1584, h: 396, note: "Proporção 4:1." },
  { group: "redes", name: "Post no X (Twitter)", w: 1600, h: 900, note: "Proporção 16:9." },
  { group: "redes", name: "Capa do X (perfil)", w: 1500, h: 500, note: "Proporção 3:1." },
  { group: "redes", name: "Foto de perfil do WhatsApp", w: 640, h: 640, note: "Aparece em círculo. O WhatsApp aceita quadrada." },
  { group: "youtube", name: "Miniatura de vídeo", w: 1280, h: 720, note: "Proporção 16:9, até 2 MB." },
  { group: "youtube", name: "Capa do canal", w: 2560, h: 1440, note: "A área segura, que aparece em todos os aparelhos, é 1546 × 423 px no centro." },
  { group: "youtube", name: "Foto de perfil do canal", w: 800, h: 800, note: "Aparece em círculo." },
];

const GROUPS: { id: Group | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "site", label: "Site" },
  { id: "instagram", label: "Instagram" },
  { id: "redes", label: "Facebook, LinkedIn, X e WhatsApp" },
  { id: "youtube", label: "YouTube" },
];

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
function ratio(w: number, h: number) {
  const d = gcd(w, h);
  const a = w / d;
  const b = h / d;
  // Razões "feias" (1920×700 → 96:35) viram decimal.
  return a > 20 || b > 20 ? `${(w / h).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}:1` : `${a}:${b}`;
}

function Shape({ w, h }: { w: number; h: number }) {
  // Retângulo proporcional dentro de uma caixa de 64 px.
  const max = 56;
  const k = max / Math.max(w, h);
  return (
    <span className="grid h-16 w-16 shrink-0 place-items-center">
      <span className="block rounded-[3px] border-2 border-brand bg-brand/20" style={{ width: Math.max(6, w * k), height: Math.max(6, h * k) }} />
    </span>
  );
}

export default function SizesTool() {
  const [group, setGroup] = useState<Group | "todos">("todos");
  const [copied, setCopied] = useState<string | null>(null);
  const list = SIZES.filter((s) => group === "todos" || s.group === group);

  async function copy(s: Size) {
    const ok = await copyText(`${s.w}x${s.h}`);
    setCopied(ok ? `${s.name}` : null);
    setTimeout(() => setCopied(null), 1600);
  }

  return (
    <ToolLayout
      tool={tool}
      lead="As medidas de imagem para o site, o Instagram, o WhatsApp, o YouTube e as outras redes, com a proporção de cada uma. Toque em uma medida para copiar."
      explain={
        <>
          <h2>Por que usar o tamanho certo</h2>
          <p>
            Uma imagem com a medida errada é cortada, esticada ou fica borrada. No site, uma imagem muito maior que o espaço onde ela aparece deixa a página lenta,
            e uma muito menor fica embaçada em telas de alta densidade. Saber a medida antes de criar a arte evita refazer o trabalho.
          </p>
          <h2>Como usar a tabela</h2>
          <ul>
            <li>
              Crie a arte já na medida indicada. Se for usar uma foto, recorte nessa proporção antes de enviar: o <Link to="/ferramentas/comprimir-imagem">compressor de imagem</Link> redimensiona
              pela largura.
            </li>
            <li>A proporção (como 16:9 ou 4:5) importa mais que os pixels exatos: uma imagem com a proporção certa e o dobro do tamanho também serve.</li>
            <li>Mantenha o assunto principal no centro. Em celulares, as laterais de banners e capas costumam ser cortadas.</li>
          </ul>
          <h2>Medidas mudam</h2>
          <p>
            As redes sociais mudam os formatos com frequência, e as medidas desta página são de referência. Confira a página de ajuda da rede antes de produzir
            uma campanha grande. Já as medidas do seu próprio site dependem do tema: olhe nas configurações dele ou meça o espaço da imagem no navegador (botão
            direito, Inspecionar).
          </p>
          <h2>Formato do arquivo</h2>
          <p>
            Para o site, WebP é o mais leve; para o que vai a gráficas e e-mails, JPG; para logos e prints com transparência, PNG. Para trocar de formato, use o{" "}
            <Link to="/ferramentas/converter-imagem">conversor de imagem</Link>.
          </p>
        </>
      }
    >
      <ToolPanel>
        <div role="group" aria-label="Filtrar por onde a imagem vai" className="flex flex-wrap gap-2">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              aria-pressed={group === g.id}
              onClick={() => setGroup(g.id)}
              className={cx("min-h-10 rounded-full px-4 text-sm font-bold", group === g.id ? "bg-brand text-white" : "bg-night-2 text-moon hover:bg-night-3")}
            >
              {g.label}
            </button>
          ))}
        </div>

        <ul className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
          {list.map((s) => (
            <li key={s.name}>
              <button type="button" onClick={() => copy(s)} className="flex w-full items-center gap-4 rounded-xl bg-night-2 p-3.5 text-left hover:bg-night-3" aria-label={`${s.name}: ${s.w} por ${s.h} pixels. Copiar medida`}>
                <Shape w={s.w} h={s.h} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <b className="text-[15px] leading-snug">{s.name}</b>
                  <span className="text-[13px] leading-snug text-moon-muted">{s.note}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-0.5">
                  <b className="num text-lg text-glow">
                    {s.w}×{s.h}
                  </b>
                  <span className="text-xs text-moon-muted">{copied === s.name ? "Copiado" : ratio(s.w, s.h)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="text-xs leading-relaxed text-moon-muted">Medidas de referência em pixels (largura × altura). As redes mudam os formatos: confira na página de ajuda delas antes de uma campanha grande.</p>
      </ToolPanel>
    </ToolLayout>
  );
}
