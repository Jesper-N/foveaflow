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
    class="bg-popover data-checked:bg-accent relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 shadow-[inset_0_0_0_1px_var(--border)] transition-[background-color,box-shadow] duration-300 ease-out data-checked:shadow-none"
    bind:checked
  >
    <SwitchThumb
      class="bg-faint ease-spring data-checked:bg-accent-foreground size-5 rounded-full transition-[translate,width,background-color] duration-300 group-active/row:w-6.5 data-checked:translate-x-5 group-active/row:data-checked:translate-x-3.5 rtl:data-checked:-translate-x-5 rtl:group-active/row:data-checked:-translate-x-3.5"
    />
  </Switch>
</label>
