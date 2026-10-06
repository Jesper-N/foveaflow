import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { cn as mergeClasses } from "tailwind-variants";

// tailwind-variants ships its own copy of tailwind-merge for `tv`, so reuse
// it here instead of bundling a second one. It returns null for no classes.
export const cn = (...inputs: ClassValue[]) => mergeClasses(clsx(inputs)) ?? "";

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
