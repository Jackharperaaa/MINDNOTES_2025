import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Você é um assistente de produtividade focado em criar listas de tarefas. Responda em português do Brasil. Sua resposta deve ser APENAS no seguinte formato, sem exceções:

TITULO: [Um título curto e claro para a lista de tarefas]
TAREFAS:
1. [Primeira tarefa específica e acionável]
2. [Segunda tarefa específica e acionável]
3. [Terceira tarefa específica e acionável]
4. [E assim por diante...]

Não inclua introduções, despedidas, explicações ou qualquer outro texto fora deste formato. Crie no máximo 8 tarefas.`;

serve(async (req) => {
  // Trata a requisição pre-flight de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // FORÇANDO O USO DE UM NOVO SEGREDO PARA GARANTIR A ATUALIZAÇÃO
    const geminiApiKey = Deno.env.get('API_MIND_V2');
    if (!geminiApiKey || geminiApiKey.trim() === '') {
      console.error("Edge Function Error (500): Secret 'API_MIND_V2' não encontrado ou vazio.");
      return new Response(JSON.stringify({ error: "O secret 'API_MIND_V2' com a chave da API do Gemini não foi configurado corretamente." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const { user_message } = await req.json();
    if (!user_message) {
      console.error("Edge Function Error (400): Parâmetro 'user_message' ausente.");
      return new Response(JSON.stringify({ error: "O parâmetro 'user_message' é obrigatório." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: SYSTEM_PROMPT },
            { text: `Usuário: ${user_message}` }
          ]
        }
      ]
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error(`Erro da API do Gemini (${response.status}):`, errorBody);
      return new Response(JSON.stringify({ error: `Erro na API do Gemini: ${errorBody.error?.message || 'Erro desconhecido'}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      });
    }

    const data = await response.json();
    const botResponseContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível gerar uma resposta.";

    return new Response(JSON.stringify({ response: botResponseContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Erro inesperado na Edge Function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});