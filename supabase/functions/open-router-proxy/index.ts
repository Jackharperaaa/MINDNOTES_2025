import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Define os cabeçalhos CORS para permitir que seu aplicativo chame esta função
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Responde a solicitações de preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Pega a chave da API do secret 'API_MINDNOTE' que você criou
    const openRouterApiKey = Deno.env.get('API_MINDNOTE');
    if (!openRouterApiKey) {
      throw new Error("O secret 'API_MINDNOTE' não foi encontrado. Verifique se ele foi criado corretamente no painel da Supabase.");
    }

    // Pega as mensagens do corpo da requisição do frontend
    const { messages } = await req.json();

    // Faz a chamada para a API do OpenRouter a partir do servidor
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mindnotes.app", // Opcional, mas bom ter
        "X-Title": "Mind Notes", // Opcional, mas bom ter
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-chat-v3.1:free",
        "messages": messages
      })
    });

    // Verifica se a chamada para a API foi bem-sucedida
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API do OpenRouter: ${response.status} ${errorText}`);
    }

    // Retorna a resposta do OpenRouter para o frontend
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // Retorna uma mensagem de erro se algo der errado
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});