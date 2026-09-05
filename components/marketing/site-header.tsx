import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { UserMenuWithSession } from "@/features/auth/components/user-menu";
import { getServerSession } from "@/features/auth/actions";
import { SIGN_IN_PATH } from "@/features/auth/utils";
import { APP_NAME } from "@/lib/brand";

export async function SiteHeader() {
  const session = await getServerSession();
  const signedIn = Boolean(session?.user);

  return (
    <header className="flex items-center justify-between px-6 py-4">
      <Link href="/" prefetch className="flex items-center gap-2">
        <BrandLogo size={32} priority className="size-8 rounded-lg" />
        <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
      </Link>
      <nav className="flex items-center gap-1 sm:gap-2">
        <Button
          size="sm"
          variant="ghost"
          nativeButton={false}
          render={<Link href="/contact" prefetch />}
        >
          Contact
        </Button>
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
      </nav>
    </header>
  );
}
