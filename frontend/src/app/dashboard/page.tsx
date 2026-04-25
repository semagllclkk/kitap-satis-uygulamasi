'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

const API = 'http://localhost:3000';

interface Book {
    id: string;
    title: string;
    name?: string;
    price: number;
    stock: number;
    imageUrl?: string;
    description?: string;
    genre?: string;
    author?: { id: string; name: string };
}

interface Author {
    id: string;
    name: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [books, setBooks] = useState<Book[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [addingId, setAddingId] = useState<string | null>(null);
    const [toast, setToast] = useState('');

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/'); return; }
        fetchAuthors();
        fetchBooks();
        fetchCartCount();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
        fetchBooks();
    }, [searchQuery, selectedAuthor, sortBy]);

    useEffect(() => {
        if (currentPage > 1) fetchBooks();
    }, [currentPage]);

    async function fetchAuthors() {
        try {
            const res = await fetch(`${API}/authors`, { cache: 'no-store' });
            const data = await res.json();
            setAuthors(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
    }

    async function fetchBooks() {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            if (searchQuery) params.append('q', searchQuery);
            if (selectedAuthor) params.append('authorId', selectedAuthor);
            params.append('sort', sortBy);
            params.append('page', currentPage.toString());
            params.append('limit', '12');

            // Use advanced search if any filter is active
            const hasFilters = searchQuery || selectedAuthor;

            const endpoint = hasFilters
                ? `${API}/books/search/advanced?${params}`
                : `${API}/books`;

            const res = await fetch(endpoint, { cache: 'no-store' });
            const data = await res.json();

            if (hasFilters && data.data) {
                setBooks(Array.isArray(data.data) ? data.data : []);
                setTotalResults(data.total);
            } else if (Array.isArray(data)) {
                setBooks(data);
                setTotalResults(data.length);
            }
        } catch (err) {
            console.error(err);
            setBooks([]);
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

    const totalPages = Math.ceil(totalResults / 12);

    return (
        <div style={{ minHeight: '100vh' }}>
            <Navbar cartCount={cartCount} />

            <main className="page">
                {/* Header */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                        📖 Kitap Kataloğu
                    </h1>
                    <p style={{ color: '#9d6db0', fontSize: '0.9rem' }}>
                        {totalResults} kitap bulundu
                    </p>
                </div>

                {/* Search Bar */}
                <div style={{ marginBottom: '1.5rem', maxWidth: '500px' }}>
                    <input
                        className="input"
                        placeholder="🔍 Kitap veya yazar ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter Toggle Button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        marginBottom: '1rem',
                        padding: '10px 15px',
                        backgroundColor: showFilters ? '#e91e63' : '#6b4c7a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                    }}
                >
                    {showFilters ? '✖ Filtreleri Kapat' : '⚙ Filtreleri Aç'}
                </button>

                {/* Filters Panel */}
                {showFilters && (
                    <div
                        style={{
                            marginBottom: '1.5rem',
                            padding: '1.5rem',
                            backgroundColor: '#1a0f1e',
                            border: '1px solid #3d1f4a',
                            borderRadius: '8px',
                        }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            {/* Author Filter */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Yazar</label>
                                <select
                                    className="input"
                                    value={selectedAuthor}
                                    onChange={(e) => setSelectedAuthor(e.target.value)}
                                    style={{ width: '100%' }}
                                >
                                    <option value="">Tümü</option>
                                    {authors.map((author) => (
                                        <option key={author.id} value={author.id}>
                                            {author.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Sıralama</label>
                                <select
                                    className="input"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={{ width: '100%' }}
                                >
                                    <option value="newest">En Yeni</option>
                                    <option value="price_asc">Fiyat (Düşük → Yüksek)</option>
                                    <option value="price_desc">Fiyat (Yüksek → Düşük)</option>
                                    <option value="rating">En İyi Puanlı</option>
                                </select>
                            </div>
                        </div>

                        {/* Reset Filters Button */}
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedAuthor('');
                                setSortBy('newest');
                                setCurrentPage(1);
                            }}
                            style={{
                                marginTop: '1rem',
                                padding: '8px 16px',
                                backgroundColor: '#6b4c7a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                            }}
                        >
                            🔄 Filtreleri Sıfırla
                        </button>
                    </div>
                )}

                {/* Books Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#9d6db0' }}>
                        Yükleniyor...
                    </div>
                ) : books.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#9d6db0' }}>
                        Sonuç bulunamadı.
                    </div>
                ) : (
                    <>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                gap: '1.25rem',
                                marginBottom: '2rem',
                            }}
                        >
                            {books.map((book) => (
                                <BookCard
                                    key={book.id}
                                    book={book}
                                    onAdd={() => addToCart(book.id)}
                                    adding={addingId === book.id}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    marginTop: '2rem',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: currentPage === 1 ? '#555' : '#e91e63',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    ← Önceki
                                </button>

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            style={{
                                                padding: '8px 12px',
                                                backgroundColor: currentPage === pageNum ? '#db2777' : '#6b4c7a',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: currentPage === totalPages ? '#555' : '#e91e63',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    Sonraki →
                                </button>
                            </div>
                        )}
                    </>
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
                    }}
                >
                    {toast}
                </div>
            )}
        </div>
    );
}

function BookCard({ book, onAdd, adding }: { book: Book; onAdd: () => void; adding: boolean }) {
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [loadingWishlist, setLoadingWishlist] = useState(false);
    const outOfStock = book.stock === 0;

    useEffect(() => {
        checkWishlist();
    }, [book.id]);

    async function checkWishlist() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(`${API}/wishlist/check/${book.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setIsInWishlist(data.isInWishlist);
        } catch {
            /* ignore */
        }
    }

    async function toggleWishlist() {
        const token = localStorage.getItem('token');
        if (!token) return;

        setLoadingWishlist(true);
        try {
            const method = isInWishlist ? 'DELETE' : 'POST';
            await fetch(`${API}/wishlist/${book.id}`, {
                method,
                headers: { Authorization: `Bearer ${token}` },
            });
            setIsInWishlist(!isInWishlist);
        } catch {
            /* ignore */
        } finally {
            setLoadingWishlist(false);
        }
    }

    return (
        <div
            className="card"
            style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
        >
            {/* Heart button */}
            <button
                onClick={toggleWishlist}
                disabled={loadingWishlist}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(25, 15, 25, 0.8)',
                    border: '1px solid #3d1f4a',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: loadingWishlist ? 'wait' : 'pointer',
                    fontSize: '1.2rem',
                    zIndex: 10,
                }}
            >
                {isInWishlist ? '❤️' : '🤍'}
            </button>

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
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', lineHeight: '1.3' }}>{book.title || book.name}</h3>
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
