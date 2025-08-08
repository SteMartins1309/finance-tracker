// src/pages/RecurringExpensesPage.tsx

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import * as LucideIcons from "lucide-react";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Star,
  DollarSign,
  ShoppingCart,
  Utensils,
  Home,
  BookOpen,
  Gamepad2,
  Scissors,
  Tags,
  Car,
  Heart,
  Users,
  Gift,
  ChevronDown
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { RecentExpense, RecurringExpense } from "@/types/finance";
import { AddRecurringExpenseModal } from "@/components/AddRecurringExpenseModal";
import { AddExpenseModal } from "@/components/add-expense-modal";


// Interfaces de resposta de mutações (copiadas do dashboard.tsx)
interface DeleteRecurringExpenseResponse {
  message: string;
  deleted: RecurringExpense;
}

interface DeleteExpenseResponse {
  message: string;
  deleted: RecentExpense;
}

interface MarkAsPaidResponse {
  message: string;
  updated: RecentExpense;
}

interface FinancialYearData { 
  id: number;
  year: number;
  totalMonthlyGoal: number;
  createdAt: string;
}


const categoryLabels: Record<string, string> = {
  "fixed": "Fixos", "supermarket": "Supermercado", "food": "Alimentação", "services": "Serviços", "study": "Estudos",
  "leisure": "Lazer", "personal-care": "Cuidado Pessoal", "shopping": "Compras", "transportation": "Transporte",
  "health": "Saúde", "family": "Família", "charity": "Caridade", "occasional": "Ocasionais",
};
const FIXED_CATEGORY_ORDER: string[] = [
  'fixed', 'supermarket', 'food', 'services', 'study', 'leisure', 'personal-care',
  'shopping', 'transportation', 'health', 'family', 'charity', 'occasional' // Incluir ocasional para agrupamento
];

// Funções auxiliares de ícones e cores (copiadas do dashboard.tsx)
const getCategoryIcon = (category: string, isOccasionalIcon: boolean = false) => {
  const LucideIconComponent = (LucideIcons as any)[category];
  if (LucideIconComponent && typeof LucideIconComponent === 'function') {
    if (isOccasionalIcon) {
      return React.createElement(LucideIconComponent, { className: "h-4 w-4", style: { color: '#C2185B' } });
    }
    return React.createElement(LucideIconComponent, { className: "h-4 w-4 text-current" });
  }
  switch (category) {
    case "fixed": return <DollarSign className="h-4 w-4 text-[#6B4E22]" />;
    case "supermarket": return <ShoppingCart className="h-4 w-4 text-[#C32C04]" />;
    case "food": return <Utensils className="h-4 w-4 text-[#A7521C]" />;
    case "services": return <Home className="h-4 w-4 text-[#1E6F5C]" />;
    case "study": return <BookOpen className="h-4 w-4 text-[#2F528F]" />;
    case "leisure": return <Gamepad2 className="h-4 w-4 text-[#2C754B]" />;
    case "personal-care": return <Scissors className="h-4 w-4 text-[#C33E7D]" />;
    case "shopping": return <Tags className="h-4 w-4 text-[#255F74]" />;
    case "transportation": return <Car className="h-4 w-4 text-[#37474F]" />;
    case "health": return <Heart className="h-4 w-4 text-[#3D60A8]" />;
    case "family": return <Users className="h-4 w-4 text-[#633386]" />;
    case "charity": return <Gift className="h-4 w-4 text-[#781D4B]" />;
    case "occasional": return <Star className="h-4 w-4 text-[#C2185B]" />;
    default: return <Tags className="h-4 w-4 text-[#6B7280]" />;
  }
};

const getCategoryIconColor = (category: string) => {
  switch (category) {
    case "fixed": return "#FFE5A0";
    case "supermarket": return "#FFE0DB";
    case "food": return "#FFD7BB";
    case "services": return "#CDEDE3";
    case "study": return "#D6E4F2";
    case "leisure": return "#D4EDBC";
    case "personal-care": return "#F3D7E1";
    case "shopping": return "#C6DBE1";
    case "transportation": return "#CFD8DC";
    case "health": return "#C9E7F8";
    case "family": return "#E6CFF2";
    case "charity": return "#E8C5D8";
    case "occasional": return "#FFEBEE";
    default: return "#E5E7EB";
  }
};

