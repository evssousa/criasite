-- CriaSite · migration 007 · fontes do robô para IA aplicada a sites (assistentes e agentes de código, MCP, IA no WordPress)
-- Feeds conferidos com curl em 2026-11-17. Fontes genéricas só publicam com assunto de sites ou de IA para programar
-- (ver GENERIC_FEEDS em app/lib/robot/topic.ts: o nome daqui tem de ser idêntico ao de lá).
-- Fora de propósito: Anthropic (sem RSS oficial) e Google Developers Blog (itens sem data, que o robô descarta).

SET NAMES utf8mb4;

INSERT IGNORE INTO feeds (name, url, language, section_hint, weight) VALUES
  ('GitHub Blog (IA)', 'https://github.blog/ai-and-ml/feed/', 'en', 'ia', 6),
  ('Make WordPress AI', 'https://make.wordpress.org/ai/feed/', 'en', 'ia', 6),
  ('OpenAI News', 'https://openai.com/news/rss.xml', 'en', 'ia', 4),
  ('Vercel Blog', 'https://vercel.com/atom', 'en', 'ia', 4),
  ('Tecnoblog', 'https://tecnoblog.net/feed/', 'pt', 'ia', 3);
