# Matriz técnica de requisitos — Concurso 78A/MDAP/MCTD/QCBS/25

Estado de cada requisito: **implementado**, **testado** (teste automático ou
verificação feita no navegador) e **pendente**. Actualizar sempre que uma
secção do Termo de Referência for trabalhada.

## Secção 14 — cursos e cargas horárias

| Curso | Carga do TdR | Modalidade | Na plataforma | Estado |
| --- | --- | --- | --- | --- |
| Princípios da Transformação Digital | 24 h | virtual | 24 h | implementado e verificado na base |
| Introdução à Inteligência Artificial | 20 h | presencial | 20 h (era 16) | corrigido e verificado |
| Computação em Nuvem | 30 h | presencial | 30 h | implementado |
| Segurança Cibernética Avançada | 30 h | presencial | 30 h | implementado |
| Redes Avançadas e Introdução à Segurança Cibernética | 80 h | presencial | 80 h (era 120) | corrigido e verificado |
| Tecnologias Digitais do Governo | 10 h | presencial | 10 h | implementado |

**Referência provisória, pendente de esclarecimento da ATDI.** O documento de
concurso contém divergências internas: a secção 6.2 (pág. 13) indica um máximo
de 16 h para Introdução à IA e a tabela da secção 14 (pág. 29) indica 20 h; a
descrição de Redes (pág. 16) indica 120 h e a secção 14 indica 80 h. A
plataforma segue **por agora** os valores da tabela da secção 14 (20 h e 80 h),
identificados como referência provisória. Não escolhemos qual das secções tem
autoridade e não afirmamos conformidade integral. Nenhum outro curso foi
alterado por causa desta questão.

**Pendente — revisão pedagógica.** A soma dos minutos dos módulos não coincide
com a carga horária oficial de vários cursos. Nenhum módulo ou lição foi
apagado para fazer a conta bater certo; a divergência fica assinalada na área
de gestão (Avaliação) e aguarda revisão pedagógica da Ologa. Excepção já
fechada: **Princípios da Transformação Digital**, cujo plano soma exactamente
24 h (1320 minutos de módulos + 120 minutos de avaliação e orientação), com
verificação por teste automático.

## Curso Princípios da Transformação Digital — proposta pedagógica

Detalhe completo em `docs/plano-curricular-transformacao-digital.md`.

| Requisito | Estado |
| --- | --- |
| 24 h, virtual (secção 14) | implementado; soma verificada por teste |
| Âmbito mínimo da secção 6.1 coberto pelas 12 lições | implementado; cobertura verificada por teste |
| Conteúdo original em cada lição: objectivos, explicação, exemplo, actividade com tempo e produto, síntese em leitura fácil, verificação formativa e guião do formador | implementado (12 de 12 lições) |
| Identificadores das lições preservados (sem perda de progresso) | implementado; o seed actualiza, nunca apaga |
| Objectivos, público-alvo, pré-requisitos e materiais do curso | implementado |
| Banco do exame final com 60 questões (triplo de 20) | implementado; **inactivo (rascunho)** |
| Pré-teste e pós-teste de 10 questões, instrumento separado | implementado; **inactivo (rascunho)** |
| Gabaritos fora do pacote do navegador | implementado e verificado (vivem em `scripts/conteudo/` e na base) |
| Todo o conteúdo marcado «Proposta pedagógica — por validar pela Ologa/ATDI» | implementado |
| Casos reais ou estatísticas | **não existem** — todos os cenários são fictícios e assinalados como tal |
| Revisão de acessibilidade pela REMOTELINE | **pendente** — proposta, não realizada |
| Vídeo, legendagem e Língua de Sinais Moçambicana | **por produzir** — deixaram de ser apresentados como disponíveis |

## Secção 10 — banco de questões e exame final

| Requisito | Estado |
| --- | --- |
| Cinco tipologias de questão | implementado |
| Banco activo com o triplo das questões do exame | implementado; o início do exame é bloqueado abaixo do triplo |
| Exame gerado no momento em que o formando o inicia | implementado |
| Ordem das questões e das opções aleatória | implementado |
| Composição exacta guardada por tentativa | implementado |
| Respostas correctas nunca enviadas antes da submissão | implementado e verificado no código (`obterTentativa`) |
| Contagens reais por curso e por módulo | implementado |
| Distinção entre pré-teste/pós-teste e exame final | implementado; os dois instrumentos são agora campos distintos na base (`instrumento`) e o exame só usa o banco certificador |
| Questões no banco | Princípios da Transformação Digital: 60 de exame e 10 de pré/pós-teste, **inactivas**, à espera de validação. Restantes cinco cursos: **por fornecer** — nenhuma questão foi inventada |

