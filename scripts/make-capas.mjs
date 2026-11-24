// Gera as capas dos guias (public/capas/<slug>.webp, 1200×675) a partir de desenhos vetoriais (SVG → WebP com sharp).
// Uso: node scripts/make-capas.mjs                → todas as capas da lista
//      node scripts/make-capas.mjs <slug> [slug…]  → só estas
//      node scripts/make-capas.mjs --sql [slug…]   → imprime os UPDATE da migration (não grava imagem)
//      node scripts/make-capas.mjs --folha         → também grava uma folha de contato no diretório temporário
// Capa nova: acrescente { slug, etapa, arte, alt } em CAPAS (e, se for um desenho novo, a função em ARTES) e rode com o slug.
// Sem <text>: a saída é idêntica em qualquer máquina (o librsvg depende das fontes instaladas). Ver docs/capas.md.
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const OUT = join(import.meta.dirname, "..", "public", "capas");
const MAX_BYTES = 61_440; // 60 KB

// Etapas da trilha (ids de TRAIL em app/lib/site.ts).
const ETAPAS = { dominio: 1, hospedagem: 2, visual: 3, paginas: 4, google: 5, velocidade: 6, lancamento: 7 };

// Etapas do roteiro "Criar site com IA" (régua própria, com losangos e uma faísca; ver docs/ia-desenvolvimento.md).
const ETAPAS_IA = { planejar: 1, contexto: 2, pedir: 3, revisar: 4, publicar: 5, alem: 6 };
// Faísca da IA (mesmo desenho do ícone da editoria "ia" no Cover), viewBox 24.
const FAISCA = "M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z";

// Cores (tokens do site, ver app/app.css).
const N = "#0c1a4b"; // marinho
const L = "#ff7a1a"; // laranja forte
const LC = "#ff9a4d"; // laranja claro

