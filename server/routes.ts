// IMPORTS

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,  // inserir isso em algum lugar
  insertOccasionalGroupSchema,
  insertExpenseSchema,
  insertFixedExpenseTypeSchema, 
  insertSupermarketSchema,  
  insertRestaurantSchema, 
  insertServiceTypeSchema, 
  insertLeisureTypeSchema,  
  insertPersonalCareTypeSchema,  
  insertShopSchema,  
  insertPlaceSchema, 
  insertHealthTypeSchema,  
  insertFamilyMemberSchema,  
  insertCharityTypeSchema,  
  
} from "@shared/schema";
import { z } from "zod";


// REGISTER ROUTES: Função para registrar rotas no servidor Express
export async function registerRoutes(app: Express): Promise<Server> {

  // ROTAS PARA DESPESAS NO GERAL
  //------------------------------------------------------------------------------------------------------------
  // Rota para criar uma nova despesa
  app.post("/api/expenses", async (req, res) => {
    try {
      const expense = insertExpenseSchema.parse(req.body); 
      const created = await storage.createExpense(expense);
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
      console.error("Error fetching expenses:", error);
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  // Rota para buscar despesas recentes
  app.get("/api/expenses/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const expenses = await storage.getRecentExpenses(limit);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent expenses" });
    }
  });

  // Rota para buscar despesas por mês e ano
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

  // Rota para buscar despesas por ano
  app.get("/api/expenses/yearly/:year", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const expenses = await storage.getExpensesByYear(year);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch yearly expenses" });
    }
  });

  // Rota para buscar estatísticas mensais
  app.get("/api/stats/monthly", async (req, res) => {
    try {
      const stats = await storage.getMonthlyStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monthly stats" });
    }
  });

  // Rota para buscar estatísticas anuais
  app.get("/api/stats/annual/:year", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const stats = await storage.getAnnualStats(year);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch annual stats" });
    }
  });

  // Rota para buscar o desdobramento de categorias
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
    } catch (error) {
      res.status(400).json({ error: "Invalid group data" });
    }
  });

  // Rota para buscar todos os grupos ocasionais
  app.get("/api/occasional-groups", async (req, res) => {
    try {
      const groups = await storage.getOccasionalGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch occasional groups" });
    }
  });

  // Rota para buscar grupos ocasionais abertos
  app.get("/api/occasional-groups/open", async (req, res) => {
    try {
      const groups = await storage.getOpenOccasionalGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch open groups" });
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
    } catch (error) {
      console.error("Error deleting occasional group:", error);
      if (error instanceof z.ZodError) { 
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete occasional group" });
    }
  });

  // Rota para atualizar o status de um grupo ocasional
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
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Zod Validation Error for fixed expense type:", error.issues);
        return res.status(400).json({ errors: error.issues });
      }
      console.error("Server error creating fixed expense type:", error);
      res.status(500).json({ error: "Failed to create fixed expense type" });
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
    } catch (error) {
      console.error("Error deleting fixed expense type:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete fixed expense type" });
    }
  });

  app.get("/api/fixed-expense-types", async (req, res) => { 
    try {
      const fixedTypes = await storage.getFixedExpenseTypes();
      res.json(fixedTypes);
    } catch (error) {
      console.error("Error fetching fixed expense types:", error);
      res.status(500).json({ error: "Failed to fetch fixed expense types" });
    }
  });
  // Fim das rotas de manutenção da subcategoria 'fixed'
  //------------------------------------------------------------------------------------------------------------
  
  // Início das rotas de manutenção da subcategoria 'supermarket'
  app.post("/api/supermarkets", async (req, res) => {
    try {
      // AQUI: Usando Zod para validação, no mesmo molde de fixed-expense-types
      const supermarketData = insertSupermarketSchema.parse(req.body); //
      const newSupermarket = await storage.addSupermarket(supermarketData); //
      res.status(201).json(newSupermarket); //
    } catch (error) {
      if (error instanceof z.ZodError) { // AQUI: Tratamento de erro Zod detalhado, no mesmo molde de fixed-expense-types
        console.error("Zod Validation Error for supermarket:", error.issues);
        return res.status(400).json({ errors: error.issues });
      }
      console.error("Error creating supermarket:", error);
      res.status(500).json({ error: "Failed to create supermarket" });
    }
  });

  app.delete("/api/supermarkets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id); // Pega o ID da URL
      if (isNaN(id)) { //
        return res.status(400).json({ error: "Invalid ID" });
      }
      const deleted = await storage.deleteSupermarket(id); //
      if (!deleted) { //
        return res.status(404).json({ error: "Supermarket not found" });
      }
      res.status(200).json({ message: "Supermarket deleted successfully", deleted }); //
    } catch (error) {
      if (error instanceof z.ZodError) { // AQUI: Tratamento de erro Zod detalhado
        console.error("Zod Validation Error for deleting supermarket:", error.issues);
        return res.status(400).json({ errors: error.issues });
      }
      console.error("Error deleting supermarket:", error);
      res.status(500).json({ error: "Failed to delete supermarket" });
    }
  });

  app.get("/api/supermarkets", async (req, res) => {
    try {
      const supermarkets = await storage.getSupermarkets();
      res.json(supermarkets);
    } catch (error) {
      console.error("Error fetching supermarkets:", error);
      res.status(500).json({ error: "Failed to fetch supermarkets" });
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
    } catch (error) {
      res.status(400).json({ error: "Invalid restaurant data" });
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
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete restaurant" });
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
  // Fim das rotas de manutenção da subcategoria 'food'
  //------------------------------------------------------------------------------------------------------------

  // Início das rotas de manutenção da subcategoria 'services'
  app.post("/api/service-types", async (req, res) => {
    try {
      const serviceType = insertServiceTypeSchema.parse(req.body);
      const created = await storage.addServiceType(serviceType);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid service type data" });
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
    } catch (error) {
      console.error("Error deleting service type:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete service type" });
    }
  });
  // Fim das rotas de manutenção da subcategoria 'services'
  //------------------------------------------------------------------------------------------------------------

  // Início das rotas de manutenção das subcategorias 'leisure'
  app.post("/api/leisure-types", async (req, res) => {
    try {
      const leisureType = insertLeisureTypeSchema.parse(req.body);
      const created = await storage.addLeisureType(leisureType);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid leisure type data" });
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
    } catch (error) {
      console.error("Error deleting leisure type:", error);
      if (error instanceof z.ZodError) { // Inclua tratamento Zod para consistência
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete leisure type" });
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
    } catch (error) {
      res.status(400).json({ error: "Invalid personal care type data" });
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
    } catch (error) {
      console.error("Error deleting personal care type:", error);
      if (error instanceof z.ZodError) { // Inclua tratamento Zod para consistência
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete personal care type" });
    }
  });
  // Fim das rotas de manutenção das subcategorias 'personal-care'
  //------------------------------------------------------------------------------------------------------------

  // Início das rotas de manutenção das subcategorias 'shopping'
  app.post("/api/shops", async (req, res) => { 
    try {
      const shopData = insertShopSchema.parse(req.body);
      const newShop = await storage.addShop(shopData);
      res.status(201).json(newShop);
    } catch (error) {
      console.error("Error creating shop:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to create shop" });
    }
  });

  app.get("/api/shops", async (req, res) => { 
    try {
      const shops = await storage.getShops();
      res.json(shops);
    } catch (error) {
      console.error("Error fetching shops:", error);
      res.status(500).json({ error: "Failed to fetch shops" });
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
    } catch (error) {
      console.error("Error deleting shop:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete shop" });
    }
  });
  // Fim das rotas de manutenção das subcategorias 'shopping'
  //------------------------------------------------------------------------------------------------------------

  // Início das rotas de manutenção das subcategorias 'transportation'
  app.post("/api/places", async (req, res) => { 
    try {
      const placeData = insertPlaceSchema.parse(req.body);
      const newPlace = await storage.addPlace(placeData);
      res.status(201).json(newPlace);
    } catch (error) {
      console.error("Error creating place:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to create place" });
    }
  });

  app.get("/api/places", async (req, res) => { 
    try {
      const places = await storage.getPlaces();
      res.json(places);
    } catch (error) {
      console.error("Error fetching places:", error);
      res.status(500).json({ error: "Failed to fetch places" });
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
    } catch (error) {
      console.error("Error deleting place:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete place" });
    }
  });
  // Fim das rotas de manutenção das subcategorias 'transportation'
  //------------------------------------------------------------------------------------------------------------

  // Início das rotas de manutenção das subcategorias 'health'
  app.post("/api/health-types", async (req, res) => {
    try {
      const healthType = insertHealthTypeSchema.parse(req.body);
      const created = await storage.addHealthType(healthType);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid health type data" });
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
    } catch (error) {
      console.error("Error deleting health type:", error);
      if (error instanceof z.ZodError) { // Inclua tratamento Zod para consistência
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete health type" });
    }
  });
  // Fim das rotas de manutenção das subcategorias 'health'
  //------------------------------------------------------------------------------------------------------------

  // Início das rotas de manutenção das subcategorias 'family'
  app.post("/api/family-members", async (req, res) => {
    try {
      const familyMember = insertFamilyMemberSchema.parse(req.body);
      const created = await storage.addFamilyMember(familyMember);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid family member data" });
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
    } catch (error) {
      console.error("Error deleting family member:", error);
      if (error instanceof z.ZodError) { // Inclua tratamento Zod para consistência
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete family member" });
    }
  });
  // Fim das rotas de manutenção das subcategorias 'family'
  //------------------------------------------------------------------------------------------------------------

  // Início das rotas de manutenção das subcategorias 'charity'
  app.post("/api/charity-types", async (req, res) => {
    try {
      const charityType = insertCharityTypeSchema.parse(req.body);
      const created = await storage.addCharityType(charityType);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid charity type data" });
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
    } catch (error) {
      console.error("Error deleting charity type:", error);
      if (error instanceof z.ZodError) { // Inclua tratamento Zod para consistência
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete charity type" });
    }
  });
  // Fim das rotas de manutenção das subcategorias 'charity'
  //------------------------------------------------------------------------------------------------------------

  //------------------------------------------------------------------------------------------------------------
  // fim das ROTAS PARA MANUTENÇÃO DAS SUBCATEGORIAS


  const httpServer = createServer(app);
  return httpServer;
}
