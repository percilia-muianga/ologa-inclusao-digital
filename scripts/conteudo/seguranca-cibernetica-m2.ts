/**
 * Módulo 2 — Protecção, Detecção e Resposta. Cinco lições de 120 minutos.
 * Casos, instituições, endereços, registos e números: todos fictícios.
 */
import type { ConteudoLicao } from "./seguranca-cibernetica-base";
import { NIST_CSF, CISA_KEV, OWASP_WSTG } from "./seguranca-cibernetica-base";

// ---------------------------------------------------------------------------
// M2 L1 — Segurança de aplicações e testes segundo o guia OWASP (120 min, lab)
// ---------------------------------------------------------------------------
const M2L1: ConteudoLicao = {
  objectivos: [
    "Classificar as oito ocorrências da ficha segundo a categoria de falha aplicacional a que pertencem — controlo de acesso, injecção, configuração, autenticação, exposição de dados — justificando cada classificação.",
    "Escrever, para as duas ocorrências que vão ser testadas, o caso de teste correspondente no formato do guia de testes da OWASP: objectivo, pré-condição, passos, resultado esperado e evidência a recolher.",
    "Executar, na aplicação vulnerável instalada em máquina virtual isolada, dois testes autorizados de controlo de acesso e registar a evidência observada.",
    "Redigir um achado de relatório com descrição, impacto, passos de reprodução, evidência e recomendação, sem afirmar que a aplicação é segura.",
  ],
  explicacao: [
    "Boa parte das falhas graves que aparecem em aplicações web não é exótica: é controlo de acesso mal feito. O padrão repete-se — a aplicação esconde o botão na interface, mas o pedido continua a funcionar se for feito directamente; ou usa o identificador que vem do cliente para decidir que registo mostrar, sem verificar se aquele utilizador tem direito àquele registo. A regra é: a autorização verifica-se no servidor, a cada pedido, a partir da identidade da sessão e das regras de acesso definidas pela instituição, e nunca a partir de algo que o cliente possa alterar. Atenção a um erro frequente na formulação da regra: ter direito ao registo não é o mesmo que ser o seu titular. Há acessos legitimamente concedidos por perfil ou por âmbito — o funcionário do balcão que trata do processo, a chefia da unidade, a auditoria interna dentro do seu mandato. O que o servidor tem de verificar é se aquela sessão tem, naquele momento, uma permissão aplicável àquele registo; quem pode ver o quê é uma decisão escrita de quem gere o serviço, e não uma regra técnica universal.",
    "A segunda família é a injecção. Acontece quando dados enviados pelo utilizador são misturados com uma instrução — uma consulta à base de dados, um comando do sistema, uma página devolvida ao navegador — e o sistema passa a executar parte dos dados como se fossem instrução. A defesa que funciona é estrutural: separar instrução de dados, com consultas parametrizadas, e codificar a saída conforme o contexto onde ela vai aparecer. Validar entradas por lista de valores permitidos ajuda, mas não substitui a separação.",
    "A terceira família é configuração: páginas de administração acessíveis, mensagens de erro que revelam a estrutura interna, listagem de directórios ligada, credenciais por omissão que ficaram, componentes desactualizados com falhas conhecidas. É a família mais barata de corrigir e das mais frequentes.",
    "O guia de testes de segurança de aplicações web da OWASP dá estrutura ao trabalho. Não é uma norma obrigatória nem uma lei: é um guia comunitário aberto que organiza o que testar por categorias e ajuda a não esquecer áreas inteiras. A utilidade prática está em dois pontos: transforma «vamos ver se está seguro» numa lista de casos de teste concretos, e dá um formato de registo que torna o achado reproduzível por outra pessoa.",
    "Um achado bem escrito tem sempre cinco partes: o que se encontrou, qual o impacto para o serviço e para os dados, como se reproduz passo a passo, que evidência foi recolhida, e o que se recomenda. O que não deve ter é a conclusão «a aplicação é segura». O que se escreve no fim é o que foi testado, o que ficou por testar e em que condições — é nisso que se distingue um relatório profissional de uma opinião.",
  ],
  exemplo: {
    titulo: "Caso fictício: o portal de marcação de Muteva e o número de processo",
    corpo: [
      "No portal de marcação, depois de entrar, o cidadão vê os seus pedidos através de um endereço que termina em «/pedido/4821». Um funcionário reparou que, mudando o número para 4820, aparecia o pedido de outra pessoa, com nome, contacto e motivo.",
      "A empresa que desenvolveu a aplicação respondeu que «o ecrã só mostra os pedidos do utilizador» — e mostra mesmo, na lista. O problema está na página de detalhe, que aceita qualquer número e devolve o registo correspondente sem verificar de quem é.",
      "Este é o caso clássico de referência directa insegura a objectos. É uma falha de controlo de acesso, não de interface, e corrige-se no servidor: antes de devolver o registo, a aplicação tem de verificar se a sessão tem permissão para aquele pedido concreto. No portal de Muteva, a regra escrita pela direcção é que o cidadão vê os seus próprios pedidos e que os funcionários do balcão vêem os pedidos da sua unidade; a verificação no servidor aplica essa regra, em vez de aceitar o número recebido do cliente como se bastasse. Noutro serviço, com outras regras de perfil e âmbito, a verificação é a mesma ideia com outro critério.",
    ],
  },
  tabela: {
    titulo: "Anexo A — Oito ocorrências observadas no portal de laboratório (fictícias)",
    nota: "Ficha de trabalho. As colunas de classificação e prioridade são preenchidas na actividade.",
    colunas: ["Código", "Ocorrência observada", "Categoria", "Prioridade"],
    linhas: [
      ["O-01", "A página /pedido/{numero} devolve pedidos de outros utilizadores quando se altera o número", "", ""],
      ["O-02", "O campo de pesquisa devolve erro com o texto da consulta à base de dados quando se escreve uma plica", "", ""],
      ["O-03", "A página /admin abre sem pedir autenticação a partir da rede interna", "", ""],
      ["O-04", "A sessão continua válida depois de o utilizador carregar em «sair»", "", ""],
      ["O-05", "O comentário introduzido por um utilizador aparece a outro e executa código no navegador", "", ""],
      ["O-06", "O servidor devolve a listagem do directório /documentos", "", ""],
      ["O-07", "A conta de demonstração «demo/demo» continua activa", "", ""],
      ["O-08", "O ficheiro de cópia «config.php.bak» é acessível e contém a senha da base de dados", "", ""],
    ],
  },
  anexos: [
    {
      titulo: "Anexo B — Autorização escrita para os testes do laboratório (modelo fictício)",
      nota: "Modelo a assinar pelo formador antes do laboratório; é também o exemplo de boa redacção.",
      corpo: [
        "«Autorização de teste em ambiente de formação. Alvos permitidos: exclusivamente a máquina virtual APP-LAB, endereço 10.20.4.10, na rede virtual isolada da sala. Alvos expressamente excluídos: qualquer sistema da instituição anfitriã, qualquer endereço fora da rede virtual e qualquer serviço na internet.",
        "Janela: durante a sessão desta lição, das 09h00 às 11h00 do dia da formação. Técnicas proibidas: negação de serviço, alteração ou destruição de dados fora da aplicação de laboratório, e qualquer acção sobre máquinas de outros participantes.",
        "Critério de paragem imediata: qualquer efeito observado fora de APP-LAB. Contacto de emergência: o formador da sessão, presente na sala. Registo: cada par regista na folha de laboratório a hora, o teste executado e o resultado observado.»",
      ],
    },
  ],
  listagens: [
    {
      titulo: "Anexo C — Aplicação didáctica APP-LAB, código completo (app_lab.py)",
      nota:
        "Aplicação de formação DELIBERADAMENTE VULNERÁVEL, escrita para este curso. Usa apenas a biblioteca padrão do Python 3 (requer Python 3.8 ou superior; a equipa autora executou-a em Python 3.13) e não instala nem descarrega nada. Guardar como app_lab.py na máquina virtual isolada e arrancar com «python3 app_lab.py»; fica a escutar em 127.0.0.1:8080, apenas dentro da própria máquina. Contas: utilizador1/lab1 e utilizador2/lab2. Pedidos fictícios: 4821 pertence a utilizador1 e 4820 pertence a utilizador2. NUNCA colocar esta aplicação em rede da instituição, na internet ou na plataforma de formação.",
      linhas: [
        "#!/usr/bin/env python3",
        "# app_lab.py - aplicacao didactica DELIBERADAMENTE VULNERAVEL.",
        "# Uso exclusivo em maquina virtual isolada, sem ligacao a redes reais.",
        "# Biblioteca padrao apenas. Nao instala nada. Arranque: python3 app_lab.py",
        "from http.server import BaseHTTPRequestHandler, HTTPServer",
        "from urllib.parse import parse_qs",
        "import uuid",
        "",
        "CONTAS = {'utilizador1': 'lab1', 'utilizador2': 'lab2'}",
        "",
        "PEDIDOS = {",
        "    '4820': {'dono': 'utilizador2', 'nome': 'Ana Cumbe (ficticio)',",
        "             'contacto': '84 000 0002', 'motivo': 'Segunda via de certidao'},",
        "    '4821': {'dono': 'utilizador1', 'nome': 'Bento Mate (ficticio)',",
        "             'contacto': '84 000 0001', 'motivo': 'Marcacao de atendimento'},",
        "}",
        "",
        "SESSOES = {}",
        "",
        "PAGINA_ENTRAR = ('<h1>Portal de laboratorio</h1>'",
        "                 '<form method=post action=/entrar>'",
        "                 'Utilizador: <input name=u> Senha: <input name=p type=password>'",
        "                 '<button>Entrar</button></form>')",
        "",
        "",
        "class App(BaseHTTPRequestHandler):",
        "    def sessao(self):",
        "        for parte in self.headers.get('Cookie', '').split(';'):",
        "            if parte.strip().startswith('sid='):",
        "                return SESSOES.get(parte.strip()[4:])",
        "        return None",
        "",
        "    def responder(self, codigo, corpo, cookie=None):",
        "        dados = corpo.encode('utf-8')",
        "        self.send_response(codigo)",
        "        self.send_header('Content-Type', 'text/html; charset=utf-8')",
        "        self.send_header('Content-Length', str(len(dados)))",
        "        if cookie:",
        "            self.send_header('Set-Cookie', cookie)",
        "        self.end_headers()",
        "        self.wfile.write(dados)",
        "",
        "    def do_GET(self):",
        "        utilizador = self.sessao()",
        "        if self.path == '/':",
        "            if not utilizador:",
        "                return self.responder(200, PAGINA_ENTRAR)",
        "            meus = [n for n, p in PEDIDOS.items() if p['dono'] == utilizador]",
        "            itens = ''.join('<li><a href=/pedido/' + n + '>Pedido ' + n + '</a></li>' for n in meus)",
        "            return self.responder(200, '<h1>Os meus pedidos</h1><ul>' + itens + '</ul>')",
        "        if self.path.startswith('/pedido/'):",
        "            numero = self.path[len('/pedido/'):]",
        "            pedido = PEDIDOS.get(numero)",
        "            if not pedido:",
        "                return self.responder(404, '<p>Pedido nao encontrado.</p>')",
        "            # FALHA DIDACTICA O-01: devolve o pedido sem verificar a sessao.",
        "            return self.responder(200, '<h1>Pedido ' + numero + '</h1><p>Nome: ' + pedido['nome']",
        "                                  + '</p><p>Contacto: ' + pedido['contacto']",
        "                                  + '</p><p>Motivo: ' + pedido['motivo'] + '</p>')",
        "        if self.path == '/admin':",
        "            # FALHA DIDACTICA O-03: painel de administracao sem autenticacao.",
        "            linhas = ''.join('<li>' + n + ' - ' + p['dono'] + ' - ' + p['nome'] + '</li>'",
        "                             for n, p in PEDIDOS.items())",
        "            return self.responder(200, '<h1>Administracao</h1><ul>' + linhas + '</ul>')",
        "        return self.responder(404, '<p>Nao encontrado.</p>')",
        "",
        "    def do_POST(self):",
        "        if self.path != '/entrar':",
        "            return self.responder(404, '<p>Nao encontrado.</p>')",
        "        tamanho = int(self.headers.get('Content-Length', '0'))",
        "        campos = parse_qs(self.rfile.read(tamanho).decode('utf-8'))",
        "        u = campos.get('u', [''])[0]",
        "        p = campos.get('p', [''])[0]",
        "        if CONTAS.get(u) != p:",
        "            return self.responder(401, '<p>Credenciais invalidas.</p>')",
        "        sid = uuid.uuid4().hex",
        "        SESSOES[sid] = u",
        "        return self.responder(200, '<p>Sessao iniciada. <a href=/>Continuar</a></p>',",
        "                              cookie='sid=' + sid + '; Path=/')",
        "",
        "",
        "if __name__ == '__main__':",
        "    print('APP-LAB a escutar em http://127.0.0.1:8080 (ambiente isolado)')",
        "    HTTPServer(('127.0.0.1', 8080), App).serve_forever()",
      ],
    },
    {
      titulo: "Anexo D — Pedidos e respostas completos dos dois testes (material da alternativa offline)",
      nota:
        "Registo integral dos pedidos e das respostas obtidos nesta aplicação, para trabalhar no papel quando não houver ambiente. O identificador de sessão mostrado é de uma execução de exemplo e muda a cada arranque. Trabalhar sobre este registo é análise documental: não conta como laboratório executado.",
      linhas: [
        "A. Iniciar sessao como utilizador1",
        "POST /entrar HTTP/1.1",
        "Host: 127.0.0.1:8080",
        "Content-Type: application/x-www-form-urlencoded",
        "Content-Length: 20",
        "",
        "u=utilizador1&p=lab1",
        "",
        "HTTP/1.0 200 OK",
        "Content-Type: text/html; charset=utf-8",
        "Content-Length: 47",
        "Set-Cookie: sid=f19214ad60fa44c7b56af3e9ce1915c4; Path=/",
        "",
        "<p>Sessao iniciada. <a href=/>Continuar</a></p>",
        "",
        "B. Teste O-01, primeira parte: o proprio pedido (resultado esperado, legitimo)",
        "GET /pedido/4821 HTTP/1.1",
        "Host: 127.0.0.1:8080",
        "Cookie: sid=f19214ad60fa44c7b56af3e9ce1915c4",
        "",
        "HTTP/1.0 200 OK",
        "Content-Type: text/html; charset=utf-8",
        "Content-Length: 120",
        "",
        "<h1>Pedido 4821</h1><p>Nome: Bento Mate (ficticio)</p><p>Contacto: 84 000 0001</p><p>Motivo: Marcacao de atendimento</p>",
        "",
        "C. Teste O-01, segunda parte: pedido de outra conta com a MESMA sessao (falha de autorizacao)",
        "GET /pedido/4820 HTTP/1.1",
        "Host: 127.0.0.1:8080",
        "Cookie: sid=f19214ad60fa44c7b56af3e9ce1915c4",
        "",
        "HTTP/1.0 200 OK",
        "Content-Type: text/html; charset=utf-8",
        "Content-Length: 119",
        "",
        "<h1>Pedido 4820</h1><p>Nome: Ana Cumbe (ficticio)</p><p>Contacto: 84 000 0002</p><p>Motivo: Segunda via de certidao</p>",
        "",
        "D. Teste O-01, terceira parte: o mesmo pedido SEM qualquer sessao",
        "GET /pedido/4820 HTTP/1.1",
        "Host: 127.0.0.1:8080",
        "",
        "HTTP/1.0 200 OK",
        "Content-Type: text/html; charset=utf-8",
        "Content-Length: 119",
        "",
        "<h1>Pedido 4820</h1><p>Nome: Ana Cumbe (ficticio)</p><p>Contacto: 84 000 0002</p><p>Motivo: Segunda via de certidao</p>",
        "",
        "E. Teste O-03: painel de administracao sem sessao",
        "GET /admin HTTP/1.1",
        "Host: 127.0.0.1:8080",
        "",
        "HTTP/1.0 200 OK",
        "Content-Type: text/html; charset=utf-8",
        "Content-Length: 132",
        "",
        "<h1>Administracao</h1><ul><li>4820 - utilizador2 - Ana Cumbe (ficticio)</li><li>4821 - utilizador1 - Bento Mate (ficticio)</li></ul>",
      ],
    },
  ],
  actividade: {
    formato: "em pares, com os anexos A e B em papel, antes de tocar no ambiente",
    enunciado: [
      "Passo 1 (15 minutos). Classifiquem as oito ocorrências do anexo A por categoria — controlo de acesso, injecção, configuração, autenticação ou exposição de dados — e atribuam prioridade de 1 a 3, justificando a prioridade pelo que um atacante consegue a partir daquilo. Onde a ocorrência for apenas indício de uma categoria, escrevam «indício» e digam que teste confirmaria.",
      "Passo 2 (10 minutos). Para O-01 e O-03, escrevam o caso de teste no formato do guia: objectivo do teste, pré-condição, passos numerados, resultado esperado se a falha existir, resultado esperado se estiver corrigida, e evidência a recolher. São estes os dois casos que vão executar no laboratório.",
      "Passo 3 (10 minutos). Escrevam o achado completo de O-01 como entraria num relatório: descrição, impacto, reprodução, evidência e recomendação. A recomendação deve dizer onde se corrige, não apenas o que se corrige.",
    ],
    produto:
      "Anexo A classificado e priorizado, dois casos de teste escritos no formato do guia e um achado de relatório completo para O-01.",
    rubrica: [
      "O-01 e O-03 estão classificadas como controlo de acesso; O-05 como injecção no navegador; O-06, O-07 e O-08 como configuração; O-04 como gestão de sessão e autenticação.",
      "O-02 é classificada como indício de injecção na consulta à base de dados, e não como injecção confirmada: uma mensagem de erro provocada por uma plica mostra que a entrada chega ao motor da base de dados sem tratamento adequado e que a aplicação revela detalhes internos no erro, o que já é achado próprio. A confirmação exige um teste adicional, autorizado e registado, que demonstre alteração do comportamento da consulta.",
      "A prioridade de O-08 é alta e justificada assim: um ficheiro de configuração acessível com credenciais é exposição grave de credenciais e obriga a trocá-las. Não se conclui daí, sem verificação, que exista acesso directo à base de dados — isso depende de a base aceitar ligações a partir de onde o atacante está, de as credenciais ainda serem válidas e das permissões associadas. O achado escreve-se com esta distinção entre o que foi observado e o que ainda é hipótese.",
      "Os casos de teste indicam evidência concreta a recolher — captura de ecrã, pedido e resposta, hora — e não apenas «verificar se funciona».",
      "A recomendação de O-01 exige verificação de autorização no servidor, aplicando as regras de acesso escritas da instituição — titular, perfil ou âmbito, conforme o caso — e não esconder a ligação na interface.",
      "O achado não conclui que a aplicação é segura nem generaliza para além do que foi testado.",
    ],
  },
  laboratorio: {
    titulo: "Dois testes autorizados de controlo de acesso em APP-LAB (app_lab.py)",
    minutos: 25,
    objectivo:
      "Executar, na aplicação didáctica app_lab.py do anexo C, os casos de teste de O-01 e O-03 escritos na actividade, recolher evidência e registá-la no formato do relatório.",
    materialFornecido: [
      "Anexo C: código completo da aplicação app_lab.py, entregue com esta lição. Não é preciso o formador inventar nem procurar aplicação nenhuma — copia-se o código do anexo para um ficheiro com esse nome.",
      "Anexo C: contas (utilizador1/lab1 e utilizador2/lab2), pedidos fictícios (4821 de utilizador1 e 4820 de utilizador2) e rotas (/, /entrar, /pedido/{numero}, /admin) já coerentes entre si, sem passo de configuração adicional.",
      "Anexo D: pedidos e respostas completos dos dois testes, para imprimir e usar na alternativa offline.",
      "Anexo B: autorização de teste pronta a assinar.",
    ],
    recursos: [
      "Uma máquina virtual «APP-LAB» com Python 3.8 ou superior já instalado (qualquer distribuição de Linux corrente serve; a equipa autora executou a aplicação em Python 3.13). A aplicação não instala pacotes e não precisa de internet.",
      "O ficheiro app_lab.py, criado a partir do anexo C, arrancado com «python3 app_lab.py». Escuta em 127.0.0.1:8080 e só responde dentro da própria máquina.",
      "Um navegador na mesma máquina virtual, com as ferramentas de programador para ver pedidos e respostas. Em alternativa, a ferramenta de linha de comandos curl, se estiver disponível.",
      "Rede virtual isolada, sem encaminhamento para a rede da sala nem para a internet.",
      "Autorização do anexo B impressa e assinada, afixada na sala durante o laboratório.",
      "Folha de laboratório com espaço para hora, teste, resultado e evidência.",
    ],
    dependenciasPorPreparar: [
      "A máquina virtual em si — imagem, memória e instalação — não é entregue com o curso: é preparada pela instituição de acolhimento. Enquanto não existir, o laboratório fica pendente.",
      "Este laboratório ainda não foi executado numa sala com formandos: os 25 minutos previstos e a sequência dos passos são estimativa a confirmar na primeira execução, e devem ser corrigidos no guião depois dela.",
      "Se a sala não tiver máquinas virtuais mas tiver Python instalado numa máquina isolada da rede, o formador decide, por escrito, se autoriza a execução nessa máquina; se não autorizar, usa-se o anexo D e regista-se o laboratório como pendente.",
    ],
    preparacao: [
      "Na véspera, criar app_lab.py a partir do anexo C na máquina virtual, arrancar com «python3 app_lab.py» e confirmar que a página inicial abre em http://127.0.0.1:8080.",
      "Confirmar a entrada com as duas contas do anexo C e que cada conta vê apenas o seu pedido na lista inicial.",
      "Tirar instantâneo «inicial» da máquina virtual com a aplicação já a funcionar.",
      "Confirmar que a rede virtual está isolada e que APP-LAB não alcança a internet nem a rede da sala.",
      "Imprimir o anexo D, para o caso de o ambiente falhar, e ler em voz alta a autorização do anexo B antes de qualquer teste.",
    ],
    passos: [
      "Arrancar a aplicação com «python3 app_lab.py» e abrir http://127.0.0.1:8080 no navegador da própria máquina.",
      "Entrar como «utilizador1» com a senha «lab1» e anotar o número do próprio pedido (4821).",
      "Executar o caso de teste de O-01: com a mesma sessão, escrever no endereço /pedido/4820, que é o pedido de «utilizador2», e registar o que a aplicação devolve, com captura de ecrã e hora.",
      "Repetir /pedido/4820 depois de fechar o navegador ou apagar o cookie de sessão, para distinguir falha de autorização de falha de autenticação, e registar o resultado.",
      "Executar o caso de teste de O-03: aceder a /admin sem sessão iniciada e registar se a página abre, que informação mostra e que evidência foi recolhida.",
      "Registar na folha, para cada teste, a hora de início, a acção exacta e o resultado observado, sem interpretações.",
      "Não alterar nem apagar dados na aplicação: os testes desta lição são apenas de leitura e de acesso.",
    ],
    verificacaoSucesso: [
      "A folha de laboratório tem, para cada um dos dois testes, hora, acção e resultado observado, com evidência anexada.",
      "O resultado observado em /pedido/4820 corresponde ao que está no anexo D: a aplicação devolve o pedido de outra conta. Se não corresponder, anota-se a diferença em vez de forçar a conclusão esperada.",
      "O par consegue reproduzir o resultado de O-01 uma segunda vez seguindo apenas os passos que escreveu — se não conseguir, os passos estão incompletos e são corrigidos.",
      "O teste repetido sem sessão iniciada permite dizer, com fundamento, se a falha é de autorização ou de autenticação.",
      "Nenhum efeito foi observado fora de APP-LAB, conforme o critério de paragem.",
    ],
    reversao: [
      "Parar a aplicação com Ctrl+C: os dados vivem em memória e desaparecem ao parar, pelo que a aplicação volta ao estado inicial em cada arranque.",
      "Restaurar o instantâneo «inicial» da máquina virtual no fim da sessão.",
      "Apagar app_lab.py e as capturas de ecrã das máquinas partilhadas depois de anexadas à folha do par, para a aplicação vulnerável não ficar esquecida em nenhum computador.",
    ],
    alternativaOffline: [
      "Trabalhar sobre o anexo D impresso, que traz os pedidos e as respostas completos das cinco situações (entrada em sessão, pedido próprio, pedido alheio com sessão, pedido alheio sem sessão e painel /admin).",
      "Comparar a resposta B com a resposta C e escrever, numa frase, o que a diferença — ou a ausência de diferença — mostra sobre a verificação de autorização no servidor.",
      "Localizar, no código do anexo C, a linha comentada como falha didáctica O-01 e explicar que verificação falta ali.",
      "Escrever os passos de reprodução a partir do material impresso e verificar se outra pessoa da sala os consegue seguir sem dúvidas.",
      "Redigir o achado completo com a evidência impressa em vez da evidência recolhida.",
      "Registar a lição como análise documental e o laboratório como pendente, a reagendar.",
    ],
  },
  sintese: [
    "A autorização verifica-se no servidor, em cada pedido. Esconder o botão não protege nada.",
    "Injecção resolve-se separando instrução de dados, não confiando só em filtrar texto.",
    "Configuração por omissão deixada como está é das falhas mais comuns e mais baratas de corrigir.",
    "Testar sem autorização escrita e sem lista de alvos não é teste.",
    "O relatório diz o que foi testado e o que ficou por testar. Nunca diz «a aplicação é segura».",
  ],
  verificacao: [
    {
      pergunta:
        "A empresa propõe corrigir O-01 removendo a ligação para a página de detalhe e passando a abrir o pedido por um botão da lista. Resolve?",
      resposta:
        "Não. O endereço continua a existir e continua a responder a quem o escrever directamente. A correcção tem de ser no servidor: a consulta deve filtrar pelo utilizador da sessão e devolver «não encontrado» quando o pedido não lhe pertence.",
      feedback:
        "Alterações de interface não são controlo de acesso. Qualquer defesa que o cliente possa contornar não é defesa.",
    },
    {
      pergunta:
        "No laboratório encontraram duas falhas e nenhuma outra. Podem escrever no relatório que as restantes áreas da aplicação estão seguras?",
      resposta:
        "Não. Podem escrever que testaram dois casos, com que método e em que janela, e que essas áreas não foram testadas. Ausência de achado no que não foi testado não é prova de segurança.",
      feedback:
        "A honestidade do âmbito é o que dá valor ao relatório. Quem lê precisa de saber o que ficou de fora para decidir o que fazer a seguir.",
    },
  ],
  referencias: [OWASP_WSTG, CISA_KEV],
  guiao: {
    preparacao: [
      "Instalar APP-LAB em todos os computadores no dia anterior e tirar o instantâneo «inicial».",
      "Imprimir e assinar a autorização do anexo B e afixá-la na sala.",
      "Preparar o conjunto impresso de pedido e resposta para a alternativa offline.",
    ],
    conducao: [
      "Contar o caso do número de processo e perguntar à sala de quem é a falha: da interface ou do servidor.",
      "Expor controlo de acesso, injecção e configuração, e apresentar o guia de testes como organizador do trabalho e do registo.",
      "Conduzir a classificação e os casos de teste em papel; só depois ler a autorização em voz alta e autorizar o arranque de APP-LAB.",
      "Dois pares leem o achado de O-01. Fechar com a regra do relatório: dizer o que foi testado e o que ficou por testar.",
    ],
    criterios: [
      "Classificação correcta das oito ocorrências.",
      "Casos de teste reproduzíveis por outra pessoa.",
      "Evidência recolhida com hora e acção exacta.",
      "Achado sem conclusões para além do âmbito.",
    ],
    errosComuns: [
      "Corrigir controlo de acesso na interface.",
      "Recolher capturas de ecrã sem hora nem indicação da acção.",
      "Alterar dados na aplicação durante testes que deviam ser só de leitura.",
      "Escrever «aplicação insegura» ou «aplicação segura» em vez de descrever achados.",
    ],
  },
};

