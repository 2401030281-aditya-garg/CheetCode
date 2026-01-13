'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="absolute top-0 left-0 w-full z-50 py-1.5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-0">
          <Image
            src="/logo.png"
            alt="CheetCode"
            width={72}
            height={32}
            priority
          />
          <span className="text-lg font-semibold text-white">
            CheetCode
          </span>
        </Link>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6">
          {session && (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-zinc-300 hover:text-white transition"
              >
                Dashboard
              </Link>

              <Link
                href="/my-submissions"
                className="text-sm text-zinc-300 hover:text-white transition"
              >
                My Submissions
              </Link>

              <button
                onClick={() => signOut()}
                className="items-center px-4 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm text-white transition"
              >
                Logout
              </button>
            </>
          )}

          {!session && status !== 'loading' && (
            <button
              onClick={() => signIn('github')}
              className="px-5 py-2.5 rounded-md bg-emerald-000 hover:bg-emerald-400 text-sm font-medium text-white transition"
            >
              Login Now
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
