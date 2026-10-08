import { defineRegistry } from '@json-render/react';
import { catalog } from './catalog';
import * as Components from './components';

export const { registry } = defineRegistry(catalog, {
  components: Components,
});
