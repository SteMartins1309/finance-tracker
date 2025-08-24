// IMPORTS

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertOccasionalGroupSchema,
  insertExpenseSchema,
  insertFixedExpenseTypeSchema,
  insertSupermarketSchema,
  insertRestaurantSchema,
  insertServiceTypeSchema,
  insertStudyTypeSchema,
  insertLeisureTypeSchema,
  insertPersonalCareTypeSchema,
  insertShopSchema,
  insertPlaceSchema,
  insertHealthTypeSchema,
  insertFamilyMemberSchema,
  insertCharityTypeSchema,
  insertFinancialYearSchema,
  insertMonthlyGoalSchema,
  InsertFinancialYear, 
  InsertMonthlyGoal,
  insertRecurringExpenseSchema,
  RecurringExpense,
} from "@shared/schema";
import { z } from "zod";
import { Request, Response, Router } from 'express';


// Função auxiliar para tratamento de erros Zod
function handleZodError(res: any, error: unknown) {
  if (error instanceof z.ZodError) {
    console.error("Zod Validation Error:", error.issues);
    return res.status(400).json({ errors: error.issues });
  }
  // Se não for um ZodError, é um erro inesperado no parse/validação
  console.error("Unexpected validation error:", error);
  return res.status(400).json({ error: "Invalid data provided" });
}

// Função auxiliar para tratamento de erros de servidor
function handleServerError(res: any, error: unknown, message: string) {
  console.error(`Server error - ${message}:`, error);
  res.status(500).json({ error: message });
}