// ---------------------------------------------------------------------------
// M2 L2 — DevSecOps (120 min)
// ---------------------------------------------------------------------------
const M2L2: ConteudoLicao = {
  objectivos: [
    "Situar, no diagrama de cadeia de entrega fornecido, em que ponto entra cada tipo de verificação automática e o que cada uma detecta e não detecta.",
    "Definir critérios de bloqueio e de aviso para uma cadeia de entrega, distinguindo o que interrompe a entrega do que apenas gera registo, com justificação.",
    "Analisar o relatório fictício de dependências e decidir, para cada componente, entre actualizar, substituir, mitigar ou aceitar com prazo.",
    "Escrever cláusulas de segurança para um caderno de encargos de desenvolvimento externo, incluindo entrega de inventário de componentes e correcção de falhas após a entrega.",
  ],
  explicacao: [
    "DevSecOps é a ideia de que a segurança entra no processo de desenvolvimento desde o início, de forma automática e repetível, em vez de aparecer no fim como uma auditoria que atrasa tudo. O motivo é prático: corrigir uma falha na fase de desenho custa pouco; corrigi-la depois de o serviço estar em produção custa muito mais e envolve janelas de manutenção, comunicação e risco.",
    "Há quatro verificações que cobrem a maior parte do terreno. A análise estática lê o código sem o executar e apanha padrões perigosos, como consultas construídas por concatenação de texto. A análise de dependências compara os componentes usados com listas públicas de falhas conhecidas — é a que dá mais retorno imediato, porque a maior parte do código de uma aplicação moderna vem de componentes de terceiros. A varredura de segredos procura chaves e senhas dentro do código. A análise dinâmica testa a aplicação a correr, num ambiente de ensaio, e apanha o que só se vê em execução. Cada uma tem ponto cego: a estática não vê erros de lógica de negócio; a de dependências não vê código próprio; a de segredos não vê segredos bem disfarçados; a dinâmica não vê o que não chega a exercitar.",
    "Uma cadeia de entrega útil distingue bloqueio de aviso. Bloquear tudo paralisa a equipa e leva a que alguém desligue as verificações. Avisar tudo é o mesmo que não verificar. O critério tem de estar escrito e ser defensável: por exemplo, segredo detectado bloqueia sempre; componente com falha grave e com exploração observada bloqueia; falha de gravidade média gera aviso com prazo para tratamento; questão de estilo não bloqueia. Quem define este critério é a instituição, não a ferramenta.",
    "Inventário de componentes é o documento que diz que peças entram no produto e em que versão. Sem ele, quando surge uma falha grave num componente muito usado, a pergunta «nós usamos isso?» fica dias sem resposta — e esses dias são exactamente a janela do atacante. Para software encomendado a terceiros, exigir este inventário na entrega é das cláusulas mais úteis que se podem escrever.",
    "Para instituições que não desenvolvem, quase tudo isto continua a aplicar-se, na forma de exigências contratuais: entrega do inventário de componentes, prazo de correcção de falhas descobertas depois da entrega, direito a fazer teste de segurança antes de entrar em produção, e proibição de entregar com segredos embutidos. São cláusulas de contrato e boas práticas de gestão, não obrigações legais.",
  ],
  exemplo: {
    titulo: "Caso fictício: a aplicação de processos e as suas 214 dependências",
    corpo: [
      "A aplicação de processos de Muteva foi entregue em 2021. Quando a equipa quis saber que componentes usava, não havia lista. Um levantamento feito à mão encontrou 214 componentes de terceiros, alguns dos quais já não são mantidos por ninguém desde 2019.",
      "Em Agosto de 2026 foi divulgada uma falha grave num componente de tratamento de ficheiros muito comum. A pergunta «usamos este componente?» demorou quatro dias a ser respondida, porque foi preciso abrir a aplicação e procurar.",
      "A resposta acabou por ser sim, em duas versões diferentes, uma delas na parte que recebe anexos dos cidadãos — exactamente a parte exposta.",
    ],
  },
  tabela: {
    titulo: "Anexo A — Relatório de dependências da aplicação de processos (fictício, extracto)",
    nota: "Oito dos 214 componentes. A coluna «Decisão» é preenchida na actividade.",
    colunas: ["Componente", "Versão em uso", "Falha conhecida", "Exploração observada", "Versão corrigida", "Decisão"],
    linhas: [
      ["tratamento-ficheiros", "2.1.0", "Grave: execução remota de código", "Sim", "2.4.3", ""],
      ["biblioteca-pdf", "1.0.4", "Média: leitura de ficheiros locais", "Não", "1.2.0", ""],
      ["cliente-base-dados", "4.2.1", "Baixa: fuga de informação em mensagens de erro", "Não", "4.2.6", ""],
      ["motor-de-modelos", "0.9.8", "Grave: injecção em modelos", "Não", "Sem versão corrigida; projecto abandonado", ""],
      ["registo-aplicacional", "3.3.0", "Nenhuma conhecida", "Não", "—", ""],
      ["autenticacao-sessao", "2.0.0", "Média: sessão não invalidada ao terminar", "Não", "2.1.1", ""],
      ["compressao", "1.5.2", "Grave: negação de serviço por ficheiro malformado", "Sim", "1.5.9", ""],
      ["interface-grafica", "5.4.0", "Baixa: problema de apresentação", "Não", "5.6.0", ""],
    ],
  },
  anexos: [
    {
      titulo: "Anexo B — Cadeia de entrega actual da empresa externa (descrição fictícia)",
      nota: "Material de entrada. Descreve o processo tal como a empresa o declarou.",
      corpo: [
        "Etapa 1 — A pessoa que programa escreve o código no computador pessoal e envia-o para o repositório partilhado.",
        "Etapa 2 — Não há revisão por outra pessoa; quem envia pode aprovar o seu próprio trabalho.",
        "Etapa 3 — Uma tarefa automática compila o código e corre os testes funcionais. Se falharem, a entrega pára.",
        "Etapa 4 — Não existe análise estática, nem análise de dependências, nem varredura de segredos.",
        "Etapa 5 — A entrega é copiada directamente para o servidor de produção, à sexta-feira à tarde.",
        "Etapa 6 — Não existe ambiente de ensaio; a verificação é feita em produção, depois de instalar.",
      ],
    },
  ],
  actividade: {
    formato: "em grupos de três pessoas, com os anexos A e B em papel",
    enunciado: [
      "Passo 1 (20 minutos). Redesenhem a cadeia de entrega do anexo B, indicando em que etapa entra cada uma das quatro verificações automáticas e o que cada uma detecta. Marquem também as duas alterações de processo que fariam mesmo sem ferramentas nenhumas.",
      "Passo 2 (20 minutos). Definam a política de bloqueio e aviso: que resultados interrompem a entrega, que resultados apenas registam, e com que prazo os avisos têm de ser tratados. Justifiquem cada limite.",
      "Passo 3 (20 minutos). Decidam, para cada componente do anexo A, entre actualizar, substituir, mitigar ou aceitar com prazo. Para o motor de modelos, que não tem versão corrigida, escrevam a mitigação concreta e o prazo de substituição.",
    ],
    produto:
      "Diagrama da cadeia de entrega revista, política escrita de bloqueio e aviso, e tabela de decisões para os oito componentes.",
    rubrica: [
      "As quatro verificações estão colocadas em etapas onde fazem sentido, e não todas no fim.",
      "Entre as alterações de processo sem ferramentas está a revisão por outra pessoa e o fim da instalação directa em produção à sexta-feira.",
      "A política bloqueia segredos detectados e falhas graves com exploração observada, e deixa em aviso com prazo as de gravidade média.",
      "O componente de tratamento de ficheiros e o de compressão são tratados como prioritários por terem exploração observada.",
      "Para o motor de modelos abandonado há mitigação concreta e prazo de substituição, e não apenas «aceitar o risco».",
    ],
  },
  sintese: [
    "Segurança entra no princípio do trabalho, não no fim como auditoria.",
    "Quatro verificações: código, dependências, segredos e aplicação a correr. Cada uma tem pontos cegos.",
    "A cadeia distingue o que bloqueia do que apenas avisa. Bloquear tudo faz com que alguém desligue.",
    "Lista de componentes com versões: sem ela, no dia da falha ninguém sabe se somos afectados.",
    "Quem não desenvolve exige no contrato: lista de componentes, prazo de correcção e teste antes de entrar em produção.",
  ],
  verificacao: [
    {
      pergunta:
        "A análise de dependências não encontrou nada de grave. Significa que a aplicação não tem falhas graves?",
      resposta:
        "Não. Essa análise só compara os componentes de terceiros com listas de falhas conhecidas. Não vê falhas no código próprio, nem erros de lógica de negócio, nem problemas de configuração ou de controlo de acesso.",
      feedback:
        "Cada verificação cobre uma fatia. A leitura conjunta é que dá imagem; nenhuma delas isolada autoriza a conclusão «não há falhas».",
    },
    {
      pergunta:
        "O motor de modelos tem falha grave e o projecto foi abandonado, sem versão corrigida. Qual é a decisão defensável?",
      resposta:
        "Mitigar agora e planear a substituição com prazo: restringir quem pode submeter conteúdo tratado por esse componente, reforçar a validação à entrada, aumentar a vigilância sobre aquela funcionalidade e marcar data para trocar o componente. Aceitar sem prazo não é decisão, é adiamento.",
      feedback:
        "Componentes abandonados não melhoram com o tempo, pioram. A aceitação de risco só é séria quando tem prazo e responsável.",
    },
  ],
  referencias: [CISA_KEV, OWASP_WSTG],
  guiao: {
    preparacao: [
      "Imprimir os anexos A e B por grupo e folhas grandes para o diagrama.",
      "Preparar uma política de bloqueio e aviso de exemplo, para projectar só no fecho.",
      "Ter presente que muitas instituições não desenvolvem: preparar a tradução para cláusulas contratuais.",
    ],
    conducao: [
      "Abrir com a pergunta que demorou quatro dias a responder e pedir à sala uma estimativa do tempo que demorariam na sua instituição.",
      "Expor as quatro verificações com pontos cegos, a diferença entre bloquear e avisar, e o inventário de componentes.",
      "Acompanhar os três passos, exigindo justificação dos limites da política e prazos nas decisões.",
      "Dois grupos apresentam a política. Projectar o exemplo e fechar com as cláusulas para quem contrata desenvolvimento.",
    ],
    criterios: [
      "Verificações bem colocadas na cadeia.",
      "Política com limites justificados e prazos.",
      "Decisões por componente coerentes com exploração observada.",
      "Mitigação concreta para o componente sem correcção.",
    ],
    errosComuns: [
      "Colocar todas as verificações no fim, mantendo o modelo de auditoria final.",
      "Bloquear em tudo, o que leva a que a equipa desligue as verificações.",
      "Aceitar risco sem prazo nem responsável.",
      "Assumir que quem não desenvolve não tem nada a fazer nesta matéria.",
    ],
  },
};

