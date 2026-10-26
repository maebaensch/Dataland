import { useQuery, type UseQueryOptions, type UseQueryReturnType } from '@tanstack/vue-query';
import type { SimpleFrameworkSpecification } from '@clients/specificationservice';
import { useApiClient } from '@/utils/useApiClient';
import { specificationKeys } from '@/api-queries/specification-service/specification/specificationKeys';

/** Fetches the framework specification catalog. */
export function useListFrameworkSpecificationsQuery(
  options: Omit<UseQueryOptions<SimpleFrameworkSpecification[], Error>, 'queryKey' | 'queryFn'> = {}
): UseQueryReturnType<SimpleFrameworkSpecification[], Error> {
  const client = useApiClient();
  return useQuery<SimpleFrameworkSpecification[], Error>({
    queryKey: specificationKeys.list(),
    queryFn: async () => (await client.apiClients.specificationController.listFrameworkSpecifications()).data,
    ...options,
  });
}
