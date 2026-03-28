import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { useAdminOrders } from "@/hooks/useAdmin";
import { Package, ShoppingBag, Tags, DollarSign } from "lucide-react";

const AdminDashboard = () => {
  const { data: products } = useProducts();
  const { data: categories } = useCategories();
  const { data: orders } = useAdminOrders();

  const totalRevenue = (orders || []).reduce((sum: number, o: any) => sum + Number(o.total), 0);

  const stats = [
    { label: "Products", value: products?.length || 0, icon: Package },
    { label: "Categories", value: categories?.length || 0, icon: Tags },
    { label: "Orders", value: orders?.length || 0, icon: ShoppingBag },
    { label: "Revenue", value: `৳${totalRevenue.toLocaleString()}`, icon: DollarSign },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold">Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-body font-medium text-muted-foreground">
                  {s.label}
                </CardTitle>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-body">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {!orders?.length ? (
              <p className="text-muted-foreground text-sm">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{order.shipping_full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">৳{Number(order.total).toLocaleString()}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground capitalize">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