// Cada arte devolve o SVG interno (sempre dentro de x 400 a 800, y 225 a 450, a área útil da janela).
const ARTES = {
  // Barra de endereço grande: nome em marinho, extensão em laranja, cursor e sugestões.
  dominio: () => `<g stroke-linecap="round" stroke-linejoin="round">
    <rect x="410" y="290" width="380" height="72" rx="36" fill="#eef1fb" stroke="${N}" stroke-width="4"/>
    <circle cx="452" cy="326" r="18" fill="none" stroke="${N}" stroke-width="4"/>
    <ellipse cx="452" cy="326" rx="8" ry="18" fill="none" stroke="${N}" stroke-width="3"/>
    <path d="M434 326h36" stroke="${N}" stroke-width="3" fill="none"/>
    <rect x="488" y="316" width="150" height="20" rx="10" fill="${N}"/>
    <rect x="646" y="316" width="70" height="20" rx="10" fill="${L}"/>
    <rect x="470" y="388" width="70" height="26" rx="13" fill="#dde3f6"/>
    <rect x="550" y="388" width="90" height="26" rx="13" fill="#fff0e5" stroke="${L}" stroke-width="3"/>
    <rect x="650" y="388" width="80" height="26" rx="13" fill="#dde3f6"/>
    <path d="M700 340 L700 384 L712 372 L722 392 L730 388 L720 368 L736 368 Z" fill="${N}" stroke="#ffffff" stroke-width="3"/>
  </g>`,

  // Velocímetro quase no máximo + imagem grande que vira um arquivo menor.
  velocimetro: () => `<g stroke-linecap="round" stroke-linejoin="round">
    <path d="M440 400 A120 120 0 0 1 680 400" fill="none" stroke="#dde3f6" stroke-width="28"/>
    <path d="M440 400 A120 120 0 0 1 651.9 322.9" fill="none" stroke="${L}" stroke-width="28"/>
    <path d="M560 400 L632.8 338.9" stroke="${N}" stroke-width="10" fill="none"/>
    <circle cx="560" cy="400" r="16" fill="${N}"/>
    <rect x="700" y="250" width="80" height="64" rx="10" fill="#eef1fb" stroke="${N}" stroke-width="4"/>
    <path d="M710 304 l20 -22 l16 14 l10 -8 l14 16 Z" fill="#cdd5ef"/>
    <path d="M740 324 v18 M732 334 l8 8 l8 -8" stroke="${L}" stroke-width="5" fill="none"/>
    <rect x="716" y="352" width="48" height="38" rx="8" fill="${L}"/>
  </g>`,

  // Três gavetas de servidor com LEDs (hospedagem).
  servidor: () => `<g stroke-linecap="round" stroke-linejoin="round">
    ${[250, 314, 378]
      .map(
        (y, i) => `<rect x="470" y="${y}" width="260" height="52" rx="12" fill="${N}"/>
    <circle cx="500" cy="${y + 26}" r="7" fill="${i === 0 ? L : "#3ee0b0"}"/>
    <circle cx="524" cy="${y + 26}" r="7" fill="#2a3c80"/>
    <rect x="610" y="${y + 16}" width="96" height="8" rx="4" fill="#2a3c80"/>
    <rect x="610" y="${y + 30}" width="96" height="8" rx="4" fill="#2a3c80"/>`,
      )
      .join("\n    ")}
  </g>`,

  // Amostras de cor, linhas de texto, favicon e selo de contraste.
  paleta: () => `<g stroke-linecap="round" stroke-linejoin="round">
    <circle cx="450" cy="290" r="34" fill="${N}"/>
    <circle cx="520" cy="290" r="34" fill="${L}"/>
    <circle cx="590" cy="290" r="34" fill="#cdd5ef" stroke="${N}" stroke-width="3"/>
    <rect x="420" y="356" width="200" height="24" rx="6" fill="${N}"/>
    <rect x="420" y="394" width="260" height="12" rx="6" fill="#cdd5ef"/>
    <rect x="420" y="416" width="220" height="12" rx="6" fill="#cdd5ef"/>
    <g transform="translate(680 256) scale(1.5)">
      <rect width="64" height="64" rx="16" fill="${L}"/>
      <rect x="12" y="16" width="40" height="32" rx="6" fill="none" stroke="#ffffff" stroke-width="5"/>
      <path d="M12 26h40" stroke="#ffffff" stroke-width="5"/>
      <path d="M26 33l-5 5 5 5M38 33l5 5-5 5" fill="none" stroke="#ffffff" stroke-width="4.5"/>
    </g>
    <circle cx="728" cy="400" r="30" fill="#fff0e5" stroke="${L}" stroke-width="4"/>
    <path d="M714 400 l10 10 l18 -20" stroke="#c24e06" stroke-width="5" fill="none"/>
  </g>`,

  // Rascunho de uma página inicial: cabeçalho, título, botão, imagem e três blocos.
  paginas: () => `<g stroke-linecap="round" stroke-linejoin="round">
    <rect x="420" y="236" width="360" height="28" rx="8" fill="#dde3f6"/>
    <rect x="720" y="243" width="48" height="14" rx="7" fill="${L}"/>
    <rect x="420" y="276" width="220" height="16" rx="8" fill="${N}"/>
    <rect x="420" y="300" width="170" height="10" rx="5" fill="#cdd5ef"/>
    <rect x="420" y="322" width="96" height="28" rx="14" fill="${L}"/>
    <rect x="660" y="276" width="120" height="74" rx="10" fill="#eef1fb" stroke="#cdd5ef" stroke-width="3"/>
    <path d="M672 340 l28 -30 l20 18 l14 -12 l34 24 Z" fill="#cdd5ef"/>
    <circle cx="752" cy="296" r="8" fill="${LC}"/>
    ${[420, 544, 668]
      .map(
        (x, i) => `<rect x="${x}" y="370" width="112" height="64" rx="10" fill="#eef1fb" stroke="#dde3f6" stroke-width="2"/>
    <rect x="${x + 12}" y="382" width="22" height="22" rx="6" fill="${i === 1 ? L : N}"/>
    <rect x="${x + 12}" y="412" width="70" height="8" rx="4" fill="#cdd5ef"/>`,
      )
      .join("\n    ")}
  </g>`,

  // Resultados de busca com o primeiro em laranja e uma lupa por cima.
  lupa: () => `<g stroke-linecap="round" stroke-linejoin="round">
    ${[240, 310, 380]
      .map(
        (y, i) => `<rect x="420" y="${y}" width="230" height="14" rx="7" fill="${i === 0 ? L : N}"/>
    <rect x="420" y="${y + 20}" width="120" height="8" rx="4" fill="#5a6798"/>
    <rect x="420" y="${y + 36}" width="280" height="8" rx="4" fill="#cdd5ef"/>`,
      )
      .join("\n    ")}
    <circle cx="700" cy="330" r="62" fill="#ffffff" fill-opacity="0.7" stroke="${N}" stroke-width="12"/>
    <path d="M744 374 L790 420" stroke="${N}" stroke-width="18" fill="none"/>
    <path d="M664 312 a40 40 0 0 1 30 -28" stroke="${L}" stroke-width="6" fill="none"/>
  </g>`,

  // Checklist com dois itens marcados e um foguete (lançamento).
  foguete: () => `<g stroke-linecap="round" stroke-linejoin="round">
    ${[262, 316, 370]
      .map((y, i) =>
        i < 2
          ? `<rect x="420" y="${y}" width="34" height="34" rx="8" fill="${L}"/>
    <path d="M428 ${y + 17} l7 7 l13 -14" stroke="#ffffff" stroke-width="5" fill="none"/>
    <rect x="470" y="${y + 11}" width="150" height="12" rx="6" fill="${N}"/>`
          : `<rect x="420" y="${y}" width="34" height="34" rx="8" fill="none" stroke="#cdd5ef" stroke-width="4"/>
    <rect x="470" y="${y + 11}" width="150" height="12" rx="6" fill="#cdd5ef"/>`,
      )
      .join("\n    ")}
    <path d="M720 236 C750 262 758 312 748 362 L692 362 C682 312 690 262 720 236 Z" fill="${N}"/>
    <circle cx="720" cy="300" r="16" fill="#ffffff" stroke="${L}" stroke-width="6"/>
    <path d="M692 330 L668 372 L696 362 Z" fill="${L}"/>
    <path d="M748 330 L772 372 L744 362 Z" fill="${L}"/>
    <path d="M704 366 Q720 420 736 366 Z" fill="${LC}"/>
  </g>`,

  // Envelope com selo de arroba desenhado em traços (sem fonte).
  email: () => `<g stroke-linecap="round" stroke-linejoin="round">
    <rect x="460" y="258" width="240" height="160" rx="16" fill="#eef1fb" stroke="${N}" stroke-width="6"/>
    <path d="M466 266 L580 350 L694 266" fill="none" stroke="${N}" stroke-width="6"/>
    <circle cx="704" cy="262" r="36" fill="${L}"/>
    <circle cx="704" cy="262" r="11" fill="none" stroke="#ffffff" stroke-width="5"/>
    <path d="M715 262 v6 a7 7 0 0 0 14 0 v-6 a25 25 0 1 0 -10 20" fill="none" stroke="#ffffff" stroke-width="5"/>
  </g>`,

  // Painel de código x painel de blocos, com selo "ou" em setas (WordPress ou construtor).
  plataforma: () => `<g stroke-linecap="round" stroke-linejoin="round">
    <rect x="420" y="246" width="168" height="180" rx="14" fill="${N}"/>
    <rect x="440" y="270" width="90" height="8" rx="4" fill="#2a3c80"/>
    <rect x="440" y="390" width="90" height="8" rx="4" fill="#2a3c80"/>
    <path d="M488 316 l-18 20 18 20 M524 316 l18 20 -18 20" fill="none" stroke="${LC}" stroke-width="6"/>
    <rect x="612" y="246" width="168" height="180" rx="14" fill="#eef1fb" stroke="#cdd5ef" stroke-width="3"/>
    <rect x="628" y="264" width="136" height="40" rx="8" fill="#dde3f6"/>
    <rect x="628" y="314" width="62" height="52" rx="8" fill="${L}"/>
    <rect x="702" y="314" width="62" height="52" rx="8" fill="#dde3f6"/>
    <rect x="628" y="376" width="136" height="32" rx="8" fill="#dde3f6"/>
    <path d="M676 334 L676 370 L686 360 L694 376 L700 373 L692 357 L705 357 Z" fill="${N}" stroke="#ffffff" stroke-width="3"/>
    <circle cx="600" cy="336" r="22" fill="#ffffff" stroke="${N}" stroke-width="4"/>
    <path d="M590 330 h20 M604 324 l6 6 -6 6 M610 344 h-20 M596 338 l-6 6 6 6" fill="none" stroke="${N}" stroke-width="3"/>
  </g>`,

  // Cadeado laranja fechado com selo de confirmação (HTTPS e SSL).
  cadeado: () => `<g stroke-linecap="round" stroke-linejoin="round">
    <path d="M548 310 v-24 a52 52 0 0 1 104 0 v24" fill="none" stroke="${N}" stroke-width="18"/>
    <rect x="516" y="306" width="168" height="128" rx="20" fill="${L}"/>
    <circle cx="600" cy="356" r="14" fill="${N}"/>
    <rect x="594" y="360" width="12" height="34" rx="6" fill="${N}"/>
    <circle cx="730" cy="270" r="24" fill="#3ee0b0"/>
    <path d="M719 270 l7 7 l13 -14" stroke="#ffffff" stroke-width="5" fill="none"/>
  </g>`,

  // Gráfico de barras com linha subindo (relatórios do Search Console).
  grafico: () => `<g stroke-linecap="round" stroke-linejoin="round">
    <path d="M430 430 H780 M430 430 V250" stroke="#cdd5ef" stroke-width="4" fill="none"/>
    <rect x="460" y="380" width="44" height="50" fill="#dde3f6"/>
    <rect x="540" y="350" width="44" height="80" fill="#dde3f6"/>
    <rect x="620" y="360" width="44" height="70" fill="#dde3f6"/>
    <rect x="700" y="310" width="44" height="120" fill="#dde3f6"/>
    <polyline points="482,370 562,340 642,350 722,300 772,262" fill="none" stroke="${L}" stroke-width="8"/>
    <circle cx="482" cy="370" r="9" fill="#ffffff" stroke="${N}" stroke-width="5"/>
    <circle cx="562" cy="340" r="9" fill="#ffffff" stroke="${N}" stroke-width="5"/>
    <circle cx="642" cy="350" r="9" fill="#ffffff" stroke="${N}" stroke-width="5"/>
    <circle cx="722" cy="300" r="9" fill="#ffffff" stroke="${N}" stroke-width="5"/>
    <circle cx="772" cy="262" r="14" fill="${L}"/>
  </g>`,

  // Mapa simplificado com pino laranja e cinco estrelas (Perfil da Empresa).
  pino: () => `<g stroke-linecap="round" stroke-linejoin="round">
    <rect x="430" y="240" width="340" height="190" rx="16" fill="#eef1fb"/>
    <rect x="446" y="256" width="96" height="70" rx="8" fill="#dde3f6"/>
    <rect x="640" y="372" width="110" height="44" rx="8" fill="#dde3f6"/>
    <path d="M430 360 C520 330 600 400 770 340" stroke="#ffffff" stroke-width="18" fill="none"/>
    <path d="M590 240 V430" stroke="#ffffff" stroke-width="14" fill="none"/>
    <path d="M600 360 C600 360 552 312 552 282 a48 48 0 0 1 96 0 c0 30 -48 78 -48 78 Z" fill="${L}"/>
    <circle cx="600" cy="282" r="18" fill="#ffffff"/>
    ${[660, 678, 696, 714, 732].map((x, i) => `<circle cx="${x}" cy="394" r="6" fill="${i < 4 ? L : "#cdd5ef"}"/>`).join("")}
  </g>`,

  // Ciclo de 5 caixas: plano, pedido à IA, partes pequenas, revisão aprovada, versão salva (roteiro de IA, guia 1).
  fluxo: () => `<g stroke-linecap="round" stroke-linejoin="round">
    <rect x="420" y="246" width="104" height="60" rx="12" fill="#eef1fb" stroke="${N}" stroke-width="4"/>
    <rect x="436" y="262" width="44" height="10" rx="5" fill="${N}"/>
    <rect x="436" y="280" width="68" height="8" rx="4" fill="#cdd5ef"/>
    <rect x="548" y="246" width="104" height="60" rx="12" fill="#fff0e5" stroke="${L}" stroke-width="4"/>
    <path d="${FAISCA}" fill="${L}" transform="translate(582 258) scale(1.6)"/>
    <rect x="676" y="246" width="104" height="60" rx="12" fill="#eef1fb" stroke="${N}" stroke-width="4"/>
    <rect x="692" y="262" width="56" height="8" rx="4" fill="${N}"/>
    <rect x="692" y="276" width="72" height="8" rx="4" fill="#cdd5ef"/>
    <rect x="692" y="290" width="40" height="8" rx="4" fill="#cdd5ef"/>
    <path d="M528 276 h14 M536 270 l6 6 -6 6 M656 276 h14 M664 270 l6 6 -6 6 M728 310 v30 M722 334 l6 6 6 -6" fill="none" stroke="${N}" stroke-width="4"/>
    <rect x="676" y="350" width="104" height="60" rx="12" fill="${N}"/>
    <path d="M712 380 l10 10 l22 -22" stroke="#ffffff" stroke-width="6" fill="none"/>
    <rect x="548" y="350" width="104" height="60" rx="12" fill="#eef1fb" stroke="${N}" stroke-width="4"/>
    <path d="M576 368 V394 M576 378 Q576 380 606 380" fill="none" stroke="${N}" stroke-width="4"/>
    <circle cx="576" cy="366" r="6" fill="${N}"/>
    <circle cx="576" cy="396" r="6" fill="${N}"/>
    <circle cx="612" cy="380" r="6" fill="${L}"/>
    <path d="M672 380 h-14 M664 374 l-6 6 6 6" fill="none" stroke="${N}" stroke-width="4"/>
    <path d="M544 380 H472 V316" fill="none" stroke="#cdd5ef" stroke-width="4" stroke-dasharray="2 10"/>
    <path d="M466 322 l6 -8 l6 8" fill="none" stroke="#cdd5ef" stroke-width="4"/>
  </g>`,

  // Conversa com pedido estruturado (guia 2).
  prompt: () => {
    const ys = [260, 286, 312, 338];
    const ws = [170, 140, 190, 120];
    const linhas = ys
      .map((y, i) => `<rect x="450" y="${y}" width="50" height="12" rx="6" fill="${L}"/><rect x="510" y="${y}" width="${ws[i]}" height="12" rx="6" fill="${i === 0 ? N : "#cdd5ef"}"/>`)
      .join("");
    return `<g stroke-linecap="round" stroke-linejoin="round">
    <rect x="430" y="240" width="300" height="130" rx="18" fill="#eef1fb" stroke="#cdd5ef" stroke-width="3"/>
    ${linhas}
    <rect x="430" y="396" width="340" height="44" rx="22" fill="#fff" stroke="${N}" stroke-width="4"/>
    <path d="M452 408 v20" stroke="${L}" stroke-width="4" fill="none"/>
    <circle cx="746" cy="418" r="16" fill="${L}"/>
    <path d="M739 418 h14 M747 411 l7 7 -7 7" stroke="#fff" stroke-width="4" fill="none"/>
    <path d="${FAISCA}" fill="${LC}" transform="translate(744 236) scale(2)"/>
  </g>`;
  },

  // Arquivo de instruções lido pelo assistente (guia 3).
  instrucoes: () => {
    const itens = [[372, 110], [390, 90], [408, 120]]
      .map(([cy, w]) => `<circle cx="468" cy="${cy}" r="4" fill="${N}"/><rect x="480" y="${cy - 4}" width="${w}" height="8" rx="4" fill="#cdd5ef"/>`)
      .join("");
    return `<g stroke-linecap="round" stroke-linejoin="round">
    <path d="M440 240 h150 l40 40 v150 h-190 Z" fill="#fff" stroke="${N}" stroke-width="5"/>
    <path d="M590 240 v40 h40 Z" fill="#eef1fb" stroke="${N}" stroke-width="5"/>
    <rect x="462" y="266" width="16" height="16" rx="4" fill="${L}"/><rect x="486" y="268" width="80" height="12" rx="6" fill="${N}"/>
    <rect x="462" y="298" width="140" height="8" rx="4" fill="#cdd5ef"/><rect x="462" y="314" width="140" height="8" rx="4" fill="#cdd5ef"/>
    <rect x="462" y="338" width="16" height="16" rx="4" fill="${L}"/><rect x="486" y="340" width="100" height="12" rx="6" fill="${N}"/>
    ${itens}
    <path d="M646 336 h50 M686 326 l10 10 -10 10" stroke="${L}" stroke-width="6" fill="none"/>
    <circle cx="740" cy="336" r="40" fill="${N}"/>
    <path d="${FAISCA}" fill="#fff" transform="translate(716 312) scale(2)"/>
  </g>`;
  },

  // Três cartões de receita, o do meio escolhido (guia 4).
  skills: () => `<g stroke-linecap="round" stroke-linejoin="round">
    <rect x="430" y="290" width="110" height="140" rx="14" fill="#eef1fb" stroke="#cdd5ef" stroke-width="3"/>
    <rect x="446" y="308" width="60" height="10" rx="5" fill="${N}"/><rect x="446" y="330" width="78" height="6" rx="3" fill="#cdd5ef"/><rect x="446" y="344" width="60" height="6" rx="3" fill="#cdd5ef"/>
    <circle cx="485" cy="395" r="16" fill="none" stroke="${N}" stroke-width="4"/><path d="M485 387 v16 M477 395 h16" stroke="${N}" stroke-width="4"/>
    <rect x="660" y="290" width="110" height="140" rx="14" fill="#eef1fb" stroke="#cdd5ef" stroke-width="3"/>
    <rect x="676" y="308" width="60" height="10" rx="5" fill="${N}"/><rect x="676" y="330" width="78" height="6" rx="3" fill="#cdd5ef"/><rect x="676" y="344" width="60" height="6" rx="3" fill="#cdd5ef"/>
    <path d="M706 383 l-12 12 12 12 M730 383 l12 12 -12 12" stroke="${N}" stroke-width="4" fill="none"/>
    <rect x="545" y="250" width="110" height="140" rx="14" fill="${L}"/>
    <rect x="561" y="268" width="60" height="10" rx="5" fill="#fff"/><rect x="561" y="290" width="78" height="6" rx="3" fill="#fff0e5"/><rect x="561" y="304" width="60" height="6" rx="3" fill="#fff0e5"/>
    <circle cx="600" cy="350" r="22" fill="#fff"/><path d="M590 350 l7 7 l13 -14" stroke="${L}" stroke-width="5" fill="none"/>
  </g>`,

  // Assistente no centro ligado a três conectores (guia 5).
  mcp: () => `<g stroke-linecap="round" stroke-linejoin="round">
    <path d="M562 338 H480 M630 316 L700 280 M630 360 L700 398" stroke="#cdd5ef" stroke-width="6" fill="none"/>
    <circle cx="520" cy="338" r="6" fill="${L}"/><circle cx="665" cy="298" r="6" fill="${L}"/><circle cx="665" cy="379" r="6" fill="${L}"/>
    <circle cx="600" cy="338" r="38" fill="${N}"/>
    <path d="${FAISCA}" fill="#fff" transform="translate(576 314) scale(2)"/>
    <path d="M416 312 v52 a30 10 0 0 0 60 0 v-52" fill="#eef1fb" stroke="${N}" stroke-width="4"/>
    <ellipse cx="446" cy="312" rx="30" ry="10" fill="#eef1fb" stroke="${N}" stroke-width="4"/>
    <path d="M416 338 a30 10 0 0 0 60 0" fill="none" stroke="${N}" stroke-width="3"/>
    <path d="M704 250 h24 l8 10 h34 v42 h-66 Z" fill="#fff0e5" stroke="${L}" stroke-width="4"/>
    <rect x="704" y="384" width="66" height="48" rx="8" fill="#eef1fb" stroke="${N}" stroke-width="4"/>
    <path d="M704 398 h66" stroke="${N}" stroke-width="3"/>
    <circle cx="712" cy="391" r="3" fill="${N}"/><circle cx="721" cy="391" r="3" fill="${N}"/>
  </g>`,

  // Escudo, chave proibida no chat e confirmação (guia 6).
  escudo: () => `<g stroke-linecap="round" stroke-linejoin="round">
    <path d="M600 238 l80 30 v58 c0 52 -34 88 -80 104 c-46 -16 -80 -52 -80 -104 v-58 Z" fill="${N}"/>
    <circle cx="600" cy="318" r="18" fill="${L}"/><rect x="592" y="326" width="16" height="40" rx="8" fill="${L}"/>
    <rect x="414" y="262" width="84" height="60" rx="14" fill="#eef1fb" stroke="#cdd5ef" stroke-width="3"/>
    <circle cx="440" cy="292" r="10" fill="none" stroke="${N}" stroke-width="4"/>
    <path d="M450 292 h30 M470 292 v8 M478 292 v6" stroke="${N}" stroke-width="4" fill="none"/>
    <circle cx="456" cy="292" r="36" fill="none" stroke="${L}" stroke-width="5"/>
    <path d="M431 317 L481 267" stroke="${L}" stroke-width="5"/>
    <circle cx="730" cy="380" r="24" fill="#3ee0b0"/>
    <path d="M719 380 l7 7 l13 -14" stroke="#fff" stroke-width="5" fill="none"/>
  </g>`,

  // Painel de diferenças e lista de revisão (guia 7).
  revisao: () => {
    const ws = [120, 90, 150, 110, 70, 130, 100];
    const linhas = ws
      .map((w, i) => {
        const y = 266 + 24 * i;
        const mc = i === 2 || i === 3 ? "#3ee0b0" : i === 5 ? L : "#2a3c80";
        const cc = i === 5 ? LC : "#2a3c80";
        return `<rect x="436" y="${y}" width="10" height="10" rx="3" fill="${mc}"/><rect x="456" y="${y}" width="${w}" height="10" rx="5" fill="${cc}"/>`;
      })
      .join("");
    const itens = [284, 324, 364]
      .map((y, i) =>
        i < 2
          ? `<rect x="694" y="${y}" width="22" height="22" rx="6" fill="${L}"/><path d="M699 ${y + 11} l5 5 l9 -10" stroke="#fff" stroke-width="4" fill="none"/><rect x="724" y="${y + 7}" width="46" height="8" rx="4" fill="${N}"/>`
          : `<rect x="694" y="${y}" width="22" height="22" rx="6" fill="none" stroke="#cdd5ef" stroke-width="3"/><rect x="724" y="${y + 7}" width="46" height="8" rx="4" fill="#cdd5ef"/>`,
      )
      .join("");
    return `<g stroke-linecap="round" stroke-linejoin="round">
    <rect x="420" y="244" width="240" height="186" rx="14" fill="${N}"/>
    <rect x="428" y="379" width="224" height="24" rx="6" fill="#1d2c66"/>
    ${linhas}
    <rect x="680" y="264" width="104" height="148" rx="12" fill="#eef1fb" stroke="#cdd5ef" stroke-width="3"/>
    ${itens}
  </g>`;
  },

  // Página e três selos: busca, contraste e velocidade (guia 8).
  qualidade: () => {
    const checks = [254, 320, 386]
      .map((cy) => `<circle cx="742" cy="${cy}" r="10" fill="#3ee0b0"/><path d="M737 ${cy} l4 4 l7 -8" stroke="#fff" stroke-width="3" fill="none"/>`)
      .join("");
    return `<g stroke-linecap="round" stroke-linejoin="round">
    <rect x="420" y="240" width="200" height="190" rx="12" fill="#eef1fb" stroke="#cdd5ef" stroke-width="3"/>
    <rect x="438" y="258" width="120" height="14" rx="7" fill="${N}"/>
    <rect x="438" y="284" width="160" height="8" rx="4" fill="#cdd5ef"/><rect x="438" y="298" width="160" height="8" rx="4" fill="#cdd5ef"/>
    <rect x="438" y="316" width="164" height="70" rx="8" fill="#dde3f6"/>
    <path d="M450 376 l26 -28 l18 16 l14 -10 l30 22 Z" fill="#cdd5ef"/>
    <rect x="438" y="398" width="70" height="18" rx="9" fill="${L}"/>
    <path d="M620 272 H670 M620 338 H670 M620 404 H670" stroke="#cdd5ef" stroke-width="4" fill="none"/>
    <circle cx="700" cy="272" r="30" fill="#fff" stroke="${N}" stroke-width="5"/>
    <circle cx="696" cy="268" r="10" fill="none" stroke="${N}" stroke-width="4"/><path d="M703 275 l9 9" stroke="${N}" stroke-width="5"/>
    <circle cx="700" cy="338" r="30" fill="#fff" stroke="${N}" stroke-width="5"/>
    <circle cx="700" cy="338" r="14" fill="none" stroke="${N}" stroke-width="4"/><path d="M700 324 a14 14 0 0 1 0 28 Z" fill="${N}"/>
    <circle cx="700" cy="404" r="30" fill="#fff" stroke="${N}" stroke-width="5"/>
    <path d="M704 388 L690 408 H702 L698 424 L714 402 H702 Z" fill="${L}"/>
    ${checks}
  </g>`;
  },
  // Folha da política com item marcado + escudo com cadeado (3ª leva, privacidade).
  privacidade: () => `<g stroke-linecap="round" stroke-linejoin="round">
    <rect x="440" y="240" width="180" height="190" rx="14" fill="#eef1fb" stroke="${N}" stroke-width="4"/>
    <rect x="462" y="262" width="110" height="14" rx="7" fill="${N}"/>
    ${[292, 310, 328].map((y) => `<rect x="462" y="${y}" width="136" height="8" rx="4" fill="#cdd5ef"/>`).join("")}
    <rect x="462" y="346" width="96" height="8" rx="4" fill="#cdd5ef"/>
    <rect x="462" y="372" width="20" height="20" rx="5" fill="${L}"/>
    <path d="M466 382 l4 4 l8 -9" stroke="#fff" stroke-width="3" fill="none"/>
    <rect x="490" y="378" width="90" height="8" rx="4" fill="${N}"/>
    <path d="M700 250 l66 24 v50 c0 44 -28 76 -66 90 c-38 -14 -66 -46 -66 -90 v-50 Z" fill="${N}"/>
    <path d="M684 326 v-12 a16 16 0 0 1 32 0 v12" fill="none" stroke="${LC}" stroke-width="6"/>
    <rect x="676" y="322" width="48" height="40" rx="8" fill="${L}"/>
    <circle cx="700" cy="338" r="5" fill="${N}"/>
    <rect x="698" y="340" width="4" height="12" rx="2" fill="${N}"/>
  </g>`,

  // Biscoito mordido, dois interruptores e aviso com dois botões do mesmo tamanho (3ª leva, cookies).
  cookie: () => `<g stroke-linecap="round" stroke-linejoin="round">
    <circle cx="500" cy="300" r="62" fill="${LC}"/>
    <circle cx="552" cy="256" r="22" fill="#ffffff"/>
    ${[[478, 282], [514, 318], [470, 330], [526, 292]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="#c24e06"/>`).join("")}
    <rect x="620" y="262" width="56" height="30" rx="15" fill="#3ee0b0"/>
    <circle cx="661" cy="277" r="11" fill="#fff"/>
    <rect x="690" y="273" width="80" height="8" rx="4" fill="${N}"/>
    <rect x="620" y="310" width="56" height="30" rx="15" fill="#cdd5ef"/>
    <circle cx="635" cy="325" r="11" fill="#fff"/>
    <rect x="690" y="321" width="64" height="8" rx="4" fill="#cdd5ef"/>
    <rect x="420" y="380" width="360" height="58" rx="14" fill="${N}"/>
    <rect x="440" y="396" width="120" height="8" rx="4" fill="#2a3c80"/>
    <rect x="440" y="412" width="90" height="8" rx="4" fill="#2a3c80"/>
    <rect x="600" y="394" width="76" height="30" rx="15" fill="${LC}"/>
    <rect x="688" y="394" width="76" height="30" rx="15" fill="${LC}"/>
  </g>`,

  // Três cartões de números e três barras de páginas mais vistas (3ª leva, visitas).
  visitas: () => `<g stroke-linecap="round" stroke-linejoin="round">
    ${[420, 547, 674]
      .map(
        (x, i) => `<rect x="${x}" y="240" width="106" height="64" rx="10" fill="#eef1fb" stroke="#dde3f6" stroke-width="2"/>
    <rect x="${x + 14}" y="256" width="52" height="16" rx="8" fill="${i === 1 ? L : N}"/>
    <rect x="${x + 14}" y="282" width="72" height="8" rx="4" fill="#cdd5ef"/>`,
      )
      .join("\n    ")}
    ${[
      [330, 250, L],
      [362, 170, N],
      [394, 110, N],
    ]
      .map(([y, w, c]) => `<rect x="420" y="${y}" width="360" height="18" rx="9" fill="#dde3f6"/><rect x="420" y="${y}" width="${w}" height="18" rx="9" fill="${c}"/>`)
      .join("\n    ")}
  </g>`,

  // Duas unidades de armazenamento ligadas por setas de cópia (3ª leva, manutenção e backup).
  backup: () => `<g stroke-linecap="round" stroke-linejoin="round">
    <rect x="430" y="270" width="130" height="150" rx="16" fill="${N}"/>
    <rect x="450" y="296" width="90" height="10" rx="5" fill="#2a3c80"/>
    <rect x="450" y="316" width="90" height="10" rx="5" fill="#2a3c80"/>
    <circle cx="530" cy="394" r="8" fill="#3ee0b0"/>
    <rect x="640" y="270" width="130" height="150" rx="16" fill="#eef1fb" stroke="${N}" stroke-width="4"/>
    <rect x="660" y="296" width="90" height="10" rx="5" fill="#cdd5ef"/>
    <rect x="660" y="316" width="90" height="10" rx="5" fill="#cdd5ef"/>
    <circle cx="740" cy="394" r="8" fill="${L}"/>
    <path d="M572 320 H626 M614 308 l12 12 l-12 12" stroke="${L}" stroke-width="6" fill="none"/>
    <path d="M628 370 H574 M586 358 l-12 12 l12 12" stroke="${LC}" stroke-width="6" fill="none"/>
  </g>`,

  // Alerta laranja sobre um plugue desconectado da tomada (3ª leva, site fora do ar).
  foradoar: () => `<g stroke-linecap="round" stroke-linejoin="round">
    <path d="M600 238 L666 350 H534 Z" fill="${L}" stroke="${L}" stroke-width="10"/>
    <rect x="594" y="272" width="12" height="44" rx="6" fill="#fff"/>
    <circle cx="600" cy="332" r="7" fill="#fff"/>
    <path d="M420 404 H470" stroke="${N}" stroke-width="8" fill="none"/>
    <rect x="470" y="384" width="60" height="40" rx="10" fill="${N}"/>
    <rect x="530" y="392" width="22" height="7" rx="3" fill="${N}"/>
    <rect x="530" y="409" width="22" height="7" rx="3" fill="${N}"/>
    <rect x="650" y="380" width="70" height="48" rx="12" fill="#eef1fb" stroke="${N}" stroke-width="4"/>
    <rect x="662" y="392" width="10" height="7" rx="3" fill="${N}"/>
    <rect x="662" y="409" width="10" height="7" rx="3" fill="${N}"/>
    <path d="M720 404 H780" stroke="${N}" stroke-width="8" fill="none"/>
    <path d="M584 404 l10 -10 l10 20 l10 -10 l10 10" stroke="${LC}" stroke-width="5" fill="none"/>
  </g>`,
};

/** Moldura comum a todas as capas (janela de navegador com sombra laranja + régua da trilha). */
function moldura(arte, etapa, trilha = "site") {
  const ia = trilha === "ia";
  const n = (ia ? ETAPAS_IA : ETAPAS)[etapa];
  const pontosSite = [1, 2, 3, 4, 5, 6, 7]
    .map((i) => {
      const x = 510 + (i - 1) * 30;
      if (i < n) return `<circle cx="${x}" cy="548" r="6" fill="${LC}"/>`;
      if (i === n) return `<circle cx="${x}" cy="548" r="16" fill="none" stroke="${L}" stroke-width="3" opacity="0.5"/><circle cx="${x}" cy="548" r="10" fill="${L}"/>`;
      return `<circle cx="${x}" cy="548" r="6" fill="#2a3c80"/>`;
    })
    .join("");
  // Régua do roteiro de IA: faísca à esquerda e 6 losangos (um por etapa).
  const losango = (x, fill) => `<rect x="-6" y="-6" width="12" height="12" rx="2" fill="${fill}" transform="translate(${x} 548) rotate(45)"/>`;
  const pontosIa =
    `<path d="${FAISCA}" fill="${LC}" transform="translate(462 536)"/>` +
    [1, 2, 3, 4, 5, 6]
      .map((i) => {
        const x = 510 + (i - 1) * 36;
        if (i < n) return losango(x, LC);
        if (i === n)
          return `<rect x="-15" y="-15" width="30" height="30" rx="6" fill="none" stroke="${L}" stroke-width="3" opacity="0.5" transform="translate(${x} 548) rotate(45)"/><rect x="-9" y="-9" width="18" height="18" rx="3" fill="${L}" transform="translate(${x} 548) rotate(45)"/>`;
        return losango(x, "#2a3c80");
      })
      .join("");
  const pontos = ia ? pontosIa : pontosSite;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <rect width="1200" height="675" fill="${N}"/>
  <pattern id="p" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="16" cy="16" r="2" fill="#1d2c66"/></pattern>
  <rect width="1200" height="675" fill="url(#p)"/>
  <circle cx="905" cy="170" r="58" fill="none" stroke="${LC}" stroke-width="6"/>
  <circle cx="960" cy="118" r="10" fill="${L}"/>
  <rect x="-28" y="-28" width="56" height="56" rx="12" fill="none" stroke="#2a3c80" stroke-width="6" transform="translate(292 452) rotate(14)"/>
  <path d="M250 196v28M236 210h28" stroke="#2a3c80" stroke-width="6" stroke-linecap="round"/>
  <rect x="376" y="166" width="480" height="320" rx="24" fill="${L}"/>
  <rect x="360" y="150" width="480" height="320" rx="24" fill="#ffffff"/>
  <rect x="360" y="150" width="480" height="52" rx="24" fill="#eef1fb"/>
  <rect x="360" y="176" width="480" height="26" fill="#eef1fb"/>
  <path d="M360 202h480" stroke="#dde3f6" stroke-width="2"/>
  <circle cx="392" cy="176" r="7" fill="#cdd5ef"/><circle cx="416" cy="176" r="7" fill="#cdd5ef"/><circle cx="440" cy="176" r="7" fill="#cdd5ef"/>
  <rect x="470" y="164" width="340" height="24" rx="12" fill="#ffffff" stroke="#dde3f6" stroke-width="2"/>
  ${arte}
  <path d="M510 548H690" stroke="#1d2c66" stroke-width="4" stroke-linecap="round"/>
  ${pontos}
</svg>`;
}

