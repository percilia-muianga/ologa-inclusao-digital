/**
 * BANCO DE AVALIAÇÃO do curso «Introdução à Inteligência Artificial».
 *
 * Ficheiro PRIVADO: vive fora de src/ e fora de public/. Enunciados, gabaritos
 * e explicações nunca entram no pacote do navegador, nas páginas das lições nem
 * em qualquer resposta pública. Só o integrador restrito os carrega para a base
 * de dados, e sempre INACTIVOS.
 *
 * Dois instrumentos separados:
 * - EXAME_IA: 80 questões finais. A secção 10 do Termo de Referência (páginas
 *   24 e 25) exige um banco com pelo menos o triplo das questões usadas em cada
 *   exame e dá o exemplo de 80 questões para uma prova de 20. A prova proposta
 *   de 20 itens em 60 minutos é PROPOSTA PEDAGÓGICA da Ologa, por validar pela
 *   ATDI; não é número imposto pelo TdR.
 * - DIAGNOSTICO_IA: 10 questões de diagnóstico e pós-teste, de baixo impacto.
 *   Não integram as 80, não entram no sorteio do exame e não certificam.
 *
 * Matriz do banco (80):
 *   Módulo 1 = 36 (9 por lição), Módulo 2 = 36 (9 por lição), transversal = 8.
 *   Tipos: 32 escolha múltipla, 16 verdadeiro/falso, 16 associação, 16 cenário.
 *   Dificuldade: 32 fáceis, 32 médias, 16 difíceis.
 * Matriz por lição, em cada módulo temático:
 *   L1 = em 4, vf 2, cor 2, cen 1 | 4 fáceis, 4 médias, 1 difícil
 *   L2 = em 4, vf 2, cor 2, cen 1 | 4 fáceis, 3 médias, 2 difíceis
 *   L3 = em 3, vf 2, cor 2, cen 2 | 3 fáceis, 4 médias, 2 difíceis
 *   L4 = em 3, vf 1, cor 1, cen 4 | 3 fáceis, 3 médias, 3 difíceis
 *   Transversal = em 4, vf 2, cor 2 | 4 fáceis, 4 médias (sem difíceis, sem cenário)
 *
 * «cenario» é categoria pedagógica própria, mesmo usando escolha múltipla ou
 * verdadeiro/falso como formato de resposta. Todos os cenários trazem os dados
 * necessários no próprio enunciado e têm solução objectiva.
 *
 * Instituições, pessoas, números e casos são FICTÍCIOS e servem de exercício.
 * As afirmações jurídicas seguem as fontes já verificadas nas lições: o
 * Regulamento Europeu de Inteligência Artificial não é lei moçambicana e não se
 * aplica automaticamente a Moçambique, mas o seu artigo 2.º prevê alcance
 * condicional a operadores fora da União quando as saídas são usadas na União;
 * o INTIC divulgou uma proposta para consulta, o que não é aprovação nem
 * garantia de consulta ainda aberta. Não se afirma nenhuma lei moçambicana de
 * inteligência artificial aprovada.
 *
 * Estado editorial: rascunho por validar pela Ologa/ATDI. Nada aqui está
 * pedagogicamente aprovado.
 */

export type QuestaoIA = {
  /** Código interno estável do item. */
  cod: string;
  m: "m1" | "m2" | "transversal";
  /** Ordem da lição de origem dentro do módulo. */
  l: number;
  t: "em" | "vf" | "cor";
  /** Categoria pedagógica «cenário». */
  cen?: true;
  d: "f" | "me" | "di";
  e: string;
  opts?: string[];
  ind?: number;
  val?: boolean;
  pares?: { esquerda: string; direita: string }[];
  exp: string;
  /** Objectivo de aprendizagem e competência associada. */
  obj: string;
};

// ===========================================================================
// MÓDULO 1 — Fundamentos de Inteligência Artificial (36)
// ===========================================================================

const M1L1: QuestaoIA[] = [
  {
    cod: "IA-M1L1-01", m: "m1", l: 1, t: "em", d: "f",
    e: "Um sistema informático recebe pedidos escritos e produz, para cada um, uma sugestão de encaminhamento que a chefia usa para distribuir o trabalho. Segundo a definição de sistema de inteligência artificial estudada na lição, qual é o elemento que torna esta descrição compatível com essa definição?",
    opts: [
      "O sistema estar instalado em servidor da própria instituição, sob gestão da equipa interna, sem qualquer serviço contratado no exterior",
      "O sistema produzir, a partir das entradas que recebe, saídas como previsões ou recomendações que influenciam decisões",
      "O sistema ter sido adquirido a um fornecedor internacional através de concurso público",
      "O sistema funcionar sem ligação permanente à internet, em computadores da repartição",
    ], ind: 1,
    exp: "A definição assenta na relação entre entradas e saídas com influência em ambientes ou decisões: previsões, recomendações, classificações. O local de instalação, o fornecedor e a ligação à internet são circunstâncias técnicas e não entram na definição.",
    obj: "Reconhecer a definição operacional de sistema de inteligência artificial. Lição 1 do módulo 1.",
  },
  {
    cod: "IA-M1L1-02", m: "m1", l: 1, t: "em", d: "f",
    e: "Uma repartição fictícia usa um programa que rejeita automaticamente qualquer formulário em que o campo «número de identificação» esteja vazio. A regra foi escrita por um técnico e está no código. Porque é que este programa, tal como descrito, não é um exemplo de aprendizagem automática?",
    opts: [
      "Porque a decisão resulta de uma regra fixa escrita por pessoas, e não de um padrão extraído de exemplos",
      "Porque trata poucos formulários por dia e não precisa de grande capacidade de cálculo",
      "Porque funciona localmente, sem consultar qualquer serviço através da internet",
      "Porque a decisão produzida é sempre a mesma, independentemente do formulário recebido e do momento em que é submetido",
    ], ind: 0,
    exp: "A automatização por regras fixas executa instruções explícitas. Na aprendizagem automática, o comportamento é derivado de exemplos, não escrito à mão regra a regra. O volume, a ligação de rede e o sentido da decisão não distinguem os dois casos.",
    obj: "Distinguir automatização por regras de aprendizagem automática. Lição 1 do módulo 1.",
  },
  {
    cod: "IA-M1L1-03", m: "m1", l: 1, t: "em", d: "me",
    e: "Um assistente de escrita baseado em modelos de linguagem devolve um parágrafo bem construído, com a citação de um diploma e um número de artigo. O texto lê-se de forma convincente. Que conclusão é legítima retirar daqui?",
    opts: [
      "Que a citação está correcta, por o modelo ter sido treinado com documentação oficial fiável e mantida actualizada pelo fornecedor",
      "Que o texto é plausível na forma e que a referência tem de ser confirmada na fonte antes de ser usada",
      "Que o texto pode ser usado tal como está, por estar redigido em linguagem administrativa",
      "Que o modelo consultou a legislação em vigor no momento exacto em que produziu a resposta",
    ], ind: 1,
    exp: "Estes modelos produzem texto estatisticamente plausível; a plausibilidade da forma não é prova do conteúdo. Referências, números e citações verificam-se sempre na fonte original antes de qualquer uso oficial.",
    obj: "Reconhecer os limites de fiabilidade da saída de modelos de linguagem. Lição 1 do módulo 1.",
  },
  {
    cod: "IA-M1L1-04", m: "m1", l: 1, t: "em", d: "me",
    e: "Numa sessão de formação, quatro participantes descrevem sistemas usados no trabalho. Qual das descrições corresponde mais claramente a um sistema de inteligência artificial, e não a um sistema informático comum?",
    opts: [
      "Uma folha de cálculo que soma automaticamente as colunas de um mapa mensal e assinala totais",
      "Um sistema de gestão documental que arquiva os ficheiros por pasta, assunto e data de entrada, com pesquisa por palavra do título",
      "Um serviço que transcreve gravações de reuniões em texto, com taxa de erro variável conforme o sotaque",
      "Um sítio na internet que apresenta os horários de atendimento e os contactos de cada sector",
    ], ind: 2,
    exp: "A transcrição automática de voz aprende padrões a partir de exemplos e o seu desempenho varia com as características do áudio, incluindo o sotaque. As restantes descrevem cálculo determinístico, armazenamento e publicação de informação.",
    obj: "Identificar sistemas de inteligência artificial em ambientes de trabalho reais. Lição 1 do módulo 1.",
  },
  {
    cod: "IA-M1L1-05", m: "m1", l: 1, t: "vf", d: "f",
    e: "Verdadeiro ou falso: dizer que um sistema «tem inteligência artificial» é suficiente para garantir que as suas respostas estão correctas.",
    val: false,
    exp: "Falso. A designação descreve a família de técnicas usada, não a qualidade das respostas. A correcção depende dos dados, do desenho do sistema, do contexto de uso e da verificação humana.",
    obj: "Separar a designação tecnológica da garantia de qualidade. Lição 1 do módulo 1.",
  },
  {
    cod: "IA-M1L1-06", m: "m1", l: 1, t: "vf", d: "me",
    e: "Verdadeiro ou falso: um mesmo pedido, feito duas vezes a um assistente baseado em modelo de linguagem, pode dar respostas diferentes sem que nada tenha sido alterado no sistema.",
    val: true,
    exp: "Verdadeiro. A geração de texto envolve escolhas com componente aleatória, pelo que a mesma instrução pode produzir formulações diferentes. Isto reforça a necessidade de verificar cada saída, e não de confiar numa verificação feita uma vez.",
    obj: "Compreender a variabilidade das saídas geradas. Lição 1 do módulo 1.",
  },
  {
    cod: "IA-M1L1-07", m: "m1", l: 1, t: "cor", d: "f",
    e: "Associe cada exemplo à categoria correcta, conforme a classificação usada na lição.",
    pares: [
      { esquerda: "Programa que ordena uma lista por data de entrada", direita: "Automatização por regras fixas" },
      { esquerda: "Sistema que sugere a que sector encaminhar um pedido, a partir de exemplos anteriores", direita: "Aprendizagem automática" },
      { esquerda: "Assistente que redige um rascunho de ofício a partir de uma instrução escrita", direita: "Inteligência artificial generativa" },
      { esquerda: "Formulário em papel preenchido e arquivado pelo funcionário", direita: "Processo sem componente informática" },
    ],
    exp: "A separação faz-se pela origem do comportamento: instruções escritas à mão, padrões aprendidos de exemplos, geração de conteúdo novo, ou ausência de sistema informático.",
    obj: "Classificar exemplos segundo a origem do comportamento do sistema. Lição 1 do módulo 1.",
  },
  {
    cod: "IA-M1L1-08", m: "m1", l: 1, t: "cor", d: "me",
    e: "Associe cada afirmação sobre um assistente de escrita à sua natureza.",
    pares: [
      { esquerda: "Produz uma resposta em poucos segundos", direita: "Característica observável do serviço" },
      { esquerda: "Compreende o sentido jurídico do documento", direita: "Atribuição não demonstrada" },
      { esquerda: "Indicou um artigo que não existe no diploma citado", direita: "Erro verificável na fonte" },
      { esquerda: "Deve ser revisto por quem assina o documento", direita: "Regra de uso responsável" },
    ],
    exp: "Distinguir o que se observa, o que se atribui sem prova, o que se verifica documentalmente e o que é regra de trabalho evita tanto o deslumbramento como a rejeição sem fundamento.",
    obj: "Separar observação, atribuição, verificação e regra de uso. Lição 1 do módulo 1.",
  },
  {
    cod: "IA-M1L1-09", m: "m1", l: 1, t: "em", cen: true, d: "di",
    e: "Caso fictício. A Direcção de Serviços de Nantiwe recebe 240 pedidos por mês. Um sistema de sugestão de encaminhamento foi testado num mês completo: sugeriu o sector correcto em 192 pedidos e o sector errado em 48. Dos 48 errados, 30 foram detectados pelo funcionário antes do envio e 18 seguiram para o sector errado, atrasando o processo em média 6 dias úteis. A chefia afirma: «o sistema acerta em mais de três quartos dos casos, portanto pode passar a encaminhar sozinho». Qual é a leitura tecnicamente correcta destes dados?",
    opts: [
      "A chefia tem razão: 192 em 240 são 80 por cento, valor acima dos três quartos que invocou, pelo que a verificação deixa de ser necessária",
      "Os dados só permitem concluir que houve 18 encaminhamentos errados efectivos, o que não sustenta a retirada da verificação humana",
      "O sistema deve ser desligado de imediato, por ter errado 48 vezes no período observado",
      "Os dados são inconclusivos, por não se saber quantos pedidos foram efectivamente recebidos",
    ], ind: 1,
    exp: "192 em 240 é de facto 80 por cento, mas a taxa de acerto sozinha não justifica retirar a verificação: foi precisamente a verificação humana que impediu 30 dos 48 erros. Sem ela, os erros efectivos passariam de 18 para 48. Desligar o sistema também não decorre dos dados, que mostram utilidade com supervisão.",
    obj: "Interpretar taxas de acerto e o efeito da verificação humana. Lição 1 do módulo 1.",
  },
];

