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
| 2 | Cadastrar no Bing Webmaster | ⏳ |
| 2 | Guias da trilha (8 a 12) escritos no painel | ⏳ |
| 2 | Mais ferramentas: está fora do ar? (precisa de servidor), orçamento de site, paleta, slug | 💤 |
| 3 | Pedido do AdSense e afiliado da Hostinger | 💤 |

## Próximos passos

1. Acompanhar as primeiras notícias automáticas (publicação aos :50, das 8h às 22h, até 4 por dia) e ajustar o robô:
   no teste, o Gemini pôs link no lide (o guia proíbe), usou 3 links externos (o alvo é 1 a 2), não pôs link interno e
   deixou um erro de digitação ("após validador"). Reforçar a checagem em `quality.ts` se repetir.
2. Escrever os guias da trilha no painel (um por etapa, mais alguns de apoio).
3. Novas ferramentas na ordem de `ferramentas.md` (está fora do ar? e orçamento de site primeiro).
4. Bing Webmaster; depois de ~20 notícias e os guias, pedir o AdSense.
5. **Mídia kit** dentro de "Anuncie" (`app/routes/advertise.tsx`): público e números reais, formatos e pacotes, regras de
   conteúdo patrocinado, versão para baixar/imprimir e contato. Outra fonte de renda, vale para todos os sites
   (animeprofile, criasite, vibecoin e respawnou). Falta planejar (chamar o `planejador`, pois tem parte visual); este site
   pode ser o piloto.

## Pendências suas

- Cadastrar o site no Bing Webmaster (o sitemap já foi enviado ao Google).
- O TXT antigo do Google (`B0Z4u6o-…`) foi removido da zona ao trocar para a conta centralizada; o novo (`H8ZjO9tf…`) está no DNS e não deve ser apagado.

## Regra de atualização

Ao terminar qualquer tarefa: atualizar a tabela de status, `## Próximos passos`, `## Pendências suas` e,
se houve decisão, `decisoes.md`.
