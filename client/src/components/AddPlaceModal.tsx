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


// SCHEMA: Define o esquema de validação para o formulário de adição de lugar
const schema = z.object({
  name: z.string().min(2, "Place name is required"),
});

// FORM DATA: Define o tipo de dados para o formulário de adição de lugar
type FormData = z.infer<typeof schema>;

// PROPS: Define as propriedades para o componente de modal de adição de lugar
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ADD PLACE MODAL: Componente de modal para adição de lugar
export function AddPlaceModal({ open, onOpenChange }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  // Inicializa os hooks de query e toast
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Define a mutação para adicionar um novo lugar
  const mutation = useMutation({
    mutationFn: (data: FormData) => apiRequest("POST", "/api/places", data),
    onSuccess: () => {
      toast({ title: "Successo", description: "Local adicionado!" });
      queryClient.invalidateQueries({ queryKey: ["/api/places"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description:
          error?.response?.data?.message || "Não foi possível adicionar local",
        variant: "destructive",
      });
    },
  });

  // Renderiza o componente de modal de adição de lugar
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar local</DialogTitle>
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
                  <FormLabel>Nome do local</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: H8, Shopping do Vale, ..."
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