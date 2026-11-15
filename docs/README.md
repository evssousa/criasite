# Documentação e plano do CriaSite

Esta pasta (`docs/`) é a memória do projeto. Tudo o que for decidido ou construído entra aqui,
para que qualquer pessoa (ou o Claude, depois de perder o contexto) saiba onde estamos
e o que vem a seguir.

**Regra:** toda tarefa concluída atualiza o status abaixo e o documento da área.

O CriaSite (criasite.app) é o 4º site da família (Respawnou, Vibecoin, Anime Profile): ferramentas
gratuitas que rodam no navegador, notícias automáticas sobre a web e guias em pt-BR para quem cria e
cuida de sites. Mesma estratégia dos irmãos: repositório público como portfólio e renda com AdSense
(e afiliado da Hostinger depois). A base de código veio do Vibecoin.

## Documentos

| Arquivo | Conteúdo |
|---|---|
| [arquitetura.md](arquitetura.md) | Stack, pastas, rotas, dados, estado no navegador, tema, variáveis |
| [ferramentas.md](ferramentas.md) | Ferramentas no ar, como adicionar uma, próximas |
| [automacao.md](automacao.md) | Robô de notícias: fluxo, fontes, guia editorial |
| [guias.md](guias.md) | Guias da trilha: modelo de guia, 1ª leva de 6 (migration 003), link na trilha, afiliado reservado |
| [deploy-hostinger.md](deploy-hostinger.md) | Deploy: site, build, banco, variáveis, Cron Jobs, domínio |
| [decisoes.md](decisoes.md) | Registro de decisões (o quê, quando e por quê) |
| [prototipo-layout.html](prototipo-layout.html) | Protótipo do layout escolhido ("Busca + Central") |
| [plano-inicial.md](plano-inicial.md) | Histórico: os 3 conceitos da fase 0 (previa site sem banco; superado) |

## Status

Legenda: ✅ feito · 🔄 em andamento · ⏳ próximo · 💤 depois · ❓ esperando decisão do dono

| Fase | Item | Status |
|---|---|---|
| 0 | Conceito: ferramentas + notícias automáticas + trilha/guias | ✅ |
| 0 | Marca CriaSite, domínio criasite.app (definitivo; sem .com.br), repo `evssousa/criasite` (antigo da organização apagado pelo dono) | ✅ |
| 0 | Layout "Busca + Central" (4 rodadas de protótipos) | ✅ |
| 1 | Esqueleto a partir do Vibecoin, sem cotações; tema, cabeçalho, rodapé, ícones e imagem de compartilhamento | ✅ |
| 1 | Home: busca que filtra, atalhos, faixa da trilha, Suas ferramentas (estrela), diretório, notícias, guias | ✅ |
| 1 | 11 ferramentas com texto explicativo: comprimir e converter imagem, QR code, link do WhatsApp, contador, meta tags, contraste de cores, favicon, sitemap e robots.txt, status HTTP, tamanhos de imagem | ✅ |
| 1 | Página da trilha com checklist salvo no navegador | ✅ |
| 1 | Robô de notícias adaptado (editorias, fontes, guia editorial, links para ferramentas) | ✅ (no ar: coleta ok, Gemini ok, teste de escrita aprovado em 2026-11-15) |
| 1 | Institucionais e legais reescritas (sobre, FAQ, contato, termos, privacidade, cookies, editorial, anuncie) | ✅ |
| 1 | README de portfólio + LICENSE + telas | ✅ |
| 2 | Deploy na Hostinger (criasite.app), repo religado, banco novo, variáveis, Cron Jobs; 1ª coleta ok (19 pautas) | ✅ |
| 2 | Chave do Gemini, senha do painel, DNS do e-mail (nameservers na Hostinger) | ✅ |
| 2 | Caixa contato@criasite.app, CNAMEs antigos apagados | ✅ |
| 2 | Search Console (propriedade de domínio, conta centralizada, TXT no DNS) | ✅ |
| 2 | Sitemap enviado no Search Console | ✅ |
| 2 | Cadastrar no Bing Webmaster | ✅ |
| 2 | Guias da trilha, 1ª leva (6) por migration `003_guias_iniciais.sql` + botão "Ler o guia" na `/trilha`: plano em [guias.md](guias.md) | ✅ (escritos, validados e no repo; a migration roda no deploy) |
| 2 | Guias da trilha, 2ª leva (etapa Páginas e apoio, até chegar a 8 a 12) | 💤 |
| 2 | Mais ferramentas: está fora do ar? (precisa de servidor), orçamento de site, paleta, slug | 💤 |
| 3 | Pedido do AdSense e afiliado da Hostinger | 💤 |

## Próximos passos

1. Conferir os 6 guias no ar depois do deploy (`/guias`, `/trilha`, `/admin/materias`; roteiro em [guias.md](guias.md), seção E).
2. 2ª leva de guias (começando pela etapa Páginas); depois ~20 notícias e os guias para pedir o AdSense.
3. Novas ferramentas na ordem de `ferramentas.md` (está fora do ar? e orçamento de site primeiro).
4. **Mídia kit** dentro de "Anuncie" (`app/routes/advertise.tsx`): público e números reais, formatos e pacotes, regras de
   conteúdo patrocinado, versão para baixar/imprimir e contato. Outra fonte de renda, vale para todos os sites
   (animeprofile, criasite, vibecoin e respawnou). Falta planejar (chamar o `planejador`, pois tem parte visual); este site
   pode ser o piloto.

## Pendências suas

- Guias (ver [guias.md](guias.md), Perguntas em aberto): confirmar o tema da 2ª leva (sugestão: "Páginas" primeiro) e se
  quer capas próprias ou a arte padrão. Depois do deploy da 1ª leva, conferir os 6 guias no `/admin` (2 a 3 minutos,
  roteiro na seção E). Não precisa rodar SQL: o servidor aplica a migration.
- Afiliado da Hostinger: quando tiver o link, mandar no chat; o ponto já está reservado no guia de hospedagem.
- O TXT antigo do Google (`B0Z4u6o-…`) foi removido da zona ao trocar para a conta centralizada; o novo (`H8ZjO9tf…`) está no DNS e não deve ser apagado.

## Regra de atualização

Ao terminar qualquer tarefa: atualizar a tabela de status, `## Próximos passos`, `## Pendências suas` e,
se houve decisão, `decisoes.md`.
