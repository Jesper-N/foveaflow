<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import CrosshairIcon from "@lucide/svelte/icons/crosshair";
  import RouteIcon from "@lucide/svelte/icons/route";
  import SettingsIcon from "@lucide/svelte/icons/settings";
  import XIcon from "@lucide/svelte/icons/x";

  import { closeOnBackdropClick, showModalWhen } from "../modal-dialog";
  import { getTrainer } from "../trainer-context";
  import DrillSettings from "./drill-settings.svelte";
  import GeneralSettings from "./general-settings.svelte";
  import TargetSettings from "./target-settings.svelte";

  type ControlSection = "drill" | "targets" | "general";

  const trainer = getTrainer();

  // The dialog stays mounted, so the last section reopens next time.
  let current = $state<ControlSection>("targets");

  const sections = [
    {
      description: "Choose your exercise and how it moves.",
      icon: RouteIcon,
      id: "drill",
      label: "Drill",
    },
    {
      description: "Fine-tune what you follow.",
      icon: CrosshairIcon,
      id: "targets",
      label: "Targets",
    },
    {
      description: "Language, theme, and saved preferences.",
      icon: SettingsIcon,
      id: "general",
      label: "General",
    },
  ] as const satisfies readonly {
    description: string;
    icon: typeof RouteIcon;
    id: ControlSection;
    label: string;
  }[];

  let section = $derived(
    sections.find(({ id }) => id === current) ?? sections[0]
  );

  // Start on the selected section's tab instead of the close button.
  const showControls = showModalWhen(
    () => trainer.controlsOpen,
    (dialog) => {
      dialog
        .querySelector<HTMLElement>(`[data-control-section="${current}"]`)
        ?.focus();
    }
  );
</script>

<dialog
  class="m-auto h-[calc(100dvh-1rem)] max-h-none w-[calc(100dvw-1rem)] max-w-3xl flex-col open:flex"
  {@attach showControls}
  {@attach closeOnBackdropClick}
  aria-describedby="trainer-controls-description"
  aria-labelledby="trainer-controls-title"
  onclose={() => (trainer.controlsOpen = false)}
>
  <p id="trainer-controls-description" class="sr-only">
    {t("Change your saved FoveaFlow settings.")}
  </p>

  <header class="flex items-center justify-between gap-2 border-b p-3">
    <h2 id="trainer-controls-title">{t("Controls")}</h2>
    <form method="dialog">
      <button
        class="inline-flex size-11 items-center justify-center"
        aria-label={t("Close")}
        type="submit"
      >
        <XIcon aria-hidden="true" />
      </button>
    </form>
  </header>

  <nav class="flex gap-1 border-b p-3" aria-label={t("Control sections")}>
    {#each sections as { id, label, icon: Icon } (id)}
      <button
        class="inline-flex min-h-11 items-center gap-2 px-2 aria-pressed:font-bold"
        aria-controls="trainer-settings-panel"
        aria-pressed={current === id}
        data-control-section={id}
        onclick={() => (current = id)}
        type="button"
      >
        <Icon class="size-4" aria-hidden="true" />
        {t(label)}
      </button>
    {/each}
  </nav>

  <!-- Keyed so a new section starts scrolled to the top. -->
  {#key section.id}
    <section
      id="trainer-settings-panel"
      class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
      aria-labelledby="trainer-settings-heading"
    >
      <h2 id="trainer-settings-heading">{t(section.label)}</h2>
      <p>{t(section.description)}</p>
      {#if section.id === "drill"}
        <DrillSettings />
      {:else if section.id === "targets"}
        <TargetSettings />
      {:else}
        <GeneralSettings />
      {/if}
    </section>
  {/key}

  <footer class="flex items-center justify-between gap-4 border-t p-3">
    <p>{t("Settings save automatically.")}</p>
    <form method="dialog">
      <button class="min-h-11 px-4" type="submit">{t("Done")}</button>
    </form>
  </footer>
</dialog>
