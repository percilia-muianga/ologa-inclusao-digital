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
| Criar regras de segurança | M2L2 | Três grupos de segurança, permissões em prioridade 100 e negação explícita em 4000 | Regras de entrada com origens restritas nas permissões (as negações têm origem qualquer, por função); avaliação de fluxo na interface da máquina de aplicação. A sub-rede de dados não tem máquina nesta sessão: configuração revista, conectividade **não testada** |
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
  regra desenhada, regra configurada e ligação testada. A máquina é criada com
  a interface de rede sem grupo de segurança próprio, para não acumular com o
  da sub-rede. A ferramenta de avaliação de fluxo e as suas permissões são
  preparadas pelo formador; se faltar, o teste fica registado como pendente.
- Limpeza por ordem de dependências, restrita aos recursos do exercício, sem
  afirmar que o grupo de recursos fica vazio quando contém infra-estrutura
  partilhada anterior.
- Material offline é preparação e não substitui a prática no ambiente real.

### Exemplo de aplicação do laboratório de plataforma

Os ficheiros `index.js` e `package.json` estão no projecto, em
`public/exemplos/paas-node/`, servidos em `/exemplos/paas-node/…`, e o código
completo está transcrito na lição. Usam apenas o módulo `http` do Node, sem
dependências, escutam `process.env.PORT` em `0.0.0.0`, lêem a variável não
secreta `MENSAGEM_EXEMPLO` e registam apenas o método HTTP, sem endereço nem parâmetros.

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

15 lições temáticas escritas (módulos 1, 2 e 3), 0 por fornecer, mais as 6
lições do módulo transversal já existentes: 21 escritas, 0 por fornecer,
verificado por consulta à base. O banco de questões deste curso continua por
escrever e o exame continua bloqueado.

## A15 — Computação em Nuvem, módulo 3 «Governação, Segurança e Custos»

Estado: **proposta pedagógica, rascunho por validar pela Ologa/ATDI**. As cinco
lições já existentes foram preenchidas com conteúdo original, preservando
identificadores, ordem e relações. **Nenhuma lição deste módulo tem
laboratório**: todos os exercícios são de análise e de simulação documental, em
papel ou em folha de cálculo. Não foi criado nenhum recurso em nenhuma nuvem e
não foi criado nenhum formando, turma ou certificado fictício na base.

Tempos (fonte única: `src/lib/plano-computacao-nuvem.ts`): 100 × 5 = **500
minutos = 8 h 20**. As exibições antigas de «2 horas» por lição foram
substituídas na base por «100 minutos». Plano do curso: M1 520 + M2 540 +
M3 500 + transversal 120 (contado uma vez) + diagnóstico, revisão e exame 120 =
**1800 minutos = 30 horas**. A repartição interna é proposta da equipa, por
validar; o Termo de Referência fixa o total do curso, não o tempo de cada
módulo.

### Mapa requisito → lição → actividade → evidência

| Requisito | Origem | Lição | Actividade (análise documental) | Evidência/produto |
| --- | --- | --- | --- | --- |
| Gestão de identidades e controlo de acesso | sec. 6.3 (exigência) | M3L1 Identidades e controlo de acesso | Matriz de permissões com 6 intervenientes × 7 colunas, separação de tarefas e limitação assumida | Matriz preenchida; rubrica de 10 pontos |
| Criptografia | sec. 6.3 (exigência) | M3L2 Protecção de dados na nuvem | Plano de protecção em 5 partes, sem dados reais, com limites da criptografia escritos | Plano de protecção; rubrica de 10 pontos |
| Monitoria e resposta a incidentes | desenvolvimento pedagógico, por validar | M3L3 Monitoria e resposta a incidentes | Análise de registos fictícios de uma madrugada; triagem, contenção autorizada, evidências, lições aprendidas. Sem técnicas ofensivas | Ficha de incidente; rubrica de 10 pontos |
| Custos, consumo e optimização | desenvolvimento pedagógico, por validar | M3L4 Custos, consumo e optimização | Cálculo sobre tabela de preços **fictícios** com todos os operandos; medidas classificadas em três colunas; limites dos alertas de orçamento | Folha de cálculo com operandos visíveis; rubrica de 10 pontos |
| Requisitos de contratação de serviços de nuvem | desenvolvimento pedagógico, por validar | M3L5 Requisitos para contratação | 8 requisitos mensuráveis, RPO/RTO, cláusulas de saída, comparação de duas propostas fictícias | Caderno de requisitos e recomendação; rubrica de 10 pontos |

