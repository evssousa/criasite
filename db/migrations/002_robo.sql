-- CriaSite · migration 002 · fontes do robô de notícias
-- Notícias sobre criar e cuidar de sites: Google e SEO, WordPress e plataformas, IA e segurança.
-- Peso de 1 a 10: prioridade na escolha da pauta. section_hint é só referência.
-- O robô só escreve com GEMINI_API_KEY no hPanel. Feeds a conferir no painel (/admin/fontes) depois do deploy.

SET NAMES utf8mb4;

INSERT INTO feeds (name, url, language, section_hint, weight) VALUES
  ('Google Search Central Blog', 'https://developers.google.com/search/blog/feed.xml', 'en', 'google', 10),
  ('Search Engine Land', 'https://searchengineland.com/feed', 'en', 'google', 8),
  ('Search Engine Journal', 'https://www.searchenginejournal.com/feed/', 'en', 'google', 7),
  ('WordPress News', 'https://wordpress.org/news/feed/', 'en', 'plataformas', 9),
  ('WP Tavern', 'https://wptavern.com/feed', 'en', 'plataformas', 7),
  ('Smashing Magazine', 'https://www.smashingmagazine.com/feed/', 'en', 'noticias', 6),
  ('web.dev', 'https://web.dev/feed.xml', 'en', 'noticias', 7),
  ('Chrome for Developers', 'https://developer.chrome.com/static/blog/feed.xml', 'en', 'noticias', 6),
  ('Cloudflare Blog', 'https://blog.cloudflare.com/rss/', 'en', 'seguranca', 6),
  ('Wordfence', 'https://www.wordfence.com/feed/', 'en', 'seguranca', 7),
  ('The Verge (IA)', 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', 'en', 'ia', 5);

INSERT INTO settings (name, value) VALUES
  ('robot_sections', '["noticias","google","plataformas","ia","seguranca"]'),
  ('robot_min_words', '350'),
  ('robot_start_hour', '8'),
  ('robot_end_hour', '22')
ON DUPLICATE KEY UPDATE value = VALUES(value);

-- Liga o robô (sem GEMINI_API_KEY ele só registra "sem chave" e não publica nada).
UPDATE settings SET value = 'true' WHERE name = 'robot_enabled';
