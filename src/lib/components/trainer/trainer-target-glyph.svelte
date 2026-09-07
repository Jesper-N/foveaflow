<script lang="ts">
  import type { TargetForm } from "$lib/engine/types";

  let { form, filled = false }: { form: TargetForm; filled?: boolean } =
    $props();
</script>

<svg viewBox="0 0 32 32" class="size-full" aria-hidden="true">
  <g
    fill={filled && form !== "ring" ? "currentColor" : "none"}
    stroke="currentColor"
    stroke-width={form === "ring" && filled ? 4 : 1.5}
    stroke-linejoin="round"
  >
    {#if form === "circle" || form === "ring"}
      <circle cx="16" cy="16" r={form === "ring" ? 10 : 12} />
      {#if form === "ring" && !filled}<circle cx="16" cy="16" r="6" />{/if}
    {:else if form === "square"}
      <rect x="5" y="5" width="22" height="22" />
    {:else if form === "diamond"}
      <path d="M16 3 29 16 16 29 3 16Z" />
    {:else if form === "triangle"}
      <path d="m16 3 13 24H3Z" />
    {:else}
      <path d="M12 3h8v9h9v8h-9v9h-8v-9H3v-8h9Z" />
    {/if}
  </g>
</svg>
