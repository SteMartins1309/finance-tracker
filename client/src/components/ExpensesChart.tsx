// src/components/ExpensesChart.tsx

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface MonthlyBreakdownData {
  month: number;
  category: string;
  total: number;
}

interface CategoryMonthlyGoal {
  category: string;
  amount: number;
}

interface ProcessedChartData {
  name: string;
  Total?: number;
  [key: string]: number | string | undefined;
}

interface ExpensesChartProps {
  yearId: number;
  selectedYear: number;
  monthlyGoals: CategoryMonthlyGoal[];
  totalMonthlyGoal: number;
  chartContainerId?: string; // NOVO: ID do contêiner do gráfico
  forcedSelectedChartType?: string;
}

const monthsNames = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const COLORS: { [key: string]: string } = {
    'Total': '#8884d8',
    'fixed': '#6B4E22',
    'supermarket': '#C32C04',
    'food': '#A7521C',
    'services': '#4E4E4E',
    'study': '#2F528F',
    'leisure': '#2C754B',
    'personal-care': '#C33E7D',
    'shopping': '#255F74',
    'transportation': '#0D1635',
    'health': '#3D60A8',
    'family': '#633386',
    'charity': '#781D4B',
    'occasional': '#C2185B',
};

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
  "occasional": "Ocasionais"
};

// Certifique-se que esta ordem fixa inclui todas as categorias que você quer ver e na ordem desejada
// Adicione 'occasional' aqui se ela deve ter uma posição fixa.
const FIXED_CATEGORY_ORDER = [
  'fixed', 'supermarket', 'food', 'services', 'study', 'leisure', 'personal-care',
  'shopping', 'transportation', 'health', 'family', 'charity', 'occasional' // Certifique-se que 'occasional' está aqui se for desejado na ordem
];

const CustomLegend = (props: any) => {
  const { payload } = props;
  return (
    <ul className="flex flex-wrap justify-center p-2">
      {
        payload.map((entry: any, index: number) => {
          const isGoalLine = entry.dataKey && entry.dataKey.endsWith('Meta');
          const baseCategory = isGoalLine ? entry.dataKey.replace('Meta', '') : entry.dataKey;
          const nameInPortuguese = categoryLabels[baseCategory] || baseCategory;
          const legendText = isGoalLine ? `Meta ${nameInPortuguese}` : nameInPortuguese;

          return (
            <li key={`item-${index}`} className="flex items-center mx-2 my-1 text-sm text-gray-700">
              <span
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: isGoalLine ? 'transparent' : entry.color,
                  border: isGoalLine ? `1px dashed ${entry.color}` : 'none',
                  marginRight: '5px',
                }}
              />
              {legendText}
            </li>
          );
        })
      }
    </ul>
  );
};


