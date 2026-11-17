// Conta de contraste de cores (WCAG 2.x), pura. Usada pelo verificador de contraste e pelo gerador de prompt para site.
// Sem React e sem `~/`: o script de teste roda direto no Node.

/** "#abc", "abc", "#aabbcc" → "#aabbcc" (minúsculas); inválido → null. */
export function normalizeHex(v: string): string | null {
  const m = v.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{3}$/.test(m)) return `#${m[0]}${m[0]}${m[1]}${m[1]}${m[2]}${m[2]}`;
  if (/^[0-9a-f]{6}$/.test(m)) return `#${m}`;
  return null;
}

/** Luminância relativa (limiar 0,03928, como no verificador). */
export function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste entre duas cores (1 a 21). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
