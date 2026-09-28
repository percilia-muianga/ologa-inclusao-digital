# Matriz do banco de avaliação — Tecnologias Digitais do Governo

Documento interno. Sem enunciados, alternativas nem gabaritos. Estado:
**rascunho privado, não importado, não activado.** Ficheiros:
`scripts/conteudo/tecnologias-governo-questoes*.ts` (fora de `src/` e `public/`).

## Dimensão e fonte da regra

- 80 questões de exame final (72 do módulo 161 «Tecnologias Digitais para o
  Serviço Público», 8 do transversal 200) + 10 de diagnóstico/pós-teste, separadas.
- Regra do triplo: secção 10 do TdR, tal como registada em `docs/matriz-tdr.md`
  (texto original completo indisponível).
- Prova de 20 itens em 60 min: **proposta**, só em simulação. Sem configuração
  de exame e sem quotas em `src/lib/quotas-exame.ts`.

## Marginais — prova proposta e oferta

| Estrato | Prova | Mínimo 3× | Banco |
|---|---|---|---|
| Módulo 161 | 18 | 54 | 72 |
| Transversal 200 | 2 | 6 | 8 |
| Escolha múltipla | 8 | 24 | 32 |
| Verdadeiro/falso | 4 | 12 | 16 |
| Associação | 4 | 12 | 16 |
| Cenário | 4 | 12 | 16 |
| Fácil | 8 | 24 | 32 |
| Média | 8 | 24 | 32 |
| Difícil | 4 | 12 | 16 |

Os marginais cumprem o triplo. **Não** significa que cada combinação
(intersecção) tenha o triplo: ver abaixo.

## Intersecção tipo × dificuldade (exame final)

| | Fácil | Média | Difícil |
|---|---|---|---|
| Escolha múltipla | 17 | 10 | 5 |
| Verdadeiro/falso | 6 | 8 | 2 |
| Associação | 6 | 10 | 0 |
| Cenário | 3 | 4 | 9 |

A prova não fixa quotas por intersecção; o motor real equilibra as margens.
Associação não tem itens difíceis e os difíceis concentram-se em cenários —
limite registado, não corrigido por mudança de rótulo.

## Cobertura por lição e por tópico dos TdR

| Lição | Itens | EM | VF | Assoc. | Cen. | F | M | D |
|---|---|---|---|---|---|---|---|---|
| L1 Portal do Governo e Portal do Cidadão | 14 | 6 | 3 | 3 | 2 | 6 | 5 | 3 |
| L2 Correio: uso e gestão de contas | 15 | 6 | 3 | 3 | 3 | 6 | 6 | 3 |
| L3 Gestão documental e assinatura digital | 15 | 6 | 3 | 3 | 3 | 6 | 6 | 3 |
| L4 Nuvem e Plataforma do Funcionário | 14 | 5 | 3 | 3 | 3 | 5 | 6 | 3 |
| L5 Interoperabilidade e integração | 14 | 5 | 2 | 2 | 5 | 5 | 5 | 4 |
| Transversal L1–L6 (Lei n.º 10/2024, arts. 16, 17, 20, 24, 30, 31) | 8 | 4 | 2 | 2 | 0 | 4 | 4 | 0 |

| Tópico (TdR 6.6) | Itens |
|---|---|
| Portal do Governo | 5 |
| Portal do Cidadão | 9 |
| Uso do CorreioGov | 8 |
| Gestão de contas do CorreioGov | 7 |
| Sistema de Gestão Documental | 8 |
| Sistema de Assinatura Digital | 7 |
| Uso da CloudGov | 9 |
| Plataforma do Funcionário e Agente do Estado | 5 |
| Sistemas de Interoperabilidade (inclui integração) | 14 |

Todos os 15 objectivos das lições têm pelo menos um item (verificado em teste).
Diagnóstico: 2 itens por lição; 6 escolha múltipla, 4 V/F; 5 fáceis, 5 médias.

## Critério de dificuldade

Fácil: recordar/reconhecer, um passo. Média: aplicar a um caso dado, uma
decisão. Difícil: várias condições em simultâneo, alternativas plausíveis ou
separar o que a fonte confirma do que não confirma. Não calibrado com respostas.

## Salvaguardas de conteúdo

- Nada sobre ecrãs, passos, capacidades, cópias ou prazos do CorreioGov,
  CloudGov, Portal do Cidadão, Sistema de Assinatura Digital ou Plataforma do
  Funcionário além do que as lições dizem; as questões avaliam condutas.
- Nenhuma explicação atribui efeitos jurídicos a um tipo de assinatura; remete-se
  para a legislação aplicável e o jurista, como na lição.
- Propostas INTIC (2026) tratadas sempre como não sendo lei.
- Cada item tem fonte igual a uma das fontes citadas na lição correspondente.

## Simulação (modo de ensaio, em memória)

200 provas com o motor real de sorteio: todas viáveis, 20 itens distintos,
distribuição exacta 18/2, 8/4/4/4, 8/8/4; sem diagnóstico; as 80 questões saem
pelo menos uma vez; >190 provas diferentes. O motor não tem quota por lição:
**12 das 200 provas deixam uma das 5 lições de fora**. Acrescentar essa quota
seria alteração ao motor, fora deste trabalho.

## Pendentes

Validação pedagógica Ologa/ATDI; confirmação por quem gere os sistemas de que
nenhuma formulação contraria o funcionamento real; calibração das dificuldades;
decisão sobre quotas de produção para este curso.
