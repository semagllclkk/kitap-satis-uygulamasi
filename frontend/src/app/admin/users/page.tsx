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
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [resetting, setResetting] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

    async function removeUser() {
        if (!deleteConfirmId) return;
        const token = localStorage.getItem('token');
        await fetch(`${API}/admin/users/${deleteConfirmId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        setDeleteConfirmId(null);
        showToast('Kullanıcı silindi ✓', 'success');
        fetchUsers();
    }

    async function handleReset() {
        const token = localStorage.getItem('token');
        setResetting(true);
        setShowResetModal(false);
        try {
            await fetch(`${API}/admin/reset`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
            await fetch(`${API}/admin/seed-demo`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
            showToast('✅ Test verileri temizlendi!', 'success');
            fetchUsers();
        } catch {
            showToast('Hata oluştu', 'error');
        } finally {
            setResetting(false);
        }
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
                                                <button className="btn-danger" onClick={() => setDeleteConfirmId(u.id)} style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>Sil</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Delete Confirm Modal */}
            {deleteConfirmId && (
                <div style={{ position: 'fixed', inset: 0, background: '#00000090', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem', animation: 'fadeIn 0.2s ease' }}>
                    <div className="glass" style={{ maxWidth: '400px', width: '100%', padding: '2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🗑️</div>
                        <h2 style={{ fontWeight: '800', marginBottom: '0.75rem', color: '#f87171' }}>Silmek İstediğinize Emin Misiniz?</h2>
                        <p style={{ color: '#c084fc', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                            Bu kayıt kalıcı olarak silinecek ve geri alınamayacaktır.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={removeUser} style={{ flex: 1, padding: '0.8rem', borderRadius: '0.75rem', background: '#ef4444', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
                                Evet, Sil
                            </button>
                            <button className="btn-ghost" onClick={() => setDeleteConfirmId(null)} style={{ flex: 1 }}>İptal</button>
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
                <div style={{
                    position: 'fixed', bottom: '2rem', right: '2rem', background: '#1a0f1e',
                    border: `1px solid ${toastType === 'success' ? '#10b981' : '#ef4444'}`,
                    color: toastType === 'success' ? '#10b981' : '#ef4444',
                    padding: '0.75rem 1.25rem', borderRadius: '0.75rem', fontWeight: '600', zIndex: 400,
                    boxShadow: `0 8px 32px ${toastType === 'success' ? '#10b98130' : '#ef444430'}`,
                    overflow: 'hidden', animation: 'fadeIn 0.2s ease', maxWidth: '360px'
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
            <style>{`
                @keyframes shrink { from { width: '100%'; } to { width: '0%'; } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
