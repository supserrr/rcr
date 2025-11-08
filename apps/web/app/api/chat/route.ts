import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { buildKnowledgeContext } from '@/lib/ai/knowledge-base';

/**
 * Extracts the textual content from a UIMessage.
 *
 * @param message - Message to extract text from.
 * @returns Plain-text representation.
 */
function extractTextFromMessage(message: UIMessage): string {
  if (!message.content) {
    return '';
  }

  return message.content
    .map((part) => {
      if (typeof part === 'string') {
        return part;
      }

      if ('text' in part && typeof part.text === 'string') {
        return part.text;
      }

      if ('value' in part && typeof part.value === 'string') {
        return part.value;
      }

      return '';
    })
    .filter(Boolean)
    .join('\n');
}

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

  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  const latestUserText = latestUserMessage ? extractTextFromMessage(latestUserMessage) : '';
  const { context: knowledgeContext } = latestUserText
    ? await buildKnowledgeContext(latestUserText)
    : { context: '' };

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

  const systemInstructions: string[] = [
    'You are the Rwanda Cancer Relief virtual assistant. You provide precise, compassionate, and actionable guidance about the Rwanda Cancer Relief platform, its features, configuration, and workflows.',
    'Use only the approved platform knowledge provided in the context below or the conversation history. If the user asks about anything that is not covered, clearly state that the information is unavailable and offer next steps or suggest where they can learn more.',
    'Cite the relevant documentation file in parentheses (for example: docs/README.md) whenever you rely on specific context sections. Keep answers concise, structured, and written in active voice.',
  ];

  if (knowledgeContext) {
    systemInstructions.push(
      'Authoritative Context:\n' +
        knowledgeContext,
    );
  }

  const result = streamText({
    model: webSearch ? 'perplexity/sonar' : model,
    messages: convertToModelMessages(messages),
    system: systemInstructions.join('\n\n'),
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

