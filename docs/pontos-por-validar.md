# Pontos por validar — registo interno de gestão do projecto

Documento **interno**. Não é conteúdo da plataforma e não é visível para
formandos nem para o público. A plataforma apresenta a configuração actual de
cada curso; as pendências, decisões e divergências documentais ficam aqui.

Última actualização: 22 de Setembro de 2026.

Regra editorial em vigor, por orientação da gestora do projecto: a experiência
pública (catálogo, ficha de curso, lições e guiões) apresenta a configuração
actual, com design profissional, sem rótulos de rascunho, sem avisos de
«proposta por validar» repetidos e sem contagens de conteúdo em falta em
destaque. O que está por escrever aparece de forma discreta, como **em
preparação**, e nunca com ligação para conteúdo inexistente. Nada é
apresentado como aprovado ou certificado conforme; apenas como configuração
actual.

---

## PV-01 — Carga horária de Introdução à Inteligência Artificial

**Divergência real nos documentos do Concurso 78A/MDAP/MCTD/QCBS/25:**

| Onde | O que diz |
| --- | --- |
| Secção 6.2, p. 13 | duração **máxima de 16 horas**, incluindo a componente prática |
| Secção 14, p. 29 (tabela) | **20 horas**, regime presencial |
| Secção 13.1, p. 27 | remete a tabela de cargas horárias para as **propostas dos concorrentes** |

- **Decisão operacional:** o curso é configurado e apresentado com **20 horas**.
- **Quem decidiu:** gestora do projecto (Ologa).
- **Estado:** pendente de confirmação pela ATDI.
- **Isto não é aprovação da ATDI.** Não se declara, em nenhum documento, que a
  carga horária está aprovada, fixada pelos Termos de Referência ou certificada
  conforme.
- **Onde vive a decisão no código:** `DIVERGENCIA_CARGA_INTERNA` em
  `src/lib/plano-inteligencia-artificial.ts`. Não é gravada na base de dados
  (`cursos.carga_horaria_nota` fica nula para este curso) nem exibida ao
  formando.

### Plano alternativo de 16 horas — interno, NÃO activo

`PLANO_ALTERNATIVO_16H` em `src/lib/plano-inteligencia-artificial.ts`:
6 h módulo 1 + 6 h módulo 2 + 2 h transversal + 2 h avaliação = 16 h.
Cada lição passa de 120 para 90 minutos, encurtando a actividade; a partilha
reduz-se a duas apresentações e as restantes entregas passam a escrito. Nenhum
objectivo de aprendizagem é retirado. Nada do que for encurtado pode ser
descrito como simulação prática executada. Só entra em vigor se a ATDI
confirmar as 16 horas.

### Se a decisão mudar

Alterar `CARGA_HORARIA_PROVISORIA_HORAS`, os tempos do plano e o valor de
`cursos.carga_horaria` do curso, e voltar a correr
`scripts/seed-inteligencia-artificial.ts`. Os identificadores de curso, módulos
e lições mantêm-se.

---

## PV-02 — Estado editorial de Introdução à Inteligência Artificial

Registado em `ESTADO_EDITORIAL_INTERNO`
(`src/lib/plano-inteligencia-artificial.ts`).

| Item | Estado real | O que a plataforma mostra |
| --- | --- | --- |
| Módulo 1, 4 lições | escritas pela equipa, **não validadas** pela Ologa/ATDI | conteúdo disponível, sem rótulo editorial |
| Módulo 2, 4 lições | escritas pela equipa em 22/09/2026, **não validadas** pela Ologa/ATDI; gravadas na base em 22/09/2026 por integração editorial restrita às 4 lições (`scripts/integrar-m2-inteligencia-artificial.ts`), autorizada pela gestora | conteúdo disponível, sem rótulo editorial |
| Módulo transversal, 6 lições | já existia | conteúdo disponível |
| Banco de questões do curso | por preparar; nenhuma questão criada | nada anunciado; a ficha diz que a avaliação final é disponibilizada em fase posterior |
| Exame final | não activo, não emite certificados | nada anunciado |
| Prática assistida da lição 4 do módulo 1 e da lição 1 do módulo 2 | guião escrito, **nunca executado** | apresentada como actividade a realizar em sessão, com condições e caminho alternativo; se a ferramenta faltar regista-se «PENDENTE — a reagendar» e nunca se declara realizada |
| Saída do anexo B da lição 4 | escrita pela equipa | mantém-se etiquetada como **saída simulada** (facto, não estado editorial) |
| Língua de Sinais de Moçambique | inexistente | não mencionada, não anunciada como disponível |
| Vídeo e legendagem | inexistentes | não mencionados |
| Revisão de acessibilidade por terceiros (REMOTELINE) | não realizada | não mencionada |

Nada disto é apresentado como feito. O critério é: **não anunciar o que não
existe, e não encher a plataforma de avisos sobre o processo interno.**

---

## PV-03 — Outras pendências já registadas noutro sítio

- Divergência de horas do curso de Redes (120/80 h): ver `docs/matriz-tdr.md`.
- Bancos de questões de Transformação Digital e Computação em Nuvem: versão 2
  em rascunho, inactiva; versão 1 retirada. Ver `docs/matriz-tdr.md`, secções
  A18 a A20. **Não tocado nesta etapa.**
- Validação pedagógica pela Ologa/ATDI dos conteúdos de Transformação Digital e
  Computação em Nuvem: pendente. Esses cursos mantêm o aviso visível de
  proposta por validar, sem alteração nesta etapa.

---

## PV-04 — Pendências de acesso e de correio electrónico

Registadas aqui a pedido da gestora. **Não investigadas nesta etapa.**

- Perfil de Administrador Geral Ologa para as duas contas da gestora
  (`percilia@ologa.com` e `perciliamuianga@gmail.com`): o mecanismo revisável
  existe em `src/lib/perfis-admin.functions.ts` e na área de utilizadores do
  painel, mas **não foi executado**. A atribuição depende de confirmação
  expressa da gestora, autenticada na conta Ologa.
- Recuperação de palavra-passe: as páginas `/recuperar-palavra-passe` e
  `/nova-palavra-passe` estão feitas e testadas de forma isolada, mas a
  **entrega real de correio electrónico nunca foi testada** e não há domínio de
  correio próprio configurado. Fica pendente.
