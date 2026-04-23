'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

const API = 'http://localhost:3000';

interface Book {
    id: string;
    title: string;
    price: number;
    stock: number;
    imageUrl?: string;
    description?: string;
    publisher?: string;
    publicationYear?: string;
    author?: { name: string };
}

export default function DashboardPage() {
    const router = useRouter();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [addingId, setAddingId] = useState<string | null>(null);
    const [toast, setToast] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/'); return; }
        fetchBooks();
        fetchCartCount();
    }, []);

    async function fetchBooks() {
        try {
            const res = await fetch(`${API}/books`);
            const data = await res.json();
            setBooks(Array.isArray(data) ? data : []);
        } finally {
            setLoading(false);
        }
    }

    async function fetchCartCount() {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (!userId || !token) return;
        try {
            const res = await fetch(`${API}/orders/cart/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setCartCount(Array.isArray(data) ? data.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0) : 0);
        } catch { /* ignore */ }
    }

    async function addToCart(bookId: string) {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (!userId || !token) return;
        setAddingId(bookId);
        try {
            await fetch(`${API}/orders/cart/${userId}/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ bookId, quantity: 1 }),
            });
            setToast('Sepete eklendi! 🛒');
            setTimeout(() => setToast(''), 2500);
            fetchCartCount();
        } catch {
            setToast('Hata oluştu');
            setTimeout(() => setToast(''), 2500);
        } finally {
            setAddingId(null);
        }
    }

    const filtered = books.filter(
        (b) =>
            b.title.toLowerCase().includes(search.toLowerCase()) ||
            (b.author?.name || '').toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div style={{ minHeight: '100vh' }}>
            <Navbar cartCount={cartCount} />

            <main className="page">
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                        📖 Kitap Kataloğu
                    </h1>
                    <p style={{ color: '#9d6db0', fontSize: '0.9rem' }}>
                        {books.length} kitap mevcut
                    </p>
                </div>

                {/* Search */}
                <div style={{ marginBottom: '2rem', maxWidth: '400px' }}>
                    <input
                        className="input"
                        placeholder="🔍  Kitap veya yazar ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Books grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#9d6db0' }}>
                        Yükleniyor...
                    </div>
                ) : (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                            gap: '1.25rem',
                        }}
                    >
                        {filtered.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                onAdd={() => addToCart(book.id)}
                                adding={addingId === book.id}
                            />
                        ))}
                        {filtered.length === 0 && (
                            <p style={{ color: '#9d6db0', gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>
                                Sonuç bulunamadı.
                            </p>
                        )}
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
                        border: '1px solid #db277750',
                        color: '#f472b6',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.75rem',
                        fontWeight: '600',
                        boxShadow: '0 8px 32px #db277730',
                        zIndex: 200,
                        animation: 'fadeIn 0.2s ease',
                    }}
                >
                    {toast}
                </div>
            )}

            <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </div>
    );
}

function BookCard({ book, onAdd, adding }: { book: Book; onAdd: () => void; adding: boolean }) {
    const outOfStock = book.stock === 0;

    return (
        <div
            className="card"
            style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
            {/* Cover */}
            <div
                style={{
                    height: '180px',
                    background: book.imageUrl
                        ? `url(${book.imageUrl}) center/cover no-repeat`
                        : 'linear-gradient(135deg, #3d1f4a, #1a0f1e)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3.5rem',
                    flexShrink: 0,
                }}
            >
                {!book.imageUrl && '📗'}
            </div>

            {/* Info */}
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', lineHeight: '1.3' }}>{book.title}</h3>
                <p style={{ fontSize: '0.8rem', color: '#c084fc' }}>{book.author?.name || '—'}</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f472b6', marginTop: 'auto', paddingTop: '0.5rem' }}>
                    ₺{Number(book.price).toFixed(2)}
                </p>
                {outOfStock ? (
                    <span className="badge badge-purple" style={{ alignSelf: 'flex-start' }}>Stok yok</span>
                ) : (
                    <span style={{ fontSize: '0.75rem', color: '#9d6db0' }}>{book.stock} adet kaldı</span>
                )}
                <button
                    className="btn-primary"
                    onClick={onAdd}
                    disabled={adding || outOfStock}
                    style={{ marginTop: '0.5rem', width: '100%' }}
                >
                    {adding ? '...' : outOfStock ? 'Tükendi' : '+ Sepete Ekle'}
                </button>
            </div>
        </div>
    );
}
