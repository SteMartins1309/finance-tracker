// IMPORTS

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, 
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


// SCHEMA: Define o esquema de validação para o formulário de adição de supermercado
const schema = z.object({
  name: z.string().min(2, "Nome do supermercado é requerido"),
});

// FORM DATA: Define o tipo de dados para o formulário de adição de supermercado
type FormData = z.infer<typeof schema>;

// PROPS: Define as propriedades para o componente de modal de adição de supermercado
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ADD SUPERMARKET MODAL: Componente de modal para adicionar um novo supermercado
export function AddSupermarketModal({ open, onOpenChange }: Props) {

  // Cria o formulário de adição de supermercado
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  // Inicializa os hooks de query e toast
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Cria a mutação para adicionar um novo supermercado
  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      apiRequest("POST", "/api/supermarkets", data),
    onSuccess: (newSupermarket) => {
      toast({ title: "Sucesso", description: "Supermercado adicionado!" }); 
      queryClient.invalidateQueries({ queryKey: ["/api/supermarkets"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description:
          error?.response?.data?.message ||
          "Não foi possível adicionar supermercado",
        variant: "destructive",
      });
    },
  });

  // Renderiza o componente de modal
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Supermercado</DialogTitle>
          <DialogDescription>
            Insira o nome do novo supermercado que você frequenta.
          </DialogDescription>
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
                  <FormLabel>Nome do Supermercado</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: Roldão, Carrefour, ..."
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