// Função auxiliar para obter detalhes da subcategoria e descrição (MODIFICADA para incluir parcela)
const getSubcategoryDetails = (expense: RecentExpense) => {
  let details: string[] = [];
  let descriptionText: string | null = null;
  let actualCategory = expense.recurringExpenseId ? (expense.recurringRoutineCategory ?? null) : (expense.routineCategory ?? null);

  if (expense.expenseType === 'routine') {
    switch (actualCategory) {
      case 'fixed':
        if (expense.recurringExpenseId) {
          if (expense.recurringFixedExpenseTypeName) details.push(expense.recurringFixedExpenseTypeName);
        } else {
          if (expense.fixedExpenseTypeName) details.push(expense.fixedExpenseTypeName);
        }
        break;
      case 'supermarket':
        if (expense.recurringExpenseId ? expense.recurringSupermarketName : expense.supermarketName) details.push(expense.recurringExpenseId ? expense.recurringSupermarketName! : expense.supermarketName!);
        break;
      case 'food':
        if (expense.recurringExpenseId ? expense.recurringRestaurantName : expense.restaurantName) details.push(expense.recurringExpenseId ? expense.recurringRestaurantName! : expense.restaurantName!);
        const foodPurchaseType = expense.recurringExpenseId ? expense.recurringFoodPurchaseType : expense.foodPurchaseType;
        if (foodPurchaseType) {
          if (foodPurchaseType === 'in-person') { details.push('pedido no local'); }
          else if (foodPurchaseType === 'online') { details.push('pedido à distância'); }
        }
        const occasionType = expense.recurringExpenseId ? expense.recurringOccasionType : expense.occasionType;
        if (occasionType && occasionType !== 'normal') details.push(`especial`);
        descriptionText = expense.recurringExpenseId ? (expense.recurringSpecialOccasionDescription ?? null) : (expense.specialOccasionDescription ?? null);
        break;
      case 'services':
        if (expense.recurringExpenseId ? expense.recurringServiceTypeName : expense.serviceTypeName) details.push(expense.recurringExpenseId ? expense.recurringServiceTypeName! : expense.serviceTypeName!);
        descriptionText = expense.recurringExpenseId ? (expense.recurringServiceDescription ?? null) : (expense.serviceDescription ?? null);
        break;
      case 'study':
        if (expense.recurringExpenseId ? expense.recurringStudyTypeName : expense.studyTypeName) details.push(expense.recurringExpenseId ? expense.recurringStudyTypeName! : expense.studyTypeName!);
        descriptionText = expense.recurringExpenseId ? (expense.recurringStudyDescription ?? null) : (expense.studyDescription ?? null);
        break;
      case 'leisure':
        if (expense.recurringExpenseId ? expense.recurringLeisureTypeName : expense.leisureTypeName) details.push(expense.recurringExpenseId ? expense.recurringLeisureTypeName! : expense.leisureTypeName!);
        descriptionText = expense.recurringExpenseId ? (expense.recurringLeisureDescription ?? null) : (expense.leisureDescription ?? null);
        break;
      case 'personal-care':
        if (expense.recurringExpenseId ? expense.recurringPersonalCareTypeName : expense.personalCareTypeName) details.push(expense.recurringExpenseId ? expense.recurringPersonalCareTypeName! : expense.personalCareTypeName!);
        descriptionText = expense.recurringExpenseId ? (expense.recurringPersonalCareDescription ?? null) : (expense.personalCareDescription ?? null);
        break;
      case 'shopping':
        if (expense.recurringExpenseId ? expense.recurringShopName : expense.shopName) details.push(expense.recurringExpenseId ? expense.recurringShopName! : expense.shopName!);
        const shoppingPurchaseType = expense.recurringExpenseId ? expense.recurringShoppingPurchaseType : expense.shoppingPurchaseType;
        if (shoppingPurchaseType) {
          if (shoppingPurchaseType === 'in-person') { details.push('pedido no local'); }
          else if (shoppingPurchaseType === 'online') { details.push('pedido à distância'); }
        }
        const shoppingOccasionType = expense.recurringExpenseId ? expense.recurringShoppingOccasionType : expense.occasionType;
        if (shoppingOccasionType && shoppingOccasionType !== 'normal') details.push(`especial`);
        descriptionText = expense.recurringExpenseId ? (expense.recurringShoppingSpecialOccasionDescription ?? null) : (expense.shoppingSpecialOccasionDescription ?? null);
        break;
      case 'transportation':
        const startPlaceName = expense.recurringExpenseId ? (expense.recurringStartPlaceName ?? null) : (expense.startPlaceName ?? null);
        const endPlaceName = expense.recurringExpenseId ? (expense.recurringEndPlaceName ?? null) : (expense.endPlaceName ?? null);
        const startingPoint = expense.recurringExpenseId ? (expense.recurringStartingPoint ?? null) : (expense.startingPoint ?? null);
        const destination = expense.recurringExpenseId ? (expense.recurringDestination ?? null) : (expense.destination ?? null);
        if (startPlaceName && endPlaceName) details.push(`${startPlaceName} -> ${endPlaceName}`);
        else if (startingPoint && destination) details.push(`${startingPoint} -> ${destination}`);

        const transportMode = expense.recurringExpenseId ? expense.recurringTransportMode : expense.transportMode;
        if (transportMode) {
          if (transportMode === 'car') { details.push('carro'); }
          else if (transportMode === 'uber') { details.push('uber'); }
          else if (transportMode === 'bus') { details.push('ônibus'); }
          else if (transportMode === 'plane') { details.push('avião'); }
          else if (transportMode === 'subway') { details.push('metrô'); }
          else if (transportMode === 'another') { details.push('outro'); }
        }
        descriptionText = expense.recurringExpenseId ? (expense.recurringTransportDescription ?? null) : (expense.transportDescription ?? null);
        break;
      case 'health':
        if (expense.recurringExpenseId ? expense.recurringHealthTypeName : expense.healthTypeName) details.push(expense.recurringExpenseId ? expense.recurringHealthTypeName! : expense.healthTypeName!);
        descriptionText = expense.recurringExpenseId ? (expense.recurringHealthDescription ?? null) : (expense.healthDescription ?? null);
        break;
      case 'family':
        if (expense.recurringExpenseId ? expense.recurringFamilyMemberName : expense.familyMemberName) details.push(expense.recurringExpenseId ? expense.recurringFamilyMemberName! : expense.familyMemberName!);
        descriptionText = expense.recurringExpenseId ? (expense.recurringFamilyDescription ?? null) : (expense.familyDescription ?? null);
        break;
      case 'charity':
        if (expense.recurringExpenseId ? expense.recurringCharityTypeName : expense.charityTypeName) details.push(expense.recurringExpenseId ? expense.recurringCharityTypeName! : expense.charityTypeName!);
        descriptionText = expense.recurringExpenseId ? (expense.recurringCharityDescription ?? null) : (expense.charityDescription ?? null);
        break;
    }
  } else if (expense.expenseType === 'occasional') {
    switch (actualCategory) {
      case 'fixed':
        if (expense.recurringExpenseId) {
          if (expense.recurringFixedExpenseTypeName) details.push(expense.recurringFixedExpenseTypeName);
        } else {
          if (expense.fixedExpenseTypeName) details.push(expense.fixedExpenseTypeName);
        }
        break;
      case 'supermarket':
        if (expense.recurringExpenseId ? expense.recurringSupermarketName : expense.supermarketName) details.push(expense.recurringExpenseId ? expense.recurringSupermarketName! : expense.supermarketName!);
        break;
      case 'food':
        if (expense.recurringExpenseId ? expense.recurringRestaurantName : expense.restaurantName) details.push(expense.recurringExpenseId ? expense.recurringRestaurantName! : expense.restaurantName!);
        const foodPurchaseType = expense.recurringExpenseId ? expense.recurringFoodPurchaseType : expense.foodPurchaseType;
        if (foodPurchaseType) {
          if (foodPurchaseType === 'in-person') { details.push('pedido no local'); }
          else if (foodPurchaseType === 'online') { details.push('pedido à distância'); }
        }
        const occasionType = expense.recurringExpenseId ? expense.recurringOccasionType : expense.occasionType;
        if (occasionType && occasionType !== 'normal') details.push(`especial`);
        descriptionText = expense.recurringExpenseId ? (expense.recurringSpecialOccasionDescription ?? null) : (expense.specialOccasionDescription ?? null);
        break;
      case 'services':
        if (expense.recurringExpenseId ? expense.recurringServiceTypeName : expense.serviceTypeName) details.push(expense.recurringExpenseId ? expense.recurringServiceTypeName! : expense.serviceTypeName!);
        descriptionText = expense.recurringExpenseId ? (expense.recurringServiceDescription ?? null) : (expense.serviceDescription ?? null);
        break;
      case 'study':
        if (expense.recurringExpenseId ? expense.recurringStudyTypeName : expense.studyTypeName) details.push(expense.recurringExpenseId ? expense.recurringStudyTypeName! : expense.studyTypeName!);
        descriptionText = expense.recurringExpenseId ? (expense.recurringStudyDescription ?? null) : (expense.studyDescription ?? null);
        break;
      case 'leisure':
        if (expense.recurringExpenseId ? expense.recurringLeisureTypeName : expense.leisureTypeName) details.push(expense.recurringExpenseId ? expense.recurringLeisureTypeName! : expense.leisureTypeName!);
        descriptionText = expense.recurringExpenseId ? (expense.recurringLeisureDescription ?? null) : (expense.leisureDescription ?? null);
        break;
      case 'personal-care':
        if (expense.recurringExpenseId ? expense.recurringPersonalCareTypeName : expense.personalCareTypeName) details.push(expense.recurringExpenseId ? expense.recurringPersonalCareTypeName! : expense.personalCareTypeName!);
        descriptionText = expense.recurringExpenseId ? (expense.recurringPersonalCareDescription ?? null) : (expense.personalCareDescription ?? null);
        break;
      case 'shopping':
        if (expense.recurringExpenseId ? expense.recurringShopName : expense.shopName) details.push(expense.recurringExpenseId ? expense.recurringShopName! : expense.shopName!);
        const shoppingPurchaseType = expense.recurringExpenseId ? expense.recurringShoppingPurchaseType : expense.shoppingPurchaseType;
        if (shoppingPurchaseType) {
          if (shoppingPurchaseType === 'in-person') { details.push('pedido no local'); }
          else if (shoppingPurchaseType === 'online') { details.push('pedido à distância'); }
        }
        const shoppingOccasionType = expense.recurringExpenseId ? expense.recurringShoppingOccasionType : expense.occasionType;
        if (shoppingOccasionType && shoppingOccasionType !== 'normal') details.push(`especial`);
        descriptionText = expense.recurringExpenseId ? (expense.recurringShoppingSpecialOccasionDescription ?? null) : (expense.shoppingSpecialOccasionDescription ?? null);
        break;
      case 'transportation':
        const startPlaceName = expense.recurringExpenseId ? (expense.recurringStartPlaceName ?? null) : (expense.startPlaceName ?? null);
        const endPlaceName = expense.recurringExpenseId ? (expense.recurringEndPlaceName ?? null) : (expense.endPlaceName ?? null);
        const startingPoint = expense.recurringExpenseId ? (expense.recurringStartingPoint ?? null) : (expense.startingPoint ?? null);
        const destination = expense.recurringExpenseId ? (expense.recurringDestination ?? null) : (expense.destination ?? null);
        if (startPlaceName && endPlaceName) details.push(`${startPlaceName} -> ${endPlaceName}`);
        else if (startingPoint && destination) details.push(`${startingPoint} -> ${destination}`);

        const transportMode = expense.recurringExpenseId ? expense.recurringTransportMode : expense.transportMode;
        if (transportMode) {
          if (transportMode === 'car') { details.push('carro'); }
          else if (transportMode === 'uber') { details.push('uber'); }
          else if (transportMode === 'bus') { details.push('ônibus'); }
          else if (transportMode === 'plane') { details.push('avião'); }
          else if (transportMode === 'subway') { details.push('metrô'); }
          else if (transportMode === 'another') { details.push('outro'); }
        }
        descriptionText = expense.recurringExpenseId ? (expense.recurringTransportDescription ?? null) : (expense.transportDescription ?? null);
        break;
      case 'health':
        if (expense.recurringExpenseId ? expense.recurringHealthTypeName : expense.healthTypeName) details.push(expense.recurringExpenseId ? expense.recurringHealthTypeName! : expense.healthTypeName!);
        descriptionText = expense.recurringExpenseId ? (expense.recurringHealthDescription ?? null) : (expense.healthDescription ?? null);
        break;
      case 'family':
        if (expense.recurringExpenseId ? expense.recurringFamilyMemberName : expense.familyMemberName) details.push(expense.recurringExpenseId ? expense.recurringFamilyMemberName! : expense.familyMemberName!);
        descriptionText = expense.recurringExpenseId ? (expense.recurringFamilyDescription ?? null) : (expense.familyDescription ?? null);
        break;
      case 'charity':
        if (expense.recurringExpenseId ? expense.recurringCharityTypeName : expense.charityTypeName) details.push(expense.recurringExpenseId ? expense.recurringCharityTypeName! : expense.charityTypeName!);
        descriptionText = expense.recurringExpenseId ? (expense.recurringCharityDescription ?? null) : (expense.charityDescription ?? null);
        break;
    }
  }

  // Adicionar o número da parcela se for uma recorrência determinada
  if (expense.recurringExpenseId && expense.recurringExpenseRecurrenceType === 'determined' && expense.installmentNumber) {
    details.push(`Parcela ${expense.installmentNumber} de ${expense.recurringExpenseInstallmentsTotal || '?'}`);
  }

  return { details: details.join(' • '), description: descriptionText };
};