## Secções 12 e 12.1 — certificação individual

| Requisito | Estado |
| --- | --- |
| Certificado individual por formando e por curso | implementado (um registo por pessoa e por curso) |
| Assiduidade ≥ 80 % | implementado e testado (79 % recusa, 80 % aceita) |
| Nota final ≥ 60 % | implementado e testado (59 % recusa, 60 % aceita) |
| Exame até 30 dias de calendário após o fim da formação | implementado e testado (dia 30 aceita, dia 31 recusa) |
| Validação no servidor, nunca aceite do cliente | implementado |
| Taxas estrita e ajustada, ambas visíveis | implementado; estrita continua a ser o valor inicial |
| Escolha entre estrita e ajustada | **decisão em aberto para a ATDI** — não aprovada automaticamente |

## Presenças e assiduidade

| Requisito | Estado |
| --- | --- |
| Marcação por formando e por sessão, três estados | implementado |
| Funciona sem ligação, com estado de cada marcação | implementado |
| Conflitos entre aparelhos mantidos e assinalados | implementado |
| Estado próprio da sessão (agendada, realizada, cancelada, adiada) | implementado e testado |
| Sessão com data passada ainda agendada fica assinalada | implementado e testado |
| Folha imprimível por sessão | implementado |
| Sessões virtuais com proveniência manual registada | implementado; sem ligação automática a videoconferência (**pendente de informação da ATDI**) |

## Acessibilidade

Barra de acessibilidade, alto contraste, botão de ouvir, navegação por teclado
e áreas de toque de 44 pixéis mantidos em todos os ecrãs. Nenhuma informação
é transmitida apenas por cor. **Não é feita nenhuma alegação de certificação
legal de conformidade**, nem de existência de intérprete de língua de sinais
sem recurso real afecto.

## Testes automáticos executados

`bunx vitest run src/lib/__tests__` — 14 testes:

- limiares de assiduidade 79 % / 80 %;
- taxas estrita e ajustada com falta justificada;
- só sessões realizadas no denominador;
- marcação mais recente prevalece;
- sessão por regularizar;
- nota 59 % / 60 %;
- prazo no dia 30 e no dia 31;
- assiduidade por apurar e exame não submetido.

Nenhum teste insere dados na base partilhada nem emite certificados reais.

## Segurança

Leitura de banco de questões, tentativas de exame, composição das tentativas,
certificados de curso e presenças deixou de estar aberta a qualquer conta
autenticada: passa a exigir papel de equipa de formação (administração,
coordenação nacional, supervisão provincial, formador ou auditoria).

**Pendente:** revisão das restantes recomendações do analisador de segurança
que não dizem respeito a exames e presenças.

## Consolidação do curso Princípios da Transformação Digital (A11)

| Item | Estado | Referência |
| --- | --- | --- |
| Ordem do módulo dentro do curso (1 de 4) em vez do índice interno | Implementado e testado | sec. 6.1 |
| «Voltar ao curso» preserva o contexto `?curso=` em todas as ligações do módulo | Implementado e testado | sec. 6.1 |
| Módulo transversal continua partilhado, sem curso-pai único | Implementado e testado | sec. 6.1 |
| Formação aberta sem contexto mantém-se (fallback «formação aberta») | Implementado e testado | sec. 6.1 |
| Tempos de acolhimento, exposição, actividade e partilha de fonte única, iguais no conteúdo e no guião | Implementado e testado | sec. 6.1 |
| Soma verificada: 1320 min de módulos + 120 min de avaliação e orientação = 24 h | Implementado e testado | sec. 14 |
| Estado real do conteúdo (rascunho por validar) em vez de «será fornecido» | Implementado | sec. 6.1 |
| Recursos por produzir com forma, traço e texto distintos — nunca só cor | Implementado | acessibilidade |
| Guião do formador sem enunciados do exame certificador | Implementado e testado | sec. 10 |
| Banco 60 + 10 inactivo, gabaritos fora do pacote do navegador | Implementado e testado | sec. 10 |

### Percurso ainda em falta para um teste isolado de ponta a ponta

Do percurso «formando matriculado → progresso central → presenças → exame →
certificado», falta:

