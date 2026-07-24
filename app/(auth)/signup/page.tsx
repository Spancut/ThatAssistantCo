import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Create account — ThatAssistant" };

export default function SignUpPage() {
  return <SignUpForm />;
}
