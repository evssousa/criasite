// Textos do laudo e de "O que fazer agora" da ferramenta "Está fora do ar?" (docs/ferramenta-fora-do-ar.md, C6).
// Só a página usa este arquivo; nada aqui roda no servidor de checagem.
import type { CheckResult, Reason } from "./types";

export const seconds = (ms: number) => `${new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(ms / 1000)} s`;

export function speedLabel(ms: number) {
  return ms <= 800 ? "rápido" : ms <= 2000 ? "normal" : "lento";
}

/** Frase de uma linha logo abaixo do veredito. */
export function summaryFor(r: CheckResult): string {
  const code = r.status ? `${r.status}${r.statusText ? ` (${r.statusText})` : ""}` : "";
  switch (r.reason) {
    case "ok":
      return `Para nós, daqui do servidor, ele respondeu em ${seconds(r.ttfbMs ?? r.totalMs)} com o código ${code}.${r.alerts.includes("certificado-problema") ? " Mas o certificado HTTPS tem um problema (veja nos detalhes)." : " Se não abre para você, o problema provavelmente está na sua conexão."}`;
    case "http-acesso-negado":
      return `O servidor respondeu com o código ${r.status}: ele está no ar, mas recusou a nossa checagem (muitos sites bloqueiam robôs).`;
    case "http-nao-encontrada":
      return `O servidor está no ar e respondeu com o código ${r.status}: essa página específica não existe neste endereço.`;
    case "http-outro-4xx":
      return `O servidor está no ar, mas respondeu com o código ${code}, que indica um problema com o pedido.`;
    case "http-manutencao":
      return "O servidor respondeu com o código 503: o site está em manutenção ou sobrecarregado.";
    case "http-erro-servidor":
      return `O servidor respondeu com o código ${code}: houve uma falha dentro do próprio site ou da hospedagem.`;
    case "tempo-esgotado":
      return "O servidor não respondeu em 9 segundos.";
    case "conexao-recusada":
      return "O servidor recusou a conexão: o site ou o servidor pode estar desligado.";
    case "conexao-interrompida":
      return "A conexão com o servidor foi interrompida antes de ele responder.";
    case "tls-falhou":
      return "Não foi possível abrir uma conexão segura (HTTPS) com o servidor.";
    case "erro-rede":
      return "Não conseguimos chegar ao servidor do site.";
    case "resposta-invalida":
      return "O servidor respondeu de um jeito que não conseguimos interpretar.";
    case "dns-nao-encontrado":
      return "O domínio não existe na internet agora: pode ter sido digitado errado, ter vencido ou estar com o DNS desconfigurado.";
    case "dns-sem-endereco":
      return "O domínio existe, mas não aponta para nenhum servidor (falta o registro A ou AAAA no DNS).";
    case "dns-falhou":
      return "Os servidores de DNS não responderam para esse domínio. Pode ser uma falha passageira ou um DNS mal configurado.";
    case "muitos-redirecionamentos":
      return "O endereço manda a pessoa de um lugar para outro sem nunca chegar a uma página.";
    case "redirecionamento-bloqueado":
      return "O site mandou para um endereço de rede interna, que esta ferramenta não acessa por segurança.";
  }
}

const OK: Record<"mine" | "other", string[]> = {
  mine: [
    "Se não abre só para você, teste no 4G, fora do Wi-Fi.",
    "Limpe o cache (Ctrl+F5 no computador) ou abra numa aba anônima.",
    "Mudou o DNS ou a hospedagem nas últimas horas? A mudança pode levar até 24 horas para chegar a todas as redes (propagação).",
    "Desligue VPN e bloqueadores e tente de novo.",
    "Aproveite e confira o HTTPS e a validade do certificado nos detalhes do resultado.",
  ],
  other: [
    "Recarregue a página (Ctrl+F5) ou feche e abra o aplicativo.",
    "Teste no 4G, fora do Wi-Fi.",
    "Tente outro navegador ou uma aba anônima.",
    "Desligue VPN ou bloqueador de anúncios.",
    "Se nada resolver, reinicie o roteador: pode ser o DNS da sua operadora.",
  ],
};

