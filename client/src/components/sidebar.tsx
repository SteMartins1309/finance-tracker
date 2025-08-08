import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Wallet,
  BarChart3,
  Calendar,
  TrendingUp,
  Tags,
  ChevronLeft,
  ChevronRight,
  Repeat2, 
  Star
} from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      href: "/",
      label: "Painel",
      icon: BarChart3,
      active: location === "/"
    },
    // NOVO ITEM: Recorrências
    {
      href: "/recurring-expenses", // Rota da nova página
      label: "Recorrências",
      icon: Repeat2, // Ícone escolhido
      active: location === "/recurring-expenses"
    },
    {
      href: "/monthly",
      label: "Visualização Mensal",
      icon: Calendar,
      active: location === "/monthly"
    },
    {
      href: "/annual",
      label: "Estatísticas Anuais",
      icon: TrendingUp,
      active: location === "/annual"
    },
    {
      href: "/categories",
      label: "Gerenciar Categorias",
      icon: Tags,
      active: location === "/categories"
    },
  ];

  return (
    <aside
      className={cn(
        "bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h1 className={cn(
          "text-xl font-bold text-primary flex items-center overflow-hidden whitespace-nowrap",
          isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
        )}>
          <Wallet className="mr-3 h-6 w-6 flex-shrink-0" />
          FinanceTracker
        </h1>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      <nav className="mt-6">
        <div className="px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                  item.active
                    ? "bg-blue-50 text-primary border-r-3 border-primary"
                    : "text-text-secondary hover:bg-gray-50"
                )}>
                  <Icon className={cn(
                      "mr-3 h-4 w-4",
                      isCollapsed ? "mr-0" : "mr-3"
                  )} />
                  <span className={cn(
                      "overflow-hidden whitespace-nowrap",
                      isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}