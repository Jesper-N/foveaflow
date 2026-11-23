<script lang="ts">
  import { t } from "$lib/i18n/translate";

  let {
    steps,
  }: {
    /** English source text, translated here. */
    steps: readonly string[];
  } = $props();
</script>

<ol>
  {#each steps as step (step)}
    <li>{t(step)}</li>
  {/each}
</ol>
