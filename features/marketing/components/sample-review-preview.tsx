"use client";

import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  EXAMPLE_SAMPLE_REVIEW,
  LOCKFILE_SAMPLE_REVIEW,
  type SampleReviewPreview as Sample,
} from "@/features/marketing/lib/sample-review";

function DiffLine({
  type,
  text,
}: {
  type: "context" | "add" | "del";
  text: string;
}) {
  const tone =
    type === "add"
      ? "bg-primary/12 text-primary"
      : type === "del"
        ? "bg-secondary text-muted-foreground"
        : "text-muted-foreground";
  const mark = type === "add" ? "+" : type === "del" ? "−" : " ";

  return (
    <div
      className={`flex gap-3 px-3 py-0.5 font-mono text-[11px] leading-5 ${tone}`}
    >
      <span className="w-3 shrink-0 select-none opacity-70">{mark}</span>
      <span className="min-w-0 break-all">{text}</span>
    </div>
  );
}

function ReviewPane({ sample }: { sample: Sample }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border/80 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{sample.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {sample.repoLabel}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
          {sample.source === "live" ? "Posted on GitHub" : "Example output"}
        </span>
      </div>

      <Tabs defaultValue="files">
        <div className="border-b border-border/80 px-3 py-2">
          <TabsList variant="line">
            <TabsTrigger value="files">Files changed</TabsTrigger>
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="files" className="m-0">
          <p className="px-4 py-2 text-[11px] text-muted-foreground">
            Inline notes only on added (+) lines — same rule as production.
          </p>
          <div className="py-1">
            {sample.diffLines.map((line, index) => (
              <DiffLine key={`${line.type}-${index}`} {...line} />
            ))}
          </div>
          <div className="space-y-2 border-t border-border/60 p-3">
            {sample.inline.map((comment) => (
              <div
                key={`${comment.path}-${comment.line}-${comment.body.slice(0, 24)}`}
                className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2"
              >
                <p className="text-[11px] font-medium text-primary">
                  {comment.path}
                  {comment.line != null ? `:${comment.line}` : ""}
                </p>
                <p className="mt-1 text-xs leading-5 text-foreground">
                  {comment.body}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="conversation" className="m-0 p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Summary comment
          </p>
          <p className="mt-2 text-sm leading-6 text-foreground">
            {sample.summary}
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function SampleReviewPreview({ sample }: { sample: Sample }) {
  const scenarios: Sample[] =
    sample.source === "live"
      ? [sample, EXAMPLE_SAMPLE_REVIEW, LOCKFILE_SAMPLE_REVIEW]
      : [EXAMPLE_SAMPLE_REVIEW, LOCKFILE_SAMPLE_REVIEW];
  const [activeId, setActiveId] = useState(scenarios[0].id);
  const active = scenarios.find((item) => item.id === activeId) ?? scenarios[0];

  return (
    <section className="w-full space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          Sample output
        </p>
        <h2 className="font-heading text-2xl tracking-tight">
          Files, inline notes, and a summary.
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Switch between Files and Conversation to see what the bot posts on a
          pull request. Sign in only when you want this on your own repos.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {scenarios.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveId(item.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              item.id === activeId
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ReviewPane key={active.id} sample={active} />

      <ul className="grid gap-2 text-xs leading-5 text-muted-foreground sm:grid-cols-3">
        <li className="rounded-lg border border-border bg-card px-3 py-2">
          Inline comments are filtered to added lines so GitHub does not reject
          the review.
        </li>
        <li className="rounded-lg border border-border bg-card px-3 py-2">
          Diff is capped at 100k characters (not tokens). Lockfiles are skipped.
        </li>
        <li className="rounded-lg border border-border bg-card px-3 py-2">
          A second model judges the review. If the judge is down, the original
          still posts.
        </li>
      </ul>

      {active.githubUrl || sample.githubUrl ? (
        <p className="text-xs text-muted-foreground">
          Same review on GitHub:{" "}
          <a
            href={active.githubUrl ?? sample.githubUrl ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            same thread on GitHub
          </a>
          .
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          After a public demo PR exists, this panel loads that PR live. Until
          then these are the same kinds of comments the pipeline posts.
        </p>
      )}
    </section>
  );
}
