import { requireUnauth } from "@/features/auth/actions";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUnauth()
  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
