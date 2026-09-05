import { PublicShell } from "@/components/marketing/public-shell";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <PublicShell>
      <article className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="font-heading text-4xl tracking-tight">{title}</h1>
        <div className="mt-8 space-y-4 text-sm leading-7 text-muted-foreground [&_a]:text-foreground [&_a]:underline-offset-4 [&_a]:hover:underline [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-medium [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </div>
      </article>
    </PublicShell>
  );
}
