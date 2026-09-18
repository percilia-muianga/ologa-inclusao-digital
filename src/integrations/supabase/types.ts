export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      certificados: {
        Row: {
          codigo_verificacao: string
          emitido_em: string
          formando_id: string
          id: string
          modulo_id: string
          nome_formando: string
          nome_instituicao: string
          titulo_modulo: string
        }
        Insert: {
          codigo_verificacao: string
          emitido_em?: string
          formando_id: string
          id?: string
          modulo_id: string
          nome_formando: string
          nome_instituicao: string
          titulo_modulo: string
        }
        Update: {
          codigo_verificacao?: string
          emitido_em?: string
          formando_id?: string
          id?: string
          modulo_id?: string
          nome_formando?: string
          nome_instituicao?: string
          titulo_modulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificados_formando_id_fkey"
            columns: ["formando_id"]
            isOneToOne: false
            referencedRelation: "formandos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificados_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      curso_modulos: {
        Row: {
          carga_horaria_minutos: number
          curso_id: string
          modulo_id: string
          obrigatorio: boolean
          ordem: number
          transversal: boolean
        }
        Insert: {
          carga_horaria_minutos: number
          curso_id: string
          modulo_id: string
          obrigatorio?: boolean
          ordem: number
          transversal?: boolean
        }
        Update: {
          carga_horaria_minutos?: number
          curso_id?: string
          modulo_id?: string
          obrigatorio?: boolean
          ordem?: number
          transversal?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "curso_modulos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curso_modulos_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      cursos: {
        Row: {
          abrangencia: string | null
          carga_horaria: number
          criado_em: string
          formandos_previstos: number
          id: string
          materiais: string | null
          modalidade: string
          objectivos: string | null
          ordem: number
          pre_requisitos: string | null
          publico_alvo: string | null
          slug: string
          titulo: string
        }
        Insert: {
          abrangencia?: string | null
          carga_horaria: number
          criado_em?: string
          formandos_previstos: number
          id?: string
          materiais?: string | null
          modalidade: string
          objectivos?: string | null
          ordem: number
          pre_requisitos?: string | null
          publico_alvo?: string | null
          slug: string
          titulo: string
        }
        Update: {
          abrangencia?: string | null
          carga_horaria?: number
          criado_em?: string
          formandos_previstos?: number
          id?: string
          materiais?: string | null
          modalidade?: string
          objectivos?: string | null
          ordem?: number
          pre_requisitos?: string | null
          publico_alvo?: string | null
          slug?: string
          titulo?: string
        }
        Relationships: []
      }
      formandos: {
        Row: {
          apoios_acessibilidade:
            | Database["public"]["Enums"]["apoio_acessibilidade"][]
            | null
          criado_em: string
          diagnostico_pontuacao: number | null
          diagnostico_total: number | null
          genero: Database["public"]["Enums"]["genero"] | null
          id: string
          instituicao_id: string | null
          nivel_partida: Database["public"]["Enums"]["nivel_partida"] | null
          nome: string
          precisa_apoio: boolean | null
          token_pessoal: string
        }
        Insert: {
          apoios_acessibilidade?:
            | Database["public"]["Enums"]["apoio_acessibilidade"][]
            | null
          criado_em?: string
          diagnostico_pontuacao?: number | null
          diagnostico_total?: number | null
          genero?: Database["public"]["Enums"]["genero"] | null
          id?: string
          instituicao_id?: string | null
          nivel_partida?: Database["public"]["Enums"]["nivel_partida"] | null
          nome: string
          precisa_apoio?: boolean | null
          token_pessoal?: string
        }
        Update: {
          apoios_acessibilidade?:
            | Database["public"]["Enums"]["apoio_acessibilidade"][]
            | null
          criado_em?: string
          diagnostico_pontuacao?: number | null
          diagnostico_total?: number | null
          genero?: Database["public"]["Enums"]["genero"] | null
          id?: string
          instituicao_id?: string | null
          nivel_partida?: Database["public"]["Enums"]["nivel_partida"] | null
          nome?: string
          precisa_apoio?: boolean | null
          token_pessoal?: string
        }
        Relationships: [
          {
            foreignKeyName: "formandos_instituicao_id_fkey"
            columns: ["instituicao_id"]
            isOneToOne: false
            referencedRelation: "instituicoes"
            referencedColumns: ["id"]
          },
        ]
      }
      instituicao_modulos_percurso: {
        Row: {
          criado_em: string
          instituicao_id: string
          modulo_id: string
          ordem: number
        }
        Insert: {
          criado_em?: string
          instituicao_id: string
          modulo_id: string
          ordem: number
        }
        Update: {
          criado_em?: string
          instituicao_id?: string
          modulo_id?: string
          ordem?: number
        }
        Relationships: [
          {
            foreignKeyName: "instituicao_modulos_percurso_instituicao_id_fkey"
            columns: ["instituicao_id"]
            isOneToOne: false
            referencedRelation: "instituicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instituicao_modulos_percurso_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      instituicoes: {
        Row: {
          apoios_acessibilidade:
            | Database["public"]["Enums"]["apoio_acessibilidade"][]
            | null
          codigo_inscricao: string
          conectividade: Database["public"]["Enums"]["conectividade"] | null
          consentimento: boolean
          criado_em: string
          declaracao_assinada: boolean
          declaracao_assinada_em: string | null
          distrito: string | null
          id: string
          indicadores_token: string
          meio: Database["public"]["Enums"]["meio_instituicao"] | null
          meta_cobertura_pct: number | null
          meta_conclusao_pct: number | null
          meta_equidade_max_pp: number | null
          meta_ganho_pontos: number | null
          modalidade: Database["public"]["Enums"]["modalidade"] | null
          modulos_interesse: string[] | null
          natureza: Database["public"]["Enums"]["natureza_instituicao"]
          nivel_literacia: Database["public"]["Enums"]["nivel_partida"] | null
          nome: string
          num_colaboradores_total: number
          num_computadores: number | null
          num_homens: number | null
          num_mulheres: number | null
          num_pcd: number | null
          num_trabalhadores_total: number | null
          observacoes: string | null
          pedido_meta_cobertura_pct: number | null
          pedido_prazo_meses: number | null
          percurso: Database["public"]["Enums"]["percurso"] | null
          ponto_focal_email: string | null
          ponto_focal_nome: string | null
          prazo_meses: number | null
          provincia: string | null
          sala_disponivel:
            | Database["public"]["Enums"]["sala_disponivel_opt"]
            | null
          setor: Database["public"]["Enums"]["setor_instituicao"] | null
          setor_outro: string | null
        }
        Insert: {
          apoios_acessibilidade?:
            | Database["public"]["Enums"]["apoio_acessibilidade"][]
            | null
          codigo_inscricao: string
          conectividade?: Database["public"]["Enums"]["conectividade"] | null
          consentimento?: boolean
          criado_em?: string
          declaracao_assinada?: boolean
          declaracao_assinada_em?: string | null
          distrito?: string | null
          id?: string
          indicadores_token?: string
          meio?: Database["public"]["Enums"]["meio_instituicao"] | null
          meta_cobertura_pct?: number | null
          meta_conclusao_pct?: number | null
          meta_equidade_max_pp?: number | null
          meta_ganho_pontos?: number | null
          modalidade?: Database["public"]["Enums"]["modalidade"] | null
          modulos_interesse?: string[] | null
          natureza: Database["public"]["Enums"]["natureza_instituicao"]
          nivel_literacia?: Database["public"]["Enums"]["nivel_partida"] | null
          nome: string
          num_colaboradores_total?: number
          num_computadores?: number | null
          num_homens?: number | null
          num_mulheres?: number | null
          num_pcd?: number | null
          num_trabalhadores_total?: number | null
          observacoes?: string | null
          pedido_meta_cobertura_pct?: number | null
          pedido_prazo_meses?: number | null
          percurso?: Database["public"]["Enums"]["percurso"] | null
          ponto_focal_email?: string | null
          ponto_focal_nome?: string | null
          prazo_meses?: number | null
          provincia?: string | null
          sala_disponivel?:
            | Database["public"]["Enums"]["sala_disponivel_opt"]
            | null
          setor?: Database["public"]["Enums"]["setor_instituicao"] | null
          setor_outro?: string | null
        }
        Update: {
          apoios_acessibilidade?:
            | Database["public"]["Enums"]["apoio_acessibilidade"][]
            | null
          codigo_inscricao?: string
          conectividade?: Database["public"]["Enums"]["conectividade"] | null
          consentimento?: boolean
          criado_em?: string
          declaracao_assinada?: boolean
          declaracao_assinada_em?: string | null
          distrito?: string | null
          id?: string
          indicadores_token?: string
          meio?: Database["public"]["Enums"]["meio_instituicao"] | null
          meta_cobertura_pct?: number | null
          meta_conclusao_pct?: number | null
          meta_equidade_max_pp?: number | null
          meta_ganho_pontos?: number | null
          modalidade?: Database["public"]["Enums"]["modalidade"] | null
          modulos_interesse?: string[] | null
          natureza?: Database["public"]["Enums"]["natureza_instituicao"]
          nivel_literacia?: Database["public"]["Enums"]["nivel_partida"] | null
          nome?: string
          num_colaboradores_total?: number
          num_computadores?: number | null
          num_homens?: number | null
          num_mulheres?: number | null
          num_pcd?: number | null
          num_trabalhadores_total?: number | null
          observacoes?: string | null
          pedido_meta_cobertura_pct?: number | null
          pedido_prazo_meses?: number | null
          percurso?: Database["public"]["Enums"]["percurso"] | null
          ponto_focal_email?: string | null
          ponto_focal_nome?: string | null
          prazo_meses?: number | null
          provincia?: string | null
          sala_disponivel?:
            | Database["public"]["Enums"]["sala_disponivel_opt"]
            | null
          setor?: Database["public"]["Enums"]["setor_instituicao"] | null
          setor_outro?: string | null
        }
        Relationships: []
      }
      licoes: {
        Row: {
          conteudo_elearning: string | null
          duracao: string | null
          estado_conteudo: string
          guiao_formador: string | null
          id: string
          ilustracao_svg: string | null
          modulo_id: string
          ordem: number
          titulo: string
        }
        Insert: {
          conteudo_elearning?: string | null
          duracao?: string | null
          estado_conteudo?: string
          guiao_formador?: string | null
          id?: string
          ilustracao_svg?: string | null
          modulo_id: string
          ordem: number
          titulo: string
        }
        Update: {
          conteudo_elearning?: string | null
          duracao?: string | null
          estado_conteudo?: string
          guiao_formador?: string | null
          id?: string
          ilustracao_svg?: string | null
          modulo_id?: string
          ordem?: number
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "licoes_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      metas_historico: {
        Row: {
          alterado_em: string
          alterado_por: string | null
          campo: string
          id: string
          instituicao_id: string
          valor_antigo: string | null
          valor_novo: string | null
        }
        Insert: {
          alterado_em?: string
          alterado_por?: string | null
          campo: string
          id?: string
          instituicao_id: string
          valor_antigo?: string | null
          valor_novo?: string | null
        }
        Update: {
          alterado_em?: string
          alterado_por?: string | null
          campo?: string
          id?: string
          instituicao_id?: string
          valor_antigo?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metas_historico_instituicao_id_fkey"
            columns: ["instituicao_id"]
            isOneToOne: false
            referencedRelation: "instituicoes"
            referencedColumns: ["id"]
          },
        ]
      }
      modulos: {
        Row: {
          catalogo_publico: boolean
          cor_fundo: string | null
          descricao: string | null
          desenho_universal: string | null
          duracao: string | null
          icone: string | null
          id: string
          nivel: Database["public"]["Enums"]["nivel_modulo"]
          ordem: number
          titulo: string
        }
        Insert: {
          catalogo_publico?: boolean
          cor_fundo?: string | null
          descricao?: string | null
          desenho_universal?: string | null
          duracao?: string | null
          icone?: string | null
          id?: string
          nivel: Database["public"]["Enums"]["nivel_modulo"]
          ordem: number
          titulo: string
        }
        Update: {
          catalogo_publico?: boolean
          cor_fundo?: string | null
          descricao?: string | null
          desenho_universal?: string | null
          duracao?: string | null
          icone?: string | null
          id?: string
          nivel?: Database["public"]["Enums"]["nivel_modulo"]
          ordem?: number
          titulo?: string
        }
        Relationships: []
      }
      perfis: {
        Row: {
          actualizado_em: string
          cargo: string | null
          conta_de_teste: boolean
          criado_em: string
          distrito: string | null
          email: string
          entidade_empregadora: string | null
          genero: Database["public"]["Enums"]["genero_utilizador"] | null
          id: string
          nome: string
          papel: Database["public"]["Enums"]["papel_utilizador"]
          provincia: string | null
          telefone: string | null
          tipo_deficiencia: string | null
        }
        Insert: {
          actualizado_em?: string
          cargo?: string | null
          conta_de_teste?: boolean
          criado_em?: string
          distrito?: string | null
          email: string
          entidade_empregadora?: string | null
          genero?: Database["public"]["Enums"]["genero_utilizador"] | null
          id: string
          nome: string
          papel: Database["public"]["Enums"]["papel_utilizador"]
          provincia?: string | null
          telefone?: string | null
          tipo_deficiencia?: string | null
        }
        Update: {
          actualizado_em?: string
          cargo?: string | null
          conta_de_teste?: boolean
          criado_em?: string
          distrito?: string | null
          email?: string
          entidade_empregadora?: string | null
          genero?: Database["public"]["Enums"]["genero_utilizador"] | null
          id?: string
          nome?: string
          papel?: Database["public"]["Enums"]["papel_utilizador"]
          provincia?: string | null
          telefone?: string | null
          tipo_deficiencia?: string | null
        }
        Relationships: []
      }
      progresso_licoes: {
        Row: {
          concluida_em: string
          formando_id: string
          licao_id: string
        }
        Insert: {
          concluida_em?: string
          formando_id: string
          licao_id: string
        }
        Update: {
          concluida_em?: string
          formando_id?: string
          licao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_licoes_formando_id_fkey"
            columns: ["formando_id"]
            isOneToOne: false
            referencedRelation: "formandos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_licoes_licao_id_fkey"
            columns: ["licao_id"]
            isOneToOne: false
            referencedRelation: "licoes"
            referencedColumns: ["id"]
          },
        ]
      }
      progresso_quizzes: {
        Row: {
          formando_id: string
          id: string
          modulo_id: string
          pontuacao: number
          tentado_em: string
          total: number
        }
        Insert: {
          formando_id: string
          id?: string
          modulo_id: string
          pontuacao: number
          tentado_em?: string
          total: number
        }
        Update: {
          formando_id?: string
          id?: string
          modulo_id?: string
          pontuacao?: number
          tentado_em?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "progresso_quizzes_formando_id_fkey"
            columns: ["formando_id"]
            isOneToOne: false
            referencedRelation: "formandos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_quizzes_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_perguntas: {
        Row: {
          id: string
          modulo_id: string
          opcoes: Json
          pergunta: string
          resposta_correta_indice: number
        }
        Insert: {
          id?: string
          modulo_id: string
          opcoes: Json
          pergunta: string
          resposta_correta_indice: number
        }
        Update: {
          id?: string
          modulo_id?: string
          opcoes?: Json
          pergunta?: string
          resposta_correta_indice?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_perguntas_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      registo_acesso_sensivel: {
        Row: {
          campos: string[]
          consultado_por: string | null
          contexto: string | null
          endereco_ip: string | null
          id: string
          ocorrido_em: string
          perfil_consultado: string | null
        }
        Insert: {
          campos: string[]
          consultado_por?: string | null
          contexto?: string | null
          endereco_ip?: string | null
          id?: string
          ocorrido_em?: string
          perfil_consultado?: string | null
        }
        Update: {
          campos?: string[]
          consultado_por?: string | null
          contexto?: string | null
          endereco_ip?: string | null
          id?: string
          ocorrido_em?: string
          perfil_consultado?: string | null
        }
        Relationships: []
      }
      registo_auditoria: {
        Row: {
          accao: string
          campos_sensiveis_alterados: string[] | null
          endereco_ip: string | null
          entidade: string
          id: string
          ocorrido_em: string
          registo_id: string | null
          utilizador_id: string | null
          valor_anterior: Json | null
          valor_novo: Json | null
        }
        Insert: {
          accao: string
          campos_sensiveis_alterados?: string[] | null
          endereco_ip?: string | null
          entidade: string
          id?: string
          ocorrido_em?: string
          registo_id?: string | null
          utilizador_id?: string | null
          valor_anterior?: Json | null
          valor_novo?: Json | null
        }
        Update: {
          accao?: string
          campos_sensiveis_alterados?: string[] | null
          endereco_ip?: string | null
          entidade?: string
          id?: string
          ocorrido_em?: string
          registo_id?: string | null
          utilizador_id?: string | null
          valor_anterior?: Json | null
          valor_novo?: Json | null
        }
        Relationships: []
      }
      utilizador_papeis: {
        Row: {
          atribuido_em: string
          atribuido_por: string | null
          id: string
          papel: Database["public"]["Enums"]["papel_sistema"]
          utilizador_id: string
        }
        Insert: {
          atribuido_em?: string
          atribuido_por?: string | null
          id?: string
          papel: Database["public"]["Enums"]["papel_sistema"]
          utilizador_id: string
        }
        Update: {
          atribuido_em?: string
          atribuido_por?: string | null
          id?: string
          papel?: Database["public"]["Enums"]["papel_sistema"]
          utilizador_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "utilizador_papeis_utilizador_id_fkey"
            columns: ["utilizador_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      e_admin_atdi: { Args: { _uid: string }; Returns: boolean }
      e_auditor_atdi: { Args: { _uid: string }; Returns: boolean }
      endereco_ip_do_pedido: { Args: never; Returns: string }
      get_indicadores_por_token: { Args: { _token: string }; Returns: Json }
      get_totais_nacionais: {
        Args: never
        Returns: {
          declaracoes_assinadas: number
          distritos_abrangidos: number
          formandos_certificados: number
          instituicoes_inscritas: number
        }[]
      }
      is_admin: { Args: { _uid: string }; Returns: boolean }
      listar_politicas_acesso: {
        Args: never
        Returns: {
          condicao: string
          condicao_escrita: string
          operacao: string
          papeis: string
          politica: string
          tabela: string
        }[]
      }
      listar_tabelas_protegidas: {
        Args: never
        Returns: {
          numero_politicas: number
          rls_activa: boolean
          tabela: string
        }[]
      }
      registar_acesso_sensivel: {
        Args: {
          _campos: string[]
          _contexto: string
          _perfil_consultado: string
        }
        Returns: undefined
      }
      tem_papel: {
        Args: {
          _papel: Database["public"]["Enums"]["papel_sistema"]
          _uid: string
        }
        Returns: boolean
      }
    }
    Enums: {
      apoio_acessibilidade:
        | "lsm"
        | "leitura_facil"
        | "baixa_visao"
        | "audiodescricao"
        | "mobilidade"
        | "nenhum"
      conectividade: "boa" | "fraca" | "nenhuma"
      genero: "feminino" | "masculino" | "prefere_nao_indicar"
      genero_utilizador:
        | "feminino"
        | "masculino"
        | "outro"
        | "prefere_nao_indicar"
      meio_instituicao: "urbano" | "peri_urbano" | "rural"
      modalidade: "presencial" | "virtual" | "misto"
      natureza_instituicao:
        | "orgao_central"
        | "direcao_provincial"
        | "administracao_distrital"
        | "autarquia"
        | "ong"
        | "empresa"
        | "outro"
      nivel_modulo: "basico" | "intermedio" | "avancado"
      nivel_partida: "nenhum" | "basico" | "intermedio" | "prefere_nao_indicar"
      papel_sistema:
        | "formando"
        | "formador"
        | "supervisor_provincial"
        | "coordenador_nacional"
        | "admin_atdi"
        | "auditor_atdi"
      papel_utilizador: "admin_ologa" | "gestor_instituicao" | "formando"
      percurso: "completo" | "fundacao" | "intermedio" | "avancado" | "avulsos"
      sala_disponivel_opt: "sim" | "nao" | "nao_sei"
      setor_instituicao:
        | "admin_publica_central"
        | "admin_local"
        | "educacao"
        | "saude"
        | "financas"
        | "justica"
        | "agricultura"
        | "infraestruturas_transportes"
        | "energia"
        | "interior_seguranca"
        | "sociedade_civil_ong"
        | "setor_privado"
        | "outro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      apoio_acessibilidade: [
        "lsm",
        "leitura_facil",
        "baixa_visao",
        "audiodescricao",
        "mobilidade",
        "nenhum",
      ],
      conectividade: ["boa", "fraca", "nenhuma"],
      genero: ["feminino", "masculino", "prefere_nao_indicar"],
      genero_utilizador: [
        "feminino",
        "masculino",
        "outro",
        "prefere_nao_indicar",
      ],
      meio_instituicao: ["urbano", "peri_urbano", "rural"],
      modalidade: ["presencial", "virtual", "misto"],
      natureza_instituicao: [
        "orgao_central",
        "direcao_provincial",
        "administracao_distrital",
        "autarquia",
        "ong",
        "empresa",
        "outro",
      ],
      nivel_modulo: ["basico", "intermedio", "avancado"],
      nivel_partida: ["nenhum", "basico", "intermedio", "prefere_nao_indicar"],
      papel_sistema: [
        "formando",
        "formador",
        "supervisor_provincial",
        "coordenador_nacional",
        "admin_atdi",
        "auditor_atdi",
      ],
      papel_utilizador: ["admin_ologa", "gestor_instituicao", "formando"],
      percurso: ["completo", "fundacao", "intermedio", "avancado", "avulsos"],
      sala_disponivel_opt: ["sim", "nao", "nao_sei"],
      setor_instituicao: [
        "admin_publica_central",
        "admin_local",
        "educacao",
        "saude",
        "financas",
        "justica",
        "agricultura",
        "infraestruturas_transportes",
        "energia",
        "interior_seguranca",
        "sociedade_civil_ong",
        "setor_privado",
        "outro",
      ],
    },
  },
} as const
