<script lang="ts">
  import type { LucideIcon } from "@lucide/svelte";
  import { Switch, SwitchThumb } from "@ui-sdk/svelte/switch";

  import RowLabel from "./row-label.svelte";

  interface Props {
    label: string;
    icon?: LucideIcon;
    checked: boolean;
  }

  let { label, icon, checked = $bindable() }: Props = $props();
</script>

<label
  class="group/row flex min-h-9 cursor-pointer items-center justify-between gap-3 select-none"
  data-setting-row
>
  <span class="text-md min-w-0 font-medium"><RowLabel {icon} {label} /></span>
  <Switch
    class="bg-fill-active data-checked:bg-primary relative inline-flex h-6 w-10 shrink-0 items-center rounded-full p-0.75 transition-colors duration-220 ease-out"
    bind:checked
  >
    <SwitchThumb
      class="bg-background shadow-thumb ease-spring data-checked:bg-primary-foreground dark:bg-muted-foreground dark:data-checked:bg-primary-foreground h-4.5 w-4.5 rounded-full transition-[translate,width,background-color] duration-220 group-active/row:w-5.5 data-checked:translate-x-4 group-active/row:data-checked:translate-x-3 rtl:data-checked:-translate-x-4 rtl:group-active/row:data-checked:-translate-x-3"
    />
  </Switch>
</label>
