<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { t } from "$lib/i18n/translate";
  import MoonIcon from "@lucide/svelte/icons/moon";
  import SunIcon from "@lucide/svelte/icons/sun";
  import { userPrefersMode } from "mode-watcher";

  import { selectTheme, themeOptions } from "./theme-options";
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        class="text-muted-foreground relative"
        aria-label={t("Theme")}
        size="icon-lg"
        title={t("Theme")}
        variant="ghost"
      >
        <!-- The sun turns into the moon in dark mode. -->
        <SunIcon
          class="scale-100 rotate-0 transition-[transform,opacity] duration-150 motion-reduce:transition-none dark:scale-0 dark:-rotate-90 dark:opacity-0"
        />
        <MoonIcon
          class="absolute scale-0 rotate-90 opacity-0 transition-[transform,opacity] duration-150 motion-reduce:transition-none dark:scale-100 dark:rotate-0 dark:opacity-100"
        />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="min-w-40" align="end" sideOffset={8}>
    <DropdownMenu.Group>
      <DropdownMenu.GroupHeading>{t("Theme")}</DropdownMenu.GroupHeading>
      <DropdownMenu.RadioGroup
        onValueChange={selectTheme}
        value={userPrefersMode.current}
      >
        {#each themeOptions as option (option.value)}
          <DropdownMenu.RadioItem class="min-h-10 gap-2" value={option.value}>
            <option.icon />{t(option.label)}
          </DropdownMenu.RadioItem>
        {/each}
      </DropdownMenu.RadioGroup>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
