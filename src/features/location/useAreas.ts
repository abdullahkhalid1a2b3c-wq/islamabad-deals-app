import { useQuery } from '@tanstack/react-query';
import { areasService } from '../../services/api';

export function useAreas() {
  return useQuery({
    queryKey: ['areas'],
    queryFn: () => areasService.getAreas(),
    staleTime: 10 * 60 * 1000,
  });
}
