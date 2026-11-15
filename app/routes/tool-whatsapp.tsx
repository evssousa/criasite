import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/tool-whatsapp";
import { Field, ToolDisclaimer, ToolLayout, ToolPanel, btnCls, btnGhostCls, copyText, inputCls } from "~/components/ToolLayout";
import { seo } from "~/lib/seo";
import { toolBySlug } from "~/lib/site";

const tool = toolBySlug("link-whatsapp")!;

export function meta(_: Route.MetaArgs) {
  return seo({ title: "Gerador de link do WhatsApp com mensagem (wa.me)", description: tool.description, path: "/ferramentas/link-whatsapp" });
}

/** Só os dígitos; tira o 0 de operadora e o +55 digitados à mão. */
function cleanNumber(country: string, raw: string) {
  let n = raw.replace(/\D/g, "");
  const cc = country.replace(/\D/g, "") || "55";
  if (n.startsWith(cc) && n.length > 11) n = n.slice(cc.length);
  n = n.replace(/^0+/, "");
  return { cc, n };
}

export default function WhatsAppTool() {
  const [country, setCountry] = useState("55");
  const [phone, setPhone] = useState("(81) 99876-5432");
  const [msg, setMsg] = useState("Olá! Vi o site e quero fazer um orçamento.");
  const [copied, setCopied] = useState<string | null>(null);

  const { cc, n } = cleanNumber(country, phone);
  const valid = cc === "55" ? n.length === 10 || n.length === 11 : n.length >= 6;
  const link = valid ? `https://wa.me/${cc}${n}${msg.trim() ? `?text=${encodeURIComponent(msg.trim())}` : ""}` : "";
  const html = `<a href="${link}" target="_blank" rel="noopener">Fale conosco no WhatsApp</a>`;

  async function copy(what: "link" | "html") {
    const ok = await copyText(what === "link" ? link : html);
    setCopied(ok ? what : "erro");
    setTimeout(() => setCopied(null), 1800);
  }

  return (
    <ToolLayout
      tool={tool}
      lead="Digite o número e a mensagem: o link abre a conversa com o texto já escrito. Use no botão do site, na bio do Instagram ou em um QR code."
      explain={
        <>
          <h2>Como funciona o link do WhatsApp</h2>
          <p>
            O WhatsApp aceita um endereço no formato <strong>wa.me/número</strong>. Quem clica abre uma conversa com aquele número, no celular ou no computador,
            sem precisar salvar o contato. Com o parâmetro <strong>?text=</strong>, a mensagem já aparece escrita na caixa de texto: a pessoa só toca em enviar.
          </p>
          <p>
            O número vai com o código do país e o DDD, sem espaços, traços, parênteses nem o zero da operadora. Um celular de Recife fica assim: 55 + 81 +
            998765432. A ferramenta limpa o que você digitar e monta o endereço certo.
          </p>
          <h2>Onde usar</h2>
          <ul>
            <li>No botão de contato do site, de preferência fixo no canto da tela no celular.</li>
            <li>Na bio do Instagram e do TikTok, que aceitam um link.</li>
            <li>
              Em um <Link to="/ferramentas/qr-code">QR code</Link> no cardápio, no cartão de visita ou na vitrine da loja.
            </li>
            <li>Em anúncios do Google e das redes, para o cliente cair direto na conversa.</li>
          </ul>
          <h2>Dicas para a mensagem pronta</h2>
          <p>
            Escreva a mensagem como o cliente falaria, e diga de onde ele veio: “Vi o site e quero um orçamento” ajuda você a saber qual canal traz mais
            contatos. Se tiver links diferentes para o site e para o Instagram, mude uma palavra em cada mensagem e você terá essa conta sem nenhuma
            ferramenta de análise.
          </p>
          <h2>Perguntas frequentes</h2>
          <h3>Funciona com WhatsApp Business?</h3>
          <p>Sim. O link é o mesmo para o WhatsApp comum e para o Business.</p>
          <h3>O link expira?</h3>
          <p>Não. Ele funciona enquanto o número tiver WhatsApp. Se trocar de número, gere um link novo.</p>
        </>
      }
    >
      <ToolPanel>
        <div className="flex flex-wrap gap-4">
          <div className="w-28">
            <Field label="País" htmlFor="wa-cc">
              <input id="wa-cc" inputMode="numeric" value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} />
            </Field>
          </div>
          <Field label="Número com DDD" htmlFor="wa-phone" hint={!valid && phone ? "Confira o número: DDD + 8 ou 9 dígitos." : undefined}>
            <input id="wa-phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 91234-5678" className={inputCls} />
          </Field>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wa-msg" className="text-sm font-semibold text-moon-muted">
            Mensagem inicial (opcional)
          </label>
          <textarea id="wa-msg" rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} className={`${inputCls} h-auto resize-y py-3`} />
        </div>

        <div aria-live="polite" className="flex flex-col gap-1 rounded-2xl bg-lime p-5 text-night">
          <span className="text-sm font-bold">Seu link</span>
          <span className="text-lg font-bold break-all">{link || "Digite um número válido para gerar o link."}</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={!link} onClick={() => copy("link")} className={btnCls}>
            {copied === "link" ? "Link copiado" : "Copiar link"}
          </button>
          <a href={link || undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!link} className={btnGhostCls}>
            Testar no WhatsApp
          </a>
          <button type="button" disabled={!link} onClick={() => copy("html")} className={btnGhostCls}>
            {copied === "html" ? "Código copiado" : "Copiar código do botão"}
          </button>
        </div>
        {copied === "erro" && <p className="text-sm text-glow">O navegador bloqueou a cópia. Selecione o link acima e copie com Ctrl+C.</p>}
        <ToolDisclaimer />
      </ToolPanel>
    </ToolLayout>
  );
}
