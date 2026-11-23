<script lang="ts">
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
  <label for={id}>{label}</label>
  <span class="flex min-w-0 items-center gap-3">
    {@render swatch()}
    <input
      {id}
      oninput={(event) => {
        onValueChange(event.currentTarget.value);
      }}
      type="color"
      {value}
    />
    <span class="uppercase tabular-nums">{value}</span>
  </span>
</SettingsRow>
