import { ChannelCard, StaticPage, TextLink, type DocSection } from "~/components/StaticPage";
import { seo } from "~/lib/seo";
import { SITE } from "~/lib/site";

export const meta = () => seo({ title: "Sobre", description: `O que é o ${SITE.name}, o que publicamos e como trabalhamos.`, path: "/sobre" });

const sections: DocSection[] = [
  {
    id: "o-que-e",
    title: "O que é o CriaSite",
    body: (
      <p>
        O {SITE.name} é um site brasileiro para quem cria e cuida de sites: donos de pequenos negócios, freelancers, blogueiros e quem está começando. Juntamos em um
        lugar só as ferramentas do dia a dia, as notícias que mudam alguma coisa para o seu site e guias passo a passo em português claro.
      </p>
    ),
  },
  {
    id: "o-que-publicamos",
    title: "O que publicamos",
    body: (
      <ul>
        <li>
          <strong>Ferramentas gratuitas</strong> que rodam no navegador: comprimir imagem, QR code, link do WhatsApp, meta tags e contador de caracteres;
        </li>
        <li>
          <strong>Notícias da web</strong>: Google e SEO, WordPress e plataformas, inteligência artificial e segurança, sempre com o que muda para o seu site;
        </li>
        <li>
          <strong>A trilha do site no ar</strong>: as sete etapas do domínio ao primeiro visitante, com checklist;
        </li>
        <li>
          <strong>Guias</strong> do básico ao avançado.
        </li>
      </ul>
    ),
  },
  {
    id: "privacidade",
    title: "Suas informações ficam com você",
    body: (
      <p>
        As ferramentas funcionam no seu navegador. As imagens que você comprime, os textos que conta e os links que gera não são enviados para nenhum servidor do{" "}
        {SITE.name}. A exceção é a ferramenta “Está fora do ar?”, que usa o nosso servidor para acessar o endereço digitado, sem gravá-lo. As ferramentas favoritas e o progresso da trilha ficam salvos só no seu navegador. Os detalhes estão na{" "}
        <TextLink to="/privacidade">política de privacidade</TextLink>.
      </p>
    ),
  },
  {
    id: "como-trabalhamos",
    title: "Como trabalhamos",
    body: (
      <p>
        Usamos automação e inteligência artificial para acompanhar muitas fontes ao mesmo tempo, sempre com fontes creditadas e regras para não inventar números.
        Os guias são escritos e revisados pela {SITE.team}. Os detalhes estão na <TextLink to="/politica-editorial">política editorial</TextLink>.
      </p>
    ),
  },
];

export default function About() {
  return (
    <StaticPage path="/sobre" title="Sobre o CriaSite" lead={SITE.tagline + "."} sections={sections}>
      <div className="grid gap-3 sm:grid-cols-3">
        <ChannelCard code="Ferramentas" title="Ferramentas grátis" href="/ferramentas" cta="Abrir ferramentas">
          Imagem, QR code, WhatsApp, meta tags e mais.
        </ChannelCard>
        <ChannelCard code="Notícias" title="Notícias da web" href="/noticias" cta="Ler notícias">
          O que muda no Google, no WordPress e na web.
        </ChannelCard>
        <ChannelCard code="Trilha" title="Trilha do site no ar" href="/trilha" cta="Ver a trilha">
          Do domínio ao primeiro visitante, em sete etapas.
        </ChannelCard>
      </div>
    </StaticPage>
  );
}
