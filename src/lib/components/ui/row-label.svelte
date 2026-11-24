<script lang="ts">
  import type { LucideIcon } from "@lucide/svelte";

  interface Props {
    label: string;
    icon?: LucideIcon;
    active?: boolean;
  }

  let { label, icon: Icon, active = false }: Props = $props();
</script>

<span class="flex min-w-0 items-center gap-3">
  {#if Icon}
    <span
      class={[
        "grid size-7 shrink-0 place-items-center rounded-sm transition-colors duration-160 ease-out",
        active
          ? "bg-foreground text-background"
          : "bg-fill-active text-foreground",
      ]}
      aria-hidden="true"
    >
      <Icon class="size-4" />
    </span>
  {/if}
  <span class="truncate">{label}</span>
</span>
