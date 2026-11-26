<script lang="ts">
  import { t } from "$lib/i18n/translate";
  import { patternGlyphs } from "$lib/trainer/glyphs/pattern-glyphs";
  import {
    createDefaultSettings,
    settingRanges,
  } from "$lib/trainer/settings/settings";
  import type { Attachment } from "svelte/attachments";

  import { formatSetting } from "../trainer/controls/format-setting";
  import Slider from "../ui/slider.svelte";

  const ROUTE = patternGlyphs.lissajous;
  const LAPS_PER_SECOND_PER_SPEED = 1 / 160;
  const RADIUS_PER_PX = 1.5 / 40;

  const defaults = createDefaultSettings();

  let speed = $state(defaults.speed);
  let size = $state(defaults.baseRadiusPx);

  let radius = $derived(Math.max(0.35, size * RADIUS_PER_PX));

  const run: Attachment<SVGCircleElement> = (target) => {
    target.style.setProperty("offset-path", `path("${ROUTE}")`);
    target.style.setProperty("offset-distance", "30%");

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let progress = 0.3;
    let frame = 0;
    let previous = 0;

    const step = (now: number) => {
      const elapsed =
        previous === 0 ? 0 : Math.min(0.05, (now - previous) / 1000);

      previous = now;
      progress = (progress + elapsed * speed * LAPS_PER_SECOND_PER_SPEED) % 1;
      target.style.setProperty("offset-distance", `${progress * 100}%`);
      frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      previous = 0;

      if (!still && entry?.isIntersecting === true) {
        frame = requestAnimationFrame(step);
      }
    });

    observer.observe(target.ownerSVGElement ?? target);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  };
</script>

<div
  class="bg-card grid gap-2 rounded-4xl p-2 md:grid-cols-[minmax(0,1fr)_minmax(0,19rem)]"
>
  <div class="canvas-grid overflow-hidden rounded-3xl">
    <svg
      class="text-foreground aspect-4/3 size-full"
      aria-hidden="true"
      fill="none"
      viewBox="0 0 32 24"
    >
      <path
        d={ROUTE}
        opacity="0.14"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-width="0.3"
      />
      <circle class="fill-target" {@attach run} r={radius} />
    </svg>
  </div>
  <div class="grid content-center p-4 sm:p-5">
    <div class="grid gap-2">
      <Slider
        format={(value) => formatSetting("speed", value)}
        label={t("Speed")}
        max={settingRanges.speed.max}
        min={settingRanges.speed.min}
        onValueChange={(value) => (speed = value)}
        step={settingRanges.speed.step}
        value={speed}
      />
      <Slider
        format={(value) => formatSetting("baseRadiusPx", value)}
        label={t("Size")}
        max={settingRanges.baseRadiusPx.max}
        min={settingRanges.baseRadiusPx.min}
        onValueChange={(value) => (size = value)}
        step={settingRanges.baseRadiusPx.step}
        thumbLabel={t("Target size")}
        value={size}
      />
    </div>
  </div>
</div>
