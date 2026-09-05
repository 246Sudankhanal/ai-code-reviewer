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
  PRODUCT_TITLE,
} from "@/lib/brand";

export default async function Home() {
  const session = await getServerSession();
  const signedIn = Boolean(session?.user);
  const sample = await getSampleReviewPreview();

  return (
    <PublicShell>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start justify-center gap-10 px-6 pb-16 pt-8">
        <div className="max-w-2xl space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="h-6 px-2.5 text-[11px]">
              Open source
            </Badge>
            <Badge variant="secondary" className="h-6 px-2.5 text-[11px]">
              Portfolio project
            </Badge>
          </div>
          <h1 className="font-heading text-5xl leading-[1.1] text-foreground sm:text-6xl">
            {PRODUCT_TITLE}
          </h1>
          <p className="max-w-lg text-base leading-7 text-muted-foreground">
            Automated GitHub pull request reviews: inline comments on added
            lines, a summary on the conversation, and a second-model judge
            before anything is posted. Built by {AUTHOR_NAME} so teams catch
            issues before merge — without replacing human review.
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            Source on{" "}
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              GitHub
            </a>
            . Preview a sample below with no account.
          </p>
        </div>
        <SampleReviewPreview sample={sample} />
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
              render={<Link href={SIGN_IN_PATH} prefetch />}
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
        <div className="grid w-full gap-3 sm:grid-cols-3">
          {[
            {
              title: "1. Connect",
              body: "Install the GitHub App on the repos you want reviewed.",
            },
            {
              title: "2. Optional sync",
              body: "Index a repo so comments can cite nearby code, not just the diff.",
            },
            {
              title: "3. Open a PR",
              body: "Reviews run in the background and post on the PR (inline + summary).",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="text-sm font-medium">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </main>
    </PublicShell>
  );
}
