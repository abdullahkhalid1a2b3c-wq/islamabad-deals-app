import { env } from '../../lib/env';
import { DealsService, RestaurantsService, CategoriesService, AreasService } from './types';
import { mockDealsService } from '../mock/mockDealsService';
import { mockRestaurantsService } from '../mock/mockRestaurantsService';
import { mockCategoriesService } from '../mock/mockCategoriesService';
import { mockAreasService } from '../mock/mockAreasService';

const useMocks = env.EXPO_PUBLIC_USE_MOCKS ?? true;

export const dealsService: DealsService = useMocks ? mockDealsService : mockDealsService;
export const restaurantsService: RestaurantsService = useMocks
  ? mockRestaurantsService
  : mockRestaurantsService;
export const categoriesService: CategoriesService = useMocks
  ? mockCategoriesService
  : mockCategoriesService;
export const areasService: AreasService = useMocks ? mockAreasService : mockAreasService;

export * from './types';
