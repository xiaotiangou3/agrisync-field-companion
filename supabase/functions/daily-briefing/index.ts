import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { weather, fieldHealth, todayAlerts, todaySchedule } = context;

    const systemPrompt = `You are an agricultural briefing assistant. Generate a concise daily briefing for a farmer in 4-6 sentences max. Cover:
1. Today's weather summary (temperature, humidity, rainfall risk)
2. Field health status (NDVI, soil moisture)
3. Any active pest/disease/weather alerts nearby
4. Today's scheduled farm tasks

Be specific with numbers. Use bold for key values. Keep it actionable and friendly. No greetings or sign-offs. Use bullet points only if listing tasks.`;

    const userMessage = `Generate today's farm briefing using this data:

**Weather today:** Max ${weather?.tempMax ?? "N/A"}°C, Min ${weather?.tempMin ?? "N/A"}°C, Humidity ${weather?.humidity ?? "N/A"}%, Rainfall ${weather?.rainfall ?? 0}mm

**Field health:** NDVI ${fieldHealth?.ndvi ?? "N/A"}, Soil moisture ${fieldHealth?.soilMoisture ?? "N/A"}%, Solar ${fieldHealth?.solarExposure ?? "N/A"} hrs, Predicted yield ${fieldHealth?.predictedYield ?? "N/A"} t/ha

**Nearby alerts (${todayAlerts?.length ?? 0}):** ${
      todayAlerts?.length
        ? todayAlerts.map((a: any) => `${a.alert_type} on ${a.crop_type}: ${a.description}`).join("; ")
        : "No active alerts"
    }

**Today's schedule (${todaySchedule?.length ?? 0}):** ${
      todaySchedule?.length
        ? todaySchedule.map((a: any) => `${a.time} – ${a.title}`).join("; ")
        : "No tasks scheduled"
    }`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content ?? "No briefing available.";

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-briefing error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
