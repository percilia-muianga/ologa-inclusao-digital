# Plano de entrega, suporte e transferência da plataforma

Estado: parte técnica preparada (2026-09-30). As decisões institucionais estão
marcadas **[ACORDO]** e não bloqueiam o desenvolvimento.

## 0. Base nos Termos de Referência
O TdR anexado (`TDRs_Concurso_78.pdf`) **não tem secção 17**: termina na
secção 15 (Código de Conduta). As obrigações de entrega, suporte e
transferência estão em:
- **3.7** — plataforma disponível depois da consultoria; ATDI, IP proprietária;
  entrega do código-fonte; disponibilidade 24h/7 (99,5% mensal); segurança e
  protecção de dados.
- **9.1** — titularidade e cedência sem custos; perfil administrativo da ATDI
  desde o início; manutenção correctiva e suporte técnico durante pelo menos
  12 meses após o termo; cópias de segurança regulares e controlo de acessos;
  SLA 99,5% com plano de contingência; FAQ e suporte técnico/pedagógico.
- **11** — entregável 3 «Plataforma implementada e aceite» (3.º mês);
  relatório final consolidado (12.º mês).
- Grelha de avaliação — «Estratégia de sustentabilidade, transferência de
  conhecimento e cedência da plataforma».

## 1. O que é entregue (inventário técnico)
| Componente | Onde está | Estado |
|---|---|---|
| Código-fonte completo | Repositório GitHub `percilia-muianga/ologa-inclusao-digital` (sincronizado automaticamente) | Existe |
| Estrutura da base (tabelas, regras de acesso, funções, auditoria) | `drizzle/migrations/` (35 ficheiros, aplicados por ordem) | Existe |
| Conteúdos dos seis cursos e bancos de questões | Base de dados; pacotes-fonte em `scripts/conteudo/` | Existe (bancos em rascunho/inactivos) |
| Materiais multimédia das lições | Armazenamento privado `materiais-licoes` | Estrutura pronta; sem materiais reais |
| Ensaios automáticos | `src/lib/__tests__/`, `scripts/teste-*` (bases efémeras) | Existe |
| Documentação técnica | `AGENTS.md`, `docs/`, `roadmap.md` | Existe; manual de operação abaixo |

## 2. Procedimento de transferência (técnico)
1. **Congelar versão**: marcar no GitHub a versão entregue (etiqueta com data)
   e anexar o resultado dos ensaios automáticos dessa versão.
2. **Transferir o repositório** para a organização indicada pela ATDI, ou dar
   à ATDI acesso de proprietária. **[ACORDO: conta/organização de destino]**
3. **Exportar os dados**: exportação completa da base (Cloud → Advanced
   settings → Export data) e cópia do armazenamento de materiais; registar
   contagens por tabela antes e depois, e conferir.
4. **Reconstruir no destino** (se a ATDI alojar noutro local): aplicar as
   migrações por ordem numa base vazia, importar os dados, repor ficheiros,
   configurar as variáveis de ligação e correr os ensaios de regras de acesso
   (`scripts/teste-rls`, `teste-seguranca`, `teste-materiais`, `teste-ajuda`).
   **[ACORDO: onde fica alojada a plataforma após o contrato]**
5. **Contas**: atribuir papéis `admin_atdi`/`auditor_atdi` às pessoas indicadas
   pela ATDI (existem na plataforma); retirar acessos da equipa da consultora
   no fim do período de suporte; trocar a palavra-passe da conta administrativa
   actual antes de dados reais. **[ACORDO: lista nominal de contas ATDI]**
6. **Auto de entrega**: lista de verificação assinada com os pontos 1–5.

## 3. Suporte e manutenção (mínimo 12 meses após o termo)
- **Canal na plataforma**: «Ajuda e suporte» — pedidos por categoria (acesso,
  conteúdos, acessibilidade, problema técnico, outro), estados aberto / em
  tratamento / resolvido, resposta visível ao requerente, tudo auditado.
- **FAQ**: 19 perguntas em rascunho preparadas a partir do funcionamento real;
  publicação no Painel → FAQ e suporte após revisão.
- **Manutenção correctiva**: correcção de erros no repositório, com ensaio
  automático antes de publicar e registo no histórico do GitHub.
- **Classificação técnica proposta** (sem prazos): crítico = plataforma
  indisponível ou dados expostos; alto = função essencial bloqueada (exame,
  presenças, certificado); normal = restante.
- **[ACORDO]** prazos de resposta e resolução por nível; contactos e horário
  do suporte; canal fora da plataforma para quando esta estiver indisponível;
  quem aprova publicações durante o período de suporte.

## 4. Disponibilidade (99,5% mensal) e contingência
- 99,5% mensal corresponde a um máximo de cerca de 3 h 39 min de
  indisponibilidade num mês de 30 dias.
- **Por implementar (técnico)**: verificação periódica automática da
  disponibilidade com registo mensal para o relatório de M&A.
- Contingência: página de estado/aviso; retoma a partir da última cópia de
  segurança; registo de incidentes no relatório mensal (TdR 11).
- **[ACORDO]** forma de medir e reportar a disponibilidade; janelas de
  manutenção programada.

## 5. Cópias de segurança e protecção de dados
- Controlo de acessos por regras na base (ensaiadas em bases efémeras) e
  registo de auditoria imutável das alterações.
- **Por verificar**: frequência e retenção das cópias automáticas do Lovable
  Cloud; não foram confirmadas nesta etapa.
- Procedimento técnico: exportação mensal adicional, guardada fora da
  plataforma, com ensaio trimestral de reposição numa base isolada.
- **[ACORDO]** onde guardar as exportações e quem pode aceder.
- Pendente conhecido: pré-visualização e site publicado partilham a mesma
  base; decidir o isolamento da produção antes da primeira instituição real.

## 6. Transferência de conhecimento
- Manual de operação (a produzir a partir deste plano): gerir utilizadores e
  papéis, turmas e sessões, presenças, conteúdos e materiais, bancos e
  configuração de exames, FAQ e pedidos, relatórios e exportações.
- Sessões práticas com a equipa técnica da ATDI sobre: publicação, migrações,
  ensaios automáticos, exportação/reposição. **[ACORDO: datas e participantes]**

## 7. Decisões que exigem acordo institucional (resumo)
1. Organização/conta de destino do repositório.
2. Alojamento após o contrato.
3. Lista nominal de contas ATDI e respectivos papéis.
4. Prazos, contactos e horário do suporte; canal alternativo.
5. Medição/relato da disponibilidade e janelas de manutenção.
6. Local e acesso às cópias de segurança.
7. Datas das sessões de transferência de conhecimento.
