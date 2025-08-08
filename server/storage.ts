// IMPORTS

import {
  expenses,
  occasionalGroups,
  fixedExpenseTypes,
  supermarkets,
  restaurants,
  serviceTypes,
  studyTypes,
  leisureTypes,
  personalCareTypes,
  shops,
  places,
  healthTypes,
  familyMembers,
  charityTypes,
  financialYears,
  monthlyGoals,
  recurringExpenses,
  alias,
  paymentStatusEnum, 
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
  type StudyType,
  type InsertStudyType,
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
  type FinancialYear,
  type InsertFinancialYear,
  type MonthlyGoal,
  type InsertMonthlyGoal,
  type RecurringExpense, 
  type InsertRecurringExpense,
} from "@shared/schema"; 
import { db } from "./db";
import { eq, sql, desc, and, gte, lte, isNull, or} from "drizzle-orm";
import { log } from './vite';
import { format } from 'date-fns';


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
  deleteExpense(id: number): Promise<Expense | null>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | null>;
  updateOccasionalGroup(id: number, groupData: Partial<InsertOccasionalGroup>): Promise<OccasionalGroup | null>;
  markExpenseAsPaid(id: number): Promise<Expense | null>;

  // Occasional Groups
  createOccasionalGroup(group: InsertOccasionalGroup): Promise<OccasionalGroup>;
  getOccasionalGroups(): Promise<OccasionalGroup[]>;
  getOpenOccasionalGroups(): Promise<OccasionalGroup[]>;
  updateOccasionalGroupStatus(id: number, status: "open" | "closed", closingDate?: Date | null): Promise<OccasionalGroup | null>;
  deleteOccasionalGroup(id: number): Promise<OccasionalGroup | null>;
  getExpensesByOccasionalGroupId(groupId: number): Promise<any[]>;

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

  // Para manutenção da subcategoria 'study'
  addStudyType(studyType: InsertStudyType): Promise<StudyType>;
  getStudyTypes(): Promise<StudyType[]>;
  deleteStudyType(id: number): Promise<StudyType | null>;

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

  // Anos Financeiros e Metas
  createFinancialYear(yearData: InsertFinancialYear, goals: InsertMonthlyGoal[]): Promise<FinancialYear>;
  getFinancialYears(): Promise<FinancialYear[]>;
  getFinancialYearDetails(yearId: number): Promise<(FinancialYear & { monthlyGoals: MonthlyGoal[] }) | null>;
  updateFinancialYear(yearId: number, yearData: Partial<InsertFinancialYear>, goals: InsertMonthlyGoal[]): Promise<FinancialYear | null>;
  deleteFinancialYear(yearId: number): Promise<FinancialYear | null>;
  getMonthlySummaryByYear(year: number): Promise<Array<{ month: number; total: number }>>; //
  getMonthlyExpensesBreakdownByYear(year: number): Promise<Array<{ month: number; category: string; total: number }>>;

  // Gastos recorrentes
  createRecurringExpense(recurringExpense: InsertRecurringExpense): Promise<RecurringExpense>;
  getRecurringExpenses(): Promise<RecurringExpense[]>;
  getRecurringExpenseById(id: number): Promise<RecurringExpense | null>;
  updateRecurringExpense(id: number, recurringExpense: Partial<RecurringExpense>): Promise<RecurringExpense | null>;
  deleteRecurringExpense(id: number): Promise<RecurringExpense | null>;
  generateMonthlyRecurringExpenses(): Promise<void>; // Método para gerar despesas mensais
}
//-----------------------------------------------------------------------------------------


// DATABASE STORAGE: Implementa a interface IStorage usando o banco de dados para armazenar dados
//-----------------------------------------------------------------------------------------
export class DatabaseStorage implements IStorage {

  // CREATE EXPENSE: Insere uma nova despesa no banco de dados
  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    // Se paymentStatus não for fornecido, defina como 'paid' por padrão para despesas avulsas
    const finalExpenseData = {
      ...insertExpense,
      paymentStatus: insertExpense.paymentStatus || 'paid',
    };