const M1L2: QuestaoIA[] = [
  {
    cod: "IA-M1L2-01", m: "m1", l: 2, t: "em", d: "f",
    e: "Numa tabela de pedidos de licença, cada linha representa um pedido e cada coluna uma informação sobre esse pedido. Na terminologia usada na lição, como se designam as colunas usadas pelo sistema para aprender?",
    opts: [
      "Registos, isto é, cada um dos pedidos da tabela",
      "Variáveis, também ditas atributos do pedido",
      "Modelos, resultantes do processo de treino",
      "Algoritmos de aprendizagem automática",
    ], ind: 1,
    exp: "As linhas são registos ou observações; as colunas usadas como informação de entrada são variáveis ou atributos. O algoritmo é o procedimento de aprendizagem e o modelo é o resultado desse procedimento.",
    obj: "Usar correctamente o vocabulário de dados tabulares. Lição 2 do módulo 1.",
  },
  {
    cod: "IA-M1L2-02", m: "m1", l: 2, t: "em", d: "f",
    e: "Qual das seguintes frases descreve correctamente a diferença entre algoritmo e modelo?",
    opts: [
      "O algoritmo é o procedimento que aprende a partir dos dados; o modelo é o resultado obtido, que depois é usado para produzir saídas",
      "O algoritmo é o equipamento onde o sistema corre; o modelo é o programa nele instalado e configurado pela equipa informática da instituição",
      "São a mesma coisa, designada de maneiras diferentes conforme o fornecedor e a documentação técnica",
      "O modelo é o procedimento de treino aplicado aos dados; o algoritmo é o ficheiro final que se utiliza",
    ], ind: 0,
    exp: "O algoritmo é o método de aprendizagem. Aplicado a um conjunto de dados, produz um modelo, que é o objecto utilizado depois para classificar, prever ou recomendar.",
    obj: "Distinguir algoritmo de modelo. Lição 2 do módulo 1.",
  },
  {
    cod: "IA-M1L2-03", m: "m1", l: 2, t: "em", d: "me",
    e: "Uma equipa vai treinar um sistema de apoio à triagem com registos dos últimos três anos. Ao rever a tabela, encontra 140 linhas com o distrito por preencher, todas provenientes do atendimento por telefone. Qual é a leitura mais correcta desta situação?",
    opts: [
      "É irrelevante: 140 linhas representam uma parte pequena de um conjunto de grande dimensão",
      "Deve preencher-se o distrito com o valor mais frequente do conjunto, para não perder registos úteis na fase de treino do sistema",
      "A falta não é aleatória — está associada a um canal de atendimento — e pode enviesar o que o sistema aprende sobre esse canal",
      "Devem apagar-se as 140 linhas afectadas, por não ser possível recuperar o distrito em falta",
    ], ind: 2,
    exp: "Falta associada a um canal específico é falta sistemática, não aleatória. Preencher com o valor mais frequente inventa informação e apagar elimina justamente um grupo de casos. O primeiro passo é documentar a causa e decidir com essa causa à vista.",
    obj: "Reconhecer dados em falta não aleatórios e o seu efeito. Lição 2 do módulo 1.",
  },
  {
    cod: "IA-M1L2-04", m: "m1", l: 2, t: "em", d: "di",
    e: "Uma tabela fictícia de 1 000 pedidos inclui a coluna «resultado final» e a coluna «data de despacho», esta última preenchida apenas depois de a decisão ser tomada. A equipa quer prever o resultado final no momento da entrada do pedido. Qual é o problema em usar a data de despacho como variável de entrada?",
    opts: [
      "A coluna está em formato de data e os procedimentos de treino aceitam apenas valores numéricos",
      "A coluna não existe no momento em que a previsão tem de ser feita, pelo que o desempenho medido no treino não se repete na prática",
      "A coluna assume demasiados valores diferentes para ser tratada como variável de entrada",
      "A coluna deve ser usada precisamente por melhorar de forma clara o resultado medido no treino e nos ensaios internos de avaliação da equipa",
    ], ind: 1,
    exp: "É informação que só existe depois do facto a prever. Usá-la inflaciona artificialmente o desempenho medido e o sistema falha quando entra em uso real, porque nessa altura a coluna está vazia. A avaliação tem de respeitar o momento em que a decisão é tomada.",
    obj: "Identificar informação indisponível no momento da decisão. Lição 2 do módulo 1.",
  },
  {
    cod: "IA-M1L2-05", m: "m1", l: 2, t: "vf", d: "f",
    e: "Verdadeiro ou falso: aumentar a quantidade de dados corrige, por si só, erros sistemáticos de registo presentes na forma como esses dados são recolhidos.",
    val: false,
    exp: "Falso. Mais dados recolhidos da mesma maneira reproduzem o mesmo erro sistemático com maior confiança aparente. Corrigir exige mudar a recolha ou tratar explicitamente o erro identificado.",
    obj: "Compreender que volume não corrige viés de recolha. Lição 2 do módulo 1.",
  },
  {
    cod: "IA-M1L2-06", m: "m1", l: 2, t: "vf", d: "me",
    e: "Verdadeiro ou falso: num conjunto de dados usado para treino, a coluna que o sistema deve aprender a prever chama-se variável alvo.",
    val: true,
    exp: "Verdadeiro. A variável alvo é aquilo que se pretende prever ou classificar; as restantes colunas usadas como informação de entrada são as variáveis explicativas.",
    obj: "Identificar a variável alvo num conjunto de treino. Lição 2 do módulo 1.",
  },
  {
    cod: "IA-M1L2-07", m: "m1", l: 2, t: "cor", d: "f",
    e: "Associe cada elemento ao seu papel no processo de aprendizagem.",
    pares: [
      { esquerda: "Conjunto de exemplos com o resultado já conhecido", direita: "Dados de treino" },
      { esquerda: "Procedimento que ajusta o sistema aos exemplos", direita: "Algoritmo" },
      { esquerda: "Objecto obtido no fim do treino e usado depois", direita: "Modelo" },
      { esquerda: "Conjunto reservado, não usado no treino, para medir o desempenho", direita: "Conjunto de teste" },
    ],
    exp: "Cada peça tem função distinta: exemplos, procedimento, resultado e medição independente. Confundir treino com teste é o erro mais comum e produz números de desempenho enganadores.",
    obj: "Relacionar dados, algoritmo, modelo e avaliação. Lição 2 do módulo 1.",
  },
  {
    cod: "IA-M1L2-08", m: "m1", l: 2, t: "cor", d: "me",
    e: "Associe cada problema de qualidade de dados ao exemplo que melhor o ilustra.",
    pares: [
      { esquerda: "Duplicação", direita: "O mesmo pedido aparece em duas linhas, com números de processo diferentes" },
      { esquerda: "Inconsistência de formato", direita: "O distrito aparece ora por extenso, ora abreviado, ora em maiúsculas" },
      { esquerda: "Valor impossível", direita: "Uma data de entrada posterior à data de conclusão" },
      { esquerda: "Cobertura desigual", direita: "Um distrito com 400 registos e outro, de dimensão semelhante, com 12" },
    ],
    exp: "Cada problema exige tratamento próprio: eliminar repetições, normalizar formatos, corrigir ou remover valores impossíveis e documentar diferenças de cobertura antes de comparar grupos.",
    obj: "Classificar problemas de qualidade de dados. Lição 2 do módulo 1.",
  },
  {
    cod: "IA-M1L2-09", m: "m1", l: 2, t: "em", cen: true, d: "di",
    e: "Caso fictício. Um conjunto de 1 200 registos de atendimento foi reunido para treinar um sistema de triagem. A distribuição por canal é: balcão 900 registos, telefone 240, portal 60. No uso previsto, o sistema vai receber sobretudo pedidos entrados pelo portal, que a instituição acabou de abrir e espera que represente metade do volume futuro. Qual é o risco mais directo desta composição?",
    opts: [
      "Nenhum: com 1 200 registos o conjunto é suficiente para qualquer utilização prevista, seja qual for o canal de entrada dos pedidos no futuro",
      "O sistema terá aprendido sobretudo com pedidos de balcão e poderá ter desempenho pior justamente no canal onde vai ser mais usado",
      "O sistema ficará mais lento a responder, por causa do peso dos 900 registos de balcão",
      "O risco existente é apenas de protecção de dados pessoais, e não de desempenho do sistema",
    ], ind: 1,
    exp: "60 registos do portal são 5 por cento do conjunto, enquanto o portal deverá representar cerca de metade do uso. O sistema aprende maioritariamente padrões do balcão e o desempenho medido no conjunto global esconde o desempenho fraco no canal relevante. A resposta passa por medir separadamente por canal e reforçar a recolha no portal.",
    obj: "Relacionar composição dos dados de treino com o contexto de utilização. Lição 2 do módulo 1.",
  },
];

