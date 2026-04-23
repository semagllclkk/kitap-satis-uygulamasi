'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

const API = 'http://localhost:3000';

interface CartItem {
    id: string;
    quantity: number;
    bookId: string;
    book: {
        id: string;
        title: string;
        price: number;
        imageUrl?: string;
        author?: { name: string };
    };
}

export default function CartPage() {
    const router = useRouter();
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkingOut, setCheckingOut] = useState(false);
    const [toast, setToast] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/'); return; }
        fetchCart();
    }, []);

    async function fetchCart() {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (!userId || !token) return;
        try {
            const res = await fetch(`${API}/orders/cart/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } finally {
            setLoading(false);
        }
    }

    async function updateQuantity(cartId: string, quantity: number) {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (!userId || !token) return;

        if (quantity <= 0) {
            await removeItem(cartId);
            return;
        }

        await fetch(`${API}/orders/cart/${userId}/${cartId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ quantity }),
        });
        fetchCart();
    }

    async function removeItem(cartId: string) {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (!userId || !token) return;
        await fetch(`${API}/orders/cart/${userId}/${cartId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchCart();
    }

    async function checkout() {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (!userId || !token) return;
        setCheckingOut(true);
        try {
            const res = await fetch(`${API}/orders/checkout/${userId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                showToast('Siparişiniz alındı! 🎉', 'success');
                setItems([]);
                setTimeout(() => router.push('/dashboard'), 1800);
            } else {
                const data = await res.json();
                showToast(data.message || 'Hata oluştu', 'error');
            }
        } catch {
            showToast('Sunucuya bağlanılamadı', 'error');
        } finally {
            setCheckingOut(false);
        }
    }

    function showToast(msg: string, type: 'success' | 'error') {
        setToast(msg);
        setToastType(type);
        setTimeout(() => setToast(''), 3000);
    }

    const total = items.reduce((s, i) => s + Number(i.book.price) * i.quantity, 0);
    const totalQty = items.reduce((s, i) => s + i.quantity, 0);

    return (
        <div style={{ minHeight: '100vh' }}>
            <Navbar cartCount={totalQty} />

            <main className="page" style={{ maxWidth: '780px' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn-ghost" onClick={() => router.push('/dashboard')} style={{ padding: '0.4rem 0.8rem' }}>
                        ← Alışverişe Devam
                    </button>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>🛒 Sepetim</h1>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#9d6db0' }}>Yükleniyor...</div>
                ) : items.length === 0 ? (
                    <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</p>
                        <p style={{ color: '#9d6db0' }}>Sepetiniz boş</p>
                        <button className="btn-primary" onClick={() => router.push('/dashboard')} style={{ marginTop: '1.5rem' }}>
                            Kitaplara Göz At
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="card"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem',
                                    }}
                                >
                                    {/* Cover */}
                                    <div
                                        style={{
                                            width: '60px',
                                            height: '80px',
                                            flexShrink: 0,
                                            borderRadius: '0.5rem',
                                            background: item.book.imageUrl
                                                ? `url(${item.book.imageUrl}) center/cover no-repeat`
                                                : 'linear-gradient(135deg, #3d1f4a, #1a0f1e)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.75rem',
                                        }}
                                    >
                                        {!item.book.imageUrl && '📗'}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{item.book.title}</p>
                                        <p style={{ color: '#c084fc', fontSize: '0.8rem' }}>{item.book.author?.name}</p>
                                        <p style={{ color: '#f472b6', fontWeight: '700', marginTop: '0.25rem' }}>
                                            ₺{Number(item.book.price).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Quantity */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <button
                                            className="btn-ghost"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            style={{ padding: '0.25rem 0.6rem', fontSize: '1.1rem', lineHeight: 1 }}
                                        >
                                            −
                                        </button>
                                        <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '700' }}>
                                            {item.quantity}
                                        </span>
                                        <button
                                            className="btn-ghost"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            style={{ padding: '0.25rem 0.6rem', fontSize: '1.1rem', lineHeight: 1 }}
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Subtotal */}
                                    <div style={{ minWidth: '80px', textAlign: 'right' }}>
                                        <p style={{ fontWeight: '700', color: '#fce7f3' }}>
                                            ₺{(Number(item.book.price) * item.quantity).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Remove */}
                                    <button
                                        className="btn-danger"
                                        onClick={() => removeItem(item.id)}
                                        style={{ padding: '0.35rem 0.7rem', fontSize: '0.85rem' }}
                                    >
                                        Kaldır
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="glass" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: '#9d6db0' }}>Toplam ürün</span>
                                <span style={{ fontWeight: '600' }}>{totalQty} adet</span>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    borderTop: '1px solid #3d1f4a',
                                    paddingTop: '1rem',
                                    marginBottom: '1.25rem',
                                }}
                            >
                                <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Genel Toplam</span>
                                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f472b6' }}>
                                    ₺{total.toFixed(2)}
                                </span>
                            </div>
                            <button
                                className="btn-primary"
                                onClick={checkout}
                                disabled={checkingOut}
                                style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
                            >
                                {checkingOut ? 'İşleniyor...' : '✓ Siparişi Tamamla'}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Toast */}
            {toast && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        background: '#1a0f1e',
                        border: `1px solid ${toastType === 'success' ? '#34d39950' : '#f8717150'}`,
                        color: toastType === 'success' ? '#34d399' : '#f87171',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.75rem',
                        fontWeight: '600',
                        boxShadow: '0 8px 32px #00000050',
                        zIndex: 200,
                    }}
                >
                    {toast}
                </div>
            )}
        </div>
    );
}
