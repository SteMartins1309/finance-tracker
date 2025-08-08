// IMPORTS

import {
  pgTable,
  text,
  serial,
  real,
  integer,
  timestamp, 
  pgEnum,
  alias,
  boolean, // Garante que 'boolean' está importado
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations, type AnyColumn } from "drizzle-orm"; // Adicionado 'AnyColumn' para tipagem de relações
export { alias, relations }; 

// ENUMS
//-----------------------------------------------------------------------------------------

// paymentMethodEnum: método de pagamento
export const paymentMethodEnum = pgEnum("payment_method", [
  "pix",
  "debit-card",
  "credit-card",
  "cash",
  "bank-transfer",
]);

// expenseTypeEnum: tipo de despesa (rotina ou ocasional)
export const expenseTypeEnum = pgEnum("expense_type", [ // Mantido nome original
  "routine",
  "occasional",
]);

// routineCategoryEnum: categoria de despesa rotineira
export const routineCategoryEnum = pgEnum("routine_category", [
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
  "charity",
]);

// occasionalGroupStatusEnum: status do grupo de despesas ocasionais  (categoria 'occasional')
export const occasionalGroupStatusEnum = pgEnum("occasional_group_status", [
  "open",
  "closed",
]);

// frequencyTypeEnum: frequência de pagamento  (subcategoria 'fixed')
export const frequencyTypeEnum = pgEnum("frequency_type", [
  "weekly",
  "monthly",
  "semi-annually",
  "annually"
]);

// occasionTypeEnum: tipo de ocasião  (subcategorias 'food' e 'shopping')
export const occasionTypeEnum = pgEnum("occasion_type", [
  "normal",
  "special"
]);

// purchaseTypeEnum: tipo de compra  (subcategorias 'food' e 'shopping')
export const purchaseTypeEnum = pgEnum("purchase_type", [
  "in-person",
  "online",
]);

// transportModeEnum: modo de transporte  (subcategoria 'transportation')
export const transportModeEnum = pgEnum("transport_mode", [
  "car",
  "uber",
  "bus",
  "plane",
  "subway",
  "another",
]);

// recurrenceTypeEnum: tipo de recorrência
export const recurrenceTypeEnum = pgEnum("recurrence_type", [
  "undetermined",
  "paused",
  "determined",
]);

// paymentStatusEnum: status de pagamento de uma ocorrência de despesa
export const paymentStatusEnum = pgEnum("payment_status", [
  "paid",
  "pending",
]);

//-----------------------------------------------------------------------------------------
// fim dos ENUMS


// TABELAS
//-----------------------------------------------------------------------------------------

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const occasionalGroups = pgTable("occasional_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: occasionalGroupStatusEnum("status").notNull().default("open"),
  description: text("description"),
  iconName: text("icon_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  openingDate: timestamp("opening_date", { mode: "date" }).defaultNow().notNull(),
  closingDate: timestamp("closing_date", { mode: "date" }),
});