const M1L3: QuestaoIA[] = [
  {
    cod: "IA-M1L3-01", m: "m1", l: 3, t: "em", d: "f",
    e: "Na aprendizagem supervisionada, o que caracteriza os exemplos usados no treino?",
    opts: [
      "Não trazem qualquer informação sobre o resultado a prever",
      "Têm, para cada exemplo, o resultado correcto já conhecido",
      "São gerados pelo próprio sistema durante o treino",
      "São necessariamente numéricos, nunca texto livre",
    ], ind: 1,
    exp: "Supervisionada significa aprender a partir de exemplos rotulados, isto é, com o resultado correcto associado. Sem esses rótulos estaríamos noutra família de métodos.",
    obj: "Definir aprendizagem supervisionada. Lição 3 do módulo 1.",
  },
  {
    cod: "IA-M1L3-02", m: "m1", l: 3, t: "em", d: "me",
    e: "Um modelo acerta em 99 por cento dos exemplos usados no treino e em 62 por cento dos exemplos de um conjunto reservado que nunca viu. Que designação descreve melhor esta situação?",
    opts: [
      "Presença de dados em falta no conjunto",
      "Erro de medição no conjunto reservado",
      "Sobreajustamento aos exemplos de treino",
      "Falta de capacidade do procedimento",
    ], ind: 2,
    exp: "A diferença grande entre treino e conjunto reservado indica que o modelo decorou particularidades dos exemplos de treino em vez de aprender padrões generalizáveis. Falta de capacidade daria desempenho fraco nos dois conjuntos.",
    obj: "Reconhecer sobreajustamento a partir de duas medições. Lição 3 do módulo 1.",
  },
  {
    cod: "IA-M1L3-03", m: "m1", l: 3, t: "em", d: "di",
    e: "Num conjunto reservado de 500 pedidos, 25 são realmente incompletos. Um sistema classifica como incompletos 20 pedidos, dos quais 15 estão efectivamente incompletos. Quantos pedidos incompletos ficaram por assinalar?",
    opts: ["5 pedidos", "10 pedidos", "15 pedidos", "20 pedidos"], ind: 1,
    exp: "Dos 25 realmente incompletos, o sistema assinalou 15; ficaram por assinalar 25 menos 15, ou seja, 10. Os restantes 5 pedidos assinalados eram afinal completos e constituem alarmes falsos.",
    obj: "Calcular casos não detectados a partir de uma tabela de resultados. Lição 3 do módulo 1.",
  },
  {
    cod: "IA-M1L3-04", m: "m1", l: 3, t: "vf", d: "f",
    e: "Verdadeiro ou falso: avaliar um modelo com os mesmos exemplos que foram usados para o treinar dá uma estimativa optimista do desempenho real.",
    val: true,
    exp: "Verdadeiro. O modelo já viu esses exemplos, pelo que o resultado mede memorização tanto quanto capacidade de generalizar. A medição útil faz-se num conjunto reservado.",
    obj: "Justificar a separação entre treino e avaliação. Lição 3 do módulo 1.",
  },
  {
    cod: "IA-M1L3-05", m: "m1", l: 3, t: "vf", d: "me",
    e: "Verdadeiro ou falso: quando uma situação é rara, uma taxa de acerto global elevada pode ser obtida por um sistema que nunca detecta essa situação.",
    val: true,
    exp: "Verdadeiro. Se a situação ocorre em 2 por cento dos casos, responder sempre «não ocorre» dá 98 por cento de acerto global e zero detecções. Por isso se olha para os casos não detectados e para os alarmes falsos, e não só para a taxa global.",
    obj: "Compreender os limites da taxa de acerto global. Lição 3 do módulo 1.",
  },
  {
    cod: "IA-M1L3-06", m: "m1", l: 3, t: "cor", d: "f",
    e: "Associe cada resultado de classificação à sua descrição.",
    pares: [
      { esquerda: "O sistema assinala e o caso era mesmo para assinalar", direita: "Detecção correcta" },
      { esquerda: "O sistema assinala e o caso não era para assinalar", direita: "Alarme falso" },
      { esquerda: "O sistema não assinala e o caso era para assinalar", direita: "Caso não detectado" },
      { esquerda: "O sistema não assinala e o caso não era para assinalar", direita: "Não detecção correcta" },
    ],
    exp: "Os quatro resultados formam a tabela usada para avaliar classificações. Alarmes falsos e casos não detectados têm consequências diferentes para as pessoas atendidas e devem ser analisados separadamente.",
    obj: "Interpretar a tabela de resultados de uma classificação. Lição 3 do módulo 1.",
  },
  {
    cod: "IA-M1L3-07", m: "m1", l: 3, t: "cor", d: "me",
    e: "Associe cada decisão de trabalho ao efeito esperado na avaliação de um sistema de classificação.",
    pares: [
      { esquerda: "Baixar o limiar a partir do qual o sistema assinala", direita: "Mais detecções e mais alarmes falsos" },
      { esquerda: "Subir o limiar a partir do qual o sistema assinala", direita: "Menos alarmes falsos e mais casos não detectados" },
      { esquerda: "Medir o desempenho separadamente por distrito", direita: "Revela diferenças que a média esconde" },
      { esquerda: "Reservar exemplos que o modelo nunca viu", direita: "Estimativa mais honesta do desempenho futuro" },
    ],
    exp: "O limiar é uma escolha de política, não um detalhe técnico: desloca o erro entre alarmes falsos e casos não detectados. A desagregação e o conjunto reservado servem para ver o que a média global esconde.",
    obj: "Relacionar escolhas de limiar e de avaliação com os seus efeitos. Lição 3 do módulo 1.",
  },
  {
    cod: "IA-M1L3-08", m: "m1", l: 3, t: "em", cen: true, d: "me",
    e: "Caso fictício. Num conjunto reservado de 400 pedidos, 80 estavam realmente incompletos. O sistema assinalou 100 pedidos; desses, 60 estavam mesmo incompletos. Quantos alarmes falsos e quantos casos não detectados existem, respectivamente?",
    opts: [
      "40 alarmes falsos e 20 casos não detectados",
      "20 alarmes falsos e 40 casos não detectados",
      "40 alarmes falsos e 40 casos não detectados",
      "60 alarmes falsos e 20 casos não detectados",
    ], ind: 0,
    exp: "Dos 100 assinalados, 60 estavam mesmo incompletos, logo 40 são alarmes falsos. Dos 80 realmente incompletos, o sistema apanhou 60, logo 20 ficaram por detectar. Denominadores diferentes: 100 assinalados e 80 realmente incompletos.",
    obj: "Calcular alarmes falsos e casos não detectados com denominadores explícitos. Lição 3 do módulo 1.",
  },
  {
    cod: "IA-M1L3-09", m: "m1", l: 3, t: "vf", cen: true, d: "di",
    e: "Caso fictício. Um sistema de apoio à triagem foi avaliado em 600 pedidos e acertou em 540, ou seja, 90 por cento. Separando por língua de atendimento, verifica-se: em português, 500 pedidos com 470 acertos; noutra língua, 100 pedidos com 70 acertos. Afirmação a julgar: «como a taxa global é de 90 por cento, o sistema tem desempenho equivalente nos dois grupos».",
    val: false,
    exp: "Falso. Em português a taxa é de 470 em 500, isto é, 94 por cento; no outro grupo é de 70 em 100, isto é, 70 por cento. A média global de 90 por cento é dominada pelo grupo maior e esconde uma diferença de 24 pontos percentuais entre grupos.",
    obj: "Demonstrar que a média global pode ocultar diferenças entre grupos. Lição 3 do módulo 1.",
  },
];

