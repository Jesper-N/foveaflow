<script lang="ts">
  import * as Field from "$lib/components/ui/field";
  import type { Snippet } from "svelte";

  let {
    legend,
    label,
    children,
  }: {
    /** Visible heading. The first section on a page sits under the page title and has none. */
    legend?: string;
    /** Accessible name for a section without a legend. */
    label?: string;
    children: Snippet;
  } = $props();
</script>

<Field.FieldSet
  class="min-w-0 gap-0 [&+fieldset]:mt-5 [&>legend]:float-left [&>legend]:mb-1 [&>legend]:w-full"
  aria-label={label}
>
  {#if legend}
    <Field.FieldLegend variant="label">{legend}</Field.FieldLegend>
  {/if}
  <Field.FieldGroup class="divide-border/60 gap-0 divide-y">
    {@render children()}
  </Field.FieldGroup>
</Field.FieldSet>
