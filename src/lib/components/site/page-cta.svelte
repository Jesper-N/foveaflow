<script lang="ts">
  import DrillIllustration from "$lib/components/drills/drill-illustration.svelte";
  import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";

  import {
    contentStage,
    editorialCopy,
    editorialHeading,
    actionLink,
  } from "./styles";

  let {
    title,
    body,
    href,
    label,
  }: { title: string; body: string; href: string; label: string } = $props();
</script>

<!-- Closing call to action at the end of a page. -->
<section
  class={[
    contentStage,
    "grid items-center gap-8 px-6 py-10 sm:grid-cols-[minmax(0,1fr)_14rem] sm:px-10",
  ]}
>
  <div class="relative flex flex-col items-start gap-3">
    <h2 class={editorialHeading}>{title}</h2>
    <p class={editorialCopy}>{body}</p>
    <a class={["mt-3", actionLink]} {href}>
      {label}
      <ArrowUpRightIcon aria-hidden="true" />
    </a>
  </div>
  <DrillIllustration class="relative hidden sm:block" drillId="pursuit" />
</section>
