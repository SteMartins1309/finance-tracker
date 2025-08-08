// src/components/AddRecurringExpenseModal.tsx

import { useEffect, useState } from "react";
import { useForm, UseFormSetValue } from "react-hook-form"; // Importar UseFormSetValue
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Star, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// IMPORTS DE MODAIS DE ADIÇÃO DE NOVOS COMPONENTES OU ITENS (igual ao AddExpenseModal)
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

// Importa a interface RecurringExpense do dashboard.tsx
import { RecentExpense, RecurringExpense } from "@/types/finance";


// Define os tipos literais para os enums (replicados do schema ou onde forem definidos)
type PaymentMethodType = "pix" | "credit-card" | "debit-card" | "cash" | "bank-transfer";
type ExpenseTypeType = "routine" | "occasional";
type RoutineCategoryType = "fixed" | "supermarket" | "food" | "services" | "study" | "leisure" | "personal-care" | "shopping" | "transportation" | "health" | "family" | "charity";
type FrequencyType = "weekly" | "monthly" | "semi-annually" | "annually";
type OccasionTypeType = "normal" | "special";
type FoodPurchaseTypeType = "in-person" | "online";
type ShoppingPurchaseTypeType = "in-person" | "online";
type ShoppingOccasionTypeType = "normal" | "special";
type TransportModeType = "car" | "uber" | "bus" | "plane" | "subway" | "another";
type RecurrenceType = "undetermined" | "paused" | "determined"; // NOVO: Tipo de recorrência

// SCHEMA: Define o esquema de validação para o formulário de adição/edição de recorrência
const recurringExpenseFormSchema = z.object({
  name: z.string().min(1, "O nome do gasto recorrente é obrigatório."),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "O valor deve ser um número positivo.",
  }),
  startDate: z.string().min(1, "A data de início é obrigatória."),
  paymentMethod: z.enum(["pix", "credit-card", "debit-card", "cash", "bank-transfer"]),
  expenseType: z.enum(["routine", "occasional"]),
  recurrenceType: z.enum(["undetermined", "paused", "determined"]),
  installmentsTotal: z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return null;
      const num = Number(val);
      return isNaN(num) ? null : num; // Retorna null se não for um número válido
    },
    z.number().int().nullable().optional() // Permite number | null | undefined
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
  
  // Campos de subcategoria (todos opcionais e nullables para o Zod do formulário)
  routineCategory: z.enum([
    "fixed", "supermarket", "food", "services", "study", "leisure", "personal-care",
    "shopping", "transportation", "health", "family", "charity",
  ]).optional().nullable(),
  occasionalGroupId: z.string().optional().nullable(),

  fixedExpenseTypeId: z.string().optional().nullable(),
  frequency: z.enum(["weekly", "monthly", "semi-annually", "annually"]).optional().nullable(),
  supermarketId: z.string().optional().nullable(),
  restaurantId: z.string().optional().nullable(),
  occasionType: z.enum(["normal", "special"]).optional().nullable(),
  specialOccasionDescription: z.string().optional().nullable(),
  foodPurchaseType: z.enum(["in-person", "online"]).optional().nullable(),
  serviceTypeId: z.string().optional().nullable(),
  serviceDescription: z.string().optional().nullable(),
  studyTypeId: z.string().optional().nullable(),
  studyDescription: z.string().optional().nullable(),
  leisureTypeId: z.string().optional().nullable(),
  leisureDescription: z.string().optional().nullable(),
  personalCareTypeId: z.string().optional().nullable(),
  personalCareDescription: z.string().optional().nullable(),
  shopId: z.string().optional().nullable(),
  shoppingPurchaseType: z.enum(["in-person", "online"]).optional().nullable(),
  shoppingOccasionType: z.enum(["normal", "special"]).optional().nullable(),
  shoppingSpecialOccasionDescription: z.string().optional().nullable(),
  startPlaceId: z.string().optional().nullable(),
  endPlaceId: z.string().optional().nullable(),
  startingPoint: z.string().optional().nullable(),
  destination: z.string().optional().nullable(),
  transportMode: z.enum(["car", "uber", "bus", "plane", "subway", "another"]).optional().nullable(),
  transportDescription: z.string().optional().nullable(),
  healthTypeId: z.string().optional().nullable(),
  healthDescription: z.string().optional().nullable(),
  familyMemberId: z.string().optional().nullable(),
  familyDescription: z.string().optional().nullable(),
  charityTypeId: z.string().optional().nullable(),
  charityDescription: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  // Lógica de validação condicional para installmentsTotal no frontend
  if (data.recurrenceType === "determined") {
    if (data.installmentsTotal === undefined || data.installmentsTotal === null || Number(data.installmentsTotal) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Número total de parcelas é obrigatório e deve ser um número positivo para recorrência determinada.",
        path: ["installmentsTotal"],
      });
    }
  } else {
    // Para 'undetermined' ou 'paused', installmentsTotal DEVE ser null
    if (data.installmentsTotal !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Número de parcelas não deve ser definido para recorrências indeterminadas ou pausadas.",
        path: ["installmentsTotal"],
      });
    }
  }
});


