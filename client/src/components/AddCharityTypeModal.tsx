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


// SCHEMA: Define o esquema de validação para o formulário de adição de tipo de caridade
const schema = z.object({
  name: z.string().min(2, "Charity type name is required"),
});

// FORM DATA: Define o tipo de dados do formulário
type FormData = z.infer<typeof schema>;

// PROPS: Define as propriedades do componente AddCharityTypeModal
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ADD CHARITY TYPE MODAL: Componente para adicionar um novo tipo de caridade
export function AddCharityTypeModal({ open, onOpenChange }: Props) {

  // Inicializa o hook de formulário com o esquema de validação e os valores padrão
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  // Inicializa os hooks de query e toast
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Define a mutação para adicionar um novo tipo de caridade
  const mutation = useMutation({
    mutationFn: (data: FormData) => apiRequest("POST", "/api/charity-types", data),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Tipo de caridade adicionado!" }); 
      queryClient.invalidateQueries({ queryKey: ["/api/charity-types"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description:
          error?.response?.data?.message || "Não foi possível adicionar tipo de caridade",
        variant: "destructive",
      });
    },
  });

  // Renderiza o componente
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicione um tipo de caridade</DialogTitle>
          <DialogDescription>
            Insira o nome do novo tipo de caridade.
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
                      placeholder="ex: auxílio à catástrofes, doação para a igreja, ..."
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