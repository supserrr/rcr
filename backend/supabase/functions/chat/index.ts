/**
 * Chat Edge Function
 * 
 * Handles chat endpoints:
 * - GET / - List chats for user
 * - POST / - Create a new chat
 * - GET /:id - Get chat by ID
 * - GET /:id/messages - Get messages for a chat
 * - POST /:id/messages - Send a message to a chat
 * - POST /:id/messages/read - Mark messages as read
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';
import { corsResponse, handleCorsPreflight } from '../_shared/cors.ts';
import { requireAuth } from '../_shared/auth.ts';
import { successResponse, errorResponse } from '../_shared/types.ts';

/**
 * Create a new chat
 */
async function handleCreateChat(request: Request): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { participantId } = body;

    if (!participantId) {
      return corsResponse(
        JSON.stringify(errorResponse('Missing required fields', 'Participant ID is required')),
        { status: 400 },
        request
      );
    }

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    // Check if chat already exists
    const { data: existingChats } = await supabase
      .from('chats')
      .select('*')
      .filter('participants', 'cs', `{${user.id},${participantId}}`)
      .limit(1);

    if (existingChats && existingChats.length > 0) {
      const chat = existingChats[0];
      return corsResponse(
        JSON.stringify(successResponse({
          id: chat.id,
          participants: chat.participants || [user.id, participantId],
          unreadCount: 0,
          createdAt: chat.created_at || new Date().toISOString(),
          updatedAt: chat.updated_at || new Date().toISOString(),
        })),
        { status: 200 },
        request
      );
    }

    // Create new chat
    const chatData = {
      participants: [user.id, participantId],
    };

    const { data: chat, error } = await supabase
      .from('chats')
      .insert(chatData)
      .select()
      .single();

    if (error) {
      console.error('Create chat error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to create chat', error.message)),
        { status: 500 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse({
        id: chat.id,
        participants: chat.participants || [user.id, participantId],
        unreadCount: 0,
        createdAt: chat.created_at || new Date().toISOString(),
        updatedAt: chat.updated_at || new Date().toISOString(),
      })),
      { status: 201 },
      request
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request
    );
  }
}

/**
 * Get chat by ID
 */
async function handleGetChat(request: Request, chatId: string): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    const { data: chat, error } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();

    if (error || !chat) {
      return corsResponse(
        JSON.stringify(errorResponse('Chat not found', error?.message || 'Chat does not exist')),
        { status: 404 },
        request
      );
    }

    if (!chat.participants?.includes(user.id)) {
      return corsResponse(
        JSON.stringify(errorResponse('Access denied', 'You do not have access to this chat')),
        { status: 403 },
        request
      );
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('chat_id', chatId)
      .eq('receiver_id', user.id)
      .eq('is_read', false);

    // Get last message
    const { data: lastMessageData } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return corsResponse(
      JSON.stringify(successResponse({
        id: chat.id,
        participants: chat.participants || [],
        lastMessage: lastMessageData ? {
          id: lastMessageData.id,
          chatId: lastMessageData.chat_id,
          senderId: lastMessageData.sender_id,
          receiverId: lastMessageData.receiver_id,
          content: lastMessageData.content,
          type: lastMessageData.type,
          fileUrl: lastMessageData.file_url,
          isRead: lastMessageData.is_read,
          timestamp: lastMessageData.created_at,
          createdAt: lastMessageData.created_at,
        } : undefined,
        unreadCount: unreadCount || 0,
        createdAt: chat.created_at || new Date().toISOString(),
        updatedAt: chat.updated_at || new Date().toISOString(),
      })),
      { status: 200 },
      request
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request
    );
  }
}

/**
 * List chats for user
 */