### Cálculo do exercício de custos (verificado em teste)

Preços e consumo são FICTÍCIOS, definidos em
`scripts/conteudo/computacao-nuvem-m3.ts` e usados para gerar o texto da lição,
de modo a não haver dois números diferentes no mesmo material. Computação
(720 h + 220 h) × 0,10 = 94,00; discos 192 GB × 0,12 = 23,04; objectos
400 GB × 0,025 = 10,00; saída (150 − 10) GB × 0,09 = 12,60; cópias
200 GB × 0,05 = 10,00; registos 30 GB × 0,50 = 15,00. Consumo = **164,64 USD**;
suporte 10 % = 16,46, abaixo do mínimo, logo **25,00 USD**; total
**189,64 USD**; ao câmbio assumido de 64 MZN/USD, **12 136,96 MZN**. A solução
de referência está apenas no guião do formador. Verificado em
`src/lib/__tests__/computacao-nuvem-modulo3.test.ts`.

### Limites e rotulagem honesta

- Repartição das cinco lições: proposta Ologa/ATDI por validar, não imposição
  do Termo de Referência. Só identidade, acesso e criptografia constam da
  secção 6.3.
- Casos, instituições, registos, preços e propostas são fictícios e estão
  identificados como tal no próprio texto.
- Não há vídeo, não há interpretação em língua de sinais e não há aprovação
  REMOTELINE associados a este módulo. Nada disso é afirmado no conteúdo.
- Dois formandos por computador no máximo, com alternância de quem escreve; um
  por pessoa é a recomendação. Os exercícios do módulo 3 podem ser feitos
  integralmente em papel.
- Partilha por amostra de dois grupos; os restantes recebem apreciação escrita.
- M3L5 não aplica automaticamente a meta de 99,5 % do Termo de Referência, que
  é da plataforma daquele concurso, a qualquer fornecedor; e não produz
  conclusões jurídicas — a matéria legal fica remetida à área jurídica da
  instituição.
- Ficha do curso preenchida (objectivos, público-alvo, pré-requisitos e
  materiais), distinguindo em cada campo a exigência do Termo de Referência da
  proposta da equipa.
## A16 — Computação em Nuvem: banco de avaliação (rascunho, inactivo)

Estado: **banco preparado, por validar, inactivo**. Não há aprovação da
Ologa/ATDI, o exame não está activo e nenhum certificado é emitido.

Contagens verificadas por teste automático e confirmadas na base de dados:

- Exame final: **60 questões**; diagnóstico/pós-teste: **10 questões**;
  total **70**, todas com `activa = false`.
- Rácio da secção 10 do Termo de Referência: o exame proposto é de 20
  questões e o curso não tem configuração própria em `exame_configuracoes`,
  pelo que vale a configuração por omissão de 20 questões e 60 minutos.
  60 ÷ 20 = **3×**, o mínimo exigido, cumprido.
- Distribuição por módulo (proposta pedagógica, não imposição do TdR):
  18 no módulo 1, 21 no módulo 2, 15 no módulo 3, 6 no transversal.
- Tipologias pedagógicas: 24 escolha múltipla, 12 verdadeiro/falso,
  12 associação, 12 cenários. Os cenários usam resposta de escolha múltipla
  — a única tipologia fechada adequada suportada pelo motor — mas o enunciado
  contém sempre caso e problema. Na base de dados ficam 36 de escolha
  múltipla (24 + 12 cenários), 12 verdadeiro/falso e 12 associação.
- Dificuldades: 24 fáceis, 24 médias, 12 difíceis. O sorteio usa 40/40/20,
  ou seja 8/8/4 numa prova de 20; há pelo menos o triplo em cada nível.

### Limite conhecido do sorteio

O motor actual estratifica a selecção **apenas por dificuldade**. Não
garante, por construção, a presença de todos os módulos nem de todas as
tipologias em cada prova. Com a distribuição escrita, a probabilidade de
cobertura ampla é alta, mas não é uma garantia. Corrigir isto exige alterar
o algoritmo de selecção para estratificar também por módulo — trabalho não
incluído nesta tarefa e por decidir com a Ologa/ATDI.