export const fixedExpenseTypes = pgTable("fixed_expense_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const supermarkets = pgTable("supermarkets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const serviceTypes = pgTable("service_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const studyTypes = pgTable("study_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const leisureTypes = pgTable("leisure_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const personalCareTypes = pgTable("personal_care_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const shops = pgTable("shops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const places = pgTable("places", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const healthTypes = pgTable("health_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const familyMembers = pgTable("family_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const charityTypes = pgTable("charity_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const recurringExpenses = pgTable("recurring_expenses", {
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


// expenses: tabela de despesas (MODIFICADA COM CAMPOS DE RECORRÊNCIA E PARCELA)
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  amount: real("amount").notNull(),
  purchaseDate: timestamp('purchase_date', { mode: 'date' }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  expenseType: expenseTypeEnum("expense_type").notNull(),
  routineCategory: routineCategoryEnum("routine_category"),
  occasionalGroupId: integer("occasional_group_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),

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
  recurringExpenseId: integer("recurring_expense_id"), // FK para recurring_expenses
  installmentNumber: integer("installment_number"), // Número da parcela
});

export const financialYears = pgTable("financial_years", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull().unique(),
  totalMonthlyGoal: real("total_monthly_goal").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const monthlyGoals = pgTable("monthly_goals", {
  id: serial("id").primaryKey(),
  financialYearId: integer("financial_year_id")
    .notNull()
    .references(() => financialYears.id, { onDelete: "cascade" }),
  category: routineCategoryEnum("category").notNull(),
  amount: real("amount").notNull(),
});

//-----------------------------------------------------------------------------------------
// fim das TABELAS


// RELAÇÕES
//-----------------------------------------------------------------------------------------

export const expensesRelations = relations(expenses, ({ one }) => ({
  occasionalGroup: one(occasionalGroups, {
    fields: [expenses.occasionalGroupId],
    references: [occasionalGroups.id],
  }),

  // Relação com a tabela recurringExpenses
  recurringExpense: one(recurringExpenses, {
    fields: [expenses.recurringExpenseId],
    references: [recurringExpenses.id],
  }),

  fixedExpenseType: one(fixedExpenseTypes, {
    fields: [expenses.fixedExpenseTypeId],
    references: [fixedExpenseTypes.id],
  }),

  supermarket: one(supermarkets, {
    fields: [expenses.supermarketId],
    references: [supermarkets.id],
  }),

  restaurant: one(restaurants, {
    fields: [expenses.restaurantId],
    references: [restaurants.id],
  }),

  serviceType: one(serviceTypes, {
    fields: [expenses.serviceTypeId],
    references: [serviceTypes.id],
  }),

  studyType: one(studyTypes, {
    fields: [expenses.studyTypeId],
    references: [studyTypes.id],
  }),

  leisureType: one(leisureTypes, {
    fields: [expenses.leisureTypeId],
    references: [leisureTypes.id],
  }),

  personalCareType: one(personalCareTypes, {
    fields: [expenses.personalCareTypeId],
    references: [personalCareTypes.id],
  }),

  shop: one(shops, {
    fields: [expenses.shopId],
    references: [shops.id],
  }),

  startPlace: one(places, {
    fields: [expenses.startPlaceId],
    references: [places.id],
    relationName: "start_place_relation",
  }),
  endPlace: one(places, {
    fields: [expenses.endPlaceId],
    references: [places.id],
    relationName: "end_place_relation",
  }),

  healthType: one(healthTypes, {
    fields: [expenses.healthTypeId],
    references: [healthTypes.id],
  }),

  familyMember: one(familyMembers, {
    fields: [expenses.familyMemberId],
    references: [familyMembers.id],
  }),

  charityType: one(charityTypes, {
    fields: [expenses.charityTypeId],
    references: [charityTypes.id],
  }),

}));

// Relações para recurringExpenses
export const recurringExpensesRelations = relations(recurringExpenses, ({ one, many }) => ({
  occasionalGroup: one(occasionalGroups, {
    fields: [recurringExpenses.occasionalGroupId],
    references: [occasionalGroups.id],
  }),
  fixedExpenseType: one(fixedExpenseTypes, {
    fields: [recurringExpenses.fixedExpenseTypeId],
    references: [fixedExpenseTypes.id],
  }),
  supermarket: one(supermarkets, {
    fields: [recurringExpenses.supermarketId],
    references: [supermarkets.id],
  }),
  restaurant: one(restaurants, {
    fields: [recurringExpenses.restaurantId],
    references: [restaurants.id],
  }),
  serviceType: one(serviceTypes, {
    fields: [recurringExpenses.serviceTypeId],
    references: [serviceTypes.id],
  }),
  studyType: one(studyTypes, {
    fields: [recurringExpenses.studyTypeId],
    references: [studyTypes.id],
  }),
  leisureType: one(leisureTypes, {
    fields: [recurringExpenses.leisureTypeId],
    references: [leisureTypes.id],
  }),
  personalCareType: one(personalCareTypes, {
    fields: [recurringExpenses.personalCareTypeId],
    references: [personalCareTypes.id],
  }),
  shop: one(shops, {
    fields: [recurringExpenses.shopId],
    references: [shops.id],
  }),
  startPlace: one(places, {
    fields: [recurringExpenses.startPlaceId],
    references: [places.id],
    relationName: "recurring_start_place_relation",
  }),
  endPlace: one(places, {
    fields: [recurringExpenses.endPlaceId],
    references: [places.id],
    relationName: "recurring_end_place_relation",
  }),
  healthType: one(healthTypes, {
    fields: [recurringExpenses.healthTypeId],
    references: [healthTypes.id],
  }),
  familyMember: one(familyMembers, {
    fields: [recurringExpenses.familyMemberId],
    references: [familyMembers.id],
  }),
  charityType: one(charityTypes, {
    fields: [recurringExpenses.charityTypeId],
    references: [charityTypes.id],
  }),
  occurrences: many(expenses),
}));


// Define que um grupo de despesas ocasionais pode ter várias despesas associadas
export const occasionalGroupsRelations = relations(
  occasionalGroups,
  ({ many }) => ({
    expenses: many(expenses),
    recurringExpenses: many(recurringExpenses), // NÃO MUDAR: Sem {} aqui
  }),
);

// Define que um tipo de despesa fixa pode ter várias despesas associadas
export const fixedExpenseTypesRelations = relations(fixedExpenseTypes, ({ many }) => ({
  expenses: many(expenses),
  recurringExpenses: many(recurringExpenses), // NÃO MUDAR: Sem {} aqui
}));

// Define que um supermercado pode ter várias despesas associadas
export const supermarketsRelations = relations(supermarkets, ({ many }) => ({
  expenses: many(expenses),
  recurringExpenses: many(recurringExpenses), // NÃO MUDAR: Sem {} aqui
}));

// Define que um restaurante pode ter várias despesas associadas
export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  expenses: many(expenses),
  recurringExpenses: many(recurringExpenses), // NÃO MUDAR: Sem {} aqui
}));

// Define que um tipo de serviço pode ter várias despesas associadas
export const serviceTypesRelations = relations(serviceTypes, ({ many }) => ({
  expenses: many(expenses),
  recurringExpenses: many(recurringExpenses), // NÃO MUDAR: Sem {} aqui
}));

// Define que um tipo de estudo pode ter várias despesas associadas
export const studyTypesRelations = relations(studyTypes, ({ many }) => ({
  expenses: many(expenses),
  recurringExpenses: many(recurringExpenses), // NÃO MUDAR: Sem {} aqui
}));

// Define que um tipo de lazer pode ter várias despesas associadas
export const leisureTypesRelations = relations(leisureTypes, ({ many }) => ({
  expenses: many(expenses),
  recurringExpenses: many(recurringExpenses), // NÃO MUDAR: Sem {} aqui
}));

// Define que um tipo de cuidado personal pode ter várias despesas associadas
export const personalCareTypesRelations = relations(personalCareTypes, ({ many }) => ({
    expenses: many(expenses),
    recurringExpenses: many(recurringExpenses), // NÃO MUDAR: Sem {} aqui
  }),
);

// Define que uma loja pode ter várias despesas associadas
export const shopsRelations = relations(shops, ({ many }) => ({
  expenses: many(expenses),
  recurringExpenses: many(recurringExpenses), // NÃO MUDAR: Sem {} aqui
}));

// Define que um lugar pode ter várias despesas associadas
export const placesRelations = relations(places, ({ many }) => ({
  expensesStart: many(expenses, { relationName: "start_place_relation" }),
  expensesEnd: many(expenses, { relationName: "end_place_relation" }),
  recurringExpensesStart: many(recurringExpenses, { relationName: "recurring_start_place_relation" }),
  recurringExpensesEnd: many(recurringExpenses, { relationName: "recurring_end_place_relation" }),
}));

// Define que um tipo de demanda de saúde pode ter várias despesas associadas
export const healthTypesRelations = relations(healthTypes, ({ many }) => ({
  expenses: many(expenses),
  recurringExpenses: many(recurringExpenses), // NÃO MUDAR: Sem {} aqui
}));

// Define que um membro da família pode ter várias despesas associadas
export const familyMembersRelations = relations(familyMembers, ({ many }) => ({
  expenses: many(expenses),
  recurringExpenses: many(recurringExpenses), // NÃO MUDAR: Sem {} aqui
}));

// Define que um tipo de caridade pode ter várias despesas associadas
export const charityTypesRelations = relations(charityTypes, ({ many }) => ({
  expenses: many(expenses),
  recurringExpenses: many(recurringExpenses), // NÃO MUDAR: Sem {} aqui
}));

// Relações para financialYears: Um ano financeiro tem muitas metas mensais
export const financialYearsRelations = relations(financialYears, ({ many }) => ({
  monthlyGoals: many(monthlyGoals),
}));

// Relações para monthlyGoals: Uma meta mensal pertence a um financialYear
export const monthlyGoalsRelations = relations(monthlyGoals, ({ one }) => ({
  financialYear: one(financialYears, {
    fields: [monthlyGoals.financialYearId],
    references: [financialYears.id],
  }),
}));
//-----------------------------------------------------------------------------------------
// fim das RELAÇÕES




// ESQUEMAS DE INSERÇÃO
//-----------------------------------------------------------------------------------------

// Define esquema de inserção para a tabela de usuários
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Define esquema de inserção para a tabela de grupos de despesas ocasionais
export const insertOccasionalGroupSchema = createInsertSchema(
  occasionalGroups,
).omit({
  id: true,
  createdAt: true,
}).extend({
  iconName: z.string().nullable().optional(),
  openingDate: z.string().datetime("Data de abertura inválida.").transform((str) => new Date(str)),
  closingDate: z.string().datetime("Data de fechamento inválida.").nullable().optional().transform((str) => str ? new Date(str) : null),
});

// Define esquema de inserção para a tabela de despesas
export const insertExpenseSchema = createInsertSchema(expenses)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    purchaseDate: z.string().transform((str) => new Date(str)), 
    recurringExpenseId: z.number().int().nullable().optional(), // Incluído aqui
    paymentStatus: z.enum(paymentStatusEnum.enumValues).optional(), // Ou z.enum(["paid", "pending"]).optional()
    installmentNumber: z.number().int().nullable().optional(), // Incluído aqui
  });


// Para as subcategorias de despesas rotineiras

// Define esquema de inserção para a tabela de tipos de despesas fixas
export const insertFixedExpenseTypeSchema = createInsertSchema(fixedExpenseTypes).omit({
  id: true,
});

// Define esquema de inserção para a tabela de supermercados
export const insertSupermarketSchema = createInsertSchema(supermarkets).omit({
  id: true,
});

// Define esquema de inserção para a tabela de restaurantes
export const insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true,
});

// Define esquema de inserção para a tabela de tipos de serviços
export const insertServiceTypeSchema = createInsertSchema(serviceTypes).omit({
  id: true,
});

// Define esquema de inserção para a tabela de tipos de estudos
export const insertStudyTypeSchema = createInsertSchema(studyTypes).omit({
  id: true,
});

// Define esquema de inserção para a tabela de tipos de lazer
export const insertLeisureTypeSchema = createInsertSchema(leisureTypes).omit({
  id: true,
});

// Define esquema de inserção para a tabela de tipos de cuidados pessoais
export const insertPersonalCareTypeSchema = createInsertSchema(personalCareTypes).omit({
  id: true,
});

// Define esquema de inserção para a tabela de lojas
export const insertShopSchema = createInsertSchema(shops).omit({
  id: true,
});

// Define esquema de inserção para a tabela de lugares
export const insertPlaceSchema = createInsertSchema(places).omit({
  id: true,
});

// Define esquema de inserção para a tabela de tipos de saúde
export const insertHealthTypeSchema = createInsertSchema(healthTypes).omit({
  id: true,
});

// Define esquema de inserção para a tabela de membros da família
export const insertFamilyMemberSchema = createInsertSchema(familyMembers).omit({
  id: true,
});

// Define esquema de inserção para a tabela de tipos de caridade
export const insertCharityTypeSchema = createInsertSchema(charityTypes).omit({
  id: true,
});

// insertFinancialYearSchema
export const insertFinancialYearSchema = createInsertSchema(financialYears).omit({
  id: true,
  createdAt: true,
});

// insertMonthlyGoalSchema
export const insertMonthlyGoalSchema = createInsertSchema(monthlyGoals).omit({
  id: true,
  financialYearId: true, // financialYearId será adicionado via código, não diretamente do formulário
});

// insertRecurringExpenseSchema
// O tipo inferido para 'data' em superRefine precisa ter todas as propriedades.
// Para garantir isso, podemos usar z.object() com a união dos campos, ou garantir
// que `createInsertSchema` já traga tudo e `extend` apenas sobrescreva.
// A solução mais simples para o superRefine é confiar que a inferência do Zod está correta
// APÓS o .omit e .extend, ou fazer um cast no `data`.
export const insertRecurringExpenseSchema = createInsertSchema(recurringExpenses)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    nextOccurrenceDate: true,
    installmentsPaid: true, // Omitir installmentsPaid na inserção
    installmentsTrulyPaid: true, // Omitir installmentsTrulyPaid na inserção
  })
  .extend({
    // Estes campos são adicionados ou sobrescritos com transformações
    startDate: z.string().transform((str) => new Date(str)),
    installmentsTotal: z.preprocess(
      (val) => {
        if (val === "" || val === undefined || val === null) return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
      },
      z.number().int().nullable().optional()
    )
    .superRefine((val, ctx) => {
      if (val !== null && val !== undefined && val <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O número de parcelas deve ser pelo menos 1.",
          path: ctx.path,
        });
      }
    }),
    // NOVO: Adicionar recurrenceType ao extend para garantir que esteja no tipo de 'data' do superRefine
    recurrenceType: z.enum(recurrenceTypeEnum.enumValues),
  });
  // O superRefine a nível do SCHEMA completo para validações cruzadas
  // Agora, 'data' terá todas as propriedades do schema `recurringExpenses` original menos as omitidas,
  // e com as transformações/extensões aplicadas.
  // CAST EXPLÍCITO para ajudar o TypeScript na inferência
