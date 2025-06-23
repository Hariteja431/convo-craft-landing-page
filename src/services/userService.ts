
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;
export type Conversation = Tables<'conversations'>;
export type Message = Tables<'messages'>;
export type UserPreferences = Tables<'user_preferences'>;

export class UserService {
  static async createOrUpdateProfile(clerkUserId: string, userData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  }): Promise<Profile> {
    const profileData: TablesInsert<'profiles'> = {
      clerk_user_id: clerkUserId,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      avatar_url: userData.avatarUrl,
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'clerk_user_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getProfile(clerkUserId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async createConversation(userId: string, title?: string, scenarioType?: string): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title: title || 'New Conversation',
        scenario_type: scenarioType || 'general'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async addMessage(conversationId: string, content: string, role: 'user' | 'assistant', audioUrl?: string): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        content,
        role,
        audio_url: audioUrl
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async updateUserPreferences(userId: string, preferences: Partial<TablesUpdate<'user_preferences'>>): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({ user_id: userId, ...preferences }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getConversationHistory(userId: string, limit: number = 50): Promise<{ conversation: Conversation; messages: Message[] }[]> {
    const conversations = await this.getConversations(userId);
    const conversationHistory = await Promise.all(
      conversations.slice(0, limit).map(async (conversation) => {
        const messages = await this.getMessages(conversation.id);
        return { conversation, messages };
      })
    );
    return conversationHistory;
  }
}
