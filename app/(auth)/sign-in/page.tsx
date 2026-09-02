import React from 'react'
import Image from "next/image";
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


export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to AI Code Reviewer with GitHub.",
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
          <Image
            src="/logo2.svg"
            alt=""
            width={64}
            height={64}
            priority
            className="text-foreground"
          />
        </div>
        <CardTitle className="text-base">AI Code Reviewer</CardTitle>
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
            </Field>
          </FieldGroup>
        </FieldSet>
      </CardContent>
    </Card>
  )
}

export default SignInPage