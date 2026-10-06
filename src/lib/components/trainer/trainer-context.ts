import { createContext } from "svelte";

import type { Trainer } from "./trainer.svelte";

/** Shares the page's `Trainer` with every component inside the trainer app. */
export const [getTrainer, setTrainer] = createContext<Trainer>();
