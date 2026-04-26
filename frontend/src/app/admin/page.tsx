'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';
import styles from './admin.module.css';

const API = 'http://localhost:3000';

interface OrderDetail {
    book?: { title?: string };
    price: number;
    quantity: number;
}

interface Order {
    id: string;
    totalPrice: number;
    createdAt: string;
    orderDetails?: OrderDetail[];
}

interface Author { 
    id: string; 
    name: string; 
}

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

    // İstatistiki verilerin hesaplanması
    const chartData = buildChartData(orders);
    const totalRevenue = orders.reduce((s, o) => s + Number(o.totalPrice), 0);
    
    const yearlyStats = Array.from({ length: 12 }, (_, i) => {
        const monthOrders = orders.filter(o => new Date(o.createdAt).getMonth() === i && new Date(o.createdAt).getFullYear() === new Date().getFullYear());
        return {
            month: i + 1,
            gelir: monthOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0),
            siparis: monthOrders.length
        };
    });

    const filteredYearlyStats = yearlyStats.map((stat: { month: number, gelir: number, siparis: number }, idx: number) => {
        const monthNum = idx + 1;
        if (monthNum > 4) {
            return { ...stat, gelir: 0, siparis: 0 };
        }
        return stat;
    });
    
    const totalYearRevenue = filteredYearlyStats.reduce((s, m) => s + m.gelir, 0);
    const totalYearOrders = filteredYearlyStats.reduce((s, m) => s + m.siparis, 0);
    
    const aprilOrders = orders.filter(o => new Date(o.createdAt).getMonth() === 3 && new Date(o.createdAt).getFullYear() === new Date().getFullYear());
    const aprilDays = new Set(aprilOrders.map(o => new Date(o.createdAt).toISOString().slice(0, 10)));
    const aprilDailyAverage = aprilDays.size > 0 ? (aprilOrders.reduce((s, o) => s + Number(o.totalPrice), 0) / aprilDays.size) : 0;
    
    const productRevenue: { [key: string]: number } = {};
    orders.forEach(o => {
        o.orderDetails?.forEach((od: OrderDetail) => {
            const title = od.book?.title || 'Silinmiş Kitap';
            productRevenue[title] = (productRevenue[title] || 0) + (od.price * od.quantity);
        });
    });
    const topProduct = Object.entries(productRevenue).sort((a, b) => b[1] - a[1])[0];
    const topProductName = topProduct?.[0] || '—';

    return (
        <div className={styles.pageContainer}>
            <Navbar />

            <main className={styles.mainContent}>
                <div className={styles.headerContainer}>
                    <h1 className={styles.pageTitle}>
                        📦 Envanter Paneli
                    </h1>
                    <div className={styles.buttonGroup}>
                        <button className="btn-ghost" onClick={() => router.push('/admin/authors')}>Yazar Yönetimi</button>
                        <button className="btn-ghost" onClick={() => router.push('/admin/users')}>Kullanıcı Yönetimi</button>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loadingContainer}>Yükleniyor...</div>
                ) : (
                    <>
                        <div className={styles.statsGrid}>
                            {[
                                { label: 'Toplam Kitap', value: books.length, icon: '📚', color: '#c084fc' },
                                { label: 'Toplam Sipariş', value: orders.length, icon: '🛒', color: '#f472b6' },
                                { label: 'Yıllık Sipariş', value: totalYearOrders, icon: '📅', color: '#60a5fa' },
                                { label: 'Yıllık Gelir', value: `₺${totalYearRevenue.toFixed(0)}`, icon: '💰', color: '#34d399' },
                                { label: 'Toplam Gelir', value: `₺${totalRevenue.toFixed(0)}`, icon: '📈', color: '#f59e0b' },
                                { label: 'Nisan Ort. Günlük', value: `₺${aprilDailyAverage.toFixed(0)}`, icon: '📊', color: '#a78bfa' },
                                { label: 'En Satılan', value: topProductName.length > 15 ? topProductName.substring(0, 12) + '...' : topProductName, icon: '⭐', color: '#f472b6' },
                                { label: 'Yazarlar', value: authors.length, icon: '✍️', color: '#10b981' },
                            ].map((s) => (
                                <div key={s.label} className={`card ${styles.statCard}`}>
                                    <div className={styles.statIcon}>{s.icon}</div>
                                    {/* Sadece color prop'u dinamik olduğu için bu style elementi linting'de genelde istisna tutulur */}
                                    <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
                                    <div className={styles.statLabel}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className={`card ${styles.bookTableContainer}`}>
                            <div className={styles.tableHeader}>
                                <h2 className={styles.tableTitle}>Kitap Listesi</h2>
                                <button className={`btn-primary ${styles.addButton}`} onClick={openAdd}>+ Yeni Kitap</button>
                            </div>
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead className={styles.tableHead}>
                                        <tr className={styles.tableHeadRow}>
                                            <th className={styles.tableHeaderCell}>Kitap Adı</th>
                                            <th className={styles.tableHeaderCell}>Yazar</th>
                                            <th className={styles.tableHeaderCell}>Fiyat</th>
                                            <th className={styles.tableHeaderCellCenter}>Kapak Görseli</th>
                                            <th className={styles.tableHeaderCellCenter}>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {books.map((b) => (
                                            <tr key={b.id} className={styles.tableBodyRow}>
                                                <td className={`${styles.tableCell} ${styles.cellTitle}`}>{b.title}</td>
                                                <td className={`${styles.tableCell} ${styles.cellAuthor}`}>{b.author?.name || '—'}</td>
                                                <td className={`${styles.tableCell} ${styles.cellPrice}`}>₺{Number(b.price).toFixed(2)}</td>
                                                <td className={styles.tableCellCenter}>
                                                    {b.imageUrl ? (
                                                        <img src={b.imageUrl} alt={b.title} className={styles.bookImage} />
                                                    ) : (
                                                        <div className={styles.bookPlaceholder}>📗</div>
                                                    )}
                                                </td>
                                                <td className={styles.tableCellCenter}>
                                                    <div className={styles.actionGroup}>
                                                        <button className={`btn-ghost ${styles.actionBtn}`} onClick={() => openEdit(b)}>Düzenle</button>
                                                        <button className={`btn-danger ${styles.actionBtn}`} onClick={() => removeBook(b.id)}>Sil</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className={`card ${styles.chartCard}`}>
                            <h2 className={styles.chartTitle}>Aylık Gelir Grafiği</h2>
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

            <footer className={styles.footerContainer}>
                <span className={styles.footerText}>Kitabevi Dashboard</span>
                <button
                    onClick={() => setShowResetModal(true)}
                    disabled={resetting}
                    className={styles.resetButton}
                >
                    {resetting ? 'Sıfırlanıyor...' : 'Admin Reset'}
                </button>
            </footer>

            {modal && (
                <div className={styles.modalBackdrop}>
                    <div className={`glass ${styles.modal}`}>
                        <h2 className={styles.modalTitle}>{modal === 'add' ? '+ Yeni Kitap' : '✏️ Kitabı Düzenle'}</h2>
                        <div className={styles.formGroup}>
                            {[['title', 'Başlık *'], ['price', 'Fiyat *'], ['stock', 'Stok *'], ['isbn', 'ISBN'], ['imageUrl', 'Kapak URL'], ['publicationYear', 'Yayın Yılı'], ['publisher', 'Yayınevi']].map(([k, label]) => (
                                <div key={k}>
                                    <label htmlFor={`input-${k}`} className={styles.inputLabel}>{label}</label>
                                    <input 
                                        id={`input-${k}`}
                                        title={label}
                                        placeholder={label}
                                        className="input" 
                                        value={(form as Record<string, string>)[k]} 
                                        onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} 
                                    />
                                </div>
                            ))}
                            <div>
                                <label htmlFor="select-author" className={styles.inputLabel}>Yazar *</label>
                                <select 
                                    id="select-author"
                                    title="Yazar Seçimi"
                                    aria-label="Yazar Seçimi"
                                    className="input" 
                                    value={form.authorId} 
                                    onChange={e => setForm(f => ({ ...f, authorId: e.target.value }))}
                                >
                                    <option value="">Seçin…</option>
                                    {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className={styles.modalActionGroup}>
                            <button className={`btn-primary ${styles.flex1}`} onClick={saveBook} disabled={saving}>{saving ? '…' : 'Kaydet'}</button>
                            <button className={`btn-ghost ${styles.flex1}`} onClick={() => setModal(null)}>İptal</button>
                        </div>
                    </div>
                </div>
            )}

            {showResetModal && (
                <div className={styles.modalBackdrop}>
                    <div className={`glass ${styles.resetModalBody}`}>
                        <p className={styles.warningIcon}>⚠️</p>
                        <h2 className={styles.modalTitle}>Sistemi Sıfırla</h2>
                        <p className={styles.resetModalDesc}>
                            Tüm test verileri silinip, sistem temiz demo verileriyle baştan kurulacaktır. Onaylıyor musunuz?
                        </p>
                        <div className={styles.modalActionGroup}>
                            <button onClick={handleReset} className={styles.resetConfirmBtn}>
                                Evet, Sıfırla
                            </button>
                            <button className={`btn-ghost ${styles.flex1}`} onClick={() => setShowResetModal(false)}>İptal</button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className={`${styles.toastContainer} ${styles.toastSuccess}`}>
                    <div className={styles.toastContent}>
                        {toast}
                    </div>
                    <div className={`${styles.toastProgress} ${styles.toastProgressBg}`}></div>
                </div>
            )}
        </div>
    );
}