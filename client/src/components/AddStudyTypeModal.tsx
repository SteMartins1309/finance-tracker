// client/src/components/AddStudyTypeModal.tsx

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

// SCHEMA: Define o esquema de validação para o formulário de adição de tipo de estudo
const schema = z.object({
  name: z.string().min(2, "Study type name is required"),
});

// FORM DATA: Define o tipo de dados do formulário
type FormData = z.infer<typeof schema>;

// PROPS: Define as propriedades do componente AddStudyTypeModal
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ADD STUDY TYPE MODAL: Componente para adicionar um novo tipo de estudo
export function AddStudyTypeModal({ open, onOpenChange }: Props) {
  // Inicializa o hook de formulário com o esquema de validação e os valores padrão
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  // Inicializa os hooks de query e toast
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Define a mutação para adicionar um novo tipo de estudo
  const mutation = useMutation({
    mutationFn: (data: FormData) => apiRequest("POST", "/api/study-types", data), // Nova rota de API
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Tipo de estudo adicionado!" });
      queryClient.invalidateQueries({ queryKey: ["/api/study-types"] }); // Nova query key para invalidar
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Erro ao adicionar tipo de estudo:", error); // Melhor log de erro
      toast({
        title: "Erro",
        description:
          error?.response?.data?.message || "Não foi possível adicionar tipo de estudo",
        variant: "destructive",
      });
    },
  });

  // Renderiza o componente
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicione um tipo de estudo</DialogTitle>
          <DialogDescription>
            Insira o nome do novo tipo de estudo (ex: curso, livro, certificação).
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
                      placeholder="ex: Graduação em TI, Curso de Inglês, ..."
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