// TIPO DE DADOS DO FORMULÁRIO
type RecurringExpenseFormData = z.infer<typeof recurringExpenseFormSchema>;


// PROPRIEDADES DO COMPONENTE
interface AddRecurringExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recurringExpenseToEdit?: RecurringExpense | null; // Recebe o gasto recorrente para edição
}

// NOVO: Função auxiliar para limpar campos de subcategoria de forma segura
const clearSubcategoryFields = (setValue: UseFormSetValue<RecurringExpenseFormData>) => {
    // Liste explicitamente todos os campos de subcategoria que podem ser nulos
    setValue("fixedExpenseTypeId", null);
    setValue("frequency", null);
    setValue("supermarketId", null);
    setValue("restaurantId", null);
    setValue("occasionType", null);
    setValue("specialOccasionDescription", null);
    setValue("foodPurchaseType", null);
    setValue("serviceTypeId", null);
    setValue("serviceDescription", null);
    setValue("studyTypeId", null);
    setValue("studyDescription", null);
    setValue("leisureTypeId", null);
    setValue("leisureDescription", null);
    setValue("personalCareTypeId", null);
    setValue("personalCareDescription", null);
    setValue("shopId", null);
    setValue("shoppingPurchaseType", null);
    setValue("shoppingOccasionType", null);
    setValue("shoppingSpecialOccasionDescription", null);
    setValue("startPlaceId", null);
    setValue("endPlaceId", null);
    setValue("startingPoint", null);
    setValue("destination", null);
    setValue("transportMode", null);
    setValue("transportDescription", null);
    setValue("healthTypeId", null);
    setValue("healthDescription", null);
    setValue("familyMemberId", null);
    setValue("familyDescription", null);
    setValue("charityTypeId", null);
    setValue("charityDescription", null);
};


