<script lang="ts">
  import DrillIllustration from "$lib/components/drill-illustration.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";

  import {
    contentStage,
    editorialCopy,
    editorialHeading,
    heroButton,
  } from "./page-styles";

  let {
    title,
    body,
    href,
    label,
  }: { title: string; body: string; href: string; label: string } = $props();
</script>

<section
  class={[
    contentStage,
    "grid items-center gap-8 px-6 py-10 sm:grid-cols-[minmax(0,1fr)_14rem] sm:px-10",
  ]}
>
  <div class="relative flex flex-col items-start gap-3">
    <h2 class={editorialHeading}>{title}</h2>
    <p class={editorialCopy}>{body}</p>
    <Button {href} size="lg" class={["mt-3", heroButton]}
      >{label}<ArrowUpRight data-icon="inline-end" /></Button
    >
  </div>
  <DrillIllustration mode="pursuit" class="relative hidden sm:block" />
</section>
