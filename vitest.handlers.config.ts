/**
 * Configuração separada para os testes dos handlers reais.
 *
 * A configuração normal do projecto transforma cada função de servidor num
 * atalho de chamada remota, o que impede executar o corpo verdadeiro em teste.
 * Aqui carregam-se os módulos tal como estão escritos, com createServerFn
 * simulado dentro do próprio teste.
 */
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    include: ["src/lib/__tests__/*.handlers.ts"],
    environment: "node",
  },
});
