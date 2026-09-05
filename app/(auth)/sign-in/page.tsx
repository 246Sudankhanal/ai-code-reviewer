import React from 'react'
import { BrandLogo } from "@/components/brand-logo";
import type { Metadata } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSet,
} from "@/components/ui/field";
import { GithubSignInForm } from '@/features/auth/components/github-sign-in-form';
import { APP_NAME } from "@/lib/brand";
import Link from "next/link";


export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to ${APP_NAME} with GitHub.`,
};

type SignInPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};


const SignInPage = async({searchParams}:SignInPageProps) => {
    const {callbackUrl} = await searchParams;
  return (
     <Card className="border-border/80 shadow-sm">
      <CardHeader className="items-center text-center">
        <div className="mb-4 flex justify-center pt-2">
          <BrandLogo size={64} priority className="size-16 rounded-xl" />
        </div>
        <CardTitle className="text-base">{APP_NAME}</CardTitle>
        <CardDescription>
          Sign in with GitHub to connect repos and run PR reviews.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldSet>
          <FieldGroup>
            <Field>
              <GithubSignInForm callbackUrl={callbackUrl} />
              <FieldDescription className="text-center">
                We only request the permissions needed to identify your
                account. You can revoke access anytime from GitHub settings.
              </FieldDescription>
              <FieldDescription className="text-center">
                <Link href="/privacy" className="hover:underline">
                  Privacy
                </Link>
                {" · "}
                <Link href="/terms" className="hover:underline">
                  Terms
                </Link>
                {" · "}
                <Link href="/contact" className="hover:underline">
                  Contact
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </FieldSet>
      </CardContent>
    </Card>
  )
}

export default SignInPage