const M1L4: QuestaoIA[] = [
  {
    cod: "IA-M1L4-01", m: "m1", l: 4, t: "em", d: "f",
    e: "Uma funcionária pede a um assistente de escrita um resumo de uma acta e vai usá-lo numa nota interna que assina. Qual é a prática correcta antes de enviar?",
    opts: [
      "Enviar directamente o texto, bastando indicar na nota que foi gerado de forma automática por um assistente institucional",
      "Comparar o resumo com a acta original e corrigir o que não corresponder, assumindo a responsabilidade pelo texto assinado",
      "Pedir um segundo resumo ao mesmo assistente e enviar aquele que estiver mais bem escrito",
      "Enviar a nota e corrigir posteriormente, caso alguém detecte e comunique algum erro",
    ], ind: 1,
    exp: "Quem assina responde pelo conteúdo. A verificação faz-se contra o documento de origem, não contra outra saída do mesmo sistema, que pode repetir o mesmo erro.",
    obj: "Aplicar verificação humana a saídas geradas. Lição 4 do módulo 1.",
  },
  {
    cod: "IA-M1L4-02", m: "m1", l: 4, t: "em", d: "me",
    e: "Ao preparar uma instrução para um assistente de escrita, qual das opções melhora de forma mais directa a utilidade da saída para o trabalho administrativo?",
    opts: [
      "Escrever a instrução em inglês, mesmo quando o documento final é redigido em português",
      "Indicar o objectivo, o destinatário, o comprimento pretendido e o que não deve ser inventado",
      "Pedir o texto mais longo possível e depois cortar o que não interessar ao documento final a assinar",
      "Repetir a mesma instrução várias vezes seguidas, até a resposta estabilizar",
    ], ind: 1,
    exp: "Instruções específicas quanto a objectivo, destinatário, formato e limites reduzem a ambiguidade e tornam a verificação mais rápida. Comprimento excessivo e repetição não acrescentam precisão.",
    obj: "Formular instruções úteis e verificáveis. Lição 4 do módulo 1.",
  },
  {
    cod: "IA-M1L4-03", m: "m1", l: 4, t: "em", d: "di",
    e: "Uma instituição pondera usar uma ferramenta de inteligência artificial para uma tarefa administrativa. Qual das seguintes condições é decisiva para que a decisão de adoptar seja defensável?",
    opts: [
      "A ferramenta ser a mais recente do mercado e incorporar os modelos de maior dimensão",
      "Existir comparação com a alternativa sem inteligência artificial, incluindo custo, tempo, efeito no trabalho das pessoas e dependência do fornecedor",
      "A ferramenta apresentar a interface em português e permitir mudar a língua das respostas",
      "A ferramenta já estar a ser usada por outra instituição do mesmo sector, com bons relatos divulgados pelos serviços que a adoptaram primeiro e recomendação informal das chefias",
    ], ind: 1,
    exp: "A decisão defende-se com comparação explícita entre alternativas e com os custos e riscos assumidos, incluindo a dependência de fornecedor. A novidade, a língua da interface e o exemplo alheio são elementos secundários.",
    obj: "Fundamentar a decisão de adopção com comparação de alternativas. Lição 4 do módulo 1.",
  },
  {
    cod: "IA-M1L4-04", m: "m1", l: 4, t: "vf", d: "f",
    e: "Verdadeiro ou falso: durante a prática com uma ferramenta institucional autorizada, podem ser usados documentos reais com dados pessoais de utentes, desde que a sessão seja de formação.",
    val: false,
    exp: "Falso. Na formação usam-se apenas textos fictícios fornecidos no material. O contexto de formação não altera as obrigações de protecção de dados nem torna seguro introduzir informação pessoal numa ferramenta.",
    obj: "Aplicar a regra de não introduzir dados reais em exercícios. Lição 4 do módulo 1.",
  },
  {
    cod: "IA-M1L4-05", m: "m1", l: 4, t: "cor", d: "me",
    e: "Associe cada tarefa administrativa ao nível de verificação exigido, segundo o critério de impacto usado na lição.",
    pares: [
      { esquerda: "Sugerir três títulos para uma apresentação interna", direita: "Verificação ligeira: leitura antes de usar" },
      { esquerda: "Resumir uma acta que vai servir de base a uma nota assinada", direita: "Verificação contra o documento de origem" },
      { esquerda: "Redigir texto que cita legislação e prazos", direita: "Confirmação de cada referência na fonte oficial" },
      { esquerda: "Produzir uma decisão sobre um direito de uma pessoa", direita: "Uso não admitido como decisão automática" },
    ],
    exp: "O esforço de verificação acompanha o impacto sobre pessoas. Tarefas de apoio interno admitem verificação ligeira; matéria com efeitos jurídicos exige confirmação documental e nunca decisão automática.",
    obj: "Graduar a verificação humana conforme o impacto da tarefa. Lição 4 do módulo 1.",
  },
  {
    cod: "IA-M1L4-06", m: "m1", l: 4, t: "em", cen: true, d: "f",
    e: "Caso fictício. Numa sessão prática, a ferramenta institucional autorizada fica indisponível por falha de ligação na sala. O formador tem preparada uma saída simulada, claramente identificada como tal. Qual é o procedimento correcto, segundo as regras do curso?",
    opts: [
      "Pedir aos participantes que usem contas pessoais gratuitas para completar o exercício na sala, com os pedidos do material",
      "Usar a saída simulada para a análise e registar que a prática com ferramenta real fica por executar, a reagendar",
      "Dar o exercício por cumprido, por a análise da saída simulada ter sido feita pela turma",
      "Substituir o exercício por uma exposição teórica do formador, sem registar qualquer pendência",
    ], ind: 1,
    exp: "A simulação permite continuar a análise, mas não substitui a prática real: fica registada como pendente e é reagendada. Não se pede a ninguém que use contas pessoais nem que pague.",
    obj: "Aplicar o procedimento de contingência da prática assistida. Lição 4 do módulo 1.",
  },
  {
    cod: "IA-M1L4-07", m: "m1", l: 4, t: "em", cen: true, d: "me",
    e: "Caso fictício. Numa repartição, redigir manualmente um resumo de acta demora em média 40 minutos. Com o assistente, a redacção passa a 10 minutos, mas a verificação contra o original acrescenta 15 minutos. São 12 actas por mês. Qual é a poupança mensal de tempo?",
    opts: ["180 minutos", "240 minutos", "300 minutos", "360 minutos"], ind: 0,
    exp: "Com assistente, cada acta custa 10 mais 15, ou seja, 25 minutos, contra 40 minutos antes: poupam-se 15 minutos por acta. Em 12 actas, 12 vezes 15 são 180 minutos, isto é, três horas por mês.",
    obj: "Calcular ganho de tempo incluindo o custo da verificação. Lição 4 do módulo 1.",
  },
  {
    cod: "IA-M1L4-08", m: "m1", l: 4, t: "em", cen: true, d: "di",
    e: "Caso fictício. Uma direcção paga 9 000 meticais por mês por licenças de uma ferramenta de assistência à escrita e poupa 20 horas de trabalho por mês, avaliadas internamente em 400 meticais por hora. A ferramenta não permite exportar as configurações nem o histórico, e mudar de fornecedor obrigaria a refazer a integração, estimada em 60 horas. Que conclusão é sustentada por estes dados?",
    opts: [
      "O saldo mensal é favorável em 1 000 meticais e a dependência de fornecedor não altera a decisão",
      "Os dados não permitem calcular saldo algum",
      "O saldo mensal é desfavorável em 1 000 meticais e acresce dependência de fornecedor, com saída estimada em 60 horas, que deve constar da decisão",
      "O saldo mensal é desfavorável em 9 000 meticais, porque o tempo poupado não tem valor monetário",
    ], ind: 2,
    exp: "O tempo poupado vale 20 vezes 400, ou seja, 8 000 meticais por mês, contra 9 000 meticais de licenças: o saldo mensal é desfavorável em 1 000 meticais. A isso acresce a impossibilidade de exportar configurações e histórico, com custo de saída estimado em 60 horas, que tem de constar da decisão.",
    obj: "Comparar custo, benefício e dependência de fornecedor. Lição 4 do módulo 1.",
  },
  {
    cod: "IA-M1L4-09", m: "m1", l: 4, t: "vf", cen: true, d: "di",
    e: "Caso fictício. Uma chefia propõe que o assistente de escrita passe a produzir directamente as notificações de indeferimento enviadas aos requerentes, sem leitura prévia, alegando que o texto sai sempre correcto nos testes internos. Afirmação a julgar: «como os testes internos não encontraram erros, o envio automático é aceitável».",
    val: false,
    exp: "Falso. Ausência de erros numa amostra de testes não garante ausência de erros no uso corrente, e a notificação de indeferimento afecta directamente direitos do requerente. Estas saídas exigem leitura e assunção de responsabilidade por quem assina.",
    obj: "Recusar automatização sem supervisão em actos que afectam direitos. Lição 4 do módulo 1.",
  },
];

// ===========================================================================
// MÓDULO 2 — Uso Responsável da Inteligência Artificial (36)
// ===========================================================================

