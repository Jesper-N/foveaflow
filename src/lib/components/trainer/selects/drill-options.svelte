<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { drills } from "$lib/trainer/settings/drills";
</script>

{#each drills as drill (drill.id)}
  <option value={drill.id}>{t(drill.name)}</option>
{/each}
