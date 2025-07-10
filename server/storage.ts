// IMPORTS 

import {
  expenses,
  occasionalGroups,
  fixedExpenseTypes, 
  supermarkets, 
  restaurants,
  serviceTypes,
  leisureTypes,
  personalCareTypes,
  shops, 
  places, 
  healthTypes,  
  familyMembers, 
  charityTypes,
  type Expense,
  type InsertExpense,
  type OccasionalGroup,
  type InsertOccasionalGroup,
  type FixedExpenseType, 
  type InsertFixedExpenseType,  
  type Supermarket, 
  type InsertSupermarket,
  type Restaurant,  
  type InsertRestaurant,  
  type ServiceType, 
  type InsertServiceType,
  type LeisureType, 
  type InsertLeisureType,  
  type PersonalCareType,  
  type InsertPersonalCareType,  
  type Shop,  
  type InsertShop,  
  type Place,
  type InsertPlace,  
  type HealthType,  
  type InsertHealthType,  
  type FamilyMember,  
  type InsertFamilyMember,  
  type CharityType, 
  type InsertCharityType, 
  
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, and, gte, lte } from "drizzle-orm";


// INTERFACE ISTORAGE: Define os métodos que qualquer implementação de armazenamento deve fornecer
//-----------------------------------------------------------------------------------------
export interface IStorage {
  
  // Expenses
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpenses(): Promise<any[]>;
  getExpensesByMonth(year: number, month: number): Promise<any[]>;
  getExpensesByYear(year: number): Promise<any[]>;
  getRecentExpenses(limit?: number): Promise<any[]>;
  getMonthlyStats(): Promise<any>;
  getAnnualStats(year: number): Promise<any>;
  getCategoryBreakdown(year: number, month?: number): Promise<any[]>;

  // Occasional Groups
  createOccasionalGroup(group: InsertOccasionalGroup): Promise<OccasionalGroup>;
  getOccasionalGroups(): Promise<OccasionalGroup[]>;
  getOpenOccasionalGroups(): Promise<OccasionalGroup[]>;
  updateOccasionalGroupStatus( id: number, status: "open" | "closed"): Promise<OccasionalGroup>;
  deleteOccasionalGroup(id: number): Promise<OccasionalGroup | null>;


  // Para as subcategorias rotineiras

  // Para manutenção da subcategoria 'fixed'
  addFixedExpenseType(fixedExpenseType: InsertFixedExpenseType): Promise<FixedExpenseType>; 
  getFixedExpenseTypes(): Promise<FixedExpenseType[]>; 
  deleteFixedExpenseType(id: number): Promise<FixedExpenseType | null>;
  
  // Para manutenção da subcategoria 'supermarket'
  addSupermarket(supermarket: InsertSupermarket): Promise<Supermarket>;
  getSupermarkets(): Promise<Supermarket[]>;
  deleteSupermarket(id: number): Promise<Supermarket | null>;
  
  // Para manutenção da subcategoria 'food'
  addRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  getRestaurants(): Promise<Restaurant[]>;
  deleteRestaurant(id: number): Promise<Restaurant | null>;

  // Para manutenção da subcategoria 'services'
  addServiceType(serviceType: InsertServiceType): Promise<ServiceType>;
  getServiceTypes(): Promise<ServiceType[]>;
  deleteServiceType(id: number): Promise<ServiceType | null>;

  // Para manutenção da subcategoria 'leisure'
  addLeisureType(leisureType: InsertLeisureType): Promise<LeisureType>;
  getLeisureTypes(): Promise<LeisureType[]>;
  deleteLeisureType(id: number): Promise<LeisureType | null>;

  // Para manutenção da subcategoria 'personal-care'
  addPersonalCareType(personalCareType: InsertPersonalCareType): Promise<PersonalCareType>;
  getPersonalCareTypes(): Promise<PersonalCareType[]>;
  deletePersonalCareType(id: number): Promise<PersonalCareType | null>;

  // Para manutenção da subcategoria 'shopping'
  addShop(shop: InsertShop): Promise<Shop>;
  getShops(): Promise<Shop[]>;
  deleteShop(id: number): Promise<Shop | null>;

  // Para manutenção da subcategoria 'transportation'
  addPlace(place: InsertPlace): Promise<Place>; 
  getPlaces(): Promise<Place[]>;
  deletePlace(id: number): Promise<Place | null>;

  // Para manutenção da subcategoria 'health'
  addHealthType(healthType: InsertHealthType): Promise<HealthType>; 
  getHealthTypes(): Promise<HealthType[]>; 
  deleteHealthType(id: number): Promise<HealthType | null>;

  // Para manutenção da subcategoria 'family'
  addFamilyMember(familyMember: InsertFamilyMember): Promise<FamilyMember>;
  getFamilyMembers(): Promise<FamilyMember[]>;
  deleteFamilyMember(id: number): Promise<FamilyMember | null>;

  // Para manutenção da subcategoria 'charity'
  addCharityType(charityType: InsertCharityType): Promise<CharityType>;
  getCharityTypes(): Promise<CharityType[]>;
  deleteCharityType(id: number): Promise<CharityType | null>;

}
//-----------------------------------------------------------------------------------------


// DATABASE STORAGE: Implementa a interface IStorage usando o banco de dados para armazenar dados
//-----------------------------------------------------------------------------------------
export class DatabaseStorage implements IStorage {
  
