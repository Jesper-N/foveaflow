<script lang="ts">
  import { cue, isPersonChange } from "$lib/sound/sound.svelte";
  import { Switch, SwitchThumb } from "@ui-sdk/svelte/switch";

  interface Props {
    label: string;
    checked: boolean;
  }

  let { label, checked = $bindable() }: Props = $props();
</script>

<label
  class="group/row flex min-h-9 cursor-pointer items-center justify-between gap-3 select-none"
  data-setting-row
>
  <span class="text-md min-w-0 truncate font-medium">{label}</span>
  <Switch
    class="bg-popover data-checked:bg-primary relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 shadow-[inset_0_0_0_1px_var(--border)] transition-[background-color,box-shadow] duration-300 ease-out data-checked:shadow-none"
    onCheckedChange={(next, details) => {
      if (isPersonChange(details)) {
        cue("toggle", { direction: next ? "forward" : "back" });
      }
    }}
    bind:checked
  >
    <SwitchThumb
      class="bg-faint ease-spring data-checked:bg-primary-foreground size-5 rounded-full transition-[translate,width,background-color] duration-300 group-active/row:w-6.5 data-checked:translate-x-5 group-active/row:data-checked:translate-x-3.5 rtl:data-checked:-translate-x-5 rtl:group-active/row:data-checked:-translate-x-3.5"
    />
  </Switch>
</label>
