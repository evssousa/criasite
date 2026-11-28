import { StaticPage, TextLink, type DocSection } from "~/components/StaticPage";
import { seo } from "~/lib/seo";
import { SITE } from "~/lib/site";

export const meta = () => seo({ title: "Política de cookies", description: `Quais cookies o ${SITE.name} usa e como desativá-los.`, path: "/cookies" });

// Banner de consentimento: app/components/CookieConsent.tsx (liga com ADSENSE_CLIENT ou GA_MEASUREMENT_ID; lógica em app/analytics/).
const COOKIE_TYPES = [
  { type: "Essenciais", status: "Só o necessário", use: "Fazem o site funcionar e protegem contra abusos.", consent: "Não precisa: o site não funciona sem eles." },
  {
    type: "Preferências",
    status: "Em uso",
    use: "Guardam no seu navegador (armazenamento local) as escolhas no aviso de cookies (Estatística e Anúncios, em criasite_consent), as ferramentas favoritas, o progresso da trilha e os rascunhos das ferramentas que salvam o que você digitou.",
    consent: "Não precisa: só guardam o que você escolheu, e nada é enviado para nós.",
  },
  {
    type: "Contagem de visitas",
    status: "Sem cookies",
    use: "A contagem de visitas do próprio site (páginas abertas, de onde veio a visita, tipo de aparelho) não usa cookies nem guarda nada no seu aparelho; é agregada por dia.",
    consent: "Não precisa: não há cookie nem dado que identifique você.",
  },
  {
    type: "Estatística",
    status: "Google Analytics",
    use: "O Google Analytics 4 mede quais páginas são vistas, por quanto tempo e de onde vêm as visitas, de forma agregada, com um identificador aleatório no cookie _ga (guardado por até 14 meses). O Google não guarda o seu IP (usa só para estimar a região). Não usamos esses dados para anúncios nem ligamos a sua conta Google.",
    consent: "Sim: só com a sua permissão em “Estatística”. Sem ela, o Google Analytics nem é carregado.",
  },
  {
    type: "Publicidade",
    status: "Google AdSense",
    use: "Exibem anúncios, evitam repetir o mesmo anúncio e medem resultados. Os personalizados usam o seu histórico de navegação.",
    consent: "Sim: anúncios personalizados só com a sua permissão em “Anúncios” (ou “Aceitar todos”).",
  },
];

const BROWSERS = [
  { name: "Chrome", href: "https://support.google.com/chrome/answer/95647?hl=pt-BR" },
  { name: "Firefox", href: "https://support.mozilla.org/pt-BR/kb/limpe-cookies-e-dados-de-sites-no-firefox" },
  { name: "Safari", href: "https://support.apple.com/pt-br/guide/safari/sfri11471/mac" },
  { name: "Edge", href: "https://support.microsoft.com/pt-br/microsoft-edge/excluir-cookies-no-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" },
];

const sections: DocSection[] = [
  {
    id: "o-que-sao",
    title: "O que são cookies",
    body: (
      <p>
        Cookies são pequenos arquivos que o site guarda no seu navegador. Eles servem para lembrar informações entre uma página e outra, como preferências ou se
        você já fez login.
      </p>
    ),
  },
  {
    id: "tipos",
    title: "Quais usamos",
    body: (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">TIPO</th>
              <th scope="col">SITUAÇÃO</th>
              <th scope="col">PARA QUÊ</th>
              <th scope="col">CONSENTIMENTO</th>
            </tr>
          </thead>
          <tbody>
            {COOKIE_TYPES.map((c) => (
              <tr key={c.type}>
                <td>{c.type}</td>
                <td className="whitespace-nowrap">{c.status}</td>
                <td>{c.use}</td>
                <td>{c.consent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "terceiros",
    title: "Cookies de terceiros",
    body: (
      <p>
        Quando uma notícia tiver um vídeo ou post incorporado (YouTube, X, Instagram), essa plataforma pode gravar os próprios cookies, de acordo com a política de
        privacidade dela. Os vídeos do YouTube usam o modo de privacidade aprimorada (youtube-nocookie.com).
      </p>
    ),
  },
  {
    id: "google",
    title: "Anúncios do Google",
    body: (
      <>
        <p>
          Fornecedores terceiros, incluindo o Google, usam cookies para exibir anúncios com base nas suas visitas anteriores a este e a outros sites. Esses
          cookies permitem que o Google e os parceiros dele exibam anúncios com base nas suas visitas a este e a outros sites da internet.
        </p>
        <p>
          Você pode desativar a publicidade personalizada nas <TextLink to="https://myadcenter.google.com/">configurações de anúncios do Google</TextLink> e
          ver <TextLink to="https://policies.google.com/technologies/partner-sites?hl=pt-BR">como o Google usa essas informações</TextLink>. Outros fornecedores
          podem ser desativados em <TextLink to="https://www.aboutads.info/choices/">aboutads.info</TextLink>.
        </p>
      </>
    ),
  },
  {
    id: "gerenciar",
    title: "Como desativar",
    body: (
      <>
        <p>Você pode apagar ou bloquear cookies nas configurações do navegador. Bloquear os essenciais pode fazer partes do site pararem de funcionar.</p>
        <ul>
          {BROWSERS.map((b) => (
            <li key={b.name}>
              <a href={b.href} target="_blank" rel="noopener noreferrer">
                {b.name}
              </a>
            </li>
          ))}
        </ul>
        <p>
          Na primeira visita você escolhe entre aceitar tudo, só os essenciais ou personalizar (Estatística e Anúncios separados). Depois, mude a sua escolha a
          qualquer momento pelo link “Preferências de cookies”, no rodapé do site. Desligar a Estatística apaga os cookies _ga do Google Analytics deste site.
        </p>
      </>
    ),
  },
  {
    id: "mais",
    title: "Mais informações",
    body: (
      <p>
        Para saber como tratamos dados pessoais em geral, leia a <TextLink to="/privacidade">política de privacidade</TextLink>.
      </p>
    ),
  },
];

export default function Cookies() {
  return (
    <StaticPage
      path="/cookies"
      title="Política de cookies"
      lead="Usamos cookies essenciais para o site funcionar e cookies opcionais (estatística e anúncios personalizados) que só rodam depois que você aceita, cada um separado, num aviso na primeira visita."
      sections={sections}
    />
  );
}
