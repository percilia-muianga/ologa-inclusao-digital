# Roteiro — plataforma nacional primeiro, acessos no fim

Decisão da cliente: construir a plataforma inteira, visível e navegável, e só no fim aplicar os acessos. O que já existe de autenticação, papéis e registo de auditoria fica intacto e a funcionar.

## Condições permanentes desta entrega
- Conteúdo comercial em `/ologa`; administração de instituições em `/gestao/instituicoes`, sem ligações mortas
- Conteúdo formativo dos seis cursos é fornecido pela Ologa — não inventar. Lições criadas com estado "conteúdo por fornecer", visível e contável
- Excepção: o módulo transversal Governo Digital Inclusivo e Acessibilidade é redigido por nós, a partir dos artigos 16, 17, 20, 24, 30 e 31 da Lei n.º 10/2024
- `/formacao`, `/verificar` e as lições existentes continuam a funcionar
- Aviso de dados de demonstração (fase 6): barra fina no topo, discreta mas inequívoca
- Em todos os ecrãs: barra de acessibilidade, alto contraste, ouvir, saltar para o conteúdo, 44 px de toque, teclado, leitor de ecrã, português de Moçambique
- Nenhum ecrã em branco: estado vazio explica o que sucede e o que fazer

## Fase 1 — Primeira impressão (concluída)
- [x] Administração de instituições movida para `/gestao/instituicoes` e ligações internas actualizadas
- [x] Conteúdo comercial movido na íntegra para `/ologa`, com a sua navegação própria
- [x] Nova página principal: plataforma do programa nacional
- [x] Navegação da plataforma: Cursos, Turmas, Presenças, Avaliação, Certificados, Painel Nacional, Conformidade + Entrar
- [x] Rodapé da plataforma com ligação discreta "Sobre a Ologa"
- [x] Ecrãs das sete áreas navegáveis, com estado vazio digno
- [x] Verificação final de acessibilidade e responsividade

## Fase 2 — Cursos e módulos (concluída)
- [x] Curso → Módulo → Lição, módulos reutilizáveis
- [x] Os seis cursos do Termo de Referência + módulo transversal de acessibilidade (redigido por nós)
- [x] 97 lições com estado "conteúdo por fornecer", contável por curso e no total geral
- [x] Seis lições legais, organizadas pelos artigos 16, 17, 20, 24, 30 e 31 da Lei n.º 10/2024

## Fase 3 — Turmas e cronogramas (concluída)
- [x] Turmas com curso, província e distrito do local de formação, local, modalidade, formadores, datas, limite de 30 e estado
- [x] Código de inscrição legível e ditável (sem O, 0, I, L, 1), gerado na base de dados
- [x] Sessões com data, horas, duração, tema e formador; verificação da soma contra a carga horária do curso
- [x] Lista com filtros por província, curso, estado e formador
- [x] Soma por província: turmas e formandos inscritos (embrião do Painel Nacional)
- [ ] Ecrãs de criação/edição de turmas e sessões (por fazer — não adiar por acessos, regra 14)

## Correcções do Termo de Referência — fases A a G (concluídas)
- [x] A — Cargas horárias: IA 16 h (8 lições), Redes 120 h (60 lições); total 115 lições por fornecer
- [x] B — Workshops: entidade própria, provinciais e distritais, lista com filtros, ficha e criação
- [x] B — Registo leve de participantes, no próprio dia, funciona sem ligação e sincroniza depois; duplicados prováveis assinalados, nunca apagados
- [x] C — Pré-teste e pós-teste distintos do exame final, com evolução em pontos percentuais
- [x] D — Locais de formação: as 11 capitais, com Maputo Cidade e Maputo Província separadas
- [x] D — 77 distritos do TdR, reproduzidos fielmente (última linha com 8, incoerência mantida)
- [x] E — Painel Nacional por tipos do TdR: desempenho, satisfação, eficácia aos três meses, workshops por província e distrito
- [x] F — Relatório mensal com incidentes, reclamações, medidas correctivas, não conformidades e acessibilidade das actividades
- [x] G — Limite de 30 formandos confirmado; computadores da sala e rácio com aviso acima de 2 por computador
- [x] Plano de produção soma lições e perguntas de pré e pós-teste em falta

