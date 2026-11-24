-- CriaSite · migration 013 · links dos guias antigos para a 3ª leva (privacidade, manutenção, medir visitas, site fora do ar) e para o "Está fora do ar?"
-- 8 guias ganham 1 parágrafo (o checklist ganha 2), logo antes do bloco indicado. Um link não é revisão: esta migration NÃO mexe em updated_at.
-- Segurança: só entra se os blocos âncora forem os esperados e se o link novo ainda não existir; guias editados no painel (updated_at preenchido)
-- ficam de fora, exceto o de hospedagem, cujo updated_at veio da migration 004 (ali a guarda são três âncoras). JSON_ARRAY_INSERT só insere.
-- Usa JSON_OBJECT (e não CAST AS JSON) para valer em MySQL 8 e em MariaDB. Se algo não bater, nada acontece: inclua o parágrafo pelo painel.

SET NAMES utf8mb4;

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body, '$[15]', JSON_OBJECT('type', 'p', 'text', 'Se um dia o site e o e-mail pararem juntos, o domínio vencido é um dos primeiros suspeitos. O [Está fora do ar?](/ferramentas/esta-fora-do-ar) mostra se o endereço ainda aparece no DNS, e o guia [site fora do ar: o que fazer](/guias/site-fora-do-ar-o-que-fazer) lista o resto do que conferir.'))
 WHERE section = 'guias' AND slug = 'como-escolher-o-dominio-do-site' AND updated_at IS NULL
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[13].text')) = 'Erros comuns'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[15].text')) = 'Perguntas frequentes'
   AND CAST(body AS CHAR) NOT LIKE '%/guias/site-fora-do-ar-o-que-fazer%';

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body, '$[14]', JSON_OBJECT('type', 'p', 'text', 'Para saber se o site caiu para todo mundo ou só para você, use o [Está fora do ar?](/ferramentas/esta-fora-do-ar). Se caiu mesmo, o guia [site fora do ar](/guias/site-fora-do-ar-o-que-fazer) mostra o que fazer em cada caso.'))
 WHERE section = 'guias' AND slug = 'como-escolher-a-hospedagem-do-site'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[12].text')) = 'Disponibilidade: quanto tempo o site fica no ar'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[14].text')) = 'Quanto custa'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[17].text')) = 'Uma nota de transparência'
   AND CAST(body AS CHAR) NOT LIKE '%/guias/site-fora-do-ar-o-que-fazer%';

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body, '$[25]', JSON_OBJECT('type', 'p', 'text', 'Para conferir a validade do certificado sem abrir o painel, teste o endereço no [Está fora do ar?](/ferramentas/esta-fora-do-ar). A renovação, o backup e as outras tarefas de rotina estão no guia de [manutenção do site](/guias/manutencao-do-site-backup-e-atualizacoes).'))
 WHERE section = 'guias' AND slug = 'https-e-certificado-ssl' AND updated_at IS NULL
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[23].text')) = 'O certificado vence?'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[25].text')) LIKE 'Com o cadeado ativo%'
   AND CAST(body AS CHAR) NOT LIKE '%/guias/manutencao-do-site-backup-e-atualizacoes%';

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body,
       '$[11]', JSON_OBJECT('type', 'p', 'text', 'Depois do lançamento, a rotina de backup, atualizações e renovações está no guia de [manutenção do site](/guias/manutencao-do-site-backup-e-atualizacoes). Se um dia o site não abrir, comece pelo [Está fora do ar?](/ferramentas/esta-fora-do-ar).'),
       '$[9]', JSON_OBJECT('type', 'p', 'text', 'Para escrever a política e decidir se o site precisa de aviso de cookies, veja o guia de [política de privacidade para site pequeno](/guias/politica-de-privacidade-para-site-pequeno), que explica a LGPD sem juridiquês.'))
 WHERE section = 'guias' AND slug = 'checklist-de-lancamento-do-site' AND updated_at IS NULL
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[7].text')) = 'Google e privacidade'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[9].text')) = 'Garantias para o dia seguinte'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[11].text')) = 'Faça um ensaio geral antes de avisar'
   AND CAST(body AS CHAR) NOT LIKE '%/guias/politica-de-privacidade-para-site-pequeno%'
   AND CAST(body AS CHAR) NOT LIKE '%/guias/manutencao-do-site-backup-e-atualizacoes%';

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body, '$[15]', JSON_OBJECT('type', 'p', 'text', 'O formulário recolhe dados pessoais, como nome e telefone. Diga perto do botão de enviar para que eles servem e ponha o link da política de privacidade: o guia de [política de privacidade para site pequeno](/guias/politica-de-privacidade-para-site-pequeno) mostra o que escrever.'))
 WHERE section = 'guias' AND slug = 'como-escrever-as-paginas-do-site' AND updated_at IS NULL
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[12].text')) = 'Página de contato'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[15].text')) = 'Passo a passo'
   AND CAST(body AS CHAR) NOT LIKE '%/guias/politica-de-privacidade-para-site-pequeno%';

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body, '$[30]', JSON_OBJECT('type', 'p', 'text', 'Para escolher como medir as visitas, e o que isso muda na privacidade de quem chega, veja o guia [como medir as visitas do site](/guias/como-medir-as-visitas-do-site).'))
 WHERE section = 'guias' AND slug = 'google-search-console-passo-a-passo' AND updated_at IS NULL
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[28].text')) = 'Qual é a diferença para o Google Analytics?'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[30].text')) = 'E o Bing?'
   AND CAST(body AS CHAR) NOT LIKE '%/guias/como-medir-as-visitas-do-site%';

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body, '$[5]', JSON_OBJECT('type', 'p', 'text', 'Se a escolha for o WordPress, a rotina de atualizações e backup que ele pede está no guia de [manutenção do site](/guias/manutencao-do-site-backup-e-atualizacoes).'))
 WHERE section = 'guias' AND slug = 'wordpress-ou-construtor-de-sites' AND updated_at IS NULL
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[3].text')) = 'Comparação pelo que importa'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[5].text')) = 'E o SEO?'
   AND CAST(body AS CHAR) NOT LIKE '%/guias/manutencao-do-site-backup-e-atualizacoes%';

UPDATE posts
   SET body = JSON_ARRAY_INSERT(body, '$[17]', JSON_OBJECT('type', 'p', 'text', 'Para entender o que a LGPD pede de um site pequeno no dia a dia, como a política de privacidade e um canal para quem quer saber dos próprios dados, veja o guia de [política de privacidade para site pequeno](/guias/politica-de-privacidade-para-site-pequeno).'))
 WHERE section = 'guias' AND slug = 'seguranca-ao-criar-site-com-ia' AND updated_at IS NULL
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[15].text')) = 'Se uma chave ou senha vazar'
   AND JSON_UNQUOTE(JSON_EXTRACT(body, '$[17].text')) = 'Erros comuns'
   AND CAST(body AS CHAR) NOT LIKE '%/guias/politica-de-privacidade-para-site-pequeno%';
