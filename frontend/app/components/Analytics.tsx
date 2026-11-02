"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type Ticket = {
  category?: string;
  status?: string;
  priority?: string;
};

export default function Analytics({ tickets }: { tickets: Ticket[] }) {
  const countBy = (field: "category" | "status" | "priority") => {
    const counts: Record<string, number> = {};

    tickets.forEach((ticket) => {
      const value = ticket[field] || "Unknown";
      counts[value] = (counts[value] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const categoryData = countBy("category");
  const statusData = countBy("status");
  const priorityData = countBy("priority");

  const COLORS = ["#38bdf8", "#a78bfa", "#34d399", "#fbbf24", "#fb7185"];

  return (
    <section className="mt-8 space-y-6">
      <h2 className="text-2xl font-bold text-white">Ticket Analytics</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <h3 className="mb-4 font-semibold text-white">Tickets by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#cbd5e1" />
              <YAxis allowDecimals={false} stroke="#cbd5e1" />
              <Tooltip />
              <Bar dataKey="value" fill="#38bdf8" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <h3 className="mb-4 font-semibold text-white">Tickets by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                outerRadius={85}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 lg:col-span-2">
          <h3 className="mb-4 font-semibold text-white">Tickets by Priority</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#cbd5e1" />
              <YAxis allowDecimals={false} stroke="#cbd5e1" />
              <Tooltip />
              <Bar dataKey="value" fill="#a78bfa" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}