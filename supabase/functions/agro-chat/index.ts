import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a senior agronomist AI advisor for the AgriSync platform. Your role is to provide precise, actionable agricultural advice.

INSTRUCTIONS:
- Use the provided Field Health data (NDVI, Yield Forecast, Soil Moisture, Solar Exposure) to give context-aware recommendations.
- If any nearby pest or disease alerts are provided, WARN the user explicitly and suggest mitigation steps.
- Keep answers practical and suited for farmers in the field.
- Use bullet points and short paragraphs for readability on mobile devices.
- If you don't have enough data, ask clarifying questions about the crop, region, or season.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, fieldHealth, nearbyAlerts } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build context block
    let contextBlock = "\n\n--- CURRENT FIELD HEALTH DATA ---\n";
    if (fieldHealth) {
      contextBlock += `• NDVI Score: ${fieldHealth.ndvi} (${fieldHealth.ndvi >= 0.6 ? "Healthy" : "Needs attention"})\n`;
      contextBlock += `• Yield Forecast: ${fieldHealth.yieldForecast}\n`;
      contextBlock += `• Soil Moisture: ${fieldHealth.soilMoisture}\n`;
      contextBlock += `• Solar Exposure: ${fieldHealth.solarExposure}\n`;
    }

    if (nearbyAlerts && nearbyAlerts.length > 0) {
      contextBlock += "\n--- ⚠️ NEARBY ALERTS (within 5km) ---\n";
      for (const alert of nearbyAlerts) {
        contextBlock += `• [${alert.alert_type.toUpperCase()}] ${alert.crop_type}: ${alert.description} (${alert.distance_km.toFixed(1)}km away)\n`;
      }
    } else {
      contextBlock += "\n--- No nearby pest/disease alerts detected ---\n";
    }

    const systemMessage = SYSTEM_PROMPT + contextBlock;

    // Convert messages to multimodal format when images are present
    const formattedMessages = messages.map((msg: any) => {
      if (msg.image && msg.role === "user") {
        return {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: msg.image } },
            { type: "text", text: msg.content || "What can you tell me about this image?" },
          ],
        };
      }
      return { role: msg.role, content: msg.content };
    });

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemMessage },
            ...formattedMessages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("agro-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
