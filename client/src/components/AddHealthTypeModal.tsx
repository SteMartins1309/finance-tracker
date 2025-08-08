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


// SCHEMA: Define o esquema de validação para o formulário de adição de tipo de saúde
const schema = z.object({
  name: z.string().min(2, "Health type name is required"),
});

// FORM DATA: Define o tipo de dados para o formulário de adição de tipo de saúde
type FormData = z.infer<typeof schema>;

// PROPS: Define as propriedades do componente AddHealthTypeModal
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ADD HEALTH TYPE MODAL: Componente para adicionar um novo tipo de saúde
export function AddHealthTypeModal({ open, onOpenChange }: Props) {

  // Cria o formulário de adição de tipo de saúde
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  // Inicializa os hooks de query e toast
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Cria a mutação para adicionar um novo tipo de saúde
  const mutation = useMutation({
    mutationFn: (data: FormData) => apiRequest("POST", "/api/health-types", data),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Demanda de saúde adicionada!" }); 
      queryClient.invalidateQueries({ queryKey: ["/api/health-types"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description:
          error?.response?.data?.message || "Não foi possível adicionar demanda de saúde",
        variant: "destructive",
      });
    },
  });

  // Renderiza o componente AddHealthTypeModal
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar demanda de saúde</DialogTitle>
          <DialogDescription>
            Insira o nome da nova demanda de saúde (ex: tipo de consulta, tratamento, etc.).
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
                  <FormLabel>Nome da demanda</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: remédio, atendimento médico, ..."
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