    const [expense] = await db
      .insert(expenses)
      .values(finalExpenseData)
      .returning();
    return expense;
  }

  // GET EXPENSES BASE QUERY: Retorna a consulta base para despesas com JOINs
  private getExpensesBaseQuery() {

    const startPlaceAlias = alias(places, "start_places"); //
    const endPlaceAlias = alias(places, "end_places"); //
    // Aliases para recurring_expenses e suas relações
    const recurringStartPlaceAlias = alias(places, "recurring_start_places");
    const recurringEndPlaceAlias = alias(places, "recurring_end_places");
    // Aliases para as subcategorias do gasto recorrente
    const reFixedExpenseTypeAlias = alias(fixedExpenseTypes, 're_fixed_type');
    const reSupermarketAlias = alias(supermarkets, 're_supermarket');
    const reRestaurantAlias = alias(restaurants, 're_restaurant');
    const reServiceTypeAlias = alias(serviceTypes, 're_service_type');
    const reStudyTypeAlias = alias(studyTypes, 're_study_type');
    const reLeisureTypeAlias = alias(leisureTypes, 're_leisure_type');
    const rePersonalCareTypeAlias = alias(personalCareTypes, 're_personal_care_type');
    const reShopAlias = alias(shops, 're_shop');
    const reHealthTypeAlias = alias(healthTypes, 're_health_type');
    const reFamilyMemberAlias = alias(familyMembers, 're_family_member');
    const reCharityTypeAlias = alias(charityTypes, 're_charity_type');

    return db
      .select({
        // Para todas as despesas
        id: expenses.id, 
        amount: expenses.amount, 
        purchaseDate: expenses.purchaseDate, 
        paymentMethod: expenses.paymentMethod, 
        expenseType: expenses.expenseType, 
        createdAt: expenses.createdAt, 
        recurringExpenseId: expenses.recurringExpenseId, 
        paymentStatus: expenses.paymentStatus, 
        installmentNumber: expenses.installmentNumber,


        // Para as subcategorias de despesas ocasionais
        occasionalGroupId: expenses.occasionalGroupId, 
        occasionalGroupName: occasionalGroups.name, 
        occasionalGroupDescription: occasionalGroups.description, 
        occasionalGroupIconName: occasionalGroups.iconName,
        occasionalGroupOpeningDate: occasionalGroups.openingDate, 
        occasionalGroupClosingDate: occasionalGroups.closingDate, 


        // Para as subcategorias de despesas rotineiras
        routineCategory: expenses.routineCategory, 

        // Para a subcategoria 'fixed'
        fixedExpenseTypeId: expenses.fixedExpenseTypeId,
        fixedExpenseTypeName: fixedExpenseTypes.name, 
        frequency: expenses.frequency, 

        // Para a subcategoria 'supermarket'
        supermarketId: expenses.supermarketId,
        supermarketName: supermarkets.name,

        // Para a subcategoria 'food'
        restaurantId: expenses.restaurantId, 
        restaurantName: restaurants.name, 
        occasionType: expenses.occasionType, 
        specialOccasionDescription: expenses.specialOccasionDescription, 
        foodPurchaseType: expenses.foodPurchaseType, 

        // Para a subcategoria 'services'
        serviceTypeId: expenses.serviceTypeId, 
        serviceTypeName: serviceTypes.name, 
        serviceDescription: expenses.serviceDescription, 

        // Para a subcategoria 'study'
        studyTypeId: expenses.studyTypeId,
        studyTypeName: studyTypes.name, 
        studyDescription: expenses.studyDescription, 

        // Para a subcategoria 'leisure'
        leisureTypeId: expenses.leisureTypeId, 
        leisureTypeName: leisureTypes.name, 
        leisureDescription: expenses.leisureDescription, 

        // Para a subcategoria 'personal-care'
        personalCareTypeId: expenses.personalCareTypeId, 
        personalCareTypeName: personalCareTypes.name, 
        personalCareDescription: expenses.personalCareDescription, 

        // Para a subcategoria 'shopping'
        shopId: expenses.shopId, 
        shopName: shops.name, 
        shoppingPurchaseType: expenses.shoppingPurchaseType, 
        shoppingOccasionType: expenses.shoppingOccasionType, 
        shoppingSpecialOccasionDescription: expenses.shoppingSpecialOccasionDescription,

        // Para a subcategoria 'transportation'
        startPlaceId: expenses.startPlaceId, 
        endPlaceId: expenses.endPlaceId, 
        // Seleciona os nomes usando os aliases das tabelas no SELECT
        startPlaceName: startPlaceAlias.name, 
        endPlaceName: endPlaceAlias.name, 
        startingPoint: expenses.startingPoint, 
        destination: expenses.destination, 
        transportMode: expenses.transportMode, 
        transportDescription: expenses.transportDescription, 

        // Para a subcategoria 'health'
        healthTypeId: expenses.healthTypeId, 
        healthTypeName: healthTypes.name, 
        healthDescription: expenses.healthDescription, 

        // Para a subcategoria 'family'
        familyMemberId: expenses.familyMemberId, 
        familyMemberName: familyMembers.name, 
        familyDescription: expenses.familyDescription, 

        // Para a subcategoria 'charity'
        charityTypeId: expenses.charityTypeId, 
        charityTypeName: charityTypes.name, 
        charityDescription: expenses.charityDescription, 


        // NOVO: Dados do gasto recorrente associado (recurringExpenses)
        recurringExpenseName: recurringExpenses.name,
        recurringExpenseRecurrenceType: recurringExpenses.recurrenceType,
        recurringExpenseInstallmentsTotal: recurringExpenses.installmentsTotal,
        recurringExpenseInstallmentsPaid: recurringExpenses.installmentsPaid, // GERADAS
        recurringExpenseInstallmentsTrulyPaid: recurringExpenses.installmentsTrulyPaid, // NOVO: REALMENTE PAGAS
        recurringExpenseStartDate: recurringExpenses.startDate,
        recurringExpenseNextOccurrenceDate: recurringExpenses.nextOccurrenceDate,
        // Incluir detalhes das subcategorias do recurringExpense:
        recurringRoutineCategory: recurringExpenses.routineCategory, // A categoria de rotina do recorrente
        recurringFixedExpenseTypeId: recurringExpenses.fixedExpenseTypeId,
        recurringFixedExpenseTypeName: reFixedExpenseTypeAlias.name, // Nome do tipo fixo da recorrência
        recurringFrequency: recurringExpenses.frequency,

        recurringSupermarketId: recurringExpenses.supermarketId,
        recurringSupermarketName: reSupermarketAlias.name,

        recurringRestaurantId: recurringExpenses.restaurantId,
        recurringRestaurantName: reRestaurantAlias.name,
        recurringOccasionType: recurringExpenses.occasionType,
        recurringSpecialOccasionDescription: recurringExpenses.specialOccasionDescription,
        recurringFoodPurchaseType: recurringExpenses.foodPurchaseType,

        recurringServiceTypeId: recurringExpenses.serviceTypeId,
        recurringServiceTypeName: reServiceTypeAlias.name,
        recurringServiceDescription: recurringExpenses.serviceDescription,

        recurringStudyTypeId: recurringExpenses.studyTypeId,
        recurringStudyTypeName: reStudyTypeAlias.name,
        recurringStudyDescription: recurringExpenses.studyDescription,

        recurringLeisureTypeId: recurringExpenses.leisureTypeId,
        recurringLeisureTypeName: reLeisureTypeAlias.name,
        recurringLeisureDescription: recurringExpenses.leisureDescription,

        recurringPersonalCareTypeId: recurringExpenses.personalCareTypeId,
        recurringPersonalCareTypeName: rePersonalCareTypeAlias.name,
        recurringPersonalCareDescription: recurringExpenses.personalCareDescription,

        recurringShopId: recurringExpenses.shopId,
        recurringShopName: reShopAlias.name,
        recurringShoppingPurchaseType: recurringExpenses.shoppingPurchaseType,
        recurringShoppingOccasionType: recurringExpenses.shoppingOccasionType,
        recurringShoppingSpecialOccasionDescription: recurringExpenses.shoppingSpecialOccasionDescription,

        recurringStartPlaceId: recurringExpenses.startPlaceId,
        recurringEndPlaceId: recurringExpenses.endPlaceId,
        recurringStartingPoint: recurringExpenses.startingPoint,
        recurringDestination: recurringExpenses.destination,
        recurringTransportMode: recurringExpenses.transportMode,
        recurringTransportDescription: recurringExpenses.transportDescription,
        recurringStartPlaceName: recurringStartPlaceAlias.name, // Nome do lugar de partida da recorrência
        recurringEndPlaceName: recurringEndPlaceAlias.name, // Nome do lugar de destino da recorrência

        recurringHealthTypeId: recurringExpenses.healthTypeId,
        recurringHealthTypeName: reHealthTypeAlias.name,
        recurringHealthDescription: recurringExpenses.healthDescription,

        recurringFamilyMemberId: recurringExpenses.familyMemberId,
        recurringFamilyMemberName: reFamilyMemberAlias.name,
        recurringFamilyDescription: recurringExpenses.familyDescription,

        recurringCharityTypeId: recurringExpenses.charityTypeId,
        recurringCharityTypeName: reCharityTypeAlias.name,
        recurringCharityDescription: recurringExpenses.charityDescription,
      })
      .from(expenses) 
      .leftJoin(fixedExpenseTypes, eq(expenses.fixedExpenseTypeId, fixedExpenseTypes.id)) //
      .leftJoin(supermarkets, eq(expenses.supermarketId, supermarkets.id)) 
      .leftJoin(restaurants, eq(expenses.restaurantId, restaurants.id)) 
      .leftJoin(serviceTypes, eq(expenses.serviceTypeId, serviceTypes.id)) 
      .leftJoin(studyTypes, eq(expenses.studyTypeId, studyTypes.id)) 
      .leftJoin(leisureTypes, eq(expenses.leisureTypeId, leisureTypes.id)) 
      .leftJoin(personalCareTypes, eq(expenses.personalCareTypeId, personalCareTypes.id)) //
      .leftJoin(shops, eq(expenses.shopId, shops.id)) 
      .leftJoin(healthTypes, eq(expenses.healthTypeId, healthTypes.id)) 
      .leftJoin(familyMembers, eq(expenses.familyMemberId, familyMembers.id)) 
      .leftJoin(charityTypes, eq(expenses.charityTypeId, charityTypes.id)) 
      // Adiciona os JOINS para 'places' usando os aliases das tabelas
      .leftJoin(startPlaceAlias, eq(expenses.startPlaceId, startPlaceAlias.id)) 
      .leftJoin(endPlaceAlias, eq(expenses.endPlaceId, endPlaceAlias.id)) 

      .leftJoin(occasionalGroups, eq(expenses.occasionalGroupId, occasionalGroups.id))
      
      .leftJoin(recurringExpenses, eq(expenses.recurringExpenseId, recurringExpenses.id))
      // JOINS para as subcategorias de recurringExpenses, usando os aliases definidos
      .leftJoin(reFixedExpenseTypeAlias, eq(recurringExpenses.fixedExpenseTypeId, reFixedExpenseTypeAlias.id))
      .leftJoin(reSupermarketAlias, eq(recurringExpenses.supermarketId, reSupermarketAlias.id))
      .leftJoin(reRestaurantAlias, eq(recurringExpenses.restaurantId, reRestaurantAlias.id))
      .leftJoin(reServiceTypeAlias, eq(recurringExpenses.serviceTypeId, reServiceTypeAlias.id))
      .leftJoin(reStudyTypeAlias, eq(recurringExpenses.studyTypeId, reStudyTypeAlias.id))
      .leftJoin(reLeisureTypeAlias, eq(recurringExpenses.leisureTypeId, reLeisureTypeAlias.id))
      .leftJoin(rePersonalCareTypeAlias, eq(recurringExpenses.personalCareTypeId, rePersonalCareTypeAlias.id))
      .leftJoin(reShopAlias, eq(recurringExpenses.shopId, reShopAlias.id))
      .leftJoin(reHealthTypeAlias, eq(recurringExpenses.healthTypeId, reHealthTypeAlias.id))
      .leftJoin(reFamilyMemberAlias, eq(recurringExpenses.familyMemberId, reFamilyMemberAlias.id))
      .leftJoin(reCharityTypeAlias, eq(recurringExpenses.charityTypeId, reCharityTypeAlias.id))
      .leftJoin(recurringStartPlaceAlias, eq(recurringExpenses.startPlaceId, recurringStartPlaceAlias.id))
      .leftJoin(recurringEndPlaceAlias, eq(recurringExpenses.endPlaceId, recurringEndPlaceAlias.id));
  }

  // MAP EXPENSE RESULT: Mapeia os resultados da consulta para o formato esperado pelo frontend
  private mapExpenseResult(result: any[]): any[] {
    return result.map((expense) => {
      let displayName = "N/A"; //
      let categoryType = expense.routineCategory || "occasional"; //

      // Se for uma ocorrência de recorrência, usa o nome da recorrência pai
      if (expense.recurringExpenseId && expense.recurringExpenseName) {
          displayName = expense.recurringExpenseName;
          categoryType = expense.recurringRoutineCategory || 'occasional'; // Prioriza a categoria da recorrência
      }
      // Se for uma despesa ocasional (não recorrente), usa o nome do grupo ocasional
      else if (expense.expenseType === "occasional") {
        displayName = expense.occasionalGroupName || expense.occasionalGroupDescription || "Grupo Ocasional"; //
      } else { // expenseType === "routine"
        switch (expense.routineCategory) { //
          case "fixed": //
            displayName = expense.fixedExpenseTypeName || "Despesa Fixa (Tipo não especificado)"; //
            break;
          case "supermarket": //
            displayName = expense.supermarketName || "Supermercado"; //
            break;
          case "food": //
            displayName = expense.restaurantName || "Alimentação"; //
            break;
          case "services": //
            displayName = expense.serviceTypeName || expense.serviceDescription || "Serviços"; //
            break;
          case "study": //
            displayName = expense.studyTypeName || expense.studyDescription || "Estudos"; //
            break;
          case "leisure": //
            displayName = expense.leisureTypeName || expense.leisureDescription || "Lazer"; //
            break;
          case "personal-care": //
            displayName = expense.personalCareTypeName || expense.personalCareDescription || "Cuidado Pessoal"; //
            break;
          case "shopping": //
            displayName = expense.shopName || "Compras"; //
            break;
          case "transportation": //
            // Usa startPlaceName e endPlaceName diretamente da query
            if (expense.startPlaceName && expense.endPlaceName) { //
                displayName = `${expense.startPlaceName} -> ${expense.endPlaceName}`; //
            } else {
                displayName = expense.transportDescription || expense.transportMode || "Transporte"; //
            }
            break;
          case "health": //
            displayName = expense.healthTypeName || "Saúde"; //
            break;
          case "family": //
            displayName = expense.familyMemberName || "Família"; //
            break;
          case "charity": //
            displayName = expense.charityTypeName || "Caridade"; //
            break;

          default:
            displayName = "Despesa Rotineira"; //
        }
      }

      return {
        ...expense,
        displayName: displayName,
        category: categoryType,
        // Mapear as datas do grupo ocasional
        occasionalGroupOpeningDate: expense.occasionalGroupOpeningDate,
        occasionalGroupClosingDate: expense.occasionalGroupClosingDate,
        // Adicionar informações do gasto recorrente
        recurringExpenseId: expense.recurringExpenseId,
        paymentStatus: expense.paymentStatus,
        installmentNumber: expense.installmentNumber,

        recurringExpenseName: expense.recurringExpenseName,
        recurringExpenseRecurrenceType: expense.recurringExpenseRecurrenceType,
        recurringExpenseInstallmentsTotal: expense.recurringExpenseInstallmentsTotal,
        recurringExpenseInstallmentsPaid: expense.recurringExpenseInstallmentsPaid,
        recurringExpenseStartDate: expense.recurringExpenseStartDate,
        recurringExpenseNextOccurrenceDate: expense.recurringExpenseNextOccurrenceDate,
        recurringRoutineCategory: expense.recurringRoutineCategory,
        recurringFixedExpenseTypeId: expense.recurringFixedExpenseTypeId,
        recurringFixedExpenseTypeName: expense.recurringFixedExpenseTypeName,
        recurringFrequency: expense.recurringFrequency,
        recurringSupermarketId: expense.recurringSupermarketId,
        recurringSupermarketName: expense.recurringSupermarketName,
        recurringRestaurantId: expense.recurringRestaurantId,
        recurringRestaurantName: expense.recurringRestaurantName,
        recurringOccasionType: expense.recurringOccasionType,
        recurringSpecialOccasionDescription: expense.recurringSpecialOccasionDescription,
        recurringFoodPurchaseType: expense.recurringFoodPurchaseType,
        recurringServiceTypeId: expense.recurringServiceTypeId,
        recurringServiceTypeName: expense.recurringServiceTypeName,
        recurringServiceDescription: expense.recurringServiceDescription,
        recurringStudyTypeId: expense.recurringStudyTypeId,
        recurringStudyTypeName: expense.recurringStudyTypeName,
        recurringStudyDescription: expense.recurringStudyDescription,
        recurringLeisureTypeId: expense.recurringLeisureTypeId,
        recurringLeisureTypeName: expense.recurringLeisureTypeName,
        recurringLeisureDescription: expense.recurringLeisureDescription,
        recurringPersonalCareTypeId: expense.recurringPersonalCareTypeId,
        recurringPersonalCareTypeName: expense.recurringPersonalCareTypeName,
        recurringPersonalCareDescription: expense.recurringPersonalCareDescription,
        recurringShopId: expense.recurringShopId,
        recurringShopName: expense.recurringShopName,
        recurringShoppingPurchaseType: expense.recurringShoppingPurchaseType,
        recurringShoppingOccasionType: expense.recurringShoppingOccasionType,
        recurringShoppingSpecialOccasionDescription: expense.recurringShoppingSpecialOccasionDescription,
        recurringStartPlaceId: expense.recurringStartPlaceId,
        recurringEndPlaceId: expense.recurringEndPlaceId,
        recurringStartingPoint: expense.recurringStartingPoint,
        recurringDestination: expense.recurringDestination,
        recurringTransportMode: expense.recurringTransportMode,
        recurringTransportDescription: expense.transportDescription,
        recurringStartPlaceName: expense.recurringStartPlaceName,
        recurringEndPlaceName: expense.recurringEndPlaceName,
        recurringHealthTypeId: expense.recurringHealthTypeId,
        recurringHealthTypeName: expense.recurringHealthTypeName,
        recurringHealthDescription: expense.recurringHealthDescription,
        recurringFamilyMemberId: expense.recurringFamilyMemberId,
        recurringFamilyMemberName: expense.recurringFamilyMemberName,
        recurringFamilyDescription: expense.recurringFamilyDescription,
        recurringCharityTypeId: expense.recurringCharityTypeId,
        recurringCharityTypeName: expense.recurringCharityTypeName,
        recurringCharityDescription: expense.recurringCharityDescription,
      };
    });
  }


  // FUNÇÕES ASSÍNCRONAS PARA RETORNOS DAS DESPESAS
  //---------------------------------------------------------------------------------------------
  // GET EXPENSES: Retorna todas as despesas ordenadas pela data de compra
  async getExpenses(): Promise<any[]> {
    try {
      const result = await this.getExpensesBaseQuery()
          .where(eq(expenses.paymentStatus, 'paid')) // Filtrar por status pago
          .orderBy(desc(expenses.purchaseDate));
      return this.mapExpenseResult(result);
    } catch (error) {
      console.error("Error in getExpenses:", error);
      throw error;
    }
  }

  // GET EXPENSES BY MONTH: Retorna as despesas de um mês específico
  async getExpensesByMonth(year: number, month: number): Promise<any[]> {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const result = await this.getExpensesBaseQuery()
        .where(and(
          gte(expenses.purchaseDate, startDate),
          lte(expenses.purchaseDate, endDate),
          eq(expenses.paymentStatus, 'paid') // Filtrar por status pago
        ))
        .orderBy(desc(expenses.purchaseDate));
      return this.mapExpenseResult(result);
    } catch (error) {
      console.error("Error in getExpensesByMonth:", error);
      throw error;
    }
  }

  // GET EXPENSES BY YEAR: Retorna as despesas de um ano específico
  async getExpensesByYear(year: number): Promise<any[]> {
    try {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      const result = await this.getExpensesBaseQuery()
        .where(and(
          gte(expenses.purchaseDate, startDate),
          lte(expenses.purchaseDate, endDate),
          eq(expenses.paymentStatus, 'paid') // Filtrar por status pago
        ))
        .orderBy(desc(expenses.purchaseDate));
      return this.mapExpenseResult(result);
    } catch (error) {
      console.error("Error in getExpensesByYear:", error);
      throw error;
    }
  }

  // GET RECENT EXPENSES: Retorna as despesas mais recentes
  async getRecentExpenses(limit: number = 10): Promise<any[]> { 
    try {
      const result = await this.getExpensesBaseQuery()
        // Removida a linha: .where(eq(expenses.paymentStatus, 'paid'))
        .orderBy(desc(expenses.purchaseDate))
        .limit(limit);
      return this.mapExpenseResult(result);
    } catch (error) {
      console.error("Error in getRecentExpenses:", error);
      throw error;
    }
  }

  // DELETE EXPENSE: Exclui uma despesa do banco de dados
  async deleteExpense(id: number): Promise<Expense | null> {
    const [deletedExpense] = await db
      .delete(expenses)
      .where(eq(expenses.id, id))
      .returning();
    return deletedExpense || null;
  }

  // UPDATE EXPENSE: Atualiza uma despesa no banco de dados
  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | null> {
    return await db.transaction(async (tx) => {
        // 1. Obter o estado atual do gasto ANTES da atualização
        const oldExpense = (await tx.select().from(expenses).where(eq(expenses.id, id)))[0];

        if (!oldExpense) {
            return null; // Gasto não encontrado
        }

        // 2. Atualizar o gasto principal com os novos dados
        const [updatedExpense] = await tx
            .update(expenses)
            .set(expense)
            .where(eq(expenses.id, id))
            .returning();

        // 3. Lógica para atualizar a recorrência se o status de pagamento mudou
        if (updatedExpense && updatedExpense.recurringExpenseId) {
            const oldPaymentStatus = oldExpense.paymentStatus;
            const newPaymentStatus = updatedExpense.paymentStatus;
            
            if (oldPaymentStatus !== newPaymentStatus) {
                // Se o status mudou de 'pending' para 'paid', incrementa o contador de parcelas pagas
                if (newPaymentStatus === 'paid') {
                    await tx.update(recurringExpenses)
                        .set({
                            installmentsTrulyPaid: sql`${recurringExpenses.installmentsTrulyPaid} + 1`,
                            updatedAt: new Date(),
                        })
                        .where(eq(recurringExpenses.id, updatedExpense.recurringExpenseId));
                } 
                // Se o status mudou de 'paid' para 'pending', decrementa o contador
                else if (newPaymentStatus === 'pending') {
                    await tx.update(recurringExpenses)
                        .set({
                            installmentsTrulyPaid: sql`${recurringExpenses.installmentsTrulyPaid} - 1`,
                            updatedAt: new Date(),
                        })
                        .where(eq(recurringExpenses.id, updatedExpense.recurringExpenseId));
                }
            }
        }

        return updatedExpense || null;
    });
}

  // MARK ESPENSE AS PAID: Marcar uma despesa como paga
  async markExpenseAsPaid(id: number): Promise<Expense | null> {
      return await db.transaction(async (tx) => {
          // 1. Atualizar o status da despesa para 'paid'
          const [updatedExpense] = await tx.update(expenses)
              .set({ paymentStatus: 'paid' })
              .where(eq(expenses.id, id))
              .returning();

          if (!updatedExpense) {
              return null; // Despesa não encontrada
          }

          // 2. Se a despesa for uma ocorrência de um gasto recorrente, atualizar contadores
          if (updatedExpense.recurringExpenseId) {
              // Incrementa installmentsTrulyPaid (parcelas realmente pagas)
              await tx.update(recurringExpenses)
                  .set({
                      installmentsTrulyPaid: sql`${recurringExpenses.installmentsTrulyPaid} + 1`,
                      updatedAt: new Date()
                  })
                  .where(eq(recurringExpenses.id, updatedExpense.recurringExpenseId));

              // Recarrega o estado atualizado da recorrência para a lógica de pausar
              // (manter o recarregamento caso precise de `latestRecurringExp` para outros logs/futuras features)
              const latestRecurringExp = (await tx.select().from(recurringExpenses).where(eq(recurringExpenses.id, updatedExpense.recurringExpenseId)))[0];
              
              // REMOVIDO: Bloco que pausava a recorrência automaticamente
              /*
              if (latestRecurringExp && latestRecurringExp.recurrenceType === 'determined' &&
                  latestRecurringExp.installmentsTrulyPaid >= (latestRecurringExp.installmentsTotal || 0)) {
                  log(`[GERACAO] Recorrencia '${latestRecurringExp.name}' determinada atingiu o total de parcelas PAGAS. Pausando.`);
                  await tx.update(recurringExpenses)
                      .set({ recurrenceType: 'paused', updatedAt: new Date() })
                      .where(eq(recurringExpenses.id, updatedExpense.recurringExpenseId));
              }
              */
          }
          return updatedExpense;
      });
  }



  // Obter todas as ocorrências de gastos recorrentes (pendentes e pagas)
  async getGeneratedRecurringExpenses(year?: number, month?: number): Promise<any[]> {
    try {
      let initialQuery = this.getExpensesBaseQuery();

      // Array para armazenar todas as condições WHERE
      const conditions: any[] = [];

      // Condição fundamental: apenas ocorrências de recorrências
      conditions.push(sql`${expenses.recurringExpenseId} IS NOT NULL`);

      if (year) {
        let startDate: Date;
        let endDate: Date;

        if (month) {
          startDate = new Date(year, month - 1, 1);
          endDate = new Date(year, month, 0, 23, 59, 59, 999);
          conditions.push(gte(expenses.purchaseDate, startDate));
          conditions.push(lte(expenses.purchaseDate, endDate));
          log(`[DB] getGeneratedRecurringExpenses: Filtrando por ${month}/${year}`);
        } else {
          startDate = new Date(year, 0, 1);
          endDate = new Date(year, 11, 31, 23, 59, 59, 999);
          conditions.push(gte(expenses.purchaseDate, startDate));
          conditions.push(lte(expenses.purchaseDate, endDate));
          log(`[DB] getGeneratedRecurringExpenses: Filtrando por ano ${year}`);
        }
      } else {
        // Se nenhum ano/mês for fornecido, a condição base já é suficiente.
        // Ou você pode adicionar um limite padrão aqui para não carregar tudo.
        log(`[DB] getGeneratedRecurringExpenses: Sem filtro de ano/mes. Retornando todas as ocorrencias geradas.`);
      }

      const finalQuery = initialQuery.where(and(...conditions)); // Aplica todas as condições

      const result = await finalQuery.orderBy(desc(expenses.purchaseDate));
      // Não adicione filtro de status aqui, queremos todas as ocorrências geradas
      return this.mapExpenseResult(result);
    } catch (error) {
      console.error("Error in getGeneratedRecurringExpenses:", error);
      throw error;
    }
  }