// ---------------------------------------------------------------------------
// M2 L3 — Monitorização, registos e SIEM (120 min, laboratório)
// ---------------------------------------------------------------------------
const M2L3: ConteudoLicao = {
  objectivos: [
    "Determinar, a partir da tabela de fontes fornecida, que registos recolher primeiro com orçamento limitado, justificando pela detecção que cada fonte permite.",
    "Reconstituir, a partir dos vinte registos fornecidos, a sequência de acontecimentos e identificar o momento exacto em que o acesso deixa de ser normal.",
    "Escrever duas regras de detecção com condição, limiar, janela temporal e acção esperada, e estimar o efeito de cada uma em falsos positivos.",
    "Executar, no ambiente de laboratório, a criação de uma regra de correlação e confirmar que ela dispara com dados de ensaio e não dispara com actividade normal.",
  ],
  explicacao: [
    "Detectar exige três coisas: registos que existam, registos que cheguem a um sítio central e alguém que olhe. Falta qualquer uma delas e a detecção não acontece. É comum encontrar instituições com registos em todas as máquinas e nenhuma detecção, porque ninguém os lê e porque ninguém os junta.",
    "Nem tudo se recolhe. Com orçamento e espaço limitados, a ordem que costuma dar melhor retorno é: autenticação (quem entrou, de onde, com que resultado), alterações de privilégios e de contas, registos dos sistemas expostos à internet, tráfego de saída da rede, e registos aplicacionais dos serviços críticos. Autenticação vem primeiro porque quase todos os incidentes passam por lá.",
    "Um SIEM é um sistema que recolhe registos de várias fontes, normaliza-os para um formato comum, correlaciona acontecimentos e gera alertas. O valor não está na ferramenta: está nas regras e em quem as afina. Um SIEM comprado e deixado com as regras de fábrica produz milhares de alertas irrelevantes, a equipa deixa de os ler, e o resultado é pior do que não ter nada — porque existe a ilusão de que se está a detectar.",
    "Uma regra de detecção útil tem quatro elementos: a condição (o que se procura), o limiar (a partir de que quantidade), a janela temporal (em quanto tempo) e a acção (alerta com que prioridade, para quem). Sem limiar e janela, a regra ou dispara sempre ou nunca. Escrever regras é um trabalho de equilíbrio: baixar o limiar aumenta a detecção e aumenta o ruído; subi-lo reduz o ruído e deixa passar. A decisão depende de quantas pessoas há para tratar alertas, e isso é uma conversa de gestão.",
    "Duas condições práticas fazem a diferença na análise. Primeira: horas sincronizadas em todas as máquinas, com fuso declarado — sem isso, a reconstituição da sequência é impossível e a evidência perde valor. Segunda: registos guardados fora da máquina de origem e protegidos contra alteração, porque quem compromete o sistema apaga o rasto local. Num centro de operações de segurança, mesmo pequeno, acrescenta-se uma terceira: uma lista escrita do que se faz em cada tipo de alerta, para que a resposta não dependa de quem está de serviço.",
  ],
  exemplo: {
    titulo: "Caso fictício: a madrugada de 3 de Setembro em Muteva",
    corpo: [
      "Entre as 02h11 e as 02h48 de 3 de Setembro, a conta «a.chirindza» — administradora de sistemas, que estava de férias — autenticou-se com sucesso no servidor de directório, a partir de um endereço nunca visto, depois de 41 tentativas falhadas em três minutos.",
      "Nos vinte minutos seguintes, foi criada uma conta nova, «svc_update», com privilégios de administração, e o serviço de envio de registos foi parado.",
      "Nada disto gerou alerta. Os registos existiam, estavam nas máquinas, e ninguém os lia. A descoberta foi feita onze dias depois, quando o serviço de cópias falhou por razão não relacionada e alguém foi ver porquê.",
    ],
  },
  tabela: {
    titulo: "Anexo A — Fontes de registo disponíveis e custo estimado (fictício)",
    nota: "Ficha de trabalho: escolher a ordem de recolha com espaço para 200 gigabytes por mês.",
    colunas: ["Fonte", "Volume mensal estimado", "O que permite detectar"],
    linhas: [
      ["Autenticação do directório de contas", "12 GB", "Tentativas falhadas, acessos fora de horas, contas novas"],
      ["Servidor web do portal (acessos)", "85 GB", "Exploração de aplicação, varredura, abuso de endereços"],
      ["Registos do sistema operativo dos servidores", "40 GB", "Alterações de configuração, paragem de serviços"],
      ["Tráfego de saída da rede (resumos)", "30 GB", "Ligações a destinos suspeitos, exfiltração"],
      ["Registos da aplicação de processos", "55 GB", "Acessos a processos, exportações em massa"],
      ["Registos dos postos de atendimento", "120 GB", "Execução de programas, ligação de dispositivos"],
      ["Registos do correio electrónico em nuvem", "18 GB", "Regras de reencaminhamento, acessos estranhos"],
      ["Equipamento de rede", "25 GB", "Alterações de configuração, portas activadas"],
    ],
  },
  anexos: [
    {
      titulo: "Anexo B — Vinte linhas de registo da madrugada de 3 de Setembro (fictícias)",
      nota:
        "Formato simplificado para leitura em papel: hora (fuso de Maputo, UTC+2), fonte, conta, acontecimento, origem.",
      corpo: [
        "02h08 — directório — a.chirindza — autenticação falhada — 41.x.y.z (endereço nunca visto)",
        "02h08 — directório — a.chirindza — autenticação falhada — 41.x.y.z",
        "02h09 — directório — a.chirindza — autenticação falhada (mais 37 tentativas em 3 minutos) — 41.x.y.z",
        "02h11 — directório — a.chirindza — autenticação com sucesso — 41.x.y.z",
        "02h12 — SRV-DIR — a.chirindza — sessão remota iniciada — 41.x.y.z",
        "02h14 — SRV-DIR — a.chirindza — leitura da lista de contas de administração — local",
        "02h19 — SRV-DIR — a.chirindza — criação da conta svc_update — local",
        "02h20 — SRV-DIR — a.chirindza — atribuição de privilégios de administração a svc_update — local",
        "02h23 — SRV-BD — svc_update — sessão iniciada — 10.20.3.30",
        "02h26 — SRV-BD — svc_update — exportação da tabela de processos (41 200 registos) — local",
        "02h31 — rede — — ligação de saída de 10.20.3.30 para destino externo, 2,4 GB transferidos — saída",
        "02h38 — SRV-DIR — a.chirindza — paragem do serviço de envio de registos — local",
        "02h39 — recolector — — deixam de chegar registos de SRV-DIR — —",
        "02h44 — SRV-FIC — svc_update — sessão iniciada — 10.20.3.30",
        "02h46 — SRV-FIC — svc_update — leitura de 3 100 ficheiros do arquivo — local",
        "02h48 — SRV-DIR — a.chirindza — sessão remota terminada — 41.x.y.z",
        "07h02 — directório — j.matola — autenticação com sucesso — 10.20.1.45 (posto habitual)",
        "07h05 — portal — — 1 200 acessos normais de cidadãos — internet",
        "08h30 — directório — r.sitoe — autenticação com sucesso — 10.20.1.12 (posto habitual)",
        "14 de Setembro, 09h10 — cópias — backup_svc — falha da cópia semanal — local",
      ],
    },
  ],
  actividade: {
    formato: "em grupos de três pessoas, com os anexos A e B em papel",
    enunciado: [
      "Passo 1 (15 minutos). Com espaço para 200 gigabytes por mês, escolham as fontes do anexo A a recolher primeiro e justifiquem cada escolha pela detecção que permite. Digam o que deixam de fora e que detecção perdem com isso.",
      "Passo 2 (25 minutos). Reconstituam a sequência do anexo B numa linha temporal. Marquem o momento em que deixa de ser actividade normal e escrevam a frase que justifica essa marcação. Identifiquem os três momentos em que um alerta deveria ter disparado e não disparou.",
      "Passo 3 (20 minutos). Escrevam duas regras de detecção com condição, limiar, janela e acção. Uma delas deve apanhar o início desta sequência. Para cada regra, estimem quantos alertas por semana geraria numa instituição com 62 funcionários e digam se a equipa consegue tratá-los.",
    ],
    produto:
      "Lista ordenada de fontes com justificação, linha temporal com o momento de ruptura e os três alertas em falta, e duas regras de detecção com estimativa de ruído.",
    rubrica: [
      "Autenticação e alterações de contas estão entre as primeiras fontes escolhidas; os registos dos postos, que são o maior volume, não ocupam o orçamento todo.",
      "O momento de ruptura está identificado às 02h11, na autenticação com sucesso após 41 falhas, a partir de endereço nunca visto e com a titular de férias.",
      "Entre os alertas em falta constam a criação de conta com privilégios às 02h19, a exportação em massa às 02h26 e a paragem do serviço de registos às 02h38.",
      "As regras têm os quatro elementos; nenhuma fica sem limiar nem sem janela.",
      "A estimativa de ruído é feita e confrontada com a capacidade real da equipa.",
    ],
  },
  laboratorio: {
    titulo: "Criar e ensaiar uma regra de correlação no recolector de registos",
    objectivo:
      "Configurar, no ambiente de laboratório, uma regra que dispare perante múltiplas autenticações falhadas seguidas de sucesso, e confirmar que dispara com os dados de ensaio e não dispara com actividade normal.",
    recursos: [
      "Máquina virtual «SIEM-LAB» com um recolector de registos de código aberto pré-instalado pelo formador, com interface de regras simples.",
      "Ficheiro de registos de ensaio «ensaio-03set.log» com as linhas do anexo B em formato normalizado, copiado para SIEM-LAB.",
      "Segundo ficheiro «ensaio-normal.log» com uma semana de actividade normal fictícia, para medir falsos positivos.",
      "Folha de laboratório com espaço para a regra escrita, o número de alertas em cada ensaio e a conclusão.",
    ],
    preparacao: [
      "Arrancar SIEM-LAB no dia anterior e confirmar que a interface de regras abre e que a importação de ficheiros funciona.",
      "Tirar instantâneo «inicial» com o recolector vazio, sem regras criadas.",
      "Confirmar que a hora da máquina virtual está correcta e com fuso declarado: sem isso a correlação por janela temporal não funciona.",
      "Confirmar o isolamento da rede virtual.",
    ],
    passos: [
      "Importar «ensaio-normal.log» e confirmar que o recolector mostra os acontecimentos e que não existe nenhuma regra activa.",
      "Criar a regra escrita no passo 3 da actividade: cinco ou mais autenticações falhadas da mesma conta em dez minutos, seguidas de uma autenticação com sucesso da mesma conta na mesma janela, com acção de alerta de prioridade alta.",
      "Correr a regra sobre «ensaio-normal.log» e registar quantos alertas gera. Este número é a estimativa de falsos positivos.",
      "Importar «ensaio-03set.log» e correr a mesma regra; registar se o alerta dispara e a que hora corresponde.",
      "Criar uma segunda regra para a criação de conta com privilégios de administração fora do horário de expediente e correr sobre os dois ficheiros.",
      "Registar na folha as duas regras, os quatro números de alertas obtidos e a conclusão sobre a capacidade de tratamento.",
    ],
    verificacaoSucesso: [
      "A primeira regra dispara sobre «ensaio-03set.log» e o alerta aponta para as 02h11.",
      "A mesma regra gera zero ou muito poucos alertas sobre «ensaio-normal.log»; se gerar muitos, o grupo ajusta o limiar e volta a correr, registando as duas versões.",
      "A segunda regra dispara na criação de svc_update às 02h19.",
      "A folha de laboratório tem as regras escritas e os quatro números registados, assinada pelo grupo.",
    ],
    reversao: [
      "Apagar as regras criadas e os ficheiros importados.",
      "Restaurar o instantâneo «inicial» de SIEM-LAB.",
      "Confirmar que o recolector volta a abrir sem regras, o que prova a reposição.",
    ],
    alternativaOffline: [
      "Correr a regra à mão sobre as vinte linhas impressas do anexo B, marcando as linhas que a satisfazem.",
      "Fazer o mesmo sobre uma amostra impressa de trinta linhas de actividade normal fornecida pelo formador e contar falsos positivos.",
      "Escrever o ajuste de limiar que faria e recontar à mão.",
      "Registar a lição como análise documental e o laboratório como pendente, a reagendar.",
    ],
  },
  sintese: [
    "Para detectar é preciso ter registos, juntá-los num sítio e alguém olhar. Faltando uma, não há detecção.",
    "Recolher primeiro autenticação e alterações de contas: quase tudo passa por aí.",
    "Uma regra precisa de condição, limiar, janela e acção.",
    "Regra sem afinação enche a equipa de alertas e ninguém lê nenhum.",
    "Horas certas e registos guardados fora da máquina. Quem entra apaga o que está na máquina.",
  ],
  verificacao: [
    {
      pergunta:
        "Porque é que às 02h11 o acesso deixa de poder ser tratado como normal, se a autenticação teve sucesso com a palavra-passe certa?",
      resposta:
        "Porque o sucesso vem depois de 41 tentativas falhadas em três minutos, a partir de um endereço nunca visto, de madrugada, numa conta cuja titular está de férias. O sucesso da autenticação prova que a credencial estava correcta, não que era a titular a usá-la.",
      feedback:
        "Autenticação com sucesso não é sinónimo de pessoa legítima. A detecção vive do contexto: hora, origem, sequência e comportamento.",
    },
    {
      pergunta:
        "A regra nova gerou 180 alertas numa semana de actividade normal. A equipa tem duas pessoas. O que se faz?",
      resposta:
        "Afina-se antes de a pôr em serviço: subir o limiar, restringir a origens externas, excluir contas de serviço conhecidas ou reduzir a janela. Depois volta-se a medir. Pôr em serviço uma regra que a equipa não consegue tratar leva ao abandono de todos os alertas.",
      feedback:
        "A capacidade de resposta faz parte do desenho da detecção. Uma regra boa que ninguém consegue acompanhar é uma regra má na prática.",
    },
  ],
  referencias: [NIST_CSF],
  guiao: {
    preparacao: [
      "Arrancar SIEM-LAB em todos os computadores no dia anterior e confirmar a importação de ficheiros.",
      "Imprimir os anexos A e B por grupo e preparar a amostra de actividade normal para a alternativa offline.",
      "Confirmar hora e fuso nas máquinas virtuais.",
    ],
    conducao: [
      "Ler a linha temporal da madrugada de 3 de Setembro e perguntar em que minuto teriam gostado de receber uma mensagem.",
      "Expor as três condições da detecção, a ordem de recolha de fontes, o que é um SIEM e os quatro elementos de uma regra, terminando com horas sincronizadas e registos fora da máquina.",
      "Conduzir os três passos em papel e só depois o laboratório; exigir a medição de falsos positivos antes da regra ser dada por boa.",
      "Dois grupos apresentam as regras e os números. Fechar com a relação entre limiar, ruído e capacidade da equipa.",
    ],
    criterios: [
      "Ordem de recolha justificada e dentro do orçamento.",
      "Momento de ruptura correctamente identificado.",
      "Regras com os quatro elementos e ruído medido.",
      "Laboratório com os quatro números registados.",
    ],
    errosComuns: [
      "Gastar todo o orçamento nos registos dos postos de atendimento.",
      "Escrever regras sem limiar nem janela.",
      "Dar a regra por boa sem a correr sobre actividade normal.",
      "Esquecer que os registos locais de SRV-DIR já não são fiáveis depois das 02h38.",
    ],
  },
};

