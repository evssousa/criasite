// Antigo contador de visitas das matérias. Agora quem conta é o POST /api/v (app/visitas), no site inteiro.
// Este endereço fica respondendo 204 sem fazer nada por uns dias, porque o HTML guardado na CDN ainda pode chamá-lo.
// Depois de 2026-11-27 dá para apagar este arquivo e a rota "api/view" em app/routes.ts.
export async function loader() {
  return new Response(null, { status: 405 });
}

export async function action() {
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
