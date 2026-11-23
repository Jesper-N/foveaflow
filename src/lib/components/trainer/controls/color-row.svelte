<script lang="ts">
  interface Props {
    id: string;
    label: string;
    value: string;
    onValueChange: (color: string) => void;
  }

  let { id, label, value, onValueChange }: Props = $props();
</script>

<div class="flex min-h-9 items-center justify-between gap-3">
  <label class="text-md font-medium" for={id}>{label}</label>
  <span class="flex items-center gap-2.5">
    <span
      class="text-muted-foreground text-sm uppercase tabular-nums"
      aria-hidden="true"
    >
      {value}
    </span>
    <input
      {id}
      class="size-8 cursor-pointer appearance-none rounded-full border-0 bg-transparent p-0 shadow-[inset_0_0_0_1px_var(--border)] pointer-coarse:size-11 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
      oninput={(event) => {
        onValueChange(event.currentTarget.value);
      }}
      type="color"
      {value}
    />
  </span>
</div>
