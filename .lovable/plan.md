# Autenticação, perfis e registo de auditoria

## O que fica exactamente como está

- Todo o acesso público anónimo: página inicial, catálogo de cursos, lições, quizzes, diagnóstico, indicadores públicos, verificação de certificado, inscrição de instituições.
- O progresso guardado no próprio dispositivo continua a funcionar sem conta.
- Barra de acessibilidade, alto contraste, botão de ouvir, saltar para o conteúdo, voltar ao topo — incluídos também em todos os ecrãs novos, incluindo os de entrada e registo.
- Nada do que já existe é removido ou reescrito. A entrada actual de administrador continua a funcionar.

## Os seis perfis

| Perfil | Pode fazer |
| --- | --- |
| Formando | Inscrever-se numa turma por código, ver percurso, presenças, notas e certificados próprios |
| Formador | Só as suas turmas: marcar presenças, lançar observações, ver desempenho dos seus formandos |
| Supervisor provincial | Todas as turmas da sua província: validar presenças, reportar incidências |
| Coordenador nacional | Criar cursos, turmas, cronogramas, atribuir formadores, gerir banco de questões |
| Administrador ATDI | Leitura total, gestão de utilizadores, configuração institucional |
| Auditor ATDI | Só leitura, de todos os dados e de todo o registo de actividade. Activo desde o primeiro dia |

Os papéis ficam numa tabela própria, separada do perfil do utilizador — nunca num campo que o próprio possa alterar. Um utilizador pode ter mais do que um papel.

## Dados novos

Utilizador (nome, email, telefone, entidade empregadora, província, distrito, cargo, género, tipo de deficiência opcional e autodeclarado), Curso, Turma, Sessão, Presença, Inscrição, Tentativa de exame, Certificado de turma, Registo de auditoria.

Província e distrito são obrigatórios, com as 11 províncias de Moçambique.

Campos sensíveis de identificação (telefone, género, tipo de deficiência, email) só são visíveis ao próprio, ao administrador e ao auditor. Formadores e supervisores vêem apenas nome e o que precisam para trabalhar.

## Registo de auditoria

Cada criação, alteração e eliminação fica registada com: utilizador, acção, entidade afectada, valor anterior, valor novo, data e hora, endereço IP. O registo é gravado automaticamente pela própria base de dados, não pelo ecrã, por isso não pode ser contornado. É imutável: ninguém — nem o administrador — pode alterar ou apagar linhas.

## Ecrãs novos

- Entrada e criação de conta (com província, distrito e restantes dados do utilizador)
- Área do formando: percurso, presenças, notas, certificados, inscrição por código de turma
- Área do formador: as suas turmas, folha de presenças, observações, desempenho
- Área do supervisor: turmas da província, validação de presenças, incidências
- Área do coordenador: cursos, turmas, cronogramas, atribuição de formadores, banco de questões
- Área do administrador: gestão de utilizadores e configuração institucional
- Área do auditor: consulta de todos os dados e do registo de actividade, sem qualquer botão de alteração

Cada pessoa é encaminhada para a sua área conforme o papel; quem não tem papel não entra em área nenhuma.

## Proposta de faseamento

Isto é grande de mais para uma entrega só com qualidade auditável. Proponho três fases, cada uma testada antes da seguinte:

1. **Base** — tabelas, os seis papéis, registo de auditoria imutável, entrada e criação de conta, encaminhamento por papel, área do auditor (leitura total, activa desde o primeiro dia).
2. **Formação** — cursos, turmas, sessões, inscrição por código, presenças, áreas do formando e do formador.
3. **Gestão** — supervisor provincial, coordenador nacional (cronogramas, banco de questões, tentativas de exame, certificados de turma) e área do administrador.

## Notas técnicas

- Papéis em tabela `utilizador_papeis` + função `tem_papel()` com `security definer`; políticas de acesso escritas sobre essa função, nunca sobre um campo do perfil.
- Auditoria por gatilho genérico em cada tabela, a escrever em `registo_auditoria`; sem `UPDATE`/`DELETE` concedidos a ninguém, gatilho de bloqueio incluído. O endereço IP é passado pelo servidor na sessão da transacção.
- Ecrãs protegidos sob `_authenticated`, com as leituras a passar por funções de servidor autenticadas; o público mantém-se fora de qualquer barreira.
- Email e palavra-passe activados no arranque da fase 1.

## Preciso da sua confirmação

1. Aceita o faseamento em três partes, ou quer tudo de uma vez?
2. Confirma a activação de entrada por email e palavra-passe (sem redes sociais)?
3. Para a fase 1, crio a primeira conta de auditor com que email?
