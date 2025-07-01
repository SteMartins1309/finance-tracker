// IMPORTAÇÕES

// drizzle-orm/pg-core: Importa funções para definir tabelas e colunas específicas do PostgreSQL (como pgTable, text, serial, integer, boolean, decimal, timestamp, pgEnum).
import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  decimal,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
// drizzle-zod: Importa createInsertSchema, que é uma ferramenta para gerar automaticamente esquemas de validação Zod a partir das suas tabelas Drizzle.
import { createInsertSchema } from "drizzle-zod";
// zod: A biblioteca de validação de esquemas.
import { z } from "zod";
// relations (de drizzle-orm): Usado para definir os relacionamentos entre suas tabelas no Drizzle ORM.
import { relations } from "drizzle-orm";

//ENUMS: Define tipos de dados enumerados que serão usados como tipos de coluna no seu banco de dados. Isso garante que certos campos só possam ter valores predefinidos

// paymentMethodEnum: método de pagamento
export const paymentMethodEnum = pgEnum("payment_method", [
  "credit-card",
  "debit-card",
  "cash",
  "bank-transfer",
]);
// expenseTypeEnum: tipo de despesa (rotina ou ocasional)
export const expenseTypeEnum = pgEnum("expense_type", [
  "routine",
  "occasional",
]);
// routineCategoryEnum: categoria de despesa rotineira
export const routineCategoryEnum = pgEnum("routine_category", [
  "supermarket",
  "food",
  "services",
  "leisure",
  "personal-care",
  "shopping",
  "transportation",
  "health",
  "family",
  "charity",
]);
// purchaseTypeEnum: tipo de compra (presencial ou online)
export const purchaseTypeEnum = pgEnum("purchase_type", [
  "in-person",
  "online",
]);
// transportModeEnum: modo de transporte
export const transportModeEnum = pgEnum("transport_mode", [
  "car",
  "uber",
  "public-transport",
  "walking",
  "bicycle",
]);
// occasionalGroupStatusEnum: status do grupo de despesas ocasionais
export const occasionalGroupStatusEnum = pgEnum("occasional_group_status", [
  "open",
  "closed",
]);

// TABELAS (pgTable): Cada uma dessas constantes (users, occasionalGroups, supermarkets, etc.) representa uma tabela no seu banco de dados PostgreSQL. Para cada tabela, você define:
// id: Uma chave primária serial (auto-incremento).
// Nomes das colunas (text, integer, decimal, timestamp, etc.).
// Restrições de coluna (ex: notNull(), unique(), default()).

