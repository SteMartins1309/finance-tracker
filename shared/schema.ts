import { pgTable, text, serial, integer, boolean, decimal, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const paymentMethodEnum = pgEnum("payment_method", ["credit-card", "debit-card", "cash", "bank-transfer"]);
export const expenseTypeEnum = pgEnum("expense_type", ["routine", "occasional"]);
export const routineCategoryEnum = pgEnum("routine_category", [
  "supermarket", "food", "services", "leisure", "personal-care", 
  "shopping", "transportation", "health", "family", "charity"
]);
export const purchaseTypeEnum = pgEnum("purchase_type", ["in-person", "online"]);
export const transportModeEnum = pgEnum("transport_mode", ["car", "uber", "public-transport", "walking", "bicycle"]);
export const occasionalGroupStatusEnum = pgEnum("occasional_group_status", ["open", "closed"]);

// Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const occasionalGroups = pgTable("occasional_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: occasionalGroupStatusEnum("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

export const leisureTypes = pgTable("leisure_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const personalCareTypes = pgTable("personal_care_types", {
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

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  expenseType: expenseTypeEnum("expense_type").notNull(),
  routineCategory: routineCategoryEnum("routine_category"),
  occasionalGroupId: integer("occasional_group_id"),
  
  // Category-specific fields
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

// Relations
export const expensesRelations = relations(expenses, ({ one }) => ({
  occasionalGroup: one(occasionalGroups, {
    fields: [expenses.occasionalGroupId],
    references: [occasionalGroups.id],
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

export const occasionalGroupsRelations = relations(occasionalGroups, ({ many }) => ({
  expenses: many(expenses),
}));

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

export const personalCareTypesRelations = relations(personalCareTypes, ({ many }) => ({
  expenses: many(expenses),
}));

export const healthTypesRelations = relations(healthTypes, ({ many }) => ({
  expenses: many(expenses),
}));

export const familyMembersRelations = relations(familyMembers, ({ many }) => ({
  expenses: many(expenses),
}));

export const charityTypesRelations = relations(charityTypes, ({ many }) => ({
  expenses: many(expenses),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertOccasionalGroupSchema = createInsertSchema(occasionalGroups).omit({
  id: true,
  createdAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
});

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

export const insertPersonalCareTypeSchema = createInsertSchema(personalCareTypes).omit({
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

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertOccasionalGroup = z.infer<typeof insertOccasionalGroupSchema>;
export type OccasionalGroup = typeof occasionalGroups.$inferSelect;

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

export type InsertSupermarket = z.infer<typeof insertSupermarketSchema>;
export type Supermarket = typeof supermarkets.$inferSelect;

export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Restaurant = typeof restaurants.$inferSelect;

export type InsertServiceType = z.infer<typeof insertServiceTypeSchema>;
export type ServiceType = typeof serviceTypes.$inferSelect;

export type InsertLeisureType = z.infer<typeof insertLeisureTypeSchema>;
export type LeisureType = typeof leisureTypes.$inferSelect;

export type InsertPersonalCareType = z.infer<typeof insertPersonalCareTypeSchema>;
export type PersonalCareType = typeof personalCareTypes.$inferSelect;

export type InsertHealthType = z.infer<typeof insertHealthTypeSchema>;
export type HealthType = typeof healthTypes.$inferSelect;

export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
export type FamilyMember = typeof familyMembers.$inferSelect;

export type InsertCharityType = z.infer<typeof insertCharityTypeSchema>;
export type CharityType = typeof charityTypes.$inferSelect;
