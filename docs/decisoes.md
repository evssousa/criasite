# Registro de decisões

Mais recente no topo. Cada decisão diz o que foi decidido, quando e por quê.

## 2026-11-14 — Ponto de partida do CriaSite

- **O quê:** criasite.app vira o 4º site da família, com a mesma estratégia dos irmãos (repositório
  público como portfólio, renda com AdSense), nicho de criação de sites/web/SEO para freelancers e
  pequenos negócios no Brasil, em pt-BR, sem APIs pagas. Hospedagem na Hostinger.
- **Por quê:** pedido do dono; o domínio já está na Hostinger.
- O repositório de organização ligado hoje ao domínio será apagado e recriado pelo dono. Até ele
  decidir, nada é mexido (repo, site da Hostinger, DNS).

## 2026-11-14 — Recomendação de conceito (aguardando o dono)

- **O quê (proposta, não aprovada):** ferramentas gratuitas no navegador + guias escritos com cuidado;
  analisador de URL só na fase 3 e em versão leve. SEO programático só em conjuntos curados.
  Stack do Vibecoin sem banco; guias em Markdown no repositório. Detalhes em `plano-inicial.md`.
- **Por quê:** ferramentas trazem volume de busca com concorrência brasileira fraca e custo zero de
  servidor; guias trazem RPM melhor e o "conteúdo original e útil" que o AdSense exige; o analisador
  tem concorrência forte e custo/risco de servidor alto.

## 2026-11-14 — Rodadas de layout e novos requisitos

- **Marca:** CriaSite, domínio principal criasite.com.br. Guias assinados por "Equipe CriaSite".
- **Afiliado:** usar o programa de afiliados da Hostinger (com aviso de link de afiliado), depois que houver conteúdo.
- **Layout, rodada 1:** de 4 estruturas (Oficina, Trilha, Busca, Planta), o dono gostou de **Busca** (busca no topo +
  diretório por categoria, marinho/laranja) e **Trilha** (jornada em 7 etapas + checklist, serifada verde/rosa).
- **Novos requisitos:** o site terá **notícias automáticas** (como Respawnou/Vibecoin) e **ferramentas de uso
  recorrente** para o visitante voltar (comprimir imagem, QR code, link do WhatsApp, está fora do ar?, orçamento de site,
  favoritas e "meu site" salvos no navegador).
- **Rodada 2:** Central, Caderno, Painel e Hoje (variações de Busca + Trilha); escolhido o **Central**.
- **Rodada 3:** variações do Central (Claro, Noturno, Lateral, Revista).
- **Layout escolhido: "Busca + Central"** — topo marinho com busca centralizada e chips "Mais usadas", faixa da trilha
  (7 etapas, clicável) no fim do topo; corpo com "Suas ferramentas" (favoritas pela estrela, salvas no navegador) e
  diretório por categoria; lateral com notícias automáticas, anúncio 300×250 e guias novos. Marinho `#0c1a4b` + laranja
  `#ff7a1a`, fundo `#eef1fb`, fonte Schibsted Grotesk. Referência: `docs/prototipo-layout.html`.

## 2026-11-14 — Fase 1: o site

- **Base:** cópia do Vibecoin (servidor, robô, painel, páginas legais, SEO), sem cotações, moedas e
  corretoras. Os nomes dos tokens de cor foram mantidos com os valores do CriaSite, para reaproveitar
  componentes sem renomear tudo.
- **Ferramentas só no navegador** (comprimir imagem, QR code, link do WhatsApp, contador, meta tags):
  privacidade, custo zero de servidor e argumento de confiança ("nada sai do seu computador").
- **Favoritas e trilha no `localStorage`**, sem conta. Favoritas começam com comprimir imagem, QR code
  e link do WhatsApp, para a área não nascer vazia.
- **Sem caixas de anúncio no layout**: como no Vibecoin, AdSense em anúncios automáticos ligados por
  `ADSENSE_CLIENT`. Caixas vazias "Anúncio" pioram a avaliação do site.
- **Busca da home**: filtra o diretório na hora (nome, descrição, categoria e sinônimos, sem acento);
  Enter com uma só ferramenta encontrada abre a ferramenta, senão vai para `/busca` (ferramentas +
  notícias + guias).
- **Notícias:** editorias `noticias` (web), `google`, `plataformas`, `ia`, `seguranca`; guias à parte
  (fora do feed de notícias). Robô com guia editorial próprio (foco no dono de site pequeno, sem
  promessa de resultado) e link automático para a ferramenta citada no texto.
- **Bancos antigos do criasite na Hostinger:** o dono autorizou apagar e recriar no deploy.

## 2026-11-15 — Domínio definitivo: criasite.app

- **O quê:** o .com.br não será registrado; criasite.app é o domínio do site, do e-mail
  (`contato@criasite.app`) e de todos os textos. Nameservers na Hostinger (antes estavam na Cloudflare,
  da instalação antiga, e o e-mail não funcionava).
- **Por quê:** decisão do dono. O .app já estava na conta, com SSL vitalício.
