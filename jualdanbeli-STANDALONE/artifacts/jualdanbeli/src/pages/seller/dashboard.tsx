import { useGetDashboardSummary, useGetSalesChart, useGetRecentActivity } from "@workspace/api-client-react";
import { SellerLayout } from "@/components/layout/SellerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR } from "@/lib/format";
import { ShoppingBag, Package, DollarSign, Clock, ArrowUpRight } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function SellerDashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: chartData, isLoading: loadingChart } = useGetSalesChart({ period: "30d" });
  const { data: activity, isLoading: loadingActivity } = useGetRecentActivity();

  return (
    <SellerLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Seller Dashboard</h1>
        <p className="text-muted-foreground">Overview of your shop's performance.</p>
      </div>

      {loadingSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                  <DollarSign className="w-5 h-5" />
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">+12%</Badge>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold">{formatIDR(summary?.totalRevenue || 0)}</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Orders</p>
              <h3 className="text-2xl font-bold">{summary?.totalOrders || 0}</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-amber-100 p-3 rounded-lg text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
                {summary?.pendingOrders ? (
                  <Badge variant="destructive">{summary.pendingOrders} to ship</Badge>
                ) : null}
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Pending Orders</p>
              <h3 className="text-2xl font-bold">{summary?.pendingOrders || 0}</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Active Products</p>
              <h3 className="text-2xl font-bold">{summary?.activeProducts || 0}</h3>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingChart ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData || []}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => new Date(val).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tickFormatter={(val) => `Rp${(val/1000000).toFixed(0)}M`}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatIDR(value), "Revenue"]}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingActivity ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : !activity || activity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity.
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                {activity.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      {item.type === 'order' ? <ShoppingBag className="w-5 h-5" /> : 
                       item.type === 'payment' ? <DollarSign className="w-5 h-5" /> : 
                       <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
}
