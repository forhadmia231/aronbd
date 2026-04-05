import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code, Activity } from "lucide-react";

interface TrackingSettingsProps {
  settings: Record<string, string> | undefined;
  saving: boolean;
  onSave: (section: string, updates: { key: string; value: string }[]) => Promise<void>;
}

const TrackingSettings = ({ settings, saving, onSave }: TrackingSettingsProps) => {
  const [metaPixelId, setMetaPixelId] = useState("");
  const [gtmContainerId, setGtmContainerId] = useState("");
  const [metaAccessToken, setMetaAccessToken] = useState("");

  useEffect(() => {
    if (settings) {
      setMetaPixelId(settings.meta_pixel_id || "");
      setGtmContainerId(settings.gtm_container_id || "");
      setMetaAccessToken(settings.meta_access_token || "");
    }
  }, [settings]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Code className="h-5 w-5" /> Tracking Codes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Meta Pixel ID</Label>
            <Input
              value={metaPixelId}
              onChange={(e) => setMetaPixelId(e.target.value)}
              placeholder="e.g. 1234567890123456"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Find your Pixel ID in Meta Events Manager → Data Sources
            </p>
          </div>
          <div>
            <Label>Google Tag Manager Container ID</Label>
            <Input
              value={gtmContainerId}
              onChange={(e) => setGtmContainerId(e.target.value)}
              placeholder="e.g. GTM-XXXXXXX"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Find your Container ID in GTM → Admin → Container Settings
            </p>
          </div>
          <Button
            onClick={() =>
              onSave("Tracking Codes", [
                { key: "meta_pixel_id", value: metaPixelId },
                { key: "gtm_container_id", value: gtmContainerId },
              ])
            }
            disabled={saving}
            className="w-full"
          >
            {saving ? "Saving..." : "Save Tracking Codes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" /> Server-Side Tracking (Meta CAPI)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Meta Conversions API Access Token</Label>
            <Input
              type="password"
              value={metaAccessToken}
              onChange={(e) => setMetaAccessToken(e.target.value)}
              placeholder="Your system user access token"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Generate in Meta Business Settings → System Users → Generate Token with ads_management permission
            </p>
          </div>
          <Button
            onClick={() =>
              onSave("Server-Side Tracking", [
                { key: "meta_access_token", value: metaAccessToken },
              ])
            }
            disabled={saving}
            className="w-full"
          >
            {saving ? "Saving..." : "Save CAPI Settings"}
          </Button>
          <div className="bg-accent rounded-lg p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">How Server-Side Tracking Works:</p>
            <p>• Purchase events are sent both from the browser AND server</p>
            <p>• Event deduplication prevents double-counting using event IDs</p>
            <p>• Server events aren't blocked by ad blockers</p>
            <p>• Provides more accurate conversion data for Meta Ads</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default TrackingSettings;
