<script lang="ts">
  import type { Snippet } from "svelte";

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
  <div class={settingsGroup}>
    {@render children()}
  </div>
</section>
