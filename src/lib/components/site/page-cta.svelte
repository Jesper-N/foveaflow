<script lang="ts">
  import DrillIllustration from "$lib/components/drills/drill-illustration.svelte";
  import { Button } from "$lib/components/ui/button";
  import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";

  import {
    contentStage,
    editorialCopy,
    editorialHeading,
    heroButton,
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
  <div class="relative flex flex-col items-start">
    <h2 class={editorialHeading}>{title}</h2>
    <p class={[editorialCopy, "mt-2"]}>{body}</p>
    <Button {href} size="lg" class={["mt-3", heroButton]}>
      {label}
      <ArrowUpRightIcon data-icon="inline-end" />
    </Button>
  </div>
  <DrillIllustration drillId="pursuit" class="relative hidden sm:block" />
</section>
