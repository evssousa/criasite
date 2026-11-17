# Ferramenta "Está fora do ar?" (`/ferramentas/esta-fora-do-ar`)

Plano escrito pelo planejador em 2026-11-17. Executor: siga os passos na ordem; cada um diz como conferir.
Decisões de design e de segurança já estão tomadas aqui. Onde houver dúvida do dono, está em "Perguntas em aberto",
com a recomendação que vale até ele responder.

## Objetivo

O visitante digita o endereço de um site e descobre se ele está no ar para todo mundo ou se o problema é só do lado
dele: DNS, código HTTP, tempo de resposta, redirecionamentos, certificado HTTPS (com validade) e o que fazer em cada caso.
É a 1ª ferramenta do CriaSite que precisa de servidor, então a segurança contra abuso (SSRF, proxy, DDoS) vem antes de tudo.

## Contexto

- As 11 ferramentas de hoje rodam no navegador. Esta não pode: o navegador não lê a resposta de outro site (CORS) e não
  mostra código HTTP, certificado nem DNS. A checagem tem que sair do servidor Node do CriaSite (Hostinger, Express 5 +
  React Router 8, `server.js` → `server-app.js`).
- Padrão do projeto para API: **resource route do React Router** em `app/routes/` registrada em `app/routes.ts` sob `/api/`
  (`api/view` → `routes/view.ts`, POST via `action`; `api/cron/:job` → `routes/cron.ts`). O `server-app.js` já põe
  `X-Robots-Tag: noindex, nofollow` e `Cache-Control: no-store` em tudo que começa com `/api`, e o `robots.txt` já tem
  `Disallow: /api/`. Não mexer no Express.
- Limite em memória sem banco já existe como precedente em `routes/view.ts` (`Map` com janela de tempo e limpeza).
- User-Agent do robô: `app/lib/robot/rss.server.ts` (`CriaSiteBot/1.0`). Esta ferramenta usa um UA próprio no mesmo formato.
- Textos legais hoje dizem que **nada** sai do navegador (`privacy.tsx`, `terms.tsx`, `about.tsx`, `faq.tsx`, `tools.tsx`,
  `docs/ferramentas.md`, `README.md` de portfólio). Todos precisam ganhar a exceção (texto exato no passo 12).
- Sem MySQL novo, sem serviço pago, sem segredo novo.

## Arquivos afetados

Novos:
- `app/lib/uptime/types.ts` — tipos compartilhados (página e servidor). Sem imports de `node:*`.
- `app/lib/uptime/guard.server.ts` — validação da entrada e bloqueio de IPs (funções puras; só importa `node:net`).
- `app/lib/uptime/check.server.ts` — DNS, conexão no IP validado, redirecionamentos, TLS, veredito.
- `app/lib/uptime/limits.server.ts` — limites por IP, por alvo e global; cache de 30 s; IP do visitante.
- `app/lib/uptime/advice.ts` — textos de "O que fazer agora" por caso e perspectiva (usado só pela página).
- `app/routes/api-fora-do-ar.ts` — `action` POST (e `loader` que devolve 405).
- `app/routes/tool-uptime.tsx` — a página da ferramenta.
- `scripts/test-fora-do-ar.ts` — testes (puros e, com `--rede`, ao vivo).

Alterados:
- `app/lib/site.ts` (ToolSlug, TOOLS, TRAIL "lancamento", data da privacidade em DOC_PAGES)
- `app/routes.ts` (2 rotas)
- `app/lib/prefs.ts` (histórico `criasite_checagens`)
- `app/lib/robot/assemble.ts` (TOOL_TERMS)
- `app/routes/cron.ts` (job de diagnóstico `cabecalhos`)
- `app/routes/privacy.tsx`, `app/routes/terms.tsx`, `app/routes/about.tsx`, `app/routes/faq.tsx`, `app/routes/tools.tsx`
- `README.md` (portfólio), `docs/ferramentas.md`, `docs/arquitetura.md`, `docs/README.md`, `docs/decisoes.md`

Regra para a pasta `app/lib/uptime/`: **nenhum import com `~/`** e imports relativos com extensão `.ts`
(ex.: `import type { CheckResult } from "./types.ts"`), como `scripts/admin-hash.ts` já faz. Assim o script de teste roda
com `node scripts/test-fora-do-ar.ts` sem bundler. Só tipos e funções (nada de `enum`, que o Node não remove).

---

## Parte A: segurança (prioridade máxima)

Princípio: **valida a entrada → resolve o DNS uma vez → valida todos os IPs → conecta no IP validado** (com o nome no
`Host` e no SNI) → **lê só os cabeçalhos e fecha**. Cada redirecionamento repete o ciclo inteiro.

### A1. Normalização da entrada (`guard.server.ts`, `normalizeTarget(raw: string)`)

Retorna `{ ok: true, url: URL, display: string, typedScheme: boolean }` ou `{ ok: false, code: "invalido" | "bloqueado", message: string }`.

1. `trim()`. Vazio → `invalido` "Digite o endereço do site.". Mais de 2.048 caracteres → `invalido` "Endereço longo demais.".
   Espaço, tab ou quebra de linha no meio → `invalido` "O endereço não pode ter espaços.".
2. Esquema:
   - Se casa `/^[a-z][a-z0-9+.-]*:\/\//i`: tem esquema. Se não for `http://` ou `https://` → `bloqueado` "Só dá para checar endereços http:// ou https://.". `typedScheme = true`.
   - Senão, se casa `/^(javascript|data|file|ftp|gopher|mailto|about|blob|ws|wss|tel|sms):/i` → `bloqueado` (mesma mensagem).
   - Senão, prefixa `https://` (`typedScheme = false`). Atenção: `exemplo.com:8080` não tem `//`, então cai aqui e vira
     `https://exemplo.com:8080` (bloqueado no passo 5).
3. `new URL(...)` dentro de try. Erro → `invalido` "Esse endereço não parece válido. Exemplo: meusite.com.br". O `URL` do
   WHATWG já converte IDN para punycode (`pão.com.br` → `xn--po-...`), deixa o host em minúsculas, transforma
   `2130706433`, `0x7f.1` e `017700000001` em `127.0.0.1` e tira a porta padrão (`:443` em https vira `""`).
4. `url.username` ou `url.password` não vazios → `bloqueado` "Endereço com usuário e senha não é aceito.".
5. `url.port !== ""` → `bloqueado` "Só checamos as portas padrão (80 e 443).". (Porta padrão explícita já virou `""`.)
6. Host:
   - Tirar ponto final (`exemplo.com.br.` → `exemplo.com.br`).
   - IP literal (`net.isIP(host sem colchetes) !== 0`, ou host começando com `[`) → `bloqueado` "Digite o domínio do site (ex.: meusite.com.br), não um número de IP.".
   - Sem ponto (`intranet`, `localhost`) → `bloqueado` "Digite um domínio completo, como meusite.com.br.".
   - Termina em (ou é) `localhost`, `.local`, `.localdomain`, `.internal`, `.intranet`, `.lan`, `.home`, `.corp`,
     `.home.arpa`, `.arpa`, `.test`, `.invalid`, `.example`, `.onion` → `bloqueado` "Esse endereço é de rede interna e não pode ser checado.".
   - Total > 253 caracteres, rótulo > 63, rótulo vazio, rótulo fora de `[a-z0-9-]` (depois do punycode) ou começando/terminando
     com hífen → `invalido`.
   - Último rótulo (TLD) tem que casar `/^([a-z]{2,63}|xn--[a-z0-9-]{1,59})$/` → senão `invalido`.
7. `url.hash = ""`. Caminho e query ficam (a pessoa pode querer checar `/contato`).
8. `display` = `domainToUnicode(host)` (de `node:url`) + `pathname` (sem a `/` final quando for só `/`) + `search`.
   Ex.: `https://xn--po-jja.com.br/` → `pão.com.br`.

### A2. Bloqueio de IP (`guard.server.ts`, `isBlockedIp(ip: string): boolean`)

Usar `net.BlockList` (do `node:net`), montado uma vez no módulo. Antes de checar, **desembrulhar IPv4 dentro de IPv6**:
`::ffff:a.b.c.d` e `::ffff:7f00:1` (IPv4 mapeado), `64:ff9b::/96` (NAT64, IPv4 nos últimos 32 bits) e `2002::/16`
(6to4, IPv4 nos bits 16 a 48): extrair o IPv4 e checar também como IPv4. Se não der para interpretar o IP → bloqueado.

