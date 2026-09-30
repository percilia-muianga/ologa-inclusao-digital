import { createFileRoute, Outlet } from "@tanstack/react-router";
import { exigirSessao } from "@/lib/exigir-sessao";

export const Route = createFileRoute("/presencas")({
  ssr: false,
  beforeLoad: exigirSessao,
  component: () => <Outlet />,
});
