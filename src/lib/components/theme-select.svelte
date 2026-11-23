<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { userPrefersMode } from "mode-watcher";

  import { selectTheme, themeOptions } from "./theme-options";
</script>

<select
  class="min-h-10"
  aria-label={t("Theme")}
  onchange={(event) => {
    selectTheme(event.currentTarget.value);
  }}
  title={t("Theme")}
  value={userPrefersMode.current}
>
  {#each themeOptions as option (option.value)}
    <option value={option.value}>{t(option.label)}</option>
  {/each}
</select>
