// src/components/add-expense-modal.tsx

// IMPORTS (restante dos imports permanecem os mesmos)

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient"; // Certifique-se de que apiRequest pode ser tipado genericamente
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Star, Plus } from "lucide-react";


// IMPORTS DE MODAIS DE ADIÇÃO DE NOVOS COMPONENTES OU ITENS
//----------------------------------------------------------------------------
import { AddOccasionalGroupModal } from "./AddOccasionalGroupModal";
import { AddFixedExpenseTypeModal } from "./AddFixedExpenseTypeModal";
import { AddSupermarketModal } from "./AddSupermarketModal";
import { AddRestaurantModal } from "./AddRestaurantModal";
import { AddServiceTypeModal } from "./AddServiceTypeModal";
import { AddStudyTypeModal } from "./AddStudyTypeModal";
import { AddLeisureTypeModal } from "./AddLeisureTypeModal";
import { AddPersonalCareTypeModal } from "./AddPersonalCareTypeModal";
import { AddShopModal } from "./AddShopModal";
import { AddPlaceModal } from "./AddPlaceModal";
import { AddHealthTypeModal } from "./AddHealthTypeModal";
import { AddFamilyMemberModal } from "./AddFamilyMemberModal";
import { AddCharityTypeModal } from "./AddCharityTypeModal";
//----------------------------------------------------------------------------

import { RecentExpense, RecurringExpense } from "@/types/finance";


// Define os tipos literais para os enums para facilitar as assertivas de tipo
type PaymentMethodType = "pix" | "credit-card" | "debit-card" | "cash" | "bank-transfer";
type ExpenseTypeType = "routine" | "occasional";
type RoutineCategoryType = "fixed" | "supermarket" | "food" | "services" | "study" | "leisure" | "personal-care" | "shopping" | "transportation" | "health" | "family" | "charity";
type FrequencyType = "weekly" | "monthly" | "semi-annually" | "annually";
type OccasionTypeType = "normal" | "special";
type FoodPurchaseTypeType = "in-person" | "online";
type ShoppingPurchaseTypeType = "in-person" | "online";
type ShoppingOccasionTypeType = "normal" | "special";
type TransportModeType = "car" | "uber" | "bus" | "plane" | "subway" | "another";


// EXPENSE SCHEMA: Define o esquema de validação para o formulário de adição de despesa
const expenseSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  paymentMethod: z.enum(["pix", "credit-card", "debit-card", "cash", "bank-transfer"]),
  paymentStatus: z.enum(["paid", "pending"]).optional(),
  expenseType: z.enum(["routine", "occasional"]),
  routineCategory: z
    .enum([
      "fixed", "supermarket", "food", "services", "study", "leisure", "personal-care",
      "shopping", "transportation", "health", "family", "charity",
    ])
    .optional(),
  occasionalGroupId: z.string().optional(),
  createdAt: z.string().optional(),

  fixedExpenseTypeId: z.string().optional(),
  frequency: z.enum(["weekly", "monthly", "semi-annually", "annually"]).optional(),
  supermarketId: z.string().optional(),
  restaurantId: z.string().optional(),
  occasionType: z.enum(["normal", "special"]).optional(),
  specialOccasionDescription: z.string().optional(),
  foodPurchaseType: z.enum(["in-person", "online"]).optional(),
  serviceTypeId: z.string().optional(),
  serviceDescription: z.string().optional(),
  studyTypeId: z.string().optional(),
  studyDescription: z.string().optional(),
  leisureTypeId: z.string().optional(),
  leisureDescription: z.string().optional(),
  personalCareTypeId: z.string().optional(),
  personalCareDescription: z.string().optional(),
  shopId: z.string().optional(),
  shoppingPurchaseType: z.enum(["in-person", "online"]).optional(),
  shoppingOccasionType: z.enum(["normal", "special"]).optional(),
  shoppingSpecialOccasionDescription: z.string().optional(),
  startPlaceId: z.string().optional(),
  endPlaceId: z.string().optional(),
  startingPoint: z.string().optional(),
  destination: z.string().optional(),
  transportMode: z.enum(["car", "uber", "bus", "plane", "subway", "another"]).optional(),
  transportDescription: z.string().optional(),
  healthTypeId: z.string().optional(),
  healthDescription: z.string().optional(),
  familyMemberId: z.string().optional(),
  familyDescription: z.string().optional(),
  charityTypeId: z.string().optional(),
  charityDescription: z.string().optional(),
});


// EXPENSE FORM DATA: Define o tipo TypeScript para os dados do formulário de adição de despesa
type ExpenseFormData = z.infer<typeof expenseSchema>;


// ADD EXPENSE MODAL PROPS: Define as propriedades do componente AddExpenseModal
interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseToEdit?: RecentExpense | null;
}


