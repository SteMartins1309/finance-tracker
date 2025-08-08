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


// SCHEMA: Esquema de validação para o formulário de adição de tipo de cuidado pessoal
const schema = z.object({
  name: z.string().min(2, "Personal care type name is required"),
});

// FORM DATA: Tipo de dados para o formulário de adição de tipo de cuidado pessoal
type FormData = z.infer<typeof schema>;

// PROPS: Propriedades do componente AddPersonalCareTypeModal
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ADD PERSONAL CARE TYPE MODAL: Componente de modal para adicionar um novo tipo de cuidado pessoal
export function AddPersonalCareTypeModal({ open, onOpenChange }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  // Inicializa os hooks de query e toast
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mutation para adicionar um novo tipo de cuidado pessoal
  const mutation = useMutation({
    mutationFn: (data: FormData) => apiRequest("POST", "/api/personal-care-types", data),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Tipo de cuidado pessoal adicionado!" }); 
      queryClient.invalidateQueries({ queryKey: ["/api/personal-care-types"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description:
          error?.response?.data?.message || "Não foi possível adicionar tipo de cuidado pessoal",
        variant: "destructive",
      });
    },
  });

  // Renderiza o componente de modal
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar tipo de cuidado pessoal</DialogTitle>
          <DialogDescription>
            Insira o nome do novo tipo de cuidado pessoal (ex: salão de beleza, maquiagem, etc.).
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
                      placeholder="ex: corte de cabelo, maquiagem, ..."
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