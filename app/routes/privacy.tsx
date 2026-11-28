import { StaticPage, TextLink, type DocSection } from "~/components/StaticPage";
import { seo } from "~/lib/seo";
import { mailto, SITE } from "~/lib/site";

export const meta = () =>
  seo({ title: "Política de privacidade", description: `Como o ${SITE.name} trata seus dados pessoais, de acordo com a LGPD.`, path: "/privacidade" });

// Site informativo, mantido sem CNPJ: o controlador é identificado pelo nome do site
// e pelo e-mail de contato. Inclui as informações que o Google AdSense exige (cookies de
// terceiros, links para a política do Google e para desativar anúncios personalizados).
const sections: DocSection[] = [
  {
    id: "controlador",
    title: "Quem cuida dos seus dados",
    body: (
      <p>
        O {SITE.name} é um site informativo, mantido de forma independente, e é o responsável (controlador) pelos dados tratados aqui. Para qualquer assunto
        sobre privacidade, escreva para <TextLink to={mailto("LGPD")}>{SITE.email}</TextLink> com o assunto “LGPD”.
      </p>
    ),
  },
  {
    id: "dados",
    title: "Quais dados coletamos",
    body: (
      <>
        <p>Hoje o {SITE.name} não tem contas de usuário, comentários ou formulários de cadastro. Os dados que podemos tratar são:</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">DADO</th>
                <th scope="col">QUANDO</th>
                <th scope="col">PARA QUÊ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Dados técnicos de acesso</td>
                <td>Toda visita: endereço IP, data e hora, navegador, página acessada.</td>
                <td>Manter o site seguro e funcionando. O Marco Civil da Internet exige guardar registros de acesso por 6 meses.</td>
              </tr>
              <tr>
                <td>Contagem de visitas (sem cookies)</td>
                <td>
                  Quando uma página termina de abrir, o seu navegador avisa o nosso servidor qual página foi aberta, de onde você veio (o site anterior ou os parâmetros UTM do
                  link) e o tipo de aparelho, navegador e idioma. Para não contar a mesma pessoa duas vezes no dia, o servidor calcula um código a partir do IP e do navegador com
                  uma chave que é trocada e apagada todos os dias: o código só vale naquele dia e não permite identificar ninguém. Não guardamos o IP nessa contagem. Robôs não
                  são contados.
                </td>
                <td>Entender quais conteúdos são mais lidos e melhorar o site. Não usa cookies nem guarda nada no seu aparelho.</td>
              </tr>
              <tr>
                <td>Estatística do Google Analytics (somente com a sua permissão)</td>
                <td>
                  Se você aceitar “Estatística” no aviso de cookies, o Google Analytics 4 recebe as páginas que você abre, o tempo de engajamento, o tipo de aparelho e
                  navegador e a região aproximada, ligados a um identificador aleatório guardado no cookie _ga. O IP só é usado para estimar a região e não é
                  guardado. Não enviamos nome, e-mail nem o que você digita nas ferramentas.
                </td>
                <td>Entender quais conteúdos e ferramentas são mais usados e de onde vêm as visitas, de forma agregada.</td>
              </tr>
              <tr>
                <td>Identificadores de anúncios (cookies e dados do navegador)</td>
                <td>Quando há anúncios na página. Os personalizados só com a sua permissão.</td>
                <td>Exibir anúncios do Google AdSense, limitar repetições e medir resultados.</td>
              </tr>
              <tr>
                <td>Arquivos e textos usados nas ferramentas</td>
                <td>Quando você usa uma ferramenta (imagens, textos, números de telefone, links).</td>
                <td>
                  Nenhum: as ferramentas rodam no seu navegador e não enviam esses dados para os nossos servidores. Eles somem quando você fecha a página. A única exceção é a
                  ferramenta “Está fora do ar?”, descrita na linha abaixo.
                </td>
              </tr>
              <tr>
                <td>Endereço de site digitado na ferramenta “Está fora do ar?”</td>
                <td>Quando você pede uma checagem nessa ferramenta.</td>
                <td>
                  Fazer a checagem: o nosso servidor acessa esse endereço uma vez e devolve o resultado. O endereço não é gravado em banco de dados nem em arquivo de log. Ele fica
                  só na memória do servidor por até 1 minuto, para reaproveitar uma checagem feita há pouco e não sobrecarregar o site checado, e o seu endereço IP fica na memória
                  por até 1 hora, para limitar abusos. Depois, os dois são descartados. As suas últimas checagens ficam só no armazenamento local do seu navegador.
                </td>
              </tr>
              <tr>
                <td>Ferramentas favoritas, progresso da trilha e rascunhos das ferramentas</td>
                <td>Quando você fixa uma ferramenta, marca uma etapa da trilha ou preenche os geradores de prompt e de arquivo de instruções.</td>
                <td>
                  Lembrar as suas escolhas e os seus rascunhos na próxima visita. Ficam só no armazenamento local do seu navegador (localStorage); não chegam até nós. Os rascunhos dos
                  geradores podem ser apagados a qualquer momento no botão “Limpar tudo” de cada ferramenta.
                </td>
              </tr>
              <tr>
                <td>Nome e e-mail</td>
                <td>Quando você nos escreve.</td>
                <td>Responder a sua mensagem.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: "bases-legais",
    title: "Bases legais",
    body: (
      <ul>
        <li>
          <strong>Obrigação legal</strong>: guarda dos registros de acesso (Marco Civil da Internet, art. 15);
        </li>
        <li>
          <strong>Legítimo interesse</strong>: segurança do site e resposta às mensagens que você envia;
        </li>
        <li>
          <strong>Consentimento</strong>: cookies de estatística (Google Analytics) e de anúncios personalizados, cada um separado. Você pode retirar o consentimento quando quiser, pelo link
          “Preferências de cookies” no rodapé.
        </li>
      </ul>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    body: (
      <p>
        Usamos cookies para o site funcionar e, com a sua permissão, para a estatística de audiência (Google Analytics) e para exibir anúncios personalizados. Os detalhes e as formas de desativar estão na{" "}
        <TextLink to="/cookies">política de cookies</TextLink>.
      </p>
    ),
  },
  {
    id: "anuncios",
    title: "Anúncios do Google",
    body: (
      <>
        <p>O {SITE.name} pode exibir anúncios do Google AdSense, que ajudam a manter o site gratuito. Sobre esses anúncios:</p>
        <ul>
          <li>fornecedores terceiros, incluindo o Google, usam cookies para exibir anúncios com base nas suas visitas anteriores a este e a outros sites;</li>
          <li>os cookies de publicidade permitem que o Google e os parceiros dele exibam anúncios com base nas suas visitas a este e a outros sites da internet;</li>
          <li>
            os anúncios personalizados só são ativados se você permitir “Anúncios” (ou escolher “Aceitar todos”) no aviso de cookies. Com “Só os essenciais”, o Google pode exibir anúncios
            não personalizados, que usam só o contexto da página;
          </li>
          <li>
            você pode desativar a publicidade personalizada nas <TextLink to="https://myadcenter.google.com/">configurações de anúncios do Google</TextLink> e,
            para outros fornecedores, em <TextLink to="https://www.aboutads.info/choices/">aboutads.info</TextLink>.
          </li>
        </ul>
        <p>
          Saiba{" "}
          <TextLink to="https://policies.google.com/technologies/partner-sites?hl=pt-BR">como o Google usa as informações de sites que usam os serviços dele</TextLink>.
        </p>
      </>
    ),
  },
  {
    id: "compartilhamento",
    title: "Com quem compartilhamos",
    body: (
      <>
        <p>Não vendemos dados pessoais. Dados podem ser tratados por fornecedores que nos ajudam a operar o site, sempre só no necessário:</p>
        <ul>
          <li>empresa de hospedagem, onde o site e o banco de dados ficam guardados;</li>
          <li>Google (AdSense), para exibir anúncios, como descrito acima;</li>
          <li>Google (Analytics), para a estatística de audiência, só com a sua permissão: identificador aleatório do navegador, páginas vistas e eventos;</li>
          <li>autoridades públicas, quando houver ordem judicial ou obrigação legal.</li>
        </ul>
        <p>
          Alguns desses fornecedores podem guardar dados fora do Brasil. Nesses casos, a transferência segue as regras da LGPD para transferência internacional.
        </p>
        <p>Anunciantes e parceiros comerciais recebem só números agregados, como o total de leituras de uma página, nunca dados que identifiquem você.</p>
      </>
    ),
  },
  {
    id: "retencao",
    title: "Por quanto tempo guardamos",
    body: (
      <ul>
        <li>registros de acesso: 6 meses, como exige o Marco Civil da Internet;</li>
        <li>mensagens de contato: pelo tempo necessário para resolver o assunto e, depois, até 2 anos para histórico;</li>
        <li>contagem de visitas (números por dia, página, origem e aparelho, sem dado pessoal): 13 meses; os totais por dia ficam sem prazo;</li>
        <li>Google Analytics (estatística com a sua permissão): 14 meses.</li>
      </ul>
    ),
  },
  {
    id: "seguranca",
    title: "Segurança",
    body: (
      <p>
        O site usa conexão criptografada (HTTPS) e acesso restrito aos sistemas. Nenhum sistema é totalmente imune a falhas, mas, se acontecer um incidente que
        coloque seus dados em risco, avisaremos você e a Autoridade Nacional de Proteção de Dados (ANPD), como determina a lei.
      </p>
    ),
  },
  {
    id: "direitos",
    title: "Seus direitos",
    body: (
      <>
        <p>Pela LGPD (art. 18), você pode pedir a qualquer momento:</p>
        <ul>
          <li>confirmação de que tratamos seus dados e acesso a eles;</li>
          <li>correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>anonimização, bloqueio ou eliminação de dados desnecessários;</li>
          <li>portabilidade dos dados a outro fornecedor;</li>
          <li>informação sobre com quem compartilhamos seus dados;</li>
          <li>revogação do consentimento.</li>
        </ul>
        <p>
          Faça o pedido pelo e-mail <TextLink to={mailto("LGPD")}>{SITE.email}</TextLink>. Respondemos em até 15 dias. Se não ficar satisfeito, você também pode
          reclamar à ANPD.
        </p>
      </>
    ),
  },
  {
    id: "menores",
    title: "Crianças e adolescentes",
    body: (
      <p>
        O {SITE.name} é aberto a todos os públicos, mas não coleta de propósito dados de crianças. Quando houver contas de usuário, menores de idade precisarão de
        autorização dos responsáveis, como manda a lei.
      </p>
    ),
  },
  {
    id: "mudancas",
    title: "Mudanças nesta política",
    body: (
      <p>
        Esta política será atualizada quando lançarmos novos recursos, como contas de usuário, comentários e newsletter. A data da última atualização fica no topo
        da página.
      </p>
    ),
  },
];

export default function Privacy() {
  return (
    <StaticPage
      path="/privacidade"
      title="Política de privacidade"
      lead={`Como o ${SITE.name} trata seus dados, de acordo com a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).`}
      sections={sections}
    />
  );
}
