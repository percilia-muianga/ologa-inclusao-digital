<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Pacotes de conteúdos preparados: cada curso tem par rpc_estado_*/rpc_importar_* SECURITY INVOKER + payload em conteudos-preparados.server.ts; porque as políticas RLS devem decidir e o conteúdo não entra no navegador.
- Gravação de lições passa por rpc_guardar_licao (SECURITY INVOKER, linha bloqueada); porque a comparação e a actualização têm de ser atómicas sem alargar permissões.
- Materiais das lições: tabela licao_materiais + armazenamento privado materiais-licoes; escrita só admin (is_admin), leitura por formandos só de materiais disponíveis; porque o controlo fica nas regras de acesso e cada alteração é auditada.
- FAQ e suporte: faq_perguntas (leitura pública só publicadas, escrita admin) e pedidos_suporte (cada pessoa vê os seus, admin responde); ensaios em scripts/teste-materiais e scripts/teste-ajuda com base efémera; porque a base é partilhada entre pré-visualização e publicado.
- Vagas e inscrições em turma: limite verificado por gatilho na base com a turma bloqueada (inscricoes_controlar_vagas) e auto-inscrição só por rpc_inscrever_por_codigo com auth.uid(); porque a contagem no servidor não resiste a pedidos simultâneos e a identidade não pode vir do pedido.
- Resumo do banco de questões (panoramaBanco) exige sessão e permissão de leitura do banco; público usa disponibilidadeAvaliacao (só título e disponível/não); porque contagens e estados do banco são informação de gestão.
- Exame final e certificado de curso identificam o formando pela inscrição da conta (rpc_exame_tentativa_criar_matricula / rpc_certificado_curso_emitir_matricula, só service_role com actor verificado); porque nome ou código pessoal não provam titularidade e a base tem de decidir tentativas e duplicados de forma atómica.
- Fichas de curso guardam versão anterior em cursos_fichas_versoes antes de alterações de texto; porque a edição tem de ser recuperável.
- Discussão por turma: discussao_topicos/discussao_respostas com acesso decidido por discussao_papel (formando inscrito, formador principal, coordenação) e gatilhos que fixam autor/papel e limitam alterações; sem eliminação, moderação oculta com motivo; porque a identidade e o âmbito da turma não podem vir do pedido e cada acção tem de ser auditável.
