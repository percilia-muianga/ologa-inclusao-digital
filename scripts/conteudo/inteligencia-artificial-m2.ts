/**
 * Conteúdo original das quatro lições do módulo 2 do curso «Introdução à
 * Inteligência Artificial» — Uso Responsável da Inteligência Artificial.
 *
 * Todos os casos, nomes, instituições, pedidos, tabelas e números são
 * FICTÍCIOS e servem apenas de exercício. Não há pessoas reais, não há
 * estatísticas oficiais, não há casos reais de sucesso e não há conclusões
 * jurídicas. O conteúdo não está validado pela Ologa nem pela ATDI; o estado
 * editorial vive em docs/pontos-por-validar.md e não é exibido na plataforma.
 *
 * Este ficheiro vive fora de src/ para não entrar no pacote do navegador; é
 * lido apenas pelo seed (scripts/seed-inteligencia-artificial.ts).
 */

import type { ConteudoLicao, Referencia } from "./inteligencia-artificial-licoes";

const CONSULTA = "22 de Setembro de 2026";

const OECD: Referencia = {
  titulo: "OECD AI Principles — definição de sistema de inteligência artificial",
  url: "https://oecd.ai/en/ai-principles",
  consultadoEm: "21 de Setembro de 2026",
};
const NIST: Referencia = {
  titulo: "NIST AI Risk Management Framework — quadro voluntário de gestão de risco",
  url: "https://www.nist.gov/itl/ai-risk-management-framework",
  consultadoEm: "21 de Setembro de 2026",
};

/** Fonte europeia. Síntese original da equipa, escrita a partir da página. */
const UE: Referencia = {
  titulo:
    "Comissão Europeia — Regulatory framework for artificial intelligence (Regulamento Europeu de Inteligência Artificial)",
  url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
  consultadoEm: CONSULTA,
  resumo:
    "A página oficial da Comissão Europeia apresenta o quadro regulamentar europeu para a inteligência artificial. A ideia central é classificar os sistemas segundo o risco que representam para a segurança e para os direitos das pessoas: há usos considerados inaceitáveis, há sistemas de alto risco sujeitos a exigências mais fortes, e há usos de risco limitado a que se aplicam sobretudo deveres de transparência, como informar a pessoa de que está perante um sistema automático. Para os sistemas de alto risco a página descreve obrigações de qualidade dos dados, documentação, registo de funcionamento, informação ao utilizador, supervisão humana e robustez. A aplicação do regulamento é faseada no tempo, por etapas, e a própria página regista que esse calendário tem sido objecto de alterações; por isso não se deve afirmar que tudo já está em vigor. Para Moçambique isto é referência internacional de governação, e não lei aplicável: é legislação da União Europeia, estudada aqui como termo de comparação e fonte de boas práticas. Qualquer leitura jurídica cabe à área jurídica da instituição.",
};

/** Fonte da UNESCO. Síntese original da equipa. */
const UNESCO: Referencia = {
  titulo: "UNESCO — Recommendation on the Ethics of Artificial Intelligence",
  url: "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics",
  consultadoEm: CONSULTA,
  resumo:
    "A UNESCO publica uma Recomendação sobre a Ética da Inteligência Artificial, adoptada pelos Estados membros. Uma recomendação deste tipo é um instrumento normativo de referência: exprime compromissos assumidos entre Estados e orienta políticas públicas, mas não é, por si, lei nacional em país nenhum. Só passa a obrigar na medida em que cada país a transponha para o seu direito. O texto organiza-se em valores e princípios — respeito pelos direitos humanos e pela dignidade, proporcionalidade e não causar dano, equidade e não discriminação, transparência e explicabilidade, responsabilidade e prestação de contas, supervisão humana, sustentabilidade ambiental, privacidade e protecção de dados — e acrescenta áreas de acção prática, como avaliação de impacto ético, governação, política de dados, educação, género, cultura e ambiente. Para um serviço público moçambicano interessa sobretudo como lista de verificação: antes de adoptar um sistema, perguntar quem pode ser prejudicado, que dados são usados, quem responde pela decisão e como é que a pessoa afectada reclama.",
};

/** Fonte da União Africana. Síntese original da equipa. */
const UA: Referencia = {
  titulo: "União Africana — Continental Artificial Intelligence Strategy",
  url: "https://au.int/en/documents/20240809/continental-artificial-intelligence-strategy",
  consultadoEm: CONSULTA,
  resumo:
    "A União Africana disponibiliza uma Estratégia Continental para a Inteligência Artificial. Uma estratégia é um documento de orientação política: define prioridades comuns e propõe caminhos, sem criar obrigações directas para os serviços de cada país. O documento aborda o aproveitamento da inteligência artificial para o desenvolvimento do continente, a criação de capacidades — pessoas formadas, dados, infra-estrutura e capacidade de cálculo —, a atenção aos riscos e a governação, e a cooperação entre Estados africanos, incluindo a preocupação de que África participe na definição das regras internacionais e não apenas as receba. Para uma direcção distrital ou provincial, o valor prático está em situar decisões locais num quadro continental: quando se escolhe uma ferramenta, faz sentido perguntar onde ficam os dados, que dependência se cria face a um fornecedor estrangeiro, e se existe alternativa que desenvolva competências internas. Não se deve citar esta estratégia como se fosse legislação nem como aprovação de qualquer solução concreta.",
};

/** Fonte nacional. É uma PROPOSTA em consulta pública — não é lei aprovada. */
const INTIC: Referencia = {
  titulo:
    "INTIC — Consulta pública da proposta da Estratégia Nacional de Inteligência Artificial",
  url: "https://intic.gov.mz/consulta-publica-da-proposta-da-estrategia-nacional-de-inteligencia-artificial/",
  consultadoEm: CONSULTA,
  resumo:
    "O Instituto Nacional de Tecnologias de Informação e Comunicação, o INTIC, divulgou uma consulta pública sobre uma proposta de Estratégia Nacional de Inteligência Artificial. Há três coisas a reter, e a terceira é a mais importante para não se dizer nada de errado numa reunião. Primeira: trata-se de uma proposta submetida a consulta pública, isto é, um texto aberto a comentários. Segunda: consulta pública é precisamente o momento em que instituições, academia, empresas, sociedade civil e organizações de pessoas com deficiência podem enviar contributos. Terceira: a existência desta consulta não prova que exista estratégia aprovada, nem política aprovada, nem lei de inteligência artificial em vigor em Moçambique. Também não se deve inferir da consulta que o INTIC seja autoridade reguladora da inteligência artificial: o que a fonte mostra é a sua intervenção na condução deste processo de consulta. Quem precisar de saber o estado actual do processo deve consultar a fonte na data em que precisa da informação e citar essa data.",
};

// ---------------------------------------------------------------------------
// M2 L1 (lição 5 do curso) — Casos de uso no serviço público
// ---------------------------------------------------------------------------