1. **Progresso central.** O progresso das lições é local e anónimo
   (`formacaoStore`, no aparelho). Não existe registo de progresso por
   inscrição no servidor; o progresso local não é, nem deve ser, prova de
   participação.
2. **Ligação matrícula ↔ percurso.** Não existe ecrã que ligue a lição aberta
   a uma inscrição em turma; a pessoa autenticada percorre o conteúdo do mesmo
   modo que a anónima.
3. **Ambiente isolado de demonstração.** Testar exame e certificado exige
   turma, sessões e inscrição reais; não foram criados dados fictícios na base
   partilhada.
4. **Activação do banco.** O exame permanece bloqueado enquanto as 70 questões
   estiverem inactivas, à espera de validação pedagógica.

Marcar uma lição como feita nunca conta como presença nem dispensa os 80 % de
assiduidade, os 60 % de nota e os 30 dias de prazo.

## Revisão transversal (A12) — requisito, evidência e lacuna

Critério usado: **não** se declara conformidade só porque existe ecrã ou teste
unitário. «Verificado» significa observado a correr (navegador, consulta à base
ou teste sobre a regra real). Prioridades: **P0** bloqueia entrega, **P1**
exigido pelo TdR mas não bloqueante hoje, **P2** melhoria.

| Área | Fonte | O que existe | Evidência | Lacuna | Prior. |
| --- | --- | --- | --- | --- | --- |
| Seis cursos e cargas | sec. 14 | Os 6 cursos na base com as horas da tabela da sec. 14 | Consulta à base | IA 16/20 h e Redes 120/80 h divergem entre sec. 6.2 e sec. 14 — **pendente de esclarecimento da ATDI**, não arbitrado por nós | P0 (externo) |
| Currículos e materiais | sec. 6, 6.1 | Transformação Digital com 12 lições completas (rascunho); restantes 5 cursos com estrutura e conteúdo por fornecer | Seed + teste de soma 24 h | Conteúdo dos outros 5 cursos por fornecer pela Ologa | P0 (externo) |
| Acesso público ao conteúdo | sec. 6.1 | Catálogo, módulos e lições abertos sem conta | Navegador | — | — |
| Acessibilidade | sec. 8 | Barra, alto contraste, ouvir, teclado, 44 px, texto sempre que há cor | Navegador | Revisão por terceiros (REMOTELINE) **proposta, não feita**; vídeo, legendagem e LSM por produzir | P1 |
| Contas, perfis e matrículas | sec. 7 | Conta, perfil, papéis, inscrição em turma | Código + políticas | Não há ecrã de auto‑matrícula por código para o formando | P1 |
| Progresso do formando | sec. 6.1, 11 | **Novo:** progresso por matrícula no servidor, único por matrícula+lição, validado no servidor | Testes e navegador (caso anónimo) | Percurso autenticado real por testar — não há turmas nem matrículas reais e não criámos dados fictícios | P1 |
| Turmas, horários e presenças | sec. 11 | Turmas, sessões com estado próprio, presenças em três estados, offline, folha imprimível | Testes de assiduidade | Sem dados reais; sessões virtuais sem ligação automática a videoconferência | P1 |
| Avaliação e certificação | sec. 10, 12, 12.1 | Banco com 5 tipologias, exame gerado no arranque, certificado individual com 80 %/60 %/30 dias validados no servidor | 14 testes de regra | Banco 60+10 **inactivo**; exame bloqueado até validação pedagógica | P0 (externo) |
| Gestão, indicadores e exportação | sec. 13 | Painel nacional por província e distrito, CSV, XLS e PDF | Navegador | Sem dados reais para validar volumes | P2 |
| Segurança, privacidade e auditoria | Lei 10/2024, sec. 15 | RLS em todas as tabelas, leitura de exames e presenças restrita à equipa de formação, registo de auditoria imutável | Políticas na base | Recomendações do analisador fora de exames e presenças por rever | P1 |
| Desempenho, 99,5 %, 200 simultâneos | sec. 16 | — | — | **Nunca medido.** Não existe teste de carga nem monitorização de disponibilidade | P1 |
| Alojamento, entrega de código e suporte | sec. 17 | Plataforma publicada; código no repositório | — | Plano de entrega, suporte e transferência por acordar | P1 |

### Progresso por matrícula — o que ficou implementado nesta etapa

- Tabela nova, aditiva, com unicidade matrícula+lição; nada foi alterado ou
  apagado nos dados existentes.
