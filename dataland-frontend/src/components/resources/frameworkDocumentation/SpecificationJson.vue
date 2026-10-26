<template>
  <details class="my-3">
    <summary>{{ label ?? 'View JSON' }}</summary>
    <PrimeButton label="Copy JSON" icon="pi pi-copy" severity="secondary" class="my-2" @click="copyJson" />
    <span v-if="copied" role="status" class="ml-2">Copied</span>
    <Message v-if="copyError" severity="error">{{ copyError }}</Message>
    <pre class="json-content" tabindex="0" :aria-label="label ?? 'JSON documentation'">{{ formatted }}</pre>
  </details>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import PrimeButton from 'primevue/button';
import Message from 'primevue/message';

const props = defineProps<{ value: unknown; label?: string }>();
const formatted = computed(() => JSON.stringify(props.value, null, 2));
const copied = ref(false);
const copyError = ref('');

/** Copies the original document, with visible feedback if clipboard access fails. */
async function copyJson(): Promise<void> {
  copied.value = false;
  copyError.value = '';
  try {
    await navigator.clipboard.writeText(formatted.value);
    copied.value = true;
  } catch {
    copyError.value = 'Could not copy JSON. You can select and copy the text below instead.';
  }
}
</script>

<style scoped>
.json-content {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  max-height: 32rem;
  overflow: auto;
}
</style>
