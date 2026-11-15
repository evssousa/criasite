# Capas próprias dos guias + capa padrão por editoria

**Status: executado em 2026-11-15** (amostras aprovadas pelo dono). 12 capas em `public/capas/` (7 a 12 KB cada, sem perda),
`scripts/make-capas.mjs` (`--sql`, `--folha`), migration **`005_capas_guias.sql`** (a 004 já era do afiliado), capa padrão
por editoria no `Cover` (círculo com opacidade 80%), capa no card de `/guias`, `og:image:alt/width/height`.
Pendente: conferir a prévia no WhatsApp depois do deploy (passo 15).

Plano criado em 2026-11-15 pelo planejador.

## Objetivo

Trocar a arte listrada (`.art`) por capas com a cara do CriaSite: uma ilustração vetorial por guia, gerada por script
(SVG → WebP com `sharp`), versionada no repositório e ligada aos 6 guias por uma migration; e, para posts sem imagem,
uma capa padrão por editoria (cor e ícone) feita só com CSS e SVG inline, sem peso extra.

## Contexto

- Os 6 guias da 1ª leva estão no ar com `image_url = NULL` (migration `003_guias_iniciais.sql`). Sem imagem, o
  componente `Cover` (`app/components/ui.tsx`) pinta a classe `.art` (listras a 135° sobre `#3b4b8f`, `app/app.css`).
  O dono achou sem graça. Onde aparece hoje: topo da página do guia (`app/routes/post.tsx`, `aspect-[16/9]` no celular e
  `aspect-[21/9]` a partir de `sm`), cards "Leia também" (`PostCard`, `h-40`), busca (`PostRow`, 84×64 / 112×76) e a
  lista lateral (`NewsList`, 60×60). A página `/guias` usa `GuideCard`, que **não tem capa nenhuma**.
- As notícias do robô quase sempre têm capa: `chooseMedia` (`app/lib/robot/media.server.ts`) descarta a pauta sem imagem
  utilizável e guarda as imagens em `MEDIA_DIR` (`/media/AAAA/MM/...webp`). As capas dos guias são diferentes: são
  **arte da marca, versionada no Git**, então vão para `public/capas/` (servidas pelo `express.static("build/client")` com
  cache de 1 h, `server-app.js`), e não para `MEDIA_DIR`.
- O publicar do painel exige capa (`app/routes/admin/post-edit.tsx`, linha 40: "Antes de publicar, preencha ... a capa").
  Ou seja, todo guia novo feito no painel também vai precisar de uma capa: o script resolve isso com um comando.
- `og:image`: `post.tsx` passa `post.image?.src` para `seo()` (`app/lib/seo.ts`), que vira URL absoluta e também entra no
  JSON-LD (`image`). Sem imagem, cai em `/og-default.png` (1200×630). Ou seja: **gravar `image_url` já resolve o
  compartilhamento**, sem mudança de código obrigatória.
- Já existe um script com `sharp` que desenha SVG e grava PNG: `scripts/make-icons.mjs` (o modelo a seguir). `sharp`
  está em `dependencies` (`^0.35.5`).
- Restrição do dono: tudo grátis e reproduzível. **Não usar o conector OpenArt nem nenhum gerador de imagem pago ou com
  créditos.** Só SVG escrito à mão no script.

## Arquivos afetados

| Arquivo | O quê |
|---|---|
| `scripts/make-capas.mjs` | **novo**: lista `CAPAS`, desenhos `ARTES`, moldura comum, gera `public/capas/<slug>.webp`, `--sql`, `--folha` |
| `public/capas/*.webp` | **novos**: 6 capas da 1ª leva (1200×675, < 60 KB cada) |
| `db/migrations/005_capas_guias.sql` | **novo**: `UPDATE` de `image_url` e `image_alt` dos 6 guias, só onde está vazio |
| `app/components/ui.tsx` | `Cover` ganha `section` e `zoom`; capa padrão por editoria no lugar das listras |
| `app/app.css` | troca `.art` por `.cover-fb` (o `.art-night` fica como está) |
| `app/components/cards.tsx` | passar `section` ao `Cover` em `PostCard`, `PostRow`, `NewsList`; `GuideCard` ganha capa no topo |
| `app/routes/post.tsx` | passar `section` ao `Cover`; passar `imageAlt` e `imageSize` ao `seo()` |
| `app/lib/seo.ts` | `og:image:alt`, `twitter:image:alt` e (para capas próprias) `og:image:width/height` |
| `app/lib/mock-data.ts` | 1 guia de exemplo com capa (para conferir no `npm run dev` sem banco) |
| `docs/capas.md`, `docs/README.md`, `docs/decisoes.md` | marcar feito, anotar pesos |

Não mexer no robô (`app/lib/robot/*`), no `RichText` nem no painel.

---

## A. Direção visual

**Clima:** "planta técnica amigável". Cada capa é uma **janela de navegador branca com sombra sólida laranja** (o mesmo
símbolo do logo, a janela com o cursor) flutuando sobre o marinho pontilhado; dentro da janela, um desenho plano e
geométrico do assunto. Embaixo, a **régua da trilha**: 7 pontos, com a etapa do guia acesa em laranja. Referência de
espírito: ilustrações de documentação de produto (planas, poucas formas, cantos arredondados). **Evitar:** degradês,
sombras borradas, pessoas, fotos, texto dentro da imagem, mais de 3 cores fortes, detalhes finos que somem na miniatura
de 60 px.

