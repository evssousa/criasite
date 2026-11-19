import { ChannelCard, StaticPage, type DocSection } from "~/components/StaticPage";
import { seo } from "~/lib/seo";
import { mailto, SITE } from "~/lib/site";

export const meta = () => seo({ title: "Contato", description: `Como falar com a equipe do ${SITE.name}: correções, sugestões, privacidade e publicidade.`, path: "/contato" });

const sections: DocSection[] = [
  {
    id: "respostas",
    title: "Prazo de resposta",
    body: <p>Respondemos em até 5 dias úteis. Pedidos sobre dados pessoais (LGPD) são respondidos em até 15 dias.</p>,
  },
  {
    id: "o-que-nao-fazemos",
    title: "O que não fazemos",
    body: (
      <ul>
        <li>não criamos sites sob encomenda nem indicamos profissionais;</li>
        <li>não damos suporte técnico individual para o seu site ou a sua hospedagem;</li>
        <li>não publicamos texto patrocinado disfarçado de notícia.</li>
      </ul>
    ),
  },
  {
    id: "site-invadido",
    title: "Seu site foi invadido?",
    body: (
      <p>
        Fale primeiro com a sua hospedagem: ela tem acesso aos arquivos e às cópias de segurança. Troque as senhas do painel, do FTP e do banco de dados, atualize
        todos os plugins e temas e só depois restaure uma cópia anterior ao ataque.
      </p>
    ),
  },
];

export default function Contact() {
  return (
    <StaticPage path="/contato" title="Contato" lead={`Fale com a equipe pelo e-mail ${SITE.email}. Escolha o assunto para a mensagem chegar no lugar certo.`} sections={sections}>
      <div className="grid gap-3 sm:grid-cols-2">
        <ChannelCard code="Correção" title="Achei um erro" href={mailto("Correção")} cta="Enviar correção">
          Informação errada, link quebrado ou ferramenta com problema? Mande o endereço da página.
        </ChannelCard>
        <ChannelCard code="Sugestão" title="Ideia de ferramenta ou guia" href={mailto("Sugestão")} cta="Enviar sugestão">
          Uma ferramenta que faz falta ou algo que deveríamos explicar.
        </ChannelCard>
        <ChannelCard code="LGPD" title="Privacidade" href={mailto("LGPD")} cta="Pedido de dados">
          Pedidos sobre os seus dados pessoais.
        </ChannelCard>
        <ChannelCard code="Comercial" title="Publicidade" href="/anuncie" cta="Ver o mídia kit">
          Mídia kit, formatos e regras para anunciar.
        </ChannelCard>
      </div>
    </StaticPage>
  );
}
