// src/types/finance.ts

// Assuming you have these enums or similar types defined elsewhere,
// or you can define them directly here if they're not global.
type PaymentMethodType = "pix" | "debit-card" | "credit-card" | "cash" | "bank-transfer";
type ExpenseTypeType = "routine" | "occasional";
type RoutineCategoryType = "fixed" | "supermarket" | "food" | "services" | "study" | "leisure" | "personal-care" | "shopping" | "transportation" | "health" | "family" | "charity";
type FrequencyType = "weekly" | "monthly" | "semi-annually" | "annually";
type OccasionTypeType = "normal" | "special";
type PurchaseTypeType = "in-person" | "online";
type TransportModeType = "car" | "uber" | "bus" | "plane" | "subway" | "another";
type RecurrenceType = "undetermined" | "paused" | "determined";


export interface RecentExpense {
  id: number;
  amount: string;
  purchaseDate: string;
  paymentMethod: string;
  expenseType: "routine" | "occasional";
  routineCategory?: string | null | undefined;

  occasionalGroupId?: number | null | undefined;
  occasionalGroupName?: string | null;
  occasionalGroupDescription?: string | null;
  occasionalGroupIconName?: string | null; 
  occasionalGroupOpeningDate?: string | null;
  occasionalGroupClosingDate?: string | null;

  displayName: string;
  category: string; 

  fixedExpenseTypeId?: number | null;
  fixedExpenseTypeName?: string | null;
  frequency?: string | null;
  supermarketId?: number | null;
  supermarketName?: string | null;
  restaurantId?: number | null;
  restaurantName?: string | null;
  occasionType?: string | null;
  specialOccasionDescription?: string | null;
  foodPurchaseType?: string | null;
  serviceTypeId?: number | null;
  serviceTypeName?: string | null;
  serviceDescription?: string | null;
  studyTypeId?: number | null;
  studyTypeName?: string | null;
  studyDescription?: string | null;
  leisureTypeId?: number | null;
  leisureTypeName?: string | null;
  leisureDescription?: string | null;
  personalCareTypeId?: number | null;
  personalCareTypeName?: string | null;
  personalCareDescription?: string | null;
  shopId?: number | null;
  shopName?: string | null;
  shoppingPurchaseType?: string | null;
  shoppingOccasionType?: string | null;
  shoppingSpecialOccasionDescription?: string | null;
  startPlaceId?: number | null;
  endPlaceId?: number | null;
  startPlaceName?: string | null;
  endPlaceName?: string | null;
  startingPoint?: string | null;
  destination?: string | null;
  transportMode?: string | null;
  transportDescription?: string | null;
  healthTypeId?: number | null;
  healthTypeName?: string | null;
  healthDescription?: string | null;
  familyMemberId?: number | null;
  familyMemberName?: string | null;
  familyDescription?: string | null;
  charityTypeId?: number | null;
  charityTypeName?: string | null;
  charityDescription?: string | null;

