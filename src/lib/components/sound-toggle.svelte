<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { cue, sound } from "$lib/sound/sound.svelte";
  import { Volume2Icon, VolumeXIcon } from "@lucide/svelte";
  import { Toggle } from "@ui-sdk/svelte/toggle";

  import { pressable } from "./ui/styles";
</script>

<Toggle
  class={[
    "text-muted-foreground hover:bg-fill hover:text-foreground inline-flex h-9 items-center rounded-full px-2.5 pointer-coarse:h-11",
    pressable,
  ]}
  aria-label={t("Sound")}
  data-tip={t("Sound")}
  onPressedChange={(next) => {
    cue("toggle", { direction: next ? "forward" : "back" });
  }}
  bind:pressed={() => sound.enabled, sound.setEnabled}
>
  {#if sound.enabled}
    <Volume2Icon class="size-4" aria-hidden="true" />
  {:else}
    <VolumeXIcon class="size-4" aria-hidden="true" />
  {/if}
</Toggle>
