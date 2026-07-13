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
          criado_em: string
          email: string
          id: string
          nome: string
          papel: Database["public"]["Enums"]["papel_utilizador"]
        }
        Insert: {
          criado_em?: string
          email: string
          id: string
          nome: string
          papel: Database["public"]["Enums"]["papel_utilizador"]
        }
        Update: {
          criado_em?: string
          email?: string
          id?: string
          nome?: string
          papel?: Database["public"]["Enums"]["papel_utilizador"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_indicadores_por_token: {
        Args: { _token: string }
        Returns: {
          apoio_censurado: boolean
          declaracao_assinada: boolean
          declaracao_assinada_em: string
          distrito: string
          formandos_certificados: number
          formandos_inscritos: number
          ganho_medio_pct: number
          ganho_n: number
          meta_cobertura_pct: number
          nome: string
          num_trabalhadores_total: number
          prazo_meses: number
          provincia: string
          sexo_censurado: boolean
          taxa_conclusao_com_apoio_pct: number
          taxa_conclusao_feminino_pct: number
          taxa_conclusao_geral_pct: number
          taxa_conclusao_masculino_pct: number
          taxa_conclusao_sem_apoio_pct: number
        }[]
      }
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
