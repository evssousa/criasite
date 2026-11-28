// Teste puro do módulo de Google Analytics + consentimento: npx tsx --tsconfig tsconfig.json app/analytics/analytics.teste.tsx
// (termina com "ok"). Sem navegador: o script do <head> roda com um localStorage falso.
import assert from "node:assert";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { CookieConsent } from "../components/CookieConsent";
import { CONSENT_KEY, gaIdValido } from "./config";
import { consentBootstrap, interpretar } from "./consent";
import { GoogleAnalytics } from "./GoogleAnalytics";
import { medir } from "./gtag";

// interpretar: v2 válido; v1 "essential" → tudo negado e regravar; v1 "all" → banner de novo com só anúncios marcado; lixo → nada
assert.deepEqual(interpretar(JSON.stringify({ v: 2, analytics: true, ads: false })), { escolha: { analytics: true, ads: false } });
assert.deepEqual(interpretar(JSON.stringify({ v: 1, choice: "essential" })), { escolha: { analytics: false, ads: false }, migrar: { analytics: false, ads: false } });
assert.deepEqual(interpretar(JSON.stringify({ v: 1, choice: "all" })), { escolha: null, parcial: { analytics: false, ads: true } });
assert.deepEqual(interpretar("{lixo"), { escolha: null });
assert.deepEqual(interpretar(null), { escolha: null });

// script do <head>: roda de verdade com um localStorage falso e confere o dataLayer
function rodar(guardado: unknown) {
  const w: { dataLayer?: IArguments[] } = {};
  const ls = { getItem: (k: string) => (k === CONSENT_KEY && guardado ? JSON.stringify(guardado) : null) };
  new Function("window", "localStorage", `var dataLayer;${consentBootstrap().replace("window.dataLayer=window.dataLayer||[];", "window.dataLayer=window.dataLayer||[];dataLayer=window.dataLayer;")}`)(w, ls);
  return (w.dataLayer ?? []).map((a) => Array.from(a));
}
const semEscolha = rodar(null);
assert.equal(semEscolha.length, 1, "sem escolha: só o default");
assert.equal((semEscolha[0][2] as Record<string, string>).analytics_storage, "denied");
const soGa = rodar({ v: 2, analytics: true, ads: false });
assert.equal((soGa[1][2] as Record<string, string>).analytics_storage, "granted");
assert.equal((soGa[1][2] as Record<string, string>).ad_storage, "denied");
const antigoTudo = rodar({ v: 1, choice: "all" });
assert.equal((antigoTudo[1][2] as Record<string, string>).ad_storage, "granted", "v1 'aceitar todos' libera só anúncios");
assert.equal((antigoTudo[1][2] as Record<string, string>).analytics_storage, "denied");

// ID do GA
assert.equal(gaIdValido("G-MZJX2TZ404"), "G-MZJX2TZ404");
for (const ruim of ["", "UA-1234", "G-<script>", null, undefined]) assert.equal(gaIdValido(ruim), null);

// HTML do servidor: nem o gtag.js nem o banner (tudo só no navegador, depois da escolha)
const html = renderToString(
  <MemoryRouter initialEntries={["/noticias/x"]}>
    <GoogleAnalytics id="G-MZJX2TZ404" />
    <CookieConsent ads analytics />
  </MemoryRouter>,
);
assert.ok(!html.includes("googletagmanager"), "sem gtag.js no HTML do servidor");
assert.ok(!html.includes("COOKIES"), "sem banner no HTML do servidor");

// medir antes de carregar o GA não faz nada
medir("teste");
console.log("ok");
