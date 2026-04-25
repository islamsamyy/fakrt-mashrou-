'use client';

import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  month?: string;
  name?: string;
  value: number;
  label?: string;
}

interface AnalyticsChartProps {
  title: string;
  type: 'line' | 'bar' | 'pie';
  data: ChartData[];
  color?: string;
  subtitle?: string;
  height?: number;
}

const COLORS = ['#00ffd1', '#00d9b5', '#00b8a9', '#ff7f50', '#ff6b6b', '#4ecdc4'];

export function AnalyticsChart({ title, type, data, color = '#00ffd1', subtitle, height = 300 }: AnalyticsChartProps) {
  return (
    <div className="bg-gradient-to-br from-surface-container-low/60 to-surface-container-low/30 backdrop-blur-md p-8 border border-outline-variant/20 rounded-2xl hover:border-primary-container/40 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10 mb-6">
        <h3 className="font-headline text-xl font-black text-foreground uppercase tracking-tight">{title}</h3>
        {subtitle && <p className="text-sm text-foreground/80 mt-2 text-base">{subtitle}</p>}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        {type === 'line' && (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" />
            <YAxis stroke="rgba(255,255,255,0.3)" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a0e15',
                border: '1px solid rgba(0,255,209,0.2)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ fill: color, r: 5 }} />
          </LineChart>
        )}

        {type === 'bar' && (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" />
            <YAxis stroke="rgba(255,255,255,0.3)" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a0e15',
                border: '1px solid rgba(0,255,209,0.2)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} />
          </BarChart>
        )}

        {type === 'pie' && (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a0e15',
                border: '1px solid rgba(0,255,209,0.2)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#fff' }}
            />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export function PortfolioBreakdownChart({ data }: { data: { category: string; percentage: number; amount: number }[] }) {
  const chartData = data.map(item => ({
    name: item.category,
    value: item.percentage,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <AnalyticsChart title="توزيع المحفظة" type="pie" data={chartData} />
      </div>
      <div className="bg-gradient-to-br from-surface-container-high/60 to-surface-container-high/30 backdrop-blur-md p-6 border border-outline-variant/20 rounded-2xl space-y-4">
        <h4 className="font-headline text-lg font-black text-foreground uppercase tracking-tight">التفاصيل</h4>
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between pb-4 border-b border-foreground/10 last:border-0">
            <div>
              <p className="text-base font-headline text-foreground/80">{item.category}</p>
              <p className="text-lg font-black text-foreground">${(item.amount / 1000000).toFixed(2)}M</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-primary-container">{item.percentage}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
