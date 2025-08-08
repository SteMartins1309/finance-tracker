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
  name: z.string().min(2, "Family member name is required"),
});

// FORM DATA: Define o tipo de dados para o formulário
type FormData = z.infer<typeof schema>;

// PROPS: Define as propriedades do componente
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ADD FAMILY MEMBER MODAL: Componente para adicionar um novo membro da família
export function AddFamilyMemberModal({ open, onOpenChange }: Props) {

  // Cria o formulário com o esquema de validação e valores padrão
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  // Query client e toast para notificações
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mutation para adicionar um novo membro da família
  const mutation = useMutation({
    mutationFn: (data: FormData) => apiRequest("POST", "/api/family-members", data),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Membro da família adicionado!" });
      queryClient.invalidateQueries({ queryKey: ["/api/family-members"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description:
          error?.response?.data?.message || "Não foi possível adicionar membro da família",
        variant: "destructive",
      });
    },
  });

  // Renderiza o componente
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar membro da família</DialogTitle>
          <DialogDescription>
            Insira o nome do novo membro da família.
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
                  <FormLabel>Nome do membro</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: Mamãe, Vovó, Titio, ..."
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