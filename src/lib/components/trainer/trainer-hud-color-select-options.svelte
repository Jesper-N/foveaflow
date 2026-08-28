<script lang="ts">
  import * as Select from "$lib/components/ui/select/index.js";
  import type { AppLocale } from "$lib/i18n/locales";
  import { t } from "$lib/i18n/translate";
  import { lilacChaserColorOptions } from "$lib/trainer/options";

  let { locale }: { locale: AppLocale } = $props();
</script>

<Select.Group>
  {#each lilacChaserColorOptions as option (option.id)}
    <Select.Item value={option.id}>
      <span class="flex min-w-0 items-center gap-2">
        <svg
          viewBox="0 0 12 12"
          class="border-border/60 size-3 shrink-0 rounded-full border"
          aria-hidden="true"
        >
          <circle cx="6" cy="6" r="6" fill={option.id} />
        </svg>
        <span class="truncate">{t(locale, option.name)}</span>
      </span>
    </Select.Item>
  {/each}
</Select.Group>
