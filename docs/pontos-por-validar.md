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

---

## PV-05 — Banco de avaliação de Inteligência Artificial: integração pendente

Registado a 22 de Setembro de 2026.

- **Ficheiro privado:** escrito e verificado
  (`scripts/conteudo/inteligencia-artificial-questoes.ts`, 80 questões finais
  + 10 de diagnóstico). Vive fora de `src/` e de `public/`; os enunciados e os
  gabaritos não entram no pacote do navegador nem em qualquer página.
- **Integração na base de dados: PENDENTE.** O comando restrito existe
  (`scripts/integrar-banco-inteligencia-artificial.ts`) e só escreve na tabela
  do banco de questões, só deste curso, sempre com questões inactivas. Exige
  sessão autenticada de uma conta com perfil de administração, para que o
  autor do registo e a auditoria sejam reais. **Não foi executado:** não há
  credenciais de administração disponíveis neste ambiente. Não se usou a chave
  de serviço para contornar essa exigência, não se inventou autor e nenhum
  gatilho foi desactivado.
- **Activação do exame: não feita e não pedida.** Nenhuma questão fica activa,
  `exame_configuracoes` continua vazia e nenhuma prova é sorteável.
- **Validação pedagógica pela Ologa/ATDI: pendente.** Nada aqui está aprovado.

Para integrar, quando houver decisão: correr primeiro o plano
(`--plano`, que não escreve nada) e depois `--integrar` com a sessão de
administração. O comando é idempotente pela chave instrumento + enunciado.

---

## PV-06 — Segurança Cibernética Avançada: conteúdos escritos, base de dados por sincronizar

Registado a 22 de Setembro de 2026.

- **Erro corrigido no plano.** A configuração anterior somava 15 lições de 120
  minutos (30 h) **mais** 2 h do módulo transversal e 0 minutos de avaliação,
  ou seja 32 h. O plano em `src/lib/plano-seguranca-cibernetica.ts` passa a
  repartir 1800 minutos: módulo 1 com 480, módulo 2 com 600, módulo 3 com 480,
  transversal com 120 (contado uma única vez) e 120 de diagnóstico, revisão e
  exame. **A repartição interna é proposta pedagógica da equipa**; o que o
  Termo de Referência fixa é o total de 30 horas (secção 14) e o conteúdo
  programático da secção 6.4, página 15.
- **Conteúdo das 15 lições: escrito.** Ficheiros privados
  `scripts/conteudo/seguranca-cibernetica-base.ts`, `-m1.ts`, `-m2.ts`,
  `-m3.ts` e o agregador `-licoes.ts`. Vivem fora de `src/` e de `public/`.
  Títulos, ordens e identificadores das lições existentes são preservados.
- **Sincronização na base de dados: PENDENTE.** Na base, as 15 lições continuam
  com `estado_conteudo = por_fornecer`, `duracao_minutos` nula e os títulos
  antigos; a ficha do curso continua vazia. O integrador restrito existe
  (`scripts/integrar-seguranca-cibernetica.ts`): `--plano` é simulação e não
  escreve nada; `--integrar` exige sessão real de administrador
  (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) e a chave de serviço é rejeitada, para que a
  autoria e a auditoria fiquem numa pessoa real. **Não foi executado:** não há
  credenciais de administração neste ambiente. A simulação correu e montou as
  15 lições sem tocar na base.
- **Fora do âmbito do integrador, mesmo com sessão:** a ficha do curso
  (`cursos.*`), as ligações e cargas em `curso_modulos` — onde os três módulos
  ainda constam com 600 minutos cada e o módulo transversal não está ligado a
  este curso — e qualquer outro curso. Estas alterações precisam de decisão e
  autorização próprias.
- **Laboratórios: escritos, nunca executados.** Cada laboratório corre em
  máquinas virtuais numa rede isolada, com autorização escrita, verificação de
  sucesso observável e reversão. Não se descarrega nem se executa software
  malicioso real. A alternativa offline é análise documental e **não** conta
  como prática executada.
- **Nenhum dos 7 laboratórios foi executado nem testado pela equipa autora.**
  Os laboratórios são M1L3, M1L4, M2L1, M2L3, M2L4, M3L3 e M3L4. Os minutos
  previstos e os resultados descritos são estimativa, a confirmar e corrigir na
  primeira execução em sala. Cada laboratório traz agora um campo
  `dependenciasPorPreparar` com o que **não** é entregue com o curso — imagens
  de máquinas virtuais, recolector de registos, ficheiros de ensaio, fichas de
  comandos da distribuição escolhida. Enquanto a dependência faltar, o
  laboratório fica pendente e usa-se a alternativa offline.
