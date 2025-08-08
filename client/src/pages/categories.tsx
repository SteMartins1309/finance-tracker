// src/pages/categories.tsx

import React, { useState, useEffect, useMemo } from "react";
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
  DialogDescription,
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
import { Input } from "@/components/ui/input"; // CORREÇÃO: Assegurar que esta linha está limpa e correta
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as LucideIcons from "lucide-react"; // Importa TODOS os ícones
import { // Mantenha importações individuais para ícones usados diretamente no JSX, fora de um loop ou mapa
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
  BookOpen,
  Star,
  Eye,
  CalendarIcon
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { CustomVirtualizedSelectContent } from "@/components/ui/VirtualizedSelectContent"; // Seu componente customizado
import ViewOccasionalGroupExpensesModal from "@/pages/ViewOccasionalGroupExpensesModal";


// TIPO DE DADOS PARA GRUPOS OCASIONAIS
interface OccasionalGroupData {
  id: number;
  name: string;
  status: "open" | "closed";
  createdAt: string;
  description: string | null;
  iconName: string | null;
  openingDate: string; // Virá como string ISO do backend
  closingDate: string | null; // Virá como string ISO ou null
}

// OCCASIONAL GROUP SCHEMA para validação do formulário no frontend
const occasionalGroupSchema = z.object({
  name: z.string().min(1, "O nome do grupo é obrigatório."),
  description: z.string().nullable().optional(), // `nullable()` permite null vindo do backend
  iconName: z.string().nullable().optional(),
  openingDate: z.string().datetime("Data de abertura inválida."), // Zod espera string ISO 8601
  closingDate: z.string().datetime("Data de fechamento inválida.").nullable().optional(), // Zod espera string ISO 8601 ou null
});

type OccasionalGroupFormData = z.infer<typeof occasionalGroupSchema>;

const deleteConfirmationSchema = z.object({
  confirm: z.string().refine((val) => val.toLowerCase() === "delete", {
    message: "Type 'delete' to confirm.",
  }),
});

type DeleteConfirmationFormData = z.infer<typeof deleteConfirmationSchema>;

// GET CATEGORY ICON: Função para obter o ícone da categoria (usa LucideIcons passado por parâmetro ou importado)
// MANTEMOS A IMPORTAÇÃO DE * AS LucideIcons no topo do arquivo.
const getCategoryIcon = (category: string) => {
  const IconComponent = (LucideIcons as any)[category]; // Acessa LucideIcons diretamente
  if (IconComponent && typeof IconComponent === 'function') {
    return React.createElement(IconComponent, { className: "h-4 w-4 text-current" });
  }
  // Fallback para as categorias rotineiras ou ícones padrão
  switch (category) {
    case "fixed": return <DollarSign className="h-4 w-4 text-[#6B4E22]" />;
    case "supermarket": return <ShoppingCart className="h-4 w-4 text-[#C32C04]" />;
    case "food": return <Utensils className="h-4 w-4 text-[#A7521C]" />;
    case "services": return <Home className="h-4 w-4 text-[#1E6F5C]" />;
    case "study": return <BookOpen className="h-4 w-4 text-[#2F528F]" />;
    case "leisure": return <Gamepad2 className="h-4 w-4 text-[#2C754B]" />;
    case "personal-care": return <Scissors className="h-4 w-4 text-[#C33E7D]" />;
    case "shopping": return <Tags className="h-4 w-4 text-[#255F74]" />;
    case "transportation": return <Car className="h-4 w-4 text-[#37474F]" />;
    case "health": return <Heart className="h-4 w-4 text-[#3D60A8]" />;
    case "family": return <Users className="h-4 w-4 text-[#633386]" />;
    case "charity": return <Gift className="h-4 w-4 text-[#781D4B]" />;
    default: return <Tags className="h-4 w-4 text-[#6B7280]" />;
  }
};

// GET CATEGORY ICON COLOR: Função para obter a cor do fundo da categoria
const getCategoryIconColor = (category: string) => {
  switch (category) {
    case "fixed": return "#FFE5A0";
    case "supermarket": return "#FFE0DB";
    case "food": return "#FFD7BB";
    case "services": return "#CDEDE3";
    case "study": return "#D6E4F2";
    case "leisure": return "#D4EDBC";
    case "personal-care": return "#F3D7E1";
    case "shopping": return "#C6DBE1";
    case "transportation": return "#CFD8DC";
    case "health": return "#C9E7F8";
    case "family": return "#E6CFF2";
    case "charity": return "#E8C5D8";
    default: return "#E5E7EB";
  }
};

// Lista de nomes de ícones disponíveis para seleção
// MANTEMOS A LISTA DE LucideIcons AQUI, ela já está correta.
const ALL_LUCIDE_ICONS = Object.keys(LucideIcons).filter(name =>
  name[0] === name[0].toUpperCase() &&
  !['default', 'Icon', 'createReactComponent', 'typeIcon', 'ChevronDown', 'ChevronUp', 'ArrowRight', 'ArrowLeft', 'CalendarIcon', 'Calendar'].includes(name)
);

// NOVO: Função para formatar uma data para a string ISO 8601 "padrão Zod"
// Garante que a data enviada para o backend tem a parte da hora zerada em UTC
const formatToZodDateTime = (date: Date): string => {
  const d = new Date(date);
  // Garante que a data está em UTC e zera as horas, minutos, segundos, milissegundos
  // para que seja "início do dia" em UTC, o que é um formato mais consistente para Zod datetime.
  // toISOString() já garante o formato correto (YYYY-MM-DDTHH:mm:ss.sssZ).
  // Se você realmente quer a data com a hora local zerada, e não UTC, precisaria de toLocalISOString.
  // Mas para datetime do Zod, UTC (final 'Z') costuma ser o mais seguro.
  // Vamos usar toISOString() e confiar que o backend/Zod lida com o fuso horário ao converter para Date.
  return d.toISOString();
};


// CATEGORIES: PÁGINA DE MANUTENÇÃO DAS CATEGORIAS
export default function Categories() {

  const [editingGroup, setEditingGroup] = useState<OccasionalGroupData | null>(null);
  const [addGroupModalOpen, setAddGroupModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<{ id: number; name: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [iconSearchTerm, setIconSearchTerm] = useState('');

  const { data: occasionalGroups = [], isLoading: groupsLoading } = useQuery<OccasionalGroupData[]>({
    queryKey: ["/api/occasional-groups"],
  });

  const openGroups = occasionalGroups.filter(g => g.status === 'open');
  const closedGroups = occasionalGroups.filter(g => g.status === 'closed');

  const [viewingGroupExpenses, setViewingGroupExpenses] = useState<{ id: number; name: string } | null>(null);

  const handleViewGroupExpensesClick = (group: { id: number; name: string }) => {
    setViewingGroupExpenses(group);
  };

  const handleCloseViewGroupExpensesModal = (open: boolean) => {
    if (!open) {
      setViewingGroupExpenses(null);
    }
  };
  
  const { data: fixedExpenseTypes = [] } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/fixed-expense-types"] });
  const { data: supermarkets = [] } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/supermarkets"] });
  const { data: restaurants = [] } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/restaurants"] });
  const { data: serviceTypes = [] } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/service-types"] });
  const { data: studyTypes = [] } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/study-types"] });
  const { data: leisureTypes = [] } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/leisure-types"] });
  const { data: personalCareTypes = [] } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/personal-care-types"] });
  const { data: shops = [] } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/shops"] });
  const { data: places = [] } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/places"] });
  const { data: healthTypes = [] } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/health-types"] });
  const { data: familyMembers = [] } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/family-members"] });
  const { data: charityTypes = [] } = useQuery<Array<{ id: number; name: string; }>>({ queryKey: ["/api/charity-types"] });

  const [supermarketToDelete, setSupermarketToDelete] = useState<{ id: number; name: string } | null>(null);
  const [fixedTypeToDelete, setFixedTypeToDelete] = useState<{ id: number; name: string } | null>(null);
  const [restaurantToDelete, setRestaurantToDelete] = useState<{ id: number; name: string } | null>(null);
  const [serviceTypeToDelete, setServiceTypeToDelete] = useState<{ id: number; name: string } | null>(null);
  const [studyTypeToDelete, setStudyTypeToDelete] = useState<{ id: number; name: string } | null>(null);
  const [leisureTypeToDelete, setLeisureTypeToDelete] = useState<{ id: number; name: string } | null>(null);
  const [personalCareTypeToDelete, setPersonalCareTypeToDelete] = useState<{ id: number; name: string } | null>(null);
  const [shopToDelete, setShopToDelete] = useState<{ id: number; name: string } | null>(null);
  const [placeToDelete, setPlaceToDelete] = useState<{ id: number; name: string } | null>(null);
  const [healthTypeToDelete, setHealthTypeToDelete] = useState<{ id: number; name: string } | null>(null);
  const [familyMemberToDelete, setFamilyMemberToDelete] = useState<{ id: number; name: string } | null>(null);
  const [charityTypeToDelete, setCharityTypeToDelete] = useState<{ id: number; name: string } | null>(null);

  const form = useForm<OccasionalGroupFormData>({
    resolver: zodResolver(occasionalGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      iconName: "",
      // Formato ISO para Zod datetime
      openingDate: formatToZodDateTime(new Date()),
      closingDate: null,
    },
  });

  useEffect(() => {
    if (addGroupModalOpen) {
      form.reset({
        name: editingGroup?.name || "",
        description: editingGroup?.description ?? "",
        iconName: editingGroup?.iconName || "",
        // Ao carregar para edição, se a data existir, usa a data ISO do grupo.
        // Se não existir (novo grupo), usa a data atual formatada.
        openingDate: editingGroup?.openingDate ? editingGroup.openingDate : formatToZodDateTime(new Date()),
        closingDate: editingGroup?.closingDate ? editingGroup.closingDate : null,
      });
      setIconSearchTerm('');
    }
  }, [editingGroup, addGroupModalOpen, form.reset]);


  // FILTRAR ÍCONES COM BASE NO TERMO DE BUSCA
  const filteredLucideIcons = useMemo(() => {
    if (!iconSearchTerm) {
      return ALL_LUCIDE_ICONS;
    }
    const lowerCaseSearchTerm = iconSearchTerm.toLowerCase();
    return ALL_LUCIDE_ICONS.filter(iconName =>
      iconName.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [iconSearchTerm]);


  // MUTATION PARA CRIAR/ATUALIZAR GRUPO OCASIONAL
  const createOrUpdateGroupMutation = useMutation({
    mutationFn: async (data: OccasionalGroupFormData) => {
      const payload = {
        name: data.name,
        description: data.description || null,
        iconName: data.iconName || null,
        openingDate: data.openingDate, // Já é string ISO "segura"
        closingDate: data.closingDate || null, // Já é string ISO "segura" ou null
      };

      if (editingGroup) {
        return await apiRequest("PATCH", `/api/occasional-groups/${editingGroup.id}`, payload);
      } else {
        return await apiRequest("POST", "/api/occasional-groups", payload);
      }
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/occasional-groups"] });
      toast({
        title: "Sucesso",
        description: editingGroup ? "Grupo ocasional atualizado com sucesso!" : "Grupo ocasional criado com sucesso!",
      });
      setAddGroupModalOpen(false);
      setEditingGroup(null);
      form.reset();
    },
    onError: (error) => {
      console.error("Erro ao salvar grupo:", error);
      toast({
        title: "Erro",
        description: (error as Error).message || "Falha ao salvar grupo. Tente novamente.",
        variant: "destructive",
      });
    },
  });


  const toggleGroupStatusMutation = useMutation({
    mutationFn: async ({ id, status, closingDate }: { id: number; status: "open" | "closed"; closingDate?: string | null }) => {
      const updatePayload: { status: string; closingDate?: string | null } = { status };
      if (status === "closed") {
        // Formata para string ISO "segura" ao fechar
        updatePayload.closingDate = closingDate ?? formatToZodDateTime(new Date());
      } else {
        updatePayload.closingDate = null;
      }
      return await apiRequest("PATCH", `/api/occasional-groups/${id}/status`, updatePayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/occasional-groups"] });
      toast({
        title: "Sucesso",
        description: "Status do grupo atualizado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar status do grupo:", error);
      toast({
        title: "Erro",
        description: (error as Error).message || "Falha ao atualizar status do grupo.",
        variant: "destructive",
      });
    },
  });

  const deleteOccasionalGroupMutation = useMutation({
    mutationFn: async (id: number) => { return await apiRequest("DELETE", `/api/occasional-groups/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/occasional-groups"] });
      toast({ title: "Sucesso", description: "Grupo ocasional excluído com sucesso!", });
      setGroupToDelete(null);
    },
    onError: (error: any) => {
      console.error("Detalhes do erro:", error);
      toast({ title: "Erro", description: error.message || "Falha ao excluir o grupo ocasional. Por favor, tente novamente.", variant: "destructive", });
      setGroupToDelete(null);
    },
  });

  const deleteFixedExpenseTypeMutation = useMutation({ mutationFn: async (id: number) => { return await apiRequest("DELETE", `/api/fixed-expense-types/${id}`); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/fixed-expense-types"] }); toast({ title: "Sucesso", description: "Tipo de despesa fixa excluído com sucesso!", }); setFixedTypeToDelete(null); }, onError: (error: any) => { console.error("Detalhes do erro:", error); toast({ title: "Erro", description: error.message || "Falha ao excluir o tipo de despesa fixa. Por favor, tente novamente.", variant: "destructive", }); setFixedTypeToDelete(null); }, });
  const deleteSupermarketMutation = useMutation({ mutationFn: async (id: number) => { return await apiRequest("DELETE", `/api/supermarkets/${id}`); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/supermarkets"] }); toast({ title: "Sucesso", description: "Supermercado excluído com sucesso!", }); setSupermarketToDelete(null); }, onError: (error: any) => { console.error("Detalhes do erro:", error); toast({ title: "Erro", description: error.message || "Falha ao excluir o supermercado. Por favor, tente novamente.", variant: "destructive", }); setSupermarketToDelete(null); }, });
  const deleteRestaurantMutation = useMutation({ mutationFn: async (id: number) => { return await apiRequest("DELETE", `/api/restaurants/${id}`); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] }); toast({ title: "Sucesso", description: "Restaurante excluído com sucesso!", }); setRestaurantToDelete(null); }, onError: (error: any) => { console.error("Detalhes do erro:", error); toast({ title: "Erro", description: error.message || "Falha ao excluir o restaurante. Por favor, tente novamente.", variant: "destructive", }); setRestaurantToDelete(null); }, });
  const deleteServiceTypeMutation = useMutation({ mutationFn: async (id: number) => { return await apiRequest("DELETE", `/api/service-types/${id}`); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/service-types"] }); toast({ title: "Sucesso", description: "Tipo de serviço excluído com sucesso!", }); setServiceTypeToDelete(null); }, onError: (error: any) => { console.error("Detalhes do erro:", error); toast({ title: "Erro", description: error.message || "Falha ao excluir o tipo de serviço. Por favor, tente novamente.", variant: "destructive", }); setServiceTypeToDelete(null); }, });
  const deleteStudyTypeMutation = useMutation({ mutationFn: async (id: number) => { return await apiRequest("DELETE", `/api/study-types/${id}`); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/study-types"] }); toast({ title: "Sucesso", description: "Tipo de estudo excluído com sucesso!", }); setStudyTypeToDelete(null); }, onError: (error: any) => { console.error("Detalhes do erro:", error); toast({ title: "Erro", description: error.message || "Falha ao excluir o tipo de estudo. Por favor, tente novamente.", variant: "destructive", }); setStudyTypeToDelete(null); }, });
  const deleteLeisureTypeMutation = useMutation({ mutationFn: async (id: number) => { return await apiRequest("DELETE", `/api/leisure-types/${id}`); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/leisure-types"] }); toast({ title: "Sucesso", description: "Tipo de lazer excluído com sucesso!", }); setLeisureTypeToDelete(null); }, onError: (error: any) => { console.error("Detalhes do erro:", error); toast({ title: "Erro", description: error.message || "Falha ao excluir o tipo de lazer. Por favor, tente novamente.", variant: "destructive", }); setLeisureTypeToDelete(null); }, });
  const deletePersonalCareTypeMutation = useMutation({ mutationFn: async (id: number) => { return await apiRequest("DELETE", `/api/personal-care-types/${id}`); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/personal-care-types"] }); toast({ title: "Sucesso", description: "Tipo de cuidado pessoal excluído com sucesso!", }); setPersonalCareTypeToDelete(null); }, onError: (error: any) => { console.error("Detalhes do erro:", error); toast({ title: "Erro", description: error.message || "Falha ao excluir o tipo de cuidado personal. Por favor, tente novamente.", variant: "destructive", }); setPersonalCareTypeToDelete(null); }, });
  const deleteShopMutation = useMutation({ mutationFn: async (id: number) => { return await apiRequest("DELETE", `/api/shops/${id}`); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/shops"] }); toast({ title: "Sucesso", description: "Loja excluída com sucesso!", }); setShopToDelete(null); }, onError: (error: any) => { console.error("Detalhes do erro:", error); toast({ title: "Erro", description: error.message || "Falha ao excluir a loja. Por favor, tente novamente.", variant: "destructive", }); setShopToDelete(null); }, });
  const deletePlaceMutation = useMutation({ mutationFn: async (id: number) => { return await apiRequest("DELETE", `/api/places/${id}`); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/places"] }); toast({ title: "Sucesso", description: "Local excluído com sucesso!", }); setPlaceToDelete(null); }, onError: (error: any) => { console.error("Detalhes do erro:", error); toast({ title: "Erro", description: error.message || "Falha ao excluir o local. Por favor, tente novamente.", variant: "destructive", }); setPlaceToDelete(null); }, });
  const deleteHealthTypeMutation = useMutation({ mutationFn: async (id: number) => { return await apiRequest("DELETE", `/api/health-types/${id}`); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/health-types"] }); toast({ title: "Sucesso", description: "Tipo de saúde excluído com sucesso!", }); setHealthTypeToDelete(null); }, onError: (error: any) => { console.error("Detalhes do erro:", error); toast({ title: "Erro", description: error.message || "Falha ao excluir o tipo de saúde. Por favor, tente novamente.", variant: "destructive", }); setHealthTypeToDelete(null); }, });
  const deleteFamilyMemberMutation = useMutation({ mutationFn: async (id: number) => { return await apiRequest("DELETE", `/api/family-members/${id}`); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/family-members"] }); toast({ title: "Sucesso", description: "Membro da família excluído com sucesso!", }); setFamilyMemberToDelete(null); }, onError: (error: any) => { console.error("Detalhes do erro:", error); toast({ title: "Erro", description: error.message || "Falha ao excluir membro da família. Por favor, tente novamente.", variant: "destructive", }); setFamilyMemberToDelete(null); }, });
  const deleteCharityTypeMutation = useMutation({ mutationFn: async (id: number) => { return await apiRequest("DELETE", `/api/charity-types/${id}`); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/charity-types"] }); toast({ title: "Sucesso", description: "Tipo de caridade excluído com sucesso!", }); setCharityTypeToDelete(null); }, onError: (error: any) => { console.error("Detalhes do erro:", error); toast({ title: "Erro", description: error.message || "Falha ao excluir o tipo de caridade. Por favor, tente novamente.", variant: "destructive", }); setCharityTypeToDelete(null); }, });


  // FUNÇÕES DE MANUSEIO
  const onSubmit = (data: OccasionalGroupFormData) => {
    createOrUpdateGroupMutation.mutate(data);
  };

  const handleDeleteOccasionalGroup = (group: { id: number; name: string }) => {
    setGroupToDelete(group);
  };

  const toggleGroupStatus = (group: OccasionalGroupData) => {
    const newStatus = group.status === "open" ? "closed" : "open";
    const closingDateForMutation = newStatus === 'closed'
        ? (form.getValues('closingDate') || formatToZodDateTime(new Date()))
        : null;

    toggleGroupStatusMutation.mutate({ id: group.id, status: newStatus, closingDate: closingDateForMutation });
  };

  const handleEditGroupClick = (group: OccasionalGroupData) => {
    setEditingGroup(group);
    setAddGroupModalOpen(true);
  };

  const handleCloseGroupModal = (open: boolean) => {
    if (!open) {
      setAddGroupModalOpen(false);
      setEditingGroup(null);
      form.reset();
    }
  };


  const handleDeleteFixedType = (fixedType: { id: number; name: string }) => { setFixedTypeToDelete(fixedType); };
  const handleDeleteSupermarket = (supermarket: { id: number; name: string }) => { setSupermarketToDelete(supermarket); };
  const handleDeleteRestaurant = (restaurant: { id: number; name: string }) => { setRestaurantToDelete(restaurant); };
  const handleDeleteServiceType = (serviceType: { id: number; name: string }) => { setServiceTypeToDelete(serviceType); };
  const handleDeleteStudyType = (studyType: { id: number; name: string }) => { setStudyTypeToDelete(studyType); };
  const handleDeleteLeisureType = (leisureType: { id: number; name: string }) => { setLeisureTypeToDelete(leisureType); };
  const handleDeletePersonalCareType = (personalCareType: { id: number; name: string }) => { setPersonalCareTypeToDelete(personalCareType); };
  const handleDeleteShop = (shop: { id: number; name: string }) => { setShopToDelete(shop); };
  const handleDeletePlace = (place: { id: number; name: string }) => { setPlaceToDelete(place); };
  const handleDeleteHealthType = (healthType: { id: number; name: string }) => { setHealthTypeToDelete(healthType); };
  const handleDeleteFamilyMember = (familyMember: { id: number; name: string }) => { setFamilyMemberToDelete(familyMember); };
  const handleDeleteCharityType = (charityType: { id: number; name: string }) => { setCharityTypeToDelete(charityType); };


  interface RoutineCategoryItem {
    id: number;
    name: string;
  }

  interface CategoryConfig {
    name: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    list: RoutineCategoryItem[];
  }

   const routineCategories: CategoryConfig[] = [
    { name: "Fixos", icon: LucideIcons.DollarSign, list: fixedExpenseTypes },
    { name: "Supermercado", icon: LucideIcons.ShoppingCart, list: supermarkets },
    { name: "Alimentação", icon: LucideIcons.Utensils, list: restaurants },
    { name: "Serviços", icon: LucideIcons.Home, list: serviceTypes },
    { name: "Estudos", icon: LucideIcons.BookOpen, list: studyTypes },
    { name: "Lazer", icon: LucideIcons.Gamepad2, list: leisureTypes },
    { name: "Cuidado Pessoal", icon: LucideIcons.Scissors, list: personalCareTypes },
    { name: "Compras", icon: LucideIcons.Tags, list: shops },
    { name: "Transporte", icon: LucideIcons.Car, list: places },
    { name: "Saúde", icon: LucideIcons.Heart, list: healthTypes },
    { name: "Família", icon: LucideIcons.Users, list: familyMembers },
    { name: "Caridade", icon: LucideIcons.Gift, list: charityTypes },
  ];

  return (
    <div className="p-8">

      {/* Título da Página Global (permanece no topo) */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Gerenciar categorias</h2>
          <p className="text-text-secondary mt-1">Gerencie categorias de gastos de rotina e grupos de gastos ocasionais</p>
        </div>
      </div>

      {/* Seções de Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Categorias de Rotina */}
        <Card>
          <CardHeader>
            <CardTitle>Categorias de Rotina</CardTitle>
            <p className="text-sm text-text-secondary">Gerenciar as categorias de gastos de rotina</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Accordion type="multiple" className="w-full">
              {routineCategories.map((category) => {
                const Icon = category.icon;
                const categoryItems = category.list || [];

                return (
                  <AccordionItem value={category.name} key={category.name} className="border-b">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <Icon className="h-5 w-5 text-primary mr-3" />
                        <p className="font-medium text-text-primary">{category.name}</p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {categoryItems.length > 0 ? (
                        <div className="text-sm text-text-secondary space-y-1 py-2 pl-8">
                          {categoryItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-xs py-0.5">
                              <span>{item.name}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  if (category.name === "Fixos") handleDeleteFixedType(item);
                                  else if (category.name === "Supermercado") handleDeleteSupermarket(item);
                                  else if (category.name === "Alimentação") handleDeleteRestaurant(item);
                                  else if (category.name === "Serviços") handleDeleteServiceType(item);
                                  else if (category.name === "Estudos") handleDeleteStudyType(item);
                                  else if (category.name === "Lazer") handleDeleteLeisureType(item);
                                  else if (category.name === "Cuidado Pessoal") handleDeletePersonalCareType(item);
                                  else if (category.name === "Compras") handleDeleteShop(item);
                                  else if (category.name === "Transporte") handleDeletePlace(item);
                                  else if (category.name === "Saúde") handleDeleteHealthType(item);
                                  else if (category.name === "Família") handleDeleteFamilyMember(item);
                                  else if (category.name === "Caridade") handleDeleteCharityType(item);
                                }}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-text-secondary mt-1 py-2 pl-8">Nenhum {category.name.toLowerCase()} adicionado.</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>

        {/* Grupos Ocasionais */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div> {/* NOVO: Adicionar um div para agrupar título e subtítulo */}
              <CardTitle>Grupos Ocasionais</CardTitle>
              {/* SUBTÍTULO ADICIONADO DE VOLTA AQUI */}
              <p className="text-sm text-text-secondary mt-1">Gerenciar grupos de gastos ocasionais</p> {/* Subtítulo adicionado com margem superior */}
            </div>
            <Dialog open={addGroupModalOpen} onOpenChange={handleCloseGroupModal}>
              <DialogTrigger asChild>
                <Button className="bg-secondary hover:bg-green-700 text-white font-medium shadow-lg h-8 px-3 text-sm" 
                        onClick={() => { setEditingGroup(null); setAddGroupModalOpen(true); }}>
                  <Plus className="mr-1 h-4 w-4" /> 
                  Adicionar Grupo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingGroup ? "Editar Grupo Ocasional" : "Criar Grupo de Gastos Ocasionais"}</DialogTitle>
                  <DialogDescription>
                    {editingGroup ? "Edite os detalhes do grupo." : "Insira o nome, descrição, ícone e datas para o novo grupo."}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do grupo</FormLabel>
                        <FormControl><Input placeholder="ex: Show do Iron Maiden 2024, ..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl><Textarea placeholder="ex: Viagem de 1 semana para..." rows={2} {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="iconName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ícone do Grupo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Selecione um ícone" /></SelectTrigger>
                          </FormControl>
                          <CustomVirtualizedSelectContent
                            itemCount={filteredLucideIcons.length}
                            itemSize={36}
                            height={250}
                            availableIcons={filteredLucideIcons}
                            onValueChange={field.onChange}
                            searchTerm={iconSearchTerm}
                            onSearchChange={setIconSearchTerm}
                          />
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* DatePicker para Data de Abertura */}
                    <FormField
                      control={form.control}
                      name="openingDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Abertura</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-[240px] pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(parseISO(field.value), "d MMMM yyyy", { locale: ptBR })
                                  ) : (
                                    <span>Selecione uma data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value ? parseISO(field.value) : undefined}
                                onSelect={(date) => field.onChange(date ? formatToZodDateTime(date) : "")}
                                initialFocus
                                locale={ptBR}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* DatePicker para Data de Fechamento (aparece apenas se o grupo estiver fechado ou se estiver editando) */}
                    {(editingGroup?.status === 'closed' || (editingGroup && editingGroup.closingDate)) && (
                      <FormField
                        control={form.control}
                        name="closingDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Data de Fechamento</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-[240px] pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(parseISO(field.value), "d MMMM yyyy", { locale: ptBR })
                                    ) : (
                                      <span>Selecione uma data (opcional)</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value ? parseISO(field.value) : undefined}
                                  onSelect={(date) => field.onChange(date ? formatToZodDateTime(date) : null)}
                                  initialFocus
                                  locale={ptBR}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="flex justify-end space-x-4 pt-4">
                      <Button type="button" variant="outline" onClick={() => handleCloseGroupModal(false)}>Cancelar</Button>
                      <Button type="submit" disabled={createOrUpdateGroupMutation.isPending}>
                        {createOrUpdateGroupMutation.isPending ? "Salvando..." : (editingGroup ? "Salvar Alterações" : "Criar Grupo")}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
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
              <>
                {/* Acordeão de Grupos Abertos */}
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="open-groups" className="border-b">
                    <AccordionTrigger>
                      <h4 className="text-lg font-semibold text-text-primary">Grupos Abertos ({openGroups.length})</h4>
                    </AccordionTrigger>
                    <AccordionContent className="py-2 pl-4">
                      {openGroups.length > 0 ? (
                        openGroups.map((group: OccasionalGroupData) => {
                          const IconComponent = group.iconName ? (LucideIcons as any)[group.iconName] : Star;
                          return (
                            <div key={group.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-2 last:mb-0">
                              <div className="flex items-center">
                                {IconComponent && <IconComponent className="h-5 w-5 text-accent mr-3" />}
                                <div>
                                  <p className="font-medium text-text-primary">{group.name}</p>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="default" className="text-xs">Aberto</Badge>
                                    <span className="text-sm text-text-secondary">Aberto em {format(new Date(group.openingDate), 'dd/MM/yyyy')}</span>
                                  </div>
                                  {group.description && (
                                    <p className="text-sm text-text-secondary mt-1">{group.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {/* NOVO BOTÃO DE VISUALIZAÇÃO */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewGroupExpensesClick({ id: group.id, name: group.name });
                                  }}
                                >
                                  <Eye className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => toggleGroupStatus(group)} disabled={toggleGroupStatusMutation.isPending}>
                                  <Lock className="h-4 w-4 text-accent" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditGroupClick(group);
                                  }}
                                >
                                  <Edit className="h-4 w-4 text-primary" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleDeleteOccasionalGroup(group)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-text-secondary py-2 pl-8">Nenhum grupo aberto encontrado.</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Acordeão de Grupos Fechados */}
                <Accordion type="multiple" className="w-full mt-4">
                  <AccordionItem value="closed-groups" className="border-b">
                    <AccordionTrigger>
                      <h4 className="text-lg font-semibold text-text-primary">Grupos Fechados ({closedGroups.length})</h4>
                    </AccordionTrigger>
                    <AccordionContent className="py-2 pl-4">
                      {closedGroups.length > 0 ? (
                        closedGroups.map((group: OccasionalGroupData) => {
                          const IconComponent = group.iconName ? (LucideIcons as any)[group.iconName] : Star;
                          return (
                            <div key={group.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-2 last:mb-0">
                              <div className="flex items-center">
                                {IconComponent && <IconComponent className="h-5 w-5 text-accent mr-3" />}
                                <div>
                                  <p className="font-medium text-text-primary">{group.name}</p>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="secondary" className="text-xs">Fechado</Badge>
                                    <span className="text-sm text-text-secondary">
                                      Aberto em {format(new Date(group.openingDate), 'dd/MM/yyyy')}
                                      {group.closingDate && ` • Fechado em ${format(new Date(group.closingDate), 'dd/MM/yyyy')}`}
                                    </span>
                                  </div>
                                  {group.description && (
                                    <p className="text-sm text-text-secondary mt-1">{group.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {/* NOVO BOTÃO DE VISUALIZAÇÃO */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewGroupExpensesClick({ id: group.id, name: group.name });
                                  }}
                                >
                                  <Eye className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => toggleGroupStatus(group)} disabled={toggleGroupStatusMutation.isPending}>
                                  <Unlock className="h-4 w-4 text-secondary" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditGroupClick(group);
                                  }}
                                >
                                  <Edit className="h-4 w-4 text-primary" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleDeleteOccasionalGroup(group)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-text-secondary py-2 pl-8">Nenhum grupo fechado encontrado.</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
            
          </>
            )}
        </CardContent> 
      </Card>
                    
      </div>

      {/* AlertDialogs de Confirmação de Exclusão */}
      <AlertDialog
        open={!!groupToDelete}
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

      <AlertDialog
        open={!!studyTypeToDelete}
        onOpenChange={(open) => !open && setStudyTypeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não poderá ser desfeita. Isso vai deletar{" "}
              <span className="font-semibold text-primary">{studyTypeToDelete?.name}</span>{" "} permanentemente da sua lista de tipos de estudo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteStudyTypeMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (studyTypeToDelete) { deleteStudyTypeMutation.mutate(studyTypeToDelete.id); }}}
              disabled={deleteStudyTypeMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteStudyTypeMutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              permanentemente da sua lista de tipos de cuidado personal.
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

      {/* ... (AlertDialogs de confirmação de exclusão) */}

      {/* NOVO: Renderizar o modal de visualização de gastos */}
      {viewingGroupExpenses && (
        <ViewOccasionalGroupExpensesModal
          open={!!viewingGroupExpenses}
          onOpenChange={handleCloseViewGroupExpensesModal}
          groupId={viewingGroupExpenses.id}
          groupName={viewingGroupExpenses.name}
        />
      )}

    </div>
  );
}