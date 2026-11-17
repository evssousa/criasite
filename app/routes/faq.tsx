import { Link } from "react-router";
import { StaticPage } from "~/components/StaticPage";
import { seo } from "~/lib/seo";
import { SITE } from "~/lib/site";

const FAQ: { q: string; a: string; link?: { to: string; label: string } }[] = [
  {
    q: "As ferramentas são grátis mesmo?",
    a: "Sim. Todas são gratuitas e sem cadastro. Só a “Está fora do ar?” tem um limite de checagens por minuto, para evitar abuso. O site se mantém com anúncios.",
    link: { to: "/ferramentas", label: "Ver as ferramentas" },
  },
  {
    q: "As minhas imagens e textos são enviados para algum lugar?",
    a: "Não. As ferramentas rodam no seu navegador: a compressão de imagem, o QR code, o link do WhatsApp e as meta tags são gerados no seu computador ou celular, sem envio para os nossos servidores. A exceção é a “Está fora do ar?”: o endereço que você digita vai para o nosso servidor só para fazer a checagem e não é gravado.",
    link: { to: "/privacidade", label: "Política de privacidade" },
  },
  {
    q: "O QR code gerado aqui expira?",
    a: "Não. É um QR code estático: o conteúdo fica gravado no próprio desenho. Ele funciona para sempre, sem limite de leituras, mesmo se o CriaSite sair do ar.",
    link: { to: "/ferramentas/qr-code", label: "Gerador de QR code" },
  },
  {
    q: "Como fixo uma ferramenta na página inicial?",
    a: "Toque na estrela ao lado da ferramenta no diretório, ou em “Fixar na home” na página dela. Ela aparece em “Suas ferramentas” sempre que você voltar neste navegador.",
  },
  {
    q: "As notícias são escritas por inteligência artificial?",
    a: "Usamos automação e IA para acompanhar fontes e redigir as notícias, sempre com fontes creditadas e regras para não inventar números. Os guias são escritos pela equipe. Os detalhes estão na política editorial.",
    link: { to: "/politica-editorial", label: "Política editorial" },
  },
  {
    q: "Vocês criam sites sob encomenda?",
    a: "Não. O CriaSite é um site de ferramentas e conteúdo. Não vendemos serviços de criação de site nem indicamos profissionais.",
  },
  {
    q: "Achei um erro. Como aviso?",
    a: `Escreva para ${SITE.email} com o endereço da página. Corrigimos e, quando o erro é de informação, deixamos uma nota no texto.`,
    link: { to: "/contato", label: "Contato" },
  },
];

export const meta = () => [
  ...seo({ title: "Perguntas frequentes", description: `Dúvidas comuns sobre o ${SITE.name}: ferramentas, privacidade, QR code e notícias.`, path: "/faq" }),
  {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  },
];

export default function Faq() {
  return (
    <StaticPage path="/faq" title="Perguntas frequentes" lead="As dúvidas que mais chegam, respondidas sem enrolação.">
      <div className="flex max-w-[760px] flex-col gap-3">
        {FAQ.map((f) => (
          <details key={f.q} className="group rounded-[14px] border border-line bg-card">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 text-lg font-bold [&::-webkit-details-marker]:hidden">
              {f.q}
              <span aria-hidden className="text-violet transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="flex flex-col gap-3 px-5 pb-5 text-[17px] leading-relaxed text-[#26325f]">
              <p>{f.a}</p>
              {f.link && (
                <Link to={f.link.to} className="font-bold text-violet hover:text-violet-deep">
                  {f.link.label}
                </Link>
              )}
            </div>
          </details>
        ))}
      </div>
    </StaticPage>
  );
}
