-- CriaSite · migration 009 · links dos guias G2 e G3 para as ferramentas de IA
-- G2 (prompt-para-criar-site-com-ia) ganha um parágrafo com o link do gerador de prompt; G3 (arquivo-de-instrucoes-para-assistente-de-codigo)
-- ganha um com o link do gerador de arquivo de instruções. Cada parágrafo entra logo depois da lista do modelo, antes da seção seguinte.
-- Segurança: só mexe no guia que ainda não foi editado no painel (updated_at IS NULL), só se o bloco do ponto de inserção for o esperado
-- (o título da seção seguinte) e só se o link ainda não existir. Usa JSON_OBJECT (e não CAST AS JSON) para valer em MySQL 8 e em MariaDB. Se algo não bater, nada acontece: inclua o parágrafo pelo painel (/admin → Matérias).

SET NAMES utf8mb4;

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body, '$[8]', JSON_OBJECT('type', 'p', 'text', 'Para montar o seu pedido campo a campo, com as cores conferidas e o texto pronto para copiar, use o [gerador de prompt para site](/ferramentas/prompt-para-site).')),
       updated_at = UTC_TIMESTAMP()
 WHERE section = 'guias' AND slug = 'prompt-para-criar-site-com-ia' AND updated_at IS NULL
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[8].text')) = 'Um pedido ruim e um pedido bom'
   AND CAST(body AS CHAR) NOT LIKE '%/ferramentas/prompt-para-site%';

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body, '$[11]', JSON_OBJECT('type', 'p', 'text', 'Para montar o seu campo a campo, com as regras prontas para marcar e o arquivo pronto para baixar, use o [gerador de arquivo de instruções](/ferramentas/arquivo-de-instrucoes-ia).')),
       updated_at = UTC_TIMESTAMP()
 WHERE section = 'guias' AND slug = 'arquivo-de-instrucoes-para-assistente-de-codigo' AND updated_at IS NULL
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[11].text')) = 'Regra boa e regra ruim'
   AND CAST(body AS CHAR) NOT LIKE '%/ferramentas/arquivo-de-instrucoes-ia%';
