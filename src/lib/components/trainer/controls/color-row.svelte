<script lang="ts">
  import * as Field from "$lib/components/ui/field";
  import type { Snippet } from "svelte";

  import SettingsRow from "./settings-row.svelte";

  let {
    id,
    label,
    value,
    onValueChange,
    swatch,
  }: {
    id: string;
    label: string;
    /** A `#rrggbb` hex color. */
    value: string;
    onValueChange: (color: string) => void;
    /** Preview of the color as the drill draws it. */
    swatch: Snippet;
  } = $props();
</script>

<SettingsRow>
  <Field.FieldLabel for={id}>{label}</Field.FieldLabel>
  <!-- A styled label opens the native picker. It matches the select triggers. -->
  <label
    class="bg-input/50 has-focus-visible:border-ring has-focus-visible:ring-ring/30 flex min-h-11 min-w-0 cursor-pointer items-center gap-3 rounded-3xl border border-transparent px-3 transition-[color,box-shadow,background-color] has-focus-visible:ring-3"
    for={id}
  >
    {@render swatch()}
    <span class="min-w-0 truncate text-sm uppercase slashed-zero tabular-nums">
      {value}
    </span>
    <!-- A plain input: field styles such as w-full would let it overflow the panel. -->
    <input
      {id}
      class="sr-only"
      type="color"
      {value}
      oninput={(event) => onValueChange(event.currentTarget.value)}
      aria-label={label}
    />
  </label>
</SettingsRow>