async function handleListChats(request: Request): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const url = new URL(request.url);
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    let query = supabase
      .from('chats')
      .select('*')
      .filter('participants', 'cs', `{${user.id}}`);

    const participantId = url.searchParams.get('participantId');
    if (participantId) {
      query = query.filter('participants', 'cs', `{${participantId}}`);
    }

    const limit = url.searchParams.get('limit');
    const offset = url.searchParams.get('offset');

    if (limit) {
      query = query.limit(Number(limit));
    }

    if (offset) {
      query = query.range(Number(offset), Number(offset) + (limit ? Number(limit) : 10) - 1);
    }

    const { data: chats, error } = await query;

    if (error) {
      console.error('List chats error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to list chats', error.message)),
        { status: 500 },
        request
      );
    }

    // Get unread counts and last messages for each chat
    const chatsWithDetails = await Promise.all(
      (chats || []).map(async (chat) => {
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chat.id)
          .eq('receiver_id', user.id)
          .eq('is_read', false);

        const { data: lastMessageData } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          id: chat.id,
          participants: chat.participants || [],
          lastMessage: lastMessageData ? {
            id: lastMessageData.id,
            chatId: lastMessageData.chat_id,
            senderId: lastMessageData.sender_id,
            receiverId: lastMessageData.receiver_id,
            content: lastMessageData.content,
            type: lastMessageData.type,
            fileUrl: lastMessageData.file_url,
            isRead: lastMessageData.is_read,
            timestamp: lastMessageData.created_at,
            createdAt: lastMessageData.created_at,
          } : undefined,
          unreadCount: unreadCount || 0,
          createdAt: chat.created_at || new Date().toISOString(),
          updatedAt: chat.updated_at || new Date().toISOString(),
        };
      })
    );

    return corsResponse(
      JSON.stringify(successResponse({ chats: chatsWithDetails, total: chatsWithDetails.length, count: chatsWithDetails.length, limit: limit ? Number(limit) : 10, offset: offset ? Number(offset) : 0 })),
      { status: 200 },
      request
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request
    );
  }
}

/**
 * Send a message
 */
async function handleSendMessage(request: Request, chatId: string): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { content, type, fileUrl } = body;

    if (!content) {
      return corsResponse(
        JSON.stringify(errorResponse('Missing required fields', 'Content is required')),
        { status: 400 },
        request
      );
    }

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    // Verify user has access to this chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();

    if (chatError || !chat) {
      return corsResponse(
        JSON.stringify(errorResponse('Chat not found', chatError?.message || 'Chat does not exist')),
        { status: 404 },
        request
      );
    }

    if (!chat.participants?.includes(user.id)) {
      return corsResponse(
        JSON.stringify(errorResponse('Access denied', 'You do not have access to this chat')),
        { status: 403 },
        request
      );
    }

    // Get receiver ID (the other participant)
    const receiverId = chat.participants.find((id: string) => id !== user.id);

    if (!receiverId) {
      return corsResponse(
        JSON.stringify(errorResponse('Invalid chat', 'Chat must have exactly two participants')),
        { status: 400 },
        request
      );
    }

    // Create message
    const messageData = {
      chat_id: chatId,
      sender_id: user.id,
      receiver_id: receiverId,
      content,
      type: (type as 'text' | 'image' | 'file') || 'text',
      file_url: fileUrl || null,
      is_read: false,
    };

    const { data: message, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error('Send message error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to send message', error.message)),
        { status: 500 },
        request
      );
    }

    // Update chat updated_at
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);

    return corsResponse(
      JSON.stringify(successResponse({
        id: message.id,
        chatId: message.chat_id,
        senderId: message.sender_id,
        receiverId: message.receiver_id,
        content: message.content,
        type: message.type,
        fileUrl: message.file_url,
        isRead: message.is_read,
        timestamp: message.created_at,
        createdAt: message.created_at,
      })),
      { status: 201 },
      request
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request
    );
  }
}

/**
 * Get messages for a chat
 */
