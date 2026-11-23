<script lang="ts">
  let {
    id,
    label,
    checked = $bindable(),
  }: { id: string; label: string; checked: boolean } = $props();
</script>

<div>
  <label for={id}>{label}</label>
  <input {id} role="switch" type="checkbox" bind:checked />
</div>
