# Plano curricular — Princípios da Transformação Digital (24 h, virtual)

Concurso 78A/MDAP/MCTD/QCBS/25. Este documento separa, de forma expressa, o que
é **exigência do Termo de Referência** do que é **proposta da equipa, por
validar pela Ologa/ATDI**.

## 1. Exigência do Termo de Referência

| Origem | Exigência |
| --- | --- |
| Secção 14 (tabela) | 24 horas, regime virtual |
| Secção 6.1 | âmbito mínimo de conteúdo (ver ponto 3) |
| Secção 10 | banco activo com o triplo das questões do exame; tipologias variadas; geração aleatória individual |
| Secções 12 e 12.1 | assiduidade ≥ 80 %, nota final ≥ 60 %, exame até 30 dias de calendário após o fim da formação |

## 2. Proposta da equipa — por validar

A distribuição interna abaixo **não é imposta pelo Termo de Referência**. É
proposta nossa e está registada como decisão pendente.

| Bloco | Horas | Teoria | Prática |
| --- | --- | --- | --- |
| Módulo 1 — Fundamentos da Transformação Digital | 6 h | 3 h | 3 h |
| Módulo 2 — Serviços Públicos Centrados no Cidadão | 7 h | 3 h | 4 h |
| Módulo 3 — Implementação e Mudança Institucional | 7 h | 2 h | 5 h |
| Módulo transversal — Governo Digital Inclusivo e Acessibilidade | 2 h | 1 h | 1 h |
| Diagnóstico e orientação inicial | 0,5 h | — | — |
| Revisão e pós-teste | 0,5 h | — | — |
| Orientação e exame final | 1 h | — | — |
| **Total** | **24 h** | | |

Soma verificada por teste automático (`src/lib/__tests__/plano-transformacao-digital.test.ts`):
1320 minutos de módulos + 120 minutos de avaliação e orientação = 1440 minutos = 24 horas.
O módulo transversal e o exame final são contados **uma única vez**.

### Distribuição por lição

| Módulo | Lição | Minutos | Teoria | Prática |
| --- | --- | --- | --- | --- |
| M1 | O que é a transformação digital | 90 | 50 | 40 |
| M1 | Transformação digital no sector público | 90 | 50 | 40 |
| M1 | Valor público, impactos sociais, éticos e ambientais | 90 | 40 | 50 |
| M1 | Diagnóstico da maturidade digital | 90 | 40 | 50 |
| M2 | Conhecer as pessoas que usam o serviço | 105 | 45 | 60 |
| M2 | Mapear a jornada de um serviço público | 105 | 45 | 60 |
| M2 | Simplificar processos antes de digitalizar | 105 | 45 | 60 |
| M2 | Dados, segurança e privacidade no atendimento | 105 | 45 | 60 |
| M3 | Estratégia, prioridades e planeamento | 105 | 35 | 70 |
| M3 | Organizar equipas, competências e responsabilidades | 105 | 35 | 70 |
| M3 | Gerir a mudança e a adopção de comportamentos | 105 | 25 | 80 |
| M3 | Medir resultados, sustentar e melhorar continuamente | 105 | 25 | 80 |

Três títulos de lição foram alargados para cobrir explicitamente tópicos da
secção 6.1 que não tinham lugar próprio (impactos éticos, jurídicos e
ambientais; segurança e privacidade; estratégia e planeamento). **Os
identificadores das lições foram preservados**, pelo que nenhum progresso de
formando se perdeu.

## 3. Cobertura do âmbito mínimo da secção 6.1

| Tópico da secção 6.1 | Onde é tratado |
| --- | --- |
| Conceitos e impactos institucionais | M1L1, M1L2, M3L3 |
| Estratégia, planeamento, implementação e gestão | M1L4, M3L1, M3L2 |
| Modelos de serviço digitais e inovação | M1L2, M2L2, M2L3 |
| Políticas públicas e competências digitais | M1L2, M2L1, M3L1, M3L2 |
| Impactos sociais, económicos, éticos e jurídicos | M1L3, M2L4 |
| Impactos ambientais e sustentabilidade | M1L3, M3L4 |
| IA, Big Data, IoT, Blockchain e Cloud | M1L1, M2L4 |
| Segurança e privacidade | M2L4 |
| Casos práticos | M1L4, M2L2, M3L4 |
| Eficiência dos serviços e mudança de comportamentos | M2L1, M2L3, M3L3, M3L4 |

A cobertura é verificada por teste automático.

## 4. Avaliação

| Instrumento | Questões | Estado | Certifica? |
| --- | --- | --- | --- |
| Pré-teste e pós-teste | 10 | rascunho (inactivo) | não |
| Banco do exame final | 60 | rascunho (inactivo) | sim, depois de validado |
| Exame final gerado | 20 por tentativa | — | sim |

60 é exactamente o triplo das 20 questões do exame, conforme a secção 10.
Enquanto as questões estiverem inactivas, o início do exame permanece
bloqueado e nenhum certificado oficial é emitido.

Os gabaritos vivem apenas na base de dados e nos ficheiros de semente em
`scripts/conteudo/`, fora de `src/`. Não entram no pacote do navegador e não
são enviados ao formando antes da submissão.

## 5. Limitações declaradas

- Todo o conteúdo está marcado «Proposta pedagógica — por validar pela
  Ologa/ATDI». Estar disponível na plataforma não significa estar aprovado.
- Todos os casos são **fictícios** e assinalados como tal. Não há estatísticas
  nem casos reais de sucesso.
- Formatos assegurados: texto, leitura fácil, voz do navegador, alto contraste
  e navegação por teclado. **Não** há vídeo, legendagem nem Língua de Sinais
  Moçambicana produzidos — não devem ser apresentados como disponíveis.
- Revisão de acessibilidade pela REMOTELINE: **proposta, não realizada**.
- Não é feita qualquer alegação de certificação legal de conformidade.
- As matérias jurídicas referidas no conteúdo apresentam princípios e boas
  práticas; não constituem parecer jurídico.
