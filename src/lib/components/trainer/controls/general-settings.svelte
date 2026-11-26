<script lang="ts">
  import LanguageSelect from "$lib/components/language-select.svelte";
  import { t } from "$lib/i18n/translate";
  import { cue, sound } from "$lib/sound/sound.svelte";
  import { MonitorIcon, MoonIcon, SunIcon } from "@lucide/svelte";
  import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogClose,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@ui-sdk/svelte/alert-dialog";
  import { userPrefersMode } from "mode-watcher";

  import { selectTheme, themeOptions } from "../../theme-options";
  import { buttonClass } from "../../ui/button-variants";
  import Segmented from "../../ui/segmented.svelte";
  import { backdrop, dialogSurface } from "../../ui/styles";
  import Switch from "../../ui/switch.svelte";
  import { getTrainer } from "../trainer-context";
  import SettingsSection from "./settings-section.svelte";

  const trainer = getTrainer();

  let resetDescription = $derived(
    t(
      "Restore the selected drill to its default behavior, visuals, and saved local settings."
    )
  );

  let themeChoices = $derived(
    themeOptions.map((option) => ({
      label: t(option.label),
      value: option.value,
    }))
  );
</script>

<SettingsSection id="trainer-general-settings">
  <LanguageSelect />
  <div class="grid gap-3" data-setting-row>
    <span class="text-md truncate font-medium" aria-hidden="true">
      {t("Theme")}
    </span>
    <Segmented
      label={t("Theme")}
      onValueChange={selectTheme}
      options={themeChoices}
      value={userPrefersMode.current}
    >
      {#snippet icon(value)}
        {#if value === "light"}
          <SunIcon aria-hidden="true" />
        {:else if value === "dark"}
          <MoonIcon aria-hidden="true" />
        {:else}
          <MonitorIcon aria-hidden="true" />
        {/if}
      {/snippet}
    </Segmented>
  </div>
  <Switch
    label={t("Sound")}
    bind:checked={() => sound.enabled, sound.setEnabled}
  />
</SettingsSection>

<SettingsSection id="trainer-defaults">
  <div class="flex" data-setting-row>
    <AlertDialog
      onOpenChange={(open, details) => {
        if (open) {
          cue("open");
        } else if (details.returnValue === "confirm") {
          cue("close", { emphasis: "strong" });
        } else {
          cue("close");
        }
      }}
    >
      <AlertDialogTrigger class={buttonClass("secondary", "md")}>
        {t("Reset to defaults")}
      </AlertDialogTrigger>
      <AlertDialogBackdrop class={backdrop} />
      <AlertDialogContent
        class={[
          dialogSurface,
          "fixed inset-0 m-auto h-fit w-88 max-w-[calc(100vw-2rem)] gap-5 rounded-4xl p-6 transition-[opacity,scale] duration-220 ease-out data-ending-style:scale-96 data-ending-style:opacity-0 data-ending-style:duration-160 data-starting-style:scale-96 data-starting-style:opacity-0",
        ]}
      >
        <div class="grid gap-1.5">
          <AlertDialogTitle class="text-lg font-semibold">
            {t("Reset to defaults?")}
          </AlertDialogTitle>
          <AlertDialogDescription class="text-muted-foreground text-sm">
            {resetDescription}
          </AlertDialogDescription>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <AlertDialogClose class={buttonClass("secondary", "lg")}>
            {t("Cancel")}
          </AlertDialogClose>
          <AlertDialogClose
            class={buttonClass("primary", "lg")}
            action={trainer.resetSettings}
            data-agent-confirm={resetDescription}
            value="confirm"
          >
            {t("Reset to defaults")}
          </AlertDialogClose>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</SettingsSection>