- Validação no servidor: dono da matrícula, existência da lição e pertença do
  módulo ao curso da turma, incluindo módulos partilhados (o transversal é
  aceite sem inventar um curso «pai»).
- Acesso: cada pessoa só vê e altera o progresso das suas matrículas; a equipa
  de formação lê segundo as atribuições que já existiam. Nada foi alargado.
- Interface: a carregar, a guardar, guardado, falhou com «tentar de novo».
  Nunca é afirmada sincronização que não aconteceu; sem sessão com matrícula, o
  progresso é explicitamente identificado como local.
- Progresso anónimo **não** é importado para a matrícula.
- Concluir uma lição não gera presença, aprovação nem certificado — dito no
  próprio ecrã.

### Testado e por testar

Testado em unidade (sem tocar na base): isolamento entre utilizadores, entre
matrículas e entre cursos, aceitação de módulo partilhado, recusa de lição fora
do curso e de matrícula inexistente — 7 testes, num total de 37 a passar.
Testado no navegador: a lição pública continua a funcionar sem conta e mostra o
aviso de progresso local. **Por testar num percurso real:** gravação, recarregar
a página e continuidade noutro aparelho com a mesma conta — depende de existir
uma turma e uma matrícula reais, que não criámos.

## A13 — verificação da etapa do progresso por matrícula

### Correcção ao que foi dito na secção A12

Os 7 testes de `progresso-matricula.test.ts` são **validação pura**: exercitam
apenas a regra de pertença (dono da matrícula, lição dentro do curso, módulo
partilhado). **Não** exercitavam persistência, autorização nem políticas de
acesso. Dizer que provavam «isolamento» era excessivo e fica corrigido aqui.

### Teste de integração real, em base efémera

Existe PostgreSQL 17 no ambiente de trabalho, por isso o teste integrado passou
a ser possível e **foi feito**: `scripts/teste-rls/correr.sh` cria uma base
temporária em `/tmp`, aplica a migração `0010` **tal e qual como está no
repositório**, carrega duas identidades e três matrículas só nessa base, corre
os testes e destrói tudo no fim. Nunca escreve na base partilhada do projecto.

Resultado executado (14 verificações, todas a passar):

| Verificação | Resultado |
| --- | --- |
| A grava na sua própria matrícula | passa |
| A relê o que gravou, em ligação nova (persistência) | passa |
| Segunda gravação da mesma lição é recusada pela unicidade | passa |
| A não consegue gravar na matrícula de B (política de acesso) | passa |
| B não vê o progresso de A | passa |
| B não consegue apagar o progresso de A, que continua intacto | passa |
| As duas matrículas de A não se contaminam | passa |
| Equipa de formação lê, mas não grava em nome de um formando | passa |
| Cada pessoa só vê as suas matrículas | passa |

Limite honesto deste teste: a base efémera reproduz os papéis, o `auth.uid()` e
as tabelas de que a migração depende, não é uma cópia integral do ambiente real.
Prova as políticas da migração 0010; não substitui um percurso real com turma,
sessões e certificação.

### Falha de gravação e troca de conta

Passam a estar cobertos por 4 testes de interface
(`src/hooks/__tests__/use-progresso-matricula.test.tsx`): gravação falhada
mostra erro e devolve falso (nunca «guardado»); «tentar de novo» volta a gravar
a mesma lição e passa a guardado; resposta atrasada de uma matrícula anterior
não altera o estado da matrícula actual depois de trocar de curso; sem matrícula
não é feita nenhuma chamada ao servidor.

Total executado nesta etapa: **41 testes automáticos** e **14 verificações de
integração**, mais a confirmação no navegador da lição pública.

### Matriz por área — resumo concreto

Três colunas a não confundir: **código** (existe e corre), **evidência**
(verificação mesmo executada) e **pendência**.

