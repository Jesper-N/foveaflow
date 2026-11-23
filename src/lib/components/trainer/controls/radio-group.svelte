<script generics="T extends string" lang="ts">
  import type { Snippet } from "svelte";

  let {
    legend,
    name,
    value,
    options,
    onValueChange,
    item,
  }: {
    legend: string;
    name: string;
    value: T;
    options: readonly { value: T; label: string }[];
    onValueChange: (value: string) => void;
    /** Replaces the visible label. The label stays the accessible name. */
    item?: Snippet<[T]>;
  } = $props();
</script>

<fieldset class="grid gap-2 py-3">
  <legend>{legend}</legend>
  <div class="flex flex-wrap gap-x-4 gap-y-2">
    {#each options as option (option.value)}
      <label class="flex min-h-11 items-center gap-2" title={option.label}>
        <input
          {name}
          aria-label={item ? option.label : undefined}
          checked={option.value === value}
          onchange={() => {
            onValueChange(option.value);
          }}
          type="radio"
          value={option.value}
        />
        {#if item}
          {@render item(option.value)}
        {:else}
          {option.label}
        {/if}
      </label>
    {/each}
  </div>
</fieldset>
