<script lang="ts">
  let {
    id,
    label,
    checked = $bindable(),
  }: { id: string; label: string; checked: boolean } = $props();
</script>

<div class="flex min-h-11 items-center justify-between gap-3 py-3">
  <label for={id}>{label}</label>
  <input {id} role="switch" type="checkbox" bind:checked />
</div>
