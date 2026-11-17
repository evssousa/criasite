import { StaticPage, TextLink, type DocSection } from "~/components/StaticPage";
import { seo } from "~/lib/seo";
import { SITE } from "~/lib/site";

export const meta = () => seo({ title: "Termos de uso", description: `Regras de uso do ${SITE.name} e do conteúdo publicado no site.`, path: "/termos" });

// Site de ferramentas e conteúdo: sem vendas e sem cadastro.
const sections: DocSection[] = [
  {
    id: "aceitacao",
    title: "Aceitação",
    body: (
      <p>
        Ao acessar o {SITE.name} ({SITE.url.replace(/^https?:\/\//, "")}), você concorda com estes termos e com a nossa{" "}
        <TextLink to="/privacidade">política de privacidade</TextLink>. Se não concordar, não use o site.
      </p>
    ),
  },
  {
    id: "servico",
    title: "O serviço",
    body: (
      <p>
        O {SITE.name} é um site gratuito com ferramentas, notícias e guias para quem cria e cuida de sites. Não é preciso criar conta para usar o site. As
        ferramentas rodam no seu navegador: os arquivos e textos que você usa nelas não são enviados para os nossos servidores. A exceção é a “Está fora do ar?”, que
        precisa do servidor para acessar o endereço digitado; ela tem limite de uso e não pode ser usada para testar redes internas nem para sobrecarregar sites de
        terceiros. Podemos mudar, suspender ou encerrar qualquer parte do site a qualquer momento.
      </p>
    ),
  },
  {
    id: "ferramentas",
    title: "Uso das ferramentas",
    body: (
      <p>
        Você é responsável pelo que cria com as ferramentas (imagens, QR codes, links e códigos) e por ter o direito de usar os arquivos que envia a elas. Confira o
        resultado antes de publicar ou imprimir: teste o QR code e o link em mais de um celular antes de mandar para a gráfica.
      </p>
    ),
  },
  {
    id: "propriedade",
    title: "Propriedade intelectual",
    body: (
      <>
        <p>Textos, marca, logotipo e elementos visuais criados pelo {SITE.name} são nossos e protegidos pela Lei de Direitos Autorais (Lei 9.610/1998).</p>
        <p>
          Nomes e logotipos de empresas, plataformas e produtos pertencem aos seus donos e aparecem aqui com fins informativos e jornalísticos. Para pedir a remoção de
          algum material, escreva pela página de <TextLink to="/contato">contato</TextLink>.
        </p>
      </>
    ),
  },
  {
    id: "uso-permitido",
    title: "O que você pode fazer",
    body: (
      <ul>
        <li>ler, compartilhar e linkar as nossas notícias, guias e ferramentas;</li>
        <li>citar trechos curtos, desde que com crédito ao {SITE.name} e link para a página original;</li>
        <li>usar as ferramentas para os seus sites e os de seus clientes, inclusive com fins comerciais;</li>
        <li>assinar o nosso feed RSS em leitores de notícias para uso pessoal.</li>
      </ul>
    ),
  },
  {
    id: "uso-proibido",
    title: "O que você não pode fazer",
    body: (
      <ul>
        <li>copiar notícias ou guias inteiros ou republicá-los em outro site, perfil ou canal sem autorização por escrito;</li>
        <li>coletar conteúdo de forma automatizada e em massa (scraping) ou embutir as ferramentas em outro site;</li>
        <li>tentar invadir, sobrecarregar ou atrapalhar o funcionamento do site;</li>
        <li>usar o nome ou a marca {SITE.name} de forma que sugira uma parceria que não existe.</li>
      </ul>
    ),
  },
  {
    id: "links",
    title: "Links externos e anúncios",
    body: (
      <>
        <p>
          Links para sites de terceiros (plataformas, fontes, documentação) são oferecidos por conveniência. Não controlamos esses sites e não respondemos pelo
          conteúdo, pelos serviços ou pelas políticas deles. Alguns links para serviços de hospedagem podem ser de afiliado: se você contratar por eles, recebemos uma comissão, sem custo extra para você. Esses links são sinalizados.
        </p>
        <p>
          O site pode exibir anúncios do Google AdSense, escolhidos pelo Google e separados do conteúdo editorial. Anúncio não é recomendação. Como eles usam
          cookies está na <TextLink to="/cookies">política de cookies</TextLink>.
        </p>
      </>
    ),
  },
  {
    id: "informacao",
    title: "Precisão das informações",
    body: (
      <p>
        Trabalhamos para publicar informações corretas, mas plataformas, regras do Google e preços de serviços mudam o tempo todo. O conteúdo é oferecido como está, sem garantia de que esteja
        livre de erros ou atualizado. Se encontrar um erro, <TextLink to="/contato">avise a gente</TextLink>.
      </p>
    ),
  },
  {
    id: "responsabilidade",
    title: "Limitação de responsabilidade",
    body: (
      <p>
        Na medida permitida pela lei, o {SITE.name} não responde por danos decorrentes de decisões tomadas com base no conteúdo do site, do uso dos arquivos
        gerados pelas ferramentas, de indisponibilidade do site ou de serviços de terceiros.
      </p>
    ),
  },
  {
    id: "alteracoes",
    title: "Alterações",
    body: <p>Podemos atualizar estes termos. A data da última atualização aparece no topo da página, e mudanças importantes serão avisadas no site.</p>,
  },
  {
    id: "lei",
    title: "Lei aplicável",
    body: <p>Estes termos seguem as leis do Brasil.</p>,
  },
];

export default function Terms() {
  return <StaticPage path="/termos" title="Termos de uso" lead={`As regras para usar o ${SITE.name} e o conteúdo que publicamos, em linguagem direta.`} sections={sections} />;
}