const STEPS: Partial<Record<Reason, Record<"mine" | "other", string[]>>> = {
  "http-acesso-negado": {
    mine: [
      "Abra o site você mesmo, no 4G. Se abrir, o bloqueio é só para robôs e está tudo bem.",
      "Se não abrir, veja o firewall da hospedagem e o plugin de segurança (eles bloqueiam por país ou por IP).",
      "Depois de migrar o site, confira as permissões das pastas e as regras do .htaccess.",
    ],
    other: [
      "Abra o site no navegador: muitos sites recusam ferramentas como esta e abrem normalmente para pessoas.",
      "Se aparecer “acesso negado” para você também, pode ser bloqueio por região ou VPN.",
    ],
  },
  "http-nao-encontrada": {
    mine: [
      "O servidor está no ar; só este endereço não existe.",
      "Se a página mudou de endereço, crie um redirecionamento 301 para a nova.",
      "Teste a página inicial (só o domínio).",
    ],
    other: ["Confira se o endereço foi digitado certo.", "Teste só o domínio, sem o resto do caminho."],
  },
  "http-outro-4xx": {
    mine: ["Confira o endereço e o que o código significa na ferramenta de status HTTP.", "Teste a página inicial (só o domínio)."],
    other: ["Confira se o endereço foi digitado certo.", "Teste só o domínio, sem o resto do caminho."],
  },
  "http-manutencao": {
    mine: [
      "Se você ligou o modo de manutenção, desligue (no WordPress, apague o arquivo .maintenance da pasta do site).",
      "Se não foi você, é sobrecarga: veja no painel da hospedagem o uso de CPU e memória.",
      "Abra um chamado no suporte da hospedagem com o horário desta checagem.",
    ],
    other: ["O site está em manutenção ou sobrecarregado.", "Espere de 15 a 30 minutos e teste de novo aqui."],
  },
  "http-erro-servidor": {
    mine: [
      "Veja o log de erros no painel da hospedagem.",
      "No WordPress, desative os plugins renomeando a pasta plugins pelo gerenciador de arquivos; se o site voltar, reative um a um.",
      "Se fez uma atualização agora há pouco, restaure o backup.",
      "Persistiu? Abra um chamado no suporte da hospedagem com o código e o horário.",
    ],
    other: ["O problema está no servidor do site, não no seu aparelho.", "Espere alguns minutos.", "Se for urgente, avise o responsável pelo site pelas redes sociais ou por e-mail."],
  },
  "dns-nao-encontrado": {
    mine: [
      "Confira se o domínio está pago e ativo no registrador (no Registro.br, para .br): domínio vencido some da internet.",
      "Confira os servidores DNS (nameservers) e o registro A ou CNAME do site.",
      "Mudou o DNS agora? Espere a propagação (até 24 horas).",
    ],
    other: ["Confira a grafia do endereço.", "O domínio pode ter vencido ou mudado de nome; procure o site no Google."],
  },
  "tls-falhou": {
    mine: [
      "No painel da hospedagem, reinstale ou renove o certificado SSL gratuito.",
      "Confira se ele cobre o endereço com e sem www.",
      "Ligue a renovação automática.",
    ],
    other: ["Não digite senha nem dados de cartão nesse site até o aviso sumir.", "Avise o responsável."],
  },
  "muitos-redirecionamentos": {
    mine: [
      "É um laço: o endereço manda para outro que manda de volta.",
      "Causa comum: HTTPS forçado em dois lugares (plugin e hospedagem ou CDN) ou regras de www e sem www brigando. Desligue uma delas.",
      "Limpe o cache do plugin e da CDN depois.",
    ],
    other: ["Limpe os cookies desse site no navegador e tente de novo.", "Se continuar, o erro é do site."],
  },
};

const DOWN: Record<"mine" | "other", string[]> = {
  mine: [
    "Confira no painel da hospedagem se o plano está ativo e a fatura em dia.",
    "Veja se o site (ou o aplicativo Node ou PHP) está ligado.",
    "Procure a página de status da hospedagem: pode ser uma falha geral.",
    "Abra um chamado com o horário desta checagem.",
  ],
  other: ["O servidor do site não está respondendo para ninguém (pelo menos não daqui).", "Espere e teste de novo em alguns minutos."],
};

const CERT: Record<"mine" | "other", string[]> = STEPS["tls-falhou"]!;

/** Passos de "O que fazer agora", conforme o resultado e de quem é o site. */
export function stepsFor(r: CheckResult, mine: boolean): string[] {
  const who = mine ? "mine" : "other";
  let steps: string[];
  if (r.reason === "redirecionamento-bloqueado") {
    return [mine ? "O site mandou para um endereço de rede interna, que esta ferramenta não acessa por segurança. Se o site é seu, confira as regras de redirecionamento." : "O site mandou para um endereço de rede interna, que esta ferramenta não acessa por segurança. Avise o responsável pelo site."];
  }
  if (r.reason === "ok") steps = [...OK[who]];
  else if (STEPS[r.reason]) steps = [...STEPS[r.reason]![who]];
  else if (r.reason === "dns-sem-endereco") steps = [...STEPS["dns-nao-encontrado"]![who]];
  else steps = [...DOWN[who]]; // tempo-esgotado, conexao-*, erro-rede, resposta-invalida, dns-falhou

  // Alertas somados aos passos do veredito.
  if (r.alerts.includes("certificado-problema") && r.reason !== "tls-falhou") steps.push(...CERT[who]);
  if (mine && r.alerts.includes("certificado-vence-logo") && r.https?.daysLeft != null) steps.push(`O certificado vence em ${r.https.daysLeft} dias: confira se a renovação automática está ligada.`);
  if (r.alerts.includes("sem-https")) steps.push(mine ? "O site abriu só sem HTTPS. Ative o certificado gratuito da hospedagem." : "Evite digitar dados pessoais nesse site.");
  return steps;
}

export interface ReadLink {
  to: string;
  label: string;
}

/** Links de "Para ler depois" (no máximo 3). */
export function readMoreFor(r: CheckResult): ReadLink[] {
  const list: ReadLink[] = [{ to: "/ferramentas/status-http", label: "Códigos de status HTTP" }];
  const tls = r.reason === "tls-falhou" || r.alerts.some((a) => a === "sem-https" || a === "certificado-problema" || a === "certificado-vence-logo");
  if (tls) list.push({ to: "/guias/https-e-certificado-ssl", label: "Guia: HTTPS e certificado SSL" });
  if (r.reason.startsWith("dns-")) list.push({ to: "/guias/como-escolher-o-dominio-do-site", label: "Guia: como escolher o domínio" });
  if (r.reason === "http-erro-servidor" || r.reason === "http-manutencao" || r.reason === "tempo-esgotado" || r.reason.startsWith("conexao-"))
    list.push({ to: "/guias/como-escolher-a-hospedagem-do-site", label: "Guia: como escolher a hospedagem" });
  if (r.reason === "ok") list.push({ to: "/guias/checklist-de-lancamento-do-site", label: "Checklist de lançamento" });
  return list.slice(0, 3);
}
