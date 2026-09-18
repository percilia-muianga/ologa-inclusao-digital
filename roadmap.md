# Roteiro — autenticação, perfis e auditoria

## Correcções obrigatórias (aplicam-se a todas as fases)
- Certificado é INDIVIDUAL: formando + curso, código único; turma apenas como referência (fase 3)
- Turma tem província e distrito próprios, obrigatórios; relatório nacional por LOCAL DE FORMAÇÃO (fase 2)
- Tipo de deficiência: reversível pelo próprio; auditoria regista só que houve alteração, nunca o valor
- Consulta a campos sensíveis por administrador ou auditor fica registada (quem, de quem, o quê, quando)

## Fase 1 + Fase 0 (em curso)
- [ ] Extensão do perfil (telefone, entidade, província, distrito, cargo, género, tipo de deficiência, conta_de_teste)
- [ ] Tabela de papéis + função de verificação de papel
- [ ] Registo de auditoria imutável, com excepção do tipo de deficiência
- [ ] Registo de acessos a campos sensíveis
- [ ] Entrada e criação de conta, encaminhamento por papel
- [ ] Área do auditor (leitura total, activa desde o primeiro dia)
- [ ] Conta de demonstração com os seis papéis + selector de papel activo
- [ ] Seis contas de teste marcadas "TESTE", excluídas de indicadores, removíveis num comando
- [ ] Ecrã de verificação de permissões lido das regras da base de dados, exportável

## Fase 2 — Formação
- [ ] Cursos, turmas (com província e distrito próprios), sessões, inscrição por código, presenças
- [ ] Áreas do formando e do formador

## Fase 3 — Gestão
- [ ] Supervisor provincial
- [ ] Coordenador nacional (cronogramas, banco de questões, exames)
- [ ] Certificado individual (formando + curso, código único)
- [ ] Área do administrador

## Bloqueios
- Falta o email real da conta de demonstração e o domínio real das contas de teste (vieram como exemplos).

## Pendências anteriores
- [ ] Remover `.env` do controlo de versões antes de ligar o GitHub
- [ ] Áudio pré-gerado (Azure) — planeado, não construído
