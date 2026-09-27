/**
 * Conteúdo das 5 lições do curso «Tecnologias Digitais do Governo».
 *
 * REGRAS DESTE CONTEÚDO
 *  - Todos os casos, nomes, instituições, endereços de correio, números de
 *    processo e documentos são FICTÍCIOS e servem apenas de exercício.
 *  - Não se reproduzem ecrãs, botões, endereços, logótipos, páginas de entrada
 *    nem manuais internos dos sistemas reais. Onde a prática precisaria deles,
 *    há uma SIMULAÇÃO DIDÁCTICA marcada. Nunca se pedem credenciais nem dados
 *    reais.
 *  - Afirmações sobre o estado actual de um sistema só quando confirmadas em
 *    fonte oficial consultada; o resto é explicado como conceito geral.
 *  - As 2 questões formativas por lição são didácticas e comentadas; não fazem
 *    parte de nenhum banco de exame.
 *
 * Vive fora de src/ para não entrar no pacote do navegador.
 */
import {
  LICOES_PLANO,
  type LicaoPlano,
  type TemposLicao,
} from "../../src/lib/plano-tecnologias-governo";

export type Formativa = { pergunta: string; opcoes: string[]; certa: number; comentario: string };

export type ConteudoLicao = {
  objectivos: string[];
  explicacao: { titulo: string; paragrafos: string[] }[];
  distincoes?: string[];
  caso: { titulo: string; corpo: string[] };
  documentos: { titulo: string; linhas: string[] }[];
  actividade: { instrucoes: string[]; tarefas: string[] };
  papel: { tarefa: string; esperado: string }[];
  formativas: [Formativa, Formativa];
  leituraFacil: string[];
  guiao: { preparacao: string[]; conducao: string[]; errosComuns: string[] };
  fontes: { titulo: string; url?: string; nota: string }[];
};

const AVISO_SIMULACAO =
  "SIMULAÇÃO DIDÁCTICA: os dados, nomes e documentos abaixo são fictícios. Não é uma cópia do sistema real e não usa nenhum acesso real. Não escreva aqui palavras-passe nem dados verdadeiros.";

const FONTE_ATDI = {
  titulo: "ATDI, IP — Agência de Transformação Digital e Inovação",
  url: "https://atdi.gov.mz/",
  nota: "Entidade de referência para a transformação digital do Estado. Consultado a 27/09/2026.",
};
const FONTE_PG = {
  titulo: "Portal do Governo de Moçambique",
  url: "https://portaldogoverno.gov.mz/",
  nota: "Consultado a 27/09/2026: menu com Moçambique (informação geral, províncias e distritos, estatísticas), Governo (Conselho de Ministros, governos provinciais e distritais), Função Pública (processos administrativos, processo individual, procedimentos para a promoção do funcionário), Cidadão, Empresas, Imprensa e Contactos.",
};
const FONTE_PC = {
  titulo: "Portal do Cidadão",
  url: "https://portalcidadao.moz.mz/utentes",
  nota: "Portal de serviços ao cidadão. Consultado a 27/09/2026.",
};
const FONTE_INTIC = {
  titulo: "Propostas de articulado sobre interoperabilidade (INTIC, 2026)",
  nota: "Documento de trabalho; não equivale a lei aprovada.",
};