  // CREATE EXPENSE: Insere uma nova despesa no banco de dados
  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values(insertExpense)
      .returning();
    return expense;
  }

  // GET EXPENSES BASE QUERY: Retorna a consulta base para despesas com JOINs
  private async getExpensesBaseQuery() {
    return db
      .select({

        // Para todas as despesas
        id: expenses.id,  // ID da despesa
        amount: expenses.amount,  // Valor da despesa
        purchaseDate: expenses.purchaseDate,  // Data da compra
        paymentMethod: expenses.paymentMethod,  // Método de pagamento
        expenseType: expenses.expenseType,  // Tipo de despesa (rotina ou ocasional)
        createdAt: expenses.createdAt,  // Data de criação da despesa
        

        // Para as subcategorias de despesas ocasionais
        occasionalGroupId: expenses.occasionalGroupId,  // ID do grupo de despesas ocasionais (se for ocasional)
        occasionalGroupName: occasionalGroups.name,  // Nome do grupo de despesas ocasionais
        occasionalGroupDescription: occasionalGroups.description,  // Descrição do grupo de despesas ocasionais
        occasionalGroupIconName: occasionalGroups.iconName,  // Nome do ícone do grupo de despesas ocasionais
        

        // Para as subcategorias de despesas rotineiras
        routineCategory: expenses.routineCategory,  // Subcategoria de despesa rotineira (se for rotina)

        // Para a subcategoria 'fixed'
        fixedExpenseTypeId: expenses.fixedExpenseTypeId,  // ID do tipo de despesa fixa
        fixedExpenseTypeName: fixedExpenseTypes.name,  // Nome do tipo de despesa fixa
        frequency: expenses.frequency,  // Frequência da despesa fixa

        // Para a subcategoria 'supermarket'
        supermarketId: expenses.supermarketId,  // ID do supermercado
        supermarketName: supermarkets.name,  // Nome do supermercado

        // Para a subcategoria 'food'
        restaurantId: expenses.restaurantId,  // ID do restaurante
        restaurantName: restaurants.name,  // Nome do restaurante
        occasionType: expenses.occasionType,  // Tipo de ocasião
        specialOccasionDescription: expenses.specialOccasionDescription,  // Descrição da ocasião especial
        foodPurchaseType: expenses.foodPurchaseType,  // Tipo de compra de alimentos
        
        // Para a subcategoria 'services'
        serviceTypeId: expenses.serviceTypeId,  // ID do tipo de serviço
        serviceTypeName: serviceTypes.name,  // Nome do tipo de serviço
        serviceDescription: expenses.serviceDescription,  // Descrição do serviço

        // Para a subcategoria 'leisure'
        leisureTypeId: expenses.leisureTypeId,  // ID do tipo de lazer
        leisureTypeName: leisureTypes.name,  // Nome do tipo de lazer
        leisureDescription: expenses.leisureDescription,  // Descrição do lazer

        // Para a subcategoria 'personal-care'
        personalCareTypeId: expenses.personalCareTypeId,  // ID do tipo de cuidado pessoal
        personalCareTypeName: personalCareTypes.name,  // Nome do tipo de cuidado pessoal
        personalCareDescription: expenses.personalCareDescription,  // Descrição do cuidado pessoal

        // Para a subcategoria 'shopping'        
        shopId: expenses.shopId,  // ID da loja
        shopName: shops.name,  // Nome da loja
        shoppingPurchaseType: expenses.shoppingPurchaseType,  // Tipo de compra de compras
        shoppingOccasionType: expenses.shoppingOccasionType,  // Tipo de ocasião de compras
        shoppingSpecialOccasionDescription: expenses.shoppingSpecialOccasionDescription,  // Descrição da ocasião especial de compras

        // Para a subcategoria 'transportation'
        startPlaceId: expenses.startPlaceId,  // ID do lugar de partida
        endPlaceId: expenses.endPlaceId,  // ID do lugar de destino
        // Não adicionar startPlaceName/endPlaceName aqui para simplificar JOINS complexos
        startingPoint: expenses.startingPoint,  // Ponto de partida
        destination: expenses.destination,  // Destino          
        transportMode: expenses.transportMode,  // Modo de transporte
        transportDescription: expenses.transportDescription,  // Descrição do transporte

        // Para a subcategoria 'health'
        healthTypeId: expenses.healthTypeId,  // ID do tipo de saúde
        healthTypeName: healthTypes.name,  // Nome do tipo de saúde
        healthDescription: expenses.healthDescription,  // Descrição da saúde

        // Para a subcategoria 'family'
        familyMemberId: expenses.familyMemberId,  // ID do membro da família
        familyMemberName: familyMembers.name,  // Nome do membro da família
        familyDescription: expenses.familyDescription,  // Descrição da família

        // Para a subcategoria 'charity'
        charityTypeId: expenses.charityTypeId,  // ID do tipo de caridade
        charityTypeName: charityTypes.name,  // Nome do tipo de caridade
        charityDescription: expenses.charityDescription,  // Descrição da caridade

               
      })
      .from(expenses)
      .leftJoin(fixedExpenseTypes, eq(expenses.fixedExpenseTypeId, fixedExpenseTypes.id))
      .leftJoin(supermarkets, eq(expenses.supermarketId, supermarkets.id))
      .leftJoin(restaurants, eq(expenses.restaurantId, restaurants.id))      
      .leftJoin(serviceTypes, eq(expenses.serviceTypeId, serviceTypes.id))
      .leftJoin(leisureTypes, eq(expenses.leisureTypeId, leisureTypes.id))
      .leftJoin(personalCareTypes, eq(expenses.personalCareTypeId, personalCareTypes.id))     
      .leftJoin(shops, eq(expenses.shopId, shops.id)) 
      .leftJoin(healthTypes, eq(expenses.healthTypeId, healthTypes.id))
      .leftJoin(familyMembers, eq(expenses.familyMemberId, familyMembers.id))
      .leftJoin(charityTypes, eq(expenses.charityTypeId, charityTypes.id))
      // Não adicionar JOINS para 'places' aqui para evitar complexidade dupla

    .leftJoin(occasionalGroups, eq(expenses.occasionalGroupId, occasionalGroups.id));
  }

  // MAP EXPENSE RESULT: Mapeia os resultados da consulta para o formato esperado pelo frontend
  private mapExpenseResult(result: any[]): any[] {
    return result.map((expense) => {
      let displayName = "N/A";
      let categoryType = expense.routineCategory || "occasional";

      if (expense.expenseType === "occasional") {
        // Usar o nome do grupo ocasional ou a descrição
        displayName = expense.occasionalGroupName || expense.occasionalGroupDescription || "Grupo Ocasional";
      } else { // expenseType === "routine"
        switch (expense.routineCategory) {
          case "fixed":
            displayName = expense.fixedExpenseTypeName || "Despesa Fixa (Tipo não especificado)";
            break;
          case "supermarket":
            displayName = expense.supermarketName || "Supermercado";
            break;
          case "food":
            displayName = expense.restaurantName || expense.description || "Alimentação";
            break;
          case "services":
            displayName = expense.serviceTypeName || expense.serviceDescription || "Serviços";
            break;
          case "leisure":
            displayName = expense.leisureTypeName || expense.leisureDescription || "Lazer";
            break;
          case "personal-care":
            displayName = expense.personalCareTypeName || expense.personalCareDescription || "Cuidado Pessoal";
            break;
          case "shopping":
            displayName = expense.shopName || expense.shoppingDescription || "Compras";
            break;
          case "transportation":
            displayName = expense.transportDescription || expense.transportMode || "Transporte";
            // Nomes dos lugares (startPlaceName, endPlaceName) serão resolvidos no frontend
            break;            
          case "health":
            displayName = expense.healthTypeName || expense.description || "Saúde";
            break;            
          case "family":
            displayName = expense.familyMemberName || expense.description || "Família";
            break;
          case "charity":
            displayName = expense.charityTypeName || expense.description || "Caridade";
            break;
            
          default:
            displayName = expense.description || "Despesa Rotineira";
        }
      }

      return {
        ...expense,
        displayName: displayName,
        category: categoryType,
      };
    });
  }

  
  // FUNÇÕES ASSÍNCRONAS PARA RETORNOS DAS DESPESAS 
  //---------------------------------------------------------------------------------------------  
  // GET EXPENSES: Retorna todas as despesas ordenadas pela data de compra
  async getExpenses(): Promise<any[]> {
    const result = await (await this.getExpensesBaseQuery()).orderBy(desc(expenses.purchaseDate));
    return this.mapExpenseResult(result);
  }

  // GET EXPENSES BY MONTH: Retorna as despesas de um mês específico
  async getExpensesByMonth(year: number, month: number): Promise<any[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const result = await (await this.getExpensesBaseQuery())
      .where(and(gte(expenses.purchaseDate, startDate), lte(expenses.purchaseDate, endDate)))
      .orderBy(desc(expenses.purchaseDate));
    return this.mapExpenseResult(result);
  }

  // GET EXPENSES BY YEAR: Retorna as despesas de um ano específico
  async getExpensesByYear(year: number): Promise<any[]> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const result = await (await this.getExpensesBaseQuery())
      .where(and(gte(expenses.purchaseDate, startDate), lte(expenses.purchaseDate, endDate)))
      .orderBy(desc(expenses.purchaseDate));
    return this.mapExpenseResult(result);
  }

  // GET RECENT EXPENSES: Retorna as despesas mais recentes
  async getRecentExpenses(limit: number = 5): Promise<any[]> {
    const result = await (await this.getExpensesBaseQuery())
      .orderBy(desc(expenses.purchaseDate))
      .limit(limit);
    return this.mapExpenseResult(result);
  }

  // GET MONTHLY STATS: Retorna as estatísticas mensais
  async getMonthlyStats(): Promise<any> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const monthlyExpenses = await this.getExpensesByMonth(currentYear, currentMonth);
    const yearlyExpenses = await this.getExpensesByYear(currentYear);

    const monthlyTotal = monthlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const yearlyTotal = yearlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const averageMonthly = yearlyTotal / currentMonth;

    return {
      monthlyTotal,
      yearlyTotal,
      averageMonthly,
      categoriesCount: 10,
    };
  }

  // GET ANNUAL STATS: Retorna as estatísticas anuais 
  async getAnnualStats(year: number): Promise<any> {
    const yearlyExpenses = await this.getExpensesByYear(year);
    const total = yearlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const avgMonthly = total / 12;

    const categoryTotals: { [key: string]: number } = {};
    yearlyExpenses.forEach((expense) => {
      const category = expense.routineCategory || "occasional";
      categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount);
    });

    const topCategory =
      Object.keys(categoryTotals).length > 0
        ? Object.entries(categoryTotals).reduce((a, b) => categoryTotals[a[0]] > categoryTotals[b[0]] ? a : b,)[0]
        : "none";

    return {
      total,
      avgMonthly,
      topCategory,
      categoryTotals,
    };
  }

  // GET CATEGORY BREAKDOWN: Retorna o desdobramento de categorias
  async getCategoryBreakdown(year: number, month?: number): Promise<any[]> {
    const expenseList = month ? await this.getExpensesByMonth(year, month) : await this.getExpensesByYear(year);

    const categoryTotals: { [key: string]: number } = {};
    expenseList.forEach((expense) => {
      const category = expense.routineCategory || "occasional";
      categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount);
    });

    const totalAmount = expenseList.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    return Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total,
      percentage: totalAmount > 0 ? (total / totalAmount) * 100 : 0,
    }));
  }
  //---------------------------------------------------------------------------------------------
  // fim das FUNÇÕES ASSÍNCRONAS PARA RETORNOS DAS DESPESAS


  // FUNÇÕES ASSÍNCRONAS PARA AS DESPESAS OCASIONAIS
  //---------------------------------------------------------------------------------------------  
  // CREATE OCCASIONAL GROUP: Insere um novo grupo de despesas ocasionais no banco de dados
  async createOccasionalGroup(insertGroup: InsertOccasionalGroup): Promise<OccasionalGroup> {
    const [group] = await db
      .insert(occasionalGroups)
      .values({
        name: insertGroup.name,
        status: insertGroup.status || "open", // Garante default 'open' se não for enviado
        description: insertGroup.description || null, 
        iconName: insertGroup.iconName || null, 
      })
      .returning();
    return group;
  }

  // GET OCCASIONAL GROUPS: Retorna todos os grupos de despesas ocasionais ordenados pela data de criação
  async getOccasionalGroups(): Promise<OccasionalGroup[]> {
    return await db
      .select({ 
          id: occasionalGroups.id,
          name: occasionalGroups.name,
          status: occasionalGroups.status,
          createdAt: occasionalGroups.createdAt,
          description: occasionalGroups.description, 
          iconName: occasionalGroups.iconName,     
      })
      .from(occasionalGroups)
      .orderBy(desc(occasionalGroups.createdAt));
  }

  // GET OPEN OCCASIONAL GROUPS: Retorna todos os grupos de despesas ocasionais abertos ordenados pela data de criação
  async getOpenOccasionalGroups(): Promise<OccasionalGroup[]> {
    return await db
      .select({ 
          id: occasionalGroups.id,
          name: occasionalGroups.name,
          status: occasionalGroups.status,
          createdAt: occasionalGroups.createdAt,
          description: occasionalGroups.description, 
          iconName: occasionalGroups.iconName,      
      })
      .from(occasionalGroups)
      .where(eq(occasionalGroups.status, "open"))
      .orderBy(desc(occasionalGroups.createdAt));
  }

  // DELETE OCCASIONAL GROUP: Exclui um grupo de despesas ocasionais do banco de dados
  async deleteOccasionalGroup(id: number): Promise<OccasionalGroup | null> { 
      const [deletedGroup] = await db
          .delete(occasionalGroups)
          .where(eq(occasionalGroups.id, id))
          .returning();
      return deletedGroup || null;
  }

  // UPDATE OCCASIONAL GROUP STATUS: Atualiza o status de um grupo de despesas ocasionais
  async updateOccasionalGroupStatus(id: number, status: "open" | "closed"): Promise<OccasionalGroup> {
    const [group] = await db.update(occasionalGroups).set({ status }).where(eq(occasionalGroups.id, id)).returning();
    return group;
  }
  //---------------------------------------------------------------------------------------------
  // fim das FUNÇÕES ASSÍNCRONAS PARA AS DESPESAS OCASIONAIS


  // FUNÇÕES ASSÍNCRONAS PARA AS DESPESAS ROTINEIRAS
  //---------------------------------------------------------------------------------------------
  // Início das funções de manutenção da subcategoria 'fixed'
  async addFixedExpenseType(insertFixedExpenseType: InsertFixedExpenseType): Promise<FixedExpenseType> { 
    const [fixedExpenseType] = await db
      .insert(fixedExpenseTypes)
      .values(insertFixedExpenseType)
      .returning();
    return fixedExpenseType;
  }

  async getFixedExpenseTypes(): Promise<FixedExpenseType[]> { 
    return await db.select().from(fixedExpenseTypes).orderBy(fixedExpenseTypes.name);
  }
  
  async deleteFixedExpenseType(id: number): Promise<FixedExpenseType | null> {
    const [deletedFixedExpenseType] = await db
      .delete(fixedExpenseTypes)
      .where(eq(fixedExpenseTypes.id, id))
      .returning();
    return deletedFixedExpenseType || null;
  }
  // Fim das funções de manutenção da subcategoria 'fixed'
  //---------------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'supermarket'
  async addSupermarket(insertSupermarket: InsertSupermarket): Promise<Supermarket> {
    const [supermarket] = await db
      .insert(supermarkets)
      .values(insertSupermarket)
      .returning();
    return supermarket;
  }

  async getSupermarkets(): Promise<Supermarket[]> {
    return await db
      .select()
      .from(supermarkets)
      .orderBy(supermarkets.name);
  }
  
  async deleteSupermarket(id: number): Promise<Supermarket | null> {
    const [deletedSupermarket] = await db
      .delete(supermarkets)
      .where(eq(supermarkets.id, id))
      .returning();
    return deletedSupermarket || null;
  }
  // Fim das funções de manutenção da subcategoria 'supermarket'
  //---------------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'food'
  async addRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const [restaurant] = await db
      .insert(restaurants)
      .values(insertRestaurant)
      .returning();
    return restaurant;
  }

  async getRestaurants(): Promise<Restaurant[]> {
    return await db.select().from(restaurants).orderBy(restaurants.name);
  }
  
  async deleteRestaurant(id: number):     Promise<Restaurant | null> { 
    const [deletedRestaurant] = await db
      .delete(restaurants)
      .where(eq(restaurants.id, id))
      .returning();
    return deletedRestaurant || null;
  }
  // Fim das funções de manutenção da subcategoria 'food'
  //---------------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'services'
  async addServiceType(insertServiceType: InsertServiceType): Promise<ServiceType> { 
    const [serviceType] = await db
      .insert(serviceTypes)
      .values(insertServiceType)
      .returning();
    return serviceType;
  }

  async getServiceTypes(): Promise<ServiceType[]> {
    return await db.select().from(serviceTypes).orderBy(serviceTypes.name);
  }

  async deleteServiceType(id: number): Promise<ServiceType | null> { 
    const [deletedServiceType] = await db
      .delete(serviceTypes)
      .where(eq(serviceTypes.id, id))
      .returning();
    return deletedServiceType || null;
  }
  // Fim das funções de manutenção da subcategoria 'services'
  //---------------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'leisure'
  async addLeisureType(insertLeisureType: InsertLeisureType): Promise<LeisureType> {
    const [leisureType] = await db
      .insert(leisureTypes)
      .values(insertLeisureType)
      .returning();
    return leisureType;
  }

  async getLeisureTypes(): Promise<LeisureType[]> { 
    return await db.select().from(leisureTypes).orderBy(leisureTypes.name);
  }

  async deleteLeisureType(id: number): Promise<LeisureType | null> { 
    const [deletedLeisureType] = await db
      .delete(leisureTypes)
      .where(eq(leisureTypes.id, id))
      .returning();
    return deletedLeisureType || null;
  }
  // Fim das funções de manutenção da subcategoria 'leisure'
  //---------------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'personal-care'
  async addPersonalCareType(insertPersonalCareType: InsertPersonalCareType): Promise<PersonalCareType> {
    const [personalCareType] = await db
      .insert(personalCareTypes)
      .values(insertPersonalCareType)
      .returning();
    return personalCareType;
  }

  async getPersonalCareTypes(): Promise<PersonalCareType[]> {
    return await db
      .select()
      .from(personalCareTypes)
      .orderBy(personalCareTypes.name);
  }

  async deletePersonalCareType(id: number): Promise<PersonalCareType | null> { 
    const [deletedPersonalCareType] = await db
      .delete(personalCareTypes)
      .where(eq(personalCareTypes.id, id))
      .returning();
    return deletedPersonalCareType || null;
  }
  // Fim das funções de manutenção da subcategoria 'personal-care'
  //---------------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'shopping'
  async addShop(insertShop: InsertShop): Promise<Shop> { 
    const [shop] = await db
      .insert(shops)
      .values(insertShop)
      .returning();
    return shop;
  }

  async getShops(): Promise<Shop[]> { 
    return await db.select().from(shops).orderBy(shops.name);
  }

  async deleteShop(id: number): Promise<Shop | null> { 
    const [deletedShop] = await db
      .delete(shops)
      .where(eq(shops.id, id))
      .returning();
    return deletedShop || null;
  }
  // Fim das funções de manutenção da subcategoria 'shopping'
  //---------------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'transportation'
  async addPlace(insertPlace: InsertPlace): Promise<Place> { 
    const [place] = await db
      .insert(places)
      .values(insertPlace)
      .returning();
    return place;
  }

  async getPlaces(): Promise<Place[]> { 
    return await db.select().from(places).orderBy(places.name);
  }

  async deletePlace(id: number): Promise<Place | null> { 
    const [deletedPlace] = await db
      .delete(places)
      .where(eq(places.id, id))
      .returning();
    return deletedPlace || null;
  }
  // Fim das funções de manutenção da subcategoria 'transportation'
  //---------------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'health'
  async addHealthType(insertHealthType: InsertHealthType): Promise<HealthType> { 
    const [healthType] = await db
      .insert(healthTypes)
      .values(insertHealthType)
      .returning();
    return healthType;
  }
  
  async getHealthTypes(): Promise<HealthType[]> { 
    return await db.select().from(healthTypes).orderBy(healthTypes.name);
  }

  async deleteHealthType(id: number): Promise<HealthType | null> { 
    const [deletedHealthType] = await db
      .delete(healthTypes)
      .where(eq(healthTypes.id, id))
      .returning();
    return deletedHealthType || null;
  }
  // Fim das funções de manutenção da subcategoria 'health'
  //---------------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'family'
  async addFamilyMember(
    insertFamilyMember: InsertFamilyMember,
  ): Promise<FamilyMember> {
    const [familyMember] = await db
      .insert(familyMembers)
      .values(insertFamilyMember)
      .returning();
    return familyMember;
  }

  async getFamilyMembers(): Promise<FamilyMember[]> {
    return await db.select().from(familyMembers).orderBy(familyMembers.name);
  }

  async deleteFamilyMember(id: number): Promise<FamilyMember | null> {
    const [deletedFamilyMember] = await db
      .delete(familyMembers)
      .where(eq(familyMembers.id, id))
      .returning();
    return deletedFamilyMember || null;
  }
  // Fim das funções de manutenção da subcategoria 'family'
  //---------------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'charity'
  async addCharityType(
    insertCharityType: InsertCharityType,
  ): Promise<CharityType> {
    const [charityType] = await db
      .insert(charityTypes)
      .values(insertCharityType)
      .returning();
    return charityType;
  }

  async getCharityTypes(): Promise<CharityType[]> {
    return await db.select().from(charityTypes).orderBy(charityTypes.name);
  }

  async deleteCharityType(id: number): Promise<CharityType | null> {
    const [deletedCharityType] = await db
      .delete(charityTypes)
      .where(eq(charityTypes.id, id))
      .returning();
    return deletedCharityType || null;
  }
  //---------------------------------------------------------------------------------------------
  // fim das FUNÇÕES ASSÍNCRONAS PARA AS DESPESAS ROTINEIRAS
}
//-----------------------------------------------------------------------------------------

  
// MEMORY STORAGE: Implementa a interface IStorage usando a memória para armazenar dados
class MemoryStorage implements IStorage {

