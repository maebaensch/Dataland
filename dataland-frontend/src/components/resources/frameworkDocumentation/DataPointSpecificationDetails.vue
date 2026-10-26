<template>
  <SpecificationFeedback :loading="isPending" :error="error" @retry="refetch()" />
  <article v-if="data && !error" data-test="data-point-specification">
    <h2>{{ data.name }}</h2>
    <p>
      <code>{{ data.dataPointType.id }}</code>
    </p>
    <h3>Definition</h3>
    <RenderSanitizedMarkdownInput :text="data.businessDefinition" />
    <h3>Constraints</h3>
    <ul v-if="data.constraints?.length">
      <li v-for="constraint in data.constraints" :key="constraint">{{ constraint }}</li>
    </ul>
    <p v-else>No additional constraints specified.</p>
    <h3>Calculation rules</h3>
    <div v-for="(rule, index) in data.calculationRules" :key="index">
      <p>{{ rule.calculationMethod }}</p>
      <ul>
        <li v-for="input in rule.inputs" :key="input">
          <RouterLink :to="{ name: 'Data point documentation', params: { dataPointId: input } }">
            {{ input }}
          </RouterLink>
        </li>
      </ul>
    </div>
    <p v-if="!data.calculationRules.length">No calculation rules specified.</p>
    <h3>Data type</h3>
    <RouterLink :to="{ name: 'Base type documentation', params: { baseTypeId: data.dataPointBaseType.id } }">
      {{ data.dataPointBaseType.id }}
    </RouterLink>
    <h3>Used in frameworks</h3>
    <ul>
      <li v-for="framework in data.usedBy" :key="framework.id">
        <RouterLink :to="frameworkDocumentationLocation(framework.id)">{{ framework.id }}</RouterLink>
      </li>
    </ul>
    <SpecificationJson :value="data" />
  </article>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useGetDataPointTypeSpecificationQuery } from '@/api-queries/specification-service/specification/useGetDataPointTypeSpecificationQuery';
import RenderSanitizedMarkdownInput from '@/components/general/RenderSanitizedMarkdownInput.vue';
import SpecificationFeedback from '@/components/resources/frameworkDocumentation/SpecificationFeedback.vue';
import SpecificationJson from '@/components/resources/frameworkDocumentation/SpecificationJson.vue';
import { frameworkDocumentationLocation } from '@/utils/SpecificationDocumentation';

const props = defineProps<{ dataPointId: string }>();
const { data, isPending, error, refetch } = useGetDataPointTypeSpecificationQuery(
  { id: () => props.dataPointId },
  { retry: false, staleTime: 300_000 }
);
</script>
