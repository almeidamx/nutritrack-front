import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Em desenvolvimento, o Vite (porta 5173) faz proxy de /api para a API Flask
// (porta 5000). Em producao, o nginx do container faz o mesmo proxy — por isso
// o cliente HTTP sempre usa o caminho relativo /api e nunca precisa saber a URL
// da API em build time (resolve a armadilha das env vars do Vite).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        // 127.0.0.1 e nao "localhost": no Windows o Node resolve localhost para
        // IPv6 (::1), mas o servidor dev do Flask escuta em IPv4 — a conexao do
        // proxy falharia. Em producao quem faz o proxy e o nginx (servico api).
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
});