| Área | Código existente | Evidência executada | Pendência | Prior. |
| --- | --- | --- | --- | --- |
| Seis cursos e cargas | 6 cursos com as horas da tabela sec. 14 | Consulta à base | Divergência IA 16/20 h e Redes 120/80 h: **decisão da ATDI** | P0 |
| Currículos e materiais | Transformação Digital com 12 lições escritas; 5 cursos com estrutura, sem conteúdo | Testes de soma 24 h e de cobertura da sec. 6.1 | Rascunhos dos 5 cursos: **podemos preparar internamente**; só a validação é de terceiros | P0 |
| Acesso público | Catálogo, módulos e lições sem conta | Navegador | — | — |
| Acessibilidade | Barra, alto contraste, ouvir, teclado, 44 px, texto além da cor | Navegador | Revisão externa por marcar; vídeo, legendagem e LSM por produzir (produção nossa, validação externa) | P1 |
| Contas, perfis, matrículas | Conta, perfil, papéis, inscrição em turma | Testes de integração das matrículas | Ecrã de auto‑matrícula por código (nosso) | P1 |
| Progresso do formando | Progresso por matrícula no servidor | 14 verificações de integração + 4 de interface | Percurso com turma real | P1 |
| Turmas, horários, presenças | Turmas, estados de sessão, três estados de presença, offline, folha | 5 testes de assiduidade | Dados reais; sessões virtuais sem ligação a videoconferência | P1 |
| Avaliação e certificação | Banco 60+10, exame gerado no arranque, 80 %/60 %/30 dias no servidor | 20 testes de regra | Banco **inactivo** até validação pedagógica (terceiros) | P0 |
| Gestão, indicadores, exportação | Painel nacional, CSV, XLS, PDF | Navegador | Validar com volumes reais | P2 |
| Segurança e auditoria | RLS em todas as tabelas, leitura restrita, auditoria imutável | Políticas na base + integração 0010 | Recomendações fora de exames e presenças | P1 |
| Desempenho, 99,5 %, 200 simultâneos | — | **Nenhuma** | Teste de carga e monitorização: **nosso**, por fazer | P1 |
| Alojamento, entrega, suporte | Plataforma publicada, código no repositório | — | Rascunho do plano de entrega e suporte: **podemos escrever**; aprovação é da Ologa/ATDI | P1 |

### O que depende mesmo de terceiros

Só isto: esclarecimento das horas divergentes, validação pedagógica do banco e
dos conteúdos, revisão de acessibilidade por entidade externa e aprovação do
plano de entrega. Escrever rascunhos dos cinco cursos, produzir vídeo e
legendagem, preparar o plano de entrega e medir desempenho é trabalho nosso e
está por agendar, não bloqueado.

## A14 — Computação em Nuvem, módulo 2 «Serviços e Arquitectura na Nuvem»

Estado: **proposta pedagógica, rascunho por validar pela Ologa/ATDI**. As cinco
lições existentes foram preenchidas com conteúdo original, preservando os
identificadores. Nenhum laboratório foi executado por nós e o ambiente de
formação está por preparar.

Tempos (fonte única: `src/lib/plano-computacao-nuvem.ts`): 105 + 110 + 110 +
110 + 105 = **540 minutos = 9 horas**, confirmado por consulta à base. O curso
mantém 30 horas = 26 h de módulos temáticos + 2 h do transversal, contado uma
vez, + 2 h de diagnóstico, revisão e exame.

### Mapa requisito → lição → laboratório → evidência

| Requisito (sec. 6.3) | Lição | Laboratório | Evidência a recolher |
| --- | --- | --- | --- |
| Componentes de infra-estrutura: computação e armazenamento | M2L1 Recursos de computação e armazenamento | Criar bucket privado (Amazon S3) e preparar por escrito a máquina virtual | Captura do bloqueio de acesso público e do «acesso negado» em janela anónima; ficha de preparação da máquina |
| Criar um bucket de armazenamento | M2L1 | Amazon S3, com convenção de nomes do laboratório e ligação à regra oficial | Listagem do objecto fictício; registo da limpeza objectos → bucket |
| Criar uma rede virtual | M2L2 Redes e conectividade na nuvem | Rede virtual com três sub-redes (Azure), criada ANTES de qualquer máquina | Captura das sub-redes com intervalos e grupos associados |
| Criar regras de segurança | M2L2 | Três grupos de segurança, permissões em prioridade 100 e negação explícita em 4000 | Regras de entrada com origens restritas; avaliação de fluxo do portal nomeando a regra que decidiu |
| Criar uma máquina virtual | M2L2 | Máquina Linux criada dentro da sub-rede de aplicação, acesso remoto só do endereço de saída da sala | Teste positivo (sessão estabelecida) e teste negativo por avaliação de regras |
| Publicar aplicação simples via PaaS | M2L3 Bases de dados e aplicações na nuvem | Azure App Service em Linux; exemplo Node.js sem dependências fornecido no projecto (`public/exemplos/paas-node/`), testado localmente, publicado por `az webapp deploy --type zip` | Captura da página publicada, da variável de configuração e da lista vazia após limpeza |
| Serviços das plataformas populares; IaaS/PaaS/SaaS | M2L1 e M2L3 | — | Tabela de responsabilidades do fornecedor e da instituição |
| Disponibilidade, cópias e recuperação | M2L4 Disponibilidade, cópias e recuperação | Sem laboratório: planeamento | Plano de continuidade com as duas medidas, plano de cópias, restauro numerado e comunicação |
| Serverless, microserviços, cloud-native, DevOps, modernização | M2L5 Planear uma arquitectura simples | Sem laboratório: desenho | Desenho A3, justificações por componente, etapas de modernização, pressupostos |