export const CAPAS = [
  {
    slug: "como-escolher-o-dominio-do-site",
    etapa: "dominio",
    arte: "dominio",
    alt: "Ilustração de uma janela de navegador com uma barra de endereço grande: o nome do site em azul-marinho e a extensão em laranja, com o cursor por cima.",
  },
  {
    slug: "como-escolher-a-hospedagem-do-site",
    etapa: "hospedagem",
    arte: "servidor",
    alt: "Ilustração de um servidor com três gavetas e luzes acesas dentro de uma janela de navegador, representando a hospedagem do site.",
  },
  {
    slug: "cores-fonte-e-favicon-do-site",
    etapa: "visual",
    arte: "paleta",
    alt: "Ilustração com três amostras de cor, linhas de texto em tamanhos diferentes, um favicon laranja e um selo de contraste aprovado.",
  },
  {
    slug: "seo-basico-para-aparecer-no-google",
    etapa: "google",
    arte: "lupa",
    alt: "Ilustração de uma lista de resultados de busca com o primeiro resultado em laranja e uma lupa grande por cima.",
  },
  {
    slug: "site-lento-causas-e-como-otimizar-imagens",
    etapa: "velocidade",
    arte: "velocimetro",
    alt: "Ilustração de um velocímetro com o ponteiro perto do máximo e uma imagem grande que vira um arquivo menor, ao lado.",
  },
  {
    slug: "checklist-de-lancamento-do-site",
    etapa: "lancamento",
    arte: "foguete",
    alt: "Ilustração de uma lista de tarefas com dois itens marcados e um foguete pronto para decolar dentro de uma janela de navegador.",
  },
  // 2ª leva (migration 006)
  {
    slug: "como-escrever-as-paginas-do-site",
    etapa: "paginas",
    arte: "paginas",
    alt: "Ilustração do rascunho de uma página inicial dentro de uma janela de navegador: cabeçalho, título, botão laranja, imagem de destaque e três blocos de serviços.",
  },
  {
    slug: "email-com-dominio-proprio",
    etapa: "hospedagem",
    arte: "email",
    alt: "Ilustração de um envelope dentro de uma janela de navegador, com um selo laranja com o símbolo de arroba no canto.",
  },
  {
    slug: "wordpress-ou-construtor-de-sites",
    etapa: "hospedagem",
    arte: "plataforma",
    alt: "Ilustração de dois painéis lado a lado, um com código em fundo azul-marinho e outro com blocos de arrastar, separados por um selo de comparação.",
  },
  {
    slug: "https-e-certificado-ssl",
    etapa: "lancamento",
    arte: "cadeado",
    alt: "Ilustração de um cadeado laranja fechado dentro de uma janela de navegador, com um selo verde de confirmação ao lado.",
  },
  {
    slug: "google-search-console-passo-a-passo",
    etapa: "google",
    arte: "grafico",
    alt: "Ilustração de um gráfico de barras com uma linha laranja subindo, representando os relatórios de desempenho do site na busca.",
  },
  {
    slug: "perfil-da-empresa-no-google",
    etapa: "lancamento",
    arte: "pino",
    alt: "Ilustração de um mapa simplificado com um pino laranja marcando o local do negócio e uma fileira de estrelas de avaliação.",
  },
  {
    slug: "politica-de-privacidade-para-site-pequeno",
    etapa: "lancamento",
    arte: "privacidade",
    alt: "Ilustração de uma folha de política com linhas de texto e um item marcado em laranja, ao lado de um escudo azul-marinho com um cadeado laranja.",
  },
  {
    slug: "aviso-de-cookies-no-site",
    etapa: "lancamento",
    arte: "cookie",
    alt: "Ilustração de um biscoito mordido, dois interruptores de preferência e um aviso de cookies com dois botões do mesmo tamanho, dentro de uma janela de navegador.",
  },
  {
    slug: "como-medir-as-visitas-do-site",
    etapa: "google",
    arte: "visitas",
    alt: "Ilustração de um painel de estatísticas com três cartões de números e barras horizontais das páginas mais vistas, a primeira em laranja.",
  },
  {
    slug: "manutencao-do-site-backup-e-atualizacoes",
    etapa: "lancamento",
    arte: "backup",
    alt: "Ilustração de duas unidades de armazenamento lado a lado, uma azul-marinho e outra clara, ligadas por setas laranja de cópia nos dois sentidos.",
  },
  {
    slug: "site-fora-do-ar-o-que-fazer",
    etapa: "lancamento",
    arte: "foradoar",
    alt: "Ilustração de um triângulo de alerta laranja sobre um plugue azul-marinho desconectado da tomada, com uma faísca no espaço entre os dois.",
  },
  // Roteiro "Criar site com IA" (migration dos guias de IA; régua própria com losangos)
  {
    slug: "criar-site-com-ia-do-jeito-certo",
    trilha: "ia",
    etapa: "planejar",
    arte: "fluxo",
    alt: "Ilustração de um ciclo de cinco caixas ligadas por setas dentro de uma janela de navegador: plano, pedido à IA, partes pequenas, revisão aprovada e versão salva.",
  },
  {
    slug: "prompt-para-criar-site-com-ia",
    trilha: "ia",
    etapa: "pedir",
    arte: "prompt",
    alt: "Ilustração de uma conversa com um assistente de IA: um balão com o pedido dividido em partes marcadas em laranja e a caixa de envio logo abaixo.",
  },
  {
    slug: "arquivo-de-instrucoes-para-assistente-de-codigo",
    trilha: "ia",
    etapa: "contexto",
    arte: "instrucoes",
    alt: "Ilustração de um arquivo de texto com títulos e listas sendo lido por um assistente de IA, representado por um círculo azul-marinho com uma faísca branca.",
  },
  {
    slug: "skills-para-assistentes-de-ia",
    trilha: "ia",
    etapa: "alem",
    arte: "skills",
    alt: "Ilustração de três cartões de receita lado a lado, com o do meio em laranja e levantado, representando a skill escolhida pelo assistente para a tarefa.",
  },
  {
    slug: "o-que-e-mcp-servidores-mcp",
    trilha: "ia",
    etapa: "alem",
    arte: "mcp",
    alt: "Ilustração de um assistente de IA no centro ligado por linhas a um banco de dados, uma pasta e uma janela de ferramenta, como num padrão de conexão.",
  },
  {
    slug: "seguranca-ao-criar-site-com-ia",
    trilha: "ia",
    etapa: "publicar",
    arte: "escudo",
    alt: "Ilustração de um escudo azul-marinho com fechadura laranja, uma chave riscada dentro de um balão de conversa e um selo verde de confirmação.",
  },
  {
    slug: "como-revisar-codigo-gerado-por-ia",
    trilha: "ia",
    etapa: "revisar",
    arte: "revisao",
    alt: "Ilustração de um painel de código com linhas marcadas em verde e uma em laranja, ao lado de uma lista de revisão com dois itens concluídos.",
  },
  {
    slug: "site-feito-com-ia-seo-acessibilidade-e-velocidade",
    trilha: "ia",
    etapa: "revisar",
    arte: "qualidade",
    alt: "Ilustração do rascunho de uma página ao lado de três selos aprovados: uma lupa de busca, um círculo de contraste e um raio de velocidade.",
  },
];

