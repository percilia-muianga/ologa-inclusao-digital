import { createServerFn } from "@tanstack/react-start";
import { inscricaoPublicaSchema } from "./inscricao-schema";

const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sem O, 0, I, 1, L

function gerarCodigo(len = 8): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += ALFABETO[bytes[i] % ALFABETO.length];
  return out;
}

export const listarModulosPublico = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("modulos")
      .select("id, titulo, ordem, nivel")
      .order("ordem", { ascending: true });
    if (error) return { ok: false as const, mensagem: error.message };
    return { ok: true as const, modulos: data ?? [] };
  },
);

export const criarInscricao = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => inscricaoPublicaSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (let i = 0; i < 6; i++) {
      const codigo = gerarCodigo(8);
      const { data: inserted, error } = await supabaseAdmin
        .from("instituicoes")
        .insert({
          nome: data.nome,
          natureza: data.natureza,
          setor: data.setor,
          setor_outro:
            data.setor === "outro" ? data.setor_outro?.trim() ?? null : null,
          ponto_focal_nome: data.ponto_focal_nome?.trim() || null,
          ponto_focal_email: data.ponto_focal_email || null,
          provincia: data.provincia ?? null,
          distrito: data.distrito?.trim() || null,
          meio: data.meio ?? null,
          modalidade: data.modalidade ?? null,
          conectividade: data.conectividade ?? null,
          num_computadores: data.num_computadores ?? null,
          num_colaboradores_total: data.num_colaboradores_total,
          nivel_literacia: data.nivel_literacia ?? null,
          num_mulheres: data.num_mulheres ?? null,
          num_homens: data.num_homens ?? null,
          num_pcd: data.num_pcd ?? null,
          apoios_acessibilidade: data.apoios_acessibilidade ?? null,
          modulos_interesse: data.modulos_interesse ?? null,
          percurso: data.percurso ?? null,
          prazo: data.prazo ?? null,
          sala_disponivel: data.sala_disponivel ?? null,
          observacoes: data.observacoes?.trim() || null,
          consentimento: true,
          codigo_inscricao: codigo,
        })
        .select("id, codigo_inscricao")
        .single();
      if (!error && inserted) {
        return {
          ok: true as const,
          id: inserted.id,
          codigo: inserted.codigo_inscricao,
        };
      }
      const msg = error?.message?.toLowerCase() ?? "";
      if (!msg.includes("duplicate") && !msg.includes("codigo_inscricao")) {
        return { ok: false as const, mensagem: error?.message ?? "erro" };
      }
    }
    return {
      ok: false as const,
      mensagem: "Não foi possível gerar um código único. Tente novamente.",
    };
  });
