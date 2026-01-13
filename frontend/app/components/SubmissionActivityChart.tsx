'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from 'recharts';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type ActivityPoint = {
  date: string;
  count: number;
};

export default function SubmissionActivityChart({ email }: { email: string }) {
  const [data, setData] = useState<ActivityPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) return;

    axios
      .get(`${BACKEND_URL}/analyze/activity`, {
        params: { email },
      })
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [email]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-400">
        Loading activity…
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-400">
        No recent activity
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <XAxis dataKey="date" />
        <Tooltip />
        <Bar dataKey="count" fill="#34d399" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
