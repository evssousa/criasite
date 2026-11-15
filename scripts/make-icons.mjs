// Gera favicon, ícones e a imagem padrão de compartilhamento (public/) a partir do desenho da marca.
// Uso: node scripts/make-icons.mjs  (rode de novo se mudar o logo; depois troque o "?v=" em app/root.tsx)
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const PUBLIC = join(import.meta.dirname, "..", "public");

// Mesmo desenho do componente LogoMark (app/components/ui.tsx).
const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="16" fill="#ff7a1a"/>
  <rect x="12" y="16" width="40" height="32" rx="6" fill="none" stroke="#fff" stroke-width="5"/>
  <path d="M12 26h40" stroke="#fff" stroke-width="5"/>
  <path d="M26 33l-5 5 5 5M38 33l5 5-5 5" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const OG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0c1a4b"/>
  <g transform="translate(96 150) scale(2.4)">${MARK.replace(/<\/?svg[^>]*>/g, "")}</g>
  <text x="280" y="232" font-family="Arial, Helvetica, sans-serif" font-size="92" font-weight="800" fill="#ffffff" letter-spacing="-3">cria<tspan fill="#ff7a1a">site</tspan></text>
  <text x="96" y="390" font-family="Arial, Helvetica, sans-serif" font-size="50" font-weight="700" fill="#ffffff">Ferramentas, notícias e guias</text>
  <text x="96" y="452" font-family="Arial, Helvetica, sans-serif" font-size="50" font-weight="700" fill="#ffffff">para criar e cuidar do seu site</text>
  <rect x="96" y="512" width="1008" height="6" rx="3" fill="#1d2c66"/>
  <rect x="96" y="512" width="430" height="6" rx="3" fill="#ff7a1a"/>
  <text x="96" y="570" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#b9c3ea">criasite.com.br · grátis e sem cadastro</text>
</svg>`;

/** ICO com uma imagem PNG dentro (formato aceito por todos os navegadores atuais). */
function icoFromPng(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0);
  entry.writeUInt8(size >= 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, png]);
}

const svg = Buffer.from(MARK);
await writeFile(join(PUBLIC, "favicon.svg"), MARK);
await writeFile(join(PUBLIC, "favicon.ico"), icoFromPng(await sharp(svg, { density: 300 }).resize(48, 48).png().toBuffer(), 48));
await sharp(svg, { density: 600 }).resize(180, 180).png().toFile(join(PUBLIC, "apple-touch-icon.png"));
await sharp(svg, { density: 1200 }).resize(512, 512).png().toFile(join(PUBLIC, "logo-512.png"));
await sharp(Buffer.from(OG)).png().toFile(join(PUBLIC, "og-default.png"));
console.log("Ícones gerados em public/.");
