#!/bin/bash
# Ensaio isolado da FAQ e dos pedidos de suporte (dados fictícios).
PSQL="psql -h ${PGDIR} -p ${PGPORTA} -U postgres -d postgres -X -q -t -A"
AD=00000000-0000-0000-0000-0000000000ad; A=00000000-0000-0000-0000-0000000000f1; B=00000000-0000-0000-0000-0000000000f2
falhas=0
verificar() { [ "$2" = "$3" ] && echo "  OK    $1" || { echo "  FALHA $1 (obtido: $2; esperado: $3)"; falhas=$((falhas+1)); }; }
como() { $PSQL <<SQL 2>&1 | tail -1
SET ROLE ${3:-authenticated};
SELECT set_config('request.jwt.claim.sub', '$1', false);
$2
SQL
}
echo "1. FAQ"
como $AD "INSERT INTO public.faq_perguntas(pergunta,resposta,publicada) VALUES ('Pergunta ficticia publicada?','Resposta ficticia.',true),('Pergunta ficticia rascunho?','Resposta ficticia.',false);" >/dev/null
verificar "visitante sem sessão vê só a publicada" "$(como '' "SELECT count(*) FROM public.faq_perguntas;" anon)" "1"
verificar "formando vê só a publicada" "$(como $A "SELECT count(*) FROM public.faq_perguntas;")" "1"
verificar "formando não cria pergunta" "$(como $A "INSERT INTO public.faq_perguntas(pergunta,resposta) VALUES ('Intrusa aqui','Intrusa aqui');" | grep -c 'row-level security')" "1"
verificar "visitante não altera" "$(como '' "UPDATE public.faq_perguntas SET publicada=true;" anon | grep -c 'permission denied')" "1"
verificar "admin vê as duas" "$(como $AD "SELECT count(*) FROM public.faq_perguntas;")" "2"
echo "2. Pedidos de suporte"
verificar "formando A cria pedido" "$(como $A "INSERT INTO public.pedidos_suporte(categoria,assunto,mensagem) VALUES ('acesso','Assunto ficticio','Mensagem ficticia') RETURNING estado;" | head -1)" "aberto"
verificar "A não cria pedido em nome de B" "$(como $A "INSERT INTO public.pedidos_suporte(autor_id,categoria,assunto,mensagem) VALUES ('$B','acesso','Falso','Mensagem falsa');" | grep -c 'row-level security')" "1"
verificar "A não cria pedido já resolvido" "$(como $A "INSERT INTO public.pedidos_suporte(categoria,assunto,mensagem,estado) VALUES ('acesso','Falso','Mensagem falsa','resolvido');" | grep -c 'row-level security')" "1"
verificar "B não vê o pedido de A" "$(como $B "SELECT count(*) FROM public.pedidos_suporte;")" "0"
verificar "A não altera o próprio estado" "$(como $A "WITH u AS (UPDATE public.pedidos_suporte SET estado='resolvido' RETURNING 1) SELECT count(*) FROM u;")" "0"
verificar "admin responde" "$(como $AD "WITH u AS (UPDATE public.pedidos_suporte SET estado='resolvido', resposta='Resposta ficticia' RETURNING 1) SELECT count(*) FROM u;")" "1"
verificar "A vê a resposta" "$(como $A "SELECT resposta FROM public.pedidos_suporte;")" "Resposta ficticia"
verificar "visitante sem sessão sem acesso" "$(como '' "SELECT count(*) FROM public.pedidos_suporte;" anon | grep -c 'permission denied')" "1"
echo "3. Registo"
verificar "FAQ: 2 inserções registadas pelo admin" "$(como $AD "SET ROLE postgres; SELECT count(*) FROM public.registo_auditoria WHERE entidade='faq_perguntas' AND utilizador_id='$AD';")" "2"
verificar "pedido: criação por A e resposta pelo admin" "$(como $AD "SET ROLE postgres; SELECT string_agg(accao||':'||(utilizador_id='$AD')::text, ',' ORDER BY ocorrido_em, accao) FROM public.registo_auditoria WHERE entidade='pedidos_suporte';")" "insert:false,update:true"
echo; [ $falhas -eq 0 ] && echo "RESULTADO: todos os testes passaram" || { echo "RESULTADO: $falhas falha(s)"; exit 1; }
