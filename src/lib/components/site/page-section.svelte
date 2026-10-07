<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { editorialCopy, editorialHeading } from "./styles";

  interface Props extends HTMLAttributes<HTMLElement> {
    heading: string;
    /** One paragraph under the heading. */
    intro?: string;
    /** The first section of an article has no divider above it. */
    first?: boolean;
    children?: Snippet;
  }

  let { heading, intro, first = false, children, ...rest }: Props = $props();
</script>

<section
  {...rest}
  class={first ? "scroll-mt-8" : "border-border scroll-mt-8 border-t pt-6"}
>
  <h2 class={editorialHeading}>{heading}</h2>
  {#if intro}
    <p class={[editorialCopy, "mt-2"]}>{intro}</p>
  {/if}
  {@render children?.()}
</section>
