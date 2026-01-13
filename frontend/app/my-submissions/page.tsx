'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/* ---------------- TYPES ---------------- */

type Analysis = {
  explanation?: string;
  betterApproaches?: { title: string }[];
  nextSteps?: string;
};

type Submission = {
  id?: string;
  _id?: string;
  createdAt: string;
  level: 'easy' | 'medium' | 'hard';
  title?: string | null;
  problem?: string | null;
  code?: string | null;
  analysis?: string | Analysis | null;
};

/* ---------------- PAGE ---------------- */

export default function MySubmissionsPage() {
  const { data: session, status } = useSession();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] =
    useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [sort, setSort] = useState<'latest' | 'oldest'>('latest');

  // ✅ SINGLE expanded card
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.email) return;

    setLoading(true);
    axios
      .get(`${BACKEND_URL}/analyze/my-submissions`, {
        params: { email: session.user.email },
      })
      .then(res => setSubmissions(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session, status]);

  /* ---------------- FILTER ---------------- */

  const filtered = useMemo(() => {
    let list = [...submissions];

    if (difficulty !== 'all') {
      list = list.filter(s => s.level === difficulty);
    }

    if (search.trim()) {
      const q = search.toUpperCase();
      list = list.filter(s =>
        getTitle(s).toUpperCase().includes(q)
      );
    }

    list.sort((a, b) =>
      sort === 'latest'
        ? new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
    );

    return list;
  }, [submissions, search, difficulty, sort]);

  return (
    <main className="min-h-screen landing-bg text-white px-6 pt-32 pb-24">
      <div className="max-w-6xl mx-auto space-y-10">

        <header>
          <h1 className="text-4xl font-bold">My Submissions</h1>
          <p className="text-zinc-400 mt-2">
            Revisit and review your past AI analyses
          </p>
        </header>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <input
            placeholder="🔍︎ Search by problem title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-zinc-900/70 border border-zinc-800 rounded-lg px-4 py-2 text-sm w-full md:w-80"
          />

          <div className="flex gap-2 flex-wrap">
            {['all', 'easy', 'medium', 'hard'].map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d as any)}
                className={`px-3 py-1 rounded-full text-xs font-semibold
                  ${difficulty === d
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}
                `}
              >
                {d.toUpperCase()}
              </button>
            ))}

            <select
              value={sort}
              onChange={e => setSort(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs"
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {loading && <p className="text-zinc-400">Loading…</p>}

        {/* LIST */}
        <section className="space-y-6">
          {filtered.map(sub => {
            const key = sub._id || sub.id!;
            return (
              <SubmissionCard
                key={key}
                sub={sub}
                expanded={expandedKey === key}
                onToggle={() =>
                  setExpandedKey(expandedKey === key ? null : key)
                }
              />
            );
          })}
        </section>
      </div>
    </main>
  );
}

/* ---------------- CARD ---------------- */

function SubmissionCard({
  sub,
  expanded,
  onToggle,
}: {
  sub: Submission;
  expanded: boolean;
  onToggle: () => void;
}) {
  const levelColor = {
    easy: 'text-emerald-400',
    medium: 'text-blue-400',
    hard: 'text-rose-400',
  };

  const analysis: Analysis | null =
    typeof sub.analysis === 'string'
      ? safeParse(sub.analysis)
      : sub.analysis ?? null;

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6">

      {/* HEADER */}
      <button onClick={onToggle} className="w-full text-left">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-zinc-400">
            {new Date(sub.createdAt).toLocaleString()}
          </span>
          <span className={`text-xs font-semibold uppercase ${levelColor[sub.level]}`}>
            {sub.level}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-emerald-400">
          {getTitle(sub)}
        </h3>
      </button>

      {/* EXPANDED */}
      {expanded && (
        <div className="mt-5 border-t border-zinc-800 pt-4 space-y-5">

          {analysis?.explanation && (
            <Section title="Explanation">
              {analysis.explanation}
            </Section>
          )}

          {analysis?.betterApproaches?.length ? (
            <Section title="Key Takeaways">
              <ul className="list-disc list-inside space-y-1">
                {analysis.betterApproaches.slice(0, 4).map((a, i) => (
                  <li key={i}>{a.title}</li>
                ))}
              </ul>
            </Section>
          ) : null}

          {analysis?.nextSteps && (
            <Section title="Tips">
              {analysis.nextSteps}
            </Section>
          )}

          {/* CODE */}
          {sub.code && (
            <Section title="Submitted Code">
              <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-xs overflow-x-auto">
                {sub.code}
              </pre>

              <button
                onClick={() => navigator.clipboard.writeText(sub.code!)}
                className="mt-2 text-xs bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded"
              >
                Copy Code
              </button>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */

function Section({ title, children }: any) {
  return (
    <div>
      <p className="text-sm font-semibold text-emerald-400 mb-1">
        {title}
      </p>
      <div className="text-sm text-zinc-300">{children}</div>
    </div>
  );
}

function safeParse(value: string): Analysis | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getTitle(sub: Submission): string {
  if (sub.title?.trim()) return sub.title;
  if (sub.problem?.startsWith('Title:')) {
    return sub.problem.split('\n')[0].replace('Title:', '').trim();
  }
  return 'Untitled Problem';
}
