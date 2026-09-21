// Exemplo mínimo para o laboratório de plataforma como serviço.
// Proposta pedagógica — por validar pela Ologa/ATDI. Sem dependências externas.
// Usa apenas o módulo http do Node.js.

const http = require("http");

const port = process.env.PORT || 8080;
const mensagem = process.env.MENSAGEM_EXEMPLO || "Mensagem por definir na configuração do serviço.";

const servidor = http.createServer((pedido, resposta) => {
  // Registo simples: método e caminho. Não regista cabeçalhos, corpo,
  // endereços nem qualquer dado que possa identificar uma pessoa.
  console.log(`${pedido.method} ${pedido.url}`);

  resposta.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  resposta.end(
    "Laboratório de plataforma como serviço — exemplo de formação.\n" +
      `Mensagem configurada: ${mensagem}\n`,
  );
});

// Escuta em todas as interfaces: exigido pela plataforma.
servidor.listen(port, "0.0.0.0", () => {
  console.log(`Servidor de exemplo à escuta na porta ${port}`);
});
