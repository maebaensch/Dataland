import type { TreeNode } from 'primevue/treenode';
import { humanizeStringOrNumber } from '@/utils/StringFormatter';

export interface SpecificationField {
  path: string;
  id: string;
  alias?: string;
}

export interface SpecificationStructure {
  nodes: TreeNode[];
  fields: SpecificationField[];
}

/** Narrows parsed JSON to a hierarchy node. */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Parses the service's JSON-encoded framework hierarchy, retaining field paths and type IDs. */
export function parseSpecificationStructure(schema: string): SpecificationStructure {
  const parsed: unknown = JSON.parse(schema);
  const fields: SpecificationField[] = [];
  /** Visits nested groups and records their data-point references. */
  function visit(value: unknown, segments: string[]): TreeNode[] {
    if (!isObject(value)) throw new Error('Expected an object in the framework structure.');
    return Object.entries(value).map(([key, child]) => {
      const path = [...segments, key];
      const fieldPath = path.join('.');
      if (!isObject(child)) throw new Error(`Invalid specification at ${fieldPath}.`);
      if (typeof child.id === 'string' && typeof child.ref === 'string') {
        const field: SpecificationField = {
          path: fieldPath,
          id: child.id,
          alias: typeof child.aliasExport === 'string' ? child.aliasExport : undefined,
        };
        fields.push(field);
        return {
          key: fieldPath,
          label: humanizeStringOrNumber(key),
          searchText: `${fieldPath} ${field.id} ${field.alias ?? ''}`,
          leaf: true,
        };
      }
      return {
        key: fieldPath,
        label: humanizeStringOrNumber(key),
        selectable: false,
        children: visit(child, path),
      };
    });
  }
  return { nodes: visit(parsed, []), fields };
}

/** Builds the documentation link without following service-provided URLs. */
export function frameworkDocumentationLocation(frameworkId: string): {
  name: string;
  params: { frameworkId: string };
} {
  return { name: 'Framework documentation', params: { frameworkId } };
}
