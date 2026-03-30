import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSiteSettings } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const useAdminUsers = () => {
  return useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id, user_id, role");
      if (error) throw error;

      const userIds = (data || []).map((r) => r.user_id);
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const profileMap: Record<string, string> = {};
      (profiles || []).forEach((p) => {
        profileMap[p.user_id] = p.full_name || "Unknown";
      });

      return (data || []).map((r) => ({
        ...r,
        full_name: profileMap[r.user_id] || "Unknown",
      }));
    },
  });
};

const AdminSettings = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const { data: adminUsers = [], refetch: refetchUsers } = useAdminUsers();
  const queryClient = useQueryClient();
  const [logoText, setLogoText] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [saving, setSaving] = useState(false);

  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<string>("admin");
  const [addingAdmin, setAddingAdmin] = useState(false);

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

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    setAddingAdmin(true);

    // Look up user by email via profiles — we need an edge function or RPC for this
    // For now, we'll use the profiles table approach
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .limit(1000);

    if (profileError) {
      toast.error("Failed to search users");
      setAddingAdmin(false);
      return;
    }

    // We need to find by email - use edge function approach
    const { data: userData, error: userError } = await supabase.functions.invoke("find-user-by-email", {
      body: { email: newAdminEmail.trim() },
    });

    if (userError || !userData?.user_id) {
      toast.error(userData?.error || "User not found. Make sure they have signed up first.");
      setAddingAdmin(false);
      return;
    }

    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: userData.user_id, role: newAdminRole as any });

    if (roleError) {
      if (roleError.message.includes("duplicate") || roleError.message.includes("unique")) {
        toast.error("This user already has that role");
      } else {
        toast.error("Failed to assign role: " + roleError.message);
      }
      setAddingAdmin(false);
      return;
    }

    toast.success(`${newAdminRole} role assigned to ${newAdminEmail}`);
    setNewAdminEmail("");
    refetchUsers();
    setAddingAdmin(false);
  };

  const handleRemoveRole = async (roleId: string) => {
    const { error } = await supabase.functions.invoke("remove-user-role", {
      body: { role_id: roleId },
    });

    if (error) {
      toast.error("Failed to remove role");
      return;
    }

    toast.success("Role removed");
    refetchUsers();
  };

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
              <Input value={logoText} onChange={(e) => setLogoText(e.target.value)} placeholder="aronbd.com" />
              <p className="text-xs text-muted-foreground mt-1">Displayed as the site logo in the header</p>
            </div>
            <div>
              <Label>Primary Color (HSL)</Label>
              <div className="flex items-center gap-3">
                <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} placeholder="0 0% 12%" className="flex-1" />
                <div className="w-10 h-10 rounded border shrink-0" style={previewStyle} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">HSL format, e.g. "220 70% 50%"</p>
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
                  <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: `hsl(${preset.value})` }} />
                  <span className="text-xs font-medium">{preset.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Admin User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Admin & Role Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Add New Admin/Moderator</Label>
              <div className="flex gap-2">
                <Input
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="flex-1"
                />
                <Select value={newAdminRole} onValueChange={setNewAdminRole}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddAdmin} disabled={addingAdmin} className="gap-2">
                <UserPlus className="h-4 w-4" />
                {addingAdmin ? "Adding..." : "Add Role"}
              </Button>
              <p className="text-xs text-muted-foreground">User must have signed up first before you can assign a role.</p>
            </div>

            <div>
              <Label className="mb-2 block">Current Roles</Label>
              {adminUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No roles assigned yet.</p>
              ) : (
                <div className="space-y-2">
                  {adminUsers.map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{u.full_name}</span>
                        <Badge variant="secondary" className="text-[10px]">{u.role}</Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleRemoveRole(u.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
