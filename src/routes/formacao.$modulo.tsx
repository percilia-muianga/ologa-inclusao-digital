import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/formacao/$modulo")({
  component: () => <Outlet />,
});
