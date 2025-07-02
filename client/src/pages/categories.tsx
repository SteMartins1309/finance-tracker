import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Edit,
  Lock,
  Unlock,
  ShoppingCart,
  Utensils,
  Car,
  Tags,
  Heart,
  Home,
  Gamepad2,
  Scissors,
  Users,
  Gift,
  Calendar,
  Trash2,
  DollarSign,
} from "lucide-react";
import {
  // <--- Adicione estas importações para o AlertDialog
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const occasionalGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
});

type OccasionalGroupFormData = z.infer<typeof occasionalGroupSchema>;

const deleteConfirmationSchema = z.object({
  confirm: z.string().refine((val) => val.toLowerCase() === "delete", {
    message: "Type 'delete' to confirm.",
  }),
});

type DeleteConfirmationFormData = z.infer<typeof deleteConfirmationSchema>;

export default function Categories() {
  const [addGroupModalOpen, setAddGroupModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();



  const { data: occasionalGroups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ["/api/occasional-groups"],
  });

  const form = useForm<OccasionalGroupFormData>({
    resolver: zodResolver(occasionalGroupSchema),
    defaultValues: {
      name: "",
    },
  });


  //-------------------------------------------------------------------------------
  // Hook para buscar a lista de tipos de despesas fixas
  const { data: fixedExpenseTypes } = useQuery({ 
    queryKey: ["/api/fixed-expense-types"],
  });
  
  // Hook para buscar a lista de supermercados
  const { data: supermarkets = [] } = useQuery({
    queryKey: ["/api/supermarkets"],
  });

  // Hook para gerenciar o estado do modal de confirmação de exclusão de supermercado
  const [supermarketToDelete, setSupermarketToDelete] = useState<{ id: number; name: string } | null>(null);

  // Hook para buscar a lista de restaurantes
  const { data: restaurants = [] } = useQuery({
    queryKey: ["/api/restaurants"],
  });

  // Hook para gerenciar o estado do modal de confirmação de exclusão de tipo de despesa fixa
  const [fixedTypeToDelete, setFixedTypeToDelete] = useState<{ id: number; name: string } | null>(null);

  // Hook para gerenciar o estado do modal de confirmação de exclusão de restaurante
  const [restaurantToDelete, setRestaurantToDelete] = useState<{ id: number; name: string } | null>(null);
  //-------------------------------------------------------------------------------


  
  const createGroupMutation = useMutation({
    mutationFn: async (data: OccasionalGroupFormData) => {
      return await apiRequest("POST", "/api/occasional-groups", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/occasional-groups"] });
      toast({
        title: "Success",
        description: "Occasional group created successfully!",
      });
      setAddGroupModalOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleGroupStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: "open" | "closed";
    }) => {
      return await apiRequest("PATCH", `/api/occasional-groups/${id}/status`, {
        status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/occasional-groups"] });
      toast({
        title: "Success",
        description: "Group status updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update group status.",
        variant: "destructive",
      });
    },
  });


  // MUTAÇÕES
  //-------------------------------------------------------------------------------
  // Mutação para excluir um tipo de despesa fixa
  const deleteFixedExpenseTypeMutation = useMutation({ 
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/fixed-expense-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fixed-expense-types"] });
      toast({
        title: "Success",
        description: "Fixed expense type deleted successfully!",
      });
      setFixedTypeToDelete(null);
    },
    onError: (error: any) => {
      console.error("Error details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete fixed expense type. Please try again.",
        variant: "destructive",
      });
      setFixedTypeToDelete(null);
    },
  });
  
  // Mutação para excluir um supermercado
  const deleteSupermarketMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/supermarkets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supermarkets"] }); // Invalida a query para atualizar a lista
      toast({
        title: "Success",
        description: "Supermarket deleted successfully!",
      });
      setSupermarketToDelete(null); // Fecha o modal de confirmação
    },
    onError: (error: any) => {
      console.error("Error details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete supermarket. Please try again.",
        variant: "destructive",
      });
      setSupermarketToDelete(null); // Fecha o modal de confirmação mesmo com erro
    },
  });

  // Mutação para excluir um restaurante
  const deleteRestaurantMutation = useMutation({ 
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/restaurants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] }); // Invalida a query para atualizar a lista
      toast({
        title: "Success",
        description: "Restaurant deleted successfully!",
      });
      setRestaurantToDelete(null); // Fecha o modal de confirmação
    },
    onError: (error: any) => {
      console.error("Error details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete restaurant. Please try again.",
        variant: "destructive",
      });
      setRestaurantToDelete(null); // Fecha o modal de confirmação mesmo com erro
    },
  });
  //-------------------------------------------------------------------------------

  

  const onSubmit = (data: OccasionalGroupFormData) => {
    createGroupMutation.mutate(data);
  };

  const toggleGroupStatus = (group: any) => {
    const newStatus = group.status === "open" ? "closed" : "open";
    toggleGroupStatusMutation.mutate({ id: group.id, status: newStatus });
  };


  // FUNÇÕES
  //-------------------------------------------------------------------------------
  // Função para lidar com a exclusão de um tipo de despesa fixa
  const handleDeleteFixedType = (fixedType: { id: number; name: string }) => { 
    setFixedTypeToDelete(fixedType);
  };
  
  // Função para lidar com a exclusão de um supermercado
  const handleDeleteSupermarket = (supermarket: { id: number; name: string }) => {
    setSupermarketToDelete(supermarket); // Abre o modal de confirmação
  };

  // Função para lidar com a exclusão de um restaurante
  const handleDeleteRestaurant = (restaurant: { id: number; name: string }) => { 
    setRestaurantToDelete(restaurant);// Abre o modal de confirmação
  };
  //-------------------------------------------------------------------------------



    
  const routineCategories = [
    {
    { name: "Fixo", icon: DollarSign, count: fixedExpenseTypes?.length || 0 },
    { name: "Supermercado", icon: ShoppingCart, count: supermarkets?.length || 0},
    { name: "Alimentação", icon: Utensils, count: restaurants?.length || 0 },
    
    { name: "Services", icon: Home, count: 0 },
    { name: "Leisure", icon: Gamepad2, count: 0 },
    { name: "Personal Care", icon: Scissors, count: 0 },
    { name: "Shopping", icon: Tags, count: 0 },
    { name: "Transportation", icon: Car, count: 0 },
    { name: "Health", icon: Heart, count: 0 },
    { name: "Family", icon: Users, count: 0 },
    { name: "Charity", icon: Gift, count: 0 },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">
            Manage Categories
          </h2>
          <p className="text-text-secondary mt-1">
            Configure routine categories and occasional groups
          </p>
        </div>
        <Dialog open={addGroupModalOpen} onOpenChange={setAddGroupModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-secondary hover:bg-green-700 text-white px-6 py-3 font-medium shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Occasional Group</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Holiday Trip 2024"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddGroupModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createGroupMutation.isPending}
                  >
                    {createGroupMutation.isPending
                      ? "Creating..."
                      : "Create Group"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Routine Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Routine Categories</CardTitle>
            <p className="text-sm text-text-secondary">
              Manage your recurring expense types
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {routineCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.name}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <p className="font-medium text-text-primary">
                        {category.name}
                      </p>
                      <p className="text-sm text-text-secondary">

                        {/*  Início da subcategoria 'fixed'  */}
                        {category.name === "Fixed" && ( 
                                          <>
                                            {fixedExpenseTypes?.map((type: any) => (
                                              <div key={type.id} className="flex items-center justify-between text-xs py-0.5 ml-2">
                                                <span>{type.name}</span>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6"
                                                  onClick={() => handleDeleteFixedType(type)} // <--- Chamada para deletar o tipo de despesa fixa
                                                >
                                                  <Trash2 className="h-3 w-3 text-red-500" />
                                                </Button>
                                              </div>
                                            ))}
                                            {fixedExpenseTypes?.length === 0 && <span className="ml-2">No fixed expense types added.</span>}
                                          </>
                                        )}
                                        {/* Para as outras categorias que não listam sub-itens, manter a contagem ou descrição padrão */}
                                        {!(category.name === "Supermarket" || category.name === "Food" || category.name === "Fixed") &&
                                          `${category.count} ${category.count === 1 ? 'item' : 'items'} configured`
                                        }
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {/* ... botão Edit existente ... */}
                                  </div>
                                </div>
                              );
                            })}
                          </CardContent>
                        </Card>
                        {/*  Fim da subcategoria 'fixed'  */}
                        
                        {/*  Início da subcategoria 'supermarket'  */}
                        {category.name === "Supermarket" && (
                          <>
                            {supermarkets?.map((sm: any) => (
                              <div key={sm.id} className="flex items-center justify-between text-xs py-0.5 ml-2">
                                <span>{sm.name}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleDeleteSupermarket(sm)} // Chamada para deletar o supermercado
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                              </div>
                            ))}
                            {supermarkets?.length === 0 && <span className="ml-2">No supermarkets added.</span>}
                          </>
                        )}
                        {/*  Fim da subcategoria 'supermarket'  */}

                        {/*  Início da subcategoria 'food'  */}
                        {category.name === "Food" && ( 
                          <>
                            {restaurants?.map((res: any) => (
                              <div key={res.id} className="flex items-center justify-between text-xs py-0.5 ml-2">
                                <span>{res.name}</span>
                                <Button 
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleDeleteRestaurant(res)} // Chamada para deletar o restaurante
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                              </div>
                            ))}
                            {restaurants?.length === 0 && <span className="ml-2">No restaurants added.</span>}
                          </>
                        )}
                        {/*  Fim da subcategoria 'food'  */}

                        
                        {category.count}{" "}
                        {category.count === 1 ? "item" : "items"} configured
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Occasional Groups */}
        <Card>
          <CardHeader>
            <CardTitle>Occasional Groups</CardTitle>
            <p className="text-sm text-text-secondary">
              Manage special expense groups
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {groupsLoading ? (
              [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <Skeleton className="h-5 w-5 mr-3" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))
            ) : occasionalGroups?.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-text-secondary">No occasional groups yet</p>
                <p className="text-sm text-text-secondary">
                  Create your first group to get started
                </p>
              </div>
            ) : (
              occasionalGroups?.map((group: any) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-accent mr-3" />
                    <div>
                      <p className="font-medium text-text-primary">
                        {group.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            group.status === "open" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {group.status === "open" ? "Open" : "Closed"}
                        </Badge>
                        <span className="text-sm text-text-secondary">
                          Created{" "}
                          {new Date(group.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleGroupStatus(group)}
                      disabled={toggleGroupStatusMutation.isPending}
                    >
                      {group.status === "open" ? (
                        <Lock className="h-4 w-4 text-accent" />
                      ) : (
                        <Unlock className="h-4 w-4 text-secondary" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div> 

      {/* AlertDialog de Confirmação para Exclusão de Tipo de Despesa Fixa */}
      <AlertDialog
        open={!!fixedTypeToDelete}
        onOpenChange={(open) => !open && setFixedTypeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold text-primary">{fixedTypeToDelete?.name}</span>{" "}
              from your fixed expense types list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteFixedExpenseTypeMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (fixedTypeToDelete) {
                  deleteFixedExpenseTypeMutation.mutate(fixedTypeToDelete.id);
                }
              }}
              disabled={deleteFixedExpenseTypeMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteFixedExpenseTypeMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>  {/* Fim AlertDialog de Confirmação para Exclusão de Tipo de Despesa Fixa */}

      {/* AlertDialog de Confirmação para Exclusão de Supermercado */}
      <AlertDialog
        open={!!supermarketToDelete}
        onOpenChange={(open) => !open && setSupermarketToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não poderá ser desfeita. Isso vai deletar{" "}
              <span className="font-semibold text-primary">{supermarketToDelete?.name}</span>{" "}
              permanentemente da sua lista de supermercados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSupermarketMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (supermarketToDelete) {
                  deleteSupermarketMutation.mutate(supermarketToDelete.id);
                }
              }}
              disabled={deleteSupermarketMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteSupermarketMutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>    {/* Fim do AlertDialog de Confirmação para Exclusão de Supermercado */}
      
      {/* AlertDialog de Confirmação para Exclusão de Restaurante */}
      <AlertDialog
        open={!!restaurantToDelete}
        onOpenChange={(open) => !open && setRestaurantToDelete(null)}
      >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não poderá ser desfeita. Isso vai deletar{" "}
                <span className="font-semibold text-primary">{restaurantToDelete?.name}</span>{" "}
                permanentemente da sua lista de restaurantes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteRestaurantMutation.isPending}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (restaurantToDelete) {
                    deleteRestaurantMutation.mutate(restaurantToDelete.id);
                  }
                }}
                disabled={deleteRestaurantMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleteRestaurantMutation.isPending ? "Deletando..." : "Deletar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>  {/* Fim AlertDialog de Confirmação para Exclusão de Restaurante */}



  
    </div>
  );
}
