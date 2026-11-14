# Documentação e plano do CriaSite

Esta pasta (`docs/`) é a memória do projeto. Tudo o que for decidido ou construído entra aqui,
para que qualquer pessoa (ou o Claude, depois de perder o contexto) saiba onde estamos
e o que vem a seguir.

**Regra:** toda tarefa concluída atualiza o status abaixo e o documento da área.

O CriaSite (criasite.app) é o 4º site da família (Respawnou, Vibecoin, Anime Profile): ferramentas
gratuitas e guias em pt-BR para quem cria ou mantém sites. Mesma estratégia dos irmãos: repositório
público como portfólio e renda com AdSense. Quando houver dúvida de "como fazer", a resposta quase
sempre já está nos docs do Vibecoin (ferramentas, SEO) e do Respawnou (AdSense, deploy).

## Documentos

| Arquivo | Conteúdo |
|---|---|
| [plano-inicial.md](plano-inicial.md) | 3 conceitos comparados, recomendação, SEO programático, stack, páginas, MVP em fases, critérios do AdSense |
| [decisoes.md](decisoes.md) | Registro de decisões (o quê, quando e por quê) |

Próximos documentos (quando a fase começar): `arquitetura.md`, `ferramentas.md`, `conteudo.md`,
`adsense.md`, `deploy-hostinger.md`.

## Status

Legenda: ✅ feito · 🔄 em andamento · ⏳ próximo · 💤 depois · ❓ esperando decisão do dono

| Fase | Item | Status |
|---|---|---|
| 0 | Plano inicial com 3 conceitos e recomendação (plano-inicial.md, 2026-11-14) | ✅ |
| 0 | Escolha do conceito (recomendado: ferramentas + guias, analisador leve depois) | ❓ |
| 0 | Nome, marca e domínios (criasite.app; criasite.com.br?) | ❓ |
| 0 | Repositório: apagar o de organização antigo e criar o novo (público, portfólio) | ❓ |
| 0 | Protótipos de layout (3 a 4) para o dono escolher | ⏳ |
| 1 | Esqueleto copiado do Vibecoin (sem banco), layout, institucionais, SEO base, AdSense desligado | 💤 |
| 1 | 10 ferramentas no navegador + ~12 guias + checklist de lançamento | 💤 |
| 1 | README de apresentação + LICENSE + auditoria 375/768/1024/1440 | 💤 |
| 2 | Deploy na Hostinger (Node, SSL obrigatório no .app, www→apex), e-mail, Search Console, Bing | 💤 |
| 2 | +6 ferramentas, +10 guias, referência HTTP e tamanhos de imagem | 💤 |
| 3 | Paletas/schemas por negócio, ferramentas de servidor (RDAP, DNS, meta tags de URL) | 💤 |
| 4 | Pedido do AdSense | 💤 |

## Próximos passos

1. Atualizar o plano com o planejador: notícias automáticas e ferramentas recorrentes mudam a arquitetura do
   `plano-inicial.md` (que previa site sem banco). Agora precisa de MySQL + robô de notícias como no Vibecoin.
2. Esqueleto do app a partir do Vibecoin, já com o layout "Busca + Central" (`docs/prototipo-layout.html`).
3. Primeiras ferramentas de uso diário (comprimir imagem, QR code, link do WhatsApp, meta tags), cada uma com texto próprio.
4. Robô de notícias, trilha de 7 etapas com guias e checklist.
5. Deploy em criasite.com.br, Search Console e pedido do AdSense.

## Pendências suas

- Rodar `gh auth refresh -h github.com -s delete_repo` e avisar, para apagar o repo antigo `criasite-app/criasite`
  (se a conta não for dona da organização, a exclusão tem que ser feita pelo dono dela).
- Confirmar o conceito final (ferramentas + notícias + trilha/guias), para o planejador atualizar o plano.

## Decisões já tomadas (2026-11-14)

- Começa do zero, sem aproveitar nada do projeto antigo.
- Repo novo criado em `evssousa/criasite` (público, conta pessoal, como respawnou/vibecoin/animeprofile).
- Política de privacidade (e termos) em todos os sites: entra no escopo, sem gerador, só as páginas do próprio site.
- Guias assinados por "Equipe CriaSite" por ora.
- Marca CriaSite, domínio principal criasite.com.br; afiliado Hostinger aprovado.
- Layout "Busca + Central" escolhido (ver `decisoes.md` e `prototipo-layout.html`).
- Plano da Hostinger foi atualizado (não é mais Business): conferir limites de apps Node.js na hora do deploy.
