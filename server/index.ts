// server/index.ts

import 'dotenv/config'; // Carrega variáveis do .env
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes"; // Rotas da API
import { setupVite, serveStatic, log } from "./vite"; // Funções de dev e produção
import { Server } from "http";
import { storage } from './storage';
import cors from 'cors';

const app = express();

// 1. Middlewares globais
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 2. CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 3. Middleware de logging para APIs
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        const jsonString = JSON.stringify(capturedJsonResponse);
        logLine += ` :: ${jsonString.length > 100 ? jsonString.substring(0, 97) + '...' : jsonString}`;
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  let server: Server;

  // 4. Registrar rotas de API
  server = await registerRoutes(app);

  // 5. Gerar despesas recorrentes em dev
  if (process.env.NODE_ENV === 'development') {
    log('Ambiente: Desenvolvimento. Acionando geração de despesas recorrentes...');
    setTimeout(async () => {
      try {
        await storage.generateMonthlyRecurringExpenses();
        log('Geração de despesas recorrentes concluída.');
      } catch (error) {
        console.error('Erro ao gerar despesas recorrentes:', error);
      }
    }, 5000);
  }

  // 6. Middleware de erro
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });

    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    } else {
      console.error(`Production Error (${status}): ${message}`);
    }
  });

  // 7. Servir frontend
  if (process.env.NODE_ENV === "development") {
    log('Ambiente: Desenvolvimento. Configurando Vite para hot-reloading...');
    await setupVite(app, server);
  } else {
    log('Ambiente: Produção. Servindo arquivos estáticos...');
    serveStatic(app); // Agora serve a pasta client/
  }

  // 8. Iniciar servidor
  const port = process.env.PORT || 5000;
  server.listen({
    port: Number(port),
    host: "0.0.0.0",
  }, () => {
    log(`Servidor rodando em: http://localhost:${port}`);
    if (process.env.NODE_ENV === 'development') {
      log(`Acesse o cliente em: http://localhost:5173`);
    }
  });
})();
