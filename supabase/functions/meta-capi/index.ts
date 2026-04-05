import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { event_name, event_id, source_url, action_source, event_time, user_data, custom_data } = body;

    if (!event_name || !event_id) {
      return new Response(JSON.stringify({ error: "event_name and event_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get pixel ID and access token from site_settings
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: settings } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["meta_pixel_id", "meta_access_token"]);

    const settingsMap: Record<string, string> = {};
    (settings || []).forEach((s: any) => { settingsMap[s.key] = s.value; });

    const pixelId = settingsMap.meta_pixel_id;
    const accessToken = settingsMap.meta_access_token;

    if (!pixelId || !accessToken) {
      return new Response(JSON.stringify({ error: "Meta Pixel ID or Access Token not configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Hash user data (Meta requires SHA256 hashing)
    const hashValue = async (val: string | undefined) => {
      if (!val) return undefined;
      const encoder = new TextEncoder();
      const data = encoder.encode(val.trim().toLowerCase());
      const hash = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
    };

    const hashedUserData: Record<string, any> = {};
    if (user_data?.em) hashedUserData.em = [await hashValue(user_data.em)];
    if (user_data?.ph) hashedUserData.ph = [await hashValue(user_data.ph)];
    if (user_data?.fn) hashedUserData.fn = [await hashValue(user_data.fn)];

    const eventPayload = {
      data: [
        {
          event_name,
          event_time: event_time || Math.floor(Date.now() / 1000),
          event_id, // For deduplication with browser pixel
          action_source: action_source || "website",
          event_source_url: source_url,
          user_data: hashedUserData,
          custom_data,
        },
      ],
    };

    // Send to Meta Conversions API
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventPayload),
      }
    );

    const result = await response.json();

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
