import { Inngest } from "inngest";

// Do not pass signingKey/eventKey here. Next can bake `undefined` in at
// build time and override the real Docker env. The SDK reads INNGEST_* at runtime.
export const inngest = new Inngest({
  id: "ai-code-reviewer",
  isDev:
    process.env.NODE_ENV !== "production" && process.env.INNGEST_DEV !== "0",
});
