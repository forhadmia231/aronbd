// Tracking utility for Meta Pixel, GTM, and server-side CAPI
// Uses event_id for deduplication between browser and server events

import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

interface TrackingEventData {
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
  contents?: { id: string; quantity: number; item_price?: number }[];
  num_items?: number;
  order_id?: string;
  // Customer data for server-side
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

const generateEventId = () =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Fire Meta Pixel browser event
const firePixelEvent = (eventName: string, data: TrackingEventData, eventId: string) => {
  if (typeof window.fbq === "function") {
    window.fbq("track", eventName, {
      content_name: data.content_name,
      content_ids: data.content_ids,
      content_type: data.content_type || "product",
      value: data.value,
      currency: data.currency || "BDT",
      contents: data.contents,
      num_items: data.num_items,
      order_id: data.order_id,
    }, { eventID: eventId });
  }
};

// Fire GA4 event via gtag
const fireGA4Event = (eventName: string, data: TrackingEventData) => {
  if (typeof window.gtag !== "function") return;

  // Map to GA4 ecommerce event names
  const ga4EventMap: Record<string, string> = {
    PageView: "page_view",
    ViewContent: "view_item",
    AddToCart: "add_to_cart",
    InitiateCheckout: "begin_checkout",
    Purchase: "purchase",
  };

  const ga4Event = ga4EventMap[eventName] || eventName;
  const items = (data.contents || []).map((c) => ({
    item_id: c.id,
    item_name: data.content_name || c.id,
    price: c.item_price,
    quantity: c.quantity,
  }));

  window.gtag("event", ga4Event, {
    currency: data.currency || "BDT",
    value: data.value,
    items: items.length > 0 ? items : undefined,
    transaction_id: data.order_id,
  });
};

// Push to GTM dataLayer
const pushToDataLayer = (eventName: string, data: TrackingEventData, eventId: string) => {
  if (typeof window.dataLayer !== "undefined") {
    window.dataLayer.push({
      event: eventName,
      event_id: eventId,
      ecommerce: {
        content_name: data.content_name,
        content_ids: data.content_ids,
        value: data.value,
        currency: data.currency || "BDT",
        contents: data.contents,
        num_items: data.num_items,
        order_id: data.order_id,
      },
    });
  }
};

// Send server-side event via edge function (Meta CAPI)
const sendServerEvent = async (
  eventName: string,
  data: TrackingEventData,
  eventId: string,
  sourceUrl: string
) => {
  try {
    await supabase.functions.invoke("meta-capi", {
      body: {
        event_name: eventName,
        event_id: eventId,
        source_url: sourceUrl,
        action_source: "website",
        event_time: Math.floor(Date.now() / 1000),
        user_data: {
          fn: data.customer_name,
          em: data.customer_email,
          ph: data.customer_phone,
        },
        custom_data: {
          content_name: data.content_name,
          content_ids: data.content_ids,
          content_type: data.content_type || "product",
          value: data.value,
          currency: data.currency || "BDT",
          contents: data.contents,
          num_items: data.num_items,
          order_id: data.order_id,
        },
      },
    });
  } catch (err) {
    console.warn("Server-side tracking failed:", err);
  }
};

// Main tracking function
export const trackEvent = (
  eventName: string,
  data: TrackingEventData = {},
  options: { serverSide?: boolean } = {}
) => {
  const eventId = generateEventId();
  const sourceUrl = window.location.href;

  // Browser-side
  firePixelEvent(eventName, data, eventId);
  fireGA4Event(eventName, data);
  pushToDataLayer(eventName, data, eventId);

  // Server-side (for key conversion events)
  if (options.serverSide) {
    sendServerEvent(eventName, data, eventId, sourceUrl);
  }
};

// Convenience helpers
export const trackPageView = () => trackEvent("PageView");

export const trackViewContent = (product: {
  id: string;
  name: string;
  price: number;
}) =>
  trackEvent("ViewContent", {
    content_name: product.name,
    content_ids: [product.id],
    content_type: "product",
    value: product.price,
    currency: "BDT",
  });

export const trackAddToCart = (product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
}) =>
  trackEvent("AddToCart", {
    content_name: product.name,
    content_ids: [product.id],
    content_type: "product",
    value: product.price * product.quantity,
    currency: "BDT",
    contents: [{ id: product.id, quantity: product.quantity, item_price: product.price }],
    num_items: product.quantity,
  });

export const trackInitiateCheckout = (items: {
  id: string;
  name: string;
  price: number;
  quantity: number;
}[], totalValue: number) =>
  trackEvent("InitiateCheckout", {
    content_ids: items.map((i) => i.id),
    contents: items.map((i) => ({ id: i.id, quantity: i.quantity, item_price: i.price })),
    value: totalValue,
    currency: "BDT",
    num_items: items.reduce((s, i) => s + i.quantity, 0),
  });

export const trackPurchase = (
  orderData: {
    orderId: string;
    items: { id: string; name: string; price: number; quantity: number }[];
    totalValue: number;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  }
) =>
  trackEvent(
    "Purchase",
    {
      content_ids: orderData.items.map((i) => i.id),
      contents: orderData.items.map((i) => ({ id: i.id, quantity: i.quantity, item_price: i.price })),
      value: orderData.totalValue,
      currency: "BDT",
      num_items: orderData.items.reduce((s, i) => s + i.quantity, 0),
      order_id: orderData.orderId,
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,
    },
    { serverSide: true }
  );
