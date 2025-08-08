var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  alias: () => alias,
  charityTypes: () => charityTypes,
  charityTypesRelations: () => charityTypesRelations,
  expenseTypeEnum: () => expenseTypeEnum,
  expenses: () => expenses,
  expensesRelations: () => expensesRelations,
  familyMembers: () => familyMembers,
  familyMembersRelations: () => familyMembersRelations,
  financialYears: () => financialYears,
  financialYearsRelations: () => financialYearsRelations,
  fixedExpenseTypes: () => fixedExpenseTypes,
  fixedExpenseTypesRelations: () => fixedExpenseTypesRelations,
  frequencyTypeEnum: () => frequencyTypeEnum,
  healthTypes: () => healthTypes,
  healthTypesRelations: () => healthTypesRelations,
  insertCharityTypeSchema: () => insertCharityTypeSchema,
  insertExpenseSchema: () => insertExpenseSchema,
  insertFamilyMemberSchema: () => insertFamilyMemberSchema,
  insertFinancialYearSchema: () => insertFinancialYearSchema,
  insertFixedExpenseTypeSchema: () => insertFixedExpenseTypeSchema,
  insertHealthTypeSchema: () => insertHealthTypeSchema,
  insertLeisureTypeSchema: () => insertLeisureTypeSchema,
  insertMonthlyGoalSchema: () => insertMonthlyGoalSchema,
  insertOccasionalGroupSchema: () => insertOccasionalGroupSchema,
  insertPersonalCareTypeSchema: () => insertPersonalCareTypeSchema,
  insertPlaceSchema: () => insertPlaceSchema,
  insertRecurringExpenseSchema: () => insertRecurringExpenseSchema,
  insertRestaurantSchema: () => insertRestaurantSchema,
  insertServiceTypeSchema: () => insertServiceTypeSchema,
  insertShopSchema: () => insertShopSchema,
  insertStudyTypeSchema: () => insertStudyTypeSchema,
  insertSupermarketSchema: () => insertSupermarketSchema,
  insertUserSchema: () => insertUserSchema,
  leisureTypes: () => leisureTypes,
  leisureTypesRelations: () => leisureTypesRelations,
  monthlyGoals: () => monthlyGoals,
  monthlyGoalsRelations: () => monthlyGoalsRelations,
  occasionTypeEnum: () => occasionTypeEnum,
  occasionalGroupStatusEnum: () => occasionalGroupStatusEnum,
  occasionalGroups: () => occasionalGroups,
  occasionalGroupsRelations: () => occasionalGroupsRelations,
  paymentMethodEnum: () => paymentMethodEnum,
  paymentStatusEnum: () => paymentStatusEnum,
  personalCareTypes: () => personalCareTypes,
  personalCareTypesRelations: () => personalCareTypesRelations,
  places: () => places,
  placesRelations: () => placesRelations,
  purchaseTypeEnum: () => purchaseTypeEnum,
  recurrenceTypeEnum: () => recurrenceTypeEnum,
  recurringExpenses: () => recurringExpenses,
  recurringExpensesRelations: () => recurringExpensesRelations,
  relations: () => relations,
  restaurants: () => restaurants,
  restaurantsRelations: () => restaurantsRelations,
  routineCategoryEnum: () => routineCategoryEnum,
  serviceTypes: () => serviceTypes,
  serviceTypesRelations: () => serviceTypesRelations,
  shops: () => shops,
  shopsRelations: () => shopsRelations,
  studyTypes: () => studyTypes,
  studyTypesRelations: () => studyTypesRelations,
  supermarkets: () => supermarkets,
  supermarketsRelations: () => supermarketsRelations,
  transportModeEnum: () => transportModeEnum,
  users: () => users
});
import {
  pgTable,
  text,
  serial,
  real,
  integer,
  timestamp,
  pgEnum,
  alias
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
  // Mantido nome original
  "routine",
  "occasional"
]);
var routineCategoryEnum = pgEnum("routine_category", [
  "fixed",
  "supermarket",
  "food",
  "services",
  "study",
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
  "bus",
  "plane",
  "subway",
  "another"
]);
var recurrenceTypeEnum = pgEnum("recurrence_type", [
  "undetermined",
  "paused",
  "determined"
]);
var paymentStatusEnum = pgEnum("payment_status", [
  "paid",
  "pending"
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  openingDate: timestamp("opening_date", { mode: "date" }).defaultNow().notNull(),
  closingDate: timestamp("closing_date", { mode: "date" })
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
var studyTypes = pgTable("study_types", {
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
var recurringExpenses = pgTable("recurring_expenses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  expenseType: expenseTypeEnum("expense_type").notNull(),
  routineCategory: routineCategoryEnum("routine_category"),
  occasionalGroupId: integer("occasional_group_id"),
  fixedExpenseTypeId: integer("fixed_expense_type_id"),
  frequency: frequencyTypeEnum("frequency"),
  supermarketId: integer("supermarket_id"),
  restaurantId: integer("restaurant_id"),
  occasionType: occasionTypeEnum("occasion_type"),
  specialOccasionDescription: text("special_occasion_description"),
  foodPurchaseType: purchaseTypeEnum("food_purchase_type"),
  serviceTypeId: integer("service_type_id"),
  serviceDescription: text("service_description"),
  studyTypeId: integer("study_type_id"),
  studyDescription: text("study_description"),
  leisureTypeId: integer("leisure_type_id"),
  leisureDescription: text("leisure_description"),
  personalCareTypeId: integer("personal_care_type_id"),
  personalCareDescription: text("personal_care_description"),
  shopId: integer("shop_id"),
  shoppingPurchaseType: purchaseTypeEnum("shopping_purchase_type"),
  shoppingOccasionType: occasionTypeEnum("shopping_occasion_type"),
  shoppingSpecialOccasionDescription: text("shopping_special_occasion_description"),
  startPlaceId: integer("start_place_id"),
  endPlaceId: integer("end_place_id"),
  startingPoint: text("starting_point"),
  destination: text("destination"),
  transportMode: transportModeEnum("transport_mode"),
  transportDescription: text("transport_description"),
  healthTypeId: integer("health_type_id"),
  healthDescription: text("health_description"),
  familyMemberId: integer("family_member_id"),
  familyDescription: text("family_description"),
  charityTypeId: integer("charity_type_id"),
  charityDescription: text("charity_description"),
  recurrenceType: recurrenceTypeEnum("recurrence_type").notNull().default("undetermined"),
  installmentsTotal: integer("installments_total"),
  installmentsPaid: integer("installments_paid").default(0).notNull(),
  installmentsTrulyPaid: integer("installments_truly_paid").default(0).notNull(),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  nextOccurrenceDate: timestamp("next_occurrence_date", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  amount: real("amount").notNull(),
  purchaseDate: timestamp("purchase_date", { mode: "date" }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  expenseType: expenseTypeEnum("expense_type").notNull(),
  routineCategory: routineCategoryEnum("routine_category"),
  occasionalGroupId: integer("occasional_group_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  fixedExpenseTypeId: integer("fixed_expense_type_id"),
  frequency: frequencyTypeEnum("frequency"),
  supermarketId: integer("supermarket_id"),
  restaurantId: integer("restaurant_id"),
  occasionType: occasionTypeEnum("occasion_type").default("normal"),
  specialOccasionDescription: text("special_occasion_description"),
  foodPurchaseType: purchaseTypeEnum("food_purchase_type"),
  serviceTypeId: integer("service_type_id"),
  serviceDescription: text("service_description"),
  studyTypeId: integer("study_type_id"),
  studyDescription: text("study_description"),
  leisureTypeId: integer("leisure_type_id"),
  leisureDescription: text("leisure_description"),
  personalCareTypeId: integer("personal_care_type_id"),
  personalCareDescription: text("personal_care_description"),
  shopId: integer("shop_id"),
  shoppingPurchaseType: purchaseTypeEnum("shopping_purchase_type").default("in-person"),
  shoppingOccasionType: occasionTypeEnum("shopping_occasion_type").default("normal"),
  shoppingSpecialOccasionDescription: text("shopping_special_occasion_description"),
  startPlaceId: integer("start_place_id"),
  endPlaceId: integer("end_place_id"),
  startingPoint: text("starting_point"),
  destination: text("destination"),
  transportMode: transportModeEnum("transport_mode"),
  transportDescription: text("transport_description"),
  healthTypeId: integer("health_type_id"),
  healthDescription: text("health_description"),
  familyMemberId: integer("family_member_id"),
  familyDescription: text("family_description"),
  charityTypeId: integer("charity_type_id"),
  charityDescription: text("charity_description"),
  // CAMPOS ADICIONADOS PARA RECORRÊNCIAS
  recurringExpenseId: integer("recurring_expense_id"),
  // FK para recurring_expenses
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  // Status de pagamento
  installmentNumber: integer("installment_number")
  // Número da parcela
});
var financialYears = pgTable("financial_years", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull().unique(),
  totalMonthlyGoal: real("total_monthly_goal").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var monthlyGoals = pgTable("monthly_goals", {
  id: serial("id").primaryKey(),
  financialYearId: integer("financial_year_id").notNull().references(() => financialYears.id, { onDelete: "cascade" }),
  category: routineCategoryEnum("category").notNull(),
  amount: real("amount").notNull()
});
var expensesRelations = relations(expenses, ({ one }) => ({
  occasionalGroup: one(occasionalGroups, {
    fields: [expenses.occasionalGroupId],
    references: [occasionalGroups.id]
  }),
  // Relação com a tabela recurringExpenses
  recurringExpense: one(recurringExpenses, {
    fields: [expenses.recurringExpenseId],
    references: [recurringExpenses.id]
  }),
  fixedExpenseType: one(fixedExpenseTypes, {
    fields: [expenses.fixedExpenseTypeId],
    references: [fixedExpenseTypes.id]
  }),
  supermarket: one(supermarkets, {
    fields: [expenses.supermarketId],
    references: [supermarkets.id]
  }),
  restaurant: one(restaurants, {
    fields: [expenses.restaurantId],
    references: [restaurants.id]
  }),
  serviceType: one(serviceTypes, {
    fields: [expenses.serviceTypeId],
    references: [serviceTypes.id]
  }),
  studyType: one(studyTypes, {
    fields: [expenses.studyTypeId],
    references: [studyTypes.id]
  }),
  leisureType: one(leisureTypes, {
    fields: [expenses.leisureTypeId],
    references: [leisureTypes.id]
  }),
  personalCareType: one(personalCareTypes, {
    fields: [expenses.personalCareTypeId],
    references: [personalCareTypes.id]
  }),
  shop: one(shops, {
    fields: [expenses.shopId],
    references: [shops.id]
  }),
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
  healthType: one(healthTypes, {
    fields: [expenses.healthTypeId],
    references: [healthTypes.id]
  }),
  familyMember: one(familyMembers, {
    fields: [expenses.familyMemberId],
    references: [familyMembers.id]
  }),
  charityType: one(charityTypes, {
    fields: [expenses.charityTypeId],
    references: [charityTypes.id]
  })
}));
var recurringExpensesRelations = relations(recurringExpenses, ({ one, many }) => ({
  occasionalGroup: one(occasionalGroups, {
    fields: [recurringExpenses.occasionalGroupId],
    references: [occasionalGroups.id]
  }),
  fixedExpenseType: one(fixedExpenseTypes, {
    fields: [recurringExpenses.fixedExpenseTypeId],
    references: [fixedExpenseTypes.id]
  }),
  supermarket: one(supermarkets, {
    fields: [recurringExpenses.supermarketId],
    references: [supermarkets.id]
  }),
  restaurant: one(restaurants, {
    fields: [recurringExpenses.restaurantId],
    references: [restaurants.id]
  }),
  serviceType: one(serviceTypes, {
    fields: [recurringExpenses.serviceTypeId],
    references: [serviceTypes.id]
  }),
  studyType: one(studyTypes, {
    fields: [recurringExpenses.studyTypeId],
    references: [studyTypes.id]
  }),
  leisureType: one(leisureTypes, {
    fields: [recurringExpenses.leisureTypeId],
    references: [leisureTypes.id]
  }),
  personalCareType: one(personalCareTypes, {
    fields: [recurringExpenses.personalCareTypeId],
    references: [personalCareTypes.id]
  }),
  shop: one(shops, {
    fields: [recurringExpenses.shopId],
    references: [shops.id]
  }),
  startPlace: one(places, {
    fields: [recurringExpenses.startPlaceId],
    references: [places.id],
    relationName: "recurring_start_place_relation"
  }),
  endPlace: one(places, {
    fields: [recurringExpenses.endPlaceId],
    references: [places.id],
    relationName: "recurring_end_place_relation"
  }),
  healthType: one(healthTypes, {
    fields: [recurringExpenses.healthTypeId],
    references: [healthTypes.id]
  }),
  familyMember: one(familyMembers, {
    fields: [recurringExpenses.familyMemberId],
    references: [familyMembers.id]
  }),
  charityType: one(charityTypes, {
    fields: [recurringExpenses.charityTypeId],
    references: [charityTypes.id]
  }),
  occurrences: many(expenses)
}));
var occasionalGroupsRelations = relations(
  occasionalGroups,
  ({ many }) => ({
    expenses: many(expenses),
    recurringExpenses: many(recurringExpenses)
    // NÃO MUDAR: Sem {} aqui
  })
);
var fixedExpenseTypesRelations = relations(fixedExpenseTypes, ({ many }) => ({
  expenses: many(expenses),
  recurringExpenses: many(recurringExpenses)
  // NÃO MUDAR: Sem {} aqui
}));
var supermarketsRelations = relations(supermarkets, ({ many }) => ({
  expenses: many(expenses),
  recurringExpenses: many(recurringExpenses)
  // NÃO MUDAR: Sem {} aqui
}));
var restaurantsRelations = relations(restaurants, ({ many }) => ({
  expenses: many(expenses),
  recurringExpenses: many(recurringExpenses)
  // NÃO MUDAR: Sem {} aqui
}));
var serviceTypesRelations = relations(serviceTypes, ({ many }) => ({
  expenses: many(expenses),
  recurringExpenses: many(recurringExpenses)
  // NÃO MUDAR: Sem {} aqui
}));
var studyTypesRelations = relations(studyTypes, ({ many }) => ({
  expenses: many(expenses),
  recurringExpenses: many(recurringExpenses)
  // NÃO MUDAR: Sem {} aqui
}));
var leisureTypesRelations = relations(leisureTypes, ({ many }) => ({
  expenses: many(expenses),
  recurringExpenses: many(recurringExpenses)
  // NÃO MUDAR: Sem {} aqui
}));
var personalCareTypesRelations = relations(
  personalCareTypes,
  ({ many }) => ({
    expenses: many(expenses),
    recurringExpenses: many(recurringExpenses)
    // NÃO MUDAR: Sem {} aqui
  })
);
var shopsRelations = relations(shops, ({ many }) => ({
  expenses: many(expenses),
  recurringExpenses: many(recurringExpenses)
  // NÃO MUDAR: Sem {} aqui
}));
var placesRelations = relations(places, ({ many }) => ({
  expensesStart: many(expenses, { relationName: "start_place_relation" }),
  expensesEnd: many(expenses, { relationName: "end_place_relation" }),
  recurringExpensesStart: many(recurringExpenses, { relationName: "recurring_start_place_relation" }),
  recurringExpensesEnd: many(recurringExpenses, { relationName: "recurring_end_place_relation" })
}));
var healthTypesRelations = relations(healthTypes, ({ many }) => ({
  expenses: many(expenses),
  recurringExpenses: many(recurringExpenses)
  // NÃO MUDAR: Sem {} aqui
}));
var familyMembersRelations = relations(familyMembers, ({ many }) => ({
  expenses: many(expenses),
  recurringExpenses: many(recurringExpenses)
  // NÃO MUDAR: Sem {} aqui
}));
var charityTypesRelations = relations(charityTypes, ({ many }) => ({
  expenses: many(expenses),
  recurringExpenses: many(recurringExpenses)
  // NÃO MUDAR: Sem {} aqui
}));
var financialYearsRelations = relations(financialYears, ({ many }) => ({
  monthlyGoals: many(monthlyGoals)
}));
var monthlyGoalsRelations = relations(monthlyGoals, ({ one }) => ({
  financialYear: one(financialYears, {
    fields: [monthlyGoals.financialYearId],
    references: [financialYears.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true
});
var insertOccasionalGroupSchema = createInsertSchema(
  occasionalGroups
).omit({
  id: true,
  createdAt: true
}).extend({
  iconName: z.string().nullable().optional(),
  openingDate: z.string().datetime("Data de abertura inv\xE1lida.").transform((str) => new Date(str)),
  closingDate: z.string().datetime("Data de fechamento inv\xE1lida.").nullable().optional().transform((str) => str ? new Date(str) : null)
});
var insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true
}).extend({
  purchaseDate: z.string().transform((str) => new Date(str)),
  recurringExpenseId: z.number().int().nullable().optional(),
  // Incluído aqui
  paymentStatus: z.enum(paymentStatusEnum.enumValues).optional(),
  // Ou z.enum(["paid", "pending"]).optional()
  installmentNumber: z.number().int().nullable().optional()
  // Incluído aqui
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
var insertStudyTypeSchema = createInsertSchema(studyTypes).omit({
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
var insertFinancialYearSchema = createInsertSchema(financialYears).omit({
  id: true,
  createdAt: true
});
var insertMonthlyGoalSchema = createInsertSchema(monthlyGoals).omit({
  id: true,
  financialYearId: true
  // financialYearId será adicionado via código, não diretamente do formulário
});
var insertRecurringExpenseSchema = createInsertSchema(recurringExpenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  nextOccurrenceDate: true,
  installmentsPaid: true,
  // Omitir installmentsPaid na inserção
  installmentsTrulyPaid: true
  // Omitir installmentsTrulyPaid na inserção
}).extend({
  // Estes campos são adicionados ou sobrescritos com transformações
  startDate: z.string().transform((str) => new Date(str)),
  installmentsTotal: z.preprocess(
    (val) => {
      if (val === "" || val === void 0 || val === null) return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    },
    z.number().int().nullable().optional()
  ).superRefine((val, ctx) => {
    if (val !== null && val !== void 0 && val <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "O n\xFAmero de parcelas deve ser pelo menos 1.",
        path: ctx.path
      });
    }
  }),
  // NOVO: Adicionar recurrenceType ao extend para garantir que esteja no tipo de 'data' do superRefine
  recurrenceType: z.enum(recurrenceTypeEnum.enumValues)
});
insertRecurringExpenseSchema.superRefine((data, ctx) => {
  const fullData = data;
  if (fullData.recurrenceType === "determined") {
    if (fullData.installmentsTotal === void 0 || fullData.installmentsTotal === null || fullData.installmentsTotal <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "N\xFAmero total de parcelas \xE9 obrigat\xF3rio e deve ser um n\xFAmero positivo para recorr\xEAncia determinada.",
        path: ["installmentsTotal"]
      });
    }
  } else {
    if (fullData.installmentsTotal !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "N\xFAmero de parcelas n\xE3o deve ser definido para recorr\xEAncias indeterminadas ou pausadas.",
        path: ["installmentsTotal"]
      });
    }
  }
});

// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, sql, desc, and, gte, lte, or } from "drizzle-orm";

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

// server/storage.ts
import { format } from "date-fns";
var DatabaseStorage = class {
  // CREATE EXPENSE: Insere uma nova despesa no banco de dados
  async createExpense(insertExpense) {
    const finalExpenseData = {
      ...insertExpense,
      paymentStatus: insertExpense.paymentStatus || "paid"
    };
    const [expense] = await db.insert(expenses).values(finalExpenseData).returning();
    return expense;
  }
  // GET EXPENSES BASE QUERY: Retorna a consulta base para despesas com JOINs
  getExpensesBaseQuery() {
    const startPlaceAlias = alias(places, "start_places");
    const endPlaceAlias = alias(places, "end_places");
    const recurringStartPlaceAlias = alias(places, "recurring_start_places");
    const recurringEndPlaceAlias = alias(places, "recurring_end_places");
    const reFixedExpenseTypeAlias = alias(fixedExpenseTypes, "re_fixed_type");
    const reSupermarketAlias = alias(supermarkets, "re_supermarket");
    const reRestaurantAlias = alias(restaurants, "re_restaurant");
    const reServiceTypeAlias = alias(serviceTypes, "re_service_type");
    const reStudyTypeAlias = alias(studyTypes, "re_study_type");
    const reLeisureTypeAlias = alias(leisureTypes, "re_leisure_type");
    const rePersonalCareTypeAlias = alias(personalCareTypes, "re_personal_care_type");
    const reShopAlias = alias(shops, "re_shop");
    const reHealthTypeAlias = alias(healthTypes, "re_health_type");
    const reFamilyMemberAlias = alias(familyMembers, "re_family_member");
    const reCharityTypeAlias = alias(charityTypes, "re_charity_type");
    return db.select({
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
      recurringExpenseInstallmentsPaid: recurringExpenses.installmentsPaid,
      // GERADAS
      recurringExpenseInstallmentsTrulyPaid: recurringExpenses.installmentsTrulyPaid,
      // NOVO: REALMENTE PAGAS
      recurringExpenseStartDate: recurringExpenses.startDate,
      recurringExpenseNextOccurrenceDate: recurringExpenses.nextOccurrenceDate,
      // Incluir detalhes das subcategorias do recurringExpense:
      recurringRoutineCategory: recurringExpenses.routineCategory,
      // A categoria de rotina do recorrente
      recurringFixedExpenseTypeId: recurringExpenses.fixedExpenseTypeId,
      recurringFixedExpenseTypeName: reFixedExpenseTypeAlias.name,
      // Nome do tipo fixo da recorrência
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
      recurringStartPlaceName: recurringStartPlaceAlias.name,
      // Nome do lugar de partida da recorrência
      recurringEndPlaceName: recurringEndPlaceAlias.name,
      // Nome do lugar de destino da recorrência
      recurringHealthTypeId: recurringExpenses.healthTypeId,
      recurringHealthTypeName: reHealthTypeAlias.name,
      recurringHealthDescription: recurringExpenses.healthDescription,
      recurringFamilyMemberId: recurringExpenses.familyMemberId,
      recurringFamilyMemberName: reFamilyMemberAlias.name,
      recurringFamilyDescription: recurringExpenses.familyDescription,
      recurringCharityTypeId: recurringExpenses.charityTypeId,
      recurringCharityTypeName: reCharityTypeAlias.name,
      recurringCharityDescription: recurringExpenses.charityDescription
    }).from(expenses).leftJoin(fixedExpenseTypes, eq(expenses.fixedExpenseTypeId, fixedExpenseTypes.id)).leftJoin(supermarkets, eq(expenses.supermarketId, supermarkets.id)).leftJoin(restaurants, eq(expenses.restaurantId, restaurants.id)).leftJoin(serviceTypes, eq(expenses.serviceTypeId, serviceTypes.id)).leftJoin(studyTypes, eq(expenses.studyTypeId, studyTypes.id)).leftJoin(leisureTypes, eq(expenses.leisureTypeId, leisureTypes.id)).leftJoin(personalCareTypes, eq(expenses.personalCareTypeId, personalCareTypes.id)).leftJoin(shops, eq(expenses.shopId, shops.id)).leftJoin(healthTypes, eq(expenses.healthTypeId, healthTypes.id)).leftJoin(familyMembers, eq(expenses.familyMemberId, familyMembers.id)).leftJoin(charityTypes, eq(expenses.charityTypeId, charityTypes.id)).leftJoin(startPlaceAlias, eq(expenses.startPlaceId, startPlaceAlias.id)).leftJoin(endPlaceAlias, eq(expenses.endPlaceId, endPlaceAlias.id)).leftJoin(occasionalGroups, eq(expenses.occasionalGroupId, occasionalGroups.id)).leftJoin(recurringExpenses, eq(expenses.recurringExpenseId, recurringExpenses.id)).leftJoin(reFixedExpenseTypeAlias, eq(recurringExpenses.fixedExpenseTypeId, reFixedExpenseTypeAlias.id)).leftJoin(reSupermarketAlias, eq(recurringExpenses.supermarketId, reSupermarketAlias.id)).leftJoin(reRestaurantAlias, eq(recurringExpenses.restaurantId, reRestaurantAlias.id)).leftJoin(reServiceTypeAlias, eq(recurringExpenses.serviceTypeId, reServiceTypeAlias.id)).leftJoin(reStudyTypeAlias, eq(recurringExpenses.studyTypeId, reStudyTypeAlias.id)).leftJoin(reLeisureTypeAlias, eq(recurringExpenses.leisureTypeId, reLeisureTypeAlias.id)).leftJoin(rePersonalCareTypeAlias, eq(recurringExpenses.personalCareTypeId, rePersonalCareTypeAlias.id)).leftJoin(reShopAlias, eq(recurringExpenses.shopId, reShopAlias.id)).leftJoin(reHealthTypeAlias, eq(recurringExpenses.healthTypeId, reHealthTypeAlias.id)).leftJoin(reFamilyMemberAlias, eq(recurringExpenses.familyMemberId, reFamilyMemberAlias.id)).leftJoin(reCharityTypeAlias, eq(recurringExpenses.charityTypeId, reCharityTypeAlias.id)).leftJoin(recurringStartPlaceAlias, eq(recurringExpenses.startPlaceId, recurringStartPlaceAlias.id)).leftJoin(recurringEndPlaceAlias, eq(recurringExpenses.endPlaceId, recurringEndPlaceAlias.id));
  }
  // MAP EXPENSE RESULT: Mapeia os resultados da consulta para o formato esperado pelo frontend
  mapExpenseResult(result) {
    return result.map((expense) => {
      let displayName = "N/A";
      let categoryType = expense.routineCategory || "occasional";
      if (expense.recurringExpenseId && expense.recurringExpenseName) {
        displayName = expense.recurringExpenseName;
        categoryType = expense.recurringRoutineCategory || "occasional";
      } else if (expense.expenseType === "occasional") {
        displayName = expense.occasionalGroupName || expense.occasionalGroupDescription || "Grupo Ocasional";
      } else {
        switch (expense.routineCategory) {
          //
          case "fixed":
            displayName = expense.fixedExpenseTypeName || "Despesa Fixa (Tipo n\xE3o especificado)";
            break;
          case "supermarket":
            displayName = expense.supermarketName || "Supermercado";
            break;
          case "food":
            displayName = expense.restaurantName || "Alimenta\xE7\xE3o";
            break;
          case "services":
            displayName = expense.serviceTypeName || expense.serviceDescription || "Servi\xE7os";
            break;
          case "study":
            displayName = expense.studyTypeName || expense.studyDescription || "Estudos";
            break;
          case "leisure":
            displayName = expense.leisureTypeName || expense.leisureDescription || "Lazer";
            break;
          case "personal-care":
            displayName = expense.personalCareTypeName || expense.personalCareDescription || "Cuidado Pessoal";
            break;
          case "shopping":
            displayName = expense.shopName || "Compras";
            break;
          case "transportation":
            if (expense.startPlaceName && expense.endPlaceName) {
              displayName = `${expense.startPlaceName} -> ${expense.endPlaceName}`;
            } else {
              displayName = expense.transportDescription || expense.transportMode || "Transporte";
            }
            break;
          case "health":
            displayName = expense.healthTypeName || "Sa\xFAde";
            break;
          case "family":
            displayName = expense.familyMemberName || "Fam\xEDlia";
            break;
          case "charity":
            displayName = expense.charityTypeName || "Caridade";
            break;
          default:
            displayName = "Despesa Rotineira";
        }
      }
      return {
        ...expense,
        displayName,
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
        recurringCharityDescription: expense.recurringCharityDescription
      };
    });
  }
  // FUNÇÕES ASSÍNCRONAS PARA RETORNOS DAS DESPESAS
  //---------------------------------------------------------------------------------------------
  // GET EXPENSES: Retorna todas as despesas ordenadas pela data de compra
  async getExpenses() {
    try {
      const result = await this.getExpensesBaseQuery().where(eq(expenses.paymentStatus, "paid")).orderBy(desc(expenses.purchaseDate));
      return this.mapExpenseResult(result);
    } catch (error) {
      console.error("Error in getExpenses:", error);
      throw error;
    }
  }
  // GET EXPENSES BY MONTH: Retorna as despesas de um mês específico
  async getExpensesByMonth(year, month) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      const result = await this.getExpensesBaseQuery().where(and(
        gte(expenses.purchaseDate, startDate),
        lte(expenses.purchaseDate, endDate),
        eq(expenses.paymentStatus, "paid")
        // Filtrar por status pago
      )).orderBy(desc(expenses.purchaseDate));
      return this.mapExpenseResult(result);
    } catch (error) {
      console.error("Error in getExpensesByMonth:", error);
      throw error;
    }
  }
  // GET EXPENSES BY YEAR: Retorna as despesas de um ano específico
  async getExpensesByYear(year) {
    try {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      const result = await this.getExpensesBaseQuery().where(and(
        gte(expenses.purchaseDate, startDate),
        lte(expenses.purchaseDate, endDate),
        eq(expenses.paymentStatus, "paid")
        // Filtrar por status pago
      )).orderBy(desc(expenses.purchaseDate));
      return this.mapExpenseResult(result);
    } catch (error) {
      console.error("Error in getExpensesByYear:", error);
      throw error;
    }
  }
  // GET RECENT EXPENSES: Retorna as despesas mais recentes
  async getRecentExpenses(limit = 10) {
    try {
      const result = await this.getExpensesBaseQuery().where(eq(expenses.paymentStatus, "paid")).orderBy(desc(expenses.purchaseDate)).limit(limit);
      return this.mapExpenseResult(result);
    } catch (error) {
      console.error("Error in getRecentExpenses:", error);
      throw error;
    }
  }
  // DELETE EXPENSE: Exclui uma despesa do banco de dados
  async deleteExpense(id) {
    const [deletedExpense] = await db.delete(expenses).where(eq(expenses.id, id)).returning();
    return deletedExpense || null;
  }
  // UPDATE EXPENSE: Atualiza uma despesa no banco de dados
  async updateExpense(id, insertExpense) {
    console.log("Storage: updateExpense - purchaseDate type:", typeof insertExpense.purchaseDate, "value:", insertExpense.purchaseDate);
    const [updatedExpense] = await db.update(expenses).set(insertExpense).where(eq(expenses.id, id)).returning();
    return updatedExpense || null;
  }
  // MARK ESPENSE AS PAID: Marcar uma despesa como paga
  async markExpenseAsPaid(id) {
    return await db.transaction(async (tx) => {
      const [updatedExpense] = await tx.update(expenses).set({ paymentStatus: "paid" }).where(eq(expenses.id, id)).returning();
      if (!updatedExpense) {
        return null;
      }
      if (updatedExpense.recurringExpenseId) {
        await tx.update(recurringExpenses).set({
          installmentsTrulyPaid: sql`${recurringExpenses.installmentsTrulyPaid} + 1`,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(recurringExpenses.id, updatedExpense.recurringExpenseId));
        const latestRecurringExp = (await tx.select().from(recurringExpenses).where(eq(recurringExpenses.id, updatedExpense.recurringExpenseId)))[0];
      }
      return updatedExpense;
    });
  }
  // Obter todas as ocorrências de gastos recorrentes (pendentes e pagas)
  async getGeneratedRecurringExpenses(year, month) {
    try {
      let initialQuery = this.getExpensesBaseQuery();
      const conditions = [];
      conditions.push(sql`${expenses.recurringExpenseId} IS NOT NULL`);
      if (year) {
        let startDate;
        let endDate;
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
        log(`[DB] getGeneratedRecurringExpenses: Sem filtro de ano/mes. Retornando todas as ocorrencias geradas.`);
      }
      const finalQuery = initialQuery.where(and(...conditions));
      const result = await finalQuery.orderBy(desc(expenses.purchaseDate));
      return this.mapExpenseResult(result);
    } catch (error) {
      console.error("Error in getGeneratedRecurringExpenses:", error);
      throw error;
    }
  }
  // GET MONTHLY STATS: Retorna as estatísticas mensais
  async getMonthlyStats() {
    try {
      const currentDate = /* @__PURE__ */ new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const monthlyExpenses = await this.getExpensesByMonth(currentYear, currentMonth);
      const yearlyExpenses = await this.getExpensesByYear(currentYear);
      const monthlyTotal = monthlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      const yearlyTotal = yearlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      const averageMonthly = yearlyTotal / currentMonth;
      const categoriesCount = new Set(yearlyExpenses.map((exp) => exp.routineCategory || "occasional")).size;
      return {
        monthlyTotal,
        //
        yearlyTotal,
        //
        averageMonthly,
        //
        categoriesCount
        //
      };
    } catch (error) {
      console.error("Error in getMonthlyStats:", error);
      throw error;
    }
  }
  // GET ANNUAL STATS: Retorna as estatísticas anuais
  async getAnnualStats(year) {
    try {
      const yearlyExpenses = await this.getExpensesByYear(year);
      const total = yearlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      const avgMonthly = total / 12;
      const categoryTotals = {};
      yearlyExpenses.forEach((expense) => {
        const category = expense.routineCategory || "occasional";
        categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount);
      });
      const topCategory = (
        //
        Object.keys(categoryTotals).length > 0 ? Object.entries(categoryTotals).reduce((a, b) => categoryTotals[a[0]] > categoryTotals[b[0]] ? a : b)[0] : "none"
      );
      return {
        total,
        //
        avgMonthly,
        //
        topCategory,
        //
        categoryTotals
        //
      };
    } catch (error) {
      console.error("Error in getAnnualStats:", error);
      throw error;
    }
  }
  // GET CATEGORY BREAKDOWN: Retorna o desdobramento de categorias
  async getCategoryBreakdown(year, month) {
    try {
      const expenseList = month ? await this.getExpensesByMonth(year, month) : await this.getExpensesByYear(year);
      const categoryTotals = {};
      expenseList.forEach((expense) => {
        const category = expense.routineCategory || "occasional";
        categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount);
      });
      const totalAmount = expenseList.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      return Object.entries(categoryTotals).map(([category, total]) => ({
        //
        category,
        //
        total,
        //
        percentage: totalAmount > 0 ? total / totalAmount * 100 : 0
        //
      }));
    } catch (error) {
      console.error("Error in getCategoryBreakdown:", error);
      throw error;
    }
  }
  //---------------------------------------------------------------------------------------------
  // fim das FUNÇÕES ASYNC PARA RETORNOS DAS DESPESAS
  // FUNÇÕES ASYNC PARA AS DESPESAS OCASIONAIS
  //---------------------------------------------------------------------------------------------
  // CREATE OCCASIONAL GROUP: Insere um novo grupo de despesas ocasionais no banco de dados
  async createOccasionalGroup(insertGroup) {
    const [group] = await db.insert(occasionalGroups).values({
      name: insertGroup.name,
      status: insertGroup.status || "open",
      description: insertGroup.description ?? null,
      iconName: insertGroup.iconName ?? null,
      openingDate: insertGroup.openingDate,
      // Já é um objeto Date
      closingDate: insertGroup.closingDate ?? null
      // Já é um objeto Date ou null
    }).returning();
    return group;
  }
  // GET OCCASIONAL GROUPS: Retorna todos os grupos de despesas ocasionais ordenados pela data de criação
  async getOccasionalGroups() {
    return await db.select({
      id: occasionalGroups.id,
      name: occasionalGroups.name,
      status: occasionalGroups.status,
      createdAt: occasionalGroups.createdAt,
      description: occasionalGroups.description,
      iconName: occasionalGroups.iconName,
      // Incluir iconName
      openingDate: occasionalGroups.openingDate,
      // Incluir openingDate
      closingDate: occasionalGroups.closingDate
      // Incluir closingDate
    }).from(occasionalGroups).orderBy(desc(occasionalGroups.createdAt));
  }
  // GET OPEN OCCASIONAL GROUPS: Retorna todos os grupos de despesas ocasionais abertos ordenados pela data de criação
  async getOpenOccasionalGroups() {
    return await db.select({
      id: occasionalGroups.id,
      name: occasionalGroups.name,
      status: occasionalGroups.status,
      createdAt: occasionalGroups.createdAt,
      description: occasionalGroups.description,
      iconName: occasionalGroups.iconName,
      // Incluir iconName
      openingDate: occasionalGroups.openingDate,
      // Incluir openingDate
      closingDate: occasionalGroups.closingDate
      // Incluir closingDate
    }).from(occasionalGroups).where(eq(occasionalGroups.status, "open")).orderBy(desc(occasionalGroups.createdAt));
  }
  // DELETE OCCASIONAL GROUP: Exclui um grupo de despesas ocasionais do banco de dados
  async deleteOccasionalGroup(id) {
    const [deletedGroup] = await db.delete(occasionalGroups).where(eq(occasionalGroups.id, id)).returning();
    return deletedGroup || null;
  }
  // getExpensesByOccasionalGroupId
  async getExpensesByOccasionalGroupId(groupId) {
    try {
      const result = await this.getExpensesBaseQuery().where(and(
        eq(expenses.occasionalGroupId, groupId),
        eq(expenses.expenseType, "occasional")
        // Certificar que são apenas despesas ocasionais
      )).orderBy(desc(expenses.purchaseDate));
      return this.mapExpenseResult(result);
    } catch (error) {
      console.error(`Error in getExpensesByOccasionalGroupId for group ${groupId}:`, error);
      throw error;
    }
  }
  // UPDATE OCCASIONAL GROUP STATUS: Atualiza o status de um grupo de despesas ocasionais
  async updateOccasionalGroupStatus(id, status, closingDate) {
    const updatePayload = { status };
    if (status === "closed") {
      updatePayload.closingDate = closingDate;
    } else if (status === "open") {
      updatePayload.closingDate = null;
    }
    const [group] = await db.update(occasionalGroups).set(updatePayload).where(eq(occasionalGroups.id, id)).returning();
    return group;
  }
  // UPDATE OCCASIONAL GROUP: Atualiza os dados de um grupo ocasional
  async updateOccasionalGroup(id, groupData) {
    const [updatedGroup] = await db.update(occasionalGroups).set(groupData).where(eq(occasionalGroups.id, id)).returning();
    return updatedGroup || null;
  }
  //---------------------------------------------------------------------------------------------
  // fim das FUNÇÕES ASYNC PARA AS DESPESAS OCASIONAIS
  // FUNÇÕES ASYNC PARA AS DESPESAS ROTINEIRAS
  //---------------------------------------------------------------------------------------------
  // Início das funções de manutenção da subcategoria 'fixed'
  async addFixedExpenseType(insertFixedExpenseType) {
    const [fixedExpenseType] = await db.insert(fixedExpenseTypes).values(insertFixedExpenseType).returning();
    return fixedExpenseType;
  }
  async getFixedExpenseTypes() {
    return await db.select().from(fixedExpenseTypes).orderBy(fixedExpenseTypes.name);
  }
  async deleteFixedExpenseType(id) {
    const [deletedFixedExpenseType] = await db.delete(fixedExpenseTypes).where(eq(fixedExpenseTypes.id, id)).returning();
    return deletedFixedExpenseType || null;
  }
  // Fim das funções de manutenção da subcategoria 'fixed'
  //---------------------------------------------------------------------------------------------
  // Início das funções de manutenção da subcategoria 'supermarket'
  async addSupermarket(insertSupermarket) {
    const [supermarket] = await db.insert(supermarkets).values(insertSupermarket).returning();
    return supermarket;
  }
  async getSupermarkets() {
    return await db.select().from(supermarkets).orderBy(supermarkets.name);
  }
  async deleteSupermarket(id) {
    const [deletedSupermarket] = await db.delete(supermarkets).where(eq(supermarkets.id, id)).returning();
    return deletedSupermarket || null;
  }
  // Fim das funções de manutenção da subcategoria 'supermarket'
  //---------------------------------------------------------------------------------------------
  // Início das funções de manutenção da subcategoria 'food'
  async addRestaurant(insertRestaurant) {
    const [restaurant] = await db.insert(restaurants).values(insertRestaurant).returning();
    return restaurant;
  }
  async getRestaurants() {
    return await db.select().from(restaurants).orderBy(restaurants.name);
  }
  async deleteRestaurant(id) {
    const [deletedRestaurant] = await db.delete(restaurants).where(eq(restaurants.id, id)).returning();
    return deletedRestaurant || null;
  }
  // Fim das funções de manutenção da subcategoria 'food'
  //---------------------------------------------------------------------------------------------
  // Início das funções de manutenção da subcategoria 'services'
  async addServiceType(insertServiceType) {
    const [serviceType] = await db.insert(serviceTypes).values(insertServiceType).returning();
    return serviceType;
  }
  async getServiceTypes() {
    return await db.select().from(serviceTypes).orderBy(serviceTypes.name);
  }
  async deleteServiceType(id) {
    const [deletedServiceType] = await db.delete(serviceTypes).where(eq(serviceTypes.id, id)).returning();
    return deletedServiceType || null;
  }
  // Fim das funções de manutenção da subcategoria 'services'
  //---------------------------------------------------------------------------------------------
  // Início das funções de manutenção da subcategoria 'study'
  async addStudyType(insertStudyType) {
    const [studyType] = await db.insert(studyTypes).values(insertStudyType).returning();
    return studyType;
  }
  async getStudyTypes() {
    return await db.select().from(studyTypes).orderBy(studyTypes.name);
  }
  async deleteStudyType(id) {
    const [deletedStudyType] = await db.delete(studyTypes).where(eq(studyTypes.id, id)).returning();
    return deletedStudyType || null;
  }
  // Fim das funções de manutenção da subcategoria 'services'
  //---------------------------------------------------------------------------------------------
  // Início das funções de manutenção da subcategoria 'leisure'
  async addLeisureType(insertLeisureType) {
    const [leisureType] = await db.insert(leisureTypes).values(insertLeisureType).returning();
    return leisureType;
  }
  async getLeisureTypes() {
    return await db.select().from(leisureTypes).orderBy(leisureTypes.name);
  }
  async deleteLeisureType(id) {
    const [deletedLeisureType] = await db.delete(leisureTypes).where(eq(leisureTypes.id, id)).returning();
    return deletedLeisureType || null;
  }
  // Fim das funções de manutenção da subcategoria 'leisure'
  //---------------------------------------------------------------------------------------------
  // Início das funções de manutenção da subcategoria 'personal-care'
  async addPersonalCareType(insertPersonalCareType) {
    const [personalCareType] = await db.insert(personalCareTypes).values(insertPersonalCareType).returning();
    return personalCareType;
  }
  async getPersonalCareTypes() {
    return await db.select().from(personalCareTypes).orderBy(personalCareTypes.name);
  }
  async deletePersonalCareType(id) {
    const [deletedPersonalCareType] = await db.delete(personalCareTypes).where(eq(personalCareTypes.id, id)).returning();
    return deletedPersonalCareType || null;
  }
  // Fim das funções de manutenção da subcategoria 'personal-care'
  //------------------------------------------------------------------------------------
  // Início das funções de manutenção da subcategoria 'shopping'
  async addShop(insertShop) {
    const [shop] = await db.insert(shops).values(insertShop).returning();
    return shop;
  }
  async getShops() {
    return await db.select().from(shops).orderBy(shops.name);
  }
  async deleteShop(id) {
    const [deletedShop] = await db.delete(shops).where(eq(shops.id, id)).returning();
    return deletedShop || null;
  }
  // Fim das funções de manutenção da subcategoria 'shopping'
  //------------------------------------------------------------------------------------
  // Início das funções de manutenção da subcategoria 'transportation'
  async addPlace(insertPlace) {
    const [place] = await db.insert(places).values(insertPlace).returning();
    return place;
  }
  async getPlaces() {
    return await db.select().from(places).orderBy(places.name);
  }
  async deletePlace(id) {
    const [deletedPlace] = await db.delete(places).where(eq(places.id, id)).returning();
    return deletedPlace || null;
  }
  // Fim das funções de manutenção da subcategoria 'transportation'
  //------------------------------------------------------------------------------------
  // Início das funções de manutenção da subcategoria 'health'
  async addHealthType(insertHealthType) {
    const [healthType] = await db.insert(healthTypes).values(insertHealthType).returning();
    return healthType;
  }
  async getHealthTypes() {
    return await db.select().from(healthTypes).orderBy(healthTypes.name);
  }
  async deleteHealthType(id) {
    const [deletedHealthType] = await db.delete(healthTypes).where(eq(healthTypes.id, id)).returning();
    return deletedHealthType || null;
  }
  // Fim das funções de manutenção da subcategoria 'health'
  //------------------------------------------------------------------------------------
  // Início das funções de manutenção da subcategoria 'family'
  async addFamilyMember(insertFamilyMember) {
    const [familyMember] = await db.insert(familyMembers).values(insertFamilyMember).returning();
    return familyMember;
  }
  async getFamilyMembers() {
    return await db.select().from(familyMembers).orderBy(familyMembers.name);
  }
  async deleteFamilyMember(id) {
    const [deletedFamilyMember] = await db.delete(familyMembers).where(eq(familyMembers.id, id)).returning();
    return deletedFamilyMember || null;
  }
  // Fim das funções de manutenção da subcategoria 'family'
  //------------------------------------------------------------------------------------
  // Início das funções de manutenção da subcategoria 'charity'
  async addCharityType(insertCharityType) {
    const [charityType] = await db.insert(charityTypes).values(insertCharityType).returning();
    return charityType;
  }
  async getCharityTypes() {
    return await db.select().from(charityTypes).orderBy(charityTypes.name);
  }
  async deleteCharityType(id) {
    const [deletedCharityType] = await db.delete(charityTypes).where(eq(charityTypes.id, id)).returning();
    return deletedCharityType || null;
  }
  //------------------------------------------------------------------------------------
  // fim das FUNÇÕES ASYNC PARA AS DESPESAS ROTINEIRAS
  // NOVOS MÉTODOS PARA ANOS FINANCEIROS E METAS
  async createFinancialYear(yearData, goalsData) {
    return await db.transaction(async (tx) => {
      const [newYear] = await tx.insert(financialYears).values(yearData).returning();
      if (goalsData && goalsData.length > 0 && newYear) {
        const goalsToInsert = goalsData.map((goal) => ({
          //
          ...goal,
          //
          financialYearId: newYear.id
          //
        }));
        await tx.insert(monthlyGoals).values(goalsToInsert);
      }
      return newYear;
    });
  }
  async getFinancialYears() {
    return await db.query.financialYears.findMany({
      //
      with: {
        //
        monthlyGoals: true
        //
      }
    });
  }
  async getFinancialYearDetails(id) {
    const yearDetails = await db.query.financialYears.findFirst({
      //
      where: eq(financialYears.id, id),
      //
      with: {
        //
        monthlyGoals: true
        //
      }
    });
    return yearDetails || null;
  }
  async updateFinancialYear(id, yearData, goalsData) {
    return await db.transaction(async (tx) => {
      const [updatedYear] = await tx.update(financialYears).set(yearData).where(eq(financialYears.id, id)).returning();
      if (!updatedYear) {
        return null;
      }
      await tx.delete(monthlyGoals).where(eq(monthlyGoals.financialYearId, id));
      if (goalsData && goalsData.length > 0) {
        const goalsToInsert = goalsData.map((goal) => ({
          //
          ...goal,
          //
          financialYearId: updatedYear.id
          //
        }));
        await tx.insert(monthlyGoals).values(goalsToInsert);
      }
      const fullUpdatedYear = await tx.query.financialYears.findFirst({
        where: eq(financialYears.id, id),
        with: {
          monthlyGoals: true
        }
      });
      return fullUpdatedYear || null;
    });
  }
  async deleteFinancialYear(id) {
    const [deletedYear] = await db.delete(financialYears).where(eq(financialYears.id, id)).returning();
    return deletedYear || null;
  }
  // MÉTODO NOVO/CORRIGIDO: Retorna o sumário mensal de gastos para um ano específico
  async getMonthlySummaryByYear(year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    const result = await db.select({
      month: sql`EXTRACT(MONTH FROM ${expenses.purchaseDate})`.as("month"),
      total: sql`SUM(CAST(${expenses.amount} AS REAL))`.as("total")
    }).from(expenses).where(and(
      gte(expenses.purchaseDate, startDate),
      lte(expenses.purchaseDate, endDate),
      eq(expenses.paymentStatus, "paid")
    )).groupBy(sql`month`).orderBy(sql`month`);
    return result.map((row) => ({
      month: Number(row.month),
      total: row.total || 0
    }));
  }
  // Retorna os gastos mensais por categoria para um ano específico
  async getMonthlyExpensesBreakdownByYear(year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    const result = await db.select({
      month: sql`EXTRACT(MONTH FROM ${expenses.purchaseDate})`.as("month"),
      category: sql`
          CASE
            WHEN ${expenses.expenseType} = 'occasional' THEN 'occasional'
            ELSE ${expenses.routineCategory}::text
          END
        `.as("category"),
      amount: sql`SUM(CAST(${expenses.amount} AS REAL))`.as("total")
    }).from(expenses).where(and(
      gte(expenses.purchaseDate, startDate),
      lte(expenses.purchaseDate, endDate),
      eq(expenses.paymentStatus, "paid")
    )).groupBy(sql`
          EXTRACT(MONTH FROM ${expenses.purchaseDate}),
          CASE
            WHEN ${expenses.expenseType} = 'occasional' THEN 'occasional'
            ELSE ${expenses.routineCategory}::text
          END
      `).orderBy(sql`month`, sql`category`);
    return result.map((row) => ({
      month: Number(row.month),
      category: row.category || "outros",
      total: row.amount || 0
    }));
  }
  // NOVOS MÉTODOS PARA GASTOS RECORRENTES
  //---------------------------------------------------------------------------------------------
  // CREATE RECURRING EXPENSE: Insere um novo gasto recorrente
  async createRecurringExpense(insertRecurringExpense) {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const initialNextOccurrenceDate = new Date(insertRecurringExpense.startDate);
    initialNextOccurrenceDate.setHours(0, 0, 0, 0);
    const [recurringExpense] = await db.insert(recurringExpenses).values({
      ...insertRecurringExpense,
      // Para determined, installmentsTotal é o valor. Para undetermined/paused, é null.
      installmentsTotal: insertRecurringExpense.recurrenceType === "determined" ? insertRecurringExpense.installmentsTotal : null,
      installmentsPaid: 0,
      // installmentsPaid = parcelas *geradas*
      installmentsTrulyPaid: 0,
      // installmentsTrulyPaid = parcelas *pagas*
      startDate: initialNextOccurrenceDate,
      nextOccurrenceDate: initialNextOccurrenceDate,
      // Próxima data para geração (pode ser o próprio mês de início)
      createdAt: today,
      updatedAt: today
    }).returning();
    if (!recurringExpense) {
      throw new Error("Failed to create recurring expense.");
    }
    if (recurringExpense.recurrenceType === "determined" || recurringExpense.recurrenceType === "undetermined") {
      log(`[GERACAO] Recorrencia '${recurringExpense.name}' (ID: ${recurringExpense.id}) criada. Verificando geracao de parcelas iniciais.`);
      let currentMonthPointer = new Date(recurringExpense.startDate.getFullYear(), recurringExpense.startDate.getMonth(), 1);
      currentMonthPointer.setHours(0, 0, 0, 0);
      let lastMonthToGenerate = new Date(today.getFullYear(), 11, 1);
      if (recurringExpense.recurrenceType === "determined" && recurringExpense.installmentsTotal !== null) {
        const limitMonth = new Date(recurringExpense.startDate.getFullYear(), recurringExpense.startDate.getMonth() + recurringExpense.installmentsTotal - 1, 1);
        if (limitMonth.getTime() < lastMonthToGenerate.getTime()) {
          lastMonthToGenerate = limitMonth;
        }
      }
      const futureLimit = new Date(today.getFullYear(), today.getMonth() + 12, 1);
      if (lastMonthToGenerate.getTime() > futureLimit.getTime()) {
        lastMonthToGenerate = futureLimit;
      }
      let expensesGeneratedCount = 0;
      let installmentsPaidCount = 0;
      while (currentMonthPointer.getTime() <= lastMonthToGenerate.getTime() && // Alterado para <=
      (recurringExpense.recurrenceType === "undetermined" || expensesGeneratedCount < (recurringExpense.installmentsTotal || 0))) {
        const targetMonth = currentMonthPointer.getMonth();
        const targetYear = currentMonthPointer.getFullYear();
        const expensePurchaseDate = new Date(targetYear, targetMonth, 1);
        expensePurchaseDate.setHours(0, 0, 0, 0);
        const existingExpense = await db.select().from(expenses).where(and(
          eq(expenses.recurringExpenseId, recurringExpense.id),
          gte(expenses.purchaseDate, new Date(targetYear, targetMonth, 1)),
          lte(expenses.purchaseDate, new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999))
        )).limit(1);
        if (existingExpense.length === 0) {
          log(`[GERACAO] Gerando ocorrencia para '${recurringExpense.name}' (ID: ${recurringExpense.id}) para ${format(currentMonthPointer, "MM/yyyy")}`);
          let installmentNumber = null;
          if (recurringExpense.recurrenceType === "determined" && recurringExpense.startDate) {
            const startOfMonthRecurring = new Date(recurringExpense.startDate.getFullYear(), recurringExpense.startDate.getMonth(), 1);
            const diffMonths = (expensePurchaseDate.getFullYear() - startOfMonthRecurring.getFullYear()) * 12 + (expensePurchaseDate.getMonth() - startOfMonthRecurring.getMonth());
            installmentNumber = diffMonths + 1;
          }
          const newExpense = {
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
            paymentStatus: "pending",
            // Sempre pendente na geração
            installmentNumber
          };
          await db.insert(expenses).values(newExpense);
          installmentsPaidCount++;
          expensesGeneratedCount++;
        } else {
          log(`[GERACAO] Ocorrencia para '${recurringExpense.name}' em ${format(currentMonthPointer, "MM/yyyy")} ja existe. Pulando.`);
          installmentsPaidCount++;
        }
        currentMonthPointer.setMonth(currentMonthPointer.getMonth() + 1);
      }
      const finalNextOccurrenceDate = new Date(currentMonthPointer.getFullYear(), currentMonthPointer.getMonth(), 1);
      finalNextOccurrenceDate.setHours(0, 0, 0, 0);
      await db.update(recurringExpenses).set({
        installmentsPaid: installmentsPaidCount,
        // Atualiza com o total de parcelas geradas
        nextOccurrenceDate: finalNextOccurrenceDate,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(recurringExpenses.id, recurringExpense.id));
      log(`[GERACAO] Fim da geracao inicial para '${recurringExpense.name}'. Total gerado: ${expensesGeneratedCount}. Installments Paid (geradas): ${installmentsPaidCount}. Next Occ Date set to: ${finalNextOccurrenceDate.toLocaleDateString()}`);
    }
    return recurringExpense;
  }
  // GET RECURRING EXPENSES: Retorna todos os gastos recorrentes
  async getRecurringExpenses() {
    return await db.select().from(recurringExpenses).orderBy(desc(recurringExpenses.createdAt));
  }
  // GET RECURRING EXPENSE BY ID: Retorna um gasto recorrente específico
  async getRecurringExpenseById(id) {
    const [recurringExpense] = await db.select().from(recurringExpenses).where(eq(recurringExpenses.id, id));
    return recurringExpense || null;
  }
  // UPDATE RECURRING EXPENSE: Atualiza um gasto recorrente
  async updateRecurringExpense(id, updateData) {
    return await db.transaction(async (tx) => {
      const oldRecurringExpense = await tx.query.recurringExpenses.findFirst({
        where: eq(recurringExpenses.id, id)
      });
      if (!oldRecurringExpense) {
        return null;
      }
      const [updatedRecurringExpense] = await tx.update(recurringExpenses).set({
        ...updateData,
        // Se o tipo de recorrência não for 'determined', zera installmentsTotal
        installmentsTotal: updateData.recurrenceType !== "determined" ? null : updateData.installmentsTotal,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(recurringExpenses.id, id)).returning();
      if (!updatedRecurringExpense) {
        return null;
      }
      if (oldRecurringExpense.recurrenceType !== updatedRecurringExpense.recurrenceType) {
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        if (updatedRecurringExpense.recurrenceType === "paused") {
          log(`[ATUALIZACAO] Recorrencia '${updatedRecurringExpense.name}' (ID: ${updatedRecurringExpense.id}) alterada para PAUSADA. Deletando futuras ocorrencias pendentes.`);
          await tx.delete(expenses).where(and(
            eq(expenses.recurringExpenseId, updatedRecurringExpense.id),
            eq(expenses.paymentStatus, "pending"),
            gte(expenses.purchaseDate, new Date(today.getFullYear(), today.getMonth(), 1))
            // A partir do início do mês atual
          ));
        } else if (oldRecurringExpense.recurrenceType === "paused" && (updatedRecurringExpense.recurrenceType === "undetermined" || updatedRecurringExpense.recurrenceType === "determined")) {
          log(`[ATUALIZACAO] Recorrencia '${updatedRecurringExpense.name}' (ID: ${updatedRecurringExpense.id}) alterada de PAUSADA para ATIVA. Reagendando geracao.`);
          let newNextOccurrenceDate = new Date(today.getFullYear(), today.getMonth(), 1);
          if (updatedRecurringExpense.startDate && new Date(updatedRecurringExpense.startDate.getFullYear(), updatedRecurringExpense.startDate.getMonth(), 1).getTime() > newNextOccurrenceDate.getTime()) {
            newNextOccurrenceDate = new Date(updatedRecurringExpense.startDate.getFullYear(), updatedRecurringExpense.startDate.getMonth(), 1);
          }
          newNextOccurrenceDate.setHours(0, 0, 0, 0);
          await tx.update(recurringExpenses).set({
            nextOccurrenceDate: newNextOccurrenceDate,
            // Ao reativar, talvez seja interessante reajustar installmentsPaid
            // para o total de parcelas *atuais* geradas.
            // A função generateMonthlyRecurringExpenses já lida com isso.
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(recurringExpenses.id, updatedRecurringExpense.id));
        }
      }
      if (updateData.startDate && oldRecurringExpense.startDate && updateData.startDate.getTime() !== oldRecurringExpense.startDate.getTime()) {
        log(`[ATUALIZACAO] StartDate de '${updatedRecurringExpense.name}' (ID: ${updatedRecurringExpense.id}) foi alterada.`);
        await tx.delete(expenses).where(eq(expenses.recurringExpenseId, updatedRecurringExpense.id));
        await tx.update(recurringExpenses).set({
          installmentsPaid: 0,
          installmentsTrulyPaid: 0,
          nextOccurrenceDate: updatedRecurringExpense.startDate,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(recurringExpenses.id, updatedRecurringExpense.id));
      }
      return updatedRecurringExpense;
    });
  }
  // DELETE RECURRING EXPENSE: Exclui um gasto recorrente
  async deleteRecurringExpense(id) {
    const [deletedRecurringExpense] = await db.delete(recurringExpenses).where(eq(recurringExpenses.id, id)).returning();
    return deletedRecurringExpense || null;
  }
  // GENERATE MONTHLY RECURRING EXPENSES: Gerar despesas mensais recorrentes
  async generateMonthlyRecurringExpenses() {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    log(`[GERACAO] Iniciando processo de geracao para o ciclo atual e proximos meses.`);
    try {
      const activeRecurringExpenses = await db.select().from(recurringExpenses).where(
        or(
          eq(recurringExpenses.recurrenceType, "undetermined"),
          and(
            eq(recurringExpenses.recurrenceType, "determined"),
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
        generationPointerDate.setHours(0, 0, 0, 0);
        let expensesGeneratedInThisCycle = 0;
        const generationHorizon = new Date(today.getFullYear(), today.getMonth() + 12, 1);
        generationHorizon.setHours(0, 0, 0, 0);
        let finalGenerationMonthForDetermined = null;
        if (initialRecurringState.recurrenceType === "determined" && initialRecurringState.installmentsTotal !== null && initialRecurringState.startDate) {
          finalGenerationMonthForDetermined = new Date(initialRecurringState.startDate.getFullYear(), initialRecurringState.startDate.getMonth() + initialRecurringState.installmentsTotal - 1, 1);
          finalGenerationMonthForDetermined.setHours(0, 0, 0, 0);
        }
        while (generationPointerDate.getTime() <= generationHorizon.getTime() && // Alterado para <=
        (initialRecurringState.recurrenceType === "undetermined" || initialRecurringState.recurrenceType === "determined" && initialRecurringState.installmentsPaid + expensesGeneratedInThisCycle < (initialRecurringState.installmentsTotal || 0) && (finalGenerationMonthForDetermined === null || generationPointerDate.getTime() <= finalGenerationMonthForDetermined.getTime()))) {
          log(`[GERACAO] Tentando gerar para '${initialRecurringState.name}' para ${format(generationPointerDate, "MM/yyyy")}`);
          const targetMonth = generationPointerDate.getMonth();
          const targetYear = generationPointerDate.getFullYear();
          const existingExpense = await db.select().from(expenses).where(and(
            eq(expenses.recurringExpenseId, initialRecurringState.id),
            gte(expenses.purchaseDate, new Date(targetYear, targetMonth, 1)),
            lte(expenses.purchaseDate, new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999))
          )).limit(1);
          if (existingExpense.length === 0) {
            log(`[GERACAO] Despesa para '${initialRecurringState.name}' para ${format(generationPointerDate, "MM/yyyy")} sera gerada.`);
            const expensePurchaseDate = new Date(targetYear, targetMonth, 1);
            expensePurchaseDate.setHours(0, 0, 0, 0);
            let installmentNumber = null;
            if (initialRecurringState.recurrenceType === "determined" && initialRecurringState.startDate) {
              const startOfMonthRecurring = new Date(initialRecurringState.startDate.getFullYear(), initialRecurringState.startDate.getMonth(), 1);
              const diffMonths = (expensePurchaseDate.getFullYear() - startOfMonthRecurring.getFullYear()) * 12 + (expensePurchaseDate.getMonth() - startOfMonthRecurring.getMonth());
              installmentNumber = diffMonths + 1;
            }
            const newExpense = {
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
              paymentStatus: "pending",
              // Sempre pendente na geração
              installmentNumber
            };
            await db.insert(expenses).values(newExpense);
            expensesGeneratedInThisCycle++;
          } else {
            log(`[GERACAO] Ocorrencia para '${initialRecurringState.name}' em ${format(generationPointerDate, "MM/yyyy")} ja existe. Pulando.`);
          }
          generationPointerDate.setMonth(generationPointerDate.getMonth() + 1);
        }
        const latestRecurringExpAfterGeneration = (await db.select().from(recurringExpenses).where(eq(recurringExpenses.id, initialRecurringState.id)))[0];
        const updatedInstallmentsPaid = (latestRecurringExpAfterGeneration?.installmentsPaid || 0) + expensesGeneratedInThisCycle;
        const finalNextOccurrenceDate = new Date(generationPointerDate.getFullYear(), generationPointerDate.getMonth(), 1);
        finalNextOccurrenceDate.setHours(0, 0, 0, 0);
        await db.update(recurringExpenses).set({
          installmentsPaid: updatedInstallmentsPaid,
          // Atualiza com o total de parcelas geradas
          nextOccurrenceDate: finalNextOccurrenceDate,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(recurringExpenses.id, initialRecurringState.id));
        log(`[GERACAO] Recorrencia '${initialRecurringState.name}' (ID: ${initialRecurringState.id}) atualizada (final do ciclo). Prox data: ${finalNextOccurrenceDate.toLocaleDateString()}. Total de novas parcelas geradas neste ciclo: ${expensesGeneratedInThisCycle}.`);
      }
      log(`[GERACAO] Processo de geracao finalizado.`);
    } catch (error) {
      console.error("[GERACAO] ERRO CATASTROFICO NA FUNCAO DE GERACAO:", error);
      throw error;
    }
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z as z2 } from "zod";
function handleZodError(res, error) {
  if (error instanceof z2.ZodError) {
    console.error("Zod Validation Error:", error.issues);
    return res.status(400).json({ errors: error.issues });
  }
  console.error("Unexpected validation error:", error);
  return res.status(400).json({ error: "Invalid data provided" });
}
function handleServerError(res, error, message) {
  console.error(`Server error - ${message}:`, error);
  res.status(500).json({ error: message });
}
async function registerRoutes(app2) {
  app2.post("/api/expenses", async (req, res) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);
      if (expenseData.purchaseDate) {
        expenseData.purchaseDate = new Date(expenseData.purchaseDate);
      }
      const created = await storage.createExpense(expenseData);
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
      handleServerError(res, error, "Failed to fetch expenses");
    }
  });
  app2.get("/api/expenses/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const expenses2 = await storage.getRecentExpenses(limit);
      res.json(expenses2);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch recent expenses");
    }
  });
  app2.get("/api/expenses/recurring-occurrences", async (req, res) => {
    try {
      const year = req.query.year ? parseInt(req.query.year) : void 0;
      const month = req.query.month ? parseInt(req.query.month) : void 0;
      if (year && isNaN(year)) {
        return res.status(400).json({ error: "Ano inv\xE1lido." });
      }
      if (month && isNaN(month)) {
        return res.status(400).json({ error: "M\xEAs inv\xE1lido." });
      }
      const occurrences = await storage.getGeneratedRecurringExpenses(year, month);
      res.json(occurrences);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch recurring expense occurrences");
    }
  });
  app2.get("/api/expenses/monthly/:year/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      if (isNaN(year) || isNaN(month)) {
        return res.status(400).json({ error: "Invalid year or month" });
      }
      const expenses2 = await storage.getExpensesByMonth(year, month);
      res.json(expenses2);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch monthly expenses");
    }
  });
  app2.get("/api/expenses/yearly/:year", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      if (isNaN(year)) {
        return res.status(400).json({ error: "Invalid year" });
      }
      const expenses2 = await storage.getExpensesByYear(year);
      res.json(expenses2);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch yearly expenses");
    }
  });
  app2.get("/api/stats/monthly", async (req, res) => {
    try {
      const stats = await storage.getMonthlyStats();
      res.json(stats);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch monthly stats");
    }
  });
  app2.get("/api/stats/annual/:year", async (req, res) => {
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
  app2.get("/api/stats/category-breakdown/:year", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      if (isNaN(year)) {
        return res.status(400).json({ error: "Invalid year" });
      }
      const month = req.query.month ? parseInt(req.query.month) : void 0;
      const breakdown = await storage.getCategoryBreakdown(year, month);
      res.json(breakdown);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch category breakdown");
    }
  });
  app2.delete("/api/expenses/:id", async (req, res) => {
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
  app2.patch("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
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
      if (error instanceof z2.ZodError) {
        console.error("Zod Validation Error for expense update:", error.issues);
        return res.status(400).json({ errors: error.issues });
      }
      handleServerError(res, error, "Failed to update expense due to server error");
    }
  });
  app2.patch("/api/expenses/:id/mark-as-paid", async (req, res) => {
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
  app2.post("/api/occasional-groups", async (req, res) => {
    try {
      const group = insertOccasionalGroupSchema.parse(req.body);
      const created = await storage.createOccasionalGroup(group);
      res.json(created);
    } catch (error) {
      handleZodError(res, error);
    }
  });
  app2.get("/api/occasional-groups", async (req, res) => {
    try {
      const groups = await storage.getOccasionalGroups();
      res.json(groups);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch occasional groups");
    }
  });
  app2.get("/api/occasional-groups/open", async (req, res) => {
    try {
      const groups = await storage.getOpenOccasionalGroups();
      res.json(groups);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch open groups");
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
      if (error instanceof z2.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete occasional group");
    }
  });
  app2.get("/api/occasional-groups/:id/expenses", async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      if (isNaN(groupId)) {
        return res.status(400).json({ error: "Invalid group ID" });
      }
      const expenses2 = await storage.getExpensesByOccasionalGroupId(groupId);
      res.json(expenses2);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch expenses for occasional group");
    }
  });
  app2.patch("/api/occasional-groups/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const updateStatusSchema = z2.object({
        status: z2.enum(["open", "closed"]),
        // Zod transformará a string ISO para Date ou null.
        closingDate: z2.string().datetime("Data de fechamento inv\xE1lida.").nullable().optional().transform((str) => str ? new Date(str) : null)
      });
      const { status, closingDate } = updateStatusSchema.parse(req.body);
      const updated = await storage.updateOccasionalGroupStatus(id, status, closingDate);
      res.json(updated);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to update group status");
    }
  });
  app2.patch("/api/occasional-groups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inv\xE1lido." });
      }
      const partialOccasionalGroupSchema = insertOccasionalGroupSchema.partial();
      const updateData = partialOccasionalGroupSchema.parse(req.body);
      const updatedGroup = await storage.updateOccasionalGroup(id, updateData);
      if (!updatedGroup) {
        return res.status(404).json({ error: "Grupo ocasional n\xE3o encontrado." });
      }
      res.status(200).json({ message: "Grupo ocasional atualizado com sucesso.", updated: updatedGroup });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return handleZodError(res, error);
      }
      const err = error;
      if (err.code === "23505" && err.constraint === "occasional_groups_name_key") {
        return res.status(409).json({ error: "O nome do grupo j\xE1 existe." });
      }
      handleServerError(res, error, "Falha ao atualizar grupo ocasional.");
    }
  });
  app2.post("/api/fixed-expense-types", async (req, res) => {
    try {
      const fixedTypeData = insertFixedExpenseTypeSchema.parse(req.body);
      const newFixedType = await storage.addFixedExpenseType(fixedTypeData);
      res.status(201).json(newFixedType);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to create fixed expense type");
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
      if (error instanceof z2.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete fixed expense type");
    }
  });
  app2.get("/api/fixed-expense-types", async (req, res) => {
    try {
      const fixedTypes = await storage.getFixedExpenseTypes();
      res.json(fixedTypes);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch fixed expense types");
    }
  });
  app2.post("/api/supermarkets", async (req, res) => {
    try {
      const supermarketData = insertSupermarketSchema.parse(req.body);
      const newSupermarket = await storage.addSupermarket(supermarketData);
      res.status(201).json(newSupermarket);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to create supermarket");
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
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete supermarket");
    }
  });
  app2.get("/api/supermarkets", async (req, res) => {
    try {
      const supermarkets2 = await storage.getSupermarkets();
      res.json(supermarkets2);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch supermarkets");
    }
  });
  app2.post("/api/restaurants", async (req, res) => {
    try {
      const restaurant = insertRestaurantSchema.parse(req.body);
      const created = await storage.addRestaurant(restaurant);
      res.json(created);
    } catch (error) {
      handleZodError(res, error);
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
      if (error instanceof z2.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete restaurant");
    }
  });
  app2.get("/api/restaurants", async (req, res) => {
    try {
      const restaurants2 = await storage.getRestaurants();
      res.json(restaurants2);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch restaurants");
    }
  });
  app2.post("/api/service-types", async (req, res) => {
    try {
      const serviceType = insertServiceTypeSchema.parse(req.body);
      const created = await storage.addServiceType(serviceType);
      res.json(created);
    } catch (error) {
      handleZodError(res, error);
    }
  });
  app2.get("/api/service-types", async (req, res) => {
    try {
      const serviceTypes2 = await storage.getServiceTypes();
      res.json(serviceTypes2);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch service types");
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
      if (error instanceof z2.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete service type");
    }
  });
  app2.post("/api/study-types", async (req, res) => {
    try {
      const studyType = insertStudyTypeSchema.parse(req.body);
      const created = await storage.addStudyType(studyType);
      res.json(created);
    } catch (error) {
      handleZodError(res, error);
    }
  });
  app2.get("/api/study-types", async (req, res) => {
    try {
      const studyTypes2 = await storage.getStudyTypes();
      res.json(studyTypes2);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch study types");
    }
  });
  app2.delete("/api/study-types/:id", async (req, res) => {
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
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete study type");
    }
  });
  app2.post("/api/leisure-types", async (req, res) => {
    try {
      const leisureType = insertLeisureTypeSchema.parse(req.body);
      const created = await storage.addLeisureType(leisureType);
      res.json(created);
    } catch (error) {
      handleZodError(res, error);
    }
  });
  app2.get("/api/leisure-types", async (req, res) => {
    try {
      const leisureTypes2 = await storage.getLeisureTypes();
      res.json(leisureTypes2);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch leisure types");
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
      if (error instanceof z2.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete leisure type");
    }
  });
  app2.post("/api/personal-care-types", async (req, res) => {
    try {
      const personalCareType = insertPersonalCareTypeSchema.parse(req.body);
      const created = await storage.addPersonalCareType(personalCareType);
      res.json(created);
    } catch (error) {
      handleZodError(res, error);
    }
  });
  app2.get("/api/personal-care-types", async (req, res) => {
    try {
      const personalCareTypes2 = await storage.getPersonalCareTypes();
      res.json(personalCareTypes2);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch personal care types");
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
      if (error instanceof z2.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete personal care type");
    }
  });
  app2.post("/api/shops", async (req, res) => {
    try {
      const shopData = insertShopSchema.parse(req.body);
      const newShop = await storage.addShop(shopData);
      res.status(201).json(newShop);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to create shop");
    }
  });
  app2.get("/api/shops", async (req, res) => {
    try {
      const shops2 = await storage.getShops();
      res.json(shops2);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch shops");
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
      if (error instanceof z2.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete shop");
    }
  });
  app2.post("/api/places", async (req, res) => {
    try {
      const placeData = insertPlaceSchema.parse(req.body);
      const newPlace = await storage.addPlace(placeData);
      res.status(201).json(newPlace);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to create place");
    }
  });
  app2.get("/api/places", async (req, res) => {
    try {
      const places2 = await storage.getPlaces();
      res.json(places2);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch places");
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
      if (error instanceof z2.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete place");
    }
  });
  app2.post("/api/health-types", async (req, res) => {
    try {
      const healthType = insertHealthTypeSchema.parse(req.body);
      const created = await storage.addHealthType(healthType);
      res.json(created);
    } catch (error) {
      handleZodError(res, error);
    }
  });
  app2.get("/api/health-types", async (req, res) => {
    try {
      const healthTypes2 = await storage.getHealthTypes();
      res.json(healthTypes2);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch health types");
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
      if (error instanceof z2.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete health type");
    }
  });
  app2.post("/api/family-members", async (req, res) => {
    try {
      const familyMember = insertFamilyMemberSchema.parse(req.body);
      const created = await storage.addFamilyMember(familyMember);
      res.json(created);
    } catch (error) {
      handleZodError(res, error);
    }
  });
  app2.get("/api/family-members", async (req, res) => {
    try {
      const familyMembers2 = await storage.getFamilyMembers();
      res.json(familyMembers2);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch family members");
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
      if (error instanceof z2.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete family member");
    }
  });
  app2.post("/api/charity-types", async (req, res) => {
    try {
      const charityType = insertCharityTypeSchema.parse(req.body);
      const created = await storage.addCharityType(charityType);
      res.json(created);
    } catch (error) {
      handleZodError(res, error);
    }
  });
  app2.get("/api/charity-types", async (req, res) => {
    try {
      const charityTypes2 = await storage.getCharityTypes();
      res.json(charityTypes2);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch charity types");
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
      if (error instanceof z2.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to delete charity type");
    }
  });
  app2.post("/api/financial-years", async (req, res) => {
    try {
      const financialYearAndGoalsSchema = z2.object({
        year: z2.number().min(2e3, "O ano deve ser no m\xEDnimo 2000."),
        totalMonthlyGoal: z2.preprocess(
          (val) => val === "" || val === void 0 ? NaN : Number(val),
          z2.number().min(0, "A meta mensal total n\xE3o pode ser negativa.")
        ),
        monthlyGoals: z2.array(insertMonthlyGoalSchema).optional()
      });
      const validatedBody = financialYearAndGoalsSchema.parse(req.body);
      const yearDataToInsert = {
        year: validatedBody.year,
        // Acessa diretamente 'year'
        totalMonthlyGoal: validatedBody.totalMonthlyGoal || 0
      };
      const parsedGoals = validatedBody.monthlyGoals || [];
      const newFinancialYear = await storage.createFinancialYear(yearDataToInsert, parsedGoals);
      res.status(201).json(newFinancialYear);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        console.error("Zod Validation Error for financial year creation:", error.issues);
        return res.status(400).json({ errors: error.issues });
      }
      const err = error;
      if (err.code === "23505" && err.constraint === "financial_years_year_unique") {
        console.error("Duplicate year creation attempt:", err.detail);
        return res.status(409).json({ error: "Ano financeiro j\xE1 existe." });
      }
      console.error("Server error creating financial year:", error);
      res.status(500).json({ error: "Falha ao criar ano financeiro." });
    }
  });
  app2.get("/api/financial-years", async (req, res) => {
    try {
      const years = await storage.getFinancialYears();
      res.json(years);
    } catch (error) {
      console.error("Error fetching financial years:", error);
      res.status(500).json({ error: "Falha ao buscar anos financeiros." });
    }
  });
  app2.get("/api/financial-years/:id", async (req, res) => {
    try {
      const yearId = parseInt(req.params.id);
      if (isNaN(yearId)) {
        return res.status(400).json({ error: "ID inv\xE1lido." });
      }
      const yearDetails = await storage.getFinancialYearDetails(yearId);
      if (!yearDetails) {
        return res.status(404).json({ error: "Ano financeiro n\xE3o encontrado." });
      }
      res.json(yearDetails);
    } catch (error) {
      console.error("Error fetching financial year details:", error);
      res.status(500).json({ error: "Falha ao buscar detalhes do ano financeiro." });
    }
  });
  app2.put("/api/financial-years/:id", async (req, res) => {
    try {
      const yearId = parseInt(req.params.id);
      if (isNaN(yearId)) {
        console.error("PUT /api/financial-years/:id - ID inv\xE1lido recebido:", req.params.id);
        return res.status(400).json({ error: "ID do ano inv\xE1lido. Deve ser um n\xFAmero." });
      }
      const requestBodySchema = z2.object({
        year: z2.number({
          invalid_type_error: "O campo 'ano' deve ser um n\xFAmero.",
          required_error: "O campo 'ano' \xE9 obrigat\xF3rio para atualiza\xE7\xE3o."
        }).min(1900, "O ano deve ser igual ou superior a 1900.").optional(),
        totalMonthlyGoal: z2.preprocess(
          (val) => val === "" || val === void 0 ? NaN : Number(val),
          z2.number({
            invalid_type_error: "O campo 'meta mensal total' deve ser um n\xFAmero.",
            required_error: "O campo 'meta mensal total' \xE9 obrigat\xF3rio para atualiza\xE7\xE3o."
          }).min(0, "A meta mensal total n\xE3o pode ser negativa.")
        ).optional(),
        monthlyGoals: z2.array(insertMonthlyGoalSchema).optional()
      }).strict("Campos desconhecidos no corpo da requisi\xE7\xE3o.");
      const validatedBody = requestBodySchema.parse(req.body);
      const yearDataToUpdate = {};
      if (validatedBody.year !== void 0) {
        yearDataToUpdate.year = validatedBody.year;
      }
      if (validatedBody.totalMonthlyGoal !== void 0) {
        yearDataToUpdate.totalMonthlyGoal = validatedBody.totalMonthlyGoal;
      }
      const goalsToUpdate = validatedBody.monthlyGoals || [];
      const updatedYear = await storage.updateFinancialYear(yearId, yearDataToUpdate, goalsToUpdate);
      if (!updatedYear) {
        console.warn(`PUT /api/financial-years/${yearId} - Ano financeiro n\xE3o encontrado para atualiza\xE7\xE3o.`);
        return res.status(404).json({ error: "Ano financeiro n\xE3o encontrado." });
      }
      console.log(`PUT /api/financial-years/${yearId} - Ano financeiro atualizado com sucesso.`);
      res.status(200).json({ message: "Ano financeiro atualizado com sucesso.", updated: updatedYear });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        console.error("Zod Validation Error for financial year update:", error.issues);
        return res.status(400).json({ errors: error.issues });
      }
      const err = error;
      if (err.code === "23505" && err.constraint === "financial_years_year_unique") {
        console.error("Duplicate year update attempt:", err.detail);
        return res.status(409).json({ error: "O ano financeiro informado j\xE1 existe para outro registro." });
      }
      console.error("Server error updating financial year:", error);
      res.status(500).json({ error: "Falha ao atualizar ano financeiro. Tente novamente mais tarde." });
    }
  });
  app2.delete("/api/financial-years/:id", async (req, res) => {
    try {
      const yearId = parseInt(req.params.id);
      if (isNaN(yearId)) {
        return res.status(400).json({ error: "ID inv\xE1lido." });
      }
      const deletedYear = await storage.deleteFinancialYear(yearId);
      if (!deletedYear) {
        return res.status(404).json({ error: "Ano financeiro n\xE3o encontrado." });
      }
      res.status(200).json({ message: "Ano financeiro exclu\xEDdo com sucesso.", deleted: deletedYear });
    } catch (error) {
      console.error("Error deleting financial year:", error);
      res.status(500).json({ error: "Falha ao excluir ano financeiro." });
    }
  });
  app2.get("/api/expenses/yearly/:year/monthly-summary", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      if (isNaN(year)) {
        return res.status(400).json({ error: "Ano inv\xE1lido." });
      }
      const monthlySummary = await storage.getMonthlySummaryByYear(year);
      res.json(monthlySummary);
    } catch (error) {
      console.error("Error fetching monthly summary for year:", error);
      res.status(500).json({ error: "Falha ao buscar sum\xE1rio mensal." });
    }
  });
  app2.get("/api/expenses/yearly/:year/monthly-breakdown", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      if (isNaN(year)) {
        return res.status(400).json({ error: "Ano inv\xE1lido." });
      }
      const breakdown = await storage.getMonthlyExpensesBreakdownByYear(year);
      res.json(breakdown);
    } catch (error) {
      console.error("Error fetching monthly expenses breakdown:", error);
      res.status(500).json({ error: "Falha ao buscar o desdobramento mensal de gastos." });
    }
  });
  app2.post("/api/recurring-expenses", async (req, res) => {
    try {
      const recurringExpenseData = insertRecurringExpenseSchema.parse(req.body);
      const created = await storage.createRecurringExpense(recurringExpenseData);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to create recurring expense");
    }
  });
  app2.get("/api/recurring-expenses", async (req, res) => {
    try {
      const recurringExpenses2 = await storage.getRecurringExpenses();
      res.json(recurringExpenses2);
    } catch (error) {
      handleServerError(res, error, "Failed to fetch recurring expenses");
    }
  });
  app2.get("/api/recurring-expenses/:id", async (req, res) => {
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
    } catch (error) {
      handleServerError(res, error, "Failed to fetch recurring expense");
    }
  });
  app2.patch("/api/recurring-expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const updateRecurringExpenseSchema = z2.object({
        name: z2.string().min(1, "O nome \xE9 obrigat\xF3rio.").optional(),
        amount: z2.number().min(0, "O valor n\xE3o pode ser negativo.").optional(),
        paymentMethod: z2.enum(["pix", "credit-card", "debit-card", "cash", "bank-transfer"]).optional(),
        expenseType: z2.enum(["routine", "occasional"]).optional(),
        routineCategory: z2.enum([
          "fixed",
          "supermarket",
          "food",
          "services",
          "study",
          "leisure",
          "personal-care",
          "shopping",
          "transportation",
          "health",
          "family",
          "charity"
        ]).optional().nullable(),
        // Nullable se o campo pode ser limpo
        occasionalGroupId: z2.number().int().optional().nullable(),
        // Nullable se o campo pode ser limpo
        fixedExpenseTypeId: z2.number().int().optional().nullable(),
        frequency: z2.enum(["weekly", "monthly", "semi-annually", "annually"]).optional().nullable(),
        supermarketId: z2.number().int().optional().nullable(),
        restaurantId: z2.number().int().optional().nullable(),
        occasionType: z2.enum(["normal", "special"]).optional().nullable(),
        specialOccasionDescription: z2.string().optional().nullable(),
        foodPurchaseType: z2.enum(["in-person", "online"]).optional().nullable(),
        serviceTypeId: z2.number().int().optional().nullable(),
        serviceDescription: z2.string().optional().nullable(),
        studyTypeId: z2.number().int().optional().nullable(),
        studyDescription: z2.string().optional().nullable(),
        leisureTypeId: z2.number().int().optional().nullable(),
        leisureDescription: z2.string().optional().nullable(),
        personalCareTypeId: z2.number().int().optional().nullable(),
        personalCareDescription: z2.string().optional().nullable(),
        shopId: z2.number().int().optional().nullable(),
        shoppingPurchaseType: z2.enum(["in-person", "online"]).optional().nullable(),
        shoppingOccasionType: z2.enum(["normal", "special"]).optional().nullable(),
        shoppingSpecialOccasionDescription: z2.string().optional().nullable(),
        startPlaceId: z2.number().int().optional().nullable(),
        endPlaceId: z2.number().int().optional().nullable(),
        startingPoint: z2.string().optional().nullable(),
        destination: z2.string().optional().nullable(),
        transportMode: z2.enum(["car", "uber", "bus", "plane", "subway", "another"]).optional().nullable(),
        transportDescription: z2.string().optional().nullable(),
        healthTypeId: z2.number().int().optional().nullable(),
        healthTypeName: z2.string().optional().nullable(),
        // Não é um ID, é um nome que vem do join
        healthDescription: z2.string().optional().nullable(),
        familyMemberId: z2.number().int().optional().nullable(),
        familyMemberName: z2.string().optional().nullable(),
        // Não é um ID, é um nome que vem do join
        familyDescription: z2.string().optional().nullable(),
        charityTypeId: z2.number().int().optional().nullable(),
        charityTypeName: z2.string().optional().nullable(),
        // Não é um ID, é um nome que vem do join
        charityDescription: z2.string().optional().nullable(),
        // Campos específicos de recorrência
        recurrenceType: z2.enum(["undetermined", "paused", "determined"]).optional(),
        installmentsTotal: z2.number().int().min(1, "O n\xFAmero de parcelas deve ser pelo menos 1.").optional().nullable(),
        startDate: z2.string().transform((str) => new Date(str)).optional()
        // Data de início pode ser atualizada
      }).partial();
      const updateData = updateRecurringExpenseSchema.parse(req.body);
      const updated = await storage.updateRecurringExpense(id, updateData);
      if (!updated) {
        return res.status(404).json({ error: "Recurring expense not found" });
      }
      res.status(200).json({ message: "Recurring expense updated successfully", updated });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return handleZodError(res, error);
      }
      handleServerError(res, error, "Failed to update recurring expense");
    }
  });
  app2.delete("/api/recurring-expenses/:id", async (req, res) => {
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
    } catch (error) {
      handleServerError(res, error, "Failed to delete recurring expense");
    }
  });
  app2.post("/api/generate-recurring-expenses", async (req, res) => {
    try {
      await storage.generateMonthlyRecurringExpenses();
      res.status(200).json({ message: "Monthly recurring expenses generation triggered successfully." });
    } catch (error) {
      handleServerError(res, error, "Failed to trigger recurring expenses generation");
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
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
      if (logLine.length > 200) {
        logLine = logLine.slice(0, 199) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  let server;
  server = await registerRoutes(app);
  if (process.env.NODE_ENV === "development") {
    log("Ambiente: Desenvolvimento. Acionando gera\xE7\xE3o de despesas recorrentes...");
    setTimeout(async () => {
      try {
        await storage.generateMonthlyRecurringExpenses();
        log("Gera\xE7\xE3o de despesas recorrentes conclu\xEDda.");
      } catch (error) {
        console.error("Erro durante a gera\xE7\xE3o de despesas recorrentes na inicializa\xE7\xE3o:", error);
      }
    }, 5e3);
  }
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    if (process.env.NODE_ENV === "development") {
      console.error(err);
    } else {
      console.error(err);
    }
  });
  if (process.env.NODE_ENV === "development") {
    log("Ambiente: Desenvolvimento. Configurando Vite para hot-reloading...");
    await setupVite(app, server);
  } else {
    log("Ambiente: Produ\xE7\xE3o. Servindo arquivos est\xE1ticos...");
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0"
  }, () => {
    log(`Servidor rodando em: http://localhost:${port}`);
    if (process.env.NODE_ENV === "development") {
      log(`Acesse o cliente em: http://localhost:${port}`);
    }
  });
})();