### Tempo

O exame proposto (20 questões, 60 minutos) cabe no bloco de 120 minutos já
reservado — diagnóstico 30, revisão e pós-teste 30, orientação e exame 60 —
sem aumentar as 30 horas do curso.

### Segurança

- Gabaritos e justificações vivem em `scripts/conteudo/computacao-nuvem-questoes.ts`,
  fora de `src/`. Um teste verifica que nenhum ficheiro de `src/` importa esse
  módulo, pelo que não entra no pacote do navegador.
- A tabela `banco_questoes` mantém as políticas em vigor; nada foi
  enfraquecido e nenhum segredo foi escrito em código.
- O sorteio só lê questões com `activa = true`; com todas inactivas, o exame
  falha com banco insuficiente e não chega a ser gerado.
- Semente `scripts/seed-questoes-computacao-nuvem.ts`: idempotente pela chave
  instrumento + enunciado, escreve só em `banco_questoes` e só neste curso.
  Segunda execução: 0 inseridas, 70 actualizadas.
- Não foram criados formandos, turmas, tentativas nem certificados.

### Cálculos dos cenários de custo (preços e câmbio fictícios)

- Computação: 220 h × 0,10 USD/h = **22,00 USD**, com o pressuposto expresso
  de libertação da capacidade e ausência de compromissos contratuais.
- Armazenamento: 400 GB × 0,025 USD/GB-mês = 10,00 USD; × 64 MZN/USD =
  **640,00 MZN**.

### Cobertura temática

Características do NIST, história, modelos de serviço e de implantação e
responsabilidade partilhada (M1); máquina virtual, rede virtual e regras,
contentor privado, publicação em plataforma como serviço, disponibilidade,
cópias, RPO e RTO, cloud-native, DevOps, microserviços e serverless (M2);
identidades, MFA distinto de dois passos, chaves e segredos, criptografia e
os seus limites, registos e incidentes, custos e requisitos de saída (M3);
acessibilidade e organização da prática contextualizadas à formação
(transversal). Não foram introduzidos factos jurídicos novos; a matéria legal
continua remetida à área jurídica da instituição.

Pendências que se mantêm: validação pela Ologa/ATDI, revisão por terceiros,
Língua de Sinais Moçambicana, vídeo e legendagem.

## A17 — Exposição do banco de questões (corrigida em 21/09/2026)

**Observado.** A página de gestão do banco (`/avaliacao/banco`), na pré-visualização
e na versão publicada, listava questões — enunciado, opções, resposta correcta
marcada e explicação — sem sessão iniciada na aplicação. A causa não era a base
de dados: as políticas de acesso da tabela `banco_questoes` só permitem leitura à
equipa de formação autenticada e o acesso anónimo directo à tabela é recusado
(`permission denied for table banco_questoes`). A causa eram as funções de
servidor de gestão (`listarQuestoes`, `referenciasBanco`, `criarQuestao`,
`actualizarQuestao`, `definirEstadoQuestao`, `guardarConfiguracaoExame`), que
usavam a chave de serviço — que ignora as políticas — **sem verificar quem
chamava**. Esconder botões na interface não resolvia: o ponto de acesso era
invocável directamente.

**Correcção aplicada.** Todas essas funções passaram a exigir sessão real,
validada no servidor, e a verificar o papel **antes** de qualquer consulta. O
papel é lido da base de dados com o cliente autenticado do próprio utilizador;
nunca é aceite do lado do cliente. Leitura: administração Ologa, administração
ATDI, coordenação nacional e auditoria ATDI. Escrita e activação: os mesmos,
excepto a auditoria. Anónimo, formando, formador, supervisor provincial e gestor
de instituição são recusados. A interface só pede a lista depois de o servidor
confirmar a permissão, e mostra uma página de acesso negado caso contrário. O
panorama público continua a mostrar apenas contagens agregadas — nunca
enunciados, opções ou respostas. Nenhuma política de acesso foi enfraquecida.

**Verificações reais.** No navegador sem sessão, a página devolve «sem permissão»
e a única chamada ao servidor responde «Unauthorized»; nenhuma questão é
transferida. Leitura anónima directa da tabela: recusada. Seis testes isolados
cobrem a regra de autorização para anónimo, formando, formador, supervisor,
auditoria, coordenação, administração e papéis inventados pelo cliente. Não foram
criados utilizadores, tentativas nem dados de teste, e não se executou nenhuma
mutação em produção.

