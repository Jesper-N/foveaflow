<script lang="ts">
  import type { TargetForm } from "$lib/trainer/settings/options";
  import type { SVGAttributes } from "svelte/elements";

  interface Props extends SVGAttributes<SVGSVGElement> {
    form: TargetForm;
  }

  let { form, ...rest }: Props = $props();
</script>

<svg {...rest} aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
  {#if form === "circle"}
    <circle cx="12" cy="12" r="7" />
  {:else if form === "ring"}
    <circle
      cx="12"
      cy="12"
      fill="none"
      r="6"
      stroke="currentColor"
      stroke-width="2.5"
    />
  {:else if form === "square"}
    <rect height="13" rx="1" width="13" x="5.5" y="5.5" />
  {:else if form === "diamond"}
    <path
      d="M12 4.5 19.5 12 12 19.5 4.5 12Z"
      stroke="currentColor"
      stroke-linejoin="round"
    />
  {:else if form === "triangle"}
    <path
      d="M12 5 19.5 18.5h-15Z"
      stroke="currentColor"
      stroke-linejoin="round"
    />
  {:else}
    <path
      d="M12 5.5v13M5.5 12h13"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-width="3"
    />
  {/if}
</svg>