  // PRIVATES: Armazena os dados em memória
  //-----------------------------------------------------------------------------------------

  // expenses: Armazena as despesas em memória
  private expenses: Expense[] = [];

  // occasionalGroups: Armazena os grupos de despesas ocasionais em memória
  private occasionalGroups: OccasionalGroup[] = [
    { id: 1, name: "Viagem para o show", status: "open", createdAt: new Date(), description: "Gastos de 3 dias no festival", iconName: "Music" },
    { id: 2, name: "Aniversário do João", status: "open", createdAt: new Date(), description: "Compras e jantar", iconName: "Cake" },
    { id: 3, name: "Festa de fim de ano", status: "closed", createdAt: new Date(), description: "Compras e jantar", iconName: "PartyPopper" }
  ];

  
  // Para as subcategorias de despesas rotineiras
  
  // fixedExpenseTypes: Armazena os tipos de despesas fixas em memória
  private fixedExpenseTypes: FixedExpenseType[] = [
    { id: 1, name: "Aluguel do apartamento" },
    { id: 2, name: "Conta de luz" },
    { id: 3, name: "Conta de água" },
  ];

  // supermarkets: Armazena os supermercados em memória
  private supermarkets: Supermarket[] = [
    { id: 1, name: "Villareal" },
    { id: 2, name: "Bretas" },
    { id: 3, name: "Consul" },
  ];