**Hierarquia (o que o olho vê):** 1º o desenho dentro da janela (o assunto); 2º a sombra laranja e o anel no canto
(a marca); 3º a régua da trilha (em que etapa estou); por último o pontilhado e os enfeites dos cantos.

**Sem texto na imagem (decisão).** Motivos: (1) o título já aparece ao lado da capa em todo lugar (card, página,
WhatsApp mostra `og:title`); (2) a capa é cortada em 21:9, 1,91:1, 1,3:1 e 1:1 conforme o lugar, e texto cortado fica
pior que desenho cortado; (3) o `librsvg` usado pelo `sharp` depende das fontes instaladas na máquina (fontconfig): a
Schibsted Grotesk não está instalada e o resultado mudaria entre o computador do dono e qualquer outra máquina, o que
quebra o "reproduzível". Sem `<text>`, a saída é idêntica em qualquer lugar. Se um dia o dono quiser título na capa, o
caminho é converter o texto em `<path>` antes (fora deste plano).

## B. Tamanho, corte e zona segura

- **Arquivo:** 1200×675 (16:9), WebP, **alvo < 60 KB** (o script aborta acima disso).
- **Mesma imagem para `og:image`:** sim, sem variante. O Facebook/WhatsApp recomendam 1,91:1 (1200×630) e recortam ao
  centro: de 675 sobram 630, perdem-se ~22 px em cima e embaixo, só pontilhado. O Google Discover pede ≥ 1200 px de
  largura (ok) e o `seo()` já manda `max-image-preview:large`.
- **Cortes reais no site** (todos `object-cover`, centro): página do guia em `sm+` = 21:9 → aparece y 80 a 595; card
  `h-40` ~2,2:1 → y ~65 a 610; `PostRow` 1,3 a 1,5:1 → x ~150 a 1050; `NewsList` 1:1 → x 262 a 937.
- **Zona segura (tudo que importa fica aqui): x 300 a 900, y 110 a 560.** A janela (x 360 a 856, y 150 a 486) e a régua
  (y 548) ficam dentro dela. Os enfeites dos cantos ficam fora de propósito: podem ser cortados.

## C. Tokens da capa (só estas cores)

| Papel | Hex |
|---|---|
| Fundo | `#0c1a4b` (marinho, `--color-night`) |
| Pontilhado, linha da régua | `#1d2c66` (`--color-night-3`) |
| Pontos apagados, enfeites | `#2a3c80` (`--color-night-line-2`) |
| Laranja forte (sombra, destaque) | `#ff7a1a` (`--color-brand`) |
| Laranja claro (anel, etapas feitas, detalhes) | `#ff9a4d` (`--color-glow`) |
| Laranja suave (preenchimentos claros) | `#fff0e5` (`--color-violet-soft`) |
| Laranja escuro (traço sobre laranja suave) | `#c24e06` (`--color-violet`) |
| Janela | `#ffffff` |
| Barra da janela, superfícies | `#eef1fb` (`--color-day`) |
| Linhas claras | `#dde3f6`, `#cdd5ef` (`--color-line`, `--color-line-2`) |
| Traço principal dentro da janela | `#0c1a4b` |
| Texto secundário simulado | `#5a6798` (`--color-muted`) |
| Verde "ok" (só LEDs e confirmação) | `#3ee0b0` (`--color-up-night`) |

Traços: `stroke-linecap="round"` e `stroke-linejoin="round"` em tudo. Raios: janela 24, peças 8 a 16.

## D. Moldura comum (igual em todas as capas)

SVG `width="1200" height="675" viewBox="0 0 1200 675"`, na ordem de desenho:

1. Fundo: `<rect width="1200" height="675" fill="#0c1a4b"/>`.
2. Pontilhado: `<pattern id="p" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="16" cy="16" r="2" fill="#1d2c66"/></pattern>`
   e `<rect width="1200" height="675" fill="url(#p)"/>`.
3. Enfeites (fora da zona segura):
   - anel: `<circle cx="905" cy="170" r="58" fill="none" stroke="#ff9a4d" stroke-width="6"/>`
   - ponto: `<circle cx="960" cy="118" r="10" fill="#ff7a1a"/>`
   - quadrado girado: `<rect x="-28" y="-28" width="56" height="56" rx="12" fill="none" stroke="#2a3c80" stroke-width="6" transform="translate(292 452) rotate(14)"/>`
   - sinal de mais: `<path d="M250 196v28M236 210h28" stroke="#2a3c80" stroke-width="6" stroke-linecap="round"/>`
4. Sombra sólida: `<rect x="376" y="166" width="480" height="320" rx="24" fill="#ff7a1a"/>`.
5. Janela: `<rect x="360" y="150" width="480" height="320" rx="24" fill="#ffffff"/>`.
6. Barra da janela: `<rect x="360" y="150" width="480" height="52" rx="24" fill="#eef1fb"/>` +
   `<rect x="360" y="176" width="480" height="26" fill="#eef1fb"/>` (base reta) +
   `<path d="M360 202h480" stroke="#dde3f6" stroke-width="2"/>`.
   Bolinhas: `circle` r=7 em (392,176), (416,176), (440,176), `fill="#cdd5ef"`.
   Endereço: `<rect x="470" y="164" width="340" height="24" rx="12" fill="#ffffff" stroke="#dde3f6" stroke-width="2"/>`.