export const LICOES: Record<string, ConteudoLicao> = {
  "tdg-l1": {
    objectivos: [
      "Explicar para que serve um portal institucional do Governo e para que serve um portal de serviços ao cidadão.",
      "Orientar um cidadão para o canal adequado (portal informativo, portal de serviços, balcão presencial).",
      "Verificar se uma página é oficial antes de a indicar ao cidadão.",
    ],
    explicacao: [
      {
        titulo: "Dois tipos de portal, duas funções",
        paragrafos: [
          "Um portal do Governo é sobretudo um canal de informação: apresenta a organização do Estado, comunicados, legislação e orientações. O Portal do Governo de Moçambique, consultado a 27/09/2026, organiza-se em áreas como Moçambique, Governo, Função Pública, Cidadão, Empresas, Imprensa e Contactos; na área Função Pública aparecem, por exemplo, processos administrativos, processo individual e procedimentos para a promoção do funcionário.",
          "Um portal do cidadão é, em conceito, um balcão digital: reúne serviços que o cidadão pode pedir ou acompanhar sem se deslocar. Os serviços disponíveis e os passos para os pedir são os que constam do próprio portal: confirme-os sempre lá antes de orientar o cidadão.",
        ],
      },
      {
        titulo: "O papel do funcionário",
        paragrafos: [
          "O funcionário não substitui o portal nem o cidadão: orienta. Pergunta o que a pessoa precisa, indica o canal oficial, explica que documentos deve ter e oferece a alternativa presencial a quem não tem acesso, tem pouca ligação à internet ou tem uma deficiência que o portal não acomoda.",
          "Nunca se pede ao cidadão a sua palavra-passe para 'fazer por ele'. Se o cidadão precisar de ajuda, ele próprio escreve os seus dados; o funcionário orienta em voz alta.",
        ],
      },
      {
        titulo: "Página oficial ou imitação?",
        paragrafos: [
          "Antes de indicar um endereço, confirme que termina no domínio governamental conhecido (por exemplo .gov.mz), que foi obtido a partir de fonte oficial e não de mensagem recebida, e desconfie de páginas que pedem pagamentos ou palavras-passe por mensagem.",
        ],
      },
    ],
    distincoes: [
      "Portal informativo ≠ portal de serviços: um informa, o outro permite pedir ou acompanhar serviços.",
      "Orientar ≠ fazer pelo cidadão com a conta dele.",
    ],
    caso: {
      titulo: "Caso fictício: Secretaria Distrital de Mocuba (fictícia)",
      corpo: [
        "Dona Amélia Cossa, 58 anos, pede no balcão informação sobre como acompanhar um pedido que fez. O Sr. Jaime Mondlane, funcionário, recebeu na véspera uma promoção e quer saber onde consultar os procedimentos de promoção. Um terceiro utente, o Sr. Abel Nhantumbo, mostra no telemóvel uma mensagem com um endereço 'portal-cidadao-mz.com' que pede 50 MT para 'activar a conta'.",
      ],
    },
    documentos: [
      {
        titulo: "Documento 1 — Mensagem recebida pelo Sr. Abel (fictícia)",
        linhas: [
          "«Caro cidadão, a sua conta do portal será suspensa. Pague 50 MT para activar em portal-cidadao-mz.com e envie a sua palavra-passe para confirmação.»",
        ],
      },
      {
        titulo: "Documento 2 — Ficha de orientação ao utente (modelo em branco)",
        linhas: [
          "Nome do utente (só primeiro nome): ____",
          "O que precisa: ____",
          "Canal indicado: [ ] portal informativo [ ] portal de serviços [ ] balcão presencial",
          "Motivo: ____",
          "Documentos que deve levar ou ter: ____",
          "Alternativa oferecida: ____",
        ],
      },
    ],
    actividade: {
      instrucoes: [
        AVISO_SIMULACAO,
        "Em pares, preencham uma ficha de orientação (Documento 2) para cada um dos três utentes do caso. 20 minutos em pares, 10 minutos de discussão em plenário.",
      ],
      tarefas: [
        "Dona Amélia: que canal indica e que alternativa oferece se ela não tiver telemóvel com internet?",
        "Sr. Jaime: em que área do Portal do Governo procura os procedimentos de promoção?",
        "Sr. Abel: a mensagem é oficial? Indique três sinais e o que lhe diz.",
      ],
    },
    papel: [
      {
        tarefa: "Dona Amélia",
        esperado:
          "Portal de serviços para acompanhar o pedido, se o serviço lá estiver disponível — confirmado no portal oficial; alternativa: balcão presencial ou acompanhamento pelo funcionário sem usar a conta dela. Explicar em linguagem simples e por escrito.",
      },
      {
        tarefa: "Sr. Jaime",
        esperado: "Portal do Governo, área Função Pública, 'Procedimentos para a Promoção do Funcionário'.",
      },
      {
        tarefa: "Sr. Abel",
        esperado:
          "Não é oficial: domínio .com e não .gov.mz; pede pagamento por mensagem; pede palavra-passe. Dizer-lhe para não pagar nem responder, apagar a mensagem e usar só endereços obtidos em fonte oficial.",
      },
    ],
    formativas: [
      {
        pergunta:
          "Um utente pede ao funcionário que entre na conta dele no portal 'para ser mais rápido' e dita-lhe a palavra-passe. O que é mais correcto?",
        opcoes: [
          "Entrar, porque o utente autorizou.",
          "Recusar receber a palavra-passe e orientar o utente enquanto ele próprio escreve os seus dados, ou oferecer o balcão presencial.",
          "Anotar a palavra-passe para voltar a ajudar noutro dia.",
        ],
        certa: 1,
        comentario:
          "A palavra-passe é pessoal. Mesmo com autorização verbal, o funcionário fica associado a actos feitos em nome de outra pessoa. Orientar sem usar a conta protege o cidadão e o funcionário.",
      },
      {
        pergunta: "Qual é a diferença principal entre um portal informativo do Governo e um portal de serviços ao cidadão?",
        opcoes: [
          "Nenhuma: são nomes diferentes para a mesma coisa.",
          "O informativo apresenta organização, notícias e orientações; o de serviços permite pedir ou acompanhar serviços.",
          "O de serviços só serve empresas.",
        ],
        certa: 1,
        comentario:
          "Distinguir as funções ajuda a orientar o cidadão para o sítio certo à primeira e evita deslocações inúteis.",
      },
    ],
    leituraFacil: [
      "O Portal do Governo dá informação sobre o Estado.",
      "Um portal do cidadão serve para pedir serviços pela internet.",
      "Ajude o cidadão, mas nunca use a palavra-passe dele.",
      "Confirme que o endereço é oficial antes de o indicar.",
      "Quem não pode usar a internet tem sempre o balcão.",
    ],
    guiao: {
      preparacao: [
        "Imprimir três fichas de orientação por par e o Documento 1.",
        "Se houver projector e internet, abrir o Portal do Governo para mostrar o menu; caso contrário, ler a descrição da fonte em voz alta.",
        "Não abrir nem mostrar o endereço falso do caso: é fictício e pode existir ou vir a existir com conteúdo malicioso.",
      ],
      conducao: [
        "0–20 min: explicar as duas funções, o papel do funcionário e os sinais de página falsa.",
        "20–50 min: actividade em pares (20) e discussão (10), comparando com as respostas esperadas.",
        "50–60 min: 2 questões formativas, em voz alta ou em papel, com comentário.",
      ],
      errosComuns: [
        "Descrever passos do Portal do Cidadão sem os ter confirmado no próprio portal.",
        "Achar que 'autorização verbal' permite usar a conta do cidadão.",
      ],
    },
    fontes: [FONTE_PG, FONTE_PC, FONTE_ATDI],
  },

  "tdg-l2": {
    objectivos: [
      "Usar o correio electrónico institucional para comunicação de serviço: assunto claro, destinatários certos, anexos adequados.",
      "Reconhecer mensagens fraudulentas e saber a quem as reportar.",
      "Explicar que criar, alterar, suspender ou desactivar uma conta exige pedido de responsável autorizado e registo.",
    ],
    explicacao: [
      {
        titulo: "Uso do correio institucional",
        paragrafos: [
          "O correio electrónico do Governo (designado nos TdR como CorreioGov) identifica o remetente como agente de uma instituição pública. Por isso: usa-se para serviço, não para assuntos pessoais; o assunto diz o que é e o número do processo; escolhem-se destinatários com cuidado (Para, Cc, Bcc) e evita-se 'responder a todos' sem necessidade; dados pessoais de cidadãos só seguem a quem precisa deles para o serviço.",
          "Os princípios desta lição aplicam-se a qualquer programa de correio: siga também as instruções técnicas da sua instituição.",
        ],
      },
      {
        titulo: "Mensagens fraudulentas",
        paragrafos: [
          "Sinais típicos: urgência artificial, pedido de palavra-passe ou código, remetente parecido mas diferente, ligações que não correspondem ao texto, anexos inesperados. Na dúvida, não clique, não responda e reporte ao ponto focal de TI da sua instituição pelo canal interno conhecido.",
        ],
      },
      {
        titulo: "Gestão de contas: sempre com responsável autorizado",
        paragrafos: [
          "Gerir contas é criar, alterar dados, repor acesso, suspender e desactivar. Cada acção deve partir de um pedido do responsável autorizado da unidade (por exemplo, o chefe que confirma a entrada ou a saída do funcionário), ser executada por quem tem essa função técnica e ficar registada. Nunca se partilha uma conta pessoal entre várias pessoas; caixas partilhadas de serviço, quando existirem, têm responsável nomeado.",
          "Quando um funcionário sai ou muda de funções, a conta é suspensa ou ajustada no prazo definido pela instituição, e o correio de serviço é entregue a quem continua o trabalho, conforme as regras internas.",
        ],
      },
    ],
    distincoes: [
      "Gestão de contas exige responsável autorizado: um pedido por mensagem de alguém não identificado não chega.",
      "Conta pessoal ≠ caixa partilhada de serviço.",
    ],
    caso: {
      titulo: "Caso fictício: Direcção Provincial de Educação de Inhambane (fictícia)",
      corpo: [
        "A técnica Célia Machava gere as contas de correio da direcção. Numa segunda-feira recebe três mensagens. Tem também de responder a um cidadão, o Sr. Tomás Bila, que pediu por escrito informação sobre o seu processo n.º DPE-INH/2026/0147.",
      ],
    },
    documentos: [
      {
        titulo: "Mensagem A (fictícia)",
        linhas: [
          "De: suporte-correiogov@contas-verificacao.net",
          "Assunto: URGENTE — a sua caixa será apagada hoje",
          "«Confirme o seu utilizador e palavra-passe nesta ligação em 2 horas.»",
        ],
      },
      {
        titulo: "Mensagem B (fictícia)",
        linhas: [
          "De: director.dpe@[endereço institucional da direcção]",
          "Assunto: Entrada de novo técnico — pedido de conta",
          "«Solicito criação de conta para Hélio Sitoe, técnico pedagógico, início a 01/10/2026, conforme despacho n.º 12/DPE/2026 em anexo.»",
        ],
      },
      {
        titulo: "Mensagem C (fictícia)",
        linhas: [
          "De: ze.amigo.inh@correio-pessoal.com",
          "Assunto: conta da Luísa",
          "«Sou colega da Luísa Chaúque, ela saiu de licença. Mande-me a palavra-passe dela para eu ver os e-mails.»",
        ],
      },
      {
        titulo: "Ficha de pedido de conta (modelo)",
        linhas: [
          "Tipo: [ ] criar [ ] alterar [ ] repor acesso [ ] suspender [ ] desactivar",
          "Titular: ____ Função: ____ Unidade: ____",
          "Responsável que pede: ____ Documento de suporte: ____",
          "Data de efeito: ____ Executado por: ____ Data: ____",
        ],
      },
    ],
    actividade: {
      instrucoes: [
        AVISO_SIMULACAO,
        "Individualmente (20 min): trate as três mensagens e redija a resposta ao Sr. Tomás. Em grupo (20 min): comparem decisões e a resposta com as esperadas.",
      ],
      tarefas: [
        "Para cada mensagem A, B e C: é legítima? O que faz? Preencha a ficha de pedido quando se aplicar.",
        "Escreva a resposta ao Sr. Tomás: assunto, destinatário, corpo em linguagem clara, sem dados de outros cidadãos.",
      ],
    },
    papel: [
      {
        tarefa: "Mensagem A",
        esperado:
          "Fraudulenta: domínio externo, urgência, pede palavra-passe. Não clicar nem responder; reportar ao ponto focal de TI pelo canal interno.",
      },
      {
        tarefa: "Mensagem B",
        esperado:
          "Legítima se confirmada: vem do responsável autorizado e traz despacho. Preencher ficha (criar; titular Hélio Sitoe; técnico pedagógico; pedido pelo director; despacho 12/DPE/2026; efeito 01/10/2026) e executar conforme procedimento interno.",
      },
      {
        tarefa: "Mensagem C",
        esperado:
          "Recusar: remetente externo e não autorizado; palavras-passe nunca se entregam. Se a continuidade do serviço exigir acesso ao correio, só com pedido formal do responsável e conforme regras internas.",
      },
      {
        tarefa: "Resposta ao Sr. Tomás",
        esperado:
          "Assunto: 'Processo DPE-INH/2026/0147 — ponto de situação'; só para o Sr. Tomás; indica o estado, o próximo passo, o prazo previsto e um contacto; sem dados de terceiros.",
      },
    ],
    formativas: [
      {
        pergunta: "Um chefe de outro sector pede por telefone que desactive a conta de um funcionário da sua unidade. O que faz?",
        opcoes: [
          "Desactiva, porque é um chefe.",
          "Pede o pedido formal do responsável autorizado da unidade do titular, com documento de suporte, e regista.",
          "Muda a palavra-passe e envia-a ao chefe.",
        ],
        certa: 1,
        comentario:
          "Só o responsável autorizado da unidade do titular pode pedir, e o pedido deve ficar registado. Isto protege o titular e quem executa.",
      },
      {
        pergunta: "Qual destes é o melhor assunto para uma resposta a um cidadão?",
        opcoes: ["'Resposta'", "'Processo DPE-INH/2026/0147 — ponto de situação'", "'URGENTE!!!'"],
        certa: 1,
        comentario: "O assunto deve dizer o que é e identificar o processo, para que o cidadão e o arquivo o encontrem depois.",
      },
    ],
    leituraFacil: [
      "Use o correio do Governo só para trabalho.",
      "Escreva um assunto claro.",
      "Nunca dê a sua palavra-passe a ninguém.",
      "Se a mensagem parece falsa, não clique e avise a informática.",
      "Contas novas ou fechadas: só com pedido do chefe autorizado.",
    ],
    guiao: {
      preparacao: [
        "Imprimir as três mensagens, a ficha de pedido e uma folha para a resposta.",
        "Confirmar com a instituição quem é o ponto focal de TI e qual o procedimento interno de contas.",
      ],
      conducao: [
        "0–25 min: uso do correio, sinais de fraude, gestão de contas.",
        "25–65 min: actividade individual (20) e em grupo (20).",
        "65–75 min: questões formativas comentadas.",
      ],
      errosComuns: [
        "Tratar a mensagem B como válida sem confirmar o remetente pelo canal interno.",
        "Achar que 'colega' ou 'chefe' dispensa pedido formal.",
      ],
    },
    fontes: [
      { titulo: "TdR, secção 6.6 (Uso do CorreioGov; Gestão de contas do CorreioGov)", nota: "Tópicos do programa." },
      FONTE_ATDI,
    ],
  },

  "tdg-l3": {
    objectivos: [
      "Registar, classificar e encaminhar um documento num sistema de gestão documental.",
      "Explicar a diferença entre assinatura digital e imagem digitalizada de uma assinatura.",
      "Identificar quando um documento assinado digitalmente deve ser verificado antes de ser aceite.",
    ],
    explicacao: [
      {
        titulo: "Gestão documental",
        paragrafos: [
          "Um sistema de gestão documental acompanha o documento desde a entrada até ao arquivo: registo (número, data, remetente, assunto), classificação (tipo, processo a que pertence, grau de acesso), encaminhamento (a quem vai, com que prazo), despacho e arquivo. O valor está em saber sempre onde está o documento, quem o tem e o que falta fazer — e em responder ao cidadão sem 'o papel perdeu-se'.",
          "Um bom registo tem assunto descritivo, número único, ligação ao processo e grau de acesso correcto (documentos com dados pessoais não ficam visíveis a toda a instituição).",
        ],
      },
      {
        titulo: "Assinatura digital ≠ imagem de assinatura",
        paragrafos: [
          "Colar a imagem digitalizada de uma assinatura num PDF não prova quem assinou nem que o documento não foi alterado: qualquer pessoa pode copiar essa imagem. Uma assinatura digital usa um certificado associado ao signatário e técnicas criptográficas; permite verificar quem assinou e detectar qualquer alteração posterior.",
          "Os procedimentos concretos para obter certificado e assinar no Sistema de Assinatura Digital do Estado são definidos pela entidade gestora e seguem as instruções da sua instituição. O valor jurídico de cada tipo de assinatura depende da legislação aplicável; em caso de dúvida, consulte o jurista da instituição.",
        ],
      },
    ],
    distincoes: [
      "Assinatura digital ≠ imagem de assinatura colada.",
      "Digitalizar um papel ≠ ter um documento registado e rastreável.",
    ],
    caso: {
      titulo: "Caso fictício: Conselho Municipal da Vila de Namaacha (fictício)",
      corpo: [
        "Chegam à secretaria, no mesmo dia, três documentos. O secretário, Sr. Rui Tembe, tem de os registar e encaminhar. Um deles é um PDF com uma 'assinatura' que parece digitalizada.",
      ],
    },
    documentos: [
      {
        titulo: "Documento 1 — Requerimento (fictício)",
        linhas: [
          "Requerente: Marta Nhaca. Data: 22/09/2026.",
          "Assunto: Pedido de licença para banca no mercado municipal.",
          "Contém: cópia do BI (dado pessoal).",
        ],
      },
      {
        titulo: "Documento 2 — Ofício (fictício)",
        linhas: [
          "De: Direcção Provincial de Obras Públicas (fictícia). Ref.ª 88/DPOP/2026.",
          "Assunto: Pedido de informação sobre obras de drenagem, resposta em 10 dias úteis.",
        ],
      },
      {
        titulo: "Documento 3 — Declaração em PDF (fictícia)",
        linhas: [
          "Declaração de uma empresa fornecedora com imagem de assinatura e carimbo colados. Ao abrir, o leitor de PDF não mostra nenhuma informação de assinatura digital.",
        ],
      },
      {
        titulo: "Livro de registo (modelo)",
        linhas: [
          "N.º | Data | Remetente | Assunto | Processo | Grau de acesso | Encaminhado a | Prazo",
        ],
      },
    ],
    actividade: {
      instrucoes: [
        AVISO_SIMULACAO,
        "Em grupos de três (25 min): registem os três documentos no modelo, atribuindo números CMVN/2026/0301 a 0303. Plenário (15 min).",
      ],
      tarefas: [
        "Preencher uma linha por documento, com processo, grau de acesso, destino e prazo.",
        "Documento 3: pode ser tratado como assinado digitalmente? O que fazer?",
      ],
    },
    papel: [
      {
        tarefa: "Documento 1",
        esperado:
          "CMVN/2026/0301; 22/09/2026; Marta Nhaca; licença de banca no mercado; processo de licenciamento; acesso restrito (contém BI); encaminhado ao sector de mercados; prazo interno definido.",
      },
      {
        tarefa: "Documento 2",
        esperado:
          "CMVN/2026/0302; DPOP ref.ª 88/DPOP/2026; informação sobre drenagem; processo de obras; acesso interno; encaminhado ao sector de obras; prazo de 10 dias úteis anotado.",
      },
      {
        tarefa: "Documento 3",
        esperado:
          "CMVN/2026/0303; não é assinatura digital — é imagem colada, sem informação de assinatura verificável. Registar como tal e, se for exigida assinatura válida, pedir ao fornecedor o documento assinado digitalmente ou o original, conforme regras aplicáveis.",
      },
    ],
    formativas: [
      {
        pergunta: "Um PDF tem a imagem da assinatura do director colada. Isso garante que foi o director que o aprovou?",
        opcoes: [
          "Sim, a imagem é dele.",
          "Não: a imagem pode ser copiada e não permite verificar autoria nem alterações.",
          "Sim, se o PDF tiver carimbo.",
        ],
        certa: 1,
        comentario: "Só uma assinatura digital verificável liga o documento ao signatário e mostra se foi alterado depois.",
      },
      {
        pergunta: "Porque se atribui um grau de acesso ao registar um requerimento com cópia do BI?",
        opcoes: [
          "Para limitar a visibilidade de dados pessoais a quem precisa deles.",
          "Porque todos os documentos devem ser secretos.",
          "Não é necessário.",
        ],
        certa: 0,
        comentario: "Dados pessoais só devem ser vistos por quem trata o processo.",
      },
    ],
    leituraFacil: [
      "Cada documento recebe um número e uma data.",
      "Assim sabemos sempre onde está.",
      "Documentos com dados pessoais têm acesso limitado.",
      "Uma imagem de assinatura não é assinatura digital.",
      "A assinatura digital mostra quem assinou e se o documento mudou.",
    ],
    guiao: {
      preparacao: [
        "Imprimir os três documentos e o livro de registo.",
        "Opcional: ter um PDF didáctico sem assinatura para mostrar como o leitor indica 'sem assinatura'. Não usar documentos reais.",
      ],
      conducao: [
        "0–25 min: ciclo do documento; assinatura digital versus imagem.",
        "25–65 min: registo em grupo (25) e plenário (15).",
        "65–75 min: questões formativas.",
      ],
      errosComuns: [
        "Aceitar o Documento 3 como assinado.",
        "Deixar o requerimento com BI com acesso a toda a instituição.",
      ],
    },
    fontes: [
      { titulo: "TdR, secção 6.6 (Sistema de Gestão Documental; Sistema de Assinatura Digital)", nota: "Tópicos do programa." },
      FONTE_ATDI,
    ],
  },

  "tdg-l4": {
    objectivos: [
      "Guardar e partilhar ficheiros de trabalho na nuvem do Governo com permissões adequadas.",
      "Explicar porque a nuvem não é, por si só, uma cópia de segurança garantida.",
      "Identificar que assuntos do funcionário se tratam por uma plataforma do funcionário e agente do Estado e a quem recorrer quando falha.",
    ],
    explicacao: [
      {
        titulo: "CloudGov: guardar e partilhar com critério",
        paragrafos: [
          "Uma nuvem institucional (designada nos TdR como CloudGov) permite guardar ficheiros de trabalho num serviço gerido pelo Estado e partilhá-los com colegas, em vez de circular pen drives ou usar contas pessoais. Boas práticas: pastas por processo ou equipa; nomes de ficheiro com data e versão; partilha com pessoas nomeadas, só com leitura quando basta; retirar acessos quando o trabalho termina; nunca partilhar dados pessoais por ligação aberta a 'qualquer pessoa'.",
          "CloudGov ≠ backup garantido: se um ficheiro for apagado ou substituído por engano, ou a sincronização copiar um erro, a nuvem pode reproduzir esse erro. Se existem cópias de segurança, com que frequência e como se recuperam é definido pela entidade gestora — confirme com a ATDI ou o ponto focal antes de contar com isso.",
        ],
      },
      {
        titulo: "Plataforma do Funcionário e Agente do Estado",
        paragrafos: [
          "Uma plataforma do funcionário serve, em conceito, para o funcionário consultar e tratar assuntos da sua relação de trabalho com o Estado. O Portal do Governo apresenta, na área Função Pública, temas como processo individual e procedimentos para a promoção do funcionário — exemplos do tipo de assuntos em causa. As funções disponíveis na Plataforma do Funcionário e Agente do Estado e a forma de acesso são indicadas pelos recursos humanos da sua instituição.",
          "Cada funcionário usa só o seu acesso. Dados de colegas só são vistos por quem tem essa função (por exemplo, recursos humanos). Se encontrar um dado errado no seu registo, peça a correcção pelo canal indicado pelos recursos humanos, com documento de suporte.",
        ],
      },
    ],
    distincoes: [
      "CloudGov ≠ cópia de segurança garantida.",
      "Partilhar com pessoas nomeadas ≠ ligação aberta a qualquer pessoa.",
    ],
    caso: {
      titulo: "Caso fictício: Administração do Distrito de Chókwè (fictícia)",
      corpo: [
        "A equipa de planificação, chefiada pela Sra. Ana Muchanga, prepara o plano distrital. Hoje circula por pen drive e por contas pessoais. O técnico Felisberto Cumbe apagou por engano a versão final na pasta sincronizada. A técnica Joana Macuácua detectou que a sua data de ingresso aparece errada no registo de funcionária.",
      ],
    },
    documentos: [
      {
        titulo: "Lista de ficheiros da equipa (fictícia)",
        linhas: [
          "plano_final.docx; plano_final_FINAL2.docx; lista_beneficiarios_com_BI.xlsx; fotos_reuniao.zip; orcamento_v3.xlsx",
          "Pessoas: Ana (chefe), Felisberto, Joana, consultor externo Luís Guambe (contrato até 31/10/2026).",
        ],
      },
      {
        titulo: "Mensagem da Joana (fictícia)",
        linhas: [
          "«A minha data de ingresso aparece 2019, mas entrei em 2017. Tenho a guia de ingresso de 03/03/2017.»",
        ],
      },
    ],
    actividade: {
      instrucoes: [
        AVISO_SIMULACAO,
        "Em pares (25 min): proponham a organização e as permissões. Plenário (15 min).",
      ],
      tarefas: [
        "Proponha pastas, nomes de ficheiro e quem tem acesso de leitura ou edição a cada ficheiro.",
        "O ficheiro apagado pelo Felisberto: pode garantir-se a recuperação? O que fazer?",
        "O que deve a Joana fazer?",
      ],
    },
    papel: [
      {
        tarefa: "Organização e permissões",
        esperado:
          "Pasta 'Plano distrital 2027' com subpastas; nomes tipo '2026-09-27_plano_v4.docx'; Ana, Felisberto e Joana editam; Luís só leitura e só no que precisa, com acesso retirado a 31/10/2026; lista de beneficiários com BI restrita a quem trata, nunca por ligação aberta.",
      },
      {
        tarefa: "Ficheiro apagado",
        esperado:
          "Não se garante: depende das funções de recuperação e cópias definidas pela entidade gestora. Contactar de imediato o ponto focal; no futuro, manter versões e confirmar a política de cópias.",
      },
      {
        tarefa: "Joana",
        esperado:
          "Pedir correcção pelo canal indicado pelos recursos humanos, juntando a guia de ingresso; não pedir a colegas que alterem o registo.",
      },
    ],
    formativas: [
      {
        pergunta: "Guardar tudo na nuvem do Governo significa que nunca se perde um ficheiro?",
        opcoes: [
          "Sim, a nuvem faz sempre cópia.",
          "Não necessariamente: apagamentos e erros podem ser sincronizados; a recuperação depende da política da entidade gestora.",
          "Sim, desde que o ficheiro seja pequeno.",
        ],
        certa: 1,
        comentario: "Confirme com a ATDI ou o ponto focal que cópias existem antes de contar com elas.",
      },
      {
        pergunta: "Um consultor externo precisa de ler um relatório. Qual é a partilha mais adequada?",
        opcoes: [
          "Ligação aberta a qualquer pessoa, com edição.",
          "Partilha só com ele, só de leitura, retirada no fim do contrato.",
          "Enviar a palavra-passe da equipa.",
        ],
        certa: 1,
        comentario: "Mínimo acesso necessário, pelo tempo necessário.",
      },
    ],
    leituraFacil: [
      "Guarde os ficheiros de trabalho na nuvem do Governo.",
      "Partilhe só com quem precisa.",
      "A nuvem nem sempre recupera um ficheiro apagado.",
      "Use só o seu acesso na plataforma do funcionário.",
      "Se um dado seu estiver errado, peça a correcção aos recursos humanos.",
    ],
    guiao: {
      preparacao: [
        "Imprimir a lista de ficheiros e a mensagem da Joana.",
        "Confirmar com o ponto focal a política de cópias da CloudGov e, com os recursos humanos, as funções da plataforma do funcionário.",
      ],
      conducao: [
        "0–25 min: nuvem, permissões, limites; plataforma do funcionário.",
        "25–65 min: pares (25) e plenário (15).",
        "65–75 min: questões formativas.",
      ],
      errosComuns: [
        "Prometer que a nuvem recupera tudo.",
        "Deixar o consultor com acesso depois do contrato.",
      ],
    },
    fontes: [
      FONTE_PG,
      { titulo: "TdR, secção 6.6 (Uso da CloudGov; Plataforma do Funcionário e Agente do Estado)", nota: "Tópicos do programa." },
    ],
  },

  "tdg-l5": {
    objectivos: [
      "Explicar a interoperabilidade como troca controlada de dados entre sistemas públicos para não pedir ao cidadão o que o Estado já tem.",
      "Distinguir interoperabilidade de partilha livre de dados: finalidade, base legal, mínimo necessário e registo.",
      "Integrar os oito tópicos anteriores num percurso de serviço ao cidadão.",
    ],
    explicacao: [
      {
        titulo: "O que é interoperabilidade",
        paragrafos: [
          "Interoperabilidade é a capacidade de sistemas de instituições diferentes trocarem dados de forma segura e compreensível. Exemplo conceptual: em vez de o cidadão ir a outra instituição buscar uma certidão, o serviço consulta a informação necessária, se houver base para isso, e regista a consulta.",
          "Interoperabilidade ≠ partilha livre de dados. Cada troca deve ter: finalidade definida; base legal ou acordo que a permita; só os dados necessários (por exemplo, 'sim/não, está inscrito' em vez do registo completo); quem pode pedir; e registo de quem consultou o quê e quando.",
          "Existem propostas de articulado sobre interoperabilidade (INTIC, 2026) que não equivalem a lei aprovada; por isso não são citadas como obrigatórias. O quadro legal aplicável é confirmado com os juristas da instituição.",
        ],
      },
      {
        titulo: "Integração dos tópicos",
        paragrafos: [
          "Um serviço digital completo junta tudo: o cidadão encontra informação (Portal do Governo) e pede o serviço (Portal do Cidadão ou balcão); o pedido é registado e encaminhado (gestão documental); comunica-se por correio institucional com contas bem geridas; os ficheiros de trabalho ficam na nuvem com permissões; a decisão é assinada digitalmente; dados de outras instituições chegam por interoperabilidade; e o funcionário trata a sua própria situação na plataforma do funcionário.",
        ],
      },
    ],
    distincoes: [
      "Interoperabilidade ≠ partilha livre de dados.",
      "Propostas INTIC 2026 ≠ lei aprovada.",
    ],
    caso: {
      titulo: "Caso fictício: pedido de apoio escolar no Distrito de Moamba (fictício)",
      corpo: [
        "A Sra. Lurdes Novela pede um apoio escolar para a filha. O regulamento fictício exige prova de matrícula e prova de residência. Hoje, a secretaria manda-a buscar papéis a duas instituições. A chefe propõe usar interoperabilidade.",
      ],
    },
    documentos: [
      {
        titulo: "Pedido de dados A (fictício)",
        linhas: [
          "De: secretaria distrital. Para: sistema escolar (fictício).",
          "Pedido: 'Enviar lista completa de todos os alunos do distrito, com nomes dos pais, moradas e notas, para cruzarmos quando precisarmos.'",
        ],
      },
      {
        titulo: "Pedido de dados B (fictício)",
        linhas: [
          "Pedido: 'Para o processo MOA/2026/0412, confirmar se a aluna com o n.º de estudante 55-0931 está matriculada em 2026 (sim/não).'",
          "Finalidade: apoio escolar. Base: acordo entre instituições n.º 3/2026 (fictício). Pedido registado por: técnico Samuel Mahumane.",
        ],
      },
      {
        titulo: "Grelha do percurso (modelo)",
        linhas: ["Passo | O que acontece | Sistema ou tópico usado | Cuidado a ter"],
      },
    ],
    actividade: {
      instrucoes: [
        AVISO_SIMULACAO,
        "Em grupos (25 min): analisem os pedidos A e B e preencham a grelha do percurso do pedido da Sra. Lurdes, do primeiro contacto à decisão. Plenário de integração (15 min).",
      ],
      tarefas: [
        "Qual dos pedidos respeita os princípios? Justifique com finalidade, base, mínimo necessário e registo.",
        "Preencha a grelha com pelo menos 7 passos, usando os 9 tópicos do curso.",
      ],
    },
    papel: [
      {
        tarefa: "Pedidos A e B",
        esperado:
          "A viola: sem finalidade concreta, dados excessivos (pais, moradas, notas), 'para quando precisarmos'. B respeita: finalidade e processo identificados, base indicada, resposta mínima sim/não, pedido registado com responsável.",
      },
      {
        tarefa: "Grelha",
        esperado:
          "1 informação no Portal do Governo; 2 pedido no Portal do Cidadão ou balcão (alternativa presencial); 3 registo e classificação na gestão documental (acesso restrito); 4 confirmação de matrícula por interoperabilidade (pedido B); 5 comunicação com a requerente por correio institucional, se ela tiver endereço, ou outro canal indicado; 6 ficheiros de análise na CloudGov com partilha restrita; 7 decisão assinada digitalmente; 8 contas da equipa geridas por responsável autorizado; 9 o técnico trata assuntos próprios na plataforma do funcionário (não se aplica ao pedido, mas faz parte do ecossistema).",
      },
    ],
    formativas: [
      {
        pergunta: "Interoperabilidade significa que qualquer instituição pode ver todos os dados de outra?",
        opcoes: [
          "Sim, é para isso que serve.",
          "Não: cada troca precisa de finalidade, base, dados mínimos e registo.",
          "Sim, desde que seja dentro do Estado.",
        ],
        certa: 1,
        comentario: "Trocar só o necessário, com base e registo, protege o cidadão e dá confiança ao serviço digital.",
      },
      {
        pergunta: "As propostas de articulado INTIC 2026 sobre interoperabilidade são lei em vigor?",
        opcoes: [
          "Sim.",
          "Não: são propostas e não equivalem a lei aprovada.",
          "Só nas províncias.",
        ],
        certa: 1,
        comentario: "Não se deve citar como obrigatório o que ainda não foi aprovado.",
      },
    ],
    leituraFacil: [
      "Interoperabilidade: os sistemas do Estado falam entre si.",
      "Assim o cidadão não tem de ir buscar papéis que o Estado já tem.",
      "Mas só se partilha o necessário, com motivo e registo.",
      "Um serviço digital usa vários sistemas juntos.",
      "Quem não usa internet continua a ser atendido.",
    ],
    guiao: {
      preparacao: [
        "Imprimir os pedidos A e B e uma grelha grande por grupo.",
        "Rever os tópicos das lições 1 a 4 para a integração.",
      ],
      conducao: [
        "0–25 min: interoperabilidade e princípios; integração dos tópicos.",
        "25–65 min: grupos (25) e plenário (15).",
        "65–75 min: questões formativas e ponte para a revisão antes do exame.",
      ],
      errosComuns: [
        "Aceitar o pedido A por ser 'entre instituições do Estado'.",
        "Apresentar propostas INTIC como lei.",
      ],
    },
    fontes: [FONTE_INTIC, FONTE_ATDI],
  },
};

