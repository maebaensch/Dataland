<template>
  <p class="my-3">
    <i class="pi pi-info-circle mr-2" aria-hidden="true" />
    <RouterLink :to="frameworkDocumentationLocation(frameworkId)">Explore this framework's documentation</RouterLink>
    <span> for definitions, constraints and examples.</span>
  </p>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { frameworkDocumentationLocation } from '@/utils/SpecificationDocumentation';

defineProps<{ frameworkId: string }>();
</script>
