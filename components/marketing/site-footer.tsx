import Link from "next/link";
import {
  AUTHOR_NAME,
  CONTACT_EMAIL,
  GITHUB_PROFILE_URL,
  GITHUB_REPO_URL,
  PRODUCT_TITLE,
  SITE_URL,
} from "@/lib/brand";

const footerLinks = [
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: GITHUB_REPO_URL, label: "Source", external: true },
  { href: GITHUB_PROFILE_URL, label: "GitHub", external: true },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/80 px-6 py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm space-y-2">
          <p className="text-sm font-medium">{PRODUCT_TITLE}</p>
          <p className="text-xs leading-5 text-muted-foreground">
            Open-source portfolio project by {AUTHOR_NAME}. Operator of{" "}
            <span className="text-foreground">{SITE_URL.replace("https://", "")}</span>
            .
          </p>
          <p className="text-xs text-muted-foreground">
            Support:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-foreground underline-offset-4 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {footerLinks.map((item) => (
            <li key={item.href}>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground"
                >
                  {item.label}
                </a>
              ) : (
                <Link href={item.href} prefetch className="hover:text-foreground">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
