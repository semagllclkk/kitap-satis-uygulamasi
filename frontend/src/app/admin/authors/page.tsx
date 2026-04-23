'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';

const API = 'http://localhost:3000';

interface Author { id: string; name: string; biography?: string; birthDate?: string; nationality?: string; }
const EMPTY = { name: '', biography: '', birthDate: '', nationality: '' };

export default function AdminAuthorsPage() {
    const router = useRouter();
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<'add' | 'edit' | null>(null);
    const [editing, setEditing] = useState<Author | null>(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (localStorage.getItem('userRole') !== 'admin') { router.push('/'); return; }
        fetchAuthors();
    }, []);

    async function fetchAuthors() {
        const data = await fetch(`${API}/authors`).then(r => r.json());
        setAuthors(Array.isArray(data) ? data : []);
        setLoading(false);
    }

    function openAdd() { setForm(EMPTY); setEditing(null); setModal('add'); }
    function openEdit(a: Author) { setEditing(a); setForm({ name: a.name, biography: a.biography || '', birthDate: a.birthDate || '', nationality: a.nationality || '' }); setModal('edit'); }

    async function save() {
        const token = localStorage.getItem('token');
        setSaving(true);
        const url = modal === 'edit' ? `${API}/authors/${editing!.id}` : `${API}/authors`;
        await fetch(url, { method: modal === 'edit' ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
        setSaving(false);
        setModal(null);
        setToast(modal === 'edit' ? 'Güncellendi ✓' : 'Eklendi ✓');
        setTimeout(() => setToast(''), 2500);
        fetchAuthors();
    }

    async function remove(id: string) {
        if (!confirm('Bu yazarı silmek istiyor musunuz?')) return;
        const token = localStorage.getItem('token');
        await fetch(`${API}/authors/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        setToast('Silindi'); setTimeout(() => setToast(''), 2500);
        fetchAuthors();
    }

    return (
        <div style={{ minHeight: '100vh' }}>
            <Navbar />
            <main className="page">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <button className="btn-ghost" onClick={() => router.push('/admin')} style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>← Admin</button>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>✍️ Yazar Yönetimi</h1>
                    </div>
                    <button className="btn-primary" onClick={openAdd}>+ Yazar Ekle</button>
                </div>

                {loading ? <p style={{ textAlign: 'center', color: '#9d6db0', padding: '3rem' }}>Yükleniyor…</p> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {authors.map(a => (
                            <div key={a.id} className="card" style={{ padding: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontWeight: '700', color: '#fce7f3' }}>{a.name}</h3>
                                    <span className="badge badge-purple">{a.nationality || '—'}</span>
                                </div>
                                {a.birthDate && <p style={{ fontSize: '0.8rem', color: '#9d6db0', marginBottom: '0.5rem' }}>🎂 {a.birthDate}</p>}
                                {a.biography && <p style={{ fontSize: '0.8rem', color: '#c084fc', lineHeight: 1.5, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.biography}</p>}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn-ghost" onClick={() => openEdit(a)} style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}>Düzenle</button>
                                    <button className="btn-danger" onClick={() => remove(a.id)} style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}>Sil</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {modal && (
                    <div style={{ position: 'fixed', inset: 0, background: '#00000090', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
                        <div className="glass" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
                            <h2 style={{ fontWeight: '800', marginBottom: '1.5rem', color: '#f472b6' }}>{modal === 'add' ? '+ Yeni Yazar' : '✏️ Yazarı Düzenle'}</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                                {[['name', 'Ad Soyad *'], ['birthDate', 'Doğum Tarihi'], ['nationality', 'Milliyet']].map(([k, label]) => (
                                    <div key={k}>
                                        <label style={{ fontSize: '0.8rem', color: '#c084fc', display: 'block', marginBottom: '0.3rem' }}>{label}</label>
                                        <input className="input" value={(form as Record<string, string>)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                                    </div>
                                ))}
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#c084fc', display: 'block', marginBottom: '0.3rem' }}>Biyografi</label>
                                    <textarea className="input" rows={3} value={form.biography} onChange={e => setForm(f => ({ ...f, biography: e.target.value }))} style={{ resize: 'vertical' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                                <button className="btn-primary" onClick={save} disabled={saving} style={{ flex: 1 }}>{saving ? '…' : 'Kaydet'}</button>
                                <button className="btn-ghost" onClick={() => setModal(null)} style={{ flex: 1 }}>İptal</button>
                            </div>
                        </div>
                    </div>
                )}

                {toast && <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#1a0f1e', border: '1px solid #db277750', color: '#f472b6', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', fontWeight: '600', zIndex: 400 }}>{toast}</div>}
            </main>
        </div>
    );
}
