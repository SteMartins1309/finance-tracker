import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/sidebar";
import Dashboard from "@/pages/dashboard";
import MonthlyView from "@/pages/monthly-view";
import AnnualView from "@/pages/annual-view";
import Categories from "@/pages/categories";
import NotFound from "@/pages/not-found";
import RecurringExpensesPage from "@/pages/RecurringExpensesPage"; // NOVO: Importa a nova página de recorrências

// Componente responsável por definir as rotas da aplicação
function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/recurring-expenses" component={RecurringExpensesPage} /> {/* NOVO: Rota para a página de recorrências */}
      <Route path="/monthly" component={MonthlyView} />
      <Route path="/annual" component={AnnualView} />
      <Route path="/categories" component={Categories} />
      {/* Rota fallback para 404 (qualquer path que não corresponda) */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Componente principal da aplicação
function App() {
  return (
    // Provedor do cliente de query para TanStack Query
    <QueryClientProvider client={queryClient}>
      {/* Provedor de tooltips */}
      <TooltipProvider>
        {/* Layout principal da aplicação: Sidebar e área de conteúdo */}
        <div className="flex h-screen bg-surface">
          <Sidebar /> {/* Componente da barra lateral */}
          <main className="flex-1 overflow-auto">
            <AppRouter /> {/* Componente de roteamento */}
          </main>
        </div>
        {/* Componente para exibir os toasts (notificações) */}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;