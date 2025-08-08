// src/components/MonthlyGoalsDisplay.tsx

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Star, 
  BookOpen, 
  Edit, 
  Info, 
  Download,
  Banknote,
  Scale
} from "lucide-react";
import AddFinancialYearModal from "@/components/AddFinancialYearModal";
import { useToast } from "@/hooks/use-toast";
import ExpensesChart from "./ExpensesChart";
import MonthlySummaryTable from "./MonthlySummaryTable";
// Importações para exportação (certifique-se de que estão instaladas: npm install jspdf html2canvas xlsx file-saver)
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver'; // Necessário @types/file-saver
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';


// --- Interfaces de Dados (Manter no topo para clareza) ---
interface MonthlyGoal {
  id: number;
  financialYearId: number;
  category: string;
  amount: number;
}

interface FinancialYearDetails {
  id: number;
  year: number;
  totalMonthlyGoal: number;
  monthlyGoals: MonthlyGoal[];
  createdAt: string;
}

interface CategoryMonthlyGoal {
  category: string;
  amount: number;
}

// --- Definições de Dados Processados para a Tabela (reusado para exportação) ---
interface ProcessedTableData {
  categoriesData: { [category: string]: { [month: number]: number; total: number; goal: number; average: number } };
  monthlyTotals: { [month: number]: number };
  grandTotal: number;
  overallAverageMonthly: number;
  categoriesForRows: string[];
  monthsForAverageCalculation: number;
  totalGoal: number;
}


// --- Constantes e Funções Auxiliares (Definidas uma vez para todo o arquivo) ---
const monthsNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
const monthsShortNames = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const categoryLabels: Record<string, string> = {
  "fixed": "Fixos", "supermarket": "Supermercado", "food": "Alimentação", "services": "Serviços", "study": "Estudos",
  "leisure": "Lazer", "personal-care": "Cuidado Pessoal", "shopping": "Compras", "transportation": "Transporte",
  "health": "Saúde", "family": "Família", "charity": "Caridade", "occasional": "Ocasionais"
};
const FIXED_CATEGORY_ORDER: string[] = [
  'fixed', 'supermarket', 'food', "services", "study", "leisure", "personal-care", // Removido duplicatas
  'shopping', "transportation", "health", "family", "charity", "occasional"
];

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
}

