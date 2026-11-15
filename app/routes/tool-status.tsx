import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/tool-status";
import { ToolLayout, ToolPanel, inputCls } from "~/components/ToolLayout";
import { cx } from "~/components/ui";
import { normalize } from "~/lib/format";
import { seo } from "~/lib/seo";
import { toolBySlug } from "~/lib/site";

const tool = toolBySlug("status-http")!;

export function meta(_: Route.MetaArgs) {
  return seo({ title: "Códigos de status HTTP: 200, 301, 404, 500, 503 e o que fazer", description: tool.description, path: "/ferramentas/status-http" });
}

type Family = "ok" | "redir" | "cliente" | "servidor";

interface Code {
  code: number;
  name: string;
  family: Family;
  meaning: string;
  action: string;
}

const CODES: Code[] = [
  { code: 200, name: "OK", family: "ok", meaning: "A página abriu normalmente.", action: "Nada a fazer. É o que toda página do site deve devolver." },
  { code: 201, name: "Criado", family: "ok", meaning: "O pedido deu certo e algo novo foi criado (um cadastro, um pedido).", action: "Comum em formulários e sistemas. Não aparece para quem navega." },
  { code: 204, name: "Sem conteúdo", family: "ok", meaning: "Deu certo, mas não há nada para mostrar.", action: "Normal em ações que não devolvem página, como salvar uma preferência." },
  { code: 301, name: "Movida permanentemente", family: "redir", meaning: "A página mudou de endereço para sempre e o visitante é levado ao novo.", action: "Use ao trocar o endereço de uma página: o Google passa a valer o novo e mantém a maior parte da posição. Evite correntes de vários redirecionamentos." },
  { code: 302, name: "Encontrada (temporária)", family: "redir", meaning: "A página está em outro endereço só por enquanto.", action: "Use para mudanças temporárias (promoção, manutenção). Se a mudança é definitiva, troque para 301." },
  { code: 304, name: "Não modificada", family: "redir", meaning: "A página não mudou desde a última visita; o navegador usa a cópia guardada.", action: "É bom sinal: deixa o site mais rápido. Nada a corrigir." },
  { code: 307, name: "Redirecionamento temporário", family: "redir", meaning: "Como o 302, mas mantém o método do pedido (por exemplo, o envio de um formulário).", action: "Aparece em redirecionamentos para HTTPS feitos por alguns servidores. Normal." },
  { code: 308, name: "Redirecionamento permanente", family: "redir", meaning: "Como o 301, mas mantém o método do pedido.", action: "Trate como o 301: mudança definitiva de endereço." },
  { code: 400, name: "Pedido inválido", family: "cliente", meaning: "O servidor não entendeu o pedido (endereço ou dados mal formados).", action: "Confira se o link está correto e sem caracteres estranhos. Se acontece em um formulário do seu site, revise os campos enviados." },
  { code: 401, name: "Não autorizado", family: "cliente", meaning: "A página exige login e o visitante não entrou.", action: "Esperado em áreas restritas. Se aparece em uma página pública, revise a proteção por senha do servidor." },
  { code: 403, name: "Proibido", family: "cliente", meaning: "O servidor entendeu o pedido, mas não deixa abrir (permissão negada).", action: "Confira as permissões dos arquivos e das pastas, regras do .htaccess e bloqueios de firewall ou de plugin de segurança. É comum depois de migrar o site." },
  { code: 404, name: "Não encontrada", family: "cliente", meaning: "Essa página não existe neste endereço.", action: "Se a página mudou, crie um redirecionamento 301 para a nova. Se foi apagada, deixe o 404 e tenha uma página de erro útil, com busca e links. Corrija links internos quebrados." },
  { code: 405, name: "Método não permitido", family: "cliente", meaning: "A página não aceita esse tipo de pedido (por exemplo, enviar dados para uma página que só mostra).", action: "Em formulários, confira o endereço de envio e o método (POST ou GET)." },
  { code: 410, name: "Removida", family: "cliente", meaning: "A página foi apagada de propósito e não volta.", action: "Use quando quiser avisar o Google que o conteúdo acabou de vez. Ele costuma tirar a página do índice mais rápido que com o 404." },
  { code: 429, name: "Muitos pedidos", family: "cliente", meaning: "O servidor limitou o acesso porque vieram pedidos demais em pouco tempo.", action: "Pode ser robô ou ataque. Veja os acessos do servidor e, se for legítimo, aumente o limite ou use um serviço de proteção." },
  { code: 500, name: "Erro interno do servidor", family: "servidor", meaning: "Algo falhou no servidor ou no código do site, sem uma causa específica.", action: "No WordPress: desative os plugins e o tema um a um, confira o arquivo .htaccess e o log de erros da hospedagem. É o erro mais comum depois de uma atualização." },
  { code: 502, name: "Gateway inválido", family: "servidor", meaning: "Um servidor intermediário recebeu uma resposta inválida do servidor do site.", action: "Costuma ser passageiro. Espere e recarregue; se persistir, fale com a hospedagem ou veja se o aplicativo do site travou." },
  { code: 503, name: "Serviço indisponível", family: "servidor", meaning: "O servidor está sobrecarregado ou em manutenção.", action: "Para manutenção planejada, devolva 503 (e não 404): o Google entende que é temporário e volta depois. Se for sobrecarga, revise o plano de hospedagem e o cache." },
  { code: 504, name: "Tempo esgotado", family: "servidor", meaning: "O servidor demorou demais para responder.", action: "Procure o que deixa o site pesado: plugins, consultas lentas ao banco, imagens enormes. Avalie cache e um plano melhor." },
];

