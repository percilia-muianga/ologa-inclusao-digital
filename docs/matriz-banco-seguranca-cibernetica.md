# Matriz do banco de avaliação — Segurança Cibernética Avançada

Documento interno. Sem enunciados, alternativas nem gabaritos. Estado: **rascunho
privado, não importado, não activado.** O banco vive em
`scripts/conteudo/seguranca-cibernetica-questoes*.ts`, fora de `src/` e `public/`.

## Dimensão e fonte da regra

- 80 questões de exame final + 10 de diagnóstico/pós-teste, separadas (mesmo
  formato do banco de IA).
- Regra do triplo: secção 10 do Termo de Referência, tal como registada na
  matriz interna (`docs/matriz-tdr.md`). O texto original completo do TdR não
  está disponível; não foi confirmado na fonte.
- Prova de 20 itens em 60 minutos: **proposta pedagógica**, usada só em
  simulação. Não existe configuração de exame para este curso e nada foi
  acrescentado às quotas de produção (`src/lib/quotas-exame.ts`).

## Prova proposta e oferta por estrato

| Estrato | Prova | Mínimo 3× | Banco |
|---|---|---|---|
| Módulo 141 (M1) | 6 | 18 | 24 |
| Módulo 142 (M2) | 6 | 18 | 25 |
| Módulo 143 (M3) | 6 | 18 | 23 |
| Transversal 200 | 2 | 6 | 8 |
| Escolha múltipla | 8 | 24 | 32 |
| Verdadeiro/falso | 4 | 12 | 16 |
| Associação | 4 | 12 | 16 |
| Cenário | 4 | 12 | 16 |
| Fácil | 8 | 24 | 32 |
| Média | 8 | 24 | 32 |
| Difícil | 4 | 12 | 16 |

## Cobertura por lição

| Lição | Título | Itens | EM | VF | Assoc. | Cen. | F | M | D |
|---|---|---|---|---|---|---|---|---|---|
| M1 L1 | Fundamentos avançados, activos críticos e risco cibernético | 5 | 2 | 1 | 1 | 1 | 2 | 1 | 2 |
| M1 L2 | Gestão de vulnerabilidades e teste de intrusão autorizado | 5 | 2 | 1 | 1 | 1 | 2 | 3 | 0 |
| M1 L3 | Endurecimento de sistemas operativos e segurança de redes | 5 | 2 | 1 | 1 | 1 | 2 | 3 | 0 |
| M1 L4 | Gestão de identidades e acessos e criptografia aplicada | 5 | 2 | 1 | 1 | 1 | 2 | 1 | 2 |
| M1 L5 | Segurança da computação em nuvem e responsabilidade partilhada | 4 | 2 | 1 | 0 | 1 | 2 | 1 | 1 |
| M2 L1 | Segurança de aplicações e testes segundo o guia OWASP | 5 | 2 | 1 | 1 | 1 | 2 | 3 | 0 |
| M2 L2 | DevSecOps: segurança no ciclo de desenvolvimento | 5 | 2 | 1 | 1 | 1 | 2 | 1 | 2 |
| M2 L3 | Monitorização, registos e SIEM | 5 | 2 | 1 | 1 | 1 | 2 | 3 | 0 |
| M2 L4 | Malware, ameaças avançadas e forense básica | 5 | 2 | 1 | 1 | 1 | 2 | 2 | 1 |
| M2 L5 | Resposta a incidentes | 5 | 2 | 1 | 1 | 1 | 2 | 1 | 2 |
| M3 L1 | Plano de resposta e cadeia de custódia | 5 | 2 | 1 | 1 | 1 | 2 | 2 | 1 |
| M3 L2 | Comunicação inclusiva e acessível | 5 | 2 | 1 | 1 | 1 | 2 | 2 | 1 |
| M3 L3 | Continuidade, cópias e restauro verificado | 5 | 2 | 1 | 1 | 1 | 2 | 1 | 2 |
| M3 L4 | Laboratório integrado | 3 | 0 | 0 | 1 | 2 | 0 | 2 | 1 |
| M3 L5 | Normas, políticas e melhoria contínua | 5 | 2 | 1 | 1 | 1 | 2 | 2 | 1 |
| Transversal L1–L6 | Lei n.º 10/2024, arts. 16, 17, 20, 24, 30, 31 | 8 | 4 | 2 | 2 | 0 | 4 | 4 | 0 |

Diagnóstico (10, instrumento `pre_pos_teste`): M1 L1, L3, L4, L5; M2 L1, L3,
L4, L5; M3 L3, L5 — 6 escolha múltipla, 4 V/F; 5 fáceis, 5 médias.

## Cruzamento tipo × dificuldade (exame final)

| | Fácil | Média | Difícil |
|---|---|---|---|
| Escolha múltipla | 17 | 11 | 4 |
| Verdadeiro/falso | 15 | 1 | 0 |
| Associação | 0 | 12 | 4 |
| Cenário | 0 | 8 | 8 |

## Limites conhecidos (por validar)

- Verdadeiro/falso é quase só fácil; cenários não têm itens fáceis; o
  transversal não tem difíceis nem cenários (como no banco de IA).
- As dificuldades são julgamento da equipa, não calibradas com respostas reais.
- Sobreposição semântica verificada por medida de palavras comuns (limiar 0,5)
  e por leitura; não substitui revisão por especialistas.
- Validação pedagógica Ologa/ATDI pendente; nenhum item está aprovado.