  recurringExpenseId?: number | null;
  paymentStatus?: "paid" | "pending" | null;
  installmentNumber?: number | null;
  recurringExpenseName?: string | null;
  recurringExpenseRecurrenceType?: "undetermined" | "paused" | "determined" | null;
  recurringExpenseInstallmentsTotal?: number | null;
  recurringExpenseInstallmentsPaid?: number | null;
  recurringExpenseStartDate?: string | null;
  recurringExpenseNextOccurrenceDate?: string | null;
  recurringRoutineCategory?: string | null;
  recurringFixedExpenseTypeId?: number | null;
  recurringFixedExpenseTypeName?: string | null;
  recurringFrequency?: string | null;
  recurringSupermarketId?: number | null;
  recurringSupermarketName?: string | null;
  recurringRestaurantId?: number | null;
  recurringRestaurantName?: string | null;
  recurringOccasionType?: string | null;
  recurringSpecialOccasionDescription?: string | null;
  recurringFoodPurchaseType?: string | null;
  recurringServiceTypeId?: number | null;
  recurringServiceTypeName?: string | null;
  recurringServiceDescription?: string | null;
  recurringStudyTypeId?: number | null;
  recurringStudyTypeName?: string | null;
  recurringStudyDescription?: string | null;
  recurringLeisureTypeId?: number | null;
  recurringLeisureTypeName?: string | null;
  recurringLeisureDescription?: string | null;
  recurringPersonalCareTypeId?: number | null;
  recurringPersonalCareTypeName?: string | null;
  recurringPersonalCareDescription?: string | null;
  recurringShopId?: number | null;
  recurringShopName?: string | null;
  recurringShoppingPurchaseType?: string | null;
  recurringShoppingOccasionType?: string | null;
  recurringShoppingSpecialOccasionDescription?: string | null;
  recurringStartPlaceId?: number | null;
  recurringEndPlaceId?: number | null;
  recurringStartingPoint?: string | null;
  recurringDestination?: string | null;
  recurringTransportMode?: string | null;
  recurringTransportDescription?: string | null;
  recurringStartPlaceName?: string | null;
  recurringEndPlaceName?: string | null;
  recurringHealthTypeId?: number | null;
  recurringHealthTypeName?: string | null;
  recurringHealthDescription?: string | null;
  recurringFamilyMemberId?: number | null;
  recurringFamilyMemberName?: string | null;
  recurringFamilyDescription?: string | null;
  recurringCharityTypeId?: number | null;
  recurringCharityTypeName?: string | null;
  recurringCharityDescription?: string | null;
}

export interface RecurringExpense {
  id: number;
  name: string;
  amount: number;
  paymentMethod: "pix" | "debit-card" | "credit-card" | "cash" | "bank-transfer";
  expenseType: "routine" | "occasional";
  routineCategory: "fixed" | "supermarket" | "food" | "services" | "study" | "leisure" | "personal-care" | "shopping" | "transportation" | "health" | "family" | "charity" | null;
  occasionalGroupId: number | null;
  
  fixedExpenseTypeId: number | null;
  frequency: "weekly" | "monthly" | "semi-annually" | "annually" | null;
  supermarketId: number | null;
  restaurantId: number | null;
  occasionType: "normal" | "special" | null;
  specialOccasionDescription: string | null;
  foodPurchaseType: "in-person" | "online" | null;
  serviceTypeId: number | null;
  serviceDescription: string | null;
  studyTypeId: number | null;
  studyDescription: string | null;
  leisureTypeId: number | null;
  leisureDescription: string | null;
  personalCareTypeId: number | null;
  personalCareDescription: string | null;
  shopId: number | null;
  shoppingPurchaseType: "in-person" | "online" | null;
  shoppingOccasionType: "normal" | "special" | null;
  shoppingSpecialOccasionDescription: string | null;
  startPlaceId: number | null;
  endPlaceId: number | null;
  startingPoint: string | null;
  destination: string | null;
  transportMode: "car" | "uber" | "bus" | "plane" | "subway" | "another" | null;
  transportDescription: string | null;
  healthTypeId: number | null;
  healthDescription: string | null;
  familyMemberId: number | null;
  familyDescription: string | null;
  charityTypeId: number | null;
  charityDescription: string | null;

  recurrenceType: "undetermined" | "paused" | "determined";
  installmentsTotal: number | null;
  installmentsPaid: number;
  installmentsTrulyPaid: number;
  startDate: string;
  nextOccurrenceDate: string;
  createdAt: string;
  updatedAt: string;

  occasionalGroupName?: string | null;
  occasionalGroupDescription?: string | null;
  iconName?: string | null;

  fixedExpenseTypeName?: string | null;
  supermarketName?: string | null;
  restaurantName?: string | null;
  serviceTypeName?: string | null;
  studyTypeName?: string | null;
  leisureTypeName?: string | null;
  personalCareTypeName?: string | null;
  shopName?: string | null;
  startPlaceName?: string | null;
  endPlaceName?: string | null;
  healthTypeName?: string | null;
  familyMemberName?: string | null;
  charityTypeName?: string | null;

  description?: string | null; 
}