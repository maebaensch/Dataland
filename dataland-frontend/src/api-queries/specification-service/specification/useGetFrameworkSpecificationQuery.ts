import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useQuery, type UseQueryOptions, type UseQueryReturnType } from '@tanstack/vue-query';
import type { FrameworkSpecification } from '@clients/specificationservice';
import { useApiClient } from '@/utils/useApiClient';
import { specificationKeys } from '@/api-queries/specification-service/specification/specificationKeys';

/** Fetches a framework specification by ID; disabled until an ID is provided. */
export function useGetFrameworkSpecificationQuery(
  params: { id: MaybeRefOrGetter<string | undefined> },
  options: Omit<UseQueryOptions<FrameworkSpecification, Error>, 'queryKey' | 'queryFn'> = {}
): UseQueryReturnType<FrameworkSpecification, Error> {
  const client = useApiClient();
  return useQuery<FrameworkSpecification, Error>({
    queryKey: computed(() => specificationKeys.framework(toValue(params.id))),
    queryFn: async () => {
      const id = toValue(params.id);
      if (!id) throw new Error('Framework specification ID is required');
      return (await client.apiClients.specificationController.getFrameworkSpecification(id)).data;
    },
    enabled: computed(() => !!toValue(params.id)),
    ...options,
  });
}
