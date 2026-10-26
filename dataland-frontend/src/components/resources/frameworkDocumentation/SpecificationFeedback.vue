<template>
  <div v-if="loading" role="status" class="flex align-items-center gap-3 py-3">
    <DatalandProgressSpinner />
    <span>Loading documentation...</span>
  </div>
  <Message v-else-if="error" severity="error" class="my-3" data-test="specification-error">
    <p>{{ errorText }}</p>
    <PrimeButton label="Try again" severity="secondary" @click="$emit('retry')" />
  </Message>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { isAxiosError } from 'axios';
import Message from 'primevue/message';
import PrimeButton from 'primevue/button';
import DatalandProgressSpinner from '@/components/general/DatalandProgressSpinner.vue';

const props = defineProps<{ loading: boolean; error: Error | null }>();
defineEmits<{ retry: [] }>();
const errorText = computed(() => {
  if (isAxiosError(props.error)) {
    if (props.error.response?.status === 404) return 'This documentation could not be found.';
    if ([401, 403].includes(props.error.response?.status ?? 0)) {
      return 'You do not have permission to view this documentation. Please check that you are logged in.';
    }
  }
  return 'The documentation could not be loaded. Please try again.';
});
</script>
