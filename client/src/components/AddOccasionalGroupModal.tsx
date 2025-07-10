import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea"; // Para descrição
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"; // Para seleção de ícone
import * as LucideIcons from "lucide-react"; // Para listar ícones Lucide React
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Esquema de validação com Zod (deve ser o mesmo que em categories.tsx)
const schema = z.object({
  name: z.string().min(1, "O nome do grupo é obrigatório."),
  description: z.string().optional(),
  iconName: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Lista de nomes de ícones Lucide React para seleção
const availableIcons = Object.keys(LucideIcons).filter(name => {
  // Filtra para mostrar apenas ícones que são componentes React (começam com maiúscula)
  // e exclui alguns utilitários internos que não são ícones
  return name[0] === name[0].toUpperCase() && !['createContext', 'forwardRef', 'default'].includes(name);
});

export function AddOccasionalGroupModal({ open, onOpenChange }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", iconName: "" },
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: FormData) => apiRequest("POST", "/api/occasional-groups", data),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Grupo ocasional adicionado!" });
      queryClient.invalidateQueries({ queryKey: ["/api/occasional-groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/occasional-groups/open"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Detalhes do erro:", error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao adicionar grupo ocasional. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Grupo Ocasional</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Grupo</FormLabel>
                  <FormControl><Input placeholder="Ex: Viagem para o show, Aniversário do João..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl><Textarea placeholder="Ex: Gastos de 3 dias no festival..." rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="iconName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone (opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione um ícone" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableIcons.map(iconName => {
                        const IconComponent = (LucideIcons as any)[iconName];
                        return (
                          <SelectItem key={iconName} value={iconName}>
                            <div className="flex items-center gap-2">
                              {IconComponent && <IconComponent className="h-4 w-4" />}
                              <span>{iconName}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormDescription>Escolha um ícone para representar este grupo.</FormDescription>
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