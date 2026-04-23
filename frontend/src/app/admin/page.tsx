'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    LineChart,
    Line,
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
    createdAt: string;
}

interface Book {
    id: string;
    title: string;
    price: number;
    imageUrl?: string;
    author?: { name: string };
}

function getDayLabel(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

function buildChartData(orders: Order[]) {
    const now = new Date();
    const days: { date: string; label: string; gelir: number }[] = [];

    // Son 14 günü gösterelim ki line chart daha dolu görünsün
    for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().slice(0, 10);
        days.push({ date: dateKey, label: getDayLabel(d.toISOString()), gelir: 0 });
    }

    for (const order of orders) {
        const dateKey = new Date(order.createdAt).toISOString().slice(0, 10);
        const day = days.find((d) => d.date === dateKey);
        if (day) {
            day.gelir += Number(order.totalPrice);
        }
    }

    return days;
}

export default function AdminPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [resetting, setResetting] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        const token = localStorage.getItem('token');
        if (!token || role !== 'admin') { router.push('/'); return; }
        fetchAll();
    }, []);

    async function fetchAll() {
        const token = localStorage.getItem('token');
        try {
            const [ordersRes, booksRes] = await Promise.all([
                fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API}/books`),
            ]);
            const ordersData = await ordersRes.json();
            const booksData = await booksRes.json();
            setOrders(Array.isArray(ordersData) ? ordersData : []);
            setBooks(Array.isArray(booksData) ? booksData : []);
        } finally {
            setLoading(false);
        }
    }

    async function handleReset() {
        const token = localStorage.getItem('token');
        setResetting(true);
        setShowResetModal(false);
        try {
            await fetch(`${API}/admin/reset`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
            await fetch(`${API}/admin/seed-demo`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
            window.location.reload();
        } catch {
            alert('Sıfırlama sırasında hata oluştu.');
            setResetting(false);
        }
    }

    const chartData = buildChartData(orders);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <main className="page" style={{ flex: 1, paddingBottom: '4rem' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>
                        📦 Envanter Paneli
                    </h1>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn-ghost" onClick={() => router.push('/admin/books')}>Kitap Yönetimi</button>
                        <button className="btn-ghost" onClick={() => router.push('/admin/authors')}>Yazar Yönetimi</button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#9d6db0' }}>Yükleniyor...</div>
                ) : (
                    <>
                        {/* Book List Table (from mockup) */}
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', color: '#c084fc' }}>
                                Kitap Listesi
                            </h2>
                            <div style={{ overflowX: 'auto', maxHeight: '300px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: 'var(--color-surface)' }}>
                                        <tr style={{ borderBottom: '1px solid #3d1f4a' }}>
                                            <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#9d6db0' }}>Kitap Adı</th>
                                            <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#9d6db0' }}>Yazar</th>
                                            <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#9d6db0' }}>Fiyat</th>
                                            <th style={{ textAlign: 'center', padding: '0.5rem 0.75rem', color: '#9d6db0' }}>Kapak Görseli</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {books.map((b) => (
                                            <tr key={b.id} style={{ borderBottom: '1px solid #3d1f4a22' }}>
                                                <td style={{ padding: '0.75rem', fontWeight: '600' }}>{b.title}</td>
                                                <td style={{ padding: '0.75rem', color: '#c084fc' }}>{b.author?.name || '—'}</td>
                                                <td style={{ padding: '0.75rem', color: '#f472b6', fontWeight: '700' }}>₺{Number(b.price).toFixed(2)}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                    {b.imageUrl ? (
                                                        <img src={b.imageUrl} alt={b.title} style={{ height: '50px', width: '35px', objectFit: 'cover', borderRadius: '4px', display: 'inline-block' }} />
                                                    ) : (
                                                        <div style={{ height: '50px', width: '35px', background: '#3d1f4a', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', margin: '0 auto' }}>📗</div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Line Chart (from mockup) */}
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', color: '#c084fc' }}>
                                Aylık Gelir Grafiği
                            </h2>
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#3d1f4a" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fill: '#9d6db0', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#9d6db0', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: '#1a0f1e', border: '1px solid #3d1f4a', borderRadius: '0.5rem', color: '#fce7f3' }}
                                        formatter={(v: any) => [`₺${Number(v).toFixed(2)}`, 'Gelir']}
                                    />
                                    <Line type="monotone" dataKey="gelir" stroke="#f472b6" strokeWidth={3} dot={{ r: 4, fill: '#db2777', stroke: '#f472b6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
            </main>

            {/* Footer with Reset Button (from mockup) */}
            <footer style={{ background: 'var(--color-surface-2)', borderTop: '1px solid var(--color-border)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#9d6db0', fontSize: '0.9rem', fontWeight: '600' }}>Kitabevi Dashboard</span>
                <button
                    onClick={() => setShowResetModal(true)}
                    disabled={resetting}
                    style={{
                        padding: '0.6rem 1.2rem', borderRadius: '0.5rem',
                        background: 'transparent', color: '#f87171',
                        border: '1px solid #f8717180', fontWeight: '600',
                        cursor: 'pointer', fontSize: '0.85rem',
                        opacity: resetting ? 0.6 : 1, transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#f8717115'; e.currentTarget.style.borderColor = '#f87171'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#f8717180'; }}
                >
                    {resetting ? 'Sıfırlanıyor...' : 'Admin Reset'}
                </button>
            </footer>

            {/* Reset Confirm Modal */}
            {showResetModal && (
                <div style={{ position: 'fixed', inset: 0, background: '#00000090', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
                    <div className="glass" style={{ maxWidth: '420px', width: '100%', padding: '2rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</p>
                        <h2 style={{ fontWeight: '800', marginBottom: '0.75rem', color: '#f472b6' }}>Sistemi Sıfırla</h2>
                        <p style={{ color: '#c084fc', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                            Tüm test verileri silinip, sistem temiz demo verileriyle baştan kurulacaktır. Onaylıyor musunuz?
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={handleReset}
                                style={{ flex: 1, padding: '0.8rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #7e22ce, #9d174d)', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer' }}
                            >
                                Evet, Sıfırla
                            </button>
                            <button className="btn-ghost" onClick={() => setShowResetModal(false)} style={{ flex: 1 }}>İptal</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