7. **Desenho da arte** (seção E), sempre dentro de x 400 a 800, y 225 a 450 (área útil da janela).
8. Régua da trilha: `<path d="M510 548H690" stroke="#1d2c66" stroke-width="4" stroke-linecap="round"/>`; 7 pontos em
   x = 510 + (i − 1) × 30, y = 548 (i = 1 a 7). Etapa do guia = `n`:
   - i < n: `r=6 fill="#ff9a4d"` (caminho andado);
   - i = n: `<circle r="16" fill="none" stroke="#ff7a1a" stroke-width="3" opacity="0.5"/>` + `<circle r="10" fill="#ff7a1a"/>`;
   - i > n: `r=6 fill="#2a3c80"`.
   Etapas: `dominio`=1, `hospedagem`=2, `visual`=3, `paginas`=4, `google`=5, `velocidade`=6, `lancamento`=7 (ids de `TRAIL`).

## E. As artes (coordenadas absolutas no quadro 1200×675)

Chave da arte → desenho. Cores conforme a seção C. `N` = `#0c1a4b`, `L` = `#ff7a1a`, `LC` = `#ff9a4d`.
São 12 artes: 7 das etapas + 5 de apoio (usadas pela 2ª leva, ver `guias-leva2.md`). **Implementar as 12 já neste
plano** (a 2ª leva só acrescenta entradas na lista).

**1. `dominio` (barra de endereço)**
- Pílula grande: `rect x=410 y=290 w=380 h=72 rx=36 fill=#eef1fb stroke=N stroke-width=4`.
- Globo: `circle cx=452 cy=326 r=18 fill=none stroke=N sw=4`; `ellipse cx=452 cy=326 rx=8 ry=18 fill=none stroke=N sw=3`; `path M434 326h36 stroke=N sw=3`.
- Nome: `rect x=488 y=316 w=150 h=20 rx=10 fill=N`. Extensão: `rect x=646 y=316 w=70 h=20 rx=10 fill=L`.
- Cursor: `path M700 340 L700 384 L712 372 L722 392 L730 388 L720 368 L736 368 Z fill=N stroke=#fff sw=3`.
- Sugestões abaixo (`h=26 rx=13`, y=388): `x=470 w=70 fill=#dde3f6`; `x=550 w=90 fill=#fff0e5 stroke=L sw=3`; `x=650 w=80 fill=#dde3f6`.

**2. `servidor` (hospedagem)**
- 3 gavetas `rect x=470 w=260 h=52 rx=12 fill=N` em y = 250, 314, 378.
- LEDs `circle cx=500 cy=y+26 r=7`: gaveta 1 `fill=L`, gavetas 2 e 3 `fill=#3ee0b0`; 2º LED `cx=524` `fill=#2a3c80` nas três.
- Ranhuras `rect x=610 w=96 h=8 rx=4 fill=#2a3c80` em y+16 e y+30 de cada gaveta.

**3. `paleta` (cores, fonte e favicon)**
- Amostras `circle cy=290 r=34`: `cx=450 fill=N`; `cx=520 fill=L`; `cx=590 fill=#cdd5ef stroke=N sw=3`.
- "Texto": `rect x=420 y=356 w=200 h=24 rx=6 fill=N`; `rect x=420 y=394 w=260 h=12 rx=6 fill=#cdd5ef`; `rect x=420 y=416 w=220 h=12 rx=6 fill=#cdd5ef`.
- Favicon: o desenho do `MARK` de `make-icons.mjs` (viewBox 64) com `transform="translate(680 256) scale(1.5)"` (fica 96×96).
- Selo de contraste: `circle cx=728 cy=400 r=30 fill=#fff0e5 stroke=L sw=4`; `path M714 400 l10 10 l18 -20 stroke=#c24e06 sw=5 fill=none`.

**4. `paginas` (início, sobre, serviços, contato)**
- Cabeçalho: `rect x=420 y=236 w=360 h=28 rx=8 fill=#dde3f6`; botão `rect x=720 y=243 w=48 h=14 rx=7 fill=L`.
- Título: `rect x=420 y=276 w=220 h=16 rx=8 fill=N`; linha `rect x=420 y=300 w=170 h=10 rx=5 fill=#cdd5ef`; botão `rect x=420 y=322 w=96 h=28 rx=14 fill=L`.
- Imagem do topo: `rect x=660 y=276 w=120 h=74 rx=10 fill=#eef1fb stroke=#cdd5ef sw=3`; montanha `path M672 340 l28 -30 l20 18 l14 -12 l34 24 Z fill=#cdd5ef`; sol `circle cx=752 cy=296 r=8 fill=LC`.
- 3 cards `rect y=370 w=112 h=64 rx=10 fill=#eef1fb stroke=#dde3f6 sw=2` em x = 420, 544, 668; em cada um, ícone `rect x+12 y=382 w=22 h=22 rx=6` (`fill=N`, o do meio `fill=L`) e linha `rect x+12 y=412 w=70 h=8 rx=4 fill=#cdd5ef`.

