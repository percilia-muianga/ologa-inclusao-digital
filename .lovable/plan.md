# Plataforma nacional visível primeiro, acessos no fim

Decisão aceite: paramos de acrescentar trabalho a autenticação, papéis e registo de auditoria. Tudo o que já existe nessa frente fica intacto e a funcionar (`/entrar`, `/criar-conta`, área de painel, auditoria, matriz de permissões). Não se remove nada.

## Conflito que preciso de resolver consigo antes de começar

O endereço `/ologa` já está ocupado pela área de administração de instituições (lista, ficha de instituição, criar instituição manualmente). O pedido dá esse mesmo endereço ao conteúdo comercial.

Recomendação: o conteúdo comercial fica em `/ologa` como pediu, e a administração de instituições muda para `/gestao/instituicoes` (mesmos ecrãs, mesmo conteúdo, só o endereço muda). Alternativa: comercial em `/sobre-a-ologa` e a administração fica onde está.

Escolha uma antes de eu avançar.

---

## Fase 1 — A primeira impressão (Parte 1)

O que muda para quem abre o endereço sem conta.

- Página principal passa a ser a plataforma do programa nacional de capacitação digital: identificação institucional, estado do programa, acesso directo a Cursos, Turmas, Presenças, Avaliação, Certificados, Painel Nacional e Conformidade.
- Navegação principal nova, com essas sete entradas e um botão **Entrar** à direita. Sem "Solicitar Proposta".
- Todo o conteúdo comercial actual — análise de mercado, inscrição de instituições, solicitar proposta, entregáveis, contacto, indicadores públicos comerciais — passa integralmente para o endereço próprio, com a navegação comercial actual preservada. Nenhuma secção, texto, número ou fonte se perde: é movido, não reescrito.
- Rodapé da plataforma com ligação discreta **Sobre a Ologa**.
- Aviso permanente de dados de demonstração (fica visível assim que a Fase 6 entrar; na Fase 1 já é construído o mecanismo).
- Barra de acessibilidade, alto contraste, ouvir e saltar para o conteúdo em todos os ecrãs novos, sem excepção.

No fim desta fase a plataforma parece o que é, mesmo com os ecrãs seguintes ainda vazios — cada um com mensagem clara do que está a suceder.

## Fase 2 — Cursos e módulos (Parte 2)

- Estrutura Curso → Módulo → Lição. Os 11 módulos actuais passam a reutilizáveis, referenciáveis por vários cursos, sem perder conteúdo nem guião do formador. As rotas de formação actuais continuam a funcionar.
- Os seis cursos do Termo de Referência, com objectivos, carga horária, modalidade, público-alvo, pré-requisitos, formandos previstos, materiais e progresso agregado.
- Módulo transversal obrigatório nos seis: Governo Digital Inclusivo e Acessibilidade, 2 horas, deveres das instituições públicas ao abrigo da Lei n.º 10/2024.
- Ecrãs: lista de cursos, ficha de curso, ficha de módulo.

Nota: eu não invento o conteúdo das lições dos seis cursos novos. Crio a estrutura, os objectivos e os dados que indicou; o conteúdo formativo fica por fornecer.

## Fase 3 — Turmas e cronogramas (Parte 3)

- Turma: curso, código único de inscrição, província e distrito próprios e obrigatórios (local de formação), local, modalidade, formador principal e auxiliares, datas, limite de 30 formandos com aviso, estado.
- Sessões com data, horas de início e fim, duração, tema e formador.
- Verificação da soma das horas contra a carga horária do curso, com aviso visível quando não iguala.
- Ecrãs: lista de turmas com filtros, ficha de turma, cronograma de sessões.

## Fase 4 — Presenças (Parte 4)

- Marcação presente / ausente / justificado por formando e sessão, em ecrã feito para telefone, com áreas de toque grandes.
- Funciona sem internet e sincroniza quando a ligação voltar.
- Sessões virtuais: presença calculada por tempo de permanência e progresso, corrigível pelo formador com justificação registada.
- Taxa de assiduidade por formando sempre visível, com sinal claro abaixo de 80 por cento (cor e texto, nunca só cor).

## Fase 5 — Avaliação e certificação (Parte 5)

