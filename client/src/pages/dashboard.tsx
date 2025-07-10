// IMPORTS

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,  // Adicione para 'Add Expense'
  TrendingDown,  // Adicione para 'This Month'
  TrendingUp,  // Adicione para 'This Year'
  Calculator,  // Adicione para 'Avg/Month'
  Tags,  // Adicione para 'Categories'
  ShoppingCart,  // Adicione para 'Supermarket'
  Utensils,  // Adicione para 'Food'
  Car,  // Adicione para 'Transportation'
  DollarSign,  // Adicione para 'Fixed'
  Home,  // Adicione para 'Services'
  Gamepad2,  // Adicione para 'Leisure'
  Scissors,  // Adicione para 'Personal Care'
  Heart,  // Adicione para 'Health'
  Users,  // Adicione para 'Family'
  Gift,  // Adicione para 'Charity'
  Star  // Adicione para 'Occasional'
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";



// DASHBOARD: Componente principal da página de dashboard
export default function Dashboard() {

  // Hooks de estado para controlar a abertura do modal de adição de despesa
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
  
  // Hooks de consulta para buscar dados do backend
  const { data: monthlyStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/monthly"],
  });
  
  // Hooks de consulta para buscar despesas recentes do backend
  const { data: recentExpenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["/api/expenses/recent"],
  });
  
  // Hooks de consulta para buscar o desdobramento de categorias do backend
  const { data: categoryBreakdown, isLoading: breakdownLoading } = useQuery({
    queryKey: ["/api/stats/category-breakdown", new Date().getFullYear()],
  });

  // Hooks de consulta para buscar grupos ocasionais do backend
  const categoryLabels: Record<string, string> = {
    'fixed': "fixos",
    'supermarket': "supermercado",
    'food': "alimentação",
    'services': "serviços",
    'leisure': "lazer",
    'personal-care': "cuidados pessoais",
    'shopping': "compras",
    'transportation': "transporte",
    'health': "saúde",
    'family': "família",
    'charity': "caridade",
    'occasional': "ocasional",
  };
  
  // GET CATEGORY ICON: Função para obter o ícone da categoria
  const getCategoryIcon = (routineCategory: string) => {
    switch (routineCategory) {
      case "fixed":
        return <DollarSign className="h-4 w-4 text-[#6B4E22]" />;
      case "supermarket":
        return <ShoppingCart className="h-4 w-4 text-[#C32C04]" />;
      case "food":
        return <Utensils className="h-4 w-4 text-[#A7521C]" />;
      case "transportation":
        return <Car className="h-4 w-4 text-[#0D1635]" />;
      case "services":
        return <Home className="h-4 w-4 text-[#4E4E4E]" />;
      case "leisure":
        return <Gamepad2 className="h-4 w-4 text-[#2C754B]" />;
      case "personal-care":
        return <Scissors className="h-4 w-4 text-[#C33E7D]" />;
      case "shopping":
        return <Tags className="h-4 w-4 text-[#255F74]" />;
      case "health":
        return <Heart className="h-4 w-4 text-[#3D60A8]" />;
      case "family":
        return <Users className="h-4 w-4 text-[#633386]" />;
      case "charity":
        return <Gift className="h-4 w-4 text-[#781D4B]" />;
      case "occasional": 
        return <Star className="h-4 w-4 text-accent" />; 
      default:
        return <Tags className="h-4 w-4 text-gray-500" />;
    }
  };

  // Renderiza o componente principal da página de dashboard    REVISAAAAR
  return (    
    <div className="p-8">
      
      {/* Iníicio do título e descrição do painel */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Painel</h2>
          <p className="text-text-secondary mt-1">Acompanhe seus gastos e visão financeira geral</p>
        </div>

        <Button  // Botão para adicionar despesa
          onClick={() => setAddExpenseModalOpen(true)}
          className="bg-primary hover:bg-blue-700 text-white px-6 py-3 font-medium shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar gasto
        </Button>
      </div>
      {/* Fim do título e descrição do painel */}

      {/* Início dos cartões de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        {/* Início do cartão Esse mês */}
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
        {/* Fim do cartão Esse mês */}

        {/* Início do cartão Esse ano */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Esse ano</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-text-primary">
                    {formatCurrency(monthlyStats?.yearlyTotal || 0)}
                  </p>
                )}
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Fim do cartão Esse ano */}

        {/* Início do cartão Média/mês */}
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
        {/* Fim do cartão Média/mês */}

        {/* Início do cartão de categorias */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Categorias</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-text-primary">
                    {monthlyStats?.categoriesCount || 0}
                  </p>
                )}
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <Tags className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Fim do cartão de categorias */}
        
      </div>
      {/* Fim dos cartões de estatísticas */}

      {/* Gastos recentes e detalhamento de categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Início de Gastos recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos Recentes</CardTitle>
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

                {/* Renderiza os gastos recentes */}
                {recentExpenses?.map((expense: any) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg mr-4" style={{ backgroundColor: getCategoryIconColor(expense.category) }}>
                        {/* Se for despesa ocasional, use o ícone do grupo; senão, use o ícone da categoria */}
                        {expense.expenseType === "occasional" && expense.occasionalGroupIconName ? (
                          getCategoryIcon(expense.occasionalGroupIconName) // Usa o ícone do grupo se disponível
                        ) : (
                          getCategoryIcon(expense.category) // Usa ícone da categoria rotineira
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{expense.displayName}</p>
                        <p className="text-sm text-text-secondary">
                          {categoryLabels[expense.category] || "Categoria"} • {format(new Date(expense.purchaseDate), 'd MMM')}
                          {/* Adicionar a descrição do grupo ocasional aqui */}
                          {expense.expenseType === "occasional" && expense.occasionalGroupDescription && (
                            <span> • {expense.occasionalGroupDescription}</span>
                          )}
                          {/* ... (outras descrições específicas de categoria como transportation, shopping, etc.) ... */}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-text-primary">
                      -{formatCurrency(parseFloat(expense.amount))}
                    </span>
                  </div>
                ))}
                {/* Fim de renderização dos gastos recentes */}
                
                {/* Mensagem de aviso caso não haja gastos recentes */}                
                {recentExpenses?.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-text-secondary">Ainda não há gastos. Adicione seu primeiro gasto!</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Fim de Gastos recentes */}
        

        {/* Início do Detalhamento das categorias */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento das Categorias</CardTitle>
            <p className="text-sm text-text-secondary">Gastos desse ano</p>
          </CardHeader>
          <CardContent>
            {breakdownLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton className="w-4 h-4 rounded mr-3" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {categoryBreakdown?.map((category: any, index: number) => {
                  const colors = ["bg-blue-500", "bg-green-500", "bg-orange-500", "bg-purple-500", "bg-red-500", "bg-yellow-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"]; // Mais cores para mais categorias
                  return (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 ${colors[index % colors.length] || "bg-gray-500"} rounded mr-3`}></div> {/* Usar % colors.length para mais de 10 categorias */}
                        <span className="text-sm font-medium capitalize">
                          {category.category.replace('-', ' ')}
                        </span>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatCurrency(category.total)}
                      </span>
                    </div>
                  );
                })}
                {categoryBreakdown?.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-text-secondary">No category data available</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Fim do Detalhamento das categorias */}
        
      </div>
      {/* Fim de despesas recentes e detalhamento de categorias */}

      {/* Modal de adição de despesa */}
      <AddExpenseModal
        open={addExpenseModalOpen}
        onOpenChange={setAddExpenseModalOpen}
      />
      {/* Fim do Modal de adição de despesa */}
      
    </div>
  );
}


// GET CATEGORY ICON COLOR: Função para obter a cor do fundo da categoria
const getCategoryIconColor = (category: string) => {
  switch (category) {
    case "fixed":
      return "#FFE5A0"; 
    case "supermarket":
      return "#FFE0DB";
    case "food":
      return "#FFD7BB";
    case "transportation":
      return "#E8EAED";
    case "services":
      return "#E4E4E4";
    case "leisure":
      return "#D4EDBC";
    case "personal-care":
      return "#F3D7E1";
    case "shopping":
      return "#C6DBE1";
    case "health":
      return "#C9E7F8";
    case "family":
      return "#E6CFF2"; 
    case "charity":
      return "#E8C5D8";
    default:
      return "hsl(var(--muted))"; 
  }
};