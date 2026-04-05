import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useAdmin";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/tracking";

const TrackingScripts = () => {
  const { data: settings } = useSiteSettings();
  const location = useLocation();

  const pixelId = settings?.meta_pixel_id || "";
  const gtmId = settings?.gtm_container_id || "";

  // Inject Meta Pixel
  useEffect(() => {
    if (!pixelId) return;

    // Check if already loaded
    if (document.getElementById("meta-pixel-script")) return;

    const script = document.createElement("script");
    script.id = "meta-pixel-script";
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    // noscript fallback in body
    const noscript = document.createElement("noscript");
    noscript.id = "meta-pixel-noscript";
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
    document.body.appendChild(noscript);

    return () => {
      document.getElementById("meta-pixel-script")?.remove();
      document.getElementById("meta-pixel-noscript")?.remove();
    };
  }, [pixelId]);

  // Inject GTM
  useEffect(() => {
    if (!gtmId) return;

    if (document.getElementById("gtm-head-script")) return;

    // Head script
    const headScript = document.createElement("script");
    headScript.id = "gtm-head-script";
    headScript.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `;
    document.head.appendChild(headScript);

    // Body noscript iframe
    const noscript = document.createElement("noscript");
    noscript.id = "gtm-body-noscript";
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.prepend(noscript);

    return () => {
      document.getElementById("gtm-head-script")?.remove();
      document.getElementById("gtm-body-noscript")?.remove();
    };
  }, [gtmId]);

  // Track page views on route change
  useEffect(() => {
    trackPageView();
  }, [location.pathname]);

  return null;
};

export default TrackingScripts;
