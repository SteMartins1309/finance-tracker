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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  BarChart3
} from "lucide-react";

export default function AnnualView() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { data: annualStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/annual", selectedYear],
  });

  const { data: categoryBreakdown, isLoading: breakdownLoading } = useQuery({
    queryKey: ["/api/stats/category-breakdown", selectedYear],
  });

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      supermarket: <ShoppingCart className="h-4 w-4 text-primary" />,
      food: <Utensils className="h-4 w-4 text-secondary" />,
      transportation: <Car className="h-4 w-4 text-accent" />,
      health: <Heart className="h-4 w-4 text-red-500" />,
      services: <Home className="h-4 w-4 text-blue-500" />,
      leisure: <Gamepad2 className="h-4 w-4 text-purple-500" />,
      "personal-care": <Scissors className="h-4 w-4 text-pink-500" />,
      shopping: <Tags className="h-4 w-4 text-indigo-500" />,
      family: <Users className="h-4 w-4 text-green-500" />,
      charity: <Gift className="h-4 w-4 text-yellow-500" />,
    };
    return iconMap[category] || <Tags className="h-4 w-4 text-gray-500" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Annual Statistics</h2>
          <p className="text-text-secondary mt-1">Yearly overview with monthly trends</p>
        </div>
        <div className="flex items-center space-x-4">
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

      {/* Annual Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Total Expenses</h3>
            {statsLoading ? (
              <Skeleton className="h-10 w-32 mb-2" />
            ) : (
              <p className="text-3xl font-bold text-text-primary">
                {formatCurrency(annualStats?.total || 0)}
              </p>
            )}
            <p className="text-sm text-green-600 mt-2">Year-to-date spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Avg Monthly</h3>
            {statsLoading ? (
              <Skeleton className="h-10 w-32 mb-2" />
            ) : (
              <p className="text-3xl font-bold text-text-primary">
                {formatCurrency(annualStats?.avgMonthly || 0)}
              </p>
            )}
            <p className="text-sm text-blue-600 mt-2">Average per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Top Category</h3>
            {statsLoading ? (
              <Skeleton className="h-10 w-32 mb-2" />
            ) : (
              <p className="text-3xl font-bold text-text-primary capitalize">
                {annualStats?.topCategory?.replace('-', ' ') || 'None'}
              </p>
            )}
            <p className="text-sm text-text-secondary mt-2">
              {formatCurrency(annualStats?.categoryTotals?.[annualStats?.topCategory] || 0)} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown Chart Placeholder */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 font-medium">Chart visualization</p>
              <p className="text-sm text-gray-400">Monthly expense trends by category</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Annual Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Annual Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {breakdownLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Avg/Month</TableHead>
                  <TableHead>% of Total</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryBreakdown?.map((category: any, index: number) => (
                  <TableRow key={category.category} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center">
                        {getCategoryIcon(category.category)}
                        <span className="ml-3 font-medium capitalize">
                          {category.category.replace('-', ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(category.total)}
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {formatCurrency(category.total / 12)}
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {category.percentage.toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={index % 2 === 0 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {index % 2 === 0 ? "↓ 2.1%" : "↑ 3.2%"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {categoryBreakdown?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-text-secondary">No category data available for {selectedYear}</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
