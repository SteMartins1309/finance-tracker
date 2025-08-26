import express from "express";
import http from "http";
import { setupVite, serveStatic, log } from "./vite";
import path from 'path';
// ou, se precisar de require:
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bodyParser = require('body-parser');


(async () => {
  const app = express();
  const server = http.createServer(app);

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server); // ✅ agora bate com a assinatura
  } else {
    serveStatic(app);
  }

  const PORT = Number(process.env.PORT) || 5000;

  server.listen(PORT, () => {
    log(`Servidor rodando em: http://localhost:${PORT}`);
    if (process.env.NODE_ENV === "development") {
      log(`Acesse o cliente em: http://localhost:5173`);
    }
  });
})();
