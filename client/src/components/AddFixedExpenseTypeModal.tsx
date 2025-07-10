// IMPORTS

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";


// SCHEMA: Esquema de validação para o formulário de adição de tipo de despesa fixa
const schema = z.object({
  name: z.string().min(2, "Nome do tipo de gasto fixo é requerido"),
});

// FORM DATA: Tipo de dados para o formulário de adição de tipo de despesa fixa
type FormData = z.infer<typeof schema>;

// PROPS: Propriedades do componente AddFixedExpenseTypeModal
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ADD FIXED EXPENSE TYPE MODAL: Componente de modal para adição de tipo de despesa fixa
export function AddFixedExpenseTypeModal({ open, onOpenChange }: Props) {

  // Formulário de adição de tipo de despesa fixa
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  // Inicializa os hooks de query e toast
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mutation para adicionar um novo tipo de despesa fixa
  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      apiRequest("POST", "/api/fixed-expense-types", data),
    onSuccess: () => {
      toast({ title: "Successo", description: "Tipo de gasto fixo adicionado!" });
      queryClient.invalidateQueries({ queryKey: ["/api/fixed-expense-types"] }); 
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description:
          error?.response?.data?.message || "Não foi possível adicionar o tipo de gasto fixo",
        variant: "destructive",
      });
    },
  });

  // Renderiza o componente de modal
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar tipo de despesa fixa</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do tipo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: aluguel, contas de casa, ..."
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