**Consequência para o banco.** Porque esteve visível publicamente durante este
período, o banco de ambos os cursos — Princípios da Transformação Digital e
Computação em Nuvem — deve ser **revisto e, se possível, renovado antes de
qualquer activação**: questões que circularam publicamente perdem valor
certificador. Todas as questões continuam inactivas.

## A18 — Sorteio com cobertura garantida e versões do banco (21/09/2026)

**Sorteio.** O motor anterior só equilibrava dificuldade. Passou a existir um motor
puro com retrocesso (`src/lib/sorteio-exame.ts`) que, para cada prova de 20 questões,
respeita em simultâneo quotas por módulo, por tipologia pedagógica (o cenário conta
como categoria própria, mesmo quando a resposta é de escolha múltipla) e por
dificuldade (8 fáceis, 8 médias, 4 difíceis, conforme a configuração 40/40/20). A
escolha é aleatória entre as combinações viáveis, sem repetição, feita no servidor;
as respostas nunca são enviadas ao formando.

Quotas propostas (proposta pedagógica da equipa, por validar pela Ologa/ATDI; o TdR
exige variedade e aleatoriedade, não estas quotas):

- Computação em Nuvem: 6 do módulo 1, 7 do módulo 2, 5 do módulo 3, 2 do transversal;
  8 escolha múltipla, 4 verdadeiro/falso, 4 associação, 4 cenário.
- Princípios da Transformação Digital: 7 + 7 + 6 por módulo; 12 escolha múltipla,
  5 verdadeiro/falso, 2 associação, 1 ordenação.

Se as restrições não forem satisfazíveis, a prova **é bloqueada** com a causa
(quotas incoerentes, módulo/tipo/dificuldade sem questões suficientes, combinação
impossível, limite de trabalho). Nunca se completa em silêncio com o que houver.

**Versões.** `banco_questoes` ganhou `versao`, `estado_revisao` (`em_uso`/`retirada`),
`retirada_em`, `retirada_motivo` e `cenario` (migração 0011). Um gatilho na base
impede activar uma questão retirada, e o servidor recusa a operação antes disso.
Nada é apagado: enunciados, respostas, explicações e eventuais tentativas históricas
ficam intactos.

**Retirada das versões expostas.** Porque a página de gestão esteve acessível sem
sessão (ver A17), a versão `v1` dos dois cursos foi retirada: 70 questões de
Computação em Nuvem (60 de exame + 10 de diagnóstico) e 70 de Princípios da
Transformação Digital. Ficam guardadas, fora do sorteio, fora do rácio e não
activáveis. **Em consequência, nenhum dos dois cursos tem questões utilizáveis: o
exame permanece bloqueado até a renovação do conteúdo (versão nova) ser escrita e
validada pela Ologa/ATDI.** Não havia tentativas nem certificados (0 e 0), pelo que
nenhum registo histórico foi afectado.

**Seeds.** As gravações antigas deixam de reescrever ou reactivar linhas retiradas
(contam-nas em separado) e passam a marcar a versão que gravam (`VERSAO_BANCO`,
por omissão `v1`). Continuam idempotentes.

**Verificações reais.** 90 testes: 200 amostras de Cloud e 150 de TD sem falhas,
determinismo por semente, mais de 20 provas distintas em 30 sementes, bloqueios com
causa, escassez de cenários, caso que um algoritmo ganancioso perderia, exclusão de
inactivas/retiradas/diagnóstico no carregamento do exame, retirada sem apagar,
motor sem acesso à base nem a gabaritos. Gravação repetida do banco Cloud: 0
inseridas, 0 actualizadas, 70 ignoradas por estarem retiradas. Nada foi publicado.

---

## A19 — Renovação dos bancos de questões (versão 2), 21/09/2026

**Âmbito.** Renovação integral dos bancos dos dois cursos cuja versão 1 esteve
exposta (ver A17 e A18). Conteúdo escrito de raiz, com identificadores novos, na
versão `v2`: 60 questões de exame + 10 de diagnóstico por curso, 140 no total.
**Todas inactivas** (rascunho por validar pela Ologa/ATDI). Nada foi activado,
nenhum exame foi gerado, nenhum certificado emitido e nada foi publicado.

