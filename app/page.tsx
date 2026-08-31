import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { UserMenuWithSession } from "@/features/auth/components/user-menu";
import { getServerSession } from "@/features/auth/actions";
import { SIGN_IN_PATH } from "@/features/auth/utils";
import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getServerSession();
  const signedIn = Boolean(session?.user);

  return (
    <div className="relative flex min-h-svh flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" prefetch className="flex items-center gap-2">
          <span className="accent-gradient size-8 rounded-lg" />
          <span className="text-sm font-semibold tracking-tight">Sudan Review</span>
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
        <p className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          AI reviews that ship with the PR
        </p>
        <div className="max-w-2xl space-y-5">
          <h1 className="font-heading text-5xl leading-[1.1] text-foreground sm:text-6xl">
            Code review that reads the diff, not the hype.
          </h1>
          <p className="max-w-lg text-base leading-7 text-muted-foreground">
            Connect GitHub, index a repo, and get grounded comments on every
            pull request — without the generic tutorial chrome.
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
              render={<Link href={SIGN_IN_PATH} prefetch />}
            >
              Sign in with GitHub
            </Button>
          )}
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-3">
          {[
            { title: "Context-aware", body: "Pinecone + repo sync so reviews cite nearby code." },
            { title: "Queued, not blocked", body: "Inngest runs reviews in the background after webhooks." },
            { title: "Usage-aware", body: "Free monthly cap, Pro unlimited — visible in Settings." },
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
