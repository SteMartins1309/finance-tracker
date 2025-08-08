// src/components/AnnualView.tsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronDown, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import AddFinancialYearModal from "@/components/AddFinancialYearModal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import MonthlyGoalsDisplay from "@/components/MonthlyGoalsDisplay";

// NOVO: Tipo para as estatísticas anuais
interface AnnualStats {
  total: number;
  avgMonthly: number;
  topCategory: string;
  categoryTotals: { [key: string]: number };
}

interface FinancialYearData {
  id: number;
  year: number;
  totalMonthlyGoal: number;
  createdAt: string;
  monthlyGoals?: { category: string; amount: number }[];
}

export default function AnnualView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<FinancialYearData | null>(null);
  const [deletingYear, setDeletingYear] = useState<FinancialYearData | null>(null);

  const [selectedYearId, setSelectedYearId] = useState<number | null>(() => {
    const savedYearId = localStorage.getItem('selectedFinancialYearId');
    return savedYearId ? parseInt(savedYearId, 10) : null;
  });

  const { data: financialYears, isLoading } = useQuery<FinancialYearData[]>({
    queryKey: ["/api/financial-years"],
  });

  // NOVO: Query para buscar estatísticas anuais, que agora só consideram gastos PAGOS
  const { data: annualStats, isLoading: isAnnualStatsLoading } = useQuery<AnnualStats>({
    queryKey: ['/api/stats/annual', selectedYearId],
    queryFn: async ({ queryKey }) => {
      const [_key, yearId] = queryKey;
      // Se não houver ano selecionado, não faz a requisição
      if (!yearId) return { total: 0, avgMonthly: 0, topCategory: 'none', categoryTotals: {} };
      
      const year = financialYears?.find(y => y.id === yearId)?.year;
      if (!year) throw new Error("Ano financeiro não encontrado.");

      const response = await apiRequest("GET", `/api/stats/annual/${year}`);
      return response;
    },
    enabled: !!selectedYearId && !isLoading, // Habilita a query apenas se um ano estiver selecionado e a lista de anos já tiver sido carregada
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => await apiRequest("DELETE", `/api/financial-years/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-years"] });
      toast({ title: "Ano excluído com sucesso." });
      if (deletingYear && deletingYear.id === selectedYearId) {
        setSelectedYearId(null);
      }
    },
    onError: () => toast({ title: "Erro ao excluir ano.", variant: "destructive" }),
    onSettled: () => setDeletingYear(null),
  });

  useEffect(() => {
    if (selectedYearId !== null) {
      localStorage.setItem('selectedFinancialYearId', String(selectedYearId));
    } else {
      localStorage.removeItem('selectedFinancialYearId');
    }
  }, [selectedYearId]);

  const handleSelectYearForDetails = (yearId: number) => {
    setSelectedYearId(yearId);
  };

  const handleGoBackFromDetails = () => {
    setSelectedYearId(null);
  };

  // Funções auxiliares para renderizar o JSX dos detalhes do ano
  const renderAnnualDetails = () => {
    if (!selectedYearId) return null;
    
    // Filtra o ano selecionado da lista completa
    const selectedYearData = financialYears?.find(y => y.id === selectedYearId);
    
    if (!selectedYearData) {
        return <p className="text-center text-text-secondary mt-8">Ano financeiro não encontrado.</p>;
    }
    
    // Usa os dados da nova query de estatísticas anuais
    const isDetailsLoading = isAnnualStatsLoading || isLoading;
    const yearName = selectedYearData.year;
    
    return (
      <div className="mt-8 space-y-6">
        <h3 className="text-2xl font-bold text-text-primary">{`Estatísticas de ${yearName}`}</h3>
        
        {isDetailsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Anual */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Anual Gasto</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(annualStats?.total || 0)}</div>
                        <p className="text-xs text-muted-foreground">Considerando apenas gastos pagos.</p>
                    </CardContent>
                </Card>
                {/* Média Mensal */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Média/mês</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(annualStats?.avgMonthly || 0)}</div>
                        <p className="text-xs text-muted-foreground">Média com base nos 12 meses do ano.</p>
                    </CardContent>
                </Card>
                {/* Categoria mais Gasta */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Categoria Top</CardTitle>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{annualStats?.topCategory || 'N/A'}</div>
                        <p className="text-xs text-muted-foreground">Sua maior despesa anual.</p>
                    </CardContent>
                </Card>
            </div>
        )}
        
        {/* Detalhes de Metas Mensais */}
        <MonthlyGoalsDisplay yearId={selectedYearId} onGoBack={handleGoBackFromDetails} />
        
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Estatísticas Anuais</h2>
          <p className="text-sm text-text-secondary">Gerencie seus anos financeiros e metas mensais.</p>
        </div>
        <Button onClick={() => { setEditingYear(null); setModalOpen(true); }}>+ Novo Ano</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : (
        <>
          {/* Acordeão principal para os cards de anos */}
          <Accordion
            type="single"
            collapsible
            className="w-full border rounded-lg shadow-sm bg-card"
            value={selectedYearId ? undefined : "years-list"}
            onValueChange={(value) => {
              if (!value && selectedYearId) {
                return;
              }
              if (value === "years-list") {
                setSelectedYearId(null);
              }
            }}
          >
            <AccordionItem value="years-list">
              <AccordionTrigger className="flex justify-between items-center p-4 hover:bg-muted/50 transition-colors">
                <h3 className="text-xl font-semibold text-text-primary">
                  {selectedYearId
                    ? `Ano Selecionado: ${financialYears?.find(y => y.id === selectedYearId)?.year || 'N/A'}`
                    : "Selecione um Ano Financeiro"
                  }
                </h3>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </AccordionTrigger>
              <AccordionContent className="p-4 border-t bg-background/50">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {financialYears?.map((year) => (
                    <Card key={year.id} className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => handleSelectYearForDetails(year.id)}>
                      <CardHeader className="p-0 pb-2 flex-row justify-between items-center">
                        <CardTitle className="text-lg">{year.year}</CardTitle>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditingYear(year); setModalOpen(true); }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeletingYear(year); }}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <p className="text-sm text-text-secondary">Meta mensal total: {formatCurrency(year.totalMonthlyGoal)}</p>
                        <p className="text-sm text-text-secondary mt-1">Categorias com metas: {year.monthlyGoals?.length || 0}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* NOVO POSICIONAMENTO DO BOTÃO VOLTAR */}
          {selectedYearId && (
            <div className="mt-4 text-right">
              <Button variant="outline" size="sm" onClick={handleGoBackFromDetails}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Seleção de Anos
              </Button>
            </div>
          )}

          {/* Renderização condicional dos detalhes do ano */}
          {selectedYearId && renderAnnualDetails()}
        </>
      )}

      <AddFinancialYearModal open={modalOpen} onOpenChange={setModalOpen} initialData={editingYear} />

      <AlertDialog open={!!deletingYear} onOpenChange={(open) => !open && setDeletingYear(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja excluir o ano {deletingYear?.year}? Essa ação é irreversível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingYear && deleteMutation.mutate(deletingYear.id)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}