Faixas IPv4 bloqueadas (`addSubnet(..., "ipv4")`):
`0.0.0.0/8`, `10.0.0.0/8`, `100.64.0.0/10`, `127.0.0.0/8`, `169.254.0.0/16` (inclui `169.254.169.254`, metadados de
nuvem), `172.16.0.0/12`, `192.0.0.0/24`, `192.0.2.0/24`, `192.88.99.0/24`, `192.168.0.0/16`, `198.18.0.0/15`,
`198.51.100.0/24`, `203.0.113.0/24`, `224.0.0.0/4`, `240.0.0.0/4` (inclui `255.255.255.255`).

IPv6: **lista de permissão** — só `2000::/3` (unicast global) é aceito. Dentro dele, bloquear ainda:
`2001::/32` (Teredo), `2001:db8::/32` (documentação), `2001:10::/28`, `2001:20::/28`, `2002::/16` (depois de checar o
IPv4 embutido, bloquear de qualquer jeito). Fora de `2000::/3` fica tudo bloqueado automaticamente: `::`, `::1`,
`::ffff:0:0/96`, `64:ff9b::/96`, `100::/64`, `fc00::/7` (inclui `fd00:ec2::254`, metadados da AWS), `fe80::/10`,
`fec0::/10`, `ff00::/8`.

### A3. DNS uma vez, com validação (`check.server.ts`)

1. `const resolver = new dns.promises.Resolver({ timeout: 2500, tries: 2 })` (criado uma vez no módulo).
2. `Promise.allSettled([resolver.resolve4(host), resolver.resolve6(host)])` (o `resolve4` segue CNAME sozinho).
   Medir o tempo (`dnsMs`).
3. Classificar:
   - Os dois com `ENOTFOUND` → `reason: "dns-nao-encontrado"` (domínio não existe ou venceu).
   - Nenhum endereço e algum `ENODATA` (domínio existe, mas sem A/AAAA) → `reason: "dns-sem-endereco"`.
   - Nenhum endereço e erro `ESERVFAIL`, `ETIMEOUT`, `EREFUSED` → `reason: "dns-falhou"`.
   - Se o resolvedor do servidor estiver inacessível (`ECONNREFUSED` nos dois), fazer **um** plano B com
     `dns.promises.lookup(host, { all: true, verbatim: true })` e seguir com o resultado.
4. **Se QUALQUER endereço (v4 ou v6) for bloqueado por `isBlockedIp`, a checagem inteira para** com erro `bloqueado`
   "Esse endereço aponta para uma rede interna e não pode ser checado." (isso derruba truques como `127.0.0.1.nip.io`
   e domínios que misturam IP público e privado).
5. Escolher o IP de conexão: o 1º IPv4; se não houver IPv4, o 1º IPv6.
6. **Não há segunda consulta de DNS** para essa conexão: o IP validado é o usado (anti-DNS-rebinding).

### A4. Conexão no IP validado, só cabeçalhos

`node:http` / `node:https` → `request()` com:

```
host: <ip validado>, family: 4 | 6, port: 443 | 80,
path: url.pathname + url.search, method: "GET",
servername: url.hostname          // só no https; SNI e verificação do certificado usam o nome, não o IP
headers: {
  Host: url.host,
  "User-Agent": "Mozilla/5.0 (compatible; CriaSiteCheck/1.0; +https://criasite.app/ferramentas/esta-fora-do-ar)",
  Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
  "Accept-Language": "pt-BR,pt;q=0.9",
  "Accept-Encoding": "identity",
  Connection: "close",
},
agent: false,                     // sem reaproveitar conexão
rejectUnauthorized: false,        // para LER o problema do certificado em vez de só falhar (ver A6)
maxHeaderSize: 16384,             // cabeçalho gigante → erro, não estoura memória
signal: <AbortSignal do orçamento total>,
timeout: 8000,                    // socket parado
```

- Nada de cookie, `Authorization`, `Referer` ou corpo.
- Método **GET** (muitos servidores respondem errado a HEAD), mas o corpo **nunca é lido**: no evento `response`, anotar
  status, `location`, `server` (cortado em 40 caracteres), tempo, dados de TLS (A6) e chamar `res.destroy()` na hora.
- Erros do `request` → `reason`:
  `ECONNREFUSED` → `conexao-recusada`; `ECONNRESET`/`EPIPE`/`socket hang up` → `conexao-interrompida`;
  `ETIMEDOUT`/`AbortError`/evento `timeout` → `tempo-esgotado`; `EPROTO` ou código começando com `ERR_SSL_` →
  `tls-falhou`; `EHOSTUNREACH`/`ENETUNREACH` → `erro-rede`; `HPE_HEADER_OVERFLOW` ou outro `HPE_*` → `resposta-invalida`;
  resto → `erro-rede`. **Não** devolver a mensagem bruta do erro ao visitante (só o `reason`).

### A5. Tempo, redirecionamentos e uma requisição por checagem

- Orçamento total: `AbortSignal.timeout(9000)` criado no início e passado a cada salto (DNS + todos os saltos).
- Redirecionamentos: status 301, 302, 303, 307, 308 com `Location`. Máximo **5** saltos (até 6 requisições ao todo).
  `Location` maior que 2.048 caracteres → para com `resposta-invalida`.
  Para cada salto: `new URL(location, urlAtual)` → passar por `normalizeTarget(href)` (mesmas regras de esquema, porta,
  usuário/senha, IP literal e sufixos internos) → DNS → `isBlockedIp` → conexão. Se o destino for bloqueado:
  parar com `reason: "redirecionamento-bloqueado"` (sem seguir). URL repetida (laço) ou 6º redirecionamento → parar
  com `reason: "muitos-redirecionamentos"`.
- `Refresh` e redirecionamento por `<meta>` ou JavaScript **não** são seguidos (o corpo não é lido).
- Plano B http (uma vez só): se o visitante **não** digitou o esquema e a 1ª tentativa em `https://` falhou com
  `conexao-recusada` ou `tls-falhou`, tentar `http://` do mesmo host **reaproveitando o IP já validado** (sem novo DNS).
  Se responder, o resultado leva `alerts: ["sem-https"]`. Máximo absoluto: 7 requisições por checagem.

### A6. Certificado

No `response` de um salto `https`, com `const s = res.socket as TLSSocket`:
- `authorized = s.authorized`, `authorizationError = s.authorizationError` (código, ex.: `CERT_HAS_EXPIRED`,
  `ERR_TLS_CERT_ALTNAME_INVALID`, `DEPTH_ZERO_SELF_SIGNED_CERT`, `SELF_SIGNED_CERT_IN_CHAIN`, `UNABLE_TO_VERIFY_LEAF_SIGNATURE`).
- `const c = s.getPeerCertificate()`: `validTo = new Date(c.valid_to).toISOString()`, `daysLeft` (arredondado para baixo),
  `issuer = c.issuer?.O ?? c.issuer?.CN ?? ""` (cortado em 60 caracteres).
- Guardar o TLS do **último** salto https (é o que o visitante vê). Mapear:
  `CERT_HAS_EXPIRED` → `tls: "vencido"`; `ERR_TLS_CERT_ALTNAME_INVALID` → `"outro-nome"`; os de autoassinado/cadeia →
  `"nao-confiavel"`; `authorized` → `"valido"`. `daysLeft < 15` com certificado válido → alerta `"certificado-vence-logo"`.

### A7. Limites (`limits.server.ts`, tudo em memória, sem banco)

| Limite | Valor | Resposta |
|---|---|---|
| Por IP do visitante | 5 por minuto e 30 por hora (conta toda chamada válida, inclusive as do cache) | 429 `limite` "Você fez muitas checagens seguidas. Tente de novo em N segundos." + `Retry-After` |
| Por alvo (host da 1ª URL) | resultado em cache por **30 s** (mesmo URL normalizado devolve o cache com `cached: true`); no máximo **4 checagens reais por minuto** para o mesmo host | sem cache e acima do limite: 429 `limite-alvo` "Esse site acabou de ser checado várias vezes. Tente de novo em N segundos." |
| Global | 60 checagens reais por minuto; no máximo 8 ao mesmo tempo | 503 `ocupado` "Muita gente checando agora. Tente de novo em alguns segundos." |
| Tamanho do pedido | corpo > 4.096 bytes (por `content-length` ou pelo texto lido) | 413 `invalido` |

- Estruturas: `Map<ip, number[]>` (horários), `Map<host, number[]>`, `Map<urlNormalizada, { at, result }>`, contador
  global e de simultâneas. Varredura que apaga entradas vencidas a cada 200 chamadas e quando um mapa passa de 20.000
  chaves (mesma ideia de `view.ts`).
- Memória é por processo: se a Hostinger rodar mais de um, o limite real fica multiplicado. Aceitável (o global segura).
- **IP do visitante** (`clientIp(request)`): por padrão, o **último** valor de `x-forwarded-for` (o que o proxy mais
  próximo anotou; o primeiro pode ser forjado pelo visitante), depois `x-real-ip`, depois `"local"`. A regra final
  depende do diagnóstico do passo 3 (pergunta em aberto 1). Não reaproveitar o `clientIp` de `view.ts` (usa o primeiro).

