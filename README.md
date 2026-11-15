<div align="center">

<img src="public/logo-512.png" width="96" alt="Logo do CriaSite" />

# CriaSite

**Ferramentas, notícias e guias para criar e cuidar do seu site.**

Ferramentas gratuitas que rodam no navegador (comprimir imagem, QR code, link do WhatsApp, meta tags),
notícias da web escritas automaticamente e uma trilha passo a passo do domínio ao primeiro visitante.

[**criasite.com.br**](https://criasite.com.br)

</div>

> [!IMPORTANT]
> **Todos os direitos reservados.**
> O código está público apenas para leitura. Não é um projeto open source:
> não é permitido copiar, redistribuir, publicar outra versão do site nem reaproveitar o código, o
> visual ou os textos, no todo ou em parte. Veja [LICENSE](LICENSE).

![Página inicial do CriaSite](docs/screenshots/home.webp)

## O que é

O CriaSite é um site brasileiro para quem cria e cuida de sites: donos de pequenos negócios,
freelancers, blogueiros e quem está começando no WordPress. A home é uma busca: a pessoa diz o que quer
fazer e cai direto na ferramenta. As ferramentas funcionam no navegador, sem cadastro e sem mandar
arquivos para servidor nenhum. Ao lado, notícias sobre Google, WordPress, IA e segurança, sempre com o
que muda para o site de quem lê.

### Destaques

- **Ferramentas 100% no navegador** — compressor de imagem (WebP/JPG, redimensiona, lote de até 20),
  gerador de QR code (link, Wi-Fi, WhatsApp, texto; PNG e SVG, sem validade), link do WhatsApp com
  mensagem, gerador de meta tags com prévia no Google e no WhatsApp e contador de caracteres com os
  limites do Google e das redes. Nenhum arquivo sai do computador de quem usa.
- **Feito para voltar** — o visitante fixa as ferramentas que mais usa com uma estrela e marca as
  etapas da trilha; tudo fica salvo no próprio navegador (`localStorage`), sem conta e sem servidor.
- **Busca que leva direto à ferramenta** — filtra o diretório enquanto a pessoa digita, entende
  sinônimos ("diminuir foto", "zap") e abre a ferramenta quando só uma combina.
- **Robô de notícias com IA** — lê blogs oficiais do Google, do WordPress, de navegadores e de
  segurança, escolhe as pautas, escreve com o Gemini e passa por uma checagem de qualidade com até 3
  tentativas: tamanho, intertítulos, links só de uma lista permitida, números que precisam existir nas
  fontes e nenhuma promessa de resultado.
- **Texto de verdade em cada ferramenta** — toda página de ferramenta explica o que é, como usar e as
  dúvidas comuns, porque página de ferramenta sem texto é conteúdo fino para o Google e para o AdSense.
- **Layout "Busca + Central"** — escolhido entre mais de 20 protótipos em 4 rodadas: topo marinho com a busca
  grande e a faixa da trilha, diretório por categoria e coluna de notícias. Responsivo de 375 px a
  telas largas.
- **SEO e monetização prontos** — SSR, dados estruturados, sitemap e RSS dinâmicos, páginas vazias
  fora do índice, AdSense com Modo de Consentimento v2 ligado por uma única variável.

## Telas

| Gerador de QR code | Celular | Trilha do site no ar |
|---|---|---|
| ![Gerador de QR code](docs/screenshots/qr-code.webp) | ![Home no celular](docs/screenshots/celular.webp) | ![Trilha](docs/screenshots/trilha.webp) |

<sub>As telas usam dados de exemplo (notícias fictícias).</sub>

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, React Router 8 (modo framework, SSR), Tailwind CSS 4, TypeScript |
| Ferramentas | Canvas e `createImageBitmap` (imagens), `qrcode-generator` (QR), tudo no navegador |
| Servidor | Node.js, Express 5 |
| Banco | MySQL (`mysql2`), migrations SQL versionadas e aplicadas no start |
| Mídia | `sharp` (imagens das notícias convertidas para WebP e servidas pelo próprio site) |
| IA | Google Gemini |
| Hospedagem | Hostinger (app Node.js + MySQL + Cron Jobs), deploy automático a cada push |

## Decisões técnicas

O registro completo está em [`docs/decisoes.md`](docs/decisoes.md). Alguns exemplos:

- **Privacidade por construção.** As ferramentas não têm back-end: o que a pessoa envia nunca chega ao
  servidor, o que também deixa o site barato de manter e rápido.
- **Preferências sem conta.** Favoritas e trilha ficam no `localStorage`, lidas com
  `useSyncExternalStore` para o HTML do servidor e o do navegador baterem na hidratação.
- **Uma camada de dados, duas fontes.** As páginas não sabem se as notícias vêm do MySQL ou dos dados
  de exemplo, o que permite construir o frontend inteiro antes do banco.
- **Página vazia não aparece.** Editoria sem notícia fica fora do menu, da home e do sitemap, e leva
  `noindex`: o AdSense reprova sites com páginas "em construção".
- **Jobs em segundo plano por causa da CDN.** A CDN da hospedagem corta requisições acima de ~55 s e
  escrever uma notícia pode levar mais: as rotas respondem na hora e o resultado fica no banco.
- **Base compartilhada com os sites irmãos.** Servidor, robô, painel e páginas legais vêm do
  [Vibecoin](https://github.com/evssousa/vibecoin) e do [Respawnou](https://github.com/evssousa/respawnou),
  adaptados ao tema; o que é específico (ferramentas, busca, trilha, layout) é próprio daqui.

## Documentação

A pasta [`docs/`](docs/README.md) tem o status do projeto e os detalhes de cada parte:
[arquitetura](docs/arquitetura.md) · [ferramentas](docs/ferramentas.md) · [robô](docs/automacao.md) ·
[deploy](docs/deploy-hostinger.md) · [decisões](docs/decisoes.md)

## Licença

© 2026 CriaSite. **Todos os direitos reservados.** Este repositório é público só para leitura.
Nenhuma licença de uso, cópia, modificação ou distribuição é concedida. Marcas e nomes de
empresas, plataformas e produtos citados pertencem aos seus donos. Detalhes em [LICENSE](LICENSE).
