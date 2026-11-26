<script lang="ts">
  import { patternGlyphs } from "$lib/trainer/glyphs/pattern-glyphs";
  import type { PursuitPatternId } from "$lib/trainer/settings/patterns";
  import type { Attachment } from "svelte/attachments";

  import { pressable } from "../ui/styles";

  interface Props {
    badge?: string;
    href: string;
    label: string;
    patternId: PursuitPatternId;
  }

  let { badge, href, label, patternId }: Props = $props();

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
  <span
    class="canvas-grid relative block aspect-4/3 overflow-hidden rounded-2xl"
  >
    {#if badge}
      <span
        class="bg-popover text-2xs shadow-thumb absolute inset-s-2 top-2 rounded-full px-2 py-0.5 font-medium"
      >
        {badge}
      </span>
    {/if}
    <svg
      class="text-foreground size-full p-2"
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
  <span class="truncate px-2 text-sm font-medium">{label}</span>
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
