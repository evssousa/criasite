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

1. Dono responde as perguntas em aberto de `plano-inicial.md` (principalmente conceito, nome e repo).
2. Protótipos de layout (home + página de ferramenta) para escolher.
3. Esqueleto do app a partir do Vibecoin, sem banco (passos 3 a 7 do plano).
4. As 10 ferramentas do MVP, uma por vez, cada uma com texto próprio.
5. Guias de lançamento e checklist; depois deploy (só após a decisão sobre o repo antigo).

## Pendências suas

- Escolher o conceito (recomendação em `plano-inicial.md`: ferramentas + guias; analisador leve só na fase 3).
- Nome e marca: confirmar a grafia (você usou "Equipe CriaSites"; o plano usa "CriaSite") e decidir se registra criasite.com.br também.
- Apagar o repo antigo na organização `criasite-app` (privado, nome `criasite`): só você confirma, na hora do deploy. O conteúdo dele NÃO será aproveitado.
- Decidir sobre links de afiliado (hospedagem/domínio) além do AdSense.

## Decisões já tomadas (2026-11-14)

- Começa do zero, sem aproveitar nada do projeto antigo.
- Repo novo criado em `evssousa/criasite` (público, conta pessoal, como respawnou/vibecoin/animeprofile).
- Política de privacidade (e termos) em todos os sites: entra no escopo, sem gerador, só as páginas do próprio site.
- Guias assinados por "Equipe CriaSite" por ora.
- Plano da Hostinger foi atualizado (não é mais Business): conferir limites de apps Node.js na hora do deploy.
