<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { MonitorIcon, MoonIcon, SunIcon } from "@lucide/svelte";
  import { userPrefersMode } from "mode-watcher";

  import { selectTheme, themeOptions } from "./theme-options";
  import Select from "./ui/select.svelte";

  let groups = $derived([
    {
      options: themeOptions.map((option) => ({
        label: t(option.label),
        value: option.value,
      })),
    },
  ]);
</script>

<Select
  appearance="ghost"
  compact
  {groups}
  hideLabel
  label={t("Theme")}
  onValueChange={selectTheme}
  tip={t("Theme")}
  value={userPrefersMode.current}
>
  {#snippet icon(value)}
    {#if value === "light"}
      <SunIcon class="size-4" aria-hidden="true" />
    {:else if value === "dark"}
      <MoonIcon class="size-4" aria-hidden="true" />
    {:else}
      <MonitorIcon class="size-4" aria-hidden="true" />
    {/if}
  {/snippet}
  {#snippet trigger()}
    {#if userPrefersMode.current === "light"}
      <SunIcon class="size-4" aria-hidden="true" />
    {:else if userPrefersMode.current === "dark"}
      <MoonIcon class="size-4" aria-hidden="true" />
    {:else}
      <MonitorIcon class="size-4" aria-hidden="true" />
    {/if}
  {/snippet}
</Select>