// users: tabela de usuários
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});
// occasionalGroups: tabela de grupos de despesas ocasionais
export const occasionalGroups = pgTable("occasional_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: occasionalGroupStatusEnum("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// (PRONTO) supermarkets: tabela de supermercados
export const supermarkets = pgTable("supermarkets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

// restaurants: tabela de restaurantes
export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});
// serviceTypes: tabela de tipos de serviços
export const serviceTypes = pgTable("service_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});
// leisureTypes: tabela de tipos de lazer
export const leisureTypes = pgTable("leisure_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});
// personalCareTypes: tabela de tipos de cuidados pessoais
export const personalCareTypes = pgTable("personal_care_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});
// healthTypes: tabela de tipos de saúde
export const healthTypes = pgTable("health_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});
// familyMembers: tabela de membros da família
export const familyMembers = pgTable("family_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});
// charityTypes: tabela de tipos de caridade
export const charityTypes = pgTable("charity_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});
// expenses: tabela de despesas
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  expenseType: expenseTypeEnum("expense_type").notNull(),
  routineCategory: routineCategoryEnum("routine_category"),
  occasionalGroupId: integer("occasional_group_id"),

  // Cada campo é uma chave estrangeira (foreign keys) que referencia uma das tabelas de categorias específicas
  supermarketId: integer("supermarket_id"),

  restaurantId: integer("restaurant_id"),
  serviceTypeId: integer("service_type_id"),
  leisureTypeId: integer("leisure_type_id"),
  personalCareTypeId: integer("personal_care_type_id"),
  healthTypeId: integer("health_type_id"),
  familyMemberId: integer("family_member_id"),
  charityTypeId: integer("charity_type_id"),

  // Text fields
  description: text("description"),
  storeName: text("store_name"),
  startingPoint: text("starting_point"),
  destination: text("destination"),
  transportMode: transportModeEnum("transport_mode"),
  purchaseType: purchaseTypeEnum("purchase_type"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// RELAÇÕES (relations): Define como as tabelas se relacionam entre si (ex: uma despesa pertence a um grupo ocasional ou a um mercado específico). Isso é crucial para fazer queries complexas que envolvem várias tabelas, como buscar despesas e mostrar o nome do mercado associado.
export const expensesRelations = relations(expenses, ({ one }) => ({
  occasionalGroup: one(occasionalGroups, {
    fields: [expenses.occasionalGroupId],
    references: [occasionalGroups.id],
  }),
  supermarket: one(supermarkets, {
    // Define que cada despesa pode estar associada a um supermercado específico
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
  leisureType: one(leisureTypes, {
    fields: [expenses.leisureTypeId],
    references: [leisureTypes.id],
  }),
  personalCareType: one(personalCareTypes, {
    fields: [expenses.personalCareTypeId],
    references: [personalCareTypes.id],
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

export const occasionalGroupsRelations = relations(
  occasionalGroups,
  ({ many }) => ({
    expenses: many(expenses),
  }),
);

// Define que um supermercado pode ter várias despesas associadas
export const supermarketsRelations = relations(supermarkets, ({ many }) => ({
  expenses: many(expenses),
}));

export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  expenses: many(expenses),
}));

export const serviceTypesRelations = relations(serviceTypes, ({ many }) => ({
  expenses: many(expenses),
}));

export const leisureTypesRelations = relations(leisureTypes, ({ many }) => ({
  expenses: many(expenses),
}));

export const personalCareTypesRelations = relations(
  personalCareTypes,
  ({ many }) => ({
    expenses: many(expenses),
  }),
);

export const healthTypesRelations = relations(healthTypes, ({ many }) => ({
  expenses: many(expenses),
}));

export const familyMembersRelations = relations(familyMembers, ({ many }) => ({
  expenses: many(expenses),
}));

export const charityTypesRelations = relations(charityTypes, ({ many }) => ({
  expenses: many(expenses),
}));

// Insert Schemas (createInsertSchema): Utiliza o drizzle-zod para criar automaticamente esquemas de validação Zod para a inserção de dados em cada tabela.
// O .omit({ id: true, createdAt: true }) é usado para indicar que os campos id e createdAt (que são gerados automaticamente pelo banco de dados)
// não precisam ser fornecidos ao criar um novo registro.

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertOccasionalGroupSchema = createInsertSchema(
  occasionalGroups,
).omit({
  id: true,
  createdAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    purchaseDate: z.string().transform((str) => new Date(str)),
  });

// Define esquema de inserção para a tabela de supermercados
export const insertSupermarketSchema = createInsertSchema(supermarkets).omit({
  id: true,
});

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true,
});

export const insertServiceTypeSchema = createInsertSchema(serviceTypes).omit({
  id: true,
});

export const insertLeisureTypeSchema = createInsertSchema(leisureTypes).omit({
  id: true,
});

export const insertPersonalCareTypeSchema = createInsertSchema(
  personalCareTypes,
).omit({
  id: true,
});

export const insertHealthTypeSchema = createInsertSchema(healthTypes).omit({
  id: true,
});

export const insertFamilyMemberSchema = createInsertSchema(familyMembers).omit({
  id: true,
});

export const insertCharityTypeSchema = createInsertSchema(charityTypes).omit({
  id: true,
});

// TIPOS (export type): Exporta tipos TypeScript (InsertUser, User, InsertExpense, Expense, etc.) que são inferidos a partir dos esquemas Drizzle e Zod.
// Isso fornece forte tipagem em todo o seu aplicativo, ajudando a prevenir erros e melhorando a autocompletar no seu editor de código.
export type InsertUser = z.infer<typeof insertUserSchema>; // Para validação de inserção
export type User = typeof users.$inferSelect; // Para leitura da tabela

export type InsertOccasionalGroup = z.infer<typeof insertOccasionalGroupSchema>;
export type OccasionalGroup = typeof occasionalGroups.$inferSelect;

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// Define o tipo TypeScript para a inserção e leitura de supermercados
export type InsertSupermarket = z.infer<typeof insertSupermarketSchema>;
export type Supermarket = typeof supermarkets.$inferSelect;

export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Restaurant = typeof restaurants.$inferSelect;

export type InsertServiceType = z.infer<typeof insertServiceTypeSchema>;
export type ServiceType = typeof serviceTypes.$inferSelect;

export type InsertLeisureType = z.infer<typeof insertLeisureTypeSchema>;
export type LeisureType = typeof leisureTypes.$inferSelect;

export type InsertPersonalCareType = z.infer<
  typeof insertPersonalCareTypeSchema
>;
export type PersonalCareType = typeof personalCareTypes.$inferSelect;

export type InsertHealthType = z.infer<typeof insertHealthTypeSchema>;
export type HealthType = typeof healthTypes.$inferSelect;

export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
export type FamilyMember = typeof familyMembers.$inferSelect;

export type InsertCharityType = z.infer<typeof insertCharityTypeSchema>;
export type CharityType = typeof charityTypes.$inferSelect;
