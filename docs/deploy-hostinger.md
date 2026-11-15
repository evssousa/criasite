# Deploy na Hostinger

Status: ⏳ ainda não publicado. Plano igual ao do Vibecoin (ver `vibecoin/docs/deploy-hostinger.md`).

## Passos

1. Conferir o plano atual da Hostinger (o dono fez upgrade; não é mais o Business) e se cabe mais um
   app Node.js.
2. Domínio principal **criasite.com.br** (registrar, se ainda não estiver na conta). O criasite.app,
   que já está na Hostinger, pode redirecionar para o .com.br. O `.app` só abre por HTTPS (HSTS
   pré-carregado): o SSL precisa estar ativo antes de qualquer teste nele.
3. Bancos antigos do criasite na Hostinger: o dono autorizou apagar e recriar (2026-11-14). Criar o
   MySQL novo (`<usuário>_criasite`), host `127.0.0.1` no app.
4. Criar o site Node.js ligado ao GitHub `evssousa/criasite`, branch `main`, auto-deploy a cada push.
   Build `npm run build`, start `npm start`, Node 22+.
5. Variáveis (hPanel): `VITE_SITE_URL`, `DB_*`, `CRON_TOKEN`, `GEMINI_API_KEY`, `ADMIN_*`/`SESSION_SECRET`
   (`npm run admin:hash`). `ADSENSE_CLIENT` só quando o AdSense aprovar.
6. Cron Jobs: coletar a cada 30 min e publicar de hora em hora, em minutos diferentes dos jobs do
   Respawnou e do Vibecoin.
7. E-mail `contato@criasite.com.br`, Search Console (enviar `/sitemap.xml`) e Bing Webmaster.
8. Primeira semana: escrever 8 a 12 guias da trilha no painel antes de pedir o AdSense.
