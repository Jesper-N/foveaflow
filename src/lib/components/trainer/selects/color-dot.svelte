<script lang="ts">
  let { color }: { color: string } = $props();
</script>

<svg
  viewBox="0 0 12 12"
  class="border-border/60 size-3 shrink-0 rounded-full border"
  aria-hidden="true"
>
  <circle cx="6" cy="6" r="6" fill={color} />
</svg>