### A8. Portão da rota (`api-fora-do-ar.ts`)

Na ordem:
1. `loader` (GET) → 405 com `Allow: POST`.
2. `isbot(user-agent)` → 403 `proibido`.
3. `Origin` obrigatório e com o mesmo host da requisição (`x-forwarded-host` ou `host`, igual ao `view.ts`); faltando ou
   diferente → 403 `proibido`. `Content-Type` tem que começar com `application/json` → senão 415.
4. Tamanho (A7) → JSON → `url` string (senão 400 `invalido`).
5. `normalizeTarget` → 400 `invalido` ou 422 `bloqueado`.
6. Limite por IP → cache do alvo → limite por alvo → limite global (A7).
7. `checkTarget(url)` → 200 com o `CheckResult`. Bloqueio descoberto no DNS → 422 `bloqueado`.
- Cabeçalhos de toda resposta: `Cache-Control: no-store`, `X-Robots-Tag: noindex, nofollow`,
  `Content-Type: application/json; charset=utf-8` (o dev server não passa pelo `server-app.js`).
- **Logs:** nunca fazer `console.log` com o endereço digitado nem com o IP. Erro inesperado: só
  `console.error("[fora-do-ar]", err.code ?? "erro")`.

---

## Parte B: arquitetura e contrato

### B1. Rota

`route("api/fora-do-ar", "routes/api-fora-do-ar.ts")` em `app/routes.ts`, logo depois de `api/view`. Fica sob `/api/`:
`noindex` e `no-store` pelo Express, `Disallow` no robots, nada de sitemap. A página chama com `fetch` (não com
`useFetcher`), para o endereço digitado nunca virar parte da URL da página.

### B2. Tipos (`app/lib/uptime/types.ts`)

```ts
export type Verdict = "no-ar" | "alerta" | "fora-do-ar" | "nao-encontrado";

export type Reason =
  | "ok"                       // 2xx (ou 304) no fim
  | "http-acesso-negado"       // 401, 403, 429 (servidor respondeu, mas recusou a checagem)
  | "http-nao-encontrada"      // 404, 410 (site no ar, página não existe)
  | "http-outro-4xx"           // demais 4xx
  | "http-erro-servidor"       // 500, 502, 504 e outros 5xx
  | "http-manutencao"          // 503
  | "dns-nao-encontrado" | "dns-sem-endereco" | "dns-falhou"
  | "conexao-recusada" | "conexao-interrompida" | "tempo-esgotado" | "tls-falhou" | "erro-rede" | "resposta-invalida"
  | "muitos-redirecionamentos" | "redirecionamento-bloqueado";

export type Alert = "sem-https" | "certificado-vence-logo" | "certificado-problema" | "lento";

export interface Hop { url: string; status: number }          // url em formato display, cortada em 120 caracteres

export interface CheckResult {
  target: string;               // display da URL pedida (ex.: "pão.com.br/contato")
  finalUrl: string | null;      // display da última URL respondida
  verdict: Verdict;
  reason: Reason;
  alerts: Alert[];
  status: number | null;        // código da última resposta
  statusText: string;           // "OK", "Not Found"... (cortado em 40)
  ttfbMs: number | null;        // tempo até os cabeçalhos da 1ª resposta
  totalMs: number;              // DNS + todos os saltos
  dns: { ok: boolean; v4: boolean; v6: boolean; ms: number };   // sem devolver os IPs
  redirects: Hop[];             // saltos 3xx, em ordem (vazio se nenhum)
  https: null | { state: "valido" | "vencido" | "outro-nome" | "nao-confiavel"; validTo: string | null; daysLeft: number | null; issuer: string };
  server: string | null;        // cabeçalho Server, cortado em 40
  checkedAt: string;            // ISO
  cached: boolean;
}

export interface ApiError {
  error: "invalido" | "bloqueado" | "limite" | "limite-alvo" | "ocupado" | "proibido";
  message: string;              // pronto para mostrar, em pt-BR
  retryAfter?: number;          // segundos
}
```

Os IPs resolvidos **não** voltam para o navegador (reduz o uso da ferramenta como "scanner").

### B3. Veredito (função `verdictOf` em `check.server.ts`)

| Situação | verdict | reason | alerts |
|---|---|---|---|
| Fim com 2xx ou 304 | `no-ar` | `ok` | `lento` se `ttfbMs > 2000`; certificado (A6); `sem-https` (A5) |
| Fim com 401/403/429 | `alerta` | `http-acesso-negado` | idem |
| Fim com 404/410 | `alerta` | `http-nao-encontrada` | idem |
| Fim com outro 4xx | `alerta` | `http-outro-4xx` | idem |
| Fim com 503 | `fora-do-ar` | `http-manutencao` | — |
| Fim com outro 5xx | `fora-do-ar` | `http-erro-servidor` | — |
| Respondeu mas o certificado não é `valido` | rebaixa `no-ar` para `alerta` | mantém | `certificado-problema` |
| Laço / mais de 5 saltos | `alerta` | `muitos-redirecionamentos` | — |
| Redirecionou para endereço bloqueado | `alerta` | `redirecionamento-bloqueado` | — |
| `dns-nao-encontrado`, `dns-sem-endereco` | `nao-encontrado` | idem | — |
| `dns-falhou`, erros de conexão, `tempo-esgotado`, `tls-falhou` (sem plano B), `resposta-invalida`, `erro-rede` | `fora-do-ar` | idem | — |

`lento` só com veredito `no-ar`/`alerta`. Faixas de tempo exibidas na página: até 800 ms "rápido"; 801 a 2.000 "normal"; acima "lento".

### B4. Estados da página

`ocioso` (só o campo) → `checando` → `resultado` (um dos 4 vereditos) ou `erro-pedido` (ApiError ou falha de rede
do próprio CriaSite). Nada roda no servidor ao renderizar a página; a checagem só começa com o envio do formulário.

---

## Parte C: visual

### C1. Direção visual

Um **painel de diagnóstico calmo**, no mesmo marinho das outras ferramentas: um campo grande, um botão laranja e, abaixo,
um cartão de laudo com a resposta escrita em palavras. Referência: o painel de `tool-status.tsx` (cards `bg-night-2`,
números em `.num`) com a hierarquia de um laudo médico: veredito, depois os exames, depois a conduta. Evitar: velocímetro,
gráficos, animações chamativas, verde/vermelho como único sinal.

Hierarquia: (1) o selo e a frase "exemplo.com.br está no ar" → (2) a linha-resumo com código e tempo → (3) os detalhes
(DNS, código, tempo, redirecionamentos, HTTPS) → (4) "O que fazer agora" → (5) links de leitura e histórico.

### C2. Estrutura (dentro do `ToolLayout`, que já dá caminho, H1, lead, favoritar, texto e "Outras ferramentas")

`ToolPanel` com, em ordem:

1. **Formulário** (`<form noValidate>`):
   - `label` "Endereço do site" (classe padrão `text-sm font-semibold text-moon-muted`), `input` com `inputCls`,
     `type="text"`, `inputMode="url"`, `autoComplete="url"`, `autoCapitalize="none"`, `spellCheck={false}`,
     `enterKeyHint="go"`, `placeholder="Ex.: meusite.com.br"`, `maxLength={2048}`.
   - Botão `btnCls` "Checar agora" (largura mínima `min-w-44`).
   - 390 px: campo e botão empilhados, botão `w-full`. A partir de `sm` (640 px): na mesma linha (`flex gap-3 items-end`),
     campo `flex-1`.
   - Embaixo do campo, linha `text-xs text-moon-muted`: "Sem cadastro. Testamos o endereço uma vez, do servidor do
     CriaSite." + botão de texto `text-glow underline-offset-4 hover:underline` "Testar com criasite.app" (preenche e envia).
2. **Histórico** (só aparece se houver itens): rótulo `text-[13px] font-bold uppercase tracking-[0.08em] text-moon-muted`
   "Últimas checagens" + botão de texto "Limpar" à direita. Lista de até 5 pílulas (`flex flex-wrap gap-2`), cada uma
   `min-h-10 rounded-full bg-night-2 px-3.5 text-sm font-semibold hover:bg-night-3`, com bolinha de 8 px na cor do
   veredito + texto do veredito em `sr-only` + endereço (máx. 32 caracteres, com reticências) + tempo relativo em
   `text-moon-muted` ("agora", "há 3 min", "há 2 h", "ontem"). Clique preenche o campo e checa de novo.
3. **Área de resultado** (`aria-live="polite"`, `aria-busy` durante a checagem), visível só depois do 1º envio:
   - ≥ 1024 px: grade `lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-5`: à esquerda o **Cartão do laudo**, à direita
     **O que fazer agora**. Abaixo das duas, a linha **Para ler depois**.
   - < 1024 px: tudo empilhado na mesma ordem.