// Helper para obter detalhes de subcategoria para RecurringExpense (copiada do dashboard.tsx)
const getRecurringSubcategoryDetails = (recurringExpense: RecurringExpense) => {
  let details: string[] = [];
  let descriptionText: string | null = null;
  let actualCategory = recurringExpense.routineCategory ?? null;

  if (recurringExpense.expenseType === 'routine') {
    switch (actualCategory) {
      case 'fixed':
        if (recurringExpense.fixedExpenseTypeName) details.push(recurringExpense.fixedExpenseTypeName);
        if (recurringExpense.frequency) {
          const freq = recurringExpense.frequency;
          if (freq === 'weekly') { details.push('semanalmente'); }
          else if (freq === 'monthly') { details.push('mensalmente'); }
          else if (freq === 'semi-annually') { details.push('semestralmente'); }
          else if (freq === 'annually') { details.push('anualmente'); }
          else { details.push(`Frequência: ${freq}`); }
        }
        break;
      case 'supermarket':
        if (recurringExpense.supermarketName) details.push(recurringExpense.supermarketName);
        break;
      case 'food':
        if (recurringExpense.restaurantName) details.push(recurringExpense.restaurantName);
        const foodPurchaseType = recurringExpense.foodPurchaseType;
        if (foodPurchaseType) {
          if (foodPurchaseType === 'in-person') { details.push('pedido no local'); }
          else if (foodPurchaseType === 'online') { details.push('pedido à distância'); }
        }
        const occasionType = recurringExpense.occasionType;
        if (occasionType && occasionType !== 'normal') details.push(`especial`);
        descriptionText = recurringExpense.specialOccasionDescription ?? null;
        break;
      case 'services':
        if (recurringExpense.serviceTypeName) details.push(recurringExpense.serviceTypeName);
        descriptionText = recurringExpense.serviceDescription ?? null;
        break;
      case 'study':
        if (recurringExpense.studyTypeName) details.push(recurringExpense.studyTypeName);
        descriptionText = recurringExpense.studyDescription ?? null;
        break;
      case 'leisure':
        if (recurringExpense.leisureTypeName) details.push(recurringExpense.leisureTypeName);
        descriptionText = recurringExpense.leisureDescription ?? null;
        break;
      case 'personal-care':
        if (recurringExpense.personalCareTypeName) details.push(recurringExpense.personalCareTypeName);
        descriptionText = recurringExpense.personalCareDescription ?? null;
        break;
      case 'shopping':
        if (recurringExpense.shopName) details.push(recurringExpense.shopName);
        const shoppingPurchaseType = recurringExpense.shoppingPurchaseType;
        if (shoppingPurchaseType) {
          if (shoppingPurchaseType === 'in-person') { details.push('presencial'); }
          else if (shoppingPurchaseType === 'online') { details.push('online'); }
        }
        const shoppingOccasionType = recurringExpense.shoppingOccasionType;
        if (shoppingOccasionType && shoppingOccasionType !== 'normal') details.push(`especial`);
        descriptionText = recurringExpense.shoppingSpecialOccasionDescription ?? null;
        break;
      case 'transportation':
        const startPlaceName = recurringExpense.startPlaceName ?? null;
        const endPlaceName = recurringExpense.endPlaceName ?? null;
        const startingPoint = recurringExpense.startingPoint ?? null;
        const destination = recurringExpense.destination ?? null;
        if (startPlaceName && endPlaceName) details.push(`${startPlaceName} -> ${endPlaceName}`);
        else if (startingPoint && destination) details.push(`${startingPoint} -> ${destination}`);

        const transportMode = recurringExpense.transportMode;
        if (transportMode) {
          if (transportMode === 'car') { details.push('carro'); }
          else if (transportMode === 'uber') { details.push('uber'); }
          else if (transportMode === 'bus') { details.push('ônibus'); }
          else if (transportMode === 'plane') { details.push('avião'); }
          else if (transportMode === 'subway') { details.push('metrô'); }
          else if (transportMode === 'another') { details.push('outro'); }
        }
        descriptionText = recurringExpense.transportDescription ?? null;
        break;
      case 'health':
        if (recurringExpense.healthTypeName) details.push(recurringExpense.healthTypeName);
        descriptionText = recurringExpense.healthDescription ?? null;
        break;
      case 'family':
        if (recurringExpense.familyMemberName) details.push(recurringExpense.familyMemberName);
        descriptionText = recurringExpense.familyDescription ?? null;
        break;
      case 'charity':
        if (recurringExpense.charityTypeName) details.push(recurringExpense.charityTypeName);
        descriptionText = recurringExpense.charityDescription ?? null;
        break;
    }
  } else if (recurringExpense.expenseType === 'occasional') {
    if (recurringExpense.occasionalGroupName) details.push(recurringExpense.occasionalGroupName);
    if (recurringExpense.description) descriptionText = recurringExpense.description;
  }
  return { details: details.join(' • '), description: descriptionText };
};


