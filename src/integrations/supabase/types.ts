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
          id: string
          modulo_id: string
          nome_formando: string
          nome_instituicao: string
          perfil_id: string
          titulo_modulo: string
        }
        Insert: {
          codigo_verificacao: string
          emitido_em?: string
          id?: string
          modulo_id: string
          nome_formando: string
          nome_instituicao: string
          perfil_id: string
          titulo_modulo: string
        }
        Update: {
          codigo_verificacao?: string
          emitido_em?: string
          id?: string
          modulo_id?: string
          nome_formando?: string
          nome_instituicao?: string
          perfil_id?: string
          titulo_modulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificados_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificados_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis"
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
          distrito: string | null
          id: string
          meio: Database["public"]["Enums"]["meio_instituicao"] | null
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
          observacoes: string | null
          percurso: Database["public"]["Enums"]["percurso"] | null
          ponto_focal_email: string | null
          ponto_focal_nome: string | null
          prazo: Database["public"]["Enums"]["prazo_pretendido"] | null
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
          distrito?: string | null
          id?: string
          meio?: Database["public"]["Enums"]["meio_instituicao"] | null
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
          observacoes?: string | null
          percurso?: Database["public"]["Enums"]["percurso"] | null
          ponto_focal_email?: string | null
          ponto_focal_nome?: string | null
          prazo?: Database["public"]["Enums"]["prazo_pretendido"] | null
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
          distrito?: string | null
          id?: string
          meio?: Database["public"]["Enums"]["meio_instituicao"] | null
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
          observacoes?: string | null
          percurso?: Database["public"]["Enums"]["percurso"] | null
          ponto_focal_email?: string | null
          ponto_focal_nome?: string | null
          prazo?: Database["public"]["Enums"]["prazo_pretendido"] | null
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
      modulos: {
        Row: {
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
          apoios_acessibilidade:
            | Database["public"]["Enums"]["apoio_acessibilidade"][]
            | null
          criado_em: string
          email: string
          funcao: string | null
          genero: Database["public"]["Enums"]["genero"] | null
          id: string
          instituicao_id: string | null
          nivel_partida: Database["public"]["Enums"]["nivel_partida"] | null
          nome: string
          papel: Database["public"]["Enums"]["papel_utilizador"]
          tem_deficiencia: boolean | null
        }
        Insert: {
          apoios_acessibilidade?:
            | Database["public"]["Enums"]["apoio_acessibilidade"][]
            | null
          criado_em?: string
          email: string
          funcao?: string | null
          genero?: Database["public"]["Enums"]["genero"] | null
          id: string
          instituicao_id?: string | null
          nivel_partida?: Database["public"]["Enums"]["nivel_partida"] | null
          nome: string
          papel: Database["public"]["Enums"]["papel_utilizador"]
          tem_deficiencia?: boolean | null
        }
        Update: {
          apoios_acessibilidade?:
            | Database["public"]["Enums"]["apoio_acessibilidade"][]
            | null
          criado_em?: string
          email?: string
          funcao?: string | null
          genero?: Database["public"]["Enums"]["genero"] | null
          id?: string
          instituicao_id?: string | null
          nivel_partida?: Database["public"]["Enums"]["nivel_partida"] | null
          nome?: string
          papel?: Database["public"]["Enums"]["papel_utilizador"]
          tem_deficiencia?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "perfis_instituicao_id_fkey"
            columns: ["instituicao_id"]
            isOneToOne: false
            referencedRelation: "instituicoes"
            referencedColumns: ["id"]
          },
        ]
      }
      progresso_licoes: {
        Row: {
          concluida_em: string
          licao_id: string
          perfil_id: string
        }
        Insert: {
          concluida_em?: string
          licao_id: string
          perfil_id: string
        }
        Update: {
          concluida_em?: string
          licao_id?: string
          perfil_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_licoes_licao_id_fkey"
            columns: ["licao_id"]
            isOneToOne: false
            referencedRelation: "licoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_licoes_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      progresso_quizzes: {
        Row: {
          id: string
          modulo_id: string
          perfil_id: string
          pontuacao: number
          tentado_em: string
          total: number
        }
        Insert: {
          id?: string
          modulo_id: string
          perfil_id: string
          pontuacao: number
          tentado_em?: string
          total: number
        }
        Update: {
          id?: string
          modulo_id?: string
          perfil_id?: string
          pontuacao?: number
          tentado_em?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "progresso_quizzes_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_quizzes_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis"
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
      turma_formandos: {
        Row: {
          perfil_id: string
          turma_id: string
        }
        Insert: {
          perfil_id: string
          turma_id: string
        }
        Update: {
          perfil_id?: string
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "turma_formandos_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turma_formandos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          data_fim: string | null
          data_inicio: string | null
          id: string
          instituicao_id: string
          modalidade: Database["public"]["Enums"]["modalidade"]
          nome: string
        }
        Insert: {
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          instituicao_id: string
          modalidade: Database["public"]["Enums"]["modalidade"]
          nome: string
        }
        Update: {
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          instituicao_id?: string
          modalidade?: Database["public"]["Enums"]["modalidade"]
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_instituicao_id_fkey"
            columns: ["instituicao_id"]
            isOneToOne: false
            referencedRelation: "instituicoes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      esta_em_turma: {
        Args: { _turma: string; _uid: string }
        Returns: boolean
      }
      get_instituicao: { Args: { _uid: string }; Returns: string }
      get_papel: {
        Args: { _uid: string }
        Returns: Database["public"]["Enums"]["papel_utilizador"]
      }
      is_admin: { Args: { _uid: string }; Returns: boolean }
      is_gestor_de: {
        Args: { _instituicao: string; _uid: string }
        Returns: boolean
      }
      obter_estado_contas: {
        Args: { _ids: string[] }
        Returns: {
          id: string
          tem_password: boolean
          ultimo_acesso: string
        }[]
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
      papel_utilizador: "admin_ologa" | "gestor_instituicao" | "formando"
      percurso: "completo" | "fundacao" | "intermedio" | "avancado" | "avulsos"
      prazo_pretendido:
        | "breve"
        | "entre_1_3_meses"
        | "entre_3_6_meses"
        | "mais_6_meses"
        | "nao_definido"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      papel_utilizador: ["admin_ologa", "gestor_instituicao", "formando"],
      percurso: ["completo", "fundacao", "intermedio", "avancado", "avulsos"],
      prazo_pretendido: [
        "breve",
        "entre_1_3_meses",
        "entre_3_6_meses",
        "mais_6_meses",
        "nao_definido",
      ],
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