## Fase 4 — Presenças (offline e telefone) (concluída)
- [x] Marcação por formando e por sessão: presente, ausente e justificado com motivo escrito obrigatório
- [x] Ecrã para telefone, marcação num só toque, áreas de toque de 44 px e estado legível em texto
- [x] Funciona sem ligação: marcações guardadas no aparelho, enviadas depois, com estado visível (guardado, enviado, erro) — mesmo mecanismo da folha dos workshops
- [x] Nunca apagar marcações: contradições entre aparelhos ficam todas guardadas e assinaladas para revisão manual
- [x] Sessões virtuais: presença calculada por permanência e progresso, com limiares por curso; correcção pelo formador exige justificação escrita e fica na auditoria
- [x] Assiduidade por formando, sinal em cor e em texto abaixo dos 80 %, e alerta de risco antes do fim da formação
- [x] Folha de presenças imprimível por sessão, com nomes e espaço para assinatura
- [x] Certificação ligada à assiduidade real (deixa de estar «por apurar»), apurada no servidor
## Fase 5 — Avaliação e certificação individual (estrutura concluída)
- [x] Banco de questões: cinco tipologias, dificuldade, curso, módulo, resposta, explicação, estado e autor
- [x] Ecrã de gestão por curso e módulo, com filtros e desactivação (questões usadas nunca eliminadas)
- [x] Indicador por curso: activas, necessárias e rácio do triplo exigido pelo TdR, a vermelho quando falha
- [x] Exame gerado no início, por módulo e dificuldade, com ordem aleatória e composição guardada para auditoria
- [x] Tempo limite legível por leitor de ecrã, gravação automática e retoma segura
- [x] Certificação com as duas condições em separado, segunda tentativa e prazo de 30 dias
- [x] Certificado individual (por formando e por curso) verificável no mesmo ecrã /verificar
- [x] Assiduidade real: ligada à marcação de presenças (fase 4)
- [ ] Conteúdo das questões: a fornecer pela Ologa
## Fase 6 — Painel Nacional e dados de demonstração
## Fase 7 — Conformidade e selector de papel
## Fase 8 — Aplicar os acessos (no fim)

## Pendências anteriores
- [ ] Remover `.env` do controlo de versões antes de ligar o GitHub
- [ ] Áudio pré-gerado (Azure) — planeado, não construído
- [ ] Email da conta de demonstração e domínio das contas de teste

## Correcções encontradas na versão publicada (em curso)
- [x] Retirar a lei e o total incerto de 4000 formandos da abertura e partilha da página inicial
- [x] Corrigir metadados de Cursos e restantes metadados comerciais da plataforma
- [x] Garantir que Avaliação nunca fica presa no carregamento e mantém contagens no estado vazio
- [x] Exportar qualquer vista do Painel Nacional em CSV, XLS e PDF imprimível sem navegação

## A9 — Percurso dos cursos, secção 14, banco e certificação (sem publicar)

- [x] `/cursos` passou a layout; lista em `cursos.index.tsx`; fichas dos seis cursos abrem
- [x] Cargas horárias da secção 14: IA 16→20 h, Redes 120→80 h (sem apagar módulos)
- [x] Divergências entre carga oficial e soma dos módulos assinaladas na área de gestão
- [x] Banco: catálogo já não mistura pré/pós-teste com exame final; mínimo = 3× questões do exame
- [x] Prazo de 30 dias validado no servidor (início do exame e emissão do certificado)
- [x] Leitura de exames, presenças e certificados restringida à equipa de formação (migração 0008)
- [x] `docs/matriz-tdr.md` com implementado/testado/pendente
- [x] 14 testes automáticos (79/80 %, 59/60 %, prazo 30/31 dias, estados de sessão)
- [ ] Questões reais do banco — por fornecer pela Ologa
- [ ] Revisão pedagógica da distribuição curricular
- [ ] Restantes recomendações de segurança fora de exames e presenças
