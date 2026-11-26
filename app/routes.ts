import { type RouteConfig, index, route } from "@react-router/dev/routes";

// Editorias de posts: cada uma tem listagem (/google) e página de post (/google/:slug).
// Mantenha em sincronia com SECTIONS em app/lib/site.ts.
const SECTION_SLUGS = ["noticias", "google", "plataformas", "ia", "seguranca", "guias"] as const;

export default [
  index("routes/home.tsx"),
  ...SECTION_SLUGS.flatMap((slug) => [
    route(slug, "routes/section.tsx", { id: `section-${slug}` }),
    route(`${slug}/:slug`, "routes/post.tsx", { id: `post-${slug}` }),
  ]),
  // Ferramentas: mantenha em sincronia com TOOLS em app/lib/site.ts.
  route("ferramentas", "routes/tools.tsx"),
  route("ferramentas/comprimir-imagem", "routes/tool-image.tsx"),
  route("ferramentas/qr-code", "routes/tool-qr.tsx"),
  route("ferramentas/link-whatsapp", "routes/tool-whatsapp.tsx"),
  route("ferramentas/contador-de-caracteres", "routes/tool-counter.tsx"),
  route("ferramentas/meta-tags", "routes/tool-meta.tsx"),
  route("ferramentas/converter-imagem", "routes/tool-convert.tsx"),
  route("ferramentas/contraste-cores", "routes/tool-contrast.tsx"),
  route("ferramentas/gerador-favicon", "routes/tool-favicon.tsx"),
  route("ferramentas/sitemap-robots", "routes/tool-sitemap.tsx"),
  route("ferramentas/status-http", "routes/tool-status.tsx"),
  route("ferramentas/esta-fora-do-ar", "routes/tool-uptime.tsx"),
  route("ferramentas/prompt-para-site", "routes/tool-prompt-site.tsx"),
  route("ferramentas/quanto-custa-um-site", "routes/tool-orcamento.tsx"),
  route("ferramentas/arquivo-de-instrucoes-ia", "routes/tool-instructions.tsx"),
  route("ferramentas/tamanhos-de-imagem", "routes/tool-sizes.tsx"),
  route("criar-site-com-ia", "routes/ai-track.tsx"),
  route("trilha", "routes/trail.tsx"),
  route("busca", "routes/search.tsx"),
  route("sobre", "routes/about.tsx"),
  route("contato", "routes/contact.tsx"),
  route("faq", "routes/faq.tsx"),
  route("politica-editorial", "routes/editorial.tsx"),
  route("anuncie", "routes/advertise.tsx"),
  route("termos", "routes/terms.tsx"),
  route("privacidade", "routes/privacy.tsx"),
  route("cookies", "routes/cookies.tsx"),
  route("acessibilidade", "routes/accessibility.tsx"),
  route("mapa-do-site", "routes/sitemap-page.tsx"),

  // Recursos para buscadores e leitores de feed.
  route("sitemap.xml", "routes/sitemap.ts"),
  route("rss.xml", "routes/rss.ts"),
  route("robots.txt", "routes/robots.ts"),
  route("ads.txt", "routes/ads-txt.ts"),

  // Painel administrativo (só o dono; fora dos menus, noindex, Disallow no robots.txt).
  route("admin/login", "routes/admin/login.tsx"),
  route("admin/sair", "routes/admin/logout.ts"),
  route("admin", "routes/admin/layout.tsx", [
    index("routes/admin/home.tsx"),
    route("materias", "routes/admin/posts.tsx"),
    route("materias/nova", "routes/admin/post-new.tsx"),
    route("materias/:id", "routes/admin/post-edit.tsx"),
    route("upload", "routes/admin/upload.ts"),
    route("fila", "routes/admin/queue.tsx"),
    route("fontes", "routes/admin/feeds.tsx"),
    route("robo", "routes/admin/robot.tsx"),
    route("visitas", "routes/admin/visitas.tsx"),
    route("config", "routes/admin/settings.tsx"),
  ]),

  // Jobs (Cron Jobs da Hostinger), protegidos por CRON_TOKEN.
  route("api/cron/:job", "routes/cron.ts"),
  // Contador de visitas (a página da matéria avisa depois de carregar no navegador).
  route("api/view", "routes/view.ts"),
  // Sinal de visita do site inteiro (sem cookie; ver app/visitas e docs/painel-visitas.md).
  route("api/v", "routes/api.v.ts"),
  // Resumo das visitas para o Escritório Claude (protegido pelo CRON_TOKEN).
  route("api/escritorio/:what", "routes/api.escritorio.ts"),
  // Ferramenta "Está fora do ar?": checagem feita pelo servidor (ver docs/ferramenta-fora-do-ar.md).
  route("api/fora-do-ar", "routes/api-fora-do-ar.ts"),

  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
