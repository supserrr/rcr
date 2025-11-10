import { createClient } from '@/lib/supabase/client';

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type SupportTicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type SupportTicketCategory =
  | 'technical'
  | 'scheduling'
  | 'billing'
  | 'account'
  | 'feature'
  | 'other';

export interface SupportTicketRecord {
  id: string;
  user_id: string;
  subject: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  description: string;
  admin_notes: string | null;
  assigned_to: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketWithProfile extends SupportTicketRecord {
  profile?: {
    full_name?: string | null;
    avatar_url?: string | null;
    metadata?: Record<string, unknown> | null;
  };
}

export interface CreateSupportTicketInput {
  subject: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  description: string;
}

export interface UpdateSupportTicketInput {
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  admin_notes?: string | null;
  assigned_to?: string | null;
  resolved_at?: string | null;
}

export class SupportApi {
  static async listMyTickets(): Promise<SupportTicketRecord[]> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please try again later.');
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .select('*, profile:profiles!support_tickets_user_id_fkey(full_name, avatar_url, metadata)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message || 'Failed to load support tickets');
    }

    return (data as SupportTicketWithProfile[] | null)?.map((ticket) => ({
      ...ticket,
      profile: ticket.profile,
    })) ?? [];
  }

  static async listAllTickets(): Promise<SupportTicketWithProfile[]> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please try again later.');
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .select('*, profile:profiles!support_tickets_user_id_fkey(full_name, avatar_url, metadata)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message || 'Failed to load support tickets');
    }

    return (data as SupportTicketWithProfile[] | null)?.map((ticket) => ({
      ...ticket,
      profile: ticket.profile,
    })) ?? [];
  }

  static async createTicket(input: CreateSupportTicketInput): Promise<SupportTicketRecord> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please try again later.');
    }

    const {
      data,
      error,
    } = await supabase
      .from('support_tickets')
      .insert({
        subject: input.subject,
        category: input.category,
        priority: input.priority,
        description: input.description,
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create support ticket');
    }

    return data;
  }

  static async updateTicket(id: string, updates: UpdateSupportTicketInput): Promise<SupportTicketRecord> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please try again later.');
    }

    const {
      data,
      error,
    } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to update support ticket');
    }

    return data;
  }

  static subscribeToTickets(
    onChange: (payload: SupportTicketRecord) => void,
  ) {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please try again later.');
    }

    const channel = supabase
      .channel('support_tickets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets',
        },
        (payload) => {
          const record = payload.new as SupportTicketRecord | null;
          if (record) {
            onChange(record);
          }
        },
      )
      .subscribe();

    return channel;
  }
}

