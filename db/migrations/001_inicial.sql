-- CriaSite · migration 001 · estrutura inicial
-- Compatível com MySQL 8 e MariaDB 10.6+ (Hostinger). Aplicada pelo servidor ao iniciar.
-- Campos JSON: no MariaDB o tipo JSON é um LONGTEXT com validação; o app trata os dois casos.
-- Datas sempre em UTC.

SET NAMES utf8mb4;

-- Notícias e guias (automáticos ou manuais).
CREATE TABLE posts (
  id                INT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  section           VARCHAR(20)   NOT NULL,               -- noticias|google|plataformas|ia|seguranca|guias
  slug              VARCHAR(200)  NOT NULL,
  status            ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  origin            ENUM('auto','manual') NOT NULL DEFAULT 'auto',
  title             VARCHAR(300)  NOT NULL,
  excerpt           VARCHAR(600)  NOT NULL,
  tag               VARCHAR(40)   NULL,                   -- substitui o rótulo da editoria no card
  level             TINYINT UNSIGNED NULL,                -- só guias: 1 iniciante, 2 intermediário, 3 avançado
  author            VARCHAR(120)  NOT NULL DEFAULT 'Equipe CriaSite',
  read_minutes      TINYINT UNSIGNED NOT NULL DEFAULT 3,
  image_url         VARCHAR(500)  NULL,
  image_alt         VARCHAR(300)  NULL,
  image_credit      VARCHAR(200)  NULL,
  body              JSON          NOT NULL,               -- blocos: [{type:"p",text}, {type:"h2",text}, ...]
  meta_description  VARCHAR(200)  NULL,
  focus_keyword     VARCHAR(120)  NULL,
  tags              JSON          NULL,
  featured          TINYINT(1)    NOT NULL DEFAULT 0,
  views             INT UNSIGNED  NOT NULL DEFAULT 0,
  source_name       VARCHAR(120)  NULL,
  source_url        VARCHAR(500)  NULL,
  published_at      DATETIME      NULL,
  updated_at        DATETIME      NULL,                   -- última atualização editorial
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_posts_section_slug (section, slug),
  KEY ix_posts_status_date (status, published_at),
  KEY ix_posts_section_date (section, status, published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fontes monitoradas pelo robô (RSS).
CREATE TABLE feeds (
  id               INT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(120)  NOT NULL,
  url              VARCHAR(500)  NOT NULL,
  language         VARCHAR(10)   NOT NULL DEFAULT 'en',
  section_hint     VARCHAR(20)   NULL,
  weight           TINYINT       NOT NULL DEFAULT 5,
  active           TINYINT(1)    NOT NULL DEFAULT 1,
  last_fetched_at  DATETIME      NULL,
  last_error       VARCHAR(500)  NULL,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_feeds_url (url(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Itens lidos dos feeds: a fila de pautas do robô.
CREATE TABLE feed_items (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  feed_id       INT UNSIGNED  NOT NULL,
  guid_hash     CHAR(64)      NOT NULL,
  title         VARCHAR(400)  NOT NULL,
  url           VARCHAR(600)  NOT NULL,
  summary       TEXT          NULL,
  media         JSON          NULL,                       -- imagens, vídeos e links oficiais lidos do RSS
  published_at  DATETIME      NULL,
  status        ENUM('new','used','skipped','failed') NOT NULL DEFAULT 'new',
  score         SMALLINT      NOT NULL DEFAULT 0,
  reason        VARCHAR(500)  NULL,
  post_id       INT UNSIGNED  NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_feed_items_guid (guid_hash),
  KEY ix_feed_items_status (status, published_at),
  CONSTRAINT fk_feed_items_feed FOREIGN KEY (feed_id) REFERENCES feeds (id) ON DELETE CASCADE,
  CONSTRAINT fk_feed_items_post FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Histórico das execuções dos jobs (cron).
CREATE TABLE cron_runs (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  job          VARCHAR(40)   NOT NULL,
  status       ENUM('running','ok','error','skipped') NOT NULL DEFAULT 'running',
  started_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at  DATETIME      NULL,
  message      VARCHAR(1000) NULL,
  stats        JSON          NULL,
  KEY ix_cron_runs_job (job, started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Configurações do site e do robô.
CREATE TABLE settings (
  name        VARCHAR(80)  NOT NULL PRIMARY KEY,
  value       JSON         NOT NULL,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO settings (name, value) VALUES
  ('posts_per_day', '4'),
  ('robot_enabled', 'false');
