// FUNÇÃO NA OPERAÇÃO: Adiciona um novo restaurante à lista de restaurantes

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

// Esquema de validação com Zod
const schema = z.object({
  name: z.string().min(2, "Nome do restaurante é requerido"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// COMPONENTE: O componente AddRestaurantModal é responsável por renderizar o formulário modal e gerenciar o estado do formulário e as chamadas de API. Recebe dois props: open: controla se o modal está aberto. onOpenChange: função para abrir/fechar o modal.
export function AddRestaurantModal({ open, onOpenChange }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      apiRequest("POST", "/api/restaurants", data),
    onSuccess: (newRestaurant) => {
      toast({ title: "Successo", description: "Restaurante adicionado!" });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description:
          error?.response?.data?.message || "Não foi possível adicionar restaurante.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Restaurante</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit((data) => mutation.mutate(data))(e);
            }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Restaurante</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: Spoleto, Mc Donald's..."
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
                {mutation.isPending ? "Salvando..." : "Salvo"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
