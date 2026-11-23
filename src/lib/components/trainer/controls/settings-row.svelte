<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<!-- Label first, control second. -->
<div class="grid gap-2 py-3">
  {@render children()}
</div>
