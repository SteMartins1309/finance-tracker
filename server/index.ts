// server/index.ts

import 'dotenv/config'; // Garante que as variáveis de ambiente do .env sejam carregadas
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes"; // Seu arquivo de rotas de API
import { setupVite, serveStatic, log } from "./vite"; // Funções de configuração do Vite/serviço estático
import { Server } from "http";
import { storage } from './storage'; // Importa a instância de storage
import cors from 'cors'; // Importa o pacote cors

const app = express();

// 1. Middlewares globais
app.use(express.json()); // Essencial para ler o corpo das requisições JSON
app.use(express.urlencoded({ extended: false })); // Para formulários HTML (se houver)

// 2. Configuração de CORS
// Em desenvolvimento, permita de qualquer origem (ou da origem do Vite dev server)
// Em produção, se o frontend for servido pelo mesmo servidor, pode remover ou configurar especificamente.
// Para um deploy localhost, "http://localhost:PORT_DO_VITE" é comum para desenvolvimento.
// Como o backend vai servir o frontend em produção, CORS não será um problema entre eles.
app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : '*', // Ajuste a porta do Vite dev server se for diferente
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


// 3. Middleware de logging (opcional, mas bom ter)
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

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
        // Adição para evitar logs muito longos, se o JSON for grande
        const jsonString = JSON.stringify(capturedJsonResponse);
        logLine += ` :: ${jsonString.length > 100 ? jsonString.substring(0, 97) + '...' : jsonString}`;
      }
      log(logLine);
    }
  });

  next();
});

// Bloco IIFE para iniciar o servidor assincronamente
(async () => {
  let server: Server;

  // 4. REGISTRE SUAS ROTAS DE API PRIMEIRO!
  // As rotas de API devem ser registradas antes de qualquer middleware de servir arquivos estáticos
  // para que as requisições de API sejam tratadas primeiro.
  server = await registerRoutes(app);

  // NOVO: Acionar a geração de despesas recorrentes ao iniciar o servidor (APENAS EM DESENVOLVIMENTO)
  if (process.env.NODE_ENV === 'development') {
    log('Ambiente: Desenvolvimento. Acionando geração de despesas recorrentes...');
    // Pequeno atraso para garantir que a conexão com o banco de dados esteja totalmente estabelecida
    setTimeout(async () => {
      try {
        await storage.generateMonthlyRecurringExpenses();
        log('Geração de despesas recorrentes concluída.');
      } catch (error) {
        console.error('Erro durante a geração de despesas recorrentes na inicialização:', error);
      }
    }, 5000); // 5 segundos de atraso
  }


  // 5. Middleware de erro (idealmente depois das rotas de API, antes do fallback do frontend)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });

    if (process.env.NODE_ENV === 'development') {
      console.error(err); // Em dev, logar o erro completo
    } else {
      console.error(`Production Error (${status}): ${message}`); // Em prod, logar menos detalhes para o cliente
    }
  });

  // 6. Configuração para servir o frontend (depois de TODAS as APIs e middlewares de erro para APIs)
  // Isso garante que se uma rota for uma API, ela será tratada primeiro.
  if (process.env.NODE_ENV === "development") {
    log('Ambiente: Desenvolvimento. Configurando Vite para hot-reloading...');
    await setupVite(app, server); // Passe a instância 'server' existente
  } else {
    log('Ambiente: Produção. Servindo arquivos estáticos...');
    serveStatic(app); // Chama a função do vite.ts para servir os arquivos estáticos
  }

  // 7. Iniciar o servidor
  const port = process.env.PORT || 5000; // Use a porta do .env ou 5000 por padrão
  server.listen({
    port: Number(port), // Converte a porta para número, pois process.env.PORT é string
    host: "0.0.0.0", // Escuta em todas as interfaces de rede (bom para containers/localhost)
  }, () => {
    log(`Servidor rodando em: http://localhost:${port}`);
    if (process.env.NODE_ENV === 'development') {
        log(`Acesse o cliente em: http://localhost:5173 (ou a porta do Vite dev server)`); // Instrução para dev
    } else {
        log(`Acesse o cliente em: http://localhost:${port}`); // Instrução para prod local
    }
  });
})();