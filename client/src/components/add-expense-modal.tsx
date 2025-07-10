// IMPORTS

import { useState } from "react";
import { useForm } from "react-hook-form"; 
import { zodResolver } from "@hookform/resolvers/zod"; 
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; 
import { z } from "zod"; 
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Star, Plus } from "lucide-react";


// IMPORTS DE MODAIS DE ADIÇÃO DE NOVOS COMPONENTES OU ITENS
//----------------------------------------------------------------------------
// Importa o componente AddOccasionalGroupModal
import { AddOccasionalGroupModal } from "./AddOccasionalGroupModal";

// Importa o componente AddFixedExpenseTypeModal
import { AddFixedExpenseTypeModal } from "./AddFixedExpenseTypeModal";

// Importa o componente AddSupermarketModal
import { AddSupermarketModal } from "./AddSupermarketModal";

// Importa o componente AddRestaurantModal
import { AddRestaurantModal } from "./AddRestaurantModal";

// Importa o componente AddServiceTypeModal
import { AddServiceTypeModal } from "./AddServiceTypeModal";

// Importa o componente AddLeisureTypeModal
import { AddLeisureTypeModal } from "./AddLeisureTypeModal";

// Importa o componente AddPersonalCareTypeModal
import { AddPersonalCareTypeModal } from "./AddPersonalCareTypeModal";

// Importa o componente AddShopModal
import { AddShopModal } from "./AddShopModal";

// Importa o componente AddPlaceModal
import { AddPlaceModal } from "./AddPlaceModal";

// Importa o componente AddHealthTypeModal
import { AddHealthTypeModal } from "./AddHealthTypeModal";

// Importa o componente AddFamilyMemberModal
import { AddFamilyMemberModal } from "./AddFamilyMemberModal";

// Importa o componente AddCharityTypeModal
import { AddCharityTypeModal } from "./AddCharityTypeModal";
//----------------------------------------------------------------------------
// fim dos IMPORTS DE MODAIS DE ADIÇÃO DE NOVOS ITENS



// EXPENSE SCHEMA: Define o esquema de validação para o formulário de adição de despesa
const expenseSchema = z.object({

  // Para todos os tipos de despesas
  
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),  // Valor da despesa
  purchaseDate: z.string().min(1, "Purchase date is required"),  // Data da compra
  paymentMethod: z.enum(["pix", "credit-card", "debit-card", "cash", "bank-transfer"]),  // Método de pagamento
  expenseType: z.enum(["routine", "occasional"]),  // Tipo de despesa (rotina ou ocasional)
  routineCategory: z  // Categoria de despesa rotineira (se for rotina)
    .enum([
      "fixed",
      "supermarket", 
      "food",  
      "services",     
      "leisure",    
      "personal-care",       
      "shopping",  
      "transportation",     
      "health",  
      "family",  
      "charity",
    ])
    .optional(),
  occasionalGroupId: z.string().optional(),  // ID do grupo de despesas ocasionais (se for ocasional)
  createdAt: z.string().optional(),  // Data de criação da despesa


  // Para as subcategorias de despesas rotineiras

  // Para a subcategoria 'fixed'
  fixedExpenseTypeId: z.string().optional(),  // ID do tipo de despesa fixa
  frequency: z.enum(["weekly", "monthly", "semi-annually", "annually"]).optional(),  // Frequência de pagamento

  // Para a subcategoria 'supermarket'
  supermarketId: z.string().optional(),  // ID do supermercado

  // Campos para a subcategoria 'food'
  restaurantId: z.string().optional(),  // ID do restaurante
  occasionType: z.enum(["normal", "special"]).optional(),  // Tipo de ocasião
  specialOccasionDescription: z.string().optional(),  // Descrição da ocasião especial
  foodPurchaseType: z.enum(["in-person", "online"]).optional(),   // Modo de compra

  // Campos para a subcategoria 'service'
  serviceTypeId: z.string().optional(),  // ID do tipo de serviço
  serviceDescription: z.string().optional(),  // Descrição do serviço

  // Campos para a subcategoria 'leisure'
  leisureTypeId: z.string().optional(),  // ID do tipo de lazer
  leisureDescription: z.string().optional(),  // Descrição do lazer

  // Campos para a subcategoria 'personal-care'
  personalCareTypeId: z.string().optional(),  // ID do tipo de cuidado pessoal
  personalCareDescription: z.string().optional(),  // Descrição do cuidado pessoal

  // Campos para a subcategoria 'shopping'
  shopId: z.string().optional(),  // ID da loja
  shoppingPurchaseType: z.enum(["in-person", "online"]).optional(),  // Modo de compra
  shoppingOccasionType: z.enum(["normal", "special"]).optional(),  // Tipo de ocasião
  shoppingSpecialOccasionDescription: z.string().optional(),  // Descrição da ocasião especial

  // Campos para a subcategoria 'transportation'
  startPlaceId: z.string().optional(),  // ID do lugar de partida
  endPlaceId: z.string().optional(),  // ID do lugar de destino
  startingPoint: z.string().optional(),  // Ponto de partida
  destination: z.string().optional(),  // Destino
  transportMode: z.enum(["car", "uber", "public-transport", "walking", "bicycle"]).optional(),  // Modo de transporte
  transportDescription: z.string().optional(),  // Descrição do transporte

  // Campos para a subcategoria 'health'
  healthTypeId: z.string().optional(),  // ID do tipo de demanda de saúde
  healthDescription: z.string().optional(),  // Descrição da demanda de saúde

  // Campos para a subcategoria 'family'
  familyMemberId: z.string().optional(),  // ID do membro da família
  familyDescription: z.string().optional(),  // Descrição da despesa familiar

  // Campos para a subcategoria 'charity'
  charityTypeId: z.string().optional(),  // ID do tipo de caridade
  charityDescription: z.string().optional(),  // Descrição da despesa de caridade

});


