import { useGetCart, useRemoveCartItem, useUpdateCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatIDR } from "@/lib/format";
import { Trash2, Minus, Plus, ShoppingCart, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function Cart() {
  const { data: cart, isLoading } = useGetCart();
  const removeMutation = useRemoveCartItem();
  const updateMutation = useUpdateCartItem();
  const queryClient = useQueryClient();

  const handleRemove = (itemId: number) => {
    removeMutation.mutate({ itemId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      }
    });
  };

  const handleUpdate = (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    updateMutation.mutate({ itemId, data: { quantity } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      }
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
          <div><Skeleton className="h-64 w-full rounded-xl" /></div>
        </div>
      </MainLayout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <ShoppingCart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet.</p>
          <Button asChild size="lg"><Link href="/products">Start Shopping</Link></Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  {item.product?.images?.[0] ? (
                    <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-lg">{item.product?.name}</h3>
                    <div className="text-muted-foreground text-sm">{formatIDR(item.unitPrice)}</div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleUpdate(item.id, item.quantity - 1)}
                        disabled={updateMutation.isPending}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleUpdate(item.id, item.quantity + 1)}
                        disabled={updateMutation.isPending}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleRemove(item.id)}
                      disabled={removeMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20 shadow-md">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>{formatIDR(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatIDR(cart.subtotal)}</span>
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-3 flex gap-3 mb-6 border border-primary/20">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                <p className="text-xs text-primary/80 font-medium">
                  Protected by Rekening Bersama. Your payment is held securely until you receive the item.
                </p>
              </div>

              <Button className="w-full font-bold text-lg py-6" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
