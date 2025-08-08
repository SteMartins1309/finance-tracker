// src/components/MonthlySummaryTable.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
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
  Star, 
  Scale, 
  Banknote,
  ArrowDown,
  ArrowUp,
  Download 
} from "lucide-react";
import jsPDF from 'jspdf'; // Importar jspdf
import html2canvas from 'html2canvas'; // Importar html2canvas
import { Button } from '@/components/ui/button'; // Certificar que Button está importado
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'; // Importar DropdownMenu


// Interfaces de Dados
interface MonthlyBreakdownData {
  month: number;
  category: string;
  total: number;
}

interface CategoryMonthlyGoal {
  category: string;
  amount: number;
}

interface MonthlySummaryTableProps {
  yearId: number;
  selectedYear: number;
  monthlyGoals: CategoryMonthlyGoal[];
  totalMonthlyGoal: number; // NOVO: Adicionar a meta total mensal
  tableId?: string; // NOVO: ID da tabela
}

const monthsNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
const monthsShortNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const categoryLabels: Record<string, string> = {
  "fixed": "Fixos", "supermarket": "Supermercado", "food": "Alimentação", "services": "Serviços", "study": "Estudos",
  "leisure": "Lazer", "personal-care": "Cuidado Pessoal", "shopping": "Compras", "transportation": "Transporte",
  "health": "Saúde", "family": "Família", "charity": "Caridade", "occasional": "Ocasionais"
};

const getCategoryIconColor = (category: string) => {
  switch (category) {
    case "fixed": return "#FFE5A0";
    case "supermarket": return "#FFE0DB";
    case "food": return "#FFD7BB";
    case "services": return "#E4E4E4";
    case "study": return "#D6E4F2";
    case "leisure": return "#D4EDBC";
    case "personal-care": return "#F3D7E1";
    case "shopping": return "#C6DBE1";
    case "transportation": return "#E8EAED";
    case "health": return "#C9E7F8";
    case "family": return "#E6CFF2";
    case "charity": return "#E8C5D8";
    case "occasional": return "#FFEBEE";
    case "total": return "#DDEBF7"; // Cor para a linha Total Mensal
    case "average": return "#E8F5E9"; // Cor para a linha Média Mensal (Total)
    case "catAverage": return "#FFFDE7"; // Cor para a linha Média por Categoria
    default: return "#E5E7EB";
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "fixed": return <DollarSign className="h-4 w-4 text-[#6B4E22]" />;
    case "supermarket": return <ShoppingCart className="h-4 w-4 text-[#C32C04]" />;
    case "food": return <Utensils className="h-4 w-4 text-[#A7521C]" />;
    case "services": return <Home className="h-4 w-4 text-[#4E4E4E]" />;
    case "study": return <BookOpen className="h-4 w-4 text-[#2F528F]" />;
    case "leisure": return <Gamepad2 className="h-4 w-4 text-[#2C754B]" />;
    case "personal-care": return <Scissors className="h-4 w-4 text-[#C33E7D]" />;
    case "shopping": return <Tags className="h-4 w-4 text-[#255F74]" />;
    case "transportation": return <Car className="h-4 w-4 text-[#0D1635]" />;
    case "health": return <Heart className="h-4 w-4 text-[#3D60A8]" />;
    case "family": return <Users className="h-4 w-4 text-[#633386]" />;
    case "charity": return <Gift className="h-4 w-4 text-[#781D4B]" />;
    case "occasional": return <Star className="h-4 w-4 text-[#C2185B]" />;
    case "total": return <Banknote className="h-4 w-4 text-[#2196F3]" />;
    case "average": return <Scale className="h-4 w-4 text-[#4CAF50]" />;
    case "catAverage": return <Scale className="h-4 w-4 text-[#FFC107]" />;
    default: return <Tags className="h-4 w-4 text-[#6B7280]" />;
  }
};

// NOVA MODIFICAÇÃO: Tons mais suaves para a coluna "Meta Mensal"
const getSoftStrongerCategoryColor = (category: string) => {
  switch (category) {
    case "fixed": return "#FFF8E1"; // Mais claro que FFE5A0
    case "supermarket": return "#FFF3F2"; // Mais claro que FFE0DB
    case "food": return "#FFF1E6"; // Mais claro que FFD7BB
    case "services": return "#F7F7F7"; // Mais claro que E4E4E4
    case "study": return "#EFF4FA"; // Mais claro que D6E4F2
    case "leisure": return "#EFF7E9"; // Mais claro que D4EDBC
    case "personal-care": return "#FDF6F8"; // Mais claro que F3D7E1
    case "shopping": return "#ECF2F3"; // Mais claro que C6DBE1
    case "transportation": return "#F6F7F9"; // Mais claro que E8EAED
    case "health": return "#EBF5FB"; // Mais claro que C9E7F8
    case "family": return "#F5EEF9"; // Mais claro que E6CFF2
    case "charity": return "#F6EFFF"; // Mais claro que E8C5D8
    case "occasional": return "#FFF5F5"; // Mais claro que FFEBEE
    case "total": return "#E6F3FF"; // Um azul muito suave para o total
    default: return "#F8F8F8"; // Um cinza muito claro
  }
};