async function handleGetMessages(request: Request, chatId: string): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const url = new URL(request.url);
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    // Verify user has access to this chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();

    if (chatError || !chat) {
      return corsResponse(
        JSON.stringify(errorResponse('Chat not found', chatError?.message || 'Chat does not exist')),
        { status: 404 },
        request
      );
    }

    if (!chat.participants?.includes(user.id)) {
      return corsResponse(
        JSON.stringify(errorResponse('Access denied', 'You do not have access to this chat')),
        { status: 403 },
        request
      );
    }

    let query = supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false });

    const limit = url.searchParams.get('limit');
    const before = url.searchParams.get('before');
    const after = url.searchParams.get('after');

    if (limit) {
      query = query.limit(Number(limit));
    }

    if (before) {
      query = query.lt('created_at', before);
    }

    if (after) {
      query = query.gt('created_at', after);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('Get messages error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to get messages', error.message)),
        { status: 500 },
        request
      );
    }

    const formattedMessages = (messages || []).map((message) => ({
      id: message.id,
      chatId: message.chat_id,
      senderId: message.sender_id,
      receiverId: message.receiver_id,
      content: message.content,
      type: message.type,
      fileUrl: message.file_url,
      isRead: message.is_read,
      timestamp: message.created_at,
      createdAt: message.created_at,
    }));

    return corsResponse(
      JSON.stringify(successResponse({ messages: formattedMessages, total: formattedMessages.length, count: formattedMessages.length, hasMore: false })),
      { status: 200 },
      request
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request
    );
  }
}

/**
 * Mark messages as read
 */
async function handleMarkMessagesRead(request: Request, chatId: string): Promise<Response> {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { messageIds } = body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return corsResponse(
        JSON.stringify(errorResponse('Missing required fields', 'Message IDs are required')),
        { status: 400 },
        request
      );
    }

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const supabase = getSupabaseClient(token);

    // Verify user has access to this chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();

    if (chatError || !chat) {
      return corsResponse(
        JSON.stringify(errorResponse('Chat not found', chatError?.message || 'Chat does not exist')),
        { status: 404 },
        request
      );
    }

    if (!chat.participants?.includes(user.id)) {
      return corsResponse(
        JSON.stringify(errorResponse('Access denied', 'You do not have access to this chat')),
        { status: 403 },
        request
      );
    }

    // Mark messages as read
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', messageIds)
      .eq('receiver_id', user.id);

    if (error) {
      console.error('Mark messages read error:', error);
      return corsResponse(
        JSON.stringify(errorResponse('Failed to mark messages as read', error.message)),
        { status: 500 },
        request
      );
    }

    return corsResponse(
      JSON.stringify(successResponse(null, 'Messages marked as read')),
      { status: 200 },
      request
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify(errorResponse('Authentication required', error instanceof Error ? error.message : 'Unknown error')),
      { status: 401 },
      request
    );
  }
}

/**
 * Main handler
 */
serve(async (request: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflight(request);
  if (corsResponse) {
    return corsResponse;
  }

  const url = new URL(request.url);
  const path = url.pathname.replace('/chat', '') || '/';
  const method = request.method;

  try {
    // Extract chat ID and action from path
    const pathParts = path.split('/').filter(Boolean);
    const chatId = pathParts.length > 0 && pathParts[0] !== '' ? pathParts[0] : null;
    const action = pathParts.length > 1 ? pathParts[1] : null;
    const subAction = pathParts.length > 2 ? pathParts[2] : null;

    // Route handling
    if (method === 'GET' && path === '/') {
      return await handleListChats(request);
    }

    if (method === 'POST' && path === '/') {
      return await handleCreateChat(request);
    }

    if (method === 'GET' && chatId && !action) {
      return await handleGetChat(request, chatId);
    }

    if (method === 'GET' && chatId && action === 'messages' && !subAction) {
      return await handleGetMessages(request, chatId);
    }

    if (method === 'POST' && chatId && action === 'messages' && !subAction) {
      return await handleSendMessage(request, chatId);
    }

    if (method === 'POST' && chatId && action === 'messages' && subAction === 'read') {
      return await handleMarkMessagesRead(request, chatId);
    }

    // 404 for unknown routes
    return corsResponse(
      JSON.stringify(errorResponse('Not found', 'The requested endpoint does not exist')),
      { status: 404 },
      request
    );
  } catch (error) {
    console.error('Request error:', error);
    return corsResponse(
      JSON.stringify(errorResponse('Internal server error', error instanceof Error ? error.message : 'Unknown error')),
      { status: 500 },
      request
    );
  }
});

