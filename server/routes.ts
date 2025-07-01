import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertExpenseSchema,
  insertOccasionalGroupSchema,
  insertSupermarketSchema,
  insertRestaurantSchema,
  insertServiceTypeSchema,
  insertLeisureTypeSchema,
  insertPersonalCareTypeSchema,
  insertHealthTypeSchema,
  insertFamilyMemberSchema,
  insertCharityTypeSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Expenses routes
  app.post("/api/expenses", async (req, res) => {
    try {
      const expense = insertExpenseSchema.parse(req.body); // A validação acontece aqui
      const created = await storage.createExpense(expense);
      res.json(created);
    } catch (error) {
      // --- INÍCIO DA ALTERAÇÃO ---
      if (error instanceof z.ZodError) {
        // Se o erro for de validação Zod, retorne os detalhes
        console.error("Zod Validation Error for expense:", error.issues); // Log no servidor
        return res.status(400).json({ errors: error.issues }); // Retorna os detalhes do erro para o frontend
      }
      // Para outros tipos de erro, log e retorne uma mensagem genérica de erro do servidor
      console.error("Server error adding expense:", error);
      res
        .status(500)
        .json({ error: "Failed to add expense due to server error" });
      // --- FIM DA ALTERAÇÃO ---
    }
  });

  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.get("/api/expenses/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const expenses = await storage.getRecentExpenses(limit);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent expenses" });
    }
  });

  app.get("/api/expenses/monthly/:year/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const expenses = await storage.getExpensesByMonth(year, month);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monthly expenses" });
    }
  });

  app.get("/api/expenses/yearly/:year", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const expenses = await storage.getExpensesByYear(year);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch yearly expenses" });
    }
  });

  app.get("/api/stats/monthly", async (req, res) => {
    try {
      const stats = await storage.getMonthlyStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monthly stats" });
    }
  });

  app.get("/api/stats/annual/:year", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const stats = await storage.getAnnualStats(year);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch annual stats" });
    }
  });

  app.get("/api/stats/category-breakdown/:year", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = req.query.month
        ? parseInt(req.query.month as string)
        : undefined;
      const breakdown = await storage.getCategoryBreakdown(year, month);
      res.json(breakdown);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category breakdown" });
    }
  });

  // Occasional Groups routes
  app.post("/api/occasional-groups", async (req, res) => {
    try {
      const group = insertOccasionalGroupSchema.parse(req.body);
      const created = await storage.createOccasionalGroup(group);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid group data" });
    }
  });

  app.get("/api/occasional-groups", async (req, res) => {
    try {
      const groups = await storage.getOccasionalGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch occasional groups" });
    }
  });

  app.get("/api/occasional-groups/open", async (req, res) => {
    try {
      const groups = await storage.getOpenOccasionalGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch open groups" });
    }
  });

  app.patch("/api/occasional-groups/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await storage.updateOccasionalGroupStatus(id, status);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Failed to update group status" });
    }
  });

  // Category management routes
  app.get("/api/supermarkets", async (req, res) => {
    try {
      const supermarkets = await storage.getSupermarkets();
      res.json(supermarkets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch supermarkets" });
    }
  });

  app.post("/api/supermarkets", async (req, res) => {
    try {
      const { name } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({ error: "Name is required" });
      }

      const newSupermarket = await storage.addSupermarket({ name });

      res.status(201).json(newSupermarket);
    } catch (error) {
      console.error("Error creating supermarket:", error);
      res.status(500).json({ error: "Failed to create supermarket" });
    }
  });

  app.get("/api/restaurants", async (req, res) => {
    try {
      const restaurants = await storage.getRestaurants();
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch restaurants" });
    }
  });

  app.post("/api/restaurants", async (req, res) => {
    try {
      const restaurant = insertRestaurantSchema.parse(req.body);
      const created = await storage.createRestaurant(restaurant);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid restaurant data" });
    }
  });

  app.get("/api/service-types", async (req, res) => {
    try {
      const serviceTypes = await storage.getServiceTypes();
      res.json(serviceTypes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service types" });
    }
  });

  app.post("/api/service-types", async (req, res) => {
    try {
      const serviceType = insertServiceTypeSchema.parse(req.body);
      const created = await storage.createServiceType(serviceType);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid service type data" });
    }
  });

  app.get("/api/leisure-types", async (req, res) => {
    try {
      const leisureTypes = await storage.getLeisureTypes();
      res.json(leisureTypes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leisure types" });
    }
  });

  app.post("/api/leisure-types", async (req, res) => {
    try {
      const leisureType = insertLeisureTypeSchema.parse(req.body);
      const created = await storage.createLeisureType(leisureType);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid leisure type data" });
    }
  });

  app.get("/api/personal-care-types", async (req, res) => {
    try {
      const personalCareTypes = await storage.getPersonalCareTypes();
      res.json(personalCareTypes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch personal care types" });
    }
  });

  app.post("/api/personal-care-types", async (req, res) => {
    try {
      const personalCareType = insertPersonalCareTypeSchema.parse(req.body);
      const created = await storage.createPersonalCareType(personalCareType);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid personal care type data" });
    }
  });

  app.get("/api/health-types", async (req, res) => {
    try {
      const healthTypes = await storage.getHealthTypes();
      res.json(healthTypes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch health types" });
    }
  });

  app.post("/api/health-types", async (req, res) => {
    try {
      const healthType = insertHealthTypeSchema.parse(req.body);
      const created = await storage.createHealthType(healthType);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid health type data" });
    }
  });

  app.get("/api/family-members", async (req, res) => {
    try {
      const familyMembers = await storage.getFamilyMembers();
      res.json(familyMembers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch family members" });
    }
  });

  app.post("/api/family-members", async (req, res) => {
    try {
      const familyMember = insertFamilyMemberSchema.parse(req.body);
      const created = await storage.createFamilyMember(familyMember);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid family member data" });
    }
  });

  app.get("/api/charity-types", async (req, res) => {
    try {
      const charityTypes = await storage.getCharityTypes();
      res.json(charityTypes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch charity types" });
    }
  });

  app.post("/api/charity-types", async (req, res) => {
    try {
      const charityType = insertCharityTypeSchema.parse(req.body);
      const created = await storage.createCharityType(charityType);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid charity type data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