const M2L1: QuestaoIA[] = [
  {
    cod: "IA-M2L1-01", m: "m2", l: 1, t: "em", d: "f",
    e: "Na triagem assistida de pedidos, qual é o papel atribuído ao sistema no desenho estudado na lição?",
    opts: [
      "Decidir o resultado do pedido e comunicá-lo ao requerente, cabendo ao funcionário apenas registar a decisão tomada",
      "Propor um encaminhamento e assinalar informação em falta, cabendo a decisão a quem tem competência para decidir",
      "Substituir o registo de entrada dos pedidos feito no balcão",
      "Arquivar automaticamente os pedidos que estejam incompletos",
    ], ind: 1,
    exp: "O sistema apoia: sugere encaminhamento e sinaliza lacunas. A decisão sobre direitos mantém-se com quem tem competência, e o arquivamento automático de pedidos incompletos seria uma decisão com efeitos sobre a pessoa.",
    obj: "Delimitar o papel do sistema na triagem assistida. Lição 1 do módulo 2.",
  },
  {
    cod: "IA-M2L1-02", m: "m2", l: 1, t: "em", d: "f",
    e: "Uma regra de triagem determina que, quando o número de processo não consta do pedido, se escreva «não consta». Um operador escreve «nenhuma» no campo de informação em falta. Que tipo de falha é esta?",
    opts: [
      "Falha do sistema de inteligência artificial usado na triagem",
      "Falha de aplicação da regra por quem executa a triagem",
      "Falha de protecção de dados pessoais do requerente",
      "Falha de conectividade durante o atendimento",
    ], ind: 1,
    exp: "A regra existe e é clara; o erro está na sua aplicação. Distinguir falhas do sistema de falhas de procedimento é essencial para escolher a correcção certa: formação e revisão de conferência, e não alteração do modelo.",
    obj: "Distinguir falha do sistema de falha de procedimento. Lição 1 do módulo 2.",
  },
  {
    cod: "IA-M2L1-03", m: "m2", l: 1, t: "em", d: "me",
    e: "Uma equipa quer avaliar se vale a pena usar assistência automática na triagem. Qual é a comparação que dá resposta a essa pergunta?",
    opts: [
      "Comparar entre si duas ferramentas de inteligência artificial disponíveis no mercado, escolhendo a que obtiver melhor resultado nos testes",
      "Comparar o processo actual, sem inteligência artificial, com o processo assistido, nos mesmos pedidos e com os mesmos critérios",
      "Comparar o tempo de resposta do sistema com o tempo registado noutra instituição semelhante",
      "Comparar o custo anual das licenças com o orçamento disponível para a área informática",
    ], ind: 1,
    exp: "A pergunta é sobre adoptar ou não adoptar, pelo que a comparação relevante é com a alternativa existente, aplicada aos mesmos casos e avaliada pelos mesmos critérios. Comparar ferramentas entre si responde a outra pergunta.",
    obj: "Desenhar a comparação com a alternativa sem inteligência artificial. Lição 1 do módulo 2.",
  },
  {
    cod: "IA-M2L1-04", m: "m2", l: 1, t: "em", d: "me",
    e: "Qual das seguintes consequências de um encaminhamento errado é correctamente descrita?",
    opts: [
      "Não tem efeito sobre a pessoa, uma vez que o erro é corrigido internamente pelo serviço antes de qualquer resposta",
      "Pode atrasar o processo e fazer a pessoa deslocar-se ao sector errado, mesmo sendo corrigível",
      "Obriga sempre ao arquivamento do pedido e à apresentação de um novo requerimento",
      "Impede a apresentação de um novo pedido sobre a mesma matéria durante algum tempo",
    ], ind: 1,
    exp: "Ser corrigível não é ser inofensivo: o erro consome tempo do serviço e da pessoa, gera deslocações e atrasa a resposta. É por isso que os erros de encaminhamento se contam e se analisam.",
    obj: "Avaliar o impacto real de erros corrigíveis. Lição 1 do módulo 2.",
  },
  {
    cod: "IA-M2L1-05", m: "m2", l: 1, t: "vf", d: "f",
    e: "Verdadeiro ou falso: numa prática com ferramenta institucional autorizada, os pedidos usados no exercício devem ser sintéticos e fornecidos no material.",
    val: true,
    exp: "Verdadeiro. Os pedidos do exercício são fictícios e vêm no material, precisamente para que nenhum dado pessoal real seja introduzido na ferramenta.",
    obj: "Aplicar a regra de uso de material sintético na prática. Lição 1 do módulo 2.",
  },
  {
    cod: "IA-M2L1-06", m: "m2", l: 1, t: "vf", d: "me",
    e: "Verdadeiro ou falso: colar apenas a instrução e a lista de pedidos, sem as regras de triagem, é suficiente para a segunda execução do exercício.",
    val: false,
    exp: "Falso. As regras de triagem fazem parte do que é dado à ferramenta; sem elas, a saída não pode ser comparada com a solução nem avaliada pela rubrica. A omissão das regras é, aliás, um dos erros comuns assinalados.",
    obj: "Executar o exercício com o conjunto completo de entradas. Lição 1 do módulo 2.",
  },
  {
    cod: "IA-M2L1-07", m: "m2", l: 1, t: "cor", d: "f",
    e: "Associe cada situação ao destino correcto na triagem assistida.",
    pares: [
      { esquerda: "Pedido de licença de banca de venda", direita: "Sector de licenciamento" },
      { esquerda: "Pedido de cópia autenticada de documento arquivado", direita: "Sector de certidões e arquivo" },
      { esquerda: "Queixa sobre o comportamento de um funcionário", direita: "Sector de atendimento e reclamações" },
      { esquerda: "Pedido sobre matéria que não pertence à instituição", direita: "Fora da competência, com indicação da entidade certa" },
    ],
    exp: "A triagem assenta na natureza do pedido, não na sua urgência aparente. Pedidos fora da competência não se arquivam: informa-se a pessoa sobre a entidade competente.",
    obj: "Aplicar regras de encaminhamento por natureza do pedido. Lição 1 do módulo 2.",
  },
  {
    cod: "IA-M2L1-08", m: "m2", l: 1, t: "cor", d: "me",
    e: "Associe cada dimensão da comparação entre processo manual e processo assistido ao indicador que a mede.",
    pares: [
      { esquerda: "Custo", direita: "Valor das licenças e do tempo de pessoal afecto" },
      { esquerda: "Tempo", direita: "Minutos por pedido, incluindo verificação" },
      { esquerda: "Efeito no trabalho", direita: "Tarefas que mudam de mãos e competências exigidas" },
      { esquerda: "Dependência do fornecedor", direita: "Custo estimado de mudar de solução e possibilidade de exportar dados" },
    ],
    exp: "Cada dimensão precisa de um indicador observável; sem indicador, a comparação fica em impressões. O tempo conta sempre a verificação, que é parte do processo assistido.",
    obj: "Operacionalizar a comparação entre alternativas. Lição 1 do módulo 2.",
  },
  {
    cod: "IA-M2L1-09", m: "m2", l: 1, t: "em", cen: true, d: "di",
    e: "Caso fictício. Numa execução do exercício, a ferramenta classificou 5 pedidos: encaminhou correctamente 3, encaminhou 1 para o sector errado e, no pedido em que o número de processo não consta, escreveu «informação em falta: nenhuma». A solução prevê ainda que um dos pedidos esteja fora da competência da instituição, o que a ferramenta não assinalou. Quantos desvios em relação à solução devem ser registados na rubrica?",
    opts: ["Um desvio", "Dois desvios", "Três desvios", "Quatro desvios"], ind: 2,
    exp: "São três desvios: o encaminhamento errado, a indicação de «nenhuma» quando o número de processo não consta, e a falta de sinalização do pedido fora da competência. Os três encaminhamentos correctos não contam como desvio.",
    obj: "Aplicar a rubrica de correcção a uma execução concreta. Lição 1 do módulo 2.",
  },
];

const M2L2: QuestaoIA[] = [
  {
    cod: "IA-M2L2-01", m: "m2", l: 2, t: "em", d: "f",
    e: "O que significa, em termos práticos, aplicar a minimização a um formulário de atendimento?",
    opts: [
      "Recolher o máximo de campos possível, para não ter de pedir informação depois",
      "Recolher apenas os dados necessários à finalidade declarada, dispensando os demais",
      "Guardar os dados recolhidos durante o menor tempo que for tecnicamente possível",
      "Substituir os nomes por códigos em todos os documentos produzidos pelo serviço",
    ], ind: 1,
    exp: "Minimizar é limitar a recolha ao necessário para a finalidade declarada. Prazos de conservação e substituição de identificadores são outras medidas, distintas da minimização.",
    obj: "Definir minimização de dados. Lição 2 do módulo 2.",
  },
  {
    cod: "IA-M2L2-02", m: "m2", l: 2, t: "em", d: "f",
    e: "Num quadro de tratamento de dados, a que corresponde a coluna «finalidade»?",
    opts: [
      "Ao sector responsável pela recolha do dado",
      "Ao motivo concreto que torna o dado necessário",
      "Ao prazo de conservação previsto para o dado",
      "Ao formato em que o dado fica guardado",
    ], ind: 1,
    exp: "A finalidade é o motivo concreto do tratamento e é ela que justifica a necessidade do dado. Sem finalidade declarada não é possível avaliar se o dado é necessário nem durante quanto tempo deve ser conservado.",
    obj: "Identificar a finalidade num quadro de tratamento. Lição 2 do módulo 2.",
  },
  {
    cod: "IA-M2L2-03", m: "m2", l: 2, t: "em", d: "me",
    e: "Uma equipa substitui os nomes dos requerentes por códigos, mantendo numa folha separada a correspondência entre código e nome. Como se designa correctamente esta medida?",
    opts: [
      "Anonimização dos registos",
      "Pseudonimização dos registos",
      "Encriptação dos registos",
      "Agregação dos registos",
    ], ind: 1,
    exp: "Existe uma chave que permite voltar à identidade, logo trata-se de pseudonimização. A anonimização implicaria não ser possível reidentificar; encriptação e agregação são medidas diferentes.",
    obj: "Distinguir pseudonimização de anonimização. Lição 2 do módulo 2.",
  },
  {
    cod: "IA-M2L2-04", m: "m2", l: 2, t: "em", d: "di",
    e: "Antes de eliminar registos ao fim do prazo de conservação proposto no exercício, que passo é obrigatório?",
    opts: [
      "Confirmar que não existem obrigações de arquivo ou outras obrigações legais aplicáveis, identificando o responsável pela confirmação",
      "Obter autorização escrita de cada pessoa titular dos dados abrangidos pela eliminação, com prova de entrega arquivada no processo",
      "Publicar previamente a lista dos registos a eliminar, para conhecimento dos interessados",
      "Nenhum: cumprido o prazo de conservação proposto, a eliminação dos registos é automática",
    ], ind: 0,
    exp: "O prazo proposto no exercício é pedagógico. A eliminação está sujeita a obrigações de arquivo e a outras obrigações legais, que têm de ser confirmadas por quem tem competência para isso antes de qualquer destruição.",
    obj: "Sujeitar a eliminação a verificação de obrigações aplicáveis. Lição 2 do módulo 2.",
  },
  {
    cod: "IA-M2L2-05", m: "m2", l: 2, t: "vf", d: "f",
    e: "Verdadeiro ou falso: quando um campo não é necessário à finalidade declarada, removê-lo do formulário é uma resposta válida de minimização.",
    val: true,
    exp: "Verdadeiro. A minimização não obriga a conservar campos: se o dado não é necessário à finalidade, a resposta correcta pode ser removê-lo, justificando pela finalidade declarada.",
    obj: "Aplicar a remoção de campos dispensáveis. Lição 2 do módulo 2.",
  },
  {
    cod: "IA-M2L2-06", m: "m2", l: 2, t: "vf", d: "me",
    e: "Verdadeiro ou falso: substituir a data de nascimento por um intervalo de idades reduz o detalhe do dado e mantém a utilidade estatística em muitos casos.",
    val: true,
    exp: "Verdadeiro. A agregação em intervalos diminui o detalhe identificável e costuma ser suficiente para análises por faixa etária. Não elimina, porém, todo o risco de reidentificação quando combinada com outros campos.",
    obj: "Aplicar agregação como redução de detalhe. Lição 2 do módulo 2.",
  },
  {
    cod: "IA-M2L2-07", m: "m2", l: 2, t: "cor", d: "f",
    e: "Associe cada medida à sua descrição correcta.",
    pares: [
      { esquerda: "Remoção", direita: "O campo deixa de ser recolhido ou guardado" },
      { esquerda: "Agregação", direita: "O valor exacto é substituído por um intervalo ou categoria" },
      { esquerda: "Pseudonimização", direita: "O identificador é substituído por um código, existindo chave de correspondência" },
      { esquerda: "Restrição de acesso", direita: "O dado mantém-se, mas só pessoas designadas o podem consultar" },
    ],
    exp: "As medidas não são intercambiáveis: umas reduzem o dado recolhido, outras reduzem o detalhe, outras separam identidade de conteúdo, outras limitam quem vê. A escolha depende da finalidade.",
    obj: "Distinguir medidas de protecção de dados. Lição 2 do módulo 2.",
  },
  {
    cod: "IA-M2L2-08", m: "m2", l: 2, t: "cor", d: "me",
    e: "Associe cada coluna do quadro de tratamento à pergunta a que responde.",
    pares: [
      { esquerda: "Finalidade", direita: "Para que é necessário este dado?" },
      { esquerda: "Acesso", direita: "Quem pode consultar este dado?" },
      { esquerda: "Retenção", direita: "Durante quanto tempo se conserva?" },
      { esquerda: "Eliminação", direita: "Como e por quem é destruído, verificadas as obrigações aplicáveis?" },
    ],
    exp: "O quadro só é útil quando cada coluna responde a uma pergunta concreta e verificável. A coluna de eliminação inclui sempre a verificação prévia de obrigações de arquivo e outras obrigações legais.",
    obj: "Preencher um quadro de tratamento de dados. Lição 2 do módulo 2.",
  },
  {
    cod: "IA-M2L2-09", m: "m2", l: 2, t: "em", cen: true, d: "di",
    e: "Caso fictício. Num ficheiro pseudonimizado de 300 registos, os registos R-0041 e R-0045 partilham a mesma combinação de bairro, intervalo de idade e data de atendimento. Não existe qualquer outro elemento que os relacione. Que conclusão é defensável?",
    opts: [
      "Os dois registos pertencem seguramente à mesma pessoa, atendida em dois momentos",
      "Os dois registos podem corresponder à mesma pessoa, sem que isso esteja comprovado; a combinação mostra risco de reidentificação e que não está demonstrada anonimização",
      "Os dois registos pertencem necessariamente a pessoas diferentes, por terem códigos distintos",
      "A combinação encontrada prova que o ficheiro se encontra devidamente anonimizado",
    ], ind: 1,
    exp: "Coincidência de atributos não é prova de identidade: pode haver duas pessoas com o mesmo perfil. O que a coincidência mostra é risco de reidentificação e que a pseudonimização não equivale a anonimização demonstrada.",
    obj: "Avaliar risco de reidentificação sem afirmar identidade não comprovada. Lição 2 do módulo 2.",
  },
];

