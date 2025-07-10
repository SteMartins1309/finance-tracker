var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  charityTypes: () => charityTypes,
  charityTypesRelations: () => charityTypesRelations,
  expenseTypeEnum: () => expenseTypeEnum,
  expenses: () => expenses,
  expensesRelations: () => expensesRelations,
  familyMembers: () => familyMembers,
  familyMembersRelations: () => familyMembersRelations,
  fixedExpenseTypes: () => fixedExpenseTypes,
  fixedExpenseTypesRelations: () => fixedExpenseTypesRelations,
  frequencyTypeEnum: () => frequencyTypeEnum,
  healthTypes: () => healthTypes,
  healthTypesRelations: () => healthTypesRelations,
  insertCharityTypeSchema: () => insertCharityTypeSchema,
  insertExpenseSchema: () => insertExpenseSchema,
  insertFamilyMemberSchema: () => insertFamilyMemberSchema,
  insertFixedExpenseTypeSchema: () => insertFixedExpenseTypeSchema,
  insertHealthTypeSchema: () => insertHealthTypeSchema,
  insertLeisureTypeSchema: () => insertLeisureTypeSchema,
  insertOccasionalGroupSchema: () => insertOccasionalGroupSchema,
  insertPersonalCareTypeSchema: () => insertPersonalCareTypeSchema,
  insertPlaceSchema: () => insertPlaceSchema,
  insertRestaurantSchema: () => insertRestaurantSchema,
  insertServiceTypeSchema: () => insertServiceTypeSchema,
  insertShopSchema: () => insertShopSchema,
  insertSupermarketSchema: () => insertSupermarketSchema,
  insertUserSchema: () => insertUserSchema,
  leisureTypes: () => leisureTypes,
  leisureTypesRelations: () => leisureTypesRelations,
  occasionTypeEnum: () => occasionTypeEnum,
  occasionalGroupStatusEnum: () => occasionalGroupStatusEnum,
  occasionalGroups: () => occasionalGroups,
  occasionalGroupsRelations: () => occasionalGroupsRelations,
  paymentMethodEnum: () => paymentMethodEnum,
  personalCareTypes: () => personalCareTypes,
  personalCareTypesRelations: () => personalCareTypesRelations,
  places: () => places,
  placesRelations: () => placesRelations,
  purchaseTypeEnum: () => purchaseTypeEnum,
  restaurants: () => restaurants,
  restaurantsRelations: () => restaurantsRelations,
  routineCategoryEnum: () => routineCategoryEnum,
  serviceTypes: () => serviceTypes,
  serviceTypesRelations: () => serviceTypesRelations,
  shops: () => shops,
  shopsRelations: () => shopsRelations,
  supermarkets: () => supermarkets,
  supermarketsRelations: () => supermarketsRelations,
  transportModeEnum: () => transportModeEnum,
  users: () => users
});
import {
  pgTable,
  text,
  serial,
  integer,
  decimal,
  timestamp,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var paymentMethodEnum = pgEnum("payment_method", [
  "pix",
  "debit-card",
  "credit-card",
  "cash",
  "bank-transfer"
]);
var expenseTypeEnum = pgEnum("expense_type", [
  "routine",
  "occasional"
]);
var routineCategoryEnum = pgEnum("routine_category", [
  "fixed",
  "supermarket",
  "food",
  "services",
  "leisure",
  "personal-care",
  "shopping",
  "transportation",
  "health",
  "family",
  "charity"
]);
var occasionalGroupStatusEnum = pgEnum("occasional_group_status", [
  "open",
  "closed"
]);
var frequencyTypeEnum = pgEnum("frequency_type", [
  "weekly",
  "monthly",
  "semi-annually",
  "annually"
]);
var occasionTypeEnum = pgEnum("occasion_type", [
  "normal",
  "special"
]);
var purchaseTypeEnum = pgEnum("purchase_type", [
  "in-person",
  "online"
]);
var transportModeEnum = pgEnum("transport_mode", [
  "car",
  "uber",
  "public-transport",
  "walking",
  "bicycle"
]);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var occasionalGroups = pgTable("occasional_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: occasionalGroupStatusEnum("status").notNull().default("open"),
  description: text("description"),
  iconName: text("icon_name"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var fixedExpenseTypes = pgTable("fixed_expense_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique()
});
var supermarkets = pgTable("supermarkets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique()
});
var restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique()
});
var serviceTypes = pgTable("service_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique()
});
var leisureTypes = pgTable("leisure_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique()
});
var personalCareTypes = pgTable("personal_care_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique()
});
var shops = pgTable("shops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique()
});
var places = pgTable("places", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique()
});
var healthTypes = pgTable("health_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique()
});
var familyMembers = pgTable("family_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique()
});
var charityTypes = pgTable("charity_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique()
});
var expenses = pgTable("expenses", {
  // Cada campo é uma chave estrangeira (foreign keys) que referencia uma das tabelas de categorias específicas
  // Geral para todas as despesas
  id: serial("id").primaryKey(),
  // ID da despesa
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  // Valor da despesa
  purchaseDate: timestamp("purchase_date").notNull(),
  // Data da compra
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  // Método de pagamento
  expenseType: expenseTypeEnum("expense_type").notNull(),
  // Tipo de despesa (rotina ou ocasional)
  routineCategory: routineCategoryEnum("routine_category"),
  // Categoria de despesa rotineira (se for rotina)
  occasionalGroupId: integer("occasional_group_id"),
  // ID do grupo de despesas ocasionais (se for ocasional)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Data de criação da despesa
  // Para as subcategorias de despesas rotineiras
  // Para a subcategoria 'fixed'
  fixedExpenseTypeId: integer("fixed_expense_type_id"),
  // ID do tipo de despesa fixa
  frequency: frequencyTypeEnum("frequency"),
  // Frequência de pagamento
  // Para a subcategoria 'supermarket'
  supermarketId: integer("supermarket_id"),
  // ID do supermercado
  // Para a subcategoria 'food'
  restaurantId: integer("restaurant_id"),
  // ID do restaurante
  occasionType: occasionTypeEnum("occasion_type").default("normal"),
  // Tipo de ocasião
  specialOccasionDescription: text("special_occasion_description"),
  // Descrição da ocasião especial
  foodPurchaseType: purchaseTypeEnum("food_purchase_type"),
  // Modo de compra
  restaurantName: text("restaurant_name"),
  // Nome da loja
  // Para a subcategoria 'services'
  serviceTypeId: integer("service_type_id"),
  // ID do tipo de serviço
  serviceDescription: text("service_description"),
  // Descrição do serviço
  // Para a subcategoria 'leisure'
  leisureTypeId: integer("leisure_type_id"),
  // ID do tipo de lazer
  leisureDescription: text("leisure_description"),
  // Descrição do lazer
  // Para a subcategoria 'personal-care'
  personalCareTypeId: integer("personal_care_type_id"),
  // ID do tipo de cuidado pessoal
  personalCareDescription: text("personal_care_description"),
  // Descrição do cuidado pessoal
  // Para a subcategoria 'shopping'
  shopId: integer("shop_id"),
  // ID da loja
  shoppingPurchaseType: purchaseTypeEnum("shopping_purchase_type"),
  // Modo de compra
  shoppingOccasionType: occasionTypeEnum("shopping_occasion_type").default("normal"),
  // Tipo de ocasião
  shoppingSpecialOccasionDescription: text("shopping_special_occasion_description"),
  // Descrição da ocasião especial
  // Para a subcategoria 'transportation'
  startPlaceId: integer("start_place_id"),
  // ID do lugar de partida
  endPlaceId: integer("end_place_id"),
  // ID do lugar de destino
  startingPoint: text("starting_point"),
  // Ponto de partida
  destination: text("destination"),
  // Destino
  transportMode: transportModeEnum("transport_mode"),
  // Modo de transporte
  transportDescription: text("transport_description"),
  // Descrição do transporte
  // Para a subcategoria 'health'
  healthTypeId: integer("health_type_id"),
  // ID do tipo de demanda de saúde
  healthDescription: text("health_description"),
  // Descrição da demanda de saúde
  // Para a subcategoria 'family'
  familyMemberId: integer("family_member_id"),
  // ID do membro da família
  familyDescription: text("family_description"),
  // Descrição da despesa familiar
  // Para a subcategoria 'charity'
  charityTypeId: integer("charity_type_id"),
  // ID do tipo de caridade
  charityDescription: text("charity_description")
  // Descrição da despesa de caridade
});
var expensesRelations = relations(expenses, ({ one }) => ({
  occasionalGroup: one(occasionalGroups, {
    fields: [expenses.occasionalGroupId],
    references: [occasionalGroups.id]
  }),
  // RELAÇÕES para as subcategorias de despesas rotineiras
  // Define que cada despesa pode estar associada a um tipo de despesa fixa específico
  fixedExpenseType: one(fixedExpenseTypes, {
    fields: [expenses.fixedExpenseTypeId],
    references: [fixedExpenseTypes.id]
  }),
  // Define que cada despesa pode estar associada a um supermercado específico
  supermarket: one(supermarkets, {
    fields: [expenses.supermarketId],
    references: [supermarkets.id]
  }),
  // Define que cada despesa pode estar associada a um restaurante específico
  restaurant: one(restaurants, {
    fields: [expenses.restaurantId],
    references: [restaurants.id]
  }),
  // Define que cada despesa pode estar associada a um tipo de serviço específico
  serviceType: one(serviceTypes, {
    fields: [expenses.serviceTypeId],
    references: [serviceTypes.id]
  }),
  // Define que cada despesa pode estar associada a um tipo de lazer específico
  leisureType: one(leisureTypes, {
    fields: [expenses.leisureTypeId],
    references: [leisureTypes.id]
  }),
  // Define que cada despesa pode estar associada a um tipo de cuidado pessoal específico
  personalCareType: one(personalCareTypes, {
    fields: [expenses.personalCareTypeId],
    references: [personalCareTypes.id]
  }),
  // Define que cada despesa pode estar associada a uma loja específica
  shop: one(shops, {
    fields: [expenses.shopId],
    references: [shops.id]
  }),
  // Define que cada despesa pode estar associada a um lugar específico
  startPlace: one(places, {
    fields: [expenses.startPlaceId],
    references: [places.id],
    relationName: "start_place_relation"
  }),
  endPlace: one(places, {
    fields: [expenses.endPlaceId],
    references: [places.id],
    relationName: "end_place_relation"
  }),
  // Define que cada despesa pode estar associada a um tipo de demanda de saúde específico
  healthType: one(healthTypes, {
    fields: [expenses.healthTypeId],
    references: [healthTypes.id]
  }),
  // Define que cada despesa pode estar associada a um membro da família específico
  familyMember: one(familyMembers, {
    fields: [expenses.familyMemberId],
    references: [familyMembers.id]
  }),
  // Define que cada despesa pode estar associada a um tipo de caridade específico
  charityType: one(charityTypes, {
    fields: [expenses.charityTypeId],
    references: [charityTypes.id]
  })
}));
var occasionalGroupsRelations = relations(
  occasionalGroups,
  ({ many }) => ({
    expenses: many(expenses)
  })
);
var fixedExpenseTypesRelations = relations(fixedExpenseTypes, ({ many }) => ({
  expenses: many(expenses)
}));
var supermarketsRelations = relations(supermarkets, ({ many }) => ({
  expenses: many(expenses)
}));
var restaurantsRelations = relations(restaurants, ({ many }) => ({
  expenses: many(expenses)
}));
var serviceTypesRelations = relations(serviceTypes, ({ many }) => ({
  expenses: many(expenses)
}));
var leisureTypesRelations = relations(leisureTypes, ({ many }) => ({
  expenses: many(expenses)
}));
var personalCareTypesRelations = relations(
  personalCareTypes,
  ({ many }) => ({
    expenses: many(expenses)
  })
);
var shopsRelations = relations(shops, ({ many }) => ({
  expenses: many(expenses)
}));
var placesRelations = relations(places, ({ many }) => ({
  expensesStart: many(expenses, { relationName: "start_place_relation" }),
  expensesEnd: many(expenses, { relationName: "end_place_relation" })
}));
var healthTypesRelations = relations(healthTypes, ({ many }) => ({
  expenses: many(expenses)
}));
var familyMembersRelations = relations(familyMembers, ({ many }) => ({
  expenses: many(expenses)
}));
var charityTypesRelations = relations(charityTypes, ({ many }) => ({
  expenses: many(expenses)
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true
});
var insertOccasionalGroupSchema = createInsertSchema(
  occasionalGroups
).omit({
  id: true,
  createdAt: true
});
var insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true
}).extend({
  purchaseDate: z.string().transform((str) => new Date(str))
});
var insertFixedExpenseTypeSchema = createInsertSchema(fixedExpenseTypes).omit({
  id: true
});
var insertSupermarketSchema = createInsertSchema(supermarkets).omit({
  id: true
});
var insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true
});
var insertServiceTypeSchema = createInsertSchema(serviceTypes).omit({
  id: true
});
var insertLeisureTypeSchema = createInsertSchema(leisureTypes).omit({
  id: true
});
var insertPersonalCareTypeSchema = createInsertSchema(personalCareTypes).omit({
  id: true
});
var insertShopSchema = createInsertSchema(shops).omit({
  id: true
});
var insertPlaceSchema = createInsertSchema(places).omit({
  id: true
});
var insertHealthTypeSchema = createInsertSchema(healthTypes).omit({
  id: true
});
var insertFamilyMemberSchema = createInsertSchema(familyMembers).omit({
  id: true
});
var insertCharityTypeSchema = createInsertSchema(charityTypes).omit({
  id: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, and, gte, lte } from "drizzle-orm";
var MemoryStorage = class {
  // PRIVATES: Armazena os dados em memória
  //-----------------------------------------------------------------------------------------
  // expenses: Armazena as despesas em memória
  expenses = [];
  // occasionalGroups: Armazena os grupos de despesas ocasionais em memória
  occasionalGroups = [
    { id: 1, name: "Viagem para o show", status: "open", createdAt: /* @__PURE__ */ new Date(), description: "Gastos de 3 dias no festival", iconName: "Music" },
    { id: 2, name: "Anivers\xE1rio do Jo\xE3o", status: "open", createdAt: /* @__PURE__ */ new Date(), description: "Compras e jantar", iconName: "Cake" },
    { id: 3, name: "Festa de fim de ano", status: "closed", createdAt: /* @__PURE__ */ new Date(), description: "Compras e jantar", iconName: "PartyPopper" }
  ];
  // Para as subcategorias de despesas rotineiras
  // fixedExpenseTypes: Armazena os tipos de despesas fixas em memória
  fixedExpenseTypes = [
    { id: 1, name: "Aluguel do apartamento" },
    { id: 2, name: "Conta de luz" },
    { id: 3, name: "Conta de \xE1gua" }
  ];
  // supermarkets: Armazena os supermercados em memória
  supermarkets = [
    { id: 1, name: "Villareal" },
    { id: 2, name: "Bretas" },
    { id: 3, name: "Consul" }
  ];
  // restaurants: Armazena os restaurantes em memória
  restaurants = [
    { id: 1, name: "McDonald's" },
    { id: 2, name: "Subway" },
    { id: 3, name: "Spoleto" }
  ];
  // serviceTypes: Armazena os tipos de serviços em memória
  serviceTypes = [
    { id: 1, name: "Servi\xE7os Dom\xE9sticos" },
    { id: 2, name: "Servi\xE7os T\xE9cnicos" },
    { id: 3, name: "Servi\xE7os Automotivos" }
  ];
  // leisureTypes: Armazena os tipos de lazer em memória
  leisureTypes = [
    { id: 1, name: "Cinema" },
    { id: 2, name: "Rol\xEA" },
    { id: 3, name: "Assinatura de Streaming" }
  ];
  // personalCareTypes: Armazena os tipos de cuidado pessoal em memória
  personalCareTypes = [
    { id: 1, name: "Cabelo" },
    { id: 2, name: "Maquiagem" },
    { id: 3, name: "Pele" }
  ];
  // shops: Armazena as lojas em memória
  shops = [
    { id: 1, name: "Amazon" },
    { id: 2, name: "Kalunga" },
    { id: 3, name: "Mercado Livre" }
  ];
  // places: Armazena os lugares em memória
  places = [
    { id: 1, name: "H8" },
    { id: 2, name: "Ap\xEA do Gabi" },
    { id: 3, name: "Shopping Centervale" }
  ];
  // healthTypes: Armazena os tipos de saúde em memória
  healthTypes = [
    { id: 1, name: "Rem\xE9dio" },
    { id: 2, name: "Atendimento M\xE9dico" },
    { id: 3, name: "Avalia\xE7\xE3o Psicol\xF3gica" }
  ];
  // familyMembers: Armazena os membros da família em memória  
  familyMembers = [
    { id: 1, name: "Mam\xE3e" },
    { id: 2, name: "Vov\xF3" },
    { id: 3, name: "Fernando" }
  ];
  // charityTypes: Armazena os tipos de caridade em memória
  charityTypes = [
    { id: 1, name: "Igreja" },
    { id: 2, name: "Ajuda \xE0 Cat\xE1strofe" },
    { id: 3, name: "Doa\xE7\xE3o na Rua" }
  ];
  //-----------------------------------------------------------------------------------------
  // CREATE EXPENSE: Insere uma nova despesa em memória
  async createExpense(insertExpense) {
    const expense = {
      // Geral para todas as despesas
      id: this.expenses.length + 1,
      amount: insertExpense.amount,
      purchaseDate: insertExpense.purchaseDate,
      paymentMethod: insertExpense.paymentMethod,
      expenseType: insertExpense.expenseType,
      routineCategory: insertExpense.routineCategory ?? null,
      occasionalGroupId: insertExpense.occasionalGroupId || null,
      createdAt: /* @__PURE__ */ new Date(),
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
      charityDescription: insertExpense.charityDescription || null
    };
    this.expenses.push(expense);
    return expense;
  }
  // FUNÇÕES ASSÍNCRONAS PARA RETORNOS DAS DESPESAS 
  //--------------------------------------------------------------------------------------------- 
  // GET EXPENSES: Retorna todas as despesas ordenadas pela data de compra
  async getExpenses() {
    return this.expenses.sort(
      (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    );
  }
  // GET EXPENSES BY MONTH: Retorna as despesas de um mês específico
  async getExpensesByMonth(year, month) {
    return this.expenses.filter((expense) => {
      const date = new Date(expense.purchaseDate);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    });
  }
  // GET EXPENSES BY YEAR: Retorna as despesas de um ano específico
  async getExpensesByYear(year) {
    return this.expenses.filter((expense) => {
      const date = new Date(expense.purchaseDate);
      return date.getFullYear() === year;
    });
  }
  // GET RECENT EXPENSES: Retorna as despesas mais recentes
  async getRecentExpenses(limit = 5) {
    return this.expenses.sort(
      (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    ).slice(0, limit).map((expense) => {
      let displayName = "Unknown";
      let categoryType = expense.routineCategory || "occasional";
      if (expense.expenseType === "occasional") {
        const occasionalGroup = this.occasionalGroups.find((g) => g.id === expense.occasionalGroupId);
        displayName = occasionalGroup?.name || "Grupo Ocasional";
      } else {
        switch (expense.routineCategory) {
          case "fixed":
            const fixedType = this.fixedExpenseTypes.find((t) => t.id === expense.fixedExpenseTypeId);
            displayName = fixedType?.name || "Despesa Fixa";
            break;
          case "supermarket":
            const supermarket = this.supermarkets.find((s) => s.id === expense.supermarketId);
            displayName = supermarket?.name || "Supermercado";
            break;
          case "food":
            const restaurant = this.restaurants.find((r) => r.id === expense.restaurantId);
            displayName = restaurant?.name || expense.specialOccasionDescription || "Alimenta\xE7\xE3o";
            break;
          case "services":
            const serviceType = this.serviceTypes.find((t) => t.id === expense.serviceTypeId);
            displayName = serviceType?.name || expense.serviceDescription || "Servi\xE7os";
            break;
          case "leisure":
            const leisureType = this.leisureTypes.find((t) => t.id === expense.leisureTypeId);
            displayName = leisureType?.name || expense.leisureDescription || "Lazer";
            break;
          case "personal-care":
            const personalCareType = this.personalCareTypes.find((t) => t.id === expense.personalCareTypeId);
            displayName = personalCareType?.name || expense.personalCareDescription || "Cuidado Pessoal";
            break;
          case "shopping":
            const shop = this.shops.find((s) => s.id === expense.shopId);
            displayName = shop?.name || expense.shoppingSpecialOccasionDescription || "Compras";
            break;
          case "transportation":
            const startPlace = this.places.find((p) => p.id === expense.startPlaceId);
            const endPlace = this.places.find((p) => p.id === expense.endPlaceId);
            if (startPlace?.name && endPlace?.name) {
              displayName = `${startPlace.name} -> ${endPlace.name}`;
            } else {
              displayName = expense.transportDescription || expense.transportMode || "Transporte";
            }
            break;
          case "health":
            const healthType = this.healthTypes.find((t) => t.id === expense.healthTypeId);
            displayName = healthType?.name || expense.healthDescription || "Sa\xFAde";
            break;
          case "family":
            const familyMember = this.familyMembers.find((m) => m.id === expense.familyMemberId);
            displayName = familyMember?.name || expense.familyDescription || "Fam\xEDlia";
            break;
          case "charity":
            const charityType = this.charityTypes.find((t) => t.id === expense.charityTypeId);
            displayName = charityType?.name || expense.charityDescription || "Caridade";
            break;
        }
      }
      return {
        ...expense,
        displayName,
        category: categoryType
        // Retorna a categoria principal (enum string) para o frontend usar nos ícones
      };
    });
  }
  // GET MONTHLY STATS: Retorna as estatísticas mensais
  async getMonthlyStats() {
    const currentDate = /* @__PURE__ */ new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const monthlyExpenses = await this.getExpensesByMonth(
      currentYear,
      currentMonth
    );
    const yearlyExpenses = await this.getExpensesByYear(currentYear);
    const monthlyTotal = monthlyExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0
    );
    const yearlyTotal = yearlyExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0
    );
    const averageMonthly = yearlyTotal / currentMonth;
    return {
      monthlyTotal,
      yearlyTotal,
      averageMonthly,
      categoriesCount: 10
    };
  }
  // GET ANNUAL STATS: Retorna as estatísticas anuais
  async getAnnualStats(year) {
    const yearlyExpenses = await this.getExpensesByYear(year);
    const total = yearlyExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0
    );
    const avgMonthly = total / 12;
    const categoryTotals = {};
    yearlyExpenses.forEach((expense) => {
      const category = expense.routineCategory || "occasional";
      categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount);
    });
    const topCategory = Object.keys(categoryTotals).length > 0 ? Object.entries(categoryTotals).reduce(
      (a, b) => categoryTotals[a[0]] > categoryTotals[b[0]] ? a : b
    )[0] : "none";
    return {
      total,
      avgMonthly,
      topCategory,
      categoryTotals
    };
  }
  // GET CATEGORY BREAKDOWN: Retorna o desdobramento de categorias
  async getCategoryBreakdown(year, month) {
    const expenseList = month ? await this.getExpensesByMonth(year, month) : await this.getExpensesByYear(year);
    const categoryTotals = {};
    expenseList.forEach((expense) => {
      const category = expense.routineCategory || "occasional";
      categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount);
    });
    const totalAmount = expenseList.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0
    );
    return Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total,
      percentage: totalAmount > 0 ? total / totalAmount * 100 : 0
    }));
  }
  //---------------------------------------------------------------------------------------------
  // fim das FUNÇÕES ASSÍNCRONAS PARA RETORNOS DAS DESPESAS
  // FUNÇÕES ASSÍNCRONAS PARA AS DESPESAS OCASIONAIS
  //---------------------------------------------------------------------------------------------
  // CREATE OCCASIONAL GROUP: Insere um novo grupo de despesas ocasionais em memória
  async createOccasionalGroup(insertGroup) {
    const group = {
      id: this.occasionalGroups.length + 1,
      ...insertGroup,
      status: "open",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.occasionalGroups.push(group);
    return group;
  }
  // GET OCCASIONAL GROUPS: Retorna todos os grupos de despesas ocasionais ordenados pela data de criação
  async getOccasionalGroups() {
    return this.occasionalGroups.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  // GET OPEN OCCASIONAL GROUPS: Retorna todos os grupos de despesas ocasionais abertos ordenados pela data de criação
  async getOpenOccasionalGroups() {
    return this.occasionalGroups.filter((group) => group.status === "open");
  }
  // DELETE OCCASIONAL GROUP: Exclui um grupo de despesas ocasionais da memória
  async deleteOccasionalGroup(id) {
    const index = this.occasionalGroups.findIndex((g) => g.id === id);
    if (index === -1) return null;
    const deletedGroup = this.occasionalGroups[index];
    this.occasionalGroups.splice(index, 1);
    return deletedGroup;
  }
  // UPDATE OCCASIONAL GROUP STATUS: Atualiza o status de um grupo de despesas ocasionais
  async updateOccasionalGroupStatus(id, status) {
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
  async addFixedExpenseType(insertFixedExpenseType) {
    const fixedExpenseType = {
      id: this.fixedExpenseTypes.length > 0 ? Math.max(...this.fixedExpenseTypes.map((t) => t.id)) + 1 : 1,
      ...insertFixedExpenseType
    };
    this.fixedExpenseTypes.push(fixedExpenseType);
    return fixedExpenseType;
  }
  async getFixedExpenseTypes() {
    return this.fixedExpenseTypes.sort((a, b) => a.name.localeCompare(b.name));
  }
  async deleteFixedExpenseType(id) {
    const index = this.fixedExpenseTypes.findIndex((t) => t.id === id);
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
  async addSupermarket(insertSupermarket) {
    const supermarket = {
      id: this.supermarkets.length + 1,
      ...insertSupermarket
    };
    this.supermarkets.push(supermarket);
    return supermarket;
  }
  async deleteSupermarket(id) {
    const index = this.supermarkets.findIndex((s) => s.id === id);
    if (index === -1) {
      return null;
    }
    const deletedSupermarket = this.supermarkets[index];
    this.supermarkets.splice(index, 1);
    return deletedSupermarket;
  }
  async getSupermarkets() {
    return this.supermarkets.sort((a, b) => a.name.localeCompare(b.name));
  }
  // Fim das funções de manutenção da subcategoria 'supermarket'
  //---------------------------------------------------------------------------------------------
  // Início das funções de manutenção da subcategoria 'food' 
  async addRestaurant(insertRestaurant) {
    const restaurant = {
      id: this.restaurants.length + 1,
      ...insertRestaurant
    };
    this.restaurants.push(restaurant);
    return restaurant;
  }
  async deleteRestaurant(id) {
    const index = this.restaurants.findIndex((r) => r.id === id);
    if (index === -1) {
      return null;
    }
    const deletedRestaurant = this.restaurants[index];
    this.restaurants.splice(index, 1);
    return deletedRestaurant;
  }
  async getRestaurants() {
    return this.restaurants.sort((a, b) => a.name.localeCompare(b.name));
  }
  // Fim das funções de manutenção da subcategoria 'food'
  //---------------------------------------------------------------------------------------------
  // Início das funções de manutenção da subcategoria 'services'
  async addServiceType(insertServiceType) {
    const serviceType = {
      id: this.serviceTypes.length + 1,
      ...insertServiceType
    };
    this.serviceTypes.push(serviceType);
    return serviceType;
  }
  async getServiceTypes() {
    return this.serviceTypes.sort((a, b) => a.name.localeCompare(b.name));
  }
  async deleteServiceType(id) {
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
  async addLeisureType(insertLeisureType) {
    const leisureType = {
      id: this.leisureTypes.length + 1,
      ...insertLeisureType
    };
    this.leisureTypes.push(leisureType);
    return leisureType;
  }
  async getLeisureTypes() {
    return this.leisureTypes.sort((a, b) => a.name.localeCompare(b.name));
  }
  async deleteLeisureType(id) {
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
  async addPersonalCareType(insertPersonalCareType) {
    const personalCareType = {
      id: this.personalCareTypes.length + 1,
      ...insertPersonalCareType
    };
    this.personalCareTypes.push(personalCareType);
    return personalCareType;
  }
  async getPersonalCareTypes() {
    return this.personalCareTypes.sort((a, b) => a.name.localeCompare(b.name));
  }
  async deletePersonalCareType(id) {
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
  async addShop(insertShop) {
    const shop = {
      id: this.shops.length > 0 ? Math.max(...this.shops.map((s) => s.id)) + 1 : 1,
      // IDs robustos
      ...insertShop
    };
    this.shops.push(shop);
    return shop;
  }
  async getShops() {
    return this.shops.sort((a, b) => a.name.localeCompare(b.name));
  }
  async deleteShop(id) {
    const index = this.shops.findIndex((s) => s.id === id);
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
  async addPlace(insertPlace) {
    const place = {
      id: this.places.length > 0 ? Math.max(...this.places.map((p) => p.id)) + 1 : 1,
      // IDs robustos
      ...insertPlace
    };
    this.places.push(place);
    return place;
  }
  async getPlaces() {
    return this.places.sort((a, b) => a.name.localeCompare(b.name));
  }
  async deletePlace(id) {
    const index = this.places.findIndex((p) => p.id === id);
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
  async addHealthType(insertHealthType) {
    const healthType = {
      id: this.healthTypes.length > 0 ? Math.max(...this.healthTypes.map((h) => h.id)) + 1 : 1,
      ...insertHealthType
    };
    this.healthTypes.push(healthType);
    return healthType;
  }
  async getHealthTypes() {
    return this.healthTypes.sort((a, b) => a.name.localeCompare(b.name));
  }
  async deleteHealthType(id) {
    const index = this.healthTypes.findIndex((h) => h.id === id);
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
  async addFamilyMember(insertFamilyMember) {
    const familyMember = {
      id: this.familyMembers.length > 0 ? Math.max(...this.familyMembers.map((f) => f.id)) + 1 : 1,
      ...insertFamilyMember
    };
    this.familyMembers.push(familyMember);
    return familyMember;
  }
  async getFamilyMembers() {
    return this.familyMembers.sort((a, b) => a.name.localeCompare(b.name));
  }
  async deleteFamilyMember(id) {
    const index = this.familyMembers.findIndex((f) => f.id === id);
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
  async addCharityType(insertCharityType) {
    const charityType = {
      id: this.charityTypes.length > 0 ? Math.max(...this.charityTypes.map((c) => c.id)) + 1 : 1,
      ...insertCharityType
    };
    this.charityTypes.push(charityType);
    return charityType;
  }
  async getCharityTypes() {
    return this.charityTypes.sort((a, b) => a.name.localeCompare(b.name));
  }
  async deleteCharityType(id) {
    const index = this.charityTypes.findIndex((c) => c.id === id);
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
};
var storage = new MemoryStorage();

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  app2.post("/api/expenses", async (req, res) => {
    try {
      const expense = insertExpenseSchema.parse(req.body);
      const created = await storage.createExpense(expense);
      res.json(created);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        console.error("Zod Validation Error for expense:", error.issues);
        return res.status(400).json({ errors: error.issues });
      }
      console.error("Server error adding expense:", error);
      res.status(500).json({ error: "Failed to add expense due to server error" });
    }
  });
  app2.get("/api/expenses", async (req, res) => {
    try {
      const expenses2 = await storage.getExpenses();
      res.json(expenses2);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });
  app2.get("/api/expenses/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 5;
      const expenses2 = await storage.getRecentExpenses(limit);
      res.json(expenses2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent expenses" });
    }
  });
  app2.get("/api/expenses/monthly/:year/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const expenses2 = await storage.getExpensesByMonth(year, month);
      res.json(expenses2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monthly expenses" });
    }
  });
  app2.get("/api/expenses/yearly/:year", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const expenses2 = await storage.getExpensesByYear(year);
      res.json(expenses2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch yearly expenses" });
    }
  });
  app2.get("/api/stats/monthly", async (req, res) => {
    try {
      const stats = await storage.getMonthlyStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monthly stats" });
    }
  });
  app2.get("/api/stats/annual/:year", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const stats = await storage.getAnnualStats(year);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch annual stats" });
    }
  });
  app2.get("/api/stats/category-breakdown/:year", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = req.query.month ? parseInt(req.query.month) : void 0;
      const breakdown = await storage.getCategoryBreakdown(year, month);
      res.json(breakdown);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category breakdown" });
    }
  });
  app2.post("/api/occasional-groups", async (req, res) => {
    try {
      const group = insertOccasionalGroupSchema.parse(req.body);
      const created = await storage.createOccasionalGroup(group);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid group data" });
    }
  });
  app2.get("/api/occasional-groups", async (req, res) => {
    try {
      const groups = await storage.getOccasionalGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch occasional groups" });
    }
  });
  app2.get("/api/occasional-groups/open", async (req, res) => {
    try {
      const groups = await storage.getOpenOccasionalGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch open groups" });
    }
  });
  app2.delete("/api/occasional-groups/:id", async (req, res) => {
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
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete occasional group" });
    }
  });
  app2.patch("/api/occasional-groups/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await storage.updateOccasionalGroupStatus(id, status);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Failed to update group status" });
    }
  });
  app2.post("/api/fixed-expense-types", async (req, res) => {
    try {
      const fixedTypeData = insertFixedExpenseTypeSchema.parse(req.body);
      const newFixedType = await storage.addFixedExpenseType(fixedTypeData);
      res.status(201).json(newFixedType);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        console.error("Zod Validation Error for fixed expense type:", error.issues);
        return res.status(400).json({ errors: error.issues });
      }
      console.error("Server error creating fixed expense type:", error);
      res.status(500).json({ error: "Failed to create fixed expense type" });
    }
  });
  app2.delete("/api/fixed-expense-types/:id", async (req, res) => {
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
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete fixed expense type" });
    }
  });
  app2.get("/api/fixed-expense-types", async (req, res) => {
    try {
      const fixedTypes = await storage.getFixedExpenseTypes();
      res.json(fixedTypes);
    } catch (error) {
      console.error("Error fetching fixed expense types:", error);
      res.status(500).json({ error: "Failed to fetch fixed expense types" });
    }
  });
  app2.post("/api/supermarkets", async (req, res) => {
    try {
      const supermarketData = insertSupermarketSchema.parse(req.body);
      const newSupermarket = await storage.addSupermarket(supermarketData);
      res.status(201).json(newSupermarket);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        console.error("Zod Validation Error for supermarket:", error.issues);
        return res.status(400).json({ errors: error.issues });
      }
      console.error("Error creating supermarket:", error);
      res.status(500).json({ error: "Failed to create supermarket" });
    }
  });
  app2.delete("/api/supermarkets/:id", async (req, res) => {
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
    } catch (error) {
      if (error instanceof z2.ZodError) {
        console.error("Zod Validation Error for deleting supermarket:", error.issues);
        return res.status(400).json({ errors: error.issues });
      }
      console.error("Error deleting supermarket:", error);
      res.status(500).json({ error: "Failed to delete supermarket" });
    }
  });
  app2.get("/api/supermarkets", async (req, res) => {
    try {
      const supermarkets2 = await storage.getSupermarkets();
      res.json(supermarkets2);
    } catch (error) {
      console.error("Error fetching supermarkets:", error);
      res.status(500).json({ error: "Failed to fetch supermarkets" });
    }
  });
  app2.post("/api/restaurants", async (req, res) => {
    try {
      const restaurant = insertRestaurantSchema.parse(req.body);
      const created = await storage.addRestaurant(restaurant);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid restaurant data" });
    }
  });
  app2.delete("/api/restaurants/:id", async (req, res) => {
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
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete restaurant" });
    }
  });
  app2.get("/api/restaurants", async (req, res) => {
    try {
      const restaurants2 = await storage.getRestaurants();
      res.json(restaurants2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch restaurants" });
    }
  });
  app2.post("/api/service-types", async (req, res) => {
    try {
      const serviceType = insertServiceTypeSchema.parse(req.body);
      const created = await storage.addServiceType(serviceType);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid service type data" });
    }
  });
  app2.get("/api/service-types", async (req, res) => {
    try {
      const serviceTypes2 = await storage.getServiceTypes();
      res.json(serviceTypes2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service types" });
    }
  });
  app2.delete("/api/service-types/:id", async (req, res) => {
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
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete service type" });
    }
  });
  app2.post("/api/leisure-types", async (req, res) => {
    try {
      const leisureType = insertLeisureTypeSchema.parse(req.body);
      const created = await storage.addLeisureType(leisureType);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid leisure type data" });
    }
  });
  app2.get("/api/leisure-types", async (req, res) => {
    try {
      const leisureTypes2 = await storage.getLeisureTypes();
      res.json(leisureTypes2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leisure types" });
    }
  });
  app2.delete("/api/leisure-types/:id", async (req, res) => {
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
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete leisure type" });
    }
  });
  app2.post("/api/personal-care-types", async (req, res) => {
    try {
      const personalCareType = insertPersonalCareTypeSchema.parse(req.body);
      const created = await storage.addPersonalCareType(personalCareType);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid personal care type data" });
    }
  });
  app2.get("/api/personal-care-types", async (req, res) => {
    try {
      const personalCareTypes2 = await storage.getPersonalCareTypes();
      res.json(personalCareTypes2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch personal care types" });
    }
  });
  app2.delete("/api/personal-care-types/:id", async (req, res) => {
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
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete personal care type" });
    }
  });
  app2.post("/api/shops", async (req, res) => {
    try {
      const shopData = insertShopSchema.parse(req.body);
      const newShop = await storage.addShop(shopData);
      res.status(201).json(newShop);
    } catch (error) {
      console.error("Error creating shop:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to create shop" });
    }
  });
  app2.get("/api/shops", async (req, res) => {
    try {
      const shops2 = await storage.getShops();
      res.json(shops2);
    } catch (error) {
      console.error("Error fetching shops:", error);
      res.status(500).json({ error: "Failed to fetch shops" });
    }
  });
  app2.delete("/api/shops/:id", async (req, res) => {
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
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete shop" });
    }
  });
  app2.post("/api/places", async (req, res) => {
    try {
      const placeData = insertPlaceSchema.parse(req.body);
      const newPlace = await storage.addPlace(placeData);
      res.status(201).json(newPlace);
    } catch (error) {
      console.error("Error creating place:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to create place" });
    }
  });
  app2.get("/api/places", async (req, res) => {
    try {
      const places2 = await storage.getPlaces();
      res.json(places2);
    } catch (error) {
      console.error("Error fetching places:", error);
      res.status(500).json({ error: "Failed to fetch places" });
    }
  });
  app2.delete("/api/places/:id", async (req, res) => {
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
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete place" });
    }
  });
  app2.post("/api/health-types", async (req, res) => {
    try {
      const healthType = insertHealthTypeSchema.parse(req.body);
      const created = await storage.addHealthType(healthType);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid health type data" });
    }
  });
  app2.get("/api/health-types", async (req, res) => {
    try {
      const healthTypes2 = await storage.getHealthTypes();
      res.json(healthTypes2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch health types" });
    }
  });
  app2.delete("/api/health-types/:id", async (req, res) => {
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
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete health type" });
    }
  });
  app2.post("/api/family-members", async (req, res) => {
    try {
      const familyMember = insertFamilyMemberSchema.parse(req.body);
      const created = await storage.addFamilyMember(familyMember);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid family member data" });
    }
  });
  app2.get("/api/family-members", async (req, res) => {
    try {
      const familyMembers2 = await storage.getFamilyMembers();
      res.json(familyMembers2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch family members" });
    }
  });
  app2.delete("/api/family-members/:id", async (req, res) => {
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
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete family member" });
    }
  });
  app2.post("/api/charity-types", async (req, res) => {
    try {
      const charityType = insertCharityTypeSchema.parse(req.body);
      const created = await storage.addCharityType(charityType);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid charity type data" });
    }
  });
  app2.get("/api/charity-types", async (req, res) => {
    try {
      const charityTypes2 = await storage.getCharityTypes();
      res.json(charityTypes2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch charity types" });
    }
  });
  app2.delete("/api/charity-types/:id", async (req, res) => {
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
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ error: "Failed to delete charity type" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