// ---------------------------------------------------------------------------
// M2 L4 — Malware, ameaças avançadas e forense básica (120 min, laboratório)
// ---------------------------------------------------------------------------
const M2L4: ConteudoLicao = {
  objectivos: [
    "Distinguir, com um exemplo de cada, as famílias de software malicioso pelo efeito que produzem e pelo modo de propagação, e situá-las nas fases de uma intrusão prolongada.",
    "Extrair da ficha fornecida os indicadores de compromisso e classificá-los por durabilidade, explicando por que razão um endereço muda com facilidade e um resumo de ficheiro não.",
    "Executar, em ambiente isolado e sem qualquer amostra de software malicioso real, a recolha ordenada de evidência volátil e não volátil, registando resumos criptográficos e cadeia de custódia.",
    "Escrever a primeira página de um relatório forense com factos observados, separando-os das hipóteses e indicando o que não foi possível determinar.",
  ],
  explicacao: [
    "Começar pelo essencial: nesta lição não se descarrega, não se distribui e não se executa software malicioso real. Trabalha-se sobre indicadores, registos, descrições e ficheiros inertes preparados para formação. Quem quiser trabalhar com amostras reais precisa de ambiente dedicado, isolado fisicamente, com procedimento aprovado e autorização própria — não é matéria de sala de formação.",
    "As famílias distinguem-se pelo efeito e pela propagação. Software de resgate cifra ficheiros e exige pagamento, e hoje quase sempre exfiltra dados antes de cifrar, para pressionar mesmo quem tem cópias. Porta traseira mantém acesso ao sistema. Ladrão de credenciais recolhe palavras-passe e testemunhos de sessão. Verme propaga-se sozinho pela rede; cavalo de Tróia depende de alguém o executar. Minerador consome recursos e é frequentemente o primeiro sinal visível de uma intrusão que entrou por outra via.",
    "Ameaça avançada persistente descreve menos uma ferramenta e mais um modo de operar: acesso inicial discreto, permanência prolongada, movimentação lateral, recolha paciente. As fases repetem-se: acesso inicial, execução, persistência, elevação de privilégios, evasão, recolha de credenciais, reconhecimento interno, movimentação lateral, recolha de dados, exfiltração e impacto. Reconhecer a fase em que se está muda a resposta — quem encontra sinais de reconhecimento interno tem tempo; quem encontra exfiltração em curso não tem.",
    "Indicadores de compromisso não valem todos o mesmo. Um endereço de rede muda num minuto. Um nome de domínio muda em horas. Um resumo criptográfico de um ficheiro muda se o ficheiro mudar um bit, mas identifica exactamente aquele ficheiro. Uma regra que descreve comportamento — «processo do servidor web a lançar interpretador de comandos» — é a mais duradoura, porque descreve o que o atacante precisa de fazer, não a ferramenta que usou desta vez.",
    "Na forense básica, três regras comandam tudo. Primeira, ordem de volatilidade: recolhe-se primeiro o que desaparece — memória, ligações de rede activas, processos em execução, sessões abertas — e só depois o que fica em disco. Segunda, integridade: calcula-se o resumo criptográfico de cada peça recolhida no momento da recolha e trabalha-se sobre cópias, nunca sobre o original. Terceira, cadeia de custódia: quem recolheu, quando, de onde, onde ficou guardado e quem lhe tocou desde então. Uma evidência sem cadeia de custódia pode continuar tecnicamente correcta e ser inútil para efeitos disciplinares ou judiciais. Se houver hipótese de processo, a decisão sobre o que fazer a seguir envolve a direcção e a área jurídica — o técnico recolhe e preserva, não decide sozinho.",
  ],
  exemplo: {
    titulo: "Caso fictício: o que se encontrou em SRV-BD a 14 de Setembro",
    corpo: [
      "Depois da falha da cópia semanal, a administradora olhou para SRV-BD e encontrou um processo chamado «updatesvc» a correr desde 3 de Setembro, a partir de uma pasta temporária, com o utilizador svc_update.",
      "O processo mantinha uma ligação estabelecida para um endereço externo na porta 443, e havia uma tarefa agendada que o voltava a lançar ao arranque. O ficheiro tinha 4,2 megabytes e data de criação de 3 de Setembro às 02h24.",
      "Nenhum antivírus assinalou nada. Isto é comum e não significa que o antivírus esteja avariado: detecção por assinatura não apanha ficheiros que nunca viu, e é por isso que o comportamento — um processo desconhecido a correr de pasta temporária com ligação permanente para fora — vale mais do que a ausência de alerta.",
    ],
  },
  tabela: {
    titulo: "Anexo A — Indicadores recolhidos no caso (fictícios)",
    nota: "Ficha de trabalho. A coluna «Durabilidade» é preenchida na actividade.",
    colunas: ["Indicador", "Valor observado", "Onde foi observado", "Durabilidade"],
    linhas: [
      ["Endereço externo de destino", "203.0.113.45 (bloco reservado a documentação)", "Registos de rede, 02h31", ""],
      ["Nome de domínio contactado", "actualizacoes-sistema.example", "Consulta de nomes, 02h30", ""],
      ["Nome do ficheiro", "updatesvc", "Pasta temporária de SRV-BD", ""],
      ["Resumo criptográfico do ficheiro", "sha256: a1b2…（valor fictício de exercício）", "SRV-BD", ""],
      ["Conta utilizada", "svc_update", "SRV-DIR e SRV-BD", ""],
      ["Tarefa agendada", "«Actualização de sistema» às 00h05 diárias", "SRV-BD", ""],
      ["Comportamento", "Processo de pasta temporária com ligação permanente de saída", "SRV-BD", ""],
      ["Hora de criação do ficheiro", "3 de Setembro, 02h24 (UTC+2)", "Sistema de ficheiros", ""],
    ],
  },
  anexos: [
    {
      titulo: "Anexo B — Folha de cadeia de custódia (modelo a preencher)",
      nota: "Modelo fictício de trabalho. Uma folha por peça de evidência recolhida.",
      corpo: [
        "Peça n.º ___ | Descrição da peça: ___ | Origem (máquina, caminho): ___",
        "Data e hora da recolha, com fuso: ___ | Recolhida por (nome e função): ___",
        "Método de recolha e ferramenta usada: ___ | Resumo criptográfico no momento da recolha: ___",
        "Onde ficou guardada: ___ | Quem tem acesso: ___",
        "Transferências: de ___ para ___, em ___, motivo ___, resumo verificado (sim/não) ___",
        "Observações e limitações: ___",
      ],
    },
  ],
  actividade: {
    formato: "em grupos de três pessoas, com os anexos A e B em papel",
    enunciado: [
      "Passo 1 (15 minutos). Classifiquem a durabilidade de cada indicador do anexo A em baixa, média ou alta e escrevam, para os três de durabilidade mais alta, como os usariam para procurar o mesmo problema noutras máquinas.",
      "Passo 2 (20 minutos). Escrevam a ordem de recolha de evidência em SRV-BD, do mais volátil ao menos volátil, listando pelo menos oito peças. Ao lado de cada uma, digam o que se perde se for recolhida tarde.",
      "Passo 3 (25 minutos). Preencham a folha de cadeia de custódia do anexo B para duas peças, com dados do caso, e escrevam a primeira página do relatório com três secções separadas: factos observados, hipóteses em avaliação, e o que não foi possível determinar.",
    ],
    produto:
      "Anexo A com durabilidades, lista ordenada de recolha com justificação, duas folhas de custódia preenchidas e a primeira página do relatório com as três secções.",
    rubrica: [
      "O endereço e o domínio são classificados como durabilidade baixa; o resumo do ficheiro média; o comportamento alta.",
      "A ordem de recolha começa pela memória, ligações activas, processos e sessões, e só depois passa ao disco e aos registos.",
      "As folhas de custódia estão completas, com hora, fuso, método, resumo e responsável nomeado.",
      "A secção de factos não contém hipóteses; a de hipóteses está marcada como tal; a terceira secção existe e é honesta.",
      "O relatório não afirma a identidade de quem atacou nem conclui por prova que não foi recolhida.",
    ],
  },
  laboratorio: {
    titulo: "Recolha ordenada de evidência em máquina de laboratório, sem software malicioso real",
    objectivo:
      "Executar a recolha de evidência volátil e não volátil numa máquina virtual preparada, calculando resumos criptográficos e preenchendo a cadeia de custódia, sem qualquer amostra de software malicioso.",
    recursos: [
      "Máquina virtual «SRV-BD-LAB» preparada pelo formador com um processo inofensivo de demonstração, chamado «updatesvc», que apenas escreve a hora num ficheiro de texto e mantém uma ligação a outra máquina do laboratório. Não é software malicioso e o seu código-fonte é entregue impresso.",
      "Máquina virtual «EST-FORENSE» com ferramentas de linha de comandos para listar processos, ligações e utilizadores, e para calcular resumos criptográficos.",
      "Disco virtual de recolha, vazio, montado em EST-FORENSE para guardar as peças.",
      "Folhas de cadeia de custódia impressas, em número suficiente, e a ficha de comandos equivalentes para o sistema usado.",
    ],
    preparacao: [
      "Arrancar as máquinas no dia anterior e confirmar que o processo de demonstração arranca e que a ligação entre as duas máquinas se estabelece.",
      "Tirar instantâneo «inicial» das duas máquinas.",
      "Confirmar o isolamento da rede virtual e que nenhuma máquina alcança a internet.",
      "Mostrar à turma, antes de começar, o código-fonte impresso do processo de demonstração, para que fique claro que não há software malicioso envolvido.",
    ],
    passos: [
      "Registar a hora do sistema das duas máquinas e o fuso, e anotá-la na folha: é a primeira peça.",
      "Em SRV-BD-LAB, recolher a lista de processos em execução, as ligações de rede estabelecidas e as sessões abertas, gravando a saída em ficheiros no disco de recolha.",
      "Calcular o resumo criptográfico de cada ficheiro de saída imediatamente após a recolha e anotá-lo na folha de custódia correspondente.",
      "Recolher a tarefa agendada de demonstração e o ficheiro do processo, calculando também os respectivos resumos.",
      "Copiar os registos do sistema relevantes ao período e calcular o resumo do conjunto.",
      "Preencher uma folha de custódia por peça, com hora, método, responsável e local de guarda, e verificar no fim que todos os resumos anotados coincidem com os ficheiros no disco de recolha.",
    ],
    verificacaoSucesso: [
      "Existem pelo menos seis peças recolhidas, cada uma com folha de custódia preenchida e resumo anotado.",
      "A verificação final mostra que todos os resumos coincidem: nenhuma peça foi alterada depois da recolha.",
      "A ordem registada nas folhas respeita a volatilidade: hora e estado em memória antes dos ficheiros em disco.",
      "Outra pessoa da sala consegue, lendo apenas as folhas, dizer de onde veio cada peça e quem lhe tocou.",
    ],
    reversao: [
      "Restaurar o instantâneo «inicial» nas duas máquinas.",
      "Apagar o conteúdo do disco virtual de recolha depois de as folhas estarem preenchidas e recolhidas pelo formador.",
      "Confirmar que SRV-BD-LAB volta ao estado inicial com o processo de demonstração activo.",
    ],
    alternativaOffline: [
      "Trabalhar sobre as saídas impressas de processos, ligações e sessões fornecidas pelo formador, identificando o que estaria a mais.",
      "Preencher as folhas de custódia com os dados impressos, incluindo os resumos fornecidos, e verificar a coerência entre folhas.",
      "Escrever a ordem de recolha que teria seguido e o que se perderia em cada peça recolhida tarde.",
      "Registar a lição como análise documental e o laboratório como pendente, a reagendar.",
    ],
  },
  sintese: [
    "Nesta formação não se usa software malicioso real. Trabalha-se com indicadores, registos e ficheiros inertes.",
    "Recolher primeiro o que desaparece: memória, ligações, processos, sessões. Só depois o disco.",
    "Calcular o resumo na hora da recolha e trabalhar sempre sobre cópias.",
    "Sem cadeia de custódia, a evidência pode estar certa e não servir para nada.",
    "Endereços mudam depressa; o comportamento descrito dura muito mais.",
  ],
  verificacao: [
    {
      pergunta:
        "O antivírus não assinalou o ficheiro encontrado em SRV-BD. Isso permite concluir que o ficheiro é inofensivo?",
      resposta:
        "Não. A detecção por assinatura só reconhece o que já viu antes. Um ficheiro novo ou alterado passa sem alerta. A avaliação faz-se pelo comportamento observado e pelo contexto: processo desconhecido, a correr de pasta temporária, criado às 02h24 por uma conta criada nessa madrugada, com ligação permanente para fora.",
      feedback:
        "Ausência de alerta não é prova de ausência de problema. É por isso que a detecção por comportamento e os registos valem mais do que a lista de assinaturas.",
    },
    {
      pergunta:
        "A equipa desligou imediatamente o servidor para «parar o ataque». Que consequência tem esta decisão para a análise?",
      resposta:
        "Perde-se toda a evidência volátil: memória, processos em execução, ligações activas e sessões abertas. Pode ser a decisão certa quando a exfiltração está em curso, mas é uma decisão de contenção que tem custo probatório e deve ser tomada com consciência disso e registada.",
      feedback:
        "Conter e preservar entram em conflito. A escolha faz-se com critério escrito antes, e não no momento de pânico.",
    },
  ],
  referencias: [NIST_CSF, CISA_KEV],
  guiao: {
    preparacao: [
      "Preparar as máquinas e o processo de demonstração inofensivo; imprimir o seu código-fonte para mostrar à turma.",
      "Imprimir folhas de custódia em quantidade e as saídas para a alternativa offline.",
      "Reforçar na abertura a regra de não usar software malicioso real, incluindo a proibição de trazer amostras.",
    ],
    conducao: [
      "Descrever o que se encontrou em SRV-BD e perguntar à sala o que fariam primeiro. Guardar as respostas para confrontar no fim.",
      "Expor famílias, fases da intrusão, durabilidade dos indicadores e as três regras da forense básica.",
      "Conduzir a parte em papel, depois o laboratório com recolha ordenada e resumos; verificar folhas de custódia grupo a grupo.",
      "Dois grupos leem a primeira página do relatório. Fechar com o conflito entre conter e preservar.",
    ],
    criterios: [
      "Durabilidades correctamente atribuídas.",
      "Ordem de recolha respeitada no laboratório.",
      "Folhas de custódia completas e resumos coincidentes na verificação final.",
      "Relatório com factos, hipóteses e limitações separados.",
    ],
    errosComuns: [
      "Começar a recolha pelos ficheiros em disco e perder o estado em memória.",
      "Trabalhar sobre o original em vez de sobre cópia.",
      "Escrever hipóteses na secção de factos.",
      "Tentar identificar o autor do ataque a partir de um endereço de rede.",
    ],
  },
};

