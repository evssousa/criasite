// Dados da ferramenta "Quanto custa um site" (docs/orcamento-site.md, Parte C). É o ÚNICO arquivo com números.
// Regras: só faixas, critério escrito ao lado, nenhum nome de empresa, nenhum link, nada de "oficial" ou "garantido".
// `node scripts/test-orcamento.ts` confere tudo isto e FALHA quando `updatedAt` passa de `validDays` (revisão semestral).
// Para revisar: confira as faixas nas páginas públicas de 2 ou 3 empresas de cada linha, ajuste aqui, ponha a data da
// conferência em `updatedAt`, rode o teste e anote a mudança em docs/decisoes.md. Ninguém ajusta faixa para favorecer caminho.
import type { OrcamentoData } from "./types.ts";

const F = (min: number, max: number) => ({ min, max });

export const ORCAMENTO_DATA: OrcamentoData = {
  version: 1,
  updatedAt: "2026-11-19",
  validDays: 180,

  premissas: {
    "dominio-com-br": {
      id: "dominio-com-br",
      label: "Domínio .com.br",
      cobranca: "anual",
      primeiroAno: F(40, 60),
      depois: F(40, 60),
      base: "Preço anual do .br na tabela pública do Registro.br (registro.br), mais a margem comum de quem revende. Confira o valor do dia lá.",
    },
    "dominio-com": {
      id: "dominio-com",
      label: "Domínio .com",
      cobranca: "anual",
      primeiroAno: F(40, 100),
      depois: F(70, 130),
      base: "Critério: registradores que vendem em reais. O .com acompanha o dólar e a renovação costuma custar mais que o 1º ano.",
    },
    "hosp-estatica": {
      id: "hosp-estatica",
      label: "Hospedagem de site estático",
      cobranca: "mensal",
      primeiroAno: F(0, 25),
      depois: F(0, 25),
      base: "Site só de arquivos (HTML, CSS e JavaScript), sem banco de dados: há planos gratuitos com limite de uso; acima do limite, um plano pago simples.",
    },
    "hosp-compartilhada": {
      id: "hosp-compartilhada",
      label: "Hospedagem compartilhada",
      cobranca: "mensal",
      primeiroAno: F(10, 35),
      depois: F(20, 60),
      base: "Critério: planos de entrada vendidos no Brasil. O 1º período tem desconto e costuma exigir pagar 12 meses ou mais adiantado; depois vale o preço de renovação.",
    },
    "hosp-loja": {
      id: "hosp-loja",
      label: "Hospedagem para loja",
      cobranca: "mensal",
      primeiroAno: F(25, 80),
      depois: F(40, 150),
      base: "Critério: planos intermediários de hospedagem (mais memória e banco de dados) usados para loja com WordPress, no 1º período e na renovação.",
    },
    "construtor-basico": {
      id: "construtor-basico",
      label: "Plano do construtor de sites",
      cobranca: "mensal",
      primeiroAno: F(30, 90),
      depois: F(40, 110),
      base: "Critério: planos pagos anualmente de construtores populares no Brasil que aceitam domínio próprio e tiram a marca do construtor. O plano gratuito não entra (usa o endereço do construtor).",
    },
    "construtor-loja": {
      id: "construtor-loja",
      label: "Plano do construtor com loja",
      cobranca: "mensal",
      primeiroAno: F(60, 200),
      depois: F(70, 250),
      base: "Critério: planos de construtores e plataformas de loja que liberam carrinho e pagamento, pagos anualmente. Não inclui a taxa por venda.",
    },
    "construtor-app": {
      id: "construtor-app",
      label: "Recurso extra do construtor",
      cobranca: "mensal",
      primeiroAno: F(0, 60),
      depois: F(0, 60),
      base: "Critério: aplicativos e complementos cobrados à parte em alguns construtores (agenda, idiomas, área de membros). Às vezes já vêm no plano.",
    },
    "wp-tema": {
      id: "wp-tema",
      label: "Tema do WordPress",
      cobranca: "anual",
      primeiroAno: F(0, 400),
      depois: F(0, 300),
      base: "Tema gratuito do diretório do próprio WordPress (R$ 0) ou licença de tema comercial, em geral cobrada em dólar por ano. A renovação da licença é opcional, mas traz as atualizações.",
    },
    "wp-plugin": {
      id: "wp-plugin",
      label: "Plugin pago",
      cobranca: "anual",
      primeiroAno: F(0, 600),
      depois: F(0, 600),
      base: "Critério: plugins com versão gratuita e licença anual paga para recursos a mais, cobrada em dólar. Muitas vezes a versão gratuita resolve.",
    },
    "wp-loja-extensoes": {
      id: "wp-loja-extensoes",
      label: "Extensões da loja",
      cobranca: "anual",
      primeiroAno: F(0, 1000),
      depois: F(0, 1000),
      base: "O plugin de loja mais usado no WordPress é gratuito; frete, meios de pagamento e notas podem pedir extensões pagas por ano.",
    },
    "wp-seguranca": {
      id: "wp-seguranca",
      label: "Backup e segurança",
      cobranca: "anual",
      primeiroAno: F(0, 400),
      depois: F(0, 400),
      base: "Muitos planos de hospedagem já incluem backup; quando não incluem, um plugin de backup e segurança com licença anual.",
    },
    "ia-assinatura": {
      id: "ia-assinatura",
      label: "Assistente de IA enquanto constrói",
      cobranca: "unico",
      primeiroAno: F(0, 400),
      depois: F(0, 0),
      base: "Plano gratuito ou até 3 meses de um plano pago de assistente de IA enquanto o site é feito. Depois, só se continuar usando para mudar o site.",
    },
    "ia-servico": {
      id: "ia-servico",
      label: "Serviço externo para o recurso",
      cobranca: "mensal",
      primeiroAno: F(0, 60),
      depois: F(0, 60),
      base: "Site feito com IA, sem banco de dados, costuma usar um serviço pronto para formulário, agenda ou login. Muitos têm plano gratuito com limite de uso.",
    },
    "email-hosp": {
      id: "email-hosp",
      label: "E-mail na hospedagem",
      cobranca: "mensal",
      primeiroAno: F(0, 15),
      depois: F(0, 15),
      base: "Muitos planos de hospedagem incluem algumas caixas de e-mail sem custo extra; quando não incluem, a caixa simples é cobrada à parte. Valor por caixa.",
    },
    "email-avulso": {
      id: "email-avulso",
      label: "E-mail profissional simples",
      cobranca: "mensal",
      primeiroAno: F(5, 20),
      depois: F(5, 20),
      base: "Critério: e-mail com domínio próprio vendido por caixa, sem agenda nem documentos. Valor por caixa.",
    },
    "email-suite": {
      id: "email-suite",
      label: "E-mail com agenda e documentos",
      cobranca: "mensal",
      primeiroAno: F(20, 45),
      depois: F(20, 45),
      base: "Critério: pacotes de escritório com e-mail, agenda e documentos, cobrados por usuário; o preço em reais acompanha o dólar. Valor por caixa.",
    },
    "imagens-banco-pago": {
      id: "imagens-banco-pago",
      label: "Banco de imagens pago",
      cobranca: "anual",
      primeiroAno: F(100, 1200),
      depois: F(100, 1200),
      base: "Critério: assinatura ou pacote de imagens para um site pequeno. Bancos gratuitos com licença comercial custam R$ 0 (confira a licença de cada imagem).",
    },
    "manut-freelancer": {
      id: "manut-freelancer",
      label: "Manutenção por freelancer",
      cobranca: "mensal",
      primeiroAno: F(100, 500),
      depois: F(100, 500),
      base: "Critério do CriaSite: plano mensal de atualizações, backup e pequenos ajustes para site pequeno. Varia com o que está incluído.",
    },
    "manut-agencia": {
      id: "manut-agencia",
      label: "Manutenção por agência",
      cobranca: "mensal",
      primeiroAno: F(300, 1500),
      depois: F(300, 1500),
      base: "Critério do CriaSite: contrato mensal de agência com atualizações, backup, suporte e horas de ajuste.",
    },
  },

  // Horas do SEU tempo para montar, sem escrever os textos. Em freelancer e agência: conversa, envio de material e revisões.
  horas: {
    ia: { "pagina-unica": F(6, 16), institucional: F(15, 40), blog: F(15, 40), loja: F(40, 100) },
    construtor: { "pagina-unica": F(4, 12), institucional: F(10, 30), blog: F(10, 30), loja: F(25, 70) },
    wordpress: { "pagina-unica": F(8, 20), institucional: F(20, 50), blog: F(20, 50), loja: F(40, 120) },
    freelancer: { "pagina-unica": F(3, 8), institucional: F(6, 15), blog: F(6, 15), loja: F(10, 25) },
    agencia: { "pagina-unica": F(3, 8), institucional: F(6, 15), blog: F(6, 15), loja: F(10, 25) },
  },
  horasTextos: { "pagina-unica": F(2, 5), institucional: F(5, 15), blog: F(5, 15), loja: F(8, 25) },
  horasMes: { ia: F(1, 4), construtor: F(1, 2), wordpress: F(2, 4), freelancer: F(1, 3), agencia: F(1, 3) },

  projeto: {
    freelancer: { "pagina-unica": F(800, 3000), institucional: F(1500, 6000), blog: F(1500, 6000), loja: F(3000, 12000) },
    agencia: { "pagina-unica": F(2500, 8000), institucional: F(5000, 20000), blog: F(5000, 20000), loja: F(10000, 40000) },
  },
  redacao: { "pagina-unica": F(300, 1000), institucional: F(600, 2500), blog: F(600, 2500), loja: F(800, 3000) },

  recursos: {
    formulario: {
      ia: { premissa: "ia-servico", horas: F(1, 3) },
      construtor: { horas: F(0, 1) },
      wordpress: { horas: F(1, 2) },
      freelancer: { projeto: F(0, 300) },
      agencia: { projeto: F(0, 1000) },
    },
    agendamento: {
      ia: { premissa: "ia-servico", horas: F(2, 6) },
      construtor: { premissa: "construtor-app", horas: F(1, 3) },
      wordpress: { premissa: "wp-plugin", horas: F(2, 5) },
      freelancer: { projeto: F(300, 1500) },
      agencia: { projeto: F(1000, 4000) },
    },
    pagamento: {
      ia: { horas: F(2, 6) },
      construtor: { horas: F(1, 3) },
      wordpress: { horas: F(2, 5) },
      freelancer: { projeto: F(300, 1500) },
      agencia: { projeto: F(1000, 4000) },
    },
    blog: {
      ia: { horas: F(4, 10), alerta: "ia-blog" },
      construtor: { horas: F(1, 3) },
      wordpress: { horas: F(1, 3) },
      freelancer: { projeto: F(300, 1500) },
      agencia: { projeto: F(1000, 4000) },
    },
    idiomas: {
      ia: { fatorHoras: true },
      construtor: { premissa: "construtor-app", fatorHoras: true },
      wordpress: { premissa: "wp-plugin", fatorHoras: true },
      freelancer: { projeto: F(800, 3000) },
      agencia: { projeto: F(2500, 8000) },
    },
    login: {
      ia: { premissa: "ia-servico", horas: F(20, 60), alerta: "ia-login" },
      construtor: { premissa: "construtor-app", horas: F(4, 10) },
      wordpress: { premissa: "wp-plugin", horas: F(6, 15) },
      freelancer: { projeto: F(2000, 8000) },
      agencia: { projeto: F(6000, 25000) },
    },
  },

  fatorGrandePct: F(150, 200),
  fatorIdiomasPct: F(130, 160),

  textosBase: {
    projeto:
      "Critério do CriaSite, sem pesquisa formal de mercado: faixa ampla para projeto simples no Brasil, com visual a partir de um modelo e sem sistema feito sob medida. Varia com a região, a experiência e o escopo: peça pelo menos 3 orçamentos com o mesmo pedido.",
    redacao: "Critério do CriaSite: redator contratado para escrever as páginas fixas do site (não inclui posts de blog).",
    horas: "Critério do CriaSite: horas de quem nunca fez um site desse tipo, contando aprender, montar, revisar e publicar. Quem já fez antes gasta menos.",
  },

  alertas: {
    "ia-loja": {
      chip: "Loja do zero: arriscado",
      texto: "Loja feita do zero com IA lida com pagamento, estoque e dados de clientes. Se você nunca fez isso, uma plataforma de loja pronta é mais segura.",
    },
    "ia-login": {
      chip: "Login do zero: arriscado",
      texto: "Área com login feita do zero exige banco de dados, senhas e cuidado com dados pessoais (LGPD). Para quem está começando, é o caminho mais arriscado.",
    },
    "ia-blog": {
      chip: "Posts exigem mais trabalho",
      texto: "Para publicar posts sem mexer no código, peça à IA um gerenciador de conteúdo; senão, cada post novo vira um pedido à IA.",
    },
    "construtor-saida": { chip: "Difícil de mudar depois", texto: "Levar o site para outro lugar depois costuma exigir refazer o site." },
    "wp-atualizacoes": {
      chip: "Atualizar todo mês",
      texto: "O WordPress pede atualização do tema e dos plugins todo mês. Sem isso, o site fica vulnerável.",
    },
    "contratar-escopo": {
      chip: "Combine o escopo por escrito",
      texto: "Peça o orçamento por escrito com o que está incluído (páginas, revisões, textos, prazo) e deixe domínio e hospedagem no seu nome.",
    },
  },

  avisos: {
    "sempre-faixa":
      "São faixas amplas, montadas com os critérios da tabela de premissas. Não é orçamento nem oferta: o preço de cada empresa muda e precisa ser conferido antes de contratar.",
    renovacao: "O 1º ano usa os preços de entrada, que costumam ter desconto. A coluna “por mês depois” usa o preço de renovação.",
    "taxa-venda": "Receber pagamento on-line tem taxa por venda, em geral alguns por cento do valor, que não entra nesta conta.",
    "dominio-tenho": "Você já tem domínio: a renovação dele continua, mas não entra nesta conta.",
    "banco-gratis": "Banco de imagens grátis: confira se a licença de cada imagem permite uso comercial.",
    grande: "Site grande: as faixas ficam mais largas. Vale pedir orçamento detalhado a quem for fazer.",
    fontes: "Fontes de licença livre não custam nada. Fonte comercial é paga à parte e não entra na conta.",
  },
};
