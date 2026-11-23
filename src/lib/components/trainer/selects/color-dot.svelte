<script lang="ts">
  let { color }: { color: string } = $props();
</script>

<svg
  class="border-border/60 size-3 shrink-0 rounded-full border"
  aria-hidden="true"
  viewBox="0 0 12 12"
>
  <circle cx="6" cy="6" fill={color} r="6" />
</svg>
