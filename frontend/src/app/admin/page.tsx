'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import Navbar from '../components/Navbar';

const API = 'http://localhost:3000';

interface Order {
    id: string;
    totalPrice: number;
    totalQuantity: number;
    status: string;
    createdAt: string;
    user?: { name: string; email: string };
}

interface StatsData {
    totalOrders: number;
    totalRevenue: number;
    totalBooks: number;
    totalUsers: number;
}

function getDayLabel(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' });
}

function buildChartData(orders: Order[]) {
    const now = new Date();
    const days: { date: string; label: string; gelir: number; siparis: number }[] = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().slice(0, 10);
        days.push({ date: dateKey, label: getDayLabel(d.toISOString()), gelir: 0, siparis: 0 });
    }

    for (const order of orders) {
        const dateKey = new Date(order.createdAt).toISOString().slice(0, 10);
        const day = days.find((d) => d.date === dateKey);
        if (day) {
            day.gelir += Number(order.totalPrice);
            day.siparis += 1;
        }
    }

    return days;
}

export default function AdminPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        const token = localStorage.getItem('token');
        if (!token || role !== 'admin') { router.push('/'); return; }
        fetchAll();
    }, []);

    async function fetchAll() {
        const token = localStorage.getItem('token');
        try {
            const [ordersRes, statsRes] = await Promise.all([
                fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            const ordersData = await ordersRes.json();
            const statsData = await statsRes.json();
            setOrders(Array.isArray(ordersData) ? ordersData : []);
            setStats(statsData);
        } finally {
            setLoading(false);
        }
    }

    const chartData = buildChartData(orders);
    const recentOrders = orders.slice(0, 8);

    const statCards = [
        { label: 'Toplam Sipariş', value: stats?.totalOrders ?? '—', icon: '📦', color: '#f472b6' },
        { label: 'Toplam Gelir', value: stats?.totalRevenue != null ? `₺${Number(stats.totalRevenue).toFixed(0)}` : '—', icon: '💰', color: '#34d399' },
        { label: 'Kitap Sayısı', value: stats?.totalBooks ?? '—', icon: '📚', color: '#c084fc' },
        { label: 'Kullanıcı Sayısı', value: stats?.totalUsers ?? '—', icon: '👥', color: '#fb923c' },
    ];

    return (
        <div style={{ minHeight: '100vh' }}>
            <Navbar />

            <main className="page">
                {/* Header */}
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                            👑 Admin Paneli
                        </h1>
                        <p style={{ color: '#9d6db0', fontSize: '0.9rem' }}>Hoş geldiniz</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button className="btn-ghost" onClick={() => router.push('/admin/books')}>📚 Kitaplar</button>
                        <button className="btn-ghost" onClick={() => router.push('/admin/authors')}>✍️ Yazarlar</button>
                        <button className="btn-ghost" onClick={() => router.push('/admin/users')}>👥 Kullanıcılar</button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#9d6db0' }}>Yükleniyor...</div>
                ) : (
                    <>
                        {/* Stat Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            {statCards.map((s) => (
                                <div key={s.label} className="card" style={{ padding: '1.25rem' }}>
                                    <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: '800', color: s.color }}>{s.value}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#9d6db0', marginTop: '0.25rem' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Chart */}
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem', color: '#c084fc' }}>
                                📈 Son 7 Günlük Satış Geliri
                            </h2>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#3d1f4a" />
                                    <XAxis dataKey="label" tick={{ fill: '#9d6db0', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#9d6db0', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: '#1a0f1e', border: '1px solid #3d1f4a', borderRadius: '0.5rem', color: '#fce7f3' }}
                                        formatter={(v: number) => [`₺${v.toFixed(2)}`, 'Gelir']}
                                    />
                                    <Bar dataKey="gelir" fill="#db2777" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Recent Orders */}
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem', color: '#c084fc' }}>
                                📋 Son Siparişler
                            </h2>
                            {recentOrders.length === 0 ? (
                                <p style={{ color: '#9d6db0', textAlign: 'center', padding: '2rem' }}>Henüz sipariş yok</p>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #3d1f4a' }}>
                                                {['Müşteri', 'Tutar', 'Ürün', 'Durum', 'Tarih'].map((h) => (
                                                    <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#9d6db0', fontWeight: '600' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentOrders.map((o) => (
                                                <tr key={o.id} style={{ borderBottom: '1px solid #3d1f4a22' }}>
                                                    <td style={{ padding: '0.65rem 0.75rem' }}>{o.user?.name || '—'}</td>
                                                    <td style={{ padding: '0.65rem 0.75rem', color: '#f472b6', fontWeight: '700' }}>₺{Number(o.totalPrice).toFixed(2)}</td>
                                                    <td style={{ padding: '0.65rem 0.75rem' }}>{o.totalQuantity} adet</td>
                                                    <td style={{ padding: '0.65rem 0.75rem' }}>
                                                        <span className="badge badge-green">{o.status}</span>
                                                    </td>
                                                    <td style={{ padding: '0.65rem 0.75rem', color: '#9d6db0' }}>
                                                        {new Date(o.createdAt).toLocaleDateString('tr-TR')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
