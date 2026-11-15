# Ferramentas

Todas rodam no navegador: nada do que o visitante digita ou envia vai para o servidor.

## No ar

| Ferramenta | Rota | Como funciona |
|---|---|---|
| Comprimir imagem | `/ferramentas/comprimir-imagem` | `createImageBitmap` + canvas → WebP/JPG/mesmo formato, qualidade 40–95, largura máxima; lote de até 20; se o resultado ficar maior que o original (sem redimensionar, mesmo formato), devolve o original. HEIC não abre (o navegador não lê): mensagem de erro clara |
| Converter imagem | `/ferramentas/converter-imagem` | mesma base: troca o formato (WebP, PNG, JPG) mantendo as dimensões; JPG com fundo branco no lugar da transparência; lote de até 20 |
| QR code | `/ferramentas/qr-code` | `qrcode-generator` (UTF-8, correção M, margem de 4 módulos); tipos link, Wi-Fi (`WIFI:T:…;S:…;P:…;;`), WhatsApp (wa.me) e texto; cores com aviso de contraste baixo/invertido; PNG 512/1024/2048 e SVG |
| Link do WhatsApp | `/ferramentas/link-whatsapp` | limpa o número (tira +55 e zero digitados), `wa.me/55…?text=`; copiar link, testar e copiar código do botão |
| Contador de caracteres | `/ferramentas/contador-de-caracteres` | caracteres (por code point), sem espaços, palavras, linhas, parágrafos, leitura (200 ppm); barras para título do Google 60, descrição 155, bio do Instagram 150, X 280, SMS 160 |
| Meta tags | `/ferramentas/meta-tags` | título, descrição, URL, imagem e nome do site → prévia no Google e no WhatsApp + código (title, description, canonical, og:*, twitter:card) |
| Contraste de cores | `/ferramentas/contraste-cores` | luminância relativa e razão do WCAG 2.x; testes AA/AAA para texto normal, grande e componentes; prévia do texto; troca texto/fundo |
| Gerador de favicon | `/ferramentas/gerador-favicon` | canvas → PNGs 16/32/48/180/192/512; `favicon.ico` montado à mão com 16, 32 e 48 (PNG dentro do ICO); opções de encaixe, fundo e cantos; código HTML pronto |
| Sitemap e robots.txt | `/ferramentas/sitemap-robots` | lista de caminhos ou URLs → `sitemap.xml` (com `lastmod` opcional, URLs de outro domínio ignoradas, duplicadas removidas) e `robots.txt` com `Disallow` e a linha do sitemap |
| Status HTTP | `/ferramentas/status-http` | referência de 19 códigos com significado e "o que fazer no seu site"; filtro por família e busca (número casa pelo começo do código) |
| Tamanhos de imagem | `/ferramentas/tamanhos-de-imagem` | tabela de 21 medidas (site, Instagram, Facebook/LinkedIn/X/WhatsApp, YouTube) com proporção; toque copia a medida. São medidas de referência: as redes mudam, a página avisa |

## Como adicionar uma ferramenta

1. Cadastre em `TOOLS` (`app/lib/site.ts`): slug, título, nome curto, linha do diretório (`hint`),
   descrição, categoria e `keywords` (sinônimos que as pessoas digitam; a busca da home usa).
2. Crie `app/routes/tool-<nome>.tsx` usando `ToolLayout` + `ToolPanel` e registre a rota em
   `app/routes.ts` (o slug do `ToolSlug` tem que bater).
3. **Escreva o texto explicativo** (`explain`): o que é, como usar, dúvidas comuns, com 1 ou 2 links
   internos. Sem texto, a página é conteúdo fino para o Google e para o AdSense.
4. Se ajuda alguma etapa da trilha, acrescente o slug em `TRAIL[].tools`.
5. Se tiver termo típico em notícias, acrescente em `TOOL_TERMS` (`app/lib/robot/assemble.ts`) para o
   robô linkar a ferramenta automaticamente.

## Próximas (por ordem de volume de busca e de uso recorrente)

- Está fora do ar? (precisa de servidor: rota que testa o endereço; cuidado com abuso e SSRF, limitar por IP e bloquear endereços internos).
- Orçamento de site para freelancer (salvo no navegador, exporta texto/PDF).
- Gerador de paleta de cores a partir de uma imagem ou cor base; pares de fontes.
- Gerador de slug, minificador de HTML/CSS, regras de redirecionamento (.htaccess).
- Dados estruturados (LocalBusiness, FAQ), política de privacidade e termos para o site do cliente.
