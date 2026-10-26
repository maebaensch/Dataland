<template>
  <SpecificationFeedback :loading="isPending" :error="error" @retry="refetch()" />
  <article v-if="data && !error" data-test="base-type-specification">
    <h2>{{ data.name }}</h2>
    <p>
      <code>{{ data.dataPointBaseType.id }}</code>
    </p>
    <h3>Definition</h3>
    <RenderSanitizedMarkdownInput :text="data.businessDefinition" />
    <h3>Example</h3>
    <SpecificationJson :value="data.example" label="View example" />
    <h3>Validation class</h3>
    <p class="overflow-wrap">{{ data.validatedBy }}</p>
    <h3>Used by data-point types</h3>
    <ul>
      <li v-for="dataPoint in data.usedBy" :key="dataPoint.id">
        <RouterLink :to="{ name: 'Data point documentation', params: { dataPointId: dataPoint.id } }">
          {{ dataPoint.id }}
        </RouterLink>
      </li>
    </ul>
    <SpecificationJson :value="data" />
  </article>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useGetDataPointBaseTypeQuery } from '@/api-queries/specification-service/specification/useGetDataPointBaseTypeQuery';
import RenderSanitizedMarkdownInput from '@/components/general/RenderSanitizedMarkdownInput.vue';
import SpecificationFeedback from '@/components/resources/frameworkDocumentation/SpecificationFeedback.vue';
import SpecificationJson from '@/components/resources/frameworkDocumentation/SpecificationJson.vue';

const props = defineProps<{ baseTypeId: string }>();
const { data, isPending, error, refetch } = useGetDataPointBaseTypeQuery(
  { id: () => props.baseTypeId },
  { retry: false, staleTime: 300_000 }
);
</script>
