import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/ologa")({
  component: () => <Outlet />,
});