const M2L3: QuestaoIA[] = [
  {
    cod: "IA-M2L3-01", m: "m2", l: 3, t: "em", d: "f",
    e: "O que é uma variável indirecta, também dita variável de substituição, na análise de desempenho por grupos?",
    opts: [
      "Uma variável sem valores em falta em todo o conjunto de dados",
      "Uma variável que, não sendo o atributo em causa, está associada a ele e pode reproduzir a mesma diferença",
      "Uma variável calculada automaticamente a partir de outras duas colunas",
      "Uma variável que existe apenas no conjunto reservado para avaliação",
    ], ind: 1,
    exp: "Retirar o atributo directo não elimina o efeito quando outras variáveis lhe estão associadas, como o bairro, a língua de atendimento ou o canal usado. É por isso que se mede o desempenho por grupos, mesmo quando o atributo não é usado.",
    obj: "Reconhecer variáveis indirectas. Lição 3 do módulo 2.",
  },
  {
    cod: "IA-M2L3-02", m: "m2", l: 3, t: "em", d: "me",
    e: "Uma análise mostra que a taxa de casos não detectados é mais alta num grupo do que noutro. Que conclusão é legítima com esta única informação?",
    opts: [
      "Existe discriminação no sentido jurídico do termo, com as consequências daí decorrentes para a instituição e para os responsáveis designados",
      "Existe uma diferença medida que exige investigação das causas, não ficando provada relação de causa e efeito nem qualificação jurídica",
      "A diferença observada deve-se necessariamente à variável que define os grupos comparados",
      "A diferença é irrelevante desde que a taxa global do sistema se mantenha em bom nível",
    ], ind: 1,
    exp: "Uma diferença observada é um facto a explicar: pode resultar da composição dos dados, da forma de recolha, do limiar escolhido ou de outros factores. Qualificação jurídica é matéria da área competente e exige mais do que uma diferença de taxas.",
    obj: "Separar diferença medida de causalidade e de qualificação jurídica. Lição 3 do módulo 2.",
  },
  {
    cod: "IA-M2L3-03", m: "m2", l: 3, t: "em", d: "di",
    e: "Num grupo há 150 casos que deviam ser assinalados; o sistema assinalou correctamente 90. Noutro grupo há 50 casos que deviam ser assinalados e o sistema assinalou correctamente 40. Qual é a diferença, em pontos percentuais, entre as taxas de casos não detectados dos dois grupos?",
    opts: ["20 pontos", "40 pontos", "60 pontos", "10 pontos"], ind: 0,
    exp: "No primeiro grupo ficaram por detectar 60 em 150, isto é, 40 por cento. No segundo, 10 em 50, isto é, 20 por cento. A diferença é de 20 pontos percentuais, com denominadores diferentes em cada grupo.",
    obj: "Calcular e comparar taxas por grupo com denominadores próprios. Lição 3 do módulo 2.",
  },
  {
    cod: "IA-M2L3-04", m: "m2", l: 3, t: "vf", d: "f",
    e: "Verdadeiro ou falso: um grupo pouco representado nos dados de treino tende a ter desempenho pior medido, e essa diferença pode passar despercebida numa taxa global.",
    val: true,
    exp: "Verdadeiro. Com poucos exemplos, o sistema aprende menos sobre esse grupo, e o seu peso reduzido no total faz com que a taxa global quase não se altere. Daí a desagregação por grupos.",
    obj: "Relacionar representação nos dados com desempenho por grupo. Lição 3 do módulo 2.",
  },
  {
    cod: "IA-M2L3-05", m: "m2", l: 3, t: "vf", d: "me",
    e: "Verdadeiro ou falso: a existência de uma alternativa de atendimento acessível, sem depender do sistema automático, é uma medida de mitigação válida enquanto as diferenças entre grupos não estiverem resolvidas.",
    val: true,
    exp: "Verdadeiro. Garantir uma via alternativa acessível protege quem é pior servido pelo sistema e mantém o serviço disponível durante a investigação e a correcção.",
    obj: "Identificar medidas de mitigação aplicáveis. Lição 3 do módulo 2.",
  },
  {
    cod: "IA-M2L3-06", m: "m2", l: 3, t: "cor", d: "f",
    e: "Associe cada barreira ao grupo de pessoas que mais directamente afecta no atendimento assistido por sistemas automáticos.",
    pares: [
      { esquerda: "Formulário só disponível numa língua", direita: "Pessoas que não dominam essa língua" },
      { esquerda: "Portal sem compatibilidade com leitor de ecrã", direita: "Pessoas cegas ou com baixa visão" },
      { esquerda: "Atendimento exclusivamente por aplicação móvel com ligação estável", direita: "Pessoas em zonas com conectividade fraca" },
      { esquerda: "Instruções apenas por áudio", direita: "Pessoas surdas ou com perda auditiva" },
    ],
    exp: "Cada barreira tem um público afectado identificável, e a identificação é o que permite desenhar a alternativa adequada em vez de uma solução genérica.",
    obj: "Relacionar barreiras concretas com grupos afectados. Lição 3 do módulo 2.",
  },
  {
    cod: "IA-M2L3-07", m: "m2", l: 3, t: "cor", d: "me",
    e: "Associe cada medida ao momento em que actua.",
    pares: [
      { esquerda: "Rever a composição dos dados de recolha", direita: "Antes do treino" },
      { esquerda: "Medir o desempenho separadamente por grupo", direita: "Na avaliação" },
      { esquerda: "Consultar as pessoas afectadas sobre o serviço", direita: "No desenho e na revisão" },
      { esquerda: "Manter atendimento alternativo acessível", direita: "Durante a utilização" },
    ],
    exp: "As medidas distribuem-se por todo o ciclo: recolha, avaliação, desenho participado e funcionamento corrente. Concentrar tudo na fase técnica deixa o serviço sem resposta para quem é mal servido hoje.",
    obj: "Situar medidas de mitigação no ciclo de vida do sistema. Lição 3 do módulo 2.",
  },
  {
    cod: "IA-M2L3-08", m: "m2", l: 3, t: "em", cen: true, d: "me",
    e: "Caso fictício. Em 600 pedidos, o grupo A tem 480 pedidos e 48 encaminhamentos errados; o grupo B tem 120 pedidos e 24 encaminhamentos errados. Qual é a leitura correcta?",
    opts: [
      "Os grupos estão em igualdade de tratamento, dado que o grupo A regista mais erros absolutos",
      "A taxa de erro é de 10 por cento no grupo A e de 20 por cento no grupo B: em proporção, o grupo B é pior servido",
      "A taxa de erro é igual nos dois grupos quando se consideram os totais",
      "Não é possível comparar os grupos, por terem dimensões muito diferentes entre si",
    ], ind: 1,
    exp: "48 em 480 são 10 por cento; 24 em 120 são 20 por cento. Comparar números absolutos entre grupos de dimensão diferente induz em erro; a comparação faz-se em proporção, com o denominador de cada grupo.",
    obj: "Comparar grupos de dimensões diferentes usando proporções. Lição 3 do módulo 2.",
  },
  {
    cod: "IA-M2L3-09", m: "m2", l: 3, t: "em", cen: true, d: "di",
    e: "Caso fictício. Após a análise anterior, a equipa propõe quatro acções. Qual delas responde à diferença encontrada sem retirar serviço a ninguém?",
    opts: [
      "Suspender o atendimento do grupo B até o sistema ser corrigido",
      "Deixar de medir por grupo, para evitar leituras precipitadas",
      "Manter a via alternativa de atendimento, reforçar a recolha de exemplos do grupo B e voltar a medir por grupo após a correcção",
      "Baixar o limiar apenas para o grupo B, sem qualquer outra medida nem registo",
    ], ind: 2,
    exp: "A resposta combina protecção imediata de quem é pior servido, correcção da causa provável e nova medição. Suspender atendimento retira serviço; deixar de medir esconde o problema; alterar o limiar apenas para um grupo, sem análise nem registo, é uma decisão não fundamentada e não documentada.",
    obj: "Escolher medidas de mitigação que não retiram serviço. Lição 3 do módulo 2.",
  },
];

