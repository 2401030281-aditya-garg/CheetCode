'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Editor from '@monaco-editor/react';
import LandingHero from './components/LandingHero';
import Footer from './components/Footer';


const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type TabType = 'explanation' | 'complexity' | 'approaches' | 'next';

type BetterApproach = {
  title: string;
  description: string;
  code: string;
  timeComplexity: string;
  spaceComplexity: string;
};

type AnalysisSections = {
  explanation: string;
  timeComplexity: string;
  spaceComplexity: string;
  betterApproaches: BetterApproach[];
  nextSteps: string;
};

export default function Home() {
  const { data: session } = useSession();

  /* ---------------- STATES ---------------- */
  const [problem, setProblem] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [level, setLevel] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<AnalysisSections | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('explanation');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [leetcodeLoading, setLeetcodeLoading] = useState(false);
  const [leetcodeError, setLeetcodeError] = useState('');
  const [leetcodeFetched, setLeetcodeFetched] = useState(false);

  const defaultCodeMap: Record<string, string> = {
    cpp: `class Solution {
public:
    <datatype> function() {
        // add your code here
    }
};`,
    python: `class Solution(object):
    def function(self):
        # add your code here`,
    java: `class Solution {
    public <datatype> function() {
        // add your code here
    }
}`,
    javascript: `// write your code here`,
  };

  /* ---------------- SYNC USER ---------------- */
  useEffect(() => {
    if (!session?.user?.email || !BACKEND_URL) return;

    axios.post(`${BACKEND_URL}/auth/sync`, {
      email: session.user.email,
      name: session.user.name,
    }).catch(() => {});
  }, [session]);

  /* ---------------- FETCH LEETCODE ---------------- */
  async function fetchProblemFromURL() {
    if (!problem.startsWith('http')) {
      setLeetcodeError('Paste a valid problem URL');
      return;
    }

    try {
      setLeetcodeLoading(true);
      setLeetcodeError('');
      setAnalysis(null);
      setLevel(null);

      const res = await axios.get(
        `${BACKEND_URL}/problem/fetch`,
        { params: { url: problem } }
      );

      setProblem(`Title: ${res.data.title}\n\n${res.data.description}`);
      setLevel(res.data.difficulty.toLowerCase());
      setLeetcodeFetched(true);
    } catch {
      setLeetcodeError('Failed to fetch');
    } finally {
      setLeetcodeLoading(false);
    }
  }

  /* ---------------- ANALYZE ---------------- */
  async function analyze() {
    if (!session?.user?.email) {
      setError('Please login to continue');
      return;
    }

    if (!level) {
      setError('Fetch problem first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setAnalysis(null);
      setActiveTab('explanation');

      const res = await axios.post(`${BACKEND_URL}/analyze`, {
        problem,
        code,
        email: session.user.email,
        leetcodeDifficulty: level,
      });

      setAnalysis(res.data.analysis);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- LANDING ---------------- */
  if (!session) {
    return <LandingHero />;
  }

  /* ---------------- PAGE ---------------- */
  return (
    <main className="min-h-screen overflow-y-auto px-6 pt-32 pb-24">
      <div className="max-w-4xl mx-auto w-full">

        {/* HEADER */}
        <div className="text-center mb-10">
          <div className="flex justify-center items-center gap-0 mb-3">
            <img src="/logo.png" className="w-15 h-12" />
            <h1 className="text-4xl font-semibold text-white">CheetCode</h1>
          </div>
          <p className="text-zinc-500 text-lg">
            AI-powered Coding problem analysis
          </p>
        </div>

        {/* INPUT CARD */}
        <div className="bg-zinc-900/70 backdrop-blur-xl p-6 rounded-2xl space-y-4 border border-zinc-800 shadow-[0_0_40px_rgba(0,0,0,0.6)]">

          <select
            className="w-full bg-zinc-900 border border-zinc-700 p-2 rounded text-white"
            value={language}
            onChange={(e) => {
              const lang = e.target.value;
              setLanguage(lang);
              setCode(defaultCodeMap[lang] || '');
            }}
          >
            <option value="">Select Language</option>
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="javascript">JavaScript</option>
          </select>

          <textarea
            disabled={leetcodeFetched}
            className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded text-white"
            rows={4}
            placeholder="Paste problem URL"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
          />

          <button
            onClick={fetchProblemFromURL}
            disabled={leetcodeLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition p-2 rounded font-semibold"
          >
            {leetcodeLoading ? 'Fetching...' : 'Fetch problem'}
          </button>

          {leetcodeError && <p className="text-red-400 text-sm">{leetcodeError}</p>}

          {level && (
            <div className="inline-block px-4 py-1 rounded bg-zinc-800 border border-zinc-700 text-sm text-white">
              Detected Difficulty:{' '}
              <span className="uppercase font-semibold text-emerald-400">
                {level}
              </span>
            </div>
          )}

          {language && (
            <div className="mt-4 rounded-xl overflow-hidden border border-zinc-800">
              <Editor
                height="320px"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(v) => setCode(v || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                }}
              />
            </div>
          )}

          <button
            onClick={analyze}
            disabled={loading || !level}
            className={`w-full transition p-3 rounded font-semibold ${
              !level
                ? 'bg-zinc-700 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* ---------------- ANALYSIS RESULT ---------------- */}
        {analysis && (
          <div className="mt-12 bg-zinc-900/70 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.6)]">

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {(['explanation', 'complexity', 'approaches', 'next'] as TabType[])
                .map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-full text-sm ${
                      activeTab === tab
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
            </div>

            <div className="bg-zinc-950 border text-zinc-200 border-zinc-800 rounded-xl p-4 text-sm whitespace-pre-wrap leading-relaxed">
              {activeTab === 'explanation' && analysis.explanation}

              {activeTab === 'complexity' && (
                <>
                  <p><b>Time Complexity:</b> {analysis.timeComplexity}</p>
                  <p className="mt-2"><b>Space Complexity:</b> {analysis.spaceComplexity}</p>
                </>
              )}

              {activeTab === 'approaches' &&
                analysis.betterApproaches.map((a, i) => (
                  <div key={i} className="mb-6">
                    <h4 className="font-semibold text-emerald-400">{a.title}</h4>
                    <p className="mt-1">{a.description}</p>
                    <pre className="mt-3 bg-black/60 p-4 rounded-lg overflow-x-auto text-white">
                      <code>{a.code}</code>
                    </pre>
                    <p className="mt-2 text-xs text-zinc-400">
                      TC: {a.timeComplexity} | SC: {a.spaceComplexity}
                    </p>
                  </div>
                ))}

              {activeTab === 'next' && analysis.nextSteps}
            </div>
          </div>
        )}

      </div>
      <Footer />
    </main>
  );
}
