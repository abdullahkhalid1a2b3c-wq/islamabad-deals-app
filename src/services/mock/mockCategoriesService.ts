import { CategoriesService } from '../api/types';
import { Category } from '../../types/domain';
import { MOCK_CATEGORIES } from './mockData';

export const mockCategoriesService: CategoriesService = {
  async getCategories(): Promise<Category[]> {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_CATEGORIES), 300));
  },
};
