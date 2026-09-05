import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import {
  AUTHOR_NAME,
  CONTACT_EMAIL,
  GITHUB_PROFILE_URL,
  GITHUB_REPO_URL,
  PRODUCT_TITLE,
  SITE_URL,
} from "@/lib/brand";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${AUTHOR_NAME} about ${PRODUCT_TITLE}.`,
};

export default function ContactPage() {
  return (
    <LegalPage title="Contact">
      <p>
        {PRODUCT_TITLE} ({SITE_URL}) is built and operated by {AUTHOR_NAME}.
        This is a real person behind the domain — use the address below for
        support, privacy requests, or security reports.
      </p>
      <h2>Email</h2>
      <p>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
      <h2>Profiles</h2>
      <ul>
        <li>
          GitHub:{" "}
          <a href={GITHUB_PROFILE_URL} target="_blank" rel="noreferrer">
            {GITHUB_PROFILE_URL}
          </a>
        </li>
        <li>
          Source code:{" "}
          <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer">
            {GITHUB_REPO_URL}
          </a>
        </li>
      </ul>
    </LegalPage>
  );
}