4. **Aviso** (`ToolDisclaimer` com texto próprio, ver C5) no fim do painel.

### C3. Tokens (todos já existem em `app/app.css`; não criar cor nova além do âmbar, que já é usado em `tool-status.tsx`)

| Uso | Valor |
|---|---|
| Fundo do painel | `bg-night` #0c1a4b |
| Cartões | `bg-night-2` #14245e; bloco "O que fazer" `bg-night-3` #1d2c66 |
| Bordas | `border-night-line-2` #2a3c80; divisórias `border-night-line` #1d2c66 |
| Texto | `text-moon` #ffffff; secundário `text-moon-muted` #b9c3ea |
| No ar | #3ee0b0 (`up-night`) |
| Alerta | #ffc857 (`text-[#ffc857]`, `bg-[#ffc857]/15`, `border-[#ffc857]`) |
| Fora do ar / não encontrado | #ff9b9b (`down-night`) |
| Ação, links | botão `bg-brand` #ff7a1a (hover #ec6a0c); links `text-glow` #ff9a4d |
| Fonte | Schibsted Grotesk (padrão); números, códigos e URLs em `.num` (JetBrains Mono) |
| Raios | cartões `rounded-2xl` (16 px); pílulas `rounded-full`; campo `rounded-xl` (vem do `inputCls`) |
| Espaços | painel `p-5 sm:p-7` (já é do `ToolPanel`); cartões `p-4 sm:p-6`; linhas de detalhe `py-3` |
| Sombra | nenhuma (o tema é chapado) |

O site só tem tema claro com painel escuro; não há modo escuro separado.

### C4. Componentes

**Selo do veredito** (`StatusBadge`): `inline-flex items-center gap-2 rounded-full px-3 py-1 text-[13px] font-extrabold
uppercase tracking-[0.08em]`, fundo da cor a 15% e texto na cor. Ícone SVG inline 16 px (traço 2, `aria-hidden`), **forma
diferente por estado**, e o texto sempre escrito:

| verdict | Texto do selo | Ícone | Frase principal (h2 do cartão) |
|---|---|---|---|
| `no-ar` | NO AR | círculo com ✓ | "{host} está no ar" |
| `alerta` | NO AR, COM ALERTA | triângulo com ! | "{host} respondeu, mas tem um problema" |
| `fora-do-ar` | FORA DO AR | octógono com ✕ | "{host} está fora do ar" |
| `nao-encontrado` | ENDEREÇO NÃO ENCONTRADO | círculo com ? | "Não encontramos {host}" |
| (checando) | CHECANDO | 3 pontos | "Checando {host}…" |

**Cartão do laudo**: `rounded-2xl border border-night-line-2 bg-night-2 p-4 sm:p-6` com `border-l-4` na cor do
veredito. Dentro:
- Selo; abaixo o `h2` (`text-[24px] sm:text-[30px] font-extrabold tracking-[-0.02em] leading-tight`, `tabIndex={-1}`,
  recebe foco quando o resultado chega; host com `break-all`).
- Linha-resumo `text-[17px] text-moon-muted`, por reason, ex.: `ok` → "Para nós, daqui do servidor, ele respondeu em
  0,42 s com o código 200 (OK). Se não abre para você, o problema provavelmente está na sua conexão."; `tempo-esgotado`
  → "O servidor não respondeu em 9 segundos."; `dns-nao-encontrado` → "O domínio não existe na internet agora: pode ter
  sido digitado errado, ter vencido ou estar com o DNS desconfigurado."; `http-acesso-negado` → "O servidor respondeu com
  o código 403: ele está no ar, mas recusou a nossa checagem (muitos sites bloqueiam robôs)."; demais reasons: uma frase
  no mesmo tom, escrita no `advice.ts` (campo `summary`).
- Se `cached`: linha `text-xs text-moon-muted` "Resultado de {n} s atrás (o mesmo endereço foi checado agora há pouco)."
- **Lista de detalhes** (`<dl>`), cada linha `flex items-start justify-between gap-4 border-t border-night-line py-3`:
  `dt` `text-sm font-semibold text-moon-muted`; `dd` `text-right text-[15px]`, com marcador à esquerda do valor
  (✓ verde / ! âmbar / ✕ vermelho, 16 px, mais `<span class="sr-only">certo|atenção|problema</span>`). Linhas, nesta ordem:
  1. **DNS**: "Encontrado (IPv4 e IPv6)" / "Encontrado (só IPv4)" / "Não encontrado" / "Sem endereço configurado" / "Não respondeu".
  2. **Resposta**: `.num` "200 OK" + link pequeno "o que significa?" para `/ferramentas/status-http` (abre na mesma aba);
     "Sem resposta" quando não houve.
  3. **Tempo de resposta**: `.num` "0,42 s" + " · rápido|normal|lento" (pt-BR, vírgula decimal, 2 casas; `Intl.NumberFormat("pt-BR")`).
  4. **Redirecionamentos**: "Nenhum" ou "{n}" e, abaixo (alinhado à esquerda, largura total), lista `ol` em `.num text-[13px]`:
     "301 → https://www.exemplo.com.br/". Corta cada URL em 60 caracteres com reticências e `title` com a completa.
  5. **HTTPS**: "Válido até 12/03/2027 ({n} dias) · {emissor}" / "Vence em {n} dias" (âmbar) / "Vencido desde 02/11/2026" /
     "Não confere com o endereço" / "Não confiável (autoassinado)" / "Sem HTTPS" (âmbar). Datas `toLocaleDateString("pt-BR")`.
  6. **Servidor** (só se `server`): valor em `.num text-moon-muted`.
  7. **Checado em**: "17/11/2026, 14:32" (`toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })`).

**O que fazer agora**: `rounded-2xl bg-night-3 p-4 sm:p-6`. `h3` `text-lg font-extrabold` "O que fazer agora". Abaixo,
grupo de 2 botões (`role="group" aria-label="De quem é o site?"`, `aria-pressed`, mesmo estilo dos filtros de
`tool-status.tsx`: ativo `bg-brand text-white`, inativo `bg-night-2 text-moon hover:bg-night-3`, `min-h-10 rounded-full
px-4 text-sm font-bold`): "O site é meu" / "É de outra pessoa". Padrão: "O site é meu" (pergunta em aberto 2); a escolha
fica só em `useState`. Conteúdo: `ol` com 3 a 5 passos; número em círculo 24 px `rounded-full bg-brand/15 text-glow
.num text-sm font-bold`, texto `text-[15px] leading-relaxed`. Links internos em `text-glow underline underline-offset-4`.
Textos em C6.

**Para ler depois**: linha `flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold`, links `text-glow hover:underline`,
escolhidos por reason (máximo 3):
- sempre: "Códigos de status HTTP" → `/ferramentas/status-http`;
- `certificado-*`, `tls-falhou`, `sem-https`: "Guia: HTTPS e certificado SSL" → `/guias/https-e-certificado-ssl`;
- `dns-*`: "Guia: como escolher o domínio" → `/guias/como-escolher-o-dominio-do-site`;
- `http-erro-servidor`, `http-manutencao`, `tempo-esgotado`, `conexao-*`: "Guia: como escolher a hospedagem" →
  `/guias/como-escolher-a-hospedagem-do-site`;
- `ok`: "Checklist de lançamento" → `/guias/checklist-de-lancamento-do-site`.

**Estados:**
- *Ocioso*: só formulário (+ histórico, se houver). Sem cartão vazio.
- *Foco*: campo com `focus:border-glow` (já no `inputCls`); botões com o anel de foco padrão do site; pílulas do
  histórico idem.
- *Checando*: botão desabilitado com spinner 16 px (`animate-spin rounded-full border-2 border-white/40 border-t-white`,
  `motion-reduce:animate-none`) e texto "Checando…"; cartão do laudo com selo "CHECANDO", frase "Checando {host}…",
  linha "Testamos do servidor do CriaSite. Leva até 10 segundos." e 4 barras de esqueleto (`h-4 rounded bg-night-3
  animate-pulse motion-reduce:animate-none`, larguras 70%, 55%, 80%, 40%). O bloco "O que fazer" não aparece.
- *Erro de entrada* (validação leve no navegador: vazio, com espaço, mais de 2.048; o resto vem do servidor):
  mensagem `text-sm text-down-night` abaixo do campo, `aria-invalid`, `aria-describedby`, borda `border-down-night`.
  Erros `invalido`/`bloqueado` do servidor aparecem **no mesmo lugar**.
- *Erro de pedido* (`limite`, `limite-alvo`, `ocupado`): cartão `rounded-2xl border border-[#ffc857]/50 bg-night-2 p-4`
  com ícone de relógio, a `message` do servidor e contagem regressiva de `retryAfter` ("Tente de novo em 23 s"); o
  botão fica desabilitado até zerar.