  // restaurants: Armazena os restaurantes em memória
  private restaurants: Restaurant[] = [
    { id: 1, name: "McDonald's" },
    { id: 2, name: "Subway" },
    { id: 3, name: "Spoleto" },
  ];

  // serviceTypes: Armazena os tipos de serviços em memória
  private serviceTypes: ServiceType[] = [
    { id: 1, name: "Serviços Domésticos" },
    { id: 2, name: "Serviços Técnicos" },
    { id: 3, name: "Serviços Automotivos" },
  ];

  // leisureTypes: Armazena os tipos de lazer em memória
  private leisureTypes: LeisureType[] = [
    { id: 1, name: "Cinema" },
    { id: 2, name: "Rolê" },
    { id: 3, name: "Assinatura de Streaming" },
  ];

  // personalCareTypes: Armazena os tipos de cuidado pessoal em memória
  private personalCareTypes: PersonalCareType[] = [
    { id: 1, name: "Cabelo" },
    { id: 2, name: "Maquiagem" },
    { id: 3, name: "Pele" },
  ];

  // shops: Armazena as lojas em memória
  private shops: Shop[] = [
    { id: 1, name: "Amazon" },
    { id: 2, name: "Kalunga" },
    { id: 3, name: "Mercado Livre" },
  ];

