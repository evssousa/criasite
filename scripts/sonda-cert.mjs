// Ferramenta de manutenção da VPS (lição 14 de docs/migracao-vps.md): roda no PC, não faz parte do site.
// Consulta o certificado e o status HTTP de um domínio a cada 2 s e imprime só as mudanças (com hora UTC).
// Uso: node sonda-cert.mjs <dominio> <segundos>
import tls from "node:tls";
import https from "node:https";
const [dominio, seg = "360"] = process.argv.slice(2);
const fim = Date.now() + Number(seg) * 1000;
let anterior = "";
const cert = () =>
  new Promise((ok) => {
    const s = tls.connect({ host: dominio, port: 443, servername: dominio, rejectUnauthorized: false, timeout: 5000 }, () => {
      const c = s.getPeerCertificate();
      ok(`${c?.issuer?.O ?? c?.issuer?.CN ?? "?"} / ${c?.subject?.CN ?? "?"}`);
      s.end();
    });
    s.on("error", (e) => ok(`erro tls: ${e.code}`));
    s.on("timeout", () => (s.destroy(), ok("tempo esgotado")));
  });
const status = () =>
  new Promise((ok) => {
    const r = https.get({ host: dominio, path: "/robots.txt", rejectUnauthorized: false, timeout: 5000 }, (res) => (res.resume(), ok(String(res.statusCode))));
    r.on("error", (e) => ok(`erro: ${e.code}`));
    r.on("timeout", () => (r.destroy(), ok("tempo esgotado")));
  });
while (Date.now() < fim) {
  const linha = `${await cert()} | HTTP ${await status()}`;
  if (linha !== anterior) console.log(new Date().toISOString().slice(11, 19), linha);
  anterior = linha;
  await new Promise((r) => setTimeout(r, 2000));
}
console.log(new Date().toISOString().slice(11, 19), "fim");
