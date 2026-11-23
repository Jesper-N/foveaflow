<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { lilacChaserColors } from "$lib/trainer/settings/options";
</script>

{#each lilacChaserColors as color (color.id)}
  <option value={color.id}>{t(color.name)}</option>
{/each}
