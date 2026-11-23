<script lang="ts">
  import * as Field from "$lib/components/ui/field";
  import { Switch } from "$lib/components/ui/switch";

  let {
    id,
    label,
    checked = $bindable(),
  }: { id: string; label: string; checked: boolean } = $props();
</script>

<Field.Field class="min-h-17 justify-between py-3" orientation="horizontal">
  <Field.FieldLabel for={id}>{label}</Field.FieldLabel>
  <Switch {id} bind:checked />
</Field.Field>
