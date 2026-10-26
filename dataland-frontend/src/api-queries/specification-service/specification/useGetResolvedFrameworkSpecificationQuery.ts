import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useQuery, type UseQueryOptions, type UseQueryReturnType } from '@tanstack/vue-query';
import type { DataPointBaseTypeResolvedSchema } from '@clients/specificationservice';
import { useApiClient } from '@/utils/useApiClient';
import { specificationKeys } from '@/api-queries/specification-service/specification/specificationKeys';

/** Fetches a framework's resolved schema by ID; disabled until an ID is provided. */
export function useGetResolvedFrameworkSpecificationQuery(
  params: { id: MaybeRefOrGetter<string | undefined> },
  options: Omit<UseQueryOptions<DataPointBaseTypeResolvedSchema, Error>, 'queryKey' | 'queryFn'> = {}
): UseQueryReturnType<DataPointBaseTypeResolvedSchema, Error> {
  const client = useApiClient();
  return useQuery<DataPointBaseTypeResolvedSchema, Error>({
    queryKey: computed(() => specificationKeys.resolvedSchema(toValue(params.id))),
    queryFn: async () => {
      const id = toValue(params.id);
      if (!id) throw new Error('Framework specification ID is required');
      return (await client.apiClients.specificationController.getResolvedFrameworkSpecification(id)).data;
    },
    enabled: computed(() => !!toValue(params.id)),
    ...options,
  });
}
