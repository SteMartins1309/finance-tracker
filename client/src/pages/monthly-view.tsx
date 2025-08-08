// src/pages/monthly-view.tsx

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import * as LucideIcons from "lucide-react";
import {
  ShoppingCart,
  Utensils,
  Car,
  Tags,
  Heart,
  Home,
  Gamepad2,
  Scissors,
  Users,
  Gift,
  DollarSign,
  Calendar,
  Info,
  ListFilter,
  Star,
  Trash2,
  BookOpen,
  ChevronDown,
  Plus,
  FileText,
  CheckCircle,
  Clock,
  Repeat2 // Importar o ícone Repeat2 para recorrências
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { AddExpenseModal } from "@/components/add-expense-modal";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { RecentExpense, RecurringExpense } from "@/types/finance";
import ProgressRing from "@/components/ProgressRing";
import React from "react";
import { Badge } from "@/components/ui/badge";

// Importações para exportação
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


interface DeleteExpenseResponse {
  message: string;
  deleted: RecentExpense;
}

interface FinancialYearData {
  id: number;
  year: number;
  totalMonthlyGoal: number;
  createdAt: string;
}

interface FullFinancialYearDetails extends FinancialYearData {
  monthlyGoals: { category: string; amount: number }[];
}

interface MarkAsPaidResponse {
  message: string;
  updated: RecentExpense;
}

export default function MonthlyView() {

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<RecentExpense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<{ id: number; displayName: string } | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Esta ref agora aponta para o contêiner GERAL de todo o conteúdo exportável
  const exportableContentRef = useRef<HTMLDivElement>(null); 

  // NOVO ESTADO: Para controlar os acordeões que precisam ser abertos para PDF
  const [expandedAccordionItems, setExpandedAccordionItems] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false); // Para ão durante a exportação

  const { data: financialYears, isLoading: yearsLoading } = useQuery<FinancialYearData[]>({
    queryKey: ["/api/financial-years"],
  });

  const { data: selectedFinancialYearDetails, isLoading: financialYearDetailsLoading } = useQuery<FullFinancialYearDetails | undefined>({
    queryKey: ["/api/financial-years", financialYears?.find(fy => fy.year === selectedYear)?.id?.toString()],
    queryFn: async ({ queryKey }) => {
        const [_baseUrl, yearId] = queryKey;
        if (!yearId) return undefined;
        const response = await apiRequest("GET", `/api/financial-years/${yearId}`);
        return response;
    },
    enabled: !!selectedYear && !!financialYears && !yearsLoading && !!financialYears?.find(fy => fy.year === selectedYear)?.id,
  });


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

  const { data: monthlyExpensesList, isLoading: listLoading } = useQuery<RecentExpense[]>({
    queryKey: ["/api/expenses/monthly", selectedYear, selectedMonth, 'all-statuses'],
    queryFn: async ({ queryKey }) => {
        const [_baseUrl, year, month] = queryKey;
        const response = await apiRequest("GET", `/api/expenses/monthly/${year}/${month}`);
        return response;
    },
    enabled: !!selectedYear && !!selectedMonth,
  });

  const { data: categoryBreakdown, isLoading: breakdownLoading } = useQuery<Array<{ category: string; total: number; percentage: number; }>>({
    queryKey: ["/api/stats/category-breakdown", selectedYear, selectedMonth],
    queryFn: async ({ queryKey }) => {
        const [_baseUrl, year, month] = queryKey;
        const url = `/api/stats/category-breakdown/${year}?month=${month}`;
        const response = await apiRequest("GET", url); 
        return response;
    },
    enabled: !!selectedYear && !!selectedMonth,
  });

  const categoryLabels: Record<string, string> = {
    'fixed': "Fixos", 'supermarket': "Supermercado", 'food': "Alimentação", 'services': "Serviços", 'study': "Estudos",
    'leisure': "Lazer", 'personal-care': "Cuidado Pessoal", 'shopping': "Compras", 'transportation': "Transporte",
    'health': "Saúde", 'family': "Família", 'charity': "Caridade", 'occasional': "Ocasionais",
  };

  const FIXED_CATEGORY_ORDER: string[] = [
    'fixed', 'supermarket', 'food', 'services', 'study', 'leisure', 'personal-care',
    'shopping', 'transportation', 'health', 'family', 'charity',
  ];

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
      case "occasional":
        return "#FFEBEE";
      case "total": return "#DDEBF7";
      default: return "#E5E7EB";
    }
  };

  const getCategoryMonthlyGoal = (category: string): number => {
    const goal = selectedFinancialYearDetails?.monthlyGoals?.find(g => g.category === category);
    return goal ? goal.amount : 0;
  };


  const getProgressRingColor = (percentage: number): string => {
    if (percentage < 75) return "#4CAF50";
    if (percentage >= 75 && percentage < 95) return "#FFC107";
    if (percentage >= 95 && percentage <= 100) return "#FF8C00";
    return "#F44336";
  };

  const getProgressData = (spent: number, goal: number) => {
    const percentage = goal > 0 ? Math.round((spent / goal) * 100) : 0;
    const remainingOrOver = goal - spent;
    return { percentage, color: getProgressRingColor(percentage), remainingOrOver };
  };

  const totalMonthly = monthlyExpensesList?.reduce((sum, expense) => sum + parseFloat(expense.amount), 0) || 0;
  const totalRoutine = monthlyExpensesList?.filter(e => e.expenseType === 'routine').reduce((sum, expense) => sum + parseFloat(expense.amount), 0) || 0;
  const totalOccasional = monthlyExpensesList?.filter(e => e.expenseType === 'occasional').reduce((sum, expense) => sum + parseFloat(expense.amount), 0) || 0;

  const months = [
    { value: 1, label: "Janeiro" }, { value: 2, label: "Fevereiro" }, { value: 3, label: "Março" },
    { value: 4, label: "Abril" }, { value: 5, label: "Maio" }, { value: 6, label: "Junho" },
    { value: 7, label: "Julho" }, { value: 8, label: "Agosto" }, { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" }, { value: 11, label: "Novembro" }, { value: 12, label: "Dezembro" },
  ];

  const availableYears = financialYears?.map(fy => fy.year) || [];

  const isPageLoading = listLoading || breakdownLoading || yearsLoading || financialYearDetailsLoading;

  const deleteExpenseMutation = useMutation<DeleteExpenseResponse, Error, number>({
    mutationFn: async (id: number): Promise<DeleteExpenseResponse> => {
      const response = await apiRequest("DELETE", `/api/expenses/${id}`);
      return response as DeleteExpenseResponse;
    },
    onSuccess: (deletedResponse) => {
      if (deletedResponse?.deleted?.purchaseDate) {
        const purchaseDate = new Date(deletedResponse.deleted.purchaseDate);
        const year = purchaseDate.getFullYear();
        const month = purchaseDate.getMonth() + 1;

        queryClient.invalidateQueries({ queryKey: ["/api/expenses/recent"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats/monthly"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats/category-breakdown", new Date().getFullYear()] });

        queryClient.invalidateQueries({ queryKey: ["/api/expenses/monthly", year, month] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats/category-breakdown", year, month] });

        queryClient.invalidateQueries({ queryKey: ["/api/stats/annual", year] });
        queryClient.invalidateQueries({ queryKey: ["/api/expenses/yearly/monthly-summary", year] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
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
      if (updatedResponse?.updated?.purchaseDate) {
        const purchaseDate = new Date(updatedResponse.updated.purchaseDate);
        const year = purchaseDate.getFullYear();
        const month = purchaseDate.getMonth() + 1;

        queryClient.invalidateQueries({ queryKey: ["/api/expenses/recent"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats/monthly"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats/category-breakdown", new Date().getFullYear()] });

        queryClient.invalidateQueries({ queryKey: ["/api/expenses/monthly", year, month] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats/category-breakdown", year, month] });

        queryClient.invalidateQueries({ queryKey: ["/api/stats/annual", year] });
        queryClient.invalidateQueries({ queryKey: ["/api/expenses/yearly/monthly-summary", year] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      }

      toast({ title: "Sucesso", description: "Gasto marcado como pago!" });
    },
    onError: (error: any) => {
      console.error("Error marking as paid:", error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao marcar gasto como pago. Tente novamente.",
        variant: "destructive",
      });
    },
  });


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

  const handleDeleteExpense = (expense: { id: number; displayName: string }) => {
    setExpenseToDelete(expense);
  };

  const getSubcategoryDetails = (expense: RecentExpense) => {
  let details: string[] = [];
  let descriptionText: string | null = null;
  let actualCategory = expense.recurringExpenseId ? (expense.recurringRoutineCategory ?? null) : (expense.routineCategory ?? null);

  if (expense.expenseType === 'routine') {
    switch (actualCategory) {
      case 'food':
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
        descriptionText = expense.recurringExpenseId ? (expense.recurringServiceDescription ?? null) : (expense.serviceDescription ?? null);
      break;
      case 'study':
        descriptionText = expense.recurringExpenseId ? (expense.recurringStudyDescription ?? null) : (expense.studyDescription ?? null);
      break;
      case 'leisure':
        descriptionText = expense.recurringExpenseId ? (expense.recurringLeisureDescription ?? null) : (expense.leisureDescription ?? null);
      break;
      case 'personal-care':
        descriptionText = expense.recurringExpenseId ? (expense.recurringPersonalCareDescription ?? null) : (expense.personalCareDescription ?? null);
      break;
      case 'shopping':
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
        descriptionText = expense.recurringExpenseId ? (expense.recurringHealthDescription ?? null) : (expense.healthDescription ?? null);
      break;
      case 'family':
        descriptionText = expense.recurringExpenseId ? (expense.recurringFamilyDescription ?? null) : (expense.familyDescription ?? null);
      break;
      case 'charity':
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


  // Filtra e agrupa gastos de ROTINA por rotineCategory
  const getGroupedRoutineExpenses = () => {
    if (!monthlyExpensesList) return {};

    const routineExpenses = monthlyExpensesList.filter(exp => exp.expenseType === 'routine');

    const tempGrouped: Record<string, { total: number; goal: number; expenses: RecentExpense[] }> = {};

    routineExpenses.forEach(exp => {
      const category = (exp.recurringExpenseId ? exp.recurringRoutineCategory : exp.routineCategory) || 'unknown';
      if (category) {
        if (!tempGrouped[category]) {
          tempGrouped[category] = {
            total: 0,
            goal: getCategoryMonthlyGoal(category),
            expenses: []
          };
        }
        if (exp.paymentStatus === 'paid') {
            tempGrouped[category].total += parseFloat(exp.amount);
        }
        tempGrouped[category].expenses.push(exp);
      }
    });

    const finalGrouped: typeof tempGrouped = {};

    FIXED_CATEGORY_ORDER.forEach(catKey => {
      finalGrouped[catKey] = {
        total: 0,
        goal: getCategoryMonthlyGoal(catKey),
        expenses: []
      };
    });

    Object.keys(tempGrouped).forEach(catKey => {
      if (finalGrouped[catKey]) {
        finalGrouped[catKey].total = tempGrouped[catKey].total;
        finalGrouped[catKey].expenses = tempGrouped[catKey].expenses;
      }
    });

    const filteredAndSortedGrouped: typeof tempGrouped = {};
    FIXED_CATEGORY_ORDER.forEach(catKey => {
      if (finalGrouped[catKey] && (finalGrouped[catKey].expenses.length > 0 || finalGrouped[catKey].goal > 0)) {
        finalGrouped[catKey].expenses.sort((a, b) => {
            if (a.paymentStatus === 'pending' && b.paymentStatus === 'paid') return -1;
            if (a.paymentStatus === 'paid' && b.paymentStatus === 'pending') return 1;
            return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
        });
        filteredAndSortedGrouped[catKey] = finalGrouped[catKey];
      }
    });

    return filteredAndSortedGrouped;
  };

  // Filtra e agrupa gastos OCASIONAIS por occasionalGroupId
  const getGroupedOccasionalExpenses = () => {
    if (!monthlyExpensesList) return {};

    const occasionalExpenses = monthlyExpensesList.filter(exp => exp.expenseType === 'occasional');
    const grouped: Record<string, { total: number; expenses: RecentExpense[]; groupName: string; groupDescription?: string | null; groupIconName?: string | null }> = {};

    occasionalExpenses.forEach(exp => {
      if (exp.occasionalGroupId !== null) {
        const groupId = String(exp.occasionalGroupId);
        if (!grouped[groupId]) {
          grouped[groupId] = {
            total: 0,
            expenses: [],
            groupName: exp.occasionalGroupName || "Grupo Ocasional",
            groupDescription: exp.occasionalGroupDescription,
            groupIconName: exp.occasionalGroupIconName
          };
        }
        if (exp.paymentStatus === 'paid') {
            grouped[groupId].total += parseFloat(exp.amount);
        }
        grouped[groupId].expenses.push(exp);
      }
    });

    const sortedGroupIds = Object.keys(grouped)
        .filter(groupId => grouped[groupId].expenses.length > 0)
        .sort((a, b) => {
            return grouped[a].groupName.localeCompare(grouped[b].groupName);
        });

    const sortedGrouped: typeof grouped = {};
    sortedGroupIds.forEach(id => {
      const expensesInGroup = grouped[id].expenses;
      const groupedByRoutineCategoryInOccasional: Record<string, RecentExpense[]> = {};

      expensesInGroup.forEach(exp => {
        const internalCategory = (exp.recurringExpenseId ? exp.recurringRoutineCategory : exp.routineCategory) || 'outros-ocasionais';
        if (!groupedByRoutineCategoryInOccasional[internalCategory]) {
          groupedByRoutineCategoryInOccasional[internalCategory] = [];
        }
        groupedByRoutineCategoryInOccasional[internalCategory].push(exp);
      });

      const sortedInternalCategoryKeys = FIXED_CATEGORY_ORDER.filter(key => groupedByRoutineCategoryInOccasional[key] && groupedByRoutineCategoryInOccasional[key].length > 0)
                                           .concat(Object.keys(groupedByRoutineCategoryInOccasional).filter(key => !FIXED_CATEGORY_ORDER.includes(key)));

      const sortedInternalExpenses: RecentExpense[] = [];
      sortedInternalCategoryKeys.forEach(internalCatKey => {
          groupedByRoutineCategoryInOccasional[internalCatKey].sort((a, b) => {
              if (a.paymentStatus === 'pending' && b.paymentStatus === 'paid') return -1;
              if (a.paymentStatus === 'paid' && b.paymentStatus === 'pending') return 1;
              return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
          });
          sortedInternalExpenses.push(...groupedByRoutineCategoryInOccasional[internalCatKey]);
      });
      sortedGrouped[id] = { ...grouped[id], expenses: sortedInternalExpenses };
    });

    return sortedGrouped;
  };

  const groupedRoutineExpenses = getGroupedRoutineExpenses();
  const groupedOccasionalExpenses = getGroupedOccasionalExpenses();

  const totalMonthlyGoalAmount = selectedFinancialYearDetails?.totalMonthlyGoal || 0;
  const { percentage: totalMonthlyProgress, color: totalMonthlyProgressColor, remainingOrOver: totalRemainingOrOver } = getProgressData(totalMonthly, totalMonthlyGoalAmount);

  // Função para exportar para PDF
  const handleExportPdf = async () => {
    if (!monthlyExpensesList || monthlyExpensesList.length === 0) {
      toast({
        title: "Erro",
        description: "Não há gastos para exportar.",
        variant: "destructive",
      });
      return;
    }

    const input = exportableContentRef.current; // Usa a referência para o acordeão de detalhes

    if (input) {
      toast({
        title: "Exportando para PDF...",
        description: "Seu relatório está sendo gerado.",
      });
      try {
        // Renderiza o componente para um canvas
        // É aqui que precisamos garantir que os acordeões estejam abertos.
        // Vamos desabilitar temporariamente o botão para evitar cliques múltiplos.
        setIsExporting(true); // Desabilita o botão

        // 1. Abrir todos os acordeões antes de gerar o PDF
        // Obtenha as chaves de todos os acordeões que você quer abrir
        const allRoutineAccordionKeys = Object.keys(groupedRoutineExpenses);
        const allOccasionalGroupAccordionKeys = Object.keys(groupedOccasionalExpenses);

        // Chaves para os acordeões internos dentro dos grupos ocasionais
        let allInternalOccasionalAccordionKeys: string[] = [];
        Object.values(groupedOccasionalExpenses).forEach(groupData => {
            Object.keys(groupData.expenses.reduce((acc: Record<string, RecentExpense[]>, expense: RecentExpense) => {
                const internalCategory = (expense.recurringExpenseId ? expense.recurringRoutineCategory : expense.routineCategory) || 'outros-ocasionais';
                if (!acc[internalCategory]) acc[internalCategory] = [];
                acc[internalCategory].push(expense);
                return acc;
            }, {})).forEach(key => {
                // Para os acordeões internos, o valor é o internalCatKey.
                // Mas o Accordion tem um value={internalCatKey}. No entanto, ele está dentro de um AccordionItem
                // que já é agrupado pelo groupId.
                // Precisamos abrir os acordeões internos também.
                // O Accordion do shadcn/ui pode receber um array de valores para `value`
                // para abrir múltiplos itens.
                allInternalOccasionalAccordionKeys.push(key);
            });
        });


        const itemsToExpand = [
            "detailed-expenses-main", // Acordeão principal de detalhes
            ...allRoutineAccordionKeys, // Acordeões de categorias de rotina
            ...allOccasionalGroupAccordionKeys, // Acordeões de grupos ocasionais
            ...allInternalOccasionalAccordionKeys, // Acordeões de categorias internas em grupos ocasionais
            "progress-overview" // Acordeão de Progresso das Metas
        ];

        // Atualiza o estado para abrir todos os acordeões necessários
        setExpandedAccordionItems(itemsToExpand);

        // Aguarda a renderização dos acordeões abertos
        // Um pequeno delay para o DOM atualizar após a mudança de estado
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms é um bom tempo


        const canvas = await html2canvas(input, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = pdf.internal.pageSize.getWidth() - 20;
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 10;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight + 10;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        const monthName = months[selectedMonth - 1].label;
        pdf.save(`relatorio_mensal_${monthName}_${selectedYear}.pdf`);
        toast({ title: "Sucesso", description: "Relatório PDF exportado!" });

      } catch (error) {
        console.error("Erro ao exportar PDF:", error);
        toast({
          title: "Erro na Exportação",
          description: "Falha ao gerar o PDF. Verifique o console para mais detalhes.",
          variant: "destructive",
        });
      } finally {
        // 2. Voltar todos os acordeões ao estado colapsado após a exportação
        setExpandedAccordionItems([]); // Colapsa todos os acordeões de volta
        setIsExporting(false); // Reabilita o botão
      }
    } else {
      toast({
        title: "Erro na Exportação",
        description: "Conteúdo para exportar não encontrado. Certifique-se de que o elemento de detalhes esteja montado.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="p-8">
      {/* Título da Página e Botões de Ação */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-text-primary">Visualização Mensal</h2>
            <p className="text-text-secondary mt-1">Detalhes por categoria e visão geral</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <Button
            onClick={() => {
              setExpenseToEdit(null);
              setAddExpenseModalOpen(true);
            }}
            className="bg-primary hover:bg-blue-700 text-white px-6 py-3 font-medium shadow-lg w-fit"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar gasto
          </Button>

          <Button
            onClick={handleExportPdf}
            disabled={isExporting || isPageLoading || !monthlyExpensesList || monthlyExpensesList.length === 0} // Desabilita o botão
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 font-medium shadow-lg"
          >
            <FileText className="mr-2 h-4 w-4" />
            {isExporting ? "Gerando PDF..." : "Exportar PDF"}
          </Button>
        </div>

        <p className="text-sm text-text-secondary">Selecione o mês e o ano desejados:</p>
        <div className="flex items-center space-x-4">
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

      {/* Cards de Soma Total, Rotina e Ocasionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-8">

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Total Mensal</p>
                {isPageLoading ? (
                  <Skeleton className="h-8 w-32 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-text-primary">
                    {formatCurrency(totalMonthly)}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: getCategoryIconColor('total') }}>
                <Info className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Rotina</p>
                {isPageLoading ? (
                  <Skeleton className="h-8 w-32 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-text-primary">
                    {formatCurrency(totalRoutine)}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Ocasionais</p>
                {isPageLoading ? (
                  <Skeleton className="h-8 w-32 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-text-primary">
                    {formatCurrency(totalOccasional)}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: getCategoryIconColor('occasional') }}>
                <Star className="h-5 w-5 text-[#C2185B]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NOVO CONTAINER ENVOLVENTE PARA EXPORTAÇÃO */}
      {/* Todo o conteúdo que você quer no PDF deve estar dentro deste div */}
      <div ref={exportableContentRef}>

        {/* Acordeão para Detalhes dos Gastos */}
        {/* MODIFICADO: Adicionado 'value' e 'onValueChange' para controlar expansão */}
        <Accordion
          type="multiple" // Mude para 'multiple' para permitir vários abertos
          value={expandedAccordionItems}
          onValueChange={setExpandedAccordionItems}
          className="w-full mt-8"
        >
          <AccordionItem value="detailed-expenses-main"> {/* Mude o value para ser único e controlável */}
            <AccordionTrigger className="flex justify-between items-center p-4 rounded-lg bg-card shadow-sm hover:bg-muted/50 transition-colors mb-4">
              <h3 className="text-2xl font-bold text-text-primary">Detalhes dos Gastos por Categoria e Grupo</h3>
              <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200" />
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sessão Esquerda: Gastos de Rotina por Categoria */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-text-primary" />
                      Gastos de Rotina por Categoria
                    </CardTitle>
                    <p className="text-sm text-text-secondary">Todos os seus gastos de rotina, organizados por categoria.</p>
                  </CardHeader>
                  <CardContent>
                    {isPageLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                      </div>
                    ) : Object.keys(groupedRoutineExpenses).length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-text-secondary text-lg">Nenhum gasto de rotina encontrado para este mês.</p>
                        <p className="text-text-secondary">Adicione alguns gastos de rotina ou selecione outro mês.</p>
                      </div>
                    ) : (
                      <Accordion
                        type="multiple" // Necessário para abrir múltiplas categorias de rotina
                        value={expandedAccordionItems} // Controlado pelo estado
                        onValueChange={setExpandedAccordionItems} // Atualiza o estado quando o usuário clica
                        className="w-full"
                      >
                        {Object.entries(groupedRoutineExpenses).map(([categoryKey, data]) => {
                          return (
                            <AccordionItem value={categoryKey} key={categoryKey} className="border-b">
                              <AccordionTrigger>
                                <div className="flex items-center justify-between w-full pr-4">
                                  <div className="flex items-center">
                                    <div className="p-1 rounded-full mr-2" style={{ backgroundColor: getCategoryIconColor(categoryKey) }}>
                                      {getCategoryIcon(categoryKey)}
                                    </div>
                                    <h4 className="text-md font-semibold text-text-primary flex items-center">
                                      <span className="capitalize">{categoryLabels[categoryKey] || categoryKey.replace('-', ' ')}</span>
                                    </h4>
                                  </div>
                                  <span className="text-md font-bold text-text-primary">
                                    {formatCurrency(data.total)}
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="space-y-1">
                                {data.expenses.map((expense: RecentExpense, index: number) => {
                                  const isPending = expense.paymentStatus === 'pending';
                                  const itemBgColor = isPending ? 'bg-yellow-50 border-yellow-200' : (index % 2 === 0 ? 'bg-gray-50' : 'bg-white');

                                  let iconToDisplay: React.ReactElement;
                                  const iconBgColor = expense.expenseType === "occasional"
                                                      ? getCategoryIconColor('occasional')
                                                      : getCategoryIconColor(expense.category);

                                  if (expense.expenseType === "occasional") {
                                    const OccasionalIconComponent = expense.occasionalGroupIconName ? (LucideIcons as any)[expense.occasionalGroupIconName] : Star;
                                    iconToDisplay = React.createElement(OccasionalIconComponent, { className: "h-4 w-4", style: { color: '#C2185B' } });
                                  } else {
                                    iconToDisplay = getCategoryIcon(expense.category);
                                  }

                                  const { details, description: expenseDescription } = getSubcategoryDetails(expense);

                                  return (
                                    <div
                                      key={expense.id}
                                      className={`flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${itemBgColor}`}
                                      onClick={() => handleEditExpenseClick(expense)}
                                    >
                                      <div className="flex items-center">
                                        <div className="p-2 rounded-lg mr-4" style={{ backgroundColor: iconBgColor }}>
                                          {iconToDisplay}
                                        </div>
                                        <div>
                                          <p className="font-medium text-text-primary">
                                            {expense.displayName}
                                            {isPending && <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-400">Pendente</Badge>}
                                          </p>
                                          <p className="text-sm text-text-secondary">
                                            {categoryLabels[expense.category] || "Categoria"} {details && ` • ${details}`}
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
                                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
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
                                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                              e.stopPropagation();
                                              handleDeleteExpense({ id: expense.id, displayName: expense.displayName });
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

                {/* Sessão Direita: Gastos Ocasionais por Grupo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="mr-2 h-5 w-5 text-text-primary" />
                      Gastos Ocasionais por Grupo
                    </CardTitle>
                    <p className="text-sm text-text-secondary">Todos os seus gastos de ocasião, organizados por grupo.</p>
                  </CardHeader>
                  <CardContent>
                    {isPageLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                      </div>
                    ) : Object.keys(groupedOccasionalExpenses).length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-text-secondary text-lg">Nenhum gasto ocasional encontrado para este mês.</p>
                        <p className="text-text-secondary">Adicione alguns gastos de ocasião ou selecione outro mês.</p>
                      </div>
                    ) : (
                      <Accordion
                        type="multiple" // Necessário para abrir múltiplos grupos ocasionais
                        value={expandedAccordionItems} // Controlado pelo estado
                        onValueChange={setExpandedAccordionItems} // Atualiza o estado quando o usuário clica
                        className="w-full"
                      >
                        {Object.entries(groupedOccasionalExpenses).map(([groupId, groupData]) => (
                          <AccordionItem value={groupId} key={groupId} className="border-b">
                            <AccordionTrigger>
                              <div className="flex items-center justify-between w-full pr-4">
                                <div className="flex items-center">
                                  <div className="p-1 rounded-full mr-2" style={{ backgroundColor: getCategoryIconColor('occasional') }}>
                                    {groupData.groupIconName
                                      ? React.createElement((LucideIcons as any)[groupData.groupIconName], { className: "h-5 w-5", style: { color: '#C2185B' } })
                                      : <Star className="h-5 w-5 text-[#C2185B]" />
                                    }
                                  </div>
                                  <h4 className="text-md font-semibold text-text-primary flex items-center">
                                    <span className="capitalize">{groupData.groupName}</span>
                                  </h4>
                                </div>
                                <span className="text-md font-bold text-text-primary">
                                  {formatCurrency(groupData.total)}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-1">
                              {Object.entries(
                                groupData.expenses.reduce((acc: Record<string, RecentExpense[]>, expense: RecentExpense) => {
                                  const internalCategory = (expense.recurringExpenseId ? expense.recurringRoutineCategory : expense.routineCategory) || 'outros-ocasionais';
                                  if (!acc[internalCategory]) {
                                    acc[internalCategory] = [];
                                  }
                                  acc[internalCategory].push(expense);
                                  return acc;
                                }, {} as Record<string, RecentExpense[]>)
                              )
                              .sort(([catA], [catB]) => {
                                  const indexA = FIXED_CATEGORY_ORDER.indexOf(catA);
                                  const indexB = FIXED_CATEGORY_ORDER.indexOf(catB);
                                  if (indexA === -1 && indexB === -1) return 0;
                                  if (indexA === -1) return 1;
                                  if (indexB === -1) return -1;
                                  return indexA - indexB;
                              })
                              .map(([internalCatKey, expensesInInternalCat]) => {
                                  const displayOccasionalCategoryLabel = categoryLabels[internalCatKey] || internalCatKey.replace('-', ' ');

                                  return (
                                      <Accordion
                                        type="multiple" // Necessário para abrir múltiplas categorias internas
                                        value={expandedAccordionItems} // Controlado pelo estado
                                        onValueChange={setExpandedAccordionItems} // Atualiza o estado quando o usuário clica
                                        className="w-full pl-4"
                                        key={internalCatKey}
                                      >
                                          <AccordionItem value={internalCatKey} className="border-none">
                                              <AccordionTrigger className="font-semibold text-sm py-2">
                                                  <div className="flex items-center justify-between w-full pr-4">
                                                      <div className="flex items-center">
                                                          <div className="p-1 rounded-full mr-2" style={{ backgroundColor: getCategoryIconColor(internalCatKey) }}>
                                                              {getCategoryIcon(internalCatKey)}
                                                          </div>
                                                          <span className="capitalize">{displayOccasionalCategoryLabel}</span>
                                                      </div>
                                                      <span className="text-sm font-bold">
                                                          {formatCurrency(expensesInInternalCat.filter(exp => exp.paymentStatus === 'paid').reduce((sum: number, exp: RecentExpense) => sum + parseFloat(exp.amount), 0))}
                                                      </span>
                                                  </div>
                                              </AccordionTrigger>
                                              <AccordionContent className="space-y-1 pl-4">
                                                  {expensesInInternalCat.map((expense: RecentExpense, idx: number) => {
                                                      const isPending = expense.paymentStatus === 'pending';
                                                      const itemBgColor = isPending ? 'bg-yellow-50 border-yellow-200' : (idx % 2 === 0 ? 'bg-gray-50' : 'bg-white');

                                                      const iconToDisplay = expense.expenseType === "occasional"
                                                        ? (expense.occasionalGroupIconName
                                                            ? React.createElement((LucideIcons as any)[expense.occasionalGroupIconName], { className: "h-4 w-4", style: { color: '#C2185B' } })
                                                            : <Star className="h-4 w-4 text-[#C2185B]" />
                                                          )
                                                        : getCategoryIcon(expense.category);


                                                      const iconBgColor = expense.expenseType === "occasional"
                                                        ? getCategoryIconColor('occasional')
                                                        : getCategoryIconColor(expense.category);


                                                      const { details, description: expenseDescription } = getSubcategoryDetails(expense);

                                                      return (
                                                        <div
                                                          key={expense.id}
                                                          className={`flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${itemBgColor}`}
                                                          onClick={() => handleEditExpenseClick(expense)}
                                                        >
                                                          <div className="flex items-center">
                                                            <div className="p-2 rounded-lg mr-4" style={{ backgroundColor: iconBgColor }}>
                                                              {iconToDisplay}
                                                            </div>
                                                            <div>
                                                              <p className="font-medium text-text-primary">
                                                                {expense.displayName}
                                                                {isPending && <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-400">Pendente</Badge>}
                                                              </p>
                                                              <p className="text-sm text-text-secondary">
                                                                {displayOccasionalCategoryLabel} {details && ` • ${details}`}
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
                                                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
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
                                                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                                  e.stopPropagation();
                                                                  handleDeleteExpense({ id: expense.id, displayName: expense.displayName });
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
                                      </Accordion>
                                  )})}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}
                  </CardContent>
                </Card>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>


        {/* Acordeão para Progresso das Metas */}
        <Accordion type="single" collapsible className="w-full mt-8">
          <AccordionItem value="progress-overview">
            <AccordionTrigger className="flex justify-between items-center p-4 rounded-lg bg-card shadow-sm hover:bg-muted/50 transition-colors mb-4">
              <h3 className="text-2xl font-bold text-text-primary">Progresso das Metas</h3>
              <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200" />
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-0">
              {/* Legenda das Cores */}
              <div className="mb-6 p-4 bg-purple-50 rounded-lg text-sm text-purple-950 border border-purple-200">
                  <p className="font-semibold mb-2">Cores nos Anéis de Progresso:</p>
                  <ul className="list-disc list-inside space-y-1">
                      <li className="flex items-center">
                          <span className="inline-block w-4 h-4 rounded-full mr-2" style={{ backgroundColor: getProgressRingColor(50) }}></span>
                          Verde: Gasto abaixo de 75% da meta.
                      </li>
                      <li className="flex items-center">
                          <span className="inline-block w-4 h-4 rounded-full mr-2" style={{ backgroundColor: getProgressRingColor(85) }}></span>
                          Amarelo: Gasto entre 75% e 95% da meta.
                      </li>
                      <li className="flex items-center">
                          <span className="inline-block w-4 h-4 rounded-full mr-2" style={{ backgroundColor: getProgressRingColor(97) }}></span>
                          Laranja: Gasto entre 95% e 100% da meta.
                      </li>
                      <li className="flex items-center">
                          <span className="inline-block w-4 h-4 rounded-full mr-2" style={{ backgroundColor: getProgressRingColor(101) }}></span>
                          Vermelho: Gasto acima de 100% da meta (meta estourada).
                      </li>
                  </ul>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {/* Total Monthly Progress Card */}
                <Card className="flex flex-col p-4 shadow-md hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="p-0 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full" style={{ backgroundColor: getCategoryIconColor('total') }}>
                        <Info className="h-5 w-5 text-gray-600" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-text-primary">Total Mensal</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 flex justify-between items-center mt-4">
                    <div className="text-left">
                      <p className="text-xl font-bold text-text-primary mb-1">
                        {formatCurrency(totalMonthly)}
                      </p>
                      {totalMonthlyGoalAmount > 0 ? (
                        <>
                          <p className="text-sm text-text-secondary">
                            Meta: {formatCurrency(totalMonthlyGoalAmount)}
                          </p>
                          <p className={`text-xs mt-1 font-medium ${totalRemainingOrOver >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {totalRemainingOrOver >= 0 ? `Sobrando ${formatCurrency(totalRemainingOrOver)}` : `Estourou ${formatCurrency(Math.abs(totalRemainingOrOver))}`}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-text-secondary">Nenhuma meta definida</p>
                      )}
                    </div>
                    {isPageLoading ? (
                      <Skeleton className="h-24 w-24 rounded-full" />
                    ) : (
                      <div className="flex-shrink-0">
                        <ProgressRing radius={50} stroke={8} progress={totalMonthlyProgress} color={totalMonthlyProgressColor} />
                      </div>
                    )}
                  </CardContent>
                </Card>


                {/* Routine Categories Progress Cards */}
                {isPageLoading ? (
                  <>
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
                  </>
                ) : (
                  Object.entries(groupedRoutineExpenses).map(([categoryKey, data]) => {
                    const { percentage, color: progressColor, remainingOrOver } = getProgressData(data.total, data.goal);
                    if (data.total === 0 && data.goal === 0) return null;


                    return (
                      <Card key={categoryKey} className="flex flex-col p-4 shadow-md hover:shadow-lg transition-shadow duration-200">
                        <CardHeader className="p-0 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full" style={{ backgroundColor: getCategoryIconColor(categoryKey) }}>
                              {getCategoryIcon(categoryKey)}
                            </div>
                            <CardTitle className="text-lg font-semibold text-text-primary capitalize">
                              {categoryLabels[categoryKey] || categoryKey.replace('-', ' ')}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0 flex justify-between items-center mt-4">
                          <div className="text-left">
                            <p className="text-xl font-bold text-text-primary mb-1">
                              {formatCurrency(data.total)}
                            </p>
                            {data.goal > 0 ? (
                              <>
                                <p className="text-sm text-text-secondary">
                                  Meta: {formatCurrency(data.goal)}
                                </p>
                                <p className={`text-xs mt-1 font-medium ${remainingOrOver >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {remainingOrOver >= 0 ? `Sobrando ${formatCurrency(remainingOrOver)}` : `Estourou ${formatCurrency(Math.abs(remainingOrOver))}`}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-text-secondary">Nenhuma meta definida</p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <ProgressRing radius={50} stroke={8} progress={percentage} color={progressColor} />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

      </div>

      {/* Modal de adição/edição de despesa normal */}
      <AddExpenseModal
        open={addExpenseModalOpen}
        onOpenChange={handleCloseExpenseModal}
        expenseToEdit={expenseToEdit}
      />


      {/* AlertDialog de Confirmação de Exclusão */}
      <AlertDialog
        open={!!expenseToDelete}
        onOpenChange={(open) => !open && setExpenseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não poderá ser desfeita. Isso vai deletar os gastos com{" "}
              <span className="font-semibold text-primary">{expenseToDelete?.displayName}</span>{" "}
              permanentemente da sua sua lista de gastos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteExpenseMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (expenseToDelete) {
                  deleteExpenseMutation.mutate(expenseToDelete.id);
                }
              }}
              disabled={deleteExpenseMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteExpenseMutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}