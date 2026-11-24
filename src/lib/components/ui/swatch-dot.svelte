<script lang="ts">
  import { inkOn, isNearlyNeutralEdge } from "$lib/trainer/settings/colors";
  import { CheckIcon } from "@lucide/svelte";
  import type { Attachment } from "svelte/attachments";

  let { color }: { color: string } = $props();

  const paint: Attachment<HTMLElement> = (node) => {
    node.style.setProperty("background-color", color);
    node.style.setProperty("color", inkOn(color));

    if (isNearlyNeutralEdge(color)) {
      node.style.setProperty("box-shadow", "inset 0 0 0 1px var(--border)");
    }
  };
</script>

<span
  class="ease-spring grid size-6 scale-80 place-items-center rounded-full transition-[scale] duration-220 group-hover/swatch:scale-90 group-data-checked/swatch:scale-100 group-data-selected/swatch:scale-100"
  {@attach paint}
  aria-hidden="true"
>
  <CheckIcon
    class="ease-spring size-3.5 scale-50 opacity-0 transition-[opacity,scale] duration-220 group-data-checked/swatch:scale-100 group-data-checked/swatch:opacity-100 group-data-selected/swatch:scale-100 group-data-selected/swatch:opacity-100"
    stroke-width={3}
  />
</span>
