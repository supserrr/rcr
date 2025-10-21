import { streamText, UIMessage, convertToModelMessages } from 'ai';

/**
 * API route for AI chat functionality.
 *
 * This endpoint handles chat requests and streams AI responses back to the client.
 * It supports multiple models and optional web search capabilities.
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