**Ficheiros.** `scripts/conteudo/computacao-nuvem-questoes-v2.ts`,
`scripts/conteudo/transformacao-digital-questoes-v2.ts`,
`scripts/seed-questoes-v2.ts`, `src/lib/__tests__/bancos-v2.test.ts`.
Gabaritos e justificações vivem fora de `src/` e de `public/`; nenhum ficheiro do
site os importa.

**Composição (proposta pedagógica, por validar — não é imposição do TdR).**

| Curso | Módulos | Tipologias | Dificuldades |
| --- | --- | --- | --- |
| Computação em Nuvem | 18 M1, 21 M2, 15 M3, 6 transversal | 24 escolha múltipla, 12 V/F, 12 associação, 12 cenário | 24 fáceis, 24 médias, 12 difíceis |
| Princípios da Transformação Digital | 21 M1, 21 M2, 18 M3 | 36 escolha múltipla, 15 V/F, 6 associação, 3 ordenação | 24 fáceis, 24 médias, 12 difíceis |

Ambos cumprem o mínimo da secção 10 do TdR: 60 ÷ 20 = 3× a prova, e cada quota de
módulo e de tipologia tem pelo menos o triplo do que a prova consome.

**Limite declarado.** As quotas em vigor de Transformação Digital não incluem
módulo transversal nem tipologia de cenário; por isso o banco novo desse curso não
escreve questões desses tipos, que ficariam fora do sorteio. Se a Ologa/ATDI
alterar as quotas, o banco tem de ser alargado em conformidade.

**Ajuste no motor de sorteio.** A ordem de exploração das células passou a começar
pelas mais escassas, com desempate ao acaso. Não retira soluções (o retrocesso
continua completo) e não altera quotas nem aleatoriedade do resultado; reduz o
trabalho. Antes do ajuste, 1 em 300 sementes esgotava o limite de trabalho com o
banco real de Nuvem e bloqueava a prova; depois, 0 falhas em 2000 sementes.

**Preservação do histórico.** As 140 linhas da versão 1 continuam na base,
retiradas, com respostas e explicações, fora do sorteio, fora do rácio e não
activáveis (bloqueio na base e recusa no servidor). Nada foi apagado. A semente
nova ignora qualquer enunciado já retirado, mesmo que o texto coincida.

**Verificações reais.** 106 testes e verificação de tipos limpa, incluindo:
contagens 60+10 por curso; rácio ≥ 3× por total, por módulo e por tipologia;
ausência de enunciados repetidos dentro e entre instrumentos; ausência de repetição
dos enunciados da versão retirada de Nuvem; validade de gabaritos, opções
distintas, pares de associação e sequências de ordenação; 100 provas simuladas por
curso com os bancos reais em memória, todas viáveis, com módulos, tipologias e
dificuldades exactamente nas quotas, sem repetição de questão e com mais de 80
provas distintas em 100 sementes; diagnóstico separado e fora do sorteio. Gravação
repetida: 0 inseridas, 70 actualizadas por curso, 0 duplicados. Estado na base:
140 rascunhos utilizáveis (70 + 70), 140 retiradas, 0 activas.

## A20 — Correcção da lacuna de cobertura em Transformação Digital, 21/09/2026

**Lacuna declarada.** O requisito do primeiro bloco era cobertura garantida de
TODOS os módulos associados e de cenários nos DOIS cursos. O resultado
anterior não cumpria em Transformação Digital: as quotas desse curso não
incluíam o módulo transversal «Governo Digital Inclusivo e Acessibilidade»
(ordem 200), que está associado ao curso, nem qualquer questão de cenário, e o
banco v2 desse curso foi escrito em conformidade com essa limitação. Ficou
assim declarado como limite, mas era uma lacuna face ao requisito, e é
corrigida aqui. Computação em Nuvem foi preservada sem alteração.

**Quotas de Transformação Digital (proposta pedagógica da Ologa, por validar
pela ATDI — não é imposição do TdR).** Prova de 20 questões em 60 minutos,
dentro do bloco de avaliação já reservado, sem alterar as 24 horas do curso:

