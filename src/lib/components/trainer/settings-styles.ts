// A group of setting rows. The first group sits under the page title; later groups get a muted legend.
export const settingsSectionClass =
  "min-w-0 gap-0 [&+fieldset]:mt-8 [&>legend]:float-left [&>legend]:mb-1 [&>legend]:w-full [&>legend]:text-muted-foreground";

export const settingsRowsClass = "gap-0 divide-y divide-border/60";

// Label on the left, control in a fixed right column. Stacks when the panel is narrow.
export const settingsRowClass =
  "grid gap-3 py-3 @lg/field-group:min-h-17 @lg/field-group:grid-cols-[minmax(0,1fr)_20rem] @lg/field-group:items-center @lg/field-group:gap-8";

// The track stays compact while the invisible band keeps a 44px hit area.
export const compactSliderClass =
  "h-4 before:absolute before:inset-x-0 before:-inset-y-3.5";

export const settingsSwitchRowClass = "min-h-17 justify-between py-3";

// Matches the select trigger so every value control shares one shape.
export const settingsColorClass =
  "bg-input/50 has-focus-visible:border-ring has-focus-visible:ring-ring/30 flex min-h-11 min-w-0 cursor-pointer items-center gap-3 rounded-3xl border border-transparent px-3 transition-[color,box-shadow,background-color] has-focus-visible:ring-3";

export const settingsColorValueClass =
  "min-w-0 truncate text-sm uppercase tabular-nums slashed-zero";
