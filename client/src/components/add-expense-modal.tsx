// FUNÇÃO NA OPERAÇÃO: O componente AddExpenseModal é responsável por renderizar um formulário modal que permite aos usuários adicionar novas despesas ao sistema. Ele utiliza a biblioteca React Hook Form para gerenciar o estado do formulário e a biblioteca Zod para validação de esquemas. Além disso, ele utiliza o React Query para fazer chamadas de API e gerenciar o estado de carregamento e erro.

// IMPORTAÇÕES

import { useState } from "react";
import { useForm } from "react-hook-form"; // para lidar com o estado do formulário
import { zodResolver } from "@hookform/resolvers/zod"; // conecta zod com react-hook-form
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // para lidar com chamadas de API e gerenciar o estado de carregamento e erro
// useQuery: para buscar dados (ex: restaurantes, mercados...)
// useMutation: para enviar dados (cadastrar uma despesa)
// useQueryClient: para invalidar e atualizar os dados da cache após a criação
import { z } from "zod"; // para validação de dados (esquemas)
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


// Importa o componente AddSupermarketModal
import { AddSupermarketModal } from "./AddSupermarketModal";

// Importa o componente AddRestaurantModal
import { AddRestaurantModal } from "./AddRestaurantModal";



// SCHEMA: Define o esquema de validação para o formulário de adição de despesa usando a biblioteca Zod.
// Define o que o formulário espera: campos obrigatórios, tipos, enums.
// Campos como amount, purchaseDate, expenseType, etc., são validados aqui.
// Campos relacionados a categorias (como supermarketId) são opcionais e dependem da escolha anterior.
const expenseSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  paymentMethod: z.enum(["credit-card", "debit-card", "cash", "bank-transfer"]),
  expenseType: z.enum(["routine", "occasional"]),
  routineCategory: z
    .enum([
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
  occasionalGroupId: z.string().optional(),

  // Category-specific fields
  supermarketId: z.string().optional(), 
  restaurantId: z.string().optional(),
  serviceTypeId: z.string().optional(),
  leisureTypeId: z.string().optional(),
  personalCareTypeId: z.string().optional(),
  healthTypeId: z.string().optional(),
  familyMemberId: z.string().optional(),
  charityTypeId: z.string().optional(),

  // Text fields
  description: z.string().optional(),
  storeName: z.string().optional(),
  startingPoint: z.string().optional(),
  destination: z.string().optional(),
  transportMode: z
    .enum(["car", "uber", "public-transport", "walking", "bicycle"])
    .optional(),
  purchaseType: z.enum(["in-person", "online"]).optional(),
  
  // Campos para a subcategoria 'food'
  foodPurchaseType: z.enum(["in-person", "online"]).optional(), 
  occasionType: z.enum(["normal", "special"]).optional(), 
  specialOccasionDescription: z.string().optional(),
});

