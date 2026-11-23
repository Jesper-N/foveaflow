<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  interface Props extends SVGAttributes<SVGSVGElement> {
    drillId: string;
  }

  let { drillId, ...rest }: Props = $props();

  const ringDots = [0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
    const angle = (index / 8) * Math.PI * 2 - Math.PI / 2;

    return {
      cx: 12 + Math.cos(angle) * 8,
      cy: 12 + Math.sin(angle) * 8,
      index,
    };
  });
</script>

<svg
  {...rest}
  aria-hidden="true"
  fill="none"
  stroke="currentColor"
  stroke-linecap="round"
  stroke-linejoin="round"
  stroke-width="1.5"
  viewBox="0 0 24 24"
>
  {#if drillId === "pursuit"}
    <path d="M3 19.5c1.5-4.5 4.4-7 8-7 2.2 0 3.6-.9 4.6-2.6" opacity="0.45" />
    <circle cx="18" cy="7" fill="currentColor" r="3" stroke="none" />
  {:else if drillId === "reactionTime"}
    <circle cx="6" cy="17" opacity="0.45" r="2.5" stroke-dasharray="1.6 2" />
    <path
      d="M7.5 13.5c1-4.5 3.6-7 7.5-7.5"
      opacity="0.45"
      stroke-dasharray="1.6 2"
    />
    <circle cx="18" cy="6.5" fill="currentColor" r="3" stroke="none" />
  {:else if drillId === "mot"}
    <circle cx="5" cy="6" opacity="0.45" r="2" />
    <circle cx="19" cy="5" opacity="0.45" r="2" />
    <circle cx="4.5" cy="18" opacity="0.45" r="2" />
    <circle cx="19.5" cy="18.5" opacity="0.45" r="2" />
    <circle cx="12" cy="12" fill="currentColor" r="3" stroke="none" />
  {:else}
    {#each ringDots as dot (dot.index)}
      <circle
        cx={dot.cx}
        cy={dot.cy}
        fill="currentColor"
        opacity={dot.index === 0 ? 0 : 0.45}
        r="1.6"
        stroke="none"
      />
    {/each}
    <path d="M12 9.75v4.5M9.75 12h4.5" />
  {/if}
</svg>