**5. `lupa` (SEO / Google)**
- 3 resultados (x=420), cada um: título `w=230 h=14 rx=7`, endereço `w=120 h=8 rx=4 fill=#5a6798` 20 px abaixo, descrição `w=280 h=8 rx=4 fill=#cdd5ef` 36 px abaixo.
  Títulos em y = 240, 310, 380; o 1º `fill=L` (o seu site), os outros `fill=N`.
- Lupa por cima: `circle cx=700 cy=330 r=62 fill=#ffffff fill-opacity=0.7 stroke=N sw=12`; cabo `path M744 374 L790 420 stroke=N sw=18 linecap=round`; brilho `path M664 312 a40 40 0 0 1 30 -28 stroke=L sw=6 fill=none`.

**6. `velocimetro` (velocidade e imagens)**
- Trilho: `path M440 400 A120 120 0 0 1 680 400 fill=none stroke=#dde3f6 sw=28 linecap=round`.
- Progresso: `path M440 400 A120 120 0 0 1 651.9 322.9 fill=none stroke=L sw=28 linecap=round`.
- Ponteiro: `path M560 400 L632.8 338.9 stroke=N sw=10 linecap=round`; centro `circle cx=560 cy=400 r=16 fill=N`.
- Imagem grande → pequena: `rect x=700 y=250 w=80 h=64 rx=10 fill=#eef1fb stroke=N sw=4` com montanha `path M710 304 l20 -22 l16 14 l10 -8 l14 16 Z fill=#cdd5ef`;
  seta `path M740 324 v18 M732 334 l8 8 l8 -8 stroke=L sw=5 fill=none`; imagem leve `rect x=716 y=352 w=48 h=38 rx=8 fill=L`.

**7. `foguete` (checklist de lançamento)**
- Checklist (x=420), linhas em y = 262, 316, 370: caixa `rect w=34 h=34 rx=8`; nas 2 primeiras `fill=L` com
  `path M428 y+17 l7 7 l13 -14 stroke=#fff sw=5 fill=none` e linha `rect x=470 y+11 w=150 h=12 rx=6 fill=N`;
  na 3ª caixa `fill=none stroke=#cdd5ef sw=4` e linha `fill=#cdd5ef`.
- Foguete: corpo `path M720 236 C750 262 758 312 748 362 L692 362 C682 312 690 262 720 236 Z fill=N`; janela
  `circle cx=720 cy=300 r=16 fill=#fff stroke=L sw=6`; aletas `path M692 330 L668 372 L696 362 Z` e
  `path M748 330 L772 372 L744 362 Z` `fill=L`; chama `path M704 366 Q720 420 736 366 Z fill=LC`.

**8. `email` (e-mail com o domínio)**
- Envelope: `rect x=460 y=258 w=240 h=160 rx=16 fill=#eef1fb stroke=N sw=6`; aba `path M466 266 L580 350 L694 266 fill=none stroke=N sw=6 linejoin=round`.
- Selo "@" desenhado (sem fonte): `circle cx=704 cy=262 r=36 fill=L`; `circle cx=704 cy=262 r=11 fill=none stroke=#fff sw=5`;
  `path M715 262 v6 a7 7 0 0 0 14 0 v-6 a25 25 0 1 0 -10 20 fill=none stroke=#fff sw=5 linecap=round`.

**9. `plataforma` (WordPress ou construtor)**
- Painel do código: `rect x=420 y=246 w=168 h=180 rx=14 fill=N`; linhas `rect x=440 w=90 h=8 rx=4 fill=#2a3c80` em y=270 e y=390;
  colchetes `path M488 316 l-18 20 18 20 M524 316 l18 20 -18 20 stroke=LC sw=6 fill=none`.
- Painel dos blocos: `rect x=612 y=246 w=168 h=180 rx=14 fill=#eef1fb stroke=#cdd5ef sw=3`; blocos `rect x=628 y=264 w=136 h=40 rx=8 fill=#dde3f6`,
  `rect x=628 y=314 w=62 h=52 rx=8 fill=L`, `rect x=702 y=314 w=62 h=52 rx=8 fill=#dde3f6`, `rect x=628 y=376 w=136 h=32 rx=8 fill=#dde3f6`;
  cursor `path M676 334 L676 370 L686 360 L694 376 L700 373 L692 357 L705 357 Z fill=N stroke=#fff sw=3`.
- Selo "ou" no meio: `circle cx=600 cy=336 r=22 fill=#fff stroke=N sw=4`; setas `path M590 330 h20 M604 324 l6 6 -6 6 M610 344 h-20 M596 338 l-6 6 6 6 stroke=N sw=3 fill=none`.

**10. `cadeado` (HTTPS e SSL)**
- Arco: `path M548 310 v-24 a52 52 0 0 1 104 0 v24 fill=none stroke=N sw=18 linecap=round`.
- Corpo: `rect x=516 y=306 w=168 h=128 rx=20 fill=L`; fechadura `circle cx=600 cy=356 r=14 fill=N` + `rect x=594 y=360 w=12 h=34 rx=6 fill=N`.
- Confirmação: `circle cx=730 cy=270 r=24 fill=#3ee0b0`; `path M719 270 l7 7 l13 -14 stroke=#fff sw=5 fill=none`.

