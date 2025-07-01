import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Wallet, 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  Tags 
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: BarChart3,
      active: location === "/"
    },
    {
      href: "/monthly",
      label: "Monthly View",
      icon: Calendar,
      active: location === "/monthly"
    },
    {
      href: "/annual",
      label: "Annual Statistics",
      icon: TrendingUp,
      active: location === "/annual"
    },
    {
      href: "/categories",
      label: "Manage Categories",
      icon: Tags,
      active: location === "/categories"
    }
  ];

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary flex items-center">
          <Wallet className="mr-3 h-6 w-6" />
          FinanceTracker
        </h1>
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
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
