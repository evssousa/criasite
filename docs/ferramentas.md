# Ferramentas

Todas rodam no navegador: nada do que o visitante digita ou envia vai para o servidor.

## No ar (fase 1)

| Ferramenta | Rota | Como funciona |
|---|---|---|
| Comprimir imagem | `/ferramentas/comprimir-imagem` | `createImageBitmap` + canvas → WebP/JPG/mesmo formato, qualidade 40–95, largura máxima; lote de até 20; se o resultado ficar maior que o original (sem redimensionar, mesmo formato), devolve o original. HEIC não abre (o navegador não lê): mensagem de erro clara |
| QR code | `/ferramentas/qr-code` | `qrcode-generator` (UTF-8, correção M, margem de 4 módulos); tipos link, Wi-Fi (`WIFI:T:…;S:…;P:…;;`), WhatsApp (wa.me) e texto; cores com aviso de contraste baixo/invertido; PNG 512/1024/2048 e SVG |
| Link do WhatsApp | `/ferramentas/link-whatsapp` | limpa o número (tira +55 e zero digitados), `wa.me/55…?text=`; copiar link, testar e copiar código do botão |
| Contador de caracteres | `/ferramentas/contador-de-caracteres` | caracteres (por code point), sem espaços, palavras, linhas, parágrafos, leitura (200 ppm); barras para título do Google 60, descrição 155, bio do Instagram 150, X 280, SMS 160 |
| Meta tags | `/ferramentas/meta-tags` | título, descrição, URL, imagem e nome do site → prévia no Google e no WhatsApp + código (title, description, canonical, og:*, twitter:card) |

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

- Converter imagem para WebP/PNG/JPG (página própria, reaproveita o compressor).
- Está fora do ar? (precisa de servidor: rota que testa o endereço; cuidado com abuso, limitar por IP).
- Orçamento de site para freelancer (salvo no navegador, exporta texto/PDF).
- Paleta com contraste (WCAG), gerador de favicon, tamanhos de imagem para redes.
- Sitemap e robots.txt, dados estruturados (LocalBusiness), códigos de status HTTP.