// Cria o tipo TypeScript baseado no schema. Isso garante tipagem automática no formulário
type ExpenseFormData = z.infer<typeof expenseSchema>;

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// COMPONENTE: O componente AddExpenseModal é responsável por renderizar o formulário modal e gerenciar o estado do formulário e as chamadas de API. Recebe dois props:
// open: controla se o modal está aberto.
// onOpenChange: função para abrir/fechar o modal.
export function AddExpenseModal({ open, onOpenChange }: AddExpenseModalProps) {
  
  // Estados locais para gerenciar o estado do formulário e os diálogos de adição de novos itens
  const [newItemDialogs, setNewItemDialogs] = useState<{
    [key: string]: boolean;
  }>({});
  // Hooks para lidar com notificações e atualização de cache
  const { toast } = useToast();
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
  // Observa os valores do formulário para atualizar os campos condicionais
  const watchedValues = form.watch();
  // Extrai os valores observados para facilitar o uso condicional
  const expenseType = watchedValues.expenseType;
  // Extrai a categoria de despesa rotineira para campos condicionais
  const routineCategory = watchedValues.routineCategory;

  // Hooks para buscar dados de categorias e grupos de despesas ocasionais
  const { data: occasionalGroups } = useQuery({
    queryKey: ["/api/occasional-groups/open"],
    enabled: expenseType === "occasional",
  });

  
  // HOOKS PARA BUSCAR DADOS DE CATEGORIAS ESPECÍFICAS
  // Cada um é habilitado apenas quando a categoria correspondente é selecionada

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


  
  const { data: serviceTypes } = useQuery({
    queryKey: ["/api/service-types"],
    enabled: routineCategory === "services",
  });

  const { data: leisureTypes } = useQuery({
    queryKey: ["/api/leisure-types"],
    enabled: routineCategory === "leisure",
  });

  const { data: personalCareTypes } = useQuery({
    queryKey: ["/api/personal-care-types"],
    enabled: routineCategory === "personal-care",
  });

  const { data: healthTypes } = useQuery({
    queryKey: ["/api/health-types"],
    enabled: routineCategory === "health",
  });

  const { data: familyMembers } = useQuery({
    queryKey: ["/api/family-members"],
    enabled: routineCategory === "family",
  });

  const { data: charityTypes } = useQuery({
    queryKey: ["/api/charity-types"],
    enabled: routineCategory === "charity",
  });

  
  // HOOKS PARA LIDAR COM A ADIÇÃO DE NOVOS ITENS
  // Cada hook gerencia o estado de um modal específico para adicionar novos itens (ex: mercados, restaurantes, etc.)
  
  // Hooks para lidar com a adição de novos supermercados
  const [showAddSupermarketModal, setShowAddSupermarketModal] = useState(false); 

  

  // Hook para criar uma nova despesa
  // Envia os dados do formulário para a API.
  // Ao ter sucesso, ele:
  // Atualiza queries (invalidateQueries)
  // Exibe toast de sucesso
  // Fecha o modal
  // Reseta o formulário
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

  // Função para lidar com o envio do formulário
  // Converte os dados do formulário (ex: string → number)
  // Define campos como null quando não aplicáveis
  // Chama a mutate() do react-query
  const onSubmit = (data: ExpenseFormData) => {
    const expenseData = {
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

      // Campos específicos de categoria são convertidos para números ou definidos como null quando não aplicáveis
      supermarketId: data.supermarketId ? parseInt(data.supermarketId) : null,
      
      restaurantId: data.restaurantId ? parseInt(data.restaurantId) : null,
      serviceTypeId: data.serviceTypeId ? parseInt(data.serviceTypeId) : null,
      leisureTypeId: data.leisureTypeId ? parseInt(data.leisureTypeId) : null,
      personalCareTypeId: data.personalCareTypeId
        ? parseInt(data.personalCareTypeId)
        : null,
      healthTypeId: data.healthTypeId ? parseInt(data.healthTypeId) : null,
      familyMemberId: data.familyMemberId
        ? parseInt(data.familyMemberId)
        : null,
      charityTypeId: data.charityTypeId ? parseInt(data.charityTypeId) : null,

      // Text fields
      description: data.description || null,
      storeName: data.storeName || null,
      startingPoint: data.startingPoint || null,
      destination: data.destination || null,
      transportMode: data.transportMode || null,
      purchaseType: data.purchaseType || null,


      // Novos campos para a subcategoria 'food'
      foodPurchaseType: data.routineCategory === "food" ? (data.foodPurchaseType || null) : null, 
      occasionType: data.routineCategory === "food" ? (data.occasionType || null) : null, 
      specialOccasionDescription: data.routineCategory === "food" && data.occasionType === "special" ? (data.specialOccasionDescription || null) : null,

      
    };

    createExpenseMutation.mutate(expenseData);
  };

  // Componente de botão para adicionar novos itens (mercados, restaurantes, etc.)
  // Pode ser conectado futuramente a outros modais (onClick)
  const AddNewButton = ({
    onClick,
    label,
  }: {
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

  // Renderiza o formulário modal
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Expense Type: Botões de seleção entre "routine" e "occasional" */}
            <FormField
              control={form.control}
              name="expenseType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense Type</FormLabel>
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
                            <p className="font-medium">Routine</p>
                            <p className="text-sm text-muted-foreground">
                              Regular recurring expenses
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
                            <p className="font-medium">Occasional Group</p>
                            <p className="text-sm text-muted-foreground">
                              Special event expenses
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

            {/* Um dos campos comuns: purchaseDate */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField // Um dos campos comuns: amount
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
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
            </div>

            <FormField // Um dos campos comuns: paymentMethod
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="credit-card">Credit Card</SelectItem>
                      <SelectItem value="debit-card">Debit Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank-transfer">
                        Bank Transfer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campos específicos de rotina: Renderizados dependendo da routineCategory */}
            {expenseType === "routine" && (
              <div className="space-y-6">
                <FormField  // Um dos campos específicos de rotina: routineCategory
                  control={form.control}
                  name="routineCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Routine Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="supermarket">
                            Supermarket
                          </SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="leisure">Leisure</SelectItem>
                          <SelectItem value="personal-care">
                            Personal Care
                          </SelectItem>
                          <SelectItem value="shopping">Shopping</SelectItem>
                          <SelectItem value="transportation">
                            Transportation
                          </SelectItem>
                          <SelectItem value="health">Health</SelectItem>
                          <SelectItem value="family">Family</SelectItem>
                          <SelectItem value="charity">Charity</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Renderizados dependendo da routineCategory */}
                
                {/*  Início da subcategoria 'supermarket'  */}
                {routineCategory === "supermarket" && ( 
                  <div className="flex items-end space-x-2">
                    <FormField  // Um dos campos específicos: supermarketId
                      control={form.control}
                      name="supermarketId"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Supermarket</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o supermercado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {supermarkets?.map((supermarket: any) => (
                                <SelectItem
                                  key={supermarket.id}
                                  value={supermarket.id.toString()}
                                >
                                  {supermarket.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <AddNewButton  // Botão para adicionar novos supermercados
                      onClick={() => setShowAddSupermarketModal(true)}
                      label="Adicionar Novo"
                    />
                    <AddSupermarketModal  // Modal para adicionar novos supermercados
                      open={showAddSupermarketModal}
                      onOpenChange={setShowAddSupermarketModal}
                    />
                  </div>
                )}
                {/*  Fim da subcategoria 'supermarket'  */}

                {/*  Início da subcategoria 'food'  */}
                {routineCategory === "food" && (
                  <div className="space-y-4">
                    <FormField  // Um dos campos específicos: description
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the food situation..."
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-end space-x-2">
                      <FormField  // Um dos campos específicos: restaurantId
                        control={form.control}
                        name="restaurantId"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Restaurant</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select restaurant" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {restaurants?.map((restaurant: any) => (
                                  <SelectItem
                                    key={restaurant.id}
                                    value={restaurant.id.toString()}
                                  >
                                    {restaurant.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <AddNewButton  // Botão para adicionar novos restaurantes
                        onClick={() => setShowAddRestaurantModal(true)}
                        label="Adicionar Novo"
                      />
                      <AddRestaurantModal  // Modal para adicionar novos restaurantes
                        open={showAddRestaurantModal}
                        onOpenChange={setShowAddRestaurantModal}
                      />
                  </div>
                    <FormField  // Um dos campos específicos: foodPurchaseType
                      control={form.control}
                      name="foodPurchaseType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Location</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="in-person" id="food-in-person" />
                                <label htmlFor="food-in-person">In-Person</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="online" id="food-online" />
                                <label htmlFor="food-online">Online</label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField  // Um dos campos específicos: occasionType
                       control={form.control}
                       name="occasionType"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Occasion Type</FormLabel>
                           <FormControl>
                             <RadioGroup
                               onValueChange={field.onChange}
                               value={field.value}
                               className="flex space-x-4"
                             >
                               <div className="flex items-center space-x-2">
                                 <RadioGroupItem value="normal" id="occasion-normal" />
                                 <label htmlFor="occasion-normal">Normal</label>
                               </div>
                               <div className="flex items-center space-x-2">
                                 <RadioGroupItem value="special" id="occasion-special" />
                                 <label htmlFor="occasion-special">Special Occasion</label>
                               </div>
                             </RadioGroup>
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                    {watchedValues.occasionType === "special" && (
                          <FormField  // Um dos campos específicos: specialOccasionDescription
                            control={form.control}
                            name="specialOccasionDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Special Occasion Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="ex: aniversário de alguém, celebração de algo..."
                                    rows={2}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    )}
                {/* Fim da subcategoria 'food' */}


                
                {routineCategory === "shopping" && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the purchased item..."
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="purchaseType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="in-person"
                                  id="in-person"
                                />
                                <label htmlFor="in-person">In-Person</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="online" id="online" />
                                <label htmlFor="online">Online</label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="storeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter store name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {routineCategory === "transportation" && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trip Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the trip..."
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startingPoint"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Starting Point</FormLabel>
                            <FormControl>
                              <Input placeholder="From..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="destination"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Destination</FormLabel>
                            <FormControl>
                              <Input placeholder="To..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="transportMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mode of Transport</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select transport" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="car">Car</SelectItem>
                              <SelectItem value="uber">Uber/Lyft</SelectItem>
                              <SelectItem value="public-transport">
                                Public Transport
                              </SelectItem>
                              <SelectItem value="walking">Walking</SelectItem>
                              <SelectItem value="bicycle">Bicycle</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Campos para gastos ocasionais: Mostra dropdown com os grupos de eventos */}
            {expenseType === "occasional" && (
              <FormField
                control={form.control}
                name="occasionalGroupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occasional Group</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {occasionalGroups?.map((group: any) => (
                          <SelectItem
                            key={group.id}
                            value={group.id.toString()}
                          >
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Ações do formulário: Botões "Cancelar" e "Salvar" */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createExpenseMutation.isPending}>
                {createExpenseMutation.isPending ? "Saving..." : "Save Expense"}
              </Button>
            </div>
          </form>
        </Form>


      </DialogContent>
    </Dialog>
  );
}