// GET MONTHLY STATS: Retorna as estatísticas mensais (pagas, previstas e totais)
async getMonthlyStats(): Promise<any> {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const result = await db.select({
      totalPaid: sql<number>`SUM(CASE WHEN ${expenses.paymentStatus} = 'paid' THEN ${expenses.amount} ELSE 0 END)`.as('total_paid'),
      totalPending: sql<number>`SUM(CASE WHEN ${expenses.paymentStatus} = 'pending' THEN ${expenses.amount} ELSE 0 END)`.as('total_pending'),
      totalMonthly: sql<number>`SUM(${expenses.amount})`.as('total_monthly'),
    })
    .from(expenses)
    .where(and(
      gte(expenses.purchaseDate, startDate),
      lte(expenses.purchaseDate, endDate)
    ));

    const yearlyExpenses = await this.getExpensesByYear(currentYear);
    const yearlyTotal = yearlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const averageMonthly = yearlyTotal / currentMonth;
    const categoriesCount = new Set(yearlyExpenses.map(exp => exp.routineCategory || "occasional")).size;

    return {
      ...result[0],
      yearlyTotal,
      averageMonthly,
      categoriesCount,
    };
  } catch (error) {
    console.error("Error in getMonthlyStats:", error);
    throw error;
  }
}

  // GET ANNUAL STATS: Retorna as estatísticas anuais (somente de despesas pagas)