**11. `grafico` (Search Console)**
- Eixos: `path M430 430 H780 M430 430 V250 stroke=#cdd5ef sw=4`.
- Barras `w=44 fill=#dde3f6` com base em y=430: x=460 h=50; x=540 h=80; x=620 h=70; x=700 h=120.
- Linha: `polyline 482,370 562,340 642,350 722,300 772,262 fill=none stroke=L sw=8 linejoin=round linecap=round`;
  pontos `circle r=9 fill=#fff stroke=N sw=5` nos 4 primeiros; o último `circle cx=772 cy=262 r=14 fill=L`.

**12. `pino` (Perfil da Empresa no Google)**
- Mapa: `rect x=430 y=240 w=340 h=190 rx=16 fill=#eef1fb`; quarteirões `rect x=446 y=256 w=96 h=70 rx=8` e `rect x=640 y=372 w=110 h=44 rx=8` `fill=#dde3f6`;
  ruas `path M430 360 C520 330 600 400 770 340 stroke=#fff sw=18 fill=none` e `path M590 240 V430 stroke=#fff sw=14`.
- Pino: `path M600 360 C600 360 552 312 552 282 a48 48 0 0 1 96 0 c0 30 -48 78 -48 78 Z fill=L`; miolo `circle cx=600 cy=282 r=18 fill=#fff`.
- Avaliação: 5 `circle r=6 cy=394` em x = 660, 678, 696, 714, 732, os 4 primeiros `fill=L`, o último `fill=#cdd5ef`
  (fica sobre o quarteirão claro de baixo).

Se, ao gerar, alguma forma encostar em outra de um jeito feio, o executor pode mover **até 12 px** sem pedir; mais que
isso, anotar na resposta.

## F. O script `scripts/make-capas.mjs`

Modelo: `scripts/make-icons.mjs` (mesmo estilo: ESM, `import sharp from "sharp"`, `import.meta.dirname`).

```js
// Gera as capas dos guias (public/capas/<slug>.webp, 1200×675) a partir de desenhos vetoriais.
// Uso: node scripts/make-capas.mjs                → todas as capas da lista
//      node scripts/make-capas.mjs <slug> [slug…]  → só estas
//      node scripts/make-capas.mjs --sql [slug…]   → imprime os UPDATE da migration (não grava imagem)
//      node scripts/make-capas.mjs --folha         → também grava uma folha de contato no diretório temporário
// Capa nova: acrescente { slug, etapa, arte, alt } em CAPAS e rode com o slug.
```

Conteúdo, nesta ordem:
1. `const ETAPAS = { dominio: 1, hospedagem: 2, visual: 3, paginas: 4, google: 5, velocidade: 6, lancamento: 7 };`
2. `const ARTES = { dominio: () => "...", servidor: ..., ... }` — cada função devolve o SVG interno (só `<g>…</g>`) da seção E.
3. `function moldura(arte, etapa)` — monta o SVG completo da seção D com a arte no passo 7 e a régua da etapa.
4. `export const CAPAS = [...]` — a lista (seção G). Validar ao iniciar: slug só `[a-z0-9-]`, `etapa` existe em
   `ETAPAS`, `arte` existe em `ARTES`, `alt` com 60 a 220 caracteres, sem aspas duplas ASCII nem barra invertida.
   Qualquer falha: `console.error` + `process.exit(1)`.
5. Geração: `sharp(Buffer.from(svg)).webp({ lossless: true, effort: 6 })` e também
   `.webp({ quality: 90, effort: 6, smartSubsample: true })`; gravar o **menor** dos dois em
   `public/capas/<slug>.webp` (criar a pasta com `mkdir(..., { recursive: true })`). Conferir com `sharp(...).metadata()`
   que saiu 1200×675; se passar de **60 KB (61 440 bytes)**, abortar com a mensagem "capa <slug> com N KB: simplifique".
6. Imprimir uma tabela: `slug | arte | etapa | KB`.
7. `--sql`: para cada capa (ou só os slugs dados), imprimir
   `UPDATE posts SET image_url = '/capas/<slug>.webp', image_alt = '<alt com '' no lugar de '>' WHERE section = 'guias' AND slug = '<slug>' AND (image_url IS NULL OR image_url = '');`
8. `--folha`: compor as capas geradas em uma grade de 3 colunas, cada uma 400×225, 16 px de espaço, fundo `#eef1fb`
   (`sharp({ create: ... }).composite([...])`), e gravar em `join(os.tmpdir(), "criasite-capas-folha.png")`; imprimir o caminho.
   **Nunca** gravar a folha dentro de `public/` (iria para o site).

9. A geração (passos 5 a 8) só roda quando o arquivo é executado direto, para outro script poder fazer
   `import { CAPAS } from "./make-capas.mjs"` sem gerar nada (a 2ª leva usa isso para ler os `alt`):
   `if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) await main();`
   (`pathToFileURL` de `node:url`).

Sem `<text>` em nenhum SVG (ver seção A). Sem filtros (`<filter>`), sem degradês.

## G. Lista de capas (1ª leva) e textos alternativos

