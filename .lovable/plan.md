# Curso de Redes — 60 lições completas, 80 h, pacote para importar

## Estrutura confirmada na base (só leitura)
- Curso `redes-avancadas-seguranca-cibernetica` — título na plataforma «Redes Avançadas e Introdução à Segurança Cibernética» (o pedido chama-lhe «Administração de Redes»; o título não será alterado).
- 12 módulos temáticos × 5 lições = 60 lições, todas sem conteúdo; cada módulo com 590 min.
- Módulo transversal (6 lições, com conteúdo, 120 min) — não será tocado.
- Soma actual: 12×590 + 120 = 7200 min (120 h), avaliação 0, ficha vazia. Carga declarada: 80 h.
- Preservados: Governo Digital (5 lições, 10 h), Segurança Cibernética (15, 30 h), banco IA (90 inactivas).

## Plano de horas (proposta pedagógica interna)
```text
4800 min = 80 h
  120 transversal (uma vez)
  120 avaliação (diagnóstico 20 + revisão 40 + exame 60)
 4560 conteúdos = 12 módulos × 380 min
      cada módulo: 5 lições 70/75/75/80/80
```
Documentos internos registam a contradição TdR (sec. 6.5 p.16 = 120 h; tabela sec. 14 p.29 = 80 h) e a clarificação ATDI pendente. Nada público diz que 80 h é consensual.

## Conteúdo (um ficheiro por módulo, fora do navegador)
Cada lição: objectivos, explicação substantiva, caso fictício identificado, prática guiada em rede isolada fictícia (topologia textual acessível, endereçamento coerente por módulo, comandos completos, saídas-exemplo didácticas — não resultados executados —, critérios de sucesso e reversão), alternativa em papel com respostas esperadas, 2 perguntas formativas comentadas, leitura fácil, guião do formador com tempos que somam a duração, fontes (IETF RFC, ISC Kea/BIND, FRRouting, Linux iproute2/nftables, Wireshark, NIST).
Stack de prática: Linux + FRRouting + nftables + Kea/BIND + Wireshark, em máquinas virtuais ou namespaces — gratuito, sem licenças; diferenças face a equipamentos de fabricantes explicadas sem citar certificações.
Pendências (validação ATDI, laboratórios não testados em sala, vídeo LSM/áudio) só em documentos internos.

## Matriz TdR
Todos os resultados da sec. 6.5 → lição(ões) → evidência de aprendizagem, em `docs/matriz-tdr.md`.

## Pacote e importador (igual ao de Governo Digital)
- Pacote server-only: ficha, 12 módulos, 60 lições, horas.
- Nova migração com funções SECURITY INVOKER de estado/importação: admin_ologa + auth.uid(), hash de identidades e campos, bloqueios, conflitos, verificação final por registo, sem escritas inúteis, transversal intocado, auditoria existente.
- Cartão no painel «Conteúdos preparados»; a importação falha fechada até haver regras de escrita.
- SQL das 2 regras UPDATE (cursos e curso_modulos, só este curso e só admin_ologa) em `docs/migracoes-por-autorizar/` — NÃO aplicado.

## Verificações
Testes: 60 lições, somas por módulo e total 4800, campos preenchidos, endereçamento/comandos coerentes, conteúdo fora do bundle público; tipos e build.

## Não será feito
Importar, publicar, activar questões/exames, preparar exame final, alterar outros cursos ou o transversal, aplicar permissões novas.

## Nota de execução
São 60 lições longas: o trabalho será feito módulo a módulo em várias rondas, até concluir, com relatório das contagens em cada ronda.
