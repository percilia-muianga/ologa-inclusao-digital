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

## Fase 4 — Presenças (offline e telefone)
## Fase 5 — Avaliação e certificação individual
## Fase 6 — Painel Nacional e dados de demonstração
## Fase 7 — Conformidade e selector de papel
## Fase 8 — Aplicar os acessos (no fim)

## Pendências anteriores
- [ ] Remover `.env` do controlo de versões antes de ligar o GitHub
- [ ] Áudio pré-gerado (Azure) — planeado, não construído
- [ ] Email da conta de demonstração e domínio das contas de teste
