<script lang="ts">
  import { t } from "$lib/i18n/translate";

  import { editorialCopy } from "./styles";

  let {
    steps,
    class: className,
  }: {
    /** English source text, translated here. */
    steps: readonly string[];
    class?: string;
  } = $props();
</script>

<ol class={["grid gap-1", className]}>
  {#each steps as step, index (step)}
    <li class="grid grid-cols-[1.25rem_minmax(0,1fr)] items-baseline">
      <span class="text-muted-foreground tabular-nums" aria-hidden="true">
        {index + 1}
      </span>
      <p class={editorialCopy}>{t(step)}</p>
    </li>
  {/each}
</ol>