| slug | etapa | arte | alt |
|---|---|---|---|
| `como-escolher-o-dominio-do-site` | dominio | dominio | Ilustração de uma janela de navegador com uma barra de endereço grande: o nome do site em azul-marinho e a extensão em laranja, com o cursor por cima. |
| `como-escolher-a-hospedagem-do-site` | hospedagem | servidor | Ilustração de um servidor com três gavetas e luzes acesas dentro de uma janela de navegador, representando a hospedagem do site. |
| `cores-fonte-e-favicon-do-site` | visual | paleta | Ilustração com três amostras de cor, linhas de texto em tamanhos diferentes, um favicon laranja e um selo de contraste aprovado. |
| `seo-basico-para-aparecer-no-google` | google | lupa | Ilustração de uma lista de resultados de busca com o primeiro resultado em laranja e uma lupa grande por cima. |
| `site-lento-causas-e-como-otimizar-imagens` | velocidade | velocimetro | Ilustração de um velocímetro com o ponteiro perto do máximo e uma imagem grande que vira um arquivo menor, ao lado. |
| `checklist-de-lancamento-do-site` | lancamento | foguete | Ilustração de uma lista de tarefas com dois itens marcados e um foguete pronto para decolar dentro de uma janela de navegador. |

Os 6 da 2ª leva estão em `guias-leva2.md`, seção E (entram na lista quando aquela leva for executada).

## H. Migration `005_capas_guias.sql`

```sql
-- CriaSite · migration 005 · capas próprias dos 6 guias iniciais (arquivos em public/capas/)
-- Só preenche a capa onde ela está vazia: se o dono já pôs outra imagem pelo painel, nada muda.
-- Não mexe em updated_at (a página não passa a mostrar "Atualizado em").

SET NAMES utf8mb4;

UPDATE posts SET image_url = '/capas/como-escolher-o-dominio-do-site.webp', image_alt = '…' WHERE section = 'guias' AND slug = 'como-escolher-o-dominio-do-site' AND (image_url IS NULL OR image_url = '');
… (uma linha por guia, gerada com `node scripts/make-capas.mjs --sql`)
```

- **Guarda escolhida:** `section` + `slug` + capa vazia. Não exige `updated_at IS NULL`: se o dono corrigiu o texto de
  um guia no painel mas não pôs capa, ele também quer a capa; o texto não é tocado (o `UPDATE` só escreve `image_url` e
  `image_alt`). A coluna `updated_at` não tem `ON UPDATE` (ver `001_inicial.sql`), então continua como está.
- `image_credit` fica `NULL` (arte própria, sem legenda).
- Um `UPDATE` que não acha linha não dá erro: em banco sem os guias a migration passa e é marcada.
- **As imagens precisam ir no mesmo commit da migration**, senão o site aponta para arquivos que não existem.
- O dono não roda nada: o servidor aplica no próximo início depois do deploy. Mesmo assim, colar o SQL na resposta final
  (regra da casa).

## I. Capa padrão para post sem imagem (componente `Cover`)

Vale para notícia sem capa (raro: o robô descarta pauta sem imagem, mas o painel e o mock podem ter), guia novo antes
da capa e o mock. **Zero bytes de imagem**: um `div` com fundo CSS, um círculo e um ícone SVG inline de 24×24.

**Visual:** fundo `#14245e` (`--color-night-2`) com pontilhado branco a 10%; círculo da cor da editoria no canto superior
direito (o "anel" das capas, aqui cheio e translúcido); ícone branco centralizado. Mesmo clima das capas, sem a janela.

**CSS (`app/app.css`)** — substituir o bloco `.art` (manter `.art-night` como está):
```css
/* Capa padrão (post sem imagem): marinho pontilhado + círculo da editoria + ícone. Ver docs/capas.md. */
.cover-fb {
  background-color: #14245e;
  background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1.5px, transparent 1.8px);
  background-size: 22px 22px;
}
.cover-fb > svg {
  position: relative;
  height: min(40%, 112px);
  width: auto;
  color: #fff;
}
```

**Editorias (`SectionSlug` → cor do círculo e ícone; `viewBox="0 0 24 24"`, `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`):**

| Editoria | Cor | Ícone | Paths |
|---|---|---|---|
| `noticias` | `#ff7a1a` | janela de navegador | `<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M8 13l-2 2 2 2M16 13l2 2-2 2"/>` |
| `google` | `#7c5cff` | lupa | `<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>` |
| `plataformas` | `#2a8bd8` | camadas | `<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12.5l9 5 9-5M3 17l9 5 9-5"/>` |
| `ia` | `#16b37a` | brilho | `<path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z"/>` |
| `seguranca` | `#e8467c` | escudo | `<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>` |
| `guias` | `#ff9a4d` | bandeira | `<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>` |

As cores são as de `TOOL_CATEGORIES` (`app/lib/site.ts`) e da marca: o site não ganha cor nova. São decorativas
(`aria-hidden`), então não entram na regra de contraste de texto.

**Componente (`app/components/ui.tsx`)** — nova assinatura e comportamento:
```tsx
export function Cover({ image, section, className, mode = "day", eager, zoom }: {
  image?: { src: string; alt: string };
  /** Editoria do post: escolhe cor e ícone da capa padrão quando não há imagem. */
  section?: SectionSlug;
  className?: string;
  mode?: "day" | "night";
  eager?: boolean;
  /** Leve zoom da imagem no hover do card (o card precisa da classe "group"). */
  zoom?: boolean;
})
```
- **Com imagem:** como hoje, mais `bg-night-2` no `div` (enquanto a imagem carrega, o lugar já tem a cor do fundo das
  capas, sem "piscar" branco) e, se `zoom`, no `img`: `transition-transform duration-300 group-hover:scale-[1.03]`
  (o `prefers-reduced-motion` global de `app.css` já desliga a transição).
