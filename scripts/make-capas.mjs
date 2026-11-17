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
  // Roteiro "Criar site com IA" (migration dos guias de IA; régua própria com losangos)
  {
    slug: "criar-site-com-ia-do-jeito-certo",
    trilha: "ia",
    etapa: "planejar",
    arte: "fluxo",
    alt: "Ilustração de um ciclo de cinco caixas ligadas por setas dentro de uma janela de navegador: plano, pedido à IA, partes pequenas, revisão aprovada e versão salva.",
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
