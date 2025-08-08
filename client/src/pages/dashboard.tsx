// src/pages/dashboard.tsx

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { Skeleton } from "@/components/ui/skeleton";
import * as LucideIcons from "lucide-react";
import {
    Plus,
    TrendingDown,
    TrendingUp,
    Calculator,
    Tags,
    ShoppingCart,
    Utensils,
    Car,
    DollarSign,
    Home,
    Gamepad2,
    Scissors,
    Heart,
    Users,
    Gift,
    Star,
    Trash2,
    BookOpen,
    CheckCircle,
    Clock,
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
import { Link } from "wouter";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { RecentExpense } from "@/types/finance";


// ==========================================================
// NOVAS DEFINIÇÕES DE INTERFACES E TIPOS
// ==========================================================
// Essas interfaces foram comentadas no seu código original, mas são importantes
// para a tipagem, então vamos mantê-las aqui como referência ou assumir que
// estão importadas de um arquivo de tipos como 'finance.ts'
// ==========================================================

// Interfaces para tipar os dados (mantidas, pois são usadas aqui ou reexportadas para outros componentes)
interface MonthlyStats {
    monthlyTotal: number;
    yearlyTotal: number;
    averageMonthly: number;
    categoriesCount: number;
}

interface DeleteExpenseResponse {
    message: string;
    deleted: RecentExpense;
}

interface MarkAsPaidResponse {
    message: string;
    updated: RecentExpense;
}

const categoryLabels: Record<string, string> = {
    "fixed": "Fixos",
    "supermarket": "Supermercado",
    "food": "Alimentação",
    "services": "Serviços",
    "study": "Estudos",
    "leisure": "Lazer",
    "personal-care": "Cuidado Pessoal",
    "shopping": "Compras",
    "transportation": "Transporte",
    "health": "Saúde",
    "family": "Família",
    "charity": "Caridade",
    "occasional": "Ocasionais",
};

// Funções auxiliares de ícones e cores (mantidas)
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


export default function Dashboard() {
    const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState<RecentExpense | null>(null);
    const [expenseToDelete, setExpenseToDelete] = useState<{ id: number; displayName: string } | null>(null);

    const { toast } = useToast();
    const queryClient = useQueryClient();

    // NOVO: Mutação para alternar o status de pagamento
    const togglePaymentStatusMutation = useMutation({
    mutationFn: async (expenseId: number) => {
        const expenseToUpdate = recentExpenses?.find(e => e.id === expenseId);
        if (!expenseToUpdate) {
            throw new Error("Despesa não encontrada.");
        }
        const newStatus = expenseToUpdate.paymentStatus === 'paid' ? 'pending' : 'paid';
        const response = await apiRequest("PATCH", `/api/expenses/${expenseId}/payment-status`, { paymentStatus: newStatus });
        return response as RecentExpense;
    },
    // Função para atualização otimista
    onMutate: async (expenseId: number) => {
        await queryClient.cancelQueries({ queryKey: ["/api/expenses/recent", { limit: 10, includeAll: true }] });

        const previousRecentExpenses = queryClient.getQueryData<RecentExpense[]>(["/api/expenses/recent", { limit: 10, includeAll: true }]);

        if (previousRecentExpenses) {
            queryClient.setQueryData<RecentExpense[]>(
                ["/api/expenses/recent", { limit: 10, includeAll: true }],
                (old) => {
                    return old?.map((expense) => {
                        if (expense.id === expenseId) {
                            return {
                                ...expense,
                                paymentStatus: expense.paymentStatus === 'paid' ? 'pending' : 'paid',
                            };
                        }
                        return expense;
                    }) || [];
                }
            );
        }

        return { previousRecentExpenses };
    },
    // Caso a mutação seja bem-sucedida, invalida as queries para garantir consistência
    onSuccess: (updatedExpense) => {
        const purchaseDate = new Date(updatedExpense.purchaseDate);
        const year = purchaseDate.getFullYear();
        const month = purchaseDate.getMonth() + 1;

        // Invalida queries relevantes para o dashboard e outras páginas
        queryClient.invalidateQueries({ queryKey: ["/api/expenses/recent"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats/monthly"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats/category-breakdown", year, month] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats/annual", year] });
        queryClient.invalidateQueries({ queryKey: ["/api/expenses/monthly", year, month, 'all-statuses'] });

        toast({ title: "Sucesso", description: "Status de pagamento atualizado!" });
    },
    // Caso a mutação falhe, reverte a atualização otimista
    onError: (error: any, _, context) => {
        console.error("Erro ao alternar status:", error);
        toast({ title: "Erro", description: error.message || "Falha ao alternar o status. Tente novamente.", variant: "destructive" });
        if (context?.previousRecentExpenses) {
            queryClient.setQueryData(["/api/expenses/recent", { limit: 10, includeAll: true }], context.previousRecentExpenses);
        }
    },
});

    // Query para buscar as estatísticas mensais (ajustada para pegar todos os totais)
    const { data: monthlyStats, isLoading: statsLoading } = useQuery<MonthlyStats>({
        queryKey: ["/api/stats/monthly", new Date().getFullYear(), new Date().getMonth() + 1],
        queryFn: async () => {
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            const response = await apiRequest("GET", `/api/stats/monthly?year=${currentYear}&month=${currentMonth}`);
            return response;
        },
    });

    // Query para buscar as despesas recentes (agora sem o filtro de 'paid')
    const { data: recentExpenses, isLoading: expensesLoading } = useQuery<RecentExpense[]>({
        queryKey: ["/api/expenses/recent", { limit: 10, includeAll: true }],
        queryFn: async ({ queryKey }) => {
            const [_key, { limit }] = queryKey as [string, { limit: number }];
            // Assumimos que o backend terá uma rota para buscar todos os recentes
            const response = await apiRequest("GET", `/api/expenses/recent?limit=${limit}`);
            return response;
        },
    });

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

                if (deletedResponse?.deleted?.recurringExpenseId) {
                    queryClient.invalidateQueries({ queryKey: ["/api/expenses/recurring-occurrences"] });
                    queryClient.invalidateQueries({ queryKey: ["/api/recurring-expenses"] });
                }

            } else {
                queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
                queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
            }

            toast({ title: "Sucesso", description: "Gasto excluído com sucesso!", });
            setExpenseToDelete(null);
        },
        onError: (error: any) => {
            console.error("Error details:", error);
            toast({
                title: "Erro",
                description: error.message || "Falha ao excluir o gasto. Tente novamente.",
                variant: "destructive",
            });
            setExpenseToDelete(null);
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

    return (
        <div className="p-8">
            {/* Título e Botão de Adicionar Gasto */}
            <div className="flex flex-col gap-4 mb-8">
                <h2 className="text-3xl font-bold text-text-primary">Painel</h2>
                <p className="text-text-secondary mt-1 mb-4">Acompanhe seus gastos e visão financeira geral</p>

                {/* Botões para adicionar gastos */}
                <div className="flex space-x-4">
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
                </div>
            </div>

            {/* Cartões de Estatísticas - Somente "Esse mês" e "Média/mês" */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Cartão Esse mês */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-secondary text-sm font-medium">Esse mês</p>
                                {statsLoading ? (
                                    <Skeleton className="h-8 w-24 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold text-text-primary">
                                        {formatCurrency(monthlyStats?.monthlyTotal || 0)}
                                    </p>
                                )}
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg">
                                <TrendingDown className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Cartão Média/mês */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-secondary text-sm font-medium">Média/mês</p>
                                {statsLoading ? (
                                    <Skeleton className="h-8 w-24 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold text-text-primary">
                                        {formatCurrency(monthlyStats?.averageMonthly || 0)}
                                    </p>
                                )}
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                                <Calculator className="h-5 w-5 text-secondary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Gastos Recentes - TODOS os gastos recentes */}
            <div className="grid grid-cols-1 gap-8">
                <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle>Gastos Recentes</CardTitle>
                        <Link href="/monthly">
                            <Button variant="outline" size="sm">
                                Ver todos os gastos
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {expensesLoading ? (
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
                        ) : (
                            <div className="space-y-4">
                                {recentExpenses && recentExpenses.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-text-secondary">Ainda não há gastos recentes.</p>
                                        <p className="text-text-secondary">Adicione alguns gastos para vê-los aqui.</p>
                                    </div>
                                ) : (
                                    recentExpenses?.map((expense: RecentExpense) => {
                                        const { details, description: expenseDescription } = getSubcategoryDetails(expense);
                                        const displayCategoryLabel = categoryLabels[expense.category] || expense.category.replace('-', ' ');
                                        const isPending = expense.paymentStatus === 'pending';

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

                                        return (
                                            <div
                                                key={expense.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
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
                                                            {displayCategoryLabel} {details && ` • ${details}`}
                                                            {expenseDescription && ` • ${expenseDescription}`} • {format(new Date(expense.purchaseDate), 'd MMM', { locale: ptBR })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <span className="font-semibold text-text-primary">
                                                      -{formatCurrency(parseFloat(expense.amount))}
                                                  </span>

                                                  {/* Botão de toggle de status */}
                                                  <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                          e.stopPropagation();
                                                          togglePaymentStatusMutation.mutate(expense.id);
                                                      }}
                                                      disabled={togglePaymentStatusMutation.isPending}
                                                      className={`hover:text-current ${expense.paymentStatus === 'pending' ? 'text-yellow-500' : 'text-green-500'}`}
                                                      aria-label={expense.paymentStatus === 'pending' ? "Marcar como pago" : "Marcar como pendente"}
                                                  >
                                                      {togglePaymentStatusMutation.isPending ? (
                                                          // Exibe um spinner enquanto a mutação está em andamento
                                                          <Clock className="h-4 w-4 animate-spin" />
                                                      ) : (
                                                          // Alterna os ícones com base no status atual
                                                          expense.paymentStatus === 'pending' ? (
                                                              <Clock className="h-4 w-4" /> // Ícone de relógio para 'não pago'
                                                          ) : (
                                                              <CheckCircle className="h-4 w-4" /> // Ícone de check para 'pago'
                                                          )
                                                      )}
                                                  </Button>

                                                  {/* Botão de excluir */}
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
                                              </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal de adição/edição de despesa normal (inalterado) */}
            <AddExpenseModal
                open={addExpenseModalOpen}
                onOpenChange={handleCloseExpenseModal}
                expenseToEdit={expenseToEdit}
            />

            {/* AlertDialog de Confirmação de Exclusão de Despesa (inalterado) */}
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
                            permanentemente da sua lista de gastos.
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