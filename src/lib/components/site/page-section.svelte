<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLElement> {
    heading: string;
    /** One paragraph under the heading. */
    intro?: string;
    children?: Snippet;
  }

  let { heading, intro, children, ...rest }: Props = $props();
</script>

<section {...rest}>
  <h2>{heading}</h2>
  {#if intro}
    <p>{intro}</p>
  {/if}
  {@render children?.()}
</section>
