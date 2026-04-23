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

interface Author { id: string; name: string; }

interface Book {
    id: string;
    title: string;
    price: number;
    stock: number;
    isbn?: string;
    imageUrl?: string;
    publicationYear?: string;
    publisher?: string;
    authorId: string;
    author?: { name: string };
}

const EMPTY_FORM = { title: '', price: '', stock: '', isbn: '', imageUrl: '', publicationYear: '', publisher: '', authorId: '' };

function getDayLabel(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

function buildChartData(orders: Order[]) {
    const now = new Date();
    const days: { date: string; label: string; gelir: number }[] = [];

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
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);

    // CRUD states
    const [modal, setModal] = useState<'add' | 'edit' | null>(null);
    const [editing, setEditing] = useState<Book | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');

    // Reset states
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
            const [ordersRes, booksRes, authorsRes] = await Promise.all([
                fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API}/books`),
                fetch(`${API}/authors`),
            ]);
            const ordersData = await ordersRes.json();
            const booksData = await booksRes.json();
            const authorsData = await authorsRes.json();
            setOrders(Array.isArray(ordersData) ? ordersData : []);
            setBooks(Array.isArray(booksData) ? booksData : []);
            setAuthors(Array.isArray(authorsData) ? authorsData : []);
        } finally {
            setLoading(false);
        }
    }

    // CRUD functions
    function openAdd() { setForm(EMPTY_FORM); setEditing(null); setModal('add'); }
    function openEdit(book: Book) {
        setEditing(book);
        setForm({ title: book.title, price: String(book.price), stock: String(book.stock), isbn: book.isbn || '', imageUrl: book.imageUrl || '', publicationYear: book.publicationYear || '', publisher: book.publisher || '', authorId: book.authorId });
        setModal('edit');
    }

    async function saveBook() {
        const token = localStorage.getItem('token');
        setSaving(true);
        const body = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
        const url = modal === 'edit' ? `${API}/books/${editing!.id}` : `${API}/books`;
        const method = modal === 'edit' ? 'PUT' : 'POST';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
        setSaving(false);
        setModal(null);
        showToast(modal === 'edit' ? 'Kitap güncellendi ✓' : 'Kitap eklendi ✓');
        fetchAll();
    }

    async function removeBook(id: string) {
        if (!confirm('Bu kitabı silmek istiyor musunuz?')) return;
        const token = localStorage.getItem('token');
        await fetch(`${API}/books/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        showToast('Silindi ✓');
        fetchAll();
    }

    function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

    // Reset function
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
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>
                        📦 Envanter Paneli
                    </h1>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button className="btn-ghost" onClick={() => router.push('/admin/authors')}>Yazar Yönetimi</button>
                        <button className="btn-ghost" onClick={() => router.push('/admin/users')}>Kullanıcı Yönetimi</button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#9d6db0' }}>Yükleniyor...</div>
                ) : (
                    <>
                        {/* Book List Table with CRUD */}
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#c084fc' }}>
                                    Kitap Listesi
                                </h2>
                                <button className="btn-primary" onClick={openAdd} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>+ Yeni Kitap</button>
                            </div>
                            <div style={{ overflowX: 'auto', maxHeight: '340px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: 'var(--color-surface)' }}>
                                        <tr style={{ borderBottom: '1px solid #3d1f4a' }}>
                                            <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#9d6db0' }}>Kitap Adı</th>
                                            <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#9d6db0' }}>Yazar</th>
                                            <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#9d6db0' }}>Fiyat</th>
                                            <th style={{ textAlign: 'center', padding: '0.5rem 0.75rem', color: '#9d6db0' }}>Kapak Görseli</th>
                                            <th style={{ textAlign: 'center', padding: '0.5rem 0.75rem', color: '#9d6db0' }}>İşlemler</th>
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
                                                        <img src={b.imageUrl} alt={b.title} style={{ height: '40px', width: '30px', objectFit: 'cover', borderRadius: '4px', display: 'inline-block' }} />
                                                    ) : (
                                                        <div style={{ height: '40px', width: '30px', background: '#3d1f4a', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', margin: '0 auto' }}>📗</div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                        <button className="btn-ghost" onClick={() => openEdit(b)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Düzenle</button>
                                                        <button className="btn-danger" onClick={() => removeBook(b.id)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Sil</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Line Chart */}
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', color: '#c084fc' }}>
                                Aylık Gelir Grafiği
                            </h2>
                            <ResponsiveContainer width="100%" height={240}>
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

            {/* Footer with Reset Button */}
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

            {/* CRUD Modal */}
            {modal && (
                <div style={{ position: 'fixed', inset: 0, background: '#00000090', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '520px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ fontWeight: '800', marginBottom: '1.5rem', color: '#f472b6' }}>{modal === 'add' ? '+ Yeni Kitap' : '✏️ Kitabı Düzenle'}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                            {[['title', 'Başlık *'], ['price', 'Fiyat *'], ['stock', 'Stok *'], ['isbn', 'ISBN'], ['imageUrl', 'Kapak URL'], ['publicationYear', 'Yayın Yılı'], ['publisher', 'Yayınevi']].map(([k, label]) => (
                                <div key={k}>
                                    <label style={{ fontSize: '0.8rem', color: '#c084fc', display: 'block', marginBottom: '0.3rem' }}>{label}</label>
                                    <input className="input" value={(form as Record<string, string>)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                                </div>
                            ))}
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#c084fc', display: 'block', marginBottom: '0.3rem' }}>Yazar *</label>
                                <select className="input" value={form.authorId} onChange={e => setForm(f => ({ ...f, authorId: e.target.value }))}>
                                    <option value="">Seçin…</option>
                                    {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button className="btn-primary" onClick={saveBook} disabled={saving} style={{ flex: 1 }}>{saving ? '…' : 'Kaydet'}</button>
                            <button className="btn-ghost" onClick={() => setModal(null)} style={{ flex: 1 }}>İptal</button>
                        </div>
                    </div>
                </div>
            )}

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

            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#1a0f1e', border: '1px solid #db277750', color: '#f472b6', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', fontWeight: '600', zIndex: 400 }}>{toast}</div>
            )}
        </div>
    );
}
