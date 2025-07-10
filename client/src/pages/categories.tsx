// IMPORTS

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


// OCCASIONAL GROUP SCHEMA: Esquema de validação para o formulário de criação de grupo ocasional
const occasionalGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
  iconName: z.string().optional(),  
});

type OccasionalGroupFormData = z.infer<typeof occasionalGroupSchema>;

const deleteConfirmationSchema = z.object({
  confirm: z.string().refine((val) => val.toLowerCase() === "delete", {
    message: "Type 'delete' to confirm.",
  }),
});

type DeleteConfirmationFormData = z.infer<typeof deleteConfirmationSchema>;


// CATEGORIES: PÁGINA DE MANUTENÇÃO DAS CATEGORIAS  
export default function Categories() {

  // HOOKS PARA CONTROLE DE MODAIS E TOASTS
  //-------------------------------------------------------------------------------------------------------------
  // Hooks para controle de modais
  const [addGroupModalOpen, setAddGroupModalOpen] = useState(false);
  // Hooks para controle de toasts
  const { toast } = useToast();
  // Hooks para controle de queries
  const queryClient = useQueryClient();
  const { data: occasionalGroups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ["/api/occasional-groups"],
  });
  //-------------------------------------------------------------------------------------------------------------
  // fim dos HOOKS PARA CONTROLE DE MODAIS E TOASTS


  // HOOKS PARA BUSCAR LISTAS DE ITENS DAS CATEGORIAS
  //-------------------------------------------------------------------------------------------------------------
  const { data: fixedExpenseTypes = [] } = useQuery({
    queryKey: ["/api/fixed-expense-types"],
  });
  
  const { data: supermarkets = [] } = useQuery({
    queryKey: ["/api/supermarkets"],
  });
  
  const { data: restaurants = [] } = useQuery({
    queryKey: ["/api/restaurants"],
  });

  const { data: serviceTypes = [] } = useQuery({
    queryKey: ["/api/service-types"],
  });

  const { data: leisureTypes = [] } = useQuery({
    queryKey: ["/api/leisure-types"],
  });

  const { data: personalCareTypes = [] } = useQuery({ 
    queryKey: ["/api/personal-care-types"],
  });

  const { data: shops = [] } = useQuery({ 
    queryKey: ["/api/shops"],
  });

  const { data: places = [] } = useQuery({
    queryKey: ["/api/places"],
  });

  const { data: healthTypes = [] } = useQuery({
    queryKey: ["/api/health-types"],
  });

  const { data: familyMembers = [] } = useQuery({ 
    queryKey: ["/api/family-members"],
  });

  const { data: charityTypes = [] } = useQuery({
    queryKey: ["/api/charity-types"],
  });
  //-------------------------------------------------------------------------------------------------------------
  // fim dos HOOKS PARA BUSCAR LISTAS DE ITENS DAS CATEGORIAS

  
  // ESTADOS PARA CONTROLE DE MODAIS DE EXCLUSÃO
  //-------------------------------------------------------------------------------------------------------------
  const [supermarketToDelete, setSupermarketToDelete] = useState<{ id: number; name: string } | null>(null);
  const [fixedTypeToDelete, setFixedTypeToDelete] = useState<{ id: number; name: string } | null>(null);
  const [restaurantToDelete, setRestaurantToDelete] = useState<{ id: number; name: string } | null>(null);
  const [serviceTypeToDelete, setServiceTypeToDelete] = useState<{ id: number; name: string } | null>(null);
  const [leisureTypeToDelete, setLeisureTypeToDelete] = useState<{ id: number; name: string } | null>(null);
  const [personalCareTypeToDelete, setPersonalCareTypeToDelete] = useState<{ id: number; name: string } | null>(null);
  const [shopToDelete, setShopToDelete] = useState<{ id: number; name: string } | null>(null);
  const [placeToDelete, setPlaceToDelete] = useState<{ id: number; name: string } | null>(null);
  const [healthTypeToDelete, setHealthTypeToDelete] = useState<{ id: number; name: string } | null>(null);
  const [familyMemberToDelete, setFamilyMemberToDelete] = useState<{ id: number; name: string } | null>(null);
  const [charityTypeToDelete, setCharityTypeToDelete] = useState<{ id: number; name: string } | null>(null);
  //-------------------------------------------------------------------------------------------------------------
  // fim dos ESTADOS PARA CONTROLE DE MODAIS DE EXCLUSÃO


  // Hook para formulário de criação de grupo ocasional  
  const form = useForm<OccasionalGroupFormData>({
    resolver: zodResolver(occasionalGroupSchema),
    defaultValues: {
      name: "",
      description: "", 
      iconName: "",
    },
  });


  // MUTAÇÕES DE CRIAÇÃO E ATUALIZAÇÃO
  //-------------------------------------------------------------------------------------------------------------
  // CREATE GROUP MUTATION: Criação de grupo ocasional
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

  // TOGGLE GROUP STATUS MUTATION: Alteração de status do grupo ocasional
  const toggleGroupStatusMutation = useMutation({
    mutationFn: async ({ id, status, }: { id: number; status: "open" | "closed"; }) => {
      return await apiRequest("PATCH", `/api/occasional-groups/${id}/status`, { status, });
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
  //-------------------------------------------------------------------------------------------------------------
  // fim das MUTAÇÕES DE CRIAÇÃO E ATUALIZAÇÃO

  
  // MUTAÇÕES DE EXCLUSÃO
  //------------------------------------------------------------------------------------------------------------
  // Mutação de exclusão para grupos ocasionais
  const deleteOccasionalGroupMutation = useMutation({
    mutationFn: async (id: number) => { return await apiRequest("DELETE", `/api/occasional-groups/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/occasional-groups"] });
      toast({ title: "Success", description: "Occasional group deleted successfully!", });
      setGroupToDelete(null);
    },
    onError: (error: any) => {
      console.error("Error details:", error);
      toast({ title: "Error", description: error.message || "Failed to delete occasional group. Please try again.", variant: "destructive", });
      setGroupToDelete(null);
    },
  });
  
  // Mutação de exclusão para tipos de despesas fixas
  const deleteFixedExpenseTypeMutation = useMutation({
    mutationFn: async (id: number) => { return await apiRequest("DELETE", `/api/fixed-expense-types/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fixed-expense-types"] });
      toast({ title: "Success", description: "Fixed expense type deleted successfully!", });
      setFixedTypeToDelete(null);
    },
    onError: (error: any) => {
      console.error("Error details:", error);
      toast({ title: "Error", description: error.message || "Failed to delete fixed expense type. Please try again.", variant: "destructive", });
      setFixedTypeToDelete(null);
    },
  });

  // Mutação de exclusão para supermercados
  const deleteSupermarketMutation = useMutation({
    mutationFn: async (id: number) => { return await apiRequest("DELETE", `/api/supermarkets/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supermarkets"] });
      toast({ title: "Success", description: "Supermarket deleted successfully!", });
      setSupermarketToDelete(null);
    },
    onError: (error: any) => {
      console.error("Error details:", error);
      toast({ title: "Error", description: error.message || "Failed to delete supermarket. Please try again.", variant: "destructive", });
      setSupermarketToDelete(null);
    },
  });

  // Mutação de exclusão para restaurantes
  const deleteRestaurantMutation = useMutation({
    mutationFn: async (id: number) => { return await apiRequest("DELETE", `/api/restaurants/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      toast({ title: "Success", description: "Restaurant deleted successfully!", });
      setRestaurantToDelete(null);
    },
    onError: (error: any) => {
      console.error("Error details:", error);
      toast({ title: "Error", description: error.message || "Failed to delete restaurant. Please try again.", variant: "destructive", });
      setRestaurantToDelete(null);
    },
  });

  // Mutação de exclusão para tipos de serviços
  const deleteServiceTypeMutation = useMutation({ 
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/service-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-types"] });
      toast({
        title: "Success",
        description: "Service type deleted successfully!",
      });
      setServiceTypeToDelete(null);
    },
    onError: (error: any) => {
      console.error("Error details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete service type. Please try again.",
        variant: "destructive",
      });
      setServiceTypeToDelete(null);
    },
  });

  // Mutação de exclusão para tipos de lazer
  const deleteLeisureTypeMutation = useMutation({ 
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/leisure-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leisure-types"] });
      toast({
        title: "Success",
        description: "Leisure type deleted successfully!",
      });
      setLeisureTypeToDelete(null);
    },
    onError: (error: any) => {
      console.error("Error details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete leisure type. Please try again.",
        variant: "destructive",
      });
      setLeisureTypeToDelete(null);
    },
  });

  // Mutação de exclusão para tipos de cuidados pessoais  
  const deletePersonalCareTypeMutation = useMutation({ 
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/personal-care-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal-care-types"] });
      toast({
        title: "Success",
        description: "Personal care type deleted successfully!",
      });
      setPersonalCareTypeToDelete(null);
    },
    onError: (error: any) => {
      console.error("Error details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete personal care type. Please try again.",
        variant: "destructive",
      });
      setPersonalCareTypeToDelete(null);
    },
  });

  // Mutação de exclusão para lojas  
  const deleteShopMutation = useMutation({ 
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/shops/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shops"] });
      toast({
        title: "Success",
        description: "Shop deleted successfully!",
      });
      setShopToDelete(null);
    },
    onError: (error: any) => {
      console.error("Error details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete shop. Please try again.",
        variant: "destructive",
      });
      setShopToDelete(null);
    },
  });

  // Mutação de exclusão para lugares
  const deletePlaceMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/places/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/places"] });
      toast({
        title: "Success",
        description: "Place deleted successfully!",
      });
      setPlaceToDelete(null);
    },
    onError: (error: any) => {
      console.error("Error details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete place. Please try again.",
        variant: "destructive",
      });
      setPlaceToDelete(null);
    },
  });

  // Mutação de exclusão para tipos de saúde
  const deleteHealthTypeMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/health-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-types"] });
      toast({
        title: "Success",
        description: "Health type deleted successfully!",
      });
      setHealthTypeToDelete(null);
    },
    onError: (error: any) => {
      console.error("Error details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete health type. Please try again.",
        variant: "destructive",
      });
      setHealthTypeToDelete(null);
    },
  });

  // Mutação de exclusão para membros da família
  const deleteFamilyMemberMutation = useMutation({ 
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/family-members/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family-members"] });
      toast({
        title: "Success",
        description: "Family member deleted successfully!",
      });
      setFamilyMemberToDelete(null);
    },
    onError: (error: any) => {
      console.error("Error details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete family member. Please try again.",
        variant: "destructive",
      });
      setFamilyMemberToDelete(null);
    },
  });

  // Mutação de exclusão para tipos de caridade
  const deleteCharityTypeMutation = useMutation({ 
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/charity-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/charity-types"] });
      toast({
        title: "Success",
        description: "Charity type deleted successfully!",
      });
      setCharityTypeToDelete(null);
    },
    onError: (error: any) => {
      console.error("Error details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete charity type. Please try again.",
        variant: "destructive",
      });
      setCharityTypeToDelete(null);
    },
  });
  //------------------------------------------------------------------------------------------------------------
  // fim das MUTAÇÕES DE EXCLUSÃO

  
  // FUNÇÕES DE MANUSEIO
  //-------------------------------------------------------------------------------------------------------------
  // CREATE GROUP: Criação de grupo ocasional
  const onSubmit = (data: OccasionalGroupFormData) => { 
    createGroupMutation.mutate(data); 
  };

  // DELETE OCCASIONAL GROUP: Exclusão de grupo ocasional
  const handleDeleteOccasionalGroup = (group: { id: number; name: string }) => {
    setGroupToDelete(group);
  };
  
  // TOGGLE GROUP STATUS: Alteração de status do grupo ocasional
  const toggleGroupStatus = (group: any) => { const newStatus = group.status === "open" ? "closed" : "open"; toggleGroupStatusMutation.mutate({ id: group.id, status: newStatus }); };

  // Para as subcategorias de despesas rotineiras

  // DELETE FIXED TYPE: Exclusão de tipo de despesa fixa
  const handleDeleteFixedType = (fixedType: { id: number; name: string }) => { 
    setFixedTypeToDelete(fixedType); 
  };

  // DELETE SUPERMARKET: Exclusão de supermercado
  const handleDeleteSupermarket = (supermarket: { id: number; name: string }) => { 
    setSupermarketToDelete(supermarket); 
  };

  // DELETE RESTAURANT: Exclusão de restaurante
  const handleDeleteRestaurant = (restaurant: { id: number; name: string }) => { 
    setRestaurantToDelete(restaurant); 
  };

  // DELETE SERVICE TYPE: Exclusão de tipo de serviço
  const handleDeleteServiceType = (serviceType: { id: number; name: string }) => { 
    setServiceTypeToDelete(serviceType); 
  };

  // DELETE LEISURE TYPE: Exclusão de tipo de lazer
  const handleDeleteLeisureType = (leisureType: { id: number; name: string }) => { 
    setLeisureTypeToDelete(leisureType); 
  };

  // DELETE PERSONAL CARE TYPE: Exclusão de tipo de cuidado pessoal
  const handleDeletePersonalCareType = (personalCareType: { id: number; name: string }) => {
    setPersonalCareTypeToDelete(personalCareType); 
  };

  // DELETE SHOP: Exclusão de loja
  const handleDeleteShop = (shop: { id: number; name: string }) => { 
    setShopToDelete(shop); 
  };

  // DELETE PLACE: Exclusão de lugar
  const handleDeletePlace = (place: { id: number; name: string }) => {
    setPlaceToDelete(place);
  };

  // DELETE HEALTH TYPE: Exclusão de tipo de saúde
  const handleDeleteHealthType = (healthType: { id: number; name: string }) => { 
    setHealthTypeToDelete(healthType);
  };

  // DELETE FAMILY MEMBER: Exclusão de membro da família
  const handleDeleteFamilyMember = (familyMember: { id: number; name: string }) => { 
    setFamilyMemberToDelete(familyMember);
  };

  // DELETE CHARITY TYPE: Exclusão de tipo de caridade
  const handleDeleteCharityType = (charityType: { id: number; name: string }) => {
    setCharityTypeToDelete(charityType);
  };
  //------------------------------------------------------------------------------------------------------------
  // fim das FUNÇÕES DE MANUSEIO
  

  // ROUTINE CATEGORIES: Categorias de despesas rotineiras
  const routineCategories = [
    { name: "Fixos", icon: DollarSign, list: fixedExpenseTypes }, 
    { name: "Supermercado", icon: ShoppingCart, list: supermarkets },
    { name: "Alimentação", icon: Utensils, list: restaurants },
    { name: "Serviços", icon: Home, count: 0 },
    { name: "Lazer", icon: Gamepad2, count: 0 },
    { name: "Cuidado Pessoal", icon: Scissors, count: 0 },
    { name: "Compras", icon: Tags, count: 0 },
    { name: "Transporte", icon: Car, count: 0 },
    { name: "Saúde", icon: Heart, count: 0 },
    { name: "Família", icon: Users, count: 0 },
    { name: "Caridade", icon: Gift, count: 0 },
  ];

  // RENDERIZAÇÃO DA PÁGINA
  return (
    <div className="p-8">

      {/* Título e Botão de Adicionar Grupo */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Gerenciar categorias</h2>  
          <p className="text-text-secondary mt-1">Gerencie categorias de gastos de rotina e grupos de gastos ocasionais</p>
        </div>
        <Dialog open={addGroupModalOpen} onOpenChange={setAddGroupModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-secondary hover:bg-green-700 text-white px-6 py-3 font-medium shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Criar grupo de gastos ocasionais</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do grupo</FormLabel>
                    <FormControl><Input placeholder="ex: Show do Iron Maiden 2024, ..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {/* NOVO CAMPO: Descrição do grupo */}
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl><Textarea placeholder="ex: Viagem de 1 semana para..." rows={2} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {/* NOVO CAMPO: Seleção de ícone */}
                <FormField control={form.control} name="iconName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ícone do Grupo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecione um ícone" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.keys(LucideIcons).filter(name => name[0] === name[0].toUpperCase() && name !== 'default').map(iconName => { // Lista todos os ícones Lucide React
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
                    <FormMessage />
                  </FormItem>
                )} />

                
                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => setAddGroupModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createGroupMutation.isPending}>
                    {createGroupMutation.isPending ? "Criando..." : "Criar Grupo"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      {/* Fim do Título e Botão de Adicionar Grupo */}

      {/* Seções de Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Categorias de Rotina */}
        <Card>
          <CardHeader>
            <CardTitle>Categorias de Rotina</CardTitle>
            <p className="text-sm text-text-secondary">Gerenciar seus tipos de despesas recorrentes</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {routineCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <p className="font-medium text-text-primary">{category.name}</p>
                      {category.list && category.list.length > 0 ? (
                        <div className="text-sm text-text-secondary space-y-1 mt-1">
                          {category.list.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between text-xs py-0.5 ml-2">
                              <span>{item.name}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  if (category.name === "Fixos") handleDeleteFixedType(item);
                                  else if (category.name === "Supermercado") handleDeleteSupermarket(item);
                                  else if (category.name === "Alimentação") handleDeleteRestaurant(item);
                                  else if (category.name === "Services") handleDeleteServiceType(item);
                                  else if (category.name === "Leisure") handleDeleteLeisureType(item);
                                  else if (category.name === "Personal Care") handleDeletePersonalCareType(item);
                                  else if (category.name === "Shopping") handleDeleteShop(item);
                                  else if (category.name === "Transportation") handleDeletePlace(item);
                                  else if (category.name === "Health") handleDeleteHealthType(item);
                                  else if (category.name === "Family") handleDeleteFamilyMember(item);
                                  else if (category.name === "Charity") handleDeleteCharityType(item);
                                }}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (category.list && category.list.length === 0) ? (
                        <p className="text-sm text-text-secondary mt-1">No {category.name.toLowerCase()} added.</p>
                      ) : (
                        <p className="text-sm text-text-secondary mt-1">
                          {category.count} {category.count === 1 ? 'item' : 'items'} configured
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm"><Edit className="h-4 w-4 text-primary" /></Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
        {/* Fim das Categorias de Rotina */}

        {/* Grupos Ocasionais */}
        <Card>
          <CardHeader>
            <CardTitle>Grupos Ocasionais</CardTitle>
            <p className="text-sm text-text-secondary">Gerenciar grupos de gastos ocasionais</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {groupsLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
                <p className="text-text-secondary">Nenhum grupo ocasional ainda</p>
                <p className="text-sm text-text-secondary">Crie seu primeiro grupo para começar</p>
              </div>
            ) : (
              occasionalGroups?.map((group: any) => (
                <div key={group.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-accent mr-3" />
                    <div>
                      <p className="font-medium text-text-primary">{group.name}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={group.status === "open" ? "default" : "secondary"} className="text-xs">
                          {group.status === "open" ? "Open" : "Closed"}
                        </Badge>
                        <span className="text-sm text-text-secondary">Criado {new Date(group.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => toggleGroupStatus(group)} disabled={toggleGroupStatusMutation.isPending}>
                      {group.status === "open" ? (<Lock className="h-4 w-4 text-accent" />) : (<Unlock className="h-4 w-4 text-secondary" />)}
                    </Button>
                    <Button variant="ghost" size="sm"><Edit className="h-4 w-4 text-primary" /></Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        {/* Fim dos Grupos Ocasionais */}
        
      </div>
      {/* Fim das Seções de Categorias */}

      
      {/* AlertDialogs de Confirmação de Exclusão */}

      {/*  Início do AlertDialog para grupos ocasionais */}
      <AlertDialog
        open={!!groupToDelete} // Usa o novo estado
        onOpenChange={(open) => !open && setGroupToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não poderá ser desfeita. Isso vai deletar{" "}
              <span className="font-semibold text-primary">{groupToDelete?.name}</span>{" "}
              permanentemente da sua lista de grupos ocasionais.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteOccasionalGroupMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (groupToDelete) {
                  deleteOccasionalGroupMutation.mutate(groupToDelete.id);
                }
              }}
              disabled={deleteOccasionalGroupMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteOccasionalGroupMutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/*  Início do AlertDialog para grupos ocasionais */}
      
      {/*  Início do AlertDialog para tipos de despesas fixas */}
      <AlertDialog 
        open={!!fixedTypeToDelete}
        onOpenChange={(open) => !open && setFixedTypeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não poderá ser desfeita. Isso vai deletar{" "}
              <span className="font-semibold text-primary">{fixedTypeToDelete?.name}</span>{" "} permanentemente da sua lista de tipos de gastos fixos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteFixedExpenseTypeMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (fixedTypeToDelete) { deleteFixedExpenseTypeMutation.mutate(fixedTypeToDelete.id); }}}
              disabled={deleteFixedExpenseTypeMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteFixedExpenseTypeMutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> 
      {/*  Fim do AlertDialog para tipos de despesas fixas */}

      {/*  Início do AlertDialog para supermercados */}
      <AlertDialog
        open={!!supermarketToDelete}
        onOpenChange={(open) => !open && setSupermarketToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não poderá ser desfeita. Isso vai deletar{" "}
              <span className="font-semibold text-primary">{supermarketToDelete?.name}</span>{" "} permanentemente da sua lista de supermercados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSupermarketMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (supermarketToDelete) { deleteSupermarketMutation.mutate(supermarketToDelete.id); }}}
              disabled={deleteSupermarketMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteSupermarketMutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/*  Fim do AlertDialog para supermercados */}

      {/*  Início do AlertDialog para restaurantes */}
      <AlertDialog
        open={!!restaurantToDelete}
        onOpenChange={(open) => !open && setRestaurantToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não poderá ser desfeita. Isso vai deletar{" "}
              <span className="font-semibold text-primary">{restaurantToDelete?.name}</span>{" "} permanentemente da sua lista de restaurantes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteRestaurantMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (restaurantToDelete) { deleteRestaurantMutation.mutate(restaurantToDelete.id); }}}
              disabled={deleteRestaurantMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteRestaurantMutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/*  Fim do AlertDialog para restaurantes */}

      {/*  Início do AlertDialog para tipos de serviço */}
      <AlertDialog
        open={!!serviceTypeToDelete}
        onOpenChange={(open) => !open && setServiceTypeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não poderá ser desfeita. Isso vai deletar{" "}
              <span className="font-semibold text-primary">{serviceTypeToDelete?.name}</span>{" "}
              permanentemente da sua lista de tipos de serviço.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteServiceTypeMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (serviceTypeToDelete) {
                  deleteServiceTypeMutation.mutate(serviceTypeToDelete.id);
                }
              }}
              disabled={deleteServiceTypeMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteServiceTypeMutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/*  Fim do AlertDialog para tipos de serviços */}

      {/*  Início do AlertDialog para tipos de lazer */}
      <AlertDialog
        open={!!leisureTypeToDelete}
        onOpenChange={(open) => !open && setLeisureTypeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não poderá ser desfeita. Isso vai deletar{" "}
              <span className="font-semibold text-primary">{leisureTypeToDelete?.name}</span>{" "}
              permanentemente da sua lista de tipos de lazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLeisureTypeMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (leisureTypeToDelete) {
                  deleteLeisureTypeMutation.mutate(leisureTypeToDelete.id);
                }
              }}
              disabled={deleteLeisureTypeMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteLeisureTypeMutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/*  Fim do AlertDialog para tipos de lazer */}

      {/*  Início do AlertDialog para tipos de cuidado pessoal */}
      <AlertDialog
        open={!!personalCareTypeToDelete}
        onOpenChange={(open) => !open && setPersonalCareTypeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não poderá ser desfeita. Isso vai deletar{" "}
              <span className="font-semibold text-primary">{personalCareTypeToDelete?.name}</span>{" "}
              permanentemente da sua lista de tipos de cuidado pessoal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePersonalCareTypeMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (personalCareTypeToDelete) {
                  deletePersonalCareTypeMutation.mutate(personalCareTypeToDelete.id);
                }
              }}
              disabled={deletePersonalCareTypeMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deletePersonalCareTypeMutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/*  Fim do AlertDialog para tipos de cuidado pessoal */}

      {/*  Início do AlertDialog para lojas */}
      <AlertDialog
        open={!!shopToDelete}
        onOpenChange={(open) => !open && setShopToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não poderá ser desfeita. Isso vai deletar{" "}
              <span className="font-semibold text-primary">{shopToDelete?.name}</span>{" "}
              permanentemente da sua lista de lojas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteShopMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (shopToDelete) {
                  deleteShopMutation.mutate(shopToDelete.id);
                }
              }}
              disabled={deleteShopMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteShopMutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/*  Fim do AlertDialog para lojas */}

      {/*  Início do AlertDialog para transporte */}
      <AlertDialog
        open={!!placeToDelete}
        onOpenChange={(open) => !open && setPlaceToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não poderá ser desfeita. Isso vai deletar{" "}
              <span className="font-semibold text-primary">{placeToDelete?.name}</span>{" "}
              permanentemente da sua lista de lugares.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePlaceMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (placeToDelete) {
                  deletePlaceMutation.mutate(placeToDelete.id);
                }
              }}
              disabled={deletePlaceMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deletePlaceMutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/*  Fim do AlertDialog para transporte */}

      {/*  Início do AlertDialog para saúde */}
      <AlertDialog
        open={!!healthTypeToDelete}
        onOpenChange={(open) => !open && setHealthTypeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não poderá ser desfeita. Isso vai deletar{" "}
              <span className="font-semibold text-primary">{healthTypeToDelete?.name}</span>{" "}
              permanentemente da sua lista de tipos de demanda de saúde.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteHealthTypeMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (healthTypeToDelete) {
                  deleteHealthTypeMutation.mutate(healthTypeToDelete.id);
                }
              }}
              disabled={deleteHealthTypeMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteHealthTypeMutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/*  Fim do AlertDialog para saúde */}

      {/*  Início do AlertDialog para família */}
      <AlertDialog
        open={!!familyMemberToDelete}
        onOpenChange={(open) => !open && setFamilyMemberToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não poderá ser desfeita. Isso vai deletar{" "}
              <span className="font-semibold text-primary">{familyMemberToDelete?.name}</span>{" "}
              permanentemente da sua lista de membros da família.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteFamilyMemberMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (familyMemberToDelete) {
                  deleteFamilyMemberMutation.mutate(familyMemberToDelete.id);
                }
              }}
              disabled={deleteFamilyMemberMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteFamilyMemberMutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/*  Fim do AlertDialog para família */}

      {/*  Início do AlertDialog para caridade */}
      <AlertDialog
        open={!!charityTypeToDelete}
        onOpenChange={(open) => !open && setCharityTypeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não poderá ser desfeita. Isso vai deletar{" "}
              <span className="font-semibold text-primary">{charityTypeToDelete?.name}</span>{" "}
              permanentemente da sua lista de tipos de caridade.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCharityTypeMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (charityTypeToDelete) {
                  deleteCharityTypeMutation.mutate(charityTypeToDelete.id);
                }
              }}
              disabled={deleteCharityTypeMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteCharityTypeMutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/*  Fim do AlertDialog para caridade */}

    </div>
  );
};