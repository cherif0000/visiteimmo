import { SignIn } from "@clerk/clerk-react";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <SignIn afterSignInUrl="/dashboard" />
    </div>
  );
}
