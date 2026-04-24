'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';

const API = 'http://localhost:3000';

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

export default function AdminBooksPage() {
    const router = useRouter();
    const [books, setBooks] = useState<Book[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<'add' | 'edit' | null>(null);
    const [editing, setEditing] = useState<Book | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        if (role !== 'admin') { router.push('/'); return; }
        fetchAll();
    }, []);

    async function fetchAll() {
        const token = localStorage.getItem('token');
        const [b, a] = await Promise.all([
            fetch(`${API}/books`).then((r) => r.json()),
            fetch(`${API}/authors`).then((r) => r.json()),
        ]);
        setBooks(Array.isArray(b) ? b : []);
        setAuthors(Array.isArray(a) ? a : []);
        setLoading(false);
    }

    function openAdd() { setForm(EMPTY_FORM); setEditing(null); setModal('add'); }
    function openEdit(book: Book) {
        setEditing(book);
        setForm({ title: book.title, price: String(book.price), stock: String(book.stock), isbn: book.isbn || '', imageUrl: book.imageUrl || '', publicationYear: book.publicationYear || '', publisher: book.publisher || '', authorId: book.authorId });
        setModal('edit');
    }

    async function save() {
        const token = localStorage.getItem('token');
        setSaving(true);
        const body = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
        const url = modal === 'edit' ? `${API}/books/${editing!.id}` : `${API}/books`;
        const method = modal === 'edit' ? 'PUT' : 'POST';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
        setSaving(false);
        setModal(null);
        showToast(modal === 'edit' ? 'Kitap güncellendi ✓' : 'Kitap eklendi ✓', 'success');
        fetchAll();
    }

    async function remove(id: string) {
        if (!confirm('Bu kitabı silmek istiyor musunuz?')) return;
        const token = localStorage.getItem('token');
        await fetch(`${API}/books/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        showToast('Silindi ✓', 'success');
        fetchAll();
    }

    function showToast(msg: string, type: 'success' | 'error' = 'success') {
        setToast(''); // reset animation
        setTimeout(() => {
            setToastType(type);
            setToast(msg);
        }, 10);
        setTimeout(() => setToast(''), 3000);
    }

    return (
        <div style={{ minHeight: '100vh' }}>
            <Navbar />
            <main className="page">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <button className="btn-ghost" onClick={() => router.push('/admin')} style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>← Admin</button>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>📚 Kitap Yönetimi</h1>
                    </div>
                    <button className="btn-primary" onClick={openAdd}>+ Kitap Ekle</button>
                </div>

                {loading ? <p style={{ textAlign: 'center', color: '#9d6db0', padding: '3rem' }}>Yükleniyor…</p> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #3d1f4a' }}>
                                    {['Başlık', 'Yazar', 'Fiyat', 'Stok', 'İşlemler'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#9d6db0' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {books.map(b => (
                                    <tr key={b.id} style={{ borderBottom: '1px solid #3d1f4a22' }}>
                                        <td style={{ padding: '0.65rem 0.75rem', fontWeight: '600' }}>{b.title}</td>
                                        <td style={{ padding: '0.65rem 0.75rem', color: '#c084fc' }}>{b.author?.name || '—'}</td>
                                        <td style={{ padding: '0.65rem 0.75rem', color: '#f472b6', fontWeight: '700' }}>₺{Number(b.price).toFixed(2)}</td>
                                        <td style={{ padding: '0.65rem 0.75rem' }}><span className={`badge ${b.stock > 0 ? 'badge-green' : 'badge-purple'}`}>{b.stock}</span></td>
                                        <td style={{ padding: '0.65rem 0.75rem', display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn-ghost" onClick={() => openEdit(b)} style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>Düzenle</button>
                                            <button className="btn-danger" onClick={() => remove(b.id)} style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>Sil</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal */}
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
                                <button className="btn-primary" onClick={save} disabled={saving} style={{ flex: 1 }}>{saving ? '…' : 'Kaydet'}</button>
                                <button className="btn-ghost" onClick={() => setModal(null)} style={{ flex: 1 }}>İptal</button>
                            </div>
                        </div>
                    </div>
                )}

                {toast && (
                    <div style={{
                        position: 'fixed', bottom: '2rem', right: '2rem', background: '#1a0f1e',
                        border: `1px solid ${toastType === 'success' ? '#10b981' : '#ef4444'}`,
                        color: toastType === 'success' ? '#10b981' : '#ef4444',
                        padding: '0.75rem 1.25rem', borderRadius: '0.75rem', fontWeight: '600', zIndex: 400,
                        boxShadow: `0 8px 32px ${toastType === 'success' ? '#10b98130' : '#ef444430'}`,
                        overflow: 'hidden', animation: 'fadeIn 0.2s ease'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>{toastType === 'success' ? '✅' : '⚠️'}</span>
                            <span>{toast}</span>
                        </div>
                        {/* Timer progress bar at the bottom */}
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, height: '3px',
                            background: toastType === 'success' ? '#10b981' : '#ef4444',
                            animation: 'shrink 3s linear forwards'
                        }} />
                    </div>
                )}
            </main>
            <style>{`
                @keyframes shrink { from { width: '100%'; } to { width: '0%'; } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
