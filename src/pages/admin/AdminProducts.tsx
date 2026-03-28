import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  original_price: string;
  image: string;
  category_id: string;
  in_stock: boolean;
  featured: boolean;
}

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  original_price: "",
  image: "",
  category_id: "",
  in_stock: true,
  featured: false,
};

const AdminProducts = () => {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : "",
      image: p.image || "",
      category_id: p.category_id || "",
      in_stock: p.in_stock,
      featured: !!p.featured,
    });
    setOpen(true);
  };

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      image: form.image.trim() || null,
      category_id: form.category_id || null,
      in_stock: form.in_stock,
      featured: form.featured,
    };

    if (editId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editId);
      if (error) toast.error(error.message);
      else toast.success("Product updated");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) toast.error(error.message);
      else toast.success("Product created");
    }
    setSaving(false);
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Products</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew}>
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editId ? "Edit Product" : "New Product"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price *</Label>
                    <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  </div>
                  <div>
                    <Label>Original Price</Label>
                    <Input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {(categories || []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={form.in_stock} onCheckedChange={(v) => setForm({ ...form, in_stock: v })} />
                    <Label>In Stock</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                    <Label>Featured</Label>
                  </div>
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? "Saving..." : editId ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Image</th>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Price</th>
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-left p-3 font-medium">Stock</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                  ) : !products?.length ? (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No products found</td></tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-muted/30">
                        <td className="p-3">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded" />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded" />
                          )}
                        </td>
                        <td className="p-3 font-medium">{p.name}</td>
                        <td className="p-3">৳{p.price.toLocaleString()}</td>
                        <td className="p-3 text-muted-foreground">{p.category_name || "—"}</td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${p.in_stock ? "bg-success/10 text-green-700" : "bg-destructive/10 text-red-700"}`}>
                            {p.in_stock ? "In Stock" : "Out"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
