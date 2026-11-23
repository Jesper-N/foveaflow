<script lang="ts">
  let {
    id,
    label,
    value,
    onValueChange,
  }: {
    id: string;
    label: string;
    /** A `#rrggbb` hex color. */
    value: string;
    onValueChange: (color: string) => void;
  } = $props();
</script>

<div>
  <label for={id}>{label}</label>
  <input
    {id}
    oninput={(event) => {
      onValueChange(event.currentTarget.value);
    }}
    type="color"
    {value}
  />
</div>
