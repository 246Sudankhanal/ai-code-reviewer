import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { UserMenuWithSession } from "@/features/auth/components/user-menu";
import { getServerSession } from "@/features/auth/actions";
import { SIGN_IN_PATH } from "@/features/auth/utils";
import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { Button } from "@/components/ui/button";
import { SampleReviewPreview } from "@/features/marketing/components/sample-review-preview";
import { getSampleReviewPreview } from "@/features/marketing/server/get-sample-review";
import { SAMPLE_PR_URL } from "@/lib/sample-pr";

export default async function Home() {
  const session = await getServerSession();
  const signedIn = Boolean(session?.user);
  const sample = await getSampleReviewPreview();

  return (
    <div className="relative flex min-h-svh flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" prefetch className="flex items-center gap-2">
          <span className="accent-gradient size-8 rounded-lg" />
          <span className="text-sm font-semibold tracking-tight">AI Code Reviewer</span>
        </Link>
        <div className="flex items-center gap-2">
          <ModeToggle />
          {signedIn ? (
            <UserMenuWithSession variant="compact" />
          ) : (
            <Button
              size="sm"
              variant="ghost"
              nativeButton={false}
              render={<Link href={SIGN_IN_PATH} prefetch />}
            >
              Sign in
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start justify-center gap-10 px-6 pb-24 pt-8">
        <div className="max-w-2xl space-y-5">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            Live demo
          </p>
          <h1 className="font-heading text-5xl leading-[1.1] text-foreground sm:text-6xl">
            AI reviews on GitHub pull requests.
          </h1>
          <p className="max-w-lg text-base leading-7 text-muted-foreground">
            Preview a sample review below — no account required. Sign in with
            GitHub to install the app on your repositories.
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
          ) : null}
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
            <div key={item.title} className="glass-panel rounded-xl p-4">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
