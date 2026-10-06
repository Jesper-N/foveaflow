<script lang="ts">
  import type { Snippet } from "svelte";

  import PageToc from "./page-toc.svelte";

  let {
    links,
    children,
  }: {
    /** Table of contents entries. Labels are translated by the table. */
    links: readonly { id: string; label: string }[];
    children: Snippet;
  } = $props();
</script>

<!-- Table of contents on the left, article on the right. -->
<div
  class="grid items-start gap-10 pt-12 sm:pt-16 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-16"
>
  <PageToc {links} />
  <div class="flex min-w-0 flex-col gap-12 sm:gap-16">
    {@render children()}
  </div>
</div>
