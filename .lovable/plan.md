# Correcções ao Termo de Referência — plano faseado

Nada se apaga. Tudo o que está construído mantém-se; corrige-se e acrescenta-se.

## Primeiro, o que NÃO consigo fazer (regra 13)

1. **Recolha real do inquérito de eficácia aos três meses.** Consigo criar o registo, o formulário e o indicador. Não consigo enviar nem recolher os inquéritos — a recolha é da ATDI, a plataforma só guarda e reporta o resultado.
2. **Sincronização offline verdadeira do registo de participantes de workshop.** Consigo guardar no aparelho e enviar quando a ligação voltar. Não consigo garantir funcionamento offline instalável (app) nem resolver conflitos de duas pessoas a registar a mesma folha em simultâneo sem uma regra que me indique.
3. **Conteúdo das 115 lições e das perguntas de pré/pós-teste.** Continua a ser fornecido pela Ologa. Crio a estrutura e a contagem "por fornecer"; não invento conteúdo (excepto o módulo legal já redigido).
4. **Ambiguidade do TdR sobre Maputo.** A lista de distritos dá "Maputo Cidade e Província" como uma linha com 8 distritos, mas os locais de formação tratam Maputo Cidade e Maputo Província como duas entradas. Reproduzo fielmente as duas coisas como estão no TdR; a incoerência fica visível, não a corrijo.
5. **Ecrãs de criação/edição de workshops e relatórios mensais sem acessos.** Vou construí-los abertos, como o resto da plataforma, e fecham-se na fase 8. Não os adio.

## Fase A — Cargas horárias e plano de produção (correcção 1)

- Inteligência Artificial: 20 h → **16 h**; lições por fornecer 10 → **8** (remoção de 2 lições vazias, nunca de lições com conteúdo).
- Redes Avançadas: 80 h → **120 h**; lições por fornecer 40 → **60** (acrescentar 20 lições vazias).
- Total geral do plano de produção: 97 → **115 lições**, actualizado em `/cursos` e na ficha de cada curso.

## Fase B — Locais de formação e distritos (correcções 4 e 2, parte geográfica)

- Tabela de referência com as 11 entradas provinciais e a capital/local exacto de formação, mantendo Maputo Cidade e Maputo Província separadas.
- Tabela dos 77 distritos (a última linha com 8, como no TdR), agrupados por província.
- Estas listas passam a alimentar os campos de província/distrito das turmas e dos workshops.

## Fase C — Workshops (correcção 2)

- Entidade **Workshop**, distinta de Turma: tipo (provincial/distrital), província, distrito, local, data, duração (até 6 h), facilitador, participantes previstos e efectivos, estado.
- **Participante de workshop**, registo leve: nome, entidade, província, distrito, género, contacto. Registo no próprio dia pelo facilitador, com folha que funciona sem ligação e sincroniza depois.
- Sem certificação por nota nem regra dos 80 % de assiduidade — explícito no ecrã.
- Ecrãs: lista de workshops com filtros, ficha do workshop, folha de registo de participantes.
- Metas de referência: 11 provinciais (até 60 participantes) e 77 distritais (25–30), configuráveis.

## Fase D — Pré-teste e pós-teste (correcção 3)

- Avaliação diagnóstica e avaliação de saída, curtas, geradas do mesmo banco de questões do curso ou do tema do workshop.
- Aplicáveis a cursos e a workshops; pontuação de cada uma registada por pessoa.
- Evolução em pontos percentuais por formando, turma, workshop, província e nacional.
- Distintos do exame final de certificação; nenhum substitui o outro.

## Fase E — Painel Nacional pelos indicadores do TdR (correcção 5)

Três blocos, com a tabela de dados sempre ao lado do gráfico e a regra dos cinco mantida:
- **Desempenho da formação**: taxa de conclusão, taxa de certificação, melhoria pré→pós-teste.
- **Satisfação**: índice apurado pelo questionário no fim de cada acção.
- **Eficácia**: percentagem que aplica as competências três meses depois — registo do inquérito e do seu resultado.
- Workshops realizados contra planeados, por província e por distrito.

## Fase F — Relatório mensal ASSS (correcção 6)

- Relatório mensal com incidentes, reclamações recebidas, medidas correctivas e não conformidades.
- Campo próprio de **acessibilidade das actividades**: acomodações razoáveis pedidas e concedidas, conteúdos em formatos alternativos, barreiras identificadas e resolvidas.

## Fase G — Turma: computadores e rácio (correcção 7)

- Limite de 30 formandos confirmado e mantido.
- Novo campo: número de computadores da sala; rácio formandos por computador na ficha, com sinal de aviso acima de dois por computador.

## O que fica intacto

Número de turmas e de formandos por curso (ambiguidade em esclarecimento, valores configuráveis); acessibilidade, desenho universal, leitura em voz alta, alto contraste; autenticação, papéis e registo de auditoria; `/formacao`, `/verificar` e as lições existentes.

## Nota técnica

Alterações de base de dados são todas aditivas: novas tabelas (locais de formação, distritos, workshops, participantes, avaliações pré/pós, inquérito de eficácia, relatórios mensais) e novas colunas (computadores na turma). Nenhuma tabela ou coluna existente é removida ou renomeada. A carga horária dos dois cursos é uma actualização de valor, não uma alteração de estrutura.
