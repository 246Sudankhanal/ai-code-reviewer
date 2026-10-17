import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/marketing/public-shell";
import { SampleReviewPreview } from "@/features/marketing/components/sample-review-preview";
import { getSampleReviewPreview } from "@/features/marketing/server/get-sample-review";
import { getServerSession } from "@/features/auth/actions";
import { SIGN_IN_PATH } from "@/features/auth/utils";
import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { SAMPLE_PR_URL } from "@/lib/sample-pr";
import {
  AUTHOR_NAME,
  GITHUB_REPO_URL,
  LINKEDIN_PROFILE_URL,
  PRODUCT_TITLE,
} from "@/lib/brand";

const STEPS = [
  {
    title: "Connect the GitHub App",
    body: "Install it on the repositories you want reviewed. Webhooks start the job — you do not paste diffs into a chat.",
  },
  {
    title: "Optional: index the repo",
    body: "Sync embeds nearby files so comments can cite context outside the hunk, not only the changed lines.",
  },
  {
    title: "Open a pull request",
    body: "A background job drafts inline notes, a second model judges them, then the review posts on GitHub.",
  },
] as const;

const STACK = [
  { title: "GitHub App", body: "OAuth sign-in, installation, webhooks, inline + summary comments." },
  { title: "Inngest", body: "Durable review and sync jobs, retries, and timeouts off the request path." },
  { title: "OpenRouter + judge", body: "One model writes the review; another can reject weak comments before they post." },
  { title: "Pinecone", body: "Optional embeddings so reviews can point at related code in the repo." },
] as const;

export default async function Home() {
  const session = await getServerSession();
  const signedIn = Boolean(session?.user);
  const sample = await getSampleReviewPreview();

  return (
    <PublicShell>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-6 pb-20 pt-12">
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="h-6 px-2.5 text-[11px]">
                Open source
              </Badge>
              <Badge variant="secondary" className="h-6 px-2.5 text-[11px]">
                GitHub App
              </Badge>
            </div>
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                {PRODUCT_TITLE}
              </p>
              <h1 className="font-heading text-4xl leading-[1.12] text-foreground sm:text-5xl">
                Reviews that show up on the pull request, not in another inbox.
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                {PRODUCT_TITLE} watches GitHub, drafts inline comments on added
                lines, writes a conversation summary, and runs a second-model
                check before anything is posted. Built by {AUTHOR_NAME} — it
                assists review, it does not replace it.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {signedIn ? (
                <Button
                  size="lg"
                  nativeButton={false}
                  render={<Link href={DASHBOARD_ROUTES.overview} prefetch />}
                >
                  Open dashboard
                </Button>
              ) : (
                <Button
                  size="lg"
                  nativeButton={false}
                  render={<Link href={SIGN_IN_PATH} prefetch={false} />}
                >
                  Sign in with GitHub
                </Button>
              )}
              {SAMPLE_PR_URL ? (
                <Button
                  size="lg"
                  variant="outline"
                  nativeButton={false}
                  render={
                    <a href={SAMPLE_PR_URL} target="_blank" rel="noreferrer" />
                  }
                >
                  Open sample on GitHub
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  nativeButton={false}
                  render={
                    <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer" />
                  }
                >
                  View source
                </Button>
              )}
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Code on{" "}
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                GitHub
              </a>
              {" · "}
              <a
                href={LINKEDIN_PROFILE_URL}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                LinkedIn
              </a>
              . Sample output below — no account required.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {STACK.map((item) => (
              <li
                key={item.title}
                className="glass-panel rounded-xl px-4 py-3"
              >
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section id="how-it-works" className="scroll-mt-20 space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              How it works
            </p>
            <h2 className="font-heading text-2xl tracking-tight">
              Three steps. The review lands on GitHub.
            </h2>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-3">
            {STEPS.map((item, index) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-4"
              >
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Step {index + 1}
                </p>
                <p className="mt-2 text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <SampleReviewPreview sample={sample} />
      </main>
    </PublicShell>
  );
}
