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
import { Trash2, UserPlus, Palette, Globe, Phone, Image } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import TrackingSettings from "@/components/admin/TrackingSettings";

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

const upsertSetting = async (key: string, value: string) => {
  // Try update first, then insert if no rows matched
  const { data, error } = await supabase
    .from("site_settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    const { error: insertErr } = await supabase
      .from("site_settings")
      .insert({ key, value });
    if (insertErr) throw insertErr;
  }
};

const AdminSettings = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const { data: adminUsers = [], refetch: refetchUsers } = useAdminUsers();
  const queryClient = useQueryClient();

  // Branding
  const [logoText, setLogoText] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [headerBgColor, setHeaderBgColor] = useState("");
  const [footerBgColor, setFooterBgColor] = useState("");
  const [headerLogoUrl, setHeaderLogoUrl] = useState("");

  // Social
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");

  // Contact
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactAddress, setContactAddress] = useState("");

  // Admin management
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<string>("admin");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setLogoText(settings.logo_text || "aronbd.com");
      setPrimaryColor(settings.primary_color || "0 0% 12%");
      setHeaderBgColor(settings.header_bg_color || "0 0% 100%");
      setFooterBgColor(settings.footer_bg_color || "0 0% 96%");
      setHeaderLogoUrl(settings.header_logo_url || "");
      setFacebookUrl(settings.facebook_url || "");
      setInstagramUrl(settings.instagram_url || "");
      setTwitterUrl(settings.twitter_url || "");
      setYoutubeUrl(settings.youtube_url || "");
      setTiktokUrl(settings.tiktok_url || "");
      setContactPhone(settings.contact_phone || "");
      setContactEmail(settings.contact_email || "");
      setContactAddress(settings.contact_address || "");
    }
  }, [settings]);

  const handleSave = async (section: string, updates: { key: string; value: string }[]) => {
    setSaving(true);
    try {
      for (const u of updates) {
        await upsertSetting(u.key, u.value.trim());
      }
      toast.success(`${section} saved! Refresh to see changes.`);
      queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`);
    }
    setSaving(false);
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    setAddingAdmin(true);

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

  if (isLoading) return <AdminLayout><p className="text-muted-foreground">Loading...</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <h2 className="font-display text-2xl font-bold">Site Settings</h2>

        {/* Branding & Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Palette className="h-5 w-5" /> Branding & Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Logo Text</Label>
              <Input value={logoText} onChange={(e) => setLogoText(e.target.value)} placeholder="aronbd.com" />
            </div>
            <div>
              <Label>Header Logo Image URL</Label>
              <Input value={headerLogoUrl} onChange={(e) => setHeaderLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
              <p className="text-xs text-muted-foreground mt-1">If set, this image replaces the text logo in the header</p>
              {headerLogoUrl && (
                <img src={headerLogoUrl} alt="Preview" className="h-10 mt-2 object-contain border rounded p-1" />
              )}
            </div>
            <div>
              <Label>Primary Color (HSL)</Label>
              <div className="flex items-center gap-3">
                <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} placeholder="0 0% 12%" className="flex-1" />
                <div className="w-10 h-10 rounded border shrink-0" style={{ backgroundColor: `hsl(${primaryColor})` }} />
              </div>
            </div>
            <div>
              <Label>Header Background Color (HSL)</Label>
              <div className="flex items-center gap-3">
                <Input value={headerBgColor} onChange={(e) => setHeaderBgColor(e.target.value)} placeholder="0 0% 100%" className="flex-1" />
                <div className="w-10 h-10 rounded border shrink-0" style={{ backgroundColor: `hsl(${headerBgColor})` }} />
              </div>
            </div>
            <div>
              <Label>Footer Background Color (HSL)</Label>
              <div className="flex items-center gap-3">
                <Input value={footerBgColor} onChange={(e) => setFooterBgColor(e.target.value)} placeholder="0 0% 96%" className="flex-1" />
                <div className="w-10 h-10 rounded border shrink-0" style={{ backgroundColor: `hsl(${footerBgColor})` }} />
              </div>
            </div>

            {/* Color presets */}
            <div>
              <Label className="mb-2 block">Color Presets (Primary)</Label>
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
            </div>

            <Button
              onClick={() =>
                handleSave("Branding", [
                  { key: "logo_text", value: logoText },
                  { key: "primary_color", value: primaryColor },
                  { key: "header_bg_color", value: headerBgColor },
                  { key: "footer_bg_color", value: footerBgColor },
                  { key: "header_logo_url", value: headerLogoUrl },
                ])
              }
              disabled={saving}
              className="w-full"
            >
              {saving ? "Saving..." : "Save Branding"}
            </Button>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5" /> Social Media Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Facebook URL</Label>
              <Input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/yourpage" />
            </div>
            <div>
              <Label>Instagram URL</Label>
              <Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/yourpage" />
            </div>
            <div>
              <Label>Twitter / X URL</Label>
              <Input value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="https://twitter.com/yourhandle" />
            </div>
            <div>
              <Label>YouTube URL</Label>
              <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/yourchannel" />
            </div>
            <div>
              <Label>TikTok URL</Label>
              <Input value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} placeholder="https://tiktok.com/@yourhandle" />
            </div>
            <Button
              onClick={() =>
                handleSave("Social Media", [
                  { key: "facebook_url", value: facebookUrl },
                  { key: "instagram_url", value: instagramUrl },
                  { key: "twitter_url", value: twitterUrl },
                  { key: "youtube_url", value: youtubeUrl },
                  { key: "tiktok_url", value: tiktokUrl },
                ])
              }
              disabled={saving}
              className="w-full"
            >
              {saving ? "Saving..." : "Save Social Links"}
            </Button>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Phone className="h-5 w-5" /> Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Phone Number</Label>
              <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+880 1234-567890" />
            </div>
            <div>
              <Label>Email Address</Label>
              <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="support@aronbd.com" />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} placeholder="Dhaka, Bangladesh" />
            </div>
            <Button
              onClick={() =>
                handleSave("Contact Info", [
                  { key: "contact_phone", value: contactPhone },
                  { key: "contact_email", value: contactEmail },
                  { key: "contact_address", value: contactAddress },
                ])
              }
              disabled={saving}
              className="w-full"
            >
              {saving ? "Saving..." : "Save Contact Info"}
            </Button>
          </CardContent>
        </Card>

        {/* Admin User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><UserPlus className="h-5 w-5" /> Admin & Role Management</CardTitle>
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

        {/* Tracking Codes */}
        <TrackingSettings settings={settings} saving={saving} onSave={handleSave} />
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
