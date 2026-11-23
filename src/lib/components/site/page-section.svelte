<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { bodyText, sectionHeading } from "./layout";

  interface Props extends HTMLAttributes<HTMLElement> {
    heading: string;
    intro?: string;
    children?: Snippet;
  }

  let { heading, intro, children, ...rest }: Props = $props();
</script>

<section class="grid scroll-mt-24 gap-5" {...rest}>
  <div class="grid gap-3">
    <h2 class={sectionHeading}>{heading}</h2>
    {#if intro}
      <p class={bodyText}>{intro}</p>
    {/if}
  </div>
  {@render children?.()}
</section>
