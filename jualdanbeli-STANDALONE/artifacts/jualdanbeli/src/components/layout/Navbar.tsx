import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogout, useGetCart, useGetCategories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JDBLogo } from "@/components/JDBLogo";
import {
  ShoppingCart,
  Search,
  User,
  LogOut,
  ShieldCheck,
  HeadphonesIcon,
  Heart,
  Radio,
  Bell,
  ChevronDown,
  Tag,
  Zap,
  Package,
  MessageSquare,
  Wallet,
  Settings,
  LayoutDashboard,
  MapPin,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const NAV_CATEGORIES = [
  { label: "Flash Sale", href: "/products?sort=popular", icon: "⚡", hot: true },
  { label: "Bayar Tagihan", href: "/pembayaran", icon: "💳", highlight: true },
  { label: "Elektronik", href: "/products?categoryId=1", icon: "📱" },
  { label: "Fashion", href: "/products?categoryId=2", icon: "👗" },
  { label: "Rumah & Dapur", href: "/products?categoryId=3", icon: "🏠" },
  { label: "Olahraga", href: "/products?categoryId=4", icon: "⚽" },
  { label: "Kecantikan", href: "/products?categoryId=5", icon: "💄" },
  { label: "Otomotif", href: "/products?categoryId=6", icon: "🚗" },
  { label: "Buku", href: "/products?categoryId=7", icon: "📚" },
  { label: "Semua Kategori", href: "/categories", icon: "🛒" },
];

export function Navbar() {
  const { user, isAuthenticated, clearToken } = useAuth();
  const logoutMutation = useLogout();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: cart } = useGetCart({
    query: { enabled: isAuthenticated && user?.role === "buyer" } as any,
  });

  const cartItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const handleLogout = () => {
    logoutMutation.mutate(undefined, { onSuccess: () => clearToken() });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-md">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <JDBLogo size="sm" variant="full" />
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex">
            <div className="relative w-full flex">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk, toko, kategori..."
                className="w-full rounded-r-none bg-white text-gray-900 border-none h-10 pl-4 focus-visible:ring-0"
              />
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 rounded-r-lg h-10 flex items-center gap-1.5 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Cari</span>
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto md:ml-0">
            {/* Live */}
            <Link href="/live" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm font-medium text-white transition-colors">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
              </span>
              LIVE
            </Link>

            {/* Cart */}
            {isAuthenticated && user?.role === "buyer" && (
              <Link href="/cart" className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] bg-yellow-400 text-gray-900 font-bold border-0">
                    {cartItemsCount}
                  </Badge>
                )}
              </Link>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <Link href="/notifications" className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors hidden md:block">
                <Bell className="w-5 h-5" />
              </Link>
            )}

            {/* Messages */}
            {isAuthenticated && (
              <Link href="/messages" className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors hidden md:block">
                <MessageSquare className="w-5 h-5" />
              </Link>
            )}

            {/* User menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-lg px-2 hover:bg-white/10 text-white gap-1.5 h-9">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="hidden lg:inline text-sm font-medium max-w-[80px] truncate">{user?.name?.split(" ")[0]}</span>
                    <ChevronDown className="w-3 h-3 hidden lg:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="font-normal pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {user?.role === "buyer" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/orders" className="cursor-pointer gap-2 flex items-center">
                          <Package className="w-4 h-4 text-primary" />Pesanan Saya
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/wallet" className="cursor-pointer gap-2 flex items-center">
                          <Wallet className="w-4 h-4 text-primary" />Dompet
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/wishlist" className="cursor-pointer gap-2 flex items-center">
                          <Heart className="w-4 h-4 text-primary" />Wishlist
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {user?.role === "seller" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/seller/dashboard" className="cursor-pointer gap-2 flex items-center">
                          <LayoutDashboard className="w-4 h-4 text-primary" />Dashboard Penjual
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/seller/products" className="cursor-pointer gap-2 flex items-center">
                          <Package className="w-4 h-4 text-primary" />Produk Saya
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/seller/orders" className="cursor-pointer gap-2 flex items-center">
                          <ShoppingCart className="w-4 h-4 text-primary" />Pesanan Toko
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/seller/live" className="cursor-pointer gap-2 flex items-center">
                          <Radio className="w-4 h-4 text-red-500" />Studio Live
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/wallet" className="cursor-pointer gap-2 flex items-center">
                          <Wallet className="w-4 h-4 text-primary" />Dompet
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {user?.role === "admin" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer gap-2 flex items-center">
                          <LayoutDashboard className="w-4 h-4 text-primary" />Dashboard Admin
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/support" className="cursor-pointer gap-2 flex items-center">
                          <HeadphonesIcon className="w-4 h-4 text-primary" />CS / Pengaduan
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {(user?.role === "buyer" || user?.role === "seller") && (
                    <DropdownMenuItem asChild>
                      <Link href="/support" className="cursor-pointer gap-2 flex items-center">
                        <HeadphonesIcon className="w-4 h-4 text-primary" />Bantuan CS
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer gap-2 flex items-center">
                      <Settings className="w-4 h-4" />Pengaturan
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer gap-2">
                    <LogOut className="w-4 h-4" />Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="hidden sm:inline-flex text-white hover:bg-white/10 hover:text-white">
                  <Link href="/login">Masuk</Link>
                </Button>
                <Button asChild className="bg-white text-primary hover:bg-white/90 font-semibold h-9">
                  <Link href="/register">Daftar</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category nav bar */}
      <div className="bg-white border-b hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
            {NAV_CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                  cat.hot
                    ? "text-red-600 hover:bg-red-50 font-semibold"
                    : (cat as any).highlight
                    ? "text-blue-700 hover:bg-blue-50 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-primary"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
                {cat.hot && (
                  <span className="bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">
                    HOT
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="bg-primary pb-2 px-4 md:hidden">
        <form onSubmit={handleSearch} className="flex">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari produk..."
            className="w-full rounded-r-none bg-white text-gray-900 border-none h-9 focus-visible:ring-0"
          />
          <button
            type="submit"
            className="bg-yellow-400 text-gray-900 font-semibold px-3 rounded-r-lg h-9 flex items-center"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
