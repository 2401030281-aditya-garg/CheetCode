'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// 🔥 Charts – client side only
const DashboardCharts = dynamic(
  () => import('../components/DashboardCharts'),
  { ssr: false }
);

/* ---------------- TYPES ---------------- */

type Stats = {
  total: number;
  easy: number;
  medium: number;
  hard: number;
};

type RecommendationSection = {
  title: string;
  content: string;
};

/* ---------------- PAGE ---------------- */

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [stats, setStats] = useState<Stats>({
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0,
  });

  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.email) return;

    const email = session.user.email;
    setLoading(true);

    // 📊 Stats
    axios
      .get(`${BACKEND_URL}/analyze/stats`, { params: { email } })
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    // 🤖 AI Recommendations
    axios
      .get(`${BACKEND_URL}/analyze/recommendations`, { params: { email } })
      .then(res => {
        const data = res.data;
        if (typeof data === 'string') setRecommendations(data);
        else if (typeof data?.result === 'string') setRecommendations(data.result);
        else setRecommendations('');
      })
      .catch(() => setRecommendations(''));
  }, [session, status]);

  return (
    <main className="min-h-screen landing-bg text-white px-6 pt-32 pb-24">
      <div className="max-w-6xl mx-auto space-y-16">

        {/* HEADER */}
        <h1 className="text-4xl font-bold tracking-tight">
          Dashboard
        </h1>

        {/* STATS */}
        {status === 'authenticated' && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            <StatCard title="Total Submissions" value={stats.total} />
            <StatCard title="Easy" value={stats.easy} accent="emerald" />
            <StatCard title="Medium" value={stats.medium} accent="blue" />
            <StatCard title="Hard" value={stats.hard} accent="rose" />
            
          </div>
        )}

        {/* CHART */}
        {stats.total > 0 && (
          <DashboardCharts
            easy={stats.easy}
            medium={stats.medium}
            hard={stats.hard}
          />
        )}

        {/* AI RECOMMENDATIONS */}
        {recommendations && (
          <AIRecommendations text={recommendations} />
        )}

      </div>
    </main>
  );
}

/* ---------------- HELPERS ---------------- */

function parseRecommendations(text: string): RecommendationSection[] {
  if (!text) return [];

  const blocks = text.split('\n\n');
  const sections: RecommendationSection[] = [];

  let currentTitle = 'Overview';
  let currentContent: string[] = [];

  blocks.forEach(block => {
    if (block.startsWith('**') && block.includes(':')) {
      if (currentContent.length) {
        sections.push({
          title: currentTitle,
          content: currentContent.join('\n\n'),
        });
      }

      currentTitle = block.replace(/\*\*/g, '').replace(':', '').trim();
      currentContent = [];
    } else {
      currentContent.push(block);
    }
  });

  if (currentContent.length) {
    sections.push({
      title: currentTitle,
      content: currentContent.join('\n\n'),
    });
  }

  return sections;
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({
  title,
  value,
  accent = 'zinc',
}: {
  title: string;
  value: number;
  accent?: 'emerald' | 'blue' | 'rose' | 'zinc';
}) {
  const colorMap = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    rose: 'text-rose-400',
    zinc: 'text-white',
  };

  return (
    <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-xl p-6 transition hover:shadow-lg">
      <p className="text-zinc-400 text-sm">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${colorMap[accent]}`}>
        {value}
      </p>
    </div>
  );
}

function AIRecommendations({ text }: { text: string }) {
  const sections = parseRecommendations(text);

  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-emerald-400">
        🤖 AI Recommendations
      </h2>

      {sections.map((sec, i) => (
        <div
          key={i}
          className="
            bg-zinc-900/70
            backdrop-blur-xl
            border border-zinc-800
            rounded-2xl
            p-6
            shadow-[0_0_40px_rgba(16,185,129,0.06)]
          "
        >
          <h3 className="text-lg font-semibold text-emerald-400 mb-3">
            {sec.title}
          </h3>

          <div className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">
            {sec.content}
          </div>
        </div>
      ))}

      <p className="text-xs text-zinc-500">
        Generated from your recent submissions and coding patterns
      </p>
    </section>
  );
}
