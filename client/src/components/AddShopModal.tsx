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


// SCHEMA: Define o esquema de validação para o formulário
const schema = z.object({
  name: z.string().min(2, "Shop name is required"),
});

// FORM DATA: Define o tipo de dados para o formulário
type FormData = z.infer<typeof schema>;

// PROPS: Define as propriedades do componente
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ADD SHOP MODAL: Componente de modal para adicionar uma nova loja
export function AddShopModal({ open, onOpenChange }: Props) {

  // Cria o formulário usando o hook useForm
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  // Inicializa os hooks de query e toast
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Cria a mutação para adicionar uma nova loja
  const mutation = useMutation({
    mutationFn: (data: FormData) => apiRequest("POST", "/api/shops", data),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Loja adicionada!" }); 
      queryClient.invalidateQueries({ queryKey: ["/api/shops"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description:
          error?.response?.data?.message || "Não foi possível adicionar loja",
        variant: "destructive",
      });
    },
  });

  // Renderiza o componente de modal
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar loja</DialogTitle>
          <DialogDescription>
            Insira o nome da nova loja onde você costuma fazer compras.
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
                  <FormLabel>Nome da loja</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: Amazon, Magazine Luiza, ..."
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