// ADD EXPENSE MODAL: Define o componente AddExpenseModal
export function AddExpenseModal({ open, onOpenChange, expenseToEdit }: AddExpenseModalProps) {

  const [addOccasionalGroupModalOpen, setAddOccasionalGroupModalOpen] = useState(false);
  const [showAddFixedExpenseTypeModal, setShowAddFixedExpenseTypeModal] = useState(false);
  const [showAddSupermarketModal, setShowAddSupermarketModal] = useState(false);
  const [showAddRestaurantModal, setShowAddRestaurantModal] = useState(false);
  const [addServiceTypeModalOpen, setAddServiceTypeModalOpen] = useState(false);
  const [addStudyTypeModalOpen, setAddStudyTypeModalOpen] = useState(false);
  const [addLeisureTypeModalOpen, setAddLeisureTypeModalOpen] = useState(false);
  const [addPersonalCareTypeModalOpen, setAddPersonalCareTypeModalOpen] = useState(false);
  const [addShopModalOpen, setAddShopModalOpen] = useState(false);
  const [addPlaceModalOpen, setAddPlaceModalOpen] = useState(false);
  const [addHealthTypeModalOpen, setAddHealthTypeModalOpen] = useState(false);
  const [addFamilyMemberModalOpen, setAddFamilyMemberModalOpen] = useState(false);
  const [addCharityTypeModalOpen, setAddCharityTypeModalOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      paymentMethod: "credit-card",
      expenseType: "routine",
      routineCategory: undefined,
      occasionalGroupId: undefined, fixedExpenseTypeId: undefined, frequency: undefined,
      supermarketId: undefined, 
      restaurantId: undefined, occasionType: undefined, specialOccasionDescription: undefined, foodPurchaseType: undefined,
      serviceTypeId: undefined, serviceDescription: undefined, 
      studyTypeId: undefined, studyDescription: undefined,
      leisureTypeId: undefined, leisureDescription: undefined,
      personalCareTypeId: undefined, personalCareDescription: undefined, 
      shopId: undefined, shoppingPurchaseType: undefined, shoppingOccasionType: undefined, shoppingSpecialOccasionDescription: undefined,
      startPlaceId: undefined, endPlaceId: undefined, startingPoint: undefined, destination: undefined,
      transportMode: undefined, transportDescription: undefined, 
      healthTypeId: undefined, healthDescription: undefined,
      familyMemberId: undefined, familyDescription: undefined, 
      charityTypeId: undefined, charityDescription: undefined,
    },
  });

  // Helper para obter a data local formatada YYYY-MM-DD
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Efeito para preencher o formulário quando expenseToEdit muda
  useEffect(() => {
    if (expenseToEdit) {
      const dateObj = new Date(expenseToEdit.purchaseDate);
      const formattedDate = getLocalDateString(dateObj);

      form.reset({
        amount: String(expenseToEdit.amount),
        purchaseDate: formattedDate,
        paymentMethod: (expenseToEdit.paymentMethod as PaymentMethodType) || undefined,
        paymentStatus: expenseToEdit.paymentStatus || "pending",
        expenseType: (expenseToEdit.expenseType as ExpenseTypeType) || undefined,
        routineCategory: (expenseToEdit.routineCategory as RoutineCategoryType) || undefined,
        occasionalGroupId: expenseToEdit.occasionalGroupId ? String(expenseToEdit.occasionalGroupId) : undefined,

        fixedExpenseTypeId: expenseToEdit.fixedExpenseTypeId ? String(expenseToEdit.fixedExpenseTypeId) : undefined,
        frequency: (expenseToEdit.frequency as FrequencyType) || undefined,
        supermarketId: expenseToEdit.supermarketId ? String(expenseToEdit.supermarketId) : undefined,
        restaurantId: expenseToEdit.restaurantId ? String(expenseToEdit.restaurantId) : undefined,
        occasionType: (expenseToEdit.occasionType as OccasionTypeType) || undefined,
        specialOccasionDescription: expenseToEdit.specialOccasionDescription || undefined,
        foodPurchaseType: (expenseToEdit.foodPurchaseType as FoodPurchaseTypeType) || undefined,
        serviceTypeId: expenseToEdit.serviceTypeId ? String(expenseToEdit.serviceTypeId) : undefined,
        serviceDescription: expenseToEdit.serviceDescription || undefined,
        studyTypeId: expenseToEdit.studyTypeId ? String(expenseToEdit.studyTypeId) : undefined,
        studyDescription: expenseToEdit.studyDescription || undefined,
        leisureTypeId: expenseToEdit.leisureTypeId ? String(expenseToEdit.leisureTypeId) : undefined,
        leisureDescription: expenseToEdit.leisureDescription || undefined,
        personalCareTypeId: expenseToEdit.personalCareTypeId ? String(expenseToEdit.personalCareTypeId) : undefined,
        personalCareDescription: expenseToEdit.personalCareDescription || undefined,
        shopId: expenseToEdit.shopId ? String(expenseToEdit.shopId) : undefined,
        shoppingPurchaseType: (expenseToEdit.shoppingPurchaseType as ShoppingPurchaseTypeType) || undefined,
        shoppingOccasionType: (expenseToEdit.shoppingOccasionType as ShoppingOccasionTypeType) || undefined,
        shoppingSpecialOccasionDescription: expenseToEdit.shoppingSpecialOccasionDescription || undefined,
        startPlaceId: expenseToEdit.startPlaceId ? String(expenseToEdit.startPlaceId) : undefined,
        endPlaceId: expenseToEdit.endPlaceId ? String(expenseToEdit.endPlaceId) : undefined,
        startingPoint: expenseToEdit.startingPoint || undefined,
        destination: expenseToEdit.destination || undefined,
        transportMode: (expenseToEdit.transportMode as TransportModeType) || undefined,
        transportDescription: expenseToEdit.transportDescription || undefined,
        healthTypeId: expenseToEdit.healthTypeId ? String(expenseToEdit.healthTypeId) : undefined,
        healthDescription: expenseToEdit.healthDescription || undefined,
        familyMemberId: expenseToEdit.familyMemberId ? String(expenseToEdit.familyMemberId) : undefined,
        familyDescription: expenseToEdit.familyDescription || undefined,
        charityTypeId: expenseToEdit.charityTypeId ? String(expenseToEdit.charityTypeId) : undefined,
        charityDescription: expenseToEdit.charityDescription || undefined,
      });
    } else {
      const today = new Date();
      const defaultPurchaseDate = getLocalDateString(today);

      form.reset({
        amount: "",
        purchaseDate: defaultPurchaseDate,
        paymentMethod: undefined,
        paymentStatus: "pending",
        expenseType: "routine",
        routineCategory: undefined,
        occasionalGroupId: undefined, fixedExpenseTypeId: undefined, frequency: undefined,
        supermarketId: undefined, restaurantId: undefined, occasionType: undefined, specialOccasionDescription: undefined, foodPurchaseType: undefined,
        serviceTypeId: undefined, serviceDescription: undefined, leisureTypeId: undefined, leisureDescription: undefined,
        studyTypeId: undefined, studyDescription: undefined,
        personalCareTypeId: undefined, personalCareDescription: undefined, shopId: undefined,
        shoppingPurchaseType: undefined, shoppingOccasionType: undefined, shoppingSpecialOccasionDescription: undefined,
        startPlaceId: undefined, endPlaceId: undefined, startingPoint: undefined, destination: undefined,
        transportMode: undefined, transportDescription: undefined, healthTypeId: undefined, healthDescription: undefined,
        familyMemberId: undefined, familyDescription: undefined, charityTypeId: undefined, charityDescription: undefined,
      });
    }
  }, [expenseToEdit, open, form]);

  const watchedValues = form.watch();
  const expenseType = watchedValues.expenseType;
  const routineCategory = watchedValues.routineCategory;

  // HOOKS PARA BUSCAR DADOS DE SUBCATEGORIAS ESPECÍFICAS
  //-------------------------------------------------------------------------------

  const { data: occasionalGroups = [], isLoading: occasionalGroupsLoading } = useQuery<Array<{ id: number; name: string; status: string; createdAt: string; description: string | null; iconName: string | null; }>>({
    queryKey: ["/api/occasional-groups/open"],
    enabled: open && expenseType === "occasional",
  });

  const { data: fixedExpenseTypes = [], isLoading: fixedTypesLoading } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/fixed-expense-types"], enabled: open && routineCategory === "fixed", });
  const { data: supermarkets = [], isLoading: supermarketsLoading } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/supermarkets"], enabled: open && routineCategory === "supermarket", });
  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/restaurants"], enabled: open && routineCategory === "food", });
  const { data: serviceTypes = [], isLoading: serviceTypesLoading } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/service-types"], enabled: open && routineCategory === "services", });
  const { data: studyTypes = [], isLoading: studyTypesLoading } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/study-types"], enabled: open && routineCategory === "study", });
  const { data: leisureTypes = [], isLoading: leisureTypesLoading } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/leisure-types"], enabled: open && routineCategory === "leisure", });
  const { data: personalCareTypes = [], isLoading: personalCareTypesLoading } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/personal-care-types"], enabled: open && routineCategory === "personal-care", });
  const { data: shops = [], isLoading: shopsLoading } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/shops"], enabled: open && routineCategory === "shopping", });
  const { data: places = [], isLoading: placesLoading } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/places"], enabled: open && routineCategory === "transportation", });
  const { data: healthTypes = [], isLoading: healthTypesLoading } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/health-types"], enabled: open && routineCategory === "health", });
  const { data: familyMembers = [], isLoading: familyMembersLoading } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/family-members"], enabled: open && routineCategory === "family", });
  const { data: charityTypes = [], isLoading: charityTypesLoading } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/charity-types"], enabled: open && routineCategory === "charity", });

  // Cria um mapa para facilitar o acesso aos dados e status de loading por categoria
  const categoryDataMap = {
    "fixed": { data: fixedExpenseTypes, isLoading: fixedTypesLoading, addModalOpen: showAddFixedExpenseTypeModal, setAddModalOpen: setShowAddFixedExpenseTypeModal },
    "supermarket": { data: supermarkets, isLoading: supermarketsLoading, addModalOpen: showAddSupermarketModal, setAddModalOpen: setShowAddSupermarketModal },
    "food": { data: restaurants, isLoading: restaurantsLoading, addModalOpen: showAddRestaurantModal, setAddModalOpen: setShowAddRestaurantModal },
    "services": { data: serviceTypes, isLoading: serviceTypesLoading, addModalOpen: addServiceTypeModalOpen, setAddModalOpen: setAddServiceTypeModalOpen },
    "study": { data: studyTypes, isLoading: studyTypesLoading, addModalOpen: addStudyTypeModalOpen, setAddModalOpen: setAddStudyTypeModalOpen },
    "leisure": { data: leisureTypes, isLoading: leisureTypesLoading, addModalOpen: addLeisureTypeModalOpen, setAddModalOpen: setAddLeisureTypeModalOpen },
    "personal-care": { data: personalCareTypes, isLoading: personalCareTypesLoading, addModalOpen: addPersonalCareTypeModalOpen, setAddModalOpen: setAddPersonalCareTypeModalOpen },
    "shopping": { data: shops, isLoading: shopsLoading, addModalOpen: addShopModalOpen, setAddModalOpen: setAddShopModalOpen },
    "transportation": { data: places, isLoading: placesLoading, addModalOpen: addPlaceModalOpen, setAddModalOpen: setAddPlaceModalOpen },
    "health": { data: healthTypes, isLoading: healthTypesLoading, addModalOpen: addHealthTypeModalOpen, setAddModalOpen: setAddHealthTypeModalOpen },
    "family": { data: familyMembers, isLoading: familyMembersLoading, addModalOpen: addFamilyMemberModalOpen, setAddModalOpen: setAddFamilyMemberModalOpen },
    "charity": { data: charityTypes, isLoading: charityTypesLoading, addModalOpen: addCharityTypeModalOpen, setAddModalOpen: setAddCharityTypeModalOpen },
  };
 

  // HOOKS PARA LIDAR COM A CRIAÇÃO E ATUALIZAÇÃO DE DESPESAS
  //-------------------------------------------------------------------------------
  const createExpenseMutation = useMutation<RecentExpense, Error, any>({
    mutationFn: async (data: any): Promise<RecentExpense> => {
      const response = await apiRequest("POST", "/api/expenses", data);
      return response as RecentExpense; // Asserte o tipo de retorno
    },
    onSuccess: (newExpense) => {
      const purchaseDate = new Date(newExpense.purchaseDate);
      const year = purchaseDate.getFullYear();
      const month = purchaseDate.getMonth() + 1; // getMonth() é 0-indexado

      // Invalida o "Painel"
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/monthly"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/category-breakdown", new Date().getFullYear()] });

      // Invalida a "Visualização Mensal" para o mês/ano do gasto
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/monthly", year, month] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/category-breakdown", year, month] });

      // Invalida as "Estatísticas Anuais" para o ano do gasto
      queryClient.invalidateQueries({ queryKey: ["/api/stats/annual", year] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/yearly/monthly-summary", year] });

      toast({ title: "Sucesso", description: "Gasto adicionado!" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error("Erro ao adicionar gasto:", error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao adicionar gasto. Por favor, tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Mutação para atualizar um gasto existente
  const updateExpenseMutation = useMutation<RecentExpense, Error, { id: number, expense: any }>({
    mutationFn: async (data): Promise<RecentExpense> => {
      const response = await apiRequest("PATCH", `/api/expenses/${data.id}`, data.expense);
      return response as RecentExpense; // Asserte o tipo de retorno
    },
    onSuccess: (updatedExpense) => {
      const purchaseDate = new Date(updatedExpense.purchaseDate);
      const year = purchaseDate.getFullYear();
      const month = purchaseDate.getMonth() + 1;

      // Invalida o "Painel"
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/monthly"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/category-breakdown", new Date().getFullYear()] });

      // Invalida a "Visualização Mensal" para o mês/ano do gasto
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/monthly", year, month] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/category-breakdown", year, month] });

      // Invalida as "Estatísticas Anuais" para o ano do gasto
      queryClient.invalidateQueries({ queryKey: ["/api/stats/annual", year] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/yearly/monthly-summary", year] });

      toast({ title: "Sucesso", description: "Gasto atualizado!" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar gasto:", error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar gasto. Por favor, tente novamente.",
        variant: "destructive",
      });
    },
  });


  // ON SUBMIT: Função para lidar com o envio do formulário (para criar OU atualizar)
  const onSubmit = (data: ExpenseFormData) => {

    // Apenas envia campos que estão preenchidos ou que são relevantes para o tipo de gasto
    const expenseData: { [key: string]: any } = {
      amount: parseFloat(data.amount),
      purchaseDate: new Date(data.purchaseDate),
      paymentMethod: data.paymentMethod,
      expenseType: data.expenseType,
    };

    // Ajusta a categoria de rotina e o grupo ocasional com base no expenseType
    if (data.expenseType === "routine") {
      expenseData.routineCategory = data.routineCategory || null;
      expenseData.occasionalGroupId = null; // Zera o ID do grupo ocasional se o tipo for rotina
    } else { // expenseType === "occasional"
      expenseData.occasionalGroupId = data.occasionalGroupId ? Number(data.occasionalGroupId) : null;
      expenseData.routineCategory = data.routineCategory || null; // Mantenha routineCategory se selecionado
    }

    // Zera os campos de subcategoria se não corresponderem à routineCategory selecionada
    // OU se o expenseType for 'occasional' (para garantir limpeza, embora a UI não os mostre)
    // A lógica de `data.routineCategory !== "x"` já faz o trabalho.
    // Não precisamos mais do `else` extenso em cada `if`.
    // Isso garante que apenas os campos da categoria selecionada sejam mantidos.

    // Campos de subcategoria 'fixed'
    if (data.routineCategory !== "fixed") {
      expenseData.fixedExpenseTypeId = null;
      expenseData.frequency = null;
    } else {
      expenseData.fixedExpenseTypeId = data.fixedExpenseTypeId ? Number(data.fixedExpenseTypeId) : null;
      expenseData.frequency = data.frequency || null;
    }

    // Campos de subcategoria 'supermarket'
    if (data.routineCategory !== "supermarket") {
      expenseData.supermarketId = null;
    } else {
      expenseData.supermarketId = data.supermarketId ? Number(data.supermarketId) : null;
    }

    // Campos de subcategoria 'food'
    if (data.routineCategory !== "food") {
      expenseData.restaurantId = null;
      expenseData.occasionType = null;
      expenseData.specialOccasionDescription = null;
      expenseData.foodPurchaseType = null;
    } else {
      expenseData.restaurantId = data.restaurantId ? Number(data.restaurantId) : null;
      expenseData.occasionType = data.occasionType || null;
      expenseData.specialOccasionDescription = (data.occasionType === "special" && data.specialOccasionDescription) ? data.specialOccasionDescription : null;
      expenseData.foodPurchaseType = data.foodPurchaseType || null;
    }

    // Campos de subcategoria 'services'
    if (data.routineCategory !== "services") {
      expenseData.serviceTypeId = null;
      expenseData.serviceDescription = null;
    } else {
      expenseData.serviceTypeId = data.serviceTypeId ? Number(data.serviceTypeId) : null;
      expenseData.serviceDescription = data.serviceDescription || null;
    }

    // Campos de subcategoria 'study' 
  if (data.routineCategory !== "study") {
    expenseData.studyTypeId = null;
    expenseData.studyDescription = null;
  } else {
    expenseData.studyTypeId = data.studyTypeId ? Number(data.studyTypeId) : null;
    expenseData.studyDescription = data.studyDescription || null;
  }

    // Campos de subcategoria 'leisure'
    if (data.routineCategory !== "leisure") {
      expenseData.leisureTypeId = null;
      expenseData.leisureDescription = null;
    } else {
      expenseData.leisureTypeId = data.leisureTypeId ? Number(data.leisureTypeId) : null;
      expenseData.leisureDescription = data.leisureDescription || null;
    }

    // Campos de subcategoria 'personal-care'
    if (data.routineCategory !== "personal-care") {
      expenseData.personalCareTypeId = null;
      expenseData.personalCareDescription = null;
    } else {
      expenseData.personalCareTypeId = data.personalCareTypeId ? Number(data.personalCareTypeId) : null;
      expenseData.personalCareDescription = data.personalCareDescription || null;
    }

    // Campos de subcategoria 'shopping'
    if (data.routineCategory !== "shopping") {
      expenseData.shopId = null;
      expenseData.shoppingPurchaseType = null;
      expenseData.shoppingOccasionType = null;
      expenseData.shoppingSpecialOccasionDescription = null;
    } else {
      expenseData.shopId = data.shopId ? Number(data.shopId) : null;
      expenseData.shoppingPurchaseType = data.shoppingPurchaseType || null;
      expenseData.shoppingOccasionType = data.shoppingOccasionType || null;
      expenseData.shoppingSpecialOccasionDescription = (data.shoppingOccasionType === "special" && data.shoppingSpecialOccasionDescription) ? data.shoppingSpecialOccasionDescription : null;
    }

    // Campos de subcategoria 'transportation'
    if (data.routineCategory !== "transportation") {
      expenseData.startPlaceId = null;
      expenseData.endPlaceId = null;
      expenseData.startingPoint = null;
      expenseData.destination = null;
      expenseData.transportMode = null;
      expenseData.transportDescription = null;
    } else {
      expenseData.startPlaceId = data.startPlaceId ? Number(data.startPlaceId) : null;
      expenseData.endPlaceId = data.endPlaceId ? Number(data.endPlaceId) : null;
      expenseData.startingPoint = data.startingPoint || null;
      expenseData.destination = data.destination || null;
      expenseData.transportMode = data.transportMode || null;
      expenseData.transportDescription = data.transportDescription || null;
    }

    // Campos de subcategoria 'health'
    if (data.routineCategory !== "health") {
      expenseData.healthTypeId = null;
      expenseData.healthDescription = null;
    } else {
      expenseData.healthTypeId = data.healthTypeId ? Number(data.healthTypeId) : null;
      expenseData.healthDescription = data.healthDescription || null;
    }

    // Campos de subcategoria 'family'
    if (data.routineCategory !== "family") {
      expenseData.familyMemberId = null;
      expenseData.familyDescription = null;
    } else {
      expenseData.familyMemberId = data.familyMemberId ? Number(data.familyMemberId) : null;
      expenseData.familyDescription = data.familyDescription || null;
    }

    // Campos de subcategoria 'charity'
    if (data.routineCategory !== "charity") {
      expenseData.charityTypeId = null;
      expenseData.charityDescription = null;
    } else {
      expenseData.charityTypeId = data.charityTypeId ? Number(data.charityTypeId) : null;
      expenseData.charityDescription = data.charityDescription || null;
    }

    if (data.expenseType === "occasional") {
      expenseData.occasionalGroupId = data.occasionalGroupId ? Number(data.occasionalGroupId) : null;
    } else { // expenseType === "routine"
      expenseData.occasionalGroupId = null;
    }

    if (expenseToEdit?.id) {
      updateExpenseMutation.mutate({ id: expenseToEdit.id, expense: expenseData });
    } else {
      createExpenseMutation.mutate(expenseData);
    }
  };


  // ADD NEW BUTTON: Componente para adicionar novos itens (funcionalidade auxiliar)
  const AddNewButton = ({ onClick, label, isLoading = false }: {
    onClick: () => void;
    label: string;
    isLoading?: boolean;
  }) => (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className="ml-2 h-9"
      disabled={isLoading}
    >
      <Plus className="mr-2 h-4 w-4" />
      {isLoading ? "Carregando..." : label}
    </Button>
  );

  // RENDERIZAÇÃO DO COMPONENTE
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{expenseToEdit ? "Editar Gasto" : "Adicione nova despesa"}</DialogTitle>
          <DialogDescription>
            {expenseToEdit ? "Modifique os detalhes do gasto existente." : "Preencha os detalhes da sua nova despesa."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* 1. Data do Gasto, Valor */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do gasto</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                        <Input type="number" step="0.01" placeholder="0.00" className="pl-8" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 2. Forma de Pagamento */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de pagamento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione a forma de pagamento" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pix">Pix</SelectItem>
                      <SelectItem value="debit-card">Cartão de Débito</SelectItem>
                      <SelectItem value="credit-card">Cartão de Crédito</SelectItem>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="bank-transfer">Transferência Bancária</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2.1 Status do pagamento */}
            <FormField
            control={form.control}
            name="paymentStatus"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Status de Pagamento</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value || "pending"}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="pending" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Não Pago (Previsto)
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="paid" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Pago
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

            {/* 3. Tipo de Gasto (Rotina ou Ocasião) */}
            <FormField
              control={form.control}
              name="expenseType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de gasto</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("occasionalGroupId", undefined);
                        form.setValue("routineCategory", undefined); // Zera routineCategory aqui!

                        // Zera todos os outros campos específicos de subcategorias para garantir limpeza
                        form.setValue("fixedExpenseTypeId", undefined);
                        form.setValue("frequency", undefined);
                        form.setValue("supermarketId", undefined);
                        form.setValue("restaurantId", undefined);
                        form.setValue("occasionType", undefined);
                        form.setValue("specialOccasionDescription", undefined);
                        form.setValue("foodPurchaseType", undefined);
                        form.setValue("serviceTypeId", undefined);
                        form.setValue("serviceDescription", undefined);
                        form.setValue("studyTypeId", undefined);
                        form.setValue("studyDescription", undefined);
                        form.setValue("leisureTypeId", undefined);
                        form.setValue("leisureDescription", undefined);
                        form.setValue("personalCareTypeId", undefined);
                        form.setValue("personalCareDescription", undefined);
                        form.setValue("shopId", undefined);
                        form.setValue("shoppingPurchaseType", undefined);
                        form.setValue("shoppingOccasionType", undefined);
                        form.setValue("shoppingSpecialOccasionDescription", undefined);
                        form.setValue("startPlaceId", undefined);
                        form.setValue("endPlaceId", undefined);
                        form.setValue("startingPoint", undefined);
                        form.setValue("destination", undefined);
                        form.setValue("transportMode", undefined);
                        form.setValue("transportDescription", undefined);
                        form.setValue("healthTypeId", undefined);
                        form.setValue("healthDescription", undefined);
                        form.setValue("familyMemberId", undefined);
                        form.setValue("familyDescription", undefined);
                        form.setValue("charityTypeId", undefined);
                        form.setValue("charityDescription", undefined);
                      }}
                      value={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="routine" id="routine" />
                        <label htmlFor="routine" className="flex-1 cursor-pointer">
                          <div className="text-center">
                            <Calendar className="mx-auto mb-2 h-6 w-6 text-primary" />
                            <p className="font-medium">Gasto de Rotina</p>
                            <p className="text-sm text-muted-foreground">Gastos recorrentes</p>
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="occasional" id="occasional" />
                        <label htmlFor="occasional" className="flex-1 cursor-pointer">
                          <div className="text-center">
                            <Star className="mx-auto mb-2 h-6 w-6 text-accent" />
                            <p className="font-medium">Gasto de Ocasião</p>
                            <p className="text-sm text-muted-foreground">Gastos de situações especiais</p>
                          </div>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 4. Seleção de Grupo Ocasionais (APARECE ANTES DA ROTINA se expenseType for "occasional") */}
            {expenseType === "occasional" && (
              <FormField
                control={form.control}
                name="occasionalGroupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grupo de Gastos Ocasionais</FormLabel>
                    <div className="flex items-end space-x-2">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={occasionalGroupsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={occasionalGroupsLoading ? "Carregando..." : "Selecione um grupo"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {occasionalGroups.length === 0 && !occasionalGroupsLoading ? (
                            <SelectItem value="no-groups" disabled>Nenhum grupo disponível</SelectItem>
                          ) : (
                            occasionalGroups.map((group) => (
                              <SelectItem key={group.id} value={group.id.toString()}>{group.name}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <AddNewButton
                        onClick={() => setAddOccasionalGroupModalOpen(true)}
                        label="Adicionar Novo"
                        isLoading={occasionalGroupsLoading}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* 5. Categorias de Gastos */}
            <FormField
              control={form.control}
              name="routineCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categorias de Gastos</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Ao mudar a rotineCategory, zera os outros campos de rotina (filhos)
                      form.setValue("fixedExpenseTypeId", undefined);
                      form.setValue("frequency", undefined);
                      form.setValue("supermarketId", undefined);
                      form.setValue("restaurantId", undefined);
                      form.setValue("occasionType", undefined);
                      form.setValue("specialOccasionDescription", undefined);
                      form.setValue("foodPurchaseType", undefined);
                      form.setValue("serviceTypeId", undefined);
                      form.setValue("serviceDescription", undefined);
                      form.setValue("studyTypeId", undefined);
                      form.setValue("studyDescription", undefined);
                      form.setValue("leisureTypeId", undefined);
                      form.setValue("leisureDescription", undefined);
                      form.setValue("personalCareTypeId", undefined);
                      form.setValue("personalCareDescription", undefined);
                      form.setValue("shopId", undefined);
                      form.setValue("shoppingPurchaseType", undefined);
                      form.setValue("shoppingOccasionType", undefined);
                      form.setValue("shoppingSpecialOccasionDescription", undefined);
                      form.setValue("startPlaceId", undefined);
                      form.setValue("endPlaceId", undefined);
                      form.setValue("startingPoint", undefined);
                      form.setValue("destination", undefined);
                      form.setValue("transportMode", undefined);
                      form.setValue("transportDescription", undefined);
                      form.setValue("healthTypeId", undefined);
                      form.setValue("healthDescription", undefined);
                      form.setValue("familyMemberId", undefined);
                      form.setValue("familyDescription", undefined);
                      form.setValue("charityTypeId", undefined);
                      form.setValue("charityDescription", undefined);
                    }}
                    value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fixed">Fixos</SelectItem>
                      <SelectItem value="supermarket">Supermercado</SelectItem>
                      <SelectItem value="food">Alimentação</SelectItem>
                      <SelectItem value="services">Serviços</SelectItem>
                      <SelectItem value="study">Estudos</SelectItem>
                      <SelectItem value="leisure">Lazer</SelectItem>
                      <SelectItem value="personal-care">Cuidado Pessoal</SelectItem>
                      <SelectItem value="shopping">Compras</SelectItem>
                      <SelectItem value="transportation">Transporte</SelectItem>
                      <SelectItem value="health">Saúde</SelectItem>
                      <SelectItem value="family">Família</SelectItem>
                      <SelectItem value="charity">Caridade</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CAMPOS ESPECÍFICOS DE SUBCATEGORIAS */}

            <div className="space-y-6">
              {routineCategory === "fixed" && (
                <div className="space-y-4">
                  <div className="flex items-end space-x-2">
                    <FormField
                      control={form.control}
                      name="fixedExpenseTypeId"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Tipo de despesa fixa</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            disabled={fixedTypesLoading}
                          >
                            <FormControl><SelectTrigger><SelectValue placeholder={fixedTypesLoading ? "Carregando..." : "Selecione o tipo de despesa fixa"} /></SelectTrigger></FormControl>
                            <SelectContent>
                              {fixedExpenseTypes.length === 0 && !fixedTypesLoading ? (
                                <SelectItem value="no-items" disabled>Nenhum tipo disponível</SelectItem>
                              ) : (
                                fixedExpenseTypes.map((type) => (<SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <AddNewButton onClick={() => setShowAddFixedExpenseTypeModal(true)} label="Adicionar Novo" isLoading={fixedTypesLoading} />
                  </div>
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequência</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecione a frequência desse gasto" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="weekly">Semanalmente</SelectItem>
                            <SelectItem value="monthly">Mensalmente</SelectItem>
                            <SelectItem value="semi-annually">Semestralmente</SelectItem>
                            <SelectItem value="annually">Anualmente</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {routineCategory === "supermarket" && (
                <div className="flex items-end space-x-2">
                  <FormField
                    control={form.control}
                    name="supermarketId"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Supermercado</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={supermarketsLoading}
                        >
                          <FormControl><SelectTrigger><SelectValue placeholder={supermarketsLoading ? "Carregando..." : "Selecione o supermercado"} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {supermarkets.length === 0 && !supermarketsLoading ? (
                              <SelectItem value="no-items" disabled>Nenhum supermercado disponível</SelectItem>
                            ) : (
                              supermarkets.map((supermarket) => (<SelectItem key={supermarket.id} value={supermarket.id.toString()}>{supermarket.name}</SelectItem>))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <AddNewButton onClick={() => setShowAddSupermarketModal(true)} label="Adicionar Novo" isLoading={supermarketsLoading} />
                </div>
              )}
              {routineCategory === "food" && (
                <div className="space-y-4">
                  <div className="flex items-end space-x-2">
                    <FormField control={form.control} name="restaurantId" render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Restaurante</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={restaurantsLoading}
                        >
                          <FormControl><SelectTrigger><SelectValue placeholder={restaurantsLoading ? "Carregando..." : "Selecione o restaurante"} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {restaurants.length === 0 && !restaurantsLoading ? (
                              <SelectItem value="no-items" disabled>Nenhum restaurante disponível</SelectItem>
                            ) : (
                              restaurants.map((restaurant) => (<SelectItem key={restaurant.id} value={restaurant.id.toString()}>{restaurant.name}</SelectItem>))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <AddNewButton onClick={() => setShowAddRestaurantModal(true)} label="Adicionar Novo" />
                  </div>
                  <FormField control={form.control} name="foodPurchaseType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma de Pedido</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value || ""} className="flex space-x-4">
                          <div className="flex items-center space-x-2"><RadioGroupItem value="in-person" id="food-in-person" /><label htmlFor="food-in-person">No local</label></div>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="online" id="food-online" /><label htmlFor="food-online">À distância</label></div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="occasionType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ocasião</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value || ""} className="flex space-x-4">
                          <div className="flex items-center space-x-2"><RadioGroupItem value="normal" id="occasion-normal" /><label htmlFor="occasion-normal">Normal</label></div>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="special" id="occasion-special" /><label htmlFor="occasion-special">Especial</label></div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  {watchedValues.occasionType === "special" && (
                    <FormField control={form.control} name="specialOccasionDescription" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição da Ocasião Especial</FormLabel>
                        <FormControl><Textarea placeholder="ex: aniversário de alguém, celebração de algo..." rows={2} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                </div>
              )}
              {routineCategory === "services" && (
                <div className="space-y-4">
                  <div className="flex items-end space-x-2">
                    <FormField
                      control={form.control}
                      name="serviceTypeId"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Tipo de Serviço</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            disabled={serviceTypesLoading}
                          >
                            <FormControl><SelectTrigger><SelectValue placeholder={serviceTypesLoading ? "Carregando..." : "Selecione o tipo de serviço"} /></SelectTrigger></FormControl>
                            <SelectContent>
                              {serviceTypes.length === 0 && !serviceTypesLoading ? (
                                <SelectItem value="no-items" disabled>Nenhum tipo disponível</SelectItem>
                              ) : (
                                serviceTypes.map((type) => (<SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <AddNewButton onClick={() => setAddServiceTypeModalOpen(true)} label="Adicionar Novo" />
                  </div>
                  <FormField
                    control={form.control}
                    name="serviceDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição do Serviço</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o serviço (ex: troca de óleo, limpeza da casa)..."
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {routineCategory === "study" && ( 
            <div className="space-y-4">
              <div className="flex items-end space-x-2">
                <FormField
                  control={form.control}
                  name="studyTypeId"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Tipo de Estudo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={studyTypesLoading}
                      >
                        <FormControl><SelectTrigger><SelectValue placeholder={studyTypesLoading ? "Carregando..." : "Selecione o tipo de estudo"} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {studyTypes.length === 0 && !studyTypesLoading ? (
                            <SelectItem value="no-items" disabled>Nenhum tipo disponível</SelectItem>
                          ) : (
                            studyTypes.map((type) => (<SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <AddNewButton onClick={() => setAddStudyTypeModalOpen(true)} label="Adicionar Novo" />
              </div>
              <FormField
                control={form.control}
                name="studyDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição do Estudo</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o gasto (ex: mensalidade faculdade, material didático, curso online)..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
              {routineCategory === "leisure" && (
                <div className="space-y-4">
                  <div className="flex items-end space-x-2">
                    <FormField
                      control={form.control}
                      name="leisureTypeId"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Tipo de Lazer</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            disabled={leisureTypesLoading}
                          >
                            <FormControl><SelectTrigger><SelectValue placeholder={leisureTypesLoading ? "Carregando..." : "Selecione o tipo de lazer"} /></SelectTrigger></FormControl>
                            <SelectContent>
                              {leisureTypes.length === 0 && !leisureTypesLoading ? (
                                <SelectItem value="no-items" disabled>Nenhum tipo disponível</SelectItem>
                              ) : (
                                leisureTypes.map((type) => (<SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <AddNewButton onClick={() => setAddLeisureTypeModalOpen(true)} label="Adicionar Novo" />
                  </div>
                  <FormField
                    control={form.control}
                    name="leisureDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição do Lazer</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva a atividade de lazer (ex: cinema, rolê com amigos)..."
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {routineCategory === "personal-care" && (
                <div className="space-y-4">
                  <div className="flex items-end space-x-2">
                    <FormField
                      control={form.control}
                      name="personalCareTypeId"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Tipo de Cuidado Pessoal</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            disabled={personalCareTypesLoading}
                          >
                            <FormControl><SelectTrigger><SelectValue placeholder={personalCareTypesLoading ? "Carregando..." : "Selecione o tipo de cuidado pessoal"} /></SelectTrigger></FormControl>
                            <SelectContent>
                              {personalCareTypes.length === 0 && !personalCareTypesLoading ? (
                                <SelectItem value="no-items" disabled>Nenhum tipo disponível</SelectItem>
                              ) : (
                                personalCareTypes.map((type) => (<SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <AddNewButton onClick={() => setAddPersonalCareTypeModalOpen(true)} label="Adicionar Novo" />
                  </div>
                  <FormField
                    control={form.control}
                    name="personalCareDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição do Cuidado Pessoal</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o gasto (ex: salão de beleza, produtos de cabelo)..."
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {routineCategory === "shopping" && (
                <div className="space-y-4">
                  <div className="flex items-end space-x-2">
                    <FormField
                      control={form.control}
                      name="shopId"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Loja</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            disabled={shopsLoading}
                          >
                            <FormControl><SelectTrigger><SelectValue placeholder={shopsLoading ? "Carregando..." : "Selecione a loja"} /></SelectTrigger></FormControl>
                            <SelectContent>
                              {shops.length === 0 && !shopsLoading ? (
                                <SelectItem value="no-items" disabled>Nenhuma loja disponível</SelectItem>
                              ) : (
                                shops.map((shop) => (<SelectItem key={shop.id} value={shop.id.toString()}>{shop.name}</SelectItem>))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <AddNewButton onClick={() => setAddShopModalOpen(true)} label="Adicionar Novo" />
                  </div>
                  <FormField
                    control={form.control}
                    name="shoppingPurchaseType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Compra</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} value={field.value || ""} className="flex space-x-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="in-person" id="shopping-in-person" /><label htmlFor="shopping-in-person">Presencial</label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="online" id="shopping-online" /><label htmlFor="shopping-online">Online</label></div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shoppingOccasionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ocasião da Compra</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} value={field.value || ""} className="flex space-x-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="normal" id="shopping-occasion-normal" /><label htmlFor="shopping-occasion-normal">Normal</label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="special" id="shopping-occasion-special" /><label htmlFor="shopping-occasion-special">Especial</label></div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {watchedValues.shoppingOccasionType === "special" && (
                    <FormField control={form.control} name="shoppingSpecialOccasionDescription" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição da Ocasião Especial</FormLabel>
                        <FormControl><Textarea placeholder="ex: presente para alguém..." rows={2} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                </div>
              )}
              {routineCategory === "transportation" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-end space-x-2">
                      <FormField
                        control={form.control}
                        name="startPlaceId"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Ponto de Partida</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                              disabled={placesLoading}
                            >
                              <FormControl><SelectTrigger><SelectValue placeholder={placesLoading ? "Carregando..." : "Selecione o ponto de partida"} /></SelectTrigger></FormControl>
                              <SelectContent>
                                {places.length === 0 && !placesLoading ? (
                                  <SelectItem value="no-items" disabled>Nenhum lugar disponível</SelectItem>
                                ) : (
                                  places.map((place) => (<SelectItem key={place.id} value={place.id.toString()}>{place.name}</SelectItem>))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <AddNewButton onClick={() => setAddPlaceModalOpen(true)} label="Adicionar Novo" />
                    </div>
                    <div className="flex items-end space-x-2">
                      <FormField
                        control={form.control}
                        name="endPlaceId"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Ponto de Destino</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                              disabled={placesLoading}
                            >
                              <FormControl><SelectTrigger><SelectValue placeholder={placesLoading ? "Carregando..." : "Selecione o ponto de destino"} /></SelectTrigger></FormControl>
                              <SelectContent>
                                {places.length === 0 && !placesLoading ? (
                                  <SelectItem value="no-items" disabled>Nenhum lugar disponível</SelectItem>
                                ) : (
                                  places.map((place) => (<SelectItem key={place.id} value={place.id.toString()}>{place.name}</SelectItem>))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <AddNewButton onClick={() => setAddPlaceModalOpen(true)} label="Adicionar Novo" />
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name="transportMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meio de Transporte</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecione o meio de transporte" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="car">Carro</SelectItem>
                            <SelectItem value="uber">Uber</SelectItem>
                            <SelectItem value="bus">Ônibus</SelectItem>
                            <SelectItem value="plane">Avião</SelectItem>
                            <SelectItem value="subway">Metrô</SelectItem>
                            <SelectItem value="another">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="transportDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição da Viagem</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva a viagem (ex: viagem para o trabalho, volta para casa)..."
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {routineCategory === "health" && (
                <div className="space-y-4">
                  <div className="flex items-end space-x-2">
                    <FormField
                      control={form.control}
                      name="healthTypeId"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Tipo de Demanda de Saúde</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            disabled={healthTypesLoading}
                          >
                            <FormControl><SelectTrigger><SelectValue placeholder={healthTypesLoading ? "Carregando..." : "Selecione o tipo de demanda de saúde"} /></SelectTrigger></FormControl>
                            <SelectContent>
                              {healthTypes.length === 0 && !healthTypesLoading ? (
                                <SelectItem value="no-items" disabled>Nenhum tipo disponível</SelectItem>
                              ) : (
                                healthTypes.map((type) => (<SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <AddNewButton onClick={() => setAddHealthTypeModalOpen(true)} label="Adicionar Novo" />
                  </div>
                  <FormField
                    control={form.control}
                    name="healthDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição da Despesa de Saúde</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o gasto (ex: consulta médica, remédios, exames)..."
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {routineCategory === "family" && (
                <div className="space-y-4">
                  <div className="flex items-end space-x-2">
                    <FormField
                      control={form.control}
                      name="familyMemberId"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Membro da Família</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            disabled={familyMembersLoading}
                          >
                            <FormControl><SelectTrigger><SelectValue placeholder={familyMembersLoading ? "Carregando..." : "Selecione o membro da família"} /></SelectTrigger></FormControl>
                            <SelectContent>
                              {familyMembers.length === 0 && !familyMembersLoading ? (
                                <SelectItem value="no-items" disabled>Nenhum membro disponível</SelectItem>
                              ) : (
                                familyMembers.map((member) => (<SelectItem key={member.id} value={member.id.toString()}>{member.name}</SelectItem>))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <AddNewButton onClick={() => setAddFamilyMemberModalOpen(true)} label="Adicionar Novo" />
                  </div>
                  <FormField
                    control={form.control}
                    name="familyDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição da Despesa Familiar</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o gasto (ex: presente para o irmão, consertar algo em casa)..."
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {routineCategory === "charity" && (
                <div className="space-y-4">
                  <div className="flex items-end space-x-2">
                    <FormField
                      control={form.control}
                      name="charityTypeId"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Tipo de Caridade</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            disabled={charityTypesLoading}
                          >
                            <FormControl><SelectTrigger><SelectValue placeholder={charityTypesLoading ? "Carregando..." : "Selecione o tipo de caridade"} /></SelectTrigger></FormControl>
                            <SelectContent>
                              {charityTypes.length === 0 && !charityTypesLoading ? (
                                <SelectItem value="no-items" disabled>Nenhum tipo disponível</SelectItem>
                              ) : (
                                charityTypes.map((type) => (<SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <AddNewButton onClick={() => setAddCharityTypeModalOpen(true)} label="Adicionar Novo" />
                  </div>
                  <FormField
                    control={form.control}
                    name="charityDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição da Despesa de Caridade</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva a doação (ex: doação para orfanato, ajuda em situação de catástrofe)..."
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>


            {/* Ações do formulário: Botões "Cancelar" e "Salvar" */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createExpenseMutation.isPending || updateExpenseMutation.isPending}>
                {createExpenseMutation.isPending ? "Salvando..." : (updateExpenseMutation.isPending ? "Atualizando..." : (expenseToEdit ? "Atualizar Gasto" : "Salvar Gasto"))}
              </Button>
            </div>

          </form>
        </Form>

      </DialogContent>

      {/* LOCALIZAÇÃO DOS MODAIS ADICIONAIS: Renderizados aqui, fora do <form> mas dentro do <Dialog> */}

      <AddOccasionalGroupModal
        open={addOccasionalGroupModalOpen}
        onOpenChange={setAddOccasionalGroupModalOpen}
      />
      <AddFixedExpenseTypeModal
        open={showAddFixedExpenseTypeModal}
        onOpenChange={setShowAddFixedExpenseTypeModal}
      />
      <AddSupermarketModal
        open={showAddSupermarketModal}
        onOpenChange={setShowAddSupermarketModal}
      />
      <AddRestaurantModal
        open={showAddRestaurantModal}
        onOpenChange={setShowAddRestaurantModal}
      />
      <AddServiceTypeModal
        open={addServiceTypeModalOpen}
        onOpenChange={setAddServiceTypeModalOpen}
      />
      <AddStudyTypeModal 
      open={addStudyTypeModalOpen}
      onOpenChange={setAddStudyTypeModalOpen}
      />
      <AddLeisureTypeModal
        open={addLeisureTypeModalOpen}
        onOpenChange={setAddLeisureTypeModalOpen}
      />
      <AddPersonalCareTypeModal
        open={addPersonalCareTypeModalOpen}
        onOpenChange={setAddPersonalCareTypeModalOpen}
      />
      <AddShopModal
        open={addShopModalOpen}
        onOpenChange={setAddShopModalOpen}
      />
      <AddPlaceModal
        open={addPlaceModalOpen}
        onOpenChange={setAddPlaceModalOpen}
      />
      <AddHealthTypeModal
        open={addHealthTypeModalOpen}
        onOpenChange={setAddHealthTypeModalOpen}
      />
      <AddFamilyMemberModal
        open={addFamilyMemberModalOpen}
        onOpenChange={setAddFamilyMemberModalOpen}
      />
      <AddCharityTypeModal
        open={addCharityTypeModalOpen}
        onOpenChange={setAddCharityTypeModalOpen}
      />
    </Dialog>
  );
};