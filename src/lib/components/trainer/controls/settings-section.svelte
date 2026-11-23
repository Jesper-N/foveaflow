<script lang="ts">
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

<fieldset class="min-w-0 [&+fieldset]:mt-8" aria-label={label}>
  {#if legend}
    <legend>{legend}</legend>
  {/if}
  {@render children()}
</fieldset>
