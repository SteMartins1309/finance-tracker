import { 
  expenses, 
  occasionalGroups, 
  supermarkets,
  restaurants,
  serviceTypes,
  leisureTypes,
  personalCareTypes,
  healthTypes,
  familyMembers,
  charityTypes,
  type Expense, 
  type InsertExpense,
  type OccasionalGroup,
  type InsertOccasionalGroup,
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
  type HealthType,
  type InsertHealthType,
  type FamilyMember,
  type InsertFamilyMember,
  type CharityType,
  type InsertCharityType
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Expenses
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpenses(): Promise<Expense[]>;
  getExpensesByMonth(year: number, month: number): Promise<Expense[]>;
  getExpensesByYear(year: number): Promise<Expense[]>;
  getRecentExpenses(limit?: number): Promise<any[]>;
  getMonthlyStats(): Promise<any>;
  getAnnualStats(year: number): Promise<any>;
  getCategoryBreakdown(year: number, month?: number): Promise<any[]>;

  // Occasional Groups
  createOccasionalGroup(group: InsertOccasionalGroup): Promise<OccasionalGroup>;
  getOccasionalGroups(): Promise<OccasionalGroup[]>;
  getOpenOccasionalGroups(): Promise<OccasionalGroup[]>;
  updateOccasionalGroupStatus(id: number, status: "open" | "closed"): Promise<OccasionalGroup>;

  // Category management
  createSupermarket(supermarket: InsertSupermarket): Promise<Supermarket>;
  getSupermarkets(): Promise<Supermarket[]>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  getRestaurants(): Promise<Restaurant[]>;
  createServiceType(serviceType: InsertServiceType): Promise<ServiceType>;
  getServiceTypes(): Promise<ServiceType[]>;
  createLeisureType(leisureType: InsertLeisureType): Promise<LeisureType>;
  getLeisureTypes(): Promise<LeisureType[]>;
  createPersonalCareType(personalCareType: InsertPersonalCareType): Promise<PersonalCareType>;
  getPersonalCareTypes(): Promise<PersonalCareType[]>;
  createHealthType(healthType: InsertHealthType): Promise<HealthType>;
  getHealthTypes(): Promise<HealthType[]>;
  createFamilyMember(familyMember: InsertFamilyMember): Promise<FamilyMember>;
  getFamilyMembers(): Promise<FamilyMember[]>;
  createCharityType(charityType: InsertCharityType): Promise<CharityType>;
  getCharityTypes(): Promise<CharityType[]>;
}