insertRecurringExpenseSchema.superRefine((data, ctx) => {
    // A propriedade recurrenceType já deve estar presente no `data` aqui.
    // O cast abaixo é uma precaução, mas se o `extend` acima estiver correto, não seria estritamente necessário.
    const fullData = data as z.infer<typeof insertRecurringExpenseSchema> & { recurrenceType: 'undetermined' | 'paused' | 'determined' };

    if (fullData.recurrenceType === "determined") {
      if (fullData.installmentsTotal === undefined || fullData.installmentsTotal === null || fullData.installmentsTotal <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Número total de parcelas é obrigatório e deve ser um número positivo para recorrência determinada.",
          path: ["installmentsTotal"],
        });
      }
    } else {
      if (fullData.installmentsTotal !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Número de parcelas não deve ser definido para recorrências indeterminadas ou pausadas.",
          path: ["installmentsTotal"],
        });
      }
    }
});


//-----------------------------------------------------------------------------------------
// fim dos ESQUEMAS DE INSERÇÃO


// TIPOS TYPESCRIPT: Para validação de inserção e leitura da tabela
//-----------------------------------------------------------------------------------------

// Define o tipo TypeScript para a inserção e leitura de usuários
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define o tipo TypeScript para a inserção e leitura de grupos de despesas ocasionais
export type InsertOccasionalGroup = z.infer<typeof insertOccasionalGroupSchema>;
export type OccasionalGroup = typeof occasionalGroups.$inferSelect;