// REGISTER ROUTES: Função para registrar rotas no servidor Express
export async function registerRoutes(app: Express): Promise<Server> {

  // ROTAS PARA DESPESAS NO GERAL
  //------------------------------------------------------------------------------------------------------------
  // Rota para criar uma nova despesa
  app.post("/api/expenses", async (req, res) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);

      if (expenseData.purchaseDate) {
        expenseData.purchaseDate = new Date(expenseData.purchaseDate);
      }

      // Se for uma despesa avulsa (sem recurringExpenseId), o paymentStatus default será 'paid' no storage.
      // Se tiver recurringExpenseId, o paymentStatus já deve vir como 'pending' do backend (lógica de geração)
      // ou ser explicitamente 'paid' se o frontend enviar (para edição ou mark as paid)
      const created = await storage.createExpense(expenseData);
      res.json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Zod Validation Error for expense:", error.issues);
        return res.status(400).json({ errors: error.issues });
      }
      console.error("Server error adding expense:", error);
      res
        .status(500)
        .json({ error: "Failed to add expense due to server error" });
    }
  });

  // Rota para buscar todas as despesas
  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch expenses");
    }
  });

  // Rota para buscar despesas recentes
  app.get("/api/expenses/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      // O backend agora deve retornar todos os gastos, e o frontend filtra/mostra o status
      const expenses = await storage.getRecentExpenses(limit); 
      res.json(expenses);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch recent expenses");
    }
  });

  // Rotas para obter ocorrências de gastos recorrentes
  app.get("/api/expenses/recurring-occurrences", async (req, res) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;

      if (year && isNaN(year)) {
        return res.status(400).json({ error: "Ano inválido." });
      }
      if (month && isNaN(month)) {
        return res.status(400).json({ error: "Mês inválido." });
      }

      const occurrences = await storage.getGeneratedRecurringExpenses(year, month);
      res.json(occurrences);
    } catch (error: unknown) {
      handleServerError(res, error, "Failed to fetch recurring expense occurrences");
    }
  });

  // Rota para buscar despesas por mês e ano (retorna APENAS despesas "pagas")
  app.get("/api/expenses/monthly/:year/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      if (isNaN(year) || isNaN(month)) {
        return res.status(400).json({ error: "Invalid year or month" });
      }
      const expenses = await storage.getExpensesByMonth(year, month);
      res.json(expenses);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch monthly expenses");
    }
  });

  // Rota para buscar despesas por ano (retorna APENAS despesas "pagas")
  app.get("/api/expenses/yearly/:year", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      if (isNaN(year)) {
        return res.status(400).json({ error: "Invalid year" });
      }
      const expenses = await storage.getExpensesByYear(year);
      res.json(expenses);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch yearly expenses");
    }
  });

  // Rota para buscar estatísticas mensais (baseada em despesas "pagas")
  app.get("/api/stats/monthly", async (req, res) => {
    try {
      const stats = await storage.getMonthlyStats();
      res.json(stats);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch monthly stats");
    }
  });

  // Rota para buscar estatísticas anuais (baseada em despesas "pagas")
  app.get("/api/stats/annual/:year", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      if (isNaN(year)) {
        return res.status(400).json({ error: "Invalid year" });
      }
      const stats = await storage.getAnnualStats(year);
      res.json(stats);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch annual stats");
    }
  });

  // Rota para buscar o desdobramento de categorias (baseada em despesas "pagas")
  app.get("/api/stats/category-breakdown/:year", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      if (isNaN(year)) {
        return res.status(400).json({ error: "Invalid year" });
      }
      const month = req.query.month
        ? parseInt(req.query.month as string)
        : undefined;
      const breakdown = await storage.getCategoryBreakdown(year, month);
      res.json(breakdown);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch category breakdown");
    }
  });

  // Rota para deletar despesa
  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const deleted = await storage.deleteExpense(id);
      if (!deleted) {
        return res.status(404).json({ error: "Expense not found" });
      }
      res.status(200).json({ message: "Expense deleted successfully", deleted });
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });

  // Rota para atualizar uma despesa existente
  app.patch("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      // Permitir que paymentStatus seja enviado
      const expenseData = insertExpenseSchema.partial().parse(req.body);

      if (expenseData.purchaseDate) {
        expenseData.purchaseDate = new Date(expenseData.purchaseDate);
      }

      const updated = await storage.updateExpense(id, expenseData);
      if (!updated) {
        return res.status(404).json({ error: "Expense not found" });
      }
      res.status(200).json({ message: "Expense updated successfully", updated });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Zod Validation Error for expense update:", error.issues);
        return res.status(400).json({ errors: error.issues });
      }
      handleServerError(res, error, "Failed to update expense due to server error");
    }
  });

  // Rota para marcar uma despesa como paga
  app.patch("/api/expenses/:id/mark-as-paid", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const updatedExpense = await storage.markExpenseAsPaid(id);
      if (!updatedExpense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      res.status(200).json({ message: "Expense marked as paid successfully", updated: updatedExpense });
    } catch (error) {
      handleServerError(res, error, "Failed to mark expense as paid");
    }
  });

  //------------------------------------------------------------------------------------------------------------
  // fim das ROTAS PARA DESPESAS NO GERAL


  // ROTAS PARA GRUPOS OCASIONAIS
  //------------------------------------------------------------------------------------------------------------
  // Rota para criar um novo grupo ocasional
  app.post("/api/occasional-groups", async (req, res) => {
    try {
      const group = insertOccasionalGroupSchema.parse(req.body);
      const created = await storage.createOccasionalGroup(group);
      res.json(created);
    } catch (error: unknown) { // CORREÇÃO: Tipar 'error' como 'unknown'
      handleZodError(res, error);
    }
  });

  // Rota para buscar todos os grupos ocasionais
  app.get("/api/occasional-groups", async (req, res) => {
    try {
      const groups = await storage.getOccasionalGroups();
      res.json(groups);
    } catch (error: unknown) { // CORREÇÃO: Tipar 'error' como 'unknown'
      handleServerError(res, error, "Failed to fetch occasional groups");
    }
  });

  // Rota para buscar grupos ocasionais abertos
  app.get("/api/occasional-groups/open", async (req, res) => {
    try {
      const groups = await storage.getOpenOccasionalGroups();
      res.json(groups);
    } catch (error: unknown) { // CORREÇÃO: Tipar 'error' como 'unknown'
      handleServerError(res, error, "Failed to fetch open groups");
    }
  });

  // Rota para deletar um grupo ocasional
  app.delete("/api/occasional-groups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const deleted = await storage.deleteOccasionalGroup(id);
      if (!deleted) {
        return res.status(404).json({ error: "Occasional group not found" });
      }
      res.status(200).json({ message: "Occasional group deleted successfully", deleted });
    } catch (error: unknown) { 
      if (error instanceof z.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete occasional group");
    }
  });

  // Rota para buscar gastos por grupo ocasional
  app.get("/api/occasional-groups/:id/expenses", async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      if (isNaN(groupId)) {
        return res.status(400).json({ error: "Invalid group ID" });
      }
      const expenses = await storage.getExpensesByOccasionalGroupId(groupId);
      res.json(expenses);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch expenses for occasional group");
    }
  });

  // Rota para atualizar o status de um grupo ocasional
  app.patch("/api/occasional-groups/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      const updateStatusSchema = z.object({
          status: z.enum(["open", "closed"]),
          // Zod transformará a string ISO para Date ou null.
          closingDate: z.string().datetime("Data de fechamento inválida.").nullable().optional().transform((str) => str ? new Date(str) : null),
      });

      const { status, closingDate } = updateStatusSchema.parse(req.body); // 'closingDate' aqui já é Date | null

      const updated = await storage.updateOccasionalGroupStatus(id, status, closingDate);
      res.json(updated);
    } catch (error: unknown) { // CORREÇÃO: Tipar 'error' como 'unknown'
      if (error instanceof z.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to update group status");
    }
  });

  // Rota para atualizar um grupo ocasional completo (para edição de nome, descrição, ícone e datas)
  app.patch("/api/occasional-groups/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido." });
      }

      // Reutiliza o schema de inserção, mas tornando tudo parcial para atualização
      // O `insertOccasionalGroupSchema` (do schema.ts) já faz o `.transform()` de string para Date.
      const partialOccasionalGroupSchema = insertOccasionalGroupSchema.partial();
      
      // CORREÇÃO: Corrigir o nome da variável de esquema.
      const updateData = partialOccasionalGroupSchema.parse(req.body); // `updateData` já tem Dates

      const updatedGroup = await storage.updateOccasionalGroup(id, updateData);

      if (!updatedGroup) {
        return res.status(404).json({ error: "Grupo ocasional não encontrado." });
      }
      res.status(200).json({ message: "Grupo ocasional atualizado com sucesso.", updated: updatedGroup });

    } catch (error: unknown) { // CORREÇÃO: Tipar 'error' como 'unknown'
      if (error instanceof z.ZodError) {
        return handleZodError(res, error);
      }
      // CORREÇÃO: Acessar propriedades de erro com segurança após verificar o tipo
      const err = error as any; // Cast para 'any' ou tipo mais específico para acessar 'code', 'constraint'
      if (err.code === '23505' && err.constraint === 'occasional_groups_name_key') { // Exemplo de constraint de nome único
          return res.status(409).json({ error: "O nome do grupo já existe." });
      }
      handleServerError(res, error, "Falha ao atualizar grupo ocasional.");
    }
  });

  //------------------------------------------------------------------------------------------------------------
  // fim das ROTAS PARA GRUPOS OCASIONAIS


  // ROTAS PARA MANUTENÇÃO DAS SUBCATEGORIAS
  //------------------------------------------------------------------------------------------------------------
  // Início das rotas de manutenção da subcategoria 'fixed'
  app.post("/api/fixed-expense-types", async (req, res) => {
    try {
      const fixedTypeData = insertFixedExpenseTypeSchema.parse(req.body);
      const newFixedType = await storage.addFixedExpenseType(fixedTypeData);
      res.status(201).json(newFixedType);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to create fixed expense type");
    }
  });

  app.delete("/api/fixed-expense-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const deleted = await storage.deleteFixedExpenseType(id);
      if (!deleted) {
        return res.status(404).json({ error: "Fixed expense type not found" });
      }
      res.status(200).json({ message: "Fixed expense type deleted successfully", deleted });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete fixed expense type");
    }
  });

  app.get("/api/fixed-expense-types", async (req, res) => {
    try {
      const fixedTypes = await storage.getFixedExpenseTypes();
      res.json(fixedTypes);
    } catch (error: unknown) {
      handleServerError(res, error, "Failed to fetch fixed expense types");
    }
  });
  // Fim das rotas de manutenção da subcategoria 'fixed'
  //------------------------------------------------------------------------------------------------------------

  // Início das rotas de manutenção da subcategoria 'supermarket'
  app.post("/api/supermarkets", async (req, res) => {
    try {
      const supermarketData = insertSupermarketSchema.parse(req.body);
      const newSupermarket = await storage.addSupermarket(supermarketData);
      res.status(201).json(newSupermarket);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to create supermarket");
    }
  });

  app.delete("/api/supermarkets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const deleted = await storage.deleteSupermarket(id);
      if (!deleted) {
        return res.status(404).json({ error: "Supermarket not found" });
      }
      res.status(200).json({ message: "Supermarket deleted successfully", deleted });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete supermarket");
    }
  });

  app.get("/api/supermarkets", async (req, res) => {
    try {
      const supermarkets = await storage.getSupermarkets();
      res.json(supermarkets);
    } catch (error: unknown) {
      handleServerError(res, error, "Failed to fetch supermarkets");
    }
  });
  // Fim das rotas de manutenção da subcategoria 'supermarket'
  //------------------------------------------------------------------------------------------------------------

  // Início das rotas de manutenção da subcategoria 'food'
  app.post("/api/restaurants", async (req, res) => {
    try {
      const restaurant = insertRestaurantSchema.parse(req.body);
      const created = await storage.addRestaurant(restaurant);
      res.json(created);
    } catch (error: unknown) {
      handleZodError(res, error); // Uso da função auxiliar
    }
  });

  app.delete("/api/restaurants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const deleted = await storage.deleteRestaurant(id);
      if (!deleted) {
        return res.status(404).json({ error: "Restaurant not found" });
      }
      res.status(200).json({ message: "Restaurant deleted successfully", deleted });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete restaurant");
    }
  });

  app.get("/api/restaurants", async (req, res) => {
    try {
      const restaurants = await storage.getRestaurants();
      res.json(restaurants);
    } catch (error: unknown) {
      handleServerError(res, error, "Failed to fetch restaurants");
    }
  });
  // Fim das rotas de manutenção da subcategoria 'food'
  //------------------------------------------------------------------------------------------------------------

  // Início das rotas de manutenção da subcategoria 'services'
  app.post("/api/service-types", async (req, res) => {
    try {
      const serviceType = insertServiceTypeSchema.parse(req.body);
      const created = await storage.addServiceType(serviceType);
      res.json(created);
    } catch (error: unknown) {
      handleZodError(res, error);
    }
  });

  app.get("/api/service-types", async (req, res) => {
    try {
      const serviceTypes = await storage.getServiceTypes();
      res.json(serviceTypes);
    } catch (error: unknown) {
      handleServerError(res, error, "Failed to fetch service types");
    }
  });

  app.delete("/api/service-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const deleted = await storage.deleteServiceType(id);

      if (!deleted) {
        return res.status(404).json({ error: "Service type not found" });
      }

      res.status(200).json({ message: "Service type deleted successfully", deleted });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete service type");
    }
  });
  // Fim das rotas de manutenção da subcategoria 'services'
  //------------------------------------------------------------------------------------------------------------
  
  // Início das rotas de manutenção da subcategoria 'study'
  app.post("/api/study-types", async (req, res) => {
    try {
      const studyType = insertStudyTypeSchema.parse(req.body);
      const created = await storage.addStudyType(studyType);
      res.json(created);
    } catch (error: unknown) {
      handleZodError(res, error);
    }
  });

  app.get("/api/study-types", async (req, res) => {
    try {
      const studyTypes = await storage.getStudyTypes();
      res.json(studyTypes);
    } catch (error: unknown) {
      handleServerError(res, error, "Failed to fetch study types");
    }
  });

  app.delete("/api/study-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const deleted = await storage.deleteStudyType(id);

      if (!deleted) {
        return res.status(404).json({ error: "Study type not found" });
      }

      res.status(200).json({ message: "Study type deleted successfully", deleted });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete study type");
    }
  });
  // Fim das rotas de manutenção da subcategoria 'services'
  //------------------------------------------------------------------------------------------------------------

  // Início das rotas de manutenção das subcategorias 'leisure'
  app.post("/api/leisure-types", async (req, res) => {
    try {
      // Adicione um console.log aqui para inspecionar o corpo da requisição
      console.log("POST /api/leisure-types - Request body:", req.body); 
      const leisureType = insertLeisureTypeSchema.parse(req.body);
      const created = await storage.addLeisureType(leisureType);
      res.json(created);
    } catch (error: unknown) {
      handleZodError(res, error);
    }
  });

  app.get("/api/leisure-types", async (req, res) => {
    try {
      const leisureTypes = await storage.getLeisureTypes();
      res.json(leisureTypes);
    } catch (error: unknown) {
      handleServerError(res, error, "Failed to fetch leisure types");
    }
  });

  app.delete("/api/leisure-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const deleted = await storage.deleteLeisureType(id);

      if (!deleted) {
        return res.status(404).json({ error: "Leisure type not found" });
      }

      res.status(200).json({ message: "Leisure type deleted successfully", deleted });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete leisure type");
    }
  });
  // Fim das rotas de manutenção das subcategorias 'leisure'
  //------------------------------------------------------------------------------------------------------------

  // Início das rotas de manutenção das subcategorias 'personal-care'
  app.post("/api/personal-care-types", async (req, res) => {
    try {
      const personalCareType = insertPersonalCareTypeSchema.parse(req.body);
      const created = await storage.addPersonalCareType(personalCareType);
      res.json(created);
    } catch (error: unknown) {
      handleZodError(res, error);
    }
  });

  app.get("/api/personal-care-types", async (req, res) => {
    try {
      const personalCareTypes = await storage.getPersonalCareTypes();
      res.json(personalCareTypes);
    } catch (error: unknown) {
      handleServerError(res, error, "Failed to fetch personal care types");
    }
  });

  app.delete("/api/personal-care-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const deleted = await storage.deletePersonalCareType(id);

      if (!deleted) {
        return res.status(404).json({ error: "Personal care type not found" });
      }

      res.status(200).json({ message: "Personal care type deleted successfully", deleted });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete personal care type");
    }
  });
  // Fim das rotas de manutenção das subcategorias 'personal-care'
  //------------------------------------------------------------------------------------

  // Início das rotas de manutenção das subcategorias 'shopping'
  app.post("/api/shops", async (req, res) => {
    try {
      const shopData = insertShopSchema.parse(req.body);
      const newShop = await storage.addShop(shopData);
      res.status(201).json(newShop);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to create shop");
    }
  });

  app.get("/api/shops", async (req, res) => {
    try {
      const shops = await storage.getShops();
      res.json(shops);
    } catch (error: unknown) {
      handleServerError(res, error, "Failed to fetch shops");
    }
  });

  app.delete("/api/shops/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const deleted = await storage.deleteShop(id);

      if (!deleted) {
        return res.status(404).json({ error: "Shop not found" });
      }

      res.status(200).json({ message: "Shop deleted successfully", deleted });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete shop");
    }
  });
  // Fim das rotas de manutenção das subcategorias 'shopping'
  //------------------------------------------------------------------------------------

  // Início das rotas de manutenção das subcategorias 'transportation'
  app.post("/api/places", async (req, res) => {
    try {
      const placeData = insertPlaceSchema.parse(req.body);
      const newPlace = await storage.addPlace(placeData);
      res.status(201).json(newPlace);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to create place");
    }
  });

  app.get("/api/places", async (req, res) => {
    try {
      const places = await storage.getPlaces();
      res.json(places);
    } catch (error: unknown) {
      handleServerError(res, error, "Failed to fetch places");
    }
  });

  app.delete("/api/places/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const deleted = await storage.deletePlace(id);

      if (!deleted) {
        return res.status(404).json({ error: "Place not found" });
      }

      res.status(200).json({ message: "Place deleted successfully", deleted });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete place");
    }
  });
  // Fim das rotas de manutenção das subcategorias 'transportation'
  //------------------------------------------------------------------------------------

  // Início das rotas de manutenção das subcategorias 'health'
  app.post("/api/health-types", async (req, res) => {
    try {
      const healthType = insertHealthTypeSchema.parse(req.body);
      const created = await storage.addHealthType(healthType);
      res.json(created);
    } catch (error: unknown) {
      handleZodError(res, error);
    }
  });

  app.get("/api/health-types", async (req, res) => {
    try {
      const healthTypes = await storage.getHealthTypes();
      res.json(healthTypes);
    } catch (error: unknown) {
      handleServerError(res, error, "Failed to fetch health types");
    }
  });

  app.delete("/api/health-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const deleted = await storage.deleteHealthType(id);

      if (!deleted) {
        return res.status(404).json({ error: "Health type not found" });
      }

      res.status(200).json({ message: "Health type deleted successfully", deleted });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete health type");
    }
  });
  // Fim das rotas de manutenção das subcategorias 'health'
  //------------------------------------------------------------------------------------

  // Início das rotas de manutenção das subcategorias 'family'
  app.post("/api/family-members", async (req, res) => {
    try {
      const familyMember = insertFamilyMemberSchema.parse(req.body);
      const created = await storage.addFamilyMember(familyMember);
      res.json(created);
    } catch (error: unknown) {
      handleZodError(res, error);
    }
  });

  app.get("/api/family-members", async (req, res) => {
    try {
      const familyMembers = await storage.getFamilyMembers();
      res.json(familyMembers);
    } catch (error: unknown) {
      handleServerError(res, error, "Failed to fetch family members");
    }
  });

  app.delete("/api/family-members/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const deleted = await storage.deleteFamilyMember(id);

      if (!deleted) {
        return res.status(404).json({ error: "Family member not found" });
      }

      res.status(200).json({ message: "Family member deleted successfully", deleted });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete family member");
    }
  });
  // Fim das rotas de manutenção das subcategorias 'family'
  //------------------------------------------------------------------------------------

  // Início das rotas de manutenção das subcategorias 'charity'
  app.post("/api/charity-types", async (req, res) => {
    try {
      const charityType = insertCharityTypeSchema.parse(req.body);
      const created = await storage.addCharityType(charityType);
      res.json(created);
    } catch (error: unknown) {
      handleZodError(res, error);
    }
  });

  app.get("/api/charity-types", async (req, res) => {
    try {
      const charityTypes = await storage.getCharityTypes();
      res.json(charityTypes);
    } catch (error: unknown) {
      handleServerError(res, error, "Failed to fetch charity types");
    }
  });

  app.delete("/api/charity-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const deleted = await storage.deleteCharityType(id);

      if (!deleted) {
        return res.status(404).json({ error: "Charity type not found" });
      }

      res.status(200).json({ message: "Charity type deleted successfully", deleted });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete charity type");
    }
  });
  //------------------------------------------------------------------------------------
  // fim das ROTAS PARA MANUTENÇÃO DAS SUBCATEGORIAS


  // ROTAS PARA ANOS FINANCEIROS E METAS
  //------------------------------------------------------------------------------------------------------------
  // Rota para criar um novo ano financeiro e suas metas mensais
  app.post("/api/financial-years", async (req: Request, res: Response) => {
        try {
            const financialYearAndGoalsSchema = z.object({
                year: z.number().min(2000, "O ano deve ser no mínimo 2000."), 
                totalMonthlyGoal: z.preprocess(
                    (val) => val === "" || val === undefined ? NaN : Number(val),
                    z.number().min(0, "A meta mensal total não pode ser negativa.")
                ),
                monthlyGoals: z.array(insertMonthlyGoalSchema).optional(),
            });

            const validatedBody = financialYearAndGoalsSchema.parse(req.body);

            const yearDataToInsert = {
                year: validatedBody.year, // Acessa diretamente 'year'
                totalMonthlyGoal: validatedBody.totalMonthlyGoal || 0,
            };

            const parsedGoals = validatedBody.monthlyGoals || [];

            // Passa yearDataToInsert diretamente
            const newFinancialYear = await storage.createFinancialYear(yearDataToInsert, parsedGoals);
            res.status(201).json(newFinancialYear);
        } catch (error: unknown) { 
            if (error instanceof z.ZodError) {
                console.error("Zod Validation Error for financial year creation:", error.issues);
                return res.status(400).json({ errors: error.issues });
            }
            const err = error as any;
            if (err.code === '23505' && err.constraint === 'financial_years_year_unique') {
                console.error("Duplicate year creation attempt:", err.detail);
                return res.status(409).json({ error: "Ano financeiro já existe." });
            }
            console.error("Server error creating financial year:", error);
            res.status(500).json({ error: "Falha ao criar ano financeiro." });
        }
    });

  // Rota para obter todos os anos financeiros
  app.get("/api/financial-years", async (req: Request, res: Response) => {
    try {
      const years = await storage.getFinancialYears(); // Presume que isso já inclui as monthlyGoals
      res.json(years);
    } catch (error: unknown) { 
      console.error("Error fetching financial years:", error);
      res.status(500).json({ error: "Falha ao buscar anos financeiros." });
    }
  });

  // Rota para obter detalhes de um ano financeiro específico (incluindo metas)
  app.get("/api/financial-years/:id", async (req: Request, res: Response) => {
    try {
      const yearId = parseInt(req.params.id);
      if (isNaN(yearId)) {
        return res.status(400).json({ error: "ID inválido." });
      }
      const yearDetails = await storage.getFinancialYearDetails(yearId);
      if (!yearDetails) {
        return res.status(404).json({ error: "Ano financeiro não encontrado." });
      }
      res.json(yearDetails);
    } catch (error: unknown) { 
      console.error("Error fetching financial year details:", error);
      res.status(500).json({ error: "Falha ao buscar detalhes do ano financeiro." });
    }
  });

  // Rota para atualizar um ano financeiro e suas metas
  app.put("/api/financial-years/:id", async (req: Request, res: Response) => {
    try {
        // 1. Extração e Validação do ID do Parâmetro da URL
        const yearId = parseInt(req.params.id);
        if (isNaN(yearId)) {
            console.error("PUT /api/financial-years/:id - ID inválido recebido:", req.params.id);
            return res.status(400).json({ error: "ID do ano inválido. Deve ser um número." });
        }

        // 2. Definição do Schema Zod para o CORPO DA REQUISIÇÃO (req.body)
        const requestBodySchema = z.object({
            year: z.number({
                invalid_type_error: "O campo 'ano' deve ser um número.",
                required_error: "O campo 'ano' é obrigatório para atualização."
            }).min(1900, "O ano deve ser igual ou superior a 1900.").optional(),

            totalMonthlyGoal: z.preprocess(
                (val) => val === "" || val === undefined ? NaN : Number(val),
                z.number({
                    invalid_type_error: "O campo 'meta mensal total' deve ser um número.",
                    required_error: "O campo 'meta mensal total' é obrigatório para atualização."
                }).min(0, "A meta mensal total não pode ser negativa.")
            ).optional(),

            monthlyGoals: z.array(insertMonthlyGoalSchema).optional(),
        }).strict("Campos desconhecidos no corpo da requisição.");

        // 3. Parse e Validação do Corpo da Requisição
        const validatedBody = requestBodySchema.parse(req.body);

        // 4. Preparação dos Dados para a Camada de Armazenamento (storage)
        const yearDataToUpdate: Partial<InsertFinancialYear> = {};
        if (validatedBody.year !== undefined) {
            yearDataToUpdate.year = validatedBody.year;
        }
        if (validatedBody.totalMonthlyGoal !== undefined) {
            yearDataToUpdate.totalMonthlyGoal = validatedBody.totalMonthlyGoal;
        }

        const goalsToUpdate = validatedBody.monthlyGoals || [];

        // 5. Chamada para a Camada de Armazenamento para Atualizar os Dados
        const updatedYear = await storage.updateFinancialYear(yearId, yearDataToUpdate, goalsToUpdate);

        // 6. Tratamento de Sucesso e Resposta
        if (!updatedYear) {
            console.warn(`PUT /api/financial-years/${yearId} - Ano financeiro não encontrado para atualização.`);
            return res.status(404).json({ error: "Ano financeiro não encontrado." });
        }

        console.log(`PUT /api/financial-years/${yearId} - Ano financeiro atualizado com sucesso.`);
        res.status(200).json({ message: "Ano financeiro atualizado com sucesso.", updated: updatedYear });

    } catch (error: unknown) { 
        // 7. Tratamento de Erros
        if (error instanceof z.ZodError) {
            console.error("Zod Validation Error for financial year update:", error.issues);
            return res.status(400).json({ errors: error.issues });
        }

        const err = error as any;
        if (err.code === '23505' && err.constraint === 'financial_years_year_unique') {
            console.error("Duplicate year update attempt:", err.detail);
            return res.status(409).json({ error: "O ano financeiro informado já existe para outro registro." });
        }

        console.error("Server error updating financial year:", error);
        res.status(500).json({ error: "Falha ao atualizar ano financeiro. Tente novamente mais tarde." });
    }
  });

  // Rota para excluir um ano financeiro
  app.delete("/api/financial-years/:id", async (req: Request, res: Response) => {
    try {
      const yearId = parseInt(req.params.id);
      if (isNaN(yearId)) {
        return res.status(400).json({ error: "ID inválido." });
      }
      const deletedYear = await storage.deleteFinancialYear(yearId);
      if (!deletedYear) {
        return res.status(404).json({ error: "Ano financeiro não encontrado." });
      }
      res.status(200).json({ message: "Ano financeiro excluído com sucesso.", deleted: deletedYear });
    } catch (error: unknown) { 
      console.error("Error deleting financial year:", error);
      res.status(500).json({ error: "Falha ao excluir ano financeiro." });
    }
  });

  // Rota para buscar o sumário de gastos mensais para um ano específico
  app.get("/api/expenses/yearly/:year/monthly-summary", async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      if (isNaN(year)) {
        return res.status(400).json({ error: "Ano inválido." });
      }
      const monthlySummary = await storage.getMonthlySummaryByYear(year);
      res.json(monthlySummary);
    } catch (error: unknown) { 
      console.error("Error fetching monthly summary for year:", error);
      res.status(500).json({ error: "Falha ao buscar sumário mensal." });
    }
  });

  // Obter gastos mensais detalhados por categoria para um ano
  app.get("/api/expenses/yearly/:year/monthly-breakdown", async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      if (isNaN(year)) {
        return res.status(400).json({ error: "Ano inválido." });
      }
      const breakdown = await storage.getMonthlyExpensesBreakdownByYear(year);
      res.json(breakdown);
    } catch (error: unknown) { 
      console.error("Error fetching monthly expenses breakdown:", error);
      res.status(500).json({ error: "Falha ao buscar o desdobramento mensal de gastos." });
    }
  });

  //------------------------------------------------------------------------------------------------------------
  // fim de ROTAS PARA ANOS FINANCEIROS E METAS


  // ROTAS PARA GASTOS RECORRENTES
  //------------------------------------------------------------------------------------------------------------

  // Rota para criar um novo gasto recorrente
  app.post("/api/recurring-expenses", async (req, res) => {
    try {
      // Use o novo schema insertRecurringExpenseSchema para validação
      const recurringExpenseData = insertRecurringExpenseSchema.parse(req.body);
      const created = await storage.createRecurringExpense(recurringExpenseData);
      res.status(201).json(created);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to create recurring expense");
    }
  });

  // Rota para buscar todos os gastos recorrentes
  app.get("/api/recurring-expenses", async (req, res) => {
    try {
      const recurringExpenses = await storage.getRecurringExpenses();
      res.json(recurringExpenses);
    } catch (error: unknown) {
      handleServerError(res, error, "Failed to fetch recurring expenses");
    }
  });

  // Rota para buscar um gasto recorrente específico por ID
  app.get("/api/recurring-expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const recurringExpense = await storage.getRecurringExpenseById(id);
      if (!recurringExpense) {
        return res.status(404).json({ error: "Recurring expense not found" });
      }
      res.json(recurringExpense);
    } catch (error: unknown) {
      handleServerError(res, error, "Failed to fetch recurring expense");
    }
  });

  // Rota para atualizar um gasto recorrente
  app.patch("/api/recurring-expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const updateRecurringExpenseSchema = z.object({
        name: z.string().min(1, "O nome é obrigatório.").optional(),
        amount: z.number().min(0, "O valor não pode ser negativo.").optional(),
        paymentMethod: z.enum(["pix", "credit-card", "debit-card", "cash", "bank-transfer"]).optional(),
        expenseType: z.enum(["routine", "occasional"]).optional(),
        routineCategory: z.enum([
          "fixed", "supermarket", "food", "services", "study", "leisure", "personal-care",
          "shopping", "transportation", "health", "family", "charity",
        ]).optional().nullable(), // Nullable se o campo pode ser limpo
        occasionalGroupId: z.number().int().optional().nullable(), // Nullable se o campo pode ser limpo

        fixedExpenseTypeId: z.number().int().optional().nullable(),
        frequency: z.enum(["weekly", "monthly", "semi-annually", "annually"]).optional().nullable(),
        supermarketId: z.number().int().optional().nullable(),
        restaurantId: z.number().int().optional().nullable(),
        occasionType: z.enum(["normal", "special"]).optional().nullable(),
        specialOccasionDescription: z.string().optional().nullable(),
        foodPurchaseType: z.enum(["in-person", "online"]).optional().nullable(),
        serviceTypeId: z.number().int().optional().nullable(),
        serviceDescription: z.string().optional().nullable(),
        studyTypeId: z.number().int().optional().nullable(),
        studyDescription: z.string().optional().nullable(),
        leisureTypeId: z.number().int().optional().nullable(),
        leisureDescription: z.string().optional().nullable(),
        personalCareTypeId: z.number().int().optional().nullable(),
        personalCareDescription: z.string().optional().nullable(),
        shopId: z.number().int().optional().nullable(),
        shoppingPurchaseType: z.enum(["in-person", "online"]).optional().nullable(),
        shoppingOccasionType: z.enum(["normal", "special"]).optional().nullable(),
        shoppingSpecialOccasionDescription: z.string().optional().nullable(),
        startPlaceId: z.number().int().optional().nullable(),
        endPlaceId: z.number().int().optional().nullable(),
        startingPoint: z.string().optional().nullable(),
        destination: z.string().optional().nullable(),
        transportMode: z.enum(["car", "uber", "bus", "plane", "subway", "another"]).optional().nullable(),
        transportDescription: z.string().optional().nullable(),
        healthTypeId: z.number().int().optional().nullable(),
        healthTypeName: z.string().optional().nullable(), // Não é um ID, é um nome que vem do join
        healthDescription: z.string().optional().nullable(),
        familyMemberId: z.number().int().optional().nullable(),
        familyMemberName: z.string().optional().nullable(), // Não é um ID, é um nome que vem do join
        familyDescription: z.string().optional().nullable(),
        charityTypeId: z.number().int().optional().nullable(),
        charityTypeName: z.string().optional().nullable(), // Não é um ID, é um nome que vem do join
        charityDescription: z.string().optional().nullable(),

        // Campos específicos de recorrência
        recurrenceType: z.enum(["undetermined", "paused", "determined"]).optional(),
        installmentsTotal: z.number().int().min(1, "O número de parcelas deve ser pelo menos 1.").optional().nullable(),
        startDate: z.string().transform((str) => new Date(str)).optional(), // Data de início pode ser atualizada
      }).partial(); // Aplica partial aqui, antes de qualquer transformação mais complexa

      const updateData = updateRecurringExpenseSchema.parse(req.body); // Use o novo schema parcial
      const updated = await storage.updateRecurringExpense(id, updateData);
      if (!updated) {
        return res.status(404).json({ error: "Recurring expense not found" });
      }
      res.status(200).json({ message: "Recurring expense updated successfully", updated });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to update recurring expense");
    }
  });

  // Rota para deletar um gasto recorrente
  app.delete("/api/recurring-expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const deleted = await storage.deleteRecurringExpense(id);
      if (!deleted) {
        return res.status(404).json({ error: "Recurring expense not found" });
      }
      res.status(200).json({ message: "Recurring expense deleted successfully", deleted });
    } catch (error: unknown) {
      handleServerError(res, error, "Failed to delete recurring expense");
    }
  });

  // Rota para acionar manualmente a geração de despesas recorrentes (para dev/teste)
  app.post("/api/generate-recurring-expenses", async (req, res) => {
    // AVISO: Esta rota é para desenvolvimento/teste. Em produção, use um cron job.
    try {
      await storage.generateMonthlyRecurringExpenses();
      res.status(200).json({ message: "Monthly recurring expenses generation triggered successfully." });
    } catch (error) {
      handleServerError(res, error, "Failed to trigger recurring expenses generation");
    }
  });

  //------------------------------------------------------------------------------------------------------------
  // fim de ROTAS PARA GASTOS RECORRENTES


  // Rota para alternar o status de pagamento de uma despesa
app.patch('/api/expenses/:id/payment-status', async (req, res) => {
  try {
    const id = parseInt(req.params.id); // Corrigido o erro 1: Converte 'id' para número
    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
    }

    const { paymentStatus } = req.body;

    // Use Zod para garantir que o status seja 'paid' ou 'pending'
    const statusSchema = z.object({
      paymentStatus: z.enum(['paid', 'pending']),
    });

    const validatedStatus = statusSchema.parse({ paymentStatus });

    // Atualiza o status da despesa
    const updatedExpense = await storage.updateExpense(id, validatedStatus);

    if (!updatedExpense) {
        return res.status(404).json({ error: "Expense not found" });
    }

    res.status(200).json(updatedExpense);
  } catch (error: unknown) { // Use 'unknown' para tratar o erro com segurança
    if (error instanceof z.ZodError) {
        return handleZodError(res, error);
    }
    // Corrigido o erro 2: Adiciona a mensagem de erro que falta
    handleServerError(res, error, "Failed to update payment status");
  }
});



  const httpServer = createServer(app);
  return httpServer;
}