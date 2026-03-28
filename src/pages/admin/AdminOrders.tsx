import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminOrders } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

const AdminOrders = () => {
  const { data: orders, isLoading } = useAdminOrders();
  const queryClient = useQueryClient();

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold">Orders</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Customer</th>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Total</th>
                    <th className="text-left p-3 font-medium">Payment</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Items</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                  ) : !orders?.length ? (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No orders yet</td></tr>
                  ) : orders.map((order: any) => (
                    <tr key={order.id} className="border-b hover:bg-muted/30">
                      <td className="p-3">
                        <p className="font-medium">{order.shipping_full_name}</p>
                        <p className="text-xs text-muted-foreground">{order.shipping_phone}</p>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 font-medium">৳{Number(order.total).toLocaleString()}</td>
                      <td className="p-3 uppercase text-xs">{order.payment_method}</td>
                      <td className="p-3">
                        <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((s) => (
                              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {order.order_items?.length || 0} items
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
