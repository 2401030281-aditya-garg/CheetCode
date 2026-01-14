'use client';

import Footer from '../components/Footer';

import Image from 'next/image';
import { signIn } from 'next-auth/react';

export default function LandingHero() {
  return (
    <section className="min-h-screen landing-bg flex items-center justify-center px-6 pt-16">
      <div className="max-w-3xl text-center">

        {/* LOGO */}
        <div className="flex justify-center mb-3 float">
          <Image
            src="/logo.png"
            alt="CheetCode"
            width={100}
            height={100}
          />
        </div>

        {/* TITLE */}
        <h1 className="text-5xl font-semibold tracking-tight mb-4  text-white">
          CheetCode
        </h1>

        <p className="text-zinc-400 text-lg mb-8">
          AI-powered Coding problems analysis.  
          Understand patterns. Improve faster.
        </p>

        {/* CTA */}
        <button
          onClick={() => signIn('github')}
          className="px-8 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 transition font-semibold shadow-lg shadow-emerald-500/20"
        >
          Login with GitHub →
        </button>

        {/* TRUST TEXT */}
        <p className="text-xs text-zinc-500 mt-6">
          No spam • GitHub OAuth only • Free forever
        </p>
      </div>
      <Footer />
    </section>
  );
}
