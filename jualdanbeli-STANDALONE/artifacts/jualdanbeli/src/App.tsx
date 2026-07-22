import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { setAuthTokenGetter } from "@workspace/api-client-react";

// Wire up token for all generated API hooks
setAuthTokenGetter(() => localStorage.getItem("token"));

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Categories from "@/pages/categories";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Orders from "@/pages/orders";
import OrderDetail from "@/pages/order-detail";
import SellerDashboard from "@/pages/seller/dashboard";
import SellerProducts from "@/pages/seller/products";
import ProductForm from "@/pages/seller/product-form";
import SellerOrders from "@/pages/seller/orders";
import Wallet from "@/pages/wallet";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import Messages from "@/pages/messages";
import MessageDetail from "@/pages/message-detail";
import Notifications from "@/pages/notifications";

import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminDisputes from "@/pages/admin/disputes";
import AdminReports from "@/pages/admin/reports";
import AdminWithdrawals from "@/pages/admin/withdrawals";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import About from "@/pages/about";
import SellerKYC from "@/pages/seller-kyc";
import Support from "@/pages/support";
import AdminSupport from "@/pages/admin/support";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminPlatformSettings from "@/pages/admin/settings";
import Wishlist from "@/pages/wishlist";
import AdminVouchers from "@/pages/admin/vouchers";
import AdminMonitoring from "@/pages/admin/monitoring";
import AdminSecurity from "@/pages/admin/security";
import LivePage from "@/pages/live/index";
import WatchLive from "@/pages/live/watch";
import SellerLive from "@/pages/seller/live";
import ShippingProtection from "@/pages/shipping-protection";
import Pembayaran from "@/pages/pembayaran";
import Merek from "@/pages/merek";

// Global 401/403 handler — auto-logout bila token expired atau diblokir
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      onError: (error: any) => {
        if (error?.status === 401) {
          localStorage.removeItem("token");
          queryClient.clear();
          window.location.href = "/login";
        }
      },
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      
      <Route path="/products" component={Products} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/categories" component={Categories} />
      <Route path="/profile/:userId" component={Profile} />
      
      {/* Buyer Routes */}
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/orders" component={Orders} />
      <Route path="/orders/:id" component={OrderDetail} />
      
      {/* Seller Routes */}
      <Route path="/seller/dashboard" component={SellerDashboard} />
      <Route path="/seller/products" component={SellerProducts} />
      <Route path="/seller/products/new" component={ProductForm} />
      <Route path="/seller/orders" component={SellerOrders} />
      
      {/* Shared Authenticated Routes */}
      <Route path="/wallet" component={Wallet} />
      <Route path="/settings" component={Settings} />
      <Route path="/messages" component={Messages} />
      <Route path="/messages/:id" component={MessageDetail} />
      <Route path="/notifications" component={Notifications} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/disputes" component={AdminDisputes} />
      <Route path="/admin/reports" component={AdminReports} />
      <Route path="/admin/withdrawals" component={AdminWithdrawals} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/platform-settings" component={AdminPlatformSettings} />
      <Route path="/admin/monitoring" component={AdminMonitoring} />
      <Route path="/admin/security" component={AdminSecurity} />

      {/* Legal & Info Pages */}
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/about" component={About} />
      <Route path="/seller/register" component={SellerKYC} />
      <Route path="/support" component={Support} />
      <Route path="/admin/support" component={AdminSupport} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/admin/vouchers" component={AdminVouchers} />
      <Route path="/live" component={LivePage} />
      <Route path="/live/:id" component={WatchLive} />
      <Route path="/seller/live" component={SellerLive} />
      <Route path="/shipping-protection" component={ShippingProtection} />
      <Route path="/pembayaran" component={Pembayaran} />
      <Route path="/merek" component={Merek} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
