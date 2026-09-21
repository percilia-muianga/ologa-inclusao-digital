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