- **Material concreto entregue em M2L1.** Esta lição entrega o código completo
  da aplicação didáctica `app_lab.py` (anexo C, contas, pedidos e rotas
  coerentes, sem dependências externas, Python 3.8 ou superior; executada pela
  equipa autora em Python 3.13, fora de sala) e os pedidos e respostas
  completos dos dois testes (anexo D). A aplicação é deliberadamente vulnerável
  e corre **apenas** em máquina local isolada: nunca é alojada nem servida a
  partir da plataforma.
- **Tempos verificados sem dupla contagem.** Em cada lição com laboratório, os
  minutos do exercício em papel mais os minutos do laboratório igualam
  exactamente o tempo de actividade do plano. Há um teste automático que o
  verifica.
- **Banco de avaliação e exame: não preparados e não activos.** Nenhuma questão
  foi criada para este curso.
- **Validação pedagógica pela Ologa/ATDI: pendente.** Nenhuma norma, nenhuma
  certificação e nenhuma revisão externa são alegadas. O quadro NIST, o
  catálogo CISA e o guia OWASP são referências internacionais voluntárias: não
  são lei moçambicana e não criam prazos nem obrigações.
- **Verificação:** 14 testes em `src/lib/__tests__/seguranca-cibernetica.test.ts`
  (total de 1800 minutos, repartição por módulo, 15 lições e blocos de tempo,
  cobertura dos 16 tópicos e dos 10 resultados da secção 6.4, conteúdo
  substantivo por lição, laboratórios com reversão e alternativa offline,
  referências datadas, montagem do conteúdo e do guião, e ausência de perguntas
  ou gabaritos de exame).

## Tecnologias Digitais do Governo (TdR 6.6, p. 17; secção 14, p. 29)

- **Conteúdo escrito, não gravado.** 5 lições completas (60/75/75/75/75 min),
  ficha, descrição do módulo e guiões em `scripts/conteudo/tecnologias-governo-licoes.ts`;
  plano em `src/lib/plano-tecnologias-governo.ts`. Na plataforma, as 5 lições
  continuam «por fornecer» até a importação ser feita.
- **Horas (proposta interna, não fixada pelos TdR):** 360 lições + 120
  transversal (uma vez) + 120 avaliação (20/40/60) = 600 min. Hoje a base
  regista 600 no módulo temático + 120 transversal + 0 avaliação = 720.
- **Matriz dos 9 tópicos:** L1 Portal do Governo, Portal do Cidadão; L2 Uso e
  Gestão de contas do CorreioGov; L3 Gestão Documental, Assinatura Digital;
  L4 CloudGov, Plataforma do Funcionário e Agente do Estado; L5 Interoperabilidade.
- **Importação bloqueada — falta regra de escrita.** As funções da base
  (`rpc_estado_tecnologias_governo`, `rpc_importar_tecnologias_governo`,
  SECURITY INVOKER) existem, mas as regras de escrita em `cursos` e
  `curso_modulos` só abrangem Segurança Cibernética. Para desbloquear é
  preciso decisão expressa: política UPDATE para `e_admin_geral_ologa(auth.uid())`
  e `slug = 'tecnologias-digitais-governo'` nas duas tabelas. Sem ela a
  importação falha fechada e nada é gravado.
- **Fontes consultadas a 27/09/2026:** Portal do Governo (menu confirmado);
  Portal do Cidadão (sem texto legível — serviços não descritos); ATDI (só
  título). Propostas INTIC 2026 sobre interoperabilidade não são lei aprovada.
- **Pendentes:** prática real nos sistemas (CorreioGov, CloudGov, gestão
  documental, assinatura digital, plataforma do funcionário, interoperabilidade)
  depende de ambientes de treino da ATDI; manuais oficiais não disponíveis;
  validação pedagógica Ologa/ATDI pendente; nenhuma execução em sala; banco de
  exame não preparado; sem vídeo, legendas nem Língua de Sinais.

## Tecnologias Digitais do Governo — pendências internas (27/09/2026)
- Regras de escrita UPDATE em `cursos` e `curso_modulos` para este curso: APLICADAS em 27-09-2026 (migração 0026), após autorização expressa; só admin_ologa e só este curso. Importação real pela conta da utilizadora ainda pendente.
- Validação pedagógica Ologa/ATDI das 5 lições e da repartição 360+120+120 (proposta interna, não fixada pelos TdR).
- Portal do Cidadão sem texto legível na consulta: serviços/passos concretos não descritos.
- Sem manuais oficiais de CorreioGov, CloudGov, Sistema de Assinatura Digital e Plataforma do Funcionário: prática real depende de ambientes de treino da ATDI.
- Proposta INTIC 2026 sobre interoperabilidade não é lei aprovada.
- Vídeo com Língua de Sinais e áudio por produzir.
- Importação, sessão real, rollback e concorrência não testados com sessão real.

