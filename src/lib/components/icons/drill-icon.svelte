<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  interface Props extends SVGAttributes<SVGSVGElement> {
    drillId: string;
  }

  let { drillId, ...rest }: Props = $props();

  const ringDots = [1, 2, 3, 4, 5, 6, 7].map((index) => {
    const angle = (index / 8) * Math.PI * 2 - Math.PI / 2;

    return {
      cx: Math.round((12 + Math.cos(angle) * 8) * 100) / 100,
      cy: Math.round((12 + Math.sin(angle) * 8) * 100) / 100,
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
  stroke-width="2"
  viewBox="0 0 24 24"
>
  {#if drillId === "pursuit"}
    <path d="M3 18c2.5 0 3.5-3 5-6s3-5.5 5.5-5.5c2 0 2.5 1.5 3 2.5" />
    <circle class="fill-target stroke-target" cx="19.5" cy="14" r="2.5" />
  {:else if drillId === "reactionTime"}
    <circle cx="5.5" cy="17.5" r="2" />
    <path d="M8.5 14.5c1-3 3.5-6 7-7" stroke-dasharray="0.5 3" />
    <path d="m16 5 2.5 2.5L16 10" />
    <circle class="fill-target stroke-target" cx="19" cy="17.5" r="2.5" />
  {:else if drillId === "mot"}
    <circle cx="5" cy="6" r="2" />
    <circle cx="19" cy="6.5" r="2" />
    <circle cx="5.5" cy="18.5" r="2" />
    <circle cx="18.5" cy="18" r="2" />
    <circle class="fill-target stroke-target" cx="12" cy="12" r="3" />
  {:else}
    {#each ringDots as dot (dot.index)}
      <circle
        class="fill-current"
        cx={dot.cx}
        cy={dot.cy}
        r="1.25"
        stroke="none"
      />
    {/each}
    <circle class="fill-target" cx="12" cy="4" r="1.6" stroke="none" />
    <path d="M12 9.5v5M9.5 12h5" />
  {/if}
</svg>
