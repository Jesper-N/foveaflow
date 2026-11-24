import { createAgent, registerTools } from "@ui-sdk/svelte/agent";

let started = false;

export const startAgentBridge = () => {
  if (started) {
    return;
  }

  started = true;
  registerTools(createAgent(), { allow: (step) => step.confirm === undefined });
};
