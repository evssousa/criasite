-- CriaSite · migration 005 · capas próprias dos 6 guias iniciais (arquivos em public/capas/)
-- Só preenche a capa onde ela está vazia: se o dono já pôs outra imagem pelo painel, nada muda.
-- Não mexe em updated_at (a página não passa a mostrar "Atualizado em") nem no texto do guia.

SET NAMES utf8mb4;

UPDATE posts SET image_url = '/capas/como-escolher-o-dominio-do-site.webp', image_alt = 'Ilustração de uma janela de navegador com uma barra de endereço grande: o nome do site em azul-marinho e a extensão em laranja, com o cursor por cima.' WHERE section = 'guias' AND slug = 'como-escolher-o-dominio-do-site' AND (image_url IS NULL OR image_url = '');
UPDATE posts SET image_url = '/capas/como-escolher-a-hospedagem-do-site.webp', image_alt = 'Ilustração de um servidor com três gavetas e luzes acesas dentro de uma janela de navegador, representando a hospedagem do site.' WHERE section = 'guias' AND slug = 'como-escolher-a-hospedagem-do-site' AND (image_url IS NULL OR image_url = '');
UPDATE posts SET image_url = '/capas/cores-fonte-e-favicon-do-site.webp', image_alt = 'Ilustração com três amostras de cor, linhas de texto em tamanhos diferentes, um favicon laranja e um selo de contraste aprovado.' WHERE section = 'guias' AND slug = 'cores-fonte-e-favicon-do-site' AND (image_url IS NULL OR image_url = '');
UPDATE posts SET image_url = '/capas/seo-basico-para-aparecer-no-google.webp', image_alt = 'Ilustração de uma lista de resultados de busca com o primeiro resultado em laranja e uma lupa grande por cima.' WHERE section = 'guias' AND slug = 'seo-basico-para-aparecer-no-google' AND (image_url IS NULL OR image_url = '');
UPDATE posts SET image_url = '/capas/site-lento-causas-e-como-otimizar-imagens.webp', image_alt = 'Ilustração de um velocímetro com o ponteiro perto do máximo e uma imagem grande que vira um arquivo menor, ao lado.' WHERE section = 'guias' AND slug = 'site-lento-causas-e-como-otimizar-imagens' AND (image_url IS NULL OR image_url = '');
UPDATE posts SET image_url = '/capas/checklist-de-lancamento-do-site.webp', image_alt = 'Ilustração de uma lista de tarefas com dois itens marcados e um foguete pronto para decolar dentro de uma janela de navegador.' WHERE section = 'guias' AND slug = 'checklist-de-lancamento-do-site' AND (image_url IS NULL OR image_url = '');
