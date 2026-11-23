<script lang="ts">
  import { Button as UiButton } from "@ui-sdk/svelte/button";
  import type { ComponentProps } from "svelte";

  import { buttonClass } from "./button-variants";
  import type { ButtonSize, ButtonVariant } from "./button-variants";

  type Props = ComponentProps<typeof UiButton> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  };

  let {
    variant = "secondary",
    size = "md",
    class: className,
    ...rest
  }: Props = $props();
</script>

<UiButton class={[buttonClass(variant, size), className]} {...rest} />
