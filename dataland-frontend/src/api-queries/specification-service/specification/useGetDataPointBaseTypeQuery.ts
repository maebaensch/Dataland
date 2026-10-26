import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useQuery, type UseQueryOptions, type UseQueryReturnType } from '@tanstack/vue-query';
import type { DataPointBaseTypeSpecification } from '@clients/specificationservice';
import { useApiClient } from '@/utils/useApiClient';
import { specificationKeys } from '@/api-queries/specification-service/specification/specificationKeys';

/** Fetches a data-point base type by ID; disabled until an ID is provided. */
export function useGetDataPointBaseTypeQuery(
  params: { id: MaybeRefOrGetter<string | undefined> },
  options: Omit<UseQueryOptions<DataPointBaseTypeSpecification, Error>, 'queryKey' | 'queryFn'> = {}
): UseQueryReturnType<DataPointBaseTypeSpecification, Error> {
  const client = useApiClient();
  return useQuery<DataPointBaseTypeSpecification, Error>({
    queryKey: computed(() => specificationKeys.baseType(toValue(params.id))),
    queryFn: async () => {
      const id = toValue(params.id);
      if (!id) throw new Error('Data-point base type ID is required');
      return (await client.apiClients.specificationController.getDataPointBaseType(id)).data;
    },
    enabled: computed(() => !!toValue(params.id)),
    ...options,
  });
}