const M2L1: ConteudoLicao = {
  objectivos: [
    "Descrever três casos de uso de inteligência artificial num serviço público e, para cada um, a alternativa sem inteligência artificial que resolveria o mesmo problema.",
    "Comparar, por escrito e numa tabela, um caso de uso com a sua alternativa sem inteligência artificial em seis critérios: custo, benefício esperado, impacto no trabalho das pessoas, língua, conectividade e dependência de fornecedor.",
    "Escrever uma instrução concreta que produza um resumo e uma proposta de triagem de pedidos, incluindo a proibição expressa de decidir sobre direitos.",
    "Executar, com a ferramenta institucional autorizada, no mínimo duas execuções por par, alternando quem escreve, verificando erros e tempo gasto e melhorando a instrução entre a primeira e a segunda.",
    "Decidir de forma fundamentada, no final, se o caso de uso escolhido deve ser recomendado, recomendado com condições ou desaconselhado.",
  ],
  explicacao: [
    "Nas quatro lições anteriores percebemos o que é um sistema de inteligência artificial e como se comporta. Esta lição faz a pergunta seguinte, que é a pergunta de gestão: neste serviço, para este problema, vale a pena? A resposta honesta é muitas vezes «não», e um curso sério tem de deixar isso dito logo no início. A inteligência artificial não é obrigatória, não é sinal de modernidade e não é, por si, melhoria de serviço.",
    "Comecemos pelos casos de uso onde estas ferramentas costumam ajudar no trabalho administrativo. Resumir documentos longos, para que uma pessoa leia depois o essencial e confirme na fonte. Rever e simplificar texto, incluindo produzir uma versão em linguagem simples de um aviso ao público. Propor a triagem de entradas, isto é, sugerir a que sector pertence cada pedido ou reclamação. Transcrever áudio em texto, o que tem valor de acessibilidade. Ajudar a procurar dentro de um acervo grande de documentos. Em todos, o padrão é o mesmo: a ferramenta propõe e a pessoa decide. Nenhum destes casos inclui decidir sobre direitos de ninguém.",
    "Agora a parte que costuma faltar nas apresentações: a alternativa sem inteligência artificial. Quase todos os problemas do balcão têm mais do que um caminho. Se os pedidos chegam mal preenchidos, a alternativa pode ser mudar o formulário, dar um exemplo preenchido, ou pôr uma pessoa a conferir à entrada. Se a triagem é lenta, a alternativa pode ser uma lista de palavras-chave e uma regra escrita de encaminhamento — que é automação simples, auditável e que qualquer técnico compreende. Se ninguém lê os relatórios, a alternativa pode ser exigir que cada relatório traga um sumário de dez linhas escrito por quem o produz. Comparar sempre o caso de uso com a alternativa evita comprar um problema novo para resolver um problema antigo.",
    "A comparação faz-se em critérios concretos. Custo: licenças, formação, tempo de preparação e tempo de verificação, que é um custo real e costuma ser esquecido. Benefício esperado: o que melhora, para quem, e como se mede. Impacto no trabalho das pessoas: que tarefas mudam, quem fica a fazer o quê, e se alguém fica a fazer apenas correcção de saídas — o que desqualifica o trabalho em vez de o melhorar. Língua: a qualidade não é igual em todas as línguas, e num país onde muita gente é atendida em línguas moçambicanas isto não é detalhe. Conectividade: uma ferramenta que só funciona com ligação estável falha exactamente nos serviços que mais precisam de apoio. Dependência de fornecedor: se o serviço passa a depender de um produto, o que acontece se o preço subir, se o produto mudar ou se for descontinuado, e é possível exportar o que lá está?",
    "Sobre triagem, uma advertência que vale para o resto do curso. Propor a que sector vai um pedido é diferente de decidir se o pedido é deferido. A primeira é uma sugestão de encaminhamento interno, corrigível e sem efeito sobre a pessoa; a segunda afecta direitos e não se delega a uma ferramenta destas. A instrução que vamos escrever hoje diz isso por escrito, e diz também que, quando a informação necessária não constar do pedido, a saída deve escrever «não consta» em vez de adivinhar.",
    "Por fim, o enquadramento da prática. Usa-se uma ferramenta de inteligência artificial institucional, previamente autorizada pela entidade, com contas e acessos preparados pelo formador antes da sessão. Ninguém cria conta pessoal, ninguém paga, e não se promete que qualquer ferramenta seja gratuita. Os pedidos com que vamos trabalhar são sintéticos — escritos para esta aula — e nenhum dado real de pessoa, processo ou serviço entra na ferramenta. Se a ferramenta não estiver disponível no dia, faz-se a análise documental com as saídas exemplificativas etiquetadas como simuladas, e regista-se que a prática com ferramenta ficou pendente, a reagendar. Uma simulação em papel não substitui a prática real e não se escreve, em documento nenhum, que a prática foi realizada.",
  ],
  exemplo: {
    titulo: "Caso fictício — a fila de pedidos da Direcção Distrital de Muanzo",
    corpo: [
      "A Direcção Distrital Fictícia de Muanzo recebe, por semana, cerca de sessenta pedidos escritos no balcão e por correio electrónico. Tudo o que se segue é inventado para esta aula.",
      "Os pedidos chegam misturados: licenças de ocupação, reclamações sobre atendimento, pedidos de certidão e assuntos que pertencem a outra instituição. Uma técnica lê tudo às segundas-feiras e distribui pelos sectores. Nas semanas de maior movimento, a distribuição atrasa dois a três dias e há pedidos que voltam para trás por terem sido encaminhados para o sector errado.",
      "A direcção estuda duas hipóteses. A primeira é usar um assistente de escrita institucional para produzir, de cada pedido, um resumo de três linhas e uma proposta de sector, que a técnica confirma. A segunda é não usar inteligência artificial: criar um formulário de entrada com cinco opções de assunto, afixar um cartaz com exemplos e formar duas pessoas do balcão para encaminhar no próprio dia.",
      "Nenhuma das duas é obviamente melhor. A primeira poupa leitura mas acrescenta verificação e cria dependência de um produto; a segunda é barata e transparente mas exige disciplina no balcão e não ajuda nos pedidos que chegam por correio electrónico em texto livre. A decisão é da direcção, e tem de ser fundamentada. É isso que vamos treinar.",
    ],
  },
  tabela: {
    titulo: "Ficha de trabalho — grelha de comparação, a preencher pelo grupo",
    nota:
      "Grelha fictícia de trabalho. As duas colunas da direita ficam em branco e são preenchidas pelo grupo, com uma ou duas frases por célula.",
    colunas: [
      "Critério",
      "Pergunta a responder",
      "Caso de uso com inteligência artificial",
      "Alternativa sem inteligência artificial",
    ],
    linhas: [
      ["Custo", "Que custos aparecem no primeiro ano, incluindo o tempo de verificação?", "", ""],
      ["Benefício esperado", "O que melhora, para quem, e como se mede daqui a três meses?", "", ""],
      ["Impacto no trabalho", "Que tarefas mudam e quem passa a fazer o quê?", "", ""],
      ["Língua", "Funciona com os textos tal como as pessoas os escrevem, e nas línguas em que são atendidas?", "", ""],
      ["Conectividade", "O que acontece num dia sem internet ou com internet fraca?", "", ""],
      ["Dependência de fornecedor", "Se o produto mudar, subir de preço ou acabar, o serviço consegue continuar e levar o que é seu?", "", ""],
    ],
  },
  anexos: [
    {
      titulo: "Anexo A — cinco pedidos sintéticos, texto completo",
      nota:
        "Pedidos inteiramente inventados para esta aula. Nenhuma pessoa, morada, número ou processo é real. É este o texto que se dá à ferramenta, e apenas este.",
      corpo: [
        "Pedido 1. «Bom dia. Venho pedir licença para colocar uma banca de venda de fruta no mercado de Muanzo, junto à entrada principal. Chamo-me Joana Fictícia Cumbe. Já entreguei a fotocópia do documento de identificação no mês passado, mas disseram-me que faltava a declaração da administração do mercado. Junto agora essa declaração. Peço deferimento.»",
        "Pedido 2. «Escrevo para reclamar do atendimento de sexta-feira. Cheguei às doze e trinta e o balcão já estava fechado, embora o aviso na porta diga treze horas. Perdi o dia de trabalho e a viagem. Peço que verifiquem o horário praticado.»",
        "Pedido 3. «Solicito certidão comprovativa de que a minha banca está registada desde dois mil e vinte e três, para apresentar ao banco. Não sei qual é o número do processo.»",
        "Pedido 4. «Venho na sequência da notificação que recebi sobre documentos em falta. Não consigo obter a declaração pedida porque o serviço que a emite está a funcionar apenas às terças-feiras e nesse dia trabalho. Peço prazo adicional e informação sobre se posso entregar por um familiar.»",
        "Pedido 5. «Queremos saber quando é que a estrada que passa atrás do mercado vai ser reparada, porque com as chuvas ninguém chega às bancas. Assinam quinze comerciantes.»",
      ],
    },
    {
      titulo: "Anexo B — regras de triagem em vigor, fictícias",
      nota:
        "Regras inventadas para esta aula. São estas, e só estas, as opções de encaminhamento admitidas no exercício.",
      corpo: [
        "Sector 1 — Licenciamento: pedidos de licença, renovações e entrega de documentos em falta relativos a licenças.",
        "Sector 2 — Atendimento e reclamações: queixas sobre horário, tratamento, filas ou informação prestada no balcão.",
        "Sector 3 — Certidões e arquivo: pedidos de certidão, comprovativos e consulta de processos antigos.",
        "Sector 4 — Fora da competência desta direcção: assuntos de obras, estradas, energia, água ou de outra instituição. Encaminhar com ofício e informar quem pediu.",
        "Regra transversal 1: quando o pedido não indicar informação necessária, como o número de processo, escreve-se «não consta». Não se adivinha e não se preenche.",
        "Regra transversal 2: a proposta de sector é uma sugestão interna. A decisão de deferir, indeferir, conceder prazo ou aplicar qualquer consequência é sempre de pessoa competente e nunca é pedida à ferramenta.",
      ],
    },
    {
      titulo: "Anexo C — instrução concreta a usar na primeira execução",
      nota:
        "Instrução escrita para esta aula. Copia-se tal e qual na primeira execução; a segunda execução usa a versão melhorada pelo par.",
      corpo: [
        "«Vais receber cinco pedidos escritos por munícipes, que são fictícios. Para cada pedido produz exactamente três coisas: primeiro, um resumo de duas linhas, em português simples, que não acrescente nada que não esteja no texto; segundo, uma proposta de sector, escolhida apenas de entre estas quatro opções — Licenciamento, Atendimento e reclamações, Certidões e arquivo, Fora da competência desta direcção; terceiro, a lista da informação necessária que falta no pedido.",
        "Regras obrigatórias. Se alguma informação não constar do pedido, escreve «não consta» e não inventes. Não decidas se o pedido é deferido ou indeferido, não proponhas sanções, não indiques prazos legais e não cites legislação: essas decisões são de pessoa competente. Não acrescentes nomes, números, datas ou moradas que não estejam no texto. Apresenta o resultado em tabela com as colunas: número do pedido, resumo, sector proposto, informação em falta.»",
      ],
    },
    {
      titulo: "Anexo D — saída exemplificativa, ETIQUETADA COMO SIMULADA",
      nota:
        "SAÍDA SIMULADA. Texto escrito pela equipa para servir de exemplo. Não foi produzido por nenhuma ferramenta de inteligência artificial e não representa o desempenho de nenhum produto concreto. Usa-se apenas no caminho alternativo, quando não houver ferramenta disponível.",
      corpo: [
        "Pedido 1 — Resumo: requerente entrega declaração da administração do mercado que faltava no processo de licença de banca. Sector proposto: Licenciamento. Informação em falta: número do processo — não consta.",
        "Pedido 2 — Resumo: reclamação sobre encerramento do balcão antes da hora afixada, na sexta-feira. Sector proposto: Atendimento e reclamações. Informação em falta: data exacta — não consta.",
        "Pedido 3 — Resumo: pedido de certidão de registo de banca desde 2023, para apresentar a instituição bancária. Sector proposto: Licenciamento. Informação em falta: nenhuma.",
        "Pedido 4 — Resumo: requerente pede prorrogação de prazo por dificuldade em obter declaração e pergunta se pode entregar por terceiro. Sector proposto: Licenciamento. Informação em falta: nenhuma. Observação: o prazo de trinta dias deve ser concedido.",
        "Pedido 5 — Resumo: quinze comerciantes pedem informação sobre reparação da estrada junto ao mercado. Sector proposto: Atendimento e reclamações. Informação em falta: nenhuma.",
      ],
    },
  ],
  actividade: {
    formato:
      "em pares, com os anexos em papel; a prática assistida faz-se ao computador, no máximo duas pessoas por posto, alternando quem escreve",
    enunciado: [
      "Parte A, sem computador. Escolham um caso de uso realista para o vosso serviço, em uma frase, e escrevam ao lado a alternativa sem inteligência artificial que resolveria o mesmo problema.",
      "Parte B, sem computador. Preencham a grelha de comparação nos seis critérios, para o caso escolhido e para a alternativa. Uma ou duas frases por célula. Onde não souberem, escrevam «não sabemos» e indiquem a quem é que teriam de perguntar.",
      "Parte C. Leiam os cinco pedidos do anexo A e as regras do anexo B. Sem ferramenta, escrevam à mão qual seria a triagem correcta de cada pedido e que informação falta. Guardem esta folha: é o vosso padrão de comparação.",
      "Parte D, prática assistida ao computador, se a ferramenta institucional estiver disponível. Primeira execução: copiem a instrução do anexo C e os cinco pedidos do anexo A. Registem a saída. Comparem-na com a vossa folha da parte C e anotem todos os erros: sector errado, informação inventada, decisão sobre direitos que a instrução proibia, campos que deviam dizer «não consta». Anotem o tempo gasto na verificação.",
      "Parte E. Troquem quem escreve. Melhorem a instrução do anexo C acrescentando pelo menos três elementos que corrijam os erros observados. Façam a segunda execução com a instrução melhorada e repitam a comparação e o registo do tempo.",
      "Parte F. Escrevam a decisão final em duas ou três frases: o caso de uso da parte A é para recomendar, recomendar com condições, ou desaconselhar? Se for com condições, digam quais. A decisão tem de se apoiar na grelha da parte B e nos registos das partes D e E, e não na impressão de qualidade do texto.",
      "Não se escreve na ferramenta nenhum dado real de pessoa, serviço ou processo. Usam-se exclusivamente os textos fictícios dos anexos A, B e C.",
    ],
    produto:
      "Uma ficha por par com: o caso de uso e a alternativa da parte A; a grelha da parte B preenchida nos seis critérios para as duas colunas; a triagem manual da parte C; o registo das duas execuções, com erros encontrados e tempo de verificação; a instrução melhorada com os acréscimos assinalados; e a decisão fundamentada da parte F. Não havendo ferramenta, a ficha traz a marcação «prática com ferramenta: PENDENTE — a reagendar» no lugar das partes D e E.",
    rubrica: [
      "A alternativa sem inteligência artificial é real e resolveria mesmo o problema enunciado, e não uma alternativa de fachada.",
      "Os seis critérios preenchidos nas duas colunas, com o custo de verificação contado como custo e a dependência de fornecedor respondida em termos de saída do produto.",
      "Na triagem manual da parte C: pedido 1 para Licenciamento, pedido 2 para Atendimento e reclamações, pedido 3 para Certidões e arquivo, pedido 4 para Licenciamento, pedido 5 para Fora da competência desta direcção. No pedido 1 e no pedido 3 a informação em falta é o número do processo, que não consta.",
      "Os erros da saída são identificados por confronto com a folha da parte C e não por impressão. Na saída exemplificativa do anexo D, os erros plantados são três: o pedido 3 encaminhado para Licenciamento quando é Certidões e arquivo; o pedido 5 encaminhado para Atendimento e reclamações quando está fora da competência desta direcção; e, no pedido 4, a frase sobre conceder trinta dias, que é uma decisão sobre direitos expressamente proibida pela instrução.",
      "A instrução melhorada acrescenta três ou mais elementos identificados, e pelo menos um deles responde a um erro efectivamente observado.",
      "Duas execuções registadas, com alternância efectiva de quem escreve e com o tempo de verificação anotado em cada uma; ou, não havendo ferramenta, prática marcada como pendente de forma explícita.",
      "A decisão da parte F é fundamentada nos registos e admite a hipótese de desaconselhar.",
    ],
  },
  pratica: {
    titulo: "Resumir e triar cinco pedidos sintéticos com uma ferramenta institucional autorizada",
    objectivo:
      "Observar, com duas execuções e uma melhoria de instrução pelo meio, o que a ferramenta acerta, o que erra e quanto tempo custa verificar — sem lhe entregar qualquer decisão sobre direitos.",
    preRequisitos: [
      "Ferramenta de inteligência artificial institucional, previamente autorizada por escrito pela entidade para uso em formação.",
      "Contas, acessos e permissões criados pelo formador antes da sessão. Nenhuma pessoa formanda cria conta pessoal, regista número de telemóvel ou introduz meio de pagamento.",
      "Confirmação, pelo formador, de que a ferramenta está acessível a partir da rede da sala no dia da sessão.",
      "Cópias impressas dos anexos A, B e C e da folha de registo, em número suficiente.",
      "Regra escrita e afixada: só entram na ferramenta os textos fictícios dos anexos A, B e C.",
    ],
    passos: [
      "Abrir a ferramenta com a conta institucional preparada pelo formador.",
      "Primeira execução: colar a instrução do anexo C seguida dos cinco pedidos do anexo A. Guardar ou copiar a saída para a ficha.",
      "Comparar a saída com a triagem manual feita na parte C e anotar cada erro, indicando o tipo: sector errado, informação acrescentada que não está no pedido, campo que devia dizer «não consta», ou decisão sobre direitos que a instrução proibia.",
      "Anotar o tempo gasto na verificação desta execução.",
      "Trocar a pessoa que escreve.",
      "Segunda execução: usar a instrução melhorada pelo par sobre os mesmos cinco pedidos. Guardar a saída.",
      "Comparar de novo, anotar erros e tempo de verificação, e registar se a melhoria da instrução reduziu, manteve ou aumentou os erros.",
      "Fechar a sessão da ferramenta e não guardar nada fora da ficha de trabalho.",
    ],
    registo: [
      "Qual a instrução usada em cada execução e quem escreveu.",
      "Lista dos erros encontrados por execução, classificados pelos quatro tipos.",
      "Tempo de verificação em cada execução.",
      "Comparação entre a primeira e a segunda execução: o que melhorou e o que não melhorou.",
      "Decisão final sobre o caso de uso: recomendar, recomendar com condições, ou desaconselhar.",
      "Nenhuma captura de ecrã que mostre nomes de conta, endereços de correio electrónico ou identificadores da instituição.",
    ],
    contingencia: [
      "Se a ferramenta institucional não estiver disponível ou não estiver autorizada, a lição faz-se apenas em análise documental, usando o anexo D, que está etiquetado como saída simulada.",
      "Nesse caso cumprem-se as partes A, B, C e F, e as partes D e E não se executam. A simulação em papel não substitui a prática real.",
      "Na ficha e no registo da sessão escreve-se, literalmente, «prática com ferramenta: PENDENTE — a reagendar». Não se escreve, em documento nenhum, que a prática foi realizada.",
      "O formador propõe uma data de reagendamento dentro do horário replaneado do curso e comunica-a à coordenação.",
      "As saídas exemplificativas permanecem identificadas como simuladas em todos os documentos e não podem ser apresentadas como resultado de nenhuma ferramenta.",
    ],
  },
  sintese: [
    "Antes de escolher inteligência artificial, escreva a alternativa sem inteligência artificial.",
    "Compare as duas em seis pontos: custo, benefício, trabalho das pessoas, língua, internet e dependência do fornecedor.",
    "O tempo de verificar as saídas é um custo. Conte-o.",
    "A ferramenta pode propor a que sector vai um pedido. Não pode decidir sobre direitos de ninguém.",
    "Quando falta informação, a saída deve escrever «não consta». Não deve adivinhar.",
    "Se a ferramenta só funciona com boa internet, pergunte o que acontece nos dias sem internet.",
    "Pergunte sempre se consegue levar os seus dados se mudar de fornecedor.",
    "Nesta aula só entram na ferramenta textos inventados. Nunca dados reais de pessoas.",
    "Se a ferramenta não estiver disponível, escreve-se que a prática ficou pendente. Não se diz que foi feita.",
  ],
  verificacao: [
    {
      pergunta:
        "Um colega apresenta a proposta assim: «com inteligência artificial a triagem passa de três dias para meio dia». Que perguntas faz antes de concordar, e qual é a alternativa que exige ver?",
      resposta:
        "Pergunto quanto custa no primeiro ano, incluindo o tempo que alguém passa a verificar as saídas; que tarefas mudam e para quem; se funciona com os textos tal como as pessoas os escrevem; o que acontece num dia sem internet; e se conseguimos sair do fornecedor levando o que é nosso. E exijo ver a alternativa sem inteligência artificial — por exemplo formulário de entrada com opções de assunto e regra escrita de encaminhamento — comparada nos mesmos critérios.",
      feedback:
        "A comparação com a alternativa é o que transforma uma apresentação numa decisão fundamentada. Sem ela, está-se a escolher entre a proposta e nada.",
    },
    {
      pergunta:
        "Na saída da ferramenta aparece, para o pedido 4, a frase «o prazo de trinta dias deve ser concedido». A instrução proibia isso. Qual é o problema e o que faz?",
      resposta:
        "O problema é que conceder prazo é uma decisão sobre direitos do requerente, reservada a pessoa competente, e a instrução proibia expressamente decisões desse tipo. Retiro a frase da saída, registo o erro na folha como decisão sobre direitos, e na instrução melhorada reforço a proibição, por exemplo exigindo que a coluna de observações fique vazia sempre que a observação implicar uma decisão.",
      feedback:
        "Este erro é dos mais perigosos porque a frase parece útil e inofensiva. Se passar para o processo, fica no documento como se fosse orientação do serviço.",
    },
  ],
  referencias: [OECD, NIST, UNESCO, UA],
  guiao: {
    preparacao: [
      "Confirmar, com a entidade, se existe ferramenta de inteligência artificial institucional autorizada para esta sessão, e obter essa autorização por escrito antes do dia.",
      "Criar previamente contas e acessos e testar a partir da rede da sala. Nenhuma pessoa formanda cria conta, regista telemóvel ou introduz meio de pagamento.",
      "Imprimir os anexos A, B e C, a grelha de comparação e a folha de registo, um conjunto por par, com letra grande. Imprimir o anexo D apenas se for preciso o caminho alternativo.",
      "Afixar na sala a regra: só entram na ferramenta os textos fictícios dos anexos.",
      "Preparar o caminho alternativo desde já, mesmo que a ferramenta pareça disponível, e ter em mente uma data possível de reagendamento dentro do horário replaneado.",
    ],
    conducao: [
      "Apresentar os objectivos e pedir a duas pessoas que digam uma tarefa do seu serviço que gostariam de ver apoiada. Escrever as duas no quadro e voltar a elas no fim.",
      "Expor os casos de uso onde estas ferramentas apoiam; a obrigação de comparar com a alternativa sem inteligência artificial; os seis critérios, insistindo no custo de verificação, na língua, na conectividade e na dependência de fornecedor; e a diferença entre propor encaminhamento e decidir sobre direitos. Apresentar o caso de Muanzo e ler com a turma o anexo B.",
      "Lançar a actividade. Partes A, B e C em papel, primeiros 25 minutos. Partes D e E ao computador, 25 minutos, com troca obrigatória de quem escreve entre as duas execuções. Parte F nos últimos 10 minutos. Se a ferramenta não estiver disponível, anunciá-lo no início, usar o anexo D, alargar o tempo das partes B e C e registar a prática como pendente.",
      "Chamar dois grupos, quatro minutos cada: um apresenta a grelha de comparação, outro apresenta os erros encontrados e a instrução melhorada. Recolher as fichas restantes. Fechar confirmando a triagem correcta dos cinco pedidos e regressando às duas tarefas escritas no quadro no início, perguntando se hoje as recomendariam.",
    ],
    criterios: [
      "Grelha preenchida nos seis critérios, nas duas colunas.",
      "Triagem manual correcta em pelo menos quatro dos cinco pedidos, com «não consta» usado onde é devido.",
      "Erros da saída identificados por confronto com a folha da parte C e classificados.",
      "Instrução melhorada com três ou mais acréscimos identificados, um deles respondendo a erro observado.",
      "Duas execuções com alternância efectiva, ou prática explicitamente marcada como pendente.",
      "Decisão final fundamentada, admitindo desaconselhar.",
    ],
    errosComuns: [
      "Escrever uma alternativa de fachada, que ninguém consideraria a sério, só para justificar a escolha da ferramenta.",
      "Esquecer o tempo de verificação na coluna do custo.",
      "Confundir propor sector com decidir o pedido.",
      "Não notar a frase do pedido 4 sobre conceder prazo, por parecer razoável.",
      "Encaminhar o pedido 5 para reclamações em vez de o reconhecer fora da competência da direcção.",
      "Deixar a mesma pessoa executar as duas execuções.",
      "Descrever a análise documental com o anexo D como prática realizada.",
    ],
  },
};

