import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { audioContent, languageCode = "en-IN", mimeType = "audio/m4a" } = await req.json();

    if (!audioContent) {
      return new Response(
        JSON.stringify({ error: "Audio content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sarvamApiKey = Deno.env.get("SARVAM_API_KEY");
    if (!sarvamApiKey) {
      return new Response(
        JSON.stringify({ error: "Sarvam API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioBlob = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0));
    
    const formData = new FormData();
    formData.append("file", new Blob([audioBlob], { type: mimeType }), "audio.m4a");
    formData.append("language_code", languageCode);
    formData.append("model", "saarika:v2");

    console.log("[sarvam-stt] Calling Sarvam STT API with language:", languageCode);

    const response = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": sarvamApiKey,
      },
      body: formData,
    });

    const data = await response.json();
    console.log("[sarvam-stt] Sarvam response:", JSON.stringify(data));

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.message || "Failed to transcribe audio" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        transcript: data.transcript || "",
        languageCode: data.language_code || languageCode,
        confidence: data.confidence || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[sarvam-stt] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