- **Sem imagem e com `section`:** `div` com `aria-hidden`, classes `cover-fb relative grid place-items-center overflow-hidden`
  + `className`; dentro, primeiro o círculo
  `<span className="absolute top-[10%] right-[8%] aspect-square h-[34%] rounded-full opacity-55" style={{ background: cor }} />`
  e depois o `<svg>` do ícone (desenhado por cima do círculo).
- **Sem imagem e sem `section`:** cai no comportamento de hoje (`art-night` se `mode="night"`, senão `cover-fb` sem ícone).
- Os ícones ficam num objeto `COVER_ART: Record<SectionSlug, { color: string; icon: ReactNode }>` no próprio `ui.tsx`.
  Importar `type SectionSlug` de `~/lib/site`.
- **CLS:** o `Cover` sempre tem tamanho dado pelo contêiner (`h-40`, `aspect-[16/9]`, `h-[60px]` etc.) e o `img` é
  `absolute inset-0 h-full w-full`: a página não pula quando a imagem chega. Não é preciso `width`/`height` no `img`
  (o Lighthouse aceita tamanho definido por CSS); conferir no passo 12.

**Chamadas:**
- `cards.tsx`: `PostCard` → `<Cover image={post.image} section={post.section} zoom className="h-40" />` e a `article`
  já tem `group`; `PostRow` e `NewsList` → acrescentar `section={…section}`.
- `post.tsx` (topo do post): `<Cover image={post.image} section={post.section} eager className=… />` (sem `zoom`).
- **`GuideCard` ganha capa** (a `/guias` hoje é uma grade de caixas só com texto):
  ```tsx
  <Link to={post.url} className="group flex flex-col overflow-hidden rounded-[16px] border border-line bg-card hover:border-ink">
    <Cover image={post.image} section="guias" zoom className="aspect-[16/9] w-full" />
    <span className="flex flex-1 flex-col gap-2.5 p-5">
      {/* pílula do nível, título (agora com group-hover:text-violet), "N min de leitura" com mt-auto */}
    </span>
  </Link>
  ```
  O `img` recebe `alt` do banco; como o título já está no card e o link inteiro é o card, **usar `alt=""` no `GuideCard`
  e no `PostCard`** seria o ideal, mas o `Cover` hoje usa `image.alt`. Manter o `alt` (o `PostCard` já põe o link da
  capa como `aria-hidden` e `tabIndex={-1}`); no `GuideCard`, envolver o `Cover` num `<span aria-hidden>` para o leitor
  de tela não ler a descrição antes do título.
  Remover o `min-h-36` (o tamanho agora vem da capa). A grade da `/guias` (`minmax(260px,1fr)`) não muda.

## J. `og:image` com texto alternativo (pequeno)

`app/lib/seo.ts`: acrescentar a `SeoInput` `imageAlt?: string` e `imageSize?: [number, number]`. Quando houver
`image`: se `imageAlt`, empurrar `og:image:alt` e `twitter:image:alt`; se `imageSize`, empurrar `og:image:width` e
`og:image:height`. Nada muda para página sem imagem.
`app/routes/post.tsx` → no `seo({...})`: `imageAlt: post.image?.alt` e
`imageSize: post.image?.src.startsWith("/capas/") ? [1200, 675] : undefined` (só as capas próprias têm tamanho conhecido;
as do robô variam).

---

## Passos

1. Ler este plano, `scripts/make-icons.mjs`, `app/components/ui.tsx`, `app/components/cards.tsx`, `app/routes/post.tsx`.
2. Criar `scripts/make-capas.mjs` com a moldura (D), **só as artes `dominio` e `velocimetro`** e a lista com os 2 guias
   correspondentes (G). Rodar `node scripts/make-capas.mjs --folha`.
3. Abrir as 2 capas e a folha; conferir os pesos (< 60 KB) e a zona segura: recortar mentalmente em 21:9 (y 80 a 595)
   e 1:1 (x 262 a 937) e ver se a janela e a régua continuam inteiras.
4. **PARAR e mostrar ao dono**: os 2 arquivos `public/capas/*.webp` (caminho completo), a folha e a tabela de pesos.
   Perguntar se aprova a linguagem (janela + sombra laranja + régua). Só seguir com o "ok". Se ele pedir ajuste de
   linguagem (cor, sombra, régua), aplicar na moldura e repetir os passos 2 a 4.
5. Desenhar as outras 10 artes (E) e completar a lista com os 6 guias da 1ª leva (G). Rodar
   `node scripts/make-capas.mjs --folha` e conferir as 6 capas na folha.
   As artes `paginas`, `email`, `plataforma`, `cadeado`, `grafico` e `pino` ficam prontas, mas só entram na lista na 2ª leva;
   para testá-las agora, gerar com slugs temporários (ex.: `teste-pino`) e **apagar** esses arquivos antes do commit.
6. `node scripts/make-capas.mjs --sql` e montar `db/migrations/005_capas_guias.sql` (H): cabeçalho + `SET NAMES utf8mb4;`
   + as 6 linhas. UTF-8 sem BOM, LF, termina com nova linha.
7. CSS: trocar `.art` por `.cover-fb` em `app/app.css` (I). Procurar outros usos da classe com a busca
   do editor pela palavra inteira `art` em `app/` e trocar se houver (hoje só o `Cover` usa).
