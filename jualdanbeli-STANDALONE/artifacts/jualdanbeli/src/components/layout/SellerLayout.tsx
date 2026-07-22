import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { JDBLogo } from "@/components/JDBLogo";
import { Store, Package, ShoppingBag, Wallet, Settings, LogOut, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLogout } from "@workspace/api-client-react";

export function SellerLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, clearToken } = useAuth();
  const logoutMutation = useLogout();

  const navItems = [
    { icon: Store, label: "Dashboard", href: "/seller/dashboard" },
    { icon: Package, label: "Products", href: "/seller/products" },
    { icon: ShoppingBag, label: "Orders", href: "/seller/orders" },
    { icon: Wallet, label: "Wallet", href: "/wallet" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r flex-shrink-0 hidden md:flex flex-col">
        <div className="h-16 border-b flex items-center px-4 bg-gray-900">
          <JDBLogo size="sm" variant="icon" />
          <span className="ml-2 font-bold text-white text-sm">Seller Center</span>
        </div>
        
        <div className="p-4 border-b">
          <div className="font-medium">{user?.sellerInfo?.shopName || "My Shop"}</div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
          <button 
            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            onClick={() => {
              logoutMutation.mutate(undefined, {
                onSuccess: clearToken
              });
            }}
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 md:hidden">
          <span className="font-bold text-primary">Seller Center</span>
        </header>
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
