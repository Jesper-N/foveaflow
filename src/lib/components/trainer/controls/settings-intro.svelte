<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<p class="text-muted-foreground px-3 pb-2 text-sm">{@render children()}</p>
