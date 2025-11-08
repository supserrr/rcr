import { streamText, UIMessage, convertToModelMessages } from 'ai';

/**
 * API route for AI chat functionality.
 *
 * This endpoint handles chat requests and streams AI responses back to the client.
 * It supports multiple models and optional web search capabilities.
 * Can use Assistant UI Cloud API if configured, otherwise falls back to local AI SDK.
 *
 * @param req - The incoming request containing messages, model selection, and options
 * @returns Streamed UI message response with sources and reasoning
 */
export async function POST(req: Request) {
  const {
    messages,
    model,
    webSearch,
  }: { 
    messages: UIMessage[]; 
    model: string; 
    webSearch: boolean;
  } = await req.json();

  // Check if Assistant UI Cloud API is configured
  const assistantApiUrl = process.env.NEXT_PUBLIC_ASSISTANT_API_URL;
  const assistantApiKey = process.env.ASSISTANT_API_KEY;
  
  if (assistantApiUrl) {
    // Use Assistant UI Cloud API
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add API key if provided
      if (assistantApiKey) {
        headers['Authorization'] = `Bearer ${assistantApiKey}`;
      }
      
      const response = await fetch(`${assistantApiUrl}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: convertToModelMessages(messages),
          model: webSearch ? 'perplexity/sonar' : model,
          webSearch,
        }),
      });

      if (!response.ok) {
        throw new Error(`Assistant API error: ${response.statusText}`);
      }

      // Return the streamed response
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (error) {
      console.error('Assistant UI Cloud API error:', error);
      // Fall through to local AI SDK
    }
  }

  const fallbackApiKey =
    process.env.ASSISTANT_API_KEY || process.env.AI_GATEWAY_API_KEY;
  const fallbackBaseUrl =
    process.env.AI_GATEWAY_URL || process.env.ASSISTANT_API_BASE_URL;

  if (!fallbackApiKey) {
    console.error(
      'AI Gateway authentication failed: Missing ASSISTANT_API_KEY or AI_GATEWAY_API_KEY environment variable.',
    );
    return new Response(
      JSON.stringify({
        error:
          'AI assistant is not configured. Please provide ASSISTANT_API_KEY (or AI_GATEWAY_API_KEY) on the server.',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = fallbackApiKey;
  }
  if (fallbackBaseUrl) {
    process.env.OPENAI_BASE_URL = fallbackBaseUrl;
  }

  const result = streamText({
    model: webSearch ? 'perplexity/sonar' : model,
    messages: convertToModelMessages(messages),
    system:
      'You are a helpful assistant that can answer questions and help with tasks',
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

