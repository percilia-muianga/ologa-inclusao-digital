#!/bin/bash
# Ensaio de ponta a ponta dos materiais das lições, com ficheiros fictícios,
# em base efémera. Cada passo abre uma ligação nova.
PSQL="psql -h ${PGDIR} -p ${PGPORTA} -U postgres -d postgres -X -q -t -A"
AD=00000000-0000-0000-0000-0000000000ad; FO=00000000-0000-0000-0000-0000000000f1
L=22ee0000-0000-0000-0000-000000000001
M1=33ee0000-0000-0000-0000-000000000001; M2=33ee0000-0000-0000-0000-000000000002; M3=33ee0000-0000-0000-0000-000000000003
falhas=0
verificar() { [ "$2" = "$3" ] && echo "  OK    $1" || { echo "  FALHA $1 (obtido: $2; esperado: $3)"; falhas=$((falhas+1)); }; }
como() { $PSQL <<SQL 2>&1 | tail -1
SET ROLE ${3:-authenticated};
SELECT set_config('request.jwt.claim.sub', '$1', false);
$2
SQL
}
B="'materiais-licoes'"
echo "1. Anexar (Administrador Geral)"
verificar "ficheiros fictícios carregados" "$(como $AD "INSERT INTO storage.objects(bucket_id,name,conteudo) VALUES ($B,'$L/a.pdf','%PDF ficticio v1'),($B,'$L/v.mp4','video ficticio'),($B,'$L/v.vtt','WEBVTT') RETURNING 'ok';" | head -1)" "ok"
verificar "três materiais registados" "$(como $AD "INSERT INTO public.licao_materiais(id,licao_id,tipo,titulo,descricao_acessivel,ficheiro_path,nome_original,mime,tamanho_bytes,ordem,legenda_de) VALUES
 ('$M1','$L','pdf','Guia PDF','Guia de 2 páginas','$L/a.pdf','guia.pdf','application/pdf',10,1,NULL),
 ('$M2','$L','video','Vídeo','Demonstração','$L/v.mp4','v.mp4','video/mp4',10,2,NULL),
 ('$M3','$L','legenda','Legendas PT',NULL,'$L/v.vtt','v.vtt','text/vtt',6,3,'$M2'); SELECT count(*) FROM public.licao_materiais WHERE NOT disponivel;")" "3"
verificar "formando não pode anexar" "$(como $FO "INSERT INTO public.licao_materiais(licao_id,tipo,titulo,ficheiro_path,nome_original,mime,tamanho_bytes) VALUES ('$L','pdf','Intruso','$L/x.pdf','x.pdf','application/pdf',1);" | grep -c 'row-level security')" "1"
verificar "formando não pode carregar ficheiros" "$(como $FO "INSERT INTO storage.objects(bucket_id,name) VALUES ($B,'$L/x.pdf');" | grep -c 'row-level security')" "1"

echo "2. Indisponível: formando não vê registo nem obtém ficheiro por acesso directo"
verificar "formando vê 0 materiais" "$(como $FO "SELECT count(*) FROM public.licao_materiais;")" "0"
verificar "formando obtém 0 ficheiros pelo caminho" "$(como $FO "SELECT count(*) FROM storage.objects WHERE name='$L/a.pdf';")" "0"
verificar "sem sessão (anon) sem acesso" "$(como '' "SELECT count(*) FROM storage.objects;" anon | grep -c 'permission denied')" "1"

echo "3. Disponibilizar"
como $AD "UPDATE public.licao_materiais SET disponivel=true, versao=versao+1 WHERE licao_id='$L';" >/dev/null
verificar "formando vê 3 materiais" "$(como $FO "SELECT count(*) FROM public.licao_materiais;")" "3"
verificar "formando obtém o PDF" "$(como $FO "SELECT conteudo FROM storage.objects WHERE name='$L/a.pdf';")" "%PDF ficticio v1"

echo "4. Substituir mantendo a versão anterior"
como $AD "INSERT INTO storage.objects(bucket_id,name,conteudo) VALUES ($B,'$L/a2.pdf','%PDF ficticio v2');" >/dev/null
verificar "substituição com versão correcta" "$(como $AD "UPDATE public.licao_materiais SET ficheiro_path='$L/a2.pdf', versao=versao+1 WHERE id='$M1' AND versao=2 RETURNING versao;" | head -1)" "3"
verificar "substituição concorrente (versão antiga) recusada" "$(como $AD "WITH u AS (UPDATE public.licao_materiais SET titulo='X' WHERE id='$M1' AND versao=2 RETURNING 1) SELECT count(*) FROM u;")" "0"
verificar "ficheiro anterior mantido no armazenamento" "$(como $AD "SELECT conteudo FROM storage.objects WHERE name='$L/a.pdf';")" "%PDF ficticio v1"
verificar "formando obtém a nova versão" "$(como $FO "SELECT conteudo FROM storage.objects WHERE name='$L/a2.pdf';")" "%PDF ficticio v2"
verificar "formando não obtém a versão anterior" "$(como $FO "SELECT count(*) FROM storage.objects WHERE name='$L/a.pdf';")" "0"

echo "5. Ordenar"
como $AD "UPDATE public.licao_materiais SET ordem=1 WHERE id='$M2'; UPDATE public.licao_materiais SET ordem=2 WHERE id='$M1';" >/dev/null
verificar "formando vê a ordem definida" "$(como $FO "SELECT string_agg(titulo, ',' ORDER BY ordem) FROM public.licao_materiais;")" "Vídeo,Guia PDF,Legendas PT"
verificar "formando não pode reordenar" "$(como $FO "WITH u AS (UPDATE public.licao_materiais SET ordem=9 RETURNING 1) SELECT count(*) FROM u;")" "0"

echo "6. Retirar"
como $AD "UPDATE public.licao_materiais SET disponivel=false WHERE id='$M2';" >/dev/null
verificar "formando deixa de ver o vídeo" "$(como $FO "SELECT count(*) FROM public.licao_materiais WHERE id='$M2';")" "0"
verificar "vídeo retirado não obtido por acesso directo" "$(como $FO "SELECT count(*) FROM storage.objects WHERE name='$L/v.mp4';")" "0"
verificar "Administrador Geral continua a ver tudo" "$(como $AD "SELECT count(*) FROM public.licao_materiais;")" "3"

echo "7. Registo das alterações"
verificar "3 inserções registadas com actor" "$(como $AD "SET ROLE postgres; SELECT count(*) FROM public.registo_auditoria WHERE entidade='licao_materiais' AND accao='insert' AND utilizador_id='$AD';")" "3"
verificar "actualizações registadas (disponibilizar 3 + substituir + ordenar 2 + retirar)" "$(como $AD "SET ROLE postgres; SELECT count(*) FROM public.registo_auditoria WHERE entidade='licao_materiais' AND accao='update';")" "7"
verificar "substituição regista o campo do ficheiro" "$(como $AD "SET ROLE postgres; SELECT count(*) FROM public.registo_auditoria WHERE registo_id='$M1' AND accao='update' AND 'ficheiro_path' = ANY(campos_sensiveis_alterados);")" "1"
verificar "nenhuma alteração registada em nome do formando" "$(como $AD "SET ROLE postgres; SELECT count(*) FROM public.registo_auditoria WHERE utilizador_id='$FO';")" "0"

echo; [ $falhas -eq 0 ] && echo "RESULTADO: todos os testes passaram" || { echo "RESULTADO: $falhas falha(s)"; exit 1; }