const M2L4: QuestaoIA[] = [
  {
    cod: "IA-M2L4-01", m: "m2", l: 4, t: "em", d: "f",
    e: "O que caracteriza uma supervisão humana com poder real, no desenho estudado na lição?",
    opts: [
      "A pessoa poder ler e acompanhar as decisões do sistema depois de estas terem sido executadas",
      "A pessoa poder corrigir e suspender o funcionamento dentro do que lhe foi autorizado, registando o motivo de forma proporcional ao impacto",
      "A pessoa assinar um documento em que confirma conhecer o sistema e o seu funcionamento",
      "A pessoa poder solicitar ao fornecedor que altere o comportamento do sistema no futuro",
    ], ind: 1,
    exp: "Supervisão sem poder de agir é acompanhamento. O poder real inclui corrigir e suspender dentro do mandato atribuído, com registo do motivo proporcional ao impacto da intervenção.",
    obj: "Definir supervisão humana com poder efectivo. Lição 4 do módulo 2.",
  },
  {
    cod: "IA-M2L4-02", m: "m2", l: 4, t: "em", d: "me",
    e: "Qual é o conteúdo mínimo de um mecanismo de contestação utilizável por quem é afectado por uma decisão apoiada em sistema automático?",
    opts: [
      "A indicação de um endereço de correio electrónico genérico da instituição, para contacto",
      "Informação sobre a existência do apoio automático, a quem dirigir a contestação, o prazo de resposta e a garantia de reapreciação por pessoa com competência para decidir",
      "A publicação integral do código do sistema utilizado no apoio à decisão, acompanhada da documentação técnica entregue pelo fornecedor e do registo das versões instaladas desde o início da utilização",
      "A indicação do fornecedor da tecnologia e da data em que foi contratada",
    ], ind: 1,
    exp: "Contestar exige saber que existe apoio automático, a quem se dirige, em que prazo há resposta e que a reapreciação é feita por quem tem competência para decidir. Publicar código ou nomear o fornecedor não dá esse caminho à pessoa.",
    obj: "Especificar o mecanismo de contestação. Lição 4 do módulo 2.",
  },
  {
    cod: "IA-M2L4-03", m: "m2", l: 4, t: "em", d: "di",
    e: "Qual das afirmações sobre o Regulamento Europeu de Inteligência Artificial corresponde às fontes usadas na lição?",
    opts: [
      "É lei plenamente aplicável em Moçambique desde a data da sua publicação oficial na União Europeia, produzindo efeitos directos sobre qualquer instituição pública que utilize sistemas de inteligência artificial, sem necessidade de acto interno de recepção",
      "Não é lei moçambicana nem se aplica automaticamente a Moçambique, mas o seu artigo 2.º prevê situações de alcance a operadores estabelecidos fora da União quando as saídas do sistema são utilizadas na União, verificando-se caso a caso",
      "Nunca pode abranger entidades situadas fora da União Europeia, seja qual for o uso dado às saídas",
      "Vincula Moçambique por ter a natureza de recomendação internacional aceite pelos Estados",
    ], ind: 1,
    exp: "As duas afirmações absolutas estão erradas: não é lei moçambicana e não se aplica cá automaticamente, mas também não é verdade que nunca alcance operadores de fora. O artigo 2.º define alcance condicional, e a leitura em concreto cabe à área jurídica.",
    obj: "Enunciar correctamente o alcance do regulamento europeu. Lição 4 do módulo 2.",
  },
  {
    cod: "IA-M2L4-04", m: "m2", l: 4, t: "vf", d: "f",
    e: "Verdadeiro ou falso: a Recomendação da UNESCO sobre a Ética da Inteligência Artificial é, por si só, um instrumento vinculativo que cria obrigações directas para as instituições.",
    val: false,
    exp: "Falso. Trata-se de uma recomendação, que orienta e serve de referência, sem criar por si obrigações directas. Obrigações resultam de actos normativos aprovados na ordem jurídica aplicável.",
    obj: "Distinguir recomendação de instrumento vinculativo. Lição 4 do módulo 2.",
  },
  {
    cod: "IA-M2L4-05", m: "m2", l: 4, t: "cor", d: "me",
    e: "Associe cada instrumento à sua natureza, conforme as fontes usadas na lição.",
    pares: [
      { esquerda: "Regulamento Europeu de Inteligência Artificial", direita: "Acto legislativo da União Europeia, com alcance condicional fora dela" },
      { esquerda: "Recomendação da UNESCO sobre a Ética da Inteligência Artificial", direita: "Recomendação internacional, não vinculativa por si" },
      { esquerda: "Estratégia continental de inteligência artificial da União Africana", direita: "Instrumento de orientação política adoptado por órgão continental" },
      { esquerda: "Proposta divulgada pelo INTIC para consulta", direita: "Proposta submetida a consulta, não aprovação" },
    ],
    exp: "Lei, recomendação, estratégia e proposta têm efeitos distintos. Uma estratégia pode vincular administrativamente conforme o acto que a aprova, mas não se confunde com lei; uma proposta divulgada para consulta não é texto aprovado.",
    obj: "Classificar instrumentos de governação por natureza. Lição 4 do módulo 2.",
  },
  {
    cod: "IA-M2L4-06", m: "m2", l: 4, t: "em", cen: true, d: "f",
    e: "Caso fictício. Durante o atendimento, uma funcionária com mandato de supervisão verifica que o sistema está a encaminhar para o sector errado todos os pedidos de um determinado tipo. Qual é a conduta correcta?",
    opts: [
      "Aguardar pela reunião mensal do comité de acompanhamento para então propor a suspensão",
      "Corrigir imediatamente os encaminhamentos dentro do que lhe foi autorizado e registar o motivo, com detalhe proporcional ao impacto",
      "Continuar a encaminhar conforme o sistema indica, para não quebrar o procedimento estabelecido",
      "Desligar o sistema de imediato, sem informar a chefia nem registar a ocorrência",
    ], ind: 1,
    exp: "Intervir dentro do mandato é imediato, não depende de reunião. O registo existe para permitir a prestação de contas e o seu detalhe acompanha o impacto da intervenção; desligar sem informar quebra a cadeia de responsabilidade.",
    obj: "Aplicar o poder de intervenção imediata dentro do mandato. Lição 4 do módulo 2.",
  },
  {
    cod: "IA-M2L4-07", m: "m2", l: 4, t: "em", cen: true, d: "me",
    e: "Caso fictício. Uma matriz de risco em preparação tem a linha: «risco: encaminhamento errado sistemático». Que conjunto de colunas completa a linha de forma utilizável?",
    opts: [
      "Gravidade estimada do risco e nome do fornecedor do sistema",
      "Responsável designado, acção concreta a executar e evidência que demonstra a execução",
      "Data de aquisição do sistema e orçamento anual da área informática",
      "Número de pedidos recebidos por mês e nome do sector responsável",
    ], ind: 1,
    exp: "Uma matriz só é operacional quando cada risco tem responsável, acção e evidência verificável. Sem evidência, não há como demonstrar que a acção foi executada.",
    obj: "Completar uma matriz de risco operacional. Lição 4 do módulo 2.",
  },
  {
    cod: "IA-M2L4-08", m: "m2", l: 4, t: "vf", cen: true, d: "di",
    e: "Caso fictício. Uma instituição adopta o comité de acompanhamento, os prazos e os poderes descritos no material da lição. Afirmação a julgar: «estes elementos são obrigações legais universais, aplicáveis a qualquer instituição».",
    val: false,
    exp: "Falso. O comité, os prazos e os poderes descritos são um desenho proposto no material, útil como ponto de partida. Não constituem obrigação legal universal; cada instituição adapta-os ao seu enquadramento e às regras que efectivamente lhe são aplicáveis.",
    obj: "Distinguir desenho proposto de obrigação legal. Lição 4 do módulo 2.",
  },
  {
    cod: "IA-M2L4-09", m: "m2", l: 4, t: "em", cen: true, d: "di",
    e: "Caso fictício. Numa minuta de suspensão de um sistema de apoio à triagem, qual é o conjunto de elementos que torna a decisão executável e verificável?",
    opts: [
      "Identificação do sistema, motivo, âmbito e duração da suspensão, medida alternativa de atendimento e responsável pela reavaliação",
      "Motivo da suspensão, data da decisão e assinatura do dirigente competente",
      "Identificação do fornecedor do sistema e cópia do contrato de prestação de serviços",
      "Data em que a suspensão produz efeitos e número de pedidos entretanto afectados",
    ], ind: 0,
    exp: "Sem âmbito e duração, a suspensão é indeterminada; sem medida alternativa, o serviço pára para as pessoas; sem responsável pela reavaliação, a situação não se resolve. O motivo e a assinatura são necessários mas não bastam.",
    obj: "Redigir uma decisão de suspensão executável. Lição 4 do módulo 2.",
  },
];

// ===========================================================================
// MÓDULO TRANSVERSAL — Governo Digital Inclusivo e Acessibilidade (8)
// ===========================================================================

