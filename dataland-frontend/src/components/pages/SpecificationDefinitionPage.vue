<template>
  <TheContent>
    <section class="p-4 text-left">
      <nav aria-label="Documentation breadcrumb">
        <RouterLink :to="{ name: 'Frameworks' }">Frameworks</RouterLink>
        <span> / {{ dataPointId ? 'Data-point types' : 'Base types' }} / {{ dataPointId ?? baseTypeId }}</span>
      </nav>
      <h1>{{ dataPointId ? 'Data-point documentation' : 'Base-type documentation' }}</h1>
      <DataPointSpecificationDetails v-if="dataPointId" :dataPointId="dataPointId" />
      <BaseTypeSpecificationDetails v-else-if="baseTypeId" :baseTypeId="baseTypeId" />
    </section>
  </TheContent>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import TheContent from '@/components/generics/TheContent.vue';
import DataPointSpecificationDetails from '@/components/resources/frameworkDocumentation/DataPointSpecificationDetails.vue';
import BaseTypeSpecificationDetails from '@/components/resources/frameworkDocumentation/BaseTypeSpecificationDetails.vue';

defineProps<{ dataPointId?: string; baseTypeId?: string }>();
</script>