// ---------------------------------------------------------------------------
// M2 L5 — Resposta a incidentes: detecção, contenção e recuperação (120 min)
// ---------------------------------------------------------------------------
const M2L5: ConteudoLicao = {
  objectivos: [
    "Classificar os cinco incidentes fictícios por gravidade segundo a matriz fornecida e justificar cada classificação pelos efeitos no serviço e nos dados.",
    "Decidir, para o incidente do caso, a sequência de contenção imediata, erradicação e recuperação, indicando em cada passo o que se perde e o que se ganha.",
    "Definir o critério de regresso ao serviço, com as verificações que têm de estar cumpridas antes de repor cada sistema.",
    "Escrever o registo cronológico de decisões do incidente, com hora, decisão, fundamento e responsável.",
  ],
  explicacao: [
    "Responder a um incidente é uma sequência com seis momentos: preparação, detecção e análise, contenção, erradicação, recuperação e lições aprendidas. A preparação é a única que se faz antes e é a que determina se as outras correm bem. Quem não tem lista de contactos, acessos de emergência, cópias verificadas e critérios escritos, decide tudo no pior momento possível.",
    "Contenção divide-se em imediata e de médio prazo. A imediata trava a hemorragia: isolar a máquina da rede, suspender contas comprometidas, bloquear a comunicação de saída para o destino observado, revogar sessões activas. A de médio prazo mantém o serviço a funcionar de forma degradada enquanto se prepara a erradicação. Isolar não é sempre desligar — desligar apaga a evidência volátil, e por vezes é preferível cortar a ligação de rede mantendo a máquina ligada.",
    "Erradicar é retirar a presença do atacante: eliminar contas criadas, tarefas agendadas, chaves de acesso e componentes instalados; corrigir o caminho de entrada; e trocar todas as credenciais que possam ter sido comprometidas. Se o caminho de entrada não for corrigido, a recuperação limita-se a devolver ao atacante um sistema arrumado. Quando a profundidade do compromisso não é conhecida, a única via defensável é reinstalar a partir de fonte de confiança e restaurar dados de cópia anterior ao incidente.",
    "Recuperar é repor o serviço com critério, não à pressa. Cada sistema só regressa quando se confirma que as credenciais foram trocadas, que o caminho de entrada foi fechado, que a vigilância reforçada está activa e que os dados restaurados são anteriores ao comprometimento. A ordem de reposição segue as dependências: primeiro identidades, depois dados, depois aplicações, por fim o acesso do público.",
    "Duas coisas correm sempre mal quando não estão escritas antes. Primeira, quem decide: numa madrugada, sem decisor identificado, ou não se decide nada ou decide quem não tem mandato. Segunda, o registo cronológico: se não for escrito em tempo real, no dia seguinte ninguém reconstitui as horas, e a reconstituição é o que permite aprender e responder a quem pergunta.",
  ],
  exemplo: {
    titulo: "Caso fictício: 14 de Setembro, 09h20, sala de reunião de Muteva",
    corpo: [
      "Onze dias depois da madrugada de 3 de Setembro, a equipa percebe o que aconteceu: conta de administração comprometida, conta nova com privilégios, exportação de 41 200 registos de processos, 2,4 gigabytes enviados para fora, registos parados e um processo desconhecido a correr desde então em SRV-BD.",
      "São 09h20 de uma segunda-feira. Os balcões estão abertos, com 60 pessoas em fila. A cópia semanal falhou na sexta-feira; a última cópia verificada é de 29 de Agosto, anterior ao incidente.",
      "A direcção pergunta três coisas: fechamos o atendimento? em quanto tempo volta? e temos de comunicar a alguém? A equipa tem de responder com critério e não com adivinhação.",
    ],
  },
  tabela: {
    titulo: "Anexo A — Matriz de gravidade e cinco incidentes para classificar (fictícios)",
    nota:
      "Escala: G1 baixo, G2 moderado, G3 alto, G4 crítico. Os critérios estão na primeira linha; a coluna «Gravidade» é preenchida na actividade.",
    colunas: ["Situação", "Serviço afectado", "Dados envolvidos", "Gravidade"],
    linhas: [
      ["Critério de referência", "G1 sem impacto; G2 degradação parcial; G3 paragem de serviço ao público; G4 paragem prolongada ou dados de cidadãos comprometidos", "—", "—"],
      ["I-1: Uma pessoa recebeu mensagem fraudulenta e não clicou; comunicou de imediato", "Nenhum", "Nenhum", ""],
      ["I-2: Posto de atendimento com programa indesejado instalado, sem acesso a servidores", "Um balcão mais lento", "Nenhum conhecido", ""],
      ["I-3: Exportação de 41 200 processos por conta comprometida e envio para fora", "Serviço a funcionar", "Dados de cidadãos exfiltrados", ""],
      ["I-4: Corte de energia de seis horas na sala técnica, sem gerador", "Paragem total do atendimento", "Nenhum", ""],
      ["I-5: Conta de correio de uma chefia com regra de reencaminhamento criada por terceiro", "Nenhum visível", "Correspondência interna copiada", ""],
    ],
  },
  anexos: [
    {
      titulo: "Anexo B — Estado dos recursos no momento da decisão (fictício)",
      nota: "Material de entrada da actividade.",
      corpo: [
        "Última cópia verificada dos processos: 29 de Agosto, restaurada com sucesso num ensaio feito nesse dia.",
        "Cópia de 12 de Setembro: existe, nunca foi restaurada; é posterior ao comprometimento.",
        "Registos de SRV-DIR: interrompidos entre 3 e 14 de Setembro, por paragem do serviço de envio.",
        "Registos do recolector central: existem para as outras máquinas, sem interrupção.",
        "Equipa disponível: três pessoas, uma das quais de férias e contactável.",
        "Contactos: existe lista de telefones actualizada; não existe canal alternativo caso o correio institucional fique indisponível.",
        "Atendimento: dois balcões abertos, com atendimento manual possível em papel, a metade do ritmo.",
      ],
    },
  ],
  actividade: {
    formato: "em grupos de três pessoas, com os anexos A e B, em exercício de mesa",
    enunciado: [
      "Passo 1 (15 minutos). Classifiquem os cinco incidentes do anexo A e justifiquem cada gravidade numa linha. Digam também qual deles obrigaria a acordar alguém de madrugada.",
      "Passo 2 (25 minutos). Para o caso das 09h20, escrevam a sequência de contenção imediata, com hora prevista para cada acção, dizendo em cada uma o que se ganha e o que se perde. Decidam explicitamente se o atendimento fecha ou continua em modo degradado, e fundamentem.",
      "Passo 3 (20 minutos). Escrevam o critério de regresso ao serviço para cada sistema, indicando a ordem de reposição e as verificações obrigatórias antes de cada reposição. Decidam que cópia usar, entre a de 29 de Agosto e a de 12 de Setembro, e justifiquem.",
    ],
    produto:
      "Matriz preenchida com justificações, plano de contenção com horas e trocas explicitadas, e critério de regresso ao serviço com ordem de reposição e escolha de cópia fundamentada.",
    rubrica: [
      "I-3 é classificado como G4 por envolver dados de cidadãos exfiltrados, apesar de o serviço continuar a funcionar.",
      "A contenção prevê isolar sem desligar quando ainda houver evidência volátil a recolher, e diz o que se perde em cada opção.",
      "A decisão sobre o atendimento é fundamentada e considera o atendimento manual em papel como alternativa.",
      "A cópia escolhida é a de 29 de Agosto, por ser anterior ao comprometimento e ter restauro verificado; escolher a de 12 de Setembro sem verificação é assinalado como risco de restaurar o problema.",
      "A ordem de reposição começa pelas identidades e termina no acesso do público.",
      "O grupo escreve que a comunicação a entidades externas é decisão da direcção com apoio jurídico, sem inventar prazos legais.",
    ],
  },
  sintese: [
    "Seis momentos: preparar, detectar, conter, erradicar, recuperar, aprender. Preparar é o único que se faz antes.",
    "Conter é travar já. Isolar da rede nem sempre é desligar: desligar apaga a memória.",
    "Erradicar é tirar contas, tarefas e chaves do atacante e fechar a porta de entrada.",
    "Só se repõe um sistema quando as credenciais mudaram e a porta está fechada.",
    "Escrever hora, decisão, motivo e quem decidiu, enquanto acontece.",
  ],
  verificacao: [
    {
      pergunta:
        "Há uma cópia de 12 de Setembro, mais recente, e uma de 29 de Agosto, verificada. Qual se usa para restaurar a base de dados?",
      resposta:
        "A de 29 de Agosto. É anterior ao comprometimento de 3 de Setembro e o seu restauro já foi verificado. A de 12 de Setembro é posterior ao compromisso e pode conter as alterações do atacante; além disso nunca foi restaurada, pelo que não se sabe se funciona.",
      feedback:
        "Restaurar uma cópia posterior à intrusão pode repor a presença do atacante. A perda de dados entre as duas datas trata-se depois, com reconciliação a partir dos registos disponíveis.",
    },
    {
      pergunta:
        "A equipa quer repor o portal de marcação primeiro, porque é o que o público vê. Faz sentido?",
      resposta:
        "Não. A ordem segue as dependências e o risco: primeiro identidades, com credenciais trocadas e contas do atacante eliminadas; depois dados restaurados de cópia limpa; depois aplicações; e só no fim o acesso do público. Repor o portal antes disso expõe de novo um sistema ainda comprometido.",
      feedback:
        "A pressão para mostrar serviço reposto é real e tem de ser respondida com prazo comunicado e serviço degradado, não com reposição prematura.",
    },
  ],
  referencias: [NIST_CSF],
  guiao: {
    preparacao: [
      "Imprimir os anexos A e B por grupo e preparar um relógio visível para o exercício de mesa.",
      "Preparar três perguntas da direcção para interromper os grupos a meio, simulando pressão.",
      "Rever a decisão sobre as cópias, que é o ponto de aprendizagem central.",
    ],
    conducao: [
      "Ler o cenário das 09h20 com as três perguntas da direcção e dar dois minutos de silêncio para cada pessoa escrever a sua primeira acção.",
      "Expor os seis momentos, contenção imediata e de médio prazo, erradicação com fecho do caminho de entrada e critério de regresso ao serviço.",
      "Conduzir o exercício de mesa interrompendo com as perguntas da direcção; exigir horas nas acções e registo cronológico.",
      "Dois grupos apresentam o plano. Fechar com a escolha da cópia e com o registo de decisões como obrigação, não formalidade.",
    ],
    criterios: [
      "Classificações de gravidade justificadas pelos efeitos.",
      "Contenção com trocas explicitadas entre conter e preservar.",
      "Critério de regresso ao serviço completo e ordenado.",
      "Escolha de cópia fundamentada.",
    ],
    errosComuns: [
      "Desligar tudo de imediato e perder a evidência volátil.",
      "Restaurar a cópia mais recente sem verificar se é anterior ao incidente.",
      "Repor o serviço público antes de trocar credenciais.",
      "Prometer prazos de comunicação externa sem base e sem a área jurídica.",
    ],
  },
};

export const LICOES_M2: Record<string, ConteudoLicao> = {
  m2l1: M2L1,
  m2l2: M2L2,
  m2l3: M2L3,
  m2l4: M2L4,
  m2l5: M2L5,
};
