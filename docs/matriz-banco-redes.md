# Matriz do banco privado — Redes Avançadas e Segurança Cibernética

Estado: **rascunho, não importado**. As 90 linhas estão planeadas com `activa=false` e `estado_revisao='rascunho'`. Nenhuma foi escrita na base de dados. A validação pedagógica pela Ologa/ATDI está pendente.

Ficheiros privados (fora de `src/` e `public/`): `scripts/conteudo/redes-questoes*.ts`. Teste: `src/lib/__tests__/banco-redes.test.ts`.

## Dimensão
- 80 questões finais: 72 técnicas (6 por módulo × 12, as 60 lições com pelo menos 1 questão) e 8 do transversal (artigos 16, 17, 20, 24, 30 e 31 da Lei n.º 10/2024; lições 1–6).
- 10 questões de diagnóstico/pós-teste (`RED-DIAG-01..10`), fora do sorteio.
- IDs estáveis: `RED-Mxx-Ly-nn`, `RED-TR-Ly-nn`, `RED-DIAG-nn`.

## Marginais (80 finais)
| Tipo | n | | Dificuldade | n |
|---|---|---|---|---|
| Escolha múltipla | 32 | | Fácil | 32 |
| V/F | 16 | | Média | 32 |
| Associação | 16 | | Difícil | 16 |
| Cenário | 16 | | | |

Distribuição de tipos por módulo: M1–M4 3 EM/1 VF/1 AS/1 CEN; M5–M6 2/2/1/1; M7–M8 2/1/2/1; M9–M12 2/1/1/2. Transversal: 4 EM/2 VF/2 AS, 4 fáceis e 4 médias. Não tem difíceis: os itens são de aplicação directa dos artigos.

Critério de dificuldade: fácil = recordar, um passo; média = aplicar uma regra ou cálculo; difícil = ler várias evidências, combinar regras ou excluir hipóteses plausíveis. Os rótulos não foram alterados para passar no sorteio.

## Intersecção tipo × dificuldade (valores reais)
| | Fácil | Média | Difícil |
|---|---|---|---|
| Escolha múltipla | 7 | 22 | 3 |
| V/F | 12 | 4 | 0 |
| Associação | 13 | 3 | 0 |
| Cenário | 0 | 3 | 13 |

Limites: as difíceis concentram-se nos cenários (13 de 16). Não há V/F nem associações difíceis e não há cenários fáceis. Cada margem tem pelo menos o triplo da quota da prova proposta. As intersecções não têm todas o triplo.

## Resultados R01–R18
Os 18 resultados têm cobertura nas finais. Cada questão técnica indica um subconjunto dos resultados da sua lição (`plano-redes.ts`), e o objectivo associado é copiado da lição. R18 tem uma única questão (M01-L1-01, explicação dada como formador). É cobertura fraca e a avaliação principal de R18 fica na actividade integrada do M12. O transversal não está mapeado a R01–R18 (`r: []`).

## Prova proposta (só ensaio; não configura exame real)
20 itens, 60 min: 18 técnicos + 2 transversais. Tipos 8/4/4/4; dificuldades 8/8/4.
Módulos com 2 itens: M1, M3, M11 (administração central: endereçamento, encaminhamento, gestão) e M7, M8, M12 (defesa, resposta, auditoria). Módulos com 1 item: M2, M4, M5, M6, M9, M10. Esta relevância é uma proposta por validar. Cada módulo tem 6 questões, pelo menos o triplo da quota.

## Simulação (motor real `sortearExame`, sem alterações)
- Filtro de produção (activa + em_uso): 0 elegíveis, porque o plano está inactivo.
- Ensaio em memória, com cópia marcada activa, sementes 1–200: **188 provas viáveis**. Todas têm 20 IDs únicos, quotas exactas por módulo, tipo e dificuldade, nenhum diagnóstico, e as 80 questões aparecem pelo menos uma vez.
- **12 sementes falharam de forma fechada** (`LIMITE_DE_TRABALHO`). Causa provável: quotas simultâneas em 13 módulos, somadas ao acoplamento difícil↔cenário. Não se alterou o motor nem se reclassificaram rótulos. Solução possível, por decidir: rever o conteúdo de alguns itens (por exemplo, cenários genuinamente médios e escolhas múltiplas genuinamente difíceis) ou aceitar uma nova tentativa com outra semente.

## Revisões feitas
- Duplicados exactos e quase-duplicados (Jaccard ≥ 0,5): nenhum dentro do banco, nem face aos bancos TDG, SC, IA, Nuvem e TD.
- Formativas (120): nenhum item com Jaccard ≥ 0,4. O M03-L1-01 foi reescrito por proximidade.
- Posições das respostas: equilibradas, cada posição com menos de 30%. A resposta certa é a mais longa em menos de 35% dos casos. A razão de comprimentos entre alternativas é ≥ 0,45. V/F: 7 verdadeiras e 9 falsas.
- Contas verificadas no teste: /26, OSPF, rádios, disponibilidade 99,5%, matriz de risco, malha, G.711, fila htb, utilização SNMP, histerese e indicador 60%.
- M12: a falta de evidência dá «não verificado (evidência insuficiente)». «Não aplicável» só se usa fora do âmbito, com justificação.
- Endereços só privados ou de documentação.

## Pendente
Validação pedagógica pela Ologa/ATDI; decisão sobre as 12 sementes inviáveis; importação (não autorizada).
