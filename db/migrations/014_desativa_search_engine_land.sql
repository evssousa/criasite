-- CriaSite · migration 014 · desativa a fonte Search Engine Land
-- O feed responde HTTP 403 a toda coleta feita do servidor (na Hostinger e na VPS), mas abre de um IP residencial:
-- é bloqueio por IP de datacenter, e outro endereço de feed no mesmo domínio não resolve. A fonte fica na tabela
-- (histórico e pautas já lidas) e pode ser religada no painel (/admin/fontes) se o bloqueio acabar.
-- A seção google continua com Google Search Central Blog (peso 10) e Search Engine Journal (peso 7).

UPDATE feeds SET active = 0 WHERE url = 'https://searchengineland.com/feed';
