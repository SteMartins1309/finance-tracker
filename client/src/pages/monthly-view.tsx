// IMPORTS

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
  DollarSign
} from "lucide-react";
import { format } from "date-fns"; 
import { formatCurrency } from "@/lib/utils";


// MONTHLY VIEW: Componente para visualização mensal das despesas
export default function MonthlyView() {
  
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  // Usaremos getExpensesByMonth para obter a lista detalhada, e categoryBreakdown para os totais por categoria
  const { data: monthlyExpensesList, isLoading: listLoading } = useQuery({ // Renomeado para monthlyExpensesList
    queryKey: ["/api/expenses/monthly", selectedYear, selectedMonth],
  });

  const { data: categoryBreakdown, isLoading: breakdownLoading } = useQuery({
    queryKey: ["/api/stats/category-breakdown", selectedYear, selectedMonth],
    // queryParams: { month: selectedMonth } // Isso não é mais necessário com a nova estrutura de queryKey do React Query 5
  });

  // GET CATEGORY ICON: Função para obter o ícone da categoria
  const getCategoryIcon = (routineCategory: string) => { // Renomeado o parâmetro para 'routineCategory' para clareza
    switch (routineCategory) {
      case "fixed":
        return <DollarSign className="h-5 w-5 text-green-600" />; // Ex: Verde para fixos
      case "supermarket":
        return <ShoppingCart className="h-5 w-5 text-primary" />;
      case "food":
        return <Utensils className="h-5 w-5 text-secondary" />;
      case "transportation":
        return <Car className="h-5 w-5 text-accent" />;
      case "services":
        return <Home className="h-5 w-5 text-blue-500" />;
      case "leisure":
        return <Gamepad2 className="h-5 w-5 text-purple-500" />;
      case "personal-care":
        return <Scissors className="h-5 w-5 text-pink-500" />;
      case "shopping":
        return <Tags className="h-5 w-5 text-indigo-500" />;
      case "health":
        return <Heart className="h-5 w-5 text-red-500" />;
      case "family":
        return <Users className="h-5 w-5 text-cyan-500" />;
      case "charity":
        return <Gift className="h-5 w-5 text-yellow-500" />;
      default:
        return <Tags className="h-5 w-5 text-gray-500" />; // Para "occasional" ou outros
    }
  };

  // Helper function to get a color for the category icon background
  const getCategoryIconColor = (category: string) => {
    switch (category) {
      case "fixed":
        return "#FFE5A0"; // Cor de fundo que você usou no dashboard
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const groupExpensesByCategory = (expenses: any[]) => {
    const grouped: {
      routine: { [key: string]: { total: number; items: any[] } };
      occasional: { total: number; items: any[] };
    } = {
      routine: {},
      occasional: { total: 0, items: [] },
    };

    expenses?.forEach(expense => {
      const amount = parseFloat(expense.amount);
      if (expense.expenseType === 'routine') {
        const routineCat = expense.routineCategory; // 'fixed', 'supermarket', etc.
        if (!grouped.routine[routineCat]) {
          grouped.routine[routineCat] = { total: 0, items: [] };
        }
        grouped.routine[routineCat].total += amount;
        grouped.routine[routineCat].items.push(expense);
      } else { // 'occasional'
        grouped.occasional.total += amount;
        grouped.occasional.items.push(expense);
      }
    });

    return grouped;
  };

  const categoryGroups = groupExpensesByCategory(monthlyExpenses || []);

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Monthly Expenses</h2>
          <p className="text-text-secondary mt-1">Detailed breakdown by category</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select 
            value={selectedMonth.toString()} 
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={selectedYear.toString()} 
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Skeleton className="h-5 w-5 mr-3" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : Object.keys(categoryGroups).length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-text-secondary text-lg">No expenses found for this month</p>
            <p className="text-text-secondary">Try selecting a different month or add some expenses</p>
          </div>
        ) : (
          Object.entries(categoryGroups).map(([category, data]) => (
            <Card key={category}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary flex items-center">
                    {getCategoryIcon(category)}
                    <span className="ml-3 capitalize">{category.replace('-', ' ')}</span>
                  </h3>
                  <span className="text-lg font-bold text-text-primary">
                    {formatCurrency(data.total)}
                  </span>
                </div>
                <div className="space-y-3">
                  {data.items.slice(0, 3).map((expense: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-text-secondary truncate max-w-[150px]">
                        {expense.supermarket?.name || 
                         expense.restaurant?.name || 
                         expense.storeName || 
                         expense.description || 
                         'Unknown'}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(parseFloat(expense.amount))}
                      </span>
                    </div>
                  ))}
                  {data.items.length > 3 && (
                    <div className="text-sm text-text-secondary">
                      +{data.items.length - 3} more items
                    </div>
                  )}
                  {data.items.length === 0 && (
                    <div className="text-sm text-text-secondary">
                      No specific items tracked
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