async getAnnualStats(year: number): Promise<any> {
  try {
    const yearlyExpenses = await this.getExpensesByYear(year);

    // Filter only paid expenses for the total calculations
    const paidYearlyExpenses = yearlyExpenses.filter(exp => exp.paymentStatus === 'paid');

    const total = paidYearlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const avgMonthly = total / 12;

    const categoryTotals: { [key: string]: number } = {};
    paidYearlyExpenses.forEach((expense) => {
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
  } catch (error) {
      console.error("Error in getAnnualStats:", error);
      throw error;
  }
}

  // GET CATEGORY BREAKDOWN: Retorna o desdobramento de categorias
  async getCategoryBreakdown(year: number, month?: number): Promise<any[]> {
    try {
        const expenseList = month ? await this.getExpensesByMonth(year, month) : await this.getExpensesByYear(year); //

        const categoryTotals: { [key: string]: number } = {}; //
        expenseList.forEach((expense) => { //
            const category = expense.routineCategory || "occasional"; //
            categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount); //
        });

        const totalAmount = expenseList.reduce((sum, exp) => sum + parseFloat(exp.amount), 0); //

        return Object.entries(categoryTotals).map(([category, total]) => ({ //
            category, //
            total, //
            percentage: totalAmount > 0 ? (total / totalAmount) * 100 : 0, //
        }));
    } catch (error) {
        console.error("Error in getCategoryBreakdown:", error); //
        throw error; //
    }
  }


  //---------------------------------------------------------------------------------------------
  // fim das FUNÇÕES ASYNC PARA RETORNOS DAS DESPESAS


  // FUNÇÕES ASYNC PARA AS DESPESAS OCASIONAIS
  //---------------------------------------------------------------------------------------------
  // CREATE OCCASIONAL GROUP: Insere um novo grupo de despesas ocasionais no banco de dados
  async createOccasionalGroup(insertGroup: InsertOccasionalGroup): Promise<OccasionalGroup> {
    // `insertGroup` aqui já tem `openingDate` e `closingDate` como objetos `Date` (ou null)
    const [group] = await db
      .insert(occasionalGroups)
      .values({
        name: insertGroup.name,
        status: insertGroup.status || "open",
        description: insertGroup.description ?? null,
        iconName: insertGroup.iconName ?? null,
        openingDate: insertGroup.openingDate, // Já é um objeto Date
        closingDate: insertGroup.closingDate ?? null, // Já é um objeto Date ou null
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
          iconName: occasionalGroups.iconName, // Incluir iconName
          openingDate: occasionalGroups.openingDate, // Incluir openingDate
          closingDate: occasionalGroups.closingDate, // Incluir closingDate
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
          iconName: occasionalGroups.iconName, // Incluir iconName
          openingDate: occasionalGroups.openingDate, // Incluir openingDate
          closingDate: occasionalGroups.closingDate, // Incluir closingDate
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

  // getExpensesByOccasionalGroupId
  async getExpensesByOccasionalGroupId(groupId: number): Promise<any[]> {
    try {
      const result = await this.getExpensesBaseQuery()
          .where(and(
              eq(expenses.occasionalGroupId, groupId),
              eq(expenses.expenseType, 'occasional') // Certificar que são apenas despesas ocasionais
          ))
          .orderBy(desc(expenses.purchaseDate)); // Ordenar por data de compra, mais recente primeiro
      return this.mapExpenseResult(result);
    } catch (error) {
      console.error(`Error in getExpensesByOccasionalGroupId for group ${groupId}:`, error);
      throw error;
    }
  }

  // UPDATE OCCASIONAL GROUP STATUS: Atualiza o status de um grupo de despesas ocasionais
  async updateOccasionalGroupStatus(id: number, status: "open" | "closed", closingDate: Date | null | undefined): Promise<OccasionalGroup> {
    const updatePayload: Partial<OccasionalGroup> = { status };
    if (status === "closed") {
        updatePayload.closingDate = closingDate; // `closingDate` já é um Date ou null
    } else if (status === "open") {
        updatePayload.closingDate = null;
    }

    const [group] = await db.update(occasionalGroups)
      .set(updatePayload)
      .where(eq(occasionalGroups.id, id))
      .returning();
    return group;
  }

  // UPDATE OCCASIONAL GROUP: Atualiza os dados de um grupo ocasional
  async updateOccasionalGroup(id: number, groupData: Partial<InsertOccasionalGroup>): Promise<OccasionalGroup | null> {
    // `groupData` aqui já tem `openingDate` e `closingDate` como objetos `Date` (ou null)
    // porque foi parseado pelo Zod no routes.ts.
    const [updatedGroup] = await db
        .update(occasionalGroups)
        .set(groupData)
        .where(eq(occasionalGroups.id, id))
        .returning();
    return updatedGroup || null;
  }
  //---------------------------------------------------------------------------------------------
  // fim das FUNÇÕES ASYNC PARA AS DESPESAS OCASIONAIS


  // FUNÇÕES ASYNC PARA AS DESPESAS ROTINEIRAS
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
    return await db.select().from(fixedExpenseTypes).orderBy(fixedExpenseTypes.name); //
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
  async addSupermarket(
    insertSupermarket: InsertSupermarket,
  ): Promise<Supermarket> {
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
      .orderBy(supermarkets.name); //
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
    return await db.select().from(restaurants).orderBy(restaurants.name); //
  }

  async deleteRestaurant(id: number): Promise<Restaurant | null> {
    const [deletedRestaurant] = await db
      .delete(restaurants)
      .where(eq(restaurants.id, id))
      .returning();
    return deletedRestaurant || null;
  }
  // Fim das funções de manutenção da subcategoria 'food'
  //---------------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'services'
  async addServiceType(
    insertServiceType: InsertServiceType,
  ): Promise<ServiceType> {
    const [serviceType] = await db
      .insert(serviceTypes)
      .values(insertServiceType)
      .returning();
    return serviceType;
  }

  async getServiceTypes(): Promise<ServiceType[]> {
    return await db.select().from(serviceTypes).orderBy(serviceTypes.name); //
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

    // Início das funções de manutenção da subcategoria 'study'
  async addStudyType(
    insertStudyType: InsertStudyType,
  ): Promise<StudyType> {
    const [studyType] = await db
      .insert(studyTypes)
      .values(insertStudyType)
      .returning();
    return studyType;
  }

  async getStudyTypes(): Promise<StudyType[]> {
    return await db.select().from(studyTypes).orderBy(studyTypes.name); //
  }

  async deleteStudyType(id: number): Promise<StudyType | null> {
    const [deletedStudyType] = await db
      .delete(studyTypes)
      .where(eq(studyTypes.id, id))
      .returning();
    return deletedStudyType || null;
  }
  // Fim das funções de manutenção da subcategoria 'services'
  //---------------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'leisure'
  async addLeisureType(
    insertLeisureType: InsertLeisureType,
  ): Promise<LeisureType> {
    const [leisureType] = await db
      .insert(leisureTypes)
      .values(insertLeisureType)
      .returning();
    return leisureType;
  }

  async getLeisureTypes(): Promise<LeisureType[]> {
    return await db.select().from(leisureTypes).orderBy(leisureTypes.name); //
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
  async addPersonalCareType(
    insertPersonalCareType: InsertPersonalCareType,
  ): Promise<PersonalCareType> {
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
      .orderBy(personalCareTypes.name); //
  }

  async deletePersonalCareType(id: number): Promise<PersonalCareType | null> {
    const [deletedPersonalCareType] = await db
      .delete(personalCareTypes)
      .where(eq(personalCareTypes.id, id))
      .returning();
    return deletedPersonalCareType || null;
  }
  // Fim das funções de manutenção da subcategoria 'personal-care'
  //------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'shopping'
  async addShop(insertShop: InsertShop): Promise<Shop> {
    const [shop] = await db
      .insert(shops)
      .values(insertShop)
      .returning();
    return shop;
  }

  async getShops(): Promise<Shop[]> {
    return await db.select().from(shops).orderBy(shops.name); //
  }

  async deleteShop(id: number): Promise<Shop | null> {
    const [deletedShop] = await db
      .delete(shops)
      .where(eq(shops.id, id))
      .returning();
    return deletedShop || null;
  }
  // Fim das funções de manutenção da subcategoria 'shopping'
  //------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'transportation'
  async addPlace(insertPlace: InsertPlace): Promise<Place> {
    const [place] = await db
      .insert(places)
      .values(insertPlace)
      .returning();
    return place;
  }

  async getPlaces(): Promise<Place[]> {
    return await db.select().from(places).orderBy(places.name); //
  }

  async deletePlace(id: number): Promise<Place | null> {
    const [deletedPlace] = await db
      .delete(places)
      .where(eq(places.id, id))
      .returning();
    return deletedPlace || null;
  }
  // Fim das funções de manutenção da subcategoria 'transportation'
  //------------------------------------------------------------------------------------

  // Início das funções de manutenção da subcategoria 'health'
  async addHealthType(insertHealthType: InsertHealthType): Promise<HealthType> {
    const [healthType] = await db
      .insert(healthTypes)
      .values(insertHealthType)
      .returning();
    return healthType;
  }

  async getHealthTypes(): Promise<HealthType[]> {
    return await db.select().from(healthTypes).orderBy(healthTypes.name); //
  }

  async deleteHealthType(id: number): Promise<HealthType | null> {
    const [deletedHealthType] = await db
      .delete(healthTypes)
      .where(eq(healthTypes.id, id))
      .returning();
    return deletedHealthType || null;
  }
  // Fim das funções de manutenção da subcategoria 'health'
  //------------------------------------------------------------------------------------

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
    return await db.select().from(familyMembers).orderBy(familyMembers.name); //
  }

  async deleteFamilyMember(id: number): Promise<FamilyMember | null> {
    const [deletedFamilyMember] = await db
      .delete(familyMembers)
      .where(eq(familyMembers.id, id))
      .returning();
    return deletedFamilyMember || null;
  }
  // Fim das funções de manutenção da subcategoria 'family'
  //------------------------------------------------------------------------------------

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
    return await db.select().from(charityTypes).orderBy(charityTypes.name); //
  }

  async deleteCharityType(id: number): Promise<CharityType | null> {
    const [deletedCharityType] = await db
      .delete(charityTypes)
      .where(eq(charityTypes.id, id))
      .returning();
    return deletedCharityType || null;
  }
  //------------------------------------------------------------------------------------
  // fim das FUNÇÕES ASYNC PARA AS DESPESAS ROTINEIRAS

  // NOVOS MÉTODOS PARA ANOS FINANCEIROS E METAS
  async createFinancialYear(yearData: InsertFinancialYear, goalsData: InsertMonthlyGoal[]): Promise<FinancialYear> {
    return await db.transaction(async (tx) => { //
        const [newYear] = await tx.insert(financialYears) //
            .values(yearData) //
            .returning(); //

        if (goalsData && goalsData.length > 0 && newYear) { //
            const goalsToInsert = goalsData.map(goal => ({ //
                ...goal, //
                financialYearId: newYear.id, //
            }));
            await tx.insert(monthlyGoals).values(goalsToInsert); //
        }
        return newYear; //
    });
  }

  async getFinancialYears(): Promise<FinancialYear[]> {
    // Incluir as monthlyGoals relacionadas
    return await db.query.financialYears.findMany({ //
        with: { //
            monthlyGoals: true, //
        },
    });
  }

  async getFinancialYearDetails(id: number): Promise<(FinancialYear & { monthlyGoals: MonthlyGoal[] }) | null> {
    const yearDetails = await db.query.financialYears.findFirst({ //
        where: eq(financialYears.id, id), //
        with: { //
            monthlyGoals: true, //
        },
    });
    return yearDetails || null;
  }

  async updateFinancialYear(id: number, yearData: Partial<InsertFinancialYear>, goalsData: InsertMonthlyGoal[]): Promise<FinancialYear | null> {
    return await db.transaction(async (tx) => { //
        const [updatedYear] = await tx.update(financialYears) //
            .set(yearData) //
            .where(eq(financialYears.id, id)) //
            .returning(); //

        if (!updatedYear) { //
            return null; // Ano não encontrado
        }

        // Deletar metas existentes e inserir as novas
        await tx.delete(monthlyGoals).where(eq(monthlyGoals.financialYearId, id)); //
        if (goalsData && goalsData.length > 0) { //
            const goalsToInsert = goalsData.map(goal => ({ //
                ...goal, //
                financialYearId: updatedYear.id, //
            }));
            await tx.insert(monthlyGoals).values(goalsToInsert); //
        }
        // Para garantir que as monthlyGoals atualizadas sejam retornadas, você pode re-buscar o ano.
        // Ou, se o seu frontend não precisar das metas diretamente na resposta do PUT,
        // o `updatedYear` (que não inclui as metas) já seria suficiente.
        // Para ser completo, vamos re-buscar:
        const fullUpdatedYear = await tx.query.financialYears.findFirst({
            where: eq(financialYears.id, id),
            with: {
                monthlyGoals: true,
            },
        });
        return fullUpdatedYear || null;
    });
  }

  async deleteFinancialYear(id: number): Promise<FinancialYear | null> {
    const [deletedYear] = await db.delete(financialYears)
        .where(eq(financialYears.id, id))
        .returning(); // Sem especificar colunas, retorna o objeto completo
    return deletedYear || null;
}

  // MÉTODO NOVO/CORRIGIDO: Retorna o sumário mensal de gastos para um ano específico
  async getMonthlySummaryByYear(year: number): Promise<Array<{ month: number; total: number }>> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    const result = await db
      .select({
        month: sql<number>`EXTRACT(MONTH FROM ${expenses.purchaseDate})`.as('month'),
        total: sql<number>`SUM(CAST(${expenses.amount} AS REAL))`.as('total'),
      })
      .from(expenses)
      .where(and(
        gte(expenses.purchaseDate, startDate),
        lte(expenses.purchaseDate, endDate),
        eq(expenses.paymentStatus, 'paid')
      ))
      .groupBy(sql`month`)
      .orderBy(sql`month`);

    return result.map(row => ({
      month: Number(row.month),
      total: row.total || 0,
    }));
  }

  // Retorna os gastos mensais por categoria para um ano específico
  async getMonthlyExpensesBreakdownByYear(year: number): Promise<Array<{ month: number; category: string; total: number }>> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    const result = await db
      .select({
        month: sql<number>`EXTRACT(MONTH FROM ${expenses.purchaseDate})`.as('month'),
        category: sql<string>`
          CASE
            WHEN ${expenses.expenseType} = 'occasional' THEN 'occasional'
            ELSE ${expenses.routineCategory}::text
          END
        `.as('category'),
        amount: sql<number>`SUM(CAST(${expenses.amount} AS REAL))`.as('total'),
      })
      .from(expenses)
      .where(and(
        gte(expenses.purchaseDate, startDate),
        lte(expenses.purchaseDate, endDate),
        eq(expenses.paymentStatus, 'paid') 
      ))
      .groupBy(sql`
          EXTRACT(MONTH FROM ${expenses.purchaseDate}),
          CASE
            WHEN ${expenses.expenseType} = 'occasional' THEN 'occasional'
            ELSE ${expenses.routineCategory}::text
          END
      `)
      .orderBy(sql`month`, sql`category`);

    return result.map(row => ({
      month: Number(row.month),
      category: row.category || 'outros',
      total: row.amount || 0,
    }));
  }

  // NOVOS MÉTODOS PARA GASTOS RECORRENTES
  //---------------------------------------------------------------------------------------------

  // CREATE RECURRING EXPENSE: Insere um novo gasto recorrente
  async createRecurringExpense(insertRecurringExpense: InsertRecurringExpense): Promise<RecurringExpense> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const initialNextOccurrenceDate = new Date(insertRecurringExpense.startDate);
    initialNextOccurrenceDate.setHours(0, 0, 0, 0);

    const [recurringExpense] = await db
      .insert(recurringExpenses)
      .values({
        ...insertRecurringExpense,
        // Para determined, installmentsTotal é o valor. Para undetermined/paused, é null.
        installmentsTotal: insertRecurringExpense.recurrenceType === 'determined' ? insertRecurringExpense.installmentsTotal : null,
        installmentsPaid: 0, // installmentsPaid = parcelas *geradas*
        installmentsTrulyPaid: 0, // installmentsTrulyPaid = parcelas *pagas*
        startDate: initialNextOccurrenceDate,
        nextOccurrenceDate: initialNextOccurrenceDate, // Próxima data para geração (pode ser o próprio mês de início)
        createdAt: today,
        updatedAt: today,
      })
      .returning();

    if (!recurringExpense) {
      throw new Error("Failed to create recurring expense.");
    }

    // Lógica para geração inicial de ocorrências (para 'determined' e 'undetermined')
    if (recurringExpense.recurrenceType === 'determined' || recurringExpense.recurrenceType === 'undetermined') {
      log(`[GERACAO] Recorrencia '${recurringExpense.name}' (ID: ${recurringExpense.id}) criada. Verificando geracao de parcelas iniciais.`);

      let currentMonthPointer = new Date(recurringExpense.startDate.getFullYear(), recurringExpense.startDate.getMonth(), 1);
      currentMonthPointer.setHours(0, 0, 0, 0);

      // Determinar o último mês para geração inicial
      let lastMonthToGenerate = new Date(today.getFullYear(), 11, 1); // Dezembro do ano atual
      if (recurringExpense.recurrenceType === 'determined' && recurringExpense.installmentsTotal !== null) {
          // Para determinado, o limite é o total de parcelas a partir da data de início
          const limitMonth = new Date(recurringExpense.startDate.getFullYear(), recurringExpense.startDate.getMonth() + recurringExpense.installmentsTotal - 1, 1);
          // O último mês a ser gerado é o menor entre (dezembro do ano atual) e (o mês da última parcela determinada)
          if (limitMonth.getTime() < lastMonthToGenerate.getTime()) {
              lastMonthToGenerate = limitMonth;
          }
      }
      // Garante que não geramos para o futuro além de 12 meses na primeira geração
      // O cron job será responsável pela geração contínua.
      const futureLimit = new Date(today.getFullYear(), today.getMonth() + 12, 1);
      if (lastMonthToGenerate.getTime() > futureLimit.getTime()) {
        lastMonthToGenerate = futureLimit;
      }


      let expensesGeneratedCount = 0;
      let installmentsPaidCount = 0; // Para controlar as *parcelas geradas* (installmentsPaid)

      while (
        currentMonthPointer.getTime() <= lastMonthToGenerate.getTime() && // Alterado para <=
        (recurringExpense.recurrenceType === 'undetermined' ||
         (expensesGeneratedCount < (recurringExpense.installmentsTotal || 0)))
    ) {
          const targetMonth = currentMonthPointer.getMonth();
          const targetYear = currentMonthPointer.getFullYear();

          const expensePurchaseDate = new Date(targetYear, targetMonth, 1);
          expensePurchaseDate.setHours(0, 0, 0, 0);

          // Verificar se já existe uma ocorrência para este mês e recorrência
          const existingExpense = await db.select()
              .from(expenses)
              .where(and(
                  eq(expenses.recurringExpenseId, recurringExpense.id),
                  gte(expenses.purchaseDate, new Date(targetYear, targetMonth, 1)),
                  lte(expenses.purchaseDate, new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999))
              ))
              .limit(1);

          if (existingExpense.length === 0) {
              log(`[GERACAO] Gerando ocorrencia para '${recurringExpense.name}' (ID: ${recurringExpense.id}) para ${format(currentMonthPointer, 'MM/yyyy')}`);

              let installmentNumber = null;
              if (recurringExpense.recurrenceType === 'determined' && recurringExpense.startDate) {
                  const startOfMonthRecurring = new Date(recurringExpense.startDate.getFullYear(), recurringExpense.startDate.getMonth(), 1);
                  const diffMonths = (expensePurchaseDate.getFullYear() - startOfMonthRecurring.getFullYear()) * 12 + (expensePurchaseDate.getMonth() - startOfMonthRecurring.getMonth());
                  installmentNumber = diffMonths + 1;
              }

              const newExpense: InsertExpense = {
                  amount: recurringExpense.amount,
                  purchaseDate: expensePurchaseDate,
                  paymentMethod: recurringExpense.paymentMethod,
                  expenseType: recurringExpense.expenseType,
                  routineCategory: recurringExpense.routineCategory,
                  occasionalGroupId: recurringExpense.occasionalGroupId,
                  fixedExpenseTypeId: recurringExpense.fixedExpenseTypeId,
                  frequency: recurringExpense.frequency,
                  supermarketId: recurringExpense.supermarketId,
                  restaurantId: recurringExpense.restaurantId,
                  occasionType: recurringExpense.occasionType,
                  specialOccasionDescription: recurringExpense.specialOccasionDescription,
                  foodPurchaseType: recurringExpense.foodPurchaseType,
                  serviceTypeId: recurringExpense.serviceTypeId,
                  serviceDescription: recurringExpense.serviceDescription,
                  studyTypeId: recurringExpense.studyTypeId,
                  studyDescription: recurringExpense.studyDescription,
                  leisureTypeId: recurringExpense.leisureTypeId,
                  leisureDescription: recurringExpense.leisureDescription,
                  personalCareTypeId: recurringExpense.personalCareTypeId,
                  personalCareDescription: recurringExpense.personalCareDescription,
                  shopId: recurringExpense.shopId,
                  shoppingPurchaseType: recurringExpense.shoppingPurchaseType,
                  shoppingOccasionType: recurringExpense.shoppingOccasionType,
                  shoppingSpecialOccasionDescription: recurringExpense.shoppingSpecialOccasionDescription,
                  startPlaceId: recurringExpense.startPlaceId,
                  endPlaceId: recurringExpense.endPlaceId,
                  startingPoint: recurringExpense.startingPoint,
                  destination: recurringExpense.destination,
                  transportMode: recurringExpense.transportMode,
                  transportDescription: recurringExpense.transportDescription,
                  healthTypeId: recurringExpense.healthTypeId,
                  healthDescription: recurringExpense.healthDescription,
                  familyMemberId: recurringExpense.familyMemberId,
                  familyDescription: recurringExpense.familyDescription,
                  charityTypeId: recurringExpense.charityTypeId,
                  charityDescription: recurringExpense.charityDescription,
                  recurringExpenseId: recurringExpense.id,
                  paymentStatus: 'pending', // Sempre pendente na geração
                  installmentNumber: installmentNumber,
              };

              await db.insert(expenses).values(newExpense);
              installmentsPaidCount++; // Incrementa as parcelas *geradas*
              expensesGeneratedCount++;
          } else {
              log(`[GERACAO] Ocorrencia para '${recurringExpense.name}' em ${format(currentMonthPointer, 'MM/yyyy')} ja existe. Pulando.`);
              // Se a ocorrência já existe, considere-a como "gerada" para o contador de parcelas.
              // Isso é importante para que o `installmentsPaid` reflita o estado correto.
              installmentsPaidCount++;
          }
          currentMonthPointer.setMonth(currentMonthPointer.getMonth() + 1);
      }

      // Atualiza installmentsPaid e nextOccurrenceDate da recorrência após a geração inicial
      const finalNextOccurrenceDate = new Date(currentMonthPointer.getFullYear(), currentMonthPointer.getMonth(), 1);
      finalNextOccurrenceDate.setHours(0,0,0,0);

      await db.update(recurringExpenses)
          .set({
              installmentsPaid: installmentsPaidCount, // Atualiza com o total de parcelas geradas
              nextOccurrenceDate: finalNextOccurrenceDate,
              updatedAt: new Date(),
          })
          .where(eq(recurringExpenses.id, recurringExpense.id));

      log(`[GERACAO] Fim da geracao inicial para '${recurringExpense.name}'. Total gerado: ${expensesGeneratedCount}. Installments Paid (geradas): ${installmentsPaidCount}. Next Occ Date set to: ${finalNextOccurrenceDate.toLocaleDateString()}`);
    }

    return recurringExpense;
  }

  // GET RECURRING EXPENSES: Retorna todos os gastos recorrentes
  async getRecurringExpenses(): Promise<RecurringExpense[]> {
    return await db.select().from(recurringExpenses).orderBy(desc(recurringExpenses.createdAt));
  }

  // GET RECURRING EXPENSE BY ID: Retorna um gasto recorrente específico
  async getRecurringExpenseById(id: number): Promise<RecurringExpense | null> {
    const [recurringExpense] = await db.select().from(recurringExpenses).where(eq(recurringExpenses.id, id));
    return recurringExpense || null;
  }

  // UPDATE RECURRING EXPENSE: Atualiza um gasto recorrente
  async updateRecurringExpense(id: number, updateData: Partial<RecurringExpense>): Promise<RecurringExpense | null> {
    return await db.transaction(async (tx) => {
      // 1. Obter o estado atual da recorrência antes da atualização
      const oldRecurringExpense = await tx.query.recurringExpenses.findFirst({
        where: eq(recurringExpenses.id, id),
      });

      if (!oldRecurringExpense) {
        return null; // Recorrência não encontrada
      }

      // 2. Aplicar a atualização
      const [updatedRecurringExpense] = await tx
        .update(recurringExpenses)
        .set({
          ...updateData,
          // Se o tipo de recorrência não for 'determined', zera installmentsTotal
          installmentsTotal: updateData.recurrenceType !== 'determined' ? null : updateData.installmentsTotal,
          updatedAt: new Date(),
        })
        .where(eq(recurringExpenses.id, id))
        .returning();

      if (!updatedRecurringExpense) {
        return null; // Falha na atualização
      }

      // 3. Lógica de manipulação de ocorrências baseada na mudança de recurrenceType
      if (oldRecurringExpense.recurrenceType !== updatedRecurringExpense.recurrenceType) {
        const today = new Date();
        today.setHours(0,0,0,0);

        if (updatedRecurringExpense.recurrenceType === 'paused') {
          // Se mudou para 'paused', deleta todas as ocorrências FUTURAS (purchaseDate >= início do mês atual) e pendentes.
          log(`[ATUALIZACAO] Recorrencia '${updatedRecurringExpense.name}' (ID: ${updatedRecurringExpense.id}) alterada para PAUSADA. Deletando futuras ocorrencias pendentes.`);
          await tx.delete(expenses)
            .where(and(
              eq(expenses.recurringExpenseId, updatedRecurringExpense.id),
              eq(expenses.paymentStatus, 'pending'),
              gte(expenses.purchaseDate, new Date(today.getFullYear(), today.getMonth(), 1)) // A partir do início do mês atual
            ));
          // Resetar installmentsPaid para o valor das parcelas *pagas* ao pausar
          // Não, installmentsPaid deve refletir as parcelas *geradas*.
          // installmentsTrulyPaid é que reflete as pagas. Não resetamos aqui.

        } else if (oldRecurringExpense.recurrenceType === 'paused' &&
                   (updatedRecurringExpense.recurrenceType === 'undetermined' || updatedRecurringExpense.recurrenceType === 'determined')) {
          // Se mudou de 'paused' para 'undetermined' ou 'determined', reagenda a geração
          log(`[ATUALIZACAO] Recorrencia '${updatedRecurringExpense.name}' (ID: ${updatedRecurringExpense.id}) alterada de PAUSADA para ATIVA. Reagendando geracao.`);

          // A próxima data de ocorrência deve ser o mês atual ou o mês da startDate, o que for mais recente
          let newNextOccurrenceDate = new Date(today.getFullYear(), today.getMonth(), 1);
          if (updatedRecurringExpense.startDate && new Date(updatedRecurringExpense.startDate.getFullYear(), updatedRecurringExpense.startDate.getMonth(), 1).getTime() > newNextOccurrenceDate.getTime()) {
            newNextOccurrenceDate = new Date(updatedRecurringExpense.startDate.getFullYear(), updatedRecurringExpense.startDate.getMonth(), 1);
          }
          newNextOccurrenceDate.setHours(0,0,0,0);

          await tx.update(recurringExpenses)
            .set({
              nextOccurrenceDate: newNextOccurrenceDate,
              // Ao reativar, talvez seja interessante reajustar installmentsPaid
              // para o total de parcelas *atuais* geradas.
              // A função generateMonthlyRecurringExpenses já lida com isso.
              updatedAt: new Date(),
            })
            .where(eq(recurringExpenses.id, updatedRecurringExpense.id));
          // Acionar a geração de novas ocorrências via `generateMonthlyRecurringExpenses` (será feita pelo cron job ou manualmente)
          // OU, para ter certeza que as próximas são geradas imediatamente:
          // await this.generateMonthlyRecurringExpenses(); // Isso pode ser custoso se feito síncronamente na API.
          // É melhor que o cron job pegue isso na próxima execução.
          // Para este cenário, a função `generateMonthlyRecurringExpenses` já está pronta para pegar recorrencias com `nextOccurrenceDate` no passado.

        }
      }

      // Se a data de início (startDate) mudar, também pode exigir uma reavaliação das ocorrências
      // Isso é mais complexo e pode exigir deleção/recriação de ocorrências.
      // Por simplicidade, vamos assumir que a startDate raramente muda após a criação.
      // Se mudar e for para um mês futuro, apenas deletamos as futuras. Se for para um mês passado, não fazemos nada.
      if (updateData.startDate && oldRecurringExpense.startDate && updateData.startDate.getTime() !== oldRecurringExpense.startDate.getTime()) {
        log(`[ATUALIZACAO] StartDate de '${updatedRecurringExpense.name}' (ID: ${updatedRecurringExpense.id}) foi alterada.`);
        // Delete todas as ocorrências existentes para essa recorrência
        await tx.delete(expenses)
          .where(eq(expenses.recurringExpenseId, updatedRecurringExpense.id));

        // Reajuste installmentsPaid e installmentsTrulyPaid para zero
        await tx.update(recurringExpenses)
          .set({
            installmentsPaid: 0,
            installmentsTrulyPaid: 0,
            nextOccurrenceDate: updatedRecurringExpense.startDate,
            updatedAt: new Date(),
          })
          .where(eq(recurringExpenses.id, updatedRecurringExpense.id));

        // A geração inicial para o novo startDate será feita na próxima execução do cron job
        // ou você pode chamar a lógica de geração inicial novamente aqui se necessário.
        // Chamar createRecurringExpense aqui não é ideal, pois criaria outra recorrência.
        // A lógica de geração deve ser modularizada se quiser chamá-la aqui.
        // Por enquanto, o cron job cuidará da geração.
      }


      return updatedRecurringExpense;
    });
  }

  // DELETE RECURRING EXPENSE: Exclui um gasto recorrente
  async deleteRecurringExpense(id: number): Promise<RecurringExpense | null> {
    const [deletedRecurringExpense] = await db
      .delete(recurringExpenses)
      .where(eq(recurringExpenses.id, id))
      .returning();
    return deletedRecurringExpense || null;
  }

  // GENERATE MONTHLY RECURRING EXPENSES: Gerar despesas mensais recorrentes
  async generateMonthlyRecurringExpenses(): Promise<void> {
    const today = new Date();
    today.setHours(0,0,0,0);

    log(`[GERACAO] Iniciando processo de geracao para o ciclo atual e proximos meses.`);

    try {
        // Seleciona recorrências ativas (não pausadas), incluindo determinadas que ainda não geraram todas as parcelas
        const activeRecurringExpenses = await db.select().from(recurringExpenses)
            .where(
                or(
                    eq(recurringExpenses.recurrenceType, 'undetermined'),
                    and(
                        eq(recurringExpenses.recurrenceType, 'determined'),
                        sql`${recurringExpenses.installmentsPaid} < ${recurringExpenses.installmentsTotal}`
                    )
                )
            );

        log(`[GERACAO] Encontradas ${activeRecurringExpenses.length} recorrencias ativas.`);

        for (const recurringExp of activeRecurringExpenses) {
            log(`[GERACAO] Processando recorrencia ID: ${recurringExp.id}, Nome: '${recurringExp.name}'`);

            const initialRecurringState = (await db.select().from(recurringExpenses).where(eq(recurringExpenses.id, recurringExp.id)))[0];
            if (!initialRecurringState) {
              log(`[GERACAO] Recorrencia ID: ${recurringExp.id} nao encontrada ou pausada inesperadamente. Pulando.`);
              continue;
            }

            let generationPointerDate = new Date(initialRecurringState.nextOccurrenceDate.getFullYear(), initialRecurringState.nextOccurrenceDate.getMonth(), 1);
            generationPointerDate.setHours(0,0,0,0);

            let expensesGeneratedInThisCycle = 0;

            // Define o horizonte de geração (12 meses a partir do mês atual)
            const generationHorizon = new Date(today.getFullYear(), today.getMonth() + 12, 1);
            generationHorizon.setHours(0,0,0,0);

            // Determinar o mês final de geração para recorrências 'determined'
            let finalGenerationMonthForDetermined: Date | null = null;
            if (initialRecurringState.recurrenceType === 'determined' && initialRecurringState.installmentsTotal !== null && initialRecurringState.startDate) {
              finalGenerationMonthForDetermined = new Date(initialRecurringState.startDate.getFullYear(), initialRecurringState.startDate.getMonth() + initialRecurringState.installmentsTotal - 1, 1);
              finalGenerationMonthForDetermined.setHours(0,0,0,0);
            }

            while (
              generationPointerDate.getTime() <= generationHorizon.getTime() && // Alterado para <=
              (initialRecurringState.recurrenceType === 'undetermined' ||
              (initialRecurringState.recurrenceType === 'determined' &&
                (initialRecurringState.installmentsPaid + expensesGeneratedInThisCycle) < (initialRecurringState.installmentsTotal || 0) &&
                (finalGenerationMonthForDetermined === null || generationPointerDate.getTime() <= finalGenerationMonthForDetermined.getTime())
              )
              )
          ) {
                log(`[GERACAO] Tentando gerar para '${initialRecurringState.name}' para ${format(generationPointerDate, 'MM/yyyy')}`);

                const targetMonth = generationPointerDate.getMonth();
                const targetYear = generationPointerDate.getFullYear();

                // Verifica se já existe uma ocorrência para o mesmo mês da mesma recorrência
                const existingExpense = await db.select()
                    .from(expenses)
                    .where(and(
                        eq(expenses.recurringExpenseId, initialRecurringState.id),
                        gte(expenses.purchaseDate, new Date(targetYear, targetMonth, 1)),
                        lte(expenses.purchaseDate, new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999))
                    ))
                    .limit(1);

                if (existingExpense.length === 0) {
                    log(`[GERACAO] Despesa para '${initialRecurringState.name}' para ${format(generationPointerDate, 'MM/yyyy')} sera gerada.`);

                    const expensePurchaseDate = new Date(targetYear, targetMonth, 1);
                    expensePurchaseDate.setHours(0,0,0,0);

                    let installmentNumber = null;
                    if (initialRecurringState.recurrenceType === 'determined' && initialRecurringState.startDate) {
                        const startOfMonthRecurring = new Date(initialRecurringState.startDate.getFullYear(), initialRecurringState.startDate.getMonth(), 1);
                        const diffMonths = (expensePurchaseDate.getFullYear() - startOfMonthRecurring.getFullYear()) * 12 + (expensePurchaseDate.getMonth() - startOfMonthRecurring.getMonth());
                        installmentNumber = diffMonths + 1;
                    }

                    const newExpense: InsertExpense = {
                        amount: initialRecurringState.amount,
                        purchaseDate: expensePurchaseDate,
                        paymentMethod: initialRecurringState.paymentMethod,
                        expenseType: initialRecurringState.expenseType,
                        routineCategory: initialRecurringState.routineCategory,
                        occasionalGroupId: initialRecurringState.occasionalGroupId,
                        fixedExpenseTypeId: initialRecurringState.fixedExpenseTypeId,
                        frequency: initialRecurringState.frequency,
                        supermarketId: initialRecurringState.supermarketId,
                        restaurantId: initialRecurringState.restaurantId,
                        occasionType: initialRecurringState.occasionType,
                        specialOccasionDescription: initialRecurringState.specialOccasionDescription,
                        foodPurchaseType: initialRecurringState.foodPurchaseType,
                        serviceTypeId: initialRecurringState.serviceTypeId,
                        serviceDescription: initialRecurringState.serviceDescription,
                        studyTypeId: initialRecurringState.studyTypeId,
                        studyDescription: initialRecurringState.studyDescription,
                        leisureTypeId: initialRecurringState.leisureTypeId,
                        leisureDescription: initialRecurringState.leisureDescription,
                        personalCareTypeId: initialRecurringState.personalCareTypeId,
                        personalCareDescription: initialRecurringState.personalCareDescription,
                        shopId: initialRecurringState.shopId,
                        shoppingPurchaseType: initialRecurringState.shoppingPurchaseType,
                        shoppingOccasionType: initialRecurringState.shoppingOccasionType,
                        shoppingSpecialOccasionDescription: initialRecurringState.shoppingSpecialOccasionDescription,
                        startPlaceId: initialRecurringState.startPlaceId,
                        endPlaceId: initialRecurringState.endPlaceId,
                        startingPoint: initialRecurringState.startingPoint,
                        destination: initialRecurringState.destination,
                        transportMode: initialRecurringState.transportMode,
                        transportDescription: initialRecurringState.transportDescription,
                        healthTypeId: initialRecurringState.healthTypeId,
                        healthDescription: initialRecurringState.healthDescription,
                        familyMemberId: initialRecurringState.familyMemberId,
                        familyDescription: initialRecurringState.familyDescription,
                        charityTypeId: initialRecurringState.charityTypeId,
                        charityDescription: initialRecurringState.charityDescription,
                        recurringExpenseId: initialRecurringState.id,
                        paymentStatus: 'pending', // Sempre pendente na geração
                        installmentNumber: installmentNumber,
                    };

                    await db.insert(expenses).values(newExpense);
                    expensesGeneratedInThisCycle++; // Incrementa as parcelas *geradas*
                } else {
                    log(`[GERACAO] Ocorrencia para '${initialRecurringState.name}' em ${format(generationPointerDate, 'MM/yyyy')} ja existe. Pulando.`);
                }

                generationPointerDate.setMonth(generationPointerDate.getMonth() + 1);
            } // Fim do loop while

            // Atualiza installmentsPaid e nextOccurrenceDate da recorrência após a geração
            // Buscamos o estado atualizado para garantir a atomicidade de installmentsPaid
            const latestRecurringExpAfterGeneration = (await db.select().from(recurringExpenses).where(eq(recurringExpenses.id, initialRecurringState.id)))[0];
            const updatedInstallmentsPaid = (latestRecurringExpAfterGeneration?.installmentsPaid || 0) + expensesGeneratedInThisCycle;


            const finalNextOccurrenceDate = new Date(generationPointerDate.getFullYear(), generationPointerDate.getMonth(), 1);
            finalNextOccurrenceDate.setHours(0,0,0,0);

            await db.update(recurringExpenses)
                .set({
                    installmentsPaid: updatedInstallmentsPaid, // Atualiza com o total de parcelas geradas
                    nextOccurrenceDate: finalNextOccurrenceDate,
                    updatedAt: new Date(),
                })
                .where(eq(recurringExpenses.id, initialRecurringState.id));

            log(`[GERACAO] Recorrencia '${initialRecurringState.name}' (ID: ${initialRecurringState.id}) atualizada (final do ciclo). Prox data: ${finalNextOccurrenceDate.toLocaleDateString()}. Total de novas parcelas geradas neste ciclo: ${expensesGeneratedInThisCycle}.`);

        } // Fim do forEach de activeRecurringExpenses
        log(`[GERACAO] Processo de geracao finalizado.`);
    } catch (error) {
        console.error('[GERACAO] ERRO CATASTROFICO NA FUNCAO DE GERACAO:', error);
        throw error;
    }
  }

}

export const storage = new DatabaseStorage();