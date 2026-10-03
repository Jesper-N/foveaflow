<script lang="ts">
  import TrainerControlSectionIcon from "$lib/components/trainer/trainer-control-section-icon.svelte";
  import TrainerDrillControls from "$lib/components/trainer/trainer-drill-controls.svelte";
  import TrainerGeneralControls from "$lib/components/trainer/trainer-general-controls.svelte";
  import TrainerMotionControls from "$lib/components/trainer/trainer-motion-controls.svelte";
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
    canToggleDirection,
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
    canToggleDirection: boolean;
    isMotMode: boolean;
    isLilacChaserMode: boolean;
    behaviorValue: BehaviorId;
    patternSelectContentClass: string;
    actions: TrainerDialogActions;
  } = $props();

  let locale = $derived(languageState.locale);
  const sectionDescriptions: Record<ControlSectionId, string> = {
    drill: "Choose your exercise and how it moves.",
    general: "Language, theme, and saved preferences.",
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

<Dialog.Root bind:open>
  <Dialog.Content
    class="flex h-[calc(100dvh-1rem)] max-h-none w-[calc(100dvw-1rem)] max-w-none flex-col gap-0 overflow-hidden rounded-3xl p-0 motion-reduce:transition-none motion-reduce:data-closed:animate-none motion-reduce:data-open:animate-none motion-reduce:**:data-[slot=button]:animate-none motion-reduce:**:data-[slot=button]:transition-none motion-reduce:**:data-[slot=toggle-group-item]:animate-none motion-reduce:**:data-[slot=toggle-group-item]:transition-none sm:max-w-none md:h-[min(40rem,calc(100dvh-2rem))] md:w-[min(55rem,calc(100dvw-2rem))] md:flex-row md:rounded-4xl"
    showCloseButton={false}
    onOpenAutoFocus={handleOpenAutoFocus}
  >
    <Dialog.Description class="sr-only">
      {t(locale, "Change your saved FoveaFlow settings.")}
    </Dialog.Description>
    <Dialog.Close>
      {#snippet child({ props })}
        <Button
          {...props}
          variant="secondary"
          size="icon"
          class="absolute top-3 right-3 z-10 size-11 md:top-4 md:right-4"
          aria-label={t(locale, "Close")}><XIcon /></Button
        >
      {/snippet}
    </Dialog.Close>
    <aside
      class="md:bg-muted/30 flex flex-none flex-col gap-3 border-b p-3 md:basis-46 md:gap-6 md:border-r md:border-b-0 md:py-4"
    >
      <div class="flex min-h-11 items-center gap-2.5 px-2 pr-14 md:px-3">
        <img
          src="/logo-render/logo.svg"
          alt=""
          width="24"
          height="24"
          class="size-6 shrink-0 rounded-sm object-cover"
        />
        <Dialog.Title class="text-base font-semibold"
          >{t(locale, "Controls")}</Dialog.Title
        >
      </div>
      <nav
        class="grid grid-cols-3 gap-1 md:grid-cols-1 md:gap-1.5"
        aria-label={t(locale, "Control sections")}
      >
        {#each availableControlSections as section (section.id)}
          <Button
            variant={currentControlSection === section.id
              ? "secondary"
              : "ghost"}
            class="h-auto min-h-11 min-w-0 flex-col justify-center gap-1.5 rounded-xl px-1 py-2.5 text-xs wrap-anywhere whitespace-normal md:h-9 md:flex-row md:justify-start md:gap-3 md:px-3 md:py-0 md:text-sm"
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
      <!-- The selected tab already names the section on small screens. -->
      <header class="shrink-0 px-7 pt-6 pr-20 pb-3 max-md:sr-only">
        <h2
          id="trainer-settings-heading"
          class="text-xl font-semibold tracking-tight"
        >
          {currentControlSectionLabel}
        </h2>
        <p class="text-muted-foreground mt-1 text-sm">
          {t(locale, sectionDescriptions[currentControlSection])}
        </p>
      </header>
      {#key currentControlSection}
        <section
          id="trainer-settings-panel"
          aria-labelledby="trainer-settings-heading"
          class="min-h-0 flex-1 scrollbar-thin [scrollbar-color:var(--border)_transparent] scrollbar-gutter-stable overflow-y-auto overscroll-contain px-4 py-2 md:px-7 md:pt-0 md:pb-6"
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
              {isLilacChaserMode}
              {canToggleDirection}
            />
          {:else if currentControlSection === "targets"}
            <TrainerTargetControls
              {actions}
              {ballColor}
              bind:settings
              {isMotMode}
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