| Módulo (nome) | Ordem | Questões na prova | Banco |
|---|---|---|---|
| Fundamentos da Transformação Digital | 111 | 6 | 18 |
| Serviços Públicos Centrados no Cidadão | 112 | 6 | 18 |
| Implementação e Mudança Institucional | 113 | 6 | 18 |
| Governo Digital Inclusivo e Acessibilidade (transversal) | 200 | 2 | 6 |

Tipologias na prova: 8 escolha múltipla, 4 verdadeiro/falso, 4 associação,
2 ordenação, 2 cenários. Banco: 24 / 12 / 12 / 6 / 6. Dificuldade na prova:
8 fáceis, 8 médias, 4 difíceis; banco 24 / 24 / 12. O cenário é categoria
pedagógica própria e exclui a classificação como escolha múltipla, mesmo
usando esse formato de resposta. Cada dimensão tem exactamente o triplo do que
a prova consome, pelo que cada exame inclui todos os módulos, todos os
formatos e cenários.

**Conteúdo.** Foram reaproveitadas as questões v2 boas, nunca expostas (a
versão exposta é a v1, retirada e nunca reutilizada), e escritas de raiz as que
faltavam: cenários com caso e decisão nos três módulos temáticos, associações e
ordenações adicionais, e seis questões transversais sobre acessibilidade e
serviços inclusivos, baseadas nas lições dos formandos, sem invocar normas
jurídicas novas. Duas questões que já eram casos passaram a estar classificadas
como cenário por metadado. Os elementos mantidos conservam o enunciado, e
portanto o registo e o identificador estáveis.

**Reconciliação da semente.** A semente v2 passa a retirar (nunca apagar) as
linhas v2 em uso cujo enunciado já não consta do ficheiro, com motivo escrito,
de modo a não restarem sobrantes a contar como utilizáveis. Execução:
18 inseridas, 52 actualizadas, 18 sobrantes retiradas em Transformação Digital;
Nuvem intacta. Repetição: 0 inseridas, 0 sobrantes — idempotente.

**Estado na base.** Transformação Digital: 60 de exame + 10 de diagnóstico
utilizáveis na v2, 88 retiradas (70 da v1 exposta + 18 sobrantes da revisão),
0 activas. Computação em Nuvem: 60 + 10 utilizáveis, 70 retiradas, 0 activas.
Nada foi activado, nenhum exame está operacional e nada foi publicado.

**Verificações reais.** 107 testes e verificação de tipos limpa, incluindo
contagens exactas de Transformação Digital por módulo, tipologia e
dificuldade; quotas com transversal e cenário; 100 provas simuladas por curso
com os bancos reais, todas viáveis e com cobertura completa; 150 amostras com a
composição real de Transformação Digital, todas com os quatro módulos, dois
cenários e duas ordenações; exclusão de inactivos, retirados e diagnóstico do
sorteio. Contagens confirmadas também por consulta directa à base.

## A21 — Introdução à Inteligência Artificial, bloco 1 (21/09/2026)

### Divergência de carga horária — POR RESOLVER com a ATDI

Os documentos do concurso não coincidem quanto à duração deste curso:

| Onde | O que diz |
| --- | --- |
| Secção 6.2, p. 13 | duração máxima de **16 horas**, incluindo a componente prática |
| Secção 14, p. 29 (tabela) | **20 horas**, regime presencial |
| Secção 13.1, p. 27 | remete a tabela de cargas horárias para as **propostas dos concorrentes** |

Decisão em vigor: a equipa trabalha com **20 horas a título PROVISÓRIO**, por
autorização da gestora do projecto, enquanto a ATDI não confirma. Em lado
nenhum — ficha, plano, páginas do curso — se afirma que as 20 horas estão
fixadas, são definitivas ou resultam inequivocamente dos Termos de Referência.

A divisão interna que propomos (8 h + 8 h + 2 h + 2 h) **não é explicação da
divergência acima**: é apenas a nossa repartição proposta, por validar. A
divergência está nos documentos do concurso.

Plano alternativo adaptável a **16 horas**: documentado em
`src/lib/plano-inteligencia-artificial.ts` (`PLANO_ALTERNATIVO_16H`) e **NÃO
activo** — 6 h módulo 1, 6 h módulo 2, 2 h transversal, 2 h avaliação. Reduz e
reorganiza actividades sem retirar objectivos; nada do que for encurtado pode
ser descrito como simulação prática executada.

