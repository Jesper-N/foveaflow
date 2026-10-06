<script lang="ts">
  import * as Field from "$lib/components/ui/field";
  import * as Select from "$lib/components/ui/select";
  import { t } from "$lib/i18n/translate";
  import { getLilacChaserColorName } from "$lib/trainer/settings/options";
  import type { RangedSetting } from "$lib/trainer/settings/settings";
  import { cn } from "$lib/utils";

  import { formatSetting } from "../controls/format-setting";
  import SettingSlider from "../controls/setting-slider.svelte";
  import ColorDot from "../selects/color-dot.svelte";
  import LilacColorSelectContent from "../selects/lilac-color-select-content.svelte";
  import OptionLabel from "../selects/option-label.svelte";
  import { getTrainer } from "../trainer-context";
  import { islandPresenceMotion } from "./island-motion";

  const trainer = getTrainer();

  let lilacColorName = $derived(
    t(getLilacChaserColorName(trainer.settings.lilacChaserBallColor))
  );

  // Both groups share one grid cell and cross-fade when the drill changes.
  const groupClass = cn(
    "col-start-1 row-start-1 grid min-w-0 grid-cols-2 items-start gap-5",
    islandPresenceMotion
  );
</script>

{#snippet slider(setting: RangedSetting, label: string, sliderLabel: string)}
  <Field.Field
    class="grid min-w-0 grid-cols-[1fr_auto] items-center gap-x-2 gap-y-4"
  >
    <span
      class="text-muted-foreground min-w-0 truncate text-xs font-medium"
      title={label}
    >
      {label}
    </span>
    <SettingSlider
      {setting}
      label={sliderLabel}
      class="col-span-2 row-start-2 w-full"
    />
    <span class="col-start-2 row-start-1 text-xs font-medium tabular-nums">
      {formatSetting(setting, trainer.settings[setting])}
    </span>
  </Field.Field>
{/snippet}

<div class="grid">
  <Field.FieldGroup
    class={groupClass}
    data-visible={!trainer.isLilacChaser}
    inert={trainer.isLilacChaser}
  >
    {@render slider("baseRadiusPx", t("Size"), t("Header target size"))}
    {@render slider("speed", t("Speed"), t("Header target speed"))}
  </Field.FieldGroup>

  <Field.FieldGroup
    class={groupClass}
    data-visible={trainer.isLilacChaser}
    inert={!trainer.isLilacChaser}
  >
    <Field.Field class="gap-1">
      <span class="text-muted-foreground text-xs font-medium">
        {t("Ball color")}
      </span>
      <Select.Root
        bind:open={trainer.lilacColorSelectOpen}
        type="single"
        value={trainer.settings.lilacChaserBallColor}
        onValueChange={trainer.setLilacChaserColor}
        onOpenChange={trainer.hud.handleMenuOpenChange}
      >
        <Select.Trigger
          size="sm"
          class="relative w-full min-w-0 px-2.5 before:absolute before:inset-x-0 before:-inset-y-1.5"
          aria-label={t("Lilac Chaser ball color")}
        >
          <OptionLabel class="text-xs" label={lilacColorName}>
            <ColorDot color={trainer.settings.lilacChaserBallColor} />
          </OptionLabel>
        </Select.Trigger>
        <LilacColorSelectContent class="dark" />
      </Select.Root>
    </Field.Field>
    {@render slider("lilacChaserScale", t("Scale"), t("Lilac Chaser scale"))}
  </Field.FieldGroup>
</div>
