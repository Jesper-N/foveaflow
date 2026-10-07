<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { t } from "$lib/i18n/translate";
  import CheckIcon from "@lucide/svelte/icons/check";
  import CrosshairIcon from "@lucide/svelte/icons/crosshair";
  import RouteIcon from "@lucide/svelte/icons/route";
  import SettingsIcon from "@lucide/svelte/icons/settings";
  import XIcon from "@lucide/svelte/icons/x";

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
  ] as const satisfies readonly { id: ControlSection }[];

  let section = $derived(
    sections.find(({ id }) => id === current) ?? sections[0]
  );

  // Start on the selected section's tab instead of the close button.
  const focusSelectedTab = (event: Event) => {
    event.preventDefault();
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(`[data-control-section="${current}"]`)
        ?.focus();
    });
  };
</script>

<Dialog.Root bind:open={trainer.controlsOpen}>
  <Dialog.Content
    class="flex h-[calc(100dvh-1rem)] max-h-none w-[calc(100dvw-1rem)] max-w-none flex-col gap-0 overflow-hidden rounded-3xl p-0 motion-reduce:transition-none motion-reduce:data-closed:animate-none motion-reduce:data-open:animate-none motion-reduce:**:data-[slot=button]:animate-none motion-reduce:**:data-[slot=button]:transition-none motion-reduce:**:data-[slot=toggle-group-item]:animate-none motion-reduce:**:data-[slot=toggle-group-item]:transition-none sm:max-w-none md:h-[min(40rem,calc(100dvh-2rem))] md:w-[min(55rem,calc(100dvw-2rem))] md:flex-row md:rounded-4xl"
    showCloseButton={false}
    onOpenAutoFocus={focusSelectedTab}
  >
    <Dialog.Description class="sr-only">
      {t("Change your saved FoveaFlow settings.")}
    </Dialog.Description>
    <Dialog.Close>
      {#snippet child({ props })}
        <Button
          {...props}
          variant="secondary"
          size="icon"
          class="absolute top-3 right-3 z-10 size-11 md:top-4 md:right-4"
          aria-label={t("Close")}
        >
          <XIcon />
        </Button>
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
        <Dialog.Title>
          {t("Controls")}
        </Dialog.Title>
      </div>
      <nav
        class="grid grid-cols-3 gap-1 md:grid-cols-1 md:gap-1.5"
        aria-label={t("Control sections")}
      >
        {#each sections as { id, label, icon: Icon } (id)}
          <Button
            variant={current === id ? "secondary" : "ghost"}
            class="text-caption md:text-body h-auto min-h-11 min-w-0 flex-col justify-center gap-1.5 rounded-xl px-1 py-2.5 wrap-anywhere whitespace-normal aria-pressed:font-semibold md:h-9 md:flex-row md:justify-start md:gap-3 md:px-3 md:py-0"
            data-control-section={id}
            aria-pressed={current === id}
            aria-controls="trainer-settings-panel"
            onclick={() => (current = id)}
          >
            <span data-icon="inline-start"><Icon /></span>
            {t(label)}
          </Button>
        {/each}
      </nav>
    </aside>

    <div class="flex min-h-0 min-w-0 flex-1 flex-col">
      <!-- The selected tab already names the section on small screens. -->
      <header class="shrink-0 px-7 pt-6 pr-20 pb-3 max-md:sr-only">
        <h2 id="trainer-settings-heading" class="text-title font-semibold">
          {t(section.label)}
        </h2>
        <p class="text-muted-foreground mt-2">
          {t(section.description)}
        </p>
      </header>
      <!-- Keyed so a new section starts scrolled to the top. -->
      {#key section.id}
        <section
          id="trainer-settings-panel"
          aria-labelledby="trainer-settings-heading"
          class="min-h-0 flex-1 scrollbar-thin [scrollbar-color:var(--border)_transparent] scrollbar-gutter-stable overflow-y-auto overscroll-contain px-4 py-2 md:px-7 md:pt-0 md:pb-6"
        >
          {#if section.id === "drill"}
            <DrillSettings />
          {:else if section.id === "targets"}
            <TargetSettings />
          {:else}
            <GeneralSettings />
          {/if}
        </section>
      {/key}
      <footer
        class="flex shrink-0 items-center justify-between gap-4 border-t px-4 py-3 md:px-7"
      >
        <p class="text-muted-foreground text-caption flex items-center gap-2">
          <CheckIcon class="size-3.5 shrink-0" />
          {t("Settings save automatically.")}
        </p>
        <Dialog.Close>
          {#snippet child({ props })}
            <Button {...props} variant="secondary" class="min-h-11 min-w-20">
              {t("Done")}
            </Button>
          {/snippet}
        </Dialog.Close>
      </footer>
    </div>
  </Dialog.Content>
</Dialog.Root>