- *Falha ao falar com o CriaSite* (`fetch` rejeitou ou resposta não-JSON): cartão com borda `down-night/50`: "Não
  conseguimos falar com o nosso servidor. Se outros sites também não abrem, o problema pode ser a sua internet." +
  botão `btnGhostCls` "Tentar de novo".
- *Resultado*: foco vai para o `h2`; `aria-live` lê selo + frase.

**Microdetalhes**: nada de animação de entrada além do esqueleto; transição só de cor nos hovers (`transition-colors`).
Ícones são SVG inline num pequeno componente local `Icon({ name })` dentro de `tool-uptime.tsx` (não há biblioteca de
ícones no projeto).

### C5. Textos fixos da tela

- Lead (prop `lead` do `ToolLayout`): "Digite o endereço e descubra se o site caiu para todo mundo ou se o problema está
  só na sua conexão. Mostramos o código da resposta, o tempo, o HTTPS e o que fazer em cada caso."
- `ToolDisclaimer`: "Esta ferramenta usa o servidor do CriaSite: ele acessa o endereço digitado uma vez, lê só a resposta
  inicial e não grava o endereço. As suas últimas checagens ficam só neste navegador. Detalhes na política de privacidade."
  (com "política de privacidade" como `Link` para `/privacidade`; o `ToolDisclaimer` aceita `children`).

### C6. "O que fazer agora" (`advice.ts`)

Exportar `adviceFor(result: CheckResult, mine: boolean): { summary: string; steps: ReactNode[] }` (ou strings com
marcação simples e os links montados na página). Textos (o executor pode ajustar a pontuação, não o sentido):

- **ok**
  - Meu: 1. Se não abre só para você, teste no 4G, fora do Wi-Fi. 2. Limpe o cache (Ctrl+F5 no computador) ou abra numa
    aba anônima. 3. Mudou o DNS ou a hospedagem nas últimas horas? A mudança pode levar até 24 horas para chegar a todas
    as redes (propagação). 4. Desligue VPN e bloqueadores e tente de novo. 5. Aproveite e confira o HTTPS e a validade do
    certificado ao lado.
  - Outro: 1. Recarregue a página (Ctrl+F5) ou feche e abra o aplicativo. 2. Teste no 4G, fora do Wi-Fi. 3. Tente outro
    navegador ou uma aba anônima. 4. Desligue VPN ou bloqueador de anúncios. 5. Se nada resolver, reinicie o roteador:
    pode ser o DNS da sua operadora.
- **http-acesso-negado**
  - Meu: 1. Abra o site você mesmo, no 4G. Se abrir, o bloqueio é só para robôs e está tudo bem. 2. Se não abrir, veja o
    firewall da hospedagem e o plugin de segurança (eles bloqueiam por país ou por IP). 3. Depois de migrar o site,
    confira as permissões das pastas e as regras do `.htaccess`.
  - Outro: 1. Abra o site no navegador: muitos sites recusam ferramentas como esta e abrem normalmente para pessoas.
    2. Se aparecer "acesso negado" para você também, pode ser bloqueio por região ou VPN.
- **http-nao-encontrada**
  - Meu: 1. O servidor está no ar; só este endereço não existe. 2. Se a página mudou de endereço, crie um
    redirecionamento 301 para a nova. 3. Teste a página inicial (só o domínio).
  - Outro: 1. Confira se o endereço foi digitado certo. 2. Teste só o domínio, sem o resto do caminho.
- **http-manutencao (503)**
  - Meu: 1. Se você ligou o modo de manutenção, desligue (no WordPress, apague o arquivo `.maintenance` da pasta do
    site). 2. Se não foi você, é sobrecarga: veja no painel da hospedagem o uso de CPU e memória. 3. Abra um chamado no
    suporte da hospedagem com o horário desta checagem.
  - Outro: 1. O site está em manutenção ou sobrecarregado. 2. Espere de 15 a 30 minutos e teste de novo aqui.
- **http-erro-servidor (500, 502, 504…)**
  - Meu: 1. Veja o log de erros no painel da hospedagem. 2. No WordPress, desative os plugins renomeando a pasta
    `plugins` pelo gerenciador de arquivos; se voltar, reative um a um. 3. Se fez uma atualização agora há pouco,
    restaure o backup. 4. Persistiu? Chamado no suporte da hospedagem com o código e o horário.
  - Outro: 1. O problema está no servidor do site, não no seu aparelho. 2. Espere alguns minutos. 3. Se for urgente,
    avise o responsável pelo site pelas redes sociais ou por e-mail.
- **tempo-esgotado, conexao-recusada, conexao-interrompida, erro-rede, resposta-invalida, dns-falhou**
  - Meu: 1. Confira no painel da hospedagem se o plano está ativo e a fatura em dia. 2. Veja se o site (ou o aplicativo
    Node/PHP) está ligado. 3. Procure a página de status da hospedagem: pode ser uma falha geral. 4. Abra um chamado com o
    horário desta checagem.
  - Outro: 1. O servidor do site não está respondendo para ninguém (pelo menos não daqui). 2. Espere e teste de novo
    em alguns minutos.
- **dns-nao-encontrado, dns-sem-endereco**
  - Meu: 1. Confira se o domínio está pago e ativo no registrador (no Registro.br, para .br): domínio vencido some da
    internet. 2. Confira os servidores DNS (nameservers) e o registro A ou CNAME do site. 3. Mudou o DNS agora? Espere
    a propagação (até 24 horas).
  - Outro: 1. Confira a grafia do endereço. 2. O domínio pode ter vencido ou mudado de nome; procure o site no Google.
- **tls-falhou, certificado-problema** (somar aos passos do veredito quando for alerta)
  - Meu: 1. No painel da hospedagem, reinstale ou renove o certificado SSL gratuito. 2. Confira se ele cobre o endereço
    com e sem `www`. 3. Ligue a renovação automática.
  - Outro: 1. Não digite senha nem dados de cartão nesse site até o aviso sumir. 2. Avise o responsável.
- **certificado-vence-logo** (alerta extra): Meu: "O certificado vence em {n} dias: confira se a renovação automática
  está ligada." Outro: não mostra.
- **sem-https** (alerta extra): Meu: "O site abriu só sem HTTPS. Ative o certificado gratuito da hospedagem." Outro:
  "Evite digitar dados pessoais nesse site."
- **muitos-redirecionamentos**
  - Meu: 1. É um laço: o endereço manda para outro que manda de volta. 2. Causa comum: HTTPS forçado em dois lugares
    (plugin e hospedagem ou CDN) ou regras de `www` e sem `www` brigando. Desligue uma delas. 3. Limpe o cache do
    plugin e da CDN depois.
  - Outro: 1. Limpe os cookies desse site no navegador e tente de novo. 2. Se continuar, o erro é do site.
- **redirecionamento-bloqueado**
  - Os dois: "O site mandou para um endereço de rede interna, que esta ferramenta não acessa por segurança. Se o site é
    seu, confira as regras de redirecionamento."

### C7. Critério de pronto (visual)

Em 390 px (DevTools, iPhone 12/13/14) e em 1280 px, conferir:
- 390: campo e botão empilhados, botão com largura total; cartão do laudo e "O que fazer" empilhados; linhas de detalhe
  sem rolagem horizontal (URL longa quebra); pílulas do histórico quebram linha.
- 1280: campo e botão numa linha; laudo à esquerda e "O que fazer" à direita, mesma altura de topo.
- Cada veredito mostra selo com **texto** e ícone de forma diferente (teste em escala de cinza: DevTools → Rendering →
  Emulate vision deficiencies → Achromatopsia; dá para distinguir os 4 estados).
- Teclado: Tab chega ao campo, botão, pílulas, botões "O site é meu/É de outra pessoa" e links, com foco visível.
- Leitor de tela (NVDA ou VoiceOver): ao chegar o resultado, o selo e a frase são lidos.

---

## Parte D: integração

1. `ToolSlug` ganha `| "esta-fora-do-ar"`; entrada em `TOOLS` **logo depois de `status-http`**:
   ```
   slug: "esta-fora-do-ar",
   title: "Está fora do ar? Teste se o site caiu",
   short: "Está fora do ar?",
   hint: "caiu para todos ou só para você?",
   description: "Veja se um site está fora do ar para todo mundo ou só para você: código HTTP, tempo de resposta, HTTPS e DNS, com o que fazer em cada caso.",
   category: "tecnico",
   keywords: "site caiu fora do ar offline down não abre não carrega teste verificar site funcionando disponibilidade uptime ping certificado ssl dns",
   ```