// Função para processar os dados da tabela (copiada e adaptada de MonthlySummaryTable)
// Esta função precisa ser acessível globalmente dentro deste arquivo para as funções de exportação
const processTableDataForExport = (
  data: any[] | undefined, // Pode ser array de MonthlyBreakdownData[]
  goalsData: CategoryMonthlyGoal[],
  totalGoal: number,
  selectedYear: number
): ProcessedTableData | null => {
  if (!data) return null;

  const categoriesData: { [category: string]: { [month: number]: number; total: number; goal: number; average: number } } = {};
  const monthlyTotals: { [month: number]: number } = {};
  let grandTotal = 0;

  const currentFullDate = new Date();
  const currentYear = currentFullDate.getFullYear();
  const currentMonth = currentFullDate.getMonth() + 1;

  let monthsForAverageCalculation: number;
  if (selectedYear < currentYear) { monthsForAverageCalculation = 12; }
  else if (selectedYear === currentYear) { monthsForAverageCalculation = currentMonth; }
  else { monthsForAverageCalculation = 0; }
  const divisorForAverage = monthsForAverageCalculation > 0 ? monthsForAverageCalculation : 1;

  FIXED_CATEGORY_ORDER.forEach(cat => {
      const goal = goalsData.find((g: CategoryMonthlyGoal) => g.category === cat)?.amount || 0; // Tipagem para g
      categoriesData[cat] = { total: 0, goal: goal, average: 0 };
      for (let i = 1; i <= 12; i++) { categoriesData[cat][i] = 0; }
  });
  for (let i = 1; i <= 12; i++) { monthlyTotals[i] = 0; }

  data.forEach(item => {
    const month = item.month;
    const category = item.category;
    const total = item.total;
    if (!categoriesData[category]) {
        const goal = goalsData.find((g: CategoryMonthlyGoal) => g.category === category)?.amount || 0;
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


// --- Componente Principal ---
export default function MonthlyGoalsDisplay({ yearId, onGoBack }: { yearId: number; onGoBack: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingGoalCategory, setEditingGoalCategory] = useState<string | null>(null);

  // NOVO: Estado para controlar qual gráfico está "ativo" para renderização e captura
  const [activeChartTypeForExport, setActiveChartTypeForExport] = useState<string | null>(null);
  // NOVO: Ref para o contêiner de renderização de gráficos ocultos
  const hiddenChartContainerRef = useRef<HTMLDivElement>(null);

  // Query para buscar os detalhes do ano financeiro
  const { data: yearDetails, isLoading, isError } = useQuery<FinancialYearDetails>({
    queryKey: [`/api/financial-years/${yearId}`],
    queryFn: () => apiRequest("GET", `/api/financial-years/${yearId}`),
    enabled: !!yearId,
  });

  // Query para buscar os dados de quebra mensal
  const { data: monthlyBreakdownData, isLoading: isBreakdownLoading, isError: isBreakdownError } = useQuery<any[]>({
    queryKey: [`/api/expenses/yearly/${yearDetails?.year}/monthly-breakdown`],
    queryFn: () => apiRequest("GET", `/api/expenses/yearly/${yearDetails?.year}/monthly-breakdown`),
    enabled: !!yearDetails?.year,
  });

  // Estado para armazenar os dados processados da tabela para exportação
  const [processedTableData, setProcessedTableData] = useState<ProcessedTableData | null>(null);

  // useEffect para processar os dados assim que monthlyBreakdownData ou yearDetails mudarem
  useEffect(() => {
    if (yearDetails && monthlyBreakdownData !== undefined && !isBreakdownLoading && !isBreakdownError) {
      const data = processTableDataForExport(
        monthlyBreakdownData, // Aqui monthlyBreakdownData é any[]
        yearDetails.monthlyGoals,
        yearDetails.totalMonthlyGoal,
        yearDetails.year
      );
      setProcessedTableData(data);
    } else {
        setProcessedTableData(null); // Limpar se os dados não estiverem prontos
    }
  }, [yearDetails, monthlyBreakdownData, yearId, isBreakdownLoading, isBreakdownError]);

  // --- Lógica de Mutações e Handlers 
  const updateYearMutation = useMutation({
    mutationFn: async (data: { id: number; year: number; totalMonthlyGoal: number; monthlyGoals: MonthlyGoal[] }) => {
        // Esta função é chamada quando updateYearMutation.mutate() é acionado.
        // Ela faz a chamada real à API para atualizar o ano financeiro.
        return apiRequest("PUT", `/api/financial-years/${data.id}`, {
        year: data.year,
        totalMonthlyGoal: data.totalMonthlyGoal,
        monthlyGoals: data.monthlyGoals,
        });
    },
    onSuccess: () => {
        // Esta função é chamada se a chamada à API for bem-sucedida.
        // Invalida as queries para que o React Query busque os dados atualizados do backend.
        queryClient.invalidateQueries({ queryKey: [`/api/financial-years/${yearId}`] }); // Invalida detalhes do ano atual
        queryClient.invalidateQueries({ queryKey: ["/api/financial-years"] }); // Invalida a lista geral de anos
        toast({ title: "Sucesso", description: "Meta atualizada com sucesso!" }); // Exibe um toast de sucesso
        setEditModalOpen(false); // Fecha o modal de edição
        setEditingGoalCategory(null); // Limpa a categoria que estava sendo editada
    },
    onError: (error: any) => {
        // Esta função é chamada se a chamada à API falhar.
        console.error("Erro ao atualizar meta:", error);
        toast({ title: "Erro", description: error.message || "Falha ao atualizar a meta.", variant: "destructive" }); // Exibe um toast de erro
    },
  });

  const handleEditCategoryGoal = (category: string) => {
    // Define qual categoria está sendo editada no estado do componente.
    setEditingGoalCategory(category);
    // Abre o modal de edição (AddFinancialYearModal).
    setEditModalOpen(true);
  };

  const handleSubmitModalData = (formData: any) => {
    // Verifica se os detalhes do ano estão carregados antes de continuar.
    if (!yearDetails) {
        console.error("yearDetails é undefined ao tentar submeter dados do modal.");
        toast({ title: "Erro", description: "Dados do ano financeiro não disponíveis.", variant: "destructive" });
        return;
    }

    let updatedTotalMonthlyGoal: number;
    let updatedMonthlyGoals: MonthlyGoal[];

    // Decide se a meta total mensal veio do formulário (se o modal editou o ano completo)
    // ou se mantém o valor original.
    if (formData.totalMonthlyGoal !== undefined && formData.totalMonthlyGoal !== null) {
        updatedTotalMonthlyGoal = formData.totalMonthlyGoal;
    } else {
        updatedTotalMonthlyGoal = yearDetails.totalMonthlyGoal;
    }

    // Processa as metas por categoria que vieram do formulário.
    // O modal sempre envia um array completo, então mapeamos para garantir a estrutura correta.
    if (formData.monthlyGoals && Array.isArray(formData.monthlyGoals)) {
        updatedMonthlyGoals = formData.monthlyGoals.map((newGoal: { category: string; amount: number | null }) => {
        // Tenta encontrar a meta existente para manter o ID (se o backend usar para otimização)
        const existingGoal = yearDetails.monthlyGoals.find(g => g.category === newGoal.category);
        return {
            id: existingGoal?.id, // Usa o ID existente ou undefined
            financialYearId: yearDetails.id, // Associa ao ID do ano financeiro atual
            category: newGoal.category,
            amount: newGoal.amount || 0, // Garante que o valor é um número (0 se nulo/indefinido)
        };
        });
    } else {
        // Se o modal não enviou monthlyGoals (o que não deve acontecer para esta versão do modal),
        // mantém as metas existentes do yearDetails.
        updatedMonthlyGoals = yearDetails.monthlyGoals;
    }

    // Aciona a mutação para enviar os dados atualizados para o backend.
    updateYearMutation.mutate({
        id: yearDetails.id, // ID do ano a ser atualizado
        year: yearDetails.year, // O ano em si (geralmente não muda em uma edição de meta)
        totalMonthlyGoal: updatedTotalMonthlyGoal,
        monthlyGoals: updatedMonthlyGoals,
    });
  };

  const modalInitialData = yearDetails ? {
    id: yearDetails.id,
    year: yearDetails.year,
    totalMonthlyGoal: yearDetails.totalMonthlyGoal,
    // Mapeia as metas existentes para o formato esperado pelo modal,
    // garantindo que todas as categorias da ordem fixa estejam presentes,
    // e preenchendo 'amount' com 'undefined' se não houver meta para uma categoria.
    monthlyGoals: FIXED_CATEGORY_ORDER.map(cat => {
        const existingGoal = yearDetails.monthlyGoals.find(g => g.category === cat);
        return {
        category: cat,
        amount: existingGoal ? existingGoal.amount : undefined,
        };
    })
  } : null;


  // --- Lógica de Exportação de Relatórios (Centralizada e Refinada) ---

  const handleExportExcel = () => {
    // Verifique se processedTableData não é null AQUI
    if (!yearDetails || !processedTableData) { // processedTableData já é 'ProcessedTableData | null'
      toast({ title: "Erro", description: "Dados insuficientes para exportar Excel.", variant: "destructive" });
      return;
    }

    const headers = ['Categoria', 'Meta Mensal', `Média Mensal (${processedTableData.monthsForAverageCalculation}m)`, ...monthsShortNames, 'Total Anual'];
    const excelRows: any[] = [];

    // Linha Total Mensal
    excelRows.push([
      'Total Mensal',
      formatCurrency(processedTableData.totalGoal),
      formatCurrency(processedTableData.overallAverageMonthly),
      ...monthsShortNames.map((_m, index) => formatCurrency(processedTableData.monthlyTotals[index + 1] || 0)), // Acessando processedTableData
      formatCurrency(processedTableData.grandTotal)
    ]);

    // Linhas das Categorias
    processedTableData.categoriesForRows.forEach((categoryKey: string) => { // Acessando processedTableData
      const categoryData = processedTableData.categoriesData[categoryKey]; // Acessando processedTableData
      excelRows.push([
        categoryLabels[categoryKey] || categoryKey.replace('-', ' '),
        formatCurrency(categoryData.goal),
        formatCurrency(categoryData.average),
        ...monthsShortNames.map((_m, index) => formatCurrency(categoryData[index + 1] || 0)),
        formatCurrency(categoryData.total)
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...excelRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resumo Financeiro");

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `relatorio_financeiro_${yearDetails.year}.xlsx`);
    toast({ title: "Sucesso", description: "Relatório Excel exportado!" });
  };

  const handleExportPdf = async () => {
    if (!yearDetails || !processedTableData) { // Incluir processedTableData na verificação
      toast({ title: "Erro", description: "Dados do ano não disponíveis para PDF.", variant: "destructive" });
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 15;
    let yPos = margin;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Função auxiliar para adicionar texto ao PDF, com quebra de linha
    const addTextToPdf = (text: string, size: number, x: number, y: number, align: 'left' | 'center' | 'right' = 'left', maxLines?: number) => {
      pdf.setFontSize(size);
      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      if (maxLines && lines.length > maxLines) {
        lines.splice(maxLines, lines.length - maxLines, '...'); // Truncate if needed
      }
      pdf.text(lines, x, y, { align: align });
      return y + (lines.length * size * 0.35); // Retorna nova posição Y, 0.35 é um fator de linha
    };

    // --- Título do Relatório (Página 1) ---
    yPos = addTextToPdf(`Relatório Financeiro Anual - ${yearDetails.year}`, 22, pageWidth / 2, yPos, 'center');
    yPos += 15;

    yPos = addTextToPdf(`Visão Geral das Metas:`, 14, margin, yPos);
    yPos += 8;
    yPos = addTextToPdf(`Meta Mensal Total: ${formatCurrency(yearDetails.totalMonthlyGoal || 0)}`, 12, margin, yPos);
    yPos += 7;
    yPos = addTextToPdf(`Período analisado: Ano de ${yearDetails.year}`, 12, margin, yPos);
    yPos += 15;


    // --- Iterar e Incluir Gráficos e Resumos Detalhados (Total + Categorias) ---

    // Definir os tipos de gráfico que serão exportados
    const chartTypesToExport = [
      { value: 'Total', label: 'Total' },
      ...FIXED_CATEGORY_ORDER
          .filter(cat => processedTableData.categoriesData[cat] && (processedTableData.categoriesData[cat].total > 0 || processedTableData.categoriesData[cat].goal > 0))
          .map(cat => ({ value: cat, label: categoryLabels[cat] || cat }))
    ];

    for (let i = 0; i < chartTypesToExport.length; i++) {
        const chartTypeOption = chartTypesToExport[i];
        const selectedType = chartTypeOption.value;
        const selectedLabel = chartTypeOption.label;

        // Adicionar nova página para cada gráfico/resumo, exceto o primeiro
        if (i > 0) { // Adicionar página antes do segundo item em diante
            pdf.addPage();
            yPos = margin;
        }

        // Temporariamente "simular" a seleção do gráfico para captura
        setActiveChartTypeForExport(selectedType); // Isso re-renderiza o ExpensesChart (oculto)
        // Precisamos esperar o React renderizar o gráfico antes de capturá-lo
        await new Promise(resolve => setTimeout(resolve, 500)); // Pequeno delay para renderização

        yPos = addTextToPdf(`Acompanhamento Mensal de Gastos: ${selectedLabel}`, 14, margin, yPos);
        yPos += 8;

        const chartElement = hiddenChartContainerRef.current; // Usar a ref para o contêiner oculto
        if (chartElement) {
            try {
                const chartCanvas = await html2canvas(chartElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
                const chartImgData = chartCanvas.toDataURL('image/png');
                const imgWidth = pageWidth - 2 * margin;
                const imgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;

                if (yPos + imgHeight > pageHeight - margin) {
                    pdf.addPage();
                    yPos = margin;
                }
                pdf.addImage(chartImgData, 'PNG', margin, yPos, imgWidth, imgHeight);
                yPos += imgHeight + 8; // Espaço após o gráfico
            } catch (chartError) {
                console.error(`Erro ao capturar gráfico '${selectedLabel}' para PDF:`, chartError);
                toast({ title: "Erro", description: `Falha ao incluir gráfico de ${selectedLabel} no PDF.`, variant: "destructive" });
            }
        }
        
        // --- Resumo de Valores Mensais e Média/Meta para a Categoria/Total ---
        yPos = addTextToPdf(`Detalhes de Gastos:`, 12, margin, yPos);
        yPos += 5;
        
        let currentChartCategoryData: any;
        if (selectedType === 'Total') {
            currentChartCategoryData = {
                total: processedTableData.grandTotal,
                average: processedTableData.overallAverageMonthly,
                goal: processedTableData.totalGoal,
                monthly: processedTableData.monthlyTotals // Dados mensais do total
            };
        } else {
            currentChartCategoryData = processedTableData.categoriesData[selectedType];
        }

        const monthlySpendString = monthsShortNames.map((shortName, idx) => {
            const monthValue = (selectedType === 'Total' ? currentChartCategoryData.monthly[idx + 1] : currentChartCategoryData[idx + 1]) || 0;
            return `${shortName}: ${formatCurrency(monthValue)}`;
        }).join(', ');

        yPos = addTextToPdf(`Valores Mensais: ${monthlySpendString}`, 10, margin + 5, yPos);
        yPos += 7;

        if (selectedType === 'Total') {
            yPos = addTextToPdf(`Total Gasto: ${formatCurrency(currentChartCategoryData.total)}, Meta: ${formatCurrency(currentChartCategoryData.goal)}, Média Mensal: ${formatCurrency(currentChartCategoryData.average)} (${processedTableData.monthsForAverageCalculation}m)`, 10, margin + 5, yPos);
        } else {
            yPos = addTextToPdf(`Total Gasto: ${formatCurrency(currentChartCategoryData.total)}, Meta: ${formatCurrency(currentChartCategoryData.goal)}, Média Mensal: ${formatCurrency(currentChartCategoryData.average)}`, 10, margin + 5, yPos);
        }
        yPos += 15; // Espaço entre os resumos de gráfico

    } // Fim do loop de gráficos


    // --- Resumo da Tabela Completa (no final) ---
    yPos = addTextToPdf(`Resumo da Tabela Completa de Gastos:`, 14, margin, yPos);
    yPos += 8;

    const tableElement = document.getElementById('monthly-summary-table');
    if (tableElement) {
        try {
            const tableCanvas = await html2canvas(tableElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const tableImgData = tableCanvas.toDataURL('image/png');
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = (tableCanvas.height * imgWidth) / tableCanvas.width;

            let currentImageY = 0;
            while (currentImageY < imgHeight) {
                const remainingPageHeight = pageHeight - yPos - margin;
                const sourceHeight = Math.min(imgHeight - currentImageY, remainingPageHeight);

                if (sourceHeight <= 0) {
                    pdf.addPage();
                    yPos = margin;
                    continue;
                }
                
                pdf.addImage(
                    tableImgData, 'PNG',
                    margin, yPos,
                    imgWidth, sourceHeight, // Largura e altura do pedaço no PDF
                );

                yPos += sourceHeight;
                currentImageY += sourceHeight;
                
                if (currentImageY < imgHeight) {
                    pdf.addPage();
                    yPos = margin;
                }
            }
        } catch (tableError) {
            console.error("Erro ao capturar tabela para PDF:", tableError);
            toast({ title: "Erro", description: "Falha ao incluir tabela no PDF.", variant: "destructive" });
        }
    }

    pdf.save(`relatorio_financeiro_${yearDetails.year}.pdf`);
    toast({ title: "Sucesso", description: "Relatório PDF exportado!" });

    // NOVO: Resetar o tipo de gráfico ativo após a exportação
    setActiveChartTypeForExport(null);
  };


  // --- Renderização do Componente (JSX) ---
  if (isLoading || isBreakdownLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  if (isError || !yearDetails) {
    return <p className="text-red-500">Erro ao carregar detalhes do ano.</p>;
  }

  // Se não houver dados no breakdown ou monthlyGoals, exibir mensagem
  if ((!monthlyBreakdownData || monthlyBreakdownData.length === 0) && (!yearDetails.monthlyGoals || yearDetails.monthlyGoals.length === 0)) {
     return (
      <Card className="mt-8">
        <CardContent className="p-6 text-center text-text-secondary">
          Nenhum gasto ou meta encontrada para este ano.
        </CardContent>
      </Card>
    );
  }


  const sortedMonthlyGoals = yearDetails.monthlyGoals.sort((a, b) => {
    const indexA = FIXED_CATEGORY_ORDER.indexOf(a.category);
    const indexB = FIXED_CATEGORY_ORDER.indexOf(b.category);

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA !== -1) {
      return -1;
    }
    if (indexB !== -1) {
      return 1;
    }
    return a.category.localeCompare(b.category);
  });


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-text-primary">
          Metas Detalhadas para {yearDetails.year}
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Exportar Relatório
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportExcel}>Exportar como Excel</DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPdf}>Exportar como PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Meta Total Mensal em Destaque */}
      <Card className="p-6 bg-gray-50 border-gray-200">
        <CardContent className="p-0 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gray-100 p-3 rounded-lg mr-4">
              <Info className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-gray-700 text-sm font-medium mb-1">Meta Total Mensal</p>
              <p className="text-3xl font-extrabold text-gray-800">
                {formatCurrency(yearDetails.totalMonthlyGoal || 0)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditingGoalCategory(null);
              setEditModalOpen(true);
            }}
          >
            <Edit className="h-5 w-5 text-gray-500" />
          </Button>
        </CardContent>
      </Card>

      {/* Grid de Metas por Categoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedMonthlyGoals.length > 0 ? (
          sortedMonthlyGoals.map((goal) => (
            <Card
              key={goal.category}
              className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleEditCategoryGoal(goal.category)}
            >
              <CardContent className="p-0 flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="p-2 rounded-full mr-3"
                    style={{ backgroundColor: getCategoryIconColor(goal.category) }}
                  >
                    {getCategoryIcon(goal.category)}
                  </div>
                  <div>
                    <p className="text-text-secondary text-sm font-medium">{categoryLabels[goal.category] || goal.category}</p>
                    <p className="text-xl font-bold text-text-primary">
                      {formatCurrency(goal.amount || 0)}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="ml-2">
                  <Edit className="h-4 w-4 text-gray-500" />
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-text-secondary">Nenhuma meta mensal definida para este ano.</p>
        )}
      </div>

      {/* Gráfico de Acompanhamento de Gastos (VISÍVEL NA TELA) */}
      {yearDetails.year && (
          <ExpensesChart
            yearId={yearId}
            selectedYear={yearDetails.year}
            monthlyGoals={yearDetails.monthlyGoals}
            totalMonthlyGoal={yearDetails.totalMonthlyGoal}
            chartContainerId="expenses-chart-container" // ID para o gráfico visível
            // Não passa forcedSelectedChartType aqui, este é o gráfico interativo
          />
      )}

      {/* Tabela de Resumo Mensal (AGORA VISÍVEL NA PÁGINA NOVAMENTE) */}
      {processedTableData && yearDetails.year && ( // Certificar que processedTableData existe para renderizar
          <MonthlySummaryTable
            yearId={yearId}
            selectedYear={yearDetails.year}
            monthlyGoals={yearDetails.monthlyGoals}
            totalMonthlyGoal={yearDetails.totalMonthlyGoal}
            tableId="monthly-summary-table" // ID para a tabela (visível e para captura)
          />
      )}


      {/* Contêiner para renderizar gráficos ocultos para exportação PDF */}
      <div ref={hiddenChartContainerRef} style={{ position: 'absolute', left: '-9999px', top: '0', width: '800px', height: '450px', overflow: 'hidden' }}>
        {yearDetails.year && activeChartTypeForExport && (
          <ExpensesChart
            yearId={yearId}
            selectedYear={yearDetails.year}
            monthlyGoals={yearDetails.monthlyGoals}
            totalMonthlyGoal={yearDetails.totalMonthlyGoal}
            chartContainerId="hidden-pdf-chart" // ID diferente para o gráfico oculto
            forcedSelectedChartType={activeChartTypeForExport} // Passa o tipo forçado
          />
        )}
      </div>
      
      {/* Ocultando a tabela para html2canvas não afeta a visibilidade normal */}
      {/* Se a tabela fosse sempre visível, não precisaríamos deste segundo div */}
      {/* Se você quisesse que a tabela NÃO aparecesse na página, apenas no Excel,
          você manteria a MonthlySummaryTable dentro de um div com display:none ou position:absolute; left:-9999px;
          Mas como você pediu para ela voltar a ser visível, a linha acima já resolve. */}


      {/* Modal de Edição de Ano/Meta (reutilizando AddFinancialYearModal) */}
      <AddFinancialYearModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        initialData={modalInitialData}
        onSubmitSuccess={handleSubmitModalData}
      />
    </div>
  );
}