// Define o tipo TypeScript para a inserção e leitura de despesas
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;


// Para as subcategorias de despesas rotineiras

// Define o tipo TypeScript para a inserção e leitura de tipos de despesas fixas
export type InsertFixedExpenseType = z.infer<typeof insertFixedExpenseTypeSchema>;
export type FixedExpenseType = typeof fixedExpenseTypes.$inferSelect;

// Define o tipo TypeScript para a inserção e leitura de supermercados
export type InsertSupermarket = z.infer<typeof insertSupermarketSchema>;
export type Supermarket = typeof supermarkets.$inferSelect;

// Define o tipo TypeScript para a inserção e leitura de restaurantes
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Restaurant = typeof restaurants.$inferSelect;

// Define o tipo TypeScript para a inserção e leitura de tipos de serviços
export type InsertServiceType = z.infer<typeof insertServiceTypeSchema>;
export type ServiceType = typeof serviceTypes.$inferSelect;

// Define o tipo TypeScript para a inserção e leitura de tipos de estudos
export type InsertStudyType = z.infer<typeof insertStudyTypeSchema>;
export type StudyType = typeof studyTypes.$inferSelect;

// Define o tipo TypeScript para a inserção e leitura de tipos de lazer
export type InsertLeisureType = z.infer<typeof insertLeisureTypeSchema>;
export type LeisureType = typeof leisureTypes.$inferSelect;