// ---------------------------------------------------------------------------
// M2 L2 (lição 6 do curso) — Protecção de dados e privacidade
// ---------------------------------------------------------------------------

const M2L2: ConteudoLicao = {
  objectivos: [
    "Decidir, para cada campo de um formulário fictício, se deve ser mantido, minimizado, agregado ou removido, justificando cada decisão pela finalidade declarada.",
    "Escrever, para os campos mantidos, a finalidade, quem tem acesso, o prazo de retenção e o destino no fim do prazo.",
    "Explicar a diferença entre pseudonimização e anonimização e dar um exemplo concreto de reidentificação a partir de dados pseudonimizados.",
    "Desenhar o fluxo de dados do formulário fictício, indicando onde os dados entram, por onde passam, onde ficam guardados e quem os vê fora do serviço.",
    "Identificar, no caso fictício, três riscos de privacidade concretos e propor para cada um uma medida verificável.",
  ],
  explicacao: [
    "Antes de qualquer coisa, uma advertência jurídica honesta, porque é aqui que se erra com mais facilidade. Neste curso não se afirma que exista, nem que não exista, uma determinada lei moçambicana de protecção de dados aprovada e em vigor, nem se cita nenhum diploma nacional. Não é matéria que se possa resolver de memória numa sala de formação, e uma afirmação errada sobre legislação tem consequências. O que se ensina aqui são boas práticas de tratamento de dados, que são úteis em qualquer enquadramento. Sempre que a decisão tiver implicações jurídicas, quem responde é a área jurídica da instituição, consultando a legislação aplicável na data em que decide.",
    "Dito isto, comecemos pelo princípio mais poderoso e mais barato: a minimização. Só se recolhe o que é preciso para a finalidade declarada. Parece óbvio e é sistematicamente violado, porque os formulários crescem por acumulação — alguém achou útil um campo, ninguém o retirou, e dez anos depois o serviço recolhe estado civil para emitir uma certidão de banca. Cada campo a mais é trabalho a mais para quem preenche, risco a mais para quem é titular dos dados e responsabilidade a mais para o serviço. A pergunta de controlo é sempre a mesma: se este campo ficar em branco, que decisão deixa de ser possível? Se a resposta for «nenhuma», o campo sai.",
    "Há três alternativas intermédias entre manter e remover. Minimizar é reduzir o detalhe: em vez da data de nascimento completa, o ano; em vez da morada exacta, o bairro; em vez do rendimento em meticais, um escalão. Agregar é deixar de guardar linha a linha e passar a guardar contagens: em vez da lista de quem reclamou, o número de reclamações por mês e por sector. Separar é guardar em sítios diferentes o que só junto identifica a pessoa. Estas três decisões resolvem a maior parte dos casos sem prejudicar o serviço, porque a maioria dos usos internos é estatística e não precisa de saber de quem se trata.",
    "Quatro perguntas acompanham cada campo que se decide manter. Para que serve, em concreto — e «para análise futura» não é finalidade, é adiar a decisão. Quem tem acesso, por nome de função e não por «o serviço». Durante quanto tempo se guarda, com um prazo escrito. E o que acontece no fim: apaga-se, ou fica só a versão agregada? Um serviço que não sabe responder a estas quatro perguntas não controla os dados que tem, mesmo que os tenha em pastas bem arrumadas.",
    "Agora a distinção que mais confusão causa. Pseudonimizar é substituir o identificador directo por um código, guardando em separado a tabela que liga o código à pessoa. Os dados continuam a ser dados pessoais: com a tabela, volta-se à pessoa em segundos. Anonimizar é tornar a reidentificação razoavelmente impossível, mesmo com esforço e mesmo cruzando com outras fontes — o que normalmente obriga a perder detalhe, agregando ou suprimindo. Chamar «anonimizado» a um ficheiro apenas pseudonimizado é o erro mais comum e o mais consequente, porque leva a partilhar com terceiros um ficheiro que ainda identifica pessoas.",
    "A reidentificação nem precisa da tabela de códigos. Basta a combinação de campos. Numa localidade pequena, «mulher, 34 anos, bairro X, banca de peixe, reclamação sobre o fiscal Y em Março» identifica uma pessoa para quem trabalha ali, mesmo sem nome. É o que se chama quase-identificador: campos que, isolados, não identificam ninguém e, juntos, identificam uma pessoa só. Por isso a decisão sobre um campo nunca se toma olhando para esse campo sozinho; toma-se olhando para o conjunto e perguntando quantas pessoas, naquele universo, partilham aquela combinação.",
    "Falta o fluxo. Os dados raramente ficam onde entram: passam por um formulário em papel, por uma folha de cálculo no computador do balcão, por uma cópia enviada por correio electrónico para a província, por uma pasta partilhada e, às vezes, por uma ferramenta externa. Cada passagem é um ponto de risco e cada cópia é uma cópia que alguém tem de saber apagar. Desenhar o fluxo numa folha, com setas, é o exercício mais simples e mais revelador desta lição: é quase certo que apareça pelo menos uma cópia que ninguém tinha em mente. E, a propósito de ferramentas de inteligência artificial: escrever dados pessoais numa ferramenta externa é uma passagem do fluxo como outra qualquer, que exige autorização expressa da instituição e saber onde os dados ficam. Neste curso, nunca se faz.",
  ],
  exemplo: {
    titulo: "Caso fictício — o formulário de reclamação do balcão de Muanzo",
    corpo: [
      "A Direcção Distrital Fictícia de Muanzo usa, desde há anos, um formulário de reclamação com dezasseis campos. Tudo o que se segue é inventado para esta aula.",
      "A finalidade declarada do formulário é uma só, e está escrita no topo: «registar a reclamação, responder ao reclamante e melhorar o atendimento». Mais nada. Não há finalidade estatística declarada, não há finalidade de fiscalização e não há finalidade de estudo.",
      "O formulário em papel é preenchido no balcão. Uma técnica copia tudo para uma folha de cálculo no computador do atendimento. Uma vez por mês envia essa folha, completa, por correio electrónico, para a direcção provincial, que pediu «os dados das reclamações». Os papéis ficam num armário sem chave, junto à fotocopiadora, e nunca foram destruídos. Ninguém sabe dizer durante quanto tempo se guardam.",
      "Há duas semanas, uma reclamante perguntou ao balcão porque é que tinha de indicar o estado civil para se queixar de um horário. Ninguém soube responder. É uma boa pergunta, e é por aí que vamos começar.",
    ],
  },
  tabela: {
    titulo: "Ficha de trabalho — os dezasseis campos do formulário fictício",
    nota:
      "Formulário inteiramente inventado para esta aula. As duas colunas da direita ficam em branco: o grupo escreve a decisão — manter, minimizar, agregar ou remover — e a justificação, sempre por referência à finalidade declarada.",
    colunas: ["N.º", "Campo", "Exemplo de valor", "Decisão", "Justificação pela finalidade"],
    linhas: [
      ["1", "Nome completo", "Joana Fictícia Cumbe", "", ""],
      ["2", "Número de documento de identificação", "000000000A", "", ""],
      ["3", "Data de nascimento completa", "14/03/1991", "", ""],
      ["4", "Sexo", "Feminino", "", ""],
      ["5", "Estado civil", "Casada", "", ""],
      ["6", "Número de filhos", "3", "", ""],
      ["7", "Morada exacta", "Bairro Fictício 3, casa 214, Muanzo", "", ""],
      ["8", "Telefone de contacto", "8X XXX XXXX", "", ""],
      ["9", "Correio electrónico", "não indicado", "", ""],
      ["10", "Profissão", "Comerciante", "", ""],
      ["11", "Rendimento mensal declarado", "9 500 MT", "", ""],
      ["12", "Assunto da reclamação", "Horário de atendimento", "", ""],
      ["13", "Descrição da reclamação", "Texto livre escrito pela pessoa", "", ""],
      ["14", "Data e hora do atendimento reclamado", "18/09, 12h30", "", ""],
      ["15", "Nome do funcionário que atendeu", "Indicado pela reclamante", "", ""],
      ["16", "Fotocópia do documento de identificação anexada", "Sim", "", ""],
    ],
  },
  anexos: [
    {
      titulo: "Anexo A — quatro perguntas obrigatórias por campo mantido",
      nota: "Grelha de trabalho. Preenche-se apenas para os campos que o grupo decidir manter.",
      corpo: [
        "Finalidade: que decisão concreta do serviço deixa de ser possível se este campo ficar em branco?",
        "Acesso: que funções, nomeadas, precisam de ver este campo? Quem não precisa não deve conseguir ver.",
        "Retenção: durante quanto tempo se guarda, contado a partir de que momento?",
        "Destino no fim do prazo: elimina-se em papel e em ficheiro, ou fica apenas uma versão agregada sem identificação?",
      ],
    },
    {
      titulo: "Anexo B — extracto fictício de ficheiro «anonimizado»",
      nota:
        "Extracto inventado para esta aula. Foi entregue a um estagiário como sendo «um ficheiro anonimizado». Serve para o exercício de reidentificação.",
      corpo: [
        "R-0041 | mulher | 34 anos | Bairro Fictício 3 | comerciante de peixe | reclamação sobre fiscalização de banca | 12 de Março",
        "R-0042 | homem | 51 anos | Bairro Fictício 1 | motorista | reclamação sobre horário | 12 de Março",
        "R-0043 | mulher | 29 anos | Bairro Fictício 3 | comerciante de peixe | reclamação sobre horário | 14 de Março",
        "R-0044 | homem | 63 anos | Bairro Fictício 7 | reformado | reclamação sobre informação prestada | 15 de Março",
        "R-0045 | mulher | 34 anos | Bairro Fictício 3 | comerciante de peixe | reclamação sobre fiscalização de banca | 20 de Março",
      ],
    },
    {
      titulo: "Anexo C — o fluxo actual, tal como foi descrito no serviço",
      nota:
        "Descrição fictícia do circuito actual. É este o fluxo que o grupo vai desenhar e criticar.",
      corpo: [
        "1. Formulário em papel, preenchido no balcão pela pessoa reclamante, com fotocópia do documento de identificação agrafada.",
        "2. Cópia manual dos dezasseis campos para uma folha de cálculo guardada no computador do atendimento, sem palavra-passe própria.",
        "3. Envio mensal da folha completa, por correio electrónico, para a direcção provincial.",
        "4. Cópia dessa folha guardada também numa pasta partilhada da direcção, acessível a todas as repartições.",
        "5. Papéis arquivados num armário sem chave, junto à fotocopiadora, sem prazo de eliminação.",
        "6. Ocasionalmente, um técnico copia excertos de reclamações para uma mensagem de correio electrónico pessoal, para «tratar em casa».",
      ],
    },
  ],
  actividade: {
    formato: "em grupos de três, apenas com papel; não é necessário computador nesta lição",
    enunciado: [
      "Parte A. Percorram os dezasseis campos da tabela e escrevam, para cada um, a decisão — manter, minimizar, agregar ou remover — e a justificação por referência à finalidade declarada. A pergunta de controlo é: se este campo ficar em branco, que decisão do serviço deixa de ser possível?",
      "Parte B. Para cada campo que decidiram manter, preencham as quatro perguntas do anexo A: finalidade, acesso por função nomeada, prazo de retenção e destino no fim do prazo.",
      "Parte C. Leiam o anexo B. Identifiquem que linhas podem corresponder à mesma pessoa e expliquem com que combinação de campos chegaram lá. Escrevam depois, em duas frases, porque é que este ficheiro não está anonimizado.",
      "Parte D. Desenhem numa folha o fluxo do anexo C, com setas e caixas, marcando com um círculo cada ponto em que existe uma cópia dos dados. Contem as cópias.",
      "Parte E. Escolham três riscos concretos do fluxo desenhado e proponham, para cada um, uma medida verificável — isto é, uma medida que outra pessoa possa confirmar que foi cumprida, com um prazo e um responsável por função.",
    ],
    produto:
      "Uma ficha por grupo com: a tabela dos dezasseis campos decidida e justificada; a grelha das quatro perguntas para os campos mantidos; a resposta de reidentificação da parte C; o desenho do fluxo com as cópias marcadas e contadas; e os três riscos com as medidas verificáveis.",
    rubrica: [
      "Pelo menos os campos 5, 6 e 11 — estado civil, número de filhos e rendimento — são removidos, com justificação de que nenhuma decisão do serviço depende deles face à finalidade declarada.",
      "O campo 3 é minimizado, por exemplo para escalão etário, e o campo 7 é minimizado para bairro, em vez de morada exacta.",
      "O campo 16, a fotocópia do documento de identificação, é removido ou substituído por conferência presencial sem guardar cópia; guardar a fotocópia não é necessário para responder a uma reclamação.",
      "Os campos 12, 13 e 14 são mantidos, porque sem assunto, descrição e momento não é possível tratar a reclamação.",
      "As quatro perguntas respondidas com acesso indicado por função e prazo de retenção expresso em tempo, não em «o necessário».",
      "Na parte C, as linhas R-0041 e R-0045 são identificadas como provavelmente da mesma pessoa, pela combinação de sexo, idade, bairro, ocupação e assunto; e fica escrito que o código R-00xx é pseudonimização, não anonimização.",
      "O fluxo desenhado mostra pelo menos cinco cópias: papel, folha de cálculo local, correio electrónico para a província, pasta partilhada e mensagem para correio pessoal.",
      "As três medidas são verificáveis, com responsável por função e prazo, e não formulações genéricas como «ter mais cuidado».",
    ],
  },
  sintese: [
    "Só se pede o que é preciso para o que está escrito como finalidade.",
    "Se um campo ficar em branco e nada mudar na decisão, esse campo não deve ser pedido.",
    "Entre guardar tudo e não guardar nada há três caminhos: reduzir o detalhe, guardar só contagens, e separar os dados.",
    "Para cada campo guardado: para que serve, quem vê, quanto tempo fica, e o que acontece no fim.",
    "Trocar o nome por um código é pseudonimizar. Os dados continuam a ser da pessoa.",
    "Anonimizar é perder detalhe suficiente para já não se chegar à pessoa.",
    "Campos que sozinhos não dizem nada podem, juntos, identificar uma pessoa só.",
    "Cada cópia dos dados é um risco. Desenhe o caminho dos dados e conte as cópias.",
    "Não se escrevem dados de pessoas em ferramentas externas sem autorização da instituição.",
    "Sobre o que a lei exige, quem responde é a área jurídica da instituição.",
  ],
  verificacao: [
    {
      pergunta:
        "A direcção provincial pede «os dados das reclamações» para fazer estatística. Que ficheiro envia, e porquê?",
      resposta:
        "Envio um ficheiro agregado: número de reclamações por mês, por assunto e por sector, sem nome, sem documento, sem morada e sem descrição em texto livre. Para fazer estatística não é preciso saber quem reclamou. Se a província precisar mesmo de dados por pessoa, tem de dizer para que decisão concreta, e essa passagem tem de ser autorizada e registada.",
      feedback:
        "Enviar a folha completa porque «foi o que pediram» é a origem mais frequente de partilhas excessivas. A pergunta correcta não é o que pedem, é para que serve.",
    },
    {
      pergunta:
        "Um colega diz: «tirei os nomes, agora o ficheiro está anonimizado e pode ser partilhado». Concorda? Use o anexo B na resposta.",
      resposta:
        "Não concordo. Tirar o nome e pôr um código é pseudonimização: existe ainda ligação à pessoa, e mesmo sem ela a combinação de campos chega. No anexo B, as linhas R-0041 e R-0045 têm a mesma mulher de 34 anos, do Bairro Fictício 3, comerciante de peixe, com reclamação sobre fiscalização — numa localidade pequena isso identifica uma pessoa para quem lá trabalha. Para partilhar seria preciso agregar ou suprimir detalhe.",
      feedback:
        "A palavra «anonimizado» é usada com demasiada leveza. O teste prático é perguntar quantas pessoas, naquele universo, partilham aquela combinação de campos. Se a resposta for uma, não está anonimizado.",
    },
  ],
  referencias: [OECD, NIST, UNESCO],
  guiao: {
    preparacao: [
      "Imprimir a tabela dos dezasseis campos, os anexos A, B e C e folhas A3 em branco para o desenho do fluxo, um conjunto por grupo de três.",
      "Preparar no quadro o esquema vazio do fluxo, com seis caixas, para desenhar durante a exposição.",
      "Não é necessária ligação à internet nem ferramenta de inteligência artificial nesta lição.",
      "Rever, antes da sessão, a advertência de que não se cita nem se interpreta legislação nacional na sala, e que as questões jurídicas seguem para a área jurídica da instituição.",
      "Ter marcadores de duas cores: uma para o caminho dos dados, outra para marcar as cópias.",
    ],
    conducao: [
      "Abrir com a pergunta da reclamante do caso: porque é que se pede o estado civil para reclamar de um horário? Recolher respostas sem corrigir e apresentar os objectivos.",
      "Expor a advertência jurídica; a minimização e a pergunta de controlo; as três alternativas intermédias — reduzir detalhe, agregar, separar; as quatro perguntas por campo mantido; a diferença entre pseudonimizar e anonimizar com o exemplo do quase-identificador; e o fluxo de dados, desenhando no quadro as seis caixas do anexo C.",
      "Lançar a actividade em grupos de três. Partes A e B nos primeiros 30 minutos; circular e insistir em que a justificação cite a finalidade declarada. Partes C, D e E nos 30 minutos seguintes. Avisar aos 30 e aos 50 minutos.",
      "Chamar dois grupos, quatro minutos cada: um apresenta as remoções e minimizações com justificação, outro apresenta o fluxo e as cópias contadas. Recolher as fichas restantes. Fechar confirmando as linhas R-0041 e R-0045 e repetindo que o serviço responde pelas cópias que fez.",
    ],
    criterios: [
      "Decisão e justificação escritas para os dezasseis campos, com a finalidade citada.",
      "Campos 5, 6, 11 e 16 removidos ou substituídos, com fundamento.",
      "Quatro perguntas respondidas para todos os campos mantidos, com prazo em tempo e acesso por função.",
      "Reidentificação da parte C correcta e explicada pela combinação de campos.",
      "Fluxo desenhado com pelo menos cinco cópias marcadas.",
      "Três medidas verificáveis, com responsável por função e prazo.",
    ],
    errosComuns: [
      "Justificar um campo com «é sempre assim» ou «pode vir a ser útil».",
      "Manter a fotocópia do documento de identificação por hábito.",
      "Escrever «o necessário» no prazo de retenção.",
      "Chamar anonimizado ao ficheiro do anexo B.",
      "Esquecer a cópia para o correio electrónico pessoal ao desenhar o fluxo.",
      "Propor medidas não verificáveis, do tipo «sensibilizar os colegas».",
      "Tentar resolver na sala se determinada prática é legal em Moçambique, em vez de encaminhar para a área jurídica.",
    ],
  },
};

