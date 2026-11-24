<script lang="ts">
  import type { LucideIcon } from "@lucide/svelte";

  interface Props {
    label: string;
    icon?: LucideIcon;
  }

  let { label, icon: Icon }: Props = $props();
</script>

<span class="flex min-w-0 items-center gap-3">
  {#if Icon}
    <span
      class="bg-fill-active text-foreground group-data-dragging/slider:bg-foreground group-data-dragging/slider:text-background group-has-focus-visible/slider:bg-foreground group-has-focus-visible/slider:text-background grid size-7 shrink-0 place-items-center rounded-sm transition-colors duration-160 ease-out"
      aria-hidden="true"
    >
      <Icon class="size-4" />
    </span>
  {/if}
  <span class="truncate">{label}</span>
</span>