Correcção de apresentação: a página de curso dizia «Carga fixada nos Termos de
Referência». Passou a ser condicionada por `cursos.carga_horaria_nota`
(migração `0012_cursos_nota_carga_horaria.sql`). Quando essa nota existe, a
página mostra «Carga horária por confirmar» e o texto da divergência, e diz
«carga horária usada a título provisório neste plano». Os restantes cursos, que
não têm nota, mantêm o texto anterior sem alteração.

### Plano proposto (1200 minutos = 20 horas provisórias)

| Bloco | Minutos | Estado |
| --- | --- | --- |
| Módulo 1 — Fundamentos de Inteligência Artificial (4 lições × 120) | 480 | escrito, rascunho |
| Módulo 2 — Uso Responsável da Inteligência Artificial (4 lições × 120) | 480 | escrito, rascunho (22/09/2026) |
| Transversal — Governo Digital Inclusivo e Acessibilidade (6 lições) | 120 | já existia, contado uma única vez |
| Diagnóstico 20 + revisão 40 + exame 60 | 120 | fora dos módulos |
| **Total** | **1200** | |

Grelha de tempos de cada lição, fonte única em `plano-inteligencia-artificial.ts`:
10 acolhimento + 35 exposição + 60 actividade + 15 síntese = 120 minutos. O
conteúdo e o guião do formador são gerados daí, não escritos à mão em dois
sítios.

### Mapa requisito (secção 6.2, pp. 13-14) → lição → actividade → evidência

| Requisito | Onde está | Actividade | Evidência |
| --- | --- | --- | --- |
| Conceito e fundamentos de IA | M1 L1 | classificar 8 casos: regra escrita vs. inferência | ficha por par, 8 casos classificados e justificados |
| Dados, algoritmos e modelos | M1 L2 | mini-conjunto fictício de 10 linhas, fornecido por inteiro | lista de ≥5 problemas classificados e corrigidos |
| Aprendizagem automática | M1 L3 | tabela de resultados de 200 casos, cálculos à mão | 4 valores calculados com operandos visíveis |
| Uso de ferramentas de IA | M1 L4 | prática assistida com ferramenta institucional autorizada | folha de registo por execução, ou «PENDENTE» |
| Aplicações e oportunidades | M1 L4 | 3 tarefas apoiáveis + 2 vedadas sem decisão superior | ficha por par |
| Ética, riscos e protecção de dados | M1 L2 (introdução), M2 L2 e M2 L3 | tabela de 16 campos: minimizar, agregar, remover, finalidade, acesso, retenção, eliminação; cálculo de falsos positivos e falsos negativos por grupo | ficha de dados preenchida com fluxo e medidas; folha de cálculos por grupo com denominadores |
| Uso real de ferramentas de IA | M2 L1 | duas execuções por par com ferramenta institucional autorizada, alternando quem escreve, sobre 5 pedidos sintéticos e regras de triagem fornecidas | folha de registo por execução (erros, tempo, instrução melhorada) ou «PENDENTE — a reagendar» |
| Oportunidades e desafios organizacionais e económicos | M2 L1 | comparação em 6 critérios com a alternativa sem IA: custo, benefício, trabalho, língua, conectividade, dependência de fornecedor | grelha preenchida e recomendação fundamentada |
| Riscos, preconceito algorítmico e inclusão | M2 L3 | tabela de 600 pedidos com os dois tipos de erro por grupo | taxas por grupo com operandos visíveis, origens da diferença e alternativa acessível |
| Governação, EU AI Act, actores, política e diplomacia | M2 L4 | comité de supervisão com fichas de função, matriz de risco, minuta de suspensão e proposta de piloto | matriz preenchida com responsável, acção, evidência e prazo; minuta de suspensão |

O EU AI Act é legislação da União Europeia. Fica registado, na ficha e aqui,
que é estudado como referência internacional de governação e que **não se
afirma** que se aplica automaticamente a Moçambique. Qualquer leitura jurídica
cabe à área jurídica da instituição. A lição M2 L4 foi escrita no bloco A23,
com fontes oficiais e data de consulta.

### Cálculos verificados (M1 L3)

