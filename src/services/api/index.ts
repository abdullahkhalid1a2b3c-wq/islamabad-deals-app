import { env } from '../../lib/env';
import { DealsService, RestaurantsService, CategoriesService, AreasService } from './types';
import { mockDealsService } from '../mock/mockDealsService';
import { mockRestaurantsService } from '../mock/mockRestaurantsService';
import { mockCategoriesService } from '../mock/mockCategoriesService';
import { mockAreasService } from '../mock/mockAreasService';
import { supabaseDealsService } from '../supabase/supabaseDealsService';
import { supabaseRestaurantsService } from '../supabase/supabaseRestaurantsService';
import { supabaseCategoriesService } from '../supabase/supabaseCategoriesService';
import { supabaseAreasService } from '../supabase/supabaseAreasService';

// Default to real Supabase services unless EXPO_PUBLIC_USE_MOCKS is explicitly true
const useMocks = env.EXPO_PUBLIC_USE_MOCKS === true;

export const dealsService: DealsService = useMocks ? mockDealsService : supabaseDealsService;
export const restaurantsService: RestaurantsService = useMocks
  ? mockRestaurantsService
  : supabaseRestaurantsService;
export const categoriesService: CategoriesService = useMocks
  ? mockCategoriesService
  : supabaseCategoriesService;
export const areasService: AreasService = useMocks ? mockAreasService : supabaseAreasService;

export * from './types';