## Administração de Redes — execução em VM pendente (28/09/2026)
- **Nenhum laboratório dos módulos 1 a 12 (60 lições) foi executado.** As saídas nas lições são exemplos didácticos. Falta uma primeira execução completa numa VM Debian 12 descartável e isolada, com registo do que falhar e correcção das lições.
- Scripts embutidos verificados só quanto à sintaxe: Python (M11: inventario, monitor, analisar, recolher, prever; M12: indicadores) e sh (M11: exportar; M12: verificar-r1). Correram aqui com dados de teste apenas `prever.py`, `analisar.py` (M11) e `indicadores.py` (M12). Por validar na VM: regras nftables (M12 L1, L2, L5), configuração sshd de prática (M12 L1), snmpd/rsyslog (M11), tc/netem/htb (M10), nmap (M12).
- Preparação da VM: instalar `snmpd` e `openssh-server` pode activar serviços do sistema. Não presumir em que endereços escutam: verificar só com leitura (`systemctl is-active`, `ss -ulnp`/`ss -tlnp`, `nft list ruleset`) e registar na ficha da VM, com a lista de pacotes instalados. As lições não alteram esses serviços.
- M12 L1 pode criar `/run/sshd` na VM se não existir (registado em ficheiro próprio; reversão condicional descrita).
- Actividade integrada e critérios C01–C18 (um por resultado R01–R18) em `redes-m12.ts`: proposta pedagógica interna, a validar pela Ologa/ATDI.
- Divergência de horas 120/80 h: mantém-se em `docs/matriz-tdr.md`; o plano de trabalho usa 80 h.
- Pendentes: pacote server-only, importador e página; matriz TdR por lição; importação (não autorizada); publicação e exames (não autorizados).

## Administração de Redes — pacote e importador (28/09/2026)
- Pacote (60 lições, 12 módulos × 380 min, transversal 120, avaliação 120 = 4800 min) e importador prontos na área «Conteúdos preparados». **Nada importado.** A base real continua com 0/60 lições com conteúdo.
- **Aplicado em 28/09/2026 com autorização expressa da utilizadora:** migrações 0027_importacao_redes e 0028_politicas_redes, byte a byte iguais a `docs/migracoes-por-autorizar/importacao-redes.sql` e `politicas-redes.sql` (o cabeçalho «NÃO APLICADA» ficou no texto por ser cópia exacta). Verificado em leitura: 2 funções SECURITY INVOKER, search_path=public, EXECUTE só authenticated/service_role/postgres (sem PUBLIC/anon); 2 regras UPDATE TO authenticated com o slug de Redes em USING e WITH CHECK; Redes 0/60 lições com conteúdo, ficha 80 h / 0 min avaliação, módulos 7080 min + transversal 120 (estado anterior, inalterado); outros cursos e bancos inalterados (IA 90 questões).
- **Pendente:** executar a importação (acção da administradora na página «Conteúdos preparados»); verificar ali o estado do pacote com sessão real (não simulada aqui); validação pedagógica Ologa/ATDI; laboratórios em VM; exames não activados; publicação não feita.
- Simulação completa em base temporária descartável (`scripts/teste-redes/correr.sh`): 38/38.
- Dados actuais na base (antes de importar): módulos com 590 min cada e avaliação 0 — a importação corrige para 380/120.
- Mantêm-se: TdR original completo não disponível na ferramenta (R01–R18 são resumo interno); contradição 120 h (sec. 6.5) vs. 80 h (sec. 14); inclusão do transversal e da avaliação nas 80 h é proposta interna; laboratórios em VM não executados; validação pedagógica Ologa/ATDI pendente; exames não activados; nada publicado.

- Privacidade do pacote Redes: verificada apenas por análise estática dos imports (conteúdo só em *.server.ts). Não existe versão compilada local; a procura de marcadores das 60 lições nos ficheiros enviados ao navegador NÃO foi feita e fica por executar.

## PV-SC-BANCO — Banco de avaliação de Segurança Cibernética Avançada (28/09/2026)

- Escrito em ficheiros privados (`scripts/conteudo/seguranca-cibernetica-questoes*.ts`): 80 finais + 10 diagnóstico. Matriz em `docs/matriz-banco-seguranca-cibernetica.md`.
- **Não importado** (base continua com 0 questões deste curso), **não activado**, sem configuração de exame, sem quotas de produção. Nenhuma migração, permissão ou escrita na base.
- Não existe ainda integrador restrito nem função de importação para este banco; a importação exigirá decisão e autorização próprias.
- A tabela real tem `activa = true` e `estado_revisao = 'em_uso'` por omissão: qualquer importação futura tem de os fixar explicitamente como `false`/`rascunho` (o plano em memória já o faz).
- Sem quotas próprias em `quotas-exame.ts`, a produção usaria só equilíbrio de dificuldade para este curso. Acrescentar a proposta 6/6/6/2 é decisão pendente.
- Pendentes: validação pedagógica Ologa/ATDI; calibração das dificuldades (V/F quase só fácil, cenários sem fáceis); revisão por especialista.
