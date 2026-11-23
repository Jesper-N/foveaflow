<script lang="ts">
  import { Switch, SwitchThumb } from "@ui-sdk/svelte/switch";

  interface Props {
    label: string;
    checked: boolean;
  }

  let { label, checked = $bindable() }: Props = $props();
</script>

<label
  class="flex min-h-9 cursor-pointer items-center justify-between gap-3 select-none"
>
  <span class="text-md font-medium">{label}</span>
  <Switch
    class="bg-fill-active data-checked:bg-primary relative inline-flex h-6 w-10 shrink-0 items-center rounded-full p-0.75 transition-colors duration-220 ease-out"
    bind:checked
  >
    <SwitchThumb
      class="bg-background shadow-thumb dark:bg-muted-foreground ease-spring data-checked:bg-primary-foreground size-4.5 rounded-full transition-[translate,background-color] duration-220 data-checked:translate-x-4 rtl:data-checked:-translate-x-4"
    />
  </Switch>
</label>
