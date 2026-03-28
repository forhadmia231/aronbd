import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSiteSettings } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const AdminSettings = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const queryClient = useQueryClient();
  const [logoText, setLogoText] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setLogoText(settings.logo_text || "aronbd.com");
      setPrimaryColor(settings.primary_color || "0 0% 12%");
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    const updates = [
      { key: "logo_text", value: logoText.trim() },
      { key: "primary_color", value: primaryColor.trim() },
    ];

    for (const u of updates) {
      const { error } = await supabase
        .from("site_settings")
        .update({ value: u.value, updated_at: new Date().toISOString() })
        .eq("key", u.key);
      if (error) {
        toast.error(`Failed to update ${u.key}: ${error.message}`);
        setSaving(false);
        return;
      }
    }

    toast.success("Settings saved! Refresh to see changes.");
    queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
    setSaving(false);
  };

  // Preview the primary color
  const previewStyle = primaryColor
    ? { backgroundColor: `hsl(${primaryColor})` }
    : {};

  if (isLoading) return <AdminLayout><p className="text-muted-foreground">Loading...</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <h2 className="font-display text-2xl font-bold">Site Settings</h2>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Logo Text</Label>
              <Input
                value={logoText}
                onChange={(e) => setLogoText(e.target.value)}
                placeholder="aronbd.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Displayed as the site logo in the header
              </p>
            </div>

            <div>
              <Label>Primary Color (HSL)</Label>
              <div className="flex items-center gap-3">
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="0 0% 12%"
                  className="flex-1"
                />
                <div
                  className="w-10 h-10 rounded border shrink-0"
                  style={previewStyle}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                HSL format without parentheses, e.g. "220 70% 50%" for blue
              </p>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Color Presets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Dark", value: "0 0% 12%" },
                { label: "Blue", value: "220 70% 50%" },
                { label: "Green", value: "142 71% 35%" },
                { label: "Red", value: "0 72% 51%" },
                { label: "Purple", value: "262 83% 58%" },
                { label: "Orange", value: "25 95% 53%" },
                { label: "Teal", value: "174 60% 40%" },
                { label: "Slate", value: "215 20% 35%" },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setPrimaryColor(preset.value)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-full border"
                    style={{ backgroundColor: `hsl(${preset.value})` }}
                  />
                  <span className="text-xs font-medium">{preset.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
