<script lang="ts">
  import type { Snippet } from "svelte";

  import { smoothResize } from "../../ui/smooth-resize";
  import { settingsGroup } from "../../ui/styles";

  interface Props {
    id: string;
    title?: string;
    children: Snippet;
  }

  let { id, title, children }: Props = $props();
</script>

<section
  class="grid gap-2"
  aria-labelledby={title === undefined ? undefined : id}
>
  {#if title !== undefined}
    <h3 {id} class="text-muted-foreground px-4 text-xs font-medium">
      {title}
    </h3>
  {/if}
  <div class="overflow-clip rounded-2xl" {@attach smoothResize()}>
    <div class={settingsGroup}>
      {@render children()}
    </div>
  </div>
</section>
