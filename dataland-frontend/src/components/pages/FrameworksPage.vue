<template>
  <TheContent>
    <section class="p-4 text-left">
      <h1>Frameworks</h1>
      <p>Explore framework definitions, data points, constraints and examples before viewing or submitting ESG data.</p>
      <label for="framework-search" class="block mb-2">Find a framework</label>
      <InputText id="framework-search" v-model="search" placeholder="Search by name or identifier" class="w-full" />
      <SpecificationFeedback :loading="isPending" :error="error" @retry="refetch()" />
      <template v-if="data && !error">
        <p v-if="!data.length">No framework documentation is available.</p>
        <p v-else-if="!frameworks.length" role="status">No frameworks match your search.</p>
        <ul v-else class="list-none p-0 grid" data-test="framework-catalog">
          <li v-for="item in frameworks" :key="item.framework.id" class="col-12 md:col-6 lg:col-4">
            <Card class="h-full">
              <template #title>
                <RouterLink :to="frameworkDocumentationLocation(item.framework.id)">{{ item.name }}</RouterLink>
              </template>
              <template #content
                ><code>{{ item.framework.id }}</code></template
              >
            </Card>
          </li>
        </ul>
      </template>
    </section>
  </TheContent>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import TheContent from '@/components/generics/TheContent.vue';
import SpecificationFeedback from '@/components/resources/frameworkDocumentation/SpecificationFeedback.vue';
import { useListFrameworkSpecificationsQuery } from '@/api-queries/specification-service/specification/useListFrameworkSpecificationsQuery';
import { frameworkDocumentationLocation } from '@/utils/SpecificationDocumentation';

const search = ref('');
const { data, isPending, error, refetch } = useListFrameworkSpecificationsQuery({ retry: false, staleTime: 300_000 });
const frameworks = computed(() => {
  const term = search.value.trim().toLowerCase();
  return (
    data.value
      ?.filter((item) => `${item.name} ${item.framework.id}`.toLowerCase().includes(term))
      .toSorted((left, right) => left.name.localeCompare(right.name)) ?? []
  );
});
</script>
