import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCategories } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const AdminCategories = () => {
  const { data: categories, isLoading } = useCategories();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);

  const openNew = () => { setEditId(null); setName(""); setSlug(""); setImage(""); setOpen(true); };
  const openEdit = (c: any) => { setEditId(c.id); setName(c.name); setSlug(c.slug); setImage(c.image || ""); setOpen(true); };

  const handleSave = async () => {
    if (!name || !slug) { toast.error("Name and slug required"); return; }
    setSaving(true);
    const payload = { name: name.trim(), slug: slug.trim().toLowerCase(), image: image.trim() || null };
    if (editId) {
      const { error } = await supabase.from("categories").update(payload).eq("id", editId);
      error ? toast.error(error.message) : toast.success("Updated");
    } else {
      const { error } = await supabase.from("categories").insert(payload);
      error ? toast.error(error.message) : toast.success("Created");
    }
    setSaving(false); setOpen(false);
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    error ? toast.error(error.message) : toast.success("Deleted");
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Categories</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Add Category</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Category</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div><Label>Slug *</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. electronics" /></div>
                <div><Label>Image URL</Label><Input value={image} onChange={(e) => setImage(e.target.value)} /></div>
                <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? "Saving..." : "Save"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Slug</th>
                <th className="text-left p-3 font-medium">Products</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : (categories || []).map((c) => (
                  <tr key={c.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3 text-muted-foreground">{c.slug}</td>
                    <td className="p-3">{c.product_count || 0}</td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