Referências oficiais citadas nas lições, consultadas em 21 de Setembro de 2026:
guia rápido de máquina virtual Linux e de rede virtual do Azure, descrição
geral dos grupos de segurança de rede, guia rápido de aplicação Node.js no
Azure App Service, e guia de introdução ao Amazon S3. O antigo guia de
aplicação estática do App Service não foi usado por já encaminhar para outro
serviço.

### Regras aplicadas aos laboratórios

- Guiões **a executar**, não executados. Cada laboratório abre com esse aviso.
- Conta institucional de formação, permissões mínimas, limites de consumo e
  alertas definidos pelo formador. Sem cartões, sem aquisições, sem
  credenciais no material, sem promessa de gratuitidade.
- Armazenamento privado por defeito; nenhum acesso administrativo aberto ao
  mundo em nenhum passo.
- Dois formandos por computador no máximo, um por computador sempre que o
  equipamento chegue, com alternância de executante dentro do par (sec. 9). A
  demonstração do formador não substitui a prática: se o ambiente falhar, a
  prática fica registada como pendente e é reagendada.
- Pré-requisitos e limpeza separados por fornecedor: subscrição e grupo de
  recursos no Azure; conta e papel de formação com permissões limitadas aos
  buckets com o prefixo da turma na Amazon. Um bucket não pertence a um grupo
  de recursos do Azure.
- Ordem corrigida: a lição 1 pratica o armazenamento de objectos e prepara os
  parâmetros da máquina; a lição 2 cria rede, sub-redes e grupos de segurança
  e só depois cria a máquina na sub-rede de aplicação, porque a interface de
  rede não muda de rede virtual.
- Regras de segurança: a regra por omissão 65000 PERMITE o tráfego interno da
  rede virtual, pelo que cada grupo tem permissão específica em prioridade 100
  e negação explícita em 4000. A verificação usa teste positivo e avaliação de
  fluxo do portal; um tempo de espera esgotado não prova filtragem. Distingue-se
  regra desenhada, regra configurada e ligação testada.
- Limpeza por ordem de dependências, restrita aos recursos do exercício, sem
  afirmar que o grupo de recursos fica vazio quando contém infra-estrutura
  partilhada anterior.
- Material offline é preparação e não substitui a prática no ambiente real.

### Exemplo de aplicação do laboratório de plataforma

Os ficheiros `index.js` e `package.json` estão no projecto, em
`public/exemplos/paas-node/`, servidos em `/exemplos/paas-node/…`, e o código
completo está transcrito na lição. Usam apenas o módulo `http` do Node, sem
dependências, escutam `process.env.PORT` em `0.0.0.0`, lêem a variável não
secreta `MENSAGEM_EXEMPLO` e registam apenas método e caminho.

Testado localmente nesta etapa: resposta HTTP 200 com a mensagem por omissão e,
numa segunda execução, com o valor da variável definido; arquivo comprimido
verificado com `index.js` e `package.json` na raiz. **Não foi executada
nenhuma operação no Azure.** Método de publicação único e documentado:
`az webapp deploy --resource-group <grupo> --name <app> --src-path <zip> --type zip`,
com sessão institucional na linha de comandos, sem tokens nem autenticação
básica. A documentação oficial de implantação de arquivos regista que o envio
pela interface Kudu não funciona em Linux e que o arquivo não é construído por
defeito — daí o exemplo não ter dependências.

O plano de serviço só é apagado quando foi criado para o exercício; um plano
partilhado nunca é apagado.

### Estado das lições do curso

10 lições temáticas escritas (módulos 1 e 2), 5 por fornecer (módulo 3), mais
as 6 lições do módulo transversal já existentes. O banco de questões deste
curso continua por escrever e o exame continua bloqueado.