8. `Cover` novo em `app/components/ui.tsx` (I), com `COVER_ART`.
9. Chamadas em `cards.tsx` (incluindo o novo `GuideCard`) e `post.tsx` (I).
10. `seo.ts` + `post.tsx` (J).
11. Mock: em `app/lib/mock-data.ts`, aceitar `image?` no `Seed` e passar adiante na montagem do `Post`; pôr
    `image: { src: "/capas/como-escolher-o-dominio-do-site.webp", alt: "<alt da tabela G>" }` no guia de exemplo
    `como-escolher-um-dominio`. Os outros 2 guias de exemplo e as notícias ficam sem imagem (servem para ver a capa padrão).
12. `npm run typecheck` e `npm run build` sem erro. `npm run dev` e conferir (ver **Como verificar**), com capturas.
13. Atualizar `docs/capas.md` (status, pesos reais), `docs/README.md` (status ✅, Próximos passos) e, se algo mudou do
    plano, `docs/decisoes.md`.
14. Commit (`feat: capas próprias dos guias + capa padrão por editoria`) com as 6 `.webp`, o script e a migration 005;
    push. Colar o SQL da 004 na resposta ao dono, avisando que o servidor aplica sozinho.
15. Depois do deploy: abrir `/guias`, um guia e colar o link de um guia numa conversa do WhatsApp (prévia com a capa).

## Riscos e cuidados

- **Fonte no librsvg:** resolvido por não usar texto (A). Se o executor sentir falta de texto, **não** pôr `<text>`.
- **Peso:** o pontilhado e os traços finos são o que mais pesa no WebP sem perda. Se passar de 60 KB, primeiro aumentar
  o espaçamento do pontilhado para 40 px; depois testar só o modo com perda (`quality: 88`).
- **Cache:** `public/` é servido com `maxAge: 1h`. Se uma capa for redesenhada depois, trocar o nome do arquivo
  (`<slug>-v2.webp`) e atualizar `image_url` por migration nova ou pelo painel; reescrever com o mesmo nome deixa
  versões velhas em cache (WhatsApp e Facebook guardam a prévia por muito mais tempo).
- **WebP no `og:image`:** as notícias do robô já usam WebP como `og:image`. Mesmo assim, conferir a prévia no WhatsApp
  (passo 15). Se não aparecer, plano B: o script grava também `<slug>.jpg` (qualidade 85) e a migration seguinte troca o
  `image_url` para o `.jpg` (anotar em Perguntas em aberto deste doc se acontecer).
- **Migration roda uma vez:** se a 004 for ao ar com erro de digitação num slug, aquele guia fica sem capa; a correção é
  pelo painel (campo "Capa (endereço da imagem)": `/capas/<slug>.webp`) ou nova migration. Por isso gerar as linhas pelo `--sql`.
- **Imagens fora do commit = capa quebrada no ar.** Conferir `git status` antes do commit: 6 arquivos em `public/capas/`.
- Não gravar nada de teste em `public/capas/` no commit (folha, `teste-*`).
- React Router: `npm run build` antes do push. Nada aqui mexe em loader.
- `GuideCard` mais alto muda a altura da `/guias`; sem efeito em outras páginas (só a `section.tsx` usa).

## Como verificar

- `node scripts/make-capas.mjs` imprime a tabela com 6 linhas, todas < 60 KB; `sharp` lê 1200×675 em cada arquivo.
- Folha de contato: as 6 capas lado a lado parecem da mesma família (mesma janela, sombra, régua; só muda o desenho e o
  ponto aceso).
- `npm run dev` (mock), capturas para o dono em **1280 px** e **390 px** (modo dispositivo do navegador):
  1. `/guias`: o guia de exemplo com a capa de domínio; os outros 2 com a capa padrão de guias (marinho pontilhado,
     círculo laranja-claro, bandeira branca). Hover no card: borda marinho, título laranja, zoom leve na imagem.
  2. `/guias/como-escolher-um-dominio`: capa no topo em 16:9 (390 px) e 21:9 (1280 px); a janela e a régua inteiras
     nos dois.
  3. `/noticias` e `/busca?q=site`: miniaturas sem imagem com ícone e cor da editoria certa (lupa roxa no Google,
     escudo rosa em Segurança etc.); nenhuma listra em lugar nenhum.
  4. Home, lista "Notícias da web": miniatura 60×60 legível (ícone centrado, não cortado).
- Lighthouse (aba anônima, celular) num guia com capa: CLS ≤ 0,1 e nenhum aviso de "imagem sem dimensões explícitas".
- Código-fonte da página do guia: `og:image` absoluto terminando em `.webp`, `og:image:width` 1200, `og:image:height` 675,
  `og:image:alt` com o texto da tabela G.
- Produção, depois do deploy: `/guias` com as 6 capas; WhatsApp mostra a prévia com a capa ao colar o link de um guia.

## Perguntas em aberto

1. **Aprovação do visual** (passo 4): o dono aprova a linguagem "janela branca com sombra laranja + régua da trilha"?
   Alternativa, se preferir algo mais ousado: fundo laranja `#ff7a1a` com a janela marinho (inverte as cores; destaca
   mais na lista, mas briga com o botão "Buscar" e os destaques laranja do site). A recomendação é a versão marinho.
2. **Capas das notícias do robô:** ficam como estão (foto da fonte). Este plano só cobre a capa padrão quando falta foto.
