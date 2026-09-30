import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listarMinhasTurmas } from "@/lib/inscricao-turma.functions";

const campo = "min-h-11 w-full rounded-md border border-line bg-white px-3 text-base text-navy";

/**
 * Escolha da inscrição (turma) da própria conta. O exame e o certificado são
 * sempre pedidos por esta inscrição; nome ou código pessoal não bastam.
 */
export function SeletorMatricula({
  valor,
  aoMudar,
}: {
  valor: string;
  aoMudar: (inscricaoId: string) => void;
}) {
  const listar = useServerFn(listarMinhasTurmas);
  const turmas = useQuery({ queryKey: ["minhas-turmas"], queryFn: () => listar(), retry: false });

  if (turmas.isLoading) {
    return <p role="status" className="text-base text-navy-2">A carregar as suas turmas…</p>;
  }
  if (turmas.isError) {
    return (
      <p className="text-base text-navy">
        Entre na sua conta para ver as suas turmas.{" "}
        <Link to="/entrar" className="font-semibold underline">Entrar</Link>
      </p>
    );
  }
  const activas = (turmas.data ?? []).filter((t) => t.estado !== "desistiu");
  if (activas.length === 0) {
    return (
      <p className="text-base text-navy">
        Ainda não está inscrito(a) em nenhuma turma. Use o código de inscrição que recebeu em{" "}
        <Link to="/painel/minhas-turmas" className="font-semibold underline">As minhas turmas</Link>.
      </p>
    );
  }
  return (
    <div>
      <label className="block text-sm font-semibold text-navy-2" htmlFor="inscricao">
        Turma
      </label>
      <select
        id="inscricao"
        className={campo}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
      >
        <option value="">Escolha a turma</option>
        {activas.map((t) => (
          <option key={t.inscricaoId} value={t.inscricaoId}>
            {t.cursoTitulo} — {t.turmaDesignacao}
          </option>
        ))}
      </select>
    </div>
  );
}