const FIXED_CATEGORY_ORDER: string[] = [
  'fixed', 'supermarket', 'food', 'services', 'study', 'leisure', 'personal-care',
  'shopping', 'transportation', 'health', 'family', 'charity', 'occasional'
];


export default function MonthlySummaryTable({ yearId, selectedYear, monthlyGoals, totalMonthlyGoal, tableId }: MonthlySummaryTableProps) {
  const { data: monthlyBreakdown, isLoading } = useQuery<MonthlyBreakdownData[]>({
    queryKey: [`/api/expenses/yearly/${selectedYear}/monthly-breakdown`],
    queryFn: () => apiRequest("GET", `/api/expenses/yearly/${selectedYear}/monthly-breakdown`),
    enabled: !!selectedYear,
  });

  const getCategoryGoal = (category: string, goals: CategoryMonthlyGoal[]): number => {
    const goal = goals.find(g => g.category === category);
    return goal ? goal.amount : 0;
  };

  const processTableData = (data: MonthlyBreakdownData[], goalsData: CategoryMonthlyGoal[], totalGoal: number) => {
    const categoriesData: { [category: string]: { [month: number]: number; total: number; goal: number; average: number } } = {};
    const monthlyTotals: { [month: number]: number } = {};
    let grandTotal = 0;

    const currentFullDate = new Date();
    const currentYear = currentFullDate.getFullYear();
    const currentMonth = currentFullDate.getMonth() + 1;

    let monthsForAverageCalculation: number;
    if (selectedYear < currentYear) {
      monthsForAverageCalculation = 12;
    } else if (selectedYear === currentYear) {
      monthsForAverageCalculation = currentMonth;
    } else {
      monthsForAverageCalculation = 0;
    }
    const divisorForAverage = monthsForAverageCalculation > 0 ? monthsForAverageCalculation : 1;

    FIXED_CATEGORY_ORDER.forEach(cat => {
        const goal = getCategoryGoal(cat, goalsData);
        categoriesData[cat] = { total: 0, goal: goal, average: 0 };
        for (let i = 1; i <= 12; i++) {
            categoriesData[cat][i] = 0;
        }
    });
    for (let i = 1; i <= 12; i++) {
        monthlyTotals[i] = 0;
    }

    data.forEach(item => {
      const month = item.month;
      const category = item.category;
      const total = item.total;

      if (!categoriesData[category]) {
          const goal = getCategoryGoal(category, goalsData);
          categoriesData[category] = { total: 0, goal: goal, average: 0 };
          for (let i = 1; i <= 12; i++) { categoriesData[category][i] = 0; }
      }
      categoriesData[category][month] = (categoriesData[category][month] || 0) + total;
      categoriesData[category].total += total;

      monthlyTotals[month] += total;
      grandTotal += total;
    });

    Object.keys(categoriesData).forEach(cat => {
        categoriesData[cat].average = categoriesData[cat].total / divisorForAverage;
    });
    const overallAverageMonthly = grandTotal / divisorForAverage;

    const categoriesForRows = FIXED_CATEGORY_ORDER.filter(cat =>
        categoriesData[cat] && (categoriesData[cat].total > 0 || categoriesData[cat].goal > 0)
    );

    return { categoriesData, monthlyTotals, grandTotal, overallAverageMonthly, categoriesForRows, monthsForAverageCalculation, totalGoal };
  };

  // 'processedData' é o resultado da chamada de 'processTableData'
  const processedData = monthlyBreakdown ? processTableData(monthlyBreakdown, monthlyGoals, totalMonthlyGoal) : null; // Esta declaração está correta


  if (isLoading) {
    return <Skeleton className="h-[400px] w-full mt-8" />;
  }

  if (!processedData || monthlyBreakdown?.length === 0) { // Check processedData here
    return (
      <Card className="mt-8">
        <CardContent className="p-6 text-center text-text-secondary">
          Nenhum gasto encontrado para este ano para a tabela de resumo.
        </CardContent>
      </Card>
    );
  }

return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row justify-between items-center"> {/* Ajustado para alinhar o botão */}
        <div>
          <CardTitle>Resumo Mensal de Gastos</CardTitle>
          <p className="text-sm text-text-secondary">Desdobramento de gastos por categoria e mês, com totais, metas e médias.</p>
        </div>
      </CardHeader>
      <CardContent>
        {/* Adicionado id para html2canvas */}
        <div id={tableId} className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px] border-b-2 border-white !important">Categoria</TableHead>
                <TableHead className="text-center border-b-2 border-white !important">Meta Mensal</TableHead>
                <TableHead className="text-center border-b-2 border-white !important">Média Mensal ({processedData.monthsForAverageCalculation > 0 ? processedData.monthsForAverageCalculation : '0'}m)</TableHead>
                {monthsShortNames.map((monthName) => (
                  <TableHead key={monthName} className="text-center border-b-2 border-white !important">{monthName}</TableHead>
                ))}
                <TableHead className="text-center border-b-2 border-white !important">Total Anual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Início da linha Total Mensal Consolidado */}
              <TableRow className="font-bold border-b-4 border-white" style={{ backgroundColor: getCategoryIconColor('total') + '20' }}>
                {/* REMOVER border-b da TableCell, deixar apenas na TableRow */}
                <TableCell
                    className="font-medium flex items-center border-r-4 border-white"
                    style={{ backgroundColor: getCategoryIconColor('total') }}
                >
                    <div className="p-2 rounded-full mr-2" style={{ backgroundColor: getCategoryIconColor('total')  + 'CC'}}>
                        {getCategoryIcon('total')}
                    </div>
                    Total Mensal
                </TableCell>
                <TableCell
                    className="text-center font-semibold text-text-primary border-r-4 border-white"
                    style={{ backgroundColor: getSoftStrongerCategoryColor('total') }}
                >
                    {formatCurrency(processedData.totalGoal)}
                </TableCell>
                <TableCell className="text-center border-b-2 border-white !important">
                  {(() => { // Usar uma IIFE para lógica condicional
                    const currentAverage = processedData.overallAverageMonthly;
                    const totalGoalMonthly = processedData.totalGoal; // A meta mensal total
                    
                    const showArrow = totalGoalMonthly > 0 && currentAverage > 0;
                    const isUnderOrEqual = currentAverage <= totalGoalMonthly;
                    const ArrowIcon = isUnderOrEqual ? ArrowDown : ArrowUp;
                    const arrowColorClass = isUnderOrEqual ? "text-green-600" : "text-red-600";
                    
                    const valueBgColor = showArrow
                                            ? (isUnderOrEqual ? "rgba(139, 230, 139, 0.1)" : "rgba(255, 99, 71, 0.1)")
                                            : "";
                    return (
                      <span
                        className={`inline-flex items-center justify-center p-1 rounded-full`}
                        style={{ backgroundColor: valueBgColor }}
                      >
                        {formatCurrency(currentAverage)}
                        {showArrow && (
                          <ArrowIcon className={`h-3 w-3 ml-1 ${arrowColorClass}`} />
                        )}
                      </span>
                    );
                  })()}
                </TableCell>
                {monthsShortNames.map((monthName, index) => {
                  const monthNumber = index + 1;
                  const totalMonthlySpent = processedData.monthlyTotals[monthNumber] || 0;
                  const totalMonthlyGoal = processedData.totalGoal;

                  const showArrow = totalMonthlyGoal > 0 && totalMonthlySpent > 0;
                  const isTotalUnderOrEqual = totalMonthlySpent <= totalMonthlyGoal;
                  const ArrowIcon = isTotalUnderOrEqual ? ArrowDown : ArrowUp;
                  const arrowColorClass = isTotalUnderOrEqual ? "text-green-600" : "text-red-600";
                  
                  const valueBgColor = showArrow
                                          ? (isTotalUnderOrEqual ? "rgba(139, 230, 139, 0.1)" : "rgba(255, 99, 71, 0.1)")
                                          : "";


                  return (
                    <TableCell key={monthName} className="text-center">
                      <span
                        className={`inline-flex items-center justify-center p-1 rounded-full`}
                        style={{ backgroundColor: valueBgColor }}
                      >
                        {formatCurrency(totalMonthlySpent)}
                        {showArrow && (
                          <ArrowIcon className={`h-3 w-3 ml-1 ${arrowColorClass}`} />
                        )}
                      </span>
                    </TableCell>
                  );
                })}
                <TableCell
                    className="text-center font-bold text-text-primary border-b-2 border-white border-l-4 border-white"
                    style={{ backgroundColor: getSoftStrongerCategoryColor('total') }}
                >
                    {formatCurrency(processedData.grandTotal)}
                </TableCell>
              </TableRow>
              {/* Fim da linha Total Mensal Consolidado */}

              {/* Linhas das Categorias */}
              {processedData.categoriesForRows.map((categoryKey) => {
                const dataForCategory = processedData.categoriesData[categoryKey];
                if (!dataForCategory) return null;

                const categoryGoal = dataForCategory.goal; // Meta mensal da categoria
                const categoryAverage = dataForCategory.average;

                return (
                  // Já tem border-b border-white aqui
                  <TableRow key={categoryKey} className="group border-b-4 border-white" style={{ backgroundColor: getCategoryIconColor(categoryKey) + '20' }}>
                    {/* REMOVER border-b da TableCell, deixar apenas na TableRow */}
                    <TableCell
                        className="font-medium flex items-center border-r-4 border-white"
                        style={{ backgroundColor: getCategoryIconColor(categoryKey) }}
                    >
                        <div className="p-2 rounded-full mr-2" style={{ backgroundColor: getCategoryIconColor(categoryKey) + 'CC' }}>
                            {getCategoryIcon(categoryKey)}
                        </div>
                        {categoryLabels[categoryKey] || categoryKey.replace('-', ' ')}
                    </TableCell>
                    <TableCell
                        className="text-center font-semibold text-text-primary border-r-4 border-white"
                        style={{ backgroundColor: getSoftStrongerCategoryColor(categoryKey) }}
                    >
                        {formatCurrency(categoryGoal)}
                    </TableCell>
                    <TableCell className="text-center border-b-2 border-white !important">
                      {(() => { // Usar uma IIFE para lógica condicional
                        // CORREÇÃO AQUI: Use dataForCategory.average diretamente
                        const currentAverage = dataForCategory.average;
                        const goal = categoryGoal; // A meta mensal da categoria
                        
                        const showArrow = goal > 0 && currentAverage > 0;
                        const isUnderOrEqual = currentAverage <= goal;
                        const ArrowIcon = isUnderOrEqual ? ArrowDown : ArrowUp;
                        const arrowColorClass = isUnderOrEqual ? "text-green-600" : "text-red-600";
                        
                        const valueBgColor = showArrow
                                                ? (isUnderOrEqual ? "rgba(139, 230, 139, 0.1)" : "rgba(255, 99, 71, 0.1)")
                                                : "";
                        return (
                          <span
                            className={`inline-flex items-center justify-center p-1 rounded-full`}
                            style={{ backgroundColor: valueBgColor }}
                          >
                            {formatCurrency(currentAverage)}
                            {showArrow && (
                              <ArrowIcon className={`h-3 w-3 ml-1 ${arrowColorClass}`} />
                            )}
                          </span>
                        );
                      })()}
                    </TableCell>
                    {[...Array(12)].map((_, index) => {
                      const monthNumber = index + 1;
                      const monthlySpent = dataForCategory[monthNumber] || 0;

                      const showArrow = categoryGoal > 0 && monthlySpent > 0;
                      const isUnderOrEqual = monthlySpent <= categoryGoal;
                      const ArrowIcon = isUnderOrEqual ? ArrowDown : ArrowUp;
                      const arrowColorClass = isUnderOrEqual ? "text-green-600" : "text-red-600";

                      const valueBgColor = showArrow
                                          ? (isUnderOrEqual ? "rgba(139, 230, 139, 0.1)" : "rgba(255, 99, 71, 0.1)")
                                          : "";

                      return (
                        <TableCell key={monthNumber} className="text-center">
                          <span
                            className={`inline-flex items-center justify-center p-1 rounded-full`}
                            style={{ backgroundColor: valueBgColor }}
                          >
                            {formatCurrency(monthlySpent)}
                            {showArrow && (
                              <ArrowIcon className={`h-3 w-3 ml-1 ${arrowColorClass}`} />
                            )}
                          </span>
                        </TableCell>
                      );
                    })}
                    <TableCell
                        className="text-center font-bold text-text-primary border-b-2 border-white border-l-4 border-white"
                        style={{ backgroundColor: getSoftStrongerCategoryColor(categoryKey) }}
                    >
                        {formatCurrency(dataForCategory.total)}
                    </TableCell>
                  </TableRow>
                );
              })}

            </TableBody>
          </Table>
        </div>
      </CardContent>

    </Card>
  );
}