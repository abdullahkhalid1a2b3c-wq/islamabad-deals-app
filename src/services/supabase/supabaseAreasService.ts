import { AreasService } from '../api/types';
import { Area } from '../../types/domain';
import { supabase } from '../../lib/supabase';
import { toAppError } from '../../lib/errors';

export const supabaseAreasService: AreasService = {
  async getAreas(): Promise<Area[]> {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      return (data || []).map((a) => ({
        id: a.id,
        name: a.name,
        city: 'Islamabad',
        slug: a.slug,
      }));
    } catch (err) {
      throw toAppError(err);
    }
  },
};
