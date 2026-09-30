-- Gravação atómica de uma lição (editor do Administrador Geral Ologa).
-- SECURITY INVOKER: as regras RLS existentes em licoes continuam a decidir.
-- Não concede acesso novo: EXECUTE só para authenticated; PUBLIC/anon revogados.
create or replace function public.rpc_guardar_licao(_id uuid, _anterior jsonb, _novo jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  l public.licoes%rowtype;
  campos text[] := array[]::text[];
  n integer;
begin
  if auth.uid() is null then raise exception 'SEM_SESSAO'; end if;
  if not exists (select 1 from public.perfis where id = auth.uid() and papel = 'admin_ologa') then
    raise exception 'SEM_PERMISSAO_ADMIN_GERAL';
  end if;

  -- Bloqueia a linha: uma segunda gravação simultânea espera e depois vê a versão nova.
  select * into l from public.licoes where id = _id for update;
  if not found then return jsonb_build_object('estado', 'inexistente'); end if;

  if l.titulo is distinct from (_anterior->>'titulo')
     or l.duracao_minutos is distinct from (_anterior->>'duracao_minutos')::integer
     or l.estado_conteudo is distinct from (_anterior->>'estado_conteudo')
     or l.conteudo_elearning is distinct from (_anterior->>'conteudo_elearning')
     or l.guiao_formador is distinct from (_anterior->>'guiao_formador') then
    return jsonb_build_object('estado', 'conflito');
  end if;

  if l.titulo is distinct from (_novo->>'titulo') then campos := array_append(campos, 'titulo'); end if;
  if l.duracao_minutos is distinct from (_novo->>'duracao_minutos')::integer then campos := array_append(campos, 'duracao_minutos'); end if;
  if l.estado_conteudo is distinct from (_novo->>'estado_conteudo') then campos := array_append(campos, 'estado_conteudo'); end if;
  if l.conteudo_elearning is distinct from (_novo->>'conteudo_elearning') then campos := array_append(campos, 'conteudo_elearning'); end if;
  if l.guiao_formador is distinct from (_novo->>'guiao_formador') then campos := array_append(campos, 'guiao_formador'); end if;
  if cardinality(campos) = 0 then return jsonb_build_object('estado', 'sem_alteracoes'); end if;

  update public.licoes set
    titulo = _novo->>'titulo',
    duracao_minutos = (_novo->>'duracao_minutos')::integer,
    estado_conteudo = _novo->>'estado_conteudo',
    conteudo_elearning = _novo->>'conteudo_elearning',
    guiao_formador = _novo->>'guiao_formador'
  where id = _id;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'SEM_PERMISSAO_ESCRITA'; end if;

  return jsonb_build_object('estado', 'gravado', 'campos', to_jsonb(campos));
end;
$$;

revoke all on function public.rpc_guardar_licao(uuid, jsonb, jsonb) from public, anon;
grant execute on function public.rpc_guardar_licao(uuid, jsonb, jsonb) to authenticated;