function validar(capas) {
  const erros = [];
  for (const c of capas) {
    if (!/^[a-z0-9-]+$/.test(c.slug)) erros.push(`${c.slug}: slug inválido`);
    if (!(c.etapa in (c.trilha === "ia" ? ETAPAS_IA : ETAPAS))) erros.push(`${c.slug}: etapa desconhecida (${c.etapa})`);
    if (!(c.arte in ARTES)) erros.push(`${c.slug}: arte desconhecida (${c.arte})`);
    if (c.alt.length < 60 || c.alt.length > 220) erros.push(`${c.slug}: alt com ${c.alt.length} caracteres (60 a 220)`);
    if (c.alt.includes('"') || c.alt.includes("\\")) erros.push(`${c.slug}: alt com aspas duplas ou barra invertida`);
  }
  if (erros.length) {
    console.error(erros.join("\n"));
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const sql = args.includes("--sql");
  const folha = args.includes("--folha");
  const slugs = args.filter((a) => !a.startsWith("--"));
  validar(CAPAS);
  const alvo = slugs.length ? CAPAS.filter((c) => slugs.includes(c.slug)) : CAPAS;
  if (slugs.length && alvo.length !== slugs.length) {
    console.error("Slug fora da lista CAPAS: " + slugs.filter((s) => !CAPAS.some((c) => c.slug === s)).join(", "));
    process.exit(1);
  }

  if (sql) {
    for (const c of alvo) {
      const alt = c.alt.replace(/'/g, "''");
      console.log(`UPDATE posts SET image_url = '/capas/${c.slug}.webp', image_alt = '${alt}' WHERE section = 'guias' AND slug = '${c.slug}' AND (image_url IS NULL OR image_url = '');`);
    }
    return;
  }

  await mkdir(OUT, { recursive: true });
  const tabela = [];
  const feitos = [];
  for (const c of alvo) {
    const svg = Buffer.from(moldura(ARTES[c.arte](), c.etapa, c.trilha));
    const semPerda = await sharp(svg).webp({ lossless: true, effort: 6 }).toBuffer();
    const comPerda = await sharp(svg).webp({ quality: 90, effort: 6, smartSubsample: true }).toBuffer();
    const melhor = semPerda.length <= comPerda.length ? semPerda : comPerda;
    const meta = await sharp(melhor).metadata();
    if (meta.width !== 1200 || meta.height !== 675) throw new Error(`capa ${c.slug} saiu ${meta.width}×${meta.height}`);
    if (melhor.length > MAX_BYTES) throw new Error(`capa ${c.slug} com ${Math.round(melhor.length / 1024)} KB: simplifique`);
    const arquivo = join(OUT, `${c.slug}.webp`);
    await writeFile(arquivo, melhor);
    feitos.push({ slug: c.slug, arquivo, buf: melhor });
    tabela.push({ slug: c.slug, arte: c.arte, etapa: c.etapa, KB: Math.round((melhor.length / 1024) * 10) / 10, modo: melhor === semPerda ? "sem perda" : "com perda" });
  }
  console.table(tabela);

  if (folha) {
    const larg = 400;
    const alt = 225;
    const gap = 16;
    const cols = 3;
    const linhas = Math.ceil(feitos.length / cols);
    const itens = await Promise.all(
      feitos.map(async (f, i) => ({
        input: await sharp(f.buf).resize(larg, alt).png().toBuffer(),
        left: gap + (i % cols) * (larg + gap),
        top: gap + Math.floor(i / cols) * (alt + gap),
      })),
    );
    const destino = join(tmpdir(), "criasite-capas-folha.png");
    await sharp({ create: { width: gap + cols * (larg + gap), height: gap + linhas * (alt + gap), channels: 3, background: "#eef1fb" } })
      .composite(itens)
      .png()
      .toFile(destino);
    console.log("Folha de contato:", destino);
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) await main();
