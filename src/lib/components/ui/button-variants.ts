import { pressable } from "./styles";

const buttonVariants = {
  ghost: "text-muted-foreground hover:bg-fill hover:text-foreground",
  primary: "bg-primary text-primary-foreground hover:opacity-88",
  secondary: "bg-fill text-foreground hover:bg-fill-hover",
} as const;

const buttonSizes = {
  icon: "size-9 pointer-coarse:size-11 [&_svg]:size-4.5",
  lg: "h-10 px-5 text-md pointer-coarse:h-11",
  md: "h-9 px-4 text-md pointer-coarse:h-11",
  sm: "h-7 px-3 text-sm",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;

export type ButtonSize = keyof typeof buttonSizes;

export const buttonClass = (
  variant: ButtonVariant = "secondary",
  size: ButtonSize = "md"
) => [
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  pressable,
  buttonVariants[variant],
  buttonSizes[size],
];
