import { CategoriesService } from '../api/types';
import { Category } from '../../types/domain';
import { supabase } from '../../lib/supabase';
import { toAppError } from '../../lib/errors';

export const supabaseCategoriesService: CategoriesService = {
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      return (data || []).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        iconName: c.icon_name || 'restaurant',
      }));
    } catch (err) {
      throw toAppError(err);
    }
  },
};
