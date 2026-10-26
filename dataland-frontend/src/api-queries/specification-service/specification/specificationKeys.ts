export const specificationKeys = {
  all: ['specification'] as const,
  list: () => [...specificationKeys.all, 'list'] as const,
  framework: (id: string | undefined) => [...specificationKeys.all, 'framework', id] as const,
  dataPoint: (id: string | undefined) => [...specificationKeys.all, 'dataPoint', id] as const,
  baseType: (id: string | undefined) => [...specificationKeys.all, 'baseType', id] as const,
  resolvedSchema: (id: string | undefined) => [...specificationKeys.all, 'resolvedSchema', id] as const,
};
