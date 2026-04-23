'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';

const API = 'http://localhost:3000';

interface User { id: string; name: string; email: string; role: string; createdAt: string; }

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');
    const [toastColor, setToastColor] = useState('#f472b6');
    const [resetting, setResetting] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('userRole') !== 'admin') { router.push('/'); return; }
        fetchUsers();
    }, []);

    async function fetchUsers() {
        const token = localStorage.getItem('token');
        const data = await fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
    }

    async function removeUser(id: string) {
        if (!confirm('Bu kullanıcıyı silmek istiyor musunuz?')) return;
        const token = localStorage.getItem('token');
        await fetch(`${API}/admin/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        showToast('Kullanıcı silindi', '#f472b6');
        fetchUsers();
    }

    async function handleReset() {
        const token = localStorage.getItem('token');
        setResetting(true);
        setShowResetModal(false);
        try {
            await fetch(`${API}/admin/reset`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
            await fetch(`${API}/admin/seed-demo`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
            showToast('✅ Sistem sıfırlandı ve demo verileri yüklendi!', '#34d399');
            fetchUsers();
        } catch {
            showToast('Hata oluştu', '#f87171');
        } finally {
            setResetting(false);
        }
    }

    function showToast(msg: string, color: string) {
        setToast(msg); setToastColor(color);
        setTimeout(() => setToast(''), 3500);
    }

    return (
        <div style={{ minHeight: '100vh' }}>
            <Navbar />
            <main className="page">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <button className="btn-ghost" onClick={() => router.push('/admin')} style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>← Admin</button>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>👥 Kullanıcılar & Sıfırlama</h1>
                    </div>
                    {/* RESET BUTTON */}
                    <button
                        onClick={() => setShowResetModal(true)}
                        disabled={resetting}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.7rem 1.4rem', borderRadius: '0.75rem',
                            background: 'linear-gradient(135deg, #7e22ce, #9d174d)',
                            color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer',
                            boxShadow: '0 4px 20px #7e22ce50',
                            opacity: resetting ? 0.6 : 1,
                            fontSize: '0.9rem',
                        }}
                    >
                        {resetting ? '⏳ Sıfırlanıyor...' : '🔄 Sistemi Sıfırla'}
                    </button>
                </div>

                {/* Reset info box */}
                <div style={{ padding: '1rem 1.25rem', borderRadius: '0.75rem', background: '#7e22ce15', border: '1px solid #7e22ce40', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#c084fc' }}>
                    <strong style={{ color: '#f472b6' }}>🔄 Sistemi Sıfırla</strong> butonu; tüm test verilerini, sahte siparişleri ve kirli kayıtları temizleyerek sistemi demo-hazır gerçek verilerle yeniden kurar.
                </div>

                {loading ? <p style={{ textAlign: 'center', color: '#9d6db0', padding: '3rem' }}>Yükleniyor…</p> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #3d1f4a' }}>
                                    {['Ad Soyad', 'E-posta', 'Rol', 'Kayıt Tarihi', 'İşlem'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#9d6db0' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid #3d1f4a22' }}>
                                        <td style={{ padding: '0.65rem 0.75rem', fontWeight: '600' }}>{u.name}</td>
                                        <td style={{ padding: '0.65rem 0.75rem', color: '#c084fc' }}>{u.email}</td>
                                        <td style={{ padding: '0.65rem 0.75rem' }}><span className={`badge ${u.role === 'admin' ? 'badge-pink' : 'badge-green'}`}>{u.role}</span></td>
                                        <td style={{ padding: '0.65rem 0.75rem', color: '#9d6db0' }}>{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
                                        <td style={{ padding: '0.65rem 0.75rem' }}>
                                            {u.role !== 'admin' && (
                                                <button className="btn-danger" onClick={() => removeUser(u.id)} style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>Sil</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Reset Confirm Modal */}
            {showResetModal && (
                <div style={{ position: 'fixed', inset: 0, background: '#00000090', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
                    <div className="glass" style={{ maxWidth: '420px', width: '100%', padding: '2rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</p>
                        <h2 style={{ fontWeight: '800', marginBottom: '0.75rem', color: '#f472b6' }}>Sistemi Sıfırla</h2>
                        <p style={{ color: '#c084fc', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                            Bu işlem tüm test verilerini silecek ve sistemi temiz demo verileriyle yeniden başlatacaktır. Bu işlem geri alınamaz.
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

            {toast && (
                <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#1a0f1e', border: `1px solid ${toastColor}50`, color: toastColor, padding: '0.75rem 1.25rem', borderRadius: '0.75rem', fontWeight: '600', zIndex: 400, maxWidth: '360px' }}>{toast}</div>
            )}
        </div>
    );
}