// COMPONENTE PRINCIPAL
export function AddRecurringExpenseModal({ open, onOpenChange, recurringExpenseToEdit }: AddRecurringExpenseModalProps) {

  // Estados para controlar a abertura dos modais de adição de novos itens (subcategorias)
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

  const form = useForm<RecurringExpenseFormData>({
    resolver: zodResolver(recurringExpenseFormSchema),
    defaultValues: {
      name: "",
      amount: "",
      startDate: new Date().toISOString().split("T")[0],
      paymentMethod: "credit-card",
      expenseType: "routine",
      recurrenceType: "undetermined",
      installmentsTotal: undefined, 

      routineCategory: null, occasionalGroupId: null,
      fixedExpenseTypeId: null, frequency: null,
      supermarketId: null, restaurantId: null, occasionType: null, specialOccasionDescription: null, foodPurchaseType: null,
      serviceTypeId: null, serviceDescription: null, studyTypeId: null, studyDescription: null,
      leisureTypeId: null, leisureDescription: null, personalCareTypeId: null, personalCareDescription: null,
      shopId: null, shoppingPurchaseType: null, shoppingOccasionType: null, shoppingSpecialOccasionDescription: null,
      startPlaceId: null, endPlaceId: null, startingPoint: null, destination: null,
      transportMode: null, transportDescription: null, healthTypeId: null, healthDescription: null,
      familyMemberId: null, familyDescription: null, charityTypeId: null, charityDescription: null,
    },
  });

  // Helper para obter a data local formatada YYYY-MM-DD
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Efeito para preencher o formulário quando recurringExpenseToEdit muda (para edição)
  useEffect(() => {
    if (open && recurringExpenseToEdit) { // Adicionado 'open' aqui também para garantir reset ao reabrir
      const dateObj = new Date(recurringExpenseToEdit.startDate);
      const formattedDate = getLocalDateString(dateObj);

      form.reset({
        name: recurringExpenseToEdit.name || "",
        amount: String(recurringExpenseToEdit.amount),
        startDate: formattedDate,
        paymentMethod: (recurringExpenseToEdit.paymentMethod as PaymentMethodType) || "credit-card",
        expenseType: (recurringExpenseToEdit.expenseType as ExpenseTypeType) || "routine",
        recurrenceType: (recurringExpenseToEdit.recurrenceType as RecurrenceType) || "undetermined",
        installmentsTotal: recurringExpenseToEdit.installmentsTotal ?? null,

        routineCategory: (recurringExpenseToEdit.routineCategory as RoutineCategoryType) || null,
        occasionalGroupId: recurringExpenseToEdit.occasionalGroupId ? String(recurringExpenseToEdit.occasionalGroupId) : null,

        fixedExpenseTypeId: recurringExpenseToEdit.fixedExpenseTypeId ? String(recurringExpenseToEdit.fixedExpenseTypeId) : null,
        frequency: (recurringExpenseToEdit.frequency as FrequencyType) || null,
        supermarketId: recurringExpenseToEdit.supermarketId ? String(recurringExpenseToEdit.supermarketId) : null,
        restaurantId: recurringExpenseToEdit.restaurantId ? String(recurringExpenseToEdit.restaurantId) : null,
        occasionType: (recurringExpenseToEdit.occasionType as OccasionTypeType) || null,
        specialOccasionDescription: recurringExpenseToEdit.specialOccasionDescription || null,
        foodPurchaseType: (recurringExpenseToEdit.foodPurchaseType as FoodPurchaseTypeType) || null,
        serviceTypeId: recurringExpenseToEdit.serviceTypeId ? String(recurringExpenseToEdit.serviceTypeId) : null,
        serviceDescription: recurringExpenseToEdit.serviceDescription || null,
        studyTypeId: recurringExpenseToEdit.studyTypeId ? String(recurringExpenseToEdit.studyTypeId) : null,
        studyDescription: recurringExpenseToEdit.studyDescription || null,
        leisureTypeId: recurringExpenseToEdit.leisureTypeId ? String(recurringExpenseToEdit.leisureTypeId) : null,
        leisureDescription: recurringExpenseToEdit.leisureDescription || null,
        personalCareTypeId: recurringExpenseToEdit.personalCareTypeId ? String(recurringExpenseToEdit.personalCareTypeId) : null,
        personalCareDescription: recurringExpenseToEdit.personalCareDescription || null,
        shopId: recurringExpenseToEdit.shopId ? String(recurringExpenseToEdit.shopId) : null,
        shoppingPurchaseType: (recurringExpenseToEdit.shoppingPurchaseType as ShoppingPurchaseTypeType) || null,
        shoppingOccasionType: (recurringExpenseToEdit.shoppingOccasionType as ShoppingOccasionTypeType) || null,
        shoppingSpecialOccasionDescription: recurringExpenseToEdit.shoppingSpecialOccasionDescription || null,
        startPlaceId: recurringExpenseToEdit.startPlaceId ? String(recurringExpenseToEdit.startPlaceId) : null,
        endPlaceId: recurringExpenseToEdit.endPlaceId ? String(recurringExpenseToEdit.endPlaceId) : null,
        startingPoint: recurringExpenseToEdit.startingPoint || null,
        destination: recurringExpenseToEdit.destination || null,
        transportMode: (recurringExpenseToEdit.transportMode as TransportModeType) || null,
        transportDescription: recurringExpenseToEdit.transportDescription || null,
        healthTypeId: recurringExpenseToEdit.healthTypeId ? String(recurringExpenseToEdit.healthTypeId) : null,
        healthDescription: recurringExpenseToEdit.healthDescription || null,
        familyMemberId: recurringExpenseToEdit.familyMemberId ? String(recurringExpenseToEdit.familyMemberId) : null,
        familyDescription: recurringExpenseToEdit.familyDescription || null, // CORREÇÃO DE TYPO AQUI
        charityTypeId: recurringExpenseToEdit.charityTypeId ? String(recurringExpenseToEdit.charityTypeId) : null,
        charityDescription: recurringExpenseToEdit.charityDescription || null,
      });
    } else if (open && !recurringExpenseToEdit) {
      const today = new Date();
      const defaultStartDate = getLocalDateString(today);

      form.reset({
        name: "",
        amount: "",
        startDate: defaultStartDate,
        paymentMethod: "credit-card",
        expenseType: "routine",
        recurrenceType: "undetermined",
        installmentsTotal: null,

        routineCategory: null, occasionalGroupId: null,
        fixedExpenseTypeId: null, frequency: null,
        supermarketId: null, restaurantId: null, occasionType: null, specialOccasionDescription: null, foodPurchaseType: null,
        serviceTypeId: null, serviceDescription: null, studyTypeId: null, studyDescription: null,
        leisureTypeId: null, leisureDescription: null, personalCareTypeId: null, personalCareDescription: null,
        shopId: null, shoppingPurchaseType: null, shoppingOccasionType: null, shoppingSpecialOccasionDescription: null,
        startPlaceId: null, endPlaceId: null, startingPoint: null, destination: null,
        transportMode: null, transportDescription: null, healthTypeId: null, healthDescription: null,
        familyMemberId: null, familyDescription: null, charityTypeId: null, charityDescription: null,
      });
    }
  }, [recurringExpenseToEdit, open, form]);


  const watchedValues = form.watch();
  const expenseType = watchedValues.expenseType;
  const routineCategory = watchedValues.routineCategory;
  const recurrenceType = watchedValues.recurrenceType;


  // HOOKS PARA BUSCAR DADOS DE SUBCATEGORIAS ESPECÍFICAS (igual ao AddExpenseModal)
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


  // HOOKS PARA LIDAR COM A CRIAÇÃO E ATUALIZAÇÃO DE RECORRÊNCIAS
  const createRecurringExpenseMutation = useMutation<RecurringExpense, Error, any>({
    mutationFn: async (data: any): Promise<RecurringExpense> => {
      const response = await apiRequest("POST", "/api/recurring-expenses", data);
      return response as RecurringExpense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-expenses"] }); // Invalida a lista de recorrentes no dashboard
      toast({ title: "Sucesso", description: "Gasto recorrente adicionado!" });
      onOpenChange(false); // Fecha o modal
    },
    onError: (error: any) => {
      console.error("Erro ao adicionar gasto recorrente:", error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao adicionar gasto recorrente. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateRecurringExpenseMutation = useMutation<RecurringExpense, Error, { id: number, data: any }>({
    mutationFn: async ({ id, data }): Promise<RecurringExpense> => {
      const response = await apiRequest("PATCH", `/api/recurring-expenses/${id}`, data);
      return response as RecurringExpense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-expenses"] }); // Invalida a lista de recorrentes
      toast({ title: "Sucesso", description: "Gasto recorrente atualizado!" });
      onOpenChange(false); // Fecha o modal
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar gasto recorrente:", error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar gasto recorrente. Tente novamente.",
        variant: "destructive",
      });
    },
  });


  // ON SUBMIT: Função para lidar com o envio do formulário
  const onSubmit = (data: RecurringExpenseFormData) => {
    // Construir o objeto payload para o backend
    const payload: any = {
      name: data.name,
      amount: parseFloat(data.amount),
      startDate: data.startDate, // Já é string YYYY-MM-DD
      paymentMethod: data.paymentMethod,
      expenseType: data.expenseType,
      recurrenceType: data.recurrenceType,
    };

    // Lógica CONDICIONAL para adicionar installmentsTotal ao payload
    if (data.recurrenceType === 'determined') {
        // Para 'determined', adicione o valor convertido (number ou null)
        payload.installmentsTotal = data.installmentsTotal !== null && data.installmentsTotal !== undefined
                                    ? Number(data.installmentsTotal)
                                    : null;
    } else {
        // Para 'undetermined' ou 'paused', NUNCA envie installmentsTotal ou envie null explicitamente.
        // Já está implícito que não será adicionado ao payload se não entrar no if acima.
        // Mas para clareza e redundância com o backend, podemos forçar null aqui também se a propriedade existisse
        payload.installmentsTotal = null; // Garante que seja null no payload para estes tipos
    }

    // Mapear campos de categoria e subcategoria, limpando os não selecionados
    payload.routineCategory = data.routineCategory || null;
    payload.occasionalGroupId = data.occasionalGroupId ? Number(data.occasionalGroupId) : null;

    if (data.expenseType === "routine") {
        if (data.routineCategory !== "fixed") { payload.fixedExpenseTypeId = null; payload.frequency = null; } else { payload.fixedExpenseTypeId = data.fixedExpenseTypeId ? Number(data.fixedExpenseTypeId) : null; payload.frequency = data.frequency || null; }
        if (data.routineCategory !== "supermarket") { payload.supermarketId = null; } else { payload.supermarketId = data.supermarketId ? Number(data.supermarketId) : null; }
        if (data.routineCategory !== "food") { payload.restaurantId = null; payload.occasionType = null; payload.specialOccasionDescription = null; payload.foodPurchaseType = null; } else { payload.restaurantId = data.restaurantId ? Number(data.restaurantId) : null; payload.occasionType = data.occasionType || null; payload.specialOccasionDescription = (data.occasionType === "special" && data.specialOccasionDescription) ? data.specialOccasionDescription : null; payload.foodPurchaseType = data.foodPurchaseType || null; }
        if (data.routineCategory !== "services") { payload.serviceTypeId = null; payload.serviceDescription = null; } else { payload.serviceTypeId = data.serviceTypeId ? Number(data.serviceTypeId) : null; payload.serviceDescription = data.serviceDescription || null; }
        if (data.routineCategory !== "study") { payload.studyTypeId = null; payload.studyDescription = null; } else { payload.studyTypeId = data.studyTypeId ? Number(data.studyTypeId) : null; payload.studyDescription = data.studyDescription || null; }
        if (data.routineCategory !== "leisure") { payload.leisureTypeId = null; payload.leisureDescription = null; } else { payload.leisureTypeId = data.leisureTypeId ? Number(data.leisureTypeId) : null; payload.leisureDescription = data.leisureDescription || null; }
        if (data.routineCategory !== "personal-care") { payload.personalCareTypeId = null; payload.personalCareDescription = null; } else { payload.personalCareTypeId = data.personalCareTypeId ? Number(data.personalCareTypeId) : null; payload.personalCareDescription = data.personalCareDescription || null; }
        if (data.routineCategory !== "shopping") { payload.shopId = null; payload.shoppingPurchaseType = null; payload.shoppingOccasionType = null; payload.shoppingSpecialOccasionDescription = null; } else { payload.shopId = data.shopId ? Number(data.shopId) : null; payload.shoppingPurchaseType = data.shoppingPurchaseType || null; payload.shoppingOccasionType = data.shoppingOccasionType || null; payload.shoppingSpecialOccasionDescription = (data.shoppingOccasionType === "special" && data.shoppingSpecialOccasionDescription) ? data.shoppingSpecialOccasionDescription : null; }
        if (data.routineCategory !== "transportation") { payload.startPlaceId = null; payload.endPlaceId = null; payload.startingPoint = null; payload.destination = null; payload.transportMode = null; payload.transportDescription = null; } else { payload.startPlaceId = data.startPlaceId ? Number(data.startPlaceId) : null; payload.endPlaceId = data.endPlaceId ? Number(data.endPlaceId) : null; payload.startingPoint = data.startingPoint || null; payload.destination = data.destination || null; payload.transportMode = data.transportMode || null; payload.transportDescription = data.transportDescription || null; }
        if (data.routineCategory !== "health") { payload.healthTypeId = null; payload.healthDescription = null; } else { payload.healthTypeId = data.healthTypeId ? Number(data.healthTypeId) : null; payload.healthDescription = data.healthDescription || null; }
        if (data.routineCategory !== "family") { payload.familyMemberId = null; payload.familyDescription = null; } else { payload.familyMemberId = data.familyMemberId ? Number(data.familyMemberId) : null; payload.familyDescription = data.familyDescription || null; }
        if (data.routineCategory !== "charity") { payload.charityTypeId = null; payload.charityDescription = null; } else { payload.charityTypeId = data.charityTypeId ? Number(data.charityTypeId) : null; payload.charityDescription = data.charityDescription || null; }
    } else { // expenseType === "occasional"
        // Para gastos ocasionais, zera os campos de rotina, mas mantém o occasionalGroupId
        payload.routineCategory = null;
        payload.fixedExpenseTypeId = null; payload.frequency = null;
        payload.supermarketId = null;
        payload.restaurantId = null; payload.occasionType = null; payload.specialOccasionDescription = null; payload.foodPurchaseType = null;
        payload.serviceTypeId = null; payload.serviceDescription = null;
        payload.studyTypeId = null; payload.studyDescription = null;
        payload.leisureTypeId = null; payload.leisureDescription = null;
        payload.personalCareTypeId = null; payload.personalCareDescription = null;
        payload.shopId = null; payload.shoppingPurchaseType = null; payload.shoppingOccasionType = null; payload.shoppingSpecialOccasionDescription = null;
        payload.startPlaceId = null; payload.endPlaceId = null; payload.startingPoint = null; payload.destination = null; payload.transportMode = null; payload.transportDescription = null;
        payload.healthTypeId = null; payload.healthDescription = null;
        payload.familyMemberId = null; payload.familyDescription = null;
        payload.charityTypeId = null; payload.charityDescription = null;
    }


    if (recurringExpenseToEdit?.id) {
        updateRecurringExpenseMutation.mutate({ id: recurringExpenseToEdit.id, data: payload });
    } else {
        createRecurringExpenseMutation.mutate(payload);
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
          <DialogTitle>{recurringExpenseToEdit ? "Editar Gasto Recorrente" : "Adicionar Gasto Recorrente"}</DialogTitle>
          <DialogDescription>
            {recurringExpenseToEdit ? "Modifique os detalhes da recorrência existente." : "Preencha os detalhes do seu novo gasto recorrente."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* 1. Nome do Gasto Recorrente */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Recorrência</FormLabel>
                  <FormControl><Input placeholder="ex: Netflix, Aluguel, Parcela do Celular" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2. Data de Início e Valor */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "d MMMM yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? getLocalDateString(date) : "")}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
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

            {/* 3. Forma de Pagamento */}
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

            {/* 4. Tipo de Gasto (Rotina ou Ocasião) - MODIFICADO onValueChange */}
            <FormField
              control={form.control}
              name="expenseType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de gasto</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value); // Atualiza o próprio expenseType
                        // Limpa campos que dependem do expenseType
                        form.setValue("occasionalGroupId", null); // Sempre zera o grupo ocasional ao mudar o tipo principal
                        form.setValue("routineCategory", null); // Sempre zera a categoria de rotina ao mudar o tipo principal

                        clearSubcategoryFields(form.setValue); // Chamar a função auxiliar de limpeza
                      }}
                      value={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="routine" id="routine-rec" />
                        <label htmlFor="routine-rec" className="flex-1 cursor-pointer">
                          <div className="text-center">
                            <Calendar className="mx-auto mb-2 h-6 w-6 text-primary" />
                            <p className="font-medium">Gasto de Rotina</p>
                            <p className="text-sm text-muted-foreground">Recorrente do dia-a-dia</p>
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="occasional" id="occasional-rec" />
                        <label htmlFor="occasional-rec" className="flex-1 cursor-pointer">
                          <div className="text-center">
                            <Star className="mx-auto mb-2 h-6 w-6 text-accent" />
                            <p className="font-medium">Gasto de Ocasião</p>
                            <p className="text-sm text-muted-foreground">Recorrente de situação especial</p>
                          </div>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 5. Seleção de Grupo Ocasionais (APARECE se expenseType for "occasional") */}
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
                            occasionalGroups.map((group) => (<SelectItem key={group.id} value={group.id.toString()}>{group.name}</SelectItem>))
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

            {/* 6. Categorias de Gastos (para Rotina ou se ocasional tem categoria interna) */}
            {expenseType === "routine" || (expenseType === "occasional" && watchedValues.occasionalGroupId) ? (
              <FormField
                control={form.control}
                name="routineCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categorias de Gastos</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        clearSubcategoryFields(form.setValue); // Chamar a função auxiliar de limpeza
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
            ) : null}


            {/* 7. CAMPOS ESPECÍFICOS DE SUBCATEGORIAS (condicional à routineCategory) */}
            <div className="space-y-6">
              {/* Usando um switch para renderizar condicionalmente os campos de subcategoria */}
              {(() => { // IIFE (Immediately Invoked Function Expression) para usar switch no JSX
                switch (routineCategory) {
                  case "fixed":
                    return (
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
                    );
                  case "supermarket":
                    return (
                      <div className="space-y-4">
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
                      </div>
                    );
                  case "food":
                    return (
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
                                <div className="flex items-center space-x-2"><RadioGroupItem value="in-person" id="food-in-person-rec" /><label htmlFor="food-in-person-rec">No local</label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="online" id="food-online-rec" /><label htmlFor="food-online-rec">À distância</label></div>
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
                                <div className="flex items-center space-x-2"><RadioGroupItem value="normal" id="occasion-normal-rec" /><label htmlFor="occasion-normal-rec">Normal</label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="special" id="occasion-special-rec" /><label htmlFor="occasion-special-rec">Especial</label></div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        {watchedValues.occasionType === "special" && (
                          <FormField control={form.control} name="specialOccasionDescription" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição da Ocasião Especial</FormLabel>
                              <FormControl><Textarea placeholder="ex: aniversário de alguém, celebração de algo..." rows={2} {...field} value={field.value ?? ""} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}
                      </div>
                    );
                  case "services":
                    return (
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
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    );
                  case "study":
                    return (
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
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    );
                  case "leisure":
                    return (
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
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    );
                  case "personal-care":
                    return (
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
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    );
                  case "shopping":
                    return (
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
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="in-person" id="shopping-in-person-rec" /><label htmlFor="shopping-in-person-rec">Presencial</label></div>
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="online" id="shopping-online-rec" /><label htmlFor="shopping-online-rec">Online</label></div>
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
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="normal" id="shopping-occasion-normal-rec" /><label htmlFor="shopping-occasion-normal-rec">Normal</label></div>
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="special" id="shopping-occasion-special-rec" /><label htmlFor="shopping-occasion-special-rec">Especial</label></div>
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
                              <FormControl><Textarea placeholder="ex: presente para alguém..." rows={2} {...field} value={field.value ?? ""} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}
                      </div>
                    );
                  case "transportation":
                    return (
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
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    );
                  case "health":
                    return (
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
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    );
                  case "family":
                    return (
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
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    );
                  case "charity":
                    return (
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
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    );
                  default:
                    return null; // Não renderiza nada se a categoria não for reconhecida ou não tiver campos específicos
                }
              })()} {/* Fim da IIFE e do switch */}
            </div>

            {/* 8. Tipo de Recorrência */}
            <FormField
              control={form.control}
              name="recurrenceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Recorrência</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value: RecurrenceType) => {
                        field.onChange(value);
                        // Limpa installmentsTotal se não for "determined"
                        if (value !== "determined") {
                          form.setValue("installmentsTotal", undefined);
                        }
                      }}
                      value={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="undetermined" id="undetermined" />
                        <label htmlFor="undetermined" className="flex-1 cursor-pointer">
                          <div className="text-center">
                            <Plus className="mx-auto mb-2 h-6 w-6 text-indigo-500" />
                            <p className="font-medium">Indeterminado</p>
                            <p className="text-sm text-muted-foreground">Repete para sempre</p>
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="determined" id="determined" />
                        <label htmlFor="determined" className="flex-1 cursor-pointer">
                          <div className="text-center">
                            <Calendar className="mx-auto mb-2 h-6 w-6 text-green-500" />
                            <p className="font-medium">Determinado</p>
                            <p className="text-sm text-muted-foreground">Número fixo de meses</p>
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="paused" id="paused" />
                        <label htmlFor="paused" className="flex-1 cursor-pointer">
                          <div className="text-center">
                            <Star className="mx-auto mb-2 h-6 w-6 text-yellow-500" />
                            <p className="font-medium">Pausado</p>
                            <p className="text-sm text-muted-foreground">Não gera despesas</p>
                          </div>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 9. Campo para Total de Parcelas (aparece apenas se "Determinado" for selecionado) */}
            {recurrenceType === "determined" && (
              <FormField
                control={form.control}
                name="installmentsTotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total de Parcelas (meses)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="ex: 12" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Ações do formulário: Botões "Cancelar" e "Salvar" */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createRecurringExpenseMutation.isPending || updateRecurringExpenseMutation.isPending}>
                {createRecurringExpenseMutation.isPending ? "Salvando..." : (updateRecurringExpenseMutation.isPending ? "Atualizando..." : (recurringExpenseToEdit ? "Atualizar Recorrência" : "Salvar Recorrência"))}
              </Button>
            </div>
          </form>
        </Form>

      </DialogContent>

      {/* LOCALIZAÇÃO DOS MODAIS ADICIONAIS: Renderizados aqui, fora do <form> mas dentro do <Dialog> */}
      <AddOccasionalGroupModal open={addOccasionalGroupModalOpen} onOpenChange={setAddOccasionalGroupModalOpen} />
      <AddFixedExpenseTypeModal open={showAddFixedExpenseTypeModal} onOpenChange={setShowAddFixedExpenseTypeModal} />
      <AddSupermarketModal open={showAddSupermarketModal} onOpenChange={setShowAddSupermarketModal} />
      <AddRestaurantModal open={showAddRestaurantModal} onOpenChange={setShowAddRestaurantModal} />
      <AddServiceTypeModal open={addServiceTypeModalOpen} onOpenChange={setAddServiceTypeModalOpen} />
      <AddStudyTypeModal open={addStudyTypeModalOpen} onOpenChange={setAddStudyTypeModalOpen} />
      <AddLeisureTypeModal open={addLeisureTypeModalOpen} onOpenChange={setAddLeisureTypeModalOpen} />
      <AddPersonalCareTypeModal open={addPersonalCareTypeModalOpen} onOpenChange={setAddPersonalCareTypeModalOpen} />
      <AddShopModal open={addShopModalOpen} onOpenChange={setAddShopModalOpen} />
      <AddPlaceModal open={addPlaceModalOpen} onOpenChange={setAddPlaceModalOpen} />
      <AddHealthTypeModal open={addHealthTypeModalOpen} onOpenChange={setAddHealthTypeModalOpen} />
      <AddFamilyMemberModal open={addFamilyMemberModalOpen} onOpenChange={setAddFamilyMemberModalOpen} />
      <AddCharityTypeModal open={addCharityTypeModalOpen} onOpenChange={setAddCharityTypeModalOpen} />
    </Dialog>
  );
}

