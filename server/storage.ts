import {
  expenses,
  occasionalGroups,
  fixedExpenseTypes, // já visto
  supermarkets, // já visto
  restaurants,  // já visto
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
  type FixedExpenseType, // já visto
  type InsertFixedExpenseType,  // já visto
  type Supermarket, // já visto
  type InsertSupermarket, // já visto
  type Restaurant,  // já visto
  type InsertRestaurant,  // já visto
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
  type InsertCharityType,
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
  updateOccasionalGroupStatus(
    id: number,
    status: "open" | "closed",
  ): Promise<OccasionalGroup>;

  //----------------------------------------------------------------------------
  // Para manutenção da subcategoria 'fixed'
  createFixedExpenseType(fixedExpenseType: InsertFixedExpenseType): Promise<FixedExpenseType>; 
  getFixedExpenseTypes(): Promise<FixedExpenseType[]>; 
  deleteFixedExpenseType(id: number): Promise<FixedExpenseType | null>;
  
  // Para manutenção da subcategoria 'supermarket'
  addSupermarket(supermarket: InsertSupermarket): Promise<Supermarket>;
  deleteSupermarket(id: number): Promise<Supermarket | null>;
  getSupermarkets(): Promise<Supermarket[]>;

  // Para manutenção da subcategoria 'food'
  addRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  deleteRestaurant(id: number): Promise<Restaurant | null>;
  getRestaurants(): Promise<Restaurant[]>;
  //----------------------------------------------------------------------------
  

  createServiceType(serviceType: InsertServiceType): Promise<ServiceType>;
  getServiceTypes(): Promise<ServiceType[]>;
  createLeisureType(leisureType: InsertLeisureType): Promise<LeisureType>;
  getLeisureTypes(): Promise<LeisureType[]>;
  createPersonalCareType(
    personalCareType: InsertPersonalCareType,
  ): Promise<PersonalCareType>;
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
    return await db
      .select()
      .from(expenses)
      .orderBy(desc(expenses.purchaseDate));
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
          lte(expenses.purchaseDate, endDate),
        ),
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
          lte(expenses.purchaseDate, endDate),
        ),
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
        occasionalGroup: occasionalGroups.name,
      })
      .from(expenses)
      .leftJoin(supermarkets, eq(expenses.supermarketId, supermarkets.id))
      .leftJoin(restaurants, eq(expenses.restaurantId, restaurants.id))
      .leftJoin(
        occasionalGroups,
        eq(expenses.occasionalGroupId, occasionalGroups.id),
      )
      .orderBy(desc(expenses.purchaseDate))
      .limit(limit);

    return result.map((expense) => ({
      ...expense,
      displayName:
        expense.supermarket ||
        expense.restaurant ||
        expense.storeName ||
        expense.occasionalGroup ||
        "Unknown",
      category: expense.routineCategory || "Occasional Group",
    }));
  }

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
      categoriesCount: 10, // Static for now, could be dynamic
    };
  }

  async getAnnualStats(year: number): Promise<any> {
    const yearlyExpenses = await this.getExpensesByYear(year);
    const total = yearlyExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0,
    );
    const avgMonthly = total / 12;

    // Get category totals
    const categoryTotals: { [key: string]: number } = {};
    yearlyExpenses.forEach((expense) => {
      const category = expense.routineCategory || "occasional";
      categoryTotals[category] =
        (categoryTotals[category] || 0) + parseFloat(expense.amount);
    });

    const topCategory = Object.entries(categoryTotals).reduce((a, b) =>
      categoryTotals[a[0]] > categoryTotals[b[0]] ? a : b,
    )[0];

    return {
      total,
      avgMonthly,
      topCategory,
      categoryTotals,
    };
  }

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

    return Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total,
      percentage:
        (total /
          expenseList.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)) *
        100,
    }));
  }

  // Occasional Groups
  async createOccasionalGroup(
    insertGroup: InsertOccasionalGroup,
  ): Promise<OccasionalGroup> {
    const [group] = await db
      .insert(occasionalGroups)
      .values(insertGroup)
      .returning();
    return group;
  }

  async getOccasionalGroups(): Promise<OccasionalGroup[]> {
    return await db
      .select()
      .from(occasionalGroups)
      .orderBy(desc(occasionalGroups.createdAt));
  }

  async getOpenOccasionalGroups(): Promise<OccasionalGroup[]> {
    return await db
      .select()
      .from(occasionalGroups)
      .where(eq(occasionalGroups.status, "open"))
      .orderBy(desc(occasionalGroups.createdAt));
  }

  async updateOccasionalGroupStatus(
    id: number,
    status: "open" | "closed",
  ): Promise<OccasionalGroup> {
    const [group] = await db
      .update(occasionalGroups)
      .set({ status })
      .where(eq(occasionalGroups.id, id))
      .returning();
    return group;
  }

  //----------------------------------------------------------------------------
  // Início das funções de manutenção da subcategoria 'fixed'
  async createFixedExpenseType(insertFixedExpenseType: InsertFixedExpenseType): Promise<FixedExpenseType> { 
    const [fixedExpenseType] = await db
      .insert(fixedExpenseTypes)
      .values(insertFixedExpenseType)
      .returning();
    return fixedExpenseType;
  }

  async deleteFixedExpenseType(id: number): Promise<FixedExpenseType | null> {
    const [deletedFixedExpenseType] = await db
      .delete(fixedExpenseTypes)
      .where(eq(fixedExpenseTypes.id, id))
      .returning();
    return deletedFixedExpenseType || null;
  }

  async getFixedExpenseTypes(): Promise<FixedExpenseType[]> { 
    return await db.select().from(fixedExpenseTypes).orderBy(fixedExpenseTypes.name);
  }
  // Fim das funções de manutenção da subcategoria 'fixed'

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
  
  async deleteSupermarket(id: number): Promise<Supermarket | null> {
    const [deletedSupermarket] = await db
      .delete(supermarkets)
      .where(eq(supermarkets.id, id))
      .returning();
    return deletedSupermarket || null;
  }

  async getSupermarkets(): Promise<Supermarket[]> {
    return await db
      .select()
      .from(supermarkets)
      .orderBy(supermarkets.name);
  }
  // Fim das funções de manutenção da subcategoria 'supermarket'

  // Início das funções de manutenção da subcategoria 'food'
  async addRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const [restaurant] = await db
      .insert(restaurants)
      .values(insertRestaurant)
      .returning();
    return restaurant;
  }

  async deleteRestaurant(id: number):     Promise<Restaurant | null> { 
    const [deletedRestaurant] = await db
      .delete(restaurants)
      .where(eq(restaurants.id, id))
      .returning();
    return deletedRestaurant || null;
  }
  
  async getRestaurants(): Promise<Restaurant[]> {
    return await db.select().from(restaurants).orderBy(restaurants.name);
  }
  // Fim das funções de manutenção da subcategoria 'food'
  //----------------------------------------------------------------------------

  async createServiceType(
    insertServiceType: InsertServiceType,
  ): Promise<ServiceType> {
    const [serviceType] = await db
      .insert(serviceTypes)
      .values(insertServiceType)
      .returning();
    return serviceType;
  }

  async getServiceTypes(): Promise<ServiceType[]> {
    return await db.select().from(serviceTypes).orderBy(serviceTypes.name);
  }

  async createLeisureType(
    insertLeisureType: InsertLeisureType,
  ): Promise<LeisureType> {
    const [leisureType] = await db
      .insert(leisureTypes)
      .values(insertLeisureType)
      .returning();
    return leisureType;
  }

  async getLeisureTypes(): Promise<LeisureType[]> {
    return await db.select().from(leisureTypes).orderBy(leisureTypes.name);
  }

  async createPersonalCareType(
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
      .orderBy(personalCareTypes.name);
  }

  async createHealthType(
    insertHealthType: InsertHealthType,
  ): Promise<HealthType> {
    const [healthType] = await db
      .insert(healthTypes)
      .values(insertHealthType)
      .returning();
    return healthType;
  }

  async getHealthTypes(): Promise<HealthType[]> {
    return await db.select().from(healthTypes).orderBy(healthTypes.name);
  }

  async createFamilyMember(
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

  async createCharityType(
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
}

// Memória temporária enquanto a conexão com o banco de dados é resolvida
class MemoryStorage implements IStorage {
  private expenses: Expense[] = [];
  private occasionalGroups: OccasionalGroup[] = [];

  //----------------------------------------------------------------------------
  private fixedExpenseTypes: FixedExpenseType[] = [
    // já visto
    { id: 1, name: "Aluguel do apartamento" },
    { id: 2, name: "Conta de luz"" },
    { id: 3, name: "Conta de água" },
  ];
  private supermarkets: Supermarket[] = [
    // já visto
    { id: 1, name: "Villareal" },
    { id: 2, name: "Bretas" },
    { id: 3, name: "Consul" },
  ];

  private restaurants: Restaurant[] = [
    // já visto
    { id: 1, name: "McDonald's" },
    { id: 2, name: "Subway" },
    { id: 3, name: "Spoleto" },
  ];
  //----------------------------------------------------------------------------
  
  private serviceTypes: ServiceType[] = [
    { id: 1, name: "Cleaning" },
    { id: 2, name: "Plumbing" },
    { id: 3, name: "Internet" },
  ];
  private leisureTypes: LeisureType[] = [
    { id: 1, name: "Movies" },
    { id: 2, name: "Gym" },
    { id: 3, name: "Concerts" },
  ];
  private personalCareTypes: PersonalCareType[] = [
    { id: 1, name: "Haircut" },
    { id: 2, name: "Spa" },
    { id: 3, name: "Dental" },
  ];
  private healthTypes: HealthType[] = [
    { id: 1, name: "Doctor Visit" },
    { id: 2, name: "Pharmacy" },
    { id: 3, name: "Lab Tests" },
  ];
  private familyMembers: FamilyMember[] = [
    { id: 1, name: "John" },
    { id: 2, name: "Sarah" },
    { id: 3, name: "Kids" },
  ];
  private charityTypes: CharityType[] = [
    { id: 1, name: "Food Bank" },
    { id: 2, name: "Red Cross" },
    { id: 3, name: "Local Charity" },
  ];

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const expense: Expense = {
      id: this.expenses.length + 1,
      amount: insertExpense.amount,
      purchaseDate: insertExpense.purchaseDate,
      paymentMethod: insertExpense.paymentMethod,
      expenseType: insertExpense.expenseType,
      routineCategory: insertExpense.routineCategory ?? null,
      occasionalGroupId: insertExpense.occasionalGroupId || null,
      fixedExpenseTypeId: insertExpense.fixedExpenseTypeId || null,  // já visto
      supermarketId: insertExpense.supermarketId || null,  // já visto
      restaurantId: insertExpense.restaurantId || null,  // já visto
      serviceTypeId: insertExpense.serviceTypeId || null,
      leisureTypeId: insertExpense.leisureTypeId || null,
      personalCareTypeId: insertExpense.personalCareTypeId || null,
      healthTypeId: insertExpense.healthTypeId || null,
      familyMemberId: insertExpense.familyMemberId || null,
      charityTypeId: insertExpense.charityTypeId || null,
      description: insertExpense.description ?? null,
      storeName: insertExpense.storeName ?? null,
      startingPoint: insertExpense.startingPoint ?? null,
      destination: insertExpense.destination ?? null,
      transportMode: insertExpense.transportMode ?? null,
      purchaseType: insertExpense.purchaseType ?? null,
      createdAt: new Date(),
    };
    this.expenses.push(expense);
    return expense;
  }

  async getExpenses(): Promise<Expense[]> {
    return this.expenses.sort(
      (a, b) =>
        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(),
    );
  }

  async getExpensesByMonth(year: number, month: number): Promise<Expense[]> {
    return this.expenses.filter((expense) => {
      const date = new Date(expense.purchaseDate);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    });
  }

  async getExpensesByYear(year: number): Promise<Expense[]> {
    return this.expenses.filter((expense) => {
      const date = new Date(expense.purchaseDate);
      return date.getFullYear() === year;
    });
  }

  async getRecentExpenses(limit: number = 5): Promise<any[]> {
    return this.expenses
      .sort(
        (a, b) =>
          new Date(b.purchaseDate).getTime() -
          new Date(a.purchaseDate).getTime(),
      )
      .slice(0, limit)
      .map((expense) => ({
        ...expense,
        displayName:
          this.supermarkets.find((s) => s.id === expense.supermarketId)?.name ||
          this.restaurants.find((r) => r.id === expense.restaurantId)?.name ||
          expense.storeName ||
          expense.description ||
          "Unknown",
        category: expense.routineCategory || "Occasional Group",
      }));
  }

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

  async createOccasionalGroup(
    insertGroup: InsertOccasionalGroup,
  ): Promise<OccasionalGroup> {
    const group: OccasionalGroup = {
      id: this.occasionalGroups.length + 1,
      ...insertGroup,
      status: "open",
      createdAt: new Date(),
    };
    this.occasionalGroups.push(group);
    return group;
  }

  async getOccasionalGroups(): Promise<OccasionalGroup[]> {
    return this.occasionalGroups.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async getOpenOccasionalGroups(): Promise<OccasionalGroup[]> {
    return this.occasionalGroups.filter((group) => group.status === "open");
  }

  async updateOccasionalGroupStatus(
    id: number,
    status: "open" | "closed",
  ): Promise<OccasionalGroup> {
    const group = this.occasionalGroups.find((g) => g.id === id);
    if (!group) throw new Error("Group not found");
    group.status = status;
    return group;
  }

  // Início das funções de manutenção da subcategoria 'supermarket' (não entendi a diferença)
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

  async createServiceType(
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

  async createLeisureType(
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

  async createPersonalCareType(
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

  async createHealthType(
    insertHealthType: InsertHealthType,
  ): Promise<HealthType> {
    const healthType: HealthType = {
      id: this.healthTypes.length + 1,
      ...insertHealthType,
    };
    this.healthTypes.push(healthType);
    return healthType;
  }

  async getHealthTypes(): Promise<HealthType[]> {
    return this.healthTypes.sort((a, b) => a.name.localeCompare(b.name));
  }

  async createFamilyMember(
    insertFamilyMember: InsertFamilyMember,
  ): Promise<FamilyMember> {
    const familyMember: FamilyMember = {
      id: this.familyMembers.length + 1,
      ...insertFamilyMember,
    };
    this.familyMembers.push(familyMember);
    return familyMember;
  }

  async getFamilyMembers(): Promise<FamilyMember[]> {
    return this.familyMembers.sort((a, b) => a.name.localeCompare(b.name));
  }

  async createCharityType(
    insertCharityType: InsertCharityType,
  ): Promise<CharityType> {
    const charityType: CharityType = {
      id: this.charityTypes.length + 1,
      ...insertCharityType,
    };
    this.charityTypes.push(charityType);
    return charityType;
  }

  async getCharityTypes(): Promise<CharityType[]> {
    return this.charityTypes.sort((a, b) => a.name.localeCompare(b.name));
  }
}

// Use memory storage for now while database connection is being resolved
export const storage = new MemoryStorage();
// export const storage = new DatabaseStorage();
