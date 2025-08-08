// src/components/ViewOccasionalGroupExpensesModal.tsx

import React, { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Tags, Calendar, Star } from "lucide-react";
import * as LucideIcons from "lucide-react"; // Importa todos os ícones
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { RecentExpense, RecurringExpense } from "@/types/finance";


interface ViewOccasionalGroupExpensesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: number | null;
  groupName: string;
}

// Funções auxiliares de ícones e cores (copiadas do monthly-view.tsx ou dashboard.tsx)
const categoryLabels: Record<string, string> = {
  'fixed': "Fixos", 'supermarket': "Supermercado", 'food': "Alimentação", 'services': "Serviços", 'study': "Estudos",
  'leisure': "Lazer", 'personal-care': "Cuidado Pessoal", 'shopping': "Compras", 'transportation': "Transporte",
  'health': "Saúde", 'family': "Família", 'charity': "Caridade", 'occasional': "Ocasionais", // 'occasional' aqui pode ser usado se houver necessidade de representar o grupo geral
};

const FIXED_CATEGORY_ORDER: string[] = [
  'fixed', 'supermarket', 'food', 'services', 'study', 'leisure', 'personal-care',
  'shopping', 'transportation', 'health', 'family', 'charity',
];

const getCategoryIcon = (category: string) => {
  const LucideIconComponent = (LucideIcons as any)[category];
  if (LucideIconComponent && typeof LucideIconComponent === 'function') {
    return React.createElement(LucideIconComponent, { className: "h-4 w-4 text-current" });
  }
  switch (category) {
    case "fixed": return <LucideIcons.DollarSign className="h-4 w-4 text-[#6B4E22]" />;
    case "supermarket": return <LucideIcons.ShoppingCart className="h-4 w-4 text-[#C32C04]" />;
    case "food": return <LucideIcons.Utensils className="h-4 w-4 text-[#A7521C]" />;
    case "services": return <LucideIcons.Home className="h-4 w-4 text-[#1E6F5C]" />;
    case "study": return <LucideIcons.BookOpen className="h-4 w-4 text-[#2F528F]" />;
    case "leisure": return <LucideIcons.Gamepad2 className="h-4 w-4 text-[#2C754B]" />;
    case "personal-care": return <LucideIcons.Scissors className="h-4 w-4 text-[#C33E7D]" />;
    case "shopping": return <LucideIcons.Tags className="h-4 w-4 text-[#255F74]" />;
    case "transportation": return <LucideIcons.Car className="h-4 w-4 text-[#37474F]" />;
    case "health": return <LucideIcons.Heart className="h-4 w-4 text-[#3D60A8]" />;
    case "family": return <LucideIcons.Users className="h-4 w-4 text-[#633386]" />;
    case "charity": return <LucideIcons.Gift className="h-4 w-4 text-[#781D4B]" />;
    default: return <LucideIcons.Tags className="h-4 w-4 text-[#6B7280]" />;
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

// Replicando getSubcategoryDetails (do dashboard.tsx ou monthly-view.tsx)
// Certifique-se de que esta função esteja completa e reflita a versão mais recente
const getSubcategoryDetails = (expense: RecentExpense) => {
    let details: string[] = [];
    let descriptionText: string | null = null;
    // Para gastos de grupo ocasional, a categoria interna é routineCategory
    let actualCategory = expense.routineCategory ?? null;

    if (expense.expenseType === 'routine') { // Este 'if' é para o caso de a função ser reutilizada, mas aqui sempre será 'occasional'
      switch (actualCategory) {
        case 'fixed':
          if (expense.fixedExpenseTypeName) details.push(expense.fixedExpenseTypeName);
          if (expense.frequency) {
            const freq = expense.frequency;
            if (freq === 'weekly') { details.push('semanalmente'); }
            else if (freq === 'monthly') { details.push('mensalmente'); }
            else if (freq === 'semi-annually') { details.push('semestralmente'); }
            else if (freq === 'annually') { details.push('anualmente'); }
            else { details.push(`Frequência: ${freq}`); }
          }
        break;
        case 'supermarket':
          if (expense.supermarketName) details.push(expense.supermarketName);
        break;
        case 'food':
          if (expense.restaurantName) details.push(expense.restaurantName);
          const foodPurchaseType = expense.foodPurchaseType;
          if (foodPurchaseType) {
            if (foodPurchaseType === 'in-person') { details.push('pedido no local'); }
            else if (foodPurchaseType === 'online') { details.push('pedido à distância'); }
          }
          const occasionType = expense.occasionType;
          if (occasionType && occasionType !== 'normal') details.push(`especial`);
          descriptionText = expense.specialOccasionDescription ?? null;
        break;
        case 'services':
          if (expense.serviceTypeName) details.push(expense.serviceTypeName);
          descriptionText = expense.serviceDescription ?? null;
        break;
        case 'study':
          if (expense.studyTypeName) details.push(expense.studyTypeName);
          descriptionText = expense.studyDescription ?? null;
        break;
        case 'leisure':
          if (expense.leisureTypeName) details.push(expense.leisureTypeName);
          descriptionText = expense.leisureDescription ?? null;
        break;
        case 'personal-care':
          if (expense.personalCareTypeName) details.push(expense.personalCareTypeName);
          descriptionText = expense.personalCareDescription ?? null;
        break;
        case 'shopping':
          if (expense.shopName) details.push(expense.shopName);
          const shoppingPurchaseType = expense.shoppingPurchaseType;
          if (shoppingPurchaseType) {
            if (shoppingPurchaseType === 'in-person') { details.push('pedido no local'); }
            else if (shoppingPurchaseType === 'online') { details.push('pedido à distância'); }
          }
          const shoppingOccasionType = expense.shoppingOccasionType;
          if (shoppingOccasionType && shoppingOccasionType !== 'normal') details.push(`especial`);
          descriptionText = expense.shoppingSpecialOccasionDescription ?? null;
        break;
        case 'transportation':
          const startPlaceName = expense.startPlaceName ?? null;
          const endPlaceName = expense.endPlaceName ?? null;
          const startingPoint = expense.startingPoint ?? null;
          const destination = expense.destination ?? null;
          if (startPlaceName && endPlaceName) details.push(`${startPlaceName} -> ${endPlaceName}`);
          else if (startingPoint && destination) details.push(`${startingPoint} -> ${destination}`);

          const transportMode = expense.transportMode;
          if (transportMode) {
            if (transportMode === 'car') { details.push('carro'); }
            else if (transportMode === 'uber') { details.push('uber'); }
            else if (transportMode === 'bus') { details.push('ônibus'); }
            else if (transportMode === 'plane') { details.push('avião'); }
            else if (transportMode === 'subway') { details.push('metrô'); }
            else if (transportMode === 'another') { details.push('outro'); }
          }
          descriptionText = expense.transportDescription ?? null;
        break;
        case 'health':
          if (expense.healthTypeName) details.push(expense.healthTypeName);
          descriptionText = expense.healthDescription ?? null;
        break;
        case 'family':
          if (expense.familyMemberName) details.push(expense.familyMemberName);
          descriptionText = expense.familyDescription ?? null;
        break;
        case 'charity':
          if (expense.charityTypeName) details.push(expense.charityTypeName);
          descriptionText = expense.charityDescription ?? null;
        break;
      }
    }
    // Para ocorrências de recorrência, os detalhes já vêm do pai
    if (expense.recurringExpenseId && expense.recurringExpenseName) {
      // Já está em expense.displayName, mas se precisar de mais detalhes:
      // details.push(`(${expense.recurringExpenseName})`);
      // Se for uma parcela de recorrência determinada:
      if (expense.recurringExpenseRecurrenceType === 'determined' && expense.installmentNumber) {
        details.push(`Parcela ${expense.installmentNumber} de ${expense.recurringExpenseInstallmentsTotal || '?'}`);
      }
    }


    return { details: details.join(' • '), description: descriptionText };
};


export function ViewOccasionalGroupExpensesModal({
  open,
  onOpenChange,
  groupId,
  groupName,
}: ViewOccasionalGroupExpensesModalProps) {
  const { toast } = useToast();
  const modalContentRef = useRef<HTMLDivElement>(null);

  const { data: expenses = [], isLoading } = useQuery<RecentExpense[]>({
    queryKey: ["/api/occasional-groups", groupId, "expenses"],
    queryFn: async ({ queryKey }) => {
      const [_base, id, _path] = queryKey;
      if (!id) return [];
      const response = await apiRequest("GET", `/api/occasional-groups/${id}/expenses`);
      return response;
    },
    enabled: !!groupId && open, // Só faz a requisição se o modal estiver aberto e o groupId existir
  });

  const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  // Agrupa as despesas por routineCategory para os acordeões
  const groupedExpenses = expenses.reduce((acc, expense) => {
    const category = expense.routineCategory || 'outros'; // Fallback para 'outros'
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(expense);
    return acc;
  }, {} as Record<string, RecentExpense[]>);

  // Ordena as categorias para exibição (opcional, mas bom para consistência)
  const sortedCategories = Object.keys(groupedExpenses).sort((a, b) => {
    // Ordena pelas categorias fixas primeiro, depois as outras alfabeticamente
    const indexA = FIXED_CATEGORY_ORDER.indexOf(a);
    const indexB = FIXED_CATEGORY_ORDER.indexOf(b);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1; // A vem antes
    if (indexB !== -1) return 1; // B vem antes
    return a.localeCompare(b); // Ordem alfabética para o resto
  });


  const handleExportPdf = async () => {
    if (!modalContentRef.current) {
      toast({
        title: "Erro",
        description: "Conteúdo para exportar não encontrado.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Exportando para PDF...",
      description: `Gerando relatório para o grupo "${groupName}".`,
    });

    try {
      const input = modalContentRef.current;
      const canvas = await html2canvas(input, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = pdf.internal.pageSize.getWidth() - 20; // Margem de 10mm de cada lado
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10; // Posição inicial com margem superior

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`gastos_grupo_${groupName.replace(/\s+/g, '_')}.pdf`);
      toast({ title: "Sucesso", description: "Relatório PDF exportado!" });

    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast({
        title: "Erro na Exportação",
        description: "Falha ao gerar o PDF. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gastos do Grupo: {groupName}</DialogTitle>
          <DialogDescription>
            Visualização detalhada de todos os gastos associados a este grupo ocasional.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div ref={modalContentRef}>
            <div className="flex justify-between items-center mb-4 p-2 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-text-primary">
                Total de gastos: {formatCurrency(totalAmount)}
              </h3>
              <Button onClick={handleExportPdf} size="sm">
                <FileText className="mr-2 h-4 w-4" /> Exportar PDF
              </Button>
            </div>

            {expenses.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <p className="text-lg">Nenhum gasto encontrado para este grupo.</p>
                <p className="text-sm">Adicione despesas para este grupo para vê-las aqui.</p>
              </div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {sortedCategories.map((category) => {
                  const categoryExpenses = groupedExpenses[category];
                  const categoryTotal = categoryExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

                  // Ordenar os gastos dentro da categoria por data, mais recente primeiro
                  categoryExpenses.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

                  return (
                    <AccordionItem value={category} key={category} className="border-b">
                      <AccordionTrigger>
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center">
                            <div className="p-1 rounded-full mr-2" style={{ backgroundColor: getCategoryIconColor(category) }}>
                              {getCategoryIcon(category)}
                            </div>
                            <h4 className="text-md font-semibold text-text-primary capitalize">
                              {categoryLabels[category] || category.replace('-', ' ')}
                            </h4>
                          </div>
                          <span className="text-md font-bold text-text-primary">
                            {formatCurrency(categoryTotal)}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-1">
                        {categoryExpenses.map((expense, index) => {
                          const { details, description: expenseDescription } = getSubcategoryDetails(expense);
                          const iconBgColor = getCategoryIconColor(expense.routineCategory || 'outros'); // Pega a cor da subcategoria
                          const iconToDisplay = getCategoryIcon(expense.routineCategory || 'outros'); // Pega o ícone da subcategoria

                          return (
                            <div
                              key={expense.id}
                              className={`flex items-center justify-between p-3 rounded-lg ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                            >
                              <div className="flex items-center">
                                <div className="p-1 rounded-lg mr-3" style={{ backgroundColor: iconBgColor }}>
                                  {iconToDisplay}
                                </div>
                                <div>
                                  <p className="font-medium text-text-primary">{expense.displayName}</p>
                                  <p className="text-sm text-text-secondary">
                                    {details && `${details} • `}
                                    {expenseDescription && `${expenseDescription} • `}
                                    {format(new Date(expense.purchaseDate), 'd MMMM yyyy', { locale: ptBR })}
                                  </p>
                                </div>
                              </div>
                              <span className="font-semibold text-text-primary">
                                -{formatCurrency(parseFloat(expense.amount))}
                              </span>
                            </div>
                          );
                        })}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ViewOccasionalGroupExpensesModal;