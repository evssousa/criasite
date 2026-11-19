// Configuração do contador de visitas ESPECÍFICA DO SITE (CriaSite). Ao copiar o módulo para outro site, este arquivo,
// `db.ts`, `site.server.ts` e `ui/visitas.css` são os que mudam. Dados puros: nada de banco aqui.
import type { TipoPagina } from "./core/caminho";

/** Editorias de posts (mantenha em sincronia com SECTION_SLUGS em app/routes.ts). */
const SECOES = "noticias|google|plataformas|ia|seguranca|guias";

export const VISITAS = {
  site: "CriaSite",
  /** Referrer destes endereços conta como navegação interna. */
  hosts: ["criasite.app", "www.criasite.app", "localhost"],
  /** Cookie da sessão do admin: quando presente, a visita não é contada. */
  cookieAdmin: "__criasite_admin",
  /** Quantos dias guardar páginas e origens (os totais por dia ficam sem prazo). */
  retencaoDias: 400,
  /** A ordem importa: o primeiro tipo que bate vence. */
  tipos: [
    { tipo: "inicio", rotulo: "Página inicial", re: /^\/$/ },
    { tipo: "guia", rotulo: "Guia", re: /^\/guias\/[^/]+$/ },
    { tipo: "materia", rotulo: "Matéria", re: new RegExp(`^/(${SECOES})/[^/]+$`) },
    { tipo: "ferramenta", rotulo: "Ferramenta", re: /^\/ferramentas\/[^/]+$/ },
    { tipo: "lista", rotulo: "Lista", re: new RegExp(`^/(${SECOES}|ferramentas|busca)$`) },
    { tipo: "trilha", rotulo: "Trilha", re: /^\/(trilha|criar-site-com-ia)$/ },
  ] as TipoPagina[],
  /** Abas do "Páginas mais vistas". `tipos: null` = todos. */
  filtros: [
    { id: "tudo", rotulo: "Tudo", tipos: null },
    { id: "materias", rotulo: "Matérias", tipos: ["materia"] },
    { id: "guias", rotulo: "Guias", tipos: ["guia"] },
    { id: "ferramentas", rotulo: "Ferramentas", tipos: ["ferramenta"] },
    { id: "trilha", rotulo: "Trilha", tipos: ["trilha"] },
    { id: "outras", rotulo: "Outras", tipos: ["inicio", "lista", "outra"] },
  ] as { id: string; rotulo: string; tipos: string[] | null }[],
  /** Contadores por matéria: o endereço bate com `re` e o `sql` soma as visitas (primeiro parâmetro = quantidade). */
  contadores: [
    {
      re: new RegExp(`^/(${SECOES})/([^/]+)$`),
      sql: "UPDATE posts SET views = views + ? WHERE section = ? AND slug = ? AND status = 'published'",
      args: (m: RegExpMatchArray) => [m[1], m[2]],
    },
  ],
  /** Títulos fixos das páginas que não são de um conteúdo. */
  fixos: {
    "/": "Página inicial",
    "/noticias": "Notícias",
    "/google": "Google",
    "/plataformas": "Plataformas",
    "/ia": "IA",
    "/seguranca": "Segurança",
    "/guias": "Guias",
    "/ferramentas": "Ferramentas",
    "/trilha": "Trilha: criar um site",
    "/criar-site-com-ia": "Criar um site com IA",
    "/busca": "Busca",
    "/sobre": "Sobre",
    "/contato": "Contato",
    "/faq": "Perguntas frequentes",
    "/politica-editorial": "Política editorial",
    "/anuncie": "Anuncie",
    "/termos": "Termos de uso",
    "/privacidade": "Privacidade",
    "/cookies": "Cookies",
    "/acessibilidade": "Acessibilidade",
    "/mapa-do-site": "Mapa do site",
  } as Record<string, string>,
};

export type ConfigVisitas = typeof VISITAS;
