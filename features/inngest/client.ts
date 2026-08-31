import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "chaicode-pr-reviewer",
  // next dev is always local — do not wait on INNGEST_DEV being loaded.
  isDev: process.env.NODE_ENV !== "production",
});
