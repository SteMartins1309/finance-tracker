import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  TrendingDown, 
  TrendingUp, 
  Calculator, 
  Tags,
  ShoppingCart,
  Utensils,
  Car
} from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);

  const { data: monthlyStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/monthly"],
  });

  const { data: recentExpenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["/api/expenses/recent"],
  });

  const { data: categoryBreakdown, isLoading: breakdownLoading } = useQuery({
    queryKey: ["/api/stats/category-breakdown", new Date().getFullYear()],
    select: (data) => data?.slice(0, 5) || []
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "supermarket":
        return <ShoppingCart className="h-4 w-4 text-primary" />;
      case "food":
        return <Utensils className="h-4 w-4 text-secondary" />;
      case "transportation":
        return <Car className="h-4 w-4 text-accent" />;
      default:
        return <Tags className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Dashboard</h2>
          <p className="text-text-secondary mt-1">Track your expenses and financial overview</p>
        </div>
        
        <Button 
          onClick={() => setAddExpenseModalOpen(true)}
          className="bg-primary hover:bg-blue-700 text-white px-6 py-3 font-medium shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">This Month</p>
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">This Year</p>
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Avg/Month</p>
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Categories</p>
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
      </div>

      {/* Recent Expenses & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
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
                {recentExpenses?.map((expense: any) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-4">
                        {getCategoryIcon(expense.category)}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{expense.displayName}</p>
                        <p className="text-sm text-text-secondary">
                          {expense.category} • {format(new Date(expense.purchaseDate), 'MMM d')}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-text-primary">
                      -{formatCurrency(parseFloat(expense.amount))}
                    </span>
                  </div>
                ))}
                {recentExpenses?.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-text-secondary">No expenses yet. Add your first expense!</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <p className="text-sm text-text-secondary">This year's spending</p>
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
                  const colors = ["bg-blue-500", "bg-green-500", "bg-orange-500", "bg-purple-500", "bg-red-500"];
                  return (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 ${colors[index] || "bg-gray-500"} rounded mr-3`}></div>
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
      </div>

      <AddExpenseModal 
        open={addExpenseModalOpen} 
        onOpenChange={setAddExpenseModalOpen} 
      />
    </div>
  );
}
