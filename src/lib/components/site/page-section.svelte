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

<section
  class="short:scroll-mt-16 grid scroll-mt-36 gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-x-20"
  {...rest}
>
  <div class="grid content-start gap-3 lg:sticky lg:top-36">
    <h2 class={sectionHeading}>{heading}</h2>
    {#if intro}
      <p class={bodyText}>{intro}</p>
    {/if}
  </div>
  <div class="grid min-w-0 content-start gap-5">
    {@render children?.()}
  </div>
</section>
