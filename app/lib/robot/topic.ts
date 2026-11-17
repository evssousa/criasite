// Que pautas o robô de notícias aceita: tipo de texto (patrocinado, lista, opinião...) e ASSUNTO.
// O CriaSite fala com quem cria e cuida de sites; notícia de chip, bolsa, política, esporte ou celular não entra,
// mesmo vinda de uma fonte boa. Sem dependências (roda no teste sem banco). Ver docs/automacao.md.

/** Tipos de texto que não viram notícia automática. */
export const SKIP_PATTERNS: [RegExp, string][] = [
  [/\bsponsored\b|\bpress release\b|\bpartner content\b|\bpromoted\b|\badvertorial\b/i, "conteúdo patrocinado"],
  [/\bbest .{0,40} (plugins?|themes?|tools?|hosting|builders?|apps?)\b|\btop \d+\b|\b\d+ best\b|\bdeals?\b|\bblack friday\b|\bcoupon\b|\bdiscount\b/i, "lista de 'melhores', promoção ou cupom"],
  [/\bpodcast\b|\bquiz\b|\bgiveaway\b|\bsweepstakes\b|\bwebinar\b|\bhiring\b|\bjob(s)? (opening|board)\b/i, "podcast, quiz, sorteio, webinar ou vaga"],
  [/\bopinion\b|\bop-ed\b|\bcolumn:\b|\bi (think|believe)\b|\bwhy i\b/i, "texto de opinião"],
  [/\b(daily|weekly) (recap|roundup|newsletter|digest)\b|\bthis week in\b|\bweekly wordpress news\b/i, "resumo/newsletter de outro veículo"],
  [/\bmeeting (notes|summary|recap|agenda)\b|\bdev chat\b|\bteam meeting\b/i, "ata de reunião"],
];

/** Assuntos que não interessam a quem tem um site (vale para qualquer fonte, olhando só o título). */
export const OFF_TOPIC_PATTERNS: [RegExp, string][] = [
  [/\b(nvidia|amd|intel|tsmc|qualcomm|semiconductors?|chipmakers?|gpus?|graphics cards?)\b/i, "fora do assunto: chips e hardware"],
  [/\b(iphone|ipad|macbook|galaxy s\d+|pixel \d+|playstation|xbox|nintendo|smartphones?|laptops?|tesla|spacex)\b/i, "fora do assunto: aparelhos e empresas de outros setores"],
  [/\b(stock price|shares (fall|rise|jump|drop|surge|slide)|earnings|ipo|valuation|funding round|raises? \$\d|wall street|nasdaq|s&p 500)\b/i, "fora do assunto: bolsa e investimento"],
  [/\b(bitcoin|crypto(currency|currencies)?|ethereum|blockchain|nfts?|web3)\b/i, "fora do assunto: criptomoedas"],
  [/\b(election|trump|biden|congress|senate|white house|ukraine|gaza|israel|tariffs?|war)\b/i, "fora do assunto: política e guerra"],
  [/\b(nfl|nba|mlb|world cup|olympics|premier league|oscars?|grammys?|box office|movie|netflix|disney|spotify|taylor swift)\b/i, "fora do assunto: esporte e entretenimento"],
  [/\b(ceo|chief executive)\b.{0,40}\b(resign\w*|steps? down|fired|ousted)\b|\b(resign\w*|steps? down)\b.{0,40}\b(ceo|chief executive)\b/i, "fora do assunto: troca de comando de empresa"],
];

/** Fontes amplas demais (cobrem tecnologia ou IA em geral): a pauta só entra se tiver assunto de sites ou de IA para sites. */
export const GENERIC_FEEDS = new Set(["The Verge (IA)", "GitHub Blog (IA)", "OpenAI News", "Vercel Blog", "Tecnoblog"]);

/** Assuntos de quem cria e cuida de sites. Procurado no título e no início do resumo. */
const SITE_TOPIC =
  /\b(web ?sites?|webmasters?|web (traffic|developers?|design|standards|pages?|hosting)|wordpress|woocommerce|wix|shopify|squarespace|elementor|gutenberg|cms|e-?commerce|online store|seo|search (engines?|console|results?|rankings?|visibility)|google search|serp|ai overviews?|ai mode|crawl\w*|index(ing|ed)|robots\.txt|sitemap|hosting|domains?|dns|ssl|https|cloudflare|plugins?|themes?|html|css|javascript|browsers?|chrome|core web vitals|page ?speed|ai (agents?|bots?|crawlers?)\b.{0,60}\b(web|traffic|sites?|publishers?)|publishers?)\b/i;

/** IA aplicada a criar e programar sites: assistentes e agentes de código, geradores de site, MCP, skills. */
const AI_DEV_TOPIC =
  /\b(coding (assistants?|agents?|tools?|models?)|code (assistants?|generation|review|completion|editors?)|ai[- ](coding|code|pair programm\w*|ide)|vibe[- ]?cod\w*|agentic (coding|development|workflows?)|software (engineering|development) agents?|model context protocol|mcp( servers?)?|agent skills|github copilot|copilot (for|in) (github|vs ?code|visual studio)|claude code|cursor|windsurf|codex|replit|lovable|bolt\.new|v0\.(dev|app)|(app|site|website) builders?|no-?code|low-?code|pull requests?|agents\.md|assistentes? de (código|programação)|agentes? de (ia|código)|programar com ia|criar sites? com ia)\b/i;

/** IA em geral que interessa a quem tem site: custo e impacto ambiental, IA na busca e no tráfego, conteúdo feito com IA. */
const AI_INTEREST_TOPIC =
  /\b(data cent(er|re)s?|environmental|energy (use|consumption)|carbon footprint|water use|ai[- ]generated (content|text|images?)|ai content|ai search|answer engines?|chatbot (traffic|referrals?)|(web )?designers?|freelancers?|impacto ambiental|conteúdo gerado por ia)\b/i;

/** IA em geral que NÃO interessa (vale só para GENERIC_FEEDS, olhando o título): regulação, justiça, negócios, AGI. */
export const GENERIC_AI_OFF: [RegExp, string][] = [
  [/\b(regulat\w+|ai act|lawsuits?|sues?|sued|court|judge|antitrust|ftc|lawmakers?|senators?)\b/i, "fora do assunto: regulação e justiça"],
  [/\b(agi|superintelligence|alignment|military|pentagon|deepfakes?|companions?|girlfriends?)\b/i, "fora do assunto: IA em geral"],
  [/\b(acquires?|acquisition|merger|layoffs?|poach\w*)\b/i, "fora do assunto: negócios de empresas de IA"],
];

/**
 * Motivo para NÃO publicar a pauta (texto para o registro), ou null se ela pode seguir.
 * `feed` é o nome da fonte; `summary` o resumo do RSS (só os primeiros 400 caracteres entram na conferência).
 */
export function skipReason(title: string, feed = "", summary = ""): string | null {
  const type = SKIP_PATTERNS.find(([re]) => re.test(title));
  if (type) return type[1];
  const off = OFF_TOPIC_PATTERNS.find(([re]) => re.test(title));
  if (off) return off[1];
  if (GENERIC_FEEDS.has(feed)) {
    const ai = GENERIC_AI_OFF.find(([re]) => re.test(title));
    if (ai) return ai[1];
    const text = `${title} ${summary.slice(0, 400)}`;
    if (!SITE_TOPIC.test(text) && !AI_DEV_TOPIC.test(text) && !AI_INTEREST_TOPIC.test(text)) return "fora do assunto: fonte genérica sem tema de sites";
  }
  return null;
}
