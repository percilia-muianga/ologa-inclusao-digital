import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { obterDocumentoInstituicao } from "@/lib/documentos.functions";

type Tipo = "relatorio" | "certificado" | "declaracao";

function mensagemDeErro(erro: unknown): string {
  const t = erro instanceof Error ? erro.message : String(erro ?? "");
  if (/Unauthorized|401|sess[aã]o/i.test(t)) {
    return "É preciso entrar com a sua conta para abrir este documento.";
  }
  if (t.includes("SEM_PERMISSAO_GESTAO")) {
    return "A sua conta não tem permissão para abrir este documento.";
  }
  if (t.includes("DOCUMENTO_NAO_ENCONTRADO")) return "Documento não encontrado.";
  return "Não foi possível gerar o documento. Tente novamente.";
}

/** Descarrega o PDF através da função protegida (sessão + permissão de gestão). */
export function BotaoDocumento({
  token,
  tipo,
  nome,
  nota,
}: {
  token: string;
  tipo: Tipo;
  nome: string;
  nota?: string;
}) {
  const obter = useServerFn(obterDocumentoInstituicao);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function abrir() {
    setOcupado(true);
    setErro(null);
    try {
      const res = await obter({ data: { tipo, token } });
      const binario = atob(res.base64);
      const bytes = new Uint8Array(binario.length);
      for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <li className="rounded-md border border-ink/10 bg-white p-4">
      <button
        type="button"
        onClick={abrir}
        disabled={ocupado}
        className="text-base font-semibold text-brand-dark underline disabled:opacity-60"
      >
        {ocupado ? `A gerar ${nome}…` : `${nome} (PDF)`}
      </button>
      {nota && <p className="mt-2 text-xs text-ink/60">{nota}</p>}
      {erro && (
        <p role="alert" className="mt-2 text-xs font-semibold text-brand-dark">
          {erro}
        </p>
      )}
    </li>
  );
}
