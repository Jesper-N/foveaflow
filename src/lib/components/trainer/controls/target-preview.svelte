<script lang="ts">
  import { settingRanges } from "$lib/trainer/settings/settings";
  import type { Attachment } from "svelte/attachments";

  import TargetFormGlyph from "../../icons/target-form-glyph.svelte";
  import { getTrainer } from "../trainer-context";

  const trainer = getTrainer();

  const MIN_SCALE = 0.45;

  let sizeRatio = $derived(
    (trainer.settings.baseRadiusPx - settingRanges.baseRadiusPx.min) /
      (settingRanges.baseRadiusPx.max - settingRanges.baseRadiusPx.min)
  );

  const paint: Attachment<HTMLElement> = (node) => {
    node.style.color = trainer.targetColor;
    node.style.opacity = String(trainer.settings.targetOpacity);
    node.style.scale = String(MIN_SCALE + sizeRatio * (1 - MIN_SCALE));
  };

  const letter: Attachment<HTMLElement> = (node) => {
    node.style.color = trainer.letterColor;
    node.style.fontWeight = String(trainer.settings.letterWeight);
    node.style.fontSize = `${Math.round(trainer.settings.letterScale * 84)}px`;
  };
</script>

<div
  class="canvas-grid relative grid h-40 place-items-center overflow-hidden rounded-2xl"
  aria-hidden="true"
>
  <span
    class="ease-spring relative grid size-32 place-items-center transition-[scale,opacity,color] duration-260"
    {@attach paint}
  >
    <TargetFormGlyph class="size-full" form={trainer.settings.targetForm} />
    {#if trainer.settings.letterEnabled}
      <span class="absolute leading-none" {@attach letter}>K</span>
    {/if}
  </span>
</div>
