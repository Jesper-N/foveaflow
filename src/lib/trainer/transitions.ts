import type { TransitionConfig } from "svelte/transition";

type PrefersReducedMotion = () => boolean;
export type HudControlTransition = (
  node: Element,
  params?: { y?: number; duration?: number },
) => TransitionConfig;

export const hudControlEase = (progress: number) =>
  1 - Math.pow(1 - progress, 3);

export const createHudControlTransition = (
  prefersReducedMotion: PrefersReducedMotion = () => false,
): HudControlTransition => {
  return (
    _node: Element,
    { y = 2, duration = 100 }: { y?: number; duration?: number } = {},
  ): TransitionConfig => {
    if (prefersReducedMotion()) return { duration: 0 };

    return {
      duration,
      easing: hudControlEase,
      css: (t, u) => `
        opacity: ${t};
        transform: translate3d(0, ${y * u}px, 0) scale(${0.985 + t * 0.015});
        transform-origin: center;
      `,
    };
  };
};
