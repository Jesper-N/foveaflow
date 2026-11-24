<script lang="ts">
  import { cue, isPersonChange } from "$lib/sound/sound.svelte";
  import { PlusIcon } from "@lucide/svelte";
  import {
    Accordion,
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    AccordionTrigger,
  } from "@ui-sdk/svelte/accordion";
  import type { ClassValue } from "svelte/elements";

  interface Props {
    items: readonly { question: string; answer: string }[];
    headingLevel?: 3 | 4;
    class?: ClassValue;
  }

  let { items, headingLevel = 3, class: className }: Props = $props();

  let headingTag = $derived(headingLevel === 4 ? "h4" : "h3");
  let openCount = 0;
</script>

<Accordion
  class={["grid", className]}
  onValueChange={(next, details) => {
    if (isPersonChange(details)) {
      if (next.length > openCount) {
        cue("open", { emphasis: "subtle" });
      } else {
        cue("close", { emphasis: "subtle" });
      }
    }

    openCount = next.length;
  }}
>
  {#each items as item (item.question)}
    <AccordionItem
      class="group/item border-border border-b last:border-b-0"
      value={item.question}
    >
      <AccordionHeader>
        {#snippet render({ props, state, children })}
          <svelte:element this={headingTag} {...props}>
            {@render children?.(state)}
          </svelte:element>
        {/snippet}
        <AccordionTrigger
          class="group/trigger text-md focus-visible:outline-ring flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-start font-medium outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 pointer-coarse:py-5"
        >
          <span class="text-pretty">{item.question}</span>
          <span
            class="bg-fill text-muted-foreground ease-spring group-hover/trigger:bg-fill-hover group-hover/trigger:text-foreground group-data-open/trigger:text-foreground grid size-7 shrink-0 place-items-center rounded-full transition-[background-color,color,rotate] duration-260 group-data-open/trigger:rotate-45"
            aria-hidden="true"
          >
            <PlusIcon class="size-3.5" />
          </span>
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel
        class="h-(--accordion-panel-height) overflow-hidden transition-[height,opacity] duration-260 ease-out data-ending-style:h-0 data-ending-style:opacity-0 data-starting-style:h-0 data-starting-style:opacity-0"
      >
        <p class="text-md text-muted-foreground pe-11 pb-5 text-pretty">
          {item.answer}
        </p>
      </AccordionPanel>
    </AccordionItem>
  {/each}
</Accordion>
