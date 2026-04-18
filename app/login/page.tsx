import { Suspense } from "react";
import { LoginScreen } from "@/components/auth/login-screen";

function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6">
      <p className="text-sm text-on-surface-variant">Loading sign in…</p>
    </div>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const { error, registered } = await searchParams;
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginScreen
        authError={error}
        registered={registered === "1"}
      />
    </Suspense>
  );
}
