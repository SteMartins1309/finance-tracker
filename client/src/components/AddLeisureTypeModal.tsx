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


// SCHEMA: Define o esquema de validação para o formulário de adição de tipo de lazer
const schema = z.object({
  name: z.string().min(2, "Leisure type name is required"),
});

// FORM DATA: Define o tipo de dados para o formulário de adição de tipo de lazer
type FormData = z.infer<typeof schema>;

// PROPS: Define as propriedades para o componente AddLeisureTypeModal
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ADD LEISURE TYPE MODAL: Componente para adicionar um novo tipo de lazer
export function AddLeisureTypeModal({ open, onOpenChange }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  // Inicializa os hooks de query e toast
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mutation para adicionar um novo tipo de lazer
  const mutation = useMutation({
    mutationFn: (data: FormData) => apiRequest("POST", "/api/leisure-types", data),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Tipo de lazer adicionado!" });
      queryClient.invalidateQueries({ queryKey: ["/api/leisure-types"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description:
          error?.response?.data?.message || "Não foi possível adicionar tipo de lazer",
        variant: "destructive",
      });
    },
  });

  // Renderiza o componente
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar tipo de lazer</DialogTitle>
          <DialogDescription>
            Insira o nome do novo tipo de lazer (ex: cinema, viagem, etc.).
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
                  <FormLabel>Nome do tipo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: cinema, rolê, ..."
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