import { supabase } from '../lib/supabase';
import { EmissionScheme } from '../types/scheme';

export const schemeService = {
  async getAllSchemes(): Promise<EmissionScheme[]> {
    const { data, error } = await supabase
      .from('schemes')
      .select('*')
      .order('regulation_name');

    if (error) {
      console.error('Error fetching schemes:', error);
      throw error;
    }

    return data as EmissionScheme[];
  },

  async getSchemeById(id: string): Promise<EmissionScheme | null> {
    const { data, error } = await supabase
      .from('schemes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching scheme:', error);
      throw error;
    }

    return data as EmissionScheme | null;
  },

  async createScheme(scheme: Omit<EmissionScheme, 'created_at' | 'updated_at'>): Promise<EmissionScheme> {
    const { data, error } = await supabase
      .from('schemes')
      .insert(scheme)
      .select()
      .single();

    if (error) {
      console.error('Error creating scheme:', error);
      throw error;
    }

    return data as EmissionScheme;
  },

  async updateScheme(id: string, updates: Partial<EmissionScheme>): Promise<EmissionScheme> {
    const { data, error } = await supabase
      .from('schemes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating scheme:', error);
      throw error;
    }

    return data as EmissionScheme;
  },

  async deleteScheme(id: string): Promise<void> {
    const { error } = await supabase
      .from('schemes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting scheme:', error);
      throw error;
    }
  },

  subscribeToSchemes(callback: (schemes: EmissionScheme[]) => void) {
    const subscription = supabase
      .channel('schemes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schemes'
        },
        async () => {
          const schemes = await this.getAllSchemes();
          callback(schemes);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
};
