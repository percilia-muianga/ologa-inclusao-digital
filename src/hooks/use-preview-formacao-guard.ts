import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

type Papel = "formando" | "admin_ologa" | "gestor_instituicao";

type Estado =
  | { estado: "a_verificar" }
  | { estado: "ok"; perfil_id: string; papel: Papel; modoPreVisualizacao: boolean }
  | { estado: "sem_sessao" }
  | { estado: "sem_permissao" };

export function usePreviewFormacaoGuard(): Estado {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<Estado>({ estado: "a_verificar" });

  useEffect(() => {
    let cancelado = false;
    async function verificar() {
      const { data: userData } = await supabase.auth.getUser();
      if (cancelado) return;
      if (!userData.user) {
        setEstado({ estado: "sem_sessao" });
        navigate({ to: "/entrar" });
        return;
      }
      const { data: perfil } = await supabase
        .from("perfis")
        .select("papel")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (cancelado) return;
      const papel = perfil?.papel as Papel | undefined;
      if (papel !== "formando" && papel !== "admin_ologa" && papel !== "gestor_instituicao") {
        setEstado({ estado: "sem_permissao" });
        navigate({ to: "/entrar" });
        return;
      }
      setEstado({
        estado: "ok",
        perfil_id: userData.user.id,
        papel,
        modoPreVisualizacao: papel !== "formando",
      });
    }
    verificar();
    return () => {
      cancelado = true;
    };
  }, [navigate]);

  return estado;
}
