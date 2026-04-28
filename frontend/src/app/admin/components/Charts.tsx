'use client';

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { YearlyStat } from '../types';
import styles from '../admin.module.css';

interface ChartsProps {
    dailyData: { date: string; label: string; gelir: number }[];
    yearlyData: YearlyStat[];
}

export const Charts = ({ dailyData, yearlyData }: ChartsProps) => (
    <div className={styles.chartGrid}>
        <div className={`card ${styles.chartCard}`}>
            <h2 className={styles.chartTitle}>📊 Son 14 Günlük Gelir</h2>
            <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3d1f4a" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: '#9d6db0', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9d6db0', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={{ background: '#1a0f1e', border: '1px solid #3d1f4a', borderRadius: '0.5rem', color: '#fce7f3' }}
                        formatter={(v: any) => [`₺${Number(v).toFixed(2)}`, 'Gelir']}
                    />
                    <Line
                        type="monotone"
                        dataKey="gelir"
                        stroke="#f472b6"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#db2777', stroke: '#f472b6', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>

        <div className={`card ${styles.chartCard}`}>
            <h2 className={styles.chartTitle}>📅 2026 Aylık Satışlar</h2>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={yearlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3d1f4a" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#9d6db0', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9d6db0', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={{ background: '#1a0f1e', border: '1px solid #3d1f4a', borderRadius: '0.5rem', color: '#fce7f3' }}
                        formatter={(v: any, name?: string | number) => [
                            name === 'gelir' ? `₺${Number(v).toFixed(2)}` : v,
                            name === 'gelir' ? 'Gelir (₺)' : 'Sipariş Sayısı',
                        ]}
                    />
                    <Legend formatter={(v) => v === 'gelir' ? 'Gelir (₺)' : 'Sipariş Sayısı'} wrapperStyle={{ color: '#9d6db0', fontSize: '0.75rem' }} />
                    <Bar dataKey="gelir" fill="#db2777" radius={[4, 4, 0, 0]} opacity={0.85} />
                    <Bar dataKey="siparis" fill="#7c3aed" radius={[4, 4, 0, 0]} opacity={0.7} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);
