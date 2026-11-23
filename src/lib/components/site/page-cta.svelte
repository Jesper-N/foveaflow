<script lang="ts">
  import { ArrowRightIcon } from "@lucide/svelte";

  import DrillIllustration from "../icons/drill-illustration.svelte";
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
  class="group/drill bg-card grid items-center gap-8 overflow-hidden rounded-4xl p-2 sm:grid-cols-[1fr_minmax(0,18rem)]"
>
  <div class="grid gap-3 p-6 sm:p-8">
    <h2 class="text-xl font-semibold text-balance">{title}</h2>
    <p class="text-muted-foreground text-base">{body}</p>
    <a class={[buttonClass("primary", "lg"), "mt-2 justify-self-start"]} {href}>
      {label}
      <ArrowRightIcon class="rtl:rotate-180" aria-hidden="true" />
    </a>
  </div>
  <DrillIllustration
    class="aspect-8/5 w-full rounded-3xl max-sm:hidden"
    drillId="pursuit"
  />
</section>
