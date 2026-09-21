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
      avaliacoes_conhecimento: {
        Row: {
          curso_id: string | null
          dados_de_demonstracao: boolean
          distrito: string | null
          formando_id: string | null
          id: string
          momento: Database["public"]["Enums"]["momento_avaliacao"]
          participante_id: string | null
          pontuacao: number
          provincia: string | null
          realizado_em: string
          total: number
          turma_id: string | null
          workshop_id: string | null
        }
        Insert: {
          curso_id?: string | null
          dados_de_demonstracao?: boolean
          distrito?: string | null
          formando_id?: string | null
          id?: string
          momento: Database["public"]["Enums"]["momento_avaliacao"]
          participante_id?: string | null
          pontuacao: number
          provincia?: string | null
          realizado_em?: string
          total: number
          turma_id?: string | null
          workshop_id?: string | null
        }
        Update: {
          curso_id?: string | null
          dados_de_demonstracao?: boolean
          distrito?: string | null
          formando_id?: string | null
          id?: string
          momento?: Database["public"]["Enums"]["momento_avaliacao"]
          participante_id?: string | null
          pontuacao?: number
          provincia?: string | null
          realizado_em?: string
          total?: number
          turma_id?: string | null
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_conhecimento_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_conhecimento_formando_id_fkey"
            columns: ["formando_id"]
            isOneToOne: false
            referencedRelation: "formandos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_conhecimento_participante_id_fkey"
            columns: ["participante_id"]
            isOneToOne: false
            referencedRelation: "workshop_participantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_conhecimento_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_conhecimento_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      banco_questoes: {
        Row: {
          activa: boolean
          actualizado_em: string
          autor_id: string | null
          autor_nome: string
          cenario: boolean
          conteudo: Json
          criado_em: string
          curso_id: string
          dificuldade: Database["public"]["Enums"]["dificuldade_questao"]
          enunciado: string
          estado_revisao: string
          explicacao: string
          id: string
          instrumento: Database["public"]["Enums"]["instrumento_avaliacao"]
          modulo_id: string | null
          objectivo_associado: string | null
          resposta: Json
          retirada_em: string | null
          retirada_motivo: string | null
          tipologia: Database["public"]["Enums"]["tipologia_questao"]
          versao: string
        }
        Insert: {
          activa?: boolean
          actualizado_em?: string
          autor_id?: string | null
          autor_nome?: string
          cenario?: boolean
          conteudo?: Json
          criado_em?: string
          curso_id: string
          dificuldade: Database["public"]["Enums"]["dificuldade_questao"]
          enunciado: string
          estado_revisao?: string
          explicacao?: string
          id?: string
          instrumento?: Database["public"]["Enums"]["instrumento_avaliacao"]
          modulo_id?: string | null
          objectivo_associado?: string | null
          resposta?: Json
          retirada_em?: string | null
          retirada_motivo?: string | null
          tipologia: Database["public"]["Enums"]["tipologia_questao"]
          versao?: string
        }
        Update: {
          activa?: boolean
          actualizado_em?: string
          autor_id?: string | null
          autor_nome?: string
          cenario?: boolean
          conteudo?: Json
          criado_em?: string
          curso_id?: string
          dificuldade?: Database["public"]["Enums"]["dificuldade_questao"]
          enunciado?: string
          estado_revisao?: string
          explicacao?: string
          id?: string
          instrumento?: Database["public"]["Enums"]["instrumento_avaliacao"]
          modulo_id?: string | null
          objectivo_associado?: string | null
          resposta?: Json
          retirada_em?: string | null
          retirada_motivo?: string | null
          tipologia?: Database["public"]["Enums"]["tipologia_questao"]
          versao?: string
        }
        Relationships: [
          {
            foreignKeyName: "banco_questoes_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banco_questoes_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banco_questoes_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
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
      certificados_curso: {
        Row: {
          assiduidade_ajustada_pct: number | null
          assiduidade_estrita_pct: number | null
          assiduidade_pct: number
          base_assiduidade: Database["public"]["Enums"]["base_assiduidade"]
          carga_horaria: number
          codigo_verificacao: string
          curso_id: string
          data_fim: string | null
          data_inicio: string | null
          emitido_em: string
          formando_id: string
          id: string
          nome_formando: string
          nota_final_pct: number
          provincia: string | null
          tentativa_id: string | null
          titulo_curso: string
          turma_designacao: string | null
          turma_id: string | null
        }
        Insert: {
          assiduidade_ajustada_pct?: number | null
          assiduidade_estrita_pct?: number | null
          assiduidade_pct: number
          base_assiduidade?: Database["public"]["Enums"]["base_assiduidade"]
          carga_horaria?: number
          codigo_verificacao: string
          curso_id: string
          data_fim?: string | null
          data_inicio?: string | null
          emitido_em?: string
          formando_id: string
          id?: string
          nome_formando: string
          nota_final_pct: number
          provincia?: string | null
          tentativa_id?: string | null
          titulo_curso: string
          turma_designacao?: string | null
          turma_id?: string | null
        }
        Update: {
          assiduidade_ajustada_pct?: number | null
          assiduidade_estrita_pct?: number | null
          assiduidade_pct?: number
          base_assiduidade?: Database["public"]["Enums"]["base_assiduidade"]
          carga_horaria?: number
          codigo_verificacao?: string
          curso_id?: string
          data_fim?: string | null
          data_inicio?: string | null
          emitido_em?: string
          formando_id?: string
          id?: string
          nome_formando?: string
          nota_final_pct?: number
          provincia?: string | null
          tentativa_id?: string | null
          titulo_curso?: string
          turma_designacao?: string | null
          turma_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificados_curso_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificados_curso_formando_id_fkey"
            columns: ["formando_id"]
            isOneToOne: false
            referencedRelation: "formandos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificados_curso_tentativa_id_fkey"
            columns: ["tentativa_id"]
            isOneToOne: false
            referencedRelation: "exame_tentativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificados_curso_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_programa: {
        Row: {
          actualizado_em: string
          chave: string
          descricao: string | null
          valor: string
        }
        Insert: {
          actualizado_em?: string
          chave: string
          descricao?: string | null
          valor: string
        }
        Update: {
          actualizado_em?: string
          chave?: string
          descricao?: string | null
          valor?: string
        }
        Relationships: []
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
          carga_horaria_nota: string | null
          criado_em: string
          formandos_previstos: number
          id: string
          materiais: string | null
          minutos_avaliacao_orientacao: number
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
          carga_horaria_nota?: string | null
          criado_em?: string
          formandos_previstos: number
          id?: string
          materiais?: string | null
          minutos_avaliacao_orientacao?: number
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
          carga_horaria_nota?: string | null
          criado_em?: string
          formandos_previstos?: number
          id?: string
          materiais?: string | null
          minutos_avaliacao_orientacao?: number
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
      distritos_tdr: {
        Row: {
          id: string
          nome: string
          ordem: number
          ordem_provincia: number
          provincia: string
        }
        Insert: {
          id?: string
          nome: string
          ordem: number
          ordem_provincia: number
          provincia: string
        }
        Update: {
          id?: string
          nome?: string
          ordem?: number
          ordem_provincia?: number
          provincia?: string
        }
        Relationships: []
      }
      exame_configuracoes: {
        Row: {
          actualizado_em: string
          assiduidade_minima_pct: number
          curso_id: string
          minutos: number
          nota_minima_pct: number
          numero_questoes: number
          pct_dificil: number
          pct_facil: number
          pct_media: number
          prazo_dias: number
          tentativas_max: number
        }
        Insert: {
          actualizado_em?: string
          assiduidade_minima_pct?: number
          curso_id: string
          minutos?: number
          nota_minima_pct?: number
          numero_questoes?: number
          pct_dificil?: number
          pct_facil?: number
          pct_media?: number
          prazo_dias?: number
          tentativas_max?: number
        }
        Update: {
          actualizado_em?: string
          assiduidade_minima_pct?: number
          curso_id?: string
          minutos?: number
          nota_minima_pct?: number
          numero_questoes?: number
          pct_dificil?: number
          pct_facil?: number
          pct_media?: number
          prazo_dias?: number
          tentativas_max?: number
        }
        Relationships: [
          {
            foreignKeyName: "exame_configuracoes_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: true
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      exame_tentativa_questoes: {
        Row: {
          apresentacao: Json
          correcta: boolean | null
          dificuldade: Database["public"]["Enums"]["dificuldade_questao"]
          enunciado: string
          explicacao: string
          id: string
          modulo_id: string | null
          ordem: number
          questao_id: string
          respondido_em: string | null
          resposta_correcta: Json
          resposta_dada: Json | null
          tentativa_id: string
          tipologia: Database["public"]["Enums"]["tipologia_questao"]
        }
        Insert: {
          apresentacao?: Json
          correcta?: boolean | null
          dificuldade: Database["public"]["Enums"]["dificuldade_questao"]
          enunciado: string
          explicacao?: string
          id?: string
          modulo_id?: string | null
          ordem: number
          questao_id: string
          respondido_em?: string | null
          resposta_correcta?: Json
          resposta_dada?: Json | null
          tentativa_id: string
          tipologia: Database["public"]["Enums"]["tipologia_questao"]
        }
        Update: {
          apresentacao?: Json
          correcta?: boolean | null
          dificuldade?: Database["public"]["Enums"]["dificuldade_questao"]
          enunciado?: string
          explicacao?: string
          id?: string
          modulo_id?: string | null
          ordem?: number
          questao_id?: string
          respondido_em?: string | null
          resposta_correcta?: Json
          resposta_dada?: Json | null
          tentativa_id?: string
          tipologia?: Database["public"]["Enums"]["tipologia_questao"]
        }
        Relationships: [
          {
            foreignKeyName: "exame_tentativa_questoes_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "banco_questoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exame_tentativa_questoes_tentativa_id_fkey"
            columns: ["tentativa_id"]
            isOneToOne: false
            referencedRelation: "exame_tentativas"
            referencedColumns: ["id"]
          },
        ]
      }
      exame_tentativas: {
        Row: {
          criado_em: string
          curso_id: string
          estado: Database["public"]["Enums"]["estado_tentativa"]
          formando_id: string
          id: string
          iniciado_em: string
          limite_em: string
          nota_pct: number | null
          numero: number
          pontuacao: number | null
          submetido_em: string | null
          total: number | null
          turma_id: string | null
        }
        Insert: {
          criado_em?: string
          curso_id: string
          estado?: Database["public"]["Enums"]["estado_tentativa"]
          formando_id: string
          id?: string
          iniciado_em?: string
          limite_em: string
          nota_pct?: number | null
          numero?: number
          pontuacao?: number | null
          submetido_em?: string | null
          total?: number | null
          turma_id?: string | null
        }
        Update: {
          criado_em?: string
          curso_id?: string
          estado?: Database["public"]["Enums"]["estado_tentativa"]
          formando_id?: string
          id?: string
          iniciado_em?: string
          limite_em?: string
          nota_pct?: number | null
          numero?: number
          pontuacao?: number | null
          submetido_em?: string | null
          total?: number | null
          turma_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exame_tentativas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exame_tentativas_formando_id_fkey"
            columns: ["formando_id"]
            isOneToOne: false
            referencedRelation: "formandos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exame_tentativas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
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
          perfil_id: string | null
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
          perfil_id?: string | null
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
          perfil_id?: string | null
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
          {
            foreignKeyName: "formandos_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      inqueritos_eficacia: {
        Row: {
          aplica_competencias: boolean
          criado_em: string
          curso_id: string | null
          dados_de_demonstracao: boolean
          id: string
          nome_participante: string | null
          observacoes: string | null
          provincia: string | null
          realizado_em: string
          registado_por: string | null
          turma_id: string | null
          workshop_id: string | null
        }
        Insert: {
          aplica_competencias: boolean
          criado_em?: string
          curso_id?: string | null
          dados_de_demonstracao?: boolean
          id?: string
          nome_participante?: string | null
          observacoes?: string | null
          provincia?: string | null
          realizado_em?: string
          registado_por?: string | null
          turma_id?: string | null
          workshop_id?: string | null
        }
        Update: {
          aplica_competencias?: boolean
          criado_em?: string
          curso_id?: string | null
          dados_de_demonstracao?: boolean
          id?: string
          nome_participante?: string | null
          observacoes?: string | null
          provincia?: string | null
          realizado_em?: string
          registado_por?: string | null
          turma_id?: string | null
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inqueritos_eficacia_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inqueritos_eficacia_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inqueritos_eficacia_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
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
          duracao_minutos: number | null
          estado_conteudo: string
          guiao_formador: string | null
          id: string
          ilustracao_svg: string | null
          modulo_id: string
          ordem: number
          proposta_por_validar: boolean
          titulo: string
        }
        Insert: {
          conteudo_elearning?: string | null
          duracao?: string | null
          duracao_minutos?: number | null
          estado_conteudo?: string
          guiao_formador?: string | null
          id?: string
          ilustracao_svg?: string | null
          modulo_id: string
          ordem: number
          proposta_por_validar?: boolean
          titulo: string
        }
        Update: {
          conteudo_elearning?: string | null
          duracao?: string | null
          duracao_minutos?: number | null
          estado_conteudo?: string
          guiao_formador?: string | null
          id?: string
          ilustracao_svg?: string | null
          modulo_id?: string
          ordem?: number
          proposta_por_validar?: boolean
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
      locais_formacao: {
        Row: {
          id: string
          local: string
          ordem: number
          provincia: string
        }
        Insert: {
          id?: string
          local: string
          ordem: number
          provincia: string
        }
        Update: {
          id?: string
          local?: string
          ordem?: number
          provincia?: string
        }
        Relationships: []
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
      presenca_configuracoes: {
        Row: {
          actualizado_em: string
          base_assiduidade: Database["public"]["Enums"]["base_assiduidade"]
          curso_id: string
          limiar_permanencia_pct: number
          limiar_progresso_pct: number
        }
        Insert: {
          actualizado_em?: string
          base_assiduidade?: Database["public"]["Enums"]["base_assiduidade"]
          curso_id: string
          limiar_permanencia_pct?: number
          limiar_progresso_pct?: number
        }
        Update: {
          actualizado_em?: string
          base_assiduidade?: Database["public"]["Enums"]["base_assiduidade"]
          curso_id?: string
          limiar_permanencia_pct?: number
          limiar_progresso_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "presenca_configuracoes_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: true
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      presencas: {
        Row: {
          aparelho: string | null
          conflito: boolean
          dados_de_demonstracao: boolean
          estado: Database["public"]["Enums"]["estado_presenca"]
          id: string
          inscricao_id: string
          introduzido_em: string | null
          introduzido_por_nome: string | null
          justificacao_correccao: string | null
          marcado_por: string | null
          marcado_por_nome: string | null
          minutos_permanencia: number | null
          motivo: string | null
          nome_formando: string
          origem: Database["public"]["Enums"]["origem_presenca"]
          origem_offline: boolean
          progresso_pct: number | null
          registado_em: string
          sessao_id: string
          turma_id: string
          valor_introduzido_manualmente: boolean
        }
        Insert: {
          aparelho?: string | null
          conflito?: boolean
          dados_de_demonstracao?: boolean
          estado: Database["public"]["Enums"]["estado_presenca"]
          id?: string
          inscricao_id: string
          introduzido_em?: string | null
          introduzido_por_nome?: string | null
          justificacao_correccao?: string | null
          marcado_por?: string | null
          marcado_por_nome?: string | null
          minutos_permanencia?: number | null
          motivo?: string | null
          nome_formando: string
          origem?: Database["public"]["Enums"]["origem_presenca"]
          origem_offline?: boolean
          progresso_pct?: number | null
          registado_em?: string
          sessao_id: string
          turma_id: string
          valor_introduzido_manualmente?: boolean
        }
        Update: {
          aparelho?: string | null
          conflito?: boolean
          dados_de_demonstracao?: boolean
          estado?: Database["public"]["Enums"]["estado_presenca"]
          id?: string
          inscricao_id?: string
          introduzido_em?: string | null
          introduzido_por_nome?: string | null
          justificacao_correccao?: string | null
          marcado_por?: string | null
          marcado_por_nome?: string | null
          minutos_permanencia?: number | null
          motivo?: string | null
          nome_formando?: string
          origem?: Database["public"]["Enums"]["origem_presenca"]
          origem_offline?: boolean
          progresso_pct?: number | null
          registado_em?: string
          sessao_id?: string
          turma_id?: string
          valor_introduzido_manualmente?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "presencas_inscricao_id_fkey"
            columns: ["inscricao_id"]
            isOneToOne: false
            referencedRelation: "turma_inscricoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presencas_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "turma_sessoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presencas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
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
      progresso_licoes_matricula: {
        Row: {
          concluida_em: string
          id: string
          inscricao_id: string
          licao_id: string
          origem: string
          registado_por: string | null
        }
        Insert: {
          concluida_em?: string
          id?: string
          inscricao_id: string
          licao_id: string
          origem?: string
          registado_por?: string | null
        }
        Update: {
          concluida_em?: string
          id?: string
          inscricao_id?: string
          licao_id?: string
          origem?: string
          registado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progresso_licoes_matricula_inscricao_id_fkey"
            columns: ["inscricao_id"]
            isOneToOne: false
            referencedRelation: "turma_inscricoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_licoes_matricula_licao_id_fkey"
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
      questionarios_satisfacao: {
        Row: {
          comentario: string | null
          dados_de_demonstracao: boolean
          id: string
          pontuacao: number
          provincia: string | null
          respondido_em: string
          turma_id: string | null
          workshop_id: string | null
        }
        Insert: {
          comentario?: string | null
          dados_de_demonstracao?: boolean
          id?: string
          pontuacao: number
          provincia?: string | null
          respondido_em?: string
          turma_id?: string | null
          workshop_id?: string | null
        }
        Update: {
          comentario?: string | null
          dados_de_demonstracao?: boolean
          id?: string
          pontuacao?: number
          provincia?: string | null
          respondido_em?: string
          turma_id?: string | null
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questionarios_satisfacao_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionarios_satisfacao_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
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
          contexto_actor: string | null
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
          contexto_actor?: string | null
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
          contexto_actor?: string | null
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
      relatorios_mensais: {
        Row: {
          acomodacoes_concedidas: string | null
          acomodacoes_solicitadas: string | null
          ano: number
          barreiras_identificadas: string | null
          barreiras_resolvidas: string | null
          criado_em: string
          dados_de_demonstracao: boolean
          formatos_alternativos: string | null
          id: string
          incidentes: string | null
          medidas_correctivas: string | null
          mes: number
          nao_conformidades: string | null
          provincia: string | null
          reclamacoes: string | null
        }
        Insert: {
          acomodacoes_concedidas?: string | null
          acomodacoes_solicitadas?: string | null
          ano: number
          barreiras_identificadas?: string | null
          barreiras_resolvidas?: string | null
          criado_em?: string
          dados_de_demonstracao?: boolean
          formatos_alternativos?: string | null
          id?: string
          incidentes?: string | null
          medidas_correctivas?: string | null
          mes: number
          nao_conformidades?: string | null
          provincia?: string | null
          reclamacoes?: string | null
        }
        Update: {
          acomodacoes_concedidas?: string | null
          acomodacoes_solicitadas?: string | null
          ano?: number
          barreiras_identificadas?: string | null
          barreiras_resolvidas?: string | null
          criado_em?: string
          dados_de_demonstracao?: boolean
          formatos_alternativos?: string | null
          id?: string
          incidentes?: string | null
          medidas_correctivas?: string | null
          mes?: number
          nao_conformidades?: string | null
          provincia?: string | null
          reclamacoes?: string | null
        }
        Relationships: []
      }
      turma_inscricoes: {
        Row: {
          criado_em: string
          dados_de_demonstracao: boolean
          email: string | null
          estado: string
          id: string
          nome: string
          perfil_id: string | null
          turma_id: string
        }
        Insert: {
          criado_em?: string
          dados_de_demonstracao?: boolean
          email?: string | null
          estado?: string
          id?: string
          nome: string
          perfil_id?: string | null
          turma_id: string
        }
        Update: {
          criado_em?: string
          dados_de_demonstracao?: boolean
          email?: string | null
          estado?: string
          id?: string
          nome?: string
          perfil_id?: string | null
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "turma_inscricoes_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turma_inscricoes_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      turma_sessoes: {
        Row: {
          criado_em: string
          dados_de_demonstracao: boolean
          data: string
          estado: Database["public"]["Enums"]["estado_sessao"]
          estado_actualizado_em: string | null
          estado_actualizado_por_nome: string | null
          formador_nome: string | null
          hora_fim: string
          hora_inicio: string
          id: string
          modalidade: string
          motivo_estado: string | null
          ordem: number
          tema: string
          turma_id: string
        }
        Insert: {
          criado_em?: string
          dados_de_demonstracao?: boolean
          data: string
          estado?: Database["public"]["Enums"]["estado_sessao"]
          estado_actualizado_em?: string | null
          estado_actualizado_por_nome?: string | null
          formador_nome?: string | null
          hora_fim: string
          hora_inicio: string
          id?: string
          modalidade?: string
          motivo_estado?: string | null
          ordem: number
          tema: string
          turma_id: string
        }
        Update: {
          criado_em?: string
          dados_de_demonstracao?: boolean
          data?: string
          estado?: Database["public"]["Enums"]["estado_sessao"]
          estado_actualizado_em?: string | null
          estado_actualizado_por_nome?: string | null
          formador_nome?: string | null
          hora_fim?: string
          hora_inicio?: string
          id?: string
          modalidade?: string
          motivo_estado?: string | null
          ordem?: number
          tema?: string
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "turma_sessoes_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          codigo_inscricao: string
          criado_em: string
          curso_id: string
          dados_de_demonstracao: boolean
          data_fim: string | null
          data_inicio: string | null
          designacao: string
          distrito: string
          estado: Database["public"]["Enums"]["estado_turma"]
          formador_principal_id: string | null
          formador_principal_nome: string | null
          formadores_auxiliares: string[]
          id: string
          limite_formandos: number
          local_formacao: string | null
          modalidade: string
          num_computadores: number | null
          observacoes: string | null
          provincia: string
        }
        Insert: {
          codigo_inscricao?: string
          criado_em?: string
          curso_id: string
          dados_de_demonstracao?: boolean
          data_fim?: string | null
          data_inicio?: string | null
          designacao: string
          distrito: string
          estado?: Database["public"]["Enums"]["estado_turma"]
          formador_principal_id?: string | null
          formador_principal_nome?: string | null
          formadores_auxiliares?: string[]
          id?: string
          limite_formandos?: number
          local_formacao?: string | null
          modalidade?: string
          num_computadores?: number | null
          observacoes?: string | null
          provincia: string
        }
        Update: {
          codigo_inscricao?: string
          criado_em?: string
          curso_id?: string
          dados_de_demonstracao?: boolean
          data_fim?: string | null
          data_inicio?: string | null
          designacao?: string
          distrito?: string
          estado?: Database["public"]["Enums"]["estado_turma"]
          formador_principal_id?: string | null
          formador_principal_nome?: string | null
          formadores_auxiliares?: string[]
          id?: string
          limite_formandos?: number
          local_formacao?: string | null
          modalidade?: string
          num_computadores?: number | null
          observacoes?: string | null
          provincia?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_formador_principal_id_fkey"
            columns: ["formador_principal_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
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
      workshop_participantes: {
        Row: {
          contacto: string | null
          dados_de_demonstracao: boolean
          distrito: string | null
          duplicado_provavel: boolean
          entidade: string | null
          genero: Database["public"]["Enums"]["genero_utilizador"] | null
          id: string
          nome: string
          origem_offline: boolean
          provincia: string | null
          registado_em: string
          workshop_id: string
        }
        Insert: {
          contacto?: string | null
          dados_de_demonstracao?: boolean
          distrito?: string | null
          duplicado_provavel?: boolean
          entidade?: string | null
          genero?: Database["public"]["Enums"]["genero_utilizador"] | null
          id?: string
          nome: string
          origem_offline?: boolean
          provincia?: string | null
          registado_em?: string
          workshop_id: string
        }
        Update: {
          contacto?: string | null
          dados_de_demonstracao?: boolean
          distrito?: string | null
          duplicado_provavel?: boolean
          entidade?: string | null
          genero?: Database["public"]["Enums"]["genero_utilizador"] | null
          id?: string
          nome?: string
          origem_offline?: boolean
          provincia?: string | null
          registado_em?: string
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_participantes_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_perguntas: {
        Row: {
          criado_em: string
          id: string
          opcoes: Json
          pergunta: string
          resposta_correta_indice: number
          tema: string
        }
        Insert: {
          criado_em?: string
          id?: string
          opcoes: Json
          pergunta: string
          resposta_correta_indice: number
          tema: string
        }
        Update: {
          criado_em?: string
          id?: string
          opcoes?: Json
          pergunta?: string
          resposta_correta_indice?: number
          tema?: string
        }
        Relationships: []
      }
      workshops: {
        Row: {
          criado_em: string
          dados_de_demonstracao: boolean
          data: string | null
          distrito: string | null
          duracao_horas: number
          estado: Database["public"]["Enums"]["estado_workshop"]
          facilitador_nome: string | null
          id: string
          local: string | null
          observacoes: string | null
          participantes_efectivos: number
          participantes_previstos: number
          provincia: string
          tipo: Database["public"]["Enums"]["tipo_workshop"]
        }
        Insert: {
          criado_em?: string
          dados_de_demonstracao?: boolean
          data?: string | null
          distrito?: string | null
          duracao_horas?: number
          estado?: Database["public"]["Enums"]["estado_workshop"]
          facilitador_nome?: string | null
          id?: string
          local?: string | null
          observacoes?: string | null
          participantes_efectivos?: number
          participantes_previstos?: number
          provincia: string
          tipo: Database["public"]["Enums"]["tipo_workshop"]
        }
        Update: {
          criado_em?: string
          dados_de_demonstracao?: boolean
          data?: string | null
          distrito?: string | null
          duracao_horas?: number
          estado?: Database["public"]["Enums"]["estado_workshop"]
          facilitador_nome?: string | null
          id?: string
          local?: string | null
          observacoes?: string | null
          participantes_efectivos?: number
          participantes_previstos?: number
          provincia?: string
          tipo?: Database["public"]["Enums"]["tipo_workshop"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      e_admin_atdi: { Args: { _uid: string }; Returns: boolean }
      e_auditor_atdi: { Args: { _uid: string }; Returns: boolean }
      e_equipa_formacao: { Args: { _uid: string }; Returns: boolean }
      endereco_ip_do_pedido: { Args: never; Returns: string }
      gerar_codigo_turma: { Args: never; Returns: string }
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
      pode_gerir_programa: { Args: { _uid: string }; Returns: boolean }
      pode_ler_gestao: { Args: { _uid: string }; Returns: boolean }
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
      base_assiduidade: "estrita" | "ajustada"
      conectividade: "boa" | "fraca" | "nenhuma"
      dificuldade_questao: "facil" | "media" | "dificil"
      estado_presenca: "presente" | "ausente" | "justificado"
      estado_sessao: "agendada" | "realizada" | "cancelada" | "adiada"
      estado_tentativa: "em_curso" | "submetida" | "expirada"
      estado_turma:
        | "planeada"
        | "inscricoes_abertas"
        | "a_decorrer"
        | "concluida"
        | "cancelada"
      estado_workshop: "planeado" | "confirmado" | "realizado" | "cancelado"
      genero: "feminino" | "masculino" | "prefere_nao_indicar"
      genero_utilizador:
        | "feminino"
        | "masculino"
        | "outro"
        | "prefere_nao_indicar"
      instrumento_avaliacao: "exame_final" | "pre_pos_teste"
      meio_instituicao: "urbano" | "peri_urbano" | "rural"
      modalidade: "presencial" | "virtual" | "misto"
      momento_avaliacao: "pre" | "pos"
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
      origem_presenca: "manual" | "calculada" | "correccao"
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
      tipo_workshop: "provincial" | "distrital"
      tipologia_questao:
        | "escolha_multipla"
        | "verdadeiro_falso"
        | "resposta_curta"
        | "correspondencia"
        | "ordenacao"
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
      base_assiduidade: ["estrita", "ajustada"],
      conectividade: ["boa", "fraca", "nenhuma"],
      dificuldade_questao: ["facil", "media", "dificil"],
      estado_presenca: ["presente", "ausente", "justificado"],
      estado_sessao: ["agendada", "realizada", "cancelada", "adiada"],
      estado_tentativa: ["em_curso", "submetida", "expirada"],
      estado_turma: [
        "planeada",
        "inscricoes_abertas",
        "a_decorrer",
        "concluida",
        "cancelada",
      ],
      estado_workshop: ["planeado", "confirmado", "realizado", "cancelado"],
      genero: ["feminino", "masculino", "prefere_nao_indicar"],
      genero_utilizador: [
        "feminino",
        "masculino",
        "outro",
        "prefere_nao_indicar",
      ],
      instrumento_avaliacao: ["exame_final", "pre_pos_teste"],
      meio_instituicao: ["urbano", "peri_urbano", "rural"],
      modalidade: ["presencial", "virtual", "misto"],
      momento_avaliacao: ["pre", "pos"],
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
      origem_presenca: ["manual", "calculada", "correccao"],
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
      tipo_workshop: ["provincial", "distrital"],
      tipologia_questao: [
        "escolha_multipla",
        "verdadeiro_falso",
        "resposta_curta",
        "correspondencia",
        "ordenacao",
      ],
    },
  },
} as const
