<script lang="ts">
  import TrainerControlSectionIcon from "$lib/components/trainer/trainer-control-section-icon.svelte";
  import TrainerDrillControls from "$lib/components/trainer/trainer-drill-controls.svelte";
  import TrainerGeneralControls from "$lib/components/trainer/trainer-general-controls.svelte";
  import TrainerMotionControls from "$lib/components/trainer/trainer-motion-controls.svelte";
  import TrainerScreenControls from "$lib/components/trainer/trainer-screen-controls.svelte";
  import TrainerTargetControls from "$lib/components/trainer/trainer-target-controls.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import type { TrainerSettings } from "$lib/engine/presets";
  import { languageState } from "$lib/i18n/state.svelte";
  import { t } from "$lib/i18n/translate";
  import type { BehaviorId } from "$lib/trainer/behavior";
  import type { TrainerDialogActions } from "$lib/trainer/control-actions";
  import type { ControlSection, ControlSectionId } from "$lib/trainer/options";
  import CheckIcon from "@lucide/svelte/icons/check";
  import XIcon from "@lucide/svelte/icons/x";

  let {
    open = $bindable(false),
    settings = $bindable(),
    ballColor,
    availableControlSections,
    currentControlSection,
    currentControlSectionLabel,
    motionDirectionLabel,
    canToggleDirection,
    isDarkMode,
    isMotMode,
    isLilacChaserMode,
    behaviorValue,
    patternSelectContentClass,
    actions,
  }: {
    open: boolean;
    settings: TrainerSettings;
    ballColor: string;
    availableControlSections: readonly ControlSection[];
    currentControlSection: ControlSectionId;
    currentControlSectionLabel: string;
    motionDirectionLabel: string;
    canToggleDirection: boolean;
    isDarkMode: boolean;
    isMotMode: boolean;
    isLilacChaserMode: boolean;
    behaviorValue: BehaviorId;
    patternSelectContentClass: string;
    actions: TrainerDialogActions;
  } = $props();

  let locale = $derived(languageState.locale);
  const sectionDescriptions: Record<ControlSectionId, string> = {
    display: "Match the trainer to your screen.",
    drill: "Choose your exercise and how it moves.",
    general: "Language and saved preferences.",
    targets: "Fine-tune what you follow.",
  };

  const handleOpenAutoFocus = (event: Event) => {
    event.preventDefault();
    requestAnimationFrame(() => {
      const buttons = document.querySelectorAll<HTMLButtonElement>(
        `[data-control-section="${currentControlSection}"]`
      );
      [...buttons]
        .find((button) => button.getClientRects().length > 0)
        ?.focus();
    });
  };

  const handleSectionClick = (event: MouseEvent) => {
    const { currentTarget } = event;
    if (!(currentTarget instanceof HTMLButtonElement)) {
      return;
    }
    const { controlSection } = currentTarget.dataset;
    const section = availableControlSections.find(
      ({ id }) => id === controlSection
    );
    if (section) {
      actions.onControlSectionChange(section.id);
    }
  };
</script>