// ---------- geração de HTML ----------

const esc = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const ul = (xs: string[]) => `<ul>${xs.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
const ol = (xs: string[]) => `<ol>${xs.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>`;

export function montarElearning(c: ConteudoLicao, l: LicaoPlano): string {
  const t = l.tempos;
  const partes: string[] = [];
  partes.push(
    `<p><strong>Duração:</strong> ${l.minutos} minutos (explicação ${t.explicacao}, actividade ${t.actividade}, verificação ${t.formativa}). Tópicos dos TdR: ${esc(l.topicos.join("; "))}.</p>`,
  );
  partes.push(`<h2>Objectivos</h2>${ul(c.objectivos)}`);
  for (const e of c.explicacao) {
    partes.push(`<h2>${esc(e.titulo)}</h2>${e.paragrafos.map((p) => `<p>${esc(p)}</p>`).join("")}`);
  }
  if (c.distincoes?.length) partes.push(`<h2>Não confundir</h2>${ul(c.distincoes)}`);
  partes.push(`<h2>${esc(c.caso.titulo)}</h2>${c.caso.corpo.map((p) => `<p>${esc(p)}</p>`).join("")}`);
  partes.push(
    `<h2>Documentos de exemplo (fictícios)</h2>${c.documentos
      .map((d) => `<h3>${esc(d.titulo)}</h3>${ul(d.linhas)}`)
      .join("")}`,
  );
  partes.push(`<h2>Actividade</h2>${c.actividade.instrucoes.map((p) => `<p>${esc(p)}</p>`).join("")}${ol(c.actividade.tarefas)}`);
  partes.push(
    `<h2>Versão em papel: respostas esperadas</h2><dl>${c.papel
      .map((p) => `<dt><strong>${esc(p.tarefa)}</strong></dt><dd>${esc(p.esperado)}</dd>`)
      .join("")}</dl>`,
  );
  partes.push(
    `<h2>Verifique o que aprendeu</h2>${c.formativas
      .map(
        (f, i) =>
          `<h3>Questão ${i + 1}</h3><p>${esc(f.pergunta)}</p>${ol(f.opcoes)}<details><summary>Ver resposta comentada</summary><p>Resposta: ${esc(f.opcoes[f.certa] ?? "")}</p><p>${esc(f.comentario)}</p></details>`,
      )
      .join("")}`,
  );
  partes.push(`<h2>Em leitura fácil</h2>${ul(c.leituraFacil)}`);
  partes.push(
    `<h2>Fontes</h2>${ul(c.fontes.map((f) => `${f.titulo}${f.url ? ` (${f.url})` : ""} — ${f.nota}`))}`,
  );
  return partes.join("\n");
}

export function montarGuiao(c: ConteudoLicao, l: LicaoPlano): string {
  return [
    `<h2>Guião do formador — ${esc(l.titulo)}</h2>`,
    `<p>${l.minutos} minutos. Presencial.</p>`,
    `<h3>Preparação</h3>${ul(c.guiao.preparacao)}`,
    `<h3>Condução</h3>${ul(c.guiao.conducao)}`,
    `<h3>Erros comuns a corrigir</h3>${ul(c.guiao.errosComuns)}`,
    `<h3>Acessibilidade</h3>${ul([
      "Ler em voz alta todos os documentos e perguntas; aceitar respostas orais.",
      "Entregar versão em papel em letra grande a quem precisar.",
      "Não exigir internet: todas as actividades funcionam em papel.",
    ])}`,
  ].join("\n");
}

export type LicaoMontada = { ordem: number; titulo: string; minutos: number; elearning: string; guiao: string };

export function montarTodas(): LicaoMontada[] {
  return LICOES_PLANO.map((l) => {
    const c = LICOES[l.chave];
    if (!c) throw new Error(`Sem conteúdo para ${l.chave}`);
    return { ordem: l.ordem, titulo: l.titulo, minutos: l.minutos, elearning: montarElearning(c, l), guiao: montarGuiao(c, l) };
  });
}

export type { TemposLicao };
