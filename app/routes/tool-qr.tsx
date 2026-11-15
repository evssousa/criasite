import qrcode from "qrcode-generator";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/tool-qr";
import { Field, ToolDisclaimer, ToolLayout, ToolPanel, btnCls, btnGhostCls, inputCls } from "~/components/ToolLayout";
import { cx } from "~/components/ui";
import { seo } from "~/lib/seo";
import { toolBySlug } from "~/lib/site";

const tool = toolBySlug("qr-code")!;

export function meta(_: Route.MetaArgs) {
  return seo({ title: "Gerador de QR code grátis (link, Wi-Fi, WhatsApp)", description: tool.description, path: "/ferramentas/qr-code" });
}

// Acentos e emojis: o padrão da biblioteca é Latin-1; UTF-8 é o que os leitores de celular esperam.
qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];

type Kind = "link" | "texto" | "wifi" | "whatsapp";
const KINDS: { id: Kind; label: string }[] = [
  { id: "link", label: "Link" },
  { id: "wifi", label: "Wi-Fi" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "texto", label: "Texto" },
];

/** Caracteres especiais do formato de Wi-Fi precisam de barra antes. */
const wifiEsc = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");

interface Matrix {
  size: number;
  dark: boolean[][];
}

function buildMatrix(data: string): Matrix | null {
  if (!data) return null;
  try {
    const qr = qrcode(0, "M");
    qr.addData(data);
    qr.make();
    const size = qr.getModuleCount();
    return { size, dark: Array.from({ length: size }, (_, r) => Array.from({ length: size }, (_, c) => qr.isDark(r, c))) };
  } catch {
    return null; // texto grande demais para um QR code
  }
}

const MARGIN = 4; // "zona quieta" exigida pelo padrão, em módulos

