<template>
  <TheContent>
    <section class="p-4 text-left">
      <nav aria-label="Documentation breadcrumb">
        <RouterLink :to="{ name: 'Frameworks' }">Frameworks</RouterLink>
        <span> / {{ data?.name ?? frameworkId }}</span>
      </nav>
      <SpecificationFeedback :loading="isPending" :error="error" @retry="refetch()" />
      <template v-if="data && !error">
        <h1>{{ data.name }}</h1>
        <p>
          <code>{{ data.framework.id }}</code>
        </p>
        <RenderSanitizedMarkdownInput :text="data.businessDefinition" />
        <Message v-if="structure.error" severity="error" class="my-3">
          The framework structure could not be displayed: {{ structure.error }}
        </Message>
        <div v-else class="grid mt-3">
          <aside class="col-12 lg:col-4">
            <h2>Explore fields</h2>
            <p>Search by field name, path, identifier or export alias.</p>
            <Tree
              :value="structure.nodes"
              :filter="true"
              filterBy="label,searchText"
              filterPlaceholder="Find a field"
              :pt="{ pcFilterInput: { root: { 'aria-label': 'Find a field' } } }"
              selectionMode="single"
              :selectionKeys="selectedKeys"
              v-model:expandedKeys="expandedKeys"
              aria-label="Framework structure"
              class="w-full"
              @node-select="selectField"
              @filter="expandSearchResults"
            >
              <template #default="{ node }">
                <span class="field-label">
                  {{ node.label }}
                  <small v-if="node.leaf" class="block">{{ node.key }}</small>
                </span>
              </template>
            </Tree>
            <p v-if="!structure.fields.length">This framework has no documented fields.</p>
          </aside>
          <section class="col-12 lg:col-8" aria-label="Field documentation" aria-live="polite">
            <template v-if="selectedField">
              <p class="field-label"><strong>Field path:</strong> {{ selectedField.path }}</p>
              <p v-if="selectedField.alias"><strong>Export alias:</strong> {{ selectedField.alias }}</p>
              <DataPointSpecificationDetails :dataPointId="selectedField.id" />
            </template>
            <Message v-else-if="fieldPath" severity="warn">
              This field does not exist in this framework. Select a field from the structure.
            </Message>
            <p v-else>Select a field to explore its definition, constraints, calculation rules and data type.</p>
          </section>
        </div>
        <h2>Technical documentation</h2>
        <p v-if="data.referencedReportJsonPath">
          <strong>Referenced report path:</strong> <code>{{ data.referencedReportJsonPath }}</code>
        </p>
        <SpecificationJson :value="data" label="View framework JSON" />
        <PrimeButton
          :label="showResolved ? 'Hide resolved schema' : 'Explore resolved schema'"
          severity="secondary"
          :aria-expanded="showResolved"
          @click="showResolved = !showResolved"
        />
        <section v-if="showResolved" aria-label="Resolved framework schema">
          <SpecificationFeedback :loading="resolvedPending" :error="resolvedError" @retry="refetchResolved()" />
          <SpecificationJson v-if="resolved && !resolvedError" :value="resolved" label="View resolved schema JSON" />
        </section>
      </template>
    </section>
  </TheContent>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import Tree, { type TreeFilterEvent } from 'primevue/tree';
import type { TreeNode } from 'primevue/treenode';
import PrimeButton from 'primevue/button';
import Message from 'primevue/message';
import TheContent from '@/components/generics/TheContent.vue';
import RenderSanitizedMarkdownInput from '@/components/general/RenderSanitizedMarkdownInput.vue';
import SpecificationFeedback from '@/components/resources/frameworkDocumentation/SpecificationFeedback.vue';
import SpecificationJson from '@/components/resources/frameworkDocumentation/SpecificationJson.vue';
import DataPointSpecificationDetails from '@/components/resources/frameworkDocumentation/DataPointSpecificationDetails.vue';
import { useGetFrameworkSpecificationQuery } from '@/api-queries/specification-service/specification/useGetFrameworkSpecificationQuery';
import { useGetResolvedFrameworkSpecificationQuery } from '@/api-queries/specification-service/specification/useGetResolvedFrameworkSpecificationQuery';
import { parseSpecificationStructure } from '@/utils/SpecificationDocumentation';

const props = defineProps<{ frameworkId: string }>();
const route = useRoute();
const router = useRouter();
const showResolved = ref(false);
const expandedKeys = ref<Record<string, boolean>>({});
const fieldPath = computed(() => (typeof route.query.field === 'string' ? route.query.field : undefined));
const { data, isPending, error, refetch } = useGetFrameworkSpecificationQuery(
  { id: () => props.frameworkId },
  { retry: false, staleTime: 300_000 }
);
const {
  data: resolved,
  isPending: resolvedPending,
  error: resolvedError,
  refetch: refetchResolved,
} = useGetResolvedFrameworkSpecificationQuery(
  { id: () => (showResolved.value ? props.frameworkId : undefined) },
  { retry: false, staleTime: 300_000 }
);
const structure = computed(() => {
  try {
    return { ...parseSpecificationStructure(data.value?.schema ?? '{}'), error: undefined };
  } catch (parseError) {
    return {
      nodes: [],
      fields: [],
      error: parseError instanceof Error ? parseError.message : 'Invalid framework JSON.',
    };
  }
});
const selectedField = computed(() => structure.value.fields.find((field) => field.path === fieldPath.value));
const selectedKeys = computed(() => (fieldPath.value ? { [fieldPath.value]: true } : {}));

watch(
  () => props.frameworkId,
  () => {
    showResolved.value = false;
  }
);
watch(
  [(): string => props.frameworkId, fieldPath],
  ([, path]): void => {
    const segments = path?.split('.') ?? [];
    expandedKeys.value = Object.fromEntries(segments.map((_, index) => [segments.slice(0, index + 1).join('.'), true]));
  },
  { immediate: true }
);

/** Keeps the selected field bookmarkable and compatible with browser history. */
async function selectField(node: TreeNode): Promise<void> {
  if (node.leaf) {
    await router.push({ query: { ...route.query, field: node.key } });
  }
}

/** PrimeVue filters the hierarchy but leaves expansion state to its consumer. */
function expandSearchResults(event: TreeFilterEvent): void {
  if (!event.value.trim()) return;
  const nodes = [...event.filteredNodes];
  const expanded: Record<string, boolean> = {};
  for (const node of nodes) {
    if (node.key && node.children?.length) {
      expanded[node.key] = true;
      nodes.push(...node.children);
    }
  }
  expandedKeys.value = expanded;
}
</script>

<style scoped>
.field-label {
  overflow-wrap: anywhere;
}
</style>
