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