const FAMILIES: { id: Family | "todos"; label: string; hint: string }[] = [
  { id: "todos", label: "Todos", hint: "" },
  { id: "ok", label: "2xx · Deu certo", hint: "" },
  { id: "redir", label: "3xx · Redirecionamento", hint: "" },
  { id: "cliente", label: "4xx · Erro do pedido", hint: "" },
  { id: "servidor", label: "5xx · Erro do servidor", hint: "" },
];

const TONE: Record<Family, string> = {
  ok: "text-up-night",
  redir: "text-glow",
  cliente: "text-[#ffc857]",
  servidor: "text-down-night",
};

export default function StatusTool() {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<Family | "todos">("todos");
  const q = normalize(query).trim();
  // Só números (ex.: "40"): casa pelo começo do código. Palavras: busca no texto todo.
  const byCode = /^\d{1,3}$/.test(q);
  const list = CODES.filter(
    (c) => (family === "todos" || c.family === family) && (!q || (byCode ? String(c.code).startsWith(q) : normalize(`${c.code} ${c.name} ${c.meaning} ${c.action}`).includes(q))),
  );

  return (
    <ToolLayout
      tool={tool}
      lead="Digite o número do erro que apareceu (404, 500, 503...) ou filtre por tipo, e veja o que ele significa e o que fazer no seu site."
      explain={
        <>
          <h2>O que é um código de status HTTP</h2>
          <p>
            Toda vez que o navegador pede uma página, o servidor responde com um número de três dígitos antes de mandar o conteúdo. É o código de status. Ele
            diz se deu certo, se a página mudou de lugar ou se algo falhou, e é o que o Google lê para decidir o que fazer com cada endereço do seu site.
          </p>
          <h2>Como as famílias de código se dividem</h2>
          <ul>
            <li>
              <strong>2xx</strong>: deu certo. O 200 é o que toda página normal deve devolver.
            </li>
            <li>
              <strong>3xx</strong>: redirecionamento. O visitante é levado a outro endereço. O 301 (permanente) é o mais importante para o Google.
            </li>
            <li>
              <strong>4xx</strong>: o problema está no pedido: o endereço não existe (404), o acesso é proibido (403) e assim por diante.
            </li>
            <li>
              <strong>5xx</strong>: o problema está no servidor. O 500 e o 503 são os que mais derrubam sites.
            </li>
          </ul>
          <h2>Quais códigos importam para o Google</h2>
          <p>
            Páginas com 200 podem aparecer na busca. Com 301, o Google troca o endereço antigo pelo novo. Com 404 ou 410, ele tira a página do índice com o
            tempo. Com 5xx repetidos, ele passa a visitar o site menos e pode tirar páginas da busca. Por isso, quando mudar o endereço de uma página, faça
            sempre o redirecionamento 301, e quando for tirar o site do ar por pouco tempo, devolva 503. Para listar só as páginas boas no mapa do site, use o{" "}
            <Link to="/ferramentas/sitemap-robots">gerador de sitemap</Link>.
          </p>
          <h2>Como ver o código de uma página</h2>
          <p>
            No Chrome, aperte F12, abra a aba Rede (Network), recarregue a página e clique na primeira linha: o código aparece em “Status”. O Google Search
            Console também lista as páginas com erro, no relatório de indexação de páginas.
          </p>
        </>
      }
    >
      <ToolPanel>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex min-w-56 flex-1 flex-col gap-1.5">
            <label htmlFor="st-q" className="text-sm font-semibold text-moon-muted">
              Buscar código ou palavra
            </label>
            <input id="st-q" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ex.: 404, redirecionamento, servidor" className={inputCls} />
          </div>
        </div>
        <div role="group" aria-label="Filtrar por tipo" className="flex flex-wrap gap-2">
          {FAMILIES.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={family === f.id}
              onClick={() => setFamily(f.id)}
              className={cx("min-h-10 rounded-full px-4 text-sm font-bold", family === f.id ? "bg-brand text-white" : "bg-night-2 text-moon hover:bg-night-3")}
            >
              {f.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-moon-muted" aria-live="polite">
          {list.length} {list.length === 1 ? "código" : "códigos"}
        </p>
        {list.length === 0 ? (
          <p className="rounded-xl bg-night-2 p-4 text-sm text-moon-muted">Nenhum código com “{query}”. Tente só o número, como 404, ou limpe o filtro.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
            {list.map((c) => (
              <li key={c.code} className="flex gap-4 rounded-xl bg-night-2 p-4">
                <span className={cx("num text-3xl leading-none font-bold", TONE[c.family])}>{c.code}</span>
                <span className="flex min-w-0 flex-col gap-1.5">
                  <b className="text-base">{c.name}</b>
                  <span className="text-[14px] leading-relaxed text-moon-muted">{c.meaning}</span>
                  <span className="text-[14px] leading-relaxed">
                    <b className="text-glow">O que fazer: </b>
                    {c.action}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </ToolPanel>
    </ToolLayout>
  );
}
