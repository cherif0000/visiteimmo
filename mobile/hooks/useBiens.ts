import { useQuery } from "@tanstack/react-query";
import { bienApi } from "../lib/api";

export interface BienFilters {
  type?:     string;
  quartier?: string;
  prixMin?:  number;
  prixMax?:  number;
  meuble?:   boolean;
  chambres?: number;
  search?:   string;
}

export default function useBiens(filters: BienFilters = {}) {
  return useQuery({
    queryKey:  ["biens", filters],
    queryFn:   () => bienApi.search(filters),
    staleTime: 2 * 60 * 1000,
    retry:     1,        // 1 seul retry (défaut 3 → trop long)
    retryDelay: 1000,    // attendre 1s avant de réessayer
  });
}
