import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useQuery, type UseQueryOptions, type UseQueryReturnType } from '@tanstack/vue-query';
import type { DataPointTypeSpecification } from '@clients/specificationservice';
import { useApiClient } from '@/utils/useApiClient';
import { specificationKeys } from '@/api-queries/specification-service/specification/specificationKeys';

/** Fetches a data-point type specification by ID; disabled until an ID is provided. */
export function useGetDataPointTypeSpecificationQuery(
  params: { id: MaybeRefOrGetter<string | undefined> },
  options: Omit<UseQueryOptions<DataPointTypeSpecification, Error>, 'queryKey' | 'queryFn'> = {}
): UseQueryReturnType<DataPointTypeSpecification, Error> {
  const client = useApiClient();
  return useQuery<DataPointTypeSpecification, Error>({
    queryKey: computed(() => specificationKeys.dataPoint(toValue(params.id))),
    queryFn: async () => {
      const id = toValue(params.id);
      if (!id) throw new Error('Data-point type ID is required');
      return (await client.apiClients.specificationController.getDataPointTypeSpecification(id)).data;
    },
    enabled: computed(() => !!toValue(params.id)),
    ...options,
  });
}
