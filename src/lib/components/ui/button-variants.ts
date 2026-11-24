import { pressable } from "./styles";

const buttonVariants = {
  ghost:
    "relative isolate text-muted-foreground before:absolute before:inset-0 before:-z-1 before:scale-86 before:rounded-full before:bg-fill before:opacity-0 before:transition-[opacity,scale] before:duration-260 before:ease-spring hover:text-foreground hover:before:scale-100 hover:before:opacity-100 data-open:text-foreground data-open:before:scale-100 data-open:before:opacity-100",
  primary: "bg-primary text-primary-foreground hover:bg-primary/88",
  secondary: "bg-fill text-foreground hover:bg-fill-hover",
} as const;

const buttonSizes = {
  icon: "size-9 pointer-coarse:size-11 [&_svg]:size-4.5",
  lg: "h-10 px-5 text-md pointer-coarse:h-11 [&_svg]:size-4",
  md: "h-9 px-4 text-md pointer-coarse:h-11 [&_svg]:size-4",
  sm: "h-7 px-3 text-sm [&_svg]:size-3.5",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;

export type ButtonSize = keyof typeof buttonSizes;

export const buttonClass = (
  variant: ButtonVariant = "secondary",
  size: ButtonSize = "md"
) => [
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-220 [&_svg]:ease-spring hover:[&_svg]:scale-104",
  pressable,
  buttonVariants[variant],
  buttonSizes[size],
];