function toSvg(m: Matrix, fg: string, bg: string) {
  const total = m.size + MARGIN * 2;
  let d = "";
  m.dark.forEach((row, r) => row.forEach((on, c) => on && (d += `M${c + MARGIN},${r + MARGIN}h1v1h-1z`)));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="${bg}"/><path d="${d}" fill="${fg}"/></svg>`;
}

function download(name: string, blob: Blob) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function downloadPng(m: Matrix, fg: string, bg: string, px: number) {
  const total = m.size + MARGIN * 2;
  const scale = Math.max(1, Math.floor(px / total));
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = total * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = fg;
  m.dark.forEach((row, r) => row.forEach((on, c) => on && ctx.fillRect((c + MARGIN) * scale, (r + MARGIN) * scale, scale, scale)));
  canvas.toBlob((b) => b && download("qr-code.png", b), "image/png");
}

/** Contraste aproximado (luminância relativa): QR claro sobre fundo escuro ou cores próximas não leem bem. */
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export default function QrTool() {
  const [kind, setKind] = useState<Kind>("link");
  const [link, setLink] = useState("https://padariadaana.com.br/cardapio");
  const [text, setText] = useState("");
  const [ssid, setSsid] = useState("Padaria da Ana");
  const [pass, setPass] = useState("");
  const [sec, setSec] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("Olá! Quero fazer uma encomenda.");
  const [fg, setFg] = useState("#0c1a4b");
  const [bg, setBg] = useState("#ffffff");
  const [px, setPx] = useState(1024);

  const data = useMemo(() => {
    if (kind === "link") {
      const v = link.trim();
      return v && !/^[a-z]+:/i.test(v) ? `https://${v}` : v;
    }
    if (kind === "texto") return text.trim();
    if (kind === "wifi") return ssid.trim() ? `WIFI:T:${sec};S:${wifiEsc(ssid.trim())};${sec !== "nopass" ? `P:${wifiEsc(pass)};` : ""};` : "";
    const n = phone.replace(/\D/g, "").replace(/^0+/, "");
    if (n.length < 10) return "";
    const full = n.startsWith("55") && n.length > 11 ? n : `55${n}`;
    return `https://wa.me/${full}${msg.trim() ? `?text=${encodeURIComponent(msg.trim())}` : ""}`;
  }, [kind, link, text, ssid, pass, sec, phone, msg]);

  const matrix = useMemo(() => buildMatrix(data), [data]);
  const svg = matrix ? toSvg(matrix, fg, bg) : "";
  const contrast = (Math.max(luminance(fg), luminance(bg)) + 0.05) / (Math.min(luminance(fg), luminance(bg)) + 0.05);
  const inverted = luminance(fg) > luminance(bg);

  return (
    <ToolLayout
      tool={tool}
      lead="Escolha o tipo, preencha e baixe. O QR code não expira e não passa por nenhum servidor nosso: é gerado no seu navegador."
      explain={
        <>
          <h2>Para que serve um QR code</h2>
          <p>
            O QR code é um código de barras quadrado que a câmera do celular lê. Ele leva a pessoa a um link, conecta no Wi-Fi ou abre uma conversa no
            WhatsApp sem ela precisar digitar nada. É o jeito mais rápido de levar quem está na loja, no evento ou com o seu panfleto na mão para o seu site.
          </p>
          <h2>QR code grátis expira?</h2>
          <p>
            Os QR codes gerados aqui são <strong>estáticos</strong>: o conteúdo fica gravado no próprio desenho. Eles não expiram, não têm limite de leituras
            e não dependem do CriaSite continuar no ar. Muitos geradores “grátis” criam QR codes dinâmicos, que passam por um endereço deles e param de
            funcionar quando o período de teste acaba. Antes de imprimir mil panfletos, confira de onde veio o seu.
          </p>
          <h2>Dicas para imprimir</h2>
          <ul>
            <li>Tamanho mínimo de 2 × 2 cm em cartão de visita; em cartaz, 1 cm para cada 10 cm de distância de leitura.</li>
            <li>Código escuro sobre fundo claro. Invertido (claro no escuro) muitos celulares não leem.</li>
            <li>Deixe a margem branca em volta: ela faz parte do código.</li>
            <li>Teste com dois celulares diferentes antes de mandar para a gráfica. Para impressão, baixe em SVG, que não perde qualidade.</li>
          </ul>
          <h2>QR code para o WhatsApp</h2>
          <p>
            O tipo WhatsApp gera o mesmo link do <Link to="/ferramentas/link-whatsapp">gerador de link do WhatsApp</Link>, com a mensagem pronta. Ótimo
            para cardápio, embalagem e balcão: o cliente aponta a câmera e já cai na conversa.
          </p>
        </>
      }
    >
      <ToolPanel>
        <div role="radiogroup" aria-label="Tipo de QR code" className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              role="radio"
              aria-checked={kind === k.id}
              onClick={() => setKind(k.id)}
              className={cx("min-h-11 rounded-full px-4 text-sm font-bold", kind === k.id ? "bg-brand text-white" : "bg-night-2 text-moon hover:bg-night-3")}
            >
              {k.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-4 [&>*]:flex-none">
            {kind === "link" && (
              <Field label="Endereço (link)" htmlFor="qr-link">
                <input id="qr-link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="seusite.com.br" className={inputCls} />
              </Field>
            )}
            {kind === "texto" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="qr-text" className="text-sm font-semibold text-moon-muted">
                  Texto
                </label>
                <textarea id="qr-text" rows={4} value={text} onChange={(e) => setText(e.target.value)} className={`${inputCls} h-auto resize-y py-3`} />
              </div>
            )}
            {kind === "wifi" && (
              <>
                <Field label="Nome da rede (SSID)" htmlFor="qr-ssid">
                  <input id="qr-ssid" value={ssid} onChange={(e) => setSsid(e.target.value)} className={inputCls} />
                </Field>
                <div className="flex flex-wrap gap-4">
                  <Field label="Senha" htmlFor="qr-pass">
                    <input id="qr-pass" value={pass} onChange={(e) => setPass(e.target.value)} disabled={sec === "nopass"} className={inputCls} />
                  </Field>
                  <Field label="Segurança" htmlFor="qr-sec">
                    <select id="qr-sec" value={sec} onChange={(e) => setSec(e.target.value as typeof sec)} className={inputCls}>
                      <option value="WPA">WPA/WPA2/WPA3</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">Sem senha</option>
                    </select>
                  </Field>
                </div>
              </>
            )}
            {kind === "whatsapp" && (
              <>
                <Field label="Número com DDD" htmlFor="qr-phone">
                  <input id="qr-phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 91234-5678" className={inputCls} />
                </Field>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="qr-msg" className="text-sm font-semibold text-moon-muted">
                    Mensagem inicial
                  </label>
                  <textarea id="qr-msg" rows={2} value={msg} onChange={(e) => setMsg(e.target.value)} className={`${inputCls} h-auto resize-y py-3`} />
                </div>
              </>
            )}

            <div className="flex flex-wrap gap-4">
              <Field label="Cor do código" htmlFor="qr-fg">
                <input id="qr-fg" type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-[52px] w-full cursor-pointer rounded-xl border border-night-line-2 bg-night-2 p-1.5" />
              </Field>
              <Field label="Cor do fundo" htmlFor="qr-bg">
                <input id="qr-bg" type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-[52px] w-full cursor-pointer rounded-xl border border-night-line-2 bg-night-2 p-1.5" />
              </Field>
              <Field label="Tamanho do PNG" htmlFor="qr-px">
                <select id="qr-px" value={px} onChange={(e) => setPx(Number(e.target.value))} className={inputCls}>
                  <option value={512}>512 px</option>
                  <option value={1024}>1024 px</option>
                  <option value={2048}>2048 px (impressão)</option>
                </select>
              </Field>
            </div>
            {(contrast < 4 || inverted) && (
              <p className="rounded-xl bg-night-2 p-3 text-sm text-glow">
                {inverted ? "Código mais claro que o fundo: muitos celulares não leem QR invertido." : "Pouco contraste entre as cores: alguns celulares podem não ler."}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-full max-w-[300px] overflow-hidden rounded-2xl bg-white">
              {svg ? (
                <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} alt="Prévia do QR code" className="block aspect-square w-full" />
              ) : (
                <div className="grid aspect-square w-full place-items-center p-6 text-center text-sm font-semibold text-muted">
                  {data ? "Conteúdo grande demais para um QR code. Encurte o texto." : "Preencha os campos para ver o QR code."}
                </div>
              )}
            </div>
            <div className="flex w-full max-w-[300px] flex-col gap-2">
              <button type="button" disabled={!matrix} onClick={() => matrix && downloadPng(matrix, fg, bg, px)} className={btnCls}>
                Baixar PNG
              </button>
              <button type="button" disabled={!matrix} onClick={() => svg && download("qr-code.svg", new Blob([svg], { type: "image/svg+xml" }))} className={btnGhostCls}>
                Baixar SVG (impressão)
              </button>
            </div>
          </div>
        </div>
        <ToolDisclaimer />
      </ToolPanel>
    </ToolLayout>
  );
}
