<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { userPrefersMode } from "mode-watcher";

  import { selectTheme, themeOptions } from "./theme-options";
</script>

<label>
  {t("Theme")}
  <select
    onchange={(event) => {
      selectTheme(event.currentTarget.value);
    }}
    value={userPrefersMode.current}
  >
    {#each themeOptions as option (option.value)}
      <option value={option.value}>{t(option.label)}</option>
    {/each}
  </select>
</label>
