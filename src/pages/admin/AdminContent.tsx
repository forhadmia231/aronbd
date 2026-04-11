import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAllPageContent, upsertPageContent, uploadCmsImage } from "@/hooks/usePageContent";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, FileText, Image, Save, Plus } from "lucide-react";

interface ContentItem {
  id: string;
  page: string;
  section: string;
  content_key: string;
  content_type: string;
  value: string;
}

const sectionLabels: Record<string, string> = {
  "home.hero": "🏠 Homepage — Hero Banner",
  "home.categories": "🏠 Homepage — Categories Section",
  "home.featured": "🏠 Homepage — Featured Products",
  "home.promo": "🏠 Homepage — Promo Banner",
  "global.header": "🌐 Header (All Pages)",
  "global.footer": "🌐 Footer (All Pages)",
};

const keyLabels: Record<string, string> = {
  subtitle: "Subtitle",
  title_line1: "Title Line 1",
  title_line2: "Title Line 2",
  description: "Description",
  button1_text: "Button 1 Text",
  button2_text: "Button 2 Text",
  image: "Image",
  title: "Title",
  label: "Label",
  button_text: "Button Text",
  overlay_title: "Overlay Title",
  overlay_subtitle: "Overlay Subtitle",
  top_bar_text: "Top Bar Announcement",
  brand_description: "Brand Description",
  copyright_text: "Copyright Text",
};

const AdminContent = () => {
  const { data: contentItems = [], isLoading } = useAllPageContent();
  const queryClient = useQueryClient();
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // New content form
  const [showNew, setShowNew] = useState(false);
  const [newPage, setNewPage] = useState("home");
  const [newSection, setNewSection] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState("text");
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    const vals: Record<string, string> = {};
    contentItems.forEach((item: ContentItem) => {
      const k = `${item.page}.${item.section}.${item.content_key}`;
      vals[k] = item.value;
    });
    setEditValues(vals);
  }, [contentItems]);

  const handleSave = async (item: ContentItem) => {
    const k = `${item.page}.${item.section}.${item.content_key}`;
    setSaving((p) => ({ ...p, [k]: true }));
    try {
      await upsertPageContent(item.page, item.section, item.content_key, editValues[k] || "", item.content_type);
      toast.success(`"${keyLabels[item.content_key] || item.content_key}" saved!`);
      queryClient.invalidateQueries({ queryKey: ["pageContent"] });
    } catch (err: any) {
      toast.error(err.message);
    }
    setSaving((p) => ({ ...p, [k]: false }));
  };

  const handleImageUpload = async (item: ContentItem, file: File) => {
    const k = `${item.page}.${item.section}.${item.content_key}`;
    setUploading((p) => ({ ...p, [k]: true }));
    try {
      const url = await uploadCmsImage(file);
      setEditValues((p) => ({ ...p, [k]: url }));
      await upsertPageContent(item.page, item.section, item.content_key, url, "image");
      toast.success("Image uploaded and saved!");
      queryClient.invalidateQueries({ queryKey: ["pageContent"] });
    } catch (err: any) {
      toast.error(err.message);
    }
    setUploading((p) => ({ ...p, [k]: false }));
  };

  const handleAddNew = async () => {
    if (!newSection.trim() || !newKey.trim()) {
      toast.error("Section and Key are required");
      return;
    }
    try {
      await upsertPageContent(newPage, newSection.trim(), newKey.trim(), newValue.trim(), newType);
      toast.success("New content added!");
      queryClient.invalidateQueries({ queryKey: ["pageContent"] });
      setNewSection("");
      setNewKey("");
      setNewValue("");
      setShowNew(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Group items by page.section
  const grouped: Record<string, ContentItem[]> = {};
  contentItems.forEach((item: ContentItem) => {
    const groupKey = `${item.page}.${item.section}`;
    if (!grouped[groupKey]) grouped[groupKey] = [];
    grouped[groupKey].push(item);
  });

  if (isLoading) return <AdminLayout><p className="text-muted-foreground">Loading content...</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Page Content Manager</h2>
          <Button variant="outline" onClick={() => setShowNew(!showNew)} className="gap-2">
            <Plus className="h-4 w-4" /> Add New
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Edit all text and images across your website. Changes appear instantly after saving.
        </p>

        {showNew && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Content Block</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Page</Label>
                  <Input value={newPage} onChange={(e) => setNewPage(e.target.value)} placeholder="home" />
                </div>
                <div>
                  <Label>Section</Label>
                  <Input value={newSection} onChange={(e) => setNewSection(e.target.value)} placeholder="hero" />
                </div>
                <div>
                  <Label>Content Key</Label>
                  <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="title" />
                </div>
                <div>
                  <Label>Type</Label>
                  <select className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm" value={newType} onChange={(e) => setNewType(e.target.value)}>
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                  </select>
                </div>
              </div>
              <div>
                <Label>Value</Label>
                <Textarea value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="Enter content..." />
              </div>
              <Button onClick={handleAddNew} className="gap-2"><Plus className="h-4 w-4" /> Add Content</Button>
            </CardContent>
          </Card>
        )}

        {Object.entries(grouped).map(([groupKey, items]) => (
          <Card key={groupKey}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {items[0].content_type === "image" ? <Image className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                {sectionLabels[groupKey] || groupKey}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => {
                const k = `${item.page}.${item.section}.${item.content_key}`;
                const val = editValues[k] ?? item.value;
                const isImage = item.content_type === "image";
                const isSaving = saving[k];
                const isUploading = uploading[k];
                const hasChanged = val !== item.value;

                return (
                  <div key={item.id} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {isImage && <Image className="h-3.5 w-3.5 text-muted-foreground" />}
                      {keyLabels[item.content_key] || item.content_key}
                    </Label>

                    {isImage ? (
                      <div className="space-y-2">
                        {val && (
                          <img src={val} alt="Preview" className="h-32 rounded-lg border object-cover" />
                        )}
                        <div className="flex gap-2">
                          <Input
                            value={val}
                            onChange={(e) => setEditValues((p) => ({ ...p, [k]: e.target.value }))}
                            placeholder="Image URL"
                            className="flex-1"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={(el) => { fileInputRefs.current[k] = el; }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(item, file);
                            }}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => fileInputRefs.current[k]?.click()}
                            disabled={isUploading}
                            title="Upload image"
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                        {isUploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
                      </div>
                    ) : (
                      val.length > 80 ? (
                        <Textarea
                          value={val}
                          onChange={(e) => setEditValues((p) => ({ ...p, [k]: e.target.value }))}
                          rows={3}
                        />
                      ) : (
                        <Input
                          value={val}
                          onChange={(e) => setEditValues((p) => ({ ...p, [k]: e.target.value }))}
                        />
                      )
                    )}

                    {hasChanged && (
                      <Button size="sm" onClick={() => handleSave(item)} disabled={isSaving} className="gap-1.5">
                        <Save className="h-3.5 w-3.5" />
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminContent;