// ---------------------------------------------------------------------------
// M2 L3 (lição 7 do curso) — Preconceito algorítmico e inclusão
// ---------------------------------------------------------------------------

const M2L3: ConteudoLicao = {
  objectivos: [
    "Calcular, a partir da tabela fornecida, a taxa de falsos negativos e a taxa de falsos positivos de cada grupo, escrevendo o numerador e o denominador de cada conta.",
    "Comparar o desempenho entre grupos e escrever em que grupo o sistema falha mais e de que maneira falha.",
    "Explicar porque é que uma diferença entre grupos não prova, por si, causalidade nem discriminação, e indicar que informação adicional seria precisa.",
    "Identificar, no caso fornecido, pelo menos três origens possíveis da diferença: representação nos dados, variáveis indirectas e barreiras de acesso.",
    "Propor quatro medidas — uma de mitigação técnica ou de processo, uma de consulta, uma de revisão periódica e uma alternativa acessível — com responsável por função e prazo.",
  ],
  explicacao: [
    "Preconceito algorítmico não é o sistema «ter opinião». É mais simples e mais incómodo do que isso: o sistema funciona melhor para umas pessoas do que para outras, e ninguém dá por isso enquanto olhar só para o número global. Um sistema com oitenta por cento de acerto pode ter noventa por cento num grupo e cinquenta noutro. A média esconde exactamente aquilo que interessa saber.",
    "A primeira origem é a representação nos dados. Se um sistema aprendeu com pedidos submetidos em português, escritos em zona urbana, por pessoas habituadas ao formulário, é nesses que funciona bem. Os pedidos escritos noutro registo de língua, preenchidos com ajuda de terceiro, ou vindos de zonas onde o serviço é raro, estão pouco representados no treino — e o sistema não aprendeu os seus padrões. Não é malícia de ninguém: é o reflexo de quem estava nos dados.",
    "A segunda origem são as variáveis indirectas, também chamadas proxies. Retirar o campo do sexo, da língua ou da origem não elimina a diferença, porque outros campos carregam a mesma informação por vias indirectas. O bairro pode estar associado à origem; a hora de submissão, ao tipo de emprego; o canal usado — balcão ou internet —, à conectividade e ao rendimento; a existência de endereço de correio electrónico, à escolaridade. O sistema pode reproduzir uma diferença entre grupos sem nunca ter visto o campo que define o grupo.",
    "A terceira origem são as barreiras de acesso, que actuam antes do sistema. Se o formulário só existe em português escrito, quem é atendido noutra língua depende de intermediários e o texto que fica no registo não é o seu. Se o portal não funciona com leitor de ecrã, uma pessoa cega submete por outra via, com outras características. Se a rede é fraca, o pedido é submetido em condições diferentes. As diferenças que depois aparecem nos resultados foram criadas antes, pelo desenho do serviço.",
    "Agora a advertência central desta lição, e a que mais custa a respeitar quando a tabela está à nossa frente: uma diferença entre grupos é um sinal, não uma prova. Não prova causalidade, porque pode haver uma terceira coisa a explicar as duas — por exemplo, se os pedidos de um grupo forem em média mais complexos, é natural que haja mais erros, e a diferença seria de complexidade e não de grupo. E também não prova, por si, discriminação, que é uma qualificação jurídica com critérios próprios, e não uma conclusão que se tira de uma tabela numa sala de formação. O que a diferença faz — e é muito — é obrigar a investigar, com dados sobre a composição dos grupos, sobre a complexidade dos casos, sobre o desenho do serviço e ouvindo as pessoas afectadas.",
    "Há ainda um ponto que muda a leitura dos números: os dois tipos de erro não custam o mesmo, e podem não custar o mesmo a cada grupo. Num sistema que assinala pedidos com risco de estarem incompletos, um falso positivo incomoda — a pessoa é chamada a confirmar documentos que já tinha entregue. Um falso negativo custa mais — o pedido segue incompleto, é devolvido semanas depois e a pessoa perde tempo e viagem. Se os falsos negativos se concentram no grupo que já tem mais dificuldade em deslocar-se, o sistema acrescenta dificuldade a quem já tinha mais. É por isso que se olha para cada tipo de erro por grupo, e não para a taxa de acerto global.",
    "Por fim, as respostas. Mitigar pode ser técnico — reequilibrar dados de treino, mudar o limiar de aviso, deixar de usar um campo que funciona como variável indirecta — ou pode ser de processo, por exemplo obrigar a revisão humana em todos os casos do grupo onde o sistema falha mais. Consultar é falar com quem é afectado, incluindo organizações de pessoas com deficiência, antes de decidir o que fazer, e não depois. Rever periodicamente é fixar uma data em que se volta a medir, porque o desempenho muda quando muda a população atendida. E manter uma alternativa acessível é garantir que existe sempre um caminho sem o sistema — balcão, papel, apoio presencial — para quem o sistema serve mal. Dessas quatro, a alternativa acessível é a que nunca deve faltar.",
  ],
  exemplo: {
    titulo: "Caso fictício — o aviso de pedidos incompletos em Muanzo, três meses depois",
    corpo: [
      "A Direcção Distrital Fictícia de Muanzo instalou, há três meses, um sistema que assinala os pedidos com maior risco de estarem incompletos, para serem conferidos antes de entrarem na fila. Tudo o que se segue é inventado para esta aula.",
      "Nos primeiros três meses passaram pelo sistema seiscentos pedidos. A direcção mandou verificar, um a um, quantos estavam de facto incompletos, e comparou com o que o sistema tinha assinalado. Os resultados estão na tabela, repartidos por três grupos de submissão.",
      "No relatório interno, alguém escreveu: «o sistema acerta em setenta e oito por cento dos casos, o que é satisfatório». A frase está aritmeticamente correcta e é enganadora. Vamos ver porquê.",
      "Os três grupos não são grupos de pessoas definidos por nenhuma característica protegida: são grupos de submissão — como o pedido entrou no serviço. Mas a maneira como um pedido entra está ligada à língua em que a pessoa é atendida, à distância a que vive, à ligação de que dispõe e ao apoio de que precisa. É por aí que a análise tem de passar.",
    ],
  },
  tabela: {
    titulo: "Ficha de trabalho — resultados dos três meses, por grupo de submissão",
    nota:
      "Números fictícios, preparados para esta aula. VP são pedidos incompletos que o sistema assinalou; FN são incompletos que não assinalou; FP são pedidos completos que assinalou indevidamente; VN são completos que não assinalou. As colunas das taxas ficam em branco e são calculadas pelo grupo, com a conta escrita.",
    colunas: [
      "Grupo de submissão",
      "Total de pedidos",
      "Incompletos reais",
      "VP",
      "FN",
      "Completos reais",
      "FP",
      "VN",
      "Taxa de falsos negativos",
      "Taxa de falsos positivos",
    ],
    linhas: [
      ["A — em português, no portal, zona urbana", "300", "60", "45", "15", "240", "24", "216", "", ""],
      ["B — no balcão, zona rural, submissão assistida", "200", "60", "30", "30", "140", "35", "105", "", ""],
      ["C — com apoio de terceiro, incluindo pessoas com deficiência visual", "100", "20", "12", "8", "80", "20", "60", "", ""],
      ["Total", "600", "140", "87", "53", "460", "79", "381", "", ""],
    ],
  },
  anexos: [
    {
      titulo: "Anexo A — como se calculam as duas taxas",
      nota: "Definições de trabalho, para que toda a gente use o mesmo denominador.",
      corpo: [
        "Taxa de falsos negativos = FN dividido pelo número de incompletos reais desse grupo, isto é FN dividido por (VP + FN). Responde à pergunta: dos pedidos que estavam mesmo incompletos, que proporção é que o sistema deixou passar?",
        "Taxa de falsos positivos = FP dividido pelo número de completos reais desse grupo, isto é FP dividido por (FP + VN). Responde à pergunta: dos pedidos que estavam bem, que proporção é que o sistema chamou indevidamente?",
        "Taxa de acerto global = (VP + VN) dividido pelo total. Nunca se usa sozinha, e nunca se compara entre grupos sem olhar para as duas taxas acima.",
        "Escrever sempre o numerador e o denominador. Uma percentagem sem denominador não permite discussão nenhuma.",
      ],
    },
    {
      titulo: "Anexo B — o que se sabe e o que não se sabe sobre os três grupos",
      nota:
        "Informação fictícia, deliberadamente incompleta. Serve para treinar a distinção entre o que a tabela mostra e o que seria preciso saber.",
      corpo: [
        "Sabe-se: o sistema foi treinado com pedidos dos últimos dois anos, dos quais cerca de quatro quintos tinham entrado pelo portal.",
        "Sabe-se: o formulário do portal existe apenas em português escrito e não foi testado com leitor de ecrã.",
        "Sabe-se: no grupo C, o pedido é escrito por um terceiro que acompanha a pessoa, e o campo de descrição costuma ser mais curto.",
        "Não se sabe: se os pedidos do grupo B são, em média, mais complexos do que os do grupo A.",
        "Não se sabe: que campos pesam mais na decisão do sistema.",
        "Não se sabe: quantas pessoas do grupo C desistiram antes de submeter, porque quem desiste não aparece em tabela nenhuma.",
      ],
    },
  ],
  actividade: {
    formato: "em pares, com a tabela em papel; calculadora simples ou a do telemóvel autorizada",
    enunciado: [
      "Parte A. Calculem, para cada um dos três grupos e para o total, a taxa de falsos negativos e a taxa de falsos positivos, escrevendo sempre o numerador e o denominador. Confirmem primeiro que, em cada linha, VP mais FN dá os incompletos reais e FP mais VN dá os completos reais.",
      "Parte B. Calculem a taxa de acerto global e escrevam, em duas frases, porque é que a frase do relatório interno — «acerta em setenta e oito por cento, o que é satisfatório» — é enganadora.",
      "Parte C. Escrevam em que grupo o sistema falha mais e de que maneira falha, distinguindo os dois tipos de erro e dizendo qual deles custa mais à pessoa afectada e porquê.",
      "Parte D. Usando o anexo B, listem três origens possíveis da diferença observada: uma de representação nos dados, uma de variável indirecta e uma de barreira de acesso. Em cada uma, escrevam uma frase a explicar como produziria este resultado.",
      "Parte E. Escrevam duas frases sobre os limites da vossa conclusão: o que é que estes números não provam, e que informação adicional pediriam antes de afirmar que há tratamento desigual.",
      "Parte F. Proponham quatro medidas, uma de cada tipo — mitigação, consulta, revisão periódica e alternativa acessível — cada uma com responsável por função e prazo.",
    ],
    produto:
      "Uma ficha por par com: a tabela completada com as seis taxas por grupo e as do total, com contas visíveis; a crítica à frase do relatório; a análise do grupo mais afectado; as três origens; os limites da conclusão; e as quatro medidas com responsável e prazo.",
    rubrica: [
      "Grupo A: taxa de falsos negativos = 15 dividido por 60 = 0,25, isto é 25 por cento; taxa de falsos positivos = 24 dividido por 240 = 0,10, isto é 10 por cento.",
      "Grupo B: taxa de falsos negativos = 30 dividido por 60 = 0,50, isto é 50 por cento; taxa de falsos positivos = 35 dividido por 140 = 0,25, isto é 25 por cento.",
      "Grupo C: taxa de falsos negativos = 8 dividido por 20 = 0,40, isto é 40 por cento; taxa de falsos positivos = 20 dividido por 80 = 0,25, isto é 25 por cento.",
      "Total: taxa de falsos negativos = 53 dividido por 140 = 0,3786, cerca de 37,9 por cento; taxa de falsos positivos = 79 dividido por 460 = 0,1717, cerca de 17,2 por cento; taxa de acerto global = (87 + 381) dividido por 600 = 468 dividido por 600 = 0,78, isto é 78 por cento.",
      "A crítica à frase do relatório assenta em que a taxa global é dominada pelo grupo A, que tem metade dos pedidos e os melhores resultados, e esconde que no grupo B o sistema deixa passar metade dos pedidos incompletos.",
      "A parte C identifica o grupo B como o mais afectado nos falsos negativos e explica que o falso negativo custa mais, porque o pedido segue incompleto e é devolvido semanas depois, obrigando a nova deslocação — precisamente a quem vive mais longe.",
      "As três origens estão ancoradas no anexo B: quatro quintos do treino vindos do portal é representação; o canal de submissão a funcionar como indicador indirecto de conectividade e rendimento é variável indirecta; o formulário só em português escrito e não testado com leitor de ecrã é barreira de acesso.",
      "A parte E diz expressamente que a diferença não prova causalidade nem discriminação e pede pelo menos a comparação de complexidade dos pedidos entre grupos, o peso dos campos na decisão e a escuta das pessoas afectadas, incluindo quem desistiu.",
      "As quatro medidas são distintas, com responsável por função e prazo, e a alternativa acessível garante um caminho sem o sistema para quem ele serve pior.",
    ],
  },
  sintese: [
    "Um sistema pode acertar muito no total e falhar muito num grupo.",
    "Veja sempre os dois erros separados: deixar passar e chamar sem ser preciso.",
    "Escreva a conta com o número de cima e o número de baixo. Percentagem sozinha não chega.",
    "Os dados de treino trazem quem estava neles. Quem não estava é servido pior.",
    "Retirar o campo do sexo ou da língua não resolve: outros campos dizem a mesma coisa por outro caminho.",
    "Algumas diferenças nascem antes do sistema, no desenho do serviço: língua, internet, acessibilidade.",
    "Uma diferença entre grupos manda investigar. Não prova, sozinha, causa nem discriminação.",
    "Quem desiste de submeter não aparece em tabela nenhuma.",
    "Fale com as pessoas afectadas antes de decidir a solução.",
    "Deve existir sempre um caminho sem o sistema para quem o sistema serve mal.",
  ],
  verificacao: [
    {
      pergunta:
        "O relatório diz que o sistema «acerta em 78 por cento». Usando os números da tabela, mostre com uma conta porque é que isso não descreve o que acontece no grupo B.",
      resposta:
        "A taxa global é 468 dividido por 600, igual a 0,78. Mas no grupo B o sistema deixa passar 30 dos 60 pedidos realmente incompletos: 30 dividido por 60 é 0,50, ou seja metade. No grupo A deixa passar 15 em 60, isto é 25 por cento. O número global é puxado pelo grupo A, que tem metade de todos os pedidos e os melhores resultados.",
      feedback:
        "Sempre que um grupo domina o total, a média descreve esse grupo e mais nenhum. A leitura por grupo, com denominadores à vista, é o mínimo antes de qualquer juízo sobre o sistema.",
    },
    {
      pergunta:
        "Uma colega conclui da tabela: «está provado que o sistema discrimina as pessoas da zona rural». O que corrige, e o que propõe fazer a seguir?",
      resposta:
        "Corrijo duas coisas. Primeira: a tabela mostra uma diferença de desempenho entre grupos de submissão, e uma diferença é um sinal, não uma prova de causa — pode haver, por exemplo, diferença de complexidade dos pedidos que explique parte do resultado. Segunda: discriminação é uma qualificação jurídica, com critérios próprios, e não se estabelece a partir de uma tabela numa sala de formação. Proponho investigar: comparar a complexidade dos pedidos entre grupos, ver que campos pesam na decisão, procurar quem desistiu de submeter, e ouvir as pessoas afectadas e as organizações que as representam. E, entretanto, manter revisão humana obrigatória nos casos do grupo B e garantir a alternativa presencial.",
      feedback:
        "Rigor não é indiferença. Dizer que não está provado não é dizer que está tudo bem: o sinal é forte e obriga a agir de imediato na protecção, enquanto se investiga a causa.",
    },
  ],
  referencias: [OECD, NIST, UNESCO, UA],
  guiao: {
    preparacao: [
      "Imprimir a tabela dos resultados e os anexos A e B, um conjunto por par, com letra grande e espaço para escrever as contas.",
      "Confirmar que há calculadoras simples para todos os pares, ou autorizar a calculadora do telemóvel.",
      "Desenhar previamente no quadro o esquema das quatro células — VP, FN, FP, VN — para retomar da lição 3 do módulo 1.",
      "Não é necessária ligação à internet nem ferramenta de inteligência artificial nesta lição.",
      "Preparar-se para travar, com firmeza e sem ironia, conclusões de discriminação tiradas directamente da tabela.",
    ],
    conducao: [
      "Retomar a tabela de quatro células da lição 3 numa pergunta rápida e apresentar os objectivos, anunciando que hoje os mesmos erros são olhados por grupo.",
      "Expor as três origens — representação, variáveis indirectas e barreiras de acesso —, mostrar com um cálculo rápido no quadro como a média esconde um grupo, explicar que os dois erros não custam o mesmo nem custam o mesmo a cada grupo, e deixar clara a advertência: diferença é sinal, não prova de causa nem de discriminação.",
      "Lançar a actividade em pares. Partes A e B nos primeiros 20 minutos, exigindo contas escritas com numerador e denominador. Partes C, D e E nos 25 minutos seguintes. Parte F nos últimos 15 minutos. Avisar aos 30 e aos 50 minutos.",
      "Chamar dois grupos, quatro minutos cada: um apresenta as taxas por grupo e a crítica à frase do relatório, outro apresenta as origens e as quatro medidas. Recolher as fichas restantes. Fechar confirmando no quadro 25 e 10 por cento no grupo A, 50 e 25 no grupo B, 40 e 25 no grupo C, e 78 por cento de acerto global, e repetindo que a alternativa acessível é a medida que nunca pode faltar.",
    ],
    criterios: [
      "Seis taxas por grupo correctas, com numerador e denominador escritos.",
      "Crítica à taxa global fundamentada no peso do grupo A.",
      "Identificação do grupo B e explicação de porque é que o falso negativo custa mais.",
      "Três origens distintas, ancoradas no anexo B.",
      "Limites da conclusão escritos de forma expressa, sem afirmar discriminação.",
      "Quatro medidas de tipos diferentes, com responsável por função e prazo, incluindo alternativa acessível.",
    ],
    errosComuns: [
      "Dividir os falsos negativos pelo total do grupo em vez dos incompletos reais.",
      "Comparar grupos pela taxa de acerto global.",
      "Concluir discriminação a partir da tabela.",
      "Achar que retirar um campo sensível resolve o problema.",
      "Esquecer quem desistiu de submeter.",
      "Propor apenas medidas técnicas e nenhuma alternativa acessível.",
      "Tratar o falso positivo e o falso negativo como igualmente graves para a pessoa.",
    ],
  },
};

