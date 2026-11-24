<script lang="ts">
  import { t } from "$lib/i18n/translate";

  let { steps }: { steps: readonly string[] } = $props();
</script>

<ol class="grid gap-3">
  {#each steps as step, index (step)}
    <li class="text-md flex gap-3">
      <span
        class="bg-fill grid size-6 shrink-0 place-items-center rounded-full text-xs font-medium tabular-nums"
        aria-hidden="true"
      >
        {index + 1}
      </span>
      <span class="pt-0.5 text-pretty">{t(step)}</span>
    </li>
  {/each}
</ol>
