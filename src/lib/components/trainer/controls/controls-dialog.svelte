<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { XIcon } from "@lucide/svelte";
  import {
    Dialog,
    DialogBackdrop,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle,
  } from "@ui-sdk/svelte/dialog";
  import {
    Tabs,
    TabsIndicator,
    TabsList,
    TabsPanel,
    TabsTab,
  } from "@ui-sdk/svelte/tabs";

  import { buttonClass } from "../../ui/button-variants";
  import {
    backdrop,
    dialogSurface,
    segmentItem,
    segmentThumb,
    segmentTrack,
    sheetPresentation,
  } from "../../ui/styles";
  import { getTrainer } from "../trainer-context";
  import DrillSettings from "./drill-settings.svelte";
  import GeneralSettings from "./general-settings.svelte";
  import TargetSettings from "./target-settings.svelte";

  const trainer = getTrainer();

  const tabs = [
    { label: "Drill", value: "drill" },
    { label: "Targets", value: "targets" },
    { label: "General", value: "general" },
  ];

  let tab = $state("drill");
</script>

<Dialog presentation="auto" bind:open={trainer.controlsOpen}>
  <DialogBackdrop class={[backdrop, "bg-black/8 dark:bg-black/32"]} />
  <DialogContent
    class={[
      dialogSurface,
      sheetPresentation,
      "data-[presentation=dialog]:fixed data-[presentation=dialog]:inset-y-2 data-[presentation=dialog]:inset-s-auto data-[presentation=dialog]:inset-e-2 data-[presentation=dialog]:h-auto data-[presentation=dialog]:max-h-none data-[presentation=dialog]:w-104 data-[presentation=dialog]:max-w-[calc(100vw-1rem)] data-[presentation=dialog]:rounded-4xl",
      "data-[presentation=dialog]:ease-drawer data-[presentation=dialog]:transition-[opacity,translate] data-[presentation=dialog]:duration-300 data-[presentation=dialog]:data-ending-style:translate-x-6 data-[presentation=dialog]:data-ending-style:opacity-0 data-[presentation=dialog]:data-ending-style:duration-200 data-[presentation=dialog]:data-starting-style:translate-x-6 data-[presentation=dialog]:data-starting-style:opacity-0 rtl:data-[presentation=dialog]:data-ending-style:-translate-x-6 rtl:data-[presentation=dialog]:data-starting-style:-translate-x-6",
    ]}
    finalFocus={trainer.panelReturnFocus}
  >
    <header class="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
      <div class="grid gap-0.5">
        <DialogTitle class="text-lg font-semibold">{t("Controls")}</DialogTitle>
        <DialogDescription class="text-muted-foreground text-sm">
          {t("Change your saved FoveaFlow settings.")}
        </DialogDescription>
      </div>
      <DialogClose class={buttonClass("ghost", "icon")} aria-label={t("Close")}>
        <XIcon aria-hidden="true" />
      </DialogClose>
    </header>

    <Tabs class="flex min-h-0 flex-1 flex-col" bind:value={tab}>
      <TabsList class={[segmentTrack, "mx-5"]} aria-label={t("Controls")}>
        <TabsIndicator
          class={[
            segmentThumb,
            "top-(--active-tab-top) left-(--active-tab-left) h-(--active-tab-height) w-(--active-tab-width)",
          ]}
        />
        {#each tabs as item (item.value)}
          <TabsTab
            class={[segmentItem, "data-selected:text-foreground"]}
            value={item.value}
          >
            {t(item.label)}
          </TabsTab>
        {/each}
      </TabsList>

      <div
        class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pt-4 pb-2"
      >
        <TabsPanel class="grid gap-5 outline-none" value="drill">
          <DrillSettings />
        </TabsPanel>
        <TabsPanel class="grid gap-5 outline-none" value="targets">
          <TargetSettings />
        </TabsPanel>
        <TabsPanel class="grid gap-5 outline-none" value="general">
          <GeneralSettings />
        </TabsPanel>
      </div>
    </Tabs>

    <footer class="flex items-center justify-between gap-4 px-5 pt-3 pb-5">
      <p class="text-muted-foreground text-sm">
        {t("Settings save automatically.")}
      </p>
      <DialogClose class={buttonClass("primary", "md")}>{t("Done")}</DialogClose
      >
    </footer>
  </DialogContent>
</Dialog>
