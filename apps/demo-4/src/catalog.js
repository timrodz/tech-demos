import { defineCatalog } from '@json-render/core';
import { schema } from '@json-render/react/schema';
import { z } from 'zod';

export const catalog = defineCatalog(schema, {
  components: {
    Card: {
      props: z.object({
        title: z.string(),
        subtitle: z.string().optional(),
      }),
      hasChildren: true,
      description: 'A card container with title and optional subtitle',
    },
    Metric: {
      props: z.object({
        label: z.string(),
        value: z.union([z.string(), z.number()]),
        trend: z.string().optional(),
      }),
      description: 'Display a metric with label, value, and optional trend',
    },
    Button: {
      props: z.object({
        label: z.string(),
        variant: z.enum(['primary', 'secondary']).default('primary'),
      }),
      description: 'A clickable button',
    },
    Text: {
      props: z.object({
        content: z.string(),
        size: z.enum(['sm', 'base', 'lg']).default('base'),
      }),
      description: 'Text content with size options',
    },
    Stack: {
      props: z.object({
        direction: z.enum(['horizontal', 'vertical']).default('vertical'),
        gap: z.enum(['sm', 'md', 'lg']).default('md'),
      }),
      hasChildren: true,
      description: 'Layout container for stacking children',
    },
    List: {
      props: z.object({
        items: z.array(z.string()),
      }),
      description: 'Unordered list of items',
    },
  },
});