{#snippet sliderRow(label: string, valueLabel: string)}
  <span
    class="text-muted-foreground flex items-center justify-between gap-4 text-xs"
  >
    {label}
    <strong class="text-foreground font-semibold tabular-nums">
      {valueLabel}
    </strong>
  </span>
{/snippet}

<Dialog.Root bind:open>
  <Dialog.Content
    class="animation-duration-[160ms] flex h-[calc(100dvh-1rem)] max-h-none w-[calc(100dvw-1rem)] max-w-none flex-col gap-0 overflow-hidden rounded-[1.5rem] p-0 motion-reduce:transition-none motion-reduce:data-closed:animate-none motion-reduce:data-open:animate-none motion-reduce:**:data-[slot=button]:animate-none motion-reduce:**:data-[slot=button]:transition-none motion-reduce:**:data-[slot=toggle-group-item]:animate-none motion-reduce:**:data-[slot=toggle-group-item]:transition-none sm:max-w-none md:h-[min(40rem,calc(100dvh-2rem))] md:w-[min(55rem,calc(100dvw-2rem))] md:flex-row md:rounded-[2rem]"
    showCloseButton={false}
    onOpenAutoFocus={handleOpenAutoFocus}
  >
    <Dialog.Title class="sr-only">{t(locale, "Controls")}</Dialog.Title>
    <Dialog.Description class="sr-only">
      {t(locale, "Change your saved FoveaFlow settings.")}
    </Dialog.Description>
    <aside
      class="md:bg-muted/30 flex flex-none flex-col border-b p-3 md:basis-46 md:border-r md:border-b-0 md:py-7"
    >
      <div class="hidden flex-col gap-1 px-3 pb-8 md:flex">
        <span class="font-semibold">FoveaFlow</span>
        <span class="text-muted-foreground text-xs"
          >{t(locale, "Controls")}</span
        >
      </div>
      <nav
        class="grid grid-cols-4 gap-1 max-[359px]:grid-cols-2 md:grid-cols-1 md:gap-1.5"
        aria-label={t(locale, "Control sections")}
      >
        {#each availableControlSections as section (section.id)}
          <Button
            variant={currentControlSection === section.id
              ? "secondary"
              : "ghost"}
            class="h-auto min-h-11 min-w-0 flex-col justify-center gap-1.5 rounded-[0.75rem] px-1 py-2.5 text-xs wrap-anywhere whitespace-normal max-[359px]:flex-row max-[359px]:justify-start max-[359px]:gap-2 max-[359px]:px-3 max-[359px]:py-2 md:h-9 md:flex-row md:justify-start md:gap-3 md:px-3 md:py-0 md:text-sm"
            data-control-section={section.id}
            aria-pressed={currentControlSection === section.id}
            aria-controls="trainer-settings-panel"
            onclick={handleSectionClick}
          >
            <span data-icon="inline-start"
              ><TrainerControlSectionIcon icon={section.icon} /></span
            >
            {section.label}
          </Button>
        {/each}
      </nav>
    </aside>
    <div class="flex min-h-0 min-w-0 flex-1 flex-col">
      <header
        class="flex shrink-0 items-start justify-between gap-4 px-4 pt-5 pb-3 md:px-7 md:pt-6 md:pb-5"
      >
        <div class="min-w-0">
          <h2 id="trainer-settings-heading" class="text-xl font-semibold">
            {currentControlSectionLabel}
          </h2>
          <p class="text-muted-foreground mt-1 text-sm">
            {t(locale, sectionDescriptions[currentControlSection])}
          </p>
        </div>
        <Dialog.Close>
          {#snippet child({ props })}
            <Button
              {...props}
              variant="ghost"
              size="icon"
              class="size-11 shrink-0"
              aria-label={t(locale, "Close")}><XIcon /></Button
            >
          {/snippet}
        </Dialog.Close>
      </header>
      {#key currentControlSection}
        <section
          id="trainer-settings-panel"
          aria-labelledby="trainer-settings-heading"
          class="min-h-0 flex-1 scrollbar-thin [scrollbar-color:var(--border)_transparent] scrollbar-gutter-stable overflow-y-auto overscroll-contain px-4 pb-4 **:data-[slot=slider]:min-h-8 md:px-7 md:pb-6"
        >
          {#if currentControlSection === "drill"}
            <TrainerDrillControls
              {actions}
              {settings}
              {patternSelectContentClass}
            />
            <TrainerMotionControls
              {behaviorValue}
              {actions}
              bind:settings
              {sliderRow}
              {isLilacChaserMode}
              {canToggleDirection}
              {motionDirectionLabel}
            />
          {:else if currentControlSection === "targets"}
            <TrainerTargetControls
              {actions}
              {ballColor}
              bind:settings
              {isMotMode}
              {isLilacChaserMode}
              {sliderRow}
            />
          {:else if currentControlSection === "display"}
            <TrainerScreenControls
              {actions}
              {settings}
              {isDarkMode}
              {isLilacChaserMode}
            />
          {:else}
            <TrainerGeneralControls {actions} />
          {/if}
        </section>
      {/key}
      <footer
        class="flex shrink-0 items-center justify-between gap-4 border-t px-4 py-3 md:px-7"
      >
        <p class="text-muted-foreground flex items-center gap-2 text-xs">
          <CheckIcon class="size-3.5 shrink-0" />{t(
            locale,
            "Settings save automatically."
          )}
        </p>
        <Dialog.Close>
          {#snippet child({ props })}
            <Button {...props} variant="secondary" class="min-h-11 min-w-20"
              >{t(locale, "Done")}</Button
            >
          {/snippet}
        </Dialog.Close>
      </footer>
    </div>
  </Dialog.Content>
</Dialog.Root>