const TRANSVERSAL: QuestaoIA[] = [
  {
    cod: "IA-TR-L1-01", m: "transversal", l: 1, t: "em", d: "f",
    e: "Um serviço público passa a ser prestado através de um portal em linha apoiado por sistemas automáticos. À luz da lição sobre acessibilidade, que exigência acompanha esta mudança?",
    opts: [
      "Que o portal responda com rapidez em qualquer equipamento usado pelo público",
      "Que o serviço continue utilizável por pessoas com deficiência, com formatos e vias de acesso adequados",
      "Que o portal esteja disponível 24 horas por dia, todos os dias da semana",
      "Que o portal disponha de uma versão adaptada a telemóvel, além da versão para computador",
    ], ind: 1,
    exp: "A acessibilidade é condição de utilização do serviço por pessoas com deficiência, não um atributo de desempenho. Rapidez, disponibilidade e versão móvel são desejáveis, mas não substituem a acessibilidade.",
    obj: "Aplicar a exigência de acessibilidade a serviços digitalizados. Lição 1 do módulo transversal.",
  },
  {
    cod: "IA-TR-L1-02", m: "transversal", l: 1, t: "cor", d: "me",
    e: "Associe cada apoio de acessibilidade à barreira que remove.",
    pares: [
      { esquerda: "Leitor de ecrã compatível", direita: "Conteúdo inacessível a pessoas cegas" },
      { esquerda: "Legendagem e interpretação em língua de sinais", direita: "Informação transmitida apenas por áudio" },
      { esquerda: "Texto em leitura fácil", direita: "Linguagem demasiado complexa para parte do público" },
      { esquerda: "Atendimento presencial alternativo", direita: "Impossibilidade de usar o canal digital" },
    ],
    exp: "Cada apoio responde a uma barreira concreta. A escolha do apoio decorre da barreira identificada, e não de uma lista aplicada por hábito.",
    obj: "Relacionar apoios de acessibilidade com barreiras identificadas. Lição 1 do módulo transversal.",
  },
  {
    cod: "IA-TR-L2-01", m: "transversal", l: 2, t: "em", d: "f",
    e: "Uma instituição publica um aviso importante apenas em cartaz impresso afixado na porta. Que direito abordado na lição fica em causa?",
    opts: [
      "O direito à informação e à comunicação em formatos acessíveis",
      "O direito à educação em condições de igualdade",
      "O direito a participar em procedimentos de aquisição",
      "O direito a informação estatística desagregada",
    ], ind: 0,
    exp: "Informação disponível num único formato exclui quem não pode aceder a esse formato. O direito à informação e à comunicação implica formatos acessíveis e meios alternativos de divulgação.",
    obj: "Identificar falhas no direito à informação e comunicação. Lição 2 do módulo transversal.",
  },
  {
    cod: "IA-TR-L3-01", m: "transversal", l: 3, t: "em", d: "me",
    e: "Numa aquisição de uma plataforma digital com componentes automáticos, qual é a prática consistente com a lição sobre aquisição de bens, serviços e obras?",
    opts: [
      "Avaliar a acessibilidade apenas depois da entrega da plataforma, já em fase de utilização",
      "Incluir requisitos de acessibilidade nas especificações e nos critérios de avaliação das propostas",
      "Deixar a acessibilidade inteiramente a cargo do fornecedor, sem a especificar no caderno de encargos",
      "Aceitar compromissos verbais de acessibilidade assumidos pelo fornecedor na apresentação",
    ], ind: 1,
    exp: "A acessibilidade entra nas especificações e nos critérios de avaliação, para ser exigível e verificável. Deixá-la para depois da entrega transforma-a em custo adicional e frequentemente em promessa não cumprida.",
    obj: "Incorporar acessibilidade nas aquisições. Lição 3 do módulo transversal.",
  },
  {
    cod: "IA-TR-L4-01", m: "transversal", l: 4, t: "vf", d: "f",
    e: "Verdadeiro ou falso: materiais de formação disponibilizados num único formato, sem alternativa acessível, podem impedir a participação de parte das pessoas formandas.",
    val: true,
    exp: "Verdadeiro. Formato único cria barreira para quem não o pode usar. Prever alternativas acessíveis é condição de participação em igualdade e não um extra.",
    obj: "Relacionar formato dos materiais com participação efectiva. Lição 4 do módulo transversal.",
  },
  {
    cod: "IA-TR-L5-01", m: "transversal", l: 5, t: "em", d: "me",
    e: "Segundo a lição sobre colecta de dados, porque importa recolher dados desagregados sobre pessoas com deficiência nos serviços públicos digitais?",
    opts: [
      "Para aumentar o número de campos recolhidos no formulário de atendimento",
      "Para permitir identificar barreiras e diferenças de acesso que os totais escondem, com salvaguardas de protecção de dados",
      "Para tornar o atendimento mais rápido nos balcões com maior afluência",
      "Para cumprir uma exigência apresentada pelos fornecedores de tecnologia contratados",
    ], ind: 1,
    exp: "Sem desagregação, as diferenças de acesso desaparecem nos totais e não é possível dirigir medidas. A recolha faz-se com salvaguardas: finalidade declarada, minimização e acesso restrito.",
    obj: "Justificar a colecta desagregada com salvaguardas. Lição 5 do módulo transversal.",
  },
  {
    cod: "IA-TR-L6-01", m: "transversal", l: 6, t: "vf", d: "f",
    e: "Verdadeiro ou falso: indicadores estatísticos apresentados apenas em totais nacionais permitem, por si, concluir que o serviço funciona de forma equitativa entre grupos.",
    val: false,
    exp: "Falso. Totais nacionais podem esconder diferenças grandes entre províncias, distritos ou grupos. Concluir sobre equidade exige desagregação e denominadores claros.",
    obj: "Reconhecer os limites de indicadores agregados. Lição 6 do módulo transversal.",
  },
  {
    cod: "IA-TR-L6-02", m: "transversal", l: 6, t: "cor", d: "me",
    e: "Associe cada elemento de um indicador estatístico à sua função.",
    pares: [
      { esquerda: "Numerador", direita: "Casos que verificam a condição em análise" },
      { esquerda: "Denominador", direita: "Universo a que os casos se referem" },
      { esquerda: "Período de referência", direita: "Intervalo de tempo abrangido pela medição" },
      { esquerda: "Desagregação", direita: "Repartição do indicador por grupos relevantes" },
    ],
    exp: "Um indicador sem denominador ou sem período não é interpretável, e sem desagregação não permite ver diferenças entre grupos. Estes quatro elementos acompanham sempre a publicação.",
    obj: "Identificar os elementos constitutivos de um indicador. Lição 6 do módulo transversal.",
  },
];

/** Banco do exame final: 80 questões. Todas entram inactivas. */
export const EXAME_IA: QuestaoIA[] = [
  ...M1L1, ...M1L2, ...M1L3, ...M1L4,
  ...M2L1, ...M2L2, ...M2L3, ...M2L4,
  ...TRANSVERSAL,
];

/**
 * Diagnóstico e pós-teste: 10 questões de baixo impacto, separadas das 80.
 * Não entram no sorteio do exame e não certificam.
 */
export const DIAGNOSTICO_IA: QuestaoIA[] = [
  {
    cod: "IA-DIAG-01", m: "m1", l: 1, t: "em", d: "f",
    e: "Diagnóstico. Qual destes exemplos é mais provável que envolva inteligência artificial?",
    opts: [
      "Uma calculadora que soma dois números",
      "Um serviço que sugere a tradução de uma frase",
      "Um relógio digital",
      "Uma impressora ligada por cabo",
    ], ind: 1,
    exp: "A tradução automática aprende padrões a partir de grandes quantidades de texto. As restantes são operações fixas.",
    obj: "Sondagem inicial sobre reconhecimento de sistemas de inteligência artificial.",
  },
  {
    cod: "IA-DIAG-02", m: "m1", l: 1, t: "vf", d: "f",
    e: "Diagnóstico. Verdadeiro ou falso: um sistema de inteligência artificial pode errar.",
    val: true,
    exp: "Verdadeiro. Todos estes sistemas erram, com frequência variável conforme os dados e o contexto de uso.",
    obj: "Sondagem inicial sobre expectativas de fiabilidade.",
  },
  {
    cod: "IA-DIAG-03", m: "m1", l: 2, t: "em", d: "f",
    e: "Diagnóstico. Numa tabela de dados, a que corresponde uma linha?",
    opts: ["A uma coluna de informação", "A um registo ou observação", "Ao resultado do sistema", "Ao nome do ficheiro"], ind: 1,
    exp: "Cada linha é um registo; as colunas são as informações sobre esse registo.",
    obj: "Sondagem inicial sobre vocabulário de dados.",
  },
  {
    cod: "IA-DIAG-04", m: "m1", l: 2, t: "vf", d: "f",
    e: "Diagnóstico. Verdadeiro ou falso: a qualidade dos dados influencia o resultado de um sistema que aprende com eles.",
    val: true,
    exp: "Verdadeiro. Dados incompletos, desactualizados ou enviesados produzem resultados correspondentes.",
    obj: "Sondagem inicial sobre relação entre dados e resultados.",
  },
  {
    cod: "IA-DIAG-05", m: "m1", l: 3, t: "em", d: "f",
    e: "Diagnóstico. Se um sistema deve assinalar pedidos incompletos e não assinala um pedido que estava incompleto, como se chama esse caso?",
    opts: ["Alarme falso", "Caso não detectado", "Detecção correcta", "Erro de rede"], ind: 1,
    exp: "O caso existia e não foi assinalado: é um caso não detectado. O alarme falso é o inverso.",
    obj: "Sondagem inicial sobre tipos de erro de classificação.",
  },
  {
    cod: "IA-DIAG-06", m: "m1", l: 4, t: "em", d: "f",
    e: "Diagnóstico. Quem responde pelo conteúdo de um ofício assinado por uma funcionária, mesmo que o rascunho tenha sido gerado por um assistente automático?",
    opts: ["O fornecedor da ferramenta", "A funcionária que assina", "Ninguém em concreto", "A equipa de informática"], ind: 1,
    exp: "A responsabilidade acompanha a assinatura. A origem do rascunho não a transfere.",
    obj: "Sondagem inicial sobre responsabilidade pelo conteúdo.",
  },
  {
    cod: "IA-DIAG-07", m: "m2", l: 2, t: "vf", d: "f",
    e: "Diagnóstico. Verdadeiro ou falso: deve recolher-se o maior número possível de dados pessoais, para o caso de virem a ser úteis.",
    val: false,
    exp: "Falso. Recolhe-se o necessário à finalidade declarada; guardar por precaução aumenta o risco sem benefício demonstrado.",
    obj: "Sondagem inicial sobre minimização de dados.",
  },
  {
    cod: "IA-DIAG-08", m: "m2", l: 3, t: "em", d: "f",
    e: "Diagnóstico. Um serviço funciona bem para a maioria e mal para um grupo pequeno. O que deve fazer-se em primeiro lugar?",
    opts: [
      "Ignorar, por ser um grupo pequeno",
      "Medir separadamente o desempenho desse grupo e investigar a causa",
      "Desligar o serviço para todos",
      "Aumentar a publicidade do serviço",
    ], ind: 1,
    exp: "A medição desagregada é o primeiro passo: sem ela não se conhece a dimensão nem a causa do problema.",
    obj: "Sondagem inicial sobre atenção a grupos afectados.",
  },
  {
    cod: "IA-DIAG-09", m: "m2", l: 4, t: "vf", d: "f",
    e: "Diagnóstico. Verdadeiro ou falso: uma pessoa afectada por uma decisão apoiada em sistema automático deve poder contestá-la.",
    val: true,
    exp: "Verdadeiro. A possibilidade de contestar e de obter reapreciação por pessoa com competência é parte da prestação de contas.",
    obj: "Sondagem inicial sobre direito de contestação.",
  },
  {
    cod: "IA-DIAG-10", m: "transversal", l: 1, t: "vf", d: "f",
    e: "Diagnóstico. Verdadeiro ou falso: um serviço digital só é acessível quando pode ser usado por pessoas com diferentes capacidades, incluindo pessoas com deficiência.",
    val: true,
    exp: "Verdadeiro. Acessibilidade significa poder ser usado por todas as pessoas, com os apoios adequados.",
    obj: "Sondagem inicial sobre o conceito de acessibilidade.",
  },
];
