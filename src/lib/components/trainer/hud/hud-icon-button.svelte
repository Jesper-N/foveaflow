<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLButtonAttributes, "children"> {
    /** Accessible name. Also the tooltip, unless `tooltip` is set. */
    label: string;
    tooltip?: string;
    children: Snippet;
  }

  let { label, tooltip = label, children, ...rest }: Props = $props();
</script>

<button
  {...rest}
  class="inline-flex size-11 items-center justify-center"
  aria-label={label}
  title={tooltip}
  type="button"
>
  {@render children()}
</button>