// Define o tipo TypeScript para a inserção e leitura de tipos de cuidados pessoais
export type InsertPersonalCareType = z.infer<typeof insertPersonalCareTypeSchema>;
export type PersonalCareType = typeof personalCareTypes.$inferSelect;

// Define o tipo TypeScript para a inserção e leitura de lojas
export type InsertShop = z.infer<typeof insertShopSchema>;
export type Shop = typeof shops.$inferSelect;

// Define o tipo TypeScript para a inserção e leitura de lugares
export type InsertPlace = z.infer<typeof insertPlaceSchema>;
export type Place = typeof places.$inferSelect;

// Define o tipo TypeScript para a inserção e leitura de tipos de saúde
export type InsertHealthType = z.infer<typeof insertHealthTypeSchema>;
export type HealthType = typeof healthTypes.$inferSelect;

// Define o tipo TypeScript para a inserção e leitura de membros da família
export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
export type FamilyMember = typeof familyMembers.$inferSelect;

// Define o tipo TypeScript para a inserção e leitura de tipos de caridade
export type InsertCharityType = z.infer<typeof insertCharityTypeSchema>;
export type CharityType = typeof charityTypes.$inferSelect;

// financialYears
export type InsertFinancialYear = z.infer<typeof insertFinancialYearSchema>;
export type FinancialYear = typeof financialYears.$inferSelect;

// monthlyGoals
export type InsertMonthlyGoal = z.infer<typeof insertMonthlyGoalSchema>;
export type MonthlyGoal = typeof monthlyGoals.$inferSelect;

// recurringExpenses
export type InsertRecurringExpense = z.infer<typeof insertRecurringExpenseSchema>;
export type RecurringExpense = typeof recurringExpenses.$inferSelect;
