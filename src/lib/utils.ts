import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { cnMerge, createTV } from "tailwind-variants";

// tailwind-merge reads unknown `text-*` classes as colors, so it would drop
// `text-body` or `text-trim` next to `text-muted-foreground`.
const twMergeConfig = {
  extend: {
    classGroups: { "text-trim": ["text-trim"] },
    theme: { text: ["display", "title", "subtitle", "body", "caption"] },
  },
};

// tailwind-variants ships its own copy of tailwind-merge for `tv`, so reuse
// it here instead of bundling a second one. It returns null for no classes.
export const cn = (...inputs: ClassValue[]) =>
  cnMerge(clsx(inputs))({ twMergeConfig }) ?? "";

export const tv = createTV({ twMergeConfig });

export type WithoutChild<T> = T extends { child?: unknown }
  ? Omit<T, "child">
  : T;
export type WithoutChildren<T> = T extends { children?: unknown }
  ? Omit<T, "children">
  : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
  ref?: U | null;
};
