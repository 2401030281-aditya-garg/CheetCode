"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="h-screen flex items-center justify-center">
      <button
        onClick={() => signIn("github")}
        className="px-6 py-3 bg-black text-white rounded"
      >
        Sign in with GitHub
      </button>
    </div>
  );
}
