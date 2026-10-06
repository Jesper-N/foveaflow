<script lang="ts">
  import * as Field from "$lib/components/ui/field";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<!-- Label on the left, control in a fixed right column. Stacks when the panel is narrow. -->
<Field.Field
  class="grid gap-3 py-3 @lg/field-group:min-h-17 @lg/field-group:grid-cols-[minmax(0,1fr)_20rem] @lg/field-group:items-center @lg/field-group:gap-8"
>
  {@render children()}
</Field.Field>