2. `TRAIL` etapa `lancamento`: `tools: ["qr-code", "status-http", "esta-fora-do-ar"]`. (No `AI_TRACK` não entra agora.)
3. `TOOL_TERMS` (`assemble.ts`): nova linha **antes** da linha de `status-http` (o robô só põe 1 link de ferramenta por
   matéria, o 1º termo da lista que casar; "fora do ar" é mais específico):
   `{ re: /(?<![\p{L}\d])(fora do ar|sites? caíram|sites? caiu|site caído|queda do site|instabilidade no site)(?![\p{L}\d])/iu, url: "/ferramentas/esta-fora-do-ar" },`
4. Sitemap, mapa do site, diretório, busca da home e o guia do redator (`writer.server.ts`, `TOOL_PAGES`) leem `TOOLS`:
   nada a fazer, só conferir.
5. Guias que devem ganhar um link para a ferramenta (**não editar agora**; fazer no sábado 21/11, junto com os links da
   3ª leva, pelo painel ou migration de UPDATE):
   - `como-escolher-a-hospedagem-do-site`, seção "Disponibilidade: quanto tempo o site fica no ar" (frase sugerida: "Para
     saber se o site caiu para todo mundo ou só para você, use o [Está fora do ar?](/ferramentas/esta-fora-do-ar).").
   - `https-e-certificado-ssl`, seção "O certificado vence?" (a ferramenta mostra a validade).
   - `como-escolher-o-dominio-do-site`, no erro "Deixar vencer".
   - `checklist-de-lancamento-do-site`, no passo de conferir HTTPS.

## Parte E: texto explicativo (`explain`), SEO e privacidade

### E1. SEO

- `meta`: `seo({ title: "Está fora do ar? Teste se um site caiu para todos ou só para você", description: tool.description, path: "/ferramentas/esta-fora-do-ar" })`
  + `{ "script:ld+json": FAQPage }` montado do mesmo array de perguntas da E3 (igual ao `faq.tsx`).
- H1 = `tool.title` ("Está fora do ar? Teste se o site caiu").
- Meta: o `explain` abaixo tem ~650 palavras; com o lead, o laudo e o FAQ, a página não é fina.

### E2. `explain` (texto exato; links com `Link` do React Router)

**h2 Como a checagem funciona**
p: Quando você clica em "Checar agora", o servidor do CriaSite procura o endereço no DNS (o catálogo que traduz o nome do
site para o número do servidor), conecta nesse servidor e pede a página, como um navegador faria. Ele lê só a resposta
inicial: o código de status, o tempo que levou, os redirecionamentos e o certificado HTTPS. O conteúdo da página não é
baixado. Com isso dá para separar quatro situações: o site está no ar, está no ar com algum problema, está fora do ar ou
o endereço nem existe.

**h2 Fora do ar para todo mundo ou só para mim?**
p: Se aqui o resultado é "no ar" e na sua casa o site não abre, o problema está no caminho entre você e o site: a sua
internet, o DNS da sua operadora, o cache do navegador, uma VPN ou um bloqueador. Teste no 4G, fora do Wi-Fi, ou em
outro aparelho. Se aqui o resultado também é "fora do ar", o problema é do site, e a única coisa que quem visita pode
fazer é esperar.
p: Um detalhe honesto: a checagem sai de um único lugar, o servidor do CriaSite. Um site pode estar fora do ar em um país
e no ar em outro, ou bloquear só alguns provedores. Para a maioria dos casos, porém, um teste de fora já responde a pergunta.

**h2 O que cada resultado quer dizer**
ul:
- **No ar**: o servidor respondeu com um código de sucesso (200) ou de "não mudou" (304).
- **No ar, com alerta**: o servidor respondeu, mas algo merece atenção: a página não existe (404), o site recusou a
  checagem (403), o certificado está vencido ou não confere com o endereço, ou os redirecionamentos entram em laço.
- **Fora do ar**: o servidor não respondeu a tempo, recusou a conexão ou respondeu com erro 5xx (500, 502, 503, 504).
  O significado de cada código está na ferramenta [Status HTTP](/ferramentas/status-http).
- **Endereço não encontrado**: o domínio não aparece no DNS. Pode ter sido digitado errado, ter vencido ou estar com os
  servidores DNS errados.

**h2 Se o site é seu**
p: A maioria das quedas de sites pequenos tem uma de cinco causas: fatura da hospedagem atrasada, domínio vencido,
certificado SSL que não renovou, atualização de plugin ou tema que quebrou o site, ou sobrecarga do servidor. O resultado
da checagem aponta qual é a mais provável e o bloco "O que fazer agora" mostra os passos. Para evitar sustos, ligue a
renovação automática do domínio e do certificado (veja o guia de [HTTPS e certificado SSL](/guias/https-e-certificado-ssl))
e escolha uma hospedagem com boa disponibilidade (o guia de [como escolher a hospedagem](/guias/como-escolher-a-hospedagem-do-site)
explica o que olhar). Antes de divulgar um site novo, passe pelo [checklist de lançamento](/guias/checklist-de-lancamento-do-site).

**h2 O que esta ferramenta não faz**
ul:
- Não monitora o site: ela checa uma vez, quando você pede. Para receber aviso quando o site cair, use um serviço de
  monitoramento (vários têm plano gratuito).
- Não guarda o endereço que você digita: ele é usado na checagem e descartado. As últimas checagens ficam só no seu
  navegador e podem ser apagadas no botão "Limpar".
- Não pede cadastro e não testa endereços de rede interna (como os de roteadores e servidores de empresa), por segurança.
- Não testa velocidade de carregamento completa: o tempo mostrado é o da primeira resposta do servidor.

**h2 Perguntas frequentes** (h3 + p para cada item da E3)

### E3. FAQ (4 perguntas; o mesmo array alimenta o texto e o JSON-LD)

1. **Como saber se um site caiu só para mim?** Teste o endereço aqui. Se aparecer "no ar", o site está funcionando e o
   problema está na sua conexão, no navegador ou no DNS da sua operadora: teste no 4G ou em outro aparelho. Se aparecer
   "fora do ar", o problema é do próprio site.
2. **O CriaSite guarda os endereços que eu testo?** Não. O servidor usa o endereço só para fazer a checagem e não o grava
   em banco de dados nem em arquivo. Por alguns segundos ele fica na memória para não repetir a mesma checagem em
   sequência. O histórico que aparece na tela fica só no seu navegador.
3. **Por que o site abre para mim, mas aqui aparece erro 403?** Muitos sites usam proteção contra robôs e recusam
   ferramentas automáticas como esta. O código 403 mostra que o servidor está no ar e respondeu; ele só não deixou a
   checagem entrar.
4. **Vocês avisam quando o meu site cair?** Ainda não. Esta ferramenta faz uma checagem por vez, quando você pede. Para
   receber alertas, use um serviço de monitoramento de disponibilidade.

### E4. Privacidade e textos legais (textos exatos)

- `privacy.tsx`, tabela "Quais dados coletamos":
  - Linha "Arquivos e textos usados nas ferramentas", coluna PARA QUÊ, passa a ser: "Nenhum: as ferramentas rodam no seu
    navegador e não enviam esses dados para os nossos servidores. Eles somem quando você fecha a página. A única exceção é
    a ferramenta “Está fora do ar?”, descrita na linha abaixo."
  - Nova linha logo depois dela:
    - DADO: "Endereço de site digitado na ferramenta “Está fora do ar?”"
    - QUANDO: "Quando você pede uma checagem nessa ferramenta."
    - PARA QUÊ: "Fazer a checagem: o nosso servidor acessa esse endereço uma vez e devolve o resultado. O endereço não é
      gravado em banco de dados nem em arquivo de log. Ele fica só na memória do servidor por até 1 minuto, para
      reaproveitar uma checagem feita há pouco e não sobrecarregar o site checado, e o seu endereço IP fica na memória
      por até 1 hora, para limitar abusos. Depois, os dois são descartados. As suas últimas checagens ficam só no
      armazenamento local do seu navegador."
  - `DOC_PAGES` em `site.ts`: `/privacidade` → `updated` com a data do dia da execução.
- `terms.tsx` (seção "O serviço"), trocar a frase "As ferramentas rodam no seu navegador: os arquivos e textos que você
  usa nelas não são enviados para os nossos servidores." por: "As ferramentas rodam no seu navegador: os arquivos e
  textos que você usa nelas não são enviados para os nossos servidores. A exceção é a “Está fora do ar?”, que precisa do
  servidor para acessar o endereço digitado; ela tem limite de uso e não pode ser usada para testar redes internas nem
  para sobrecarregar sites de terceiros." (`DOC_PAGES` `/termos` → data do dia.)
- `about.tsx` ("Suas informações ficam com você"), depois de "...não são enviados para nenhum servidor do {SITE.name}.":
  acrescentar " A exceção é a ferramenta “Está fora do ar?”, que usa o nosso servidor para acessar o endereço digitado,
  sem gravá-lo."
- `faq.tsx`:
  - "As ferramentas são grátis mesmo?" → "Sim. Todas são gratuitas e sem cadastro. Só a “Está fora do ar?” tem um limite
    de checagens por minuto, para evitar abuso. O site se mantém com anúncios."
  - "As minhas imagens e textos são enviados para algum lugar?" → acrescentar no fim: " A exceção é a “Está fora do ar?”:
    o endereço que você digita vai para o nosso servidor só para fazer a checagem e não é gravado."
- `tools.tsx` (lead da página `/ferramentas`): "Grátis, sem cadastro e quase todas rodando no seu navegador: o que você
  digita ou envia não sai do seu computador (a exceção, avisada na página, é a “Está fora do ar?”). Marque a estrela para
  fixar as que você mais usa na página inicial."
- `README.md` (portfólio), linha "11 ferramentas 100% no navegador": "12 ferramentas: 11 rodando 100% no navegador e um
  verificador de site fora do ar no servidor, com proteção contra SSRF (DNS validado e fixado, bloqueio de redes
  internas, limite por IP e por alvo)".

---

## Passos (ordem de execução)

1. **Tipos.** Criar `app/lib/uptime/types.ts` com o conteúdo da B2. Conferir: `npm run typecheck` passa.
2. **Guarda.** Criar `app/lib/uptime/guard.server.ts` com `normalizeTarget` (A1) e `isBlockedIp` (A2), exportando também
   a lista de sufixos bloqueados. Só `node:net` e `node:url`.
3. **Diagnóstico do IP do visitante.** Em `app/routes/cron.ts`, novo job `cabecalhos` (antes do `let job`):
   `if (params.job === "cabecalhos") return Response.json({ xff: h("x-forwarded-for"), xRealIp: h("x-real-ip"), cfConnectingIp: h("cf-connecting-ip"), trueClientIp: h("true-client-ip"), forwarded: h("forwarded"), via: h("via") }, { headers });`
   (com `const h = (k: string) => request.headers.get(k)`) e uma linha no comentário do topo. Protegido pelo `CRON_TOKEN`
   como os outros. Serve para decidir a regra do `clientIp` (pergunta 1).
4. **Script de teste, parte pura.** Criar `scripts/test-fora-do-ar.ts` com `node:assert/strict`, importando
   `../app/lib/uptime/guard.server.ts`. Casos na seção "Como verificar" (tabelas 1 e 2). Rodar
   `node scripts/test-fora-do-ar.ts` até passar.
5. **Commit 1 + push** (ver "Ordem de commit"). Depois do deploy, o dono abre
   `https://criasite.app/api/cron/cabecalhos?token=...` no navegador e manda o resultado no chat (pendência dele).
6. **Checagem.** Criar `app/lib/uptime/check.server.ts` com `checkTarget(url: URL, typedScheme: boolean): Promise<CheckResult | { blocked: true }>`
   seguindo A3 a A6 e B3. Imports: `node:dns`, `node:http`, `node:https`, `node:tls` (tipo), `./guard.server.ts`, `./types.ts`.
7. **Limites.** Criar `app/lib/uptime/limits.server.ts` (A7): `clientIp`, `takeIp`, `cachedResult`, `takeTarget`,
   `takeGlobal`/`release`, `remember`. Regra do `clientIp` conforme o diagnóstico do passo 5 (sem resposta ainda: último
   valor do `x-forwarded-for`).
8. **Rota da API.** Criar `app/routes/api-fora-do-ar.ts` (A8) e registrar `route("api/fora-do-ar", "routes/api-fora-do-ar.ts")`
   em `app/routes.ts`. Garantir `release()` da vaga global num `finally`.
9. **Script de teste, parte de rede.** No mesmo script, com `--rede`, chamar `normalizeTarget` + `checkTarget` (sem os
   limites) para os casos da tabela 3 e imprimir `verdict`/`reason`/`alerts`. Rodar `node scripts/test-fora-do-ar.ts --rede`.
10. **Integração.** `site.ts` (ToolSlug, TOOLS, TRAIL), rota `route("ferramentas/esta-fora-do-ar", "routes/tool-uptime.tsx")`
    em `app/routes.ts` logo depois de `status-http`, `TOOL_TERMS` (D3).
11. **Histórico no navegador.** Em `app/lib/prefs.ts`: chave `criasite_checagens`, `useCheckHistory()` no mesmo padrão
    de `useFavorites` (snapshot + `memory` + `write`), itens `{ target: string; verdict: Verdict; at: number }`, no
    máximo 5, o mais novo primeiro, sem duplicar `target` (o repetido sobe para o topo), validação ao ler (descarta item
    malformado). Funções `add(item)` e `clear()`. Atualizar o comentário do topo do arquivo (o histórico também não vai
    para o servidor).
12. **Página.** Criar `app/lib/uptime/advice.ts` (C6) e `app/routes/tool-uptime.tsx` (Parte C + E1 a E3). Envio:
    `fetch("/api/fora-do-ar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) })`;
    status 200 → `CheckResult` e `add()` no histórico; 4xx/5xx com JSON `ApiError` → estado de erro; resto → falha de
    conexão. Ignorar resposta atrasada de um envio antigo (guardar um id do envio atual). Não pôr o endereço na URL da página.
13. **Textos legais e portfólio** (E4): `privacy.tsx`, `terms.tsx`, `about.tsx`, `faq.tsx`, `tools.tsx`, `DOC_PAGES`, `README.md`.
14. **Docs.** `docs/ferramentas.md`: linha nova na tabela "No ar" (rota + como funciona em uma frase: "servidor; DNS
    validado e fixado, só cabeçalhos, até 5 redirecionamentos, limites por IP/alvo/global; histórico em
    `criasite_checagens`"), tirar o item de "Próximas", trocar a frase do topo para "Todas rodam no navegador, menos a
    Está fora do ar? (ver ferramenta-fora-do-ar.md)". `docs/arquitetura.md`: rota da ferramenta na tabela, linha
    `/api/fora-do-ar`, `criasite_checagens` em "Estado no navegador", pasta `lib/uptime/`. `docs/README.md`: status ✅,
    próximos passos, pendências. `docs/decisoes.md`: "feito" com desvios, se houver.
15. **Verificar** (seção abaixo), `npm run typecheck`, `npm run build`, **commit 2 + push**.

## Como verificar

### Tabela 1: `normalizeTarget` (teste puro)

| Entrada | Esperado |
|---|---|
| `  Exemplo.com.br  ` | ok, `https://exemplo.com.br/`, display `exemplo.com.br` |
| `exemplo.com.br/contato?x=1#topo` | ok, caminho e query mantidos, sem `#topo` |
| `http://exemplo.com.br` | ok, continua `http:`, `typedScheme` true |
| `https://exemplo.com.br:443/` | ok (porta padrão some) |
| `exemplo.com.br.` | ok, sem o ponto final |
| `pão.com.br` | ok, hostname começa com `xn--`, display `pão.com.br` |
| `` (vazio), `a b.com`, 2.100 caracteres | `invalido` |
| `localhost`, `foo.localhost`, `intranet`, `impressora.local`, `metadata.google.internal`, `roteador.home.arpa`, `site.test` | `bloqueado` |
| `127.0.0.1`, `http://2130706433`, `http://0x7f.1`, `http://017700000001`, `[::1]`, `http://[::ffff:127.0.0.1]`, `http://169.254.169.254/latest/meta-data/`, `8.8.8.8` | `bloqueado` (IP literal) |
| `ftp://exemplo.com`, `file:///etc/passwd`, `javascript:alert(1)`, `gopher://exemplo.com`, `data:text/html,oi` | `bloqueado` (esquema) |
| `https://user:senha@exemplo.com` | `bloqueado` (credenciais) |
| `exemplo.com:8080`, `https://exemplo.com:22`, `http://exemplo.com:443` | `bloqueado` (porta) |
| `exemplo.c0m`, `-exemplo.com`, `exemplo..com` | `invalido` |

### Tabela 2: `isBlockedIp` (teste puro)

Bloqueados: `0.0.0.0`, `10.1.2.3`, `100.64.0.1`, `127.0.0.1`, `127.255.255.254`, `169.254.169.254`, `172.16.0.1`,
`172.31.255.255`, `192.0.0.1`, `192.168.1.1`, `198.18.0.1`, `224.0.0.1`, `255.255.255.255`, `::`, `::1`,
`::ffff:127.0.0.1`, `::ffff:7f00:1`, `::ffff:10.0.0.1`, `64:ff9b::7f00:1`, `2002:7f00:1::1`, `2001:db8::1`,
`2001::1`, `fc00::1`, `fd00:ec2::254`, `fe80::1`, `ff02::1`, `lixo`.
Liberados: `8.8.8.8`, `1.1.1.1`, `172.32.0.1`, `100.128.0.1`, `2606:4700:4700::1111`, `2001:4860:4860::8888`.

### Tabela 3: rede (`node scripts/test-fora-do-ar.ts --rede`)

| Entrada | Esperado |
|---|---|
| `criasite.app` | `no-ar` / `ok`, HTTPS `valido` |
| `http://criasite.app` | redirecionamento listado (301/308 → https), `no-ar` |
| `127.0.0.1.nip.io`, `10.0.0.1.nip.io`, `169.254.169.254.nip.io`, `localtest.me` | bloqueado **depois do DNS** (prova da A3) |
| `https://httpbin.org/redirect-to?url=http%3A%2F%2F127.0.0.1%2F` | `alerta` / `redirecionamento-bloqueado` |
| `https://httpbin.org/redirect/7` | `alerta` / `muitos-redirecionamentos` |
| `https://httpbin.org/status/503` | `fora-do-ar` / `http-manutencao` |
| `https://httpbin.org/status/500` | `fora-do-ar` / `http-erro-servidor` |
| `https://httpbin.org/status/404` | `alerta` / `http-nao-encontrada` |
| `https://httpbin.org/delay/10` | `fora-do-ar` / `tempo-esgotado`, `totalMs` ≤ ~9.500 |
| `https://expired.badssl.com` | `alerta`, HTTPS `vencido` |
| `https://wrong.host.badssl.com` | `alerta`, HTTPS `outro-nome` |
| `https://self-signed.badssl.com` | `alerta`, HTTPS `nao-confiavel` |
| `nao-existe-criasite-teste-8271.com.br` | `nao-encontrado` / `dns-nao-encontrado` |
| `https://httpbin.org/response-headers?Server=x` (qualquer) | o corpo não é lido (conferir que a função volta logo após os cabeçalhos) |

(httpbin e badssl são serviços públicos de teste; se algum estiver fora, anotar e seguir.)

### Tabela 4: a rota, com `npm run dev` (PowerShell; trocar a porta se o Vite usar outra)

Criar um arquivo `C:\Users\<você>\AppData\Local\Temp\fd.json` com `{"url":"criasite.app"}` e rodar:
`curl.exe -s -i -X POST http://localhost:5173/api/fora-do-ar -H "Content-Type: application/json" -H "Origin: http://localhost:5173" --data-binary "@$env:TEMP\fd.json"`

| Teste | Esperado |
|---|---|
| Comando acima | 200, JSON `CheckResult`, `X-Robots-Tag: noindex, nofollow`, `Cache-Control: no-store` |
| Mesmo comando 2ª vez em < 30 s | 200 com `"cached": true` |
| Sem o `-H "Origin: ..."` | 403 `proibido` |
| `-H "Origin: https://outro.com"` | 403 |
| `-H "Content-Type: text/plain"` | 415 |
| `GET` (`curl.exe -i http://localhost:5173/api/fora-do-ar`) | 405 com `Allow: POST` |
| `-A "Googlebot/2.1"` | 403 |
| JSON `{"url":"localhost"}` | 422 `bloqueado` |
| JSON com `url` de 5.000 caracteres | 413 |
| 6 envios seguidos com URLs diferentes (reinicie o dev server antes, para zerar os contadores em memória) | o 6º volta 429 `limite` com `Retry-After` |
| Saída do terminal do dev server | nenhum endereço digitado nem IP aparece |

### Tela

- `/ferramentas/esta-fora-do-ar` em 390 px e 1280 px conforme C7, com: `criasite.app` (no ar), `expired.badssl.com`
  (alerta), `httpbin.org/status/503` (fora), `nao-existe-criasite-teste-8271.com.br` (não encontrado), `localhost`
  (erro no campo), 6 envios rápidos (cartão de limite com contagem).
- Histórico: aparece após a 1ª checagem, guarda no máximo 5, "Limpar" apaga, sobrevive ao recarregar; em aba anônima
  funciona na visita.
- Diretório `/ferramentas`, busca da home ("site caiu", "fora do ar"), `/trilha` (etapa Lançamento mostra a ferramenta),
  `/sitemap.xml` e `/mapa-do-site` listam a ferramenta.
- `/privacidade`, `/termos`, `/faq`, `/sobre`, `/ferramentas`: textos novos, data de atualização certa.
- `view-source` da página: `<title>`, description, canonical e o JSON-LD do FAQ.

### Comandos finais

`node scripts/test-fora-do-ar.ts` · `node scripts/test-fora-do-ar.ts --rede` · `npm run typecheck` · `npm run build`.
Depois do deploy: o mesmo teste da tela em `https://criasite.app/ferramentas/esta-fora-do-ar` e o `curl.exe` sem
`Origin` contra produção (403).

## Riscos e cuidados

- **SSRF é o risco principal.** Nunca usar `fetch()` (undici) nem deixar o `http.request` resolver o nome sozinho: a
  conexão vai sempre para o IP já validado (`host: ip` + `servername`/`Host` com o nome). Revisar no código que **todo**
  salto passa por `normalizeTarget` → DNS → `isBlockedIp`.
- `servername` só no https e nunca com IP (o Node avisa); IP literal já é bloqueado antes.
- `rejectUnauthorized: false` é de propósito, para ler o problema do certificado. Nada é enviado ao servidor checado,
  então não há risco de vazar dado; não copiar esse padrão para outro lugar do projeto.
- Hostinger: a CDN corta requisições acima de ~1 min; o orçamento de 9 s fica muito abaixo. Sem `await` no nível do
  módulo nos arquivos novos (regra do `server.js`).
- Memória: os mapas precisam da varredura; sem ela, um robô com muitos IPs cresceria a memória.
- O limite por IP depende do cabeçalho certo (pergunta 1). Se a regra estiver errada, ou todo mundo divide o mesmo
  limite (IP do proxy) ou o visitante consegue forjar o IP. O limite global segura nos dois casos.
- Não registrar o endereço digitado nem o IP em `console.log` (a privacidade promete isso). O log de acesso da
  Hostinger registra só `POST /api/fora-do-ar`, sem o corpo: é por isso que é POST com JSON.
- `npm run build` antes do push (o build do React Router pega erro de rota que o typecheck não pega).
- Nada de migration nesta tarefa.

## Estimativa

**G** (uma sessão longa): ~250 linhas de servidor, ~350 da página, ~120 do script de teste, mais textos.
Dá para dividir em dois dias pelos commits: dia 1 passos 1 a 9; dia 2 passos 10 a 15.

## Ordem de commit e push

1. **Commit 1** — "Está fora do ar: guarda contra SSRF, testes e diagnóstico de cabeçalhos" (passos 1 a 4):
   `node scripts/test-fora-do-ar.ts` → `npm run typecheck` → `npm run build` → commit → push. Nada visível muda no site.
2. Dono confere `/api/cron/cabecalhos` (passo 5) e responde.
3. **Commit 2** — "Ferramenta Está fora do ar?" (passos 6 a 15): testes puros e de rede → typecheck → build → commit →
   push. Conferir o deploy na Hostinger e a tela em produção.

## Perguntas em aberto (com recomendação)

1. **Qual cabeçalho traz o IP real do visitante na Hostinger?** Recomendação: decidir pelo resultado do
   `/api/cron/cabecalhos` (passo 5). Até lá, usar o **último** valor de `x-forwarded-for`. Se o último for sempre o
   mesmo IP de proxy para visitantes diferentes, usar o penúltimo (ou o `x-real-ip`, se trouxer o IP do visitante).
2. **Qual lado começa marcado em "O que fazer agora"?** Recomendação: **"O site é meu"**, porque o público do CriaSite é
   quem cuida de site; quem chega pelo Google procurando "site X caiu" troca com um toque.
3. **Limites** (5/min e 30/h por IP, 4/min por alvo, 60/min global). Recomendação: começar assim e rever em 2 semanas
   (um contador simples de 429 no log, sem endereço, ajuda a decidir).
4. **Plano B em `http://` quando o `https://` falha e a pessoa não digitou o esquema.** Recomendação: **sim** (no máximo
   1 requisição a mais, no IP já validado), porque ainda há site pequeno sem HTTPS e o alerta "sem HTTPS" é útil.
5. **Mostrar o cabeçalho `Server`** (ex.: "LiteSpeed", "cloudflare")? Recomendação: **sim**, só o nome cortado em 40
   caracteres; ajuda o dono a saber onde o site está. Não mostrar os IPs.
6. **Monitoramento com aviso por e-mail no futuro?** Recomendação: **não agora** (precisaria de banco, e-mail e cron,
   e mudaria a política de privacidade). Anotar na caixa de entrada se o dono quiser.
