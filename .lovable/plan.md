# Corrigir conteúdo, metadados, avaliação e exportações

## Alterações
- Na página inicial, trocar apenas o parágrafo indicado, substituir os indicadores de 4000 formandos e da lei por “módulo transversal — 2 horas” e “distritos abrangidos — 77”, e actualizar a descrição de partilha para “setenta e sete distritos”.
- Completar os metadados de `/cursos` com o título e a descrição fornecidos e corrigir apenas outros metadados da plataforma que ainda herdem linguagem comercial, mantendo `/ologa` e a página de Conformidade intactas.
- Na Avaliação, manter o panorama já existente e garantir que uma falha ou demora não deixa o ecrã indefinidamente em “A carregar”: mostrar uma mensagem útil e permitir nova tentativa. A verificação actual confirmou que, neste momento, tanto a versão publicada como a pré-visualização chegam ao estado vazio com contagens por curso e módulo.
- No Painel Nacional, acrescentar exportação da vista apresentada em CSV e XLS, incluindo indicadores e as tabelas por província e distrito. Acrescentar PDF através da impressão, com regras de impressão que ocultam navegação e controlos e mantêm tabelas legíveis.

## Validação
- Confirmar títulos, descrições e textos exactos nas páginas afectadas.
- Testar CSV e XLS descarregados e a vista de impressão/PDF.
- Confirmar o comportamento da Avaliação em sucesso, erro e demora, sem ecrã preso.
- Verificar a página inicial, Cursos, Avaliação e Painel Nacional em computador e telefone, sem alterar a página de Conformidade.

## Limites
- Não inserir dados de demonstração.
- Não alterar conteúdos, desenho ou lógica fora destas cinco correcções.
- As mudanças de metadados só chegarão ao endereço publicado depois de nova publicação.
