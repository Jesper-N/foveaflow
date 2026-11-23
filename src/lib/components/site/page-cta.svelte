<script lang="ts">
  import { ArrowRightIcon } from "@lucide/svelte";

  import DrillPreview from "../icons/drill-preview.svelte";
  import { buttonClass } from "../ui/button-variants";

  interface Props {
    title: string;
    body: string;
    href: string;
    label: string;
  }

  let { title, body, href, label }: Props = $props();
</script>

<section
  class="dark text-foreground ring-border in-[html.dark]:bg-card grid items-center gap-2 overflow-hidden rounded-4xl bg-black p-2 ring-1 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]"
>
  <div class="grid justify-items-start gap-4 p-6 sm:p-10">
    <h2 class="text-2xl font-semibold text-balance sm:text-3xl">{title}</h2>
    <p
      class="text-muted-foreground text-base sm:text-lg sm:leading-7 sm:tracking-normal"
    >
      {body}
    </p>
    <a class={[buttonClass("primary", "lg"), "group/cta mt-3"]} {href}>
      {label}
      <ArrowRightIcon
        class="ease-spring transition-transform duration-260 group-hover/cta:translate-x-0.5 rtl:-scale-x-100"
        aria-hidden="true"
      />
    </a>
  </div>
  <DrillPreview class="aspect-4/3 w-full rounded-3xl" drillId="pursuit" />
</section>