// ---------------------------------------------------------------------------
// M2 L4 (lição 8 do curso) — Supervisão humana e prestação de contas
// ---------------------------------------------------------------------------

const M2L4: ConteudoLicao = {
  objectivos: [
    "Distinguir, com exemplos das fontes fornecidas, lei, recomendação internacional e estratégia, dizendo o que cada uma obriga e a quem.",
    "Explicar porque é que o Regulamento Europeu de Inteligência Artificial é referência internacional de governação e não lei automaticamente aplicável em Moçambique.",
    "Identificar os actores relevantes — governo, academia, fornecedores, sociedade civil incluindo organizações de pessoas com deficiência, e organizações internacionais como a União Africana, a UNESCO e a União Europeia — e dizer o que cada um pode fazer neste caso.",
    "Compor um comité de supervisão preenchendo as fichas de papel fornecidas, com poder expresso de suspender e corrigir.",
    "Preencher uma matriz de risco com risco, responsável por função, acção, evidência e prazo, e escrever as condições de suspensão.",
    "Redigir a minuta de suspensão do sistema, com fundamento, efeitos imediatos e caminho de contestação para a pessoa afectada.",
  ],
  explicacao: [
    "Supervisão humana é uma expressão que se usa muito e que quase sempre significa menos do que parece. Ter uma pessoa a olhar para o ecrã não é supervisão. Supervisão é ter alguém com poder real de parar o sistema, corrigir a saída e responder por essa decisão. Se a pessoa que verifica não pode suspender, não pode alterar e não é ouvida quando avisa, o que existe é a aparência de supervisão — e a aparência é pior do que nada, porque tranquiliza.",
    "Três poderes concretos definem supervisão verdadeira. O poder de corrigir: a pessoa pode alterar ou rejeitar a saída sem pedir autorização e sem justificar por escrito cada vez. O poder de suspender: existe alguém, nomeado por função, que pode mandar parar o uso do sistema no mesmo dia, e existe um procedimento escrito para o fazer. E o poder de ser ouvido: os avisos de quem usa o sistema chegam a quem decide, ficam registados e têm resposta. Faltando um destes três, é preciso dizer que falta.",
    "Ao lado da supervisão está a contestação, que é o direito de quem foi afectado. Uma pessoa que recebe uma decisão apoiada por um sistema tem de poder saber que houve apoio de um sistema, pedir revisão por pessoa, apresentar argumentos e obter resposta em prazo. Isto exige três coisas práticas: informação legível no documento que sai, um canal indicado de forma clara, e registo do que foi decidido e por quem. Sem registo, a contestação é uma conversa.",
    "Prestação de contas é a terceira peça e responde à pergunta: quem responde por isto? A resposta não pode ser «o sistema», nem «o fornecedor», nem «a informática». Responde a pessoa que assina a decisão, e responde a direcção que autorizou o uso. Para que isso seja verificável é preciso saber, a qualquer momento, que sistemas estão em uso, para que servem, quem autorizou, quem supervisiona e onde estão os registos. Um serviço que não consegue responder a isto numa folha não está em condições de prestar contas.",
    "Passemos à governação, e comecemos por arrumar três palavras que são usadas como se fossem sinónimos. Lei é norma obrigatória, aprovada pelo órgão competente de um país, com consequências pelo incumprimento. Recomendação internacional é um instrumento adoptado por Estados que exprime compromissos e orienta políticas, mas que não é, por si, lei em país nenhum — só obriga na medida em que cada país a transponha. Estratégia é documento de orientação política: fixa prioridades e caminhos, não cria obrigações directas para os serviços. E há ainda a proposta em consulta pública, que é um texto aberto a comentários e que não prova que exista nada aprovado. Confundir estas categorias numa reunião é o erro que mais depressa se paga.",
    "Com estas distinções, as fontes desta lição arrumam-se com facilidade. O quadro regulamentar europeu para a inteligência artificial é legislação da União Europeia, que classifica os sistemas por risco e impõe, aos de alto risco, exigências de dados, documentação, registo, transparência e supervisão humana; a sua aplicação é faseada e o calendário tem sido objecto de alterações, pelo que não se deve afirmar que está tudo em vigor. Para Moçambique é referência internacional de boas práticas e termo de comparação — não é lei aplicável, e nenhuma decisão interna se fundamenta nele. A Recomendação da UNESCO sobre a Ética da Inteligência Artificial é instrumento normativo adoptado entre Estados, útil como lista de verificação ética. A Estratégia Continental da União Africana é orientação política para o continente, com ênfase em capacidades, riscos, governação e cooperação. E a consulta pública do INTIC sobre a proposta de Estratégia Nacional de Inteligência Artificial mostra que existe um processo de consulta em curso — e apenas isso: não prova que exista estratégia aprovada, política aprovada ou lei de inteligência artificial em vigor em Moçambique, e também não permite atribuir ao INTIC a qualidade de autoridade reguladora da inteligência artificial. Quem precisar do estado actual do processo deve consultar a fonte na data em que precisa da informação.",
    "Os actores não são todos a mesma coisa e não querem a mesma coisa, o que é normal. O governo define política e responde perante os cidadãos. A academia produz conhecimento independente e forma pessoas, e é quem pode avaliar um sistema sem interesse na sua venda. Os fornecedores desenvolvem e vendem produtos: têm conhecimento técnico indispensável e têm interesse comercial, e as duas coisas são verdadeiras ao mesmo tempo. A sociedade civil, incluindo muito especialmente as organizações de pessoas com deficiência, traz a experiência de quem é afectado e detecta barreiras que mais ninguém vê. As organizações internacionais — União Africana, UNESCO, União Europeia — produzem referências, recomendações e estratégias, e criam espaços de negociação. Reconhecer o interesse de cada um não é desconfiança: é a base de uma consulta honesta.",
    "É aqui que entra a política e a diplomacia da inteligência artificial, que não é assunto distante. As regras internacionais estão a ser escritas agora, e quem não participa recebe-as feitas. A escolha de fornecedores, o sítio onde ficam os dados, as normas técnicas que se adoptam e a participação em espaços continentais e multilaterais são decisões de soberania, ainda que se apresentem como decisões técnicas. Ao nível de uma direcção distrital isto traduz-se em perguntas muito concretas: onde ficam alojados os nossos dados, que dependência estamos a criar, conseguimos sair deste produto, e estamos a desenvolver competência interna ou apenas a consumir um serviço?",
  ],
  exemplo: {
    titulo: "Caso fictício — o comité de supervisão que Muanzo não tinha",
    corpo: [
      "Regressemos ao sistema de aviso de pedidos incompletos da Direcção Distrital Fictícia de Muanzo, e aos resultados da lição anterior. Tudo o que se segue é inventado para esta aula.",
      "Depois de conhecidos os números, a técnica de atendimento avisou por três vezes que os pedidos vindos do balcão em zona rural estavam a ser devolvidos mais do que antes. Os avisos foram feitos de viva voz, em reuniões de sector. Não ficaram registados em lado nenhum e não chegaram à direcção.",
      "Quando o assunto chegou finalmente à Directora, quatro perguntas ficaram sem resposta. Quem autorizou o uso deste sistema? Quem o supervisiona? Quem pode mandar parar? E o que se diz às pessoas cujos pedidos foram devolvidos por causa disto?",
      "Não havia comité, não havia matriz de risco, não havia procedimento de suspensão e não havia caminho de contestação. Havia um sistema em uso e uma pessoa preocupada sem sítio para pôr a preocupação. O trabalho de hoje é construir o que faltava — e decidir, com fundamento, se o sistema continua, continua com condições, ou é suspenso.",
    ],
  },
  tabela: {
    titulo: "Ficha de trabalho — matriz de risco, a preencher pelo grupo",
    nota:
      "Matriz fictícia de trabalho. A primeira coluna traz quatro riscos já identificados; o grupo acrescenta pelo menos um e preenche as restantes colunas. «Evidência» é aquilo que outra pessoa pode ir ver para confirmar que a acção foi cumprida.",
    colunas: ["Risco", "Quem é afectado", "Responsável (por função)", "Acção", "Evidência", "Prazo"],
    linhas: [
      ["O sistema deixa passar metade dos pedidos incompletos submetidos no balcão em zona rural", "Requerentes que vivem longe do serviço", "", "", "", ""],
      ["Os avisos de quem usa o sistema não chegam a quem decide", "Pessoal do balcão e, indirectamente, os requerentes", "", "", "", ""],
      ["A pessoa cujo pedido foi devolvido não sabe que houve apoio de um sistema nem como reclamar", "Requerentes", "", "", "", ""],
      ["Não existe procedimento escrito para mandar parar o sistema", "Toda a gente, incluindo o serviço", "", "", "", ""],
      ["(acrescentar pelo grupo)", "", "", "", "", ""],
    ],
  },
  anexos: [
    {
      titulo: "Anexo A — fichas de papel para o comité de supervisão",
      nota:
        "Fichas fictícias de trabalho. Cada grupo distribui os papéis entre si; um papel pode ser desempenhado por quem já tem outras funções, desde que não haja conflito de interesse.",
      corpo: [
        "Presidência do comité — função com poder de decisão no serviço. Convoca, decide sobre suspensão e responde perante a direcção. Não pode ser quem propôs a aquisição do sistema.",
        "Representante de quem usa o sistema — pessoa do balcão ou do sector que trabalha com as saídas todos os dias. Traz os problemas reais e tem direito a que o seu aviso fique registado e obtenha resposta escrita.",
        "Responsável pela protecção de dados no serviço — verifica finalidade, acesso, retenção e fluxos, e levanta as questões que devem seguir para a área jurídica da instituição.",
        "Voz de quem é afectado — assento reservado para pessoa utente do serviço ou para organização da sociedade civil, incluindo organização de pessoas com deficiência. Não é figura decorativa: tem direito a ponto na ordem de trabalhos.",
        "Apoio técnico — pessoa com conhecimento do funcionamento do sistema, interna ou contratada. Se for do fornecedor, o conflito de interesse é declarado por escrito e essa pessoa não participa na decisão de suspender.",
        "Secretariado — lavra a acta, mantém o registo dos avisos recebidos e das respostas dadas, e guarda a lista dos sistemas em uso.",
      ],
    },
    {
      titulo: "Anexo B — as quatro perguntas da prestação de contas",
      nota: "Grelha de trabalho. Deve ser possível responder às quatro numa única folha.",
      corpo: [
        "Que sistemas estão em uso neste serviço, para que servem, e desde quando?",
        "Quem autorizou cada um, e com que fundamento escrito?",
        "Quem supervisiona no dia-a-dia, e quem pode mandar parar?",
        "Onde estão os registos, e o que é que a pessoa afectada consegue saber e pedir?",
      ],
    },
    {
      titulo: "Anexo C — esqueleto da minuta de suspensão",
      nota:
        "Estrutura fictícia de trabalho, para ser preenchida pelo grupo. Não é modelo jurídico e não substitui parecer da área jurídica da instituição.",
      corpo: [
        "Identificação: que sistema, usado em que tarefa, desde quando, autorizado por quem.",
        "Fundamento: que facto concreto motiva a suspensão, com os números ou os registos em que assenta.",
        "Decisão: suspensão total ou parcial, e a partir de que momento.",
        "Efeitos imediatos: o que passa a ser feito sem o sistema, por quem, e o que acontece aos casos que estão a meio.",
        "Casos já decididos: quais são revistos, por quem, em que prazo, e como são as pessoas informadas.",
        "Contestação: como é que a pessoa afectada pede revisão, a quem, em que prazo, e em quanto tempo recebe resposta.",
        "Condições de retoma: o que tem de estar demonstrado, e por que evidência, para o sistema voltar a ser usado.",
        "Comunicação: quem é informado dentro e fora do serviço, e em que prazo.",
      ],
    },
  ],
  actividade: {
    formato: "em grupos de quatro a seis, apenas com papel; não é necessário computador nesta lição",
    enunciado: [
      "Parte A. Distribuam entre vós as fichas do anexo A e componham o comité. Escrevam, para cada papel, a função concreta do vosso serviço que o desempenharia e um conflito de interesse que teria de ser declarado.",
      "Parte B. Respondam por escrito às quatro perguntas do anexo B para o caso de Muanzo, tal como está descrito. Onde a resposta for «não existe», escrevam «não existe» — é a resposta mais útil do exercício.",
      "Parte C. Preencham a matriz de risco, incluindo pelo menos um risco acrescentado por vós. Cada linha precisa de responsável por função, acção, evidência verificável e prazo.",
      "Parte D. Escrevam as condições de suspensão: em que circunstâncias concretas o sistema é parado, quem tem esse poder e em quanto tempo a decisão tem de ser tomada depois de conhecido o facto.",
      "Parte E. Redijam a minuta de suspensão seguindo o esqueleto do anexo C, com especial cuidado no fundamento, nos efeitos imediatos, na revisão dos casos já decididos e no caminho de contestação.",
      "Parte F. Escrevam uma proposta de piloto para retomar o sistema: âmbito reduzido, duração, indicadores que vão ser medidos por grupo de submissão, quem é consultado antes e no fim, e a alternativa acessível que se mantém sempre disponível.",
      "Parte G. Em três linhas, digam que actores — governo, academia, fornecedor, sociedade civil incluindo organizações de pessoas com deficiência, e organizações internacionais — seriam envolvidos, para que efeito cada um, e que interesse próprio de cada um deve ser reconhecido.",
    ],
    produto:
      "Um dossiê por grupo com: o comité composto e os conflitos de interesse declarados; as respostas às quatro perguntas de prestação de contas; a matriz de risco completa; as condições de suspensão; a minuta de suspensão redigida; a proposta de piloto; e a lista de actores com finalidade e interesse.",
    rubrica: [
      "O comité atribui a alguém, por função, o poder expresso de suspender, e esse alguém não é quem propôs a aquisição do sistema.",
      "O assento da voz de quem é afectado está preenchido e tem função real, não decorativa.",
      "Na parte B, pelo menos duas respostas são «não existe», porque no caso descrito não existem mesmo comité, procedimento de suspensão, registo de avisos nem caminho de contestação.",
      "Todas as linhas da matriz têm responsável por função — nunca «o serviço» ou «a informática» — e evidência que outra pessoa possa ir verificar.",
      "As condições de suspensão são factos observáveis, com prazo para decidir, e não formulações como «se houver problemas graves».",
      "A minuta indica o que acontece aos casos já decididos e dá à pessoa afectada um caminho concreto de contestação, com destinatário e prazo de resposta.",
      "A proposta de piloto mede indicadores por grupo de submissão, e não apenas no total, e mantém a alternativa acessível.",
      "Na parte G, o interesse comercial do fornecedor é reconhecido expressamente, e o EU AI Act, se citado, é apresentado como referência europeia e não como norma aplicável em Moçambique.",
      "Nenhuma parte do dossiê afirma que existe lei, estratégia ou política de inteligência artificial aprovada em Moçambique.",
    ],
  },
  sintese: [
    "Supervisão só é supervisão se alguém puder corrigir e mandar parar.",
    "Se quem verifica não pode parar nem alterar, isso não é supervisão.",
    "Os avisos de quem usa o sistema têm de ficar escritos e ter resposta.",
    "Quem é afectado tem direito a saber que houve um sistema, a pedir revisão por pessoa e a receber resposta.",
    "Quem responde é quem assina e quem autorizou. Não é «o sistema» nem «a informática».",
    "Lei obriga. Recomendação internacional orienta os Estados. Estratégia fixa prioridades. Proposta em consulta ainda não é nada disso.",
    "O regulamento europeu de inteligência artificial é referência internacional. Não é lei de Moçambique.",
    "A consulta pública do INTIC mostra que há um processo em curso. Não mostra que exista estratégia aprovada.",
    "Governo, academia, fornecedores e sociedade civil têm papéis e interesses diferentes. Reconheça-os.",
    "Onde ficam os dados e de quem se depende são decisões de soberania, mesmo quando parecem técnicas.",
  ],
  verificacao: [
    {
      pergunta:
        "Numa reunião, um colega afirma: «temos de cumprir o EU AI Act, e a estratégia nacional de inteligência artificial já foi aprovada». Que duas correcções faz, e como fundamenta?",
      resposta:
        "Primeira correcção: o Regulamento Europeu de Inteligência Artificial é legislação da União Europeia. Estudamo-lo como referência internacional de governação — classificação por risco, transparência, supervisão humana — mas não se aplica automaticamente a Moçambique e não fundamenta decisões internas; a sua aplicação é faseada e o calendário tem sido alterado. Segunda correcção: o que a fonte do INTIC mostra é uma consulta pública sobre uma proposta de Estratégia Nacional de Inteligência Artificial. Consulta sobre proposta não é aprovação, e daí também não se conclui que o INTIC seja autoridade reguladora da inteligência artificial. Para saber o estado actual, consulta-se a fonte na data e cita-se essa data.",
      feedback:
        "As duas afirmações corrigidas são das que circulam com mais facilidade em reuniões e apresentações. Distinguir lei, recomendação, estratégia e proposta em consulta evita comprometer a instituição.",
    },
    {
      pergunta:
        "A direcção diz que já tem supervisão humana, porque uma técnica confere todas as saídas antes de seguirem. Que perguntas faz para verificar se isso é mesmo supervisão?",
      resposta:
        "Pergunto três coisas. Pode essa técnica alterar ou rejeitar a saída por sua iniciativa, sem autorização caso a caso? Existe alguém, nomeado por função, com poder de mandar parar o uso do sistema no mesmo dia, e existe procedimento escrito para isso? E os avisos que ela dá ficam registados e obtêm resposta de quem decide? No caso de Muanzo, avisou três vezes de viva voz e nada ficou registado — logo, o terceiro poder falta, e sem ele não há supervisão, há conferência.",
      feedback:
        "A pergunta decisiva é a do registo: sem avisos escritos e respondidos, ninguém consegue depois demonstrar que sabia, nem quando soube, e a prestação de contas desfaz-se.",
    },
  ],
  referencias: [OECD, NIST, UE, UNESCO, UA, INTIC],
  guiao: {
    preparacao: [
      "Imprimir os anexos A, B e C e a matriz de risco, um conjunto por grupo, com letra grande e espaço para escrever.",
      "Preparar, para projecção ou leitura, as quatro fontes e as respectivas sínteses, com a data de consulta visível.",
      "Rever antes da sessão a distinção entre lei, recomendação internacional, estratégia e proposta em consulta pública, e preparar-se para a repetir sempre que for preciso.",
      "Não é necessária ligação à internet nem ferramenta de inteligência artificial nesta lição; se houver ligação, pode abrir-se cada fonte e mostrar a data de consulta.",
      "Ter presente que o comité, a matriz e a minuta produzidos são exercício de formação e não vinculam nenhuma instituição.",
    ],
    conducao: [
      "Abrir com as quatro perguntas que ficaram sem resposta no caso de Muanzo — quem autorizou, quem supervisiona, quem pode parar, o que se diz às pessoas afectadas — e apresentar os objectivos.",
      "Expor os três poderes da supervisão verdadeira; a contestação e o que ela exige na prática; a prestação de contas e as suas quatro perguntas; a distinção entre lei, recomendação, estratégia e proposta em consulta, arrumando aí as quatro fontes com a data de consulta à vista; os actores e os seus interesses; e a dimensão de política e diplomacia, terminando nas perguntas concretas sobre dados, dependência e competência interna.",
      "Lançar a actividade em grupos de quatro a seis. Partes A e B nos primeiros 15 minutos; partes C e D nos 20 minutos seguintes; parte E em 15 minutos; partes F e G nos últimos 10 minutos. Circular exigindo responsáveis por função e evidências verificáveis.",
      "Chamar dois grupos, cinco minutos cada: um lê a minuta de suspensão, outro apresenta a matriz de risco e a proposta de piloto. Recolher os dossiês restantes. Fechar repetindo as três frases que não podem sair erradas da sala: supervisão sem poder de parar não é supervisão; o regulamento europeu é referência e não lei de Moçambique; e a consulta do INTIC mostra um processo em curso, não uma estratégia aprovada.",
    ],
    criterios: [
      "Comité composto com poder de suspensão atribuído por função e conflitos de interesse declarados.",
      "Assento da voz de quem é afectado preenchido com função real.",
      "Quatro perguntas de prestação de contas respondidas, com «não existe» onde é o caso.",
      "Matriz completa, com responsável por função, evidência verificável e prazo em todas as linhas.",
      "Minuta com fundamento, efeitos imediatos, revisão dos casos já decididos e caminho de contestação.",
      "Piloto com indicadores por grupo e alternativa acessível mantida.",
      "Actores com finalidade e interesse próprio reconhecidos, incluindo o interesse comercial do fornecedor.",
      "Nenhuma afirmação de lei, estratégia ou política de inteligência artificial aprovada em Moçambique.",
    ],
    errosComuns: [
      "Chamar supervisão a conferir saídas sem poder de parar.",
      "Escrever «o serviço» ou «a informática» na coluna do responsável.",
      "Escrever condições de suspensão vagas, do tipo «se houver problemas graves».",
      "Esquecer os casos já decididos ao suspender o sistema.",
      "Pôr o representante do fornecedor a decidir sobre a suspensão.",
      "Tratar o assento da sociedade civil como formalidade.",
      "Dizer que o EU AI Act obriga Moçambique, ou que já existe estratégia nacional aprovada.",
      "Medir o piloto apenas pelo resultado global, sem separar por grupo de submissão.",
    ],
  },
};

export const LICOES_M2: Record<string, ConteudoLicao> = {
  m2l1: M2L1,
  m2l2: M2L2,
  m2l3: M2L3,
  m2l4: M2L4,
};

export const DESCRICAO_M2 =
  "Quatro lições sobre o uso responsável da inteligência artificial no serviço público: casos de uso comparados, em seis critérios, com a alternativa sem inteligência artificial, e prática assistida de resumo e triagem de pedidos sintéticos sem qualquer decisão sobre direitos; protecção de dados e privacidade, com decisão campo a campo sobre minimizar, agregar ou remover, finalidade, acesso, retenção e eliminação, a diferença entre pseudonimização e anonimização e o desenho do fluxo de dados; preconceito algorítmico e inclusão, com cálculo dos dois tipos de erro por grupo sobre uma tabela fornecida por inteiro, origens da diferença e alternativa acessível; e supervisão humana, governação e prestação de contas, com composição de comité, matriz de risco, minuta de suspensão e distinção entre lei, recomendação internacional, estratégia e proposta em consulta pública.";