// EXPENSE FORM DATA: Define o tipo TypeScript para os dados do formulário de adição de despesa
type ExpenseFormData = z.infer<typeof expenseSchema>;


// ADD EXPENSE MODAL PROPS: Define as propriedades do componente AddExpenseModal
interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


// ADD EXPENSE MODAL: Define o componente AddExpenseModal
export function AddExpenseModal({ open, onOpenChange }: AddExpenseModalProps) {

  
  // HOOKS PARA GERENCIAR O ESTADO DOS MODAIS DE ADIÇÃO DE NOVOS ITENS
  //-------------------------------------------------------------------------------  
  
  // Hook para gerenciar o estado dos modais de adição de novos itens
  const [newItemDialogs, setNewItemDialogs] = useState<{
    [key: string]: boolean;
  }>({});
  // Hook para gerenciar o estado dos toasts
  const { toast } = useToast();
  // Hook para gerenciar o estado do query client
  const queryClient = useQueryClient();
  // Hook para gerenciar o estado do formulário
  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      paymentMethod: "credit-card",
      expenseType: "routine",
    },
  });
  // Hook para monitorar os valores do formulário
  const watchedValues = form.watch();
  // Hook para monitorar o tipo de despesa
  const expenseType = watchedValues.expenseType;
  // Hook para monitorar a categoria de despesa rotineira
  const routineCategory = watchedValues.routineCategory;
  // Hook para buscar dados de grupos de despesas ocasionais
  const { data: occasionalGroups } = useQuery({
    queryKey: ["/api/occasional-groups/open"],
    enabled: expenseType === "occasional",
  });
  //-------------------------------------------------------------------------------
  // fim dos HOOKS PARA GERENCIAR O ESTADO DOS MODAIS DE ADIÇÃO DE NOVOS ITENS

  
  // HOOKS PARA BUSCAR DADOS DE SUBCATEGORIAS ESPECÍFICAS
  //-------------------------------------------------------------------------------
  
  // Hook para buscar dados de tipos de despesas fixas
  const { data: fixedExpenseTypes } = useQuery({
    queryKey: ["/api/fixed-expense-types"],
    enabled: routineCategory === "fixed",
  });
  
  // Hook para buscar dados de supermercados
  const { data: supermarkets } = useQuery({ 
    queryKey: ["/api/supermarkets"],
    enabled: routineCategory === "supermarket",
  });

  // Hook para buscar dados de restaurantes
  const { data: restaurants } = useQuery({
    queryKey: ["/api/restaurants"],
    enabled: routineCategory === "food",
  });

  // Hook para buscar dados de tipos de serviços
  const { data: serviceTypes } = useQuery({
    queryKey: ["/api/service-types"],
    enabled: routineCategory === "services",
  });

  // Hook para buscar dados de tipos de lazer
  const { data: leisureTypes } = useQuery({
    queryKey: ["/api/leisure-types"],
    enabled: routineCategory === "leisure",
  });

  // Hook para buscar dados de tipos de cuidado pessoal
  const { data: personalCareTypes } = useQuery({
    queryKey: ["/api/personal-care-types"],
    enabled: routineCategory === "personal-care",
  });

  // Hook para buscar dados de lojas
  const { data: shops } = useQuery({
    queryKey: ["/api/shops"],
    enabled: routineCategory === "shopping",
  });

  // Hook para buscar dados de lugares
  const { data: places } = useQuery({ 
    queryKey: ["/api/places"],
    enabled: routineCategory === "transportation", 
  });

  // Hook para buscar dados de tipos de saúde
  const { data: healthTypes } = useQuery({
    queryKey: ["/api/health-types"],
    enabled: routineCategory === "health",
  });

  // Hook para buscar dados de membros da família
  const { data: familyMembers } = useQuery({ 
    queryKey: ["/api/family-members"],
    enabled: routineCategory === "family", 
  });

  // Hook para buscar dados de tipos de caridade
  const { data: charityTypes } = useQuery({ 
    queryKey: ["/api/charity-types"],
    enabled: routineCategory === "charity", 
  });
  //-------------------------------------------------------------------------------
  // fim dos HOOKS PARA BUSCAR DADOS DE SUBCATEGORIAS ESPECÍFICAS


  // HOOKS PARA LIDAR COM A ADIÇÃO DE NOVOS COMPONENTES E ITENS
  //-------------------------------------------------------------------------------
  // Hooks para lidar com a adição de novos grupos de despesas ocasionais
  const [addOccasionalGroupModalOpen, setAddOccasionalGroupModalOpen] = useState(false);

  // Hooks para lidar com a adição de novos tipos de despesas fixas
  const [showAddFixedExpenseTypeModal, setShowAddFixedExpenseTypeModal] = useState(false);
  
  // Hooks para lidar com a adição de novos supermercados
  const [showAddSupermarketModal, setShowAddSupermarketModal] = useState(false); 

  // Hooks para lidar com a adição de novos restaurantes
  const [showAddRestaurantModal, setShowAddRestaurantModal] = useState(false); 

  // Hooks para lidar com a adição de novos tipos de serviços
  const [addServiceTypeModalOpen, setAddServiceTypeModalOpen] = useState(false);

  // Hooks para lidar com a adição de novos tipos de lazer
  const [addLeisureTypeModalOpen, setAddLeisureTypeModalOpen] = useState(false);

  // Hooks para lidar com a adição de novos tipos de cuidado pessoal
  const [addPersonalCareTypeModalOpen, setAddPersonalCareTypeModalOpen] = useState(false);

  // Hooks para lidar com a adição de novas lojas
  const [addShopModalOpen, setAddShopModalOpen] = useState(false);

  // Hooks para lidar com a adição de novos lugares
  const [addPlaceModalOpen, setAddPlaceModalOpen] = useState(false);

  // Hooks para lidar com a adição de novos tipos de saúde
  const [addHealthTypeModalOpen, setAddHealthTypeModalOpen] = useState(false);

  // Hooks para lidar com a adição de novos membros da família
  const [addFamilyMemberModalOpen, setAddFamilyMemberModalOpen] = useState(false);

  // Hooks para lidar com a adição de novos tipos de caridade
  const [addCharityTypeModalOpen, setAddCharityTypeModalOpen] = useState(false);
  //-------------------------------------------------------------------------------
  // fim dos HOOKS PARA LIDAR COM A ADIÇÃO DE NOVOS ITENS

  
  // HOOK PARA LIDAR COM A CRIAÇÃO DE NOVAS DESPESAS
  const createExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/expenses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Expense added successfully!",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    },
  });


  // ON SUBMIT: Função para lidar com o envio do formulário
  const onSubmit = (data: ExpenseFormData) => {
    const expenseData = {

      // Para todas as despesas
      amount: data.amount,
      purchaseDate: new Date(data.purchaseDate),
      paymentMethod: data.paymentMethod,
      expenseType: data.expenseType,
      routineCategory:
        data.expenseType === "routine" ? data.routineCategory : null,
      occasionalGroupId:
        data.expenseType === "occasional" && data.occasionalGroupId
          ? parseInt(data.occasionalGroupId)
          : null,

      
      // Para as subcategorias de despesas rotineiras

      // Para a subcategoria 'fixed'
      fixedExpenseTypeId: data.fixedExpenseTypeId ? parseInt(data.fixedExpenseTypeId) : null,
      frequency: data.routineCategory === "fixed" ? (data.frequency || null) : null,

      // Para a subcategoria 'supermarket'
      supermarketId: data.supermarketId ? parseInt(data.supermarketId) : null,

      // Novos campos para a subcategoria 'food'
      restaurantId: data.restaurantId ? parseInt(data.restaurantId) : null,
      occasionType: data.routineCategory === "food" ? (data.occasionType || null) : null, 
      specialOccasionDescription: data.routineCategory === "food" && data.occasionType === "special" ? (data.specialOccasionDescription || null) : null,
      foodPurchaseType: data.routineCategory === "food" ? (data.foodPurchaseType || null) : null, 

      // Novos campos para a subcategoria 'services'
      serviceTypeId: data.serviceTypeId ? parseInt(data.serviceTypeId) : null,
      serviceDescription: data.routineCategory === "services" ? (data.serviceDescription || null) : null,

      // Novos campos para a subcategoria 'leisure'
      leisureTypeId: data.leisureTypeId ? parseInt(data.leisureTypeId) : null,
      leisureDescription: data.routineCategory === "leisure" ? (data.leisureDescription || null) : null,

      // Para a subcategoria 'personal-care'
      personalCareTypeId: data.personalCareTypeId ? parseInt(data.personalCareTypeId) : null,
      personalCareDescription: data.routineCategory === "personal-care" ? (data.personalCareDescription || null) : null,

      // Para a subcategoria 'shopping'
      shopId: data.routineCategory === "shopping" && data.shopId ? parseInt(data.shopId) : null,
      shoppingPurchaseType: data.routineCategory === "shopping" ? (data.shoppingPurchaseType || null) : null,
      shoppingOccasionType: data.routineCategory === "shopping" ? (data.shoppingOccasionType || null) : null,
      shoppingSpecialOccasionDescription: data.routineCategory === "shopping" && data.shoppingOccasionType === "special" ? (data.shoppingSpecialOccasionDescription || null) : null,

      // Para a subcategoria 'transportation'
      startPlaceId: data.routineCategory === "transportation" && data.startPlaceId ? parseInt(data.startPlaceId) : null,
      endPlaceId: data.routineCategory === "transportation" && data.endPlaceId ? parseInt(data.endPlaceId) : null,
      startingPoint: data.routineCategory === "transportation" ? (data.startingPoint || null) : null,
      destination: data.routineCategory === "transportation" ? (data.destination || null) : null,
      transportMode: data.transportMode || null,
      transportDescription: data.routineCategory === "transportation" ? (data.transportDescription || null) : null,

      // Novos campos para a subcategoria 'health'
      healthTypeId: data.healthTypeId ? parseInt(data.healthTypeId) : null,
      healthDescription: data.routineCategory === "health" ? (data.healthDescription || null) : null,

      // Para a subcategoria 'family'
      familyMemberId: data.familyMemberId ? parseInt(data.familyMemberId) : null,
      familyDescription: data.routineCategory === "family" ? (data.familyDescription || null) : null,

      // Para a subcategoria 'charity'
      charityTypeId: data.charityTypeId ? parseInt(data.charityTypeId) : null,
      charityDescription: data.routineCategory === "charity" ? (data.charityDescription || null) : null,

      
    };

    createExpenseMutation.mutate(expenseData);
  };


  // ADD NEW BUTTON: Componente para adicionar novos itens
  const AddNewButton = ({ onClick, label}: {
    onClick: () => void;
    label: string;
  }) => (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className="ml-2 h-9"
    >
      <Plus className="h-4 w-4 mr-1" />
      {label}
    </Button>
  );

  // RENDERIZAÇÃO DO COMPONENTE
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>  {/* Início do modal de adição de despesa*/}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">  
        <DialogHeader>
          <DialogTitle>Adicione nova despesa</DialogTitle>  {/* Título do modal*/}
        </DialogHeader>

        <Form {...form}>  {/* Início do formulário de adição de despesa*/}
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">  
            
            {/*  Início do campo comum: expenseType  */ }
            <FormField 
              control={form.control}
              name="expenseType"
              render={({ field }) => (
                <FormItem> 
                  <FormLabel>Tipo de gasto</FormLabel>  {/* Rótulo do campo*/}
                  <FormControl>  
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="routine" id="routine" />
                        <label
                          htmlFor="routine"  
                          className="flex-1 cursor-pointer"
                        >
                          <div className="text-center">
                            <Calendar className="mx-auto mb-2 h-6 w-6 text-primary" />
                            <p className="font-medium">Gasto de Rotina</p>  {/* Opção de gasto de rotina*/}
                            <p className="text-sm text-muted-foreground">
                              Gastos recorrentes
                            </p>
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="occasional" id="occasional" />
                        <label
                          htmlFor="occasional"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="text-center">
                            <Star className="mx-auto mb-2 h-6 w-6 text-accent" />
                            <p className="font-medium">Gasto de Ocasião</p>  {/* Opção de gasto de ocasião*/}
                            <p className="text-sm text-muted-foreground">
                              Gastos de situações especiais
                            </p>
                          </div>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />  
            {/*  Fim do campo comum: expenseType  */ }

            <div className="grid grid-cols-2 gap-4">
              
              {/* Início do campo comum: purchaseDate */}
              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do gasto</FormLabel>  {/* Rótulo do campo*/}
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Fim do campo comum: purchaseDate */}

              {/* Início do campo comum: amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>  {/* Rótulo do campo*/}
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-8"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Fim do campo comum: amount */}
            </div>

            {/* Início do campo comum: paymentMethod */}
            <FormField  
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de pagamento</FormLabel>  {/* Rótulo do campo*/}
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma de pagamento" />  {/* Placeholder do campo*/}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pix">Pix</SelectItem>
                      <SelectItem value="debit-card">Cartão de Débito</SelectItem>
                      <SelectItem value="credit-card">Cartão de Crédito</SelectItem>                      
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="bank-transfer">Transferência Bancária</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Fim do campo comum: paymentMethod */}

            {/* Renderiza campos específicos para 'routine' */}
            {expenseType === "routine" && (  // 
              <div className="space-y-6">
                
                {/* Início do campo: routineCategory */}
                <FormField 
                  control={form.control}
                  name="routineCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categorias de Gastos de Rotina</FormLabel>  {/* Rótulo do campo*/}
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />  {/* Placeholder do campo*/}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fixed">Fixos</SelectItem>
                          <SelectItem value="supermarket">Supermercado</SelectItem>
                          <SelectItem value="food">Alimentação</SelectItem>
                          <SelectItem value="services">Serviços</SelectItem>
                          <SelectItem value="leisure">Lazer</SelectItem>
                          <SelectItem value="personal-care">Cuidado Pessoal</SelectItem>
                          <SelectItem value="shopping">Compras</SelectItem>
                          <SelectItem value="transportation">Transporte</SelectItem>
                          <SelectItem value="health">Saúde</SelectItem>
                          <SelectItem value="family">Família</SelectItem>
                          <SelectItem value="charity">Caridade</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                /> 
                {/* Fim do campo: routineCategory */}

                {/* Renderizados dependendo da routineCategory */}

                {/*  Início da subcategoria 'fixed'  */}
                {routineCategory === "fixed" && ( 
                  <div className="space-y-4">  
                    <div className="flex items-end space-x-2">
                      {/*  Início do campo específico: fixedExpenseTypeId  */}
                      <FormField
                        control={form.control}
                        name="fixedExpenseTypeId"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Tipo de despesa fixa</FormLabel>  {/* Rótulo do campo*/}
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo de despesa fixa" />  {/* Placeholder do campo*/}
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {fixedExpenseTypes?.map((type: any) => (
                                  <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/*  Fim do campo específico: fixedExpenseTypeId  */}
                      
                      <AddNewButton  // Botão para adicionar novos tipos de despesas fixas
                        onClick={() => setShowAddFixedExpenseTypeModal(true)} 
                        label="Adicionar Novo"
                      />
                    </div>

                    {/*  Início do campo específico: frequency  */}
                    <FormField  
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequência</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a frequência desse gasto" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="weekly">Semanalmente</SelectItem>
                              <SelectItem value="monthly">Mensalmente</SelectItem>
                              <SelectItem value="semi-annually">Semestralmente</SelectItem>
                              <SelectItem value="annually">Anualmente</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/*  Fim do campo específico: frequency  */}
                  </div>
                )}        
                {/*  Fim da subcategoria 'fixed'  */}                
                
                {/*  Início da subcategoria 'supermarket'  */}
                {routineCategory === "supermarket" && ( 
                  <div className="flex items-end space-x-2">

                    {/*  Início do campo específico: supermarketId  */}
                    <FormField 
                      control={form.control}
                      name="supermarketId"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Supermercado</FormLabel>  {/* Rótulo do campo*/}
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o supermercado" />  {/* Placeholder do campo*/}
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {supermarkets?.map((supermarket: any) => (
                                <SelectItem key={supermarket.id} value={supermarket.id.toString()}>
                                  {supermarket.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/*  Fim do campo específico: supermarketId  */}
                    
                    <AddNewButton  // Botão para adicionar novos supermercados
                      onClick={() => setShowAddSupermarketModal(true)}
                      label="Adicionar Novo"
                    />
                  </div>
                )}
                {/*  Fim da subcategoria 'supermarket'  */}

                {/*  Início da subcategoria 'food'  */}      
                {routineCategory === "food" && (
                  <div className="space-y-4">
                    {/* Início do campo específico: restaurantId */}
                    <div className="flex items-end space-x-2">
                      <FormField control={form.control} name="restaurantId" render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Restaurante</FormLabel>  {/* Rótulo do campo*/}
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o restaurante" />  {/* Placeholder do campo*/}
                              </SelectTrigger>
                            </FormControl>  
                            <SelectContent>
                              {restaurants?.map((restaurant: any) => (<SelectItem key={restaurant.id} value={restaurant.id.toString()}>{restaurant.name}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      {/* Fim do campo específico: restaurantId */}
                      
                      <AddNewButton  // Botão para adicionar novos restaurantes
                        onClick={() => setShowAddRestaurantModal(true)} 
                        label="Adicionar Novo" />
                    </div>
                    
                    {/* Início do campo específico: foodPurchaseType */}
                    <FormField control={form.control} name="foodPurchaseType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forma de Pedido</FormLabel>  {/* Rótulo do campo*/}
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="in-person" id="food-in-person" /><label htmlFor="food-in-person">No local</label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="online" id="food-online" /><label htmlFor="food-online">À distância</label></div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    {/* Fim do campo específico: foodPurchaseType */}

                    {/* Início do campo específico: occasionType */}
                    <FormField control={form.control} name="occasionType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ocasião</FormLabel>  {/* Rótulo do campo*/}
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="normal" id="occasion-normal" /><label htmlFor="occasion-normal">Normal</label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="special" id="occasion-special" /><label htmlFor="occasion-special">Especial</label></div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    {watchedValues.occasionType === "special" && (
                      <FormField control={form.control} name="specialOccasionDescription" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição da Ocasião Especial</FormLabel>  {/* Rótulo do campo*/}
                          <FormControl><Textarea placeholder="ex: aniversário de alguém, celebração de algo..." rows={2} {...field} /></FormControl>  {/* Placeholder do campo*/}
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                    {/* Fim do campo específico: occasionType */}
                  </div>
                )}
                {/* Fim da subcategoria 'food' */}

                {/* Início da subcategoria 'services' */}
                {routineCategory === "services" && (
                  <div className="space-y-4">
                    <div className="flex items-end space-x-2">

                      {/* Início do campo específico: serviceTypeId */}
                      <FormField 
                        control={form.control}
                        name="serviceTypeId"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Tipo de Serviço</FormLabel>  {/* Rótulo do campo*/}
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo de serviço" />  {/* Placeholder do campo */}
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {serviceTypes?.map((type: any) => (
                                  <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Fim do campo específico: serviceTypeId */}
                      
                      <AddNewButton  // Botão para adicionar novos tipos de serviços
                        onClick={() => setAddServiceTypeModalOpen(true)}
                        label="Adicionar Novo"
                      />
                    </div>

                    {/* Início do campo específico: serviceDescription */}
                    <FormField 
                      control={form.control}
                      name="serviceDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição do Serviço</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva o serviço (ex: Troca de óleo, Limpeza de casa)..."
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Fim do campo específico: serviceDescription */}
                  </div>
                )}
                {/* Fim da subcategoria 'services' */}

                {/* Início da subcategoria 'leisure' */}
                {routineCategory === "leisure" && ( 
                  <div className="space-y-4">
                    <div className="flex items-end space-x-2">

                      {/* Início do campo específico: leisureTypeId */}
                      <FormField 
                        control={form.control}
                        name="leisureTypeId"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Tipo de Lazer</FormLabel>  {/* Rótulo do campo*/}
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo de lazer" />  {/* Placeholder do campo*/}
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {leisureTypes?.map((type: any) => (
                                  <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Fim do campo específico: leisureTypeId */}
                      
                      <AddNewButton  // Botão para adicionar novos tipos de lazer
                        onClick={() => setAddLeisureTypeModalOpen(true)}
                        label="Adicionar Novo"
                      />
                    </div>

                    {/* Início do campo específico: leisureDescription */}
                    <FormField 
                      control={form.control}
                      name="leisureDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição do Lazer</FormLabel>  {/* Rótulo do campo*/}
                          <FormControl>
                            <Textarea
                              placeholder="Descreva a atividade de lazer (ex: Cinema, Jantar fora)..."  /* Placeholder do campo*/
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Fim do campo específico: leisureDescription */}
                  </div>
                )}
                {/* Fim da subcategoria 'leisure' */}

                {/* Início da subcategoria 'personal-care' */}
                {routineCategory === "personal-care" && ( 
                  <div className="space-y-4">
                    <div className="flex items-end space-x-2">

                      {/* Início do campo específico: personalCareTypeId */}
                      <FormField  
                        control={form.control}
                        name="personalCareTypeId"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Tipo de Cuidado Pessoal</FormLabel>  {/* Rótulo do campo*/}
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo de cuidado pessoal" />  {/* Placeholder do campo*/}
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {personalCareTypes?.map((type: any) => (
                                  <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Fim do campo específico: personalCareTypeId */}
                      
                      <AddNewButton  // Botão para adicionar novos tipos de cuidado pessoal
                        onClick={() => setAddPersonalCareTypeModalOpen(true)}
                        label="Adicionar Novo"
                      />
                    </div>

                    {/* Início do campo específico: personalCareDescription */}
                    <FormField  
                      control={form.control}
                      name="personalCareDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição do Cuidado Pessoal</FormLabel>  {/* Rótulo do campo*/}
                          <FormControl>
                            <Textarea
                              placeholder="Descreva o gasto (ex: Salão de beleza, Consulta com dermatologista)..."  /* Placeholder do campo*/
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Fim do campo específico: personalCareDescription */}
                  </div>
                )}
                {/* Fim da subcategoria 'personal-care' */}

                {/* Início da subcategoria 'shopping' */}
                {routineCategory === "shopping" && ( 
                  <div className="space-y-4">
                    <div className="flex items-end space-x-2">
                      {/* Início do campo específico: shopId */}
                      <FormField 
                        control={form.control}
                        name="shopId"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Loja</FormLabel>  {/* Rótulo do campo*/}
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a loja" />  {/* Placeholder do campo*/}
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {shops?.map((shop: any) => ( 
                                  <SelectItem key={shop.id} value={shop.id.toString()}>
                                    {shop.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Fim do campo específico: shopId */}
                      
                      <AddNewButton  // Botão para adicionar novas lojas
                        onClick={() => setAddShopModalOpen(true)}
                        label="Adicionar Nova"
                      />
                    </div>

                    {/* Início do campo específico: shoppingPurchaseType */}
                    <FormField
                      control={form.control}
                      name="shoppingPurchaseType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Compra</FormLabel>  {/* Rótulo do campo*/}
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="in-person" id="shopping-in-person" />
                                <label htmlFor="shopping-in-person">Presencial</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="online" id="shopping-online" />
                                <label htmlFor="shopping-online">Online</label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Fim do campo específico: shoppingPurchaseType */}

                    {/* Início do campo específico: shoppingOccasionType */}
                    <FormField
                      control={form.control}
                      name="shoppingOccasionType" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ocasião da Compra</FormLabel>  {/* Rótulo do campo*/}
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="normal" id="shopping-occasion-normal" />
                                <label htmlFor="shopping-occasion-normal">Normal</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="special" id="shopping-occasion-special" />
                                <label htmlFor="shopping-occasion-special">Especial</label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {watchedValues.shoppingOccasionType === "special" && ( // Condicional para descrição
                      <FormField
                        control={form.control}
                        name="shoppingSpecialOccasionDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição da Ocasião Especial</FormLabel>  {/* Rótulo do campo*/}
                            <FormControl>
                              <Textarea
                                placeholder="Descreva a ocasião especial da compra..."  /* Placeholder do campo*/
                                rows={2}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {/* Fim do campo específico: shoppingOccasionType */}
                  </div>
                )}
                {/* Fim da subcategoria 'shopping' */}

                {/* Início da subcategoria 'transportation' */}
                {routineCategory === "transportation" && ( 
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-end space-x-2">

                        {/* Início do campo específico: startPlaceId */}
                        <FormField
                          control={form.control}
                          name="startPlaceId"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Ponto de Partida</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o ponto de partida" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {places?.map((place: any) => (
                                    <SelectItem key={place.id} value={place.id.toString()}>
                                      {place.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {/* Fim do campo específico: startPlaceId */}
                        
                        <AddNewButton onClick={() => setAddPlaceModalOpen(true)} label="Adicionar Novo" />
                      </div>

                      <div className="flex items-end space-x-2">

                        {/* Início do campo específico: endPlaceId */}
                        <FormField
                          control={form.control}
                          name="endPlaceId"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Ponto de Destino</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o ponto de destino" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {places?.map((place: any) => (
                                    <SelectItem key={place.id} value={place.id.toString()}>
                                      {place.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {/* Fim do campo específico: endPlaceId */}
                        
                        <AddNewButton onClick={() => setAddPlaceModalOpen(true)} label="Adicionar Novo" />
                      </div>
                    </div>

                    {/* Início do campo específico: transportMode */}
                    <FormField
                      control={form.control}
                      name="transportMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meio de Transporte</FormLabel>  {/* Rótulo do campo*/}
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o meio de transporte" />  {/* Placeholder do campo*/}
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="car">Carro</SelectItem>
                              <SelectItem value="uber">Uber/Táxi</SelectItem>
                              <SelectItem value="public-transport">Transporte Público</SelectItem>
                              <SelectItem value="walking">A Pé</SelectItem>
                              <SelectItem value="bicycle">Bicicleta</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />     
                    {/* Fim do campo específico: transportMode */}

                    {/* Início do campo específico: transportDescription */}
                    <FormField
                      control={form.control}
                      name="transportDescription" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição da Viagem</FormLabel>  {/* Rótulo do campo*/}
                          <FormControl>
                            <Textarea
                              placeholder="Descreva a viagem (ex: Viagem para o trabalho, Volta para casa)..."  /* Placeholder do campo*/
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Fim do campo específico: transportDescription */}
                  </div>                  
                )}
                {/* Fim da subcategoria 'transportation' */}

                {/* Início da subcategoria 'health' */}
                {routineCategory === "health" && ( 
                  <div className="space-y-4">
                    <div className="flex items-end space-x-2">

                      {/* Início do campo específico: healthTypeId */}
                      <FormField
                        control={form.control}
                        name="healthTypeId"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Tipo de Demanda de Saúde</FormLabel>  {/* Rótulo do campo*/}
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo de demanda de saúde" />  {/* Placeholder do campo*/}
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {healthTypes?.map((type: any) => (
                                  <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Fim do campo específico: healthTypeId */}
                      
                      <AddNewButton  // Botão para adicionar novos tipos de demanda de saúde
                        onClick={() => setAddHealthTypeModalOpen(true)}
                        label="Adicionar Novo"
                      />
                    </div>

                    {/* Início do campo específico: healthDescription */}
                    <FormField
                      control={form.control}
                      name="healthDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição da Despesa de Saúde</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva o gasto (ex: Consulta médica, Remédios, Exames)..."
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     {/* Fim do campo específico: healthDescription */}
                  </div>
                )}
                {/* Fim da subcategoria 'health' */}

                {/* Início da subcategoria 'family' */}
                {routineCategory === "family" && ( 
                  <div className="space-y-4">
                    <div className="flex items-end space-x-2">

                      {/* Início do campo específico: familyMemberId */}
                      <FormField 
                        control={form.control}
                        name="familyMemberId"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Membro da Família</FormLabel>  {/* Rótulo do campo*/}
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o membro da família" />  {/* Placeholder do campo*/}
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {familyMembers?.map((member: any) => (
                                  <SelectItem key={member.id} value={member.id.toString()}>
                                    {member.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Fim do campo específico: familyMemberId */}
                      
                      <AddNewButton  // Botão para adicionar novos membros da família
                        onClick={() => setAddFamilyMemberModalOpen(true)}
                        label="Adicionar Novo"
                      />
                    </div>

                    {/* Início do campo específico: familyDescription */}
                    <FormField  
                      control={form.control}
                      name="familyDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição da Despesa Familiar</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva o gasto (ex: Presente para o irmão, Jantar com os pais)..."
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Fim do campo específico: familyDescription */}
                  </div>
                )}
                {/* Fim da subcategoria 'family' */}

                {/* Início a subcategoria 'charity' */}
                {routineCategory === "charity" && (
                  <div className="space-y-4">
                    <div className="flex items-end space-x-2">

                      {/* Início do campo específico: charityTypeId */}
                      <FormField   
                        control={form.control}
                        name="charityTypeId"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Tipo de Caridade</FormLabel>  {/* Rótulo do campo*/}
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo de caridade" />  {/* Placeholder do campo*/}
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {charityTypes?.map((type: any) => (
                                  <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Fim do campo específico: charityTypeId */}
                      
                      <AddNewButton  // Botão para adicionar novos tipos de caridade
                        onClick={() => setAddCharityTypeModalOpen(true)}
                        label="Adicionar Novo"
                      />
                    </div>
                    
                    {/* Início do campo específico: charityDescription */}
                    <FormField  
                      control={form.control}
                      name="charityDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição da Despesa de Caridade</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva a doação (ex: Doação para orfanato, Contribuição para causa ambiental)..."
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Fim do campo específico: charityDescription */}
                  </div>
                )}
                {/* Fim da subcategoria 'charity' */}

              </div>
            )}
            {/* Fim dos campos específicos para 'routine' */}
                
        
            {/* Renderiza campos específicos para 'occasional' */}
            {expenseType === "occasional" && (
              <FormField
                control={form.control}
                name="occasionalGroupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grupos Abertos de Gastos Ocasionais</FormLabel>
                    <div className="flex items-end space-x-2"> 
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um grupo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {occasionalGroups?.map((group) => (<SelectItem key={group.id} value={group.id.toString()}>{group.name}
                          </SelectItem>))}
                        </SelectContent>
                      </Select>
                      <AddNewButton // Botão para adicionar novos grupos
                        onClick={() => setAddOccasionalGroupModalOpen(true)}
                        label="Adicionar Novo"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {/* Fim dos campos específicos para 'occasional' */}

            
            {/* Ações do formulário: Botões "Cancelar" e "Salvar" */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createExpenseMutation.isPending}>
                {createExpenseMutation.isPending ? "Salvando..." : "Salvar Gasto"}
              </Button>
            </div>
          </form>
        </Form>  {/* Fim do formulário de adição de despesa*/}
        
      </DialogContent>
      
      {/* LOCALIZAÇÃO DOS MODAIS ADICIONAIS: Renderizados aqui, fora do <form> mas dentro do <Dialog> */}

      <AddOccasionalGroupModal  // Renderiza o modal de grupo de despesas ocasionais
        open={addOccasionalGroupModalOpen}
        onOpenChange={setAddOccasionalGroupModalOpen}
      />      
      <AddFixedExpenseTypeModal  // Renderiza o modal de tipo de despesa fixa
        open={showAddFixedExpenseTypeModal}
        onOpenChange={setShowAddFixedExpenseTypeModal}
      />
      <AddSupermarketModal  // Renderiza o modal de supermercado
        open={showAddSupermarketModal}
        onOpenChange={setShowAddSupermarketModal}
      />
      <AddRestaurantModal  // Renderiza o modal de restaurante
        open={showAddRestaurantModal}
        onOpenChange={setShowAddRestaurantModal}
      />
      <AddServiceTypeModal  // Renderiza o modal de tipo de serviço
        open={addServiceTypeModalOpen}
        onOpenChange={setAddServiceTypeModalOpen}
      />
      <AddLeisureTypeModal  // Renderiza o modal de tipo de lazer
        open={addLeisureTypeModalOpen}
        onOpenChange={setAddLeisureTypeModalOpen}
      />
      <AddPersonalCareTypeModal  // Renderiza o modal de tipo de cuidado pessoal
        open={addPersonalCareTypeModalOpen}
        onOpenChange={setAddPersonalCareTypeModalOpen}
      />
      <AddShopModal  // Renderiza o modal de loja
        open={addShopModalOpen}
        onOpenChange={setAddShopModalOpen}
      />
      <AddPlaceModal  // Renderiza o modal de lugar
        open={addPlaceModalOpen}
        onOpenChange={setAddPlaceModalOpen}
      />
      <AddHealthTypeModal  // Renderiza o modal de tipo de saúde
        open={addHealthTypeModalOpen}
        onOpenChange={setAddHealthTypeModalOpen}
      />
      <AddFamilyMemberModal  // Renderiza o modal de membro da família
        open={addFamilyMemberModalOpen}
        onOpenChange={setAddFamilyMemberModalOpen}
      />
      <AddCharityTypeModal  // Renderiza o modal de tipo de caridade
        open={addCharityTypeModalOpen}
        onOpenChange={setAddCharityTypeModalOpen}
      />
    {/* Fim do modal de adição de despesa*/}
      
    </Dialog> 
  );
};
