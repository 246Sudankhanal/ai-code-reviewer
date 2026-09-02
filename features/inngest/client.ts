import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "flowai",
  isDev: process.env.NODE_ENV !== "production",
});
