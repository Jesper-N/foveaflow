<script lang="ts">
  import { patternGlyphs } from "$lib/trainer/glyphs/pattern-glyphs";
  import type { PursuitPatternId } from "$lib/trainer/settings/patterns";
  import type { SVGAttributes } from "svelte/elements";

  interface Props extends SVGAttributes<SVGSVGElement> {
    patternId: PursuitPatternId;
  }

  let { patternId, ...rest }: Props = $props();
</script>

<svg
  {...rest}
  aria-hidden="true"
  fill="none"
  stroke="currentColor"
  stroke-linecap="round"
  stroke-linejoin="round"
  viewBox="0 0 32 24"
>
  <path
    d={patternGlyphs[patternId]}
    stroke-width="1.5"
    vector-effect="non-scaling-stroke"
  />
</svg>