- Banco de questões por curso e módulo, com pelo menos o triplo das questões usadas em cada exame. Cada questão com enunciado, tipologia, dificuldade, módulo, resposta correcta, explicação e estado. Cinco tipologias: escolha múltipla, verdadeiro ou falso, resposta curta, correspondência, ordenação.
- Exame final gerado no momento em que o formando o inicia, com distribuição por módulo e dificuldade e ordem das opções aleatória — dois formandos nunca recebem o mesmo exame. Tempo limite, gravação automática, retoma segura.
- Certificação automática: assiduidade ≥ 80 por cento **e** nota final ≥ 60 por cento. Segunda tentativa com exame novo. Prazo de 30 dias após o fim da formação, com contagem visível.
- Certificado individual por formando e curso, com nome, curso, carga horária, província, turma, datas, nota final, assiduidade e código único — a reutilizar o mecanismo de verificação que já existe em `/verificar`.

## Fase 6 — Painel Nacional e dados de demonstração (Partes 6 e 7)

- Indicadores filtráveis e cruzáveis por curso, província, distrito, turma, formador, género, faixa etária e tipo de deficiência: previstos contra inscritos, taxa de conclusão, assiduidade média, taxa de aprovação, nota média, certificados emitidos, formandos em risco, sessões realizadas contra planeadas.
- Progresso contratual contra as metas: 4000 formandos no total e a meta por curso, com os limiares de 25, 50, 75 e 100 por cento.
- Vista por província, com as 11 províncias.
- Exportação de qualquer vista em CSV, XLS e PDF.
- Regra dos cinco aplicada na desagregação por género e tipo de deficiência, com a mesma redacção já usada na plataforma.
- Cada gráfico acompanhado da tabela de dados equivalente.
- Dados de demonstração, autorizados por si: os seis cursos, cerca de 20 turmas pelas 11 províncias, formandos com nomes moçambicanos plausíveis, sessões, presenças, tentativas de exame e certificados. Todos marcados `dados_de_demonstracao = verdadeiro`, aviso permanente visível na plataforma e um único comando que os remove sem tocar em mais nada.

## Fase 7 — Conformidade e selector de papel (Parte 8)

- Ecrã de Conformidade: Lei n.º 10/2024, desenho universal, acessibilidade, e a matriz de permissões já construída, em leitura.
- Selector de papel visível no topo, para ver a plataforma como formando, formador, supervisor, coordenador, administrador ou auditor. Só muda a vista; não abre nem fecha nada na base de dados.
- Nenhum ecrã fechado atrás de autenticação nesta entrega. Acções que exigiriam papel mostram-se completas para demonstração.

## Fase 8 — Aplicar os acessos (fica para o fim, fora desta entrega)

Ligar os papéis reais às regras da base de dados e fechar os ecrãs. Só depois de a plataforma estar completa e aprovada.

---

## Obrigatório em todas as fases (Parte 9)

Barra de acessibilidade, alto contraste, botão de ouvir e saltar para o conteúdo em todos os ecrãs, incluindo os que se seguem ao registo — a falha de ontem não se repete. Nenhum ecrã em branco: onde não há dados, mensagem clara em português a dizer o que está a suceder e o que fazer. Áreas de toque de 44 pixéis, navegação completa por teclado, compatível com leitor de ecrã, português de Moçambique.

## Notas técnicas

- Movimento do conteúdo comercial: ficheiro de rota movido, secções mantidas byte a byte. Cabeçalho comercial actual continua a servir esse endereço; cabeçalho institucional novo para a plataforma.
- Módulos reutilizáveis: tabela de ligação curso ↔ módulo com ordem, sem alterar `modulos` nem `licoes`.
- Presenças sem internet: fila local no dispositivo, sincronizada quando a ligação voltar, com estado visível por marcação.
- Exame: geração no arranque da tentativa, guardada a composição exacta por tentativa para auditoria posterior.
- Dados de demonstração: coluna `dados_de_demonstracao` em cada tabela nova, com filtro aplicado em todos os indicadores.

## Preciso da sua confirmação

1. Qual das duas opções para o conflito de endereço `/ologa`?
2. Aceita as oito fases e esta ordem?
3. Na Fase 2, confirma que o conteúdo formativo dos seis cursos novos me será fornecido por si (eu não o invento)?