export class DatabaseStorage implements IStorage {
  // Expenses
  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values(insertExpense)
      .returning();
    return expense;
  }

  async getExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses).orderBy(desc(expenses.purchaseDate));
  }

  async getExpensesByMonth(year: number, month: number): Promise<Expense[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return await db
      .select()
      .from(expenses)
      .where(
        and(
          gte(expenses.purchaseDate, startDate),
          lte(expenses.purchaseDate, endDate)
        )
      )
      .orderBy(desc(expenses.purchaseDate));
  }

  async getExpensesByYear(year: number): Promise<Expense[]> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    return await db
      .select()
      .from(expenses)
      .where(
        and(
          gte(expenses.purchaseDate, startDate),
          lte(expenses.purchaseDate, endDate)
        )
      )
      .orderBy(desc(expenses.purchaseDate));
  }

  async getRecentExpenses(limit: number = 5): Promise<any[]> {
    const result = await db
      .select({
        id: expenses.id,
        amount: expenses.amount,
        purchaseDate: expenses.purchaseDate,
        routineCategory: expenses.routineCategory,
        description: expenses.description,
        storeName: expenses.storeName,
        supermarket: supermarkets.name,
        restaurant: restaurants.name,
        occasionalGroup: occasionalGroups.name
      })
      .from(expenses)
      .leftJoin(supermarkets, eq(expenses.supermarketId, supermarkets.id))
      .leftJoin(restaurants, eq(expenses.restaurantId, restaurants.id))
      .leftJoin(occasionalGroups, eq(expenses.occasionalGroupId, occasionalGroups.id))
      .orderBy(desc(expenses.purchaseDate))
      .limit(limit);

    return result.map(expense => ({
      ...expense,
      displayName: expense.supermarket || expense.restaurant || expense.storeName || expense.occasionalGroup || 'Unknown',
      category: expense.routineCategory || 'Occasional Group'
    }));
  }

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
      categoriesCount: 10 // Static for now, could be dynamic
    };
  }

  async getAnnualStats(year: number): Promise<any> {
    const yearlyExpenses = await this.getExpensesByYear(year);
    const total = yearlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const avgMonthly = total / 12;
    
    // Get category totals
    const categoryTotals: { [key: string]: number } = {};
    yearlyExpenses.forEach(expense => {
      const category = expense.routineCategory || 'occasional';
      categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount);
    });
    
    const topCategory = Object.entries(categoryTotals).reduce((a, b) => 
      categoryTotals[a[0]] > categoryTotals[b[0]] ? a : b
    )[0];
    
    return {
      total,
      avgMonthly,
      topCategory,
      categoryTotals
    };
  }

  async getCategoryBreakdown(year: number, month?: number): Promise<any[]> {
    const expenseList = month 
      ? await this.getExpensesByMonth(year, month)
      : await this.getExpensesByYear(year);
    
    const categoryTotals: { [key: string]: number } = {};
    expenseList.forEach(expense => {
      const category = expense.routineCategory || 'occasional';
      categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount);
    });
    
    return Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total,
      percentage: (total / expenseList.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)) * 100
    }));
  }

  // Occasional Groups
  async createOccasionalGroup(insertGroup: InsertOccasionalGroup): Promise<OccasionalGroup> {
    const [group] = await db
      .insert(occasionalGroups)
      .values(insertGroup)
      .returning();
    return group;
  }

  async getOccasionalGroups(): Promise<OccasionalGroup[]> {
    return await db.select().from(occasionalGroups).orderBy(desc(occasionalGroups.createdAt));
  }

  async getOpenOccasionalGroups(): Promise<OccasionalGroup[]> {
    return await db
      .select()
      .from(occasionalGroups)
      .where(eq(occasionalGroups.status, "open"))
      .orderBy(desc(occasionalGroups.createdAt));
  }

  async updateOccasionalGroupStatus(id: number, status: "open" | "closed"): Promise<OccasionalGroup> {
    const [group] = await db
      .update(occasionalGroups)
      .set({ status })
      .where(eq(occasionalGroups.id, id))
      .returning();
    return group;
  }

  // Category management methods
  async createSupermarket(insertSupermarket: InsertSupermarket): Promise<Supermarket> {
    const [supermarket] = await db
      .insert(supermarkets)
      .values(insertSupermarket)
      .returning();
    return supermarket;
  }

  async getSupermarkets(): Promise<Supermarket[]> {
    return await db.select().from(supermarkets).orderBy(supermarkets.name);
  }

  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const [restaurant] = await db
      .insert(restaurants)
      .values(insertRestaurant)
      .returning();
    return restaurant;
  }

  async getRestaurants(): Promise<Restaurant[]> {
    return await db.select().from(restaurants).orderBy(restaurants.name);
  }

  async createServiceType(insertServiceType: InsertServiceType): Promise<ServiceType> {
    const [serviceType] = await db
      .insert(serviceTypes)
      .values(insertServiceType)
      .returning();
    return serviceType;
  }

  async getServiceTypes(): Promise<ServiceType[]> {
    return await db.select().from(serviceTypes).orderBy(serviceTypes.name);
  }

  async createLeisureType(insertLeisureType: InsertLeisureType): Promise<LeisureType> {
    const [leisureType] = await db
      .insert(leisureTypes)
      .values(insertLeisureType)
      .returning();
    return leisureType;
  }

  async getLeisureTypes(): Promise<LeisureType[]> {
    return await db.select().from(leisureTypes).orderBy(leisureTypes.name);
  }

  async createPersonalCareType(insertPersonalCareType: InsertPersonalCareType): Promise<PersonalCareType> {
    const [personalCareType] = await db
      .insert(personalCareTypes)
      .values(insertPersonalCareType)
      .returning();
    return personalCareType;
  }

  async getPersonalCareTypes(): Promise<PersonalCareType[]> {
    return await db.select().from(personalCareTypes).orderBy(personalCareTypes.name);
  }

  async createHealthType(insertHealthType: InsertHealthType): Promise<HealthType> {
    const [healthType] = await db
      .insert(healthTypes)
      .values(insertHealthType)
      .returning();
    return healthType;
  }

  async getHealthTypes(): Promise<HealthType[]> {
    return await db.select().from(healthTypes).orderBy(healthTypes.name);
  }

  async createFamilyMember(insertFamilyMember: InsertFamilyMember): Promise<FamilyMember> {
    const [familyMember] = await db
      .insert(familyMembers)
      .values(insertFamilyMember)
      .returning();
    return familyMember;
  }

  async getFamilyMembers(): Promise<FamilyMember[]> {
    return await db.select().from(familyMembers).orderBy(familyMembers.name);
  }

  async createCharityType(insertCharityType: InsertCharityType): Promise<CharityType> {
    const [charityType] = await db
      .insert(charityTypes)
      .values(insertCharityType)
      .returning();
    return charityType;
  }

  async getCharityTypes(): Promise<CharityType[]> {
    return await db.select().from(charityTypes).orderBy(charityTypes.name);
  }
}

export const storage = new DatabaseStorage();
