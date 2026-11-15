# Documentação e plano do CriaSite

Esta pasta (`docs/`) é a memória do projeto. Tudo o que for decidido ou construído entra aqui,
para que qualquer pessoa (ou o Claude, depois de perder o contexto) saiba onde estamos
e o que vem a seguir.

**Regra:** toda tarefa concluída atualiza o status abaixo e o documento da área.

O CriaSite (criasite.com.br) é o 4º site da família (Respawnou, Vibecoin, Anime Profile): ferramentas
gratuitas que rodam no navegador, notícias automáticas sobre a web e guias em pt-BR para quem cria e
cuida de sites. Mesma estratégia dos irmãos: repositório público como portfólio e renda com AdSense
(e afiliado da Hostinger depois). A base de código veio do Vibecoin.

## Documentos

| Arquivo | Conteúdo |
|---|---|
| [arquitetura.md](arquitetura.md) | Stack, pastas, rotas, dados, estado no navegador, tema, variáveis |
| [ferramentas.md](ferramentas.md) | Ferramentas no ar, como adicionar uma, próximas |
| [automacao.md](automacao.md) | Robô de notícias: fluxo, fontes, guia editorial |
| [deploy-hostinger.md](deploy-hostinger.md) | Deploy: site, build, banco, variáveis, Cron Jobs, domínio |
| [decisoes.md](decisoes.md) | Registro de decisões (o quê, quando e por quê) |
| [prototipo-layout.html](prototipo-layout.html) | Protótipo do layout escolhido ("Busca + Central") |
| [plano-inicial.md](plano-inicial.md) | Histórico: os 3 conceitos da fase 0 (previa site sem banco; superado) |

## Status

Legenda: ✅ feito · 🔄 em andamento · ⏳ próximo · 💤 depois · ❓ esperando decisão do dono

| Fase | Item | Status |
|---|---|---|
| 0 | Conceito: ferramentas + notícias automáticas + trilha/guias | ✅ |
| 0 | Marca CriaSite, domínio criasite.com.br, repo `evssousa/criasite` (antigo da organização apagado pelo dono) | ✅ |
| 0 | Layout "Busca + Central" (4 rodadas de protótipos) | ✅ |
| 1 | Esqueleto a partir do Vibecoin, sem cotações; tema, cabeçalho, rodapé, ícones e imagem de compartilhamento | ✅ |
| 1 | Home: busca que filtra, atalhos, faixa da trilha, Suas ferramentas (estrela), diretório, notícias, guias | ✅ |
| 1 | 5 ferramentas com texto explicativo: comprimir imagem, QR code, link do WhatsApp, contador, meta tags | ✅ |
| 1 | Página da trilha com checklist salvo no navegador | ✅ |
| 1 | Robô de notícias adaptado (editorias, fontes, guia editorial, links para ferramentas) | ✅ (coleta testada no ar; escrita espera a chave do Gemini) |
| 1 | Institucionais e legais reescritas (sobre, FAQ, contato, termos, privacidade, cookies, editorial, anuncie) | ✅ |
| 1 | README de portfólio + LICENSE + telas | ✅ |
| 2 | Deploy na Hostinger (criasite.app), repo religado, banco novo, variáveis, Cron Jobs; 1ª coleta ok (19 pautas) | ✅ |
| 2 | Chave do Gemini, senha do painel, e-mail, Search Console, domínio .com.br | ❓ |
| 2 | Guias da trilha (8 a 12) escritos no painel | ⏳ |
| 2 | Mais ferramentas (converter imagem, está fora do ar?, orçamento de site, paleta, favicon) | 💤 |
| 3 | Pedido do AdSense e afiliado da Hostinger | 💤 |

## Próximos passos

1. Assim que a `GEMINI_API_KEY` estiver no hPanel: testar com `/api/cron/diag` e `/api/cron/publicar?dry=1`, revisar a
   primeira notícia e ajustar as fontes (Search Engine Land deu 403 na 1ª coleta).
2. Escrever os guias da trilha no painel (um por etapa, mais alguns de apoio).
3. Novas ferramentas na ordem de `ferramentas.md` (converter imagem primeiro).
4. Domínio .com.br, Search Console e Bing; depois de ~20 notícias e os guias, pedir o AdSense.

## Pendências suas

- Criar a chave do Gemini (Google AI Studio, plano gratuito) e cadastrar `GEMINI_API_KEY` no hPanel
  (Sites → criasite.app → Node.js → Variáveis de ambiente). Sem ela o robô coleta, mas não escreve.
- Rodar `npm run admin:hash` na pasta do criasite e cadastrar `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` e `SESSION_SECRET`
  no hPanel (não mandar no chat).
- Registrar o criasite.com.br (ainda não está na conta). Até lá o site fica em criasite.app.

## Regra de atualização

Ao terminar qualquer tarefa: atualizar a tabela de status, `## Próximos passos`, `## Pendências suas` e,
se houve decisão, `decisoes.md`.