Conjunto reservado de 200 casos: 30 verdadeiros positivos, 20 falsos positivos,
10 falsos negativos, 140 verdadeiros negativos. 30+20+10+140 = 200.
Taxa de acerto (30+140)/200 = 170/200 = 0,85 = 85 %.
Incompletos apanhados 30/40 = 0,75 = 75 %.
Sistema que nunca assinala: 160/200 = 0,80 = 80 %.
Todos os operandos aparecem no enunciado e na rubrica.

### Fontes primárias usadas (paráfrase original, sem cópia)

- OECD AI Principles — https://oecd.ai/en/ai-principles (definição de sistema de IA, inferência, autonomia e adaptação variáveis).
- NIST AI Risk Management Framework — https://www.nist.gov/itl/ai-risk-management-framework (quadro **voluntário** de gestão de risco; não é lei).

### Rigor factual imposto às lições

- Nem toda a regra nem todo o algoritmo é IA; automação por regras é distinguida de inferência a partir de dados.
- Não se afirma que a IA aprende sempre durante a utilização; o treino é anterior e só muda com novo treino autorizado.
- IA generativa não é uma quarta categoria mutuamente exclusiva de supervisionada/não supervisionada/reforço.
- IA generativa não aprende automaticamente com cada conversa: memória da conversa ≠ alteração do modelo.
- Aprendizagem por reforço não é «gosto/não gosto» do utilizador: é sinal de recompensa definido, com processo de treino.
- Saída fluente não garante verdade — trabalhado em L1 e posto à prova em L4.

### Estado honesto no fim deste bloco

- Lições com conteúdo escrito neste curso: **10** (4 do módulo 1 + 6 do transversal, que já existiam). Por fornecer: **4** (módulo 2). Confirmado no navegador.
- Todo o conteúdo é **rascunho, por validar pela Ologa/ATDI**. A disponibilidade na plataforma não é aprovação.
- A prática da L4 está **por executar**: exige ferramenta institucional previamente autorizada, com contas e permissões preparadas pelo formador. Ninguém cria conta pessoal, ninguém paga, não se promete gratuitidade e não entram dados reais de pessoas. Se a ferramenta faltar, regista-se «prática com ferramenta: PENDENTE — a reagendar» e **não** se declara prática realizada.
- O anexo B da L4 está etiquetado como **saída simulada**, escrita pela equipa; não foi produzida por nenhuma ferramenta.
- **Banco de avaliação deste curso: ainda por preparar, inactivo.** O exame não está activo e não emite certificados.
- Língua de Sinais de Moçambique, vídeo, legendagem e revisão de acessibilidade por terceiros: pendentes, não reclamados.
- IDs de curso, módulos e lições preservados; nenhuma lição foi criada ou apagada; nenhum outro curso, banco de questões ou regra de autorização foi tocado. Nada foi publicado.

## A22 — Apresentação pública do curso de Inteligência Artificial (21/09/2026)

Por orientação da gestora do projecto, a experiência pública deste curso passa a
apresentar simplesmente **20 horas** como configuração actual, sem rótulo de
carga provisória, sem aviso comparativo com as 16 horas da secção 6.2 e sem os
avisos repetidos de «proposta pedagógica — por validar» em cada lição e guião.

Isto **não** afirma aprovação da ATDI: em lado nenhum se diz aprovado, fixado
pelos Termos de Referência ou certificado conforme.

A divergência documental real (secção 6.2 p. 13 — 16 h máx.; secção 14 p. 29 —
20 h; secção 13.1 p. 27 — remissão para as propostas), a decisão operacional
das 20 horas, o responsável, o estado «pendente de confirmação pela ATDI», o
plano alternativo de 16 horas e todo o estado editorial (módulo 2 por escrever,
banco de avaliação por preparar, prática da lição 4 por executar, Língua de
Sinais, vídeo, legendagem e revisão por terceiros inexistentes) passam a estar
registados em **`docs/pontos-por-validar.md`** e nas constantes internas
`DIVERGENCIA_CARGA_INTERNA` e `ESTADO_EDITORIAL_INTERNO`.

`cursos.carga_horaria_nota` fica nula para este curso e `licoes.proposta_por_validar`
passa a `false` nas quatro lições escritas: o estado editorial vive nos registos
internos, não na plataforma. O que não existe continua a não ser anunciado — o
módulo 2 aparece como «Em preparação», sem ligação. Transformação Digital e
Computação em Nuvem mantêm o aviso visível de proposta por validar, sem
alteração de conteúdo.
