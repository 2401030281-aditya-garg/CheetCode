'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export default function DashboardCharts({
  easy,
  medium,
  hard,
}: {
  easy: number;
  medium: number;
  hard: number;
}) {
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">
        Difficulty Breakdown
      </h2>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={[
              { name: 'Easy', value: easy },
              { name: 'Medium', value: medium },
              { name: 'Hard', value: hard },
            ]}
            dataKey="value"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={5}
          >
            {['#34d399', '#60a5fa', '#f87171'].map((color, i) => (
              <Cell key={i} fill={color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
