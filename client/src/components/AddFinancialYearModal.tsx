// AddFinancialYearModal.tsx

import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

// Mantenha o schema e os valores padrão como estão, eles estão corretos.
const schema = z.object({
  year: z.number().min(2000, "O ano deve ser no mínimo 2000."),
  totalMonthlyGoal: z.preprocess(
    (val) => val === "" || val === undefined ? NaN : Number(val),
    z.number().min(0, "A meta mensal total não pode ser negativa.").optional().nullable()
  ),
  monthlyGoals: z.array(z.object({
    category: z.string(),
    amount: z.preprocess(
      (val) => val === "" || val === undefined ? NaN : Number(val),
      z.number().min(0, "O valor da meta não pode ser negativo.")
    ).optional().nullable()
  })),
});

const DEFAULT_GOALS = [
  { category: "fixed", amount: undefined },
  { category: "supermarket", amount: undefined },
  { category: "food", amount: undefined },
  { category: "services", amount: undefined },
  { category: "study", amount: undefined },
  { category: "leisure", amount: undefined },
  { category: "personal-care", amount: undefined },
  { category: "shopping", amount: undefined },
  { category: "transportation", amount: undefined },
  { category: "health", amount: undefined },
  { category: "family", amount: undefined },
  { category: "charity", amount: undefined }
];

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
  "charity": "Caridade"
};

export default function AddFinancialYearModal({ open, onOpenChange, initialData, onSubmitSuccess }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any; // initialData agora pode ser 'FinancialYearData' se você tipar corretamente
  onSubmitSuccess?: (data: any) => void; // Para uso em MonthlyGoalsDisplay
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      year: new Date().getFullYear(),
      totalMonthlyGoal: undefined,
      monthlyGoals: DEFAULT_GOALS.map(g => ({ ...g, amount: undefined }))
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // Se onSubmitSuccess for fornecido, a lógica de API é tratada pelo pai (MonthlyGoalsDisplay).
      // Este modal apenas retorna os dados.
      if (onSubmitSuccess) {
        return Promise.resolve(data);
      } else {
        // Lógica para criar ou atualizar o Financial Year
        const payload = {
          year: data.year,
          totalMonthlyGoal: data.totalMonthlyGoal || 0,
          monthlyGoals: data.monthlyGoals.map((goal: any) => ({
            category: goal.category,
            amount: goal.amount || 0 // Garante que o valor da meta é um número
          }))
        };

        if (initialData?.id) {
          // Atualiza um ano financeiro existente
          return await apiRequest("PUT", `/api/financial-years/${initialData.id}`, payload);
        } else {
          // Cria um novo ano financeiro
          return await apiRequest("POST", "/api/financial-years", payload);
        }
      }
    },
    onSuccess: (dataFromMutation) => { // 'dataFromMutation' é o retorno do mutationFn
      if (onSubmitSuccess) {
        onSubmitSuccess(dataFromMutation); // Passe os dados (que são o payload original) para o pai
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/financial-years"] }); // Invalida a lista de anos
        queryClient.invalidateQueries({ queryKey: ["/api/financial-years", initialData?.id?.toString()] }); // Invalida o detalhe do ano se estiver editando
        toast({ title: "Sucesso", description: initialData ? "Ano financeiro atualizado!" : "Ano financeiro criado!" });
      }
      onOpenChange(false);
    },
    onError: (error: any) => {
        console.error("Erro ao salvar ano financeiro:", error);
        toast({
            title: "Erro",
            description: error.message || "Falha ao salvar o ano financeiro. Tente novamente.",
            variant: "destructive",
        });
    }
  });

  useEffect(() => {
    if (open && initialData) {
      const goalMap = new Map(initialData.monthlyGoals?.map((goal: any) => [goal.category, goal.amount]));
      const fullGoals = DEFAULT_GOALS.map(g => ({
        category: g.category,
        amount: goalMap.get(g.category) // Isso já deve ser undefined se não houver valor
      }));

      const safeData = {
        ...initialData,
        monthlyGoals: fullGoals,
        totalMonthlyGoal: initialData.totalMonthlyGoal !== null && initialData.totalMonthlyGoal !== undefined
                          ? initialData.totalMonthlyGoal
                          : undefined
      };
      reset(safeData);
    } else if (open && !initialData) {
      reset({
        year: new Date().getFullYear(),
        totalMonthlyGoal: undefined, // Inicia como undefined para novo ano
        monthlyGoals: DEFAULT_GOALS.map(g => ({ ...g, amount: undefined })) // Inicia como undefined
      });
    }
  }, [open, initialData, reset]);

  const onSubmit = (data: any) => { // <--- Função onSubmit
    console.log("Dados do formulário:", data);
    console.log("Erros de validação (se houver):", errors); // 'errors' aqui é o objeto de erro do form, não da mutação
    mutation.mutate(data);
  };

  const categories = watch("monthlyGoals") || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Ano Financeiro" : "Novo Ano Financeiro"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="year">Ano</Label>
            <Input type="number" {...register("year", { valueAsNumber: true })} />
            {errors.year && <p className="text-red-500 text-sm">{errors.year.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalMonthlyGoal">Meta mensal total</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
              <Input
                type="number"
                step="0.01"
                className="pl-8"
                {...register("totalMonthlyGoal", { valueAsNumber: true })}
              />
            </div>
            {errors.totalMonthlyGoal && <p className="text-red-500 text-sm">{errors.totalMonthlyGoal.message}</p>}
          </div>

          <ScrollArea className="h-[250px] border rounded-md p-4">
            <div className="space-y-3">
              {categories.map((item: any, index: number) => (
                <div className="flex justify-between items-center gap-2" key={item.category || index}>
                  <Label className="capitalize w-40">{categoryLabels[item.category] || item.category?.replace("-", " ") || ""}</Label>
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    <Input
                      type="number"
                      step="0.01"
                      className="pl-8"
                      {...register(`monthlyGoals.${index}.amount`, { valueAsNumber: true })}
                    />
                  </div>
                  {errors.monthlyGoals?.[index]?.amount && (
                    <p className="text-red-500 text-sm">
                      {errors.monthlyGoals[index].amount?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex justify-end">
            <Button type="submit">{initialData ? "Salvar Alterações" : "Criar Ano"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}