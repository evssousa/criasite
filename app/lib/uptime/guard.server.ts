// Guarda da ferramenta "Está fora do ar?" (docs/ferramenta-fora-do-ar.md, parte A): valida o que a pessoa digitou e
// bloqueia endereços de rede interna (SSRF). Funções puras, sem rede. Só importa node:net e node:url, e os imports
// da pasta são relativos com extensão .ts para o script de teste rodar direto no Node.
import { BlockList, isIP } from "node:net";
import { domainToUnicode } from "node:url";

export type Normalized =
  | { ok: true; url: URL; display: string; typedScheme: boolean }
  | { ok: false; code: "invalido" | "bloqueado"; message: string };

/** Sufixos de rede interna: o domínio inteiro ou qualquer subdomínio deles é bloqueado. */
export const BLOCKED_SUFFIXES = ["localhost", "local", "localdomain", "internal", "intranet", "lan", "home", "corp", "home.arpa", "arpa", "test", "invalid", "example", "onion"];

const SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;
const DANGEROUS_SCHEME = /^(javascript|data|file|ftp|gopher|mailto|about|blob|ws|wss|tel|sms):/i;
const TLD = /^([a-z]{2,63}|xn--[a-z0-9-]{1,59})$/;
const LABEL = /^[a-z0-9-]+$/;

const invalid = (message: string): Normalized => ({ ok: false, code: "invalido", message });
const blocked = (message: string): Normalized => ({ ok: false, code: "bloqueado", message });

const ONLY_HTTP = "Só dá para checar endereços http:// ou https://.";

/** Transforma o texto digitado em uma URL segura para checar, ou explica por que não dá. */
export function normalizeTarget(raw: string): Normalized {
  const text = String(raw ?? "").trim();
  if (!text) return invalid("Digite o endereço do site.");
  if (text.length > 2048) return invalid("Endereço longo demais.");
  if (/\s/.test(text)) return invalid("O endereço não pode ter espaços.");

  let typedScheme = false;
  let withScheme = text;
  if (SCHEME.test(text)) {
    if (!/^https?:\/\//i.test(text)) return blocked(ONLY_HTTP);
    typedScheme = true;
  } else if (DANGEROUS_SCHEME.test(text)) {
    return blocked(ONLY_HTTP);
  } else {
    withScheme = `https://${text}`;
  }

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return invalid("Esse endereço não parece válido. Exemplo: meusite.com.br");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return blocked(ONLY_HTTP);
  if (url.username || url.password) return blocked("Endereço com usuário e senha não é aceito.");
  if (url.port !== "") return blocked("Só checamos as portas padrão (80 e 443).");

  const host = url.hostname.replace(/\.$/, "");
  if (host.startsWith("[") || isIP(host) !== 0) return blocked("Digite o domínio do site (ex.: meusite.com.br), não um número de IP.");
  if (!host.includes(".")) return blocked("Digite um domínio completo, como meusite.com.br.");
  if (BLOCKED_SUFFIXES.some((s) => host === s || host.endsWith(`.${s}`))) return blocked("Esse endereço é de rede interna e não pode ser checado.");

  const labels = host.split(".");
  if (host.length > 253 || labels.some((l) => l.length === 0 || l.length > 63 || !LABEL.test(l) || l.startsWith("-") || l.endsWith("-")) || !TLD.test(labels[labels.length - 1])) {
    return invalid("Esse endereço não parece válido. Exemplo: meusite.com.br");
  }

  url.hostname = host;
  url.hash = "";
  const path = url.pathname === "/" ? "" : url.pathname;
  return { ok: true, url, display: `${domainToUnicode(host)}${path}${url.search}`, typedScheme };
}

// ───────────── Bloqueio de IP ─────────────

const v4Blocked = new BlockList();
for (const [net, bits] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16], // inclui 169.254.169.254 (metadados de nuvem)
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4], // inclui 255.255.255.255
] as const) {
  v4Blocked.addSubnet(net, bits, "ipv4");
}

/** Lê um IPv6 como 8 grupos de 16 bits (aceita "::" e IPv4 no final). Null se não der para interpretar. */
function parseV6(ip: string): number[] | null {
  let text = ip;
  const dotted = text.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (dotted) {
    if (isIP(dotted[1]) !== 4) return null;
    const [a, b, c, d] = dotted[1].split(".").map(Number);
    text = `${text.slice(0, -dotted[1].length)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const halves = text.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  if (halves.length === 1 && head.length !== 8) return null;
  const missing = 8 - head.length - tail.length;
  if (halves.length === 2 && missing < 1) return null;
  const parts = [...head, ...Array(halves.length === 2 ? missing : 0).fill("0"), ...tail];
  if (parts.length !== 8) return null;
  const groups = parts.map((p) => (/^[0-9a-f]{1,4}$/i.test(p) ? parseInt(p, 16) : NaN));
  return groups.some(Number.isNaN) ? null : groups;
}

const v4FromGroups = (hi: number, lo: number) => `${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`;

/**
 * True se o IP não pode ser alvo da checagem. IPv4: lista de faixas bloqueadas. IPv6: lista de permissão (só 2000::/3,
 * menos Teredo, documentação, ORCHID e 6to4). IPv4 embutido em IPv6 (mapeado, NAT64, 6to4) é checado como IPv4.
 * Qualquer coisa que não dê para interpretar é bloqueada.
 */
export function isBlockedIp(ip: string): boolean {
  const kind = isIP(ip);
  if (kind === 4) return v4Blocked.check(ip, "ipv4");
  if (kind !== 6 || ip.includes("%")) return true;

  const g = parseV6(ip);
  if (!g) return true;

  // IPv4 dentro de IPv6: mapeado (::ffff:a.b.c.d), NAT64 (64:ff9b::/96) e 6to4 (2002::/16).
  const zeros = (from: number, to: number) => g.slice(from, to).every((x) => x === 0);
  if (zeros(0, 5) && g[5] === 0xffff && v4Blocked.check(v4FromGroups(g[6], g[7]), "ipv4")) return true;
  if (g[0] === 0x64 && g[1] === 0xff9b && zeros(2, 6) && v4Blocked.check(v4FromGroups(g[6], g[7]), "ipv4")) return true;
  if (g[0] === 0x2002 && v4Blocked.check(v4FromGroups(g[1], g[2]), "ipv4")) return true;

  if ((g[0] & 0xe000) !== 0x2000) return true; // fora de 2000::/3
  if (g[0] === 0x2001) {
    if (g[1] === 0) return true; // 2001::/32 Teredo
    if (g[1] === 0x0db8) return true; // 2001:db8::/32 documentação
    if ((g[1] & 0xfff0) === 0x0010 || (g[1] & 0xfff0) === 0x0020) return true; // 2001:10::/28 e 2001:20::/28
  }
  if (g[0] === 0x2002) return true; // 6to4, sempre
  return false;
}
