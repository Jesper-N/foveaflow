<script lang="ts">
  import { patternGlyphs } from "$lib/trainer/glyphs/pattern-glyphs";
  import type { PursuitPatternId } from "$lib/trainer/settings/patterns";
  import { ArrowUpRightIcon } from "@lucide/svelte";
  import type { Attachment } from "svelte/attachments";

  import { pressable } from "../ui/styles";

  interface Props {
    href: string;
    label: string;
    patternId: PursuitPatternId;
  }

  let { href, label, patternId }: Props = $props();

  let route = $derived(patternGlyphs[patternId]);

  const followRoute =
    (path: string): Attachment<SVGCircleElement> =>
    (node) => {
      node.style.setProperty("offset-path", `path("${path}")`);
    };
</script>

<a
  class={[
    "group/path bg-card grid gap-2.5 rounded-3xl p-1.5 pb-3 motion-safe:active:scale-98",
    pressable,
  ]}
  {href}
>
  <span class="canvas-grid block aspect-4/3 overflow-hidden rounded-2xl">
    <svg
      class="text-foreground size-full"
      aria-hidden="true"
      fill="none"
      viewBox="0 0 32 24"
    >
      <path
        class="opacity-25 transition-opacity duration-220 ease-out group-hover/path:opacity-50"
        d={route}
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="0.4"
      />
      <circle
        class="path-dot fill-target"
        {@attach followRoute(route)}
        r="1.3"
      />
    </svg>
  </span>
  <span
    class="flex items-center justify-between gap-2 px-2 text-sm font-medium"
  >
    <span class="truncate">{label}</span>
    <ArrowUpRightIcon
      class="text-muted-foreground ease-spring group-hover/path:text-foreground size-3.5 shrink-0 transition-[translate,color] duration-260 group-hover/path:translate-x-0.5 group-hover/path:-translate-y-0.5 rtl:-scale-x-100"
      aria-hidden="true"
    />
  </span>
</a>

<style>
  .path-dot {
    offset-rotate: 0deg;
    offset-distance: 0%;
  }

  @media (prefers-reduced-motion: no-preference) {
    :global(.group\/path:is(:hover, :focus-visible)) .path-dot {
      animation: travel 3.6s linear infinite;
    }
  }

  @keyframes travel {
    to {
      offset-distance: 100%;
    }
  }
</style>
