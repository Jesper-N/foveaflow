<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import type { AppLocale } from "$lib/i18n/locales";
  import { t } from "$lib/i18n/translate";
  import Monitor from "@lucide/svelte/icons/monitor";
  import Moon from "@lucide/svelte/icons/moon";
  import Sun from "@lucide/svelte/icons/sun";
  import { ModeWatcher, setMode, userPrefersMode } from "mode-watcher";

  let { locale }: { locale: AppLocale } = $props();

  const selectMode = (value: string) => {
    if (value === "light" || value === "dark" || value === "system") {
      setMode(value);
    }
  };
</script>

<ModeWatcher disableHeadScriptInjection />
<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="ghost"
        size="icon-lg"
        class="relative rounded-lg"
        aria-label={t(locale, "Theme")}
        title={t(locale, "Theme")}
      >
        <Sun
          class="scale-100 rotate-0 transition-[transform,opacity] duration-150 motion-reduce:transition-none dark:scale-0 dark:-rotate-90 dark:opacity-0"
        />
        <Moon
          class="absolute scale-0 rotate-90 opacity-0 transition-[transform,opacity] duration-150 motion-reduce:transition-none dark:scale-100 dark:rotate-0 dark:opacity-100"
        />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end" sideOffset={8} class="min-w-40">
    <DropdownMenu.Group>
      <DropdownMenu.GroupHeading>{t(locale, "Theme")}</DropdownMenu.GroupHeading
      >
      <DropdownMenu.RadioGroup
        value={userPrefersMode.current}
        onValueChange={selectMode}
      >
        <DropdownMenu.RadioItem value="light" class="min-h-10 gap-2">
          <Sun />{t(locale, "Light")}
        </DropdownMenu.RadioItem>
        <DropdownMenu.RadioItem value="dark" class="min-h-10 gap-2">
          <Moon />{t(locale, "Dark")}
        </DropdownMenu.RadioItem>
        <DropdownMenu.RadioItem value="system" class="min-h-10 gap-2">
          <Monitor />{t(locale, "System")}
        </DropdownMenu.RadioItem>
      </DropdownMenu.RadioGroup>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
