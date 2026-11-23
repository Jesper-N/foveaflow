<script lang="ts">
  let {
    legend,
    name,
    value,
    options,
    onValueChange,
  }: {
    legend: string;
    name: string;
    value: string;
    options: readonly { value: string; label: string }[];
    onValueChange: (value: string) => void;
  } = $props();
</script>

<fieldset>
  <legend>{legend}</legend>
  {#each options as option (option.value)}
    <label>
      <input
        {name}
        checked={option.value === value}
        onchange={() => {
          onValueChange(option.value);
        }}
        type="radio"
        value={option.value}
      />
      {option.label}
    </label>
  {/each}
</fieldset>
