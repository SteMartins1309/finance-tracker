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
  Calendar
} from "lucide-react";

const occasionalGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
});

type OccasionalGroupFormData = z.infer<typeof occasionalGroupSchema>;

export default function Categories() {
  const [addGroupModalOpen, setAddGroupModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<OccasionalGroupFormData>({
    resolver: zodResolver(occasionalGroupSchema),
    defaultValues: {
      name: "",
    },
  });

  const { data: occasionalGroups, isLoading: groupsLoading } = useQuery({
    queryKey: ["/api/occasional-groups"],
  });

  const { data: supermarkets } = useQuery({
    queryKey: ["/api/supermarkets"],
  });

  const { data: restaurants } = useQuery({
    queryKey: ["/api/restaurants"],
  });

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
    mutationFn: async ({ id, status }: { id: number; status: "open" | "closed" }) => {
      return await apiRequest("PATCH", `/api/occasional-groups/${id}/status`, { status });
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

  const onSubmit = (data: OccasionalGroupFormData) => {
    createGroupMutation.mutate(data);
  };

  const toggleGroupStatus = (group: any) => {
    const newStatus = group.status === "open" ? "closed" : "open";
    toggleGroupStatusMutation.mutate({ id: group.id, status: newStatus });
  };

  const routineCategories = [
    { name: "Supermarket", icon: ShoppingCart, count: supermarkets?.length || 0 },
    { name: "Food", icon: Utensils, count: restaurants?.length || 0 },
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
          <h2 className="text-3xl font-bold text-text-primary">Manage Categories</h2>
          <p className="text-text-secondary mt-1">Configure routine categories and occasional groups</p>
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Holiday Trip 2024" {...field} />
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
                    {createGroupMutation.isPending ? "Creating..." : "Create Group"}
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
            <p className="text-sm text-text-secondary">Manage your recurring expense types</p>
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
                      <p className="text-sm text-text-secondary">
                        {category.count} {category.count === 1 ? 'item' : 'items'} configured
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
            <p className="text-sm text-text-secondary">Manage special expense groups</p>
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
                <p className="text-text-secondary">No occasional groups yet</p>
                <p className="text-sm text-text-secondary">Create your first group to get started</p>
              </div>
            ) : (
              occasionalGroups?.map((group: any) => (
                <div key={group.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-accent mr-3" />
                    <div>
                      <p className="font-medium text-text-primary">{group.name}</p>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={group.status === "open" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {group.status === "open" ? "Open" : "Closed"}
                        </Badge>
                        <span className="text-sm text-text-secondary">
                          Created {new Date(group.createdAt).toLocaleDateString()}
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
    </div>
  );
}