  // places: Armazena os lugares em memória
  private places: Place[] = [
    { id: 1, name: "H8" },
    { id: 2, name: "Apê do Gabi" },
    { id: 3, name: "Shopping Centervale" },
  ];

  // healthTypes: Armazena os tipos de saúde em memória
  private healthTypes: HealthType[] = [
    { id: 1, name: "Remédio" },
    { id: 2, name: "Atendimento Médico" },
    { id: 3, name: "Avaliação Psicológica" },
  ];

  // familyMembers: Armazena os membros da família em memória  
  private familyMembers: FamilyMember[] = [
    { id: 1, name: "Mamãe" },
    { id: 2, name: "Vovó" },
    { id: 3, name: "Fernando" },
  ];

  // charityTypes: Armazena os tipos de caridade em memória
  private charityTypes: CharityType[] = [
    { id: 1, name: "Igreja" },
    { id: 2, name: "Ajuda à Catástrofe" },
    { id: 3, name: "Doação na Rua" },
  ];
  //-----------------------------------------------------------------------------------------

  // CREATE EXPENSE: Insere uma nova despesa em memória
  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const expense: Expense = {

      // Geral para todas as despesas
      id: this.expenses.length + 1,
      amount: insertExpense.amount,
      purchaseDate: insertExpense.purchaseDate,
      paymentMethod: insertExpense.paymentMethod,
      expenseType: insertExpense.expenseType,
      routineCategory: insertExpense.routineCategory ?? null,
      occasionalGroupId: insertExpense.occasionalGroupId || null,
      createdAt: new Date(),

      // Para as subcategorias de despesas rotineiras

      // Para a subcategoria 'fixed'
      fixedExpenseTypeId: insertExpense.fixedExpenseTypeId || null,
      frequency: insertExpense.frequency || null,      

      // Para a subcategoria 'supermarket'
      supermarketId: insertExpense.supermarketId || null, 

      // Para a subcategoria 'food'
      restaurantId: insertExpense.restaurantId || null, 
      occasionType: insertExpense.occasionType || "normal",
      specialOccasionDescription: insertExpense.specialOccasionDescription || null,
      foodPurchaseType: insertExpense.foodPurchaseType || null,

      // Para a subcategoria 'services'
      serviceTypeId: insertExpense.serviceTypeId || null,     
      serviceDescription: insertExpense.serviceDescription || null,

      // Para a subcategoria 'leisure'
      leisureTypeId: insertExpense.leisureTypeId || null,     
      leisureDescription: insertExpense.leisureDescription || null,

      // Para a subcategoria 'personal-care'
      personalCareTypeId: insertExpense.personalCareTypeId || null, 
      personalCareDescription: insertExpense.personalCareDescription || null,

      // Para a subcategoria 'shopping'
      shopId: insertExpense.shopId || null,
      shoppingPurchaseType: insertExpense.shoppingPurchaseType || null,
      shoppingOccasionType: insertExpense.shoppingOccasionType || "normal",
      shoppingSpecialOccasionDescription: insertExpense.shoppingSpecialOccasionDescription || null,

      // Para a subcategoria 'transportation'
      startPlaceId: insertExpense.startPlaceId || null,
      endPlaceId: insertExpense.endPlaceId || null,      
      startingPoint: insertExpense.startingPoint ?? null,
      destination: insertExpense.destination ?? null,
      transportMode: insertExpense.transportMode || null,      
      transportDescription: insertExpense.transportDescription || null,

      // Para a subcategoria 'health'        
      healthTypeId: insertExpense.healthTypeId || null,
      healthDescription: insertExpense.healthDescription || null,

      // Para a subcategoria 'family'
      familyMemberId: insertExpense.familyMemberId || null,
      familyDescription: insertExpense.familyDescription || null,

      // Para a subcategoria 'charity'
      charityTypeId: insertExpense.charityTypeId || null,
      charityDescription: insertExpense.charityDescription || null,

      
    };
    this.expenses.push(expense);
    return expense;
  }

  // FUNÇÕES ASSÍNCRONAS PARA RETORNOS DAS DESPESAS 
  //--------------------------------------------------------------------------------------------- 
  // GET EXPENSES: Retorna todas as despesas ordenadas pela data de compra
  async getExpenses(): Promise<Expense[]> {
    return this.expenses.sort(
      (a, b) =>
        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(),
    );
  }

  // GET EXPENSES BY MONTH: Retorna as despesas de um mês específico
  async getExpensesByMonth(year: number, month: number): Promise<Expense[]> {
    return this.expenses.filter((expense) => {
      const date = new Date(expense.purchaseDate);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    });
  }

  // GET EXPENSES BY YEAR: Retorna as despesas de um ano específico
  async getExpensesByYear(year: number): Promise<Expense[]> {
    return this.expenses.filter((expense) => {
      const date = new Date(expense.purchaseDate);
      return date.getFullYear() === year;
    });
  }

  // GET RECENT EXPENSES: Retorna as despesas mais recentes
  async getRecentExpenses(limit: number = 5): Promise<any[]> {
    return this.expenses
      .sort(
        (a, b) =>
          new Date(b.purchaseDate).getTime() -
          new Date(a.purchaseDate).getTime(),
      )
      .slice(0, limit)
      .map((expense) => {
        let displayName = "Unknown"; // Valor padrão para casos não encontrados
        let categoryType = expense.routineCategory || "occasional"; // Determina a categoria principal (enum string)

        if (expense.expenseType === "occasional") {
          const occasionalGroup = this.occasionalGroups.find(g => g.id === expense.occasionalGroupId);
          displayName = occasionalGroup?.name || "Grupo Ocasional";
        } else { // expenseType === "routine"
          switch (expense.routineCategory) {
            case "fixed":
              const fixedType = this.fixedExpenseTypes.find(t => t.id === expense.fixedExpenseTypeId);
              displayName = fixedType?.name || "Despesa Fixa";
              break;
            case "supermarket":
              const supermarket = this.supermarkets.find(s => s.id === expense.supermarketId);
              displayName = supermarket?.name || "Supermercado";
              break;
            case "food":
              const restaurant = this.restaurants.find(r => r.id === expense.restaurantId);
              displayName = restaurant?.name || expense.specialOccasionDescription || "Alimentação";
              break;
            case "services":
              const serviceType = this.serviceTypes.find(t => t.id === expense.serviceTypeId);
              displayName = serviceType?.name || expense.serviceDescription || "Serviços";
              break;
            case "leisure":
              const leisureType = this.leisureTypes.find(t => t.id === expense.leisureTypeId);
              displayName = leisureType?.name || expense.leisureDescription || "Lazer";
              break;
            case "personal-care":
              const personalCareType = this.personalCareTypes.find(t => t.id === expense.personalCareTypeId);
              displayName = personalCareType?.name || expense.personalCareDescription || "Cuidado Pessoal";
              break;
            case "shopping":
              const shop = this.shops.find(s => s.id === expense.shopId);
              displayName = shop?.name || expense.shoppingSpecialOccasionDescription || "Compras";
              break;
            case "transportation":
              const startPlace = this.places.find(p => p.id === expense.startPlaceId);
              const endPlace = this.places.find(p => p.id === expense.endPlaceId);
              // Para transporte, combine os nomes dos lugares ou use a descrição da viagem
              if (startPlace?.name && endPlace?.name) {
                  displayName = `${startPlace.name} -> ${endPlace.name}`;
              } else {
                  displayName = expense.transportDescription || expense.transportMode || "Transporte";
              }
              break;
            case "health":
              const healthType = this.healthTypes.find(t => t.id === expense.healthTypeId);
              displayName = healthType?.name || expense.healthDescription || "Saúde";
              break;
            case "family":
              const familyMember = this.familyMembers.find(m => m.id === expense.familyMemberId);
              displayName = familyMember?.name || expense.familyDescription || "Família";
              break;
            case "charity":
              const charityType = this.charityTypes.find(t => t.id === expense.charityTypeId);
              displayName = charityType?.name || expense.charityDescription || "Caridade";
              break;
          }
        }

        return {
          ...expense,
          displayName: displayName,
          category: categoryType, // Retorna a categoria principal (enum string) para o frontend usar nos ícones
        };
      });
  }

  // GET MONTHLY STATS: Retorna as estatísticas mensais
  async getMonthlyStats(): Promise<any> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const monthlyExpenses = await this.getExpensesByMonth(
      currentYear,
      currentMonth,
    );
    const yearlyExpenses = await this.getExpensesByYear(currentYear);

    const monthlyTotal = monthlyExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0,
    );
    const yearlyTotal = yearlyExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0,
    );
    const averageMonthly = yearlyTotal / currentMonth;

    return {
      monthlyTotal,
      yearlyTotal,
      averageMonthly,
      categoriesCount: 10,
    };
  }

  // GET ANNUAL STATS: Retorna as estatísticas anuais
  async getAnnualStats(year: number): Promise<any> {
    const yearlyExpenses = await this.getExpensesByYear(year);
    const total = yearlyExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0,
    );
    const avgMonthly = total / 12;

    const categoryTotals: { [key: string]: number } = {};
    yearlyExpenses.forEach((expense) => {
      const category = expense.routineCategory || "occasional";
      categoryTotals[category] =
        (categoryTotals[category] || 0) + parseFloat(expense.amount);
    });

    const topCategory =
      Object.keys(categoryTotals).length > 0
        ? Object.entries(categoryTotals).reduce((a, b) =>
            categoryTotals[a[0]] > categoryTotals[b[0]] ? a : b,
          )[0]
        : "none";

    return {
      total,
      avgMonthly,
      topCategory,
      categoryTotals,
    };
  }

  // GET CATEGORY BREAKDOWN: Retorna o desdobramento de categorias
  async getCategoryBreakdown(year: number, month?: number): Promise<any[]> {
    const expenseList = month
      ? await this.getExpensesByMonth(year, month)
      : await this.getExpensesByYear(year);

    const categoryTotals: { [key: string]: number } = {};
    expenseList.forEach((expense) => {
      const category = expense.routineCategory || "occasional";
      categoryTotals[category] =
        (categoryTotals[category] || 0) + parseFloat(expense.amount);
    });

    const totalAmount = expenseList.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0,
    );

    return Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total,
      percentage: totalAmount > 0 ? (total / totalAmount) * 100 : 0,
    }));
  }
  //---------------------------------------------------------------------------------------------
  // fim das FUNÇÕES ASSÍNCRONAS PARA RETORNOS DAS DESPESAS

  
  // FUNÇÕES ASSÍNCRONAS PARA AS DESPESAS OCASIONAIS
  //---------------------------------------------------------------------------------------------
  // CREATE OCCASIONAL GROUP: Insere um novo grupo de despesas ocasionais em memória
  async createOccasionalGroup(insertGroup: InsertOccasionalGroup): Promise<OccasionalGroup> {
    const group: OccasionalGroup = {
      id: this.occasionalGroups.length + 1,
      ...insertGroup,
      status: "open",
      createdAt: new Date(),
    };
    this.occasionalGroups.push(group);
    return group;
  }

  // GET OCCASIONAL GROUPS: Retorna todos os grupos de despesas ocasionais ordenados pela data de criação
  async getOccasionalGroups(): Promise<OccasionalGroup[]> {
    return this.occasionalGroups.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  // GET OPEN OCCASIONAL GROUPS: Retorna todos os grupos de despesas ocasionais abertos ordenados pela data de criação
  async getOpenOccasionalGroups(): Promise<OccasionalGroup[]> {
    return this.occasionalGroups.filter((group) => group.status === "open");
  }

  // DELETE OCCASIONAL GROUP: Exclui um grupo de despesas ocasionais da memória
  async deleteOccasionalGroup(id: number): Promise<OccasionalGroup | null> {
    const index = this.occasionalGroups.findIndex((g) => g.id === id);
    if (index === -1) return null;
    const deletedGroup = this.occasionalGroups[index];
    this.occasionalGroups.splice(index, 1);
    return deletedGroup;
  }

  // UPDATE OCCASIONAL GROUP STATUS: Atualiza o status de um grupo de despesas ocasionais
  async updateOccasionalGroupStatus(id: number, status: "open" | "closed"): Promise<OccasionalGroup> {
    const group = this.occasionalGroups.find((g) => g.id === id);
    if (!group) throw new Error("Group not found");
    group.status = status;
    return group;
  }
  //---------------------------------------------------------------------------------------------
  // fim das FUNÇÕES ASSÍNCRONAS PARA DESPESAS OCASIONAIS

  
  // FUNÇÕES ASSÍNCRONAS PARA AS DESPESAS ROTINEIRAS
  //---------------------------------------------------------------------------------------------  
  // Início das funções de manutenção da subcategoria 'fixed'
  async addFixedExpenseType(insertFixedExpenseType: InsertFixedExpenseType): Promise<FixedExpenseType> {
      const fixedExpenseType: FixedExpenseType = {
          id: this.fixedExpenseTypes.length > 0 ? Math.max(...this.fixedExpenseTypes.map(t => t.id)) + 1 : 1,
          ...insertFixedExpenseType,
      };
      this.fixedExpenseTypes.push(fixedExpenseType);
      return fixedExpenseType;
  }

  async getFixedExpenseTypes(): Promise<FixedExpenseType[]> {
      return this.fixedExpenseTypes.sort((a, b) => a.name.localeCompare(b.name));
  }

  async deleteFixedExpenseType(id: number): Promise<FixedExpenseType | null> {
      const index = this.fixedExpenseTypes.findIndex(t => t.id === id);
      if (index === -1) {
          return null;
      }
      const deletedFixedExpenseType = this.fixedExpenseTypes[index];
      this.fixedExpenseTypes.splice(index, 1);
      return deletedFixedExpenseType;
  }
  // Fim das funções de manutenção da subcategoria 'fixed'
  //---------------------------------------------------------------------------------------------
 
  // Início das funções de manutenção da subcategoria 'supermarket'
  async addSupermarket(
    insertSupermarket: InsertSupermarket,
  ): Promise<Supermarket> {
    const supermarket: Supermarket = {
      id: this.supermarkets.length + 1,
      ...insertSupermarket,
    };
    this.supermarkets.push(supermarket);
    return supermarket;
  }

  async deleteSupermarket(id: number): Promise<Supermarket | null> {
    const index = this.supermarkets.findIndex((s) => s.id === id);
    if (index === -1) {
      return null;
    }
    const deletedSupermarket = this.supermarkets[index];
    this.supermarkets.splice(index, 1);
    return deletedSupermarket;
  }

  async getSupermarkets(): Promise<Supermarket[]> {
    return this.supermarkets.sort((a, b) => a.name.localeCompare(b.name));
  }
  // Fim das funções de manutenção da subcategoria 'supermarket'
  //---------------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'food' 
  async addRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const restaurant: Restaurant = {
      id: this.restaurants.length + 1,
      ...insertRestaurant,
    };
    this.restaurants.push(restaurant);
    return restaurant;
  }

  async deleteRestaurant(id: number): Promise<Restaurant | null> {
    const index = this.restaurants.findIndex((r) => r.id === id);
    if (index === -1) {
      return null;
    }
    const deletedRestaurant = this.restaurants[index];
    this.restaurants.splice(index, 1);
    return deletedRestaurant;
  }

  async getRestaurants(): Promise<Restaurant[]> {
    return this.restaurants.sort((a, b) => a.name.localeCompare(b.name));
  }
  // Fim das funções de manutenção da subcategoria 'food'
  //---------------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'services'
  async addServiceType(
    insertServiceType: InsertServiceType,
  ): Promise<ServiceType> {
    const serviceType: ServiceType = {
      id: this.serviceTypes.length + 1,
      ...insertServiceType,
    };
    this.serviceTypes.push(serviceType);
    return serviceType;
  }

  async getServiceTypes(): Promise<ServiceType[]> {
    return this.serviceTypes.sort((a, b) => a.name.localeCompare(b.name));
  }

  async deleteServiceType(id: number): Promise<ServiceType | null> {
    const index = this.serviceTypes.findIndex((r) => r.id === id);
    if (index === -1) {
      return null;
    }
    const deletedServiceType = this.serviceTypes[index];
    this.serviceTypes.splice(index, 1);
    return deletedServiceType;
  }
  // Fim das funções de manutenção da subcategoria 'services'
  //---------------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'leisure'
  async addLeisureType(
    insertLeisureType: InsertLeisureType,
  ): Promise<LeisureType> {
    const leisureType: LeisureType = {
      id: this.leisureTypes.length + 1,
      ...insertLeisureType,
    };
    this.leisureTypes.push(leisureType);
    return leisureType;
  }

  async getLeisureTypes(): Promise<LeisureType[]> {
    return this.leisureTypes.sort((a, b) => a.name.localeCompare(b.name));
  }

  async deleteLeisureType(id: number): Promise<LeisureType | null> {
    const index = this.leisureTypes.findIndex((r) => r.id === id);
    if (index === -1) {
      return null;
    }
    const deletedLeisureType = this.serviceTypes[index];
    this.leisureTypes.splice(index, 1);
    return deletedLeisureType;
  }
  // Fim das funções de manutenção da subcategoria 'leisure'
  //---------------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'personal-care'
  async addPersonalCareType(
    insertPersonalCareType: InsertPersonalCareType,
  ): Promise<PersonalCareType> {
    const personalCareType: PersonalCareType = {
      id: this.personalCareTypes.length + 1,
      ...insertPersonalCareType,
    };
    this.personalCareTypes.push(personalCareType);
    return personalCareType;
  }

  async getPersonalCareTypes(): Promise<PersonalCareType[]> {
    return this.personalCareTypes.sort((a, b) => a.name.localeCompare(b.name));
  }

  async deletePersonalCareType(id: number): Promise<PersonalCareType | null> {
    const index = this.personalCareTypes.findIndex((r) => r.id === id);
    if (index === -1) {
      return null;
    }
    const deletedPersonalCareType = this.personalCareTypes[index];
    this.personalCareTypes.splice(index, 1);
    return deletedPersonalCareType;
  }
  // Fim das funções de manutenção da subcategoria 'personal-care'
  //------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'shopping' 
  async addShop(insertShop: InsertShop): Promise<Shop> {
    const shop: Shop = {
      id: this.shops.length > 0 ? Math.max(...this.shops.map(s => s.id)) + 1 : 1, // IDs robustos
      ...insertShop,
    };
    this.shops.push(shop);
    return shop;
  }

  async getShops(): Promise<Shop[]> {
    return this.shops.sort((a, b) => a.name.localeCompare(b.name));
  }

  async deleteShop(id: number): Promise<Shop | null> {
    const index = this.shops.findIndex(s => s.id === id);
    if (index === -1) {
      return null;
    }
    const deletedShop = this.shops[index];
    this.shops.splice(index, 1);
    return deletedShop;
  }
  // Fim das funções de manutenção da subcategoria 'shopping'
  //------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'transportation'
  async addPlace(insertPlace: InsertPlace): Promise<Place> {
    const place: Place = {
      id: this.places.length > 0 ? Math.max(...this.places.map(p => p.id)) + 1 : 1, // IDs robustos
      ...insertPlace,
    };
    this.places.push(place);
    return place;
  }

  async getPlaces(): Promise<Place[]> {
    return this.places.sort((a, b) => a.name.localeCompare(b.name));
  }

  async deletePlace(id: number): Promise<Place | null> {
    const index = this.places.findIndex(p => p.id === id);
    if (index === -1) {
      return null;
    }
    const deletedPlace = this.places[index];
    this.places.splice(index, 1);
    return deletedPlace;
  }
  // Fim das funções de manutenção da subcategoria 'transportation'
  //------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'health'
  async addHealthType(insertHealthType: InsertHealthType): Promise<HealthType> {
    const healthType: HealthType = {
      id: this.healthTypes.length > 0 ? Math.max(...this.healthTypes.map(h => h.id)) + 1 : 1,
      ...insertHealthType,
    };
    this.healthTypes.push(healthType);
    return healthType;
  }

  async getHealthTypes(): Promise<HealthType[]> {
    return this.healthTypes.sort((a, b) => a.name.localeCompare(b.name));
  }

  async deleteHealthType(id: number): Promise<HealthType | null> {
    const index = this.healthTypes.findIndex(h => h.id === id);
    if (index === -1) {
      return null;
    }
    const deletedHealthType = this.healthTypes[index];
    this.healthTypes.splice(index, 1);
    return deletedHealthType;
  }
  // Fim das funções de manutenção da subcategoria 'health'
  //------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'family'
  async addFamilyMember(insertFamilyMember: InsertFamilyMember): Promise<FamilyMember> {
    const familyMember: FamilyMember = {
      id: this.familyMembers.length > 0 ? Math.max(...this.familyMembers.map(f => f.id)) + 1 : 1, 
      ...insertFamilyMember,
    };
    this.familyMembers.push(familyMember);
    return familyMember;
  }

  async getFamilyMembers(): Promise<FamilyMember[]> {
    return this.familyMembers.sort((a, b) => a.name.localeCompare(b.name));
  }

  async deleteFamilyMember(id: number): Promise<FamilyMember | null> {
    const index = this.familyMembers.findIndex(f => f.id === id);
    if (index === -1) {
      return null;
    }
    const deletedFamilyMember = this.familyMembers[index];
    this.familyMembers.splice(index, 1);
    return deletedFamilyMember;
  }
  // Fim das funções de manutenção da subcategoria 'family'
  //------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'charity'
  async addCharityType(insertCharityType: InsertCharityType): Promise<CharityType> {
    const charityType: CharityType = {
      id: this.charityTypes.length > 0 ? Math.max(...this.charityTypes.map(c => c.id)) + 1 : 1, 
      ...insertCharityType,
    };
    this.charityTypes.push(charityType);
    return charityType;
  }

  async getCharityTypes(): Promise<CharityType[]> {
    return this.charityTypes.sort((a, b) => a.name.localeCompare(b.name));
  }

  async deleteCharityType(id: number): Promise<CharityType | null> {
    const index = this.charityTypes.findIndex(c => c.id === id);
    if (index === -1) {
      return null;
    }
    const deletedCharityType = this.charityTypes[index];
    this.charityTypes.splice(index, 1);
    return deletedCharityType;
  }
  // Fim das funções de manutenção da subcategoria 'charity'
  //------------------------------------------------------------------------------------
  // fim das FUNÇÕES ASSÍNCRONAS PARA AS DESPESAS ROTINEIRAS
}
//-----------------------------------------------------------------------------------------

// CONFERIR ISSO DEPOIS
// Use memory storage for now while database connection is being resolved
export const storage = new MemoryStorage();
// export const storage = new DatabaseStorage();
