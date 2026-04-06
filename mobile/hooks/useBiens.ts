// hooks/useBiens.ts
import { useQuery } from "@tanstack/react-query";
import { bienApi } from "../lib/api";

export interface BienFilters {
  type?: string;
  quartier?: string;
  prixMin?: number;
  prixMax?: number;
  meuble?: boolean;
  chambres?: number;
  search?: string;
}

export default function useBiens(filters: BienFilters = {}) {
  return useQuery({
    queryKey: ["biens", filters],
    queryFn: () => bienApi.search(filters),
    staleTime: 2 * 60 * 1000,
  });
}
