import { AreasService } from '../api/types';
import { Area } from '../../types/domain';
import { MOCK_AREAS } from './mockData';

export const mockAreasService: AreasService = {
  async getAreas(): Promise<Area[]> {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_AREAS), 300));
  },
};
