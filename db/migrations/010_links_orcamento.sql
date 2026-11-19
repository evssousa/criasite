-- CriaSite · migration 010 · links de 4 guias para a calculadora "Quanto custa um site" (/ferramentas/quanto-custa-um-site)
-- Domínio, hospedagem, WordPress ou construtor e e-mail com domínio próprio ganham um parágrafo com o link, antes da seção indicada.
-- Segurança: só entra se o bloco do ponto de inserção (e o da seção anterior, no guia de hospedagem) for o esperado e se o link ainda não existir.
-- Um link não é revisão do texto: esta migration NÃO mexe em updated_at. Os guias de domínio, WordPress e e-mail só são alterados se ainda não foram
-- editados no painel (updated_at IS NULL). O guia de hospedagem já tem updated_at gravado pela migration 004; por isso a guarda dele são duas âncoras
-- (o título "Quanto custa" e o da seção seguinte) e o NOT LIKE. JSON_ARRAY_INSERT só insere, nunca sobrescreve. Usa JSON_OBJECT (e não CAST AS JSON)
-- para valer em MySQL 8 e em MariaDB. Se algo não bater, nada acontece: inclua o parágrafo pelo painel (/admin → Matérias).

SET NAMES utf8mb4;

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body, '$[12]', JSON_OBJECT('type', 'p', 'text', 'Para somar o domínio com a hospedagem, o e-mail e o resto do site, e comparar os caminhos no 1º ano e por mês, use a calculadora [quanto custa um site](/ferramentas/quanto-custa-um-site).'))
 WHERE section = 'guias' AND slug = 'como-escolher-o-dominio-do-site' AND updated_at IS NULL
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[10].text')) = 'Quanto custa'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[12].text')) = 'Erros comuns'
   AND CAST(body AS CHAR) NOT LIKE '%/ferramentas/quanto-custa-um-site%';

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body, '$[16]', JSON_OBJECT('type', 'p', 'text', 'Para ver a hospedagem junto com o domínio, o e-mail e a plataforma, já com o preço de renovação, use a calculadora [quanto custa um site](/ferramentas/quanto-custa-um-site). Ela não indica empresa: mostra faixas e o critério de cada uma.'))
 WHERE section = 'guias' AND slug = 'como-escolher-a-hospedagem-do-site'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[14].text')) = 'Quanto custa'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[16].text')) = 'Uma nota de transparência'
   AND CAST(body AS CHAR) NOT LIKE '%/ferramentas/quanto-custa-um-site%';

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body, '$[13]', JSON_OBJECT('type', 'p', 'text', 'Para comparar o custo do WordPress e do construtor no seu caso, com o tempo que cada um pede de você, use a calculadora [quanto custa um site](/ferramentas/quanto-custa-um-site).'))
 WHERE section = 'guias' AND slug = 'wordpress-ou-construtor-de-sites' AND updated_at IS NULL
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[13].text')) = 'Passo a passo para escolher'
   AND CAST(body AS CHAR) NOT LIKE '%/ferramentas/quanto-custa-um-site%';

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body, '$[14]', JSON_OBJECT('type', 'p', 'text', 'Para somar as caixas de e-mail ao custo do site inteiro, use a calculadora [quanto custa um site](/ferramentas/quanto-custa-um-site).'))
 WHERE section = 'guias' AND slug = 'email-com-dominio-proprio' AND updated_at IS NULL
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[14].text')) = 'Passo a passo'
   AND CAST(body AS CHAR) NOT LIKE '%/ferramentas/quanto-custa-um-site%';
