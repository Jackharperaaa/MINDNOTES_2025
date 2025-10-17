import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const openRouterApiKey = Deno.env.get('API_MINDNOTE');
    console.log("Edge Function: Attempting to get API_MINDNOTE secret."); // Log para depuração
    if (!openRouterApiKey) {
      console.error("Edge Function Error: API_MINDNOTE secret not found."); // Log para depuração
      return new Response(JSON.stringify({ error: "O secret 'API_MINDNOTE' não foi encontrado. Verifique se ele foi criado corretamente no painel da Supabase." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    console.log("Edge Function: API_MINDNOTE secret found."); // Log para depuração

    const { messages } = await req.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mindnotes.app",
        "X-Title": "Mind Notes",
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-chat-v3.1:free",
        "messages": messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Edge Function Error: OpenRouter API returned status ${response.status}. Response: ${errorText}`); // Log para depuração
      if (response.status === 401) {
        return new Response(JSON.stringify({ error: "A chave de API fornecida no secret 'API_MINDNOTE' é inválida ou foi revogada. Por favor, verifique o valor no painel da Supabase." }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401, // Retorna 401 para o cliente para tratamento específico
        });
      }
      return new Response(JSON.stringify({ error: `Erro na API do OpenRouter: ${response.status} - ${errorText}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status, // Passa o código de status real
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Edge Function Catch Error:", error); // Log para depuração
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});