export default function ExpensesChart({ yearId, selectedYear, monthlyGoals, totalMonthlyGoal, chartContainerId, forcedSelectedChartType }: ExpensesChartProps) {
  
  const [selectedChartType, setSelectedChartType] = useState<string>(forcedSelectedChartType || 'Total');
  
  // NOVO: useEffect para atualizar selectedChartType quando forcedSelectedChartType muda (para capturas múltiplas)
  useEffect(() => {
    if (forcedSelectedChartType) {
      setSelectedChartType(forcedSelectedChartType);
    }
  }, [forcedSelectedChartType]);
  
  const { data: monthlyBreakdown, isLoading } = useQuery<MonthlyBreakdownData[]>({
    queryKey: [`/api/expenses/yearly/${selectedYear}/monthly-breakdown`],
    queryFn: () => apiRequest("GET", `/api/expenses/yearly/${selectedYear}/monthly-breakdown`),
    enabled: !!selectedYear,
  });

  const processChartData = (data: MonthlyBreakdownData[], goals: CategoryMonthlyGoal[]): ProcessedChartData[] => {
    const monthlyDataMap: { [month: number]: ProcessedChartData } = {};

    for (let i = 1; i <= 12; i++) {
        monthlyDataMap[i] = { name: monthsNames[i - 1] };
        monthlyDataMap[i]['Total'] = 0;
        Object.keys(categoryLabels).forEach(cat => {
            monthlyDataMap[i][cat] = 0;
            monthlyDataMap[i][`${cat}Meta`] = undefined;
        });
    }

    data.forEach(item => {
      monthlyDataMap[item.month]['Total'] = ((monthlyDataMap[item.month]['Total'] as number) || 0) + item.total;
      monthlyDataMap[item.month][item.category] = ((monthlyDataMap[item.month][item.category] as number) || 0) + item.total;
    });

    (goals || []).forEach(goal => {
        if (goal.amount !== undefined && goal.amount !== null && goal.amount > 0) {
            for (let i = 1; i <= 12; i++) {
                monthlyDataMap[i][`${goal.category}Meta`] = goal.amount;
            }
        } else {
            for (let i = 1; i <= 12; i++) {
                monthlyDataMap[i][`${goal.category}Meta`] = undefined;
            }
        }
    });

    return Object.values(monthlyDataMap).sort((a, b) => {
        const monthA = monthsNames.indexOf(a.name as string);
        const monthB = monthsNames.indexOf(b.name as string);
        return monthA - monthB;
    });
  };

  const chartData = monthlyBreakdown ? processChartData(monthlyBreakdown, monthlyGoals) : [];

  // Obter todas as categorias que realmente têm dados ou metas, para filtrar o FIXED_CATEGORY_ORDER
  const categoriesWithDataOrGoals = new Set([
    ...(monthlyBreakdown?.map(d => d.category) || []),
    ...(monthlyGoals?.map(g => g.category) || [])
  ]);

  // Construir chartOptions usando FIXED_CATEGORY_ORDER e filtrando apenas as categorias relevantes
  const chartOptions = [
    { value: 'Total', label: 'Total' }, // 'Total' sempre primeiro
    ...FIXED_CATEGORY_ORDER
        .filter(cat => categoriesWithDataOrGoals.has(cat)) // Filtra para incluir apenas categorias que realmente têm dados ou metas
        .map(cat => ({ value: cat, label: categoryLabels[cat] || cat }))
  ];

  // A variável allCategories original não é mais necessária se chartOptions for construída diretamente
  // const allCategories = Array.from(categoriesWithDataOrGoals).sort();


  const formatChartLabel = (value: string) => {
    if (value.endsWith('Meta')) {
      const baseCategory = value.replace('Meta', '');
      return `Meta ${categoryLabels[baseCategory] || baseCategory}`;
    }
    return categoryLabels[value] || value;
  };

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full mt-8" />;
  }

  if (monthlyBreakdown?.length === 0 && (monthlyGoals || []).length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="p-6 text-center text-text-secondary">
          Nenhum gasto ou meta encontrada para este ano para o gráfico.
        </CardContent>
      </Card>
    );
  }

  const selectedCategoryGoal = selectedChartType !== 'Total'
    ? (monthlyGoals || []).find(goal => goal.category === selectedChartType)?.amount
    : undefined;

  const totalGoalForChart = totalMonthlyGoal;

  const getYAxisDomain = () => {
    let maxDataValue = 0;
    let maxGoalValue = 0;

    if (selectedChartType === 'Total') {
      maxDataValue = Math.max(...chartData.map(d => (d.Total as number) || 0));
      maxGoalValue = totalGoalForChart || 0;
    } else {
      maxDataValue = Math.max(...chartData.map(d => (d[selectedChartType] as number) || 0));
      maxGoalValue = selectedCategoryGoal || 0;
    }

    const maxY = Math.max(maxDataValue, maxGoalValue) * 1.1;
    const minY = 0;

    return [minY, maxY];
  };

  const yAxisDomain = getYAxisDomain();


  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Acompanhamento Mensal de Gastos
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <label htmlFor="chartType" className="text-sm text-text-secondary">Visualizar:</label>
          <Select value={selectedChartType} onValueChange={setSelectedChartType}>
            <SelectTrigger id="chartType" className="w-[180px]">
              <SelectValue placeholder="Selecionar Gráfico" />
            </SelectTrigger>
            <SelectContent>
              {chartOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent id={chartContainerId} className="h-[400px]"> {/* <--- AGORA chartContainerId ESTÁ DISPONÍVEL */}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} domain={yAxisDomain as [number, number]} />
            <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), formatChartLabel(name)]} />
            <Legend content={<CustomLegend />} />

            {selectedChartType === 'Total' ? (
              <>
                <Line
                  type="monotone"
                  dataKey="Total"
                  stroke={COLORS['Total']}
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                  name="Total Gasto"
                />
                {(totalGoalForChart !== undefined && totalGoalForChart !== null && totalGoalForChart > 0) && (
                    <ReferenceLine
                      y={totalGoalForChart}
                      stroke={COLORS['Total']}
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                      label={{ value: `Meta Total: ${formatCurrency(totalGoalForChart)}`, position: 'top', fill: COLORS['Total'], dy: -10 }}
                    />
                )}
              </>
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey={selectedChartType}
                  stroke={COLORS[selectedChartType] || '#888'}
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                  name={categoryLabels[selectedChartType]}
                />
                {(selectedCategoryGoal !== undefined && selectedCategoryGoal !== null && selectedCategoryGoal > 0) && (
                    <ReferenceLine
                      y={selectedCategoryGoal}
                      stroke={COLORS[selectedChartType] || '#888'}
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                      label={{ value: `Meta: ${formatCurrency(selectedCategoryGoal)}`, position: 'top', fill: COLORS[selectedChartType] || '#888', dy: -10 }}
                    />
                )}
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}