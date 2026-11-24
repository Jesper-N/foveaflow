export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectGroup {
  label?: string;
  options: readonly SelectOption[];
}
