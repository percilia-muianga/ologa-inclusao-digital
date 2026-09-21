import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/presencas")({
  component: () => <Outlet />,
});