export default function RecurringExpensesPage() {
  // Estados para controlar o modal de adição/edição de recorrências
  const [addRecurringExpenseModalOpen, setAddRecurringExpenseModalOpen] = useState(false);
  const [recurringExpenseToEdit, setRecurringExpenseToEdit] = useState<RecurringExpense | null>(null);
  const [recurringExpenseToDelete, setRecurringExpenseToDelete] = useState<{ id: number; name: string } | null>(null);

  // Estados para controlar o modal de adição/edição de despesas (ocorrências)
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false); // Para editar uma ocorrência (opcional, pode-se usar o modal normal)
  const [expenseToEdit, setExpenseToEdit] = useState<RecentExpense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<{ id: number; displayName: string } | null>(null); // Para deletar uma ocorrência

  // NOVO: Estados para o filtro de mês e ano
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar GASTOS RECORRENTES (as configurações)
  const { data: recurringExpensesList, isLoading: recurringExpensesLoading } = useQuery<RecurringExpense[]>({
    queryKey: ["/api/recurring-expenses"],
  });

  // Query para buscar AS OCORRÊNCIAS DE GASTOS RECORRENTES (pendentes e pagas), agora com filtros
  const { data: generatedExpensesList, isLoading: generatedExpensesLoading } = useQuery<RecentExpense[]>({
    queryKey: ["/api/expenses/recurring-occurrences", selectedYear, selectedMonth],
    queryFn: async ({ queryKey }) => {
        const [_baseUrl, year, month] = queryKey;
        const url = `/api/expenses/recurring-occurrences?year=${year}&month=${month}`;
        const response = await apiRequest("GET", url);
        return response;
    },
    enabled: !!selectedYear && !!selectedMonth, // Apenas buscar se os filtros estiverem definidos
  });

  // Query para buscar os anos financeiros disponíveis para o filtro (igual a MonthlyView)
  const { data: financialYears, isLoading: yearsLoading } = useQuery<FinancialYearData[]>({
    queryKey: ["/api/financial-years"],
  });

  // Efeito para garantir que o ano selecionado seja um existente ou o mais recente (igual a MonthlyView)
  useEffect(() => {
    if (financialYears && financialYears.length > 0) {
        const currentYearData = financialYears.find(fy => fy.year === currentDate.getFullYear());
        if (currentYearData) {
            setSelectedYear(currentDate.getFullYear());
        } else {
            const latestYear = financialYears.reduce((prev, current) =>
                (prev.year > current.year) ? prev : current
            );
            setSelectedYear(latestYear.year);
        }
    } else if (financialYears && financialYears.length === 0) {
        setSelectedYear(currentDate.getFullYear());
    }
  }, [financialYears]);

  // Funções de manipulação para Gastos Recorrentes
  const handleAddRecurringExpenseClick = () => {
    setRecurringExpenseToEdit(null);
    setAddRecurringExpenseModalOpen(true);
  };

  const handleEditRecurringExpenseClick = (recurringExpense: RecurringExpense) => {
    setRecurringExpenseToEdit(recurringExpense);
    setAddRecurringExpenseModalOpen(true);
  };

  const handleCloseRecurringExpenseModal = (open: boolean) => {
    if (!open) {
      setRecurringExpenseToEdit(null);
      setAddRecurringExpenseModalOpen(false);
    }
  };

  const handleDeleteRecurringExpense = useMutation<DeleteRecurringExpenseResponse, Error, { id: number; name: string }>({
    mutationFn: async ({ id }): Promise<DeleteRecurringExpenseResponse> => {
      const response = await apiRequest("DELETE", `/api/recurring-expenses/${id}`);
      return response as DeleteRecurringExpenseResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/recurring-occurrences"] });
      toast({ title: "Sucesso", description: "Gasto recorrente excluído com sucesso!" });
      setRecurringExpenseToDelete(null);
    },
    onError: (error: any) => {
      console.error("Erro ao excluir gasto recorrente:", error);
      toast({ title: "Erro", description: error.message || "Falha ao excluir o gasto recorrente. Tente novamente.", variant: "destructive" });
      setRecurringExpenseToDelete(null);
    },
  });

  // Funções de manipulação para Ocorrências de Despesas
  const handleEditExpenseClick = (expense: RecentExpense) => {
    setExpenseToEdit(expense);
    setAddExpenseModalOpen(true);
  };

  const handleCloseExpenseModal = (open: boolean) => {
    if (!open) {
      setExpenseToEdit(null);
      setAddExpenseModalOpen(false);
    }
  };

  const handleDeleteExpense = useMutation<DeleteExpenseResponse, Error, { id: number; displayName: string }>({
    mutationFn: async ({ id }): Promise<DeleteExpenseResponse> => {
      const response = await apiRequest("DELETE", `/api/expenses/${id}`);
      return response as DeleteExpenseResponse;
    },
    onSuccess: (deletedResponse) => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/recurring-occurrences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });

      if (deletedResponse?.deleted?.recurringExpenseId) {
        queryClient.invalidateQueries({ queryKey: ["/api/recurring-expenses"] });
      }

      toast({ title: "Sucesso", description: "Gasto excluído com sucesso!" });
      setExpenseToDelete(null);
    },
    onError: (error: any) => {
      console.error("Erro ao excluir gasto:", error);
      toast({ title: "Erro", description: error.message || "Falha ao excluir o gasto. Tente novamente.", variant: "destructive" });
      setExpenseToDelete(null);
    },
  });

  const markAsPaidMutation = useMutation<MarkAsPaidResponse, Error, number>({
    mutationFn: async (id: number): Promise<MarkAsPaidResponse> => {
      const response = await apiRequest("PATCH", `/api/expenses/${id}/mark-as-paid`);
      return response as MarkAsPaidResponse;
    },
    onSuccess: (updatedResponse) => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/recurring-occurrences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });

      toast({ title: "Sucesso", description: "Gasto marcado como pago!" });
    },
    onError: (error: any) => {
      console.error("Error marking as paid:", error);
      toast({ title: "Erro", description: error.message || "Falha ao marcar gasto como pago. Tente novamente.", variant: "destructive" });
    },
  });


  // Agrupamento de ocorrências de despesas por recorrência
  const getGroupedGeneratedExpenses = () => {
    if (!generatedExpensesList) return {};

    const grouped: Record<string, { recurringExpense: RecurringExpense | null; expenses: RecentExpense[]; paidCount: number }> = {}; // paidCount aqui

    generatedExpensesList.forEach(exp => {
      const recurringId = exp.recurringExpenseId;
      if (recurringId) {
        const recurring = recurringExpensesList?.find(rec => rec.id === recurringId) || null;
        if (!grouped[recurringId]) {
          grouped[recurringId] = {
            recurringExpense: recurring,
            expenses: [],
            paidCount: 0 // Inicializa paidCount
          };
        }
        grouped[recurringId].expenses.push(exp);
        if (exp.paymentStatus === 'paid') { // Se a ocorrência está paga, incrementa paidCount
          grouped[recurringId].paidCount++;
        }
      }
    });

    const sortedGroupIds = Object.keys(grouped).sort((a, b) => {
        const recA = grouped[a].recurringExpense;
        const recB = grouped[b].recurringExpense;
        if (recA && recB) return recA.name.localeCompare(recB.name);
        return 0;
    });

    const sortedGrouped: typeof grouped = {};
    sortedGroupIds.forEach(id => {
      // Ordenar despesas dentro de cada grupo (pendentes primeiro, depois por data)
      grouped[id].expenses.sort((a, b) => {
          if (a.paymentStatus === 'pending' && b.paymentStatus === 'paid') return -1;
          if (a.paymentStatus === 'paid' && b.paymentStatus === 'pending') return 1;
          return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
      });
      sortedGrouped[id] = grouped[id];
    });

    return sortedGrouped;
  };

  const groupedGeneratedExpenses = getGroupedGeneratedExpenses();

  // Mês e Ano para os filtros
  const months = [
    { value: 1, label: "Janeiro" }, { value: 2, label: "Fevereiro" }, { value: 3, label: "Março" },
    { value: 4, label: "Abril" }, { value: 5, label: "Maio" }, { value: 6, label: "Junho" },
    { value: 7, label: "Julho" }, { value: 8, label: "Agosto" }, { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" }, { value: 11, label: "Novembro" }, { value: 12, label: "Dezembro" },
  ];

  // Separar recorrências ativas e pausadas
  const activeRecurringExpenses = recurringExpensesList?.filter(rec => rec.recurrenceType !== 'paused') || [];
  const pausedRecurringExpenses = recurringExpensesList?.filter(rec => rec.recurrenceType === 'paused') || [];


  return (
    <div className="p-8">
      {/* Título da Página */}
      <div className="flex flex-col gap-4 mb-8">
        <h2 className="text-3xl font-bold text-text-primary">Gerenciar Recorrências</h2>
        <p className="text-text-secondary mt-1">Configurações de gastos recorrentes e suas ocorrências geradas.</p>
      </div>

      {/* Seção de Configurações de Gastos Recorrentes */}
      <div className="grid grid-cols-1 gap-8 mb-8">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Configurações de Recorrência</CardTitle>
            <Button variant="outline" size="sm" onClick={handleAddRecurringExpenseClick}>
              <Plus className="mr-2 h-4 w-4" /> Nova Recorrência
            </Button>
          </CardHeader>
          <CardContent>
            {/* Listar recorrências ATIVAS */}
            {recurringExpensesLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : activeRecurringExpenses.length === 0 && pausedRecurringExpenses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-secondary">Nenhum gasto recorrente cadastrado.</p>
                <p className="text-text-secondary">Adicione suas despesas fixas e parceladas aqui!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeRecurringExpenses.map((recurringExpense: RecurringExpense) => {
                  const { details, description: recurringDescription } = getRecurringSubcategoryDetails(recurringExpense);
                  const displayCategoryLabel = categoryLabels[recurringExpense.routineCategory || ''] || recurringExpense.routineCategory?.replace('-', ' ') || "Ocasionais";

                  const iconToDisplay = recurringExpense.expenseType === "occasional" && recurringExpense.iconName
                                        ? React.createElement((LucideIcons as any)[recurringExpense.iconName], { className: "h-4 w-4", style: { color: '#C2185B' } })
                                        : getCategoryIcon(recurringExpense.routineCategory || recurringExpense.expenseType);

                  const iconBgColor = recurringExpense.expenseType === "occasional"
                                      ? getCategoryIconColor('occasional')
                                      : getCategoryIconColor(recurringExpense.routineCategory || '');

                  return (
                    <div
                      key={recurringExpense.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg mr-4" style={{ backgroundColor: iconBgColor }}>
                          {iconToDisplay}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{recurringExpense.name}</p>
                          <p className="text-sm text-text-secondary">
                            {displayCategoryLabel} {details && ` • ${details}`}
                            {recurringDescription && ` • ${recurringDescription}`}
                            {/* ALTERAÇÃO AQUI: USAR installmentsTrulyPaid */}
                            {recurringExpense.recurrenceType === 'determined' && recurringExpense.installmentsTotal !== null && (
                                <span className="ml-2">({recurringExpense.installmentsTrulyPaid} de {recurringExpense.installmentsTotal} parcelas pagas)</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-text-primary">
                          {formatCurrency(recurringExpense.amount)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditRecurringExpenseClick(recurringExpense);
                          }}
                        >
                          <Edit className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRecurringExpenseToDelete(recurringExpense); // Abre o AlertDialog
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Acordeão para Recorrências Pausadas */}
            {pausedRecurringExpenses.length > 0 && (
              <Accordion type="single" collapsible className="w-full mt-4 border-t pt-4">
                <AccordionItem value="paused-recurring-expenses">
                  <AccordionTrigger>
                    <h4 className="text-lg font-semibold text-text-primary">
                      Recorrências Pausadas ({pausedRecurringExpenses.length})
                    </h4>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    {pausedRecurringExpenses.map((recurringExpense: RecurringExpense) => {
                      const { details, description: recurringDescription } = getRecurringSubcategoryDetails(recurringExpense);
                      const displayCategoryLabel = categoryLabels[recurringExpense.routineCategory || ''] || recurringExpense.routineCategory?.replace('-', ' ') || "Ocasionais";

                      const iconToDisplay = recurringExpense.expenseType === "occasional" && recurringExpense.iconName
                                            ? React.createElement((LucideIcons as any)[recurringExpense.iconName], { className: "h-4 w-4", style: { color: '#C2185B' } })
                                            : getCategoryIcon(recurringExpense.routineCategory || recurringExpense.expenseType);

                      const iconBgColor = recurringExpense.expenseType === "occasional"
                                          ? getCategoryIconColor('occasional')
                                          : getCategoryIconColor(recurringExpense.routineCategory || '');

                      return (
                        <div
                          key={recurringExpense.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center">
                            <div className="p-2 rounded-lg mr-4" style={{ backgroundColor: iconBgColor }}>
                              {iconToDisplay}
                            </div>
                            <div>
                              <p className="font-medium text-text-primary">{recurringExpense.name}</p>
                              <p className="text-sm text-text-secondary">
                                {displayCategoryLabel} {details && ` • ${details}`}
                                {recurringDescription && ` • ${recurringDescription}`}
                                {/* ALTERAÇÃO AQUI: USAR installmentsTrulyPaid */}
                                {recurringExpense.recurrenceType === 'determined' && recurringExpense.installmentsTotal !== null && (
                                    <span className="ml-2">({recurringExpense.installmentsTrulyPaid} de {recurringExpense.installmentsTotal} parcelas pagas)</span>
                                )}
                                <Badge variant="secondary" className="ml-2">Pausado</Badge>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-text-primary">
                              {formatCurrency(recurringExpense.amount)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditRecurringExpenseClick(recurringExpense);
                              }}
                            >
                              <Edit className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRecurringExpenseToDelete(recurringExpense);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Seção de Ocorrências de Gastos Recorrentes (Pendentes e Pagas) */}
      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <CardTitle className="mb-2 md:mb-0">Gastos Gerados pelas Recorrências</CardTitle>
              {/* Filtros de Mês e Ano */}
              <div className="flex items-center space-x-4 mt-2 md:mt-0">
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Selecione o Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {yearsLoading ? (
                  <Skeleton className="h-10 w-24" />
                ) : financialYears && financialYears.length > 0 ? (
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {financialYears.map((fy) => (
                        <SelectItem key={fy.id} value={fy.year.toString()}>
                          {fy.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-text-secondary text-sm italic">Nenhum ano cadastrado</p>
                )}
              </div>
            </div>
            <p className="text-sm text-text-secondary">Listagem de todas as despesas geradas automaticamente por recorrências, com status e detalhes.</p>
          </CardHeader>
          <CardContent>
            {generatedExpensesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : groupedGeneratedExpenses && Object.keys(groupedGeneratedExpenses).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-secondary">Nenhuma ocorrência de recorrência encontrada para este período.</p>
                <p className="text-text-secondary">Selecione outro mês/ano ou verifique suas configurações de recorrência.</p>
              </div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {Object.entries(groupedGeneratedExpenses).map(([recurringId, groupData]) => {
                  const recurring = groupData.recurringExpense;
                  if (!recurring) return null;

                  let expensesToShow = groupData.expenses;

                  const iconToDisplay = recurring.expenseType === "occasional" && recurring.iconName
                                        ? React.createElement((LucideIcons as any)[recurring.iconName], { className: "h-5 w-5", style: { color: '#C2185B' } })
                                        : getCategoryIcon(recurring.routineCategory || recurring.expenseType);
                  const iconBgColor = recurring.expenseType === "occasional"
                                      ? getCategoryIconColor('occasional')
                                      : getCategoryIconColor(recurring.routineCategory || '');

                  return (
                    <AccordionItem value={recurringId} key={recurringId} className="border-b">
                      <AccordionTrigger>
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center">
                            <div className="p-1 rounded-full mr-2" style={{ backgroundColor: iconBgColor }}>
                              {iconToDisplay}
                            </div>
                            <h4 className="text-md font-semibold text-text-primary flex items-center">
                              <span className="capitalize">{recurring.name}</span>
                              {recurring.recurrenceType === 'determined' && (
                                // Removido o comentário JSX incorreto aqui
                                <span className="ml-2 text-sm text-text-secondary">
                                  ({groupData.paidCount} de {recurring.installmentsTotal || '?'} parcelas)
                                </span>
                              )}
                            </h4> {/* <- Garanta que esta tag <h4> esteja bem formada */}
                          </div>
                          <span className="text-md font-bold text-text-primary">
                            {formatCurrency(expensesToShow.reduce((sum, exp) => sum + parseFloat(exp.amount), 0))}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-1">
                        {expensesToShow.map((expense: RecentExpense, index: number) => {
                          const isPending = expense.paymentStatus === 'pending';
                          const itemBgColor = isPending ? 'bg-yellow-50 border-yellow-200' : (index % 2 === 0 ? 'bg-gray-50' : 'bg-white');

                          let expenseIconToDisplay: React.ReactElement;
                          const expenseIconBgColor = expense.expenseType === "occasional"
                                            ? getCategoryIconColor('occasional')
                                            : getCategoryIconColor(expense.category);

                          if (expense.expenseType === "occasional") {
                            const OccasionalIconComponent = expense.occasionalGroupIconName ? (LucideIcons as any)[expense.occasionalGroupIconName] : Star;
                            expenseIconToDisplay = React.createElement(OccasionalIconComponent, { className: "h-4 w-4", style: { color: '#C2185B' } });
                          } else {
                            expenseIconToDisplay = getCategoryIcon(expense.category);
                          }

                          const { details, description: expenseDescription } = getSubcategoryDetails(expense);
                          const displayCategoryLabel = categoryLabels[expense.category] || expense.category.replace('-', ' ');

                          return (
                            <div
                              key={expense.id}
                              className={`flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${itemBgColor}`}
                              onClick={() => handleEditExpenseClick(expense)}
                            >
                              <div className="flex items-center">
                                <div className="p-2 rounded-lg mr-4" style={{ backgroundColor: expenseIconBgColor }}>
                                  {expenseIconToDisplay}
                                </div>
                                <div>
                                  <p className="font-medium text-text-primary">
                                    {expense.displayName}
                                    {isPending && <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-400">Pendente</Badge>}
                                  </p>
                                  <p className="text-sm text-text-secondary">
                                      {displayCategoryLabel} {details && ` • ${details}`}
                                      {expenseDescription && ` • ${expenseDescription}`} • {format(new Date(expense.purchaseDate), 'd MMM', { locale: ptBR })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-text-primary">
                                  -{formatCurrency(parseFloat(expense.amount))}
                                </span>
                                {isPending ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsPaidMutation.mutate(expense.id);
                                    }}
                                    disabled={markAsPaidMutation.isPending}
                                    className="text-green-500 hover:text-green-700"
                                  >
                                    {markAsPaidMutation.isPending ? <Clock className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpenseToDelete(expense); // Abre o AlertDialog
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modais e AlertDialogs (copiados do dashboard.tsx) */}
      <AddRecurringExpenseModal
        open={addRecurringExpenseModalOpen}
        onOpenChange={handleCloseRecurringExpenseModal}
        recurringExpenseToEdit={recurringExpenseToEdit}
      />

      <AddExpenseModal
        open={addExpenseModalOpen}
        onOpenChange={handleCloseExpenseModal}
        expenseToEdit={expenseToEdit}
      />


      {/* AlertDialog de Confirmação de Exclusão de Gasto Recorrente */}
      <AlertDialog
        open={!!recurringExpenseToDelete}
        onOpenChange={(open) => !open && setRecurringExpenseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não poderá ser desfeita. Isso vai deletar a recorrência "
              <span className="font-semibold text-primary">{recurringExpenseToDelete?.name}</span>"{" "}
              permanentemente. As ocorrências já geradas e pagas permanecerão, mas novas não serão mais criadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={handleDeleteRecurringExpense.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (recurringExpenseToDelete) {
                  handleDeleteRecurringExpense.mutate({ id: recurringExpenseToDelete.id, name: recurringExpenseToDelete.name });
                }
              }}
              disabled={handleDeleteRecurringExpense.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {handleDeleteRecurringExpense.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog de Confirmação de Exclusão de Ocorrência de Despesa */}
      <AlertDialog
        open={!!expenseToDelete}
        onOpenChange={(open) => !open && setExpenseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não poderá ser desfeita. Isso vai deletar a ocorrência "
              <span className="font-semibold text-primary">{expenseToDelete?.displayName}</span>"{" "}
              permanentemente da sua lista de gastos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={handleDeleteExpense.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (expenseToDelete) {
                  handleDeleteExpense.mutate({ id: expenseToDelete.id, displayName: expenseToDelete.displayName });
                }
              }}
              disabled={handleDeleteExpense.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {handleDeleteExpense.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}